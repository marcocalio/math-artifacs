/* =========================================================================
   pv-parte3.js — video della Parte 3 (Modelli continui): sezioni 3.1, 3.2 e 3.7.
   Le altre sezioni stanno in pv-parte3b.js (3.3-3.4), pv-parte3c.js (3.5-3.6) e
   pv-parte3d.js (3.8-3.9); il ripasso 'parte3' è in pv-parte3z.js.
   Si appoggia a pv.js: ogni video è un PV.add(id, {...}).
   Tutti i tempi sono in secondi; le coordinate sono nel riquadro 640 × 360.
   ========================================================================= */
(function () {
  'use strict';
  const { lerp, E, p, arc, rnd, C, SANS, T, rect, circ, ell, ln, path, g, draw, tx, txc, lbl, tile, check, cross, vis, on, bump, heading, subline, lb, vl, fr, brace, vbrace, lbrace, wipe, pills } = PV.h;
  const OK = 'var(--verde)', NO = 'var(--rosso)';
  const nc = (v, d = 1) => v.toFixed(d).replace('.', ','); // numero con la virgola

  /* freccia da (x1,y1) a (x2,y2) che si disegna (u da 0 a 1); la punta compare a fine corsa */
  function arrow(x1, y1, x2, y2, u, col, op = 1, sw = 2.2) {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 8;
    let o = path(`M${x1} ${y1}L${x2} ${y2}`, { stroke: col, sw, op, ...draw(u) });
    if (u > 0.92) o += path(`M${x2} ${y2}L${x2 - h * Math.cos(a - 0.45)} ${y2 - h * Math.sin(a - 0.45)}M${x2} ${y2}L${x2 - h * Math.cos(a + 0.45)} ${y2 - h * Math.sin(a + 0.45)}`, { stroke: col, sw, lc: 'round', op });
    return o;
  }
  /* poligonale di una funzione fn su [a,b], con X(x) e Y(y) che portano a pixel */
  function curve(fn, a, b, X, Y, n = 80) {
    let d = '';
    for (let i = 0; i <= n; i++) {
      const x = lerp(a, b, i / n);
      d += (i ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(fn(x)).toFixed(1);
    }
    return d;
  }
  /* area sotto fn fra a e b, chiusa sulla quota base */
  const areaD = (fn, a, b, X, Y, base, n = 80) => curve(fn, a, b, X, Y, n) + `L${X(b).toFixed(1)} ${base}L${X(a).toFixed(1)} ${base}Z`;

  /* ======================================================================
     3.1 · Un numero a caso fra 0 e 1: probabilità sugli intervalli, non sui punti
     ====================================================================== */
  const NX = (x) => 70 + 500 * x; // posto del numero x ∈ [0,1] sulla retta
  /* la retta dei numeri con 0, 0,5 e 1; y = quota */
  function numline(y, op = 1) {
    let s = ln(NX(0), y, NX(1), y, { stroke: C.soft, sw: 2.4, op });
    for (const [v, lab] of [[0, '0'], [0.5, '0,5'], [1, '1']]) s += ln(NX(v), y - 6, NX(v), y + 6, { stroke: C.soft, sw: 2, op }) + tx(NX(v), y + 30, lab, { ff: SANS, size: 17, fill: C.soft, op });
    return s;
  }
  const dart = (x, y, op = 1) => g({ op }, ln(x, y - 46, x, y - 8, { stroke: C.B, sw: 3 }) + path(`M${x - 8} ${y - 18}L${x} ${y - 2}L${x + 8} ${y - 18}Z`, { fill: C.B, stroke: C.B, sw: 1, lj: 'round' }));

  PV.add('puntiintervalli', {
    sec: '3.1',
    short: 'Probabilità sugli intervalli',
    title: 'Un numero a caso fra 0 e 1: la probabilità sta sugli intervalli, non sui punti',
    alt: 'Animazione: su un segmento da 0 a 1 compaiono sempre più valori, ciascuno con probabilità 0,001, e la probabilità totale supera 1: quindi ogni singolo punto ha probabilità zero; la probabilità sta negli intervalli (0,4-0,6 vale 0,2) e un intervallo che si stringe attorno a 0,5 ha probabilità che tende a zero; una freccetta si pianta comunque da qualche parte; infine la densità come probabilità per unità di lunghezza.',
    dur: 64,
    poster: 31,
    chap: [[0, 'Nessun punto è favorito'], [27, 'La probabilità sta negli intervalli'], [41, 'Zero non vuol dire impossibile'], [51, 'La densità']],
    caps: [
      [0, 'Scelgo un numero a caso fra 0 e 1, senza favorire nessuna zona: è ciò che fa random(). Quanto vale la probabilità che esca esattamente 0,5?'],
      [9, 'Se nessun valore è favorito, tutti hanno la stessa probabilità *ε*. Con *ε* = 0,001, mille valori pesano già 1 in tutto…'],
      [17.6, '…e duemila valori pesano 2: troppo. Fra 0 e 1 i valori sono infiniti, quindi *ε* non può essere positivo: *P*(*X* = *x*) = 0 per ogni *x*.'],
      [27, 'La probabilità non sta sui punti ma sugli intervalli: *P*(0,4 < *X* < 0,6) = 0,2, cioè la lunghezza dell’intervallo.'],
      [34, 'Se stringo l’intervallo attorno a 0,5, la probabilità scende a 0,1, a 0,01, a 0,001… e in un punto solo è zero.'],
      [41, 'Probabilità zero non vuol dire impossibile: la freccetta si pianta comunque da qualche parte. Ma centrare un punto fissato prima ha probabilità 0.'],
      [51, 'Come per le lunghezze: ogni punto misura zero, ma il segmento misura 1.'],
      [56, 'Per descrivere la legge serve la densità: la probabilità di un intervallino d*x* è circa *f*(*x*) d*x*, e per un intervallo si somma.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 26.7, 'Un numero a caso fra 0 e 1', '*X* = random(): nessuna zona è favorita') + heading(t, 27.3, 40.7, 'La probabilità sta negli intervalli', 'si misura con la lunghezza') + heading(t, 41.3, 50.8, 'Probabilità zero non vuol dire impossibile') + heading(t, 51.2, 64.4, 'La legge si descrive con la densità', 'probabilità per unità di lunghezza');

      /* capitolo 1: quanti valori possono pesare ε? */
      const c1 = vis(t, 0.3, 26.8, 0.6, 0.7);
      if (c1 > 0.004) {
        const y = 178;
        o += numline(y, c1);
        const q = p(t, 2.4, 3.2, E.back) * c1 * (1 - p(t, 8.6, 9.2));
        o += on(q, g({ op: q, tf: T(NX(0.5), y, 0.6 + 0.4 * q) }, circ(0, 0, 8, { fill: C.hi, stroke: C.ink, sw: 2 })) + tx(NX(0.5), y - 36, '*P*(*X* = 0,5) = ?', { size: 26, op: q }));
        const ee = p(t, 9.4, 10.2) * c1 * (1 - p(t, 21.3, 22));
        o += on(ee, tx(320, 142, 'ogni valore pesa *ε* = 0,001', { size: 26, op: ee }));
        /* i valori che si infittiscono: 10, 100, 1000, 2000 */
        const st = [[10.5, 13.5, 10, 0.01], [13.5, 16, 100, 0.1], [16, 18, 1000, 1], [18, 21.6, 2000, 2]];
        let vNow = 0;
        st.forEach(([t0, , , v], k) => {
          const u = p(t, t0, t0 + 1);
          if (u > 0) vNow = lerp(k ? st[k - 1][3] : 0, v, u);
        });
        const fadeAll = c1 * (1 - p(t, 21.3, 22));
        st.forEach(([t0, , n], k) => {
          const f = p(t, t0, t0 + 0.6) * fadeAll * (k < st.length - 1 ? 1 - p(t, st[k + 1][0] + 0.1, st[k + 1][0] + 0.7) : 1);
          if (f <= 0.004) return;
          if (n === 10) for (let i = 0; i < 10; i++) o += circ(NX((i + 0.5) / 10), y, 5.5, { fill: C.A, op: f * p(t, 10.5 + i * 0.1, 11 + i * 0.1) });
          else if (n === 100) o += ln(NX(0.005), y, NX(0.995), y, { stroke: C.A, sw: 5, lc: 'round', da: '0 5', op: f });
          else o += ln(NX(0), y, NX(1), y, { stroke: C.A, sw: n === 1000 ? 4.5 : 7, op: f });
          const tg = n + ' valori: ' + n + ' · 0,001 = ' + (n === 10 ? '0,01' : n === 100 ? '0,1' : n === 1000 ? '1' : '2');
          o += tx(320, 236, tg, { size: 24, op: f });
        });
        /* il misuratore della probabilità totale, da 0 a 2 */
        const m = fadeAll * p(t, 10.5, 11.3);
        if (m > 0.004) o += g({ op: m }, rect(70, 262, 500, 20, { rx: 4, stroke: C.soft, sw: 1.6 }) + rect(70, 262, Math.min(vNow, 1) * 250, 20, { rx: 4, fill: C.A, fo: 0.85 }) + (vNow > 1 ? rect(320, 262, (vNow - 1) * 250, 20, { fill: NO, fo: 0.9 }) : '') + ln(320, 254, 320, 292, { stroke: C.hi, sw: 3 }) + tx(70, 310, '0', { ff: SANS, size: 17, fill: C.soft }) + tx(320, 310, '1', { ff: SANS, size: 20, fill: C.hi, fw: 700 }) + tx(570, 310, '2', { ff: SANS, size: 17, fill: C.soft }) + tx(450, 310, 'probabilità totale', { ff: SANS, size: 17, fill: C.soft }));
        const p1 = p(t, 19, 19.8) * c1 * (1 - p(t, 21.3, 22)), p2 = p(t, 22.2, 23) * c1;
        o += on(p1, pills(342, [{ s: 'con abbastanza valori si supera 1', icon: 'no', col: NO, op: p1, u: p(t, 19.3, 20, E.lin) }]));
        o += on(p2, pills(300, [{ s: '*ε* = 0:  *P*(*X* = *x*) = 0 per ogni *x*', icon: 'ok', col: OK, op: p2, u: p(t, 22.5, 23.2, E.lin) }]));
      }

      /* capitolo 2: la probabilità di un intervallo è la sua lunghezza */
      const c2 = vis(t, 27.3, 40.7, 0.6, 0.6);
      if (c2 > 0.004) {
        const y = 210;
        o += numline(y, c2);
        const a = p(t, 27.8, 28.8);
        const w = 0.2 - 0.1 * p(t, 34.2, 35.4, E.io) - 0.09 * p(t, 35.6, 36.8, E.io) - 0.009 * p(t, 37, 38.2, E.io) - 0.001 * p(t, 38.4, 39.6, E.io);
        const x0 = NX(0.5 - w / 2), ww = Math.max(w * 500, 1.2);
        o += on(a, rect(x0, y - 40, ww * a, 40, { fill: C.A, fo: 0.38, stroke: C.A, sw: 2, so: c2, op: c2 }));
        const lab = t < 35.4 ? ['0,2', '0,2'] : t < 36.8 ? ['0,1', '0,1'] : t < 38.2 ? ['0,01', '0,01'] : t < 39.6 ? ['0,001', '0,001'] : ['0', '0'];
        if (t < 33.8) o += on(a, tx(NX(0.4), y + 58, '0,4', { ff: SANS, size: 17, fill: C.soft, op: c2 * a }) + tx(NX(0.6), y + 58, '0,6', { ff: SANS, size: 17, fill: C.soft, op: c2 * a }) + ln(NX(0.4), y + 14, NX(0.4), y + 40, { stroke: C.soft, sw: 1.4, op: c2 * a }) + ln(NX(0.6), y + 14, NX(0.6), y + 40, { stroke: C.soft, sw: 1.4, op: c2 * a }));
        const e = p(t, 29.6, 30.4) * c2;
        o += on(e * (t < 33.8 ? 1 : 0), tx(320, 140, '*P*(0,4 < *X* < 0,6) = 0,2', { size: 28, op: e }));
        const sh = p(t, 33.8, 34.6) * c2;
        o += on(sh, tx(320, 140, 'larghezza ' + lab[0] + ':  *P* = ' + lab[1], { size: 28, op: sh }));
        const dot = p(t, 39.4, 39.9) * c2;
        o += on(dot, circ(NX(0.5), y, 6.5, { fill: C.hi, stroke: C.ink, sw: 2, op: dot }));
        const pe = p(t, 39.6, 40.3) * c2;
        o += on(pe, pills(318, [{ s: '*P*(*X* = 0,5) = 0: un punto non ha larghezza', op: pe }]));
      }

      /* capitolo 3: la freccetta */
      const c3 = vis(t, 41.3, 50.8, 0.6, 0.7);
      if (c3 > 0.004) {
        const y = 215;
        o += numline(y, c3);
        /* freccetta 1: si pianta in 0,372 */
        const d1 = E.acc(p(t, 42.2, 43.8, E.lin)), x1 = NX(0.372);
        o += g({ op: c3 * p(t, 42, 42.4) }, dart(x1, lerp(130, y, d1)));
        const l1 = p(t, 43.8, 44.6) * c3;
        o += on(l1, circ(x1, y, 5, { fill: C.hi, stroke: C.ink, sw: 1.8, op: l1 }) + tx(x1, y - 62, 'esce 0,3718…', { size: 24, op: l1 }));
        /* il punto scelto prima */
        const r1 = p(t, 46.2, 47) * c3;
        o += on(r1, circ(NX(0.5), y, 12, { stroke: C.B, sw: 3, op: r1 }) + tx(NX(0.5), y + 58, 'punto fissato prima', { ff: SANS, size: 17, fill: C.B, op: r1 }));
        const d2 = E.acc(p(t, 47.4, 48.8, E.lin)), x2 = NX(0.5) + 17;
        o += g({ op: c3 * p(t, 47.2, 47.6) }, dart(x2, lerp(130, y, d2)));
        const l2 = p(t, 48.8, 49.6) * c3;
        o += on(l2, cross(x2 + 22, y - 62, 26, p(t, 48.9, 49.5, E.lin), { op: l2 }) + tx(NX(0.5) + 150, y - 55, '*P*(centrarlo) = 0', { size: 22, fill: NO, op: l2 }));
      }

      /* capitolo 4: lunghezza e densità */
      const c4 = vis(t, 51.2, 64.4, 0.6, 0.01);
      if (c4 > 0.004) {
        const yb = 244, hh = 80;
        o += numline(yb, c4);
        const pd = p(t, 51.8, 52.8) * c4 * (1 - p(t, 55.8, 56.4));
        o += on(pd, ln(NX(0.01), yb, NX(0.99), yb, { stroke: C.A, sw: 5, lc: 'round', da: '0 7', op: pd }));
        const z = p(t, 52.8, 53.6) * c4 * (1 - p(t, 55.8, 56.4));
        o += on(z, tx(NX(0.5), yb - 72, 'ogni punto: lunghezza 0', { size: 24, op: z }) + arrow(NX(0.5), yb - 52, NX(0.5), yb - 12, p(t, 53, 53.8, E.lin), C.soft, z));
        const bl = p(t, 54, 54.8) * c4 * (1 - p(t, 55.8, 56.4));
        o += on(bl, brace(NX(0), NX(1), yb + 46, C.A, bl) + tx(NX(0.5), yb + 80, 'il segmento: lunghezza 1', { size: 24, fill: C.A, op: bl }));
        /* la densità f = 1 sul segmento */
        const u = p(t, 56, 57.2);
        o += on(u, rect(NX(0), yb - hh * u, 500, hh * u, { fill: C.A, fo: 0.2, stroke: C.A, sw: 2, op: c4 }));
        const fl = p(t, 57.2, 57.9) * c4;
        o += on(fl, tx(NX(0) + 36, yb - hh - 10, '*f*(*x*) = 1', { size: 22, fill: C.A, op: fl }));
        const sl = p(t, 58.4, 59.2) * c4;
        o += on(sl, rect(NX(0.3), yb - hh, 9, hh, { fill: C.hi, fo: 0.95, op: sl }) + tx(NX(0.3) + 4, yb + 52, 'd*x*', { size: 22, fill: C.soft, op: sl }) + path(`M${NX(0.3) - 3} ${yb - hh - 30}L${NX(0.3) + 5} ${yb - hh - 4}`, { stroke: C.hi, sw: 2.2, op: sl }) + tx(NX(0.3) + 70, yb - hh - 40, '*f*(*x*) · d*x*', { size: 24, fill: C.ink, op: sl }));
        const sm = p(t, 60.6, 61.4) * c4;
        o += on(sm, rect(NX(0.4), yb - hh, 100, hh, { fill: C.hi, fo: 0.45 * sm, stroke: C.hi, sw: 2, so: sm }) + tx(NX(0.5), yb - hh / 2 + 8, '0,2', { size: 26, op: sm }));
        const fn = p(t, 62, 62.8) * c4;
        o += on(fn, pills(336, [{ s: 'somma di tanti intervallini = integrale (3.2)', op: fn }]));
      }
      return o;
    },
  });

  /* ======================================================================
     3.1 · Atomi: discreta, continua, mista
     ====================================================================== */
  const BAR = (x, y, w, h, col, op = 1, a = {}) => rect(x, y, w, h, { rx: 3, fill: col, fo: 0.85, op, ...a });

  PV.add('mista', {
    sec: '3.1',
    short: 'Atomi: discreta, continua, mista',
    title: 'Gli atomi di una variabile: discreta, continua, mista',
    alt: 'Animazione: i valori con probabilità almeno 1/4 sono al più quattro e quelli con almeno 1/10 al più dieci, perché una barra di probabilità totale 1 non può contenerne di più; gli atomi sono un’unione numerabile di insiemi finiti. Poi tre situazioni: discreta, continua e mista; infine l’esempio misto della chiamata che cade dopo 6 minuti, in cui la probabilità 0,4 della coda si raccoglie su un punto.',
    dur: 60,
    poster: 52,
    chap: [[0, 'Gli atomi sono pochi'], [21, 'Tre situazioni'], [39, 'Un esempio misto']],
    caps: [
      [0, 'Gli atomi sono i valori *x* con *P*(*X* = *x*) > 0. Sono pochi: la probabilità totale è una barra lunga 1.'],
      [6, 'I valori con probabilità almeno 1/4 sono al più quattro: il quinto sforerebbe la barra.'],
      [11, 'Quelli con almeno 1/10 sono al più dieci, e per ogni *n*: al più *n* valori con *P* ≥ 1/*n*.'],
      [16.4, 'Gli atomi sono l’unione di questi insiemi finiti, quindi sono numerabili.'],
      [21, 'Quindi ci sono tre situazioni. Variabili discrete: tutta la probabilità sta sui punti, gli atomi pesano 1 in tutto.'],
      [28, 'Variabili continue, cioè con densità: nessun atomo, *P*(*X* = *x*) = 0 per ogni *x*.'],
      [33, 'In mezzo le variabili miste: un po’ di probabilità sui punti, il resto distribuito lungo un intervallo.'],
      [39, 'Esempio: l’attesa *X* è uniforme fra 0 e 10 minuti, ma dopo 6 minuti la linea cade. Il tempo passato è *Y* = min(*X*, 6).'],
      [47, 'La coda oltre 6, che pesa *P*(*X* ≥ 6) = 4/10, si raccoglie tutta sul punto 6: un atomo, *P*(*Y* = 6) = 0,4.'],
      [54, 'Il resto, 0,6, resta distribuito fra 0 e 6 senza atomi: *Y* non è né discreta né continua, è mista.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 20.8, 'Gli atomi sono pochi', 'valori con *P*(*X* = *x*) > 0') + heading(t, 21.4, 38.6, 'Tre situazioni', 'dove sta la probabilità?') + heading(t, 39.2, 60.4, 'Un esempio misto', '*Y* = min(*X*, 6) con *X* uniforme in [0, 10]');

      /* capitolo 1: una barra lunga 1 non contiene più di n blocchi da almeno 1/n */
      const c1 = vis(t, 0.4, 20.8, 0.6, 0.6);
      if (c1 > 0.004) {
        const bx = 70, bw = 400; // la barra della probabilità 1: 400 unità
        const bar = (y, lab, op) => g({ op }, rect(bx, y, bw, 34, { rx: 4, stroke: C.soft, sw: 1.8 }) + tx(bx, y - 8, lab, { ff: SANS, size: 17, fill: C.soft, ta: 'start' }));
        const bb = p(t, 0.8, 1.6);
        o += on(bb, bar(112, 'probabilità totale = 1', c1 * bb));
        /* riga 1: 4 blocchi da 1/4, il quinto non ci sta */
        for (let i = 0; i < 4; i++) {
          const u = p(t, 2.2 + i * 0.5, 2.9 + i * 0.5, E.back);
          o += on(u, g({ op: c1 * Math.min(u, 1), tf: T(bx + i * 100 + 50, 129, 0.5 + 0.5 * u) }, rect(-47, -15, 94, 30, { rx: 4, fill: C.A, fo: 0.8 }) + tx(0, 6, '1/4', { ff: SANS, size: 17, fill: C.paper })));
        }
        const f5 = p(t, 5.4, 6.2, E.back);
        o += on(f5, g({ op: c1 * Math.min(f5, 1), tf: T(bx + 4 * 100 + 50, 129, 0.5 + 0.5 * f5) }, rect(-47, -15, 94, 30, { rx: 4, fill: NO, fo: 0.35, stroke: NO, sw: 2 })) + cross(bx + 4 * 100 + 50, 129, 22, p(t, 6.2, 6.8, E.lin), { op: c1 }));
        const l1 = p(t, 6.6, 7.4) * c1;
        o += on(l1, tx(bx + 200, 176, 'al più 4 valori con *P* ≥ 1/4', { size: 22, op: l1 }));
        /* riga 2: 10 blocchi da 1/10 */
        const b2 = p(t, 10.4, 11.2);
        o += on(b2, bar(206, 'probabilità totale = 1', c1 * b2));
        for (let i = 0; i < 10; i++) {
          const u = p(t, 11.4 + i * 0.17, 11.9 + i * 0.17, E.back);
          o += on(u, g({ op: c1 * Math.min(u, 1), tf: T(bx + i * 40 + 20, 223, 0.5 + 0.5 * u) }, rect(-18, -15, 36, 30, { rx: 3, fill: C.B, fo: 0.8 })));
        }
        const f11 = p(t, 13.6, 14.4, E.back);
        o += on(f11, g({ op: c1 * Math.min(f11, 1), tf: T(bx + 10 * 40 + 20, 223, 0.5 + 0.5 * f11) }, rect(-18, -15, 36, 30, { rx: 3, fill: NO, fo: 0.35, stroke: NO, sw: 2 })) + cross(bx + 10 * 40 + 20, 223, 18, p(t, 14.4, 15, E.lin), { op: c1 }));
        const l2 = p(t, 14.6, 15.4) * c1;
        o += on(l2, tx(bx + 200, 270, 'al più 10 con *P* ≥ 1/10', { size: 22, op: l2 }));
        const un = p(t, 17.2, 18) * c1;
        o += on(un, pills(322, [{ s: 'atomi = unione numerabile di insiemi finiti = numerabile', op: un }]));
      }

      /* capitolo 2: discreta, continua, mista */
      const c2 = vis(t, 21.4, 38.6, 0.6, 0.6);
      if (c2 > 0.004) {
        const pan = (cx, k, t0, title, sub) => {
          const u = p(t, t0, t0 + 0.8) * c2;
          if (u <= 0.004) return '';
          let r = rect(cx - 92, 100, 184, 176, { rx: 8, fill: C.paper, stroke: C.line, sw: 1.6, op: u });
          r += ln(cx - 80, 240, cx + 80, 240, { stroke: C.soft, sw: 1.8, op: u });
          const disc = (op) => [[-60, 70], [-30, 30], [0, 54], [30, 40], [60, 20]].map(([dx, h], i) => ln(cx + dx, 240, cx + dx, 240 - h * p(t, t0 + 0.3 + i * 0.12, t0 + 0.9 + i * 0.12), { stroke: C.A, sw: 5, lc: 'round', op }) + circ(cx + dx, 240 - h * p(t, t0 + 0.3 + i * 0.12, t0 + 0.9 + i * 0.12), 5, { fill: C.A, op })).join('');
          const cont = (op, c) => path(curve((x) => Math.exp(-((x - 0) ** 2) / 1.1) * 0.9 + 0.1 * Math.exp(-((x - 1.5) ** 2)), -1.8, 1.8, (x) => cx + x * 44, (y) => 240 - y * 90 * p(t, t0 + 0.3, t0 + 1.4)), { stroke: c, sw: 2.6, op }) + path(areaD((x) => Math.exp(-(x ** 2) / 1.1) * 0.9 + 0.1 * Math.exp(-((x - 1.5) ** 2)), -1.8, 1.8, (x) => cx + x * 44, (y) => 240 - y * 90 * p(t, t0 + 0.3, t0 + 1.4), 240), { fill: c, fo: 0.2, op });
          if (k === 0) r += disc(u);
          if (k === 1) r += cont(u, C.B);
          if (k === 2) r += [[-62, 60], [-14, 36], [50, 50]].map(([dx, h], i) => ln(cx + dx, 240, cx + dx, 240 - h * p(t, t0 + 0.3 + i * 0.15, t0 + 0.9 + i * 0.15), { stroke: C.A, sw: 5, lc: 'round', op: u }) + circ(cx + dx, 240 - h * p(t, t0 + 0.3 + i * 0.15, t0 + 0.9 + i * 0.15), 5, { fill: C.A, op: u })).join('') + cont(u * 0.9, C.B);
          return r + tx(cx, 130, title, { size: 22, op: u }) + tx(cx, 264, sub, { ff: SANS, size: 17, fill: C.soft, op: u });
        };
        o += pan(130, 0, 22, 'discreta', 'solo atomi');
        o += pan(320, 1, 28, 'continua', 'nessun atomo');
        o += pan(510, 2, 33.4, 'mista', 'atomi e densità');
        const pl = p(t, 36, 36.8) * c2;
        o += on(pl, pills(318, [{ s: 'discreta: punti · continua: densità · mista: entrambi', op: pl }]));
      }

      /* capitolo 3: Y = min(X, 6), con X uniforme in [0, 10] */
      const c3 = vis(t, 39.2, 60.4, 0.6, 0.01);
      if (c3 > 0.004) {
        const yb = 270, hh = 90, X = (m) => 70 + 50 * m;
        o += ln(X(0), yb, X(10), yb, { stroke: C.soft, sw: 2.2, op: c3 });
        for (const m of [0, 2, 4, 6, 8, 10]) o += ln(X(m), yb - 5, X(m), yb + 5, { stroke: C.soft, sw: 1.8, op: c3 }) + tx(X(m), yb + 30, m, { ff: SANS, size: 17, fill: C.soft, op: c3 });
        o += tx(X(10) + 22, yb + 30, 'min', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: c3 });
        const u0 = p(t, 40.2, 41.4);
        const col = p(t, 44, 45); // la coda diventa arancio
        const tail = 1 - p(t, 47, 50.4, E.io); // la coda si raccoglie sul punto 6
        o += on(u0, rect(X(0), yb - hh * u0, 300, hh * u0, { fill: C.A, fo: 0.3, stroke: C.A, sw: 2, op: c3 }));
        if (tail > 0.003) o += rect(X(6), yb - hh * u0, 200 * tail, hh * u0, { fill: C.B, fo: 0.2 + 0.5 * col, stroke: C.B, sw: 2, so: col, op: c3 });
        o += on(u0, tx(X(3), yb - hh - 10, '*f*(*x*) = 1/10', { size: 22, fill: C.A, op: c3 * u0 }));
        const lt = p(t, 44.4, 45.2) * c3 * (1 - p(t, 47, 47.8));
        o += on(lt, tx(X(8), yb - hh - 10, '*P*(*X* ≥ 6) = 4/10', { size: 22, fill: C.B, op: lt }));
        /* l'atomo in 6 */
        const at = p(t, 49.4, 50.6, E.back);
        o += on(at, g({ op: c3 }, ln(X(6), yb, X(6), yb - 120 * at, { stroke: C.B, sw: 6, lc: 'round' }) + circ(X(6), yb - 120 * at, 8, { fill: C.B })));
        const al = p(t, 50.6, 51.4) * c3;
        o += on(al, tx(X(6) + 20, yb - 134, 'atomo:', { size: 24, fill: C.B, ta: 'start', op: al }) + tx(X(6) + 20, yb - 106, '*P*(*Y* = 6) = 0,4', { size: 24, fill: C.B, ta: 'start', op: al }));
        const rs = p(t, 54.2, 55) * c3;
        o += on(rs, tx(X(3), yb - 40, '0,6 distribuito su [0, 6]', { size: 22, fill: C.A, op: rs }));
        const mi = p(t, 56, 56.8) * c3;
        o += on(mi, pills(322, [{ s: '*Y* non è né discreta né continua: è mista', op: mi }]));
      }
      return o;
    },
  });

  /* ======================================================================
     3.2 · L'integrale è un'area (rettangolini, area con segno, additività)
     ====================================================================== */
  const AX = (x) => 90 + 340 * x, AY = (y) => 290 - 190 * y; // x² su [0,1]
  const sq = (x) => x * x;
  const riemann = (n) => { let s = 0; for (let i = 1; i <= n; i++) s += sq(i / n) / n; return s; };

  PV.add('area', {
    sec: '3.2',
    short: 'L’integrale è un’area',
    title: 'L’integrale come area: rettangolini sempre più stretti, area con segno, additività',
    alt: 'Animazione: l’area sotto x² fra 0 e 1 viene approssimata con 4, 8, 16 e 64 rettangoli, la cui somma scende verso 1/3; poi la funzione x fra −1 e 1, con i due triangoli di area +1/2 e −1/2 che si cancellano; infine l’area di x² spezzata in due pezzi, 1/24 e 7/24, che sommati danno 1/3.',
    dur: 57,
    poster: 18.2,
    chap: [[0, 'Rettangolini che si stringono'], [27.4, 'Area con segno'], [42.3, 'Si può spezzare']],
    caps: [
      [0, 'L’integrale di *f* fra *a* e *b* è l’area fra il grafico e l’asse. Prendo *f*(*x*) = *x*² fra 0 e 1.'],
      [6, 'Approssimo l’area con rettangolini di base d*x* e altezza *f*(*x*): con 4 rettangoli la somma vale 0,469.'],
      [13, 'Con 8 rettangoli è 0,398, con 16 è 0,365, con 64 è 0,341: più sono stretti, meglio la somma si avvicina all’area.'],
      [20.4, 'Al limite la somma diventa l’area esatta, 1/3. Il simbolo ∫ è una S allungata, da «somma».'],
      [27.4, 'Se *f* prende anche valori negativi, la parte sotto l’asse conta come area negativa: è l’area con segno.'],
      [34.4, 'Con *f*(*x*) = *x* fra −1 e 1, il triangolo a destra vale +1/2 e quello a sinistra −1/2: si cancellano, l’integrale è 0.'],
      [42.3, 'Un integrale si può spezzare: l’area da *a* a *c* è l’area da *a* a *b* più quella da *b* a *c*.'],
      [49.2, 'Per *x*² fra 0 e 1, tagliando a metà: 1/24 + 7/24 = 8/24 = 1/3. Serve per le funzioni definite a pezzi.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 26.9, 'L’integrale è un’area', 'somma di rettangolini sempre più stretti') + heading(t, 27.5, 41.9, 'Area con segno', 'la parte sotto l’asse conta come negativa') + heading(t, 42.4, 57.4, 'Un integrale si può spezzare', 'additività sugli intervalli');
      const axes1 = (op) => g({ op }, ln(70, 290, 450, 290, { stroke: C.soft, sw: 1.8 }) + ln(90, 290, 90, 100, { stroke: C.soft, sw: 1.8 }) + tx(AX(0), 316, '0', { ff: SANS, size: 17, fill: C.soft }) + tx(AX(1), 316, '1', { ff: SANS, size: 17, fill: C.soft }) + tx(78, AY(1) + 6, '1', { ff: SANS, size: 17, fill: C.soft, ta: 'end' }));

      /* capitolo 1: i rettangoli */
      const c1 = vis(t, 0.4, 27, 0.6, 0.6);
      if (c1 > 0.004) {
        o += axes1(c1);
        o += path(curve(sq, 0, 1, AX, AY, 60), { stroke: C.ink, sw: 2.8, op: c1, ...draw(p(t, 0.8, 3, E.lin)) });
        o += on(p(t, 2.6, 3.4) * c1, tx(AX(0.12), AY(0.9), '*f*(*x*) = *x*²', { size: 22, ta: 'start', op: p(t, 2.6, 3.4) * c1 }));
        const ST = [[6.6, 4], [13, 8], [16, 16], [18.4, 64]];
        ST.forEach(([t0, n], k) => {
          const last = k === ST.length - 1;
          const f = p(t, t0, t0 + 0.6) * (last ? 1 - p(t, 21.2, 22) : 1 - p(t, ST[k + 1][0], ST[k + 1][0] + 0.6)) * c1;
          if (f <= 0.004) return;
          for (let i = 0; i < n; i++) {
            const gr = n === 4 ? p(t, t0 + i * 0.5, t0 + 0.7 + i * 0.5) : 1, h = 190 * sq((i + 1) / n) * gr;
            o += rect(AX(i / n), 290 - h, 340 / n, h, { fill: C.A, fo: 0.3, stroke: C.A, sw: n >= 64 ? 0.7 : 1.6, op: f });
          }
          o += tx(548, 150, 'n = ' + n, { size: 28, op: f }) + tx(548, 190, 'somma =', { size: 22, fill: C.soft, op: f }) + tx(548, 222, nc(riemann(n), 3), { size: 28, fill: C.A, op: f });
        });
        const ex = p(t, 21.2, 22.2) * c1;
        o += on(ex, path(areaD(sq, 0, 1, AX, AY, 290, 60), { fill: C.A, fo: 0.4, op: ex }) + path(curve(sq, 0, 1, AX, AY, 60), { stroke: C.ink, sw: 2.8, op: ex }) + tx(548, 160, 'area esatta', { size: 22, fill: C.soft, op: ex }) + tx(548, 205, '1/3', { size: 36, fill: C.A, op: ex }));
        const pl = p(t, 23.4, 24.2) * c1;
        o += on(pl, pills(338, [{ s: '∫_0^1 *x*^2 d*x* = 1/3', op: pl }]));
      }

      /* capitolo 2: area con segno, f(x) = x fra −1 e 1 */
      const c2 = vis(t, 27.5, 41.9, 0.6, 0.6);
      if (c2 > 0.004) {
        const X = (x) => 320 + 190 * x, Y = (y) => 220 - 100 * y;
        o += g({ op: c2 }, ln(110, 220, 530, 220, { stroke: C.soft, sw: 1.8 }) + tx(X(-1), 246, '−1', { ff: SANS, size: 17, fill: C.soft }) + tx(X(0), 246, '0', { ff: SANS, size: 17, fill: C.soft }) + tx(X(1), 246, '1', { ff: SANS, size: 17, fill: C.soft }));
        const ur = p(t, 29.4, 31.6, E.io), ul = p(t, 31.8, 34, E.io);
        o += on(ur, path(areaD((x) => x, 0, ur, X, Y, 220, 40), { fill: C.A, fo: 0.4, op: c2 }));
        o += on(ul, path(`M${X(0)} 220L${X(-ul)} 220L${X(-ul)} ${Y(-ul)}Z`, { fill: C.B, fo: 0.4, op: c2 }));
        o += path(`M${X(-1)} ${Y(-1)}L${X(1)} ${Y(1)}`, { stroke: C.ink, sw: 2.8, op: c2, ...draw(p(t, 28, 29.4, E.lin)) });
        o += on(p(t, 28.8, 29.4) * c2, tx(X(1) - 12, Y(1) - 10, '*f*(*x*) = *x*', { size: 20, ta: 'end', op: p(t, 28.8, 29.4) * c2 }));
        const ar = p(t, 31.6, 32.4) * c2, al = p(t, 34, 34.8) * c2;
        o += on(ar, tx(X(0.62), Y(0.28) + 8, '+1/2', { size: 26, fill: C.A, op: ar }));
        o += on(al, tx(X(-0.62), Y(-0.28) + 8, '−1/2', { size: 26, fill: C.B, op: al }));
        const sm = p(t, 36.4, 37.2) * c2;
        o += on(sm, txc(320, 150, [['+1/2', C.A], [' − 1/2 = ', C.ink], ['0', OK]], { size: 32, op: sm }));
        const pl = p(t, 38.6, 39.4) * c2;
        o += on(pl, pills(326, [{ s: '∫_{−1}^{1} *x* d*x* = 0', op: pl }]));
      }

      /* capitolo 3: additività, x² tagliata a metà */
      const c3 = vis(t, 42.4, 57.4, 0.6, 0.01);
      if (c3 > 0.004) {
        o += axes1(c3);
        o += tx(AX(0.5), 316, '', { op: 0 });
        const cut = AX(0.5), a1 = p(t, 43.6, 45.4), a2 = p(t, 45.6, 47.4);
        o += on(a1, path(areaD(sq, 0, 0.5, AX, AY, 290, 40), { fill: C.A, fo: 0.4 * a1, op: c3 }));
        o += on(a2, path(areaD(sq, 0.5, 1, AX, AY, 290, 40), { fill: C.B, fo: 0.4 * a2, op: c3 }));
        o += path(curve(sq, 0, 1, AX, AY, 60), { stroke: C.ink, sw: 2.8, op: c3 });
        const cl = p(t, 44.2, 45) * c3;
        o += on(cl, ln(cut, 290, cut, AY(0.25) - 30, { stroke: C.hi, sw: 3, da: '5 4', op: cl }) + tx(cut, 336, '*b* = 1/2', { size: 20, fill: C.hi, op: cl }));
        const l1 = p(t, 49.6, 50.4) * c3, l2 = p(t, 51, 51.8) * c3, l3 = p(t, 53, 53.8) * c3;
        o += on(l1, tx(AX(0.25), 262, '1/24', { size: 22, fill: C.A, op: l1 }));
        o += on(l2, tx(AX(0.78), 262, '7/24', { size: 26, fill: C.B, op: l2 }));
        o += on(l3, txc(548, 180, [['1/24', C.A], [' + ', C.ink], ['7/24', C.B]], { size: 22, op: l3 }) + tx(548, 214, '= 1/3', { size: 30, fill: OK, op: l3 }));
      }
      return o;
    },
  });

  /* ======================================================================
     3.2 · Derivata, primitiva, teorema fondamentale e tabella degli integrali
     ====================================================================== */
  const PLX = (x) => 80 + 230 * x, PLY = (y) => 290 - 150 * y; // F(x) = x²
  const PRX = (x) => 380 + 230 * x, PRY = (y) => 290 - 75 * y; // f(x) = 2x

  PV.add('primitiva', {
    sec: '3.2',
    short: 'Derivata e primitiva',
    title: 'Derivata, primitiva e teorema fondamentale: l’area è F(b) − F(a)',
    alt: 'Animazione: la tangente a F(x) = x² scorre lungo la curva e la sua pendenza coincide con l’altezza di f(x) = 2x, quindi F è una primitiva di f; poi l’area sotto f fra a e b viene confrontata con la differenza F(b) − F(a), e con a = 0 e b = 1 è un triangolo di area 1; infine la tabella delle primitive di una costante, di x, di x^n e dell’esponenziale.',
    dur: 56,
    poster: 32,
    chap: [[0, 'Pendenza e primitiva'], [17, 'L’area è F(b) − F(a)'], [35.4, 'La tabella']],
    caps: [
      [0, 'La derivata di una funzione *F* è la sua pendenza in ogni punto. Per *F*(*x*) = *x*² la pendenza è 2*x*: cresce verso destra.'],
      [8.6, 'Se *F*′ = *f*, si dice che *F* è una primitiva di *f*. Qui *f*(*x*) = 2*x*: la sua altezza segue la pendenza di *F*.'],
      [17, 'Teorema fondamentale: l’area sotto *f* fra *a* e *b* è *F*(*b*) − *F*(*a*). Si calcola la primitiva ai due estremi e si sottrae.'],
      [26.4, 'Controllo con *a* = 0 e *b* = 1: sotto 2*x* c’è un triangolo di base 1 e altezza 2, area 1. E *F*(1) − *F*(0) = 1 − 0 = 1.'],
      [35.4, 'Così si riempie la tabella. Una costante *c* ha primitiva *cx*: l’area è un rettangolo, *c*(*b* − *a*).'],
      [41.4, 'La funzione *x* ha primitiva *x*²/2: un triangolo. In generale *x**^n* ha primitiva *x**^{n+1}*/(*n* + 1).'],
      [48.2, 'L’esponenziale λ*e**^{−λx}* ha primitiva −*e**^{−λx}*: da 0 a ∞ l’area vale 1, ed è una densità.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 16.6, 'Derivata e primitiva', '*F*′ = *f*: la pendenza di *F* è l’altezza di *f*') + heading(t, 17.2, 34.8, 'Il teorema fondamentale', '∫_a^b *f*(*x*) d*x* = *F*(*b*) − *F*(*a*)') + heading(t, 35.4, 56.4, 'Le primitive da conoscere', 'una riga per ogni funzione');

      /* capitoli 1 e 2: F a sinistra, f a destra */
      const cc = vis(t, 0.4, 35, 0.6, 0.6);
      if (cc > 0.004) {
        const ax = (xo, X, ylab, ylabY) => ln(xo - 20, 290, xo + 270, 290, { stroke: C.soft, sw: 1.8, op: cc }) + ln(X(0), 290, X(0), 130, { stroke: C.soft, sw: 1.8, op: cc }) + tx(X(1), 314, '1', { ff: SANS, size: 17, fill: C.soft, op: cc }) + tx(X(0), 314, '0', { ff: SANS, size: 17, fill: C.soft, op: cc }) + tx(X(0) - 8, ylabY + 6, ylab, { ff: SANS, size: 17, fill: C.soft, ta: 'end', op: cc });
        o += ax(80, PLX, '1', PLY(1)) + ax(380, PRX, '2', PRY(2));
        const tl = p(t, 0.8, 1.6) * cc;
        o += on(tl, tx(PLX(0.5), 120, '*F*(*x*) = *x*²', { size: 24, fill: C.A, op: tl }) + tx(PRX(0.5), 120, '*f*(*x*) = 2*x*', { size: 24, fill: C.B, op: tl }));
        o += path(curve(sq, 0, 1, PLX, PLY, 50), { stroke: C.A, sw: 3, op: cc, ...draw(p(t, 1.2, 3.2, E.lin)) });
        o += path(`M${PRX(0)} ${PRY(0)}L${PRX(1)} ${PRY(2)}`, { stroke: C.B, sw: 3, op: cc, ...draw(p(t, 1.6, 3.4, E.lin)) });

        /* capitolo 1: la tangente scorre */
        const c1 = cc * (1 - p(t, 16.4, 17.2));
        const xc = lerp(0.15, 0.9, p(t, 4, 12, E.io));
        if (c1 > 0.004 && t > 3.6) {
          const u = p(t, 3.6, 4.4) * c1, Px = PLX(xc), Py = PLY(xc * xc), m = (150 * 2 * xc) / 230, L = 62 / Math.sqrt(1 + m * m);
          o += on(u, ln(Px - L, Py + m * L, Px + L, Py - m * L, { stroke: C.hi, sw: 3.4, lc: 'round', op: u }) + circ(Px, Py, 6.5, { fill: C.hi, stroke: C.ink, sw: 1.8, op: u }));
          const Qx = PRX(xc), Qy = PRY(2 * xc);
          o += on(u, ln(Qx, 290, Qx, Qy, { stroke: C.hi, sw: 2.2, da: '5 4', op: u }) + circ(Qx, Qy, 6.5, { fill: C.hi, stroke: C.ink, sw: 1.8, op: u }) + ln(Px, 290, Px, Py, { stroke: C.hi, sw: 1.6, da: '5 4', op: u * 0.7 }));
          const ro = u * (1 - p(t, 12.8, 13.4));
          o += on(ro, tx(PLX(0.5), 340, 'pendenza = ' + nc(2 * xc, 2), { size: 22, op: ro }) + tx(PRX(0.5), 340, 'altezza = ' + nc(2 * xc, 2), { size: 22, op: ro }));
        }
        const pl = p(t, 13.4, 14.2) * c1;
        o += on(pl, pills(338, [{ s: '*F*′ = *f*:  *F* è una primitiva di *f*', op: pl }]));

        /* capitolo 2: l'area fra a e b */
        const c2 = cc * p(t, 17.2, 18);
        if (c2 > 0.004) {
          const k = p(t, 26.4, 28.4, E.io), a = lerp(0.3, 0, k), b = lerp(0.8, 1, k);
          const area = `M${PRX(a)} 290L${PRX(a)} ${PRY(2 * a)}L${PRX(b)} ${PRY(2 * b)}L${PRX(b)} 290Z`;
          const ua = p(t, 18.2, 19.4);
          o += on(ua, path(area, { fill: C.B, fo: 0.38 * ua, stroke: C.B, sw: 1.6, op: c2 }) + tx(PRX((a + b) / 2) + (k > 0.5 ? 12 : 0), PRY(a + b) + 30 - 18 * k, k > 0.5 ? 'area = 1' : 'area', { size: 22, op: c2 * ua }));
          const ub = p(t, 20.4, 21.4) * c2;
          for (const [v, lab] of [[a, 'a'], [b, 'b']]) if (!(k > 0.85)) o += tx(PRX(v), 314, lab, { size: 22, fill: C.B, op: ub * (1 - p(t, 27.6, 28.4)) });
          /* F(a) e F(b) a sinistra */
          const ud = p(t, 21.4, 22.6) * c2;
          for (const v of [a, b]) o += on(ud, circ(PLX(v), PLY(v * v), 6, { fill: C.B, stroke: C.ink, sw: 1.6, op: ud }) + ln(PLX(0), PLY(v * v), PLX(v), PLY(v * v), { stroke: C.B, sw: 1.8, da: '5 4', op: ud }));
          const y1 = PLY(a * a), y2 = PLY(b * b);
          o += on(ud, path(`M${PLX(0) - 22} ${y1}h-6V${y2}h6`, { stroke: C.B, sw: 2.4, op: ud }));
          const lf = p(t, 23, 23.8) * c2 * (1 - p(t, 28.4, 29));
          o += on(lf, tx(PLX(0.18), 170, '*F*(*b*) − *F*(*a*)', { size: 24, fill: C.B, ta: 'start', op: lf }));
          const n1 = p(t, 29, 29.8) * c2, n2 = p(t, 30.6, 31.4) * c2;
          o += on(n1, tx(PRX(0.04), 160, 'triangolo:', { size: 22, fill: C.B, ta: 'start', op: n1 }) + tx(PRX(0.04), 188, '1 · 2 / 2 = 1', { size: 22, fill: C.B, ta: 'start', op: n1 }));
          o += on(n2, tx(PLX(0.04), 160, '*F*(1) − *F*(0)', { size: 22, fill: C.B, ta: 'start', op: n2 }) + tx(PLX(0.04), 188, '= 1 − 0 = 1', { size: 22, fill: C.B, ta: 'start', op: n2 }) + check(PLX(0.04) + 140, 182, 18, p(t, 31.4, 32.2, E.lin), { op: n2 }));
          const pf = p(t, 32.6, 33.4) * c2;
          o += on(pf, pills(338, [{ s: '∫_a^b *f*(*x*) d*x* = *F*(*b*) − *F*(*a*)', op: pf }]));
        }
      }

      /* capitolo 3: la tabella */
      const c3 = vis(t, 35.4, 56.4, 0.6, 0.01);
      if (c3 > 0.004) {
        const hh = p(t, 35.8, 36.6) * c3;
        o += on(hh, tx(72, 104, 'funzione', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: hh }) + tx(296, 104, 'primitiva', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: hh }) + tx(452, 104, 'integrale fra *a* e *b*', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: hh }) + ln(60, 114, 610, 114, { stroke: C.line, sw: 1.6, op: hh }));
        const rows = [
          { y: 152, t0: 36.2, f: '*c*', pic: (y, op) => rect(190, y - 14, 80, 28, { fill: C.A, fo: 0.3, stroke: C.A, sw: 1.8, op }), pr: () => '*cx*', ar: '*c*(*b* − *a*)' },
          { y: 208, t0: 41.4, f: '*x*', pic: (y, op) => path(`M190 ${y + 16}L270 ${y + 16}L270 ${y - 16}Z`, { fill: C.A, fo: 0.3, stroke: C.A, sw: 1.8, op }), pr: () => '*x*²/2', ar: '(*b*² − *a*²)/2' },
          { y: 266, t0: 44.6, f: '*x**^n*', pic: (y, op) => path(`M190 ${y + 16}` + [0.2, 0.4, 0.6, 0.8, 1].map((u) => 'L' + (190 + 80 * u) + ' ' + (y + 16 - 32 * u * u)).join('') + `L270 ${y + 16}Z`, { fill: C.A, fo: 0.3, stroke: C.A, sw: 1.8, op }), frac: ['*x**^{n+1}*', 'n + 1'], arf: ['*b**^{n+1}* − *a**^{n+1}*', 'n + 1'] },
          { y: 322, t0: 48.4, f: 'λ*e**^{−λx}*', pic: (y, op) => path(`M190 ${y - 16}` + [0.1, 0.2, 0.4, 0.6, 0.8, 1].map((u) => 'L' + (190 + 80 * u) + ' ' + (y + 16 - 32 * Math.exp(-3 * u))).join('') + `L270 ${y + 16}L190 ${y + 16}Z`, { fill: C.A, fo: 0.3, stroke: C.A, sw: 1.8, op }), pr: () => '−*e**^{−λx}*', ar: '*e**^{−λa}* − *e**^{−λb}*' },
        ];
        rows.forEach((r) => {
          const u = p(t, r.t0, r.t0 + 0.8) * c3, v = p(t, r.t0 + 1.2, r.t0 + 2) * c3, w = p(t, r.t0 + 2.6, r.t0 + 3.4) * c3;
          if (u <= 0.004) return;
          o += tx(72, r.y + 8, r.f, { size: 26, ta: 'start', op: u }) + r.pic(r.y, u);
          if (v > 0.004) o += r.frac ? fr(330, r.y, r.frac[0], r.frac[1], { size: 22, op: v }) : tx(296, r.y + 8, r.pr(), { size: 24, ta: 'start', op: v });
          if (w > 0.004) o += r.arf ? fr(514, r.y, r.arf[0], r.arf[1], { size: 20, fill: C.B, op: w }) : tx(452, r.y + 8, r.ar, { size: 22, ta: 'start', fill: C.B, op: w });
        });
      }
      return o;
    },
  });

  /* ======================================================================
     3.2 · Integrali fino a infinito
     ====================================================================== */
  const track = (t, stops, d = 1.6, v0 = 0) => { let v = v0; for (const [ta, x] of stops) v = lerp(v, x, p(t, ta - d, ta, E.io)); return v; };
  const IX = (x) => 70 + 48 * x, IY = (y) => 270 - 150 * y; // e^{-x} su [0, 10]

  PV.add('improprio', {
    sec: '3.2',
    short: 'Integrali fino a infinito',
    title: 'Integrali impropri: area fino a b e limite per b → ∞',
    alt: 'Animazione: l’area sotto e^(−x) fino a b cresce con b e si ferma a 1 (0,632, 0,865, 0,9933, 0,99995); poi la funzione x su tutta la retta, dove gli integrali simmetrici fra −M e M valgono sempre 0 ma ciascuna metà cresce come M²/2, quindi l’integrale non esiste; infine il confronto fra 1/x², la cui area da 1 a b si ferma a 1, e 1/x, la cui area ln b non si ferma mai.',
    dur: 58,
    poster: 17.4,
    chap: [[0, 'L’area si ferma a 1'], [19.6, 'Non basta il limite simmetrico'], [37.6, 'Converge o diverge?']],
    caps: [
      [0, 'Spesso un estremo è ∞: si calcola l’area fino a *b* e si guarda cosa succede quando *b* cresce. Prendo *e**^{−x}*.'],
      [7.4, 'Fino a *b* = 1 l’area vale 0,632; fino a 2, 0,865; fino a 5, 0,9933; fino a 10, 0,99995.'],
      [14.4, 'Il limite è 1: ∫_0^∞ *e**^{−x}* d*x* = 1. Con λ generico l’area vale 1/λ, e λ*e**^{−λx}* ha area 1.'],
      [19.6, 'Su tutta la retta l’integrale si spezza in due pezzi, e ciascuno deve avere il suo limite finito.'],
      [26, 'Non basta che l’integrale da −*M* a *M* tenda a qualcosa: per *f*(*x*) = *x* vale sempre 0, ma ogni metà cresce come *M*²/2.'],
      [33, 'Quindi ∫_0^∞ *x* d*x* = ∞, e l’integrale su tutta la retta non esiste.'],
      [37.6, 'Per una *f* ≥ 0 il limite esiste sempre, finito o +∞. Confronto due funzioni che tendono a 0: 1/*x*² e 1/*x*.'],
      [45, 'L’area di 1/*x*² da 1 a *b* è 1 − 1/*b*: si ferma a 1, l’integrale converge.'],
      [50.6, 'Quella di 1/*x* è ln *b*: sale piano ma non si ferma mai, diverge. Tendere a 0 non basta.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 19.2, 'L’area si ferma a 1', '∫_0^∞ *e**^{−x}* d*x*: area fino a *b*, poi *b* → ∞') + heading(t, 19.8, 37.2, 'Sull’intera retta servono due limiti', 'prima di tutto: *f*(*x*) = *x*') + heading(t, 37.8, 58.4, 'Converge o diverge?', 'area di 1/*x*² e di 1/*x* da 1 a *b*');

      /* capitolo 1: e^{-x} */
      const c1 = vis(t, 0.4, 19.2, 0.6, 0.6);
      if (c1 > 0.004) {
        const b = track(t, [[5, 1], [8.4, 2], [11.6, 5], [15, 10]], 1.8);
        const A = 1 - Math.exp(-b);
        o += g({ op: c1 }, ln(50, 270, 560, 270, { stroke: C.soft, sw: 1.8 }) + ln(70, 270, 70, 100, { stroke: C.soft, sw: 1.8 }) + [0, 2, 4, 6, 8, 10].map((v) => ln(IX(v), 265, IX(v), 275, { stroke: C.soft, sw: 1.6 }) + tx(IX(v), 296, v, { ff: SANS, size: 17, fill: C.soft })).join('') + tx(60, IY(1) + 6, '1', { ff: SANS, size: 17, fill: C.soft, ta: 'end' }));
        const fe = (x) => Math.exp(-x);
        o += path(curve(fe, 0, 10, IX, IY, 100), { stroke: C.ink, sw: 2.8, op: c1, ...draw(p(t, 0.8, 3, E.lin)) });
        const ua = p(t, 3.4, 4.6) * c1;
        if (ua > 0.004) {
          o += path(areaD(fe, 0, Math.max(b, 0.001), IX, IY, 270, 90), { fill: C.A, fo: 0.38 * ua, op: c1 });
          o += ln(IX(b), 270, IX(b), IY(fe(b)) - 20, { stroke: C.hi, sw: 3, da: '5 4', op: ua * c1 }) + tx(IX(b), 330, '*b* = ' + (b < 9.995 ? nc(b, 1) : '10'), { size: 20, fill: C.hi, op: ua * c1 });
          o += tx(IX(5.2), IY(0.55), 'area = ' + nc(A, A > 0.9999 ? 5 : A > 0.99 ? 4 : 3), { size: 24, fill: C.A, ta: 'start', op: ua * c1 });
          /* il misuratore: sale e si ferma a 1 */
          o += rect(588, 120, 22, 150, { rx: 4, stroke: C.soft, sw: 1.6, op: ua * c1 }) + rect(588, 270 - 150 * A, 22, 150 * A, { rx: 4, fill: C.A, fo: 0.85, op: ua * c1 }) + tx(599, 108, '1', { ff: SANS, size: 20, fill: C.hi, fw: 700, op: ua * c1 });
        }
        const pl = p(t, 15.6, 16.4) * c1;
        o += on(pl, pills(338, [{ s: '∫_0^∞ *e**^{−x}* d*x* = 1', op: pl }]));
      }

      /* capitolo 2: f(x) = x su [−M, M] */
      const c2 = vis(t, 19.8, 37.2, 0.6, 0.6);
      if (c2 > 0.004) {
        const X = (x) => 320 + 65 * x, Y = (y) => 200 - 25 * y;
        const M = lerp(1, 4, p(t, 23, 31, E.io));
        o += g({ op: c2 }, ln(40, 200, 600, 200, { stroke: C.soft, sw: 1.8 }) + [-2, 0, 2].map((v) => tx(X(v), 224, v < 0 ? '−' + -v : v, { ff: SANS, size: 17, fill: C.soft })).join(''));
        o += path(`M${X(-4)} ${Y(-4)}L${X(4)} ${Y(4)}`, { stroke: C.ink, sw: 2.6, op: c2, ...draw(p(t, 20.4, 22.4, E.lin)) });
        const ur = p(t, 22, 23) * c2;
        o += on(ur, path(`M${X(0)} 200L${X(M)} 200L${X(M)} ${Y(M)}Z`, { fill: C.A, fo: 0.4, op: c2 * ur }) + path(`M${X(0)} 200L${X(-M)} 200L${X(-M)} ${Y(-M)}Z`, { fill: C.B, fo: 0.4, op: c2 * ur }));
        o += on(ur, ln(X(M), 184, X(M), 216, { stroke: C.hi, sw: 3, op: c2 * ur }) + ln(X(-M), 184, X(-M), 216, { stroke: C.hi, sw: 3, op: c2 * ur }) + tx(X(M), 258, '*M* = ' + nc(M, 1), { size: 20, fill: C.hi, op: c2 * ur }) + tx(X(-M), 176, '−*M*', { size: 20, fill: C.hi, op: c2 * ur }));
        const rd = p(t, 24, 24.8) * c2 * (1 - p(t, 32.6, 33.2));
        o += on(rd, tx(170, 338, 'metà sinistra: −' + nc(M * M / 2, 1), { size: 22, fill: C.B, op: rd }) + tx(480, 338, 'metà destra: +' + nc(M * M / 2, 1), { size: 22, fill: C.A, op: rd }));
        const sm = p(t, 27.4, 28.2) * c2;
        o += on(sm, txc(320, 128, [['+', C.A], [nc(M * M / 2, 1) + ' ', C.A], ['−', C.B], [' ' + nc(M * M / 2, 1) + ' = ', C.B], ['0', OK]], { size: 28, op: sm }));
        const pl = p(t, 33.4, 34.2) * c2;
        o += on(pl, pills(338, [{ s: '∫_0^∞ *x* d*x* = ∞: su ℝ l’integrale non esiste', icon: 'no', col: NO, op: pl, u: p(t, 33.7, 34.4, E.lin) }]));
      }

      /* capitolo 3: A(b) per 1/x² e per 1/x */
      const c3 = vis(t, 37.8, 58.4, 0.6, 0.01);
      if (c3 > 0.004) {
        const X = (b) => 80 + 25 * (b - 1), Y = (a) => 290 - 62 * a; // b da 1 a 20, area da 0 a 3
        o += g({ op: c3 }, ln(60, 290, 600, 290, { stroke: C.soft, sw: 1.8 }) + ln(80, 290, 80, 100, { stroke: C.soft, sw: 1.8 }) + [1, 5, 10, 15, 20].map((v) => tx(X(v), 314, v, { ff: SANS, size: 17, fill: C.soft })).join('') + [1, 2, 3].map((v) => tx(70, Y(v) + 6, v, { ff: SANS, size: 17, fill: C.soft, ta: 'end' })).join('') + tx(606, 314, '*b*', { size: 20, fill: C.soft, ta: 'start' }));
        const u1 = p(t, 41.4, 50, E.lin), u2 = p(t, 47, 56.4, E.lin);
        const A2 = (b) => 1 - 1 / b, A1 = (b) => Math.log(b);
        const l1 = p(t, 45, 45.8) * c3;
        o += on(l1, ln(80, Y(1), 600, Y(1), { stroke: C.A, sw: 1.8, da: '6 5', op: l1 * 0.8 }) + tx(588, Y(1) - 10, '1', { size: 22, fill: C.A, op: l1 }));
        const dA = p(t, 41.4, 43), dB = p(t, 46.4, 47.4);
        o += on(dA, path(curve(A2, 1, 1 + 19 * u1, X, Y, 80), { stroke: C.A, sw: 3.4, op: c3 * dA }) + circ(X(1 + 19 * u1), Y(A2(1 + 19 * u1)), 6, { fill: C.A, op: c3 * dA }));
        o += on(dB, path(curve(A1, 1, 1 + 19 * u2, X, Y, 80), { stroke: C.B, sw: 3.4, op: c3 * dB }) + circ(X(1 + 19 * u2), Y(A1(1 + 19 * u2)), 6, { fill: C.B, op: c3 * dB }));
        const t1 = p(t, 43.4, 44.2) * c3, t2 = p(t, 47.8, 48.6) * c3;
        o += on(t1, tx(300, 268, '∫_1^b d*x*/*x*² = 1 − 1/*b*', { size: 22, fill: C.A, ta: 'start', op: t1 }));
        o += on(t2, tx(110, Y(2.6), '∫_1^b d*x*/*x* = ln *b*', { size: 22, fill: C.B, ta: 'start', op: t2 }));
        const pl = p(t, 52.6, 53.4) * c3;
        o += on(pl, pills(338, [{ s: '1/*x* → 0, ma l’area non si ferma: diverge', icon: 'no', col: NO, op: pl, u: p(t, 52.9, 53.6, E.lin) }]));
      }
      return o;
    },
  });

  /* ======================================================================
     3.2 · Integrazione per parti e sostituzione
     ====================================================================== */
  const VX = (v) => 90 + 220 * v, UY = (u) => 290 - 62 * u;
  const vOf = (x) => 1 - Math.exp(-x); // v(x): primitiva di e^{-x} con v(0) = 0
  const dStr = (pts) => pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('');
  const cPts = (x1, n) => { const a = []; for (let i = 0; i <= n; i++) { const x = (x1 * i) / n; a.push([VX(vOf(x)), UY(x)]); } return a; };

  PV.add('parti', {
    sec: '3.2',
    short: 'Per parti e sostituzione',
    title: 'Integrazione per parti e sostituzione',
    alt: 'Animazione: una curva (v(x), u(x)) divide un rettangolo in due aree, ∫u dv e ∫v du, che insieme valgono uv: da qui la formula di integrazione per parti; poi l’esempio di ∫ x e^(−x) dx, con il termine fra parentesi che tende a 0 e il risultato 1; infine la sostituzione u = λx, in cui il grafico di λe^(−λx) si allunga al variare di λ ma l’area resta 1.',
    dur: 59,
    poster: 19.4,
    chap: [[0, 'Per parti: due aree in un rettangolo'], [22, 'Un esempio: ∫ x e⁻ˣ dx'], [42, 'Sostituzione: l’area non cambia']],
    caps: [
      [0, 'La regola per parti nasce dalla regola del prodotto. Una curva (*v*(*x*), *u*(*x*)) divide un rettangolo in due aree.'],
      [8.4, 'Sotto la curva l’area è ∫ *u* d*v* = ∫ *u* *v*′ d*x*; a sinistra è ∫ *v* d*u* = ∫ *u*′ *v* d*x*.'],
      [15, 'Insieme riempiono il rettangolo, di area *uv*. Dunque ∫ *u* *v*′ d*x* = [*uv*] − ∫ *u*′ *v* d*x*.'],
      [22, 'Esempio: ∫_0^∞ *x* *e**^{−x}* d*x*. Pongo *u* = *x*, che con la derivata si semplifica, e *v*′ = *e**^{−x}*.'],
      [29.2, 'Viene [−*x* *e**^{−x}*] fra 0 e ∞, più l’integrale di *e**^{−x}*. Il primo termine vale 0: in 0 c’è il fattore *x*, e all’infinito *e**^{−b}* batte *b*.'],
      [39.4, 'Resta ∫_0^∞ *e**^{−x}* d*x* = 1.'],
      [42, 'La sostituzione è la regola della catena al contrario: con *u* = *g*(*x*), ∫ *h*(*g*(*x*)) *g*′(*x*) d*x* = ∫ *h*(*u*) d*u*.'],
      [50.2, 'Con *u* = λ*x*: ∫_0^∞ λ*e**^{−λx}* d*x* = ∫_0^∞ *e**^{−u}* d*u* = 1. Cambiare unità di misura allunga il grafico, ma l’area resta 1.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 21.6, 'Per parti: due aree in un rettangolo', '∫ *u* *v*′ d*x* = [*uv*] − ∫ *u*′ *v* d*x*') + heading(t, 22.2, 41.8, 'Un esempio: ∫_0^∞ *x* *e**^{−x}* d*x*', '*u* = *x*,  *v*′ = *e**^{−x}*') + heading(t, 42.2, 59.4, 'Sostituzione', 'cambio di variabile *u* = *g*(*x*)');

      /* capitolo 1: la curva (v(x), u(x)) divide il rettangolo in due aree */
      const c1 = vis(t, 0.4, 21.6, 0.6, 0.6);
      if (c1 > 0.004) {
        const xb = 3, vb = vOf(xb), pts = cPts(xb, 60);
        o += g({ op: c1 }, ln(70, 290, 330, 290, { stroke: C.soft, sw: 1.8 }) + ln(90, 290, 90, 98, { stroke: C.soft, sw: 1.8 }) + tx(340, 296, '*v*', { size: 22, fill: C.soft, ta: 'start' }) + tx(80, 196, '*u*', { size: 22, fill: C.soft, ta: 'end' }));
        const r = p(t, 2, 3.4) * c1;
        o += on(r, rect(VX(0), UY(xb), 220 * vb, 62 * xb, { stroke: C.soft, sw: 1.8, da: '6 5', op: r }) + tx(VX(vb), 312, '*v*(*b*)', { size: 20, fill: C.soft, op: r }) + tx(82, UY(xb) + 6, '*u*(*b*)', { size: 20, fill: C.soft, ta: 'end', op: r }));
        const uA = p(t, 8.6, 10.6) * c1, uB = p(t, 12, 14) * c1, uR = p(t, 15.4, 16.6) * c1;
        o += on(uA, path(dStr(pts) + `L${VX(vb)} 290L${VX(0)} 290Z`, { fill: C.A, fo: 0.38 * uA / c1, op: c1 }));
        o += on(uB, path(dStr(pts) + `L${VX(0)} ${UY(xb)}Z`, { fill: C.B, fo: 0.38 * uB / c1, op: c1 }));
        o += path(dStr(pts), { stroke: C.ink, sw: 3, op: c1, ...draw(p(t, 4, 8, E.io)) });
        o += on(p(t, 7, 8) * c1, tx(VX(0.05), UY(2.45), '(*v*(*x*), *u*(*x*))', { size: 20, ta: 'start', op: p(t, 7, 8) * c1 }));
        o += on(uR, rect(VX(0), UY(xb), 220 * vb, 62 * xb, { stroke: C.hi, sw: 3.4, op: uR }));
        const sq1 = (y, col, op, s2) => rect(352, y - 14, 16, 16, { rx: 3, fill: col, fo: 0.6, op }) + tx(378, y, s2, { size: 22, ta: 'start', op });
        o += on(uA, sq1(176, C.A, uA, '∫ *u* d*v* = ∫ *u* *v*′ d*x*'));
        o += on(uB, sq1(222, C.B, uB, '∫ *v* d*u* = ∫ *u*′ *v* d*x*'));
        o += on(uR, rect(352, 252, 16, 16, { rx: 3, stroke: C.hi, sw: 3, op: uR }) + tx(378, 266, 'rettangolo: [*uv*]', { size: 22, ta: 'start', op: uR }));
        const pl = p(t, 18.2, 19) * c1;
        o += on(pl, pills(342, [{ s: '∫ *u* *v*′ d*x* = [*uv*] − ∫ *u*′ *v* d*x*', op: pl }]));
      }

      /* capitolo 2: x e^{-x} */
      const c2 = vis(t, 22.2, 41.8, 0.6, 0.6);
      if (c2 > 0.004) {
        const X = (x) => 70 + 62 * x, Y = (y) => 290 - 300 * y, gx = (x) => x * Math.exp(-x);
        o += g({ op: c2 }, ln(50, 290, 580, 290, { stroke: C.soft, sw: 1.8 }) + ln(70, 290, 70, 170, { stroke: C.soft, sw: 1.8 }) + [0, 2, 4, 6, 8].map((v) => tx(X(v), 314, v, { ff: SANS, size: 17, fill: C.soft })).join('') + tx(588, 296, '*x*', { size: 20, fill: C.soft, ta: 'start' }));
        o += path(curve(gx, 0, 8, X, Y, 100), { stroke: C.ink, sw: 2.8, op: c2, ...draw(p(t, 22.8, 25.4, E.lin)) });
        const s0 = p(t, 23.6, 24.4) * c2 * (1 - p(t, 29, 29.6));
        o += on(s0, tx(380, 150, '*u* = *x*     *v*′ = *e**^{−x}*', { size: 26, op: s0 }));
        const f1 = p(t, 29.4, 30.4) * c2;
        o += on(f1, tx(320, 132, '∫_0^∞ *x* *e**^{−x}* d*x* = [−*x* *e**^{−x}*]_0^∞ + ∫_0^∞ *e**^{−x}* d*x*', { size: 22, op: f1 }));
        const b = lerp(0.3, 8, p(t, 31, 37.4, E.io)), cu = p(t, 30.6, 31.4) * c2 * (1 - p(t, 38, 38.8));
        o += on(cu, circ(X(b), Y(gx(b)), 7, { fill: C.hi, stroke: C.ink, sw: 1.8, op: cu }) + ln(X(b), 290, X(b), Y(gx(b)), { stroke: C.hi, sw: 2, da: '5 4', op: cu }) + tx(560, 196, '−*b* *e**^{−b}* = −' + nc(b * Math.exp(-b), 3), { size: 22, ta: 'end', op: cu }) + tx(560, 224, '→ 0', { size: 22, fill: OK, ta: 'end', op: cu * p(t, 35, 36) }));
        const ar = p(t, 38.6, 40) * c2;
        o += on(ar, path(areaD(gx, 0, 8, X, Y, 290, 100), { fill: C.A, fo: 0.35 * ar, op: c2 }) + txc(320, 162, [['= ', C.ink], ['0', OK], [' + 1 = ', C.ink], ['1', C.A]], { size: 30, op: ar }));
      }

      /* capitolo 3: u = λx, l'area di λe^{-λx} resta 1 */
      const c3 = vis(t, 42.2, 59.4, 0.6, 0.01);
      if (c3 > 0.004) {
        const X = (x) => 70 + 80 * x, Y = (y) => 290 - 56 * y;
        const lam = lerp(3, 1, p(t, 51.4, 56.4, E.io)), fl = (x) => lam * Math.exp(-lam * x);
        o += g({ op: c3 }, ln(50, 290, 570, 290, { stroke: C.soft, sw: 1.8 }) + [0, 1, 2, 3, 4, 5, 6].map((v) => tx(X(v), 314, v, { ff: SANS, size: 17, fill: C.soft })).join('') + tx(590, 314, '*x*', { size: 20, fill: C.soft, ta: 'start' }));
        const ur = p(t, 44.6, 45.6) * c3;
        o += on(ur, g({ op: ur }, [0, 1, 2, 3, 4, 5, 6].map((v) => tx(X(v / lam), 338, v, { ff: SANS, size: 17, fill: C.B })).join('') + tx(590, 338, '*u*', { size: 20, fill: C.B, ta: 'start' })));
        const uc = p(t, 43.4, 45.4, E.lin);
        o += path(curve(fl, 0, 6, X, Y, 120), { stroke: C.ink, sw: 2.8, op: c3, ...draw(uc) });
        const ua = p(t, 45, 46.4) * c3;
        o += on(ua, path(areaD(fl, 0, 6, X, Y, 290, 120), { fill: C.A, fo: 0.35 * ua / c3, op: c3 }) + tx(X(3.6), 232, 'area = 1', { size: 30, fill: C.A, op: ua }) + tx(X(3.6), 192, 'λ = ' + nc(lam, 1), { size: 26, op: ua }));
        const f1 = p(t, 46.8, 47.8) * c3 * (1 - p(t, 50, 50.8)), f2 = p(t, 50.6, 51.6) * c3;
        o += on(f1, tx(320, 116, '∫ *h*(*g*(*x*)) *g*′(*x*) d*x* = ∫ *h*(*u*) d*u*', { size: 24, op: f1 }));
        o += on(f2, tx(320, 116, '*u* = λ*x*:  ∫ λ*e**^{−λx}* d*x* = ∫ *e**^{−u}* d*u* = 1', { size: 24, op: f2 }));
      }
      return o;
    },
  });

  /* ======================================================================
     3.2 · La funzione Gamma: il fattoriale esteso
     ====================================================================== */
  function gammaFn(x) { // approssimazione di Lanczos
    if (x < 0.5) return Math.PI / (Math.sin(Math.PI * x) * gammaFn(1 - x));
    x -= 1;
    const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    let a = c[0];
    const tt = x + 7.5;
    for (let i = 1; i < 9; i++) a += c[i] / (x + i);
    return Math.sqrt(2 * Math.PI) * Math.pow(tt, x + 0.5) * Math.exp(-tt) * a;
  }
  const GAX = (x) => 70 + 50 * x, GAY = (y) => 290 - 120 * y; // x^{α−1} e^{−x}

  PV.add('gamma_f', {
    sec: '3.2',
    short: 'La funzione Gamma',
    title: 'La funzione Gamma: Γ(α) è un’area, e il fattoriale si estende ai numeri non interi',
    alt: 'Animazione: le aree sotto x^(α−1) e^(−x) per α = 1, 2, 3, 4 valgono 1, 1, 2, 6, e per α = 1/2 vale √π; poi le barre Γ(1), …, Γ(5) = 1, 1, 2, 6, 24 con i moltiplicatori 1, 2, 3, 4, cioè (n − 1)!; infine la curva Γ(α) che passa per questi valori e si estende ai numeri non interi, con Γ(1/2) = √π e Γ(3/2) = √π/2.',
    dur: 57,
    poster: 20,
    chap: [[0, 'Γ(α) è un’area'], [21.4, 'Γ(α + 1) = α Γ(α)'], [39, 'Il fattoriale esteso']],
    caps: [
      [0, 'La funzione Gamma è un’area: Γ(α) = ∫_0^∞ *x**^{α−1}* *e**^{−x}* d*x*, per ogni α > 0. L’integrale converge: *e**^{−x}* vince su ogni potenza.'],
      [8, 'Con α = 1 la curva è *e**^{−x}* e l’area è 1. Con α = 2 l’area è ancora 1; con α = 3 è 2; con α = 4 è 6.'],
      [15.6, 'Anche per α = 1/2 l’area esiste, benché la curva salga all’infinito in 0: vale √π ≈ 1,77.'],
      [21.4, 'Integrando per parti si trova Γ(α + 1) = α Γ(α). Quindi ogni area si ottiene dalla precedente moltiplicando per α.'],
      [29.2, 'Da Γ(1) = 1: Γ(2) = 1, Γ(3) = 2, Γ(4) = 6, Γ(5) = 24. In generale Γ(*n*) = (*n* − 1)!, il fattoriale.'],
      [39, 'La Gamma è il fattoriale esteso ai numeri non interi: la curva passa per i punti (*n*, (*n* − 1)!).'],
      [46, 'Fra 1 e 2, per esempio, c’è Γ(3/2) = ½ Γ(1/2) = √π/2 ≈ 0,886. Con una scala λ, l’integrale vale Γ(α)/λ^α.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 20.8, 'Γ(α) è un’area', 'Γ(*α*) = ∫_0^∞ *x**^{α−1}* *e**^{−x}* d*x*') + heading(t, 21.8, 38.6, 'Il fattoriale', 'Γ(*α* + 1) = *α* Γ(*α*)') + heading(t, 39.2, 57.4, 'Il fattoriale esteso', 'la curva passa per (*n*, (*n* − 1)!)');

      /* capitolo 1: le aree sotto x^{α-1} e^{-x} */
      const c1 = vis(t, 0.4, 20.8, 0.6, 0.6);
      if (c1 > 0.004) {
        o += g({ op: c1 }, ln(50, 290, 580, 290, { stroke: C.soft, sw: 1.8 }) + ln(70, 290, 70, 112, { stroke: C.soft, sw: 1.8 }) + [0, 2, 4, 6, 8, 10].map((v) => tx(GAX(v), 314, v, { ff: SANS, size: 17, fill: C.soft })).join('') + tx(62, GAY(1) + 6, '1', { ff: SANS, size: 17, fill: C.soft, ta: 'end' }) + tx(590, 296, '*x*', { size: 20, fill: C.soft, ta: 'start' }));
        const ST = [[2.4, 1, 1, '1'], [8, 2, 1, '1'], [10.4, 3, 2, '2'], [12.8, 4, 6, '6']];
        ST.forEach(([t0, al, , lab], k) => {
          const fn = (x) => Math.pow(x, al - 1) * Math.exp(-x);
          const cur = p(t, t0, t0 + 0.9), nxt = k < 3 ? p(t, ST[k + 1][0], ST[k + 1][0] + 0.9) : p(t, 15.4, 16.2);
          if (cur <= 0.004) return;
          const current = (1 - nxt) * cur;
          o += path(areaD(fn, 0, 10, GAX, GAY, 290, 100), { fill: C.A, fo: 0.34 * current, op: c1 });
          o += path(curve(fn, 0, 10, GAX, GAY, 100), { stroke: C.A, sw: current > 0.5 ? 3.2 : 1.8, op: c1 * (0.3 + 0.7 * current) });
          o += on(current, tx(560, 150, '*α* = ' + al, { size: 26, ta: 'end', op: current * c1 }) + tx(560, 186, 'area = Γ(' + al + ') = ' + lab, { size: 26, fill: C.A, ta: 'end', op: current * c1 }));
        });
        /* α = 1/2: la curva sale all'infinito in 0 ma l'area è finita */
        const h = p(t, 15.6, 16.6) * c1, hid = 'cp-gamma-1';
        if (h > 0.004) {
          const fh = (x) => Math.pow(x, -0.5) * Math.exp(-x);
          o += `<clipPath id="${hid}">${rect(70, 100, 520, 192)}</clipPath>` + g({ 'clip-path': `url(#${hid})`, op: h }, path(areaD(fh, 0.002, 10, GAX, GAY, 290, 200), { fill: C.B, fo: 0.3 }) + path(curve(fh, 0.002, 10, GAX, GAY, 200), { stroke: C.B, sw: 3.2 }));
          o += tx(560, 150, '*α* = 1/2', { size: 26, ta: 'end', op: h }) + tx(560, 186, 'area = Γ(1/2) = √π ≈ 1,77', { size: 26, fill: C.B, ta: 'end', op: h });
        }
      }

      /* capitolo 2: barre Γ(n) = (n-1)! */
      const c2 = vis(t, 21.8, 38.6, 0.6, 0.6);
      if (c2 > 0.004) {
        const bx = (n) => 90 + 100 * (n - 1), BY = (v) => 6.2 * v, base = 270;
        o += g({ op: c2 }, ln(50, base, 600, base, { stroke: C.soft, sw: 1.8 }));
        const vals = [1, 1, 2, 6, 24], fac = ['0!', '1!', '2!', '3!', '4!'];
        vals.forEach((v, i) => {
          const n = i + 1, t0 = [23, 26, 28.6, 31, 33.4][i], u = p(t, t0, t0 + 0.9, E.back);
          if (u <= 0.004) return;
          const hgt = BY(v) * Math.min(u, 1.04);
          o += rect(bx(n) - 24, base - hgt, 48, hgt, { rx: 3, fill: C.A, fo: 0.8, op: c2 });
          o += tx(bx(n), base - hgt - 10, v, { size: 24, fill: C.A, op: c2 * p(t, t0 + 0.5, t0 + 1.1) });
          o += tx(bx(n), base + 24, '*α* = ' + n, { ff: SANS, size: 17, fill: C.soft, op: c2 * p(t, t0, t0 + 0.6) });
          o += tx(bx(n), base + 48, 'Γ(' + n + ') = ' + fac[i], { size: 20, op: c2 * p(t, t0 + 2.2, t0 + 2.8) * (t0 + 2.2 < 34 ? 1 : 1) });
          if (i > 0) {
            const mx = (bx(n - 1) + bx(n)) / 2, ch = p(t, t0 - 0.2, t0 + 0.5, E.back);
            o += on(ch, g({ op: c2 * Math.min(ch, 1), tf: T(mx, base - 62, 0.6 + 0.4 * ch) }, rect(-19, -15, 38, 28, { rx: 14, fill: C.paper, stroke: C.B, sw: 2 }) + tx(0, 6, '×' + (n - 1), { ff: SANS, size: 18, fill: C.B })));
          }
        });
        const pf = p(t, 36, 36.8) * c2;
        o += on(pf, pills(98, [{ s: 'Γ(*n*) = (*n* − 1)!  per ogni intero *n* ≥ 1', op: pf }]));
      }

      /* capitolo 3: la curva Γ(α) */
      const c3 = vis(t, 39.2, 57.4, 0.6, 0.01);
      if (c3 > 0.004) {
        const X = (a) => 90 + 110 * a, Y = (v) => 300 - 24 * v;
        o += g({ op: c3 }, ln(70, 300, 590, 300, { stroke: C.soft, sw: 1.8 }) + ln(90, 300, 90, 112, { stroke: C.soft, sw: 1.8 }) + [1, 2, 3, 4].map((v) => tx(X(v), 324, v, { ff: SANS, size: 17, fill: C.soft })).join('') + [2, 4, 6].map((v) => tx(82, Y(v) + 6, v, { ff: SANS, size: 17, fill: C.soft, ta: 'end' })).join('') + tx(600, 306, '*α*', { size: 20, fill: C.soft, ta: 'start' }));
        o += path(curve(gammaFn, 0.2, 4.1, X, Y, 140), { stroke: C.A, sw: 3.2, op: c3, ...draw(p(t, 39.8, 44.4, E.io)) });
        [1, 2, 3, 4].forEach((n, i) => {
          const u = p(t, 41 + i * 0.7, 41.6 + i * 0.7, E.back), gv = gammaFn(n);
          o += on(u, circ(X(n), Y(gv), 6.5 * Math.min(u, 1), { fill: C.A, stroke: C.paper, sw: 1.5, op: c3 }) + tx(X(n) + (n === 4 ? -12 : 8), Y(gv) - 14, Math.round(gv), { ff: SANS, size: 17, fill: C.soft, ta: n === 4 ? 'end' : 'start', op: c3 * u }));
        });
        const h1 = p(t, 46.4, 47.2) * c3, h2 = p(t, 49.4, 50.2) * c3;
        o += on(h1, circ(X(0.5), Y(gammaFn(0.5)), 8, { fill: C.hi, stroke: C.ink, sw: 1.8, op: h1 }) + ln(X(0.5), Y(gammaFn(0.5)) - 10, X(0.5), 182, { stroke: C.hi, sw: 2, da: '4 4', op: h1 }) + tx(X(0.5) - 24, 172, 'Γ(1/2) = √π ≈ 1,77', { size: 22, ta: 'start', op: h1 }));
        o += on(h2, circ(X(1.5), Y(gammaFn(1.5)), 8, { fill: C.hi, stroke: C.ink, sw: 1.8, op: h2 }) + ln(X(1.5), Y(gammaFn(1.5)) - 10, X(1.5), 230, { stroke: C.hi, sw: 2, da: '4 4', op: h2 }) + tx(X(1.5) - 24, 220, 'Γ(3/2) = √π/2 ≈ 0,886', { size: 22, ta: 'start', op: h2 }));
        const pl = p(t, 52.6, 53.4) * c3;
        o += on(pl, pills(108, [{ s: '∫_0^∞ *x**^{α−1}* *e**^{−λx}* d*x* = Γ(*α*) / λ^α', op: pl }]));
      }
      return o;
    },
  });

  /* ======================================================================
     3.2 · Integrali doppi: il volume sopra il triangolo 0 < x < y < 1, letto in due modi
     ====================================================================== */
  const DPX = (x) => 70 + 160 * x, DPY = (y) => 292 - 160 * y; // il piano (x, y) nei capitoli 2 e 3
  const DRX = (s) => 410 + 170 * s, DRY = (v) => 292 - 55 * v; // il valore dell'integrale interno
  const PRI = (x, y, z) => [100 + 200 * x + 80 * y, 306 - 60 * y - 55 * z]; // prisma in proiezione obliqua
  const pxy = (q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1);

  PV.add('doppi', {
    sec: '3.2',
    short: 'Integrali doppi',
    title: 'Integrali doppi: il volume sopra il triangolo, letto in due modi',
    alt: 'Animazione: l’integrale doppio di 2 sul triangolo 0 < x < y < 1 è il volume di un prisma con base di area 1/2 e altezza 2, cioè 1; poi lo stesso volume si calcola scorrendo il triangolo per righe (x da 0 a y, integrale interno 2y) e per colonne (y da x a 1, integrale interno 2(1 − x)): in entrambi i casi l’area sotto l’integrale interno è 1.',
    dur: 58,
    poster: 35,
    chap: [[0, 'Un volume sopra una regione'], [23, 'Prima per righe: x da 0 a y'], [38.2, 'Poi per colonne: y da x a 1']],
    caps: [
      [0, 'Un integrale doppio è un volume: quello sotto la superficie *z* = *h*(*x*, *y*) e sopra una regione *B* del piano.'],
      [7.8, 'Esempio: *B* è il triangolo *T* dei punti con 0 < *x* < *y* < 1, e la funzione è costante, *h* = 2.'],
      [14.6, 'Il solido è un prisma: base di area 1/2, altezza 2, volume 1. Ora lo calcolo con due integrali, uno dentro l’altro.'],
      [23, 'Primo modo: per ogni *y*, la *x* va da 0 a *y*. L’integrale interno ∫_0^y 2 d*x* vale 2*y*: la lunghezza della riga per 2.'],
      [31, 'Poi si integra 2*y* per *y* da 0 a 1: l’area sotto la retta è 1. Così ∫∫_T 2 d*x* d*y* = 1.'],
      [38.2, 'Secondo modo: per ogni *x*, la *y* va da *x* a 1. L’integrale interno ∫_x^1 2 d*y* vale 2(1 − *x*).'],
      [45.2, 'Integrando 2(1 − *x*) per *x* da 0 a 1 si trova ancora 1: stesso volume, come deve essere.'],
      [51.6, 'Per *h* ≥ 0 l’ordine dei due integrali si può scambiare (teorema di Fubini–Tonelli).'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 22.4, 'Un integrale doppio è un volume', 'sotto *z* = *h*(*x*, *y*), sopra la regione *B*') + heading(t, 23.2, 37.8, 'Prima per righe', 'per ogni *y*, la *x* va da 0 a *y*') + heading(t, 38.4, 58.4, 'Poi per colonne', 'per ogni *x*, la *y* va da *x* a 1');

      /* capitolo 1: il prisma di base T e altezza 2 */
      const c1 = vis(t, 0.4, 22.4, 0.6, 0.6);
      if (c1 > 0.004) {
        const h = 2 * p(t, 5, 9.4, E.io);
        const A0 = PRI(0, 0, 0), B0 = PRI(0, 1, 0), C0 = PRI(1, 1, 0), A1 = PRI(0, 0, h), B1 = PRI(0, 1, h), C1 = PRI(1, 1, h);
        o += g({ op: c1 }, ln(A0[0] - 14, A0[1], C0[0] + 30, A0[1], { stroke: C.soft, sw: 1.6 }) + tx(C0[0] + 40, A0[1] + 6, '*x*', { size: 20, fill: C.soft, ta: 'start' }) + ln(A0[0], A0[1], B0[0] + 24, B0[1] - 18, { stroke: C.soft, sw: 1.6 }) + tx(B0[0] + 34, B0[1] - 12, '*y*', { size: 20, fill: C.soft, ta: 'start' }));
        const ub = p(t, 1.2, 2.6);
        o += on(ub, path(`M${pxy(A0)}L${pxy(B0)}L${pxy(C0)}Z`, { fill: C.hi, fo: 0.32 * ub, stroke: C.hi, sw: 2.2, op: c1 }));
        if (h > 0.02) {
          o += path(`M${pxy(B0)}L${pxy(B1)}`, { stroke: C.soft, sw: 1.6, da: '4 4', op: c1 });
          o += path(`M${pxy(A0)}L${pxy(C0)}L${pxy(C1)}L${pxy(A1)}Z`, { fill: C.A, fo: 0.22, stroke: C.A, sw: 2, lj: 'round', op: c1 });
          o += path(`M${pxy(A1)}L${pxy(B1)}L${pxy(C1)}Z`, { fill: C.A, fo: 0.42, stroke: C.A, sw: 2, lj: 'round', op: c1 });
        }
        const hb = p(t, 9.4, 10.2) * c1;
        o += on(hb, path(`M${A0[0] - 12} ${A0[1]}h-6V${A1[1]}h6`, { stroke: C.B, sw: 2.4, op: hb }) + tx(A0[0] - 26, (A0[1] + A1[1]) / 2 + 7, '*h* = 2', { size: 24, fill: C.B, ta: 'end', op: hb }));
        const r1 = p(t, 1.6, 2.4) * c1, r2 = p(t, 10.4, 11.2) * c1, r3 = p(t, 12, 12.8) * c1, r4 = p(t, 13.4, 14.2) * c1;
        o += on(r1, tx(436, 130, 'base *T*', { size: 24, ta: 'start', op: r1 }) + tx(436, 158, '0 < *x* < *y* < 1', { size: 20, fill: C.soft, ta: 'start', op: r1 }));
        o += on(r2, tx(436, 206, 'area = 1/2', { size: 24, fill: C.hi, ta: 'start', op: r2 }));
        o += on(r3, tx(436, 242, 'altezza = 2', { size: 24, fill: C.B, ta: 'start', op: r3 }));
        o += on(r4, txc(436, 286, [['volume = ', C.ink], ['1', C.A]], { size: 28, ta: 'start', op: r4 }));
        const pl = p(t, 16.6, 17.4) * c1;
        o += on(pl, pills(342, [{ s: '∫∫_T 2 d*x* d*y* = 1/2 · 2 = 1', op: pl }]));
      }

      /* capitoli 2 e 3: lo stesso triangolo, spazzato per righe e per colonne */
      const sweep = (vis0, vis1, t0, t1, mode) => {
        const cv = vis(t, vis0, vis1, 0.6, 0.6);
        if (cv <= 0.004) return '';
        let r = '';
        const s = p(t, t0, t1, E.io);
        const inner = mode === 0 ? (x) => 2 * x : (x) => 2 * (1 - x); // valore dell'integrale interno
        /* il piano */
        r += g({ op: cv }, ln(56, 292, 250, 292, { stroke: C.soft, sw: 1.6 }) + ln(70, 304, 70, 126, { stroke: C.soft, sw: 1.6 }) + tx(DPX(1), 318, '1', { ff: SANS, size: 17, fill: C.soft }) + tx(DPX(0), 318, '0', { ff: SANS, size: 17, fill: C.soft }) + tx(60, DPY(1) + 6, '1', { ff: SANS, size: 17, fill: C.soft, ta: 'end' }) + tx(258, 298, '*x*', { size: 20, fill: C.soft, ta: 'start' }) + tx(56, 122, '*y*', { size: 20, fill: C.soft, ta: 'end' }));
        r += path(`M${DPX(0)} ${DPY(0)}L${DPX(0)} ${DPY(1)}L${DPX(1)} ${DPY(1)}Z`, { stroke: C.soft, sw: 1.8, da: '5 4', op: cv });
        /* la parte già spazzata e la riga/colonna corrente */
        if (mode === 0) {
          const y = s;
          r += on(s, path(`M${DPX(0)} ${DPY(0)}L${DPX(0)} ${DPY(y)}L${DPX(y)} ${DPY(y)}Z`, { fill: C.A, fo: 0.3, op: cv }));
          r += on(s, ln(DPX(0), DPY(y), DPX(y), DPY(y), { stroke: C.hi, sw: 4.4, lc: 'round', op: cv }));
        } else {
          const x = s;
          r += on(s, path(`M${DPX(0)} ${DPY(0)}L${DPX(0)} ${DPY(1)}L${DPX(x)} ${DPY(1)}L${DPX(x)} ${DPY(x)}Z`, { fill: C.B, fo: 0.3, op: cv }));
          r += on(s, ln(DPX(x), DPY(x), DPX(x), DPY(1), { stroke: C.hi, sw: 4.4, lc: 'round', op: cv }));
        }
        /* il pannello a destra: valore dell'integrale interno e area che si accumula */
        const col = mode === 0 ? C.A : C.B;
        r += g({ op: cv }, ln(396, 292, 596, 292, { stroke: C.soft, sw: 1.6 }) + ln(410, 304, 410, 176, { stroke: C.soft, sw: 1.6 }) + tx(DRX(1), 318, '1', { ff: SANS, size: 17, fill: C.soft }) + tx(DRX(0), 318, '0', { ff: SANS, size: 17, fill: C.soft }) + tx(402, DRY(2) + 6, '2', { ff: SANS, size: 17, fill: C.soft, ta: 'end' }) + tx(604, 298, mode === 0 ? '*y*' : '*x*', { size: 20, fill: C.soft, ta: 'start' }));
        r += path(`M${DRX(0)} ${DRY(inner(0))}L${DRX(1)} ${DRY(inner(1))}`, { stroke: C.soft, sw: 1.8, da: '5 4', op: cv });
        if (s > 0.002) {
          r += path(areaD(inner, 0, s, DRX, DRY, 292, 40), { fill: col, fo: 0.34, op: cv });
          r += path(`M${DRX(0)} ${DRY(inner(0))}L${DRX(s)} ${DRY(inner(s))}`, { stroke: col, sw: 3, op: cv });
          r += circ(DRX(s), DRY(inner(s)), 6.5, { fill: C.hi, stroke: C.ink, sw: 1.6, op: cv });
        }
        return r;
      };
      o += sweep(23.2, 37.8, 25.4, 31, 0);
      o += sweep(38.4, 58.4, 40.4, 46, 1);
      const f2 = vis(t, 23.8, 37.8, 0.6, 0.6), f3 = vis(t, 39, 58.4, 0.6, 0.01);
      o += on(f2, tx(320, 104, '∫∫_T 2 d*x* d*y* = ∫_0^1 ( ∫_0^y 2 d*x* ) d*y*', { size: 22, op: f2 }));
      o += on(f3, tx(320, 104, '∫∫_T 2 d*x* d*y* = ∫_0^1 ( ∫_x^1 2 d*y* ) d*x*', { size: 22, op: f3 }));
      const in2 = p(t, 24.6, 25.4) * f2, in3 = p(t, 39.6, 40.4) * f3;
      o += on(in2, tx(500, 146, '∫_0^y 2 d*x* = 2*y*', { size: 22, fill: C.A, op: in2 }));
      o += on(in3, tx(500, 146, '∫_x^1 2 d*y* = 2(1 − *x*)', { size: 22, fill: C.B, op: in3 }));
      const ar2 = p(t, 31.6, 32.4) * f2, ar3 = p(t, 46.4, 47.2) * f3;
      o += on(ar2, tx(DRX(0.64), DRY(0.5) + 8, 'area = 1', { size: 26, fill: C.A, op: ar2 }) + pills(342, [{ s: '∫_0^1 2*y* d*y* = 1', icon: 'ok', col: OK, op: ar2, u: p(t, 32.8, 33.6, E.lin) }]));
      o += on(ar3, tx(DRX(0.36), DRY(0.5) + 8, 'area = 1', { size: 26, fill: C.B, op: ar3 }));
      const pf = p(t, 48.6, 49.4) * f3;
      o += on(pf, pills(342, [{ s: '∫_0^1 2(1 − *x*) d*x* = 1: stesso volume', icon: 'ok', col: OK, op: pf, u: p(t, 48.9, 49.7, E.lin) }]));
      return o;
    },
  });

  /* ======================================================================
     3.2 · L'integrale gaussiano, con le coordinate polari
     ====================================================================== */
  const GGX = (x) => 170 + 36 * x, GGY = (y) => 280 - 150 * y; // la campana e^{-x²/2}
  const gauss = (x) => Math.exp((-x * x) / 2);
  const KC = [470, 236], KS = 38; // centro e scala del piano a destra (capitolo 1)
  const LEV = [0.03, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]; // curve di livello della superficie
  const polar = (cx, cy, S, r, th) => [cx + S * r * Math.cos(th), cy - S * r * Math.sin(th)];

  PV.add('gauss_int', {
    sec: '3.2',
    short: 'L’integrale gaussiano',
    title: 'L’integrale gaussiano: il trucco delle coordinate polari',
    alt: 'Animazione: l’area sotto la campana e^(−x²/2) non ha una primitiva elementare; il suo quadrato è un integrale doppio sul piano, la cui superficie ha per curve di livello dei cerchi; in coordinate polari un pezzetto di piano ha area r dr dθ; l’integrale in θ vale 2π, quello in r vale 1, quindi l’area al quadrato è 2π e l’area vale √(2π), circa 2,5066.',
    dur: 59.5,
    poster: 36,
    chap: [[0, 'Una campana senza primitiva'], [22.8, 'Coordinate polari'], [39, 'Due integrali separati']],
    caps: [
      [0, 'L’area sotto la campana *e**^{−x²/2}* non si calcola con «primitiva agli estremi e sottrai»: non ha una primitiva elementare.'],
      [8, 'Ma c’è un trucco: il quadrato dell’area *I* è un integrale doppio sul piano, *I*² = ∫∫ *e**^{−(x²+y²)/2}* d*x* d*y*.'],
      [15.6, 'La superficie dipende solo dalla distanza *r* dall’origine: le sue curve di livello sono cerchi.'],
      [22.8, 'In coordinate polari un punto è (*r*, *θ*): *x* = *r* cos *θ*, *y* = *r* sin *θ*, e *x*² + *y*² = *r*².'],
      [29.6, 'Un pezzetto fra *r* e *r* + d*r*, fra *θ* e *θ* + d*θ*, è quasi un rettangolo di lati d*r* e *r* d*θ*: area *r* d*r* d*θ*.'],
      [39, 'I due integrali ora si separano. Quello in *θ*, da 0 a 2π, è un giro completo e vale 2π.'],
      [45, 'Quello in *r* ha primitiva −*e**^{−r²/2}*: da 0 a ∞ vale 1, perché *e**^{−R²/2}* → 0 e *e*^0 = 1.'],
      [51.6, 'Dunque *I*² = 2π · 1 = 2π e, poiché *I* > 0, *I* = √(2π) ≈ 2,5066. Ne seguono ∫ *e**^{−u²}* d*u* = √π e Γ(1/2) = √π.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 22.4, 'Una campana senza primitiva', '∫ *e**^{−x²/2}* d*x* su tutta la retta') + heading(t, 23, 38.6, 'Coordinate polari', 'un pezzetto di piano ha area *r* d*r* d*θ*') + heading(t, 39.2, 59.7, 'Due integrali separati', 'uno in *θ*, uno in *r*');

      /* capitolo 1: la campana, il suo quadrato, le curve di livello */
      const c1 = vis(t, 0.4, 22.4, 0.6, 0.6);
      if (c1 > 0.004) {
        o += g({ op: c1 }, ln(30, 280, 312, 280, { stroke: C.soft, sw: 1.8 }) + [-3, 0, 3].map((v) => tx(GGX(v), 304, v < 0 ? '−' + -v : v, { ff: SANS, size: 17, fill: C.soft })).join(''));
        o += path(curve(gauss, -3.8, 3.8, GGX, GGY, 100), { stroke: C.ink, sw: 2.8, op: c1, ...draw(p(t, 0.8, 3.4, E.lin)) });
        const ar = p(t, 3.6, 5) * c1;
        o += on(ar, path(areaD(gauss, -3.8, 3.8, GGX, GGY, 280, 100), { fill: C.A, fo: 0.36 * ar, op: c1 }) + tx(GGX(0), 336, 'area = *I*', { size: 26, fill: C.A, op: ar }));
        const f1 = p(t, 8.6, 9.4) * c1;
        o += on(f1, tx(320, 104, '*I*² = ∫∫ *e**^{−(x²+y²)/2}* d*x* d*y*', { size: 22, op: f1 }));
        const pn = p(t, 9, 10) * c1;
        o += on(pn, g({ op: pn }, ln(KC[0] - 112, KC[1], KC[0] + 112, KC[1], { stroke: C.soft, sw: 1.6 }) + ln(KC[0], KC[1] + 104, KC[0], KC[1] - 108, { stroke: C.soft, sw: 1.6 }) + tx(KC[0] + 120, KC[1] + 6, '*x*', { size: 20, fill: C.soft, ta: 'start' }) + tx(KC[0] + 10, KC[1] - 112, '*y*', { size: 20, fill: C.soft, ta: 'start' })));
        LEV.forEach((lv, k) => {
          const u = p(t, 10 + k * 0.28, 10.6 + k * 0.28);
          if (u > 0) o += circ(KC[0], KC[1], KS * Math.sqrt(-2 * Math.log(lv)) * u, { fill: C.A, fo: 0.1, stroke: C.A, so: 0.35, sw: 1, op: c1 });
        });
        const rr = p(t, 16, 17) * c1, th = 0.8;
        o += on(rr, ln(KC[0], KC[1], KC[0] + 78 * Math.cos(th), KC[1] - 78 * Math.sin(th), { stroke: C.hi, sw: 3.4, lc: 'round', op: rr }) + circ(KC[0] + 78 * Math.cos(th), KC[1] - 78 * Math.sin(th), 5.5, { fill: C.hi, stroke: C.ink, sw: 1.4, op: rr }) + tx(KC[0] + 26, KC[1] - 44, '*r*', { size: 24, fill: C.hi, op: rr }));
      }

      /* capitolo 2: il pezzetto in coordinate polari */
      const c2 = vis(t, 23, 38.6, 0.6, 0.6);
      if (c2 > 0.004) {
        const cx = 190, cy = 242, S = 54, r0 = 1.5, r1 = 2.0, t0 = 0.35, t1 = 1.05;
        o += g({ op: c2 }, ln(cx - 128, cy, cx + 128, cy, { stroke: C.soft, sw: 1.6 }) + ln(cx, cy + 96, cx, cy - 112, { stroke: C.soft, sw: 1.6 }) + tx(cx + 136, cy + 6, '*x*', { size: 20, fill: C.soft, ta: 'start' }) + tx(cx + 10, cy - 108, '*y*', { size: 20, fill: C.soft, ta: 'start' }));
        o += circ(cx, cy, S * 1, { stroke: C.soft, sw: 1.4, da: '5 4', op: c2 * 0.8 }) + circ(cx, cy, S * 2, { stroke: C.soft, sw: 1.4, da: '5 4', op: c2 * 0.8 });
        const pt = p(t, 24.4, 25.4) * c2;
        const P = polar(cx, cy, S, 1.75, 0.66);
        o += on(pt, ln(cx, cy, P[0], P[1], { stroke: C.hi, sw: 3, op: pt }) + circ(P[0], P[1], 5.5, { fill: C.hi, stroke: C.ink, sw: 1.4, op: pt }) + tx((cx + P[0]) / 2 - 12, (cy + P[1]) / 2 + 22, '*r*', { size: 22, fill: C.hi, op: pt }) + path(`M${cx + 34} ${cy}A34 34 0 0 0 ${polar(cx, cy, 34 / S, 1, 0.66)[0]} ${polar(cx, cy, 34 / S, 1, 0.66)[1]}`, { stroke: C.hi, sw: 2, op: pt }) + tx(cx + 50, cy - 12, '*θ*', { size: 20, fill: C.hi, ta: 'start', op: pt }));
        const tl = [['*x* = *r* cos *θ*', 26.2], ['*y* = *r* sin *θ*', 27.4], ['*x*² + *y*² = *r*²', 28.6]];
        tl.forEach(([s2, t0x], k) => { const u = p(t, t0x, t0x + 0.8) * c2; o += on(u, tx(404, 150 + 34 * k, s2, { size: 22, ta: 'start', op: u })); });
        const pa = p(t, 30.4, 31.6) * c2;
        if (pa > 0.004) {
          const a0 = polar(cx, cy, S, r0, t0), a1 = polar(cx, cy, S, r1, t0), b1 = polar(cx, cy, S, r1, t1), b0 = polar(cx, cy, S, r0, t1);
          o += path(`M${pxy(a0)}L${pxy(a1)}A${S * r1} ${S * r1} 0 0 0 ${pxy(b1)}L${pxy(b0)}A${S * r0} ${S * r0} 0 0 1 ${pxy(a0)}Z`, { fill: C.B, fo: 0.45 * pa, stroke: C.B, sw: 2.2, op: pa });
          o += ln(cx, cy, polar(cx, cy, S, 2.3, t0)[0], polar(cx, cy, S, 2.3, t0)[1], { stroke: C.soft, sw: 1.2, da: '4 4', op: pa * 0.7 }) + ln(cx, cy, polar(cx, cy, S, 2.3, t1)[0], polar(cx, cy, S, 2.3, t1)[1], { stroke: C.soft, sw: 1.2, da: '4 4', op: pa * 0.7 });
          const lr = p(t, 32.4, 33.2) * c2, la = p(t, 33.6, 34.4) * c2;
          const mr = polar(cx, cy, S, 1.75, t0), ma = polar(cx, cy, S, 2.0, (t0 + t1) / 2);
          o += on(lr, tx(mr[0] + 8, mr[1] + 30, 'd*r*', { size: 22, fill: C.B, op: lr }));
          o += on(la, tx(ma[0] + 30, ma[1] - 6, '*r* d*θ*', { size: 22, fill: C.B, ta: 'start', op: la }));
          const ae = p(t, 35, 35.8) * c2;
          o += on(ae, tx(404, 266, 'area ≈ *r* d*r* d*θ*', { size: 24, fill: C.B, ta: 'start', op: ae }));
        }
        const f2 = p(t, 36.2, 37) * c2;
        o += on(f2, tx(320, 104, '*I*² = ∫_0^{2π} ( ∫_0^∞ *e**^{−r²/2}* *r* d*r* ) d*θ*', { size: 22, op: f2 }));
      }

      /* capitolo 3: 2π × 1 */
      const c3 = vis(t, 39.2, 59.7, 0.6, 0.01);
      if (c3 > 0.004) {
        const cx = 140, cy = 232, R = 76, phi = 2 * Math.PI * p(t, 40.6, 45.2, E.io);
        const fade = 1 - p(t, 52.2, 52.8);
        o += g({ op: c3 }, circ(cx, cy, R, { stroke: C.soft, sw: 1.8 }) + ln(cx - R - 12, cy, cx + R + 12, cy, { stroke: C.soft, sw: 1.2 }) + ln(cx, cy - R - 12, cx, cy + R + 12, { stroke: C.soft, sw: 1.2 }));
        if (phi > 0.002) {
          const full = phi > 2 * Math.PI - 0.002;
          o += full ? circ(cx, cy, R, { fill: C.B, fo: 0.34, stroke: C.B, sw: 2.4, op: c3 }) : path(`M${cx} ${cy}L${cx + R} ${cy}A${R} ${R} 0 ${phi > Math.PI ? 1 : 0} 0 ${cx + R * Math.cos(phi)} ${cy - R * Math.sin(phi)}Z`, { fill: C.B, fo: 0.34, stroke: C.B, sw: 2.4, op: c3 });
          if (!full) o += ln(cx, cy, cx + R * Math.cos(phi), cy - R * Math.sin(phi), { stroke: C.hi, sw: 3.4, lc: 'round', op: c3 });
        }
        const ang = p(t, 45.4, 46.2) * c3;
        o += on(ang, tx(cx, cy + 10, '2π', { size: 32, fill: C.B, op: ang }));
        o += on(c3 * fade, tx(cx, 336, '∫_0^{2π} d*θ* = 2π', { size: 22, fill: C.B, op: c3 * fade * p(t, 40.4, 41.2) }));
        /* il grafico radiale */
        const X = (r) => 310 + 66 * r, Y = (v) => 296 - 250 * v, fr2 = (r) => r * Math.exp((-r * r) / 2);
        o += g({ op: c3 }, ln(296, 296, 590, 296, { stroke: C.soft, sw: 1.8 }) + ln(310, 296, 310, 140, { stroke: C.soft, sw: 1.8 }) + [0, 1, 2, 3, 4].map((v) => tx(X(v), 320, v, { ff: SANS, size: 17, fill: C.soft })).join('') + tx(598, 302, '*r*', { size: 20, fill: C.soft, ta: 'start' }));
        o += path(curve(fr2, 0, 4, X, Y, 80), { stroke: C.ink, sw: 2.8, op: c3, ...draw(p(t, 41.6, 44.4, E.lin)) });
        const Rr = 4 * p(t, 46.8, 51.6, E.io), ua = p(t, 46.2, 47) * c3;
        o += on(ua, path(areaD(fr2, 0, Math.max(Rr, 0.001), X, Y, 296, 60), { fill: C.A, fo: 0.38, op: ua }) + tx(450, 122, '∫_0^{R} *r* *e**^{−r²/2}* d*r* = 1 − *e**^{−R²/2}* = ' + nc(1 - Math.exp(-Rr * Rr / 2), 3), { size: 20, fill: C.A, op: ua * fade }));
        const pf = p(t, 52.8, 53.6) * c3;
        o += on(pf, pills(342, [{ s: '*I*² = 2π · 1 = 2π    ⇒    *I* = √(2π) ≈ 2,5066', op: pf }]));
      }
      return o;
    },
  });

  /* ======================================================================
     3.7 · Valore atteso condizionale a un evento: restringo e rinormalizzo
     ====================================================================== */
  const fulc = (x, y, col, op = 1) => path(`M${f2s(x)} ${f2s(y)}L${f2s(x - 10)} ${f2s(y + 18)}L${f2s(x + 10)} ${f2s(y + 18)}Z`, { fill: col, stroke: C.paper, sw: 1.2, op });
  const f2s = (v) => Math.round(v * 10) / 10;
  const lamE = 1 / 20, fEx = (x) => lamE * Math.exp(-lamE * x);

  PV.add('condevento', {
    sec: '3.7',
    short: 'Media condizionata a un evento',
    title: 'Valore atteso condizionale a un evento: restringo l’universo e rinormalizzo',
    alt: 'Animazione: la media di un dado sapendo che è uscito pari sale da 3,5 a 4 perché restano 2, 4 e 6 con probabilità 1/3; una uniforme fra 0 e 10 sapendo che X > 4 diventa un’uniforme fra 4 e 10 con media 7; un tempo esponenziale con media 20 secondi, sapendo che dura già 30 secondi, ha di nuovo la forma esponenziale a partire da 30 e media 30 + 20 = 50.',
    dur: 59.5,
    poster: 28,
    chap: [[0, 'Un dado, sapendo «pari»'], [19, 'Un’uniforme, sapendo X > 4'], [38.6, 'Un’esponenziale, sapendo X > 30']],
    caps: [
      [0, 'Un dado, sapendo che è uscito pari. Senza informazioni la media è 3,5.'],
      [5.4, 'Con «pari» restano 2, 4 e 6: tolgo gli altri e rinormalizzo, e ciascuno passa da 1/6 a 1/3.'],
      [11.6, 'La media sale a (2 + 4 + 6)/3 = 4. In formule, *E*[*X* | *A*] = *E*[*X*·1_*A*] / *P*(*A*) = 2 / (1/2) = 4.'],
      [19.4, 'Ora *X* è uniforme fra 0 e 10, con densità 1/10 e media 5. Sapendo che *X* > 4…'],
      [24.6, '…tengo solo la parte da 4 a 10, di probabilità 6/10, e la rinormalizzo: la densità diventa 1/6.'],
      [31, 'È di nuovo un’uniforme, su un intervallo più corto: la media è il punto medio, *E*[*X* | *X* > 4] = 7.'],
      [38.6, 'Un download ha durata esponenziale con media 20 secondi. Dopo 30 secondi non è ancora finito: quanto dura in tutto?'],
      [46.4, 'Restringo a *X* > 30 e rinormalizzo: la coda, alzata e traslata, coincide con la curva di partenza.'],
      [52.8, 'È l’assenza di memoria: restano in media 20 secondi, quindi in tutto *E*[*X* | *X* > 30] = 30 + 20 = 50.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 18.8, 'Un dado, sapendo «pari»', 'restringo l’universo ad *A* e rinormalizzo') + heading(t, 19.4, 38.2, 'Un’uniforme, sapendo *X* > 4', '*X* uniforme in [0, 10]') + heading(t, 38.8, 59.7, 'Un’esponenziale, sapendo *X* > 30', 'durata con media 20 secondi');

      /* capitolo 1: il dado */
      const c1 = vis(t, 0.4, 18.8, 0.6, 0.6);
      if (c1 > 0.004) {
        const X = (i) => 110 + 84 * (i - 1), base = 292, BH = (pr) => 360 * pr;
        o += g({ op: c1 }, ln(70, base, 570, base, { stroke: C.soft, sw: 1.8 }));
        const mean = lerp(3.5, 4, p(t, 12.4, 15.4, E.io));
        for (let i = 1; i <= 6; i++) {
          const u = p(t, 0.8 + 0.2 * i, 1.4 + 0.2 * i, E.back), even = i % 2 === 0;
          const gone = even ? 0 : p(t, 6.4, 8);                // i dispari spariscono
          const ring = even ? p(t, 5.6, 6.6) : 0;
          o += on(u, tile(X(i), 116, 58, i, { op: c1 * Math.min(u, 1) * (1 - 0.7 * gone), size: 28, veil: ring ? C.hi : undefined, vo: 0.3 * ring, ring: ring ? C.hi : undefined, ro: ring }));
          const pr = even ? lerp(1 / 6, 1 / 3, p(t, 8.4, 11, E.io)) : (1 / 6) * (1 - p(t, 6.8, 8.4));
          if (u > 0.3 && pr > 0.004) o += rect(X(i) - 24, base - BH(pr) * Math.min(u, 1), 48, BH(pr) * Math.min(u, 1), { rx: 3, fill: even && ring > 0.5 ? C.A : C.A, fo: 0.8, op: c1 });
          o += on(pr > 0.004 && u > 0.3, tx(X(i), base - BH(pr) - 10, pr > 0.2 ? '1/3' : '1/6', { ff: SANS, size: 17, fill: C.soft, op: c1 * Math.min(u, 1) * p(t, 3, 3.6) }));
        }
        const fl = p(t, 3, 3.8) * c1 * (1 - 0);
        o += on(fl, fulc(X(1) + (mean - 1) * 84, base + 3, C.hi, fl));
        o += on(fl, tx(X(1) + (mean - 1) * 84, base + 42, 'media ' + nc(mean, 1), { size: 22, fill: C.hi, op: fl }));
      }

      /* capitolo 2: uniforme in [0, 10] sapendo X > 4 */
      const c2 = vis(t, 19.4, 38.2, 0.6, 0.6);
      if (c2 > 0.004) {
        const X = (x) => 70 + 50 * x, base = 272, YY = (fv) => base - 900 * fv;
        o += g({ op: c2 }, ln(50, base, 580, base, { stroke: C.soft, sw: 1.8 }) + [0, 2, 4, 6, 8, 10].map((v) => tx(X(v), base + 24, v, { ff: SANS, size: 17, fill: C.soft })).join(''));
        const u0 = p(t, 20.4, 21.6), cut = p(t, 24.6, 26), grow = p(t, 27.2, 30.2, E.io), left = 1 - 0.85 * cut;
        o += on(u0, rect(X(0), base - 90 * u0, 500, 90 * u0, { fill: C.A, fo: 0.3 * left, stroke: C.A, sw: 2, so: left, op: c2 }));
        const hR = 90 + 60 * grow;
        o += on(cut, rect(X(4), base - hR, 300, hR, { fill: C.hi, fo: 0.34, stroke: C.hi, sw: 2.4, op: c2 * cut }));
        const lf = p(t, 21.8, 22.6) * c2 * (1 - cut);
        o += on(lf, tx(X(5), base - 90 - 12, '*f*(*x*) = 1/10', { size: 22, fill: C.A, op: lf }));
        const dl = p(t, 24.4, 25.2) * c2;
        o += on(dl, ln(X(4), base + 4, X(4), 112, { stroke: C.hi, sw: 3, da: '5 4', op: dl }));
        const pp = p(t, 25.6, 26.4) * c2 * (1 - p(t, 27.2, 27.8));
        o += on(pp, tx(X(7), base - 90 - 12, '*P*(*X* > 4) = 6/10', { size: 22, fill: C.hi, op: pp }));
        const ng = p(t, 29.4, 30.2) * c2;
        o += on(ng, tx(X(7), base - 150 - 12, '*f*(*x* | *X* > 4) = 1/6', { size: 22, fill: C.hi, op: ng }));
        const mean = lerp(5, 7, p(t, 31.6, 34.6, E.io)), fm = p(t, 20.8, 21.8) * c2;
        o += on(fm, fulc(X(mean), base + 36, mean > 5.01 ? C.B : C.B, fm) + tx(X(mean), base + 74, 'media ' + nc(mean, 1), { size: 22, fill: C.B, op: fm }));
        const eq = p(t, 35.2, 36) * c2;
        o += on(eq, tx(X(7), base - 150 + 44, '(4 + 10) / 2 = 7', { size: 26, fill: C.B, op: eq }));
      }

      /* capitolo 3: esponenziale, sapendo X > 30 */
      const c3 = vis(t, 38.8, 59.7, 0.6, 0.01);
      if (c3 > 0.004) {
        const X = (x) => 70 + 4 * x, base = 280, YY = (fv) => base - 2400 * fv;
        const s0 = 30, kfull = Math.exp(lamE * s0);
        o += g({ op: c3 }, ln(50, base, 580, base, { stroke: C.soft, sw: 1.8 }) + [0, 30, 60, 90, 120].map((v) => tx(X(v), base + 24, v, { ff: SANS, size: 17, fill: C.soft })).join('') + tx(588, base + 6, 's', { ff: SANS, size: 17, fill: C.soft, ta: 'start' }));
        const cd = p(t, 39.4, 42.4, E.lin), cut = p(t, 44, 45), up = p(t, 46.6, 49, E.io), sh = p(t, 49, 51.4, E.io) * (1 - p(t, 52.6, 54.4, E.io));
        const piece = (a, b, kk, shift, fillc, fo, strokec, sw, op) => {
          let d = '';
          for (let i = 0; i <= 70; i++) { const x = lerp(a, b, i / 70); d += (i ? 'L' : 'M') + f2s(X(x + shift)) + ' ' + f2s(YY(kk * fEx(x))); }
          return path(d + `L${f2s(X(b + shift))} ${base}L${f2s(X(a + shift))} ${base}Z`, { fill: fillc, fo, op }) + path(d, { stroke: strokec, sw, op });
        };
        const fa = (cd > 0.99 ? 1 : 0) * (1 - cut) * c3;
        o += on(fa, path(areaD(fEx, 0, 120, X, YY, base, 100), { fill: C.A, fo: 0.25, op: fa }));
        o += path(curve(fEx, 0, 120, X, YY, 100), { stroke: C.ink, sw: 2.6, op: c3 * (1 - 0.55 * cut), ...draw(cd) });
        const ct = p(t, 43.6, 44.4) * c3;
        o += on(ct, ln(X(s0), base + 4, X(s0), 128, { stroke: C.hi, sw: 3, da: '5 4', op: ct }) + tx(X(s0) + 10, 150, '*X* > 30', { size: 22, fill: C.hi, ta: 'start', op: ct }));
        /* la coda: si alza (rinormalizzazione) e si trasla fino a 0 */
        if (cut > 0.01) o += piece(s0, 120, lerp(1, kfull, up), -s0 * sh, C.hi, 0.3 * cut, C.hi, 2.8, c3 * cut);
        const fm = p(t, 41.2, 42, E.out) * c3, fb = p(t, 55, 56) * c3;
        o += on(fm * (1 - cut), fulc(X(20), base + 36, C.B, fm * (1 - cut)) + tx(X(20), base + 74, 'media 20', { size: 22, fill: C.B, op: fm * (1 - cut) }));
        o += on(fb, fulc(X(50), base + 36, C.B, fb) + tx(X(50), base + 74, 'media 50', { size: 22, fill: C.B, op: fb }));
        const st = p(t, 50.6, 51.4) * c3 * (1 - p(t, 52.4, 53));
        o += on(st, tx(X(66), 176, 'la stessa curva, ripartita da 0', { size: 22, fill: C.hi, op: st }));
        const br = p(t, 55.6, 56.4) * c3;
        o += on(br, tx(X(88), 200, '30 + 20 = 50', { size: 28, fill: C.B, op: br }));
      }
      return o;
    },
  });

  /* ======================================================================
     3.7 · Condizionare a un'altra variabile: la media delle medie
     ====================================================================== */
  const BYm = (e) => 286 - 0.2 * (e - 1500); // stipendio → quota (asse che parte da 1500 €)
  const NXs = (v) => 130 + 460 * v;          // posizione sul nastro, da 0 a 1 m
  const TAPE = [[0.8, 152], [0.5, 214], [0.2, 276]]; // primo taglio e quota della riga

  PV.add('torre', {
    sec: '3.7',
    short: 'La media delle medie',
    title: 'E[X | Y] e la media delle medie: E[E[X | Y]] = E[X]',
    alt: 'Animazione: la media degli stipendi di un’azienda è la media dei reparti pesata con il numero di persone (2040 euro, non 2000); con due monete, la media di Y dentro i gruppi X = 0 e X = 1 vale 0,5 e 1,5, e la media di queste medie è 1, cioè E[Y]; il nastro tagliato due volte, in cui il secondo taglio cade in media a metà del primo, quindi E[X] = 1/4 di metro.',
    dur: 59.5,
    poster: 17.6,
    chap: [[0, 'Media aziendale = media dei reparti'], [21.8, 'Due monete: E[Y | X]'], [41.4, 'Il nastro tagliato due volte']],
    caps: [
      [0, 'Un’azienda ha due reparti: vendite, 20 persone con stipendio medio 1 800 €, e tecnico, 30 persone con 2 200 €.'],
      [7.4, 'La media semplice delle due medie, 2 000 €, è sbagliata: non tiene conto di quanti sono.'],
      [12.8, 'La media aziendale pesa i gruppi: (20 · 1 800 + 30 · 2 200)/50 = 2 040 €. Le due aree fuori dalla linea sono uguali.'],
      [21.8, 'Lancio due monete. *X* = 1 se la prima è testa, *Y* = numero totale di teste. Raggruppo i quattro esiti per *X*.'],
      [29, 'Dentro ogni gruppo calcolo la media di *Y*: *E*[*Y* | *X* = 0] = 0,5 e *E*[*Y* | *X* = 1] = 1,5.'],
      [35.4, '*E*[*Y* | *X*] è una variabile: vale 0,5 o 1,5. La sua media, 1, è proprio *E*[*Y*].'],
      [41.4, 'Un nastro di 1 metro: primo taglio in un punto *Y* a caso, secondo taglio a caso nel pezzo di sinistra. Quanto è lungo, in media?'],
      [49.8, 'Dato il primo taglio *Y* = *y*, il secondo è uniforme su [0, *y*]: in media cade a *y*/2.'],
      [55.6, 'Quindi *E*[*X*] = *E*[*Y*/2] = 1/4 di metro: 25 cm.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 21.4, 'La media aziendale', 'media dei reparti, pesata con le persone') + heading(t, 22, 41, 'Due monete', '*E*[*Y* | *X*] è una variabile aleatoria') + heading(t, 41.6, 59.7, 'Il nastro tagliato due volte', '*E*[*E*[*X* | *Y*]] = *E*[*X*]');

      /* capitolo 1: stipendi per reparto */
      const c1 = vis(t, 0.4, 21.4, 0.6, 0.6);
      if (c1 > 0.004) {
        for (let i = 0; i < 50; i++) {
          const u = p(t, 0.8 + i * 0.035, 1.3 + i * 0.035, E.back);
          if (u > 0.01) o += circ(75 + 10 * i, 104, 3.8 * Math.min(u, 1), { fill: i < 20 ? C.A : C.B, op: c1 });
        }
        o += g({ op: c1 }, ln(64, 286, 580, 286, { stroke: C.soft, sw: 1.8 }) + ln(64, 286, 64, 150, { stroke: C.soft, sw: 1.8 }) + [1500, 2000].map((v) => ln(60, BYm(v), 68, BYm(v), { stroke: C.soft, sw: 1.6 }) + tx(54, BYm(v) + 6, v, { ff: SANS, size: 17, fill: C.soft, ta: 'end' })).join(''));
        const bV = p(t, 3, 4.6), bT = p(t, 4, 5.6);
        o += on(bV, rect(72, 286 - 60 * bV, 196, 60 * bV, { fill: C.A, fo: 0.55, stroke: C.A, sw: 1.8, op: c1 }));
        o += on(bT, rect(272, 286 - 140 * bT, 296, 140 * bT, { fill: C.B, fo: 0.55, stroke: C.B, sw: 1.8, op: c1 }));
        const gl = p(t, 4.8, 5.6) * c1;
        o += on(gl, tx(170, 311, 'vendite: 20', { size: 20, fill: C.A, op: gl }) + tx(420, 311, 'tecnico: 30', { size: 20, fill: C.B, op: gl }));
        const vl2 = p(t, 5.6, 6.4) * c1;
        o += on(vl2, tx(170, 286 - 20, '1 800 €', { size: 22, fill: C.paper, op: vl2 }) + tx(420, 286 - 54, '2 200 €', { size: 22, fill: C.paper, op: vl2 }));
        /* media semplice: sbagliata */
        const nv = p(t, 7.6, 8.6) * c1 * (1 - p(t, 12, 12.6));
        o += on(nv, ln(64, BYm(2000), 576, BYm(2000), { stroke: NO, sw: 2.6, da: '7 5', op: nv }) + tx(320, 136, '(1 800 + 2 200)/2 = 2 000', { size: 24, fill: NO, op: nv }) + cross(580, BYm(2000), 22, p(t, 9, 9.8, E.lin), { op: nv }));
        /* media pesata: l'area che manca a destra compensa quella che avanza */
        const wl = p(t, 13, 14.6, E.io) * c1;
        o += on(wl, ln(64, BYm(2040), lerp(64, 576, p(t, 13, 14.6, E.io)), BYm(2040), { stroke: C.hi, sw: 3.6, op: c1 }));
        const wt = p(t, 14.4, 15.2) * c1;
        o += on(wt, tx(320, 136, '(20 · 1 800 + 30 · 2 200)/50 = 2 040', { size: 24, op: wt }) + tx(588, BYm(2040) + 6, '2 040', { ff: SANS, size: 17, fill: C.hi, ta: 'start', op: wt }));
        const ar = p(t, 17, 18.6) * c1;
        o += on(ar, rect(72, BYm(2040), 196, BYm(1800) - BYm(2040), { fill: C.hi, fo: 0.4 * ar, stroke: C.hi, sw: 1.4, op: c1 }) + rect(272, BYm(2200), 296, BYm(2040) - BYm(2200), { fill: C.hi, fo: 0.4 * ar, op: c1 }));
        const pl = p(t, 18.8, 19.6) * c1;
        o += on(pl, pills(342, [{ s: 'media pesata 2 040 €, non 2 000 €', icon: 'ok', col: OK, op: pl, u: p(t, 19, 19.8, E.lin) }]));
      }

      /* capitolo 2: due monete, X = prima testa, Y = numero di teste */
      const c2 = vis(t, 22, 41, 0.6, 0.6);
      if (c2 > 0.004) {
        const grp = [{ cx: 190, lab: '*X* = 0', col: C.A, outs: [['CT', 1], ['CC', 0]], t0: 23.4, mean: '*E*[*Y* | *X* = 0] = 0,5' }, { cx: 450, lab: '*X* = 1', col: C.B, outs: [['TT', 2], ['TC', 1]], t0: 24.4, mean: '*E*[*Y* | *X* = 1] = 1,5' }];
        grp.forEach((gp, k) => {
          const u = p(t, gp.t0, gp.t0 + 0.9) * c2;
          if (u <= 0.004) return;
          o += rect(gp.cx - 120, 122, 240, 128, { rx: 10, fill: gp.col, fo: 0.08, stroke: gp.col, sw: 2, op: u }) + tx(gp.cx, 108, gp.lab, { size: 24, fill: gp.col, op: u });
          gp.outs.forEach(([lab, y], i) => {
            const x = gp.cx + (i ? 52 : -52), v = p(t, gp.t0 + 0.6 + i * 0.4, gp.t0 + 1.4 + i * 0.4, E.back);
            o += on(v, tile(x, 168, 62, lab, { op: c2 * Math.min(v, 1), size: 26, sc: 0.6 + 0.4 * Math.min(v, 1) }) + tx(x, 226, '*Y* = ' + y, { size: 22, fill: gp.col, op: c2 * p(t, gp.t0 + 1.4 + i * 0.4, gp.t0 + 2 + i * 0.4) }));
          });
          const m = p(t, 29.6 + k * 1.2, 30.6 + k * 1.2) * c2;
          o += on(m, tx(gp.cx, 284, gp.mean, { size: 22, fill: gp.col, op: m }));
          const w = p(t, 35.4 + k * 0.5, 36.2 + k * 0.5) * c2;
          o += on(w, tx(gp.cx + 52, 108, '(prob. 1/2)', { size: 20, fill: C.soft, ta: 'start', op: w }));
        });
        const pe = p(t, 37, 37.8) * c2;
        o += on(pe, pills(332, [{ s: '*E*[*E*[*Y* | *X*]] = 0,5 · 1/2 + 1,5 · 1/2 = 1 = *E*[*Y*]', icon: 'ok', col: OK, op: pe, u: p(t, 37.3, 38.1, E.lin) }]));
      }

      /* capitolo 3: il nastro tagliato due volte */
      const c3 = vis(t, 41.6, 59.7, 0.6, 0.01);
      if (c3 > 0.004) {
        const ml = p(t, 55.8, 56.8) * c3;
        o += on(ml, ln(NXs(0.25), 124, NXs(0.25), 300, { stroke: C.hi, sw: 3, da: '6 5', op: ml }) + tx(NXs(0.25), 112, '1/4', { size: 26, fill: C.hi, op: ml }));
        TAPE.forEach(([yc, y], i) => {
          const u = p(t, 42.4 + i * 0.5, 43.4 + i * 0.5) * c3;
          o += on(u, rect(NXs(0), y - 13, 460, 26, { rx: 3, stroke: C.soft, sw: 1.8, op: u }));
          const cutu = p(t, 44.4 + i * 1.5, 45.4 + i * 1.5) * c3;
          o += on(cutu, rect(NXs(0), y - 13, 460 * yc, 26, { rx: 3, fill: C.A, fo: 0.3 * cutu, op: c3 }) + ln(NXs(yc), y - 22, NXs(yc), y + 22, { stroke: C.hi, sw: 3.4, op: cutu }) + tx(118, y + 7, '*Y* = ' + nc(yc, 1), { size: 20, ta: 'end', op: cutu }));
          const mu = p(t, 50.2 + i * 1.2, 51.2 + i * 1.2, E.back) * c3;
          o += on(mu, path(`M${NXs(yc / 2)} ${y - 15}l9 15l-9 15l-9 -15Z`, { fill: C.B, stroke: C.paper, sw: 1.2, op: c3 * Math.min(mu, 1) }) + tx(NXs(yc / 2), y + 40, '*E*[*X* | *Y* = ' + nc(yc, 1) + '] = ' + nc(yc / 2, yc === 0.5 ? 2 : 1), { size: 17, fill: C.B, stroke: C.paper, sw: 5, paint_order: 'stroke', lj: 'round', op: c3 * p(t, 51 + i * 1.2, 51.8 + i * 1.2) }));
        });
        const pl = p(t, 57.2, 58) * c3;
        o += on(pl, pills(342, [{ s: '*E*[*X*] = *E*[*Y*/2] = 1/4 di metro = 25 cm', op: pl }]));
      }
      return o;
    },
  });

  /*@@FINE@@*/
})();
