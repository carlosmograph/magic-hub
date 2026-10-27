/* Fundo do site em código (WebGL): um fluido de luz roxa, bem escuro e liso. Dois corpos
   escuros grandes quase se tocam; a luz passa pela fresta entre eles e vira um fio que se
   abre num leque claro, como seda. A rolagem move tudo como um líquido: os corpos giram em
   volta do centro, incham e encolhem, e o espaço inteiro ondula devagar.
   - Desenha só quando a rolagem muda (com inércia); parado, não gasta nada.
   - Sem WebGL, fica o .brilho de CSS de antes. Com movimento reduzido, a cena fica parada.
   Cores: do --fundo ao indigo, com um toque de rosa só no ponto mais claro, sempre baixo:
   o texto passa por cima sem precisar de fundo próprio. */
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
    "const vec3 FUNDO=vec3(.071,.067,.086);",
    "const vec3 INDIGO=vec3(.404,.380,1.);",
    "const vec3 ROSA=vec3(1.,.796,.937);",
    "float ruido(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}",
    "vec2 girar(vec2 v,float a){float c=cos(a),s=sin(a);return vec2(c*v.x-s*v.y,s*v.x+c*v.y);}",
    "void main(){",
    "  vec2 R=uRes;",
    "  vec2 p=(gl_FragCoord.xy-.5*R)/R.y;",
    "  float s=uP;",
    // o líquido: o espaço ondula em duas frequências baixas, deslocadas pela rolagem
    "  p+=.06*vec2(sin(p.y*2.3+s*5.1),cos(p.x*1.9-s*4.3));",
    "  p+=.03*vec2(sin(p.y*4.1-s*3.7+1.3),sin(p.x*3.6+s*4.9));",
    // os dois corpos escuros, um de cada lado do centro, girando juntos e quase se tocando
    "  float a=.62+s*2.4;",
    "  vec2 cA=girar(vec2(-.63,.07),a);",
    "  vec2 cB=girar(vec2(.63,-.07),a);",
    "  float dA=length(p-cA)-(.62+.05*sin(s*7.3));",
    "  float dB=length(p-cB)-(.64+.05*cos(s*6.1));",
    "  float espalha=1.+clamp(abs(uV),0.,1.)*.6;",
    // luz ambiente: some devagar para dentro dos corpos (borda bem larga, como seda)
    "  float amb=smoothstep(-.4,.55,min(dA,dB));",
    // a fresta: onde as duas bordas se aproximam, dA+dB é quase zero. Um fio fino e um halo
    "  float junto=max(dA+dB,0.)/espalha;",
    "  float borda=smoothstep(-.06,.0,min(dA,dB));",
    "  float fio=exp(-junto*28.)*borda;",
    "  float halo=exp(-junto*5.)*borda;",
    // a luz vem de um lado só, como na referência: o leque abre para um canto
    "  vec2 lado=girar(vec2(-.7,-.7),a-.62);",
    "  float canto=smoothstep(-1.,1.,dot(p,lado));",
    "  float luz=amb*.75*(.15+.85*canto)+halo*.35+fio*.45;",
    "  luz=clamp(luz,0.,1.);",
    // rampa: fundo → indigo escuro → indigo → um lilás no ponto mais claro; tudo baixo
    "  vec3 cor=mix(FUNDO,INDIGO*.25,smoothstep(0.,.45,luz));",
    "  cor=mix(cor,INDIGO*.38,smoothstep(.35,.8,luz));",
    "  cor=mix(cor,mix(INDIGO,ROSA,.35)*.46,smoothstep(.75,1.,luz));",
    // pontilhado de 1,5/255: invisível, só evita faixas num degradê tão escuro
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
  var uRes = gl.getUniformLocation(prog, "uRes"), uP = gl.getUniformLocation(prog, "uP"),
    uV = gl.getUniformLocation(prog, "uV"), uEsc = gl.getUniformLocation(prog, "uEsc");

  // pixels do canvas por pixel CSS: a luz é toda difusa, então 1 pixel por pixel CSS basta
  var ESCALA = 1;
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
