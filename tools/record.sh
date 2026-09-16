#!/usr/bin/env bash
# Re-record AB12 voice clips with your own voice.
# Walks through tools/clips.txt — shows each phrase, records ~2.5s, saves audio/<name>.m4a
#
# Needs one of: `ffmpeg` (brew install ffmpeg) or `rec` (brew install sox).
# Easiest alternative: record Voice Memos on iPhone/Mac, export .m4a,
# rename to the clip names in tools/clips.txt, drop into audio/.

set -euo pipefail
cd "$(dirname "$0")/.."
MANIFEST="tools/clips.txt"

REC=""
if command -v ffmpeg >/dev/null; then REC="ffmpeg"
elif command -v rec >/dev/null; then REC="sox"
else
  echo "No recorder found. Options:"
  echo "  brew install ffmpeg   (or: brew install sox)"
  echo "  — or record Voice Memos, export .m4a, rename per $MANIFEST, drop into audio/"
  exit 1
fi

echo "Recording with $REC — press Enter to record each clip (~2.5s), 's' to skip, Ctrl+C to quit."
while IFS=$'\t' read -r name text; do
  [ -z "$name" ] && continue
  printf '\n%s  ->  say: "%s"   [Enter=record, s=skip] ' "$name" "$text"
  read -r key
  [ "$key" = "s" ] && continue
  if [ "$REC" = "ffmpeg" ]; then
    ffmpeg -hide_banner -loglevel error -y -f avfoundation -i ":0" -t 2.5 "audio/$name.m4a"
  else
    rec -q "audio/$name.wav" trim 0 2.5 && afconvert -f m4af -d aac "audio/$name.wav" "audio/$name.m4a" && rm "audio/$name.wav"
  fi
  echo "  saved audio/$name.m4a"
done < "$MANIFEST"
echo "All done — commit and push to deploy."
