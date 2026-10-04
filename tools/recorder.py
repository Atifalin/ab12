#!/usr/bin/env python3
"""Local voice-take recorder for AB12 (dev tool, not shipped in the image).

Serves the repo root on http://127.0.0.1:8765/ (so the app itself is testable)
plus a recorder UI at /rec. Voice packs are directories audio/voices/<slug>/
with a pack.json label. Takes are saved as AAC .m4a named
<clip>~<id>.m4a via macOS afconvert, and audio/voices/manifest.json is
rebuilt from the directory listing (files are the source of truth).

Usage:
    python3 tools/recorder.py              # serve + open the browser
    python3 tools/recorder.py --rebuild    # just rebuild audio/voices/manifest.json
    python3 tools/recorder.py --retrim [v] # re-trim silence in takes (one pack or all)
"""
import json
import re
import secrets
import struct
import subprocess
import sys
import tempfile
import threading
import time
import wave
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CLIPS_TXT = ROOT / "tools" / "clips.txt"
VOICES_DIR = ROOT / "audio" / "voices"
RECORDER_HTML = ROOT / "tools" / "recorder.html"
POOLS = {"cheer", "try"}
MAX_BODY = 4 * 1024 * 1024
MAX_CLIP_TAKES = 5
MAX_POOL_TAKES = 30
FILE_RE = re.compile(r"^[A-Za-z0-9_]+~[A-Za-z0-9_-]{4,16}\.m4a$")
SLUG_RE = re.compile(r"^[a-z0-9-]{1,20}$")
SILENCE_TH = 10 ** (-45 / 20)   # -45 dBFS
LEAD_PAD_S = 0.040              # 40 ms
TAIL_PAD_S = 0.080              # 80 ms
MIN_KEEP_S = 0.150              # never trim a take below 150 ms


def load_clips():
    clips = []
    for line in CLIPS_TXT.read_text().splitlines():
        if not line.strip():
            continue
        name, _, text = line.partition("\t")
        clips.append({"key": name.strip(), "text": text.strip()})
    return clips


ALLOWED_CLIPS = {c["key"] for c in load_clips()} | POOLS


def slugify(name):
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return s if SLUG_RE.match(s) else None


def pack_slugs():
    if not VOICES_DIR.is_dir():
        return []
    return sorted(d.name for d in VOICES_DIR.iterdir()
                  if d.is_dir() and SLUG_RE.match(d.name) and (d / "pack.json").is_file())


def pack_label(slug):
    try:
        return json.loads((VOICES_DIR / slug / "pack.json").read_text()).get("name", slug)
    except Exception:
        return slug


def build_manifest():
    voices = {}
    for slug in pack_slugs():
        vdir = VOICES_DIR / slug
        entries = {}
        for f in sorted(vdir.iterdir()):
            if FILE_RE.match(f.name):
                clip = f.name.split("~", 1)[0]
                entries.setdefault(clip, []).append(f.name)
        if entries:
            voices[slug] = entries
    packs = {s: {"name": pack_label(s)} for s in pack_slugs()}
    return {"version": int(time.time() * 1000), "packs": packs, "voices": voices}


def write_manifest():
    VOICES_DIR.mkdir(parents=True, exist_ok=True)
    manifest = build_manifest()
    tmp = VOICES_DIR / ".manifest.json.tmp"
    tmp.write_text(json.dumps(manifest, separators=(",", ":")))
    tmp.replace(VOICES_DIR / "manifest.json")
    return manifest


def takes_for(voice, clip):
    vdir = VOICES_DIR / voice
    if not vdir.is_dir():
        return []
    return [f.name for f in vdir.iterdir()
            if FILE_RE.match(f.name) and f.name.split("~", 1)[0] == clip]


def read_wav_mono(path):
    with wave.open(str(path), "rb") as w:
        n_ch, sw, sr, n = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
        raw = w.readframes(n)
    if sw != 2:
        raise ValueError("expected 16-bit WAV")
    vals = struct.unpack(f"<{len(raw) // 2}h", raw)
    return sr, vals[::n_ch]


def write_wav_mono(path, sr, samples):
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(struct.pack(f"<{len(samples)}h", *samples))


