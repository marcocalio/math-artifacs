/* gi-parte4.js — grafici interattivi della Parte 4 (generato da lavoro-probabilita/grafici/build.py: non modificare a mano) */

/* ---- chebyshev.js (sezione 4.2) ---- */
(function () {
  'use strict';
  /* 4.2 · Disuguaglianza di Chebyshev: le code oltre kσ e il limite 1/k² */
  const { n, sci, v, p: P } = GI;
  const { tx, ln, rect, path, f, C, SANS } = GI.H;
  const { binomPmf, poisPmf, erfc } = GI.m;

  /* disegno: asse in deviazioni standard dalla media, da −5,5σ a +5,5σ */
  const W = 560, ZM = 5.5, L = 28, R = 532, T = 40, B = 204;
  const Zx = P.scale(-ZM, ZM, L, R);
  const NB = ' ';
  const EPS = 1e-9; // tolleranza nel confronto |X − μ| ≥ kσ (j e kσ possono coincidere)
  const SQ3 = Math.sqrt(3);

  /* Ogni legge ha media mu e deviazione standard sd; tails(k) dà [P(X ≤ μ − kσ), P(X ≥ μ + kσ)].
     Nel disegno compare la variabile standardizzata Z = (X − μ)/σ: pdf è la densità di Z (continue),
     oppure pmf(j)·σ in colonne larghe 1/σ (discrete), così l'area resta la probabilità. */
  const discreta = (mu, sd, jmax, pmf) => ({
    discreta: true, mu, sd, jmax, pmf,
    peak: Math.max(...Array.from({ length: jmax + 1 }, (_, j) => pmf(j))) * sd,
    tails(k) {
      let a = 0, b = 0;
      for (let j = 0; j <= jmax; j++) {
        const d = j - mu;
        if (Math.abs(d) >= k * sd - EPS) { if (d < 0) a += pmf(j); else b += pmf(j); }
      }
      return [a, b];
    },
  });
  const LAWS = {
    norm: { // normale con μ = 500 e σ = 40
      mu: 500, sd: 40, lo: -Infinity, hi: Infinity, peak: GI.m.phi(0), pdf: GI.m.phi,
      tails: (k) => { const t = erfc(k / Math.SQRT2) / 2; return [t, t]; },
    },
    unif: { // uniforme su [0, 1]: Z uniforme su [−√3, √3]
      mu: 0.5, sd: 1 / (2 * SQ3), lo: -SQ3, hi: SQ3, peak: 1 / (2 * SQ3), pdf: () => 1 / (2 * SQ3),
      tails: (k) => { const t = Math.max(0, 1 - k / SQ3) / 2; return [t, t]; },
    },
    exp: { // esponenziale con λ = 1: μ = σ = 1, Z ≥ −1
      mu: 1, sd: 1, lo: -1, hi: Infinity, peak: 1, pdf: (z) => (z < -1 ? 0 : Math.exp(-(z + 1))),
      tails: (k) => [k < 1 ? 1 - Math.exp(-(1 - k)) : 0, Math.exp(-(1 + k))],
    },
    bin: discreta(3, Math.sqrt(2.1), 10, (j) => binomPmf(10, 0.3, j)), // binomiale n = 10, p = 0,3
    pois: discreta(4, 2, 100, (j) => poisPmf(4, j)), // Poisson con λ = 4
  };

  function calc(s) {
    const law = LAWS[s.legge] || LAWS.norm, k = s.k;
    const [tl, tr] = law.tails(k);
    const exact = Math.max(0, Math.min(1, tl + tr));
    return { law, k, mu: law.mu, sd: law.sd, a: law.mu - k * law.sd, b: law.mu + k * law.sd, tl, tr, exact, bound: 1 / (k * k) };
  }

  /* ---------- formati ---------- */
  const trim = (x) => (x.includes(',') ? x.replace(/0+$/, '').replace(/,$/, '') : x);
  const num = (x) => trim(n(x, Math.abs(x) >= 100 ? 0 : Math.abs(x) >= 10 ? 1 : 3)); // 500, 0,289, 1,449
  const pr = (x) => (x === 0 ? '0' : x >= 0.001 ? trim(n(x, 4)) : sci(x, 2));
  const pc = (x, dec) => trim(n(x * 100, dec)) + NB + '%';
  const il = (x, dec) => { const t = pc(x, dec); return (/^(1|11|8\d?)[,\s]/.test(t) ? 'l’' : 'il ') + t; }; // il 75 %, l’88,9 %, l’11 %
  const coppia = (a, b) => (a.includes(',') || b.includes(',') ? a + '; ' + b : a + ', ' + b); // con la virgola decimale si separa col punto e virgola
  const zlab = (z) => (z === 0 ? 'μ' : (z < 0 ? '−' : '+') + Math.abs(z) + 'σ');

  /* ---------- pezzi del disegno ---------- */
  /* contorno della densità fra a e b (ritagliato al sostegno): parte dalla base e torna alla base */
  function trace(law, a, b, Y) {
    const lo = Math.max(a, law.lo), hi = Math.min(b, law.hi);
    if (!(hi - lo > 1e-9)) return null;
    const st = Math.max(4, Math.ceil((140 * (hi - lo)) / (2 * ZM)));
    let d = `M${f(Zx(lo))} ${f(B)}`;
    for (let i = 0; i <= st; i++) { const z = lo + ((hi - lo) * i) / st; d += `L${f(Zx(z))} ${f(Y(law.pdf(z)))}`; }
    return d + `L${f(Zx(hi))} ${f(B)}`;
  }
  const fill = (d, at) => (d ? path(d + 'Z', { stroke: 'none', ...at }) : '');

  GI.add('chebyshev', {
    sec: '4.2',
    title: 'Le code oltre <var>k</var> deviazioni standard',
    w: W,
    h: 372,
    alt: 'Un grafico con l’asse in deviazioni standard dalla media μ. Sopra, la densità o l’istogramma della legge scelta: la parte fra μ − kσ e μ + kσ è azzurra, le due code oltre queste soglie sono arancioni. Sotto, due barre su una scala da 0 a 1: quella arancione è la probabilità esatta delle code, quella viola è il limite di Chebyshev 1/k²; la barra arancione non supera mai quella viola. Muovendo k o cambiando legge cambiano le code e le barre; per k minore o uguale a 1 la barra viola riempie tutta la scala. I numeri precisi sono scritti sotto il disegno.',
    controls: [
      { id: 'k', label: 'Soglia <var>k</var> (in deviazioni standard)', min: 0.5, max: 5, step: 0.25, value: 2, fmt: (x) => trim(n(x, 2)) },
      {
        id: 'legge', kind: 'select', label: '<span>Legge di <var>X</var></span>', value: 'norm',
        options: [['norm', 'Normale (μ = 500, σ = 40)'], ['unif', 'Uniforme su [0, 1]'], ['exp', 'Esponenziale (λ = 1)'], ['bin', 'Binomiale (n = 10, p = 0,3)'], ['pois', 'Poisson (λ = 4)']],
      },
    ],
    presets: [
      { label: 'L’esempio del testo: k = 2', set: { legge: 'norm', k: 2 } },
      { label: 'k = 1: il limite non dice niente', set: { legge: 'norm', k: 1 } },
      { label: 'Una coda sola: esponenziale', set: { legge: 'exp', k: 3 } },
      { label: 'Una legge discreta: Poisson', set: { legge: 'pois', k: 2 } },
    ],
    caption: 'Qui la legge di <var>X</var> la scegli tu: la disuguaglianza vale per qualunque legge con media e varianza finite. L’asse conta le deviazioni standard dalla media (lo 0 è <var>μ</var>, ogni tacca è una <var>σ</var>); per le leggi discrete c’è una colonna per ogni valore. Zone arancioni: le code |<var>X</var> − <var>μ</var>| ≥ <var>kσ</var>; zona azzurra: l’intervallo (<var>μ</var> − <var>kσ</var>, <var>μ</var> + <var>kσ</var>). Sotto, su una scala da 0 a 1: la barra arancione è la probabilità esatta delle code, la barra viola è il limite 1/<var>k</var><sup>2</sup>, e la prima non supera mai la seconda.',
    prove: [
      'Porta <var>k</var> a 1 e poi a 0,5: quanto vale il limite 1/<var>k</var><sup>2</sup>, e che cosa ti dice sulla probabilità delle code?',
      'Con <var>k</var> = 2 scorri le cinque leggi: la barra viola resta ferma, quella arancione cambia. Per quale legge è più lunga, e per quale sparisce?',
    ],
    calc,
    render(s) {
      const c = calc(s), law = c.law, k = c.k, sd = c.sd;
      const ymax = law.peak * 1.12, Y = (d) => B - (d / ymax) * (B - T);
      let svg = '';

      /* densità o istogramma: azzurro dentro, arancione nelle code */
      if (law.discreta) {
        const bw = ((R - L) / (2 * ZM) / sd) * 0.9;
        for (let j = 0; j <= law.jmax; j++) {
          const z = (j - law.mu) / sd, h = law.pmf(j) * sd;
          if (Math.abs(z) > ZM || ((h / ymax) * (B - T)) < 0.4) continue;
          const tail = Math.abs(j - law.mu) >= k * sd - EPS;
          svg += rect(Zx(z) - bw / 2, Y(h), bw, B - Y(h), tail ? { fill: C.B, fo: 0.8, stroke: C.B, sw: 1.2 } : { fill: C.A, fo: 0.3, stroke: C.A, sw: 1.6 });
        }
      } else {
        svg += fill(trace(law, -k, k, Y), { fill: C.A, fo: 0.22 });
        svg += fill(trace(law, -ZM, -k, Y), { fill: C.B, fo: 0.75 }) + fill(trace(law, k, ZM, Y), { fill: C.B, fo: 0.75 });
        const top = trace(law, -ZM, ZM, Y);
        if (top) svg += path(top, { stroke: C.A, sw: 2.6, lj: 'round' });
      }

      /* asse: tacche a ogni σ, scritte ogni due */
      for (let z = -5; z <= 5; z += 2) svg += ln(Zx(z), B, Zx(z), B + 5, { stroke: C.soft, sw: 1.4 });
      svg += P.axes({ X: Zx, Y, box: [L, T, R, B], noy: true, xt: [-4, -2, 0, 2, 4], xf: zlab, xl: 'scostamento dalla media, in σ' });

      /* le due soglie μ − kσ e μ + kσ */
      const xl = Zx(-k), xr = Zx(k), lw = 70, mk = { stroke: C.B, sw: 2.2, da: '6 4' };
      const leftOk = xl - lw > 4, rightOk = xr + lw < W - 4;
      svg += ln(xl, B, xl, T - 6, mk) + ln(xr, B, xr, T - 6, mk);
      svg += tx(leftOk ? xl - 5 : xl + 5, 24, 'μ − *k*σ', { size: 20, fill: C.B, fw: 700, ta: leftOk ? 'end' : 'start' });
      svg += tx(rightOk ? xr + 5 : xr - 5, 24, 'μ + *k*σ', { size: 20, fill: C.B, fw: 700, ta: rightOk ? 'start' : 'end' });

      /* confronto su una scala da 0 a 1: probabilità esatta delle code e limite 1/k² */
      const X0 = 170, X1 = 532, BX = P.scale(0, 1, X0, X1), R1 = 276, R2 = 314, BH = 26;
      for (const q of [0.25, 0.5, 0.75]) svg += ln(BX(q), R1 - 5, BX(q), R2 + BH + 5, { stroke: 'var(--quadretto)', sw: 1 });
      svg += rect(X0, R1, X1 - X0, BH, { stroke: C.soft, sw: 1.3, so: 0.7 }) + rect(X0, R2, X1 - X0, BH, { stroke: C.soft, sw: 1.3, so: 0.7 });
      if (c.exact > 0) svg += rect(X0, R1, Math.max(1.5, c.exact * (X1 - X0)), BH, { fill: C.B, fo: 0.85 });
      const big = c.bound >= 1, wl = Math.min(1, c.bound) * (X1 - X0);
      svg += rect(X0, R2, wl, BH, { fill: C.C, fo: big ? 0.3 : 0.8 });
      if (big) svg += tx((X0 + X1) / 2, R2 + 19, 'non dice niente', { ff: SANS, size: 17 });
      else svg += ln(X0 + wl, R1 - 7, X0 + wl, R2 + BH + 7, { stroke: C.C, sw: 1.8, da: '4 4' });
      svg += tx(X0 - 10, R1 + 19, 'esatta', { ff: SANS, size: 19, fw: 700, fill: C.B, ta: 'end' });
      svg += tx(X0 - 10, R2 + 19, 'limite 1/*k*²', { ff: SANS, size: 19, fw: 700, fill: C.C, ta: 'end' });
      for (const [q, lab] of [[0, '0'], [0.5, '0,5'], [1, '1']]) svg += tx(BX(q), R2 + BH + 24, lab, { ff: SANS, size: 16, fill: C.soft });

      /* lettura */
      const kk = trim(n(k, 2)), int = Math.abs(k - Math.round(k)) < 1e-9;
      const note = c.tl === 0 && c.tr === 0 ? ' (in nessuna delle due c’è probabilità)' : c.tl === 0 ? ' (a sinistra non c’è probabilità)' : c.tr === 0 ? ' (a destra non c’è probabilità)' : '';
      const lower = Math.max(0, 1 - c.bound), inside = 1 - c.exact;
      const lim = big
        ? `1/${v('k')}<sup>2</sup> = ${trim(n(c.bound, 2))}: il limite è ≥ 1 e non dice niente.`
        : `<span class="gi-hl">1/${v('k')}<sup>2</sup></span> = ${int ? `1/${n(k * k, 0)} = ` : ''}${pr(c.bound)}, e la probabilità esatta non lo supera.`;
      const out = `<p>${v('μ')} = ${num(c.mu)} e ${v('σ')} = ${num(sd)}. Con ${v('k')} = ${kk} la soglia è ${v('kσ')} = ${num(k * sd)}: le code sono ${v('X')} ≤ ${num(c.a)} e ${v('X')} ≥ ${num(c.b)}${note}.</p>
  <p>Probabilità esatta delle code: <span class="gi-hl">${pr(c.exact)}</span>. Limite di Chebyshev ${lim}</p>
  <p>Nell’intervallo (${coppia(num(c.a), num(c.b))}) ${c.exact === 0 ? 'c’è tutta la probabilità' : 'c’è ' + (inside > 0.99995 ? 'più del 99,99' + NB + '%' : il(inside, 2)) + ' della probabilità'}; Chebyshev ${lower > 0 ? 'ne garantisce almeno ' + il(lower, 1) : 'non garantisce niente'}.</p>`;
      return { svg, out };
    },
    selftest() {
      const W_ = GI.widgets.chebyshev, d = GI.defaults(W_), out = W_.render(d).out;
      const ex = (legge, k) => calc({ legge, k }).exact;
      // massima violazione di «esatta ≤ 1/k²» su tutte le leggi e tutti i k del cursore
      let worst = 0;
      for (const legge of Object.keys(LAWS)) for (let k = 0.5; k <= 5; k += 0.25) worst = Math.max(worst, ex(legge, k) - 1 / (k * k));
      // la media e la varianza dichiarate coincidono con quelle calcolate dalla pmf (binomiale e Poisson)
      const mom = (law) => { let m = 0, q = 0; for (let j = 0; j <= law.jmax; j++) { m += j * law.pmf(j); q += j * j * law.pmf(j); } return [m, q - m * m]; };
      const [mb, vb] = mom(LAWS.bin), [mp, vp] = mom(LAWS.pois);
      // area della densità standardizzata dell'esponenziale (regola dei trapezi su [−1, 40])
      let area = 0; const N = 40000, h = 41 / N;
      for (let i = 0; i < N; i++) area += h * (LAWS.exp.pdf(-1 + i * h) + LAWS.exp.pdf(-1 + (i + 1) * h)) / 2;
      // probabilità dentro l'intervallo, sommando le pmf con |j − μ| < kσ: è il complementare delle code
      const dentro = (law, k) => { let t = 0; for (let j = 0; j <= law.jmax; j++) if (Math.abs(j - law.mu) < k * law.sd - EPS) t += law.pmf(j); return t; };
      return [
        // python3 -I -c "from scipy import stats; print(2*stats.norm.sf(2))"
        ['normale, k = 2', ex('norm', 2), 0.045500263896358396, 1e-12],
        // python3 -I -c "from scipy import stats; print(2*stats.norm.sf(1.75))"
        ['normale, k = 1,75', ex('norm', 1.75), 0.08011831372763419, 1e-12],
        // python3 -I -c "from scipy import stats; print(2*stats.norm.sf(5))"
        ['normale, k = 5', ex('norm', 5), 5.733031437583869e-07, 1e-14],
        // python3 -I -c "import math; print(1-1/math.sqrt(3))"
        ['uniforme, k = 1', ex('unif', 1), 0.42264973081037416, 1e-12],
        // python3 -I -c "import math; print(math.exp(-3))"
        ['esponenziale, k = 2', ex('exp', 2), 0.049787068367863944, 1e-12],
        // python3 -I -c "import math; print(math.exp(-1.5)+1-math.exp(-0.5))"
        ['esponenziale, k = 0,5', ex('exp', 0.5), 0.6165995004357965, 1e-12],
        // python3 -I -c "from scipy import stats; b=stats.binom(10,0.3); print(b.pmf(0)+b.sf(5))"   (|X−3| ≥ 2σ ⟺ X = 0 oppure X ≥ 6)
        ['binomiale, k = 2', ex('bin', 2), 0.07559651229999999, 1e-12],
        // python3 -I -c "from scipy import stats; b=stats.binom(10,0.3); print(b.sf(7))"   (k = 3: X ≥ 8, la coda sinistra è vuota)
        ['binomiale, k = 3', ex('bin', 3), 0.0015903863999999995, 1e-12],
        // python3 -I -c "from scipy import stats; p=stats.poisson(4); print(p.pmf(0)+p.sf(7))"   (kσ = 4 cade esattamente su un intero)
        ['Poisson, k = 2', ex('pois', 2), 0.06944925468158147, 1e-12],
        // python3 -I -c "from scipy import stats; p=stats.poisson(4); print(p.cdf(1)+p.sf(6))"   (kσ = 3: estremi inclusi)
        ['Poisson, k = 1,5', ex('pois', 1.5), 0.2022521728462445, 1e-12],
        // python3 -I -c "print(16/49)"
        ['limite 1/k² per k = 1,75', calc({ legge: 'norm', k: 1.75 }).bound, 0.32653061224489793, 1e-15],
        // python3 -I -c "import math; print(1/(2*math.sqrt(3)))"
        ['σ dell’uniforme su [0, 1]', LAWS.unif.sd, 0.2886751345948129, 1e-15],
        ['«esatta ≤ limite» ovunque', Math.max(0, worst), 0, 0],
        ['media binomiale dalla pmf', mb, 3, 1e-12],
        ['varianza binomiale dalla pmf', vb, 2.1, 1e-12],
        ['media di Poisson dalla pmf', mp, 4, 1e-12],
        ['varianza di Poisson dalla pmf', vp, 4, 1e-12],
        ['densità standardizzata dell’esponenziale: area 1', area, 1, 1e-6],
        ['dentro + code = 1 (binomiale, k = 2)', dentro(LAWS.bin, 2) + ex('bin', 2), 1, 1e-12],
        ['dentro + code = 1 (Poisson, k = 1)', dentro(LAWS.pois, 1) + ex('pois', 1), 1, 1e-12],
        ['la lettura riporta 0,0455 e 0,25', out.includes('0,0455') && out.includes('0,25') ? 1 : 0, 1, 0],
        // python3 -I -c "import math; print(100*(1-math.exp(-2)))"   (86,47 %: davanti all’8 si scrive «l’»)
        ['la lettura scrive «c’è l’86,47 %» (esponenziale, k = 1)', W_.render({ legge: 'exp', k: 1 }).out.includes('c’è l’86,47' + NB + '%') ? 1 : 0, 1, 0],
        ['la lettura scrive «almeno il 75 %» (k = 2)', out.includes('almeno il 75' + NB + '%') ? 1 : 0, 1, 0],
        ['con la virgola decimale l’intervallo usa il punto e virgola', W_.render({ legge: 'bin', k: 2 }).out.includes('(0,102; 5,898)') ? 1 : 0, 1, 0],
      ];
    },
  });
})();

