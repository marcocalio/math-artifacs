# Analisi Matematica 1 & 2 — pacchetto per Cloudflare Pages

Versione del **24 settembre 2026**. Dentro c'è il libro completo, pronto da pubblicare su internet con un link tuo: 38 capitoli, 608 esercizi con soluzione, 494 domande di quiz e un glossario di 127 termini.

> **In una riga:** estrai lo zip, vai su Cloudflare, trascina la cartella **`sito`** nel riquadro di caricamento. Fine.

---

## 1. Cosa c'è nello zip

```
analisi-per-cloudflare.zip
├── GUIDA-CLOUDFLARE.md   ← questa guida (NON va caricata)
└── sito/                 ← il libro: è QUESTA la cartella da caricare
```

### Dentro la cartella `sito`

| Percorso | Che cos'è |
|---|---|
| `index.html` | La home: l'indice dei 38 capitoli divisi in tre parti e la legenda dei simboli. |
| `glossario.html` | Il glossario ricercabile, con filtro per parte. |
| `404.html` | La pagina che compare se qualcuno apre un indirizzo sbagliato. |
| `apple-touch-icon.png` | L'icona ∫ che vedi sulla schermata Home di iPad e iPhone. |
| `favicon.ico` | L'iconcina ∫ nella scheda del browser. |
| `parte0-prerequisiti/` | Parte 0 — Prerequisiti: 9 capitoli. |
| `parte1-analisi1/` | Parte 1 — Analisi Matematica 1: 15 capitoli. |
| `parte2-analisi2/` | Parte 2 — Analisi Matematica 2: 14 capitoli. |
| `assets/css/style.css` | La grafica: colori, tema chiaro/scuro, riquadri, blocchi di calcolo. |
| `assets/js/main.js` | Tema chiaro/scuro, menu su telefono, disegno delle formule, barra di lettura. |
| `assets/js/interactive.js` | Quiz con correzione immediata, definizioni del glossario al clic, anteprime dei richiami "§4.2". |
| `assets/js/glossary-data.js` | Le definizioni del glossario. |
| `assets/vendor/katex/` | KaTeX, il programma che disegna le formule (licenza MIT). È incluso nel pacchetto, quindi le formule non dipendono da servizi esterni. |

**Numeri del pacchetto:** 70 file, 6,5 MB in tutto; il file più grande è `parte1-analisi1/09-studio-di-funzione.html` (0,3 MB). Il piano gratuito di Cloudflare Pages accetta fino a 20.000 file e 25 MB per file: siamo larghissimi.

### I capitoli

**Parte 0 — Prerequisiti**
- **1.** Insiemi, Logica e Numeri — `parte0-prerequisiti/01-insiemi-logica-numeri.html`
- **2.** Algebra e Calcolo Letterale — `parte0-prerequisiti/02-algebra-calcolo-letterale.html`
- **3.** Potenze, Radicali ed Esponenziali — `parte0-prerequisiti/03-potenze-radicali-esponenziali.html`
- **4.** Logaritmi — `parte0-prerequisiti/04-logaritmi.html`
- **5.** Equazioni — `parte0-prerequisiti/05-equazioni.html`
- **6.** Disequazioni — `parte0-prerequisiti/06-disequazioni.html`
- **7.** Geometria Analitica — `parte0-prerequisiti/07-geometria-analitica.html`
- **8.** Trigonometria — `parte0-prerequisiti/08-trigonometria.html`
- **9.** Funzioni Elementari e Grafici — `parte0-prerequisiti/09-funzioni-elementari-grafici.html`

