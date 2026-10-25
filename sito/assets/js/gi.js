/* =========================================================================
   gi.js — grafici interattivi della guida di Probabilità (senza librerie).

   IDEA. Un grafico è una funzione dello stato dei suoi comandi: render(s)
   restituisce il markup SVG (e il testo dei risultati) per i valori correnti
   dei cursori. Niente stato fra un disegno e l'altro, quindi si può provare
   anche in Node (vedi tools/gi-chk.mjs). Dipende da pv.js (usa PV.h per i
   mattoncini SVG, il mini-markup dei testi e i colori).

   USO
     pagina:   <figure class="gi" data-gi="bayes"></figure>
     grafico:  GI.add('bayes', {
                 sec: '1.12', title: '…', alt: 'descrizione per chi non vede',
                 controls: [{ id: 'prev', label: 'Prevalenza', min: 0.001, max: 0.5, step: 0.001,
                              value: 0.01, log: true, fmt: (v) => GI.pct(v, 1) }, …],
                 presets: [{ label: 'Esempio del testo', set: { prev: 0.01, … } }],   // facoltativo
                 seeded: true,                          // aggiunge «Rilancia» (s.seed cambia)
                 caption: 'Che cosa vedi…', prove: ['Porta … a …: che cosa succede?'],
                 render(s) { return { svg: '…', out: '<p>…</p>' }; },
                 selftest() { return [['nome', ottenuto, atteso, tolleranza], …]; },   // per gi-chk
               })
     controlli: tipo 'range' (predefinito, con log: true per scala logaritmica e
                int: true per interi), 'select' ({ options: [[valore, etichetta], …] }),
                'toggle'. Facoltativi: limits: (s) => [min, max] (estremi che dipendono da altri
                comandi; il valore viene riportato dentro) e show: (s) => bool (nasconde il comando).
     testi SVG: *A* = corsivo, ^c = apice, _1 = pedice, ^{xy} / _{xy} (come nei video).
     testi dei risultati (HTML): GI.v('P') per le variabili, GI.n(v, 3) numeri con la virgola,
                GI.pct(v, 1) percentuali.
   ========================================================================= */
