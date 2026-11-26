/* The business card's QR, drawn as a tree (after tree.icqr.com; the card is
   built in js/desk-objects.js). A <canvas> with its own orthographic camera:
   at rest it looks at a small garden from a slant; on hover a spring swings
   it straight down, the crown's leaves settle into columns over the code's
   dark modules, and the crisp code takes over so it scans.

   The garden's floor IS the code (no quiet zone on it; the pale card is the
   quiet zone). The data is turned 90 degrees as icqr's is, so the corner
   with no finder sits at the back, behind the trunk, and the three finders
   grow grass at the left, front and right corners.

   Four seasons. The card's buttons switch them; it opens on the viewer's own
   season (today's month, flipped for a southern-hemisphere time zone).
   Spring's blossom is a colour from the day's Wada combination, never a
   green; winter is snow on bare boughs with snowfall. The card is pale paper
   in both themes, so these colours are fixed; every flat-code colour clears
   3:1 on that paper.

   Units are modules: x = column, y = row (of the turned grid), z = up. Sizes
   measured on icqr (a 25-module code) are scaled by K = n / 25.

   Sections, each with its own builder and drawer:
     1 seasons and colours   2 sprites            3 the grid
     4 floor and slab        5 grass              6 trunk and branches
     7 crown                 8 litter and drifts  9 falling leaves and petals
     10 rain                 11 snowfall          12 camera and swing
     13 flat code            14 frame loop and API */
