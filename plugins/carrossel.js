/* Carrossel dos plugins na página de download: infinito e sempre centralizado.
   Os 6 cartões ganham uma cópia antes e outra depois (3 voltas no trilho). Quando o cartão do meio
   para numa cópia, o trilho pula, sem animação, para o mesmo cartão da volta do meio — por isso dá
   para ir para a esquerda ou para a direita sem fim. O scroll-snap assenta no cartão mais perto do
   centro, que fica em destaque (.no-centro). Abre com o Magic Caption no centro. */
(function () {
  "use strict";
  var trilho = document.querySelector(".carrossel-trilho");
  if (!trilho) { return; }
  var ant = document.querySelector(".carrossel-seta.ant");
  var prox = document.querySelector(".carrossel-seta.prox");
  var originais = Array.prototype.slice.call(trilho.querySelectorAll(".carta"));
  var n = originais.length;
  if (!n) { return; }

  // cópias só para o olho: leitor de tela e Tab passam pelos 6 de verdade
  function copia(c) {
    var k = c.cloneNode(true);
    k.setAttribute("aria-hidden", "true");
    k.setAttribute("tabindex", "-1");
    k.classList.add("copia");
    return k;
  }
  originais.slice().reverse().forEach(function (c) { trilho.insertBefore(copia(c), trilho.firstChild); });
  originais.forEach(function (c) { trilho.appendChild(copia(c)); });
  var cartas = Array.prototype.slice.call(trilho.querySelectorAll(".carta")); // 3n, a volta do meio é n..2n-1

  function centroDe(c) { return c.offsetLeft + c.offsetWidth / 2; }
  function posicaoDe(i) { return centroDe(cartas[i]) - trilho.clientWidth / 2; }
  function doMeio() {
    var meio = trilho.scrollLeft + trilho.clientWidth / 2, melhor = 0, dist = Infinity;
    cartas.forEach(function (c, i) {
      var d = Math.abs(centroDe(c) - meio);
      if (d < dist) { dist = d; melhor = i; }
    });
    return melhor;
  }
  function levar(i, suave) { trilho.scrollTo({ left: posicaoDe(i), behavior: suave ? "smooth" : "auto" }); }
  function pintar() {
    var i = doMeio();
    cartas.forEach(function (c, j) { c.classList.toggle("no-centro", j % n === i % n && j === i); });
  }
  // parou numa cópia: pula para o mesmo cartão da volta do meio, mantendo o desvio que houver
  function recentrar() {
    var i = doMeio();
    if (i >= n && i < 2 * n) { return; }
    var desvio = trilho.scrollLeft - posicaoDe(i), alvo = n + (i % n);
    var snap = trilho.style.scrollSnapType;
    trilho.style.scrollSnapType = "none"; // sem snap no pulo, senão o navegador anima de volta
    trilho.scrollLeft = posicaoDe(alvo) + desvio;
    trilho.style.scrollSnapType = snap;
    pintar();
  }

  var parado = null;
  trilho.addEventListener("scroll", function () {
    pintar();
    clearTimeout(parado);
    parado = setTimeout(recentrar, 140);
  }, { passive: true });

  ant.addEventListener("click", function () { recentrar(); levar(doMeio() - 1, true); });
  prox.addEventListener("click", function () { recentrar(); levar(doMeio() + 1, true); });
  trilho.addEventListener("keydown", function (ev) {
    if (ev.key === "ArrowRight") { prox.click(); ev.preventDefault(); }
    if (ev.key === "ArrowLeft") { ant.click(); ev.preventDefault(); }
  });
  // ao mudar a largura, o cartão que estava no meio continua no meio
  window.addEventListener("resize", function () { levar(n + (doMeio() % n), false); pintar(); });

  var inicial = originais.findIndex(function (c) { return c.getAttribute("data-vitrine") === "legenda"; });
  levar(n + (inicial < 0 ? Math.floor(n / 2) : inicial), false);
  pintar();
}());
