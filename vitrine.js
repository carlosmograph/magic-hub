/* Vitrine dos plugins: clicar num plugin abre a interface de verdade dele.
   As telas são capturas da prévia dos painéis (crmo-plugins, porta 4331), uma por aba,
   a 400px de largura — o mesmo HTML que roda no After. Não publicamos o painel em si:
   o código do plugin só chega pelo Hub, para quem tem acesso.
   Qualquer elemento com data-vitrine="<id>" abre a vitrine daquele plugin.
   Para trocar as telas: capture de novo e salve em assets/paineis/<id>-<n>.webp. */
(function () {
  "use strict";

  var BASE = new URL("assets/paineis/", document.currentScript.src).href;

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
  function tela(p, i) { return BASE + p.id + "-" + (i + 1) + ".webp"; }

  var caixa = document.createElement("dialog");
  caixa.className = "vitrine";
  caixa.setAttribute("aria-labelledby", "vitrine-nome");
  document.body.appendChild(caixa);
  var atual = 0, telaAtual = 0;

  function desenhar() {
    var p = PLUGINS[atual], t = p.telas[telaAtual];
    caixa.style.setProperty("--cor", p.cor);
    caixa.innerHTML =
      '<div class="vitrine-in">' +
        '<button class="vitrine-fechar" type="button" aria-label="Fechar"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
        '<figure class="moldura">' +
          '<div class="moldura-aba"><span>' + e(p.nome) + "</span><i></i></div>" +
          '<div class="moldura-tela" tabindex="0"><img src="' + tela(p, telaAtual) + '" width="400" height="900" alt="Interface do ' + e(p.nome) + ", aba " + e(t.aba) + '"></div>' +
        "</figure>" +
        '<div class="vitrine-info">' +
          '<span class="app' + (p.escuro ? " escuro" : "") + '" style="--bg:' + p.bg + ";--st:" + p.st + '"><svg class="glifo"><use href="#' + p.glifo + '"/></svg></span>' +
          '<h2 class="titulo" id="vitrine-nome">' + e(p.nome) + "</h2>" +
          '<p class="sub">' + e(p.resumo) + "</p>" +
          (p.telas.length > 1 ? '<div class="telas" role="group" aria-label="Abas do painel">' + p.telas.map(function (x, i) {
            return '<button type="button" data-tela="' + i + '" aria-pressed="' + (i === telaAtual) + '">' + e(x.aba) + "</button>";
          }).join("") + "</div>" : "") +
          '<p class="tela-texto" aria-live="polite">' + e(t.texto) + "</p>" +
          '<span class="tag">' + e(p.apps) + "</span>" +
          '<div class="vitrine-pe">' +
            '<button type="button" class="vitrine-passo" data-passo="-1" aria-label="Plugin anterior"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button>' +
            '<span class="mono">' + (atual + 1) + " / " + PLUGINS.length + "</span>" +
            '<button type="button" class="vitrine-passo" data-passo="1" aria-label="Próximo plugin"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>' +
          "</div>" +
        "</div>" +
      "</div>";
    // as outras abas já vêm carregando, para a troca não piscar
    p.telas.forEach(function (x, i) { if (i !== telaAtual) { new Image().src = tela(p, i); } });
  }

  function abrir(id) {
    var i = PLUGINS.map(function (p) { return p.id; }).indexOf(id);
    if (i < 0) { return; }
    atual = i; telaAtual = 0;
    desenhar();
    if (!caixa.open) { caixa.showModal(); document.documentElement.classList.add("travado"); }
  }

  caixa.addEventListener("click", function (ev) {
    if (ev.target === caixa || ev.target.closest(".vitrine-fechar")) { caixa.close(); document.documentElement.classList.remove("travado"); return; }
    var b = ev.target.closest("[data-tela]");
    if (b) { telaAtual = Number(b.dataset.tela); desenhar(); caixa.querySelector('[data-tela="' + telaAtual + '"]').focus(); return; }
    var passo = ev.target.closest("[data-passo]");
    if (passo) {
      atual = (atual + Number(passo.dataset.passo) + PLUGINS.length) % PLUGINS.length; telaAtual = 0;
      desenhar(); caixa.querySelector('[data-passo="' + passo.dataset.passo + '"]').focus();
    }
  });
  caixa.addEventListener("keydown", function (ev) {
    if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
      atual = (atual + (ev.key === "ArrowRight" ? 1 : -1) + PLUGINS.length) % PLUGINS.length; telaAtual = 0;
      desenhar(); caixa.querySelector(".vitrine-passo").focus();
    }
  });
  caixa.addEventListener("close", function () { document.documentElement.classList.remove("travado"); });

  document.addEventListener("click", function (ev) {
    var alvo = ev.target.closest("[data-vitrine]");
    if (alvo) { ev.preventDefault(); abrir(alvo.dataset.vitrine); }
  });
}());
