#!/usr/bin/env python3
"""Estrae il testo di una Parte di sito/probabilita.html, una sezione per file (senza i riquadri «Dipendenze da Analisi»,
senza le tendine e senza le figure video): python3 tools/pv-testo.py 4  →  /tmp/pv-testo/4.1.txt, 4.2.txt, …
È la lettura giusta prima di scrivere i video di una sezione (stessi esempi, stessi numeri, stesso ordine)."""
import html, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('PV_TESTO', '/tmp/pv-testo')
src = open(os.path.join(ROOT, 'sito', 'probabilita.html'), encoding='utf-8').read()
parte = sys.argv[1]
body = re.search(r'<section class="parte" id="parte%s">(.*?)\n</section>' % parte, src, re.S).group(1)

def strip_blocks(s, opener_re):
    out, i = [], 0
    while True:
        mm = re.compile(opener_re).search(s, i)
        if not mm:
            out.append(s[i:]); break
        out.append(s[i:mm.start()])
        tag = re.match(r'<(\w+)', mm.group(0)).group(1)
        depth, j = 1, mm.end()
        pat = re.compile(r'<(/?)%s\b[^>]*>' % tag)
        while depth:
            n = pat.search(s, j)
            depth += -1 if n.group(1) else 1
            j = n.end()
        i = j
    return ''.join(out)

body = strip_blocks(body, r'<div class="box dipendenze"[^>]*>')
body = strip_blocks(body, r'<details class="aiuto"[^>]*>')
body = strip_blocks(body, r'<figure class="pv"[^>]*>')
body = re.sub(r'<svg.*?</svg>', '[figura]', body, flags=re.S)
os.makedirs(OUT, exist_ok=True)
for part in re.split(r'(?=<h3 id="s-)', body):
    mm = re.match(r'<h3 id="(s-[\w-]+)"[^>]*><span class="n">([\d.]+)</span>\s*(.*?)</h3>', part, re.S)
    if not mm:
        continue
    t = part
    t = re.sub(r'<h4[^>]*>', '\n\n## ', t); t = re.sub(r'</h4>', '\n', t)
    t = re.sub(r'<h3[^>]*>', '\n# ', t); t = re.sub(r'</h3>', '\n', t)
    t = re.sub(r'<p class="capo">', '\n[', t); t = re.sub(r'</p>', '\n', t)
    t = re.sub(r'<li[^>]*>', '\n- ', t)
    t = re.sub(r'<tr>', '\n', t); t = re.sub(r'</t[dh]>', ' | ', t)
    t = re.sub(r'<sup>(.*?)</sup>', r'^\1', t); t = re.sub(r'<sub>(.*?)</sub>', r'_\1', t)
    t = re.sub(r'<br\s*/?>', '\n', t); t = re.sub(r'<[^>]+>', '', t)
    t = re.sub(r'\n\s*\n\s*\n+', '\n\n', html.unescape(t))
    open(os.path.join(OUT, mm.group(2) + '.txt'), 'w', encoding='utf-8').write(t.strip() + '\n')
    print(mm.group(2), len(t.split()), 'parole')
