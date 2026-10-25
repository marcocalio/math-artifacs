/* gi-parte3.js — grafici interattivi della Parte 3 (generato da lavoro-probabilita/grafici/build.py: non modificare a mano) */

/* ---- cambio.js (sezione 3.13) ---- */
(function () {
  'use strict';
  /* 3.13 · Funzioni monotone: il cambio di variabile (la stessa probabilità su un asse stirato) */
  const { n, sci, v, p: P } = GI;
  const { tx, ln, rect, circ, path, g, f, C, SANS } = GI.H;

  /* ---------- le leggi di X (tutte su [0, 1]) e le funzioni g (strettamente monotone su (0, 1]) ---------- */
  /* f: densità, F: ripartizione (forma chiusa, per controllare), fmax: altezza massima */
  const LAWS = {
    u: { f: () => 1, F: (x) => x, fmax: 1 },
    l2: { f: (x) => 2 * x, F: (x) => x * x, fmax: 2 },
    l3: { f: (x) => 3 * x * x, F: (x) => x * x * x, fmax: 3 },
  };
  /* g: la funzione; inv: la sua inversa; dinv: |(g^−1)′|; dg: |g′|; sup: g(I); win: finestra del disegno in y;
     vis: tratto di g che sta nella finestra; yt: segni sull'asse y; name: scritta nella chiave dei colori */
  const GS = {
    ln: { g: (x) => -Math.log(x), inv: (y) => Math.exp(-y), dinv: (y) => Math.exp(-y), dg: (x) => 1 / x, sup: [0, Infinity], win: [-0.4, 4], vis: [0, 4], yt: [0, 1, 2, 3, 4], name: '*g*(*x*) = −ln *x*' },
    sq: { g: (x) => x * x, inv: Math.sqrt, dinv: (y) => 1 / (2 * Math.sqrt(y)), dg: (x) => 2 * x, sup: [0, 1], win: [-0.1, 1.1], vis: [0, 1], yt: [0, 0.5, 1], name: '*g*(*x*) = *x*²' },
    lin: { g: (x) => 1 - 2 * x, inv: (y) => (1 - y) / 2, dinv: () => 0.5, dg: () => 2, sup: [-1, 1], win: [-1.2, 1.2], vis: [-1, 1], yt: [-1, 0, 1], name: '*g*(*x*) = 1 − 2*x*' },
  };
  const HW = 0.025; // mezza larghezza dell'intervallino: dx = 0,05
  const CAP = 6; // altezza massima mostrata per la densità di Y (con x² e X uniforme sale all'infinito vicino a 0)

  /* densità di Y secondo il teorema: f_X(g^−1(y)) · |(g^−1)′(y)| dentro g(I), 0 fuori */
  const fYf = (law, gid, y) => {
    const G = GS[gid];
    if (y < G.sup[0] || y > G.sup[1]) return 0;
    return LAWS[law].f(G.inv(y)) * G.dinv(y);
  };
  const simpson = (fn, a, b, N) => {
    const h = (b - a) / N;
    let s = fn(a) + fn(b);
    for (let i = 1; i < N; i++) s += fn(a + i * h) * (i % 2 ? 4 : 2);
    return (s * h) / 3;
  };
  /* punti da a a b, più fitti vicino ad a (dove la densità può salire) */
  function sampleY(a, b, k = 70) {
    const us = [1e-6, 1];
    for (let i = 1; i < k; i++) us.push(i / k, (i / k) ** 3);
    us.sort((p, q) => p - q);
    return us.map((u) => a + (b - a) * u);
  }

  function calc(s) {
    const G = GS[s.g], law = LAWS[s.law];
    const x = Math.min(0.96, Math.max(0.04, s.x)), x0 = x - HW, x1 = x + HW;
    const y = G.g(x), g0 = G.g(x0), g1 = G.g(x1);
    const ya = Math.min(g0, g1), yb = Math.max(g0, g1);
    const fx = law.f(x), fac = G.dinv(y), fy = fx * fac;
    const pX = law.F(x1) - law.F(x0); // area sotto f_X sull'intervallino
    const pY = simpson((t) => law.f(G.inv(t)) * G.dinv(t), ya, yb, 400); // area sotto f_Y sull'intervallo immagine
    return { G, law, x, x0, x1, y, ya, yb, fx, fac, fy, dgx: G.dg(x), pX, pY };
  }

  /* ---------- area del disegno ---------- */
  const L = 64, R = 336, XLO = -0.1, XHI = 1.1; // asse x (densità di X e grafico di g)
  const T1 = 44, B1 = 126; // riquadro della densità di X
  const T2 = 160, B2 = 352; // riquadro di g e della densità di Y (stesso asse y)
  const L3 = 388, R3 = 540; // riquadro della densità di Y (ruotato: il valore va verso destra)
  const X = P.scale(XLO, XHI, L, R);

  /* ---------- formati ---------- */
  const trim = (x) => (x.includes(',') ? x.replace(/0+$/, '').replace(/,$/, '') : x);
  const tkf = (x) => trim(n(x, 2));
  const r3 = (x) => trim(n(x, Math.abs(x) >= 100 ? 0 : Math.abs(x) >= 10 ? 1 : Math.abs(x) >= 0.1 || x === 0 ? 3 : 4));
  const pr = (x) => (x >= 0.001 ? n(x, 4) : sci(x, 3));
  /* segni sull'asse dei valori di una densità */
  function tk(m) {
    const st = m <= 0.7 ? 0.25 : m <= 1.6 ? 0.5 : m <= 3.2 ? 1 : 2, a = [];
    for (let t = 0; t <= m + 1e-9; t += st) a.push(+t.toFixed(10));
    return a;
  }
  const gtxt = (id, x) => (id === 'ln' ? `−ln ${n(x, 2)}` : id === 'sq' ? `${n(x, 2)}<sup>2</sup>` : `1 − 2 · ${n(x, 2)}`);
  const fXs = `${v('f')}<sub>${v('X')}</sub>`, fYs = `${v('f')}<sub>${v('Y')}</sub>`;
  const inv1 = `|(${v('g')}<sup>−1</sup>)′(${v('y')})|`;

  GI.add('cambio', {
    sec: '3.13',
    title: 'La probabilità resta, l’intervallo si stira',
    w: 560,
    h: 384,
    alt: 'Tre riquadri collegati. In alto la densità di X, una curva blu su [0, 1]. In basso a sinistra il grafico della funzione g, una curva viola. A destra, con lo stesso asse y, la densità di Y ruotata di un quarto di giro, ancora in blu. Un intervallino arancione largo dx attorno al punto scelto x scende dalla densità di X al grafico di g e da lì passa a una striscia orizzontale arancione sull’asse y, larga dy, che taglia la densità di Y. L’area arancione sotto la densità di X e quella sotto la densità di Y sono uguali: sono la stessa probabilità. Dove g stira l’asse, dy è più grande di dx e la densità di Y è più bassa. I comandi scelgono la legge di X, la funzione g e il punto x; i numeri precisi sono scritti sotto il disegno.',
    controls: [
      { id: 'law', kind: 'select', label: '<span>Legge di <var>X</var></span>', value: 'u', options: [['u', 'Uniforme su [0, 1]'], ['l2', 'Densità 2x su [0, 1]'], ['l3', 'Densità 3x² su [0, 1]']] },
      { id: 'g', kind: 'select', label: '<span>Funzione <var>g</var></span>', value: 'ln', options: [['ln', 'g(x) = −ln x (decrescente)'], ['sq', 'g(x) = x² (crescente)'], ['lin', 'g(x) = 1 − 2x (decrescente)']] },
      { id: 'x', label: 'Il punto <var>x</var> in cui guardare', min: 0.08, max: 0.95, step: 0.01, value: 0.37, fmt: (x) => n(x, 2) },
    ],
    presets: [
      { label: 'L’esempio del testo', set: { law: 'u', g: 'ln', x: 0.37 } },
      { label: 'Dove g stira di più', set: { law: 'u', g: 'ln', x: 0.08 } },
      { label: 'Il quadrato di un numero a caso', set: { law: 'u', g: 'sq', x: 0.3 } },
      { label: '1 − 2X con densità 2x', set: { law: 'l2', g: 'lin', x: 0.5 } },
      { label: 'X² con densità 2x', set: { law: 'l2', g: 'sq', x: 0.3 } },
    ],
    caption: 'Le curve blu sono le densità di <var>X</var> (in alto) e di <var>Y</var> = <var>g</var>(<var>X</var>) (a destra, ruotata); la curva viola è <var>g</var>. L’intervallino arancione, largo d<var>x</var> = 0,05, viene portato da <var>g</var> in un intervallino largo d<var>y</var> sull’asse <var>y</var>. Le due aree arancioni sono uguali: è la stessa probabilità. Dove <var>g</var> stira l’asse, d<var>y</var> supera d<var>x</var> e la densità di <var>Y</var> scende: è il fattore |(<var>g</var><sup>−1</sup>)′(<var>y</var>)| della formula. Le altezze hanno scale diverse: conta l’area. Con −ln <var>x</var> il disegno si ferma a <var>y</var> = 4; con <var>x</var>² e <var>X</var> uniforme la densità di <var>Y</var>, altissima vicino a 0, esce dal riquadro.',
    prove: [
      'Scegli <var>g</var>(<var>x</var>) = −ln <var>x</var> e porta <var>x</var> da 0,95 a 0,08: l’intervallino arancione sull’asse <var>y</var> si allunga o si accorcia? E la densità di <var>Y</var> in quel punto sale o scende?',
      'Scegli la densità 2<var>x</var> e <var>g</var>(<var>x</var>) = <var>x</var>²: la densità di <var>Y</var> è curva o piatta? Quanto vale?',
    ],
    calc,
    render(s) {
      const c = calc(s), { G, law } = c;
      const Yg = P.scale(G.win[0], G.win[1], B2, T2);
      const Y1 = P.scale(0, law.fmax * 1.15, B1, T1);
      /* densità di Y: campioni, altezza massima mostrata, scala orizzontale del riquadro di destra */
      const a = G.sup[0], b = Math.min(G.sup[1], G.win[1]);
      const ys = sampleY(a, b), vs = ys.map((t) => fYf(s.law, s.g, t));
      const vtop = Math.min(CAP, +Math.max(...vs).toFixed(3));
      const Xv = P.scale(0, vtop * 1.15, L3, R3);
      const halo = { stroke: C.paper, sw: 4, lj: 'round', paint_order: 'stroke' };
      const gx = X(c.x), gy = Yg(c.y), hx = Y1(c.fx), hy = Xv(c.fy), seen = c.fy <= vtop * 1.15;
      const orange = { fill: C.B, fo: 0.13, stroke: C.B, sw: 1, so: 0.5 };
      const guide = { stroke: C.B, sw: 1.8, da: '5 4' };
      const dot = (cx, cy, r) => circ(cx, cy, r, { fill: C.B, stroke: C.paper, sw: 2 });
      let svg = `<clipPath id="cambio-clip">${rect(L3 - 2, T2 - 3, R3 - L3 + 4, B2 - T2 + 6)}</clipPath>`;

      /* le due strisce, dietro a tutto: quella di x attraversa i due riquadri a sinistra, quella di y arriva alla densità di Y */
      svg += rect(X(c.x0), T1, X(c.x1) - X(c.x0), B2 - T1, orange);
      svg += rect(L, Yg(c.yb), R3 - L, Yg(c.ya) - Yg(c.yb), orange);

      /* assi */
      svg += P.axes({ X, Y: Y1, box: [L, T1, R, B1], xt: [], yt: tk(law.fmax), yf: tkf, yl: 'densità di *X*' });
      svg += P.axes({ X, Y: Yg, box: [L, T2, R, B2], xt: [0, 0.5, 1], xf: tkf, yt: G.yt, yf: tkf, yl: '*y*', grid: true });
      svg += P.axes({ X: Xv, Y: Yg, box: [L3, T2, R3, B2], xt: tk(vtop), xf: tkf, yt: [], yl: 'densità di *Y*' });
      for (const t of G.yt) svg += ln(L3, Yg(t), R3, Yg(t), { stroke: 'var(--quadretto)', sw: 1 });
      svg += tx(R + 6, B2 + 22, '*x*', { size: 16, ff: SANS, fill: C.soft, ta: 'start' });

      /* densità di X: zero fuori da [0, 1] */
      const xc = Array.from({ length: 81 }, (_, i) => i / 80);
      svg += path(`M${f(X(0))} ${f(Y1(0))}` + P.pts(xc, xc.map((t) => law.f(t)), X, Y1).replace(/^M/, 'L') + `L${f(X(1))} ${f(Y1(0))}`, { stroke: C.A, sw: 3, lc: 'round', lj: 'round' });
      svg += P.area(law.f, c.x0, c.x1, X, Y1, B1, 16, { fill: C.B, fo: 0.6 });

      /* grafico di g, solo sul tratto che sta nella finestra */
      const ends = [G.inv(G.vis[0]), G.inv(G.vis[1])], gx0 = Math.min(...ends), gx1 = Math.max(...ends);
      const gxs = [];
      for (let i = 0; i <= 60; i++) gxs.push(gx0 + ((gx1 - gx0) * i) / 60);
      for (let i = 0; i <= 100; i++) gxs.push(G.inv(G.vis[0] + ((G.vis[1] - G.vis[0]) * i) / 100));
      gxs.sort((p, q) => p - q);
      svg += path(P.pts(gxs, gxs.map((t) => G.g(t)), X, Yg), { stroke: C.C, sw: 3.2, lc: 'round', lj: 'round' });

      /* densità di Y (tagliata dal bordo del riquadro se sale troppo) e area dell'intervallo immagine */
      let dY = `M${f(Xv(0))} ${f(Yg(a))}` + P.pts(vs, ys, Xv, Yg).replace(/^M/, 'L');
      if (b === G.sup[1]) dY += `L${f(Xv(0))} ${f(Yg(b))}`;
      const sy = Array.from({ length: 25 }, (_, i) => c.ya + ((c.yb - c.ya) * i) / 24);
      const shade = `M${f(L3)} ${f(Yg(sy[0]))}` + sy.map((t) => `L${f(Xv(fYf(s.law, s.g, t)))} ${f(Yg(t))}`).join('') + `L${f(L3)} ${f(Yg(sy[24]))}Z`;
      svg += g({ 'clip-path': 'url(#cambio-clip)' }, path(shade, { fill: C.B, fo: 0.6, stroke: 'none' }) + path(dY, { stroke: C.A, sw: 3, lc: 'round', lj: 'round' }));

      /* il punto: da f_X(x) giù fino a g, poi a destra fino a f_Y(y) */
      svg += ln(gx, hx, gx, gy, guide) + ln(gx, gy, seen ? hy : R3, gy, guide);
      svg += dot(gx, hx, 5) + dot(gx, gy, 6.5) + (seen ? dot(hy, gy, 5) : '');

      /* scritte: larghezze dell'intervallino e chiave dei colori */
      svg += tx((X(c.x0) + X(c.x1)) / 2, B1 + 24, 'd*x*', { size: 17, fill: C.B, ...halo });
      svg += tx((R + L3) / 2, Yg(c.yb) - 7, 'd*y*', { size: 17, fill: C.B, ...halo });
      svg += ln(374, 50, 398, 50, { stroke: C.A, sw: 3, lc: 'round' }) + tx(408, 55, 'densità', { ff: SANS, size: 16, fill: C.soft, ta: 'start' });
      svg += ln(374, 74, 398, 74, { stroke: C.C, sw: 3, lc: 'round' }) + tx(408, 79, G.name, { ff: SANS, size: 16, fill: C.soft, ta: 'start' });
      svg += rect(374, 92, 24, 13, { fill: C.B, fo: 0.6 }) + tx(408, 103, 'stessa probabilità', { ff: SANS, size: 16, fill: C.soft, ta: 'start' });

      const X_ = v('x'), Y_ = v('y');
      const out = `<p>Il punto: ${X_} = ${n(c.x, 2)}, quindi ${Y_} = ${v('g')}(${X_}) = ${gtxt(s.g, c.x)} = <b>${r3(c.y)}</b>. L’intervallino largo d${X_} = 0,05 diventa largo d${Y_} = ${r3(c.yb - c.ya)}.</p>
  <p>${fXs}(${X_}) = ${r3(c.fx)}, e il fattore ${inv1} = 1/|${v('g')}′(${X_})| = 1/${r3(c.dgx)} = ${r3(c.fac)}. Quindi ${fYs}(${Y_}) = ${r3(c.fx)} · ${r3(c.fac)} = <span class="gi-hl">${r3(c.fy)}</span>.</p>
  <p>Area sotto ${fXs} sull’intervallino di ${X_}: <b>${pr(c.pX)}</b>. Area sotto ${fYs} sull’intervallino di ${Y_}, con la densità della formula: <b>${pr(c.pY)}</b>. Sono uguali: la probabilità è la stessa.</p>`;
      return { svg, out };
    },
    selftest() {
      const W = GI.widgets.cambio, d = GI.defaults(W), out = W.render(d).out;
      const cD = calc(d);
      /* ripartizione di Y per definizione, P(g(X) ≤ y), con la sola F_X: crescente F_X(g^−1(y)), decrescente 1 − F_X(g^−1(y)) */
      const FY = (law, gid, y) => (gid === 'sq' ? LAWS[law].F(GS[gid].inv(y)) : 1 - LAWS[law].F(GS[gid].inv(y)));
      const deriv = (law, gid, y) => (FY(law, gid, y + 1e-6) - FY(law, gid, y - 1e-6)) / 2e-6; // derivata numerica di F_Y
      const tags = (svg, name) => svg.match(new RegExp('<' + name + '\\s[^>]*>', 'g')) || [];
      const attr = (tag, a) => { const m = tag.match(new RegExp('\\s' + a + '="([^"]*)"')); return m ? m[1] : ''; };
      const svgD = W.render(d).svg, cerchi = tags(svgD, 'circle'), bande = tags(svgD, 'rect').filter((r) => attr(r, 'fill-opacity') === '0.13');
      /* area totale sotto f_Y, con Simpson; si parte da un soffio sopra l'estremo, dove con x² la densità sale all'infinito */
      const tot = (law, gid, lo, hi) => simpson((t) => fYf(law, gid, t), lo, hi, 4000);
      return [
        // python3 -I -c "import math; print(math.exp(-1))"
        ['esempio del testo: f_Y(1) = e^(−1) con −ln e X uniforme', fYf('u', 'ln', 1), 0.36787944117144233, 1e-15],
        // python3 -I -c "import math; print(2*math.exp(-1))"
        ['f_Y(0,5) = 2e^(−1) con −ln e densità 2x', fYf('l2', 'ln', 0.5), 0.7357588823428847, 1e-15],
        // python3 -I -c "import math; print(3*math.exp(-1))"
        ['f_Y(1/3) = 3e^(−1) con −ln e densità 3x²', fYf('l3', 'ln', 1 / 3), 1.103638323514327, 1e-14],
        // f_Y(y) = 1/(2√y) per X uniforme e g = x²: python3 -I -c "print(1/(2*0.25**0.5))"
        ['x² con X uniforme: f_Y(0,25) = 1', fYf('u', 'sq', 0.25), 1, 1e-15],
        // x² con densità 2x: f_Y = 1 su (0, 1]: python3 -I -c "print(2*0.3**0.5/(2*0.3**0.5))"
        ['x² con densità 2x: f_Y(0,3) = 1', fYf('l2', 'sq', 0.3), 1, 1e-15],
        // python3 -I -c "print(1.5*0.36**0.5)"
        ['x² con densità 3x²: f_Y(0,36) = 0,9', fYf('l3', 'sq', 0.36), 0.8999999999999999, 1e-15],
        // 1 − 2x con densità 2x: f_Y(y) = (1 − y)/2: python3 -I -c "print((1+0.5)/2)"
        ['1 − 2x con densità 2x: f_Y(−0,5) = 0,75 (la «Prova tu» di 3.12)', fYf('l2', 'lin', -0.5), 0.75, 1e-15],
        // python3 -I -c "print(3*0.8**2/8)"
        ['1 − 2x con densità 3x²: f_Y(0,2) = 0,24', fYf('l3', 'lin', 0.2), 0.24000000000000005, 1e-15],
        // la formula contro la derivata numerica di F_Y(y) = P(g(X) ≤ y), senza passare dal fattore |(g^−1)′|
        ['−ln e X uniforme: formula = F_Y′ in y = 0,8', fYf('u', 'ln', 0.8), deriv('u', 'ln', 0.8), 1e-6],
        ['−ln e densità 3x²: formula = F_Y′ in y = 1,3', fYf('l3', 'ln', 1.3), deriv('l3', 'ln', 1.3), 1e-6],
        ['x² e X uniforme: formula = F_Y′ in y = 0,4', fYf('u', 'sq', 0.4), deriv('u', 'sq', 0.4), 1e-6],
        ['x² e densità 3x²: formula = F_Y′ in y = 0,7', fYf('l3', 'sq', 0.7), deriv('l3', 'sq', 0.7), 1e-6],
        ['1 − 2x e densità 2x: formula = F_Y′ in y = −0,4', fYf('l2', 'lin', -0.4), deriv('l2', 'lin', -0.4), 1e-6],
        ['1 − 2x e densità 3x²: formula = F_Y′ in y = 0,6', fYf('l3', 'lin', 0.6), deriv('l3', 'lin', 0.6), 1e-6],
        // il fattore |(g^−1)′(y)| è 1/|g′(x)|: la regola della derivata dell'inversa
        ['−ln: |(g^−1)′(y)| = 1/|g′(x)| in x = 0,4', GS.ln.dinv(GS.ln.g(0.4)), 1 / GS.ln.dg(0.4), 1e-14],
        ['x²: |(g^−1)′(y)| = 1/|g′(x)| in x = 0,3', GS.sq.dinv(GS.sq.g(0.3)), 1 / GS.sq.dg(0.3), 1e-14],
        ['1 − 2x: |(g^−1)′(y)| = 1/|g′(x)| in x = 0,6', GS.lin.dinv(GS.lin.g(0.6)), 1 / GS.lin.dg(0.6), 1e-14],
        // e il fattore contro la derivata numerica dell'inversa
        ['−ln: |(g^−1)′| contro la derivata numerica in y = 1,1', GS.ln.dinv(1.1), Math.abs((GS.ln.inv(1.1 + 1e-6) - GS.ln.inv(1.1 - 1e-6)) / 2e-6), 1e-8],
        ['x²: |(g^−1)′| contro la derivata numerica in y = 0,3', GS.sq.dinv(0.3), Math.abs((GS.sq.inv(0.3 + 1e-6) - GS.sq.inv(0.3 - 1e-6)) / 2e-6), 1e-8],
        // stessa probabilità: area di f_X sull'intervallino = area di f_Y sull'intervallo immagine (Simpson), con i valori di Python
        // python3 -I -c "print(0.525**3-0.475**3)"   (densità 3x², x = 0,5)
        ['densità 3x², x = 0,5: area sotto f_X', calc({ law: 'l3', g: 'ln', x: 0.5 }).pX, 0.03753125000000003, 1e-15],
        ['densità 3x², −ln, x = 0,5: area sotto f_Y', calc({ law: 'l3', g: 'ln', x: 0.5 }).pY, 0.03753125000000003, 1e-9],
        ['densità 3x², x², x = 0,5: area sotto f_Y', calc({ law: 'l3', g: 'sq', x: 0.5 }).pY, 0.03753125000000003, 1e-9],
        ['densità 3x², 1 − 2x, x = 0,5: area sotto f_Y', calc({ law: 'l3', g: 'lin', x: 0.5 }).pY, 0.03753125000000003, 1e-9],
        // python3 -I -c "print(0.105**3-0.055**3)"   (densità 3x², x = 0,08: il punto in cui −ln stira di più)
        ['densità 3x², −ln, x = 0,08: area sotto f_Y', calc({ law: 'l3', g: 'ln', x: 0.08 }).pY, 0.0009912499999999997, 1e-12],
        ['uniforme, x², x = 0,08 (f_Y alta): area sotto f_Y', calc({ law: 'u', g: 'sq', x: 0.08 }).pY, 0.05, 1e-9],
        // python3 -I -c "print(0.325**2-0.275**2)"   (densità 2x, x = 0,3)
        ['densità 2x, x², x = 0,3: area sotto f_Y', calc({ law: 'l2', g: 'sq', x: 0.3 }).pY, 0.03, 1e-12],
        // area totale 1 (la densità di Y è davvero una densità)
        ['area totale di f_Y: −ln, uniforme, da 0 a 40', tot('u', 'ln', 0, 40), 1, 1e-9],
        ['area totale di f_Y: −ln, 3x², da 0 a 20', tot('l3', 'ln', 0, 20), 1, 1e-9],
        ['area totale di f_Y: 1 − 2x, 3x², da −1 a 1', tot('l3', 'lin', -1, 1), 1, 1e-9],
        ['area totale di f_Y: x², 3x², da 0 a 1', tot('l3', 'sq', 1e-12, 1), 1, 1e-4],
        // python3 -I -c "import math; print(-math.log(0.37))"   (x del testo: y = −ln 0,37)
        ['y = g(x) predefinito', cD.y, 0.9942522733438669, 1e-15],
        // python3 -I -c "print(1/0.37)"
        ['|g′(x)| = 1/x predefinito', cD.dgx, 2.7027027027027026, 1e-12],
        // f_Y(y) = f_X(x)·1/|g′(x)| = 0,37: python3 -I -c "print(1*0.37)"
        ['f_Y(y) predefinito = 0,37', cD.fy, 0.37, 1e-14],
        // python3 -I -c "import math; print(math.log(0.395/0.345))"
        ['dy predefinito = ln(0,395/0,345)', cD.yb - cD.ya, 0.13534134786976224, 1e-14],
        // nel disegno: il punto sul grafico di g sta in cx = 64 + (0,37+0,1)/1,2·272 e cy = 352 − (y+0,4)/4,4·192
        // python3 -I -c "import math; print(64+(0.37+0.1)/1.2*272, 352-(-math.log(0.37)+0.4)/4.4*192)"
        ['disegno: ascissa del punto su g', +attr(cerchi[1], 'cx'), 170.53333333333333, 0.01],
        ['disegno: quota del punto su g', +attr(cerchi[1], 'cy'), 291.15990079954037, 0.01],
        // le due strisce: larghezza 0,05/1,2·272 e altezza ln(0,395/0,345)/4,4·192
        // python3 -I -c "import math; print(0.05/1.2*272, math.log(0.395/0.345)/4.4*192)"
        ['disegno: larghezza della striscia di x', +attr(bande[0], 'width'), 11.333333333333334, 0.01],
        ['disegno: altezza della striscia di y', +attr(bande[1], 'height'), 5.905804270680529, 0.01],
        ['la lettura riporta 0,994, 0,37 e 0,0500', ['0,994', '0,37', '0,0500', '2,703'].every((t) => out.includes(t)) ? 1 : 0, 1, 0],
        // x² con densità 2x in x = 0,3 (l'ultimo preset): f_Y = 1; punti del disegno
        // python3 -I -c "print(64+0.4/1.2*272, 352-(0.09+0.1)/1.2*192, 388+1/1.15*152)"
        ['disegno (X² con 2x): ascissa del punto su g', +attr(tags(W.render({ law: 'l2', g: 'sq', x: 0.3 }).svg, 'circle')[1], 'cx'), 154.66666666666669, 0.01],
        ['disegno (X² con 2x): quota del punto su g', +attr(tags(W.render({ law: 'l2', g: 'sq', x: 0.3 }).svg, 'circle')[1], 'cy'), 321.6, 0.01],
        ['disegno (X² con 2x): ascissa del punto su f_Y (altezza 1)', +attr(tags(W.render({ law: 'l2', g: 'sq', x: 0.3 }).svg, 'circle')[2], 'cx'), 520.1739130434783, 0.01],
        // python3 -I -c "print(3*0.08**2, 3*0.08**2*0.5)"
        ['la lettura con 3x² e 1 − 2x in 0,08 riporta 0,0192 e 0,0096', ['0,0192', '0,0096'].every((t) => W.render({ law: 'l3', g: 'lin', x: 0.08 }).out.includes(t)) ? 1 : 0, 1, 0],
      ];
    },
  });
})();

