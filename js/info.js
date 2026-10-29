/* The About section's pieces, after the "Hello." intro.

   EVERY PIECE IS SWITCHABLE. INFO_PIECES below is the whole list, in the
   order they render: delete a name and that piece is gone; move one and it
   moves. 'intro' is the static "Hello." prose already in index.html (the
   only piece that reads with JavaScript off); every other piece is written
   by this file into [data-info-pieces].

   ARCHIVED: 'marble' (ebru, Turkish paper marbling) is built and works, but
   the owner set it aside on 2026-10-24 as off the site's purpose. Its code,
   copy and styles stay; add 'marble' back to INFO_PIECES to show it.

   ALL PERSONAL COPY LIVES IN `COPY`, right below. A piece's label is the
   switch: while it is a plain string the label renders as a draft (dashed
   underline and a "draft" tag, css/info.css), which says the whole piece's
   copy is unapproved. Wrap the label in ok() once you have read it.

   THE BRACELET IS THE SKILLS (2026-10-30; it was a record of the visit).
   SKILLS below is the résumé's Technical Skills section, its six groups in
   its order and words, plus "Beyond code": what its bullets show rather
   than list. Change public/assets/resume.pdf and this together.

   Loads before script.js, whose reveal observer has to see the .reveal
   elements written here. */
var INFO_PIECES = ['intro', 'bracelet'];

