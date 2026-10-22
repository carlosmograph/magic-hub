/* "Como instalar" (Início e Plugins). As abas Windows/Mac trocam o que muda entre os dois sistemas
   (no Mac já abre na aba Mac); cada passo mostra a sua tela ao lado. No celular a tela
   fica em cima da lista e sobe até ela quando a pessoa escolhe um passo. */
(function () {
  "use strict";
  var sec = document.getElementById("instalar");
  if (!sec) { return; }
  var passos = sec.querySelectorAll(".passo-t");
  var telas = sec.querySelectorAll(".tela-passo");
  var abas = sec.querySelectorAll(".so-abas [data-so]");
  var tela = sec.querySelector(".tutorial-tela");

  function mostrar(n) {
    passos.forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.passo === n)); });
    telas.forEach(function (f) { f.hidden = f.dataset.tela !== n; });
  }
  function sistema(s) {
    sec.dataset.so = s;
    abas.forEach(function (a) { a.setAttribute("aria-selected", String(a.dataset.so === s)); });
  }

  passos.forEach(function (b) {
    b.addEventListener("click", function () {
      mostrar(b.dataset.passo);
      if (window.matchMedia("(max-width: 899px)").matches) {
        var r = tela.getBoundingClientRect();
        if (r.top < 70 || r.bottom > window.innerHeight) { tela.scrollIntoView({ behavior: "smooth", block: "start" }); }
      }
    });
  });
  abas.forEach(function (a) { a.addEventListener("click", function () { sistema(a.dataset.so); }); });
  if (/Mac/i.test(navigator.platform || navigator.userAgent || "")) { sistema("mac"); }
}());
