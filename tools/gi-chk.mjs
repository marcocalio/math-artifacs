// Collaudo dei grafici interattivi: node tools/gi-chk.mjs [file.js …]
// Senza argomenti prova tutti i sito/assets/js/gi-parte*.js; con argomenti prova quei file (anche fuori dal sito).
// Controlla: matematica di gi.js contro valori di Python; per ogni grafico, render() su una griglia e su stati casuali
// senza eccezioni, NaN, undefined, Infinity; markup SVG bilanciato; corpi di testo ≥ 14; selftest() del grafico.
// Esce con 1 se ci sono avvisi.
import { createRequire } from 'node:module';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const JS = new URL('../sito/assets/js/', import.meta.url).pathname;
globalThis.window = globalThis;
require(JS + 'pv.js');
require(JS + 'gi.js');
const files = process.argv.slice(2).map((a) => resolve(a));
if (!files.length) readdirSync(JS).filter((n) => /^gi-parte.*\.js$/.test(n)).sort().forEach((n) => files.push(JS + n));
for (const f of files) require(f);
let warn = 0, renders = 0;
const W = (m) => { console.log('ATTENZIONE: ' + m); warn++; };

/* ---- matematica di base: valori di riferimento calcolati con Python (scipy) ---- */
const M = GI.m;
const near = (nome, got, want, rel = 1e-9, abs = 1e-12) => {
  if (!(Math.abs(got - want) <= Math.max(abs, rel * Math.abs(want)))) W(`matematica: ${nome} = ${got}, atteso ${want}`);
};
near('erfc(0.5)', M.erfc(0.5), 0.4795001221869535);
near('erfc(2.4)', M.erfc(2.4), 0.0006885138966450788);
near('erfc(2.6)', M.erfc(2.6), 0.00023603441652934905);
near('erfc(3)', M.erfc(3), 2.2090496998585438e-05);
near('erfc(5)', M.erfc(5), 1.537459794428035e-12);
near('erfc(-1)', M.erfc(-1), 1.8427007929497148);
near('Phi(1.96)', M.Phi(1.96), 0.9750021048517795);
near('Phi(-5)', M.Phi(-5), 2.8665157187919344e-07);
near('Phiinv(0.975)', M.Phiinv(0.975), 1.959963984540054, 1e-9);
near('Phiinv(1e-8)', M.Phiinv(1e-8), -5.612001244174789, 1e-8);
near('Phiinv(0.3)', M.Phiinv(0.3), -0.5244005127080409, 1e-9);
near('lgamma(10.5)', M.lgamma(10.5), 13.940625219403762, 1e-12);
near('lgamma(0.3)', M.lgamma(0.3), 1.0957979948180754, 1e-12);
near('lgamma(100)', M.lgamma(100), 359.1342053695754, 1e-12);
near('binomPmf(10,0.3,3)', M.binomPmf(10, 0.3, 3), 0.2668279319999998, 1e-12);
near('binomPmf(200,0.02,4)', M.binomPmf(200, 0.02, 4), 0.1973486069673124, 1e-11);
near('poisPmf(2,3)', M.poisPmf(2, 3), 0.18044704431548356, 1e-12);
near('poisPmf(12,20)', M.poisPmf(12, 20), 0.00968203216821916, 1e-11);
near('gammaPdf(3,2,1.5)', M.gammaPdf(3, 2, 1.5), 0.4480836153107755, 1e-12);
near('gammaPdf(0.5,2,0.3)', M.gammaPdf(0.5, 2, 0.3), 0.7994710556069332, 1e-11);
near('normPdf(1,0.5,2)', M.normPdf(1, 0.5, 2), 0.19333405840142465, 1e-12);
{ const r = M.rng(7), a = [r(), r(), r()], r2 = M.rng(7), b = [r2(), r2(), r2()]; if (a.join() !== b.join() || a.some((x) => !(x >= 0 && x < 1))) W('rng non riproducibile'); }
if (GI.n(1234567.891, 2) !== '1 234 567,89' || GI.n(-0.5, 1) !== '−0,5' || GI.pct(0.0123, 1) !== '1,2 %') W('formati numerici: ' + GI.n(1234567.891, 2) + ' ' + GI.n(-0.5, 1) + ' ' + GI.pct(0.0123, 1));

