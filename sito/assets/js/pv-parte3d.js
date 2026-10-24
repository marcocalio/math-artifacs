/* =========================================================================
   pv-parte3d.js — video della Parte 3 (Modelli continui): sezioni 3.8 (le leggi
   continue: uniforme, esponenziale, Gamma, normale, vita residua e tasso di guasto,
   condizionate a un intervallo) e 3.9 (funzioni caratteristiche).
   Le altre sezioni stanno in pv-parte3.js, pv-parte3b.js e pv-parte3c.js; il ripasso
   'parte3' è in pv-parte3z.js.
   Si appoggia a pv.js: ogni video è un PV.add(id, {...}).
   Tutti i tempi sono in secondi; le coordinate sono nel riquadro 640 × 360.
   ========================================================================= */
(function () {
  'use strict';
  const { f, lerp, seg, E, p, arc, rnd, C, SANS, T, rect, circ, ln, path, g, draw, tx, txc, check, cross, vis, on, heading, fr, brace, vbrace, pills } = PV.h;
  const OK = 'var(--verde)', NO = 'var(--rosso)';
  const nc = (v, d = 1) => v.toFixed(d).replace('.', ','); // numero con la virgola

  /* freccia da (x1,y1) a (x2,y2) che si disegna (u da 0 a 1); la punta compare a fine corsa */
  function arrow(x1, y1, x2, y2, u, col, op = 1, sw = 2.2) {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 8;
    let o = path(`M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`, { stroke: col, sw, op, lc: 'round', ...draw(u) });
    if (u > 0.92) o += path(`M${f(x2)} ${f(y2)}L${f(x2 - h * Math.cos(a - 0.45))} ${f(y2 - h * Math.sin(a - 0.45))}M${f(x2)} ${f(y2)}L${f(x2 - h * Math.cos(a + 0.45))} ${f(y2 - h * Math.sin(a + 0.45))}`, { stroke: col, sw, lc: 'round', op });
    return o;
  }
  /* poligonale di una funzione fn su [a,b], con X(x) e Y(y) che portano a pixel */
  function curve(fn, a, b, X, Y, n = 90) {
    let d = '';
    for (let i = 0; i <= n; i++) {
      const x = lerp(a, b, i / n);
      d += (i ? 'L' : 'M') + f(X(x)) + ' ' + f(Y(fn(x)));
    }
    return d;
  }
  /* area sotto fn fra a e b, chiusa sulla quota base */
  const areaD = (fn, a, b, X, Y, base, n = 90) => curve(fn, a, b, X, Y, n) + `L${f(X(b))} ${base}L${f(X(a))} ${base}Z`;
  /* fulcro (triangolo) di una sbarra in equilibrio */
  const fulc = (x, y, op = 1) => path(`M${x} ${y}l-13 24h26z`, { fill: C.hi, fo: 0.95, stroke: C.ink, sw: 1.6, op });
  /* base con apice, entrambi in corsivo: sp('e', '−λx') → «e» con apice «−λx» */
  const sp = (b, e) => '*' + b + '**^{' + e + '}*';

  /* ---------- numeri: Φ della normale, densità normale, funzione Gamma ---------- */
  const SQ2PI = Math.sqrt(2 * Math.PI);
  const npdf = (x, m = 0, s = 1) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * SQ2PI);
  function erf(x) { // Abramowitz-Stegun 7.1.26 (errore < 1,5·10^-7)
    const s = x < 0 ? -1 : 1, a = Math.abs(x), u = 1 / (1 + 0.3275911 * a);
    return s * (1 - (((((1.061405429 * u - 1.453152027) * u) + 1.421413741) * u - 0.284496736) * u + 0.254829592) * u * Math.exp(-a * a));
  }
  const Phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2));
  function gam(z) { // funzione Gamma (Lanczos)
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gam(1 - z));
    const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    z -= 1;
    let s = c[0];
    for (let i = 1; i < 9; i++) s += c[i] / (z + i);
    const t = z + 7.5;
    return SQ2PI * Math.pow(t, z + 0.5) * Math.exp(-t) * s;
  }
  const gpdf = (x, a, l) => (x <= 0 ? 0 : (l ** a * x ** (a - 1) * Math.exp(-l * x)) / gam(a)); // densità Gamma(α, λ)

  /* ======================================================================
     3.8 · Uniforme U(a, b): un rettangolo di area 1
     ====================================================================== */
  const UX = (m) => 70 + 50 * m, UB = 262, UH = 70, FH = 140; // minuti dopo le 9 → pixel; riga di base; altezza di 1/10; altezza di F = 1
  const FY = (v) => UB - FH * v;
  const hm = (m) => '9:' + (m < 10 ? '0' : '') + m;
  const UBIN = [], UCNT = new Array(10).fill(0); // 40 arrivi: ciascuno cade in un minuto e si impila sugli altri
  for (let k = 0; k < 40; k++) {
    const b = Math.floor(10 * ((k * 0.6180339887 + 0.08 * rnd(k + 5)) % 1));
    UBIN.push([b, UCNT[b]++]);
  }

  PV.add('uniformec', {
    sec: '3.11',
    short: 'Uniforme',
    title: 'La legge uniforme U(a, b): un rettangolo di area 1',
    alt: 'Animazione: gli arrivi di un amico fra le 9:00 e le 9:10 cadono in tutti i minuti allo stesso modo e formano un rettangolo di area 1 (altezza 1/10); la probabilità di un intervallo è la sua lunghezza divisa per b − a (3/10 fra le 9:02 e le 9:05) e la ripartizione cresce in linea retta; la media è il punto medio e la varianza di U(a, b) è quella di U(0, 1) moltiplicata per (b − a)².',
    dur: 53,
    poster: 19.4,
    chap: [[0, 'Un rettangolo di area 1'], [21.5, 'La probabilità è una lunghezza'], [37.5, 'Media e varianza']],
    caps: [
      [0, 'Un amico scrive «arrivo tra le 9 e le 9 e 10»: può arrivare in qualunque istante, senza zone favorite. Segno dove arriva, giorno dopo giorno.'],
      [8.6, 'Le colonne diventano uguali: la densità è un rettangolo, con la stessa altezza su tutto l’intervallo.'],
      [14.8, 'Per avere area 1 su una base lunga *b* − *a* l’altezza è 1/(*b* − *a*): qui 10 · 1/10 = 1. Con base 5 sarebbe 1/5.'],
      [21.5, 'La probabilità di un sottointervallo è la sua lunghezza divisa per *b* − *a*: ogni minuto pesa 1/10, tre minuti pesano 3/10.'],
      [29.2, 'La ripartizione cresce in linea retta: è la frazione di intervallo già percorsa. Fra le 9:02 e le 9:05: 0,5 − 0,2 = 0,3.'],
      [37.5, 'La media è il punto medio, (*a* + *b*)/2: alle 9:05 il rettangolo sta in equilibrio.'],
      [42.4, 'Una *U*(0, 1) ha varianza 1/12. Allungata di *b* − *a*, la sua deviazione standard (barra arancione) si moltiplica per *b* − *a*…'],
      [49.8, '…e la varianza per (*b* − *a*)²: in tutto (*b* − *a*)²/12.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 20.9, 'Un rettangolo di area 1', 'un amico arriva fra le 9:00 e le 9:10') + heading(t, 21.6, 36.9, 'La probabilità è una lunghezza', '*P*(*c* < *X* < *d*) = (*d* − *c*) / (*b* − *a*)') + heading(t, 37.6, 53.4, 'Media e varianza', '*E*[*X*] = (*a* + *b*)/2,   Var(*X*) = (*b* − *a*)²/12');

      /* asse dei tempi, comune ai primi tre quadri */
      const ax = p(t, 0.4, 1.4) * (1 - p(t, 42, 42.8)), h2 = t > 22.8 && t < 29.4;
      o += g({ op: ax }, ln(UX(0) - 14, UB, UX(10) + 14, UB, { stroke: C.soft, sw: 1.8 }) + [0, 2, 4, 6, 8, 10].map((m) => ln(UX(m), UB, UX(m), UB + 6, { stroke: C.soft, sw: 1.8 }) + tx(UX(m), UB + 28, hm(m), { ff: SANS, size: 17, fill: m === 2 && h2 ? C.B : C.soft })).join(''));

      /* capitolo 1: 40 arrivi, colonne, rettangolo */
      const c1 = 1 - p(t, 20.9, 21.7);
      if (c1 > 0.004) {
        const df = (1 - p(t, 8.2, 9.4)) * c1;
        if (df > 0.004) UBIN.forEach(([b, s], k) => {
          const t0 = 1.4 + 0.11 * k, u = p(t, t0, t0 + 0.55, E.acc);
          if (u > 0) o += circ(UX(b + 0.5), lerp(104, UB - 7 - 12 * s, u), 5, { fill: C.A, fo: 0.9, stroke: C.paper, sw: 1, op: df });
        });
        const bl = p(t, 12, 12.8) * c1;
        o += on(bl, tx(UX(0) - 8, UB - UH + 7, '1/10', { size: 20, ta: 'end', op: bl }) + ln(UX(0), UB, UX(0), UB - UH - 36, { stroke: C.soft, sw: 1.6, op: bl }) + tx(UX(0) + 14, UB - UH - 30, '*f*(*x*)', { size: 22, fill: C.A, ta: 'start', op: bl }));
        /* quadro 1b: base × altezza */
        const bc = vis(t, 14.8, 19.2, 0.5, 0.5) * c1, ah = vis(t, 16, 19.2, 0.5, 0.5) * c1;
        o += on(bc, brace(UX(0), UX(10), UB - UH - 8, C.B, bc, -1) + tx(UX(5), UB - UH - 24, 'base: *b* − *a* = 10', { size: 22, fill: C.B, op: bc }));
        o += on(ah, tx(UX(5), UB - UH / 2 + 8, 'altezza: 1/10', { size: 22, op: ah }));
        const fm = p(t, 17.2, 18.2) * c1;
        o += on(fm, txc(320, 104, [['area = base × altezza = 10 × 1/10 = ', C.ink], ['1', OK]], { size: 26, op: fm }));
        const gh = vis(t, 19.2, 21.4, 0.5, 0.4) * c1;
        o += on(gh, rect(UX(0), UB - 2 * UH, UX(5) - UX(0), 2 * UH, { stroke: C.B, sw: 2.4, da: '7 5', op: gh }) + tx(UX(5) + 14, UB - 2 * UH + 30, 'base 5: altezza 1/5', { size: 20, fill: C.B, ta: 'start', op: gh }));
      }

      /* le colonne e il rettangolo (capitoli 1, 2a e 3a) */
      const dOp = p(t, 7.6, 8.4) * (1 - p(t, 29, 29.8)) + p(t, 37.2, 38) * (1 - p(t, 42, 42.8));
      if (dOp > 0.004) {
        const e = t < 37 ? p(t, 8.6, 10.6, E.io) : 1;
        const H = (b) => lerp(12 * UCNT[b], UH, e), w = 50 - 3 * (1 - e);
        o += UCNT.map((c, b) => rect(UX(b) + (50 - w) / 2, UB - H(b), w, H(b), { rx: e < 1 ? 2 : 0, fill: C.A, fo: 0.3 * dOp })).join('');
        let d = `M${UX(0)} ${UB}`;
        for (let b = 0; b < 10; b++) d += `V${f(UB - H(b))}H${UX(b + 1)}`;
        o += path(d + `V${UB}`, { stroke: C.A, sw: 2.4, lj: 'round', op: dOp });
      }

      /* capitolo 2a: ogni minuto pesa 1/10, tre minuti pesano 3/10 */
      const w2 = vis(t, 22.2, 29.4, 0.5, 0.5);
      if (w2 > 0.004) {
        for (let m = 1; m < 10; m++) o += ln(UX(m), UB, UX(m), UB - UH, { stroke: C.soft, sw: 1.2, da: '3 4', op: 0.7 * w2 });
        for (let j = 0; j < 3; j++) {
          const u = p(t, 23.2 + 1.2 * j, 23.8 + 1.2 * j) * w2;
          o += on(u, rect(UX(2 + j), UB - UH, 50, UH, { fill: C.hi, fo: 0.5 * u }) + tx(UX(2.5 + j), UB - UH / 2 + 8, '1/10', { size: 20, op: u }));
        }
        const pb = p(t, 26.6, 27.4) * w2, p9 = p(t, 22.6, 23.4) * w2;
        o += on(pb, brace(UX(2), UX(5), UB - UH - 8, C.B, pb, -1) + tx(UX(3.5), UB - UH - 24, '3 minuti', { size: 22, fill: C.B, op: pb }));
        o += on(p9, tx(UX(5), UB + 28, '9:05', { ff: SANS, size: 17, fill: C.B, op: p9 }));
        const eq = p(t, 27.4, 28.2) * w2;
        o += on(eq, txc(320, 118, [['*P*(9:02 < *X* < 9:05) = 3 · 1/10 = ', C.ink], ['3/10', OK]], { size: 26, op: eq }));
      }

      /* capitolo 2b: la ripartizione è una retta */
      const w3 = vis(t, 29.2, 37.2, 0.6, 0.5);
      if (w3 > 0.004) {
        const u = p(t, 29.8, 32, E.io), xe = lerp(UX(0), UX(10), u), ye = lerp(FY(0), FY(1), u);
        o += ln(UX(0), UB, UX(0), FY(1) - 18, { stroke: C.soft, sw: 1.6, op: w3 }) + tx(UX(0) - 8, FY(1) + 7, '1', { size: 20, ta: 'end', op: w3 }) + tx(UX(0) - 8, UB - 2, '0', { size: 20, ta: 'end', op: w3 }) + tx(UX(0) + 14, FY(1) - 16, '*F*(*x*)', { size: 22, fill: C.B, ta: 'start', op: w3 });
        o += ln(UX(0), FY(1), UX(10), FY(1), { stroke: C.soft, sw: 1.2, da: '3 4', op: 0.7 * w3 });
        o += path(`M${UX(0)} ${FY(0)}L${f(xe)} ${f(ye)}`, { stroke: C.B, sw: 3.4, lc: 'round', op: w3 }) + circ(xe, ye, 5.5, { fill: C.B, op: w3 });
        const q = [[2, 0.2, C.B, 32.6], [5, 0.5, C.C, 34]];
        q.forEach(([m, v, col, t0]) => {
          const a = p(t, t0, t0 + 0.8) * w3;
          o += on(a, ln(UX(m), UB, UX(m), FY(v), { stroke: col, sw: 2, da: '5 4', op: a }) + ln(UX(m), FY(v), UX(0), FY(v), { stroke: col, sw: 2, da: '5 4', op: a }) + circ(UX(m), FY(v), 5, { fill: col, op: a }) + tx(UX(0) - 8, FY(v) + 7, nc(v), { size: 20, fill: col, ta: 'end', op: a }));
        });
        const dr = p(t, 35.2, 36, E.out) * w3;
        o += on(dr, vbrace(UX(5) + 12, FY(0.5), FY(0.2), OK, dr) + tx(UX(5) + 36, FY(0.35) + 8, '0,3', { size: 24, fill: OK, ta: 'start', op: dr }));
        const fm = p(t, 31.8, 32.6) * w3;
        o += on(fm, tx(320, 104, '*F*(*x*) = (*x* − *a*)/(*b* − *a*)', { size: 26, op: fm }));
        const pl = p(t, 35.6, 36.4) * w3;
        o += on(pl, pills(334, [{ s: '*P*(9:02 < *X* < 9:05) = *F*(9:05) − *F*(9:02)', op: pl }]));
      }

      /* capitolo 3a: il punto medio */
      const m3 = p(t, 38.4, 39.2) * (1 - p(t, 42, 42.8));
      if (m3 > 0.004) {
        const wob = Math.sin(14 * (t - 39.2)) * 0.07 * Math.exp(-3 * (t - 39.2)) * (t > 39.2 ? 1 : 0);
        o += g({ tf: `rotate(${f(wob * 60)} ${UX(5)} ${UB + 36})`, op: m3 }, fulc(UX(5), UB + 36, 1));
        o += tx(320, 150, '*E*[*X*] = (*a* + *b*)/2 = 9:05', { size: 26, fill: C.B, op: m3 });
      }

      /* capitolo 3b: allungare U(0,1) fino a U(a,b) */
      const s3 = vis(t, 42.4, 53.4, 0.7, 0.01);
      if (s3 > 0.004) {
        const X1 = (u) => 290 + 60 * u, X2 = (u) => 70 + 500 * u, Y1 = 150, Y2 = 262, sg = 1 / Math.sqrt(12);
        const a1 = p(t, 42.8, 43.6) * s3, a2 = p(t, 44, 45) * s3, a3 = p(t, 46, 46.8) * s3, a4 = p(t, 50.2, 51) * s3;
        o += on(a1, ln(X1(0), Y1, X1(1), Y1, { stroke: C.A, sw: 3.4, op: a1 }) + tx(X1(0), Y1 - 12, '0', { ff: SANS, size: 17, fill: C.soft, op: a1 }) + tx(X1(1), Y1 - 12, '1', { ff: SANS, size: 17, fill: C.soft, op: a1 }) + tx(X1(0) - 22, Y1 + 7, '*U*', { size: 22, fill: C.A, ta: 'end', op: a1 }) + tx(320, Y1 - 36, 'varianza 1/12', { size: 22, op: a1 }));
        o += on(a2, ln(X1(0), Y1 + 6, X2(0), Y2 - 6, { stroke: C.soft, sw: 1.4, da: '5 4', op: a2 }) + ln(X1(1), Y1 + 6, X2(1), Y2 - 6, { stroke: C.soft, sw: 1.4, da: '5 4', op: a2 }) + ln(X1(0.5), Y1 + 6, X2(0.5), Y2 - 6, { stroke: C.soft, sw: 1.2, da: '2 4', op: a2 }) + ln(X2(0), Y2, X2(1), Y2, { stroke: C.A, sw: 3.4, op: a2 }) + tx(X2(0), Y2 + 28, hm(0), { ff: SANS, size: 17, fill: C.soft, op: a2 }) + tx(X2(1), Y2 + 28, hm(10), { ff: SANS, size: 17, fill: C.soft, op: a2 }) + tx(X2(0.5), Y2 + 28, '9:05', { ff: SANS, size: 17, fill: C.soft, op: a2 }));
        o += on(a3, ln(X1(0.5 - sg), Y1, X1(0.5 + sg), Y1, { stroke: C.B, sw: 9, op: a3 }) + ln(X1(0.5 - sg), Y1 + 6, X2(0.5 - sg), Y2 - 6, { stroke: C.B, sw: 1.6, op: a3 }) + ln(X1(0.5 + sg), Y1 + 6, X2(0.5 + sg), Y2 - 6, { stroke: C.B, sw: 1.6, op: a3 }) + ln(X2(0.5 - sg), Y2, X2(0.5 + sg), Y2, { stroke: C.B, sw: 9, op: a3 }));
        o += on(a3, tx(X2(0.5) - 14, Y2 - 12, '*σ* ≈ 2,9 min', { size: 20, fill: C.B, ta: 'end', op: a3 }));
        o += on(a4, pills(334, [{ s: '*a* + (*b* − *a*)*U*: Var = (*b* − *a*)² · 1/12', op: a4 }]));
      }
      return o;
    },
  });

  /* ======================================================================
     3.8 · Esponenziale Exp(λ): attese, media e mediana, ritmo, assenza di memoria
     ====================================================================== */
  const HX = (x) => 60 + 260 * x, HB = 288, HY = (d) => HB - 64 * d; // attesa in secondi (0-2) → pixel; base; densità → pixel
  const STX = (s) => 60 + 96 * s; // tempo delle richieste (0-5,4 s) → pixel
  const W10 = [0.31, 0.82, 0.12, 0.45, 1.23, 0.07, 0.58, 0.29, 0.91, 0.44]; // le prime dieci attese, scelte a mano
  const REQ = []; // gli istanti delle prime dieci richieste
  W10.reduce((a, w) => (REQ.push(a + w), a + w), 0);
  const W220 = W10.concat(Array.from({ length: 210 }, (_, i) => { const j = (i * 97) % 210; return -Math.log(1 - (j + rnd(j + 400)) / 210) / 2; })); // 220 attese di una Exp(2)
  const binOf = (w) => Math.min(9, Math.floor(w / 0.2));
  const D220 = new Array(10).fill(0);
  W220.forEach((w) => { if (w < 2) D220[binOf(w)] += 1 / (220 * 0.2); });
  const TLAND = (k) => 6.1 + 0.42 * k + 0.45; // quando la k-esima attesa arriva nella sua colonna
  const fe2 = (x) => 2 * Math.exp(-2 * x);

  /* altezze delle 10 colonne (densità) al tempo t */
  function histH(t) {
    const soft = new Array(10).fill(0);
    let n = 0;
    W10.forEach((w, k) => { const u = p(t, TLAND(k) - 0.12, TLAND(k) + 0.12, E.lin); soft[binOf(w)] += u; n += u; });
    const e = p(t, 10.6, 13, E.io);
    return soft.map((c, b) => lerp(c / (Math.max(n, 4) * 0.2), D220[b], e)); // con pochi dati le colonne non superano il riquadro
  }

  /* tre quadri di Exp: forma identica in scale diverse; ritmo λ e media 1/λ (scena «ritmo, non tempo») */
  const SMX = (x0, lam, x) => x0 + 65 * lam * x; // x in secondi → pixel, per un grafico di 260 px che parte da x0

  /* assenza di memoria: λ = 1, s = 1 */
  const MX = (x) => 70 + 120 * x, MB = 284, MY = (d) => MB - 150 * d;
  const ef1 = (x) => Math.exp(-x);
  const sliceD = (u1, u2) => { // la parte di curva a destra di s: si sposta in 0 (u1) e si riscala di e (u2)
    const k = 1 + (Math.E - 1) * u2, X = (x) => MX(x) - 120 * u1, Y = (d) => MB - 150 * d * k;
    return [areaD(ef1, 1, 4.5, X, Y, MB, 72), curve(ef1, 1, 4.5, X, Y, 72)];
  };

  PV.add('esponenziale', {
    sec: '3.20',
    short: 'Esponenziale',
    title: 'La legge esponenziale Exp(λ): attese, ritmo e assenza di memoria',
    alt: 'Animazione: le attese fra i clienti di uno sportello, raccolte per lunghezza, disegnano la densità λe^(−λx); con λ = 2 la media è 1/λ = 0,5 minuti, la mediana ln 2/λ ≈ 0,35 minuti, la probabilità di aspettare meno di mezzo minuto è 1 − e^(−1) ≈ 0,632; λ è un ritmo (un cliente ogni 2 minuti vuol dire λ = 1/2); infine, dopo aver aspettato s, la parte di curva a destra di s, riscalata e spostata, coincide con la curva originale: l’assenza di memoria.',
    dur: 63,
    poster: 31,
    chap: [[0, 'Le attese fra i clienti'], [18.5, 'Media, mediana, ripartizione'], [34.2, 'λ è un ritmo, non un tempo'], [44.6, 'Senza memoria']],
    caps: [
      [0, 'A uno sportello arrivano clienti a ritmo costante, in media 2 al minuto: ognuno è un segno sulla linea del tempo.'],
      [6.2, 'Misuro l’attesa fra due clienti e la metto in una colonna per lunghezza: tante attese brevi, poche lunghe.'],
      [12.6, 'Con molte attese il profilo si assesta: è la densità *f*(*x*) = *λ**e**^{−λx}*, con *λ* = 2.'],
      [18.5, 'La curva scende da *λ*. L’attesa media è 1/*λ* = 0,5 minuti (il fulcro); la mediana, ln 2/*λ* ≈ 0,35 minuti, sta più a sinistra.'],
      [25.8, 'Aspettare meno di mezzo minuto ha probabilità *F*(0,5) = 1 − *e*^{−1} ≈ 0,632. La varianza è 1/*λ*², quindi *σ* = 1/*λ*, come la media.'],
      [34.2, '*λ* è un ritmo, non un tempo. Con 2 clienti al minuto la media è 0,5 minuti; con un cliente ogni 2 minuti è *λ* = 1/2 e la media è 2 minuti.'],
      [44.6, 'Hai già aspettato *s* senza che accadesse nulla: la parte di curva a sinistra di *s* non conta più, resta quella a destra.'],
      [51.6, 'Condizionare a *X* > *s* vuol dire tenerla e riscalarla per riavere area 1; poi sposto l’origine in *s*.'],
      [57.6, 'La curva è identica all’originale: la coda riparte come nuova. Solo l’esponenziale lo fa.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 18, 'Il tempo fino al prossimo cliente', 'a uno sportello arrivano in media 2 clienti al minuto') + heading(t, 18.6, 33.8, 'Media, mediana e ripartizione', '*f*(*x*) = *λ**e**^{−λx}*,   *F*(*x*) = 1 − *e**^{−λx}*') + heading(t, 34.4, 44.2, '*λ* è un ritmo, non un tempo', 'stessa forma: cambia solo la scala dei tempi, 1/*λ*') + heading(t, 44.8, 63.4, 'Senza memoria', '*P*(*X* > *s* + *t* | *X* > *s*) = *P*(*X* > *t*)');

      /* capitoli 1 e 2: il grafico grande delle attese (λ = 2) */
      const big = p(t, 0.5, 1.4) * (1 - p(t, 33.8, 34.5));
      if (big > 0.004) {
        /* asse delle attese */
        o += g({ op: big }, ln(HX(0) - 10, HB, HX(2) + 14, HB, { stroke: C.soft, sw: 1.8 }) + [0, 0.5, 1, 1.5, 2].map((x) => ln(HX(x), HB, HX(x), HB + 6, { stroke: C.soft, sw: 1.8 }) + tx(HX(x), HB + 26, nc(x, x % 1 ? 1 : 0), { ff: SANS, size: 17, fill: C.soft })).join('') + tx(HX(2) + 14, HB + 26, 'min', { ff: SANS, size: 17, fill: C.soft, ta: 'start' }));
        /* capitolo 1: la linea del tempo, i segni delle richieste e le attese che cadono */
        const c1 = p(t, 0.6, 1.4) * (1 - p(t, 10.2, 11));
        if (c1 > 0.004) {
          o += ln(STX(0), 118, STX(5.4), 118, { stroke: C.soft, sw: 1.6, op: c1 }) + [0, 1, 2, 3, 4, 5].map((s) => ln(STX(s), 118, STX(s), 124, { stroke: C.soft, sw: 1.6, op: c1 }) + tx(STX(s), 144, s, { ff: SANS, size: 17, fill: C.soft, op: c1 })).join('') + tx(STX(5.4), 100, 'tempo (min)', { ff: SANS, size: 17, fill: C.soft, ta: 'end', op: c1 });
          REQ.forEach((r, k) => {
            const u = p(t, 1.3 + 0.32 * k, 1.8 + 0.32 * k, E.back);
            if (u > 0) o += circ(STX(r), 118, 6.5 * u, { fill: C.B, stroke: C.paper, sw: 1.6, op: c1 });
          });
          W10.forEach((w, k) => {
            const x0 = STX(REQ[k] - w), x1 = STX(REQ[k]), tk = 6.1 + 0.42 * k;
            const a = p(t, tk - 0.3, tk, E.out) * c1, dm = 1 - 0.7 * p(t, tk + 0.1, tk + 0.45);
            if (a > 0.004) o += rect(x0 + 5, 108, Math.max(1, x1 - x0 - 10), 8, { rx: 2, fill: C.A, fo: 0.6 * dm, op: a });
            const u = p(t, tk + 0.1, tk + 0.55, E.io);
            if (u > 0 && u < 1) {
              const hb = histH(TLAND(k) + 0.2)[binOf(w)], [x, y] = arc((x0 + x1) / 2, 114, HX(0.2 * (binOf(w) + 0.5)), HY(hb) - 4, u, 0);
              o += circ(x, y, 5.5, { fill: C.A, stroke: C.paper, sw: 1.4, op: c1 });
            }
          });
        }
        /* le colonne */
        const hb = p(t, 6, 6.6) * (1 - p(t, 17.4, 18.8));
        if (hb > 0.004) {
          const H = histH(t);
          o += H.map((h, b) => (h > 0.004 ? rect(HX(0.2 * b) + 1.5, HY(h), 0.2 * 260 - 3, HB - HY(h), { rx: 2, fill: C.A, fo: 0.5 * hb, stroke: C.A, so: 0.9 * hb, sw: 1.4 }) : '')).join('');
          const nn = t < 10.6 ? Math.min(10, Math.max(0, Math.floor((t - 6.2) / 0.42) + 1)) : Math.round(lerp(10, 220, p(t, 10.6, 13, E.io)));
          o += on(hb, tx(HX(2) + 4, 184, nn + (nn === 1 ? ' attesa' : ' attese'), { ff: SANS, size: 17, fill: C.soft, ta: 'end', op: hb }));
        }
        /* la densità, sopra le colonne; poi riempita */
        const cu = p(t, 13, 15.2, E.io);
        if (cu > 0.004) {
          const fl = p(t, 18.5, 19.5);
          o += on(fl, path(areaD(fe2, 0, 2, HX, HY, HB), { fill: C.A, fo: 0.22 * fl, op: big }));
          o += path(curve(fe2, 0, 2, HX, HY), { stroke: C.A, sw: 3.2, lc: 'round', op: big, ...draw(cu) });
          const fm = p(t, 14.8, 15.6) * (1 - p(t, 17.2, 18));
          o += on(fm, tx(HX(1.25), 214, '*f*(*x*) = *λ**e**^{−λx}*', { size: 26, fill: C.A, ta: 'start', op: fm * big }) + tx(HX(1.25) + 2, 246, '*F*(*x*) = 1 − *e**^{−λx}*', { size: 26, ta: 'start', op: p(t, 15.6, 16.4) * fm * big }));
        }
        /* capitolo 2: mediana, media, ripartizione, deviazione standard */
        const med = Math.LN2 / 2;
        const mm_ = p(t, 20.4, 21.2) * big, bm = p(t, 23, 23.8) * big, fa = p(t, 26.4, 27.2) * big, sg = p(t, 30, 30.8) * big;
        if (bm > 0.004) {
          o += g({ op: bm }, ln(HX(med), HB, HX(med), HY(fe2(med)), { stroke: C.B, sw: 2.6, da: '6 4' }));
          o += g({ op: bm }, ln(330, 168, 354, 168, { stroke: C.B, sw: 2.6, da: '6 4' }) + tx(364, 175, 'mediana: ln 2/*λ* ≈ 0,35 min', { size: 20, ta: 'start' }));
        }
        if (mm_ > 0.004) {
          const wob = Math.sin(14 * (t - 21.2)) * 4 * Math.exp(-3 * (t - 21.2)) * (t > 21.2 ? 1 : 0);
          o += g({ op: mm_, tf: `rotate(${f(wob)} ${HX(0.5)} ${HB + 32})` }, fulc(HX(0.5), HB + 32, 1));
          o += g({ op: mm_ }, path(`M342 193l-8 15h16z`, { fill: C.hi, fo: 0.95, stroke: C.ink, sw: 1.2 }) + tx(364, 206, 'media: 1/*λ* = 0,5 min', { size: 20, ta: 'start' }));
        }
        if (fa > 0.004) {
          o += g({ op: fa }, path(areaD(fe2, 0, 0.5, HX, HY, HB), { fill: OK, fo: 0.4 }) + ln(HX(0.5), HB, HX(0.5), HY(fe2(0.5)), { stroke: OK, sw: 2.2, da: '5 4' }));
          o += g({ op: fa }, rect(330, 224, 22, 14, { rx: 3, fill: OK, fo: 0.5 }) + tx(364, 237, '*F*(0,5) = 1 − *e*^{−1} ≈ 0,632', { size: 20, ta: 'start' }));
        }
        if (sg > 0.004) {
          const u1 = p(t, 30, 31.2, E.io), u2 = p(t, 31.4, 32.6, E.io);
          o += arrow(HX(0), 130, HX(0.5) - 3, 130, u1, C.hi, sg, 3) + arrow(HX(0.5), 130, HX(1) - 3, 130, u2, C.C, sg, 3);
          o += tx((HX(0) + HX(0.5)) / 2, 118, '1/*λ*', { size: 20, op: sg * u1 }) + tx((HX(0.5) + HX(1)) / 2, 118, '1/*λ*', { size: 20, op: sg * u2 });
          o += g({ op: sg }, ln(330, 262, 354, 262, { stroke: C.C, sw: 3 }) + tx(364, 269, 'Var = 1/*λ*²:  *σ* = 1/*λ*', { size: 20, ta: 'start' }));
        }
      }

      /* capitolo 3: due ritmi, la stessa forma */
      const c3 = vis(t, 34.4, 44.2, 0.7, 0.6);
      if (c3 > 0.004) {
        [[40, 2, 'ritmo *λ* = 2 al minuto', '2 clienti al minuto', [0, 1, 2], 'media 1/*λ* = 0,5 min', 35], [340, 0.5, 'ritmo *λ* = 1/2 al minuto', 'un cliente ogni 2 minuti', [0, 2, 4, 6, 8], 'media 1/*λ* = 2 min', 38.6]].forEach(([x0, lam, tit, sub, ticks, ml, t0]) => {
          const a = p(t, t0, t0 + 0.8) * c3, X = (x) => SMX(x0, lam, x), Y = (x) => 262 - 110 * Math.exp(-lam * x), xe = 4 / lam;
          const fn = (x) => Math.exp(-lam * x);
          o += on(a, g({ op: a }, tx(x0 + 130, 110, tit, { size: 20 }) + tx(x0 + 130, 134, sub, { ff: SANS, size: 17, fill: C.soft }) + ln(x0 - 6, 262, x0 + 266, 262, { stroke: C.soft, sw: 1.8 }) + ticks.map((x) => ln(X(x), 262, X(x), 268, { stroke: C.soft, sw: 1.8 }) + tx(X(x), 286, x, { ff: SANS, size: 17, fill: C.soft })).join('') + path(areaD((x) => fn(x), 0, xe, X, (d) => 262 - 110 * d, 262, 70), { fill: C.A, fo: 0.2 }) + path(curve(fn, 0, xe, X, (d) => 262 - 110 * d, 70), { stroke: C.A, sw: 3, lc: 'round' })));
          const m = p(t, t0 + 1.2, t0 + 2) * c3;
          o += on(m, g({ op: m }, fulc(x0 + 65, 292, 1) + tx(x0 + 130, 336, ml, { size: 20, fill: C.ink }) + ln(x0 + 65, 262, x0 + 65, 262 - 110 * Math.exp(-0.5), { stroke: C.hi, sw: 2.2, da: '5 4' })));
        });
      }

      /* capitolo 4: senza memoria (λ = 1, s = 1) */
      const c4 = vis(t, 44.8, 63.4, 0.7, 0.01);
      if (c4 > 0.004) {
        o += g({ op: c4 }, ln(MX(0) - 10, MB, MX(4.5) + 10, MB, { stroke: C.soft, sw: 1.8 }) + [0, 2, 3, 4].map((x) => ln(MX(x), MB, MX(x), MB + 6, { stroke: C.soft, sw: 1.8 }) + tx(MX(x), MB + 26, x, { ff: SANS, size: 17, fill: C.soft })).join('') + tx(MX(1), MB + 26, '*s*', { size: 22, fill: C.B }) + ln(MX(1), MB, MX(1), MB + 6, { stroke: C.B, sw: 1.8 }));
        const cf = p(t, 45.4, 46.6);
        o += on(cf, path(areaD(ef1, 0, 4.5, MX, MY, MB, 90), { fill: C.A, fo: 0.2 * cf, op: c4 }) + path(curve(ef1, 0, 4.5, MX, MY, 90), { stroke: C.A, sw: 3, lc: 'round', op: c4, ...draw(cf) }));
        const ps = p(t, 47.2, 48.2), u2 = p(t, 52, 54.4, E.io), u1 = p(t, 54.8, 57, E.io);
        /* la parte passata: si spegne mentre la fetta si sposta */
        const past = ps * (1 - u1) * c4;
        o += on(past, path(areaD(ef1, 0, 1, MX, MY, MB, 40), { fill: C.soft, fo: 0.35 * past }) + ln(MX(1), MB, MX(1), MY(ef1(1)) - 14, { stroke: C.B, sw: 2.2, da: '6 4', op: past }) + tx(MX(0.5), MB - 14, 'già passato', { ff: SANS, size: 17, fill: C.soft, op: past }));
        /* la fetta a destra di s */
        const sl = p(t, 49, 50, E.out) * c4;
        if (sl > 0.004) {
          const [ad, cd] = sliceD(u1, u2);
          o += path(ad, { fill: C.B, fo: 0.4 * sl }) + path(cd, { stroke: C.B, sw: 3, lc: 'round', op: sl });
          const l1 = vis(t, 49.6, 52.4, 0.5, 0.4) * c4, l3 = vis(t, 54.2, 57.4, 0.5, 0.4) * c4, l2 = p(t, 57.4, 58.2) * c4;
          o += on(l1, tx(MX(2.6), 196, 'resta questa parte:', { size: 22, fill: C.B, ta: 'start', op: l1 }) + tx(MX(2.6), 224, 'area *e**^{−λs}*', { size: 22, fill: C.B, ta: 'start', op: l1 }));
          o += on(l3, tx(MX(2.6), 196, 'riscalata: area 1,', { size: 22, fill: C.B, ta: 'start', op: l3 }) + tx(MX(2.6), 224, 'poi spostata in 0', { size: 22, fill: C.B, ta: 'start', op: l3 }));
          o += on(l2, tx(MX(2.6), 196, 'coincide con la', { size: 22, fill: OK, ta: 'start', op: l2 }) + tx(MX(2.6), 224, 'curva di partenza', { size: 22, fill: OK, ta: 'start', op: l2 }) + check(MX(2.6) - 22, 190, 16, p(t, 57.8, 58.6, E.lin), { op: l2 }));
        }
        const pl = p(t, 59.4, 60.2) * c4;
        o += on(pl, pills(334, [{ s: 'dopo aver aspettato *s*, la coda riparte identica', op: pl }]));
      }
      return o;
    },
  });

  /* ======================================================================
     3.8 · Gamma Γ(α, λ): la somma di α attese esponenziali
     ====================================================================== */
  const GX1 = (m) => 70 + 130 * m, GBS = 300, GHY = (d) => GBS - 200 * d; // minuti → pixel; base dell'istogramma; densità → pixel
  const EXPT = [[0.55, 0.2, 0.45], [0.8, 0.95, 0.35], [0.25, 0.15, 0.5], [0.4, 0.9, 0.4], [0.1, 0.85, 0.5], [0.3, 0.05, 0.3], [1.3, 0.2, 1.1]]; // sette esperimenti: tre attese ciascuno
  const EST = [1.4, 8, 8.8, 9.6, 10.4, 11.2, 12]; // quando comincia ciascun esperimento
  const ELAND = EST.map((t0, k) => (k ? t0 + 0.8 : 6.5)); // quando il suo T cade nella colonna
  const gcdf3 = (x) => 1 - Math.exp(-2 * x) * (1 + 2 * x + 2 * x * x); // ripartizione di Γ(3, 2)
  const T120 = Array.from({ length: 120 }, (_, j) => { // 120 valori di T, uno per fascia di probabilità
    const u = (j + rnd(j + 700)) / 120;
    let a = 0, b = 12;
    for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (gcdf3(m) < u) a = m; else b = m; }
    return (a + b) / 2;
  });
  const G120 = new Array(16).fill(0);
  T120.forEach((v) => { if (v < 4) G120[Math.floor(v / 0.25)] += 1 / (120 * 0.25); });
  const Tsum = (k) => EXPT[k][0] + EXPT[k][1] + EXPT[k][2];
  const bin4 = (v) => Math.min(15, Math.floor(v / 0.25));

  function histG(t) { // altezze (densità) delle 16 colonne da 0,25 minuti
    const soft = new Array(16).fill(0);
    let n = 0;
    EXPT.forEach((_, k) => { const u = p(t, ELAND[k] - 0.1, ELAND[k] + 0.12, E.lin); soft[bin4(Tsum(k))] += u; n += u; });
    const e = p(t, 13.2, 15.6, E.io);
    return soft.map((c, b) => lerp(c / (Math.max(n, 16) * 0.25), G120[b], e));
  }

  /* un esperimento: tre gettoni in fila, i tre arrivi numerati, la T */
  function gRow(t, k, ts, op, slow) {
    const w = EXPT[k], cols = [C.A, C.B, C.C];
    let x = 0, o = '';
    for (let j = 0; j < 3; j++) {
      const u = p(t, ts[j], ts[j] + (slow ? 0.7 : 0.3), E.out);
      if (u > 0) {
        o += rect(GX1(x), 101, (GX1(x + w[j]) - GX1(x)) * u, 22, { rx: 3, fill: cols[j], fo: 0.55, stroke: cols[j], sw: 1.8, op });
        x += w[j];
      } else break;
      if (u > 0.95) o += ln(GX1(x), 123, GX1(x), 127, { stroke: C.soft, sw: 1.4, op }) + circ(GX1(x), 137, 10, { fill: C.paper, stroke: cols[j], sw: 2, op }) + tx(GX1(x), 143, j + 1, { ff: SANS, size: 17, op });
    }
    return o;
  }
  const pois4 = (k) => { let f1 = 1; for (let i = 2; i <= k; i++) f1 *= i; return Math.exp(-4) * 4 ** k / f1; };

  const GX2 = (x) => 60 + 95 * x, GB2 = 290, GY2 = (d) => GB2 - 60 * d; // la famiglia Gamma: minuti → pixel
  const GAL = [[1, C.A, 17.8], [2, C.B, 19.6], [3, C.C, 21.4], [5, C.ink, 23.2]]; // α, colore, istante in cui si disegna

  PV.add('gammac', {
    sec: '3.26',
    short: 'Gamma',
    title: 'La legge Gamma Γ(α, λ): la somma di α attese esponenziali',
    alt: 'Animazione: il tempo fino al terzo cliente di uno sportello è la somma di tre attese esponenziali messe in fila; ripetendo l’esperimento i valori si accumulano e disegnano la densità Γ(3, 2); poi la famiglia Gamma al variare di α (α = 1 è l’esponenziale), con media α/λ e varianza α/λ²; il tempo T fino al terzo cliente ha P(T ≤ 2) = 1 − 13e^(−4) ≈ 0,762, uguale a P(Poisson(4) ≥ 3).',
    dur: 52.8,
    poster: 16.6,
    chap: [[0, 'Tre attese in fila'], [18.4, 'La famiglia Gamma'], [37.4, 'Gamma e Poisson']],
    caps: [
      [0, 'A uno sportello arrivano in media 2 clienti al minuto. Ogni attesa fra un cliente e il successivo è esponenziale.'],
      [6.4, 'Il tempo *T* fino al terzo cliente è la somma di tre attese esponenziali indipendenti, messe in fila.'],
      [12.4, 'Ripeto l’esperimento: i valori di *T* si accumulano in colonne e disegnano la densità Gamma, qui Γ(3, 2).'],
      [18.4, 'Con α attese in fila la forma cambia: α = 1 è l’esponenziale, poi la gobba si sposta a destra e la curva si allarga.'],
      [25.4, 'La densità è *λ*^α *x*^{α−1} *e*^{−λx} / Γ(α): Γ(α) fa tornare l’area a 1 e, per α intero, vale (α − 1)!.'],
      [31, 'Media α/*λ* e varianza α/*λ*² crescono con α, come per una somma di α attese.'],
      [37.4, 'I clienti arrivano come un processo di Poisson, 2 al minuto: il terzo arriva entro 2 minuti se in 2 minuti ne arrivano almeno 3.'],
      [45, 'Il tempo *T* è Γ(3, 2): media 1,5 minuti, varianza 3/4. E *P*(*T* ≤ 2) = 1 − 13*e*^{−4} ≈ 0,762, senza integrare.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 18.2, 'Tre attese in fila', 'il tempo fino al terzo cliente, con 2 clienti al minuto') + heading(t, 18.8, 37, 'La famiglia Gamma', '*λ* = 2 clienti al minuto, α clienti da aspettare') + heading(t, 37.6, 52, 'Gamma e Poisson', 'il terzo cliente entro 2 minuti ⇔ almeno 3 clienti in 2 minuti');

      /* capitolo 1: gettoni in fila e istogramma dei T */
      const c1 = 1 - p(t, 18.2, 19);
      if (c1 > 0.004) {
        const ax = p(t, 0.5, 1.4) * c1;
        o += g({ op: ax }, ln(GX1(0) - 10, GBS, GX1(4) + 14, GBS, { stroke: C.soft, sw: 1.8 }) + [0, 1, 2, 3, 4].map((m) => ln(GX1(m), GBS, GX1(m), GBS + 6, { stroke: C.soft, sw: 1.8 }) + tx(GX1(m), GBS + 26, m, { ff: SANS, size: 17, fill: C.soft })).join('') + tx(GX1(4) + 18, GBS + 26, 'min', { ff: SANS, size: 17, fill: C.soft, ta: 'start' }));
        /* gli esperimenti: il primo lento, gli altri veloci */
        for (let k = 0; k < 7; k++) {
          const ts = k ? [EST[k], EST[k] + 0.12, EST[k] + 0.24] : [1.4, 2.6, 3.8];
          const last = k < 6 ? EST[k + 1] : 13.4;
          const op = vis(t, ts[0] - 0.1, last, 0.2, 0.25) * c1;
          if (op < 0.004) continue;
          o += gRow(t, k, ts, op, k === 0);
          const T = Tsum(k), bt = k ? ts[2] + 0.3 : 5.2, bu = p(t, bt, bt + 0.5) * op;
          o += on(bu, brace(GX1(0), GX1(T), 156, C.soft, bu, 1) + tx(GX1(T / 2), 190, '*T* = ' + nc(T, 2) + ' min', { size: 22, op: bu }));
          const du = p(t, ELAND[k] - 0.45, ELAND[k], E.acc);
          if (du > 0 && du < 1) {
            const hb = histG(ELAND[k] + 0.15)[bin4(T)];
            o += circ(GX1(T), lerp(150, GHY(hb) - 5, du), 5.5, { fill: C.C, stroke: C.paper, sw: 1.4, op: c1 });
          }
        }
        /* le colonne dei T */
        const hb = p(t, 6.4, 7) * c1, H = histG(t);
        if (hb > 0.004) {
          o += H.map((h, b) => (h > 0.004 ? rect(GX1(0.25 * b) + 1.5, GHY(h), 0.25 * 130 - 3, GBS - GHY(h), { rx: 2, fill: C.A, fo: 0.5 * hb, stroke: C.A, so: 0.9 * hb, sw: 1.4 }) : '')).join('');
          const nn = t < 13.2 ? EXPT.filter((_, k) => t >= ELAND[k]).length : Math.round(lerp(7, 120, p(t, 13.2, 15.6, E.io)));
          o += tx(GX1(4) + 14, 176, nn + (nn === 1 ? ' prova' : ' prove'), { ff: SANS, size: 17, fill: C.soft, ta: 'end', op: hb });
        }
        /* la densità Γ(3, 2) */
        const cu = p(t, 15.6, 17.4, E.io);
        if (cu > 0.004) {
          o += path(curve((x) => gpdf(x, 3, 2), 0, 4, GX1, GHY, 100), { stroke: C.A, sw: 3.2, lc: 'round', op: c1, ...draw(cu) });
          const lab = p(t, 16.8, 17.6) * c1;
          o += on(lab, tx(GX1(2.45), 202, 'Γ(3, 2)', { size: 28, fill: C.A, ta: 'start', op: lab }) + tx(GX1(2.45), 228, 'somma di tre esponenziali', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: lab }));
        }
      }

      /* capitolo 2: la famiglia Gamma (λ = 2) */
      const c2 = vis(t, 18.6, 37.2, 0.6, 0.6);
      if (c2 > 0.004) {
        o += g({ op: c2 }, ln(GX2(0) - 10, GB2, GX2(5.5) + 8, GB2, { stroke: C.soft, sw: 1.8 }) + [0, 1, 2, 3, 4, 5].map((m) => ln(GX2(m), GB2, GX2(m), GB2 + 6, { stroke: C.soft, sw: 1.8 }) + tx(GX2(m), GB2 + 26, m, { ff: SANS, size: 17, fill: C.soft })).join('') + tx(GX2(5.5) + 14, GB2 + 26, 'min', { ff: SANS, size: 17, fill: C.soft, ta: 'start' }));
        const a3 = p(t, 28, 29, E.out) * c2 * (1 - p(t, 30.6, 31.4));
        o += on(a3, path(areaD((x) => gpdf(Math.max(x, 1e-9), 3, 2), 0, 5.5, GX2, GY2, GB2, 110), { fill: C.C, fo: 0.2 * a3 }) + tx(300, 246, 'area = 1', { size: 22, fill: C.C, ta: 'start', op: a3 }));
        GAL.forEach(([a, col, t0]) => {
          const u = p(t, t0, t0 + 1.4, E.io);
          if (u > 0.004) o += path(curve((x) => gpdf(Math.max(x, 1e-9), a, 2), 0, 5.5, GX2, GY2, 110), { stroke: col, sw: 3, lc: 'round', op: c2, ...draw(u) });
        });
        /* legenda e poi tabella media/varianza */
        const hdr = p(t, 31.4, 32.2) * c2;
        GAL.forEach(([a, col, t0], i) => {
          const u = p(t, t0 + 0.6, t0 + 1.2) * c2, y = 190 + 26 * i;
          if (u > 0.004) {
            o += ln(408, y - 6, 428, y - 6, { stroke: col, sw: 3.4, op: u }) + tx(438, y, 'α = ' + a, { size: 20, ta: 'start', op: u });
            if (a === 1) o += tx(488, y, '(esponenziale)', { size: 20, ta: 'start', op: u * (1 - hdr) });
          }
        });
        if (hdr > 0.004) {
          o += tx(520, 162, 'media', { ff: SANS, size: 17, fill: C.soft, op: hdr }) + tx(588, 162, 'varianza', { ff: SANS, size: 17, fill: C.soft, op: hdr });
          GAL.forEach(([a], i) => {
            const y = 190 + 26 * i, u = p(t, 31.8 + 0.4 * i, 32.4 + 0.4 * i) * c2;
            o += on(u, tx(520, y, nc(a / 2, a % 2 ? 2 : 1), { size: 20, op: u }) + tx(588, y, nc(a / 4, 2), { size: 20, op: u }));
          });
        }
        /* la formula e le costanti Γ(α) */
        const fm = vis(t, 25.4, 31, 0.6, 0.6) * c2;
        o += on(fm, tx(282, 124, '*f*(*x*) = *λ*^α *x*^{α−1} ' + sp('e', '−λx') + ' / Γ(α)', { size: 26, op: fm }));
        const gm = p(t, 28.4, 29.4) * c2 * (1 - p(t, 30.6, 31.2));
        o += on(gm, tx(282, 158, 'Γ(1) = 1,  Γ(2) = 1,  Γ(3) = 2,  Γ(4) = 6', { size: 22, fill: C.C, op: gm }));
      }

      /* capitolo 3: il terzo cliente entro 2 minuti ⇔ almeno 3 clienti in 2 minuti */
      const c3 = vis(t, 37.6, 52.2, 0.6, 0.6);
      if (c3 > 0.004) {
        const SX = (m) => 60 + 130 * m, SY = 138;
        o += g({ op: c3 }, ln(SX(0), SY, SX(4), SY, { stroke: C.soft, sw: 1.8 }) + [0, 1, 2, 3, 4].map((m) => ln(SX(m), SY, SX(m), SY + 6, { stroke: C.soft, sw: 1.8 }) + tx(SX(m), SY + 28, m, { ff: SANS, size: 17, fill: C.soft })).join('') + tx(SX(4) + 14, SY + 28, 'min', { ff: SANS, size: 17, fill: C.soft, ta: 'start' }));
        [0.35, 0.9, 1.6, 2.3, 3.1].forEach((m, i) => {
          const u = p(t, 38.2 + 0.6 * i, 38.8 + 0.6 * i, E.back);
          if (u > 0) o += circ(SX(m), SY, 11 * u, { fill: C.B, stroke: C.paper, sw: 1.6, op: c3 }) + on(u > 0.9, tx(SX(m), SY + 6, i + 1, { ff: SANS, size: 17, fill: C.paper, op: c3 }));
        });
        const cut = p(t, 41.4, 42.2) * c3;
        o += on(cut, ln(SX(2), SY - 22, SX(2), SY + 10, { stroke: C.hi, sw: 3, op: cut }) + brace(SX(0), SX(2), SY - 24, C.hi, cut, -1) + tx(SX(1), SY - 38, '3 arrivi in 2 minuti ⇒ *T* ≤ 2', { size: 20, op: cut }));
        /* Γ(3, 2) a sinistra, Poisson(4) a destra */
        const PB = 290, GP = (m) => 50 + 60 * m, GPY = (d) => PB - 140 * d;
        const lg = p(t, 45, 46) * c3;
        o += on(lg, g({ op: lg }, ln(GP(0) - 8, PB, GP(4) + 8, PB, { stroke: C.soft, sw: 1.8 }) + [0, 1, 2, 3, 4].map((m) => tx(GP(m), PB + 22, m, { ff: SANS, size: 17, fill: C.soft })).join('') + path(areaD((x) => gpdf(Math.max(x, 1e-9), 3, 2), 0, 2, GP, GPY, PB, 60), { fill: C.A, fo: 0.35 }) + path(curve((x) => gpdf(Math.max(x, 1e-9), 3, 2), 0, 4, GP, GPY, 90), { stroke: C.A, sw: 3, lc: 'round' }) + tx(GP(2), 200, 'Γ(3, 2): *P*(*T* ≤ 2) = 0,762', { size: 20, fill: C.A })));
        const mm_ = p(t, 46.6, 47.4) * c3;
        o += on(mm_, ln(GP(1.5), PB, GP(1.5), GPY(gpdf(1.5, 3, 2)), { stroke: C.hi, sw: 2.4, da: '5 4', op: mm_ }));
        const pp = p(t, 48.2, 49.2) * c3;
        if (pp > 0.004) {
          const PX = (k) => 358 + 26 * k;
          o += g({ op: pp }, ln(PX(0) - 12, PB, PX(9) + 12, PB, { stroke: C.soft, sw: 1.8 }) + [0, 3, 6, 9].map((k) => tx(PX(k), PB + 22, k, { ff: SANS, size: 17, fill: C.soft })).join('') + [...Array(10).keys()].map((k) => rect(PX(k) - 10, PB - 400 * pois4(k), 20, 400 * pois4(k), { rx: 2, fill: k >= 3 ? C.A : C.soft, fo: k >= 3 ? 0.55 : 0.3, stroke: k >= 3 ? C.A : C.soft, sw: 1.4 })).join('') + tx(PX(4.5), 200, 'Poisson(4): *P*(*N* ≥ 3) = 0,762', { size: 20, fill: C.A }));
          const eq = p(t, 49.2, 50) * c3;
          o += on(eq, tx(324, 250, '=', { size: 36, fill: OK, op: eq }));
        }
        const fl = p(t, 49.8, 50.8) * c3;
        o += on(fl, tx(320, 342, '*P*(*T* ≤ 2) = 1 − ' + sp('e', '−4') + '(1 + 4 + 8) = 1 − 13' + sp('e', '−4') + ' ≈ 0,762', { size: 22, op: fl }));
      }
      return o;
    },
  });

  /* ======================================================================
     3.8 · Normale N(μ, σ²): la campana, i parametri, 68-95-99,7, somme e medie
     ====================================================================== */
  /* valore che passa per i punti [[t, v], …] con ease in-out fra l'uno e l'altro */
  const kf = (t, pts) => {
    if (t <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], E.io(seg(t, pts[i - 1][0], pts[i][0])));
    return pts[pts.length - 1][1];
  };
  const clampOp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const sn = (v, d = 1) => (v < -0.0005 ? '−' : '') + nc(Math.abs(v), d); // numero con segno meno tipografico e virgola
  const N1X = (z) => 300 + 50 * z, N1Q = (q) => 104 - 13 * q, N1B = 280, N1Y = (d) => N1B - 290 * d; // capitolo 1: z in unità di σ
  const N2X = (x) => 320 + 38 * x, N2B = 288, N2Y = (d) => N2B - 190 * d; // capitolo 2: μ e σ che cambiano
  const N3X = (z) => 320 + 75 * z, N3B = 262, N3Y = (d) => N3B - 260 * d; // capitolo 3: 68-95-99,7
  const N4X = (x) => 48 + 16 * (x + 12), N4B = 262, N4Y = (d) => N4B - 700 * d; // somma di due normali
  const N5X = (x) => 320 + 600 * x, N5B = 262, N5Y = (d) => N5B - 40 * d; // media di n misure (mm)

  PV.add('normale', {
    sec: '3.28',
    short: 'Normale',
    title: 'La legge normale N(μ, σ²): la campana e i suoi parametri',
    alt: 'Animazione: la densità normale si costruisce da una parabola rivolta in basso (l’esponente), che vale 0 nella media e rende massima la densità; la campana è simmetrica con i flessi in μ ± σ; μ la sposta, σ la allarga o la stringe e l’area resta 1.',
    dur: 35,
    poster: 17.6,
    chap: [[0, 'Smontiamo la formula'], [19.4, 'μ sposta, σ allarga']],
    caps: [
      [0, 'Smontiamo la formula. L’esponente −(*x* − *μ*)²/(2*σ*²) è una parabola rivolta in basso, che vale 0 in *x* = *μ*.'],
      [6.4, 'Dove l’esponente è 0 la densità è massima; più ci si allontana da *μ*, più l’esponente scende e la curva si abbassa: ecco la campana.'],
      [13.9, 'I flessi stanno in *μ* − *σ* e *μ* + *σ*. La costante 1/(*σ*√(2π)) serve solo a far tornare l’area a 1.'],
      [19.4, '*μ* sposta la campana senza cambiarne la forma; *σ* la allarga o la stringe, ma l’area resta sempre 1.'],
      [25.4, 'Con *σ* piccolo la campana è alta e stretta, con *σ* grande bassa e larga. Attenzione: in N(*μ*, *σ*²) il secondo numero è la varianza.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 19.2, 'La campana, smontata', '*f*(*x*) = 1/(*σ*√(2π)) · ' + sp('e', '−(x − μ)²/(2σ²)')) + heading(t, 19.8, 34.4, '*μ* sposta, *σ* allarga', 'la forma resta quella, l’area resta 1');

      /* capitolo 1: la parabola dell'esponente e la campana */
      const c1 = vis(t, 0.3, 19.4, 0.6, 0.6);
      if (c1 > 0.004) {
        const ax = p(t, 0.5, 1.4) * c1;
        o += g({ op: ax }, ln(N1X(-3.5), N1B, N1X(3.5), N1B, { stroke: C.soft, sw: 1.8 }) + [-2, -1, 0, 1, 2].map((z) => ln(N1X(z), N1B, N1X(z), N1B + 6, { stroke: C.soft, sw: 1.8 }) + tx(N1X(z), N1B + 26, z === 0 ? '*μ*' : '*μ*' + (z < 0 ? '−' : '+') + (Math.abs(z) === 1 ? '' : '2') + '*σ*', { ff: SANS, size: 17, fill: C.soft })).join(''));
        const pq = p(t, 1.4, 3.4, E.io);
        o += on(pq, ln(N1X(-3.4), N1Q(0), N1X(3.4), N1Q(0), { stroke: C.soft, sw: 1.2, da: '3 4', op: 0.7 * c1 }) + tx(N1X(-3.4) - 8, N1Q(0) + 6, '0', { ff: SANS, size: 17, fill: C.soft, ta: 'end', op: c1 }) + path(curve((z) => -z * z / 2, -3.3, 3.3, N1X, N1Q, 80), { stroke: C.B, sw: 3, lc: 'round', op: c1, ...draw(pq) }));
        const lq = p(t, 2.6, 3.4) * c1;
        o += on(lq, tx(560, 116, 'esponente', { size: 22, fill: C.B, op: lq }) + fr(560, 164, '−(*x* − *μ*)²', '2*σ*²', { size: 20, fill: C.B, op: lq }));
        /* i cursori scorrono dal centro verso i lati, e la campana si traccia */
        const cur = kf(t, [[4.4, 0], [11, 3]]), cu = p(t, 3.6, 4.2) * c1 * (1 - p(t, 11.2, 12));
        if (cu > 0.004) {
          for (const sgn of [1, -1]) {
            const z = sgn * cur;
            o += ln(N1X(z), N1Q(-z * z / 2), N1X(z), N1Y(npdf(z)), { stroke: C.hi, sw: 1.8, da: '4 4', op: cu * (sgn > 0 ? 1 : 0.6) }) + circ(N1X(z), N1Q(-z * z / 2), 5.5, { fill: C.B, stroke: C.paper, sw: 1.4, op: cu }) + circ(N1X(z), N1Y(npdf(z)), 5.5, { fill: C.A, stroke: C.paper, sw: 1.4, op: cu });
          }
        }
        const tr = p(t, 3.6, 4.2) * c1;
        if (tr > 0.004 && t < 11.2) {
          const n = Math.max(2, Math.round(cur * 30));
          o += path(curve(npdf, 0, cur, N1X, N1Y, n), { stroke: C.A, sw: 3.2, lc: 'round', op: c1 }) + path(curve(npdf, -cur, 0, N1X, N1Y, n), { stroke: C.A, sw: 3.2, lc: 'round', op: c1 });
        }
        const ful = p(t, 11, 11.8) * c1;
        if (ful > 0.004) {
          o += path(curve(npdf, -3.4, 3.4, N1X, N1Y, 100), { stroke: C.A, sw: 3.2, lc: 'round', op: c1 });
          const ar = p(t, 14.6, 15.8) * c1;
          o += on(ar, path(areaD(npdf, -3.4, 3.4, N1X, N1Y, N1B, 100), { fill: C.A, fo: 0.22 * ar }) + tx(N1X(0), N1B - 30, 'area = 1', { size: 22, op: ar }));
        }
        const ld = p(t, 4.6, 5.4) * c1;
        o += on(ld, tx(560, 218, 'densità', { size: 22, fill: C.A, op: ld }) + tx(560, 246, sp('e', 'esponente'), { size: 22, op: ld }));
        const kc = p(t, 15, 15.8) * c1;
        o += on(kc, tx(560, 280, '× 1/(*σ*√(2π))', { size: 20, fill: C.A, op: kc }));
        /* i flessi in μ ± σ */
        const fx = p(t, 11.6, 12.4, E.back) * c1;
        if (fx > 0.004) {
          for (const sgn of [1, -1]) o += circ(N1X(sgn), N1Y(npdf(1)), 6.5 * fx, { fill: C.hi, stroke: C.ink, sw: 1.6, op: c1 });
          const lf = p(t, 12.2, 13) * c1;
          o += on(lf, tx(N1X(1) + 16, N1Y(npdf(1)) - 22, 'flessi', { size: 22, ta: 'start', op: lf }) + tx(N1X(-1) - 16, N1Y(npdf(1)) - 22, 'flessi', { size: 22, ta: 'end', op: lf }));
        }
        /* parole chiave sotto la campana mentre scorre */
        const w1 = vis(t, 4.6, 8.6, 0.4, 0.4) * c1, w2 = vis(t, 8.8, 12.4, 0.4, 0.4) * c1;
        o += on(w1, pills(336, [{ s: 'esponente 0 in *μ*: la densità è massima', op: w1 }]));
        o += on(w2, pills(336, [{ s: 'esponente sempre più negativo: la densità scende', op: w2 }]));
      }

      /* capitolo 2: μ sposta, σ allarga */
      const c2 = vis(t, 19.8, 34.6, 0.6, 0.4);
      if (c2 > 0.004) {
        const mu = kf(t, [[20.2, 0], [21, 0], [22.4, 3], [23.2, 3], [24.8, -3], [25.6, -3], [26.8, 0]]);
        const sg = kf(t, [[26.8, 1], [27.4, 1], [28.8, 0.5], [29.4, 0.5], [30.8, 2], [31.4, 2]]);
        o += g({ op: c2 }, ln(N2X(-8.4), N2B, N2X(8.4), N2B, { stroke: C.soft, sw: 1.8 }) + [-6, -3, 0, 3, 6].map((x) => ln(N2X(x), N2B, N2X(x), N2B + 6, { stroke: C.soft, sw: 1.8 }) + tx(N2X(x), N2B + 26, sn(x, 0), { ff: SANS, size: 17, fill: C.soft })).join(''));
        const fn = (x) => npdf(x, mu, sg);
        o += path(areaD(fn, -8.4, 8.4, N2X, N2Y, N2B, 130), { fill: C.A, fo: 0.2, op: c2 }) + path(curve(fn, -8.4, 8.4, N2X, N2Y, 130), { stroke: C.A, sw: 3.2, lc: 'round', op: c2 });
        o += ln(N2X(mu), 124, N2X(mu), N2B, { stroke: C.soft, sw: 1.4, da: '4 4', op: c2 }) + tx(N2X(mu), 114, '*μ* = ' + sn(mu, Math.abs(mu - Math.round(mu)) < 0.05 ? 0 : 1), { size: 22, op: c2 });
        o += ln(N2X(mu), N2B, N2X(mu + sg), N2B, { stroke: C.B, sw: 5, lc: 'round', op: c2 }) + tx(N2X(mu + sg / 2), N2B - 10, '*σ*', { size: 22, fill: C.B, op: c2 });
        for (const sgn of [1, -1]) o += circ(N2X(mu + sgn * sg), N2Y(npdf(sgn * sg, 0, sg)), 6, { fill: C.hi, stroke: C.ink, sw: 1.5, op: c2 });
        const sr = p(t, 26.4, 27.2) * c2;
        o += on(sr, tx(40, 114, '*σ* = ' + sn(sg, Math.abs(sg * 2 - Math.round(sg * 2)) < 0.03 ? 1 : 2), { size: 22, fill: C.B, ta: 'start', op: sr }) + tx(40, 142, 'altezza ' + nc(1 / (sg * SQ2PI), 2), { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: sr }));
        o += tx(600, 114, 'area = 1', { size: 22, fill: C.A, ta: 'end', op: c2 });
        const pv = p(t, 30.6, 31.4) * c2;
        o += on(pv, pills(338, [{ s: 'N(*μ*, *σ*²): il secondo parametro è la varianza', op: pv }]));
      }
      return o;
    },
  });

  /* ======================================================================
     3.8 · Standardizzazione Z = (X − μ)/σ, la tavola di Φ, la procedura e l'esercizio 3.C
     ====================================================================== */
  const S1X = (h) => 320 + 10 * (h - 48), S1B = 240, S1Y = (d) => S1B - 1800 * d; // capitolo 1: ore → pixel
  const S2X = (z) => 320 + 70 * z, S2B = 262, S2Y = (d) => S2B - 260 * d; // capitolo 2: normale standard
  const S3X = (h) => 455 + 9 * (h - 48), S3B = 262, S3Y = (d) => S3B - 1800 * d; // capitolo 3: consegne a destra
  const S4X = (h) => 320 + 12 * (h - 48), S4B = 216; // capitolo 4: due corrieri
  const fz = (v) => (v < 0 ? '−' : '') + Math.abs(v); // intero con segno meno tipografico
  const tail = (X, Y, B, m, sdv, a, b, n = 50) => areaD((x) => npdf(x, m, sdv), a, b, X, Y, B, n);
  /* i passi della procedura (colonna a sinistra del capitolo 3): [numero, righe, istante in cui compare] */
  const PASSI = [
    [1, ['*P*(*T* > 60)', '= 1 − *P*(*T* ≤ 60)'], 32.4],
    [2, ['*z* = (60 − 48)/6 = 2'], 35.2],
    [3, ['Φ(2) = 0,9772'], 37.8],
    [4, ['1 − 0,9772 = 0,0228'], 40],
  ];

  PV.add('standard', {
    sec: '3.30',
    short: 'Standardizzazione',
    title: 'Standardizzare: una sola campana, la tavola di Φ e l’esercizio della consegna garantita',
    alt: 'Animazione: la riga dei numeri sotto la campana N(48, 6²) scorre fino a mettere lo 0 sotto la media e poi si divide per σ: ogni tacca vale una deviazione standard e 60 ore diventano z = 2; la tavola dà Φ(z), area a sinistra di z, e la simmetria Φ(−z) = 1 − Φ(z); l’esercizio delle consegne: P(T > 60) = 1 − Φ(2) = 0,0228, e per rimborsare solo l’1% serve z = 2,326, cioè 62 ore; con σ = 4 invece di 6 i rimborsi scendono a 0,0013.',
    dur: 60,
    poster: 40.6,
    chap: [[0, 'Una sola campana per tutte'], [18.5, 'La tavola e la simmetria'], [30.6, 'La consegna garantita'], [52.6, 'Un corriere più regolare']],
    caps: [
      [0, 'Le consegne durano *T* ~ N(48, 6²) ore. La primitiva di questa campana non si scrive: riporto tutto a una campana sola, la standard.'],
      [7.4, 'Prima tolgo la media: la riga scorre fino a mettere lo 0 sotto il centro.'],
      [11.7, 'Poi divido per *σ*: ogni tacca vale una deviazione standard. *Z* = (*X* − *μ*)/*σ* è N(0, 1), e 60 ore sono *z* = 2.'],
      [18.5, 'Per la normale standard la tavola dà Φ(*z*), l’area a sinistra di *z*: Φ(1) = 0,8413.'],
      [23.2, 'La campana è simmetrica: l’area a sinistra di −*z* è quella a destra di *z*, quindi Φ(−*z*) = 1 − Φ(*z*). Φ(−1) = 0,1587.'],
      [30.6, 'Esercizio: consegna entro 60 ore o rimborso. Scrivo *P*(*T* > 60) = 1 − *P*(*T* ≤ 60) e standardizzo: *z* = 2.'],
      [37.6, 'Dalla tavola Φ(2) = 0,9772, quindi *P*(*T* > 60) = 0,0228: circa 2 ordini su 100 vengono rimborsati.'],
      [44.1, 'Al contrario: per rimborsare solo l’1% serve *z* = 2,326, cioè *t* = 48 + 2,326 · 6 ≈ 62 ore. Promettendo 62 ore i rimborsi scendono all’1%.'],
      [52.6, 'Corriere più regolare: media 48, *σ* = 4. Ora *z* = 3 e 1 − Φ(3) = 0,0013: circa 1 ordine su 740.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 18.2, 'Una sola campana per tutte', '*Z* = (*X* − *μ*)/*σ*: togli la media, dividi per *σ*') + heading(t, 18.8, 30.2, 'La tavola e la simmetria', 'Φ(*z*) = *P*(*Z* ≤ *z*),   Φ(−*z*) = 1 − Φ(*z*)') + heading(t, 30.8, 52.2, 'La consegna garantita', '*T* ~ N(48, 6²): rimborso se la consegna supera 60 ore') + heading(t, 52.8, 60.4, 'Un corriere più regolare', 'stessa media 48, deviazione standard 4 invece di 6');

      /* capitolo 1: la riga dei numeri che scorre sotto la campana */
      const c1 = vis(t, 0.3, 18.6, 0.6, 0.6);
      if (c1 > 0.004) {
        const fn = (h) => npdf(h, 48, 6);
        const bu = p(t, 0.5, 1.5);
        o += on(bu, path(areaD(fn, 28, 68, S1X, S1Y, S1B, 100), { fill: C.A, fo: 0.18 * bu, op: c1 }) + path(curve(fn, 28, 68, S1X, S1Y, 100), { stroke: C.A, sw: 3.2, lc: 'round', op: c1 }));
        o += g({ op: bu * c1 }, ln(S1X(28), S1B, S1X(68), S1B, { stroke: C.soft, sw: 1.8 }) + [30, 36, 42, 48, 54, 60, 66].map((h) => ln(S1X(h), S1B, S1X(h), S1B + 6, { stroke: C.soft, sw: 1.8 }) + tx(S1X(h), S1B + 26, h, { ff: SANS, size: 17, fill: C.soft })).join('') + tx(100, S1B + 26, '*X* (ore)', { ff: SANS, size: 17, fill: C.soft, ta: 'end' }));
        /* la seconda riga: parte uguale alla prima, poi scorre (u1) e si divide (u2) */
        const rs = p(t, 1.8, 2.8) * c1, u1 = p(t, 7.8, 11.2, E.io), u2 = p(t, 12.2, 13.2, E.lin);
        if (rs > 0.004) {
          const YR = 288;
          o += ln(S1X(28), YR, S1X(68), YR, { stroke: C.soft, sw: 1.8, op: rs });
          for (let v = -24; v <= 66; v += 6) {
            const x = 320 + 10 * v - 480 * (1 - u1), ed = clampOp(Math.min(x - 116, 524 - x) / 24);
            if (ed <= 0.01) continue;
            const w = clampOp(1 - 2 * u2), w2 = clampOp(2 * u2 - 1);
            o += ln(x, YR, x, YR + 6, { stroke: C.soft, sw: 1.8, op: rs * ed }) + tx(x, YR + 26, fz(v), { ff: SANS, size: 17, fill: C.ink, op: rs * ed * w });
            if (w2 > 0.004) o += tx(x, YR + 26, fz(v / 6), { ff: SANS, size: 17, fill: C.B, op: rs * ed * w2 });
          }
          /* nome della riga */
          const nm = t < 11 ? 'X' : t < 12.6 ? 'X − 48' : 'Z';
          o += tx(100, YR + 26, nm === 'X' ? '*X*' : nm === 'X − 48' ? '*X* − 48' : '*Z*', { size: 20, fill: C.B, ta: 'end', op: rs });
        }
        const mk = p(t, 7.4, 8.2) * c1;
        o += on(mk, path(`M${S1X(48)} 326l-8 14h16z`, { fill: C.hi, stroke: C.ink, sw: 1.4, op: mk }) + tx(S1X(48) + 16, 338, 'la media', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: mk }));
        /* 60 ore = z = 2 */
        const hl = p(t, 15.6, 16.6) * c1;
        o += on(hl, ln(S1X(60), S1B, S1X(60), S1Y(fn(60)) - 16, { stroke: C.B, sw: 2.2, da: '5 4', op: hl }) + tx(S1X(60), S1Y(fn(60)) - 26, '60 ore', { size: 22, fill: C.B, op: hl }) + circ(S1X(60), S1Y(fn(60)), 5.5, { fill: C.B, op: hl }));
        const zz = p(t, 16.8, 17.6) * c1;
        o += on(zz, tx(488, 176, '*z* = 2', { size: 26, fill: C.B, ta: 'start', op: zz }) + tx(488, 200, 'due σ sopra', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: zz }) + tx(488, 220, 'la media', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: zz }));
        const sg = vis(t, 12, 15.4, 0.4, 0.4) * c1;
        o += on(sg, brace(S1X(48), S1X(54), 116, C.hi, sg, -1) + tx(S1X(51), 98, '*σ* = 6 ore', { size: 20, op: sg }));
      }

      /* capitolo 2: la tavola di Φ e la simmetria */
      const c2 = vis(t, 18.8, 30.4, 0.6, 0.5);
      if (c2 > 0.004) {
        o += g({ op: c2 }, ln(S2X(-3.6), S2B, S2X(3.6), S2B, { stroke: C.soft, sw: 1.8 }) + [-3, -2, -1, 0, 1, 2, 3].map((z) => ln(S2X(z), S2B, S2X(z), S2B + 6, { stroke: C.soft, sw: 1.8 }) + tx(S2X(z), S2B + 26, fz(z), { ff: SANS, size: 17, fill: C.soft })).join(''));
        const zc = kf(t, [[19.2, -3.4], [22.6, 1]]);
        const ar = areaD(npdf, -3.6, Math.max(-3.5, zc), S2X, S2Y, S2B, 90);
        o += path(ar, { fill: C.A, fo: 0.4, op: c2 * (1 - p(t, 25.2, 26))}) + ln(S2X(zc), S2B, S2X(zc), S2Y(npdf(zc)), { stroke: C.A, sw: 2, da: '4 4', op: c2 * (1 - p(t, 25.2, 26)) });
        o += path(curve(npdf, -3.6, 3.6, S2X, S2Y, 110), { stroke: C.A, sw: 3.2, lc: 'round', op: c2 });
        const ro = p(t, 19.4, 20.2) * c2 * (1 - p(t, 24.6, 25.2));
        o += on(ro, tx(320, 122, 'Φ(' + sn(zc, Math.abs(zc - Math.round(zc)) < 0.05 ? 0 : 1) + ') = ' + nc(Phi(zc), 4), { size: 26, op: ro }));
        /* il pezzetto di tavola */
        const tb = p(t, 22.4, 23.4) * c2 * (1 - p(t, 25.8, 26.6));
        if (tb > 0.004) {
          o += rect(486, 98, 132, 98, { rx: 6, fill: C.paper, stroke: C.soft, sw: 1.4, op: tb }) + tx(510, 120, '*z*', { ff: SANS, size: 17, fill: C.soft, op: tb }) + tx(580, 120, 'Φ(*z*)', { ff: SANS, size: 17, fill: C.soft, op: tb });
          [['1', '0,8413'], ['2', '0,9772'], ['3', '0,9987']].forEach(([a, b], i) => (o += tx(510, 146 + 24 * i, a, { size: 20, op: tb }) + tx(580, 146 + 24 * i, b, { size: 20, op: tb * (i === 0 ? 1 : 0.8) })));
        }
        /* la simmetria: due code uguali */
        const sy = p(t, 24.8, 25.8) * c2;
        if (sy > 0.004) {
          o += path(tail(S2X, S2Y, S2B, 0, 1, 1, 3.6, 40), { fill: NO, fo: 0.45 * sy }) + path(tail(S2X, S2Y, S2B, 0, 1, -3.6, -1, 40), { fill: NO, fo: 0.45 * sy });
          o += ln(S2X(0), S2B + 4, S2X(0), S2Y(npdf(0)) - 8, { stroke: C.soft, sw: 1.4, da: '3 4', op: sy });
          const l1 = p(t, 26.2, 27) * c2;
          o += on(l1, tx(S2X(2), 226, '0,1587', { size: 22, fill: NO, op: l1 }) + tx(S2X(-2), 226, '0,1587', { size: 22, fill: NO, op: l1 }));
          const fm = p(t, 27.4, 28.4) * c2;
          o += on(fm, tx(320, 122, 'Φ(−1) = 1 − Φ(1) = 1 − 0,8413 = 0,1587', { size: 24, op: fm }));
        }
      }

      /* capitolo 3: la consegna garantita */
      const c3 = vis(t, 30.8, 52.2, 0.6, 0.6);
      if (c3 > 0.004) {
        const fn = (h) => npdf(h, 48, 6), ba = p(t, 31, 32);
        o += on(ba, path(areaD(fn, 30, 66, S3X, S3Y, S3B, 100), { fill: C.A, fo: 0.16 * ba, op: c3 }) + path(curve(fn, 30, 66, S3X, S3Y, 100), { stroke: C.A, sw: 3, lc: 'round', op: c3 }));
        o += g({ op: ba * c3 }, ln(S3X(30), S3B, S3X(66), S3B, { stroke: C.soft, sw: 1.8 }) + [36, 42, 48, 54, 60, 66].map((h) => ln(S3X(h), S3B, S3X(h), S3B + 6, { stroke: C.soft, sw: 1.8 }) + tx(S3X(h), S3B + 26, h, { ff: SANS, size: 17, fill: C.soft })).join(''));
        const zr = p(t, 34.4, 35.4) * c3;
        o += on(zr, g({ op: zr }, ln(S3X(30), 300, S3X(66), 300, { stroke: C.soft, sw: 1.8 }) + [-2, -1, 0, 1, 2, 3].map((z) => ln(S3X(48 + 6 * z), 300, S3X(48 + 6 * z), 306, { stroke: C.soft, sw: 1.8 }) + tx(S3X(48 + 6 * z), 326, fz(z), { ff: SANS, size: 17, fill: z === 2 ? C.B : C.soft })).join('') + tx(S3X(30) - 10, 326, '*z*', { size: 20, fill: C.B, ta: 'end' })));
        /* la promessa a 60 ore e la coda del rimborso */
        const pm = p(t, 31.8, 32.8) * c3, mv = kf(t, [[45.4, 60], [48, 62]]);
        const aTail = (1 - p(t, 44.4, 45.2)) * pm, bTail = p(t, 44.6, 45.4) * c3;
        o += on(pm, ln(S3X(mv), S3B, S3X(mv), 222, { stroke: C.B, sw: 2.2, da: '5 4', op: pm }) + tx(S3X(mv), 198, Math.round(mv) + ' ore', { size: 22, fill: C.B, op: pm }));
        o += on(pm, path(tail(S3X, S3Y, S3B, 48, 6, mv, 66, 40), { fill: NO, fo: 0.6 * pm }));
        const f3 = p(t, 37.8, 38.8) * c3 * (1 - p(t, 44.4, 45));
        o += on(f3, path(tail(S3X, S3Y, S3B, 48, 6, 30, 60, 80), { fill: C.A, fo: 0.4 * f3 }) + tx(S3X(47), S3Y(fn(48)) + 60, '0,9772', { size: 26, op: f3 }));
        const tl = p(t, 40, 41) * c3 * (1 - p(t, 44.4, 45));
        o += on(tl, tx(S3X(60) + 3, 236, '0,0228', { size: 22, fill: NO, ta: 'start', op: tl }));
        const tl2 = p(t, 48.6, 49.4) * c3;
        o += on(tl2, tx(S3X(62) + 8, 236, '1%', { size: 22, fill: NO, ta: 'start', op: tl2 }));
        /* la colonna dei passi */
        PASSI.forEach(([k, lines, t0], i) => {
          const a = p(t, t0, t0 + 0.8) * c3 * (1 - p(t, 43.6, 44.2)), y = [116, 184, 230, 276][i];
          if (a <= 0.004) return;
          o += circ(42, y - 6, 12, { fill: C.paper, stroke: C.B, sw: 2, op: a }) + tx(42, y, k, { ff: SANS, size: 17, op: a });
          lines.forEach((ln_, j) => (o += tx(66, y + 26 * j - (j ? 0 : 0), ln_, { size: 22, ta: 'start', op: a })));
        });
        const B1 = p(t, 44.6, 45.4) * c3, B2 = p(t, 47, 47.8) * c3, B3 = p(t, 49.8, 50.6) * c3;
        o += on(B1, tx(40, 118, 'rimborso solo all’1%:', { size: 22, ta: 'start', op: B1 }) + tx(40, 150, '*z* = 2,326', { size: 26, fill: C.B, ta: 'start', op: B1 }));
        o += on(B2, tx(40, 194, '*t* = *μ* + *zσ*', { size: 22, ta: 'start', op: B2 }) + tx(40, 222, '= 48 + 2,326 · 6', { size: 22, ta: 'start', op: B2 }));
        o += on(B3, tx(40, 256, '≈ 62 ore', { size: 28, fill: C.B, ta: 'start', op: B3 }));
      }

      /* capitolo 4: un corriere più regolare */
      const c4 = vis(t, 52.8, 60.4, 0.6, 0.01);
      if (c4 > 0.004) {
        const y4 = (sdv) => (d) => S4B - 1100 * d;
        o += g({ op: c4 }, ln(S4X(30), S4B, S4X(66), S4B, { stroke: C.soft, sw: 1.8 }) + [36, 42, 48, 54, 60].map((h) => ln(S4X(h), S4B, S4X(h), S4B + 6, { stroke: C.soft, sw: 1.8 }) + tx(S4X(h), S4B + 24, h, { ff: SANS, size: 17, fill: C.soft })).join('') + tx(S4X(30) - 10, S4B + 24, 'ore', { ff: SANS, size: 17, fill: C.soft, ta: 'end' }));
        [[6, C.A, 53.2], [4, C.B, 54.6]].forEach(([sdv, col, t0]) => {
          const u = p(t, t0, t0 + 1.2, E.io);
          if (u > 0.004) o += path(areaD((h) => npdf(h, 48, sdv), 30, 66, S4X, y4(sdv), S4B, 90), { fill: col, fo: 0.14 * u, op: c4 }) + path(curve((h) => npdf(h, 48, sdv), 30, 66, S4X, y4(sdv), 90), { stroke: col, sw: 3, lc: 'round', op: c4, ...draw(u) });
        });
        const pr = p(t, 55.4, 56.2) * c4;
        o += on(pr, ln(S4X(60), S4B, S4X(60), 140, { stroke: NO, sw: 2.2, da: '5 4', op: pr }) + tx(S4X(60), 130, '60 ore', { size: 22, fill: NO, op: pr }));
        const z6 = p(t, 56.4, 57.2) * c4, z4 = p(t, 57.4, 58.2) * c4;
        o += on(z6, tx(S4X(60) + 14, 170, '*z* = 2', { size: 22, fill: C.A, ta: 'start', op: z6 }));
        o += on(z4, tx(S4X(60) + 14, 196, '*z* = 3', { size: 22, fill: C.B, ta: 'start', op: z4 }));
        const b1 = p(t, 57, 58.2, E.out) * c4, b2 = p(t, 58.4, 59.4, E.out) * c4;
        o += on(b1, tx(124, 276, '*σ* = 6', { size: 20, fill: C.A, ta: 'end', op: b1 }) + rect(132, 260, 80 * 2.28 * p(t, 57, 58.2, E.out), 22, { rx: 3, fill: C.A, fo: 0.7, op: c4 }) + tx(132 + 80 * 2.28 + 10, 277, '0,0228', { size: 22, ta: 'start', op: b1 }));
        o += on(b2, tx(124, 316, '*σ* = 4', { size: 20, fill: C.B, ta: 'end', op: b2 }) + rect(132, 300, Math.max(2, 80 * 0.13 * p(t, 58.4, 59.4, E.out)), 22, { rx: 2, fill: C.B, fo: 0.8, op: c4 }) + tx(132 + 80 * 0.13 + 12, 317, '0,0013:  1 su 740', { size: 22, ta: 'start', op: b2 }));
      }
      return o;
    },
  });

  /* ======================================================================
     3.8 · Vita residua e tasso di guasto: quando l'assenza di memoria non vale
     ====================================================================== */
  const SU = (x) => Math.exp(-2 * x * x), FU = (x) => 4 * x * SU(x), HU = (x) => 4 * x; // il componente che si usura: S = e^(−2x²)
  const LE = 1.596, SE = (x) => Math.exp(-LE * x), FE = (x) => LE * SE(x), HE = () => LE; // esponenziale con la stessa media (0,627 anni)
  const SR = (x) => 1 / ((1 + x) * (1 + x)), FR = (x) => 2 / (1 + x) ** 3, HR = (x) => 2 / (1 + x); // S = 1/(1+x)²: il rodaggio
  const G1X = (x) => 80 + 170 * x, G1B = 270, G1Y = (v) => G1B - 160 * v; // capitolo 1: anni → pixel
  const G2X = (x) => 80 + 255 * x, G2T = 200, G2Y = (v) => G2T - 100 * v, G2B = 316, G2H = (h) => G2B - 17 * h; // capitolo 2: S in alto, h in basso
  const G3X = (t) => 90 + 150 * t, G3B = 290, G3Y = (v) => G3B - 160 * v; // capitolo 3: probabilità di vivere un altro anno
  /* la parte di S a destra di s = 1: si riscala di 1/S(1) (u2) e poi si sposta in 0 (u1); restituisce [area, bordo] */
  const sliceG = (S, u1, u2, x1) => {
    const k = 1 + (1 / S(1) - 1) * u2, X = (x) => G1X(x) - 170 * u1, Y = (v) => G1B - 160 * v * k;
    return [areaD(S, 1, x1, X, Y, G1B, 80), curve(S, 1, x1, X, Y, 80)];
  };
  const LAWS = [['u', SU, FU, HU, C.B, 'usura', '*h* = 4*x*', 26.6, 32.4, 0.04, 1.25], ['e', SE, FE, HE, C.A, 'esponenziale', '*h* = *λ*', 33.4, 36.8, 0.02, 2], ['r', SR, FR, HR, C.C, 'rodaggio', '*h* = 2/(1 + *x*)', 37.6, 41, 0.02, 2]]; // sigla, S, f, h, colore, nome, formula, da, a, x0, x1

  PV.add('guasto', {
    sec: '3.33',
    short: 'Vita residua e tasso di guasto',
    title: 'Vita residua e tasso di guasto: quando l’assenza di memoria non vale',
    alt: 'Animazione: per un componente che si usura, S(x) = e^(−2x²), la parte di curva a destra di un anno, riscalata e spostata, scende molto più in fretta della curva di partenza (0,0025 contro 0,135, circa 55 volte meno), mentre per un’esponenziale con la stessa media coincide con la curva originale; il tasso di guasto h = f/S è la pendenza di S divisa per la sua altezza: cresce per l’usura, è costante per l’esponenziale, decresce per S = 1/(1+x)²; la probabilità di sopravvivere ancora un anno a età t scende per l’usura, resta 0,203 per l’esponenziale, sale per il rodaggio.',
    dur: 60,
    poster: 17,
    chap: [[0, 'Vita residua: la coda riparte?'], [25.9, 'Il tasso di guasto'], [41.6, 'Tre destini']],
    caps: [
      [0, 'La sopravvivenza *S*(*x*) = *P*(*X* > *x*) è la coda. Un componente nuovo, con *S*(*x*) = *e*^{−2x²}, supera il primo anno con probabilità 0,135.'],
      [7.6, 'Se ha già un anno, restringo la curva a *x* > 1 e la rinormalizzo: la vita che resta ha sopravvivenza *S*(1 + *x*)/*S*(1).'],
      [14.4, 'Sopravvivere un altro anno ora ha probabilità *e*^{−6} ≈ 0,0025: circa 55 volte meno che per un pezzo nuovo. Il tempo logora.'],
      [21.4, 'Un’esponenziale con la stessa media (*λ* ≈ 1,6) riparte identica: 0,203 a ogni età.'],
      [25.9, 'Il tasso di guasto *h*(*x*) = *f*(*x*)/*S*(*x*) dice quanto ripida scende *S* rispetto alla sua altezza: la probabilità di guastarsi subito dopo *x*, vivi a *x*.'],
      [33.9, 'Per l’usura *h*(*x*) = 4*x* cresce; per l’esponenziale è costante; con *S* = 1/(1 + *x*)² decresce.'],
      [41.6, 'Probabilità di sopravvivere ancora un anno a età *t*: l’usura crolla, l’esponenziale resta a 0,203, il rodaggio sale.'],
      [48.6, 'Tasso crescente: invecchiare peggiora le cose. Decrescente: chi supera i primi anni diventa più affidabile, la «mortalità infantile».'],
      [55.8, 'Tasso costante vuol dire esponenziale, e nessun’altra legge.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 21, 'La vita che resta', 'un componente che si usura: *S*(*x*) = ' + sp('e', '−2x²')) + heading(t, 21.6, 25.6, 'Un’esponenziale con la stessa media', '*λ* ≈ 1,6: *S*(*x*) = ' + sp('e', '−λx')) + heading(t, 26.2, 41.2, 'Il tasso di guasto', '*h*(*x*) = *f*(*x*)/*S*(*x*) = pendenza di *S* ÷ altezza di *S*') + heading(t, 41.8, 60.4, 'Tre destini', '*S*(*t* + 1)/*S*(*t*): sopravvivere un altro anno, a età *t* (anni)');

      /* capitolo 1: l'usura, la fetta rinormalizzata, l'esponenziale con la stessa media */
      const c1 = vis(t, 0.3, 25.9, 0.6, 0.6);
      if (c1 > 0.004) {
        o += g({ op: c1 * p(t, 0.4, 1.4) }, ln(G1X(0) - 6, G1B, G1X(3) + 10, G1B, { stroke: C.soft, sw: 1.8 }) + [0, 1, 2, 3].map((x) => ln(G1X(x), G1B, G1X(x), G1B + 6, { stroke: C.soft, sw: 1.8 }) + tx(G1X(x), G1B + 26, x, { ff: SANS, size: 17, fill: C.soft })).join('') + tx(G1X(3) + 14, G1B + 26, 'anni', { ff: SANS, size: 17, fill: C.soft, ta: 'start' }) + ln(G1X(0), G1B, G1X(0), G1Y(1) - 14, { stroke: C.soft, sw: 1.6 }) + tx(G1X(0) - 8, G1Y(1) + 6, '1', { size: 20, ta: 'end' }) + tx(G1X(0) + 14, G1Y(1) - 8, '*S*', { size: 22, fill: C.A, ta: 'start' }));
        /* 1a: l'usura (blu) */
        const k1 = (1 - p(t, 20.8, 21.6)) * c1, cu = p(t, 1.2, 3.6, E.io);
        if (k1 > 0.004) {
          o += on(p(t, 3.4, 4.2), path(areaD(SU, 0, 3, G1X, G1Y, G1B, 100), { fill: C.A, fo: 0.14 * p(t, 3.4, 4.2), op: k1 }));
          o += path(curve(SU, 0, 3, G1X, G1Y, 100), { stroke: C.A, sw: 3.2, lc: 'round', op: k1, ...draw(cu) });
          const d1 = p(t, 4.2, 5.2) * k1 * (1 - p(t, 14, 14.6));
          o += on(d1, circ(G1X(1), G1Y(SU(1)), 6, { fill: C.A, stroke: C.paper, sw: 1.6, op: d1 }) + tx(G1X(1) + 16, G1Y(SU(1)) - 26, '*S*(1) = 0,135', { size: 22, ta: 'start', op: d1 }) + ln(G1X(1), G1B, G1X(1), G1Y(SU(1)), { stroke: C.A, sw: 1.8, da: '4 4', op: d1 }));
          /* 1b: la fetta a destra di un anno */
          const sl = p(t, 7.6, 8.6) * k1, u2 = p(t, 9, 11.4, E.io), u1 = p(t, 11.8, 13.8, E.io);
          if (sl > 0.004) {
            const [ad, cd] = sliceG(SU, u1, u2, 3);
            o += path(ad, { fill: C.B, fo: 0.4 * sl }) + path(cd, { stroke: C.B, sw: 3, lc: 'round', op: sl });
            const ml = vis(t, 7.8, 13.6, 0.5, 0.5) * k1 * (1 - u1);
            o += on(ml, ln(G1X(1), G1B, G1X(1), G1Y(1) + 10, { stroke: C.B, sw: 2, da: '6 4', op: ml }) + tx(G1X(1) + 12, 128, 'ha già un anno', { size: 22, fill: C.B, ta: 'start', op: ml }));
            const sc = vis(t, 9.2, 13.8, 0.5, 0.5) * k1;
            o += on(sc * (1 - u2 * 0), tx(G1X(1) + 12, 154, u2 < 0.99 ? 'riscalo: area 1' : 'sposto l’origine', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: sc }));
          }
          const cmp = p(t, 14.4, 15.4) * k1;
          o += on(cmp, circ(G1X(1), G1Y(SU(1)), 6, { fill: C.A, stroke: C.paper, sw: 1.6, op: cmp }) + circ(G1X(1), G1B - 0.4, 6, { fill: C.B, stroke: C.paper, sw: 1.6, op: cmp }) + circ(350, 124, 6, { fill: C.A, op: cmp }) + tx(364, 130, 'nuovo: 0,135', { size: 22, ta: 'start', op: cmp }));
          const cm2 = p(t, 15.8, 16.8) * k1;
          o += on(cm2, circ(350, 154, 6, { fill: C.B, op: cm2 }) + tx(364, 160, 'con un anno: 0,0025', { size: 22, ta: 'start', op: cm2 }));
          const pl = p(t, 17.6, 18.4) * k1;
          o += on(pl, pills(336, [{ s: 'circa 55 volte meno probabile: *e*^4 ≈ 54,6', op: pl }]));
        }
        /* 1c: l'esponenziale con la stessa media: la fetta riparte identica */
        const k2 = p(t, 21.2, 22) * c1;
        if (k2 > 0.004) {
          const u2 = p(t, 22.6, 23.6, E.io), u1 = p(t, 23.8, 24.8, E.io), ce = p(t, 21.4, 22.6, E.io);
          o += path(areaD(SE, 0, 3, G1X, G1Y, G1B, 100), { fill: C.A, fo: 0.14 * k2 }) + path(curve(SE, 0, 3, G1X, G1Y, 100), { stroke: C.A, sw: 3.2, lc: 'round', op: k2, ...draw(ce) });
          const sl = p(t, 22.4, 23) * k2;
          if (sl > 0.004) {
            const [ad, cd] = sliceG(SE, u1, u2, 3);
            o += path(ad, { fill: C.B, fo: 0.4 * sl }) + path(cd, { stroke: C.B, sw: 3, lc: 'round', op: sl });
          }
          const dd = p(t, 24.8, 25.6) * k2;
          o += on(dd, circ(G1X(1), G1Y(SE(1)), 6, { fill: C.B, stroke: C.paper, sw: 1.6, op: dd }) + tx(G1X(1) + 16, G1Y(SE(1)) - 28, '0,203 in entrambi i casi', { size: 22, ta: 'start', op: dd }));
        }
      }

      /* capitolo 2: S in alto, h in basso */
      const c2 = vis(t, 26.2, 41.6, 0.6, 0.6);
      if (c2 > 0.004) {
        o += g({ op: c2 }, ln(G2X(0), G2T, G2X(2.1), G2T, { stroke: C.soft, sw: 1.6 }) + ln(G2X(0), G2Y(1) - 8, G2X(0), G2T, { stroke: C.soft, sw: 1.6 }) + ln(G2X(0), G2B, G2X(2.1), G2B, { stroke: C.soft, sw: 1.8 }) + ln(G2X(0), G2H(5.5), G2X(0), G2B, { stroke: C.soft, sw: 1.6 }) + [0, 0.5, 1, 1.5, 2].map((x) => ln(G2X(x), G2B, G2X(x), G2B + 6, { stroke: C.soft, sw: 1.8 }) + tx(G2X(x), G2B + 26, nc(x, x % 1 ? 1 : 0), { ff: SANS, size: 17, fill: C.soft })).join('') + [0, 2, 4].map((h) => tx(G2X(0) - 8, G2H(h) + 6, h, { ff: SANS, size: 17, fill: C.soft, ta: 'end' })).join('') + tx(G2X(0) + 14, G2Y(1) + 2, '*S*', { size: 22, fill: C.A, ta: 'start' }) + tx(G2X(0) + 14, G2H(5.5) + 12, '*h*', { size: 22, ta: 'start' }) + tx(G2X(2) + 14, G2B + 26, 'anni', { ff: SANS, size: 17, fill: C.soft, ta: 'start' }));
        LAWS.forEach(([id, S, F, H, col, name, hf, ta, tb, x0, x1]) => {
          const op = vis(t, ta - 0.5, tb + 0.4, 0.5, 0.5) * c2;
          if (op < 0.004) return;
          const xc = lerp(x0, x1, p(t, ta + 0.4, tb - 0.4, E.io)), draw1 = p(t, ta - 0.3, ta + 0.8, E.io);
          o += path(areaD(S, 0, 2, G2X, G2Y, G2T, 90), { fill: C.A, fo: 0.12, op }) + path(curve(S, 0, 2, G2X, G2Y, 90), { stroke: C.A, sw: 3, lc: 'round', op, ...draw(draw1) });
          /* la traccia di h fino al cursore */
          o += path(curve(H, x0, xc, G2X, G2H, 40), { stroke: col, sw: 3.2, lc: 'round', op });
          /* altezza, tangente, cursore */
          const sv = S(xc), sl = -F(xc), dx = 0.16;
          o += ln(G2X(xc), G2T, G2X(xc), G2Y(sv), { stroke: C.soft, sw: 1.6, da: '3 3', op }) + ln(G2X(xc - dx), G2Y(sv - sl * dx), G2X(xc + dx), G2Y(sv + sl * dx), { stroke: col, sw: 2.6, lc: 'round', op }) + circ(G2X(xc), G2Y(sv), 5.5, { fill: C.A, stroke: C.paper, sw: 1.4, op }) + ln(G2X(xc), G2Y(sv) + 8, G2X(xc), G2H(H(xc)) - 8, { stroke: col, sw: 1.4, da: '3 4', op: 0.7 * op }) + circ(G2X(xc), G2H(H(xc)), 5.5, { fill: col, stroke: C.paper, sw: 1.4, op });
          o += tx(600, 232, name + ':  ' + hf, { size: 22, fill: col, ta: 'end', op });
          o += tx(600, 120, '*h* = ' + nc(H(xc), 1), { size: 26, fill: col, ta: 'end', op });
        });
        const ex = p(t, 27, 28) * c2 * (1 - p(t, 40.4, 41));
        o += on(ex, tx(250, 120, '*h* = pendenza ÷ altezza', { size: 22, ta: 'start', op: ex }));
      }

      /* capitolo 3: tre destini */
      const c3 = vis(t, 41.8, 60.4, 0.6, 0.01);
      if (c3 > 0.004) {
        o += g({ op: c3 }, ln(G3X(0), G3B, G3X(3.1), G3B, { stroke: C.soft, sw: 1.8 }) + ln(G3X(0), G3B, G3X(0), G3Y(1) - 4, { stroke: C.soft, sw: 1.6 }) + [0, 1, 2, 3].map((x) => ln(G3X(x), G3B, G3X(x), G3B + 6, { stroke: C.soft, sw: 1.8 }) + tx(G3X(x), G3B + 26, x, { ff: SANS, size: 17, fill: C.soft })).join('') + tx(G3X(3.1) + 14, G3B + 26, 'età *t*', { ff: SANS, size: 17, fill: C.soft, ta: 'start' }) + [0, 0.5, 1].map((v) => tx(G3X(0) - 8, G3Y(v) + 6, nc(v, v === 0 || v === 1 ? 0 : 1), { ff: SANS, size: 17, fill: C.soft, ta: 'end' })).join(''));
        const cs = [[(x) => Math.exp(-2 * (2 * x + 1)), C.B, 43.2, 'usura: 0,135 → 0,0025 → 0,000045', 104], [() => Math.exp(-LE), C.A, 46, 'esponenziale: 0,203 a ogni età', 130], [(x) => ((1 + x) / (2 + x)) ** 2, C.C, 48.4, 'rodaggio: 0,25 → 0,44 → 0,64', 156]];
        cs.forEach(([fn, col, t0, lab, ly], i) => {
          const u = p(t, t0, t0 + 2, E.io), lu = p(t, t0 + 0.4, t0 + 1.2) * c3;
          if (u > 0.004) o += path(curve(fn, 0, 3.1, G3X, G3Y, 90), { stroke: col, sw: 3.4, lc: 'round', op: c3, ...draw(u) });
          o += on(lu, ln(112, ly - 6, 134, ly - 6, { stroke: col, sw: 3.6, op: lu }) + tx(144, ly, lab, { size: 20, ta: 'start', op: lu }));
          const pts = i === 0 ? [0, 1] : i === 1 ? [] : [0, 1, 3];
          pts.forEach((x, j) => { const a = p(t, t0 + 1.8 + 0.2 * j, t0 + 2.4 + 0.2 * j) * c3; if (a > 0.004) o += circ(G3X(x), G3Y(fn(x)), 5.5, { fill: col, stroke: C.paper, sw: 1.4, op: a }); });
        });
        const pe = p(t, 56, 56.8) * c3;
        o += on(pe, pills(338, [{ s: 'tasso costante ⇔ esponenziale: senza usura e senza rodaggio', op: pe }]));
      }
      return o;
    },
  });

  /* ======================================================================
     3.8 · Con la normale: probabilità condizionate a un intervallo o a una coda
     ====================================================================== */
  const I1X = (x) => 215 + 4 * (x - 100), I1B = 258, I1Y = (d) => I1B - 4500 * d; // latenza N(100, 20²), in ms
  const I2X = (x) => 215 + 6.5 * (x - 50), I2B = 258, I2Y = (d) => I2B - 2000 * d; // job N(50, 8²), in minuti
  const GGX = 440, GGW = 30, GGB = 268, GGH = 112; // il «misuratore» dell'universo ristretto: tutto B, e la sua frazione
  /* misuratore verticale: tutto B (oro) e le parti [da, a] come frazioni di B, dal basso */
  const gauge = (parts, op) => rect(GGX, GGB - GGH, GGW, GGH, { rx: 3, fill: C.hi, fo: 0.3 * op, stroke: C.hi, sw: 2, so: op }) + parts.map(([a, b, col]) => rect(GGX, GGB - GGH * b, GGW, GGH * (b - a), { fill: col, fo: 0.75 * op })).join('');

  PV.add('normaleintervallo', {
    sec: '3.31',
    short: 'Normale: condizionare',
    title: 'Con la normale: probabilità condizionate a un intervallo o a una coda',
    alt: 'Animazione: per il tempo di percorrenza di un treno regionale N(100, 20²) minuti, condizionato a stare fra 90 e 130 minuti, la probabilità di superare 110 è l’area fra 110 e 130 divisa per l’area fra 90 e 130 (0,2417 / 0,6247 ≈ 0,387); l’errore tipico è dividere P(A) per P(B), che include anche i valori oltre 130 e dà 0,494; per una riunione N(50, 8²) già in corso da 60 minuti, la probabilità di superare 70 è (1 − Φ(2,5)) / (1 − Φ(1,25)) ≈ 0,059, contro lo 0,6% di partenza.',
    dur: 57,
    poster: 24,
    chap: [[0, 'Condizionare a un intervallo'], [26.6, 'L’errore che fanno tutti'], [33.4, 'Condizionare a una coda']],
    caps: [
      [0, 'Un treno impiega N(100, 20²) minuti per una tratta. Sapendo che sta fra 90 e 130, qual è la probabilità che superi 110?'],
      [7.4, 'L’universo è ora l’intervallo *B*. L’evento *A* = {*X* > 110} resta solo in parte: *A* ∩ *B* è l’intervallo fra 110 e 130.'],
      [14.6, 'Standardizzo: 90, 110 e 130 diventano −0,5, 0,5 e 1,5. *P*(*A* ∩ *B*) = 0,9332 − 0,6915 = 0,2417 e *P*(*B*) = 0,9332 − 0,3085 = 0,6247.'],
      [22, 'Quindi *P*(*A* | *B*) = 0,2417/0,6247 ≈ 0,387: circa il 39% dell’universo *B*.'],
      [26.6, 'L’errore che fanno tutti: dividere *P*(*A*) per *P*(*B*). Viene 0,494, sbagliato: entrano anche i valori oltre 130, che *B* esclude.'],
      [33.4, 'Una riunione dura *X* ~ N(50, 8²) minuti ed è in corso da 60. Con quale probabilità durerà più di 70 in tutto?'],
      [40.6, 'Qui *A* = {*X* > 70} è dentro *B* = {*X* > 60}, quindi *A* ∩ *B* = *A*. Con *z* = 1,25 e 2,5: *P*(*A* | *B*) = 0,0062/0,1056 ≈ 0,059.'],
      [48.4, 'Circa il 6%, contro lo 0,6% di partenza: quasi dieci volte di più. Con l’esponenziale i 60 minuti non conterebbero; con la normale sì.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 26, 'Condizionare a un intervallo', 'treno *X* ~ N(100, 20²): *P*(*X* > 110 | 90 < *X* < 130)') + heading(t, 26.8, 33.1, 'L’errore che fanno tutti', 'dividere *P*(*A*) invece di *P*(*A* ∩ *B*)') + heading(t, 33.8, 57.4, 'Condizionare a una coda', 'riunione *X* ~ N(50, 8²): *P*(*X* > 70 | *X* > 60)');

      /* capitoli 1 e 2a: la latenza, B, A ∩ B, e l'errore */
      const c1 = vis(t, 0.3, 33.4, 0.6, 0.6);
      if (c1 > 0.004) {
        const fn = (x) => npdf(x, 100, 20), bu = p(t, 0.5, 1.5);
        o += on(bu, path(areaD(fn, 60, 150, I1X, I1Y, I1B, 90), { fill: C.A, fo: 0.14 * bu, op: c1 }) + path(curve(fn, 60, 150, I1X, I1Y, 90), { stroke: C.A, sw: 3, lc: 'round', op: c1 }));
        o += g({ op: bu * c1 }, ln(I1X(56), I1B, I1X(154), I1B, { stroke: C.soft, sw: 1.8 }) + [60, 80, 90, 100, 110, 120, 130, 140].map((x) => ln(I1X(x), I1B, I1X(x), I1B + 6, { stroke: C.soft, sw: 1.8 }) + tx(I1X(x), I1B + 26, x, { ff: SANS, size: 17, fill: [90, 110, 130].includes(x) && t > 3 ? C.ink : C.soft })).join('') + tx(I1X(154) + 8, I1B + 26, 'min', { ff: SANS, size: 17, fill: C.soft, ta: 'start' }));
        /* B = {90 < X < 130} */
        const rb = p(t, 3, 4) * c1 * (1 - p(t, 32.4, 33));
        o += on(rb, path(areaD(fn, 90, 130, I1X, I1Y, I1B, 50), { fill: C.hi, fo: 0.4 * rb }) + ln(I1X(90), I1B, I1X(90), I1Y(fn(90)), { stroke: C.hi, sw: 2.2, da: '4 4', op: rb }) + ln(I1X(130), I1B, I1X(130), I1Y(fn(130)), { stroke: C.hi, sw: 2.2, da: '4 4', op: rb }));
        /* A ∩ B = {110 < X < 130} */
        const rab = p(t, 7.8, 8.8) * c1 * (1 - p(t, 32.4, 33));
        o += on(rab, path(areaD(fn, 110, 130, I1X, I1Y, I1B, 40), { fill: C.A, fo: 0.6 * rab }) + tx(I1X(120), I1B - 28, '*A* ∩ *B*', { size: 20, op: rab }));
        /* la coda oltre 130, che B esclude: l'errore */
        const rt = p(t, 27.4, 28.4) * c1 * (1 - p(t, 32.4, 33));
        o += on(rt, path(areaD(fn, 130, 150, I1X, I1Y, I1B, 40), { fill: NO, fo: 0.6 * rt }) + tx(I1X(138), I1B - 52, 'fuori da *B*', { size: 20, fill: NO, op: rt }));
        /* le formule in alto */
        const f1 = vis(t, 3.4, 7.8, 0.4, 0.4) * c1, f2 = vis(t, 8.2, 14.4, 0.4, 0.4) * c1;
        o += on(f1, txc(300, 118, [['*B* = {90 < *X* < 130}', C.ink]], { size: 24, op: f1 }));
        o += on(f2, txc(300, 118, [['*A* ∩ *B* = {110 < *X* < 130}', C.ink]], { size: 24, op: f2 }));
        const f3a = p(t, 15.4, 16.2) * c1 * (1 - p(t, 21.6, 22.2)), f3b = p(t, 18, 18.8) * c1 * (1 - p(t, 21.6, 22.2));
        o += on(f3a, tx(300, 104, '*P*(*A* ∩ *B*) = 0,9332 − 0,6915 = 0,2417', { size: 22, op: f3a }));
        o += on(f3b, tx(300, 132, '*P*(*B*) = 0,9332 − 0,3085 = 0,6247', { size: 22, op: f3b }));
        const f4 = p(t, 22.4, 23.2) * c1 * (1 - p(t, 26, 26.6));
        o += on(f4, txc(300, 118, [['*P*(*A* | *B*) = 0,2417 / 0,6247 ≈ ', C.ink], ['0,387', OK]], { size: 26, op: f4 }));
        const f5 = p(t, 28, 28.8) * c1 * (1 - p(t, 32.4, 33));
        o += on(f5, txc(300, 112, [['*P*(*A*) / *P*(*B*) = 0,3085 / 0,6247 ≈ ', C.ink], ['0,494', NO]], { size: 24, op: f5 }));
        /* la riga dei z */
        const zr = p(t, 9.6, 10.4) * c1 * (1 - p(t, 26.2, 26.8));
        o += on(zr, g({ op: zr }, ln(I1X(56), 300, I1X(154), 300, { stroke: C.soft, sw: 1.8 }) + [[90, -0.5], [100, 0], [110, 0.5], [130, 1.5]].map(([x, z]) => ln(I1X(x), 300, I1X(x), 306, { stroke: C.soft, sw: 1.8 }) + tx(I1X(x), 326, sn(z, 1), { ff: SANS, size: 17, fill: C.B })).join('') + tx(I1X(56) - 6, 326, '*z*', { size: 20, fill: C.B, ta: 'end' })));
        /* il misuratore: B è tutto, A ∩ B è il 38,7% */
        const gg = p(t, 22.2, 23) * c1 * (1 - p(t, 26, 26.6)), gf = p(t, 23, 24.4, E.io);
        if (gg > 0.004) o += gauge([[0, 0.387 * gf, C.A]], gg) + tx(GGX + GGW + 12, GGB - GGH + 14, 'tutto *B*', { size: 20, ta: 'start', op: gg }) + tx(GGX + GGW + 12, GGB - 0.387 * GGH / 2 + 8, '38,7%', { size: 24, fill: C.A, ta: 'start', op: gg * gf });
        /* il misuratore dell'errore: 38,7% + 10,7% */
        const eg = p(t, 29, 29.8) * c1 * (1 - p(t, 32.4, 33)), ef = p(t, 29.8, 31.2, E.io);
        if (eg > 0.004) {
          o += gauge([[0, 0.387, C.A], [0.387, 0.387 + 0.107 * ef, NO]], eg) + tx(GGX + GGW + 12, GGB - GGH + 14, 'tutto *B*', { size: 20, ta: 'start', op: eg }) + tx(GGX + GGW + 12, GGB - 0.494 * GGH * ef + 8 + 8, '49,4%', { size: 24, fill: NO, ta: 'start', op: eg * ef });
          o += on(ef, cross(GGX + GGW + 100, GGB - 70, 22, p(t, 31, 31.8, E.lin), { op: eg }));
        }
        const pe = p(t, 31.2, 32) * c1 * (1 - p(t, 32.6, 33.1));
        o += on(pe, pills(338, [{ s: '*A* non è dentro *B*: si divide *P*(*A* ∩ *B*), non *P*(*A*)', op: pe }]));
      }

      /* capitolo 2b: la coda, A ⊆ B */
      const c2 = vis(t, 33.8, 57.4, 0.6, 0.01);
      if (c2 > 0.004) {
        const fn = (x) => npdf(x, 50, 8), bu = p(t, 34, 35);
        o += on(bu, path(areaD(fn, 28, 76, I2X, I2Y, I2B, 90), { fill: C.A, fo: 0.14 * bu, op: c2 }) + path(curve(fn, 28, 76, I2X, I2Y, 90), { stroke: C.A, sw: 3, lc: 'round', op: c2 }));
        o += g({ op: bu * c2 }, ln(I2X(26), I2B, I2X(78), I2B, { stroke: C.soft, sw: 1.8 }) + [30, 40, 50, 60, 70].map((x) => ln(I2X(x), I2B, I2X(x), I2B + 6, { stroke: C.soft, sw: 1.8 }) + tx(I2X(x), I2B + 26, x, { ff: SANS, size: 17, fill: x >= 60 && t > 36 ? C.ink : C.soft })).join('') + tx(I2X(78) + 8, I2B + 26, 'min', { ff: SANS, size: 17, fill: C.soft, ta: 'start' }));
        const rb = p(t, 36, 37) * c2, ra = p(t, 38.4, 39.4) * c2;
        o += on(rb, path(areaD(fn, 60, 78, I2X, I2Y, I2B, 40), { fill: C.hi, fo: 0.45 * rb }) + ln(I2X(60), I2B, I2X(60), I2Y(fn(60)), { stroke: C.hi, sw: 2.2, da: '4 4', op: rb }));
        o += on(ra, path(areaD(fn, 70, 78, I2X, I2Y, I2B, 30), { fill: C.A, fo: 0.8 * ra }) + ln(I2X(70), I2B, I2X(70), I2Y(fn(70)), { stroke: C.A, sw: 2.2, da: '4 4', op: ra }));
        const g1 = vis(t, 34.4, 40.4, 0.4, 0.4) * c2, g2 = vis(t, 40.8, 47.6, 0.4, 0.4) * c2, g3 = p(t, 48, 48.8) * c2;
        o += on(g1, tx(300, 118, '*B* = {*X* > 60},   *A* = {*X* > 70}', { size: 24, op: g1 }));
        o += on(g2, tx(300, 104, '*A* ⊆ *B*, quindi *A* ∩ *B* = *A*', { size: 22, op: g2 }) + tx(300, 132, '*P*(*A* | *B*) = (1 − Φ(2,5)) / (1 − Φ(1,25))', { size: 22, op: p(t, 43.8, 44.6) * g2 }));
        o += on(g3, txc(300, 118, [['*P*(*A* | *B*) = 0,0062 / 0,1056 ≈ ', C.ink], ['0,059', OK]], { size: 26, op: g3 }));
        const zr = p(t, 38.6, 39.4) * c2 * (1 - p(t, 50.4, 51.2));
        o += on(zr, g({ op: zr }, ln(I2X(26), 300, I2X(78), 300, { stroke: C.soft, sw: 1.8 }) + [[60, 1.25], [70, 2.5]].map(([x, z]) => ln(I2X(x), 300, I2X(x), 306, { stroke: C.soft, sw: 1.8 }) + tx(I2X(x), 326, nc(z, z === 2.5 ? 1 : 2), { ff: SANS, size: 17, fill: C.B })).join('') + tx(I2X(26) - 6, 326, '*z*', { size: 20, fill: C.B, ta: 'end' })));
        const gg = p(t, 46, 46.8) * c2, gf = p(t, 46.8, 48.2, E.io);
        if (gg > 0.004) o += gauge([[0, 0.0587 * gf, C.A]], gg) + tx(GGX + GGW + 12, GGB - GGH + 14, 'tutto *B*', { size: 20, ta: 'start', op: gg }) + tx(GGX + GGW + 12, GGB - 0.0587 * GGH / 2 + 8 - 14, '5,9%', { size: 24, fill: C.A, ta: 'start', op: gg * gf });
        const pl = p(t, 51.4, 52.2) * c2;
        o += on(pl, pills(338, [{ s: 'prima 0,6%, ora 5,9%: i 60 minuti già passati contano', op: pl }]));
      }
      return o;
    },
  });

  /* ======================================================================
     3.9 · Funzione caratteristica: il baricentro di punti sul cerchio
     ====================================================================== */
  const PCX = 450, PCY = 210, PR = 92, TAU = 2 * Math.PI;
  const PX = (re) => PCX + PR * re, PY = (im) => PCY - PR * im; // piano complesso: parte reale, immaginaria → pixel
  const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const cexp = (z) => { const r = Math.exp(z[0]); return [r * Math.cos(z[1]), r * Math.sin(z[1])]; };
  const cpow = (z, n) => { const r = Math.hypot(z[0], z[1]) ** n, a = Math.atan2(z[1], z[0]) * n; return [r * Math.cos(a), r * Math.sin(a)]; };
  /* il piano: circonferenza di raggio 1, assi, 1, −1, i, −i; disc = opacità del cerchio pieno */
  const plane = (op, disc = 0, axl = true) => g({ op }, (disc > 0 ? circ(PCX, PCY, PR, { fill: C.A, fo: 0.07 * disc }) : '') + circ(PCX, PCY, PR, { stroke: C.soft, sw: 1.8 }) + ln(PX(-1.22), PCY, PX(1.22), PCY, { stroke: C.soft, sw: 1.3 }) + ln(PCX, PY(-1.22), PCX, PY(1.22), { stroke: C.soft, sw: 1.3 })
    + tx(PX(1) + 6, PCY + 20, '1', { ff: SANS, size: 17, fill: C.soft, ta: 'start' }) + tx(PX(-1) - 6, PCY + 20, '−1', { ff: SANS, size: 17, fill: C.soft, ta: 'end' }) + tx(PCX + 10, PY(1) - 6, '*i*', { ff: SANS, size: 17, fill: C.soft, ta: 'start' }) + tx(PCX + 10, PY(-1) + 22, '−*i*', { ff: SANS, size: 17, fill: C.soft, ta: 'start' })
    + (axl ? tx(PX(1.22) + 4, PCY - 8, 'Re', { ff: SANS, size: 17, fill: C.soft, ta: 'start' }) + tx(PCX - 8, PY(1.22) - 4, 'Im', { ff: SANS, size: 17, fill: C.soft, ta: 'end' }) : ''));
  /* cursore di t: riga con la manopola; frac in [0,1] */
  const tdial = (x0, x1, y, frac, op, lab) => g({ op }, ln(x0, y, x1, y, { stroke: C.soft, sw: 2 }) + circ(lerp(x0, x1, frac), y, 7, { fill: C.hi, stroke: C.ink, sw: 1.6 }) + tx(x0 - 12, y + 7, '*t*', { size: 24, ta: 'end' }) + tx(x0, y + 28, lab, { ff: SANS, size: 17, fill: C.soft, ta: 'start' }));
  const arcD = (t1, n = 60) => { let d = ''; for (let i = 0; i <= n; i++) { const a = (t1 * i) / n; d += (i ? 'L' : 'M') + f(PX(Math.cos(a))) + ' ' + f(PY(Math.sin(a))); } return d; };
  const TRACE = (fn, a, b, n = 120) => { let d = ''; for (let i = 0; i <= n; i++) { const z = fn(lerp(a, b, i / n)); d += (i ? 'L' : 'M') + f(PX(z[0])) + ' ' + f(PY(z[1])); } return d; };
  const phiCoin = (t) => [(1 + Math.cos(t)) / 2, Math.sin(t) / 2]; // φ della moneta: (1 + e^{it})/2
  const phiUnif = (t) => (t < 1e-6 ? [1, 0] : [Math.sin(t) / t, (1 - Math.cos(t)) / t]); // φ di U(0,1): (e^{it} − 1)/(it)
  const CLOUD = [-2.3, -0.6, 0.2, 0.9, 1.7, 3.1, -7.5, 24, -45, 0.4, 8.4, -1.4]; // dodici valori di una legge con le code pesanti

  PV.add('caratteristica', {
    sec: '3.36',
    short: 'La funzione caratteristica',
    title: 'La funzione caratteristica φ(t) = E[e^{itX}]: il baricentro di punti sul cerchio',
    alt: 'Animazione: e^{iθ} è un punto che gira sulla circonferenza di raggio 1; la funzione caratteristica di X è la media dei punti e^{itx}, pesata con le probabilità, cioè un baricentro: per una moneta il baricentro dei punti 1 ed e^{it} disegna una circonferenza al variare di t, e vale 1 in t = 0 e 0 in t = π; per un’uniforme su [0, 1] i punti riempiono un arco e il baricentro disegna una curva con anelli sempre più piccoli; poiché ogni punto sta sul cerchio, la media esiste sempre, anche per leggi senza valore atteso.',
    dur: 61,
    poster: 24,
    chap: [[0, 'Un punto che gira'], [13.6, 'Una moneta: il baricentro di due punti'], [33.6, 'Un’uniforme: il baricentro di un arco'], [53, 'Esiste sempre']],
    caps: [
      [0, 'Un numero complesso è un punto del piano. *e*^{iθ} sta sulla circonferenza di raggio 1, all’angolo θ: gira in cerchio, sempre a distanza 1.'],
      [13.6, 'Una moneta: *X* vale 0 o 1 con probabilità 1/2. Il valore 0 dà il punto 1, il valore 1 dà *e*^{it}: con *t* = 0 coincidono e φ(0) = 1.'],
      [20.9, 'φ(*t*) è la media dei due punti, pesata con le probabilità: il baricentro, a metà della corda.'],
      [26.1, 'A *t* = π i punti sono opposti e φ = 0. Poi il baricentro torna in 1 disegnando una circonferenza, sempre dentro il cerchio: |φ| ≤ 1.'],
      [33.6, 'Per un’uniforme su [0, 1] i punti *e*^{itx} riempiono un arco che va dall’angolo 0 all’angolo *t*.'],
      [39, 'φ(*t*) è il baricentro dell’arco, (*e*^{it} − 1)/(*it*). Con *t* = 2π l’arco copre tutto il cerchio: il baricentro è il centro, φ = 0.'],
      [46.4, 'Al crescere di *t* il baricentro gira con anelli sempre più piccoli: la curva è l’impronta della legge.'],
      [53, 'Esiste sempre: ogni punto *e*^{itX} sta sul cerchio, quindi la loro media non può uscirne, anche per la Cauchy, che non ha valore atteso.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 13.2, 'Un punto che gira', 'un numero complesso è un punto del piano') + heading(t, 13.8, 33.2, 'Una moneta: il baricentro di due punti', 'φ(*t*) = *E*[' + sp('e', 'itX') + '] = ½ · 1 + ½ · ' + sp('e', 'it')) + heading(t, 33.8, 52.6, 'Un’uniforme: il baricentro di un arco', 'φ(*t*) = *E*[' + sp('e', 'itX') + '], con *X* uniforme su [0, 1]') + heading(t, 53.2, 61.4, 'Esiste sempre', 'la media di punti del cerchio non esce dal cerchio');

      /* il piano resta fermo per tutto il video */
      const pu = p(t, 0.4, 1.6), disc = p(t, 31.6, 32.4) * (1 - p(t, 33, 33.6)) + p(t, 52.8, 53.8);
      o += plane(pu, Math.max(disc, 0));

      /* capitolo 1: e^{iθ} gira */
      const c1 = vis(t, 0.3, 13.6, 0.6, 0.6);
      if (c1 > 0.004) {
        const th = TAU * seg(t, 3.6, 10.6), P = [Math.cos(th), Math.sin(th)];
        const pp = p(t, 3, 3.6) * c1;
        if (pp > 0.004) {
          o += ln(PX(0), PY(0), PX(P[0]), PY(P[1]), { stroke: C.B, sw: 2.4, op: pp });
          o += path(arcD(th, 40), { stroke: C.B, sw: 2.4, so: 0.4 * pp, lc: 'round', op: 1 });
          o += ln(PX(P[0]), PY(P[1]), PX(P[0]), PY(0), { stroke: C.A, sw: 2, da: '4 4', op: pp }) + ln(PX(P[0]), PY(P[1]), PX(0), PY(P[1]), { stroke: C.B, sw: 2, da: '4 4', op: pp });
          o += circ(PX(P[0]), PY(0), 4.5, { fill: C.A, op: pp }) + circ(PX(0), PY(P[1]), 4.5, { fill: C.B, op: pp }) + circ(PX(P[0]), PY(P[1]), 7, { fill: C.hi, stroke: C.ink, sw: 1.8, op: pp });
        }
        const fm = p(t, 2, 2.8) * c1;
        o += on(fm, txc(30, 138, [['*e*^{iθ} = ', C.ink], ['cos *θ*', C.A], [' + *i* ', C.ink], ['sin *θ*', C.B]], { size: 24, ta: 'start', op: fm }));
        const rd = p(t, 3.4, 4) * c1;
        o += on(rd, tx(30, 188, 'θ = ' + nc(th, 1), { size: 26, ta: 'start', op: rd }) + tx(150, 188, nc((th * 180) / Math.PI, 0) + '°', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: rd }));
        const dm = p(t, 6, 6.8) * c1;
        o += on(dm, tx(30, 238, '|*e*^{iθ}| = 1', { size: 26, fill: OK, ta: 'start', op: dm }) + tx(30, 266, 'sempre a distanza 1', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: dm }));
        const ee = p(t, 11, 11.8) * c1;
        o += on(ee, tx(30, 312, 'non cresce come *e*^{x}: gira', { size: 22, ta: 'start', op: ee }));
      }

      /* capitolo 2: la moneta, due punti */
      const c2 = vis(t, 13.8, 33.4, 0.6, 0.6);
      if (c2 > 0.004) {
        const lp = p(t, 14, 15) * c2;
        /* la legge di X: due barre da 1/2 */
        o += on(lp, g({ op: lp }, tx(150, 112, 'legge di *X*', { ff: SANS, size: 17, fill: C.soft }) + ln(60, 200, 250, 200, { stroke: C.soft, sw: 1.8 }) + rect(80, 140, 36, 60, { rx: 3, fill: C.A, fo: 0.8 }) + rect(180, 140, 36, 60, { rx: 3, fill: C.B, fo: 0.8 }) + tx(98, 132, '1/2', { size: 20 }) + tx(198, 132, '1/2', { size: 20 }) + tx(98, 224, '0', { ff: SANS, size: 17, fill: C.soft }) + tx(198, 224, '1', { ff: SANS, size: 17, fill: C.soft })));
        const ft = p(t, 15, 16) * c2;
        o += on(ft, tx(150, 258, 'φ(*t*) = ½ · 1 + ½ · ' + sp('e', 'it'), { size: 22, op: ft }));
        const tt = t < 17 ? 0 : t < 24.2 ? Math.PI * seg(t, 17, 24.2) : t < 26.4 ? Math.PI : t < 31 ? Math.PI + Math.PI * seg(t, 26.4, 31) : TAU;
        const A = [1, 0], B = [Math.cos(tt), Math.sin(tt)], M = phiCoin(tt);
        const pa = p(t, 15.4, 16.2) * c2;
        if (pa > 0.004) {
          const tr = p(t, 18.4, 19.2) * c2;
          o += on(tt > 0.02, path(TRACE(phiCoin, 0, tt, 100), { stroke: C.hi, sw: 3, lc: 'round', op: c2 }));
          o += ln(PX(A[0]), PY(A[1]), PX(B[0]), PY(B[1]), { stroke: C.soft, sw: 1.8, da: '5 4', op: pa * (tt > 0.02 ? 1 : 0) });
          o += circ(PX(A[0]), PY(A[1]), 8, { fill: C.A, stroke: C.paper, sw: 1.6, op: pa }) + circ(PX(B[0]), PY(B[1]), 8, { fill: C.B, stroke: C.paper, sw: 1.6, op: pa });
          o += on(tr, circ(PX(M[0]), PY(M[1]), 8, { fill: C.hi, stroke: C.ink, sw: 2, op: tr }));
        }
        const rd = p(t, 16.6, 17.4) * c2 * (1 - p(t, 31.2, 32));
        o += on(rd, tx(30, 292, '*t* = ' + nc(tt, 1), { size: 22, ta: 'start', op: rd }));
        o += on(rd, tdial(70, 290, 318, tt / TAU, rd, ''));
        const z0 = vis(t, 16.6, 19.2, 0.4, 0.4) * c2, z1 = vis(t, 24.4, 26.6, 0.4, 0.4) * c2, z2 = p(t, 31.4, 32.2) * c2;
        o += on(z0, tx(PX(0.92), PY(0) + 48, 'φ(0) = 1', { size: 22, ta: 'end', op: z0 }));
        o += on(z1, tx(PX(0), PY(0) + 36, 'φ(π) = 0', { size: 22, op: z1 }));
        o += on(z2, pills(338, [{ s: 'φ percorre una circonferenza: sempre dentro il cerchio, |φ| ≤ 1', op: z2 }]));
      }

      /* capitolo 3: l'uniforme su [0, 1], un arco */
      const c3 = vis(t, 33.8, 52.8, 0.6, 0.6);
      if (c3 > 0.004) {
        const lp = p(t, 34, 35) * c3;
        o += on(lp, g({ op: lp }, tx(150, 112, 'legge di *X*', { ff: SANS, size: 17, fill: C.soft }) + ln(60, 200, 250, 200, { stroke: C.soft, sw: 1.8 }) + rect(80, 140, 140, 60, { rx: 3, fill: C.A, fo: 0.35, stroke: C.A, sw: 1.8 }) + tx(80, 224, '0', { ff: SANS, size: 17, fill: C.soft }) + tx(220, 224, '1', { ff: SANS, size: 17, fill: C.soft }) + tx(150, 177, 'densità 1', { size: 20 })));
        const ft = p(t, 35, 36) * c3;
        o += on(ft, tx(150, 258, 'φ(*t*) = (' + sp('e', 'it') + ' − 1)/(*it*)', { size: 22, op: ft }));
        const tt = t < 34.8 ? 0 : t < 40 ? TAU * seg(t, 34.8, 40) : t < 42 ? TAU : TAU + TAU * seg(t, 42, 46.4);
        const M = phiUnif(tt);
        const ar = p(t, 35, 36) * c3;
        if (ar > 0.004 && tt > 0.01) {
          o += path(arcD(tt, Math.max(8, Math.round(tt * 14))), { stroke: C.A, sw: 3.4, lc: 'round', op: 0.85 * ar });
          for (let k = 0; k < 28; k++) { const a = (tt * (k + 0.5)) / 28; o += circ(PX(Math.cos(a)), PY(Math.sin(a)), 3.4, { fill: C.A, stroke: C.paper, sw: 1, op: ar }); }
          o += path(TRACE(phiUnif, 0, tt, Math.max(12, Math.round(tt * 22))), { stroke: C.hi, sw: 3, lc: 'round', op: ar });
          o += circ(PX(M[0]), PY(M[1]), 8, { fill: C.hi, stroke: C.ink, sw: 2, op: ar });
        }
        o += on(ar, tx(30, 292, '*t* = ' + nc(tt, 1), { size: 22, ta: 'start', op: ar }) + tdial(70, 290, 318, tt / (2 * TAU), ar, ''));
        const z1 = vis(t, 40.2, 42.2, 0.4, 0.4) * c3;
        o += on(z1, tx(PX(0), PY(0) + 36, 'φ(2π) = 0', { size: 22, op: z1 }));
      }

      /* capitolo 4: la media esiste sempre, anche per le code pesanti */
      const c4 = vis(t, 53.2, 61.4, 0.6, 0.01);
      if (c4 > 0.004) {
        const LX = (x) => 175 + 13 * Math.max(-10.5, Math.min(10.5, x)), LY = 200, tt = 1.3;
        o += g({ op: c4 }, tx(175, 112, 'valori di *X*', { ff: SANS, size: 17, fill: C.soft }) + ln(30, LY, 320, LY, { stroke: C.soft, sw: 1.8 }));
        const wr = p(t, 58.2, 60.4, E.io);
        let mx = 0, my = 0;
        CLOUD.forEach((x, k) => {
          const u = p(t, 54 + 0.22 * k, 54.5 + 0.22 * k, E.back), a = x * tt;
          const cx = PX(Math.cos(a)), cy = PY(Math.sin(a));
          mx += Math.cos(a) / CLOUD.length;
          my += Math.sin(a) / CLOUD.length;
          const px = lerp(LX(x), cx, wr), py = lerp(LY, cy, wr);
          if (u > 0.004) o += circ(px, py, 5.5 * u, { fill: C.A, stroke: C.paper, sw: 1.2, op: c4 });
          if (Math.abs(x) > 10.5 && u > 0.9 && wr < 0.5) o += tx(LX(x) + (x > 0 ? -2 : 2), LY - 14, (x < 0 ? '← −' : '') + Math.abs(x) + (x > 0 ? ' →' : ''), { ff: SANS, size: 17, fill: C.soft, ta: x > 0 ? 'end' : 'start', op: c4 * (1 - wr) });
        });
        const mm_ = p(t, 59.8, 60.6) * c4;
        o += on(mm_, circ(PX(mx), PY(my), 8, { fill: C.hi, stroke: C.ink, sw: 2, op: mm_ }) + tx(PX(mx) - 14, PY(my) + 34, 'φ(*t*)', { size: 22, ta: 'end', op: mm_ }));
        const pl = p(t, 56, 56.8) * c4 * (1 - p(t, 60.6, 61.2));
        o += on(pl, pills(338, [{ s: '|φ(*t*)| ≤ 1 per ogni *t*', op: pl }], 190));
      }
      return o;
    },
  });

  /* ======================================================================
     3.9 · Le proprietà di φ: aX + b, somma di indipendenti = prodotto, derivate in 0, unicità
     ====================================================================== */
  const cdot = (z, r, col, op = 1, a = {}) => circ(PX(z[0]), PY(z[1]), r, { fill: col, stroke: C.paper, sw: 1.6, op, ...a });
  const phiPoi = (lam) => (t) => cexp([lam * (Math.cos(t) - 1), lam * Math.sin(t)]); // φ della Poisson(λ)
  const phi2 = (t) => cmul(phiCoin(t), phiCoin(t)); // due monete indipendenti: il quadrato
  const PTS = (a) => [Math.cos(a), Math.sin(a)];
  const cd = (z) => [z[0], z[1]];
  const cavg = (arr) => { let x = 0, y = 0, w = 0; arr.forEach(([z, wt]) => { x += z[0] * wt; y += z[1] * wt; w += wt; }); return [x / w, y / w]; };

  PV.add('phiprop', {
    sec: '3.36',
    short: 'Le proprietà di φ',
    title: 'Le proprietà della funzione caratteristica: perché valgono',
    alt: 'Animazione: spostare X di b ruota tutti i punti e^(itx) dell’angolo tb, moltiplicare X per a li porta ad angoli a volte più grandi; per due monete indipendenti il baricentro dei punti 1, i, −1 con pesi 1/4, 1/2, 1/4 coincide con il prodotto ((1 + i)/2)² = i/2, perché moltiplicare numeri complessi somma gli angoli e moltiplica le distanze: φ della somma è il prodotto delle φ; la derivata in 0 è la velocità con cui φ parte da 1 e vale i volte la media.',
    dur: 51,
    poster: 26,
    chap: [[0, 'Spostare e scalare'], [11.4, 'Somma di indipendenti = prodotto'], [36.6, 'Le derivate in 0']],
    caps: [
      [0, 'Spostare *X* di *b* ruota i punti dell’angolo *tb*, e con loro la media: φ_{X+b}(*t*) = *e*^{itb} φ_X(*t*).'],
      [5.6, 'Moltiplicare *X* per *a* porta i punti ad angoli *a* volte più grandi: φ_{aX}(*t*) = φ_X(*at*).'],
      [11.4, 'Con *t* = π/2 una moneta ha i punti 1 e *i*, e φ è la loro media, (1 + *i*)/2: distanza 0,71, angolo 45°.'],
      [17.2, 'Due monete, *X*₁ + *X*₂: i valori 0, 1, 2 danno i punti 1, *i*, −1 con pesi 1/4, 1/2, 1/4. Il baricentro è *i*/2.'],
      [23.4, 'Si ottiene lo stesso moltiplicando: ((1 + *i*)/2)² = *i*/2. Fra complessi gli angoli si sommano e le distanze si moltiplicano.'],
      [30.2, 'Per variabili indipendenti φ_{X+Y}(*t*) = φ_X(*t*) · φ_Y(*t*), per ogni *t*: è la proprietà che giustifica tutto lo strumento.'],
      [36.6, 'Le derivate in 0 danno i momenti: φ′(0) = *iE*[*X*]. Partendo da 1, il baricentro si muove con velocità *E*[*X*]: 1/2 per una moneta, 1 per due.'],
      [44.6, 'In generale φ^{(k)}(0) = *i*^k *E*[*X*^k]; per *k* = 2, φ″(0) = −*E*[*X*²].'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 11.2, 'Spostare e scalare', 'φ_{aX+b}(*t*) = ' + sp('e', 'itb') + ' φ_X(*at*)') + heading(t, 11.8, 36.2, 'Somma di indipendenti = prodotto', 'φ_{X+Y}(*t*) = φ_X(*t*) · φ_Y(*t*)') + heading(t, 36.8, 50.6, 'Le derivate in 0 sono i momenti', 'φ′(0) = *iE*[*X*],   φ″(0) = −*E*[*X*²]');
      o += plane(p(t, 0.4, 1.4), 0, !(t > 36.8 && t < 50.8));

      /* capitolo 1: aX + b sulla moneta, con t fissato (1,1 rad) */
      const c1 = vis(t, 0.3, 11.4, 0.6, 0.6);
      if (c1 > 0.004) {
        const t0 = 1.1, A = [1, 0], arcA = path(arcD(t0, 24), { stroke: C.soft, sw: 2, so: 0.9, op: c1 });
        const di = vis(t, 0.8, 6, 0.5, 0.5) * c1, dii = vis(t, 6.2, 11.2, 0.5, 0.5) * c1;
        if (di > 0.004) {
          const u = p(t, 2.2, 4.4, E.io), ang = t0 * u, A2 = PTS(ang), B2 = PTS(t0 + ang), M2 = cavg([[A2, 1], [B2, 1]]);
          o += arcA + tx(PX(0.3) + 10, PY(0) - 22, '*t*', { size: 22, op: di });
          o += ln(PX(A2[0]), PY(A2[1]), PX(B2[0]), PY(B2[1]), { stroke: C.soft, sw: 1.8, da: '5 4', op: di });
          o += path(TRACE((a) => cmul(cexp([0, a]), phiCoin(t0)), 0, ang, 40), { stroke: C.hi, sw: 3, lc: 'round', op: di });
          o += cdot(A2, 8, C.A, di) + cdot(B2, 8, C.B, di) + circ(PX(M2[0]), PY(M2[1]), 8, { fill: C.hi, stroke: C.ink, sw: 2, op: di });
          o += tx(30, 142, '*Y* = *X* + 1', { size: 28, ta: 'start', op: di }) + on(p(t, 1.4, 2.2), tx(30, 182, 'ogni punto ruota di *t*', { size: 22, ta: 'start', op: di * p(t, 1.4, 2.2) })) + on(p(t, 3.8, 4.6), tx(30, 232, 'φ_Y(*t*) = ' + sp('e', 'it') + ' φ_X(*t*)', { size: 26, fill: C.B, ta: 'start', op: di * p(t, 3.8, 4.6) }));
        }
        if (dii > 0.004) {
          const u = p(t, 7.4, 9.6, E.io), ang = t0 + t0 * u, B2 = PTS(ang), M2 = cavg([[A, 1], [B2, 1]]);
          o += arcA + tx(PX(0.3) + 10, PY(0) - 22, '*t*', { size: 22, op: dii });
          o += path(arcD(ang, 40), { stroke: C.B, sw: 2.2, so: 0.5 * dii, lc: 'round' });
          o += ln(PX(A[0]), PY(A[1]), PX(B2[0]), PY(B2[1]), { stroke: C.soft, sw: 1.8, da: '5 4', op: dii });
          o += path(TRACE((a) => phiCoin(a), t0, ang, 40), { stroke: C.hi, sw: 3, lc: 'round', op: dii });
          o += cdot(A, 8, C.A, dii) + cdot(B2, 8, C.B, dii) + circ(PX(M2[0]), PY(M2[1]), 8, { fill: C.hi, stroke: C.ink, sw: 2, op: dii });
          o += tx(30, 142, '*Y* = 2*X*', { size: 28, ta: 'start', op: dii }) + on(p(t, 6.6, 7.4), tx(30, 182, 'l’angolo diventa 2*t*', { size: 22, ta: 'start', op: dii * p(t, 6.6, 7.4) })) + on(p(t, 9, 9.8), tx(30, 232, 'φ_Y(*t*) = φ_X(2*t*)', { size: 26, fill: C.B, ta: 'start', op: dii * p(t, 9, 9.8) }));
        }
      }

      /* capitolo 2: due monete, il baricentro e il prodotto (t = π/2), poi le curve */
      const c2 = vis(t, 11.8, 36.4, 0.6, 0.6);
      if (c2 > 0.004) {
        const I = [0, 1], N1 = [-1, 0], A = [1, 0], M1 = [0.5, 0.5], M = [0, 0.5];
        const ta_ = vis(t, 12, 17.4, 0.5, 0.5) * c2, tb_ = vis(t, 17.4, 23.4, 0.5, 0.5) * c2, tc_ = vis(t, 23.6, 30.2, 0.5, 0.5) * c2;
        /* a: una moneta, i punti 1 e i */
        const pa = vis(t, 12, 17.8, 0.5, 0.4) * c2;
        if (pa > 0.004) {
          o += ln(PX(1), PY(0), PX(0), PY(1), { stroke: C.soft, sw: 1.8, da: '5 4', op: pa });
          o += cdot(A, 8, C.A, pa) + cdot(I, 8, C.B, pa) + on(p(t, 14.4, 15.2), circ(PX(M1[0]), PY(M1[1]), 8, { fill: C.hi, stroke: C.ink, sw: 2, op: pa * p(t, 14.4, 15.2) }));
        }
        if (ta_ > 0.004) {
          o += tx(30, 134, 'moneta, *t* = π/2:', { size: 22, ta: 'start', op: ta_ });
          o += on(p(t, 12.6, 13.4), ln(30, 152, 50, 152, { stroke: C.A, sw: 3.6, op: ta_ * p(t, 12.6, 13.4) }) + tx(58, 158, '0 → punto 1,  peso ½', { size: 20, ta: 'start', op: ta_ * p(t, 12.6, 13.4) }));
          o += on(p(t, 13.4, 14.2), ln(30, 178, 50, 178, { stroke: C.B, sw: 3.6, op: ta_ * p(t, 13.4, 14.2) }) + tx(58, 184, '1 → punto *i*,  peso ½', { size: 20, ta: 'start', op: ta_ * p(t, 13.4, 14.2) }));
          o += on(p(t, 14.8, 15.6), tx(30, 222, 'φ₁ = (1 + *i*)/2', { size: 26, ta: 'start', op: ta_ * p(t, 14.8, 15.6) }));
          o += on(p(t, 15.8, 16.6), tx(30, 250, 'distanza 0,71, angolo 45°', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: ta_ * p(t, 15.8, 16.6) }));
        }
        /* b: due monete, tre punti con i pesi 1/4, 1/2, 1/4 */
        if (tb_ > 0.004) {
          o += cdot(A, 6.5, C.A, tb_) + cdot(I, 9, C.B, tb_) + cdot(N1, 6.5, C.C, tb_);
          o += on(p(t, 20.6, 21.4), circ(PX(M[0]), PY(M[1]), 8, { fill: C.hi, stroke: C.ink, sw: 2, op: tb_ * p(t, 20.6, 21.4) }));
          o += tx(30, 134, 'due monete, *X*₁ + *X*₂:', { size: 22, ta: 'start', op: tb_ });
          [['0 → 1,  peso ¼', C.A, 18.2], ['1 → *i*,  peso ½', C.B, 19], ['2 → −1,  peso ¼', C.C, 19.8]].forEach(([lab, col, t0], i) => (o += on(p(t, t0, t0 + 0.7), ln(30, 152 + 26 * i, 50, 152 + 26 * i, { stroke: col, sw: 3.6, op: tb_ * p(t, t0, t0 + 0.7) }) + tx(58, 158 + 26 * i, lab, { size: 20, ta: 'start', op: tb_ * p(t, t0, t0 + 0.7) }))));
          o += on(p(t, 21, 21.8), tx(30, 250, 'φ = ¼ · 1 + ½ · *i* − ¼ = *i*/2', { size: 22, ta: 'start', op: tb_ * p(t, 21, 21.8) }));
        }
        /* c: il prodotto, ((1+i)/2)² = i/2 */
        if (tc_ > 0.004) {
          const u = p(t, 25, 27.6, E.io), r = lerp(Math.SQRT1_2, 0.5, u), a = lerp(Math.PI / 4, Math.PI / 2, u);
          const rr = (v) => [lerp(Math.SQRT1_2, 0.5, v) * Math.cos(lerp(Math.PI / 4, Math.PI / 2, v)), lerp(Math.SQRT1_2, 0.5, v) * Math.sin(lerp(Math.PI / 4, Math.PI / 2, v))];
          o += circ(PX(M[0]), PY(M[1]), 8, { fill: C.hi, stroke: C.ink, sw: 2, op: tc_ });
          o += path(TRACE(rr, 0, u, 30), { stroke: C.C, sw: 2.6, da: '4 4', lc: 'round', op: tc_ });
          o += circ(PX(r * Math.cos(a)), PY(r * Math.sin(a)), 7.5, { fill: C.C, stroke: C.paper, sw: 1.6, op: tc_ });
          o += ln(PX(0), PY(0), PX(r * Math.cos(a)), PY(r * Math.sin(a)), { stroke: C.C, sw: 1.8, op: 0.6 * tc_ });
          o += tx(30, 134, 'prodotto: φ₁ · φ₁', { size: 22, ta: 'start', op: tc_ });
          o += on(p(t, 24.4, 25.2), tx(30, 172, 'angolo: 45° + 45° = 90°', { size: 22, ta: 'start', op: tc_ * p(t, 24.4, 25.2) }));
          o += on(p(t, 25.8, 26.6), tx(30, 204, 'distanza: 0,71 × 0,71 = 0,5', { size: 22, ta: 'start', op: tc_ * p(t, 25.8, 26.6) }));
          o += on(p(t, 27.6, 28.4), tx(30, 250, '((1 + *i*)/2)² = *i*/2  ✓', { size: 24, fill: OK, ta: 'start', op: tc_ * p(t, 27.6, 28.4) }) + tx(30, 276, 'come il baricentro dei tre punti', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: tc_ * p(t, 27.6, 28.4) }));
        }
        /* d: le curve al variare di t */
        const sd = p(t, 30.4, 31.2) * c2;
        if (sd > 0.004) {
          const tt = TAU * seg(t, 30.8, 34.8), P1 = phiCoin(tt), P2 = phi2(tt);
          o += path(TRACE(phiCoin, 0, TAU, 80), { stroke: C.B, sw: 1.8, so: 0.35, op: sd }) + path(TRACE(phi2, 0, TAU, 100), { stroke: C.A, sw: 1.8, so: 0.35, op: sd });
          o += path(TRACE(phiCoin, 0, tt, 80), { stroke: C.B, sw: 3, lc: 'round', op: sd }) + path(TRACE(phi2, 0, tt, 100), { stroke: C.A, sw: 3.4, lc: 'round', op: sd });
          o += cdot(P1, 7, C.B, sd) + cdot(P2, 8, C.A, sd);
          o += tx(30, 134, 'al variare di *t*:', { size: 22, ta: 'start', op: sd });
          o += ln(30, 158, 50, 158, { stroke: C.B, sw: 3.6, op: sd }) + tx(58, 164, 'una moneta, φ₁', { size: 20, ta: 'start', op: sd }) + ln(30, 184, 50, 184, { stroke: C.A, sw: 3.6, op: sd }) + tx(58, 190, 'due monete, φ₁²', { size: 20, ta: 'start', op: sd });
          o += tx(30, 250, '*t* = ' + nc(tt, 1), { size: 22, ta: 'start', op: sd });
        }
      }

      /* capitolo 3: la derivata in 0 è la velocità di partenza, cioè la media */
      const c3 = vis(t, 36.8, 50.8, 0.6, 0.2);
      if (c3 > 0.004) {
        o += path(TRACE(phiCoin, 0, TAU, 80), { stroke: C.B, sw: 3, op: c3 }) + path(TRACE(phi2, 0, TAU, 100), { stroke: C.A, sw: 3, op: c3 });
        const a1 = p(t, 38.6, 40, E.io), a2 = p(t, 41, 42.4, E.io);
        o += arrow(PX(1) + 7, PY(0), PX(1) + 7, PY(0.5), a1, C.B, c3 * a1, 3.4) + arrow(PX(1) - 5, PY(0), PX(1) - 5, PY(1), a2, C.A, c3 * a2, 3.4);
        o += circ(PX(1), PY(0), 6, { fill: C.paper, stroke: C.ink, sw: 2, op: c3 });
        o += on(a1, tx(PX(1) + 20, PY(0.25) + 6, '½', { size: 24, fill: C.B, ta: 'start', op: c3 * a1 }));
        o += on(a2, tx(PX(1) + 20, PY(0.85) + 6, '1', { size: 24, fill: C.A, ta: 'start', op: c3 * a2 }));
        const f1 = p(t, 37.4, 38.2) * c3, f2 = p(t, 40, 40.8) * c3, f3 = p(t, 42.4, 43.2) * c3;
        o += on(f1, tx(30, 134, 'φ′(0) = *iE*[*X*]', { size: 28, ta: 'start', op: f1 }));
        o += on(f2, ln(30, 170, 50, 170, { stroke: C.B, sw: 3.6, op: f2 }) + tx(58, 176, 'una moneta: *E* = ½', { size: 22, ta: 'start', op: f2 }));
        o += on(f3, ln(30, 204, 50, 204, { stroke: C.A, sw: 3.6, op: f3 }) + tx(58, 210, 'due monete: *E* = 1', { size: 22, ta: 'start', op: f3 }));
        const f4 = p(t, 44.8, 45.6) * c3;
        o += on(f4, tx(30, 262, 'φ″(0) = −*E*[*X*²]', { size: 24, ta: 'start', op: f4 }));
      }
      return o;
    },
  });

  /* ======================================================================
     3.9 · Gli strumenti per i teoremi limite: continuità di Lévy, lemma, sviluppo vicino a 0
     ====================================================================== */
  const NSB = [4, 8, 16, 64]; // binomiali Bin(n, 2/n) che tendono a Poisson(2)
  const binPmf = (n, k) => { const q = 2 / n; let c = 1; for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i; return c * q ** k * (1 - q) ** (n - k); };
  const poiPmf = (k) => { let f1 = 1; for (let i = 2; i <= k; i++) f1 *= i; return (Math.exp(-2) * 2 ** k) / f1; };
  const phiBin = (n) => (u) => cpow([1 - 2 / n + (2 / n) * Math.cos(u), (2 / n) * Math.sin(u)], n);
  const TS = Array.from({ length: 121 }, (_, i) => -Math.PI + (TAU * i) / 120);
  const BPTS = NSB.map((n) => TS.map((u) => phiBin(n)(u)));
  const PPTS = TS.map((u) => phiPoi(2)(u));
  const ptsD = (pts) => pts.map((z, i) => (i ? 'L' : 'M') + f(PX(z[0])) + ' ' + f(PY(z[1]))).join('');
  const LZ = [-0.0563, 0.1229]; // e^z, con z = 2(e^{iπ/2} − 1) = −2 + 2i
  const ZX = (re) => 320 + 200 * re, ZY = (im) => 300 - 200 * im; // piano ingrandito per il lemma
  const zbase = (n) => [1 - 2 / n, 2 / n]; // 1 + z/n
  const RX = (u) => 320 + 88 * u, RY = (v) => 250 - 150 * v; // le curve reali cos(t/√n)^n

  PV.add('philimite', {
    sec: '4.33',
    short: 'I tre strumenti della dimostrazione del teorema limite centrale',
    title: 'Gli strumenti per i teoremi limite: continuità di Lévy, il lemma e lo sviluppo vicino a 0',
    alt: 'Animazione: le binomiali Bin(n, 2/n) tendono alla Poisson(2) e le loro funzioni caratteristiche, curve nel piano complesso, si srotolano fino a quella della Poisson; a t fissato, φ_n(t) = (1 + z/n)^n è un cammino di n passi che arriva in e^z; infine, per le monete ±1, φ vicino a 0 è 1 − t²/2 e cos(t/√n)^n si avvicina a e^(−t²/2), la φ della normale standard: lo schema del teorema limite centrale.',
    dur: 60,
    poster: 15,
    chap: [[0, 'Se le leggi convergono, convergono le φ'], [20.2, 'Il lemma sul limite'], [39.4, 'Verso il teorema limite centrale']],
    caps: [
      [0, 'Se le leggi delle *X*_n convergono a quella di *X*, le funzioni caratteristiche φ_n(*t*) convergono a φ(*t*), per ogni *t*.'],
      [6.4, 'Esempio: la binomiale (*n*, 2/*n*) tende alla Poisson(2). Le colonne si assestano e, nel piano, la curva di φ_n si srotola fino a quella della Poisson.'],
      [14.8, 'Lévy dice anche il contrario: se le φ_n convergono punto per punto, convergono le leggi.'],
      [20.2, 'A *t* fissato, per la binomiale φ_n(*t*) = (1 + *z*/*n*)^n con *z* = 2(*e*^{it} − 1): con *t* = π/2, *z* = −2 + 2*i*.'],
      [27.4, 'Moltiplicando *n* volte per (1 + *z*/*n*) si traccia un cammino che, per *n* grande, arriva in *e*^z: la φ della Poisson(2).'],
      [33.8, 'È il limite noto (1 + *x*/*n*)^n → *e*^x, esteso ai complessi. Per Lévy, la binomiale tende alla Poisson.'],
      [39.4, 'Vicino a 0 una φ con media 0 e varianza 1 è 1 − *t*²/2 + o(*t*²): per le monete ±1, φ(*t*) = cos *t*.'],
      [46.4, 'La somma standardizzata di *n* monete ha cos(*t*/√*n*)^n: al crescere di *n* la curva si avvicina a *e*^{−t²/2}, la φ della normale standard.'],
      [54.6, 'Sviluppo, lemma e Lévy insieme: è lo schema del teorema limite centrale (4.23).'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 19.8, 'Le φ seguono le leggi', 'Bin(*n*, 2/*n*) → Poisson(2): colonne e curve di φ_n') + heading(t, 20.6, 39, 'Il lemma: (1 + *z*/*n*)*^n* → *e**^z*', 'φ_n(*t*) a *t* = π/2: un cammino di *n* passi') + heading(t, 39.8, 60.4, 'Verso il teorema limite centrale', 'monete ±1, somma standardizzata: cos(*t*/√*n*)*^n*');

      /* capitolo 1: colonne e curve di φ_n */
      const c1 = vis(t, 0.3, 20, 0.6, 0.6);
      if (c1 > 0.004) {
        o += plane(p(t, 0.4, 1.4) * c1, 0);
        const si = kf(t, [[2.4, 0], [3.2, 0], [4.8, 1], [6.6, 1], [8.2, 2], [10, 2], [11.6, 3], [18, 3]]), a = Math.min(2, Math.floor(si)), fr_ = si - a === 0 && si >= 3 ? 0 : si - a, b = si >= 3 ? 3 : a + 1, aa = si >= 3 ? 3 : a;
        const n1 = NSB[aa], n2 = NSB[b], mix = si >= 3 ? 0 : fr_;
        const BXk = (k) => 50 + 34 * k, BB = 270, BH = (v) => 270 * v;
        o += g({ op: c1 * p(t, 0.4, 1.4) }, ln(36, BB, 290, BB, { stroke: C.soft, sw: 1.8 }) + [0, 1, 2, 3, 4, 5, 6, 7].map((k) => tx(BXk(k), BB + 24, k, { ff: SANS, size: 17, fill: C.soft })).join(''));
        const bu = p(t, 1.6, 2.6) * c1;
        if (bu > 0.004) {
          for (let k = 0; k < 8; k++) {
            const h = lerp(binPmf(n1, k), binPmf(n2, k), mix);
            o += rect(BXk(k) - 13, BB - BH(h) * bu, 26, BH(h) * bu, { rx: 2, fill: C.A, fo: 0.55, stroke: C.A, sw: 1.4, op: c1 });
            o += ln(BXk(k) - 15, BB - BH(poiPmf(k)), BXk(k) + 15, BB - BH(poiPmf(k)), { stroke: C.B, sw: 3, lc: 'round', op: c1 * bu });
          }
          o += tx(40, 130, '*n* = ' + (mix < 0.5 ? n1 : n2), { size: 30, ta: 'start', op: c1 * bu }) + tx(150, 118, 'colonne: Bin(*n*, 2/*n*)', { ff: SANS, size: 17, fill: C.A, ta: 'start', op: c1 * bu }) + tx(150, 140, 'tacche: Poisson(2)', { ff: SANS, size: 17, fill: C.B, ta: 'start', op: c1 * bu });
        }
        const cu = p(t, 2.6, 3.6) * c1;
        if (cu > 0.004) {
          const pts = BPTS[aa].map((z, i) => [lerp(z[0], BPTS[b][i][0], mix), lerp(z[1], BPTS[b][i][1], mix)]);
          o += path(ptsD(PPTS), { stroke: C.B, sw: 3, da: '7 5', op: c1 * cu }) + path(ptsD(pts), { stroke: C.A, sw: 3.2, lc: 'round', lj: 'round', op: c1 * cu });
        }
        const pl = vis(t, 16.2, 19.8, 0.5, 0.5) * c1;
        o += on(pl, pills(338, [{ s: 'φ_n(*t*) → φ(*t*) per ogni *t*  ⇔  *X*_n → *X* in legge', op: pl }]));
      }

      /* capitolo 2: (1 + z/n)^n → e^z */
      const c2 = vis(t, 20.6, 39, 0.6, 0.6);
      if (c2 > 0.004) {
        o += g({ op: c2 }, ln(ZX(-1.08), ZY(0), ZX(1.12), ZY(0), { stroke: C.soft, sw: 1.4 }) + ln(ZX(0), ZY(-0.12), ZX(0), ZY(1.1), { stroke: C.soft, sw: 1.4 }) + tx(ZX(1), ZY(0) + 22, '1', { ff: SANS, size: 17, fill: C.soft }) + tx(ZX(0) + 10, ZY(1) - 4, '*i*', { ff: SANS, size: 17, fill: C.soft, ta: 'start' }) + tx(ZX(1.12) + 2, ZY(0) - 8, 'Re', { ff: SANS, size: 17, fill: C.soft, ta: 'start' }));
        const tg = p(t, 22.6, 23.6) * c2;
        o += on(tg, circ(ZX(LZ[0]), ZY(LZ[1]), 9, { stroke: C.B, sw: 3, op: tg }) + tx(ZX(LZ[0]) + 16, ZY(LZ[1]) - 12, '*e**^z*', { size: 26, fill: C.B, ta: 'start', op: tg }));
        const STG = [[2, 23, 25.2], [4, 25.4, 27.6], [8, 27.8, 29.8], [16, 30, 32], [64, 32.2, 38.8]];
        STG.forEach(([n, ta, tb], i) => {
          const op = (i < 4 ? vis(t, ta - 0.1, tb, 0.3, 0.3) : p(t, ta, ta + 0.4)) * c2, pts = [];
          const bs = zbase(n);
          for (let k = 0; k <= n; k++) pts.push(cpow(bs, k));
          const u = p(t, ta, ta + 1.4, E.io), m = Math.max(1, Math.round(u * n));
          if (op > 0.004) {
            o += path(pts.slice(0, m + 1).map((z, j) => (j ? 'L' : 'M') + f(ZX(z[0])) + ' ' + f(ZY(z[1]))).join(''), { stroke: C.A, sw: 2.6, lc: 'round', lj: 'round', op });
            if (n <= 16) for (let k = 0; k <= m; k++) o += circ(ZX(pts[k][0]), ZY(pts[k][1]), 3.6, { fill: C.A, stroke: C.paper, sw: 1, op });
            const e_ = pts[m];
            o += circ(ZX(e_[0]), ZY(e_[1]), 7, { fill: C.hi, stroke: C.ink, sw: 1.8, op });
          }
        });
        const nl2 = p(t, 23, 23.6) * c2;
        o += on(nl2, tx(40, 142, '*n* = ' + (t < 25.3 ? 2 : t < 27.7 ? 4 : t < 29.9 ? 8 : t < 32.1 ? 16 : 64), { size: 30, ta: 'start', op: nl2 }));
        const fm = p(t, 21.4, 22.2) * c2 * (1 - p(t, 33.4, 34));
        o += on(fm, tx(40, 104, '*z* = 2(' + sp('e', 'it') + ' − 1) = −2 + 2*i*', { size: 20, ta: 'start', op: fm }));
        const f2 = p(t, 34.4, 35.2) * c2;
        o += on(f2, tx(40, 104, '(1 + *z*/*n*)*^n* → *e**^z*', { size: 24, ta: 'start', op: f2 }));
      }

      /* capitolo 3: cos(t/√n)^n → e^{−t²/2} */
      const c3 = vis(t, 39.8, 60.4, 0.6, 0.01);
      if (c3 > 0.004) {
        const RB = 250;
        o += g({ op: c3 }, ln(RX(-3.3), RB, RX(3.3), RB, { stroke: C.soft, sw: 1.8 }) + [-3, -2, -1, 0, 1, 2, 3].map((u) => ln(RX(u), RB, RX(u), RB + 6, { stroke: C.soft, sw: 1.8 }) + tx(RX(u), RB + 26, sn(u, 0), { ff: SANS, size: 17, fill: C.soft })).join('') + tx(RX(3.3) + 6, RB + 26, '*t*', { size: 20, fill: C.soft, ta: 'start' }));
        const ga = p(t, 46.2, 47.2) * c3;
        o += on(ga, path(curve((u) => Math.exp(-u * u / 2), -3.2, 3.2, RX, RY, 120), { stroke: C.B, sw: 3.4, da: '8 5', op: ga }));
        /* cos t e la parabola 1 − t²/2 vicino a 0 */
        const k0 = vis(t, 40.4, 46.4, 0.5, 0.6) * c3;
        if (k0 > 0.004) {
          const u = p(t, 40.8, 42.4, E.io);
          o += path(curve((x) => 1 - x * x / 2, -1.45, 1.45, RX, RY, 60), { stroke: C.B, sw: 2.6, da: '5 4', op: k0 * p(t, 42.4, 43.4) }) + path(curve(Math.cos, -1.6, 1.6, RX, RY, 80), { stroke: C.A, sw: 3.4, lc: 'round', op: k0, ...draw(u) });
          o += on(p(t, 43, 43.8), tx(RX(1.3), RY(0.7), 'cos *t* ≈ 1 − *t*²/2', { size: 22, ta: 'start', op: k0 * p(t, 43, 43.8) }));
        }
        /* le curve cos(t/√n)^n per n = 2, 4, 16, 64 */
        [[2, 46.4, 49.4], [4, 49.4, 52], [16, 52, 54.4], [64, 54.4, 60.4]].forEach(([n, ta, tb], i) => {
          const op = (i < 3 ? vis(t, ta - 0.1, tb + 0.5, 0.4, 0.5) : p(t, ta, ta + 0.5)) * c3;
          if (op < 0.004) return;
          o += path(curve((u) => Math.cos(u / Math.sqrt(n)) ** n, -3.2, 3.2, RX, RY, 140), { stroke: C.A, sw: 3.4, lc: 'round', op, ...draw(p(t, ta, ta + 1.2, E.io)) });
        });
        const nl3 = p(t, 46.4, 47) * c3;
        o += on(nl3, tx(40, 128, '*n* = ' + (t < 49.4 ? 2 : t < 52 ? 4 : t < 54.4 ? 16 : 64), { size: 30, ta: 'start', op: nl3 }));
        const lb2 = p(t, 56.4, 57.2) * c3;
        o += on(lb2, tx(RX(1.6), RY(0.6), '*e*^{−t²/2}', { size: 24, fill: C.B, ta: 'start', op: lb2 }) + tx(RX(1.6), RY(0.6) + 24, 'φ della normale', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: lb2 }));
      }
      return o;
    },
  });

})();