/* ---- lgn.js (sezione 4.6) ---- */
(function () {
  'use strict';
  /* 4.6 · Legge debole dei grandi numeri: venti percorsi della media M_n dentro la fascia μ ± ε */
  const { n, pct, sci, p: P } = GI;
  const { tx, ln, rect, circ, path, f, C, SANS } = GI.H;

  const NP = 20; // percorsi disegnati (uno solo è evidenziato)
  const TOL = 1e-9; // |M_n − μ| = ε esatto (capita con le monete) conta come «fuori», come nel testo: ≥ ε
  const W = 572, H = 332, L = 56, R = 504, T = 34, B = 268;

  /* Ogni legge: cosa è un'osservazione, media mu, varianza sig2, valori possibili fra lo e hi, e draw(u) che trasforma un numero u di [0, 1) in un valore */
  const LAWS = {
    moneta: { cosa: '1 se esce testa, 0 se esce croce', mu: 0.5, sig2: 0.25, lo: 0, hi: 1, draw: (u) => (u < 0.5 ? 1 : 0) },
    dado: { cosa: 'il numero che esce', mu: 3.5, sig2: 35 / 12, lo: 1, hi: 6, draw: (u) => 1 + Math.floor(6 * u) },
    unif: { cosa: 'un numero scelto a caso in [0, 1] (uniforme)', mu: 0.5, sig2: 1 / 12, lo: 0, hi: 1, draw: (u) => u },
  };

  /* Venti percorsi indipendenti di osservazioni. Ogni percorso ha il suo generatore (seme: seed·1000 + i),
     quindi alzando n i percorsi si allungano senza cambiare la parte già disegnata. */
  function sim(s) {
    const law = LAWS[s.legge] || LAWS.moneta;
    const N = Math.max(1, Math.round(s.nmax)), eps = Math.max(1e-6, s.eps), seed = Math.round(s.seed || 1);
    const st = Math.max(1, Math.floor(N / 180)); // dopo i primi 30 passi si disegna un punto ogni st passi, e l'ultimo
    const lines = [], sums = [], outs = [];
    let nout = 0;
    for (let i = 0; i < NP; i++) {
      const r = GI.rng(seed * 1000 + i), pts = [];
      let S = 0;
      for (let k = 1; k <= N; k++) {
        S += law.draw(r());
        if (k <= 30 || k % st === 0 || k === N) pts.push(k, S / k);
      }
      const out = Math.abs(S / N - law.mu) >= eps - TOL;
      lines.push(pts); sums.push(S); outs.push(out);
      if (out) nout++;
    }
    return { law, N, eps, lines, sums, outs, nout, bound: law.sig2 / (N * eps * eps) };
  }

  /* ---------- formati ---------- */
  const trim = (x) => (x.includes(',') ? x.replace(/0+$/, '').replace(/,$/, '') : x);
  const num = (x) => trim(n(x, 4));
  /* la maggiorazione con le cifre che servono a rifare il conto (1,25 e non 1,3); sotto 1 non si scrive mai «1» */
  const bnd = (b) => {
    if (b >= 100) return n(b, 0);
    if (b >= 10) return trim(n(b, 1));
    if (b >= 1) return trim(n(b, 2));
    if (b >= 0.1) { const r = trim(n(b, 3)); return r === '1' ? '0,999' : r; }
    return b >= 0.001 ? trim(sci(b, 2)) : sci(b, 2);
  };
  const cosi = (k) => (k === 1 ? 'percorso' : 'percorsi');

  GI.add('lgn', {
    sec: '4.6',
    title: 'La media <var>M</var><sub><var>n</var></sub> si concentra attorno a <var>μ</var>',
    w: W,
    h: H,
    alt: 'Venti percorsi della media M_n delle prime n osservazioni, al crescere di n da sinistra a destra. Un percorso è arancione, gli altri sono azzurri e sottili. Una linea punteggiata segna la media μ e una fascia verde copre l’intervallo da μ − ε a μ + ε. All’inizio i percorsi sono molto dispersi e possono uscire dal riquadro; al crescere di n si stringono attorno a μ ed entrano nella fascia. La scala verticale si adatta alla larghezza della fascia e al numero di osservazioni. A destra, un puntino per percorso: verde se il percorso è dentro la fascia, rosso se è fuori. Muovendo il numero di osservazioni, l’ampiezza ε o la legge cambiano l’estensione del disegno, la larghezza della fascia e quanti puntini sono rossi; sotto il disegno sono scritti la frazione dei percorsi fuori dalla fascia e la maggiorazione di Chebyshev.',
    controls: [
      {
        id: 'legge', kind: 'select', label: '<span>Legge di ogni osservazione <var>X</var><sub><var>i</var></sub></span>', value: 'moneta',
        options: [['moneta', 'Moneta equa: 1 testa, 0 croce'], ['dado', 'Lancio di un dado'], ['unif', 'Numero a caso in [0, 1]']],
      },
      { id: 'nmax', label: 'Numero di osservazioni (<var>n</var>)', min: 10, max: 2000, value: 1000, log: true, fmt: (x) => n(x, 0) }, // senza int: il cursore dà numeri con 3 cifre (…, 999, 1 000, 1 010, …), e la simulazione li arrotonda: così n = 1 000 si raggiunge
      { id: 'eps', label: 'Mezza larghezza della fascia (<var>ε</var>)', min: 0.01, max: 0.5, step: 0.005, value: 0.05, fmt: (x) => trim(n(x, 3)) },
    ],
    presets: [
      { label: 'L’esempio del testo: n = 1 000', set: { legge: 'moneta', nmax: 1000, eps: 0.05 } },
      { label: 'Pochi lanci: n = 50', set: { legge: 'moneta', nmax: 50, eps: 0.05 } },
      { label: 'Fascia stretta: ε = 0,01', set: { legge: 'moneta', nmax: 2000, eps: 0.01 } },
      { label: 'Il dado (media 3,5)', set: { legge: 'dado', nmax: 1000, eps: 0.2 } },
      { label: 'Un numero a caso in [0, 1]', set: { legge: 'unif', nmax: 1000, eps: 0.05 } },
    ],
    seeded: true,
    caption: 'Ogni linea è un percorso: una sequenza di osservazioni indipendenti, di cui in ogni punto vedi la media <var>M</var><sub><var>n</var></sub> delle prime <var>n</var> (quella arancione è solo evidenziata). La linea punteggiata, al centro, è <var>μ</var>; la fascia verde va da <var>μ</var> − <var>ε</var> a <var>μ</var> + <var>ε</var>. Ogni puntino a destra è un percorso dopo <var>n</var> osservazioni: verde se è dentro la fascia, rosso se dista da <var>μ</var> almeno <var>ε</var>. Venti percorsi sono pochi: la frazione dei rossi dà solo un’idea grossolana di <var>P</var>(|<var>M</var><sub><var>n</var></sub> − <var>μ</var>| ≥ <var>ε</var>); «Rilancia» ne genera altri venti. Per <var>n</var> piccolo le medie sono molto disperse e le linee escono dal riquadro.',
    prove: [
      'Con la moneta equa e <var>ε</var> = 0,05, da quale <var>n</var> in poi la maggiorazione di Chebyshev scende sotto 1? A quel punto, la frazione dei percorsi fuori dalla fascia (premi «Rilancia» qualche volta) è vicina alla maggiorazione o molto più piccola?',
      'Dimezza <var>ε</var> da 0,05 a 0,025 senza toccare <var>n</var>: quante volte più grande diventa la maggiorazione di Chebyshev? E i puntini rossi, premendo «Rilancia» più volte, diventano più o meno numerosi?',
    ],
    render(s) {
      const c = sim(s), law = c.law, N = c.N, eps = c.eps, mu = law.mu;
      /* finestra verticale: attorno a μ, larga abbastanza per la fascia e per la dispersione di M_n al passo n;
         i primi passi, più dispersi, escono dal riquadro (ritagliati) */
      const pad = 0.05 * (law.hi - law.lo), h = 1.5 * Math.max(eps, 2.2 * Math.sqrt(law.sig2 / N));
      const ylo = Math.max(law.lo - pad, mu - h), yhi = Math.min(law.hi + pad, mu + h);
      const X = P.scale(0, N, L, R), Y = P.scale(yhi, ylo, T, B), Yc = (y) => Math.min(B - 4, Math.max(T + 4, Y(y)));
      const yt = P.nice(ylo, yhi, 4), dec = yt.length > 1 ? Math.max(0, Math.ceil(-Math.log10(yt[1] - yt[0]) - 1e-9)) : 1;
      const yUp = Math.max(T, Y(mu + eps)), yDn = Math.min(B, Y(mu - eps));
      /* poligonale ritagliata alla fascia orizzontale [T, B]: i tratti fuori dal riquadro non si disegnano */
      const dpath = (a) => {
        let d = '', pen = false, px = X(a[0]), py = Y(a[1]);
        if (py >= T && py <= B) { d += 'M' + f(px) + ' ' + f(py); pen = true; }
        for (let j = 2; j < a.length; j += 2) {
          const x = X(a[j]), y = Y(a[j + 1]), dy = y - py;
          let t0 = 0, t1 = 1;
          if (dy === 0) { if (py < T || py > B) t0 = 2; } else {
            const ta = (T - py) / dy, tb = (B - py) / dy;
            t0 = Math.max(0, Math.min(ta, tb)); t1 = Math.min(1, Math.max(ta, tb));
          }
          if (t0 <= t1) {
            if (!pen || t0 > 0) d += 'M' + f(px + (x - px) * t0) + ' ' + f(py + dy * t0);
            d += 'L' + f(px + (x - px) * t1) + ' ' + f(py + dy * t1);
            pen = t1 === 1;
          } else pen = false;
          px = x; py = y;
        }
        return d;
      };
      /* fascia μ ± ε e linea di μ */
      let svg = rect(L, yUp, R - L, yDn - yUp, { fill: 'var(--verde)', fo: 0.16 });
      if (Y(mu + eps) > T + 1) svg += ln(L, Y(mu + eps), R, Y(mu + eps), { stroke: 'var(--verde)', sw: 1.5, da: '6 4' });
      if (Y(mu - eps) < B - 1) svg += ln(L, Y(mu - eps), R, Y(mu - eps), { stroke: 'var(--verde)', sw: 1.5, da: '6 4' });
      svg += ln(L, Y(mu), R, Y(mu), { stroke: C.soft, sw: 1.4, da: '2 4' });
      svg += P.axes({ X, Y, box: [L, T, R, B], xt: P.nice(0, N, 5), yt, yf: (y) => n(y, dec), xl: '*n*' });
      /* i percorsi: diciannove linee deboli e la prima evidenziata */
      for (let i = NP - 1; i >= 1; i--) svg += path(dpath(c.lines[i]), { stroke: C.A, sw: 1.2, so: 0.4, lj: 'round' });
      svg += path(dpath(c.lines[0]), { stroke: C.B, sw: 2.4, lj: 'round' });
      /* i venti percorsi al passo n: puntini sul bordo destro */
      for (let i = 0; i < NP; i++) svg += circ(R, Yc(c.sums[i] / N), 4.2, { fill: c.outs[i] ? 'var(--rosso)' : 'var(--verde)', fo: 0.85, stroke: C.paper, sw: 1 });
      svg += circ(R, Yc(c.sums[0] / N), 7.5, { stroke: C.B, sw: 2 });
      svg += tx(R + 15, Y(mu) + 5, '*μ* ± *ε*', { ff: SANS, size: 16, fill: 'var(--verde)', ta: 'start', fw: 700 });
      svg += tx(L, T - 10, '*M_n*', { ff: SANS, size: 20, fill: C.soft, ta: 'start' }); // corpo 20: il pedice (0,7 × 20) resta ≥ 14

      const k = c.nout, b = c.bound;
      const lim = `<span class="gi-hl">${bnd(b)}</span>` + (b >= 1 - 1e-9 ? ': una probabilità non supera 1, quindi la maggiorazione non dice niente' : '');
      const out = `<p>Ogni osservazione <var>X</var><sub><var>i</var></sub>: ${law.cosa}. Media <var>μ</var> = ${num(law.mu)}, varianza <var>σ</var><sup>2</sup> = ${num(law.sig2)}.</p>
  <p>Con <var>n</var> = ${n(N, 0)} osservazioni, fuori dalla fascia (cioè con |<var>M</var><sub><var>n</var></sub> − <var>μ</var>| ≥ <var>ε</var> = ${num(eps)}): <span class="gi-hl">${k} ${cosi(k)} su ${NP}</span> (${pct(k / NP, 0)}).</p>
  <p>Chebyshev: <var>P</var>(|<var>M</var><sub><var>n</var></sub> − <var>μ</var>| ≥ <var>ε</var>) ≤ <var>σ</var><sup>2</sup>/(<var>nε</var><sup>2</sup>) = ${num(law.sig2)} / (${n(N, 0)} × ${num(eps)}<sup>2</sup>) = ${lim}.</p>`;
      return { svg, out };
    },
    selftest() {
      const wg = GI.widgets.lgn, d = GI.defaults(wg), out = wg.render(d).out;
      /* momenti di una legge dalla griglia di 6000 valori di u (indipendente dai valori mu e sig2 dichiarati) */
      const mom = (law) => {
        const M = 6000, xs = Array.from({ length: M }, (_, j) => law.draw((j + 0.5) / M)), m = xs.reduce((a, x) => a + x, 0) / M;
        return [m, xs.reduce((a, x) => a + (x - m) ** 2, 0) / M];
      };
      /* frazione media di percorsi fuori dalla fascia su 300 semi (6000 percorsi) */
      const frac = (legge, nmax, eps) => {
        let t = 0;
        for (let sd = 1; sd <= 300; sd++) t += sim({ legge, nmax, eps, seed: sd }).nout;
        return t / (300 * NP);
      };
      const stab = (() => { // alzando n i percorsi si allungano: M_100 di nmax = 100 e di nmax = 200 coincidono
        const a = sim({ legge: 'dado', nmax: 100, eps: 0.2, seed: 4 }), b = sim({ legge: 'dado', nmax: 200, eps: 0.2, seed: 4 });
        return Math.max(...a.lines.map((l, i) => { const q = b.lines[i]; const j = q.indexOf(100); return Math.abs(l[l.length - 1] - q[j + 1]); }));
      })();
      return [
        // python3 -I -c "print(sum((x-3.5)**2 for x in range(1,7))/6)"  → 2.9166666666666665
        ['dado: σ² dichiarata = 35/12', LAWS.dado.sig2, 2.9166666666666665, 1e-12],
        ['dado: σ² dalla griglia di u', mom(LAWS.dado)[1], 2.9166666666666665, 1e-9],
        // python3 -I -c "print(0.5*0.5)"  → 0.25 (testa con p = 1/2: σ² = p(1 − p))
        ['moneta: σ² dalla griglia', mom(LAWS.moneta)[1], 0.25, 1e-9],
        // python3 -I -c "print(1/12)"  → 0.08333333333333333 (la griglia dà 1/12 − 1/(12·6000²))
        ['uniforme: σ² dalla griglia', mom(LAWS.unif)[1], 0.08333333333333333, 1e-8],
        // python3 -I -c "print(0.25/(1000*0.05**2))"  → 0.09999999999999998
        ['Chebyshev del testo (moneta, n = 1000, ε = 0,05)', sim(d).bound, 0.1, 1e-12],
        // la tabella del testo, c/n con c = σ²/ε² = 100: python3 -I -c "print([100/n for n in (50, 100, 1000)])"  → [2.0, 1.0, 0.1]
        ['tabella del testo: n = 50', sim({ legge: 'moneta', nmax: 50, eps: 0.05, seed: 1 }).bound, 2, 1e-12],
        ['tabella del testo: n = 100', sim({ legge: 'moneta', nmax: 100, eps: 0.05, seed: 1 }).bound, 1, 1e-12],
        // python3 -I -c "print(35/12/(1000*0.2**2))"  → 0.07291666666666664
        ['Chebyshev del dado (n = 1000, ε = 0,2)', sim({ legge: 'dado', nmax: 1000, eps: 0.2, seed: 1 }).bound, 0.07291666666666664, 1e-12],
        // Le somme seguenti vengono da una copia in Python del generatore rng (mulberry32, tutto modulo 2**32, M = 2**32 − 1):
        //   a = (seme + 0x6d2b79f5) & M;  a = (a + 0x6d2b79f5) & M;  t = ((a ^ (a >> 15)) * (1 | a)) & M
        //   t = (((t + (((t ^ (t >> 7)) * (61 | t)) & M)) & M) ^ t);  u = ((t ^ (t >> 14)) & M) / 2**32
        // con il seme del percorso i uguale a seed·1000 + i, e la legge applicata a u come in LAWS.
        // Somma dei primi 100 lanci del percorso 0 (seme 1000, moneta): 51
        ['moneta: somma dei primi 100 lanci del percorso 0', sim({ legge: 'moneta', nmax: 100, eps: 0.05, seed: 1 }).sums[0], 51, 0],
        // percorsi con |S_100/100 − 0,5| ≥ 0,05 fra i venti del seme 1: 2
        ['moneta: percorsi fuori a n = 100', sim({ legge: 'moneta', nmax: 100, eps: 0.05, seed: 1 }).nout, 2, 0],
        // moneta, seme 1, n = 50, ε = 0,05: percorsi fuori = 10
        ['moneta: percorsi fuori a n = 50', sim({ legge: 'moneta', nmax: 50, eps: 0.05, seed: 1 }).nout, 10, 0],
        // dado, seme 3, percorso 5, 500 lanci: somma 1758
        ['dado: somma di 500 lanci del percorso 5', sim({ legge: 'dado', nmax: 500, eps: 0.2, seed: 3 }).sums[5], 1758, 0],
        // uniforme, seme 2, percorso 7, 300 numeri: 148.2630164034199
        ['uniforme: somma di 300 numeri del percorso 7', sim({ legge: 'unif', nmax: 300, eps: 0.05, seed: 2 }).sums[7], 148.2630164034199, 1e-9],
        ['i percorsi si allungano senza cambiare', stab, 0, 1e-12],
        // python3 -I -c "from math import comb; print(sum(comb(100,k) for k in range(101) if abs(k-50)>=5)/2**100)"  → 0.36820161732669626
        ['moneta: frazione fuori a n = 100 (300 semi) vs P(|S − 50| ≥ 5)', frac('moneta', 100, 0.05), 0.36820161732669626, 0.03],
        // python3 -I -c "from math import comb; print(sum(comb(50,k) for k in range(51) if abs(k-25)>=2.5)/2**50)"  → 0.47988766169832786
        ['moneta: frazione fuori a n = 50 vs binomiale', frac('moneta', 50, 0.05), 0.47988766169832786, 0.03],
        // dado, n = 10, ε = 0,5: convoluzione esatta con Fraction in Python → 0.40993645769826753
        ['dado: frazione fuori a n = 10 vs convoluzione esatta', frac('dado', 10, 0.5), 0.40993645769826753, 0.03],
        // uniforme, n = 2, ε = 0,2: P(|U1 + U2 − 1| ≥ 0,4) = (1 − 0,4)² = 0.36 (area dei due angoli del quadrato)
        ['uniforme: frazione fuori a n = 2 vs (1 − 2ε)²', frac('unif', 2, 0.2), 0.36, 0.03],
        ['la lettura riporta 0 percorsi su 20 e la maggiorazione 0,1', out.includes('0 percorsi su 20</span> (' + GI.pct(0, 0) + ')') && out.includes('= <span class="gi-hl">0,1</span>.') ? 1 : 0, 1, 0],
        ['la lettura con n = 100 dice che la maggiorazione non dice niente', wg.render({ ...d, nmax: 100 }).out.includes('<span class="gi-hl">1</span>: una probabilità non supera 1') ? 1 : 0, 1, 0],
      ];
    },
  });
})();

