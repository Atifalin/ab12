#!/usr/bin/env python3
"""AB12 Studio — local voice + family tool (dev tool, not shipped in the image).

Serves public/ on http://127.0.0.1:8765/ plus the Studio UI at /studio
(/rec redirects). Run the app itself with `npm run dev`.

Voice packs: public/audio/voices/<slug>/ + pack.json, takes <clip>~<id>.m4a
via afconvert; audio/voices/manifest.json rebuilt from the directory listing.

Family members: public/family/members.json (id/name/title/image, maintained by
this tool) + public/family/img/<id>~<id>.png (sips-resized) +
public/family/audio/<id>/<line>~<id>.m4a takes and tara_<line>.m4a fallbacks
(say -v Tara). public/family/family.json is rebuilt atomically.

Usage:
    python3 tools/studio.py               # serve + open the browser
    python3 tools/studio.py --rebuild     # rebuild both manifests
    python3 tools/studio.py --retrim [v]  # re-trim silence in voice takes
"""
import base64
import os
import binascii
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
import urllib.error
import urllib.request
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CLIPS_TXT = ROOT / "tools" / "clips.txt"
PUBLIC_DIR = ROOT / "public"
VOICES_DIR = PUBLIC_DIR / "audio" / "voices"
FAMILY_DIR = PUBLIC_DIR / "family"
FAMILY_IMG = FAMILY_DIR / "img"
FAMILY_AUDIO = FAMILY_DIR / "audio"
MEMBERS_JSON = FAMILY_DIR / "members.json"
PICS_DIR = PUBLIC_DIR / "pics"
PICS_IMG = PICS_DIR / "img"
PICS_JSON = PICS_DIR / "pics.json"
PUZZLES_DIR = PUBLIC_DIR / "puzzles"
PUZZLES_IMG = PUZZLES_DIR / "img"
PUZZLES_AUDIO = PUZZLES_DIR / "audio"
PUZZLES_ITEMS = PUZZLES_DIR / "items.json"
PUZZLES_JSON = PUZZLES_DIR / "puzzles.json"
RECIPES_DIR = PUBLIC_DIR / "recipes"
RECIPES_IMG = RECIPES_DIR / "img"
RECIPES_AUDIO = RECIPES_DIR / "audio"
RECIPES_ITEMS = RECIPES_DIR / "items.json"
RECIPES_JSON = RECIPES_DIR / "recipes.json"
STUDIO_HTML = ROOT / "tools" / "studio.html"
POOLS = {"cheer", "try"}
MAX_BODY = 8 * 1024 * 1024
MAX_CLIP_TAKES = 5
MAX_POOL_TAKES = 30
FAMILY_LINES = ("name", "peekaboo", "where", "fun")
FAMILY_LINE_TEXT = {
    "name": "{name}!",
    "peekaboo": "Peekaboo! It's {name}!",
    "where": "Where's {name}?",
}
MAX_FUN_TAKES = 10
FILE_RE = re.compile(r"^[A-Za-z0-9_]+~[A-Za-z0-9_-]{4,16}\.m4a$")
IMG_RE = re.compile(r"^[a-z0-9-]+~[A-Za-z0-9_-]{4,16}\.png$")
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


def _same_content(path, data):
    """True if the JSON file on disk equals `data` ignoring its `version` field."""
    try:
        old = json.loads(Path(path).read_text())
        old.pop("version", None)
        new = dict(data)
        new.pop("version", None)
        return old == new
    except Exception:
        return False


def write_manifest():
    VOICES_DIR.mkdir(parents=True, exist_ok=True)
    manifest = build_manifest()
    out = VOICES_DIR / "manifest.json"
    if _same_content(out, manifest):
        try:
            return json.loads(out.read_text())
        except Exception:
            return manifest
    tmp = VOICES_DIR / ".manifest.json.tmp"
    tmp.write_text(json.dumps(manifest, separators=(",", ":")))
    tmp.replace(out)
    return manifest


def takes_for(voice, clip):
    vdir = VOICES_DIR / voice
    if not vdir.is_dir():
        return []
    return [f.name for f in vdir.iterdir()
            if FILE_RE.match(f.name) and f.name.split("~", 1)[0] == clip]


# ---------- custom pictures (emoji/item overrides) ----------

def build_pics_json():
    pics = {}
    if PICS_IMG.is_dir():
        for f in sorted(PICS_IMG.iterdir()):
            if IMG_RE.match(f.name):
                pid = f.name.split("~", 1)[0]
                pics[pid] = f.name
    return {"version": int(time.time() * 1000), "pics": pics}


def write_pics_json():
    PICS_DIR.mkdir(parents=True, exist_ok=True)
    j = build_pics_json()
    if _same_content(PICS_JSON, j):
        try:
            return json.loads(PICS_JSON.read_text())
        except Exception:
            return j
    tmp = PICS_DIR / ".pics.json.tmp"
    tmp.write_text(json.dumps(j, separators=(",", ":")))
    tmp.replace(PICS_JSON)
    return j