(function (root) {
  'use strict';
  const H = root.PV && root.PV.h;
  if (!H) throw new Error('gi.js richiede pv.js caricato prima');
  const { f, esc, tx, ln, rect, circ, path, g, C, SANS, SERIF } = H;

  /* ---------- numeri all'italiana ---------- */
  const NB = ' ';
  function n(v, dec = 2) {
    if (!Number.isFinite(v)) return '—';
    let s = (Math.abs(v) < 0.5 * 10 ** -dec ? 0 : v).toFixed(dec);
    if (s.startsWith('-')) s = '−' + s.slice(1);
    let [a, b] = s.split('.');
    a = a.replace(/\B(?=(\d{3})+(?!\d))/g, NB);
    return b ? a + ',' + b : a;
  }
  const pct = (v, dec = 1) => n(v * 100, dec) + NB + '%';
  /* numero molto piccolo o molto grande: 1,5 × 10^−6 (HTML) */
  function sci(v, dig = 2) {
    if (v === 0 || !Number.isFinite(v)) return n(v, 0);
    let e = Math.floor(Math.log10(Math.abs(v)));
    if (e > -3 && e < 6) return n(v, Math.max(0, dig - 1 - e));
    let m = v / 10 ** e;
    if (Math.abs(+m.toFixed(dig - 1)) >= 10) { e += 1; m /= 10; } // 9,999 × 10^e arrotondato diventa 10,0: si passa all'esponente dopo
    return n(m, dig - 1) + NB + '×' + NB + '10<sup>' + (e < 0 ? '−' : '') + Math.abs(e) + '</sup>';
  }
  const v = (s) => '<var>' + s + '</var>';

  /* ---------- matematica di base (verificata contro Python in gi-chk) ---------- */
  const LG = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  function lgamma(x) {
    if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
    x -= 1;
    let a = 0.99999999999980993;
    const t = x + 7.5;
    for (let i = 0; i < 8; i++) a += LG[i] / (x + i + 1);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }
  function erfc(x) {
    if (x < 0) return 2 - erfc(-x);
    if (x < 2.5) { // serie di Taylor di erf
      let term = x, sum = x;
      for (let k = 1; k < 80; k++) {
        term *= -x * x / k;
        const d = term / (2 * k + 1);
        sum += d;
        if (Math.abs(d) < 1e-17 * Math.abs(sum)) break;
      }
      return 1 - (2 / Math.sqrt(Math.PI)) * sum;
    }
    let fr = 0; // frazione continua, dal fondo
    for (let k = 80; k >= 1; k--) fr = (k / 2) / (x + fr);
    return Math.exp(-x * x) / Math.sqrt(Math.PI) / (x + fr);
  }
  const Phi = (z) => 0.5 * erfc(-z / Math.SQRT2);
  const phi = (z) => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
  function Phiinv(p) { // algoritmo di Acklam + un passo di Halley
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
    const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
    const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    let x;
    if (p < 0.02425) { const q = Math.sqrt(-2 * Math.log(p)); x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    else if (p > 1 - 0.02425) { const q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    else { const q = p - 0.5, r = q * q; x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    const e = Phi(x) - p, u = e * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2);
    return x - u / (1 + x * u / 2);
  }
  const binom = (nn, k) => (k < 0 || k > nn ? 0 : Math.exp(lgamma(nn + 1) - lgamma(k + 1) - lgamma(nn - k + 1)));
  function binomPmf(nn, p, k) {
    if (k < 0 || k > nn) return 0;
    if (p <= 0) return k === 0 ? 1 : 0;
    if (p >= 1) return k === nn ? 1 : 0;
    return Math.exp(lgamma(nn + 1) - lgamma(k + 1) - lgamma(nn - k + 1) + k * Math.log(p) + (nn - k) * Math.log(1 - p));
  }
  const poisPmf = (lam, k) => (k < 0 ? 0 : lam === 0 ? (k === 0 ? 1 : 0) : Math.exp(-lam + k * Math.log(lam) - lgamma(k + 1)));
  const expPdf = (lam, x) => (x < 0 ? 0 : lam * Math.exp(-lam * x));
  const gammaPdf = (al, lam, x) => (x <= 0 ? (x === 0 && al === 1 ? lam : 0) : Math.exp(al * Math.log(lam) + (al - 1) * Math.log(x) - lam * x - lgamma(al)));
  const normPdf = (x, mu = 0, sd = 1) => phi((x - mu) / sd) / sd;
  const normCdf = (x, mu = 0, sd = 1) => Phi((x - mu) / sd);
  /* numeri pseudocasuali riproducibili (mulberry32): stesso seme, stessa sequenza */
  function rng(seed) {
    let a = (seed | 0) + 0x6d2b79f5;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const M = { lgamma, erfc, Phi, phi, Phiinv, binom, binomPmf, poisPmf, expPdf, gammaPdf, normPdf, normCdf, rng };

  /* ---------- scale, assi e curve ---------- */
  const scale = (d0, d1, r0, r1) => (x) => r0 + ((x - d0) / (d1 - d0)) * (r1 - r0);
  function nice(lo, hi, count = 5) {
    const span = hi - lo || 1, raw = span / count, mag = 10 ** Math.floor(Math.log10(raw)), r = raw / mag;
    const step = (r < 1.5 ? 1 : r < 3.5 ? 2 : r < 7.5 ? 5 : 10) * mag, out = [];
    for (let x = Math.ceil(lo / step - 1e-9) * step; x <= hi + step * 1e-9; x += step) out.push(Math.abs(x) < step * 1e-9 ? 0 : +x.toFixed(12));
    return out;
  }
  /* assi: o = { X, Y, box: [sinistra, alto, destra, basso], xt, yt (valori dei segni), xf, yf (formati), xl, yl (titoli), grid } */
  function axes(o) {
    const [l, t, r, b] = o.box, fx = o.xf || ((x) => n(x, 0)), fy = o.yf || ((y) => n(y, 0));
    let s = '';
    if (o.grid) for (const y of o.yt || []) s += ln(l, o.Y(y), r, o.Y(y), { stroke: 'var(--quadretto)', sw: 1 });
    s += ln(l, b, r, b, { stroke: C.soft, sw: 1.6 }) + (o.noy ? '' : ln(l, t, l, b, { stroke: C.soft, sw: 1.6 }));
    for (const x of o.xt || []) s += ln(o.X(x), b, o.X(x), b + 5, { stroke: C.soft, sw: 1.4 }) + tx(o.X(x), b + 22, fx(x), { ff: SANS, size: 15, fill: C.soft });
    if (!o.noy) for (const y of o.yt || []) s += ln(l - 5, o.Y(y), l, o.Y(y), { stroke: C.soft, sw: 1.4 }) + tx(l - 9, o.Y(y) + 5, fy(y), { ff: SANS, size: 15, fill: C.soft, ta: 'end' });
    if (o.xl) s += tx(r, b + 44, o.xl, { ff: SANS, size: 16, fill: C.soft, ta: 'end' });
    if (o.yl) s += tx(l, t - 10, o.yl, { ff: SANS, size: 16, fill: C.soft, ta: 'start' });
    return s;
  }
  const pts = (xs, ys, X, Y) => xs.map((x, i) => `${i ? 'L' : 'M'}${f(X(x))} ${f(Y(ys[i]))}`).join('');
  function curve(fn, a, b, X, Y, steps = 160, at = {}) {
    const xs = [], ys = [];
    for (let i = 0; i <= steps; i++) { const x = a + ((b - a) * i) / steps; xs.push(x); ys.push(fn(x)); }
    return path(pts(xs, ys, X, Y), { stroke: C.A, sw: 3, lc: 'round', lj: 'round', ...at });
  }
  function area(fn, a, b, X, Y, base, steps = 120, at = {}) {
    const xs = [], ys = [];
    for (let i = 0; i <= steps; i++) { const x = a + ((b - a) * i) / steps; xs.push(x); ys.push(fn(x)); }
    return path(pts(xs, ys, X, Y) + `L${f(X(b))} ${f(base)}L${f(X(a))} ${f(base)}Z`, { fill: C.A, fo: 0.3, stroke: 'none', ...at });
  }
  /* colonne: x centrale e altezza per ogni valore; w = larghezza in pixel */
  function bars(xs, ys, X, Y, base, w, at = {}) {
    return xs.map((x, i) => (ys[i] > 0 ? rect(X(x) - w / 2, Y(ys[i]), w, Math.max(0, base - Y(ys[i])), { fill: C.A, fo: 0.8, ...at }) : '')).join('');
  }
  const P = { scale, nice, axes, pts, curve, area, bars };

  /* ---------- stile ---------- */
  const CSS = `
figure.gi{--pv-a:#1F6FB2;--pv-b:#CC6A00;--pv-c:#8E5BB5;--pv-hi:#E0A800;margin:1.8em 0;border:1px solid var(--riga);border-left:4px solid var(--pv-a);border-radius:3px;background:var(--foglio);overflow:hidden;font-family:var(--sans)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) figure.gi{--pv-a:#6CB0F0;--pv-b:#F0A040;--pv-c:#B993DD;--pv-hi:#F0C94A}}
:root[data-theme="dark"] figure.gi{--pv-a:#6CB0F0;--pv-b:#F0A040;--pv-c:#B993DD;--pv-hi:#F0C94A}
.gi-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 12px;padding:10px 16px 0}
.gi-tag{font-size:.72rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--pv-a)}
.gi-title{font-size:.98rem;font-weight:600;color:var(--inchiostro)}
.gi-stage{position:relative;padding:4px 8px 0}
.gi-stage svg{display:block;width:100%;height:auto;max-height:420px}
.gi-ctl{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px 22px;padding:6px 16px 4px}
.gi-ctl label{display:block;font-size:.82rem;color:var(--inchiostro2)}
.gi-ctl label[hidden]{display:none}
.gi-lab{display:flex;justify-content:space-between;gap:10px;margin-bottom:2px}
.gi-val{font-variant-numeric:tabular-nums;color:var(--inchiostro)}
.gi-ctl input[type=range]{width:100%;margin:0;accent-color:var(--rosso);cursor:pointer}
.gi-ctl select{width:100%;font:inherit;font-size:.86rem;padding:4px 6px;border:1px solid var(--riga);border-radius:3px;background:var(--carta);color:var(--inchiostro)}
.gi-ctl .gi-tg{display:flex;align-items:center;gap:8px;margin-top:6px}
.gi-btns{display:flex;flex-wrap:wrap;gap:6px;padding:4px 16px 8px}
.gi-btns button{font:inherit;font-size:.78rem;line-height:1.2;padding:5px 11px;border:1px solid var(--riga);border-radius:999px;background:transparent;color:var(--inchiostro2);cursor:pointer}
.gi-btns button:hover,.gi-btns button:focus-visible{border-color:var(--inchiostro2);color:var(--inchiostro)}
.gi-btns button.gi-reset{margin-left:auto}
.gi-out{padding:8px 16px 10px;border-top:1px solid var(--riga);font-size:.92rem;line-height:1.55;min-height:3.2em}
.gi-out p{margin:.15em 0}
.gi-out var,.gi-cap var{font-family:var(--serif)}
.gi-out .gi-hl{font-weight:700;color:var(--inchiostro)}
figure.gi figcaption.gi-cap{padding:9px 16px 11px;border-top:1px solid var(--riga);font-size:.82rem;line-height:1.5;color:var(--inchiostro2)}
.gi-cap ul{margin:.3em 0 0;padding-left:1.2em}
.gi-cap li{margin:.15em 0}
@media (max-width:560px){.gi-ctl{grid-template-columns:1fr}}
`;

  /* ---------- registro e montaggio ---------- */
  const WIDGETS = {};
  const slider = (c, val) => {
    if (!c.log) return val;
    return Math.round(1000 * Math.log(val / c.min) / Math.log(c.max / c.min));
  };
  const fromSlider = (c, pos) => {
    let x = c.log ? c.min * (c.max / c.min) ** (pos / 1000) : +pos;
    if (c.int) { x = Math.round(x); if (c.log) x = +x.toPrecision(3); }
    else if (c.log) x = +x.toPrecision(3);
    else if (c.step) x = Math.round(x / c.step) * c.step;
    return Math.min(c.max, Math.max(c.min, +x.toFixed(10)));
  };
  const defaults = (w) => {
    const s = {};
    w.controls.forEach((c) => { s[c.id] = c.value; });
    if (w.seeded) s.seed = 1;
    return s;
  };

  function mount(fig) {
    const w = WIDGETS[fig.dataset.gi];
    if (!w || fig.dataset.ok) return;
    const W = w.w || 640, Hh = w.h || 340;
    const prove = (w.prove || []).length ? `<ul>${w.prove.map((p) => `<li>${p}</li>`).join('')}</ul>` : '';
    const own = fig.querySelector('figcaption');
    const cap = own ? own.outerHTML : `<figcaption class="gi-cap">${w.caption || ''}${prove}</figcaption>`;
    const id = 'gi-' + w.id;
    const ctl = w.controls.map((c) => {
      const k = `${id}-${c.id}`;
      if (c.kind === 'select') return `<label for="${k}"><span class="gi-lab">${c.label}</span><select id="${k}" data-c="${c.id}">${c.options.map(([val, lab]) => `<option value="${esc(val)}"${val === c.value ? ' selected' : ''}>${esc(lab)}</option>`).join('')}</select></label>`;
      if (c.kind === 'toggle') return `<label class="gi-tg" for="${k}"><input id="${k}" type="checkbox" data-c="${c.id}"${c.value ? ' checked' : ''}> ${c.label}</label>`;
      const lo = c.log ? 0 : c.min, hi = c.log ? 1000 : c.max, st = c.log ? 1 : c.step || (c.int ? 1 : (c.max - c.min) / 200);
      return `<label for="${k}"><span class="gi-lab"><span>${c.label}</span><b class="gi-val" data-v="${c.id}"></b></span><input id="${k}" type="range" min="${lo}" max="${hi}" step="${st}" value="${slider(c, c.value)}" data-c="${c.id}"></label>`;
    }).join('');
    const btns = (w.presets || []).map((p, i) => `<button type="button" data-p="${i}">${p.label}</button>`).join('') + (w.seeded ? '<button type="button" data-seed="1">Rilancia</button>' : '') + '<button type="button" class="gi-reset" data-reset="1">Ripristina</button>';
    fig.innerHTML = `<div class="gi-head"><span class="gi-tag">Grafico interattivo</span><span class="gi-title">${w.title}</span></div>
<div class="gi-stage"><svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(w.alt || w.title)}"></svg></div>
<div class="gi-ctl">${ctl}</div><div class="gi-btns">${btns}</div>
<div class="gi-out" aria-live="polite"></div>${cap}`;
    fig.dataset.ok = '1';
    const svg = fig.querySelector('svg'), out = fig.querySelector('.gi-out');
    const s = defaults(w);
    let raf = 0, lastSvg = '', lastOut = '';
    const readSlider = (el) => fromSlider(w.controls.find((c) => c.id === el.dataset.c), el.value);
    /* limits(s) → [min, max] che dipendono dagli altri comandi; show(s) → false nasconde il comando */
    function fit() {
      w.controls.forEach((c) => {
        const el = fig.querySelector(`[data-c="${c.id}"]`);
        if (!el) return;
        if (c.limits && !c.log && c.kind !== 'select' && c.kind !== 'toggle') {
          const [lo, hi] = c.limits(s);
          el.min = lo; el.max = hi;
          const x = Math.min(hi, Math.max(lo, s[c.id]));
          if (x !== s[c.id]) { s[c.id] = x; el.value = x; }
        }
        if (c.show) el.closest('label').hidden = !c.show(s);
      });
    }
    function paint() {
      raf = 0;
      fit();
      let r;
      try { r = w.render(s); } catch (e) { r = { svg: '', out: '<p>Errore nel disegno: ' + esc(e.message) + '</p>' }; }
      if (r.svg !== lastSvg) { svg.innerHTML = r.svg; lastSvg = r.svg; }
      if (r.out !== lastOut) { out.innerHTML = r.out; lastOut = r.out; }
      w.controls.forEach((c) => {
        const el = fig.querySelector(`[data-v="${c.id}"]`);
        if (el) el.textContent = c.fmt ? c.fmt(s[c.id]) : n(s[c.id], c.int ? 0 : 2);
      });
    }
    const draw = () => { if (!raf) raf = (root.requestAnimationFrame || ((fn) => setTimeout(fn, 16)))(paint); };
    const setAll = (obj) => {
      Object.assign(s, obj);
      w.controls.forEach((c) => {
        const el = fig.querySelector(`[data-c="${c.id}"]`);
        if (!el || !(c.id in obj)) return;
        if (c.kind === 'toggle') el.checked = !!s[c.id];
        else if (c.kind === 'select') el.value = s[c.id];
        else el.value = slider(c, s[c.id]);
      });
      draw();
    };
    fig.addEventListener('input', (e) => {
      const el = e.target, c = el.dataset && w.controls.find((x) => x.id === el.dataset.c);
      if (!c) return;
      s[c.id] = c.kind === 'select' ? el.value : c.kind === 'toggle' ? el.checked : readSlider(el);
      if (w.onchange) w.onchange(s, c.id, setAll);
      draw();
    });
    fig.addEventListener('click', (e) => {
      const b = e.target.closest && e.target.closest('button');
      if (!b) return;
      if (b.dataset.reset) setAll(defaults(w));
      else if (b.dataset.seed) { s.seed += 1; draw(); }
      else if (b.dataset.p) setAll(w.presets[+b.dataset.p].set);
    });
    if (fig.dataset.init) { try { setAll(JSON.parse(fig.dataset.init)); } catch (e) { /* stato iniziale non valido: restano i predefiniti */ } }
    paint();
  }

  function init() {
    const st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);
    document.querySelectorAll('figure.gi[data-gi]').forEach(mount);
  }

  const GI = {
    widgets: WIDGETS,
    add(id, def) {
      if (typeof def.render !== 'function' || !Array.isArray(def.controls)) throw new Error('grafico ' + id + ': servono controls e render');
      WIDGETS[id] = { id, ...def };
    },
    mount, defaults, fromSlider, slider,
    n, pct, sci, v, m: M, p: P, scale, nice, axes, curve, area, bars, pts, rng, esc, H,
  };
  root.GI = GI;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'complete') init();
    else document.addEventListener('DOMContentLoaded', init);
  }
})(typeof window !== 'undefined' ? window : globalThis);
