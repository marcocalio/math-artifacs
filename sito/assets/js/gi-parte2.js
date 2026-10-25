/* gi-parte2.js — grafici interattivi della Parte 2 (generato da lavoro-probabilita/grafici/build.py: non modificare a mano) */

/* ---- correlazione.js (sezione 2.14) ---- */
(function () {
  'use strict';
  /* 2.14 · Il coefficiente di correlazione: ρ, la nuvola dei punti degli scarti e la varianza di X + Y */
  const { n, v } = GI;
  const { tx, rect, circ, ln, C } = GI.H;

  /* geometria del disegno (unità del viewBox) */
  const VW = 420, VH = 400; // il riquadro è quadrato: su telefono il disegno resta grande
  const FL = 62, FR = 392, FT = 28, FB = 358; // riquadro: sinistra, destra, alto, basso
  const CX = (FL + FR) / 2, CY = (FT + FB) / 2;
  const RW = 2.5; // semi-ampiezza del riquadro nelle unità di X e di Y: fissa, uguale sui due assi
  const K = (FR - FL) / 2 / RW; // pixel per unità
  const X = (x) => CX + x * K;
  const Y = (y) => CY - y * K;
  const SU = Math.sqrt(0.24); // l'urna di 2.4: σ² = 0,24 (σ ≈ 0,49)
  const NP = 200; // le coppie (x, y), tutte con probabilità 1/200

  /* La nuvola. Due liste di 200 numeri in (0, 1) con seme fisso; la prima si standardizza (media 0, varianza 1 sulle
     200 coppie equiprobabili); dalla seconda si toglie la parte lungo la prima (così le due sono incorrelate) e si
     standardizza. Poi X = σX·Z1 e Y = σY·(ρ·Z1 + √(1−ρ²)·Z2): la correlazione dei 200 punti è esattamente ρ. */
  function cloud(seed) {
    const r = GI.rng(seed), u1 = [], u2 = [];
    for (let i = 0; i < NP; i++) { u1.push(r()); u2.push(r()); }
    const mean = (a) => a.reduce((t, x) => t + x, 0) / a.length;
    const std = (a) => { const m = mean(a), sd = Math.sqrt(mean(a.map((x) => (x - m) ** 2))); return a.map((x) => (x - m) / sd); };
    const z1 = std(u1), m2 = mean(u2);
    const c = mean(z1.map((z, i) => z * (u2[i] - m2)));
    const z2 = std(u2.map((u, i) => u - m2 - c * z1[i]));
    return { z1, z2 };
  }
  const clampRho = (r) => Math.max(-1, Math.min(1, r));
  function points(s) {
    const rho = clampRho(s.rho), q = Math.sqrt(Math.max(0, 1 - rho * rho));
    const { z1, z2 } = cloud(s.seed || 1);
    return z1.map((z, i) => [s.sx * z, s.sy * (rho * z + q * z2[i])]);
  }

  /* le formule del testo, con i numeri dei comandi */
  function calc(s) {
    const rho = clampRho(s.rho), sx = s.sx, sy = s.sy;
    const A = sx * sx, B = sy * sy, cov = rho * sx * sy;
    return { rho, sx, sy, A, B, cov, vs: Math.max(0, A + B + 2 * cov) };
  }

  /* un numero della lettura: i decimali minimi (da 2 a 4) che lo rappresentano esattamente. Con ρ a passi di 0,05 e σ a passi
     di 0,1 (e con l'urna di 2.4, dove σ² = 0,24) ogni numero scritto è esatto, quindi le somme della lettura tornano al centesimo */
  const rd = (x, d) => (x < 0 ? -1 : 1) * Number(Math.abs(x).toFixed(d));
  const dg = (x) => {
    for (let d = 2; d <= 4; d++) if (Math.abs(x - rd(x, d)) < 1e-9) return d;
    return 3;
  };
  const ex = (x) => n(x, dg(x));

  const sg = (k) => `<var>σ</var><sub><var>${k}</var></sub>`;
  /* σ al quadrato con l'indice sotto l'apice (2 sopra, X sotto) */
  const sq = (k) => `<var>σ</var><span style="display:inline-block;vertical-align:middle;line-height:1;font-size:.72em;text-align:left"><span style="display:block">2</span><span style="display:block"><var>${k}</var></span></span>`;
  const par = (t) => (t.startsWith('−') ? '(' + t + ')' : t);

  GI.add('correlazione', {
    sec: '2.14',
    w: VW,
    h: VH,
    seeded: true,
    title: 'Che forma ha la nuvola per una data correlazione <var>ρ</var>?',
    alt: 'Nuvola di 200 punti in un riquadro con due assi che si incrociano al centro, dove stanno le medie di X e di Y, e quattro linee tratteggiate a più e meno σX e σY. I punti blu hanno il prodotto degli scarti positivo, cioè stanno nel quadrante in alto a destra o in basso a sinistra; quelli arancioni hanno il prodotto negativo. Con ρ vicino a 1 i punti si allineano lungo la diagonale crescente e sono quasi tutti blu; con ρ uguale a −1 stanno su una retta decrescente e sono tutti arancioni; con ρ uguale a 0 sono sparsi nei quattro quadranti. Muovendo σX e σY la nuvola si allarga o si stringe in orizzontale e in verticale senza cambiare ρ. Sotto il disegno sono scritti Var(X), Var(Y), Cov(X, Y) e Var(X + Y).',
    controls: [
      { id: 'rho', label: 'Correlazione <var>ρ</var>', min: -1, max: 1, step: 0.05, value: -0.25, fmt: (x) => n(x, 2) },
      { id: 'sx', label: 'Deviazione standard σ<sub><var>X</var></sub>', min: 0.3, max: 0.9, step: 0.01, value: SU, fmt: (x) => n(x, 2) },
      { id: 'sy', label: 'Deviazione standard σ<sub><var>Y</var></sub>', min: 0.3, max: 0.9, step: 0.01, value: SU, fmt: (x) => n(x, 2) },
    ],
    presets: [
      { label: 'Come l’urna di 2.4: ρ = −1/4', set: { rho: -0.25, sx: SU, sy: SU } },
      { label: 'Incorrelate: ρ = 0', set: { rho: 0, sx: 0.8, sy: 0.8 } },
      { label: 'Legame diretto: ρ = 0,8', set: { rho: 0.8, sx: 0.8, sy: 0.8 } },
      { label: 'Legame inverso: ρ = −0,8', set: { rho: -0.8, sx: 0.8, sy: 0.8 } },
      { label: 'Lineare perfetta: ρ = 1', set: { rho: 1, sx: 0.8, sy: 0.8 } },
    ],
    caption: 'Ogni punto è una coppia di scarti (<var>X</var> − <var>μ</var><sub><var>X</var></sub>, <var>Y</var> − <var>μ</var><sub><var>Y</var></sub>): le 200 coppie hanno la stessa probabilità, 1/200, e il centro del riquadro è il punto delle medie. Blu: il prodotto degli scarti è positivo (stesso segno); arancione: è negativo (segni opposti). Le linee tratteggiate sono a ±σ<sub><var>X</var></sub> e ±σ<sub><var>Y</var></sub>, con la stessa scala sui due assi. Cov(<var>X</var>, <var>Y</var>) è la media di quei prodotti e <var>ρ</var> è Cov divisa per σ<sub><var>X</var></sub>σ<sub><var>Y</var></sub>. «Rilancia» cambia i punti, non <var>ρ</var>. Il primo pulsante ha σ<sup>2</sup> e <var>ρ</var> dell’urna di 2.4, ma qui i punti sono una nuvola, non le caselle dell’urna.',
    prove: [
      'Con <var>ρ</var> = 0,8 raddoppia σ<sub><var>X</var></sub> (per esempio da 0,3 a 0,6): la nuvola si allarga, ma che cosa succede a <var>ρ</var> e che cosa a Cov(<var>X</var>, <var>Y</var>)?',
      'Porta <var>ρ</var> a 1 e poi a −1: che cosa hanno in comune le due nuvole e in che cosa differiscono?',
    ],
    calc,
    points,
    render(s) {
      const c = calc(s), pts = points(s);
      let svg = '';

      // quadranti: tinta blu dove il prodotto x·y è positivo, arancione dove è negativo
      svg += rect(CX, FT, FR - CX, CY - FT, { fill: C.A, fo: 0.07 }) + rect(FL, CY, CX - FL, FB - CY, { fill: C.A, fo: 0.07 });
      svg += rect(FL, FT, CX - FL, CY - FT, { fill: C.B, fo: 0.07 }) + rect(CX, CY, FR - CX, FB - CY, { fill: C.B, fo: 0.07 });
      svg += rect(FL, FT, FR - FL, FB - FT, { stroke: C.soft, sw: 1.4 });
      svg += ln(FL, CY, FR, CY, { stroke: C.soft, sw: 1.2, so: 0.6 }) + ln(CX, FT, CX, FB, { stroke: C.soft, sw: 1.2, so: 0.6 });
      svg += tx(FR - 20, FT + 30, '+', { size: 30, fill: C.A, op: 0.7 }) + tx(FL + 20, FB - 12, '+', { size: 30, fill: C.A, op: 0.7 });
      svg += tx(FL + 20, FT + 30, '−', { size: 30, fill: C.B, op: 0.8 }) + tx(FR - 20, FB - 12, '−', { size: 30, fill: C.B, op: 0.8 });

      // ±σX e ±σY
      for (const g of [-1, 1]) {
        svg += ln(X(g * c.sx), FT, X(g * c.sx), FB, { stroke: C.soft, sw: 1.4, da: '6 4', so: 0.85 });
        svg += ln(FL, Y(g * c.sy), FR, Y(g * c.sy), { stroke: C.soft, sw: 1.4, da: '6 4', so: 0.85 });
      }

      // i 200 punti (mai fuori dal riquadro)
      for (const [x, y] of pts) {
        const px = Math.min(FR - 4, Math.max(FL + 4, X(x))), py = Math.min(FB - 4, Math.max(FT + 4, Y(y)));
        svg += circ(px, py, 3.2, { fill: x * y >= 0 ? C.A : C.B, fo: 0.85, stroke: C.paper, sw: 0.6 });
      }

      // nomi degli assi e delle linee tratteggiate
      svg += tx(FR, FB + 26, '*X* − *μ_X*', { size: 20, ta: 'end' }) + tx(FL, FT - 8, '*Y* − *μ_Y*', { size: 20, ta: 'start' });
      svg += tx(X(c.sx), FB + 26, '*σ_X*', { size: 20 }) + tx(FL - 8, Y(c.sy) + 7, '*σ_Y*', { size: 20, ta: 'end' });

      // lettura
      const nd = ex, ct = nd(c.cov), cp = par(ct);
      const eq = Math.abs(rd(c.rho, 2) * rd(c.sx, 2) * rd(c.sy, 2) - c.cov) < 1e-9 ? '=' : '≈';
      // con σ dell'urna (√0,24) e l'altra σ cambiata, Cov è un numero non esatto: la somma dei numeri scritti può differire di un millesimo dal totale
      const sm = Math.abs(rd(c.A, dg(c.A)) + rd(c.B, dg(c.B)) + 2 * rd(c.cov, dg(c.cov)) - rd(c.vs, dg(c.vs))) < 1e-9 ? '=' : '≈';
      const rho0 = Math.abs(c.rho) < 0.005, rho1 = Math.abs(c.rho) > 0.9999;
      let out = `<p>Var(${v('X')}) = ${sq('X')} = ${nd(c.A)} e Var(${v('Y')}) = ${sq('Y')} = ${nd(c.B)}. Covarianza: Cov(${v('X')}, ${v('Y')}) = ${v('ρ')} ${sg('X')} ${sg('Y')} = ${par(n(c.rho, 2))} · ${n(c.sx, 2)} · ${n(c.sy, 2)} ${eq} <span class="gi-hl">${ct}</span>.</p>
  <p>Var(${v('X')} + ${v('Y')}) = ${sq('X')} + ${sq('Y')} + 2${v('ρ')}${sg('X')}${sg('Y')} = ${nd(c.A)} + ${nd(c.B)} + 2 · ${cp} ${sm} <span class="gi-hl">${nd(c.vs)}</span>.</p>`;
      out += rho0
        ? `<p>Con ${v('ρ')} = 0 le varianze si sommano: Var(${v('X')} + ${v('Y')}) = ${sq('X')} + ${sq('Y')}.</p>`
        : `<p>Con ${v('ρ')} ${c.rho > 0 ? 'positivo la varianza della somma supera' : 'negativo la varianza della somma sta sotto'} ${sq('X')} + ${sq('Y')} = ${nd(c.A + c.B)}: gli scarti di ${v('X')} e di ${v('Y')} hanno ${c.rho > 0 ? 'spesso lo stesso segno e si rinforzano' : 'spesso segno opposto e si compensano'}.</p>`;
      if (rho1) out += `<p>Con ${v('ρ')} = ${c.rho > 0 ? '1' : '−1'} i punti stanno tutti su una retta ${c.rho > 0 ? 'crescente' : 'decrescente'}: ${v('Y')} = ${v('a')}${v('X')} + ${v('b')} con ${v('a')} ${c.rho > 0 ? '&gt;' : '&lt;'} 0.</p>`;
      return { svg, out };
    },
    selftest() {
      const W = GI.widgets.correlazione, d = GI.defaults(W), out = W.render(d).out;
      // statistiche calcolate direttamente dai punti, senza passare dalle formule di calc
      const st = (s) => {
        const Q = points(s), m = (f) => Q.reduce((t, q) => t + f(q), 0) / Q.length;
        const mx = m((q) => q[0]), my = m((q) => q[1]);
        const vx = m((q) => (q[0] - mx) ** 2), vy = m((q) => (q[1] - my) ** 2);
        const cv = m((q) => (q[0] - mx) * (q[1] - my));
        const ms = mx + my;
        return { mx, my, vx, vy, cv, rho: cv / Math.sqrt(vx * vy), vs: m((q) => (q[0] + q[1] - ms) ** 2), n: Q.length };
      };
      const a = st({ rho: 0.8, sx: 0.8, sy: 0.6, seed: 7 }), b = st({ rho: 0.8, sx: 0.8, sy: 0.8, seed: 1 }), u = st(d);
      const un = st({ rho: 1, sx: 0.8, sy: 0.8, seed: 3 }), mu = st({ rho: -1, sx: 0.8, sy: 0.8, seed: 3 });
      const p1 = points(d)[0], p2 = points({ ...d, seed: 2 })[0], p5 = points({ rho: 0.8, sx: 0.8, sy: 0.6, seed: 5 })[17];
      // la somma scritta nella lettura torna: A + B + 2·Cov = Var(X + Y), con i numeri mostrati
      // (tutti i 41 × 7 × 7 stati raggiungibili con i cursori, ρ a passi di 0,05 e σ a passi di 0,1)
      let somme = 0, stati = 0;
      const num = (t) => Number(t.replace('−', '-').replace(',', '.'));
      for (let i = 0; i <= 40; i++) for (let j = 0; j <= 6; j++) for (let k = 0; k <= 6; k++) {
        const s = GI.fromSlider(W.controls[0], -1 + i * 0.05), sx = GI.fromSlider(W.controls[1], 0.3 + j * 0.1), sy = GI.fromSlider(W.controls[2], 0.3 + k * 0.1);
        const ps = W.render({ rho: s, sx, sy, seed: 1 }).out.split('</p>').map((t) => (t.replace(/<[^>]*>/g, '').match(/−?\d+,\d+/g) || []).map(num));
        const [, [A, B, c1, t1]] = ps;
        stati++;
        if (!(Math.abs(A + B + 2 * c1 - t1) < 1e-9)) somme++;
      }
      // con una σ dell'urna (√0,24, non sul passo dei cursori) e l'altra cambiata, Cov non è esatta: se la somma scritta non torna, il segno prima del totale è ≈
      let segni = 0, approx = 0;
      for (let i = 0; i <= 40; i++) for (let j = 0; j <= 6; j++) {
        const rho = GI.fromSlider(W.controls[0], -1 + i * 0.05), sg = GI.fromSlider(W.controls[1], 0.3 + j * 0.1);
        for (const [sx, sy] of [[SU, sg], [sg, SU]]) {
          const par = W.render({ rho, sx, sy, seed: 1 }).out.split('</p>')[1];
          const [A, B, c1, t1] = (par.replace(/<[^>]*>/g, '').match(/−?\d+,\d+/g) || []).map(num);
          const atteso = Math.abs(A + B + 2 * c1 - t1) < 1e-9 ? '=' : '≈', scritto = par.match(/ (=|≈) <span class="gi-hl">/)[1];
          if (scritto !== atteso) segni++;
          if (scritto === '≈') approx++;
        }
      }
      return [
        // python3 -I -c "print(-0.25*0.24)"   (urna di 2.4: σ² = 0,24)
        ['Cov = ρσXσY dell’urna di 2.4 (valori predefiniti)', calc(d).cov, -0.06, 1e-12],
        // python3 -I -c "print(0.24+0.24+2*(-0.25*0.24))"
        ['Var(X + Y) dell’urna di 2.4', calc(d).vs, 0.36, 1e-12],
        // python3 -I -c "print(-0.06/0.24)"
        ['ρ dell’urna dai punti disegnati', u.rho, -0.25, 1e-12],
        ['Var(X + Y) dell’urna dai punti disegnati', u.vs, 0.36, 1e-12],
        // python3 -I -c "print(0.8*0.8*0.6)"
        ['Cov dei punti, ρ = 0,8, σ 0,8 e 0,6', a.cv, 0.384, 1e-12],
        ['ρ dei punti = 0,8 (seme 7)', a.rho, 0.8, 1e-12],
        // python3 -I -c "print(0.8**2+0.6**2+2*0.8*0.8*0.6)"
        ['Var(X + Y) dei punti, σ 0,8 e 0,6', a.vs, 1.768, 1e-12],
        // python3 -I -c "print(0.8**2+0.8**2+2*0.8*0.8*0.8)"
        ['Var(X + Y) dei punti, ρ = 0,8, σ 0,8', b.vs, 2.304, 1e-12],
        // python3 -I -c "print((0.8+0.8)**2)"   (ρ = 1: X + Y = (1 + a)·X con a = σY/σX, quindi σ = σX + σY)
        ['ρ = 1: Var(X + Y) = (σX + σY)²', un.vs, 2.56, 1e-12],
        ['ρ = 1: ρ dei punti', un.rho, 1, 1e-12],
        ['ρ = −1: X + Y è costante (varianza 0)', mu.vs, 0, 1e-12],
        ['ρ = −1: ρ dei punti', mu.rho, -1, 1e-12],
        ['le medie dei punti sono 0', Math.abs(a.mx) + Math.abs(a.my), 0, 1e-12],
        ['Var(X) dei punti = σX²', a.vx, 0.64, 1e-12],
        ['Var(Y) dei punti = σY²', a.vy, 0.36, 1e-12],
        ['le coppie sono 200', a.n, 200, 0],
        ['200 cerchi nel disegno', (W.render(d).svg.match(/<circle/g) || []).length, 200, 0],
        // «Rilancia» (seme 2): altri punti, stessa ρ
        ['dopo «Rilancia» i punti cambiano', p1[0] === p2[0] ? 0 : 1, 1, 0],
        ['dopo «Rilancia» ρ resta −0,25', st({ ...d, seed: 2 }).rho, -0.25, 1e-12],
        /* replica in Python di GI.rng (mulberry32) e della costruzione x = σX·Z1, y = σY·(ρ·Z1 + √(1−ρ²)·Z2); comando: python3 -I -c "…"
           M=0xffffffff; mul=lambda a,b:(a*b)&M
           def rng(seed):
               a=(seed+0x6d2b79f5)&M
               def nxt():
                   nonlocal a
                   a=(a+0x6d2b79f5)&M; t=mul(a^(a>>15),1|a); t=((t+mul(t^(t>>7),61|t))&M)^t
                   return ((t^(t>>14))&M)/4294967296
               return nxt
           def cloud(seed):  # u1[i], u2[i] a coppie, 200 volte; poi standardizzazione e ortogonalizzazione
               r=rng(seed); u1=[]; u2=[]
               for _ in range(200): u1.append(r()); u2.append(r())
               mean=lambda a:sum(a)/len(a)
               def std(a): m=mean(a); sd=mean([(x-m)**2 for x in a])**0.5; return [(x-m)/sd for x in a]
               z1=std(u1); m2=mean(u2); c=mean([z*(u-m2) for z,u in zip(z1,u2)])
               return z1, std([u-m2-c*z for u,z in zip(u2,z1)])
           s=0.24**0.5; z1,z2=cloud(1); print(s*z1[0], s*(-0.25*z1[0]+(1-0.25**2)**0.5*z2[0]))   # x0, y0 del seme 1
           → −0,7594434914799961 e 0,28296512045358996; seme 2: x0 = −0,2968377046832921; seme 5, ρ = 0,8, σ 0,8 e 0,6: punto 17, y = −0,5164526199487797
           punti con x·y > 0 con i valori predefiniti: 83 */
        ['primo punto, seme 1: x (replica Python)', p1[0], -0.7594434914799961, 1e-12],
        ['primo punto, seme 1: y (replica Python)', p1[1], 0.28296512045358996, 1e-12],
        ['primo punto, seme 2: x (replica Python)', p2[0], -0.2968377046832921, 1e-12],
        ['punto 17, seme 5, ρ = 0,8, σ 0,8 e 0,6: y (replica Python)', p5[1], -0.5164526199487797, 1e-12],
        ['punti blu con i valori predefiniti: 83 su 200 (replica Python)', (W.render(d).svg.match(/fill="var\(--pv-a\)" fill-opacity="0.85"/g) || []).length, 83, 0],
        ['la lettura riporta Cov −0,06', out.includes('−0,06') ? 1 : 0, 1, 0],
        ['la lettura riporta Var(X + Y) = 0,36', out.includes('>0,36<') ? 1 : 0, 1, 0],
        ['somme della lettura esatte in tutti i ' + stati + ' stati dei cursori', somme, 0, 0],
        ['con una σ dell’urna il segno prima del totale è = o ≈ secondo la somma scritta', segni, 0, 0],
        ['con una σ dell’urna esistono somme scritte approssimate (≈)', approx > 0 ? 1 : 0, 1, 0],
      ];
    },
  });
})();

