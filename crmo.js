/* ============================================================
   CRMO — comportamentos do design system
   Um arquivo, sem dependência. Tudo é melhoria progressiva: se o JS não
   rodar, a página continua legível e nada some.

     <script src="./crmo.js" defer></script>
   ============================================================ */
(function () {
  "use strict";
  var reduz = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- nav ganha fundo depois do topo ---
     Marque a barra com data-nav. Ela recebe a classe "colada". */
  var nav = document.querySelector("[data-nav]");
  if (nav) {
    var aoRolar = function () { nav.classList.toggle("colada", window.scrollY > 12); };
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
  }

  /* --- entrada por scroll ---
     Marque os elementos com data-reveal. A classe reveal-io só entra no
     <html> se o observador existir, então sem JS nada fica invisível. */
  var alvos = document.querySelectorAll("[data-reveal]");
  if (window.IntersectionObserver && alvos.length) {
    document.documentElement.classList.add("reveal-io");
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("dentro");
        contar(e.target);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: .1 });
    alvos.forEach(function (el) { io.observe(el); });
    /* rede de segurança: se algo falhar, o conteúdo aparece assim mesmo */
    setTimeout(function () {
      alvos.forEach(function (el) { el.classList.add("dentro"); });
    }, 2500);
  }

  /* --- números sobem até o valor final ---
     <b data-conta="180">180</b> */
  function contar(raiz) {
    var alvo = raiz.querySelector ? raiz.querySelector("[data-conta]") : null;
    if (!alvo || alvo.dataset.pronto) return;
    alvo.dataset.pronto = "1";
    var fim = parseInt(alvo.dataset.conta, 10);
    if (!fim || reduz) { alvo.textContent = fim || alvo.textContent; return; }
    var inicio = performance.now(), dur = 1100;
    (function passo(agora) {
      var t = Math.min((agora - inicio) / dur, 1);
      alvo.textContent = Math.round(fim * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(passo);
    })(inicio);
  }

  /* --- inclinação 3D ---
     <div class="palco"><div class="inclinavel">…</div></div>
     Só com ponteiro fino: no toque não existe hover e o elemento ficaria
     preso na última posição tocada. */
  if (!reduz && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".palco").forEach(function (palco) {
      var alvo = palco.querySelector(".inclinavel");
      if (!alvo) return;
      var quadro = null, girX = 0, girY = 0;

      palco.addEventListener("pointermove", function (ev) {
        var r = alvo.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width;
        var y = (ev.clientY - r.top) / r.height;
        alvo.style.setProperty("--px", (x * 100).toFixed(1) + "%");
        alvo.style.setProperty("--py", (y * 100).toFixed(1) + "%");
        girY = (x - .5) * 15;   /* esquerda/direita */
        girX = (.5 - y) * 11;   /* cima/baixo */
        alvo.classList.add("inclinando");
        if (!quadro) quadro = requestAnimationFrame(aplicar);
      });

      palco.addEventListener("pointerleave", function () {
        alvo.classList.remove("inclinando");
        alvo.style.transform = "";
      });

      function aplicar() {
        quadro = null;
        alvo.style.transform = "rotateX(" + girX.toFixed(2) + "deg) rotateY(" +
          girY.toFixed(2) + "deg) translateZ(16px)";
      }
    });
  }

  /* --- imagem com reserva ---
     <img data-reserva="#id-do-fallback"> — se a imagem falhar, some e o
     elemento apontado aparece no lugar. */
  document.querySelectorAll("img[data-reserva]").forEach(function (img) {
    var mostrar = function () {
      img.hidden = true;
      var r = document.querySelector(img.dataset.reserva);
      if (r) r.hidden = false;
    };
    img.addEventListener("error", mostrar);
    if (img.complete && img.naturalWidth === 0) mostrar();
  });
})();
