/* =========================================================================
   pv-parte3b.js — video della Parte 3 (Modelli continui): sezioni 3.3 e 3.4.
   3.3: istogramma → densità, ripartizione come area accumulata, la densità non
        è una probabilità, mediana e quantili.
   3.4: valore atteso e varianza nel continuo, Cauchy, formula delle code,
        densità a pezzi con un estremo incognito.
   Si appoggia a pv.js: ogni video è un PV.add(id, {...}).
   Tutti i tempi sono in secondi; le coordinate sono nel riquadro 640 × 360.
   ========================================================================= */
(function () {
  'use strict';
  const { lerp, E, p, rnd, C, SANS, T, rect, circ, ln, path, g, draw, tx, txc, check, cross, vis, on, heading, lb, brace, vbrace, lbrace, pills, clamp } = PV.h;
  const OK = 'var(--verde)', NO = 'var(--rosso)';

  /* numeri con la virgola, migliaia separate da uno spazio */
  const FMT = (x, d = 2) => x.toFixed(d).replace('.', ',');
  const THOU = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  /* piano cartesiano: (x0, y0) = pixel dell'origine, sx e sy = pixel per unità */
  const plane = (x0, y0, sx, sy) => ({ X: (v) => x0 + sx * v, Y: (v) => y0 - sy * v });
  /* tracciato di y = fn(x) su [a, b] con n tratti */
  const curve = (fn, a, b, P, n = 80) => {
    let d = '';
    for (let i = 0; i <= n; i++) {
      const x = a + ((b - a) * i) / n;
      d += (i ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(fn(x)).toFixed(1);
    }
    return d;
  };
  /* poligonale per punti [x, y] (con salti verticali) */
  const poly = (pts, P) => pts.map(([x, y], i) => (i ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(y).toFixed(1)).join('');
  /* area sotto fn fra a e b, chiusa sull'asse y = base */
  const under = (fn, a, b, P, n = 60, base = 0) => curve(fn, a, b, P, n) + `L${P.X(b).toFixed(1)} ${P.Y(base).toFixed(1)}L${P.X(a).toFixed(1)} ${P.Y(base).toFixed(1)}Z`;

  /* freccia da (x1,y1) a (x2,y2) che si disegna (u da 0 a 1); la punta compare a fine corsa */
  function arrow(x1, y1, x2, y2, u, col, op = 1) {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 8;
    let o = path(`M${x1} ${y1}L${x2} ${y2}`, { stroke: col, sw: 2.2, op, ...draw(u) });
    if (u > 0.92) o += path(`M${x2} ${y2}L${x2 - h * Math.cos(a - 0.45)} ${y2 - h * Math.sin(a - 0.45)}M${x2} ${y2}L${x2 - h * Math.cos(a + 0.45)} ${y2 - h * Math.sin(a + 0.45)}`, { stroke: col, sw: 2.2, lc: 'round', op });
    return o;
  }
  /* fulcro: triangolino sotto la sbarra */
  const fulcrum = (x, y, op = 1) => path(`M${x} ${y}l-13 24h26z`, { fill: C.hi, fo: 0.95, stroke: C.ink, sw: 1.6, op });

  /* normale (solo per disegnare le altezze di 3.3) */
  const erf = (x) => {
    const s = Math.sign(x), a = Math.abs(x), t = 1 / (1 + 0.3275911 * a);
    return s * (1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a));
  };
  const Phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2));
  const invPhi = (u) => {
    let a = -9, b = 9;
    for (let k = 0; k < 48; k++) {
      const m = (a + b) / 2;
      if (Phi(m) < u) a = m;
      else b = m;
    }
    return (a + b) / 2;
  };

  /* ======================================================================
     3.3 · Dall'istogramma alla densità: le altezze di 10 000 persone
     ====================================================================== */
  const MU = 170.5, SG = 10; // altezze: media 170,5 cm, scarto 10 cm (serve solo a disegnare)
  const dens = (x) => Math.exp(-0.5 * ((x - MU) / SG) ** 2) / (SG * Math.sqrt(2 * Math.PI));
  const HX = (h) => 84 + (h - 140) * 7.2, HB = 288, HK = 4000, HY = (d) => HB - HK * d; // cm → pixel; quota dell'asse; pixel per unità di densità
  const HP = { X: HX, Y: HY };
  const CNT = [2, 13, 33, 35, 15, 2, 0]; // persone su 100 in ciascuna fascia da 10 cm (da 140): sommano 100
  const WID = [10, 5, 2, 1]; // larghezze delle fasce nei quattro stadi
  /* altezza (densità) di ognuna delle 70 celle da 1 cm, per ciascun stadio */
  const HS = WID.map((w, s) => Array.from({ length: 70 }, (_, j) => {
    const b = Math.floor(j / w);
    return s === 0 ? CNT[b] / 1000 : (Phi((140 + (b + 1) * w - MU) / SG) - Phi((140 + b * w - MU) / SG)) / w;
  }));
  const FALL = 0.55; // quanto dura la caduta di un punto
  const DOTS = []; // 100 punti, ciascuno vale 100 persone
  CNT.forEach((n, i) => {
    const lo = Phi((140 + 10 * i - MU) / SG), hi = Phi((150 + 10 * i - MU) / SG);
    for (let k = 0; k < n; k++) DOTS.push({ bin: i, x: MU + SG * invPhi(lo + ((k + 0.5) / n) * (hi - lo)) });
  });
  DOTS.sort((a, b) => rnd(Math.round(a.x * 50) + 77) - rnd(Math.round(b.x * 50) + 77)); // ordine di arrivo rimescolato, sempre lo stesso
  {
    const cnt = [0, 0, 0, 0, 0, 0, 0];
    DOTS.forEach((d, a) => {
      d.n = cnt[d.bin]++; // posto nella pila della sua fascia
      d.t0 = 1.9 + a * 0.056; // istante in cui comincia a cadere
    });
  }

  PV.add('istogramma', {
    sec: '3.6',
    short: 'Dall’istogramma alla densità',
    title: 'Da dove viene la densità: dall’istogramma delle altezze alla curva',
    alt: 'Animazione: le altezze di 10 000 persone cadono in fasce da 10 cm e formano un istogramma in cui l’area di ogni rettangolo è la frazione di persone (35% nella fascia 170–180, altezza 0,035 per cm, area totale 1); con fasce da 5, 2 e 1 cm i rettangoli si stringono e i tetti disegnano una curva liscia, la densità, la cui altezza è una probabilità per centimetro.',
    dur: 60,
    poster: 42,
    chap: [[0, 'Fasce da 10 cm: l’istogramma'], [25, 'Fasce sempre più strette'], [45, 'Al limite: la densità']],
    caps: [
      [0, 'Misuro l’altezza di 10 000 persone e divido le altezze in fasce larghe 10 cm. Ogni persona cade in una fascia.'],
      [8, 'Su ogni fascia disegno un rettangolo la cui area è la frazione di persone. Nella fascia 170–180 cade il 35%: area 0,35.'],
      [16, 'La base è 10 cm: altezza 0,35 / 10 = 0,035 per centimetro. Tutte le aree insieme fanno 1: è un istogramma.'],
      [25, 'Rifaccio il disegno con fasce di 5 cm. L’area di ogni rettangolo è ancora la frazione di persone.'],
      [32, 'Poi con fasce di 2 cm e di 1 cm: i rettangoli diventano sempre più stretti e i tetti più regolari.'],
      [39, 'I tetti disegnano una curva sempre più liscia. Quella curva, al limite, è la densità.'],
      [45, 'L’altezza della curva si misura in «probabilità per centimetro»: è l’altezza di un rettangolino di istogramma.'],
      [52.5, 'Un rettangolino largo 1 cm e alto 0,04 ha area 0,04: circa il 4% delle persone sta in quella fascia.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 24.6, 'Un istogramma di altezze', '10 000 persone, fasce larghe 10 cm') + heading(t, 25.2, 44.6, 'Fasce sempre più strette', 'l’area di ogni rettangolo resta la frazione di persone') + heading(t, 45.2, 60.4, 'Al limite: la densità', 'l’altezza della curva è una probabilità per centimetro');

      /* assi */
      const ax = p(t, 0.4, 1.4);
      o += g({ op: ax }, ln(HX(140), HB, HX(210) + 4, HB, { stroke: C.soft, sw: 1.8 }) + ln(HX(140), HB, HX(140), HY(0.0425), { stroke: C.soft, sw: 1.8 }));
      for (let h = 150; h <= 200; h += 10) o += lb(HX(h), HB + 24, h, { op: ax });
      o += lb(HX(210), HB + 24, 'cm', { op: ax });
      for (const d of [0.01, 0.02, 0.03, 0.04]) o += ln(HX(140) - 4, HY(d), HX(140), HY(d), { stroke: C.soft, sw: 1.4, op: ax }) + lb(HX(140) - 8, HY(d) + 6, FMT(d, 2), { ta: 'end', op: ax });
      const yl1 = vis(t, 1.2, 41.4, 0.6, 0.6), yl2 = p(t, 42, 42.8);
      o += on(yl1, lb(HX(140) + 2, 106, 'frazione di persone per cm', { ta: 'start', op: yl1 }));
      o += on(yl2, tx(HX(140) + 2, 106, 'probabilità per cm', { ff: SANS, size: 17, fill: C.B, ta: 'start', op: yl2 }));

      /* le fasce da 10 cm, tratteggiate prima che arrivino i punti */
      const dv = p(t, 1, 2) * (1 - p(t, 8.4, 9.4));
      if (dv > 0.004) for (let h = 150; h <= 200; h += 10) o += ln(HX(h), HB, HX(h), HY(0.04), { stroke: C.soft, sw: 1.2, da: '4 5', so: 0.6 * dv });

      /* altezza di ogni cella: i punti che atterrano, poi le fasce più strette */
      const hb = [0, 0, 0, 0, 0, 0, 0];
      DOTS.forEach((d) => (hb[d.bin] += 0.001 * p(t, d.t0 + FALL, d.t0 + FALL + 0.22, E.out)));
      const u1 = p(t, 25.6, 27.6, E.io), u2 = p(t, 32.4, 34.2, E.io), u3 = p(t, 35.8, 37.6, E.io);
      const hd = [];
      for (let j = 0; j < 70; j++) hd.push(lerp(lerp(lerp(hb[Math.floor(j / 10)], HS[1][j], u1), HS[2][j], u2), HS[3][j], u3));
      const bo = p(t, 2.3, 2.9), dim = p(t, 41.6, 42.8);
      let d = `M${HX(140)} ${HB}`;
      for (let j = 0; j < 70; j++) {
        const y = HY(hd[j]).toFixed(1);
        d += `L${HX(140 + j).toFixed(1)} ${y}L${HX(141 + j).toFixed(1)} ${y}`;
      }
      d += `L${HX(210).toFixed(1)} ${HB}Z`;
      o += on(bo, path(d, { fill: C.A, fo: lerp(0.3, 0.14, dim) * bo, stroke: C.A, sw: 2, so: lerp(1, 0.45, dim) * bo, lj: 'round' }));
      const sep = (w, op) => {
        if (!(op > 0.004)) return '';
        let r = '';
        for (let k = w; k < 70; k += w) r += ln(HX(140 + k), HB, HX(140 + k), HY(Math.min(hd[k - 1], hd[k])), { stroke: C.A, sw: 1.3, so: 0.75 * op * lerp(1, 0.45, dim) });
        return r;
      };
      o += sep(10, bo * (1 - u1)) + sep(5, u1 * (1 - u2)) + sep(2, u2 * (1 - u3)) + sep(1, u3);

      /* i punti che cadono (ognuno vale 100 persone) e il contatore */
      let landed = 0;
      DOTS.forEach((dt) => {
        const tg = dt.t0 + FALL;
        landed += p(t, tg, tg + 0.22, E.lin);
        if (t < dt.t0 || t > tg + 0.22) return;
        const y = lerp(dt.x > 188 ? 140 : 112, HB - 4 * dt.n - 5, p(t, dt.t0, tg, E.acc)), s = 1 - p(t, tg, tg + 0.22); // i due punti a destra partono sotto le scritte
        o += circ(HX(dt.x), y, 3.7 * s, { fill: C.B });
      });
      const cn = vis(t, 1.8, 41, 0.5, 0.5);
      o += on(cn, tx(594, 100, 'persone: ' + THOU(landed * 100), { size: 22, ta: 'end', op: cn }));
      const st = (a, b, s) => {
        const op = vis(t, a, b, 0.5, 0.4);
        return on(op, tx(594, 126, s, { size: 22, fill: C.B, ta: 'end', op }));
      };
      o += st(1.2, 25.4, 'fasce da 10 cm') + st(25.4, 32.6, 'fasce da 5 cm') + st(32.6, 36, 'fasce da 2 cm') + st(36, 41.4, 'fasce da 1 cm');

      /* capitolo 1: percentuali, fascia 170–180, altezza, area totale */
      const pc = 1 - u1;
      CNT.forEach((n, b) => {
        const op = p(t, 8.4 + 0.15 * b, 9 + 0.15 * b) * pc;
        if (!(op > 0.004) || !n) return;
        const h = n * 4, inside = h >= 44;
        o += tx(HX(145 + 10 * b), inside ? HB - h / 2 + 7 : HB - h - 8, n + '%', { size: 20, op });
      });
      const ring = vis(t, 9.6, 25, 0.6, 0.5) * (1 - u1);
      o += on(ring, rect(HX(170), HY(0.035), 72, HB - HY(0.035), { stroke: C.hi, sw: 3.2, so: ring }));
      const p1 = vis(t, 10.2, 16.2, 0.5, 0.5);
      o += on(p1, pills(338, [{ s: 'fascia 170–180: area = 35% = 0,35', op: p1 }]));
      const hm = vis(t, 16.6, 24.6, 0.6, 0.6);
      if (hm > 0.004) {
        const yb = HY(0.035);
        o += brace(HX(170), HX(180), yb - 12, C.B, hm, -1) + tx((HX(170) + HX(180)) / 2, yb - 26, '10 cm', { size: 20, fill: C.B, op: hm });
        o += ln(HX(140), yb, HX(170), yb, { stroke: C.B, sw: 1.8, da: '5 4', op: hm }) + tx(HX(140) + 8, yb - 8, '0,035', { size: 20, fill: C.B, ta: 'start', op: hm });
      }
      const p2 = vis(t, 16.8, 21.6, 0.5, 0.4), p3 = vis(t, 21.8, 24.8, 0.5, 0.4);
      o += on(p2, pills(338, [{ s: 'altezza = area / base = 0,35 / 10 = 0,035 per cm', col: C.B, op: p2 }]));
      o += on(p3, pills(338, [{ s: '2% + 13% + 33% + 35% + 15% + 2% = 100%: area totale 1', icon: 'ok', col: OK, op: p3, u: p(t, 22.2, 23, E.lin) }]));

      /* capitolo 2: la fascia da 5 cm vicino al picco */
      const r5 = vis(t, 28.2, 32, 0.5, 0.5);
      if (r5 > 0.004) o += rect(HX(170), HY(HS[1][30]), 36, HB - HY(HS[1][30]), { stroke: C.hi, sw: 3.2, so: r5 });
      const p5 = vis(t, 28.6, 31.6, 0.5, 0.5);
      o += on(p5, pills(338, [{ s: 'fascia 170–175: area 0,19, altezza 0,19 / 5 ≈ 0,039', col: C.B, op: p5 }]));

      /* capitolo 3: la curva e il rettangolino da 1 cm */
      const cu = p(t, 38.8, 41.8, E.io);
      if (cu > 0.004) o += path(curve(dens, 140, 210, HP, 100), { stroke: C.B, sw: 3.2, lc: 'round', lj: 'round', ...draw(cu) });
      const dl = p(t, 41.8, 42.6);
      o += on(dl, tx(540, 214, 'densità *f*', { size: 26, fill: C.B, op: dl }));
      const cell = vis(t, 46, 60.4, 0.6, 0.01);
      if (cell > 0.004) {
        const yc = HY(HS[3][30]);
        o += rect(HX(170), yc, 7.2, HB - yc, { fill: C.hi, fo: 0.6 * cell, stroke: C.hi, sw: 2, so: cell });
        o += ln(HX(140), yc, HX(170), yc, { stroke: C.hi, sw: 1.8, da: '5 4', op: cell });
        o += brace(HX(170), HX(171), yc - 10, C.ink, cell * p(t, 47, 47.8), -1) + tx(HX(170.5), yc - 24, '1 cm', { size: 20, op: cell * p(t, 47, 47.8) });
      }
      const f1 = vis(t, 53, 60.4, 0.6, 0.01), f0 = vis(t, 47.6, 52.8, 0.6, 0.5);
      o += on(f0, pills(338, [{ s: 'altezza della curva = probabilità per centimetro', col: C.B, op: f0 }]));
      o += on(f1, pills(338, [{ s: 'area = altezza × base = 0,04 × 1 cm = 0,04: circa il 4%', op: f1 }]));
      return o;
    },
  });

  /* ======================================================================
     3.3 · La ripartizione è l'area accumulata: uniforme e triangolare
     ====================================================================== */
  const RU = plane(100, 176, 200, 44), RL = plane(100, 322, 200, 104); // densità in alto, ripartizione in basso
  const RXL = -0.25, RXR = 1.3;
  const RG = [];
  for (let i = 0; i <= 62; i++) RG.push(RXL + ((RXR - RXL) * i) / 62);
  RG.push(0, 1);
  RG.sort((a, b) => a - b);
  const rU = (x) => clamp(x, 0, 1), rT = (x) => clamp(x, 0, 1) ** 2; // le due ripartizioni
  const rgraph = (Ff, c) => {
    const xs = RG.filter((x) => x < c);
    xs.push(c);
    return xs.length > 1 ? poly(xs.map((x) => [x, Ff(x)]), RL) : '';
  };
  /* riga di testo nella colonna di destra, visibile fra a e b */
  const rcol = (t, a, b, y, s, o2 = {}) => {
    const op = vis(t, a, b, 0.5, 0.5);
    return on(op, tx(400, y, s, { size: 22, ta: 'start', ...o2, op }));
  };
  const cA = (t) => (t < 14 ? lerp(-0.12, 1.3, p(t, 7.2, 13.8, E.lin)) : lerp(1.3, 0.6, p(t, 14, 15.6, E.io))); // cursore sull'uniforme
  const cB = (t) => (t < 33 ? 0.5 * p(t, 23, 27.2, E.io) : t < 35.8 ? lerp(0.5, RXR, p(t, 33, 35.4, E.io)) : t < 39 ? lerp(RXR, 0.5, p(t, 35.8, 37.4, E.io)) : lerp(0.5, 0.8, p(t, 39, 41, E.io))); // cursore sulla triangolare

  PV.add('ripc', {
    sec: '3.6',
    short: 'La ripartizione è l’area accumulata',
    title: 'La ripartizione è l’area accumulata sotto la densità, e F′ = f',
    alt: 'Animazione: la probabilità di un intervallo è l’area sotto la densità. Un cursore scorre sull’uniforme su [0, 1] accumulando un rettangolo che cresce (F(x) = x) e poi sulla densità triangolare 2x accumulando un triangolo (F(x) = x²), mentre sotto si disegna il grafico di F. La pendenza di F è l’altezza di f; dove f salta, F ha uno spigolo; P(0,2 < X < 0,5) = 0,3 e un punto ha area zero.',
    dur: 57.5,
    poster: 31,
    chap: [[0, 'L’area accumulata'], [21, 'La densità triangolare'], [35.5, 'F′ = f e gli spigoli'], [48.5, 'Estremi dentro o fuori']],
    caps: [
      [0, 'Una variabile ha densità f se la probabilità di un intervallo è l’area sotto f su quell’intervallo.'],
      [6.5, 'Prendo l’uniforme su [0, 1], dove f vale 1. Un cursore scorre, accumula l’area e sotto si disegna il grafico di F.'],
      [14, 'Quell’area è F(x): un rettangolo di base x e altezza 1, quindi F(x) = x.'],
      [21, 'Con la densità triangolare f(x) = 2x l’area accumulata è un triangolo che cresce.'],
      [28.5, 'In x = 0,5 il triangolo ha base 0,5 e altezza 1: area 0,25. In generale base x, altezza 2x, area x².'],
      [35.5, 'La pendenza di F in ogni punto è l’altezza di f: F′(x) = f(x), dove f è continua.'],
      [41, 'Dove f fa un salto, come in 0 e in 1 per l’uniforme, F ha uno spigolo: la pendenza a sinistra e a destra è diversa.'],
      [48.5, 'P(0,2 < X < 0,5) = F(0,5) − F(0,2) = 0,3. Un punto ha area zero, P(X = x) = 0: estremi dentro o fuori non cambia nulla.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 20.6, 'La probabilità è un’area', '*P*(*a* < *X* ≤ *b*) = area sotto *f* fra *a* e *b*') + heading(t, 21.2, 35.2, 'La densità triangolare', '*f*(*x*) = 2*x* su [0, 1]') + heading(t, 35.8, 41, 'La pendenza di *F* è l’altezza di *f*', '*F*′(*x*) = *f*(*x*) dove *f* è continua') + heading(t, 41.4, 48.2, 'Dove *f* salta, *F* ha uno spigolo', 'la pendenza a sinistra e a destra è diversa') + heading(t, 48.8, 57.7, 'Estremi dentro o fuori', '*P*(0,2 < *X* < 0,5) = *F*(0,5) − *F*(0,2)');

      /* assi: densità in alto, ripartizione in basso */
      const ax = p(t, 0.4, 1.4);
      o += g({ op: ax }, ln(RU.X(RXL), RU.Y(0), RU.X(RXR), RU.Y(0), { stroke: C.soft, sw: 1.8 }) + ln(RL.X(RXL), RL.Y(0), RL.X(RXR), RL.Y(0), { stroke: C.soft, sw: 1.8 }) + ln(RL.X(RXL), RL.Y(0), RL.X(RXL), RL.Y(1.08), { stroke: C.soft, sw: 1.8 }) + ln(RL.X(0), RL.Y(1), RL.X(RXR), RL.Y(1), { stroke: C.line, sw: 1.4, da: '5 4' }));
      for (const v of [0, 1]) o += lb(RU.X(v), RU.Y(0) + 20, v, { op: ax }) + lb(RL.X(v), RL.Y(0) + 20, v, { op: ax });
      o += lb(RL.X(RXL) - 6, RL.Y(0) + 6, '0', { ta: 'end', op: ax }) + lb(RL.X(RXL) - 6, RL.Y(1) + 6, '1', { ta: 'end', op: ax });
      o += tx(22, RU.Y(0.5) + 9, '*f*', { size: 28, fill: C.A, op: ax }) + tx(22, RL.Y(0.7) + 9, '*F*', { size: 28, fill: C.B, op: ax });

      /* le due densità (si danno il cambio a 21 e a 41,5) e le loro ripartizioni */
      const vU = clamp(1 - p(t, 20.4, 21.1) + p(t, 41.4, 42.4), 0, 1), vT = p(t, 21, 21.8) * (1 - p(t, 41, 41.8));
      if (vU > 0.004) {
        o += g({ op: vU }, rect(RU.X(0), RU.Y(1), 200, 44, { fill: C.A, fo: 0.12 * p(t, 1.6, 2.4) }) + path(poly([[RXL, 0], [0, 0], [0, 1], [1, 1], [1, 0], [RXR, 0]], RU), { stroke: C.A, sw: 2.6, lj: 'round', ...draw(p(t, 0.8, 2.2)) }));
        const gp = rgraph(rU, t < 13.8 ? cA(t) : RXR), gv = vU * (t < 21 ? p(t, 7, 7.6) : 1);
        if (gp && gv > 0.004) o += path(gp, { stroke: C.B, sw: 3.4, lc: 'round', lj: 'round', op: gv });
      }
      if (vT > 0.004) {
        o += g({ op: vT }, path(poly([[0, 0], [1, 2], [1, 0]], RU) + 'Z', { fill: C.A, fo: 0.12 * p(t, 21.8, 22.8) }) + path(poly([[RXL, 0], [0, 0], [1, 2], [1, 0], [RXR, 0]], RU), { stroke: C.A, sw: 2.6, lj: 'round', ...draw(p(t, 21, 22.6, E.io)) }));
        const gp = rgraph(rT, t < 35.4 ? cB(t) : RXR), gv = vT * p(t, 22.8, 23.4);
        if (gp && gv > 0.004) o += path(gp, { stroke: C.B, sw: 3.4, lc: 'round', lj: 'round', op: gv });
      }

      /* capitolo 1: un intervallo [a, b] e la sua area */
      const iv = vis(t, 2.4, 6.5, 0.6, 0.5);
      if (iv > 0.004) {
        o += rect(RU.X(0.2), RU.Y(1), RU.X(0.5) - RU.X(0.2), 44, { fill: C.hi, fo: 0.45 * iv, stroke: C.hi, sw: 2, so: iv });
        o += tx(RU.X(0.2), RU.Y(0) + 20, '*a*', { size: 20, op: iv }) + tx(RU.X(0.5), RU.Y(0) + 20, '*b*', { size: 20, op: iv });
      }
      o += rcol(t, 3, 6.5, 124, '*P*(*a* < *X* ≤ *b*)', { size: 24 }) + rcol(t, 3.8, 6.5, 160, '= area sotto *f*', { size: 24, fill: C.A });
      o += rcol(t, 7, 14, 124, '*f*(*x*) = 1 su [0, 1]', { size: 24, fill: C.A });

      /* il cursore: area accumulata a sinistra, punto sul grafico di F */
      const tri = t >= 21.5, c = tri ? cB(t) : cA(t), vc = vis(t, 7, 21, 0.6, 0.8) + vis(t, 22.6, 41.8, 0.8, 0.8);
      if (vc > 0.004) {
        const m = clamp(c, 0, 1), Fc = tri ? rT(c) : rU(c);
        if (m > 0.004) o += path(tri ? poly([[0, 0], [m, 2 * m], [m, 0]], RU) + 'Z' : poly([[0, 0], [0, 1], [m, 1], [m, 0]], RU) + 'Z', { fill: C.A, fo: 0.4 * vc });
        o += ln(RU.X(c), 84, RU.X(c), RL.Y(0), { stroke: C.hi, sw: 2.4, da: '6 4', op: vc }) + circ(RL.X(c), RL.Y(Fc), 6.5, { fill: C.hi, stroke: C.ink, sw: 1.4, op: vc });
        o += tx(400, 332, '*F* = area = ' + FMT(Fc, 2), { size: 24, fill: C.B, ta: 'start', op: vc });
      }

      /* capitolo 1 (seconda parte): rettangolo di base x e altezza 1 */
      const bx = vis(t, 15.6, 20.6, 0.5, 0.6);
      if (bx > 0.004) {
        o += brace(RU.X(0), RU.X(0.6), RU.Y(1) - 6, C.A, bx, -1) + tx(RU.X(0.3), RU.Y(1) - 20, '*x*', { size: 22, fill: C.A, op: bx });
        o += lbrace(RU.X(0) - 6, RU.Y(1), RU.Y(0), C.A, bx) + tx(RU.X(0) - 22, RU.Y(0.5) + 7, '1', { size: 22, fill: C.A, op: bx });
      }
      o += rcol(t, 15.6, 20.6, 124, 'area = base × altezza', { size: 22 }) + rcol(t, 16.8, 20.6, 162, '= *x* · 1 = *x*', { size: 26 }) + rcol(t, 18, 20.6, 214, '*F*(*x*) = *x*', { size: 32, fill: C.B });

      /* capitolo 2: il triangolo, base x e altezza 2x */
      o += rcol(t, 21.8, 35.2, 124, '*f*(*x*) = 2*x*', { size: 28, fill: C.A });
      const hb = vis(t, 27.6, 33.2, 0.5, 0.5);
      if (hb > 0.004) {
        o += tx(RU.X(0.5) + 10, RU.Y(0) + 20, '*x* = 0,5', { size: 20, ta: 'start', op: hb }) + tx(RU.X(0.5) + 10, RU.Y(0.5) + 6, 'altezza 1', { size: 20, ta: 'start', op: hb });
        o += ln(RL.X(RXL), RL.Y(0.25), RL.X(0.5), RL.Y(0.25), { stroke: C.B, sw: 1.6, da: '5 4', op: hb }) + lb(RL.X(RXL) - 6, RL.Y(0.25) + 6, '0,25', { ta: 'end', fill: C.B, op: hb });
      }
      o += rcol(t, 28, 35.2, 166, 'base *x*, altezza 2*x*') + rcol(t, 29.2, 35.2, 200, 'area = *x* · 2*x* / 2') + rcol(t, 30.4, 35.2, 248, '*F*(*x*) = *x*²', { size: 32, fill: C.B }) + rcol(t, 31.8, 35.2, 290, 'in 0,5: *F*(0,5) = 0,25');

      /* capitolo 3: la pendenza di F è l'altezza di f */
      const sl = vis(t, 36.4, 41, 0.5, 0.5);
      if (sl > 0.004) {
        const cc = cB(t), s = 2 * cc, Fc = cc * cc, d = 0.22;
        o += ln(RL.X(cc - d), RL.Y(Fc - d * s), RL.X(cc + d), RL.Y(Fc + d * s), { stroke: C.C, sw: 4.6, lc: 'round', op: sl }) + ln(RU.X(cc), RU.Y(0), RU.X(cc), RU.Y(s), { stroke: C.C, sw: 5, lc: 'round', op: sl });
        o += rcol(t, 36.8, 41, 126, 'altezza di *f*: ' + FMT(s, 1), { size: 24, fill: C.C }) + rcol(t, 37.4, 41, 162, 'pendenza di *F*: ' + FMT(s, 1), { size: 24, fill: C.C }) + rcol(t, 38.2, 41, 214, '*F*′(*x*) = *f*(*x*)', { size: 30 });
      }

      /* capitolo 3 (seconda parte): gli spigoli dell'uniforme */
      const sp = vis(t, 43.2, 48.2, 0.6, 0.6);
      if (sp > 0.004) {
        const k1 = p(t, 43.4, 44.2), k2 = p(t, 45.6, 46.4), d = 0.22;
        o += g({ op: k1 * sp }, ln(RL.X(-d), RL.Y(0), RL.X(0), RL.Y(0), { stroke: C.C, sw: 4.6, lc: 'round' }) + ln(RL.X(0), RL.Y(0), RL.X(d), RL.Y(d), { stroke: C.C, sw: 4.6, lc: 'round' }) + circ(RL.X(0), RL.Y(0), 6, { fill: C.paper, stroke: C.C, sw: 2.6 }));
        o += g({ op: k2 * sp }, ln(RL.X(1 - d), RL.Y(1 - d), RL.X(1), RL.Y(1), { stroke: C.C, sw: 4.6, lc: 'round' }) + ln(RL.X(1), RL.Y(1), RL.X(1 + d), RL.Y(1), { stroke: C.C, sw: 4.6, lc: 'round' }) + circ(RL.X(1), RL.Y(1), 6, { fill: C.paper, stroke: C.C, sw: 2.6 }));
        const j1 = k1 * sp, j2 = k2 * sp;
        o += ln(RU.X(0), RU.Y(0), RU.X(0), RU.Y(1), { stroke: C.C, sw: 4.6, lc: 'round', op: j1 }) + ln(RU.X(1), RU.Y(0), RU.X(1), RU.Y(1), { stroke: C.C, sw: 4.6, lc: 'round', op: j2 });
      }
      o += rcol(t, 43.4, 48.2, 124, 'in *x* = 0 e in *x* = 1', { size: 22 }) + rcol(t, 44, 48.2, 160, '*f* salta,', { size: 24, fill: C.C }) + rcol(t, 44.8, 48.2, 194, '*F* ha uno spigolo', { size: 24, fill: C.C }) + rcol(t, 46.4, 48.2, 248, 'pendenza in *x* = 0:', { size: 22 }) + rcol(t, 46.8, 48.2, 278, '0 a sinistra, 1 a destra', { size: 22 });

      /* capitolo 4: P(0,2 < X < 0,5) e gli estremi */
      const iv2 = vis(t, 49, 57.7, 0.6, 0.01);
      if (iv2 > 0.004) {
        o += rect(RU.X(0.2), RU.Y(1), RU.X(0.5) - RU.X(0.2), 44, { fill: C.hi, fo: 0.45 * iv2, stroke: C.hi, sw: 2, so: iv2 });
        o += tx(RU.X(0.2), RU.Y(0) + 20, '0,2', { size: 20, op: iv2 }) + tx(RU.X(0.5), RU.Y(0) + 20, '0,5', { size: 20, op: iv2 });
        o += tx(RU.X(0.35), RU.Y(0.5) + 7, '0,3', { size: 22, op: iv2 * p(t, 50.4, 51.2) });
        const l5 = p(t, 49.6, 50.4) * iv2, l2 = p(t, 50, 50.8) * iv2;
        o += g({ op: l5 }, ln(RL.X(RXL), RL.Y(0.5), RL.X(0.5), RL.Y(0.5), { stroke: C.hi, sw: 1.8, da: '5 4' }) + circ(RL.X(0.5), RL.Y(0.5), 5.5, { fill: C.hi, stroke: C.ink, sw: 1.2 })) + lb(RL.X(RXL) - 6, RL.Y(0.5) + 6, '0,5', { ta: 'end', op: l5 });
        o += g({ op: l2 }, ln(RL.X(RXL), RL.Y(0.2), RL.X(0.2), RL.Y(0.2), { stroke: C.hi, sw: 1.8, da: '5 4' }) + circ(RL.X(0.2), RL.Y(0.2), 5.5, { fill: C.hi, stroke: C.ink, sw: 1.2 })) + lb(RL.X(RXL) - 6, RL.Y(0.2) + 6, '0,2', { ta: 'end', op: l2 });
        const br = p(t, 50.8, 51.6) * iv2;
        o += on(br, vbrace(RL.X(0.5) + 16, RL.Y(0.5), RL.Y(0.2), C.hi, br) + tx(RL.X(0.5) + 32, RL.Y(0.35) + 7, '0,3', { size: 22, ta: 'start', op: br }));
        const pz = p(t, 53.2, 54) * iv2;
        o += on(pz, ln(RU.X(0.5), RU.Y(1), RU.X(0.5), RU.Y(0), { stroke: C.B, sw: 4.4, lc: 'round', op: pz }) + tx(RU.X(0.5) + 12, RU.Y(1) - 10, 'una riga: area 0', { size: 20, fill: C.B, ta: 'start', op: pz }));
      }
      o += rcol(t, 49.6, 57.7, 124, '*F*(0,5) − *F*(0,2)', { size: 24 }) + rcol(t, 51, 57.7, 160, '= 0,5 − 0,2 = 0,3', { size: 24, fill: C.B }) + rcol(t, 53.2, 57.7, 224, '*P*(*X* = *x*) = 0', { size: 28 }) + rcol(t, 54.8, 57.7, 262, '< o ≤: nessuna differenza', { size: 20 });
      return o;
    },
  });

  /* ======================================================================
     3.3 · La densità non è una probabilità: altezza oltre 1, costante c, area k
     ====================================================================== */
  const NP = plane(70, 290, 280, 56), N2 = plane(70, 290, 140, 56), NF = plane(400, 290, 200, 120); // f su [0,1]; g su [0,2]; F del capitolo 2
  const KEY = [[0, 1, 1], [8, 1, 1], [10.8, 0.5, 2], [20.4, 0.5, 2], [21.8, 1 / 3, 3], [23.2, 1 / 3, 3], [24.2, 0.5, 2.4]]; // [istante, base, altezza] del rettangolo
  const keyAt = (t, k) => KEY.reduce((a, r, i) => (i ? lerp(a, r[k], p(t, KEY[i - 1][0], r[0], E.io)) : a), KEY[0][k]);
  const nv = (v) => (Math.abs(v - Math.round(v)) < 0.02 ? String(Math.round(v)) : FMT(v, 1));

  PV.add('normalizza', {
    sec: '3.7',
    short: 'La densità non è una probabilità',
    title: 'La densità non è una probabilità: può superare 1, e si normalizza dividendo per l’area',
    alt: 'Animazione: un rettangolo di area 1 che si restringe da base 1 a base 1/2 e 1/3 sale a altezza 2 e 3, mostrando che la densità può superare 1 mentre l’area totale deve restare 1; poi si trova la costante c in f(x) = c x(1 − x) (area 1/6, c = 6, f(1/2) = 1,5, F(x) = 3x² − 2x³); infine una funzione di area k si divide per k per ottenere una densità.',
    dur: 57.5,
    poster: 39.6,
    chap: [[0, 'La densità può superare 1'], [25.5, 'La costante c'], [46, 'Dividere per l’area k']],
    caps: [
      [0, 'F(x) è una probabilità, fra 0 e 1; la densità f(x) no. Parto dall’uniforme su [0, 1]: base 1, altezza 1, area 1.'],
      [7.5, 'Restringo il campo a [0, 1/2]: l’area deve restare 1, quindi l’altezza sale a 2: 1/2 per 2 fa 1.'],
      [14, 'Una densità può superare 1: è una probabilità per unità di lunghezza. Un tratto lungo 0,1 vale 0,2.'],
      [20, 'Una densità che vale 3 va bene; un’area totale diversa da 1 no. L’unico vincolo è l’area.'],
      [25.5, 'Densità nota a meno di una costante: f(x) = c x(1 − x). La forma è un arco, ma la sua area non fa 1.'],
      [32.5, 'L’area è 1/2 − 1/3 = 1/6. Moltiplicare per c moltiplica l’area per c: serve c = 6, e l’arco si alza.'],
      [39.5, 'Allora f(1/2) = 6 · 1/4 = 1,5, più di 1: va bene. La ripartizione è F(x) = 3x² − 2x³, con F(1) = 1.'],
      [46, 'In generale, se g ≥ 0 ha area k ≠ 1, la divido per k: g/k ha area 1 ed è una densità.'],
      [51.5, 'Esempio: g(x) = x su [0, 2] ha area 2; dimezzata dà x/2, area 1. La costante è sempre c = 1/k.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 25.2, 'La densità può superare 1', 'conta solo l’area totale, che deve fare 1') + heading(t, 25.9, 45.6, 'Una costante incognita', '*f*(*x*) = *c* · *x*(1 − *x*) per 0 ≤ *x* ≤ 1') + heading(t, 46, 57.7, 'Se l’area è *k*, si divide per *k*', '*g*/*k* ha area 1 ed è una densità');
      const col = (a, b, y, s, o2 = {}) => {
        const op = vis(t, a, b, 0.5, 0.5);
        return on(op, tx(400, y, s, { size: 22, ta: 'start', ...o2, op }));
      };

      /* capitoli 1 e 2: il piano di f su [0, 1] */
      const c12 = vis(t, 0.4, 45.8, 0.8, 0.7);
      if (c12 > 0.004) {
        o += g({ op: c12 }, ln(NP.X(0), NP.Y(0), NP.X(1.06), NP.Y(0), { stroke: C.soft, sw: 1.8 }) + ln(NP.X(0), NP.Y(0), NP.X(0), NP.Y(3.25), { stroke: C.soft, sw: 1.8 }) + ln(NP.X(0), NP.Y(1), NP.X(1.04), NP.Y(1), { stroke: C.soft, sw: 1.4, da: '5 4' }));
        for (const v of [1, 2, 3]) o += lb(NP.X(0) - 8, NP.Y(v) + 6, v, { ta: 'end', op: c12 * (v < 3 || t < 26 ? 1 : 0) });
        o += lb(NP.X(1), NP.Y(0) + 22, '1', { op: c12 }) + lb(NP.X(0), NP.Y(0) + 22, '0', { op: c12 });
      }

      /* capitolo 1: il rettangolo di area 1 */
      const c1 = vis(t, 1.2, 25.7, 0.8, 0.7);
      if (c1 > 0.004) {
        const w = keyAt(t, 1), h = keyAt(t, 2), bad = p(t, 23.4, 24.2);
        const up = clamp((h - 1) * 3, 0, 1);
        o += rect(NP.X(0), NP.Y(h), NP.X(w) - NP.X(0), NP.Y(0) - NP.Y(h), { fill: C.A, fo: 0.22 * c1, stroke: C.A, sw: 2.6, so: (1 - bad) * c1 });
        o += rect(NP.X(0), NP.Y(h), NP.X(w) - NP.X(0), NP.Y(0) - NP.Y(h), { stroke: NO, sw: 3, so: bad * c1 });
        o += on(up, rect(NP.X(0), NP.Y(h), NP.X(w) - NP.X(0), NP.Y(1) - NP.Y(h), { fill: C.hi, fo: 0.3 * up * c1 }));
        o += tx((NP.X(0) + NP.X(w)) / 2, NP.Y(h) - 12, '*f* = ' + nv(h), { size: 22, op: c1 * p(t, 2.6, 3.4) });
        const al = bad > 0.5 ? 'area 1,2' : 'area 1';
        o += tx((NP.X(0) + NP.X(w)) / 2, NP.Y(h * 0.72) + 8, al, { size: 22, fill: bad > 0.5 ? NO : C.ink, op: c1 * p(t, 3.2, 4) });
        o += lb(NP.X(0.5), NP.Y(0) + 22, '1/2', { op: c1 * p(t, 10.2, 11) }) + lb(NP.X(1 / 3), NP.Y(0) + 22, '1/3', { op: c1 * p(t, 21.4, 22.2) * (1 - bad) });
        const st = vis(t, 14.6, 20.2, 0.5, 0.5) * c1;
        o += on(st, rect(NP.X(0.2), NP.Y(2), NP.X(0.3) - NP.X(0.2), NP.Y(0) - NP.Y(2), { fill: C.hi, fo: 0.6 * st, stroke: C.hi, sw: 1.6, so: st }));
        const ok = vis(t, 22.2, 23.6, 0.4, 0.4) * c1, no = vis(t, 24.2, 25.4, 0.4, 0.4) * c1;
        o += on(ok, check(NP.X(1 / 3) + 26, NP.Y(1.5), 28, p(t, 22.4, 23, E.lin), { op: ok })) + on(no, cross(NP.X(0.5) + 26, NP.Y(1.2), 28, p(t, 24.4, 25, E.lin), { op: no }));
        /* la colonna di destra: base × altezza = area */
        o += col(2, 25.2, 122, 'base × altezza = area', { size: 20, fill: C.soft, ff: SANS });
        o += col(3.2, 8.2, 172, '1 × 1 = 1', { size: 34 }) + col(11, 21, 172, '1/2 × 2 = 1', { size: 34 }) + col(21.8, 23.8, 172, '1/3 × 3 = 1', { size: 34 }) + col(24.2, 25.2, 172, '1/2 × 2,4 = 1,2', { size: 28, fill: NO });
        o += col(15, 20.4, 226, 'un tratto lungo 0,1:', { size: 22 }) + col(15.6, 20.4, 262, '2 × 0,1 = 0,2', { size: 28, fill: C.B });
        const p1 = vis(t, 11.4, 14.2, 0.5, 0.5), p2 = vis(t, 16, 20.2, 0.5, 0.5), p3 = vis(t, 22.4, 23.8, 0.4, 0.4), p4 = vis(t, 24.4, 25.4, 0.4, 0.4);
        o += on(p1, pills(338, [{ s: 'qui la densità vale 2: più di 1', op: p1 }]));
        o += on(p2, pills(338, [{ s: '*f* = probabilità per unità di lunghezza', op: p2 }]));
        o += on(p3, pills(338, [{ s: 'altezza 3, area 1: va bene', icon: 'ok', col: OK, op: p3, u: p(t, 22.6, 23.2, E.lin) }]));
        o += on(p4, pills(338, [{ s: 'area 1,2 ≠ 1: errore', icon: 'no', col: NO, op: p4, u: p(t, 24.6, 25.2, E.lin) }]));
      }

      /* capitolo 2: f(x) = c x(1 − x) */
      const c2 = vis(t, 25.9, 45.7, 0.8, 0.7);
      if (c2 > 0.004) {
        const c = lerp(1, 6, p(t, 36.8, 39.8, E.io)), gx = (x) => c * x * (1 - x);
        o += path(under(gx, 0, 1, NP, 60), { fill: C.A, fo: 0.26 * c2 * p(t, 26.8, 27.8) });
        o += path(curve(gx, 0, 1, NP, 60), { stroke: C.A, sw: 2.8, lc: 'round', lj: 'round', op: c2, ...draw(p(t, 26.2, 28, E.io)) });
        o += col(26.8, 40.2, 122, '*f*(*x*) = *c* · *x*(1 − *x*)', { size: 24 });
        o += col(33.4, 40.2, 168, '∫_0^1 (*x* − *x*²) d*x*', { size: 22 }) + col(34.6, 40.2, 204, '= 1/2 − 1/3 = 1/6', { size: 24 });
        o += col(36.4, 40.2, 252, '*c* · 1/6 = 1', { size: 26 }) + col(37.6, 40.2, 292, '*c* = 6', { size: 34, fill: C.B });
        o += col(36.6, 40.2, 334, 'area = ' + FMT(c / 6, 2), { size: 22, fill: C.A });
        const pk = p(t, 39.8, 40.6) * c2;
        o += on(pk, circ(NP.X(0.5), NP.Y(1.5), 5.5, { fill: C.hi, stroke: C.ink, sw: 1.2, op: pk }) + tx(NP.X(0.5), NP.Y(1.5) - 14, '*f*(1/2) = 1,5', { size: 22, op: pk }));
        /* la ripartizione */
        const fo = vis(t, 40.6, 45.7, 0.6, 0.7) * c2;
        if (fo > 0.004) {
          o += g({ op: fo }, ln(NF.X(-0.1), NF.Y(0), NF.X(1.1), NF.Y(0), { stroke: C.soft, sw: 1.8 }) + ln(NF.X(0), NF.Y(0), NF.X(0), NF.Y(1.1), { stroke: C.soft, sw: 1.8 }) + ln(NF.X(0), NF.Y(1), NF.X(1.1), NF.Y(1), { stroke: C.line, sw: 1.4, da: '5 4' }));
          o += lb(NF.X(0) - 8, NF.Y(1) + 6, '1', { ta: 'end', op: fo }) + lb(NF.X(0) - 8, NF.Y(0) + 6, '0', { ta: 'end', op: fo }) + lb(NF.X(0), NF.Y(0) + 22, '0', { op: fo }) + lb(NF.X(1), NF.Y(0) + 22, '1', { op: fo });
          o += path(curve((x) => 3 * x * x - 2 * x ** 3, 0, 1, NF, 60), { stroke: C.B, sw: 3.4, lc: 'round', op: fo, ...draw(p(t, 41, 43.4, E.io)) });
          o += tx(NF.X(0.5), 146, '*F*(*x*) = 3*x*² − 2*x*³', { size: 24, fill: C.B, op: fo * p(t, 41.2, 42) });
          const pl = p(t, 43.6, 44.4) * fo;
          o += on(pl, pills(338, [{ s: '*F*(1) = 3 − 2 = 1', icon: 'ok', col: OK, op: pl, u: p(t, 43.9, 44.6, E.lin) }]));
        }
      }

      /* capitolo 3: g(x) = x su [0, 2], area k = 2, poi g/k */
      const c3 = vis(t, 45.6, 57.7, 0.7, 0.01);
      if (c3 > 0.004) {
        o += g({ op: c3 }, ln(N2.X(0), N2.Y(0), N2.X(2.2), N2.Y(0), { stroke: C.soft, sw: 1.8 }) + ln(N2.X(0), N2.Y(0), N2.X(0), N2.Y(2.5), { stroke: C.soft, sw: 1.8 }));
        for (const v of [1, 2]) o += lb(N2.X(0) - 8, N2.Y(v) + 6, v, { ta: 'end', op: c3 }) + lb(N2.X(v), N2.Y(0) + 22, v, { op: c3 });
        o += lb(N2.X(0), N2.Y(0) + 22, '0', { op: c3 });
        const s = lerp(1, 0.5, p(t, 49.4, 52.4, E.io));
        o += on(p(t, 49.4, 50), path(poly([[0, 0], [2, 2], [2, 0]], N2) + 'Z', { stroke: C.soft, sw: 1.6, da: '5 4', op: c3 * p(t, 49.4, 50.2) }));
        o += path(poly([[0, 0], [2, 2 * s], [2, 0]], N2) + 'Z', { fill: C.A, fo: 0.24 * c3 * p(t, 46.4, 47.4), stroke: C.A, sw: 2.6, lj: 'round', so: c3 * p(t, 46.2, 47) });
        const k2 = p(t, 52.6, 53.4);
        o += tx(N2.X(1.4), N2.Y(0.3 * s + 0.15) + 8, 'area 1', { size: 22, fill: C.A, op: c3 * k2 });
        o += col(46.4, 57.7, 124, '*g*(*x*) = *x* su [0, 2]', { size: 24 });
        o += col(48.4, 57.7, 170, '*k* = 2 · 2 / 2 = 2', { size: 24 });
        o += col(51.2, 57.7, 216, '*g*/*k* = *x*/2', { size: 28, fill: C.B });
        o += col(52.6, 57.7, 260, 'area = 1', { size: 26 });
        const pl = vis(t, 54.4, 57.7, 0.5, 0.01);
        o += on(pl, pills(338, [{ s: 'densità = *g*/*k*: la costante è *c* = 1/*k*', col: C.B, op: pl }]));
      }
      return o;
    },
  });

  /* ======================================================================
     3.3 · Mediana e quantili: si legge sul grafico di F (triangolare, poi tratto piatto)
     ====================================================================== */
  const QU = plane(50, 282, 240, 80), QF = plane(370, 282, 240, 160); // densità a sinistra, ripartizione a destra
  const R2 = Math.SQRT1_2, R9 = Math.sqrt(0.9);
  const KC = [[0, 0.2], [3.2, 0.2], [7.4, R2], [19.4, R2], [22.4, R9], [26.8, R9], [27.8, 0.5], [29.2, 0.5], [30.2, R2], [31.2, R2], [32.4, R9]]; // [istante, x_q]: dove sta il cursore
  const cqAt = (t) => KC.reduce((a, r, i) => (i ? lerp(a, r[1], p(t, KC[i - 1][0], r[0], E.io)) : a), KC[0][1]);

  PV.add('quantili', {
    sec: '3.8',
    short: 'Mediana e quantili',
    title: 'Mediana e quantili: dal livello q sull’asse di F al valore x_q',
    alt: 'Animazione: sulla densità triangolare 2x un cursore scorre fino a lasciare metà dell’area a sinistra (la mediana, m = √0,5 ≈ 0,707); sul grafico di F si legge il livello 1/2, si va a destra fino alla curva e poi giù. Poi il livello q sale a 0,9 (90° percentile, 0,949) e si ripete per 0,25 e 0,5; infine un esempio con F piatta in cui il quantile è il più piccolo x con F(x) ≥ q.',
    dur: 52.5,
    poster: 12.5,
    chap: [[0, 'La mediana'], [19.4, 'I quantili'], [38.8, 'Tratti piatti e salti']],
    caps: [
      [0, 'La mediana *m* divide la probabilità a metà: metà dell’area sta a sinistra di *m*, metà a destra.'],
      [7.5, 'Sulla ripartizione è dove F vale 1/2: dal livello 1/2 vado a destra fino a F, poi scendo sull’asse.'],
      [14.5, 'Per la triangolare F(x) = x², quindi x² = 1/2 e m = √0,5 ≈ 0,707.'],
      [19.4, 'Il quantile di livello q è il valore x_q in cui F vale q. Per q = 0,9 è il 90° percentile: sotto sta il 90% dell’area.'],
      [26.6, 'Più q è alto, più il quantile si sposta a destra: q = 0,25 dà 0,5; q = 0,5 dà 0,707; q = 0,9 dà 0,949.'],
      [33, 'Per la triangolare basta risolvere x² = q: il quantile è x_q = √q.'],
      [38.8, 'Se F ha tratti piatti o salti, il quantile è il più piccolo x con F(x) ≥ q.'],
      [45.2, 'Qui, con q = 1/2, tutti gli x fra 1/4 e 3/4 hanno F = 1/2: il quantile è il più piccolo, 1/4.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 18.8, 'La mediana divide l’area a metà', '*F*(*m*) = 1/2') + heading(t, 19.4, 38.2, 'I quantili', 'il quantile di livello *q* è il valore *x*_q con *F*(*x*_q) = *q*') + heading(t, 38.8, 52.9, 'Se *F* ha tratti piatti o salti', 'il quantile è il più piccolo *x* con *F*(*x*) ≥ *q*');

      /* assi e titoli dei due grafici */
      const ax = p(t, 0.3, 1.2);
      o += g({ op: ax }, ln(QU.X(-0.05), QU.Y(0), QU.X(1.12), QU.Y(0), { stroke: C.soft, sw: 1.8 }) + ln(QF.X(-0.05), QF.Y(0), QF.X(1.12), QF.Y(0), { stroke: C.soft, sw: 1.8 }) + ln(QF.X(0), QF.Y(0), QF.X(0), QF.Y(1.06), { stroke: C.soft, sw: 1.8 }) + ln(QF.X(0), QF.Y(1), QF.X(1.12), QF.Y(1), { stroke: C.line, sw: 1.4, da: '5 4' }));
      for (const [P, v] of [[QU, 0], [QU, 1], [QF, 0], [QF, 1]]) o += lb(P.X(v), 304, v, { op: ax });
      o += lb(QF.X(0) - 8, QF.Y(0) + 6, '0', { ta: 'end', op: ax }) + lb(QF.X(0) - 8, QF.Y(1) + 6, '1', { ta: 'end', op: ax });
      o += tx(QU.X(0), 98, 'densità *f*', { size: 20, fill: C.A, ta: 'start', op: ax }) + tx(QF.X(0), 98, 'ripartizione *F*', { size: 20, fill: C.B, ta: 'start', op: ax });

      /* il caso triangolare (capitoli 1 e 2) */
      const tri = vis(t, 0.3, 38.6, 0.8, 0.7);
      if (tri > 0.004) {
        o += g({ op: tri }, path(poly([[0, 0], [1, 2], [1, 0]], QU) + 'Z', { fill: C.A, fo: 0.14 * p(t, 1.6, 2.4) }) + path(poly([[0, 0], [1, 2], [1, 0]], QU), { stroke: C.A, sw: 2.6, lj: 'round', ...draw(p(t, 0.8, 2.2)) }) + path(curve((x) => x * x, 0, 1, QF, 60), { stroke: C.B, sw: 3.4, lc: 'round', ...draw(p(t, 1.4, 3, E.io)) }));
        const c = cqAt(t), q = c * c, cv = vis(t, 3.2, 38.4, 0.6, 0.6) * tri;
        if (cv > 0.004) {
          const rt = p(t, 7.2, 8) * cv;
          o += path(poly([[0, 0], [c, 2 * c], [c, 0]], QU) + 'Z', { fill: C.A, fo: 0.4 * cv });
          o += on(rt, path(poly([[c, 0], [c, 2 * c], [1, 2], [1, 0]], QU) + 'Z', { fill: C.B, fo: 0.28 * rt }));
          o += ln(QU.X(c), QU.Y(0), QU.X(c), QU.Y(2 * c), { stroke: C.hi, sw: 2.6, op: cv }) + circ(QU.X(c), QU.Y(0), 4.8, { fill: C.hi, stroke: C.ink, sw: 1.2, op: cv });
          o += g({ op: cv }, ln(QF.X(0), QF.Y(q), QF.X(c), QF.Y(q), { stroke: C.hi, sw: 1.8, da: '5 4' }) + ln(QF.X(c), QF.Y(q), QF.X(c), QF.Y(0), { stroke: C.hi, sw: 1.8, da: '5 4' }) + circ(QF.X(0), QF.Y(q), 5, { fill: C.hi, stroke: C.ink, sw: 1.2 }) + circ(QF.X(c), QF.Y(0), 4.8, { fill: C.hi, stroke: C.ink, sw: 1.2 }) + circ(QF.X(c), QF.Y(q), 6.5, { fill: C.hi, stroke: C.ink, sw: 1.4 }));
          /* capitolo 1: area a sinistra, metà e metà, la lettura sul grafico */
          const sw = vis(t, 3.4, 7.6, 0.4, 0.4) * cv;
          o += on(sw, tx(56, 144, 'a sinistra: ' + FMT(q, 2), { size: 22, fill: C.A, ta: 'start', op: sw }));
          const hv = vis(t, 7.6, 19, 0.6, 0.6) * cv;
          o += on(hv, tx(QU.X((2 * c) / 3), QU.Y((2 * c) / 3) + 8, '1/2', { size: 24, op: hv }) + tx(QU.X(1) + 10, QU.Y(1.8) + 7, '1/2', { size: 24, fill: C.B, ta: 'start', op: hv }));
          const rd = vis(t, 8.4, 14.4, 0.5, 0.6) * cv;
          if (rd > 0.004) {
            o += arrow(QF.X(0) + 6, QF.Y(0.5), QF.X(R2), QF.Y(0.5), p(t, 8.6, 10.6, E.io), C.C, rd) + arrow(QF.X(R2), QF.Y(0.5) + 2, QF.X(R2), QF.Y(0) - 3, p(t, 10.6, 12.2, E.io), C.C, rd);
            o += lb(QF.X(0) - 8, QF.Y(0.5) + 6, '1/2', { ta: 'end', op: rd }) + tx(QF.X(R2) + 14, QF.Y(0) + 25, '*m*', { size: 22, fill: C.C, op: rd * p(t, 12, 12.8) });
          }
          const pm = vis(t, 14.8, 19, 0.5, 0.5);
          o += on(pm, pills(338, [{ s: '*x*² = 1/2  →  *m* = √0,5 ≈ 0,707', op: pm }]));
          /* capitolo 2: il livello q */
          const lv = vis(t, 19.8, 38.2, 0.5, 0.6) * cv;
          o += on(lv, tx(QU.X((2 * c) / 3), QU.Y((2 * c) / 3) + 8, FMT(q * 100, 0) + '%', { size: 24, op: lv }) + tx(QU.X(1) + 10, QU.Y(1.8) + 7, FMT((1 - q) * 100, 0) + '%', { size: 24, fill: C.B, ta: 'start', op: lv }));
          const rq = vis(t, 19.8, 33.2, 0.5, 0.5) * cv, fm = vis(t, 33.4, 38.2, 0.5, 0.5) * cv;
          o += on(rq, pills(338, [{ s: '*q* = ' + FMT(q, 2) + '  →  *x*_q = ' + FMT(c, 3), op: rq }]));
          o += on(fm, pills(338, [{ s: '*x*² = *q*  →  *x*_q = √*q*, per esempio √0,9 ≈ 0,949', col: C.C, op: fm }]));
        }
      }

      /* capitolo 3: F con un tratto piatto (densità nulla in mezzo) */
      const fl = vis(t, 38.4, 52.9, 0.9, 0.01);
      if (fl > 0.004) {
        const rects = (a, b) => path(poly([[a, 0], [a, 2], [b, 2], [b, 0]], QU) + 'Z', { fill: C.A, fo: 0.14 * fl });
        o += g({ op: fl }, rects(0, 0.25) + rects(0.75, 1) + path(poly([[0, 0], [0, 2], [0.25, 2], [0.25, 0]], QU) + poly([[0.75, 0], [0.75, 2], [1, 2], [1, 0]], QU), { stroke: C.A, sw: 2.6, lj: 'round', ...draw(p(t, 38.8, 40.4)) }));
        o += path(poly([[0, 0], [0.25, 0.5], [0.75, 0.5], [1, 1]], QF), { stroke: C.B, sw: 3.4, lc: 'round', lj: 'round', op: fl, ...draw(p(t, 39, 40.8, E.io)) });
        for (const v of [0.25, 0.75]) o += lb(QU.X(v), 304, v === 0.25 ? '1/4' : '3/4', { op: fl }) + lb(QF.X(v), 304, v === 0.25 ? '1/4' : '3/4', { op: fl });
        o += lb(QF.X(0) - 8, QF.Y(0.5) + 6, '1/2', { ta: 'end', op: fl });
        const l5 = p(t, 41.4, 42.2) * fl, pl = p(t, 42.4, 43.4) * fl, mn = p(t, 45.6, 46.4) * fl;
        o += on(l5, ln(QF.X(0), QF.Y(0.5), QF.X(0.25), QF.Y(0.5), { stroke: C.hi, sw: 1.8, da: '5 4', op: l5 }) + circ(QF.X(0), QF.Y(0.5), 5, { fill: C.hi, stroke: C.ink, sw: 1.2, op: l5 }));
        o += on(pl, ln(QF.X(0.25), QF.Y(0.5), QF.X(0.75), QF.Y(0.5), { stroke: C.hi, sw: 5.5, lc: 'round', op: pl }) + ln(QU.X(0.25), QU.Y(0), QU.X(0.75), QU.Y(0), { stroke: C.hi, sw: 5.5, lc: 'round', op: pl }));
        o += on(mn, rect(QU.X(0), QU.Y(2), QU.X(0.25) - QU.X(0), QU.Y(0) - QU.Y(2), { fill: C.A, fo: 0.4 * mn }) + ln(QF.X(0.25), QF.Y(0.5), QF.X(0.25), QF.Y(0) - 3, { stroke: C.C, sw: 2.4, op: mn }) + circ(QF.X(0.25), QF.Y(0.5), 6.5, { fill: C.hi, stroke: C.ink, sw: 1.4, op: mn }) + circ(QF.X(0.25), QF.Y(0), 5, { fill: C.hi, stroke: C.ink, sw: 1.2, op: mn }) + tx(QU.X(0.125), QU.Y(1) + 8, '1/2', { size: 24, op: mn }));
        const p1 = vis(t, 42.6, 45.6, 0.5, 0.5), p2 = vis(t, 46, 52.9, 0.6, 0.01);
        o += on(p1, pills(338, [{ s: '*F* vale 1/2 su tutto il tratto [1/4, 3/4]', op: p1 }]));
        o += on(p2, pills(338, [{ s: 'il più piccolo *x* con *F*(*x*) ≥ 1/2 è 1/4', col: C.C, op: p2 }]));
      }
      return o;
    },
  });

  /* ======================================================================
     3.4 · Valore atteso e varianza nel continuo: da Σ a ∫, il baricentro, la varianza
     ====================================================================== */
  const BP = plane(130, 258, 360, 56); // la densità 2x su [0, 1] con la sbarra del baricentro
  const VP = plane(150, 200, 340, 42); // il piano ridotto del capitolo sulla varianza
  const wobble = (tau, a = 5) => (tau > 0 ? a * Math.exp(-2.6 * tau) * Math.sin(9 * tau) : 0); // oscillazione che si smorza
  const SIG_T = Math.sqrt(1 / 18), SIG_U = Math.sqrt(1 / 12); // deviazioni standard di triangolare e uniforme

  /* le n strisce della densità 2x: ciascuna ha posto x (a metà) e area f(x) dx */
  function stripSet(n, op, grow) {
    if (!(op > 0.004)) return '';
    let r = '';
    const dx = 1 / n;
    for (let i = 0; i < n; i++) {
      const h = 2 * (i + 0.5) * dx * (grow ? grow(i) : 1);
      if (h > 0.001) r += rect(BP.X(i * dx), BP.Y(h), BP.X(dx) - BP.X(0), BP.Y(0) - BP.Y(h), { fill: C.A, fo: 0.3, stroke: C.A, sw: n > 10 ? 1 : 1.5, op });
    }
    return r;
  }
  /* sbarra con l'area appoggiata: pivot = pixel del fulcro, th = inclinazione in gradi */
  function plank(pivot, th, op) {
    const yb = 262, M = { X: (x) => BP.X(x) - pivot, Y: (f) => -12 - 56 * f };
    let inner = rect(M.X(-0.12), -12, BP.X(1.12) - BP.X(-0.12), 12, { rx: 4, fill: C.soft, fo: 0.35, stroke: C.soft, sw: 1.8 });
    inner += path(poly([[0, 0], [1, 2], [1, 0]], M) + 'Z', { fill: C.A, fo: 0.3, stroke: C.A, sw: 2.4, lj: 'round' });
    inner += circ(M.X(2 / 3), M.Y(2 / 3), 5.5, { fill: C.B, stroke: C.ink, sw: 1.2 });
    inner += tx(M.X(0), 34, '0', { ff: SANS, size: 17, fill: C.soft }) + tx(M.X(1), 34, '1', { ff: SANS, size: 17, fill: C.soft });
    return g({ op }, g({ tf: T(pivot, yb, 1, th) }, inner) + fulcrum(pivot, yb, 1));
  }

  PV.add('baricentro', {
    sec: '3.9',
    short: 'Valore atteso e varianza',
    title: 'Valore atteso e varianza nel continuo: da Σ a ∫, il baricentro, la varianza',
    alt: 'Animazione: l’area sotto la densità 2x viene tagliata in strisce di area f(x) dx e la somma Σ x·p di strisce sempre più sottili (0,660, 0,665, 0,666) diventa l’integrale; poi l’area appoggiata su una sbarra si equilibra con il fulcro in 2/3, diverso dalla mediana 0,707; infine E[X²] = 1/2 e Var = 1/18 per la triangolare, 1/12 per l’uniforme.',
    dur: 58.5,
    poster: 30,
    chap: [[0, 'Da Σ a ∫'], [19, 'Il baricentro'], [38.5, 'La varianza']],
    caps: [
      [0, 'Nel discreto E[X] = Σ x p(x). Nel continuo taglio l’area in strisce: ognuna ha posto x e probabilità f(x) dx, la sua area.'],
      [8, 'Con 5 strisce la somma dà 0,660; con 10, 0,665; con 20, 0,666: le strisce si assottigliano.'],
      [13.4, 'Al limite la somma diventa un integrale: E[X] = ∫ x f(x) dx. Il resto è identico al discreto.'],
      [19, 'Il valore atteso è ancora il baricentro: l’area appoggiata su un fulcro sta in equilibrio solo nel punto giusto.'],
      [26, 'Sposto il fulcro verso destra: la sbarra si raddrizza quando arriva in 2/3 ≈ 0,667.'],
      [31.5, 'Lo stesso numero con l’integrale: E[X] = ∫ x · 2x dx = 2 · 1/3 = 2/3. La mediana, 0,707, è un’altra cosa.'],
      [38.5, 'Con la stessa regola E[X²] = ∫ x² · 2x dx = 2 · 1/4 = 1/2, e Var(X) = E[X²] − (E[X])² = 1/2 − 4/9 = 1/18 ≈ 0,0556.'],
      [46.5, 'La deviazione standard è σ = √(1/18) ≈ 0,236: la fascia attorno a 2/3 dove si concentra la legge.'],
      [52.5, 'Sull’uniforme su [0, 1]: E[X] = 1/2, E[X²] = 1/3, Var = 1/3 − 1/4 = 1/12 ≈ 0,0833, σ ≈ 0,289.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 18.6, 'Da Σ a ∫', 'sostituisci Σ con ∫ e *p*(*x*) con *f*(*x*) d*x*') + heading(t, 19.4, 38, 'Il valore atteso è il baricentro', 'l’area appoggiata su un fulcro: equilibrio in *E*[*X*]') + heading(t, 38.9, 58.9, 'La varianza', 'Var(*X*) = *E*[*X*²] − (*E*[*X*])²');

      /* capitolo 1: le strisce */
      const c1 = vis(t, 0.4, 19.3, 0.8, 0.9);
      if (c1 > 0.004) {
        o += g({ op: c1 }, ln(BP.X(-0.08), BP.Y(0), BP.X(1.1), BP.Y(0), { stroke: C.soft, sw: 1.8 }));
        o += lb(BP.X(0), 280, '0', { op: c1 }) + lb(BP.X(1), 280, '1', { op: c1 });
        o += path(poly([[0, 0], [1, 2], [1, 0]], BP), { stroke: C.A, sw: 2.8, lj: 'round', op: c1, ...draw(p(t, 1, 2.6, E.io)) });
        const s5 = 1 - p(t, 8.8, 9.6), s10 = p(t, 9, 9.8) * (1 - p(t, 12, 12.8)), s20 = p(t, 12.2, 13) * (1 - p(t, 15.8, 16.8));
        o += stripSet(5, s5 * c1, (i) => p(t, 3.4 + 0.35 * i, 4.2 + 0.35 * i)) + stripSet(10, s10 * c1) + stripSet(20, s20 * c1);
        /* di ogni striscia: posto x sotto, probabilità sopra */
        const lab = p(t, 5.6, 6.4) * s5 * c1;
        if (lab > 0.004) {
          for (let i = 0; i < 5; i++) {
            const xm = 0.1 + 0.2 * i;
            o += lb(BP.X(xm), 280, FMT(xm, 1), { op: lab }) + tx(BP.X(xm), 304, FMT(xm * 2 * 0.2, 2), { ff: SANS, size: 17, fill: C.A, op: lab });
          }
          o += tx(BP.X(-0.08) - 4, 285, '*x*', { size: 20, ta: 'end', op: lab }) + tx(BP.X(-0.08) - 4, 309, '*p*', { size: 20, fill: C.A, ta: 'end', op: lab });
        }
        const w1 = p(t, 4.2, 5) * (1 - p(t, 15.8, 16.8)) * c1;
        o += on(w1, lb(506, 178, 'larghezza', { ta: 'start', op: w1 }) + tx(506, 206, 'd*x* = ' + (t < 9.4 ? '0,2' : t < 12.4 ? '0,1' : '0,05'), { size: 24, fill: C.B, ta: 'start', op: w1 }));
        /* la formula in alto: Σ diventa ∫ */
        const fs = vis(t, 1.6, 13.4, 0.6, 0.6) * c1, fi = vis(t, 13.4, 18.8, 0.7, 0.8) * c1;
        o += on(fs, txc(320, 106, [['*E*[*X*] = ', C.ink], ['Σ', C.B], [' *x* · ', C.ink], ['*p*(*x*)', C.B]], { size: 28, op: fs }));
        o += on(fi, txc(320, 106, [['*E*[*X*] = ', C.ink], ['∫', C.B], [' *x* · ', C.ink], ['*f*(*x*) d*x*', C.B]], { size: 28, op: fi }));
        /* le somme con strisce sempre più sottili */
        const r5 = vis(t, 6.6, 9.4, 0.5, 0.4) * c1, r10 = vis(t, 9.6, 12.4, 0.5, 0.4) * c1, r20 = vis(t, 12.6, 16, 0.5, 0.4) * c1;
        o += on(r5, pills(338, [{ s: 'con 5 strisce: Σ *x* · *p* = 0,660', op: r5 }])) + on(r10, pills(338, [{ s: 'con 10 strisce: Σ *x* · *p* = 0,665', op: r10 }])) + on(r20, pills(338, [{ s: 'con 20 strisce: Σ *x* · *p* = 0,666', op: r20 }]));
        const rl = vis(t, 16.2, 18.8, 0.5, 0.6) * c1;
        o += on(rl, pills(338, [{ s: 'strisce sottilissime: la somma è l’integrale', col: C.B, op: rl }]));
      }

      /* capitolo 2: la sbarra e il fulcro */
      const c2 = vis(t, 18.8, 38.6, 0.8, 0.9);
      if (c2 > 0.004) {
        const xp = lerp(0.5, 2 / 3, p(t, 26.2, 29.4, E.io)), pivot = BP.X(xp);
        const th = 0.075 * (BP.X(2 / 3) - pivot) + wobble(t - 29.4);
        o += plank(pivot, th, c2 * p(t, 19.2, 20.2));
        const lv = p(t, 30.4, 31.2) * Math.max(0, 1 - Math.abs(th) / 2) * c2;
        o += on(lv, ln(BP.X(2 / 3), 212.7, BP.X(2 / 3), 262, { stroke: C.B, sw: 1.6, da: '4 4', op: lv }));
        const eb = p(t, 29.8, 30.6) * c2;
        o += on(eb, tx(BP.X(2 / 3), 311, '*E*[*X*] = 2/3', { size: 22, fill: C.B, op: eb }));
        const md = p(t, 33.4, 34.2) * c2;
        o += on(md, ln(BP.X(R2), 162, BP.X(R2), 250, { stroke: C.C, sw: 2, da: '5 4', op: md }) + tx(BP.X(R2), 148, 'mediana 0,707', { size: 20, fill: C.C, op: md }));
        const pa = vis(t, 19.9, 25.8, 0.5, 0.5) * c2, pb = vis(t, 29.8, 31.4, 0.5, 0.4) * c2, pc = vis(t, 31.8, 38.2, 0.6, 0.6) * c2;
        o += on(pa, pills(338, [{ s: 'fulcro a metà: la sbarra pende a destra', op: pa }]));
        o += on(pb, pills(338, [{ s: 'equilibrio in 2/3 ≈ 0,667', col: C.B, op: pb }]));
        o += on(pc, pills(338, [{ s: '*E*[*X*] = ∫_0^1 *x* · 2*x* d*x* = 2 · 1/3 = 2/3', col: C.B, op: pc }]));
      }

      /* capitolo 3: E[X²], varianza e scarto */
      const c3 = vis(t, 38.3, 58.9, 0.8, 0.01);
      if (c3 > 0.004) {
        const tr = (1 - p(t, 51.9, 52.9)) * c3, un = p(t, 52.5, 53.5) * c3;
        o += g({ op: c3 }, ln(VP.X(-0.08), VP.Y(0), VP.X(1.1), VP.Y(0), { stroke: C.soft, sw: 1.8 }));
        o += lb(VP.X(0), 222, '0', { op: c3 }) + lb(VP.X(1), 222, '1', { op: c3 });
        /* triangolare */
        if (tr > 0.004) {
          const bd = p(t, 46.8, 47.4) * tr, w1 = SIG_T * p(t, 46.8, 48.4, E.out); // la fascia si apre dalla media verso i lati
          o += on(bd, rect(VP.X(2 / 3 - w1), VP.Y(2.25), 2 * w1 * 340, VP.Y(0) - VP.Y(2.25), { fill: C.hi, fo: 0.28 * bd }));
          o += path(poly([[0, 0], [1, 2], [1, 0]], VP) + 'Z', { fill: C.A, fo: 0.2 * tr * p(t, 38.9, 39.9), stroke: C.A, sw: 2.6, lj: 'round', so: tr * p(t, 38.7, 39.5) });
          const mn = p(t, 39.6, 40.4) * tr;
          o += on(mn, ln(VP.X(2 / 3), VP.Y(0), VP.X(2 / 3), VP.Y(2.25), { stroke: C.B, sw: 2.4, op: mn }) + tx(VP.X(2 / 3), VP.Y(2.25) - 8, '*μ* = 2/3', { size: 20, fill: C.B, op: mn }));
          o += on(bd, ln(VP.X(2 / 3 - w1), VP.Y(0) + 38, VP.X(2 / 3 + w1), VP.Y(0) + 38, { stroke: C.hi, sw: 3, lc: 'round', op: bd }) + lb(VP.X(2 / 3 + SIG_T) + 14, VP.Y(0) + 44, '2*σ*', { ta: 'start', op: bd * p(t, 48, 48.6) }));
          o += tx(320, 270, '*E*[*X*²] = ∫_0^1 *x*² · 2*x* d*x* = 2 · 1/4 = 1/2', { size: 22, op: tr * p(t, 39.4, 40.2) });
          o += tx(320, 304, 'Var(*X*) = 1/2 − (2/3)² = 1/2 − 4/9 = 1/18 ≈ 0,0556', { size: 22, op: tr * p(t, 43.2, 44) });
          o += txc(320, 338, [['*σ* = √(1/18) ≈ ', C.ink], ['0,236', C.B]], { size: 24, op: tr * p(t, 47.2, 48) });
        }
        /* uniforme */
        if (un > 0.004) {
          const bd = p(t, 54.3, 54.9) * un, w2 = SIG_U * p(t, 54.3, 55.9, E.out);
          o += on(bd, rect(VP.X(0.5 - w2), VP.Y(1.4), 2 * w2 * 340, VP.Y(0) - VP.Y(1.4), { fill: C.hi, fo: 0.28 * bd }));
          o += path(poly([[0, 0], [0, 1], [1, 1], [1, 0]], VP) + 'Z', { fill: C.A, fo: 0.2 * un, stroke: C.A, sw: 2.6, lj: 'round', so: un });
          o += ln(VP.X(0.5), VP.Y(0), VP.X(0.5), VP.Y(1.4), { stroke: C.B, sw: 2.4, op: un }) + tx(VP.X(0.5), VP.Y(1.4) - 8, '*μ* = 1/2', { size: 20, fill: C.B, op: un });
          o += tx(320, 270, '*E*[*X*] = 1/2,   *E*[*X*²] = ∫_0^1 *x*² d*x* = 1/3', { size: 22, op: un * p(t, 53.1, 53.9) });
          o += tx(320, 304, 'Var = 1/3 − 1/4 = 1/12 ≈ 0,0833', { size: 22, op: un * p(t, 55.3, 56.1) });
          o += txc(320, 338, [['*σ* ≈ ', C.ink], ['0,289', C.B]], { size: 24, op: un * p(t, 56.9, 57.7) });
        }
      }
      return o;
    },
  });

  /* ======================================================================
     3.4 · Una legge senza valore atteso: Cauchy
     ====================================================================== */
  const CP = plane(320, 250, 44, 300); // la densità di Cauchy su [−6, 6]
  const CS = plane(80, 288, 80, 42); // ∫₀^M x f(x) dx in funzione di log₁₀ M
  const cau = (x) => 1 / (Math.PI * (1 + x * x));
  const cauI = (v) => Math.log(1 + 10 ** (2 * v)) / (2 * Math.PI); // ∫₀^M x f(x) dx con M = 10^v
  const caW = (c) => (2 / Math.PI) * Math.atan(c); // area fra −c e c
  const cVT = (t) => (t < 24.4 ? 3 * p(t, 19.8, 24.4, E.lin) : 3 + 3 * p(t, 26.8, 30.8, E.lin)); // log₁₀ M durante il capitolo 2
  const cW = (t) => (t < 10.2 ? 6 * p(t, 6.8, 10.2, E.io) : 6 * (1000 / 6) ** p(t, 10.2, 13.2, E.io)); // metà larghezza della finestra nel capitolo 1
  const Z3 = 200, SC3 = 20; // zero e scala (pixel per unità) delle barre del capitolo 3

  PV.add('cauchy', {
    sec: '3.9',
    short: 'Una legge senza valore atteso',
    title: 'Una legge senza valore atteso: la densità di Cauchy',
    alt: 'Animazione: la densità di Cauchy 1/(π(1 + x²)) ha area 1 (una finestra [−c, c] che si allarga racchiude un’area che tende a 1, arctan); ma l’integrale di x·f(x) fra 0 e M vale ln(1 + M²)/(2π) e cresce senza limite, piano piano (2,2 per M = 1 000, 4,4 per M = 10⁶): parte positiva +∞, negativa −∞, ∞ − ∞ non significa niente; simmetrizzare dà 0 ma non è il valore atteso, e un altro taglio dà 0,22.',
    dur: 57.5,
    poster: 32.2,
    chap: [[0, 'Un’area che fa 1'], [18.9, 'Il valore atteso diverge'], [38.9, 'Non barare simmetrizzando']],
    caps: [
      [0, 'La funzione f(x) = 1/(π(1 + x²)) è una densità: una campana con le code molto lunghe.'],
      [6.5, 'Allargo una finestra [−c, c] attorno a 0: l’area che racchiude cresce e tende a 1: 0,50, 0,89, 0,99…'],
      [13.2, 'Infatti una primitiva di 1/(1 + x²) è arctan x, che va da −π/2 a π/2: area = (π/2 + π/2)/π = 1.'],
      [18.9, 'Per la parte positiva integro x f(x) fra 0 e M: vale ln(1 + M²)/(2π). Faccio crescere M.'],
      [25.5, 'Cresce senza limite, ma piano piano: per M = 1 000 vale 2,2; per M = 1 000 000 vale 4,4.'],
      [32, 'Siccome |x| f(x) è pari, l’integrale di |x| f(x) è infinito: la variabile non ha valore atteso.'],
      [38.9, 'La parte positiva vale +∞ e quella negativa −∞, e ∞ − ∞ non significa niente.'],
      [45.5, 'Non barare simmetrizzando: fra −M e M le due parti si cancellano, ma quello non è il valore atteso.'],
      [51.8, 'Tagliando da −M a 2M verrebbe invece 0,22: il risultato dipende da come si taglia.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 18.4, 'Un’area che fa 1', '*f*(*x*) = 1 / (π (1 + *x*²))') + heading(t, 19.1, 38.2, 'Il valore atteso diverge', '∫_0^M *x* *f*(*x*) d*x* = ln(1 + *M*²) / (2π)') + heading(t, 39.1, 57.7, 'Non barare simmetrizzando', 'positiva +∞, negativa −∞: ∞ − ∞ non vale nulla');

      /* capitolo 1: la densità e la finestra che si allarga */
      const c1 = vis(t, 0.4, 19.4, 0.8, 0.9);
      if (c1 > 0.004) {
        const c = cW(t), cv = p(t, 6.6, 7.4) * c1, cc = Math.min(c, 6);
        o += g({ op: c1 }, ln(CP.X(-6.3), CP.Y(0), CP.X(6.3), CP.Y(0), { stroke: C.soft, sw: 1.8 }) + path(`M${CP.X(6.3) + 2} ${CP.Y(0)}l-8 -4v8z`, { fill: C.soft }) + path(`M${CP.X(-6.3) - 2} ${CP.Y(0)}l8 -4v8z`, { fill: C.soft }));
        for (const v of [-4, -2, 0, 2, 4]) o += lb(CP.X(v), 272, v < 0 ? '−' + -v : v, { op: c1 });
        o += path(curve(cau, -6, 6, CP, 120) + `L${CP.X(6)} ${CP.Y(0)}L${CP.X(-6)} ${CP.Y(0)}Z`, { fill: C.A, fo: 0.1 * c1 * p(t, 1.6, 2.6) });
        if (cv > 0.004 && cc > 0.02) o += path(curve(cau, -cc, cc, CP, 100) + `L${CP.X(cc)} ${CP.Y(0)}L${CP.X(-cc)} ${CP.Y(0)}Z`, { fill: C.A, fo: 0.38 * cv });
        o += path(curve(cau, -6, 6, CP, 120), { stroke: C.A, sw: 2.8, lc: 'round', lj: 'round', op: c1, ...draw(p(t, 1, 3, E.io)) });
        const rd = vis(t, 7, 13.6, 0.5, 0.5) * c1;
        o += on(rd, tx(320, 116, '*c* = ' + (c < 99.5 ? FMT(c, c < 9.95 ? 1 : 0) : THOU(c)) + '  →  area ' + FMT(caW(c), 2), { size: 24, fill: C.A, op: rd }));
        const pa = vis(t, 13.6, 18.6, 0.5, 0.6) * c1;
        o += on(pa, pills(306, [{ s: 'una primitiva di 1/(1 + *x*²) è arctan *x*, da −π/2 a π/2', op: pa }]));
        const pb = p(t, 16, 16.8) * (1 - p(t, 18.2, 18.7)) * c1;
        o += on(pb, pills(340, [{ s: '(π/2 + π/2) / π = 1', icon: 'ok', col: OK, op: pb, u: p(t, 16.3, 17, E.lin) }]));
      }

      /* capitolo 2: l'integrale di x f(x) fra 0 e M cresce senza limite */
      const c2 = vis(t, 18.9, 38.9, 0.8, 0.9);
      if (c2 > 0.004) {
        const v = cVT(t), Iv = cauI(v), X0 = CS.X(0), X6 = CS.X(6);
        o += g({ op: c2 }, ln(X0, CS.Y(0), X6 + 14, CS.Y(0), { stroke: C.soft, sw: 1.8 }) + ln(X0, CS.Y(0), X0, CS.Y(4.9), { stroke: C.soft, sw: 1.8 }));
        ['1', '10', '100', '1 000', '10^4', '10^5', '10^6'].forEach((s, k) => (o += tx(CS.X(k), 310, s, { ff: SANS, size: 17, fill: C.soft, op: c2 })));
        for (const y of [1, 2, 3, 4]) o += ln(X0 - 4, CS.Y(y), X0, CS.Y(y), { stroke: C.soft, sw: 1.4, op: c2 }) + lb(X0 - 8, CS.Y(y) + 6, y, { ta: 'end', op: c2 });
        o += tx(X6 + 30, 310, '*M*', { size: 20, op: c2 });
        const pts = [];
        const n = Math.max(2, Math.round(v * 14));
        for (let i = 0; i <= n; i++) pts.push([(v * i) / n, cauI((v * i) / n)]);
        o += path(poly(pts, CS), { stroke: C.B, sw: 3.6, lc: 'round', lj: 'round', op: c2 });
        o += circ(CS.X(v), CS.Y(Iv), 6.5, { fill: C.hi, stroke: C.ink, sw: 1.4, op: c2 });
        const ct = p(t, 19.6, 20.4) * c2;
        o += on(ct, tx(96, 124, '*M* = ' + THOU(10 ** v), { size: 22, ta: 'start', op: ct }) + tx(96, 164, FMT(Iv, 2), { size: 40, fill: C.B, ta: 'start', op: ct }));
        const g3 = p(t, 24.4, 25.2) * c2, g6 = p(t, 30.8, 31.6) * c2;
        o += on(g3, ln(CS.X(3), CS.Y(cauI(3)), CS.X(3), CS.Y(0), { stroke: C.hi, sw: 1.8, da: '5 4', op: g3 }) + tx(CS.X(3) - 12, CS.Y(cauI(3)) - 12, '2,2', { size: 24, fill: C.B, ta: 'end', op: g3 }));
        o += on(g6, ln(CS.X(6), CS.Y(cauI(6)), CS.X(6), CS.Y(0), { stroke: C.hi, sw: 1.8, da: '5 4', op: g6 }) + tx(CS.X(6) - 12, CS.Y(cauI(6)) - 12, '4,4', { size: 24, fill: C.B, ta: 'end', op: g6 }));
        const up = p(t, 32.6, 33.6) * c2;
        o += on(up, arrow(CS.X(6) + 20, CS.Y(4.1), CS.X(6) + 20, CS.Y(4.75), p(t, 32.8, 34, E.io), C.B, up) + tx(CS.X(6) + 20, CS.Y(4.75) - 10, '∞', { size: 26, fill: C.B, op: up }));
        const pl = vis(t, 34.4, 38.3, 0.6, 0.6) * c2;
        o += on(pl, pills(340, [{ s: '∫ |*x*| *f*(*x*) d*x* = ∞: niente valore atteso', icon: 'no', col: NO, op: pl, u: p(t, 34.8, 35.5, E.lin) }]));
      }

      /* capitolo 3: parte positiva, parte negativa, somma */
      const c3 = vis(t, 38.5, 57.7, 0.8, 0.01);
      if (c3 > 0.004) {
        const vs = t < 44.6 ? 6 * p(t, 38.9, 44.4, E.io) : lerp(6, 3, p(t, 45.2, 46.8, E.io));
        const Ip = t < 51.8 ? cauI(vs) : lerp(cauI(3), Math.log(1 + 4e6) / (2 * Math.PI), p(t, 52, 53.8, E.io)), In = cauI(vs), net = Ip - In;
        const xP = 230, xN = 400, xS = 556, bw = 64;
        o += g({ op: c3 }, ln(70, Z3, 610, Z3, { stroke: C.soft, sw: 1.8 }));
        o += rect(xP - bw / 2, Z3 - SC3 * Ip, bw, SC3 * Ip, { fill: C.A, fo: 0.4 * c3, stroke: C.A, sw: 2.2, so: c3 }) + rect(xN - bw / 2, Z3, bw, SC3 * In, { fill: C.B, fo: 0.4 * c3, stroke: C.B, sw: 2.2, so: c3 });
        o += tx(xP, Z3 - SC3 * Ip - 10, '+' + FMT(Ip, 2), { size: 24, fill: C.A, op: c3 }) + tx(xN, Z3 + SC3 * In + 26, '−' + FMT(In, 2), { size: 24, fill: C.B, op: c3 });
        o += lb(xP, Z3 + 24, 'parte positiva', { op: c3 }) + lb(xN, Z3 - 12, 'parte negativa', { op: c3 });
        const sm = p(t, 46.6, 47.4) * c3;
        if (sm > 0.004) {
          o += rect(xS - 24, Z3 - SC3 * Math.max(net, 0), 48, SC3 * Math.max(net, 0), { fill: C.C, fo: 0.45 * sm, stroke: C.C, sw: 2.2, so: sm });
          o += tx(xS, Z3 - SC3 * Math.max(net, 0) - 10, FMT(net, 2), { size: 24, fill: C.C, op: sm }) + lb(xS, Z3 + 24, 'somma', { op: sm });
        }
        const mt = p(t, 39.2, 39.8) * (1 - p(t, 44.8, 45.4)) * c3;
        o += on(mt, tx(610, 108, '*M* = ' + THOU(10 ** vs), { size: 22, ta: 'end', op: mt }));
        const w1 = vis(t, 46.4, 51.8, 0.5, 0.5) * c3, w2 = vis(t, 52, 57.7, 0.5, 0.01) * c3;
        o += on(w1, tx(610, 108, 'finestra [−*M*, *M*]', { size: 22, ta: 'end', op: w1 })) + on(w2, tx(610, 108, 'finestra [−*M*, 2*M*]', { size: 22, ta: 'end', op: w2 }));
        const inf = p(t, 42.6, 43.6) * (1 - p(t, 44.6, 45.2)) * c3;
        o += on(inf, tx(xP + 56, Z3 - 70, '+∞', { size: 30, fill: C.A, ta: 'start', op: inf }) + tx(xN + 56, Z3 + 78, '−∞', { size: 30, fill: C.B, ta: 'start', op: inf }));
        const q1 = vis(t, 43.6, 45.4, 0.5, 0.4) * c3, q2 = vis(t, 47.8, 51.8, 0.6, 0.5) * c3, q3 = vis(t, 54.2, 57.7, 0.6, 0.01) * c3;
        o += on(q1, pills(340, [{ s: '+∞ − ∞ = ?  non vale nulla', op: q1 }]));
        o += on(q2, pills(340, [{ s: 'somma = 0, ma non è il valore atteso', icon: 'no', col: NO, op: q2, u: p(t, 48.2, 48.9, E.lin) }]));
        o += on(q3, pills(340, [{ s: 'da −*M* a 2*M*: somma 0,22. Dipende dal taglio', op: q3 }]));
      }
      return o;
    },
  });

  /* ======================================================================
     3.4 · La formula delle code: E[X] = ∫ P(X > t) dt
     ====================================================================== */
  const FP1 = plane(90, 292, 110, 64), FP2 = plane(90, 290, 110, 130), RP = plane(70, 322, 70, 70); // soglie (capitolo 1), curva delle code (2), regione 0 < t < x (3)
  const SL = [0.5, 1, 1.5, 2, 3, 4]; // lunghezze delle sei strisce (sei valori di X, media 2)
  const stepPts = (tc) => {
    const pts = [[0, 1]];
    SL.forEach((b, i) => {
      if (b < tc) pts.push([b, (6 - i) / 6], [b, (5 - i) / 6]);
    });
    pts.push([tc, SL.filter((b) => b > tc).length / 6]);
    return pts;
  };
  const tail = (x) => (x <= 1 ? 1 : 1 / (x * x)); // P(X > t) per f = 2/x³

  PV.add('formulacode', {
    sec: '3.33',
    short: 'La formula delle code',
    title: 'La formula delle code: E[X] = ∫ P(X > t) dt',
    alt: 'Animazione: un valore X = 3 contribuisce con 1 a ogni soglia t fra 0 e 3, in totale 3; con sei strisce di lunghezza diversa l’area sotto la scala P(X > t) è la lunghezza media (2); per la densità 2/x³ la curva P(X > t) vale 1 fino a 1 e 1/t² dopo, area 1 + 1 = 2 ore; infine la regione 0 < t < x si legge per righe o per colonne e scambia l’ordine di integrazione.',
    dur: 56,
    poster: 18,
    chap: [[0, 'Un valore, tante soglie'], [21, 'Un esempio continuo'], [35.5, 'Perché funziona']],
    caps: [
      [0, 'Un valore X = 3 contribuisce con 1 a ogni soglia t fra 0 e 3, e con 0 oltre: in totale 3, proprio il suo valore.'],
      [7, 'Con tanti valori, qui sei strisce lunghe 0,5, 1, 1,5, 2, 3 e 4, P(X > t) è la frazione di strisce più lunghe di t.'],
      [14.5, 'L’area sotto questa scala è la lunghezza media delle strisce: 2. La media è l’area sotto la curva P(X > t).'],
      [21, 'Una sessione su un sito, con densità f(x) = 2/x³ per x ≥ 1 ora: P(X > t) vale 1 fino a t = 1 e poi 1/t².'],
      [28, 'Area: il rettangolo da 0 a 1 vale 1, la coda da 1 all’infinito vale ancora 1. In tutto E[X] = 2 ore.'],
      [35.5, 'Nella dimostrazione scrivo x = ∫ dt da 0 a x: E[X] diventa un integrale doppio sulla regione 0 < t < x.'],
      [42, 'Leggo la regione per righe: per ogni x, t va da 0 a x; l’integrale interno vale x e restituisce x f(x) dx.'],
      [49, 'Oppure per colonne: per ogni t, x va da t a ∞; l’integrale interno è l’area a destra di t, cioè P(X > t).'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 20.6, 'Un valore, tante soglie', 'ogni soglia *t* che *X* supera aggiunge 1') + heading(t, 21.2, 35.2, 'Un esempio continuo', '*f*(*x*) = 2/*x*³ per *x* ≥ 1: durata di una sessione, in ore') + heading(t, 35.9, 56.4, 'Perché funziona', 'la regione 0 < *t* < *x*, letta in due modi');

      /* capitolo 1: un valore, poi sei strisce */
      const c1 = vis(t, 0.4, 21.4, 0.8, 0.9);
      if (c1 > 0.004) {
        o += g({ op: c1 }, ln(FP1.X(-0.1), FP1.Y(0), FP1.X(4.6), FP1.Y(0), { stroke: C.soft, sw: 1.8 }) + ln(FP1.X(0), FP1.Y(0), FP1.X(0), FP1.Y(1.15), { stroke: C.soft, sw: 1.8 }));
        for (const v of [0, 1, 2, 3, 4]) o += lb(FP1.X(v), 314, v, { op: c1 });
        o += tx(FP1.X(4.6) + 16, 298, '*t*', { size: 20, op: c1 }) + lb(FP1.X(0) - 8, FP1.Y(1) + 6, '1', { ta: 'end', op: c1 }) + lb(FP1.X(0) - 8, FP1.Y(0) + 6, '0', { ta: 'end', op: c1 });
        const ya = 1 - p(t, 7, 7.8), yb = p(t, 7.4, 8.2) * (1 - p(t, 20.2, 20.9));
        /* un solo valore, X = 3 */
        if (ya > 0.004) {
          const tc = 4.2 * p(t, 3.2, 7, E.lin), tm = Math.min(tc, 3), u = p(t, 1.2, 2.6, E.io);
          o += rect(FP1.X(0), 130, 330 * u, 14, { fill: C.B, fo: (tc < 3 ? 0.9 : 0.35) * ya, stroke: C.B, sw: 2, so: ya });
          o += tx(FP1.X(3) + 12, 142, '*X* = 3', { size: 22, ta: 'start', op: ya * p(t, 2.4, 3.2) });
          const tl = p(t, 3, 3.6) * ya;
          o += on(tl, ln(FP1.X(tc), 90, FP1.X(tc), 292, { stroke: C.hi, sw: 2.4, da: '6 4', op: tl }));
          o += on(tl, rect(FP1.X(0), FP1.Y(1), 110 * tm, 64, { fill: C.A, fo: 0.3 * tl }) + path(poly([[0, 1], [tm, 1]], FP1) + (tc > 3 ? poly([[3, 1], [3, 0]], FP1) : ''), { stroke: C.A, sw: 3, lc: 'round', op: tl }));
          o += on(tl, tx(610, 104, 'soglia *t* = ' + FMT(tc, 1), { size: 20, ta: 'end', op: tl }) + tx(FP1.X(3) + 16, 268, 'area = ' + FMT(tm, 1), { size: 24, fill: C.A, ta: 'start', op: tl }));
        }
        /* sei strisce */
        if (yb > 0.004) {
          const tc = 4.4 * p(t, 10.2, 14, E.lin), vl = p(t, 10, 10.6) * (1 - p(t, 14.2, 14.8));
          SL.forEach((b, i) => {
            const u = p(t, 7.6 + 0.3 * i, 8.6 + 0.3 * i, E.out), hot = b > tc && tc > 0 ? 1 : 0;
            o += rect(FP1.X(0), 92 + 18 * i, 110 * b * u, 14, { fill: C.B, fo: (hot ? 0.9 : 0.35) * yb, stroke: C.B, sw: 1.6, so: yb });
            o += tx(FP1.X(b) + 8, 92 + 18 * i + 12, FMT(b, b % 1 ? 1 : 0), { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: yb * u });
          });
          const sp = stepPts(tc);
          if (vl > 0.004 || tc > 4.3) {
            const op = p(t, 10, 10.6) * yb;
            o += path(poly([[0, 0], ...sp, [tc, 0]], FP1) + 'Z', { fill: C.A, fo: 0.3 * op });
            o += path(poly(sp, FP1), { stroke: C.A, sw: 3, lc: 'round', lj: 'round', op });
            o += on(vl, ln(FP1.X(tc), 86, FP1.X(tc), 292, { stroke: C.hi, sw: 2.4, da: '6 4', op: vl * yb }));
            o += tx(610, 104, 'soglia *t* = ' + FMT(tc, 1), { size: 20, ta: 'end', op: vl * yb }) + tx(610, 222, '*P*(*X* > *t*) = ' + Math.round(sp[sp.length - 1][1] * 6) + '/6', { size: 20, fill: C.A, ta: 'end', op: vl * yb });
          }
          const ar = p(t, 14.8, 15.6) * yb;
          o += on(ar, tx(FP1.X(4) + 14, 262, 'area = 2', { size: 22, fill: C.A, ta: 'start', op: ar }));
        }
        const p1 = vis(t, 4, 7, 0.5, 0.4), p2 = vis(t, 10.6, 14.4, 0.5, 0.4), p3 = vis(t, 15.4, 20.8, 0.5, 0.5);
        o += on(p1, pills(340, [{ s: 'ogni soglia *t* < 3 aggiunge 1: in tutto 3 = *X*', op: p1 }]));
        o += on(p2, pills(340, [{ s: '*P*(*X* > *t*) = frazione di strisce più lunghe di *t*', op: p2 }]));
        o += on(p3, pills(340, [{ s: '(0,5 + 1 + 1,5 + 2 + 3 + 4) / 6 = 2 = area', icon: 'ok', col: OK, op: p3, u: p(t, 15.8, 16.6, E.lin) }]));
      }

      /* capitolo 2: la curva P(X > t) per f = 2/x³ */
      const c2 = vis(t, 20.9, 36, 0.8, 0.9);
      if (c2 > 0.004) {
        o += g({ op: c2 }, ln(FP2.X(-0.1), FP2.Y(0), FP2.X(4.5), FP2.Y(0), { stroke: C.soft, sw: 1.8 }) + ln(FP2.X(0), FP2.Y(0), FP2.X(0), FP2.Y(1.12), { stroke: C.soft, sw: 1.8 }));
        for (const v of [0, 1, 2, 3, 4]) o += lb(FP2.X(v), 312, v, { op: c2 });
        o += tx(FP2.X(4.5) + 16, 296, '*t*', { size: 20, op: c2 }) + lb(FP2.X(0) - 8, FP2.Y(1) + 6, '1', { ta: 'end', op: c2 }) + lb(FP2.X(0) - 8, FP2.Y(0) + 6, '0', { ta: 'end', op: c2 });
        const tcur = 1 + 3.4 * p(t, 28.6, 33, E.io), cu = p(t, 21.2, 24, E.io);
        o += rect(FP2.X(0), FP2.Y(1), 110, FP2.Y(0) - FP2.Y(1), { fill: C.hi, fo: 0.3 * c2 * p(t, 25, 26) });
        const ex = Math.min(tcur, 4.4);
        o += on(p(t, 28.4, 29), path(curve(tail, 1, ex, FP2, 70) + `L${FP2.X(ex)} ${FP2.Y(0)}L${FP2.X(1)} ${FP2.Y(0)}Z`, { fill: C.A, fo: 0.3 * c2 * p(t, 28.4, 29) }));
        o += path(poly([[0, 1], [1, 1]], FP2) + curve(tail, 1, 4.4, FP2, 80).replace('M', 'L'), { stroke: C.B, sw: 3.6, lc: 'round', lj: 'round', op: c2, ...draw(cu) });
        o += tx(FP2.X(0.5), FP2.Y(1) - 10, '=  1', { size: 22, fill: C.ink, op: c2 * p(t, 24.4, 25.2) }) + tx(FP2.X(2.2), FP2.Y(0.25) - 34, '1/*t*²', { size: 26, fill: C.B, ta: 'start', op: c2 * p(t, 25.6, 26.4) });
        const a1 = p(t, 28, 28.8) * c2;
        o += on(a1, tx(FP2.X(0.5), FP2.Y(0.5) + 8, 'area 1', { size: 22, op: a1 }));
        const rd = p(t, 29, 29.8) * c2;
        o += on(rd, tx(608, 128, 'totale = ' + FMT(1 + (1 - 1 / ex), 2), { size: 24, fill: C.A, ta: 'end', op: rd * (1 - p(t, 33, 33.4)) }) + tx(608, 128, 'totale → 2', { size: 24, fill: C.A, ta: 'end', op: rd * p(t, 33.4, 34) }));
        const q1 = vis(t, 25.4, 28, 0.5, 0.4) * c2, q2 = vis(t, 33.6, 35.2, 0.5, 0.4) * c2, q0 = vis(t, 22.4, 25.2, 0.5, 0.4) * c2;
        o += on(q0, pills(340, [{ s: '*P*(*X* > *t*) = ∫_t^∞ 2/*x*³ d*x* = 1/*t*²  per *t* ≥ 1', op: q0 }]));
        o += on(q1, pills(340, [{ s: '1 fino a *t* = 1, poi 1/*t*²', col: C.B, op: q1 }]));
        o += on(q2, pills(340, [{ s: '*E*[*X*] = 1 + 1 = 2 ore', icon: 'ok', col: OK, op: q2, u: p(t, 33.9, 34.6, E.lin) }]));
      }

      /* capitolo 3: la regione 0 < t < x, per righe e per colonne */
      const c3 = vis(t, 35.6, 56.4, 0.8, 0.01);
      if (c3 > 0.004) {
        o += g({ op: c3 }, ln(RP.X(0), RP.Y(0), RP.X(3.4), RP.Y(0), { stroke: C.soft, sw: 1.8 }) + ln(RP.X(0), RP.Y(0), RP.X(0), RP.Y(3.4), { stroke: C.soft, sw: 1.8 }));
        for (const v of [1, 2, 3]) o += lb(RP.X(v), 342, v, { op: c3 }) + lb(RP.X(0) - 8, RP.Y(v) + 6, v, { ta: 'end', op: c3 });
        o += tx(RP.X(3.4) + 14, 326, '*t*', { size: 22, op: c3 }) + tx(RP.X(0) - 4, RP.Y(3.4) - 10, '*x*', { size: 22, op: c3 });
        const rg = p(t, 35.9, 36.8) * c3;
        o += on(rg, path(poly([[0, 0], [0, 3], [3, 3]], RP) + 'Z', { fill: C.soft, fo: 0.1 * rg, stroke: C.soft, sw: 1.4, da: '5 4', so: rg }));
        o += on(rg, ln(RP.X(0), RP.Y(0), RP.X(3), RP.Y(3), { stroke: C.soft, sw: 1.8, da: '5 4', op: rg }) + tx(RP.X(2.2), RP.Y(1.6) + 8, '*x* = *t*', { size: 20, fill: C.soft, ta: 'start', op: rg }));
        /* righe: per ogni x, t va da 0 a x */
        const xr = 3 * p(t, 42.6, 46.4, E.lin), ro = vis(t, 42.2, 48.8, 0.4, 0.8) * c3;
        if (ro > 0.004) o += path(poly([[0, 0], [0, xr], [xr, xr]], RP) + 'Z', { fill: C.A, fo: 0.35 * ro }) + ln(RP.X(0), RP.Y(xr), RP.X(xr), RP.Y(xr), { stroke: C.A, sw: 4, lc: 'round', op: ro }) + tx(RP.X(xr / 2), RP.Y(xr) - 10, 'lunga *x*', { size: 20, fill: C.A, op: ro * p(t, 43, 43.8) });
        /* colonne: per ogni t, x va da t a ∞ */
        const tcc = 3 * p(t, 49.6, 53.4, E.lin), co = vis(t, 49.2, 56.4, 0.4, 0.01) * c3;
        if (co > 0.004) {
          o += path(poly([[0, 0], [0, 3], [tcc, 3], [tcc, tcc]], RP) + 'Z', { fill: C.C, fo: 0.35 * co }) + ln(RP.X(tcc), RP.Y(tcc), RP.X(tcc), RP.Y(3.25), { stroke: C.C, sw: 4, lc: 'round', op: co });
          o += arrow(RP.X(tcc), RP.Y(3.05), RP.X(tcc), RP.Y(3.38), co * p(t, 49.8, 50.6), C.C, co);
        }
        /* le righe della catena di uguaglianze, a destra */
        const L = (a, y, s, o2 = {}) => {
          const op = vis(t, a, 56.4, 0.6, 0.01) * c3;
          return on(op, tx(344, y, s, { size: 23, ta: 'start', ...o2, op }));
        };
        o += L(36.4, 128, '*E*[*X*] = ∫ *x* *f*(*x*) d*x*') + L(37.6, 168, '*x* = ∫_0^x d*t*', { fill: C.A });
        o += L(43.4, 214, '= ∫ ( ∫_0^x d*t* ) *f*(*x*) d*x*', { fill: C.A, size: 21 });
        o += L(50.4, 260, '= ∫ ( ∫_t^∞ *f*(*x*) d*x* ) d*t*', { fill: C.C, size: 21 });
        o += L(54, 306, '= ∫ *P*(*X* > *t*) d*t*', { fill: C.B, size: 26 });
      }
      return o;
    },
  });

  /* ======================================================================
     3.4 · Densità a pezzi con un estremo incognito: rampa e tratto piatto
     ====================================================================== */
  const PF = plane(50, 176, 100, 120), PG = plane(50, 300, 100, 80); // densità in alto, ripartizione in basso (stessa scala orizzontale)
  const aAt = (t) => lerp(1.3, 2.5, p(t, 9, 13.2, E.io)); // l'estremo a che scorre fino a 5/2
  const Fp = (x) => (x < 0 ? 0 : x < 1 ? (x * x) / 4 : x <= 2.5 ? (2 * x - 1) / 4 : 1); // la ripartizione a tratti
  const XM = 71 / 48; // la media

  PV.add('pezzi', {
    sec: '3.10',
    short: 'Densità a pezzi, estremo incognito',
    title: 'Densità a pezzi con un estremo incognito: area, media, ripartizione, mediana',
    alt: 'Animazione: una densità che sale da 0 a 1/2 su [0, 1] e poi resta piatta fino a un estremo a incognito; l’area totale pezzo per pezzo (triangolo 1/4 più rettangolo (a − 1)/2) dà a = 5/2; la media 71/48 si ottiene componendo i baricentri (1/4 in 2/3 e 3/4 in 7/4); la ripartizione si scrive a tratti, con il termine 1/4 nel secondo pezzo; la mediana è 3/2.',
    dur: 59.5,
    poster: 31,
    chap: [[0, 'Passo 1: l’area fa 1'], [18.5, 'Passo 2: la media'], [32.5, 'Passo 3: la ripartizione'], [46.5, 'Passo 4: la mediana']],
    caps: [
      [0, 'La densità del tempo di avvio sale da 0 a 1/2 in un secondo, poi resta piatta fino a un limite a incognito.'],
      [6.5, 'L’area totale deve fare 1. Rampa: triangolo di area 1/4. Pezzo piatto: rettangolo di base a − 1 e altezza 1/2.'],
      [13.5, '1/4 + (a − 1)/2 = 1 dà a − 1 = 3/2, cioè a = 5/2: maggiore di 1, come richiesto.'],
      [18.5, 'Per la media uso i baricentri: il triangolo pesa 1/4 e sta in 2/3; il rettangolo pesa 3/4 e sta a metà, in 7/4.'],
      [25.5, 'Media pesata: 1/4 · 2/3 + 3/4 · 7/4 = 1/6 + 21/16 = 71/48 ≈ 1,479 secondi: il fulcro che equilibra le due masse.'],
      [32.5, 'Ora la ripartizione, un pezzo alla volta. Nel primo pezzo F(x) = x²/4, e in x = 1 vale 1/4: l’area della rampa.'],
      [39.5, 'Nel secondo pezzo si parte da quel 1/4: F(x) = 1/4 + (x − 1)/2. Senza il 1/4, in 5/2 si arriverebbe solo a 3/4.'],
      [46.5, 'Mediana: F(1) = 1/4 è sotto 1/2, quindi sta nel secondo pezzo. Da (2m − 1)/4 = 1/2 viene m = 3/2.'],
      [53, 'La mediana 1,5 è appena sopra la media 1,479: la rampa, dove f è bassa, tira la media un po’ in basso.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 18, 'Passo 1: l’area totale fa 1', 'rampa da 0 a 1, poi piatta fino ad *a* (incognito)') + heading(t, 18.9, 32, 'Passo 2: la media', 'i baricentri dei due pezzi, pesati con le loro aree') + heading(t, 32.9, 46, 'Passo 3: la ripartizione a tratti', '*F*(*x*) è l’area accumulata da sinistra') + heading(t, 46.9, 59.9, 'Passo 4: mediana e confronto', 'in quale pezzo cade il livello 1/2?');
      const col = (a, b, y, s, o2 = {}) => {
        const op = vis(t, a, b, 0.5, 0.5);
        return on(op, tx(392, y, s, { size: 22, ta: 'start', ...o2, op }));
      };
      const cl = (a, b, y, s) => col(a, b, y, s, { ff: SANS, size: 17, fill: C.soft });

      /* il piano della densità, sempre presente: grande nel capitolo 1, poi si rimpicciolisce in alto a sinistra */
      const a = aAt(t), ax = p(t, 0.4, 1.4), u0 = p(t, 17.8, 19.6, E.io);
      const PF1 = plane(lerp(100, 50, u0), lerp(232, 176, u0), lerp(150, 100, u0), lerp(180, 120, u0));
      o += g({ op: ax }, ln(PF1.X(-0.1), PF1.Y(0), PF1.X(3.1), PF1.Y(0), { stroke: C.soft, sw: 1.8 }) + ln(PF1.X(0), PF1.Y(0), PF1.X(0), PF1.Y(0.62), { stroke: C.soft, sw: 1.8 }));
      o += lb(PF1.X(0), PF1.Y(0) + 21, '0', { op: ax }) + lb(PF1.X(1), PF1.Y(0) + 21, '1', { op: ax }) + lb(PF1.X(0) - 8, PF1.Y(0.5) + 6, '1/2', { ta: 'end', op: ax });
      const rp = p(t, 1.2, 3, E.io), fl = p(t, 3.4, 4.6), st = a > 2.499 ? '5/2' : '*a*';
      o += path(poly([[0, 0], [1, 0.5], [1, 0]], PF1) + 'Z', { fill: C.A, fo: 0.3 * rp });
      o += path(poly([[0, 0], [1, 0.5]], PF1), { stroke: C.A, sw: 3.2, lc: 'round', ...draw(rp) });
      o += on(fl, path(poly([[1, 0], [1, 0.5], [a, 0.5], [a, 0]], PF1) + 'Z', { fill: C.B, fo: 0.3 * fl }) + path(poly([[1, 0.5], [a, 0.5], [a, 0]], PF1), { stroke: C.B, sw: 3.2, lc: 'round', lj: 'round', op: fl }));
      o += on(fl, tx(PF1.X(a), PF1.Y(0) + 22, st, { size: 22, fill: C.B, op: fl }));
      const tb = p(t, 7.4, 8.2) * (1 - p(t, 18.2, 18.7)), rb = p(t, 9.2, 10) * (1 - p(t, 18.2, 18.7));
      o += on(tb, tx(PF1.X(0.78), PF1.Y(0.12) + 7, '1/4', { size: 20, fill: C.A, op: tb }));
      o += on(rb, tx(PF1.X((1 + a) / 2), PF1.Y(0.5) - 10, a > 2.499 ? '3/4' : FMT((a - 1) / 2, 2), { size: 20, fill: C.B, op: rb }));

      /* capitolo 1: area totale e a (le formule stanno sotto il disegno) */
      const rw = (a1, b1, x, y, s2, o2 = {}) => {
        const op = vis(t, a1, b1, 0.5, 0.5);
        return on(op, tx(x, y, s2, { size: 22, ta: 'start', ...o2, op }));
      };
      o += rw(7, 17.8, 60, 284, 'triangolo', { ff: SANS, size: 17, fill: C.soft }) + rw(7.4, 17.8, 60, 310, '1/2 · 1 · 1/2 = 1/4', { fill: C.A });
      o += rw(9, 17.8, 340, 284, 'rettangolo', { ff: SANS, size: 17, fill: C.soft }) + rw(9.4, 17.8, 340, 310, '(*a* − 1) · 1/2', { fill: C.B });
      const tot = 0.25 + (a - 1) / 2, s1 = vis(t, 9.4, 13.6, 0.5, 0.4), s2 = vis(t, 14, 17.8, 0.5, 0.5);
      o += on(s1, pills(342, [{ s: 'area totale = ' + FMT(tot, 2), op: s1 }]));
      o += on(s2, pills(342, [{ s: '1/4 + (*a* − 1)/2 = 1  →  *a* = 5/2', icon: 'ok', col: OK, op: s2, u: p(t, 14.4, 15.2, E.lin) }]));

      /* capitolo 2: baricentri e fulcro */
      const c2 = vis(t, 19.2, 32.2, 0.8, 0.8);
      if (c2 > 0.004) {
        const cb = p(t, 19.6, 20.4) * c2;
        for (const [cx, cy, s2c, col2] of [[2 / 3, 1 / 6, '2/3', C.A], [7 / 4, 1 / 4, '7/4', C.B]]) o += on(cb, circ(PF.X(cx), PF.Y(cy), 5, { fill: col2, stroke: C.ink, sw: 1.2, op: cb }) + ln(PF.X(cx), PF.Y(cy), PF.X(cx), PF.Y(0), { stroke: col2, sw: 1.6, da: '4 4', op: cb }) + tx(PF.X(cx), 198, s2c, { size: 20, fill: col2, op: cb }));
        const piv = lerp(1.25, XM, p(t, 26.6, 29.6, E.io)), pivot = PF.X(piv), th = 0.2 * (PF.X(XM) - pivot) + wobble(t - 29.6, 4);
        const bm = p(t, 20.4, 21.4) * c2, yb = 276;
        const blk = (x, h, col2, lab, sz) => rect(PF.X(x) - pivot - 20, -12 - h, 40, h, { fill: col2, fo: 0.35, stroke: col2, sw: 1.8 }) + tx(PF.X(x) - pivot, -12 - h / 2 + (sz > 17 ? 7 : 6), lab, { ff: sz > 17 ? undefined : SANS, size: sz });
        let inner = rect(PF.X(-0.1) - pivot, -12, PF.X(2.7) - PF.X(-0.1), 12, { rx: 4, fill: C.soft, fo: 0.35, stroke: C.soft, sw: 1.8 }) + blk(2 / 3, 18, C.A, '1/4', 17) + blk(7 / 4, 54, C.B, '3/4', 22);
        o += g({ op: bm }, g({ tf: T(pivot, yb, 1, th) }, inner) + on(p(t, 23.4, 24.2), fulcrum(pivot, yb, p(t, 23.4, 24.2))));
        const el = p(t, 29.8, 30.6) * c2;
        o += on(el, tx(PF.X(XM), yb + 46, '*E*[*X*] = 71/48', { size: 22, fill: C.B, op: el }));
        o += cl(20.4, 32.2, 124, 'triangolo') + col(20.8, 32.2, 150, 'peso 1/4 in 2/3', { fill: C.A });
        o += cl(22.2, 32.2, 188, 'rettangolo') + col(22.6, 32.2, 214, 'peso 3/4 in 7/4', { fill: C.B });
        o += col(26, 32.2, 262, '1/4 · 2/3 + 3/4 · 7/4') + col(27.6, 32.2, 296, '= 1/6 + 21/16') + col(29.2, 32.2, 332, '= 71/48 ≈ 1,479', { size: 26, fill: C.B });
      }

      /* capitolo 3: la ripartizione a tratti */
      const c3 = vis(t, 33, 46.2, 0.9, 0.8);
      if (c3 > 0.004) {
        o += g({ op: c3 }, ln(PG.X(-0.1), PG.Y(0), PG.X(3.1), PG.Y(0), { stroke: C.soft, sw: 1.8 }) + ln(PG.X(0), PG.Y(0), PG.X(0), PG.Y(1.1), { stroke: C.soft, sw: 1.8 }) + ln(PG.X(0), PG.Y(1), PG.X(3.1), PG.Y(1), { stroke: C.line, sw: 1.4, da: '5 4' }));
        o += lb(PG.X(0), 320, '0', { op: c3 }) + lb(PG.X(1), 320, '1', { op: c3 }) + lb(PG.X(2.5), 320, '5/2', { op: c3 });
        o += lb(PG.X(0) - 8, PG.Y(1) + 6, '1', { ta: 'end', op: c3 }) + lb(PG.X(0) - 8, PG.Y(0.25) + 6, '1/4', { ta: 'end', op: c3 * p(t, 36, 36.8) });
        const u1 = p(t, 33.6, 36, E.io), u2 = p(t, 38, 40.4, E.io);
        o += path(curve((x) => (x * x) / 4, 0, 1, PG, 40), { stroke: C.A, sw: 3.6, lc: 'round', op: c3, ...draw(u1) });
        o += on(u2, path(poly([[1, 0.25], [2.5, 1], [3.1, 1]], PG), { stroke: C.B, sw: 3.6, lc: 'round', lj: 'round', op: c3, ...draw(u2) }));
        const m1 = p(t, 36, 36.8) * c3;
        o += on(m1, ln(PG.X(0), PG.Y(0.25), PG.X(1), PG.Y(0.25), { stroke: C.hi, sw: 1.8, da: '5 4', op: m1 }) + circ(PG.X(1), PG.Y(0.25), 5.5, { fill: C.hi, stroke: C.ink, sw: 1.2, op: m1 }));
        const wr = vis(t, 41.8, 46, 0.6, 0.6) * c3, pk = p(t, 43.6, 44.4) * wr;
        if (wr > 0.004) {
          o += path(poly([[1, 0], [2.5, 0.75]], PG), { stroke: NO, sw: 2.6, da: '6 4', op: wr, ...draw(p(t, 41.8, 43.6, E.io)) });
          o += on(pk, circ(PG.X(2.5), PG.Y(0.75), 5.5, { fill: NO, op: pk }) + tx(PG.X(2.5) + 12, PG.Y(0.75) + 20, '3/4', { size: 20, fill: NO, ta: 'start', op: pk }));
        }
        o += cl(34.4, 46, 226, 'se 0 ≤ *x* < 1') + col(34.8, 46, 252, '*F* = *x*²/4', { size: 24, fill: C.A });
        o += cl(38.4, 46, 292, 'se 1 ≤ *x* ≤ 5/2') + col(38.8, 46, 318, '*F* = 1/4 + (*x*−1)/2', { fill: C.B });
        const nt = vis(t, 42.6, 46, 0.6, 0.6) * c3;
        o += on(nt, pills(342, [{ s: 'senza il 1/4: (*x* − 1)/2 arriva solo a 3/4', icon: 'no', col: NO, op: nt, u: p(t, 43, 43.7, E.lin) }]));
      }

      /* capitolo 4: la mediana nel secondo pezzo */
      const c4 = vis(t, 47, 59.9, 0.9, 0.01);
      if (c4 > 0.004) {
        o += g({ op: c4 }, ln(PG.X(-0.1), PG.Y(0), PG.X(3.1), PG.Y(0), { stroke: C.soft, sw: 1.8 }) + ln(PG.X(0), PG.Y(0), PG.X(0), PG.Y(1.1), { stroke: C.soft, sw: 1.8 }) + ln(PG.X(0), PG.Y(1), PG.X(3.1), PG.Y(1), { stroke: C.line, sw: 1.4, da: '5 4' }));
        o += lb(PG.X(0), 320, '0', { op: c4 }) + lb(PG.X(1), 320, '1', { op: c4 }) + lb(PG.X(2.5), 320, '5/2', { op: c4 });
        o += lb(PG.X(0) - 8, PG.Y(1) + 6, '1', { ta: 'end', op: c4 }) + lb(PG.X(0) - 8, PG.Y(0.5) + 6, '1/2', { ta: 'end', op: c4 });
        o += path(curve((x) => (x * x) / 4, 0, 1, PG, 40), { stroke: C.A, sw: 3.4, lc: 'round', op: c4 }) + path(poly([[1, 0.25], [2.5, 1], [3.1, 1]], PG), { stroke: C.B, sw: 3.4, lc: 'round', lj: 'round', op: c4 * (1 - 0.35 * p(t, 48, 49)) });
        const r1 = p(t, 47.8, 49.6, E.io), r2 = p(t, 49.6, 51.2, E.io);
        o += arrow(PG.X(0) + 4, PG.Y(0.5), PG.X(1.5), PG.Y(0.5), r1, C.C, c4) + arrow(PG.X(1.5), PG.Y(0.5) + 2, PG.X(1.5), PG.Y(0) - 3, r2, C.C, c4);
        o += on(r2, tx(PG.X(1.5), 320, '*m* = 3/2', { size: 20, fill: C.C, op: c4 * p(t, 50.6, 51.4) }));
        const md = p(t, 51.4, 52.2) * c4;
        o += on(md, ln(PF.X(1.5), PF.Y(0.5) - 6, PF.X(1.5), PF.Y(0), { stroke: C.C, sw: 2.4, op: md }) + tx(PF.X(1.5) + 10, PF.Y(0.5) - 16, 'mediana 1,5', { size: 20, fill: C.C, ta: 'start', op: md }));
        o += on(md, fulcrum(PF.X(XM), PF.Y(0), md) + tx(PF.X(XM), PF.Y(0) + 40, 'media 1,479', { ff: SANS, size: 17, fill: C.B, op: md }));
        o += col(47.8, 59.9, 128, '*F*(1) = 1/4 < 1/2') + cl(48.4, 59.9, 154, 'quindi nel secondo pezzo');
        o += col(49.4, 59.9, 196, '(2*m* − 1)/4 = 1/2') + col(50.6, 59.9, 244, '*m* = 3/2', { size: 34, fill: C.C });
        const pc = vis(t, 54.4, 59.9, 0.6, 0.01) * c4;
        o += on(pc, pills(342, [{ s: 'mediana 1,5 appena sopra la media 1,479', op: pc }]));
      }
      return o;
    },
  });

})();
