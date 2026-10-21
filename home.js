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
