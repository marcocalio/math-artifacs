// Test di fumo per i file di clip nuovi: node tools/pv-chk.mjs pv-parte3.js [altri file…]
// Carica pv.js e le clip già esistenti (tutti i file pv-parte* TRANNE quelli indicati), poi i file indicati;
// controlla id duplicati, metadati (sec, short, title, alt, poster), tempi di sottotitoli e capitoli,
// velocità di lettura (≤ 19 car/s), valori NaN e corpi di testo sotto 17 unità. Esce con 1 se ci sono avvisi.
import { createRequire } from 'node:module';
import { readdirSync, readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const JS = new URL('../sito/assets/js/', import.meta.url).pathname;
require(JS + 'pv.js');
const files = process.argv.slice(2);
if (!files.length) { console.log('uso: node tools/pv-chk.mjs pv-parte3.js [altri file…]'); process.exit(2); }
const orig = PV.add, mine = new Set();
let loading = false;
PV.add = (id, d) => { if (PV.videos[id]) throw new Error('ID DUPLICATO: ' + id); orig(id, d); if (loading) mine.add(id); };
for (const f of readdirSync(JS).filter((n) => /^pv-parte.*\.js$/.test(n) && !files.includes(n) && !/z\.js$/.test(n)).sort()) require(JS + f);
loading = true;
for (const f of files) require(JS + f);
let warn = 0, frames = 0;
const W = (m) => { console.log('ATTENZIONE: ' + m); warn++; };
const vis = (s) => String(s).replace(/[*^_{}]/g, '').length;
for (const id of mine) {
  const v = PV.videos[id];
  const seq = /^parte\d$/.test(id); // il ripasso mette in fila clip già controllate: solo i frame
  if (!seq) for (const k of ['sec', 'short', 'title', 'alt']) if (!v[k]) W(`${id}: manca «${k}»`);
  if (!seq && v.poster === undefined) W(`${id}: manca poster`);
  else if (!seq && (v.poster < 0 || v.poster > v.dur)) W(`${id}: poster fuori dalla durata`);
  if (!seq && (v.dur < 35 || v.dur > 75)) W(`${id}: durata ${v.dur} s (di norma 45-65 s)`);
  if (v.caps[0][0] !== 0 || v.chap[0][0] !== 0) W(`${id}: sottotitoli e capitoli devono partire da 0`);
  for (const list of [v.caps, v.chap]) list.forEach((c, i) => i && c[0] <= list[i - 1][0] && W(`${id}: tempi non crescenti (${c[0]})`));
  if (!seq) v.caps.forEach((c, i) => {
    const d = (i + 1 < v.caps.length ? v.caps[i + 1][0] : v.dur) - c[0], cps = vis(c[1]) / d;
    if (cps > 19) W(`${id}: sottotitolo a ${c[0]} s troppo veloce (${cps.toFixed(1)} car/s, ${vis(c[1])} car in ${d.toFixed(1)} s)`);
    if (c[0] >= v.dur) W(`${id}: sottotitolo oltre la fine`);
  });
  v.chap.forEach((c) => c[0] >= v.dur && W(`${id}: capitolo oltre la fine`));
  for (let t = 0; t <= v.dur + 1e-9; t += 0.1) {
    let s;
    try { s = v.frame(Math.min(t, v.dur)); } catch (e) { W(`${id}@${t.toFixed(1)}: ECCEZIONE ${e.message}`); break; }
    if (/NaN|undefined|Infinity|\[object/.test(s)) { W(`${id}@${t.toFixed(1)}: valore non valido nel frame`); break; }
    frames++;
  }
  console.log(`${id}: ${v.dur} s, ${v.caps.length} sottotitoli, ${v.chap.length} capitoli`);
}
for (const f of files) {
  readFileSync(JS + f, 'utf8').split('\n').forEach((line, i) => {
    if (/^\s*\/\*|^\s*\/\//.test(line)) return;
    for (const m of line.matchAll(/\b(?:size|fs):\s*(\d+(?:\.\d+)?)\b/g)) if (+m[1] < 17) W(`${f}:${i + 1}: corpo ${m[1]} < 17 (testi secondari mai sotto 17 unità)`);
  });
}
console.log(`${mine.size} clip, ${frames} frame, ${warn} avvisi`);
process.exit(warn ? 1 : 0);