def save_item_pic(pid, raw):
    """Decode an uploaded item image via sips -> 512px PNG named <id>~<shortid>.png."""
    PICS_IMG.mkdir(parents=True, exist_ok=True)
    out = PICS_IMG / f"{pid}~{secrets.token_hex(3)}.png"
    with tempfile.TemporaryDirectory() as td:
        src = Path(td) / "in.img"
        src.write_bytes(raw)
        proc = subprocess.run(
            ["sips", "-s", "format", "png", "-Z", "512", str(src), "--out", str(out)],
            capture_output=True, timeout=60)
        if proc.returncode != 0 or not out.exists() or out.stat().st_size == 0:
            return None
    for old in list(PICS_IMG.iterdir()):
        if old.name != out.name and IMG_RE.match(old.name) and old.name.split("~", 1)[0] == pid:
            old.unlink()
    return out.name


# ---------- custom picture puzzles ----------

def load_puzzle_items():
    try:
        return json.loads(PUZZLES_ITEMS.read_text()).get("items", [])
    except Exception:
        return []


def write_puzzle_items(items):
    PUZZLES_DIR.mkdir(parents=True, exist_ok=True)
    tmp = PUZZLES_DIR / ".items.json.tmp"
    tmp.write_text(json.dumps({"items": items}, separators=(",", ":")))
    tmp.replace(PUZZLES_ITEMS)


def puzzle_takes(pid):
    adir = PUZZLES_AUDIO / pid
    if not adir.is_dir():
        return []
    return sorted(f.name for f in adir.iterdir()
                  if FILE_RE.match(f.name) and f.name.startswith("done~"))


def build_puzzles_json():
    puzzles = []
    for it in load_puzzle_items():
        pid = it["id"]
        puzzles.append({
            "id": pid,
            "title": it["title"],
            "image": it.get("image"),
            "takes": puzzle_takes(pid),
        })
    return {"version": int(time.time() * 1000), "puzzles": puzzles}


def write_puzzles_json():
    PUZZLES_DIR.mkdir(parents=True, exist_ok=True)
    j = build_puzzles_json()
    if _same_content(PUZZLES_JSON, j):
        try:
            return json.loads(PUZZLES_JSON.read_text())
        except Exception:
            return j
    tmp = PUZZLES_DIR / ".puzzles.json.tmp"
    tmp.write_text(json.dumps(j, separators=(",", ":")))
    tmp.replace(PUZZLES_JSON)
    return j


def puzzles_state():
    return {"items": load_puzzle_items(), "puzzles": write_puzzles_json()}


def save_scaled_png(folder, prefix, raw, max_px=640):
    folder.mkdir(parents=True, exist_ok=True)
    out = folder / f"{prefix}~{secrets.token_hex(3)}.png"
    with tempfile.TemporaryDirectory() as td:
        src = Path(td) / "in.img"
        src.write_bytes(raw)
        proc = subprocess.run(
            ["sips", "-s", "format", "png", "-Z", str(max_px), str(src), "--out", str(out)],
            capture_output=True, timeout=60)
        if proc.returncode != 0 or not out.exists() or out.stat().st_size == 0:
            return None
    return out.name


def gen_tara_text(adir, fname, text):
    adir.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as td:
        wav = Path(td) / "t.wav"
        m4a = Path(td) / fname
        r = subprocess.run(["say", "-v", "Tara", "-o", str(wav),
                            "--data-format=LEI16@44100", text],
                           capture_output=True)
        if r.returncode == 0 and wav.exists() and afconvert_m4a(wav, m4a):
            (adir / fname).write_bytes(m4a.read_bytes())


# ---------- custom build & go recipes ----------

def load_recipe_items():
    try:
        return json.loads(RECIPES_ITEMS.read_text()).get("items", [])
    except Exception:
        return []


def write_recipe_items(items):
    RECIPES_DIR.mkdir(parents=True, exist_ok=True)
    tmp = RECIPES_DIR / ".items.json.tmp"
    tmp.write_text(json.dumps({"items": items}, separators=(",", ":")))
    tmp.replace(RECIPES_ITEMS)


def recipe_lines(rid):
    adir = RECIPES_AUDIO / rid
    lines = {"name": [], "go": []}
    if adir.is_dir():
        for f in sorted(adir.iterdir()):
            if FILE_RE.match(f.name):
                k = f.name.split("~", 1)[0]
                if k in lines:
                    lines[k].append(f.name)
    return {k: v for k, v in lines.items() if v}


def build_recipes_json():
    recipes = []
    for it in load_recipe_items():
        rid = it["id"]
        recipes.append({
            "id": rid,
            "name": it["name"],
            "go": it.get("go", f"Go {it['name']}!"),
            "env": it.get("env", "road"),
            "sfx": it.get("sfx", "vroom"),
            "image": it.get("image"),
            "parts": it.get("parts") or [],
            "lines": recipe_lines(rid),
        })
    return {"version": int(time.time() * 1000), "recipes": recipes}


def write_recipes_json():
    RECIPES_DIR.mkdir(parents=True, exist_ok=True)
    j = build_recipes_json()
    if _same_content(RECIPES_JSON, j):
        try:
            return json.loads(RECIPES_JSON.read_text())
        except Exception:
            return j
    tmp = RECIPES_DIR / ".recipes.json.tmp"
    tmp.write_text(json.dumps(j, separators=(",", ":")))
    tmp.replace(RECIPES_JSON)
    return j


def recipes_state():
    return {"items": load_recipe_items(), "recipes": write_recipes_json()}


# ---------- family members ----------

def load_members():
    try:
        return json.loads(MEMBERS_JSON.read_text()).get("members", [])
    except Exception:
        return []


