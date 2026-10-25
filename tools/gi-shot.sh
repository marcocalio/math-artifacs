#!/bin/bash
# Anteprima dei grafici interattivi (Chrome da riga di comando, niente pannello Browser).
# Uso: tools/gi-shot.sh <file.js|nome> '<stato1>' '<stato2>' … [--dark]   → $GI_OUT/<id>.png (default /tmp/gi-out)
#   file.js: file del grafico (anche fuori dal sito, es. lavoro-probabilita/grafici/w/bayes.js); nome: id di un grafico già in gi-parte*.js
#   stato: oggetto JSON con i valori dei comandi, es. '{"prev":0.001}' (vuoto '{}' = valori predefiniti)
ROOT=$(cd "$(dirname "$0")/.." && pwd); JS=$ROOT/sito/assets/js; OUT=${GI_OUT:-/tmp/gi-out}
SRC=$1; shift; TH=light; STATES=()
for a in "$@"; do if [ "$a" = "--dark" ]; then TH=dark; else STATES+=("$a"); fi; done
[ -z "$SRC" ] && { echo "uso: $0 <file.js|id> '<stato JSON>' … [--dark]"; exit 1; }
[ ${#STATES[@]} -eq 0 ] && STATES=('{}')
CHROME=${CHROME:-"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"}
mkdir -p "$OUT"; W=$(mktemp -d)
python3 - "$ROOT/sito/probabilita.html" "$W/page.css" <<'PY'
import re, sys
s = open(sys.argv[1], encoding='utf-8').read()
open(sys.argv[2], 'w', encoding='utf-8').write(re.search(r'<style>(.*?)</style>', s, re.S).group(1))
PY
if [ -f "$SRC" ]; then ID=$(basename "$SRC" .js); EXTRA="<script>(function(){'use strict';$(cat "$SRC")
})();</script>"; else ID=$SRC; EXTRA=""; fi
N=${#STATES[@]}
{
echo '<!doctype html><html lang="it"><head><meta charset="utf-8"><link rel="stylesheet" href="page.css"><style>body{margin:0;padding:10px;background:var(--carta);width:680px}figure.gi{margin:0 0 12px!important}#err{color:red;font:13px monospace;white-space:pre}</style></head><body><div id="g"></div><div id="err"></div>'
echo "<script src=\"file://$JS/pv.js\"></script><script src=\"file://$JS/gi.js\"></script>"
if [ -z "$EXTRA" ]; then for f in $(ls "$JS" | grep -E '^gi-parte.*\.js$' | sort); do echo "<script src=\"file://$JS/$f\"></script>"; done; else echo "$EXTRA"; fi
cat <<'EOS'
<script>
window.onerror = (m, s, l) => { document.getElementById('err').textContent += m + ' @' + (s||'').split('/').pop() + ':' + l + '\n'; };
const q = new URLSearchParams(location.search), id = q.get('id'), states = JSON.parse(q.get('s'));
document.documentElement.dataset.theme = q.get('theme') || 'light';
const g = document.getElementById('g');
if (!GI.widgets[id]) document.getElementById('err').textContent += 'grafico inesistente: ' + id;
states.forEach((s) => { const f = document.createElement('figure'); f.className = 'gi'; f.dataset.gi = id; f.dataset.init = JSON.stringify(s); g.appendChild(f); });
window.addEventListener('load', () => { const st = document.createElement('style'); st.textContent = ''; GI.widgets[id] && document.querySelectorAll('figure.gi').forEach((f) => GI.mount(f)); });
</script></body></html>
EOS
} > "$W/sheet.html"
# lo stile lo inietta init() solo al DOMContentLoaded: se i figure non c'erano ancora, lo aggiungiamo a mano
python3 - "$W/sheet.html" <<'PY'
import sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
s = s.replace("window.addEventListener('load', () => { const st = document.createElement('style'); st.textContent = '';", "window.addEventListener('load', () => { if (!document.querySelector('style[data-gi]')) { const st = document.createElement('style'); st.dataset.gi = '1'; st.textContent = window.__GICSS || ''; document.head.appendChild(st); }")
open(p, 'w', encoding='utf-8').write(s)
PY
ENC=$(python3 -c "import json,sys,urllib.parse; print(urllib.parse.quote(json.dumps([json.loads(a) for a in sys.argv[1:]])))" "${STATES[@]}")
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --user-data-dir="$W/prof" --window-size=700,$(( N * 1150 + 40 )) --screenshot="$OUT/$ID-$TH.png" "file://$W/sheet.html?id=$ID&s=$ENC&theme=$TH" >/dev/null 2>&1
rm -rf "$W"; ls -la "$OUT/$ID-$TH.png" | awk '{print $5, $9}'
