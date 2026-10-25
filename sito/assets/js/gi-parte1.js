/* gi-parte1.js — grafici interattivi della Parte 1 (generato da lavoro-probabilita/grafici/build.py: non modificare a mano) */

/* ---- bayes.js (sezione 1.12) ---- */
(function () {
  'use strict';
  /* 1.12 · Formula di Bayes: le 10 000 persone e la probabilità a posteriori */
  const { n, pct, v, p: P } = GI;
  const { tx, rect, circ, g, ln, C, SANS } = GI.H;
  const N = 10000;
  const NB = pct(0, 0)[1]; // lo spazio che GI.pct mette prima del %

  function calc(s) {
    const malati = N * s.prev, sani = N - malati;
    const vp = malati * s.sens, fn = malati - vp, fp = sani * (1 - s.spec), vn = sani - fp;
    const pos = vp + fp;
    return { malati, sani, vp, fn, fp, vn, pos, post: pos > 0 ? vp / pos : 0 };
  }
  const cnt = (x) => (Math.abs(x - Math.round(x)) < 0.05 ? n(Math.round(x), 0) : n(x, 1));

  /* numeri: al più k cifre significative, senza zeri inutili in coda */
  const trim = (t) => (t.includes(',') ? t.replace(/0+$/, '').replace(/,$/, '') : t);
  function sg(x, k = 3) {
    if (!(x !== 0)) return '0';
    const e = Math.floor(Math.log10(Math.abs(x)));
    return trim(n(x, Math.max(0, k - 1 - e)));
  }
  const pg = (x) => sg(x * 100, 3) + NB + '%';
  /* i numeri della formula: tutte le cifre che servono (al più 5 decimali), senza zeri in coda */
  const dd = (x) => trim(n(x, 5));
  /* probabilità a posteriori: mai 100 % se non è esattamente 1 */
  const post = (x) => (x >= 1 - 1e-12 ? '100' + NB + '%' : pg(x));

  /* i punti: 1 punto = 10 persone; i confini fra i gruppi sono arrotondati (così il totale resta 1000) */
  const COLS = 40, ROWS = 25, PER = N / (COLS * ROWS);
  function punti(c) {
    const b1 = Math.round(c.vp / PER), b2 = Math.round((c.vp + c.fn) / PER), b3 = Math.round((c.vp + c.fn + c.fp) / PER);
    return { vp: b1, fn: b2 - b1, fp: b3 - b2, vn: COLS * ROWS - b3 };
  }

  GI.add('bayes', {
    sec: '1.12',
    title: 'Chi è davvero malato fra i positivi?',
    alt: 'Diecimila persone disegnate come mille punti, uno ogni dieci persone: i malati, in verde, sono pochi; i sani, in grigio, sono molti. I punti arancioni sono i sani che il test dichiara positivi per errore. A destra la barra dei positivi mostra quanti sono davvero malati; la probabilità a posteriori cambia con la percentuale di malati e con gli errori del test.',
    controls: [
      { id: 'prev', label: 'Malati nella popolazione', min: 0.001, max: 0.5, value: 0.01, log: true, fmt: pg },
      { id: 'sens', label: 'Malati che risultano positivi', min: 0.5, max: 1, step: 0.001, value: 0.99, fmt: pg },
      { id: 'spec', label: 'Sani che risultano negativi', min: 0.5, max: 1, step: 0.001, value: 0.95, fmt: pg },
    ],
    presets: [
      { label: 'L’esempio del testo', set: { prev: 0.01, sens: 0.99, spec: 0.95 } },
      { label: 'Malattia molto rara', set: { prev: 0.001, sens: 0.99, spec: 0.95 } },
      { label: 'Test quasi perfetto', set: { prev: 0.01, sens: 0.999, spec: 0.999 } },
      { label: 'Malattia diffusa', set: { prev: 0.3, sens: 0.99, spec: 0.95 } },
    ],
    caption: 'Ogni punto rappresenta 10 persone su 10 000, con qualche arrotondamento: i conteggi esatti sono scritti sotto e, se hanno la virgola (9,9 persone), sono medie su tanti gruppi di 10 000. Verde intenso: malati positivi; verde tenue: malati negativi; arancione: sani positivi (falsi positivi); grigio: sani negativi. La barra a destra raccoglie i soli positivi: la parte verde è la probabilità a posteriori <var>P</var>(malato&nbsp;|&nbsp;positivo).',
    prove: [
      'Porta i malati nella popolazione dall’1 % allo 0,1 %, senza toccare gli altri comandi: la probabilità a posteriori sale o scende? Quanto vale ora?',
      'Premi «L’esempio del testo» e porta al 99,9 % i sani che risultano negativi, senza toccare gli altri comandi: quanti sono ora i falsi positivi, e quanto vale la probabilità a posteriori?',
    ],
    calc,
    punti,
    render(s) {
      const c = calc(s), k = punti(c);
      const x0 = 28, y0 = 30, dx = 10.8, dy = 10.8, r = 4.5;
      let dots = '';
      for (let i = 0; i < COLS * ROWS; i++) {
        const col = i % COLS, row = Math.floor(i / COLS);
        const cx = x0 + dx * col, cy = y0 + dy * row;
        let fill, op = 1;
        if (i < k.vp) fill = 'var(--verde)';
        else if (i < k.vp + k.fn) { fill = 'var(--verde)'; op = 0.35; }
        else if (i < k.vp + k.fn + k.fp) fill = C.B;
        else { fill = C.soft; op = 0.28; }
        dots += circ(cx, cy, r, { fill, op });
      }
      // barra dei positivi
      const bx = 470, bw = 70, top = 40, bh = 250;
      const tp = c.pos > 0 ? (c.vp / c.pos) * bh : 0;
      let bar = rect(bx, top, bw, bh, { fill: 'none', stroke: C.soft, sw: 1.4 });
      if (c.pos > 0) {
        bar += rect(bx, top + bh - tp, bw, tp, { fill: 'var(--verde)', fo: 0.9 }) + rect(bx, top, bw, bh - tp, { fill: C.B, fo: 0.85 });
        bar += tx(bx + bw + 12, top + bh - tp / 2 + 6, '*malati*', { ff: SANS, size: 17, ta: 'start' });
        if (c.fp > 0) bar += tx(bx + bw + 12, top + (bh - tp) / 2 + 6, '*sani*', { ff: SANS, size: 17, ta: 'start' });
      }
      let svg = dots;
      svg += tx(x0 - 12, y0 + ROWS * dy + 12, '10 000 persone (1 punto = 10)', { ff: SANS, size: 16, fill: C.soft, ta: 'start' });
      svg += tx(bx + bw / 2, top - 12, 'i positivi', { ff: SANS, size: 17, fill: C.soft });
      svg += bar;
      svg += tx(bx + bw / 2, top + bh + 36, post(c.post), { size: 30, fill: 'var(--verde)', fw: 700 });
      const out = `<p>Su 10${NB}000 persone: <b>${cnt(c.malati)}</b> malate e <b>${cnt(c.sani)}</b> sane. Veri positivi: ${cnt(c.vp)}; falsi positivi: ${cnt(c.fp)}; positivi in tutto: ${cnt(c.pos)}.</p>
  <p>${v('P')}(malato&nbsp;|&nbsp;positivo) = ${cnt(c.vp)} / ${cnt(c.pos)} = <span class="gi-hl">${post(c.post)}</span>. Con la formula di Bayes: ${dd(s.sens)} · ${dd(s.prev)} / (${dd(s.sens)} · ${dd(s.prev)} + ${dd(1 - s.spec)} · ${dd(1 - s.prev)}).</p>`;
      return { svg, out };
    },
    selftest() {
      const W = GI.widgets.bayes, d = GI.defaults(W), out = W.render(d).out, outR = W.render({ prev: 0.001, sens: 0.99, spec: 0.95 }).out;
      const post_ = (pv, se, sp) => (se * pv) / (se * pv + (1 - sp) * (1 - pv));
      const K = (set) => punti(calc(set));
      const tot = (k) => k.vp + k.fn + k.fp + k.vn;
      return [
        // python3 -I -c "print(99/594)"  ->  0.16666666666666666
        ['posteriore del testo', calc(d).post, 99 / 594, 1e-12],
        ['posteriore con la formula', calc(d).post, post_(0.01, 0.99, 0.95), 1e-12],
        ['malattia rara', calc({ prev: 0.001, sens: 0.99, spec: 0.95 }).post, post_(0.001, 0.99, 0.95), 1e-12],
        ['test quasi perfetto', calc({ prev: 0.01, sens: 0.999, spec: 0.999 }).post, post_(0.01, 0.999, 0.999), 1e-12],
        ['i quattro gruppi hanno per somma N', (() => { const c = calc({ prev: 0.07, sens: 0.8, spec: 0.9 }); return c.vp + c.fn + c.fp + c.vn; })(), 10000, 1e-9],
        ['il testo riporta il 16,7 %', out.includes('16,7') ? 1 : 0, 1, 0],
        // python3 -I -c "print(10000*0.01*0.99/10, 10000*0.01*0.01/10, 9900*0.05/10)"  ->  9.9 0.1 49.5  (punti: 10, 0, 50)
        ['punti del testo: malati positivi', K(d).vp, 10, 0],
        ['punti del testo: malati negativi', K(d).fn, 0, 0],
        ['punti del testo: falsi positivi', K(d).fp, 50, 0],
        // python3 -I -c "print(10000*0.001*0.99/10, 9990*0.05/10)"  ->  0.99 49.95  (un solo punto verde, intenso)
        ['malattia rara: un punto di malato positivo', K({ prev: 0.001, sens: 0.99, spec: 0.95 }).vp, 1, 0],
        ['malattia rara: nessun punto di malato negativo', K({ prev: 0.001, sens: 0.99, spec: 0.95 }).fn, 0, 0],
        ['malattia rara: 50 punti di falsi positivi', K({ prev: 0.001, sens: 0.99, spec: 0.95 }).fp, 50, 0],
        // python3 -I -c "print(9900*0.001/10)"  ->  0.99  (un punto arancione, non zero)
        ['test quasi perfetto: si vede un falso positivo', K({ prev: 0.01, sens: 0.999, spec: 0.999 }).fp, 1, 0],
        ['i mille punti restano mille', tot(K({ prev: 0.3, sens: 0.7, spec: 0.5 })) + tot(K({ prev: 0.5, sens: 0.5, spec: 0.5 })) + tot(K(d)), 3000, 0],
        ['il cursore dei sani negativi arriva al 99,9 % del preset «Test quasi perfetto»', GI.fromSlider(W.controls.find((c) => c.id === 'spec'), 0.999), 0.999, 1e-12],
        ['100 % solo se è esattamente 1', post(1) === '100' + NB + '%' && post(0.999) === '99,9' + NB + '%' ? 1 : 0, 1, 0],
        ['la formula senza zeri inutili (0,99 · 0,01 / (0,99 · 0,01 + 0,05 · 0,99))', out.includes('0,99 · 0,01 / (0,99 · 0,01 + 0,05 · 0,99)') ? 1 : 0, 1, 0],
        ['la malattia rara: 1,94 %', outR.includes('1,94') ? 1 : 0, 1, 0],
      ];
    },
  });
})();

