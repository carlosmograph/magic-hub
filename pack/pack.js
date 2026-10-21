/* Pack de arquivos: a biblioteca (pastas e programas) e o "o que você vai editar".
   O conteúdo ainda não existe: os itens abaixo são as categorias do Magic Pack
   (magic-pack/index.html) com status "breve". Para publicar um item, troque
   status por "ok" e ponha o link. Sem JavaScript a página mostra o aviso do <noscript>. */
(function () {
  "use strict";

  // cor = o que a pasta é; a mesma cor pinta a capa dos itens dela
  var PASTAS = [
    { id: "texturas", nome: "Texturas e overlays", cor: "#FF6316", icone: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 15l5-5 4 4 3-3 4 4"/>' },
    { id: "transicoes", nome: "Transições", cor: "#6761FF", icone: '<rect x="3" y="6" width="11" height="12" rx="2.5"/><path d="M10 6h8.5A2.5 2.5 0 0 1 21 8.5v7a2.5 2.5 0 0 1-2.5 2.5H10"/>' },
    { id: "sons", nome: "Efeitos sonoros", cor: "#D0FE60", icone: '<path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 10.5v3"/>' },
    { id: "presets", nome: "Plugins e presets", cor: "#FDF7E9", icone: '<path d="m12 3.5 8.5 4.3L12 12 3.5 7.8z"/><path d="m3.5 12.2 8.5 4.2 8.5-4.2M3.5 16.4 12 20.6l8.5-4.2"/>' }
  ];
  var PROGRAMAS = [
    { id: "pr", nome: "Premiere", sigla: "Pr" },
    { id: "ae", nome: "After Effects", sigla: "Ae" },
    { id: "qualquer", nome: "Qualquer editor", sigla: "+" }
  ];
  var USOS = [
    { id: "reels", nome: "Reels e Shorts", resumo: "Corte rápido, som em cada movimento", icone: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 17.5h2"/>' },
    { id: "youtube", nome: "YouTube", resumo: "Vídeo longo que segura até o fim", icone: '<rect x="3" y="5" width="18" height="14" rx="3.5"/><path d="M10.2 9.3v5.4l4.6-2.7z"/>' },
    { id: "marca", nome: "Vinheta e marca", resumo: "Abertura, logo e identidade", icone: '<path d="M12 3l2.6 5.6L20.5 9l-4.3 4.1 1 5.9L12 16.3 6.8 19l1-5.9L3.5 9l5.9-.4z"/>' },
    { id: "clipe", nome: "Clipe e cinema", resumo: "Textura de filme e luz", icone: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.5"/><path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4"/>' }
  ];

  // SUBSTITUIR: os itens reais do pack (nome, pasta, programas, usos, status, link)
  var ITENS = [
    { nome: "Grão de filme", pasta: "texturas", programas: ["qualquer"], usos: ["clipe", "marca"] },
    { nome: "Papel e poeira", pasta: "texturas", programas: ["qualquer"], usos: ["clipe", "reels"] },
    { nome: "Vazamento de luz", pasta: "texturas", programas: ["qualquer"], usos: ["clipe", "youtube"] },
    { nome: "Halftone", pasta: "texturas", programas: ["qualquer"], usos: ["marca", "reels"] },
    { nome: "Ruído de VHS", pasta: "texturas", programas: ["qualquer"], usos: ["clipe", "reels"] },
    { nome: "Whip pan", pasta: "transicoes", programas: ["pr", "ae"], usos: ["reels", "youtube"] },
    { nome: "Zoom", pasta: "transicoes", programas: ["pr", "ae"], usos: ["reels", "youtube"] },
    { nome: "Glitch", pasta: "transicoes", programas: ["pr", "ae"], usos: ["marca", "reels"] },
    { nome: "Distorção", pasta: "transicoes", programas: ["pr", "ae"], usos: ["clipe", "marca"] },
    { nome: "Cortes de luz", pasta: "transicoes", programas: ["pr", "ae"], usos: ["clipe", "youtube"] },
    { nome: "Risers", pasta: "sons", programas: ["qualquer"], usos: ["marca", "youtube"] },
    { nome: "Impactos", pasta: "sons", programas: ["qualquer"], usos: ["reels", "marca"] },
    { nome: "Swooshes", pasta: "sons", programas: ["qualquer"], usos: ["reels", "youtube"] },
    { nome: "Cliques de interface", pasta: "sons", programas: ["qualquer"], usos: ["youtube", "reels"] },
    { nome: "Ambientes", pasta: "sons", programas: ["qualquer"], usos: ["youtube", "clipe"] },
    { nome: "Seleção de plugins", pasta: "presets", programas: ["pr", "ae"], usos: ["youtube", "marca"] },
    { nome: "Seleção de presets", pasta: "presets", programas: ["pr", "ae"], usos: ["reels", "clipe"] }
  ];

  function e(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function svg(corpo) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + corpo + "</svg>"; }
  function pasta(id) { return PASTAS.filter(function (p) { return p.id === id; })[0]; }
  function programasDe(item) {
    return item.programas.map(function (id) { return PROGRAMAS.filter(function (p) { return p.id === id; })[0].nome; }).join(" · ");
  }

  function capa(item) {
    var p = pasta(item.pasta);
    var pronto = item.status === "ok" && item.link;
    var dentro = '<div class="capa" style="--cor:' + p.cor + '"><b>' + e(item.nome) + "</b>" +
      (pronto ? "" : '<span class="fita fita-quieta">Em breve</span>') + "</div>" +
      "<h4>" + e(item.nome) + "</h4><span>" + e(p.nome) + " · " + e(programasDe(item)) + "</span>";
    return pronto ? '<a class="pacote" href="' + e(item.link) + '">' + dentro + "</a>" : '<div class="pacote">' + dentro + "</div>";
  }

  // ---------------------------------------------------------------- biblioteca
  var filtro = { tipo: "todos", valor: null };
  var lado = document.getElementById("pastas");
  var estante = document.getElementById("estante");
  var tituloEstante = document.getElementById("titulo-estante");
  var contagem = document.getElementById("contagem");

  function botao(tipo, valor, rotulo, marca, n) {
    var ativo = filtro.tipo === tipo && filtro.valor === valor;
    return '<button class="filtro" type="button" data-tipo="' + tipo + '" data-valor="' + (valor || "") + '" aria-pressed="' + ativo + '">' +
      marca + "<span>" + e(rotulo) + "</span><em>" + n + "</em></button>";
  }

  function desenharLado() {
    var html = '<span class="mono">Pastas</span>' +
      botao("todos", null, "Tudo", svg('<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>'), ITENS.length);
    PASTAS.forEach(function (p) {
      html += botao("pasta", p.id, p.nome, svg(p.icone), ITENS.filter(function (i) { return i.pasta === p.id; }).length);
    });
    html += '<hr><span class="mono">Programas</span>';
    PROGRAMAS.forEach(function (p) {
      html += botao("programa", p.id, p.nome, '<span class="prog" style="--cor:#FDF7E9">' + p.sigla + "</span>",
        ITENS.filter(function (i) { return i.programas.indexOf(p.id) >= 0; }).length);
    });
    lado.innerHTML = html;
  }

  function desenharEstante() {
    var lista = ITENS.filter(function (i) {
      if (filtro.tipo === "pasta") { return i.pasta === filtro.valor; }
      if (filtro.tipo === "programa") { return i.programas.indexOf(filtro.valor) >= 0; }
      return true;
    });
    var nome = filtro.tipo === "pasta" ? pasta(filtro.valor).nome
      : filtro.tipo === "programa" ? PROGRAMAS.filter(function (p) { return p.id === filtro.valor; })[0].nome : "Tudo";
    tituloEstante.textContent = nome;
    contagem.textContent = lista.length + (lista.length === 1 ? " item" : " itens");
    estante.innerHTML = lista.length ? lista.map(capa).join("") : '<p class="vazio">Nada aqui ainda.</p>';
  }

  lado.addEventListener("click", function (ev) {
    var b = ev.target.closest(".filtro");
    if (!b) { return; }
    filtro = { tipo: b.dataset.tipo, valor: b.dataset.valor || null };
    desenharLado();
    desenharEstante();
  });

  // ---------------------------------------------------------------- o que você vai editar
  var usos = document.getElementById("usos");
  var recomenda = document.getElementById("recomenda");
  var usoAtual = USOS[0].id;

  function desenharUsos() {
    usos.innerHTML = USOS.map(function (u) {
      return '<button class="uso" type="button" data-uso="' + u.id + '" aria-pressed="' + (u.id === usoAtual) + '"><i>' + svg(u.icone) +
        "</i><span><b>" + e(u.nome) + "</b><span>" + e(u.resumo) + "</span></span></button>";
    }).join("");
    var u = USOS.filter(function (x) { return x.id === usoAtual; })[0];
    var lista = ITENS.filter(function (i) { return i.usos.indexOf(usoAtual) >= 0; });
    recomenda.innerHTML = '<div class="estante-topo"><h3>' + e(u.nome) + '</h3><span class="mono">' + lista.length + " itens</span></div>" +
      '<div class="estante">' + lista.map(capa).join("") + "</div>";
  }

  usos.addEventListener("click", function (ev) {
    var b = ev.target.closest(".uso");
    if (!b) { return; }
    usoAtual = b.dataset.uso;
    desenharUsos();
  });

  desenharLado();
  desenharEstante();
  desenharUsos();
}());
