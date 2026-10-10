#!/bin/bash
# AB12 Studio one-click starter.
REPO="/Users/atifali/Code/AB12/ab12"
URL="http://127.0.0.1:8765/studio"
LOG="/tmp/ab12-studio.log"

cd "$REPO" 2>/dev/null || { echo "Can't find the AB12 folder at $REPO"; read -n 1; exit 1; }

if [ "$(curl -s -o /dev/null -w '%{http_code}' "$URL" 2>/dev/null)" = "200" ]; then
  echo "✅ Studio is already running — opening it…"
  open "$URL"
  exit 0
fi

echo "🎛️  Starting AB12 Studio…"
nohup python3 tools/studio.py --no-browser > "$LOG" 2>&1 &

for i in $(seq 1 15); do
  sleep 1
  if [ "$(curl -s -o /dev/null -w '%{http_code}' "$URL" 2>/dev/null)" = "200" ]; then
    echo "✅ Studio is up! Opening http://127.0.0.1:8765/studio"
    open "$URL"
    exit 0
  fi
done

echo "❌ Studio didn't start — last log lines:"
tail -20 "$LOG"
echo
echo "Press any key to close."
read -n 1
exit 1