/* ---- grafici ---- */
const BAD = /NaN|undefined|Infinity|\[object|null/;
const balance = (svg, id, where) => {
  for (const tag of ['g', 'text', 'tspan']) {
    const o = (svg.match(new RegExp('<' + tag + '(?=[\\s>])', 'g')) || []).length, c = (svg.match(new RegExp('</' + tag + '>', 'g')) || []).length;
    if (o !== c) { W(`${id} ${where}: <${tag}> aperti ${o}, chiusi ${c}`); return; }
  }
};
const lcg = (seed) => () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
for (const [id, w] of Object.entries(GI.widgets)) {
  for (const k of ['sec', 'title', 'alt', 'caption']) if (!w[k]) W(`${id}: manca «${k}»`);
  if (!/^\d\.\d+$/.test(w.sec || '')) W(`${id}: sec non valido`);
  const ids = new Set();
  w.controls.forEach((c) => { if (ids.has(c.id)) W(`${id}: controllo duplicato ${c.id}`); ids.add(c.id); if (c.kind !== 'select' && c.kind !== 'toggle' && !(c.min < c.max && c.value >= c.min && c.value <= c.max)) W(`${id}: controllo ${c.id} con valori incoerenti`); });
  const def = GI.defaults(w);
  const states = [def];
  const num = w.controls.filter((c) => c.kind !== 'select' && c.kind !== 'toggle');
  for (const c of num) for (const x of [c.min, c.max, (c.min + c.max) / 2, c.log ? Math.sqrt(c.min * c.max) : c.min + (c.max - c.min) / 3]) states.push({ ...def, [c.id]: c.int ? Math.round(x) : x });
  for (const c of w.controls.filter((c) => c.kind === 'select')) for (const [val] of c.options) states.push({ ...def, [c.id]: val });
  for (const c of w.controls.filter((c) => c.kind === 'toggle')) states.push({ ...def, [c.id]: !c.value });
  const R = lcg(12345);
  for (let i = 0; i < 160; i++) {
    const s = { ...def };
    for (const c of w.controls) {
      if (c.kind === 'select') s[c.id] = c.options[Math.floor(R() * c.options.length)][0];
      else if (c.kind === 'toggle') s[c.id] = R() < 0.5;
      else s[c.id] = GI.fromSlider(c, c.log ? Math.floor(R() * 1001) : c.min + R() * (c.max - c.min));
    }
    if (w.seeded) s.seed = 1 + Math.floor(R() * 50);
    states.push(s);
  }
  for (const s of states) {
    for (const c of w.controls) {
      if (c.limits) { const [lo, hi] = c.limits(s); if (!(Number.isFinite(lo) && Number.isFinite(hi) && lo <= hi)) { W(`${id}: limits di ${c.id} non valido con ${JSON.stringify(s)}: [${lo}, ${hi}]`); break; } }
      if (c.show && typeof c.show(s) !== 'boolean') { W(`${id}: show di ${c.id} deve dare true o false`); break; }
    }
    let r;
    try { r = w.render(s); } catch (e) { W(`${id}: eccezione con ${JSON.stringify(s)}: ${e.message}`); break; }
    renders++;
    if (!r || typeof r.svg !== 'string' || typeof r.out !== 'string') { W(`${id}: render deve restituire {svg, out}`); break; }
    if (BAD.test(r.svg)) { W(`${id}: valore non valido nel disegno con ${JSON.stringify(s)}: «${r.svg.match(new RegExp('.{30}(' + BAD.source + ').{20}'))?.[0]}»`); break; }
    if (BAD.test(r.out.replace(/\bnull\b/g, ''))) { W(`${id}: valore non valido nel testo con ${JSON.stringify(s)}: «${r.out.match(new RegExp('.{30}(' + BAD.source + ').{20}'))?.[0]}»`); break; }
    balance(r.svg, id, JSON.stringify(s));
    for (const m of r.svg.matchAll(/font-size="([\d.]+)"/g)) if (+m[1] < 14) { W(`${id}: corpo ${m[1]} < 14`); break; }
    if (!r.out.trim()) { W(`${id}: il testo dei risultati è vuoto`); break; }
  }
  let st = 0;
  if (w.selftest) {
    for (const [nome, got, want, tol = 1e-9] of w.selftest()) { st++; if (!(Math.abs(got - want) <= tol)) W(`${id}: ${nome} = ${got}, atteso ${want}`); }
  } else W(`${id}: manca selftest()`);
  console.log(`${id} (${w.sec}): ${states.length} stati, ${st} controlli`);
}
console.log(`${Object.keys(GI.widgets).length} grafici, ${renders} disegni, ${warn} avvisi`);
process.exit(warn ? 1 : 0);