def trim_bounds(samples, sr):
    """(first, last) sample indexes of non-silence incl. pads; None if too quiet.

    Silence is judged by 20 ms window RMS at -45 dBFS — a per-sample peak test
    misses quiet noise tails that contain sparse breath/mic bumps above -45.
    """
    n = len(samples)
    win = max(1, int(sr * 0.02))
    th2 = (SILENCE_TH * 32767) ** 2
    cs = [0.0] * (n + 1)
    acc = 0.0
    for i, x in enumerate(samples):
        acc += x * x
        cs[i + 1] = acc

    def window_loud(i):
        j = min(n, i + win)
        return (cs[j] - cs[i]) / (j - i) >= th2

    a = 0
    while a < n and not window_loud(a):
        a += win
    b = n - 1
    while b > a and not window_loud(max(0, b - win)):
        b -= win
    a = max(0, a - int(sr * LEAD_PAD_S))
    b = min(n - 1, b + int(sr * TAIL_PAD_S))
    if b - a + 1 < int(sr * MIN_KEEP_S):
        return None
    return a, b


def retrim(voice=None):
    slugs = [voice] if voice else pack_slugs()
    total = trimmed = skipped = 0
    for slug in slugs:
        vdir = VOICES_DIR / slug
        if not vdir.is_dir():
            print(f"no such pack: {slug}")
            continue
        for f in sorted(vdir.iterdir()):
            if not FILE_RE.match(f.name):
                continue
            total += 1
            with tempfile.TemporaryDirectory() as td:
                wav = Path(td) / "in.wav"
                out = Path(td) / "out.m4a"
                r = subprocess.run(
                    ["afconvert", "-f", "WAVE", "-d", "LEI16@44100", str(f), str(wav)],
                    capture_output=True)
                if r.returncode != 0:
                    print(f"  !! {f.name}: decode failed, skipped")
                    skipped += 1
                    continue
                sr, samples = read_wav_mono(wav)
                before = len(samples) / sr
                bounds = trim_bounds(samples, sr)
                if bounds is None:
                    print(f"  -- {f.name}: too quiet/empty, skipped ({before:.2f}s)")
                    skipped += 1
                    continue
                a, b = bounds
                after = (b - a + 1) / sr
                if b - a + 1 >= len(samples) - int(sr * 0.02):
                    print(f"  == {f.name}: already trimmed ({before:.2f}s)")
                    skipped += 1
                    continue
                write_wav_mono(Path(td) / "trim.wav", sr, samples[a:b + 1])
                r = subprocess.run(
                    ["afconvert", "-f", "m4af", "-d", "aac", "-b", "96000",
                     str(Path(td) / "trim.wav"), str(out)],
                    capture_output=True)
                if r.returncode != 0 or not out.exists():
                    print(f"  !! {f.name}: re-encode failed, skipped")
                    skipped += 1
                    continue
                f.write_bytes(out.read_bytes())
                trimmed += 1
                print(f"  {before:5.2f}s -> {after:5.2f}s  {f.name}")
    write_manifest()
    print(f"retrim done: {trimmed} trimmed, {skipped} skipped, {total} total")


