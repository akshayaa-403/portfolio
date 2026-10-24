/* The Info section's pieces, after the "Hello." intro.

   EVERY PIECE IS SWITCHABLE. INFO_PIECES below is the whole list, in the
   order they render: delete a name and that piece is gone; move one and it
   moves. 'intro' is the static "Hello." prose already in index.html (the
   only piece that reads with JavaScript off); every other piece is written
   by this file into [data-info-pieces].

   ARCHIVED: 'marble' (ebru, Turkish paper marbling) is built and works, but
   the owner set it aside on 2026-10-24 as off the site's purpose. Its code,
   copy and styles stay; add 'marble' back to INFO_PIECES to show it. The
   fold-in, the dice bio and the Lialina frames were deleted the same day.

   ALL PERSONAL COPY LIVES IN `COPY`, right below, and was DRAFTED by an
   assistant from facts already on this site. A piece's label is the switch:
   while it is a plain string the label renders as a draft (dashed underline
   and a "draft" tag, css/info.css), which says the whole piece's copy is
   unapproved. Wrap the label in ok() once you have read and edited the
   piece's lines:
       marble: ok('Ebru'),

   THE BRACELET IS THIS VISIT. Every thing the visitor touches anywhere on
   the page — a book, a photograph, the lamp, the curtains, the record —
   hangs one charm on it (`hang()` below, fed by one listener on the
   document and the desk's drops). Nothing is
   stored: a reload starts a new bracelet.

   Reads project-data.js, hobby-data.js and readings-data.js, so it loads
   after them, after lightbox.js (whose open() it listens to), and before
   script.js, whose reveal observer has to see the .reveal elements written
   here. */
var INFO_PIECES = ['intro', 'bracelet'];

