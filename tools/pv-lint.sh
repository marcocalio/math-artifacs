#!/bin/bash
# Controllo automatico del layout di una clip: tools/pv-lint.sh <id clip> [light|dark]
# Disegna la clip ogni 0,5 s e segnala testi o rettangoli che escono dal riquadro 640×360, testi visibili
# che si sovrappongono, SVG non valido (XML) ed errori JS. Nessun messaggio oltre a «controllati…» = tutto a posto.
ROOT=$(cd "$(dirname "$0")/.." && pwd); JS=$ROOT/sito/assets/js
ID=$1; TH=${2:-light}; [ -z "$ID" ] && { echo "uso: $0 <id> [light|dark]"; exit 1; }
CHROME=${CHROME:-"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"}
W=$(mktemp -d)
python3 - "$ROOT/sito/probabilita.html" "$W/page.css" <<'PY'
import re, sys
s = open(sys.argv[1], encoding='utf-8').read()
open(sys.argv[2], 'w', encoding='utf-8').write(re.search(r'<style>(.*?)</style>', s, re.S).group(1))
PY
{
echo '<!doctype html><html lang="it"><head><meta charset="utf-8"><link rel="stylesheet" href="page.css"></head><body><div id="box" style="position:absolute;left:0;top:0;width:640px;height:360px;visibility:hidden"></div><pre id="res"></pre>'
echo "<script src=\"file://$JS/pv.js\"></script>"
for f in $(ls "$JS" | grep -E '^pv-parte.*\.js$' | sort); do echo "<script src=\"file://$JS/$f\"></script>"; done
[ -n "$EXTRA" ] && echo "<script src=\"file://$EXTRA\"></script>"
cat <<'EOS'
<script>
const q = new URLSearchParams(location.search), id = q.get('id');
document.documentElement.dataset.theme = q.get('theme') || 'light';
const out = [];
window.onerror = (m, s, l) => out.push('ERRORE JS: ' + m + ' @' + (s||'').split('/').pop() + ':' + l);
window.addEventListener('load', () => {
  try {
    const v = PV.videos[id];
    if (!v) { out.push('clip inesistente: ' + id); } else {
      const box = document.getElementById('box'), seen = {}, edge = {}, xml = {};
      const effOp = (el) => { let o = 1; for (; el && el.tagName !== 'svg'; el = el.parentNode) { const a = el.getAttribute && el.getAttribute('opacity'); if (a !== null && a !== undefined) o *= +a; } return o; };
      const txt = (el) => el.textContent.replace(/\s+/g, ' ').trim();
      for (let t = 0; t <= v.dur + 1e-6; t += 0.5) {
        const fr = v.frame(Math.min(t, v.dur));
        if (!xml[t]) { const d = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + fr + '</svg>', 'image/svg+xml'); if (d.querySelector('parsererror')) { out.push('t=' + t.toFixed(1) + ' SVG NON VALIDO (XML): ' + d.querySelector('parsererror').textContent.slice(0, 120)); xml[t] = 1; } }
        box.innerHTML = '<svg viewBox="0 0 640 360" width="640" height="360">' + fr + '</svg>';
        const items = [], base = box.querySelector('svg').getBoundingClientRect();
        box.querySelectorAll('text').forEach((el) => {
          const s = txt(el); if (!s) return;
          const op = effOp(el); if (op < 0.5) return;
          const r = el.getBoundingClientRect(); if (!r.width) return;
          const b = { x: r.left - base.left, y: r.top - base.top, width: r.width, height: r.height };
          items.push({ s, x: b.x, y: b.y, w: b.width, h: b.height });
          const M = 2;
          if (b.x < -M || b.y < -M || b.x + b.width > 640 + M || b.y + b.height > 360 + M) { const k = s; if (!edge[k]) { edge[k] = 1; out.push('t=' + t.toFixed(1) + ' FUORI RIQUADRO «' + s + '» x=' + Math.round(b.x) + '..' + Math.round(b.x + b.width) + ' y=' + Math.round(b.y) + '..' + Math.round(b.y + b.height)); } }
        });
        box.querySelectorAll('rect').forEach((el) => {
          const op = effOp(el); if (op < 0.5) return;
          const r = el.getBoundingClientRect(); if (!r.width || r.width > 639) return;
          const x0 = r.left - base.left, y0 = r.top - base.top, x1 = x0 + r.width, y1 = y0 + r.height, M = 3;
          if (x0 < -M || y0 < -M || x1 > 640 + M || y1 > 360 + M) { const k = 'rect' + Math.round(x0) + ',' + Math.round(y0) + ',' + Math.round(x1) + ',' + Math.round(y1); if (!edge[k]) { edge[k] = 1; out.push('t=' + t.toFixed(1) + ' RETTANGOLO FUORI RIQUADRO x=' + Math.round(x0) + '..' + Math.round(x1) + ' y=' + Math.round(y0) + '..' + Math.round(y1) + (el.getAttribute('rx') ? ' (etichetta/pill?)' : '')); } }
        });
        for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
          const a = items[i], b = items[j];
          const ay0 = a.y + a.h * 0.15, ay1 = a.y + a.h * 0.85, by0 = b.y + b.h * 0.15, by1 = b.y + b.h * 0.85;
          const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), oy = Math.min(ay1, by1) - Math.max(ay0, by0);
          if (ox > 3 && oy > 3 && ox * oy > 0.2 * Math.min(a.w * a.h * 0.7, b.w * b.h * 0.7)) {
            const k = a.s + ' | ' + b.s; if (!seen[k]) { seen[k] = [t, 0]; } seen[k][1]++;
          }
        }
      }
      for (const k in seen) out.push('t=' + seen[k][0].toFixed(1) + ' SOVRAPPOSTI «' + k + '» (per ' + seen[k][1] * 0.5 + ' s)');
      out.push('controllati ' + Math.round(v.dur / 0.5) + ' fotogrammi di ' + id + ' (' + v.dur + ' s)');
    }
  } catch (e) { out.push('ECCEZIONE: ' + e.message); }
  document.getElementById('res').textContent = out.join('\n');
});
</script></body></html>
EOS
} > "$W/lint.html"
"$CHROME" --headless=new --disable-gpu --user-data-dir="$W/prof" --virtual-time-budget=60000 --dump-dom "file://$W/lint.html?id=$ID&theme=$TH" 2>/dev/null | python3 -c "
import sys,re,html
d=sys.stdin.read()
m=re.search(r'<pre id=\"res\">(.*?)</pre>',d,re.S)
print(html.unescape(m.group(1)) if m else 'nessun risultato (la pagina non ha finito?)')"
rm -rf "$W"
