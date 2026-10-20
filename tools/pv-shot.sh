#!/bin/bash
# Anteprima di fotogrammi dei video di Probabilità (Chrome da riga di comando, niente pannello Browser).
# Uso: tools/pv-shot.sh <id clip> <t1,t2,…> [light|dark] [colonne]   → $PV_OUT/<id>-<tema>.png (default /tmp/pv-out)
# Ogni cella è un riquadro 640×360 con il sottotitolo sotto; poi guarda il PNG. Si può lanciare in parallelo.
ROOT=$(cd "$(dirname "$0")/.." && pwd); JS=$ROOT/sito/assets/js; OUT=${PV_OUT:-/tmp/pv-out}
ID=$1; TS=$2; TH=${3:-light}; COLS=${4:-2}
[ -z "$ID" ] || [ -z "$TS" ] && { echo "uso: $0 <id> <t1,t2,…> [light|dark] [colonne]"; exit 1; }
CHROME=${CHROME:-"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"}
mkdir -p "$OUT"; W=$(mktemp -d)
python3 - "$ROOT/sito/probabilita.html" "$W/page.css" <<'PY'
import re, sys
s = open(sys.argv[1], encoding='utf-8').read()
open(sys.argv[2], 'w', encoding='utf-8').write(re.search(r'<style>(.*?)</style>', s, re.S).group(1))
PY
N=$(echo "$TS" | tr ',' '\n' | wc -l | tr -d ' '); ROWS=$(( (N + COLS - 1) / COLS ))
{
echo '<!doctype html><html lang="it"><head><meta charset="utf-8"><link rel="stylesheet" href="page.css"><style>body{margin:0;padding:10px;background:var(--carta)}#g{display:grid;gap:10px;align-items:start}figure.pv{margin:0!important}.pv-bar,.pv-chap,.pv-trans,figcaption,.pv-big{display:none!important}.pv-cap{min-height:3.2em;padding:6px 12px;font-size:15px}.tl{font:12px monospace;color:var(--inchiostro2);padding:2px 4px}#err{color:red;font:13px monospace;white-space:pre}</style></head><body><div id="g"></div><div id="err"></div>'
echo "<script src=\"file://$JS/pv.js\"></script>"
for f in $(ls "$JS" | grep -E '^pv-parte.*\.js$' | sort); do echo "<script src=\"file://$JS/$f\"></script>"; done
cat <<'EOS'
<script>
window.onerror = (m, s, l) => { document.getElementById('err').textContent += m + ' @' + (s||'').split('/').pop() + ':' + l + '\n'; };
const q = new URLSearchParams(location.search), id = q.get('id'), ts = q.get('t').split(',').map(Number), cols = +q.get('cols') || 2;
document.documentElement.dataset.theme = q.get('theme') || 'light';
const g = document.getElementById('g'); g.style.gridTemplateColumns = 'repeat(' + cols + ',640px)';
ts.forEach((t) => { const c = document.createElement('div'); c.innerHTML = '<div class="tl">t = ' + t + ' s</div><figure class="pv" data-pv="' + id + '"></figure>'; g.appendChild(c); });
window.addEventListener('load', () => {
  const v = PV.videos[id];
  if (!v) { document.getElementById('err').textContent += 'clip inesistente: ' + id; return; }
  document.querySelectorAll('figure.pv').forEach((fig, i) => { const sk = fig.querySelector('.pv-seek'); sk.value = Math.round(ts[i] / v.dur * 1000); sk.dispatchEvent(new Event('input')); });
});
</script></body></html>
EOS
} > "$W/sheet.html"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --user-data-dir="$W/prof" --window-size=$(( COLS * 650 + 20 )),$(( ROWS * 470 + 40 )) --screenshot="$OUT/$ID-$TH.png" "file://$W/sheet.html?id=$ID&t=$TS&theme=$TH&cols=$COLS" >/dev/null 2>&1
rm -rf "$W"; ls -la "$OUT/$ID-$TH.png" | awk '{print $5, $9}'
