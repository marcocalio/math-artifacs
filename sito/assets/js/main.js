/* =========================================================================
   main.js — funzionalità globali condivise da ogni pagina:
   tema chiaro/scuro, menu mobile, rendering KaTeX, evidenziazione TOC,
   barra di avanzamento lettura, pulsante "mostra/nascondi tutte le soluzioni".
   ========================================================================= */
(function () {
  "use strict";

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
    initMobileNav();
    initKatex();
    initTocHighlight();
    initProgressBar();
    initMasterToggle();
  });
})();
