/* Vitrine dos plugins: clicar num plugin abre o tutorial de 10 s dele, o mesmo dos cartões
   (assets/tutoriais/<id>.mp4, gerado em remotion-crmo), com as abas do painel explicadas ao lado.
   O vídeo toca mudo e em loop; o botão do canto liga o som e cala os vídeos dos cartões.
   Com movimento reduzido, fica o pôster e o botão toca com som.
   Qualquer elemento com data-vitrine="<id>" abre a vitrine daquele plugin. */
(function () {
  "use strict";

  var BASE = new URL("assets/tutoriais/", document.currentScript.src).href;
  var calmo = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SOM = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/>' +
    '<path class="som-onda" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/><path class="som-mudo" d="m16 9.5 5 5m0-5-5 5"/></svg>';

  var PLUGINS = [
    { id: "ease", nome: "Magic Ease", cor: "#FF6316", bg: "#FF6316", st: "#FDF7E9", glifo: "g-curva", apps: "After Effects",
      resumo: "Curvas de velocidade num atalho, e mola nos keyframes.",
      telas: [
        { aba: "Curvas", texto: "Oito curvas prontas, uma em cada tecla de 1 a 8, e a sua curva com saída e chegada." },
        { aba: "Mola", texto: "Mola no segundo keyframe: elasticidade, frequência e amortecimento, com a balança desenhada." },
        { aba: "Atalho", texto: "Alt+E abre as curvas num popup em cima da timeline, sem sair do que está fazendo." }
      ] },
    { id: "motion", nome: "Magic Motion", cor: "#D0FE60", bg: "#D0FE60", st: "#1C1C1C", glifo: "g-raio", apps: "After Effects",
      resumo: "Entrada e saída de layers num clique, com escalonamento e loops.",
      telas: [
        { aba: "Animar", texto: "Dez animações de entrada e saída, de onde a layer vem e o ritmo entre elas." },
        { aba: "Chaves", texto: "Ferramentas de keyframe: curva, tempo, mover para o cursor, duplicar e inverter." },
        { aba: "Loop", texto: "Movimento sem fim por expressão: tremer, flutuar, girar, pulsar e piscar." }
      ] },
    { id: "type", nome: "Magic Text", cor: "#8F8AFF", bg: "#1C1C1C", st: "#8F8AFF", glifo: "g-texto", apps: "After Effects", escuro: true,
      resumo: "Animações de texto com prévia ao vivo no seu próprio texto.",
      telas: [
        { aba: "Animar", texto: "A prévia roda no seu texto. 22 famílias de entrada e saída, por letra, palavra ou linha." }
      ] },
    { id: "blocks", nome: "Magic Box", cor: "#6761FF", bg: "#FDF7E9", st: "#6761FF", glifo: "g-caixa", apps: "After Effects",
      resumo: "Caixas que crescem com o texto, botões, cartões e ícones vetoriais.",
      telas: [
        { aba: "Caixa", texto: "Sete estilos de caixa, as cores da marca e as medidas, tudo acompanhando o texto." },
        { aba: "Ícones", texto: "Ícones CRMO e milhares de ícones grátis, já convertidos em Shape Layer." },
        { aba: "Animar", texto: "Como a caixa aparece: crescer, abrir, surgir ou subir, com o ritmo entre elas." }
      ] },
    { id: "sfx", nome: "Magic SFX", cor: "#FF6316", bg: "#1C1C1C", st: "#FF6316", glifo: "g-onda", apps: "After Effects e Premiere", escuro: true,
      resumo: "Sua biblioteca de efeitos sonoros, com sound design automático.",
      telas: [
        { aba: "Biblioteca", texto: "Busca, filtro por tipo e duração e prévia de cada som antes de pôr no cursor." },
        { aba: "Automático", texto: "Lê as animações da comp e coloca som nos momentos certos, sozinho." },
        { aba: "Ajustes", texto: "As pastas da sua biblioteca, o volume, o histórico e os atalhos." }
      ] },
    { id: "legenda", nome: "Magic Caption", cor: "#6761FF", bg: "#6761FF", st: "#FDF7E9", glifo: "g-legenda", apps: "After Effects",
      resumo: "Legendas automáticas com 15 estilos animados e a palavra grande em destaque.",
      telas: [
        { aba: "Estilo", texto: "Estilos de Reels com uma palavra grande em destaque, prontos para aplicar." },
        { aba: "Simples", texto: "Os estilos limpos: clássico, três palavras ou uma palavra por vez." },
        { aba: "Animação", texto: "Quinze jeitos de cada palavra entrar, com a prévia no próprio cartão." },
        { aba: "Ajustes", texto: "Cor, posição, idioma da transcrição e SRT para importar e exportar." }
      ] }
  ];

  function e(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }

  var caixa = document.createElement("dialog");
  caixa.className = "vitrine";
  caixa.setAttribute("aria-labelledby", "vitrine-nome");
  document.body.appendChild(caixa);
  var atual = 0;

  function desenhar() {
    var p = PLUGINS[atual];
    caixa.style.setProperty("--cor", p.cor);
    caixa.innerHTML =
      '<div class="vitrine-in">' +
        '<button class="vitrine-fechar" type="button" aria-label="Fechar"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
        '<figure class="vitrine-video">' +
          '<video src="' + BASE + p.id + '.mp4" poster="' + BASE + p.id + '.webp" width="540" height="960" muted loop playsinline' +
            ' aria-label="Tutorial de 10 segundos do ' + e(p.nome) + '"></video>' +
          '<button class="video-som" type="button" aria-pressed="false" aria-label="Ouvir o tutorial do ' + e(p.nome) + '">' + SOM + "</button>" +
        "</figure>" +
        '<div class="vitrine-info">' +
          '<span class="app' + (p.escuro ? " escuro" : "") + '" style="--bg:' + p.bg + ";--st:" + p.st + '"><svg class="glifo"><use href="#' + p.glifo + '"/></svg></span>' +
          '<h2 class="titulo" id="vitrine-nome">' + e(p.nome) + "</h2>" +
          '<p class="sub">' + e(p.resumo) + "</p>" +
          // o que cada aba do painel faz, numa lista só
          '<ul class="checks vitrine-lista">' + p.telas.map(function (x) {
            return '<li><i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></i><span>' + e(x.texto) + "</span></li>";
          }).join("") + "</ul>" +
          '<span class="tag">' + e(p.apps) + "</span>" +
          '<div class="vitrine-pe">' +
            '<button type="button" class="vitrine-passo" data-passo="-1" aria-label="Plugin anterior"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button>' +
            '<span class="mono">' + (atual + 1) + " / " + PLUGINS.length + "</span>" +
            '<button type="button" class="vitrine-passo" data-passo="1" aria-label="Próximo plugin"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>' +
          "</div>" +
        "</div>" +
      "</div>";
    if (!calmo) { tocar(caixa.querySelector("video")); }
  }

  function tocar(v) {
    var pr = v.play();
    if (pr && pr.catch) { pr.catch(function () {}); }
  }
  // os vídeos dos cartões ficam atrás da vitrine: nunca dois sons ao mesmo tempo
  function calarCartoes() {
    document.querySelectorAll(".peca-video video").forEach(function (v) { v.muted = true; });
  }
  function som(b) {
    var v = caixa.querySelector("video"), nome = PLUGINS[atual].nome;
    if (v.muted) { calarCartoes(); v.muted = false; v.currentTime = 0; tocar(v); }
    else { v.muted = true; if (calmo) { v.pause(); } }
    b.setAttribute("aria-pressed", String(!v.muted));
    b.setAttribute("aria-label", (v.muted ? "Ouvir o tutorial do " : "Tirar o som do tutorial do ") + nome);
  }

  function abrir(id) {
    var i = PLUGINS.map(function (p) { return p.id; }).indexOf(id);
    if (i < 0) { return; }
    atual = i;
    calarCartoes();
    desenhar();
    if (!caixa.open) { caixa.showModal(); document.documentElement.classList.add("travado"); }
  }

  caixa.addEventListener("click", function (ev) {
    if (ev.target === caixa || ev.target.closest(".vitrine-fechar")) { caixa.close(); document.documentElement.classList.remove("travado"); return; }
    var s = ev.target.closest(".video-som");
    if (s) { som(s); return; }
    var passo = ev.target.closest("[data-passo]");
    if (passo) {
      atual = (atual + Number(passo.dataset.passo) + PLUGINS.length) % PLUGINS.length;
      desenhar(); caixa.querySelector('[data-passo="' + passo.dataset.passo + '"]').focus();
    }
  });
  caixa.addEventListener("keydown", function (ev) {
    if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
      atual = (atual + (ev.key === "ArrowRight" ? 1 : -1) + PLUGINS.length) % PLUGINS.length;
      desenhar(); caixa.querySelector(".vitrine-passo").focus();
    }
  });
  caixa.addEventListener("close", function () {
    document.documentElement.classList.remove("travado");
    var v = caixa.querySelector("video");
    if (v) { v.pause(); v.muted = true; }
  });

  document.addEventListener("click", function (ev) {
    var alvo = ev.target.closest("[data-vitrine]");
    if (alvo) { ev.preventDefault(); abrir(alvo.dataset.vitrine); }
  });
}());