**Parte 1 — Analisi Matematica 1**
- **1.** Numeri Reali e Struttura d'Ordine — `parte1-analisi1/01-numeri-reali-struttura.html`
- **2.** Valore Assoluto e Topologia della Retta — `parte1-analisi1/02-valore-assoluto-topologia.html`
- **3.** Funzioni — `parte1-analisi1/03-funzioni.html`
- **4.** Limiti di funzioni — `parte1-analisi1/04-limiti.html`
- **5.** Infinitesimi, Infiniti e Confronti — `parte1-analisi1/05-infinitesimi-infiniti.html`
- **6.** Continuità — `parte1-analisi1/06-continuita.html`
- **7.** Derivate — `parte1-analisi1/07-derivate.html`
- **8.** Teoremi Fondamentali del Calcolo Differenziale — `parte1-analisi1/08-teoremi-fondamentali.html`
- **9.** Studio Completo di Funzione — `parte1-analisi1/09-studio-di-funzione.html`
- **10.** Sviluppi di Taylor e Mclaurin — `parte1-analisi1/10-taylor-mclaurin.html`
- **11.** Successioni Numeriche — `parte1-analisi1/11-successioni.html`
- **12.** Serie Numeriche — `parte1-analisi1/12-serie-numeriche.html`
- **13.** Integrali Indefiniti — `parte1-analisi1/13-integrali-indefiniti.html`
- **14.** Integrali definiti — `parte1-analisi1/14-integrali-definiti.html`
- **15.** Applicazioni degli Integrali — `parte1-analisi1/15-applicazioni-integrali.html`

**Parte 2 — Analisi Matematica 2**
- **1.** Funzioni di più variabili — `parte2-analisi2/01-funzioni-piu-variabili.html`
- **2.** Limiti e continuità in più variabili — `parte2-analisi2/02-limiti-continuita-piu-variabili.html`
- **3.** Derivate parziali e differenziabilità — `parte2-analisi2/03-derivate-parziali.html`
- **4.** Gradiente e derivata direzionale — `parte2-analisi2/04-gradiente.html`
- **5.** Hessiano, massimi e minimi liberi — `parte2-analisi2/05-hessiano-massimi-minimi.html`
- **6.** Massimi e minimi vincolati: moltiplicatori di Lagrange — `parte2-analisi2/06-moltiplicatori-lagrange.html`
- **7.** Curve e superfici parametriche — `parte2-analisi2/07-curve-superfici.html`
- **8.** Integrali doppi — `parte2-analisi2/08-integrali-doppi.html`
- **9.** Integrali tripli e cambi di variabile — `parte2-analisi2/09-integrali-tripli-cambi-variabile.html`
- **10.** Integrali curvilinei e campi conservativi — `parte2-analisi2/10-integrali-curvilinei.html`
- **11.** Integrali di superficie e campi vettoriali — `parte2-analisi2/11-integrali-superficie-campi-vettoriali.html`
- **12.** Teoremi di Green, Gauss e Stokes — `parte2-analisi2/12-teoremi-green-gauss-stokes.html`
- **13.** Equazioni differenziali ordinarie — `parte2-analisi2/13-equazioni-differenziali.html`
- **14.** Applicazioni: modelli fisici ed economici — `parte2-analisi2/14-applicazioni-analisi2.html`

---

## 2. Pubblicarlo la prima volta (circa 5 minuti)

1. **Estrai lo zip** con un doppio clic. Ottieni una cartella con dentro questa guida e la cartella `sito`.
2. Vai su **dash.cloudflare.com** e crea un account gratuito, oppure accedi se ce l'hai già. Questo passaggio lo devi fare tu: serve la tua email e una tua password.
3. Nel menu a sinistra apri **Workers e Pages** (in inglese *Workers & Pages*, a volte dentro la voce *Compute*), poi premi **Crea** (*Create*), scegli la scheda **Pages** e l'opzione per **caricare i file direttamente** (*Upload assets* / *Direct Upload*). Cloudflare ogni tanto cambia leggermente i nomi dei pulsanti: cerca sempre la strada "caricamento diretto", **non** quella "collega un repository Git".
4. **Dai un nome al progetto**, per esempio `analisi-matematica`. Diventerà l'indirizzo del sito: `analisi-matematica.pages.dev` (se il nome è già preso, Cloudflare ti propone una variante).
5. **Trascina la cartella `sito`** nel riquadro di caricamento. Proprio lei: non lo zip, non la cartella che la contiene. Deve risultare che `index.html` sta "in cima" a ciò che carichi.
6. Aspetta che il caricamento finisca (70 file) e premi **Distribuisci** (*Deploy site*).
7. Dopo pochi secondi Cloudflare ti mostra il link. Aprilo e fai un giro di controllo: la home, un capitolo, un quiz, il glossario, il pulsante 🌙 del tema scuro, un richiamo "§" col mouse sopra.

