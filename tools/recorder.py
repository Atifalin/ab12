#!/usr/bin/env python3
"""Local voice-take recorder for AB12 (dev tool, not shipped in the image).

Serves the repo root on http://127.0.0.1:8765/ (so the app itself is testable)
plus a recorder UI at /rec. Takes are saved as AAC .m4a into
audio/voices/<voice>/<clip>~<id>.m4a via macOS afconvert, and
audio/voices/manifest.json is rebuilt from the directory listing (files are
the source of truth).

Usage:
    python3 tools/recorder.py            # serve + open the browser
    python3 tools/recorder.py --rebuild  # just rebuild audio/voices/manifest.json
"""
import json
import re
import secrets
import subprocess
import sys
import tempfile
import threading
import time
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CLIPS_TXT = ROOT / "tools" / "clips.txt"
VOICES_DIR = ROOT / "audio" / "voices"
RECORDER_HTML = ROOT / "tools" / "recorder.html"
VOICES = {"daddy", "ezdan", "mommy"}
POOLS = {"cheer", "try"}
MAX_BODY = 4 * 1024 * 1024
MAX_CLIP_TAKES = 5
MAX_POOL_TAKES = 30
FILE_RE = re.compile(r"^[A-Za-z0-9_]+~[A-Za-z0-9_-]{4,16}\.m4a$")


def load_clips():
    clips = []
    for line in CLIPS_TXT.read_text().splitlines():
        if not line.strip():
            continue
        name, _, text = line.partition("\t")
        clips.append({"key": name.strip(), "text": text.strip()})
    return clips


ALLOWED_CLIPS = {c["key"] for c in load_clips()} | POOLS


def build_manifest():
    voices = {}
    for v in sorted(VOICES):
        vdir = VOICES_DIR / v
        entries = {}
        if vdir.is_dir():
            for f in sorted(vdir.iterdir()):
                if FILE_RE.match(f.name):
                    clip = f.name.split("~", 1)[0]
                    entries.setdefault(clip, []).append(f.name)
        if entries:
            voices[v] = entries
    return {"version": int(time.time() * 1000), "voices": voices}


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

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/api/clips":
            self._json(200, {"clips": load_clips(), "pools": sorted(POOLS),
                             "manifest": build_manifest()})
        else:
            super().do_GET()

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        if path != "/api/save":
            self._json(404, {"error": "not found"})
            return
        q = self._qs()
        voice, clip = q.get("voice", ""), q.get("clip", "")
        if voice not in VOICES:
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
        vdir.mkdir(parents=True, exist_ok=True)
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
        manifest = write_manifest()
        self._json(200, {"file": take, "manifest": manifest})

    def do_DELETE(self):
        path = self.path.split("?", 1)[0]
        if path != "/api/take":
            self._json(404, {"error": "not found"})
            return
        q = self._qs()
        voice, fname = q.get("voice", ""), q.get("file", "")
        if voice not in VOICES or not FILE_RE.match(fname):
            self._json(400, {"error": "bad path"})
            return
        target = (VOICES_DIR / voice / fname).resolve()
        if target.parent != (VOICES_DIR / voice).resolve() or not target.exists():
            self._json(404, {"error": "not found"})
            return
        target.unlink()
        self._json(200, {"deleted": fname, "manifest": write_manifest()})


def main():
    if "--rebuild" in sys.argv:
        m = write_manifest()
        total = sum(len(v) for v in m["voices"].values())
        print(f"manifest rebuilt: {total} clip keys -> {VOICES_DIR / 'manifest.json'}")
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