/* ---- binomiale.js (sezione 2.19) ---- */
(function () {
  'use strict';
  /* 2.19 · Binomiale: quanti successi in n prove indipendenti */
  const { n: num, pct, sci, v, p: P } = GI;
  const { tx, rect, ln, C } = GI.H;

  /* area del disegno */
  const L = 52, R = 548, T = 50, B = 250;

  function calc(s) {
    const nn = Math.max(1, Math.round(s.n));
    const p = Math.min(1, Math.max(0, s.p));
    const k = Math.min(nn, Math.max(0, Math.round(s.k)));
    const pmf = [];
    let peak = 0;
    for (let i = 0; i <= nn; i++) {
      const q = GI.m.binomPmf(nn, p, i);
      pmf.push(q);
      if (q > peak) peak = q;
    }
    const mean = nn * p, vr = nn * p * (1 - p);
    return { n: nn, p, k, pmf, pk: pmf[k], peak, mean, vr, sd: Math.sqrt(vr) };
  }

  /* ---------- formati dei numeri nella lettura ---------- */
  const trim = (t) => (t.includes(',') ? t.replace(/0+$/, '').replace(/,$/, '') : t);
  /* risultato di una probabilità: 4 decimali, 1 e 0 esatti, notazione scientifica sotto 0,001 */
  const pr = (x) => (x === 0 ? '0' : x > 0.99995 ? '1' : x >= 0.001 ? num(x, 4) : sci(x, 3));
  /* fattore di un prodotto (una potenza fra 0 e 1): 5 cifre significative, senza zeri in fondo (0,7^7 ≈ 0,082354, come nel testo) */
  const fac = (x) => (x === 0 ? '0' : x > 0.99995 ? '1' : x >= 0.001 ? trim(num(x, 4 - Math.floor(Math.log10(x)))) : sci(x, 5).replace(/(\d),?0+(\s×)/, '$1$2'));
  /* coefficiente binomiale: intero esatto finché è piccolo, poi notazione scientifica */
  const coefTxt = (x) => (x < 1e6 ? num(Math.round(x), 0) : sci(x, 3));
  /* la stessa probabilità in percentuale; sotto lo 0,05 % il decimale direbbe 0,0 % */
  const pc = (x) => (x === 0 ? '0\u00a0%' : x < 0.0005 ? 'meno di 0,1\u00a0%' : pct(x, 1));
  const pp = (x) => trim(num(x, 2));
  const ev = (x) => trim(num(x, 2));
  /* la varianza np(1 − p), con p a due decimali, ha al più quattro decimali: la mostriamo intera, così √ torna con σ */
  const va = (x) => trim(num(x, 4));

  GI.add('binomiale', {
    sec: '2.19',
    title: 'Quanti successi in <var>n</var> prove?',
    w: 560,
    h: 306,
    alt: 'Grafico a colonne della legge binomiale: una colonna blu per ogni numero di successi da 0 a n, alta quanto la probabilità di quel numero. La colonna k è arancione. Una riga tratteggiata viola segna la media np e una fascia viola chiara la zona np ± σ. Aumentando n la figura si sposta a destra e si allarga; aumentando p la figura va verso destra, diminuendo p verso sinistra; spostando k si evidenzia un’altra colonna. Le probabilità precise sono scritte sotto il disegno.',
    controls: [
      { id: 'n', label: 'Numero di prove <var>n</var>', min: 1, max: 60, int: true, value: 10 },
      { id: 'p', label: 'Probabilità di successo <var>p</var>', min: 0, max: 1, step: 0.01, value: 0.3, fmt: (x) => num(x, 2) },
      { id: 'k', label: 'Numero di successi <var>k</var> (colonna arancione)', min: 0, max: 60, int: true, value: 3, limits: (s) => [0, Math.round(s.n)] },
    ],
    presets: [
      { label: 'L’esempio del testo', set: { n: 10, p: 0.3, k: 3 } },
      { label: 'Moneta equa', set: { n: 10, p: 0.5, k: 5 } },
      { label: '60 clienti, il 2\u00a0% compra', set: { n: 60, p: 0.02, k: 1 } },
      { label: '10 tiri liberi all’80\u00a0%', set: { n: 10, p: 0.8, k: 8 } },
      { label: '60 lanci di moneta equa', set: { n: 60, p: 0.5, k: 30 } },
    ],
    caption: 'Ogni colonna è un numero di successi, da 0 a <var>n</var>; la sua altezza è la probabilità di ottenerlo, <var>P</var>(<var>X</var> = <var>k</var>), e tutte le colonne insieme hanno somma 1. La colonna <var>k</var> scelta è arancione. La riga viola tratteggiata è la media <var>np</var>; la fascia viola chiara va da <var>np</var> − σ a <var>np</var> + σ, con σ = √(<var>np</var>(1 − <var>p</var>)). La scala verticale si adatta alla colonna più alta: per confrontare due figure conta il numero sull’asse, non l’altezza del disegno.',
    prove: [
      'Con <var>n</var> = 10 porta <var>p</var> da 0 a 1: per quale <var>p</var> la fascia <var>np</var> ± σ è più larga, e che cosa succede ai due estremi?',
      'Con <var>p</var> = 0,5 porta <var>n</var> da 10 a 60 e leggi i numeri sull’asse verticale: la colonna più alta si alza o si abbassa? Come lo spieghi?',
    ],
    /* se n scende sotto k, k si ferma a n (le colonne vanno da 0 a n) */
    onchange(s, id, setAll) { if (s.k > s.n) setAll({ k: s.n }); },
    calc,
    render(s) {
      const c = calc(s), nn = c.n, k = c.k;
      const step = (R - L) / (nn + 1), bw = Math.min(step * 0.84, 50);
      const X = P.scale(-0.5, nn + 0.5, L, R);
      const ytop = c.peak * 1.12;
      const Y = P.scale(0, ytop, B, T);
      const yt = P.nice(0, ytop, 4);
      const ys = yt.length > 1 ? yt[1] - yt[0] : 0.1;
      const dec = Math.max(1, Math.ceil(-Math.log10(ys) - 1e-9));
      let xt = [];
      if (nn <= 12) for (let i = 0; i <= nn; i++) xt.push(i);
      else xt = P.nice(0, nn, 5);

      let svg = P.axes({ X, Y, box: [L, T, R, B], xt, yt, xf: (x) => num(x, 0), yf: (y) => num(y, dec), xl: 'numero di successi', grid: true });

      // fascia media ± σ e media
      const lo = Math.max(-0.5, c.mean - c.sd), hi = Math.min(nn + 0.5, c.mean + c.sd);
      if (X(hi) - X(lo) > 0.5) svg += rect(X(lo), T, X(hi) - X(lo), B - T, { fill: C.C, fo: 0.16 });

      // colonne
      let kTop = B;
      for (let i = 0; i <= nn; i++) {
        const h = B - Y(c.pmf[i]), isK = i === k;
        if (h < 0.4 && !isK) continue;
        const hh = isK ? Math.max(h, 2) : h;
        if (isK) kTop = B - hh;
        svg += rect(X(i) - bw / 2, B - hh, bw, hh, { fill: isK ? C.B : C.A, fo: isK ? 0.95 : 0.8 });
      }
      svg += ln(X(c.mean), T, X(c.mean), B, { stroke: C.C, sw: 2, da: '6 4' });
      svg += tx(X(k), kTop - 8, '*k*', { size: 17, fill: C.B, stroke: C.paper, sw: 4, lj: 'round', paint_order: 'stroke' });

      // legenda
      const ly = 24;
      svg += rect(L, ly - 14, 14, 14, { fill: C.B, fo: 0.95 }) + tx(L + 21, ly, '*P*(*X* = *k*)', { size: 17, ta: 'start' });
      svg += rect(L + 150, ly - 14, 14, 14, { fill: C.C, fo: 0.16 }) + ln(L + 157, ly - 14, L + 157, ly, { stroke: C.C, sw: 2, da: '4 3' }) + tx(L + 171, ly, '*np* ± σ', { size: 17, ta: 'start' });

      // lettura
      const co = GI.m.binom(nn, k), pk = Math.pow(c.p, k), qk = Math.pow(1 - c.p, nn - k);
      const coef = `<span class="binom"><span>${nn}</span><span>${k}</span></span>`;
      const out = `<p>${v('P')}(${v('X')} = <b>${k}</b>) = ${coef} · ${pp(c.p)}<sup>${k}</sup> · ${pp(1 - c.p)}<sup>${nn - k}</sup> = ${coefTxt(co)} · ${fac(pk)} · ${fac(qk)} = <span class="gi-hl">${pr(c.pk)}</span> (${pc(c.pk)}).</p>
  <p>Media ${v('np')} = ${nn} · ${pp(c.p)} = <b>${ev(c.mean)}</b>. Varianza ${v('np')}(1 − ${v('p')}) = ${nn} · ${pp(c.p)} · ${pp(1 - c.p)} = <b>${va(c.vr)}</b>, quindi σ = √${va(c.vr)} ${Math.abs(c.sd * 100 - Math.round(c.sd * 100)) < 1e-7 ? '=' : '≈'} <b>${ev(c.sd)}</b>. La fascia ${v('np')} ± σ va da ${ev(c.mean - c.sd)} a ${ev(c.mean + c.sd)}.</p>`;
      return { svg, out };
    },
    selftest() {
      const W = GI.widgets.binomiale, d = GI.defaults(W), out = W.render(d).out;
      // coefficiente binomiale esatto, calcolato senza fattoriali né logaritmi
      const choose = (a, b) => { let r = 1; for (let i = 1; i <= b; i++) r = (r * (a - b + i)) / i; return r; };
      const direct = (nn, p, k) => choose(nn, k) * p ** k * (1 - p) ** (nn - k);
      const sumPmf = (nn, p) => { let t = 0; for (let i = 0; i <= nn; i++) t += calc({ n: nn, p, k: 0 }).pmf[i]; return t; };
      const mom = (nn, p) => { const q = calc({ n: nn, p, k: 0 }).pmf; let m = 0, w = 0; for (let i = 0; i <= nn; i++) m += i * q[i]; for (let i = 0; i <= nn; i++) w += (i - m) ** 2 * q[i]; return [m, w]; };
      const [m45, v45] = mom(45, 0.62), [m33, v33] = mom(33, 0.41);
      return [
        // python3 -I -c "from math import comb; print(comb(10,3)*0.3**3*0.7**7)"
        ['P(X = 3) del testo, n = 10, p = 0,3', calc(d).pk, 0.2668279319999998, 1e-12],
        // python3 -I -c "from math import comb; print(comb(60,30)/2**60)"
        ['P(X = 30), n = 60, p = 0,5', calc({ n: 60, p: 0.5, k: 30 }).pk, 0.10257817300856951, 1e-12],
        // python3 -I -c "from math import comb; print(comb(60,1)*0.02*0.98**59)"
        ['P(X = 1), n = 60, p = 0,02', calc({ n: 60, p: 0.02, k: 1 }).pk, 0.3643507869699434, 1e-12],
        // python3 -I -c "from math import comb; print(comb(10,8)*0.8**8*0.2**2)"
        ['P(X = 8), n = 10, p = 0,8', calc({ n: 10, p: 0.8, k: 8 }).pk, 0.3019898880000002, 1e-12],
        // python3 -I -c "from math import comb; print(comb(10,5)/2**10)"
        ['moneta equa: P(X = 5)', calc({ n: 10, p: 0.5, k: 5 }).pk, 0.24609375, 1e-12],
        ['formula con i coefficienti esatti, n = 33', calc({ n: 33, p: 0.41, k: 14 }).pk, direct(33, 0.41, 14), 1e-12],
        ['la somma di tutte le colonne è 1 (n = 60, p = 0,37)', sumPmf(60, 0.37), 1, 1e-12],
        // python3 -I -c "print(45*0.62, 45*0.62*0.38)"
        ['media delle colonne = np (n = 45, p = 0,62)', m45, 27.9, 1e-10],
        ['varianza delle colonne = np(1 − p) (n = 45, p = 0,62)', v45, 10.602, 1e-9],
        // python3 -I -c "print(33*0.41*0.59)"
        ['varianza delle colonne, n = 33, p = 0,41', v33, 7.9826999999999995, 1e-9],
        // python3 -I -c "from math import sqrt; print(sqrt(2.1))"
        ['σ del testo = √2,1', calc(d).sd, 1.449137674618944, 1e-12],
        ['p = 0: tutte le prove falliscono', calc({ n: 12, p: 0, k: 0 }).pk, 1, 0],
        ['p = 1: tutte le prove riescono', calc({ n: 12, p: 1, k: 12 }).pk, 1, 0],
        ['con n = 1 è la Bernoulli: P(X = 1) = p', calc({ n: 1, p: 0.3, k: 1 }).pk, 0.3, 1e-15],
        ['k oltre n si ferma a n', calc({ n: 8, p: 0.5, k: 40 }).k, 8, 0],
        // nel disegno: la colonna arancione del picco (n = 10, p = 0,3, k = 3) è alta 200 / 1,12 pixel
        // python3 -I -c "print(200/1.12)"
        ['altezza della colonna arancione nel disegno', +W.render(d).svg.match(/height="([\d.]+)" fill="var\(--pv-b\)"/)[1], 178.57142857142856, 0.01],
        // la varianza si mostra intera (4 decimali), così √ torna con σ: python3 -I -c "from math import sqrt; print(round(sqrt(7.9827), 2))"
        ['lettura n = 33, p = 0,41: √7,9827 ≈ 2,83', W.render({ n: 33, p: 0.41, k: 14 }).out.includes('√7,9827 ≈ <b>2,83</b>') ? 1 : 0, 1, 0],
        // python3 -I -c "print(0.7**7)"   (0,0823543: il testo scrive 0,082354)
        ['la lettura riporta 0,7^7 ≈ 0,082354', out.includes('0,082354') ? 1 : 0, 1, 0],
        ['la lettura riporta 0,2668', out.includes('0,2668') ? 1 : 0, 1, 0],
        ['la lettura riporta σ ≈ 1,45', out.includes('1,45') ? 1 : 0, 1, 0],
      ];
    },
  });
})();