class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # serve the repo root statically, /rec -> tools/recorder.html
        path = path.split("?", 1)[0].split("#", 1)[0]
        if path in ("/rec", "/recorder", "/recorder.html"):
            return str(RECORDER_HTML)
        return str(ROOT / path.lstrip("/"))

    def log_message(self, fmt, *args):
        pass

    def _json(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _qs(self):
        from urllib.parse import urlparse, parse_qs
        return {k: v[0] for k, v in parse_qs(urlparse(self.path).query).items()}

    def _body_json(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if not (0 < length <= 4096):
            return None
        try:
            return json.loads(self.rfile.read(length))
        except Exception:
            return None

    @staticmethod
    def _valid_name(name):
        return (isinstance(name, str) and 0 < len(name) <= 40
                and "/" not in name and "\\" not in name
                and all(ord(c) >= 32 for c in name))

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/api/clips":
            self._json(200, {"clips": load_clips(), "pools": sorted(POOLS),
                             "manifest": build_manifest()})
        else:
            super().do_GET()

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        if path == "/api/save":
            q = self._qs()
            voice, clip = q.get("voice", ""), q.get("clip", "")
            if not SLUG_RE.match(voice) or voice not in pack_slugs():
                self._json(400, {"error": "unknown voice"})
                return
            if clip not in ALLOWED_CLIPS:
                self._json(400, {"error": "unknown clip"})
                return
            limit = MAX_POOL_TAKES if clip in POOLS else MAX_CLIP_TAKES
            if len(takes_for(voice, clip)) >= limit:
                self._json(409, {"error": f"max {limit} takes"})
                return
            try:
                length = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                length = 0
            if length <= 0 or length > MAX_BODY:
                self._json(413, {"error": "bad size"})
                return
            blob = self.rfile.read(length)

            vdir = VOICES_DIR / voice
            take = f"{clip}~{secrets.token_hex(3)}.m4a"
            with tempfile.TemporaryDirectory() as td:
                src = Path(td) / "in.wav"
                dst = Path(td) / take
                src.write_bytes(blob)
                proc = subprocess.run(
                    ["afconvert", "-f", "m4af", "-d", "aac", "-b", "96000",
                     str(src), str(dst)],
                    capture_output=True, timeout=60)
                if proc.returncode != 0 or not dst.exists() or dst.stat().st_size == 0:
                    self._json(422, {"error": "afconvert failed",
                                     "detail": proc.stderr.decode()[-300:]})
                    return
                (vdir / take).write_bytes(dst.read_bytes())
            self._json(200, {"file": take, "manifest": write_manifest()})
            return
        if path == "/api/packs":
            j = self._body_json()
            name = (j or {}).get("name", "")
            if not self._valid_name(name):
                self._json(400, {"error": "bad name"})
                return
            slug = slugify(name)
            if not slug:
                self._json(400, {"error": "cannot derive slug"})
                return
            if (VOICES_DIR / slug).exists():
                self._json(409, {"error": "pack already exists"})
                return
            vdir = VOICES_DIR / slug
            vdir.mkdir(parents=True)
            (vdir / "pack.json").write_text(json.dumps({"name": name}))
            self._json(200, {"slug": slug, "manifest": write_manifest()})
            return
        self._json(404, {"error": "not found"})

    def do_PATCH(self):
        path = self.path.split("?", 1)[0]
        m = re.fullmatch(r"/api/packs/([a-z0-9-]+)", path)
        if not m:
            self._json(404, {"error": "not found"})
            return
        slug = m.group(1)
        if slug not in pack_slugs():
            self._json(404, {"error": "unknown pack"})
            return
        j = self._body_json()
        name = (j or {}).get("name", "")
        if not self._valid_name(name):
            self._json(400, {"error": "bad name"})
            return
        (VOICES_DIR / slug / "pack.json").write_text(json.dumps({"name": name}))
        self._json(200, {"slug": slug, "manifest": write_manifest()})

    def do_DELETE(self):
        path = self.path.split("?", 1)[0]
        m = re.fullmatch(r"/api/packs/([a-z0-9-]+)", path)
        if m:
            slug = m.group(1)
            if slug not in pack_slugs():
                self._json(404, {"error": "unknown pack"})
                return
            vdir = VOICES_DIR / slug
            if any(FILE_RE.match(f.name) for f in vdir.iterdir()):
                self._json(409, {"error": "pack has takes"})
                return
            (vdir / "pack.json").unlink()
            vdir.rmdir()
            self._json(200, {"deleted": slug, "manifest": write_manifest()})
            return
        if path == "/api/take":
            q = self._qs()
            voice, fname = q.get("voice", ""), q.get("file", "")
            if not SLUG_RE.match(voice) or not FILE_RE.match(fname):
                self._json(400, {"error": "bad path"})
                return
            target = (VOICES_DIR / voice / fname).resolve()
            if target.parent != (VOICES_DIR / voice).resolve() or not target.exists():
                self._json(404, {"error": "not found"})
                return
            target.unlink()
            self._json(200, {"deleted": fname, "manifest": write_manifest()})
            return
        self._json(404, {"error": "not found"})


def main():
    if "--rebuild" in sys.argv:
        m = write_manifest()
        total = sum(len(v) for v in m["voices"].values())
        print(f"manifest rebuilt: {total} clip keys, {len(m['packs'])} packs")
        return
    if "--retrim" in sys.argv:
        i = sys.argv.index("--retrim")
        voice = sys.argv[i + 1] if i + 1 < len(sys.argv) and not sys.argv[i + 1].startswith("-") else None
        retrim(voice)
        return

    port = 8765
    srv = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    write_manifest()
    url = f"http://127.0.0.1:{port}/rec"
    print(f"AB12 recorder -> {url}   (app at http://127.0.0.1:{port}/)")
    threading.Timer(0.5, lambda: webbrowser.open(url)).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
