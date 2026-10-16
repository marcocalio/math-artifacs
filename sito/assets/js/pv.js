/* =========================================================================
   pv.js — player dei video animati della guida di Probabilità (senza librerie).

   IDEA. Un video è una funzione del tempo: frame(t) restituisce il markup SVG
   del fotogramma al secondo t, senza stato fra un frame e l'altro. Così pausa,
   scorrimento e ripartenza non costano niente, e lo stesso video si può
   disegnare anche in Node (vedi tools/check-pv.mjs). Le animazioni sono
   interpolazioni di t: p(t, a, b, ease) vale 0 prima di a, 1 dopo b.

   USO
     pagina:   <figure class="pv" data-pv="esiti"></figure>
     video:    PV.add('esiti', { title, dur, poster, chap, caps, frame })
               (i video della Parte 1 sono in pv-parte1.js)
     testi:    nelle stringhe, *A* = corsivo, ^c = apice, _1 = pedice,
               ^{xy} / _{xy} = apice/pedice lungo.
   ========================================================================= */
(function (root) {
  'use strict';

  /* ---------- il tempo e le interpolazioni ---------- */
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, u) => a + (b - a) * u;
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const E = {
    lin: (u) => u,
    out: (u) => 1 - (1 - u) ** 3,
    acc: (u) => u ** 3,
    io: (u) => (u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2),
    back: (u) => 1 + 2.70158 * (u - 1) ** 3 + 1.70158 * (u - 1) ** 2, // sfora e torna
    spring: (u) => (u >= 1 ? 1 : 1 - Math.exp(-7 * u) * Math.cos(10 * u)), // molla smorzata
  };
  const p = (t, a, b, e = E.out) => e(seg(t, a, b));
  const pulse = (t, per = 1.4) => 0.5 + 0.5 * Math.sin((2 * Math.PI * t) / per);
  const arc = (ax, ay, bx, by, u, h = 0) => [lerp(ax, bx, u), lerp(ay, by, u) - 4 * h * u * (1 - u)];
  /* numero pseudocasuale deterministico in [0,1) (mulberry32): stesso i, stesso valore */
  function rnd(i) {
    let t = (i + 0x6d2b79f5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /* ---------- mattoncini SVG: ogni funzione restituisce una stringa ---------- */
  const f = (v) => {
    if (!Number.isFinite(v)) throw new RangeError('valore non finito nel frame: ' + v);
    return Math.round(v * 100) / 100;
  };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const AL = { sw: 'stroke-width', fo: 'fill-opacity', so: 'stroke-opacity', op: 'opacity', da: 'stroke-dasharray', dof: 'stroke-dashoffset', ta: 'text-anchor', fs: 'font-size', fw: 'font-weight', ff: 'font-family', tf: 'transform', lc: 'stroke-linecap', lj: 'stroke-linejoin', fr: 'fill-rule' };
  const at = (o) => {
    let s = '';
    for (const k in o) {
      const v = o[k];
      if (v === undefined || v === null || v === false) continue;
      s += ` ${AL[k] || k.replace(/_/g, '-')}="${typeof v === 'number' ? f(v) : v}"`;
    }
    return s;
  };
  const SERIF = 'var(--serif)';
  const SANS = 'var(--sans)';
  const C = { ink: 'var(--inchiostro)', soft: 'var(--inchiostro2)', line: 'var(--riga)', paper: 'var(--foglio)', A: 'var(--pv-a)', B: 'var(--pv-b)', C: 'var(--pv-c)', hi: 'var(--pv-hi)' };
  const T = (x, y, s = 1, r = 0) => `translate(${f(x)} ${f(y)})` + (r ? ` rotate(${f(r)})` : '') + (s !== 1 ? ` scale(${f(s)})` : '');
  const rect = (x, y, w, h, a = {}) => `<rect${at({ x, y, width: w, height: h, fill: 'none', ...a })}/>`;
  const circ = (x, y, r, a = {}) => `<circle${at({ cx: x, cy: y, r, fill: 'none', ...a })}/>`;
  const ell = (x, y, rx, ry, a = {}) => `<ellipse${at({ cx: x, cy: y, rx, ry, fill: 'none', ...a })}/>`;
  const ln = (x1, y1, x2, y2, a = {}) => `<line${at({ x1, y1, x2, y2, ...a })}/>`;
  const path = (d, a = {}) => `<path${at({ d, fill: 'none', ...a })}/>`;
  const g = (a, inner) => `<g${at(a)}>${inner}</g>`;
  /* tratto che si disegna da solo: path/rect/circle con { ...draw(u) }, u da 0 a 1 */
  const draw = (u) => ({ pathLength: 1, da: 1, dof: 1 - u });

  /* testo con mini-markup (vedi sopra); html=true produce <var>/<sup>/<sub> per le didascalie */
  function mm(s, size, html) {
    s = String(s);
    let out = '', buf = '', it = false, sh = 0;
    const put = (txt, extra) => {
      if (!txt) return;
      out += html ? (it ? '<var>' + esc(txt) + '</var>' : esc(txt)) : `<tspan${it ? ' font-style="italic"' : ''}${extra || ''}>${esc(txt)}</tspan>`;
    };
    const flush = () => {
      if (buf) put(buf, sh ? ` dy="${f(-sh)}"` : '');
      sh = 0;
      buf = '';
    };
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === '*') {
        flush();
        it = !it;
      } else if (c === '^' || c === '_') {
        flush();
        let txt;
        if (s[i + 1] === '{') {
          const j = s.indexOf('}', i);
          txt = s.slice(i + 2, j);
          i = j;
        } else txt = s[++i];
        if (html) out += `<${c === '^' ? 'sup' : 'sub'}>${esc(txt)}</${c === '^' ? 'sup' : 'sub'}>`;
        else {
          const d = (c === '^' ? -0.36 : 0.22) * size;
          put(txt, ` dy="${f(d - sh)}" font-size="${f(size * 0.7)}"`);
          sh = d;
        }
      } else buf += c;
    }
    flush();
    return out;
  }
  const tx = (x, y, s, a = {}) => {
    const { size = 18, fill = C.ink, ta = 'middle', ff = SERIF, ...r } = a;
    return `<text${at({ x, y, fill, ta, ff, fs: size, ...r })}>${mm(s, size)}</text>`;
  };
  const lbl = (x, y, s, a = {}) => tx(x, y, s, { ff: SANS, size: 16, fill: C.soft, ...a });

  /* frazione num/den centrata in x, riga di frazione a metà fra le due */
  function frac(x, y, num, den, a = {}) {
    const { size = 20, fill = C.ink, op = 1 } = a;
    const w = Math.max(String(num).length, String(den).length) * size * 0.52 + 10;
    return g({ op }, tx(x, y - size * 0.34, num, { size, fill }) + ln(x - w / 2, y - size * 0.12, x + w / 2, y - size * 0.12, { stroke: fill, sw: 1.5 }) + tx(x, y + size * 0.82, den, { size, fill }));
  }

  /* dado con i puntini; x,y = centro, s = lato */
  const PIPS = [[], [[0, 0]], [[-1, -1], [1, 1]], [[-1, -1], [0, 0], [1, 1]], [[-1, -1], [1, -1], [-1, 1], [1, 1]], [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]];
  function die(x, y, s, n, a = {}) {
    const { rot = 0, sc = 1, op = 1, fill = C.paper, stroke = C.ink } = a;
    let o = rect(-s / 2, -s / 2, s, s, { rx: s * 0.17, fill, stroke, sw: 2.2 });
    for (const [px, py] of PIPS[n]) o += circ(px * s * 0.25, py * s * 0.25, s * 0.07, { fill: stroke });
    return g({ tf: T(x, y, sc, rot), op }, o);
  }
  /* posa di un dado che rotola da t0 per d secondi: rotazione e rimbalzi che si smorzano */
  function rollPose(t, t0, d, dir = 1, hop = 38) {
    const u = seg(t, t0, t0 + d);
    if (u <= 0 || u >= 1) return { u, rot: 0, dy: 0, flying: false };
    return { u, rot: dir * 600 * (1 - E.out(u)), dy: -hop * Math.abs(Math.sin(u * Math.PI * 2.5)) * (1 - u) ** 1.3, flying: u < 0.8 };
  }
  /* casella con etichetta; x,y = centro, s = lato; veil = velo colorato, ring = bordo colorato */
  function tile(x, y, s, label, a = {}) {
    const { fill = C.paper, stroke = C.soft, tc = C.ink, sw = 1.6, sc = 1, op = 1, rot = 0, size = s * 0.52, veil, vo = 0.18, ring, ro = 1, extra = '' } = a;
    const r = s * 0.16;
    return g({ tf: T(x, y, sc, rot), op }, rect(-s / 2, -s / 2, s, s, { rx: r, fill, stroke, sw }) + (veil ? rect(-s / 2, -s / 2, s, s, { rx: r, fill: veil, fo: vo }) : '') + (ring ? rect(-s / 2, -s / 2, s, s, { rx: r, stroke: ring, so: ro, sw: 3 }) : '') + extra + tx(0, size * 0.34, label, { size, fill: tc }));
  }
  const check = (x, y, s, u, a = {}) => path(`M${f(x - s * 0.5)} ${f(y)} L${f(x - s * 0.12)} ${f(y + s * 0.42)} L${f(x + s * 0.55)} ${f(y - s * 0.45)}`, { stroke: 'var(--verde)', sw: s * 0.17, lc: 'round', lj: 'round', ...draw(u), ...a });
  const cross = (x, y, s, u, a = {}) => path(`M${f(x - s * 0.42)} ${f(y - s * 0.42)} L${f(x + s * 0.42)} ${f(y + s * 0.42)} M${f(x + s * 0.42)} ${f(y - s * 0.42)} L${f(x - s * 0.42)} ${f(y + s * 0.42)}`, { stroke: 'var(--rosso)', sw: s * 0.17, lc: 'round', ...draw(u), ...a });

  /* ---------- il player ---------- */
  const VIDEOS = {};
  let current = null;
  const fmt = (s) => {
    s = Math.round(s);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  };
  const lastIdx = (a, t) => {
    let k = 0;
    for (let i = 0; i < a.length; i++) if (a[i][0] <= t + 1e-6) k = i;
    return k;
  };

  const ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    again: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/></svg>',
  };

  const CSS = `
figure.pv{--pv-a:#1F6FB2;--pv-b:#CC6A00;--pv-c:#8E5BB5;--pv-hi:#E0A800;margin:1.8em 0;border:1px solid var(--riga);border-radius:3px;background:var(--foglio);overflow:hidden;font-family:var(--sans)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) figure.pv{--pv-a:#6CB0F0;--pv-b:#F0A040;--pv-c:#B993DD;--pv-hi:#F0C94A}}
:root[data-theme="dark"] figure.pv{--pv-a:#6CB0F0;--pv-b:#F0A040;--pv-c:#B993DD;--pv-hi:#F0C94A}
.pv-stage{position:relative;cursor:pointer;-webkit-tap-highlight-color:transparent}
.pv-stage::before{content:"";position:absolute;inset:0;opacity:.5;background-image:linear-gradient(var(--quadretto) 1px,transparent 1px),linear-gradient(90deg,var(--quadretto) 1px,transparent 1px);background-size:26px 26px;background-position:-1px -1px}
.pv-stage svg{position:relative;display:block;width:100%;height:auto}
.pv-big{position:absolute;inset:0;display:none;place-items:center;border:0;padding:0;cursor:pointer;background:color-mix(in srgb,var(--foglio) 42%,transparent)}
.pv-big span{width:72px;height:72px;border-radius:50%;background:var(--inchiostro);color:var(--foglio);display:grid;place-items:center;box-shadow:0 2px 16px rgba(0,0,0,.28)}
.pv-big svg{width:34px;height:34px;fill:currentColor}
figure.pv[data-st="idle"] .pv-big,figure.pv[data-st="ended"] .pv-big{display:grid}
.pv-bar{display:flex;align-items:center;gap:12px;padding:8px 14px;border-top:1px solid var(--riga)}
.pv-play{flex:none;width:34px;height:34px;border-radius:50%;border:0;padding:0;background:var(--inchiostro);color:var(--foglio);display:grid;place-items:center;cursor:pointer}
.pv-play svg{width:18px;height:18px;fill:currentColor}
.pv-seek{flex:1;min-width:0;accent-color:var(--rosso);cursor:pointer}
.pv-time{flex:none;font-size:.78rem;color:var(--inchiostro2);font-variant-numeric:tabular-nums}
.pv-cap{margin:0;padding:11px 16px 12px;min-height:4.3em;border-top:1px solid var(--riga);font-size:.94rem;line-height:1.5}
.pv-cap var,.pv-trans var{font-family:var(--serif)}
.pv-chap{display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0 14px 12px;list-style:none}
.pv-chap button{font:inherit;font-size:.76rem;line-height:1.2;padding:4px 10px;border:1px solid var(--riga);border-radius:999px;background:transparent;color:var(--inchiostro2);cursor:pointer}
.pv-chap button:hover{border-color:var(--inchiostro2)}
.pv-chap button[aria-current="true"]{background:var(--inchiostro);border-color:var(--inchiostro);color:var(--foglio)}
.pv-trans{margin:0;padding:0 16px 10px;font-size:.88rem;line-height:1.55}
.pv-trans summary{cursor:pointer;color:var(--inchiostro2);font-size:.8rem}
.pv-trans p{margin:.5em 0 0}
figure.pv figcaption{padding:9px 16px 11px;border-top:1px solid var(--riga);font-size:.8rem;line-height:1.5;color:var(--inchiostro2)}
`;

  function mount(fig) {
    const v = VIDEOS[fig.dataset.pv];
    if (!v || fig.dataset.ok) return;
    const W = v.w || 640, H = v.h || 360;
    const own = fig.querySelector('figcaption');
    const note = own ? own.outerHTML : `<figcaption><b>Video</b> · ${esc(v.title)} · ${fmt(v.dur)} · senza audio, con sottotitoli</figcaption>`;
    fig.innerHTML = `<div class="pv-stage"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(v.alt || v.title)}"></svg><button type="button" class="pv-big" aria-label="Guarda il video"><span></span></button></div>
<div class="pv-bar"><button type="button" class="pv-play"></button><input class="pv-seek" type="range" min="0" max="1000" value="0" aria-label="Posizione nel video"><span class="pv-time"></span></div>
<p class="pv-cap"></p>
<ol class="pv-chap">${v.chap.map((c, i) => `<li><button type="button" data-t="${c[0]}">${i + 1}. ${esc(c[1])}</button></li>`).join('')}</ol>
<details class="pv-trans"><summary>Trascrizione</summary>${v.caps.map((c) => `<p>${mm(c[1], 0, true)}</p>`).join('')}</details>${note}`;
    fig.dataset.ok = '1';
    const $ = (s) => fig.querySelector(s);
    const svg = $('svg'), big = $('.pv-big span'), btn = $('.pv-play'), seek = $('.pv-seek'), time = $('.pv-time'), cap = $('.pv-cap');
    const chap = Array.from(fig.querySelectorAll('.pv-chap button'));

    let t = 0, playing = false, started = false, prev = 0, raf = 0, lastSvg = '', lastCap = -1, lastChap = -1, api;

    function state() {
      const st = !started ? 'idle' : playing ? 'playing' : t >= v.dur ? 'ended' : 'paused';
      fig.dataset.st = st;
      const ic = st === 'playing' ? ICON.pause : st === 'ended' ? ICON.again : ICON.play;
      btn.innerHTML = ic;
      btn.setAttribute('aria-label', st === 'playing' ? 'Pausa' : st === 'ended' ? 'Rivedi' : 'Riproduci');
      big.innerHTML = st === 'ended' ? ICON.again : ICON.play;
    }
    function render() {
      const tt = started ? t : v.poster === undefined ? v.dur * 0.5 : v.poster;
      let s;
      try {
        s = v.frame(tt);
      } catch (e) {
        console.error('[pv ' + v.id + ']', e);
        pause();
        return;
      }
      if (s !== lastSvg) {
        svg.innerHTML = s;
        lastSvg = s;
      }
      const ct = started ? t : 0; // barra, tempo, sottotitolo e capitolo seguono il video, non la copertina
      const ci = lastIdx(v.caps, ct), ch = lastIdx(v.chap, ct);
      if (ci !== lastCap) {
        cap.innerHTML = mm(v.caps[ci][1], 0, true);
        lastCap = ci;
      }
      if (ch !== lastChap) {
        chap.forEach((b, i) => (i === ch ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
        lastChap = ch;
      }
      seek.value = Math.round((ct / v.dur) * 1000);
      time.textContent = fmt(ct) + ' / ' + fmt(v.dur);
    }
    function tick(ts) {
      if (!playing) return;
      t = Math.min(v.dur, t + Math.min(0.1, (ts - prev) / 1000));
      prev = ts;
      if (t >= v.dur) playing = false;
      render();
      state();
      if (playing) raf = requestAnimationFrame(tick);
    }
    function play() {
      if (current && current !== api) current.pause();
      current = api;
      if (!started || t >= v.dur - 0.05) t = 0;
      started = true;
      playing = true;
      prev = performance.now();
      state();
      raf = requestAnimationFrame(tick);
    }
    function pause() {
      playing = false;
      cancelAnimationFrame(raf);
      state();
    }
    function goto(x) {
      started = true;
      t = clamp(x, 0, v.dur);
      render();
      state();
    }
    api = { pause };

    $('.pv-stage').addEventListener('click', () => (playing ? pause() : play()));
    btn.addEventListener('click', () => (playing ? pause() : play()));
    let resume = false;
    seek.addEventListener('pointerdown', () => { resume = playing; if (playing) pause(); });
    seek.addEventListener('change', () => { if (resume) { resume = false; play(); } });
    seek.addEventListener('input', () => goto((seek.value / 1000) * v.dur));
    chap.forEach((b) => b.addEventListener('click', () => { goto(+b.dataset.t); play(); }));
    fig.addEventListener('keydown', (e) => {
      if (e.key === ' ' && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        playing ? pause() : play();
      }
    });
    /* fuori dallo schermo il video si ferma */
    if ('IntersectionObserver' in root) new IntersectionObserver((es) => es.forEach((e) => !e.isIntersecting && playing && pause())).observe(fig);

    state();
    render();
  }

  function init() {
    const st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);
    document.querySelectorAll('figure.pv[data-pv]').forEach(mount);
  }

  const PV = {
    videos: VIDEOS,
    add(id, def) {
      if (typeof def.frame !== 'function' || !(def.dur > 0)) throw new Error('video ' + id + ': servono dur e frame');
      VIDEOS[id] = { id, caps: [[0, '']], chap: [[0, '']], ...def };
    },
    /* video lungo: clip già registrate una dopo l'altra, con un cartello (G secondi) fra l'una e l'altra.
       Ogni clip ha il suo orologio: se una clip cambia, il video lungo si ricalcola da solo. */
    seq(id, ids, o = {}) {
      const G = 1.8, vs = ids.map((i) => VIDEOS[i]), off = [];
      vs.forEach((v, k) => { if (!v) throw new Error('seq ' + id + ': manca il video ' + ids[k]); });
      let end = 0;
      vs.forEach((v) => { off.push(end); end += v.dur + G; });
      const caps = [], chap = [];
      vs.forEach((v, k) => {
        v.caps.forEach((c) => caps.push([off[k] + c[0], c[1]]));
        chap.push([off[k], (v.short || v.title) + (v.sec ? ' (' + v.sec + ')' : '')]);
      });
      PV.add(id, {
        ...o,
        dur: end - G,
        caps,
        chap,
        poster: o.poster === undefined ? off[0] + (vs[0].poster || 0) : o.poster,
        frame(t) {
          let k = vs.length - 1;
          while (k > 0 && t < off[k]) k--;
          const v = vs[k], lt = t - off[k];
          if (lt <= v.dur || !vs[k + 1]) return v.frame(Math.min(lt, v.dur));
          const n = vs[k + 1], u = (lt - v.dur) / G; // cartello: esce la clip, entra il titolo, entra la clip dopo
          const a = 1 - p(u, 0, 0.3), c = p(u, 0.25, 0.5) * (1 - p(u, 0.7, 0.95)), b = p(u, 0.75, 1);
          return g({ op: a }, v.frame(v.dur)) + g({ op: c }, (n.sec ? lbl(320, 150, 'sezione ' + n.sec, { size: 20 }) : '') + tx(320, 198, n.short || n.title, { size: 32 })) + g({ op: b }, n.frame(0));
        },
      });
    },
    mount,
    h: { clamp, lerp, seg, E, p, pulse, arc, rnd, f, esc, at, C, SERIF, SANS, T, rect, circ, ell, ln, path, g, draw, tx, lbl, frac, die, rollPose, tile, check, cross },
  };
  root.PV = PV;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'complete') init();
    else document.addEventListener('DOMContentLoaded', init);
  }
})(typeof window !== 'undefined' ? window : globalThis);