(function () {
  'use strict';

  function ok(s) { return { ok: s }; }

  /* ======================= COPY: edit here ======================= */
  var COPY = {
    labels: {
      marble: 'Ebru',
      bracelet: ok('This visit, on a chain')
    },

    /* Ebru, Turkish paper marbling. */
    marble: {
      intro: 'Ink floats on the tray in today’s three colours. Click to drop it, drag to comb it, then lift the paper. No two sheets come out the same, and nothing is kept.',
      after: 'the drop and comb maths are Aubrey Jaffer’s, from “Mathematical Marbling”'
    },

    bracelet: {
      empty: 'Nothing on it yet. Everything you touch on this page hangs a charm here: a book off the shelf, a photograph, the lamp, the curtains, the record. Reload and it starts again.',
      note: 'Kept for this visit only. Reload and it starts again.'
    }
  };
  /* ===================== end of COPY ===================== */

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* A COPY entry as HTML: escaped, then the draft wrapper unless approved. */
  function t(entry) {
    var approved = entry && typeof entry === 'object' && 'ok' in entry;
    var html = esc(approved ? entry.ok : entry);
    return approved ? html : '<span class="is-draft" data-draft>' + html + '</span>';
  }

  /* ================================================================
     The visit: what the visitor has touched, in order. In memory only.
     ================================================================ */

  /* Charm faces: 24-unit line drawings. Projects, galleries and shelf
     topics by their id; everything else by what was done. Anything without
     a face gets its initial. */
  var ICON = {
    'quantamental-screener': 'M4 17l5-5 3 3 7-7M15 8h4v4',
    'phase-contrast-denoising': 'M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16M12 9.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5',
    'arteza': 'M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5',
    'habita': 'M4 4h16v16H4zM12 4v16M4 12h16',
    'photography': 'M4 8h3l2-3h6l2 3h3v11H4zM12 10a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7',
    'artwork': 'M5 19l1-4L16 5l3 3L9 18zM14 7l3 3',
    'cooking': 'M4 11h16v2a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6zM2 11h2M20 11h2M9 4v4M12 3v5M15 4v4',
    'Self-help and psychology': 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
    'Finance and economics': 'M6 7a6 2.5 0 1 0 12 0a6 2.5 0 1 0-12 0M6 7v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V7M6 12v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-5',
    'History, politics and essays': 'M4 20h16M6 17h12M7 17V10M12 17V10M17 17V10M4 10h16L12 4z',
    'Fiction': 'M12 6c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5zM12 6v13',
    lamp: 'M8 3h8l3 7H5zM12 10v8M8 21h8',
    record: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 10a2 2 0 1 0 0 4a2 2 0 1 0 0-4',
    curtain: 'M3 4h18M6 4c0 6 2 12 4 16M18 4c0 6-2 12-4 16',
    terminal: 'M4 5h16v14H4zM7 10l3 2-3 2M12 15h5',
    card: 'M3 7h18v11H3zM6 11h7M6 14h5',
    sun: 'M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',
    move: 'M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3',
    marble: 'M3 7c3-5 6 5 9 0s6 5 9 0M3 12c3-5 6 5 9 0s6 5 9 0M3 17c3-5 6 5 9 0s6 5 9 0',
    mail: 'M3 6h18v12H3zM3 6l9 7 9-7',
    link: 'M10 14l4-4M8 12l-2 2a3 3 0 0 0 4 4l2-2M16 12l2-2a3 3 0 0 0-4-4l-2 2',
    word: 'M5 6h14M5 12h14M5 18h9',
    tidy: 'M14 3l-5 9M5 12h8l2 9H3z'
  };
  /* Which of the day's colours a kind of charm wears. */
  var TONE = { work: '--graph-projects', hobby: '--graph-hobbies', shelf: '--graph-name', act: '--accent-deep' };

  var visit = [];          // [{ key, label, kind, icon }]
  var seenKeys = {};
  var listeners = [];
  function hang(key, label, kind, icon) {
    if (seenKeys[key]) return;
    seenKeys[key] = true;
    visit.push({ key: key, label: label, kind: kind || 'act', icon: icon });
    listeners.forEach(function (fn) { fn(); });
  }

  var BOOKS = [];
  if (typeof readings !== 'undefined' && readings.groups) {
    readings.groups.forEach(function (g) { g.books.forEach(function (b) { BOOKS.push({ title: b.title, topic: g.topic }); }); });
  }
  function caption(g, i) {
    var G = typeof hobbies !== 'undefined' && hobbies[g];
    return (G && G.captions && G.captions[i - 1]) || (G ? G.label + ' ' + i : g + ' ' + i);
  }
  function projectTitle(id) {
    var p = (typeof projects !== 'undefined' ? projects : []).filter(function (x) { return x.id === id; })[0];
    return p ? p.title : id;
  }

  /* One listener for every click on the page, in the capture phase so a
     handler that stops the event still counts. Each rule: selector → charm
     as [key, label, kind, icon], first match wins. */
  var CLICKS = [
    ['.book[data-book]', function (el) {
      var b = BOOKS[+el.getAttribute('data-book')];
      return b && ['book:' + b.title, 'Took ' + b.title + ' off the shelf', 'shelf', b.topic];
    }],
    ['[data-curtains]', function () {
      var desk = document.querySelector('.desk');
      return desk && desk.classList.contains('is-shut') ? ['curtains-open', 'Opened the curtains', 'act', 'curtain']
        : ['curtains', 'Drew the curtains', 'act', 'curtain'];
    }],
    ['.prop--lamp-btn, .lightpull', function () { return ['lamp', 'Switched the lamp', 'act', 'lamp']; }],
    ['.player__play', function () { return ['record', 'Played the record', 'act', 'record']; }],
    ['.share__btn', function (el) {
      return /go/.test(el.className) ? ['airdrop', 'Accepted the AirDrop', 'act', 'link'] : ['airdrop-no', 'Declined the AirDrop', 'act', 'link'];
    }],
    ['[data-cards]', function () { return ['card', 'Took a business card', 'act', 'card']; }],
    ['[data-term-open]', function () { return ['terminal', 'Opened the terminal', 'act', 'terminal']; }],
    ['[data-time-pick]', function (el) {
      var v = el.getAttribute('data-time-pick');
      return ['time:' + v, v === 'auto' ? 'Gave the light back to the clock' : 'Changed the light to ' + (v === 'day' ? 'afternoon' : v), 'act', 'sun'];
    }],
    ['.flap', function () { return ['flap', 'Shuffled a word', 'act', 'word']; }],
    ['.term', function () { return ['term', 'Asked for another ending', 'act', 'word']; }],
    ['.desk__tidy', function () { return ['tidy', 'Tidied the desk', 'act', 'tidy']; }],
    ['a[href^="mailto:"]', function () { return ['mail', 'Started an email', 'act', 'mail']; }],
    ['a[target="_blank"]', function (el) {
      var name = (el.textContent || '').trim().replace(/\s+/g, ' ') || 'a link';
      return ['out:' + name, 'Opened ' + name, 'act', 'link'];
    }]
  ];
  /* Names for what the desk says was picked up and put down. */
  var MOVED = [
    ['[data-mug]', 'the mug'], ['.prop--lamp-btn', 'the lamp'], ['.pola', 'a Polaroid'],
    ['.cards', 'the card holder'], ['[data-plant]', 'the plant'], ['.chip', 'the paint chip'],
    ['.obj--player', 'the record player'], ['.obj--share', 'the AirDrop card']
  ];

  function listen() {
    document.addEventListener('click', function (e) {
      if (!e.target.closest) return;
      for (var i = 0; i < CLICKS.length; i++) {
        var el = e.target.closest(CLICKS[i][0]);
        if (!el) continue;
        var c = CLICKS[i][1](el);
        if (c) hang(c[0], c[1], c[2], c[3]);
        return;
      }
    }, true);

    // A project row counts once the pointer has rested on it: clicking one
    // leaves the page, and with it this visit.
    var rest = null;
    document.addEventListener('pointerover', function (e) {
      var row = e.target.closest && e.target.closest('a.rm');
      clearTimeout(rest);
      if (!row) return;
      var m = /work\/([^.\/]+)\.html/.exec(row.getAttribute('href') || '');
      if (!m) return;
      rest = setTimeout(function () { hang('work:' + m[1], 'Read about ' + projectTitle(m[1]), 'work', m[1]); }, 700);
    });

    if (window.portfolioDesk) {
      window.portfolioDesk.on('drop', function (el) {
        for (var i = 0; i < MOVED.length; i++) {
          if (el.matches(MOVED[i][0])) { hang('move:' + MOVED[i][1], 'Moved ' + MOVED[i][1], 'act', 'move'); return; }
        }
      });
    }

    // Every photograph on the page opens through the shared popover.
    var lb = window.portfolioLightbox;
    if (lb && lb.open) {
      var open = lb.open;
      lb.open = function (g, i) {
        var r = open.apply(lb, arguments);
        if (r !== false) hang('photo:' + g + ':' + i, 'Looked at ' + caption(g, i), 'hobby', g);
        return r;
      };
    }
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
      hang('marble', 'Dropped ink on the tray', 'act', 'marble');
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
        hang('marble-comb', 'Combed the ink', 'act', 'marble');
      },
      lift: function () {
        if (!drops.length) return;
        done = true;
        tray.classList.add('is-lifted');
        lifted.textContent = 'Lifted at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · one of one';
        lifted.hidden = false;
        hang('marble-lift', 'Lifted a marbled sheet', 'act', 'marble');
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

  /* ---------- the bracelet ----------
     One charm per thing touched, hung along a sagging chain in the order it
     happened. Charms put on while the bracelet was off screen swing when it
     comes into view, so the visitor sees them arrive. */
  function bracelet(el) {
    var B = COPY.bracelet;
    el.innerHTML =
      '<div class="bz">' +
        '<svg class="bz__svg" viewBox="0 0 600 250" aria-hidden="true" focusable="false" data-bz-svg></svg>' +
        '<div class="bz__side">' +
          '<p class="bz__empty" data-bz-empty>' + esc(B.empty) + '</p>' +
          '<ol class="bz__list" data-bz-list></ol>' +
          '<p class="ip__after" data-bz-note hidden>' + esc(B.note) + '</p>' +
        '</div>' +
      '</div>';
    var svg = el.querySelector('[data-bz-svg]'), list = el.querySelector('[data-bz-list]');
    var empty = el.querySelector('[data-bz-empty]'), note = el.querySelector('[data-bz-note]');
    var shown = 0, inView = false;

    var P0 = [36, 40], P1 = [300, 196], P2 = [552, 40];
    function at(t) {
      var u = 1 - t;
      return [u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0], u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1]];
    }
    function face(icon, r) {
      var d = ICON[icon];
      if (!d) return '<text class="bz__initial" y="' + (r * 0.36) + '" font-size="' + r + '">' + esc(String(icon || '·').charAt(0)) + '</text>';
      var s = r * 1.1 / 24;
      return '<path class="bz__icon" transform="translate(' + (-12 * s) + ' ' + (-12 * s) + ') scale(' + s + ')" d="' + d + '"/>';
    }
    function draw() {
      var n = visit.length;
      // Smaller charms as the chain fills, so neighbours never overlap.
      var r = Math.max(7, Math.min(24, 470 / (n * 2.3 || 1)));
      var bail = Math.max(8, r * 0.7);
      var d = 'M' + P0 + 'Q' + P1 + ' ' + P2;
      var g = '<path class="bz__link" d="' + d + '"/><path class="bz__hole" d="' + d + '"/>' +
        '<circle class="bz__clasp" cx="' + P0[0] + '" cy="' + P0[1] + '" r="9"/>' +
        '<circle class="bz__clasp" cx="' + P2[0] + '" cy="' + P2[1] + '" r="6"/>';
      visit.forEach(function (c, i) {
        var p = at((i + 1) / (n + 1)), fresh = inView && i >= shown;
        g += '<g transform="translate(' + Math.round(p[0]) + ' ' + Math.round(p[1]) + ')"><g class="bz__charm' + (fresh ? ' is-fresh' : '') +
          '" style="--charm: var(' + TONE[c.kind] + ')' + (fresh ? '; animation-delay: ' + Math.min(1.2, (i - shown) * 0.08).toFixed(2) + 's' : '') + '">' +
          '<circle class="bz__ring" cy="3" r="3"/><line class="bz__bail" y1="6" y2="' + bail + '"/>' +
          '<g transform="translate(0 ' + (bail + r) + ')"><circle class="bz__face" r="' + r + '"/>' + face(c.icon, r) + '</g></g></g>';
      });
      // The tag carries the date of this visit.
      var day = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();
      g += '<g transform="translate(' + P2[0] + ' ' + (P2[1] + 6) + ')"><g class="bz__tag"><line class="bz__bail" y2="12"/>' +
        '<rect x="-13" y="12" width="26" height="62" rx="8"/>' +
        '<text class="bz__engraved" transform="translate(-3.5 43) rotate(90)">' + esc(day) + '</text></g></g>';
      svg.innerHTML = g;
      list.innerHTML = visit.map(function (c) {
        return '<li class="bz__item"><svg class="bz__dot" viewBox="-12 -12 24 24" aria-hidden="true" focusable="false" style="--charm: var(' + TONE[c.kind] + ')">' +
          '<circle class="bz__face" r="11"/>' + face(c.icon, 11) + '</svg>' + esc(c.label) + '</li>';
      }).join('');
      empty.hidden = n > 0;
      note.hidden = n === 0;
      if (inView) shown = n;
    }
    listeners.push(draw);
    new IntersectionObserver(function (es) {
      var was = inView;
      inView = es[0].isIntersecting;
      if (inView && !was && shown < visit.length) draw();
    }, { threshold: 0.3 }).observe(svg);
    draw();
  }

  var BUILD = { marble: marble, bracelet: bracelet };

  function init() {
    var host = document.querySelector('[data-info-pieces]');
    if (!host || typeof esc !== 'function') return;
    listen();
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
