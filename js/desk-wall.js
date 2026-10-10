/* Desk mode's wall: real leaf shadows from a video, coloured per time of
   day, and nothing else: no blur, no grain, no distortion, no cursor. The
   shadows are the video's own, frame for frame.

   public/assets/desk/leaves.mp4 is Pixabay 316726, "Tree shadows, leaf
   shadows" by Solarselle77 (Pixabay Content License, no attribution
   required), cut with ffmpeg: the real branch in its right half cropped
   away, the left half mirrored so the light enters from the left, two copies
   laid side by side with a 150px cross-fade (the second from 398px higher and
   running backwards) to spread the leaves across the wall, levelled so white
   is shadow (lum 245 -> 0, 100 -> 255), greyscale, silent, and played forward
   then backward so the 5s clip loops without a seam.

   Each pixel is a straight mix from the period's lit wall to its shadow by
   how deep the video's shadow is there. The day colours are what
   emilycampbell.co renders at each time of day; night is the owner's pair,
   slate #485374 lit and #1a1e2c in shadow, as in option B of
   night-options-abc.png. css/style.css ("Time of day, desk mode") keeps --bg
   in step.

   Still under reduced motion (the first frame). Without WebGL there is no
   canvas and the wall is plain --bg. Plays only while the desk is on screen. */
(function () {
  'use strict';

  var desk = document.querySelector('.desk');
  if (!desk) return;
  var canvas = document.createElement('canvas');
  canvas.className = 'desk__wall';
  canvas.setAttribute('aria-hidden', 'true');
  var gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) return;
  desk.insertBefore(canvas, desk.firstChild);

  // [lit wall, full shadow] per period.
  var MODES = {
    morning: ['#f9d4b8', '#d6bda7'],
    day:     ['#f9f7f6', '#f0ebea'],
    evening: ['#fbc8a9', '#e2b5a9'],
    night:   ['#485374', '#1a1e2c']
  };
  var VIDEO_ASPECT = 1280 / 728;

  var VERT =
    'attribute vec2 aPos; varying vec2 vUv;' +
    'void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }';
  var FRAG =
    'precision mediump float;' +
    'varying vec2 vUv;' +
    'uniform sampler2D tLeaves;' +
    'uniform vec2 uScale, uOff;' +
    'uniform vec3 uLit, uShadow;' +
    'void main() {' +
    '  float a = texture2D(tLeaves, vUv * uScale + uOff).r;' +
    '  gl_FragColor = vec4(mix(uLit, uShadow, a), 1.0);' +
    '}';

  function shader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  var prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.bindAttribLocation(prog, 0, 'aPos');
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(prog);

  var u = {};
  ['tLeaves', 'uScale', 'uOff', 'uLit', 'uShadow']
    .forEach(function (n) { u[n] = gl.getUniformLocation(prog, n); });

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  // A bare wall until the first frame arrives.
  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
   [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]
    .forEach(function (p) { gl.texParameteri(gl.TEXTURE_2D, p[0], p[1]); });
  gl.uniform1i(u.tLeaves, 0);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  // Made on first sight of the desk, so graph and mosaic never fetch it.
  // Muted with no audio track: nothing on the site may start a sound.
  var video = null;
  function film() {
    if (video) return;
    video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.addEventListener('loadeddata', function () { upload(); draw(); });
    video.src = 'public/assets/desk/leaves.mp4?v=6';
  }
  function upload() {
    if (!video || video.readyState < 2) return;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
  }

  function rgb(hex) {
    return [1, 3, 5].map(function (i) { return parseInt(hex.slice(i, i + 2), 16) / 255; });
  }
  function target() {
    var m = MODES[document.documentElement.getAttribute('data-time')] || MODES.day;
    return [rgb(m[0]), rgb(m[1])];
  }
  var col = target();

  // Size to the desk; cover-fit the video, centred.
  var W = 0, H = 0;
  function resize() {
    W = desk.clientWidth; H = desk.clientHeight;
    if (!W || !H) return;
    canvas.width = W; canvas.height = H;
    gl.viewport(0, 0, W, H);
    var ca = W / H;
    if (ca >= VIDEO_ASPECT) {
      gl.uniform2f(u.uScale, 1, VIDEO_ASPECT / ca);
      gl.uniform2f(u.uOff, 0, (1 - VIDEO_ASPECT / ca) / 2);
    } else {
      gl.uniform2f(u.uScale, ca / VIDEO_ASPECT, 1);
      gl.uniform2f(u.uOff, (1 - ca / VIDEO_ASPECT) / 2, 0);
    }
  }

  function draw() {
    if (!W) return;
    gl.uniform3fv(u.uLit, col[0]);
    gl.uniform3fv(u.uShadow, col[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  // A period change eases the colours over about a second and a half.
  function ease(a, b) { for (var i = 0; i < 3; i++) a[i] += (b[i] - a[i]) * 0.03; }
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  var raf = 0, onScreen = true;
  function running() {
    return !still.matches && onScreen && !document.hidden && desk.offsetWidth > 0;
  }
  function frame() {
    raf = 0;
    if (!running()) { if (video) video.pause(); return; }
    var t = target();
    ease(col[0], t[0]); ease(col[1], t[1]);
    upload();
    draw();
    raf = requestAnimationFrame(frame);
  }
  function wake() {
    resize();
    if (desk.offsetWidth > 0) film();
    if (still.matches) { if (video) video.pause(); col = target(); upload(); draw(); return; }
    if (!raf && running()) {
      if (video) video.play().catch(function () {});
      raf = requestAnimationFrame(frame);
    }
  }

  new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; wake(); }).observe(desk);
  new ResizeObserver(wake).observe(desk);
  document.addEventListener('visibilitychange', wake);
  window.addEventListener('modechange', wake);
  window.addEventListener('themechange', wake);
  if (still.addEventListener) still.addEventListener('change', wake);
  wake();
})();
