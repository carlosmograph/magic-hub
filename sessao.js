/* Quem está logado, em todas as páginas do site. Carrega depois do supabase-js e do config.js.
   - Um cliente só do Supabase Auth para o site inteiro: o login por Google ou link de e-mail
     volta para qualquer página e a sessão é guardada e renovada em qualquer uma delas.
   - Quem entrou com a senha do painel (/site/entrar) tem o token da API em localStorage.
   - A aba "Minha conta" do topo vira "Entrar" sem login, e nome + foto com login.
   As páginas usam window.CRMO_SESSAO (site.js no /conta, /ativar, /assinar). */
(function () {
  "use strict";

  var C = window.CRMO_SITE;
  var sb = window.supabase.createClient(C.supabaseUrl, C.supabaseChave, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  function ler(chave) {
    try { return JSON.parse(localStorage.getItem(chave) || "null"); } catch (x) { return null; }
  }
  function gravar(chave, v) {
    try { if (v) { localStorage.setItem(chave, JSON.stringify(v)); } else { localStorage.removeItem(chave); } } catch (x) {}
  }

  // Entrou com e-mail e senha: { token, email }
  var CHAVE_SENHA = "crmo.site.senha";
  function porSenha() { return ler(CHAVE_SENHA); }
  function guardarPorSenha(v) { gravar(CHAVE_SENHA, v); }

  // Nome, foto e acesso da última resposta da API, para o topo não piscar entre páginas
  var CHAVE_PERFIL = "crmo.site.perfil";
  function lembrarPerfil(conta) {
    gravar(CHAVE_PERFIL, conta ? { email: conta.email, nome: conta.nome, foto: conta.foto,
      acesso: !!conta.acesso, vitalicio: !!conta.vitalicio, quando: Date.now() } : null);
  }

  // a sessão do Supabase Auth ou, se entrou com senha, o mesmo formato com o e-mail
  function sessao() {
    return sb.auth.getSession().then(function (r) {
      var s = r.data && r.data.session;
      var p = porSenha();
      return s || (p ? { user: { email: p.email } } : null);
    });
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

  function sair() {
    var p = porSenha();
    guardarPorSenha(null);
    lembrarPerfil(null);
    if (p) { fetch(C.api + "/sair", { method: "POST", headers: { Authorization: "Bearer " + p.token } }).catch(function () {}); }
    return sb.auth.signOut().then(desenharTopo, desenharTopo);
  }

  function e(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }

  // avatar: a foto do Google, ou a inicial num círculo indigo
  function avatar(nome, foto) {
    return foto
      ? '<img class="avatar" src="' + e(foto) + '" alt="" referrerpolicy="no-referrer">'
      : '<span class="avatar">' + e((nome || "?").trim().charAt(0).toUpperCase()) + "</span>";
  }

  // Quem tem acesso não vê "Comprar": o botão vira o selo do acesso e leva à aba Acesso da conta
  var ESTRELA = '<svg viewBox="0 0 100 100" aria-hidden="true"><path fill="currentColor" d="M50 8.01 L55.34 44.66 L91.99 50 L55.34 55.34 L50 91.99 L44.66 55.34 L8.01 50 L44.66 44.66 Z M70.04 29.96 L55.1 50 L70.04 70.04 L50 55.1 L29.96 70.04 L44.9 50 L29.96 29.96 L50 44.9 Z"/></svg>';
  function seloDoTopo(a, p) {
    var b = document.querySelector(".topo-comprar");
    if (!b) { return; }
    if (!b.dataset.href) { b.dataset.href = b.getAttribute("href"); }
    if (p && p.acesso) {
      b.innerHTML = ESTRELA + (p.vitalicio ? '<span class="topo-acesso-1">Acesso</span><span>vitalício</span>' : "<span>Acesso ativo</span>");
      b.href = a.getAttribute("href").split("#")[0] + "#acesso";
      b.classList.add("topo-acesso");
    } else {
      b.innerHTML = "Comprar";
      b.href = b.dataset.href;
      b.classList.remove("topo-acesso");
    }
  }

  function desenharTopo() {
    var a = document.querySelector("a[data-minha-conta]");
    if (!a) { return; }
    sessao().then(function (s) {
      if (!s) { a.innerHTML = "Entrar"; a.classList.remove("logado"); seloDoTopo(a, null); return; }
      var p = ler(CHAVE_PERFIL) || {};
      if (p.email !== s.user.email) { p = {}; }
      var m = s.user.user_metadata || {};
      var nome = p.nome || m.full_name || m.name || s.user.email.split("@")[0];
      var foto = p.foto || m.avatar_url || m.picture || null;
      a.innerHTML = avatar(nome, foto) + "<span>" + e(String(nome).split(" ")[0]) + "</span>";
      a.classList.add("logado");
      seloDoTopo(a, p);
      // o acesso guardado vale 10 minutos; depois disso pergunta de novo à API (a /conta sempre pergunta)
      if (!p.quando || Date.now() - p.quando > 600000) {
        api("GET", "/site/conta").then(function (r) {
          if (r.status !== 200 || !r.dados.conta) { return; }
          lembrarPerfil(r.dados.conta);
          seloDoTopo(a, ler(CHAVE_PERFIL));
        });
      }
    });
  }

  sb.auth.onAuthStateChange(function () { setTimeout(desenharTopo, 0); });
  desenharTopo();

  window.CRMO_SESSAO = { sb: sb, sessao: sessao, api: api, sair: sair, porSenha: porSenha, guardarPorSenha: guardarPorSenha,
    lembrarPerfil: lembrarPerfil, desenharTopo: desenharTopo, avatar: avatar };
}());