(function () {
  'use strict';

  var PAPER = '#fbfaf6';
  var SP = 48;                 // leaf, flower and flake sprites, px
  var RS = 0.45 * SP;          // sprite px for one leaf radius R
  var DEG = Math.PI / 180, TAU = 2 * Math.PI;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ================= 1. seasons and colours ================= */
  // Weighted lists are [colour, weight]. Flat colours were measured on icqr
  // and darkened where needed so each clears 3:1 on the card's paper.
  var FLAT_LIGHT = [['#efece5', 30], ['#edeae3', 25], ['#ebe7df', 20], ['#e9e5dd', 12], ['#e6e2d9', 8], ['#e3dfd5', 5]];
  var SEASONS = {
    spring: {
      leaves: null, leafCode: null,           // from blossom(), per visit
      grassCode: [['#5ba235', 30], ['#4ca42b', 28], ['#8f904c', 22], ['#6d9336', 20]],
      floor: ['#efece6', '#d8d3c6', '#dcd5cb', '#c4bcab'],   // light, dark; then each under the trunk
      blade: { base: '#68d126', body: ['#87e53e', '#99df4e'], light: '#b2e660', tip: '#d3f29b',
               acc: [[0.30, ['#c48c85', '#dca1a0', '#e8b9b8']], [0.12, ['#86ad48', '#9bc15a', '#b9c980']]] },
      kind: 'flower', fallN: 10, litterN: 40
    },
    summer: {
      leaves: [['#a3e263', '#82cc52'], ['#98df5b', '#79c653'], ['#8ed953', '#6fbf4c'], ['#83cf5a', '#6cb948']],
      leafCode: [['#4ea411', 10], ['#499e12', 20], ['#39900e', 27], ['#2c7909', 26], ['#1f5f0a', 17]],
      grassCode: [['#4da311', 30], ['#419f0d', 28], ['#949552', 22], ['#6f8b30', 20]],
      floor: ['#ece6db', '#d9d3c7', '#d4ccbc', '#c1b9a7'],
      blade: { base: '#2cb005', body: ['#46ca06', '#59cd08'], light: '#67d90d', tip: '#a2df1a',
               acc: [[0.08, ['#75ab3b', '#94b45a', '#b4be72']], [0.02, ['#c99a88', '#ddaf9d', '#e8c4b6']]] },
      kind: 'leaf', fallN: 2, litterN: 10, back: '#1f4a14'
    },
    autumn: {
      leaves: [['#f5d870', '#eebd5e'], ['#f3cc6e', '#ebb05f'], ['#f4b46e', '#ec965c'], ['#f3ab70', '#e5845a']],
      leafCode: [['#b88830', 25], ['#af8931', 10], ['#c47528', 22], ['#b8561e', 25], ['#a94015', 18]],
      grassCode: [['#ac8c34', 30], ['#b48b31', 25], ['#9c8137', 25], ['#91934d', 20]],
      floor: ['#d6d2ca', '#c1bcb2', '#c3bdb1', '#aea899'], wet: true,
      blade: { base: '#c89b22', body: ['#d8b22c', '#dab236'], light: '#e7c540', tip: '#f2cc5b',
               acc: [[0.15, ['#c38f35', '#daa442', '#e8bd6a']], [0.05, ['#9a8440', '#ae964a', '#c4ad66']], [0.08, ['#d08f73', '#e4a78b', '#efc1aa']]] },
      kind: 'leaf', fallN: 9, litterN: 50, rain: true, back: '#7a2a20'
    },
    winter: {   // icqr has no winter: snow on bare boughs, in its style
      leaves: [['#c49a6a', '#9a6b45']],        // the few dry leaves that hang on
      leafCode: [['#6a7c93', 25], ['#5b6d84', 30], ['#4f6178', 30], ['#3f5068', 15]],
      grassCode: [['#6b7a6f', 30], ['#5d6b63', 25], ['#7a8279', 25], ['#677385', 20]],
      floor: ['#eef1f4', '#d6dbe1', '#e2e5e8', '#c9ced4'],
      blade: { base: '#8f9478', body: ['#a9a67a', '#c9b98a'], light: '#c9b98a', tip: '#e6dcc0', acc: [] },
      kind: 'snow', fallN: 0, litterN: 0, snow: true
    }
  };
  // Bark: the same in spring, summer and autumn; cooler and darker in winter.
  var BARK = { body: '#76503b', under: '#4a2c22', hi: '#a8826d', band: '#4e1f0c', ring: '#4c1a08', twig: '#5a3a2c',
               dBody: '#a37559', dHi: '#b98b6f', dUnder: '#6e4a3a', dBand: '#5a2a14',
               trunk: [[0, '#3f2419'], [0.08, '#4f3028'], [0.2, '#6a4433'], [0.4, '#7c503b'], [0.55, '#83563f'], [0.62, '#a37a64'],
                       [0.68, '#b08e79'], [0.74, '#9a6d55'], [0.82, '#6a4636'], [0.92, '#4a2b1f'], [1, '#2c0f08']] };
  var BARKW = { body: '#6a4a3e', under: '#3a2620', hi: '#9c8378', band: '#3e1a0e', ring: '#3e1a0e', twig: '#4e3a34',
                dBody: '#8a6a5a', dHi: '#a8907f', dUnder: '#5a4238', dBand: '#3e1a0e',
                trunk: BARK.trunk.map(function (s) { return [s[0], mix(s[1], '#4f6178', 0.12)]; }) };
  var SLAB = ['#bcb5b3', '#aea6a3'];          // left (lit) and right faces; every season
  var PILLAR = ['#a86a63', '#b87f78', '#c99282'], PILLARW = ['#8d9aab', '#a3afbe', '#b8c3d0'];

  // ponytail: by time zone, not geolocation (no prompt); the tropics get the northern year.
  var SOUTH = /^(Australia|Antarctica)\/|^America\/(Argentina|Santiago|Punta_Arenas|Sao_Paulo|Montevideo|Asuncion|La_Paz|Lima|Campo_Grande|Cuiaba)|^Africa\/(Johannesburg|Maputo|Harare|Windhoek|Lusaka|Gaborone|Maseru|Mbabane|Blantyre)|^Pacific\/(Auckland|Chatham|Fiji|Tongatapu|Noumea|Efate)|^Indian\/(Mauritius|Reunion|Antananarivo)/;
  function seasonNow() {
    var m = new Date().getMonth(), tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    if (SOUTH.test(tz)) m = (m + 6) % 12;
    return ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'][m];
  }

  function rgb(h) { var x = parseInt(h.slice(1), 16); return [x >> 16 & 255, x >> 8 & 255, x & 255]; }
  function mix(a, b, t) {
    var x = rgb(a), y = rgb(b), out = '#';
    for (var s = 0; s < 3; s++) out += ('0' + Math.round(x[s] + (y[s] - x[s]) * t).toString(16)).slice(-2);
    return out;
  }
  function pick(list, r) {            // weighted pick with a fixed random r in [0,1)
    var sum = 0, i;
    for (i = 0; i < list.length; i++) sum += list[i][1];
    r *= sum;
    for (i = 0; i < list.length; i++) { r -= list[i][1]; if (r < 0) return list[i][0]; }
    return list[list.length - 1][0];
  }
  function smooth(a, b, u) { u = Math.min(1, Math.max(0, (u - a) / (b - a))); return u * u * (3 - 2 * u); }
  function interp(xs, ys, x) {
    if (x <= xs[0]) return ys[0];
    for (var i = 1; i < xs.length; i++) if (x <= xs[i]) return ys[i - 1] + (ys[i] - ys[i - 1]) * (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
    return ys[ys.length - 1];
  }

  // Spring: one of today's three Wada colours that is not a green, at random.
  // Blossom is a pale tint of it (stronger at the heart); the flat code takes
  // three shades of the colour itself, each stepped to clear 3:1.
  function blossom() {
    var P = window.portfolioPalette, trio = P ? P.trio() : [], ok = [];
    trio.forEach(function (c, i) {
      var h = P.toHsl(c);
      // Greens, and the dark yellows that read as olive green.
      var green = h && h.s > 15 && ((h.h > 70 && h.h < 170) || (h.h > 45 && h.h <= 70 && h.l < 45));
      if (h && !green) ok.push(i);
    });
    if (!ok.length) return { c: '#e07aa8', leaves: [['#f6dce8', '#f3a3cc'], ['#f3e2ea', '#f4b2d6'], ['#f0d1e5', '#f29fc9'], ['#efdde6', '#f6c1db']],
                             code: [['#c77391', 35], ['#bc587f', 35], ['#a84a70', 30]] };
    var i = ok[Math.floor(Math.random() * ok.length)], c = trio[i];
    // The theme colour itself at the petal's edge, a lighter heart: crimson
    // blossom reads crimson, not icqr's pink.
    return { c: c, leaves: [0, 0.33, 0.66, 1].map(function (t) { return [mix(c, '#ffffff', 0.4 + 0.15 * t), mix(c, '#ffffff', 0.04 + 0.12 * t)]; }),
             code: [[P.against(i, 3, PAPER), 40], [P.against(i, 3.6, PAPER), 30], [P.against(i, 4.4, PAPER), 30]] };
  }

  /* ================= 2. sprites ================= */
  // Pre-rendered once per colour; the frame only blits them.
  var cache = {};
  function canvasOf(w, h) { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }
  // A broad sugar maple, tip up, pivot at the stalk, in units of R.
  var MAPLE = [[0, -1], [0.139, -0.788], [0.225, -0.556], [0.470, -0.696], [0.766, -0.643], [0.713, -0.363], [0.567, -0.121],
               [0.812, 0.114], [0.585, 0.260], [0.257, 0.306], [0.099, 0.304], [0, 0.22]];
  function sprite(kind, edge, base, dot) {
    var key = kind + edge + base;
    if (cache[key]) return cache[key];
    var cv = canvasOf(SP, SP), g = cv.getContext('2d'), k, gr;
    g.translate(SP / 2, SP / 2);
    g.scale(RS, RS);
    if (kind === 'leaf') {
      g.beginPath();
      MAPLE.forEach(function (p) { g.lineTo(p[0], p[1]); });
      for (k = MAPLE.length - 2; k > 0; k--) g.lineTo(-MAPLE[k][0], MAPLE[k][1]);
      gr = g.createRadialGradient(0, 0.15, 0, 0, 0.15, 1.1);
      gr.addColorStop(0, base); gr.addColorStop(0.55, mix(base, edge, 0.6)); gr.addColorStop(1, edge);
      g.fillStyle = gr; g.fill();
      g.strokeStyle = mix(base, '#000000', 0.1); g.globalAlpha = 0.3; g.lineWidth = 0.05;
      g.beginPath(); g.moveTo(0, 0.2); g.lineTo(0, -0.8); g.stroke();
      if (dot) { g.globalAlpha = 1; g.fillStyle = dot; g.beginPath(); g.arc(0, 0.15, 0.1, 0, TAU); g.fill(); }
    } else if (kind === 'bloom' || kind === 'flower') {   // five notched cherry petals round a pale eye
      // A crown slot holds a little cluster of three; one falls or lies alone.
      (kind === 'bloom' ? [[0, 0, 1]] : [[-0.45, 0.15, 0.55], [0.45, 0.2, 0.52], [0.02, -0.42, 0.58]]).forEach(function (b) {
        g.save(); g.translate(b[0], b[1]); g.scale(b[2], b[2]); g.rotate(b[0] * 2);
        g.beginPath();
        for (k = 0; k < 5; k++) {
          for (var s = 0; s < 15; s++) {
            var t = s / 14 - 0.5, ang = (k * 72 + t * 72 * 0.98) * DEG, u = Math.abs(t) / 0.5,
                r = 0.40 + 0.60 * Math.sqrt(Math.max(0, 1 - Math.pow(u, 2.2)));
            if (u < 0.12) r -= 0.12 * (1 - u / 0.12);
            g.lineTo(r * Math.sin(ang), -r * Math.cos(ang));
          }
        }
        gr = g.createRadialGradient(0, 0, 0, 0, 0, 1);
        gr.addColorStop(0, base); gr.addColorStop(0.45, mix(base, edge, 0.5)); gr.addColorStop(1, edge);
        g.fillStyle = gr; g.fill();
        g.fillStyle = dot || '#eee8bb'; g.beginPath(); g.arc(0, 0, 0.12, 0, TAU); g.fill();
        g.restore();
      });
    } else if (kind === 'cushion' || kind === 'cshadow') {   // a lump of snow lying on a bough
      g.beginPath();
      [[0, 0, 0.62], [0.5, 0.12, 0.45], [-0.48, 0.1, 0.42], [0.1, -0.38, 0.4]].forEach(function (c) {
        g.moveTo(c[0] + c[2], c[1]); g.arc(c[0], c[1], c[2], 0, TAU);
      });
      if (kind === 'cshadow') g.fillStyle = '#cfd9e4';
      else {
        gr = g.createLinearGradient(0, -0.8, 0, 0.62);
        gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.6, '#f4f7fa'); gr.addColorStop(1, '#e6ecf2');
        g.fillStyle = gr;
      }
      g.fill();
    } else if (kind === 'flake') {    // a soft, faintly cool dot: white alone would vanish on the paper
      gr = g.createRadialGradient(0, 0, 0, 0, 0, 1);
      gr.addColorStop(0, 'rgba(226,233,243,1)'); gr.addColorStop(base ? 0.3 : 0.5, 'rgba(200,213,230,0.95)');
      gr.addColorStop(1, 'rgba(192,206,225,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.fill();
    } else {                          // drift: soft snow lying on the floor
      gr = g.createRadialGradient(0, 0, 0, 0, 0, 1);
      gr.addColorStop(0, 'rgba(251,252,253,0.9)'); gr.addColorStop(0.6, 'rgba(251,252,253,0.6)'); gr.addColorStop(1, 'rgba(251,252,253,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.fill();
    }
    return (cache[key] = cv);
  }

  window.qrTree = function (canvas, rows) {
    var ctx = canvas.getContext('2d');
    var n = rows.length, mid = n / 2, K = n / 25, k33 = n / 33;
    var seed = 7;
    function rnd() { seed = seed * 16807 % 2147483647; return seed / 2147483647; }
    function U(a, b) { return a + (b - a) * rnd(); }

    /* ================= 3. the grid ================= */
    // Turned 90 degrees counter-clockwise, as icqr shows it: the finder-less
    // corner ends top right in the flat code and at the back of the garden.
    // Dark modules inside a lumpy circle carry leaves; the rest grow grass.
    var gb = [rnd() * TAU, rnd() * TAU];
    function Rg(a) { return 13.0 * K / 1.16 * (1 + 0.05 * Math.sin(3 * a + gb[0]) + 0.04 * Math.sin(5 * a + gb[1])); }
    var mods = [], leafMods = [], grassMods = [], i, j, x, y, m;
    for (y = 0; y < n; y++) for (x = 0; x < n; x++) {
      var dark = rows[x][n - 1 - y] === '1', dx = x + 0.5 - mid, dy = y + 0.5 - mid, d = Math.hypot(dx, dy),
          md = { x: x, y: y, dark: dark, d: d, a: Math.atan2(dy, dx), r: rnd(), j: [rnd() * 2 - 1, rnd()] };
      md.grass = dark && d > Rg(md.a);
      mods.push(md);
      if (md.grass) grassMods.push(md); else if (dark) leafMods.push(md);
    }

    /* ================= 4. floor and slab ================= */
    // The floor top is one pixel per module, drawn through the camera's own
    // affine map (no seams); the slab's two faces are one-row strips.
    var fcRest = canvasOf(n, n), fcFlat = canvasOf(n, n), stripL = canvasOf(n, 1), stripR = canvasOf(n, 1);
    (function () {
      [[stripL, SLAB[0], 5], [stripR, SLAB[1], 6]].forEach(function (s) {
        var g = s[0].getContext('2d'), c = rgb(s[1]);
        for (var q = 0; q < n; q++) {
          var v = Math.round((rnd() * 2 - 1) * s[2]);
          g.fillStyle = 'rgb(' + (c[0] + v) + ',' + (c[1] + v) + ',' + (c[2] + v) + ')'; g.fillRect(q, 0, 1, 1);
        }
      });
    })();
    function buildFloor() {
      var w = sea.winter, f = sea.floor.map(rgb), sig = 6.5 * K;
      [[fcRest, false], [fcFlat, true]].forEach(function (pass) {
        var g = pass[0].getContext('2d'), im = g.createImageData(n, n), px = im.data;
        mods.forEach(function (md) {
          var c, o = (md.y * n + md.x) * 4,
              sh = Math.exp(-Math.pow(Math.hypot(md.x + 0.5 - mid, md.y + 0.5 - mid) / sig, 2)) * (pass[1] ? 0.4 : 1);
          if (md.grass) c = rgb(w && !pass[1] ? '#e9eef3' : md.grassCol);
          else if (!md.dark && pass[1]) c = rgb(md.lightCol);
          else {
            var b = md.dark ? f[1] : f[0], e = md.dark ? f[3] : f[2], v = md.j[0] * (md.dark ? 3 : 6), warm = !md.dark && md.j[1] < 0.15;
            c = [0, 1, 2].map(function (q) { return b[q] + sh * (e[q] - b[q]) + v + (warm ? [5, 1, -5][q] : 0); });
          }
          px[o] = c[0]; px[o + 1] = c[1]; px[o + 2] = c[2]; px[o + 3] = 255;
        });
        g.putImageData(im, 0, 0);
      });
    }
    // Winter: a lip of snow along the slab's top edge, deeper here and there.
    var lip = [];
    for (i = 0; i <= n; i++) lip.push(0.10 + 0.14 * rnd());
    function drawSlab() {
      P(0, 0, 0, q0);
      ctx.imageSmoothingEnabled = false;
      // Face x = 0 (screen left, lit) runs along y; face y = n (screen right) along x.
      ctx.setTransform(-cam.S * cam.sa, cam.S * cam.cb * cam.ca, 0, cam.S * cam.sb, q0.sx, q0.sy);
      ctx.drawImage(stripL, 0, 0);
      P(0, n, 0, q1);
      ctx.setTransform(cam.S * cam.ca, cam.S * cam.cb * cam.sa, 0, cam.S * cam.sb, q1.sx, q1.sy);
      ctx.drawImage(stripR, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (sea.winter && cam.sb > 0.05) {
        ctx.fillStyle = '#f4f6f9'; ctx.strokeStyle = '#dfe6ee'; ctx.lineWidth = dpr;
        [[0, 0, 0, 1], [0, n, 1, 0]].forEach(function (f) {
          ctx.beginPath();
          var q;
          for (q = 0; q <= n; q++) { P(f[0] + f[2] * q, f[1] + f[3] * q, 0, q2); ctx.lineTo(q2.sx, q2.sy); }
          for (q = n; q >= 0; q--) {
            var h = lip[q];
            P(f[0] + f[2] * q, f[1] + f[3] * q, -h, q2); ctx.lineTo(q2.sx, q2.sy);
            if (q > 0) { P(f[0] + f[2] * (q - 0.5), f[1] + f[3] * (q - 0.5), -0.6 * Math.min(h, lip[q - 1]), q2); ctx.lineTo(q2.sx, q2.sy); }
          }
          ctx.fill(); ctx.stroke();
        });
      }
    }
    function drawFloor(u) {
      P(0, 0, 0, q0);
      ctx.imageSmoothingEnabled = false;
      ctx.setTransform(cam.S * cam.ca, cam.S * cam.cb * cam.sa, -cam.S * cam.sa, cam.S * cam.cb * cam.ca, q0.sx, q0.sy);
      var w = sea.wet ? smooth(0, 0.15, u) : u;   // autumn's wet floor dries at once
      if (w > 0) ctx.drawImage(fcFlat, 0, 0);
      if (w < 1) { ctx.globalAlpha = 1 - w; ctx.drawImage(fcRest, 0, 0); ctx.globalAlpha = 1; }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = true;
    }

    /* ================= 5. grass ================= */
    // Every dark module outside the crown grows a tuft of ~16 curved blades
    // that fan out from the module and merge with their neighbours. Eight
    // variants per season are painted once at the rest view; each module is
    // then one sheared blit that sways slowly and collapses as the camera
    // looks down. Winter: a snow pillow with a few dry straws.
    var REST = { ca: Math.cos(-45 * DEG), sa: Math.sin(-45 * DEG), cb: Math.sin(31 * DEG), sb: Math.cos(31 * DEG) };
    var tufts = null, tuftKey = '', G = 12;
    grassMods.forEach(function (md) { md.v = Math.floor(rnd() * 8); md.mir = rnd() < 0.5 ? -1 : 1; md.ph = rnd() * 0.6; });
    function tuftSprite(bl, winter, sd) {
      var s = sd;
      function r() { s = s * 16807 % 2147483647; return s / 2147483647; }
      var cv = canvasOf(5 * G, 5 * G), g = cv.getContext('2d'), ax = 2.5 * G, ay = 3.6 * G, bs = [], q;
      function scr(px, py, pz) {
        var X = px - 0.5, Y = py - 0.5;
        return [ax + G * (X * REST.ca - Y * REST.sa), ay + G * ((X * REST.sa + Y * REST.ca) * REST.cb - pz * REST.sb)];
      }
      if (winter) {   // the pillow
        var c0 = scr(0.5, 0.5, 0), rx = 0.62 * G * 1.414, ry = rx * REST.cb, hh = 0.38 * G * REST.sb;
        var gr = g.createLinearGradient(0, c0[1] - hh - ry, 0, c0[1] + ry);
        gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.55, '#eef2f7'); gr.addColorStop(0.85, '#e6edf4'); gr.addColorStop(1, '#cfd9e4');
        g.fillStyle = gr; g.beginPath();
        g.ellipse(c0[0], c0[1], rx, ry, 0, Math.PI, 0, true);
        g.bezierCurveTo(c0[0] + rx, c0[1] - hh * 1.4, c0[0] + rx * 0.3, c0[1] - hh - ry, c0[0], c0[1] - hh - ry * 0.9);
        g.bezierCurveTo(c0[0] - rx * 0.3, c0[1] - hh - ry, c0[0] - rx, c0[1] - hh * 1.4, c0[0] - rx, c0[1]);
        g.fill();
      }
      var nb = winter ? 5 + Math.floor(r() * 3) : 13 + Math.floor(r() * 7);
      for (q = 0; q < nb; q++) {
        var bx = 0.1 + 0.8 * r(), by = 0.1 + 0.8 * r(), tall = !winter && r() < 0.17, r4 = r(), r5 = r(),
            h = winter ? 0.5 + 0.7 * r4 : tall ? 2.2 + 0.7 * r4 : 0.8 + 1.1 * Math.pow(r4, 1.3),
            th = (winter ? 10 + 25 * r5 : tall ? 25 + 30 * r5 : 8 + 47 * r5 * r5) * DEG,
            ps = Math.atan2(by - 0.5, bx - 0.5) + (r() - 0.5) * 1.2,
            w = tall ? 0.10 : 0.16 + 0.10 * r(), z0 = winter ? 0.15 : 0,
            T = [bx + h * Math.sin(th) * Math.cos(ps), by + h * Math.sin(th) * Math.sin(ps), z0 + h * Math.cos(th)],
            ac = r(), col = null, a;
        for (a = 0; a < bl.acc.length; a++) { if (ac < bl.acc[a][0]) { col = bl.acc[a][1]; break; } ac -= bl.acc[a][0]; }
        bs.push({ b: scr(bx, by, z0), m: scr(bx + 0.3 * (T[0] - bx), by + 0.3 * (T[1] - by), z0 + 0.5 * h * Math.cos(th)),
                  t: scr(T[0], T[1], T[2]), w: w * G, col: col, two: r() < 0.33, pale: r() < 0.25, body: bl.body[Math.floor(r() * 2)],
                  cap: winter && r() < 0.3, dpt: (bx - 0.5) * REST.sa + (by - 0.5) * REST.ca });
      }
      bs.sort(function (a, b) { return a.dpt - b.dpt; });
      bs.forEach(function (b) {
        var gr = g.createLinearGradient(b.b[0], b.b[1], b.t[0], b.t[1]);
        if (b.col) { gr.addColorStop(0, b.col[0]); gr.addColorStop(0.6, b.col[1]); gr.addColorStop(1, b.col[2]); }
        else { gr.addColorStop(0, bl.base); gr.addColorStop(0.45, b.body); gr.addColorStop(0.85, bl.light); gr.addColorStop(1, b.pale ? bl.tip : bl.light); }
        g.fillStyle = gr; g.beginPath();
        g.moveTo(b.b[0] - b.w / 2, b.b[1]);
        g.quadraticCurveTo(b.m[0] - 0.35 * b.w, b.m[1], b.t[0], b.t[1]);
        g.quadraticCurveTo(b.m[0] + 0.35 * b.w, b.m[1], b.b[0] + b.w / 2, b.b[1]);
        g.closePath(); g.fill();
        if (b.two) {      // the midrib: the right half a shade darker
          g.fillStyle = 'rgba(0,0,0,0.12)'; g.beginPath();
          g.moveTo(b.b[0], b.b[1]); g.quadraticCurveTo(b.m[0], b.m[1], b.t[0], b.t[1]);
          g.quadraticCurveTo(b.m[0] + 0.35 * b.w, b.m[1], b.b[0] + b.w / 2, b.b[1]); g.fill();
        }
        if (b.cap) { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(b.t[0], b.t[1], 0.1 * G, 0, TAU); g.fill(); }
      });
      return cv;
    }
    function ensureTufts() {
      G = Math.max(8, Math.round(S0));
      var key = seaName + G + (seaName === 'spring' ? sea.deep : '');
      if (key === tuftKey) return;
      tuftKey = key; tufts = [];
      for (var v = 0; v < 8; v++) tufts.push(tuftSprite(sea.blade, sea.winter, 101 + v * 7919));
    }
    function drawTuft(md, u) {
      var hs = 1 - smooth(0.55, 0.95, u), vs = cam.sb / REST.sb * hs;
      if (vs < 0.02) return;
      ctx.globalAlpha = 1 - smooth(0.5, 0.85, u);
      var kx = cam.S / G, s = live ? (0.05 * Math.sin(TAU * clock / 8.5 + 0.22 * (md.x + md.y) + md.ph) + 0.015 * Math.sin(TAU * clock / 3.1 + 3 * md.ph)) / REST.sb : 0;
      ctx.setTransform(kx * md.mir, 0, -s * kx * vs, kx * vs, md.sx, md.sy);
      ctx.drawImage(tufts[md.v], -2.5 * G, -3.6 * G);
    }

    /* ================= 6. trunk and branches ================= */
    // Measured off icqr: a straight, nearly untapered trunk that forks at a
    // third of the floor's width into five side limbs (one droops toward
    // the viewer) and a leader that splits into four upright stems, two of
    // which poke bare out of the crown. Hairline twigs fan from every tip.
    // The wood never sways. Table rows are [x, y, z, diameter] in icqr-scaled
    // modules (a 33-module floor), offsets from the trunk.
    var segs = [], bands = [], rings = [], tips = [];
    function W3(p) { return [mid - p[1] * k33, mid + p[0] * k33, p[2] * k33, p[3] * k33]; }
    var LIMBS = {
      stub: [[-0.73, 0.73, 7.79, 0.21], [-1.17, 1.35, 7.99, 0.11]],
      L1: [[-0.47, 0.47, 13.07, 1.06], [-4.85, 6.72, 14.26, 0.53], [-6.63, 9.43, 16.9, 0.16]],
      L2: [[-0.19, 0.75, 12.54, 0.99], [-0.56, 6.91, 12.41, 0.53], [-0.75, 13.25, 11.88, 0.16]],
      R1: [[0.47, -0.47, 13.33, 0.92], [3.27, -4.2, 13.99, 0.46], [5.46, -7.33, 14.92, 0.16]],
      R1t: [[4.67, -6.16, 14.65, 0.2], [4.95, -6.44, 17.56, 0.07]],
      R2: [[0.75, -0.37, 13.73, 0.99], [5.79, -3.55, 13.99, 0.46], [10.55, -6.63, 13.86, 0.13]],
      D: [[0.47, -0.09, 11.75, 0.53], [3.13, 2.47, 10.56, 0.37], [5.97, 5.23, 8.98, 0.24]],
      leader: [[0, 0, 11.62, 1.25], [0.44, -0.44, 20.59, 0.99]],
      S1: [[0.28, -0.28, 20.33, 0.53], [-2.35, 0.49, 27.59, 0.33], [-3.41, 0.98, 34.32, 0.16], [-3.06, 0.26, 38.54, 0.07]],
      S2: [[0.37, -0.37, 20.59, 0.5], [0.12, 1.0, 29.3, 0.2], [0.07, 1.43, 32.34, 0.13]],
      T1: [[0.07, 1.43, 32.34, 0.13], [-2.15, 3.64, 32.6, 0.07]],
      S3: [[0.47, -0.47, 20.59, 0.5], [0.07, -1.19, 28.71, 0.2], [0, -1.49, 31.68, 0.08]],
      S4: [[0.56, -0.56, 20.33, 0.53], [3.03, -1.17, 28.78, 0.29], [4.1, -1.86, 33.92, 0.16], [6.23, -3.62, 37.36, 0.07]]
    };
    var STEEP = { leader: 1, S1: 1, S2: 1, S3: 1, S4: 1, R1t: 1 };
    function limb(pts, name, extra) {
      var along = 0, bandAt = 2.1 * k33;
      for (var q = 0; q < pts.length - 1; q++) {
        var A = pts[q], B = pts[q + 1], len = Math.hypot(B[0] - A[0], B[1] - A[1], B[2] - A[2]),
            parts = extra ? 1 : 4, rise = Math.abs(B[2] - A[2]) / Math.max(1e-6, Math.hypot(B[0] - A[0], B[1] - A[1]));
        for (var s = 0; s < parts; s++) {
          var u0 = s / parts, u1 = (s + 1) / parts, sg = {
            t: 's', name: name, w: A[3] + (B[3] - A[3]) * (u0 + u1) / 2, extra: extra,
            a: [A[0] + (B[0] - A[0]) * u0, A[1] + (B[1] - A[1]) * u0, A[2] + (B[2] - A[2]) * u0],
            b: [A[0] + (B[0] - A[0]) * u1, A[1] + (B[1] - A[1]) * u1, A[2] + (B[2] - A[2]) * u1],
            bands: [], snow: !STEEP[name] && rise < 1.43 && rnd() > 0.25, dab: STEEP[name] && s === 0 && q > 0 };
          var l0 = along + len * u0, l1 = along + len * u1;
          for (var bpos = Math.ceil(l0 / bandAt) * bandAt; bpos < l1; bpos += bandAt) sg.bands.push((bpos - l0) / (l1 - l0));
          segs.push(sg);
        }
        along += len;
      }
    }
    function twig(from, dir, len, riseBy, w, extra) {
      var to = [from[0] + Math.cos(dir) * len, from[1] + Math.sin(dir) * len, from[2] + riseBy, w * 0.5];
      limb([[from[0], from[1], from[2], w], to], 'twig', extra);
      return to;
    }
    (function () {
      Object.keys(LIMBS).forEach(function (name) {
        var pts = LIMBS[name].map(W3);
        limb(pts, name, false);
        if (!/^(stub|leader|D|S1|S4)$/.test(name)) tips.push(pts);
      });
      // Hairlines from every tip: two in leaf, three (each forking again) in winter.
      tips.forEach(function (pts) {
        var tp = pts[pts.length - 1], pv = pts[pts.length - 2], az = Math.atan2(tp[1] - pv[1], tp[0] - pv[0]);
        for (var q = 0; q < 3; q++) {
          var a = az + (q === 2 ? (rnd() - 0.5) * 0.4 : (q ? 1 : -1) * U(25, 40) * DEG),
              e = twig(tp, a, U(1.2, 2.4) * k33, U(0.4, 1.0) * k33, 0.08 * k33, q === 2);
          twig(e, a + (rnd() < 0.5 ? 1 : -1) * U(20, 40) * DEG, U(0.8, 1.6) * k33, U(0.3, 0.8) * k33, 0.05 * k33, true);
        }
      });
      // The trunk: six bands of a shaded cylinder, so leaves sort round it.
      var Wt = 2.07 * k33, top = 12.1 * k33, nb = 6;
      for (var q = 0; q < nb; q++) {
        var z0 = top * q / nb, z1 = top * (q + 1) / nb;
        bands.push({ t: 'T', z0: z0, z1: z1, w0: q === 0 ? Wt * 1.16 : Wt * (1 - 0.04 * z0 / top), w1: Wt * (1 - 0.04 * z1 / top) * (q === nb - 1 ? 1.1 : 1), top: q === nb - 1 });
      }
      for (var z = 0.3 * k33; z < 11.3 * k33; z += 0.54 * K + (rnd() - 0.5) * 0.24 * K) {
        rings.push({ z: z, e: U(0.55, 0.95), split: rnd() < 0.15 });
      }
    })();

    function drawTrunk(b) {
      var bk = sea.winter ? BARKW : BARK, S = cam.S, cb = cam.cb;
      P(mid, mid, b.z0, q0); P(mid, mid, b.z1, q1);
      var W0 = b.w0 * S, W1 = b.w1 * S, Wm = (b.w0 + b.w1) / 2 * S;
      var gr = ctx.createLinearGradient(q0.sx - Wm / 2, 0, q0.sx + Wm / 2, 0);
      bk.trunk.forEach(function (s) { gr.addColorStop(s[0], s[1]); });
      ctx.fillStyle = gr; ctx.beginPath();
      ctx.moveTo(q1.sx - W1 / 2, q1.sy); ctx.lineTo(q0.sx - W0 / 2, q0.sy);
      ctx.ellipse(q0.sx, q0.sy, W0 / 2, Math.max(0.01, W0 / 2 * cb), 0, Math.PI, 0, true);
      ctx.lineTo(q1.sx + W1 / 2, q1.sy);
      ctx.ellipse(q1.sx, q1.sy, W1 / 2, Math.max(0.01, W1 / 2 * cb), 0, 0, Math.PI, b.top);
      ctx.fill();
      // Lenticel rings: shallow dark arcs that mostly stop short of the light.
      if (Wm > 4) {
        ctx.strokeStyle = bk.ring; ctx.globalAlpha = 0.85 * baseAlpha; ctx.lineWidth = Math.max(1, 0.06 * Wm); ctx.beginPath();
        rings.forEach(function (r) {
          if (r.z < b.z0 || r.z >= b.z1) return;
          P(mid, mid, r.z, q2);
          var Wr = Wm, x0 = q2.sx - Wr / 2 + 1, x1 = q2.sx - Wr / 2 + r.e * Wr, sag = 0.1 * Wr * (cb / 0.5);
          ctx.moveTo(x0, q2.sy - 0.02 * Wr);
          if (r.split) {
            var xm = (x0 + x1) / 2;
            ctx.quadraticCurveTo((x0 + xm) / 2, q2.sy + sag, xm - 0.05 * Wr, q2.sy + 0.8 * sag);
            ctx.moveTo(xm + 0.05 * Wr, q2.sy + 0.8 * sag);
            ctx.quadraticCurveTo((xm + x1) / 2, q2.sy + sag, x1, q2.sy + 0.01 * Wr);
          } else ctx.quadraticCurveTo(q2.sx - 0.1 * Wr, q2.sy + sag, x1, q2.sy + 0.01 * Wr);
        });
        ctx.stroke(); ctx.globalAlpha = baseAlpha;
      }
      if (b.top && sea.winter) {   // snow in the crotch
        P(mid, mid, 11.6 * k33, q2);
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(q2.sx, q2.sy, 0.45 * Wm, Math.max(0.5, 0.2 * Wm * cb / 0.5), 0, 0, TAU); ctx.fill();
      }
    }
    function offLine(ax, ay, bx, by, nx, ny, off, w, col, cap) {
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = cap;
      ctx.beginPath(); ctx.moveTo(ax + nx * off, ay + ny * off); ctx.lineTo(bx + nx * off, by + ny * off); ctx.stroke();
    }
    function drawLimb(s) {
      var bk = sea.winter ? BARKW : BARK, D = s.name === 'D';
      P(s.a[0], s.a[1], s.a[2], q0); P(s.b[0], s.b[1], s.b[2], q1);
      var w = s.w * cam.S, ddx = q1.sx - q0.sx, ddy = q1.sy - q0.sy, L = Math.hypot(ddx, ddy) || 1e-6,
          nx = -ddy / L, ny = ddx / L;
      if (nx + ny < 0) { nx = -nx; ny = -ny; }
      if (w < 1.5) {
        ctx.globalAlpha = baseAlpha * Math.min(1, 0.4 + w / 2);
        offLine(q0.sx, q0.sy, q1.sx, q1.sy, 0, 0, 0, Math.max(dpr * 0.75, w), bk.twig, 'round');
        ctx.globalAlpha = baseAlpha;
      } else {
        offLine(q0.sx, q0.sy, q1.sx, q1.sy, 0, 0, 0, w, D ? bk.dBody : bk.body, 'round');
        if (w >= 3) {
          offLine(q0.sx, q0.sy, q1.sx, q1.sy, nx, ny, 0.30 * w, 0.40 * w, D ? bk.dUnder : bk.under, 'butt');
          ctx.globalAlpha = 0.9 * baseAlpha;
          offLine(q0.sx, q0.sy, q1.sx, q1.sy, nx, ny, -0.28 * w, 0.25 * w, D ? bk.dHi : bk.hi, 'butt');
          if (s.w >= 0.4 * k33 && s.bands.length) {   // bark bands across the limb
            ctx.globalAlpha = 0.75 * baseAlpha; ctx.strokeStyle = D ? bk.dBand : bk.band; ctx.lineWidth = Math.max(1, 0.08 * cam.S);
            ctx.lineCap = 'butt'; ctx.beginPath();
            s.bands.forEach(function (f) {
              var cx = q0.sx + ddx * f, cy = q0.sy + ddy * f;
              ctx.moveTo(cx - nx * w / 2, cy - ny * w / 2); ctx.lineTo(cx + nx * w / 2, cy + ny * w / 2);
            });
            ctx.stroke();
          }
          ctx.globalAlpha = baseAlpha;
        }
      }
      if (sea.winter && cam.sb > 0.1) {      // snow along the upper side
        if (s.snow && s.w >= 0.15 * k33) {
          ctx.globalAlpha = 0.95 * baseAlpha;
          offLine(q0.sx, q0.sy, q1.sx, q1.sy, nx, ny, -0.42 * w, 0.45 * w + dpr, '#ffffff', 'round');
          ctx.globalAlpha = baseAlpha;
          offLine(q0.sx, q0.sy, q1.sx, q1.sy, nx, ny, -0.20 * w, 0.15 * w, '#d5dee8', 'butt');
        } else if (s.dab) {
          ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(q0.sx, q0.sy - 0.2 * w, 0.35 * w + 0.5 * dpr, 0, TAU); ctx.fill();
        }
      }
    }

    /* ================= 7. crown ================= */
    // One column of leaves per leaf module, its height set by an upright
    // onion (a narrow spire over a broad dome) with clumpy lobes; leaves sit
    // in even shelves up each column, so holes fall over light modules and
    // the leaves can settle onto the code. Three curtains hang in front of
    // the trunk. Each leaf is a real plane in 3D (yaw and tilt), so it
    // foreshortens and turns as the camera swings.
    var HI_D = [0, 2, 4, 6, 8, 10, 12, 12.9], HI_Z = [30, 29.5, 28, 25, 22.5, 20, 17.5, 15];
    var LO_D = [0, 4, 8, 12.9], LO_Z = [9.5, 11.5, 13, 13.5];
    var PUSH = 1.12, cols = [], leaves = [], twigs = [];
    (function () {
      var ph = [rnd() * TAU, rnd() * TAU, rnd() * TAU, rnd() * TAU];
      leafMods.forEach(function (md) {
        var dI = md.d * PUSH / K, a = md.a, taper = Math.min(1, Math.max(0, (dI - 3) / 4)),
            lob = K * (1.8 * Math.sin(3 * a + ph[0]) + 1.2 * Math.sin(5 * a + ph[1]) + 1.0 * Math.sin(0.9 * dI + ph[2])) * taper;
        var c = { md: md, x: md.x, y: md.y, rx: mid + (md.x + 0.5 - mid) * PUSH, ry: mid + (md.y + 0.5 - mid) * PUSH,
                  hi: K * interp(HI_D, HI_Z, dI) + lob + K * Math.sin(7 * a + ph[3]) * taper + K * U(-1, 1),
                  lo: K * interp(LO_D, LO_Z, dI) + 0.5 * lob + K * U(-1, 1.2), drip: false, front: (md.y - md.x) > 1 };
        cols.push(c);
      });
      // The curtains: one long one in front of the trunk, two shorter.
      function curtain(c, lo, nlo) {
        c.lo = Math.min(c.lo, U(lo[0], lo[1]) * K); c.drip = true;
        cols.forEach(function (o) {
          if (o !== c && Math.hypot(o.x - c.x, o.y - c.y) <= 1.5) { o.lo = Math.min(o.lo, U(nlo[0], nlo[1]) * K); o.drip = true; }
        });
      }
      // Screen-x offset of a column is (X + Y) / sqrt2; in front means Y > X.
      function sx(c) { return Math.abs(c.x + c.y + 1 - 2 * mid) * 0.707; }
      var front = cols.filter(function (c) { return c.front; }).sort(function (a, b) { return a.md.d - b.md.d; });
      var first = front.filter(function (c) { return c.md.d >= 2.3 * K && sx(c) < 1.5; })[0];
      if (first) curtain(first, [0.6, 1.7], [1.1, 4.6]);
      var side = front.filter(function (c) { return c.md.d > 6 * K; }).sort(function (a, b) { return (a.x + a.y) - (b.x + b.y); });
      if (side.length > 4) { curtain(side[0], [4.6, 8], [7, 10.5]); curtain(side[side.length - 1], [4.6, 8], [7, 10.5]); }
      cols.forEach(function (c) {
        c.hi = Math.max(c.hi, c.lo + 1.5);
        var cnt = Math.max(2, Math.round((c.hi - c.lo) / (2.8 * k33)));
        for (var q = 0; q < cnt; q++) {
          var z = c.lo + (c.hi - c.lo) * q / (cnt - 1) + U(-0.45, 0.45);
          var hollow = !c.drip && ((c.md.d < 7.5 * k33 && z < 28 * k33 && rnd() < 0.65) || rnd() < 0.08);
          var l = { t: 'l', col: c, x: c.rx + U(-0.45, 0.45), y: c.ry + U(-0.45, 0.45), z: z, top: q === cnt - 1,
                    psi: rnd() * TAU, r1: rnd(), R: 1.15 * k33 * U(0.85, 1.2), c: Math.floor(rnd() * 4),
                    o: rnd(), acc: rnd() < 0.06, p: rnd() * TAU, hollow: hollow };
          leaves.push(l);
        }
      });
      // Winter: a twig from the nearest bough out to each column's top, so the snow sits on wood.
      var wood = segs.filter(function (s) { return s.name !== 'stub' && s.w < 0.9 * k33 && s.w > 0.06 * k33; });
      cols.forEach(function (c) {
        var tp = [c.rx, c.ry, c.hi - 0.4], best = 1e9, bp = null;
        wood.forEach(function (s) {
          var ab = [s.b[0] - s.a[0], s.b[1] - s.a[1], s.b[2] - s.a[2]], ap = [tp[0] - s.a[0], tp[1] - s.a[1], tp[2] - s.a[2]],
              f = Math.max(0, Math.min(1, (ab[0] * ap[0] + ab[1] * ap[1] + ab[2] * ap[2]) / (ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2] || 1))),
              p = [s.a[0] + ab[0] * f, s.a[1] + ab[1] * f, s.a[2] + ab[2] * f],
              dd = Math.pow(p[0] - tp[0], 2) + Math.pow(p[1] - tp[1], 2) + Math.pow(p[2] - tp[2], 2);
          if (dd < best) { best = dd; bp = p; }
        });
        if (!bp || best > 36) return;
        var m = [(bp[0] + tp[0]) / 2, (bp[1] + tp[1]) / 2, (bp[2] + tp[2]) / 2 + 0.3 + 0.1 * Math.sqrt(best)];
        twigs.push({ t: 's', name: 'twig', extra: true, w: 0.08 * k33, a: bp, b: m, bands: [] });
        twigs.push({ t: 's', name: 'twig', extra: true, w: 0.05 * k33, a: m, b: tp, bands: [] });
      });
    })();

    function leafSprite(l) {
      if (sea.kind === 'flower') return l.acc ? sprite('leaf', '#c6e4b1', '#9ada51') : sprite('flower', sea.leaves[l.c][0], sea.leaves[l.c][1]);
      var pr = sea.leaves[l.c % sea.leaves.length];
      return sprite('leaf', pr[0], pr[1]);
    }
    // A sprite as a plane in the world: eu across it, ev from stalk to tip.
    function plane(img, sx, sy, cps, sps, ct, st, size) {
      var S = cam.S, ex = cps, ey = sps, vx = -sps * ct, vy = cps * ct,
          kk = size / RS,
          Ex = (ex * cam.ca - ey * cam.sa) * S, Ey = (ex * cam.sa + ey * cam.ca) * cam.cb * S,
          Vx = (vx * cam.ca - vy * cam.sa) * S, Vy = ((vx * cam.sa + vy * cam.ca) * cam.cb - st * cam.sb) * S;
      ctx.setTransform(Ex * kk, Ey * kk, -Vx * kk, -Vy * kk, sx, sy);
      ctx.drawImage(img, -SP / 2, -SP / 2);
    }
    function drawLeaf(l, u) {
      // Leaves stand tip-up, roughly facing the viewer (icqr's look), each
      // turned and tilted a little; snow lies flat in every direction.
      var s1 = smooth(0.15, 0.6, u), fl = live ? 1 - s1 : 0, yaw, tilt;
      if (sea.kind === 'snow' && l.top) { yaw = l.psi; tilt = (-8 + 16 * l.r1) * DEG; }
      else { yaw = (45 + (l.psi / TAU - 0.5) * 60) * DEG; tilt = (65 + 65 * l.r1) * DEG; }
      var psi = (yaw + fl * 0.12 * Math.sin(2.6 * clock + l.p)) * (1 - s1), tau = (tilt + fl * 0.08 * Math.sin(3.1 * clock + l.p)) * (1 - s1);
      var a = 1 - smooth(0.6, 0.85, u);
      if (a <= 0) return;
      ctx.globalAlpha = baseAlpha * a * (sea.kind === 'snow' ? 1 : 0.92);
      var cps = Math.cos(psi), sps = Math.sin(psi), ct = Math.cos(tau), st = Math.sin(tau), sz = l.R * (1 - 0.5 * s1);
      if (sea.kind === 'snow' && l.top) {
        plane(sprite('cshadow'), l.sx, l.sy + 0.12 * cam.S, cps, sps, ct, st, sz * 1.1);
        plane(sprite('cushion'), l.sx, l.sy, cps, sps, ct, st, sz * 1.1);
      } else {
        plane(sea.kind === 'snow' ? sprite('leaf', '#c49a6a', '#9a6b45') : leafSprite(l), l.sx, l.sy, cps, sps, ct, st,
              sz * (l.acc && sea.kind === 'flower' ? 0.6 : sea.kind === 'snow' ? 0.7 : 1));
      }
    }
    // The settle: columns of stacked tiles rise under the converging leaves,
    // coded on top and striped mauve on their sides, then sink flat.
    var stripes = [PILLAR, PILLARW].map(function (pl) {
      return [0, 1].map(function (f) {
        var cv = canvasOf(1, 64), g = cv.getContext('2d');
        for (var q = 0; q < 64; q++) { g.fillStyle = mix(pl[Math.floor(rnd() * 3)], '#000000', f * 0.12); g.fillRect(0, q, 1, 1); }
        return cv;
      });
    });
    function drawPillar(c, u) {
      var top = c.hi * (1 - smooth(0.8, 0.99, u)), bot = Math.min(top, c.lo * (1 - smooth(0.5, 0.85, u))), h = top - bot,
          S = cam.S, x0 = c.x, y0 = c.y, st = stripes[sea.winter ? 1 : 0];
      ctx.globalAlpha = smooth(0.45, 0.68, u);
      if (h > 0.05 && cam.sb > 0.01) {
        P(x0, y0, top, q0);
        ctx.setTransform(-S * cam.sa, S * cam.cb * cam.ca, 0, S * cam.sb, q0.sx, q0.sy);
        ctx.drawImage(st[0], 0, 0, 1, h, 0, 0, 1, h);
        P(x0, y0 + 1, top, q1);
        ctx.setTransform(S * cam.ca, S * cam.cb * cam.sa, 0, S * cam.sb, q1.sx, q1.sy);
        ctx.drawImage(st[1], 0, 0, 1, h, 0, 0, 1, h);
      }
      P(x0, y0, top, q0);
      ctx.setTransform(S * cam.ca, S * cam.cb * cam.sa, -S * cam.sa, S * cam.cb * cam.ca, q0.sx, q0.sy);
      ctx.fillStyle = c.md.code; ctx.fillRect(-0.02, -0.02, 1.04, 1.04);
    }

    /* ================= 8. litter and drifts ================= */
    // Leaves and blossom lying under the crown, round the trunk, never in the
    // grass; they never change. Winter has soft drifts instead.
    var litter = [], drifts = [];
    (function () {
      function spot(pin, rout) {
        for (var tries = 0; tries < 40; tries++) {
          var th = rnd() * TAU, rr = (rnd() < pin ? 4 : rout) * K * Math.sqrt(rnd()), px = mid + rr * Math.cos(th), py = mid + rr * Math.sin(th);
          if (px < 0.3 || py < 0.3 || px > n - 0.3 || py > n - 0.3) continue;
          if (mods[Math.floor(py) * n + Math.floor(px)].grass) continue;
          return [px, py];
        }
        return [mid + 2, mid + 2];
      }
      for (var q = 0; q < 60; q++) {
        var p = spot(0.15, 10);
        litter.push({ x: p[0], y: p[1], r: rnd() * TAU, s: U(1.0, 1.4) * K, c: Math.floor(rnd() * 4), a: U(0.55, 1), fl: U(0.7, 0.9) * K });
      }
      for (q = 0; q < 30; q++) {
        var px, py;
        if (rnd() < 0.6) {
          var g = grassMods[Math.floor(rnd() * grassMods.length)];
          px = g.x + 0.5 + U(-1.1, 1.1); py = g.y + 0.5 + U(-1.1, 1.1);
        } else { var sp = spot(0, 14); px = sp[0]; py = sp[1]; if (Math.hypot(px - mid, py - mid) < 5 * K) { px = n - px; } }
        drifts.push({ x: Math.max(0.5, Math.min(n - 0.5, px)), y: Math.max(0.5, Math.min(n - 0.5, py)), r: rnd() * TAU, s: U(0.5, 1.3) * K });
      }
    })();
    function drawLitter(u) {
      var a = 1 - smooth(0.3, 0.8, u);
      if (a <= 0) return;
      var cnt = sea.litterN;
      for (var q = 0; q < cnt; q++) {
        var l = litter[q];
        P(l.x, l.y, 0.01, q0);
        ctx.globalAlpha = baseAlpha * a * (sea.kind === 'flower' ? l.a : 1);
        var spr = sea.kind === 'flower' ? sprite('bloom', sea.leaves[l.c][0], sea.leaves[l.c][1], '#f3e2a0') : leafSprite(l);
        plane(spr, q0.sx, q0.sy, Math.cos(l.r), Math.sin(l.r), 1, 0, sea.kind === 'flower' ? l.fl * 0.55 : l.s * 0.62);
      }
      if (sea.winter) {
        var img = sprite('drift');
        drifts.forEach(function (d) {
          P(d.x, d.y, 0.01, q0);
          ctx.globalAlpha = baseAlpha * a;
          plane(img, q0.sx, q0.sy, Math.cos(d.r), Math.sin(d.r), 1, 0, d.s);
        });
      }
      ctx.globalAlpha = baseAlpha;
    }

    /* ================= 9. falling leaves and petals ================= */
    // A real leaf falls like a pendulum, not a stone. It swings from side to
    // side every couple of seconds: quick and low through the bottom of each
    // swing, almost hanging at its ends, banked into the swing so it narrows
    // and widens as it goes. Now and then it catches the air and tumbles
    // over once, showing its darker back. The shared gusting wind carries
    // them all the same way. It lands flat, lies a few seconds, fades, and
    // another lets go of the crown. Petals are lighter: shorter, quicker
    // swings, slower down, more tumbling.
    var fallers = [], GUST = [0.75, 0.55];
    function gust() { return 0.3 + 0.2 * Math.sin(0.31 * clock) + 0.1 * Math.sin(0.87 * clock + 1.3); }
    function spawn(f, fresh) {
      var src = leaves[Math.floor(Math.random() * leaves.length)];
      for (var tries = 0; tries < 8 && src.hollow; tries++) src = leaves[Math.floor(Math.random() * leaves.length)];
      var petal = sea.kind === 'flower';
      f.x0 = src.x; f.y0 = src.y; f.D = 0;
      f.z = fresh ? 0.6 + Math.random() * (src.z - 0.6) : src.z - 0.3;
      f.t = 0; f.land = 0;
      f.psi = fresh ? Math.random() * TAU : -Math.PI / 2;           // lets go from the end of a swing, at rest
      f.w = TAU / (petal ? 1.5 + 0.7 * Math.random() : 2.4 + 1.0 * Math.random());
      f.A = (petal ? 0.45 + 0.4 * Math.random() : 0.9 + 0.7 * Math.random()) * k33;
      f.v0 = (petal ? 1.05 : 1.6) * (0.85 + 0.3 * Math.random()) * k33;
      f.dir = Math.random() * TAU;
      f.r = Math.random() * TAU; f.spin = (Math.random() - 0.5) * (petal ? 1.2 : 0.6);
      f.flip = 0; f.flipP = petal ? 0.18 : 0.07;                      // tumbles per second
      f.c = Math.floor(Math.random() * 4);
      return f;
    }
    function fall(f, dt) {
      f.t += dt;
      if (f.land > 0) { f.land -= dt; if (f.land <= 0) spawn(f); return; }
      f.psi += f.w * dt;
      var c = Math.cos(f.psi);
      f.z -= f.v0 * (0.12 + 1.25 * c * c) * dt;                       // fast through the bottom, hanging at the ends
      f.D += gust() * dt * k33;
      f.r += f.spin * dt;
      if (f.flip > 0) f.flip = Math.max(0, f.flip - dt / 0.7);
      else if (Math.random() < f.flipP * dt) f.flip = 1;
      var xy = fpos(f);
      if (f.z <= 0.02) { f.z = 0; f.land = 3 + 2 * Math.random(); }
      else if (xy[0] < -1 || xy[1] < -1 || xy[0] > n + 1 || xy[1] > n + 1) spawn(f);
    }
    function fpos(f) {
      var s = f.A * Math.sin(f.psi);
      return [f.x0 + s * Math.cos(f.dir) + GUST[0] * f.D, f.y0 + s * Math.sin(f.dir) + GUST[1] * f.D];
    }
    function drawFaller(f, u) {
      var a = (1 - smooth(0.3, 0.7, u)) * Math.min(1, f.t / 0.4) * (f.land > 0 ? Math.min(1, f.land) : 1);
      if (a <= 0) return;
      var petal = sea.kind === 'flower', size = 1.19 * k33 * (petal ? 0.5 : 0.62);
      // Bank into the swing (narrows the leaf), plus a whole turn while tumbling.
      var q = Math.cos(0.85 * Math.sin(f.psi)) * Math.cos(f.flip * Math.PI * 2), back = q < 0, img;
      if (petal) {
        var pr = sea.leaves[f.c];
        img = back ? sprite('bloom', mix(sea.deep, '#ffffff', 0.25), sea.deep, '#ddd8a6') : sprite('bloom', pr[0], pr[1], '#ddd8a6');
      } else {
        var lp = sea.leaves[f.c % sea.leaves.length];
        img = back ? sprite('leaf', mix(lp[0], sea.back, 0.3), mix(lp[1], sea.back, 0.3)) : sprite('leaf', lp[0], lp[1], '#c8a84a');
      }
      ctx.globalAlpha = baseAlpha * a;
      if (f.land > 0) {   // lying flat on the floor, like the litter
        plane(img, f.sx, f.sy, Math.cos(f.r), Math.sin(f.r), 1, 0, size);
      } else {
        // Tilted toward the way it is swinging, so it glides rather than spins.
        var tilt = f.r + 0.5 * Math.cos(f.psi), k = size * cam.S / RS, cr = Math.cos(tilt), sr = Math.sin(tilt);
        q = Math.max(0.12, Math.abs(q));
        ctx.setTransform(cr * k, sr * k, -sr * k * q, cr * k * q, f.sx, f.sy);
        ctx.drawImage(img, -SP / 2, -SP / 2);
      }
      ctx.globalAlpha = baseAlpha;
    }

    /* ================= 10. rain (autumn) ================= */
    // Straight down through a box over the floor: thin, faint, hard-ended
    // streaks that stop at the floor. Drawn over everything.
    var drops = [], Ztop = 52;
    function newDrop(r, fresh) {
      r.x = -1 + Math.random() * (n + 2); r.y = -1 + Math.random() * (n + 2);
      r.z = fresh ? Math.random() * Ztop : Ztop + Math.random() * 4;
      r.v = 38 * k33 * (0.8 + 0.4 * Math.random()); r.b = Math.floor(Math.random() * 3);
      return r;
    }
    function drawRain(u) {
      var a = 1 - smooth(0.4, 0.97, u), L = 4.4 * k33;
      if (a <= 0) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.strokeStyle = '#6e665c'; ctx.lineWidth = 0.75 * dpr; ctx.lineCap = 'butt';
      [0.07, 0.13, 0.2].forEach(function (al, b) {
        ctx.globalAlpha = al * a * baseAlpha; ctx.beginPath();
        drops.forEach(function (r) {
          if (r.b !== b) return;
          P(r.x, r.y, Math.max(0, r.z), q0); P(r.x, r.y, r.z + L, q1);
          ctx.moveTo(q0.sx, q0.sy); ctx.lineTo(q1.sx, q1.sy);
        });
        ctx.stroke();
      });
      ctx.globalAlpha = baseAlpha;
    }

    /* ================= 11. snowfall (winter) ================= */
    // Flakes of three sizes wander down in the same box, pushed by a gusting
    // wind; they pass behind and in front of the tree (depth-sorted), lie a
    // moment where they land, and melt.
    var flakes = [], WIND = [0.8, 0.6];
    function newFlake(f, fresh) {
      var c = Math.random(), cl = c < 0.55 ? 0 : c < 0.88 ? 1 : 2;
      f.cl = cl; f.x0 = -1 + Math.random() * (n + 2); f.y0 = -1 + Math.random() * (n + 2);
      f.z = fresh ? Math.random() * Ztop : Ztop + Math.random() * 4;
      f.size = [[0.26, 0.36], [0.42, 0.54], [0.58, 0.72]][cl]; f.size = (f.size[0] + Math.random() * (f.size[1] - f.size[0])) / 0.7;
      f.al = [0.8, 0.95, 1][cl];
      f.v = [2.0, 2.4, 2.8][cl] + 0.6 * Math.random();
      f.A = [[0.5, 0.8], [0.35, 0.6], [0.25, 0.45]][cl]; f.A = f.A[0] + Math.random() * (f.A[1] - f.A[0]);
      f.kw = [1, 0.85, 0.7][cl]; f.w = 0.8 + 0.7 * Math.random(); f.th = Math.random() * TAU; f.phi = Math.random() * TAU;
      f.dir = Math.random() * TAU; f.D = 0; f.rest = 0;
      return f;
    }
    function snowStep(f, dt) {
      if (f.rest > 0) { f.rest -= dt; if (f.rest <= 0) newFlake(f); return; }
      var Wt = 0.45 + 0.25 * Math.sin(0.23 * clock) + 0.10 * Math.sin(0.61 * clock + 1.7);
      f.th += f.w * dt; f.D += f.kw * Wt * dt;
      f.z -= f.v * (0.85 + 0.15 * Math.sin(1.7 * f.th)) * dt;
      if (f.z <= 0) { f.z = 0; f.rest = 1.2 + 0.8 * Math.random(); }
    }
    function flakeXY(f) {
      var s1 = f.A * Math.sin(f.th), s2 = 0.35 * f.A * Math.sin(2.3 * f.th + f.phi), L = n + 2,
          px = f.x0 + WIND[0] * f.D + s1 * Math.cos(f.dir) - s2 * Math.sin(f.dir),
          py = f.y0 + WIND[1] * f.D + s1 * Math.sin(f.dir) + s2 * Math.cos(f.dir);
      return [((px + 1) % L + L) % L - 1, ((py + 1) % L + L) % L - 1];
    }
    function drawFlake(f, u) {
      var a = f.al * (1 - smooth(0.3, 0.7, u)) * (f.rest > 0 ? Math.min(1, f.rest / 1.2) : 1);
      if (a <= 0 || f.sx < -8 || f.sy < -8 || f.sx > W + 8 || f.sy > H + 8) return;
      var k = f.size * cam.S / (2 * RS);
      ctx.globalAlpha = baseAlpha * a;
      ctx.setTransform(k, 0, 0, k * (f.rest > 0 ? cam.cb : 1), f.sx, f.sy);
      ctx.drawImage(sprite('flake', '', f.cl === 2 ? 'soft' : ''), -SP / 2, -SP / 2);
      ctx.globalAlpha = baseAlpha;
    }

    /* ================= 12. camera and swing ================= */
    // Orthographic. At rest: azimuth -45 deg, 31 deg up, the floor 0.878 of
    // the canvas across with its centre at 0.721 down. Flat: straight down,
    // the code 0.765 of the canvas, centred. One critically damped spring
    // drives the swing both ways; elevation lags and scale leads.
    var W = 0, H = 0, dpr = 1, cam = {}, S0 = 10, S1 = 10, q0 = {}, q1 = {}, q2 = {};
    function aim(u) {
      var phi = -45 * DEG * (1 - u), e = (31 + 59 * u * u * (2 - u)) * DEG, M = Math.min(W, H);
      cam.ca = Math.cos(phi); cam.sa = Math.sin(phi); cam.cb = Math.sin(e); cam.sb = Math.cos(e);
      cam.S = S0 + (S1 - S0) * (1 - Math.pow(1 - u, 1.6));
      cam.ox = W / 2; cam.oy = (H - M) / 2 + M * (0.721 + (0.5 - 0.721) * u);
    }
    function P(x, y, z, o) {
      var X = x - mid, Y = y - mid, x1 = X * cam.ca - Y * cam.sa, y1 = X * cam.sa + Y * cam.ca;
      o.sx = cam.ox + x1 * cam.S; o.sy = cam.oy + (y1 * cam.cb - z * cam.sb) * cam.S; o.d = y1 * cam.sb + z * cam.cb;
      return o;
    }
    function fit() {
      dpr = window.devicePixelRatio || 1;
      W = canvas.width = Math.round(canvas.clientWidth * dpr);
      H = canvas.height = Math.round(canvas.clientHeight * dpr);
      var M = Math.min(W, H);
      S0 = 0.6208 * M / n; S1 = 0.765 * M / n;
      Ztop = (0.721 * M + 20.5 * REST.cb * S0) / (S0 * REST.sb) + 2;
    }

    /* ================= 13. flat code ================= */
    // Each module keeps one seeded shade: near-whites for light modules, the
    // season's leaf colours inside the crown and grass colours outside it.
    var codeImg = canvasOf(n, n);
    function buildCode() {
      var g = codeImg.getContext('2d');
      mods.forEach(function (md) {
        md.lightCol = pick(FLAT_LIGHT, md.r);
        md.grassCol = pick(sea.grassCode, md.r);
        md.code = md.dark ? (md.grass ? md.grassCol : pick(sea.leafCode, md.r)) : md.lightCol;
        g.fillStyle = md.code; g.fillRect(md.x, md.y, 1, 1);
      });
    }
    function drawCode(a) {
      P(0, 0, 0, q0);
      ctx.globalAlpha = a;
      ctx.imageSmoothingEnabled = false;
      ctx.setTransform(cam.S * cam.ca, cam.S * cam.cb * cam.sa, -cam.S * cam.sa, cam.S * cam.cb * cam.ca, q0.sx, q0.sy);
      ctx.drawImage(codeImg, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.globalAlpha = 1;
    }

    /* ================= the season ================= */
    var sea, seaName = '';
    function season(name) {
      seaName = SEASONS[name] ? name : 'autumn';
      sea = SEASONS[seaName];
      sea.winter = !!sea.snow;
      if (seaName === 'spring') {
        var bl = blossom();
        sea.leaves = bl.leaves; sea.leafCode = bl.code; sea.deep = mix(bl.c, '#000000', 0.12);
        // The petals caught in the grass take the theme colour too.
        sea.blade.acc[0][1] = [mix(bl.c, '#ffffff', 0.15), mix(bl.c, '#ffffff', 0.35), mix(bl.c, '#ffffff', 0.55)];
      }
      buildCode();
      buildFloor();
      fallers = [];
      for (var q = 0; q < sea.fallN; q++) fallers.push(spawn({ t: 'f' }, true));
      drops = [];
      if (sea.rain) for (q = 0; q < 400; q++) drops.push(newDrop({}, true));
      flakes = [];
      if (sea.snow) for (q = 0; q < 240; q++) flakes.push(newFlake({ t: 'k' }, true));
      draw();
    }

    /* ================= drawing ================= */
    var u = 0, vel = 0, target = 0, clock = 0, items = [], live = true, baseAlpha = 1;
    function draw() {
      if (!W) return;
      live = !still.matches;
      aim(u);
      ensureTufts();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, W, H);
      var codeA = smooth(0.9, 0.99, u);
      if (u < 0.99) {
        drawSlab();
        drawFloor(u);
        drawLitter(u);

        // Everything standing, far to near.
        items.length = 0;
        var sw = live ? 1 : 0, wx = 0.707, q;
        bands.forEach(function (b) { P(mid, mid, (b.z0 + b.z1) / 2, b); items.push(b); });
        var sk = sea.winter ? segs.concat(twigs) : segs;
        for (q = 0; q < sk.length; q++) {
          var s = sk[q];
          if (s.extra && !sea.winter) continue;
          P((s.a[0] + s.b[0]) / 2, (s.a[1] + s.b[1]) / 2, (s.a[2] + s.b[2]) / 2, s); items.push(s);
        }
        var s1 = smooth(0.15, 0.6, u);
        for (q = 0; q < leaves.length; q++) {
          var l = leaves[q];
          if (sea.kind === 'snow' ? !(l.top || (l.o < 0.035 && l.z < l.col.hi - 3.5)) : l.hollow) continue;
          var w = sw * 0.26 * Math.pow(Math.max(0, l.z) / 35, 1.5) * Math.sin(TAU * clock / 5.2 + 0.12 * (l.x + l.y)) * (1 - s1),
              cx = l.col.x + 0.5, cy = l.col.y + 0.5;
          P(l.x + (cx - l.x) * s1 + w * wx, l.y + (cy - l.y) * s1 + w * wx, l.z, l);
          items.push(l);
        }
        if (u > 0.45) cols.forEach(function (c) { if (!c.t) c.t = 'p'; P(c.x + 0.5, c.y + 0.5, 0, c); items.push(c); });
        grassMods.forEach(function (md) { md.t = 'g'; P(md.x + 0.5, md.y + 0.5, 0, md); items.push(md); });
        if (live) {
          fallers.forEach(function (f) { var xy = fpos(f); P(xy[0], xy[1], f.z, f); items.push(f); });
          flakes.forEach(function (f) { var xy = flakeXY(f); P(xy[0], xy[1], f.z, f); items.push(f); });
        }
        items.sort(function (a, b) { return a.d - b.d; });
        var woodA = 1 - 0.75 * smooth(0.45, 0.9, u);

        for (q = 0; q < items.length; q++) {
          var it = items[q];
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          baseAlpha = it.t === 's' || it.t === 'T' ? woodA : 1;
          ctx.globalAlpha = baseAlpha;
          if (it.t === 'l') drawLeaf(it, u);
          else if (it.t === 's') drawLimb(it);
          else if (it.t === 'T') drawTrunk(it);
          else if (it.t === 'g') drawTuft(it, u);
          else if (it.t === 'p') drawPillar(it, u);
          else if (it.t === 'f') drawFaller(it, u);
          else drawFlake(it, u);
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = baseAlpha = 1;
        if (live && drops.length) drawRain(u);
      }
      // The code, crisp, as the camera arrives overhead.
      if (codeA > 0) drawCode(u >= 0.99 ? 1 : codeA);
      var B = live && u > 0 && u < 1 ? 3.5 * (canvas.clientWidth / 340) * Math.sin(Math.PI * Math.min(1, Math.max(0, (u - 0.05) / 0.87))) : 0;
      canvas.style.filter = B > 0.05 ? 'blur(' + B.toFixed(2) + 'px)' : '';
    }

    /* ================= 14. frame loop and API ================= */
    // The loop runs only while the card is open.
    var raf = 0, last = 0;
    function frame(now) {
      var dt = Math.min(1 / 30, (now - (last || now)) / 1000);
      last = now; clock += dt;
      if (u !== target || vel) {
        vel += (144 * (target - u) - 24 * vel) * dt; u += vel * dt;
        if (Math.abs(target - u) < 0.004 && Math.abs(vel) < 0.05) { u = target; vel = 0; }
        u = Math.min(1, Math.max(0, u));
      }
      if (u < 0.99) {
        fallers.forEach(function (f) { fall(f, dt); });
        drops.forEach(function (r) { r.z -= r.v * dt; if (r.z <= 0) newDrop(r); });
        flakes.forEach(function (f) { snowStep(f, dt); });
      }
      draw();
      raf = requestAnimationFrame(frame);
    }
    function start() {
      fit();
      draw();
      if (!still.matches && !raf) { last = 0; raf = requestAnimationFrame(frame); }
    }
    function stop() { cancelAnimationFrame(raf); raf = 0; }

    season(seasonNow());
    return {
      season: season,
      start: start,
      stop: stop,
      flat: function (on) { target = on ? 1 : 0; if (still.matches) { u = target; vel = 0; draw(); } }
    };
  };
  window.qrTree.now = seasonNow;
})();