def write_members(members):
    FAMILY_DIR.mkdir(parents=True, exist_ok=True)
    tmp = FAMILY_DIR / ".members.json.tmp"
    tmp.write_text(json.dumps({"members": members}, separators=(",", ":")))
    tmp.replace(MEMBERS_JSON)


def member_lines(mid):
    adir = FAMILY_AUDIO / mid
    lines = {k: [] for k in FAMILY_LINES}
    if adir.is_dir():
        for f in sorted(adir.iterdir()):
            if FILE_RE.match(f.name):
                lines.setdefault(f.name.split("~", 1)[0], []).append(f.name)
    return {k: v for k, v in lines.items() if v}


def build_family_json():
    members = []
    for m in load_members():
        mid = m["id"]
        adir = FAMILY_AUDIO / mid
        tara = {}
        if adir.is_dir():
            for f in adir.iterdir():
                if re.fullmatch(r"tara_[a-z]+\.m4a", f.name):
                    tara[f.name] = True
        entry = {"id": mid, "name": m["name"], "title": m.get("title", ""),
                 "image": m.get("image"), "lines": member_lines(mid)}
        members.append(entry)
    return {"version": int(time.time() * 1000), "members": members}


def write_family_json():
    FAMILY_DIR.mkdir(parents=True, exist_ok=True)
    j = build_family_json()
    out = FAMILY_DIR / "family.json"
    if _same_content(out, j):
        try:
            return json.loads(out.read_text())
        except Exception:
            return j
    tmp = FAMILY_DIR / ".family.json.tmp"
    tmp.write_text(json.dumps(j, separators=(",", ":")))
    tmp.replace(out)
    return j


def family_state():
    # writing on every call keeps family.json in lock-step with the API state
    return {"members": load_members(), "family": write_family_json()}


def afconvert_m4a(src, dst):
    proc = subprocess.run(
        ["afconvert", "-f", "m4af", "-d", "aac", "-b", "96000", str(src), str(dst)],
        capture_output=True, timeout=60)
    return proc.returncode == 0 and Path(dst).exists() and Path(dst).stat().st_size > 0


def gen_tara(mid, name):
    """(Re)generate tara_<line>.m4a fallbacks for name/peekaboo/where."""
    adir = FAMILY_AUDIO / mid
    adir.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as td:
        for line, tpl in FAMILY_LINE_TEXT.items():
            wav = Path(td) / f"{line}.wav"
            m4a = Path(td) / f"tara_{line}.m4a"
            # Tara can't render to the default aiff property set — ask for PCM WAV
            r = subprocess.run(["say", "-v", "Tara", "-o", str(wav),
                                "--data-format=LEI16@44100", tpl.format(name=name)],
                               capture_output=True)
            if r.returncode != 0 or not wav.exists():
                continue
            if afconvert_m4a(wav, m4a):
                (adir / f"tara_{line}.m4a").write_bytes(m4a.read_bytes())


def save_member_image(mid, raw):
    """Decode an uploaded image via sips -> 512px PNG named <id>~<shortid>.png."""
    FAMILY_IMG.mkdir(parents=True, exist_ok=True)
    out = FAMILY_IMG / f"{mid}~{secrets.token_hex(3)}.png"
    with tempfile.TemporaryDirectory() as td:
        src = Path(td) / "in.img"
        src.write_bytes(raw)
        proc = subprocess.run(
            ["sips", "-s", "format", "png", "-Z", "512", str(src), "--out", str(out)],
            capture_output=True, timeout=60)
        if proc.returncode != 0 or not out.exists() or out.stat().st_size == 0:
            return None
    return out.name