/* ---- vpp.js (sezione 1.13) ---- */
(function () {
  'use strict';
  /* 1.13 · Sensibilità, specificità e valori predittivi: VPP e VPN al variare della prevalenza */
  const { n, v, p: P } = GI;
  const { tx, circ, ln, path, C, SANS } = GI.H;

  /* geometria del disegno (unità del viewBox) */
  const VW = 560, VH = 350;
  const AL = 58, AR = 538, AT = 50, AB = 292; // riquadro: sinistra, destra, alto, basso
  const PMIN = 0.001, PMAX = 0.99, INS = 14; // prevalenza da 0,1 % a 99 % (così 0,1 %, 1 %, 10 % e 50 % cadono su un passo del cursore); INS = margine interno sull'asse orizzontale
  const LOGR = Math.log(PMAX / PMIN);
  const X = (p) => AL + INS + (Math.log(p / PMIN) / LOGR) * (AR - AL - 2 * INS); // scala logaritmica
  const Y = (y) => AB - y * (AB - AT);
  const NB = GI.pct(0, 0)[1]; // lo spazio che GI.pct mette prima del %

  /* le due misure che dipendono dalla prevalenza p */
  const vpp = (p, se, sp) => { const a = se * p, b = (1 - sp) * (1 - p); return a + b > 0 ? a / (a + b) : 0; };
  const vpn = (p, se, sp) => { const a = sp * (1 - p), b = (1 - se) * p; return a + b > 0 ? a / (a + b) : 0; };

  /* numeri: al più k cifre significative, senza zeri inutili in coda */
  const trim = (t) => (t.includes(',') ? t.replace(/0+$/, '').replace(/,$/, '') : t);
  function sg(x, k = 3) {
    if (!(x !== 0)) return '0';
    const e = Math.floor(Math.log10(Math.abs(x)));
    return trim(n(x, Math.max(0, k - 1 - e)));
  }
  const pg = (x) => sg(x * 100, 3) + NB + '%';
  /* percentuale di un risultato: mai 100 % se non è esattamente 1 (le cifre servono a vedere dove finiscono i nove) */
  function pr(x) {
    if (x >= 1 - 1e-12) return '100' + NB + '%';
    if (x >= 0.99) return n(x * 100, Math.min(5, Math.max(2, Math.ceil(-Math.log10((1 - x) * 100))))) + NB + '%';
    return n(x * 100, x < 0.01 ? 2 : 1) + NB + '%';
  }

  GI.add('vpp', {
    sec: '1.13',
    w: VW,
    h: VH,
    title: 'Il valore predittivo cambia con la prevalenza',
    alt: 'Due curve in funzione della prevalenza, cioè della frazione di malati, su una scala non uniforme da 0,1% a 99%. La curva blu è il valore predittivo positivo (VPP): parte da valori bassi quando i malati sono pochi e sale verso 100% quando sono tanti. La curva arancione è il valore predittivo negativo (VPN): è vicina a 100% e scende solo quando i malati sono molti. Due punti, uno per curva, segnano la prevalenza scelta, con linee tratteggiate verso gli assi. Muovendo sensibilità e specificità le curve cambiano forma.',
    controls: [
      { id: 'prev', label: 'Malati nella popolazione (prevalenza)', min: PMIN, max: PMAX, value: 0.01, log: true, fmt: (x) => pg(+x.toPrecision(3)) },
      { id: 'sens', label: 'Il test riconosce i malati (sensibilità)', min: 0.5, max: 1, step: 0.005, value: 0.99, fmt: pg },
      { id: 'spec', label: 'Il test lascia in pace i sani (specificità)', min: 0.5, max: 1, step: 0.005, value: 0.95, fmt: pg },
    ],
    presets: [
      { label: 'Il test di 1.12', set: { prev: 0.01, sens: 0.99, spec: 0.95 } },
      { label: 'Intrusioni: una su mille', set: { prev: 0.001, sens: 0.95, spec: 0.99 } },
      { label: 'Intrusioni: una su cento', set: { prev: 0.01, sens: 0.95, spec: 0.99 } },
      { label: 'Intrusioni: una su dieci', set: { prev: 0.1, sens: 0.95, spec: 0.99 } },
      { label: 'Intrusioni: una su due', set: { prev: 0.5, sens: 0.95, spec: 0.99 } },
    ],
    caption: 'Orizzontale: la prevalenza (la frazione di malati), con una scala non uniforme: da 0,1 % a 1 % e da 1 % a 10 % la distanza è la stessa, perché a ogni passo la prevalenza si moltiplica per 10. Verticale: probabilità. Blu: il VPP, la probabilità di essere malati dopo un test positivo. Arancione: il VPN, la probabilità di essere sani dopo un test negativo. I punti segnano la prevalenza scelta.',
    prove: [
      'Premi «Il test di 1.12» e porta la prevalenza da 1 % a 0,1 %: che cosa fanno il VPP e il VPN?',
      'Con la prevalenza all’1 % e la sensibilità al 99 %, porta la specificità dal 95 % al 99 %: quanto vale il VPP? Poi riporta la specificità al 95 % e alza la sensibilità dal 99 % al 100 %: quale dei due cambiamenti sposta di più il VPP?',
    ],
    vpp,
    vpn,
    render(s) {
      const p = Math.min(PMAX, Math.max(PMIN, +(+s.prev).toPrecision(3)));
      const se = s.sens, sp = s.spec;
      const a = vpp(p, se, sp), b = vpn(p, se, sp);
      const px = X(p), ya = Y(a), yb = Y(b);

      // curve: punti equispaziati sulla scala logaritmica
      const NS = 120, xs = [], ya_ = [], yb_ = [];
      for (let i = 0; i <= NS; i++) {
        const q = PMIN * (PMAX / PMIN) ** (i / NS);
        xs.push(q);
        ya_.push(vpp(q, se, sp));
        yb_.push(vpn(q, se, sp));
      }

      // griglia verticale sulle tacche con etichetta, assi, tacche piccole
      const maj = [0.001, 0.01, 0.1, 0.5];
      let svg = '';
      for (const x of maj) svg += ln(X(x), AT, X(x), AB, { stroke: 'var(--quadretto)', sw: 1 });
      svg += P.axes({
        X, Y, box: [AL, AT, AR, AB], grid: true,
        xt: maj, yt: [0, 0.25, 0.5, 0.75, 1],
        xf: (x) => n(x * 100, x < 0.01 ? 1 : 0) + NB + '%',
        yf: (y) => n(y * 100, 0) + NB + '%',
        xl: 'prevalenza (scala non uniforme)',
      });
      for (const d of [0.001, 0.01, 0.1]) {
        for (let m = 2; m <= 9; m++) {
          const x = d * m;
          if (x > PMAX * (1 + 1e-9) || Math.abs(x - 0.5) < 1e-9) continue;
          svg += ln(X(x), AB, X(x), AB + 3, { stroke: C.soft, sw: 1 });
        }
      }

      // curve
      svg += path(P.pts(xs, yb_, X, Y), { stroke: C.B, sw: 3.5, lc: 'round', lj: 'round' });
      svg += path(P.pts(xs, ya_, X, Y), { stroke: C.A, sw: 3.5, lc: 'round', lj: 'round' });

      // il punto e le linee tratteggiate verso gli assi
      svg += ln(px, AB, px, Math.min(ya, yb), { stroke: C.soft, sw: 1.8, da: '5 5' });
      svg += ln(AL, ya, px, ya, { stroke: C.A, sw: 1.8, da: '5 5' });
      svg += ln(AL, yb, px, yb, { stroke: C.B, sw: 1.8, da: '5 5' });
      svg += circ(px, yb, 7, { fill: C.B, stroke: 'var(--foglio)', sw: 2 });
      svg += circ(px, ya, 8, { fill: C.A, stroke: 'var(--foglio)', sw: 2 });

      // legenda con i due valori
      const LX = AL, RX = AL + 235;
      svg += ln(LX, 22, LX + 26, 22, { stroke: C.A, sw: 4, lc: 'round' });
      svg += tx(LX + 34, 28, 'VPP ' + pr(a), { ff: SANS, size: 17, fill: C.A, fw: 700, ta: 'start' });
      svg += ln(RX, 22, RX + 26, 22, { stroke: C.B, sw: 4, lc: 'round' });
      svg += tx(RX + 34, 28, 'VPN ' + pr(b), { ff: SANS, size: 17, fill: C.B, fw: 700, ta: 'start' });

      // lettura
      const M = v('M'), T = v('T'), Mc = M + '<sup>c</sup>', Tc = T + '<sup>c</sup>';
      const cond = (x, y) => `${v('P')}(${x}&nbsp;|&nbsp;${y})`; // niente a capo dentro P(T | M)
      const vp = se * p, fp = (1 - sp) * (1 - p), vn = sp * (1 - p), fn = (1 - se) * p;
      const out = `<p>Sensibilità ${cond(T, M)} = ${pg(se)} e specificità ${cond(Tc, Mc)} = ${pg(sp)}: non dipendono dalla prevalenza ${v('P')}(${M}) = ${pg(p)}.</p>
  <p><b>VPP</b> = ${cond(M, T)} = ${sg(se)} · ${sg(p)} / (${sg(se)} · ${sg(p)} + ${sg(1 - sp)} · ${sg(1 - p, 5)}) = ${sg(vp, 4)} / (${sg(vp, 4)} + ${sg(fp, 4)}) = <span class="gi-hl">${pr(a)}</span></p>
  <p><b>VPN</b> = ${cond(Mc, Tc)} = ${sg(sp)} · ${sg(1 - p, 5)} / (${sg(sp)} · ${sg(1 - p, 5)} + ${sg(1 - se)} · ${sg(p)}) = ${sg(vn, 4)} / (${sg(vn, 4)} + ${sg(fn, 4)}) = <span class="gi-hl">${pr(b)}</span></p>`;
      return { svg, out };
    },
    selftest() {
      const d = GI.defaults(GI.widgets.vpp), W = GI.widgets.vpp;
      const out = W.render(d).out, outI = W.render({ prev: 0.001, sens: 0.95, spec: 0.99 }).out;
      // python3 -I -c "print(0.99*0.01/(0.99*0.01+0.05*0.99))"  ->  0.16666666666666669  (= 99/594 = 1/6, il test di 1.12)
      // python3 -I -c "print(0.95*0.99/(0.95*0.99+0.01*0.01))"  ->  0.9998936848819903
      // python3 -I -c "print(95/1094, 98901/98906)"  ->  0.08683729433272395 0.999949446949629  (conteggi di 1.13: intrusioni, una su mille)
      // python3 -I -c "print([0.95*p/(0.95*p+0.01*(1-p)) for p in (0.01,0.1,0.5)])"  ->  0.4896907216494845 0.9134615384615384 0.9895833333333334  (tabella di 1.13)
      // python3 -I -c "p=0.5;print(0.99*(1-p)/(0.99*(1-p)+0.05*p))"  ->  0.9519230769230769  (VPN delle intrusioni al 50 %)
      // python3 -I -c "p=0.9;print(0.99*p/(0.99*p+0.05*(1-p)), 0.95*(1-p)/(0.95*(1-p)+0.01*p))"  ->  0.9944196428571429 0.9134615384615383
      // python3 -I -c "p=0.01;print(p/(p+0.05*(1-p)))"  ->  0.1680672268907563  (sensibilità 1, specificità 0,95)
      return [
        ['VPP del test di 1.12 (= 1/6)', vpp(0.01, 0.99, 0.95), 0.16666666666666669, 1e-12],
        ['VPN del test di 1.12', vpn(0.01, 0.99, 0.95), 0.9998936848819903, 1e-12],
        ['VPP intrusioni, una su mille (95 / 1 094)', vpp(0.001, 0.95, 0.99), 0.08683729433272395, 1e-12],
        ['VPN intrusioni, una su mille (98 901 / 98 906)', vpn(0.001, 0.95, 0.99), 0.999949446949629, 1e-12],
        ['VPP al 1 % (tabella: 49,0 %)', vpp(0.01, 0.95, 0.99), 0.4896907216494845, 1e-12],
        ['VPP al 10 % (tabella: 91,3 %)', vpp(0.1, 0.95, 0.99), 0.9134615384615384, 1e-12],
        ['VPP al 50 % (tabella: 99,0 %)', vpp(0.5, 0.95, 0.99), 0.9895833333333334, 1e-12],
        ['VPN intrusioni al 50 %', vpn(0.5, 0.95, 0.99), 0.9519230769230769, 1e-12],
        ['VPP al 90 % (test di 1.12)', vpp(0.9, 0.99, 0.95), 0.9944196428571429, 1e-12],
        ['VPN al 90 % (test di 1.12)', vpn(0.9, 0.99, 0.95), 0.9134615384615383, 1e-12],
        ['sensibilità 1, specificità 0,95, prevalenza 1 %', vpp(0.01, 1, 0.95), 0.1680672268907563, 1e-12],
        ['test senza informazione (0,5 e 0,5): VPP = prevalenza', vpp(0.2, 0.5, 0.5), 0.2, 1e-12],
        ['test senza informazione (0,5 e 0,5): VPN = 1 − prevalenza', vpn(0.2, 0.5, 0.5), 0.8, 1e-12],
        ['test perfetto: VPP = VPN = 1', vpp(0.3, 1, 1) + vpn(0.3, 1, 1), 2, 0],
        // il cursore della prevalenza ha 1001 posizioni: i valori del testo (e dei preset) devono essere fra queste
        ['prevalenza 0,1 %, 1 %, 10 % e 50 % raggiungibili col cursore', (() => { const cp = W.controls.find((c) => c.id === 'prev'); return [0.001, 0.01, 0.1, 0.5].every((x) => { for (let q = 0; q <= 1000; q++) if (GI.fromSlider(cp, q) === x) return true; return false; }) ? 1 : 0; })(), 1, 0],
        ['asse: 0,1 % a sinistra', X(PMIN), AL + INS, 1e-9],
        ['asse: 99 % a destra', X(PMAX), AR - INS, 1e-9],
        ['scala non uniforme: le potenze di 10 sono equidistanti', (X(0.01) - X(PMIN)) / (X(0.1) - X(0.01)), 1, 1e-9],
        ['formato: 49,0 %', pr(0.4896907216494845) === '49,0' + NB + '%' ? 1 : 0, 1, 0],
        ['formato: 99,99 % (VPN, non 100 %)', pr(0.9998936848819903) === '99,99' + NB + '%' ? 1 : 0, 1, 0],
        ['formato: 100 % solo se è 1', pr(1) === '100' + NB + '%' ? 1 : 0, 1, 0],
        ['la lettura riporta 16,7 % e 99,99 %', out.includes('16,7') && out.includes('99,99') ? 1 : 0, 1, 0],
        ['la lettura delle intrusioni riporta i numeri del testo (0,00095; 0,00999; 8,7 %; 99,995 %)', ['0,00095', '0,00999', '8,7', '99,995'].every((t) => outI.includes(t)) ? 1 : 0, 1, 0],
      ];
    },
  });
})();

