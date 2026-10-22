/* Páginas do Magic Hub: /ativar (confirmar o código do painel) e /conta (assinatura e
   senha do painel). Login pelo Supabase Auth — Google ou código de 6 números por e-mail —
   e o resto pela Edge Function "hub" (/api/site/*), com o access token no Bearer. */
(function () {
  "use strict";

  // sessão, chamadas à API e sair vêm de sessao.js (um cliente do Supabase para o site todo)
  var S = window.CRMO_SESSAO;
  var sb = S.sb, api = S.api, sessao = S.sessao, sair = S.sair, guardarPorSenha = S.guardarPorSenha;
  var raiz = document.getElementById("raiz");

  var G = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 12.23c0-.68-.06-1.36-.18-2.02H12v3.83h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.33ZM12 22c2.7 0 4.98-.9 6.63-2.43l-3.24-2.51c-.9.61-2.05.96-3.39.96-2.6 0-4.81-1.76-5.6-4.12H3.07v2.59A10 10 0 0 0 12 22Zm-5.6-8.1a6 6 0 0 1 0-3.8V7.51H3.07a10 10 0 0 0 0 8.98L6.4 13.9ZM12 5.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.51L6.4 10.1C7.19 7.74 9.4 5.98 12 5.98Z"/></svg>';

  function e(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }

  function mostrar(html) { raiz.innerHTML = html; }

  // título em bloco: duas linhas, a colorida inteira na segunda
  function titulo(l1, l2, cor) { return "<h1>" + e(l1) + "<br><em" + (cor ? ' class="' + cor + '"' : "") + ">" + e(l2) + "</em></h1>"; }

  function aguardando(botao, texto) { botao.disabled = true; botao.textContent = texto; }

  // ---------------------------------------------------------------- login
  // aoEntrar roda depois que o Supabase Auth devolveu uma sessão
  function telaEntrar(cabeca, volta, aoEntrar, erro) {
    mostrar(cabeca + (erro ? '<p class="erro">' + e(erro) + "</p>" : "") +
      '<button class="btn quieto" id="google" type="button">' + G + "Entrar com Google</button>" +
      '<div class="ou">ou por e-mail</div>' +
      '<form id="fEmail"><input type="email" name="email" placeholder="seu@email.com" autocomplete="email" required>' +
      '<button class="btn">Receber código por e-mail</button></form>' +
      '<p class="link">Use o e-mail da compra.</p>' +
      '<p class="link"><button type="button" id="comSenha">Já criei uma senha</button></p>');
    document.getElementById("google").onclick = function () {
      sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: volta } });
    };
    document.getElementById("comSenha").onclick = function () {
      telaSenhaEntrar(cabeca, volta, aoEntrar, document.querySelector("#fEmail [name=email]").value.trim());
    };
    document.getElementById("fEmail").onsubmit = function (ev) {
      ev.preventDefault();
      var email = this.email.value.trim().toLowerCase();
      aguardando(this.querySelector("button"), "Enviando…");
      sb.auth.signInWithOtp({ email: email, options: { shouldCreateUser: true, emailRedirectTo: volta } }).then(function (r) {
        if (r.error) {
          telaEntrar(cabeca, volta, aoEntrar, /rate|limit|seconds/i.test(r.error.message)
            ? "Já mandamos um código há pouco. Espere um minuto e confira também o spam."
            : "O e-mail não saiu agora. Tente de novo em alguns minutos.");
          return;
        }
        telaCodigo(email, cabeca, volta, aoEntrar);
      });
    };
  }

  // a senha é a do painel, criada em /conta ou depois do /ativar
  function telaSenhaEntrar(cabeca, volta, aoEntrar, email, erro) {
    mostrar(cabeca + (erro ? '<p class="erro">' + e(erro) + "</p>" : "") +
      '<form id="fEntrar"><input type="email" name="email" placeholder="seu@email.com" autocomplete="email" required value="' + e(email) + '">' +
      '<input type="password" name="senha" placeholder="Sua senha" autocomplete="current-password" required>' +
      '<button class="btn">Entrar</button></form>' +
      '<p class="link"><button type="button" id="semSenha">Entrar com Google ou código por e-mail</button></p>');
    var f = document.getElementById("fEntrar");
    (email ? f.senha : f.email).focus();
    document.getElementById("semSenha").onclick = function () { telaEntrar(cabeca, volta, aoEntrar); };
    f.onsubmit = function (ev) {
      ev.preventDefault();
      var digitado = f.email.value.trim().toLowerCase();
      aguardando(f.querySelector("button"), "Entrando…");
      api("POST", "/site/entrar", { email: digitado, senha: f.senha.value }).then(function (r) {
        if (r.status === 200) { guardarPorSenha({ token: r.dados.token, email: r.dados.conta.email }); aoEntrar(); return; }
        telaSenhaEntrar(cabeca, volta, aoEntrar, digitado,
          r.status === 409 ? "Essa conta ainda não tem senha. Entre com Google ou pelo código por e-mail." :
          r.status === 401 ? "E-mail ou senha errados." :
          r.status === 429 ? "Muitas tentativas. Espere 15 minutos ou entre pelo código por e-mail." :
          "Não deu para entrar agora. Tente de novo.");
      });
    };
  }

  function telaCodigo(email, cabeca, volta, aoEntrar, erro) {
    mostrar(titulo("Confira", "seu e-mail") +
      "<p>Mandamos um código para <b>" + e(email) + "</b>. Ele vale por alguns minutos.</p>" +
      (erro ? '<p class="erro">' + e(erro) + "</p>" : "") +
      '<form id="fCodigo"><input class="digitos" name="codigo" inputmode="numeric" autocomplete="one-time-code" maxlength="10" pattern="[0-9]{6,10}" required autofocus>' +
      '<button class="btn">Entrar</button></form>' +
      '<p class="link"><button type="button" id="outro">Usar outro e-mail</button></p>');
    document.getElementById("outro").onclick = function () { telaEntrar(cabeca, volta, aoEntrar); };
    document.getElementById("fCodigo").onsubmit = function (ev) {
      ev.preventDefault();
      var codigo = this.codigo.value.replace(/\D/g, "");
      aguardando(this.querySelector("button"), "Conferindo…");
      sb.auth.verifyOtp({ email: email, token: codigo, type: "email" }).then(function (r) {
        if (r.error || !r.data.session) { telaCodigo(email, cabeca, volta, aoEntrar, "Código errado ou vencido. Confira e tente de novo."); return; }
        aoEntrar();
      });
    };
  }

  function formSenha(rotulo) {
    return '<form id="fSenha"><input type="password" name="senha" placeholder="Nova senha (8 ou mais)" autocomplete="new-password" minlength="8" required>' +
      '<input type="password" name="senha2" placeholder="Repita a senha" autocomplete="new-password" minlength="8" required>' +
      '<p class="erro" id="erroSenha" hidden></p><button class="btn quieto">' + e(rotulo) + "</button></form>";
  }

  function ligarSenha(depois) {
    var f = document.getElementById("fSenha");
    if (!f) { return; }
    f.onsubmit = function (ev) {
      ev.preventDefault();
      var erro = document.getElementById("erroSenha");
      if (f.senha.value !== f.senha2.value) { erro.textContent = "As duas senhas não são iguais."; erro.hidden = false; return; }
      aguardando(f.querySelector("button"), "Salvando…");
      api("POST", "/site/senha", { senha: f.senha.value }).then(function (r) {
        if (r.status === 200) { depois(); return; }
        erro.textContent = r.dados.erro === "senha-curta" ? "A senha precisa de 8 caracteres ou mais." : "Não deu para salvar agora. Tente de novo.";
        erro.hidden = false;
        f.querySelector("button").disabled = false;
        f.querySelector("button").textContent = "Tentar de novo";
      });
    };
  }

  // ---------------------------------------------------------------- /ativar
  function ativar() {
    var codigo = (new URLSearchParams(location.search).get("codigo") || "").toUpperCase();
    var volta = location.origin + location.pathname + "?codigo=" + encodeURIComponent(codigo);
    var topo = '<p class="rotulo">Código do painel</p><div class="cod">' + e(codigo) + "</div>";
    var expirado = function () { mostrar(titulo("Código", "expirado", "rosa") + "<p>Volte ao painel e peça um novo.</p>"); };

    function passo() {
      api("GET", "/site/pareamento?codigo=" + encodeURIComponent(codigo)).then(function (r) {
        if (r.status !== 200) { expirado(); return; }
        sessao().then(function (s) {
          if (!s) {
            telaEntrar(titulo("Entre", "na conta") + "<p>Para liberar o Magic Hub, entre com a conta da sua compra.</p>" + topo, volta, passo);
            return;
          }
          mostrar(titulo("Confirme", "o acesso") +
            "<p>Só confirme se o painel do After/Premiere está mostrando <b>este código agora</b>.</p>" + topo +
            '<button class="btn" id="confirmar" type="button">Confirmar como ' + e(s.user.email) + "</button>" +
            '<p class="link"><button type="button" id="trocar">Usar outra conta</button></p>');
          document.getElementById("trocar").onclick = function () { sair().then(passo); };
          document.getElementById("confirmar").onclick = function () {
            aguardando(this, "Confirmando…");
            api("POST", "/site/confirmar", { codigo: codigo }).then(function (c) {
              if (c.status === 410) { expirado(); return; }
              if (c.status !== 200) { passo(); return; }
              pronto(c.dados.conta);
            });
          };
        });
      });
    }

    function pronto(conta) {
      mostrar(titulo("Pronto,", "pode voltar", "lima") + "<p>O painel já está liberado.</p>" +
        (conta.tem_senha ? "" : '<div class="cartao"><p class="rotulo">Opcional</p><p>Crie uma senha para entrar direto pelo painel da próxima vez.</p>' + formSenha("Criar senha") + "</div>"));
      ligarSenha(function () {
        mostrar(titulo("Pronto,", "pode voltar", "lima") + '<p class="aviso">Senha salva.</p><p>Da próxima vez, entre no painel com e-mail e senha.</p>');
      });
    }

    if (!/^[A-Z0-9]{6}$/.test(codigo)) { expirado(); return; }
    passo();
  }

  // ---------------------------------------------------------------- /conta
  // Sem sessão: a tela de login, estreita e no centro. Com sessão: a área da conta, larga,
  // com três abas (#perfil, #acesso, #seguranca) — o login não aparece mais.
  var DATA = { timeZone: "America/Sao_Paulo" };
  function dia(ms) { return ms ? new Date(ms).toLocaleDateString("pt-BR", DATA) : ""; }
  function mesAno(ms) { return ms ? new Date(ms).toLocaleDateString("pt-BR", { timeZone: DATA.timeZone, month: "long", year: "numeric" }) : ""; }

  var ABAS = [["perfil", "Perfil"], ["acesso", "Acesso"], ["seguranca", "Segurança"]];
  var PLUGINS = ["Magic Ease", "Magic Motion", "Magic Text", "Magic Box", "Magic SFX", "Magic Caption"];
  var APPS = { AEFT: "After Effects", PPRO: "Premiere Pro", site: "Este site, com a senha" };

  function conta(aviso) {
    var volta = location.origin + location.pathname;
    sessao().then(function (s) {
      if (!s) {
        document.body.classList.remove("na-conta");
        telaEntrar(titulo("Minha", "conta") + "<p>Entre com a conta da compra para ver seu acesso e cuidar do seu perfil.</p>", volta, function () { conta(); });
        return;
      }
      api("GET", "/site/conta").then(function (r) {
        if (r.status === 401) { sair().then(function () { conta(); }); return; }
        if (r.status !== 200) { mostrar(titulo("Não deu", "para abrir") + "<p>O site não respondeu. Tente de novo em instantes.</p>"); return; }
        S.lembrarPerfil(r.dados.conta);
        S.desenharTopo();
        areaDaConta(r.dados.conta, s, aviso);
      });
    });
  }

  function areaDaConta(c, s, aviso) {
    document.body.classList.add("na-conta");
    var aba = (location.hash || "").slice(1);
    if (!ABAS.some(function (a) { return a[0] === aba; })) { aba = "perfil"; }
    var m = (s.user && s.user.user_metadata) || {};
    var foto = c.foto || m.avatar_url || m.picture || null;
    var selo = c.acesso
      ? '<span class="selo ok">' + (c.vitalicio ? "Acesso vitalício" : "Ativo até " + e(dia(c.acesso_ate))) + "</span>"
      : '<span class="selo nao">Sem acesso</span>';

    mostrar(
      '<div class="conta">' +
        '<header class="conta-cabeca">' + S.avatar(c.nome, foto).replace('class="avatar"', 'class="avatar grande"') +
          '<div class="conta-quem"><h1 class="conta-nome">' + e(c.nome) + "</h1>" +
          "<p>" + e(c.email) + (c.desde ? " · na CRMO desde " + e(mesAno(c.desde)) : "") + "</p></div>" + selo +
        "</header>" +
        (aviso ? '<p class="aviso">' + e(aviso) + "</p>" : "") +
        '<nav class="conta-abas" role="tablist" aria-label="Minha conta">' + ABAS.map(function (a) {
          return '<a role="tab" href="#' + a[0] + '" aria-selected="' + (a[0] === aba) + '">' + a[1] + "</a>";
        }).join("") + "</nav>" +
        '<div class="conta-corpo" id="corpo"></div>' +
      "</div>");

    var corpo = document.getElementById("corpo");
    ({ perfil: abaPerfil, acesso: abaAcesso, seguranca: abaSeguranca })[aba](corpo, c, foto);
  }

  // trocar de aba só troca o hash; o hashchange desenha de novo com a conta já carregada
  window.addEventListener("hashchange", function () { if (document.body.classList.contains("na-conta")) { conta(); } });

  function abaPerfil(corpo, c, foto) {
    corpo.innerHTML =
      '<section class="cartao"><p class="rotulo">Seus dados</p>' +
        '<form id="fPerfil"><label>Nome<input name="nome" value="' + e(c.nome) + '" maxlength="80" autocomplete="name" required></label>' +
        '<label>E-mail<input value="' + e(c.email) + '" disabled></label>' +
        '<p class="nota">O e-mail é o da compra: é por ele que o acesso é liberado.</p>' +
        '<p class="erro" id="erroPerfil" hidden></p><button class="btn">Salvar</button></form></section>' +
      '<section class="cartao"><p class="rotulo">Foto</p>' +
        (foto ? "<p>Sua foto vem da sua conta Google.</p>" : "<p>Entre com o Google e a foto da sua conta aparece aqui e no topo do site.</p>") +
      "</section>";
    document.getElementById("fPerfil").onsubmit = function (ev) {
      ev.preventDefault();
      var f = this, b = f.querySelector("button");
      aguardando(b, "Salvando…");
      api("POST", "/site/perfil", { nome: f.nome.value }).then(function (r) {
        if (r.status === 200) { conta("Nome salvo."); return; }
        var erro = document.getElementById("erroPerfil");
        erro.textContent = r.dados.erro === "nome" ? "Escreva um nome." : "Não deu para salvar agora. Tente de novo.";
        erro.hidden = false; b.disabled = false; b.textContent = "Salvar";
      });
    };
  }

  function abaAcesso(corpo, c) {
    var texto = !c.acesso ? "Sua conta ainda não tem acesso aos plugins. Compre com este mesmo e-mail e ele libera sozinho."
      : c.vitalicio ? "Os seis plugins de hoje e os que vierem, no After Effects e no Premiere. Sem mensalidade."
        : "Seu acesso vale até " + dia(c.acesso_ate) + ".";
    corpo.innerHTML =
      '<section class="cartao status' + (c.acesso ? "" : " sem") + '"><p class="rotulo">Seu acesso</p>' +
        "<h2>" + (c.acesso ? (c.vitalicio ? "Vitalício" : "Ativo") : "Sem acesso") + "</h2><p>" + e(texto) + "</p>" +
        (c.acesso ? "" : '<a class="btn laranja" href="../assinar/">Comprar acesso vitalício</a>') +
      "</section>" +
      '<section class="cartao"><p class="rotulo">Plugins</p><ul class="lista-acesso">' + PLUGINS.map(function (n) {
        return "<li><span>" + e(n) + '</span><em class="' + (c.acesso ? "ok" : "nao") + '">' + (c.acesso ? "Liberado" : "Bloqueado") + "</em></li>";
      }).join("") + "</ul>" +
        '<p class="nota">Os plugins instalam e atualizam pelo Magic Hub, dentro do After ou do Premiere.</p>' +
        '<div class="acoes-conta"><a class="btn lima" href="../baixar/Magic-Hub-instalador.zip" download>Baixar o Magic Hub</a>' +
        '<a class="btn quieto" href="../plugins/#instalar">Como instalar</a></div>' +
      "</section>" +
      (c.acesso ? '<section class="cartao"><p class="rotulo">Pack de arquivos</p><div id="pack"><p>Carregando…</p></div></section>' : "");
    if (c.acesso) { mostrarPack(); }
  }

  // o link do pack vem da API só para quem tem acesso (hub_config.pack_url); não fica no site
  function mostrarPack() {
    var caixa = document.getElementById("pack");
    api("GET", "/site/pack").then(function (r) {
      if (!caixa) { return; }
      if (r.status === 200 && r.dados.url) {
        caixa.innerHTML = "<p>As pastas do pack ficam no Google Drive. Baixe só o que for usar.</p>" +
          '<div class="acoes-conta"><a class="btn" href="' + e(r.dados.url) + '" target="_blank" rel="noopener">Abrir o pack</a></div>';
        return;
      }
      caixa.innerHTML = r.status === 200
        ? "<p>O pack de arquivos sai em breve. Quando estiver pronto, o botão para baixar aparece aqui.</p>"
        : '<p class="erro">Não deu para carregar agora. Tente de novo em instantes.</p>';
    });
  }

  function abaSeguranca(corpo, c) {
    corpo.innerHTML =
      '<section class="cartao"><p class="rotulo">' + (c.tem_senha ? "Senha do painel" : "Criar a senha do painel") + "</p>" +
        "<p>" + (c.tem_senha ? "É a senha para entrar no Magic Hub com e-mail e senha." : "Com uma senha, você entra no Magic Hub direto com e-mail e senha, sem passar pelo site.") + "</p>" +
        formSenha(c.tem_senha ? "Trocar senha" : "Criar senha") + "</section>" +
      '<section class="cartao"><p class="rotulo">Onde você está conectado</p><div id="sessoes"><p>Carregando…</p></div></section>' +
      '<section class="cartao"><p class="rotulo">Este navegador</p><p>Sair do site não desconecta o Magic Hub no After ou no Premiere.</p>' +
        '<button class="btn quieto" type="button" id="sair">Sair do site</button></section>';
    ligarSenha(function () { conta("Senha salva. Já dá para entrar no painel com e-mail e senha."); });
    document.getElementById("sair").onclick = function () { sair().then(function () { location.hash = ""; conta(); }); };
    listarSessoes();
  }

  function listarSessoes() {
    var caixa = document.getElementById("sessoes");
    api("GET", "/site/sessoes").then(function (r) {
      if (r.status !== 200) { caixa.innerHTML = '<p class="erro">Não deu para carregar agora.</p>'; return; }
      var lista = r.dados.sessoes || [];
      var outras = lista.filter(function (x) { return !x.atual; });
      if (!lista.length) { caixa.innerHTML = "<p>Nenhum painel conectado ainda. Entre no Magic Hub pelo After ou pelo Premiere.</p>"; return; }
      caixa.innerHTML = '<ul class="sessoes">' + lista.map(function (x) {
        return "<li><div><b>" + e(APPS[x.app] || "Magic Hub") + "</b><span>Conectado em " + e(dia(x.criada_em)) + " · usado em " + e(dia(x.usada_em)) + "</span></div>" +
          (x.atual ? '<em class="selo ok">Esta página</em>' : '<button type="button" class="link-btn" data-sessao="' + e(x.id) + '">Desconectar</button>') + "</li>";
      }).join("") + "</ul>" +
        (outras.length > 1 ? '<button type="button" class="btn quieto" data-sessao="todas">Desconectar todos</button>' : "");
      caixa.onclick = function (ev) {
        var b = ev.target.closest("[data-sessao]");
        if (!b) { return; }
        aguardando(b, "Desconectando…");
        api("POST", "/site/sessoes/encerrar", { id: b.dataset.sessao }).then(listarSessoes);
      };
    });
  }

  // ---------------------------------------------------------------- /assinar
  function assinar() {
    api("GET", "/site/checkout").then(function (r) {
      if (r.dados && r.dados.url) { location.replace(r.dados.url); return; }
      mostrar(titulo("Assinatura", "em breve") + "<p>A venda abre logo. Fique de olho no Instagram da CRMO.</p>");
    });
  }

  var paginas = { ativar: ativar, conta: conta, assinar: assinar };
  (paginas[document.body.getAttribute("data-pagina")] || conta)();
}());
