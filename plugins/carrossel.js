/* Carrossel dos plugins na página de download: o trilho rola sozinho de lado (scroll-snap,
   arrasta no celular); as setas andam um cartão e somem nas pontas. */
(function () {
  "use strict";
  var trilho = document.querySelector(".carrossel-trilho");
  if (!trilho) { return; }
  var ant = document.querySelector(".carrossel-seta.ant");
  var prox = document.querySelector(".carrossel-seta.prox");

  function passo() {
    var c = trilho.querySelector(".ficha");
    return c ? c.getBoundingClientRect().width + 20 : 320;
  }
  function setas() {
    ant.disabled = trilho.scrollLeft < 8;
    prox.disabled = trilho.scrollLeft + trilho.clientWidth > trilho.scrollWidth - 8;
  }
  ant.addEventListener("click", function () { trilho.scrollBy({ left: -passo(), behavior: "smooth" }); });
  prox.addEventListener("click", function () { trilho.scrollBy({ left: passo(), behavior: "smooth" }); });
  trilho.addEventListener("scroll", setas, { passive: true });
  trilho.addEventListener("keydown", function (ev) {
    if (ev.key === "ArrowRight") { prox.click(); ev.preventDefault(); }
    if (ev.key === "ArrowLeft") { ant.click(); ev.preventDefault(); }
  });
  window.addEventListener("resize", setas);
  setas();
}());
