/* Fundo do site em código (WebGL): dois arcos de luz na paleta CRMO, vistos através de um
   vidro canelado (as faixas verticais) e com grão de filme. A rolagem move a cena: o
   horizonte sobe e atravessa a tela, a faixa diagonal gira, e a velocidade estica a luz.
   - Desenha só quando a rolagem muda (com inércia); parado, não gasta nada.
   - Meia resolução: a imagem é toda difusa, então não perde nada e roda leve no celular.
   - Sem WebGL, fica o .brilho de CSS de antes. Com movimento reduzido, a cena fica parada.
   Cores: só indigo, indigo claro, rosa e creme, sobre o --fundo. */
(function () {
  "use strict";

  var tela = document.createElement("canvas");
  tela.className = "fundo-gl";
  tela.setAttribute("aria-hidden", "true");
  var gl = tela.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
  if (!gl) { return; }

  var VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  var FRAG = [
    "precision mediump float;",
    "uniform vec2 uRes;uniform float uP;uniform float uV;uniform float uFaixa;",
    "const vec3 FUNDO=vec3(.082,.082,.090);",
    "const vec3 INDIGO=vec3(.404,.380,1.);",
    "const vec3 INDIGO_C=vec3(.561,.541,1.);",
    "const vec3 ROSA=vec3(1.,.796,.937);",
    "const vec3 CREME=vec3(.992,.969,.914);",
    "float ruido(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}",
    // luz de um arco: d = distância até a borda do círculo (negativa por dentro).
    // Por dentro desce de creme (a borda) para lilás, indigo e escuro; por fora some rápido.
    "vec3 arco(float d,float largura,float forca){",
    "  float t=clamp(-d/largura,0.,1.);",
    "  vec3 lilas=mix(INDIGO,ROSA,.32)*1.12;",
    "  vec3 borda=mix(ROSA,CREME,.45);",
    "  vec3 cor=mix(mix(borda,lilas,smoothstep(0.,.07,t)),INDIGO,smoothstep(.1,.5,t));",
    "  float dentro=(1.-smoothstep(.3,1.,t))*step(d,0.);",
    "  float fora=exp(-max(d,0.)*22.)*step(0.,d);",
    "  return cor*(dentro+fora*.9)*forca;",
    "}",
    "void main(){",
    "  vec2 px=gl_FragCoord.xy;",
    "  float asp=uRes.x/uRes.y;",
    "  vec2 uv=px/uRes;",
    // vidro canelado: cada faixa mostra a cena um pouco deslocada e ampliada
    "  float n=px.x/uFaixa;",
    "  float f=fract(n)-.5;",
    "  float id=floor(n);",
    "  vec2 p=vec2((uv.x-.5)*asp,uv.y-.5);",
    "  p.x+=f*uFaixa/uRes.y*1.;",
    "  p.y+=(ruido(vec2(id,3.))-.5)*.035+f*f*.05;",
    // a velocidade da rolagem estica a luz na vertical, como rastro
    "  p.y*=1.-clamp(abs(uV),0.,1.)*.22;",
    "  float s=uP;",
    // arco 1, o horizonte: nasce embaixo, sobe e atravessa da esquerda para a direita
    "  vec2 c1=vec2(asp*(-.18+.5*s)+.18*sin(s*6.2),-1.42+.5*sin(s*3.1416)+.12*cos(s*9.));",
    "  vec3 luz=arco(length(p-c1)-1.05,.42,1.);",
    // arco 2, a faixa diagonal: um círculo grande fora da tela, que gira com a rolagem
    "  float g=1.9+s*2.4;",
    "  vec2 c2=vec2(cos(g),sin(g))*1.75+vec2(asp*.25,.35);",
    "  float d2=length(p-c2)-1.62;",
    "  vec3 lilas=mix(INDIGO,ROSA,.35);",
    "  luz+=mix(lilas,INDIGO,smoothstep(-.05,.12,abs(d2)))*exp(-pow(d2/.13,2.))*.55;",
    // as bordas das faixas do vidro: um fio escuro e um fio claro
    "  float fio=smoothstep(.45,.5,abs(f));",
    "  luz*=1.-fio*.22;",
    "  luz+=vec3(.6,.58,1.)*smoothstep(.47,.5,f)*.025*length(luz);",
    // texto passa por cima: a luz nunca chega ao creme puro no meio da tela
    "  float meio=1.-.55*exp(-pow((uv.x-.5)*2.,2.));",
    "  vec3 cor=FUNDO+luz*.78*meio;",
    "  cor+=(ruido(px+fract(uP*97.))-.5)*.05;",
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
  var uRes = gl.getUniformLocation(prog, "uRes"), uP = gl.getUniformLocation(prog, "uP"),
    uV = gl.getUniformLocation(prog, "uV"), uFaixa = gl.getUniformLocation(prog, "uFaixa");

  var ESCALA = 0.5;            // pixels do canvas por pixel CSS
  var FAIXA = 54;              // largura de cada faixa do vidro, em pixels CSS
  var parado = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function medir() {
    var l = Math.max(1, Math.round(window.innerWidth * ESCALA));
    var h = Math.max(1, Math.round(window.innerHeight * ESCALA));
    if (tela.width !== l || tela.height !== h) {
      tela.width = l; tela.height = h;
      gl.viewport(0, 0, l, h);
    }
    gl.uniform2f(uRes, l, h);
    gl.uniform1f(uFaixa, FAIXA * ESCALA);
  }

  function alvo() {
    var total = document.documentElement.scrollHeight - window.innerHeight;
    return total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
  }

  var atual = parado ? 0.12 : alvo(), vel = 0, antes = 0, rodando = false;

  function desenhar() {
    gl.uniform1f(uP, atual);
    gl.uniform1f(uV, vel);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // inércia: o fundo persegue a rolagem com uma mola amortecida, igual em 60 ou 120 Hz
  function quadro(agora) {
    var dt = Math.min(0.05, (agora - antes) / 1000 || 0.016);
    antes = agora;
    var t = alvo(), passo = 1 - Math.exp(-dt * 5);
    var novo = atual + (t - atual) * passo;
    vel += ((novo - atual) / dt * 6 - vel) * (1 - Math.exp(-dt * 8));
    atual = novo;
    desenhar();
    if (Math.abs(t - atual) > 0.0002 || Math.abs(vel) > 0.002) { requestAnimationFrame(quadro); }
    else { vel = 0; desenhar(); rodando = false; }
  }
  function acordar() {
    if (parado || rodando || document.hidden) { return; }
    rodando = true;
    antes = performance.now();
    requestAnimationFrame(quadro);
  }

  medir();
  desenhar();
  document.body.insertBefore(tela, document.body.firstChild);
  document.documentElement.classList.add("com-fundo-gl");

  window.addEventListener("scroll", acordar, { passive: true });
  window.addEventListener("resize", function () { medir(); desenhar(); acordar(); });
  document.addEventListener("visibilitychange", acordar);
  tela.addEventListener("webglcontextlost", function (ev) {
    ev.preventDefault();
    document.documentElement.classList.remove("com-fundo-gl");
    tela.remove();
  });
}());