/* ---- esponenziale.js (sezione 3.20) ---- */
(function () {
  'use strict';
  /* 3.20 · Legge esponenziale: l'assenza di memoria (la coda dopo s, rialzata, è la coda di prima) */
  const { n, sci, v, p: P } = GI;
  const { tx, txc, ln, circ, path, C, SANS } = GI.H;

  /* area del disegno: due riquadri affiancati, a sinistra la coda, a destra il pezzo dopo s rialzato */
  const XMAX = 4; // minuti mostrati sull'asse
  const T = 78, B = 252;
  const L1 = 46, R1 = 236, L2 = 358, R2 = 548;
  const X1 = P.scale(0, XMAX, L1, R1), X2 = P.scale(0, XMAX, L2, R2), Y = P.scale(0, 1, B, T);

  function calc(s) {
    const lam = s.lam, a = s.s, t = s.t;
    const tail = (x) => Math.exp(-lam * x); // P(X > x) = e^(−λx)
    const ps = tail(a), pst = tail(a + t), pt = tail(t);
    return { lam, s: a, t, tail, ps, pst, pt, ratio: pst / ps };
  }

  /* ---------- formati dei numeri nella lettura ---------- */
  const trim = (x) => (x.includes(',') ? x.replace(/0+$/, '').replace(/,$/, '') : x);
  /* probabilità: 4 decimali, 1 esatto, notazione scientifica sotto 0,001 */
  const pr = (x) => (x > 0.99995 ? '1' : x >= 0.001 ? n(x, 4) : sci(x, 3));
  /* esponente di e: −λ·x con al più tre decimali (λ ha due decimali, s e t uno) */
  const E = (x) => '<var>e</var><sup>' + (x === 0 ? '0' : '−' + trim(n(x, 3))) + '</sup>';

  GI.add('esponenziale', {
    sec: '3.20',
    title: 'Dopo aver aspettato, l’attesa riparte da zero',
    w: 560,
    h: 306,
    alt: 'Due grafici affiancati. A sinistra la coda dell’esponenziale: una curva blu che scende da 1 verso 0 al passare dei minuti; dal minuto s in poi la curva è arancione, con due punti arancioni in s e in s più t. Una freccia porta al grafico di destra: lì il pezzo arancione, diviso per la sua altezza in s e fatto ripartire da 0, è una linea tratteggiata arancione che cade esattamente sulla curva blu della coda. Muovendo il ritmo λ le curve scendono più o meno in fretta; muovendo s e t si spostano i punti a sinistra, ma la curva a destra non cambia mai forma. I numeri precisi sono scritti sotto il disegno.',
    controls: [
      { id: 'lam', label: 'Ritmo <var>λ</var> (clienti al minuto)', min: 0.25, max: 4, step: 0.05, value: 2, fmt: (x) => trim(n(x, 2)) },
      { id: 's', label: 'Minuti già trascorsi <var>s</var>', min: 0, max: 2.5, step: 0.1, value: 1, fmt: (x) => trim(n(x, 1)) },
      { id: 't', label: 'Minuti ancora da aspettare <var>t</var>', min: 0.1, max: 1.5, step: 0.1, value: 0.5, fmt: (x) => trim(n(x, 1)) },
    ],
    presets: [
      { label: 'L’esempio del testo', set: { lam: 2, s: 1, t: 0.5 } },
      { label: 'Si comincia ora (s = 0)', set: { lam: 2, s: 0, t: 0.5 } },
      { label: 'Dopo 2,5 minuti senza clienti', set: { lam: 2, s: 2.5, t: 0.5 } },
      { label: 'Un cliente ogni 4 minuti', set: { lam: 0.25, s: 2, t: 1 } },
    ],
    caption: 'Attesa del prossimo cliente a uno sportello, con <var>λ</var> clienti al minuto. A sinistra, la curva blu è la coda <var>P</var>(<var>X</var> &gt; <var>x</var>) = <var>e</var><sup>−<var>λx</var></sup>: la probabilità di aspettare più di <var>x</var> minuti. Se sono già passati <var>s</var> minuti senza clienti, resta il pezzo arancione, la parte della coda dopo <var>s</var>. A destra lo stesso pezzo, tratteggiato, è fatto ripartire da 0 e rialzato, cioè diviso per <var>P</var>(<var>X</var> &gt; <var>s</var>), così che parta da 1: cade sulla curva blu di prima. È l’assenza di memoria.',
    prove: [
      'Con <var>λ</var> = 2, porta <var>s</var> a 2,5 minuti: a sinistra il pezzo arancione si schiaccia sull’asse. Che cosa succede alla curva a destra e alla probabilità di dover aspettare ancora più di <var>t</var> minuti?',
      'Alza il ritmo <var>λ</var> da 0,25 a 4: la probabilità di dover aspettare ancora più di <var>t</var> minuti sale o scende? Il punto arancione a destra resta sulla curva blu?',
    ],
    calc,
    render(s) {
      const c = calc(s), tail = c.tail;
      const xs = X1(c.s), xst = X1(c.s + c.t), xt = X2(c.t);
      const guide = { stroke: C.B, sw: 1.6, da: '5 4', so: 0.8 };
      const halo = { stroke: C.paper, sw: 4, lj: 'round', paint_order: 'stroke' };
      const axes = (X, l, r, xl) => P.axes({ X, Y, box: [l, T, r, B], xt: [0, 1, 2, 3, 4], yt: [0, 0.5, 1], xf: (x) => n(x, 0), yf: (y) => n(y, y === 0.5 ? 1 : 0), xl, grid: true });
      let svg = '';

      /* titoli dei due riquadri */
      svg += txc((L1 + R1) / 2, 28, [['La coda ', C.A], ['e il pezzo dopo *s*', C.B]], { ff: SANS, size: 17, fw: 700 });
      svg += tx((L2 + R2) / 2, 28, 'Dopo *s*, rialzata', { ff: SANS, size: 17, fw: 700, fill: C.B });
      svg += axes(X1, L1, R1, '*x* (minuti)') + axes(X2, L2, R2, '*t* (minuti)');

      /* a sinistra: la coda, e il pezzo che resta dopo s */
      svg += ln(xs, B, xs, T, guide) + ln(xst, B, xst, T, guide);
      svg += P.curve(tail, 0, XMAX, X1, Y, 120, { sw: 3 });
      svg += P.curve(tail, c.s, XMAX, X1, Y, 80, { stroke: C.B, sw: 4 });
      svg += circ(xs, Y(c.ps), 5.5, { fill: C.B, stroke: C.paper, sw: 2 }) + circ(xst, Y(c.pst), 5.5, { fill: C.B, stroke: C.paper, sw: 2 });
      const near = xst - xs < 46; // s e s+t troppo vicini: le due etichette si dispongono ai lati
      svg += tx(near ? xs - 3 : xs, T - 10, '*s*', { size: 17, fill: C.B, ta: near ? 'end' : 'middle' });
      svg += tx(near ? xst + 3 : xst, T - 10, '*s*+*t*', { size: 17, fill: C.B, ta: near ? 'start' : 'middle' });

      /* la freccia: si divide per P(X > s) */
      const ym = (T + B) / 2, xa = R1 + 14, xb = L2 - 46;
      svg += ln(xa, ym, xb - 2, ym, { stroke: C.soft, sw: 2 }) + path(`M${xb} ${ym}l-9 -5.5v11z`, { fill: C.soft, stroke: 'none' });
      svg += tx((xa + xb) / 2, ym - 10, '÷ *P*(*X*>*s*)', { ff: SANS, size: 16, fill: C.soft });

      /* a destra: il pezzo dopo s, rialzato e da 0 (tratteggio arancione), sopra la coda (blu) */
      svg += ln(xt, B, xt, T, guide);
      svg += P.curve(tail, 0, XMAX, X2, Y, 120, { sw: 5 });
      svg += P.curve((u) => tail(c.s + u) / c.ps, 0, XMAX, X2, Y, 120, { stroke: C.B, sw: 2.6, da: '8 7', lc: 'butt' });
      svg += circ(X2(0), Y(1), 5.5, { fill: C.B, stroke: C.paper, sw: 2 }) + circ(xt, Y(c.ratio), 5.5, { fill: C.B, stroke: C.paper, sw: 2 });
      svg += tx(xt, T - 10, '*t*', { size: 17, fill: C.B });
      svg += tx(R2 - 4, T + 24, 'coincide con', { ff: SANS, size: 17, fill: C.A, ta: 'end', ...halo });
      svg += tx(R2 - 4, T + 44, 'la coda', { ff: SANS, size: 17, fill: C.A, ta: 'end', ...halo });

      const a = c.lam * (c.s + c.t), b = c.lam * c.s, d = c.lam * c.t;
      const lam = v('λ'), S = v('s'), Tt = v('t'), X = v('X');
      const out = `<p>${v('P')}(${X} &gt; ${S}+${Tt}) = ${v('e')}<sup>−${lam}(${S}+${Tt})</sup> = ${E(a)} = <b>${pr(c.pst)}</b>; ${v('P')}(${X} &gt; ${S}) = ${v('e')}<sup>−${lam}${S}</sup> = ${E(b)} = <b>${pr(c.ps)}</b>.</p>
  <p>Il loro rapporto: ${v('P')}(${X} &gt; ${S}+${Tt} | ${X} &gt; ${S}) = ${E(a)} / ${E(b)} = ${E(d)} = <span class="gi-hl">${pr(c.ratio)}</span>. Partendo da zero: ${v('P')}(${X} &gt; ${Tt}) = ${v('e')}<sup>−${lam}${Tt}</sup> = ${E(d)} = <span class="gi-hl">${pr(c.pt)}</span>. Sono uguali.</p>`;
      return { svg, out };
    },
    selftest() {
      const W = GI.widgets.esponenziale, d = GI.defaults(W), out = W.render(d).out;
      /* area sotto la densità λe^(−λu) da x all'infinito, con la regola di Simpson (senza usare la formula chiusa della coda) */
      const area = (lam, x) => {
        const top = x + 40 / lam, N = 4000, h = (top - x) / N;
        let sum = 0;
        for (let i = 0; i <= N; i++) sum += (i === 0 || i === N ? 1 : i % 2 ? 4 : 2) * lam * Math.exp(-lam * (x + i * h));
        return (sum * h) / 3;
      };
      const tags = (svg, name) => svg.match(new RegExp('<' + name + '\\s[^>]*>', 'g')) || [];
      const attr = (tag, a) => { const m = tag.match(new RegExp('\\s' + a + '="([^"]*)"')); return m ? m[1] : ''; };
      /* i due tratti del riquadro di destra: la coda (spessore 5) e il pezzo rialzato (tratteggio) */
      const dueCurve = (st) => {
        const ps = tags(W.render(st).svg, 'path');
        return [ps.find((p) => attr(p, 'stroke-width') === '5'), ps.find((p) => attr(p, 'stroke-dasharray') === '8 7')].map((p) => attr(p, 'd'));
      };
      const [blu0, arancio0] = dueCurve({ lam: 2, s: 0, t: 0.5 }), [blu1, arancio1] = dueCurve(d), [blu2, arancio2] = dueCurve({ lam: 0.7, s: 2.5, t: 1.5 });
      const cerchi = tags(W.render(d).svg, 'circle');
      return [
        // python3 -I -c "import math; print(math.exp(-3))"
        ['P(X > s+t) del testo = e^(−3)', calc(d).pst, 0.049787068367863944, 1e-15],
        // python3 -I -c "import math; print(math.exp(-2))"
        ['P(X > s) del testo = e^(−2)', calc(d).ps, 0.1353352832366127, 1e-15],
        // python3 -I -c "import math; print(math.exp(-1))"
        ['il rapporto del testo = e^(−1)', calc(d).ratio, 0.36787944117144233, 1e-15],
        ['P(X > t) del testo = e^(−1)', calc(d).pt, 0.36787944117144233, 1e-15],
        // python3 -I -c "import math; print(math.exp(-0.75), math.exp(-0.5), math.exp(-0.25))"   (λ = 0,25, s = 2, t = 1)
        ['un cliente ogni 4 minuti: P(X > s+t) = e^(−0,75)', calc({ lam: 0.25, s: 2, t: 1 }).pst, 0.4723665527410147, 1e-15],
        ['un cliente ogni 4 minuti: P(X > s) = e^(−0,5)', calc({ lam: 0.25, s: 2, t: 1 }).ps, 0.6065306597126334, 1e-15],
        ['un cliente ogni 4 minuti: rapporto = e^(−0,25)', calc({ lam: 0.25, s: 2, t: 1 }).ratio, 0.7788007830714049, 1e-15],
        // python3 -I -c "import math; print(math.exp(-16), math.exp(-10), math.exp(-6))"   (λ = 4, s = 2,5, t = 1,5)
        ['estremo λ = 4, s = 2,5, t = 1,5: P(X > s+t) = e^(−16)', calc({ lam: 4, s: 2.5, t: 1.5 }).pst, 1.1253517471925912e-07, 1e-20],
        ['estremo: P(X > s) = e^(−10)', calc({ lam: 4, s: 2.5, t: 1.5 }).ps, 4.5399929762484854e-05, 1e-18],
        ['estremo: rapporto = e^(−6)', calc({ lam: 4, s: 2.5, t: 1.5 }).ratio, 0.0024787521766663585, 1e-15],
        // python3 -I -c "import math; print(math.exp(-5))"   (λ = 2, s = 2,5: soltanto lo 0,67 % delle attese supera 2,5 minuti)
        ['dopo 2,5 minuti: P(X > s) = e^(−5)', calc({ lam: 2, s: 2.5, t: 0.5 }).ps, 0.006737946999085467, 1e-15],
        ['con s = 0 il rapporto è proprio P(X > t)', calc({ lam: 1.3, s: 0, t: 0.7 }).ratio, calc({ lam: 1.3, s: 0, t: 0.7 }).pt, 1e-15],
        ['P(X > 0) = 1', calc({ lam: 3, s: 0, t: 1 }).ps, 1, 0],
        // la coda come area sotto la densità, calcolata con la regola di Simpson
        ['coda = area sotto la densità (λ = 2, x = 1)', area(2, 1), calc(d).ps, 1e-9],
        ['coda = area sotto la densità (λ = 0,25, x = 3)', area(0.25, 3), Math.exp(-0.75), 1e-9],
        // il rapporto delle due aree, senza passare dalla formula della coda
        ['rapporto di aree = P(X > t) (λ = 1,7, s = 0,9, t = 0,6)', area(1.7, 1.5) / area(1.7, 0.9), Math.exp(-1.7 * 0.6), 1e-9],
        // nel disegno: la curva tratteggiata arancione e la coda blu a destra sono lo stesso tracciato, per ogni s
        ['disegno, s = 0: pezzo rialzato = coda', arancio0 === blu0 && blu0 ? 1 : 0, 1, 0],
        ['disegno, s = 1: pezzo rialzato = coda', arancio1 === blu1 && blu1 ? 1 : 0, 1, 0],
        ['disegno, s = 2,5, λ = 0,7: pezzo rialzato = coda', arancio2 === blu2 && blu2 ? 1 : 0, 1, 0],
        // il punto in s sulla coda sta a quota e^(−2) (altezza 174 pixel): python3 -I -c "import math; print(252 - math.exp(-2) * 174)"
        ['disegno: altezza del punto in s', +attr(cerchi[0], 'cy'), 228.4516607168294, 0.01],
        // python3 -I -c "import math; print(252 - math.exp(-3) * 174)"
        ['disegno: altezza del punto in s+t', +attr(cerchi[1], 'cy'), 243.3370501039917, 0.01],
        // a destra il punto in t sta a quota e^(−1): python3 -I -c "import math; print(252 - math.exp(-1) * 174)"
        ['disegno: altezza del punto in t a destra', +attr(cerchi[3], 'cy'), 187.98897723616903, 0.01],
        ['la lettura riporta 0,0498, 0,1353 e 0,3679', ['0,0498', '0,1353', '0,3679'].every((x) => out.includes(x)) ? 1 : 0, 1, 0],
        ['la lettura con s = 2,5 e λ = 4 usa la notazione scientifica', W.render({ lam: 4, s: 2.5, t: 1.5 }).out.includes('4,54\u00a0×\u00a010<sup>−5</sup>') ? 1 : 0, 1, 0],
      ];
    },
  });
})();