> **Se preferisci caricare uno zip invece della cartella:** apri `sito`, seleziona **tutto il contenuto** (i file e le cartelle che ci sono dentro) e comprimi quella selezione. Non comprimere la cartella `sito` in sé, altrimenti `index.html` finisce un livello troppo in basso e il sito non trova la home.

---

## 3. Aggiornarlo quando il libro cambia

Ogni volta che modifichiamo il libro ti preparo un nuovo zip identico a questo. Poi:

1. Su Cloudflare apri il tuo progetto (Workers e Pages → il nome del progetto).
2. Premi **Crea nuova distribuzione** (*Create deployment* / *Upload new version*).
3. Trascina la nuova cartella `sito` e premi **Distribuisci**.

Il link resta lo stesso: chi l'ha salvato vede subito la versione nuova. Cloudflare conserva anche lo storico delle versioni precedenti, e da lì puoi tornare indietro con un clic se qualcosa non ti piace.

---

## 4. Usarlo su iPad e iPhone

- Apri il link in **Safari**, tocca **Condividi** (il quadrato con la freccia) e poi **Aggiungi alla schermata Home**: comparirà l'icona ∫ e il libro si aprirà come un'app.
- Il tema chiaro/scuro viene ricordato su ogni dispositivo.
- Le risposte ai quiz **non** vengono salvate: ricaricando la pagina il quiz riparte da capo. È voluto, così puoi rifarlo.
- Le anteprime dei richiami "§4.2" su iPad si aprono **toccando** il richiamo; tocca di nuovo, o tocca altrove, per chiuderle.

---

## 5. Cose da sapere

- **Il link è pubblico:** chiunque lo conosca può aprire il libro. Nessuno lo trova per caso se non lo condividi, ma non è protetto da password. Se vuoi renderlo privato, Cloudflare permette di mettere un accesso con verifica via email (servizio *Cloudflare Access*): chiedimelo e ti preparo i passaggi.
- **Motori di ricerca:** in teoria Google può indicizzarlo. Se non vuoi, dimmelo e aggiungo un file che glielo impedisce.
- **Costi:** zero. È un sito statico, senza server né database da mantenere.
- **Pages o Workers?** Per i progetti nuovi Cloudflare oggi consiglia "Workers", ma per un sito statico caricato a mano la strada più semplice resta Pages con il caricamento diretto, ed è pienamente supportata.
- **Stato dei contenuti in questa versione:** Parte 0, Parte 1 e Parte 2 complete. In Analisi 1 i capitoli 1-10 hanno avuto la revisione finale; i capitoli 11-15 sono completi ma in attesa dell'ultimo giro di revisione.

---

## 6. Se qualcosa non va

| Sintomo | Causa probabile | Cosa fare |
|---|---|---|
| La pagina si vede senza grafica, solo testo nero | È stato caricato un livello di cartelle sbagliato, oppure manca `assets` | Ricarica trascinando esattamente la cartella `sito`. |
| Il link dà "404" sulla home | `index.html` non sta in cima al caricamento | Come sopra: carica `sito`, oppure uno zip fatto con il contenuto di `sito`. |
| Le formule compaiono come testo con i `$` | La pagina non ha finito di caricare, oppure manca `assets/vendor/katex` | Ricarica la pagina; se resta così, ricarica il sito completo. |
| Su iPad vedi ancora la versione vecchia | Safari tiene in memoria la pagina | Chiudi la scheda e riaprila, oppure trascina giù la pagina per aggiornarla. |
| L'icona sulla schermata Home è uno screenshot invece della ∫ | Safari non ha ancora scaricato l'icona | Togli l'icona dalla Home, ricarica il sito e aggiungila di nuovo. |