/* ---- tlc.js (sezione 4.23) ---- */
(function () {
  'use strict';
  /* 4.23 · Teorema limite centrale: la legge esatta di Z_n = (S_n − nμ)/(σ√n) contro la normale standard */
  const { n, v, p: P } = GI;
  const { tx, ln, rect, path, f, C, SANS } = GI.H;
  const { Phi, phi, gammaPdf, poisPmf } = GI.m;

  const W = 560, H = 332, L = 24, R = 536, T = 40, B = 270, ZM = 4;
  const X = P.scale(-ZM, ZM, L, R);
  const Zn = '<var>Z</var><sub><var>n</var></sub>';

  /* Le quattro leggi di ogni addendo. Discrete: base = probabilità dei valori k0, k0 + 1, … di un addendo. */
  const LAWS = {
    esp: { nome: 'Esponenziale di media 1', mu: 1, sig2: 1 },
    unif: { nome: 'Numero a caso fra 0 e 1', mu: 0.5, sig2: 1 / 12 },
    dado: { nome: 'Dado (il numero che esce)', mu: 3.5, sig2: 35 / 12, base: [1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6], k0: 1 },
    moneta: { nome: 'Moneta, testa (1) al 10 %, croce (0)', mu: 0.1, sig2: 0.09, base: [0.9, 0.1], k0: 0 },
  };

  /* B-spline cardinale di ordine N, cioè la densità della somma di N numeri a caso fra 0 e 1, nei punti j + t (j = 0 … N − 1),
     e quella di ordine N + 1 (che serve alla ripartizione). Ricorrenza N_k(x) = [x N_{k−1}(x) + (k − x) N_{k−1}(x − 1)] / (k − 1):
     tutti i coefficienti sono positivi, quindi non ci sono differenze di numeri grandi e il calcolo è stabile fino a N = 50. */
  function bspline(N, t) {
    let a = [1], dens = a;
    for (let k = 2; k <= N + 1; k++) {
      if (k === N + 1) dens = a;
      const b = new Array(k);
      for (let i = 0; i < k; i++) {
        const x = t + i;
        b[i] = (x * (i < k - 1 ? a[i] : 0) + (k - x) * (i > 0 ? a[i - 1] : 0)) / (k - 1);
      }
      a = b;
    }
    return { dens, cum: a };
  }

  /* Tutto ciò che serve al disegno e alla lettura: legge esatta di Z_n, ripartizione, polilinea della densità. */
  function calc(s) {
    const N = Math.min(50, Math.max(1, Math.round(+s.n) || 1));
    const key = LAWS[s.legge] ? s.legge : 'esp', law = LAWS[key];
    const sd = Math.sqrt(law.sig2), sn = sd * Math.sqrt(N);
    const r = { N, key, law, sn, media: N * law.mu, varia: N * law.sig2 };
    if (law.base) { // discreta: convoluzione esatta delle probabilità
      let pm = [1];
      for (let i = 0; i < N; i++) {
        const q = new Array(pm.length + law.base.length - 1).fill(0);
        for (let a = 0; a < pm.length; a++) for (let b = 0; b < law.base.length; b++) q[a + b] += pm[a] * law.base[b];
        pm = q;
      }
      r.disc = true;
      r.dz = 1 / sn; // distanza fra due valori vicini di Z_n = larghezza di una colonna
      r.ps = pm;
      r.zs = pm.map((_, k) => (N * law.k0 + k - r.media) / sn);
      r.cdf = (x) => { let t = 0; for (let k = 0; k < pm.length; k++) if (r.zs[k] <= x + 1e-9) t += pm[k]; return Math.min(1, t); };
      r.peak = Math.max(...pm) * sn;
      return r;
    }
    r.zs = []; r.ys = [];
    if (key === 'esp') { // somma di N esponenziali = Γ(N, 1): densità e ripartizione esatte
      const sq = Math.sqrt(N);
      r.dens = (z) => { const x = N + z * sq; return x < -1e-12 ? 0 : x <= 1e-12 ? (N === 1 ? sq : 0) : sq * gammaPdf(N, 1, x); };
      r.cdf = (x) => { const t = N + x * sq; if (t <= 0) return 0; let q = 0; for (let k = 0; k < N; k++) q += poisPmf(t, k); return Math.min(1, Math.max(0, 1 - q)); };
      const a = Math.max(-ZM, -sq), K = 200;
      for (let i = 0; i <= K; i++) { const z = a + ((ZM - a) * i) / K; r.zs.push(z); r.ys.push(r.dens(z)); }
    } else { // somma di N uniformi: spline cardinale (formule esatte)
      const sg = Math.sqrt(N / 12);
      r.dens = (z) => { const x = N / 2 + z * sg; return x < 0 || x >= N ? 0 : sg * bspline(N, x - Math.floor(x)).dens[Math.floor(x)]; };
      r.cdf = (x) => {
        const xx = N / 2 + x * sg;
        if (xx <= 0) return 0;
        if (xx >= N) return 1;
        const j = Math.floor(xx), cum = bspline(N, xx - j).cum;
        let q = 0;
        for (let i = 0; i <= j; i++) q += cum[i];
        return Math.min(1, q);
      };
      const M = Math.max(12, Math.min(128, Math.ceil(33 / sg))); // passo in z non oltre 0,03
      const cols = [];
      for (let m = 0; m < M; m++) cols.push(bspline(N, m / M).dens);
      for (let j = 0; j <= N; j++) {
        for (let m = 0; m < M; m++) {
          const x = j + m / M;
          if (x > N) break;
          const z = (x - N / 2) / sg;
          if (z < -ZM || z > ZM) continue;
          r.zs.push(z); r.ys.push(j < N ? cols[m][j] * sg : 0);
        }
      }
    }
    r.peak = Math.max(...r.ys);
    return r;
  }

  /* punti (z, altezza) della polilinea (zs, ys) fra a e b, con interpolazione agli estremi */
  function cut(zs, ys, a, b) {
    const lo = Math.max(a, zs[0]), hi = Math.min(b, zs[zs.length - 1]);
    if (!(hi > lo)) return [];
    const at = (z) => {
      let i0 = 0, i1 = zs.length - 1;
      while (i1 - i0 > 1) { const m = (i0 + i1) >> 1; if (zs[m] <= z) i0 = m; else i1 = m; }
      const u = zs[i1] > zs[i0] ? (z - zs[i0]) / (zs[i1] - zs[i0]) : 0;
      return ys[i0] + u * (ys[i1] - ys[i0]);
    };
    const pts = [[lo, at(lo)]];
    for (let i = 0; i < zs.length; i++) if (zs[i] > lo && zs[i] < hi) pts.push([zs[i], ys[i]]);
    pts.push([hi, at(hi)]);
    return pts;
  }
  const open = (pts, Y) => (pts.length ? `M${f(X(pts[0][0]))} ${f(B)}` + pts.map(([z, y]) => `L${f(X(z))} ${f(Y(y))}`).join('') + `L${f(X(pts[pts.length - 1][0]))} ${f(B)}` : '');

  const fm = (x) => { const s = n(x, 3); return s.includes(',') ? s.replace(/,?0+$/, '') : s; }; // tre decimali, senza gli zeri finali
  const leg = (key) => LAWS[key].nome;

  GI.add('tlc', {
    sec: '4.23',
    title: 'La somma standardizzata <var>Z</var><sub>n</sub> e la normale standard',
    w: W,
    h: H,
    alt: 'Colonne azzurre, o una superficie azzurra se la legge è continua, che rappresentano la legge esatta della somma standardizzata Z_n di n variabili indipendenti con la stessa legge. Sopra c’è la curva arancione della normale standard, la campana. Una linea tratteggiata in x = 1 separa la parte azzurra più intensa, con i valori di Z_n che non la superano, da quella più tenue, a destra. Con n = 1 il disegno ha la forma di un solo addendo: asimmetrica per l’esponenziale, piatta per il numero a caso, a gradini per il dado e per la moneta. Aumentando n le colonne si dispongono sempre più lungo la campana, in fretta per l’uniforme e per il dado, più lentamente per l’esponenziale, e ancora più lentamente per la moneta con testa al 10 %. La scala verticale si adatta all’altezza massima. Sotto il disegno sono scritti media, varianza e deviazione standard della somma e i valori di P(Z_n ≤ 0) e P(Z_n ≤ 1) accanto a quelli della normale.',
    controls: [
      { id: 'legge', kind: 'select', label: 'Legge di ogni addendo', value: 'esp', options: Object.keys(LAWS).map((k) => [k, LAWS[k].nome]) },
      { id: 'n', label: 'Numero di addendi (<var>n</var>)', min: 1, max: 50, step: 1, int: true, value: 10, fmt: (x) => n(x, 0) },
    ],
    presets: [
      { label: 'Come in 4.22: esponenziali, <var>n</var> = 10', set: { legge: 'esp', n: 10 } },
      { label: 'Un solo addendo', set: { legge: 'esp', n: 1 } },
      { label: 'Esponenziali, <var>n</var> = 30', set: { legge: 'esp', n: 30 } },
      { label: 'Numeri a caso: bastano 5 addendi', set: { legge: 'unif', n: 5 } },
      { label: 'Moneta al 10 %: ne servono molti', set: { legge: 'moneta', n: 30 } },
    ],
    caption: 'Le colonne azzurre (la superficie, se la legge è continua) sono la legge esatta di <var>Z</var><sub>n</sub> = (<var>S</var><sub>n</sub> − <var>nμ</var>)/(<var>σ</var>√<var>n</var>): l’area è la probabilità. La curva arancione è la campana, cioè la densità della normale standard <var>N</var>(0, 1). L’azzurro più intenso copre i valori di <var>Z</var><sub>n</sub> che non superano la linea tratteggiata <var>x</var> = 1, e di una colonna conta il valore al centro: la sua area è <var>P</var>(<var>Z</var><sub>n</sub> ≤ 1), da confrontare con Φ(1). Con <var>n</var> = 1 vedi la forma di un solo addendo; aumentando <var>n</var> cambia la forma del totale.',
    prove: [
      'Con l’esponenziale porta <var>n</var> da 1 a 50: che cosa cambia nella forma di <var>Z</var><sub>n</sub>, e che cosa resta fermo?',
      'Con <var>n</var> = 5 prova le quattro leggi una dopo l’altra: quale somma è la più lontana dalla campana, e che cosa nella sua forma lo mostra?',
    ],
    calc,
    render(s) {
      const c = calc(s);
      const Y = P.scale(0, Math.max(0.45, 1.08 * c.peak), B, T);
      const one = 1 + 1e-9;
      let svg = '';
      if (c.disc) {
        for (let k = 0; k < c.ps.length; k++) {
          const z = c.zs[k], a = Math.max(-ZM, z - c.dz / 2), b = Math.min(ZM, z + c.dz / 2);
          if (!(b > a) || c.ps[k] <= 1e-12) continue;
          const h = c.ps[k] * c.sn;
          svg += rect(X(a), Y(h), X(b) - X(a), B - Y(h), { fill: C.A, fo: z <= one ? 0.78 : 0.34, stroke: X(b) - X(a) >= 9 ? C.paper : 'none', sw: 0.8 });
        }
      } else {
        svg += path(open(cut(c.zs, c.ys, -ZM, 1), Y) + 'Z', { fill: C.A, fo: 0.72, stroke: 'none' });
        svg += path(open(cut(c.zs, c.ys, 1, ZM), Y) + 'Z', { fill: C.A, fo: 0.3, stroke: 'none' });
        svg += path(open(cut(c.zs, c.ys, -ZM, ZM), Y), { stroke: C.A, sw: 2, lj: 'round' });
      }
      svg += P.axes({ X, Y, box: [L, T, R, B], noy: true, xt: [-3, -2, -1, 0, 1, 2, 3] }) + tx(R, B + 46, '*Z_n*', { size: 20, fill: C.soft, ta: 'end' });
      svg += ln(X(1), B, X(1), T, { stroke: C.soft, sw: 1.6, da: '5 4' });
      svg += tx(X(1) - 7, T + 14, '*x* = 1', { ff: SANS, size: 15, fill: C.soft, ta: 'end' });
      svg += P.curve(phi, -ZM, ZM, X, Y, 120, { stroke: C.B, sw: 3.2 });
      svg += rect(R - 164, T + 2, 22, 13, { fill: C.A, fo: 0.72 }) + tx(R - 132, T + 14, 'legge esatta', { ff: SANS, size: 16, fill: C.soft, ta: 'start' });
      svg += ln(R - 164, T + 31, R - 142, T + 31, { stroke: C.B, sw: 3.2, lc: 'round' }) + tx(R - 132, T + 36, 'normale standard', { ff: SANS, size: 16, fill: C.soft, ta: 'start' });

      const p0 = c.cdf(0), p1 = c.cdf(1), q1 = Phi(1);
      const out = `<p>Ogni addendo: ${leg(c.key).toLowerCase()}. Media <var>μ</var> = ${fm(c.law.mu)}, varianza <var>σ</var><sup>2</sup> = ${fm(c.law.sig2)}. Con <var>n</var> = ${n(c.N, 0)} la somma <var>S</var><sub><var>n</var></sub> ha media <var>nμ</var> = ${fm(c.media)}, varianza <var>nσ</var><sup>2</sup> = ${fm(c.varia)} e deviazione standard <var>σ</var>√<var>n</var> = ${fm(c.sn)}; ${Zn} ha sempre media 0 e varianza 1.</p>
  <p>${v('P')}(${Zn} ≤ 0) = ${n(p0, 4)}, contro Φ(0) = ${n(0.5, 4)}. ${v('P')}(${Zn} ≤ 1) = ${n(p1, 4)}, contro Φ(1) = ${n(q1, 4)}. Differenza fra le due probabilità in <var>x</var> = 1: <span class="gi-hl">${n(Math.abs(p1 - q1), 4)}</span>.</p>${c.disc ? `
  <p>La legge è discreta: la differenza in <var>x</var> = 1 non scende con regolarità, perché l’area dell’azzurro intenso cambia a gradini, una colonna alla volta.</p>` : ''}`;
      return { svg, out };
    },
    selftest() {
      const W_ = GI.widgets.tlc, d = GI.defaults(W_), out = W_.render(d).out;
      const at = (legge, nn) => calc({ legge, n: nn });
      const mom = (c) => { let m0 = 0, m1 = 0, m2 = 0; c.zs.forEach((z, k) => { m0 += c.ps[k]; m1 += c.ps[k] * z; m2 += c.ps[k] * z * z; }); return [m0, m1, m2]; };
      const scure = (legge, nn) => { // area (probabilità) delle colonne scure del disegno, letta dal markup
        const st = { legge, n: nn }, c = calc(st), ymax = Math.max(0.45, 1.08 * c.peak);
        let tot = 0;
        for (const m of W_.render(st).svg.matchAll(/<rect x="[\d.-]+" y="[\d.-]+" width="([\d.]+)" height="([\d.]+)" fill="[^"]*" fill-opacity="0.78"/g)) tot += (m[1] / ((R - L) / (2 * ZM))) * (m[2] / ((B - T) / ymax));
        return tot;
      };
      const area = (c) => { let a = 0; for (let i = 1; i < c.zs.length; i++) a += ((c.ys[i] + c.ys[i - 1]) / 2) * (c.zs[i] - c.zs[i - 1]); return a; };
      return [
        // python3 -I -c "from scipy.stats import gamma; print(gamma.cdf(10+10**0.5, 10))"
        ['esponenziale n = 10: P(Z ≤ 1), riga di 4.22', at('esp', 10).cdf(1), 0.8446415963963627, 1e-10],
        // python3 -I -c "from scipy.stats import gamma; print(gamma.cdf(10, 10))"
        ['esponenziale n = 10: P(Z ≤ 0), riga di 4.22', at('esp', 10).cdf(0), 0.5420702855281478, 1e-10],
        // python3 -I -c "from scipy.stats import gamma; print(gamma.cdf(30+30**0.5, 30))"
        ['esponenziale n = 30: P(Z ≤ 1), riga di 4.22', at('esp', 30).cdf(1), 0.8425352381664332, 1e-10],
        // python3 -I -c "import math; print(1-math.exp(-1))"
        ['esponenziale n = 1: P(Z ≤ 0) = 1 − e^(−1)', at('esp', 1).cdf(0), 0.6321205588285577, 1e-12],
        // python3 -I -c "from scipy.stats import gamma; print(gamma.pdf(10,10)*10**0.5)"
        ['esponenziale n = 10: densità di Z in 0', at('esp', 10).dens(0), 0.3956326710238091, 1e-9],
        // python3 -I -c "from scipy.stats import irwinhall; print(irwinhall(5).cdf(2.5+(5/12)**0.5))"
        ['uniforme n = 5: P(Z ≤ 1)', at('unif', 5).cdf(1), 0.8361910373669988, 1e-10],
        // python3 -I -c "from scipy.stats import irwinhall; print(irwinhall(50).cdf(25+(50/12)**0.5))"
        ['uniforme n = 50: P(Z ≤ 1)', at('unif', 50).cdf(1), 0.8408576742624033, 1e-10],
        // python3 -I -c "from scipy.stats import irwinhall; print(irwinhall(5).pdf(2.5)*(5/12)**0.5)"
        ['uniforme n = 5: densità di Z in 0', at('unif', 5).dens(0), 0.38662594167869174, 1e-10],
        // python3 -I -c "from scipy.stats import irwinhall; print(irwinhall(50).pdf(25+0.5*(50/12)**0.5)*(50/12)**0.5)"
        ['uniforme n = 50: densità di Z in 0,5', at('unif', 50).dens(0.5), 0.3515111775878719, 1e-10],
        ['uniforme n = 7: simmetria, P(Z ≤ 0) = 1/2', at('unif', 7).cdf(0), 0.5, 1e-12],
        // python3 -I -c "from scipy.stats import binom; print(binom.cdf(2, 11, 0.1))"   (a x = 1: k ≤ 1,1 + 0,995 = 2,095)
        ['moneta al 10 %, n = 11: P(Z ≤ 1)', at('moneta', 11).cdf(1), 0.91043814915, 1e-10],
        // python3 -I -c "from scipy.stats import binom; print(binom.cdf(1, 10, 0.1))"
        ['moneta al 10 %, n = 10: P(Z ≤ 1) = P(Z ≤ 0)', at('moneta', 10).cdf(1), 0.7360989291, 1e-9],
        // python3 -I -c "import numpy as np; p=np.ones(6)/6; q=np.array([1.]); [q:=np.convolve(q,p) for _ in range(3)]; print(q[:11].sum())"  (a x = 1: S ≤ 10,5 + 2,96 = 13,46, cioè S ≤ 13, cioè i primi 11 valori della pmf di S − 3)
        ['dado, n = 3: P(Z ≤ 1)', at('dado', 3).cdf(1), 181 / 216, 1e-12],
        // python3 -I -c "from scipy.stats import gamma; print(gamma.cdf(50, 50))"
        ['esponenziale n = 50 (estremo del cursore): P(Z ≤ 0)', at('esp', 50).cdf(0), 0.5188083154720433, 1e-10],
        // python3 -I -c "print(0.5 + (1/12)**0.5)"   (n = 1: Z è uniforme fra −√3 e √3)
        ['uniforme n = 1 (estremo del cursore): P(Z ≤ 1)', at('unif', 1).cdf(1), 0.7886751345948129, 1e-12],
        // python3 -I -c "from scipy.stats import binom; print(binom.cdf(0, 1, 0.1))"
        ['moneta al 10 %, n = 1: P(Z ≤ 0) = 0,9', at('moneta', 1).cdf(0), 0.9, 1e-12],
        // l’area azzurra intensa disegnata (larghezza × altezza di ogni colonna scura) deve essere P(Z ≤ 1) della lettura
        ['dado, n = 3: area delle colonne scure = 181/216', scure('dado', 3), 181 / 216, 1e-3],
        // python3 -I -c "from scipy.stats import binom; print(binom.cdf(2, 11, 0.1))"
        ['moneta al 10 %, n = 11: area delle colonne scure = P(Z ≤ 1)', scure('moneta', 11), 0.91043814915, 1e-3],
        ['dado, n = 20: Z ha media 0, varianza 1, probabilità totale 1', (() => { const [m0, m1, m2] = mom(at('dado', 20)); return Math.abs(m0 - 1) + Math.abs(m1) + Math.abs(m2 - 1); })(), 0, 1e-12],
        ['moneta al 10 %, n = 50: media 0 e varianza 1', (() => { const [m0, m1, m2] = mom(at('moneta', 50)); return Math.abs(m0 - 1) + Math.abs(m1) + Math.abs(m2 - 1); })(), 0, 1e-12],
        // l’area sotto la polilinea disegnata coincide con quella data dalla ripartizione (densità e ripartizione sono calcolate in modo indipendente)
        ['uniforme n = 12: area del disegno = P(−4 < Z ≤ 4)', area(at('unif', 12)), at('unif', 12).cdf(4) - at('unif', 12).cdf(-4), 2e-5],
        ['esponenziale n = 40: area del disegno = P(−4 < Z ≤ 4)', area(at('esp', 40)), at('esp', 40).cdf(4) - at('esp', 40).cdf(-4), 2e-5],
        ['il testo riporta 0,8446 e 0,5421 (tabella di 4.22)', out.includes('0,8446') && out.includes('0,5421') ? 1 : 0, 1, 0],
      ];
    },
  });
})();

/* ---- correzione.js (sezione 4.26) ---- */
(function () {
  'use strict';
  /* 4.26 · La correzione di continuità: P(X ≤ k) con la binomiale e con la normale */
  const { n: num, sci, p: P } = GI;
  const { tx, rect, ln, C } = GI.H;
  const { Phi, normPdf, binomPmf } = GI.m;

  /* area del disegno (a destra resta posto per l'etichetta «k + ½») */
  const L = 52, R = 484, T = 42, B = 262;

  function calc(s) {
    const n = Math.max(1, Math.round(s.n));
    const p = Math.min(0.99, Math.max(0.01, s.p));
    const k = Math.min(n, Math.max(0, Math.round(s.k)));
    const mu = n * p, sd = Math.sqrt(n * p * (1 - p));
    const pmf = [];
    let exact = 0;
    for (let i = 0; i <= n; i++) {
      const q = binomPmf(n, p, i);
      pmf.push(q);
      if (i <= k) exact += q;
    }
    exact = Math.min(1, exact);
    const z0 = (k - mu) / sd, z1 = (k + 0.5 - mu) / sd;
    const a0 = Phi(z0), a1 = Phi(z1);
    /* barre mostrate: da μ − 4σ a μ + 4σ, sempre comprese k e almeno 6 barre */
    let lo = Math.max(0, Math.floor(mu - 4 * sd)), hi = Math.min(n, Math.ceil(mu + 4 * sd));
    lo = Math.min(lo, k);
    hi = Math.max(hi, k);
    if (hi - lo < 5) { hi = Math.min(n, lo + 5); lo = Math.max(0, hi - 5); }
    let peak = normPdf(mu, mu, sd);
    for (let i = lo; i <= hi; i++) peak = Math.max(peak, pmf[i]);
    return { n, p, k, mu, sd, pmf, exact, z0, z1, a0, a1, lo, hi, top: peak * 1.12 };
  }

  /* ---------- formati dei numeri nella lettura ---------- */
  const trim = (t) => (t.includes(',') ? t.replace(/0+$/, '').replace(/,$/, '') : t);
  const t2 = (x) => trim(num(x, 2));
  /* probabilità: 4 decimali, notazione scientifica sotto 0,001 */
  const pr = (x) => (x === 0 ? '0' : x >= 0.001 ? num(x, 4) : sci(x, 3));
  /* scarto fra approssimazione e valore esatto: calcolato sui numeri scritti, così torna con la sottrazione a mano */
  const r4 = (x) => Math.round(x * 1e4) / 1e4;
  const diff = (a, b) => (a >= 0.001 && b >= 0.001 ? r4(a) - r4(b) : a - b);
  /* numero scritto con due decimali: «=» se è esatto, altrimenti «≈» con tre decimali, così le uguaglianze scritte restano vere */
  const ex2 = (x) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-7;
  const sg = (x) => (ex2(x) ? ['=', t2(x)] : ['≈', trim(num(x, 3))]);
  const errTxt = (e) => (Math.abs(e) < 0.00005 ? 'errore sotto 0,0001' : 'errore ' + num(Math.abs(e), 4) + (e < 0 ? ' per difetto' : ' per eccesso'));

  GI.add('correzione', {
    sec: '4.26',
    title: 'Il confine sta a <var>k</var> + ½, non a <var>k</var>',
    w: 560,
    h: 320,
    alt: 'Istogramma della binomiale Bin(n, p): una barra larga 1 per ogni intero, le barre da 0 a k in blu e le altre in grigio. Sopra, in viola, la curva normale con la stessa media e la stessa varianza. L’area sotto la curva fino a k è tratteggiata in viola; la striscia fra k e k + ½, che copre la metà destra dell’ultima barra blu, è arancione. Cambiando n, p e k si spostano la figura e le due linee verticali, e sotto il disegno cambiano la probabilità esatta e le due approssimazioni, senza e con la correzione.',
    controls: [
      { id: 'n', label: 'Numero di lanci <var>n</var>', min: 5, max: 100, int: true, value: 16 },
      { id: 'p', label: 'Probabilità di successo <var>p</var>', min: 0.05, max: 0.95, step: 0.01, value: 0.5, fmt: (x) => num(x, 2) },
      { id: 'k', label: 'Evento {<var>X</var> ≤ <var>k</var>}: valore di <var>k</var>', min: 0, max: 100, int: true, value: 10, limits: (s) => [0, Math.round(s.n)] },
    ],
    presets: [
      { label: 'L’esempio del testo', set: { n: 16, p: 0.5, k: 10 } },
      { label: 'Pochi lanci: n = 9', set: { n: 9, p: 0.5, k: 6 } },
      { label: 'Tanti lanci: n = 100', set: { n: 100, p: 0.5, k: 55 } },
      { label: 'Moneta non equa: p = 0,2', set: { n: 20, p: 0.2, k: 6 } },
    ],
    caption: 'Le barre sono le probabilità esatte di Bin(<var>n</var>, <var>p</var>), larghe 1 e centrate sugli interi; la curva viola è la densità di <var>N</var>(<var>np</var>, <var>np</var>(1 − <var>p</var>)). Le barre blu, da 0 a <var>k</var>, hanno per area <var>P</var>(<var>X</var> ≤ <var>k</var>). L’area tratteggiata sotto la curva si ferma a <var>k</var>: è l’approssimazione senza correzione. La striscia arancione, da <var>k</var> a <var>k</var> + ½, è la mezza barra in più: l’area sotto la curva fino a <var>k</var> + ½, tratteggiata più arancione, è l’approssimazione con la correzione.',
    prove: [
      'Con <var>n</var> = 16 e <var>p</var> = 0,5 sposta <var>k</var> da 2 a 8 e poi a 14: dove la striscia arancione è più alta, cioè dove la correzione aggiunge più probabilità?',
      'Premi «Pochi lanci: n = 9», «L’esempio del testo» e «Tanti lanci: n = 100»: senza correzione <var>z</var> vale sempre 1. Come cambiano, al crescere di <var>n</var>, i due errori scritti sotto, senza e con correzione?',
    ],
    /* se n scende sotto k, k si ferma a n (le barre vanno da 0 a n) */
    onchange(s, id, setAll) { if (s.k > s.n) setAll({ k: s.n }); },
    calc,
    render(s) {
      const c = calc(s);
      const nb = c.hi - c.lo + 1, unit = (R - L) / nb;
      const X = P.scale(c.lo - 0.5, c.hi + 0.5, L, R);
      const Y = P.scale(0, c.top, B, T);
      const pdf = (x) => normPdf(x, c.mu, c.sd);
      const yt = P.nice(0, c.top, 4);
      const ys = yt.length > 1 ? yt[1] - yt[0] : 0.1;
      const dec = Math.max(1, Math.ceil(-Math.log10(ys) - 1e-9));
      const span = c.hi - c.lo, st = span <= 12 ? 1 : span <= 24 ? 2 : span <= 60 ? 5 : span <= 120 ? 10 : 20;
      const xt = [];
      for (let x = Math.ceil(c.lo / st) * st; x <= c.hi; x += st) xt.push(x);

      let svg = '<defs><pattern id="cc-tratti" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="var(--pv-c)" stroke-width="2" stroke-opacity="0.85"/></pattern></defs>';
      svg += P.axes({ X, Y, box: [L, T, R, B], xt, yt, xf: (x) => num(x, 0), yf: (y) => num(y, dec), xl: 'numero di successi', grid: true });

      /* barre: blu fino a k, grigie dopo */
      const sw = unit > 8 ? 1.4 : 0.8;
      for (let i = c.lo; i <= c.hi; i++) {
        const y = Y(c.pmf[i]);
        if (B - y < 0.05) continue;
        svg += rect(X(i - 0.5), y, unit, B - y, i <= c.k ? { fill: C.A, fo: 0.6, stroke: C.paper, sw } : { fill: C.soft, fo: 0.2, stroke: C.paper, sw });
      }
      svg += ln(L, B, R, B, { stroke: C.soft, sw: 1.6 });

      /* area sotto la curva: tratteggiata fino a k, arancione da k a k + ½ */
      const a = c.lo - 0.5;
      svg += P.area(pdf, a, c.k, X, Y, B, Math.min(400, Math.max(40, Math.round((c.k - a) * 6))), { fill: 'url(#cc-tratti)', fo: 1 });
      svg += P.area(pdf, c.k, c.k + 0.5, X, Y, B, 8, { fill: C.B, fo: 0.85 });
      svg += P.curve(pdf, c.lo - 0.5, c.hi + 0.5, X, Y, 240, { stroke: C.C, sw: 3 });

      /* i due confini */
      const xk = X(c.k), xh = X(c.k + 0.5);
      svg += ln(xk, T, xk, B, { stroke: C.C, sw: 2, da: '6 4' }) + ln(xh, T, xh, B, { stroke: C.B, sw: 2.6 });
      svg += tx(xk - 4, T - 10, '*k*', { size: 19, fill: C.C, ta: 'end', fw: 700 }) + tx(xh + 4, T - 10, '*k* + ½', { size: 19, fill: C.B, ta: 'start', fw: 700 });

      const mu = t2(c.mu), [sdE, sd] = sg(c.sd);
      const kk = num(c.k, 0), kh = trim(num(c.k + 0.5, 1));
      const NB = '&nbsp;';
      /* riga con z e Φ(z): se z non è esatto si scrive Φ(<var>z</var>), perché il valore è quello di z non arrotondato */
      const riga = (top, z, a, hl) => {
        const [e, t] = sg(z), val = hl ? '<span class="gi-hl">' + pr(a) + '</span>' : pr(a);
        return `<var>z</var> = (${top}${NB}−${NB}${mu})/${sd} ${e} ${t}, ${ex2(z) ? 'Φ(' + t + ')' : 'Φ(<var>z</var>)'}${NB}=${NB}${val}`;
      };
      const somma = c.k === 0 ? 'la barra di 0' : `somma delle barre da 0 a ${kk}`;
      const out = `<p>Con <var>n</var> = ${num(c.n, 0)} e <var>p</var> = ${t2(c.p)}: μ = <var>np</var> = ${mu} e σ = √(<var>np</var>(1${NB}−${NB}<var>p</var>)) ${sdE} ${sd}.</p>
  <p><var>P</var>(<var>X</var> ≤ ${kk}) esatta, ${somma}: <span class="gi-hl">${pr(c.exact)}</span></p>
  <p>Senza correzione: ${riga(kk, c.z0, c.a0, false)}; ${errTxt(diff(c.a0, c.exact))}.</p>
  <p>Con correzione: ${riga(kh, c.z1, c.a1, true)}; ${errTxt(diff(c.a1, c.exact))}.</p>`;
      return { svg, out };
    },
    selftest() {
      const W = GI.widgets.correzione, d = GI.defaults(W), out = W.render(d).out;
      const at = (n, p, k) => calc({ n, p, k });
      return [
        /* python3 -I -c "from scipy.stats import binom; print(repr(binom.cdf(10,16,.5)))"  (= 58651/65536) */
        ['esatto, 16 lanci, k = 10', at(16, 0.5, 10).exact, 0.8949432373046875, 1e-12],
        /* python3 -I -c "from scipy.stats import norm; print(repr(norm.cdf(1)))" */
        ['senza correzione, Φ(1)', at(16, 0.5, 10).a0, 0.8413447460685429, 1e-12],
        /* python3 -I -c "from scipy.stats import norm; print(repr(norm.cdf(1.25)))" */
        ['con correzione, Φ(1,25)', at(16, 0.5, 10).a1, 0.8943502263331446, 1e-12],
        /* python3 -I -c "from scipy.stats import binom, norm; print(repr(binom.cdf(6,9,.5)), repr(norm.cdf(1)), repr(norm.cdf((6.5-4.5)/1.5)))"  (n = 9: μ = 4,5, σ = 1,5, quindi z = 1 senza correzione; 466/512) */
        ['n = 9, esatto', at(9, 0.5, 6).exact, 0.91015625, 1e-12],
        ['n = 9, senza correzione, Φ(1)', at(9, 0.5, 6).a0, 0.8413447460685429, 1e-12],
        ['n = 9, con correzione, Φ(4/3)', at(9, 0.5, 6).a1, 0.9087887802741321, 1e-12],
        /* python3 -I -c "from scipy.stats import binom, norm; print(repr(binom.cdf(1,5,.5)), repr(norm.cdf((1.5-2.5)/1.25**.5)), repr(norm.cdf((1-2.5)/1.25**.5)))"  (σ² = 5 · 0,5 · 0,5 = 1,25) */
        ['n = 5, esatto', at(5, 0.5, 1).exact, 0.1875, 1e-12],
        ['n = 5, con correzione', at(5, 0.5, 1).a1, 0.18554668476134878, 1e-12],
        ['n = 5, senza correzione', at(5, 0.5, 1).a0, 0.08985624743949988, 1e-12],
        /* python3 -I -c "from scipy.stats import binom, norm; print(repr(binom.cdf(55,100,.5)), repr(norm.cdf(1.1)))" */
        ['n = 100, esatto', at(100, 0.5, 55).exact, 0.8643734879630822, 1e-12],
        ['n = 100, con correzione', at(100, 0.5, 55).a1, 0.8643339390536173, 1e-12],
        /* python3 -I -c "from scipy.stats import binom, norm; import math; sd=math.sqrt(20*.2*.8); print(repr(binom.cdf(6,20,.2)), repr(norm.cdf((6.5-4)/sd)), repr(norm.cdf((6-4)/sd)))" */
        ['p = 0,2, esatto', at(20, 0.2, 6).exact, 0.9133074864325996, 1e-12],
        ['p = 0,2, con correzione', at(20, 0.2, 6).a1, 0.9188747500763841, 1e-12],
        ['p = 0,2, senza correzione', at(20, 0.2, 6).a0, 0.8682237613585136, 1e-12],
        /* python3 -I -c "from scipy.stats import binom; print(repr(binom.cdf(100,200,.5)))" */
        ['n = 200, esatto', at(200, 0.5, 100).exact, 0.5281742395046283, 1e-12],
        /* python3 -I -c "from scipy.stats import binom, norm; print(repr(binom.cdf(170,200,.95)), repr(norm.cdf((170.5-190)/(200*.95*.05)**.5)))" */
        ['coda: esatto', at(200, 0.95, 170).exact, 8.709270943980156e-08, 1e-18],
        ['coda: con correzione', at(200, 0.95, 170).a1, 1.2528220201910702e-10, 1e-20],
        /* python3 -I -c "from scipy.stats import binom; print(repr(binom.cdf(2,7,.33)))" */
        ['p = 0,33, esatto', at(7, 0.33, 2).exact, 0.5783260895834501, 1e-12],
        /* python3 -I -c "from scipy.stats import binom, norm; import math; print(repr(binom.cdf(30,60,.37)), repr(norm.cdf((30.5-60*.37)/math.sqrt(60*.37*.63))))" */
        ['n = 60, p = 0,37: esatto', at(60, 0.37, 30).exact, 0.9856476937375437, 1e-12],
        ['n = 60, p = 0,37: con correzione', at(60, 0.37, 30).a1, 0.9867694997891708, 1e-12],
        ['le barre hanno somma 1', at(200, 0.3, 0).pmf.reduce((x, y) => x + y, 0), 1, 1e-12],
        ['la finestra comprende k (k = 0, n = 200)', at(200, 0.5, 0).lo, 0, 0],
        ['la finestra comprende k (k = n)', at(200, 0.5, 200).hi, 200, 0],
        ['il testo riporta 0,8949, 0,8413 e 0,8944', ['0,8949', '0,8413', '0,8944'].every((t) => out.includes(t)) ? 1 : 0, 1, 0],
        ['z esatto: si scrive Φ(1,25)', out.includes('Φ(1,25)') && out.includes('= 2.') ? 1 : 0, 1, 0],
        ['z non esatto: ≈ e Φ(z), n = 9', (() => { const o = W.render({ n: 9, p: 0.5, k: 6 }).out; return o.includes('≈ 1,333') && o.includes('Φ(<var>z</var>)') && o.includes('0,9088') && o.includes('0,9102') ? 1 : 0; })(), 1, 0],
        ['k = 0: la barra di 0', W.render({ n: 20, p: 0.2, k: 0 }).out.includes('la barra di 0') ? 1 : 0, 1, 0],
        ['gli errori tornano con la sottrazione dei numeri scritti', diff(0.8943502263331446, 0.8949432373046875), -0.0005, 1e-12],
      ];
    },
  });
})();

/* ---- processo.js (sezione 4.38) ---- */
(function () {
  'use strict';
  /* 4.38 · Dalle attese ai conteggi: {N_t ≥ n} = {T_n ≤ t} (scalinata dei conteggi e istante dell'n-esimo arrivo) */
  const fmt = GI.n, sci = GI.sci, P = GI.p;
  const { tx, ln, circ, path, C, SANS, f } = GI.H;

  /* area del disegno: a sinistra il margine per le etichette dei livelli, sotto l'asse del tempo e l'etichetta di T_n */
  const L = 114, R = 488, TOP = 66, B = 250;
  const halo = { stroke: C.paper, sw: 4, lj: 'round', paint_order: 'stroke' };

  /* ---------- calcolo delle due probabilità, per due strade indipendenti ---------- */
  const LF = [0]; // ln k!, per somma esatta (senza lgamma)
  const lf = (k) => { while (LF.length <= k) LF.push(LF[LF.length - 1] + Math.log(LF.length)); return LF[k]; };
  const pm = (mu, k) => (mu <= 0 ? (k === 0 ? 1 : 0) : Math.exp(-mu + k * Math.log(mu) - lf(k))); // e^{−μ} μ^k / k!

  /* P(N_t ≥ n) = 1 − Σ_{k<n} e^{−λt}(λt)^k/k!: se la somma supera 1/2 si somma la coda, che è lo stesso numero ma non perde cifre */
  function probN(mu, nn) {
    let S = 0;
    for (let k = 0; k < nn; k++) S += pm(mu, k);
    if (S <= 0.5) return 1 - S;
    let U = 0;
    for (let k = nn; k < 900; k++) { const t = pm(mu, k); U += t; if (k > mu && t < 1e-18 * U) break; }
    return U;
  }

  /* P(T_n ≤ t) con T_n ~ Γ(n, λ): integrale della densità λ^n x^{n−1} e^{−λx}/(n−1)! da 0 a t, in u = λx, con Gauss–Legendre a 5 punti */
  const GX = [0, 0.5384693101056831, -0.5384693101056831, 0.906179845938664, -0.906179845938664];
  const GW = [0.5688888888888889, 0.47862867049936647, 0.47862867049936647, 0.23692688505618908, 0.23692688505618908];
  function probT(nn, lam, t) {
    const V = Math.min(lam * t, nn + 14 * Math.sqrt(nn) + 50), panels = Math.max(48, Math.ceil(V / 0.25)), h = V / panels;
    const c = lf(nn - 1);
    let I = 0;
    for (let i = 0; i < panels; i++) {
      const m = (i + 0.5) * h;
      for (let j = 0; j < 5; j++) { const u = m + 0.5 * h * GX[j]; I += GW[j] * Math.exp((nn - 1) * Math.log(u) - u - c); }
    }
    return 0.5 * h * I;
  }

  /* simulazione: attese X_k = −ln(1−U)/λ esponenziali indipendenti, T_k = X_1 + … + X_k. Con lo stesso seme e un λ diverso gli arrivi si
     rimpiccioliscono o si dilatano nello stesso modo. Si genera finché ci sono almeno n arrivi e l'ultimo cade dopo t. */
  function simula(seed, lam, t, nn) {
    const r = GI.rng(seed + 118), a = []; // +118: con il seme 1 iniziale esce una realizzazione tipica (15 arrivi entro 30, il 20° a 39,7)
    let T = 0;
    while (a.length < 5000) {
      T += -Math.log(1 - r()) / lam;
      a.push(T);
      if (a.length >= nn && T > t) break;
    }
    return a;
  }

  function calc(s) {
    const lam = s.lam, t = s.t, nn = Math.max(1, Math.round(s.n)), mu = lam * t;
    const a = simula(s.seed || 1, lam, t, nn);
    let Nt = 0;
    while (Nt < a.length && a[Nt] <= t) Nt++;
    return { lam, t, nn, mu, a, Nt, Tn: a[nn - 1], pN: probN(mu, nn), pT: probT(nn, lam, t) };
  }

  /* ---------- formati ---------- */
  const pr = (x) => (x >= 0.001 ? fmt(x, 10) : x <= 0 ? '0' : sci(x, 8)); // molte cifre, o notazione scientifica per i numeri piccoli
  const ft = (x) => (Number.isInteger(x) ? fmt(x, 0) : fmt(x, 1));
  /* numero con al più due decimali, senza zeri in coda; «=» se è esatto, «≈» se è stato arrotondato */
  const trim = (t) => (t.includes(',') ? t.replace(/0+$/, '').replace(/,$/, '') : t);
  const eq2 = (x) => [Math.abs(x * 100 - Math.round(x * 100)) < 1e-7 ? '=' : '≈', trim(fmt(x, 2))];
  const Nv = '<var>N</var><sub><var>t</var></sub>', Tv = '<var>T</var><sub><var>n</var></sub>';

  GI.add('processo', {
    sec: '4.38',
    title: 'Contare gli arrivi o aspettare l’<var>n</var>-esimo: è lo stesso evento',
    w: 560,
    h: 314,
    alt: 'Una scalinata blu conta gli arrivi nel tempo; sull’asse del tempo i punti sono gli arrivi di una simulazione. Una linea verticale segna l’istante t e un punto blu il numero di arrivi N_t a quell’istante. Una linea orizzontale arancione tratteggiata segna il livello n; un cerchio arancione, dove la scalinata raggiunge quel livello, ha come ascissa T_n, l’istante dell’n-esimo arrivo. Il cerchio arancione sta a sinistra della linea t proprio quando il punto blu sta sul livello n o sopra, e in alto a destra compare «l’evento accade». Muovendo intensità, t e n il disegno cambia, ma le due probabilità scritte sotto restano uguali fra loro; il pulsante Rilancia fa una nuova simulazione.',
    controls: [
      { id: 'lam', label: 'Intensità <var>λ</var> (arrivi per unità di tempo)', min: 0.2, max: 5, step: 0.1, value: 0.5, fmt: (x) => fmt(x, 1) },
      { id: 't', label: 'Istante <var>t</var>', min: 0.5, max: 40, step: 0.5, value: 30, fmt: ft },
      { id: 'n', label: 'Quale arrivo, <var>n</var>', min: 1, max: 20, step: 1, int: true, value: 20 },
    ],
    seeded: true,
    presets: [
      { label: 'Il 20° cliente (esempio del testo)', set: { lam: 0.5, t: 30, n: 20 } },
      { label: 'Il primo cliente (n = 1)', set: { lam: 0.5, t: 4, n: 1 } },
      { label: 'Istante <var>t</var> = media di <var>T</var><sub>20</sub>', set: { lam: 0.5, t: 40, n: 20 } },
      { label: 'Intensità doppia', set: { lam: 1, t: 30, n: 20 } },
    ],
    caption: 'Il tempo scorre verso destra. I punti sull’asse sono gli arrivi di una simulazione («Rilancia» ne fa un’altra) e la scalinata sale di 1 a ogni arrivo. La linea verticale grigia è l’istante <var>t</var>; se l’<var>n</var>-esimo arrivo cade dopo <var>t</var>, la scalinata prosegue grigia e tratteggiata fino a lui. In blu: il punto dove la scalinata incontra la linea <var>t</var> è <var>N</var><sub><var>t</var></sub>, e i punti sull’asse sono gli arrivi entro <var>t</var> (i grigi vengono dopo). In arancione: la linea orizzontale è il livello <var>n</var>, e il cerchio dove la scalinata lo raggiunge ha come ascissa <var>T</var><sub><var>n</var></sub>, l’istante dell’<var>n</var>-esimo arrivo, che sull’asse è il punto arancione. Il cerchio sta a sinistra della linea <var>t</var> proprio quando il punto blu sta sul livello <var>n</var> o sopra: i due eventi coincidono, e per questo le due probabilità sotto sono uguali. In alto a destra, «l’evento accade» se in questa simulazione l’evento si verifica. Valori iniziali: lo sportello del testo (<var>λ</var> = 0,5 al minuto, <var>t</var> = 30 minuti, <var>n</var> = 20).',
    prove: [
      'Premi «Istante <var>t</var> = media di <var>T</var><sub>20</sub>» e poi «Rilancia» più volte: quando il cerchio arancione cade a sinistra della linea <var>t</var>, dov’è il punto blu rispetto al livello <var>n</var>? E quando cade a destra?',
      'Premi «Ripristina», poi porta <var>n</var> da 20 a 10: dove va il cerchio arancione e che cosa succede alle due probabilità?',
    ],
    calc,
    render(s) {
      const c = calc(s), { t, nn, a, Nt, Tn } = c;
      const ev = Nt >= nn; // lo stesso evento: N_t ≥ n  e  T_n ≤ t
      const end = Math.max(t, Tn), top = Math.max(nn, Nt);
      const X = P.scale(0, end, L, R), Y = P.scale(0, top, B, TOP + 10);
      const xT = X(t), xn = X(Tn), yT = Y(Nt), yN = Y(nn);
      const xt = P.nice(0, end, 5), st = xt.length > 1 ? xt[1] - xt[0] : 1, dec = Math.max(0, -Math.floor(Math.log10(st) + 1e-9));
      let svg = P.axes({ X, Y, box: [L, TOP, R, B], xt, xf: (x) => fmt(x, dec) });
      svg += tx(R + 18, B + 5, 'tempo', { ff: SANS, size: 16, fill: C.soft, ta: 'start' });

      /* istante t */
      svg += ln(xT, TOP - 6, xT, B, { stroke: C.soft, sw: 2.2 });
      svg += tx(xT, TOP - 14, '*t* = ' + ft(t), { ff: SANS, size: 18, fill: C.soft, fw: 700, ...halo });

      /* livelli: n (arancione) fino a T_n e poi giù sull'asse; N_t (blu) da t all'asse delle ordinate */
      const dash = { sw: 2, da: '6 5' };
      svg += ln(L, yN, xn, yN, { stroke: C.B, ...dash }) + ln(xn, yN, xn, B, { stroke: C.B, ...dash });
      svg += ln(L, yT, xT, yT, { stroke: C.A, ...dash });

      /* la scalinata: blu fino a t, grigia tratteggiata da t a T_n se l'n-esimo arrivo è dopo t */
      let d1 = `M${f(X(0))} ${f(Y(0))}`;
      for (let k = 0; k < Nt; k++) d1 += `H${f(X(a[k]))}V${f(Y(k + 1))}`;
      d1 += `H${f(xT)}`;
      if (Tn > t) {
        let d2 = `M${f(xT)} ${f(yT)}`;
        for (let k = Nt; k < nn; k++) d2 += `H${f(X(a[k]))}V${f(Y(k + 1))}`;
        svg += path(d2, { stroke: C.soft, sw: 2.4, da: '5 4', lj: 'round' });
      }
      svg += path(d1, { stroke: C.A, sw: 3, lj: 'round' });

      /* gli arrivi sull'asse del tempo */
      let vis = 0;
      while (vis < a.length && a[vis] <= end) vis++;
      const rd = vis > 80 ? 1.9 : vis > 40 ? 2.6 : 3.8;
      for (let k = 0; k < vis; k++) {
        if (k === nn - 1) continue;
        svg += a[k] <= t ? circ(X(a[k]), B, rd, { fill: C.A }) : circ(X(a[k]), B, rd, { fill: C.soft, op: 0.75 });
      }

      /* i due punti evidenziati e le etichette */
      svg += circ(xn, B, 6.5, { fill: C.B, stroke: C.paper, sw: 2 }) + circ(xn, yN, 9, { stroke: C.B, sw: 3 }); // anello: se T_n ≈ t e N_t = n il punto blu resta visibile dentro
      svg += circ(xT, yT, 5.5, { fill: C.A, stroke: C.paper, sw: 2 });
      let y1 = yT, y2 = yN; // etichette dei livelli a sinistra dell'asse, distanziate se i livelli sono vicini
      if (Math.abs(y1 - y2) < 24) { const m = (y1 + y2) / 2, up = y1 <= y2; y1 = up ? m - 12 : m + 12; y2 = up ? m + 12 : m - 12; }
      svg += tx(L - 10, y1 + 5, '*N_t* = ' + fmt(Nt, 0), { ff: SANS, size: 20, fill: C.A, fw: 700, ta: 'end', ...halo });
      svg += tx(L - 10, y2 + 5, '*n* = ' + fmt(nn, 0), { ff: SANS, size: 20, fill: C.B, fw: 700, ta: 'end', ...halo });
      svg += tx(xn, B + 48, '*T*_{' + nn + '} = ' + fmt(Tn, 1), { ff: SANS, size: 20, fill: C.B, fw: 700, ...halo });

      /* l'uguaglianza fra eventi e se, in questa simulazione, accade */
      svg += tx(14, 26, '{*N_t* ≥ *n*} = {*T_n* ≤ *t*}', { size: 20, ta: 'start' });
      svg += tx(R + 50, 26, ev ? 'l’evento accade' : 'l’evento non accade', { ff: SANS, size: 17, fw: 700, fill: ev ? 'var(--verde)' : C.soft, ta: 'end' });

      const yes = ev ? 'vero' : 'falso';
      const arrivi = Nt === 1 ? 'arrivo' : 'arrivi', art = nn === 8 || nn === 11 ? 'l’' : 'il '; // l’8°, l’11°, ma il 7°, il 20°
      const [eM, vM] = eq2(c.mu), [eT, vT] = eq2(nn / c.lam);
      const out = `<p>Una simulazione: ${Nv} = <span class="gi-hl">${fmt(Nt, 0)}</span> ${arrivi} entro <var>t</var> = ${ft(t)}; ${art}${nn}° arrivo avviene al tempo <var>T</var><sub>${nn}</sub> = <span class="gi-hl">${fmt(Tn, 2)}</span>. Qui «${Nv} ≥ <var>n</var>» è <b>${yes}</b> e «${Tv} ≤ <var>t</var>» è <b>${yes}</b>: è lo stesso evento. In media ${Nv} = <var>λt</var> ${eM} ${vM} e ${Tv} = <var>n</var>/<var>λ</var> ${eT} ${vT}.</p>
  <p><var>P</var>(${Nv} ≥ <var>n</var>) = 1 − Σ<sub><var>k</var>=0</sub><sup>${fmt(nn - 1, 0)}</sup> <var>e</var><sup>−<var>λt</var></sup>(<var>λt</var>)<sup><var>k</var></sup>/<var>k</var>! = <span class="gi-hl">${pr(c.pN)}</span></p>
  <p><var>P</var>(${Tv} ≤ <var>t</var>) = integrale della densità Γ(<var>n</var>, <var>λ</var>) da 0 a <var>t</var>, calcolato numericamente = <span class="gi-hl">${pr(c.pT)}</span></p>`;
      return { svg, out };
    },
    selftest() {
      const W = GI.widgets.processo, d = GI.defaults(W), o = W.render(d).out;
      const count = (hay, needle) => hay.split(needle).length - 1;
      /* confronto fra le due probabilità e con scipy; ogni valore atteso viene dal comando Python indicato */
      // python3 -I -c "from scipy.stats import poisson,gamma; print(repr(poisson.sf(19,15)), repr(gamma.cdf(30,a=20,scale=2)))"
      const testo = 0.12478121503252497; // stesso valore dalle due strade
      // python3 -I -c "from scipy.stats import poisson; print(repr(poisson.sf(3,3)))"   (la «Prova tu»: 3 all'ora, 4° paziente entro 1 ora)
      const pronto = 0.35276811121776874;
      // python3 -I -c "import math; print(repr(1-math.exp(-2)))"   (n = 1, λ = 0,5, t = 4: 1 − e^{−λt})
      const primo = 0.8646647167633873;
      // python3 -I -c "from scipy.stats import poisson; print(repr(poisson.sf(19,20)))"   (λ = 0,5, t = 40, n = 20)
      const attesa = 0.5297427331607608;
      // python3 -I -c "from scipy.stats import poisson; print(repr(poisson.sf(19,30)))"   (λ = 1, t = 30, n = 20)
      const doppio = 0.9781265315586091;
      // python3 -I -c "from scipy.stats import poisson; print(repr(poisson.sf(14,0.1)))"   (λ = 0,2, t = 0,5, n = 15: probabilità minuscola)
      const piccola = 6.962942197620368e-28;
      // python3 -I -c "from scipy.stats import poisson; print(repr(poisson.sf(19,8)))"   (λ = 0,2, t = 40, n = 20)
      const lenta = 0.0002529394020919561;
      // python3 -I -c "from scipy.stats import poisson; print(repr(poisson.sf(0,200)))"   (λ = 5, t = 40, n = 1: quasi certo)
      const certo = 1;
      const pn = (lam, t, n) => probN(lam * t, n), pt = (lam, t, n) => probT(n, lam, t);
      /* nelle simulazioni N_t ≥ n e T_n ≤ t coincidono sempre */
      let diversi = 0;
      for (const [lam, t, n] of [[0.5, 30, 20], [3, 1, 4], [0.2, 0.5, 15], [5, 40, 1], [1, 7, 6]]) {
        for (let seed = 1; seed <= 200; seed++) { const c = calc({ lam, t, n, seed }); if ((c.Nt >= n) !== (c.Tn <= t)) diversi++; }
      }
      /* la frequenza di T_4 ≤ 1 con λ = 3 su 4000 simulazioni sta vicino a 0,3528 (scarto tipico 0,0076) */
      let hit = 0;
      for (let seed = 1; seed <= 4000; seed++) if (calc({ lam: 3, t: 1, n: 4, seed }).Tn <= 1) hit++;
      /* medie su 2000 simulazioni (λ = 0,5, t = 30, n = 20): E[N_t] = λt = 15 (scarto della media 0,09) e E[T_20] = 20/0,5 = 40 (scarto 0,20) */
      let sN = 0, sT = 0;
      for (let seed = 1; seed <= 2000; seed++) { const c = calc({ lam: 0.5, t: 30, n: 20, seed }); sN += c.Nt; sT += c.Tn; }
      return [
        ['P(N_t ≥ n), esempio del testo (Poisson)', pn(0.5, 30, 20), testo, 1e-14],
        ['P(T_n ≤ t), esempio del testo (Gamma)', pt(0.5, 30, 20), testo, 1e-13],
        ['Prova tu: Poisson', pn(3, 1, 4), pronto, 1e-14],
        ['Prova tu: Gamma', pt(3, 1, 4), pronto, 1e-13],
        ['n = 1 è 1 − e^{−λt} (Poisson)', pn(0.5, 4, 1), primo, 1e-14],
        ['n = 1 è 1 − e^{−λt} (Gamma)', pt(0.5, 4, 1), primo, 1e-13],
        ['n = 1 con la formula chiusa', pn(0.5, 4, 1), 1 - Math.exp(-0.5 * 4), 1e-14],
        ['t = attesa media: Poisson', pn(0.5, 40, 20), attesa, 1e-14],
        ['t = attesa media: Gamma', pt(0.5, 40, 20), attesa, 1e-13],
        ['ritmo doppio: Poisson', pn(1, 30, 20), doppio, 1e-14],
        ['ritmo doppio: Gamma', pt(1, 30, 20), doppio, 1e-13],
        ['probabilità minuscola (relativa), Poisson', pn(0.2, 0.5, 15) / piccola, 1, 1e-9],
        ['probabilità minuscola (relativa), Gamma', pt(0.2, 0.5, 15) / piccola, 1, 1e-9],
        ['ritmo lento, Poisson', pn(0.2, 40, 20), lenta, 1e-15],
        ['ritmo lento, Gamma', pt(0.2, 40, 20), lenta, 1e-14],
        ['quasi certo, Poisson', pn(5, 40, 1), certo, 1e-14],
        ['quasi certo, Gamma', pt(5, 40, 1), certo, 1e-12],
        ['simulazioni: N_t ≥ n e T_n ≤ t coincidono', diversi, 0, 0],
        ['frequenza simulata di T_4 ≤ 1', hit / 4000, pronto, 0.03],
        ['media simulata di N_t = λt', sN / 2000, 15, 0.5],
        ['media simulata di T_20 = n/λ', sT / 2000, 40, 1],
        ['il testo mostra il valore con molte cifre (due volte)', count(o, '0,1247812150'), 2, 0],
      ];
    },
  });
})();

/* ---- flussi.js (sezione 4.40) ---- */
(function () {
  'use strict';
  /* 4.40 · Assottigliamento: un flusso di Poisson si divide in due flussi indipendenti (il casello: camion e auto) */
  const fmt = GI.n, sci = GI.sci, P = GI.p;
  const { tx, ln, rect, C, SANS } = GI.H;

  /* area del disegno: una riga per flusso, tutte sullo stesso asse del tempo (da 0 a 1 minuto, come nel testo) */
  const X0 = 24, X1 = 536, T = 1, H = 26;
  const ROW = [64, 148, 232]; // linea di base delle tre righe
  const AXIS = 262;
  const CAP = 400; // difesa: non si generano mai più punti (con λ ≤ 150 non si raggiungono)
  const halo = { stroke: C.paper, sw: 4, lj: 'round', paint_order: 'stroke' };

  /* Il seme sposta la sequenza pseudocasuale: con il seme 1 il caso predefinito (λ = 100, p = 0,02) dà proprio 100 veicoli,
     di cui 2 camion, come nel testo. Ogni veicolo consuma sempre due numeri (l'attesa e la moneta), qualunque siano λ e p:
     con lo stesso seme, cambiando p gli istanti non si spostano e i punti passano da una riga all'altra. */
  const SEME = 565;
  function simula(seed, lam, p) {
    const r = GI.rng((seed | 0) * 7919 + SEME), t = [], tenuto = [];
    let x = 0;
    while (t.length < CAP) {
      x += -Math.log(1 - r()) / lam; // attese esponenziali: un processo di Poisson di intensità λ
      if (x > T) break;
      t.push(x);
      tenuto.push(r() < p); // la moneta: tenuto (camion) con probabilità p
    }
    return { t, tenuto };
  }

  function calc(s) {
    const lam = s.lam, p = s.p, { t, tenuto } = simula(s.seed || 1, lam, p);
    const tot = t.length, k = tenuto.filter(Boolean).length;
    return {
      lam, p, t, tenuto, tot, k, m: tot - k,
      pl: p * lam, ql: (1 - p) * lam,
      pNone: Math.exp(-p * lam), // nessun camion, qualunque sia il numero di auto: e^{−pλ}
      pCond: Math.pow(1 - p, tot), // nessun camion, sapendo che i veicoli sono tot: (1 − p)^tot
    };
  }

  /* ---------- formati ---------- */
  const veic = (x) => (x === 1 ? 'veicolo' : 'veicoli');
  const trim = (s) => s.replace(/,(\d*?)0+$/, ',$1').replace(/,$/, ''); // «5,00» → «5», «0,60» → «0,6», «0,5000» → «0,5»
  const ex = (x) => trim(fmt(x, 2));
  const pr = (x) => (x >= 1 - 1e-12 ? '1' : x <= 0 ? '0' : x >= 0.001 ? trim(fmt(x, 4)) : sci(x, 2));
  const expo = (x) => '<var>e</var><sup>' + (x === 0 ? '0' : '−' + ex(x)) + '</sup>';
  const PL = '<var>pλ</var>', QL = '(1 − <var>p</var>)<var>λ</var>';

  GI.add('flussi', {
    sec: '4.40',
    title: 'Un flusso di veicoli si divide in camion e auto',
    w: 560,
    h: 318,
    alt: 'Tre righe di segni verticali su un asse del tempo da 0 a 1 minuto. La riga in alto mostra tutti i veicoli che arrivano a un casello, un processo di Poisson di intensità λ. A ciascun veicolo una moneta decide se è un camion, con probabilità p: la seconda riga, in arancione, tiene i camion; la terza, in blu, raccoglie le auto, cioè i veicoli scartati. I segni delle due righe di sotto cadono negli stessi istanti dei segni della riga in alto, e ogni segno sta in una sola delle due. Un numero a destra di ogni riga conta i segni. Con il cursore di λ cambia il numero di veicoli, con quello di p i segni passano dalla riga delle auto a quella dei camion, e il pulsante Rilancia disegna un altro minuto a caso.',
    controls: [
      { id: 'lam', label: 'Intensità <var>λ</var> (veicoli al minuto)', min: 1, max: 150, int: true, log: true, value: 100, fmt: (x) => fmt(x, 0) },
      { id: 'p', label: 'Un veicolo è un camion con probabilità <var>p</var>', min: 0, max: 1, step: 0.01, value: 0.02, fmt: (x) => fmt(x, 2) },
    ],
    seeded: true,
    presets: [
      { label: 'Il casello del testo', set: { lam: 100, p: 0.02, seed: 1 } },
      { label: 'Metà camion, metà auto', set: { lam: 10, p: 0.5 } },
      { label: 'Traffico rado', set: { lam: 5, p: 0.3 } },
      { label: 'Un camion ogni quattro veicoli', set: { lam: 20, p: 0.25 } },
    ],
    caption: 'Il tempo scorre verso destra, da 0 a 1 minuto; ogni segno è l’arrivo di un veicolo. In alto arrivano tutti i veicoli, un processo di Poisson di intensità <var>λ</var>. Per ciascuno si lancia una moneta: con probabilità <var>p</var> lo si tiene, come camion (tipo 1, arancione, seconda riga); altrimenti lo si scarta, come auto (tipo 2, blu, terza riga). Nella riga in alto ogni segno ha già il colore del suo tipo, e le tre righe condividono gli istanti. Il numero a destra di ogni riga conta i suoi segni; «Rilancia» disegna un altro minuto a caso. Si parte dal casello del testo: <var>λ</var> = 100 al minuto, <var>p</var> = 0,02.',
    prove: [
      'Premi «Rilancia» varie volte con i valori iniziali: attorno a quali numeri oscillano i camion e i veicoli in tutto?',
      'Alza <var>p</var> da 0 a 1 senza toccare altro: i segni della riga delle auto passano a quella dei camion, o ne compaiono di nuovi?',
    ],
    calc,
    render(s) {
      const c = calc(s), X = P.scale(0, T, X0, X1);
      const sw = c.tot > 120 ? 2 : c.tot > 60 ? 2.6 : c.tot > 25 ? 3.4 : 4.6;
      const stem = (x, cy, col, op = 1) => ln(X(x), cy, X(x), cy - H, { stroke: col, sw, lc: 'round', op });
      const base = (cy) => ln(X0, cy, X1, cy, { stroke: C.line, sw: 1.6 });
      const none = (cy, text) => tx((X0 + X1) / 2, cy - 8, text, { ff: SANS, size: 16, fill: C.soft, op: 0.85 });
      /* sotto il titolo di riga una striscia del colore della pagina: le guide tratteggiate passano dietro, senza attraversare le parole */
      const head = (cy, text, col, count) =>
        rect(X0 - 4, cy - H - 30, text.replace(/[*]/g, '').length * 9 + 10, 26, { fill: C.paper, stroke: 'none' }) +
        rect(X1 - 38, cy - H - 30, 42, 26, { fill: C.paper, stroke: 'none' }) +
        tx(X0, cy - H - 12, text, { ff: SANS, size: 17, fill: col, fw: 600, ta: 'start', ...halo }) +
        tx(X1, cy - H - 12, fmt(count, 0), { ff: SANS, size: 20, fill: col, fw: 700, ta: 'end', ...halo });
      const idx = c.t.map((_, i) => i), K = idx.filter((i) => c.tenuto[i]), Q = idx.filter((i) => !c.tenuto[i]);

      let svg = '';
      /* guide: dai punti tenuti della riga in alto alla riga dei camion (solo se sono pochi) */
      if (c.k > 0 && c.k <= 30) for (const i of K) svg += ln(X(c.t[i]), ROW[0] + 4, X(c.t[i]), ROW[1] - H - 4, { stroke: C.B, sw: 1.2, da: '3 4', op: 0.55 });
      /* riga 1: tutti i veicoli, ciascuno del colore che avrà */
      svg += base(ROW[0]);
      for (const i of Q) svg += stem(c.t[i], ROW[0], C.A, 0.85);
      for (const i of K) svg += stem(c.t[i], ROW[0], C.B);
      if (!c.tot) svg += none(ROW[0], 'nessun veicolo');
      svg += head(ROW[0], 'tutti i veicoli · intensità *λ*', C.ink, c.tot);
      /* riga 2: i tenuti */
      svg += base(ROW[1]);
      for (const i of K) svg += stem(c.t[i], ROW[1], C.B);
      if (!c.k) svg += none(ROW[1], 'nessun camion');
      svg += head(ROW[1], 'camion (tipo 1) · intensità *pλ*', C.B, c.k);
      /* riga 3: gli scartati */
      svg += base(ROW[2]);
      for (const i of Q) svg += stem(c.t[i], ROW[2], C.A, 0.85);
      if (!c.m) svg += none(ROW[2], 'nessuna auto');
      svg += head(ROW[2], 'auto (tipo 2) · intensità (1 − *p*)*λ*', C.A, c.m);
      /* asse del tempo */
      svg += P.axes({ X, Y: () => 0, box: [X0, 0, X1, AXIS], xt: P.nice(0, T, 5), xf: (x) => (x === 0 ? '0' : x === 1 ? '1' : fmt(x, 1)), noy: true, xl: 'tempo (minuti)' });

      const noCar = c.tot === 0
        ? '<p>Sapendo invece che non è passato nessun veicolo, non può essere passato nessun camion: <var>P</var>(nessun camion) = (1 − <var>p</var>)<sup>0</sup> = <span class="gi-hl">1</span>.</p>'
        : `<p>Sapendo invece che ${c.tot === 1 ? 'è passato 1 veicolo' : 'sono passati ' + fmt(c.tot, 0) + ' veicoli'} in tutto, i camion sono Bin(${fmt(c.tot, 0)}; ${ex(c.p)}) e <var>P</var>(nessun camion) = (1 − <var>p</var>)<sup>${fmt(c.tot, 0)}</sup> = ${ex(1 - c.p)}<sup>${fmt(c.tot, 0)}</sup> = <span class="gi-hl">${pr(c.pCond)}</span>.</p>`;
      const deg = c.p <= 0 || c.p >= 1; // agli estremi uno dei due flussi è vuoto: non è un processo di Poisson (serve intensità > 0)
      const out = `<p>Il casello riceve veicoli con intensità <var>λ</var> = <b>${ex(c.lam)}</b> al minuto. In questo minuto ${c.tot === 1 ? 'passa' : 'passano'} <b>${fmt(c.tot, 0)}</b> ${veic(c.tot)}: <span class="gi-hl">${fmt(c.k, 0)} camion</span> (in media ${PL} = ${ex(c.pl)}) e <span class="gi-hl">${fmt(c.m, 0)} auto</span> (in media ${QL} = ${ex(c.ql)}).</p>
  <p>Camion e auto formano due ${deg ? 'flussi' : 'processi di Poisson'} indipendenti, di intensità ${ex(c.pl)} e ${ex(c.ql)} al minuto${deg ? ' (' + (c.p <= 0 ? 'il flusso dei camion' : 'il flusso delle auto') + ' è sempre vuoto)' : ''}. Perciò, in un minuto, <var>P</var>(nessun camion) = <var>e</var><sup>−<var>pλ</var></sup> = ${expo(c.pl)} = <span class="gi-hl">${pr(c.pNone)}</span>, e non cambia sapendo quante auto sono passate (qui ${fmt(c.m, 0)}).</p>
  ${noCar}`;
      return { svg, out };
    },
    selftest() {
      const W = GI.widgets.flussi, d = GI.defaults(W), c = calc(d), o = W.render(d).out;
      const M = GI.m;
      /* statistiche su molte simulazioni (semi 1, 2, …): il PRNG è deterministico, quindi l'esito è sempre lo stesso */
      const stat = (lam, p, N, fn) => { const r = []; for (let sd = 1; sd <= N; sd++) r.push(calc({ lam, p, seed: sd })); return fn(r); };
      const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
      const corr = (a, b) => { const ma = mean(a), mb = mean(b); let sab = 0, saa = 0, sbb = 0; a.forEach((x, i) => { sab += (x - ma) * (b[i] - mb); saa += (x - ma) ** 2; sbb += (b[i] - mb) ** 2; }); return sab / Math.sqrt(saa * sbb); };
      const mediaK = stat(100, 0.02, 4000, (r) => mean(r.map((x) => x.k)));
      const mediaM = stat(100, 0.02, 4000, (r) => mean(r.map((x) => x.m)));
      const mediaTot = stat(100, 0.02, 4000, (r) => mean(r.map((x) => x.tot)));
      const rho = stat(20, 0.3, 6000, (r) => corr(r.map((x) => x.k), r.map((x) => x.m)));
      /* nessun camion, con tante o con poche auto: la frequenza resta e^{−2} */
      const zero = (r, ok) => { const a = r.filter(ok); return a.filter((x) => x.k === 0).length / a.length; };
      const molte = stat(100, 0.02, 6000, (r) => zero(r, (x) => x.m >= 98));
      const poche = stat(100, 0.02, 6000, (r) => zero(r, (x) => x.m <= 97));
      /* cambiando p con lo stesso seme: i veicoli restano gli stessi e i camion non diminuiscono mai quando p cresce */
      let diverso = 0, calo = 0;
      for (let sd = 1; sd <= 200; sd++) {
        const a = calc({ lam: 50, p: 0.1, seed: sd }), b = calc({ lam: 50, p: 0.4, seed: sd }), e = calc({ lam: 50, p: 0.9, seed: sd });
        if (a.tot !== b.tot || b.tot !== e.tot || a.t.some((x, i) => x !== e.t[i])) diverso++;
        if (!(a.k <= b.k && b.k <= e.k)) calo++;
      }
      /* Σ_N P(N = n) (1 − p)^n = e^{−pλ}: il numero senza condizione è la media dei numeri condizionati al totale */
      let media = 0;
      for (let nn = 0; nn <= 500; nn++) media += M.poisPmf(100, nn) * Math.pow(0.98, nn);
      // python3 -I -c "import math; print(repr(math.exp(-2)))"   (nessun camion in un minuto: e^{−2} = 0,1353)
      const nessuno = 0.1353352832366127;
      // python3 -I -c "print(repr(0.98**100))"   (nessun camion sapendo che i veicoli sono 100)
      const cento = 0.13261955589475294;
      // python3 -I -c "import math; print(repr(1-math.exp(-2)))"   (almeno un camion: 0,8647)
      const almeno = 0.8646647167633873;
      // python3 -I -c "import math; print(repr(math.exp(-5)), repr(0.5**10))"   (λ = 10, p = 0,5: e^{−5} e, con 10 veicoli, 0,5^10)
      const cinque = 0.006737946999085467, dieci = 0.0009765625;
      // python3 -I -c "from scipy.stats import poisson,binom; print(repr(poisson.pmf(5,6)*binom.pmf(2,5,0.25)), repr(poisson.pmf(2,1.5)*poisson.pmf(3,4.5)))"   (la tendina: λt = 6, p = 1/4, 2 di tipo 1 e 3 di tipo 2; i due conti coincidono)
      const tendina = 0.04235180476851033;
      // python3 -I -c "from scipy.stats import poisson; print(repr(sum(poisson.pmf(k,100)*0.98**k for k in range(0,500))))"   (come sopra, mediando su N)
      const mediata = 0.1353352832366205;
      /* simulazione riscritta in Python con il generatore riscritto a parte (numero di veicoli, camion, somma degli istanti).
         python3 -I:  import math; M=0xFFFFFFFF
                      def rng(s):
                          a=[(s+0x6d2b79f5)&M]
                          def f():
                              a[0]=(a[0]+0x6d2b79f5)&M; x=a[0]; t=((x^(x>>15))*(1|x))&M
                              t=((t+(((t^(t>>7))*(61|t))&M))&M)^t; return ((t^(t>>14))&M)/2**32
                          return f
                      def sim(sd,l,p):
                          r=rng(sd*7919+565); x=0; t=[]; k=0
                          while True:
                              x+=-math.log(1-r())/l
                              if x>1: break
                              t.append(x); k+=r()<p
                          return len(t),k,sum(t)
                      sim(1,100,0.02) → (100, 2, 49.10057420469599); sim(1,10,0.5) → (9, 4, 4.126005773019378);
                      sim(11,37,0.13) → (36, 7, 15.147712887858566); sim(7,150,1) → (155, 155, 78.69539816014832) */
      const somma = (s) => { const q = calc(s); return [q.tot, q.k, q.t.reduce((x, y) => x + y, 0)]; };
      const s1 = somma({ lam: 100, p: 0.02, seed: 1 }), s2 = somma({ lam: 10, p: 0.5, seed: 1 }), s3 = somma({ lam: 37, p: 0.13, seed: 11 }), s4 = somma({ lam: 150, p: 1, seed: 7 });
      /* con 10 veicoli e p = 0,5 la probabilità di nessun camion dato il totale è 0,5^10: si cerca un seme che dia proprio 10 veicoli */
      let sd10 = 1;
      while (calc({ lam: 10, p: 0.5, seed: sd10 }).tot !== 10) sd10++;
      const dieciVeicoli = calc({ lam: 10, p: 0.5, seed: sd10 });
      /* nel disegno ci sono tot + k + m segni (uno per riga) */
      const segni = (s) => (W.render(s).svg.match(/stroke-linecap="round"/g) || []).length;
      return [
        ['predefinito: veicoli in tutto (testo: 100)', c.tot, 100, 0],
        ['predefinito: camion (testo: 2 al minuto)', c.k, 2, 0],
        ['predefinito: auto (testo: 98)', c.m, 98, 0],
        ['P(nessun camion) = e^{−pλ}, esempio del testo', c.pNone, nessuno, 1e-15],
        ['P(nessun camion | 100 veicoli) = 0,98^100', c.pCond, cento, 1e-15],
        ['almeno un camion: 1 − e^{−2} = 0,8647', 1 - c.pNone, almeno, 1e-15],
        ['λ = 10, p = 0,5: e^{−5}', calc({ lam: 10, p: 0.5, seed: 1 }).pNone, cinque, 1e-15],
        ['pCond con 10 veicoli e p = 0,5: 0,5^10', dieciVeicoli.pCond, dieci, 1e-18],
        ['intensità pλ del testo (2 al minuto)', c.pl, 2, 1e-12],
        ['intensità (1−p)λ del testo (98 al minuto)', c.ql, 98, 1e-12],
        ['simulazione contro Python: veicoli (λ = 100, p = 0,02, seme 1)', s1[0], 100, 0],
        ['simulazione contro Python: camion (stesso caso)', s1[1], 2, 0],
        ['simulazione contro Python: somma degli istanti (stesso caso)', s1[2], 49.10057420469599, 1e-9],
        ['simulazione contro Python: veicoli e camion (λ = 10, p = 0,5)', s2[0] * 10 + s2[1], 94, 0],
        ['simulazione contro Python: somma degli istanti (λ = 10, p = 0,5)', s2[2], 4.126005773019378, 1e-9],
        ['simulazione contro Python: veicoli e camion (λ = 37, p = 0,13, seme 11)', s3[0] * 100 + s3[1], 3607, 0],
        ['simulazione contro Python: somma degli istanti (λ = 37)', s3[2], 15.147712887858566, 1e-9],
        ['p = 1: tutti i veicoli sono camion (λ = 150, seme 7)', s4[0] * 1000 + s4[1], 155155, 0],
        ['p = 1: somma degli istanti', s4[2], 78.69539816014832, 1e-9],
        ['segni nel disegno: tot + camion + auto = 2·tot', segni(d), 200, 0],
        ['segni nel disegno con p = 0 (nessun camion)', segni({ lam: 12, p: 0, seed: 4 }), 2 * calc({ lam: 12, p: 0, seed: 4 }).tot, 0],
        ['identità del teorema: Poisson(6)·Bin(5; 1/4) in 2', M.poisPmf(6, 5) * M.binomPmf(5, 0.25, 2), tendina, 1e-13],
        ['identità del teorema: Poisson(1,5) in 2 · Poisson(4,5) in 3', M.poisPmf(1.5, 2) * M.poisPmf(4.5, 3), tendina, 1e-13],
        ['la media dei (1 − p)^N pesata con Poisson(λ) è e^{−pλ}', media, mediata, 1e-10],
        ['media dei camion su 4000 simulazioni (≈ pλ = 2)', mediaK, 2, 0.15],
        ['media delle auto su 4000 simulazioni (≈ 98)', mediaM, 98, 1],
        ['media dei veicoli su 4000 simulazioni (≈ 100)', mediaTot, 100, 1],
        ['camion e auto non sono correlati (λ = 20, p = 0,3)', rho, 0, 0.06],
        ['nessun camion quando le auto sono molte: ≈ e^{−2}', molte, nessuno, 0.03],
        ['nessun camion quando le auto sono poche: ≈ e^{−2}', poche, nessuno, 0.03],
        ['stesso seme, p diverso: stessi istanti', diverso, 0, 0],
        ['stesso seme: aumentando p i camion non diminuiscono', calo, 0, 0],
        ['la lettura riporta 0,1353', o.includes('0,1353') ? 1 : 0, 1, 0],
        ['la lettura riporta 0,1326', o.includes('0,1326') ? 1 : 0, 1, 0],
        ['la lettura riporta 100 veicoli, 2 camion, 98 auto', /100<\/b> veicoli/.test(o) && o.includes('2 camion') && o.includes('98 auto') ? 1 : 0, 1, 0],
      ];
    },
  });
})();
