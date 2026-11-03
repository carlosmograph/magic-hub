/* Cartões dos plugins: o tutorial de 10 s de cada um (gerado em remotion-crmo) toca mudo e em loop
   enquanto o cartão está na tela, e para quando ele sai. O botão do canto liga o som daquele vídeo,
   do começo, e cala os outros. Com movimento reduzido nada toca sozinho: fica o pôster, e o botão
   toca o vídeo com som. Os vídeos só baixam quando chegam perto da tela (preload="none"). */
(function () {
  "use strict";
  var videos = document.querySelectorAll(".peca-video video");
  if (!videos.length) { return; }
  var calmo = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function tocar(v) {
    var p = v.play();
    if (p && p.catch) { p.catch(function () {}); }
  }
  function marcar(v) {
    var b = v.parentNode.querySelector(".video-som");
    var nome = v.getAttribute("aria-label").replace("Tutorial de 10 segundos do ", "");
    b.setAttribute("aria-pressed", String(!v.muted));
    b.setAttribute("aria-label", (v.muted ? "Ouvir o tutorial do " : "Tirar o som do tutorial do ") + nome);
  }
  function calar(v) {
    v.muted = true;
    if (calmo) { v.pause(); }
    marcar(v);
  }

  if (!calmo && window.IntersectionObserver) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { tocar(e.target); } else { e.target.pause(); if (!e.target.muted) { calar(e.target); } }
      });
    }, { rootMargin: "120px 0px" });
    videos.forEach(function (v) { io.observe(v); });
  }

  videos.forEach(function (v) {
    // a vitrine cala os cartões quando liga o som dela: o botão acompanha
    v.addEventListener("volumechange", function () { marcar(v); });
    v.parentNode.querySelector(".video-som").addEventListener("click", function () {
      if (!v.muted) { calar(v); return; }
      videos.forEach(function (outro) { if (outro !== v && !outro.muted) { calar(outro); } });
      v.muted = false;
      v.currentTime = 0;
      tocar(v);
      marcar(v);
    });
  });
}());
