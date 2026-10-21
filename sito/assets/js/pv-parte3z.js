/* =========================================================================
   pv-parte3z.js — ripasso della Parte 3 (Modelli continui): mette in fila le clip delle
   sezioni 3.1-3.9, che stanno in pv-parte3.js, pv-parte3b.js, pv-parte3c.js e pv-parte3d.js
   e si caricano prima di questo file.
   ========================================================================= */
(function () {
  'use strict';
  PV.seq('parte3', [
    'puntiintervalli', 'mista',
    'area', 'primitiva', 'improprio', 'parti', 'gamma_f', 'doppi', 'gauss_int',
    'istogramma', 'ripc', 'normalizza', 'quantili',
    'baricentro', 'cauchy', 'formulacode', 'pezzi',
    'lineare', 'quadrato', 'monotona', 'duerami', 'inversione',
    'congiuntac', 'appuntamento', 'condizc', 'convoluzione', 'minmaxc',
    'condevento', 'torre',
    'uniformec', 'esponenziale', 'gammac', 'normale', 'standard', 'guasto', 'normaleintervallo',
    'caratteristica', 'phiprop', 'philimite',
  ], {
    title: 'Ripasso della Parte 3',
    alt: 'Ripasso in video della Parte 3: le animazioni delle singole sezioni una dopo l’altra, ciascuna preceduta da un cartello con il titolo.',
  });
})();