/* ---- convoluzione.js (sezione 3.21) ---- */
(function () {
  'use strict';
  /* 3.21 · Convoluzione: f_{X+Y}(z) = ∫ f_X(x) f_Y(z − x) dx, la densità della somma costruita punto per punto */
  const { n, v, p: P } = GI;
  const { tx, ln, circ, rect, path, f, C, SANS } = GI.H;

  /* area del disegno: due riquadri uno sopra l'altro, con lo stesso asse orizzontale (x sopra, z sotto) */
  const XA = -1, XB = 5;
  const L = 46, R = 540;
  const T1 = 48, B1 = 170; // riquadro in alto: f_X(x), f_Y(z − x), area del prodotto
  const T2 = 252, B2 = 350; // riquadro in basso: la densità della somma
  const X = P.scale(XA, XB, L, R);
  const VERDE = 'var(--verde)';

  /* ---------- le due leggi del testo: uniforme su [0, 1] (Esempio 1) ed esponenziale di ritmo λ (Esempio 2); X e Y hanno la stessa legge ---------- */
  const dens = (law, lam) => (law === 'unif' ? (x) => (x >= 0 && x <= 1 ? 1 : 0) : (x) => (x >= 0 ? lam * Math.exp(-lam * x) : 0));
  const top = (law, lam) => (law === 'unif' ? 1 : lam); // altezza massima della densità

  /* regola di Gauss a 5 punti, ripetuta su più pezzi: integrale numerico di una funzione liscia */
  const GN = [-0.906179845938664, -0.5384693101056831, 0, 0.5384693101056831, 0.906179845938664];
  const GW = [0.2369268850561891, 0.4786286704993665, 0.5688888888888889, 0.4786286704993665, 0.2369268850561891];
  function integ(fn, a, b, panels = 8) {
    if (!(b > a)) return 0;
    const h = (b - a) / panels;
    let sum = 0;
    for (let i = 0; i < panels; i++) {
      const m = a + (i + 0.5) * h;
      for (let k = 0; k < 5; k++) sum += GW[k] * fn(m + 0.5 * h * GN[k]);
    }
    return (sum * h) / 2;
  }

  /* dove il prodotto f_X(x) f_Y(z − x) non è nullo: da max(0, z − 1) a min(1, z) per le uniformi, da 0 a z per le esponenziali */
  function overlap(s, z) {
    const U = s.law === 'unif';
    return [Math.max(0, U ? z - 1 : -Infinity), Math.min(U ? 1 : Infinity, z)];
  }
  /* la convoluzione in z: area sotto il prodotto (liscio nell'intervallo, senza salti) */
  function conv(s, z) {
    const [lo, hi] = overlap(s, z), fx = dens(s.law, s.lamX), fy = dens(s.law, s.lamY);
    return hi > lo ? integ((x) => fx(x) * fy(z - x), lo, hi) : 0;
  }
  /* la densità della somma su una griglia fitta, da −1 a 5 con passo 0,025 (0, 1, 1,5 e 2 sono nodi) */
  const GRID = Array.from({ length: 241 }, (_, i) => XA + i / 40);
  const sumCurve = (s) => GRID.map((w) => conv(s, w));

  /* le formule scritte nel testo, per il confronto: due uniformi (triangolo) e due esponenziali dello stesso ritmo */
  function formula(s, z) {
    if (s.law === 'unif') return z < 0 ? 0 : z <= 1 ? z : z <= 2 ? 2 - z : 0;
    if (Math.abs(s.lamX - s.lamY) < 1e-9) return z > 0 ? s.lamX * s.lamX * z * Math.exp(-s.lamX * z) : 0;
    return null;
  }

  /* tratto di una densità, con i salti disegnati verticali: punti della griglia più i due lati di ogni salto */
  function shape(fn, breaks, a, b, steps) {
    const e = 1e-9, pts = [];
    for (let i = 0; i <= steps; i++) { const x = a + ((b - a) * i) / steps; pts.push([x, fn(x)]); }
    for (const k of breaks) if (k > a && k < b) pts.push([k - e, fn(k - e)], [k + e, fn(k + e)]);
    pts.sort((p, q) => p[0] - q[0]);
    return pts;
  }

  /* ---------- formati dei numeri ---------- */
  const trim = (x) => (x.includes(',') ? x.replace(/0+$/, '').replace(/,$/, '') : x);
  const num = (x, d = 2) => trim(n(x, d));
  const fsum = '<var>f</var><sub><var>X</var>+<var>Y</var></sub>';

  GI.add('convoluzione', {
    sec: '3.21',
    title: 'La densità della somma, punto per punto',
    w: 560,
    h: 402,
    alt: 'Due grafici uno sopra l’altro, con lo stesso asse orizzontale. In alto: la densità di X in blu, la densità di Y ribaltata e spostata in z in arancione, e in verde l’area del loro prodotto. In basso: la densità della somma X + Y, con un punto verde al valore z la cui altezza è quell’area; muovendo z il punto percorre la curva. Di partenza due uniformi su [0, 1] con z = 0,5: la curva in basso è un triangolo con il picco in 1. Si sceglie se X e Y siano due uniformi o due esponenziali, e il ritmo di ciascuna esponenziale; i numeri precisi sono scritti sotto il disegno.',
    controls: [
      { id: 'z', label: 'Valore <var>z</var> della somma', min: 0, max: 5, step: 0.05, value: 0.5, fmt: (x) => n(x, 2), limits: (s) => [0, s.law === 'unif' ? 2.5 : 5] },
      { id: 'law', kind: 'select', label: 'Le due variabili', value: 'unif', options: [['unif', 'Due uniformi su [0, 1]'], ['exp', 'Due esponenziali']] },
      { id: 'lamX', label: 'Ritmo <var>λ</var> di <var>X</var>', min: 0.5, max: 2.5, step: 0.25, value: 1, fmt: (x) => num(x, 2), show: (s) => s.law === 'exp' },
      { id: 'lamY', label: 'Ritmo <var>λ</var> di <var>Y</var>', min: 0.5, max: 2.5, step: 0.25, value: 1, fmt: (x) => num(x, 2), show: (s) => s.law === 'exp' },
    ],
    presets: [
      { label: 'Esempio 1: due numeri a caso', set: { z: 0.5, law: 'unif', lamX: 1, lamY: 1 } },
      { label: 'Esempio 2: due attese in sequenza', set: { z: 1.5, law: 'exp', lamX: 1, lamY: 1 } },
      { label: 'Due ritmi diversi (0,5 e 2)', set: { z: 2, law: 'exp', lamX: 0.5, lamY: 2 } },
      { label: 'z = 2,5: nessun x ammesso', set: { z: 2.5, law: 'unif', lamX: 1, lamY: 1 } },
    ],
    caption: 'In alto, per il valore <var>z</var> scelto: la densità di <var>X</var> (blu) e quella di <var>Y</var> ribaltata e spostata in <var>z</var>, cioè <var>f</var><sub><var>Y</var></sub>(<var>z</var> − <var>x</var>) (arancione). L’area verde è l’integrale del prodotto delle due curve: è il valore di <var>f</var><sub><var>X</var>+<var>Y</var></sub>(<var>z</var>). In basso quel valore è l’altezza del punto verde al posto <var>z</var>; la parte piena della curva è quella già percorsa da <var>z</var>.',
    prove: [
      'Con due uniformi su [0, 1] fai scorrere <var>z</var> da 0 a 2: come cambia l’area verde, e che forma disegna il punto nel grafico sotto?',
      'Con due esponenziali dello stesso ritmo, perché la curva in basso parte da 0 mentre ciascuna densità parte da <var>λ</var>? Guarda l’area verde con <var>z</var> piccolo.',
    ],
    conv,
    render(s) {
      const z = s.z, U = s.law === 'unif', fx = dens(s.law, s.lamX), fy = dens(s.law, s.lamY);
      const mx = top(s.law, s.lamX), my = top(s.law, s.lamY);
      const ym1 = Math.max(mx, my, mx * my) * 1.1; // il prodotto non supera mai mx·my
      const Y1 = P.scale(0, ym1, B1, T1);
      const fs = sumCurve(s), val = conv(s, z);
      const ym2 = Math.max(...fs, 1e-9) * 1.12;
      const Y2 = P.scale(0, ym2, B2, T2);
      const xt = [-1, 0, 1, 2, 3, 4, 5], xf = (x) => n(x, 0), yf = (y) => num(y, 2);
      const xz = X(z);
      let svg = '';

      /* legenda del riquadro in alto */
      svg += ln(L, 17, L + 22, 17, { stroke: C.A, sw: 3.5 }) + tx(L + 28, 24, '*f*_X(*x*)', { size: 20, fill: C.A, ta: 'start' });
      svg += ln(148, 17, 170, 17, { stroke: C.B, sw: 3.5 }) + tx(176, 24, '*f*_Y(*z*−*x*)', { size: 20, fill: C.B, ta: 'start' });
      svg += rect(290, 10, 14, 14, { fill: VERDE, fo: 0.45, stroke: VERDE, sw: 1.5 }) + tx(310, 23, 'area del prodotto', { ff: SANS, size: 16, fill: C.soft, ta: 'start' });

      svg += P.axes({ X, Y: Y1, box: [L, T1, R, B1], xt, yt: P.nice(0, ym1, 2), xf, yf, xl: '*x*', grid: true });
      svg += P.axes({ X, Y: Y2, box: [L, T2, R, B2], xt, yt: P.nice(0, ym2, 2), xf, yf, xl: '*z*', grid: true });
      svg += tx(L, T2 - 12, '*f*_{X+Y}(*z*)', { size: 20, fill: VERDE, ta: 'start' });

      /* il valore z, su tutti e due i riquadri */
      svg += ln(xz, T1 - 2, xz, B2, { stroke: C.soft, sw: 1.5, da: '5 4', so: 0.8 });
      svg += tx(xz, T1 - 8, '*z*', { size: 17, fill: C.soft });

      /* in alto: l'area del prodotto, poi le due densità (la seconda ribaltata e spostata in z) */
      const [lo, hi] = overlap(s, z);
      if (hi > lo) {
        const N = 60, xs = [], ys = [];
        for (let i = 0; i <= N; i++) { const x = lo + ((hi - lo) * i) / N; xs.push(x); ys.push(fx(x) * fy(z - x)); }
        svg += path(P.pts(xs, ys, X, Y1) + `L${f(X(hi))} ${f(B1)}L${f(X(lo))} ${f(B1)}Z`, { fill: VERDE, fo: 0.4, stroke: VERDE, sw: 2, lj: 'round' });
      }
      const brX = U ? [0, 1] : [0], brY = U ? [z - 1, z] : [z];
      const pa = shape(fx, brX, XA, XB, 120), pb = shape((x) => fy(z - x), brY, XA, XB, 120);
      svg += path(P.pts(pa.map((p) => p[0]), pa.map((p) => p[1]), X, Y1), { stroke: C.A, sw: 4.5, lc: 'round', lj: 'round' });
      svg += path(P.pts(pb.map((p) => p[0]), pb.map((p) => p[1]), X, Y1), { stroke: C.B, sw: 2.6, lc: 'round', lj: 'round' });

      /* in basso: la curva intera (sfumata), la parte già percorsa da z (piena) e il punto */
      svg += path(P.pts(GRID, fs, X, Y2), { stroke: VERDE, sw: 2.5, so: 0.35, lc: 'round', lj: 'round' });
      const gx = [], gy = [];
      GRID.forEach((w, i) => { if (w >= 0 && w < z) { gx.push(w); gy.push(fs[i]); } });
      gx.push(z); gy.push(val);
      const built = P.pts(gx, gy, X, Y2);
      svg += path(built, { stroke: VERDE, sw: 4, lc: 'round', lj: 'round' });
      svg += circ(xz, Y2(val), 6.5, { fill: VERDE, stroke: C.paper, sw: 2.2 });

      /* lettura */
      const Z = v('z'), lam = v('λ'), e = v('e');
      const fo = formula(s, z);
      let out = `<p>${fsum}(${Z}) con ${Z} = ${num(z, 2)}: l’area verde, cioè l’integrale del prodotto, vale <span class="gi-hl">${n(val, 4)}</span>.</p>`;
      if (U) {
        const a = Math.max(0, z - 1), b = Math.min(1, z);
        out += b > a
          ? `<p>Il prodotto vale 1 solo per max(0, ${Z} − 1) &lt; ${v('x')} &lt; min(1, ${Z}), cioè per ${num(a, 2)} &lt; ${v('x')} &lt; ${num(b, 2)}: l’intervallo è lungo ${num(b - a, 2)}, e quella è l’area.</p>`
          : `<p>Non resta nessun ${v('x')}: servirebbe ${num(a, 2)} &lt; ${v('x')} &lt; ${num(b, 2)}, cioè max(0, ${Z} − 1) &lt; ${v('x')} &lt; min(1, ${Z}), e questo intervallo è vuoto. L’area è 0.</p>`;
      }
      if (fo === null) {
        out += `<p>Con ritmi diversi la formula ${lam}<sup>2</sup> ${Z} ${e}<sup>−${lam}${Z}</sup> non vale più: il valore è quello dell’integrale, calcolato sommando tante strisce sottili.</p>`;
      } else {
        const same = Math.abs(fo - val) < 1e-7;
        const verdetto = same ? ', e coincide con l’area verde.' : `, mentre l’area verde vale ${n(val, 4)}.`;
        if (U) {
          const qui = z > 1 && z <= 2 ? `qui 2 − ${num(z, 2)} = ` : 'qui vale ';
          out += `<p>Con la formula del testo (${fsum}(${Z}) = ${Z} per 0 ≤ ${Z} ≤ 1, 2 − ${Z} per 1 ≤ ${Z} ≤ 2, 0 altrove): ${qui}<b>${n(fo, 4)}</b>${verdetto}</p>`;
        } else {
          out += `<p>Con la formula del testo, ${lam}<sup>2</sup> ${Z} ${e}<sup>−${lam}${Z}</sup> = ${num(s.lamX, 2)}<sup>2</sup> · ${num(z, 2)} · ${e}<sup>${z === 0 ? '0' : '−' + num(s.lamX * z, 3)}</sup> = <b>${n(fo, 4)}</b>${verdetto}</p>`;
        }
      }
      return { svg, out };
    },
    selftest() {
      const W = GI.widgets.convoluzione, d = GI.defaults(W), r = W.render(d);
      const UU = { ...d, law: 'unif' };
      const EE = (a, b) => ({ ...d, law: 'exp', lamX: a, lamY: b });
      const tags = (svg, name) => svg.match(new RegExp('<' + name + '\\s[^>]*>', 'g')) || [];
      const attr = (tag, a) => { const m = tag.match(new RegExp('\\s' + a + '="([^"]*)"')); return m ? +m[1] : NaN; };
      /* area sotto una parte della curva in basso, con la regola dei trapezi sulla griglia */
      const trap = (s, a, b) => { const fs = sumCurve(s); let t = 0; for (let i = 0; i < 240; i++) if (GRID[i] >= a - 1e-9 && GRID[i + 1] <= b + 1e-9) t += ((fs[i] + fs[i + 1]) / 2) / 40; return t; };
      const dot = tags(r.svg, 'circle').find((c) => attr(c, 'r') === 6.5);
      /* l'area del poligono verde in alto (formula dei lacci), riportata alle unità del grafico: 494/6 pixel per unità in x, 122/ym1 in y */
      const verde = (st, ym1) => {
        const dd = W.render(st).svg.match(/<path d="([^"]*)" fill="var\(--verde\)" fill-opacity="0\.4"/)[1];
        const q = [...dd.matchAll(/[ML]([-\d.]+) ([-\d.]+)/g)].map((m) => [+m[1], +m[2]]);
        let a = 0;
        for (let i = 0; i < q.length; i++) { const [x1, y1] = q[i], [x2, y2] = q[(i + 1) % q.length]; a += x1 * y2 - x2 * y1; }
        return Math.abs(a) / 2 / (494 / 6) / (122 / ym1);
      };
      return [
        // python3 -I -c "print(1 - abs(1.5 - 1))"   (triangolo: 2 − z per 1 ≤ z ≤ 2)
        ['due uniformi, z = 1,5: triangolo = 2 − z', conv(UU, 1.5), 0.5, 1e-12],
        ['due uniformi, z = 0,3: triangolo = z', conv(UU, 0.3), 0.3, 1e-12],
        ['due uniformi, z = 1: il picco vale 1', conv(UU, 1), 1, 1e-12],
        ['due uniformi, z = 2,5: nessun x, area 0', conv(UU, 2.5), 0, 0],
        // python3 -I -c "import math; print(1.5*math.exp(-1.5))"   (λ = 1: λ²·z·e^(−λz))
        ['due esponenziali di ritmo 1, z = 1,5: λ²ze^(−λz)', conv(EE(1, 1), 1.5), 0.33469524022264474, 1e-10],
        // python3 -I -c "import math; print(4*0.8*math.exp(-1.6))"   (λ = 2, z = 0,8)
        ['due esponenziali di ritmo 2, z = 0,8', conv(EE(2, 2), 0.8), 0.6460688575828972, 1e-10],
        // python3 -I -c "import math; print(2*(math.exp(-1)-math.exp(-2)))"   (la «Prova tu»: ritmi 1 e 2, z = 1)
        ['ritmi 1 e 2, z = 1: 2(e^(−z) − e^(−2z))', conv(EE(1, 2), 1), 0.46508831586965926, 1e-10],
        // python3 -I -c "import math; print(2.5/1.5*(math.exp(-1.2)-math.exp(-3.0)))"   (ritmi 1 e 2,5, z = 1,2: λμ/(μ−λ)·(e^(−λz) − e^(−μz)))
        ['ritmi 1 e 2,5, z = 1,2', conv(EE(1, 2.5), 1.2), 0.4190119059072303, 1e-10],
        // python3 -I -c "import math; print((math.exp(-1.5)-math.exp(-6))/1.5)"   (ritmi 2 e 0,5, z = 3: λμ/(μ−λ)·(e^(−λz) − e^(−μz)) con λ = 2, μ = 0,5)
        ['ritmi 2 e 0,5, z = 3', conv(EE(2, 0.5), 3), 0.14710093864784232, 1e-10],
        // python3 -I -c "import math; print(0.5**2*3*math.exp(-1.5))"   (ritmo 0,5 per entrambe, z = 3: λ²ze^(−λz))
        ['due esponenziali di ritmo 0,5, z = 3', conv(EE(0.5, 0.5), 3), 0.16734762011132237, 1e-10],
        // python3 -I -c "import math; print(0.5*2/(2-0.5)*(math.exp(-0.5*2)-math.exp(-2*2)))"   (il preset «Due ritmi diversi»: ritmi 0,5 e 2, z = 2)
        ['ritmi 0,5 e 2, z = 2 (preset)', conv(EE(0.5, 2), 2), 0.23304253485513876, 1e-10],
        // la curva in basso è una densità: area totale 1, P(X+Y ≤ 1) = 1/2 e P(X+Y > 1,5) = 1/8, come nel testo
        ['due uniformi: area sotto la curva = 1', trap(UU, -1, 5), 1, 1e-9],
        ['due uniformi: P(X + Y ≤ 1) = 1/2', trap(UU, 0, 1), 0.5, 1e-9],
        ['due uniformi: P(X + Y > 1,5) = 1/8', trap(UU, 1.5, 5), 0.125, 1e-9],
        // python3 -I -c "import math; print(1-6*math.exp(-5))"   (area della densità λ²ze^(−λz) con λ = 1 fra 0 e 5; trapezi su passo 0,025)
        ['due esponenziali di ritmo 1: area fra 0 e 5', trap(EE(1, 1), 0, 5), 0.9595723180054871, 1e-4],
        // python3 -I -c "import math; print((1-math.exp(-1))**2)"   (la «Prova tu»: P(T ≤ 1) = (1 − e^(−1))² ≈ 0,3996, scritto nella soluzione del testo; trapezi su passo 0,025)
        ['ritmi 1 e 2: P(T ≤ 1) della «Prova tu»', trap(EE(1, 2), 0, 1), 0.39957640089372803, 3e-4],
        // il testo di partenza dice 0,5
        ['la lettura riporta 0,5000', r.out.includes('0,5000') ? 1 : 0, 1, 0],
        // il punto verde sta a z = 0,5 (x = 46 + 1,5/6·494) e a quota 0,5 su una scala fino a 1,12 (y = 350 − 0,5/1,12·98)
        // python3 -I -c "print(46+1.5/6*494, 350-0.5/1.12*98)"
        ['disegno: ascissa del punto', attr(dot, 'cx'), 169.5, 0.01],
        ['disegno: altezza del punto', attr(dot, 'cy'), 306.25, 0.01],
        // python3 -I -c "print(1 - abs(1.5 - 1))"   (due uniformi, z = 1,5: lunghezza dell'intervallo 0,5; scala in alto fino a 1,1)
        ['disegno: area verde, due uniformi, z = 1,5', verde({ ...UU, z: 1.5 }, 1.1), 0.5, 2e-3],
        // python3 -I -c "import math; print(2*(math.exp(-1)-math.exp(-2)))"   (ritmi 1 e 2, z = 1; scala in alto fino a 2,2)
        ['disegno: area verde, ritmi 1 e 2, z = 1', verde({ ...EE(1, 2), z: 1 }, 2.2), 0.46508831586965926, 2e-3],
      ];
    },
  });
})();

