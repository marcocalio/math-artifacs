/* =========================================================================
   pv-parte0.js — video della Parte 0 (Prima di cominciare): sezioni 0.3
   (l'aritmetica che tornerà) e 0.4 (contare). Le sezioni 0.2, 0.5, 0.6 e il
   ripasso 'parte0' sono in pv-parte0b.js. Si appoggia a pv.js: ogni video è
   un PV.add(id, {...}). Tutti i tempi sono in secondi; le coordinate sono nel
   riquadro 640 × 360.
   ========================================================================= */
(function () {
  'use strict';
  const { lerp, E, p, arc, C, SANS, T, rect, circ, ln, path, g, draw, tx, txc, tile, check, cross, vis, on, bump, heading, subline, lb, vl, fr, brace, lbrace, bn, pills, die } = PV.h;
  const OK = 'var(--verde)', NO = 'var(--rosso)';

  /* riga di frazioni e segni centrata su cx: items = [{ n, d, col } (frazione) | { s } (segno)], ops = opacità di ogni pezzo */
  const rowW = (it, size) => (it.n !== undefined ? Math.max(vl(it.n), vl(it.d)) * size * 0.52 + 10 : size * 0.7 + 18);
  function frow(cx, y, items, size, ops) {
    const ws = items.map((it) => rowW(it, size));
    let x = cx - ws.reduce((a, b) => a + b, 0) / 2, o = '';
    items.forEach((it, k) => {
      const c = x + ws[k] / 2, op = ops[k];
      x += ws[k];
      if (!(op > 0.004)) return;
      o += it.n !== undefined ? fr(c, y, it.n, it.d, { size, fill: it.col || C.ink, op }) : tx(c, y + size * 0.15, it.s, { size, op });
    });
    return o;
  }
  /* linee interne di una griglia n × n con lato s (angolo x, y) */
  const gridLines = (x, y, n, s) => {
    let d = '';
    for (let k = 1; k < n; k++) d += `M${x + k * s} ${y}V${y + n * s}M${x} ${y + k * s}H${x + n * s}`;
    return d;
  };

  /* ======================================================================
     0.3 · Percentuali: «una parte di una parte» (frazioni, 40% del 30%, due sconti)
     ====================================================================== */
  const G1 = { x: 84, y: 112, s: 44 }; // la torta: 5 colonne × 4 righe
  const G2 = { x: 84, y: 112, s: 19 }; // il quadrettato 10 × 10: un quadratino = 10 clienti (o 1 €)
  const R1A = [{ n: '3', d: '5', col: C.B }, { s: '×' }, { n: '2', d: '4', col: C.A }, { s: '=' }, { n: '3×2', d: '5×4' }];
  const R1B = [{ s: '=' }, { n: '6', d: '20' }, { s: '=' }, { n: '3', d: '10' }];

  PV.add('percentuali', {
    sec: '0.3',
    short: 'Una parte di una parte',
    title: 'Percentuali: una parte di una parte (frazioni, 40% del 30%, due sconti)',
    alt: 'Animazione: su una torta di 5 colonne e 4 righe, 3/5 di 2/4 sono 6 fette su 20, cioè 3/10; su 1 000 clienti il 40% del 30% è il 12%, cioè 120 clienti; due sconti di fila, 20% e poi 10%, portano 100 € a 80 € e poi a 72 €: lo sconto totale è del 28%, non del 30%.',
    dur: 57.5,
    poster: 46.5,
    chap: [[0, 'La torta: 3/5 di 2/4'], [19, 'Il 40% del 30%'], [32, 'Due sconti di fila']],
    caps: [
      [0, 'Le frazioni e le percentuali si moltiplicano: è sempre «una parte di una parte». Cominciamo da una torta.'],
      [6.5, 'Metà torta, cioè 2/4, e ne mangi i 3/5. Sopra per sopra, sotto per sotto: 3/5 × 2/4 = 6/20.'],
      [13, 'Semplifichi dividendo per 2: 6/20 = 3/10. Le venti fette si raggruppano a due a due.'],
      [19, 'Ora le percentuali. Su 1 000 clienti, il 30% usa l’app: sono 300. Di questi, il 40% paga con la carta.'],
      [26, 'È il 40% del 30%: 0,4 × 0,3 = 0,12. Cioè il 12% dei clienti, 120 persone su 1 000.'],
      [32, 'Stessa idea con gli sconti. Un prezzo di 100 €: sconto del 20%, restano 80 €. Poi un altro 10%, ma sul prezzo già scontato.'],
      [39.5, 'Si moltiplica: 0,8 × 0,9 = 0,72. Paghi 72 €, e lo sconto totale è del 28%, non del 30%.'],
      [45.5, 'La seconda percentuale si applica sempre a ciò che resta dopo la prima, non al totale.'],
      [52, 'Ritroverai questo schema nella Parte 1, nella formula delle probabilità composte.'],
    ],
    frame(t) {
      let o = '';
      o += heading(t, 0.2, 18.8, 'Una parte di una parte', 'prima con le frazioni: 3/5 di 2/4');
      o += heading(t, 19.4, 32, 'Percentuali di percentuali', 'il 40% del 30% dei clienti');
      o += heading(t, 32.4, 58, 'Sconti uno dopo l’altro', 'il 20% e poi il 10%: non fa 30%');

      /* capitolo 1: la torta 5 × 4, le righe 2/4 e le colonne 3/5 */
      const s1 = 1 - p(t, 18.4, 19.2);
      if (s1 > 0.004) {
        const ur = p(t, 7, 8.2), uc = p(t, 9.2, 10.4), ug = p(t, 11.4, 12.4), up = p(t, 14, 15.2);
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 5; j++) {
            const a = p(t, 0.8 + 0.08 * (i + j), 1.4 + 0.08 * (i + j)), x = G1.x + j * G1.s + 2, y = G1.y + i * G1.s + 2, c = G1.s - 4;
            let b = rect(x, y, c, c, { rx: 6, fill: C.paper, stroke: C.soft, sw: 1.6 });
            if (i < 2) b += rect(x, y, c, c, { rx: 6, fill: C.A, fo: 0.22 * ur });
            if (j < 3) b += rect(x, y, c, c, { rx: 6, fill: C.B, fo: 0.22 * uc });
            if (i < 2 && j < 3) b += rect(x, y, c, c, { rx: 6, fill: C.hi, fo: 0.5 * ug, stroke: C.hi, so: ug, sw: 2.6 });
            o += g({ op: a * s1 }, b);
          }
        }
        for (let j = 0; j < 5; j++) {
          for (let r = 0; r < 2; r++) {
            const gold = r === 0 && j < 3;
            o += on(up, rect(G1.x + j * G1.s + 0.5, G1.y + r * 2 * G1.s + 0.5, G1.s - 1, 2 * G1.s - 1, { rx: 11, stroke: gold ? C.hi : C.ink, so: up * s1 * (gold ? 1 : 0.55), sw: gold ? 3.6 : 1.8 }));
          }
        }
        const lo = p(t, 7.4, 8.2) * s1, co = p(t, 9.6, 10.4) * s1, so = vis(t, 11.6, 18.6) * s1;
        o += on(lo, g({ op: lo }, lbrace(G1.x - 8, G1.y + 2, G1.y + 2 * G1.s - 2, C.A) + tx(G1.x - 40, G1.y + G1.s + 6, '2/4', { size: 22, fill: C.A })));
        o += on(co, g({ op: co }, brace(G1.x + 2, G1.x + 3 * G1.s - 2, G1.y - 8, C.B, 1, -1) + tx(G1.x + 1.5 * G1.s, G1.y - 18, '3/5', { size: 22, fill: C.B })));
        o += on(so, lb(G1.x + 2.5 * G1.s, G1.y + 4 * G1.s + 30, '6 fette su 20', { op: so }));
        const k = s1;
        o += frow(480, 180, R1A, 26, [p(t, 9.6, 10.3) * k, p(t, 10.6, 11.2) * k, p(t, 7.4, 8.1) * k, p(t, 11.2, 11.8) * k, p(t, 11.4, 12.2) * k]);
        o += frow(480, 270, R1B, 26, [p(t, 12.6, 13.2) * k, p(t, 12.8, 13.6) * k, p(t, 14.6, 15.2) * k, p(t, 15, 15.8) * k]);
        const l1 = vis(t, 11.8, 14.6) * k, l2 = vis(t, 14.4, 18.6) * k;
        o += on(l1, lb(480, 226, 'sopra per sopra, sotto per sotto', { op: l1 })) + on(l2, lb(480, 316, 'dividi sopra e sotto per 2', { op: l2 }));
      }

      /* capitoli 2 e 3: il quadrettato 10 × 10, prima per i clienti, poi per i prezzi */
      const s2 = p(t, 19.4, 20.4);
      if (s2 > 0.004) {
        const ua = p(t, 21.6, 22.8), ub = p(t, 24.2, 25.4), f2 = 1 - p(t, 32.2, 33), d1 = p(t, 34.6, 35.8), d2 = p(t, 38.4, 39.6), d3 = p(t, 41.6, 42.6);
        const pu = bump(t, 46, 1.6) + bump(t, 48.4, 1.6);
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            const x = G2.x + j * G2.s + 1, y = G2.y + i * G2.s + 1, c = G2.s - 2;
            const gone1 = j >= 8 ? d1 : 0, gone2 = i === 9 && j < 8 ? d2 : 0;
            let b = rect(x, y, c, c, { rx: 3, fill: C.paper, stroke: C.soft, sw: 1.2, op: 1 - 0.45 * Math.max(gone1, gone2) });
            if (j < 3) b += rect(x, y, c, c, { rx: 3, fill: C.A, fo: 0.25 * ua * f2 });
            if (j < 3 && i < 4) b += rect(x, y, c, c, { rx: 3, fill: C.hi, fo: 0.6 * ub * f2, stroke: C.hi, so: ub * f2, sw: 1.8 });
            if (gone1) b += rect(x, y, c, c, { rx: 3, fill: C.A, fo: 0.3 * gone1 });
            if (gone2) b += rect(x, y, c, c, { rx: 3, fill: C.B, fo: 0.3 * gone2 });
            if (j < 8 && i < 9 && d3 > 0.01) b += rect(x, y, c, c, { rx: 3, fill: C.hi, fo: 0.4 * d3 * (1 + 0.5 * pu), stroke: C.hi, so: 0.7 * d3, sw: 1.2 });
            o += g({ op: s2 }, b);
          }
        }
        /* capitolo 2: graffe e conti */
        const g2 = vis(t, 21.8, 32.4) * s2, g3 = vis(t, 24.4, 32.4) * s2, c0 = vis(t, 20.4, 32.4) * s2;
        o += on(g2, g({ op: g2 }, brace(G2.x + 1, G2.x + 3 * G2.s - 1, G2.y - 6, C.A, 1, -1) + tx(G2.x + 1.5 * G2.s, G2.y - 16, '30%', { size: 22, fill: C.A })));
        o += on(g3, g({ op: g3 }, lbrace(G2.x - 8, G2.y + 1, G2.y + 4 * G2.s - 1, C.B) + tx(G2.x - 38, G2.y + 2 * G2.s + 7, '40%', { size: 22, fill: C.B })));
        o += on(c0, lb(G2.x + 5 * G2.s, G2.y + 10 * G2.s + 28, 'un quadratino = 10 clienti', { op: c0 }));
        const e1 = vis(t, 22.8, 32.4) * s2, e2 = vis(t, 25.2, 32.4) * s2, e3 = vis(t, 26.6, 32.4) * s2, e4 = vis(t, 29, 32.4) * s2;
        o += on(e1, tx(470, 150, '30% di 1 000 = 300', { size: 24, fill: C.A, op: e1 }));
        o += on(e2, tx(470, 196, '40% di 300 = 120', { size: 24, op: e2 }));
        o += on(e3, tx(470, 262, '0,4 × 0,3 = 0,12', { size: 30, op: e3 }));
        o += on(e4, tx(470, 306, '= 12% dei clienti', { size: 26, op: e4 }));

        /* capitolo 3: i prezzi, le due fette scontate, il resto */
        const pr = [[32.8, 118, '100 €'], [36.2, 202, '80 €'], [40.2, 286, '72 €']];
        pr.forEach(([a, y, s]) => {
          const op = vis(t, a, 58, 0.5, 0.01) * s2;
          o += on(op, tx(470, y, s, { size: 34, op }));
        });
        const a1 = vis(t, 34.2, 58, 0.5, 0.01) * s2, a2 = vis(t, 38, 58, 0.5, 0.01) * s2;
        o += on(a1, g({ op: a1 }, tx(470, 166, '↓ sconto del 20%: × 0,8', { ff: SANS, size: 17, fill: C.A }) ));
        o += on(a2, g({ op: a2 }, tx(470, 250, '↓ sconto del 10% di 80 €: × 0,9', { ff: SANS, size: 17, fill: C.B })));
        const lab = vis(t, 36, 58, 0.5, 0.01) * s2 * d1, lab2 = vis(t, 40, 58, 0.5, 0.01) * s2 * d2, lab3 = vis(t, 42.4, 58, 0.5, 0.01) * s2;
        o += on(lab, tx(G2.x + 9 * G2.s, G2.y + 5 * G2.s + 7, '20', { size: 20, op: lab }));
        o += on(lab2, tx(G2.x + 4 * G2.s, G2.y + 9.5 * G2.s + 6, '8', { size: 17, op: lab2 }));
        o += on(lab3, tx(G2.x + 4 * G2.s, G2.y + 4.5 * G2.s + 12, '72', { size: 38, op: lab3 }));
        o += pills(334, [{ s: '0,8 × 0,9 = 0,72: sconto 28%', icon: 'ok', col: OK, op: vis(t, 41.2, 58, 0.5, 0.01) * s2, u: p(t, 41.5, 42.1, E.lin) }], 470);
        o += pills(334, [{ s: '20% + 10% = 30%\u00a0\u00a0\u00a0', icon: 'no', col: NO, op: vis(t, 43.6, 47.8) * s2, u: p(t, 43.9, 44.5, E.lin) }], 150);
        const an = vis(t, 48, 58, 0.5, 0.01) * s2;
        o += on(an, g({ op: an }, brace(G2.x + 1, G2.x + 8 * G2.s - 1, G2.y + 10 * G2.s + 6, C.B, 1) + lb(G2.x + 4 * G2.s, 334, 'il 10% è di 80 €, non di 100 €')));
      }
      return o;
    },
  });

  /* ======================================================================
     0.3 · Il logaritmo: quanti tentativi servono? (1/6 a tentativo, almeno un successo con probabilità 0,9)
     ====================================================================== */
  const CX = 66, CB = 312, CH = 190, CP = 22; // grafico: sinistra, base, altezza (probabilità 1) e passo delle colonne
  const pn = (n) => 1 - (5 / 6) ** n; // probabilità di riuscire almeno una volta in n tentativi
  const AXL = 70; // margine sinistro delle righe di algebra
  const NB = ' ';

  PV.add('logaritmo', {
    sec: '0.3',
    short: 'Quanti tentativi servono?',
    title: 'Il logaritmo: quanti tentativi servono per riuscire almeno una volta?',
    alt: 'Animazione: ogni tentativo riesce con probabilità 1/6. La probabilità di riuscire almeno una volta in n tentativi è 1 − (5/6)^n e deve essere almeno 0,9, cioè (5/6)^n ≤ 0,1. Il grafico mostra che con 12 tentativi si ha 0,888 e con 13 si ha 0,907. Il logaritmo risolve il conto: n ln(5/6) ≤ ln 0,1, e dividendo per il numero negativo ln(5/6) il verso si inverte, n ≥ 12,63: servono 13 tentativi.',
    dur: 58,
    poster: 22,
    chap: [[0, 'Il problema'], [9, 'Almeno una volta'], [23, 'Per tentativi'], [29, 'Il logaritmo'], [45, 'Controllo e verso']],
    caps: [
      [0, 'Ogni tentativo riesce con probabilità 1/6, come far uscire un 6. Quanti ne servono per riuscire almeno una volta con probabilità 0,9?'],
      [9, 'Con *n* tentativi, non riuscire mai ha probabilità (5/6)*^n*. Riuscire almeno una volta: 1 − (5/6)*^n*.'],
      [15.5, 'Vogliamo 1 − (5/6)*^n* ≥ 0,9, cioè (5/6)*^n* ≤ 0,1: la probabilità di non riuscire mai deve scendere sotto 0,1.'],
      [23, 'Per tentativi: con 12 si ha 0,888, ancora sotto 0,9. Con 13 si ha 0,907: ci siamo.'],
      [29, 'Il logaritmo dà la risposta in un passaggio: prendiamo ln di entrambi i lati e l’esponente scende davanti: *n* ln(5/6) ≤ ln 0,1.'],
      [37.5, 'Ora dividiamo per ln(5/6) = −0,1823, che è negativo: il verso si inverte. *n* ≥ (−2,3026)/(−0,1823) ≈ 12,63.'],
      [45, 'Quindi servono 13 tentativi. Controllo: con 12 si arriva a 0,888, con 13 a 0,907, che supera 0,9.'],
      [52, 'Un errore comune: dimenticare di invertire il verso quando si divide per un numero negativo.'],
    ],
    frame(t) {
      let o = '';
      o += heading(t, 0.2, 28.8, 'Quanti tentativi servono?') + subline(t, 0.4, 8.8, 'ogni tentativo riesce con probabilità 1/6') + subline(t, 9.2, 22.6, 'riuscire almeno una volta: 1 − (5/6)*^n*') + subline(t, 23, 28.6, 'per tentativi: 12 non bastano, 13 sì');
      o += heading(t, 29.2, 58.5, 'Il logaritmo «tira giù» l’esponente');

      /* capitolo 1: sei tentativi, l'ultimo riesce */
      const d1 = 1 - p(t, 8.6, 9.4);
      if (d1 > 0.004) {
        [2, 5, 3, 1, 4, 6].forEach((n, i) => {
          const t0 = 1 + 0.95 * i, x = 100 + 88 * i, a = p(t, t0, t0 + 0.6, E.back), rot = 70 * (1 - p(t, t0, t0 + 0.9)) * (i % 2 ? -1 : 1), win = n === 6 ? p(t, t0 + 0.9, t0 + 1.5) : 0;
          o += die(x, 168, 56, n, { sc: lerp(0.3, 1, a), rot, op: p(t, t0, t0 + 0.25) * d1 });
          if (win > 0.01) o += rect(x - 34, 134, 68, 68, { rx: 12, stroke: C.hi, sw: 3.6, so: win * d1 });
          const mu = p(t, t0 + 0.9, t0 + 1.5, E.lin) * d1;
          o += n === 6 ? check(x, 236, 26, mu, { op: d1 }) : cross(x, 236, 24, mu, { op: d1 });
        });
        const q1 = vis(t, 6.4, 8.8) * d1;
        o += on(q1, tx(320, 304, 'quanti tentativi per riuscire almeno una volta?', { size: 24, op: q1 }));
      }

      /* capitoli 2 e 3: le colonne di 1 − (5/6)^n, la soglia 0,9, il confronto fra 12 e 13 */
      const ch = p(t, 9.4, 10.2) * (1 - p(t, 28.6, 29.4));
      if (ch > 0.004) {
        o += path(`M${CX - 6} ${CB}H${CX + 16 * CP + 4}`, { stroke: C.soft, sw: 1.6, op: ch });
        const th = p(t, 15.4, 16.6, E.io), y9 = CB - 0.9 * CH, hl = vis(t, 23.2, 29, 0.5, 0.4);
        for (let n = 1; n <= 16; n++) {
          const u = p(t, 10.4 + 0.18 * n, 11.4 + 0.18 * n, E.out), h = pn(n) * CH * u, x = CX + (n - 1) * CP + 3, big = n >= 13 ? p(t, 16.8, 17.8) : 0;
          let b = rect(x, CB - h, 16, h, { rx: 2, fill: C.A, fo: 0.35 * (1 - big), stroke: C.A, so: 1 - big, sw: 1.6 });
          if (big > 0.01) b += rect(x, CB - h, 16, h, { rx: 2, fill: C.hi, fo: 0.45 * big, stroke: C.hi, so: big, sw: 1.6 });
          if ((n === 12 || n === 13) && hl > 0.01) b += rect(x - 3, CB - h - 3, 22, h + 3, { rx: 4, stroke: n === 12 ? C.B : C.hi, sw: 3, so: hl });
          o += g({ op: ch }, b);
          o += on(u, lb(x + 8, CB + 21, n, { op: u * ch }));
        }
        o += on(th, path(`M${CX - 6} ${y9}H${CX + 16 * CP + 4}`, { stroke: C.hi, sw: 2.4, da: '7 5', op: ch, ...draw(th) }));
        o += on(th, tx(CX - 22, y9 + 6, '0,9', { size: 17, ff: SANS, fill: C.soft, op: th * ch }));
        const fa = vis(t, 10.6, 22.6), fb = vis(t, 12.4, 22.6), fc = vis(t, 15.8, 22.6);
        o += on(fa, lb(535, 128, 'mai un successo', { op: fa }) + tx(535, 160, '(5/6)*^n*', { size: 28, op: fa }));
        o += on(fb, lb(535, 214, 'almeno un successo', { op: fb }) + tx(535, 246, '1 − (5/6)*^n*', { size: 28, op: fb }));
        o += on(fc, tx(535, 296, '≥ 0,9', { size: 30, op: fc }));
        o += pills(168, [{ s: '12: 0,888 < 0,9', icon: 'no', col: NO, op: vis(t, 23.6, 29, 0.5, 0.4), u: p(t, 23.9, 24.5, E.lin) }], 535);
        o += pills(216, [{ s: '13: 0,907 ≥ 0,9', icon: 'ok', col: OK, op: vis(t, 25.4, 29, 0.5, 0.4), u: p(t, 25.7, 26.3, E.lin) }], 535);
      }

      /* capitoli 4 e 5: l'algebra, riga per riga */
      const al = p(t, 29.2, 30);
      if (al > 0.004) {
        const fs = 30, r1 = p(t, 29.6, 30.4) * al, r2 = p(t, 31, 31.8) * al, u = p(t, 33.6, 35.6, E.io), r3 = p(t, 36.2, 37) * al, r4 = p(t, 38.4, 39.2) * al;
        o += on(r1, tx(AXL, 118, '(5/6)*^n* ≤ 0,1', { size: fs, ta: 'start', op: r1 }));
        /* riga 2: ln di entrambi i lati, poi l'esponente n vola davanti */
        const y2 = 172, xp1 = lerp(AXL, 106, u), xp2 = lerp(189, 213, u), [nx, ny] = arc(178, y2 - 11, AXL, y2, u, 34);
        o += on(r2, g({ op: r2 }, tx(xp1, y2, 'ln (5/6)', { size: fs, ta: 'start' }) + tx(xp2, y2, NB + '≤' + NB + 'ln' + NB + '0,1', { size: fs, ta: 'start' }) + tx(nx, ny, '*n*', { size: lerp(21, fs, u), ta: 'start', fill: u < 0.97 ? C.hi : C.ink }) + on(p(u, 0.6, 1), tx(91, y2, '·', { size: fs, ta: 'start', op: p(u, 0.6, 1) }))));
        const n1 = vis(t, 31.2, 34), n2 = vis(t, 34.4, 37);
        o += on(n1, lb(535, 164, 'ln è crescente:', { op: n1 }) + lb(535, 186, 'il verso resta', { op: n1 }));
        o += on(n2, lb(535, 164, 'l’esponente scende', { op: n2 }) + lb(535, 186, 'davanti al logaritmo', { op: n2 }));
        o += on(r3, tx(AXL, 226, '*n* · (−0,1823) ≤ −2,3026', { size: fs, ta: 'start', op: r3 }));
        const n3 = vis(t, 36.4, 45, 0.5, 0.45);
        o += on(n3, lb(535, 214, 'ln(5/6) = −0,1823', { op: n3 }) + lb(535, 236, 'ln 0,1 = −2,3026', { op: n3 }));
        /* riga 4: dividere per un negativo, il segno si ribalta */
        const y4 = 290, rot = 180 * p(t, 39.6, 40.8, E.back), flip = 1 + 0.25 * bump(t, 52.6, 1.6);
        o += on(r4, g({ op: r4 }, tx(AXL, y4, '*n*', { size: fs, ta: 'start' }) + g({ tf: `translate(106 ${y4 - 9}) rotate(${(rot >= 179.9 ? 0 : rot).toFixed(2)}) scale(${flip.toFixed(3)})` }, tx(0, 9, rot >= 179.9 ? '≥' : '≤', { size: fs, fill: C.hi })) + fr(186, y4 - 4, '−2,3026', '−0,1823', { size: 26 })));
        const r5 = p(t, 42, 42.8) * al;
        o += on(r5, tx(256, y4 + 5, '≈ 12,63', { size: fs, ta: 'start', op: r5 }));
        const n4 = vis(t, 39.4, 45.4, 0.5, 0.45);
        o += on(n4, lb(535, 282, 'dividere per un negativo', { op: n4 }) + lb(535, 304, 'inverte il verso', { op: n4 }));
        /* conclusione: 13 tentativi, controllo con 12 e 13 */
        const c1 = p(t, 45.2, 46.2, E.back);
        o += on(c1, tx(535, 156, '13', { size: 56, fill: C.hi, op: p(t, 45.2, 45.8) }) + lb(535, 184, 'tentativi', { op: p(t, 45.6, 46.2) }));
        const k1 = vis(t, 46.8, 58.5, 0.5, 0.01), k2 = vis(t, 48.4, 58.5, 0.5, 0.01);
        o += pills(336, [{ s: 'con 12: 0,888 < 0,9', icon: 'no', col: NO, op: k1, u: p(t, 47.1, 47.7, E.lin) }, { s: 'con 13: 0,907 ≥ 0,9', icon: 'ok', col: OK, op: k2, u: p(t, 48.7, 49.3, E.lin) }]);
      }
      return o;
    },
  });

  /* ======================================================================
     0.4 · Le due regole di base: «e» moltiplica, «oppure» somma
     ====================================================================== */
  const DG = { x: 96, y: 120, s: 30 }; // la griglia delle coppie di dadi (6 × 6)
  const MUL = (n) => n % 2 === 0 || n % 3 === 0; // multiplo di 2 o di 3

  PV.add('regole', {
    sec: '0.4',
    short: '«E» moltiplica, «oppure» somma',
    title: 'Le due regole di base: «e» moltiplica, «oppure» somma',
    alt: 'Animazione: con due dadi, 6 modi per il primo e per ciascuno 6 per il secondo, 6 × 6 = 36 coppie; con tre dadi 6 × 6 × 6 = 216. Poi una password di 4 oppure di 5 cifre: 10^4 + 10^5 = 110 000, perché i due gruppi sono disgiunti. Se i gruppi si sovrappongono, come i multipli di 2 o di 3 fra 1 e 20, i casi comuni vanno tolti una volta: 10 + 6 − 3 = 13.',
    dur: 57.5,
    poster: 28,
    chap: [[0, 'La parola «e»'], [19, 'La parola «oppure»'], [38, 'Se si sovrappongono']],
    caps: [
      [0, 'Quasi ogni conteggio usa due regole. La prima è la parola «e»: scelte in fila si moltiplicano.'],
      [6.5, 'Due dadi: 6 modi per il primo e, per ciascuno, 6 per il secondo. Le coppie sono 6 × 6 = 36.'],
      [13, 'Tre dadi: per ognuna delle 36 coppie, 6 modi per il terzo. In tutto 6 × 6 × 6 = 216.'],
      [19, 'La seconda regola è «oppure»: se due casi sono alternativi e non si sovrappongono, i modi si sommano.'],
      [26, 'Una password di 4 oppure di 5 cifre: 10^4 + 10^5 = 10 000 + 100 000 = 110 000.'],
      [31.5, 'Si somma solo se i gruppi sono disgiunti: una password non può avere insieme 4 e 5 cifre.'],
      [38, 'Attenzione se si sovrappongono. Fra 1 e 20, i multipli di 2 sono 10 e quelli di 3 sono 6.'],
      [44, 'Ma 6, 12 e 18 stanno in tutti e due e sono contati due volte: la risposta è 10 + 6 − 3 = 13, non 16.'],
      [51, 'Moltiplicare per «e», sommare per «oppure»; e per la somma controlla che i gruppi siano disgiunti.'],
    ],
    frame(t) {
      let o = '';
      o += heading(t, 0.2, 18.8, 'La parola «e»: si moltiplica', 'scelte in fila');
      o += heading(t, 19.4, 38, 'La parola «oppure»: si somma', 'casi alternativi, che non si sovrappongono');
      o += heading(t, 38.4, 50.8, 'Se i gruppi si sovrappongono', 'fra 1 e 20: multipli di 2 oppure di 3');
      o += heading(t, 51.4, 58.5, 'In breve');

      /* capitolo 1: «e» → ×, la griglia dei due dadi, poi il terzo dado come strati */
      const i1 = vis(t, 0.4, 6.4);
      o += on(i1, tx(210, 196, '«e»', { size: 70, op: i1 }) + tx(320, 190, '→', { size: 54, fill: C.soft, op: i1 }) + tx(430, 200, '×', { size: 84, fill: C.A, op: i1 }) + lb(320, 254, 'scelte in fila: si moltiplicano', { size: 20, op: i1 }));
      const g1 = p(t, 6.6, 7.2) * (1 - p(t, 18.6, 19.2));
      if (g1 > 0.004) {
        for (let k = 5; k >= 1; k--) {
          const a = p(t, 13.6 + 0.6 * (k - 1), 14.4 + 0.6 * (k - 1)) * g1;
          o += on(a, g({ op: a }, rect(DG.x + 10 * k, DG.y + 10 * k, 180, 180, { rx: 6, fill: C.paper, stroke: C.soft, sw: 1.6 }) + path(gridLines(DG.x + 10 * k, DG.y + 10 * k, 6, 30), { stroke: C.soft, sw: 1, op: 0.5 })));
        }
        for (let j = 0; j < 6; j++) {
          const t1 = 7 + 0.15 * j, a = p(t, t1, t1 + 0.5, E.back);
          o += die(DG.x + 15 + 30 * j, DG.y - 18, 24, j + 1, { sc: lerp(0.3, 1, a), op: p(t, t1, t1 + 0.25) * g1, stroke: C.A });
          const t2 = 8.4 + 0.1 * j, b = p(t, t2, t2 + 0.5, E.back);
          o += die(DG.x - 18, DG.y + 15 + 30 * j, 24, j + 1, { sc: lerp(0.3, 1, b), op: p(t, t2, t2 + 0.25) * g1, stroke: C.B });
          for (let i = 0; i < 6; i++) {
            const tc = 8.4 + 0.7 * j + 0.08 * i, c = p(t, tc, tc + 0.4, E.back), x = DG.x + 30 * j + 2, y = DG.y + 30 * i + 2;
            o += on(c, g({ op: p(t, tc, tc + 0.2) * g1, tf: T(x + 13, y + 13, lerp(0.4, 1, c)) }, rect(-13, -13, 26, 26, { rx: 5, fill: C.paper, stroke: C.soft, sw: 1.6 }) + rect(-13, -13, 26, 26, { rx: 5, fill: C.A, fo: 0.14 })));
          }
        }
        const a1 = vis(t, 7, 12.6), a2 = vis(t, 9.2, 12.6), a3 = vis(t, 11.6, 18.6), b1 = vis(t, 13.4, 18.6), b2 = vis(t, 15.8, 18.6), b3 = vis(t, 16.4, 18.6);
        o += on(a1, lb(480, 150, 'primo dado: 6 modi', { op: a1 }));
        o += on(a2, lb(480, 180, 'per ciascuno, secondo dado: 6', { op: a2 }));
        o += on(a3, tx(480, 250, '6 × 6 = 36', { size: 44, op: a3 }));
        o += on(b1, lb(480, 150, 'per ognuna delle 36 coppie,', { op: b1 }));
        o += on(b2, lb(480, 180, 'terzo dado: 6 modi', { op: b2 }));
        o += on(b3, tx(480, 320, '6 × 6 × 6 = 216', { size: 36, op: b3 }));
      }

      /* capitolo 2: password di 4 oppure 5 cifre, due barre che si sommano, due gruppi disgiunti */
      [[134, 4, 'di 4 cifre', '10*^4* = 10 000', 20.4], [204, 5, 'di 5 cifre', '10*^5* = 100 000', 23]].forEach(([y, n, lab, val, t0]) => {
        const op = vis(t, t0, 31.6);
        for (let k = 0; k < n; k++) {
          const tk = t0 + 0.4 + 0.18 * k, c = p(t, tk, tk + 0.4, E.back);
          o += on(c * op, g({ op, tf: T(190 + 54 * k, y, lerp(0.4, 1, c)) }, rect(-23, -23, 46, 46, { rx: 8, fill: C.paper, stroke: n === 4 ? C.A : C.B, sw: 2 }) + tx(0, 7, '10', { size: 20 })));
        }
        o += on(op, lb(118, y + 6, lab, { op }));
        const vv = vis(t, t0 + 1.6, 31.6);
        o += on(vv, tx(440, y + 8, val, { size: 22, ta: 'start', op: vv }));
      });
      const bs = p(t, 26.6, 27.6) * (1 - p(t, 37.4, 38));
      if (bs > 0.004) {
        const wa = 44 * p(t, 26.8, 27.6), wb = 440 * p(t, 27.4, 29, E.io), tt = p(t, 29.2, 30);
        o += rect(60, 292, wa, 20, { rx: 3, fill: C.A, fo: 0.4 * bs, stroke: C.A, so: bs, sw: 1.8 }) + rect(104, 292, wb, 20, { rx: 3, fill: C.B, fo: 0.4 * bs, stroke: C.B, so: bs, sw: 1.8 });
        o += on(wa > 20 ? bs : 0, lb(82, 336, '10 000', { op: bs })) + on(wb > 200 ? bs : 0, lb(324, 336, '100 000', { op: bs }));
        o += on(tt * bs, g({ op: tt * bs }, brace(60, 544, 286, C.ink, 1, -1) + tx(302, 266, '110 000', { size: 28 })));
      }
      const ds = vis(t, 32, 38, 0.6, 0.5);
      o += on(ds, g({ op: ds }, rect(100, 94, 180, 104, { rx: 16, fill: C.A, fo: 0.1, stroke: C.A, sw: 2.4 }) + rect(360, 94, 180, 104, { rx: 16, fill: C.B, fo: 0.1, stroke: C.B, sw: 2.4 }) + lb(190, 124, 'password di', { fill: C.ink }) + lb(190, 145, '4 cifre', { fill: C.ink }) + tx(190, 182, '10 000', { size: 26 }) + lb(450, 124, 'password di', { fill: C.ink }) + lb(450, 145, '5 cifre', { fill: C.ink }) + tx(450, 182, '100 000', { size: 26 }) + tx(320, 152, '∩ = ∅', { size: 24 })));
      o += pills(222, [{ s: 'disgiunti: si somma', icon: 'ok', col: OK, op: vis(t, 34, 38, 0.5, 0.5), u: p(t, 34.3, 34.9, E.lin) }]);

      /* capitolo 3: i numeri da 1 a 20, multipli di 2 e di 3 */
      const nm = p(t, 38.6, 39.4) * (1 - p(t, 50.8, 51.4));
      if (nm > 0.004) {
        for (let n = 1; n <= 20; n++) {
          const x = 122 + 44 * ((n - 1) % 10), y = n <= 10 ? 130 : 180, a = p(t, 38.6 + 0.04 * n, 39.2 + 0.04 * n, E.back);
          const h2 = n % 2 === 0 ? p(t, 39.6 + 0.08 * (n / 2), 40.2 + 0.08 * (n / 2)) : 0, h3 = n % 3 === 0 ? p(t, 41.4 + 0.12 * (n / 3), 42 + 0.12 * (n / 3)) : 0, both = n % 6 === 0 ? bump(t, 44.4, 2) : 0;
          o += tile(x, y, 36, n, { sc: lerp(0.3, 1, a) * (1 + 0.12 * both), op: p(t, 38.6 + 0.04 * n, 39 + 0.04 * n) * nm, ring: h2 > 0.01 ? C.A : h3 > 0.01 ? C.B : undefined, ro: h2 > 0.01 ? h2 : h3, veil: h2 > 0.01 ? C.A : C.B, vo: 0.16 * (h2 > 0.01 ? h2 : h3), size: 18 });
          if (h2 > 0.01 && h3 > 0.01) o += g({ tf: T(x, y, 1 + 0.12 * both), op: h3 * nm }, rect(-12, -12, 24, 24, { rx: 4, stroke: C.B, sw: 2.5 }));
          if (both > 0.01) o += g({ tf: T(x, y, 1 + 0.12 * both), op: both * nm }, rect(-20, -20, 40, 40, { rx: 8, stroke: C.hi, sw: 3.4 }));
        }
        const c2 = vis(t, 40.4, 50.8), c3 = vis(t, 42.4, 50.8), cc = vis(t, 44.6, 50.8);
        o += pills(250, [{ s: 'multipli di 2: 10', col: C.A, op: c2 }, { s: 'multipli di 3: 6', col: C.B, op: c3 }]);
        o += on(cc, lb(320, 222, '6, 12 e 18: contati due volte', { op: cc }));
        o += pills(312, [{ s: '10 + 6 = 16', icon: 'no', col: NO, op: vis(t, 46.4, 50.8), u: p(t, 46.7, 47.3, E.lin) }, { s: '10 + 6 − 3 = 13', icon: 'ok', col: OK, op: vis(t, 48.4, 50.8), u: p(t, 48.7, 49.3, E.lin) }]);
      }

      /* riepilogo */
      const rs = vis(t, 51.6, 58.5, 0.6, 0.01), r2 = vis(t, 53.4, 58.5, 0.6, 0.01), r3 = vis(t, 55, 58.5, 0.6, 0.01);
      o += on(rs, tx(320, 152, '«e»  →  moltiplica', { size: 40, fill: C.A, op: rs }));
      o += on(r2, tx(320, 228, '«oppure»  →  somma', { size: 40, fill: C.B, op: r2 }));
      o += on(r3, lb(320, 288, 'se i gruppi sono disgiunti', { size: 20, op: r3 }));
      return o;
    },
  });

  /* ======================================================================
     0.4 · Le due domande che scelgono la formula: l'ordine conta? si può ripetere?
     ====================================================================== */
  /* linguetta con un nome (persona); x,y = centro */
  const chip = (x, y, label, col, op = 1) => {
    const w = 26 + label.length * 9.6;
    return g({ op }, rect(x - w / 2, y - 15, w, 30, { rx: 15, fill: C.paper, stroke: col, sw: 2.2 }) + tx(x, y + 6, label, { size: 18 }));
  };
  /* podio con tre gradini: oro al centro, argento a sinistra, bronzo a destra; cx = centro, base a y = 284 */
  const podium = (cx, op) => {
    const st = [[-70, 48, 'argento', '2'], [0, 76, 'oro', '1'], [70, 28, 'bronzo', '3']];
    return g({ op }, st.map(([dx, h, name, n]) => rect(cx + dx - 35, 284 - h, 70, h, { rx: 6, fill: C.paper, stroke: C.soft, sw: 1.8 }) + tx(cx + dx, 284 - h / 2 + 8, n, { size: 22, fill: C.soft }) + lb(cx + dx, 304, name)).join(''));
  };
  const COLS = [[158, 388], [396, 626]], ROWS = [[138, 236], [244, 342]]; // la tabella 2 × 2: colonne (ripetizione sì / no) e righe (ordine sì / no)

  PV.add('ordine', {
    sec: '0.4',
    short: 'Le due domande',
    title: 'Le due domande che scelgono la formula: l’ordine conta? si può ripetere?',
    alt: 'Animazione: per scegliere la formula di un conteggio ci si fa due domande. L’ordine conta? Con il test dello scambio: sul podio Anna oro e Bruno argento è diverso da Bruno oro e Anna argento, in una commissione {Anna, Bruno} è lo stesso gruppo di {Bruno, Anna}. Lo stesso oggetto può comparire più volte? Un PIN può essere 1111, su un podio la stessa persona non può prendere due medaglie. Le risposte scelgono la casella di una tabella: n^k, n!/(n−k)!, C(n+k−1, k), C(n, k), con un esempio per casella.',
    dur: 59.5,
    poster: 57,
    chap: [[0, 'Due domande'], [5.4, 'L’ordine conta?'], [23.4, 'Si può ripetere?'], [34.8, 'La tabella']],
    caps: [
      [0, 'Non cercare la formula a memoria: fatti due domande, saranno loro a sceglierla.'],
      [5.4, 'Prima: l’ordine conta? Test dello scambio: scambia due elementi e guarda se il caso cambia.'],
      [11.6, 'Podio: Anna oro e Bruno argento è diverso da Bruno oro e Anna argento. L’ordine conta.'],
      [17.6, 'Commissione: {Anna, Bruno} è lo stesso gruppo di {Bruno, Anna}. L’ordine non conta.'],
      [23.4, 'Seconda: lo stesso oggetto può comparire più volte? Un PIN può essere 1111: ripetizione sì.'],
      [29.7, 'Su un podio la stessa persona non può avere due medaglie: ripetizione no.'],
      [34.8, 'Le due risposte scelgono la casella: ordine sì o no, ripetizione sì o no.'],
      [39.9, 'Ordine sì e ripetizione sì: *n**^k*, come un PIN di 4 cifre, 10^4 = 10 000.'],
      [45.1, 'Ordine sì, ripetizione no: *n*!/(*n* − *k*)!, come il podio di 8: 8 × 7 × 6 = 336.'],
      [50.6, 'Ordine no, ripetizione sì: le ciambelle, 5 fra 3 gusti, sono 21.'],
      [55.1, 'Ordine no, ripetizione no: la commissione di 3 su 8, 56.'],
    ],
    frame(t) {
      let o = '';
      o += heading(t, 0.2, 5.2, 'Due domande', 'invece di imparare le formule a memoria');
      o += heading(t, 5.6, 23, 'L’ordine conta?', 'il test dello scambio');
      o += heading(t, 23.6, 34.6, 'Lo stesso oggetto può ripetersi?', 'un PIN sì, una medaglia no');
      o += heading(t, 35, 59.5, 'La tabella dei conteggi', 'scegliere *k* oggetti fra *n*');

      /* capitolo 1: le due domande */
      const q = [[1.2, 180, 'L’ordine conta?', C.A], [2.8, 460, 'Si può ripetere?', C.B]];
      q.forEach(([t0, x, s, col]) => {
        const a = lerp(0.6, 1, p(t, t0, t0 + 0.6, E.back)), op = p(t, t0, t0 + 0.3) * (1 - p(t, 4.8, 5.4));
        o += on(op, g({ op, tf: T(x, 190, a) }, rect(-120, -50, 240, 100, { rx: 16, fill: C.paper, stroke: col, sw: 2.6 }) + rect(-120, -50, 240, 100, { rx: 16, fill: col, fo: 0.1 }) + tx(0, 9, s, { size: 26 })));
      });

      /* capitolo 2: il test dello scambio, sul podio e in una commissione */
      const pd = p(t, 5.8, 6.6) * (1 - p(t, 23.2, 23.8));
      if (pd > 0.004) {
        o += podium(165, pd);
        const sw = p(t, 8, 10, E.io), [ax, ay] = arc(165, 188, 95, 216, sw, 30), [bx, by] = arc(95, 216, 165, 188, sw, 30);
        o += chip(ax, ay, 'Anna', C.A, pd) + chip(bx, by, 'Bruno', C.B, pd);
        const l1 = vis(t, 7, 23.2), l2 = vis(t, 10.4, 23.2), l3 = vis(t, 10.8, 23.2);
        o += on(l1, lb(165, 102, 'Anna oro, Bruno argento', { op: l1 })) + on(l2, tx(165, 134, '≠', { size: 28, op: l2 })) + on(l3, lb(165, 160, 'Bruno oro, Anna argento', { op: l3 }));
        o += pills(338, [{ s: 'l’ordine conta', icon: 'ok', col: OK, op: vis(t, 12, 23.2), u: p(t, 12.3, 12.9, E.lin) }], 165);
      }
      const cm = p(t, 17.8, 18.6) * (1 - p(t, 23.2, 23.8));
      if (cm > 0.004) {
        const sw = p(t, 19.4, 21.4, E.io), [ax, ay] = arc(430, 232, 520, 232, sw, -20), [bx, by] = arc(520, 232, 430, 232, sw, 20);
        o += g({ op: cm }, rect(380, 196, 190, 76, { rx: 16, fill: C.hi, fo: 0.1, stroke: C.soft, sw: 2 }) + lb(475, 188, 'commissione'));
        o += chip(ax, ay, 'Anna', C.A, cm) + chip(bx, by, 'Bruno', C.B, cm);
        const l1 = vis(t, 18.4, 23.2), l2 = vis(t, 21.6, 23.2), l3 = vis(t, 22, 23.2);
        o += on(l1, tx(475, 108, '{Anna, Bruno}', { size: 22, op: l1 })) + on(l2, tx(475, 136, '=', { size: 28, op: l2 })) + on(l3, tx(475, 164, '{Bruno, Anna}', { size: 22, op: l3 }));
        o += pills(338, [{ s: 'l’ordine non conta', icon: 'no', col: NO, op: vis(t, 21.8, 23.2), u: p(t, 22.1, 22.7, E.lin) }], 475);
      }

      /* capitolo 3: la ripetizione, un PIN sì e un podio no */
      const rp = p(t, 24, 24.8) * (1 - p(t, 34.4, 35));
      if (rp > 0.004) {
        o += on(rp, lb(165, 150, 'PIN: 1 1 1 1', { op: rp, fill: C.ink }));
        for (let k = 0; k < 4; k++) {
          const tk = 24.6 + 0.25 * k, c = p(t, tk, tk + 0.4, E.back);
          o += on(c, g({ op: rp, tf: T(87 + 52 * k, 214, lerp(0.4, 1, c)) }, rect(-22, -22, 44, 44, { rx: 8, fill: C.paper, stroke: C.A, sw: 2 }) + tx(0, 8, '1', { size: 24 })));
        }
        o += pills(338, [{ s: 'ripetizione sì', icon: 'ok', col: OK, op: vis(t, 26.6, 34.6) * rp, u: p(t, 26.9, 27.5, E.lin) }], 165);
        o += podium(475, rp * p(t, 29.6, 30.4));
        const pa = p(t, 30.4, 31.2) * rp;
        o += chip(475, 188, 'Anna', C.A, pa) + chip(405, 216, 'Anna', C.A, pa);
        o += on(pa, cross(405, 216, 34, p(t, 32, 32.8, E.lin), { op: rp }));
        o += pills(338, [{ s: 'ripetizione no', icon: 'no', col: NO, op: vis(t, 32.4, 34.6) * rp, u: p(t, 32.7, 33.3, E.lin) }], 475);
      }

      /* capitolo 4: la tabella 2 × 2, una casella per volta */
      const tb = p(t, 35.2, 36);
      if (tb > 0.004) {
        const hs = [['ripetizione sì', 36.2], ['ripetizione no', 36.6]], rs = [['ordine sì', 37], ['ordine no', 37.4]];
        hs.forEach(([s, t0], k) => { const op = p(t, t0, t0 + 0.5) * tb; o += on(op, tx((COLS[k][0] + COLS[k][1]) / 2, 120, s, { size: 20, fill: C.B, op })); });
        rs.forEach(([s, t0], k) => { const op = p(t, t0, t0 + 0.5) * tb; o += on(op, tx(90, (ROWS[k][0] + ROWS[k][1]) / 2 + 7, s, { size: 20, fill: C.A, op })); });
        for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) o += rect(COLS[c][0], ROWS[r][0], COLS[c][1] - COLS[c][0], ROWS[r][1] - ROWS[r][0], { rx: 12, stroke: C.soft, sw: 1.4, da: '5 5', op: 0.55 * p(t, 36.4, 37.2) * tb });
        const cells = [[0, 0, 39.9], [0, 1, 45.1], [1, 0, 50.6], [1, 1, 55.1]];
        cells.forEach(([r, c, t0]) => {
          const x = (COLS[c][0] + COLS[c][1]) / 2, y = (ROWS[r][0] + ROWS[r][1]) / 2, a = p(t, t0, t0 + 0.6, E.back), op = p(t, t0, t0 + 0.3) * tb, hl = bump(t, t0 + 0.2, 2.4);
          let b = rect(COLS[c][0], ROWS[r][0], COLS[c][1] - COLS[c][0], ROWS[r][1] - ROWS[r][0], { rx: 12, fill: C.paper, stroke: C.soft, sw: 1.8 });
          if (hl > 0.01) b += rect(COLS[c][0], ROWS[r][0], COLS[c][1] - COLS[c][0], ROWS[r][1] - ROWS[r][0], { rx: 12, stroke: C.hi, sw: 3.4, so: hl });
          const f = [
            () => tx(x, y - 6, '*n**^k*', { size: 34 }) + lb(x, y + 34, 'PIN: 10^4 = 10 000'),
            () => fr(x, y - 12, '*n*!', '(*n* − *k*)!', { size: 24 }) + lb(x, y + 36, 'podio: 8 × 7 × 6 = 336'),
            () => bn(x, y - 12, '*n* + *k* − 1', '*k*', { size: 22 }) + lb(x, y + 36, 'ciambelle: C(7, 2) = 21'),
            () => bn(x, y - 12, '*n*', '*k*', { size: 22 }) + lb(x, y + 36, 'commissione: C(8, 3) = 56'),
          ][r * 2 + c];
          o += on(op, g({ op, tf: T(x, y, lerp(0.85, 1, a)) }, g({ tf: T(-x, -y) }, b + f())));
        });
      }
      return o;
    },
  });

  /* ======================================================================
     0.4 · Dai podi alle commissioni: 8 × 7 × 6 = 336 = 8!/5!, i libri 5!, la commissione 336/6 = 56, le mani di carte
     ====================================================================== */
  const ATH = (i) => [70 + 66 * i, 106]; // i posti degli otto in fila
  const DEST = [[250, 187], [180, 215], [320, 235]]; // oro, argento, bronzo: centro della persona sul gradino
  const PICK = [2, 5, 0]; // chi sale sul podio: il 3, il 6, l'1 (indici da 0)
  const PERM = [[0, 1, 2, 3, 4], [2, 0, 4, 1, 3], [4, 3, 0, 2, 1]]; // ordini dei 5 libri sullo scaffale
  const ORD = ['ABC', 'ACB', 'BAC', 'BCA', 'CAB', 'CBA']; // i 6 modi di ordinare lo stesso gruppo

  PV.add('podio', {
    sec: '0.4',
    short: 'Dai podi alle commissioni',
    title: 'Dai podi alle commissioni: 8 × 7 × 6 = 336 e 336 / 6 = 56',
    alt: 'Animazione: su un podio con 8 atleti ci sono 8 × 7 × 6 = 336 modi, che è 8!/5! perché la coda 5! si cancella; 5 libri in fila sono 5! = 120. Per una commissione di 3 su 8 l’ordine non conta: ogni gruppo compare 3! = 6 volte fra le 336 terne ordinate (ABC, ACB, BAC, BCA, CAB, CBA), quindi 336/6 = 56 = C(8, 3). Lo stesso per le mani di 5 carte su 52: 2 598 960.',
    dur: 54.5,
    poster: 38,
    chap: [[0, 'Il podio: 8 × 7 × 6'], [12.4, 'La coda si cancella'], [18.4, 'Tutti in fila: 5!'], [24.4, 'La commissione'], [46.8, 'Le mani di carte']],
    caps: [
      [0, 'Un podio con 8 atleti. Per l’oro ci sono 8 candidati, per l’argento ne restano 7, per il bronzo 6.'],
      [6.8, 'I podi possibili sono 8 × 7 × 6 = 336: l’ordine conta e nessuno può ripetersi.'],
      [12.3, 'È 8!/5!: l’8! ha in più la coda 5 × 4 × 3 × 2 × 1, e nel rapporto la coda si cancella.'],
      [18.3, 'Se li metti in fila tutti è una permutazione: 5 libri su uno scaffale, 5! = 120 modi.'],
      [24.3, 'Ora una commissione di 3 persone su 8: {A, B, C} è lo stesso gruppo in qualunque ordine.'],
      [31.3, 'Se l’ordine contasse avremmo le 336 terne ordinate. Ma ogni gruppo compare 3! = 6 volte: ABC, ACB, BAC, BCA, CAB, CBA.'],
      [39.5, 'Quindi i gruppi distinti sono 336 / 6 = 56, cioè C(8, 3): il 5! cancella la coda e il 3! toglie i doppioni.'],
      [46.8, 'Stessa ricetta per le mani di 5 carte su 52: 52 × 51 × 50 × 49 × 48 diviso 5! fa 2 598 960.'],
    ],
    frame(t) {
      let o = '';
      o += heading(t, 0.2, 11.8, 'Un podio con 8 atleti', 'oro, argento, bronzo: l’ordine conta');
      o += heading(t, 12.4, 18, 'Perché è 8!/5!', 'nel rapporto la coda comune si cancella');
      o += heading(t, 18.4, 24, 'Tutti in fila: le permutazioni', 'cinque libri su uno scaffale');
      o += heading(t, 24.4, 46.2, 'Una commissione di 3 su 8', 'l’ordine non conta: si divide per i doppioni');
      o += heading(t, 46.8, 55, 'Le mani di 5 carte su 52', 'stessa ricetta: *k* fattori che scendono, diviso *k*!');

      /* capitolo 1: otto in fila, tre salgono sul podio */
      const s1 = 1 - p(t, 11.8, 12.4);
      if (s1 > 0.004) {
        o += podium(250, p(t, 0.2, 0.8) * s1);
        for (let i = 0; i < 8; i++) {
          const [x0, y0] = ATH(i), pk = PICK.indexOf(i), u = pk >= 0 ? p(t, [2.4, 4.6, 6.2][pk], [3.2, 5.4, 7][pk], E.io) : 0;
          const [x, y] = pk >= 0 ? arc(x0, y0, DEST[pk][0], DEST[pk][1], u, -30) : [x0, y0], a = p(t, 0.1 + 0.05 * i, 0.5 + 0.05 * i);
          const r1 = p(t, 0.8, 1.4) * (1 - p(t, 2.6, 3)), r2 = i !== PICK[0] ? p(t, 3.4, 4) * (1 - p(t, 4.8, 5.2)) : 0, r3 = i !== PICK[0] && i !== PICK[1] ? p(t, 5.4, 5.9) * (1 - p(t, 6.4, 6.8)) : 0, ring = Math.max(r1, r2, r3);
          if (u > 0.01) o += circ(x0, y0, 21, { stroke: C.soft, sw: 1.4, da: '4 4', op: 0.5 * u * s1 });
          o += g({ op: a * s1 }, circ(x, y, 21, { fill: C.paper, stroke: C.soft, sw: 1.8 }) + (ring > 0.01 ? circ(x, y, 25, { stroke: C.A, sw: 3, so: ring }) : '') + (u > 0.01 ? circ(x, y, 25, { stroke: C.hi, sw: 3.4, so: u }) : '') + tx(x, y + 7, i + 1, { size: 20 }));
        }
        [[1.2, 0], [3.8, 1], [5.8, 2]].forEach(([t0, k]) => {
          const op = p(t, t0, t0 + 0.5) * s1;
          o += on(op, tx(DEST[k][0], DEST[k][1] - 29, 8 - k, { size: 26, fill: C.A, op }));
        });
        const e1 = vis(t, 7.4, 11.8) * s1, e2 = vis(t, 9.4, 11.8) * s1;
        o += on(e1, tx(494, 178, '8 × 7 × 6', { size: 36, op: e1 })) + on(e2, tx(494, 238, '= 336', { size: 48, op: e2 }));
      }

      /* capitolo 2: 8!/5!, la coda si cancella */
      const s2 = vis(t, 12.6, 18.2, 0.5, 0.5);
      if (s2 > 0.004) {
        const xe = 548, a0 = p(t, 12.8, 13.4), a1 = p(t, 13, 13.8), a2 = p(t, 13.8, 14.4), a3 = p(t, 14, 14.8), cx = p(t, 15.2, 16.2, E.io), r = p(t, 16.4, 17.2) * s2;
        o += on(a0, g({ op: a0 * s2 }, fr(98, 176, '8!', '5!', { size: 34 }) + tx(150, 188, '=', { size: 34 })));
        o += on(a1, txc(xe, 156, [['8 × 7 × 6 × ', C.ink], ['5 × 4 × 3 × 2 × 1', C.soft]], { size: 26, ta: 'end', op: a1 * s2 }));
        o += on(a2, ln(xe - 376, 172, xe + 6, 172, { stroke: C.ink, sw: 1.8, op: a2 * s2 }));
        o += on(a3, txc(xe, 204, [['5 × 4 × 3 × 2 × 1', C.soft]], { size: 26, ta: 'end', op: a3 * s2 }));
        o += on(cx, g({ op: s2 }, path(`M${xe - 218} 148H${xe}`, { stroke: C.ink, sw: 2.4, ...draw(cx) }) + path(`M${xe - 218} 196H${xe}`, { stroke: C.ink, sw: 2.4, ...draw(cx) })));
        o += on(r, tx(320, 290, '= 8 × 7 × 6 = 336', { size: 38, op: r }));
      }

      /* capitolo 3: cinque libri in fila */
      const s3 = vis(t, 18.6, 24.2, 0.5, 0.5);
      if (s3 > 0.004) {
        o += path('M150 214H490', { stroke: C.soft, sw: 3, op: s3 });
        const cols = [C.A, C.B, C.hi, C.C, C.soft], u1 = p(t, 19.4, 20.6, E.io), u2 = p(t, 21.2, 22.4, E.io);
        for (let b = 0; b < 5; b++) {
          const pos = lerp(lerp(PERM[0].indexOf(b), PERM[1].indexOf(b), u1), PERM[2].indexOf(b), u2), x = 190 + 56 * pos, dy = -22 * Math.sin(Math.PI * u1) * (b % 2 ? 1 : 0.5) - 22 * Math.sin(Math.PI * u2) * (b % 2 ? 0.5 : 1);
          o += rect(x - 17, 130 + dy, 34, 84, { rx: 4, fill: cols[b], fo: 0.35, stroke: cols[b], sw: 2, op: s3 });
        }
        for (let i = 0; i < 5; i++) {
          const op = p(t, 20.4 + 0.5 * i, 20.9 + 0.5 * i) * s3;
          o += on(op, tx(190 + 56 * i, 108, 5 - i, { size: 28, fill: C.A, op }));
        }
        const e = p(t, 22.6, 23.4) * s3;
        o += on(e, tx(320, 290, '5 × 4 × 3 × 2 × 1 = 5! = 120', { size: 34, op: e }));
      }

      /* capitolo 4: la commissione, le 336 terne ordinate, il gruppo che compare 6 volte */
      const s4 = p(t, 24.6, 25.4) * (1 - p(t, 46.2, 46.8));
      if (s4 > 0.004) {
        'ABCDEFGH'.split('').forEach((L, i) => {
          const [x, y] = ATH(i), hi = i < 3 ? p(t, 25.4, 26.2) : 0;
          o += g({ op: s4 }, circ(x, y, 21, { fill: C.paper, stroke: C.soft, sw: 1.8 }) + (hi > 0.01 ? circ(x, y, 25, { stroke: C.hi, sw: 3.4, so: hi }) : '') + tx(x, y + 7, L, { size: 20 }));
        });
        const q1 = vis(t, 26.6, 31.4) * s4, q2 = vis(t, 31.6, 46.2) * s4;
        o += on(q1, tx(320, 172, '{A, B, C} = {C, A, B} = {B, C, A}', { size: 24, op: q1 })) + on(q2, tx(320, 172, 'terne ordinate: 8 × 7 × 6 = 336', { size: 24, op: q2 }));
        ORD.forEach((w, i) => {
          const t0 = 33.2 + 0.4 * i, c = p(t, t0, t0 + 0.5, E.back), op = p(t, t0, t0 + 0.25) * s4, x = 110 + 84 * i;
          o += on(op, g({ op, tf: T(x, 214, lerp(0.4, 1, c)) }, rect(-32, -17, 64, 34, { rx: 12, fill: C.paper, stroke: C.hi, sw: 2.2 }) + tx(0, 7, w, { size: 20 })));
        });
        const bo = vis(t, 36.6, 46.2) * s4;
        o += on(bo, g({ op: bo }, brace(78, 562, 238, C.hi, 1) + lb(320, 268, '3! = 6 modi di ordinare lo stesso gruppo')));
        const f1 = p(t, 39.6, 40.4) * s4, f2 = p(t, 40.6, 41.4) * s4, f3 = p(t, 42.2, 43) * s4;
        o += on(f1, g({ op: f1 }, fr(150, 316, '336', '6', { size: 28 })));
        o += on(f2, tx(204, 326, '=', { size: 30, op: f2 }) + tx(252, 328, '56', { size: 38, op: f2 }));
        o += on(f3, tx(306, 326, '=', { size: 30, op: f3 }) + bn(372, 318, '8', '3', { size: 26, op: f3 }));
      }

      /* capitolo 5: le mani di 5 carte */
      const s5 = vis(t, 47, 55, 0.6, 0.01);
      if (s5 > 0.004) {
        const a = p(t, 47.4, 48.2) * s5, b = p(t, 49.4, 50.2) * s5, c = p(t, 51.4, 52.4, E.back) * s5;
        o += on(a, g({ op: a }, bn(110, 168, '52', '5', { size: 30 }) + tx(170, 180, '=', { size: 32 }) + fr(352, 168, '52 × 51 × 50 × 49 × 48', '5 × 4 × 3 × 2 × 1', { size: 24 })));
        o += on(b, g({ op: b }, tx(150, 278, '=', { size: 32 }) + fr(260, 268, '311 875 200', '120', { size: 26 })));
        o += on(c, tx(474, 280, '= 2 598 960', { size: 40, op: c }));
      }
      return o;
    },
  });

  /* ======================================================================
     0.4 · Anagrammi (MAMMA) e stelle e barre (5 ciambelle fra 3 gusti)
     ====================================================================== */
  const star = (x, y, r, a = {}) => {
    let d = '';
    for (let k = 0; k < 10; k++) {
      const ang = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? r * 0.42 : r;
      d += (k ? 'L' : 'M') + (x + rr * Math.cos(ang)).toFixed(2) + ' ' + (y + rr * Math.sin(ang)).toFixed(2);
    }
    return path(d + 'Z', { lj: 'round', ...a });
  };
  const WORDS = ['AAMMM', 'AMAMM', 'AMMAM', 'AMMMA', 'MAAMM', 'MAMAM', 'MAMMA', 'MMAAM', 'MMAMA', 'MMMAA'];
  const LET = ['M', 'A', 'M', 'M', 'A'], SUB = ['_1', '_1', '_2', '_3', '_2']; // le lettere di MAMMA e i pedici che le distinguono
  const SLOTS = [[0, 1, 2, 3, 4], [0, 1, 3, 2, 4], [2, 1, 3, 0, 4], [2, 4, 3, 0, 1]]; // dove stanno le 5 caselle dopo ogni scambio

  PV.add('anagrammi', {
    sec: '0.4',
    short: 'Anagrammi e stelle e barre',
    title: 'Anagrammi di MAMMA, e stelle e barre',
    alt: 'Animazione: le lettere di MAMMA, tre M e due A, se fossero tutte distinte si disporrebbero in 5! = 120 modi; ma scambiando le M fra loro (3! = 6 modi) e le A fra loro (2! = 2 modi) la parola non cambia, quindi ogni parola è contata 12 volte e le parole distinte sono 120/12 = 10, cioè C(5, 2). Poi stelle e barre: 5 ciambelle fra 3 gusti sono file di 7 simboli con 2 barre, C(7, 2) = 21.',
    dur: 55,
    poster: 31.5,
    chap: [[0, 'Lettere uguali'], [13.5, 'Si dividono i doppioni'], [26.6, 'Le 10 parole'], [38.1, 'Stelle e barre']],
    caps: [
      [0, 'Anagrammi di MAMMA: cinque lettere, ma non tutte diverse. Ci sono tre M e due A.'],
      [5.6, 'Facciamo finta che siano distinguibili, come di colori diversi: M_1 A_1 M_2 M_3 A_2. Le disposizioni sarebbero 5! = 120.'],
      [13.5, 'Ma scambiando fra loro le tre M la parola non cambia: sono 3! = 6 modi. Per le due A, 2! = 2 modi.'],
      [20.3, 'Ogni parola vera è stata contata 3! × 2! = 12 volte: le parole distinte sono 120 / 12 = 10.'],
      [26.6, 'Eccole tutte: AAMMM, AMAMM, AMMAM, AMMMA, MAAMM, MAMAM, MAMMA, MMAAM, MMAMA, MMMAA.'],
      [32.5, 'Nota che 10 = C(5, 2): basta scegliere in quali 2 delle 5 posizioni mettere le A.'],
      [38.1, 'Un problema vicino: 5 ciambelle fra 3 gusti, e conta solo quante ne prendi per gusto. Si disegnano 5 stelle e 2 barre.'],
      [46.3, 'Due barre dividono i gusti: ★★|★|★★ vuol dire 2, 1 e 2. Ogni sacchetto è una fila di 7 simboli di cui 2 barre: C(7, 2) = 21.'],
    ],
    frame(t) {
      let o = '';
      o += heading(t, 0.2, 13.2, 'Anagrammi di MAMMA', 'tre M e due A');
      o += heading(t, 13.8, 26.2, 'Si divide per i doppioni', 'scambiare lettere uguali non cambia la parola');
      o += heading(t, 26.8, 38, 'Le parole distinte', 'sono 10');
      o += heading(t, 38.4, 55, 'Stelle e barre', '5 ciambelle fra 3 gusti');

      /* capitoli 1 e 2: le cinque caselle, i pedici, gli scambi */
      const s1 = 1 - p(t, 26.2, 26.8);
      if (s1 > 0.004) {
        const dist = p(t, 6.4, 7.2), u1 = p(t, 14.4, 15.6, E.io), u2 = p(t, 16.2, 17.4, E.io), u3 = p(t, 18, 19.2, E.io);
        for (let b = 0; b < 5; b++) {
          const pos = lerp(lerp(lerp(SLOTS[0][b], SLOTS[1][b], u1), SLOTS[2][b], u2), SLOTS[3][b], u3), x = 160 + 80 * pos;
          const dy = -24 * (Math.sin(Math.PI * u1) * (b === 2 ? 1 : b === 3 ? -0.6 : 0) + Math.sin(Math.PI * u2) * (b === 0 ? 1 : b === 3 ? -0.6 : 0) + Math.sin(Math.PI * u3) * (b === 1 ? 1 : b === 4 ? -0.6 : 0));
          const t0 = 0.8 + 0.2 * b, a = p(t, t0, t0 + 0.6, E.back), h = p(t, 1.6 + 0.2 * b, 2.2 + 0.2 * b), col = LET[b] === 'M' ? C.A : C.B;
          o += tile(x, 166 + dy, 56, LET[b] + (dist > 0.5 ? SUB[b] : ''), { sc: lerp(0.3, 1, a) * (1 + 0.1 * bump(t, 6.4, 1)), op: p(t, t0, t0 + 0.25) * s1, ring: col, ro: h, veil: col, vo: 0.16 * h, size: 24 });
        }
        const w0 = vis(t, 14, 26.2) * s1;
        o += on(w0, tx(320, 104, 'parola: MAMMA', { size: 26, op: w0 }));
        const c1 = vis(t, 8.6, 13.2) * s1, c2 = vis(t, 20.6, 26.2) * s1, c3 = vis(t, 23.2, 26.2) * s1;
        o += on(c1, tx(320, 262, '5! = 120', { size: 46, op: c1 }));
        o += on(c2, tx(320, 248, '3! × 2! = 6 × 2 = 12 volte', { size: 30, op: c2 }));
        o += on(c3, g({ op: c3 }, fr(250, 312, '120', '12', { size: 30 }) + tx(320, 322, '=', { size: 36 }) + tx(380, 324, '10', { size: 48 })));
        const b1 = vis(t, 15, 19, 0.4, 0.5) * s1, b2 = vis(t, 18.4, 22.4, 0.4, 0.5) * s1;
        o += on(b1, lb(320, 214, 'le tre M si scambiano: 3! = 6 modi', { op: b1 }));
        o += on(b2, lb(320, 214, 'le due A si scambiano: 2! = 2 modi', { op: b2 }));
      }

      /* capitolo 3: le dieci parole, e 10 = C(5, 2) */
      const s3 = p(t, 26.8, 27.4) * (1 - p(t, 37.4, 38));
      if (s3 > 0.004) {
        WORDS.forEach((w, k) => {
          const t0 = 27 + 0.4 * k, c = p(t, t0, t0 + 0.5, E.back), op = p(t, t0, t0 + 0.25) * s3, x = 96 + 112 * (k % 5), y = k < 5 ? 134 : 196;
          o += on(op, g({ op, tf: T(x, y, lerp(0.4, 1, c)) }, rect(-52, -20, 104, 40, { rx: 12, fill: C.paper, stroke: C.soft, sw: 1.8 }) + txc(0, 8, [...w].map((L) => [L, L === 'A' ? C.B : C.A]), { size: 21, letter_spacing: 1.5 })));
        });
        const f1 = p(t, 33, 33.8) * s3;
        o += on(f1, lb(320, 262, 'dove mettere le 2 A fra 5 posti', { op: f1 }));
        const f2 = p(t, 34.4, 35.2) * s3;
        o += on(f2, g({ op: f2 }, bn(250, 312, '5', '2', { size: 34 }) + tx(330, 324, '= 10', { size: 40 })));
      }

      /* capitolo 4: stelle e barre */
      const s4 = p(t, 38.6, 39.4);
      if (s4 > 0.004) {
        const SX = (i) => 130 + 60 * i, order = ['s', 's', 'b', 's', 'b', 's', 's']; // ★★|★|★★
        order.forEach((kind, i) => {
          const t0 = kind === 's' ? 39.2 + 0.25 * i : 43.4 + 0.4 * (i === 2 ? 0 : 1), c = p(t, t0, t0 + 0.5, E.back), op = p(t, t0, t0 + 0.25) * s4, x = SX(i);
          if (kind === 's') o += on(op, g({ op, tf: T(x, 150, lerp(0.4, 1, c)) }, star(0, 0, 20, { fill: C.hi, stroke: C.hi, sw: 2, fo: 0.8 })));
          else o += on(op, g({ op, tf: T(x, 150 - 24 * (1 - c), 1) }, rect(-3, -26, 6, 52, { rx: 3, fill: C.ink })));
        });
        const g1 = p(t, 44.8, 45.6) * s4, g2 = p(t, 45.4, 46.2) * s4, g3 = p(t, 46, 46.8) * s4;
        [[g1, 160, '2', 'gusto 1'], [g2, 310, '1', 'gusto 2'], [g3, 460, '2', 'gusto 3']].forEach(([op, x, n, lab]) => o += on(op, tx(x, 214, n, { size: 30, op }) + lb(x, 238, lab, { op })));
        const b1 = vis(t, 47, 55, 0.6, 0.01) * s4, b2 = vis(t, 49.4, 55, 0.6, 0.01) * s4;
        o += on(b1, g({ op: b1 }, brace(SX(0) - 20, SX(6) + 20, 114, C.soft, 1, -1) + lb(320, 102, '7 posti, 2 per le barre', { op: 1 })));
        o += on(b2, g({ op: b2 }, bn(240, 306, '7', '2', { size: 34 }) + tx(330, 318, '= 21', { size: 44 })));
      }
      return o;
    },
  });

  /* ======================================================================
     0.4 · Il triangolo di Tartaglia, i percorsi su una griglia, le verifiche vero/falso
     ====================================================================== */
  const cnk = (n, k) => (k < 0 || k > n ? 0 : k === 0 ? 1 : (cnk(n - 1, k - 1) * n) / k);
  const TR = { cx: 250, y0: 104, dx: 48, dy: 38 }; // il triangolo: centro, quota della riga 0, passi
  const trXY = (r, k) => [TR.cx + TR.dx * (k - r / 2), TR.y0 + TR.dy * r];
  const LX = (a) => 130 + 92 * a, LY = (b) => 290 - 70 * b; // la griglia dei percorsi: punto (a, b)
  const PATHS = [['DDDSS', 0], ['DSDSD', 4], ['SSDDD', 9]]; // i tre percorsi mostrati e il loro posto nell'elenco
  const ANAG = ['DDDSS', 'DDSDS', 'DDSSD', 'DSDDS', 'DSDSD', 'DSSDD', 'SDDDS', 'SDDSD', 'SDSDD', 'SSDDD'];
  const nodesOf = (w) => {
    let a = 0, b = 0;
    const pts = [[0, 0]];
    for (const c of w) { if (c === 'D') a++; else b++; pts.push([a, b]); }
    return pts;
  };

  PV.add('tartaglia', {
    sec: '0.4',
    short: 'Il triangolo di Tartaglia',
    title: 'Il triangolo di Tartaglia, i percorsi su una griglia e le verifiche vero/falso',
    alt: 'Animazione: il triangolo di Tartaglia si riempie sommando i due numeri sopra; la riga n contiene i binomiali C(n, k). Un robot che a ogni mossa fa un passo a destra o in su arriva a (3, 2) in 10 modi, come gli anagrammi di DDDSS, C(5, 2); le caselle della griglia sono la somma di quella a sinistra e di quella sotto. La riga 6, 1, 6, 15, 20, 15, 6, 1, conta le sequenze di risposte a una verifica di 6 domande vero/falso con k risposte «vero»: in tutto 64, e con almeno 3 «vero» sono 42.',
    dur: 56,
    poster: 17,
    chap: [[0, 'Il triangolo'], [19.6, 'I percorsi'], [36.1, 'La griglia somma'], [43.4, 'Vero o falso']],
    caps: [
      [0, 'Il triangolo di Tartaglia: alla riga *n* ci sono i binomiali C(*n*, 0), C(*n*, 1), …, C(*n*, *n*).'],
      [6.5, 'Si riempie a mano, senza moltiplicare né dividere: ogni numero che non sta sul bordo è la somma dei due che ha sopra.'],
      [14.3, 'Per esempio nella riga 6: 5 + 10 = 15, perché C(6, 2) = C(5, 1) + C(5, 2).'],
      [19.6, 'Un uso: un robot parte da (0, 0) e a ogni mossa fa un passo a destra (D) o uno in su (S). I percorsi fino a (3, 2) sono 10.'],
      [28.1, 'Ogni percorso è una fila di 3 D e 2 S, come un anagramma di DDDSS: C(5, 2) = 10 modi di scegliere dove stanno gli S.'],
      [36.1, 'La griglia si riempie con la stessa regola: ogni casella è la somma di quella a sinistra e di quella sotto.'],
      [43.4, 'Un altro uso: 6 domande vero/falso a caso. Le sequenze sono 2^6 = 64, e quelle con *k* «vero» sono la riga 6: 1, 6, 15, 20, 15, 6, 1.'],
      [52.6, 'Con almeno 3 «vero»: 20 + 15 + 6 + 1 = 42.'],
    ],
    frame(t) {
      let o = '';
      o += heading(t, 0.2, 19.2, 'Il triangolo di Tartaglia', 'ogni numero è la somma dei due che ha sopra');
      o += heading(t, 19.8, 43, 'Percorsi su una griglia', 'a ogni mossa: un passo a destra (D) o in su (S)');
      o += heading(t, 43.6, 56, 'Verifica vero/falso', '6 domande, risposte a caso: 2^6 = 64 sequenze');

      /* capitolo 1: il triangolo, righe 0-6 */
      const s1 = 1 - p(t, 19.2, 19.8);
      if (s1 > 0.004) {
        const demo = [[2, 1, 7], [4, 2, 9.2], [5, 2, 11.6], [6, 2, 14.4]];
        for (let r = 0; r <= 6; r++) {
          const lo = p(t, 0.8 + 0.8 * r, 1.4 + 0.8 * r) * s1;
          o += on(lo, lb(48, trXY(r, 0)[1] + 6, 'riga ' + r, { op: lo }));
          for (let k = 0; k <= r; k++) {
            const [x, y] = trXY(r, k), t0 = 1 + 0.8 * r + 0.06 * k, c = p(t, t0, t0 + 0.5, E.back), op = p(t, t0, t0 + 0.25) * s1;
            let ring, ro = 0, veil;
            for (const [dr, dk, td] of demo) {
              const h = bump(t, td, dr === 6 ? 5 : 2.2);
              if (r === dr && k === dk && h > 0.01) { ring = C.hi; ro = h; veil = C.hi; }
              if (r === dr - 1 && (k === dk - 1 || k === dk) && h > 0.01) { ring = C.A; ro = h; veil = C.A; }
            }
            o += on(op, tile(x, y, 38, cnk(r, k), { sc: lerp(0.4, 1, c) * (1 + 0.1 * (ring === C.hi ? ro : 0)), op, ring, ro, veil, vo: 0.3, size: 20 }));
          }
        }
        const a1 = vis(t, 6.6, 14, 0.5, 0.5) * s1, a2 = vis(t, 14.6, 19.2, 0.5, 0.5) * s1, a3 = vis(t, 15.4, 19.2, 0.5, 0.5) * s1;
        o += on(a1, lb(540, 150, 'ogni numero è la somma', { op: a1 }) + lb(540, 172, 'dei due che ha sopra', { op: a1 }));
        o += on(a2, tx(540, 236, '5 + 10 = 15', { size: 30, op: a2 }));
        o += on(a3, g({ op: a3 }, bn(488, 300, '6', '2', { size: 20 }) + tx(519, 308, '=', { size: 22 }) + bn(550, 300, '5', '1', { size: 20 }) + tx(580, 308, '+', { size: 22 }) + bn(610, 300, '5', '2', { size: 20 })));
      }

      /* capitoli 2 e 3: il robot sulla griglia, i 10 percorsi come anagrammi di DDDSS, le caselle che sommano */
      const s2 = p(t, 19.8, 20.6) * (1 - p(t, 42.6, 43.2));
      if (s2 > 0.004) {
        for (let a = 0; a <= 3; a++) for (let b = 0; b <= 2; b++) {
          if (a < 3) o += path(`M${LX(a)} ${LY(b)}H${LX(a + 1)}`, { stroke: C.soft, sw: 1.6, op: s2 * 0.7 });
          if (b < 2) o += path(`M${LX(a)} ${LY(b)}V${LY(b + 1)}`, { stroke: C.soft, sw: 1.6, op: s2 * 0.7 });
        }
        /* percorsi del robot */
        const walks = [[0, 20.8, 24], [1, 24.4, 27.4], [2, 27.4, 30.2]];
        walks.forEach(([k, a0, a1], wi) => {
          const nd = nodesOf(PATHS[k][0]), u = p(t, a0, a1, E.lin), col = [C.A, C.B, C.C][wi], fade = 1 - p(t, 33.6, 34.4);
          for (let i = 0; i < 5; i++) {
            const su = Math.min(1, Math.max(0, 5 * u - i));
            if (su > 0) o += path(`M${LX(nd[i][0])} ${LY(nd[i][1])}L${LX(nd[i + 1][0])} ${LY(nd[i + 1][1])}`, { stroke: col, sw: 5, lc: 'round', ...draw(su), op: s2 * fade });
          }
          const idx = Math.min(4, Math.floor(5 * u)), fr2 = 5 * u - idx;
          if (u > 0 && u < 1) o += circ(lerp(LX(nd[idx][0]), LX(nd[idx + 1][0]), fr2), lerp(LY(nd[idx][1]), LY(nd[idx + 1][1]), fr2), 10, { fill: C.hi, stroke: C.ink, sw: 1.8, op: s2 });
        });
        /* punti della griglia: diventano caselle con i conteggi */
        for (let a = 0; a <= 3; a++) {
          for (let b = 0; b <= 2; b++) {
            const n = cnk(a + b, a), td = 36.6 + 0.5 * (a + b), c = p(t, td, td + 0.5, E.back), pt = 1 - p(t, td, td + 0.2);
            const hi = a === 3 && b === 2 ? p(t, 41.6, 42.2) : (a === 2 && b === 2) || (a === 3 && b === 1) ? bump(t, 40.4, 2.2) : 0;
            o += on(pt * s2, circ(LX(a), LY(b), 6, { fill: C.ink, op: s2 * pt }));
            o += on(c * s2, g({ op: s2 * p(t, td, td + 0.2), tf: T(LX(a), LY(b), lerp(0.4, 1, c)) }, rect(-22, -17, 44, 34, { rx: 8, fill: C.paper, stroke: C.soft, sw: 1.8 }) + (hi > 0.01 ? rect(-22, -17, 44, 34, { rx: 8, fill: C.hi, fo: 0.4 * hi, stroke: C.hi, so: hi, sw: 3 }) : '') + tx(0, 7, n, { size: 20 })));
          }
        }
        o += on(p(t, 20, 20.8) * s2, lb(LX(0), LY(0) + 34, 'partenza', { op: s2 }) + lb(LX(3), LY(2) - 26, '(3, 2)', { op: s2 }));
        /* elenco dei 10 anagrammi di DDDSS */
        const li = vis(t, 20.6, 35.6, 0.6, 0.6);
        ANAG.forEach((w, k) => {
          const x = 506 + 86 * (k % 2), y = 118 + 36 * Math.floor(k / 2), w0 = PATHS.find((q) => q[1] === k), on0 = w0 ? p(t, [21.4, 25, 27.8][PATHS.indexOf(w0)], [22.2, 25.8, 28.6][PATHS.indexOf(w0)]) : 0, op = p(t, 20.8 + 0.12 * k, 21.3 + 0.12 * k) * li;
          o += on(op, g({ op }, rect(x - 38, y - 15, 76, 30, { rx: 10, fill: C.paper, stroke: C.soft, sw: 1.6 }) + (on0 > 0.01 ? rect(x - 38, y - 15, 76, 30, { rx: 10, fill: C.hi, fo: 0.4 * on0, stroke: C.hi, so: on0, sw: 3 }) : '') + tx(x, y + 7, w, { size: 19, letter_spacing: 1 })));
        });
        const c5 = vis(t, 29, 35.6, 0.6, 0.6);
        o += on(c5, g({ op: c5 }, lb(545, 302, 'posti degli S fra 5:', { op: 1 }) + bn(488, 330, '5', '2', { size: 22 }) + tx(530, 339, '= 10', { size: 30, ta: 'start' })));
        const ru = vis(t, 37, 43, 0.6, 0.6);
        o += on(ru, g({ op: ru }, lb(540, 150, 'ogni casella è la somma', { op: 1 }) + lb(540, 172, 'di sinistra e sotto', { op: 1 }) + tx(540, 250, '4 + 6 = 10', { size: 30 })));
      }

      /* capitolo 4: la riga 6 come istogramma delle risposte «vero» */
      const s4 = p(t, 43.8, 44.6);
      if (s4 > 0.004) {
        const hl = p(t, 52.8, 53.6);
        o += path('M110 304H530', { stroke: C.soft, sw: 1.6, op: s4 });
        for (let k = 0; k <= 6; k++) {
          const v = cnk(6, k), x = 320 + 62 * (k - 3), u = p(t, 44.4 + 0.35 * k, 45.4 + 0.35 * k, E.out), h = v * 7.5 * u, big = k >= 3 ? hl : 0;
          let b = rect(x - 23, 304 - h, 46, h, { rx: 3, fill: C.A, fo: 0.35 * (1 - big), stroke: C.A, so: 1 - big, sw: 1.8 });
          if (big > 0.01) b += rect(x - 23, 304 - h, 46, h, { rx: 3, fill: C.hi, fo: 0.45 * big, stroke: C.hi, so: big, sw: 1.8 });
          o += g({ op: s4 }, b);
          o += on(u, tx(x, 304 - h - 8, v, { size: 22, op: u * s4 }) + lb(x, 326, k, { op: u * s4, size: 20 }));
        }
        o += lb(320, 350, 'risposte «vero» su 6', { op: s4 * p(t, 45, 46) });
        const f1 = vis(t, 47.5, 52.4) * s4, f2 = p(t, 52.8, 53.6) * s4;
        o += on(f1, tx(320, 112, '1 + 6 + 15 + 20 + 15 + 6 + 1 = 64', { size: 26, op: f1 }));
        o += on(f2, tx(320, 112, '20 + 15 + 6 + 1 = 42', { size: 28, op: f2 }));
      }
      return o;
    },
  });
})();
