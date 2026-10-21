/* Páginas do Magic Hub: /ativar (confirmar o código do painel) e /conta (assinatura e
   senha do painel). Login pelo Supabase Auth — Google ou código de 6 números por e-mail —
   e o resto pela Edge Function "hub" (/api/site/*), com o access token no Bearer. */
(function () {
  "use strict";

  var C = window.CRMO_SITE;
  var sb = window.supabase.createClient(C.supabaseUrl, C.supabaseChave, { auth: { persistSession: true, detectSessionInUrl: true } });
  var raiz = document.getElementById("raiz");

  var G = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 12.23c0-.68-.06-1.36-.18-2.02H12v3.83h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.33ZM12 22c2.7 0 4.98-.9 6.63-2.43l-3.24-2.51c-.9.61-2.05.96-3.39.96-2.6 0-4.81-1.76-5.6-4.12H3.07v2.59A10 10 0 0 0 12 22Zm-5.6-8.1a6 6 0 0 1 0-3.8V7.51H3.07a10 10 0 0 0 0 8.98L6.4 13.9ZM12 5.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.51L6.4 10.1C7.19 7.74 9.4 5.98 12 5.98Z"/></svg>';

  function e(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }

  function mostrar(html) { raiz.innerHTML = html; }

  // título em bloco: duas linhas, a colorida inteira na segunda
  function titulo(l1, l2, cor) { return "<h1>" + e(l1) + "<br><em" + (cor ? ' class="' + cor + '"' : "") + ">" + e(l2) + "</em></h1>"; }

  // Entrou com e-mail e senha (/site/entrar): o token da API fica aqui, sem Supabase Auth
  var CHAVE_SENHA = "crmo.site.senha";
  function porSenha() {
    try { return JSON.parse(localStorage.getItem(CHAVE_SENHA) || "null"); } catch (x) { return null; }
  }
  function guardarPorSenha(v) {
    try { if (v) { localStorage.setItem(CHAVE_SENHA, JSON.stringify(v)); } else { localStorage.removeItem(CHAVE_SENHA); } } catch (x) {}
  }

  function api(metodo, rota, corpo) {
    return sb.auth.getSession().then(function (r) {
      var s = r.data && r.data.session;
      var p = porSenha();
      var cab = { "Accept": "application/json" };
      if (s) { cab.Authorization = "Bearer " + s.access_token; } else if (p) { cab.Authorization = "Bearer " + p.token; }
      if (corpo) { cab["Content-Type"] = "application/json"; }
      return fetch(C.api + rota, { method: metodo, headers: cab, body: corpo ? JSON.stringify(corpo) : undefined, cache: "no-store" })
        .then(function (x) { return x.json().catch(function () { return {}; }).then(function (d) { return { status: x.status, dados: d }; }); })
        .catch(function () { return { status: 0, dados: {} }; });
    });
  }

  // a sessão do Supabase Auth ou, se entrou com senha, o mesmo formato com o e-mail
  function sessao() {
    return sb.auth.getSession().then(function (r) {
      var s = r.data && r.data.session;
      var p = porSenha();
      return s || (p ? { user: { email: p.email } } : null);
    });
  }

  function sair() {
    var p = porSenha();
    guardarPorSenha(null);
    if (p) { fetch(C.api + "/sair", { method: "POST", headers: { Authorization: "Bearer " + p.token } }).catch(function () {}); }
    return sb.auth.signOut();
  }

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
  function conta(aviso) {
    var volta = location.origin + location.pathname;
    sessao().then(function (s) {
      if (!s) {
        telaEntrar(titulo("Minha", "conta") + "<p>Entre para ver sua assinatura e criar a senha do painel.</p>", volta, function () { conta(); });
        return;
      }
      api("GET", "/site/conta").then(function (r) {
        if (r.status === 401) { sair().then(function () { conta(); }); return; }
        if (r.status !== 200) { mostrar(titulo("Não deu", "para abrir") + "<p>O site não respondeu. Tente de novo em instantes.</p>"); return; }
        var c = r.dados.conta;
        var ate = c.acesso_ate ? new Date(c.acesso_ate).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "";
        var selo = c.acesso
          ? '<span class="selo ok">' + (c.vitalicio ? "Acesso vitalício" : "Assinatura ativa até " + e(ate)) + "</span>"
          : '<span class="selo nao">Sem assinatura</span>';
        mostrar(titulo("Minha", "conta") + (aviso ? '<p class="aviso">' + e(aviso) + "</p>" : "") +
          '<div class="cartao"><div class="nome">' + e(c.nome) + '</div><div class="email">' + e(c.email) + "</div>" + selo + "</div>" +
          (c.acesso ? "" : '<a class="btn laranja" href="../assinar/">Assinar</a>') +
          '<div class="cartao"><p class="rotulo">' + (c.tem_senha ? "Trocar a senha do painel" : "Senha do painel") + "</p>" +
          formSenha(c.tem_senha ? "Trocar senha" : "Criar senha") + "</div>" +
          '<p class="link"><button type="button" id="sair">Sair do site</button></p>');
        ligarSenha(function () { conta("Senha salva. Já dá para entrar pelo painel com e-mail e senha."); });
        document.getElementById("sair").onclick = function () { sair().then(function () { conta(); }); };
      });
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
