/* =========================================================================
   main.js — funzionalità globali condivise da ogni pagina:
   tema chiaro/scuro, menu mobile, rendering KaTeX, evidenziazione TOC,
   barra di avanzamento lettura, pulsante "mostra/nascondi tutte le soluzioni".
   ========================================================================= */
(function () {
  "use strict";

  /* Radice del sito ricavata da dove si trova questo file (assets/js/main.js):
     funziona sia online sia aprendo le pagine in locale. */
  var SITE_ROOT = new URL("../../", document.currentScript.src).href;

  /* Elenco capitoli per il menu a tendina (tenerlo allineato a index.html). */
  var CAPITOLI = [
    ["Parte 0 · Prerequisiti", "parte0-prerequisiti/", [
      ["01-insiemi-logica-numeri", "Insiemi, logica e numeri"],
      ["02-algebra-calcolo-letterale", "Algebra e calcolo letterale"],
      ["03-potenze-radicali-esponenziali", "Potenze, radicali ed esponenziali"],
      ["04-logaritmi", "Logaritmi"],
      ["05-equazioni", "Equazioni"],
      ["06-disequazioni", "Disequazioni"],
      ["07-geometria-analitica", "Geometria analitica"],
      ["08-trigonometria", "Trigonometria"],
      ["09-funzioni-elementari-grafici", "Funzioni elementari e grafici"]
    ]],
    ["Parte 1 · Analisi 1", "parte1-analisi1/", [
      ["01-numeri-reali-struttura", "Numeri reali e struttura d'ordine"],
      ["02-valore-assoluto-topologia", "Valore assoluto e topologia della retta"],
      ["03-funzioni", "Funzioni"],
      ["04-limiti", "Limiti di funzioni"],
      ["05-infinitesimi-infiniti", "Infinitesimi, infiniti e confronti"],
      ["06-continuita", "Continuità"],
      ["07-derivate", "Derivate"],
      ["08-teoremi-fondamentali", "Teoremi fondamentali del calcolo differenziale"],
      ["09-studio-di-funzione", "Studio completo di funzione"],
      ["10-taylor-mclaurin", "Sviluppi di Taylor e Mclaurin"],
      ["11-successioni", "Successioni numeriche"],
      ["12-serie-numeriche", "Serie numeriche"],
      ["13-integrali-indefiniti", "Integrali indefiniti"],
      ["14-integrali-definiti", "Integrali definiti"],
      ["15-applicazioni-integrali", "Applicazioni degli integrali"]
    ]],
    ["Parte 2 · Analisi 2", "parte2-analisi2/", [
      ["01-funzioni-piu-variabili", "Funzioni di più variabili"],
      ["02-limiti-continuita-piu-variabili", "Limiti e continuità in più variabili"],
      ["03-derivate-parziali", "Derivate parziali e differenziabilità"],
      ["04-gradiente", "Gradiente e derivata direzionale"],
      ["05-hessiano-massimi-minimi", "Hessiano, massimi e minimi liberi"],
      ["06-moltiplicatori-lagrange", "Moltiplicatori di Lagrange"],
      ["07-curve-superfici", "Curve e superfici parametriche"],
      ["08-integrali-doppi", "Integrali doppi"],
      ["09-integrali-tripli-cambi-variabile", "Integrali tripli e cambi di variabile"],
      ["10-integrali-curvilinei", "Integrali curvilinei"],
      ["11-integrali-superficie-campi-vettoriali", "Integrali di superficie e campi vettoriali"],
      ["12-teoremi-green-gauss-stokes", "Teoremi di Green, Gauss e Stokes"],
      ["13-equazioni-differenziali", "Equazioni differenziali ordinarie"],
      ["14-applicazioni-analisi2", "Applicazioni: modelli fisici ed economici"]
    ]]
  ];

  /* ---------- Menu a tendina "Vai al capitolo" nella barra in alto ---------- */
  function initChapterSelect() {
    var actions = document.querySelector(".navbar__actions");
    if (!actions) return;
    // Cloudflare può servire le pagine senza ".html": confronto i percorsi senza estensione.
    var here = location.pathname.replace(/\.html$/, "");

    var select = document.createElement("select");
    select.className = "chapter-select";
    select.setAttribute("aria-label", "Vai al capitolo");
    var placeholder = new Option("Vai al capitolo…", "", true, true);
    placeholder.disabled = true;
    select.add(placeholder);

    CAPITOLI.forEach(function (parte) {
      var group = document.createElement("optgroup");
      group.label = parte[0];
      parte[2].forEach(function (cap, i) {
        var url = SITE_ROOT + parte[1] + cap[0] + ".html";
        var current = new URL(url).pathname.replace(/\.html$/, "") === here;
        group.appendChild(new Option((i + 1) + ". " + cap[1], url, false, current));
      });
      select.appendChild(group);
    });

    select.addEventListener("change", function () { location.href = select.value; });
    // Tornando indietro col browser la pagina può riapparire con la scelta vecchia.
    var initial = select.selectedIndex;
    window.addEventListener("pageshow", function () { select.selectedIndex = initial; });

    actions.insertBefore(select, actions.firstChild);
  }

  /* ---------- Tema chiaro / scuro ---------- */
  function initTheme() {
    var saved = localStorage.getItem("analisi-theme");
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = saved || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);

    var toggles = document.querySelectorAll(".theme-toggle");
    toggles.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme");
        var next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("analisi-theme", next);
      });
    });
  }

  /* ---------- Menu mobile ---------- */
  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".navbar__links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open-mobile");
      if (open) {
        links.style.display = "flex";
        links.style.position = "absolute";
        links.style.top = "58px";
        links.style.left = "0";
        links.style.right = "0";
        links.style.background = "var(--color-bg-elevated)";
        links.style.flexDirection = "column";
        links.style.padding = "1rem 24px";
        links.style.borderBottom = "1px solid var(--color-border)";
        links.style.boxShadow = "var(--shadow-md)";
      } else {
        links.style.display = "";
      }
    });
  }

  /* ---------- KaTeX ---------- */
  function initKatex() {
    if (typeof renderMathInElement === "undefined") return;
    renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false }
      ],
      throwOnError: false
    });
  }

  /* ---------- Evidenziazione voce attiva nella sidebar del capitolo ---------- */
  function initTocHighlight() {
    var sections = document.querySelectorAll(".section[id]");
    var links = document.querySelectorAll(".chapter-sidebar nav a[href^='#']");
    if (!sections.length || !links.length) return;

    var map = {};
    links.forEach(function (l) { map[l.getAttribute("href").slice(1)] = l; });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = map[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("is-active"); });
          link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-15% 0px -70% 0px" });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------- Barra di avanzamento lettura ---------- */
  function initProgressBar() {
    var bar = document.createElement("div");
    bar.style.cssText = "position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,var(--color-primary),var(--color-accent));z-index:100;width:0%;transition:width .1s ease;";
    document.body.appendChild(bar);
    window.addEventListener("scroll", function () {
      var h = document.documentElement;
      var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      bar.style.width = (isFinite(scrolled) ? scrolled : 0) + "%";
    });
  }

  /* ---------- Mostra/nascondi tutte le soluzioni ---------- */
  function initMasterToggle() {
    var btn = document.getElementById("toggle-tutte-soluzioni");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var all = document.querySelectorAll("details.soluzione");
      var anyClosed = Array.prototype.some.call(all, function (d) { return !d.open; });
      all.forEach(function (d) { d.open = anyClosed; });
      btn.textContent = anyClosed ? "🙈 Nascondi tutte le soluzioni" : "👁 Mostra tutte le soluzioni";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initChapterSelect();
    initMobileNav();
    initKatex();
    initTocHighlight();
    initProgressBar();
    initMasterToggle();
  });
})();
