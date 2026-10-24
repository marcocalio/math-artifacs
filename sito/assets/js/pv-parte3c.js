/* =========================================================================
   pv-parte3c.js — video della Parte 3 (Modelli continui): sezioni 3.5
   (funzioni di una variabile aleatoria) e 3.6 (due variabili continue insieme).
   3.5: lineare, quadrato, monotona, duerami, inversione.
   3.6: congiuntac, appuntamento, condizc, convoluzione, minmaxc.
   Si appoggia a pv.js: ogni video è un PV.add(id, {...}).
   Tutti i tempi sono in secondi; le coordinate sono nel riquadro 640 × 360.
   ========================================================================= */
(function () {
  'use strict';
  const { f, lerp, E, p, rnd, C, SANS, rect, circ, ln, path, g, draw, tx, txc, check, cross, vis, on, bump, heading, lb, fr, brace, wipe, pills, at, esc } = PV.h;
  const OK = 'var(--verde)', NO = 'var(--rosso)';

  /* freccia da (x1,y1) a (x2,y2) che si disegna (u da 0 a 1); la punta compare a fine corsa */
  function arrow(x1, y1, x2, y2, u, col, op = 1, sw = 2.2) {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 8;
    let o = path(`M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`, { stroke: col, sw, op, ...draw(u) });
    if (u > 0.92) o += path(`M${f(x2)} ${f(y2)}L${f(x2 - h * Math.cos(a - 0.45))} ${f(y2 - h * Math.sin(a - 0.45))}M${f(x2)} ${f(y2)}L${f(x2 - h * Math.cos(a + 0.45))} ${f(y2 - h * Math.sin(a + 0.45))}`, { stroke: col, sw, lc: 'round', op });
    return o;
  }
  /* segmento che si disegna da solo: è un path (pathLength è affidabile sui path in ogni browser) */
  const segd = (x1, y1, x2, y2, a = {}) => path(`M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`, a);
  /* curva y = fn(x) per x in [a, b]: X e Y portano dominio → pixel */
  const curveD = (fn, a, b, X, Y, n = 80) => {
    let d = '';
    for (let i = 0; i <= n; i++) {
      const x = a + ((b - a) * i) / n;
      d += (i ? 'L' : 'M') + f(X(x)) + ' ' + f(Y(fn(x)));
    }
    return d;
  };
  /* area sotto la curva fra a e b, chiusa sulla base (pixel y0) */
  const areaD = (fn, a, b, X, Y, y0, n = 80) => curveD(fn, a, b, X, Y, n) + `L${f(X(b))} ${f(y0)}L${f(X(a))} ${f(y0)}Z`;
  /* numero di passo: cerchio col bordo oro */
  const badge = (x, y, n, op = 1) => g({ op }, circ(x, y - 6, 13, { fill: C.paper, stroke: C.hi, sw: 2.6 }) + tx(x, y, n, { size: 18 }));

  /* ======================================================================
     3.5 · Y = aX + b: il metodo in tre passi (Celsius → Fahrenheit) e il caso a < 0
     ====================================================================== */
  const LX0 = 64, LS = 12, LYT = 176, LYB = 318, LH = 84; // origine degli assi, px per unità, basi dei due pannelli, altezza di 1/10
  const lxC = (v) => LX0 + LS * (v - 20); // °C → pixel (asse in alto)
  const LCFG = {
    F: { px: (k) => LX0 + 21.6 * k, w: 216, h: LH / 1.8, dens: '1/18', ticks: [['68', LX0], ['77', LX0 + 108], ['86', LX0 + 216]], unit: '°F' }, // Y = 1,8X + 32
    N: { px: (k) => LX0 + 240 - 24 * k, w: 240, h: LH / 2, dens: '1/20', ticks: [['−60', LX0], ['−50', LX0 + 120], ['−40', LX0 + 240]], unit: '' }, // Y = −2X
  };

  PV.add('lineare', {
    sec: '3.12',
    short: 'Funzioni di una variabile',
    title: 'Funzioni di una variabile: il metodo in tre passi con Y = 1,8X + 32',
    alt: 'Animazione: una temperatura uniforme fra 20 e 30 gradi Celsius diventa Y = 1,8X + 32 in Fahrenheit; il metodo in tre passi (ripartizione, disuguaglianza risolta rispetto a X, derivata) dà Y uniforme fra 68 e 86, con l’intervallo più largo di 1,8 volte e la densità che scende da 1/10 a 1/18. Con un coefficiente negativo, Y = −2X, l’asse si capovolge e la disuguaglianza si gira.',
    dur: 63,
    poster: 29.6,
    chap: [[0, 'Il metodo in tre passi'], [31, 'La densità si stira'], [44.6, 'Se il coefficiente è negativo']],
    caps: [
      [0, 'La temperatura di domani a mezzogiorno è uniforme fra 20 e 30 gradi Celsius. In Fahrenheit è *Y* = 1,8*X* + 32: che legge ha *Y*?'],
      [8.2, 'Passo 1: la ripartizione di *Y* si scrive per definizione. Scelgo 77 °F: *F*_Y(*y*) è la probabilità che *Y* non lo superi.'],
      [15.2, 'Passo 2: risolvo la disuguaglianza. 1,8*X* + 32 ≤ 77 vuol dire *X* ≤ 25: è lo stesso evento, quindi ha la stessa probabilità, 1/2.'],
      [22.5, 'Con la ripartizione dell’uniforme esce *F*_Y(*y*) = (*y* − 68)/18.'],
      [26.5, 'Passo 3: derivo. La densità è la costante 1/18: *Y* è uniforme fra 68 e 86.'],
      [31, 'La probabilità non si stira, la densità sì: l’intervallo passa da largo 10 a largo 18, e l’altezza scende da 1/10 a 1/18.'],
      [38.5, 'Tenere 1/10 darebbe area 1,8: sbagliato. La regola è *f*_Y(*y*) = *f*_X((*y* − *b*)/*a*) / |*a*|: 1/|*a*| è lo stiramento.'],
      [44.6, 'Se *a* è negativo l’asse si capovolge. Con *Y* = −2*X* le linee si incrociano: *Y* ≤ −50 vuol dire *X* ≥ 25, non *X* ≤ 25.'],
      [52, 'Il passo 2 gira la disuguaglianza: *F*_Y(*y*) = 1 − *F*_X(−*y*/2).'],
      [57, 'Derivando, il segno meno sparisce: |−2| = 2 e *f*_Y = 1/20. Una densità non è mai negativa.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 30.4, 'Il metodo in tre passi', '*Y* = 1,8*X* + 32: da Celsius a Fahrenheit') + heading(t, 31, 44.2, 'La densità si stira con l’asse', 'la probabilità no') + heading(t, 44.8, 63.4, 'Se il coefficiente è negativo', '*Y* = −2*X*: l’asse si capovolge');

      /* ---- pannello alto: X ~ U(20, 30), densità 1/10 ---- */
      const a0 = p(t, 0.5, 1.5), ru = p(t, 1.3, 3), th = LH * ru, sl = p(t, 3, 4);
      o += g({ op: a0 }, ln(LX0 - 8, LYT, lxC(30) + 14, LYT, { stroke: C.soft, sw: 1.8 }) + [20, 25, 30].map((v) => ln(lxC(v), LYT - 4, lxC(v), LYT + 4, { stroke: C.soft, sw: 1.6 }) + lb(lxC(v), LYT + 24, v)).join('') + lb(lxC(30) + 24, LYT + 24, '°C', { ta: 'start' }));
      o += rect(LX0, LYT - th, 120, th, { fill: C.A, fo: 0.28, stroke: C.A, sw: 2 });
      for (let k = 1; k < 10; k++) o += on(sl, ln(LX0 + 12 * k, LYT - th, LX0 + 12 * k, LYT, { stroke: C.A, sw: 1, so: 0.45 * sl }));
      o += on(sl, lb(LX0 - 8, LYT - LH + 6, '1/10', { ta: 'end', op: sl }) + tx(LX0 + 134, LYT - LH + 28, '*X* ~ U(20, 30)', { ta: 'start', size: 20, fill: C.A, op: sl }));

      /* ---- pannello basso: asse, linee che mandano gli estremi delle fettine, evento, densità di Y ---- */
      const low = (c, op, t0, tr, ev, evOp) => {
        if (op <= 0.004) return '';
        const lab = p(t, t0, t0 + 0.8) * op;
        let r = ln(LX0 - 8, LYB, LX0 + c.w + 14, LYB, { stroke: C.soft, sw: 1.8, op: lab });
        c.ticks.forEach(([s, px]) => (r += ln(px, LYB - 4, px, LYB + 4, { stroke: C.soft, sw: 1.6, op: lab }) + lb(px, LYB + 24, s, { op: lab })));
        if (c.unit) r += lb(LX0 + c.w + 24, LYB + 24, c.unit, { ta: 'start', op: lab });
        for (let k = 0; k <= 10; k++) {
          const u = p(t, t0 + 0.5 + 0.07 * k, t0 + 1.6 + 0.07 * k, E.io);
          if (u > 0.004) r += segd(lxC(20 + k), LYT + 36, c.px(k), LYB - 50, { stroke: C.soft, sw: 1.2, op: op * 0.6, ...draw(u) });
        }
        const q = p(t, t0 + 1.6, t0 + 2.4) * (1 - p(t, tr - 0.5, tr)) * op;
        r += on(q, tx(LX0 + c.w * 0.9, LYB - 12, '?', { size: 44, fill: C.B, op: q * (0.7 + 0.3 * Math.sin(t * 3.2)) }));
        const hu = p(t, tr, tr + 2, E.out) * op, h = c.h * hu;
        if (hu > 0.004) {
          r += rect(LX0, LYB - h, c.w, h, { fill: C.B, fo: 0.28, stroke: C.B, sw: 2, op });
          for (let k = 1; k < 10; k++) r += ln(LX0 + (c.w * k) / 10, LYB - h, LX0 + (c.w * k) / 10, LYB, { stroke: C.B, sw: 1, so: 0.45, op });
          r += lb(LX0 - 8, LYB - c.h + 6, c.dens, { ta: 'end', op: hu });
        }
        if (evOp > 0.004) r += ln(ev[0], LYB, ev[1], LYB, { stroke: C.B, sw: 5.5, lc: 'round', op: evOp });
        return r;
      };
      const f12 = 1 - p(t, 43.8, 44.6), f3 = p(t, 44, 44.8);
      const c1 = 1 - p(t, 30.2, 31); // fine del capitolo 1: sparisce l’evento
      const yv = lerp(68, 77, p(t, 9.6, 12.2, E.io)), ypx = LX0 + 12 * (yv - 68);
      o += low(LCFG.F, f12, 4.4, 27.2, [LX0, ypx], p(t, 9.4, 10.4) * c1);
      o += low(LCFG.N, f3, 44.8, 58.2, [LX0, LX0 + 120], p(t, 46.2, 47.2));

      /* marcatore oro sul valore y scelto (capitolo 1) e collegamento con x = 25 */
      const mk1 = p(t, 9.4, 10.4) * c1;
      if (mk1 > 0.004) o += ln(ypx, LYB - 50, ypx, LYB, { stroke: C.hi, sw: 2.4, da: '5 4', op: mk1 }) + circ(ypx, LYB, 5, { fill: C.hi, op: mk1 });
      const lk1 = p(t, 15.8, 17.2, E.io) * c1;
      if (lk1 > 0.004) {
        o += segd(lxC(25), LYT + 36, LX0 + 108, LYB - 50, { stroke: C.hi, sw: 3, lc: 'round', op: c1, ...draw(lk1) });
        o += ln(lxC(25), LYT - LH, lxC(25), LYT, { stroke: C.hi, sw: 2.4, da: '5 4', op: p(t, 15.8, 16.6) * c1 }) + circ(lxC(25), LYT, 5, { fill: C.hi, op: p(t, 15.8, 16.6) * c1 });
        const sh = p(t, 17.2, 18.4) * c1;
        o += on(sh, rect(LX0, LYT - LH, 60, LH, { fill: C.A, fo: 0.5 * sh }) + tx(LX0 + 30, LYT - LH / 2 + 8, '1/2', { size: 22, op: sh }));
      }
      /* testi sopra il segmento: P(Y ≤ 77) = 1/2 */
      const ql = vis(t, 12.4, 26.8, 0.5, 0.5) * c1, qe = p(t, 18.6, 19.4) * (1 - p(t, 26.6, 27.2)) * c1;
      o += on(ql, tx(LX0 + 52, LYB - 20, '*P*(*Y* ≤ 77)', { size: 20, fill: C.B, op: ql }));
      o += on(qe, tx(LX0 + 140, LYB - 20, '= 1/2', { size: 20, fill: C.B, op: qe }));

      /* ---- colonna di destra: le righe si scrivono da sinistra a destra ---- */
      const line = (n, y, s, t0, a = {}) => {
        const u = p(t, t0, t0 + 0.9, E.out);
        return u > 0.004 ? wipe('cp-lineare-' + n + '-' + Math.round(t * 100), 366, y - 26, 270, 38, u, a.parts ? txc(372, y, a.parts, { ta: 'start', size: a.size || 22 }) : tx(372, y, s, { ta: 'start', size: a.size || 22, fill: a.fill || C.ink })) : '';
      };
      if (c1 > 0.004) {
        const hd = vis(t, 4.6, 8.4, 0.6, 0.5);
        let r = on(hd, tx(372, 160, '*Y* = 1,8*X* + 32', { ta: 'start', size: 30, fill: C.B, op: hd }));
        r += badge(346, 156, 1, p(t, 8.6, 9.2)) + badge(346, 232, 2, p(t, 15.6, 16.2)) + badge(346, 308, 3, p(t, 26.4, 27));
        r += line(1, 156, '*F*_Y(*y*) = *P*(*Y* ≤ *y*)', 9.2) + line(2, 188, '= *P*(1,8*X* + 32 ≤ *y*)', 11.8);
        r += line(3, 232, '= *P*(*X* ≤ (*y* − 32)/1,8)', 16.2) + line(4, 264, '= (*y* − 68)/18', 22.9);
        r += line(5, 308, '*f*_Y(*y*) = 1/18', 27) + line(6, 340, '*Y* ~ U(68, 86)', 28.6, { fill: C.B, size: 24 });
        r += check(560, 332, 20, p(t, 29.2, 29.9, E.lin));
        o += g({ op: c1 }, r);
      }

      /* ---- capitolo 2: la densità si stira ---- */
      const c2 = vis(t, 31.2, 44, 0.6, 0.6);
      if (c2 > 0.004) {
        const row = (y, label, a, b, fac, t0) => {
          const u = p(t, t0, t0 + 0.7) * c2;
          return on(u, lb(372, y - 34, label, { ta: 'start', op: u }) + tx(372, y, a + '  →  ' + b, { ta: 'start', size: 28, op: u }) + (fac ? tx(612, y, fac, { ta: 'end', size: 26, fill: C.B, op: u }) : ''));
        };
        const rw = 1 - p(t, 38, 38.6);
        o += g({ op: rw }, row(150, 'larghezza', '10', '18', '× 1,8', 31.8) + row(228, 'altezza', '1/10', '1/18', '÷ 1,8', 34.2) + row(306, 'area', '1', '1', '', 36.2));
        const hw = p(t, 32, 32.6) * (1 - p(t, 34, 34.6)) * c2, hh = p(t, 34.4, 35) * (1 - p(t, 36, 36.6)) * c2, ha = p(t, 36.4, 37) * (1 - p(t, 38, 38.6)) * c2;
        o += on(hw, ln(LX0, LYT, LX0 + 120, LYT, { stroke: C.hi, sw: 6, lc: 'round', op: hw }) + ln(LX0, LYB, LX0 + 216, LYB, { stroke: C.hi, sw: 6, lc: 'round', op: hw }));
        o += on(hh, ln(LX0 + 120, LYT - LH, LX0 + 120, LYT, { stroke: C.hi, sw: 6, lc: 'round', op: hh }) + ln(LX0 + 216, LYB - LH / 1.8, LX0 + 216, LYB, { stroke: C.hi, sw: 6, lc: 'round', op: hh }));
        o += on(ha, rect(LX0, LYT - LH, 120, LH, { fill: C.hi, fo: 0.4 * ha }) + rect(LX0, LYB - LH / 1.8, 216, LH / 1.8, { fill: C.hi, fo: 0.4 * ha }));
        const al = vis(t, 37, 38.8, 0.5, 0.5) * c2;
        o += on(al, tx(LX0 + 60, LYT - LH / 2 + 8, 'area 1', { size: 20, op: al }) + tx(LX0 + 108, LYB - LH / 3.6 + 8, 'area 1', { size: 20, op: al }));
        /* il rettangolo sbagliato: altezza 1/10 su base 18 */
        const gh = vis(t, 38.6, 43, 0.6, 0.6) * c2;
        o += on(gh, rect(LX0, LYB - LH, 216, LH, { fill: NO, fo: 0.08 * gh, stroke: NO, so: gh, sw: 2.4, da: '7 5' }));
        const g1 = p(t, 39, 39.8) * (1 - p(t, 43.2, 43.8)) * c2;
        o += on(g1, lb(372, 124, 'tenere 1/10 su base 18:', { ta: 'start', op: g1 }) + tx(372, 162, '18 · 1/10 = 1,8', { ta: 'start', size: 28, fill: NO, op: g1 }) + cross(586, 154, 24, p(t, 39.8, 40.4, E.lin), { op: g1 }));
        const rl = p(t, 41, 41.8) * c2;
        if (rl > 0.004) {
          o += rect(340, 206, 282, 112, { rx: 12, fill: C.hi, fo: 0.08 * rl, stroke: C.hi, so: rl, sw: 2.4 });
          o += tx(352, 268, '*f*_Y(*y*) =', { ta: 'start', size: 22, op: rl });
          o += fr(520, 262, '*f*_X((*y* − *b*)/*a*)', '|*a*|', { size: 20, op: rl });
          o += lb(481, 308, '1/|*a*| = lo stiramento', { op: p(t, 42.2, 43) * c2 });
        }
      }

      /* ---- capitolo 3: a < 0, l’asse si capovolge ---- */
      const c3 = vis(t, 45, 63, 0.6, 0.01);
      if (c3 > 0.004) {
        const lk = p(t, 47.2, 48.4, E.io) * c3;
        o += segd(lxC(25), LYT + 36, LX0 + 120, LYB - 50, { stroke: C.hi, sw: 3, lc: 'round', op: c3, ...draw(lk) });
        const sh3 = p(t, 48.6, 49.8) * c3;
        o += on(sh3, ln(lxC(25), LYT - LH, lxC(25), LYT, { stroke: C.hi, sw: 2.4, da: '5 4', op: sh3 }) + circ(lxC(25), LYT, 5, { fill: C.hi, op: sh3 }) + rect(lxC(25), LYT - LH, 60, LH, { fill: C.A, fo: 0.5 * sh3 }) + tx(lxC(25) + 30, LYT - LH / 2 + 8, '1/2', { size: 22, op: sh3 }));
        const m3 = p(t, 46.2, 47.2) * c3;
        o += on(m3, ln(LX0 + 120, LYB - 50, LX0 + 120, LYB, { stroke: C.hi, sw: 2.4, da: '5 4', op: m3 }) + circ(LX0 + 120, LYB, 5, { fill: C.hi, op: m3 }));
        const q3 = vis(t, 47.4, 57.6, 0.5, 0.5) * c3, e3 = p(t, 50.4, 51.2) * (1 - p(t, 57.4, 57.9)) * c3;
        o += on(q3, tx(LX0 + 62, LYB - 20, '*P*(*Y* ≤ −50)', { size: 20, fill: C.B, op: q3 }));
        o += on(e3, tx(LX0 + 150, LYB - 20, '= 1/2', { size: 20, fill: C.B, op: e3 }));
        /* la colonna: la disuguaglianza si gira */
        const f2 = p(t, 52.6, 53.2) * c3;
        o += line(11, 156, '*F*_Y(*y*) = *P*(−2*X* ≤ *y*)', 51.4) + line(12, 190, '', 52.4, { parts: [['= *P*(*X* ', C.ink], ['≥', C.B], [' −*y*/2)', C.ink]] });
        o += on(f2, tx(372, 214, 'diviso per −2: il verso si gira', { ta: 'start', size: 17, ff: SANS, fill: C.B, op: f2 }));
        o += line(13, 250, '= 1 − *F*_X(−*y*/2)', 54.4);
        o += line(14, 290, 'derivo: *f*_Y(*y*) = *f*_X(−*y*/2)/2', 57.4) + line(15, 322, '= (1/10)/2 = 1/20', 59.6, { fill: C.B });
      }
      return o;
    },
  });

  /* ======================================================================
     3.5 · Y = X² con X uniforme su (0, 1): i quadrati si ammassano verso 0
     ====================================================================== */
  const QN = 100, QNB = 20, QW = 1 / QNB; // cento punti, venti colonne larghe 0,05
  const QX0 = 80, QXW = 480, QYT = 124, QYB = 300; // ascissa di 0, larghezza dell’intervallo [0, 1], asse in alto e in basso
  const qpx = (v) => QX0 + QXW * v;
  const QXS = Array.from({ length: QN }, (_, k) => (k + 0.25 + 0.5 * rnd(k + 5)) / QN); // un punto per fettina: «uniformi» ben distribuiti
  const QBIN = QXS.map((x) => Math.min(QNB - 1, Math.floor((x * x) / QW)));
  const QORD = Array.from({ length: QN }, (_, j) => (j * 37) % QN); // ordine con cui cadono
  const QRANK = (() => { const c = Array(QNB).fill(0), r = Array(QN); QORD.forEach((k) => { r[k] = c[QBIN[k]]++; }); return r; })(); // posto nel mucchio
  const QT0 = 13.8, QDT = 0.06, QFL = 0.7; // inizio della pioggia, intervallo fra due punti, durata del volo

  PV.add('quadrato', {
    sec: '3.12',
    short: 'Il quadrato di un numero a caso',
    title: 'Il quadrato di un numero a caso: Y = X² con X uniforme su (0, 1)',
    alt: 'Animazione: cento numeri uniformi fra 0 e 1 cadono sul loro quadrato e si ammassano vicino a 0 (0,5 diventa 0,25 e 0,1 diventa 0,01). Il metodo dà F_Y(y) = P(X ≤ √y) = √y e, derivando, f_Y(y) = 1/(2√y), la curva che coincide con l’istogramma; P(Y ≤ 0,25) = 0,5 e l’area totale è 1.',
    dur: 60,
    poster: 57.5,
    chap: [[0, 'Cento numeri al quadrato'], [21.4, 'La ripartizione di Y'], [41.6, 'La densità di Y']],
    caps: [
      [0, 'Scelgo un numero a caso fra 0 e 1, *X*, e lo elevo al quadrato: *Y* = *X*². Anche *Y* sta fra 0 e 1, ma è ancora uniforme?'],
      [7.6, 'Elevare al quadrato rimpicciolisce un numero fra 0 e 1: 0,5 diventa 0,25 e 0,1 diventa 0,01.'],
      [13.6, 'Faccio cadere cento numeri a caso: i quadrati si ammassano verso lo zero, e il mucchio vicino a 0 diventa alto.'],
      [21.4, 'Per la ripartizione: *X*² ≤ 0,25 succede esattamente quando *X* ≤ 0,5. Sono gli stessi punti, e sono metà.'],
      [28.6, 'Passo 1: *F*_Y(*y*) = *P*(*X*² ≤ *y*). Passo 2: *X* non è mai negativo, quindi *X*² ≤ *y* vuol dire *X* ≤ √*y*.'],
      [35.8, 'Per l’uniforme la probabilità è la lunghezza: *F*_Y(*y*) = √*y*. Con *y* = 0,25 viene 0,5.'],
      [41.6, 'Passo 3: derivo √*y* = *y*^{1/2}. La densità è 1/(2√*y*): altissima vicino a 0, poi sempre più bassa.'],
      [48.4, 'Sovrapposta ai cento punti, la curva coincide con il mucchio che si era formato.'],
      [53.7, 'L’area totale è 1, perché *F*_Y(1) = √1 = 1, e metà dell’area sta già entro 0,25.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 21, 'Il quadrato di un numero a caso', '*X* ~ U(0, 1) e *Y* = *X*²') + heading(t, 21.6, 41.2, 'La ripartizione di *Y*', '*F*_Y(*y*) = *P*(*X*² ≤ *y*)') + heading(t, 41.8, 60.4, 'La densità di *Y*', 'derivo la ripartizione');
      const c3 = p(t, 41.2, 42.2), f1 = 1 - c3; // da qui in poi il capitolo 3
      const up = 1 - p(t, 41, 42); // i punti in alto sono visibili fino al capitolo 3

      /* ---- asse in alto: X, cento punti ---- */
      const ax = p(t, 0.5, 1.5);
      o += on(ax * up, g({ op: ax * up }, ln(QX0 - 10, QYT, qpx(1) + 12, QYT, { stroke: C.soft, sw: 1.8 }) + [[0, '0'], [0.5, '0,5'], [1, '1']].map(([v, s]) => ln(qpx(v), QYT - 4, qpx(v), QYT + 4, { stroke: C.soft, sw: 1.6 }) + lb(qpx(v), QYT + 22, s)).join('') + tx(46, QYT + 8, '*X*', { size: 24, fill: C.A })));
      const fall = (j) => QT0 + QDT * j; // istante di partenza del j-esimo punto
      const idx = Array(QN); QORD.forEach((k, j) => (idx[k] = j));
      let dots = '';
      for (let k = 0; k < QN; k++) {
        const u = p(t, 1.4 + 0.012 * k, 1.9 + 0.012 * k, E.back), used = t >= fall(idx[k]) ? 0.3 : 0.95;
        if (u > 0.004) dots += circ(qpx(QXS[k]), QYT, 2.2 * u, { fill: C.A, fo: used });
      }
      o += on(up, g({ op: up }, dots));

      /* ---- asse in basso: Y ---- */
      const ay = p(t, 2.6, 3.6);
      o += on(ay, g({ op: ay }, ln(QX0 - 10, QYB, qpx(1) + 12, QYB, { stroke: C.soft, sw: 1.8 }) + [[0, '0'], [0.25, '0,25'], [0.5, '0,5'], [1, '1']].map(([v, s]) => ln(qpx(v), QYB - 4, qpx(v), QYB + 4, { stroke: C.soft, sw: 1.6 }) + lb(qpx(v), QYB + 22, s)).join('') + tx(46, QYB + 8, '*Y*', { size: 24, fill: C.B })));

      /* ---- i due esempi: 0,5 → 0,25 e 0,1 → 0,01 ---- */
      const ex = (x0, tA, tB, lab, lx, ly) => {
        const pop = p(t, tA, tA + 0.5, E.back), fl = p(t, tA + 0.9, tA + 2.1, E.io), a = x0 * x0;
        const [px, py] = [lerp(qpx(x0), qpx(a), fl), lerp(QYT, QYB, fl)];
        const op = (1 - p(t, tB, tB + 0.6)) * (t >= tA ? 1 : 0);
        if (op <= 0.004) return '';
        let r = ln(qpx(x0), QYT, px, py, { stroke: C.hi, sw: 1.6, da: '4 4', op: op * 0.8 }) + circ(qpx(x0), QYT, 6.5 * pop, { fill: C.hi, op }) + circ(px, py, 6.5 * pop, { fill: C.hi, op });
        r += tx(lx, ly, lab, { size: 24, ta: 'start', op: op * p(t, tA + 1.4, tA + 2.2) * (1 - p(t, tB, tB + 0.5)) });
        return r;
      };
      o += ex(0.5, 8, 10.9, '0,5² = 0,25', 292, 218) + ex(0.1, 10.9, 14.6, '0,1² = 0,01', 160, 218);

      /* ---- la pioggia: i punti cadono sull’asse in basso e formano le colonne ---- */
      const cnt = Array(QNB).fill(0);
      for (let j = 0; j < QN; j++) if (t >= fall(j) + QFL) cnt[QBIN[QORD[j]]]++;
      const qs = lerp(3.6, 8, p(t, 42.2, 45, E.io)); // px per punto: a fine video l’altezza è la densità (40 px per unità)
      let bars = '', fly = '';
      for (let b = 0; b < QNB; b++) {
        const h = cnt[b] * qs;
        if (h > 0) bars += rect(qpx(b * QW) + 1, QYB - h, QXW * QW - 2, h, { fill: C.B, fo: lerp(0.5, 0.22, c3), stroke: C.B, sw: 1.4, so: 0.9 });
      }
      for (let j = 0; j < QN; j++) {
        const u = (t - fall(j)) / QFL;
        if (u <= 0 || u >= 1) continue;
        const k = QORD[j], e = u * u, ex0 = qpx(QXS[k]), ey0 = QYT, ex1 = qpx(QXS[k] * QXS[k]), ey1 = QYB - (QRANK[k] + 0.5) * 3.6;
        const [px, py] = [lerp(ex0, ex1, e), lerp(ey0, ey1, e)];
        fly += ln(ex0, ey0, px, py, { stroke: C.B, sw: 1, so: 0.45 }) + circ(px, py, 3.4, { fill: C.B });
      }
      o += on(f1, g({ op: f1 }, fly));
      o += bars;
      const mu = p(t, 19, 19.8) * (1 - p(t, 20.8, 21.4));
      o += on(mu, tx(216, 214, 'qui il mucchio è alto', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: mu }) + arrow(210, 216, 178, 226, 1, C.soft, mu, 1.6));

      /* ---- capitolo 2: «X ≤ 0,5» e «Y ≤ 0,25» sono gli stessi punti ---- */
      const c2 = vis(t, 21.6, 41.4, 0.6, 0.7);
      if (c2 > 0.004) {
        const gt = p(t, 21.8, 22.8) * c2, gb = p(t, 26, 27) * c2, cn = p(t, 24.6, 26, E.io) * c2;
        let r = rect(qpx(0), QYT - 7, qpx(0.5) - qpx(0), 14, { rx: 4, fill: C.hi, fo: 0.4 * gt });
        for (let k = 0; k < QN; k++) if (QXS[k] <= 0.5) r += circ(qpx(QXS[k]), QYT, 3.4, { fill: C.hi, fo: gt });
        r += tx(200, QYT - 16, '*X* ≤ 0,5', { size: 20, op: gt });
        o += on(gt, r);
        o += segd(qpx(0.5), QYT + 30, qpx(0.25), QYB - 10, { stroke: C.hi, sw: 3, lc: 'round', op: c2, ...draw(cn) });
        if (gb > 0.004) {
          let q = rect(qpx(0), QYB - 7, qpx(0.25) - qpx(0), 14, { rx: 4, fill: C.hi, fo: 0.45 * gb });
          for (let b = 0; b < 5; b++) if (cnt[b] > 0) q += rect(qpx(b * QW) + 1, QYB - cnt[b] * qs, QXW * QW - 2, cnt[b] * qs, { fill: C.hi, fo: 0.7 * gb, stroke: C.hi, sw: 1.4, so: gb });
          o += q + tx(140, QYB - 100, '*Y* ≤ 0,25', { size: 20, op: gb });
        }
        const L = (y, s, t0, a = {}) => {
          const u = p(t, t0, t0 + 0.9, E.out);
          return u > 0.004 ? g({ op: c2 }, wipe('cp-quadrato-' + Math.round(y) + '-' + Math.round(t * 100), 346, y - 26, 285, 38, u, tx(352, y, s, { ta: 'start', size: a.size || 24, fill: a.fill || C.ink }))) : '';
        };
        o += L(170, '*F*_Y(*y*) = *P*(*X*² ≤ *y*)', 28.8) + L(204, '= *P*(*X* ≤ √*y*)', 31.8) + L(238, '= √*y*', 35.9, { fill: C.B, size: 26 });
        o += L(268, '*P*(*Y* ≤ 0,25) = √0,25 = 0,5', 38, { size: 21 });
      }

      /* ---- capitolo 3: la densità 1/(2√y) coincide con l’istogramma ---- */
      if (c3 > 0.004) {
        const dpx = (d) => QYB - 40 * d, fn = (y) => 1 / (2 * Math.sqrt(y)), y0 = 0.0104;
        const va = p(t, 42.4, 43.4) * c3;
        let r = ln(QX0, QYB, QX0, QYB - 204, { stroke: C.soft, sw: 1.6, op: va });
        for (let d = 1; d <= 4; d++) r += ln(QX0 - 5, dpx(d), QX0, dpx(d), { stroke: C.soft, sw: 1.6, op: va }) + lb(QX0 - 10, dpx(d) + 6, d, { ta: 'end', op: va });
        o += on(va, r);
        const cu = p(t, 44.2, 47.4, E.io);
        if (cu > 0.004) o += path(curveD(fn, y0, 1, qpx, dpx, 110), { stroke: C.B, sw: 3.2, lc: 'round', ...draw(cu) });
        const nf = p(t, 47.4, 48.2) * (1 - p(t, 53.4, 54));
        o += on(nf, lb(112, 112, 'verso ∞ in 0', { ta: 'start', op: nf }) + arrow(100, 118, 90, 102, 1, C.soft, nf, 1.6));
        const gs = p(t, 53.8, 55) * c3;
        o += on(gs, path(areaD(fn, y0, 0.25, qpx, dpx, QYB, 70), { fill: C.hi, fo: 0.4 * gs, stroke: C.hi, so: gs, sw: 1.6 }) + tx(qpx(0.065), QYB - 40, '1/2', { size: 24, op: gs }));
        const at = p(t, 56.2, 57) * c3;
        o += on(at, tx(480, QYB - 40, 'area totale = 1', { size: 22, op: at }));
        const Ln = (y, s, t0, a = {}) => {
          const u = p(t, t0, t0 + 0.9, E.out);
          return u > 0.004 ? g({ op: c3 }, wipe('cp-quadrato-b' + Math.round(y) + '-' + Math.round(t * 100), 326, y - 28, 300, 40, u, tx(332, y, s, { ta: 'start', size: a.size || 24, fill: a.fill || C.ink }))) : '';
        };
        o += Ln(150, '*F*_Y(*y*) = *y*^{1/2}', 42.6) + Ln(186, '*f*_Y(*y*) = 1/2 · *y*^{−1/2}', 44.6) + Ln(224, '= 1/(2√*y*)', 46.4, { fill: C.B, size: 28 });
      }
      return o;
    },
  });


  /* ======================================================================
     3.5 · Cambio di variabile per g monotona: U uniforme, Y = −ln U (decrescente) → esponenziale
     ====================================================================== */
  const MX0 = 100, MSY = 110, MUB = 232, MSU = 120, MBB = 316, MK = 40; // origine, px per unità di y, asse u = 0, px per unità di u, base delle colonne, px per unità di densità
  const mpy = (y) => MX0 + MSY * y; // y → pixel (asse orizzontale)
  const mpu = (u) => MUB - MSU * u; // u → pixel (asse verticale del grafico)
  const MU10 = Array.from({ length: 11 }, (_, i) => 1 - i / 10); // estremi delle dieci fettine: 1, 0,9, …, 0
  const MYE = MU10.map((u) => (u > 0 ? -Math.log(u) : Infinity)); // dove finiscono sull’asse di Y
  const mdy = (d) => MBB - MK * d; // densità → pixel

  PV.add('monotona', {
    sec: '3.13',
    short: 'Il cambio di variabile',
    title: 'Il cambio di variabile per una funzione monotona: Y = −ln U è esponenziale',
    alt: 'Animazione: le dieci fettine di probabilità 1/10 di una variabile U uniforme seguono la curva u = e^(−y), scendono sull’asse di Y = −ln U e diventano colonne della stessa area, strette dove la curva è ripida e larghe dove è piatta: f_Y(y) = f_X(g^(−1)(y)) · |(g^(−1))′(y)|. Per la g decrescente −ln la disuguaglianza si gira, F_Y(y) = 1 − e^(−y), e Y è esponenziale di ritmo 1.',
    dur: 62,
    poster: 58,
    chap: [[0, 'Fettine di probabilità uguale'], [24.2, 'Il teorema'], [42.6, 'Il caso decrescente']],
    caps: [
      [0, 'Se *U* è uniforme fra 0 e 1, *Y* = −ln *U* è un numero positivo. Che densità ha? Divido (0, 1) in dieci fettine, ognuna di probabilità 1/10.'],
      [8.4, 'Ogni fettina segue la curva e scende sull’asse di *Y*: diventa una colonna con la stessa area, 1/10.'],
      [16.4, 'Dove la curva è ripida la colonna è stretta e alta, dove è piatta è larga e bassa: l’altezza è 0,1 diviso la larghezza.'],
      [24.2, 'Sulle colonne, la curva liscia è la densità di *Y*. Per una *g* monotona la formula è *f*_Y(*y*) = *f*_X(*g*^{−1}(*y*)) · |(*g*^{−1})′(*y*)|.'],
      [32.2, 'Il fattore è la pendenza della curva in alto, cioè 1/|*g*′(*x*)|: dove *g* stira di più, la densità si abbassa di più.'],
      [39.4, 'In *u* = 0,9 la pendenza è 0,9; in *u* = 0,2 è 0,2.'],
      [42.6, 'Con una *g* decrescente la disuguaglianza si gira: *F*_Y(*y*) = *P*(−ln *U* ≤ *y*) = *P*(*U* ≥ *e*^−*^y*).'],
      [49.6, 'Quindi *F*_Y(*y*) = 1 − *e*^−*^y*: per *y* = 1 fa 0,632. Derivando esce *f*_Y(*y*) = *e*^−*^y*, l’esponenziale con *λ* = 1.'],
      [57.6, 'Un numero a caso, passato per −ln, diventa un’attesa esponenziale.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 23.8, 'Ogni fettina conserva la sua probabilità', '*U* ~ U(0, 1) e *Y* = −ln *U*') + heading(t, 24.4, 42, 'Il teorema del cambio di variabile', 'per una *g* strettamente monotona') + heading(t, 42.8, 62.4, 'Il caso di una funzione decrescente', 'la disuguaglianza si gira');
      const fn = (y) => Math.exp(-y); // la funzione inversa u = e^{−y}, e anche la densità di Y
      const st = 1 - 0.7 * p(t, 24, 25); // le linee a scalini si attenuano nel capitolo 2

      /* ---- U ~ U(0, 1): rettangolo a sinistra dell’asse verticale, dieci fettine orizzontali ---- */
      const ra = p(t, 0.4, 1.4), rw = 40 * p(t, 1.2, 2.8), sl = p(t, 2.6, 3.4);
      let r = ln(MX0, mpu(0), MX0, mpu(1) - 10, { stroke: C.soft, sw: 1.8, op: ra }) + ln(MX0 - 8, mpu(0), mpy(3.3), mpu(0), { stroke: C.soft, sw: 1.8, op: ra });
      r += rect(MX0 - rw, mpu(1), rw, MSU, { fill: C.A, fo: 0.25, stroke: C.A, sw: 2 });
      for (let k = 1; k < 10; k++) r += ln(MX0 - rw, mpu(k / 10), MX0, mpu(k / 10), { stroke: C.A, sw: 1, so: 0.5 * sl });
      r += tx(MX0 - 20, mpu(0) + 24, '*U*', { size: 22, fill: C.A, op: sl });
      o += r;

      /* ---- asse delle colonne: Y ---- */
      const ba = p(t, 2.8, 3.8);
      o += g({ op: ba }, ln(MX0 - 8, MBB, mpy(3.3), MBB, { stroke: C.soft, sw: 1.8 }) + [0, 1, 2, 3].map((v) => ln(mpy(v), MBB - 4, mpy(v), MBB + 4, { stroke: C.soft, sw: 1.6 }) + lb(mpy(v), MBB + 24, v)).join('') + tx(MX0 - 36, MBB + 6, '*Y*', { size: 22, fill: C.B }));
      for (const v of [1, 2, 3]) o += ln(mpy(v), mpu(0) - 4, mpy(v), mpu(0) + 4, { stroke: C.soft, sw: 1.6, op: ba });

      /* ---- la curva u = e^{−y}, il grafico della funzione inversa ---- */
      const cv = p(t, 3.8, 6.4, E.io);
      if (cv > 0.004) o += path(curveD(fn, 0, 3.2, mpy, mpu, 90), { stroke: C.ink, sw: 3, lc: 'round', ...draw(cv) });
      const cl = p(t, 6, 6.8) * (1 - p(t, 18.4, 19.2));
      o += on(cl, tx(mpy(1.1), mpu(0.62), '*u* = *e*^−*^y*', { size: 22, ta: 'start', op: cl }) + tx(mpy(2.95), mpu(0.72), '*Y* = −ln *U*', { size: 26, fill: C.B, op: cl }));

      /* ---- le dieci fettine, una alla volta: banda orizzontale → curva → colonna ---- */
      let bars = '', hl = '', stairs = '';
      for (let k = 0; k < 10; k++) {
        const tk = 7.2 + 1.15 * k, ya = MYE[k], yb = MYE[k + 1], uhi = MU10[k], ulo = MU10[k + 1];
        const gu = p(t, tk, tk + 0.4) * (1 - p(t, tk + 1.1, tk + 1.6));
        const sp = p(t, tk, tk + 0.8, E.io); // scalino: orizzontale poi verticale
        if (k < 9) {
          const h = ((MK * 0.1) / (yb - ya)) * p(t, tk + 0.7, tk + 1.3, E.out);
          if (h > 0.01) bars += rect(mpy(ya) + 0.5, MBB - h, mpy(yb) - mpy(ya) - 1, h, { fill: C.B, fo: 0.5, stroke: C.B, sw: 1.4 });
          if (sp > 0.004) stairs += path(`M${MX0} ${f(mpu(ulo))}H${f(mpy(yb))}V${MBB}`, { stroke: C.soft, sw: 1.2, da: '3 4', so: 0.75 * st, ...draw(sp) });
          if (gu > 0.004) {
            /* banda di u, e la regione fra la banda e la curva */
            let d = `M${MX0} ${f(mpu(uhi))}H${f(mpy(ya))}`;
            for (let i = 1; i <= 8; i++) { const y = ya + ((yb - ya) * i) / 8; d += `L${f(mpy(y))} ${f(mpu(fn(y)))}`; }
            d += `H${MX0}Z`;
            hl += path(d, { fill: C.hi, fo: 0.32 * gu }) + rect(MX0 - 40, mpu(uhi), 40, mpu(ulo) - mpu(uhi), { fill: C.hi, fo: 0.55 * gu });
            hl += ln(mpy(ya), mpu(fn(ya)), mpy(ya), MBB, { stroke: C.hi, sw: 2, so: gu }) + ln(mpy(yb), mpu(fn(yb)), mpy(yb), MBB, { stroke: C.hi, sw: 2, so: gu });
            hl += rect(mpy(ya) + 0.5, MBB - ((MK * 0.1) / (yb - ya)), mpy(yb) - mpy(ya) - 1, (MK * 0.1) / (yb - ya), { fill: C.hi, fo: 0.45 * gu });
            hl += tx(MX0 - 48, (mpu(uhi) + mpu(ulo)) / 2 + 7, '1/10', { size: 20, ta: 'end', op: gu });
          }
        } else {
          const tu = p(t, tk, tk + 0.4) * (1 - p(t, 21.2, 21.8));
          hl += on(tu, rect(MX0 - 40, mpu(uhi), 40, mpu(ulo) - mpu(uhi), { fill: C.hi, fo: 0.55 * tu }) + tx(MX0 - 48, (mpu(uhi) + mpu(ulo)) / 2 + 7, '1/10', { size: 20, ta: 'end', op: tu }));
          hl += on(tu, path(`M${f(mpy(ya))} ${MBB - 5}H${f(mpy(3.2))}`, { stroke: C.hi, sw: 3, da: '6 5', op: tu }) + arrow(mpy(3.2) - 24, MBB - 5, mpy(3.2) + 6, MBB - 5, 1, C.hi, tu, 3) + lb(mpy(ya) + 8, MBB - 14, 'la coda: fino a ∞', { ta: 'start', op: tu }));
        }
      }
      o += stairs + hl + bars;

      /* le parti «ripida» e «piatta» della curva */
      const rp = vis(t, 19.6, 23.6, 0.5, 0.5);
      if (rp > 0.004) {
        o += path(curveD(fn, 0, 0.55, mpy, mpu, 20), { stroke: C.hi, sw: 6, lc: 'round', op: rp }) + path(curveD(fn, 1.9, 3.2, mpy, mpu, 20), { stroke: C.A, sw: 6, lc: 'round', op: rp });
        o += tx(mpy(0.62), mpu(0.8), 'ripida: colonne strette e alte', { ff: SANS, size: 17, fill: C.ink, ta: 'start', op: rp }) + tx(mpy(2.45), mpu(0.16) - 12, 'piatta: colonne larghe e basse', { ff: SANS, size: 17, fill: C.ink, ta: 'middle', op: rp });
      }

      /* ---- capitolo 2: la densità sulle colonne, la formula, la pendenza ---- */
      const c2 = vis(t, 24.4, 42, 0.6, 0.6), dc = p(t, 24.8, 27.6, E.io), keep = Math.max(c2, p(t, 42, 43));
      if (dc > 0.004) o += path(curveD(fn, 0, 3.2, mpy, mdy, 90), { stroke: C.B, sw: 3.2, lc: 'round', op: keep, ...draw(dc) });
      if (c2 > 0.004) {
        const Lw = (y, s, t0, a = {}) => {
          const u = p(t, t0, t0 + 1, E.out);
          return u > 0.004 ? g({ op: c2 }, wipe('cp-monotona-' + Math.round(y) + '-' + Math.round(t * 100), 296, y - 28, 340, 42, u, tx(302, y, s, { ta: 'start', size: a.size || 22, fill: a.fill || C.ink }))) : '';
        };
        o += Lw(112, '*f*_Y(*y*) = *f*_X(*g*^{−1}(*y*))', 28.4) + Lw(144, '× |(*g*^{−1})′(*y*)|', 30.2) + Lw(176, '= *f*_X(*x*) / |*g*′(*x*)|', 33.6, { size: 20 });
        const pt = (u0, col, t0, tl, lx, ly, lab) => {
          const yy = -Math.log(u0), s = Math.exp(-yy), op = p(t, t0, t0 + 0.7) * c2, dx = 0.4, ol = p(t, tl, tl + 0.6) * c2;
          let q = circ(mpy(yy), mpu(u0), 6.5 * p(t, t0, t0 + 0.6, E.back), { fill: col, stroke: C.paper, sw: 1.6, op });
          q += ln(mpy(Math.max(0, yy - dx)), mpu(u0 + s * Math.min(dx, yy)), mpy(yy + dx), mpu(u0 - s * dx), { stroke: col, sw: 3, lc: 'round', op });
          q += ln(mpy(yy), mpu(u0), mpy(yy), mdy(s), { stroke: col, sw: 2, da: '4 4', op: op * 0.9 }) + circ(mpy(yy), mdy(s), 6, { fill: col, stroke: C.paper, sw: 1.6, op });
          return on(op, q) + on(ol, tx(lx, ly, lab, { size: 20, ta: 'start', fill: C.ink, op: ol }));
        };
        o += pt(0.9, C.hi, 32.8, 39.6, mpy(0.105) + 22, mpu(0.9) + 6, 'pendenza 0,9');
        o += pt(0.2, C.A, 36.6, 40.6, mpy(1.609) + 16, mpu(0) + 24, 'pendenza 0,2');
      }

      /* ---- capitolo 3: g decrescente, la disuguaglianza si gira ---- */
      const c3 = vis(t, 42.8, 62.5, 0.6, 0.01);
      if (c3 > 0.004) {
        const u1 = Math.exp(-1), ev = 1 - u1;
        const lk = p(t, 43.6, 44.8, E.io) * c3, sh = p(t, 44.8, 46) * c3, gs = p(t, 46.2, 47.4) * c3;
        o += path(`M${f(mpy(1))} ${MBB}V${f(mpu(u1))}H${MX0}`, { stroke: C.hi, sw: 3, lc: 'round', lj: 'round', op: c3, ...draw(lk) });
        o += on(sh, rect(MX0 - 40, mpu(1), 40, mpu(u1) - mpu(1), { fill: C.hi, fo: 0.6 * sh }) + tx(MX0 - 46, (mpu(1) + mpu(u1)) / 2 + 6, '0,632', { size: 17, ff: SANS, ta: 'end', op: sh }));
        o += on(gs, path(areaD(fn, 0, 1, mpy, mdy, MBB, 50), { fill: C.hi, fo: 0.4 * gs, stroke: C.hi, so: gs, sw: 1.6 }) + tx(mpy(0.46), MBB - 10, '0,632', { size: 20, op: gs }));
        const Rw = (y, s, t0, a = {}) => {
          const u = p(t, t0, t0 + 0.9, E.out);
          return u > 0.004 ? g({ op: c3 }, wipe('cp-monotona-c' + Math.round(y) + '-' + Math.round(t * 100), 296, y - 28, 340, 42, u, a.parts ? txc(302, y, a.parts, { ta: 'start', size: a.size || 22 }) : tx(302, y, s, { ta: 'start', size: a.size || 22, fill: a.fill || C.ink }))) : '';
        };
        o += Rw(108, '*F*_Y(*y*) = *P*(−ln *U* ≤ *y*)', 44.4);
        o += Rw(138, '', 46.8, { parts: [['= *P*(*U* ', C.ink], ['≥', C.B], [' *e*^−*^y*)', C.ink]] });
        o += Rw(168, '= 1 − *e*^−*^y*', 50.4);
        o += Rw(198, '*f*_Y(*y*) = *e*^−*^y*', 53.6, { fill: C.B, size: 24 });
        const lab = p(t, 56.8, 57.6) * c3;
        o += on(lab, lb(530, 204, 'esponenziale, *λ* = 1', { op: lab }));
      }
      return o;
    },
  });


  /* ======================================================================
     3.5 · Il metodo dell'inversione: F(X) è uniforme, X = F⁻¹(U); attesa esponenziale di media 4 minuti
     ====================================================================== */
  const IX0 = 100, IS = 28, IUB = 246, ISU = 150, IBB = 316; // origine, px per minuto, asse u = 0, px per unità di u, base dei punti impilati
  const ipx = (x) => IX0 + IS * x, ipu = (u) => IUB - ISU * u;
  const IFN = (x) => 1 - Math.exp(-x / 4), IFI = (u) => -4 * Math.log(1 - u); // F e F⁻¹ dell’esponenziale di media 4
  const IN = 60, ISB = 0.36; // sessanta punti; larghezza di una colonna di punti, in minuti
  const IU = Array.from({ length: IN }, (_, i) => (0.98 * (i + 0.25 + 0.5 * rnd(i + 11))) / IN);
  const IXV = IU.map(IFI);
  const ISBN = IXV.map((x) => Math.floor(x / ISB));
  const IORD = Array.from({ length: IN }, (_, j) => (j * 17) % IN); // ordine con cui cadono
  const IRANK = (() => { const c = {}, r = Array(IN); IORD.forEach((i) => { c[ISBN[i]] = c[ISBN[i]] || 0; r[i] = c[ISBN[i]]++; }); return r; })();
  const IPX = (i) => ipx((ISBN[i] + 0.5) * ISB), IPY = (i) => IBB - 4.8 - 8 * IRANK[i]; // dove si ferma il punto i
  /* posizione del punto i lungo il suo percorso, a = 0 (sull’asse di u) … 1 (sulla pila): prima in orizzontale fino alla curva, poi in verticale */
  const ipos = (i, a) => {
    const x1 = ipx(IXV[i]), yc = ipu(IU[i]);
    if (a < 0.42) return [lerp(IX0, x1, E.io(a / 0.42)), yc];
    const w = (a - 0.42) / 0.58;
    return [lerp(x1, IPX(i), E.io(w)), lerp(yc, IPY(i), w * w)];
  };
  const ITR = (i, a) => { const x1 = ipx(IXV[i]), yc = ipu(IU[i]), [cx, cy] = ipos(i, a); return `M${IX0} ${f(yc)}H${f(a < 0.42 ? cx : x1)}${a > 0.42 ? `L${f(cx)} ${f(cy)}` : ''}`; }; // la scia del percorso
  const IT0 = 17.8, IDT = 0.1, IFL = 1.1; // inizio della pioggia, intervallo fra due punti, durata del volo
  const ILT0 = 26.6, ILDT = 0.085, ILFL = 1.3; // inizio del percorso inverso, intervallo, durata del volo

  PV.add('inversione', {
    sec: '3.14',
    short: 'Il metodo dell’inversione',
    title: 'Il metodo dell’inversione: F(X) è uniforme, e F⁻¹(U) ha ripartizione F',
    alt: 'Animazione: un numero uniforme u sale alla curva F(x) = 1 − e^(−x/4) e scende sull’asse dei minuti (u = 0,5 dà 2,77 minuti, u = 0,9 dà 9,21); sessanta numeri si addensano dove F è ripida e il percorso inverso mostra che F(X) è uniforme. Risolvendo u = F(x) si ottiene x = −4 ln(1 − u), la riga di codice che simula un’attesa esponenziale di media 4 minuti.',
    dur: 62.5,
    poster: 58,
    chap: [[0, 'Da un numero a caso a un’attesa'], [26, 'F(X) è uniforme'], [41, 'La riga di codice']],
    caps: [
      [0, 'L’attesa fra due clienti è esponenziale, di media 4 minuti: *F*(*x*) = 1 − *e*^{−x/4}. Il computer mi dà solo numeri uniformi fra 0 e 1.'],
      [8.7, 'Prendo un numero *u*, lo porto fino alla curva e scendo sull’asse dei minuti: *u* = 0,5 dà 2,77 minuti, *u* = 0,9 dà 9,21.'],
      [17.4, 'Faccio cadere sessanta numeri uniformi: i punti si addensano dove la curva è ripida, vicino a 0, e si diradano dove è piatta.'],
      [26, 'Percorso inverso: prendo i tempi *X* e li porto sulla curva, poi a sinistra. Finiscono distribuiti in modo uniforme.'],
      [34, 'È il teorema: *P*(*F*(*X*) ≤ *u*) = *P*(*X* ≤ *F*^{−1}(*u*)) = *F*(*F*^{−1}(*u*)) = *u*.'],
      [41, 'Per costruire la regola risolvo *u* = *F*(*x*) rispetto a *x*: isolo l’esponenziale, poi il logaritmo, ed esce *x* = −4 ln(1 − *u*).'],
      [50.4, 'Ecco la riga di codice. Con *u* = 0,5 esce 2,77 minuti, la mediana; con *u* = 0,9, 9,21 minuti: *u* vicino a 1 dà attese lunghe e rare.'],
      [59.4, 'In generale *X* = −ln(1 − *U*)/*λ*.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 25.6, 'Da un numero a caso a un’attesa', 'attesa fra due clienti, media 4 minuti') + heading(t, 26.2, 40.6, 'Se *X* ha ripartizione *F*, *F*(*X*) è uniforme', 'il percorso al contrario') + heading(t, 41.2, 62.9, 'Il metodo dell’inversione', '*x* = *F*^{−1}(*u*) = −4 ln(1 − *u*)');
      const c3 = p(t, 40.2, 41.2), c12 = 1 - c3;

      /* ---- U ~ U(0, 1): rettangolo a sinistra dell’asse verticale ---- */
      const ra = p(t, 0.4, 1.4), rw = 40 * p(t, 1.2, 2.6), sl = p(t, 2.4, 3.2);
      let r = ln(IX0, IUB, IX0, ipu(1) - 10, { stroke: C.soft, sw: 1.8, op: ra }) + ln(IX0 - 8, IUB, ipx(16) + 14, IUB, { stroke: C.soft, sw: 1.8, op: ra });
      for (const v of [4, 8, 12, 16]) r += ln(ipx(v), IUB - 4, ipx(v), IUB + 4, { stroke: C.soft, sw: 1.6, op: ra });
      r += rect(IX0 - rw, ipu(1), rw, ISU, { fill: C.A, fo: 0.25, stroke: C.A, sw: 2 });
      for (let k = 1; k < 10; k++) r += ln(IX0 - rw, ipu(k / 10), IX0, ipu(k / 10), { stroke: C.A, sw: 1, so: 0.5 * sl });
      r += tx(IX0 - 20, IUB + 24, '*U*', { size: 22, fill: C.A, op: sl });
      o += r;
      /* asse dei minuti, dove si impilano i punti */
      const ba = p(t, 2.6, 3.6);
      o += g({ op: ba }, ln(IX0 - 8, IBB, ipx(16) + 14, IBB, { stroke: C.soft, sw: 1.8 }) + [0, 4, 8, 12, 16].map((v) => ln(ipx(v), IBB - 4, ipx(v), IBB + 4, { stroke: C.soft, sw: 1.6 }) + lb(ipx(v), IBB + 24, v)).join('') + lb(ipx(16) + 28, IBB + 24, 'min', { ta: 'start' }) + tx(IX0 - 36, IBB + 6, '*X*', { size: 22, fill: C.B }));

      /* ---- la curva F(x) = 1 − e^{−x/4} ---- */
      const cv = p(t, 3.4, 6.2, E.io);
      if (cv > 0.004) o += path(curveD(IFN, 0, 16, ipx, ipu, 90), { stroke: C.ink, sw: 3, lc: 'round', ...draw(cv) });
      const cl = p(t, 6, 6.8) * (1 - p(t, 25.6, 26.2));
      o += on(cl, tx(404, 196, '*F*(*x*) = 1 − *e*^{−x/4}', { size: 20, ta: 'start', op: cl }));

      /* ---- i due esempi: u → curva → minuti (capitolo 1); ripresi nel capitolo 3 ---- */
      const ex = (u0, t0, lab, fin, endY) => {
        const x0 = IFI(u0), a = p(t, t0, t0 + 1.2, E.io), b = p(t, t0 + 1.2, t0 + 2.4, E.io);
        if (fin <= 0.004 || t < t0) return '';
        let q = path(`M${IX0} ${f(ipu(u0))}H${f(ipx(x0))}`, { stroke: C.hi, sw: 3, lc: 'round', op: fin, ...draw(a) });
        if (b > 0.004) q += path(`M${f(ipx(x0))} ${f(ipu(u0))}V${endY}`, { stroke: C.hi, sw: 3, lc: 'round', op: fin, ...draw(b) }) + circ(ipx(x0), endY, 6.5 * p(t, t0 + 2.2, t0 + 2.7, E.back), { fill: C.hi, op: fin });
        q += tx(IX0 - 48, ipu(u0) + 7, String(u0).replace('.', ','), { size: 20, ta: 'end', op: p(t, t0, t0 + 0.5) * fin });
        q += tx(ipx(x0) + 12, endY - 6, lab, { size: 20, ta: 'start', op: p(t, t0 + 2.2, t0 + 2.9) * fin });
        return q;
      };
      o += ex(0.5, 9, '2,77', 1 - p(t, 17.2, 17.9), IBB - 5) + ex(0.9, 13, '9,21', 1 - p(t, 17.2, 17.9), IBB - 5);

      /* ---- la pioggia: sessanta numeri uniformi diventano tempi (capitolo 1); poi il percorso inverso (capitolo 2) ---- */
      let stack = '', fly = '', ticks = '';
      for (let j = 0; j < IN; j++) {
        const i = IORD[j], a = (t - (IT0 + IDT * j)) / IFL, tl = ILT0 + ILDT * i, v = (t - tl) / ILFL;
        if (a <= 0) continue;
        if (a < 1) {
          const [cx, cy] = ipos(i, a);
          fly += path(ITR(i, a), { stroke: C.B, sw: 1, so: 0.5 }) + circ(cx, cy, 3.6, { fill: C.B, stroke: C.paper, sw: 0.8 });
        } else if (v <= 0) stack += circ(IPX(i), IPY(i), 3.6, { fill: C.B, stroke: C.paper, sw: 0.8 });
        else if (v < 1) {
          const [cx, cy] = ipos(i, 1 - E.io(v));
          fly += path(ITR(i, 1 - E.io(v)), { stroke: C.A, sw: 1, so: 0.55 }) + circ(cx, cy, 3.6, { fill: C.A, stroke: C.paper, sw: 0.8 });
        } else ticks += ln(IX0 - 38, ipu(IU[i]), IX0 - 2, ipu(IU[i]), { stroke: C.A, sw: 2, lc: 'round' });
      }
      o += on(c12, g({ op: c12 }, stack + fly + ticks));
      const un = vis(t, 33.4, 40.4, 0.6, 0.6);
      o += on(un, tx(IX0 - 24, IUB + 48, 'uniformi', { ff: SANS, size: 17, fill: C.A, op: un }));
      /* la densità esponenziale sulla pila di punti */
      const dn = p(t, 24.4, 25.6) * (1 - p(t, 26.4, 27));
      o += on(dn, path(curveD((x) => 0.25 * Math.exp(-x / 4), 0, 16, ipx, (d) => IBB - 184 * d, 80), { stroke: C.B, sw: 2.4, op: dn }));

      /* ---- capitolo 2: la dimostrazione di (a) ---- */
      const Rw = (id, y, s, t0, a = {}) => {
        const u = p(t, t0, t0 + 0.9, E.out), op = a.op === undefined ? 1 : a.op;
        return u > 0.004 && op > 0.004 ? g({ op }, wipe('cp-inversione-' + id + '-' + Math.round(t * 100), 370, y - 28, 265, 42, u, tx(376, y, s, { ta: 'start', size: a.size || 21, fill: a.fill || C.ink }))) : '';
      };
      const c2 = vis(t, 34, 40.8, 0.4, 0.7);
      o += Rw('a', 142, '*P*(*F*(*X*) ≤ *u*)', 34.4, { op: c2 }) + Rw('b', 174, '= *P*(*X* ≤ *F*^{−1}(*u*))', 36.4, { op: c2 }) + Rw('c', 206, '= *F*(*F*^{−1}(*u*)) = *u*', 38.2, { op: c2 });

      /* ---- capitolo 3: x = −4 ln(1 − u) e la riga di codice ---- */
      const c3v = vis(t, 41.2, 62.9, 0.6, 0.01);
      if (c3v > 0.004) {
        const fq = 1 - p(t, 58.6, 59.4);
        o += Rw('d', 138, '*u* = 1 − *e*^{−x/4}', 41.8, { op: fq }) + Rw('e', 170, '*e*^{−x/4} = 1 − *u*', 43.8, { op: fq }) + Rw('f', 202, '−*x*/4 = ln(1 − *u*)', 45.8, { op: fq }) + Rw('g', 234, '*x* = −4 ln(1 − *u*)', 47.8, { op: fq, fill: C.B, size: 25 });
        const cb = p(t, 50.4, 51.4) * c3v;
        if (cb > 0.004) {
          o += rect(98, 277, 534, 34, { rx: 8, fill: C.paper, stroke: C.soft, sw: 1.6, op: cb }) + rect(98, 277, 534, 34, { rx: 8, fill: C.hi, fo: 0.1 * cb });
          o += `<text${at({ x: 365, y: 300, fill: C.ink, ta: 'middle', ff: 'ui-monospace, Menlo, Consolas, monospace', fs: 18, op: cb })}>${esc('const attesa = -4 * Math.log(1 - Math.random());')}</text>`;
        }
        const e1 = p(t, 52.6, 53.2), g2 = p(t, 56.2, 56.8);
        o += g({ op: c3v }, ex(0.5, 52.8, '2,77', e1, IUB) + ex(0.9, 56.4, '9,21', g2, IUB));
        const gn = p(t, 59.8, 60.8) * c3v;
        o += on(gn, tx(498, 196, '*X* = −ln(1 − *U*)/*λ*', { size: 26, fill: C.B, op: gn }));
      }
      return o;
    },
  });


  /* ======================================================================
     3.6 · Densità congiunta: la superficie, il volume sopra B, il dominio, le marginali
     ====================================================================== */
  /* prospettiva obliqua: x verso destra, y (profondità) in alto a destra, z in alto */
  const CPX0 = 54, CPY0 = 298, CSX = 190, CDX = 74, CDY = 52, CZS = 38;
  const cproj = (x, y, z) => [CPX0 + CSX * x + CDX * y, CPY0 - CDY * y - CZS * z];
  const cbump = (x, y) => 3 * Math.exp(-(((x - 0.5) ** 2) / (2 * 0.21 ** 2) + ((y - 0.52) ** 2) / (2 * 0.26 ** 2)));
  const CN = 12; // la superficie è fatta di 12 × 12 tasselli
  const cpts = (arr) => arr.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');
  const cpoly = (pts, a = {}) => `<polygon points="${cpts(pts)}"${at({ fill: 'none', ...a })}/>`;
  const cmix = (col, pc) => `color-mix(in srgb, ${col} ${f(pc)}%, ${C.paper})`; // colore pieno: tinta mescolata al foglio
  const CBX = [3 / CN, 8 / CN], CBY = [2 / CN, 7 / CN]; // la regione B: 5 × 5 tasselli
  /* 24 punti «a caso» (ogni riga e ogni colonna ne ha uno): nel quadrato, e nel triangolo come (il più piccolo, il più grande) */
  const CPTS = Array.from({ length: 24 }, (_, k) => [(k + rnd(2 * k + 3)) / 24, (((k * 7) % 24) + rnd(2 * k + 4)) / 24]);
  const CTRI = CPTS.map(([a, b]) => [Math.min(a, b), Math.max(a, b)]);
  const CS = 150, CY0 = 258; // lato dei riquadri e quota di y = 0
  const cpy = (y) => CY0 - CS * y;

  PV.add('congiuntac', {
    sec: '3.16',
    short: 'La densità congiunta',
    title: 'Densità congiunta di due variabili continue: il volume sotto la superficie',
    alt: 'Animazione: una densità congiunta f(x, y) è una superficie sul piano e P((X, Y) ∈ B) è il volume sotto la superficie, sopra B (integrale doppio; volume totale 1). Su un quadrato con densità 1 le variabili sono indipendenti, su un triangolo con densità 2 no; le marginali si ottengono integrando rispetto all’altra variabile: f_X(x) = 2(1 − x) e f_Y(y) = 2y.',
    dur: 61,
    poster: 17,
    chap: [[0, 'La superficie e il volume'], [23.2, 'Il dominio conta'], [39.8, 'Le marginali']],
    caps: [
      [0, 'Per due variabili continue insieme serve una densità sul piano: una superficie *z* = *f*(*x*, *y*), mai negativa.'],
      [7.3, 'Scelgo una regione *B*. La probabilità che il punto (*X*, *Y*) cada in *B* è il volume sotto la superficie, sopra *B*.'],
      [15.3, 'In formula è l’integrale doppio di *f* su *B*. Su tutto il piano il volume vale 1, come l’area totale di una densità.'],
      [23.2, 'Il dominio conta. Se *X* e *Y* sono uniformi e indipendenti, la densità vale 1 su tutto il quadrato, e le probabilità sono aree.'],
      [31.5, 'Su un triangolo la densità costante 2 sembra un prodotto, ma il dominio non è un rettangolo: sapere *x* restringe i valori di *y*.'],
      [39.8, 'Le marginali si ottengono integrando rispetto all’altra variabile. Sul triangolo, per ogni *x* la fetta va da *y* = *x* a 1.'],
      [47.6, 'Quindi *f*_X(*x*) = 2(1 − *x*): scende. Per *y* la fetta va da 0 a *y*: *f*_Y(*y*) = 2*y*, sale. Ognuna ha area 1.'],
      [55.4, 'Il più piccolo dei due numeri sta vicino a 0, il più grande vicino a 1.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 22.6, 'La densità vive sul piano', '*f*(*x*, *y*) è una superficie') + heading(t, 23.8, 39.2, 'Il dominio conta', 'rettangolo contro triangolo') + heading(t, 40.4, 61.4, 'Le marginali', 'si integra rispetto all’altra variabile');
      const c1 = 1 - p(t, 22.4, 23.2);

      /* ---------- capitolo 1: il piano, la superficie, la regione B e il volume sopra B ---------- */
      if (c1 > 0.004) {
        const fl = p(t, 0.5, 1.8), zs = p(t, 2.6, 6.4, E.out), bo = p(t, 9, 10), wh = p(t, 10.4, 14, E.out), pu = bump(t, 19.6, 2.4);
        let r = cpoly([cproj(0, 0, 0), cproj(1, 0, 0), cproj(1, 1, 0), cproj(0, 1, 0)], { fill: C.paper, stroke: C.soft, sw: 1.8, op: fl });
        for (let k = 1; k < 4; k++) r += ln(...cproj(k / 4, 0, 0), ...cproj(k / 4, 1, 0), { stroke: C.line, sw: 1, op: fl }) + ln(...cproj(0, k / 4, 0), ...cproj(1, k / 4, 0), { stroke: C.line, sw: 1, op: fl });
        r += lb(cproj(1, 0, 0)[0] + 8, cproj(1, 0, 0)[1] + 24, '*x*', { ta: 'start', op: fl }) + lb(cproj(1, 1, 0)[0] + 10, cproj(1, 1, 0)[1] + 4, '*y*', { ta: 'start', op: fl });
        /* tasselli della superficie, dal fondo in avanti */
        for (let j = CN - 1; j >= 0; j--) {
          for (let i = 0; i < CN; i++) {
            const x0 = i / CN, x1 = (i + 1) / CN, y0 = j / CN, y1 = (j + 1) / CN, h = cbump((x0 + x1) / 2, (y0 + y1) / 2);
            const pts = [cproj(x0, y0, cbump(x0, y0) * zs), cproj(x1, y0, cbump(x1, y0) * zs), cproj(x1, y1, cbump(x1, y1) * zs), cproj(x0, y1, cbump(x0, y1) * zs)];
            const inb = i >= 3 && i < 8 && j >= 2 && j < 7 && bo > 0.5;
            r += cpoly(pts, { fill: inb ? cmix(C.B, 42 + 18 * (h / 3)) : cmix(C.A, 8 + (38 + 22 * pu) * (h / 3)), stroke: inb ? C.B : C.A, so: 0.55, sw: 0.8, lj: 'round' });
          }
        }
        /* la regione B sul piano e le pareti del volume (in trasparenza) */
        const bp = p(t, 7.6, 8.8, E.back);
        if (bp > 0.004) r += cpoly([cproj(CBX[0], CBY[0], 0), cproj(CBX[1], CBY[0], 0), cproj(CBX[1], CBY[1], 0), cproj(CBX[0], CBY[1], 0)], { fill: C.B, fo: 0.5, stroke: C.B, sw: 2, op: Math.min(1, bp) });
        r += on(bp, tx(...cproj((CBX[0] + CBX[1]) / 2, (CBY[0] + CBY[1]) / 2, 0).map((v, i) => v + (i ? 6 : 0)), '*B*', { size: 24, fill: C.paper, op: Math.min(1, bp) }));
        if (wh > 0.004) {
          const edge = (fixedX, K) => { const pts = []; for (let k = 20; k >= 0; k--) { const u = k / 20, x = fixedX ? CBX[1] : CBX[0] + (CBX[1] - CBX[0]) * u, y = fixedX ? CBY[0] + (CBY[1] - CBY[0]) * u : CBY[0]; pts.push(cproj(x, y, cbump(x, y) * zs * wh)); } return pts; };
          r += cpoly([cproj(CBX[0], CBY[0], 0), cproj(CBX[1], CBY[0], 0), ...edge(false)], { fill: C.B, fo: 0.3, stroke: C.B, sw: 1.8, lj: 'round' });
          r += cpoly([cproj(CBX[1], CBY[0], 0), cproj(CBX[1], CBY[1], 0), ...edge(true)], { fill: C.B, fo: 0.3, stroke: C.B, sw: 1.8, lj: 'round' });
        }
        o += g({ op: c1 }, r);
        /* la colonna di destra: le formule */
        const L = (id, y, s, t0, a = {}) => {
          const u = p(t, t0, t0 + 0.9, E.out);
          return u > 0.004 ? g({ op: c1 }, wipe('cp-congiuntac-' + id + '-' + Math.round(t * 100), 346, y - 28, 290, 42, u, a.parts ? txc(352, y, a.parts, { ta: 'start', size: a.size || 22 }) : tx(352, y, s, { ta: 'start', size: a.size || 22, fill: a.fill || C.ink }))) : '';
        };
        o += L('a', 128, '*z* = *f*(*x*, *y*)', 5.6, { fill: C.A, size: 28 });
        o += L('b', 176, '*P*((*X*, *Y*) ∈ *B*)', 9.6);
        o += L('c', 210, '= volume sopra *B*', 12.4, { fill: C.B });
        o += L('d', 252, '= ∫∫_B *f*(*x*, *y*) d*x*d*y*', 16.2, { size: 21 });
        const vt = p(t, 19.6, 20.6) * c1;
        o += on(vt, tx(352, 306, '∫∫ *f* = 1', { ta: 'start', size: 28, op: vt }) + lb(500, 306, 'su tutto il piano', { ta: 'start', op: vt }));
      }

      /* ---------- capitolo 2: il dominio conta (quadrato e triangolo) ---------- */
      const c2 = vis(t, 23.4, 39.4, 0.6, 0.6);
      if (c2 > 0.004) {
        const spx = (x) => 62 + CS * x, tpx = (x) => 282 + CS * x;
        const axes = (px, op) => ln(px(0), cpy(0), px(1) + 10, cpy(0), { stroke: C.soft, sw: 1.8, op }) + ln(px(0), cpy(0), px(0), cpy(1) - 10, { stroke: C.soft, sw: 1.8, op }) + lb(px(1) + 18, cpy(0) + 6, '*x*', { ta: 'start', op }) + lb(px(0) - 4, cpy(1) - 16, '*y*', { op });
        const sq = p(t, 24, 25.2) * c2;
        let r = axes(spx, sq) + rect(spx(0), cpy(1), CS, CS, { fill: C.A, fo: 0.22 * sq, stroke: C.A, so: sq, sw: 2 });
        r += tx(spx(0.5), cpy(0.5) + 8, '*f* = 1', { size: 26, op: p(t, 24.8, 25.6) * c2 * (1 - p(t, 27.4, 28))});
        CPTS.forEach(([x, y], k) => { const u = p(t, 25.4 + 0.1 * k, 25.9 + 0.1 * k, E.back); if (u > 0.004) r += circ(spx(x), cpy(y), 3.8 * u, { fill: C.A, stroke: C.paper, sw: 0.8, op: c2 }); });
        /* una regione B del quadrato: la probabilità è la sua area */
        const bb = p(t, 28, 29) * c2;
        r += on(bb, rect(spx(0.2), cpy(0.8), CS * 0.4, CS * 0.5, { fill: C.hi, fo: 0.45 * bb, stroke: C.hi, so: bb, sw: 2.4 }) + tx(spx(0.4), cpy(0.55) + 8, '*B*', { size: 24, op: bb }));
        r += on(bb, tx(spx(0.5), CY0 + 44, '*P*(*B*) = area di *B*', { size: 20, op: p(t, 29.2, 30) * c2 }));
        r += on(p(t, 30.4, 31) * c2, pills(CY0 + 78, [{ s: 'è un rettangolo', icon: 'ok', col: OK, op: p(t, 30.4, 31) * c2, u: p(t, 30.6, 31.2, E.lin) }], spx(0.5)));
        o += r;
        /* il triangolo 0 < x < y < 1, densità 2 */
        const tr = p(t, 32, 33.2) * c2;
        let q = axes(tpx, tr);
        q += `<polygon points="${cpts([[tpx(0), cpy(0)], [tpx(0), cpy(1)], [tpx(1), cpy(1)]])}"${at({ fill: C.A, fo: 0.34 * tr, stroke: C.A, so: tr, sw: 2 })}/>`;
        q += tx(tpx(0.22), cpy(0.82) + 8, '*f* = 2', { size: 26, op: p(t, 32.8, 33.6) * c2 * (1 - p(t, 36, 36.6)) });
        CTRI.forEach(([x, y], k) => { const u = p(t, 33.4 + 0.08 * k, 33.9 + 0.08 * k, E.back); if (u > 0.004) q += circ(tpx(x), cpy(y), 3.8 * u, { fill: C.A, stroke: C.paper, sw: 0.8, op: c2 }); });
        q += on(p(t, 35.2, 36) * c2, tx(tpx(0.5), CY0 + 44, '*f* = 2 · 1 · 1 ?', { size: 20, op: p(t, 35.2, 36) * c2 }));
        /* le due fette verticali: per x = 0,2 e x = 0,8 le y possibili sono diverse */
        const sg = (x0, col, t0, xs, y1, y2) => {
          const u = p(t, t0, t0 + 0.8) * c2;
          if (u <= 0.004) return '';
          let s = ln(tpx(x0), cpy(x0), tpx(x0), cpy(1), { stroke: col, sw: 4.5, lc: 'round', op: u }) + circ(tpx(x0), cpy(x0), 5, { fill: col, op: u });
          s += ln(tpx(x0), CY0, tpx(x0), CY0 + 6, { stroke: col, sw: 2.4, op: u }) + tx(tpx(x0), CY0 + 24, String(x0).replace('.', ','), { ff: SANS, size: 17, fill: C.ink, op: u });
          s += circ(464, y1 - 6, 6, { fill: col, op: u }) + tx(478, y1, 'se *x* = ' + String(x0).replace('.', ','), { size: 20, ta: 'start', op: u }) + tx(478, y2, '*y* fra ' + String(x0).replace('.', ',') + ' e 1', { size: 20, ta: 'start', op: u });
          return s;
        };
        q += sg(0.2, C.hi, 36.8, 0, 150, 178) + sg(0.8, C.A, 38, 0, 220, 248);
        q += on(p(t, 38.2, 38.8) * c2, pills(CY0 + 78, [{ s: 'non è un rettangolo', icon: 'no', col: NO, op: p(t, 38.2, 38.8) * c2, u: p(t, 38.4, 39, E.lin) }], tpx(0.5)));
        o += q;
      }

      /* ---------- capitolo 3: le marginali del triangolo ---------- */
      const c3 = vis(t, 39.9, 61.6, 0.6, 0.01);
      if (c3 > 0.004) {
        const tp = (x) => 90 + CS * x, FQ = 24, fxy = (x) => 336 - FQ * 2 * (1 - x), fyx = (y) => 282 + FQ * 2 * y;
        const xs = lerp(0.02, 0.98, p(t, 40.8, 46.8, E.io)), ys = lerp(0.02, 0.98, p(t, 48.4, 54, E.io));
        const fmt = (v) => v.toFixed(2).replace('.', ',');
        /* il triangolo, con gli assi */
        let r = ln(tp(0), cpy(0), tp(1) + 10, cpy(0), { stroke: C.soft, sw: 1.8 }) + ln(tp(0), cpy(0), tp(0), cpy(1) - 10, { stroke: C.soft, sw: 1.8 }) + lb(tp(1) + 18, cpy(0) + 6, '*x*', { ta: 'start' }) + lb(tp(0) - 4, cpy(1) - 16, '*y*');
        r += `<polygon points="${cpts([[tp(0), cpy(0)], [tp(0), cpy(1)], [tp(1), cpy(1)]])}"${at({ fill: C.A, fo: 0.3, stroke: C.A, sw: 2 })}/>`;
        /* il grafico di f_X sotto il triangolo, il grafico di f_Y a destra */
        r += ln(tp(0) - 8, 336, tp(1) + 10, 336, { stroke: C.soft, sw: 1.8 }) + lb(tp(0) - 14, 300, '*f*_X', { ta: 'end', fill: C.A });
        r += ln(282, cpy(0) + 8, 282, cpy(1) - 8, { stroke: C.soft, sw: 1.8 }) + lb(306, cpy(1) - 14, '*f*_Y', { fill: C.B });
        const px = (x) => tp(x), fx = Math.min(1, xs);
        const xe = t > 46.8 ? 1 : xs, ye = t > 54 ? 1 : ys;
        if (t >= 40.8) r += `<polygon points="${cpts([[tp(0), 336], [tp(0), fxy(0)], [tp(xe), fxy(xe)], [tp(xe), 336]])}"${at({ fill: C.A, fo: 0.28 })}/>` + ln(tp(0), fxy(0), tp(xe), fxy(xe), { stroke: C.A, sw: 3, lc: 'round' });
        if (t >= 48.4) r += `<polygon points="${cpts([[282, cpy(0)], [282, cpy(ye)], [fyx(ye), cpy(ye)]])}"${at({ fill: C.B, fo: 0.28 })}/>` + ln(282, cpy(0), fyx(ye), cpy(ye), { stroke: C.B, sw: 3, lc: 'round' });
        /* la fetta verticale a x fissato */
        const sx = p(t, 40.6, 41.2) * (1 - p(t, 46.8, 47.6));
        if (sx > 0.004) r += ln(px(xs), cpy(xs), px(xs), cpy(1), { stroke: C.hi, sw: 5, lc: 'round', op: sx }) + circ(px(xs), cpy(xs), 5.5, { fill: C.hi, op: sx }) + ln(px(xs), cpy(0), px(xs), fxy(xs), { stroke: C.hi, sw: 1.8, da: '4 4', op: sx }) + circ(px(xs), fxy(xs), 6, { fill: C.hi, stroke: C.paper, sw: 1.6, op: sx });
        /* la fetta orizzontale a y fissato */
        const sy = p(t, 48.2, 48.8) * (1 - p(t, 54, 54.8));
        if (sy > 0.004) r += ln(tp(0), cpy(ys), tp(ys), cpy(ys), { stroke: C.hi, sw: 5, lc: 'round', op: sy }) + circ(tp(ys), cpy(ys), 5.5, { fill: C.hi, op: sy }) + ln(tp(ys), cpy(ys), fyx(ys), cpy(ys), { stroke: C.hi, sw: 1.8, da: '4 4', op: sy }) + circ(fyx(ys), cpy(ys), 6, { fill: C.hi, stroke: C.paper, sw: 1.6, op: sy });
        o += g({ op: c3 }, r);
        /* la colonna di destra: prima i numeri che scorrono, poi le formule */
        const rx = vis(t, 40.9, 47.4, 0.4, 0.5) * c3, ry = vis(t, 48.5, 54.3, 0.4, 0.5) * c3;
        o += on(rx, tx(352, 130, '*x* = ' + fmt(xs), { ta: 'start', size: 22, op: rx }) + tx(352, 162, 'lunga 1 − *x* = ' + fmt(1 - xs), { ta: 'start', size: 22, op: rx }) + tx(352, 194, '2 · ' + fmt(1 - xs) + ' = ' + fmt(2 * (1 - xs)), { ta: 'start', size: 22, fill: C.A, op: rx }));
        o += on(ry, tx(352, 230, '*y* = ' + fmt(ys), { ta: 'start', size: 22, op: ry }) + tx(352, 262, 'lunga *y* = ' + fmt(ys), { ta: 'start', size: 22, op: ry }) + tx(352, 294, '2 · ' + fmt(ys) + ' = ' + fmt(2 * ys), { ta: 'start', size: 22, fill: C.B, op: ry }));
        const Lf = (id, y, s, t0, a = {}) => {
          const u = p(t, t0, t0 + 0.9, E.out);
          return u > 0.004 ? g({ op: c3 }, wipe('cp-congiuntac-m' + id + '-' + Math.round(t * 100), 346, y - 28, 290, 42, u, tx(352, y, s, { ta: 'start', size: a.size || 22, fill: a.fill || C.ink }))) : '';
        };
        o += Lf('a', 128, '*f*_X(*x*) = 2 · (1 − *x*)', 47.4, { fill: C.A }) + on(p(t, 48, 48.8) * c3, lb(352, 156, 'altezza 2, fetta lunga 1 − *x*', { ta: 'start', op: p(t, 48, 48.8) * c3 }));
        o += Lf('b', 226, '*f*_Y(*y*) = 2 · *y*', 54.2, { fill: C.B }) + on(p(t, 54.8, 55.6) * c3, lb(352, 254, 'altezza 2, fetta lunga *y*', { ta: 'start', op: p(t, 54.8, 55.6) * c3 }));
        const fn1 = p(t, 56, 56.8) * c3, fn2 = p(t, 57.8, 58.6) * c3;
        o += on(fn1, tx(352, 296, '*X* = il più piccolo', { ta: 'start', size: 21, fill: C.A, op: fn1 })) + on(fn2, tx(352, 326, '*Y* = il più grande', { ta: 'start', size: 21, fill: C.B, op: fn2 }));
      }
      return o;
    },
  });

  /* ======================================================================
     3.6 · Esercizio guidato 3.A: l'appuntamento in piazza (|X − Y| ≤ 1/4 nel quadrato)
     ====================================================================== */
  const APX0 = 78, APS = 220, APY0 = 314; // ascissa di x = 0, lato del quadrato, quota di y = 0
  const apx = (x) => APX0 + APS * x, apy = (y) => APY0 - APS * y;
  const APD = Array.from({ length: 40 }, (_, k) => [(k + rnd(2 * k + 501)) / 40, (((k * 7) % 40) + rnd(2 * k + 502)) / 40]); // quaranta coppie di arrivi «a caso» (18 su 40 nella fascia)
  const APFR = ['0', '1/4', '1/2', '3/4', '1'];
  const hxMid = (v) => 366 + 240 * v + 30; // centro della finestra di attesa di 15 minuti che parte da v

  PV.add('appuntamento', {
    sec: '3.16',
    short: 'L’appuntamento in piazza',
    title: 'L’appuntamento in piazza: la probabilità è un’area nel quadrato',
    alt: 'Animazione: Anna e Bruno arrivano a caso fra mezzogiorno e l’una e aspettano 15 minuti: la coppia (X, Y) è un punto a caso nel quadrato di lato 1 e si incontrano se |X − Y| ≤ 1/4, una fascia attorno alla diagonale. I due triangoli bianchi hanno cateti 3/4 e area 9/32 ciascuno, quindi la fascia vale 1 − 9/16 = 7/16, circa 0,4375.',
    dur: 58,
    poster: 54,
    chap: [[0, 'Un punto a caso nel quadrato'], [24, 'Quando si incontrano'], [40.2, 'La probabilità è un’area']],
    caps: [
      [0, 'Anna e Bruno si danno appuntamento tra mezzogiorno e l’una. Ciascuno arriva a caso, indipendentemente, e aspetta al massimo 15 minuti.'],
      [9, 'Se Anna arriva alle 12:20 e Bruno alle 12:30, si incontrano. Se lei arriva alle 12:10 e lui alle 12:50, no.'],
      [16.2, 'Ogni coppia di arrivi è un punto nel quadrato: la densità vale 1 × 1 = 1, e la probabilità di una zona è la sua area.'],
      [24, 'Si incontrano se i due arrivi distano al più un quarto d’ora: |*X* − *Y*| ≤ 1/4. Sono i punti vicini alla diagonale.'],
      [31.5, 'È una fascia fra le rette *Y* = *X* + 1/4 e *Y* = *X* − 1/4. Nei due triangoli bianchi uno arriva quando l’altro se n’è già andato.'],
      [40.2, 'Ogni triangolo bianco ha i cateti lunghi 1 − 1/4 = 3/4: area (3/4 × 3/4)/2 = 9/32. I triangoli sono due: 9/16.'],
      [47.5, 'La fascia è il quadrato meno i triangoli: 1 − 9/16 = 7/16, circa 0,4375.'],
      [52.2, 'Meno di una volta su due: darsi un appuntamento così vago non è una grande idea.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 23.6, 'Un punto a caso nel quadrato', '*X* = arrivo di Anna, *Y* = arrivo di Bruno') + heading(t, 24.6, 39.6, 'Quando si incontrano', 'conta solo la distanza fra i due arrivi') + heading(t, 40.6, 58.4, 'La probabilità è un’area', 'il quadrato meno i due triangoli');
      const c1 = 1 - p(t, 23.6, 24.6), c2 = vis(t, 24, 40, 0.6, 0.6), c3 = p(t, 40, 40.8);

      /* ---- il quadrato dei due arrivi ---- */
      const sq = p(t, 0.5, 1.8);
      let r = rect(apx(0), apy(1), APS, APS, { fill: C.A, fo: 0.1 * sq, stroke: C.A, so: sq, sw: 2 });
      for (let k = 0; k <= 4; k++) r += ln(apx(k / 4), APY0, apx(k / 4), APY0 + 5, { stroke: C.soft, sw: 1.6, op: sq }) + lb(apx(k / 4), APY0 + 24, APFR[k], { op: sq }) + ln(APX0 - 5, apy(k / 4), APX0, apy(k / 4), { stroke: C.soft, sw: 1.6, op: sq }) + lb(APX0 - 10, apy(k / 4) + 6, APFR[k], { ta: 'end', op: sq });
      r += tx(apx(1) + 22, APY0 + 8, '*X*', { size: 24, fill: C.A, op: sq }) + tx(APX0 - 42, apy(1) + 8, '*Y*', { size: 24, fill: C.B, op: sq });
      o += r;

      /* ---- la fascia |x − y| ≤ 1/4 ---- */
      const dg = p(t, 25, 26.4, E.io) * c2, ln1 = p(t, 26.4, 28, E.io) * c2, bd = p(t, 28.2, 29.4) * c2;
      const band = [[0, 0], [0, 0.25], [0.75, 1], [1, 1], [1, 0.75], [0.25, 0]].map(([x, y]) => [apx(x), apy(y)]);
      o += on(bd, `<polygon points="${cpts(band)}"${at({ fill: C.hi, fo: 0.4 * bd * (1 - 0.6 * p(t, 40, 41) * (1 - p(t, 48.2, 49))) })}/>`);
      if (dg > 0.004) o += segd(apx(0), apy(0), apx(1), apy(1), { stroke: C.soft, sw: 1.8, da: '5 4', op: c2, ...draw(dg) });
      if (ln1 > 0.004) o += segd(apx(0), apy(0.25), apx(0.75), apy(1), { stroke: C.hi, sw: 3, lc: 'round', op: c2, ...draw(ln1) }) + segd(apx(0.25), apy(0), apx(1), apy(0.75), { stroke: C.hi, sw: 3, lc: 'round', op: c2, ...draw(ln1) });
      /* ---- i due esempi (capitolo 1): la riga del tempo e il punto nel quadrato ---- */
      const rf = 1 - p(t, 16.4, 17.2); // le righe del tempo escono prima del modello
      const row = (y0, X, Y, tL, tA, tB, tP, ok) => {
        const op = p(t, tL, tL + 0.8) * rf;
        if (op <= 0.004) return '';
        const hx = (v) => 366 + 240 * v;
        let q = ln(366, y0, 606, y0, { stroke: C.soft, sw: 1.8, op });
        for (let k = 0; k <= 4; k++) q += ln(hx(k / 4), y0 - 4, hx(k / 4), y0 + 4, { stroke: C.soft, sw: 1.6, op });
        q += lb(366, y0 + 24, '12:00', { op }) + lb(486, y0 + 24, '12:30', { op }) + lb(606, y0 + 24, '13:00', { op });
        const a = p(t, tA, tA + 0.5, E.back), w = p(t, tA + 0.5, tA + 1.5, E.out), b = p(t, tB, tB + 0.5, E.back);
        if (a > 0.004) q += on(w, rect(hx(X), y0 - 22, 60 * w, 9, { rx: 3, fill: C.A, fo: 0.3, stroke: C.A, sw: 1.6, op })) + circ(hx(X), y0, 10 * a, { fill: C.A, op }) + tx(hx(X), y0 + 6, 'A', { ff: SANS, size: 17, fill: C.paper, op: p(t, tA, tA + 0.5) * op });
        if (b > 0.004) q += circ(hx(Y), y0, 10 * b, { fill: C.B, op }) + tx(hx(Y), y0 + 6, 'B', { ff: SANS, size: 17, fill: C.paper, op: p(t, tB, tB + 0.5) * op });
        const pp = p(t, tP, tP + 0.7);
        q += on(pp, pills(y0 + 56, [{ s: ok ? 'si incontrano' : 'non si incontrano', icon: ok ? 'ok' : 'no', col: ok ? OK : NO, op: pp * rf, u: p(t, tP + 0.2, tP + 0.9, E.lin) }], 486));
        return q;
      };
      o += row(150, 1 / 3, 1 / 2, 1.5, 4.4, 9.8, 11.4, true) + row(256, 1 / 6, 5 / 6, 12.4, 12.8, 14.2, 15.4, false);
      const wl = vis(t, 5.8, 9.4, 0.5, 0.5) * rf;
      o += on(wl, tx(hxMid(1 / 3), 116, 'aspetta 15 minuti', { ff: SANS, size: 17, fill: C.soft, op: wl }));
      /* i punti (X, Y) corrispondenti nel quadrato */
      const pt = (X, Y, tP, ok, op) => {
        const u = p(t, tP, tP + 0.6, E.back);
        if (u <= 0.004) return '';
        let q = ln(apx(X), apy(Y), apx(X), APY0, { stroke: C.hi, sw: 1.6, da: '4 4', op: op * 0.9 }) + ln(apx(X), apy(Y), APX0, apy(Y), { stroke: C.hi, sw: 1.6, da: '4 4', op: op * 0.9 });
        q += circ(apx(X), apy(Y), 7 * u, { fill: C.hi, stroke: C.paper, sw: 1.6, op }) + circ(apx(X), apy(Y), 12 * u, { stroke: ok ? OK : NO, sw: 2.4, op: op * p(t, 28.6, 29.6) });
        return q;
      };
      const pe = Math.min(1, c1 + c2);
      o += pt(1 / 3, 1 / 2, 11.4, true, pe) + pt(1 / 6, 5 / 6, 15.4, false, pe);

      /* ---- le quaranta coppie a caso: neutre nel capitolo 1, verdi o rosse nel capitolo 2 ---- */
      const cl = p(t, 28.8, 30);
      let ds = '';
      APD.forEach(([x, y], k) => {
        const u = p(t, 17.4 + 0.08 * k, 17.9 + 0.08 * k, E.back), inb = Math.abs(x - y) <= 0.25;
        if (u <= 0.004) return;
        ds += circ(apx(x), apy(y), 4.2 * u, { fill: inb && cl > 0.5 ? OK : !inb && cl > 0.5 ? NO : C.A, stroke: C.paper, sw: 0.9, op: Math.min(1, c1 + c2 + 0.3 * (1 - p(t, 40, 41))) * (1 - 0.7 * p(t, 40.4, 41.2)) });
      });
      o += ds;

      /* ---- colonna di destra, capitolo 1: il modello ---- */
      if (c1 > 0.004) {
        const Ln = (id, y, s, t0, a = {}) => {
          const u = p(t, t0, t0 + 0.9, E.out);
          return u > 0.004 ? g({ op: c1 }, wipe('cp-appuntamento-' + id + '-' + Math.round(t * 100), 346, y - 30, 290, 44, u, tx(352, y, s, { ta: 'start', size: a.size || 23, fill: a.fill || C.ink }))) : '';
        };
        o += Ln('a', 150, '*X*, *Y* indipendenti', 17.6) + Ln('b', 182, 'e uniformi su [0, 1]', 18.4) + Ln('c', 232, '*f*(*x*, *y*) = 1 · 1 = 1', 20, { size: 25 }) + Ln('d', 282, '*P*(zona) = area', 22, { fill: C.B, size: 26 });
      }

      /* ---- colonna di destra, capitolo 2: la condizione ---- */
      if (c2 > 0.004) {
        const Lc = (id, y, s, t0, a = {}) => {
          const u = p(t, t0, t0 + 0.9, E.out);
          return u > 0.004 ? g({ op: c2 }, wipe('cp-appuntamento-c' + id + '-' + Math.round(t * 100), 346, y - 36, 290, 52, u, tx(352, y, s, { ta: 'start', size: a.size || 23, fill: a.fill || C.ink }))) : '';
        };
        o += Lc('a', 132, 'si incontrano se', 24.8) + Lc('b', 178, '|*X* − *Y*| ≤ 1/4', 25.8, { size: 32 });
        o += on(p(t, 27, 27.8) * c2, lb(352, 206, '15 minuti = 1/4 d’ora', { ta: 'start', op: p(t, 27, 27.8) * c2 }));
        o += Lc('c', 244, 'rette *Y* = *X* ± 1/4', 31.6, { size: 21 });
        const nx = p(t, 33, 34) * c2;
        if (nx > 0.004) {
          o += cross(apx(0.22), apy(0.78), 26, p(t, 33, 33.8, E.lin), { op: c2 }) + cross(apx(0.78), apy(0.22), 26, p(t, 33.6, 34.4, E.lin), { op: c2 });
          o += tx(352, 284, 'nei triangoli bianchi', { ta: 'start', size: 22, op: nx }) + tx(352, 312, 'uno arriva quando', { ta: 'start', size: 22, op: p(t, 34.4, 35.2) * c2 }) + tx(352, 340, 'l’altro è già andato', { ta: 'start', size: 22, op: p(t, 35.6, 36.4) * c2 });
        }
      }

      /* ---- capitolo 3: aree dei triangoli, la fascia vale 7/16 ---- */
      const c3v = p(t, 40.2, 41);
      if (c3v > 0.004) {
        const t1 = p(t, 41, 42) * (1 - p(t, 48.2, 49)), t2 = p(t, 45.6, 46.6) * (1 - p(t, 48.2, 49)), bg = p(t, 48.2, 49.4);
        const tri1 = [[0.25, 0], [1, 0], [1, 0.75]].map(([x, y]) => [apx(x), apy(y)]), tri2 = [[0, 0.25], [0, 1], [0.75, 1]].map(([x, y]) => [apx(x), apy(y)]);
        o += on(t1, `<polygon points="${cpts(tri1)}"${at({ fill: C.A, fo: 0.4 * t1, stroke: C.A, so: t1, sw: 2.4 })}/>`);
        o += on(t2, `<polygon points="${cpts(tri2)}"${at({ fill: C.A, fo: 0.4 * t2, stroke: C.A, so: t2, sw: 2.4 })}/>`);
        o += on(t1, tx(apx(0.625), apy(0) - 8, '3/4', { size: 22, op: p(t, 41.6, 42.4) * t1 }) + tx(apx(1) - 12, apy(0.375) + 8, '3/4', { size: 22, ta: 'end', op: p(t, 42, 42.8) * t1 }));
        o += on(t2, tx(apx(0.375), apy(1) + 26, '3/4', { size: 22, op: p(t, 46.2, 47) * t2 }) + tx(apx(0) + 12, apy(0.625) + 8, '3/4', { size: 22, ta: 'start', op: p(t, 46.6, 47.4) * t2 }));
        o += on(bg, tx(apx(0.5), apy(0.5) + 10, '7/16', { size: 34, op: bg }));
        /* la fascia, in oro più intenso */
        o += on(bg, `<polygon points="${cpts(band)}"${at({ fill: C.hi, fo: 0.3 * bg })}/>`);
        const Ld = (id, y, s, t0, a = {}) => {
          const u = p(t, t0, t0 + 0.9, E.out);
          return u > 0.004 ? g({ op: c3v }, wipe('cp-appuntamento-d' + id + '-' + Math.round(t * 100), 346, y - 34, 290, 48, u, tx(352, y, s, { ta: 'start', size: a.size || 23, fill: a.fill || C.ink }))) : '';
        };
        o += Ld('a', 128, 'cateti: 1 − 1/4 = 3/4', 40.8) + Ld('b', 166, 'area = (3/4 × 3/4)/2 = 9/32', 43.2, { size: 20 }) + Ld('c', 204, 'due: 2 × 9/32 = 9/16', 46, { size: 22 });
        o += Ld('d', 252, '*P* = 1 − 9/16 = 7/16', 48.4, { size: 27 }) + Ld('e', 292, '≈ 0,4375', 50.6, { size: 30, fill: C.B });
        const pl = p(t, 52.6, 53.4) * c3v;
        o += on(pl, pills(334, [{ s: 'meno di una volta su due', col: C.hi, op: pl }], 490));
      }
      return o;
    },
  });

  /* ======================================================================
     3.6 · Densità condizionale: la fetta a y fissato, rinormalizzata; triangolo contro quadrato
     ====================================================================== */
  const DX0 = 70, DS = 150, DY0 = 252, DRX0 = 372, DQ = 36; // pannello del triangolo; grafico della fetta (36 px per unità di densità)
  const dtx = (x) => DX0 + DS * x, dty = (y) => DY0 - DS * y;
  const drx = (x) => DRX0 + DS * x, dq = (d) => DY0 - DQ * d;
  const fmt2 = (v) => v.toFixed(2).replace('.', ',');

  PV.add('condizc', {
    sec: '3.17',
    short: 'La densità condizionale',
    title: 'Densità condizionale: restringi e rinormalizza la fetta',
    alt: 'Animazione: tagliando la densità congiunta con il piano di altezza Y = y si ottiene una fetta x ↦ f(x, y), che si divide per la sua area f_Y(y) per avere una densità; sul triangolo con densità 2 è uniforme su (0, y), alta 1/y, con media y/2. Con variabili indipendenti tutte le fette hanno la stessa forma e f(x | y) = f_X(x); sul triangolo no.',
    dur: 58,
    poster: 21,
    chap: [[0, 'Una fetta della superficie'], [26.2, 'Uniforme su (0, y)'], [39.8, 'Indipendenza: fette uguali']],
    caps: [
      [0, 'Come si condiziona una variabile continua a un’altra? Si taglia la superficie con il piano di altezza *Y* = *y*: la fetta è *x* ↦ *f*(*x*, *y*).'],
      [9.3, 'Sul triangolo, con densità 2, a *y* = 0,4 la fetta è un rettangolo alto 2 e largo 0,4: la sua area è 0,8, cioè *f*_Y(0,4).'],
      [17.3, 'Dividendo per quest’area si ottiene una fetta di area 1, cioè una densità: *f*(*x* | *y*) = *f*(*x*, *y*)/*f*_Y(*y*). Restringi e rinormalizza.'],
      [26.2, 'Per ogni *y* la fetta è uniforme su (0, *y*), alta 1/*y*. Al crescere di *y* diventa più larga e più bassa.'],
      [33.4, 'Il valore atteso condizionato è il punto medio della fetta: *E*[*X* | *Y* = *y*] = *y*/2, e cresce con *y*.'],
      [39.8, 'Se *X* e *Y* sono indipendenti, sapere *Y* non cambia niente: tutte le fette hanno la stessa forma, quella di *f*_X.'],
      [49.4, 'Sul triangolo le fette hanno forme diverse, più larghe e più basse al crescere di *y*: *X* e *Y* sono dipendenti.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 25.6, 'Una fetta della superficie', '*f*(*x*, *y*) con *y* fissato') + heading(t, 26.8, 39.2, 'La fetta è uniforme su (0, *y*)', 'cambia al variare di *y*') + heading(t, 40.4, 58.4, 'Indipendenza: tutte le fette uguali', 'confronto fra quadrato e triangolo');
      const ax = p(t, 0.5, 1.8);
      const triOp = Math.max(ax * (1 - p(t, 39.6, 40.4)), p(t, 49.2, 50)), sqOp = p(t, 40.2, 41) * (1 - p(t, 49, 49.8));

      /* ---- assi dei due pannelli ---- */
      let r = ln(dtx(0) - 6, dty(0), dtx(1) + 10, dty(0), { stroke: C.soft, sw: 1.8, op: ax }) + ln(dtx(0), dty(0) + 6, dtx(0), dty(1) - 10, { stroke: C.soft, sw: 1.8, op: ax }) + lb(dtx(1) + 18, dty(0) + 6, '*x*', { ta: 'start', op: ax }) + lb(dtx(0) - 4, dty(1) - 16, '*y*', { op: ax });
      r += lb(dtx(0), dty(0) + 24, '0', { op: ax }) + lb(dtx(1), dty(0) + 24, '1', { op: ax });
      r += ln(drx(0) - 6, dq(0), drx(1) + 10, dq(0), { stroke: C.soft, sw: 1.8, op: ax }) + ln(drx(0), dq(0) + 6, drx(0), dq(4) - 8, { stroke: C.soft, sw: 1.8, op: ax }) + lb(drx(1) + 18, dq(0) + 6, '*x*', { ta: 'start', op: ax }) + lb(drx(1) + 12, dq(4) + 6, 'densità', { ta: 'start', op: ax });
      r += lb(drx(0), dq(0) + 24, '0', { op: ax }) + lb(drx(1), dq(0) + 24, '1', { op: ax });
      for (let d = 1; d <= 4; d++) r += ln(drx(0) - 5, dq(d), drx(0), dq(d), { stroke: C.soft, sw: 1.6, op: ax }) + lb(drx(0) - 10, dq(d) + 6, d, { ta: 'end', op: ax });
      o += r;

      /* ---- il triangolo (densità 2) e il quadrato (densità 1) ---- */
      o += on(triOp, `<polygon points="${cpts([[dtx(0), dty(0)], [dtx(0), dty(1)], [dtx(1), dty(1)]])}"${at({ fill: C.A, fo: 0.3 * triOp, stroke: C.A, so: triOp, sw: 2 })}/>`);
      o += on(sqOp, rect(dtx(0), dty(1), DS, DS, { fill: C.A, fo: 0.2 * sqOp, stroke: C.A, so: sqOp, sw: 2 }));
      const fl = p(t, 2.2, 3) * (1 - p(t, 25.6, 26.4)) * triOp;
      o += on(fl, tx(dtx(0.5), dty(0.88) + 8, '*f* = 2', { size: 24, op: fl }));
      o += on(sqOp, tx(dtx(0.5), dty(0.5) + 8, '*f* = 1', { size: 24, op: sqOp * p(t, 41, 41.8) * (1 - p(t, 42.4, 43)) }));

      /* ---- la posizione del piano di taglio: y, e le due quantità (larghezza, altezza) della fetta ---- */
      let yv = 0.4, w = 0.4, hgt = 2, tri = true, nrm = 1, live = 0;
      if (t < 26.2) { yv = 0.4; nrm = p(t, 17.8, 20, E.io); }
      else if (t < 39.4) { live = 1; yv = t < 30.2 ? lerp(0.4, 0.92, p(t, 26.6, 30.2, E.io)) : t < 34 ? lerp(0.92, 0.25, p(t, 30.2, 34, E.io)) : lerp(0.25, 0.5, p(t, 34, 36.4, E.io)); }
      else if (t < 49.2) { tri = false; live = 1; yv = lerp(0.12, 0.94, p(t, 41.4, 47.4, E.lin)); }
      else { live = 1; yv = lerp(0.3, 0.94, p(t, 50.4, 56.2, E.lin)); }
      w = tri ? yv : 1;
      hgt = tri ? 2 + (1 / yv - 2) * nrm : 1;

      /* il segmento sul pannello di sinistra */
      const segOp = Math.max((t < 3.6 ? 0 : p(t, 3.6, 4.6)) * (1 - p(t, 38.8, 39.6)), p(t, 41.2, 41.8) * (1 - p(t, 48.6, 49.2)), p(t, 50.2, 50.8));
      if (segOp > 0.004) {
        const len = DS * w * (t < 4.6 ? p(t, 3.6, 4.6) : 1);
        o += ln(dtx(0), dty(yv), dtx(0) + len, dty(yv), { stroke: C.hi, sw: 5, lc: 'round', op: segOp }) + circ(dtx(0) + len, dty(yv), 5.5, { fill: C.hi, op: segOp });
        o += tx(dtx(0) - 8, dty(yv) + 6, fmt2(yv), { size: 18, ta: 'end', op: segOp });
      }
      /* le fette lasciate dietro (capitolo 3): una per y = 0,3 – 0,6 – 0,9 */
      const ghost = (y0, col, tt, tri0, sw) => {
        const u = p(t, tt, tt + 0.4);
        if (u <= 0.004) return '';
        const ww = tri0 ? y0 : 1, hh = tri0 ? 1 / y0 : 1;
        return ln(dtx(0), dty(y0), dtx(ww), dty(y0), { stroke: col, sw: 4, lc: 'round', op: u * 0.9 }) + rect(drx(0), dq(hh), DS * ww, DQ * hh, { stroke: col, sw, op: u * 0.95 });
      };
      if (t >= 40.4 && t < 49.4) o += ghost(0.3, C.A, 42.6, false, 6) + ghost(0.6, C.B, 44.9, false, 3.6) + ghost(0.9, C.C, 47.2, false, 1.8);
      if (t >= 49.4) o += ghost(0.3, C.A, 50.9, true, 2.4) + ghost(0.6, C.B, 53.1, true, 2.4) + ghost(0.9, C.C, 55.8, true, 2.4);

      /* ---- la fetta nel grafico di destra ---- */
      const vis3 = Math.max((t < 3.6 ? 0 : 1) * (1 - p(t, 38.8, 39.6)), p(t, 41.2, 42) * (1 - p(t, 48.6, 49.2)), p(t, 50.2, 51));
      if (vis3 > 0.004) {
        const rise = t < 26 ? p(t, 9.8, 11.8, E.out) : 1, H = DQ * hgt * rise, W = DS * w;
        const op = Math.min(1, vis3);
        o += rect(drx(0), dq(0) - H, W, H, { fill: C.hi, fo: 0.42 * (1 - nrm) * op, stroke: C.hi, so: (1 - nrm) * op, sw: 2.4 });
        o += rect(drx(0), dq(0) - H, W, H, { fill: C.A, fo: 0.36 * nrm * op, stroke: C.A, so: nrm * op, sw: 2.4 });
        /* etichette sulla fetta */
        const a1 = p(t, 12.4, 13.2) * (1 - p(t, 17.6, 18.2));
        o += on(a1, tx(drx(0) + W / 2, dq(0) - H / 2 + 8, '0,8', { size: 24, op: a1 }) + tx(drx(0.4), dq(0) + 44, '0,4', { size: 18, fill: C.hi, op: a1 }));
        const a2 = p(t, 20.6, 21.4) * (1 - p(t, 25.6, 26.2));
        o += on(a2, tx(drx(0) + W + 10, dq(0) - H / 2 + 8, 'area 1', { size: 22, ta: 'start', op: a2 }));
        if (t >= 26.4 && t < 39.6) {
          const mx = drx(w / 2), me = p(t, 33.4, 34.4) * (1 - p(t, 38.8, 39.6));
          o += on(me, ln(mx, dq(0), mx, dq(0) - H, { stroke: C.hi, sw: 3.4, op: me }) + path(`M${f(mx)} ${dq(0) + 3}l-8 14h16z`, { fill: C.hi, stroke: C.ink, sw: 1.4, op: me }) + tx(mx, dq(0) - H - 10, '*y*/2', { size: 20, op: me }));
        }
      }

      /* ---- testi: la formula della fetta, la densità condizionale, il confronto ---- */
      const T1 = (id, x, y, s, t0, t1, a = {}) => { const u = vis(t, t0, t1, 0.6, 0.6); return on(u, tx(x, y, s, { size: a.size || 22, fill: a.fill || C.ink, op: u, ta: a.ta || 'middle' })); };
      o += T1('a', 320, 314, 'area = 2 × 0,4 = 0,8 = *f*_Y(0,4)', 12.8, 17.9);
      o += T1('b', 320, 314, 'divido per 0,8: altezza 2/0,8 = 2,5 e area 1', 18.4, 26.2);
      o += T1('c', 320, 346, '*f*(*x* | *y*) = *f*(*x*, *y*) / *f*_Y(*y*)', 22.4, 26.2, { size: 24 });
      o += T1('d', 190, 314, '*f*(*x* | *y*) = 2/(2*y*) = 1/*y*', 27.4, 39.2) + T1('e', 190, 344, 'per 0 < *x* < *y*', 28.8, 39.2, { size: 20 });
      o += T1('f', 450, 314, 'uniforme su (0, *y*)', 30, 39.2) + T1('g', 450, 344, '*E*[*X* | *Y* = *y*] = *y*/2', 34.6, 39.2);
      const rd = live * Math.min(1, vis3) * (t < 39.4 ? 1 - p(t, 38.8, 39.6) : 1);
      if (t >= 26.4 && rd > 0.004) o += tx(526, 150, '*y* = ' + fmt2(yv), { size: 20, ta: 'start', op: rd }) + tx(526, 180, (tri ? '1/*y* = ' + fmt2(1 / yv) : 'altezza 1'), { size: 20, ta: 'start', fill: C.A, op: rd });
      const pa = p(t, 47.6, 48.4) * (1 - p(t, 48.8, 49.4)), pb = p(t, 56.2, 57) ;
      o += on(pa, pills(326, [{ s: 'stessa forma: *f*(*x* | *y*) = *f*_X(*x*)', icon: 'ok', col: OK, op: pa, u: p(t, 47.8, 48.5, E.lin) }]));
      o += on(pb, pills(326, [{ s: 'forme diverse: dipendenti', icon: 'no', col: NO, op: pb, u: p(t, 56.4, 57.1, E.lin) }]));
      return o;
    },
  });

  /* ======================================================================
     3.6 · Somma di variabili indipendenti: la convoluzione di due uniformi (densità triangolare)
     ====================================================================== */
  const VX0 = 130, VS = 90, VAY = 176, VAH = 60, VBY = 326, VBH = 80; // origine, px per unità, base e altezza (densità 1) dei due pannelli
  const vx = (x) => VX0 + VS * x;
  const vfz = (z) => (z <= 0 || z >= 2 ? 0 : z <= 1 ? z : 2 - z); // la densità della somma: triangolare su [0, 2]
  const vov = (z) => Math.max(0, Math.min(1, z) - Math.max(0, z - 1)); // lunghezza della sovrapposizione fra f_X e la finestra f_Y(z − x)
  const VZK = [[9.5, -0.2], [16.8, 0.5], [19.8, 0.5], [21.6, 1], [24.6, 1], [31.6, 2.4], [33, 2.4]]; // dove sta la finestra nel tempo
  const vzAt = (t) => {
    if (t <= VZK[0][0]) return VZK[0][1];
    for (let i = 1; i < VZK.length; i++) if (t <= VZK[i][0]) return lerp(VZK[i - 1][1], VZK[i][1], E.io(p(t, VZK[i - 1][0], VZK[i][0], E.lin)));
    return VZK[VZK.length - 1][1];
  };

  PV.add('convoluzione', {
    sec: '3.21',
    short: 'La somma e la convoluzione',
    title: 'Somma di variabili indipendenti: la convoluzione di due uniformi',
    alt: 'Animazione: la densità della somma di due variabili indipendenti è l’integrale di f_X(x) f_Y(z − x); per due uniformi su [0, 1] una finestra scorre con z e la lunghezza della sovrapposizione disegna una densità triangolare su [0, 2], con picco 1 in z = 1. Così P(X + Y ≤ 1) = 1/2 e P(X + Y > 1,5) = 1/8.',
    dur: 58,
    poster: 38,
    chap: [[0, 'Sommare due variabili'], [9.5, 'La finestra che scorre'], [43, 'La densità triangolare']],
    caps: [
      [0, 'Quando sommi due variabili indipendenti, la legge della somma si ricava dalle due leggi. Nel discreto era una somma di prodotti: nel continuo è un integrale.'],
      [9.5, 'La densità della somma in *z* è l’area sotto il prodotto *f*_X(*x*) *f*_Y(*z* − *x*): la finestra di *Y* scorre insieme a *z*.'],
      [17.5, 'A *z* = 0,5 la sovrapposizione è lunga 0,5. A *z* = 1 è piena: 1. La lunghezza della sovrapposizione è la densità.'],
      [25.5, 'Per *z* > 1 la finestra comincia a uscire e la sovrapposizione si accorcia: la densità scende fino a 0 in *z* = 2.'],
      [33, 'Il risultato è una densità triangolare su [0, 2], con il picco in 1: *f*(*z*) = *z* fino a 1, poi 2 − *z*. È il cugino continuo della somma di due dadi.'],
      [43, 'Per esempio *P*(*X* + *Y* ≤ 1) = 1/2, metà dell’area. E *P*(*X* + *Y* > 1,5) = 1/8: il triangolino di base 0,5 e altezza 0,5.'],
      [51.4, 'I valori centrali sono i più probabili, perché si possono ottenere in più modi.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 9.1, 'Sommare due variabili indipendenti', 'la convoluzione') + heading(t, 9.9, 42.6, 'La finestra che scorre', '*f*_X(*x*) *f*_Y(*z* − *x*) e la sua area') + heading(t, 43.4, 58.4, 'La densità triangolare', 'della somma di due uniformi');
      const z = vzAt(t), ax = p(t, 0.4, 1.4), fx = p(t, 0.8, 2.2, E.out);
      const hB = (d) => VBY - VBH * d;

      /* ---- pannello alto: f_X (blu) e la finestra f_Y(z − x) (arancio) ---- */
      let r = ln(vx(-1.1), VAY, vx(2.4) + 10, VAY, { stroke: C.soft, sw: 1.8, op: ax }) + [0, 1, 2].map((v) => ln(vx(v), VAY - 4, vx(v), VAY + 4, { stroke: C.soft, sw: 1.6, op: ax }) + lb(vx(v), VAY + 24, v, { op: ax })).join('') + lb(vx(2.4) + 22, VAY + 6, '*x*', { ta: 'start', op: ax });
      r += rect(vx(0), VAY - VAH * fx, VS, VAH * fx, { fill: C.A, fo: 0.25, stroke: C.A, sw: 2 }) + on(fx, tx(vx(0.5), VAY - VAH - 10, '*f*_X', { size: 22, fill: C.A, op: fx }));
      const wd = p(t, 6, 7.2) ;
      const zz = t < 9.5 ? -0.2 : z, ov = t < 11 ? 0 : p(t, 11, 12) ;
      if (wd > 0.004) {
        r += rect(vx(zz - 1), VAY - VAH, VS, VAH, { fill: C.B, fo: 0.25 * wd, stroke: C.B, so: wd, sw: 2.2 });
        r += tx(vx(zz - 0.5), VAY + 48, '*f*_Y(*z* − *x*)', { size: 20, fill: C.B, op: wd });
        const a0 = Math.max(0, zz - 1), a1 = Math.min(1, zz);
        if (a1 > a0 + 1e-6) r += rect(vx(a0), VAY - VAH, VS * (a1 - a0), VAH, { fill: C.hi, fo: 0.6 * ov, stroke: C.hi, so: ov, sw: 2 });
      }
      o += r;

      /* ---- pannello basso: la densità della somma, disegnata mentre la finestra scorre ---- */
      const bx = p(t, 8, 9);
      let q = ln(vx(-1.1), VBY, vx(2.4) + 10, VBY, { stroke: C.soft, sw: 1.8, op: bx }) + [0, 1, 2].map((v) => ln(vx(v), VBY - 4, vx(v), VBY + 4, { stroke: C.soft, sw: 1.6, op: bx }) + lb(vx(v), VBY + 24, v, { op: bx })).join('') + lb(vx(2.4) + 22, VBY + 6, '*z*', { ta: 'start', op: bx }) + lb(vx(-1.0), VBY - 56, '*f*_{X+Y}', { ta: 'start', op: bx });
      o += q;
      const zc = t < 9.5 ? -0.2 : Math.min(2.4, z), done = t >= 33 ? 2 : Math.min(2, Math.max(-0.2, zc));
      if (t >= 9.5 && done > 0.001) {
        const fnz = (zv) => vfz(zv);
        o += path(areaD(fnz, 0, Math.min(2, Math.max(0, zc)), vx, hB, VBY, 80), { fill: C.hi, fo: 0.28 });
        o += path(curveD(fnz, -0.2, Math.min(2.4, zc), vx, hB, 90), { stroke: C.hi, sw: 3.4, lc: 'round', lj: 'round' });
      }
      /* la linea verticale che collega la posizione z, e il punto sulla curva */
      const mk = p(t, 11, 12) * (1 - p(t, 33, 34));
      if (mk > 0.004) o += ln(vx(z), VAY + 4, vx(z), VBY, { stroke: C.hi, sw: 2, da: '5 4', op: mk * 0.9 }) + circ(vx(z), VAY, 5, { fill: C.hi, op: mk }) + circ(vx(z), hB(vfz(z)), 6.5, { fill: C.hi, stroke: C.paper, sw: 1.6, op: mk });

      /* ---- colonna di destra: la formula, i numeri che scorrono, la forma finale, le probabilità ---- */
      const Lc = (id, y, s, t0, t1, a = {}) => {
        const u = p(t, t0, t0 + 0.9, E.out), op = t1 === undefined ? 1 : 1 - p(t, t1, t1 + 0.7);
        return u > 0.004 && op > 0.004 ? g({ op }, wipe('cp-convoluzione-' + id + '-' + Math.round(t * 100), 380, y - 30, 256, 44, u, a.parts ? txc(388, y, a.parts, { ta: 'start', size: a.size || 22 }) : tx(388, y, s, { ta: 'start', size: a.size || 22, fill: a.fill || C.ink }))) : '';
      };
      o += Lc('a', 128, '*f*_{X+Y}(*z*) =', 2.2, 33.2) + Lc('b', 162, '', 3, 33.2, { parts: [['∫ ', C.ink], ['*f*_X(*x*)', C.A]] }) + Lc('c', 196, '', 3.8, 33.2, { parts: [['· ', C.ink], ['*f*_Y(*z* − *x*)', C.B], [' d*x*', C.ink]] });
      o += on(p(t, 5, 5.8) * (1 - p(t, 33.2, 33.9)), lb(388, 222, 'come nel discreto, ma con ∫', { ta: 'start', op: p(t, 5, 5.8) * (1 - p(t, 33.2, 33.9)) }));
      const rd = p(t, 12.2, 13) * (1 - p(t, 33.2, 33.9));
      if (rd > 0.004) {
        const zr = Math.min(2.4, Math.max(0, z));
        o += tx(388, 260, '*z* = ' + fmt2(zr), { ta: 'start', size: 22, op: rd }) + tx(388, 292, 'sovrapposta: ' + fmt2(vov(zr)), { ta: 'start', size: 22, fill: C.ink, op: rd }) + tx(388, 324, '*f*(*z*) = ' + fmt2(vfz(zr)), { ta: 'start', size: 22, fill: C.B, op: rd });
      }
      o += Lc('d', 128, '*f*(*z*) = *z*,   0 ≤ *z* ≤ 1', 33.8, 43) + Lc('e', 164, '*f*(*z*) = 2 − *z*,   1 ≤ *z* ≤ 2', 35.8, 43);
      o += on(p(t, 38, 38.8) * (1 - p(t, 42.6, 43.2)), lb(388, 196, 'picco in *z* = 1: massimo di 1', { ta: 'start', op: p(t, 38, 38.8) * (1 - p(t, 42.6, 43.2)) }));
      /* capitolo 3: le due probabilità sull'area */
      const g1 = p(t, 43.6, 44.8), g2 = p(t, 48.4, 49.6);
      o += on(g1, path(areaD(vfz, 0, 1, vx, hB, VBY, 40), { fill: C.A, fo: 0.35 * g1, stroke: C.A, so: g1, sw: 1.6 }) + tx(vx(0.62), VBY - 14, '1/2', { size: 24, op: g1 }));
      o += on(g2, path(areaD(vfz, 1.5, 2, vx, hB, VBY, 30), { fill: C.B, fo: 0.5 * g2, stroke: C.B, so: g2, sw: 1.6 }) + tx(vx(1.78), VBY - 52, '1/8', { size: 22, op: g2 }));
      o += Lc('f', 130, '*P*(*X* + *Y* ≤ 1) = 1/2', 44.2, undefined, { fill: C.A }) + Lc('g', 170, '*P*(*X* + *Y* > 1,5) = 1/8', 48.8, undefined, { fill: C.B });
      const pl = p(t, 52.6, 53.4);
      o += on(pl, tx(388, 232, 'i valori centrali si possono', { ta: 'start', size: 20, op: pl }) + tx(388, 258, 'ottenere in più modi', { ta: 'start', size: 20, op: pl }));
      return o;
    },
  });

  /* ======================================================================
     3.6 · Minimo e massimo di variabili indipendenti: i prodotti come aree, esponenziali di ritmi 2 e 3
     ====================================================================== */
  const MQX0 = 88, MQS = 180, MQY0 = 276; // il quadrato dei casi: angolo in basso a sinistra e lato
  const mqx = (u) => MQX0 + MQS * u, mqy = (v) => MQY0 - MQS * v;
  const MPX0 = 340, MPS = 180, MPY0 = 326, MPH = 86; // grafico: origine, px per unità di m, base, px per unità di probabilità
  const mpx = (m) => MPX0 + MPS * m, mpv = (v) => MPY0 - MPH * v;
  const MFX = (m) => 1 - Math.exp(-2 * m), MFY = (m) => 1 - Math.exp(-3 * m); // ripartizioni dei due job, di ritmo 2 e 3
  const MK1 = [[2.4, 0], [7, 0.5], [12, 0.5], [15.5, 1], [18, 1], [21.5, 1.5], [22.6, 1.5], [24.6, 0.02], [28.4, 0.5], [34.2, 0.5], [37.4, 1], [38.6, 1]]; // dove sta m nel tempo (a 22,6–24,6 torna verso 0 per ripartire col minimo)
  const mAt = (K, t) => {
    if (t <= K[0][0]) return K[0][1];
    for (let i = 1; i < K.length; i++) if (t <= K[i][0]) return lerp(K[i - 1][1], K[i][1], E.io(p(t, K[i - 1][0], K[i][0], E.lin)));
    return K[K.length - 1][1];
  };

  PV.add('minmaxc', {
    sec: '3.22',
    short: 'Il minimo e il massimo',
    title: 'Minimo e massimo di variabili indipendenti: i prodotti sono aree',
    alt: 'Animazione: nel quadrato dei casi di due job indipendenti (esponenziali di ritmo 2 e 3) il massimo ≤ m è il rettangolo F_X(m) F_Y(m) e il minimo > m è il rettangolo opposto (1 − F_X)(1 − F_Y) = e^(−5m), quindi il minimo è esponenziale di ritmo 5. Il job 1 finisce per primo con probabilità 2/5, e E[max] = 1/2 + 1/3 − 1/5 = 19/30.',
    dur: 56,
    poster: 36,
    chap: [[0, 'Il massimo: tutti ≤ m'], [23, 'Il minimo: nessuno > m'], [39, 'Il primo e l’ultimo']],
    caps: [
      [0, 'Per i tempi conta spesso il primo o l’ultimo di più eventi. Due job indipendenti partono insieme: *X* e *Y* sono le loro durate.'],
      [8.3, 'Il massimo è ≤ *m* solo se entrambi sono ≤ *m*. Nel quadrato dei casi la base è *X* ≤ *m*, l’altezza *Y* ≤ *m*: la zona è un rettangolo.'],
      [17.3, 'Per l’indipendenza la sua area è un prodotto: *P*(max ≤ *m*) = *F*_X(*m*) · *F*_Y(*m*).'],
      [23, 'Il minimo è > *m* solo se nessuno dei due è ≤ *m*: è il rettangolo opposto, con area (1 − *F*_X)(1 − *F*_Y).'],
      [30.3, 'Con ritmi 2 e 3: *P*(min > *m*) = *e*^{−2m} · *e*^{−3m} = *e*^{−5m}. Il minimo è ancora esponenziale e i ritmi si sommano.'],
      [39, 'Chi finisce per primo? Il job 1, con probabilità proporzionale al suo ritmo: 2/(2 + 3) = 2/5.'],
      [45.4, 'Il massimo non è esponenziale, ma la sua media si trova con max + min = *X* + *Y*: *E*[max] = 1/2 + 1/3 − 1/5 = 19/30.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 22.4, 'Il massimo: tutti ≤ *m*', '*P*(max ≤ *m*) è un rettangolo') + heading(t, 23.2, 38.6, 'Il minimo: nessuno > *m*', 'il rettangolo opposto') + heading(t, 39.6, 56.4, 'Il primo e l’ultimo', 'esponenziali di ritmo 2 e 3');
      const sq = p(t, 0.5, 1.8) * (1 - p(t, 38.4, 39.2)), ch2 = p(t, 22.6, 23.6);
      const m = mAt(MK1, t), u = MFX(m), v = MFY(m);

      /* ---- il quadrato dei casi: base = X (a sinistra X ≤ m), altezza = Y (in basso Y ≤ m) ---- */
      if (sq > 0.004) {
        const gl = p(t, 4, 5.2) * (1 - 0.78 * ch2), ur = 0.06 + 0.4 * ch2;
        let r = rect(mqx(0), mqy(1), MQS, MQS, { fill: C.paper, stroke: C.soft, sw: 1.8 });
        r += rect(mqx(0), mqy(v), MQS * u, MQS * v, { fill: C.hi, fo: 0.55 * gl, stroke: C.hi, so: 0.9 * gl, sw: 2 });
        r += rect(mqx(u), mqy(1), MQS * (1 - u), MQS * (1 - v), { fill: C.C, fo: ur * 0.9, stroke: C.C, so: 0.3 + 0.6 * ch2, sw: 2 });
        r += rect(mqx(u), mqy(v), MQS * (1 - u), MQS * v, { fill: C.soft, fo: 0.07 }) + rect(mqx(0), mqy(1), MQS * u, MQS * (1 - v), { fill: C.soft, fo: 0.07 });
        r += ln(mqx(u), mqy(0), mqx(u), mqy(1), { stroke: C.soft, sw: 1.4, da: '4 4' }) + ln(mqx(0), mqy(v), mqx(1), mqy(v), { stroke: C.soft, sw: 1.4, da: '4 4' }) + circ(mqx(u), mqy(v), 5, { fill: C.hi, stroke: C.paper, sw: 1.4 });
        /* parentesi: la base è divisa secondo X, l’altezza secondo Y */
        const br = p(t, 2.6, 3.6);
        if (br > 0.004) {
          r += brace(mqx(0), mqx(u), MQY0 + 6, C.A, br) + brace(mqx(u), mqx(1), MQY0 + 6, C.A, br * 0.45);
          r += path(`M${MQX0 - 6} ${mqy(0)}h-5V${f(mqy(v))}h5`, { stroke: C.B, sw: 2, op: br }) + path(`M${MQX0 - 6} ${f(mqy(v))}h-5V${mqy(1)}h5`, { stroke: C.B, sw: 2, op: br * 0.45 });
          r += tx(mqx(0), MQY0 + 30, '*X* ≤ *m*', { size: 17, ff: SANS, fill: C.A, ta: 'start', op: br }) + tx(mqx(1), MQY0 + 30, '*X* > *m*', { size: 17, ff: SANS, fill: C.soft, ta: 'end', op: br });
          r += tx(MQX0 - 18, mqy(0) - 4, '*Y* ≤ *m*', { size: 17, ff: SANS, fill: C.B, ta: 'end', op: br }) + tx(MQX0 - 18, mqy(1) + 14, '*Y* > *m*', { size: 17, ff: SANS, fill: C.soft, ta: 'end', op: br });
        }
        o += g({ op: sq }, r);
        /* il prodotto con i numeri, sotto il quadrato */
        const rd = vis(t, 8.4, 22.4, 0.5, 0.6) * sq, rd2 = vis(t, 25.4, 38.4, 0.5, 0.6) * sq;
        o += on(rd, tx(MQX0 + MQS / 2, 340, fmt2(u) + ' · ' + fmt2(v) + ' = ' + fmt2(u * v), { size: 22, fill: C.ink, op: rd }));
        o += on(rd2, tx(MQX0 + MQS / 2, 340, fmt2(1 - u) + ' · ' + fmt2(1 - v) + ' = ' + fmt2((1 - u) * (1 - v)), { size: 22, fill: C.ink, op: rd2 }));
      }

      /* ---- grafico: le probabilità al variare di m (capitolo 1: F e il prodotto; capitolo 2: le code e il loro prodotto) ---- */
      const pa = p(t, 5, 6) * (1 - p(t, 38.4, 39.2));
      if (pa > 0.004) {
        let q = ln(MPX0 - 8, MPY0, mpx(1.5) + 12, MPY0, { stroke: C.soft, sw: 1.8, op: pa }) + ln(MPX0, MPY0 + 6, MPX0, mpv(1) - 8, { stroke: C.soft, sw: 1.8, op: pa });
        [0, 0.5, 1, 1.5].forEach((mv, k) => (q += ln(mpx(mv), MPY0 - 4, mpx(mv), MPY0 + 4, { stroke: C.soft, sw: 1.6, op: pa }) + lb(mpx(mv), MPY0 + 24, ['0', '0,5', '1', '1,5'][k], { op: pa })));
        q += lb(mpx(1.5) + 26, MPY0 + 6, '*m*', { ta: 'end', op: pa }) + lb(MPX0 - 10, mpv(1) + 6, '1', { ta: 'end', op: pa }) + lb(MPX0 - 10, mpv(0.5) + 6, '0,5', { ta: 'end', op: pa });
        o += q;
        const c1op = (1 - ch2) * pa, c2op = ch2 * pa, mm1 = t < 22.6 ? Math.min(1.5, m) : 1.5;
        const mm2 = t < 24.6 ? 0 : Math.min(1.5, m);
        if (c1op > 0.004 && m > 0.001) {
          o += path(curveD(MFX, 0, mm1, mpx, mpv, 60), { stroke: C.A, sw: 2.6, op: c1op, lc: 'round' }) + path(curveD(MFY, 0, mm1, mpx, mpv, 60), { stroke: C.B, sw: 2.6, op: c1op, lc: 'round' }) + path(curveD((x) => MFX(x) * MFY(x), 0, mm1, mpx, mpv, 60), { stroke: C.hi, sw: 4, op: c1op, lc: 'round' });
          o += circ(mpx(mm1), mpv(MFX(mm1) * MFY(mm1)), 6.5, { fill: C.hi, stroke: C.paper, sw: 1.6, op: c1op }) + ln(mpx(mm1), MPY0, mpx(mm1), mpv(MFX(mm1) * MFY(mm1)), { stroke: C.hi, sw: 1.6, da: '4 4', op: c1op });
        }
        if (c2op > 0.004 && mm2 > 0.001) {
          const SX = (x) => Math.exp(-2 * x), SY = (x) => Math.exp(-3 * x), SM = (x) => Math.exp(-5 * x);
          o += path(curveD(SX, 0, mm2, mpx, mpv, 60), { stroke: C.A, sw: 2.6, op: c2op, lc: 'round' }) + path(curveD(SY, 0, mm2, mpx, mpv, 60), { stroke: C.B, sw: 2.6, op: c2op, lc: 'round' }) + path(curveD(SM, 0, mm2, mpx, mpv, 60), { stroke: C.C, sw: 4, op: c2op, lc: 'round' });
          o += circ(mpx(mm2), mpv(SM(mm2)), 6.5, { fill: C.C, stroke: C.paper, sw: 1.6, op: c2op }) + ln(mpx(mm2), MPY0, mpx(mm2), mpv(SM(mm2)), { stroke: C.C, sw: 1.6, da: '4 4', op: c2op });
        }
      }

      /* ---- formule a destra (capitoli 1 e 2) ---- */
      const Lm = (id, y, s, t0, t1, a = {}) => {
        const uu = p(t, t0, t0 + 0.9, E.out), op = 1 - p(t, t1, t1 + 0.7);
        return uu > 0.004 && op > 0.004 ? g({ op }, wipe('cp-minmaxc-' + id + '-' + Math.round(t * 100), 286, y - 30, 350, 44, uu, tx(292, y, s, { ta: 'start', size: a.size || 22, fill: a.fill || C.ink }))) : '';
      };
      o += Lm('a', 114, '*P*(max ≤ *m*)', 9, 22.8) + Lm('b', 144, '= *P*(*X* ≤ *m*) · *P*(*Y* ≤ *m*)', 12.4, 22.8, { size: 21 }) + Lm('c', 174, '= *F*_X(*m*) · *F*_Y(*m*)', 17.6, 22.8);
      o += Lm('d', 114, '*P*(min > *m*)', 24.4, 38.6) + Lm('e', 144, '= (1 − *F*_X)(1 − *F*_Y)', 26.2, 38.6, { size: 21 }) + Lm('f', 174, '= *e*^{−2m} · *e*^{−3m}', 30.8, 38.6) + Lm('g', 204, '= *e*^{−5m}', 33.4, 38.6, { fill: C.C, size: 26 });
      const nt = p(t, 35, 35.8) * (1 - p(t, 38, 38.6));
      o += on(nt, lb(424, 204, 'ritmi: 2 + 3 = 5', { ta: 'start', op: nt }));
      /* legenda dei colori del grafico */
      const lg1 = p(t, 6.4, 7.2) * (1 - p(t, 22.4, 23)), lg2 = p(t, 24.6, 25.4) * (1 - p(t, 38.2, 38.8));
      const leg = (op, items) => items.map(([col, s, x, th]) => circ(x, 222, th ? 0 : 6, { fill: col, op }) + (th ? ln(x - 8, 222, x + 8, 222, { stroke: col, sw: 5, lc: 'round', op }) : '') + tx(x + 14, 228, s, { size: 18, ta: 'start', op })).join('');
      o += on(lg1, leg(lg1, [[C.A, '*F*_X', 296], [C.B, '*F*_Y', 372], [C.hi, '*F*_X · *F*_Y', 448, 1]]));
      o += on(lg2, leg(lg2, [[C.A, '*e*^{−2m}', 296], [C.B, '*e*^{−3m}', 392], [C.C, '*e*^{−5m}', 488, 1]]));

      /* ---- capitolo 3: chi finisce per primo, la media del massimo ---- */
      const c3 = vis(t, 39.0, 56.4, 0.7, 0.01);
      if (c3 > 0.004) {
        const w1 = p(t, 40.4, 42.4, E.out), W = 460;
        o += rect(90, 104, W * 0.4 * w1, 40, { fill: C.A, fo: 0.35, stroke: C.A, sw: 2, op: c3 }) + rect(90 + W * 0.4 * w1, 104, W * 0.6 * w1, 40, { fill: C.B, fo: 0.35, stroke: C.B, sw: 2, op: c3 });
        const l1 = p(t, 42.2, 43) * c3;
        o += on(l1, tx(90 + W * 0.2, 130, 'job 1: 2/5', { size: 22, op: l1 }) + tx(90 + W * 0.7, 130, 'job 2: 3/5', { size: 22, op: l1 }));
        const f1 = p(t, 43.6, 44.4) * c3;
        o += on(f1, tx(320, 178, '*P*(*X* < *Y*) = *λ*_1 / (*λ*_1 + *λ*_2) = 2/5', { size: 24, op: f1 }));
        /* la media del massimo: E[X] + E[Y] − E[min] */
        const row = (y, label, val, len, col, t0, txt, fillTxt) => {
          const uu = p(t, t0, t0 + 0.9, E.out) * c3;
          if (uu <= 0.004) return '';
          return tx(150, y + 6, label, { size: 20, ta: 'end', op: uu }) + rect(166, y - 10, len * uu, 20, { fill: col, fo: 0.4, stroke: col, sw: 2, op: uu }) + tx(166 + len * uu + 10, y + 6, txt, { size: 20, ta: 'start', fill: fillTxt || C.ink, op: uu });
        };
        o += row(226, '*E*[*X*]', 1 / 2, 300 * 0.5, C.A, 46.2, '1/2');
        o += row(256, '*E*[*Y*]', 1 / 3, 300 * (1 / 3), C.B, 47.6, '1/3');
        o += row(286, '*E*[min]', 1 / 5, 300 * 0.2, C.C, 49.2, '1/5');
        /* E[max] = E[X] + E[Y] − E[min]: le due barre una dopo l’altra, e l’ultimo pezzo, lungo E[min], si toglie */
        const mu = p(t, 51.4, 52.4) * c3, mc = p(t, 53, 54) * c3;
        if (mu > 0.004) {
          o += tx(150, 332, '*E*[max]', { size: 20, ta: 'end', op: mu }) + rect(166, 316, 150 * mu, 20, { fill: C.A, fo: 0.4, stroke: C.A, sw: 2, op: mu }) + rect(316, 316, 100 * mu, 20, { fill: C.B, fo: 0.4, stroke: C.B, sw: 2, op: mu });
          o += on(mc, rect(356, 316, 60, 20, { fill: C.C, fo: 0.5 * mc, stroke: C.C, sw: 2, da: '5 4', op: mc }) + ln(356, 312, 416, 340, { stroke: C.C, sw: 2, op: mc }) + ln(416, 312, 356, 340, { stroke: C.C, sw: 2, op: mc }));
          o += on(mc, brace(166, 356, 342, C.hi, mc, 1));
          o += tx(426, 332, '= 19/30', { size: 22, ta: 'start', fill: C.ink, op: p(t, 53.6, 54.4) * c3 });
        }
        const pl = p(t, 49.4, 50.2) * c3;
        o += on(pl, tx(440, 270, 'max + min = *X* + *Y*', { size: 19, ff: SANS, fill: C.soft, op: pl, ta: 'start' }));
      }
      return o;
    },
  });

  /* ======================================================================
     3.5 · g non monotona: Y = Z² con Z normale standard, due rami x = ±√y (chi-quadro con 1 grado di libertà)
     ====================================================================== */
  const ZX0 = 186, ZS = 62, ZYB1 = 200, ZYS = 26, ZYB2 = 316, ZNS = 190; // asse z: centro e px per unità; basi del pannello della parabola e della campana
  const zpx = (z) => ZX0 + ZS * z, zpy = (y) => ZYB1 - ZYS * y, zpn = (d) => ZYB2 - ZNS * d;
  const ZFZ = (z) => Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI); // densità normale standard (pari)
  const zerf = (x) => { const s = Math.sign(x), a = Math.abs(x), q = 1 / (1 + 0.3275911 * a); return s * (1 - ((((1.061405429 * q - 1.453152027) * q + 1.421413741) * q - 0.284496736) * q + 0.254829592) * q * Math.exp(-a * a)); };
  const ZFY = (y) => zerf(Math.sqrt(y / 2)); // F_Y(y) = P(−√y ≤ Z ≤ √y)
  const ZGY = (y) => Math.exp(-y / 2) / Math.sqrt(2 * Math.PI * y); // densità chi-quadro con 1 grado di libertà
  const ZRX0 = 382, ZRS = 56, ZRB = 206; // grafico di destra: origine, px per unità di y, base
  const zrx = (y) => ZRX0 + ZRS * y;
  const ZYK = [[22.9, 1], [26.5, 3.8], [30.4, 0.4], [34, 1.6], [36.4, 1]]; // dove sta y nel capitolo 2
  const zyAt = (t) => {
    if (t <= ZYK[0][0]) return 1;
    for (let i = 1; i < ZYK.length; i++) if (t <= ZYK[i][0]) return lerp(ZYK[i - 1][1], ZYK[i][1], E.io(p(t, ZYK[i - 1][0], ZYK[i][0], E.lin)));
    return 1;
  };

  PV.add('duerami', {
    sec: '3.32',
    short: 'Se g non è monotona',
    title: 'Se g non è monotona: il quadrato di una normale, due rami che si sommano',
    alt: 'Animazione: per Y = Z², con Z normale, Z² ≤ y equivale a −√y ≤ Z ≤ √y: la retta all’altezza y taglia la parabola in due punti (i due rami) e F_Y(y) = F_Z(√y) − F_Z(−√y), per esempio P(Y ≤ 1) = 0,6827. Derivando i due rami si sommano e, essendo la campana pari, f_Y(y) = f_Z(√y)/√y = e^(−y/2)/√(2πy), la legge chi-quadro con 1 grado di libertà.',
    dur: 58,
    poster: 20,
    chap: [[0, 'Due rami: x = ±√y'], [22.9, 'La ripartizione al variare di y'], [36.9, 'Derivo: i rami si sommano']],
    caps: [
      [0, 'Se *g* non è monotona la formula non si applica, ma il metodo in tre passi funziona sempre. Prendo *Z* normale standard e *Y* = *Z*².'],
      [8.7, 'Passi 1 e 2: *Z*² ≤ *y* equivale a −√*y* ≤ *Z* ≤ √*y*. La retta all’altezza *y* taglia la parabola in due punti: i due rami.'],
      [17, 'Quindi *F*_Y(*y*) = *F*_Z(√*y*) − *F*_Z(−√*y*): per *y* = 1 è *P*(−1 ≤ *Z* ≤ 1) = 0,6827.'],
      [22.9, 'Al variare di *y* cambia la zona colorata: l’area sotto la campana è *F*_Y(*y*).'],
      [27.4, 'La ripartizione sale da 0 a 1: è la curva a destra, e vale 0 per *y* ≤ 0, perché un quadrato non è mai negativo.'],
      [36.9, 'Passo 3: derivo con la catena. La derivata di √*y* è 1/(2√*y*), quella di −√*y* è −1/(2√*y*): i due rami si sommano.'],
      [44.4, 'La campana è pari, quindi i due pezzi sono uguali: *f*_Y(*y*) = *f*_Z(√*y*)/√*y* = *e*^{−y/2}/√(2π*y*).'],
      [51.4, 'È la legge chi-quadro con 1 grado di libertà: altissima vicino a 0 e poi sempre più bassa.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 22.3, 'Se *g* non è monotona', 'il quadrato di una normale: *Y* = *Z*²') + heading(t, 23.5, 36.3, 'Al variare di *y*', 'l’area colorata è *F*_Y(*y*)') + heading(t, 37.5, 58.4, 'Due rami che si sommano', 'derivo con la catena');
      const yv = zyAt(t), s = Math.sqrt(yv);

      /* ---- pannello della parabola y = z² ---- */
      const ax = p(t, 0.4, 1.4), pc = p(t, 1.6, 4, E.io);
      let r = ln(zpx(-2.4), ZYB1, zpx(2.4) + 10, ZYB1, { stroke: C.soft, sw: 1.8, op: ax }) + ln(zpx(0), ZYB1 + 6, zpx(0), zpy(4) - 8, { stroke: C.soft, sw: 1.8, op: ax }) + lb(zpx(0) + 14, zpy(4) - 4, '*y*', { ta: 'start', op: ax });
      o += r;
      if (pc > 0.004) o += path(curveD((z) => z * z, -2, 2, zpx, zpy, 70), { stroke: C.ink, sw: 3, lc: 'round', ...draw(pc) }) + on(p(t, 3.8, 4.6), tx(zpx(0), zpy(2.7), '*y* = *z*²', { size: 22, op: p(t, 3.8, 4.6) }));
      /* ---- la campana f_Z ---- */
      const bx = p(t, 0.8, 1.8);
      o += ln(zpx(-2.4), ZYB2, zpx(2.4) + 10, ZYB2, { stroke: C.soft, sw: 1.8, op: bx }) + [-2, -1, 0, 1, 2].map((v) => ln(zpx(v), ZYB2 - 4, zpx(v), ZYB2 + 4, { stroke: C.soft, sw: 1.6, op: bx }) + lb(zpx(v), ZYB2 + 24, String(v).replace('-', '−'), { op: bx })).join('') + lb(zpx(-2.4) - 14, ZYB2 + 6, '*z*', { ta: 'end', op: bx });
      const cb = p(t, 1.8, 4, E.io);
      if (cb > 0.004) o += path(curveD(ZFZ, -2.4, 2.4, zpx, zpn, 80), { stroke: C.A, sw: 3, lc: 'round', ...draw(cb) }) + on(p(t, 3.6, 4.4), tx(zpx(1.55), zpn(0.1) - 4, '*f*_Z', { size: 21, fill: C.A, ta: 'start', op: p(t, 3.6, 4.4) }));

      /* ---- la retta all’altezza y, i due rami, l’evento −√y ≤ Z ≤ √y ---- */
      const sl = Math.max(p(t, 9, 10.2, E.out), 0);
      if (t >= 9) {
        const op = sl * (t < 22.9 ? 1 : 1);
        const sh = p(t, 12.4, 13.6) * (1 - p(t, 36.2, 37));
        o += on(sh, path(areaD(ZFZ, -s, s, zpx, zpn, ZYB2, 70), { fill: C.hi, fo: 0.45 * sh, stroke: C.hi, so: sh, sw: 1.6 }));
        o += segd(zpx(-2.4), zpy(yv), zpx(2.4), zpy(yv), { stroke: C.hi, sw: 3, lc: 'round', op, ...draw(sl) });
        const dd = p(t, 10.4, 11.6);
        if (dd > 0.004) {
          for (const sg of [-1, 1]) o += ln(zpx(sg * s), zpy(yv), zpx(sg * s), ZYB2, { stroke: C.hi, sw: 1.8, da: '4 4', op: dd * 0.9 }) + circ(zpx(sg * s), zpy(yv), 6.5 * p(t, 10.2, 10.8, E.back), { fill: C.hi, stroke: C.paper, sw: 1.6, op: dd });
        }
        const lb1 = p(t, 11, 11.8) * (1 - p(t, 22.6, 23.2));
        o += on(lb1, tx(zpx(-s), zpy(yv) - 12, '−√*y*', { size: 19, op: lb1 }) + tx(zpx(s), zpy(yv) - 12, '√*y*', { size: 19, op: lb1 }));
        const v1 = p(t, 13.8, 14.6) * (1 - p(t, 22.6, 23.2));
        o += on(v1, tx(zpx(0), ZYB2 - 14, '0,6827', { size: 22, op: v1 }));
        /* capitolo 3: i due pezzi uguali sulla campana */
        const eq = p(t, 38.4, 39.4);
        if (eq > 0.004) {
          const h = ZFZ(s);
          o += ln(zpx(-s), zpn(h), zpx(s), zpn(h), { stroke: C.hi, sw: 2.4, da: '5 4', op: eq }) + circ(zpx(-s), zpn(h), 6, { fill: C.hi, stroke: C.paper, sw: 1.6, op: eq }) + circ(zpx(s), zpn(h), 6, { fill: C.hi, stroke: C.paper, sw: 1.6, op: eq });
          o += tx(zpx(-s) - 10, zpn(h) - 6, '*f*_Z(−√*y*)', { size: 18, ta: 'end', op: eq }) + tx(zpx(s) + 10, zpn(h) - 6, '*f*_Z(√*y*)', { size: 18, ta: 'start', op: eq });
        }
      }

      /* ---- colonna di destra, capitolo 1: i tre passi ---- */
      const c1 = 1 - p(t, 22.3, 23);
      const Lr = (id, y, s2, t0, op, a = {}) => {
        const u = p(t, t0, t0 + 0.9, E.out);
        return u > 0.004 && op > 0.004 ? g({ op }, wipe('cp-duerami-' + id + '-' + Math.round(t * 100), 346, y - 30, 290, 44, u, tx(352, y, s2, { ta: 'start', size: a.size || 21, fill: a.fill || C.ink }))) : '';
      };
      if (c1 > 0.004) {
        o += Lr('a', 126, '*F*_Y(*y*) = *P*(*Z*² ≤ *y*)', 8.6, c1) + Lr('b', 158, '= *P*(−√*y* ≤ *Z* ≤ √*y*)', 12, c1) + Lr('c', 190, '= *F*_Z(√*y*) − *F*_Z(−√*y*)', 17.2, c1, { size: 20 });
        const n0 = p(t, 14.4, 15.2) * c1;
        o += on(n0, tx(352, 232, '*F*_Y(*y*) = 0 per *y* ≤ 0', { ta: 'start', size: 20, op: n0 }) + lb(352, 254, 'un quadrato non è mai negativo', { ta: 'start', op: n0 }));
        const n1 = p(t, 19.2, 20) * c1;
        o += on(n1, tx(352, 296, 'con *y* = 1:', { ta: 'start', size: 20, op: n1 }) + tx(352, 326, '*P*(−1 ≤ *Z* ≤ 1) = 0,6827', { ta: 'start', size: 21, fill: C.B, op: n1 }));
      }

      /* ---- capitolo 2: il grafico di F_Y a destra ---- */
      const c2 = vis(t, 23.1, 37, 0.7, 0.8);
      const plotAxes = (op, vmax) => {
        let q = ln(ZRX0 - 8, ZRB, zrx(4) + 12, ZRB, { stroke: C.soft, sw: 1.8, op }) + ln(ZRX0, ZRB + 6, ZRX0, ZRB - vmax - 8, { stroke: C.soft, sw: 1.8, op });
        for (let k = 0; k <= 4; k++) q += ln(zrx(k), ZRB - 4, zrx(k), ZRB + 4, { stroke: C.soft, sw: 1.6, op }) + lb(zrx(k), ZRB + 24, k, { op });
        return q + lb(zrx(4) + 26, ZRB + 6, '*y*', { ta: 'end', op });
      };
      if (c2 > 0.004) {
        o += plotAxes(c2, 90) + lb(ZRX0 - 10, ZRB - 90 + 6, '1', { ta: 'end', op: c2 }) + lb(ZRX0 - 10, ZRB - 45 + 6, '0,5', { ta: 'end', op: c2 }) + lb(ZRX0 + 44, ZRB - 90 - 2, '*F*_Y', { ta: 'start', op: c2 });
        const dr = p(t, 23.6, 27.6, E.io);
        o += path(`M${ZRX0} ${ZRB}L${f(zrx(0.0001))} ${ZRB}` + curveD(ZFY, 0.002, 4, zrx, (F) => ZRB - 90 * F, 80).replace('M', 'L'), { stroke: C.hi, sw: 3.4, lc: 'round', lj: 'round', op: c2, ...draw(dr) });
        if (dr > 0.99) o += circ(zrx(yv), ZRB - 90 * ZFY(yv), 6.5, { fill: C.hi, stroke: C.paper, sw: 1.6, op: c2 }) + ln(zrx(yv), ZRB, zrx(yv), ZRB - 90 * ZFY(yv), { stroke: C.hi, sw: 1.6, da: '4 4', op: c2 });
        o += g({ op: c2 }, tx(352, 270, '*F*_Y(*y*) = *F*_Z(√*y*) − *F*_Z(−√*y*)', { ta: 'start', size: 20 }));
        o += on(dr, tx(352, 306, '*y* = ' + fmt2(yv) + ':   *F*_Y = ' + fmt2(ZFY(yv)), { ta: 'start', size: 22, fill: C.B, op: c2 * Math.min(1, dr * 3) }));
      }

      /* ---- capitolo 3: derivo; poi il grafico di f_Y ---- */
      const c3 = vis(t, 37.2, 58.6, 0.7, 0.01);
      if (c3 > 0.004) {
        const fa = 1 - p(t, 44, 44.8);
        o += Lr('d', 124, '*F*_Y = *F*_Z(√*y*) − *F*_Z(−√*y*)', 37.6, c3 * fa, { size: 20 });
        o += Lr('e', 156, 'derivo: *f*_Z(√*y*) · 1/(2√*y*)', 40, c3 * fa, { size: 20 }) + Lr('f', 186, '+ *f*_Z(−√*y*) · 1/(2√*y*)', 42.2, c3 * fa, { size: 20 });
        o += Lr('g', 268, '= *f*_Z(√*y*) / √*y*', 45, c3, { size: 22 });
        o += on(p(t, 46, 46.8) * c3, lb(352, 292, 'pezzi uguali: la campana è pari', { ta: 'start', op: p(t, 46, 46.8) * c3 }));
        o += Lr('h', 326, '= *e*^{−y/2} / √(2π*y*)', 47.4, c3, { size: 25, fill: C.B });
        const pf = p(t, 44.8, 45.8) * c3;
        if (pf > 0.004) {
          o += plotAxes(pf, 92) + lb(ZRX0 + 40, ZRB - 92 - 2, '*f*_Y', { ta: 'start', op: pf }) + lb(ZRX0 - 10, ZRB - 62 + 6, '1', { ta: 'end', op: pf });
          const dr2 = p(t, 45.4, 50, E.io);
          o += path(curveD(ZGY, 0.066, 4, zrx, (d) => ZRB - 62 * d, 90), { stroke: C.B, sw: 3.4, lc: 'round', lj: 'round', op: c3, ...draw(dr2) });
          if (dr2 > 0.99) o += circ(zrx(1), ZRB - 62 * ZGY(1), 6.5, { fill: C.hi, stroke: C.paper, sw: 1.6, op: c3 }) + ln(zrx(1), ZRB, zrx(1), ZRB - 62 * ZGY(1), { stroke: C.hi, sw: 1.6, da: '4 4', op: c3 });
          o += on(p(t, 51.6, 52.4) * c3, lb(zrx(1.55), ZRB - 62 * 0.9, 'chi-quadro, 1 g.d.l.', { ta: 'start', op: p(t, 51.6, 52.4) * c3 }));
        }
      }
      return o;
    },
  });
})();
