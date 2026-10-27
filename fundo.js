/* Fundo do site em código (WebGL): fundo preto com brilhos roxos suaves que oscilam o tempo
   todo, cada um no seu ritmo (vai e volta devagar e pulsa de leve). A rolagem empurra os
   brilhos pela tela com inércia, então eles acompanham a página.
   - Liso: sem grão nem textura (só um pontilhado de 1/255, invisível, contra faixas).
   - Roda a ~30 quadros por segundo e para quando a aba some.
   - Sem WebGL, fica o .brilho de CSS de antes. Com movimento reduzido, a cena fica parada.
   Cores: indigo e indigo com um toque de rosa, sempre baixos sobre o preto. */
(function () {
  "use strict";

  var tela = document.createElement("canvas");
  tela.className = "fundo-gl";
  tela.setAttribute("aria-hidden", "true");
  var gl = tela.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
  if (!gl) { return; }

  var VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  var FRAG = [
    "precision highp float;",
    "uniform vec2 uRes;uniform float uP;uniform float uT;",
    "const vec3 PRETO=vec3(.039,.039,.047);",
    "const vec3 INDIGO=vec3(.404,.380,1.);",
    "const vec3 ROSA=vec3(1.,.796,.937);",
    "float ruido(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}",
    // um brilho: mancha redonda e difusa em c, raio r; oscila em volta de c e pulsa
    "float brilho(vec2 p,vec2 c,float r,float fase,float t){",
    "  c+=vec2(sin(t*.31+fase),cos(t*.26+fase*1.7))*.22;",
    "  float pulso=.6+.4*sin(t*.45+fase*2.3);",
    "  vec2 d=(p-c)/r;",
    "  return exp(-dot(d,d))*pulso;",
    "}",
    "void main(){",
    "  vec2 R=uRes;",
    "  vec2 p=(gl_FragCoord.xy-.5*R)/R.y;",
    "  float t=uT;",
    // a rolagem desce os brilhos e gira o conjunto devagar
    "  float s=uP;",
    "  float a=s*2.2;",
    "  mat2 g=mat2(cos(a),-sin(a),sin(a),cos(a));",
    "  vec2 q=g*p+vec2(0.,s*.6-.3);",
    "  vec3 violeta=mix(INDIGO,ROSA,.3);",
    "  vec3 luz=INDIGO*brilho(q,vec2(-.62,.36),.42,0.,t)*.6;",
    "  luz+=violeta*brilho(q,vec2(.68,.02),.38,2.1,t)*.5;",
    "  luz+=INDIGO*brilho(q,vec2(-.18,-.52),.46,4.2,t)*.55;",
    "  luz+=violeta*brilho(q,vec2(.32,.7),.34,5.6,t)*.45;",
    // o meio da tela fica um pouco mais escuro: é onde o texto passa
    "  float meio=1.-.3*exp(-pow(p.x*1.8,2.));",
    "  vec3 cor=PRETO+luz*.62*meio;",
    "  cor+=(ruido(gl_FragCoord.xy)-.5)*1.5/255.;",
    "  gl_FragColor=vec4(cor,1.);",
    "}"
  ].join("\n");

  function shader(tipo, fonte) {
    var s = gl.createShader(tipo);
    gl.shaderSource(s, fonte);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  var vs = shader(gl.VERTEX_SHADER, VERT), fs = shader(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { return; }
  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { return; }
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var a = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(a);
  gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
  var uRes = gl.getUniformLocation(prog, "uRes"), uP = gl.getUniformLocation(prog, "uP"), uT = gl.getUniformLocation(prog, "uT");

  // a luz é toda difusa: meia resolução não perde nada e poupa o celular
  var ESCALA = 0.5;
  var QUADRO = 1000 / 30;
  var parado = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function medir() {
    var l = Math.max(1, Math.round(window.innerWidth * ESCALA));
    var h = Math.max(1, Math.round(window.innerHeight * ESCALA));
    if (tela.width !== l || tela.height !== h) {
      tela.width = l; tela.height = h;
      gl.viewport(0, 0, l, h);
    }
    gl.uniform2f(uRes, l, h);
  }

  function alvo() {
    var total = document.documentElement.scrollHeight - window.innerHeight;
    return total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
  }

  var atual = alvo(), inicio = performance.now(), antes = 0, ultimo = 0, rodando = false;

  function desenhar(agora) {
    gl.uniform1f(uP, atual);
    gl.uniform1f(uT, parado ? 0 : (agora - inicio) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // os brilhos oscilam sempre; a rolagem chega neles com inércia, igual em 60 ou 120 Hz
  function quadro(agora) {
    if (document.hidden) { rodando = false; return; }
    requestAnimationFrame(quadro);
    if (agora - ultimo < QUADRO) { return; }
    var dt = Math.min(0.1, (agora - (antes || agora)) / 1000);
    antes = agora; ultimo = agora;
    atual += (alvo() - atual) * (1 - Math.exp(-dt * 4));
    desenhar(agora);
  }
  function acordar() {
    if (parado || rodando || document.hidden) { return; }
    rodando = true;
    antes = 0;
    requestAnimationFrame(quadro);
  }

  medir();
  desenhar(performance.now());
  document.body.insertBefore(tela, document.body.firstChild);
  document.documentElement.classList.add("com-fundo-gl");

  window.addEventListener("resize", function () { medir(); desenhar(performance.now()); });
  document.addEventListener("visibilitychange", acordar);
  tela.addEventListener("webglcontextlost", function (ev) {
    ev.preventDefault();
    document.documentElement.classList.remove("com-fundo-gl");
    tela.remove();
  });
  acordar();
}());
