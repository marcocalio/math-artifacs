#!/bin/bash
# Controllo della pagina intera: monta sito/probabilita.html in Chrome e conta le figure video montate (data-ok),
# poi elenca gli errori della console. Uso: tools/pv-page.sh
ROOT=$(cd "$(dirname "$0")/.." && pwd); OUT=${PV_OUT:-/tmp/pv-out}; mkdir -p "$OUT"
CHROME=${CHROME:-"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"}
W=$(mktemp -d)
"$CHROME" --headless=new --disable-gpu --user-data-dir="$W/prof" --enable-logging=stderr --v=0 --virtual-time-budget=20000 --dump-dom "file://$ROOT/sito/probabilita.html" > "$OUT/page.html" 2> "$OUT/page.log"
rm -rf "$W"
echo "figure con data-pv: $(grep -o 'data-pv="[^"]*"' "$OUT/page.html" | wc -l | tr -d ' ')"
echo "figure montate (data-ok): $(grep -o 'data-ok="1"' "$OUT/page.html" | wc -l | tr -d ' ')"
grep -i 'CONSOLE' "$OUT/page.log" | grep -v -i 'DevTools' | head -10
