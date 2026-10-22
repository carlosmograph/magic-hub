/* Início: as abas "para o seu tipo de vídeo" escolhem o cartão em destaque.
   Clicar no cartão também escolhe; clicar num ícone de plugin abre a vitrine. */
(function () {
  "use strict";
  var abas = document.querySelectorAll(".segmentos [data-perfil]");
  var cartoes = document.querySelectorAll(".perfil");
  if (!abas.length) { return; }

  function escolher(id) {
    abas.forEach(function (a) { a.setAttribute("aria-selected", String(a.dataset.perfil === id)); });
    cartoes.forEach(function (c) { c.classList.toggle("escolhido", c.dataset.perfil === id); });
  }

  abas.forEach(function (a) { a.addEventListener("click", function () { escolher(a.dataset.perfil); }); });
  cartoes.forEach(function (c) {
    c.addEventListener("click", function (ev) { if (!ev.target.closest("[data-vitrine]")) { escolher(c.dataset.perfil); } });
  });
  escolher("reels");
}());

/* Início: "Como instalar". As abas Windows/Mac trocam o que muda entre os dois sistemas
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