def member_files_delete(member):
    adir = FAMILY_AUDIO / member["id"]
    if adir.is_dir():
        for f in adir.iterdir():
            f.unlink()
        adir.rmdir()
    if member.get("image"):
        p = FAMILY_IMG / member["image"]
        if IMG_RE.match(p.name) and p.exists():
            p.unlink()


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
        # serve public/ statically, /src/ for shared SVG art modules, /studio -> tools/studio.html
        path = path.split("?", 1)[0].split("#", 1)[0]
        if path in ("/studio", "/studio.html"):
            return str(STUDIO_HTML)
        if path.startswith("/src/"):
            return str(ROOT / path.lstrip("/"))
        return str(PUBLIC_DIR / path.lstrip("/"))

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

    def _body_json(self, max_len=MAX_BODY):
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if not (0 < length <= max_len):
            return None
        try:
            return json.loads(self.rfile.read(length))
        except Exception:
            return None

    def _raw_body(self, max_len=MAX_BODY):
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if not (0 < length <= max_len):
            return None
        return self.rfile.read(length)

    @staticmethod
    def _valid_name(name):
        return (isinstance(name, str) and 0 < len(name) <= 40
                and "/" not in name and "\\" not in name
                and all(ord(c) >= 32 for c in name))

    @staticmethod
    def _find_member(mid):
        members = load_members()
        for i, m in enumerate(members):
            if m.get("id") == mid:
                return members, i, m
        return members, -1, None

    def _member_payload(self, require_image=False):
        j = self._body_json()
        if j is None:
            return None, "bad json"
        name = j.get("name")
        title = j.get("title", "")
        if not self._valid_name(name):
            return None, "bad name"
        if not isinstance(title, str) or len(title) > 60 or "/" in title or "\\" in title:
            return None, "bad title"
        raw_img = None
        img64 = j.get("image")
        if img64:
            try:
                raw_img = base64.b64decode(img64, validate=True)
            except (binascii.Error, ValueError):
                return None, "bad image data"
            if not (0 < len(raw_img) <= MAX_BODY):
                return None, "bad image size"
        elif require_image:
            return None, "image required"
        return {"name": name.strip(), "title": title.strip(), "image": raw_img}, None

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/api/publish/pending":
            self._json(200, pub_pending())
            return
        if path == "/api/publish/status":
            self._json(200, pub)
            return
        if path == "/api/clips":
            self._json(200, {"clips": load_clips(), "pools": sorted(POOLS),
                             "manifest": build_manifest()})
        elif path == "/api/family":
            self._json(200, family_state())
        elif path == "/api/pics":
            self._json(200, write_pics_json())
        elif path == "/api/puzzles":
            self._json(200, puzzles_state())
        elif path == "/api/recipes":
            self._json(200, recipes_state())
        elif path in ("/rec", "/recorder", "/recorder.html"):
            self.send_response(302)
            self.send_header("Location", "/studio")
            self.end_headers()
        else:
            super().do_GET()

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        if path == "/api/publish":
            if not csrf_ok(self):
                self._json(403, {"error": "forbidden"})
                return
            if not publish_start():
                self._json(409, {"error": "already running"})
                return
            self._json(200, {"started": True})
            return
        if path == "/api/shutdown":
            if not csrf_ok(self):
                self._json(403, {"error": "forbidden"})
                return
            self._json(200, {"bye": True})
            threading.Thread(target=lambda: (time.sleep(0.3), self.server.shutdown()),
                             daemon=True).start()
            return
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
            blob = self._raw_body()
            if blob is None:
                self._json(413, {"error": "bad size"})
                return
            vdir = VOICES_DIR / voice
            take = f"{clip}~{secrets.token_hex(3)}.m4a"
            with tempfile.TemporaryDirectory() as td:
                src = Path(td) / "in.wav"
                dst = Path(td) / take
                src.write_bytes(blob)
                if not afconvert_m4a(src, dst):
                    self._json(422, {"error": "afconvert failed"})
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
        if path == "/api/family":
            data, err = self._member_payload()
            if err:
                self._json(400, {"error": err})
                return
            slug = slugify(data["name"])
            if not slug:
                self._json(400, {"error": "cannot derive id"})
                return
            members = load_members()
            base, n = slug, 2
            while any(m["id"] == slug for m in members):
                slug = f"{base}-{n}"
                n += 1
            image = None
            if data["image"]:
                image = save_member_image(slug, data["image"])
                if not image:
                    self._json(422, {"error": "sips could not decode image"})
                    return
            member = {"id": slug, "name": data["name"], "title": data["title"], "image": image}
            members.append(member)
            write_members(members)
            gen_tara(slug, data["name"])
            self._json(200, {"member": member, **family_state()})
            return
        m = re.fullmatch(r"/api/family/([a-z0-9-]+)/lines/([a-z]+)", path)
        if m:
            mid, line = m.group(1), m.group(2)
            members, i, member = self._find_member(mid)
            if member is None:
                self._json(404, {"error": "unknown member"})
                return
            if line not in FAMILY_LINES:
                self._json(400, {"error": "unknown line"})
                return
            limit = MAX_FUN_TAKES if line == "fun" else MAX_CLIP_TAKES
            takes = member_lines(mid).get(line, [])
            if len(takes) >= limit:
                self._json(409, {"error": f"max {limit} takes"})
                return
            blob = self._raw_body()
            if blob is None:
                self._json(413, {"error": "bad size"})
                return
            adir = FAMILY_AUDIO / mid
            adir.mkdir(parents=True, exist_ok=True)
            take = f"{line}~{secrets.token_hex(3)}.m4a"
            with tempfile.TemporaryDirectory() as td:
                src = Path(td) / "in.wav"
                dst = Path(td) / take
                src.write_bytes(blob)
                if not afconvert_m4a(src, dst):
                    self._json(422, {"error": "afconvert failed"})
                    return
                (adir / take).write_bytes(dst.read_bytes())
            self._json(200, {"file": take, **family_state()})
            return
        m = re.fullmatch(r"/api/pics/([a-z0-9-]+)", path)
        if m:
            pid = m.group(1)
            j = self._body_json()
            img64 = (j or {}).get("image")
            if not img64:
                self._json(400, {"error": "image required"})
                return
            try:
                raw_img = base64.b64decode(img64, validate=True)
            except (binascii.Error, ValueError):
                self._json(400, {"error": "bad image data"})
                return
            if not (0 < len(raw_img) <= MAX_BODY):
                self._json(400, {"error": "bad image size"})
                return
            fname = save_item_pic(pid, raw_img)
            if not fname:
                self._json(422, {"error": "sips could not decode image"})
                return
            self._json(200, {"id": pid, "file": fname, **write_pics_json()})
            return
        if path == "/api/puzzles":
            j = self._body_json()
            title = ((j or {}).get("title") or "").strip()
            img64 = (j or {}).get("image")
            if not self._valid_name(title) or not img64:
                self._json(400, {"error": "title and image required"})
                return
            try:
                raw_img = base64.b64decode(img64, validate=True)
            except (binascii.Error, ValueError):
                self._json(400, {"error": "bad image data"})
                return
            if not (0 < len(raw_img) <= MAX_BODY):
                self._json(400, {"error": "bad image size"})
                return
            slug = slugify(title) or "puzzle"
            items = load_puzzle_items()
            base, n = slug, 2
            while any(x["id"] == slug for x in items):
                slug = f"{base}-{n}"
                n += 1
            image = save_scaled_png(PUZZLES_IMG, slug, raw_img, 640)
            if not image:
                self._json(422, {"error": "sips could not decode image"})
                return
            item = {"id": slug, "title": title, "image": image}
            items.append(item)
            write_puzzle_items(items)
            gen_tara_text(PUZZLES_AUDIO / slug, "tara_done.m4a", f"Hooray! You made {title}!")
            self._json(200, {"item": item, **puzzles_state()})
            return
        m = re.fullmatch(r"/api/puzzles/([a-z0-9-]+)/takes", path)
        if m:
            pid = m.group(1)
            items = load_puzzle_items()
            if not any(x["id"] == pid for x in items):
                self._json(404, {"error": "unknown puzzle"})
                return
            if len(puzzle_takes(pid)) >= MAX_CLIP_TAKES:
                self._json(409, {"error": f"max {MAX_CLIP_TAKES} takes"})
                return
            blob = self._raw_body()
            if blob is None:
                self._json(413, {"error": "bad size"})
                return
            adir = PUZZLES_AUDIO / pid
            adir.mkdir(parents=True, exist_ok=True)
            take = f"done~{secrets.token_hex(3)}.m4a"
            with tempfile.TemporaryDirectory() as td:
                src = Path(td) / "in.wav"
                dst = Path(td) / take
                src.write_bytes(blob)
                if not afconvert_m4a(src, dst):
                    self._json(422, {"error": "afconvert failed"})
                    return
                (adir / take).write_bytes(dst.read_bytes())
            self._json(200, {"file": take, **puzzles_state()})
            return
        if path == "/api/recipes":
            j = self._body_json()
            name = ((j or {}).get("name") or "").strip()
            go_text = ((j or {}).get("go") or f"Go {name}!").strip()
            env_name = ((j or {}).get("env") or "road").strip()
            sfx_name = ((j or {}).get("sfx") or "vroom").strip()
            img64 = (j or {}).get("image")
            parts64 = (j or {}).get("parts") or []
            if not self._valid_name(name) or len(go_text) > 80:
                self._json(400, {"error": "bad name or launch text"})
                return
            if not img64 and len(parts64) != 3:
                self._json(400, {"error": "upload 1 full image or 3 part images"})
                return
            slug = slugify(name) or "vehicle"
            items = load_recipe_items()
            base, n = slug, 2
            while any(x["id"] == slug for x in items):
                slug = f"{base}-{n}"
                n += 1
            image = None
            if img64:
                try:
                    raw = base64.b64decode(img64, validate=True)
                except (binascii.Error, ValueError):
                    self._json(400, {"error": "bad image data"})
                    return
                image = save_scaled_png(RECIPES_IMG, slug, raw, 512)
                if not image:
                    self._json(422, {"error": "sips could not decode image"})
                    return
            part_files = []
            for pi, p64 in enumerate(parts64[:3]):
                if not p64:
                    continue
                try:
                    praw = base64.b64decode(p64, validate=True)
                except (binascii.Error, ValueError):
                    self._json(400, {"error": "bad part image"})
                    return
                pf = save_scaled_png(RECIPES_IMG, f"{slug}-p{pi}", praw, 512)
                if pf:
                    part_files.append(pf)
            item = {
                "id": slug, "name": name, "go": go_text,
                "env": env_name if env_name in ("road", "space", "sky", "sea", "track", "hills") else "road",
                "sfx": sfx_name if sfx_name in ("vroom", "siren", "rocket", "choo", "bubbles") else "vroom",
                "image": image, "parts": part_files,
            }
            items.append(item)
            write_recipe_items(items)
            gen_tara_text(RECIPES_AUDIO / slug, "tara_name.m4a", f"{name}!")
            gen_tara_text(RECIPES_AUDIO / slug, "tara_go.m4a", go_text)
            self._json(200, {"item": item, **recipes_state()})
            return
        m = re.fullmatch(r"/api/recipes/([a-z0-9-]+)/lines/(name|go)", path)
        if m:
            rid, line = m.group(1), m.group(2)
            items = load_recipe_items()
            if not any(x["id"] == rid for x in items):
                self._json(404, {"error": "unknown recipe"})
                return
            if len(recipe_lines(rid).get(line, [])) >= MAX_CLIP_TAKES:
                self._json(409, {"error": f"max {MAX_CLIP_TAKES} takes"})
                return
            blob = self._raw_body()
            if blob is None:
                self._json(413, {"error": "bad size"})
                return
            adir = RECIPES_AUDIO / rid
            adir.mkdir(parents=True, exist_ok=True)
            take = f"{line}~{secrets.token_hex(3)}.m4a"
            with tempfile.TemporaryDirectory() as td:
                src = Path(td) / "in.wav"
                dst = Path(td) / take
                src.write_bytes(blob)
                if not afconvert_m4a(src, dst):
                    self._json(422, {"error": "afconvert failed"})
                    return
                (adir / take).write_bytes(dst.read_bytes())
            self._json(200, {"file": take, **recipes_state()})
            return
        self._json(404, {"error": "not found"})

    def do_PATCH(self):
        path = self.path.split("?", 1)[0]
        m = re.fullmatch(r"/api/packs/([a-z0-9-]+)", path)
        if m:
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
            return
        m = re.fullmatch(r"/api/family/([a-z0-9-]+)", path)
        if m:
            mid = m.group(1)
            members, i, member = self._find_member(mid)
            if member is None:
                self._json(404, {"error": "unknown member"})
                return
            data, err = self._member_payload()
            if err:
                self._json(400, {"error": err})
                return
            renamed = data["name"] != member["name"]
            member["name"] = data["name"]
            member["title"] = data["title"]
            if data["image"]:
                image = save_member_image(mid, data["image"])
                if not image:
                    self._json(422, {"error": "sips could not decode image"})
                    return
                old = member.get("image")
                if old and old != image:
                    p = FAMILY_IMG / old
                    if IMG_RE.match(p.name) and p.exists():
                        p.unlink()
                member["image"] = image
            write_members(members)
            if renamed:
                gen_tara(mid, data["name"])
            self._json(200, {"member": member, **family_state()})
            return
        self._json(404, {"error": "not found"})

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
        m = re.fullmatch(r"/api/family/([a-z0-9-]+)/lines/([a-z]+)/(.+)", path)
        if m:
            mid, line, fname = m.group(1), m.group(2), m.group(3)
            members, i, member = self._find_member(mid)
            if member is None:
                self._json(404, {"error": "unknown member"})
                return
            if line not in FAMILY_LINES or not FILE_RE.match(fname) \
                    or not fname.startswith(line + "~"):
                self._json(400, {"error": "bad path"})
                return
            target = (FAMILY_AUDIO / mid / fname).resolve()
            if target.parent != (FAMILY_AUDIO / mid).resolve() or not target.exists():
                self._json(404, {"error": "not found"})
                return
            target.unlink()
            self._json(200, {"deleted": fname, **family_state()})
            return
        m = re.fullmatch(r"/api/family/([a-z0-9-]+)", path)
        if m:
            mid = m.group(1)
            members, i, member = self._find_member(mid)
            if member is None:
                self._json(404, {"error": "unknown member"})
                return
            member_files_delete(member)
            members.pop(i)
            write_members(members)
            self._json(200, {"deleted": mid, **family_state()})
            return
        m = re.fullmatch(r"/api/pics/([a-z0-9-]+)", path)
        if m:
            pid = m.group(1)
            if PICS_IMG.is_dir():
                for f in list(PICS_IMG.iterdir()):
                    if IMG_RE.match(f.name) and f.name.split("~", 1)[0] == pid:
                        f.unlink()
            self._json(200, {"deleted": pid, **write_pics_json()})
            return
        m = re.fullmatch(r"/api/puzzles/([a-z0-9-]+)/takes/(.+)", path)
        if m:
            pid, fname = m.group(1), m.group(2)
            if not FILE_RE.match(fname) or not fname.startswith("done~"):
                self._json(400, {"error": "bad path"})
                return
            target = (PUZZLES_AUDIO / pid / fname).resolve()
            if target.parent == (PUZZLES_AUDIO / pid).resolve() and target.exists():
                target.unlink()
            self._json(200, {"deleted": fname, **puzzles_state()})
            return
        m = re.fullmatch(r"/api/puzzles/([a-z0-9-]+)", path)
        if m:
            pid = m.group(1)
            items = load_puzzle_items()
            kept = [x for x in items if x["id"] != pid]
            if len(kept) == len(items):
                self._json(404, {"error": "not found"})
                return
            for x in items:
                if x["id"] == pid and x.get("image"):
                    p = PUZZLES_IMG / x["image"]
                    if IMG_RE.match(p.name) and p.exists():
                        p.unlink()
            adir = PUZZLES_AUDIO / pid
            if adir.is_dir():
                for f in adir.iterdir():
                    f.unlink()
                adir.rmdir()
            write_puzzle_items(kept)
            self._json(200, {"deleted": pid, **puzzles_state()})
            return
        m = re.fullmatch(r"/api/recipes/([a-z0-9-]+)/lines/(name|go)/(.+)", path)
        if m:
            rid, line, fname = m.group(1), m.group(2), m.group(3)
            if not FILE_RE.match(fname) or not fname.startswith(line + "~"):
                self._json(400, {"error": "bad path"})
                return
            target = (RECIPES_AUDIO / rid / fname).resolve()
            if target.parent == (RECIPES_AUDIO / rid).resolve() and target.exists():
                target.unlink()
            self._json(200, {"deleted": fname, **recipes_state()})
            return
        m = re.fullmatch(r"/api/recipes/([a-z0-9-]+)", path)
        if m:
            rid = m.group(1)
            items = load_recipe_items()
            kept = [x for x in items if x["id"] != rid]
            if len(kept) == len(items):
                self._json(404, {"error": "not found"})
                return
            for x in items:
                if x["id"] == rid:
                    for fn in ([x.get("image")] + (x.get("parts") or [])):
                        if fn:
                            p = RECIPES_IMG / fn
                            if IMG_RE.match(p.name) and p.exists():
                                p.unlink()
            adir = RECIPES_AUDIO / rid
            if adir.is_dir():
                for f in adir.iterdir():
                    f.unlink()
                adir.rmdir()
            write_recipe_items(kept)
            self._json(200, {"deleted": rid, **recipes_state()})
            return
        self._json(404, {"error": "not found"})


