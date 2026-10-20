#!/bin/bash
# Foglio delle copertine: tools/pv-posters.sh <id1,id2,…> [light|dark] [colonne]  → $PV_OUT/posters-<tema>.png
# Mostra ogni clip com'è prima di premere play (fotogramma di copertina), una cella per clip.
ROOT=$(cd "$(dirname "$0")/.." && pwd); JS=$ROOT/sito/assets/js; OUT=${PV_OUT:-/tmp/pv-out}
IDS=$1; TH=${2:-light}; COLS=${3:-3}
CHROME=${CHROME:-"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"}
mkdir -p "$OUT"; W=$(mktemp -d)
python3 - "$ROOT/sito/probabilita.html" "$W/page.css" <<'PY'
import re, sys
s = open(sys.argv[1], encoding='utf-8').read()
open(sys.argv[2], 'w', encoding='utf-8').write(re.search(r'<style>(.*?)</style>', s, re.S).group(1))
PY
N=$(echo "$IDS" | tr ',' '\n' | wc -l | tr -d ' '); ROWS=$(( (N + COLS - 1) / COLS ))
{
echo '<!doctype html><html lang="it"><head><meta charset="utf-8"><link rel="stylesheet" href="page.css"><style>body{margin:0;padding:10px;background:var(--carta)}#g{display:grid;gap:10px;align-items:start}figure.pv{margin:0!important}.pv-bar,.pv-chap,.pv-trans,figcaption,.pv-big{display:none!important}.pv-cap{min-height:3.2em;padding:6px 12px;font-size:15px}.tl{font:12px monospace;color:var(--inchiostro2);padding:2px 4px}#err{color:red;font:13px monospace;white-space:pre}</style></head><body><div id="g"></div><div id="err"></div>'
echo "<script src=\"file://$JS/pv.js\"></script>"
for f in $(ls "$JS" | grep -E '^pv-parte.*\.js$' | sort); do echo "<script src=\"file://$JS/$f\"></script>"; done
cat <<'EOS'
<script>
window.onerror = (m, s, l) => { document.getElementById('err').textContent += m + ' @' + (s||'').split('/').pop() + ':' + l + '\n'; };
const q = new URLSearchParams(location.search), ids = q.get('ids').split(','), cols = +q.get('cols') || 3;
document.documentElement.dataset.theme = q.get('theme') || 'light';
const g = document.getElementById('g'); g.style.gridTemplateColumns = 'repeat(' + cols + ',640px)';
ids.forEach((id) => { const c = document.createElement('div'); c.innerHTML = '<div class="tl">' + id + '</div><figure class="pv" data-pv="' + id + '"></figure>'; g.appendChild(c); });
</script></body></html>
EOS
} > "$W/sheet.html"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --user-data-dir="$W/prof" --window-size=$(( COLS * 650 + 20 )),$(( ROWS * 470 + 40 )) --screenshot="$OUT/posters-$TH.png" "file://$W/sheet.html?ids=$IDS&theme=$TH&cols=$COLS" >/dev/null 2>&1
rm -rf "$W"; ls -la "$OUT/posters-$TH.png" | awk '{print $5, $9}'
