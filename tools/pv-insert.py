#!/usr/bin/env python3
"""Inserisce le figure video di una Parte in sito/probabilita.html (idempotente).
Uso: python3 tools/pv-insert.py anchors.json [--part 3] [--apply]
anchors.json = lista di {"id": ..., "anchor": "frase copiata dal sorgente HTML"}.
La frase (25-90 caratteri, senza tag dentro, unica nella Parte) deve stare nel paragrafo che introduce
l'idea del video: la figura va subito DOPO l'elemento di primo livello di <section class="parte" id="parteN">
che la contiene (mai dentro riquadri o tendine). Senza --apply stampa dove andrebbe ogni figura."""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(ROOT, 'sito', 'probabilita.html')
part = sys.argv[sys.argv.index('--part') + 1] if '--part' in sys.argv else '3'
src = open(PAGE, encoding='utf-8').read()
s0 = re.search(r'<section class="parte" id="parte%s">' % part, src).end()
e0 = src.index('\n</section>', s0)
VOID = {'br', 'hr', 'img', 'input', 'meta', 'link', 'source', 'col', 'wbr'}
tag = re.compile(r'<!--.*?-->|<(/?)([a-zA-Z][\w:-]*)([^>]*?)(/?)>', re.S)
top, depth, st = [], 0, None
for mt in tag.finditer(src, s0, e0):
    if mt.group(0).startswith('<!--'):
        continue
    closing, name, selfc = mt.group(1), mt.group(2).lower(), mt.group(4)
    if name in VOID or selfc:
        if depth == 0:
            top.append((mt.start(), mt.end()))
        continue
    if closing:
        depth -= 1
        if depth == 0:
            top.append((st, mt.end()))
    else:
        if depth == 0:
            st = mt.start()
        depth += 1
entries = json.load(open([a for a in sys.argv[1:] if a.endswith('.json')][0], encoding='utf-8'))
apply = '--apply' in sys.argv
edits, bad = [], 0
for en in entries:
    fid, anc = en['id'], en['anchor']
    if f'data-pv="{fid}"' in src:
        print(f'= {fid}: già presente'); continue
    cnt = src.count(anc, s0, e0)
    if cnt != 1:
        print(f"! {fid}: l'àncora compare {cnt} volte: {anc[:70]!r}"); bad += 1; continue
    pos = src.index(anc, s0, e0)
    blk = next(((a, b) for a, b in top if a <= pos < b), None)
    if not blk:
        print(f'! {fid}: nessun blocco di primo livello'); bad += 1; continue
    plain = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', src[blk[0]:blk[1]]))
    print(f'+ {fid}: dopo «{plain[:60]} … {plain[-70:]}»')
    edits.append((blk[1], f'\n\n<figure class="pv" data-pv="{fid}"></figure>'))
if apply and not bad:
    for pos, txt in sorted(edits, reverse=True):
        src = src[:pos] + txt + src[pos:]
    open(PAGE, 'w', encoding='utf-8').write(src)
    print(f'scritte {len(edits)} figure')
elif apply:
    print('NON scritto: ci sono errori')