# ---------- publish (push to live) ----------
PUBLISH_PATHS = ["public/audio/voices", "public/family", "public/pics", "public/puzzles", "public/recipes"]
PUB_STEPS = ["Check changes", "Save (commit)", "Sync", "Upload (push)",
             "Build", "Go live", "Done"]
DRYRUN = os.environ.get("STUDIO_PUBLISH_DRYRUN") == "1"
pub = {"state": "idle", "steps": [], "log": [], "sha": None, "runUrl": None,
       "startedAt": None, "finishedAt": None, "message": None}
pub_lock = threading.Lock()


def pub_log(line):
    line = re.sub(r"https://[^@\s]*@", "https://", line.rstrip())
    pub["log"].append(f"[{time.strftime('%H:%M:%S')}] {line}")
    if len(pub["log"]) > 400:
        pub["log"] = pub["log"][-400:]


def pub_pending():
    """List changed files under the publish paths and count them by kind."""
    out = subprocess.run(["git", "status", "--porcelain", "-uall", "--"] + PUBLISH_PATHS,
                         cwd=ROOT, capture_output=True, text=True)
    files, voices, family, pics, puzzles, recipes = [], 0, 0, 0, 0, 0
    for line in out.stdout.splitlines():
        if not line.strip():
            continue
        f = line[3:]
        files.append(f)
        if "/audio/voices/" in f or f.startswith("audio/voices/"):
            voices += 1
        elif "/family/" in f or f.startswith("family/"):
            family += 1
        elif "/pics/" in f or f.startswith("pics/"):
            pics += 1
        elif "/puzzles/" in f or f.startswith("puzzles/"):
            puzzles += 1
        elif "/recipes/" in f or f.startswith("recipes/"):
            recipes += 1
    return {"files": files, "voices": voices, "family": family, "pics": pics,
            "puzzles": puzzles, "recipes": recipes}