/* ---- normale.js (sezione 3.30) ---- */
(function () {
  'use strict';
  /* 3.30 · La normale in pratica: standardizzare non cambia l'area */
  const { n, v, p: P } = GI;
  const { tx, ln, path, C, SANS } = GI.H;
  const { Phi, phi } = GI.m;

  const ZMAX = 4, LEFT = 52, RIGHT = 512, HC = 76; // il disegno arriva a 4 deviazioni standard dalla media
  const Zx = (z) => LEFT + ((z + ZMAX) / (2 * ZMAX)) * (RIGHT - LEFT);
  const whole = (x) => Math.abs(x - Math.round(x)) < 1e-9;
  const num = (x) => n(x, whole(x) ? 0 : 1);
  const zf = (z) => n(z, whole(z) ? 0 : 2);
  const p4 = (x) => n(x, 4);
  const r4 = (x) => Math.round(x * 1e4) / 1e4;
  const rz = (z) => Math.sign(z) * Math.round(Math.abs(z) * 100) / 100; // z con due decimali, come sulla tavola
  const NB = '\u00a0';
  const pctT = (x, vuota) => (vuota ? '0' + NB + '%' : x < 1e-4 ? 'meno di 0,01' + NB + '%' : GI.pct(x, x >= 0.01 ? 2 : 3));
  const zsub = (k) => v('z') + '<sub>' + v(k) + '</sub>';
  const phiRead = (z) => (z < 0 ? `Φ(${zf(z)}) = 1 − Φ(${zf(-z)}) = 1 − ${p4(Phi(-z))} = ${p4(Phi(z))}` : `Φ(${zf(z)}) = ${p4(Phi(z))}`);

  /* a, b: estremi; per «sopra» conta solo a (b = +∞), per «sotto» solo b (a = −∞) */
  function calc(s) {
    const fra = s.tipo === 'fra';
    const a = fra ? Math.min(s.a, s.b) : s.a, b = fra ? Math.max(s.a, s.b) : s.b;
    const za = (a - s.mu) / s.sigma, zb = (b - s.mu) / s.sigma;
    const L = s.tipo === 'sotto' ? -Infinity : za, R = s.tipo === 'sopra' ? Infinity : zb;
    const pL = L === -Infinity ? 0 : Phi(L), pR = R === Infinity ? 1 : Phi(R);
    // zat, zbt: z arrotondati come sulla tavola; pLt, pRt: Φ letta sulla tavola (cioè in zat e zbt)
    const zat = rz(za), zbt = rz(zb);
    return { a, b, za, zb, zat, zbt, L, R, pL, pR, pLt: Phi(zat), pRt: Phi(zbt), vuota: fra && a === b, area: Math.max(0, pR - pL) };
  }

  /* una campana: sempre la stessa figura, ridisegnata alta quanto il riquadro; cambia solo l'asse */
  function panel(o, c, tipo) {
    const yb = o.yb, top = yb - HC;
    const Y = (d) => yb - (d / phi(0)) * HC;
    let d = '';
    const lo = Math.max(c.L, -ZMAX), hi = Math.min(c.R, ZMAX);
    if (hi > lo) d += P.area(phi, lo, hi, Zx, Y, yb, 120, { fill: C.B, fo: 0.4 });
    d += P.curve(phi, -ZMAX, ZMAX, Zx, Y, 160);
    d += P.axes({ X: Zx, Y: () => yb, box: [LEFT, top, RIGHT, yb], noy: true, xt: [-3, -2, -1, 0, 1, 2, 3], xf: o.tick });
    // estremi: riga e lettera se stanno nel disegno, freccia se l'area continua oltre il bordo
    const arrows = { '-1': [], '1': [] };
    if (tipo === 'sotto') arrows['-1'].push('');
    if (tipo === 'sopra') arrows['1'].push('');
    const lim = [];
    if (tipo !== 'sotto') lim.push([c.za, o.la, 'end']);
    if (tipo !== 'sopra') lim.push([c.zb, o.lb, 'start']);
    for (const [z, lab, anc] of lim) {
      if (z < -ZMAX) arrows['-1'].push(lab);
      else if (z > ZMAX) arrows['1'].push(lab);
      else {
        const x = Zx(z);
        d += ln(x, yb, x, top - 14, { stroke: C.B, sw: 2.5 });
        d += tx(x + (anc === 'end' ? -6 : 6), top - 6, lab, { size: 20, fill: C.B, ta: anc, fw: 700 });
      }
    }
    for (const dir of [-1, 1]) {
      const list = arrows[dir];
      if (!list.length) continue;
      const x = dir < 0 ? LEFT : RIGHT, lab = list.filter(Boolean).join(', ');
      d += path(`M${x + 2 * dir} ${yb - 8}L${x + 15 * dir} ${yb}L${x + 2 * dir} ${yb + 8}Z`, { fill: C.B, stroke: 'none' });
      if (lab) d += tx(x + 12 * dir, yb - 14, lab, { size: 20, fill: C.B, ta: 'middle', fw: 700 });
    }
    d += tx(LEFT, top - 38, o.head, { size: 20, ta: 'start' });
    d += tx(RIGHT, top - 38, 'area ' + o.areaTxt, { ff: SANS, size: 17, fill: C.B, ta: 'end', fw: 700 });
    d += tx(RIGHT + 24, yb + 6, o.xname, { size: 20, fill: C.soft, ta: 'start' });
    return d;
  }

  GI.add('normale', {
    sec: '3.30',
    w: 560,
    h: 364,
    title: 'Standardizzare non cambia l’area',
    alt: 'Due campane una sotto l’altra. In alto la normale N(μ, σ²) con l’asse in unità di misura, in basso la normale standard con l’asse in deviazioni standard dalla media. Una zona arancione colora la stessa area in entrambe, fra due estremi a e b oppure sopra a oppure sotto b, e la sua percentuale è scritta in alto a destra di ogni campana. Muovendo media, deviazione standard ed estremi cambiano i numeri sull’asse in alto e la zona colorata, mentre la campana in basso resta la stessa; una freccia indica che l’area continua oltre il bordo del disegno.',
    controls: [
      { id: 'mu', label: 'Media <var>μ</var>', min: 20, max: 120, step: 1, value: 100, fmt: (x) => n(x, 0) },
      { id: 'sigma', label: 'Deviazione standard <var>σ</var>', min: 1, max: 30, step: 1, value: 15, fmt: (x) => n(x, 0) },
      { id: 'tipo', kind: 'select', label: 'Area cercata', value: 'fra', options: [['fra', 'Fra a e b: P(a < X < b)'], ['sopra', 'Sopra a: P(X > a)'], ['sotto', 'Sotto b: P(X ≤ b)']] },
      { id: 'a', label: 'Estremo <var>a</var>', min: 0, max: 160, step: 1, value: 85, fmt: (x) => n(x, 0), show: (s) => s.tipo !== 'sotto' },
      { id: 'b', label: 'Estremo <var>b</var>', min: 0, max: 160, step: 1, value: 115, fmt: (x) => n(x, 0), show: (s) => s.tipo !== 'sopra' },
    ],
    presets: [
      { label: '±1σ: 68%', set: { mu: 100, sigma: 15, tipo: 'fra', a: 85, b: 115 } },
      { label: '±2σ: 95%', set: { mu: 100, sigma: 15, tipo: 'fra', a: 70, b: 130 } },
      { label: '±3σ: 99,7%', set: { mu: 100, sigma: 15, tipo: 'fra', a: 55, b: 145 } },
      { label: 'Quoziente intellettivo oltre 130', set: { mu: 100, sigma: 15, tipo: 'sopra', a: 130, b: 160 } },
      { label: 'Punteggio a un test oltre 90', set: { mu: 70, sigma: 10, tipo: 'sopra', a: 90, b: 160 } },
    ],
    caption: 'In alto la campana di <var>X</var> ~ <var>N</var>(<var>μ</var>, <var>σ</var><sup>2</sup>), in basso la stessa in unità standard: <var>Z</var> = (<var>X</var> − <var>μ</var>)/<var>σ</var>. L’area arancione è la probabilità cercata ed è uguale nei due disegni: cambia solo l’unità sull’asse. La campana è disegnata sempre alla stessa altezza, perché a contare è l’area. Una freccia indica che l’area continua oltre il bordo, che sta a 4 deviazioni standard dalla media. Il valore di <var>z</var> è arrotondato a due decimali, come sulla tavola.',
    prove: [
      'Passa da «Quoziente intellettivo oltre 130» a «Punteggio a un test oltre 90»: che cosa cambia nel disegno in alto e che cosa in quello in basso?',
      'Parti da «Punteggio a un test oltre 90» e porta <var>σ</var> a 8: quanto vale ora <var>z</var><sub><var>a</var></sub> e quanto vale la probabilità di superare 90?',
    ],
    onchange(s, id, setAll) {
      if (id === 'a' && s.a > s.b) setAll({ b: s.a });
      else if (id === 'b' && s.b < s.a) setAll({ a: s.b });
    },
    calc,
    render(s) {
      const c = calc(s), tipo = s.tipo;
      const areaTxt = c.vuota ? '0' + NB + '%' : c.area < 1e-4 ? '< 0,01' + NB + '%' : GI.pct(c.area, c.area >= 0.01 ? 2 : 3);
      let svg = panel({ yb: 134, head: `*X* ~ *N*(${num(s.mu)}, ${num(s.sigma)}^2)`, areaTxt, xname: '*x*', la: '*a*', lb: '*b*', tick: (z) => num(s.mu + z * s.sigma) }, c, tipo);
      svg += panel({ yb: 326, head: '*Z* ~ *N*(0, 1)', areaTxt, xname: '*z*', la: '*z_a*', lb: '*z_b*', tick: (z) => n(z, 0) }, c, tipo);
      svg += path('M168 166V184M162 177L168 185L174 177', { stroke: C.soft, sw: 2, lc: 'round', lj: 'round' });
      svg += tx(184, 184, 'standardizzo: *z* = (*x* − *μ*)/*σ*', { ff: SANS, size: 17, fill: C.soft, ta: 'start' });

      const eqz = (z, zt) => (Math.abs(z - zt) < 1e-9 ? '=' : '≈');
      const zs = [];
      if (tipo !== 'sotto') zs.push(`${zsub('a')} = (${num(c.a)} − ${num(s.mu)})/${num(s.sigma)} ${eqz(c.za, c.zat)} ${zf(c.zat)}`);
      if (tipo !== 'sopra') zs.push(`${zsub('b')} = (${num(c.b)} − ${num(s.mu)})/${num(s.sigma)} ${eqz(c.zb, c.zbt)} ${zf(c.zbt)}`);
      const ph = [];
      if (tipo !== 'sotto') ph.push(phiRead(c.zat));
      if (tipo !== 'sopra') ph.push(phiRead(c.zbt));
      // risultato con le cifre della tavola; se differisce dal valore esatto (come 0,6826 e 0,6827 nel testo) si dicono entrambi
      const tab = tipo === 'fra' ? r4(c.pRt) - r4(c.pLt) : tipo === 'sopra' ? 1 - r4(c.pLt) : r4(c.pRt);
      const pc = pctT(c.area, c.vuota), ex = `<span class="gi-hl">${p4(c.area)}</span>, cioè ${pc}`;
      const hl = Math.abs(tab - r4(c.area)) < 1e-9 ? ex : `${p4(tab)} con la tavola; valore esatto ${ex}`;
      const arr = (tipo !== 'sotto' && Math.abs(c.za - c.zat) > 1e-9) || (tipo !== 'sopra' && Math.abs(c.zb - c.zbt) > 1e-9);
      let comb, same;
      if (tipo === 'fra') {
        comb = `${v('P')}(${num(c.a)} &lt; ${v('X')} &lt; ${num(c.b)}) = Φ(${zsub('b')}) − Φ(${zsub('a')}) = ${p4(c.pRt)} − ${p4(c.pLt)} = ${hl}`;
        same = `${v('P')}(${zf(c.zat)} &lt; ${v('Z')} &lt; ${zf(c.zbt)})`;
      } else if (tipo === 'sopra') {
        comb = `${v('P')}(${v('X')} &gt; ${num(c.a)}) = 1 − Φ(${zsub('a')}) = 1 − ${p4(c.pLt)} = ${hl}`;
        same = `${v('P')}(${v('Z')} &gt; ${zf(c.zat)})`;
      } else {
        comb = `${v('P')}(${v('X')} ≤ ${num(c.b)}) = Φ(${zsub('b')}) = ${hl}`;
        same = `${v('P')}(${v('Z')} ≤ ${zf(c.zbt)})`;
      }
      const out = `<p>Standardizzo: ${zs.join(' e ')}.</p>
  <p>Leggo Φ sulla tavola: ${ph.join('; ')}.</p>
  <p>${comb}. Sulla normale standard è la stessa area: ${same}${arr ? ', a meno dell’arrotondamento di ' + v('z') : ''}.</p>`;
      return { svg, out };
    },
    selftest() {
      const W = GI.widgets.normale, d = GI.defaults(W), out = W.render(d).out, svg = W.render(d).svg;
      const A = (mu, sigma, tipo, a, b) => calc({ mu, sigma, tipo, a, b });
      const sim = (s, id) => { let got = {}; W.onchange(s, id, (o) => { got = o; }); return got; };
      const off = W.render({ mu: 100, sigma: 1, tipo: 'fra', a: 0, b: 50 });
      return [
        // python3 -I -c "from scipy.stats import norm; print(norm.cdf(1)-norm.cdf(-1))"
        ['area entro ±1σ (QI da 85 a 115)', calc(d).area, 0.6826894921370859, 1e-12],
        // python3 -I -c "from scipy.stats import norm; print(norm.cdf(2)-norm.cdf(-2))"
        ['area entro ±2σ', A(100, 15, 'fra', 70, 130).area, 0.9544997361036416, 1e-12],
        // python3 -I -c "from scipy.stats import norm; print(norm.cdf(3)-norm.cdf(-3))"
        ['area entro ±3σ', A(100, 15, 'fra', 55, 145).area, 0.9973002039367398, 1e-12],
        // python3 -I -c "from scipy.stats import norm; print(norm.sf(2))"
        ['coda oltre 130 con N(100, 15²)', A(100, 15, 'sopra', 130, 160).area, 0.022750131948179198, 1e-12],
        // python3 -I -c "from scipy.stats import norm; print(norm.sf(3))"
        ['coda oltre 60 ore con N(48, 4²)', A(48, 4, 'sopra', 60, 160).area, 0.001349898031630093, 1e-12],
        // python3 -I -c "from scipy.stats import norm; print(norm.cdf(2))"
        ['sotto 60 ore con N(48, 6²)', A(48, 6, 'sotto', 0, 60).area, 0.9772498680518208, 1e-12],
        // python3 -I -c "from scipy.stats import norm; print(norm.cdf(1.2)-norm.cdf(-0.8))"
        ['z non interi: N(50, 10²) fra 42 e 62', A(50, 10, 'fra', 42, 62).area, 0.6730749311948951, 1e-12],
        ['stessi z in N(48, 6²) e in N(100, 15²): area uguale', A(48, 6, 'fra', 42, 60).area - A(100, 15, 'fra', 85, 130).area, 0, 1e-12],
        // python3 -I -c "from scipy.stats import norm; print(norm.cdf(2)-norm.cdf(-1))"
        ['stessi z: valore comune', A(100, 15, 'fra', 85, 130).area, 0.8185946141203637, 1e-12],
        ['z_a del testo', calc(d).za, -1, 1e-12],
        ['z_b del testo', calc(d).zb, 1, 1e-12],
        ['se a > b si scambiano', A(100, 15, 'fra', 115, 85).area, 0.6826894921370859, 1e-12],
        ['onchange: alzando a oltre b, b segue', sim({ a: 120, b: 100 }, 'a').b, 120, 0],
        ['onchange: abbassando b sotto a, a segue', sim({ a: 120, b: 100 }, 'b').a, 100, 0],
        ['estremi molto fuori scena: area nulla', off.svg.length > 0 ? A(100, 1, 'fra', 0, 50).area : 1, 0, 1e-12],
        ['estremi uguali: area 0 e scritta «0 %»', W.render({ mu: 100, sigma: 15, tipo: 'fra', a: 100, b: 100 }).svg.includes('area 0' + NB + '%') ? A(100, 15, 'fra', 100, 100).area : 1, 0, 0],
        // python3 -I -c "from scipy.stats import norm; print(norm.cdf(12/7)-norm.cdf(-8/7))"
        ['z non interi: area esatta fra 42 e 62 in N(50, 7²)', A(50, 7, 'fra', 42, 62).area, 0.8302129127796095, 1e-12],
        // python3 -I -c "from scipy.stats import norm; print(norm.cdf(1.71))"   (z = 12/7 arrotondato a 1,71)
        ['Φ letta sulla tavola in z arrotondato: Φ(1,71)', A(50, 7, 'fra', 42, 62).pRt, 0.9563670634759681, 1e-12],
        // python3 -I -c "from scipy.stats import norm; print(norm.cdf(-1.14))"   (z = −8/7 arrotondato a −1,14)
        ['Φ letta sulla tavola in z arrotondato: Φ(−1,14)', A(50, 7, 'fra', 42, 62).pLt, 0.1271431505627983, 1e-12],
        // python3 -I -c "from scipy.stats import norm; print(round(norm.cdf(1.14),4), round(norm.cdf(1.71),4), round(norm.cdf(-1.14),4))"  → 0.8729 0.9564 0.1271
        ['la lettura usa i valori della tavola (0,8729; 0,9564; 0,1271)', (() => { const o = W.render({ mu: 50, sigma: 7, tipo: 'fra', a: 42, b: 62 }).out; return o.includes('0,8729') && o.includes('0,9564') && o.includes('0,1271') && !o.includes('0,8735') ? 1 : 0; })(), 1, 0],
        // python3 -I -c "from scipy.stats import norm; print(norm.cdf(-4))"
        ['sotto b = μ − 4σ (bordo sinistro del disegno)', A(120, 30, 'sotto', 85, 0).area, 3.167124183311986e-05, 1e-15],
        // python3 -I -c "from scipy.stats import norm; print(norm.cdf(4))"
        ['sotto b = μ + 4σ (bordo destro del disegno)', A(100, 15, 'sotto', 0, 160).area, 0.9999683287581669, 1e-14],
        // come nel testo: con la tavola 0,8413 − 0,1587 = 0,6826, valore esatto 0,6827 (python3 -I -c "from scipy.stats import norm; print(round(norm.cdf(1)-norm.cdf(-1),4), round(norm.cdf(1),4), round(norm.cdf(-1),4))")
        ['la lettura riporta 0,6826 con la tavola, 0,6827 esatto, 68,27 %', out.includes('0,8413 − 0,1587 = 0,6826 con la tavola; valore esatto <span class="gi-hl">0,6827</span>, cioè 68,27') ? 1 : 0, 1, 0],

        // python3 -I -c "from statistics import NormalDist as N; print(1-N().cdf(2.0), 1-N().cdf(2.5))"   (preset «Punteggio a un test oltre 90» e la sua prova con σ = 8)
        ['preset punteggio: N(70, 10²) oltre 90', A(70, 10, 'sopra', 90, 160).area, 0.02275013194817921, 1e-12],
        ['prova: N(70, 8²) oltre 90, z = 2,5', A(70, 8, 'sopra', 90, 160).area, 0.006209665325776159, 1e-12],
        ['prova: la lettura dà z = 2,50 e 0,0062', (() => { const o = W.render({ mu: 70, sigma: 8, tipo: 'sopra', a: 90, b: 160 }).out; return o.includes('= 2,50') && o.includes('1 − 0,9938 = <span class="gi-hl">0,0062</span>') ? 1 : 0; })(), 1, 0],
        ['z arrotondato: la lettura avverte dell’arrotondamento', (() => { const o = W.render({ mu: 50, sigma: 7, tipo: 'fra', a: 42, b: 62 }).out; return o.includes('a meno dell’arrotondamento') && !out.includes('a meno dell’arrotondamento') ? 1 : 0; })(), 1, 0],
        ['il disegno riporta l’area in entrambe le campane', (svg.match(/area 68,27/g) || []).length, 2, 0],
      ];
    },
  });
})();

