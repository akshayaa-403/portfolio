/* Desk mode's objects, beyond the lamp, the record and the AirDrop card
   (js/hero-hover.js, which also owns the dragging):

     the laptop's screen   a carousel of gallery highlights, after Framer's
                           Screen Carousel; slide 1 is empty so the name shows
     the terminal          over the screen; prints only the site's own data
     the window            curtains that draw; the daylight and the leaf
                           shadows (js/desk-wall.js) dim behind them
     the paint chip        today's Wada combination
     Polaroids             pull one off the pile and it develops; click opens it
     the mug               a drink a weekday; steam by the clock; rings
     the card holder       take a card, see it on the page
     the plant             one leaf per project, each wilting as its repo goes stale
     the night             only the lamp and the screen light the desk
     the mess              the longer you stay, the more the desk drifts

   Reads js/desk-data.js, project-data.js, hobby-data.js, readings-data.js
   and window.portfolioPalette; every fact on the desk comes from those, so
   it cannot claim more than the site holds. */
(function () {
  'use strict';

  var desk = document.querySelector('.desk');
  if (!desk || typeof deskData === 'undefined') return;

  var D = deskData;
  var root = document.documentElement;
  var stage = desk.closest('.stage');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var api = window.portfolioDesk || { on: function () {}, nudge: function () {}, moved: function () {} };
  var P = typeof projects !== 'undefined' ? projects : [];
  var H = typeof hobbies !== 'undefined' ? hobbies : {};
  var live = P.filter(function (p) { return !p.archived; });

  function caption(g, i) {
    var h = H[g];
    return (h && h.captions && h.captions[i - 1]) || ((h ? h.label : g) + ' ' + i);
  }
  function shot(g, i, size) {
    return 'public/assets/hobbies/' + encodeURIComponent(g + '-' + i + (size ? '-' + size : '') + '.webp');
  }
  function photoHref(g, i) { return 'hobby.html?id=' + encodeURIComponent(g) + '&i=' + i; }
  function real(pair) { return H[pair[0]] && pair[1] >= 1 && pair[1] <= H[pair[0]].n; }

  /* ---------- the terminal ----------
     A real form with a labelled input, over the carousel. Every line it
     prints is read from the site's own data; nothing is typed in by hand
     except the command names. */
  var termForm = null, openTerm = function () {}, closeTerm = function () {};
  function initTerm() {
    var form = termForm = desk.querySelector('[data-term]');
    var out = desk.querySelector('[data-term-out]');
    var input = desk.querySelector('[data-term-in]');
    var door = desk.querySelector('[data-term-open]');
    if (!form || !out || !input) return;
    var history = [], back = 0;

    function print(html, cls) {
      var p = document.createElement('p');
      if (cls) p.className = cls;
      p.innerHTML = html;
      out.appendChild(p);
      out.scrollTop = out.scrollHeight;
    }
    function key(s) { return '<span class="t-key">' + esc(s) + '</span>'; }
    function pad(s, n) { s = String(s); while (s.length < n) s += ' '; return s; }
    function link(href, text) { return '<a href="' + safeUrl(href) + '">' + esc(text) + '</a>'; }
    function text(sel) { var el = document.querySelector(sel); return el ? el.textContent.trim() : ''; }

    function books() {
      var all = [];
      if (typeof readings !== 'undefined' && readings.groups) {
        readings.groups.forEach(function (g) { (g.books || []).forEach(function (b) { all.push(b); }); });
      }
      return all;
    }

    var CMDS = {
      help: function () {
        print([
          key('whoami') + '         who this is',
          key('ls projects') + '    the case studies',
          key('ls hobbies') + '     the galleries',
          key('ls books') + '       the shelf',
          key('open <name>') + '    go to a project or a gallery',
          key('cat about') + '      one line',
          key('contact') + '        how to reach her',
          key('palette') + '        today’s colours',
          key('clear') + '          clear the screen',
          key('exit') + '           back to the screen (or Esc)'
        ].join('\n'));
      },
      whoami: function () {
        print(esc(text('#hero-name')) + ', ' + esc(text('.hero__role')));
      },
      ls: function (arg) {
        if (arg === 'projects' || arg === 'work') {
          var w = 0;
          live.forEach(function (p) { w = Math.max(w, p.id.length); });
          print(live.map(function (p) {
            return key(pad(p.id, w)) + '  ' + esc(p.title) + (p.metric ? ' · ' + esc(p.metric) : '');
          }).join('\n'));
          var old = P.filter(function (p) { return p.archived; });
          if (old.length) print('also built: ' + old.map(function (p) { return key(p.id); }).join(', '), 't-cmd');
        } else if (arg === 'hobbies' || arg === 'galleries') {
          print(Object.keys(H).map(function (id) {
            return key(pad(id, 12)) + '  ' + esc(H[id].label) + ' · ' + H[id].n + ' pictures';
          }).join('\n'));
        } else if (arg === 'books' || arg === 'readings') {
          var b = books();
          print(b.length ? b.map(function (x) { return esc(x.title) + (x.author ? ' · ' + esc(x.author) : ''); }).join('\n')
                         : 'the shelf is empty');
        } else {
          print('ls: try ' + key('ls projects') + ', ' + key('ls hobbies') + ' or ' + key('ls books'));
        }
      },
      open: function (arg) {
        if (!arg) { print('open: which one? ' + key('ls projects') + ' or ' + key('ls hobbies')); return; }
        var p = P.filter(function (x) { return x.id === arg; })[0] ||
                P.filter(function (x) { return x.id.indexOf(arg) === 0 || x.title.toLowerCase().indexOf(arg) === 0; })[0];
        var href = p ? 'work/' + encodeURIComponent(p.id) + '.html' : H[arg] ? 'hobby.html?id=' + encodeURIComponent(arg) : null;
        if (!href) { print('open: no project or gallery called ' + esc(arg)); return; }
        print('opening ' + esc(href) + ' …', 't-cmd');
        window.setTimeout(function () { location.href = href; }, reduce ? 0 : 350);
      },
      cat: function (arg) {
        if (arg !== 'about') { print('cat: ' + esc(arg || '') + ': no such file. try ' + key('cat about')); return; }
        var pics = 0;
        Object.keys(H).forEach(function (id) { pics += H[id].n; });
        print(esc(text('.hero__role')) + '. ' + live.length + ' case studies, each shown working; ' +
              Object.keys(H).length + ' galleries of ' + pics + ' pictures; ' + books().length + ' books on the shelf.');
      },
      contact: function () {
        print([
          'email     ' + link('mailto:' + D.card.email, D.card.email),
          'github    ' + link(D.card.urls[0], D.card.urls[0].replace(/^https:\/\//, '')),
          'linkedin  ' + link(D.card.urls[1], D.card.urls[1].replace(/^https:\/\//, '')),
          'résumé    ' + link('public/assets/resume.pdf', 'resume.pdf')
        ].join('\n'));
      },
      palette: function () {
        var pal = window.portfolioPalette;
        if (!pal) { print('palette: not loaded'); return; }
        var total = (window.__WADA__ || []).length;
        print('Sanzo Wada, A Dictionary of Color Combinations: No. ' + (pal.index() + 1) + ' of ' + total + ', today');
        print(pal.trio().map(function (h) {
          var ok = /^#[0-9a-f]{6}$/i.test(h);
          return (ok ? '<i style="background:' + h + '"></i>' : '') + esc(h);
        }).join('   '));
      },
      clear: function () { out.innerHTML = ''; },
      exit: function () { closeTerm(); }
    };

    function run(line) {
      var words = line.trim().toLowerCase().split(/\s+/);
      var cmd = words[0], arg = words.slice(1).join(' ');
      print('~ $ ' + esc(line), 't-cmd');
      if (!cmd) return;
      if (Object.prototype.hasOwnProperty.call(CMDS, cmd)) CMDS[cmd](arg);
      else print(esc(cmd) + ': command not found. try ' + key('help'));
    }

    openTerm = function (seed) {
      if (!form.hidden) { input.focus(); return; }
      form.hidden = false;
      if (door) door.hidden = true;
      if (stage) stage.classList.add('is-term');
      if (!out.childNodes.length) print('type ' + key('help') + ' for commands, ' + key('exit') + ' or Esc to close');
      input.value = seed || '';
      input.focus({ preventScroll: true });
    };
    closeTerm = function () {
      if (form.hidden) return;
      var had = form.contains(document.activeElement);
      form.hidden = true;
      if (door) door.hidden = false;
      if (stage) stage.classList.remove('is-term');
      if (had && door) door.focus({ preventScroll: true });
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var line = input.value;
      input.value = '';
      if (line.trim()) { history.push(line); back = history.length; }
      run(line);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeTerm(); }
      else if (e.key === 'ArrowUp' && history.length) {
        e.preventDefault(); back = Math.max(0, back - 1); input.value = history[back];
      } else if (e.key === 'ArrowDown' && history.length) {
        e.preventDefault(); back = Math.min(history.length, back + 1); input.value = history[back] || '';
      }
    });
    // A click anywhere on the terminal (not a link) goes to the prompt.
    form.addEventListener('click', function (e) { if (!e.target.closest('a')) input.focus({ preventScroll: true }); });
    if (door) door.addEventListener('click', function () { openTerm(''); });
  }

  /* ---------- the window and its curtains ----------
     Session only: nothing is saved. Drawing them dims the daylight beam and
     the wall's leaf shadows (desk-wall.js listens for curtainchange); the
     theme stays on the clock, and the lamp is still the only switch. */
  function initWindow() {
    var btn = desk.querySelector('[data-curtains]');
    if (!btn) return;
    function sync() {
      var shut = desk.classList.contains('is-shut');
      btn.setAttribute('aria-pressed', shut ? 'true' : 'false');
      btn.setAttribute('aria-label', shut ? 'Open the curtains' : 'Draw the curtains');
      btn.setAttribute('data-cue', shut ? 'Open the curtains' : 'Draw the curtains');
    }
    btn.addEventListener('click', function () {
      desk.classList.toggle('is-shut');
      sync();
      window.dispatchEvent(new CustomEvent('curtainchange', { detail: { shut: desk.classList.contains('is-shut') } }));
    });
    sync();
  }

  /* ---------- today's palette ---------- */
  function initChip() {
    var no = desk.querySelector('[data-chip-no]');
    var sw = desk.querySelectorAll('[data-chip-sw] i');
    var pal = window.portfolioPalette;
    if (!no || !pal) return;
    var total = (window.__WADA__ || []).length;
    no.textContent = 'No. ' + (pal.index() + 1) + ' of ' + total;
    pal.trio().forEach(function (h, i) { if (sw[i]) sw[i].style.background = h; });
    var chip = no.closest('.chip');
    if (chip) chip.setAttribute('data-cue', 'Wada combination No. ' + (pal.index() + 1) + ', today');
  }

  /* ---------- Polaroids ---------- */
  function initPolaroids() {
    var picks = D.polaroids.filter(real);
    Array.prototype.forEach.call(desk.querySelectorAll('[data-pola]'), function (b) {
      var pick = picks[+b.getAttribute('data-pola')];
      if (!pick) { b.remove(); return; }
      var c = caption(pick[0], pick[1]);
      b.innerHTML = '<span class="pola__img"><img src="' + safeUrl(shot(pick[0], pick[1], 600)) +
        '" alt="" loading="lazy" decoding="async" draggable="false"></span>' +
        '<span class="pola__cap">' + esc(c) + '</span>';
      b.setAttribute('aria-label', 'Open the photograph: ' + c);
      b.setAttribute('data-cue', 'Pull it off the pile');
      b.addEventListener('click', function () {
        b.classList.add('is-developed');
        if (!window.portfolioLightbox || !window.portfolioLightbox.open(pick[0], pick[1])) {
          location.href = photoHref(pick[0], pick[1]);
        }
      });
    });
  }

  /* ---------- the mug ---------- */
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  /* The drink is the owner's photograph of it, cut out
     (public/assets/drinks/<id>.webp), with steam or condensation laid over it
     by CSS. DRINKS below are the drawn versions, kept as the fallback if a
     photograph fails to load: in the mug's old 64 x 70 box, base on y = 66,
     liquids as paint, glass and ice as tokens in css/desk.css. */
  var STEAM = function (x, y) {
    return '<g class="mug__steam" fill="none" stroke-width="2.2" stroke-linecap="round" transform="translate(' + x + ' ' + y + ')">' +
      '<path d="M-10 14c-4-5 4-8 0-14"/><path d="M0 12c-4-5 4-8 0-14"/><path d="M10 14c-4-5 4-8 0-14"/></g>';
  };
  // A liquid surface that never sits still: a wave twice the glass's width,
  // slid sideways by CSS one period at a time, so the loop has no seam.
  function wave(y, amp, fill, cls) {
    var d = 'M-64 ' + y + ' q8 ' + (-amp) + ' 16 0';
    for (var x = -48; x < 128; x += 16) d += ' t16 0';
    return '<path class="drink__wave ' + (cls || '') + '" fill="' + fill + '" d="' + d + ' V90 H-64Z"/>';
  }
  function clip(id, d) { return '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath>'; }
  function ice(x, y, s, cls) {
    return '<rect class="drink__ice ' + (cls || '') + '" x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" rx="' + (s / 6).toFixed(1) + '"/>';
  }
  function bubbles(xs) {
    return '<g class="drink__fizz">' + xs.map(function (x, i) {
      return '<circle cx="' + x + '" cy="62" r="' + (0.9 + (i % 3) * 0.4) + '" style="animation-delay:' + (-i * 0.53).toFixed(2) + 's"/>';
    }).join('') + '</g>';
  }
  var DRINKS = {
    'hazelnut-mocha': function () {
      return STEAM(31, 4) +
        '<path class="mug__handle" d="M50 34h4a8 8 0 0 1 0 16h-5" fill="none" stroke-width="5"/>' +
        '<path class="mug__body" d="M10 26h42v30a10 10 0 0 1-10 10H20a10 10 0 0 1-10-10z"/>' +
        '<g class="drink__liquid"><ellipse cx="31" cy="28.5" rx="18.5" ry="3.2" fill="#5b3420"/>' +
        '<ellipse cx="31" cy="28.4" rx="15" ry="2.4" fill="#d8b38a"/>' +
        '<path d="M22 28.6l3-1.2 3 1.2 3-1.2 3 1.2 3-1.2 3 1.2" fill="none" stroke="#4a2a18" stroke-width="0.9" stroke-linecap="round"/></g>' +
        '<path class="mug__shine" d="M16 32v20" fill="none" stroke-width="2.5" stroke-linecap="round"/>' +
        // a hazelnut on the desk beside it
        '<ellipse cx="58" cy="63" rx="4.2" ry="3.4" fill="#8a5a32"/><path d="M54 61.5q4-3.4 8 0" fill="#5e3a1c"/>';
    },
    'ube-matcha-latte': function () {
      var g = 'M14 -16H50L46.5 63Q46.2 66 43.5 66H20.5Q17.8 66 17.5 63Z';
      return clip('dk-ube', g) + '<path class="drink__back" d="' + g + '"/>' +
        '<path class="drink__straw" d="M38 -30L30 40" stroke-width="3.2" stroke-linecap="round"/>' +
        '<g clip-path="url(#dk-ube)">' +
          '<g class="drink__liquid"><rect x="0" y="-6" width="64" height="80" fill="#7fa94e"/>' +
          wave(10, 2.2, '#efe8f1', 'drink__wave--slow') + wave(36, 2.6, '#8a5cb4', 'drink__wave--rev') + '</g>' +
          ice(20, -12, 11, 'drink__ice--bob') + ice(32, -9, 10, 'drink__ice--bob2') +
        '</g>' +
        '<path class="drink__glass" d="' + g + '"/><path class="drink__glint" d="M19 -10L21.5 56" fill="none" stroke-width="2" stroke-linecap="round"/>';
    },
    'zen-garden': function () {
      var g = 'M10 16H54L51.5 63Q51.2 66 48.5 66H15.5Q12.8 66 12.5 63Z';
      return clip('dk-zen', g) + '<path class="drink__back" d="' + g + '"/>' +
        '<g clip-path="url(#dk-zen)">' +
          '<g class="drink__liquid"><rect x="0" y="22" width="64" height="60" fill="#f2d36a"/>' +
          '<path d="M0 22H64V36H0Z" fill="#6c5fd6"/>' +
          wave(34, 2.4, '#f2d36a', 'drink__wave--slow') + '</g>' +
          ice(21, 20, 22, 'drink__ice--bob drink__ice--big') +
        '</g>' +
        '<path class="drink__glass" d="' + g + '"/><path class="drink__glint" d="M15 22L17 58" fill="none" stroke-width="2" stroke-linecap="round"/>' +
        // the skewer through a basil leaf, resting on the rim
        '<path class="drink__skewer" d="M46 -6L30 48" stroke-width="1.8" stroke-linecap="round"/>' +
        '<path d="M48 8c-8-2-12 6-10 10 6 1 11-4 10-10z" fill="var(--leaf)"/><path d="M48 8l-9 9.5" stroke="var(--leaf-deep)" stroke-width="0.8" fill="none"/>';
    },
    'diet-coke': function () {
      var g = 'M12 6H40L38 63Q37.8 66 35 66H17Q14.2 66 14 63Z';
      return clip('dk-coke', g) + '<path class="drink__back" d="' + g + '"/>' +
        '<g clip-path="url(#dk-coke)">' +
          '<g class="drink__liquid"><rect x="0" y="14" width="64" height="60" fill="#2a140c"/>' +
          wave(14, 1.2, '#2a140c', '') + '<rect x="0" y="12.6" width="64" height="1.6" fill="#7a4a30" opacity="0.7"/></g>' +
          ice(16, 12, 10, 'drink__ice--bob') + ice(26, 15, 9, 'drink__ice--bob2') +
          bubbles([18, 22, 27, 31, 35, 20, 29]) +
        '</g>' +
        '<path class="drink__glass" d="' + g + '"/><path class="drink__glint" d="M16.5 12L18 58" fill="none" stroke-width="2" stroke-linecap="round"/>' +
        // a silver can beside it, red band, no lettering
        '<g class="drink__can"><rect x="43" y="32" width="15" height="34" rx="2.5" fill="#d7dadd"/>' +
        '<rect x="43" y="32" width="4" height="34" rx="2" fill="#f4f6f7" opacity="0.8"/>' +
        '<path d="M43 46q7.5-5 15 0v6q-7.5-5-15 0z" fill="#d42a2a"/>' +
        '<ellipse cx="50.5" cy="32.5" rx="7.5" ry="1.6" fill="#b9bdc1"/></g>';
    },
    'citron-tea': function () {
      var g = 'M12 24H46V56A10 10 0 0 1 36 66H22A10 10 0 0 1 12 56Z';
      return STEAM(29, 2) + clip('dk-cit', g) + '<path class="drink__back" d="' + g + '"/>' +
        '<path class="drink__glass drink__handle" d="M46 34h4a8 8 0 0 1 0 16h-4" fill="none" stroke-width="3"/>' +
        '<g clip-path="url(#dk-cit)">' +
          '<g class="drink__liquid"><rect x="0" y="30" width="64" height="50" fill="#e9952f"/>' +
          wave(30, 1.4, '#f0ad4a', 'drink__wave--slow') + '</g>' +
          '<g class="drink__peel"><path d="M18 34q6-3 11 1" /><path d="M31 37q5 2 9-2"/><path d="M22 44q4 3 9 0"/></g>' +
        '</g>' +
        '<path class="drink__glass" d="' + g + '"/><path class="drink__glint" d="M16 30V56" fill="none" stroke-width="2" stroke-linecap="round"/>';
    },
    'lemon-tea': function () {
      var g = 'M15 18H47L44.5 63Q44.2 66 41.5 66H20.5Q17.8 66 17.5 63Z';
      var seg = '';
      for (var k = 0; k < 8; k++) {
        var a = k / 8 * 2 * Math.PI;
        seg += 'M47 18L' + (47 + 7 * Math.cos(a)).toFixed(1) + ' ' + (18 + 7 * Math.sin(a)).toFixed(1);
      }
      return STEAM(29, -4) + clip('dk-lem', g) + '<path class="drink__back" d="' + g + '"/>' +
        '<g clip-path="url(#dk-lem)">' +
          '<g class="drink__liquid"><rect x="0" y="26" width="64" height="60" fill="#d9a23a"/>' +
          wave(26, 1.4, '#e6b851', 'drink__wave--slow') + '</g>' +
          '<ellipse class="drink__float" cx="27" cy="28" rx="6.5" ry="1.8" fill="#f6dc5a"/>' +
        '</g>' +
        '<path class="drink__glass" d="' + g + '"/><path class="drink__glint" d="M19.5 24L21.5 58" fill="none" stroke-width="2" stroke-linecap="round"/>' +
        // a lemon wheel on the rim
        '<circle cx="47" cy="18" r="8.5" fill="#f2d03b"/><circle cx="47" cy="18" r="7" fill="#f8e57a"/>' +
        '<path d="' + seg + '" stroke="#fffbe0" stroke-width="0.8"/>';
    },
    'ginger-chai': function () {
      // a cutting-chai glass: small, fluted, wider at the top
      var g = 'M16 30H44L41.5 63Q41.2 66 38.5 66H21.5Q18.8 66 18.5 63Z';
      return STEAM(30, 8) + clip('dk-chai', g) + '<path class="drink__back" d="' + g + '"/>' +
        '<g clip-path="url(#dk-chai)">' +
          '<g class="drink__liquid"><rect x="0" y="34" width="64" height="40" fill="#b07a46"/>' +
          wave(34, 1.2, '#d6b088', 'drink__wave--slow') + '</g>' +
        '</g>' +
        '<path class="drink__glass" d="' + g + '"/>' +
        '<path class="drink__flute" d="M22 32L23.5 64M27 32L27.8 64M32 32V64M37 32L36.2 64M42 32L40.5 64" fill="none" stroke-width="0.8"/>' +
        // a knob of ginger beside it
        '<path d="M46 66c-1-4 2-6 5-5 1-3 5-3 6 0 3 0 4 3 2 5z" fill="#d9b679" stroke="#a8823f" stroke-width="0.8"/>';
    }
  };

  /* Where the effects sit on each photograph, as fractions of it: steam
     rises from the mouth of a hot drink ([x, y] of the rim's centre, and the
     width of the plume as a fraction of the photograph), and
     condensation beads on the glass of a cold one ([x0, y0, x1, y1]). */
  var FX = {
    'ginger-chai': { steam: [0.57, 0.04, 0.5] },
    'citron-tea': { steam: [0.62, 0.05, 0.3] },
    'lemon-tea': { steam: [0.42, 0.1, 0.55] },
    'hazelnut-mocha': { dew: [0.08, 0.12, 0.92, 0.96] },
    'ube-matcha-latte': { dew: [0.06, 0.08, 0.94, 0.96] },
    'zen-garden': { dew: [0.1, 0.22, 0.92, 0.96] },
    'diet-coke': { dew: [0.08, 0.15, 0.6, 0.97] }
  };
  var OLD_MUG_CM = 9;   // what the old drawn mug stood for

  function steamFx(at) {
    return '<span class="drink__steam" style="left:' + at[0] * 100 + '%;top:' + at[1] * 100 + '%;width:' + at[2] * 100 + '%">' +
      '<svg viewBox="-20 -2 40 22" aria-hidden="true" focusable="false">' + STEAM(0, 0) + '</svg></span>';
  }
  // Beads scattered over the glass at random each load, each on its own
  // slow loop: it forms, swells, slides a little way down and is gone.
  function dewFx(box) {
    var beads = '';
    for (var i = 0; i < 12; i++) {
      beads += '<i style="left:' + (Math.random() * 92).toFixed(1) + '%;top:' + (Math.random() * 80).toFixed(1) + '%;' +
        '--s:' + (0.6 + Math.random() * 0.9).toFixed(2) + ';animation-delay:' + (-Math.random() * 9).toFixed(2) + 's;' +
        'animation-duration:' + (7 + Math.random() * 5).toFixed(2) + 's"></i>';
    }
    return '<span class="drink__dew" aria-hidden="true" style="left:' + box[0] * 100 + '%;top:' + box[1] * 100 + '%;' +
      'width:' + (box[2] - box[0]) * 100 + '%;height:' + (box[3] - box[1]) * 100 + '%">' + beads + '</span>';
  }

  function initMug() {
    var mug = desk.querySelector('[data-mug]');
    if (!mug) return;
    var d = new Date().getDay(), drink = D.drinks[d] || ['ginger-chai', 'ginger chai', true, 9.5];
    var id = drink[0], fx = FX[id] || {};
    // Real sizes: the inline --w is the old 9 cm mug's width, its height
    // 70/64 of that; this drink is scaled by its own height in cm, and lifted
    // by the difference so it stands where the mug stood.
    var base = parseFloat(mug.style.getPropertyValue('--w')) || 4.2;
    var refH = base * 70 / 64, h = refH * (drink[3] || OLD_MUG_CM) / OLD_MUG_CM;
    var img = new Image();
    img.className = 'drink__img';
    img.alt = '';
    img.draggable = false;
    img.decoding = 'async';
    img.onload = function () {
      mug.style.setProperty('--dw', (h * img.naturalWidth / img.naturalHeight).toFixed(3) + '%');
      mug.style.marginTop = (refH - h).toFixed(3) + '%';
    };
    img.onerror = function () {
      if (!DRINKS[id]) return;
      mug.innerHTML = '<svg viewBox="0 0 64 70" aria-hidden="true" focusable="false">' + DRINKS[id]() + '</svg>';
      mug.style.removeProperty('--dw');
      mug.style.marginTop = '';
    };
    img.src = 'public/assets/drinks/' + encodeURIComponent(id) + '.webp';
    mug.innerHTML = '';
    mug.appendChild(img);
    mug.insertAdjacentHTML('beforeend', fx.steam ? steamFx(fx.steam) : fx.dew ? dewFx(fx.dew) : '');
    mug.setAttribute('data-drink', id);
    mug.classList.toggle('is-iced', !drink[2]);

    function sync() {
      var t = root.getAttribute('data-time');
      var cold = drink[2] && t === 'night';
      mug.classList.toggle('is-cold', cold);
      var say = DAYS[d] + '’s ' + drink[1] + (cold ? ', gone cold' : drink[2] && t === 'morning' ? ', fresh' : '');
      mug.setAttribute('data-cue', say);
      mug.setAttribute('aria-label', 'A drink: ' + say);
    }
    window.addEventListener('themechange', sync);
    sync();
  }

  /* ---------- the plant ----------
     One leaf per project, archived ones included, stacked oldest at the
     bottom (by `created`) and newest at the top; a project with no dates
     (Arteza: no public repo) goes on top. Each leaf wilts by how long ago
     its own repo was last pushed (`updated` in js/project-data.js, which is
     transcribed, not fetched, so the leaves only freshen when those dates
     are re-copied from GitHub). Hovering a leaf names its project and state;
     hovering the pot or stem gives the whole plant's count. */
  var LEAF_STATES = [
    [14, '', 'healthy', 0],
    [30, 'is-tired', 'tired', 16],
    [60, 'is-thirsty', 'thirsty', 38],
    [Infinity, 'is-wilted', 'wilted', 68]
  ];
  function initPlant() {
    var plant = desk.querySelector('[data-plant]');
    var host = plant && plant.querySelector('.plant__leaves');
    if (!host) return;
    var NS = 'http://www.w3.org/2000/svg';
    var order = P.slice().sort(function (x, y) {
      return (x.created || '9999') < (y.created || '9999') ? -1 : 1;
    });
    var n = order.length, top = 36, bottom = 100, counts = {}, sum = 0;
    var labels = [];
    order.forEach(function (proj, i) {
      var y = Math.round(bottom - (bottom - top) * i / Math.max(1, n - 1));
      var side = i === n - 1 ? 't' : i % 2 ? 'r' : 'l';
      var d = side === 'l' ? 'M50 ' + y + 'c-12-1.5-21-10.5-24-21 12 0 21 7.5 24 21z'
        : side === 'r' ? 'M50 ' + y + 'c12-1.5 21-10.5 24-21-12 0-21 7.5-24 21z'
        : 'M50 ' + y + 'c-3-6-1.5-13.5 3-19.5 3 6 1.5 13.5-3 19.5z';
      var t = proj.updated ? Date.parse(proj.updated + 'T00:00:00') : NaN;
      var days = isNaN(t) ? null : Math.max(0, Math.floor((Date.now() - t) / 864e5));
      var st = days === null ? ['', '', 'no dates', 0]
        : LEAF_STATES.filter(function (x) { return days < x[0]; })[0];
      counts[st[2]] = (counts[st[2]] || 0) + 1;
      sum += st[3];
      var say = proj.title + ' · ' + st[2] + ' · ' + (days === null ? 'no public repo, so no update date'
        : 'last updated ' + (days === 0 ? 'today' : days === 1 ? '1 day ago' : days + ' days ago'));
      labels.push(say);
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'plant__leaf plant__leaf--' + side + (st[1] ? ' ' + st[1] : ''));
      g.setAttribute('data-cue', say);
      g.style.setProperty('--droop', st[3] + 'deg');
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d);
      g.appendChild(path);
      host.appendChild(g);
    });
    var summary = LEAF_STATES.map(function (x) { return x[2]; }).concat(['no dates'])
      .filter(function (k) { return counts[k]; })
      .map(function (k) { return counts[k] + ' ' + k; }).join(', ');
    plant.style.setProperty('--lean', (sum / n / 8).toFixed(1) + 'deg');
    plant.setAttribute('data-cue', 'One leaf per project: ' + summary);
    plant.setAttribute('aria-label', 'A desk plant with one leaf per project. ' + labels.join('. ') + '.');
  }

  /* ---------- the card holder ----------
     Taking a card shows it, full size, on the page: a native <dialog>, as the
     photo popover is, so Escape, focus trapping and the backdrop come free.
     Nothing is downloaded (owner's request, 2026-10-24). Every field is
     already on the page. */
  function initCards() {
    var btn = desk.querySelector('[data-cards]');
    if (!btn) return;
    var holder = btn.closest('.cards');
    var dlg = null;

    function build() {
      var c = D.card;
      var role = (document.querySelector('.hero__role') || { textContent: '' }).textContent.trim();
      dlg = document.createElement('dialog');
      dlg.className = 'bizcard';
      dlg.setAttribute('aria-label', 'Business card: ' + c.name);
      dlg.innerHTML =
        '<div class="bizcard__card">' +
          '<p class="bizcard__name">' + esc(c.name) + '</p>' +
          (role ? '<p class="bizcard__role">' + esc(role) + '</p>' : '') +
          '<ul class="bizcard__lines">' +
            '<li><a href="' + safeUrl('mailto:' + c.email) + '">' + esc(c.email) + '</a></li>' +
            c.urls.map(function (u) {
              return '<li><a href="' + safeUrl(u) + '" target="_blank" rel="noopener noreferrer">' +
                esc(u.replace(/^https?:\/\//, '')) + '</a></li>';
            }).join('') +
          '</ul>' +
          '<button class="bizcard__close" type="button" aria-label="Put the card back">×</button>' +
        '</div>';
      document.body.appendChild(dlg);
      dlg.querySelector('.bizcard__close').addEventListener('click', function () { dlg.close(); });
      // A click on the backdrop, outside the card, puts it back too.
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener('close', function () { holder.classList.remove('is-taken'); btn.focus(); });
    }

    btn.addEventListener('click', function () {
      if (!dlg) build();
      // The card is pale paper in both themes, but --accent-deep goes pale at
      // night; measure the day's colour against the paper itself instead.
      var P = window.portfolioPalette;
      var paper = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim();
      if (P && P.against && paper) dlg.style.setProperty('--biz-accent', P.against(1, 3, paper));
      holder.classList.add('is-taken');
      api.moved();
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    });
  }

  /* ---------- rings where the mug stood ---------- */
  var rings = desk.querySelector('.desk__rings');
  function ring(r) {
    if (!rings || !r || !r.width) return;
    var d = desk.getBoundingClientRect();
    var s = document.createElement('span');
    s.style.left = (r.left + r.width * 0.46 - d.left) + 'px';
    s.style.top = (r.bottom - r.height * 0.06 - d.top) + 'px';
    s.style.width = (r.width * 0.72) + 'px';
    rings.appendChild(s);
    while (rings.children.length > 8) rings.removeChild(rings.firstChild);
  }

  /* ---------- the night ----------
     The screen's glow, for css/desk.css's .desk__night, in px of the desk. */
  function initNight() {
    var glass = desk.querySelector('.laptop__screen');
    if (!glass) return;
    function place() {
      var d = desk.getBoundingClientRect(), r = glass.getBoundingClientRect();
      if (!d.width || !r.width) return;
      desk.style.setProperty('--scr-x', (r.left + r.width / 2 - d.left) + 'px');
      desk.style.setProperty('--scr-y', (r.top + r.height / 2 - d.top) + 'px');
      desk.style.setProperty('--scr-w', (r.width * 0.95) + 'px');
      desk.style.setProperty('--scr-h', (r.height * 1.1) + 'px');
    }
    new ResizeObserver(place).observe(desk);
    place();
  }

  /* ---------- the mess ----------
     Every 45 s that the desk is on screen in desk mode, two things drift a
     little and the mug creeps. "Tidy up" puts it all back. Never under
     reduced motion. */
  var MESS_MS = 45000;
  function initMess() {
    if (reduce) return;
    var seen = true;
    new IntersectionObserver(function (es) { seen = es[0].isIntersecting; }).observe(desk);
    function rand(a, b) { return a + Math.random() * (b - a); }
    window.setInterval(function () {
      if (!seen || document.hidden || !desk.offsetWidth) return;
      var all = Array.prototype.filter.call(desk.querySelectorAll('[data-drag]'), function (el) {
        return !el.classList.contains('is-held');
      });
      for (var k = 0; k < 2 && all.length; k++) {
        var el = all.splice(Math.floor(Math.random() * all.length), 1)[0];
        api.nudge(el, rand(-14, 14), rand(-4, 4), rand(-3, 3));
      }
      var mug = desk.querySelector('[data-mug]');
      if (mug) { ring(mug.getBoundingClientRect()); api.nudge(mug, rand(6, 16), rand(-2, 2), 0); }
    }, MESS_MS);
  }

  /* ---------- drops and tidying ---------- */
  api.on('drop', function (el, from) {
    if (el.matches('[data-mug]')) ring(from);
    else if (el.classList.contains('pola')) el.classList.add('is-developed');
  });
  api.on('tidy', function () {
    if (rings) rings.innerHTML = '';
    Array.prototype.forEach.call(desk.querySelectorAll('.pola'), function (p) { p.classList.remove('is-developed'); });
    var holder = desk.querySelector('.cards');
    if (holder) holder.classList.remove('is-taken');
  });

  window.onReady(function () {
    initTerm();
    initWindow();
    initChip();
    initPolaroids();
    initMug();
    initPlant();
    initCards();
    initNight();
    if (!window.isEditing()) initMess();
  });
})();
