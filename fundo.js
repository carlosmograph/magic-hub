/* Fundo do site em código (WebGL), no estilo do horizonte do palco do início: um planeta
   enorme e escuro com a borda acesa em indigo, um fio de luz na borda e a atmosfera subindo
   dela. Liso, sem grão e sem textura. A rolagem move o horizonte: ele sobe, desce, anda de
   lado e inclina; rolando rápido, a atmosfera se espalha um pouco mais.
   - Desenha só quando a rolagem muda (com inércia); parado, não gasta nada.
   - Sem WebGL, fica o .brilho de CSS de antes. Com movimento reduzido, a cena fica parada.
   Cores: o --fundo, o corpo do planeta (#131317, o mesmo do palco), indigo e indigo claro. */
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
    "uniform vec2 uRes;uniform float uP;uniform float uV;uniform float uEsc;",
    "const vec3 FUNDO=vec3(.082,.082,.090);",
    "const vec3 PLANETA=vec3(.075,.075,.090);",
    "const vec3 INDIGO=vec3(.404,.380,1.);",
    "const vec3 INDIGO_C=vec3(.561,.541,1.);",
    "float ruido(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}",
    // o horizonte: elipse de raios r, centro c, inclinada ang. d = distância até a borda em px
    // (positiva fora). Mesmas camadas do .palco-in::after: atmosfera acima, corpo escuro,
    // brilho logo abaixo da borda e o fio de 1px.
    "vec3 horizonte(vec3 cor,vec2 q,vec2 c,vec2 r,float ang,float espalha){",
    "  float cs=cos(ang),sn=sin(ang);",
    "  vec2 v=q-c;v=vec2(cs*v.x+sn*v.y,-sn*v.x+cs*v.y);",
    "  float d=(length(v/r)-1.)*r.y;",
    "  cor+=INDIGO*.55*exp(-max(d,0.)/espalha)*step(0.,d);",
    "  float dentro=smoothstep(.8,-.8,d);",
    "  cor=mix(cor,PLANETA,dentro);",
    "  cor+=INDIGO*.3*exp(d/40.)*dentro;",
    "  cor+=INDIGO_C*.55*exp(-d*d/1.3);",
    "  return cor;",
    "}",
    "void main(){",
    "  vec2 q=gl_FragCoord.xy/uEsc;",
    "  vec2 R=uRes/uEsc;",
    "  float s=uP;",
    "  vec3 cor=FUNDO;",
    // um brilho fraco descendo do topo, como o radial do palco
    "  vec2 t=(q-vec2(R.x*.5,R.y))/vec2(R.x*.55,R.y*.5);",
    "  cor+=INDIGO*.12*exp(-dot(t,t)*1.8);",
    // o horizonte anda com a rolagem: altura, lado e inclinação em ondas lentas
    "  vec2 r=vec2(max(1300.,R.x*1.05),680.);",
    "  float alto=R.y*(.14+.2*(.5-.5*cos(s*9.42)));",
    "  vec2 c=vec2(R.x*(.5+.2*sin(s*7.54)),alto-r.y);",
    "  float ang=.09*sin(s*5.65);",
    "  float espalha=60.*(1.+clamp(abs(uV),0.,1.)*.7);",
    "  cor=horizonte(cor,q,c,r,ang,espalha);",
    // pontilhado de 1/255: invisível, só evita faixas no degradê liso
    "  cor+=(ruido(gl_FragCoord.xy)-.5)/255.;",
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
    uV = gl.getUniformLocation(prog, "uV"), uEsc = gl.getUniformLocation(prog, "uEsc");

  // pixels do canvas por pixel CSS: o fio da borda tem 1px e precisa de resolução cheia
  var ESCALA = Math.min(window.devicePixelRatio || 1, 1.5);
  var parado = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function medir() {
    var l = Math.max(1, Math.round(window.innerWidth * ESCALA));
    var h = Math.max(1, Math.round(window.innerHeight * ESCALA));
    if (tela.width !== l || tela.height !== h) {
      tela.width = l; tela.height = h;
      gl.viewport(0, 0, l, h);
    }
    gl.uniform2f(uRes, l, h);
    gl.uniform1f(uEsc, ESCALA);
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
