/* =========================================================================
   pv-parte0b.js — video della Parte 0 (Prima di cominciare): sezioni 0.2, 0.5
   e 0.6, più il ripasso 'parte0' che mette in fila tutte le clip della Parte 0
   (anche quelle di 0.3 e 0.4, che stanno in pv-parte0.js).
   Si appoggia a pv.js: ogni video è un PV.add(id, {...}).
   Tutti i tempi sono in secondi; le coordinate sono nel riquadro 640 × 360.
   ========================================================================= */
(function () {
  'use strict';
  const { lerp, E, p, arc, rnd, C, SANS, T, rect, circ, ell, ln, path, g, draw, tx, txc, lbl, tile, check, cross, vis, on, bump, heading, subline, lb, vl, fr, brace, vbrace, wipe, pills } = PV.h;
  const OK = 'var(--verde)', NO = 'var(--rosso)';

  /* ======================================================================
     0.2 · Leggere una formula ad alta voce, e la somma di Gauss
     ====================================================================== */
  const FORMS = [
    {
      a: 1, b: 16, rows: [3, 5.5, 8], ex: [11, 15.6],
      parts: [['*P*(*A*^c) =', C.A], [' 1 −', C.B], [' *P*(*A*)', C.C]],
      read: ['la probabilità che A non succeda, è', 'uno meno', 'la probabilità che A succeda'],
      pill: 'piove al 30% → non piove al 1 − 0,3 = 70%',
    },
    {
      a: 16.2, b: 31, rows: [18, 20.5, 23], ex: [26.5, 30.6],
      parts: [['*P*(*A* ∪ *B*) =', C.A], [' *P*(*A*) + *P*(*B*)', C.B], [' − *P*(*A* ∩ *B*)', C.C]],
      read: ['la probabilità di A oppure B, è', 'quella di A, più quella di B,', 'meno quella che succedano entrambi'],
      pill: 'caffè 70% + tè 40% − entrambi 25% = 85%',
    },
    {
      a: 31.2, b: 47, rows: [33, 35.5, 38], ex: [41, 46.6],
      parts: [['*P*(*A* | *B*) =', C.A], [' *P*(*A* ∩ *B*)', C.B], [' / *P*(*B*)', C.C]],
      read: ['la probabilità di A, sapendo B, è', 'la probabilità che succedano A e B', 'diviso la probabilità di B'],
      pill: '',
    },
  ];

  PV.add('formula', {
    sec: '0.2',
    short: 'Leggere una formula',
    title: 'Leggere una formula ad alta voce, e la somma di Gauss',
    alt: 'Animazione: tre formule di probabilità lette da sinistra a destra, un pezzo alla volta, con la loro frase in italiano; poi la somma dei primi n interi spiegata scrivendola due volte, la seconda al contrario.',
    dur: 67,
    poster: 40.5,
    chap: [[0, 'Il complementare'], [16, 'L’unione'], [31, 'La condizionata'], [47, 'La somma di Gauss']],
    caps: [
      [0, 'Una formula è una frase scritta con le abbreviazioni: si legge da sinistra a destra, sostituendo ogni simbolo con la sua parola.'],
      [9.5, 'Se c’è il 30% di probabilità che piova, ce n’è il 70% che non piova: la frase ha senso, quindi la formula è letta bene.'],
      [16, 'La probabilità che succeda A oppure B è quella di A, più quella di B, meno quella che succedano tutti e due.'],
      [26.5, 'Il caffè lo beve il 70%, il tè il 40%, entrambi il 25%: 70 + 40 − 25 = 85%. Senza la sottrazione il 25% sarebbe contato due volte.'],
      [31, 'La probabilità di A sapendo che B è successo è la probabilità che succedano tutti e due, divisa per quella di B.'],
      [41, 'Con un dado, A = «esce 6» e B = «esce un numero pari»: (1/6) ÷ (3/6) = 1/3. Fra i tre casi pari, uno solo è un 6.'],
      [47, 'Si racconta che Gauss, da bambino, sommò 1 + 2 + … + 100 a coppie: 1 + 100, 2 + 99, 3 + 98… fanno sempre 101, e le coppie sono 50.'],
      [54, 'Per un n qualunque: scrivi la somma due volte, la seconda al contrario, e sommale colonna per colonna. Ogni colonna fa n + 1.'],
      [60.5, 'Le colonne sono n, quindi 2S = n(n + 1) e S = n(n + 1)/2. Con n = 100 viene 5 050.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 46.6, 'Una formula è una frase', 'sostituisci ogni simbolo con la sua parola');
      /* le tre formule, lette un pezzo alla volta */
      for (const F of FORMS) {
        const fo = vis(t, F.a, F.b, 0.5, 0.5);
        if (!(fo > 0.004)) continue;
        const parts = F.parts.map(([s, col], i) => [s, t >= F.rows[i] ? col : C.soft]);
        o += txc(320, 132, parts, { size: 34, op: fo });
        F.parts.forEach(([s, col], i) => {
          const u = p(t, F.rows[i], F.rows[i] + 0.5) * fo, y = 190 + i * 40;
          if (!(u > 0.004)) return;
          o += g({ op: u, tf: T(12 * (1 - u), 0) }, tx(240, y, s.trim(), { size: 24, fill: col, ta: 'end' }) + rect(256, y - 20, 4, 26, { rx: 2, fill: col }) + tx(274, y, F.read[i], { ff: SANS, size: 19, ta: 'start' }));
        });
        if (F.pill) o += pills(326, [{ s: F.pill, op: vis(t, F.ex[0], F.ex[1], 0.5, 0.4) }]);
      }
      /* esempio col dado per la condizionata */
      const dv = vis(t, 41, 46.6, 0.5, 0.4);
      if (dv > 0.004) {
        for (let n = 1; n <= 6; n++) {
          const pari = n % 2 === 0, six = n === 6;
          o += tile(70 + (n - 1) * 42, 322, 36, n, { op: dv, size: 18, ring: six ? C.A : pari ? C.B : undefined, veil: pari ? C.B : undefined, vo: 0.2, sc: p(t, 41 + n * 0.08, 41.6 + n * 0.08, E.back) });
        }
        o += tx(330, 330, '(1/6) ÷ (3/6) = 1/3', { size: 26, ta: 'start', op: dv });
      }

      /* la somma di Gauss con n = 10: due file, una al contrario, e le colonne fanno tutte 11 */
      o += heading(t, 47.2, 67.4, 'La somma di Gauss', t < 63.5 ? '1 + 2 + … + n = n(n + 1) / 2' : 'con n = 100: 100 × 101 / 2 = 5 050');
      const gx = (i) => 86 + i * 52;
      for (let i = 0; i < 10; i++) {
        const u1 = p(t, 47.8 + i * 0.12, 48.6 + i * 0.12, E.back), u2 = p(t, 52 + i * 0.1, 52.8 + i * 0.1, E.back), u3 = p(t, 55 + i * 0.1, 55.6 + i * 0.1);
        if (u1 > 0) o += tile(gx(i), 134, 42, i + 1, { sc: u1, op: p(t, 47.8 + i * 0.12, 48.1 + i * 0.12), size: 22 });
        if (u2 > 0) o += tile(gx(i), 190, 42, 10 - i, { sc: u2, op: p(t, 52 + i * 0.1, 52.3 + i * 0.1), size: 22, veil: C.B, vo: 0.18 });
        if (u3 > 0) o += tx(gx(i), 250, 11, { size: 26, fill: OK, op: u3, tf: T(0, 8 * (1 - u3)) });
      }
      const lab = p(t, 48.5, 49.2);
      o += on(lab, tx(32, 140, '*S*', { size: 24, op: lab }) + tx(32, 196, '*S*', { size: 24, fill: C.B, op: p(t, 52, 52.6) }));
      const e1 = p(t, 58, 58.8), e2 = p(t, 61, 61.8);
      o += on(e1, tx(320, 296, '2*S* = 10 × 11 = 110', { size: 28, op: e1, tf: T(0, 8 * (1 - e1)) }));
      o += on(e2, tx(320, 336, '*S* = 110 / 2 = 55', { size: 28, fill: OK, op: e2, tf: T(0, 8 * (1 - e2)) }));
      return o;
    },
  });

  /* ======================================================================
     0.5 · La sommatoria Σ e la produttoria Π
     ====================================================================== */
  const MONO = 'ui-monospace,Menlo,Consolas,monospace';
  /* simbolo grande (Σ o Π) con estremo superiore e inferiore, e l'espressione a destra */
  const bigop = (x, y, sym, top, bot, expr, op = 1, size = 40) =>
    g({ op }, tx(x, y, sym, { size: 104 }) + tx(x, y - 82, top, { size: 24 }) + tx(x, y + 38, bot, { size: 24 }) + tx(x + 62, y - 4, expr, { size, ta: 'start' }));

  PV.add('sommatoria', {
    sec: '0.5',
    short: 'La sommatoria Σ',
    title: 'La sommatoria Σ: un ciclo for scritto in simboli',
    alt: 'Animazione: la somma dei quadrati da 1 a 3 calcolata come un ciclo for; una somma da 0 a 4 che ha cinque addendi; una somma doppia come somma delle celle di una tabella; la produttoria Π.',
    dur: 64,
    poster: 17,
    chap: [[0, 'Σ è un ciclo for'], [22, 'Quanti addendi'], [36, 'Somme doppie'], [52, 'Il prodotto Π']],
    caps: [
      [0, 'Σ è una somma con tanti addendi che seguono uno schema: sotto l’indice e il valore iniziale, sopra quello finale, a destra la regola.'],
      [7, 'È un ciclo for: k parte da 1, arriva a 3, e a ogni giro si accumula k². Fanno 1 + 4 + 9 = 14.'],
      [22, 'L’indice può partire da dove vuoi. Per k da 0 a 4 gli addendi sono cinque, non quattro: da a a b sono b − a + 1, l’errore di uno dei cicli for.'],
      [31, 'Quindi Σ 2^k per k da 0 a 4 vale 1 + 2 + 4 + 8 + 16 = 31.'],
      [36, 'Una somma doppia è la somma di tutte le celle di una tabella: puoi sommare prima le righe o prima le colonne, il risultato non cambia.'],
      [45.5, 'Se ogni cella è un prodotto b_i · c_j, la somma si fattorizza: (1 + 2)(1 + 2 + 3) = 3 × 6 = 18.'],
      [52, 'Π funziona come Σ, ma moltiplica: il prodotto di k per k da 1 a 4 fa 24, cioè 4!.'],
      [57.5, 'Lo incontrerai nella forma Π(1 − p_k): con 0,1, 0,2 e 0,5 fa 0,9 × 0,8 × 0,5 = 0,36.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 21.6, 'La sommatoria Σ', 'un ciclo for scritto in simboli') + heading(t, 22.2, 35.6, 'Da dove parte l’indice', 'Σ 2^k per k da 0 a 4') + heading(t, 36.2, 51.6, 'Somme doppie', 'la somma di tutte le celle di una tabella') + heading(t, 52.2, 64.4, 'Il prodotto Π', 'come Σ, ma si moltiplica');

      /* capitolo 1: il ciclo for */
      const c1 = vis(t, 0.5, 21.6, 0.6, 0.6);
      if (c1 > 0.004) {
        o += bigop(88, 176, 'Σ', '3', '*k* = 1', '*k*^2', c1);
        const lines = ['s = 0', 'for k in 1..3:', '    s = s + k²'];
        const cp = p(t, 3.5, 4.3);
        o += g({ op: cp * c1 }, rect(250, 100, 360, 104, { rx: 10, fill: C.paper, stroke: C.soft, sw: 1.6 }));
        const act = t < 7 ? -1 : t < 8.6 ? 1 : t < 10.5 ? 2 : t < 12.1 ? 1 : t < 14 ? 2 : t < 15.6 ? 1 : t < 17.2 ? 2 : -1;
        if (act >= 0) o += rect(256, 112 + act * 30 - 1, 348, 28, { rx: 5, fill: C.hi, fo: 0.35 });
        lines.forEach((s2, i) => (o += tx(268, 133 + i * 30, s2, { ff: MONO, size: 19, ta: 'start', op: cp * c1 * p(t, 3.5 + i * 0.3, 4.2 + i * 0.3) })));
        const k = t < 7 ? '–' : t < 10.5 ? '1' : t < 14 ? '2' : '3', s = t < 8.6 ? 0 : t < 12.1 ? 1 : t < 15.6 ? 5 : 14;
        const vb = p(t, 5, 5.8);
        const pop = Math.max(bump(t, 8.6, 0.6), bump(t, 12.1, 0.6), bump(t, 15.6, 0.6));
        o += g({ op: vb * c1 }, rect(250, 224, 110, 46, { rx: 10, fill: C.paper, stroke: C.B, sw: 2 }) + tx(305, 255, '*k* = ' + k, { size: 26 }));
        o += g({ op: vb * c1, tf: T(0, 0) }, rect(380, 224, 230, 46, { rx: 10, fill: C.paper, stroke: C.A, sw: 2 + pop * 2 }) + tx(495, 255, '*s* = ' + s, { size: 26, fill: C.A }));
        /* la somma scritta passo dopo passo */
        const parts = [['1²', 8.6], [' + 2²', 12.1], [' + 3²', 15.6], [' = 1 + 4 + 9 = 14', 17.4]];
        const shown = parts.filter((q) => t >= q[1]).map((q) => [q[0], q[1] >= 17.4 ? OK : C.ink]);
        if (shown.length) o += txc(40, 322, [['= ', C.ink]].concat(shown), { size: 30, ta: 'start', op: c1 });
      }

      /* capitolo 2: da 0 a 4 sono cinque addendi */
      const c2 = vis(t, 22.4, 35.6, 0.6, 0.6);
      if (c2 > 0.004) {
        o += bigop(88, 176, 'Σ', '4', '*k* = 0', '2*^k*', c2);
        for (let i = 0; i < 5; i++) {
          const u = p(t, 24 + i * 0.35, 24.7 + i * 0.35, E.back), x = 290 + i * 66;
          if (u > 0) {
            o += tx(x, 118, '*k* = ' + i, { ff: SANS, size: 15, fill: C.soft, op: u * c2 });
            o += tile(x, 160, 56, 2 ** i, { sc: u, op: u * c2, size: 26 });
          }
        }
        const bu = p(t, 27.5, 28.3);
        o += on(bu * c2, g({ op: bu * c2 }, brace(262, 288 + 4 * 66 + 28, 200, C.A, 1) + tx(262 + (288 + 4 * 66 + 28 - 262) / 2, 232, '5 addendi = 4 − 0 + 1', { size: 24, fill: C.A })));
        const wu = p(t, 29.3, 30);
        o += on(wu * c2, g({ op: wu * c2 }, pills(284, [{ s: 'non 4: da a a b sono b − a + 1', icon: 'no', col: NO, op: 1, u: p(t, 29.5, 30.2, E.lin) }])));
        const su = p(t, 31.5, 32.3);
        o += on(su * c2, tx(320, 336, '= 1 + 2 + 4 + 8 + 16 = 31', { size: 30, fill: OK, op: su * c2, tf: T(0, 8 * (1 - su)) }));
      }

      /* capitolo 3: somma doppia come somma delle celle */
      const c3 = vis(t, 36.4, 51.6, 0.6, 0.6);
      if (c3 > 0.004) {
        const cx = (j) => 234 + (j - 1) * 74, cy = (i) => 148 + (i - 1) * 54;
        for (let j = 1; j <= 3; j++) o += tx(cx(j), 112, '*j* = ' + j, { ff: SANS, size: 16, fill: C.soft, op: c3 * p(t, 37, 37.6) });
        for (let i = 1; i <= 2; i++) o += tx(168, cy(i) + 7, '*i* = ' + i, { ff: SANS, size: 16, fill: C.soft, op: c3 * p(t, 37, 37.6) });
        for (let i = 1; i <= 2; i++) for (let j = 1; j <= 3; j++) {
          const u = p(t, 37.4 + ((i - 1) * 3 + j) * 0.25, 38 + ((i - 1) * 3 + j) * 0.25, E.back);
          if (u > 0) o += tile(cx(j), cy(i), 48, i * j, { sc: u, op: c3 * u, size: 24 });
        }
        const ro = p(t, 40, 40.8), co = p(t, 42.2, 43);
        o += on(ro * c3, g({ op: ro * c3 }, tx(cx(3) + 62, cy(1) + 8, '= 6', { size: 26, fill: C.B, ta: 'start' }) + tx(cx(3) + 62, cy(2) + 8, '= 12', { size: 26, fill: C.B, ta: 'start' })));
        o += on(co * c3, g({ op: co * c3 }, [3, 6, 9].map((v, j) => tx(cx(j + 1), 262, v, { size: 26, fill: C.A })).join('') + tx(cx(1) - 62, 262, 'Σ', { size: 26, fill: C.soft })));
        const tu = p(t, 44, 44.8);
        o += on(tu * c3, tx(320, 304, '6 + 12 = 3 + 6 + 9 = 18', { size: 28, fill: OK, op: tu * c3 }));
        const fu = p(t, 46.2, 47);
        o += on(fu * c3, tx(320, 338, '(1 + 2)(1 + 2 + 3) = 3 × 6 = 18', { size: 26, op: fu * c3, tf: T(0, 8 * (1 - fu)) }));
      }

      /* capitolo 4: la produttoria */
      const c4 = vis(t, 52.4, 64.4, 0.6, 0.01);
      if (c4 > 0.004) {
        o += bigop(88, 156, 'Π', '4', '*k* = 1', '*k* = 1 × 2 × 3 × 4 = 24 = 4!', c4, 30);
        const q = p(t, 57.6, 58.4);
        if (q > 0.004) {
          const xs = [150, 270, 390];
          ['0,9', '0,8', '0,5'].forEach((v, i) => {
            const u = p(t, 57.8 + i * 0.5, 58.6 + i * 0.5, E.back);
            if (u > 0) o += tile(xs[i], 262, 62, v, { sc: u, op: u * c4, size: 24 });
            if (i < 2) o += tx(xs[i] + 60, 270, '×', { size: 30, op: p(t, 58.3 + i * 0.5, 58.9 + i * 0.5) * c4 });
          });
          o += tx(150, 322, '1 − 0,1', { ff: SANS, size: 16, fill: C.soft, op: q * c4 }) + tx(270, 322, '1 − 0,2', { ff: SANS, size: 16, fill: C.soft, op: q * c4 }) + tx(390, 322, '1 − 0,5', { ff: SANS, size: 16, fill: C.soft, op: q * c4 });
          const r = p(t, 60.4, 61.2);
          o += on(r * c4, tx(446, 272, '= 0,36', { size: 34, fill: OK, ta: 'start', op: r * c4 }));
        }
      }
      return o;
    },
  });

  /* ======================================================================
     0.5 · Limiti: la sfida ε–N
     ====================================================================== */
  const PX = (n) => 60 + n * 18; // posto del termine n sull'asse orizzontale
  PV.add('limite', {
    sec: '0.5',
    short: 'Limiti: la sfida ε–N',
    title: 'Limiti: che cosa vuol dire «tende a»',
    alt: 'Animazione: i termini 1/n si avvicinano a 0; per ogni tolleranza ε si trova un N da cui tutti i termini stanno dentro la fascia; poi due esempi, (−1)^n/n che tende a 0 e (−1)^n che non ha limite.',
    dur: 62,
    poster: 40,
    chap: [[0, 'Tende a L'], [22, 'La sfida ε–N'], [46, 'Quando il limite c’è o non c’è']],
    caps: [
      [0, 'Una successione è un elenco infinito di numeri. Qui *a**_n* = 1/n: 1, 1/2, 1/3, … I termini si avvicinano a 0 quanto vuoi e da un certo punto in poi ci restano vicini.'],
      [11, 'Si scrive *a**_n* → *L* per *n* → ∞: in questo caso *L* = 0.'],
      [22, 'La definizione è una sfida. Tu scegli una tolleranza ε, piccola quanto vuoi; io rispondo con un N tale che da N in poi tutti i termini distano meno di ε da L.'],
      [32.5, 'Con ε = 0,2 mi basta N = 6; con ε = 0,1, N = 11; con ε = 0,05, N = 21. In generale basta N > 1/ε: più piccola è la tolleranza, più grande è N.'],
      [42.5, 'Con ε = 0,001 mi basta N = 1 001. È N che dipende da ε, non il contrario.'],
      [46, 'Non si chiede che i termini si avvicinino sempre di più: (−1)^n/n cambia segno a ogni passo e tende comunque a 0.'],
      [54, 'Se invece nessun L va bene il limite non esiste: (−1)^n vale −1, 1, −1, 1, … e nessuna tolleranza piccola basta.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 21.6, 'Il limite di una successione', '*a**_n* = 1/*n*  →  0') + heading(t, 22.2, 45.6, 'La sfida: tu scegli ε, io scelgo N', '') + heading(t, 46.2, 62.4, t < 54 ? '(−1)*^n*/*n*  →  0' : '(−1)*^n*  non ha limite', t < 54 ? 'i termini cambiano segno ma si avvicinano a 0' : 'salta fra −1 e 1: nessuna fascia stretta li contiene');
      const rs = p(t, 45.5, 46.8, E.io), sc = lerp(135, 85, rs), y0 = lerp(236, 200, rs), PY = (v) => y0 - v * sc;
      const m1 = p(t, 46.8, 47.8), m2 = p(t, 54.4, 55.4);
      const val = (n) => lerp(lerp(1 / n, (n % 2 ? -1 : 1) / n, m1), n % 2 ? -1 : 1, m2);
      /* tolleranza ε nel tempo */
      const eps = t < 23 ? 0 : t < 24.6 ? 0.2 * p(t, 23, 24.6, E.io) : t < 33 ? 0.2 : t < 34.6 ? lerp(0.2, 0.1, p(t, 33, 34.6, E.io)) : t < 38 ? 0.1 : t < 39.6 ? lerp(0.1, 0.05, p(t, 38, 39.6, E.io)) : t < 45.5 ? 0.05 : t < 54.4 ? lerp(0.05, 0.15, p(t, 45.5, 46.8)) : lerp(0.15, 0.5, p(t, 54.4, 55.6));
      /* fascia attorno a L */
      if (eps > 0.002) o += rect(52, y0 - eps * sc, 556, 2 * eps * sc, { fill: C.hi, fo: 0.32, stroke: C.hi, so: 0.9, sw: 1.5 });
      /* asse di L = 0 e tacche */
      const ax = p(t, 0.3, 1);
      o += g({ op: ax }, ln(50, y0, 612, y0, { stroke: C.soft, sw: 1.4, da: '5 4' }) + tx(14, y0 + 6, '*L* = 0', { ff: SANS, size: 16, fill: C.soft, ta: 'start' }));
      const tk = ax * (1 - p(t, 45.5, 46.5));
      for (const n of [10, 20, 30]) o += on(tk, tx(PX(n), y0 + 24, n, { ff: SANS, size: 15, fill: C.soft, op: tk }));
      /* marcatore di N: i termini a destra stanno dentro la fascia */
      const lim = t >= 24.6 && t < 54.4 && eps > 0.02;
      if (lim) {
        const nm = 1 / eps, mo = p(t, 26, 26.8) * (1 - p(t, 53.8, 54.4));
        o += on(mo, g({ op: mo }, ln(PX(nm), 96, PX(nm), 262, { stroke: OK, sw: 1.6, da: '5 4' }) + tx(PX(nm), 90, '*N*', { size: 22, fill: OK })));
      }
      /* i termini */
      for (let n = 1; n <= 30; n++) {
        const u = p(t, 0.8 + n * 0.3, 1.3 + n * 0.3, E.back);
        if (u <= 0) continue;
        const inside = eps > 0.002 && Math.abs(val(n)) < eps;
        const col = eps > 0.002 ? (inside ? OK : C.soft) : C.A;
        o += circ(PX(n), PY(val(n)), 4.6 * u, { fill: col, stroke: inside ? OK : 'none', sw: 1 });
      }
      /* il valore di ε e di N, a destra in alto */
      const R = [[24.6, 33, '0,2', 6], [34.6, 38, '0,1', 11], [39.6, 45.5, '0,05', 21]];
      for (const [a, b, e, N] of R) {
        const op = vis(t, a, b === 45.5 ? 45.4 : b, 0.5, 0.4);
        if (op > 0.004) o += g({ op }, tx(500, 120, 'ε = ' + e, { size: 32 }) + tx(500, 164, '*N* = ' + N, { size: 32, fill: OK }));
      }
      const pl = vis(t, 42.5, 45.4, 0.5, 0.4);
      o += on(pl, pills(330, [{ s: 'ε = 0,001 → N = 1 001', op: pl }]));
      const pn = vis(t, 28, 32.6, 0.5, 0.4);
      o += on(pn, pills(330, [{ s: 'basta N > 1/ε', op: pn }]));
      /* due esempi: cambia segno / non ha limite */
      const x1 = vis(t, 47.8, 53.8, 0.5, 0.5), x2 = vis(t, 55.4, 62.4, 0.5, 0.01);
      o += on(x1, pills(330, [{ s: 'da N = 7 in poi tutti i termini stanno dentro la fascia', icon: 'ok', col: OK, op: x1, u: p(t, 49, 49.7, E.lin) }]));
      o += on(x2, pills(330, [{ s: 'nessun N: i termini restano a distanza 1 da 0', icon: 'no', col: NO, op: x2, u: p(t, 57, 57.7, E.lin) }]));
      return o;
    },
  });

  /* ======================================================================
     0.5 · Il numero e: dagli interessi al limite notevole
     ====================================================================== */
  /* barre che crescono dal basso: items = [[etichetta, valore, testo nella barra, colore], …] */
  function bars(t, t0, items, base, scale, x0, dx, w, op) {
    let o = '';
    items.forEach(([lab, v, txt, col], i) => {
      const u = p(t, t0 + i * 0.9, t0 + 0.9 + i * 0.9, E.out), h = v * scale * u, x = x0 + i * dx;
      o += rect(x - w / 2, base - h, w, h, { rx: 4, fill: col, fo: 0.85, op });
      if (u > 0.85) o += tx(x, base - h + 24, txt, { size: 19, fill: C.paper, op: op * p(u, 0.85, 1) });
      o += tx(x, base + 22, lab, { ff: SANS, size: 16, fill: C.soft, op: op * p(t, t0 + i * 0.9, t0 + 0.6 + i * 0.9) });
    });
    return o;
  }

  PV.add('euler', {
    sec: '0.5',
    short: 'Il numero e',
    title: 'Il numero e: dagli interessi al limite notevole',
    alt: 'Animazione: 1 euro al 100% annuo con interessi pagati sempre più spesso cresce fino a un tetto, il numero e; poi il limite notevole (1 + x/n)^n → e^x e il caso (1 − λ/n)^n → e^−λ, ponte fra binomiale e Poisson.',
    dur: 60,
    poster: 27,
    chap: [[0, 'Gli interessi'], [30, 'Il limite notevole'], [44, 'Il ponte con Poisson']],
    caps: [
      [0, 'Il numero e salta fuori quando qualcosa cresce in proporzione a quanto ce n’è già. Esempio: 1 € al 100% annuo diventa 2 € dopo un anno.'],
      [6.5, 'Se l’interesse è diviso in due rate del 50%, a metà anno hai 1,50 € e il secondo 50% si calcola su 1,50: a fine anno hai 2,25 €.'],
      [13, 'Dividendo l’anno in n rate il conto diventa (1 + 1/n)^n: ogni mese 2,6130 €, ogni giorno 2,7146 €.'],
      [24, 'Il guadagno cresce, ma non all’infinito: si avvicina a un tetto, e quel tetto è e ≈ 2,7183.'],
      [30, 'Con un tasso x qualunque vale (1 + x/n)^n → e^x. È la forma «1 elevato a ∞»: la base è appena sopra 1, ma moltiplicata n volte si accumula.'],
      [44, 'Con il segno meno è il ponte fra binomiale e Poisson: n prove, ciascuna con probabilità λ/n. La probabilità che nessuna riesca è (1 − λ/n)^n → e^−λ.'],
      [52.5, 'Con λ = 1: n = 10 dà 0,3487, n = 100 dà 0,3660, n = 1 000 dà 0,3677. Il limite è e^−1 = 0,3679.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 29.6, 'Il numero e: gli interessi', t < 12 ? '1 € in banca, interesse del 100% all’anno' : 'dividi l’anno in *n* rate: (1 + 1/*n*)*^n*') + heading(t, 30.2, 43.6, 'Un limite notevole', 'per ogni numero reale *x*') + heading(t, 44.2, 60.4, 'Il ponte con la legge di Poisson', '*n* prove, ciascuna con probabilità λ/*n*');

      /* capitolo 1a: una rata, poi due rate (due righe separate) */
      const a = vis(t, 0.6, 12.4, 0.6, 0.6);
      if (a > 0.004) {
        const y1 = 126, y2 = 226;
        const arrow = (x, y, s2, col, u) => g({ op: u }, tx(x, y - 8, s2, { size: 24, fill: col }) + ln(x - 34, y + 4, x + 34, y + 4, { stroke: col, sw: 2 }));
        o += g({ op: a }, tile(80, y1, 56, '1 €', { size: 20 }) + tile(80, y2, 56, '1 €', { size: 20 }));
        const u1 = p(t, 2, 2.8, E.back);
        o += on(u1 * a, g({ op: u1 * a }, arrow(170, y1, '× 2', C.A, 1) + tile(260, y1, 56, '2 €', { size: 20, veil: C.A, vo: 0.2 }) + tx(310, y1 + 6, 'una rata, a fine anno', { ff: SANS, size: 17, fill: C.soft, ta: 'start' })));
        const u2 = p(t, 6.5, 7.3, E.back), u3 = p(t, 9, 9.8, E.back);
        o += on(u2 * a, g({ op: u2 * a }, arrow(170, y2, '× 1,5', C.B, 1) + tile(260, y2, 56, '1,50', { size: 20, veil: C.B, vo: 0.2 }) + tx(260, y2 + 48, 'a metà anno', { ff: SANS, size: 16, fill: C.soft })));
        o += on(u3 * a, g({ op: u3 * a }, arrow(350, y2, '× 1,5', C.B, 1) + tile(440, y2, 56, '2,25', { size: 20, veil: C.B, vo: 0.2 }) + tx(440, y2 + 48, 'a fine anno', { ff: SANS, size: 16, fill: C.soft })));
        const nt = p(t, 10.2, 11);
        o += on(nt * a, pills(316, [{ s: 'interessi sugli interessi: 2,25 € > 2 €', op: nt * a }]));
      }

      /* capitolo 1b: le barre verso il tetto e */
      const b = vis(t, 12.8, 29.6, 0.6, 0.6);
      if (b > 0.004) {
        const base = 296, sc = 70;
        const items = [['1 volta', 2, '2,0000', C.A], ['2 volte', 2.25, '2,2500', C.A], ['ogni mese', 2.613, '2,6130', C.A], ['ogni giorno', 2.7146, '2,7146', C.A], ['sempre', Math.E, '2,7183', C.B]];
        o += bars(t, 13.4, items, base, sc, 100, 108, 76, b);
        const eo = p(t, 22.5, 23.5) * b;
        o += on(eo, g({ op: eo }, ln(50, base - sc * Math.E, 600, base - sc * Math.E, { stroke: C.B, sw: 2, da: '6 5' }) + tx(600, base - sc * Math.E - 8, 'tetto: e ≈ 2,7183', { ff: SANS, size: 17, fill: C.B, ta: 'end' })));
      }

      /* capitolo 2: (1 + x/n)^n → e^x */
      const c2 = vis(t, 30.6, 43.6, 0.6, 0.6);
      if (c2 > 0.004) {
        o += tx(320, 150, '(1 + *x*/*n*)*^n*  →  *e**^x*', { size: 46, op: c2 });
        o += tx(320, 190, 'per *n* → ∞', { ff: SANS, size: 20, fill: C.soft, op: c2 * p(t, 31.5, 32.2) });
        const bu = p(t, 35, 35.8), eu = p(t, 38.5, 39.3);
        o += on(bu * c2, g({ op: bu * c2 }, tx(190, 262, '1 + *x*/*n*', { size: 30, fill: C.A }) + tx(190, 296, 'la base è appena sopra 1', { ff: SANS, size: 17, fill: C.soft })));
        o += on(bu * c2, g({ op: bu * c2 }, tx(450, 262, '*n* volte', { size: 30, fill: C.B }) + tx(450, 296, 'moltiplicata moltissime volte', { ff: SANS, size: 17, fill: C.soft })));
        o += on(eu * c2, tx(320, 336, 'x = 1  →  e ≈ 2,7183', { size: 26, fill: OK, op: eu * c2 }));
      }

      /* capitolo 3: (1 − λ/n)^n → e^−λ, con λ = 1 */
      const c3 = vis(t, 44.6, 60.4, 0.6, 0.01);
      if (c3 > 0.004) {
        const base = 290, sc = 360;
        const items = [['n = 10', 0.3487, '0,3487', C.A], ['n = 100', 0.366, '0,3660', C.A], ['n = 1 000', 0.3677, '0,3677', C.A], ['n → ∞', Math.exp(-1), '0,3679', C.B]];
        o += bars(t, 47, items, base, sc, 120, 130, 84, c3);
        const eo = p(t, 51.5, 52.5) * c3;
        o += on(eo, g({ op: eo }, ln(50, base - sc * Math.exp(-1), 600, base - sc * Math.exp(-1), { stroke: C.B, sw: 2, da: '6 5' }) + tx(580, base - sc * Math.exp(-1) - 8, '*e*^{−1} ≈ 0,3679', { size: 20, fill: C.B, ta: 'end' })));
        o += tx(320, 112, '(1 − 1/*n*)*^n*  →  *e*^{−1}', { size: 34, op: c3 * p(t, 45, 45.8) });
      }
      return o;
    },
  });

  /* ======================================================================
     0.5 · Le serie: somme infinite, la serie geometrica
     ====================================================================== */
  const NX = (v) => 60 + v * 260; // posto del numero v sulla retta da 0 a 2
  PV.add('serie', {
    sec: '0.5',
    short: 'La serie geometrica',
    title: 'Le serie: la serie geometrica e la serie armonica',
    alt: 'Animazione: le somme parziali di 1 + 1/2 + 1/4 + … si avvicinano a 2; il trucco per sommare la serie geometrica (moltiplicare per q e sottrarre); quando converge; la serie armonica, che ha addendi che tendono a 0 ma somma infinita.',
    dur: 62,
    poster: 36,
    chap: [[0, 'Somme parziali'], [17.5, 'Il trucco'], [40, 'Quando converge'], [52, 'La serie armonica']],
    caps: [
      [0, 'Una serie è una somma con infiniti addendi. Non puoi finire di sommare, ma puoi guardare dove vanno le somme parziali.'],
      [6.5, 'Con 1 + 1/2 + 1/4 + …: le somme parziali sono 1; 1,5; 1,75; 1,875… e ogni passo dimezza la distanza da 2.'],
      [14, 'Dopo 10 passi siamo a 1,99902: la serie converge e la sua somma è 2.'],
      [17.5, 'Perché? Chiamo *S* la somma 1 + *q* + … + *q*^N e la moltiplico per *q*: ottengo *q* + *q*² + … + *q*^{N+1}.'],
      [24, 'Sottraggo: quasi tutto si cancella e restano solo 1 e −*q*^{N+1}. Sono solo somme finite: nessun infinito dato per scontato.'],
      [31, 'Quindi *S*(1 − *q*) = 1 − *q*^{N+1}, cioè *S* = (1 − *q*^{N+1})/(1 − *q*), per *q* ≠ 1.'],
      [40, 'Se |*q*| < 1 la potenza *q*^{N+1} tende a 0, e la somma della serie è 1/(1 − *q*). Se |*q*| ≥ 1 gli addendi non tendono a 0 e la serie non converge.'],
      [47, 'Se si parte da un indice *m* si porta fuori *q*^m: 1/8 + 1/16 + 1/32 + … = (1/2)³/(1 − 1/2) = 1/4.'],
      [52, 'Attenzione: addendi che tendono a 0 non bastano. Nella serie armonica 1 + 1/2 + 1/3 + … ogni gruppo di addendi vale almeno 1/2.'],
      [58, 'Con infiniti gruppi le somme parziali superano qualunque numero: la serie armonica diverge, anche se molto lentamente.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 17.2, 'Una somma con infiniti addendi', 'la serie geometrica di ragione 1/2') + heading(t, 17.8, 39.6, 'Il trucco della somma finita', '*S* = 1 + *q* + *q*² + … + *q**^N*') + heading(t, 40.2, 51.6, 'Quando la serie converge', 'la serie geometrica Σ *q**^k*') + heading(t, 52.2, 62.4, 'La serie armonica', '1 + 1/2 + 1/3 + 1/4 + …');

      /* capitolo 1: i segmenti 1, 1/2, 1/4, … che riempiono la retta fino a 2 */
      const c1 = vis(t, 0.8, 17.2, 0.6, 0.6);
      if (c1 > 0.004) {
        const ay = 250;
        o += g({ op: c1 }, ln(NX(0), ay, NX(2), ay, { stroke: C.soft, sw: 2 }) + [0, 1, 2].map((v) => ln(NX(v), ay - 5, NX(v), ay + 6, { stroke: C.soft, sw: 2 }) + tx(NX(v), ay + 28, v, { size: 20, fill: C.soft })).join(''));
        const T0 = [2.5, 4.5, 6.2, 7.6, 8.8, 9.8, 10.5, 11.1, 11.6, 12];
        let sum = 0;
        for (let k = 0; k < 10; k++) {
          const w = 1 / 2 ** k, u = p(t, T0[k], T0[k] + 0.7, E.out);
          if (u > 0) {
            const col = k % 2 ? C.B : C.A;
            o += rect(NX(sum), 190, 260 * w * u, 40, { fill: col, fo: 0.6, stroke: col, sw: 1.6, op: c1 });
            if (k < 4 && u > 0.9) o += tx(NX(sum) + 130 * w, 217, k === 0 ? '1' : '1/' + 2 ** k, { size: k < 2 ? 24 : 18, op: c1 * p(u, 0.9, 1) });
          }
          sum += w;
        }
        const SN = ['1', '1,5', '1,75', '1,875'];
        const idx = t < 5.2 ? 0 : t < 6.9 ? 1 : t < 8.3 ? 2 : t < 13 ? 3 : 10;
        const lab = t < 13 ? '*S*_' + idx + ' = ' + SN[idx] : '*S*_{10} = 1,99902';
        const lo = p(t, 3.2, 3.8) * c1;
        o += on(lo, tx(320, 154, lab, { size: 32, op: lo }));
        const fin = p(t, 14, 14.8) * c1;
        o += on(fin, g({ op: fin }, ln(NX(2), 170, NX(2), 250, { stroke: OK, sw: 2, da: '5 4' }) + pills(100, [{ s: '1 + 1/2 + 1/4 + … = 2', icon: 'ok', col: OK, op: 1, u: p(t, 14.4, 15.1, E.lin) }])));
      }

      /* capitolo 2: il trucco, S meno qS */
      const c2 = vis(t, 18.2, 39.6, 0.6, 0.6);
      if (c2 > 0.004) {
        const cxp = (i) => 100 + i * 72;
        const R1 = ['1', '*q*', '*q*²', '*q*³', '⋯', '*q**^N*', ''], R2 = ['', '*q*', '*q*²', '*q*³', '⋯', '*q**^N*', '*q*^{N+1}'];
        const canc = p(t, 24.5, 25.5), fade = p(t, 26.5, 27.5);
        const row = (arr, y, t0, col, lab) => {
          let r = '';
          arr.forEach((s2, i) => {
            if (!s2) return;
            const u = p(t, t0 + i * 0.25, t0 + 0.5 + i * 0.25, E.back), mid = i >= 1 && i <= 5;
            const op = u * (1 - 0.8 * (mid ? fade : 0));
            r += tile(cxp(i), y, 42, s2, { sc: u, op, size: s2.length > 8 ? 14 : 18, veil: col, vo: 0.14, ring: mid && canc > 0 ? C.hi : undefined, ro: canc * (1 - fade) });
            if (i > 0 && arr[i - 1]) r += tx(cxp(i) - 36, y + 7, '+', { size: 22, fill: C.soft, op: u * (1 - 0.8 * fade) });
          });
          return r + tx(34, y + 8, lab, { size: 24, op: p(t, t0, t0 + 0.6) * c2 });
        };
        o += g({ op: c2 }, row(R1, 138, 18.6, C.A, '*S*'));
        const m2 = p(t, 21, 21.7);
        o += g({ op: c2 }, row(R2, 198, 21.2, C.B, '*qS*') + on(m2, tx(34, 168, '× *q*', { size: 20, fill: C.B, op: m2 })));
        const sm = p(t, 24, 24.7);
        o += on(sm * c2, g({ op: sm * c2 }, ln(60, 230, 570, 230, { stroke: C.soft, sw: 1.5 }) + tx(34, 262, '−', { size: 28 })));
        const rs = p(t, 28.2, 29);
        o += on(rs * c2, g({ op: rs * c2 }, tile(cxp(0), 262, 42, '1', { size: 20, ring: OK }) + tile(cxp(6), 262, 42, '−*q*^{N+1}', { size: 14, ring: OK }) + tx(cxp(3), 270, '= 0', { size: 22, fill: C.soft, op: 0.9 })));
        const e1 = p(t, 31, 31.8), e2 = p(t, 35, 35.8);
        o += on(e1 * c2, tx(320, 318, '*S*(1 − *q*) = 1 − *q*^{N+1}', { size: 28, op: e1 * c2, tf: T(0, 8 * (1 - e1)) }));
        o += on(e2 * c2, tx(320, 352, '*S* = (1 − *q*^{N+1}) / (1 − *q*)', { size: 28, fill: OK, op: e2 * c2, tf: T(0, 8 * (1 - e2)) }));
      }

      /* capitolo 3: quando converge */
      const c3 = vis(t, 40.6, 51.6, 0.6, 0.6);
      if (c3 > 0.004) {
        o += tx(320, 128, '|*q*| < 1  ⟹  Σ *q**^k* = 1 / (1 − *q*)', { size: 32, op: c3 });
        const p1 = p(t, 42.5, 43.2), p2 = p(t, 44, 44.7), p3 = p(t, 47, 47.8);
        o += on(p1 * c3, pills(188, [{ s: '|q| < 1: la serie converge', icon: 'ok', col: OK, op: p1 * c3, u: p(t, 42.7, 43.4, E.lin) }]));
        o += on(p2 * c3, pills(232, [{ s: '|q| ≥ 1: gli addendi non tendono a 0, non converge', icon: 'no', col: NO, op: p2 * c3, u: p(t, 44.2, 44.9, E.lin) }]));
        o += on(p3 * c3, tx(320, 300, '1/8 + 1/16 + 1/32 + … = (1/2)³ / (1 − 1/2) = 1/4', { size: 24, op: p3 * c3, tf: T(0, 8 * (1 - p3)) }));
      }

      /* capitolo 4: la serie armonica */
      const c4 = vis(t, 52.6, 62.4, 0.6, 0.01);
      if (c4 > 0.004) {
        const base = 262, bx = (k) => 50 + (k - 1) * 35;
        const grp = [[1, 1, '1'], [2, 2, '1/2'], [3, 4, '≥ 1/2'], [5, 8, '≥ 1/2'], [9, 16, '≥ 1/2']];
        for (let k = 1; k <= 16; k++) {
          const u = p(t, 53 + k * 0.12, 53.5 + k * 0.12, E.out), h = (150 / k) * u;
          const gi = grp.findIndex((q) => k >= q[0] && k <= q[1]);
          o += rect(bx(k) - 13, base - h, 26, h, { rx: 2, fill: gi % 2 ? C.B : C.A, fo: 0.7, op: c4 });
        }
        grp.forEach(([a, b, s2], i) => {
          const u = p(t, 55.4 + i * 0.5, 56 + i * 0.5) * c4;
          if (u > 0.004) o += g({ op: u }, brace(bx(a) - 13, bx(b) + 13, base + 6, i % 2 ? C.B : C.A, 1) + tx((bx(a) + bx(b)) / 2, base + 34, s2, { size: 18, fill: C.soft }));
        });
        const pe = p(t, 58.5, 59.3) * c4;
        o += on(pe, pills(120, [{ s: 'per superare 10 servono 12 367 addendi', op: pe }]));
      }
      return o;
    },
  });

  /* ======================================================================
     0.5 · Insiemi numerabili e non numerabili
     ====================================================================== */
  const ZZ = [0, 1, -1, 2, -2, 3, -3, 4]; // gli interi messi in fila
  const ZIG = [ // frazioni p/q (colonna p, riga q) nell'ordine dello zig-zag: [p, q, istante, posto in lista | 0 se già vista]
    [1, 1, 18.2, 1], [1, 2, 19.6, 2], [2, 1, 20.1, 3], [1, 3, 21.4, 4], [2, 2, 21.9, 0], [3, 1, 22.4, 5], [1, 4, 23.8, 6], [2, 3, 24.3, 7], [3, 2, 24.8, 8], [4, 1, 25.3, 9],
  ];
  const DEC = [[3, 1, 4, 1], [5, 5, 0, 0], [7, 1, 8, 2], [2, 5, 0, 9]]; // prime quattro cifre di x1…x4 (come in 1.1)
  const DIAG = [3, 5, 8, 9], YD = [5, 4, 5, 5];

  PV.add('numerabili', {
    sec: '0.5',
    short: 'Numerabile o no',
    title: 'Insiemi numerabili e non numerabili',
    alt: 'Animazione: i numeri pari e gli interi si mettono in fila; le frazioni si elencano per somma p + q crescente; l’intervallo [0, 1] no, perché con l’argomento diagonale ogni lista ne lascia fuori uno.',
    dur: 66,
    poster: 52,
    chap: [[0, 'Mettere in fila'], [14.5, 'Le frazioni'], [34, 'L’argomento diagonale']],
    caps: [
      [0, 'Un insieme infinito è numerabile se i suoi elementi si possono mettere in fila: primo, secondo, terzo… senza saltarne nessuno.'],
      [5, 'I numeri pari lo sono: il pari 2n sta in posizione n. Un insieme infinito può avere «tanti elementi quanto una sua parte».'],
      [9, 'Anche gli interi: 0, 1, −1, 2, −2, 3, −3, … Ogni intero compare, in una posizione precisa.'],
      [14.5, 'E le frazioni, che sembrano molto più fitte? Si elencano per somma p + q crescente: 1/1; poi 1/2 e 2/1; poi 1/3, 2/2, 3/1; poi 1/4, 2/3, 3/2, 4/1…'],
      [26.5, 'Per ogni somma s le frazioni sono solo s − 1, quindi ogni frazione arriva dopo un numero finito di passi. Quelle già viste, come 2/2 = 1/1, si saltano.'],
      [34, 'L’intervallo [0, 1] invece non è numerabile: qualunque lista di numeri ne lascia fuori qualcuno. Scrivi la lista in decimali…'],
      [41, '…e guarda la diagonale: 3, 5, 8, 9. Costruisci y cambiando ogni cifra della diagonale: metti 5, ma se c’è già un 5 metti 4.'],
      [50, 'Viene *y* = 0,5455… Differisce da *x*_1 nella prima cifra, da *x*_2 nella seconda, e così via: non può stare nella lista.'],
      [58, 'Se Ω non è numerabile, una probabilità non si costruisce più sommando punto per punto: servono le σ-algebre e gli integrali.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 14, 'Insiemi numerabili', 'si mettono in fila: primo, secondo, terzo, …') + heading(t, 14.8, 33.6, 'Anche le frazioni sono numerabili', 'si elencano per somma p + q crescente') + heading(t, 34.2, 66.4, 'L’intervallo [0, 1] non lo è', 'qualunque lista ne lascia fuori qualcuno');

      /* capitolo 1: ℕ, pari, interi */
      const c1 = vis(t, 0.6, 13.8, 0.6, 0.6);
      if (c1 > 0.004) {
        const lab = t < 5 ? 'ℕ' : t < 9 ? 'pari' : 'ℤ', sw = t < 5 ? 0 : t < 9 ? 5 : 9;
        const bs = Math.max(bump(t, 5, 0.9), bump(t, 9, 0.9));
        for (let i = 0; i < 8; i++) {
          const u = p(t, 1 + i * 0.2, 1.6 + i * 0.2, E.back);
          const v = t < 5 ? i + 1 : t < 9 ? 2 * (i + 1) : ZZ[i];
          if (u > 0) {
            o += tx(100 + i * 62, 122, (i + 1) + 'º', { ff: SANS, size: 16, fill: C.soft, op: c1 * u });
            o += tile(100 + i * 62, 164, 46, v < 0 ? '−' + -v : v, { sc: u * (1 + 0.14 * bs), op: c1 * u, size: 22, veil: t >= 5 ? (t < 9 ? C.B : C.A) : undefined, vo: 0.2 });
          }
        }
        o += tx(34, 172, lab, { size: 26, fill: C.A, op: c1 * p(t, 1, 1.6) });
        const t1 = p(t, 5.8, 6.5), t2 = p(t, 9.8, 10.5);
        o += on(t1 * c1 * (t < 9 ? 1 : 0), tx(320, 262, 'il pari 2*n* sta in posizione *n*', { size: 26, op: t1 * c1 }));
        o += on(t2 * c1, tx(320, 262, '*k* sta in posizione 2*k*, −*k* in posizione 2*k* + 1', { size: 24, op: t2 * c1 }));
        o += on(t2 * c1, tx(320, 302, 'ogni intero compare', { ff: SANS, size: 18, fill: C.soft, op: t2 * c1 }));
      }

      /* capitolo 2: le frazioni per somma crescente */
      const c2 = vis(t, 15, 33.6, 0.6, 0.6);
      if (c2 > 0.004) {
        const gx = (p2) => 100 + (p2 - 1) * 58, gy = (q) => 120 + (q - 1) * 50;
        for (let q = 1; q <= 4; q++) for (let p2 = 1; p2 <= 4; p2++) {
          const u = p(t, 15.4 + (p2 + q) * 0.12, 16 + (p2 + q) * 0.12, E.back), z = ZIG.find((r) => r[0] === p2 && r[1] === q);
          const seen = z && t >= z[2], act = z ? bump(t, z[2], 1) : 0;
          if (u > 0) o += tile(gx(p2), gy(q), 44, p2 + '/' + q, { sc: u * (1 + 0.14 * act), op: c2 * u * (seen || !z ? (seen ? 1 : 0.4) : 0.4), size: 17, veil: seen ? (z[3] ? C.A : NO) : undefined, vo: 0.2, ring: act > 0.05 ? C.hi : undefined, ro: act });
          if (seen) {
            const bo = p(t, z[2] + 0.2, z[2] + 0.7) * c2;
            o += z[3] ? g({ op: bo }, circ(gx(p2) + 22, gy(q) - 22, 11, { fill: C.A }) + tx(gx(p2) + 22, gy(q) - 17, z[3], { ff: SANS, size: 13, fill: C.paper })) : g({ op: bo }, cross(gx(p2) + 22, gy(q) - 22, 14, 1));
          }
        }
        o += tx(gx(1) - 50, 100, 'p →', { ff: SANS, size: 15, fill: C.soft, ta: 'start', op: c2 }) + tx(gx(1) - 50, 150, 'q', { ff: SANS, size: 15, fill: C.soft, ta: 'start', op: c2 });
        const r1 = p(t, 19.6, 20.4), r2 = p(t, 21.9, 22.7), r3 = p(t, 27, 27.8), r4 = p(t, 30.5, 31.3);
        o += on(r1 * c2, tx(340, 128, '*s* = *p* + *q* = 3: 1/2, 2/1', { size: 22, ta: 'start', op: r1 * c2 }));
        o += on(r2 * c2, tx(340, 172, '2/2 = 1/1: già visto, si salta', { size: 22, ta: 'start', fill: NO, op: r2 * c2 }));
        o += on(r3 * c2, tx(340, 224, 'per ogni *s*: *s* − 1 frazioni', { size: 22, ta: 'start', op: r3 * c2 }));
        o += on(r4 * c2, pills(334, [{ s: 'ogni frazione arriva dopo un numero finito di passi', icon: 'ok', col: OK, op: r4 * c2, u: p(t, 30.7, 31.4, E.lin) }]));
      }

      /* capitolo 3: l'argomento diagonale */
      const c3 = vis(t, 34.6, 66.4, 0.6, 0.01);
      if (c3 > 0.004) {
        const dx = (j) => 218 + j * 58, dy = (i) => 112 + i * 38;
        DEC.forEach((row, i) => {
          const u0 = p(t, 35 + i * 0.5, 35.6 + i * 0.5);
          o += tx(96, dy(i) + 8, '*x*_' + (i + 1) + ' =', { size: 24, ta: 'end', op: c3 * u0 }) + tx(dx(0) - 28, dy(i) + 8, '0,', { size: 24, ta: 'middle', op: c3 * u0 });
          row.forEach((d, j) => {
            const diag = i === j, hl = diag ? p(t, 41 + i * 0.7, 41.5 + i * 0.7) : 0;
            o += tile(dx(j), dy(i), 32, d, { op: c3 * u0, size: 20, ring: diag && hl > 0.01 ? C.hi : undefined, ro: hl, veil: diag && hl > 0.01 ? C.hi : undefined, vo: 0.3 * hl });
          });
          o += tx(dx(4), dy(i) + 8, '…', { size: 24, fill: C.soft, op: c3 * u0 });
        });
        const yy = 280;
        o += on(p(t, 44.5, 45.2) * c3, tx(96, yy + 8, '*y* =', { size: 26, ta: 'end', fill: OK, op: c3 * p(t, 44.5, 45.2) }) + tx(dx(0) - 28, yy + 8, '0,', { size: 26, fill: OK, op: c3 * p(t, 44.5, 45.2) }));
        YD.forEach((d, j) => {
          const u = p(t, 45.5 + j * 1.1, 46.2 + j * 1.1, E.back);
          if (u > 0) {
            o += tile(dx(j), yy, 36, d, { sc: u, op: c3 * u, size: 22, ring: OK, ro: 1, veil: OK, vo: 0.18 });
            o += ln(dx(j), dy(j) + 18, dx(j), yy - 20, { stroke: OK, sw: 1.4, da: '4 4', op: 0.45 * u * c3 });
          }
        });
        o += on(p(t, 50.4, 51), tx(dx(4) + 6, yy + 8, '…', { size: 26, fill: OK, op: c3 * p(t, 50.4, 51) }));
        const rr = p(t, 41.2, 42);
        o += on(rr * c3, tx(500, 168, 'diagonale:', { ff: SANS, size: 17, fill: C.soft, ta: 'start', op: rr * c3 * (1 - p(t, 50, 51)) }) + tx(500, 194, '3, 5, 8, 9', { size: 24, ta: 'start', fill: C.soft, op: rr * c3 * (1 - p(t, 50, 51)) }));
        const n1 = p(t, 52.5, 53.3);
        o += on(n1 * c3, pills(330, [{ s: '*y* non è nella lista: differisce da *x*_k nella cifra k', op: n1 * c3 }]));
      }
      return o;
    },
  });

  /* ======================================================================
     0.6 · Se A allora B: implicazione, viceversa, contrapposta; quantificatori
     ====================================================================== */
  PV.add('implicazioni', {
    sec: '0.6',
    short: 'Se A allora B',
    title: 'Se A allora B: implicazione, viceversa, contrapposta e quantificatori',
    alt: 'Animazione: «se piove, la strada è bagnata» come cerchio dentro un altro; il viceversa è falso (l’autobotte), la contrapposta è vera; poi «per ogni utente esiste una password» contro «esiste una password per ogni utente», e la negazione di «tutti i pacchetti sono arrivati».',
    dur: 60,
    poster: 21,
    chap: [[0, 'Se A allora B'], [26, 'Quantificatori'], [37, 'Negare un «tutti»']],
    caps: [
      [0, 'Quasi ogni teorema dice «se… allora…»: ciò che sta nel «se» sono le ipotesi, ciò che sta nell’«allora» è la tesi.'],
      [5, 'Se piove (A), la strada è bagnata (B): A ⟹ B. Nel diagramma, A sta dentro B.'],
      [10, 'Il viceversa, B ⟹ A, non segue: la strada può essere bagnata perché è passata l’autobotte lavastrade.'],
      [16, 'La contrapposta, non B ⟹ non A, equivale all’originale: se la strada è asciutta, non piove. O valgono tutte e due, o nessuna.'],
      [22.5, 'Attenzione ai «solo se»: «piove solo se la strada è bagnata» significa A ⟹ B. B è una condizione necessaria, non sufficiente.'],
      [26, 'I quantificatori: ∀ si legge «per ogni», ∃ «esiste almeno un». L’ordine conta: «per ogni utente esiste una password»…'],
      [31, '…non è «esiste una password per ogni utente»: nel primo caso ognuno ha la sua, nel secondo una sola vale per tutti.'],
      [37, 'La negazione scambia i quantificatori: la negazione di «tutti i pacchetti sono arrivati» è «almeno un pacchetto non è arrivato»…'],
      [45, '…e non «nessun pacchetto è arrivato». Per smentire un «per ogni» basta un caso.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 25.6, 'Se A allora B', '*A* = «piove»,  *B* = «la strada è bagnata»') + heading(t, 26.2, 36.8, 'Quantificatori: l’ordine conta', '∀ = «per ogni»,  ∃ = «esiste almeno uno»') + heading(t, 36.8, 60.4, 'Negare un «tutti»', 'la negazione scambia i quantificatori');

      /* capitolo 1: diagramma A dentro B */
      const c1 = vis(t, 0.6, 25.6, 0.6, 0.6);
      if (c1 > 0.004) {
        const bu = p(t, 1, 2.6, E.io), au = p(t, 2.6, 4, E.io);
        o += g({ op: c1 }, rect(30, 88, 340, 210, { rx: 14, stroke: C.soft, sw: 2, ...draw(p(t, 0.6, 1.6)) }));
        /* fuori da B: la regione della contrapposta */
        const ou = p(t, 16.2, 17.2) * (1 - p(t, 22, 22.8));
        if (ou > 0.01) o += g({ op: ou * c1 }, `<mask id="im-m">${rect(30, 88, 340, 210, { fill: '#fff' })}${circ(210, 192, 84, { fill: '#000' })}</mask>` + rect(30, 88, 340, 210, { rx: 14, fill: C.hi, fo: 0.4, mask: 'url(#im-m)' }));
        o += g({ op: c1 }, circ(210, 192, 84, { fill: C.B, fo: 0.1 * bu, stroke: C.B, sw: 2.6, ...draw(bu) }) + circ(190, 214, 42, { fill: C.A, fo: 0.16 * au, stroke: C.A, sw: 2.6, ...draw(au) }));
        const lo = p(t, 3, 3.8) * c1;
        o += on(lo, g({ op: lo }, tx(238, 146, '*B*', { size: 28, fill: C.B }) + tx(238, 166, 'bagnata', { ff: SANS, size: 16, fill: C.B }) + tx(190, 218, '*A*', { size: 28, fill: C.A }) + tx(190, 242, 'piove', { ff: SANS, size: 16, fill: C.A })));
        const hu = bump(t, 5, 2.2) * c1;
        if (hu > 0.01) o += circ(190, 214, 42 + 6 * hu, { stroke: C.hi, sw: 4, so: hu });
        /* l'autobotte: bagnato ma non piove */
        const ab = p(t, 10, 10.8, E.back);
        o += on(ab * c1, g({ op: ab * c1 }, circ(248, 208, 8 * ab, { fill: C.C }) + tx(250, 190, 'autobotte', { ff: SANS, size: 15, fill: C.C })));
        /* asciutto: fuori da B, quindi fuori da A */
        const as = p(t, 16, 16.8, E.back);
        o += on(as * c1, g({ op: as * c1 }, circ(66, 124, 8 * as, { fill: C.soft }) + tx(66, 148, 'asciutto', { ff: SANS, size: 15, fill: C.soft })));
        /* le tre frasi a destra */
        const rows = [[140, '*A* ⟹ *B*', 'se piove, è bagnata', 5.4, 'ok'], [206, '*B* ⟹ *A*', 'se è bagnata, piove? no', 11, 'no'], [272, 'non *B* ⟹ non *A*', 'se è asciutta, non piove', 17.2, 'ok']];
        for (const [y, sym, rd, t0, ic] of rows) {
          const u = p(t, t0, t0 + 0.7) * c1;
          if (u > 0.004) o += g({ op: u, tf: T(10 * (1 - u), 0) }, (ic === 'ok' ? check(412, y - 8, 16, p(t, t0 + 0.3, t0 + 1, E.lin)) : cross(412, y - 8, 16, p(t, t0 + 0.3, t0 + 1, E.lin))) + tx(432, y, sym, { size: 26, ta: 'start' }) + tx(432, y + 26, rd, { ff: SANS, size: 16, fill: C.soft, ta: 'start' }));
        }
        const pl = p(t, 22.6, 23.4) * c1;
        o += on(pl, pills(332, [{ s: '«A solo se B» = A ⟹ B', op: pl }, { s: '«A se B» = B ⟹ A', op: pl }]));
      }

      /* capitolo 2: ∀∃ contro ∃∀ */
      const c2 = vis(t, 26.6, 36.8, 0.6, 0.6);
      if (c2 > 0.004) {
        const users = (x, y0) => [0, 1, 2].map((i) => tile(x, y0 + i * 56, 38, 'u' + (i + 1), { size: 16 })).join('');
        /* a sinistra: ∀ utente ∃ password (una a testa); a destra: ∃ password ∀ utente (una per tutti) */
        o += g({ op: c2 }, tx(160, 124, '∀ *u* ∃ *p*', { size: 28, fill: C.A }) + tx(480, 124, '∃ *p* ∀ *u*', { size: 28, fill: C.B }) + users(70, 160) + users(390, 160));
        const kl = p(t, 27.8, 28.6), kr = p(t, 31.4, 32.2);
        for (let i = 0; i < 3; i++) {
          const ul = p(t, 28 + i * 0.5, 28.6 + i * 0.5);
          o += g({ op: ul * c2 }, ln(92, 160 + i * 56, 232, 160 + i * 56, { stroke: C.A, sw: 2.2 }) + tile(256, 160 + i * 56, 38, 'p' + (i + 1), { size: 16, veil: C.A, vo: 0.2 }));
          const ur = p(t, 31.6 + i * 0.4, 32.2 + i * 0.4);
          o += g({ op: ur * c2 }, ln(412, 160 + i * 56, 552, 216, { stroke: C.B, sw: 2.2 }));
        }
        o += g({ op: kr * c2 }, tile(576, 216, 38, 'p', { size: 18, veil: C.B, vo: 0.2 }));
        const tl = p(t, 30, 30.8), tr = p(t, 33.4, 34.2);
        o += on(tl * c2, tx(160, 314, 'ognuno ha la sua', { ff: SANS, size: 18, fill: C.A, op: tl * c2 }));
        o += on(tr * c2, tx(480, 314, 'una sola per tutti', { ff: SANS, size: 18, fill: C.B, op: tr * c2 }));
      }

      /* capitolo 3: negare «tutti i pacchetti sono arrivati» */
      const c3 = vis(t, 37, 60.4, 0.6, 0.01);
      if (c3 > 0.004) {
        const st = t < 41.5 ? 0 : t < 45.5 ? 1 : 2;
        for (let i = 0; i < 10; i++) {
          const u = p(t, 38 + i * 0.12, 38.5 + i * 0.12, E.back), bad = st === 1 ? i === 6 : st === 2;
          if (u > 0) o += tile(66 + i * 56, 170, 44, i + 1, { sc: u, op: c3 * u, size: 18, veil: bad ? NO : OK, vo: 0.18, ring: bad ? NO : OK, ro: 0.9 });
        }
        const lab = [['∀ pacco: arrivato', 'tutti i pacchetti sono arrivati', OK], ['∃ pacco: non arrivato', 'almeno un pacchetto non è arrivato', NO], ['nessuno è arrivato', 'questa NON è la negazione', NO]][st];
        const lu = p(t, 39.5, 40.3) * (st ? 1 : 1);
        o += tx(320, 252, lab[0], { size: 28, fill: lab[2], op: c3 * lu, tf: T(0, 0) });
        o += tx(320, 286, lab[1], { ff: SANS, size: 18, fill: C.soft, op: c3 * lu });
        o += on(c3 * p(t, 41.6, 42.4), pills(334, [{ s: 'la negazione di ∀ è ∃', icon: 'ok', col: OK, op: p(t, 41.6, 42.4) * c3 * (st === 1 ? 1 : st === 2 ? 0.0 : 0), u: p(t, 42, 42.7, E.lin) }]));
        o += on(c3 * p(t, 45.6, 46.4), pills(334, [{ s: '«nessuno» è un’altra frase: per smentire un «tutti» basta un caso', icon: 'no', col: NO, op: p(t, 45.6, 46.4) * c3, u: p(t, 46, 46.7, E.lin) }]));
      }
      return o;
    },
  });

  /* ======================================================================
     0.6 · Le tecniche: per assurdo, controesempio, dimostrazione diretta
     ====================================================================== */
  PV.add('tecniche', {
    sec: '0.6',
    short: 'Assurdo e controesempio',
    title: 'Le tecniche: per assurdo, controesempio, dimostrazione diretta',
    alt: 'Animazione: undici chiavi in dieci celle di una tabella hash (dimostrazione per assurdo); «ogni numero primo è dispari» smentita dal controesempio 2; una dimostrazione diretta che il quadrato di un numero dispari è dispari.',
    dur: 60,
    poster: 18,
    chap: [[0, 'Per assurdo'], [22.5, 'Controesempio'], [38.5, 'Dimostrazione diretta']],
    caps: [
      [0, 'Per assurdo: supponi che la tesi sia falsa e mostra che ne segue qualcosa di impossibile. Esempio: 11 chiavi in una tabella hash con 10 celle.'],
      [6, 'Le prime dieci chiavi possono finire in celle diverse. L’undicesima…'],
      [11.5, '…finisce per forza in una cella già occupata: una collisione.'],
      [14, 'Per assurdo: se ogni cella ne contenesse al più una, le chiavi sarebbero al più 10, e invece sono 11. Quindi una cella ne ha almeno due.'],
      [20.5, 'La negazione di «esiste una cella con almeno due chiavi» è «ogni cella ha al più una chiave»: la regola dei quantificatori al lavoro.'],
      [22.5, 'Controesempio: per smentire una frase «per ogni…» ne basta un caso in cui è falsa. «Ogni numero primo è dispari»: 3, 5, 7, 11… funziona.'],
      [31, '…ma 2 è primo ed è pari. Per confermare una frase non bastano mille casi in cui funziona, per smentirla ne basta uno.'],
      [38.5, 'Dimostrazione diretta: parti dalle ipotesi e arrivi alla tesi passo per passo. Se n è dispari, cioè n = 2k + 1…'],
      [46, '…allora n² = 4k² + 4k + 1 = 2(2k² + 2k) + 1, che è dispari. È anche la contrapposta di «se n² è pari, allora n è pari».'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 22, 'Dimostrazione per assurdo', '11 chiavi in una tabella hash con 10 celle') + heading(t, 22.6, 38, 'Un controesempio basta', '«ogni numero primo è dispari»') + heading(t, 38.6, 60.4, 'Dimostrazione diretta', 'se *n* è dispari, anche *n*² è dispari');

      /* capitolo 1: chiavi che cadono in celle */
      const c1 = vis(t, 0.6, 22, 0.6, 0.6);
      if (c1 > 0.004) {
        const cx = (i) => 68 + i * 54, base = 214;
        const col = p(t, 13, 13.8) * (1 - p(t, 21, 22));
        for (let i = 0; i < 10; i++) {
          const u = p(t, 1 + i * 0.1, 1.6 + i * 0.1, E.back);
          if (u > 0) {
            o += g({ op: c1 * u }, rect(cx(i) - 23, base - 52, 46, 52, { rx: 5, fill: C.paper, stroke: i === 3 && col > 0 ? NO : C.soft, sw: i === 3 && col > 0 ? 3 : 1.8 }) + tx(cx(i), base + 20, i, { ff: SANS, size: 14, fill: C.soft }));
          }
        }
        const dest = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 3];
        for (let k = 1; k <= 11; k++) {
          const t0 = k <= 10 ? 3 + (k - 1) * 0.7 : 11.5, u = p(t, 1.8 + k * 0.08, 2.4 + k * 0.08, E.back), f = p(t, t0, t0 + 0.7, E.acc);
          if (u <= 0) continue;
          const dup = k === 11 || k === 4;
          const x = lerp(40 + (k - 1) * 52, cx(dest[k - 1]) + (k === 11 ? 8 : 0), E.io(f)), y = lerp(112, base - 17 - (k === 11 ? 20 : 0), f) - 30 * Math.sin(Math.PI * f) * (1 - f);
          o += g({ op: c1 * u }, circ(x, y, 15 * u, { fill: dup && col > 0 ? NO : C.A, fo: 0.85 }) + tx(x, y + 5, k, { ff: SANS, size: 14, fill: C.paper }));
        }
        o += on(col * c1, g({ op: col * c1 }, tx(cx(3), 262, 'collisione', { size: 22, fill: NO })));
        const l1 = p(t, 14.2, 14.9), l2 = p(t, 16, 16.7), l3 = p(t, 17.6, 18.3), l4 = p(t, 19.2, 19.9);
        const line = (y, s2, u, ic, col2) => on(u * c1, g({ op: u * c1 }, (ic === 'ok' ? check(70, y - 6, 15, 1) : ic === 'no' ? cross(70, y - 6, 15, 1) : '') + tx(92, y, s2, { ff: SANS, size: 18, ta: 'start', fill: col2 || C.ink })));
        o += line(296, 'supponi: ogni cella ha al più una chiave', l1, '', C.ink) + line(320, 'allora le chiavi sono al più 10', l2, '', C.ink) + line(344, 'ma sono 11: assurdo', l3, 'no', NO);
        o += on(l4 * c1, tx(560, 150, 'quindi una cella ne ha almeno due', { ff: SANS, size: 17, fill: OK, ta: 'end', op: l4 * c1 }));
      }

      /* capitolo 2: il controesempio 2 */
      const c2 = vis(t, 23, 38, 0.6, 0.6);
      if (c2 > 0.004) {
        o += tx(320, 130, '«ogni numero primo è dispari»', { size: 30, op: c2 });
        const pr = [3, 5, 7, 11, 13, 17, 19, 23];
        pr.forEach((v, i) => {
          const u = p(t, 24 + i * 0.55, 24.5 + i * 0.55, E.back), x = 80 + i * 64;
          if (u > 0) o += tile(x, 190, 46, v, { sc: u, op: c2 * u, size: 22 }) + check(x, 236, 18, p(t, 24.3 + i * 0.55, 24.9 + i * 0.55, E.lin), { op: c2 });
        });
        const mo = p(t, 29, 29.8) * (1 - p(t, 31, 31.6));
        o += on(mo * c2, tx(320, 290, 'e così per mille casi…', { ff: SANS, size: 20, fill: C.soft, op: mo * c2 }));
        const two = p(t, 31.2, 32, E.back);
        o += on(two * c2, g({ op: two * c2 }, tile(320, 276, 56, 2, { sc: two, size: 28, ring: NO, ro: 1, veil: NO, vo: 0.2 }) + cross(372, 276, 26, p(t, 32, 32.6, E.lin)) + tx(320, 340, '2 è primo ed è pari: un controesempio basta', { size: 24, fill: NO })));
      }
      /* il 2 sostituisce il quarto riquadro: si sposta a sinistra dopo il confronto */

      /* capitolo 3: dimostrazione diretta */
      const c3 = vis(t, 39, 60.4, 0.6, 0.01);
      if (c3 > 0.004) {
        const L = [
          [41, '*n* è dispari: *n* = 2*k* + 1', C.A],
          [44, '*n*² = (2*k* + 1)² = 4*k*² + 4*k* + 1', C.B],
          [47.4, '*n*² = 2(2*k*² + 2*k*) + 1', C.C],
        ];
        L.forEach(([t0, s2, col], i) => {
          const u = p(t, t0, t0 + 0.8) * c3;
          if (u > 0.004) o += g({ op: u, tf: T(0, 8 * (1 - u)) }, tx(320, 150 + i * 52, s2, { size: 30, fill: col }));
        });
        const fin = p(t, 50.6, 51.4) * c3;
        o += on(fin, g({ op: fin }, tx(320, 312, '2 × (un intero) + 1 è dispari  ∎', { size: 30, fill: OK })));
        const nt = p(t, 54, 54.8) * c3;
        o += on(nt, pills(342, [{ s: 'è anche la contrapposta di «n² pari ⟹ n pari»', op: nt }]));
      }
      return o;
    },
  });

  /* ======================================================================
     0.6 · Induzione: i domino, base e passo
     ====================================================================== */
  const DX = (k) => 60 + (k - 1) * 50; // domino k: perno in basso a destra
  const dom = (x, y, k, ang, col, op = 1) => g({ tf: T(x + 20, y, 1, ang), op }, rect(-20, -64, 20, 64, { rx: 3, fill: C.paper, stroke: col, sw: 2.2 }) + rect(-20, -64, 20, 64, { rx: 3, fill: col, fo: col === C.soft ? 0 : 0.2 }) + tx(-10, -28, k, { ff: SANS, size: 14 }));
  PV.add('induzione', {
    sec: '0.6',
    short: 'Induzione',
    title: 'Induzione: base e passo, come una fila di domino',
    alt: 'Animazione: una fila di domino che cadono uno dopo l’altro (base e passo); la dimostrazione per induzione che 1 + 2 + … + n = n(n + 1)/2; la frase n = n + 1 che supera il passo ma non la base.',
    dur: 64,
    poster: 17,
    chap: [[0, 'Come i domino'], [24, 'Un esempio: Gauss'], [48, 'La base serve']],
    caps: [
      [0, 'L’induzione serve per le frasi del tipo «per ogni n ≥ 1 vale P(n)». Funziona come una fila di tessere del domino.'],
      [5, 'La base: la prima tessera cade, cioè verifichi P(1).'],
      [9, 'Il passo: ogni tessera, cadendo, fa cadere la successiva. Cioè supponi P(n) vera e ne deduci P(n + 1).'],
      [14, 'Base e passo insieme: cade la prima, che fa cadere la seconda, che fa cadere la terza… e cadono tutte.'],
      [24, 'Esempio: 1 + 2 + … + n = n(n + 1)/2. Base, n = 1: il lato sinistro è 1 e il destro è 1·2/2 = 1.'],
      [31, 'Passo: supponi la formula vera per n (ipotesi induttiva) e somma n + 1 a tutti e due i lati.'],
      [38, 'Il lato destro diventa (n + 1)(n/2 + 1) = (n + 1)(n + 2)/2: è la formula con n + 1 al posto di n.'],
      [48, 'La base non è una formalità. La frase «n = n + 1» supera il passo: se n = n + 1, aggiungendo 1 ai due lati si ottiene n + 1 = n + 2.'],
      [56, 'Ma la base è falsa: 1 ≠ 2. Senza di lei la catena non parte, e la frase è falsa per ogni n.'],
    ],
    frame(t) {
      let o = heading(t, 0.2, 23.6, 'Induzione: i domino', '*P*(*n*) per ogni *n* ≥ 1') + heading(t, 24.2, 47.6, 'Un esempio: la somma di Gauss', '1 + 2 + … + *n* = *n*(*n* + 1) / 2') + heading(t, 48.2, 64.4, 'La base non è una formalità', 'una frase falsa che supera il passo');

      /* capitolo 1: i domino */
      const c1 = vis(t, 0.6, 23.6, 0.6, 0.6);
      if (c1 > 0.004) {
        const gy = 236;
        o += g({ op: c1 }, ln(40, gy, 610, gy, { stroke: C.soft, sw: 2 }));
        for (let k = 1; k <= 10; k++) {
          const t0 = 14.4 + (k - 1) * 0.55, f = p(t, t0, t0 + 0.55, E.acc), ang = 72 * f, u = p(t, 1 + k * 0.1, 1.6 + k * 0.1, E.back);
          const first = k === 1 ? p(t, 5, 5.8) : 0, fell = f > 0.5;
          if (u > 0) o += dom(DX(k), gy, k, ang, fell ? OK : first > 0.5 && k === 1 ? OK : C.soft, c1 * u);
        }
        const b1 = p(t, 5, 5.8), b2 = p(t, 9, 9.8);
        o += on(b1 * c1 * (1 - p(t, 8.6, 9.2)), pills(120, [{ s: 'base: P(1) è vera', icon: 'ok', col: OK, op: b1 * c1 * (1 - p(t, 8.6, 9.2)), u: p(t, 5.3, 6, E.lin) }]));
        /* il passo: due tessere vicine alla volta */
        if (t >= 9.6 && t < 13.5) {
          const k = Math.min(4, Math.floor((t - 9.6) / 0.9) + 1), x0 = DX(k) - 6, x1 = DX(k + 1) + 20;
          o += g({ op: b2 * c1 }, rect(x0, 160, x1 - x0, 84, { rx: 8, stroke: C.hi, sw: 3, fill: C.hi, fo: 0.14 }) + tx((x0 + x1) / 2, 140, '*P*(' + (k === 1 ? '1' : '*n*') + ') ⟹ *P*(' + (k === 1 ? '2' : '*n* + 1') + ')', { size: 24 }));
        }
        const fin = p(t, 20.4, 21.2);
        o += on(fin * c1, tx(320, 300, '*P*(*n*) è vera per ogni *n* ≥ 1', { size: 30, fill: OK, op: fin * c1, tf: T(0, 8 * (1 - fin)) }));
      }

      /* capitolo 2: Gauss per induzione */
      const c2 = vis(t, 24.6, 47.6, 0.6, 0.6);
      if (c2 > 0.004) {
        const bs = p(t, 25, 25.8), bk = p(t, 27.5, 28.3);
        o += on(bs * c2, g({ op: bs * c2 }, tx(24, 128, 'Base', { size: 21, fill: C.A, ta: 'start' }) + tx(104, 128, '*n* = 1:   1 = 1·2/2', { size: 26, ta: 'start' })));
        o += on(bk * c2, check(470, 120, 22, p(t, 27.6, 28.3, E.lin), { op: c2 }));
        const ps = p(t, 31, 31.8), l1 = p(t, 32.6, 33.4), l2 = p(t, 35.4, 36.2), l3 = p(t, 38.4, 39.2), l4 = p(t, 41.4, 42.2);
        o += on(ps * c2, tx(24, 182, 'Passo', { size: 21, fill: C.B, ta: 'start', op: ps * c2 }));
        o += on(l1 * c2, tx(104, 182, '1 + … + *n* = *n*(*n* + 1)/2   (ipotesi)', { size: 23, ta: 'start', op: l1 * c2 }));
        o += on(l2 * c2, txc(104, 232, [['1 + … + *n* ', C.ink], ['+ (*n* + 1)', C.B], [' = *n*(*n* + 1)/2 ', C.ink], ['+ (*n* + 1)', C.B]], { size: 21, ta: 'start', op: l2 * c2 }));
        o += on(l3 * c2, tx(104, 282, '= (*n* + 1)(*n*/2 + 1) = (*n* + 1)(*n* + 2)/2', { size: 23, ta: 'start', op: l3 * c2 }));
        o += on(l4 * c2, pills(334, [{ s: 'è la formula con n + 1 al posto di n: vale per ogni n ≥ 1', icon: 'ok', col: OK, op: l4 * c2, u: p(t, 41.7, 42.4, E.lin) }]));
      }

      /* capitolo 3: la base serve (n = n + 1) */
      const c3 = vis(t, 48.6, 64.4, 0.6, 0.01);
      if (c3 > 0.004) {
        o += tx(320, 132, '«*n* = *n* + 1»', { size: 40, op: c3 });
        const ps = p(t, 50, 50.8), bs = p(t, 56, 56.8);
        o += on(ps * c3, g({ op: ps * c3 }, tx(24, 190, 'Passo:', { size: 21, fill: C.B, ta: 'start' }) + tx(110, 190, 'se *n* = *n* + 1, aggiungo 1: *n* + 1 = *n* + 2', { size: 23, ta: 'start' }) + check(612, 182, 20, p(t, 51.5, 52.2, E.lin))));
        o += on(bs * c3, g({ op: bs * c3 }, tx(24, 244, 'Base:', { size: 21, fill: C.A, ta: 'start' }) + tx(110, 244, '*n* = 1:   1 = 2 ?', { size: 23, ta: 'start' }) + cross(612, 236, 20, p(t, 57, 57.7, E.lin))));
        const dm = p(t, 52.6, 53.4);
        for (let k = 1; k <= 8; k++) o += dom(DX(k) + 40, 330, k, 0, k === 1 && bs > 0.5 ? NO : C.soft, c3 * dm * 0.9);
        o += on(p(t, 58.4, 59.2) * c3, tx(320, 356, 'nessuna tessera cade', { ff: SANS, size: 16, fill: NO, op: c3 * p(t, 58.4, 59.2) }));
      }
      return o;
    },
  });

  /* ======================================================================
     Ripasso della Parte 0: le clip di tutte le sezioni, una dopo l'altra, nell'ordine del testo.
     Va qui, in fondo, perché pv-parte0b.js si carica dopo pv-parte0.js (le clip di 0.3 e 0.4).
     Quando si aggiunge una clip, metterla anche in questa lista.
     ====================================================================== */
  PV.seq('parte0', ['formula', 'percentuali', 'logaritmo', 'regole', 'ordine', 'podio', 'anagrammi', 'tartaglia', 'sommatoria', 'limite', 'euler', 'serie', 'numerabili', 'implicazioni', 'tecniche', 'induzione'], {
    title: 'Ripasso della Parte 0',
    alt: 'Ripasso in video della Parte 0: le animazioni delle singole sezioni (simboli, aritmetica, conteggio, strumenti di analisi, dimostrazioni) una dopo l’altra, ciascuna preceduta da un cartello con il titolo.',
  });
})();
