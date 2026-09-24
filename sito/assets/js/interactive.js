/* =========================================================================
   interactive.js — motore dei quiz interattivi e dei tooltip del glossario.

   CONVENZIONI MARKUP QUIZ
   ------------------------------------------------------------------
   <div class="quiz-block" id="quiz-nomecapitolo">
     <div class="quiz-block__head">
       <h3>Quiz di autoverifica</h3>
       <span class="quiz-score" data-quiz-score>Punteggio: 0/0</span>
     </div>

     <!-- Scelta multipla -->
     <div class="quiz-question" data-type="mc">
       <p class="quiz-question__testo">1. Testo della domanda...</p>
       <div class="quiz-options">
         <button class="quiz-option" data-correct="false">Risposta A</button>
         <button class="quiz-option" data-correct="true">Risposta B</button>
       </div>
       <div class="quiz-feedback" data-feedback>Spiegazione mostrata dopo la risposta.</div>
     </div>

     <!-- Vero/Falso -->
     <div class="quiz-question" data-type="tf">
       <p class="quiz-question__testo">2. Affermazione...</p>
       <div class="quiz-options quiz-tf">
         <button class="quiz-option" data-correct="true">Vero</button>
         <button class="quiz-option" data-correct="false">Falso</button>
       </div>
       <div class="quiz-feedback" data-feedback>Spiegazione...</div>
     </div>

     <!-- Completamento -->
     <div class="quiz-question" data-type="fill" data-answer="risposta|sinonimo accettato">
       <p class="quiz-question__testo">3. Completa: ...</p>
       <div class="quiz-fill">
         <input type="text" placeholder="Scrivi qui la risposta">
         <button class="btn btn--sm btn--primary" data-verifica>Verifica</button>
       </div>
       <div class="quiz-feedback" data-feedback>Spiegazione...</div>
     </div>

     <!-- Domanda aperta (autovalutazione) -->
     <div class="quiz-question" data-type="open">
       <p class="quiz-question__testo">4. Spiega con parole tue...</p>
       <div class="quiz-open">
         <textarea placeholder="Scrivi la tua risposta..."></textarea>
         <button class="btn btn--sm btn--ghost" data-mostra-modello>Mostra risposta modello</button>
         <div class="quiz-feedback info" data-modello>Risposta modello nascosta qui dentro.</div>
       </div>
     </div>
   </div>

   CONVENZIONI GLOSSARIO
   ------------------------------------------------------------------
   <span class="glossario-term" data-term="limite">limite</span>
   richiede window.GLOSSARIO caricato da glossary-data.js
   ========================================================================= */
