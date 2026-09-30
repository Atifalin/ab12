# AB12

A toddler keyboard toy: zero-dependency static site (HTML/CSS/JS, emoji art, Web Speech + WebAudio — no assets to download).

**Modes**
- **123 ABC** — each key shows a giant colored character, a picture ("A is for Apple 🍎", "3" shows 🍎🍎🍎), speaks it in a fun voice, and adds it to a colored trail at the top. Typing `1` then `0` shows **10**. `Enter` (or the ⏎ pad key) starts a new trail line. Spell a word from the built-in list (Cat, Dog, …) or a family name (Ezdan, Zohaan, …) and the letters glow gold with a celebration banner.
- **Smash** — any key (or any tap) pops a random cartoon face / fruit / veggie / animal / vehicle with a silly synthesized sound and confetti.
- **Find it!** — the app asks "Find B!" and shows 3–6 letter bubbles (more choices, then digits, as they score). Right answers earn ⭐s, wrong ones get a gentle "Try again!" and a hint.
- **Spell it!** — hollow letters show a word ("A to Z" = Apple…Zebra, "1 to 10" = One…Ten); type each letter to fill it in. Wrong letters wobble, repeated misses highlight the right pad key, and finishing a word recites the spelling. Progress is saved per track.

**Phone / iPad** — touch devices get a big colorful button pad (0-9, A-Z) instead of relying on the keyboard; Smash mode = tap anywhere. Add to Home Screen for fullscreen.

**Exit lock** — hold the ⭐ in the top-right for 2 seconds to return to the menu.

## Run locally
```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Voice clips

Speech uses pre-recorded `.m4a` clips in `audio/` (generated with
macOS `say`, voice **Tara** — Indian English). If a clip is missing the app
falls back to browser TTS. Clips cover letters/numbers, words and family
names (`word_*`), and Find it! prompts (`find_*`, `try_again`).

- **Regenerate:** `python3 tools/gen_audio.py [VoiceName]` — any voice from `say -v '?'`
- **Only new clips:** `python3 tools/gen_audio.py Tara --only-missing`
- **Your own voice:** `tools/record.sh` (needs `brew install ffmpeg` or `sox`), or record
  Voice Memos → export `.m4a` → rename per `tools/clips.txt` → drop into `audio/`
- **Settings** (⚙️ on the home screen): sound effects, voice, "A is for 🍎" vs "A only", volume

## Deployment (CI/CD)

Push-to-deploy, same pipeline as EzyImposter:

```
git push (main) → GitHub Actions builds image
  → ghcr.io/atifalin/ab12:latest → Watchtower (on server) pulls every 60s
  → recreates the ab12 container automatically
```

- **Image:** `ghcr.io/atifalin/ab12:latest` (public)
- **Server:** `/srv/apps/ab12/` on the EZserver VPS, container on `proxy-network`
- **Domain:** `https://ab12.ezypath.in` → Nginx Proxy Manager → `ab12:80`
- **Auto-update:** `ab12-watchtower` sidecar (`nicholas-fedor/watchtower` fork)

To deploy manually on the server:
```bash
cd /srv/apps/ab12
docker compose pull && docker compose up -d
```
