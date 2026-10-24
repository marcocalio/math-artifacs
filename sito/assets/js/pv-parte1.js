/* =========================================================================
   pv-parte1.js — video della Parte 1 (spazi di probabilità, condizionale,
   indipendenza). Si appoggia a pv.js: ogni video è un PV.add(id, {...}).
   Tutti i tempi sono in secondi; le coordinate sono nel riquadro 640 × 360.
   ========================================================================= */
(function () {
  'use strict';
  const { lerp, E, p, arc, rnd, C, SANS, T, rect, circ, ell, ln, path, g, draw, tx, lbl, die, rollPose, tile, check, cross, vis, on, bump, heading, subline, lb, vl, fr, brace, vbrace, wipe, pills, dieAt } = PV.h;

  /* secondo bordo dentro una casella (un esito che sta in due eventi); linguetta con la lettera */
  const inner = (x, y, s, col, op = 1, sc = 1) => g({ tf: T(x, y, sc), op }, rect(-s / 2 + 5, -s / 2 + 5, s - 10, s - 10, { rx: s * 0.12, stroke: col, sw: 2.5 }));
  const tab = (x, y, s, col, op = 1) => g({ op }, rect(x, y, 32, 24, { rx: 5, fill: col }) + tx(x + 16, y + 18, s, { size: 19, fill: C.paper }));

  /* ======================================================================
     1.1 e 1.2 · Esperimento aleatorio, spazio campionario, evento (due clip: «esiti» in 1.1, «evento» in 1.2)
     ====================================================================== */
  const R1 = [[1.6, 2, 4], [5.6, 2, 1], [9.6, 2, 6]]; // i tre lanci del capitolo 1
  const R3 = [[40, 1.8, 4], [45.2, 1.8, 3]]; // i due lanci del capitolo 3
  const ROW = [110, 194, 278, 362, 446, 530]; // caselle in fila (y = 150)
  const GA = { 2: [106, 150], 4: [176, 150], 6: [246, 150] }; // posti nel gruppo A (pari)
  const GN = { 1: [394, 150], 3: [464, 150], 5: [534, 150] }; // posti fuori da A
  const DEMO = [[19.4, 3], [21.4, 6], [23.4, 2]]; // [inizio, esito ω] mostrati nel capitolo 2

  function pose1(n, t) {
    const i = n - 1, t0 = 14 + i * 0.32;
    const u = p(t, t0, t0 + 0.9), r = p(t, 34.2 + i * 0.14, 35.9 + i * 0.14, E.io);
    const [gx, gy] = n % 2 ? GN[n] : GA[n];
    const [x1, y1] = arc(320, 165, ROW[i], 150, u, 46);
    const [x, y] = arc(x1, y1, gx, gy, r, n % 2 ? 24 : -24);
    return { x, y, s: lerp(64, 56, r), sc: lerp(0.4, 1, p(t, t0, t0 + 0.9, E.back)), op: p(t, t0, t0 + 0.25) };
  }

  const ESITI = {
    sec: '1.1',
    short: 'Spazio campionario ed eventi',
    title: 'Esperimento aleatorio, spazio campionario, evento',
    alt: 'Animazione: un dado viene lanciato più volte; i sei esiti formano lo spazio campionario Ω; gli esiti pari formano l’evento A.',
    dur: 58,
    poster: 42.6,
    chap: [[0, "L'esperimento"], [13.5, 'Lo spazio campionario'], [33.5, 'Gli eventi']],
    caps: [
      [0, "Un esperimento aleatorio si può ripetere, ma non puoi prevederne l'esito. Per esempio, il lancio di un dado."],
      [8, "Lo ripeti: esce 4, poi 1, poi 6. Conosci tutto dell'esperimento, eppure non sai dire cosa uscirà."],
      [13.5, 'Il primo passo è elencare tutti gli esiti possibili: è lo spazio campionario, che si indica con Ω.'],
      [19, 'Ogni elemento di Ω è un esito e si indica con *ω*. Qui Ω ha sei elementi: |Ω| = 6.'],
      [25, "L'elenco deve essere esaustivo (qualunque cosa succeda, c'è) e gli esiti mutuamente esclusivi (ne esce uno solo)."],
      [33.5, "Un evento è un sottoinsieme di Ω, cioè un gruppo di esiti. «Esce un numero pari» è l'evento *A* = {2, 4, 6}."],
      [39.5, "Lanci il dado: *A* si verifica se l'esito è in *A*."],
      [42, 'Esce 4: 4 ∈ *A*, quindi *A* si è verificato.'],
      [45, 'Lo lanci ancora ed esce 3: 3 ∉ *A*, quindi *A* non si è verificato.'],
      [50.4, "Casi limite: Ω è l'evento certo, ∅ è l'evento impossibile, e anche un singolo esito, come {6}, è un evento."],
    ],
    frame(t) {
      let o = '';
      const head = (a, b, s) => {
        const op = vis(t, a, b);
        return on(op, tx(320, 44, s, { size: 26, op }));
      };
      o += head(0.2, 13.4, 'Esperimento aleatorio') + head(14, 33.4, 'Spazio campionario Ω') + head(34, 58.5, 'Evento = sottoinsieme di Ω');

      /* capitolo 1: il dado che rotola, e gli esiti che si accumulano */
      if (t < 14.4) {
        const d = dieAt(t, R1, 3), k = p(t, 0.1, 0.9, E.back) * (1 - p(t, 13.4, 14.2, E.acc));
        o += ell(320, 238, 48 * k * (1 + d.dy / 170), 8 * k, { fill: C.ink, fo: 0.13 });
        o += die(320, 165 + d.dy, 96, d.face, { rot: d.rot, sc: k });
        const lo = vis(t, 0.8, 13.4);
        o += on(lo, lbl(320, 272, 'il lancio di un dado', { size: 18, op: lo }));
        const co = 1 - p(t, 13.4, 14.2);
        R1.forEach(([t0, dur, n], i) => {
          const tl = t0 + dur, u = p(t, tl, tl + 0.9);
          if (u <= 0) return;
          const [x, y] = arc(320, 165, 268 + i * 52, 326, u, 50);
          o += tile(x, y, 40, n, { sc: lerp(1.5, 1, u), op: co * p(t, tl, tl + 0.2) });
        });
        const eo = co * p(t, 3.6, 4.2);
        o += on(eo, lbl(236, 331, 'esiti:', { ta: 'end', size: 18, op: eo }));
      }

      /* capitoli 2 e 3: cornice Ω e caselle */
      if (t >= 13.5) {
        o += rect(56, 80, 528, 136, { rx: 16, stroke: C.soft, sw: 2.2, ...draw(p(t, 16.2, 17.6, E.io)) });
        const fp = bump(t, 50.6, 1.8);
        if (fp > 0.01) o += rect(56, 80, 528, 136, { rx: 16, stroke: C.hi, sw: 4.5, so: fp });
        const eo2 = vis(t, 52.6, 56.4);
        o += on(eo2, tx(326, 166, '∅', { size: 46, fill: C.soft, op: eo2 }));
        const to = p(t, 17.2, 17.8);
        o += on(to, g({ op: to }, rect(56, 68, 32, 24, { rx: 5, fill: C.soft }) + tx(72, 86, 'Ω', { size: 19, fill: C.paper })));

        const aOn = p(t, 36, 36.9);
        for (let n = 1; n <= 6; n++) {
          const q = pose1(n, t);
          if (q.op <= 0) continue;
          let ring, ro = 0, veil, vo = 0.18, sc = q.sc, w = 0;
          for (const [a, v] of DEMO) if (v === n) w = Math.max(w, bump(t, a, 1.8));
          const v4 = n === 4 ? bump(t, 41.8) : 0, v3 = n === 3 ? bump(t, 47) : 0, v6 = n === 6 ? bump(t, 54.6) : 0;
          if (n % 2 === 0 && aOn > 0) { ring = C.A; ro = aOn; veil = C.A; vo = 0.14 * aOn; }
          if (w > 0.01) { ring = C.hi; ro = w; veil = C.hi; vo = 0.4 * w; sc *= 1 + 0.1 * w; }
          if (v4 > 0.01) { ring = 'var(--verde)'; ro = v4; sc *= 1 + 0.12 * v4; }
          if (v3 > 0.01) { ring = 'var(--rosso)'; ro = v3; sc *= 1 + 0.12 * v3; }
          if (v6 > 0.01) { ring = C.hi; ro = v6; sc *= 1 + 0.1 * v6; }
          o += tile(q.x, q.y, q.s, n, { sc, op: q.op, ring, ro, veil, vo });
        }

        /* capitolo 2: elenco, esito ω, due regole */
        const f1 = vis(t, 17.6, 33.4), f2 = vis(t, 18.4, 33.4);
        o += on(f1, tx(320, 264, 'Ω = {1, 2, 3, 4, 5, 6}', { size: 30, op: f1, tf: T(0, 8 * (1 - f1)) }));
        o += on(f2, tx(320, 298, '|Ω| = 6', { size: 22, fill: C.soft, op: f2, tf: T(0, 8 * (1 - f2)) }));
        for (const [a, v] of DEMO) {
          const op = vis(t, a, a + 1.9, 0.3, 0.3);
          o += on(op, tx(ROW[v - 1], 107, '*ω* = ' + v, { size: 20, op, tf: T(0, -6 * (1 - op)) }));
        }
        o += pills(332, [
          { s: 'esaustivo: qualcosa esce', icon: 'ok', op: vis(t, 25.6, 33.4), u: p(t, 25.9, 26.5, E.lin) },
          { s: 'esclusivo: ne esce uno solo', icon: 'ok', op: vis(t, 28, 33.4), u: p(t, 28.3, 28.9, E.lin) },
        ]);

        /* capitolo 3: il gruppo A, il dado, i verdetti, i casi limite */
        const bu = p(t, 35.6, 36.8, E.io);
        if (bu > 0) {
          o += rect(66, 100, 220, 104, { rx: 12, fill: C.A, fo: 0.08 * bu });
          o += rect(66, 100, 220, 104, { rx: 12, stroke: C.A, sw: 2.2, ...draw(bu) });
          o += g({ tf: T(272, 100, p(t, 36.4, 37.1, E.back)) }, rect(-14, -12, 28, 24, { rx: 5, fill: C.A }) + tx(0, 6, '*A*', { size: 19, fill: C.paper }));
        }
        const g1 = vis(t, 36.4, 58.5), g2 = vis(t, 37, 58.5);
        o += on(g1, tx(320, 264, '*A* = {2, 4, 6}', { size: 30, op: g1, tf: T(0, 8 * (1 - g1)) }));
        o += on(g2, tx(320, 298, '«esce un numero pari»', { size: 20, fill: C.soft, op: g2, tf: T(0, 8 * (1 - g2)) }));
        const dk = p(t, 39.4, 40, E.back) * (1 - p(t, 49.2, 49.8, E.acc));
        if (dk > 0.01) {
          const d = dieAt(t, R3, 2, 24);
          o += die(326, 150 + d.dy, 44, d.face, { rot: d.rot, sc: dk });
        }
        o += pills(332, [{ s: "4 ∈ *A*: l'evento *A* si è verificato", icon: 'ok', col: 'var(--verde)', op: vis(t, 42, 44.9), u: p(t, 42.2, 42.8, E.lin) }]);
        o += pills(332, [{ s: "3 ∉ *A*: l'evento *A* non si è verificato", icon: 'no', col: 'var(--rosso)', op: vis(t, 47.2, 50.2), u: p(t, 47.4, 48, E.lin) }]);
        o += pills(332, [
          { s: 'Ω: evento certo', op: vis(t, 50.6, 58.5) },
          { s: '∅: evento impossibile', op: vis(t, 52.6, 58.5) },
          { s: '{6}: un solo esito', op: vis(t, 54.6, 58.5) },
        ]);
      }
      return o;
    },
  };
  /* la clip si divide in due, perché nel testo gli esiti (1.1) e gli eventi (1.2) sono sezioni diverse */
  const taglia = (c, a, b) => c.filter((x) => x[0] >= a && x[0] < b).map((x) => [x[0] - a, x[1]]);
  PV.add('esiti', {
    sec: '1.1',
    short: 'Esperimento e spazio campionario',
    title: 'Esperimento aleatorio e spazio campionario',
    alt: 'Animazione: un dado viene lanciato più volte; i sei esiti formano lo spazio campionario Ω, un elenco esaustivo di esiti che si escludono a vicenda.',
    dur: 33.5,
    poster: 30,
    chap: taglia(ESITI.chap, 0, 33.5),
    caps: taglia(ESITI.caps, 0, 33.5),
    frame: ESITI.frame,
  });
  PV.add('evento', {
    sec: '1.2',
    short: 'Gli eventi',
    title: 'Evento: un sottoinsieme di Ω',
    alt: 'Animazione: gli esiti pari di un dado formano l’evento A; A si verifica se l’esito uscito sta dentro A. Casi limite: l’evento certo, l’evento impossibile e il singolo esito.',
    dur: 24.5,
    poster: 9.1,
    chap: [[0, 'Gli eventi']],
    caps: taglia(ESITI.caps, 33.5, 58),
    frame: (t) => ESITI.frame(t + 33.5),
  });

  /* ======================================================================
     Diagramma di Venn condiviso da "operazioni" e "demorgan" (dado: A = pari,
     B = più di 4). Le regioni si disegnano con maschere SVG.
     ====================================================================== */
  const FR = [48, 80, 544, 260]; // cornice Ω: x, y, larghezza, altezza
  const VA = [262, 210, 88], VB = [378, 210, 88]; // cerchi A e B: cx, cy, r
  const SLOT = { 1: [92, 124], 2: [226, 172], 3: [548, 296], 4: [226, 248], 5: [414, 210], 6: [320, 210] };
  const LENS = 'M320 143.82A88 88 0 0 1 320 276.18A88 88 0 0 1 320 143.82Z'; // A ∩ B
  const SET = { union: [2, 4, 5, 6], inter: [6], notA: [1, 3, 5], notB: [1, 2, 3, 4], AminusB: [2, 4], notUnion: [1, 3], notInter: [1, 2, 3, 4, 5] };
  const inA = (n) => n % 2 === 0, inB = (n) => n > 4;

  /* regione colorata dentro la cornice; kind come in SET. id deve essere unico nel frame */
  function region(id, kind, col, op) {
    if (!(op > 0.004)) return '';
    const [x, y, w, h] = FR;
    const cA = (f, a) => circ(VA[0], VA[1], VA[2], { fill: f, ...a }), cB = (f, a) => circ(VB[0], VB[1], VB[2], { fill: f, ...a });
    const mask = (inner) => `<mask id="${id}">${rect(x, y, w, h, { fill: '#fff' })}${inner}</mask>` + rect(x, y, w, h, { rx: 16, fill: col, mask: `url(#${id})` });
    let s;
    if (kind === 'union') s = cA(col) + cB(col);
    else if (kind === 'inter') s = `<clipPath id="${id}">${cA('#000')}</clipPath>` + cB(col, { 'clip-path': `url(#${id})` });
    else if (kind === 'notA') s = mask(cA('#000'));
    else if (kind === 'notB') s = mask(cB('#000'));
    else if (kind === 'notUnion') s = mask(cA('#000') + cB('#000'));
    else if (kind === 'notInter') s = mask(path(LENS, { fill: '#000' }));
    else if (kind === 'AminusB') s = `<mask id="${id}">${rect(x, y, w, h, { fill: '#fff' })}${cB('#000')}</mask>` + cA(col, { mask: `url(#${id})` });
    return g({ op }, s);
  }
  /* cerchi A e B che si disegnano (ua, ub da 0 a 1), con le etichette */
  const circles = (ua, ub) =>
    circ(VA[0], VA[1], VA[2], { fill: C.A, fo: 0.07 * ua, stroke: C.A, sw: 2.5, ...draw(ua) }) +
    circ(VB[0], VB[1], VB[2], { fill: C.B, fo: 0.07 * ub, stroke: C.B, sw: 2.5, ...draw(ub) }) +
    on(ua, tx(186, 134, '*A*', { size: 26, fill: C.A, op: ua })) +
    on(ub, tx(454, 134, '*B*', { size: 26, fill: C.B, op: ub }));
  const frame0 = (u) => rect(FR[0], FR[1], FR[2], FR[3], { rx: 16, stroke: C.soft, sw: 2.2, ...draw(u) });
  const omegaTag = (op) => on(op, g({ op }, rect(48, 70, 32, 24, { rx: 5, fill: C.soft }) + tx(64, 88, 'Ω', { size: 19, fill: C.paper })));

  /* ======================================================================
     1.2 · Operazioni fra eventi: unione, intersezione, complementare, differenza
     ====================================================================== */
  const OPS = [
    { t0: 16, t1: 27, kind: 'union', head: '*A* ∪ *B*', sub: '«*A* oppure *B*», anche tutti e due' },
    { t0: 27, t1: 37, kind: 'inter', head: '*A* ∩ *B*', sub: '«*A* e *B*» insieme' },
    { t0: 37, t1: 47, kind: 'notA', head: '*A*^c', sub: '«non *A*»: tutto ciò che sta fuori da *A*' },
    { t0: 47, t1: 56.5, kind: 'AminusB', head: '*A* ∖ *B*', sub: '«*A* ma non *B*»' },
  ];
  const lst = (a) => '{' + a.join(', ') + '}';

  PV.add('operazioni', {
    sec: '1.2',
    short: 'Operazioni fra eventi',
    title: 'Operazioni fra eventi: unione, intersezione, complementare',
    alt: 'Animazione: gli eventi A (pari) e B (più di 4) sul dado, disposti in un diagramma di Venn; si evidenziano unione, intersezione, complementare e differenza.',
    dur: 56.5,
    poster: 20.5,
    chap: [[0, 'I due eventi'], [16, 'A oppure B'], [27, 'A e B'], [37, 'non A'], [47, 'A ma non B']],
    caps: [
      [0, 'Sul dado prendiamo due eventi: *A* = «esce pari» = {2, 4, 6} e *B* = «esce più di 4» = {5, 6}.'],
      [7, 'Il 6 sta in tutti e due: è pari ed è maggiore di 4.'],
      [9.5, 'Per vedere cosa succede li mettiamo in un diagramma di Venn: un cerchio per evento, e il 6 nella zona comune.'],
      [16, "L'unione *A* ∪ *B* è «*A* oppure *B*»: gli esiti che stanno in almeno uno dei due. Il 6 si conta una volta sola."],
      [27, "L'intersezione *A* ∩ *B* è «*A* e *B* insieme»: gli esiti in comune. Qui c'è solo il 6."],
      [37, 'Il complementare *A*^c è «non *A*»: tutti gli esiti di Ω che non stanno in *A*.'],
      [47, '*A* ∖ *B* è «*A* ma non *B*»: gli esiti di *A*, tolti quelli che stanno anche in *B*.'],
    ],
    frame(t) {
      let o = '';
      const fu = p(t, 0.2, 1.2, E.io);
      o += frame0(fu) + omegaTag(p(t, 1, 1.5));
      const h1 = vis(t, 0.2, 9.4), h2 = vis(t, 9.8, 15.8);
      o += on(h1, tx(320, 44, 'Due eventi sul dado', { size: 26, op: h1 })) + on(h2, tx(320, 44, 'Il diagramma di Venn', { size: 26, op: h2 }));

      /* regioni evidenziate, una per operazione */
      const U = OPS.map((op) => vis(t, op.t0 + 0.2, op.t1, 0.6, 0.5));
      OPS.forEach((op, k) => (o += region('ro' + k, op.kind, C.hi, 0.42 * U[k])));
      const vu = p(t, 9.8, 11.2, E.io), vb = p(t, 10.3, 11.7, E.io);
      o += circles(vu, vb);

      /* caselle: in fila, poi nel diagramma */
      for (let n = 1; n <= 6; n++) {
        const i = n - 1, t0 = 0.3 + i * 0.22;
        const r = p(t, 9.6 + i * 0.15, 11.4 + i * 0.15, E.io);
        const [sx, sy] = SLOT[n];
        const [x, y] = arc(ROW[i], lerp(192, 170, p(t, t0, t0 + 0.6)), sx, sy, r, n % 2 ? 26 : -26);
        const s = lerp(56, 40, r);
        const ua = p(t, 3.5, 4.3) * (1 - r), ub = p(t, 7, 7.8) * (1 - r);
        let ring, ro = 0, veil, vo = 0.16, extra = '', sc = lerp(0.3, 1, p(t, t0, t0 + 0.7, E.back));
        if (inA(n) && ua > 0.01) { ring = C.A; ro = ua; veil = C.A; vo = 0.16 * ua; }
        if (inB(n) && ub > 0.01) {
          if (ring) extra = rect(-s / 2 + 5, -s / 2 + 5, s - 10, s - 10, { rx: s * 0.12, stroke: C.B, sw: 2.5, so: ub });
          else { ring = C.B; ro = ub; veil = C.B; vo = 0.16 * ub; }
        }
        let act = 0, any = 0;
        OPS.forEach((op, k) => { any += U[k]; if (SET[op.kind].includes(n)) act += U[k]; });
        if (act > 0.01) { ring = C.hi; ro = act; sc *= 1 + 0.1 * act; }
        o += tile(x, y, s, n, { sc, op: p(t, t0, t0 + 0.25) * (1 - 0.62 * (any - act)), ring, ro, veil, vo, extra });
      }

      /* capitolo 1: le due formule */
      const fa = vis(t, 3.5, 9.4), fb = vis(t, 7, 9.4);
      o += on(fa, tx(300, 258, '*A* = {2, 4, 6}', { size: 28, fill: C.A, ta: 'end', op: fa }) + tx(316, 258, '«esce pari»', { ff: SANS, size: 18, fill: C.soft, ta: 'start', op: fa }));
      o += on(fb, tx(300, 298, '*B* = {5, 6}', { size: 28, fill: C.B, ta: 'end', op: fb }) + tx(316, 298, '«esce più di 4»', { ff: SANS, size: 18, fill: C.soft, ta: 'start', op: fb }));
      const dl = vis(t, 11.6, 16.2);
      o += on(dl, tx(200, 326, '«pari»', { ff: SANS, size: 17, fill: C.soft, op: dl }) + tx(440, 326, '«più di 4»', { ff: SANS, size: 17, fill: C.soft, op: dl }));

      /* capitoli 2-5: titolo, risultato e spiegazione di ogni operazione */
      OPS.forEach((op, k) => {
        if (!(U[k] > 0.004)) return;
        const r = p(t, op.t0 + 3.4, op.t0 + 4.1);
        o += tx(320, 40, op.head, { size: 30, op: U[k] * (1 - r) }) + tx(320, 40, op.head + ' = ' + lst(SET[op.kind]), { size: 30, op: U[k] * r });
        o += tx(320, 66, op.sub, { ff: SANS, size: 17, fill: C.soft, op: U[k] });
      });
      return o;
    },
  });

  /* ======================================================================
     1.2 · Leggi di De Morgan
     ====================================================================== */
  PV.add('demorgan', {
    sec: '1.2',
    short: 'Leggi di De Morgan',
    title: 'Leggi di De Morgan: «non (A oppure B)» e «non (A e B)»',
    alt: 'Animazione: sul diagramma di Venn si mostra che il complementare dell’unione è l’intersezione dei complementari, e il complementare dell’intersezione è l’unione dei complementari; poi l’esempio dei tre server.',
    dur: 52,
    poster: 17,
    chap: [[0, '«né A né B»'], [20, '«non A, oppure non B»'], [36, 'Almeno uno = non nessuno']],
    caps: [
      [0, 'Cominciamo da (*A* ∪ *B*)^c: «non succede *A* oppure *B*». Sono gli esiti fuori da tutti e due i cerchi: 1 e 3.'],
      [8.5, 'Guardiamo ora *A*^c e *B*^c: fuori da *A*, e fuori da *B*. La zona dove i due si sovrappongono è proprio {1, 3}.'],
      [15, 'Sono lo stesso insieme: (*A* ∪ *B*)^c = *A*^c ∩ *B*^c. «Non è vero che piove o nevica» vuol dire «non piove e non nevica».'],
      [20, 'Seconda legge: (*A* ∩ *B*)^c, cioè tutto tranne la zona comune. Sono 1, 2, 3, 4 e 5.'],
      [27, 'E *A*^c ∪ *B*^c, cioè fuori da *A* oppure fuori da *B*, dà gli stessi cinque esiti.'],
      [32.5, 'Quindi (*A* ∩ *B*)^c = *A*^c ∪ *B*^c: «non ho superato tutti e due» vuol dire «ne manca almeno uno».'],
      [36, 'Tre server, 8 stati possibili (1 = risponde). «Almeno uno risponde» è tutto tranne 000…'],
      [43, '…cioè il contrario di «nessuno risponde». Quando leggi «almeno uno», calcola «nessuno» e passa al contrario.'],
    ],
    frame(t) {
      let o = '';
      /* capitoli 1-2: Venn */
      const venn = 1 - p(t, 35.2, 36, E.acc);
      if (venn > 0.004) {
        o += g({ op: venn }, frame0(p(t, 0.1, 1, E.io)) + omegaTag(p(t, 0.8, 1.3)));
        const uU = vis(t, 0.8, 8.8, 0.6, 0.5), uA = vis(t, 8.5, 15.2, 0.6, 0.5), uE = vis(t, 15, 20, 0.6, 0.5);
        const uI = vis(t, 20.2, 27.2, 0.6, 0.5), uB = vis(t, 27, 32.7, 0.6, 0.5), uF = vis(t, 32.5, 36, 0.6, 0.5);
        o += g({ op: venn }, region('d0', 'notUnion', C.hi, 0.42 * uU) + region('d1', 'notA', C.A, 0.3 * uA) + region('d2', 'notB', C.B, 0.3 * uA));
        o += g({ op: venn }, region('d3', 'notUnion', C.hi, 0.42 * uE) + region('d4', 'notInter', C.hi, 0.42 * uI) + region('d5', 'notA', C.A, 0.3 * uB) + region('d6', 'notB', C.B, 0.3 * uB) + region('d7', 'notInter', C.hi, 0.42 * uF));
        o += g({ op: venn }, circles(p(t, 0.3, 1.4, E.io), p(t, 0.6, 1.7, E.io)));
        const heads = [
          [0.8, 8.8, '(*A* ∪ *B*)^c = {1, 3}', '«non succede né *A* né *B*»'],
          [8.5, 15.2, '*A*^c ∩ *B*^c = {1, 3}', '«non *A*» e anche «non *B*»'],
          [15, 20, '(*A* ∪ *B*)^c = *A*^c ∩ *B*^c', 'prima legge di De Morgan'],
          [20.2, 27.2, '(*A* ∩ *B*)^c = {1, 2, 3, 4, 5}', '«non succedono *A* e *B* insieme»'],
          [27, 32.7, '*A*^c ∪ *B*^c = {1, 2, 3, 4, 5}', '«non *A*», oppure «non *B*»'],
          [32.5, 36, '(*A* ∩ *B*)^c = *A*^c ∪ *B*^c', 'seconda legge di De Morgan'],
        ];
        for (const [a, b, h, sub] of heads) {
          const op = vis(t, a, b, 0.6, 0.5) * venn;
          o += on(op, tx(320, 40, h, { size: 28, op }) + tx(320, 66, sub, { ff: SANS, size: 17, fill: C.soft, op }));
        }
        const eq = Math.max(bump(t, 15.5, 3.6) > 0.3 ? 1 : 0, bump(t, 32.8, 3) > 0.3 ? 1 : 0);
        o += on(eq * venn, g({ op: venn }, check(552, 40, 26, p(t, 15.6, 16.3, E.lin) * p(t, 15.5, 15.6) + p(t, 32.9, 33.6, E.lin) * p(t, 32.8, 32.9), {})));
        for (let n = 1; n <= 6; n++) {
          const [x, y] = SLOT[n];
          const sc = p(t, 0.3 + n * 0.1, 1 + n * 0.1, E.back), op = p(t, 0.3 + n * 0.1, 0.6 + n * 0.1) * venn;
          const inU = n === 1 || n === 3;
          const act = (inU ? uU + uA + uE : 0) + (n !== 6 ? uI + uB + uF : 0);
          const any = uU + uA + uE + uI + uB + uF;
          o += tile(x, y, 40, n, { sc: lerp(0.3, 1, sc) * (1 + 0.1 * Math.min(1, act)), op: op * (1 - 0.62 * Math.max(0, any - act)), ring: act > 0.01 ? C.hi : undefined, ro: Math.min(1, act) });
        }
      }

      /* capitolo 3: tre server, otto stati */
      const a3 = p(t, 35.6, 36.4);
      if (a3 > 0.004) {
        const bits = ['000', '001', '010', '011', '100', '101', '110', '111'];
        const hd = vis(t, 36, 52, 0.6, 0.5);
        const noneU = p(t, 43, 44);
        o += on(hd, tx(320, 70, 'ogni cifra è un server (A, B, C): 1 = risponde', { ff: SANS, size: 17, fill: C.soft, op: hd }));
        o += on(hd, tx(320, 44, 'Tre server, otto stati', { size: 26, op: hd * (1 - noneU) }) + tx(320, 44, '(*A* ∪ *B* ∪ *C*)^c = *A*^c ∩ *B*^c ∩ *C*^c', { size: 26, op: hd * noneU }));
        bits.forEach((b, i) => {
          const cx = 125 + (i % 4) * 130, cy = 130 + Math.floor(i / 4) * 84;
          const isNone = i === 0;
          const atLeast = p(t, 37, 38) * (1 - noneU), none = noneU;
          const ro = isNone ? none : atLeast, ring = isNone ? C.A : C.hi;
          const dimOp = isNone ? 1 - 0.6 * atLeast * (1 - noneU) : 1 - 0.6 * none;
          o += tile(cx, cy, 64, b, { size: 22, sc: lerp(0.3, 1, p(t, 36.1 + i * 0.1, 36.8 + i * 0.1, E.back)), op: a3 * dimOp, ring, ro, veil: ring, vo: 0.18 * ro });
        });
        const l1 = vis(t, 38, 44.2), l2 = vis(t, 44, 52);
        o += on(l1, tx(320, 290, '«almeno uno risponde» = tutti tranne 000', { ff: SANS, size: 19, op: l1 }));
        o += on(l2, tx(320, 290, '«nessuno risponde» = {000}', { ff: SANS, size: 19, op: l2 }));
        const tip = vis(t, 46, 52, 0.6, 0.01);
        o += on(tip, pills(330, [{ s: '«almeno uno» → calcola «nessuno», poi passa al contrario', op: tip }]));
      }
      return o;
    },
  });

  /* ======================================================================
     1.4 · Le tre regole: la probabilità come una torta che vale 1
     ====================================================================== */
  const PIE = [320, 156, 88]; // la torta: cx, cy, r
  const MX = 110, MS = 70, MY = 272, MH = 40; // la barra lunga 1: una casella per esito
  const SL = [null]; // fetta n disegnata attorno al suo baricentro (coordinate relative)
  for (let n = 1; n <= 6; n++) {
    const a0 = ((-90 + (n - 1) * 60) * Math.PI) / 180, a1 = a0 + Math.PI / 3, m = (a0 + a1) / 2, r = PIE[2];
    const cx = Math.cos(m) * r * 0.55, cy = Math.sin(m) * r * 0.55;
    const q = (a) => [Math.cos(a) * r - cx, Math.sin(a) * r - cy].map((v) => v.toFixed(2));
    const [x0, y0] = q(a0), [x1, y1] = q(a1);
    SL.push({ d: `M${(-cx).toFixed(2)} ${(-cy).toFixed(2)}L${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}Z`, cx, cy, m });
  }
  const segX = (n) => MX + (n - 1) * MS;

  PV.add('assiomi', {
    sec: '1.4',
    short: 'La torta e le tre regole',
    title: 'Le tre regole: la probabilità come una torta che vale 1',
    alt: 'Animazione: una torta che vale 1 si divide in sei fette uguali come gli esiti di un dado, poi diventa una barra lunga 1; sulla barra si vedono le tre regole: nessuna fetta è negativa, la torta intera vale 1, le fette di eventi senza esiti in comune si sommano.',
    dur: 56,
    poster: 18.5,
    chap: [[0, 'La torta'], [23, 'Regola 1: mai sotto zero'], [32, 'Regola 2: totale 1'], [42, 'Regola 3: somma']],
    caps: [
      [0, 'Ora diamo un numero a ogni evento. Immagina la probabilità come una torta che vale 1 intero, da spartire fra gli esiti.'],
      [7, 'Con un dado la torta si divide in sei fette uguali, una per esito: ogni esito vale 1/6.'],
      [13, 'La probabilità di un evento è la quantità di torta sui suoi esiti. Per «esce pari» sono tre fette: *P*(*A*) = 3/6.'],
      [20, 'Per fare i conti srotoliamo la torta in una barra lunga 1: una casella per ogni fetta.'],
      [23, 'Regola 1: nessuna fetta è negativa. *P*(*A*) ≥ 0 per ogni evento *A*.'],
      [32, 'Regola 2: la torta intera vale 1. Sommando tutte le fette si arriva a *P*(Ω) = 1.'],
      [42, 'Regola 3: se due eventi non hanno esiti in comune, le loro fette si sommano. Qui *A* = {2, 4, 6} e *B* = {1}.'],
      [49.5, 'Basta mettere le fette una dopo l’altra: 3/6 + 1/6 = 4/6.'],
    ],
    frame(t) {
      let o = '';
      const head = (a, b, s, sub) => {
        const op = vis(t, a, b);
        return on(op, tx(320, 44, s, { size: 26, op }) + (sub ? tx(320, 70, sub, { ff: SANS, size: 17, fill: C.soft, op }) : ''));
      };
      o += head(0.2, 6.8, 'La probabilità è una torta') + head(7, 12.8, 'Sei esiti, sei fette') + head(13.2, 19.8, 'Un evento è una parte della torta') + head(20, 23.2, 'La torta diventa una barra lunga 1');
      o += head(23.2, 32.2, 'Regola 1: mai sotto zero', 'nessuna fetta è negativa') + head(32.2, 42.2, 'Regola 2: il totale vale 1', 'la torta intera vale 1');
      o += head(42.2, 56.5, 'Regola 3: le fette si sommano', 'eventi senza esiti in comune: A = {2, 4, 6} e B = {1}');

      /* --- la torta (0-23) e le fette che volano nella barra --- */
      const sepU = p(t, 7.2, 8.4), aU = p(t, 13.4, 14.6, E.back);
      const disc = p(t, 0.3, 1.3, E.back) * (1 - p(t, 7, 7.4));
      if (disc > 0.004) {
        o += circ(PIE[0], PIE[1], PIE[2] * disc, { fill: C.hi, fo: 0.3, stroke: C.soft, sw: 1.8 });
        const co = p(t, 1, 1.6) * (1 - p(t, 6.4, 7));
        o += on(co, tx(PIE[0], PIE[1] + 14, '1', { size: 44, op: co }));
      }
      for (let n = 1; n <= 6; n++) {
        const S = SL[n], tf = 20.2 + (n - 1) * 0.25, u = p(t, tf, tf + 1.4, E.io);
        const e = 7 * sepU + (n % 2 === 0 ? 18 * aU : 0);
        const px = PIE[0] + S.cx + Math.cos(S.m) * e, py = PIE[1] + S.cy + Math.sin(S.m) * e;
        const [x, y] = arc(px, py, segX(n) + (MS - 4) / 2, MY + MH / 2, u, 36);
        const so = p(t, 7, 7.4), vanish = 1 - p(u, 0.55, 1);
        if (so > 0.004 && vanish > 0.004) {
          let b = path(S.d, { fill: C.hi, fo: 0.3, stroke: C.soft, sw: 1.8 });
          if (n % 2 === 0) b += path(S.d, { fill: C.A, fo: 0.4 * aU });
          const lo = p(t, 8, 8.8) * (1 - p(u, 0, 0.3));
          b += on(lo, tx(Math.cos(S.m) * PIE[2] * 0.62 - S.cx, Math.sin(S.m) * PIE[2] * 0.62 - S.cy + 2, n, { size: 24, op: lo }) + tx(Math.cos(S.m) * PIE[2] * 0.62 - S.cx, Math.sin(S.m) * PIE[2] * 0.62 - S.cy + 20, '1/6', { ff: SANS, size: 15, fill: C.soft, op: lo }));
          o += g({ tf: T(x, y, lerp(1, 0.4, u)), op: so * vanish }, b);
        }
      }
      /* formula di P(A), scritta man mano */
      const pf = vis(t, 14.2, 19.8);
      o += on(pf, wipe('as-w', 90, 270, 460, 50, p(t, 14.4, 17.4, E.lin), tx(320, 304, '*P*(*A*) = 1/6 + 1/6 + 1/6 = 3/6', { size: 28, op: pf })));

      /* --- la barra lunga 1 (da 20.2) --- */
      const mo = p(t, 21, 22);
      if (mo > 0.004) {
        /* massa: caselle che si riempiono nella regola 2, poi evidenze di A e B nella regola 3 */
        const keep = 1 - p(t, 41.2, 42);
        const aE = p(t, 42.6, 43.4), bE = aE;
        for (let n = 1; n <= 6; n++) {
          const arr = p(t, 20.2 + (n - 1) * 0.25 + 0.8, 20.2 + (n - 1) * 0.25 + 1.4);
          const fillU = p(t, 33.6 + (n - 1) * 0.8, 34.2 + (n - 1) * 0.8) * keep;
          let b = rect(segX(n), MY, MS - 4, MH, { rx: 6, fill: C.hi, fo: 0.55 * fillU, stroke: C.soft, sw: 1.7 });
          if (n % 2 === 0) b += rect(segX(n), MY, MS - 4, MH, { rx: 6, fill: C.A, fo: 0.38 * aE, stroke: C.A, so: aE, sw: 2.2 });
          if (n === 1) b += rect(segX(n), MY, MS - 4, MH, { rx: 6, fill: C.B, fo: 0.38 * bE, stroke: C.B, so: bE, sw: 2.2 });
          b += tx(segX(n) + (MS - 4) / 2, MY + MH / 2 + 7, n, { size: 20 });
          o += g({ op: arr }, b);
        }
        const ticks = ['0', '1/6', '2/6', '3/6', '4/6', '5/6', '1'];
        o += g({ op: p(t, 22, 23) }, ticks.map((s, k) => tx(MX + k * MS - 2, MY + MH + 22, s, { ff: SANS, size: 16, fill: C.soft })).join(''));
        o += on(mo, '');
      }

      /* regola 1: una fetta negativa non esiste */
      const r1 = vis(t, 23.4, 31.8);
      if (r1 > 0.004) {
        o += tx(320, 140, '*P*(*A*) ≥ 0', { size: 44, op: r1 });
        o += tx(320, 176, 'per ogni evento *A*', { ff: SANS, size: 18, fill: C.soft, op: r1 });
        const u = p(t, 26, 27.6, E.io), bad = p(t, 27.6, 28.2);
        const w = (MS - 4) * u;
        o += g({ op: r1 }, rect(MX - w, MY, w, MH, { rx: 6, fill: 'var(--rosso)', fo: 0.22, stroke: 'var(--rosso)', sw: 2, da: '5 4' }));
        o += on(bad, g({ op: r1 * bad }, tx(MX - (MS - 4) / 2, MY - 12, '−1/6', { size: 20, fill: 'var(--rosso)' }) + cross(MX - (MS - 4) / 2, MY + MH / 2, 22, p(t, 27.8, 28.4, E.lin)) + tx(320, 232, 'una fetta negativa non esiste', { ff: SANS, size: 18, fill: 'var(--rosso)' })));
      }

      /* regola 2: le caselle si riempiono, la somma cresce fino a 1 */
      const r2 = vis(t, 32.4, 41.8);
      if (r2 > 0.004) {
        o += tx(320, 130, '*P*(Ω) = 1/6 + 1/6 + 1/6 + 1/6 + 1/6 + 1/6 = 1', { size: 22, op: r2 });
        const k = Math.min(6, Math.floor((t - 33.9) / 0.8) + 1), edge = MX + Math.max(0, k) * MS - 4;
        if (t > 33.6 && k > 0) {
          o += g({ op: r2 }, brace(MX, edge, MY - 10, C.soft, 1, -1) + tx((MX + edge) / 2, MY - 24, k === 6 ? '6/6 = 1' : k + '/6', { size: 20 }));
        }
        const fl = p(t, 38.6, 39.4);
        o += on(fl, g({ op: r2 * fl }, check(550, MY + MH / 2, 22, p(t, 38.8, 39.6, E.lin)) + tx(320, 190, 'tutta la torta vale 1', { ff: SANS, size: 19, fill: 'var(--verde)' })));
      }

      /* regola 3: eventi disgiunti, le fette si mettono in fila */
      const r3 = p(t, 42.4, 43);
      if (r3 > 0.004) {
        o += tx(320, 112, '*P*(*A* ∪ *B*) = *P*(*A*) + *P*(*B*)', { size: 28, op: r3 });
        const order = [2, 4, 6, 1];
        order.forEach((n, i) => {
          const u = p(t, 44 + i * 0.5, 45.2 + i * 0.5, E.io);
          if (u <= 0) return;
          const [x, y] = arc(segX(n), MY, MX + i * MS, 136, u, 30);
          const col = n === 1 ? C.B : C.A;
          o += g({ op: p(u, 0, 0.2) }, rect(x, y, MS - 4, 36, { rx: 6, fill: col, fo: 0.32, stroke: col, sw: 2.2 }) + tx(x + (MS - 4) / 2, y + 25, n, { size: 20 }));
        });
        const b1 = p(t, 46.4, 47.2), b2 = p(t, 47, 47.8);
        o += on(b1, brace(MX, MX + 3 * MS - 4, 182, C.A, b1) + tx(MX + 1.5 * MS - 2, 208, '*P*(*A*) = 3/6', { size: 18, fill: C.A, op: b1 }));
        o += on(b2, brace(MX + 3 * MS, MX + 4 * MS - 4, 182, C.B, b2) + tx(MX + 3.5 * MS - 2, 208, '*P*(*B*) = 1/6', { size: 18, fill: C.B, op: b2 }));
        const rs = p(t, 49.4, 50.4);
        o += on(rs, tx(320, 250, '= 3/6 + 1/6 = 4/6', { size: 26, op: rs, tf: T(0, 8 * (1 - rs)) }));
      }
      return o;
    },
  });

  /* ======================================================================
     1.4 · Complementare e unione di due eventi qualsiasi
     ====================================================================== */
  const CY = 262; // riga delle caselle (una per esito, larga 1/6 di barra)
  const SY = 136; // riga della somma P(A) + P(B)
  const cellX = (i) => MX + i * MS;
  /* casella larga MS-4, alta 40; x,y = angolo in alto a sinistra; col = velo, ring = bordo evidenziato */
  function cell(x, y, label, a = {}) {
    const { col, vo = 0.32, stroke = C.soft, sw = 1.7, op = 1, ring, ro = 1, extra = '' } = a;
    let o = rect(x, y, MS - 4, 40, { rx: 6, fill: col || 'none', fo: vo, stroke, sw });
    if (ring) o += rect(x, y, MS - 4, 40, { rx: 6, stroke: ring, so: ro, sw: 3 });
    return g({ op }, o + extra + tx(x + (MS - 4) / 2, y + 27, label, { size: 20 }));
  }
  const grp = (n) => (n % 2 === 0 ? n / 2 - 1 : 3 + (n - 1) / 2); // posto della casella n quando A sta a sinistra

  PV.add('conseguenze', {
    sec: '1.4',
    short: 'Complementare e unione',
    title: 'Complementare e unione di due eventi: P(Aᶜ) = 1 − P(A), P(A ∪ B)',
    alt: 'Animazione su una barra lunga 1 divisa in sei caselle: le caselle dell’evento A (pari) stanno da una parte e le altre dall’altra, quindi P(non A) = 1 − P(A); poi, per A e B che si sovrappongono nel 6, sommare le probabilità conta due volte il 6 e va tolto P(A ∩ B).',
    dur: 56,
    poster: 17,
    chap: [[0, 'Il complementare'], [20, 'Unione con sovrapposizione']],
    caps: [
      [0, 'Dalle tre regole si ricava tutto il resto. Primo risultato: il complementare. Prendiamo *A* = «esce pari» = {2, 4, 6}.'],
      [8, 'Mettiamo le caselle di *A* da una parte e le altre dall’altra: insieme fanno tutta la barra, che vale 1.'],
      [12, 'Quello che non sta in *A* vale il resto: *P*(*A*^c) = 1 − *P*(*A*) = 1 − 3/6 = 3/6.'],
      [16, 'È comodo quando «non *A*» è più facile da calcolare di *A*.'],
      [20, 'Per due eventi qualsiasi la cosa si complica. Prendiamo *A* = {2, 4, 6} e *B* = {5, 6}: il 6 sta in tutti e due.'],
      [26.5, 'Se sommo le due probabilità ottengo 3/6 + 2/6 = 5/6.'],
      [29.5, 'Ma l’unione *A* ∪ *B* = {2, 4, 5, 6} sono quattro caselle: vale 4/6, non 5/6.'],
      [34.5, 'Il 6 è stato contato due volte: una in *A* e una in *B*.'],
      [40.5, 'Lo togliamo una volta: sottraiamo la probabilità dell’intersezione, *P*(*A* ∩ *B*) = 1/6.'],
      [46, 'Così *P*(*A* ∪ *B*) = *P*(*A*) + *P*(*B*) − *P*(*A* ∩ *B*) = 4/6. Se *A* e *B* sono disgiunti l’ultimo termine vale 0.'],
    ],
    frame(t) {
      let o = '';
      const head = (a, b, s, sub) => {
        const op = vis(t, a, b);
        return on(op, tx(320, 44, s, { size: 26, op }) + (sub ? tx(320, 70, sub, { ff: SANS, size: 17, fill: C.soft, op }) : ''));
      };
      o += head(0.2, 19.6, 'Il complementare', '*A* = {2, 4, 6}, «esce pari»') + head(20.2, 56.5, 'Unione di due eventi qualsiasi', '*A* = {2, 4, 6} e *B* = {5, 6} si sovrappongono nel 6');

      /* --- la barra: caselle in fila, poi A a sinistra, poi di nuovo in fila --- */
      const ch2 = p(t, 20.3, 21);
      for (let n = 1; n <= 6; n++) {
        const t0 = 0.4 + (n - 1) * 0.12;
        const rg = p(t, 4.5 + (n - 1) * 0.12, 6.2 + (n - 1) * 0.12, E.io), back = p(t, 20.3 + (n - 1) * 0.1, 22 + (n - 1) * 0.1, E.io);
        const m = rg * (1 - back), idx = lerp(n - 1, grp(n), m), dy = (n % 2 ? 18 : -18) * 4 * m * (1 - m);
        const ua = p(t, 2.6, 3.4) * (1 - ch2), uc = p(t, 9.5, 10.3) * (1 - ch2);
        const a2 = p(t, 21.5, 22.3), un = p(t, 29.5, 30.3);
        let col, vo = 0.3, ring, ro = 0, extra = '';
        if (n % 2 === 0 && ua > 0.01) { col = C.A; vo = 0.3 * ua; ring = C.A; ro = ua; }
        if (n % 2 === 1 && uc > 0.01) { col = C.hi; vo = 0.3 * uc; ring = C.hi; ro = uc; }
        if (a2 > 0.01) {
          if (n % 2 === 0) { col = C.A; vo = 0.3 * a2; ring = C.A; ro = a2; }
          if (n > 4) {
            if (n % 2 === 0) extra = rect(cellX(idx) + 5, CY + 5, MS - 14, 30, { rx: 4, stroke: C.B, so: a2, sw: 2.5 });
            else { col = C.B; vo = 0.3 * a2; ring = C.B; ro = a2; }
          }
        }
        if (un > 0.01 && [2, 4, 5, 6].includes(n)) { ring = C.hi; ro = Math.max(ro, un) * (1 - p(t, 37, 38)); if (ro < 0.01) ring = undefined; }
        o += cell(cellX(idx), CY + dy, n, { col, vo, ring, ro, extra, op: p(t, t0, t0 + 0.4) });
      }

      /* --- capitolo 1: le graffe del complementare --- */
      const bt = p(t, 7.4, 8.2), ba = p(t, 8.2, 9), bc = p(t, 9.8, 10.6), fo1 = 1 - ch2;
      o += on(bt * fo1, g({ op: bt * fo1 }, brace(cellX(0), cellX(5) + MS - 4, CY - 12, C.soft, 1, -1) + tx(320, CY - 28, '1', { size: 22 })));
      o += on(ba * fo1, g({ op: ba * fo1 }, brace(cellX(0), cellX(2) + MS - 4, CY + 52, C.A, 1) + tx(cellX(1) + (MS - 4) / 2, CY + 78, '*P*(*A*) = 3/6', { size: 20, fill: C.A })));
      const q = p(t, 12.2, 13);
      o += on(bc * fo1, g({ op: bc * fo1 }, brace(cellX(3), cellX(5) + MS - 4, CY + 52, C.hi, 1) + tx(cellX(4) + (MS - 4) / 2, CY + 78, '*P*(*A*^c) = ' + (q < 0.5 ? '?' : '3/6'), { size: 20, fill: C.hi })));
      const f1 = vis(t, 11.8, 19.6), f2 = vis(t, 13.4, 19.6);
      o += on(f1, tx(320, 118, '*P*(*A*^c) = 1 − *P*(*A*)', { size: 36, op: f1, tf: T(0, 8 * (1 - f1)) }));
      o += on(f2, tx(320, 158, '= 1 − 3/6 = 3/6', { size: 26, fill: C.soft, op: f2, tf: T(0, 8 * (1 - f2)) }));
      o += pills(192, [{ s: 'comodo quando «non A» è più facile di A', op: vis(t, 16, 19.6) }]);

      /* --- capitolo 2: la riga della somma, il doppio conteggio, la correzione --- */
      const S = [[2, C.A], [4, C.A], [6, C.A], [5, C.B], [6, C.B]];
      const rm = p(t, 40.6, 41.8, E.io); // il secondo 6 viene tolto
      S.forEach(([n, col], i) => {
        const u = p(t, 23 + i * 0.45, 24.2 + i * 0.45, E.io);
        if (u <= 0) return;
        const [x, y] = arc(cellX(n - 1), CY, cellX(i), SY, u, 30);
        const dup = (i === 2 || i === 4) ? bump(t, 34.6, 2.6) : 0;
        const gone = i === 4 ? rm : 0;
        o += cell(x, y - 14 * gone, n, { col, vo: 0.32, stroke: col, sw: 2.2, op: p(u, 0, 0.2) * (1 - gone), ring: dup > 0.01 ? 'var(--rosso)' : undefined, ro: dup });
        if (i === 4 && gone > 0.02) o += g({ op: gone * (1 - p(t, 43, 44.4)) }, cross(x + (MS - 4) / 2, y - 14 * gone + 20, 26, 1));
      });
      const sb = p(t, 26, 26.8) * (1 - p(t, 41, 41.8)), sa = sb;
      o += on(sb, g({ op: sb }, brace(cellX(0), cellX(2) + MS - 4, SY + 46, C.A, 1) + tx(cellX(1) + (MS - 4) / 2, SY + 70, '*P*(*A*) = 3/6', { size: 18, fill: C.A }) + brace(cellX(3), cellX(4) + MS - 4, SY + 46, C.B, 1) + tx(cellX(3) + MS - 2, SY + 70, '*P*(*B*) = 2/6', { size: 18, fill: C.B })));
      /* riga di commento sotto le graffe, una per volta */
      const lines = [
        [26.6, 29.5, '*P*(*A*) + *P*(*B*) = 3/6 + 2/6 = 5/6', C.ink],
        [29.8, 34.4, 'ma *A* ∪ *B* = {2, 4, 5, 6} vale 4/6', C.ink],
        [34.6, 40.4, 'il 6 è contato due volte', 'var(--rosso)'],
        [40.6, 46, 'togliamo una volta *P*(*A* ∩ *B*) = 1/6', C.ink],
      ];
      for (const [a, b, s2, col] of lines) {
        const op = vis(t, a, b, 0.4, 0.3);
        o += on(op, tx(320, 232, s2, { size: 22, fill: col, op, tf: T(0, 6 * (1 - op)) }));
      }
      const ub = vis(t, 30, 38, 0.5, 0.5);
      o += on(ub, g({ op: ub }, brace(cellX(1), cellX(5) + MS - 4, CY + 52, C.hi, 1) + tx(cellX(3) + MS - 2, CY + 78, '*P*(*A* ∪ *B*) = 4/6', { size: 20, fill: C.hi })));
      const ff = p(t, 46, 47);
      o += on(ff, tx(320, 108, '*P*(*A* ∪ *B*) = *P*(*A*) + *P*(*B*) − *P*(*A* ∩ *B*)', { size: 25, op: ff, tf: T(0, 8 * (1 - ff)) }));
      const fg = p(t, 48, 49);
      o += on(fg, tx(320, 232, '= 3/6 + 2/6 − 1/6 = 4/6', { size: 26, op: fg, tf: T(0, 8 * (1 - fg)) }));
      return o;
    },
  });

  /* ======================================================================
     1.3 · Spazi uniformi: due dadi, casi favorevoli su casi possibili
     ====================================================================== */
  const GX = 252, GY = 104, GP = 36; // griglia delle 36 coppie: angolo in alto a sinistra e passo (riga = primo dado, colonna = secondo)
  const gridXY = (i, j) => [GX + GP * (j - 0.5), GY + GP * (i - 0.5)];
  const HX = 320, HB = 322; // istogramma delle somme: centro e base
  const histXY = (i, j) => [HX + GP * (i + j - 7), HB - GP * (i - Math.max(1, i + j - 6) + 0.5)]; // la casella (i, j) cade nella colonna della somma i + j
  const sevT = (i) => 21.8 + 0.6 * (i - 1); // istante in cui si accende la coppia (i, 7 − i)

  PV.add('uniformi', {
    sec: '1.3',
    short: 'Due dadi: favorevoli su possibili',
    title: 'Spazi uniformi: due dadi, casi favorevoli su casi possibili',
    alt: 'Animazione: con esiti equiprobabili la probabilità è casi favorevoli su casi possibili. Con due dadi le 36 coppie formano una griglia 6 per 6 e la somma 7 si ottiene in 6 caselle, quindi 6/36. Le caselle cadono poi in un istogramma delle somme, che mostra che le somme non sono equiprobabili: 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1 trentaseiesimi.',
    dur: 57,
    poster: 41.8,
    chap: [[0, 'Favorevoli su possibili'], [14, 'Due dadi: 36 coppie'], [29, 'Le somme non sono uguali']],
    caps: [
      [0, 'Se tutti gli esiti sono equiprobabili, ognuno vale 1/*n*. Un dado ha sei esiti: 1/6 ciascuno.'],
      [6.5, 'Allora la probabilità di un evento è *P*(*A*) = casi favorevoli su casi possibili. Per «esce pari»: 3 su 6.'],
      [14, 'Con due dadi gli esiti sono le coppie (primo, secondo). Sono 36, tutte con la stessa probabilità.'],
      [21, 'Vogliamo la probabilità che la somma faccia 7. Le coppie giuste sono 6, quindi *P*(somma = 7) = 6/36 = 1/6.'],
      [29, 'Attenzione: le somme possibili sono 11, da 2 a 12, ma non per questo ognuna vale 1/11. Lo vediamo subito.'],
      [36.5, 'Facciamo cadere le 36 caselle sulla loro somma: il 7 ne raccoglie 6, il 2 e il 12 una sola.'],
      [43, 'Le coppie sono equiprobabili, le somme no: valgono 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1 trentaseiesimi.'],
      [50.5, 'Prima di dividere, chiediti sempre se gli oggetti che stai contando sono tutti equiprobabili.'],
    ],
    frame(t) {
      let o = '';
      o += heading(t, 0.2, 13.6, 'Spazio uniforme') + subline(t, 0.4, 6.3, 'esiti equiprobabili: con *n* esiti, ognuno vale 1/*n*') + subline(t, 6.8, 13.4, '*A* = «esce pari» = {2, 4, 6}');
      o += heading(t, 14, 28.9, 'Due dadi: 36 coppie', 'ogni coppia (primo, secondo) ha la stessa probabilità');
      o += heading(t, 29.4, 43, 'Le somme non sono equiprobabili', '11 somme possibili, ma non valgono tutte 1/11');
      o += heading(t, 43.6, 50.2, 'Coppie sì, somme no', 'sopra ogni colonna: il valore in trentaseiesimi');
      o += pills(52, [
        { s: 'le 36 coppie: equiprobabili', icon: 'ok', op: vis(t, 50.6, 57.5), u: p(t, 50.9, 51.5, E.lin) },
        { s: 'le 11 somme: no', icon: 'no', op: vis(t, 52.8, 57.5), u: p(t, 53.1, 53.7, E.lin) },
      ]);

      /* capitolo 1: sei esiti, l'evento «pari», favorevoli su possibili */
      const s1 = 1 - p(t, 13.4, 14.2);
      if (s1 > 0.004) {
        for (let n = 1; n <= 6; n++) {
          const t0 = 0.5 + (n - 1) * 0.2, h = n % 2 ? 0 : p(t, 7 + (n / 2 - 1) * 0.45, 7.5 + (n / 2 - 1) * 0.45), wl = p(t, 3 + n * 0.12, 3.4 + n * 0.12) * s1;
          o += tile(ROW[n - 1], 150, 56, n, { sc: lerp(0.3, 1, p(t, t0, t0 + 0.7, E.back)) * (1 + 0.08 * h), op: p(t, t0, t0 + 0.25) * s1, ring: h > 0.01 ? C.A : undefined, ro: h, veil: C.A, vo: 0.16 * h });
          o += on(wl, lb(ROW[n - 1], 208, '1/6', { size: 18, op: wl }));
        }
        const f1 = p(t, 9.6, 10.4) * s1, f2 = p(t, 11.4, 12.2) * s1;
        o += on(f1, g({ op: f1, tf: T(0, 8 * (1 - f1)) }, tx(214, 294, '*P*(*A*) =', { size: 26, ta: 'end' }) + fr(324, 290, 'casi favorevoli', 'casi possibili', { size: 22, nf: C.A })));
        o += on(f2, tx(444, 294, '= 3/6', { size: 26, ta: 'start', op: f2 }));
      }

      /* capitolo 2: due dadi, la griglia, le coppie con somma 7 */
      const dOp = p(t, 14.2, 14.8) * (1 - p(t, 29, 29.8));
      if (dOp > 0.004) {
        const d1 = dieAt(t, [[14.6, 2, 4]], 2, 30), d2 = dieAt(t, [[15, 2, 3]], 5, 30), k = lerp(0.3, 1, p(t, 14.2, 14.9, E.back));
        o += die(72, 150 + d1.dy, 60, d1.face, { rot: d1.rot, sc: k, op: dOp, stroke: C.A }) + die(144, 150 + d2.dy, 60, d2.face, { rot: d2.rot, sc: k, op: dOp, stroke: C.B });
        o += lb(72, 208, 'primo', { op: dOp }) + lb(144, 208, 'secondo', { op: dOp });
        const pr = vis(t, 17.8, 21.4);
        o += on(pr, tx(108, 264, '(4, 3)', { size: 28, op: pr }));
      }
      const gh = 1 - p(t, 29.2, 30);
      for (let k = 1; k <= 6; k++) {
        const hv = p(t, 16.4 + k * 0.05, 16.9 + k * 0.05) * gh;
        o += on(hv, tx(GX - 12, gridXY(k, 1)[1] + 6, k, { size: 19, fill: C.A, ta: 'end', op: hv }) + tx(gridXY(1, k)[0], GY - 10, k, { size: 19, fill: C.B, op: hv }));
      }
      for (let i = 1; i <= 6; i++) {
        for (let j = 1; j <= 6; j++) {
          const s = i + j, k = i - Math.max(1, s - 6), [gx, gy] = gridXY(i, j), [hx, hy] = histXY(i, j);
          const a0 = 16.6 + 0.07 * (s - 2), f0 = 36.8 + 0.12 * (s - 2) + 0.06 * k, u = p(t, f0, f0 + 1.1, E.io);
          const [x, y] = arc(gx, gy, hx, hy, u, 10 + 14 * (s % 2)), op = p(t, a0, a0 + 0.3);
          let ring, ro = 0, veil, vo = 0.16, sc = lerp(0.3, 1, p(t, a0, a0 + 0.5, E.back));
          if (s === 7) {
            const h = p(t, sevT(i), sevT(i) + 0.5);
            if (h > 0.01) { ring = C.hi; ro = h; veil = C.hi; vo = 0.4 * h; sc *= 1 + 0.1 * bump(t, sevT(i), 0.9); }
          }
          if (i === 4 && j === 3) {
            const b = bump(t, 18, 1.8);
            if (b > 0.01) { ring = C.hi; ro = Math.max(ro, b); sc *= 1 + 0.12 * b; }
          }
          o += on(op, tile(x, y, 32, '', { sc, op, ring, ro, veil, vo }));
          const lo = p(t, a0 + 0.3, a0 + 0.6) * (1 - p(t, 36.4, 37));
          o += on(lo, tx(x, y + 6, s, { size: 17, op: lo }));
        }
      }
      /* pannello di destra: i conteggi, poi il risultato */
      const rp = 1 - p(t, 25.8, 26.4), c1 = p(t, 19.2, 19.8) * rp, c2 = p(t, 21.4, 22) * rp;
      let nf = 0;
      for (let i = 1; i <= 6; i++) if (t >= sevT(i) + 0.25) nf++;
      o += on(c1, lb(556, 150, 'casi possibili', { op: c1 }) + tx(556, 200, Math.round(36 * p(t, 19.4, 20.6, E.out)), { size: 46, op: c1 }));
      o += on(c2, lb(556, 252, 'casi favorevoli', { op: c2 }) + tx(556, 302, nf, { size: 46, op: c2 }));
      const fin = vis(t, 26.6, 29, 0.4, 0.4);
      o += on(fin, tx(556, 176, '*P*(somma = 7)', { size: 20, op: fin }) + tx(556, 224, '= 6/36', { size: 32, op: fin }) + tx(556, 276, '= 1/6', { size: 40, op: fin }));

      /* capitolo 3: «1/11» sbagliato, poi le caselle cadono nelle colonne delle somme */
      const q1 = vis(t, 29.8, 36.4);
      o += on(q1, tx(556, 150, '2, 3, …, 12', { size: 24, op: q1 }) + lb(556, 184, '11 somme: ognuna…', { op: q1 }) + tx(556, 238, '1/11 ?', { size: 36, op: q1 }) + cross(556, 228, 46, p(t, 33, 33.8, E.lin), { op: q1 }));
      const ax = p(t, 37, 37.8);
      if (ax > 0.004) {
        o += path(`M${HX - 5.5 * GP - 2} ${HB}H${HX + 5.5 * GP + 2}`, { stroke: C.soft, sw: 1.6, ...draw(ax) });
        for (let s = 2; s <= 12; s++) {
          const lo = p(t, 37.2 + 0.07 * (s - 2), 37.7 + 0.07 * (s - 2)), n = 6 - Math.abs(s - 7), c = p(t, 39.4 + 0.1 * (s - 2), 39.9 + 0.1 * (s - 2));
          o += on(lo, lb(HX + GP * (s - 7), HB + 22, s, { op: lo }));
          o += on(c, tx(HX + GP * (s - 7), HB - GP * n - 8, n, { size: 19, op: c }));
        }
      }
      const k7 = vis(t, 40.6, 49.8), ke = vis(t, 41.4, 49.8);
      o += on(k7, tx(352, 104, 'somma 7: 6/36 = 1/6', { size: 20, ta: 'start', op: k7 }));
      o += on(ke, lb(62, 292, 'somma 2', { op: ke }) + tx(62, 316, '1/36', { size: 20, op: ke }) + lb(578, 292, 'somma 12', { op: ke }) + tx(578, 316, '1/36', { size: 20, op: ke }));
      return o;
    },
  });

  /* ======================================================================
     1.10 · Probabilità condizionale: restringere l'universo (dado, A = «esce 6», B = «esce pari»)
     ====================================================================== */
  const BXS = { 2: 224, 4: 320, 6: 416 }; // posti degli esiti pari quando l'universo è ristretto a B
  const BLS = { 2: 91, 4: 171, 6: 251 }; // posti nel pannello di sinistra (capitolo 4)

  PV.add('condizionale', {
    sec: '1.10',
    short: 'Restringere l’universo',
    title: 'Probabilità condizionale: restringere l’universo',
    alt: 'Animazione: con un dado, A = «esce 6» e B = «esce pari». L’informazione B restringe l’universo ai tre esiti 2, 4, 6 e il 6 passa da 1/6 a 1/3, cioè P(A | B) = P(A ∩ B) / P(B) = (1/6) / (3/6) = 1/3. Poi si restringe invece ad A: P(B | A) = 1, diverso da P(A | B); come «cane → quattro zampe» e «quattro zampe → cane».',
    dur: 58,
    poster: 44.4,
    chap: [[0, 'Un’informazione in più'], [13.2, 'Restringere l’universo'], [28.8, 'La formula'], [37, 'P(A | B) ≠ P(B | A)']],
    caps: [
      [0, 'Lancio un dado e non guardo. Sia *A* = «esce 6»: prima di sapere altro, *P*(*A*) = 1/6.'],
      [6.5, 'Ora mi dicono: «è uscito un numero pari». Questa informazione è l’evento *B* = {2, 4, 6}.'],
      [13.2, 'I mondi possibili ora sono tre: ciò che sta fuori da *B* è escluso. I pesi si ricalcolano, perché la torta torni a valere 1.'],
      [21, 'Fra i tre esiti rimasti, quello in cui *A* si verifica è uno solo, il 6. La probabilità diventa 1 su 3.'],
      [28.8, 'In formula: *P*(*A* | *B*) = *P*(*A* ∩ *B*) / *P*(*B*) = (1/6) / (3/6) = 1/3. Dividere per *P*(*B*) fa tornare la torta a 1.'],
      [37, 'Attenzione: *P*(*A* | *B*) non è *P*(*B* | *A*). Se so che è uscito 6, è per forza pari: *P*(*B* | *A*) = (1/6) / (1/6) = 1.'],
      [45.5, 'Stesso numeratore, universo diverso. Come «cane → quattro zampe», quasi 1, e «quattro zampe → cane», molto meno.'],
      [52.8, 'Prima di calcolare chiediti qual è l’informazione: è lei a decidere in quale universo si conta.'],
    ],
    frame(t) {
      let o = '';
      const u12 = p(t, 13.4, 16.6, E.io), u23 = p(t, 36.9, 39.6, E.io);
      o += heading(t, 0.2, 12.6, 'Un dado, un’informazione') + subline(t, 0.4, 6.3, '*A* = «esce 6»: prima di sapere altro, *P*(*A*) = 1/6') + subline(t, 6.7, 12.4, '«è uscito pari»: l’informazione è *B* = {2, 4, 6}');
      o += heading(t, 13.2, 20.8, 'Restringere l’universo', 'ogni peso si divide per *P*(*B*) = 3/6: 1/6 diventa 1/3');
      o += heading(t, 21.2, 28.4, 'Dentro *B*: 1 caso su 3', 'favorevoli: solo il 6; possibili: 2, 4 e 6');
      o += heading(t, 28.8, 36.5, 'La formula', 'dividere per *P*(*B*) fa tornare la torta a 1');
      o += heading(t, 37.2, 58.5, '*P*(*A* | *B*) non è *P*(*B* | *A*)') + subline(t, 37.6, 45.3, 'stesso numeratore, universo diverso') + subline(t, 45.8, 52.6, 'come «cane → 4 zampe» e «4 zampe → cane»') + subline(t, 53.2, 58.5, 'è l’informazione a decidere l’universo');

      const dado = 1 - p(t, 45, 45.8);
      if (dado > 0.004) {
        /* la cornice dell'universo: Ω, poi B (si stringe), poi B a sinistra */
        const fu = p(t, 0.3, 1.5, E.io), fx = lerp(lerp(56, 172, u12), 30, u23), fy = lerp(80, 88, u23), fw = lerp(lerp(528, 296, u12), 262, u23), fh = lerp(136, 118, u23);
        o += g({ op: dado }, rect(fx, fy, fw, fh, { rx: 16, stroke: C.soft, sw: 2.2, so: 1 - u12, ...draw(fu) }) + rect(fx, fy, fw, fh, { rx: 16, stroke: C.B, sw: 2.6, so: u12 }));
        const to = p(t, 1, 1.5), pf = bump(t, 33.4, 1.6);
        o += on(to * (1 - u12), tab(fx + 8, fy + 4, 'Ω', C.soft, to * (1 - u12) * dado)) + on(u12, tab(fx + 8, fy + 4, '*B*', C.B, u12 * dado));
        if (pf > 0.01) o += rect(fx - 4, fy - 4, fw + 8, fh + 8, { rx: 18, stroke: C.hi, sw: 4, so: pf });

        for (let n = 1; n <= 6; n++) {
          const i = n - 1, t0 = 0.5 + i * 0.15, odd = n % 2, m = n / 2 - 1, out = odd ? p(t, 13.2, 15, E.lin) : 0, ap = lerp(0.3, 1, p(t, t0, t0 + 0.7, E.back));
          let x = ROW[i], y = 150, s = 56;
          if (odd) y += 34 * E.out(out);
          else { x = lerp(lerp(ROW[i], BXS[n], u12), BLS[n], u23); y = lerp(150, 142, u23); s = lerp(56, 52, u23); }
          const op = p(t, t0, t0 + 0.25) * (1 - out) * dado;
          const hA = n === 6 ? p(t, 2.2, 2.8) : 0, hB = odd ? 0 : p(t, 6.8 + 0.4 * m, 7.4 + 0.4 * m), pu = n === 6 ? bump(t, 22, 1.4) + bump(t, 32.2, 1.4) : 0, sc = ap * (1 + 0.1 * pu);
          const ring = hA > 0.01 ? C.A : hB > 0.01 ? C.B : undefined, ro = hA > 0.01 ? hA : hB;
          o += tile(x, y, s, n, { sc, op, ring, ro, veil: ring, vo: 0.16 * ro });
          if (hA > 0.01 && hB > 0.01) o += inner(x, y, s, C.B, hB * op, sc);
        }

        /* la torta: sei pezzi da 1/6; restano i tre di B, che si allargano finché la torta torna a valere 1 */
        const bo = p(t, 1.5, 2.2) * (1 - p(t, 28.2, 28.8)) * dado;
        if (bo > 0.004) {
          const sl = p(t, 14, 15.6, E.io), st = p(t, 16.2, 17.8, E.io);
          for (let n = 1; n <= 6; n++) {
            const m = n / 2 - 1, even = n % 2 === 0, out = even ? 0 : p(t, 13.2, 14.6, E.lin), op = bo * (1 - out);
            const hA = n === 6 ? p(t, 2.2, 2.8) : 0, hB = even ? p(t, 6.8 + 0.4 * m, 7.4 + 0.4 * m) : 0, pu = n === 6 ? bump(t, 22, 1.4) + bump(t, 32.2, 1.4) : 0;
            let x = 110 + 70 * (n - 1), w = 66;
            if (even) { x = lerp(lerp(x, 110 + 70 * m, sl), 110 + 140 * m, st); w = lerp(66, 136, st); }
            const ring = hA > 0.01 ? C.A : hB > 0.01 ? C.B : undefined, ro = hA > 0.01 ? hA : hB;
            let b = rect(x, 250, w, 40, { rx: 6, fill: C.hi, fo: 0.22, stroke: C.soft, sw: 1.7 });
            if (ring) b += rect(x, 250, w, 40, { rx: 6, fill: ring, fo: 0.14 * ro, stroke: ring, so: ro, sw: 3 });
            if (hA > 0.01 && hB > 0.01) b += rect(x + 5, 255, w - 10, 30, { rx: 4, stroke: C.B, so: hB, sw: 2.5 });
            const w6 = even ? 1 - p(t, 16.4, 17) : 1, w3 = even ? p(t, 16.8, 17.5) : 0;
            b += on(w6, tx(x + w / 2, 277, '1/6', { size: 20, op: w6 })) + on(w3, tx(x + w / 2, 277, '1/3', { size: 20, op: w3 }));
            o += g({ op, tf: T(x + w / 2, 270, 1 + 0.08 * pu) }, g({ tf: T(-(x + w / 2), -270) }, b));
          }
          const b1 = vis(t, 3, 13.4), b2 = vis(t, 15.4, 16.8), b3 = vis(t, 18, 21);
          o += on(b1, g({ op: b1 * bo }, brace(110, 526, 296, C.soft, 1) + lb(318, 324, 'tutta la torta: 1')));
          o += on(b2, g({ op: b2 * bo }, brace(110, 316, 296, C.B, 1) + lb(213, 324, '*P*(*B*) = 3/6')));
          o += on(b3, g({ op: b3 * bo }, brace(110, 526, 296, C.soft, 1) + lb(318, 324, 'di nuovo tutta la torta: 1')));
        }

        /* capitolo 3: «1 su 3» */
        o += pills(326, [{ s: 'favorevoli: 1', col: C.A, op: vis(t, 21.6, 28.4) }, { s: 'possibili: 3', col: C.B, op: vis(t, 23, 28.4) }]);

        /* capitolo 4: la formula, con i pezzi colorati come nel dado */
        const l1 = vis(t, 29.2, 36.5, 0.6, 0.4), l2 = vis(t, 31.6, 36.5, 0.6, 0.4);
        o += on(l1, g({ op: l1 }, tx(324, 274, '*P*(*A* | *B*) =', { size: 28, ta: 'end' }) + fr(397, 270, '*P*(*A* ∩ *B*)', '*P*(*B*)', { size: 26, nf: C.A, df: C.B })));
        o += on(l2, g({ op: l2 }, tx(272, 331, '=', { size: 28, ta: 'end' }) + fr(302, 326, '1/6', '3/6', { size: 26, nf: C.A, df: C.B }) + tx(342, 334, '= 1/3', { size: 30, ta: 'start' })));

        /* capitolo 5: due universi a confronto */
        const ru = p(t, 38.4, 39.7, E.io), fl = p(t, 38.6, 40, E.io);
        if (ru > 0.004) {
          o += g({ op: dado }, rect(404, 88, 132, 118, { rx: 14, stroke: C.A, sw: 2.6, ...draw(ru) }));
          const ta = p(t, 39, 39.5);
          o += on(ta, tab(412, 92, '*A*', C.A, ta * dado));
        }
        if (fl > 0.004) {
          const [x, y] = arc(BLS[6], 142, 470, 142, fl, 36), w3 = p(t, 40, 40.6) * dado;
          o += tile(x, y, 52, 6, { op: dado, ring: C.A, ro: 1, veil: C.A, vo: 0.16 }) + inner(x, y, 52, C.B, dado);
          o += on(w3, lb(470, 196, '1', { size: 18, op: w3 }));
        }
        const e1 = vis(t, 40.2, 45.5, 0.6, 0.4), e2 = vis(t, 41.8, 45.5, 0.6, 0.4), ne = vis(t, 44.2, 45.5, 0.5, 0.4);
        o += on(e1, g({ op: e1 }, tx(160, 266, '*P*(*A* | *B*) =', { size: 22, ta: 'end' }) + fr(186, 262, '1/6', '3/6', { size: 20, nf: C.A, df: C.B }) + tx(213, 266, '= 1/3', { size: 24, ta: 'start' }) + lb(161, 322, 'dentro *B*: 1 su 3')));
        o += on(e2, g({ op: e2 }, tx(478, 266, '*P*(*B* | *A*) =', { size: 22, ta: 'end' }) + fr(505, 262, '1/6', '1/6', { size: 20, nf: C.A, df: C.A }) + tx(531, 266, '= 1', { size: 24, ta: 'start' }) + lb(470, 322, 'dentro *A*: 1 su 1')));
        o += on(ne, tx(320, 274, '≠', { size: 38, op: ne }));
      }

      /* capitolo 6: cane e quattro zampe, lo stesso scambio con parole di tutti i giorni */
      const cn = vis(t, 45.6, 58.5, 0.6, 0.01);
      if (cn > 0.004) {
        const cu = p(t, 46, 47.2, E.io), cv = p(t, 46.6, 47.8, E.io), pa = bump(t, 48.4, 2), pb = bump(t, 50.8, 2), lo = p(t, 47, 47.6) * cn;
        o += circ(180, 212, 92, { fill: C.B, fo: (0.1 + 0.12 * pb) * cu, stroke: C.B, sw: 2.5, op: cn, ...draw(cu) });
        o += circ(180, 244, 38, { fill: C.A, fo: (0.14 + 0.2 * pa) * cv, stroke: C.A, sw: 2.5, op: cn, ...draw(cv) });
        o += on(lo, lb(180, 160, 'quattro zampe', { op: lo }) + lb(180, 250, 'cani', { op: lo }));
        const a1 = vis(t, 48.2, 58.5, 0.5, 0.01), a2 = vis(t, 50.6, 58.5, 0.5, 0.01);
        o += on(a1, lb(470, 150, 'se è un cane, ha 4 zampe?', { op: a1 }) + tx(470, 206, '≈ 1', { size: 46, op: a1 }));
        o += on(a2, lb(470, 262, 'se ha 4 zampe, è un cane?', { op: a2 }) + tx(470, 312, 'molto meno', { size: 34, op: a2 }));
      }
      return o;
    },
  });

  /* ======================================================================
     1.12 · Formula di Bayes con le frequenze naturali: il test diagnostico su 10 000 persone
     ====================================================================== */
  const CARDS = [
    { cx: 124, col: C.A, sym: '*P*(*M*)', big: '1%', l1: 'della popolazione', l2: 'è malata', t0: 0.8 },
    { cx: 320, col: C.A, sym: '*P*(*T* | *M*)', big: '99%', l1: 'dei malati risulta', l2: 'positivo al test', t0: 3.4 },
    { cx: 516, col: C.B, sym: '*P*(*T* | *M*^c)', big: '5%', l1: 'dei sani risulta', l2: 'positivo (errore)', t0: 5.6 },
  ];
  const NODES = {
    r: { x: 56, y: 214, w: 96, h: 58, num: '10 000', lab: 'persone', col: C.soft, t0: 15.2 },
    m: { x: 230, y: 146, w: 108, h: 58, num: '100', lab: 'malati', col: C.A, t0: 17.8 },
    s: { x: 230, y: 282, w: 108, h: 58, num: '9 900', lab: 'sani', col: C.B, t0: 18.4 },
    mp: { x: 414, y: 112, w: 116, h: 52, num: '99', lab: 'positivi', col: C.A, t0: 21.6 },
    mn: { x: 414, y: 180, w: 116, h: 52, num: '1', lab: 'negativo', col: C.A, t0: 22.2 },
    sp: { x: 414, y: 248, w: 116, h: 52, num: '495', lab: 'positivi', col: C.B, t0: 24.4 },
    sn: { x: 414, y: 316, w: 116, h: 52, num: '9 405', lab: 'negativi', col: C.B, t0: 25 },
  };
  const BRANCH = [ // da, a, istante, percentuale e suo posto
    ['r', 'm', 17, '1%', 126, 170], ['r', 's', 17, '99%', 126, 262],
    ['m', 'mp', 20.8, '99%', 320, 114], ['m', 'mn', 20.8, '1%', 320, 188],
    ['s', 'sp', 23.6, '5%', 320, 250], ['s', 'sn', 23.6, '95%', 320, 324],
  ];
  const bnode = (n, sc, op, ring, ro) => g({ tf: T(n.x, n.y, sc), op }, rect(-n.w / 2, -n.h / 2, n.w, n.h, { rx: 10, fill: C.paper, stroke: n.col, sw: 2 }) + (ring ? rect(-n.w / 2 - 3, -n.h / 2 - 3, n.w + 6, n.h + 6, { rx: 12, stroke: ring, so: ro, sw: 3.5 }) : '') + tx(0, -2, n.num, { size: 24 }) + lb(0, 19, n.lab));
  const AX = 50, AY = 110, AP = 10; // matrice di puntini: 54 colonne × 11 righe = 594 persone (9 colonne blu = 99, 45 arancio = 495)
  const dots = (id, col) => `<pattern id="${id}" width="${AP}" height="${AP}" patternUnits="userSpaceOnUse"><circle cx="${AP / 2}" cy="${AP / 2}" r="3.6" fill="${col}"/></pattern>`;

  PV.add('bayes', {
    sec: '1.12',
    short: 'Bayes con le frequenze naturali',
    title: 'Formula di Bayes con le frequenze naturali: il test diagnostico',
    alt: 'Animazione: una malattia colpisce l’1% delle persone, un test è positivo nel 99% dei malati e nel 5% dei sani. Su 10 000 persone i malati sono 100 e i sani 9 900; risultano positivi 99 malati e 495 sani. Fra i 594 positivi i malati sono 99, cioè circa 1/6 (17%). Lo stesso rapporto, diviso per 10 000, è la formula di Bayes: 0,0099 / (0,0099 + 0,0495).',
    dur: 57,
    poster: 40.5,
    chap: [[0, 'I dati e la domanda'], [15, 'Su 10 000 persone'], [33.6, 'Solo i positivi'], [44.6, 'La formula di Bayes']],
    caps: [
      [0, 'Una malattia colpisce l’1% della popolazione. Un test è positivo nel 99% dei malati e, per errore, nel 5% dei sani.'],
      [7.5, 'Fai il test e risulti positivo. Qual è la probabilità di essere davvero malato? L’istinto dice «99%»: vediamo.'],
      [15, 'Immaginiamo 10 000 persone. L’1% è malato: sono 100. Gli altri 9 900 sono sani.'],
      [20.5, 'Fra i 100 malati il test è positivo per 99. Fra i 9 900 sani è positivo per il 5%: 495 falsi positivi.'],
      [27.8, 'Ora guardiamo solo chi è risultato positivo: 99 + 495 = 594 persone. Quanti sono davvero malati? Solo 99.'],
      [35, '99 su 594 fanno circa 1/6, cioè il 17%. I sani sono tanti: anche pochi errori su di loro producono più falsi positivi che veri positivi.'],
      [44.5, 'In formula è Bayes: *P*(*M* | *T*) = 0,0099 / (0,0099 + 0,0495) ≈ 0,17. Cioè la riga dei malati, diviso il totale.'],
      [52.5, 'La probabilità a priori conta quanto la precisione del test.'],
    ],
    frame(t) {
      let o = '';
      o += heading(t, 0.2, 14.8, 'Il test diagnostico', 'una malattia rara, un test molto affidabile');
      o += heading(t, 15.2, 33.2, 'Su 10 000 persone', 'le frequenze naturali: si contano persone, non percentuali');
      o += heading(t, 33.6, 44.2, 'Chi è risultato positivo', 'ogni puntino è una persona: sono 594');
      o += heading(t, 44.8, 57.5, 'In formule: Bayes', 'dividendo le frequenze per 10 000 si ottengono le probabilità');

      /* capitolo 1: i tre dati e la domanda */
      const ca = 1 - p(t, 14.6, 15.2);
      if (ca > 0.004) {
        CARDS.forEach((c) => {
          const a = lerp(0.85, 1, p(t, c.t0, c.t0 + 0.6, E.back)), op = p(t, c.t0, c.t0 + 0.3) * ca;
          o += on(op, g({ tf: T(c.cx, 168, a), op }, rect(-92, -68, 184, 136, { rx: 12, fill: C.paper, stroke: c.col, sw: 2 }) + tx(0, -40, c.sym, { size: 19, fill: C.soft }) + tx(0, 14, c.big, { size: 46 }) + lb(0, 38, c.l1) + lb(0, 58, c.l2)));
        });
        const q = vis(t, 8, 14.8);
        o += on(q, tx(320, 292, 'Risulti positivo: sei davvero malato?', { size: 26, op: q }) + lb(320, 326, 'qual è la probabilità? l’istinto dice «99%»', { op: q }));
      }

      /* capitolo 2: l'albero con le persone al posto delle percentuali */
      const tr = 1 - p(t, 32.8, 33.8), pos = p(t, 27.8, 28.6);
      if (tr > 0.004) {
        const dim = (k) => (k === 'mp' || k === 'sp' ? 1 : k === 'mn' || k === 'sn' ? 1 - 0.65 * pos : 1 - 0.45 * pos);
        BRANCH.forEach(([a, b, t0, s, lx, ly]) => {
          const A = NODES[a], B = NODES[b], lo = p(t, t0 + 0.5, t0 + 0.9) * tr * dim(b);
          o += path(`M${A.x + A.w / 2} ${A.y}L${B.x - B.w / 2} ${B.y}`, { stroke: C.soft, sw: 2, op: tr * dim(b), ...draw(p(t, t0, t0 + 0.8, E.io)) });
          o += on(lo, lb(lx, ly, s, { op: lo }));
        });
        Object.entries(NODES).forEach(([k, n]) => {
          const op = p(t, n.t0, n.t0 + 0.25) * tr * dim(k), hot = k === 'mp' || k === 'sp';
          o += on(op, bnode(n, lerp(0.7, 1, p(t, n.t0, n.t0 + 0.6, E.back)), op, hot && pos > 0.01 ? C.hi : undefined, pos));
        });
        const su = vis(t, 29.8, 33.4, 0.5, 0.5);
        o += on(su, g({ op: su }, path('M478 112h12V248h-12', { stroke: C.hi, sw: 2.5 }) + lb(566, 150, 'positivi') + tx(542, 198, '99', { size: 26, fill: C.A, ta: 'end' }) + tx(559, 198, '+', { size: 26 }) + tx(576, 198, '495', { size: 26, fill: C.B, ta: 'start' }) + tx(566, 250, '= 594', { size: 38 })));
      }

      /* capitolo 3: i 594 positivi come puntini, 99 blu e 495 arancio */
      const da = p(t, 33.4, 34.2);
      if (da > 0.004) {
        const u1 = p(t, 34.2, 35.2, E.io), u2 = p(t, 35.4, 37.4, E.io), pb = bump(t, 37.6, 1.6) + bump(t, 46, 1.4), pa = bump(t, 47.6, 1.6);
        o += `<defs>${dots('by-a', C.A)}${dots('by-b', C.B)}</defs>`;
        o += g({ op: da }, on(u1, rect(AX, AY, 90 * u1, 110, { fill: 'url(#by-a)' })) + on(u2, rect(AX + 90, AY, 450 * u2, 110, { fill: 'url(#by-b)' })));
        if (pb > 0.01) o += rect(AX - 3, AY - 3, 96, 116, { rx: 6, stroke: C.hi, sw: 3, so: Math.min(1, pb) });
        if (pa > 0.01) o += rect(AX - 3, AY - 3, 546, 116, { rx: 6, stroke: C.hi, sw: 3, so: pa });
        const bb = vis(t, 35.2, 44.2), bs = vis(t, 37.4, 44.2), rt = vis(t, 37, 44.4, 0.6, 0.4);
        o += on(bb, g({ op: bb }, brace(AX, AX + 88, 232, C.A, 1) + lb(94, 262, 'malati: 99')));
        o += on(bs, g({ op: bs }, brace(AX + 92, AX + 538, 232, C.B, 1) + lb(365, 262, 'sani: 495, falsi positivi')));
        o += on(rt, g({ op: rt }, fr(232, 322, '99', '594', { size: 28, nf: C.A }) + tx(272, 328, '≈ 1/6 ≈ 17%', { size: 30, ta: 'start' })));

        /* capitolo 4: la stessa frazione, scritta con le probabilità */
        const y = 268, n1 = p(t, 45.4, 46.2), n2 = p(t, 46, 46.8), n3 = p(t, 47, 47.6), n4 = p(t, 47.6, 48.4), n5 = p(t, 49.4, 50.2);
        o += on(n1, tx(228, y + 4, '*P*(*M* | *T*) =', { size: 26, ta: 'end', op: n1 }));
        o += on(n2, tx(343, y - 9, '0,0099', { size: 26, fill: C.A, op: n2 }));
        o += on(n3, ln(237, y - 3, 449, y - 3, { stroke: C.ink, sw: 1.5, op: n3 }));
        o += on(n4, tx(327, y + 22, '0,0099', { size: 26, fill: C.A, ta: 'end', op: n4 }) + tx(343, y + 22, '+', { size: 26, op: n4 }) + tx(359, y + 22, '0,0495', { size: 26, fill: C.B, ta: 'start', op: n4 }));
        o += on(n5, tx(458, y + 4, '≈ 0,17', { size: 28, ta: 'start', op: n5 }));
        o += pills(330, [{ s: 'la riga dei malati, diviso il totale', op: vis(t, 49.8, 53) }]);
        o += pills(330, [{ s: 'la probabilità a priori conta quanto la precisione del test', op: vis(t, 53, 57.5) }]);
      }
      return o;
    },
  });

  /* ======================================================================
     1.16 · Indipendenza: il prodotto delle aree, e un caso di dipendenza (200 utenti)
     ====================================================================== */
  const SQ = 170, QY = 108; // lato dei quadrati e quota del lato superiore
  const RES = [['T', 'C'], ['C', 'C'], ['T', 'T']]; // i tre lanci delle due monete: [primo, secondo]
  /* moneta che gira: n mezzi giri, poi mostra la faccia finale ft */
  function flip(t, t0, f0, ft) {
    const u = p(t, t0, t0 + 1.3, E.out), n = f0 === ft ? 6 : 7, th = Math.PI * n * u, k = Math.floor(th / Math.PI + 1e-9);
    return { sx: Math.max(0.04, Math.abs(Math.cos(th))), face: u >= 1 ? ft : k % 2 ? (f0 === 'T' ? 'C' : 'T') : f0, dy: -26 * Math.sin(Math.PI * u) };
  }
  function coinsAt(t) {
    let f1 = 'T', f2 = 'T';
    for (let r = 0; r < 3; r++) {
      const t0 = 0.6 + 2.1 * r, [r1, r2] = RES[r];
      if (t >= t0 + 1.6) { f1 = r1; f2 = r2; } else if (t >= t0) return [flip(t, t0, f1, r1), flip(t, t0 + 0.25, f2, r2)];
      else break;
    }
    return [{ sx: 1, face: f1, dy: 0 }, { sx: 1, face: f2, dy: 0 }];
  }
  const coinAt = (x, y, c, op) => g({ tf: `translate(${x.toFixed(2)} ${(y + c.dy).toFixed(2)}) scale(${c.sx.toFixed(3)} 1)`, op }, circ(0, 0, 46, { fill: C.paper, stroke: C.ink, sw: 2.4 }) + tx(0, 13, c.face, { size: 38 }));

  PV.add('indipendenza', {
    sec: '1.16',
    short: 'Indipendenza: il prodotto',
    title: 'Indipendenza: P(A ∩ B) = P(A) · P(B), con il modello ad aree',
    alt: 'Animazione: due lanci di moneta non si influenzano. In un quadrato che vale 1, A = «testa al primo lancio» occupa metà in larghezza e B = «testa al secondo» metà in altezza; l’intersezione è un rettangolo di area 1/2 per 1/2 = 1/4, cioè P(A ∩ B) = P(A) · P(B). Per confronto, su 200 utenti (A = smartphone, B = abbonamento) B occupa il 25% di A e il 12,5% del resto: P(A ∩ B) = 0,15 non è 0,6 · 0,2 = 0,12, quindi non sono indipendenti.',
    dur: 58.5,
    poster: 52.6,
    chap: [[0, 'Due monete'], [8.5, 'Il quadrato che vale 1'], [21, 'Il prodotto delle aree'], [31, 'Sapere A non cambia B'], [38.5, 'Un caso di dipendenza']],
    caps: [
      [0, 'Lanciamo due monete. Il primo lancio non influenza il secondo: sapere com’è andato uno non cambia le probabilità dell’altro.'],
      [8.5, 'Disegniamo un quadrato che vale 1. *A* = «testa al primo lancio» ne occupa metà in larghezza; *B* = «testa al secondo» metà in altezza.'],
      [21, 'Dove si incrociano c’è *A* ∩ *B*: un rettangolo di area base × altezza, 1/2 · 1/2 = 1/4. Per eventi indipendenti *P*(*A* ∩ *B*) = *P*(*A*) · *P*(*B*).'],
      [31, 'Restringiamoci ad *A*: dentro *A*, l’evento *B* occupa ancora metà. Sapere *A* non cambia *B*: *P*(*B* | *A*) = *P*(*B*).'],
      [38.5, 'Un caso diverso: 200 utenti. *A* = «usa lo smartphone» (120), *B* = «ha l’abbonamento»: 30 fra gli smartphone, 10 fra i desktop.'],
      [47.5, 'Qui *B* occupa il 25% di *A* e il 12,5% del resto: *P*(*A* ∩ *B*) = 0,15, non 0,6 · 0,2 = 0,12. I due eventi sono dipendenti.'],
    ],
    frame(t) {
      let o = '';
      o += heading(t, 0.2, 8.1, 'Due lanci di moneta', 'il primo non influenza il secondo');
      o += heading(t, 8.6, 20.8, 'Un quadrato che vale 1', '*A* = «testa al 1° lancio»  ·  *B* = «testa al 2° lancio»');
      o += heading(t, 21.2, 30.8, '*P*(*A* ∩ *B*) = *P*(*A*) · *P*(*B*)', 'se *A* e *B* sono indipendenti');
      o += heading(t, 31.2, 38.1, '*P*(*B* | *A*) = *P*(*B*)', 'sapere *A* non cambia la probabilità di *B*');
      o += heading(t, 38.6, 47.4, 'Un caso diverso: 200 utenti', '*A* = usa lo smartphone  ·  *B* = ha l’abbonamento');
      o += heading(t, 47.8, 58.5, 'Qui sapere *A* cambia *B*', '25% fra gli smartphone, 12,5% fra i desktop');

      /* capitolo 1: due monete, tre prove */
      const c1 = 1 - p(t, 7.6, 8.3);
      if (c1 > 0.004) {
        const [k1, k2] = coinsAt(t), ci = p(t, 0.2, 0.8, E.back);
        o += coinAt(232, 168, k1, ci * c1) + coinAt(408, 168, k2, ci * c1);
        o += lb(232, 246, 'primo lancio', { op: ci * c1 }) + lb(408, 246, 'secondo lancio', { op: ci * c1 });
        const eo = p(t, 2.2, 2.8) * c1;
        o += on(eo, lb(262, 312, 'esiti:', { ta: 'end', op: eo }));
        RES.forEach(([a, b], r) => {
          const tl = 0.6 + 2.1 * r + 1.7, u = p(t, tl, tl + 0.6, E.back);
          if (u > 0.004) o += tile(290 + 52 * r, 306, 42, a + b, { sc: lerp(0.4, 1, u), op: p(t, tl, tl + 0.2) * c1, size: 20 });
        });
        const ar = p(t, 6.3, 7, E.io), cx = p(t, 6.9, 7.5, E.lin) * c1;
        o += path('M290 168H350M341 160L350 168L341 176', { stroke: C.soft, sw: 2.4, lc: 'round', lj: 'round', op: c1, ...draw(ar) });
        o += cross(320, 168, 34, cx);
      }

      /* il quadrato di sinistra: A in larghezza, B in altezza; poi scivola a sinistra per il confronto */
      const u4 = p(t, 38.4, 40.4, E.io), x0 = lerp(235, 80, u4), h = SQ / 2, qo = p(t, 8.6, 9.2);
      if (qo > 0.004) {
        const uo = p(t, 8.8, 10.4, E.io), uA = p(t, 11, 12.6, E.io), uB = p(t, 15.4, 17, E.io), uI = p(t, 24.2, 25.2);
        o += rect(x0, QY, h * uA, SQ, { fill: C.A, fo: 0.2 }) + rect(x0, QY, SQ, h * uB, { fill: C.B, fo: 0.2 });
        o += on(uI, rect(x0, QY, h, h, { fill: C.hi, fo: 0.5 * uI, stroke: C.hi, so: uI, sw: 3 }));
        const dm = p(t, 32, 33) * (1 - p(t, 38.2, 38.8));
        o += on(dm, rect(x0 + h, QY, h, SQ, { fill: C.paper, fo: 0.78 * dm }));
        o += rect(x0, QY, SQ, SQ, { stroke: C.soft, sw: 2.2, ...draw(uo) });
        o += rect(x0, QY, h, SQ, { stroke: C.A, sw: 2.4, ...draw(uA) }) + rect(x0, QY, SQ, h, { stroke: C.B, sw: 2.4, ...draw(uB) });
        const lA = p(t, 12.2, 12.8), lB = p(t, 16.6, 17.2), lN = p(t, 40.8, 41.4);
        o += on(lA, tx(x0 + h / 2, QY - 10, '*A*', { size: 24, fill: C.A, op: lA })) + on(lB, tx(x0 - 12, QY + h / 2 + 8, '*B*', { size: 24, fill: C.B, ta: 'end', op: lB }));
        o += on(lN, tx(x0 + 1.5 * h, QY - 10, 'non *A*', { size: 20, fill: C.soft, op: lN }));
        /* graffe e pesi di A e B (capitolo 2) */
        const bA = vis(t, 12.8, 38.6, 0.5, 0.5), bB = vis(t, 17.2, 38.6, 0.5, 0.5);
        o += on(bA, g({ op: bA }, brace(x0, x0 + h - 2, QY + SQ + 6, C.A, 1) + tx(x0 + h / 2, QY + SQ + 34, '*P*(*A*) = 1/2', { size: 20 })));
        o += on(bB, g({ op: bB }, vbrace(x0 + SQ + 8, QY, QY + h - 2, C.B, 1) + tx(x0 + SQ + 20, QY + h / 2 + 6, '*P*(*B*) = 1/2', { size: 20, ta: 'start' })));
        /* i quattro rettangoli: TT, CT, TC, CC, ciascuno 1/4; restringendo ad A restano i due di sinistra, da 1/2 */
        [['TT', 0, 0], ['CT', 1, 0], ['TC', 0, 1], ['CC', 1, 1]].forEach(([nm, qx, qy]) => {
          const cx = x0 + h / 2 + qx * h, cy = QY + h / 2 + qy * h, op = p(t, 25.4 + 0.15 * (qx + 2 * qy), 26 + 0.15 * (qx + 2 * qy)) * (1 - dm * qx) * (1 - p(t, 38, 38.6));
          const w2 = qx ? 0 : p(t, 33.4, 34) * op, w4 = op - w2;
          o += on(op, tx(cx, cy + 2, nm, { size: 22, op }) + on(w4, lb(cx, cy + 24, '1/4', { op: w4 })) + on(w2, lb(cx, cy + 24, '1/2', { op: w2 })));
        });
        /* testi laterali del capitolo 3 e 4 */
        const a3 = vis(t, 24.2, 31, 0.6, 0.5), a4 = vis(t, 32.2, 38.3, 0.6, 0.5), a5 = vis(t, 34.6, 38.3, 0.6, 0.5);
        o += on(a3, lb(112, 168, 'area = base × altezza', { op: a3 }) + tx(112, 214, '1/2 × 1/2 = 1/4', { size: 24, op: a3 }));
        o += on(a4, tx(112, 150, '*P*(*B* | *A*)', { size: 24, op: a4 }) + g({ op: a4 }, fr(96, 200, '1/4', '1/2', { size: 26 }) + tx(132, 207, '= 1/2', { size: 28, ta: 'start' })));
        o += on(a5, tx(x0 + SQ + 20, QY + 1.5 * h + 6, '*P*(*B* | *A*) = 1/2', { size: 20, ta: 'start', op: a5 }));

        /* confronto (capitoli 5 e 6): le quote di B in ogni colonna */
        const pc = p(t, 41.2, 41.8) * u4;
        o += on(pc, tx(x0 + h / 2, QY + h / 2 + 6, '50%', { size: 19, op: pc }) + tx(x0 + 1.5 * h, QY + h / 2 + 6, '50%', { size: 19, op: pc }));
      }
      const rq = p(t, 40.4, 41);
      if (rq > 0.004) {
        const X = 380, wA = 0.6 * SQ, hA = 0.25 * SQ, hD = 0.125 * SQ;
        const ur = p(t, 40.6, 41.8, E.io), uc = p(t, 41.8, 43, E.io), ub = p(t, 44, 45.4, E.io), lc = p(t, 42.6, 43.2), lb2 = p(t, 44.6, 45.2), pq = p(t, 46, 46.8), ui = p(t, 45.4, 46.2);
        o += rect(X, QY, wA * uc, SQ, { fill: C.A, fo: 0.2 }) + rect(X, QY, wA, hA * ub, { fill: C.B, fo: 0.2 }) + rect(X + wA, QY, SQ - wA, hD * ub, { fill: C.B, fo: 0.2 });
        o += on(ui, rect(X, QY, wA, hA, { fill: C.hi, fo: 0.5 * ui, stroke: C.hi, so: ui, sw: 3 }));
        o += rect(X, QY, SQ, SQ, { stroke: C.soft, sw: 2.2, ...draw(ur) }) + rect(X, QY, wA, SQ, { stroke: C.A, sw: 2.4, ...draw(uc) });
        o += rect(X, QY, wA, hA, { stroke: C.B, sw: 2.4, ...draw(ub) }) + rect(X + wA, QY, SQ - wA, hD, { stroke: C.B, sw: 2.4, ...draw(ub) });
        o += on(lc, tx(X + wA / 2, QY - 10, '*A*', { size: 24, fill: C.A, op: lc }) + tx(X + wA + (SQ - wA) / 2, QY - 10, 'non *A*', { size: 20, fill: C.soft, op: lc }) + tx(X + wA / 2, QY + SQ - 10, '120', { size: 19, op: lc }) + tx(X + wA + (SQ - wA) / 2, QY + SQ - 10, '80', { size: 19, op: lc }));
        o += on(lb2, tx(X - 12, QY + hA / 2 + 8, '*B*', { size: 24, fill: C.B, ta: 'end', op: lb2 }));
        o += on(pq, tx(X + wA / 2, QY + hA / 2 + 7, '25%', { size: 19, op: pq }) + tx(X + wA + (SQ - wA) / 2, QY + hD / 2 + 6, '12,5%', { size: 17, op: pq }));
      }
      const w1 = vis(t, 45.6, 47.8, 0.5, 0.4), w2 = vis(t, 47.8, 58.5, 0.6, 0.01);
      o += on(w1, lb(165, 308, 'stessa quota in ogni colonna', { op: w1 }) + lb(465, 308, 'quote diverse nelle colonne', { op: w1 }));
      o += on(w2, tx(165, 310, 'indipendenti', { size: 22, op: w2 }) + tx(465, 310, 'dipendenti', { size: 22, op: w2 }));
      o += pills(338, [{ s: '1/4 = 1/2 · 1/2', icon: 'ok', col: 'var(--verde)', op: vis(t, 49.4, 58.5, 0.5, 0.01), u: p(t, 49.7, 50.3, E.lin) }], 165);
      o += pills(338, [{ s: '0,15 ≠ 0,6 · 0,2 = 0,12', icon: 'no', col: 'var(--rosso)', op: vis(t, 51, 58.5, 0.5, 0.01), u: p(t, 51.3, 51.9, E.lin) }], 465);
      return o;
    },
  });

  /* ======================================================================
     Ripasso della Parte 1: le clip delle sezioni, una dopo l'altra.
     Quando si aggiunge una clip, metterla anche in questa lista (nell'ordine del testo).
     ====================================================================== */
  PV.seq('parte1', ['esiti', 'evento', 'operazioni', 'demorgan', 'uniformi', 'assiomi', 'conseguenze', 'condizionale', 'bayes', 'indipendenza'], {
    title: 'Ripasso della Parte 1',
    alt: 'Ripasso in video della Parte 1: le animazioni delle singole sezioni una dopo l’altra, ciascuna preceduta da un cartello con il titolo.',
  });
})();