def pub_run(cmd, step_i, check=True, env=None):
    pub_log("$ " + " ".join(cmd))
    p = subprocess.Popen(cmd, cwd=ROOT, stdout=subprocess.PIPE,
                         stderr=subprocess.STDOUT, text=True, env=env)
    for line in p.stdout:
        pub_log(line)
    p.wait()
    if check and p.returncode != 0:
        raise RuntimeError(f"command failed ({p.returncode})")
    return p.returncode


def pub_http_json(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {"User-Agent": "ab12-studio"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read()), r.status
    except urllib.error.HTTPError as e:
        return None, e.code
    except Exception as e:
        return None, str(e)


def pub_http_text(url):
    req = urllib.request.Request(url, headers={"User-Agent": "ab12-studio",
                                               "Cache-Control": "no-store"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.read().decode("utf-8", "replace"), r.status
    except Exception as e:
        return None, e


def publish_worker():
    dry = DRYRUN
    step_i = -1

    def step(name, i):
        nonlocal step_i
        step_i = i
        pub["steps"][i]["status"] = "running"
        pub_log(f"── {name}")

    def done_step(i, skipped=False):
        pub["steps"][i]["status"] = "skipped" if skipped else "done"

    try:
        # 1. check changes
        step(PUB_STEPS[0], 0)
        pend = pub_pending()
        subprocess.run(["git", "fetch", "-q", "origin", "main"], cwd=ROOT, capture_output=True)
        ahead = subprocess.run(["git", "rev-list", "--count", "origin/main..HEAD"], cwd=ROOT,
                               capture_output=True, text=True).stdout.strip()
        unpushed = ahead not in ("", "0")
        if not pend["files"] and not unpushed:
            pub["message"] = "Nothing new to publish"
            pub["state"] = "done"
            done_step(0)
            for i in range(1, 6):
                pub["steps"][i]["status"] = "skipped"
            pub["steps"][6]["status"] = "done"
            pub["finishedAt"] = time.time()
            pub_log("nothing changed — already live")
            return
        pub_log(f"{len(pend['files'])} file(s) to publish "
                f"({pend['voices']} voice, {pend['family']} family, {pend.get('pics', 0)} pic)")
        done_step(0)

        if dry:
            for i, name in enumerate(PUB_STEPS[1:], start=1):
                step(name, i)
                time.sleep(1.2)
                pub_log(f"(dry-run) {name} — simulated ok")
                done_step(i)
            pub["message"] = "Dry-run complete — nothing was actually published"
            pub["state"] = "done"
            pub["finishedAt"] = time.time()
            return

        # 2. commit (skipped when only an earlier, unpushed commit is waiting)
        step(PUB_STEPS[1], 1)
        if pend["files"]:
            n = len(pend["files"])
            pub_run(["git", "add", "-A", "--"] + PUBLISH_PATHS, 1)
            pub_run(["git", "commit", "-m",
                     f"Studio: update voices and family ({n} files)", "--"] + PUBLISH_PATHS, 1)
        else:
            pub_log(f"{ahead} earlier commit(s) not uploaded yet — sending those")
        sha = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT,
                             capture_output=True, text=True).stdout.strip()
        pub["sha"] = sha
        pub_log(f"commit {sha[:7]}")
        done_step(1, skipped=not pend["files"])

        # 3. sync
        step(PUB_STEPS[2], 2)
        pub_run(["git", "fetch", "origin", "main"], 2)
        behind = subprocess.run(
            ["git", "rev-list", "--count", "HEAD..origin/main"], cwd=ROOT,
            capture_output=True, text=True).stdout.strip()
        if behind != "0":
            pub_log(f"behind by {behind} — rebasing")
            rc = pub_run(["git", "pull", "--rebase", "--autostash", "origin", "main"], 2, check=False)
            if rc != 0:
                subprocess.run(["git", "rebase", "--abort"], cwd=ROOT, capture_output=True)
                raise RuntimeError("rebase failed — conflicts; local commit kept, resolve manually")
            sha = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT,
                                 capture_output=True, text=True).stdout.strip()
            pub["sha"] = sha
            pub_log(f"rebased -> {sha[:7]}")
        else:
            pub_log("already up to date")
        done_step(2)

        # 4. push
        step(PUB_STEPS[3], 3)
        pub_run(["git", "push", "origin", "main"], 3)
        done_step(3)

        # 5. build (GitHub Actions)
        step(PUB_STEPS[4], 4)
        url = ("https://api.github.com/repos/Atifalin/ab12/actions/runs"
               f"?head_sha={sha}")
        t0 = time.time()
        backoff = 10
        while time.time() - t0 < 600:
            j, code = pub_http_json(url)
            if code == 403:
                pub_log("github rate-limited — slowing down")
                backoff = min(60, backoff * 2)
            elif j and j.get("workflow_runs"):
                run = j["workflow_runs"][0]
                pub["runUrl"] = run.get("html_url")
                status, concl = run.get("status"), run.get("conclusion")
                pub_log(f"actions: {status} {concl or ''}".strip())
                if status == "completed":
                    if concl == "success":
                        pub_log("build ok")
                        break
                    raise RuntimeError(f"GitHub Actions {concl} — {pub['runUrl']}")
            time.sleep(backoff)
        else:
            raise RuntimeError("timed out waiting for the build (10 min)")
        done_step(4)

        # 6. go live
        step(PUB_STEPS[5], 5)
        local_v = (VOICES_DIR / "manifest.json").read_text()
        local_f = (FAMILY_DIR / "family.json").read_text()
        local_p = PICS_JSON.read_text() if PICS_JSON.exists() else None
        t0 = time.time()
        while time.time() - t0 < 360:
            rv, _ = pub_http_text(f"https://ab12.ezypath.in/audio/voices/manifest.json?v={time.time()}")
            rf, _ = pub_http_text(f"https://ab12.ezypath.in/family/family.json?v={time.time()}")
            rp, _ = pub_http_text(f"https://ab12.ezypath.in/pics/pics.json?v={time.time()}")
            pub_log("polling live…")
            if rv == local_v and rf == local_f and (local_p is None or rp == local_p):
                pub_log("live content matches the commit")
                break
            time.sleep(10)
        else:
            raise RuntimeError("timed out waiting for the live site (6 min)")
        done_step(5)

        pub["steps"][6]["status"] = "done"
        pub["state"] = "done"
        pub["message"] = f"Live! took {int(time.time() - pub['startedAt'])}s"
        pub["finishedAt"] = time.time()
    except Exception as e:
        pub["state"] = "error"
        pub["message"] = str(e)
        pub["finishedAt"] = time.time()
        pub_log("ERROR: " + str(e))
        if 0 <= step_i < 7:
            pub["steps"][step_i]["status"] = "error"


def publish_start():
    with pub_lock:
        if pub["state"] == "running":
            return False
        pub.update({"state": "running", "sha": None, "runUrl": None,
                    "startedAt": time.time(), "finishedAt": None, "message": None,
                    "log": [],
                    "steps": [{"name": n, "status": "pending"} for n in PUB_STEPS]})
    threading.Thread(target=publish_worker, daemon=True).start()
    return True


def csrf_ok(handler):
    if handler.headers.get("X-Studio") != "1":
        return False
    base = handler.headers.get("Origin") or handler.headers.get("Referer") or ""
    return base.startswith("http://127.0.0.1:8765") or base.startswith("http://localhost:8765")


def main():
    if "--rebuild" in sys.argv:
        m = write_manifest()
        total = sum(len(v) for v in m["voices"].values())
        f = write_family_json()
        p = write_pics_json()
        print(f"voice manifest rebuilt: {total} clip keys, {len(m['packs'])} packs; "
              f"family.json: {len(f['members'])} members; pics.json: {len(p['pics'])} pics")
        return
    if "--retrim" in sys.argv:
        i = sys.argv.index("--retrim")
        voice = sys.argv[i + 1] if i + 1 < len(sys.argv) and not sys.argv[i + 1].startswith("-") else None
        retrim(voice)
        return

    port = 8765
    srv = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    write_manifest()
    write_family_json()
    write_pics_json()
    write_puzzles_json()
    write_recipes_json()
    url = f"http://127.0.0.1:{port}/studio"
    print(f"AB12 Studio -> {url}   (run the app with `npm run dev`)")
    if "--no-browser" not in sys.argv:
        threading.Timer(0.5, lambda: webbrowser.open(url)).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
