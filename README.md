# AB12

A toddler keyboard toy: Vite + vanilla ES-module JS (emoji art, Web Speech + WebAudio).

**Modes**
- **123 ABC** — each key shows a giant colored character, a picture ("A is for Apple 🍎", "3" shows 🍎🍎🍎), speaks it in a fun voice, and adds it to a colored trail at the top. Typing `1` then `0` shows **10**. `Enter` (or the ⏎ pad key) starts a new trail line. Spell a word from the built-in list (Cat, Dog, …) or a family name (Ezdan, Zohaan, …) and the letters glow gold with a celebration banner.
- **Smash** — any key (or any tap) pops a random cartoon face / fruit / veggie / animal / vehicle with a silly synthesized sound and confetti.
- **Find it!** — the app asks "Find B!" and shows 3–6 letter bubbles (more choices, then digits, as they score). Right answers earn ⭐s, wrong ones get a gentle "Try again!" and a hint.
- **Spell it!** — hollow letters show a word ("A to Z" = Apple…Zebra, "1 to 10" = One…Ten); type each letter to fill it in. Wrong letters wobble, repeated misses highlight the right pad key, and finishing a word recites the spelling. Progress is saved per track.

**Phone / iPad** — touch devices get a big colorful button pad (0-9, A-Z) instead of relying on the keyboard; Smash mode = tap anywhere. Add to Home Screen for fullscreen.

**Exit lock** — hold the ⭐ in the top-right for 2 seconds to return to the menu.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle -> dist/
npm run preview    # serve the built bundle locally
```

Source lives in `src/` (`src/core/` shared services, `src/modes/` one module
per game, `src/styles/`), static assets in `public/` (audio, icon, manifest —
served at the same URLs as before).

## Docker

The image is multi-stage: `node:22-alpine` runs `npm ci && npm run build`,
then `nginx:alpine` serves `dist/` with `nginx.conf` (hashed `/assets/` cached
immutably, app shell no-cache).

## Voice clips

Speech uses pre-recorded `.m4a` clips in `public/audio/` (generated with
macOS `say`, voice **Tara** — Indian English). If a clip is missing the app
falls back to browser TTS. Clips cover letters/numbers, words and family
names (`word_*`), and Find it! prompts (`find_*`, `try_again`).

- **Regenerate:** `python3 tools/gen_audio.py [VoiceName]` — any voice from `say -v '?'`
- **Only new clips:** `python3 tools/gen_audio.py Tara --only-missing`

### Record family voices

`python3 tools/recorder.py` opens a local recorder at `http://127.0.0.1:8765/rec`
(run the app itself with `npm run dev`). Voice packs live in
`public/audio/voices/<slug>/` with a `pack.json` label — create as many as you
like (Daddy, Ezdan, Mommy, …), record up to 5 takes per clip / 30 for the
cheer & try-again pools. The manifest is rebuilt automatically (`--rebuild` to
rebuild by hand, `--retrim [voice]` to re-trim silence). Commit + push ships
them; the app's ⚙️ **Voice pack** setting picks a voice or 🎲 "surprise"
(random per session), with Tara clips as fallback.
- **Your own voice:** record Voice Memos → export `.m4a` → rename per
  `tools/clips.txt` → drop into `public/audio/`
- **Settings** (hold ⚙️ on the home screen for 2s — parent lock can be disabled inside):
  sound effects, voice, "A is for 🍎" vs "A only", volume, theme, home layout,
  per-mode options, and the mode shelf.

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
