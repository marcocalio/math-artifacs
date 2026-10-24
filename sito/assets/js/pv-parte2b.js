/* =========================================================================
   pv-parte2b.js — video della Parte 2 (Modelli discreti): sezioni 2.1-2.4,
   più il ripasso 'parte2' che mette in fila tutte le clip della Parte 2
   (anche quelle di 2.5-2.7, che stanno in pv-parte2.js).
   Si appoggia a pv.js: ogni video è un PV.add(id, {...}).
   Tutti i tempi sono in secondi; le coordinate sono nel riquadro 640 × 360.
   ========================================================================= */
(function () {
  'use strict';
  const { lerp, E, p, arc, rnd, C, SANS, T, rect, circ, ell, ln, path, g, draw, tx, txc, lbl, tile, check, cross, vis, on, bump, heading, subline, lb, vl, fr, brace, vbrace, lbrace, wipe, pills, bn } = PV.h;
  const OK = 'var(--verde)', NO = 'var(--rosso)';

  /* freccia da (x1,y1) a (x2,y2) che si disegna (u da 0 a 1); la punta compare a fine corsa */
  function arrow(x1, y1, x2, y2, u, col, op = 1) {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 8;
    let o = path(`M${x1} ${y1}L${x2} ${y2}`, { stroke: col, sw: 2.2, op, ...draw(u) });
    if (u > 0.92) o += path(`M${x2} ${y2}L${x2 - h * Math.cos(a - 0.45)} ${y2 - h * Math.sin(a - 0.45)}M${x2} ${y2}L${x2 - h * Math.cos(a + 0.45)} ${y2 - h * Math.sin(a + 0.45)}`, { stroke: col, sw: 2.2, lc: 'round', op });
    return o;
  }
  /* barra che sale da base (x = centro) */
  const bar = (x, base, h, w, col, op = 1, a = {}) => rect(x - w / 2, base - h, w, h, { rx: 3, fill: col, fo: 0.85, op, ...a });

  /* ======================================================================
     2.1 · Una variabile aleatoria è una funzione: due monete, X = teste
     ====================================================================== */
  const OUT = [['CC', 0], ['CT', 1], ['TC', 1], ['TT', 2]]; // esito → valore di X
  const OY = (i) => 112 + i * 58; // quota delle caselle degli esiti
  const VY = { 0: 140, 1: 196, 2: 252 }; // quota delle caselle dei valori
  const BX = { 0: 190, 1: 320, 2: 450 }, BASE = 280, BH = 84; // barre della densità: 1/4 = 84 unità
  const STK = [0, 0, 1, 0]; // posto nella pila (CT sotto, TC sopra)

  PV.add('variabile', {
    sec: '2.1',
    short: 'Una variabile aleatoria',
    title: 'Variabile aleatoria e densità discreta: due monete, X = numero di teste',
    alt: 'Animazione: quattro esiti di due lanci di moneta vengono trasformati in numeri (teste) da una funzione X; poi le loro probabilità si raccolgono per valore e danno la densità 1/4, 1/2, 1/4; la tabella è la densità, o legge, di X.',
    dur: 58,
    poster: 33,
    chap: [[0, 'Una funzione dagli esiti ai numeri'], [22.5, 'La densità di X'], [44.5, 'Stessa legge, coppia diversa']],
    caps: [
      [0, 'Lancio due monete equilibrate e chiamo *X* il numero di teste. Una variabile aleatoria è una funzione: a ogni esito associa un numero.'],
      [9, 'CC dà 0, CT e TC danno 1, TT dà 2. L’unica cosa casuale è quale esito *ω* esce: la funzione *X* è sempre la stessa.'],
      [22.5, 'Raccolgo per valore: *X* = 0 si verifica per un esito su quattro, *X* = 1 per due su quattro, *X* = 2 per uno su quattro.'],
      [31.5, 'Questa tabella è la densità discreta di *X*: *p*(*x*) = *P*(*X* = *x*), con *p*(*x*) ≥ 0 e somma 1. Si chiama anche legge di *X*.'],
      [44.5, 'Attenzione: la legge di una variabile non dice tutto. *W*, il numero di croci, ha la stessa legge di *X*…'],
      [50, '…ma *X* + *X* = 2*X* vale 0, 2 o 4, mentre *X* + *W* vale sempre 2. Per descrivere la coppia serve la densità congiunta (2.3).'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 21.8, 'Una funzione dagli esiti ai numeri', '*X* = numero di teste su due lanci') + heading(t, 22.4, 44, 'Raccolgo per valore: la densità di *X*', '*p*_X(*x*) = P(*X* = *x*)') + heading(t, 44.6, 58.4, 'Stessa legge, ma la coppia cambia', '*X* = teste, *W* = croci');

      /* capitoli 1 e 2: gli esiti restano, poi diventano blocchi nelle barre */
      const c12 = 1 - p(t, 43.4, 44.2);
      if (c12 > 0.004) {
        for (let i = 0; i < 4; i++) {
          const [lab, v] = OUT[i], u = p(t, 1 + i * 0.3, 1.7 + i * 0.3, E.back);
          if (u <= 0) continue;
          const f = p(t, 23.4 + i * 0.9, 24.8 + i * 0.9, E.io);
          const [bx, by] = [BX[v], BASE - BH * (STK[i] + 0.5)];
          const [x, y] = arc(120, OY(i), bx, by, f, 36);
          const w = lerp(46, 84, f), h = lerp(46, BH - 3, f);
          const pulse = i === Math.min(3, Math.floor((t - 6) / 2.2)) && t >= 6 && t < 14.8 ? bump(t, 6 + i * 2.2, 1.4) : 0;
          o += g({ op: c12 * u, tf: T(x, y, 1 + 0.12 * pulse) }, rect(-w / 2, -h / 2, w, h, { rx: 8, fill: C.paper, stroke: pulse > 0.05 ? C.hi : C.soft, sw: pulse > 0.05 ? 3 : 1.8 }) + rect(-w / 2, -h / 2, w, h, { rx: 8, fill: C.A, fo: 0.1 + 0.2 * f }) + tx(0, 7, lab, { size: 20 }));
          o += on(u * (1 - f), tx(64, OY(i) + 6, '1/4', { ff: SANS, size: 17, fill: C.soft, op: c12 * u * (1 - f) }));
        }
        /* colonna dei valori e frecce (capitolo 1) */
        const c1 = p(t, 3.4, 4.2) * (1 - p(t, 21.2, 22));
        if (c1 > 0.004) {
          o += tx(500, 108, 'valori di *X*', { ff: SANS, size: 16, fill: C.soft, op: c1 });
          for (const v of [0, 1, 2]) o += tile(500, VY[v], 48, v, { op: c1, size: 24 });
          OUT.forEach(([lab, v], i) => {
            const u = p(t, 6 + i * 2.2, 7 + i * 2.2, E.io);
            if (u > 0) o += arrow(146, OY(i), 474, VY[v] + (i === 2 ? 4 : i === 1 ? -4 : 0), u, C.A, c1);
          });
          const k = Math.min(3, Math.floor((t - 6) / 2.2));
          if (t >= 6.6) o += tx(320, 308, '*X*(' + OUT[k][0] + ') = ' + OUT[k][1], { size: 26, fill: C.A, op: c1 });
        }
        /* capitolo 1: la scritta X: Ω → ℝ */
        const f1 = p(t, 15.4, 16.2) * (1 - p(t, 21.2, 22));
        o += on(f1, pills(342, [{ s: 'X : Ω → ℝ, a ogni esito un numero', op: f1 }]));
        /* capitolo 2: assi, valori e probabilità sulle barre */
        const c2 = p(t, 27.5, 28.5) * c12;
        if (c2 > 0.004) {
          o += ln(120, BASE, 520, BASE, { stroke: C.soft, sw: 1.8, op: c2 });
          for (const v of [0, 1, 2]) o += tx(BX[v], BASE + 24, '*X* = ' + v, { ff: SANS, size: 17, fill: C.soft, op: c2 });
          const pr = [['1/4', 0, 1], ['1/2', 1, 2], ['1/4', 2, 1]];
          pr.forEach(([s2, v, n], k) => {
            const u = p(t, 28.6 + k * 0.5, 29.3 + k * 0.5);
            o += on(u * c2, tx(BX[v], BASE - BH * n - 12, s2, { size: 26, fill: OK, op: u * c2 }));
          });
        }
        const sm = p(t, 33.6, 34.4) * c12;
        o += on(sm, pills(340, [{ s: '1/4 + 1/2 + 1/4 = 1', icon: 'ok', col: OK, op: sm, u: p(t, 33.9, 34.6, E.lin) }]));
      }

      /* capitolo 3: X e W hanno la stessa legge, X + X e X + W no */
      const c3 = vis(t, 44.6, 58.4, 0.6, 0.01);
      if (c3 > 0.004) {
        const mini = (cx, base, vals, probs, col, op, lab, showV = true) => {
          let r = '';
          vals.forEach((v, i) => {
            const h = probs[i] * 100;
            r += bar(cx + (i - (vals.length - 1) / 2) * 48, base, h, 30, col, op);
            if (showV) r += tx(cx + (i - (vals.length - 1) / 2) * 48, base + 20, v, { ff: SANS, size: 16, fill: C.soft, op });
          });
          return r + tx(cx, base + 44, lab, { size: 20, op });
        };
        const a1 = p(t, 45.2, 46) * c3, a2 = p(t, 46.2, 47) * c3, eq = p(t, 47.4, 48.2) * c3;
        o += on(a1, mini(130, 140, [0, 1, 2], [0.25, 0.5, 0.25], C.A, a1, '*X*: teste'));
        o += on(a2, mini(330, 140, [0, 1, 2], [0.25, 0.5, 0.25], C.B, a2, '*W*: croci'));
        o += on(eq, tx(230, 120, '=', { size: 40, fill: OK, op: eq }) + tx(480, 100, 'stessa legge', { ff: SANS, size: 20, fill: OK, ta: 'start', op: eq }));
        const b1 = p(t, 50.2, 51) * c3, b2 = p(t, 52, 52.8) * c3;
        o += on(b1, mini(130, 300, [0, 2, 4], [0.25, 0.5, 0.25], C.A, b1, '*X* + *X* = 2*X*'));
        o += on(b2, mini(330, 300, [2], [1], C.C, b2, '*X* + *W*') + tx(372, 252, 'sempre 2', { ff: SANS, size: 17, fill: C.C, ta: 'start', op: b2 }));
        const ne = p(t, 54, 54.8) * c3;
        o += on(ne, tx(500, 270, '≠', { size: 46, fill: NO, op: ne }) + tx(500, 306, 'servono le due', { ff: SANS, size: 16, fill: C.soft, op: ne }) + tx(500, 326, 'variabili insieme', { ff: SANS, size: 16, fill: C.soft, op: ne }));
      }
      return o;
    },
  });

  /* ======================================================================
     2.1 · La legge di una funzione di X (il termostato) e le indicatrici
     ====================================================================== */
  const XV = [-2, -1, 0, 1, 2]; // errori del termostato, ciascuno con probabilità 1/5
  const YD = { 0: [200, 0], 1: [320, 0], 4: [440, 0] }; // dove finiscono i valori di Y = X²
  const BLH = 38; // altezza di un blocco da 1/5

  PV.add('leggeg', {
    sec: '2.2',
    short: 'La legge di Y = g(X)',
    title: 'La legge di una funzione di X, e le indicatrici',
    alt: 'Animazione: cinque errori di un termostato, ciascuno con probabilità 1/5, vengono elevati al quadrato: i blocchi di probabilità di −1 e +1 si sommano su Y = 1, quelli di −2 e +2 su Y = 4; poi le indicatrici di un evento su un dado, con le regole 1 − 1_A e 1_A · 1_B.',
    dur: 54,
    poster: 20,
    chap: [[0, 'Y = X²: le probabilità si sommano'], [26.5, 'Le indicatrici']],
    caps: [
      [0, 'Un termostato sbaglia la misura di −2, −1, 0, +1 o +2 gradi, e ciascun errore *X* ha probabilità 1/5.'],
      [6, 'Per giudicare la precisione si usa l’errore al quadrato, *Y* = *X*²: non tiene conto del segno.'],
      [11, 'Raccolgo per valori: −1 e +1 finiscono entrambi su *Y* = 1, −2 e +2 su *Y* = 4. Le loro probabilità si sommano.'],
      [20.5, 'Quindi *Y* vale 0 con probabilità 1/5, 1 con 2/5 e 4 con 2/5. Controllo: 1/5 + 2/5 + 2/5 = 1.'],
      [26.5, 'La variabile più semplice è l’indicatrice di un evento: vale 1 se *A* si verifica e 0 altrimenti. Con un dado, *A* = «esce pari».'],
      [35, 'Si calcola come con i numeri: 1_A^c = 1 − 1_A, e il prodotto 1_A · 1_B = 1_{A∩B}, perché vale 1 solo se valgono 1 entrambe.'],
      [45, 'La densità di 1_A è *p*(1) = *P*(*A*) e *p*(0) = 1 − *P*(*A*): è una Bernoulli. Con le indicatrici si conta quante volte succede qualcosa (2.4).'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 26, 'La legge di una funzione di *X*', '*p*_Y(*y*) = Σ *p*_X(*x*) sui valori *x* con *g*(*x*) = *y*') + heading(t, 26.6, 54.4, 'Le indicatrici', 'vale 1 se l’evento si verifica, 0 altrimenti');

      /* capitolo 1: i blocchi da 1/5 volano dalle X ai valori di Y = X² */
      const c1 = vis(t, 0.5, 26, 0.6, 0.7);
      if (c1 > 0.004) {
        const stack = { '-2': 0, '-1': 0, 0: 0, 1: 1, 2: 1 };
        XV.forEach((x, i) => {
          const u = p(t, 1 + i * 0.25, 1.8 + i * 0.25, E.back), y = x * x;
          if (u <= 0) return;
          const x0 = 120 + i * 100, y0 = 118, [dx] = YD[y], dy = 290 - BLH * (stack[x] + 0.5);
          const f = p(t, 11 + i * 1, 12.6 + i * 1, E.io), [bx, by] = arc(x0, y0, dx, dy, f, 40);
          o += rect(x0 - 35, y0 - BLH / 2, 70, BLH, { rx: 6, stroke: C.soft, sw: 1.2, da: '4 4', op: c1 * u * 0.6 });
          o += g({ op: c1 * u, tf: T(bx, by, lerp(1, 0.97, f)) }, rect(-35, -BLH / 2, 70, BLH, { rx: 6, fill: C.A, fo: 0.35, stroke: C.A, sw: 1.8 }) + tx(0, 6, '1/5', { ff: SANS, size: 17 }));
          o += tx(x0, 164, x < 0 ? '−' + -x : x, { size: 24, op: c1 * u });
        });
        o += tx(46, 126, '*X*', { size: 26, fill: C.A, op: c1 * p(t, 1, 1.6) });
        const yf = p(t, 6, 6.8) * c1;
        o += on(yf, tx(46, 214, '*Y* = *X*²', { size: 24, fill: C.B, ta: 'start', op: yf }) + tx(60, 190, '↓', { size: 28, fill: C.B, op: yf }));
        const ya = p(t, 15.6, 16.4) * c1;
        o += on(ya, g({ op: ya }, ln(130, 290, 520, 290, { stroke: C.soft, sw: 1.8 }) + [0, 1, 4].map((y) => tx(YD[y][0], 314, y, { size: 24, fill: C.B })).join('') + tx(46, 306, '*Y*', { size: 26, fill: C.B })));
        [[0, 1], [1, 2], [4, 2]].forEach(([y, n], k) => {
          const u = p(t, 17 + k * 0.6, 17.7 + k * 0.6) * c1;
          if (u > 0.004) o += tx(YD[y][0], 290 - BLH * n - 10, n + '/5', { size: 26, fill: OK, op: u });
        });
        const pl = p(t, 21, 21.8) * c1;
        o += on(pl, pills(344, [{ s: '1/5 + 2/5 + 2/5 = 1', icon: 'ok', col: OK, op: pl, u: p(t, 21.3, 22, E.lin) }]));
      }

      /* capitolo 2: le indicatrici di A = pari e B = più di 4 su un dado */
      const c2 = vis(t, 27, 54, 0.6, 0.01);
      if (c2 > 0.004) {
        const cx = (n) => 150 + (n - 1) * 70, rows = [
          [172, '1_A', [0, 1, 0, 1, 0, 1], C.A, 28.5],
          [214, '1_A^c', [1, 0, 1, 0, 1, 0], C.soft, 33],
          [256, '1_B', [0, 0, 0, 0, 1, 1], C.B, 37],
          [298, '1_A · 1_B', [0, 0, 0, 0, 0, 1], OK, 40.5],
        ];
        for (let n = 1; n <= 6; n++) o += tile(cx(n), 122, 40, n, { op: c2 * p(t, 27.4 + n * 0.1, 27.9 + n * 0.1), size: 22 });
        rows.forEach(([y, lab, vals, col, t0]) => {
          const u = p(t, t0, t0 + 0.7) * c2;
          if (!(u > 0.004)) return;
          o += tx(64, y + 8, lab, { size: 22, fill: col, op: u });
          vals.forEach((v, i) => (o += tile(cx(i + 1), y, 34, v, { op: u * (v ? 1 : 0.55), size: 20, veil: v ? col : undefined, vo: 0.22, ring: v ? col : undefined, ro: 0.9 })));
        });
        const e1 = p(t, 33.6, 34.4) * c2, e2 = p(t, 41.2, 42) * c2;
        o += on(e1 * (1 - p(t, 36.5, 37)), tx(534, 222, '= 1 − 1_A', { size: 20, fill: C.soft, ta: 'start', op: e1 * (1 - p(t, 36.5, 37)) }));
        o += on(e2, tx(534, 306, '= 1_{A∩B}', { size: 21, fill: OK, ta: 'start', op: e2 }));
      }
      return o;
    },
  });

  /* ======================================================================
     2.2 · Funzione di ripartizione: la scala che accumula la densità
     ====================================================================== */
  const XP = (v) => 90 + (v + 1) * 115; // valore → posto sull'asse orizzontale (da −1 a 3)
  const FYF = (f) => 330 - f * 120; // livello di F → quota
  const JUMP = [[0, 0, 0.25], [1, 0.25, 0.75], [2, 0.75, 1]]; // [valore, F prima, F dopo]

  PV.add('ripartizione', {
    sec: '2.2',
    short: 'La funzione di ripartizione',
    title: 'Funzione di ripartizione: F(x) = P(X ≤ x), la scala che accumula la densità',
    alt: 'Animazione: sull’esempio delle due monete un cursore scorre da sinistra a destra accumulando la densità 1/4, 1/2, 1/4 e disegna la funzione a scalini F; poi si guardano i salti e la continuità a destra, e la formula P(a < X ≤ b) = F(b) − F(a).',
    dur: 58,
    poster: 37,
    chap: [[0, 'Accumulare da sinistra'], [16.5, 'Salti e continuità a destra'], [32.5, 'Probabilità su intervalli']],
    caps: [
      [0, 'La densità risponde a «quanto vale la probabilità che *X* sia esattamente *x*?». La ripartizione risponde a una domanda cumulativa: *F*(*x*) = *P*(*X* ≤ *x*).'],
      [4, 'Si ottiene accumulando la densità da sinistra a destra. Sulle due monete: prima di 0 non c’è niente, *F* = 0.'],
      [8, 'Arrivato a 0 si accumula 1/4; a 1 si aggiungono 2/4 e *F* vale 3/4; a 2 si aggiunge 1/4 e *F* arriva a 1. Il grafico viene a scalini.'],
      [16.5, 'Nel punto del salto *F* vale il livello alto: *F*(1) = 3/4, non 1/4. Il pallino pieno è il valore, quello vuoto il livello saltato: *F* è continua a destra.'],
      [24.5, 'Ogni salto è alto quanto la densità: *P*(*X* = *x*) = *F*(*x*) − *F*(*x*−). Da 1/4 a 3/4 il salto è 2/4 = *p*(1).'],
      [32.5, 'Per le probabilità su intervalli: *P*(*a* < *X* ≤ *b*) = *F*(*b*) − *F*(*a*). Sulle monete *P*(0 < *X* ≤ 2) = *F*(2) − *F*(0) = 1 − 1/4 = 3/4.'],
      [44, 'Attenzione ai segni: a sinistra < stretto, a destra ≤. Con valori interi *P*(*X* < 2) = *F*(1) = 3/4, mentre *P*(*X* ≤ 2) = *F*(2) = 1.'],
      [53, 'Dalla ripartizione si ricava la densità, e viceversa.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 16.2, 'Accumulare la densità da sinistra', '*F*(*x*) = P(*X* ≤ *x*)') + heading(t, 16.8, 32.2, 'I salti di *F*', 'ogni salto è alto quanto la densità') + heading(t, 32.8, 58.4, 'Probabilità su intervalli', '*P*(*a* < *X* ≤ *b*) = *F*(*b*) − *F*(*a*)');
      const xv = lerp(-0.7, 3, p(t, 4, 15, E.lin)); // il cursore
      const sw = t < 15 ? xv : 3.2;
      /* assi: densità in alto, F in basso */
      const ax = p(t, 0.4, 1.4);
      o += g({ op: ax }, ln(70, 150, 600, 150, { stroke: C.soft, sw: 1.6 }) + ln(70, 330, 600, 330, { stroke: C.soft, sw: 1.6 }) + ln(70, 200, 70, 330, { stroke: C.soft, sw: 1.6 }));
      for (const v of [0, 1, 2]) o += tx(XP(v), 172, v, { size: 20, fill: C.soft, op: ax }) + tx(XP(v), 352, v, { size: 18, fill: C.soft, op: ax * 0 });
      [[0, '0'], [0.25, '1/4'], [0.75, '3/4'], [1, '1']].forEach(([f, s2]) => (o += tx(56, FYF(f) + 6, s2, { ff: SANS, size: 15, fill: C.soft, ta: 'end', op: ax })));
      o += tx(40, 118, '*p*', { size: 24, fill: C.A, op: ax }) + tx(40, 214, '*F*', { size: 24, fill: C.B, op: ax });
      /* barre della densità: si accendono quando il cursore le supera */
      [[0, 0.25], [1, 0.5], [2, 0.25]].forEach(([v, pr]) => {
        const u = p(t, 1.2 + v * 0.3, 1.9 + v * 0.3, E.back), acc = sw >= v ? 1 : 0, h = pr * 140;
        const hl = t > 32.5 && t < 44 && v >= 1 ? 1 : 0;
        if (u > 0) o += bar(XP(v), 150, h * u, 40, acc || hl ? C.hi : C.A, 1, { fo: acc || hl ? 0.9 : 0.5 }) + tx(XP(v), 150 - h / 2 + 6, pr === 0.5 ? '1/2' : '1/4', { size: 17, fill: C.paper, op: u });
      });
      /* la scala F, disegnata fino al cursore */
      const lv = [[-1, 0, 0], [0, 1, 0.25], [1, 2, 0.75], [2, 3, 1]];
      lv.forEach(([a, b, f]) => {
        if (sw > a) o += ln(XP(a), FYF(f), XP(Math.min(b, sw)), FYF(f), { stroke: C.B, sw: 3.4, lc: 'round' });
      });
      JUMP.forEach(([v, f0, f1]) => {
        if (sw >= v) {
          const u = t < 15 ? 1 : 1;
          o += ln(XP(v), FYF(f0), XP(v), FYF(f1), { stroke: C.B, sw: 1.6, da: '4 4', op: 0.7 });
          o += circ(XP(v), FYF(f0), 5.5, { fill: C.paper, stroke: C.B, sw: 2.4 }) + circ(XP(v), FYF(f1), 5.5, { fill: C.B, stroke: C.B, sw: 2 });
        }
      });
      /* cursore */
      const cv = p(t, 4, 4.6) * (1 - p(t, 15.2, 16));
      if (cv > 0.004) {
        const fx = xv < 0 ? 0 : xv < 1 ? 0.25 : xv < 2 ? 0.75 : 1;
        o += g({ op: cv }, ln(XP(xv), 96, XP(xv), 336, { stroke: C.hi, sw: 2.4, da: '6 4' }) + circ(XP(xv), FYF(fx), 6, { fill: C.hi }) + tx(Math.min(XP(xv) + 12, 520), FYF(fx) - 14, '*F* = ' + (fx === 0 ? '0' : fx === 0.25 ? '1/4' : fx === 0.75 ? '3/4' : '1'), { size: 20, ta: 'start' }));
      }

      /* capitolo 2: il salto in x = 1 */
      const c2 = vis(t, 17, 32.2, 0.6, 0.6);
      if (c2 > 0.004) {
        const l1 = p(t, 17.6, 18.4), l2 = p(t, 20.4, 21.2), l3 = p(t, 24.8, 25.6), l4 = p(t, 27, 27.8);
        o += on(l1 * c2, tx(XP(1) + 14, FYF(0.75) - 10, '*F*(1) = 3/4', { size: 22, fill: C.B, ta: 'start', op: l1 * c2 }));
        o += on(l2 * c2, tx(XP(1) + 14, FYF(0.25) + 24, '*F*(1−) = 1/4', { size: 22, fill: C.B, ta: 'start', op: l2 * c2 }));
        o += on(l3 * c2, g({ op: l3 * c2 }, lbrace(XP(1) - 10, FYF(0.75), FYF(0.25), C.A) + tx(XP(1) - 24, FYF(0.5) + 6, 'salto 2/4', { size: 20, fill: C.A, ta: 'end' })));
        o += on(l4 * c2, pills(344, [{ s: 'P(X = x) = F(x) − F(x−)', op: l4 * c2 }]));
      }

      /* capitolo 3: intervalli */
      const c3 = vis(t, 33, 58.4, 0.6, 0.01);
      if (c3 > 0.004) {
        const fo = 1 - p(t, 43.4, 44), sh = p(t, 33.4, 34.4) * c3 * fo;
        o += on(sh, rect(XP(0) + 6, 84, XP(2) - XP(0) + 20, 72, { fill: C.hi, fo: 0.22 * sh, stroke: C.hi, so: sh, sw: 1.6, da: '5 4' }));
        const g1 = p(t, 35.6, 36.4) * c3 * fo, g2 = p(t, 38.4, 39.2) * c3 * fo, dd = p(t, 41, 41.8) * c3 * fo;
        o += on(g1, g({ op: g1 }, ln(70, FYF(1), XP(2), FYF(1), { stroke: C.hi, sw: 2, da: '6 4' }) + tx(XP(2) + 14, FYF(1) - 10, '*F*(2) = 1', { size: 20, ta: 'start' })));
        o += on(g2, g({ op: g2 }, ln(70, FYF(0.25), XP(0), FYF(0.25), { stroke: C.hi, sw: 2, da: '6 4' }) + tx(XP(0) - 8, FYF(0.25) + 24, '*F*(0) = 1/4', { size: 20, ta: 'end' })));
        o += on(dd, g({ op: dd }, ln(268, FYF(1), 268, FYF(0.25), { stroke: OK, sw: 2.4 }) + path(`M263 ${FYF(1) + 8}L268 ${FYF(1)}L273 ${FYF(1) + 8}`, { stroke: OK, sw: 2.4 }) + tx(280, FYF(0.6) + 8, '3/4', { size: 24, fill: OK, ta: 'start' })));
        const f1 = p(t, 36.4, 37.2) * c3 * fo, f1b = p(t, 39.6, 40.4) * c3 * fo, f2 = p(t, 42.4, 43.2) * c3 * fo;
        o += on(f1, tx(84, 232, '*P*(0 < *X* ≤ 2)', { size: 22, ta: 'start', op: f1 }));
        o += on(f1b, tx(84, 260, '= *F*(2) − *F*(0)', { size: 22, ta: 'start', op: f1b }));
        o += on(f2, tx(84, 290, '= 1 − 1/4 = 3/4', { size: 24, fill: OK, ta: 'start', op: f2 }));
        const k1 = p(t, 44.6, 45.4) * c3, k2 = p(t, 49, 49.8) * c3;
        o += on(k1, tx(84, 240, '*P*(*X* < 2) = *F*(1) = 3/4', { size: 22, ta: 'start', op: k1 }));
        o += on(k2, tx(84, 276, '*P*(*X* ≤ 2) = *F*(2) = 1', { size: 22, ta: 'start', op: k2 }));
      }
      return o;
    },
  });

  /* ======================================================================
     2.3 · Densità congiunta e marginali (due monete, X₁ e X₂)
     ====================================================================== */
  const TX0 = 190, TY0 = 140, CW = 84, CH = 56; // tavola 2×2: angolo in alto a sinistra e lato delle caselle
  const cellC = (r, c) => [TX0 + c * CW + CW / 2, TY0 + r * CH + CH / 2];
  const TOK = [['CC', 0, 0], ['CT', 0, 1], ['TC', 1, 0], ['TT', 1, 1]]; // esito, X1, X2

  PV.add('congiunta', {
    sec: '2.3',
    short: 'Densità congiunta e marginali',
    title: 'Densità congiunta, marginali e somma: due monete, X₁ e X₂',
    alt: 'Animazione: i quattro esiti di due monete riempiono una tabella 2×2 con probabilità 1/4; i totali di riga e di colonna sono le marginali; sommando le caselle sulle diagonali si ritrova la densità di X = X1 + X2.',
    dur: 58,
    poster: 40,
    chap: [[0, 'La tabella congiunta'], [14, 'Le marginali'], [24.5, 'Somma sulle diagonali']],
    caps: [
      [0, 'Spesso sullo stesso esperimento osservi due numeri. La loro densità congiunta è la probabilità che assumano insieme due valori dati: *p*(*x*, *y*) = *P*(*X* = *x*, *Y* = *y*).'],
      [7.5, 'Due monete: *X*₁ vale 1 se la prima dà testa, *X*₂ se la seconda. I quattro esiti riempiono le quattro caselle, ciascuna con probabilità 1/4.'],
      [14, 'Le densità delle singole variabili, dette marginali, si ottengono sommando sull’altra variabile: sono i totali di riga e di colonna, scritti nei margini.'],
      [24.5, 'Con la congiunta calcoli la legge di qualunque quantità *h*(*X*, *Y*). Per la somma *X* = *X*₁ + *X*₂ si sommano le caselle di una diagonale.'],
      [32, '*X* = 0 solo nella casella (0, 0): 1/4. *X* = 1 nelle caselle (0, 1) e (1, 0): 1/4 + 1/4 = 1/2. *X* = 2 solo in (1, 1): 1/4.'],
      [44, 'Ritroviamo la densità di 2.1: 1/4, 1/2, 1/4. Dalla congiunta si recupera tutto: le marginali e la legge di ogni funzione della coppia.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 13.6, 'La densità congiunta', '*p*(*x*, *y*) = P(*X* = *x*, *Y* = *y*)') + heading(t, 14.2, 24, 'Le marginali', 'totali di riga e di colonna') + heading(t, 24.6, 58.4, 'La somma sulle diagonali', '*X* = *X*₁ + *X*₂ : si sommano le caselle con *x*₁ + *x*₂ = *s*');
      const ox = lerp(0, -110, p(t, 24.6, 26.4, E.io)); // la tabella si sposta a sinistra per far posto alla densità di X
      /* intestazioni e griglia */
      const gu = p(t, 0.6, 1.6);
      o += g({ op: gu, tf: T(ox, 0) }, rect(TX0, TY0, 2 * CW, 2 * CH, { rx: 8, stroke: C.soft, sw: 2 }) + ln(TX0 + CW, TY0, TX0 + CW, TY0 + 2 * CH, { stroke: C.soft, sw: 1.4 }) + ln(TX0, TY0 + CH, TX0 + 2 * CW, TY0 + CH, { stroke: C.soft, sw: 1.4 }));
      o += g({ op: gu, tf: T(ox, 0) }, [0, 1].map((c) => tx(TX0 + c * CW + CW / 2, TY0 - 12, '*X*₂ = ' + c, { ff: SANS, size: 17, fill: C.soft })).join('') + [0, 1].map((r) => tx(TX0 - 10, TY0 + r * CH + CH / 2 + 6, '*X*₁ = ' + r, { ff: SANS, size: 17, fill: C.soft, ta: 'end' })).join(''));
      /* gli esiti entrano nelle caselle */
      TOK.forEach(([lab, r, c], i) => {
        const f = p(t, 2.4 + i * 0.9, 3.8 + i * 0.9, E.io), [cx, cy] = cellC(r, c), [sx, sy] = [90, 110 + i * 54];
        const [x, y] = arc(sx, sy, cx, cy, f, 30);
        const diag = t > 28 ? (r + c === 1 ? 1 : 0) : 0, col = r + c === 0 ? C.A : r + c === 1 ? C.B : C.C;
        const hl = p(t, 28, 28.8);
        if (f < 1) o += g({ tf: T(x + ox * f, y, 1) }, rect(-22, -18, 44, 36, { rx: 7, fill: C.paper, stroke: C.soft, sw: 1.6 }) + tx(0, 7, lab, { size: 18 }));
        else o += rect(cx - CW / 2 + 4 + ox, cy - CH / 2 + 4, CW - 8, CH - 8, { rx: 6, fill: col, fo: 0.22 * hl, stroke: col, so: hl, sw: 2 });
        o += on(p(t, 3.4 + i * 0.9, 4 + i * 0.9) * (f >= 1 ? 1 : 0), tx(cx + ox, cy + 8, '1/4', { size: 24, op: 1 }));
      });
      /* marginali: i totali scivolano ai margini */
      const m1 = p(t, 14.6, 15.4), m2 = p(t, 18.4, 19.2), m3 = p(t, 21.4, 22.2);
      o += on(m1, g({ op: m1, tf: T(ox, 0) }, [0, 1].map((r) => tx(TX0 + 2 * CW + 36, TY0 + r * CH + CH / 2 + 8, '1/2', { size: 24, fill: C.A })).join('') + tx(TX0 + 2 * CW + 36, TY0 - 12, '*p*_{X₁}', { size: 18, fill: C.A }) + brace(TX0 + 2 * CW + 12, TX0 + 2 * CW + 12, TY0, C.A, 0)));
      o += on(m2, g({ op: m2, tf: T(ox, 0) }, [0, 1].map((c) => tx(TX0 + c * CW + CW / 2, TY0 + 2 * CH + 30, '1/2', { size: 24, fill: C.B })).join('') + tx(TX0 - 30, TY0 + 2 * CH + 30, '*p*_{X₂}', { size: 18, fill: C.B, ta: 'end' })));
      o += on(m3, tx(TX0 + 2 * CW + 36, TY0 + 2 * CH + 30, '1', { size: 24, fill: OK, op: m3, tf: T(ox, 0) }));
      const mt = p(t, 16, 16.8) * (1 - p(t, 23.4, 24));
      o += on(mt, pills(334, [{ s: 'marginale = somma sull’altra variabile', op: mt }]));
      /* densità di X = X1 + X2, a destra */
      const dv = p(t, 29.6, 30.4);
      if (dv > 0.004) {
        const bx = (v) => 400 + v * 80, base = 262;
        o += g({ op: dv }, ln(360, base, 610, base, { stroke: C.soft, sw: 1.6 }) + [0, 1, 2].map((v) => tx(bx(v), base + 24, '*X* = ' + v, { ff: SANS, size: 17, fill: C.soft })).join(''));
        [[0, 1, C.A, 32.4, '1/4'], [1, 2, C.B, 35.6, '1/2'], [2, 1, C.C, 40, '1/4']].forEach(([v, n, col, t0, s2]) => {
          const u = p(t, t0, t0 + 0.9, E.out);
          o += bar(bx(v), base, n * 56 * u, 50, col, dv) + on(u > 0.9, tx(bx(v), base - n * 56 - 10, s2, { size: 24, fill: OK, op: dv * p(u, 0.9, 1) }));
        });
        const sm = p(t, 36.4, 37.2);
        o += on(sm * (1 - p(t, 41, 41.8)), tx(490, 100, '1/4 + 1/4 = 1/2', { size: 22, fill: C.B, op: sm * (1 - p(t, 41, 41.8)) }));
      }
      return o;
    },
  });

  /* ======================================================================
     2.3 · Indipendenza fra variabili: ogni casella è un prodotto (monete, poi un'urna)
     ====================================================================== */
  const IX = 84, IY = 128, MX = IX + 2 * CW + 34, MY = IY + 2 * CH + 32; // tavola 2×2 a sinistra; colonna e riga dei totali
  const CELLS = [[0, 0], [0, 1], [1, 0], [1, 1]];
  const icell = (r, c) => [IX + c * CW + CW / 2, IY + r * CH + CH / 2];
  /* tavola 2×2 con le intestazioni; rn, cn = nomi delle due variabili */
  const tab2 = (op, rn, cn) => g({ op }, rect(IX, IY, 2 * CW, 2 * CH, { rx: 8, stroke: C.soft, sw: 2 }) + ln(IX + CW, IY, IX + CW, IY + 2 * CH, { stroke: C.soft, sw: 1.4 }) + ln(IX, IY + CH, IX + 2 * CW, IY + CH, { stroke: C.soft, sw: 1.4 })
    + [0, 1].map((c) => tx(IX + c * CW + CW / 2, IY - 12, cn + ' = ' + c, { ff: SANS, size: 17, fill: C.soft })).join('')
    + [0, 1].map((r) => tx(IX - 10, IY + r * CH + CH / 2 + 6, rn + ' = ' + r, { ff: SANS, size: 17, fill: C.soft, ta: 'end' })).join(''));
  const ctext = (r, c, s, a = {}) => tx(icell(r, c)[0], icell(r, c)[1] + 8, s, { size: 24, ...a });
  const ring = (r, c, col, op) => rect(icell(r, c)[0] - CW / 2 + 4, icell(r, c)[1] - CH / 2 + 4, CW - 8, CH - 8, { rx: 6, stroke: col, sw: 3.2, so: op });
  /* pallina di un'urna: rossa (R) o blu (B) */
  const ball = (x, y, red, op = 1, sc = 1) => g({ op, tf: T(x, y, sc) }, circ(0, 0, 15, { fill: red ? NO : C.A, fo: 0.9, stroke: red ? NO : C.A, sw: 2 }) + tx(0, 6, red ? 'R' : 'B', { ff: SANS, size: 17, fill: C.paper }));
  const URN = [[['3/10', 25.6], ['3/10', 27.4]], [['3/10', 29.2], ['1/10', 24.2]]]; // [X][Y] = [probabilità, comparsa]
  const PAIR = [[1, 1, '2/5', '1/4', '1/10', '2 rosse su 5', '1 rossa su 4'], [0, 0, '3/5', '2/4', '3/10', '3 blu su 5', '2 blu su 4'], [0, 1, '3/5', '2/4', '3/10', '3 blu su 5', '2 rosse su 4'], [1, 0, '2/5', '3/4', '3/10', '2 rosse su 5', '3 blu su 4']]; // [X, Y, 1ª, 2ª, p, perché 1ª, perché 2ª]
  const PT = [20, 25.6, 27.4, 29.2, 31]; // quando comincia ciascuna coppia di estrazioni

  PV.add('indipv', {
    sec: '2.3',
    short: 'Indipendenza fra variabili',
    title: 'Indipendenza fra variabili: la casella che non torna',
    alt: 'Animazione: con due monete ogni casella della tabella congiunta è il prodotto dei totali di riga e di colonna, quindi le variabili sono indipendenti; con un’urna senza reimmissione la casella (1, 1) vale 10/100 invece di 4/10 per 4/10 = 16/100, quindi le variabili sono dipendenti.',
    dur: 54.5,
    poster: 41,
    chap: [[0, 'Due monete: ogni casella è un prodotto'], [17.6, 'Un’urna: la casella che non torna']],
    caps: [
      [0, 'Due variabili sono indipendenti se ogni casella della tabella è il prodotto del suo totale di riga per il suo totale di colonna.'],
      [7.6, 'Due monete: ogni casella vale 1/4 e 1/2 · 1/2 = 1/4. Tutte le verifiche tornano, quindi *X*₁ e *X*₂ sono indipendenti.'],
      [17.6, 'Un’urna con 2 palline rosse e 3 blu, due estrazioni senza reimmissione: *X* = 1 se la prima è rossa, *Y* = 1 se la seconda lo è.'],
      [24.9, 'Le caselle si riempiono con la regola del prodotto: *p*(1, 1) = 2/5 · 1/4 = 1/10, *p*(0, 0) = 3/5 · 2/4 = 3/10, e così via.'],
      [32.2, 'Le marginali dicono che la seconda pallina è rossa con probabilità 4/10, come la prima.'],
      [37, 'Ma nella casella (1, 1) il prodotto 4/10 · 4/10 = 16/100 non torna: la casella vale 10/100. Basta una casella: *X* e *Y* sono dipendenti.'],
      [45.6, 'Con la reimmissione la casella varrebbe 16/100, con le stesse marginali: le marginali non bastano, la congiunta sì.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 17.2, 'Indipendenza fra variabili', '*p*(*x*, *y*) = *p*_X(*x*) · *p*_Y(*y*) per ogni casella') + heading(t, 17.8, 54.9, 'Urna: 2 rosse e 3 blu, senza reimmissione', '*X* = 1 se la prima è rossa, *Y* = 1 se la seconda è rossa');

      /* capitolo 1: due monete, ogni casella è un prodotto */
      const c1 = 1 - p(t, 16.8, 17.6);
      if (c1 > 0.004) {
        const gu = p(t, 0.6, 1.6) * c1, m = p(t, 2, 3) * c1;
        o += tab2(gu, '*X*₁', '*X*₂');
        for (const [r, c] of CELLS) o += ctext(r, c, '1/4', { op: gu });
        o += on(m, [0, 1].map((r) => tx(MX, IY + r * CH + CH / 2 + 8, '1/2', { size: 24, fill: C.A, op: m })).join('') + [0, 1].map((c) => tx(IX + c * CW + CW / 2, MY, '1/2', { size: 24, fill: C.B, op: m })).join('')
          + tx(MX, MY, '1', { size: 24, fill: OK, op: m }) + tx(MX, IY - 12, '*p*_{X₁}', { size: 18, fill: C.A, op: m }) + tx(IX - 30, MY, '*p*_{X₂}', { size: 18, fill: C.B, ta: 'end', op: m }));
        CELLS.forEach(([r, c], k) => {
          const t0 = 4.2 + 2.6 * k, win = p(t, t0, t0 + 0.5) * (1 - p(t, t0 + 2.1, t0 + 2.6)) * c1;
          if (win > 0.004) {
            o += ring(r, c, C.hi, win);
            o += rect(MX - 28, IY + r * CH + CH / 2 - 18, 56, 34, { rx: 9, fill: C.A, fo: 0.16 * win, stroke: C.A, so: win, sw: 2 });
            o += rect(IX + c * CW + CW / 2 - 28, MY - 20, 56, 34, { rx: 9, fill: C.B, fo: 0.16 * win, stroke: C.B, so: win, sw: 2 });
            const q1 = p(t, t0 + 0.3, t0 + 0.9) * win, q2 = p(t, t0 + 0.9, t0 + 1.5) * win;
            o += tx(480, 172, '*p*(' + r + ', ' + c + ') = 1/4', { size: 26, op: q1 });
            o += on(q2, txc(480, 222, [['1/2', C.A], [' · ', C.ink], ['1/2', C.B], [' = 1/4', C.ink]], { size: 26, op: q2 }) + check(604, 214, 22, p(t, t0 + 1.2, t0 + 1.8, E.lin), { op: win }));
          }
          const ck = p(t, t0 + 1.4, t0 + 2, E.lin) * c1;
          if (ck > 0.004) o += check(icell(r, c)[0] + CW / 2 - 14, icell(r, c)[1] - CH / 2 + 15, 12, ck, { op: c1 });
        });
        const pl = p(t, 14.8, 15.6) * c1;
        o += on(pl, pills(334, [{ s: 'tutte e quattro tornano: *X*₁ e *X*₂ sono indipendenti', icon: 'ok', col: OK, op: pl, u: p(t, 15.1, 15.8, E.lin) }]));
      }

      /* capitolo 2: l'urna */
      const tb = p(t, 18, 18.8);
      if (tb > 0.004) {
        o += tab2(tb, '*X*', '*Y*');
        for (const [r, c] of CELLS) {
          const [s0, ta] = URN[r][c], u = p(t, ta, ta + 0.7);
          if (u <= 0.004) continue;
          o += ctext(r, c, s0, { op: u });
          const rg = p(t, ta, ta + 0.4) * (1 - p(t, ta + 1.3, ta + 1.8));
          if (rg > 0.004) o += ring(r, c, C.hi, rg);
        }
        /* l'urna e le due estrazioni */
        const uo = p(t, 18.4, 19.2) * (1 - p(t, 31, 31.8)), back = p(t, PT[1], PT[1] + 0.35);
        if (uo > 0.004) {
          o += rect(376, 92, 228, 44, { rx: 12, stroke: C.soft, sw: 2, op: uo });
          for (let i = 0; i < 5; i++) {
            const gone = (i === 1 && t >= 20) || (i === 3 && t >= 22.2);
            o += ball(406 + 42 * i, 114, i === 1 || i === 3, uo * (gone ? back : 1));
          }
          const fl = uo * (1 - back);
          if (fl > 0.004) {
            if (t >= 20) o += ball(...arc(448, 114, 430, 200, p(t, 20, 21.2, E.io), 26), true, fl);
            if (t >= 22.2) o += ball(...arc(532, 114, 550, 200, p(t, 22.2, 23.4, E.io), 26), true, fl);
            const n1 = fl * p(t, 21.2, 21.8), n2 = fl * p(t, 23.4, 24);
            o += tx(430, 244, '2/5', { size: 24, op: n1 }) + lb(430, 267, '2 rosse su 5', { op: n1 }) + tx(550, 244, '1/4', { size: 24, op: n2 }) + lb(550, 267, '1 rossa su 4', { op: n2 });
          }
          const so = p(t, 19.6, 20.2) * uo;
          for (const sx of [430, 550]) o += circ(sx, 200, 17, { stroke: C.soft, sw: 1.8, da: '4 4', op: so });
          o += lb(398, 206, '1ª', { ta: 'end', op: so }) + lb(518, 206, '2ª', { ta: 'end', op: so });
          for (let k = 1; k < 4; k++) {
            const a = p(t, PT[k], PT[k] + 0.35) * (k < 3 ? 1 - p(t, PT[k + 1], PT[k + 1] + 0.35) : 1) * uo;
            if (a <= 0.004) continue;
            const [pr, pc, pa, pb, , w1, w2] = PAIR[k], sc = 0.55 + 0.45 * p(t, PT[k], PT[k] + 0.6, E.back);
            o += ball(430, 200, pr === 1, a, sc) + ball(550, 200, pc === 1, a, sc) + tx(430, 244, pa, { size: 24, op: a }) + lb(430, 267, w1, { op: a }) + tx(550, 244, pb, { size: 24, op: a }) + lb(550, 267, w2, { op: a });
          }
          PAIR.forEach(([r, c, pa, pb, pv], k) => {
            const q = vis(t, k ? PT[k] + 0.2 : 24.2, k < 3 ? PT[k + 1] + 0.2 : 31.2, 0.4, 0.3) * uo;
            o += on(q, tx(480, 300, '*p*(' + r + ', ' + c + ') = ' + pa + ' · ' + pb + ' = ' + pv, { size: 24, op: q }));
          });
        }
        /* le marginali */
        const mg = p(t, 31.6, 32.6);
        o += on(mg, [0, 1].map((r) => tx(MX, IY + r * CH + CH / 2 + 8, r ? '4/10' : '6/10', { size: 24, fill: C.A, op: mg })).join('') + [0, 1].map((c) => tx(IX + c * CW + CW / 2, MY, c ? '4/10' : '6/10', { size: 24, fill: C.B, op: mg })).join('')
          + tx(MX, MY, '1', { size: 24, fill: OK, op: mg }) + tx(MX, IY - 12, '*p*_X', { size: 18, fill: C.A, op: mg }) + tx(IX - 30, MY, '*p*_Y', { size: 18, fill: C.B, ta: 'end', op: mg }));
        /* prima e seconda rossa hanno la stessa probabilità */
        const ml = vis(t, 32.8, 36.9, 0.4, 0.4) * tb;
        if (ml > 0.004) {
          o += rect(MX - 32, IY + CH + CH / 2 - 20, 64, 36, { rx: 9, stroke: C.hi, sw: 3, so: ml }) + rect(IX + CW + CW / 2 - 32, MY - 22, 64, 36, { rx: 9, stroke: C.hi, sw: 3, so: ml });
          o += txc(480, 176, [['prima rossa: ', C.ink], ['4/10', C.A]], { size: 26, op: ml }) + txc(480, 222, [['seconda rossa: ', C.ink], ['4/10', C.B]], { size: 26, op: ml });
          o += pills(334, [{ s: 'stessa probabilità per la prima e per la seconda', op: ml }]);
        }
        /* la casella (1, 1) non torna */
        const ck = vis(t, 36.8, 45.8, 0.5, 0.5) * tb;
        if (ck > 0.004) {
          o += on(p(t, 36.9, 37.6), txc(480, 168, [['4/10', C.A], [' · ', C.ink], ['4/10', C.B], [' = 16/100', C.ink]], { size: 26, op: ck * p(t, 36.9, 37.6) }));
          o += tx(480, 248, '*p*(1, 1) = 10/100', { size: 26, op: ck * p(t, 37.6, 38.3) }) + tx(480, 207, '≠', { size: 36, fill: NO, op: ck * p(t, 38.2, 38.9) });
        }
        const xr = p(t, 38.6, 39.4) * tb;
        if (xr > 0.004) o += ring(1, 1, NO, xr) + cross(icell(1, 1)[0] + CW / 2 - 10, icell(1, 1)[1] - CH / 2 + 12, 12, p(t, 38.8, 39.4, E.lin), { op: xr });
        const pd = vis(t, 39.4, 45.8, 0.4, 0.4) * tb;
        o += on(pd, pills(334, [{ s: 'basta una casella che non torna: sono dipendenti', icon: 'no', col: NO, op: pd, u: p(t, 39.7, 40.4, E.lin) }]));
        /* con la reimmissione */
        const cl = p(t, 45.8, 46.6) * tb;
        if (cl > 0.004) {
          o += lb(480, 156, 'senza reimmissione', { op: cl }) + tx(480, 186, '*p*(1, 1) = 10/100', { size: 26, op: cl, fill: NO });
          const c2 = p(t, 47.4, 48.2) * tb;
          o += on(c2, lb(480, 224, 'con reimmissione', { op: c2 }) + tx(480, 254, '*p*(1, 1) = 16/100', { size: 26, op: c2, fill: OK }));
          const pe = p(t, 49.6, 50.4) * tb;
          o += on(pe, pills(334, [{ s: 'stesse marginali, congiunta diversa', op: pe }]));
        }
      }
      return o;
    },
  });

  /* ======================================================================
     2.4 · Il valore atteso come media pesata: due monete e un dado
     ====================================================================== */
  const fulcrum = (x, y, op = 1) => path(`M${x} ${y}l-13 24h26z`, { fill: C.hi, fo: 0.95, stroke: C.ink, sw: 1.6, op });

  PV.add('media', {
    sec: '2.4',
    short: 'Il valore atteso',
    title: 'Il valore atteso: la media dei valori, pesata con le probabilità',
    alt: 'Animazione: per le due monete (X = numero di teste) ogni valore si moltiplica per la sua probabilità e si sommano i prodotti, 0·1/4 + 1·1/2 + 2·1/4 = 1; poi lo stesso conto per un dado equo, con pesi tutti uguali a 1/6, dà 21/6 = 3,5.',
    dur: 42,
    poster: 14.5,
    chap: [[0, 'Due monete: valore × probabilità'], [17.6, 'Un dado equo']],
    caps: [
      [0, 'Il valore atteso è la media dei valori che *X* può assumere, pesata con le loro probabilità: i valori più probabili contano di più.'],
      [4.2, 'Per ogni valore moltiplico il valore per la sua probabilità, poi sommo. Due monete, *X* = teste: 0 · 1/4 + 1 · 1/2 + 2 · 1/4 = 0 + 1/2 + 1/2 = 1.'],
      [13.4, 'In media, su due lanci, una testa. Ragionevole.'],
      [17.6, 'Su un dado equo ogni valore pesa 1/6.'],
      [21.4, '*E*[*X*] = 1 · 1/6 + 2 · 1/6 + … + 6 · 1/6 = (1 + 2 + 3 + 4 + 5 + 6)/6 = 21/6 = 3,5.'],
      [31, 'Quando i pesi sono tutti uguali il valore atteso è la media aritmetica; con pesi diversi, come nelle monete, contano di più i valori più probabili.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 17.2, 'Il valore atteso', '*E*[*X*] = Σ_x *x* · *p*(*x*)') + heading(t, 17.8, 42.4, 'Un dado equo', 'ogni valore pesa 1/6');

      /* capitolo 1: due monete */
      const c1 = 1 - p(t, 16.8, 17.6);
      if (c1 > 0.004) {
        const x1 = (v) => 120 + 90 * v, base = 250, P1 = ['1/4', '1/2', '1/4'], N1 = [1, 2, 1];
        const ax = p(t, 0.6, 1.4) * c1;
        o += on(ax, ln(70, base, 350, base, { stroke: C.soft, sw: 1.8, op: ax }) + [0, 1, 2].map((v) => tx(x1(v), base + 26, v, { ff: SANS, size: 20, fill: C.soft, op: ax })).join(''));
        for (let v = 0; v < 3; v++) {
          const u = p(t, 1.2 + 0.4 * v, 2.2 + 0.4 * v), hl = vis(t, 4.4 + 2.4 * v, 7 + 2.4 * v, 0.3, 0.3) * c1, h = N1[v] * 56;
          o += bar(x1(v), base, h * u, 48, C.A, c1);
          o += on(u > 0.9, tx(x1(v), base - h - 10, P1[v], { size: 22, fill: C.A, op: c1 * p(u, 0.9, 1) }));
          if (hl > 0.004) o += rect(x1(v) - 32, base - h - 38, 64, h + 44, { rx: 8, stroke: C.hi, sw: 3, so: hl });
        }
        [['0', '1/4', '0'], ['1', '1/2', '1/2'], ['2', '1/4', '1/2']].forEach(([a, b, r], k) => {
          const q = p(t, 4.6 + 2.4 * k, 5.3 + 2.4 * k) * c1;
          o += on(q, txc(358, 132 + 44 * k, [[a, C.ink], [' × ', C.ink], [b, C.A], [' = ' + r, C.ink]], { size: 26, ta: 'start', op: q }));
        });
        const sl = p(t, 11.8, 12.4) * c1, sm = p(t, 12.6, 13.4) * c1;
        o += on(sl, ln(358, 238, 600, 238, { stroke: C.soft, sw: 1.6, op: sl }));
        o += on(sm, txc(358, 270, [['0 + 1/2 + 1/2 = ', C.ink], ['1', C.B]], { size: 26, ta: 'start', op: sm }));
        const tm = p(t, 14.2, 15.2) * c1;
        o += on(tm, fulcrum(x1(1), base + 36, tm) + tx(x1(1) + 24, base + 56, '*E*[*X*] = 1', { size: 22, fill: C.B, ta: 'start', op: tm }));
      }

      /* capitolo 2: un dado equo */
      const c2 = p(t, 18, 18.8);
      if (c2 > 0.004) {
        const x2 = (v) => 120 + 80 * (v - 1), base = 170, h6 = 66;
        o += ln(70, base, 570, base, { stroke: C.soft, sw: 1.8, op: c2 }) + [1, 2, 3, 4, 5, 6].map((v) => tx(x2(v), base + 26, v, { ff: SANS, size: 20, fill: C.soft, op: c2 })).join('');
        for (let v = 1; v <= 6; v++) {
          const u = p(t, 18.4 + 0.25 * v, 19.2 + 0.25 * v), hl = vis(t, 21.6 + 0.8 * (v - 1), 22.8 + 0.8 * (v - 1), 0.2, 0.3) * c2;
          o += bar(x2(v), base, h6 * u, 44, C.A, c2);
          o += on(u > 0.9, tx(x2(v), base - h6 - 8, '1/6', { size: 20, fill: C.A, op: c2 * p(u, 0.9, 1) }));
          if (hl > 0.004) o += rect(x2(v) - 30, base - h6 - 30, 60, h6 + 36, { rx: 8, stroke: C.hi, sw: 3, so: hl });
        }
        const r1 = p(t, 21.4, 22.2) * c2, r2 = p(t, 27.4, 28.2) * c2;
        o += on(r1, tx(320, 262, '*E*[*X*] = 1·1/6 + 2·1/6 + 3·1/6 + 4·1/6 + 5·1/6 + 6·1/6', { size: 22, op: r1 }));
        o += on(r2, txc(320, 296, [['= (1 + 2 + 3 + 4 + 5 + 6) / 6 = 21/6 = ', C.ink], ['3,5', C.B]], { size: 22, op: r2 }));
        const tm = p(t, 31, 32) * c2;
        o += on(tm, fulcrum(x2(3.5), base + 36, tm) + tx(x2(3.5) + 24, base + 56, '*E*[*X*] = 3,5', { size: 22, fill: C.B, ta: 'start', op: tm }));
        const pl = vis(t, 34, 42.2, 0.5, 0.01) * c2;
        o += on(pl, pills(334, [{ s: 'pesi tutti uguali: è la media aritmetica', op: pl }]));
      }
      return o;
    },
  });

  /* ======================================================================
     2.4 · Tre modi di vederlo: baricentro, media dei lanci, prezzo equo
     ====================================================================== */
  const RL = [], SM = []; // 6 000 lanci simulati di un dado (sempre gli stessi) e le loro somme parziali
  for (let i = 0, s = 0; i < 6000; i++) {
    RL.push(1 + Math.floor(6 * rnd(1030 + i)));
    s += RL[i];
    SM.push(s);
  }
  const FMT = (x, d = 2) => x.toFixed(d).replace('.', ',');
  const SYB = 236; // quota del fulcro della sbarra

  /* sbarra che ruota di th gradi intorno al fulcro (x = pivot); blocks = [[x, n, etichetta]], ticks = [[x, testo]] */
  function sbarra(pivot, th, blocks, ticks, op, bw = 44, bh = 30) {
    let inner = rect(60 - pivot, -12, 520, 12, { rx: 5, fill: C.soft, fo: 0.35, stroke: C.soft, sw: 1.8 });
    for (const [x, n, s] of blocks) for (let j = 0; j < n; j++) inner += rect(x - pivot - bw / 2, -12 - bh * (j + 1), bw, bh - 2, { rx: 5, fill: C.A, fo: 0.2, stroke: C.A, sw: 1.8 }) + tx(x - pivot, -22 - bh * j, s, { ff: SANS, size: 17 });
    for (const [x, s] of ticks) inner += tx(x - pivot, 54, s, { ff: SANS, size: 20, fill: C.soft });
    return g({ op }, g({ tf: T(pivot, SYB, 1, th) }, inner) + fulcrum(pivot, SYB, 1));
  }
  const wob = (tau, a = 5) => (tau > 0 ? a * Math.exp(-2.6 * tau) * Math.sin(9 * tau) : 0); // oscillazione che si smorza

  PV.add('tremodi', {
    sec: '2.4',
    short: 'Tre modi di vederlo',
    title: 'Tre modi di vedere il valore atteso: baricentro, media dei lanci, prezzo equo',
    alt: 'Animazione: il valore atteso come punto di equilibrio di una sbarra con pesi uguali alle probabilità; come numero attorno a cui si stabilizza la media di 6 000 lanci di un dado; come prezzo equo di un’assicurazione che paga 10 000 euro con probabilità 0,01.',
    dur: 56,
    poster: 15.6,
    chap: [[0, 'Fisico: il baricentro'], [17, 'Operativo: la media dei lanci'], [37.4, 'Economico: il prezzo equo']],
    caps: [
      [0, 'Primo modo, fisico: metti dei pesi *p*(*x*) su una sbarra, nei punti *x*. Con due monete i pesi sono 1/4, 1/2, 1/4 su 0, 1, 2: la sbarra sta in equilibrio nel punto 1.'],
      [9.4, 'Un dado equo: sei pesi uguali sui punti 1, …, 6. La sbarra si equilibra solo a metà strada, in 3,5. Il valore atteso è il baricentro.'],
      [17, 'Secondo modo, operativo: il valore atteso è il numero attorno a cui si stabilizza la media dei risultati se ripeti l’esperimento tantissime volte.'],
      [27.4, 'Un dado lanciato 6 000 volte: ogni faccia esce circa 1 000 volte, la somma è circa 21 000 e la media circa 21 000 / 6 000 = 3,5.'],
      [37.4, 'Terzo modo, economico: il prezzo equo. Un’assicurazione paga 10 000 € con probabilità 0,01 e 0 € altrimenti: vale in media 10 000 · 0,01 + 0 · 0,99 = 100 €.'],
      [47, 'Se il premio è 130 €, i 30 € di differenza sono il margine dell’assicurazione. Ogni compagnia assicurativa, casinò e lotteria vive di questa formula.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 16.6, 'Fisico: il baricentro', 'pesi *p*(*x*) su una sbarra, nei punti *x*') + heading(t, 17.2, 37, 'Operativo: la media a lungo andare', 'un dado lanciato 6 000 volte') + heading(t, 37.6, 56.4, 'Economico: il prezzo equo', 'un’assicurazione paga 10 000 € con probabilità 0,01');

      /* capitolo 1: la sbarra in equilibrio */
      const a = vis(t, 0.4, 9.4, 0.5, 0.4);
      if (a > 0.004) {
        const pv = lerp(240, 320, p(t, 2.4, 4.4, E.io));
        o += sbarra(pv, 0.07 * (320 - pv) + wob(t - 4.4), [[220, 1, '1/4'], [320, 2, '1/4'], [420, 1, '1/4']], [[220, '0'], [320, '1'], [420, '2']], a, 44, 30);
        const q = vis(t, 5.4, 9.4, 0.5, 0.4);
        o += on(q, pills(334, [{ s: 'equilibrio nel punto 1: *E*[*X*] = 1', op: q }]));
      }
      const b = vis(t, 9.4, 16.8, 0.5, 0.4);
      if (b > 0.004) {
        const pv = t < 12.2 ? lerp(200, 440, p(t, 10.4, 12, E.io)) : lerp(440, 320, p(t, 12.8, 14.4, E.io));
        o += sbarra(pv, 0.07 * (320 - pv) + wob(t - 14.4), [1, 2, 3, 4, 5, 6].map((v) => [120 + 80 * (v - 1), 1, '1/6']), [1, 2, 3, 4, 5, 6].map((v) => [120 + 80 * (v - 1), String(v)]), b, 44, 30);
        const q = vis(t, 14.8, 16.8, 0.5, 0.3);
        o += on(q, pills(334, [{ s: 'equilibrio in 3,5: *E*[*X*] = 3,5', op: q }]));
      }

      /* capitolo 2: la media dei lanci */
      const c2 = vis(t, 17.2, 37, 0.6, 0.4);
      if (c2 > 0.004) {
        const u = p(t, 18.4, 27.4, E.lin), n = Math.max(1, Math.round(Math.pow(6000, u)));
        const cnt = [0, 0, 0, 0, 0, 0];
        for (let i = 0; i < n; i++) cnt[RL[i] - 1]++;
        const yb = 260;
        /* istogramma delle frequenze */
        o += ln(40, yb, 296, yb, { stroke: C.soft, sw: 1.8, op: c2 }) + ln(40, yb - 55, 296, yb - 55, { stroke: C.soft, sw: 1.2, da: '4 4', op: c2 });
        cnt.forEach((c, i) => {
          const x = 66 + 40 * i, h = Math.min(120, (c / n) * 330);
          o += bar(x, yb, h, 28, C.A, c2) + tx(x, yb + 24, i + 1, { ff: SANS, size: 18, fill: C.soft, op: c2 });
        });
        o += lb(168, 104, 'frequenza di ogni faccia', { op: c2 });
        /* media dei lanci fatti finora */
        const X = (uu) => 340 + 270 * uu, Y = (m) => 260 - ((m - 1) / 5) * 140;
        o += ln(340, yb, 610, yb, { stroke: C.soft, sw: 1.8, op: c2 }) + ln(340, Y(3.5), 610, Y(3.5), { stroke: C.B, sw: 1.8, da: '6 5', op: c2 }) + tx(334, Y(3.5) + 6, '3,5', { size: 20, fill: C.B, ta: 'end', op: c2 });
        [[1, '1'], [10, '10'], [100, '100'], [1000, '1 000'], [6000, '6 000']].forEach(([k, s]) => (o += tx(X(Math.log(k) / Math.log(6000)), yb + 24, s, { ff: SANS, size: 17, fill: C.soft, op: c2 })));
        let d = '';
        const K = 90;
        for (let k = 0; k <= K; k++) {
          const uu = (k / K) * u, nn = Math.max(1, Math.round(Math.pow(6000, uu)));
          d += (k ? 'L' : 'M') + X(uu).toFixed(1) + ' ' + Y(SM[nn - 1] / nn).toFixed(1);
        }
        o += path(d, { stroke: C.B, sw: 2.4, lj: 'round', op: c2 }) + circ(X(u), Y(SM[n - 1] / n), 5, { fill: C.B, op: c2 });
        o += lb(475, 104, 'dopo ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (n === 1 ? ' lancio' : ' lanci') + ': media ' + FMT(SM[n - 1] / n), { op: c2 });
        const s1 = vis(t, 28.2, 32.2, 0.5, 0.4) * c2, s2 = vis(t, 32.4, 37.2, 0.5, 0.01) * c2;
        o += on(s1, pills(334, [{ s: 'somma ≈ 1 000 · (1 + 2 + 3 + 4 + 5 + 6) = 21 000', op: s1 }]));
        o += on(s2, pills(334, [{ s: 'media ≈ 21 000 / 6 000 = 3,5', col: C.B, op: s2 }]));
      }

      /* capitolo 3: il prezzo equo */
      const c3 = p(t, 37.8, 38.6);
      if (c3 > 0.004) {
        const pb = p(t, 38.4, 39.4), bx0 = 70, bw = 500, sl = 8;
        o += rect(bx0, 150, sl, 34, { fill: C.B, fo: 0.85, op: c3 * pb }) + rect(bx0 + sl, 150, bw - sl, 34, { fill: C.A, fo: 0.18, stroke: C.A, sw: 1.6, op: c3 * pb });
        o += tx(bx0 + sl, 138, '10 000 €  con prob. 0,01', { size: 20, fill: C.B, ta: 'start', op: c3 * p(t, 39, 39.8) });
        o += tx(bx0 + sl + (bw - sl) / 2, 174, '0 €  con prob. 0,99', { size: 22, op: c3 * p(t, 39.4, 40.2) });
        const f1 = p(t, 41, 42) * c3;
        o += on(f1, txc(320, 226, [['*E*[*X*] = 10 000 × 0,01 + 0 × 0,99 = ', C.ink], ['100 €', C.B]], { size: 24, op: f1 }));
        const s1 = p(t, 43.6, 44.8), s2 = p(t, 46, 47) * c3;
        const sx = 190, sy = 258, sh = 32;
        o += on(s1, rect(sx, sy, 200 * s1, sh, { fill: C.B, fo: 0.2, stroke: C.B, sw: 1.8, op: c3 }) + tx(sx + 100, sy + 24, '100 €', { size: 22, op: c3 * s1 }));
        o += on(s2, rect(sx + 200, sy, 60 * s2, sh, { fill: C.C, fo: 0.25, stroke: C.C, sw: 1.8, op: c3 }) + tx(sx + 230, sy + 24, '30 €', { size: 22, op: s2 }));
        o += on(p(t, 44, 44.8) * c3, tx(sx - 12, sy + 24, 'premio 130 €:', { size: 22, ta: 'end', op: p(t, 44, 44.8) * c3 }));
        o += on(s1, lb(sx + 100, sy + 58, 'pagamenti attesi', { op: c3 * s1 })) + on(s2, lb(sx + 230, sy + 58, 'margine', { op: s2 }));
        const pe = vis(t, 49, 56.4, 0.5, 0.01) * c3;
        o += on(pe, pills(334, [{ s: 'il prezzo equo è il valore atteso: 100 €', op: pe }]));
      }
      return o;
    },
  });

  /* ======================================================================
     2.4 · Attenzione: la media non è il valore che vedrai (dado, Bernoulli)
     ====================================================================== */
  const RLS = [4, 6, 2, 3, 5, 1, 4, 2, 6, 2]; // dieci lanci a mano: la media corrente balla e si avvicina a 3,5

  PV.add('attenzione', {
    sec: '2.4',
    short: 'La media non è il valore che vedrai',
    title: 'La media non è il valore che vedrai al prossimo lancio',
    alt: 'Animazione: la media di un dado, 3,5, non è una faccia, ma la media dei lanci si avvicina a 3,5; la media di una variabile che vale 1 con probabilità 0,1 e 0 altrimenti è 0,1, mentre il valore più probabile è 0.',
    dur: 36,
    poster: 15,
    chap: [[0, 'Il dado: 3,5 non esce'], [17, 'Media e valore più probabile']],
    caps: [
      [0, 'Una conseguenza che confonde: 3,5 non è un valore che il dado può dare. Il valore atteso non è «il valore che ti aspetti di vedere al prossimo lancio».'],
      [9.2, 'È la media a lungo andare: ogni lancio dà una faccia intera, ma la media dei risultati si avvicina a 3,5.'],
      [17, 'E non è nemmeno, in generale, il valore più probabile: una variabile con *p* = 0,1 vale 1 con probabilità 0,1 e 0 con probabilità 0,9.'],
      [26.5, 'La sua media è 0,1, ma il valore più probabile è 0.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 16.6, 'Il valore atteso non è un valore del dado', 'il prossimo lancio sarà una di queste facce') + heading(t, 17.2, 36.4, 'E non è il valore più probabile', 'Bernoulli con *p* = 0,1');

      /* capitolo 1: le facce e il 3,5 */
      const c1 = 1 - p(t, 16.2, 17);
      if (c1 > 0.004) {
        const xf = (v) => 120 + 80 * (v - 1);
        for (let v = 1; v <= 6; v++) o += tile(xf(v), 128, 48, v, { size: 26, op: p(t, 0.6 + 0.2 * v, 1.2 + 0.2 * v) * c1 });
        const gm = p(t, 3, 4) * c1;
        o += on(gm, rect(305, 113, 30, 30, { rx: 6, stroke: C.soft, sw: 1.6, da: '4 4', op: gm }) + tx(320, 134, '3,5', { ff: SANS, size: 16, fill: C.soft, op: gm }));
        o += on(gm, fulcrum(320, 168, gm) + tx(320, 214, '*E*[*X*] = 3,5', { size: 24, fill: C.B, op: gm }));
        const cr = p(t, 5, 5.8, E.lin) * c1;
        o += on(cr, cross(320, 128, 26, cr, { op: c1 }));
        const pl = vis(t, 5.6, 9, 0.5, 0.4) * c1;
        o += on(pl, pills(244, [{ s: 'nessuna faccia vale 3,5', icon: 'no', col: NO, op: pl, u: p(t, 5.8, 6.4, E.lin) }]));
        /* lanci a mano e media corrente */
        const k = Math.min(RLS.length, Math.floor((t - 9.4) / 0.55) + 1);
        let sum = 0;
        for (let i = 0; i < RLS.length; i++) {
          sum += RLS[i];
          const u = p(t, 9.4 + 0.55 * i, 9.9 + 0.55 * i) * c1;
          if (u <= 0.004) continue;
          const x = 94 + 50 * i;
          o += tile(x, 276, 34, RLS[i], { size: 20, op: u });
          o += tx(x, 322, FMT(sum / (i + 1), 2), { ff: SANS, size: 17, fill: C.B, op: u });
        }
        const lt = p(t, 9.6, 10.4) * c1;
        o += on(lt, lb(320, 250, 'risultati dei lanci', { op: lt * (1 - p(t, 5.6, 5.9) * (t < 9 ? 1 : 0)) }));
        o += on(p(t, 9.9, 10.6) * c1, lb(66, 322, 'media', { ta: 'end', fill: C.B, op: p(t, 9.9, 10.6) * c1 }));
      }

      /* capitolo 2: Bernoulli con p = 0,1 */
      const c2 = p(t, 17.6, 18.4);
      if (c2 > 0.004) {
        const xb = (v) => 190 + 130 * v, base = 240;
        o += ln(120, base, 400, base, { stroke: C.soft, sw: 1.8, op: c2 }) + [0, 1].map((v) => tx(xb(v), base + 26, v, { ff: SANS, size: 20, fill: C.soft, op: c2 })).join('');
        const u0 = p(t, 18.4, 19.6), u1 = p(t, 19.4, 20.4);
        o += bar(xb(0), base, 108 * u0, 60, C.A, c2) + bar(xb(1), base, 12 * u1, 60, C.A, c2);
        o += on(u0 > 0.9, tx(xb(0), base - 108 - 10, '0,9', { size: 24, fill: C.A, op: c2 * p(u0, 0.9, 1) })) + on(u1 > 0.9, tx(xb(1), base - 12 - 10, '0,1', { size: 24, fill: C.A, op: c2 * p(u1, 0.9, 1) }));
        const mp = vis(t, 22, 36.4, 0.5, 0.01) * c2;
        o += on(mp, rect(xb(0) - 38, base - 108 - 40, 76, 108 + 46, { rx: 8, stroke: C.hi, sw: 3, so: mp }) + ln(xb(0) + 40, 164, 440, 164, { stroke: C.hi, sw: 3, op: mp }) + tx(452, 154, 'valore più', { size: 22, ta: 'start', op: mp }) + tx(452, 182, 'probabile: 0', { size: 22, ta: 'start', op: mp }));
        const mm_ = vis(t, 28, 36.4, 0.5, 0.01) * c2;
        o += on(mm_, fulcrum(xb(0.1), base + 36, mm_) + tx(xb(0.1) + 32, base + 58, '*E*[*X*] = 0,1', { size: 24, fill: C.B, ta: 'start', op: mm_ }));
        o += on(mm_, pills(334, [{ s: 'media 0,1, valore più probabile 0: non coincidono', op: mm_ }]));
      }
      return o;
    },
  });

  /* ======================================================================
     2.4 · La media di una funzione di X e la linearità
     ====================================================================== */
  const TRIPS = [[20, 10], [30, 20], [30, 20], [40, 30]]; // benzina, pedaggi dei quattro viaggi (equiprobabili)

  PV.add('funzionemedia', {
    sec: '2.4',
    short: 'La media di g(X) e la linearità',
    title: 'La media di una funzione di X e la linearità del valore atteso',
    alt: 'Animazione: la media di g(X) si calcola con gli stessi pesi sui nuovi valori (E[X²] = 1,5 ma (E[X])² = 1); E[aX + b] = aE[X] + b (2 · 3,5 + 1 = 8); la media della somma è la somma delle medie, anche se le variabili sono dipendenti (30 + 20 = 50 euro di viaggio).',
    dur: 60,
    poster: 50,
    chap: [[0, 'La media di g(X)'], [19.4, 'aX + b'], [37.2, 'La media della somma']],
    caps: [
      [0, 'Per la media di *X*² non serve ricavare la legge di *X*²: basta applicare la funzione a ogni valore e pesare con le stesse probabilità, *E*[*g*(*X*)] = Σ *g*(*x*) *p*(*x*).'],
      [8.6, 'Con due monete e *g*(*x*) = *x*²: *E*[*X*²] = 0 · 1/4 + 1 · 1/2 + 4 · 1/4 = 1,5. La sbarra si riequilibra in 1,5.'],
      [16.4, 'Attenzione: (*E*[*X*])² = 1, mentre *E*[*X*²] = 1,5. La media del quadrato non è il quadrato della media.'],
      [19.4, 'Con una trasformazione lineare le medie seguono: *E*[*aX* + *b*] = *a* *E*[*X*] + *b*. Un dado in euro vale in media 3,5 €.'],
      [29.6, 'Il doppio più 1 € vale in media 2 × 3,5 + 1 = 8 €: raddoppio i valori, poi li sposto di 1, e il baricentro fa lo stesso.'],
      [37.2, 'La media della somma è la somma delle medie: *E*[*X* + *Y*] = *E*[*X*] + *E*[*Y*]. Quattro viaggi ugualmente probabili: benzina e pedaggi.'],
      [47, 'Benzina in media 30 €, pedaggi in media 20 €: il viaggio costa in media 50 €. Vale anche se le due spese sono legate: viaggi lunghi costano di più in entrambe.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 19, 'La media di *g*(*X*)', 'stessi pesi, nuovi valori: *g*(*x*) = *x*²') + heading(t, 19.6, 36.8, '*E*[*aX* + *b*] = *a* *E*[*X*] + *b*', 'un dado in euro: *Y* = 2*X* + 1') + heading(t, 37.4, 60.4, 'La media della somma', 'quattro viaggi ugualmente probabili: benzina *X*, pedaggi *Y*');

      /* capitolo 1: E[X²] con la sbarra */
      const a = vis(t, 0.4, 19.2, 0.5, 0.5);
      if (a > 0.004) {
        const xa = (v) => 120 + 90 * v, s = p(t, 5.2, 8.4, E.io), W = [[0, 1], [1, 2], [2, 1]];
        const xs = (v) => lerp(xa(v), xa(v * v), s);
        const xm = 0.25 * xs(0) + 0.5 * xs(1) + 0.25 * xs(2), pv = lerp(xa(1), xa(1.5), p(t, 9.6, 11.4, E.io));
        o += sbarra(pv, 0.07 * (xm - pv) + wob(t - 11.4), W.map(([v, n]) => [xs(v), n, '1/4']), [0, 1, 2, 3, 4].map((v) => [xa(v), String(v)]), a, 44, 30);
        const gl = p(t, 3.4, 4.2) * a * (1 - p(t, 18.4, 19));
        o += on(gl, tx(320, 108, '*g*(*x*) = *x*²', { size: 26, fill: C.B, op: gl }));
        const fm = vis(t, 12, 16.2, 0.5, 0.4) * a;
        o += on(fm, tx(320, 326, '*E*[*X*²] = 0 · 1/4 + 1 · 1/2 + 4 · 1/4 = 1,5', { size: 24, op: fm }));
        const pl = vis(t, 16.6, 19, 0.5, 0.01) * a;
        o += on(pl, pills(334, [{ s: '(*E*[*X*])² = 1, ma *E*[*X*²] = 1,5: sono diversi', op: pl }]));
      }

      /* capitolo 2: E[aX + b] con un dado */
      const b = vis(t, 19.6, 37.2, 0.5, 0.5);
      if (b > 0.004) {
        const xy = (y) => 70 + 38 * y, s1 = p(t, 23, 26, E.io), s2 = p(t, 30.4, 32, E.io);
        const xs = (v) => xy(lerp(v, 2 * v, s1) + s2); // dalle facce v a 2v e poi a 2v + 1
        const xm = xy(lerp(3.5, 7, s1) + s2);
        const pv = t < 28 ? lerp(xy(3.5), xy(7), p(t, 26.4, 27.8, E.io)) : lerp(xy(7), xy(8), p(t, 32.4, 33.6, E.io));
        o += sbarra(pv, 0.07 * (xm - pv) + wob(t - 27.8, 3) * (t < 30 ? 1 : 0) + wob(t - 33.6, 3) * (t >= 30 ? 1 : 0), [1, 2, 3, 4, 5, 6].map((v) => [xs(v), 1, '1/6']), Array.from({ length: 14 }, (_, k) => [xy(k), String(k)]), b, 30, 28);
        const l1 = vis(t, 23.4, 28.4, 0.4, 0.4) * b, l2 = vis(t, 30.6, 36.8, 0.4, 0.01) * b;
        const l0 = vis(t, 20.4, 23.2, 0.4, 0.4) * b;
        o += on(l0, pills(112, [{ s: 'dado equo: *E*[*X*] = 3,5', col: C.B, op: l0 }]));
        o += on(l1, pills(112, [{ s: 'raddoppio: 2*X*', col: C.B, op: l1 }]));
        o += on(l2, pills(112, [{ s: 'poi sposto di 1: 2*X* + 1', col: C.B, op: l2 }]));
        const f1 = vis(t, 27.8, 30.4, 0.4, 0.4) * b, f2 = vis(t, 34, 37, 0.5, 0.01) * b;
        o += on(f1, tx(320, 326, '*E*[2*X*] = 2 · 3,5 = 7', { size: 24, op: f1 }));
        o += on(f2, tx(320, 326, '*E*[2*X* + 1] = 2 · 3,5 + 1 = 8', { size: 24, op: f2 }));
      }

      /* capitolo 3: la media della somma */
      const c3 = p(t, 37.6, 38.4);
      if (c3 > 0.004) {
        const xb = (i) => 100 + 95 * i, base = 268, k = 2.4;
        o += ln(60, base, 480, base, { stroke: C.soft, sw: 1.8, op: c3 });
        TRIPS.forEach(([be, pe], i) => {
          const u = p(t, 38.6 + 0.7 * i, 39.6 + 0.7 * i), u2 = p(t, 39.4 + 0.7 * i, 40.4 + 0.7 * i);
          o += bar(xb(i), base, be * k * u, 62, C.A, c3) + bar(xb(i), base - be * k, pe * k * u2, 62, C.B, c3);
          o += on(u > 0.5, tx(xb(i), base - be * k * 0.5 + 6, be, { ff: SANS, size: 17, fill: C.paper, op: c3 * p(u, 0.5, 1) }));
          o += on(u2 > 0.5, tx(xb(i), base - be * k - pe * k * 0.5 + 6, pe, { ff: SANS, size: 17, fill: C.paper, op: c3 * p(u2, 0.5, 1) }));
          o += on(p(t, 43, 43.8), tx(xb(i), base - (be + pe) * k - 10, be + pe, { size: 22, op: c3 * p(t, 43 + 0.2 * i, 43.8 + 0.2 * i) }));
        });
        for (let i = 0; i < 4; i++) o += lb(xb(i), base + 24, 'viaggio ' + (i + 1), { op: c3 * p(t, 38.6 + 0.7 * i, 39.4 + 0.7 * i) });
        o += rect(70, 84, 14, 14, { rx: 3, fill: C.A, fo: 0.85, op: c3 }) + lb(90, 97, 'benzina', { ta: 'start', op: c3 }) + rect(180, 84, 14, 14, { rx: 3, fill: C.B, fo: 0.85, op: c3 }) + lb(200, 97, 'pedaggi', { ta: 'start', op: c3 });
        /* il viaggio medio */
        const m1 = p(t, 45.6, 46.6) * c3, m2 = p(t, 47.4, 48.4) * c3;
        o += on(m1, bar(550, base, 30 * k * m1, 62, C.A, c3) + tx(550, base - 30 * k * 0.5 + 6, '30', { ff: SANS, size: 17, fill: C.paper, op: m1 }));
        o += on(m2, bar(550, base - 30 * k, 20 * k * m2, 62, C.B, c3) + tx(550, base - 30 * k - 20 * k * 0.5 + 6, '20', { ff: SANS, size: 17, fill: C.paper, op: m2 }) + tx(550, base - 50 * k - 10, '50', { size: 22, fill: C.B, op: m2 }));
        o += on(m1, lb(550, base + 24, 'viaggio medio', { op: c3 * m1 }));
        const p1 = vis(t, 49, 53.4, 0.5, 0.4) * c3, p2 = vis(t, 53.8, 60.4, 0.5, 0.01) * c3;
        o += on(p1, pills(334, [{ s: '(30 + 50 + 50 + 70) / 4 = 50 = 30 + 20', op: p1 }]));
        o += on(p2, pills(334, [{ s: 'spese legate fra loro: la linearità vale lo stesso', op: p2 }]));
      }
      return o;
    },
  });

  /* ======================================================================
     2.4 · Il trucco delle indicatrici: il guardaroba distratto
     ====================================================================== */
  const GPERM = [[3, 1, 2, 5, 4, 7, 6, 9, 8, 10], [2, 3, 4, 5, 6, 7, 8, 9, 10, 1], [1, 3, 2, 4, 6, 5, 8, 7, 10, 9]]; // persona k → cappotto ricevuto
  const GX = (k) => 64 + 56 * k, GPY = 112, GCY = 252;
  const gperson = (k, op) => g({ op }, circ(GX(k), GPY, 17, { fill: C.paper, stroke: C.soft, sw: 1.8 }) + tx(GX(k), GPY + 6, k + 1, { size: 18 }));
  const gline = (k, to, u, col, op, sw) => ln(GX(k), GPY + 18, GX(k) + (GX(to) - GX(k)) * u, GPY + 18 + (GCY - 18 - GPY - 18) * u, { stroke: col, sw, op, lc: 'round' });

  PV.add('guardaroba', {
    sec: '2.4',
    short: 'Il trucco delle indicatrici: il guardaroba',
    title: 'Il trucco delle variabili indicatrici: il guardaroba distratto',
    alt: 'Animazione: dieci persone ricevono i cappotti a caso; il numero N di chi ritrova il proprio è somma di dieci indicatrici, ciascuna con media 1/10; per linearità E[N] = 10 · 1/10 = 1, anche con 100 o 1 000 persone.',
    dur: 61,
    poster: 17,
    chap: [[0, 'Cappotti restituiti a caso'], [20.4, 'Una somma di indicatrici'], [44.6, 'Con 100 persone?']],
    caps: [
      [0, 'A una festa 10 persone lasciano il cappotto. Il guardarobiere, distratto, li restituisce a caso. Quante persone, in media, tornano a casa con il proprio?'],
      [10.6, 'Il numero *N* di persone fortunate cambia a ogni serata: qui 1, poi 0, poi 2. Calcolarne la legge è difficile.'],
      [20.6, 'Ma chiamo *I*_k l’indicatrice dell’evento «la persona *k* riceve il suo cappotto». Allora *N* = *I*₁ + *I*₂ + … + *I*₁₀.'],
      [28.9, 'La persona *k* riceve uno dei 10 cappotti, tutti ugualmente probabili: *E*[*I*_k] = P(riceve il suo) = 1/10.'],
      [36.2, 'Per linearità *E*[*N*] = 1/10 + 1/10 + … + 1/10 (10 volte) = 1: in media torna a casa con il suo cappotto una persona sola.'],
      [44.8, 'Con 100 persone, o con 1 000, il ragionamento è identico: ognuna ha probabilità 1/*n*, sono *n*, e la media resta 1.'],
      [52.6, 'Le *I*_k non sono indipendenti (se nove hanno il loro cappotto, anche la decima), ma alla linearità della media questo non importa.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 20, 'Il guardaroba distratto', 'cappotti restituiti a caso: quanti ritrovano il proprio?') + heading(t, 20.8, 44.2, 'Il trucco delle indicatrici', '*I*_k = 1 se la persona *k* ritrova il suo cappotto, 0 altrimenti') + heading(t, 45, 61.4, 'E con 100 o 1 000 persone?', 'ognuna ha probabilità 1/*n*');

      /* capitolo 1: tre serate */
      const rw = p(t, 0.5, 1.3) * (1 - p(t, 19.4, 20));
      if (rw > 0.004) {
        for (let k = 0; k < 10; k++) o += gperson(k, rw) + tile(GX(k), GCY, 34, k + 1, { size: 18, veil: C.A, vo: 0.14, op: rw });
        GPERM.forEach((perm, j) => {
          const T = 1.8 + 6 * j, out = 1 - p(t, T + 5.2, T + 5.8), hi = p(t, T + 2.4, T + 3);
          if (t < T || out <= 0.004) return;
          let nfix = 0;
          perm.forEach((c, k) => {
            const fixed = c === k + 1, u = p(t, T + 0.1 * k, T + 0.1 * k + 0.6, E.io);
            if (fixed) nfix++;
            if (u <= 0.004) return;
            o += gline(k, c - 1, u, fixed ? OK : C.soft, rw * out * (fixed ? lerp(0.9, 1, hi) : lerp(0.9, 0.22, hi)), fixed ? lerp(1.8, 3.4, hi) : 1.8);
            if (fixed && hi > 0.004) o += circ(GX(k), GPY, 21, { stroke: OK, sw: 3, so: hi * out * rw }) + rect(GX(k) - 21, GCY - 21, 42, 42, { rx: 8, stroke: OK, sw: 3, so: hi * out * rw });
          });
          const cn = p(t, T + 3, T + 3.6) * out * rw;
          o += on(cn, txc(320, 326, [['*N* = ', C.ink], [String(nfix), C.B]], { size: 32, op: cn }));
        });
      }

      /* capitolo 2: N = I1 + … + I10, ciascuna con media 1/10 */
      const c2 = vis(t, 20.8, 44.2, 0.6, 0.5);
      if (c2 > 0.004) {
        for (let k = 0; k < 10; k++) {
          const u = p(t, 21 + 0.1 * k, 21.6 + 0.1 * k), m = p(t, 36.4 + 0.18 * k, 37 + 0.18 * k);
          if (u <= 0.004) continue;
          o += tile(GX(k), 134, 42, '*I*_{' + (k + 1) + '}', { size: 18, op: c2 * u * (1 - m) }) + on(m, tile(GX(k), 134, 42, '1/10', { size: 17, tc: C.B, op: c2 * m }));
        }
        const ring1 = vis(t, 25.4, 36, 0.4, 0.4) * c2;
        o += on(ring1, rect(GX(0) - 25, 134 - 25, 50, 50, { rx: 9, stroke: C.hi, sw: 3, so: ring1 }));
        const s1 = p(t, 22.6, 23.4) * c2 * (1 - p(t, 38.4, 39));
        o += on(s1, brace(GX(0) - 20, GX(9) + 20, 164, C.soft, s1) + tx(320, 198, '*N* = *I*₁ + *I*₂ + … + *I*₁₀', { size: 26, op: s1 }));
        /* la prima indicatrice */
        const cr = vis(t, 25.2, 36, 0.5, 0.5) * c2;
        if (cr > 0.004) {
          for (let k = 0; k < 10; k++) o += tile(GX(k), 270, 34, k + 1, { size: 18, veil: C.A, vo: 0.14, op: cr, ring: k === 0 ? C.hi : undefined });
          o += lb(320, 316, 'un cappotto su 10 è il suo', { op: cr * p(t, 29.6, 30.4) });
          o += tx(320, 232, '*I*₁ = 1 se la persona 1 riceve il suo cappotto', { size: 22, op: cr * (1 - p(t, 30.6, 31)) * p(t, 26, 26.8) });
          o += tx(320, 232, '*E*[*I*₁] = 1 · 1/10 + 0 · 9/10 = 1/10', { size: 24, op: cr * p(t, 31.4, 32.2) });
        }
        const sm = p(t, 39, 39.8) * c2;
        o += on(sm, tx(320, 218, '*E*[*N*] = 1/10 + 1/10 + … + 1/10  (10 volte)', { size: 24, op: sm }) + txc(320, 270, [['= ', C.ink], ['1', C.B]], { size: 40, op: p(t, 41, 41.8) * c2 }));
      }

      /* capitolo 3: n persone */
      const c3 = p(t, 45.2, 46);
      if (c3 > 0.004) {
        [['10', '10', '1/10'], ['100', '100', '1/100'], ['1 000', '1 000', '1/1 000']].forEach(([n, a, b], i) => {
          const u = p(t, 46 + 2.4 * i, 46.8 + 2.4 * i) * c3;
          o += on(u, txc(320, 136 + 48 * i, [['*n* = ' + n + ':  ' + a + ' · ' + b + ' = ', C.ink], ['1', C.B]], { size: 28, op: u }));
        });
        const pd = vis(t, 52.8, 61.4, 0.5, 0.01) * c3;
        o += on(pd, pills(310, [{ s: 'le indicatrici sono dipendenti: alla linearità non importa', op: pd }]));
      }
      return o;
    },
  });

  /* ======================================================================
     2.4 · Giochi equi, rendimento e quote: roulette e rischio
     ====================================================================== */
  const WCX = 130, WCY = 206, WR = 78, Wr = 46;
  const wsector = (i, n) => {
    const a0 = ((-90 + (i * 360) / n) * Math.PI) / 180, a1 = ((-90 + ((i + 1) * 360) / n) * Math.PI) / 180;
    const P = (rad, a) => (WCX + rad * Math.cos(a)).toFixed(1) + ' ' + (WCY + rad * Math.sin(a)).toFixed(1);
    return `M${P(WR, a0)}A${WR} ${WR} 0 0 1 ${P(WR, a1)}L${P(Wr, a1)}A${Wr} ${Wr} 0 0 0 ${P(Wr, a0)}Z`;
  };
  const wcol = (i) => (i === 0 ? OK : i % 2 ? NO : '#3a3a3a'); // 0 verde, poi rosse e nere alternate

  PV.add('giochiequi', {
    sec: '2.4',
    short: 'Giochi equi, rendimento e quote',
    title: 'Giochi equi, rendimento atteso e quote: la roulette',
    alt: 'Animazione: sulla roulette con 37 caselle puntare 1 euro sul rosso rende in media 36/37 di euro, cioè si perdono 2,7 centesimi per euro; la quota equa è il reciproco della probabilità; un gioco equo può comunque essere rischioso.',
    dur: 62,
    poster: 21,
    chap: [[0, 'La roulette: rendimento atteso'], [22.4, 'Le quote: Q = 1/p'], [44.6, 'Equo non vuol dire senza rischio']],
    caps: [
      [0, 'Per giocare paghi un prezzo *s* e ricevi una vincita aleatoria *V*; il guadagno è *G* = *V* − *s*. Il gioco è equo se *E*[*G*] = 0, cioè se *s* = *E*[*V*].'],
      [8.4, 'La roulette ha 37 caselle: 18 rosse, 18 nere e lo 0 verde. Punti 1 € sul rosso: se esce rosso ricevi 2 €, altrimenti niente.'],
      [14.4, '*E*[*V*] = 2 · 18/37 + 0 · 19/37 = 36/37 ≈ 0,973, quindi *E*[*G*] = −1/37 ≈ −0,027.'],
      [19, 'In media perdi 2,7 centesimi per ogni euro puntato: su 1 000 € puntati, circa 27.'],
      [22.4, 'Chi organizza scommesse comunica una quota *Q*: punti 1 € e, se l’evento di probabilità *p* si verifica, ricevi *Q* euro.'],
      [29.4, 'Allora *E*[*G*] = *pQ* − 1, e il gioco è equo se e solo se *Q* = 1/*p*: la quota equa è il reciproco della probabilità.'],
      [37, 'Sulla roulette il rosso ha *p* = 18/37 e quota equa 37/18 ≈ 2,056, ma paga 2; un numero ha quota equa 37 e paga 36: in tutti e due i casi *E*[*G*] = −1/37.'],
      [44.6, '*E*[*G*] = 0 dice dove sta la media, non quanto si disperdono i risultati. Un gioco in cui il guadagno è sempre 0 è equo e senza rischio.'],
      [53, 'Lancia una moneta: con testa ricevi 2 000 €, con croce niente, e paghi 1 000 €. È equo, ma il guadagno vale +1 000 € oppure −1 000 € con la stessa probabilità.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 22, 'La roulette: è un gioco equo?', '1 € sul rosso: ricevi 2 € se esce rosso, niente altrimenti') + heading(t, 22.6, 44.2, 'Le quote e il gioco equo', 'punti 1 €; se l’evento ha probabilità *p* ricevi *Q* euro') + heading(t, 44.8, 62.4, 'Equo non vuol dire senza rischio', 'due giochi con la stessa media: *E*[*G*] = 0');

      /* capitolo 1: la roulette */
      const c1 = p(t, 0.4, 1.2) * (1 - p(t, 21.4, 22.2));
      if (c1 > 0.004) {
        const hr = p(t, 3.6, 4.4), ho = p(t, 7, 7.8); // evidenza: caselle rosse, poi le altre
        const nr = lerp(1, 0.28, hr * (1 - ho)), rr = lerp(1, 0.28, ho);
        for (let i = 0; i < 37; i++) o += path(wsector(i, 37), { fill: wcol(i), fo: 0.92, stroke: C.soft, sw: 1, op: c1 * p(t, 0.6 + 0.03 * i, 1.1 + 0.03 * i) * (i % 2 ? rr : nr) });
        o += tx(WCX, WCY + 4, '37', { size: 26, op: c1 }) + lb(WCX, WCY + 24, 'caselle', { op: c1 });
        const r1 = p(t, 4, 4.8) * c1, r2 = p(t, 7.4, 8.2) * c1;
        o += on(r1, rect(232, 118, 16, 16, { rx: 3, fill: NO, fo: 0.9, op: r1 }) + txc(258, 134, [['rosso: ', C.ink], ['V = 2', C.B], [' con prob. 18/37', C.ink]], { size: 22, ta: 'start', op: r1 }));
        o += on(r2, rect(232, 162, 16, 16, { rx: 3, fill: '#3a3a3a', stroke: C.soft, sw: 1, op: r2 }) + txc(258, 178, [['altro: ', C.ink], ['V = 0', C.B], [' con prob. 19/37', C.ink]], { size: 22, ta: 'start', op: r2 }));
        const e1 = p(t, 11, 11.8) * c1, e2 = p(t, 13, 13.8) * c1, e3 = p(t, 15.6, 16.4) * c1;
        o += on(e1, tx(232, 226, '*E*[*V*] = 2 · 18/37 + 0 · 19/37', { size: 22, ta: 'start', op: e1 }));
        o += on(e2, txc(232, 258, [['= 36/37 ≈ ', C.ink], ['0,973', C.B]], { size: 22, ta: 'start', op: e2 }));
        o += on(e3, txc(232, 296, [['*E*[*G*] = 36/37 − 1 = ', C.ink], ['−1/37 ≈ −0,027', NO]], { size: 22, ta: 'start', op: e3 }));
        const pl = p(t, 19, 19.8) * c1;
        o += on(pl, pills(336, [{ s: 'perdi in media 2,7 centesimi per euro puntato', col: NO, op: pl }]));
      }

      /* capitolo 2: le quote */
      const c2 = p(t, 22.8, 23.6) * (1 - p(t, 43.6, 44.4));
      if (c2 > 0.004) {
        const f1 = p(t, 23.6, 24.4) * c2, f2 = p(t, 29.6, 30.4) * c2;
        o += on(f1, tx(320, 130, '*E*[*G*] = *p* · *Q* − 1', { size: 36, op: f1 }));
        o += on(f2, txc(320, 180, [['equo:  ', C.soft], ['*Q* = 1/*p*', C.B]], { size: 32, op: f2 }));
        /* due barre: la puntata e il rendimento atteso p·Q, mentre la quota Q cresce */
        const vq = vis(t, 24.8, 33.4, 0.5, 0.7) * c2;
        if (vq > 0.004) {
          const fair = t >= 27 && t < 29.6, Q = t < 27 ? lerp(1.5, 37 / 18, p(t, 25, 27, E.out)) : fair ? 37 / 18 : lerp(37 / 18, 2.8, p(t, 29.6, 31.6, E.io)), pq = (18 / 37) * Q, eg = pq - 1;
          o += lb(120, 223, 'puntata', { ta: 'end', op: vq }) + rect(130, 206, 200, 22, { rx: 4, fill: C.soft, fo: 0.35, stroke: C.soft, sw: 1.6, op: vq }) + tx(338, 224, '1 €', { size: 22, ta: 'start', op: vq });
          o += lb(120, 263, 'ricevi in media', { ta: 'end', op: vq }) + rect(130, 246, 200 * pq, 22, { rx: 4, fill: fair ? OK : C.A, fo: 0.5, stroke: fair ? OK : C.A, sw: 1.8, op: vq }) + tx(138 + 200 * pq, 264, '*p* · *Q* = ' + FMT(pq, 3), { size: 22, ta: 'start', op: vq });
          o += tx(300, 312, '*Q* = ' + FMT(Q, 3) + (fair ? ' = 37/18' : ''), { size: 22, ta: 'end', op: vq }) + tx(332, 312, '*E*[*G*] = ' + (eg < -0.0005 ? '−' + FMT(-eg, 3) : eg > 0.0005 ? '+' + FMT(eg, 3) : '0'), { size: 22, ta: 'start', fill: eg < -0.0005 ? NO : fair ? OK : C.ink, op: vq });
        }
        const COLX = [74, 196, 320, 430, 540], HDR = ['evento', '*p*', 'quota equa 1/*p*', 'paga', '*E*[*G*]'], ROW = [['rosso', '18/37', '≈ 2,056', '2', '−1/37'], ['un numero', '1/37', '37', '36', '−1/37']];
        const hh = p(t, 33, 33.8) * c2;
        HDR.forEach((h, k) => (o += on(hh, lb(COLX[k], 232, h, { op: hh }))));
        ROW.forEach((row, r) => {
          const u = p(t, 33.8 + 1.6 * r, 34.6 + 1.6 * r) * c2;
          row.forEach((s, k) => (o += on(u, tx(COLX[k], 270 + 40 * r, s, { size: 22, op: u, fill: k === 4 ? NO : C.ink }))));
        });
        const pl = p(t, 40, 40.8) * c2;
        o += on(pl, pills(336, [{ s: 'paga meno della quota equa: perdi in media', col: NO, op: pl }]));
      }

      /* capitolo 3: stessa media, rischio diverso */
      const c3 = p(t, 45, 45.8);
      if (c3 > 0.004) {
        const gx = (v) => 320 + 0.2 * v, base = 144;
        o += lb(70, 100, 'gioco A: guadagno sempre 0', { ta: 'start', op: c3 });
        o += ln(100, base, 540, base, { stroke: C.soft, sw: 1.8, op: c3 });
        [-1000, 0, 1000].forEach((v) => (o += tx(gx(v), base + 24, v === 0 ? '0' : (v > 0 ? '+1 000' : '−1 000'), { ff: SANS, size: 17, fill: C.soft, op: c3 })));
        const a1 = p(t, 46, 47) * c3;
        o += on(a1, bar(gx(0), base, 44 * a1, 40, C.A, a1) + tx(gx(0) + 46, base - 14, '1', { size: 22, fill: C.A, op: a1 }) + fulcrum(gx(0), base + 30, a1));
        const b0 = 262;
        o += lb(70, 214, 'gioco B: ±1 000 con probabilità 1/2', { ta: 'start', op: c3 * p(t, 51, 51.8) });
        const bb = p(t, 51, 52) * c3;
        o += on(bb, ln(100, b0, 540, b0, { stroke: C.soft, sw: 1.8, op: bb }) + [-1000, 0, 1000].map((v) => tx(gx(v), b0 + 24, v === 0 ? '0' : (v > 0 ? '+1 000' : '−1 000'), { ff: SANS, size: 17, fill: C.soft, op: bb })).join(''));
        const b1 = p(t, 52.4, 53.4) * c3;
        o += on(b1, bar(gx(-1000), b0, 22 * b1, 40, C.A, b1) + bar(gx(1000), b0, 22 * b1, 40, C.A, b1) + tx(gx(-1000), b0 - 30, '1/2', { size: 20, fill: C.A, op: b1 }) + tx(gx(1000), b0 - 30, '1/2', { size: 20, fill: C.A, op: b1 }) + fulcrum(gx(0), b0 + 30, b1));
        const sd = p(t, 56, 57) * c3;
        o += on(sd, arrow(gx(0), b0 - 14, gx(1000) - 26, b0 - 14, p(t, 56, 57.4, E.io), C.B, sd) + tx(gx(500), b0 - 46, 'dev. standard', { ff: SANS, size: 17, fill: C.B, op: sd }) + tx(gx(500), b0 - 28, '1 000 €', { ff: SANS, size: 17, fill: C.B, op: sd }));
        const pl = vis(t, 58.2, 62.4, 0.5, 0.01) * c3;
        o += on(pl, pills(336, [{ s: 'stessa media, rischio molto diverso', op: pl }]));
      }
      return o;
    },
  });

  /* ======================================================================
     2.3 · La legge condizionale e la somma sull'urna
     ====================================================================== */
  const UV = [['3/10', '3/10'], ['3/10', '1/10']]; // p(x, y) dell'urna: righe X, colonne Y
  const CRES = { 1: [8, ['3/4', '1/4'], C.B, '÷ 4/10'], 0: [18, ['1/2', '1/2'], C.C, '÷ 6/10'] }; // colonna → [inizio, nuovi valori, colore, divisore]
  const CROWS = [['prima rossa, in generale', 0.4, '4/10', C.A, 5.6], ['prima rossa, sapendo *Y* = 1', 0.25, '1/4', C.B, 10.2], ['prima rossa, sapendo *Y* = 0', 0.5, '1/2', C.C, 20.2]];

  PV.add('condiz', {
    sec: '2.3',
    short: 'Legge condizionale e somma',
    title: 'Urna: la legge condizionale e la somma X + Y',
    alt: 'Animazione: nella tabella dell’urna senza reimmissione, riscalando la colonna di Y = 1 per farla sommare a 1 si ottiene la legge di X sapendo Y = 1 (la prima rossa con probabilità 1/4); riscalando la colonna di Y = 0 si ottiene 1/2; le due leggi condizionali differiscono dalla marginale 4/10. Poi la somma X + Y si ottiene sommando le diagonali: 3/10, 6/10, 1/10.',
    dur: 54,
    poster: 24,
    chap: [[0, 'La colonna riscalata'], [32.8, 'La somma sulle diagonali']],
    caps: [
      [0, 'Se sai che *Y* ha assunto il valore *y*, la legge di *X* può cambiare. Urna con 2 rosse e 3 blu, due estrazioni senza reimmissione.'],
      [8.2, 'Sapendo che la seconda è rossa (*Y* = 1), riscalo la colonna di *Y* = 1 perché sommi a 1: *p*(1 | 1) = (1/10)/(4/10) = 1/4.'],
      [16.6, 'Sapendo che la seconda è blu, la prima era rossa con probabilità *p*(1 | 0) = (3/10)/(6/10) = 1/2.'],
      [23, 'Tre valori diversi: 4/10, 1/4 e 1/2. Le leggi condizionali differiscono fra loro e dalla marginale: è un altro modo di vedere la dipendenza.'],
      [32.8, 'La somma *X* + *Y* è il numero di rosse fra le due estratte: si sommano le caselle di una diagonale.'],
      [39, '*X* + *Y* = 1 con *p*(0, 1) + *p*(1, 0) = 3/10 + 3/10 = 6/10; vale 0 con 3/10 e 2 con 1/10.'],
      [46, 'È una densità ipergeometrica, che incontreremo in 2.6.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 32.4, 'Sapendo Y, la legge di X cambia', '*p*(*x* | *y*) = *p*(*x*, *y*) / *p*_Y(*y*): la colonna riscalata') + heading(t, 33, 54.4, 'La somma sulle diagonali', '*X* + *Y* = numero di rosse fra le due estratte');
      const tb = p(t, 0.5, 1.4), mg = p(t, 1.8, 2.8), rv = p(t, 32.4, 33.2); // rv: le colonne tornano ai valori originali
      o += tab2(tb, '*X*', '*Y*');
      const mc = (c) => p(t, CRES[c][0], CRES[c][0] + 1) * (1 - rv); // quanto la colonna c è riscalata
      for (const [r, c] of CELLS) {
        const m = mc(c);
        o += ctext(r, c, UV[r][c], { op: tb * (1 - m) }) + on(m, ctext(r, c, CRES[c][1][r], { op: m, fill: CRES[c][2] }));
      }
      o += on(mg, [0, 1].map((r) => tx(MX, IY + r * CH + CH / 2 + 8, r ? '4/10' : '6/10', { size: 24, fill: C.A, op: mg })).join('') + [0, 1].map((c) => tx(IX + c * CW + CW / 2, MY, c ? '4/10' : '6/10', { size: 24, fill: C.B, op: mg * (1 - mc(c)) })).join('')
        + tx(MX, MY, '1', { size: 24, fill: OK, op: mg }) + tx(MX, IY - 12, '*p*_X', { size: 18, fill: C.A, op: mg }) + tx(IX - 30, MY, '*p*_Y', { size: 18, fill: C.B, ta: 'end', op: mg }));
      for (const c of [1, 0]) {
        const m = mc(c), rg = p(t, CRES[c][0] - 0.8, CRES[c][0] - 0.2) * (1 - rv);
        o += on(m, tx(IX + c * CW + CW / 2, MY, '1', { size: 24, fill: CRES[c][2], op: m }));
        if (rg > 0.004) o += rect(IX + c * CW + 3, IY + 3, CW - 6, 2 * CH - 6, { rx: 8, stroke: CRES[c][2], sw: 3, so: rg }) + tx(IX + c * CW + CW / 2, 300, CRES[c][3], { size: 18, fill: CRES[c][2], op: rg });
      }

      /* capitolo 1: tre numeri a confronto */
      const cb = 1 - rv;
      CROWS.forEach(([lab, v, s2, col, t0], i) => {
        const u = p(t, t0, t0 + 1) * cb, y = 124 + 52 * i;
        if (u <= 0.004) return;
        o += tx(340, y, lab, { size: 18, ta: 'start', op: u }) + rect(340, y + 8, 300 * v * p(t, t0, t0 + 1), 20, { rx: 4, fill: col, fo: 0.85, op: u }) + tx(350 + 300 * v * p(t, t0, t0 + 1), y + 26, s2, { size: 22, ta: 'start', fill: col, op: u });
      });
      const f1 = vis(t, 9.4, 17.4, 0.5, 0.4) * cb, f2 = vis(t, 19.4, 29.4, 0.5, 0.4) * cb;
      o += on(f1, txc(340, 292, [['*p*(1 | 1) = (1/10)/(4/10) = ', C.ink], ['1/4', C.B]], { size: 20, ta: 'start', op: f1 }));
      o += on(f2, txc(340, 292, [['*p*(1 | 0) = (3/10)/(6/10) = ', C.ink], ['1/2', C.C]], { size: 20, ta: 'start', op: f2 }));
      const pl = vis(t, 24.4, 32.4, 0.5, 0.4) * cb;
      o += on(pl, pills(336, [{ s: 'tre valori diversi: sapere *Y* cambia la legge di *X*', op: pl }]));

      /* capitolo 2: la somma sulle diagonali */
      const c2 = p(t, 33.2, 34) ;
      if (c2 > 0.004) {
        const hl = p(t, 34, 34.8) * c2, bx = (s) => 400 + 90 * s, base = 262;
        for (const [r, c] of CELLS) {
          const [cx, cy] = icell(r, c), col = r + c === 0 ? C.A : r + c === 1 ? C.B : C.C;
          o += rect(cx - CW / 2 + 4, cy - CH / 2 + 4, CW - 8, CH - 8, { rx: 6, fill: col, fo: 0.22 * hl, stroke: col, so: hl, sw: 2 });
        }
        const dv = p(t, 34.4, 35.2);
        o += g({ op: dv }, ln(360, base, 630, base, { stroke: C.soft, sw: 1.6 }) + [0, 1, 2].map((s) => tx(bx(s), base + 26, '*X* + *Y* = ' + s, { ff: SANS, size: 17, fill: C.soft })).join(''));
        [[0, 60, C.A, 36, '3/10'], [1, 120, C.B, 39.6, '6/10'], [2, 20, C.C, 43.6, '1/10']].forEach(([s, h, col, t0, s2]) => {
          const u = p(t, t0, t0 + 0.9, E.out);
          o += bar(bx(s), base, h * u, 56, col, dv) + on(u > 0.9, tx(bx(s), base - h - 10, s2, { size: 24, fill: OK, op: dv * p(u, 0.9, 1) }));
        });
        const sm = vis(t, 39.8, 43.6, 0.5, 0.5) * c2;
        o += on(sm, tx(500, 98, '3/10 + 3/10 = 6/10', { size: 22, fill: C.B, op: sm }));
      }
      return o;
    },
  });

  /* ======================================================================
     2.4 · Una ruota con 12 settori: le quote eque e i biglietti
     ====================================================================== */
  const C12 = ['B', 'G', 'B', 'R', 'B', 'G', 'B', 'R', 'B', 'G', 'B', 'G']; // 6 blu, 4 verdi, 2 rossi
  const K12 = { B: [C.A, 'blu', '6/12 = 1/2', 2, 6], G: [OK, 'verde', '4/12 = 1/3', 3, 4], R: [NO, 'rosso', '2/12 = 1/6', 6, 2] }; // colore, nome, probabilità, quota equa, settori
  const TK = (i) => 62 + 46 * i;

  PV.add('ruota12', {
    sec: '2.4',
    short: 'La ruota con 12 settori',
    title: 'Una ruota con 12 settori: quote eque e biglietti',
    alt: 'Animazione: una ruota con 12 settori uguali, 6 blu, 4 verdi e 2 rossi, ha probabilità 1/2, 1/3 e 1/6 e quote eque 2, 3 e 6; il banco vende 12 biglietti da 1 euro, incassa 12 euro e li restituisce tutti ai biglietti vincenti: 2, 3 o 6 euro a testa.',
    dur: 41,
    poster: 14,
    chap: [[0, 'Quote eque dai settori'], [16.8, 'I 12 biglietti']],
    caps: [
      [0, 'Una ruota con 12 settori uguali: 6 blu, 4 verdi e 2 rossi. Gli esiti equiprobabili sono i 12 settori, non i 3 colori.'],
      [8, 'P(blu) = 6/12 = 1/2, P(verde) = 4/12 = 1/3, P(rosso) = 2/12 = 1/6: le quote eque sono 2, 3 e 6.'],
      [16.8, 'Lo vedi anche così: il banco vende 12 biglietti da 1 €, uno per settore, e incassa 12 €.'],
      [22.4, 'Se esce il blu li dividono i 6 biglietti blu: 2 € a testa. Se esce il verde, 3 € a testa; se esce il rosso, i 2 biglietti rossi prendono 6 € a testa.'],
      [36, 'Il banco restituisce tutto quello che incassa: il gioco è equo.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 16.4, 'Una ruota con 12 settori', '6 blu, 4 verdi, 2 rossi: quanto vale la quota equa?') + heading(t, 17, 41.4, 'Il banco restituisce tutto', 'vende 12 biglietti da 1 €, uno per settore');

      /* capitolo 1: i settori e le probabilità */
      const c1 = p(t, 0.4, 1.2) * (1 - p(t, 15.8, 16.6));
      if (c1 > 0.004) {
        const hs = [['B', 3, 6.5], ['G', 6.5, 10.3], ['R', 10.3, 15.4]]; // colore in evidenza da … a …
        const any = p(t, 3, 3.4) * (1 - p(t, 15.4, 15.8));
        for (let i = 0; i < 12; i++) {
          const col = C12[i], [, a0, b0] = hs.find(([x]) => x === col), br = p(t, a0, a0 + 0.4) * (1 - p(t, b0, b0 + 0.4));
          o += path(wsector(i, 12), { fill: K12[col][0], fo: 0.9, stroke: C.paper, sw: 2, op: c1 * p(t, 0.6 + 0.08 * i, 1.2 + 0.08 * i) * lerp(1, 0.25 + 0.75 * br, any) });
        }
        o += tx(WCX, WCY + 4, '12', { size: 26, op: c1 }) + lb(WCX, WCY + 24, 'settori', { op: c1 });
        ['B', 'G', 'R'].forEach((k, j) => {
          const u = p(t, hs[j][1] + 0.3, hs[j][1] + 1) * c1, y = 134 + 44 * j;
          o += on(u, rect(240, y - 16, 16, 16, { rx: 3, fill: K12[k][0], fo: 0.9, op: u }) + txc(264, y, [[K12[k][1] + ': ', C.ink], [K12[k][2], C.ink]], { size: 22, ta: 'start', op: u }));
          const q = p(t, 12.6 + 0.5 * j, 13.3 + 0.5 * j) * c1;
          o += on(q, txc(470, y, [['quota equa ', C.soft], [String(K12[k][3]), C.B]], { size: 22, ta: 'start', op: q }));
        });
        const pl = vis(t, 13.6, 16.4, 0.5, 0.01) * c1;
        o += on(pl, pills(334, [{ s: 'esiti equiprobabili: i 12 settori, non i 3 colori', op: pl }]));
      }

      /* capitolo 2: i 12 biglietti */
      const c2 = p(t, 17.2, 18);
      if (c2 > 0.004) {
        for (let i = 0; i < 12; i++) {
          const col = C12[i], u = p(t, 18 + 0.1 * i, 18.6 + 0.1 * i);
          const act = t < 22.6 ? -1 : t < 28 ? 0 : t < 33 ? 1 : 2, win = act < 0 ? 1 : ['B', 'G', 'R'][act] === col ? 1 : 0.22;
          const dimU = act < 0 ? 1 : lerp(1, win, p(t, [22.6, 28, 33][Math.max(act, 0)], [22.6, 28, 33][Math.max(act, 0)] + 0.5));
          o += g({ op: c2 * u * dimU }, rect(TK(i) - 17, 166, 34, 48, { rx: 6, fill: K12[col][0], fo: 0.25, stroke: K12[col][0], sw: 2.2 }) + tx(TK(i), 196, '1 €', { ff: SANS, size: 17 }));
        }
        const pot = p(t, 19.6, 20.6) * c2;
        o += on(pot, tx(320, 130, '12 biglietti × 1 € = 12 €', { size: 26, op: pot }));
        [['B', 22.8, 28], ['G', 28.2, 33], ['R', 33.2, 38]].forEach(([k, a, b]) => {
          const u = vis(t, a, b, 0.5, 0.4) * c2;
          if (u <= 0.004) return;
          o += txc(320, 260, [['esce ' + K12[k][1] + ': ', K12[k][0]], ['12 € ÷ ' + K12[k][4] + ' = ', C.ink], [K12[k][3] + ' € a testa', C.B]], { size: 26, op: u });
          C12.forEach((col, i) => { if (col === k) o += tx(TK(i), 154, K12[k][3] + ' €', { size: 20, fill: C.B, op: u }); });
        });
        const pe = vis(t, 38, 41.4, 0.5, 0.01) * c2;
        o += on(pe, pills(334, [{ s: 'quote eque: 2, 3 e 6', op: pe }]));
      }
      return o;
    },
  });

  /* ======================================================================
     2.4 · Quando la media non esiste: il paradosso di San Pietroburgo
     ====================================================================== */
  PV.add('pietroburgo', {
    sec: '2.4',
    short: 'Quando la media non esiste',
    title: 'Il paradosso di San Pietroburgo: una media infinita',
    alt: 'Animazione: si lancia una moneta finché esce testa e, se la prima testa è al lancio k, si vincono 2^k euro; ogni addendo della media vale 2^k · 2^−k = 1, quindi la media è 1 + 1 + 1 + … = +∞; eppure metà delle volte si vincono 2 euro e tre volte su quattro al più 4.',
    dur: 44,
    poster: 17,
    chap: [[0, 'Ogni addendo vale 1'], [21, 'La vincita tipica è modesta']],
    caps: [
      [0, 'Lanci una moneta equilibrata finché esce testa; se la prima testa arriva al lancio *k* vinci 2^k euro. È il paradosso di San Pietroburgo.'],
      [8, 'La vincita *X* vale 2^k con probabilità 2^{−k}: ogni addendo di Σ *x* *p*(*x*) vale 2^k · 2^{−k} = 1, quindi *E*[*X*] = 1 + 1 + 1 + … = +∞.'],
      [21, 'Eppure la vincita tipica è modesta: metà delle volte vinci 2 €, e tre volte su quattro al più 4 €.'],
      [30, 'Se davanti alla vincita metti un segno deciso da un’altra moneta, la media non esiste: «∞ − ∞» non ha significato.'],
      [37, 'Quando la media è infinita o non esiste, la media dei risultati di tante ripetizioni non si stabilizza su nessun numero (4.4).'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 20.4, 'Il paradosso di San Pietroburgo', 'moneta fino alla prima testa; al lancio *k* vinci 2^k euro') + heading(t, 21.2, 44.4, 'La vincita tipica è modesta', '*X* vale 2^k con probabilità 2^{−k}');

      /* capitolo 1: tutti gli addendi valgono 1 */
      const c1 = 1 - p(t, 20.2, 21);
      if (c1 > 0.004) {
        const rowY = (i) => 144 + 28 * i, COL = [70, 156, 262, 372];
        const hh = p(t, 0.8, 1.6) * c1;
        ['lancio', 'vincita', 'probabilità', 'vincita × prob.'].forEach((h, k) => (o += on(hh, lb(COL[k], 108, h, { ta: 'start', op: hh }))));
        o += on(hh, ln(60, 118, 500, 118, { stroke: C.soft, sw: 1.4, op: hh }));
        for (let i = 0; i < 6; i++) {
          const k = i + 1, t0 = 2 + 1.5 * i, u = p(t, t0, t0 + 0.6) * c1, v = p(t, t0 + 0.6, t0 + 1.2) * c1;
          if (u <= 0.004) continue;
          o += tx(COL[0], rowY(i), '*k* = ' + k, { size: 22, ta: 'start', op: u }) + tx(COL[1], rowY(i), String(2 ** k) + ' €', { size: 22, ta: 'start', op: u }) + tx(COL[2], rowY(i), '1/' + 2 ** k, { size: 22, ta: 'start', fill: C.A, op: u });
          o += on(v, txc(COL[3], rowY(i), [[String(2 ** k) + ' · 1/' + 2 ** k + ' = ', C.ink], ['1', C.B]], { size: 22, ta: 'start', op: v }));
          o += rect(560, 318 - 36 * (i + 1) + 3, 52, 30, { rx: 5, fill: C.B, fo: 0.85, op: v }) + tx(586, 318 - 36 * i - 14, '1', { ff: SANS, size: 19, fill: C.paper, op: v });
        }
        const dots = p(t, 11.4, 12.2) * c1;
        o += on(dots, tx(80, rowY(6) + 2, '…', { size: 26, ta: 'start', op: dots }) + tx(586, 98, '⋮', { size: 30, fill: C.B, op: dots }));
        const ei = p(t, 13.6, 14.6) * c1;
        o += on(ei, txc(320, 342, [['*E*[*X*] = 1 + 1 + 1 + … = ', C.ink], ['+∞', NO]], { size: 28, op: ei }));
      }

      /* capitolo 2: la vincita tipica */
      const c2 = p(t, 21.4, 22.2);
      if (c2 > 0.004) {
        const xk = (k) => 90 + 90 * (k - 1), base = 250;
        o += ln(50, base, 560, base, { stroke: C.soft, sw: 1.8, op: c2 });
        for (let k = 1; k <= 5; k++) {
          const h = 220 / 2 ** k, u = p(t, 22.4 + 0.4 * k, 23.2 + 0.4 * k);
          o += bar(xk(k), base, h * u, 46, C.A, c2) + tx(xk(k), base + 26, String(2 ** k) + ' €', { ff: SANS, size: 19, fill: C.soft, op: c2 }) + on(u > 0.9, tx(xk(k), base - h - 8, '1/' + 2 ** k, { size: 20, fill: C.A, op: c2 * p(u, 0.9, 1) }));
        }
        const m1 = vis(t, 25, 30, 0.4, 0.4) * c2;
        o += on(m1, rect(xk(1) - 32, base - 110 - 34, 64, 150, { rx: 8, stroke: C.hi, sw: 3, so: m1 }) + tx(xk(3) + 40, 160, 'metà delle volte', { size: 22, op: m1 }) + tx(xk(3) + 40, 190, 'vinci 2 €', { size: 22, op: m1 }));
        const m2 = vis(t, 30.4, 44, 0.4, 0.4) * c2;
        o += on(m2, rect(xk(1) - 32, base - 144, xk(2) - xk(1) + 64, 150, { rx: 8, stroke: C.hi, sw: 3, so: m2 }) + tx(xk(3) + 40, 160, 'tre volte su quattro', { size: 22, op: m2 }) + tx(xk(3) + 40, 190, 'al più 4 €: 3/4', { size: 22, op: m2 }));
      }
      return o;
    },
  });

  /* ======================================================================
     Riordino della Parte 2: alcune clip si dividono in due, ciascuna nella sezione dove serve.
     Ogni parte è un pezzo dell'animazione originale, rallentato di un fattore K (frame(t) è una funzione pura di t).
     ====================================================================== */
  (function () {
    const V = PV.videos, r1 = (x) => Math.round(x * 10) / 10;
    const f0 = {};
    for (const id of ['variabile', 'leggeg', 'condiz', 'geometrica']) f0[id] = V[id].frame.bind(V[id]);

    /* 2.1 · variabile: restano i primi due capitoli; il terzo diventa «Stessa legge, coppia diversa» (2.4) */
    Object.assign(V.variabile, { dur: 43.5, chap: V.variabile.chap.slice(0, 2), caps: V.variabile.caps.slice(0, 4), frame: (t) => f0.variabile(Math.min(t, 43.3)) });
    PV.add('coppiadiversa', {
      sec: '2.4',
      short: 'Stessa legge, coppia diversa',
      title: 'Stessa legge, coppia diversa: X + X contro X + W',
      alt: 'Animazione: sulle due monete X, il numero di teste, e W, il numero di croci, hanno la stessa legge, 1/4, 1/2, 1/4; ma X + X = 2X vale 0, 2 o 4 con probabilità 1/4, 1/2, 1/4, mentre X + W vale sempre 2. Le leggi delle singole variabili non bastano a descrivere la coppia.',
      dur: 35,
      poster: 26,
      chap: [[0, 'Due variabili, la stessa legge'], [11, 'Ma la coppia cambia']],
      caps: [
        [0, 'Sulle due monete, *X* è il numero di teste e *W* il numero di croci.'],
        [4.4, 'Hanno la stessa legge: 1/4, 1/2, 1/4. Da sole, nei calcoli, sono intercambiabili.'],
        [11, 'Ma in coppia no: (*X*, *X*) dà *X* + *X* = 2*X*, che vale 0, 2 o 4 con probabilità 1/4, 1/2, 1/4.'],
        [19, '(*X*, *W*) dà teste più croci: su due monete, sempre 2.'],
        [24.5, 'Stesse leggi, somme diverse: per descrivere la coppia serve la densità congiunta.'],
      ],
      frame: (t) => f0.variabile(Math.min(44.3 + t / 2.5, 58.3)),
    });

    /* 2.2 · leggeg: resta il termostato; le indicatrici diventano una clip a sé (2.9) */
    PV.add('indicatrici', {
      sec: '2.9',
      short: 'Le indicatrici',
      title: 'Le indicatrici: 1 se l’evento si verifica, 0 altrimenti',
      alt: 'Animazione: le indicatrici di due eventi su un dado, A = «esce pari» e B = «esce più di 4»: 1_A vale 1 sulle facce 2, 4, 6; il complementare è 1 − 1_A; il prodotto 1_A · 1_B vale 1 solo sulla faccia 6, ed è l’indicatrice dell’intersezione.',
      dur: 35.5,
      poster: 19,
      chap: [[0, 'Le indicatrici']],
      caps: [
        [0, 'La variabile più semplice è l’indicatrice di un evento: vale 1 se *A* si verifica e 0 altrimenti. Con un dado, *A* = «esce pari».'],
        [11, 'Si calcola come con i numeri: 1_A^c = 1 − 1_A, e il prodotto 1_A · 1_B = 1_{A∩B}, perché vale 1 solo se valgono 1 entrambe.'],
        [24, 'La densità di 1_A è *p*(1) = *P*(*A*) e *p*(0) = 1 − *P*(*A*). Con le indicatrici si conta quante volte succede qualcosa.'],
      ],
      frame: (t) => f0.leggeg(Math.min(26.55 + t / 1.3, 53.9)),
    });
    Object.assign(V.leggeg, {
      title: 'La legge di una funzione di X: il termostato',
      alt: 'Animazione: cinque errori di un termostato, ciascuno con probabilità 1/5, vengono elevati al quadrato: i blocchi di probabilità di −1 e +1 si sommano su Y = 1, quelli di −2 e +2 su Y = 4.',
      dur: 35.4,
      poster: 28,
      chap: [[0, 'Y = X²: le probabilità si sommano']],
      caps: [
        [0, 'Un termostato sbaglia la misura di −2, −1, 0, +1 o +2 gradi, e ciascun errore *X* ha probabilità 1/5.'],
        [8.4, 'Per giudicare la precisione si usa l’errore al quadrato, *Y* = *X*²: non tiene conto del segno.'],
        [15.4, 'Raccolgo per valori: −1 e +1 finiscono entrambi su *Y* = 1, −2 e +2 su *Y* = 4. Le loro probabilità si sommano.'],
        [28.7, 'Quindi *Y* vale 0 con probabilità 1/5, 1 con 2/5 e 4 con 2/5. Controllo: 1/5 + 2/5 + 2/5 = 1.'],
      ],
      frame: (t) => f0.leggeg(Math.min(t / 1.4, 25.2)),
    });

    /* 2.3 · condiz: resta la legge condizionale (2.5); la somma sulle diagonali dell'urna va in 2.4 */
    PV.add('sommaurna', {
      sec: '2.4',
      short: 'La somma sulle diagonali (urna)',
      title: 'Urna: la somma X + Y sulle diagonali',
      alt: 'Animazione: nella tabella dell’urna senza reimmissione, la somma X + Y, il numero di rosse fra le due estratte, si ottiene sommando le caselle di ogni diagonale: 3/10 per 0 rosse, 3/10 + 3/10 = 6/10 per 1 rossa, 1/10 per 2 rosse.',
      dur: 35.5,
      poster: 22,
      chap: [[0, 'La somma sulle diagonali']],
      caps: [
        [0, 'La somma *X* + *Y* è il numero di rosse fra le due estratte: si sommano le caselle di una diagonale.'],
        [9.8, '*X* + *Y* = 1 con *p*(0, 1) + *p*(1, 0) = 3/10 + 3/10 = 6/10; vale 0 con 3/10 e 2 con 1/10.'],
      ],
      frame: (t) => f0.condiz(Math.min(33.4 + t / 1.75, 53.8)),
    });
    Object.assign(V.condiz, {
      short: 'Legge condizionale',
      title: 'Urna: la legge condizionale',
      alt: 'Animazione: nella tabella dell’urna senza reimmissione, riscalando la colonna di Y = 1 per farla avere somma 1 si ottiene la legge di X sapendo Y = 1 (la prima rossa con probabilità 1/4); riscalando la colonna di Y = 0 si ottiene 1/2; le due leggi condizionali differiscono dalla marginale 4/10.',
      dur: 36.5,
      poster: 27.6,
      chap: [[0, 'La colonna riscalata']],
      caps: [
        [0, 'Se sai che *Y* ha assunto il valore *y*, la legge di *X* può cambiare. Urna con 2 rosse e 3 blu, due estrazioni senza reimmissione.'],
        [9.4, 'Sapendo che la seconda è rossa (*Y* = 1), riscalo la colonna di *Y* = 1 perché abbia somma 1: *p*(1 | 1) = (1/10)/(4/10) = 1/4.'],
        [19.1, 'Sapendo che la seconda è blu, la prima era rossa con probabilità *p*(1 | 0) = (3/10)/(6/10) = 1/2.'],
        [26.5, 'Tre valori diversi: 4/10, 1/4 e 1/2. Sapere com’è andata la seconda estrazione cambia ciò che sai della prima.'],
      ],
      frame: (t) => f0.condiz(Math.min(t / 1.15, 31.8)),
    });

    /* 2.7 · pietroburgo: via il rimando alla legge dei grandi numeri */
    Object.assign(V.pietroburgo, { dur: 40, caps: V.pietroburgo.caps.slice(0, 4) });

    /* 2.6 → 2.21 · geometrica: resta l'attesa del primo successo; la binomiale negativa è una clip a sé (2.22) */
    PV.add('negativa', {
      sec: '2.22',
      short: 'Binomiale negativa',
      title: 'Binomiale negativa: aspettare l’r-esimo successo (call center, p = 0,3, r = 3)',
      alt: 'Animazione: una serie di telefonate, con probabilità 0,3 di vendita ciascuna, fino alla terza vendita: le attese fra una vendita e la successiva, 2, 3 e 3 telefonate, sono geometriche indipendenti e in tutto sono 8. La probabilità che la terza vendita sia alla telefonata 8 è 21 · 0,3³ · 0,7⁵ ≈ 0,0953, e la media è r/p = 3/0,3 = 10 telefonate.',
      dur: 35,
      poster: 19,
      chap: [[0, 'Aspettare la terza vendita']],
      caps: [
        [0, 'Si aspetta l’*r*-esimo successo: con *r* = 3 e *p* = 0,3, un call center che cerca la terza vendita.'],
        [7.5, 'Le attese fra un successo e il successivo sono geometriche: *T*₁ = 2, *T*₂ = 3, *T*₃ = 3, in tutto 8.'],
        [13.4, '*X* = 8: la terza vendita arriva alla telefonata 8; nelle prime 7 ce ne sono 2, in 21 modi.'],
        [20, 'P(*X* = 8) = 21 · 0,3^3 · 0,7^5 ≈ 0,0953.'],
        [24.6, 'Media: somma di *r* attese geometriche, *E*[*X*] = *r*/*p* = 3/0,3 = 10 telefonate.'],
      ],
      frame: (t) => f0.geometrica(Math.min(45.8 + t / 2.8, 58.3)),
    });
    Object.assign(V.geometrica, {
      title: 'Geometrica: il dado fino al primo 6 e l’assenza di memoria',
      alt: 'Animazione: si lancia un dado fino al primo 6, con p = 1/6, e X è il numero di lanci. Il primo 6 al lancio k richiede k − 1 fallimenti e poi un successo: P(X = k) = (1 − p)^(k − 1) p, per k = 3 vale 5/6 · 5/6 · 1/6 = 25/216, circa 0,1157, e ogni barra è 5/6 della precedente. La coda è P(X > n) = (1 − p)^n, la media è 1/p = 6 e la varianza 30. Dopo 3 lanci falliti la parte rimasta, riscalata, coincide con la distribuzione di partenza: assenza di memoria.',
      dur: 44.6,
      chap: V.geometrica.chap.slice(0, 4),
      caps: V.geometrica.caps.slice(0, 8),
      frame: (t) => f0.geometrica(Math.min(t, 44.5)),
    });

    /* sezioni nuove */
    const SEC = { variabile: '2.1', leggeg: '2.2', ripartizione: '2.3', congiunta: '2.4', condiz: '2.5', indipv: '2.6', pietroburgo: '2.7', media: '2.7', tremodi: '2.7', attenzione: '2.7', funzionemedia: '2.8', guardaroba: '2.9', ruota12: '2.10', giochiequi: '2.10', varianza: '2.11', covarianza: '2.13', previsione: '2.16', binomiale: '2.19', geometrica: '2.21', ipergeometrica: '2.23', bin_poisson: '2.24', poisson: '2.24', riconoscere: '2.27', somme: '2.28', minmax: '2.29' };
    for (const id of Object.keys(SEC)) V[id].sec = SEC[id];
    void r1;
  })();

  /* ripasso della Parte 2: tutte le clip in ordine di testo (quelle di 2.5-2.7 stanno in pv-parte2.js, che si carica prima) */
  PV.seq('parte2', ['variabile', 'leggeg', 'ripartizione', 'congiunta', 'sommaurna', 'coppiadiversa', 'condiz', 'indipv', 'media', 'pietroburgo', 'tremodi', 'attenzione', 'funzionemedia', 'indicatrici', 'guardaroba', 'ruota12', 'giochiequi', 'varianza', 'covarianza', 'previsione', 'binomiale', 'geometrica', 'negativa', 'ipergeometrica', 'bin_poisson', 'poisson', 'riconoscere', 'somme', 'minmax'], {
    title: 'Ripasso della Parte 2',
    alt: 'Ripasso in video della Parte 2: le animazioni delle singole sezioni una dopo l’altra, ciascuna preceduta da un cartello con il titolo.',
  });
})();