/* ---- indipendenza.js (sezione 1.16) ---- */
(function () {
  'use strict';
  /* 1.16 · Indipendenza di due eventi: l'area di A ∩ B contro il rettangolo P(A)P(B) */
  const { n, v } = GI;
  const { tx: tx0, rect, ln, C, SANS } = GI.H;
  /* i corpi dei testi non scendono sotto 14 nemmeno negli apici */
  const tx = (x, y, s, a) => tx0(x, y, s, a).replace(/font-size="([\d.]+)"/g, (m, q) => `font-size="${Math.max(14, +q)}"`);

  const r10 = (x) => +x.toFixed(10);
  const cl = (x, a, b) => Math.min(b, Math.max(a, x));
  /* P(A ∩ B) non può superare il minore fra P(A) e P(B), né stare sotto P(A) + P(B) − 1 */
  const limiti = (pa, pb) => [r10(Math.max(0, pa + pb - 1)), r10(Math.min(pa, pb))];

  function calc(s) {
    const pa = cl(s.pa, 0, 1), pb = cl(s.pb, 0, 1);
    const [lo, hi] = limiti(pa, pb);
    const pab = r10(cl(s.pab, lo, hi));
    const prod = pa * pb;
    const tipo = Math.abs(pab - prod) < 1e-9 ? 0 : pab > prod ? 1 : -1; // 0 indipendenti, 1 indizio a favore, −1 indizio contro
    return {
      pa, pb, pab, prod, lo, hi, tipo,
      aB: pb > 0 ? cl(pab / pb, 0, 1) : 0,               // P(A | B)
      aBc: pb < 1 ? cl((pa - pab) / (1 - pb), 0, 1) : 0, // P(A | B^c)
      bA: pa > 0 ? cl(pab / pa, 0, 1) : 0,               // P(B | A)
    };
  }

  /* il quadrato unitario: due colonne (B e B^c), in ognuna la parte di A parte dal basso */
  const SQ = { x0: 82, y0: 22, L: 232 };
  function geom(c) {
    const { x0, y0, L } = SQ, yb = y0 + L, X1 = x0 + L * c.pb, hB = L * c.aB, hBc = L * c.aBc;
    return {
      AB: [x0, yb - hB, L * c.pb, hB],
      AcB: [x0, y0, L * c.pb, L - hB],
      ABc: [X1, yb - hBc, L * (1 - c.pb), hBc],
      AcBc: [X1, y0, L * (1 - c.pb), L - hBc],
      ind: [x0, yb - L * c.pa, L * c.pb, L * c.pa], // il rettangolo di area P(A)P(B)
    };
  }

  const dec = (x) => (Math.abs(x * 100 - Math.round(x * 100)) < 1e-9 ? 2 : 3); // 0,20 oppure 0,667
  const q = (x) => n(x, dec(x));
  const eq = (x) => (Math.abs(x * 10 ** dec(x) - Math.round(x * 10 ** dec(x))) < 1e-9 ? '=' : '≈'); // = se le cifre scritte sono esatte
  const A = v('A'), B = v('B'), Ac = A + '<sup>c</sup>', Bc = B + '<sup>c</sup>';
  const P = (x) => v('P') + '(' + x.replace(/ \| /g, '&nbsp;|&nbsp;') + ')'; // niente a capo dentro P(A | B)

  GI.add('indipendenza', {
    sec: '1.16',
    title: 'Indipendenti o no: l’area contro il prodotto',
    w: 560,
    h: 306,
    alt: 'Un quadrato di area 1 diviso in due colonne: a sinistra l’evento B, a destra il suo complementare, larghe quanto le loro probabilità. In ogni colonna la parte blu in basso è A e la parte arancione in alto è il complementare di A. Un contorno tratteggiato mostra il rettangolo di area P(A)P(B), cioè l’area che A e B avrebbero in comune se fossero indipendenti. Se la parte blu della colonna di B arriva al tratteggio i due eventi sono indipendenti; se lo supera, B è un indizio a favore di A; se resta sotto, è un indizio contro. I comandi sono P(A), P(B) e P(A e B).',
    controls: [
      { id: 'pa', label: `${P(A)}`, min: 0, max: 1, step: 0.1, value: 0.2, fmt: (x) => n(x, 2) },
      { id: 'pb', label: `${P(B)}`, min: 0, max: 1, step: 0.1, value: 0.6, fmt: (x) => n(x, 2) },
      { id: 'pab', label: `${P(A + ' ∩ ' + B)}`, min: 0, max: 1, step: 0.01, value: 0.15, fmt: (x) => n(x, 2), limits: (s) => limiti(s.pa, s.pb) },
    ],
    /* il comando di P(A ∩ B) si ferma sui suoi limiti, anche quando sono P(A) e P(B) a cambiare */
    onchange(s, id, setAll) {
      const [lo, hi] = limiti(s.pa, s.pb), x = r10(cl(s.pab, lo, hi));
      if (x !== s.pab) setAll({ pab: x });
    },
    presets: [
      { label: 'Utenti: abbonamento (A) e smartphone (B)', set: { pa: 0.2, pb: 0.6, pab: 0.15 } },
      { label: 'Se fossero indipendenti', set: { pa: 0.2, pb: 0.6, pab: 0.12 } },
      { label: 'Abbonamento (A), senza smartphone (B)', set: { pa: 0.2, pb: 0.4, pab: 0.05 } },
      { label: 'Pari (A) e dispari (B)', set: { pa: 0.5, pb: 0.5, pab: 0 } },
      { label: 'B è l’evento certo', set: { pa: 0.2, pb: 1, pab: 0.2 } },
    ],
    caption: `Il quadrato ha area 1, quindi le aree sono probabilità. Le colonne sono ${B} (a sinistra, larga ${P(B)}) e ${Bc}; in ciascuna la parte blu è ${A} e la parte arancione è ${Ac}. Il contorno tratteggiato ha area ${P(A)}${P(B)}: è l’area che ${A} ∩ ${B} avrebbe se i due eventi fossero indipendenti. Se la parte blu della colonna ${B} arriva al tratteggio, ${P(A + ' | ' + B)} = ${P(A)}; se lo supera, ${B} è un indizio a favore di ${A}; se resta sotto, è un indizio contro. La linea punteggiata prolunga l’altezza ${P(A)} sulla colonna ${Bc}, per confrontarla con la parte blu di quella colonna. Il comando di ${P(A + ' ∩ ' + B)} si ferma ai suoi limiti: non può superare il minore fra ${P(A)} e ${P(B)}, né scendere sotto ${P(A)} + ${P(B)} − 1.`,
    prove: [
      `Premi «Se fossero indipendenti» e poi alza un poco ${P(A + ' ∩ ' + B)}: che cosa succede alla parte blu della colonna ${Bc}?`,
      `Premi «Pari (A) e dispari (B)»: l’area di ${A} ∩ ${B} è sparita, ma il rettangolo tratteggiato no. Che cosa ti dice sull’indipendenza?`,
    ],
    calc,
    geom,
    render(s) {
      const c = calc(s), g = geom(c);
      const { pa, pb, pab, prod, aB, tipo } = c;
      const { x0, y0, L } = SQ, yb = y0 + L, X1 = x0 + L * pb, ya = yb - L * pa, yc = yb - L * aB;
      const reg = (r, fill, fo) => (r[2] > 0.05 && r[3] > 0.05 ? rect(r[0], r[1], r[2], r[3], { fill, fo, stroke: C.paper, sw: 1.5 }) : '');
      let svg = reg(g.AB, C.A, 0.85) + reg(g.AcB, C.B, 0.5) + reg(g.ABc, C.A, 0.3) + reg(g.AcBc, C.B, 0.18);
      // il rettangolo di area P(A)P(B), con la sua altezza P(A) prolungata sulla colonna B^c
      if (pa > 0 && pb > 0) svg += rect(g.ind[0], g.ind[1], g.ind[2], g.ind[3], { stroke: C.ink, sw: 2.6, da: '8 5' });
      if (pa > 0 && pa < 1 && pb < 1) svg += ln(X1, ya, x0 + L, ya, { stroke: C.ink, sw: 1.8, da: '4 5', so: 0.75 });
      svg += rect(x0, y0, L, L, { stroke: C.soft, sw: 1.6 });
      // P(A | B) a sinistra (altezza della parte blu della colonna B), P(A) a destra (altezza del tratteggio)
      if (pb > 0) svg += ln(x0 - 8, yc, x0, yc, { stroke: C.A, sw: 3 }) + tx(x0 - 12, yc + 5, 'P(*A* | *B*)', { size: 16, fill: C.A, ta: 'end' });
      svg += ln(x0 + L, ya, x0 + L + 8, ya, { stroke: C.ink, sw: 3 }) + tx(x0 + L + 12, ya + 5, 'P(*A*)', { size: 16, ta: 'start' });
      // le due colonne
      if (pb > 0.04) svg += ln(x0 + 3, yb + 9, X1 - 3, yb + 9, { stroke: C.soft, sw: 2 }) + tx((x0 + X1) / 2, yb + 30, '*B*', { size: 18 });
      if (pb < 0.96) svg += ln(X1 + 3, yb + 9, x0 + L - 3, yb + 9, { stroke: C.soft, sw: 2 }) + tx((X1 + x0 + L) / 2, yb + 30, '*B*^c', { size: 18 });
      // legenda
      const px = 384;
      [['*A* ∩ *B*', C.A, 0.85], ['*A* ∩ *B*^c', C.A, 0.3], ['*A*^c ∩ *B*', C.B, 0.5], ['*A*^c ∩ *B*^c', C.B, 0.18]].forEach(([t, col, fo], i) => {
        const y = y0 + 14 + i * 30;
        svg += rect(px, y - 11, 22, 22, { fill: col, fo, stroke: C.soft, so: 0.5, sw: 1 }) + tx(px + 32, y + 6, t, { size: 16, ta: 'start' });
      });
      const yd = y0 + 14 + 4 * 30;
      svg += rect(px, yd - 11, 22, 22, { stroke: C.ink, sw: 2.4, da: '5 3' }) + tx(px + 32, yd + 6, 'P(*A*)P(*B*)', { size: 16, ta: 'start' }) + tx(px + 32, yd + 26, 'se indipendenti', { size: 16, ff: SANS, fill: C.soft, ta: 'start' });
      // verdetto
      const cmp = pb === 0 ? 'P(*B*) = 0' : tipo === 0 ? 'P(*A* | *B*) = P(*A*)' : tipo > 0 ? 'P(*A* | *B*) > P(*A*)' : 'P(*A* | *B*) < P(*A*)';
      svg += tx(px, yb - 36, cmp, { size: 17, ta: 'start' });
      svg += tx(px, yb - 10, tipo === 0 ? 'indipendenti' : tipo > 0 ? 'indizio a favore' : 'indizio contro', { size: 18, ff: SANS, fw: 700, fill: tipo === 0 ? 'var(--verde)' : C.ink, ta: 'start' });

      // lettura
      let o = `<p>${P(A + ' ∩ ' + B)} = <b>${q(pab)}</b>. Il prodotto è ${P(A)}${P(B)} = ${q(pa)} · ${q(pb)} = <b>${q(prod)}</b>.</p>`;
      if (pb > 0) {
        o += `<p>${P(A + ' | ' + B)} = ${q(pab)} / ${q(pb)} ${eq(aB)} <b>${q(aB)}</b>, contro ${P(A)} = <b>${q(pa)}</b>.`;
        o += pa > 0 ? ` Per simmetria, ${P(B + ' | ' + A)} ${eq(c.bA)} ${q(c.bA)}, contro ${P(B)} = ${q(pb)}.</p>` : ` Con ${P(A)} = 0, ${P(B + ' | ' + A)} non è definita.</p>`;
      } else {
        o += `<p>${P(B)} = 0: ${P(A + ' | ' + B)} non è definita, ma il prodotto non ne ha bisogno: ${P(A + ' ∩ ' + B)} = 0 = ${P(A)}${P(B)}.</p>`;
      }
      if (tipo === 0) {
        o += `<p><span class="gi-hl">Indipendenti:</span> ${P(A + ' ∩ ' + B)} = ${P(A)}${P(B)}.` + (pa === 0 || pa === 1 || pb === 0 || pb === 1 ? ' Un evento di probabilità 0 o 1 è indipendente da qualunque altro.' : ' Sapere che è successo uno dei due non cambia la probabilità dell’altro.') + '</p>';
      } else if (tipo > 0) {
        o += `<p><span class="gi-hl">Non indipendenti:</span> ${P(A + ' ∩ ' + B)} > ${P(A)}${P(B)}, quindi ${B} è un indizio a favore di ${A}, e per simmetria ${A} lo è di ${B}.</p>`;
      } else {
        o += `<p><span class="gi-hl">Non indipendenti:</span> ${P(A + ' ∩ ' + B)} &lt; ${P(A)}${P(B)}, quindi ${B} è un indizio contro ${A}, e per simmetria ${A} lo è contro ${B}.` + (pab === 0 ? ` Con ${P(A + ' ∩ ' + B)} = 0 i due eventi sono incompatibili: dipendenti, perché il prodotto non è 0.` : '') + '</p>';
      }
      // 0 < P(B) < 1 è garantito qui: con P(B) = 0 o 1 i due eventi sono sempre indipendenti
      if (tipo !== 0) o += `<p>Passando a ${Bc} il segno si inverte: ${P(A + ' | ' + Bc)} ${eq(c.aBc)} <b>${q(c.aBc)}</b>, ${tipo > 0 ? 'sotto' : 'sopra'} ${P(A)}.</p>`;
      o += `<p>Con questi valori di ${P(A)} e ${P(B)}, ${P(A + ' ∩ ' + B)} ${c.lo === c.hi ? 'vale per forza ' + q(c.lo) : 'sta fra ' + q(c.lo) + ' e ' + q(c.hi)}.</p>`;
      return { svg, out: o };
    },
    selftest() {
      const W = GI.widgets.indipendenza, d = GI.defaults(W), L2 = SQ.L * SQ.L;
      const area = (r) => (r[2] * r[3]) / L2;
      const gm = geom(calc({ pa: 0.7, pb: 0.4, pab: 0.25 }));
      const out = W.render(d).out;
      const sim = (s) => { let got; W.onchange(s, 'pab', (o) => { got = o.pab; }); return got; };
      const fig = (set) => calc(set).tipo;
      return [
        // python3 -I -c "print(0.15/0.6)"  (0,25 nel testo)
        ['P(A | B) degli utenti', calc(d).aB, 0.25, 1e-12],
        // python3 -I -c "print(0.15/0.2)"  (0,75 nel testo)
        ['P(B | A) degli utenti', calc(d).bA, 0.75, 1e-12],
        // python3 -I -c "print(0.2*0.6)"
        ['prodotto P(A)P(B) degli utenti', calc(d).prod, 0.12, 1e-12],
        // python3 -I -c "print(max(0,0.6+0.7-1), min(0.6,0.7))"  (0,3 e 0,6)
        ['limite inferiore di P(A ∩ B)', limiti(0.6, 0.7)[0], 0.3, 1e-9],
        ['limite superiore di P(A ∩ B)', limiti(0.6, 0.7)[1], 0.6, 1e-12],
        // python3 -I -c "print(min(0.6,0.3))"
        ['P(A ∩ B) troppo alta viene limitata', calc({ pa: 0.6, pb: 0.3, pab: 0.9 }).pab, 0.3, 1e-12],
        // python3 -I -c "print(min(0.2,0.3))"
        ['onchange limita P(A ∩ B) quando cambia P(A)', sim({ pa: 0.2, pb: 0.3, pab: 0.25 }), 0.2, 1e-12],
        ['onchange non tocca un valore già ammesso', sim({ pa: 0.2, pb: 0.3, pab: 0.18 }) === undefined ? 1 : 0, 1, 0],
        // python3 -I -c "print(round(max(0,0.9+0.8-1),10))"
        ['onchange alza P(A ∩ B) al limite inferiore', sim({ pa: 0.9, pb: 0.8, pab: 0.1 }), 0.7, 1e-12],
        // python3 -I -c "print(0.25)"  area di A ∩ B nel disegno
        ['area disegnata di A ∩ B', area(gm.AB), 0.25, 1e-12],
        // python3 -I -c "print(0.7-0.25)"
        ['area disegnata di A ∩ B^c', area(gm.ABc), 0.45, 1e-12],
        // python3 -I -c "print(0.4-0.25)"
        ['area disegnata di A^c ∩ B', area(gm.AcB), 0.15, 1e-12],
        // python3 -I -c "print(1-0.7-0.4+0.25)"
        ['area disegnata di A^c ∩ B^c', area(gm.AcBc), 0.15, 1e-12],
        // python3 -I -c "print(0.7*0.4)"
        ['area del rettangolo tratteggiato', area(gm.ind), 0.28, 1e-12],
        // python3 -I -c "print(0.6-0.18, 0.6*(1-0.3))"  teorema dei complementari: A e B^c restano indipendenti
        ['P(A ∩ B^c) = P(A)P(B^c) se A e B sono indipendenti', area(geom(calc({ pa: 0.6, pb: 0.3, pab: 0.18 })).ABc), 0.42, 1e-12],
        // python3 -I -c "print(0.05/0.4)"  con B^c al posto di B il segno si inverte: 0,125 contro 0,2
        ['P(A | B) senza smartphone', calc({ pa: 0.2, pb: 0.4, pab: 0.05 }).aB, 0.125, 1e-12],
        // python3 -I -c "print(0.05/0.2)"
        ['P(B | A) senza smartphone', calc({ pa: 0.2, pb: 0.4, pab: 0.05 }).bA, 0.25, 1e-12],
        // python3 -I -c "print((0.2-0.15)/(1-0.6))"  passando a B^c il segno si inverte: 0,125 sotto P(A) = 0,2
        ['P(A | B^c) degli utenti', calc(d).aBc, 0.125, 1e-12],
        // python3 -I -c "print(0.6*0.25 + 0.4*0.125)"  P(A) è la media pesata di P(A | B) e P(A | B^c)
        ['media pesata di P(A | B) e P(A | B^c)', calc(d).pb * calc(d).aB + (1 - calc(d).pb) * calc(d).aBc, 0.2, 1e-12],
        // python3 -I -c "print(0.05/0.4)"  esatto: la lettura scrive «=» e non «≈»
        ['0,125 è esatto, non approssimato', W.render({ pa: 0.2, pb: 0.4, pab: 0.05 }).out.includes('= <b>0,125</b>') ? 1 : 0, 1, 0],
        // python3 -I -c "print(0.2/0.3)"  0,667 resta approssimato
        ['0,667 è approssimato', W.render({ pa: 0.6, pb: 0.3, pab: 0.2 }).out.includes('≈ <b>0,667</b>') ? 1 : 0, 1, 0],
        // python3 -I -c "print(1/6*1/6, 1/36)"  somma 7 e primo dado (testo)
        ['somma 7 e primo dado: indipendenti', fig({ pa: 1 / 6, pb: 1 / 6, pab: 1 / 36 }), 0, 0],
        ['utenti: indizio a favore', fig({ pa: 0.2, pb: 0.6, pab: 0.15 }), 1, 0],
        ['se fossero indipendenti: verdetto 0', fig({ pa: 0.2, pb: 0.6, pab: 0.12 }), 0, 0],
        ['senza smartphone: indizio contro', fig({ pa: 0.2, pb: 0.4, pab: 0.05 }), -1, 0],
        ['pari e dispari: indizio contro', fig({ pa: 0.5, pb: 0.5, pab: 0 }), -1, 0],
        ['evento certo: indipendenti', fig({ pa: 0.2, pb: 1, pab: 0.2 }), 0, 0],
        ['la lettura riporta 0,25 e 0,75', out.includes('0,25') && out.includes('0,75') ? 1 : 0, 1, 0],
      ];
    },
  });
})();