(function () {
  "use strict";

  function updateScore(block) {
    var scoreEl = block.querySelector("[data-quiz-score]");
    if (!scoreEl) return;
    var gradable = block.querySelectorAll(".quiz-question[data-type='mc'], .quiz-question[data-type='tf'], .quiz-question[data-type='fill']");
    var total = gradable.length;
    var correct = 0;
    gradable.forEach(function (q) { if (q.getAttribute("data-answered-correctly") === "true") correct++; });
    scoreEl.textContent = "Punteggio: " + correct + "/" + total;
  }

  function initMultipleChoiceAndTF() {
    document.querySelectorAll(".quiz-question[data-type='mc'], .quiz-question[data-type='tf']").forEach(function (question) {
      var buttons = question.querySelectorAll(".quiz-option");
      var feedback = question.querySelector("[data-feedback]");
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (question.getAttribute("data-locked") === "true") return;
          question.setAttribute("data-locked", "true");
          var isCorrect = btn.getAttribute("data-correct") === "true";
          buttons.forEach(function (b) {
            b.disabled = true;
            if (b.getAttribute("data-correct") === "true") b.classList.add("is-correct");
          });
          if (!isCorrect) btn.classList.add("is-incorrect");
          question.setAttribute("data-answered-correctly", isCorrect ? "true" : "false");
          if (feedback) {
            feedback.classList.add("is-visible");
            feedback.classList.add(isCorrect ? "ok" : "ko");
            feedback.innerHTML = (isCorrect ? "✅ Esatto! " : "❌ Non proprio. ") + feedback.innerHTML;
          }
          var block = question.closest(".quiz-block");
          if (block) updateScore(block);
        });
      });
    });
  }

  function normalize(str) {
    return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "").trim();
  }

  function initFillBlank() {
    document.querySelectorAll(".quiz-question[data-type='fill']").forEach(function (question) {
      var btn = question.querySelector("[data-verifica]");
      var input = question.querySelector("input[type='text']");
      var feedback = question.querySelector("[data-feedback]");
      if (!btn || !input) return;
      var accepted = (question.getAttribute("data-answer") || "").split("|").map(normalize).filter(Boolean);
      var check = function () {
        if (question.getAttribute("data-locked") === "true") return;
        var val = normalize(input.value);
        var isCorrect = accepted.indexOf(val) !== -1;
        question.setAttribute("data-locked", "true");
        question.setAttribute("data-answered-correctly", isCorrect ? "true" : "false");
        input.disabled = true;
        btn.disabled = true;
        input.style.borderColor = isCorrect ? "var(--color-success)" : "var(--color-danger)";
        if (feedback) {
          feedback.classList.add("is-visible", isCorrect ? "ok" : "ko");
          feedback.innerHTML = (isCorrect ? "✅ Esatto! " : "❌ Risposta corretta: <strong>" + question.getAttribute("data-answer").split("|")[0] + "</strong>. ") + feedback.innerHTML;
        }
        var block = question.closest(".quiz-block");
        if (block) updateScore(block);
      };
      btn.addEventListener("click", check);
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") check(); });
    });
  }

  function initOpenEnded() {
    document.querySelectorAll(".quiz-question[data-type='open']").forEach(function (question) {
      var btn = question.querySelector("[data-mostra-modello]");
      var modello = question.querySelector("[data-modello]");
      if (!btn || !modello) return;
      btn.addEventListener("click", function () {
        var visible = modello.classList.toggle("is-visible");
        btn.textContent = visible ? "Nascondi risposta modello" : "Mostra risposta modello";
      });
    });
  }

  function initGlossaryTooltips() {
    var terms = document.querySelectorAll(".glossario-term[data-term]");
    if (!terms.length) return;
    var dict = window.GLOSSARIO || {};
    var openPopover = null;

    terms.forEach(function (span) {
      span.addEventListener("click", function (e) {
        e.stopPropagation();
        if (openPopover) { openPopover.remove(); openPopover = null; }
        var key = span.getAttribute("data-term");
        var entry = dict[key];
        var pop = document.createElement("span");
        pop.className = "glossario-popover is-visible";
        if (entry) {
          pop.innerHTML = "<strong>" + entry.term + ".</strong> " + entry.def +
            "<br><a href='" + (span.getAttribute("data-glossario-href") || "../glossario.html") + "#" + key + "' style='color:var(--color-secondary)'>Vedi nel glossario →</a>";
        } else {
          pop.textContent = "Voce di glossario non trovata.";
        }
        span.style.position = "relative";
        span.appendChild(pop);
        openPopover = pop;
      });
    });

    document.addEventListener("click", function () {
      if (openPopover) { openPopover.remove(); openPopover = null; }
    });
  }

  /* ---------- Richiami a sezioni: <span class="richiamo" data-sec="4.2">§4.2</span>
     Al passaggio del mouse (o al tocco) mostra titolo + primo paragrafo/formula della sezione citata. ---------- */
  function initRichiami(root) {
    root = root || document;
    var refs = root.querySelectorAll(".richiamo[data-sec]");
    if (!refs.length) return;
    var headings = Array.prototype.slice.call(root.querySelectorAll("h2, h3, h4"));
    function findHeading(sec) {
      for (var i = 0; i < headings.length; i++) {
        var t = headings[i].textContent.replace(/\s+/g, " ").trim();
        if (t === sec || t.indexOf(sec + " ") === 0) return headings[i];
      }
      return null;
    }
    function buildPreview(h) {
      var box = document.createElement("span");
      box.className = "richiamo-popover";
      var title = document.createElement("h5");
      title.textContent = h.textContent.replace(/\s+/g, " ").trim();
      box.appendChild(title);
      var el = h.nextElementSibling, taken = 0;
      while (el && taken < 2 && !/^H[1-6]$/.test(el.tagName)) {
        var c = el.classList;
        if (el.tagName === "P" || c.contains("formula-block") || c.contains("box-teorema")) {
          box.appendChild(el.cloneNode(true)); taken++;
        }
        el = el.nextElementSibling;
      }
      if (h.id) {
        var a = document.createElement("a");
        a.href = "#" + h.id; a.className = "vai"; a.textContent = "Vai alla sezione →";
        box.appendChild(a);
      }
      return box;
    }
    var open = null;
    function close() { if (open) { open.remove(); open = null; } }
    refs.forEach(function (span) {
      var h = findHeading(span.getAttribute("data-sec"));
      if (!h) { span.classList.remove("richiamo"); return; }
      function show() {
        close();
        open = buildPreview(h);
        if (span.getBoundingClientRect().left > window.innerWidth / 2) open.classList.add("is-right");
        span.appendChild(open);
      }
      span.addEventListener("mouseenter", show);
      span.addEventListener("mouseleave", function () { setTimeout(function () { if (open && !span.matches(":hover")) close(); }, 200); });
      span.addEventListener("click", function (e) {
        if (e.target.closest && e.target.closest("a.vai")) { close(); return; }
        e.stopPropagation(); e.preventDefault();
        if (open) close(); else show();
      });
    });
    document.addEventListener("click", close);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMultipleChoiceAndTF();
    initFillBlank();
    initOpenEnded();
    initGlossaryTooltips();
    initRichiami();
    document.querySelectorAll(".quiz-block").forEach(updateScore);
  });
})();
