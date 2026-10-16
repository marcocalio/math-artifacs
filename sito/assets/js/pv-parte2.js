/* =========================================================================
   pv-parte2.js — video della Parte 2 (Modelli discreti): sezioni 2.5 (varianza,
   momenti, covarianza), 2.6 (le leggi da riconoscere) e 2.7 (somme indipendenti
   e approssimazione di Poisson). Le sezioni 2.1-2.4 e il ripasso 'parte2' sono
   in pv-parte2b.js. Si appoggia a pv.js: ogni video è un PV.add(id, {...}).
   Tutti i tempi sono in secondi; le coordinate sono nel riquadro 640 × 360.
   ========================================================================= */
(function () {
  'use strict';
  const { f, lerp, E, p, arc, C, SANS, SERIF, T, rect, circ, ln, path, g, draw, tx, txc, tile, check, cross, vis, on, heading, subline, lb, fr, brace, vbrace, lbrace, pills, bn, die, dieAt, at, mm } = PV.h;
  const OK = 'var(--verde)', NO = 'var(--rosso)';
  const ZW = '\u200b'; // da mettere dopo un apice in corsivo seguito da altro testo: *^{k−1}\u200b* (senza, mm() di pv.js non riporta sulla riga il testo che segue)

  /* freccia da (x1,y1) a (x2,y2) che si disegna (u da 0 a 1); la punta compare a fine corsa */
  function arrow(x1, y1, x2, y2, u, col, op = 1) {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 8;
    let o = path(`M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`, { stroke: col, sw: 2.2, op, ...draw(u) });
    if (u > 0.92) o += path(`M${f(x2)} ${f(y2)}L${f(x2 - h * Math.cos(a - 0.45))} ${f(y2 - h * Math.sin(a - 0.45))}M${f(x2)} ${f(y2)}L${f(x2 - h * Math.cos(a + 0.45))} ${f(y2 - h * Math.sin(a + 0.45))}`, { stroke: col, sw: 2.2, lc: 'round', op });
    return o;
  }
  /* quadrato che cresce dal centro: s = lato pieno, u = 0…1 */
  const sq = (x, yc, s, u, col, fo = 0.3, op = 1) => rect(x + (s * (1 - u)) / 2, yc - (s * u) / 2, s * u, s * u, { fill: col, fo, stroke: col, sw: 2, op });

  /* ======================================================================
     2.5 · Varianza: la media dei quadrati degli scarti (autobus e dado)
     ====================================================================== */
  const place = (vals) => { // a che livello appoggiare ogni pallino (0, 1, 2…) perché non si sovrappongano
    const lv = [];
    return vals.map((v) => {
      let k = 0;
      while ((lv[k] || []).some((u) => Math.abs(u - v) < 0.6)) k++;
      (lv[k] = lv[k] || []).push(v);
      return k;
    });
  };
  const BUS1 = [9.2, 10.8, 10, 9.6, 10.4, 9, 11, 10.2, 9.8, 10.6], BUS2 = [1, 19, 2, 18, 1, 19, 2, 18, 1, 19];
  const LV1 = place(BUS1), LV2 = place(BUS2);
  const MIN = (x0, sc) => (m) => x0 + sc * m; // minuti → ascissa
  function minAxis(X, Y, op) { // asse dei minuti, da 0 a 20, tacche ogni 5
    let o = path(`M${f(X(0) - 8)} ${Y}H${f(X(20) + 8)}`, { stroke: C.soft, sw: 2, op });
    for (let m = 0; m <= 20; m += 5) o += ln(X(m), Y - 5, X(m), Y + 5, { stroke: C.soft, sw: 1.6, op }) + lb(X(m), Y + 27, m, { op });
    return o;
  }
  const DX = (v) => 320 + 92 * (v - 3.5); // valori del dado → ascissa
  const DSIG = Math.sqrt(35 / 12);
  const DEV = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5], AREA = ['6,25', '2,25', '0,25', '0,25', '2,25', '6,25'], SQF = [1, 4, 9, 16, 25, 36];

  PV.add('varianza', {
    sec: '2.5',
    short: 'Quanto si sparpagliano i valori',
    title: 'La varianza: la media dei quadrati degli scarti',
    alt: 'Animazione: due linee di autobus hanno la stessa attesa media di 10 minuti, ma una arriva sempre fra 9 e 11 minuti e l’altra a volte in 1 e a volte in 19. Gli scarti dalla media si cancellano, quindi si elevano al quadrato e diventano aree, 1 contro 81: la varianza è la loro media. Sul dado gli scarti al quadrato sono 6,25; 2,25 e 0,25, due volte ciascuno; la somma è 17,5 e la varianza è 17,5/6 = 35/12, circa 2,9167, uguale a 91/6 − 3,5². La deviazione standard, la radice, vale circa 1,71.',
    dur: 58,
    poster: 40,
    chap: [[0, 'Stessa media, vita diversa'], [10, 'Scarti e quadrati'], [29, 'La varianza del dado'], [42, 'Scorciatoia e deviazione standard']],
    caps: [
      [0, 'Due linee di autobus hanno lo stesso tempo medio di attesa: 10 minuti.'],
      [3.6, 'La prima arriva sempre fra i 9 e gli 11 minuti, la seconda a volte in 1 minuto e a volte in 19.'],
      [10, 'Semplifichiamo: 9 o 11 minuti per la prima, 1 o 19 per la seconda, metà e metà. Lo scarto dalla media è *X* − *μ*.'],
      [17, 'Ma gli scarti si cancellano: la loro media è sempre zero. Li eleviamo al quadrato: diventano aree, 1 contro 81.'],
      [24.2, 'La varianza è la media di queste aree: Var(*X*) = *E*[(*X* − *μ*)^2].'],
      [29, 'Sul dado la media è 3,5 e gli scarti sono ±2,5, ±1,5, ±0,5. Al quadrato: 6,25; 2,25; 0,25, due volte ciascuno.'],
      [36.4, 'La somma delle aree è 17,5, la media 17,5/6 ≈ 2,9167: la varianza del dado è 35/12.'],
      [42, 'Per i conti c’è una scorciatoia: Var(*X*) = *E*[*X*^2] − (*E*[*X*])^2, cioè 91/6 − 3,5^2 = 15,1667 − 12,25 = 2,9167.'],
      [49.5, 'La radice riporta alle unità originali: σ ≈ 1,71. Entro 3,5 ± 1,71 stanno 2, 3, 4 e 5, con probabilità 4/6.'],
    ],
    frame(t) {
      let o = '';
      o += heading(t, 0.2, 9.6, 'Quanto si sparpagliano i valori', 'due linee di autobus con la stessa media');
      o += heading(t, 10.2, 28.6, 'Gli scarti dalla media') + subline(t, 10.4, 16.6, 'scarto = valore − media') + subline(t, 17, 23.4, 'si cancellano: li eleviamo al quadrato') + subline(t, 23.8, 28.4, 'la varianza è la media di queste aree');
      o += heading(t, 29.4, 41.6, 'La varianza del dado', 'la media delle aree degli scarti al quadrato');
      o += heading(t, 42.4, 49.4, 'Una scorciatoia per i conti', 'media del quadrato meno quadrato della media') + heading(t, 50, 58.4, 'La deviazione standard', 'la radice riporta alle unità di misura');

      /* capitolo 1: i tempi di attesa delle due linee */
      const a1 = 1 - p(t, 9.6, 10.2);
      if (a1 > 0.004) {
        const X = MIN(70, 25), Y1 = 176, Y2 = 296, ax = p(t, 0.2, 0.9) * a1, mu = p(t, 7, 7.8);
        o += minAxis(X, Y1, ax) + minAxis(X, Y2, ax);
        o += tx(40, Y1 - 60, 'linea 1', { ff: SANS, size: 17, fill: C.A, ta: 'start', op: ax }) + tx(40, Y2 - 60, 'linea 2', { ff: SANS, size: 17, fill: C.B, ta: 'start', op: ax });
        o += on(mu, path(`M${f(X(10))} 104V${Y2 + 12}`, { stroke: C.hi, sw: 3.5, op: a1, ...draw(mu) }));
        [[BUS1, LV1, Y1, C.A, 0.6], [BUS2, LV2, Y2, C.B, 3.8]].forEach(([vals, lv, Y, col, s0]) => {
          vals.forEach((m, i) => {
            const t0 = s0 + 0.3 * i, u = p(t, t0, t0 + 0.45, E.back);
            o += on(u, circ(X(m), Y - 9 - 15 * lv[i] - 34 * (1 - u), 7, { fill: col, fo: 0.88, stroke: C.paper, sw: 1.4, op: p(t, t0, t0 + 0.2) * a1 }));
          });
        });
        o += on(mu, tx(X(10), 94, 'media: 10 minuti', { ff: SANS, size: 17, op: mu * a1 }));
        const rg = p(t, 8, 8.8) * a1;
        o += on(rg, tx(604, Y1 + 5, '9–11', { ff: SANS, size: 17, fill: C.A, op: rg }) + tx(604, Y2 + 5, '1–19', { ff: SANS, size: 17, fill: C.B, op: rg }) + tx(604, Y2 + 27, 'min', { ff: SANS, size: 17, fill: C.soft, op: ax }));
      }

      /* capitolo 2: scarti, cancellazione, quadrati come aree */
      const a2 = p(t, 10.2, 11) * (1 - p(t, 28.6, 29.4));
      if (a2 > 0.004) {
        const X = MIN(40, 14), Y1 = 150, Y2 = 286, XM = X(10);
        o += minAxis(X, Y1, a2) + minAxis(X, Y2, a2);
        o += path(`M${f(XM)} 98V${Y2 + 12}`, { stroke: C.hi, sw: 3.5, op: a2 * p(t, 11.2, 11.8) });
        [[Y1, [9, 11], C.A], [Y2, [1, 19], C.B]].forEach(([Y, vs, col], r) => {
          vs.forEach((m, i) => {
            const t0 = 10.6 + 0.35 * i + 0.5 * r, u = p(t, t0, t0 + 0.5, E.back), ua = p(t, 12.4 + 0.3 * i, 13.3 + 0.3 * i, E.io);
            o += arrow(XM, Y - 28, X(m), Y - 28, ua, col, a2);
            o += on(u, circ(X(m), Y - 9 - 30 * (1 - u), 8, { fill: col, fo: 0.9, stroke: C.paper, sw: 1.4, op: a2 * p(t, t0, t0 + 0.2) }));
            const lo = p(t, 13.2 + 0.3 * i, 13.9 + 0.3 * i);
            o += on(lo, tx(X(m) + (m < 10 ? -12 : 12), Y - 38, (m < 10 ? '−' : '+') + Math.abs(m - 10), { size: 20, fill: col, op: lo * a2 }));
          });
        });
        const pc = vis(t, 17.4, 22.2, 0.5, 0.4) * a2;
        o += on(pc, pills(207, [{ s: '(−9) + 9 = 0: si cancellano', icon: 'no', col: NO, op: pc, u: p(t, 17.8, 18.4, E.lin) }], XM));
        /* i quadrati: lato = scarto (6 unità per minuto), area = scarto al quadrato */
        const u1 = p(t, 22, 22.8), u2 = p(t, 22.4, 23.4);
        o += on(u1, sq(372, 141, 6, u1, C.A, 0.5, a2) + sq(432, 141, 6, u1, C.A, 0.5, a2));
        o += on(u2, sq(372, 277, 54, u2, C.B, 0.3, a2) + sq(432, 277, 54, u2, C.B, 0.3, a2));
        const ql = p(t, 23.2, 24) * a2;
        o += on(ql, tx(392, 148, '1', { size: 22, fill: C.A, ta: 'start', op: ql }) + tx(452, 148, '1', { size: 22, fill: C.A, ta: 'start', op: ql }) + tx(399, 285, '81', { size: 26, fill: C.B, op: ql }) + tx(459, 285, '81', { size: 26, fill: C.B, op: ql }));
        const vr = p(t, 24.2, 25) * a2;
        o += on(vr, txc(506, 150, [['Var = ', C.ink], ['1', C.A]], { size: 24, ta: 'start', op: vr }) + txc(506, 286, [['Var = ', C.ink], ['81', C.B]], { size: 24, ta: 'start', op: vr }));
        const fm = p(t, 25.4, 26.4) * a2;
        o += on(fm, tx(500, 214, 'Var(*X*) = *E*[(*X* − *μ*)^2]', { size: 22, op: fm }));
      }

      /* capitoli 3, 4 e 5: il dado */
      const a3 = p(t, 29.4, 29.8);
      if (a3 > 0.004) {
        const mu = p(t, 30.6, 31.4), sg = p(t, 50.4, 51.6), ml = vis(t, 30.8, 49.6, 0.5, 0.4), sl = p(t, 50.2, 51);
        o += on(mu, path(`M320 104V${f(lerp(284, 166, p(t, 42, 42.8)))}`, { stroke: C.hi, sw: 3.5, op: a3 * mu, ...draw(mu) }));
        /* banda di una deviazione standard attorno alla media */
        o += on(sg, rect(DX(3.5 - DSIG * sg), 100, 2 * DSIG * 92 * sg, 60, { rx: 10, fill: C.hi, fo: 0.22, stroke: C.hi, sw: 2.4 }));
        o += on(ml, lb(320, 94, 'media 3,5', { op: ml * a3 })) + on(sl, lb(320, 94, '3,5 ± 1,71', { op: sl }));
        for (let k = 1; k <= 6; k++) {
          const t0 = 29.5 + 0.15 * k, u = p(t, t0, t0 + 0.5, E.back), inside = k >= 2 && k <= 5, rg = p(t, 52, 52.8);
          o += tile(DX(k), 128, 44, k, { size: 24, sc: u, op: p(t, t0, t0 + 0.2) * (inside ? 1 : 1 - 0.5 * rg), ring: inside && rg > 0.01 ? C.hi : undefined, ro: rg });
        }
        /* capitolo 3: scarti, quadrati come aree, somma e media */
        const c3 = (1 - p(t, 42, 42.8)) * a3;
        if (c3 > 0.004) {
          DEV.forEach((d, i) => {
            const lo = p(t, 31.4 + 0.15 * i, 32.2 + 0.15 * i), su = p(t, 32.6 + 0.25 * i, 33.6 + 0.25 * i), al = p(t, 34.6 + 0.15 * i, 35.4 + 0.15 * i), s = Math.abs(d) * 26;
            o += on(lo, tx(DX(i + 1), 172, (d < 0 ? '−' : '+') + String(Math.abs(d)).replace('.', ','), { ff: SANS, size: 17, fill: C.soft, op: lo * c3 }));
            o += on(su, sq(DX(i + 1) - s / 2, 184 + s / 2, s, su, C.A, 0.3, c3));
            o += on(al, tx(DX(i + 1), 276, AREA[i], { size: 20, fill: C.A, op: al * c3 }));
          });
          const s1 = p(t, 36.2, 37), s2 = p(t, 38.2, 39);
          o += on(s1, tx(320, 310, 'somma delle aree = 17,5', { size: 26, op: s1 * c3 }));
          o += on(s2, txc(320, 345, [['Var(*X*) = 17,5/6 = 35/12 ≈ ', C.ink], ['2,9167', C.A]], { size: 28, op: s2 * c3 }));
        }
        /* capitolo 4: la scorciatoia E[X²] − μ² */
        const c4 = p(t, 42.8, 43.4) * (1 - p(t, 49.4, 50)) * a3;
        if (c4 > 0.004) {
          SQF.forEach((v, i) => {
            const u = p(t, 43 + 0.22 * i, 43.8 + 0.22 * i);
            o += on(u, tx(DX(i + 1), 194, v, { size: 24, op: u * c4 }));
          });
          const bs = p(t, 44.6, 45.4) * c4;
          o += on(bs, brace(DX(1) - 20, DX(6) + 20, 206, C.hi, bs, 1) + tx(320, 234, 'somma 91', { ff: SANS, size: 17, fill: C.soft, op: bs }));
          const l1 = p(t, 45.6, 46.4) * c4, l2 = p(t, 46.8, 47.6) * c4, l3 = p(t, 48, 48.8) * c4;
          o += on(l1, tx(320, 268, '*E*[*X*^2] = 91/6 ≈ 15,1667', { size: 26, op: l1 }));
          o += on(l2, tx(320, 302, '(*E*[*X*])^2 = 3,5^2 = 12,25', { size: 26, op: l2 }));
          o += on(l3, txc(320, 338, [['Var(*X*) = 15,1667 − 12,25 = ', C.ink], ['2,9167', C.A]], { size: 26, op: l3 }));
        }
        /* capitolo 5: la deviazione standard */
        const c5 = p(t, 50.6, 51.4) * a3;
        if (c5 > 0.004) {
          o += tx(320, 214, 'σ = √2,9167 ≈ 1,71', { size: 30, op: c5 });
          o += pills(268, [{ s: '2, 3, 4, 5 dentro: probabilità 4/6', icon: 'ok', col: OK, op: p(t, 53.4, 54.2), u: p(t, 53.7, 54.3, E.lin) }]);
          o += pills(314, [{ s: '1 e 6 fuori', icon: 'no', col: NO, op: p(t, 55.2, 56), u: p(t, 55.5, 56.1, E.lin) }]);
        }
      }
      return o;
    },
  });
  /* ======================================================================
     2.5 · Covarianza: rettangoli degli scarti e varianza di una somma (urna senza reimmissione)
     ====================================================================== */
  const PL = { cx: 200, cy: 215, sx: 140, sy: 95 }; // il riquadro dei punti: centro (le medie) e scale
  const PTS = [[-0.9, -0.65], [-0.55, -0.35], [-0.25, -0.5], [0.1, 0.12], [0.45, 0.4], [0.8, 0.7], [0.55, 0.25], [-0.4, 0.25], [0.3, -0.3]]; // scarti normalizzati (X, Y)
  const GR = { x: 100, y: 140, s: 34 }; // la griglia 5 × 5 delle coppie di estrazioni
  const RED = [true, true, false, false, false]; // le due palline rosse
  /* pallina dell'urna: rossa = arancione con una R, le altre vuote */
  const ball = (x, y, r, red, op = 1) => g({ op }, circ(x, y, r, { fill: red ? C.B : C.paper, fo: red ? 0.9 : 1, stroke: red ? C.B : C.soft, sw: 2 }) + (red ? tx(x, y + 6, 'R', { ff: SANS, size: 17, fill: C.paper }) : ''));

  PV.add('covarianza', {
    sec: '2.5',
    short: 'Covarianza: muoversi insieme',
    title: 'Covarianza: rettangoli degli scarti e varianza di una somma',
    alt: 'Animazione: su un diagramma di punti, ogni punto forma un rettangolo con le medie; è azzurro se i due scarti hanno lo stesso segno e arancione se hanno segno opposto, e la covarianza è la media di queste aree con segno: positiva per altezza e peso, negativa per prezzo e quantità. Poi un’urna con 5 palline di cui 2 rosse, estrazioni senza reimmissione: le coppie possibili sono 20, rossa-rossa vale 2/20 = 1/10, con reimmissione sarebbe 4/25, quindi Cov = 1/10 − 4/25 = −0,06 e Var(X + Y) = 0,24 + 0,24 − 0,12 = 0,36, meno di 0,48.',
    dur: 58.5,
    poster: 47,
    chap: [[0, 'Rettangoli degli scarti'], [25.7, 'Una somma: l’urna'], [48.5, 'Più o meno dispersa']],
    caps: [
      [0, 'La covarianza misura se due variabili si muovono insieme. Ogni punto dà un rettangolo: il prodotto dei suoi scarti dalle medie.'],
      [8.3, 'Azzurro se i due scarti hanno lo stesso segno, arancione se opposto. La covarianza è la media di queste aree con segno.'],
      [16.2, 'Altezza e peso crescono insieme: Cov > 0. Prezzo e quantità vanno in senso opposto: Cov < 0.'],
      [22.4, 'Per i conti: Cov(*X*,*Y*) = *E*[*XY*] − *E*[*X*]*E*[*Y*].'],
      [25.7, 'La covarianza entra nella varianza di una somma. Esempio: un’urna con 5 palline, 2 rosse, e due estrazioni senza reimmissione.'],
      [34, '*X* = la prima è rossa, *Y* = la seconda è rossa. Le coppie sono 20, perché la stessa pallina non esce due volte.'],
      [41.4, 'Rossa-rossa: 2 coppie su 20, *E*[*XY*] = 1/10. Con indipendenza sarebbero 4/25. Cov = 1/10 − 4/25 = −0,06.'],
      [48.5, 'Var(*X* + *Y*) = Var(*X*) + Var(*Y*) + 2 Cov = 0,24 + 0,24 − 0,12 = 0,36: meno di 0,48.'],
      [54.3, 'Se la prima è rossa, ne restano meno: gli scarti si compensano.'],
    ],
    frame(t) {
      let o = '';
      o += heading(t, 0.2, 25.2, 'Muoversi insieme: la covarianza') + subline(t, 0.4, 8.2, 'ogni punto: scarto di *X* per scarto di *Y*') + subline(t, 8.5, 22.2, 'la media delle aree con segno') + subline(t, 22.6, 25, '*E*[*XY*] − *E*[*X*]*E*[*Y*]');
      o += heading(t, 26.2, 48, 'Una somma: l’urna senza reimmissione') + subline(t, 26.4, 41.2, 'Var(*X* + *Y*) = Var(*X*) + Var(*Y*) + 2 Cov(*X*,*Y*)') + subline(t, 41.6, 47.8, '*X*, *Y* = «la prima / la seconda è rossa»');
      o += heading(t, 49, 58.8, 'La somma è meno dispersa', 'Cov negativa: gli scarti si compensano');

      /* capitolo 1: i punti, i rettangoli, il ribaltamento (altezza-peso → prezzo-quantità) */
      const a1 = 1 - p(t, 24.6, 25.4);
      if (a1 > 0.004) {
        const fr1 = p(t, 0.2, 1) * a1, fl = p(t, 10.8, 12.8, E.io), n1 = (1 - p(t, 10.8, 11.6)) * fr1, n2 = p(t, 11.8, 12.6) * a1;
        o += rect(56, 104, 288, 222, { rx: 6, stroke: C.line, sw: 1.6, op: fr1 });
        [['+', 328, 134], ['−', 72, 134], ['+', 72, 312], ['−', 328, 312]].forEach(([s, x, y]) => (o += tx(x, y, s, { size: 30, fill: C.soft, op: fr1 * 0.8 })));
        const cr = p(t, 0.5, 1.4);
        o += on(cr, path(`M${PL.cx} 108V322M60 ${PL.cy}H340`, { stroke: C.hi, sw: 2.4, da: '6 5', op: a1 * cr }));
        o += tx(200, 346, 'altezza', { ff: SANS, size: 17, fill: C.soft, op: n1 }) + tx(200, 346, 'prezzo', { ff: SANS, size: 17, fill: C.soft, op: n2 });
        o += g({ tf: T(30, 215, 1, -90), op: n1 }, tx(0, 6, 'peso', { ff: SANS, size: 17, fill: C.soft })) + g({ tf: T(30, 215, 1, -90), op: n2 }, tx(0, 6, 'quantità', { ff: SANS, size: 17, fill: C.soft }));
        PTS.forEach(([dx, dy0], i) => {
          const dy = dy0 * (1 - 2 * fl), px = PL.cx + dx * PL.sx, py = PL.cy - dy * PL.sy, ur = p(t, 4.4 + 0.4 * i, 5.2 + 0.4 * i), pos = dx * dy > 0, col = pos ? C.A : C.B;
          const x1 = PL.cx + (px - PL.cx) * ur, y1 = PL.cy + (py - PL.cy) * ur;
          o += on(ur, rect(Math.min(PL.cx, x1), Math.min(PL.cy, y1), Math.abs(x1 - PL.cx), Math.abs(y1 - PL.cy), { fill: col, fo: 0.2, stroke: col, sw: 1.6, so: 0.8, op: a1 }));
        });
        PTS.forEach(([dx, dy0], i) => {
          const dy = dy0 * (1 - 2 * fl), t0 = 1.2 + 0.28 * i, u = p(t, t0, t0 + 0.5, E.back);
          o += on(u, circ(PL.cx + dx * PL.sx, PL.cy - dy * PL.sy, 6.5 * u, { fill: C.paper, stroke: C.ink, sw: 2.2, op: a1 }));
        });
        /* pannello a destra */
        const lx = 1 - p(t, 21.2, 21.8), l1 = p(t, 2, 2.8) * a1 * lx, l2 = p(t, 3.2, 4) * a1 * lx;
        o += on(l1, tx(500, 126, 'prodotto degli scarti', { ff: SANS, size: 17, fill: C.soft, op: l1 }) + tx(500, 156, '(*X* − *μ**_{X}*)(*Y* − *μ**_{Y}*)', { size: 24, op: l1 }));
        o += on(l2, rect(374, 180, 22, 22, { rx: 4, fill: C.A, fo: 0.3, stroke: C.A, sw: 2, op: l2 }) + tx(406, 197, 'stesso segno: prodotto +', { ff: SANS, size: 17, ta: 'start', op: l2 }) + rect(374, 214, 22, 22, { rx: 4, fill: C.B, fo: 0.3, stroke: C.B, sw: 2, op: l2 }) + tx(406, 231, 'segno opposto: prodotto −', { ff: SANS, size: 17, ta: 'start', op: l2 }));
        const s1 = vis(t, 9, 20.6, 0.5, 0.4) * a1 * (1 - p(t, 10.8, 11.6)), s2 = vis(t, 13.2, 21, 0.5, 0.5) * a1;
        o += on(s1, txc(500, 276, [['Cov(*X*,*Y*) > 0', C.A]], { size: 28, op: s1 }) + tx(500, 306, 'altezza e peso:', { ff: SANS, size: 17, op: s1 }) + tx(500, 328, 'crescono insieme', { ff: SANS, size: 17, op: s1 }));
        o += on(s2, txc(500, 276, [['Cov(*X*,*Y*) < 0', C.B]], { size: 28, op: s2 }) + tx(500, 306, 'prezzo e quantità venduta:', { ff: SANS, size: 17, op: s2 }) + tx(500, 328, 'una sale, l’altra scende', { ff: SANS, size: 17, op: s2 }));
        const fo = p(t, 21.8, 22.8) * a1, fc = p(t, 23, 23.8) * a1;
        o += on(fo, tx(500, 178, 'Cov(*X*,*Y*) =', { size: 30, op: fo }) + tx(500, 226, '*E*[(*X* − *μ**_{X}*)(*Y* − *μ**_{Y}*)]', { size: 26, op: fo }));
        o += on(fc, rect(372, 246, 256, 48, { rx: 8, fill: C.hi, fo: 0.28 * fc, stroke: C.hi, sw: 2, so: fc }) + tx(500, 280, '= *E*[*XY*] − *E*[*X*]*E*[*Y*]', { size: 26, op: fc }));
      }

      /* capitolo 2: l'urna, le venti coppie, E[XY] e E[X]E[Y] */
      const a2 = p(t, 25.8, 26.6) * (1 - p(t, 48, 48.8));
      if (a2 > 0.004) {
        for (let i = 0; i < 5; i++) {
          const u = p(t, 27 + 0.2 * i, 27.6 + 0.2 * i, E.back);
          o += on(u, g({ tf: T(GR.x + GR.s * (i + 0.5), 122, u) }, ball(0, 0, 11, RED[i], a2)) + g({ tf: T(80, GR.y + GR.s * (i + 0.5), u) }, ball(0, 0, 11, RED[i], a2)));
        }
        const tt = p(t, 28.4, 29.2) * a2;
        o += on(tt, tx(GR.x + 2.5 * GR.s, 98, '2ª estrazione', { ff: SANS, size: 17, fill: C.soft, op: tt }) + g({ tf: T(44, GR.y + 2.5 * GR.s, 1, -90), op: tt }, tx(0, 6, '1ª estrazione', { ff: SANS, size: 17, fill: C.soft })));
        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 5; j++) {
            const u = p(t, 29 + 0.07 * (i + j), 29.6 + 0.07 * (i + j)), x = GR.x + GR.s * j + 1.5, y = GR.y + GR.s * i + 1.5, c = GR.s - 3, dg = i === j, rr = i < 2 && j < 2;
            const gone = dg ? p(t, 34.4 + 0.15 * i, 35.2 + 0.15 * i) : 0, valid = rr && !dg ? p(t, 41.6, 42.4) : 0, back = rr && dg ? p(t, 44.4, 45.2) : 0;
            let b = rect(x, y, c, c, { rx: 4, fill: C.paper, stroke: C.soft, sw: 1.4 });
            if (gone) b += rect(x, y, c, c, { rx: 4, fill: C.soft, fo: 0.25 * gone * (1 - back) }) + on(1 - back, cross(x + c / 2, y + c / 2, 18, gone, { op: 1 - back }));
            if (valid) b += rect(x, y, c, c, { rx: 4, fill: C.hi, fo: 0.55 * valid, stroke: C.hi, sw: 3, so: valid });
            if (back) b += rect(x, y, c, c, { rx: 4, fill: C.hi, fo: 0.2 * back, stroke: C.hi, sw: 3, da: '5 4', so: back });
            o += g({ op: u * a2 }, b);
          }
        }
        const n20 = p(t, 35.4, 36.2) * a2;
        o += on(n20, tx(GR.x + 2.5 * GR.s, 332, '20 coppie possibili', { ff: SANS, size: 17, fill: C.soft, op: n20 }));
        /* a destra: prima la regola, poi i numeri */
        const f1 = p(t, 26.8, 27.8) * (1 - p(t, 41.2, 41.9)) * a2;
        o += on(f1, tx(478, 156, 'Var(*X* + *Y*) =', { size: 26, op: f1 }) + tx(478, 194, 'Var(*X*) + Var(*Y*)', { size: 26, op: f1 }) + rect(372, 206, 212, 38, { rx: 8, fill: C.hi, fo: 0.28 * f1, stroke: C.hi, sw: 2, so: f1 }) + tx(478, 234, '+ 2 Cov(*X*,*Y*)', { size: 26, op: f1 }));
        const ra = p(t, 42.2, 43) * a2, rb = p(t, 44.4, 45.2) * a2, rc = p(t, 46.2, 47) * a2;
        o += on(ra, tx(330, 144, 'senza reimmissione:', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: ra }) + tx(330, 178, '*E*[*XY*] = 2/20 = 1/10', { size: 26, ta: 'start', op: ra }));
        o += on(rb, tx(330, 222, 'con reimmissione (indipendenti):', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: rb }) + tx(330, 256, '*E*[*X*]*E*[*Y*] = 4/25', { size: 26, ta: 'start', op: rb }));
        o += on(rc, tx(330, 300, 'Cov = 1/10 − 4/25', { size: 26, ta: 'start', op: rc }) + tx(330, 338, '= −0,06', { size: 30, fill: C.B, ta: 'start', op: rc }));
      }

      /* capitolo 3: la somma è meno dispersa */
      const a3 = p(t, 48.6, 49.4);
      if (a3 > 0.004) {
        const X0 = 176, K = 600, w1 = 0.24 * K, b1 = p(t, 49.6, 50.6), b2 = p(t, 51.8, 52.8), cv = p(t, 53, 54.2, E.io);
        o += on(b1, tx(X0 + w1, 128, 'indipendenti: 0,24 + 0,24 = 0,48', { ff: SANS, size: 17, fill: C.soft, op: b1 * a3 }));
        const seg = (y, op, cut) => rect(X0, y, w1, 36, { rx: 3, fill: C.A, fo: 0.35, stroke: C.A, sw: 2, op }) + rect(X0 + w1, y, w1 - cut, 36, { rx: 3, fill: C.B, fo: 0.35, stroke: C.B, sw: 2, op }) + tx(X0 + w1 / 2, y + 25, 'Var(*X*)', { size: 20, op }) + (cut < 40 ? tx(X0 + w1 * 1.5, y + 25, 'Var(*Y*)', { size: 20, op }) : '');
        o += on(b1, seg(140, b1 * a3, 0));
        o += on(b2, tx(X0 + w1, 212, 'con Cov = −0,06: la somma perde 2 Cov = −0,12', { ff: SANS, size: 17, fill: C.soft, op: b2 * a3 }));
        o += on(b2, seg(224, b2 * a3, 0.12 * K * cv));
        const cutx = X0 + 2 * w1 - 0.12 * K * cv;
        o += on(cv, rect(cutx, 224, 0.12 * K * cv, 36, { rx: 3, stroke: NO, sw: 2.4, da: '6 4', op: a3 }) + tx(cutx + 0.06 * K * cv, 250, '−0,12', { size: 20, fill: NO, op: p(t, 53.6, 54.2) * a3 }));
        const rs = p(t, 54.4, 55.2) * a3;
        o += on(rs, brace(X0, X0 + 2 * w1 - 0.12 * K, 268, C.hi, rs, 1) + tx(X0 + w1 - 0.06 * K, 300, 'Var(*X* + *Y*) = 0,36', { size: 28, op: rs }));
        const fi = p(t, 56, 56.8) * a3;
        o += on(fi, pills(340, [{ s: 'meno dei 0,48 del caso indipendente', col: C.hi, op: fi }]));
      }
      return o;
    },
  });
  /* ======================================================================
     2.6 · Binomiale: n prove, quanti successi (moneta truccata, p = 0,3)
     ====================================================================== */
  const cnk = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; };
  const binPmf = (n, pr) => Array.from({ length: n + 1 }, (_, k) => cnk(n, k) * pr ** k * (1 - pr) ** (n - k));
  const B10 = binPmf(10, 0.3);
  const HX = (k) => 52 + 33 * k, HB = 300, HS = 620; // istogramma: ascisse, base e scala (1 = 620 unità)
  const RUN1 = [0, 1, 0, 0, 1, 0, 0, 0, 1, 0], RUN2 = [1, 0, 1, 1, 0, 0, 1, 0, 0, 1]; // 1 = successo (testa)
  /* gettone di una prova: u da 0 (in attesa) a 1 (rivelato), con giro intorno all'asse verticale */
  function tok(x, y, s, u, op = 1, k = 1) {
    const sx = u <= 0 || u >= 1 ? 1 : Math.abs(Math.cos(Math.PI * u));
    const face = u >= 0.5 ? (s ? circ(0, 0, 15, { fill: C.A, fo: 0.9, stroke: C.A, sw: 2 }) + tx(0, 6, 'S', { ff: SANS, size: 17, fill: C.paper }) : circ(0, 0, 15, { fill: C.paper, stroke: C.soft, sw: 2 }) + tx(0, 6, 'F', { ff: SANS, size: 17, fill: C.soft })) : circ(0, 0, 15, { fill: C.paper, stroke: C.soft, sw: 1.6, da: '4 3' });
    return g({ op, tf: `translate(${f(x)} ${f(y)}) scale(${f(sx * k)} ${f(k)})` }, face);
  }

  PV.add('binomiale', {
    sec: '2.6',
    short: 'Binomiale: quanti successi su n prove',
    title: 'Binomiale: n prove indipendenti, quanti successi (moneta truccata, p = 0,3)',
    alt: 'Animazione: una moneta truccata che fa testa con probabilità 0,3 viene lanciata 10 volte, e X è il numero di successi. Con 3 prove e 2 successi le sequenze SSF, SFS e FSS valgono tutte p²(1 − p) e sono C(3,2) = 3. In generale P(X = k) = C(n,k) p^k (1 − p)^(n − k). Con n = 10, p = 0,3 e k = 3: 120 × 0,027 × 0,0824 ≈ 0,2668; l’istogramma dà tutte le probabilità, che sommano a 1. La media è np = 3, la varianza np(1 − p) = 2,1 e la deviazione standard circa 1,45.',
    dur: 58.5,
    poster: 44.5,
    chap: [[0, 'Dieci prove, quanti successi'], [11.5, 'Tre prove, due successi'], [29, 'La formula'], [35.5, 'L’istogramma, con i numeri'], [47.3, 'Media e varianza']],
    caps: [
      [0, 'Ripetiamo 10 volte, in modo indipendente, la stessa prova: una moneta truccata che fa testa con probabilità 0,3.'],
      [7, '*X* = numero di successi (teste): cambia a ogni serie, da 0 a 10.'],
      [11.5, 'Poche prove per capire: *n* = 3 e *k* = 2 successi. Le sequenze sono SSF, SFS, FSS.'],
      [17, 'Ognuna vale *p*^2(1 − *p*): le prove sono indipendenti, e l’ordine dei fattori non conta.'],
      [22.8, 'Sono tante quante le posizioni delle due S: C(3,2) = 3. Quindi P(*X* = 2) = 3 *p*^2(1 − *p*).'],
      [29, 'In generale, C(*n*,*k*) sequenze, ognuna con probabilità *p**^k*(1 − *p*)*^{n−k}*: la probabilità è il prodotto.'],
      [35.5, 'Con *n* = 10, *p* = 0,3 e *k* = 3: 120 × 0,3^3 × 0,7^7 ≈ 0,2668. Circa il 27%.'],
      [40.5, 'Ripetendo per ogni *k* si ottiene l’istogramma: le probabilità sommano a 1, per il teorema del binomio.'],
      [47.3, '*X* è la somma di *n* indicatrici indipendenti: media *np* = 3 e varianza *np*(1 − *p*) = 2,1.'],
      [53.4, 'La deviazione standard è circa 1,45: i valori tipici stanno fra 1,5 e 4,5.'],
    ],
    frame(t) {
      let o = '';
      o += heading(t, 0.2, 11, 'Quanti successi su dieci prove', 'testa = successo, con probabilità 0,3');
      o += heading(t, 11.8, 28.6, 'Tre prove, due successi', 'le sequenze SSF, SFS, FSS');
      o += heading(t, 29.4, 35, 'La formula binomiale', 'sequenze × probabilità di ciascuna');
      o += heading(t, 35.9, 47, 'Dieci lanci, *k* = 3', '120 sequenze, ognuna con probabilità 0,3^3 · 0,7^7');
      o += heading(t, 47.7, 58.4, 'Media e varianza', '*X* come somma di indicatrici');

      /* capitolo 1: due serie di dieci lanci */
      const a1 = 1 - p(t, 10.6, 11.4);
      if (a1 > 0.004) {
        [[RUN1, 140, 2, '*X* = 3', 5.2], [RUN2, 206, 7, '*X* = 5', 9.9]].forEach(([run, y, s0, lab, tl], r) => {
          run.forEach((s, i) => {
            const t0 = (r ? 6.2 : 0.4) + 0.12 * i, fl = p(t, s0 + 0.3 * i, s0 + 0.3 * i + 0.5, E.lin);
            o += on(p(t, t0, t0 + 0.4), tok(90 + 46 * i, y, s === 1, fl, p(t, t0, t0 + 0.3) * a1));
          });
          const lo = p(t, tl, tl + 0.8) * a1;
          o += on(lo, tx(540, y + 8, lab, { size: 24, ta: 'start', op: lo }));
        });
        const lg = p(t, 1, 2) * a1;
        o += on(lg, tok(110, 282, true, 1, lg) + tx(132, 288, 'successo: testa, 0,3', { ff: SANS, size: 17, ta: 'start', op: lg }) + tok(350, 282, false, 1, lg) + tx(372, 288, 'insuccesso: croce, 0,7', { ff: SANS, size: 17, ta: 'start', op: lg }));
      }

      /* capitolo 2: n = 3, k = 2 */
      const a2 = p(t, 11.8, 12.6) * (1 - p(t, 28.4, 29.2));
      if (a2 > 0.004) {
        const rows = [[[1, 1, 0], '*p* · *p* · (1 − *p*)'], [[1, 0, 1], '*p* · (1 − *p*) · *p*'], [[0, 1, 1], '(1 − *p*) · *p* · *p*']];
        const hl = p(t, 19.8, 20.8);
        o += on(hl, rect(436, 128, 166, 164, { rx: 10, fill: C.hi, fo: 0.2 * hl, stroke: C.hi, sw: 2.4, so: hl, op: a2 }));
        rows.forEach(([seq, prod], r) => {
          const y = 158 + 56 * r, u = p(t, 12.4 + 0.7 * r, 13 + 0.7 * r), pr = p(t, 17.4 + 0.8 * r, 18.2 + 0.8 * r), rs = p(t, 19 + 0.4 * r, 19.8 + 0.4 * r);
          seq.forEach((s, i) => (o += on(u, tok(124 + 44 * i, y, s === 1, 1, u * a2))));
          o += on(pr, tx(244, y + 8, prod, { size: 22, ta: 'start', op: pr * a2 }));
          o += on(rs, tx(444, y + 8, '= *p*^2(1 − *p*)', { size: 22, ta: 'start', op: rs * a2 }));
        });
        const bz = p(t, 23, 23.8) * a2;
        o += on(bz, lbrace(100, 134, 284, C.B, bz) + bn(64, 209, '3', '2', { size: 26, fill: C.B, op: bz }));
        const fl = p(t, 26, 27) * a2;
        o += on(fl, txc(320, 336, [['P(*X* = 2) = ', C.ink], ['3', C.B], [' *p*^2(1 − *p*)', C.ink]], { size: 30, op: fl }));
      }

      /* capitolo 3: la formula in generale */
      const a3 = p(t, 29.4, 30.2) * (1 - p(t, 35, 35.8));
      if (a3 > 0.004) {
        o += tx(112, 168, 'P(*X* = *k*) =', { size: 32, ta: 'start', op: a3 }) + bn(316, 168, '*n*', '*k*', { size: 32, op: a3 }) + tx(346, 168, '*p**^k*', { size: 32, fill: C.A, ta: 'start', op: a3 }) + tx(384, 168, '(1 − *p*)*^{n−k}*', { size: 32, fill: C.B, ta: 'start', op: a3 });
        const l1 = p(t, 30.6, 31.4) * a3, l2 = p(t, 32.2, 33) * a3, l3 = p(t, 33.6, 34.4) * a3;
        const lines = [[l1, C.hi, 'quante sequenze: in quanti modi scegli i posti dei successi'], [l2, C.A, '*k* successi, ognuno con probabilità *p*'], [l3, C.B, '*n* − *k* insuccessi, ognuno con probabilità 1 − *p*']];
        lines.forEach(([op, col, s], i) => {
          o += on(op, rect(60, 226 + 40 * i, 16, 16, { rx: 4, fill: col, fo: 0.35, stroke: col, sw: 2, op }) + tx(88, 240 + 40 * i, s, { ff: SANS, size: 17, ta: 'start', op }));
        });
      }

      /* capitoli 4 e 5: l'istogramma di Bin(10; 0,3) */
      const a4 = p(t, 35.9, 36.6);
      if (a4 > 0.004) {
        const tail = p(t, 47.2, 48);
        o += path(`M${HX(0) - 22} ${HB}H${HX(10) + 22}`, { stroke: C.soft, sw: 1.8, op: a4 });
        /* fascia di una deviazione standard e media (capitolo 5) */
        const bd = p(t, 49.6, 50.8), mn = p(t, 47.6, 48.4);
        const sg = Math.sqrt(2.1);
        o += on(bd, rect(HX(3 - sg), 112, HX(3 + sg) - HX(3 - sg), HB - 112, { rx: 6, fill: C.hi, fo: 0.2 * bd, stroke: C.hi, sw: 2, so: bd }));
        for (let k = 0; k <= 10; k++) {
          const u = k === 3 ? p(t, 36.6, 37.8) : p(t, 40.6 + 0.14 * k, 41.6 + 0.14 * k), h = B10[k] * HS * u, hi = k === 3 ? 1 - 0.5 * p(t, 40.4, 41) : 1;
          o += on(u, rect(HX(k) - 13, HB - h, 26, h, { rx: 2, fill: k === 3 ? C.hi : C.A, fo: k === 3 ? 0.55 : 0.4, stroke: k === 3 ? C.hi : C.A, sw: k === 3 ? 3 : 1.6, op: a4 }));
          o += on(u, lb(HX(k), HB + 22, k, { op: u * a4 }));
        }
        const v3 = p(t, 37.4, 38.2);
        o += on(v3 * (1 - tail), tx(HX(3), HB - B10[3] * HS - 10, '0,2668', { size: 22, op: v3 * (1 - tail) * a4 }));
        o += on(mn, path(`M${HX(3)} 108V${HB}`, { stroke: C.hi, sw: 3, da: '6 5', op: a4, ...draw(mn) }) + tx(HX(3), 100, '*np* = 3', { size: 22, op: mn * a4 }));
        const sm = p(t, 44.6, 45.4) * (1 - tail);
        o += on(sm, pills(342, [{ s: 'le probabilità sommano a 1', col: C.hi, op: sm }], 207));
        /* pannello dei numeri (capitolo 4) */
        const n1 = p(t, 36.2, 37) * (1 - p(t, 46.6, 47.4)), n2 = p(t, 37.6, 38.4) * (1 - p(t, 46.6, 47.4)), n3 = p(t, 38.6, 39.4) * (1 - p(t, 46.6, 47.4)), n4 = p(t, 39.8, 40.6) * (1 - p(t, 46.6, 47.4));
        o += on(n1, bn(426, 138, '10', '3', { size: 26, op: n1 }) + tx(460, 148, '= 120', { size: 26, ta: 'start', op: n1 }));
        o += on(n2, tx(412, 198, '0,3^3 = 0,027', { size: 26, ta: 'start', op: n2 }));
        o += on(n3, tx(412, 240, '0,7^7 ≈ 0,0824', { size: 26, ta: 'start', op: n3 }));
        o += on(n4, tx(412, 282, '120 × 0,027 × 0,0824', { size: 22, ta: 'start', op: n4 }) + rect(408, 296, 220, 42, { rx: 8, fill: C.hi, fo: 0.28 * n4, stroke: C.hi, sw: 2, so: n4 }) + tx(518, 326, '≈ 0,2668', { size: 30, op: n4 }));
        /* pannello di media e varianza (capitolo 5) */
        const m1 = p(t, 47.8, 48.6), m2 = p(t, 49.4, 50.2), m3 = p(t, 50.6, 51.4), m4 = p(t, 51.8, 52.6), m5 = p(t, 53.4, 54.2);
        o += on(m1, tx(412, 148, '*X* = *X**_{1}* + … + *X**_{n}*', { size: 24, ta: 'start', op: m1 }) + tx(412, 182, 'indicatrici indipendenti', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: m1 }));
        o += on(m2, tx(412, 224, '*E*[*X*] = *np* = 3', { size: 26, ta: 'start', op: m2 }));
        o += on(m3, tx(412, 266, 'Var(*X*) = *np*(1 − *p*)', { size: 24, ta: 'start', op: m3 }));
        o += on(m4, tx(412, 298, '= 10 · 0,3 · 0,7 = 2,1', { size: 22, ta: 'start', op: m4 }));
        o += on(m5, tx(412, 336, 'σ ≈ 1,45', { size: 28, ta: 'start', op: m5 }));
      }
      return o;
    },
  });
  /* ======================================================================
     2.6 · Geometrica: il dado fino al primo 6, la coda, l'assenza di memoria, la binomiale negativa
     ====================================================================== */
  const G12 = Array.from({ length: 12 }, (_, i) => (5 / 6) ** i / 6); // P(X = k), k = 1…12, con p = 1/6
  const GX = (k) => 46 + 29 * (k - 1), GB = 290, GS = 860; // istogramma: ascisse, base e scala (1 = 860 unità)
  const ROLLA = [2, 5, 6], ROLLB = [4, 1, 3, 5, 2, 4, 6]; // le due serie di lanci
  const CALL = [0, 1, 0, 0, 1, 0, 0, 1]; // otto telefonate, la terza vendita alla numero 8

  PV.add('geometrica', {
    sec: '2.6',
    short: 'Geometrica: l’attesa del primo successo',
    title: 'Geometrica: il dado fino al primo 6, assenza di memoria e binomiale negativa',
    alt: 'Animazione: si lancia un dado fino al primo 6, con p = 1/6, e X è il numero di lanci. Il primo 6 al lancio k richiede k − 1 fallimenti e poi un successo: P(X = k) = (1 − p)^(k − 1) p, per k = 3 vale 5/6 · 5/6 · 1/6 = 25/216, circa 0,1157, e ogni barra è 5/6 della precedente. La coda è P(X > n) = (1 − p)^n, la media è 1/p = 6 e la varianza 30. Dopo 3 lanci falliti la parte rimasta, riscalata, coincide con la distribuzione di partenza: assenza di memoria. Per aspettare l’r-esimo successo si sommano r attese geometriche: in un call center con p = 0,3 e r = 3 la media è 10 telefonate e P(X = 8) = 21 · 0,3³ · 0,7⁵ ≈ 0,0953.',
    dur: 58,
    poster: 31.5,
    chap: [[0, 'Fino al primo 6'], [11.3, 'Una formula che si legge da sola'], [23.5, 'Coda e media'], [33.5, 'Assenza di memoria'], [45.5, 'Aspettare l’r-esimo successo']],
    caps: [
      [0, 'Ripetiamo la stessa prova finché non esce il primo successo: un dado fino al primo 6, con *p* = 1/6.'],
      [6.5, '*X* = numero di lanci, compreso quello riuscito: 1, 2, 3, … senza limite.'],
      [11.3, 'Il primo 6 al lancio *k*: i primi *k* − 1 falliscono e l’ultimo riesce. P(*X* = *k*) = (1 − *p*)*^{k−1}* *p*.'],
      [18, 'Per *k* = 3: 5/6 · 5/6 · 1/6 = 25/216 ≈ 0,1157. Ogni barra vale 5/6 della precedente.'],
      [23.5, 'Più di *n* lanci vuol dire che i primi *n* falliscono: P(*X* > *n*) = (1 − *p*)*^n*.'],
      [28.8, 'In media servono 1/*p* = 6 lanci, anche se il valore più probabile è 1.'],
      [33.5, 'Assenza di memoria: dopo 3 lanci falliti, quello che resta ha la stessa forma di prima, solo spostato.'],
      [40.2, 'P(*X* > *n* + *m* | *X* > *n*) = P(*X* > *m*): il dado non si ricorda del passato.'],
      [45.5, 'Per aspettare l’*r*-esimo successo si sommano *r* attese geometriche: media *r*/*p*.'],
      [50.8, 'Call center, *p* = 0,3 e *r* = 3: media 10 telefonate. P(*X* = 8) = 21 · 0,3^3 · 0,7^5 ≈ 0,0953.'],
    ],
    frame(t) {
      let o = '';
      o += heading(t, 0.2, 10.8, 'Aspettare il primo successo', 'un dado fino al primo 6');
      o += heading(t, 11.7, 22.8, 'La densità si legge da sola', 'i primi *k* − 1 falliscono, l’ultimo riesce');
      o += heading(t, 23.9, 32.8, 'Coda e media', 'P(*X* > *n*) = (1 − *p*)*^n*');
      o += heading(t, 33.9, 45, 'Assenza di memoria', 'dopo 3 fallimenti si riparte da capo');
      o += heading(t, 45.9, 58.4, 'Fino all’*r*-esimo successo', 'la binomiale negativa');

      /* capitolo 1: due serie di lanci */
      const a1 = 1 - p(t, 10.4, 11.2);
      if (a1 > 0.004) {
        [[ROLLA, 138, 96, 70, 0.8, 1.1, '*X* = 3', 4.2], [ROLLB, 238, 80, 60, 5.3, 0.6, '*X* = 7', 10]].forEach(([rolls, y, x0, dx, s0, ds, lab, tl]) => {
          rolls.forEach((n, i) => {
            const t0 = s0 + ds * i, d = dieAt(t, [[t0, 0.9, n]], 1, 22), op = p(t, t0 - 0.3, t0) * a1, win = n === 6, mk = p(t, t0 + 1, t0 + 1.5, E.lin);
            o += on(op, die(x0 + dx * i, y + d.dy, 44, d.face, { rot: d.rot, op }));
            o += on(mk, win ? check(x0 + dx * i, y + 44, 20, mk, { op: a1 }) + rect(x0 + dx * i - 29, y - 29, 58, 58, { rx: 11, stroke: C.hi, sw: 3.4, so: mk, op: a1 }) : cross(x0 + dx * i, y + 44, 18, mk, { op: a1 }));
          });
          const lo = p(t, tl, tl + 0.8) * a1;
          o += on(lo, tx(548, y + 8, lab, { size: 26, ta: 'start', op: lo }));
        });
      }

      /* capitolo 2: tre caselle, la formula, il numero */
      const a2 = p(t, 11.7, 12.4) * (1 - p(t, 20.8, 21.6));
      if (a2 > 0.004) {
        [[170, '5/6', C.B, 'non 6', 12], [320, '5/6', C.B, 'non 6', 12.5], [470, '1/6', C.A, '6', 13]].forEach(([x, s, col, lab, t0], i) => {
          const u = p(t, t0, t0 + 0.6, E.back);
          o += on(u, tile(x, 146, 70, s, { stroke: col, veil: col, vo: 0.15, size: 26, sc: u, op: a2 }));
          o += on(u, tx(x, 206, lab, { ff: SANS, size: 17, fill: C.soft, op: u * a2 }));
          if (i < 2) o += on(u, tx(x + 75, 156, '×', { size: 32, fill: C.soft, op: u * a2 }));
        });
        const fm = p(t, 13.8, 14.8) * a2;
        o += on(fm, txc(320, 262, [['P(*X* = *k*) = ', C.ink], ['(1 − *p*)*^{k−1}' + ZW + '*', C.B], [' *p*', C.A]], { size: 32, op: fm }));
        const nm = p(t, 18, 19) * a2;
        o += on(nm, tx(320, 314, 'P(*X* = 3) = 5/6 · 5/6 · 1/6 = 25/216 ≈ 0,1157', { size: 26, op: nm }));
      }

      /* capitoli 2-4: l'istogramma di Geom(1/6) */
      const ah = p(t, 21, 21.6) * (1 - p(t, 45.2, 46));
      if (ah > 0.004) {
        o += path(`M${GX(1) - 20} ${GB}H${GX(12) + 20}`, { stroke: C.soft, sw: 1.8, op: ah });
        const tailU = p(t, 24.4, 25.4), fade = p(t, 35, 36), sl = p(t, 36.6, 39.6, E.io), mg = p(t, 28.6, 29.6);
        /* contorni di partenza (capitolo 4) */
        const gh = p(t, 36, 36.8);
        for (let k = 1; k <= 12; k++) {
          const u = p(t, 21.4 + 0.12 * k, 22.2 + 0.12 * k), tail = k >= 4;
          const col = tail && tailU > 0.5 ? C.B : C.A;
          if (gh > 0.01 && k <= 9) o += rect(GX(k) - 11, GB - G12[k - 1] * GS, 22, G12[k - 1] * GS, { rx: 2, stroke: C.A, sw: 2, da: '5 4', so: gh, op: ah });
          const move = tail ? sl : 0, x = GX(k) - 3 * 29 * move, h = G12[k - 1] * GS * u * lerp(1, 1 / (5 / 6) ** 3, move), op = ah * (tail ? 1 : 1 - 0.7 * fade);
          o += on(u, rect(x - 11, GB - h, 22, h, { rx: 2, fill: col, fo: 0.42, stroke: col, sw: 1.8, op }));
          if (tail) {
            const l0 = u * ah * (1 - p(t, 36.6, 37.4)), l1 = p(t, 39.2, 39.8) * ah;
            o += on(l0, lb(GX(k), GB + 22, k, { op: l0 })) + on(l1, lb(GX(k - 3), GB + 22, k - 3, { op: l1 }));
          } else o += on(u, lb(x, GB + 22, k, { op: u * ah * (1 - fade) }));
        }
        /* capitolo 2: la barra k = 3 e il rapporto 5/6 */
        const b3 = p(t, 21.8, 22.8) * (1 - p(t, 24, 24.8));
        o += on(b3, tx(GX(3), GB - G12[2] * GS - 10, '0,1157', { size: 20, op: b3 * ah }));
        const rt = p(t, 22.4, 23.2) * (1 - p(t, 24, 24.8));
        o += on(rt, tx(GX(1.5) + 6, 128, '× 5/6', { ff: SANS, size: 17, fill: C.B, op: rt * ah }) + tx(GX(2.5) + 6, 150, '× 5/6', { ff: SANS, size: 17, fill: C.B, op: rt * ah }));
        /* capitolo 3: coda e media */
        const br = p(t, 24.8, 25.6) * (1 - p(t, 33.5, 34.2));
        o += on(br, brace(GX(4) - 12, GX(12) + 12, 196, C.B, br, -1) + tx(GX(8) + 6, 176, 'P(*X* > 3) ≈ 0,579', { ff: SANS, size: 17, fill: C.B, op: br * ah }));
        o += on(mg, path(`M${GX(6)} 112V${GB}`, { stroke: C.hi, sw: 3, da: '6 5', op: ah * (1 - p(t, 33.5, 34.2)), ...draw(mg) }) + tx(GX(6), 104, 'media 6', { size: 22, op: mg * ah * (1 - p(t, 33.5, 34.2)) }));
        /* pannello di destra, capitolo 3 */
        const q1 = p(t, 24.4, 25.2) * (1 - p(t, 33.5, 34.2)), q2 = p(t, 26, 26.8) * (1 - p(t, 33.5, 34.2)), q3 = p(t, 29.2, 30) * (1 - p(t, 33.5, 34.2)), q4 = p(t, 31, 31.8) * (1 - p(t, 33.5, 34.2));
        o += on(q1, tx(402, 150, 'P(*X* > *n*)', { size: 26, ta: 'start', op: q1 * ah }) + tx(402, 184, '= (1 − *p*)*^n*', { size: 26, ta: 'start', op: q1 * ah }));
        o += on(q2, tx(402, 220, '(5/6)^3 ≈ 0,579', { size: 22, ta: 'start', fill: C.B, op: q2 * ah }));
        o += on(q3, rect(398, 244, 230, 40, { rx: 8, fill: C.hi, fo: 0.25 * q3, stroke: C.hi, sw: 2, so: q3, op: ah }) + tx(408, 274, '*E*[*X*] = 1/*p* = 6', { size: 26, ta: 'start', op: q3 * ah }));
        o += on(q4, tx(402, 322, 'Var(*X*) = 30, σ ≈ 5,5', { size: 22, ta: 'start', op: q4 * ah }));
        /* capitolo 4: scritte */
        const m1 = vis(t, 34.6, 40, 0.5, 0.5) * ah, m2 = p(t, 39.4, 40.2) * (1 - p(t, 45, 45.6)) * ah, m3 = p(t, 41, 41.8) * (1 - p(t, 45, 45.6)) * ah;
        o += on(m1, tx(402, 150, 'tre lanci', { size: 24, ta: 'start', op: m1 }) + tx(402, 180, 'già falliti', { size: 24, ta: 'start', op: m1 }) + tx(402, 224, 'quello che resta,', { ff: SANS, size: 17, fill: C.B, ta: 'start', op: m1 }) + tx(402, 246, 'diviso per 0,579:', { ff: SANS, size: 17, fill: C.B, ta: 'start', op: m1 }));
        o += on(m2, tx(402, 172, 'la stessa forma', { size: 26, ta: 'start', op: m2 }) + tx(402, 206, 'di prima', { size: 26, ta: 'start', op: m2 }));
        o += on(m3, tx(320, 346, 'P(*X* > *n* + *m* | *X* > *n*) = P(*X* > *m*)', { size: 24, op: m3 }));
      }

      /* capitolo 5: la binomiale negativa */
      const a5 = p(t, 45.9, 46.6);
      if (a5 > 0.004) {
        CALL.forEach((s, i) => {
          const t0 = 46.6 + 0.12 * i, fl = p(t, 47 + 0.3 * i, 47.5 + 0.3 * i, E.lin);
          o += on(p(t, t0, t0 + 0.4), tok(96 + 56 * i, 184, s === 1, fl, p(t, t0, t0 + 0.3) * a5));
        });
        [[0, 1, C.A, '*T*_1 = 2'], [2, 4, C.B, '*T*_2 = 3'], [5, 7, C.C, '*T*_3 = 3']].forEach(([a, b, col, lab], i) => {
          const u = p(t, 48.2 + 0.6 * i, 49 + 0.6 * i) * a5, xa = 96 + 56 * a, xb = 96 + 56 * b;
          o += on(u, brace(xa - 20, xb + 20, 210, col, u, 1) + tx((xa + xb) / 2, 238, lab, { ff: SANS, size: 17, fill: col, op: u }));
        });
        const bk = p(t, 50.6, 51.4) * a5, rg = p(t, 51, 51.8) * a5;
        o += on(bk, brace(96 - 18, 96 + 56 * 6 + 18, 154, C.B, bk, -1) + tx(96 + 56 * 3, 132, '2 successi nei primi 7: 21 modi', { ff: SANS, size: 17, fill: C.B, op: bk }));
        o += on(rg, rect(96 + 56 * 7 - 22, 162, 44, 44, { rx: 12, stroke: C.hi, sw: 3.6, so: rg }));
        const fo = p(t, 51.4, 52.4) * a5, mu = p(t, 54.6, 55.6) * a5;
        o += on(fo, tx(320, 284, 'P(*X* = 8) = 21 · 0,3^3 · 0,7^5 ≈ 0,0953', { size: 28, op: fo }));
        o += on(mu, rect(96, 300, 448, 44, { rx: 8, fill: C.hi, fo: 0.25 * mu, stroke: C.hi, sw: 2, so: mu }) + tx(320, 332, '*E*[*X*] = *r*/*p* = 3/0,3 = 10 telefonate', { size: 26, op: mu }));
      }
      return o;
    },
  });
  /* ======================================================================
     2.6 · Poisson: eventi in un intervallo (centralino, λ = 3), λ dipende dall'intervallo
     ====================================================================== */
  const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
  const poisPmf = (lam, n) => Array.from({ length: n + 1 }, (_, k) => Math.exp(-lam) * lam ** k / fact(k));
  const P3 = poisPmf(3, 8);
  const HOURS = [[14, 41], [6, 17, 28, 45, 55], [10, 33, 52], [5, 22, 38, 49], [30]]; // minuti delle chiamate in cinque ore
  const PHX = (k) => 52 + 36 * k, PHB = 296, PHS = 780; // istogramma di Poisson(3): ascisse, base, scala

  PV.add('poisson', {
    sec: '2.6',
    short: 'Poisson: eventi in un intervallo',
    title: 'Poisson: eventi rari in un intervallo (centralino, λ = 3)',
    alt: 'Animazione: le chiamate a un centralino, in media 3 all’ora, sono eventi indipendenti a ritmo costante; λ è il numero medio nell’intervallo e dipende dalla sua lunghezza: con 4 clienti all’ora, in mezz’ora λ = 2 e in due ore λ = 8. La densità è P(X = k) = e^(−λ) λ^k / k!; con λ = 3 e k = 5 vale 0,0498 × 243/120 ≈ 0,1008. L’istogramma di Poisson(3) sale finché k ≤ λ, quindi k = 2 e k = 3 sono alla pari (0,2240); le probabilità sommano a 1 e media e varianza valgono entrambe λ.',
    dur: 58,
    poster: 48.5,
    chap: [[0, 'Eventi in un intervallo'], [13.3, 'λ dipende dall’intervallo'], [27.3, 'La formula'], [40, 'L’istogramma e la media']],
    caps: [
      [0, 'Si conta quante volte succede qualcosa in un intervallo fissato: chiamate a un centralino, in media 3 all’ora.'],
      [7.2, 'Gli eventi sono indipendenti, a ritmo costante e rari. *λ* = 3 è il numero medio nell’intervallo.'],
      [13.3, 'Attenzione: *λ* dipende dall’intervallo. Con 4 clienti all’ora, in mezz’ora *λ* = 2; in due ore *λ* = 8.'],
      [20, 'È l’errore più frequente: il parametro è il ritmo per la lunghezza dell’intervallo della domanda.'],
      [27.3, 'La densità è P(*X* = *k*) = *e*^{−λ} *λ**^k*/*k*!. Con *λ* = 3 e *k* = 5: 0,0498 × 243/120 ≈ 0,1008.'],
      [34, 'Circa il 10%. Per confronto P(*X* = 3) = 0,224: il valore più probabile è vicino alla media.'],
      [40, 'Ecco Poisson(3): il rapporto fra due barre consecutive è *λ*/*k*, quindi le barre salgono finché *k* ≤ 3.'],
      [47.7, 'Per questo *k* = 2 e *k* = 3 sono alla pari. Le probabilità sommano a 1, perché *e*^{−λ} · *e*^{λ} = 1.'],
      [54.4, 'Media e varianza valgono entrambe *λ*.'],
    ],
    frame(t) {
      let o = '';
      o += heading(t, 0.2, 12.8, 'Contare eventi nel tempo', 'chiamate a un centralino, cinque ore diverse');
      o += heading(t, 13.9, 26.8, '*λ* dipende dall’intervallo', 'ritmo: 4 clienti all’ora');
      o += heading(t, 27.9, 39.6, 'La densità di Poisson', 'P(*X* = *k*) = *e*^{−λ} *λ**^k*/*k*!');
      o += heading(t, 40.4, 58.4, 'Poisson(3)', 'il rapporto fra due barre è *λ*/*k*');

      /* capitolo 1: cinque ore, le chiamate passano sotto una linea che scorre */
      const a1 = 1 - p(t, 12.4, 13.2);
      if (a1 > 0.004) {
        const x0 = 100, x1 = 500, ph = p(t, 1, 7.5, E.lin);
        HOURS.forEach((ev, r) => {
          const y = 132 + 38 * r, ax = p(t, 0.3 + 0.1 * r, 0.9 + 0.1 * r) * a1;
          o += path(`M${x0} ${y}H${x1}`, { stroke: C.soft, sw: 1.8, op: ax }) + ln(x0, y - 5, x0, y + 5, { stroke: C.soft, sw: 1.6, op: ax }) + ln(x1, y - 5, x1, y + 5, { stroke: C.soft, sw: 1.6, op: ax });
          o += tx(44, y + 6, 'ora ' + (r + 1), { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: ax });
          ev.forEach((m) => {
            const tp = 1 + 6.5 * (m / 60), u = p(t, tp, tp + 0.4, E.back);
            o += on(u, circ(x0 + (m / 60) * 400, y, 8 * u, { fill: C.A, fo: 0.9, stroke: C.paper, sw: 1.4, op: a1 }));
          });
          const co = p(t, 7.8 + 0.25 * r, 8.5 + 0.25 * r) * a1;
          o += on(co, tx(522, y + 8, ev.length, { size: 26, op: co }));
        });
        const sw = p(t, 1, 1.3) * (1 - p(t, 7.5, 8)) * a1;
        o += on(sw, path(`M${f(lerp(x0, x1, ph))} 110V308`, { stroke: C.hi, sw: 3.4, op: sw }));
        const mu = p(t, 10, 10.9) * a1;
        o += on(mu, rect(556, 190, 76, 52, { rx: 10, fill: C.hi, fo: 0.28 * mu, stroke: C.hi, sw: 2, so: mu }) + tx(594, 226, '*λ* = 3', { size: 28, op: mu }) + tx(594, 178, 'in media', { ff: SANS, size: 17, fill: C.soft, op: mu }));
      }

      /* capitolo 2: λ = ritmo × lunghezza */
      const a2 = p(t, 13.9, 14.6) * (1 - p(t, 26.4, 27.2));
      if (a2 > 0.004) {
        const X = (h) => 70 + 240 * h, ya = 140, ax = p(t, 14, 14.8) * a2;
        o += path(`M${X(0)} ${ya}H${X(2)}`, { stroke: C.soft, sw: 2, op: ax });
        [[0, '0'], [0.5, '½ h'], [1, '1 h'], [1.5, '1,5 h'], [2, '2 h']].forEach(([h, s]) => (o += ln(X(h), ya - 5, X(h), ya + 5, { stroke: C.soft, sw: 1.6, op: ax }) + lb(X(h), ya + 28, s, { op: ax })));
        [0.12, 0.31, 0.62, 0.88, 1.15, 1.37, 1.62, 1.88].forEach((h, i) => {
          const t0 = 14.8 + 0.18 * i, u = p(t, t0, t0 + 0.4, E.back);
          o += on(u, circ(X(h), ya, 8 * u, { fill: C.A, fo: 0.9, stroke: C.paper, sw: 1.4, op: a2 }));
        });
        const w1 = p(t, 17, 17.8) * a2, w2 = p(t, 21, 21.8) * a2;
        o += on(w1, brace(X(0), X(0.5), 196, C.B, w1, 1) + tx(X(0.5) + 24, 214, 'mezz’ora: *λ* = 4 × 0,5 = 2', { size: 24, ta: 'start', op: w1 }));
        o += on(w2, brace(X(0), X(2), 248, C.B, w2, 1) + tx(X(1), 280, 'due ore: *λ* = 4 × 2 = 8', { size: 24, op: w2 }));
        const e1 = p(t, 23.6, 24.4) * a2, e2 = p(t, 24.8, 25.6) * a2;
        o += pills(332, [{ s: 'non sempre *λ* = 4', icon: 'no', col: NO, op: e1, u: p(t, 23.8, 24.4, E.lin) }, { s: '*λ* = ritmo × lunghezza', icon: 'ok', col: OK, op: e2, u: p(t, 25, 25.6, E.lin) }]);
      }

      /* capitolo 3: la formula e il conto per k = 5 */
      const a3 = p(t, 27.9, 28.6) * (1 - p(t, 39.4, 40.2));
      if (a3 > 0.004) {
        const fo = p(t, 28.4, 29.4) * a3;
        o += on(fo, tx(170, 150, 'P(*X* = *k*) =', { size: 34, ta: 'start', op: fo }) + tx(352, 150, '*e**^{−λ}' + ZW + '*', { size: 34, fill: C.B, ta: 'start', op: fo }) + fr(450, 142, '*λ**^k*', '*k*!', { size: 34, fill: C.A, nf: C.A, df: C.ink, op: fo }));
        const l1 = p(t, 30.2, 31) * a3, l2 = p(t, 31.4, 32.2) * a3, l3 = p(t, 33, 33.8) * a3, l4 = p(t, 35, 35.8) * a3;
        o += on(l1, tx(320, 214, '*e*^{−3} = 1/*e*^3 ≈ 0,0498', { size: 26, fill: C.B, op: l1 }));
        o += on(l2, tx(320, 256, '3^5/5! = 243/120 = 2,025', { size: 26, fill: C.A, op: l2 }));
        o += on(l3, rect(80, 276, 480, 46, { rx: 10, fill: C.hi, fo: 0.25 * l3, stroke: C.hi, sw: 2, so: l3 }) + tx(320, 309, 'P(*X* = 5) = 0,0498 × 2,025 ≈ 0,1008', { size: 28, op: l3 }));
        o += on(l4, tx(320, 346, 'per confronto: P(*X* = 3) = 0,0498 × 4,5 ≈ 0,224', { ff: SANS, size: 17, fill: C.soft, op: l4 }));
      }

      /* capitolo 4: l'istogramma di Poisson(3) */
      const a4 = p(t, 40.4, 41.2);
      if (a4 > 0.004) {
        o += path(`M${PHX(0) - 22} ${PHB}H${PHX(8) + 22}`, { stroke: C.soft, sw: 1.8, op: a4 });
        const tie = p(t, 47.8, 48.8) * (1 - p(t, 54, 54.8)), ml = p(t, 54.6, 55.4), sg = Math.sqrt(3);
        o += on(ml, rect(PHX(3 - sg), 110, PHX(3 + sg) - PHX(3 - sg), PHB - 110, { rx: 6, fill: C.hi, fo: 0.2 * ml, stroke: C.hi, sw: 2, so: ml, op: a4 }));
        P3.forEach((v, k) => {
          const u = p(t, 41.2 + 0.18 * k, 42 + 0.18 * k), h = v * PHS * u, five = k === 5 ? p(t, 43, 44) : 0, tied = (k === 2 || k === 3) ? tie : 0;
          const col = five > 0.5 ? C.hi : tied > 0.5 ? C.B : C.A;
          o += on(u, rect(PHX(k) - 14, PHB - h, 28, h, { rx: 2, fill: col, fo: 0.42, stroke: col, sw: five || tied ? 3 : 1.6, op: a4 }));
          o += on(u, lb(PHX(k), PHB + 22, k, { op: u * a4 }));
        });
        const v5 = p(t, 43.4, 44.2) * (1 - p(t, 47, 47.8));
        o += on(v5, tx(PHX(5), PHB - P3[5] * PHS - 10, '0,1008', { size: 20, op: v5 * a4 }));
        o += on(tie, tx((PHX(2) + PHX(3)) / 2, PHB - P3[2] * PHS - 12, '0,2240', { size: 22, fill: C.B, op: tie * a4 }));
        o += on(ml, path(`M${PHX(3)} 104V${PHB}`, { stroke: C.hi, sw: 3, da: '6 5', op: ml * a4 }) + tx(PHX(3), 98, '*λ* = 3', { size: 22, op: ml * a4 }));
        const r1 = vis(t, 42.2, 47.4, 0.6, 0.5) * a4, r2 = vis(t, 44.8, 47.4, 0.6, 0.5) * a4;
        o += on(r1, tx(402, 160, '*P*(*k*)', { size: 26, ta: 'start', op: r1 }) + tx(402, 196, '*P*(*k* − 1)', { size: 26, ta: 'start', op: r1 }) + ln(402, 168, 506, 168, { stroke: C.ink, sw: 1.5, op: r1 }) + tx(516, 184, '= *λ*/*k*', { size: 26, ta: 'start', op: r1 }));
        o += on(r2, tx(402, 250, 'sale finché', { size: 24, ta: 'start', op: r2 }) + tx(402, 284, '*k* ≤ *λ*', { size: 28, fill: C.A, ta: 'start', op: r2 }));
        const t1 = vis(t, 48, 54, 0.6, 0.5) * a4, t2 = p(t, 50.4, 51.2) * (1 - p(t, 54.2, 54.8)) * a4;
        o += on(t1, tx(402, 160, '*k* = 2 e *k* = 3', { size: 24, ta: 'start', op: t1 }) + tx(402, 194, 'alla pari:', { size: 24, ta: 'start', op: t1 }) + tx(402, 228, '*λ*/*k* = 1', { size: 26, fill: C.B, ta: 'start', op: t1 }));
        o += on(t2, pills(342, [{ s: 'somma fino a 8: 0,9962 → 1', col: C.hi, op: t2 }], 207));
        const mv = p(t, 55, 55.8);
        o += on(mv, rect(398, 196, 234, 88, { rx: 10, fill: C.hi, fo: 0.25 * mv, stroke: C.hi, sw: 2, so: mv }) + tx(412, 230, '*E*[*X*] = *λ*', { size: 28, ta: 'start', op: mv }) + tx(412, 268, 'Var(*X*) = *λ*', { size: 28, ta: 'start', op: mv }));
      }
      return o;
    },
  });
  /* ======================================================================
     2.6 · Ipergeometrica: l'urna senza reimmissione (10 palline, 4 rosse), media e varianza, valori possibili
     ====================================================================== */
  const hyp = (N, K, n) => { // legge ipergeometrica: P(X = k) per k = 0…n
    const lo = Math.max(0, n - (N - K)), hi = Math.min(n, K);
    return Array.from({ length: n + 1 }, (_, k) => (k < lo || k > hi ? 0 : (cnk(K, k) * cnk(N - K, n - k)) / cnk(N, n)));
  };
  const CARDH = hyp(40, 4, 5), CARDB = binPmf(5, 0.1); // 4 assi su 40 carte, 5 pescate: senza e con reimmissione
  const CLUS = hyp(16, 10, 12); // cluster di 16 nodi, 10 attivi, 12 scelti
  const UB = (i) => [208 + 56 * (i % 5), 150 + 56 * Math.floor(i / 5)]; // posto delle dieci palline nell'urna
  const UR = [0, 3, 5, 8], UPICK = [3, 6, 8]; // le rosse e le tre estratte (R, non R, R)
  const TRAY = [250, 320, 390];
  const GC = { x: 56, y: 114, s: 18 }; // griglia dei 120 gruppi: 12 colonne × 10 righe

  PV.add('ipergeometrica', {
    sec: '2.6',
    short: 'Ipergeometrica: senza reimmissione',
    title: 'Ipergeometrica: estrarre senza rimettere (urna di 10 palline, 4 rosse)',
    alt: 'Animazione: da un’urna con 10 palline, 4 rosse, se ne estraggono 3 in blocco e X è il numero di rosse. I gruppi possibili sono C(10,3) = 120; con due rosse ce ne sono C(4,2) · C(6,1) = 6 · 6 = 36, quindi P(X = 2) = 36/120 = 0,3. La media è nK/N = 1,2 e la varianza ha il fattore correttivo (N − n)/(N − 1) ≤ 1: con 4 assi su 40 carte e 5 pescate la varianza è 0,4038 contro 0,45 della binomiale. I valori possibili sono limitati: in un cluster di 16 nodi con 10 attivi, scegliendone 12 gli attivi sono fra 6 e 10, con 210, 720, 675, 200 e 15 casi favorevoli su 1 820.',
    dur: 57.5,
    poster: 26,
    chap: [[0, 'Un’urna, estrazione in blocco'], [11.4, 'Favorevoli su possibili'], [29.5, 'Media e varianza'], [44.2, 'I valori possibili']],
    caps: [
      [0, 'È la binomiale senza reimmissione: un’urna con 10 palline, 4 rosse; ne estraiamo 3 in blocco.'],
      [6.1, '*X* è il numero di rosse nel gruppo estratto: qui ne escono due, quindi *X* = 2.'],
      [11.4, 'Casi favorevoli su casi possibili. I gruppi possibili sono C(10,3) = 120, tutti equiprobabili.'],
      [17.5, 'Con due rosse: 2 fra le 4 rosse, C(4,2) = 6, e 1 fra le altre 6, C(6,1) = 6. In tutto 36 gruppi.'],
      [24.2, 'P(*X* = 2) = 36/120 = 0,3. In generale: C(*K*,*k*) C(*N*−*K*,*n*−*k*) / C(*N*,*n*).'],
      [29.5, 'La media è come nella binomiale, *nK*/*N* = 1,2. La varianza ha un fattore in più, (*N* − *n*)/(*N* − 1) ≤ 1: meno incertezza.'],
      [37.5, 'Con 4 assi su 40 carte e 5 carte pescate: varianza 0,4038 senza rimettere, 0,45 con la reimmissione.'],
      [44.2, 'I valori possibili: in un cluster di 16 nodi, 10 attivi, scegliendone 12 gli attivi sono fra 6 e 10.'],
      [51, 'Gli altri valori hanno probabilità 0. I casi favorevoli, 210, 720, 675, 200 e 15, sommano a 1 820.'],
    ],
    frame(t) {
      let o = '';
      o += heading(t, 0.2, 10.8, 'Estrarre senza rimettere', 'un’urna: *N* = 10 palline, *K* = 4 rosse');
      o += heading(t, 11.8, 29, 'Favorevoli su possibili', 'tutti i gruppi di 3 palline sono equiprobabili');
      o += heading(t, 29.9, 43.6, 'Media e varianza', 'il fattore (*N* − *n*)/(*N* − 1) è al più 1');
      o += heading(t, 44.6, 57.8, 'I valori possibili', 'cluster di 16 nodi, 10 attivi, 12 scelti');

      /* capitolo 1: l'urna e l'estrazione di tre palline */
      const a1 = 1 - p(t, 10.4, 11.2);
      if (a1 > 0.004) {
        const ur = p(t, 0.3, 1.1) * a1;
        o += rect(150, 112, 340, 132, { rx: 14, stroke: C.soft, sw: 2, op: ur });
        for (let i = 0; i < 10; i++) {
          const [x, y] = UB(i), u = p(t, 0.8 + 0.12 * i, 1.4 + 0.12 * i, E.back), j = UPICK.indexOf(i), mv = j >= 0 ? p(t, 4.4 + 0.8 * j, 5.3 + 0.8 * j, E.io) : 0, rg = j >= 0 ? p(t, 3.4 + 0.3 * j, 4 + 0.3 * j) : 0;
          if (mv > 0.001) o += circ(x, y, 18, { stroke: C.soft, sw: 1.4, da: '4 3', op: a1 * mv });
          const [bx, by] = mv > 0 ? arc(x, y, TRAY[j], 318, mv, 40) : [x, y];
          o += on(u, g({ tf: T(bx, by, u) }, ball(0, 0, 18, UR.includes(i), a1)) + on(rg * (1 - mv), circ(bx, by, 24, { stroke: C.hi, sw: 3.4, so: rg * (1 - mv), op: a1 })));
        }
        const tr = p(t, 3.6, 4.4) * a1;
        o += on(tr, rect(206, 288, 228, 60, { rx: 12, stroke: C.soft, sw: 1.8, da: '6 5', op: tr }));
        const lb1 = p(t, 1.8, 2.6) * a1;
        o += on(lb1, tx(320, 270, 'urna: 4 rosse su 10', { ff: SANS, size: 17, fill: C.soft, op: lb1 }));
        const xl = p(t, 7.4, 8.2) * a1;
        o += on(xl, tx(548, 326, '*X* = 2', { size: 30, op: xl }) + tx(548, 262, 'estratte in blocco,', { ff: SANS, size: 17, fill: C.soft, op: xl }) + tx(548, 284, 'senza rimettere', { ff: SANS, size: 17, fill: C.soft, op: xl }));
      }

      /* capitolo 2: 120 gruppi, 36 favorevoli */
      const a2 = p(t, 11.8, 12.5) * (1 - p(t, 28.8, 29.6));
      if (a2 > 0.004) {
        for (let r = 0; r < 10; r++) {
          for (let c = 0; c < 12; c++) {
            const u = p(t, 12 + 0.05 * (r + c), 12.5 + 0.05 * (r + c)), fav = r < 6 && c < 6 ? p(t, 17.6 + 0.02 * (r + c), 18.4 + 0.02 * (r + c)) : 0;
            let b = rect(GC.x + c * GC.s + 1, GC.y + r * GC.s + 1, GC.s - 2, GC.s - 2, { rx: 3, fill: C.paper, stroke: C.soft, sw: 1.2 });
            if (fav) b += rect(GC.x + c * GC.s + 1, GC.y + r * GC.s + 1, GC.s - 2, GC.s - 2, { rx: 3, fill: C.hi, fo: 0.6 * fav, stroke: C.hi, sw: 1.6, so: fav });
            o += g({ op: u * a2 }, b);
          }
        }
        const bt = p(t, 18.4, 19.2) * a2, bl = p(t, 19.6, 20.4) * a2;
        o += on(bt, brace(GC.x + 1, GC.x + 6 * GC.s - 1, GC.y - 8, C.A, bt, -1) + tx(GC.x + 3 * GC.s, GC.y - 16, '6', { size: 22, fill: C.A, op: bt }));
        o += on(bl, lbrace(GC.x - 8, GC.y + 1, GC.y + 6 * GC.s - 1, C.B, bl) + tx(GC.x - 28, GC.y + 3 * GC.s + 7, '6', { size: 22, fill: C.B, op: bl }));
        /* pannello di destra */
        const n1 = p(t, 14, 14.8) * (1 - p(t, 24, 24.8)) * a2, n2 = p(t, 17.6, 18.4) * (1 - p(t, 24, 24.8)) * a2, n3 = p(t, 21, 21.8) * (1 - p(t, 24, 24.8)) * a2;
        o += on(n1, tx(300, 128, 'gruppi possibili', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: n1 }) + bn(322, 170, '10', '3', { size: 26, op: n1 }) + tx(356, 178, '= 120', { size: 26, ta: 'start', op: n1 }));
        o += on(n2, tx(300, 214, 'due rosse e una non rossa', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: n2 }) + bn(322, 252, '4', '2', { size: 22, fill: C.A, op: n2 }) + tx(348, 258, '×', { size: 24, op: n2 }) + bn(382, 252, '6', '1', { size: 22, fill: C.B, op: n2 }) + tx(410, 258, '= 6 × 6', { size: 24, ta: 'start', op: n2 }));
        o += on(n3, tx(300, 299, '= 36 favorevoli', { size: 26, ta: 'start', op: n3 }));
        const gb = p(t, 22.6, 23.4) * a2;
        o += on(gb, rect(296, 312, 334, 40, { rx: 8, fill: C.hi, fo: 0.25 * gb, stroke: C.hi, sw: 2, so: gb }) + tx(463, 341, 'P(*X* = 2) = 36/120 = 0,3', { size: 26, op: gb }));
        const gn = p(t, 24.8, 25.8) * a2;
        o += on(gn, tx(300, 150, 'in generale', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: gn }) + tx(300, 196, 'P(*X* = *k*) =', { size: 26, ta: 'start', op: gn }) + bn(444, 190, '*K*', '*k*', { size: 22, fill: C.A, op: gn }) + bn(500, 190, '*N*−*K*', '*n*−*k*', { size: 22, fill: C.B, op: gn }) + tx(550, 196, '/', { size: 30, op: gn }) + bn(584, 190, '*N*', '*n*', { size: 22, op: gn }));
        o += on(gn, tx(300, 252, 'rosse scelte × non rosse scelte,', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: gn }) + tx(300, 276, 'su tutti i gruppi possibili', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: gn }));
      }

      /* capitolo 3: media, fattore correttivo, 4 assi su 40 carte */
      const a3 = p(t, 29.9, 30.6) * (1 - p(t, 43.6, 44.4));
      if (a3 > 0.004) {
        const e1 = p(t, 30.4, 31.2) * (1 - p(t, 37.2, 38)) * a3, e2 = p(t, 33.2, 34) * (1 - p(t, 37.2, 38)) * a3, e3 = p(t, 35.2, 36) * (1 - p(t, 37.2, 38)) * a3;
        o += on(e1, tx(320, 150, '*E*[*X*] = *nK*/*N* = 3 · 4/10 = 1,2', { size: 30, op: e1 }));
        o += on(e2, txc(320, 214, [['Var(*X*) = *n* (*K*/*N*)(1 − *K*/*N*) ', C.ink], ['(*N* − *n*)/(*N* − 1)', C.B]], { size: 26, op: e2 }));
        o += on(e3, tx(320, 268, 'senza rimettere c’è meno incertezza', { ff: SANS, size: 17, fill: C.soft, op: e3 }));
        /* le barre appaiate: ipergeometrica (blu) contro binomiale (arancione) */
        const bc = p(t, 37.8, 38.6) * a3;
        if (bc > 0.004) {
          const x0 = 92, dx = 76, base = 318, sc = 300;
          o += path(`M${x0 - 36} ${base}H${x0 + 4 * dx + 36}`, { stroke: C.soft, sw: 1.8, op: bc });
          for (let k = 0; k <= 4; k++) {
            const u = p(t, 38.2 + 0.2 * k, 39 + 0.2 * k), hh = CARDH[k] * sc * u, hb = CARDB[k] * sc * u;
            o += on(u, rect(x0 + dx * k - 24, base - hh, 22, hh, { rx: 2, fill: C.A, fo: 0.5, stroke: C.A, sw: 1.8, op: bc }) + rect(x0 + dx * k + 2, base - hb, 22, hb, { rx: 2, fill: C.B, fo: 0.5, stroke: C.B, sw: 1.8, op: bc }) + lb(x0 + dx * k, base + 22, k, { op: u * bc }));
          }
          const lg = p(t, 40, 40.8) * bc;
          o += on(lg, rect(452, 130, 18, 18, { rx: 4, fill: C.A, fo: 0.5, stroke: C.A, sw: 2, op: lg }) + tx(478, 145, 'senza reimmissione', { ff: SANS, size: 17, ta: 'start', op: lg }) + rect(452, 214, 18, 18, { rx: 4, fill: C.B, fo: 0.5, stroke: C.B, sw: 2, op: lg }) + tx(478, 229, 'con reimmissione', { ff: SANS, size: 17, ta: 'start', op: lg }));
          const v1 = p(t, 40.6, 41.4) * bc, v2 = p(t, 41.8, 42.6) * bc, v3 = p(t, 43, 43.6) * bc;
          o += on(v1, tx(478, 180, 'Var = 0,4038', { size: 26, fill: C.A, ta: 'start', op: v1 }));
          o += on(v2, tx(478, 264, 'Var = 0,45', { size: 26, fill: C.B, ta: 'start', op: v2 }));
        }
      }

      /* capitolo 4: i valori possibili in un cluster di 16 nodi */
      const a4 = p(t, 44.6, 45.4);
      if (a4 > 0.004) {
        const NX = (i) => 44 + 34 * (i % 4), NY = (i) => 116 + 34 * Math.floor(i / 4);
        for (let i = 0; i < 16; i++) {
          const u = p(t, 44.8 + 0.06 * i, 45.4 + 0.06 * i), act = i < 10;
          o += on(u, rect(NX(i), NY(i), 28, 28, { rx: 5, fill: act ? C.A : C.soft, fo: act ? 0.55 : 0.2, stroke: act ? C.A : C.soft, sw: 1.8, da: act ? undefined : '4 3', op: u * a4 }));
        }
        const lg = p(t, 46, 46.8) * a4;
        o += on(lg, tx(44, 278, '10 attivi', { ff: SANS, size: 17, fill: C.A, ta: 'start', op: lg }) + tx(44, 302, '6 in manutenzione', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: lg }));
        /* le due scelte estreme: 12 nodi evidenziati e la spiegazione */
        const s1 = vis(t, 47.2, 49.8, 0.4, 0.4) * a4, s2 = vis(t, 49.8, 51.6, 0.4, 0.4) * a4;
        for (let i = 0; i < 16; i++) {
          const inA = i >= 4, inB = i < 12; // minimo: 6 in manutenzione + 6 attivi; massimo: 10 attivi + 2 in manutenzione
          if (inA && s1 > 0.01) o += rect(NX(i) - 3, NY(i) - 3, 34, 34, { rx: 7, stroke: C.hi, sw: 3.2, so: s1 });
          if (inB && s2 > 0.01) o += rect(NX(i) - 3, NY(i) - 3, 34, 34, { rx: 7, stroke: C.hi, sw: 3.2, so: s2 });
        }
        o += on(s1, tx(224, 150, 'se scegli i 6 nodi in manutenzione,', { size: 22, ta: 'start', op: s1 }) + tx(224, 184, 'gli altri 6 sono per forza attivi:', { size: 22, ta: 'start', op: s1 }) + tx(224, 238, '*X* ≥ 12 − 6 = 6', { size: 34, fill: C.A, ta: 'start', op: s1 }));
        o += on(s2, tx(224, 150, 'se scegli tutti i 10 nodi attivi,', { size: 22, ta: 'start', op: s2 }) + tx(224, 184, 'gli altri 2 sono in manutenzione:', { size: 22, ta: 'start', op: s2 }) + tx(224, 238, '*X* ≤ 10', { size: 34, fill: C.A, ta: 'start', op: s2 }));
        /* le barre */
        const bx = (k) => 268 + 52 * (k - 5), base = 290, sc = 300;
        const bc = p(t, 51.6, 52.2);
        o += on(bc, path(`M${bx(5) - 28} ${base}H${bx(11) + 28}`, { stroke: C.soft, sw: 1.8, op: bc }));
        for (let k = 5; k <= 11; k++) {
          const u = p(t, 51.8 + 0.3 * (k - 5), 52.6 + 0.3 * (k - 5)), v = CLUS[k] || 0, h = v * sc * u;
          o += on(u, rect(bx(k) - 18, base - h, 36, h, { rx: 2, fill: C.A, fo: 0.45, stroke: C.A, sw: 1.8, op: a4 }) + lb(bx(k), base + 22, k, { op: u * a4 }));
        }
        [[6, '210'], [7, '720'], [8, '675'], [9, '200'], [10, '15']].forEach(([k, s], i) => {
          const u = p(t, 53.2 + 0.25 * i, 53.9 + 0.25 * i);
          o += on(u, tx(bx(k), base - CLUS[k] * sc - 8, s, { size: 20, op: u * a4 }));
        });
        const z = p(t, 54.8, 55.6) * a4;
        o += on(z, tx(bx(5), base - 10, '0', { size: 20, fill: NO, op: z }) + tx(bx(11), base - 10, '0', { size: 20, fill: NO, op: z }) + tx(bx(8), 122, 'su 1 820 gruppi in tutto', { ff: SANS, size: 17, fill: C.soft, op: z }));
        const pl = p(t, 55.8, 56.6) * a4;
        o += on(pl, pills(340, [{ s: 'max(0, *n* − (*N* − *K*)) = 6 ≤ *X* ≤ min(*n*, *K*) = 10', col: C.hi, op: pl }]));
      }
      return o;
    },
  });
  /* ======================================================================
     2.6 · Riconoscere la legge: il call center (esercizio guidato 2.B) e la tabella delle parole chiave
     ====================================================================== */
  /* testo con parole chiave: parts = [[testo, chiave?]]; k = 0…1 fa comparire sopra le chiavi, in blu e sottolineate */
  function qt(x, y, parts, size, op, k) {
    const base = `<text${at({ x, y, fs: size, ff: SERIF, fill: C.ink, op })}>${parts.map(([s]) => `<tspan>${mm(s, size)}</tspan>`).join('')}</text>`;
    if (!(k > 0.004)) return base;
    return base + `<text${at({ x, y, fs: size, ff: SERIF, fill: C.A, op: op * k })}>${parts.map(([s, key]) => `<tspan${key ? ' text-decoration="underline"' : ' fill-opacity="0"'}>${mm(s, size)}</tspan>`).join('')}</text>`;
  }
  const QS = [
    { t0: 11.5, n: 1, q: [[['In una mattina un operatore fa ', 0], ['20 telefonate', 1], ['.', 0]], [['Probabilità di ', 0], ['esattamente 6 vendite', 1], ['?', 0]]], law: 'Binomiale', par: '*n* = 20, *p* = 0,3' },
    { t0: 18.5, n: 2, q: [[['Quante telefonate, in media, servono per', 0]], [['concludere ', 0], ['la prima vendita', 1], ['?', 0]]], law: 'Geometrica', par: '*p* = 0,3' },
    { t0: 25.2, n: 3, q: [[['Chiamate dei clienti: ', 0], ['in media 12 all’ora', 1], [',', 0]], [['a caso e a ritmo costante. ', 0], ['Nessuna in 10 minuti', 1], ['?', 0]]], law: 'Poisson', par: '*λ* = 12 · 1/6 = 2' },
    { t0: 32.5, n: 4, q: [[['Una scatola con 50 cuffie, di cui 5 difettose.', 0]], [['Ne prendi ', 0], ['4, senza rimetterle', 1], [': nessuna difettosa?', 0]]], law: 'Ipergeometrica', par: '*N* = 50, *K* = 5, *n* = 4' },
  ];
  const LAWS = [['Bernoulli(*p*)', 'una prova, sì o no'], ['Binomiale(*n*, *p*)', 'su *n* prove, quanti successi'], ['Uniforme su {1, …, *n*}', 'esiti equiprobabili, «a caso fra *n*»'], ['Geometrica(*p*)', '«finché non», «fino al primo»'], ['Binomiale negativa(*r*, *p*)', '«fino all’*r*-esimo successo»'], ['Ipergeometrica(*N*, *K*, *n*)', '«senza reimmissione», «in blocco»'], ['Poisson(*λ*)', '«in media *λ* per unità di tempo»']];

  PV.add('riconoscere', {
    sec: '2.6',
    short: 'Riconoscere la legge',
    title: 'Riconoscere la legge: quattro domande sullo stesso call center',
    alt: 'Animazione: in un call center ogni telefonata si conclude con una vendita con probabilità 0,3. Quattro domande, quattro leggi: venti telefonate e sei vendite sono una binomiale (20; 0,3) con probabilità circa 0,192; la prima vendita è una geometrica (0,3) con media 3,33 e probabilità 0,657 di arrivare entro la terza; dodici chiamate all’ora in dieci minuti sono una Poisson con λ = 2 e P(0) = e^(−2) ≈ 0,135; quattro cuffie prese senza rimettere da 50, di cui 5 difettose, sono un’ipergeometrica con probabilità di nessuna difettosa 148 995/230 300 ≈ 0,647. Infine la tabella delle parole chiave di tutte le leggi, con l’uniforme e la binomiale negativa.',
    dur: 57.5,
    poster: 49.5,
    chap: [[0, 'Un call center, quattro domande'], [11.5, 'Un numero fisso di prove'], [18.5, 'Fino alla prima vendita'], [25.2, 'Chiamate nel tempo'], [32.5, 'Senza rimettere'], [39.8, 'Parole chiave e leggi']],
    caps: [
      [0, 'Un call center: ogni telefonata, indipendente dalle altre, si conclude con una vendita con probabilità 0,3.'],
      [7, 'Quattro domande: prima riconosci la legge e i parametri, poi calcola.'],
      [11.5, '20 telefonate, 6 vendite: numero fisso di prove, conti i successi. Binomiale(20; 0,3), P(*X* = 6) ≈ 0,192.'],
      [18.5, '«Fino alla prima vendita»: geometrica(0,3). Media 1/0,3 ≈ 3,33; entro la terza: 1 − 0,7^3 = 0,657.'],
      [25.2, '12 chiamate all’ora in media, e in 10 minuti nessuna: Poisson con *λ* = 12 · 1/6 = 2. P(0) = *e*^{−2} ≈ 0,135.'],
      [32.5, '50 cuffie, 5 difettose, ne prendi 4 senza rimettere: ipergeometrica. Nessuna difettosa: 148 995/230 300 ≈ 0,647.'],
      [39.8, 'A decidere non è l’argomento ma la struttura: prove fisse, attesa del primo successo, arrivi nel tempo, estrazioni senza rimettere.'],
      [49.1, 'Altre parole chiave: «a caso fra *n*» è l’uniforme, «fino all’*r*-esimo successo» la binomiale negativa.'],
    ],
    frame(t) {
      let o = '';
      o += heading(t, 0.2, 11, 'Quattro domande, stessa situazione', 'ogni telefonata riesce con probabilità 0,3');
      o += heading(t, 11.8, 18.1, 'Domanda 1', 'un numero fisso di prove') + heading(t, 18.8, 24.8, 'Domanda 2', 'l’attesa del primo successo');
      o += heading(t, 25.5, 32.1, 'Domanda 3', 'eventi nel tempo') + heading(t, 32.8, 39.4, 'Domanda 4', 'estrazioni senza rimettere');
      o += heading(t, 40.2, 57.6, 'Parole chiave e leggi', 'la struttura decide, non l’argomento');

      /* capitolo 1: la stessa situazione e le quattro domande */
      const a1 = 1 - p(t, 10.4, 11.2);
      if (a1 > 0.004) {
        RUN1.forEach((s, i) => {
          const t0 = 0.4 + 0.1 * i, fl = p(t, 1.4 + 0.3 * i, 1.9 + 0.3 * i, E.lin);
          o += on(p(t, t0, t0 + 0.4), tok(90 + 46 * i, 150, s === 1, fl, p(t, t0, t0 + 0.3) * a1));
        });
        const lg = p(t, 4.6, 5.4) * a1;
        o += on(lg, tx(320, 214, 'ogni telefonata: una vendita (S) con probabilità 0,3', { ff: SANS, size: 17, fill: C.soft, op: lg }));
        for (let i = 0; i < 4; i++) {
          const u = p(t, 7 + 0.35 * i, 7.7 + 0.35 * i, E.back), x = 110 + 140 * i;
          o += on(u, g({ tf: T(x, 290, u), op: a1 }, rect(-56, -36, 112, 72, { rx: 12, fill: C.paper, stroke: C.soft, sw: 2 }) + tx(0, -12, 'domanda ' + (i + 1), { ff: SANS, size: 17, fill: C.soft }) + tx(0, 24, '?', { size: 36 })));
        }
      }

      /* capitoli 2-5: le quattro domande */
      QS.forEach((Q, qi) => {
        const T0 = Q.t0, D = qi === 3 ? 7.3 : qi === 0 ? 7 : 6.7, op = p(t, T0 + 0.3, T0 + 1) * (1 - p(t, T0 + D - 0.6, T0 + D));
        if (op < 0.004) return;
        const k = p(t, T0 + 1.6, T0 + 2.4), st = p(t, T0 + 2.8, T0 + 3.6, E.back), r1 = p(t, T0 + 3.9, T0 + 4.7), r2 = p(t, T0 + 5, T0 + 5.8);
        o += tx(60, 104, 'domanda ' + Q.n, { ff: SANS, size: 17, fill: C.soft, ta: 'start', op });
        Q.q.forEach((line, i) => (o += qt(60, 142 + 34 * i, line, 24, op, k)));
        o += on(st, g({ tf: T(320, 236, st, -2), op }, rect(-170, -38, 340, 76, { rx: 12, fill: C.paper, stroke: C.A, sw: 3 }) + rect(-170, -38, 340, 76, { rx: 12, fill: C.A, fo: 0.1 }) + tx(0, -4, Q.law, { size: 30, fill: C.A }) + tx(0, 24, Q.par, { size: 20 })));
        if (qi === 0) {
          o += on(r1, tx(64, 310, 'P(*X* = 6) =', { size: 28, ta: 'start', op: r1 * op }) + bn(236, 304, '20', '6', { size: 28, op: r1 * op }) + tx(270, 310, '· 0,3^6 · 0,7^{14} ≈ 0,192', { size: 28, ta: 'start', op: r1 * op }));
          o += on(r2, tx(320, 350, 'media: 20 · 0,3 = 6 vendite', { ff: SANS, size: 17, fill: C.soft, op: r2 * op }));
        } else if (qi === 1) {
          o += on(r1, tx(320, 310, '*E*[*X*] = 1/0,3 ≈ 3,33 telefonate', { size: 28, op: r1 * op }));
          o += on(r2, tx(320, 348, 'entro la terza: 1 − 0,7^3 = 0,657', { size: 24, op: r2 * op }));
        } else if (qi === 2) {
          o += on(r1, tx(320, 310, 'P(0) = *e*^{−2} ≈ 0,135', { size: 30, op: r1 * op }));
          o += on(r2, tx(320, 348, '10 minuti = 1/6 di ora: *λ* = 12 · 1/6', { ff: SANS, size: 17, fill: C.soft, op: r2 * op }));
        } else {
          o += on(r1, bn(120, 304, '45', '4', { size: 28, op: r1 * op }) + tx(160, 312, '/', { size: 32, op: r1 * op }) + bn(200, 304, '50', '4', { size: 28, op: r1 * op }) + tx(242, 312, '= 148 995/230 300 ≈ 0,647', { size: 28, ta: 'start', op: r1 * op }));
          o += on(r2, tx(320, 350, 'le cuffie prese non tornano nella scatola', { ff: SANS, size: 17, fill: C.soft, op: r2 * op }));
        }
      });

      /* capitolo 6: la tabella delle parole chiave */
      const a6 = p(t, 40.2, 41);
      if (a6 > 0.004) {
        LAWS.forEach(([name, kw], i) => {
          const y = 124 + 34 * i, u = p(t, 41 + 0.5 * i, 41.7 + 0.5 * i), hot = (i === 2 || i === 4) ? p(t, 49.4, 50.2) * (1 - p(t, 56.6, 57.4)) : 0;
          o += on(u, ln(36, y + 11, 612, y + 11, { stroke: C.line, sw: 1.2, op: u * a6 }));
          if (hot > 0.01) o += rect(30, y - 20, 588, 32, { rx: 8, fill: C.hi, fo: 0.25 * hot, stroke: C.hi, sw: 2, so: hot });
          o += on(u, tx(40, y, name, { size: 21, ta: 'start', op: u * a6 }) + tx(300, y, kw, { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: u * a6 }));
        });
      }
      return o;
    },
  });
  /* ======================================================================
     2.7 · Somme di variabili indipendenti: la convoluzione sulle diagonali, binomiali e Poisson che si sommano
     ====================================================================== */
  const SPX = [0.5, 0.3, 0.2], SPY = [0.6, 0.4]; // server A (0, 1, 2 richieste) e server B (0, 1)
  const SCELL = (i, j) => [206 + 64 * j, 176 + 46 * i]; // centro della casella (x = i, y = j)
  const SBARS = [[0.3, '0,30'], [0.38, '0,38'], [0.24, '0,24'], [0.08, '0,08']]; // legge di S = X + Y
  const SSUMS = ['0,30', '0,20 + 0,18 = 0,38', '0,12 + 0,12 = 0,24', '0,08'];
  const fmt2 = (v) => v.toFixed(2).replace('.', ',');

  PV.add('somme', {
    sec: '2.7',
    short: 'Somme di variabili indipendenti',
    title: 'Somme indipendenti: la convoluzione, le binomiali e le Poisson che si sommano',
    alt: 'Animazione: due server indipendenti, A con 0, 1, 2 richieste e probabilità 0,5; 0,3; 0,2 e B con 0, 1 e probabilità 0,6; 0,4. Le caselle sono i prodotti, e la legge del totale S si legge sulle diagonali: 0,30; 0,20 + 0,18 = 0,38; 0,12 + 0,12 = 0,24; 0,08; la somma è 1 e la media è 1,10 = 0,7 + 0,4. Due binomiali con lo stesso p, Bin(3, p) e Bin(2, p), danno Bin(5, p). Due Poisson indipendenti, 1,5 e 1 ordini in mezzo minuto, danno una Poisson con λ = 2,5, e la probabilità di al più un ordine è 3,5 e^(−2,5), circa 0,287.',
    dur: 58.5,
    poster: 22.5,
    chap: [[0, 'La somma lungo le diagonali'], [25, 'Binomiali con lo stesso p'], [36.7, 'Poisson: i ritmi si sommano'], [51.4, 'Cosa si conserva']],
    caps: [
      [0, 'Se *X* e *Y* sono indipendenti, la legge della somma si legge sulle diagonali della tabella dei prodotti.'],
      [6.7, 'Server A: 0, 1, 2 richieste con probabilità 0,5; 0,3; 0,2. Server B: 0, 1 con 0,6; 0,4. Ogni casella è il prodotto.'],
      [14, '*S* = 1: due caselle, 0,20 + 0,18 = 0,38. *S* = 2: 0,12 + 0,12 = 0,24. *S* = 0 e *S* = 3 ne hanno una sola.'],
      [21.3, 'Le probabilità sommano a 1, e *E*[*S*] = 1,10 = 0,7 + 0,4.'],
      [25, 'Binomiali con lo stesso *p*: *X* ~ Bin(3, *p*) e *Y* ~ Bin(2, *p*) contano i successi in 3 + 2 prove.'],
      [31.7, 'Quindi la somma è Bin(5, *p*). Con *p* diversi la somma non è più binomiale.'],
      [36.7, 'Poisson: un sito riceve in media 1,5 ordini in mezzo minuto e l’app 1. Insieme sono Poisson con *λ* = 2,5: i ritmi si sommano.'],
      [45.7, 'Probabilità di al più un ordine: *e*^{−2,5} + 2,5 *e*^{−2,5} = 3,5 *e*^{−2,5} ≈ 0,287.'],
      [51.4, 'Per induzione vale per un numero qualsiasi di addendi.'],
      [54.9, 'Le medie si sommano sempre; le varianze, se indipendenti.'],
    ],
    frame(t) {
      let o = '';
      o += heading(t, 0.2, 24.4, 'Somma di due variabili indipendenti', 'i prodotti sulle diagonali: *s* = *x* + *y*');
      o += heading(t, 25.4, 36.2, 'Binomiali con lo stesso *p*', 'successi su 3 + 2 prove');
      o += heading(t, 37.2, 51, 'Poisson: i ritmi si sommano', 'sito e app, in mezzo minuto');
      o += heading(t, 51.9, 58.4, 'Cosa si conserva', 'indipendenza = somme semplici');

      /* capitolo 1: la tabella dei prodotti, le diagonali e la legge di S */
      const a1 = 1 - p(t, 23.8, 24.6);
      if (a1 > 0.004) {
        const hd = p(t, 0.6, 1.6) * a1;
        o += on(hd, tx(206, 126, 'y = 0', { ff: SANS, size: 17, fill: C.soft, op: hd }) + tx(270, 126, 'y = 1', { ff: SANS, size: 17, fill: C.soft, op: hd }));
        SPY.forEach((v, j) => (o += on(hd, tx(SCELL(0, j)[0], 150, fmt2(v), { size: 22, fill: C.B, op: hd }))));
        SPX.forEach((v, i) => (o += on(hd, tx(44, SCELL(i, 0)[1] + 6, 'x = ' + i, { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: hd }) + tx(138, SCELL(i, 0)[1] + 8, fmt2(v), { size: 22, fill: C.A, op: hd }))));
        let cur = -1;
        for (let s = 0; s < 4; s++) if (t >= 7.4 + 3.3 * s) cur = s;
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 2; j++) {
            const [cx, cy] = SCELL(i, j), u = p(t, 3.4 + 0.5 * (2 * i + j), 4 + 0.5 * (2 * i + j), E.back), s = i + j;
            const act = cur >= 0 && s === cur ? p(t, 7.4 + 3.3 * s, 8.1 + 3.3 * s) * (1 - p(t, 10.4 + 3.3 * s, 10.9 + 3.3 * s) * (s === 3 ? 0 : 1)) : 0, done = cur > s ? 1 : 0;
            let b = rect(-30, -21, 60, 42, { rx: 8, fill: C.paper, stroke: C.soft, sw: 1.6 });
            if (done) b += rect(-30, -21, 60, 42, { rx: 8, fill: C.A, fo: 0.14 });
            if (act > 0.01) b += rect(-30, -21, 60, 42, { rx: 8, fill: C.hi, fo: 0.55 * act, stroke: C.hi, sw: 3, so: act });
            b += tx(0, 8, fmt2(SPX[i] * SPY[j]), { size: 22 });
            o += on(u, g({ tf: T(cx, cy, u), op: u * a1 }, b));
          }
        }
        const pr = vis(t, 4, 7.4, 0.5, 0.5) * a1;
        o += on(pr, pills(320, [{ s: 'ogni casella è il prodotto: indipendenza', col: C.soft, op: pr }], 230));
        /* somma della diagonale corrente */
        for (let s = 0; s < 4; s++) {
          const sm = vis(t, 7.8 + 3.3 * s, 10.7 + 3.3 * s + (s === 3 ? 1.2 : 0), 0.4, 0.4) * a1;
          o += on(sm, tx(230, 318, '*p**_{S}' + ZW + '*(' + s + ') = ' + SSUMS[s], { size: 24, op: sm }));
        }
        /* le barre della legge di S */
        SBARS.forEach(([v, lab], s) => {
          const u = p(t, 8.2 + 3.3 * s, 9.2 + 3.3 * s), x = 410 + 58 * s, h = v * 300 * u;
          o += on(u, rect(x - 18, 290 - h, 36, h, { rx: 2, fill: C.hi, fo: 0.5, stroke: C.hi, sw: 2, op: a1 }) + tx(x, 290 - h - 8, lab, { size: 20, op: u * a1 }) + lb(x, 312, s, { op: u * a1 }));
        });
        const bl = p(t, 8, 8.8) * a1;
        o += on(bl, path('M380 290H620', { stroke: C.soft, sw: 1.8, op: bl }) + tx(500, 130, 'legge di *S* = *X* + *Y*', { ff: SANS, size: 17, fill: C.soft, op: bl }));
        const e1 = p(t, 19.8, 20.6) * a1, e2 = p(t, 21.4, 22.2) * a1;
        o += pills(346, [{ s: 'somma: 0,30 + 0,38 + 0,24 + 0,08 = 1', col: C.hi, op: e1 }, { s: '*E*[*S*] = 1,10 = 0,7 + 0,4', col: C.hi, op: e2 }]);
      }

      /* capitolo 2: due binomiali con lo stesso p */
      const a2 = p(t, 25.4, 26.1) * (1 - p(t, 36, 36.8));
      if (a2 > 0.004) {
        [1, 1, 0, 0, 1].forEach((s, i) => {
          const t0 = 26 + 0.15 * i, fl = p(t, 27 + 0.35 * i, 27.5 + 0.35 * i, E.lin);
          o += on(p(t, t0, t0 + 0.4), tok(112 + 84 * i, 146, s === 1, fl, p(t, t0, t0 + 0.3) * a2, 1.5));
        });
        const bx = p(t, 28.8, 29.6) * a2, by = p(t, 29.6, 30.4) * a2, bt = p(t, 31.7, 32.5) * a2;
        o += on(bx, brace(112 - 30, 112 + 168 + 30, 186, C.A, bx, 1) + tx(112 + 84, 218, '*X* ~ Bin(3, *p*)', { size: 24, fill: C.A, op: bx }));
        o += on(by, brace(112 + 252 - 30, 112 + 336 + 30, 186, C.B, by, 1) + tx(112 + 294, 218, '*Y* ~ Bin(2, *p*)', { size: 24, fill: C.B, op: by }));
        o += on(bt, brace(112 - 30, 112 + 336 + 30, 242, C.hi, bt, 1) + tx(320, 290, '*X* + *Y* ~ Bin(5, *p*)', { size: 34, op: bt }));
        const p1 = p(t, 33.4, 34.2) * a2, p2 = p(t, 34.8, 35.6) * a2;
        o += pills(336, [{ s: 'lo stesso *p*', icon: 'ok', col: OK, op: p1, u: p(t, 33.6, 34.2, E.lin) }, { s: 'con *p* diversi: non è binomiale', icon: 'no', col: NO, op: p2, u: p(t, 35, 35.6, E.lin) }]);
      }

      /* capitolo 3: due Poisson indipendenti */
      const a3 = p(t, 37.2, 37.9) * (1 - p(t, 50.8, 51.6));
      if (a3 > 0.004) {
        const X0 = 70, XW = 370, ys = [128, 186, 262];
        ys.forEach((y, r) => {
          const ax = p(t, 37.4 + 0.2 * r, 38 + 0.2 * r) * a3;
          o += path(`M${X0} ${y}H${X0 + XW}`, { stroke: C.soft, sw: 1.8, op: ax }) + ln(X0, y - 5, X0, y + 5, { stroke: C.soft, sw: 1.6, op: ax }) + ln(X0 + XW, y - 5, X0 + XW, y + 5, { stroke: C.soft, sw: 1.6, op: ax });
          o += tx(X0 + XW + 10, y + 6, '30 s', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: ax });
        });
        o += on(p(t, 37.4, 38), tx(X0, 110, 'sito', { ff: SANS, size: 17, fill: C.A, ta: 'start', op: p(t, 37.6, 38.2) * a3 }) + tx(X0, 168, 'app', { ff: SANS, size: 17, fill: C.B, ta: 'start', op: p(t, 37.6, 38.2) * a3 }) + tx(X0, 244, 'insieme', { ff: SANS, size: 17, fill: C.ink, ta: 'start', op: p(t, 37.6, 38.2) * a3 }));
        const SITE = [0.18, 0.7], APP = [0.46];
        SITE.forEach((m, i) => {
          const t0 = 38.4 + 0.5 * i, u = p(t, t0, t0 + 0.4, E.back), mv = p(t, 41.6 + 0.4 * i, 42.6 + 0.4 * i, E.io), [x, y] = arc(X0 + m * XW, ys[0], X0 + m * XW, ys[2], mv, 0);
          o += on(u, circ(X0 + m * XW, ys[0], 8 * u, { fill: C.A, fo: 0.9, stroke: C.paper, sw: 1.4, op: a3 * (1 - 0.0 * mv) }));
          o += on(mv, circ(x, y, 8, { fill: C.A, fo: 0.9, stroke: C.paper, sw: 1.4, op: a3 }));
        });
        APP.forEach((m, i) => {
          const t0 = 39.8, u = p(t, t0, t0 + 0.4, E.back), mv = p(t, 42.4, 43.4, E.io), [x, y] = arc(X0 + m * XW, ys[1], X0 + m * XW, ys[2], mv, 0);
          o += on(u, circ(X0 + m * XW, ys[1], 8 * u, { fill: C.B, fo: 0.9, stroke: C.paper, sw: 1.4, op: a3 }));
          o += on(mv, circ(x, y, 8, { fill: C.B, fo: 0.9, stroke: C.paper, sw: 1.4, op: a3 }));
        });
        const l1 = p(t, 40.4, 41.2) * a3, l2 = p(t, 41, 41.8) * a3, l3 = p(t, 44, 44.8) * a3;
        o += on(l1, tx(558, ys[0] + 8, '*λ*_1 = 1,5', { size: 24, fill: C.A, op: l1 }));
        o += on(l2, tx(558, ys[1] + 8, '*λ*_2 = 1', { size: 24, fill: C.B, op: l2 }));
        o += on(l3, rect(508, ys[2] - 24, 100, 44, { rx: 8, fill: C.hi, fo: 0.25 * l3, stroke: C.hi, sw: 2, so: l3 }) + tx(558, ys[2] + 8, '*λ* = 2,5', { size: 26, op: l3 }));
        const c1 = p(t, 46, 46.8) * a3, c2 = p(t, 48, 48.8) * a3;
        o += on(c1, tx(320, 316, 'P(*N* ≤ 1) = *e*^{−2,5} + 2,5 *e*^{−2,5}', { size: 24, op: c1 }));
        o += on(c2, tx(320, 348, '= 3,5 *e*^{−2,5} ≈ 0,287', { size: 26, op: c2 }));
      }

      /* capitolo 4: cosa si conserva */
      const a4 = p(t, 51.9, 52.6);
      if (a4 > 0.004) {
        const rows = [[C.A, 'Bin(*n*, *p*) + Bin(*m*, *p*) = Bin(*n* + *m*, *p*)', 52.4], [C.B, 'Poisson(*λ*_1) + Poisson(*λ*_2) = Poisson(*λ*_1 + *λ*_2)', 53.6], [C.hi, 'media: sempre · varianza: se indipendenti', 54.9]];
        rows.forEach(([col, s, t0], i) => {
          const u = p(t, t0, t0 + 0.8), y = 132 + 66 * i;
          o += on(u, rect(24, y - 30, 592, 52, { rx: 12, fill: C.paper, stroke: col, sw: 3, op: u * a4 }) + rect(24, y - 30, 592, 52, { rx: 12, fill: col, fo: 0.08, op: u * a4 }) + tx(320, y + 6, s, { size: 25, op: u * a4 }));
        });
        const ex = p(t, 56, 56.8) * a4;
        o += on(ex, tx(320, 340, '*E*[*X* + *Y*] = *E*[*X*] + *E*[*Y*]  ·  Var(*X* + *Y*) = Var(*X*) + Var(*Y*)', { ff: SANS, size: 17, fill: C.soft, op: ex }));
      }
      return o;
    },
  });
  /* ======================================================================
     2.7 · Da binomiale a Poisson: un'ora a pezzetti, Bin(n, 2/n) → Poisson(2), il limite a pezzi, l'errore
     ====================================================================== */
  const NSEQ = [10, 100, 1000, 10000];
  const PMB = NSEQ.map((n) => binPmf(n, 2 / n).slice(0, 9)); // Bin(n, 2/n) per k = 0…8
  const PMP = poisPmf(2, 8); // Poisson(2) per k = 0…8
  const TK = [18, 21.2, 24.4, 27.6]; // istanti in cui le barre coincidono con Bin(n, 2/n) per n = 10, 100, 1 000, 10 000
  const BPX = (k) => 62 + 38 * k, BPB = 300, BPS = 560;
  const EVT = [0.205, 0.29]; // i due ordini dell'ora (frazione di ora)
  const STG = [[3.4, 6, '*n* = 6', '*p* = 2/6 = 1/3'], [6.4, 12, '*n* = 12', '*p* = 2/12 = 1/6'], [9.4, 60, '*n* = 60', '*p* = 2/60 = 1/30'], [12.4, 3600, '*n* = 3 600', '*p* = 2/3 600 = 1/1 800']];
  const EX100 = binPmf(100, 0.02).slice(0, 5); // 100 pezzi, ciascuno difettoso con probabilità 0,02

  PV.add('bin_poisson', {
    sec: '2.7',
    short: 'Da binomiale a Poisson',
    title: 'Da binomiale a Poisson: Bin(n, λ/n) tende a Poisson(λ)',
    alt: 'Animazione: un’ora è divisa in n parti e in ciascuna arriva un ordine con probabilità p = λ/n; affinando la suddivisione la possibilità di due ordini nella stessa parte sparisce. Con λ = 2 gli istogrammi di Bin(n, 2/n) per n = 10, 100, 1 000 e 10 000 si avvicinano a Poisson(2): P(X = 2) vale 0,30199; 0,27341; 0,27094; 0,27070 e tende a 0,27067. Il limite si dimostra scrivendo la probabilità come prodotto di tre pezzi: k rapporti che tendono a 1, (1 − λ/n)^n che tende a e^(−λ) e (1 − λ/n)^(−k) che tende a 1. L’errore massimo è circa p/4: con n = 100 e p = 0,02 vale 0,0046. Conta p, non n.',
    dur: 57.5,
    poster: 29.4,
    chap: [[0, 'Un’ora a pezzetti'], [17, 'La binomiale cambia forma'], [30.4, 'Il limite, a pezzi'], [45.7, 'Quanto è buona l’approssimazione']],
    caps: [
      [0, 'Dividiamo un’ora in *n* parti: in ciascuna arriva un ordine con probabilità *p* = *λ*/*n*, piccolissima. Gli ordini dell’ora sono Bin(*n*, *λ*/*n*).'],
      [9.3, 'Affinando la suddivisione, la possibilità di due ordini nello stesso istante sparisce: resta solo il ritmo medio *λ*.'],
      [17, 'Con *λ* = 2, ecco Bin(*n*, 2/*n*) al crescere di *n*. *P*(*X* = 2) vale 0,30199 per *n* = 10, 0,27341 per *n* = 100…'],
      [24.7, '…0,27094 per *n* = 1 000 e 0,27070 per 10 000: tende a 0,27067, il valore di Poisson(2).'],
      [30.4, 'Perché: scriviamo la probabilità come prodotto di tre pezzi, con *k* e *λ* fissi e *n* → ∞.'],
      [36.4, 'I *k* rapporti (*n* − *j*)/*n* tendono a 1; (1 − *λ*/*n*)^{−k} tende a 1; e (1 − *λ*/*n*)*^n* tende a *e*^{−λ}: il fattore di Poisson.'],
      [45.7, 'Quanto è buona l’approssimazione? L’errore massimo è circa *p*/4: con *n* = 100 e *p* = 0,02 vale 0,0046.'],
      [52.4, 'Conta *p*, non *n*. Regola pratica: *n* grande, *p* piccolo, *λ* moderato.'],
    ],
    frame(t) {
      let o = '';
      o += heading(t, 0.2, 16.6, 'Un’ora a pezzetti', 'Bin(*n*, *λ*/*n*) con *np* = *λ* fisso');
      o += heading(t, 17.4, 30, 'Bin(*n*, 2/*n*) → Poisson(2)', 'istogrammi per *n* = 10, 100, 1 000, 10 000');
      o += heading(t, 30.8, 45.3, 'Il limite, a pezzi', '*k* e *λ* fissi, *n* → ∞');
      o += heading(t, 46.1, 57.6, 'Quanto è buona l’approssimazione', '100 pezzi, ciascuno difettoso con probabilità 0,02');

      /* capitolo 1: l'ora divisa in n parti */
      const a1 = 1 - p(t, 16.2, 17);
      if (a1 > 0.004) {
        const X0 = 60, XW = 520, AY = 236;
        const ax = p(t, 0.3, 1.1) * a1;
        o += path(`M${X0} ${AY}H${X0 + XW}`, { stroke: C.soft, sw: 2, op: ax }) + tx(X0, AY + 44, '0', { ff: SANS, size: 17, fill: C.soft, op: ax }) + tx(X0 + XW, AY + 44, '1 ora', { ff: SANS, size: 17, fill: C.soft, op: ax });
        /* le celle, per ogni livello di suddivisione */
        STG.forEach(([ts, n, ln1, ln2], s) => {
          const te = s < 3 ? STG[s + 1][0] : 17, u = p(t, ts, ts + 0.6) * (1 - (s < 3 ? p(t, te - 0.1, te + 0.5) : 0)) * a1;
          if (u < 0.004) return;
          const N = Math.min(n, 120);
          let d = '';
          for (let i = 0; i <= N; i++) d += `M${f(X0 + (i * XW) / N)} ${AY - 22}V${AY + 22}`;
          o += path(d, { stroke: C.soft, sw: n > 100 ? 0.8 : 1.6, op: u });
          EVT.forEach((e) => {
            const c = Math.floor(e * n), w = Math.max(XW / n, 3);
            o += rect(X0 + (c * XW) / n, AY - 22, w, 44, { fill: C.hi, fo: 0.5, op: u });
          });
          o += tx(60, 128, ln1, { size: 32, ta: 'start', op: u }) + tx(60, 160, ln2, { size: 22, ta: 'start', fill: C.soft, op: u });
          if (s === 0) {
            const fl = vis(t, ts + 0.4, te - 0.4, 0.4, 0.4) * a1;
            o += on(fl, cross(X0 + 0.25 * XW, AY - 64, 22, p(t, ts + 0.6, ts + 1.2, E.lin), { op: fl }) + tx(X0 + 0.25 * XW + 22, AY - 56, 'due ordini nella stessa parte', { ff: SANS, size: 17, ta: 'start', fill: NO, op: fl }));
          }
          if (s === 3) o += tx(X0 + XW / 2, AY + 74, 'una parte = un secondo: in ciascuna, al più un ordine', { ff: SANS, size: 17, fill: C.soft, op: u * p(t, ts + 0.8, ts + 1.6) });
        });
        /* i due ordini */
        EVT.forEach((e, i) => {
          const t0 = 1.4 + 0.6 * i, u = p(t, t0, t0 + 0.5, E.back);
          o += on(u, ln(X0 + e * XW, AY, X0 + e * XW, AY - 30, { stroke: C.A, sw: 2, op: u * a1 }) + circ(X0 + e * XW, AY - 36, 8 * u, { fill: C.A, fo: 0.9, stroke: C.paper, sw: 1.4, op: a1 }));
        });
        const lg = p(t, 2.2, 3) * (1 - p(t, 3.4, 4)) * a1;
        o += on(lg, tx(X0 + XW / 2, 150, 'due ordini in un’ora (in media *λ* = 2)', { ff: SANS, size: 17, fill: C.soft, op: lg }));
        const bl = p(t, 5, 5.8) * a1;
        o += on(bl, rect(468, 104, 116, 36, { rx: 8, fill: C.hi, fo: 0.25 * bl, stroke: C.hi, sw: 2, so: bl }) + tx(526, 130, 'Bin(*n*, *λ*/*n*)', { size: 22, op: bl }));
      }

      /* capitolo 2: gli istogrammi di Bin(n, 2/n) e la tabella di P(X = 2) */
      const a2 = p(t, 17, 17.6) * (1 - p(t, 30, 30.7));
      if (a2 > 0.004) {
        o += path(`M${BPX(0) - 22} ${BPB}H${BPX(8) + 22}`, { stroke: C.soft, sw: 1.8, op: a2 });
        let arr = PMB[0];
        for (let i = 1; i < 4; i++) {
          const u = p(t, TK[i] - 1.1, TK[i], E.io);
          if (u > 0) arr = arr.map((v, k) => lerp(v, PMB[i][k], u));
        }
        const g0 = p(t, 17.4, 18, E.out);
        for (let k = 0; k <= 8; k++) {
          const h = arr[k] * BPS * g0;
          o += rect(BPX(k) - 14, BPB - h, 28, h, { rx: 2, fill: k === 2 ? C.hi : C.A, fo: k === 2 ? 0.55 : 0.42, stroke: k === 2 ? C.hi : C.A, sw: 1.8, op: a2 });
          o += lb(BPX(k), BPB + 22, k, { op: a2 });
        }
        for (let k = 0; k <= 8; k++) { // il contorno di Poisson(2)
          const h = PMP[k] * BPS, ud = p(t, 18.2, 19);
          o += on(ud, rect(BPX(k) - 14, BPB - h, 28, h, { rx: 2, stroke: C.B, sw: 2.2, da: '5 4', so: ud, op: a2 }));
        }
        const nl = [0, 1, 2, 3].map((i) => vis(t, TK[i] - 1, i < 3 ? TK[i + 1] - 1 : 30, 0.5, 0.4));
        NSEQ.forEach((n, i) => (o += on(nl[i], tx(BPX(8) + 8, 172, '*n* = ' + (n >= 1000 ? String(n).replace(/(\d)(\d{3})$/, '$1 $2') : n), { size: 34, ta: 'end', op: nl[i] * a2 }))));
        const lgd = p(t, 18.4, 19.2) * a2;
        o += on(lgd, rect(60, 100, 14, 14, { rx: 3, fill: C.A, fo: 0.42, stroke: C.A, sw: 1.6, op: lgd }) + tx(80, 113, 'binomiale', { ff: SANS, size: 17, ta: 'start', op: lgd }) + path('M176 107h16', { stroke: C.B, sw: 2.2, da: '4 3', op: lgd }) + tx(198, 113, 'Poisson(2)', { ff: SANS, size: 17, ta: 'start', op: lgd }));
        /* la tabella a destra */
        const th = p(t, 17.8, 18.6) * a2;
        o += on(th, tx(626, 134, 'P(*X* = 2)', { ff: SANS, size: 17, fill: C.soft, ta: 'end', op: th }));
        [['*n* = 10', '0,30199'], ['*n* = 100', '0,27341'], ['*n* = 1 000', '0,27094'], ['*n* = 10 000', '0,27070']].forEach(([lab, v], i) => {
          const u = p(t, TK[i] - 0.4, TK[i] + 0.4), y = 168 + 38 * i;
          o += on(u, tx(404, y, lab, { size: 22, ta: 'start', op: u * a2 }) + tx(626, y, v, { size: 22, ta: 'end', op: u * a2 }));
        });
        const lm = p(t, 28.4, 29.2) * a2;
        o += on(lm, rect(396, 288, 238, 40, { rx: 8, fill: C.hi, fo: 0.25 * lm, stroke: C.hi, sw: 2, so: lm, op: a2 }) + tx(404, 316, 'limite', { size: 22, ta: 'start', op: lm * a2 }) + tx(626, 316, '0,27067', { size: 22, ta: 'end', op: lm * a2 }));
      }

      /* capitolo 3: la probabilità a pezzi */
      const a3 = p(t, 30.8, 31.5) * (1 - p(t, 45.3, 46));
      if (a3 > 0.004) {
        const c1 = p(t, 31.4, 32.2) * a3, c2 = p(t, 33.2, 34) * a3, c3 = p(t, 34.8, 35.6) * a3, c4 = p(t, 36.6, 37.4) * a3;
        o += on(c1, fr(52, 120, '*λ**^k*', '*k*!', { size: 28, fill: C.ink, op: c1 }) + tx(52, 190, 'fisso', { ff: SANS, size: 17, fill: C.soft, op: c1 }));
        o += on(c2, tx(96, 128, '·', { size: 30, op: c2 }) + fr(190, 120, '*n*(*n*−1)⋯(*n*−*k*+1)', '*n**^k*', { size: 22, fill: C.ink, nf: C.A, df: C.A, op: c2 }));
        o += on(c2, tx(190, 190, '*k* rapporti, ognuno → 1', { ff: SANS, size: 17, fill: C.A, op: c2 }));
        o += on(c3, tx(292, 128, '·', { size: 30, op: c3 }) + tx(372, 128, '(1 − *λ*/*n*)*^n*', { size: 28, fill: C.B, op: c3 }));
        o += on(c4, tx(456, 128, '·', { size: 30, op: c4 }) + tx(538, 128, '(1 − *λ*/*n*)*^{−k}*', { size: 28, fill: C.C, op: c4 }));
        const r1 = p(t, 37.6, 38.4) * a3, r2 = p(t, 39.4, 40.2) * a3, r3 = p(t, 41, 41.8) * a3;
        o += on(r1, tx(190, 226, '→ 1', { size: 28, fill: C.A, op: r1 }));
        o += on(r2, tx(538, 190, '→ 1', { size: 28, fill: C.C, op: r2 }));
        o += on(r3, tx(372, 190, '→ *e*^{−λ}', { size: 28, fill: C.B, op: r3 }));
        /* il pezzo difficile: (1 − 2/n)^n */
        const tb = p(t, 41.8, 42.6) * a3;
        o += on(tb, tx(320, 244, '(1 − 2/*n*)*^n' + ZW + '* al crescere di *n*', { ff: SANS, size: 17, fill: C.soft, op: tb }));
        [['10', '0,10737'], ['100', '0,13262'], ['1 000', '0,13506'], ['10^6', '0,13534'], ['limite', '0,13534']].forEach(([lab, v], i) => {
          const u = p(t, 42.2 + 0.4 * i, 42.8 + 0.4 * i), x = 80 + 120 * i;
          o += on(u, tx(x, 274, lab, { ff: SANS, size: 17, fill: C.soft, op: u * a3 }) + tx(x, 304, v, { size: 22, op: u * a3 }));
        });
        const bx = p(t, 44, 44.8) * a3;
        o += on(bx, rect(504, 280, 112, 34, { rx: 8, stroke: C.hi, sw: 2.6, so: bx }));
        const fin = p(t, 43.6, 44.4) * a3;
        o += on(fin, tx(320, 346, 'P(*X*_n = *k*) → *e*^{−λ} *λ**^k' + ZW + '*/*k*!', { size: 28, op: fin }));
      }

      /* capitolo 4: la qualità dell'approssimazione */
      const a4 = p(t, 46.1, 46.8);
      if (a4 > 0.004) {
        const bx = (k) => 70 + 56 * k, base = 288, sc = 560;
        o += path(`M${bx(0) - 28} ${base}H${bx(4) + 28}`, { stroke: C.soft, sw: 1.8, op: a4 });
        for (let k = 0; k <= 4; k++) {
          const u = p(t, 46.6 + 0.2 * k, 47.4 + 0.2 * k), h1 = EX100[k] * sc * u, h2 = PMP[k] * sc * u;
          o += on(u, rect(bx(k) - 22, base - h1, 20, h1, { rx: 2, fill: C.A, fo: 0.45, stroke: C.A, sw: 1.8, op: a4 }) + rect(bx(k) + 2, base - h2, 20, h2, { rx: 2, fill: C.B, fo: 0.45, stroke: C.B, sw: 1.8, op: a4 }) + lb(bx(k), base + 22, k, { op: u * a4 }));
        }
        const lgd = p(t, 47.6, 48.4) * a4;
        o += on(lgd, rect(60, 104, 14, 14, { rx: 3, fill: C.A, fo: 0.45, stroke: C.A, sw: 1.6, op: lgd }) + tx(80, 117, 'binomiale esatta', { ff: SANS, size: 17, ta: 'start', op: lgd }) + rect(214, 104, 14, 14, { rx: 3, fill: C.B, fo: 0.45, stroke: C.B, sw: 1.6, op: lgd }) + tx(234, 117, 'Poisson(2)', { ff: SANS, size: 17, ta: 'start', op: lgd }));
        const e1 = p(t, 48.8, 49.6) * a4, e2 = p(t, 50.4, 51.2) * a4;
        o += on(e1, tx(404, 150, 'errore massimo', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: e1 }) + tx(404, 192, '≈ 0,0046', { size: 36, ta: 'start', op: e1 }));
        o += on(e2, tx(404, 238, '≈ *p*/4', { size: 28, ta: 'start', op: e2 }) + tx(404, 270, 'con *p* = 0,02', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: e2 }));
        const pl = p(t, 53, 53.8) * a4;
        o += on(pl, pills(340, [{ s: '*n* grande, *p* piccolo, *λ* moderato: conta *p*, non *n*', col: C.hi, op: pl }]));
      }
      return o;
    },
  });
  /* ======================================================================
     2.5 · La media è la migliore previsione costante: E[(X − c)²] = Var(X) + (μ − c)² sul dado
     ====================================================================== */
  const errC = (c) => [1, 2, 3, 4, 5, 6].reduce((a, k) => a + (k - c) ** 2, 0) / 6; // errore quadratico medio del dado con la previsione c
  const LXC = (k) => 66 + 52 * (k - 1), PXC = (c) => 388 + 30 * c, PYC = (e) => 300 - 9.4 * e; // ascisse del dado e del grafico
  const f4 = (v) => v.toFixed(4).replace('.', ','), f2 = (v) => v.toFixed(2).replace('.', ',');
  const cAt = (t) => { // dove sta la previsione c nel tempo
    let c = 3;
    c = lerp(c, 3.5, p(t, 12.9, 14.4, E.io));
    c = lerp(c, 1, p(t, 17.3, 18.9, E.io));
    c = lerp(c, 6, p(t, 20.1, 25, E.io));
    c = lerp(c, 3.5, p(t, 32.8, 34.2, E.io));
    c = lerp(c, 0, p(t, 40.8, 43.2, E.io));
    return c;
  };
  const PARAB = (() => { let d = ''; for (let i = 0; i <= 28; i++) { const c = i / 4; d += (i ? 'L' : 'M') + f(PXC(c)) + ' ' + f(PYC(errC(c))); } return d; })();

  PV.add('previsione', {
    sec: '2.5',
    short: 'La media è la miglior previsione costante',
    title: 'La media è la migliore previsione costante: l’errore quadratico è una parabola',
    alt: 'Animazione: per prevedere il lancio di un dado con un solo numero c, l’errore quadratico medio è la media delle aree dei quadrati delle distanze dalle facce. Con c = 3 vale 19/6 ≈ 3,1667, con c = 3,5 vale 2,9167 (la varianza), con c = 1 vale 9,1667 = 2,9167 + 6,25. Al variare di c l’errore disegna una parabola con il minimo in c = μ: E[(X − c)²] = Var(X) + (μ − c)². Con c = 0 si ottiene E[X²] = Var(X) + μ² ≥ μ².',
    dur: 46.5,
    poster: 27,
    chap: [[0, 'Prevedere con un numero'], [12.9, 'La media è il minimo'], [20.1, 'Una parabola'], [25.1, 'Varianza più distanza'], [40.8, 'Il caso c = 0']],
    caps: [
      [0, 'Devi prevedere *X* con un solo numero *c*, e l’errore pesa al quadrato. Prendiamo il dado e proviamo *c* = 3.'],
      [7, 'Gli scarti dalle facce, al quadrato, valgono 4, 1, 0, 1, 4, 9: errore medio 19/6 ≈ 3,1667.'],
      [12.9, 'Con *c* = 3,5, la media, l’errore scende a 2,9167: è la varianza.'],
      [17.3, 'Con *c* = 1 sale a 9,1667 = 2,9167 + 6,25.'],
      [20.1, 'Al variare di *c* l’errore disegna una parabola, con il minimo in *c* = 3,5.'],
      [25.1, 'Teorema: *E*[(*X* − *c*)^2] = Var(*X*) + (*μ* − *c*)^2. Il primo termine non dipende da *c*, il secondo non è mai negativo.'],
      [32.8, 'Quindi l’errore è minimo per *c* = *μ* e vale Var(*X*): la varianza è l’errore della miglior previsione costante.'],
      [40.8, 'Con *c* = 0: *E*[*X*^2] = Var(*X*) + *μ*^2, quindi *E*[*X*^2] ≥ (*E*[*X*])^2.'],
    ],
    frame(t) {
      let o = '';
      o += heading(t, 0.2, 12.5, 'Prevedere il dado con un numero', 'errore = media dei quadrati delle distanze') + heading(t, 13.1, 24.8, 'Dove l’errore è minimo?', '*c* si muove, la parabola resta') + heading(t, 25.3, 40.4, 'Varianza più distanza al quadrato', '*E*[(*X* − *c*)^2] = Var(*X*) + (*μ* − *c*)^2') + heading(t, 41, 46.6, 'E con *c* = 0?', 'il momento secondo');
      const c = cAt(t), e = errC(c), vc = (3.5 - c) ** 2;

      /* il dado, il segnaposto c e i quadrati delle distanze (lato = distanza, area = distanza al quadrato) */
      for (let k = 1; k <= 6; k++) {
        const u = p(t, 0.3 + 0.15 * k, 0.9 + 0.15 * k, E.back);
        o += on(u, tile(LXC(k), 150, 36, k, { size: 20, sc: u, op: u }));
      }
      const mk = p(t, 4, 4.8, E.back);
      if (mk > 0.01) {
        const X = 66 + 52 * (c - 1);
        o += g({ tf: T(X, 0, 1), op: mk }, path('M0 124L-9 110H9Z', { fill: C.hi, stroke: C.ink, sw: 1.6 }) + ln(0, 124, 0, 172, { stroke: C.hi, sw: 3, da: '5 4' }) + tx(0, 100, '*c*', { size: 22 }));
      }
      for (let k = 1; k <= 6; k++) {
        const u = p(t, 5 + 0.15 * k, 5.8 + 0.15 * k), s = Math.abs(k - c) * 9.5 * u;
        o += on(u, rect(LXC(k) - s / 2, 190, s, s, { fill: C.A, fo: 0.32, stroke: C.A, sw: 2 }));
      }
      const rd = p(t, 6, 6.8);
      o += on(rd, txc(24, 282, [['c = ', C.soft], [f2(c), C.ink]], { size: 22, ta: 'start', op: rd }));
      o += on(rd, txc(24, 316, [['errore medio ', C.ink], [f4(e), C.A]], { size: 28, ta: 'start', op: rd }));
      const e19 = vis(t, 8, 12.6, 0.4, 0.4);
      o += on(e19, tx(24, 346, '(4 + 1 + 0 + 1 + 4 + 9)/6 = 19/6', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: e19 }));
      const dc = p(t, 25.4, 26.2);
      o += on(dc, tx(24, 346, 'Var + (μ − c)² = ' + f4(35 / 12) + ' + ' + f2(vc), { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: dc }));

      /* il grafico: errore in funzione di c, con il punto che percorre la parabola */
      const ch = p(t, 12.5, 13.3);
      if (ch > 0.004) {
        o += path(`M${PXC(0) - 10} 300H${PXC(7) + 10}`, { stroke: C.soft, sw: 1.8, op: ch });
        for (let q = 0; q <= 7; q++) o += lb(PXC(q), 322, q, { op: ch });
        o += tx(PXC(0) - 4, 126, 'errore', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: ch }) + tx(PXC(7) + 16, 322, '*c*', { size: 20, op: ch });
        o += path(PARAB, { stroke: C.A, sw: 2.6, op: ch, ...draw(ch) });
        const hl = p(t, 25.4, 26.4), vx = p(t, 20.6, 21.4);
        o += on(vx, ln(PXC(3.5), PYC(35 / 12), PXC(3.5), 300, { stroke: C.soft, sw: 1.4, da: '4 4', op: vx }) + tx(PXC(3.5), 346, '*μ* = 3,5', { size: 20, op: vx }));
        o += on(hl, path(`M${PXC(0)} ${f(PYC(35 / 12))}H${PXC(7)}`, { stroke: C.hi, sw: 2.2, da: '6 5', op: hl }) + tx(PXC(7), PYC(35 / 12) + 22, 'Var(*X*)', { size: 20, ta: 'end', op: hl }));
        const br = Math.max(p(t, 26.6, 27.4) * (1 - p(t, 32.8, 33.6)), p(t, 43.4, 44.2));
        if (br > 0.01 && vc > 0.3) {
          const x = PXC(c) + (c < 1.5 ? 14 : -14), y0 = PYC(35 / 12), y1 = PYC(e);
          o += (c < 1.5 ? vbrace(x - 5, y1, y0, C.B, br).replace('h5', 'h-5') : vbrace(x, y1, y0, C.B, br)) + tx(c < 1.5 ? x + 46 : x - 8, (y0 + y1) / 2 + 7, c < 1.5 ? '*μ*^2 = 12,25' : '(*μ* − *c*)^2', { size: 20, fill: C.B, ta: c < 1.5 ? 'start' : 'end', op: br });
        }
        o += circ(PXC(c), PYC(e), 7.5, { fill: C.hi, stroke: C.ink, sw: 2.2, op: ch });
        const mn = p(t, 35, 35.8) * (1 - p(t, 40.2, 40.8));
        o += on(mn, pills(96, [{ s: 'minimo in *c* = *μ*: Var(*X*)', col: C.hi, op: mn }], 500));
      }
      return o;
    },
  });
  /* ======================================================================
     2.7 · Minimo e massimo: il massimo di due dadi (bordi a L) e il minimo di due geometriche
     ====================================================================== */
  const GM = { x: 62, y: 118, s: 30 }; // tabella 6 × 6 dei due dadi
  const MBX = (k) => 306 + 52 * (k - 1), MBB = 292, MBS = 300; // barre di P(max = k)
  const TAIL = Array.from({ length: 7 }, (_, n) => 0.56 ** n); // P(min > n)

  PV.add('minmax', {
    sec: '2.7',
    short: 'Minimo e massimo',
    title: 'Minimo e massimo di variabili indipendenti: due dadi e due server',
    alt: 'Animazione: il massimo è ≤ k se e solo se tutte le variabili sono ≤ k. Per due dadi P(max ≤ k) = k²/36: un quadrato di k² caselle nella tabella 6 × 6; le caselle con massimo esattamente k sono il bordo a L, k² − (k − 1)² = 2k − 1, quindi P(max = k) = (2k − 1)/36 e E[max] = 161/36 ≈ 4,47. Per il minimo di due geometriche indipendenti, con probabilità 0,3 e 0,2, P(min > n) = 0,7^n · 0,8^n = 0,56^n: è geometrica con p = 0,44 e media 1/0,44 ≈ 2,27 tentativi, contro 3,33 e 5.',
    dur: 50,
    poster: 23.5,
    chap: [[0, 'Il massimo di due dadi'], [25.4, 'Il minimo di due geometriche']],
    caps: [
      [0, 'Il massimo di variabili è ≤ *k* se e solo se tutte sono ≤ *k*: con l’indipendenza le probabilità si moltiplicano.'],
      [7.3, 'Due dadi: *P*(max ≤ *k*) = (*k*/6)^2 = *k*^2/36, un quadrato di *k*² caselle nella tabella 6 × 6.'],
      [13.4, 'Quelle con massimo esattamente *k* sono il bordo a L: *k*^2 − (*k* − 1)^2 = 2*k* − 1 caselle.'],
      [19.4, 'Quindi *P*(max = *k*) = (2*k* − 1)/36: 1, 3, 5, 7, 9, 11 su 36, e *E*[max] = 161/36 ≈ 4,47.'],
      [25.4, 'Il minimo: due server indipendenti rispondono a ogni tentativo con probabilità 0,3 e 0,2. La prima risposta arriva al tentativo min(*X*, *Y*).'],
      [34.7, 'Il minimo è > *n* se e solo se entrambi sono > *n*: *P* = 0,7*^n* · 0,8*^n* = 0,56*^n*.'],
      [40.4, 'È la coda di una geometrica con 1 − *p* = 0,56, cioè *p* = 0,44: media 1/0,44 ≈ 2,27 tentativi.'],
      [46.7, 'Contro 3,33 e 5 dei due server presi da soli.'],
    ],
    frame(t) {
      let o = '';
      o += heading(t, 0.2, 25, 'Il massimo di due dadi', '*P*(max ≤ *k*) = (*k*/6)^2') + heading(t, 25.8, 50.2, 'Il minimo di due geometriche', 'il primo che risponde');

      /* capitolo 1: la tabella 6 × 6, i quadrati e i bordi a L */
      const a1 = 1 - p(t, 24.4, 25.2);
      if (a1 > 0.004) {
        const gu = p(t, 0.3, 1.4) * a1;
        for (let i = 1; i <= 6; i++) o += tx(GM.x + GM.s * (i - 0.5), GM.y - 8, i, { ff: SANS, size: 17, fill: C.soft, op: gu }) + tx(GM.x - 14, GM.y + GM.s * (i - 0.5) + 6, i, { ff: SANS, size: 17, fill: C.soft, op: gu });
        o += tx(GM.x + 3 * GM.s, GM.y - 28, 'dado 2', { ff: SANS, size: 17, fill: C.soft, op: gu });
        for (let r = 1; r <= 6; r++) {
          for (let c = 1; c <= 6; c++) {
            const m = Math.max(r, c), ts = 8 + 1.8 * (m - 1), u = p(t, 0.5 + 0.04 * (r + c), 1.1 + 0.04 * (r + c)), cur = p(t, ts, ts + 0.7) * (1 - p(t, ts + 1.6, ts + 2.2)), old = p(t, ts + 1.6, ts + 2.4);
            let b = rect(GM.x + (c - 1) * GM.s + 1, GM.y + (r - 1) * GM.s + 1, GM.s - 2, GM.s - 2, { rx: 3, fill: C.paper, stroke: C.soft, sw: 1.2 });
            if (m <= 6 && t >= ts) b += rect(GM.x + (c - 1) * GM.s + 1, GM.y + (r - 1) * GM.s + 1, GM.s - 2, GM.s - 2, { rx: 3, fill: C.hi, fo: 0.62 * cur + 0.3 * old, stroke: C.hi, sw: 2, so: Math.max(cur, 0.5 * old) });
            o += g({ op: u * a1 }, b);
          }
        }
        /* i quadrati k × k */
        for (let k = 1; k <= 6; k++) {
          const ts = 8 + 1.8 * (k - 1), sq1 = p(t, ts - 0.4, ts + 0.1) * (1 - p(t, ts + 1.2, ts + 1.8));
          o += on(sq1, rect(GM.x, GM.y, GM.s * k, GM.s * k, { rx: 4, stroke: C.A, sw: 3.2, so: sq1, op: a1 }));
        }
        /* a destra: le formule, sopra le barre */
        const f1 = vis(t, 1.6, 13, 0.5, 0.5) * a1, f2 = p(t, 7.6, 8.4) * (1 - p(t, 13.2, 13.9)) * a1, f3 = p(t, 13.8, 14.6) * (1 - p(t, 21, 21.8)) * a1, f4s = p(t, 17.6, 18.4) * (1 - p(t, 21, 21.8)) * a1;
        o += on(f1, tx(296, 140, 'max ≤ *k*  ⟺  tutti ≤ *k*', { size: 24, ta: 'start', op: f1 * (1 - p(t, 7.2, 7.8)) }));
        o += on(f2, tx(296, 136, '*P*(max ≤ *k*) = *k*^2/36', { size: 24, ta: 'start', op: f2 }) + tx(296, 166, '(*k*/6)^2 = *k*/6 · *k*/6', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: f2 }));
        o += on(f3, tx(296, 136, 'massimo = *k*: il bordo a L', { size: 24, ta: 'start', op: f3 }) + tx(296, 164, '*k*^2 − (*k* − 1)^2 = 2*k* − 1 caselle', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: f3 }));
        o += on(f4s, tx(296, 190, '*P*(max = *k*) = (2*k* − 1)/36', { size: 20, ta: 'start', op: f4s }));
        /* le barre */
        const ba = p(t, 8, 8.6) * a1;
        o += on(ba, path(`M${MBX(1) - 26} ${MBB}H${MBX(6) + 26}`, { stroke: C.soft, sw: 1.8, op: ba }));
        for (let k = 1; k <= 6; k++) {
          const ts = 8 + 1.8 * (k - 1), u = p(t, ts + 0.5, ts + 1.4), h = ((2 * k - 1) / 36) * MBS * u;
          o += on(u, rect(MBX(k) - 17, MBB - h, 34, h, { rx: 2, fill: C.hi, fo: 0.5, stroke: C.hi, sw: 2, op: a1 }) + lb(MBX(k), MBB + 22, k, { op: u * a1 }) + tx(MBX(k), MBB - h - 7, (2 * k - 1) + '/36', { size: 17, ff: SANS, op: u * a1 }));
        }
        const em = p(t, 21.6, 22.4) * a1, ml = p(t, 22.2, 23) * a1;
        o += on(ml, path(`M${f(MBX(1) + 52 * (161 / 36 - 1))} 206V${MBB}`, { stroke: C.B, sw: 3, da: '6 5', op: ml }));
        o += on(em, rect(292, 112, 262, 44, { rx: 8, fill: C.hi, fo: 0.25 * em, stroke: C.hi, sw: 2, so: em }) + tx(423, 142, '*E*[max] = 161/36 ≈ 4,47', { size: 24, op: em }));
      }

      /* capitolo 2: due server, il primo che risponde */
      const a2 = p(t, 25.8, 26.4) * (1 - p(t, 34.5, 35.3));
      if (a2 > 0.004) {
        const rows = [[132, C.A, 'server 1', 'p = 0,3', 4], [196, C.B, 'server 2', 'p = 0,2', 6]];
        rows.forEach(([y, col, nm, pp, win]) => {
          o += tx(24, y - 2, nm, { ff: SANS, size: 17, fill: col, ta: 'start', op: a2 }) + tx(24, y + 20, pp, { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: a2 });
          for (let i = 1; i <= 8; i++) {
            const t0 = 26.4 + 0.8 * i, u = p(t, t0, t0 + 0.5, E.back);
            if (i > win) continue;
            const x = 140 + 48 * (i - 1), ok = i === win;
            o += on(u, g({ tf: T(x, y, u), op: a2 }, rect(-19, -19, 38, 38, { rx: 8, fill: ok ? col : C.paper, fo: ok ? 0.3 : 1, stroke: ok ? col : C.soft, sw: ok ? 3 : 1.6 }) + (ok ? check(0, 0, 18, 1) : cross(0, 0, 16, 1, { op: 0.55 }))));
          }
        });
        for (let i = 1; i <= 8; i++) o += lb(140 + 48 * (i - 1), 244, i, { op: p(t, 27, 27.8) * a2 });
        const mn = p(t, 32.4, 33.2) * a2;
        o += on(mn, rect(140 + 48 * 3 - 25, 107, 50, 50, { rx: 11, stroke: C.hi, sw: 3.6, so: mn, op: 1 }) + tx(140 + 48 * 3, 282, 'min(*X*, *Y*) = 4', { size: 26, op: mn }) + tx(140 + 48 * 3, 312, 'la prima risposta in assoluto', { ff: SANS, size: 17, fill: C.soft, op: mn }));
      }

      /* la coda del minimo e la geometrica con p = 0,44 */
      const a3 = p(t, 35.2, 35.9) * (1 - p(t, 49.8, 50.4));
      if (a3 > 0.004) {
        const bx = (n) => 74 + 56 * n, bb = 294, bs = 150;
        o += path(`M${bx(0) - 28} ${bb}H${bx(6) + 28}`, { stroke: C.soft, sw: 1.8, op: a3 });
        TAIL.forEach((v, n) => {
          const u = p(t, 36 + 0.3 * n, 36.8 + 0.3 * n), h = v * bs * u;
          o += on(u, rect(bx(n) - 20, bb - h, 40, h, { rx: 2, fill: C.hi, fo: 0.45, stroke: C.hi, sw: 1.8, op: a3 }) + lb(bx(n), bb + 22, n, { op: u * a3 }) + tx(bx(n), bb - h - 7, f2(v), { size: 17, ff: SANS, op: u * a3 }));
        });
        o += tx(bx(3), 118, '*P*(min > *n*)', { size: 22, op: p(t, 36, 36.8) * a3 });
        const q1 = p(t, 37.4, 38.2) * a3, q2 = p(t, 38.8, 39.6) * a3, q3 = p(t, 41.4, 42.2) * a3, q4 = p(t, 43.6, 44.4) * a3;
        o += on(q1, tx(484, 150, '0,7*^n' + ZW + '* · 0,8*^n*', { size: 22, ta: 'start', op: q1 }));
        o += on(q2, tx(484, 184, '= 0,56*^n*', { size: 26, ta: 'start', op: q2 }));
        o += on(q3, tx(484, 232, 'geometrica', { size: 22, fill: C.A, ta: 'start', op: q3 }) + tx(484, 262, '*p* = 0,44', { size: 26, fill: C.A, ta: 'start', op: q3 }));
        o += on(q4, tx(484, 304, 'media 2,27', { size: 24, ta: 'start', op: q4 }));
        const pc = p(t, 46.7, 47.5) * a3;
        o += on(pc, pills(344, [{ s: 'min: 2,27 · server 1: 3,33 · server 2: 5', col: C.hi, op: pc }], 320));
      }
      return o;
    },
  });
})();