/* ---- caratteristica.js (sezione 3.36) ---- */
(function () {
  'use strict';
  /* 3.36 · La funzione caratteristica: φ(t) come baricentro di punti sul cerchio */
  const { n, pct, p: P } = GI;
  const { tx, circ, ln, path, C, SANS } = GI.H;

  const TAU = 2 * Math.PI;
  const CX = 140, CY = 178, R = 96;                     // il piano: centro e raggio del cerchio unitario (pixel)
  const BL = 306, BR = 544, BT = CY - R, BB = CY + R;   // il riquadro delle curve (stessa scala verticale del cerchio)
  const TMAX = 10;
  const FAIR = { moneta: 0.5, dado: 1 / 6 };            // probabilità del valore più alto quando tutti i valori pesano uguale

  /* la legge: valori x e probabilità; p = probabilità del valore più alto (1 per la moneta, 6 per il dado) */
  function pmf(s) {
    const p = Math.min(1, Math.max(0, Number.isFinite(s.p) ? s.p : 0.5));
    if (s.law === 'dado') { const q = (1 - p) / 5; return { xs: [1, 2, 3, 4, 5, 6], ps: [q, q, q, q, q, p] }; }
    return { xs: [0, 1], ps: [1 - p, p] };
  }
  /* φ(t) = Σ p(x) e^{itx}, come [parte reale, parte immaginaria] */
  function phiAt(L, t) {
    let re = 0, im = 0;
    for (let j = 0; j < L.xs.length; j++) { re += L.ps[j] * Math.cos(t * L.xs[j]); im += L.ps[j] * Math.sin(t * L.xs[j]); }
    return [re, im];
  }
  function calc(s) {
    const L = pmf(s), t = Number.isFinite(s.t) ? s.t : 0, [re, im] = phiAt(L, t);
    return { L, t, re, im, m: Math.hypot(re, im) };
  }
  /* a + bi con la virgola e il segno giusto */
  const cp = (a, b) => n(a, 2) + (n(b, 2).startsWith('−') ? ' − ' : ' + ') + n(Math.abs(b), 2) + '<var>i</var>';

  const discR = (p) => Math.max(2.5, 15 * Math.sqrt(p)); // raggio del disco: area proporzionale alla probabilità (con un minimo, per vederlo)

  /* etichette dei valori x vicino ai dischi: solo se i punti sono staccati (al più due per gruppo) */
  function valueLabels(L, t) {
    const it = L.xs.map((x, j) => ({ x, p: L.ps[j], a: (((t * x) % TAU) + TAU) % TAU })).filter((q) => q.p > 0).sort((u, w) => u.a - w.a);
    const m = it.length, thr = 20 / R;
    if (!m) return '';
    const gap = (i) => (it[(i + 1) % m].a - it[i].a + TAU) % TAU;
    let start = 0;
    for (let i = 0; m > 1 && i < m; i++) if (gap(i) > thr) { start = (i + 1) % m; break; }
    const groups = [];
    for (let k = 0; k < m; k++) {
      const q = it[(start + k) % m];
      if (k && gap((start + k - 1) % m) <= thr) groups[groups.length - 1].push(q); else groups.push([q]);
    }
    let o = '';
    for (const gr of groups) {
      if (gr.length > 2) continue;
      let sx = 0, sy = 0;
      gr.forEach((q) => { sx += Math.cos(q.a); sy += Math.sin(q.a); });
      const a = Math.atan2(sy, sx), r = R + 12 + Math.max(...gr.map((q) => discR(q.p)));
      o += tx(CX + r * Math.cos(a), CY - r * Math.sin(a) + 5, gr.map((q) => q.x).join(', '), { ff: SANS, size: 17, fill: C.soft });
    }
    return o;
  }

  GI.add('caratteristica', {
    sec: '3.36',
    title: 'Il baricentro dei punti sul cerchio',
    alt: 'A sinistra, il cerchio di raggio 1 nel piano complesso con alcuni dischi viola: ognuno è un valore x della variabile (scritto accanto al disco), posto sul cerchio all’angolo t per x, e la sua area è la probabilità di x. Il punto giallo è il baricentro dei dischi, pesato con le probabilità: è φ(t) e sta sempre dentro il cerchio. Il punto blu sull’asse orizzontale è la sua parte reale, quello arancione sull’asse verticale la sua parte immaginaria. A destra, le due parti in funzione di t, da −10 a 10, con un punto sul valore corrente di t e un cerchietto vuoto in −t. Muovendo t i dischi girano sul cerchio e il baricentro si sposta; cambiando la legge (una moneta con due valori o un dado con sei) o la probabilità cambiano il numero e il peso dei dischi.',
    w: 560,
    h: 350,
    controls: [
      { id: 't', label: 'Il numero <var>t</var>', min: -TMAX, max: TMAX, step: 0.01, value: Math.PI / 2, fmt: (x) => n(x, 2) },
      { id: 'law', kind: 'select', label: '<span>La legge di <var>X</var></span>', value: 'moneta', options: [['moneta', 'Moneta: X vale 0 o 1'], ['dado', 'Dado: X vale 1, 2, …, 6']] },
      { id: 'p', label: 'Probabilità di 1 (moneta) o di 6 (dado)', min: 0, max: 1, step: 0.005, value: 0.5, fmt: (x) => pct(x, 1) },
    ],
    presets: [
      { label: 'Moneta equa, t = π/2', set: { law: 'moneta', p: 0.5, t: Math.PI / 2 } },
      { label: 'Moneta equa, t = π', set: { law: 'moneta', p: 0.5, t: Math.PI } },
      { label: 'Dado equo, t = π/3', set: { law: 'dado', p: 1 / 6, t: Math.PI / 3 } },
      { label: 'Moneta con 1 al 95 %, t = π', set: { law: 'moneta', p: 0.95, t: Math.PI } },
      { label: 'Dado truccato: 6 all’80 %, t = 2', set: { law: 'dado', p: 0.8, t: 2 } },
    ],
    onchange(s, id, setAll) { if (id === 'law') setAll({ p: FAIR[s.law] === undefined ? 0.5 : FAIR[s.law] }); },
    caption: 'Ogni disco viola è un valore <var>x</var> (il numero accanto): sta sul cerchio all’angolo <var>t</var>·<var>x</var> e la sua area è la probabilità di <var>x</var> (un disco di probabilità molto piccola ha comunque una misura minima, per vederlo); il valore 0 sta sempre nel punto 1 del cerchio, quello più a destra. Il punto giallo è il baricentro dei dischi, cioè la loro media pesata: è φ(<var>t</var>) = <var>E</var>[<var>e</var><sup><var>itX</var></sup>], e resta dentro il cerchio. Blu: parte reale, Re φ (sull’asse orizzontale); arancione: parte immaginaria, Im φ (sull’asse verticale). I cerchietti vuoti mostrano φ(−<var>t</var>): nel piano è lo specchio di φ(<var>t</var>) rispetto all’asse orizzontale.',
    prove: [
      'Con la moneta equa porta <var>t</var> a 3,14 (circa π): dove cade il baricentro? E se la probabilità di 1 sale al 95 %?',
      'Scegli «Dado truccato: 6 all’80 %, <var>t</var> = 2» e porta poi <var>t</var> a −2: che cosa cambia nella parte reale e che cosa in quella immaginaria?',
    ],
    calc,
    render(s) {
      const { L, t, re, im, m } = calc(s);
      const X = P.scale(-TMAX, TMAX, BL, BR), Y = (y) => CY - R * y;
      const bx = CX + R * re, by = CY - R * im;
      let svg = '';

      /* --- il piano complesso: cerchio, assi, dischi, baricentro --- */
      svg += tx(CX, 28, 'piano complesso', { ff: SANS, size: 17, fill: C.soft });
      svg += circ(CX, CY, R, { fill: C.A, fo: 0.06 });
      svg += ln(CX - R - 6, CY, CX + R + 6, CY, { stroke: C.soft, sw: 1.3 }) + ln(CX, CY - R - 6, CX, CY + R + 6, { stroke: C.soft, sw: 1.3 });
      svg += circ(CX, CY, R, { stroke: C.soft, sw: 1.8 });
      const discs = L.xs.map((x, j) => ({ x, p: L.ps[j] })).filter((q) => q.p > 0).sort((u, w) => w.p - u.p);
      for (const q of discs) {
        const a = t * q.x;
        svg += circ(CX + R * Math.cos(a), CY - R * Math.sin(a), discR(q.p), { fill: C.C, fo: 0.85, stroke: C.paper, sw: 1.4 });
      }
      svg += valueLabels(L, t);
      svg += ln(CX, CY, bx, by, { stroke: C.ink, sw: 1.6, so: 0.55 });
      svg += ln(bx, by, bx, CY, { stroke: C.A, sw: 1.8, da: '4 4' }) + ln(bx, by, CX, by, { stroke: C.B, sw: 1.8, da: '4 4' });
      svg += circ(bx, CY, 5, { fill: C.A }) + circ(CX, by, 5, { fill: C.B });
      svg += circ(bx, 2 * CY - by, 6.5, { stroke: C.ink, sw: 1.6, so: 0.7 });
      svg += circ(bx, by, 8.5, { fill: C.hi, stroke: C.ink, sw: 2 });
      const right = bx > CX + 0.45 * R;
      svg += tx(bx + (right ? -13 : 13), by - 13, 'φ(*t*)', { size: 20, ta: right ? 'end' : 'start', stroke: C.paper, sw: 4, paint_order: 'stroke', lj: 'round' }); // contorno del colore dello sfondo: gli assi non attraversano la scritta
      svg += tx(CX, CY + R + 54, 'area del disco = probabilità', { ff: SANS, size: 17, fill: C.soft });

      /* --- le curve Re φ e Im φ in funzione di t --- */
      svg += tx(BL + 60, 28, 'Re φ', { ff: SANS, size: 17, fill: C.A });
      svg += tx(BL + 160, 28, 'Im φ', { ff: SANS, size: 17, fill: C.B });
      svg += P.axes({ X, Y, box: [BL, BT, BR, BB], xt: [-10, -5, 0, 5, 10], yt: [-1, 0, 1], grid: true, xl: '*t*' });
      svg += ln(X(0), BT, X(0), BB, { stroke: 'var(--quadretto)', sw: 1 });
      const N = 320, ts = [], res = [], ims = [];
      for (let i = 0; i <= N; i++) {
        const tt = -TMAX + (2 * TMAX * i) / N, z = phiAt(L, tt);
        ts.push(tt); res.push(z[0]); ims.push(z[1]);
      }
      svg += path(P.pts(ts, res, X, Y), { stroke: C.A, sw: 2.6, lc: 'round', lj: 'round' });
      svg += path(P.pts(ts, ims, X, Y), { stroke: C.B, sw: 2.6, lc: 'round', lj: 'round' });
      svg += ln(X(t), BT, X(t), BB, { stroke: C.hi, sw: 1.8, da: '5 4' });
      /* i punti blu e arancioni possono coincidere (re = im): il blu è più grande e sta sotto */
      svg += circ(X(-t), Y(re), 6.5, { stroke: C.A, sw: 2 }) + circ(X(-t), Y(-im), 4.5, { stroke: C.B, sw: 2 });
      svg += circ(X(t), Y(re), 6.5, { fill: C.A, stroke: C.paper, sw: 1.5 }) + circ(X(t), Y(im), 4.5, { fill: C.B, stroke: C.paper, sw: 1.5 });

      /* --- la lettura sotto il disegno --- */
      const p = Math.min(1, Math.max(0, Number.isFinite(s.p) ? s.p : 0.5));
      const co = Math.cos(t), si = Math.sin(t);
      const single = p >= 0.9995 || (s.law !== 'dado' && p <= 0.0005); // un solo punto: la riga seguente lo dice già
      let note = '';
      if (Math.abs(t) < 1e-9) note = ' Con <var>t</var> = 0 tutti i punti coincidono in 1, quindi φ(0) = 1.';
      else if (m < 0.01) note = ' Il baricentro cade (quasi) nell’origine: φ(<var>t</var>) ≈ 0.';
      else if (m > 0.995 && !single) note = ' I punti stanno (quasi) tutti nello stesso posto: il baricentro è sul cerchio.';
      let how;
      if (s.law === 'dado') {
        const q = (1 - p) / 5;
        how = p >= 0.9995
          ? 'Dado che dà sempre 6: c’è un solo punto, <var>e</var><sup>6<var>it</var></sup>, e φ(<var>t</var>) coincide con lui.'
          : pct(q, 1) === pct(p, 1)
            ? `Dado: i sei punti <var>e</var><sup><var>itx</var></sup>, con <var>x</var> = 1, …, 6, pesano ${pct(p, 1)} ciascuno; φ(<var>t</var>) è la loro media pesata.`
            : `Dado: i sei punti <var>e</var><sup><var>itx</var></sup>, con <var>x</var> = 1, …, 6, pesano ${pct(q, 1)} ciascuno per le facce da 1 a 5 e ${pct(p, 1)} per la faccia 6; φ(<var>t</var>) è la loro media pesata.`;
      } else if (p >= 0.9995) {
        how = `Moneta che dà sempre 1: c’è un solo punto, <var>e</var><sup><var>it</var></sup> = ${cp(co, si)}, e φ(<var>t</var>) coincide con lui.`;
      } else if (p <= 0.0005) {
        how = 'Moneta che dà sempre 0: c’è un solo punto, <var>e</var><sup>0</sup> = 1, e φ(<var>t</var>) = 1 per ogni <var>t</var>.';
      } else {
        how = `Moneta: <var>X</var> vale 0 con probabilità ${pct(1 - p, 1)} (punto <var>e</var><sup>0</sup> = 1) e 1 con probabilità ${pct(p, 1)} (punto <var>e</var><sup><var>it</var></sup> = ${cp(co, si)}); φ(<var>t</var>) = ${n(1 - p, 2)} · 1 + ${n(p, 2)} · (${cp(co, si)}).`;
      }
      const out = `<p>Con <var>t</var> = ${n(t, 2)}: φ(<var>t</var>) = <var>a</var> + <var>bi</var> = <span class="gi-hl">${cp(re, im)}</span>, con parte reale <var>a</var> = ${n(re, 2)} e parte immaginaria <var>b</var> = ${n(im, 2)}. Il valore in −<var>t</var> è il coniugato di φ(<var>t</var>): φ(−<var>t</var>) = ${cp(re, -im)}.</p>
  <p>Distanza dall’origine: |φ(<var>t</var>)| = √(<var>a</var>² + <var>b</var>²) = <span class="gi-hl">${n(m, 2)}</span>, mai più di 1.${note}</p>
  <p>${how}</p>`;
      return { svg, out };
    },
    selftest() {
      const W = GI.widgets.caratteristica, d = GI.defaults(W), out = W.render(d).out;
      const dado = (p, t) => calc({ law: 'dado', p, t }), moneta = (p, t) => calc({ law: 'moneta', p, t });
      // python3 -I -c "import numpy as np; z=(1+np.exp(1j*np.pi/2))/2; print(abs(z))"
      const m1 = moneta(0.5, Math.PI / 2);
      // python3 -I -c "import numpy as np; k=np.arange(1,7); z=np.mean(np.exp(1j*1.0*k)); print(repr(z.real), repr(z.imag))"
      const d1 = dado(1 / 6, 1);
      // python3 -I -c "import numpy as np; k=np.arange(1,7); print(abs(np.mean(np.exp(1j*(np.pi/3)*k))))"
      const d2 = dado(1 / 6, Math.PI / 3);
      // python3 -I -c "import numpy as np; k=np.arange(1,7); ps=np.array([0.04]*5+[0.8]); z=np.sum(ps*np.exp(1j*2.0*k)); print(repr(z.real), repr(z.imag), repr(abs(z)))"
      const d3 = dado(0.8, 2);
      // python3 -I -c "import numpy as np; z=0.7+0.3*np.exp(2.5j); print(repr(z.real), repr(z.imag))"
      const m2 = moneta(0.3, 2.5);
      // python3 -I -c "import numpy as np; k=np.arange(1,7); ps=np.array([0.12]*5+[0.4]); z=np.sum(ps*np.exp(1j*3.7*k)); print(repr(z.real), repr(z.imag))"
      const d4 = dado(0.4, 3.7), d4n = dado(0.4, -3.7);
      // python3 -I -c "import numpy as np; z=0.05+0.95*np.exp(1j*np.pi); print(repr(z.real))"
      const m3 = moneta(0.95, Math.PI);
      // python3 -I -c "import numpy as np; k=np.arange(1,7); z=np.mean(np.exp(1j*6.0*k)); print(repr(z.real), repr(z.imag))"
      const d5 = dado(1 / 6, 6.0);
      // formula chiusa del dado equo: e^{3,5it} sin(3t) / (6 sin(t/2)) (controllo indipendente dalla somma)
      const dc = (t) => { const r = Math.sin(3 * t) / (6 * Math.sin(t / 2)); return [r * Math.cos(3.5 * t), r * Math.sin(3.5 * t)]; };
      const d6 = dado(1 / 6, 1.3), c6 = dc(1.3);
      let maxm = 0;
      for (let i = 0; i <= 400; i++) {
        const tt = -TMAX + (2 * TMAX * i) / 400;
        for (const lawn of ['moneta', 'dado']) for (const pp of [0, 0.2, 1 / 6, 0.5, 0.97, 1]) maxm = Math.max(maxm, calc({ law: lawn, p: pp, t: tt }).m);
      }
      /* il disegno: posizioni in pixel dei punti, lette dal markup e confrontate con valori calcolati con Python */
      const circles = (svg) => [...svg.matchAll(/<circle ([^>]*)\/>/g)].map((mm) => { const o = {}; for (const a of mm[1].matchAll(/([\w-]+)="([^"]*)"/g)) o[a[1]] = a[2]; return { x: +o.cx, y: +o.cy, r: +o.r, fill: o.fill, stroke: o.stroke }; });
      const cd = circles(W.render(d).svg);
      const sv3 = circles(W.render({ law: 'dado', p: 0.8, t: 2 }).svg);
      const big = (cs) => cs.filter((c) => c.fill === 'var(--pv-c)').sort((u, w) => w.r - u.r)[0];
      const dots = (cs, fill) => cs.filter((c) => c.fill === fill && c.r === (fill === 'var(--pv-a)' ? 6.5 : 4.5));
      const rings = (cs, stroke) => cs.filter((c) => c.fill === 'none' && c.stroke === stroke && c.r === (stroke === 'var(--pv-a)' ? 6.5 : 4.5));
      // python3 -I -c "import numpy as np; t=np.pi/2; z=0.5+0.5*np.exp(1j*t); print(140+96*z.real, 178-96*z.imag)"                    → 188.0 130.0
      // python3 -I -c "import numpy as np; t=np.pi/2; print(140+96*np.cos(t), 178-96*np.sin(t)); X=lambda t: 306+(t+10)/20*238; print(X(t), X(-t))"   → 140.0 82.0 e 443.6925 406.3075
      const bary = (cs) => cs.find((c) => c.fill === 'var(--pv-hi)' && c.r === 8.5);
      const dd = dots(cd, 'var(--pv-a)')[0], oo = dots(cd, 'var(--pv-b)')[0];
      const rr = rings(cd, 'var(--pv-a)')[0], rb = rings(cd, 'var(--pv-b)')[0];
      // python3 -I -c "import numpy as np; k=np.arange(1,7); ps=np.array([0.04]*5+[0.8]); z=np.sum(ps*np.exp(2j*k)); print(140+96*z.real, 178-96*z.imag, 140+96*np.cos(12), 178-96*np.sin(12), 306+12/20*238, 178-96*z.real, 178-96*z.imag)"
      // → 200.60628777345687 217.9860804772705 221.00998003831924 229.51100012804176 448.8 117.39371222654314 217.9860804772705
      return [
        ['moneta equa, t = π/2: |φ| = 0,7071', m1.m, 0.7071067811865476, 1e-12],
        ['moneta equa, t = π/2: parte reale 0,5', m1.re, 0.5, 1e-12],
        ['moneta equa, t = π/2: parte immaginaria 0,5', m1.im, 0.5, 1e-12],
        ['dado equo, t = 1: parte reale', d1.re, -0.04594136267157798, 1e-12],
        ['dado equo, t = 1: parte immaginaria', d1.im, -0.017208974746091194, 1e-12],
        ['dado equo, t = π/3: i sei punti sono un esagono, φ = 0', d2.m, 0, 1e-12],
        ['dado truccato 80 %, t = 2: parte reale', d3.re, 0.6313154976401756, 1e-12],
        ['dado truccato 80 %, t = 2: modulo', d3.m, 0.7563395801523094, 1e-12],
        ['moneta p = 0,3, t = 2,5: parte reale', m2.re, 0.45965691533591985, 1e-12],
        ['moneta p = 0,3, t = 2,5: parte immaginaria', m2.im, 0.17954164323118693, 1e-12],
        ['moneta con 1 al 95 %, t = π: φ = 1 − 2p = −0,9', m3.re, -0.9, 1e-12],
        ['dado, t = 3,7: parte reale', d4.re, -0.38904519253981673, 1e-12],
        ['dado, t = 3,7: parte immaginaria', d4.im, -0.10452367037012313, 1e-12],
        ['φ(−t) è il coniugato: parte reale uguale', d4n.re, d4.re, 1e-12],
        ['φ(−t) è il coniugato: parte immaginaria opposta', d4n.im, -d4.im, 1e-12],
        ['φ(0) = 1, parte reale', dado(0.3, 0).re, 1, 1e-12],
        ['φ(0) = 1, parte immaginaria', moneta(0.3, 0).im, 0, 1e-12],
        ['dado equo, t = 6: parte reale', d5.re, 0.4858012868706857, 1e-12],
        ['dado equo, t = 6: parte immaginaria', d5.im, -0.7420607504189398, 1e-12],
        ['dado equo: somma = formula chiusa (parte reale)', d6.re, c6[0], 1e-12],
        ['dado equo: somma = formula chiusa (parte immaginaria)', d6.im, c6[1], 1e-12],
        ['|φ| ≤ 1 su tutta la griglia (eccesso rispetto a 1)', Math.max(0, maxm - 1), 0, 1e-12],
        ['la lettura riporta 0,71 e 0,50 + 0,50', out.includes('0,71') && out.includes('0,50 + 0,50') ? 1 : 0, 1, 0],
        ['disegno: baricentro (stato predefinito), x', bary(cd).x, 188, 0.006],
        ['disegno: baricentro (stato predefinito), y', bary(cd).y, 130, 0.006],
        ['disegno: disco del valore 1 sta in cima al cerchio (y)', Math.min(...cd.filter((c) => c.fill === 'var(--pv-c)').map((c) => c.y)), 82, 0.006],
        ['disegno: il valore 0 sta in 1 (x del disco più a destra)', Math.max(...cd.filter((c) => c.fill === 'var(--pv-c)').map((c) => c.x)), 236, 0.006],
        ['disegno: punto blu sul grafico in t, x', dd.x, 443.69247628885927, 0.006],
        ['disegno: punto blu sul grafico in t, y', dd.y, 130, 0.006],
        ['disegno: cerchietto vuoto blu in −t, x', rr.x, 406.30752371114073, 0.006],
        ['disegno: cerchietto vuoto arancione in −t, y (−Im φ)', rb.y, 226, 0.006],
        ['disegno: punto arancione sul grafico, y', oo.y, 130, 0.006],
        ['disegno dado: baricentro x', bary(sv3).x, 200.60628777345687, 0.006],
        ['disegno dado: baricentro y', bary(sv3).y, 217.9860804772705, 0.006],
        ['disegno dado: disco della faccia 6 (angolo 12), x', big(sv3).x, 221.00998003831924, 0.006],
        ['disegno dado: disco della faccia 6 (angolo 12), y', big(sv3).y, 229.51100012804176, 0.006],
        ['disegno dado: punto blu sul grafico in t = 2, x', dots(sv3, 'var(--pv-a)')[0].x, 448.8, 0.006],
        ['disegno dado: punto blu sul grafico, y (Re φ)', dots(sv3, 'var(--pv-a)')[0].y, 117.39371222654314, 0.006],
        ['disegno dado: punto arancione sul grafico, y (Im φ)', dots(sv3, 'var(--pv-b)')[0].y, 217.9860804772705, 0.006],
      ];
    },
  });
})();