(function () {
  'use strict';

  function ok(s) { return { ok: s }; }

  /* ======================= COPY: edit here ======================= */
  var COPY = {
    labels: {
      marble: 'Ebru',
      bracelet: ok('Skills')
    },

    /* Ebru, Turkish paper marbling. */
    marble: {
      intro: 'Ink floats on the tray in today’s three colours. Click to drop it, drag to comb it, then lift the paper. No two sheets come out the same, and nothing is kept.',
      after: 'the drop and comb maths are Aubrey Jaffer’s, from “Mathematical Marbling”'
    }
  };

  /* Each group: its hue (saturation and lightness are measured, below), and
     its skills as [full name, charm icon]. An icon is a key of ICONS below,
     or failing that a short glyph stamped on the charm (TS, λ). On by
     default: the group the roles on the résumé are for. */
  var SKILLS = [
    { name: 'Languages', hue: 212, items: [['Python', 'snake'], ['SQL', 'db'], ['TypeScript', 'TS'], ['JavaScript', '{ }']] },
    { name: 'AI / LLM', hue: 275, on: true, items: [
      ['LLM agents', 'robot'], ['RAG', 'search'], ['Prompt engineering', 'prompt'], ['LLM benchmarking', 'gauge'],
      ['Hugging Face Transformers', 'hug'], ['FLAN-T5', 'sparkle'], ['DistilGPT2', 'drop'], ['Bland AI', 'phone'],
      ['Retell AI', 'mic'], ['PaddleOCR', 'scan'], ['Mistral OCR', 'wind']] },
    { name: 'ML & Data', hue: 150, items: [
      ['PyTorch', 'flame'], ['scikit-learn', 'scatter'], ['OpenCV', 'eye'], ['Pandas', 'grid'], ['NumPy', 'cube'],
      ['Matplotlib', 'line'], ['Plotly', 'bars'], ['Streamlit', 'stream'], ['Power BI', 'pie']] },
    { name: 'Cloud & DevOps', hue: 28, items: [
      ['AWS Lambda', 'λ'], ['SQS', 'queue'], ['DynamoDB', 'bolt'], ['Cognito', 'key'], ['Lex', 'bubble'],
      ['Bedrock', 'rock'], ['Google Cloud', 'cloud'], ['Docker', 'boxes'], ['Git', 'branch'], ['Vercel', 'tri']] },
    { name: 'Web', hue: 340, items: [
      ['Next.js', 'N'], ['React', 'atom'], ['React Native', 'mobile'], ['Vite', 'diamond'], ['Tailwind', 'waves'],
      ['Supabase', 'zap'], ['REST APIs', 'plug'], ['OAuth 2.0', 'lock']] },
    { name: 'Automation & Outreach', hue: 186, items: [
      ['Google Maps Places API', 'pin'], ['Selenium', 'cursor'], ['BeautifulSoup', 'soup'], ['Instantly.ai', 'plane'],
      ['Woodpecker', 'leaf'], ['Email deliverability (SPF, DKIM, DMARC)', 'mail']] },
    // Not on the résumé's list; each is something one of its bullets did.
    { name: 'Beyond code', hue: 48, items: [
      ['Technical writing', 'pen'], ['Client delivery', 'gift'],
      ['Reporting for a sales team', 'clip'], ['Trade-offs on evidence', 'scales']] }
  ];
  /* ===================== end of COPY ===================== */

  var root = document.documentElement;

  /* A COPY entry as HTML: escaped, then the draft wrapper unless approved. */
  function t(entry) {
    var approved = entry && typeof entry === 'object' && 'ok' in entry;
    var html = esc(approved ? entry.ok : entry);
    return approved ? html : '<span class="is-draft" data-draft>' + html + '</span>';
  }

  /* ================================================================
     The pieces
     ================================================================ */

  /* ---------- ebru ----------
     Aubrey Jaffer's "Mathematical Marbling": every drop of ink is a circle,
     and a new drop at C of radius r pushes every point P already on the tray
     to C + (P - C) * sqrt(1 + r^2 / |P - C|^2), which keeps the area of
     everything else. A comb tine along unit direction M through B moves P
     by M * z * u^d, d being P's distance from the tine's line; a stylus
     dragged by hand is the same with d measured to the stylus's tip, so it
     only moves ink near the pointer. Ink is kept
     as polygons in tray units (600 x 400) and painted in drop order, in the
     day's three Wada colours. */
  var TW = 600, TH = 400;
  function marble(el) {
    var M = COPY.marble;
    el.innerHTML =
      '<div class="eb">' +
        '<p class="eb__intro">' + esc(M.intro) + '</p>' +
        '<div class="eb__tray"><canvas class="eb__canvas" role="img" aria-label="A marbling tray" data-eb-canvas data-cue="Click to drop ink · drag to comb"></canvas>' +
          '<p class="eb__lifted" data-eb-lifted hidden></p></div>' +
        '<div class="eb__bar">' +
          '<button type="button" class="fd__btn" data-eb="drop">Drop ink</button>' +
          '<button type="button" class="fd__btn" data-eb="comb">Comb it</button>' +
          '<button type="button" class="fd__btn" data-eb="lift">Lift the paper</button>' +
          '<button type="button" class="eb__reset" data-eb="new">New tray</button>' +
        '</div>' +
        '<p class="ip__after">' + esc(M.after) + '</p>' +
      '</div>';
    var canvas = el.querySelector('[data-eb-canvas]'), ctx = canvas.getContext('2d');
    var tray = el.querySelector('.eb__tray'), lifted = el.querySelector('[data-eb-lifted]');
    var drops = [], turn = 0, done = false;
    var TONES = ['--graph-projects', '--graph-hobbies', '--graph-name'];

    function size() {
      var w = canvas.clientWidth, dpr = window.devicePixelRatio || 1;
      if (!w) return;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(w * TH / TW * dpr);
      paint();
    }
    function paint() {
      var s = canvas.width / TW;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = getComputedStyle(canvas).getPropertyValue('--eb-water').trim() || '#eee';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(s, 0, 0, s, 0, 0);
      drops.forEach(function (d) {
        ctx.fillStyle = d.c;
        ctx.beginPath();
        d.p.forEach(function (pt, i) { if (i) ctx.lineTo(pt[0], pt[1]); else ctx.moveTo(pt[0], pt[1]); });
        ctx.closePath();
        ctx.fill();
      });
    }
    function drop(cx, cy, r) {
      var r2 = r * r;
      drops.forEach(function (d) {
        d.p.forEach(function (pt) {
          var dx = pt[0] - cx, dy = pt[1] - cy, k = Math.sqrt(1 + r2 / (dx * dx + dy * dy || 1e-6));
          pt[0] = cx + dx * k; pt[1] = cy + dy * k;
        });
      });
      // Ink pushed wholly off the tray is gone for good.
      drops = drops.filter(function (d) { return d.p.some(function (pt) { return pt[0] > 0 && pt[0] < TW && pt[1] > 0 && pt[1] < TH; }); });
      var pts = [], n = 120;
      for (var i = 0; i < n; i++) pts.push([cx + r * Math.cos(i / n * 2 * Math.PI), cy + r * Math.sin(i / n * 2 * Math.PI)]);
      drops.push({ c: getComputedStyle(root).getPropertyValue(TONES[turn++ % TONES.length]).trim() || '#555', p: pts });
      paint();
    }
    // tip: false for a whole tine (distance to the line), true for a stylus
    // (distance to the point). Long edges are split afterwards so a pulled
    // curve stays a curve.
    function comb(bx, by, mx, my, z, tip) {
      var u = Math.pow(0.5, 1 / (tip ? 14 : 10));
      drops.forEach(function (d) {
        d.p.forEach(function (pt) {
          var dist = tip ? Math.hypot(pt[0] - bx, pt[1] - by) : Math.abs((pt[0] - bx) * -my + (pt[1] - by) * mx);
          var k = z * Math.pow(u, dist);
          pt[0] += mx * k; pt[1] += my * k;
        });
        // ponytail: capped at 4000 points a drop; past that edges stay long.
        if (d.p.length > 4000) return;
        var out = [];
        d.p.forEach(function (pt, i) {
          var nx = d.p[(i + 1) % d.p.length];
          out.push(pt);
          if (Math.hypot(nx[0] - pt[0], nx[1] - pt[1]) > 6) out.push([(pt[0] + nx[0]) / 2, (pt[1] + nx[1]) / 2]);
        });
        d.p = out;
      });
      paint();
    }
    function at(e) {
      var r = canvas.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width * TW, (e.clientY - r.top) / r.height * TH];
    }
    var down = null, moved = false;
    canvas.addEventListener('pointerdown', function (e) {
      if (done) return;
      down = at(e); moved = false;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!down) return;
      var p = at(e), dx = p[0] - down[0], dy = p[1] - down[1], len = Math.hypot(dx, dy);
      if (len < 3) return;
      moved = true;
      comb(p[0], p[1], dx / len, dy / len, len * 0.8, true);
      down = p;
    });
    canvas.addEventListener('pointerup', function () {
      if (down && !moved) drop(down[0], down[1], 26 + Math.random() * 30);
      down = null;
    });
    canvas.addEventListener('pointercancel', function () { down = null; });

    var actions = {
      drop: function () { drop(60 + Math.random() * (TW - 120), 50 + Math.random() * (TH - 100), 30 + Math.random() * 40); },
      // One pass of a seven-tine comb, alternate tines pulled opposite ways.
      comb: function () {
        if (!drops.length) return;
        for (var tine = 0; tine < 7; tine++) comb(0, (tine + 0.5) * TH / 7, tine % 2 ? -1 : 1, 0, 34, false);
      },
      lift: function () {
        if (!drops.length) return;
        done = true;
        tray.classList.add('is-lifted');
        lifted.textContent = 'Lifted at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · one of one';
        lifted.hidden = false;
      },
      'new': function () {
        drops = []; turn = 0; done = false;
        tray.classList.remove('is-lifted');
        lifted.hidden = true;
        paint();
      }
    };
    el.querySelector('.eb__bar').addEventListener('click', function (e) {
      var b = e.target.closest('[data-eb]');
      if (!b) return;
      var a = b.getAttribute('data-eb');
      if (done && a !== 'new') return;
      actions[a]();
    });
    new ResizeObserver(size).observe(canvas);
    window.addEventListener('themechange', paint);
  }

  /* ---------- the bracelet: skills ----------
     The group toggles, then the chain: one charm per skill in the selected
     groups, as a real list (css/info.css draws the links, the bails and the
     medals), so every name is text and is read out. Each charm is a medal
     in one of four shapes, taken in turn, with an icon for its skill cut out
     of it, and the skill's full name under it.

     A group's colour is its hue at a fixed saturation, stepped by
     js/palette.js's meet() until it measures 4.5:1 against the page ground,
     and walked again whenever the ground changes. The icon is drawn in the
     ground colour, so it reads at the same 4.5:1. */
  var ICONS = {
    snake: 'M6 19c0-3 3-3.5 6-3.5s6-.5 6-3.5-3-3.5-6-3.5-6-.5-6-3.5S9 2 12 2h3M16 2.5h.01',
    db: 'M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3zM5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3',
    robot: 'M6 9h12v10H6zM12 5v4M12 4h.01M9.5 13h.01M14.5 13h.01M10 16h4M3 12v4M21 12v4',
    search: 'M10.5 4a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13M15.5 15.5L20 20M8 9h5M8 12h3',
    prompt: 'M4 5h16v11H9l-4 4v-4H4zM8 9l2 2-2 2M12 13h4',
    gauge: 'M4 17a8 8 0 1 1 16 0M12 17l4-5M7 17h.01M17 17h.01M12 9h.01',
    hug: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M9 10h.01M15 10h.01M8.5 14c2 2 5 2 7 0',
    sparkle: 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 3v4M17 5h4',
    drop: 'M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11zM9.5 15a2.5 2.5 0 0 0 2.5 2.5',
    phone: 'M6 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 4 5a2 2 0 0 1 2-2z',
    mic: 'M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6',
    scan: 'M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M7 9h10M7 12h10M7 15h6',
    wind: 'M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7',
    flame: 'M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.5 2 1.5 3 2.5 3 0-3-1-5.5.5-8.5z',
    scatter: 'M4 20h16M4 20V4M8 15h.01M11 11h.01M14 13h.01M16 8h.01M18 6h.01M9 9h.01',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6',
    grid: 'M4 4h16v16H4zM4 10h16M4 15h16M10 4v16',
    cube: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5',
    line: 'M4 20h16M4 20V4M7 15l4-5 3 3 5-7',
    bars: 'M4 20h16M7 20v-6M11 20V8M15 20v-9M19 20V5',
    stream: 'M3 8c3-3 6 3 9 0s6 3 9 0M3 13c3-3 6 3 9 0s6 3 9 0M3 18c3-3 6 3 9 0s6 3 9 0',
    pie: 'M11 4a8 8 0 1 0 9 9h-9zM14 3v7h7a7 7 0 0 0-7-7z',
    queue: 'M3 6h11v4H3zM3 14h11v4H3zM19 7v10M17 15l2 2 2-2',
    bolt: 'M13 3L5 13h6l-1 8 8-10h-6z',
    key: 'M8 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8M12 12h9M17 12v3M20 12v2',
    bubble: 'M4 5h16v10H10l-5 4v-4H4zM8 10h8',
    rock: 'M3 19l5-8 3 4 3-7 7 11z',
    cloud: 'M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z',
    boxes: 'M3 12h18v7H3zM5 8h4v4H5zM10 8h4v4h-4zM15 8h4v4h-4zM10 4h4v4h-4z',
    branch: 'M6 3v13M18 8a2.5 2.5 0 1 0 0-.01M6 19a2.5 2.5 0 1 0 0-.01M18 10.5c0 4-6 3.5-12 5.5',
    tri: 'M12 4l9 16H3z',
    atom: 'M12 11h.01M3 12c0-2.2 4-4 9-4s9 1.8 9 4-4 4-9 4-9-1.8-9-4zM7.5 4.2c1.9-1.1 5.7 1.4 8.2 5.8s2.9 8.6 1 9.8-5.7-1.4-8.2-5.8-2.9-8.6-1-9.8z',
    mobile: 'M7 3h10v18H7zM11 18h2M10 5h4',
    diamond: 'M12 3l8 9-8 9-8-9zM8 12h8',
    waves: 'M4 10c2-4 5-4 8 0s6 4 8 0M4 16c2-4 5-4 8 0s6 4 8 0',
    zap: 'M14 2L6 13h5l-2 9 9-12h-6z',
    plug: 'M9 3v5M15 3v5M7 8h10v4a5 5 0 0 1-10 0zM12 17v4',
    lock: 'M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3M12 15v2',
    pin: 'M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12zM12 6.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5',
    cursor: 'M5 3l13 6-6 2-2 6zM13 13l6 6',
    soup: 'M3 11h18a9 9 0 0 1-18 0zM8 4c-1 1.5 1 2.5 0 4M12 4c-1 1.5 1 2.5 0 4M16 4c-1 1.5 1 2.5 0 4',
    plane: 'M21 3L3 10l7 3 3 7zM10 13l11-10',
    leaf: 'M5 19c0-9 6-14 14-14 0 8-5 14-14 14zM5 19l8-8',
    mail: 'M3 6h18v12H3zM3 6l9 7 9-7',
    pen: 'M14 4l6 6L9 21H3v-6zM12 6l6 6',
    gift: 'M4 9h16v4H4zM5 13h14v8H5zM12 9v12M12 9C10 5 6 6 8 8.5M12 9c2-4 6-3 4-.5',
    clip: 'M7 4h10v17H7zM9.5 3h5v3h-5zM10 17v-3M12 17v-6M14 17v-4',
    scales: 'M12 4v16M8 20h8M5 7h14M5 7l-3 6h6zM19 7l-3 6h6z'
  };
  var SHAPES = ['round', 'hex', 'shield', 'square'];
  function medal(icon, shape) {
    var d = ICONS[icon];
    return '<span class="bz__medal bz__medal--' + shape + '"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      (d ? '<path class="bz__icon" d="' + d + '"/>'
         : '<text class="bz__glyph" x="12" y="12"' + (icon.length < 2 ? ' style="font-size:16px"' : '') + '>' + esc(icon) + '</text>') +
      '</svg></span>';
  }

  function bracelet(el) {
    el.innerHTML =
      '<div class="bz">' +
        '<ul class="bz__groups" role="list" aria-label="Skill groups">' + SKILLS.map(function (g, k) {
          return '<li style="--charm: var(--skill-' + k + ', var(--accent-deep))">' +
            '<button type="button" class="bz__toggle" data-g="' + k + '" aria-pressed="' + !!g.on + '">' +
              '<span class="bz__dot" aria-hidden="true"></span>' + esc(g.name) +
              '<span class="bz__n">' + g.items.length + '</span></button></li>';
        }).join('') + '</ul>' +
        '<ul class="bz__chain" aria-label="Skills on the chain"></ul>' +
      '</div>';
    var chain = el.querySelector('.bz__chain');
    var hung = {};          // skill name -> already on the chain, so only new ones swing in

    function draw() {
      var html = '', now = {}, fresh = 0, n = 0;
      SKILLS.forEach(function (g, k) {
        if (!g.on) return;
        g.items.forEach(function (s) {
          var isNew = !hung[s[0]];
          now[s[0]] = true;
          html += '<li class="bz__charm' + (isNew ? ' is-fresh' : '') + '" style="--charm: var(--skill-' + k + ', var(--accent-deep))">' +
            '<span class="bz__hang"' + (isNew ? ' style="animation-delay: ' + Math.min(1.2, fresh++ * 0.05).toFixed(2) + 's"' : '') + '>' +
              medal(s[1], SHAPES[n++ % SHAPES.length]) + '<span class="bz__name">' + esc(s[0]) + '</span></span></li>';
        });
      });
      hung = now;
      chain.innerHTML = html;
    }

    el.querySelector('.bz__groups').addEventListener('click', function (e) {
      var b = e.target.closest('[data-g]');
      if (!b) return;
      var grp = SKILLS[+b.getAttribute('data-g')];
      grp.on = !grp.on;
      b.setAttribute('aria-pressed', String(grp.on));
      draw();
    });

    var P = window.portfolioPalette;
    if (P) {
      P.on(function (st) {
        SKILLS.forEach(function (grp, k) {
          var c = P.meet({ h: grp.hue, s: 70, l: 50 }, 4.5, st.dark, st.groundLum, st.dark ? 56 : 30, st.dark ? 80 : 46);
          el.style.setProperty('--skill-' + k, P.css(c));
        });
      });
    }
    draw();
  }

  var BUILD = { marble: marble, bracelet: bracelet };

  function init() {
    var host = document.querySelector('[data-info-pieces]');
    if (!host || typeof esc !== 'function') return;
    var intro = document.querySelector('.info__intro');
    if (intro && INFO_PIECES.indexOf('intro') < 0) intro.hidden = true;
    var n = 0;
    INFO_PIECES.forEach(function (name) {
      if (name !== 'intro' && !BUILD[name]) return;
      if (name === 'intro' && !intro) return;
      if (name !== 'intro') n++;
      var wrap = document.createElement('section');
      wrap.className = 'ip ip--' + name;
      // The intro is its own heading ("Hello."), so it carries no label.
      if (name !== 'intro') {
        wrap.setAttribute('aria-labelledby', 'ip-' + name);
        wrap.innerHTML = '<h3 class="ip__label reveal" id="ip-' + name + '"><span class="ip__no">' + (n < 10 ? '0' : '') + n + '</span>' + t(COPY.labels[name] || name) + '</h3>';
      }
      if (name === 'intro') {
        wrap.appendChild(intro);   // keeps its own .reveal
      } else {
        var body = document.createElement('div');
        body.className = 'ip__body reveal';
        wrap.appendChild(body);
        try { BUILD[name](body); } catch (err) { wrap.remove(); return; }
      }
      host.appendChild(wrap);
    });
  }

  window.onReady(init);
})();