/* ---- compleanni.js (sezione 1.20) ---- */
(function () {
  'use strict';
  /* 1.20 · Compleanni: la probabilità di almeno una coincidenza in funzione di n */
  const { n, pct, sci, v, p: P } = GI;
  const { tx, ln, circ, path, C, SANS } = GI.H;

  const RACCOLTA = [100, 365, 1000, 5000]; // valori di N del testo: il cursore ci si ferma quando ci passa vicino

  const clampI = (x, lo, hi) => Math.min(hi, Math.max(lo, Math.round(x)));

  /* q[k] = P(k estrazioni tutte diverse) = (N/N)·((N−1)/N)⋯((N−k+1)/N); da k > N in poi il fattore 0 azzera tutto */
  function distinct(N, K) {
    const q = [1];
    for (let k = 1; k <= K; k++) {
      const fat = (N - (k - 1)) / N;
      q.push(q[k - 1] > 0 && fat > 0 ? q[k - 1] * fat : 0);
    }
    return q;
  }

  /* il ciclo del testo: il più piccolo n per cui la probabilità di coincidenza supera t */
  function firstOver(N, t) {
    let q = 1, k = 0;
    while (1 - q <= t && k <= N) { q *= (N - k) / N; k++; }
    return k;
  }

  function calc(s) {
    const N = clampI(s.N, 2, 1e6), nn = clampI(s.n, 1, 1e6);
    const base = 3.7 * Math.sqrt(N), tk = P.nice(0, base, 5), step = tk[1] - tk[0];
    const xmax = Math.ceil(base / step - 1e-9) * step; // l'asse arriva a circa il 99,9 %
    const n50 = firstOver(N, 0.5), n90 = firstOver(N, 0.9);
    const q = distinct(N, Math.max(xmax, nn, n50, n90));
    return { N, nn, xmax, xt: P.nice(0, xmax, 5), n50, n90, q, pn: 1 - q[nn] };
  }

  /* certo = più estrazioni che valori: la coincidenza è sicura (100 %); altrimenti, vicino a 1, si scrive «più di 99,9 %» (mai 100 %) */
  const fp = (p, certo) => (certo ? pct(1, 0) : p > 0.9995 ? 'più di 99,9\u00a0%' : p < 0.001 ? pct(p, 2) : pct(p, 1));
  const fq = (q) => (q === 0 ? '0' : q < 0.001 ? sci(q, 2) : n(q, 4));
  const fr = (k, N) => n(N - k, 0) + '/' + n(N, 0);
  function prodotto(nn, N) {
    if (nn <= 5) return Array.from({ length: nn }, (_, k) => fr(k, N)).join(' · ');
    return [0, 1, 2].map((k) => fr(k, N)).join(' · ') + ' ⋯ ' + fr(nn - 1, N);
  }
  const alone = { stroke: C.paper, sw: 5, lj: 'round', paint_order: 'stroke' };

  GI.add('compleanni', {
    sec: '1.20',
    w: 560,
    h: 324,
    title: 'Compleanni: quando una coincidenza diventa probabile',
    alt: 'Curva della probabilità che almeno due persone abbiano lo stesso compleanno, in funzione del numero di persone (o di estrazioni) n: parte da zero e sale in fretta verso il 100 %. Due linee tratteggiate segnano le soglie del 50 % e del 90 %, con il più piccolo n che le supera; un anello rosso segna il valore scelto. Muovendo n l’anello scorre sulla curva; aumentando i valori possibili N l’asse orizzontale si allarga e i due valori di n che superano le soglie crescono.',
    controls: [
      { id: 'n', label: 'Persone o estrazioni <var>n</var>', min: 2, max: 400, value: 23, int: true, log: true, fmt: (x) => n(x, 0) },
      { id: 'N', label: 'Valori possibili <var>N</var> (365 = giorni)', min: 10, max: 10000, value: 365, int: true, log: true, fmt: (x) => n(x, 0) },
    ],
    presets: [
      { label: 'L’aula del testo', set: { n: 23, N: 365 } },
      { label: 'Supera 0,9: 41 persone', set: { n: 41, N: 365 } },
      { label: 'Urna di 100 palline', set: { n: 13, N: 100 } },
      { label: 'Teatro da 1\u00a0000 posti', set: { n: 40, N: 1000 } },
      { label: 'N = 10\u00a0000: con 119 si supera 1/2', set: { n: 119, N: 10000 } },
    ],
    onchange(s, id, setAll) {
      if (id !== 'N') return;
      const m = RACCOLTA.find((x) => Math.abs(s.N - x) <= 0.015 * x);
      if (m && m !== s.N) setAll({ N: m });
    },
    caption: 'La curva blu è la probabilità esatta di almeno una coincidenza: sale perché ogni persona in più moltiplica «tutti diversi» per un fattore minore di 1. Le linee tratteggiate sono le soglie 1/2 (arancione) e 0,9 (viola), con il più piccolo <var>n</var> che le supera; l’anello rosso è il valore scelto. L’asse si adatta a <var>N</var>; se <var>n</var> sta oltre il disegno, l’anello si ferma a destra con una freccia.',
    prove: [
      'Con <var>N</var> = 365 la curva supera la linea arancione a 23 persone: quante ne servono in più per superare anche la viola?',
      'Porta <var>N</var> da 100 a 10\u00a0000, cioè cento volte più grande: di quante volte circa cresce il più piccolo <var>n</var> che supera 1/2? Confronta il rapporto con 100.',
    ],
    calc,
    firstOver,
    render(s) {
      const c = calc(s);
      const l = 66, t = 72, r = 536, b = 268;
      const X = P.scale(0, c.xmax, l, r), Y = P.scale(0, 1, b, t);
      let svg = P.axes({
        X, Y, box: [l, t, r, b], xt: c.xt, yt: [0, 0.5, 0.9, 1], yf: (y) => pct(y, 0), grid: true,
        xl: '*n* = persone (o estrazioni)',
      });
      svg += tx(l, 48, '*P*(almeno due uguali)', { ff: SANS, size: 16, fill: C.soft, ta: 'start' });
      // il valore scelto: la linea sta sotto, così le etichette delle soglie restano leggibili
      const dentro = c.nn <= c.xmax, xn = dentro ? X(c.nn) : r, yn = Y(c.pn);
      if (dentro) svg += ln(xn, yn, xn, b, { stroke: 'var(--rosso)', sw: 1.6, da: '3 4' });
      svg += ln(l, Y(0.5), r, Y(0.5), { stroke: C.B, sw: 1.8, da: '7 5' }) + ln(l, Y(0.9), r, Y(0.9), { stroke: C.C, sw: 1.8, da: '7 5' });
      const ks = [], ps = [];
      for (let k = 0; k <= c.xmax; k++) { ks.push(k); ps.push(1 - c.q[k]); }
      svg += path(P.pts(ks, ps, X, Y), { stroke: C.A, sw: 3, lc: 'round', lj: 'round' });
      // il più piccolo n che supera ciascuna soglia
      let nomi = '';
      for (const [k, col] of [[c.n50, C.B], [c.n90, C.C]]) {
        if (k > c.xmax) continue;
        const x = X(k), y = Y(1 - c.q[k]);
        svg += ln(x, y, x, b, { stroke: col, sw: 1.6, da: '3 4' }) + circ(x, y, 5, { fill: col, stroke: C.paper, sw: 1.5 });
        nomi += tx(x + 6, b - 8, n(k, 0), { ff: SANS, size: 17, fill: col, ta: 'start', fw: 700, ...alone });
      }
      svg += nomi;
      svg += circ(xn, yn, 8.5, { stroke: 'var(--rosso)', sw: 3.2 });
      if (!dentro) svg += path(`M${xn + 13} ${yn - 6}L${xn + 20} ${yn}L${xn + 13} ${yn + 6}`, { stroke: 'var(--rosso)', sw: 2.5, lc: 'round', lj: 'round' });
      const certo = c.nn > c.N;
      svg += tx(r, 48, `*n* = ${n(c.nn, 0)} → ${fp(c.pn, certo)}`, { ff: SANS, size: 18, fill: 'var(--rosso)', fw: 700, ta: 'end' });

      const e50 = 1.1774 * Math.sqrt(c.N), e90 = 2.146 * Math.sqrt(c.N);
      const intro = `Con ${v('n')} = ${n(c.nn, 0)} e ${v('N')} = ${n(c.N, 0)}`;
      const dec = (p) => { const t = n(p, 4); return t === '1,0000' ? ', cioè ' : ' = ' + t + ', cioè '; }; // «= 0,5073, cioè 50,7 %»; vicino a 1 il risultato a 4 decimali sarebbe 1,0000, e si scrive solo «cioè più di 99,9 %»
      let out;
      if (certo) out = `<p>${intro}: ${v('n')} è maggiore di ${v('N')}, quindi nel prodotto compare il fattore 0/${n(c.N, 0)}. Allora ${v('P')}(tutti diversi) = 0 e ${v('P')}(almeno due uguali) = 1 − 0 = 1, cioè <span class="gi-hl">${pct(1, 0)}</span>.</p>`;
      else out = `<p>${intro}: ${v('P')}(tutti diversi) = ${prodotto(c.nn, c.N)} = ${fq(c.q[c.nn])}, quindi ${v('P')}(almeno due uguali) = 1 − ${fq(c.q[c.nn])}${dec(c.pn)}<span class="gi-hl">${fp(c.pn, false)}</span>.</p>`;
      out += `<p>Il più piccolo ${v('n')} che supera 1/2 è <b>${n(c.n50, 0)}</b> (stima 1,1774 √${v('N')} = ${n(e50, 1)}); il più piccolo che supera 0,9 è <b>${n(c.n90, 0)}</b> (stima 2,146 √${v('N')} = ${n(e90, 1)}).</p>`;
      return { svg, out };
    },
    selftest() {
      const W = GI.widgets.compleanni, d = GI.defaults(W), out = W.render(d).out;
      const pd = (nn, N) => 1 - calc({ n: nn, N }).q[nn];
      // probabilità di coincidenza con la formula dei logaritmi di Gamma, indipendente dal prodotto
      const pg = (nn, N) => 1 - Math.exp(GI.m.lgamma(N + 1) - GI.m.lgamma(N - nn + 1) - nn * Math.log(N));
      let fuori = 0; // quante volte il 90 % cadrebbe oltre l'asse
      for (let N = 10; N <= 10000; N++) { const c = calc({ n: 2, N }); if (c.n90 > c.xmax || c.n50 > c.xmax) fuori++; }
      return [
        // python3 -I -c "import math; print(repr(1 - math.prod(((365 - k) / 365) for k in range(23))))"
        ['P(23, 365)', pd(23, 365), 0.5072972343239857, 1e-12],
        // python3 -I -c "import math; print(repr(1 - math.prod(((365 - k) / 365) for k in range(57))))"
        ['P(57, 365)', pd(57, 365), 0.9901224593411699, 1e-12],
        // python3 -I -c "import math; print(repr(1 - math.prod(((365 - k) / 365) for k in range(41))))"
        ['P(41, 365)', pd(41, 365), 0.9031516114817354, 1e-12],
        // python3 -I -c "import math; print(repr(1 - math.prod(((1000 - k) / 1000) for k in range(40))))"   (il teatro del testo, 54,6 %)
        ['P(40, 1000)', pd(40, 1000), 0.5463719707129396, 1e-12],
        // python3 -I -c "import math; print(repr(1 - math.prod(((5000 - k) / 5000) for k in range(84))))"   (la lotteria del testo)
        ['P(84, 5000)', pd(84, 5000), 0.5039674920611069, 1e-12],
        // python3 -I -c "import math; print(repr(1 - math.prod(((365 - k) / 365) for k in range(2))))"   (= 1/365)
        ['P(2, 365) = 1/365', pd(2, 365), 0.002739726027397249, 1e-15],
        // python3 -I -c "import math; print(repr(1 - math.prod(((100 - k) / 100) for k in range(13))))"   (l'urna di 100 palline)
        ['P(13, 100)', pd(13, 100), 0.557225039544664, 1e-12],
        // python3 -I -c "import math; print(repr(1 - math.factorial(10) / 10**10))"   (n = N: tutte le estrazioni diverse sono N!)
        ['P(10, 10) = 1 − 10!/10^10', pd(10, 10), 0.99963712, 1e-12],
        ['P(23, 365) con i logaritmi di Gamma', pg(23, 365), 0.5072972343239857, 1e-9],
        ['P(57, 365) con i logaritmi di Gamma', pg(57, 365), 0.9901224593411699, 1e-9],
        ['più persone che valori: P = 1', pd(15, 10), 1, 0],
        ['con n = N + 1 il prodotto vale 0', calc({ n: 11, N: 10 }).q[11], 0, 0],
        // python3 -I -c "import math; f=lambda N,t: next(n for n in range(1, N + 2) if 1 - math.prod((N - k) / N for k in range(n)) > t); print([(N, f(N, .5), f(N, .9)) for N in (10, 100, 365, 5000, 10000)])"   (il più piccolo n oltre la soglia, come il ciclo del testo)
        ['primo n oltre 1/2, N = 365', firstOver(365, 0.5), 23, 0],
        ['primo n oltre 0,9, N = 365', firstOver(365, 0.9), 41, 0],
        ['primo n oltre 1/2, N = 100', firstOver(100, 0.5), 13, 0],
        ['primo n oltre 0,9, N = 100', firstOver(100, 0.9), 22, 0],
        ['primo n oltre 1/2, N = 10 000', firstOver(10000, 0.5), 119, 0],
        ['primo n oltre 0,9, N = 10 000', firstOver(10000, 0.9), 215, 0],
        ['primo n oltre 1/2, N = 5 000', firstOver(5000, 0.5), 84, 0],
        ['primo n oltre 0,9, N = 5 000', firstOver(5000, 0.9), 152, 0],
        ['primo n oltre 1/2, N = 10', firstOver(10, 0.5), 5, 0],
        ['primo n oltre 0,9, N = 10', firstOver(10, 0.9), 7, 0],
        ['la stima 1,1774 √365 vale 22,5', 1.1774 * Math.sqrt(365), 22.49419541570669, 1e-9],
        ['le soglie stanno sempre dentro l’asse', fuori, 0, 0],
        ['l’asse per N = 365 arriva a 80', calc({ n: 23, N: 365 }).xmax, 80, 0],
        ['il testo riporta lo 0,5073, cioè il 50,7 %', out.includes('0,5073, cioè <span class="gi-hl">50,7') ? 1 : 0, 1, 0],
        ['il testo riporta 0,4927', out.includes('0,4927') ? 1 : 0, 1, 0],
        // vicino a 1 il risultato non è 100 %: «cioè più di 99,9 %», senza «= più di»
        ['n = 75, N = 100: «cioè più di 99,9 %» e non «100 %»', (() => { const o = W.render({ n: 75, N: 100 }).out; return o.includes(', cioè <span class="gi-hl">più di 99,9\u00a0%</span>') && !o.includes('= più di') && !o.includes('100\u00a0%') ? 1 : 0; })(), 1, 0],
        ['n = 11, N = 10: più estrazioni che valori, 100 %', W.render({ n: 11, N: 10 }).out.includes('<span class="gi-hl">100\u00a0%</span>') ? 1 : 0, 1, 0],
      ];
    },
  });
})();
