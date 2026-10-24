/* =========================================================================
   pv-parte3z.js — ripasso della Parte 3 (Modelli continui): mette in fila, nell'ordine del capitolo,
   le 39 clip delle sezioni 3.1-3.36, che stanno in pv-parte3.js, pv-parte3b.js, pv-parte3c.js e
   pv-parte3d.js e si caricano prima di questo file. (philimite sta in 4.2, fuori dal ripasso.)
   ========================================================================= */
(function () {
  'use strict';
  PV.seq('parte3', [
    'puntiintervalli', 'mista',
    'area', 'primitiva', 'improprio',
    'istogramma', 'ripc', 'normalizza', 'quantili', 'baricentro', 'cauchy', 'pezzi',
    'uniformec', 'lineare', 'quadrato', 'monotona', 'sostituzione', 'inversione',
    'doppi', 'congiuntac', 'appuntamento', 'condizc', 'parti',
    'esponenziale', 'convoluzione', 'minmaxc', 'condevento', 'torre',
    'gamma_f', 'gammac', 'gauss_int', 'normale', 'standard', 'normaleintervallo', 'duerami', 'guasto', 'formulacode',
    'caratteristica', 'phiprop',
  ], {
    title: 'Ripasso della Parte 3',
    alt: 'Ripasso in video della Parte 3: le animazioni delle singole sezioni una dopo l’altra, ciascuna preceduta da un cartello con il titolo.',
  });
})();
