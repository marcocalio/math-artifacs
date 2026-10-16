// Test di fumo dei video: disegna ogni frame (passo 0,1 s) di ogni video e controlla
// che non ci siano valori non finiti né attributi "NaN"/"undefined".
// Uso: node tools/check-pv.mjs
import { createRequire } from 'node:module';
import { readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const js = '../sito/assets/js/';
require(js + 'pv.js');
// tutti i file di clip, in ordine alfabetico (pv-parte0.js, pv-parte0b.js, pv-parte1.js, …)
for (const f of readdirSync(new URL(js, import.meta.url)).filter((n) => /^pv-parte.*\.js$/.test(n)).sort()) require(js + f);

let frames = 0;
for (const v of Object.values(PV.videos)) {
  assert.ok(v.frame(v.poster ?? v.dur / 2).length > 0, `${v.id}: il fotogramma di copertina è vuoto`);
  assert.ok(v.caps[0][0] === 0 && v.chap[0][0] === 0, `${v.id}: sottotitoli e capitoli devono partire da 0`);
  for (const list of [v.caps, v.chap]) list.forEach((c, i) => i && assert.ok(c[0] > list[i - 1][0], `${v.id}: tempi non crescenti`));
  for (let t = 0; t <= v.dur + 1e-9; t += 0.1) {
    const s = v.frame(Math.min(t, v.dur));
    assert.ok(typeof s === 'string', `${v.id}@${t.toFixed(1)}: il frame non è una stringa`);
    assert.ok(!/NaN|undefined|Infinity/.test(s), `${v.id}@${t.toFixed(1)}: valore non valido nel frame`);
    frames++;
  }
}
console.log(`ok: ${Object.keys(PV.videos).length} video, ${frames} frame`);
