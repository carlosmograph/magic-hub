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

  // SUBSTITUIR: os itens reais do pack (nome, tags para a busca, pasta, programas, usos, status, link).
  // foto = a miniatura em assets/pack/<foto>.webp (640×400); sem foto, a capa fica com o nome sobre a cor da pasta
  var ITENS = [
    { nome: "Grão de filme", link: "https://drive.google.com/drive/folders/1VkqCtqNIktrAunutQn6yB_pbfcanOGjf", foto: "grao-de-filme", tags: "filme analogico noise ruido cinema", pasta: "texturas", programas: ["qualquer"], usos: ["clipe", "marca"] },
    { nome: "Papel e poeira", link: "https://drive.google.com/drive/folders/16Q08mhq0s-3PdCpojEQO6JLDHhTj8hOv", foto: "papel-e-poeira", tags: "papel poeira sujeira textura vintage", pasta: "texturas", programas: ["qualquer"], usos: ["clipe", "reels"] },
    { nome: "Vazamento de luz", link: "https://drive.google.com/drive/folders/1e87f4gPX-xm_W2lkftM6PfsQNAEXQU4O", foto: "vazamento-de-luz", tags: "luz light leak brilho flare", pasta: "texturas", programas: ["qualquer"], usos: ["clipe", "youtube"] },
    { nome: "Halftone", link: "https://drive.google.com/drive/folders/1H97-7i9uj5whgzaFhQM2ykHyRgQGQNAZ", foto: "halftone", tags: "pontilhado retro quadrinho print", pasta: "texturas", programas: ["qualquer"], usos: ["marca", "reels"] },
    { nome: "Ruído de VHS", link: "https://drive.google.com/drive/folders/1ntClLy9h1Rj9Z7x8KFEhHpAygmtH7Tdj", foto: "ruido-de-vhs", tags: "vhs fita retro glitch analogico", pasta: "texturas", programas: ["qualquer"], usos: ["clipe", "reels"] },
    { nome: "Whip pan", link: "https://drive.google.com/drive/folders/1O3PzjAnIE7Ymron1RqgyqABTLuxksZPn", foto: "whip-pan", tags: "chicote movimento rapido corte", pasta: "transicoes", programas: ["pr", "ae"], usos: ["reels", "youtube"] },
    { nome: "Zoom", link: "https://drive.google.com/drive/folders/1Ie0F0GeJCoSZjMhM_ukoyKCN6fjLrb9-", foto: "zoom", tags: "zoom aproximar corte", pasta: "transicoes", programas: ["pr", "ae"], usos: ["reels", "youtube"] },
    { nome: "Glitch", link: "https://drive.google.com/drive/folders/1lPirTHixYWYXcLBOgha0cypHWTMjmpUE", foto: "glitch", tags: "glitch erro digital falha", pasta: "transicoes", programas: ["pr", "ae"], usos: ["marca", "reels"] },
    { nome: "Distorção", link: "https://drive.google.com/drive/folders/1EIp_aVwDFw9y4WwT9mIWFdua0kZRzIWn", foto: "distorcao", tags: "distorcer warp onda", pasta: "transicoes", programas: ["pr", "ae"], usos: ["clipe", "marca"] },
    { nome: "Cortes de luz", link: "https://drive.google.com/drive/folders/1CfgweBqyGnGC33yOOZaT9xhPUaZgz7wK", foto: "cortes-de-luz", tags: "luz flash brilho corte", pasta: "transicoes", programas: ["pr", "ae"], usos: ["clipe", "youtube"] },
    { nome: "Risers", link: "https://drive.google.com/drive/folders/1SD__xYfpTpXyGa-fQ9CasUVasbVx61SZ", foto: "risers", tags: "riser subida tensao som", pasta: "sons", programas: ["qualquer"], usos: ["marca", "youtube"] },
    { nome: "Impactos", link: "https://drive.google.com/drive/folders/1a8D1WnqpbcAWlp3yh1HPqXTHs8CN4uUx", foto: "impactos", tags: "impacto hit pancada boom som", pasta: "sons", programas: ["qualquer"], usos: ["reels", "marca"] },
    { nome: "Swooshes", link: "https://drive.google.com/drive/folders/1pTqyMo-eBK-AzUPykPVnTVnFk90EGTe5", foto: "swooshes", tags: "swoosh whoosh passagem vento som", pasta: "sons", programas: ["qualquer"], usos: ["reels", "youtube"] },
    { nome: "Cliques de interface", link: "https://drive.google.com/drive/folders/18m8y2aMk-mgI62Km5MEJwIVs9ty06ulr", foto: "cliques-de-interface", tags: "clique ui botao interface som", pasta: "sons", programas: ["qualquer"], usos: ["youtube", "reels"] },
    { nome: "Ambientes", link: "https://drive.google.com/drive/folders/1_JRSWJO_mmxPNY8XapMme5-KeRAWcA3f", foto: "ambientes", tags: "ambiente fundo atmosfera som", pasta: "sons", programas: ["qualquer"], usos: ["youtube", "clipe"] },
    { nome: "Indicações de plugins", link: "https://drive.google.com/drive/folders/16HRJvdKIxTAjXsooBZkH-KfJChgBLv8w", foto: "indicacoes-de-plugins", tags: "plugin extensao indicacao", pasta: "presets", programas: ["pr", "ae"], usos: ["youtube", "marca"] }
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
    // cada cartão abre a pasta dele no Google Drive (link no item); sem link, leva à conta
    var link = item.link || "../conta/#pack", fora = /^https?:/.test(link);
    // com foto, o nome fica só embaixo do cartão: em cima da imagem ele sumiria nas partes claras
    var dentro = '<div class="capa' + (item.foto ? " com-foto" : "") + '" style="--cor:' + p.cor + '">' +
      (item.foto ? '<img src="../assets/pack/' + e(item.foto) + '.webp" alt="" width="640" height="400" loading="lazy">' : "<b>" + e(item.nome) + "</b>") +
      "</div>" +
      "<h4>" + e(item.nome) + "</h4><span>" + e(p.nome) + " · " + e(programasDe(item)) + "</span>";
    return '<a class="pacote" href="' + e(link) + '"' + (fora ? ' target="_blank" rel="noopener"' : "") + ">" + dentro + "</a>";
  }

  // ---------------------------------------------------------------- busca
  // sem acento, sem maiúscula e sem plural: "transição" acha "Transições", "sons" acha "som"
  function normalizar(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter(Boolean)
      .map(function (p) { return p.replace(/(oes|aes)$/, "ao").replace(/s$/, function (f) { return p.length > 3 ? "" : f; }); })
      .join(" ");
  }
  function textoDe(item) {
    var p = pasta(item.pasta);
    var usos = USOS.filter(function (u) { return item.usos.indexOf(u.id) >= 0; }).map(function (u) { return u.nome; }).join(" ");
    return " " + normalizar([item.nome, item.tags, p.nome, programasDe(item), usos].join(" ")) + " ";
  }
  function achar(busca) {
    var palavras = normalizar(busca).split(" ").filter(Boolean);
    return ITENS.filter(function (i) {
      var texto = textoDe(i);
      return palavras.every(function (w) { return texto.indexOf(" " + w) >= 0; });
    });
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
    var lista = filtro.tipo === "busca" ? achar(filtro.valor) : ITENS.filter(function (i) {
      if (filtro.tipo === "pasta") { return i.pasta === filtro.valor; }
      if (filtro.tipo === "programa") { return i.programas.indexOf(filtro.valor) >= 0; }
      return true;
    });
    var nome = filtro.tipo === "busca" ? "“" + filtro.valor + "”"
      : filtro.tipo === "pasta" ? pasta(filtro.valor).nome
      : filtro.tipo === "programa" ? PROGRAMAS.filter(function (p) { return p.id === filtro.valor; })[0].nome : "Tudo";
    tituloEstante.textContent = nome;
    contagem.textContent = lista.length + (lista.length === 1 ? " item" : " itens");
    estante.innerHTML = lista.length ? lista.map(capa).join("")
      : '<p class="vazio">' + (filtro.tipo === "busca" ? "Nada com “" + e(filtro.valor) + "” no pack ainda. Tente outra palavra ou escolha uma pasta." : "Nada aqui ainda.") + "</p>";
    return lista.length;
  }

  lado.addEventListener("click", function (ev) {
    var b = ev.target.closest(".filtro");
    if (!b) { return; }
    filtro = { tipo: b.dataset.tipo, valor: b.dataset.valor || null };
    campo.value = ""; limpar.hidden = true; resultado.innerHTML = "";
    desenharLado();
    desenharEstante();
  });

  // a caixa do topo da página: filtra enquanto digita; Enter ou uma sugestão descem até a biblioteca
  var form = document.getElementById("busca");
  var campo = document.getElementById("busca-campo");
  var limpar = form.querySelector(".busca-limpar");
  var resultado = document.getElementById("busca-resultado");
  var espera = null;

  function buscar(q, descer) {
    q = String(q || "").trim();
    limpar.hidden = !q;
    filtro = q ? { tipo: "busca", valor: q } : { tipo: "todos", valor: null };
    desenharLado();
    var n = desenharEstante();
    resultado.innerHTML = !q ? "" : n
      ? n + (n === 1 ? " item" : " itens") + " para “" + e(q) + "” · <a href=\"#biblioteca\">ver</a>"
      : "Nada com “" + e(q) + "” ainda";
    if (descer && q) { document.getElementById("biblioteca").scrollIntoView({ behavior: "smooth" }); }
  }

  campo.addEventListener("input", function () {
    clearTimeout(espera);
    espera = setTimeout(function () { buscar(campo.value, false); }, 120);
  });
  form.addEventListener("submit", function (ev) { ev.preventDefault(); buscar(campo.value, true); });
  limpar.addEventListener("click", function () { campo.value = ""; buscar("", false); campo.focus(); });
  document.querySelectorAll("[data-busca]").forEach(function (b) {
    b.addEventListener("click", function () { campo.value = b.dataset.busca; buscar(campo.value, true); });
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