/* ---- poisson.js (sezione 2.24) ---- */
(function () {
  'use strict';
  /* 2.24 · La legge di Poisson come limite della binomiale: Bin(n, λ/n) contro Poisson(λ) */
  const { n: num, sci, v, p: P } = GI;
  const { tx, rect, C } = GI.H;

  /* area del disegno */
  const L = 52, R = 548, T = 50, B = 250;

  /* quante colonne (da 0 a K) si disegnano: oltre, la Poisson di parametro λ è ormai invisibile */
  const Kof = (lam) => Math.max(6, Math.ceil(lam + 4 * Math.sqrt(lam) + 3));
  const LAM_MIN = 0.2, LAM_MAX = 15, N_MIN = 2, N_MAX = 3600;

  function calc(s) {
    const lam = Math.min(LAM_MAX, Math.max(LAM_MIN, s.lam));
    let nn = Math.max(N_MIN, Math.round(s.n));
    if (nn <= lam) nn = Math.floor(lam) + 1; // il teorema chiede n > λ: altrimenti p = λ/n supererebbe 1
    const p = lam / nn;
    const K = Kof(lam), k = Math.min(K, Math.max(0, Math.round(s.k)));
    const bin = [], poi = [];
    let peak = 0;
    for (let i = 0; i <= K; i++) {
      const b = GI.m.binomPmf(nn, p, i), q = GI.m.poisPmf(lam, i);
      bin.push(b);
      poi.push(q);
      peak = Math.max(peak, b, q);
    }
    return { lam, n: nn, p, K, k, bin, poi, peak, bk: bin[k], pk: poi[k] };
  }

  /* ---------- formati dei numeri nella lettura ---------- */
  const trim = (t) => (t.includes(',') ? t.replace(/0+$/, '').replace(/,$/, '') : t);
  /* notazione scientifica con 3 cifre: si arrotonda prima, così 9,995 × 10^−5 diventa 1,00 × 10^−4 e non «10,00 × 10^−5» */
  const sc3 = (x) => sci(+x.toPrecision(3), 3);
  /* probabilità: 5 decimali come nelle tabelle del testo, notazione scientifica sotto 0,001 */
  const pr = (x) => (x === 0 ? '0' : x >= 0.001 ? num(x, 5) : sc3(x));
  const ca = (t) => `<b style="color:var(--pv-a)">${t}</b>`; // colore della binomiale
  const cb = (t) => `<b style="color:var(--pv-b)">${t}</b>`; // colore della Poisson

  GI.add('poisson', {
    sec: '2.24',
    title: 'La binomiale diventa Poisson al crescere di n',
    w: 560,
    h: 306,
    alt: 'Colonne affiancate a due a due, una coppia per ogni numero di eventi k = 0, 1, 2, …: la colonna blu è la probabilità binomiale con n prove e probabilità λ/n, la colonna arancione è la probabilità di Poisson di parametro λ. La coppia scelta con il comando k è evidenziata in giallo. Con n piccolo le colonne blu e arancioni sono diverse; aumentando n le blu si avvicinano alle arancioni fino a sovrapporsi. Cambiando λ la figura si sposta a destra e si allarga. I valori precisi della coppia scelta sono scritti sotto il disegno.',
    controls: [
      { id: 'lam', label: 'Numero medio di eventi <var>λ</var>', min: LAM_MIN, max: LAM_MAX, step: 0.1, value: 2, fmt: (x) => trim(num(x, 1)) },
      { id: 'n', label: 'Numero di prove <var>n</var> (con <var>p</var> = <var>λ</var>/<var>n</var>)', min: N_MIN, max: N_MAX, int: true, log: true, value: 10, fmt: (x) => num(x, 0) },
      { id: 'k', label: 'Numero di eventi <var>k</var> (coppia gialla)', min: 0, max: Kof(LAM_MAX), int: true, value: 2, fmt: (x) => num(x, 0), limits: (s) => [0, Kof(s.lam)] },
    ],
    presets: [
      { label: 'L’esempio del testo', set: { lam: 2, n: 10, k: 2 } },
      { label: 'Poche prove: n = 4', set: { lam: 2, n: 4, k: 2 } },
      { label: 'Un’ora in 3 600 secondi', set: { lam: 2, n: 3600, k: 2 } },
      { label: 'Pochi eventi: λ = 0,2', set: { lam: 0.2, n: 10, k: 1 } },
      { label: 'Molti eventi: λ = 15', set: { lam: 15, n: 100, k: 15 } },
    ],
    caption: 'Per ogni numero di eventi <var>k</var> ci sono due colonne; l’altezza è la probabilità. Blu: la probabilità binomiale <var>P</var>(<var>X</var><sub><var>n</var></sub> = <var>k</var>), con <var>X</var><sub><var>n</var></sub> ~ Bin(<var>n</var>, <var>λ</var>/<var>n</var>). Arancione: la probabilità di Poisson <var>e</var><sup>−<var>λ</var></sup><var>λ</var><sup><var>k</var></sup>/<var>k</var>!. La coppia gialla è il <var>k</var> scelto. Muovendo <var>n</var>, la probabilità <var>p</var> = <var>λ</var>/<var>n</var> cambia in modo che <var>np</var> resti uguale a <var>λ</var>. Il comando <var>n</var> resta sopra <var>λ</var>, come chiede il teorema (altrimenti <var>p</var> supererebbe 1).',
    prove: [
      'Lascia <var>λ</var> = 2 e porta <var>n</var> da 4 a 3 600: che cosa succede alle colonne blu rispetto alle arancioni?',
      'Porta <var>n</var> a 100 e confronta <var>λ</var> = 2 con <var>λ</var> = 15: in quale caso le colonne blu sono più lontane dalle arancioni, e quanto vale <var>p</var> nei due casi?',
    ],
    /* n resta sopra λ, e k non va oltre l’ultima colonna disegnata */
    onchange(s, id, setAll) {
      const o = {};
      if (s.n <= s.lam) o.n = Math.floor(s.lam) + 1;
      if (s.k > Kof(s.lam)) o.k = Kof(s.lam);
      if (Object.keys(o).length) setAll(o);
    },
    calc,
    render(s) {
      const c = calc(s), K = c.K, k = c.k;
      const step = (R - L) / (K + 1), bw = Math.min(step * 0.86, 60) / 2;
      const X = P.scale(-0.5, K + 0.5, L, R);
      const ytop = c.peak * 1.12;
      const Y = P.scale(0, ytop, B, T);
      const yt = P.nice(0, ytop, 4);
      const ys = yt.length > 1 ? yt[1] - yt[0] : 0.1;
      const dec = Math.max(1, Math.ceil(-Math.log10(ys) - 1e-9));
      const xt = [];
      if (K <= 12) for (let i = 0; i <= K; i++) xt.push(i);
      else xt.push(...P.nice(0, K, 5));

      let svg = P.axes({ X, Y, box: [L, T, R, B], xt, yt, xf: (x) => num(x, 0), yf: (y) => (y === 0 ? '0' : num(y, dec)), xl: 'numero di eventi', grid: true });

      // la coppia scelta
      svg += rect(X(k) - step / 2, T, step, B - T, { fill: C.hi, fo: 0.35 });

      // colonne: a sinistra la binomiale, a destra la Poisson
      for (let i = 0; i <= K; i++) {
        const hb = B - Y(c.bin[i]), hp = B - Y(c.poi[i]);
        if (hb >= 0.4) svg += rect(X(i) - bw, B - hb, bw, hb, { fill: C.A, fo: 0.88 });
        if (hp >= 0.4) svg += rect(X(i), B - hp, bw, hp, { fill: C.B, fo: 0.88 });
      }
      svg += tx(X(k), T - 6, '*k*', { size: 17 });

      // legenda
      svg += rect(L, 10, 14, 14, { fill: C.A, fo: 0.88 }) + tx(L + 21, 24, 'Bin(*n*, *λ*/*n*)', { size: 17, ta: 'start' });
      svg += rect(L + 150, 10, 14, 14, { fill: C.B, fo: 0.88 }) + tx(L + 171, 24, 'Poisson(*λ*)', { size: 17, ta: 'start' });

      // lettura
      const lam = trim(num(c.lam, 1)), nn = c.n, fr = `${lam}/${num(nn, 0)}`, LAM = v('λ'), EXP = v('e');
      const pTxt = c.p >= 0.001 ? trim(num(c.p, 4)) : sc3(c.p);
      const binTxt = k > nn
        ? `poiché <var>k</var> = ${k} supera <var>n</var> = ${num(nn, 0)}, in ${num(nn, 0)} prove non si possono avere ${k} successi: ${v('P')}(${v('X')}<sub>${v('n')}</sub> = ${k}) = ${ca('0')}`
        : `${v('P')}(${v('X')}<sub>${v('n')}</sub> = ${k}) = <span class="binom"><span>${num(nn, 0)}</span><span>${k}</span></span> · (${fr})<sup>${k}</sup> · (1&nbsp;−&nbsp;${fr})<sup>${num(nn - k, 0)}</sup> = ${ca(pr(c.bk))}`;
      const seq = [10, 100, 1000, 10000, 100000].filter((m) => m > c.lam).map((m, i) => pr(GI.m.binomPmf(m, c.lam / m, k)) + ' (' + (i === 0 ? `<var>n</var> = ` : '') + num(m, 0) + ')');
      const out = `<p>Con ${LAM} = <b>${lam}</b> e <var>n</var> = <b>${num(nn, 0)}</b> si ha <var>p</var> = ${LAM}/<var>n</var> = <b>${pTxt}</b>. Per <var>k</var> = <b>${k}</b>, ${ca('binomiale')}: ${binTxt}; ${cb('Poisson')}: ${EXP}<sup>−${lam}</sup> · ${lam}<sup>${k}</sup>/${k}! = ${cb(pr(c.pk))}.</p>
  <p>Con ${LAM} = ${lam} e <var>k</var> = ${k}, al crescere di <var>n</var> la probabilità binomiale vale ${seq.join(', ')}; la Poisson, cioè il limite, vale ${cb(pr(c.pk))}.</p>`;
      return { svg, out };
    },
    selftest() {
      const W = GI.widgets.poisson, d = GI.defaults(W), r = W.render(d), out = r.out;
      const bin = (nn, p, k) => { let a = 1; for (let i = 1; i <= k; i++) a = (a * (nn - k + i)) / i; return a * p ** k * (1 - p) ** (nn - k); }; // coefficiente esatto, senza fattoriali
      const fat = (k) => { let a = 1; for (let i = 2; i <= k; i++) a *= i; return a; };
      const pois = (lam, k) => Math.exp(-lam) * lam ** k / fat(k);
      const sumBin = (nn, p, f) => { let a = 0; for (let i = 0; i <= nn; i++) a += f(i) * GI.m.binomPmf(nn, p, i); return a; };
      const sumPoi = (lam, f) => { let a = 0; for (let i = 0; i <= 120; i++) a += f(i) * GI.m.poisPmf(lam, i); return a; };
      const heights = (svg, tok) => [...svg.matchAll(new RegExp('height="([\\d.]+)" fill="var\\(--pv-' + tok + '\\)"', 'g'))].map((m) => +m[1]);
      const hb = heights(r.svg, 'a'), hp = heights(r.svg, 'b');
      return [
        // python3 -I -c "from math import comb; print(comb(10,2)*0.2**2*0.8**8)"
        ['binomiale del testo: n = 10, k = 2', calc(d).bk, 0.3019898880000002, 1e-12],
        // python3 -I -c "from math import exp; print(exp(-2)*2**2/2)"
        ['Poisson del testo: λ = 2, k = 2', calc(d).pk, 0.2706705664732254, 1e-12],
        // python3 -I -c "from math import comb; print(comb(100,2)*0.02**2*0.98**98)"
        ['binomiale con n = 100 (0,27341 nel testo)', calc({ lam: 2, n: 100, k: 2 }).bk, 0.2734139115697739, 1e-12],
        // python3 -I -c "from math import comb; print(comb(1000,2)*0.002**2*0.998**998)"
        ['binomiale con n = 1 000 (0,27094 nel testo)', calc({ lam: 2, n: 1000, k: 2 }).bk, 0.27094159847598337, 1e-11],
        // python3 -I -c "from math import comb; print(comb(10000,2)*(2/10000)**2*(1-2/10000)**9998)"
        ['binomiale con n = 10 000 (0,27070 nel testo)', GI.m.binomPmf(10000, 2 / 10000, 2), 0.2706976371394147, 1e-10],
        // python3 -I -c "from math import comb; print(comb(100000,2)*(2/100000)**2*(1-2/100000)**99998)"
        ['binomiale con n = 100 000 (0,27067 nel testo)', GI.m.binomPmf(100000, 2 / 100000, 2), 0.27067327321443874, 1e-9],
        // python3 -I -c "from math import comb; print(comb(3600,2)*(2/3600)**2*(1-2/3600)**3598)"
        ['binomiale con n = 3 600 (un’ora in secondi)', calc({ lam: 2, n: 3600, k: 2 }).bk, 0.27074578060008775, 1e-10],
        // python3 -I -c "from math import comb,exp,factorial; print(comb(100,15)*0.15**15*0.85**85, exp(-15)*15**15/factorial(15))"
        ['λ = 15, n = 100, k = 15: binomiale', calc({ lam: 15, n: 100, k: 15 }).bk, 0.11109095934976435, 1e-12],
        ['λ = 15, n = 100, k = 15: Poisson', calc({ lam: 15, n: 100, k: 15 }).pk, 0.10243586666453419, 1e-12],
        ['binomiale con la formula a coefficienti esatti (n = 40, p = 0,0625)', calc({ lam: 2.5, n: 40, k: 4 }).bk, bin(40, 0.0625, 4), 1e-12],
        ['Poisson con la formula e^−λ λ^k/k! (λ = 6,4, k = 9)', calc({ lam: 6.4, n: 500, k: 9 }).pk, pois(6.4, 9), 1e-12],
        // python3 -I -c "print(0.98**10, __import__('math').exp(-0.2))"
        ['λ = 0,2, n = 10, k = 0: binomiale', calc({ lam: 0.2, n: 10, k: 0 }).bk, 0.8170728068875467, 1e-12],
        ['λ = 0,2, n = 10, k = 0: Poisson', calc({ lam: 0.2, n: 10, k: 0 }).pk, 0.8187307530779818, 1e-12],
        // n = 2 con λ = 15 sale a 16 (p = 15/16): python3 -I -c "from math import comb; print(comb(16,15)*(15/16)**15*(1/16))"
        ['n = 2 e λ = 15 diventano n = 16: binomiale in k = 15', calc({ lam: 15, n: 2, k: 15 }).bk, 0.37981240581524567, 1e-12],
        ['n resta sopra λ: n = 2 e λ = 15 danno 16', calc({ lam: 15, n: 2, k: 0 }).n, 16, 0],
        ['n resta sopra λ: n = 2 e λ = 2 danno 3', calc({ lam: 2, n: 2, k: 0 }).n, 3, 0],
        ['con n = 2 e k = 5 la binomiale è 0', calc({ lam: 0.2, n: 2, k: 5 }).bk, 0, 0],
        ['la somma delle binomiali è 1 (n = 10)', sumBin(10, 0.2, () => 1), 1, 1e-12],
        ['la somma delle Poisson è 1 (λ = 15)', sumPoi(15, () => 1), 1, 1e-12],
        // python3 -I -c "print(70*(3.5/70))"   (la media della binomiale è np = λ)
        ['media della binomiale = np = λ (λ = 3,5, n = 70)', sumBin(70, 3.5 / 70, (i) => i), 3.5, 1e-10],
        ['varianza della Poisson = λ (λ = 7,3)', sumPoi(7.3, (i) => (i - 7.3) ** 2), 7.3, 1e-10],
        // python3 -I -c "from math import ceil,sqrt; print(ceil(15+4*sqrt(15)+3))"
        ['il comando k arriva all’ultima colonna di λ = 15', W.controls.find((x) => x.id === 'k').max, 34, 0],
        ['k oltre l’ultima colonna si ferma a K (λ = 0,2: K = 6)', calc({ lam: 0.2, n: 10, k: 30 }).k, 6, 0],
        // python3 -I -c "print(200*0.2706705664732254/(1.12*0.3019898880000002), 200*0.3019898880000002/(1.12*0.3019898880000002))"   (altezza 200 px = picco × 1,12)
        ['altezza della colonna arancione k = 2 nel disegno', hp.some((h) => Math.abs(h - 160.0518) < 0.01) ? 1 : 0, 1, 0],
        ['altezza della colonna blu k = 2 nel disegno (il picco)', hb.some((h) => Math.abs(h - 178.5714) < 0.01) ? 1 : 0, 1, 0],
        ['la lettura riporta 0,30199 e 0,27067', out.includes('0,30199') && out.includes('0,27067') ? 1 : 0, 1, 0],
        ['la lettura riporta la successione 0,27341 / 0,27094 / 0,27070', out.includes('0,27341') && out.includes('0,27094') && out.includes('0,27070') ? 1 : 0, 1, 0],
        // python3 -I -c "print(0.2/2001, 0.1**5)"   (9,995 × 10^−5 e 1,0000000000000003 × 10^−5: mai «10,00 × 10^−n»)
        ['p = 0,2/2 001 si legge 1,00 × 10^−4', W.render({ lam: 0.2, n: 2001, k: 2 }).out.includes('1,00 × 10<sup>−4</sup>') ? 1 : 0, 1, 0],
        ['(1 − 0,9)^5 si legge 1,00 × 10^−5', W.render({ lam: 4.5, n: 5, k: 0 }).out.includes('1,00 × 10<sup>−5</sup>') ? 1 : 0, 1, 0],
        ['nessuna lettura con «10,00 ×»', [{ lam: 0.2, n: 2001, k: 2 }, { lam: 4.5, n: 5, k: 0 }, { lam: 6.4, n: 100, k: 32 }].every((st) => !W.render(st).out.includes('10,00')) ? 1 : 0, 1, 0],
      ];
    },
  });
})();
