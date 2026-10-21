#!/usr/bin/env python3
"""Mette nella pagina sito/probabilita.html le figure video di una Parte, i tag script e la figura del ripasso.
Tutto è idempotente, protetto da un blocco (più sessioni possono lanciarlo insieme) e scritto in modo atomico.

Uso (senza --apply stampa soltanto che cosa farebbe):
  python3 tools/pv-insert.py anchors.json --part 4 [--scripts pv-parte4.js,pv-parte4b.js,pv-parte4z.js] [--ripasso] [--apply]

  anchors.json  lista di {"id": "...", "anchor": "frase copiata dal sorgente HTML"}. La frase (25-90 caratteri, senza
                tag dentro, unica nella Parte) sta nel paragrafo che introduce l'idea del video: la figura va subito DOPO
                l'elemento di primo livello di <section class="parte" id="parteN"> che la contiene (mai dentro riquadri o
                tendine). Se il paragrafo termina con i due punti e introduce un teorema, scegli la frase di un paragrafo
                dopo il teorema.
  --scripts     aggiunge i <script defer> mancanti dopo l'ultimo tag pv-parte*.js, nell'ordine dato (il file del ripasso,
                che finisce per z, per ultimo).
  --ripasso     mette <figure data-pv="parteN"> prima del blocco «Domande di verifica» della Parte.
"""
import fcntl, json, os, re, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.environ.get('PV_PAGE') or os.path.join(ROOT, 'sito', 'probabilita.html')  # PV_PAGE: pagina di prova
LOCK = os.path.join(tempfile.gettempdir(), 'pv-insert.lock')
VOID = {'br', 'hr', 'img', 'input', 'meta', 'link', 'source', 'col', 'wbr'}
TAG = re.compile(r'<!--.*?-->|<(/?)([a-zA-Z][\w:-]*)([^>]*?)(/?)>', re.S)


def arg(name):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else None


def top_level(src, s0, e0):
    """Intervalli (inizio, fine) degli elementi di primo livello della sezione."""
    top, depth, st = [], 0, None
    for mt in TAG.finditer(src, s0, e0):
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
    return top


def main():
    part = arg('--part') or '3'
    apply = '--apply' in sys.argv
    jsons = [a for a in sys.argv[1:] if a.endswith('.json')]
    scripts = [s for s in (arg('--scripts') or '').split(',') if s]
    with open(LOCK, 'w') as lk:
        fcntl.flock(lk, fcntl.LOCK_EX)  # un solo scrittore alla volta; si rilegge la pagina sotto il blocco
        src = open(PAGE, encoding='utf-8').read()
        m = re.search(r'<section class="parte" id="parte%s">' % part, src)
        if not m:
            sys.exit('Parte %s non trovata' % part)
        s0 = m.end()
        e0 = src.index('\n</section>', s0)
        top = top_level(src, s0, e0)
        edits, bad = [], 0   # (posizione, testo da inserire)

        for en in json.load(open(jsons[0], encoding='utf-8')) if jsons else []:
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

        if '--ripasso' in sys.argv:
            if f'data-pv="parte{part}"' in src:
                print(f'= ripasso parte{part}: già presente')
            else:
                k = src.find('Domande di verifica', s0, e0)
                d = src.rfind('<div class="esercizi">', s0, k) if k > 0 else -1
                if d < 0:
                    print('! ripasso: blocco «Domande di verifica» non trovato'); bad += 1
                else:
                    print(f'+ ripasso parte{part}: prima di «Domande di verifica»')
                    edits.append((d, f'<figure class="pv" data-pv="parte{part}"><figcaption><b>Ripasso in video</b> · i video della Parte {part} uno dopo l\'altro, con un cartello fra l\'uno e l\'altro. Ognuno si trova anche nella sua sezione. Senza audio, con sottotitoli.</figcaption></figure>\n\n'))

        last = [x for x in re.finditer(r'<script src="assets/js/pv-parte[^"]*" defer></script>\n', src)]
        at = last[-1].end() if last else None
        missing = [s for s in scripts if f'<script src="assets/js/{s}" defer></script>' not in src]
        for s in missing:
            print(f'+ script {s}')
        if missing and at is None:
            print('! nessun tag pv-parte*.js dopo cui inserire gli script'); bad += 1
        elif missing:
            edits.append((at, ''.join(f'<script src="assets/js/{s}" defer></script>\n' for s in missing)))

        if apply and not bad:
            for pos, txt in sorted(edits, key=lambda e: e[0], reverse=True):
                src = src[:pos] + txt + src[pos:]
            tmp = PAGE + '.tmp%d' % os.getpid()
            with open(tmp, 'w', encoding='utf-8') as f:
                f.write(src)
            os.replace(tmp, PAGE)
            print(f'scritte {len(edits)} modifiche')
        elif apply:
            print('NON scritto: ci sono errori')
        elif edits:
            print('(prova a secco: aggiungi --apply per scrivere)')


main()
