/* Desk mode's objects, beyond the lamp and the record player
   (js/hero-hover.js, which also owns the dragging):

     the laptop's screen   the case studies, as links (.hero__work)
     the terminal          over the screen; prints only the site's own data
     the window            curtains that draw; the daylight and the leaf
                           shadows (js/desk-wall.js) dim behind them
     the paint chip        today's Wada combination; opens a card about it
     the drink             a drink a weekday; steam by the clock; rings;
                           press it and what is in it floats out
     the phone             AirDrop offers the résumé
     the card holder       take a card, see it on the page
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

  /* A card shown full size on the page (the business card, the palette
     card): a native <dialog>, so Escape, focus trapping and the backdrop
     come free. Closed by its x or a press on the backdrop. */
  function card(label, html, onClose) {
    var dlg = document.createElement('dialog');
    dlg.className = 'bizcard';
    dlg.setAttribute('aria-label', label);
    dlg.innerHTML = '<div class="bizcard__card">' + html +
      '<button class="bizcard__close" type="button" aria-label="Close">×</button></div>';
    document.body.appendChild(dlg);
    dlg.querySelector('.bizcard__close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', onClose);
    return dlg;
  }
  function show(dlg) {
    // The card is pale paper in both themes, but --accent-deep goes pale at
    // night; measure the day's colour against the paper itself instead.
    var pal = window.portfolioPalette;
    var paper = getComputedStyle(root).getPropertyValue('--paper').trim();
    if (pal && pal.against && paper) dlg.style.setProperty('--biz-accent', pal.against(1, 3, paper));
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }

  /* Something opened on the desk (the AirDrop card, the drink's
     ingredients) closes on Escape or a press anywhere else; Escape hands
     focus back to whatever opened it. */
  function dismiss(box, isOpen, close) {
    document.addEventListener('click', function (e) { if (isOpen() && !box.contains(e.target)) close(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) close(box.contains(document.activeElement));
    });
  }

  /* ---------- the laptop's screen ----------
     Every case study that is not archived, as a link to its share page.
     The markup ships the same list for no JS; this keeps it in step with
     js/project-data.js. */
  function initScreen() {
    var ul = document.querySelector('[data-screen-list]');
    if (!ul || !live.length) return;
    ul.innerHTML = live.map(function (p) {
      return '<li><a href="' + safeUrl('work/' + encodeURIComponent(p.id) + '.html') + '"><b>' + esc(p.title) +
        '</b> <span>' + esc(p.tagline || p.context || '') + '</span></a></li>';
    }).join('');
  }

  /* ---------- the terminal ----------
     A real form with a labelled input, over the screen. Every line it
     prints is read from the site's own data; nothing is typed in by hand
     except the command names. */
  var openTerm = function () {}, closeTerm = function () {};
  function initTerm() {
    var form = document.querySelector('[data-term]');
    var out = document.querySelector('[data-term-out]');
    var input = document.querySelector('[data-term-in]');
    var door = document.querySelector('[data-term-open]');
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
        print(esc(text('#hero-name')) + ', ' + esc(D.card.role));
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
        print(esc(text('.hero__sub')) + ' ' + live.length + ' case studies, each shown working; ' +
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

  /* ---------- today's palette ----------
     The chip shows the day's three colours; pressed, it opens a card about
     where they come from. */
  function initChip() {
    var chip = desk.querySelector('[data-chip]');
    var pal = window.portfolioPalette;
    if (!chip || !pal) return;
    var sw = chip.querySelectorAll('[data-chip-sw] i');
    var total = (window.__WADA__ || []).length;
    var no = 'No. ' + (pal.index() + 1) + ' of ' + total;
    chip.querySelector('[data-chip-no]').textContent = no;
    pal.trio().forEach(function (h, i) { if (sw[i]) sw[i].style.background = h; });
    chip.setAttribute('data-cue', 'Wada combination ' + no + ', today');
    var dlg = null;
    chip.addEventListener('click', function () {
      if (!dlg) {
        dlg = card('Today’s palette, after Sanzo Wada',
          '<p class="bizcard__name">Today’s palette</p>' +
          '<p class="bizcard__role">Combination ' + esc(no) + ', after Sanzo Wada</p>' +
          '<ul class="wada__sw">' + pal.trio().map(function (h) {
            var ok = /^#[0-9a-f]{6}$/i.test(h);
            return '<li>' + (ok ? '<i style="background:' + h + '"></i>' : '') + '<code>' + esc(h) + '</code></li>';
          }).join('') + '</ul>' +
          '<p class="wada__p">Sanzo Wada (1883–1967) was a Japanese painter and costume designer. His ' +
          '<cite>A Dictionary of Color Combinations</cite>, first published in six volumes in 1933–34, ' +
          'sets colours side by side in twos, threes and fours.</p>' +
          '<p class="wada__p">This site keeps ' + total + ' of his three-colour combinations and takes a new one ' +
          'each day. Every accent on the page is rebuilt from it, then made lighter or darker until it passes contrast.</p>',
          function () { chip.focus({ preventScroll: true }); });
        dlg.classList.add('wada');
      }
      show(dlg);
    });
  }

  /* ---------- the mug ---------- */
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  /* The drink is the owner's photograph of it, cut out
     (public/assets/drinks/<id>.webp), with steam or condensation laid over it
     by CSS. */
  var STEAM = function (x, y) {
    return '<g class="mug__steam" fill="none" stroke-width="2.2" stroke-linecap="round" transform="translate(' + x + ' ' + y + ')">' +
      '<path d="M-10 14c-4-5 4-8 0-14"/><path d="M0 12c-4-5 4-8 0-14"/><path d="M10 14c-4-5 4-8 0-14"/></g>';
  };
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
    var btn = mug && mug.querySelector('.mug__btn');
    var list = mug && mug.querySelector('.ings');
    if (!btn || !list) return;
    var d = new Date().getDay(), drink = D.drinks[d] || D.drinks[0];
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
    img.src = 'public/assets/drinks/' + encodeURIComponent(id) + '.webp';
    btn.appendChild(img);
    btn.insertAdjacentHTML('beforeend', fx.steam ? steamFx(fx.steam) : fx.dew ? dewFx(fx.dew) : '');
    mug.setAttribute('data-drink', id);
    mug.classList.toggle('is-iced', !drink[2]);

    // What is in it, on a half-ellipse over the rim, left to right; each
    // floats up out of the cup when the drink is pressed (css/desk.css).
    var ings = drink[4] || [], n = ings.length;
    list.innerHTML = ings.map(function (x, i) {
      var a = Math.PI * (1.12 + 0.76 * (n > 1 ? i / (n - 1) : 0.5));
      var c = /^#[0-9a-f]{6}$/i.test(x[1]) ? x[1] : 'transparent';
      return '<li style="--tx:' + (Math.cos(a) * 5.4).toFixed(2) + 'em;--ty:' + (Math.sin(a) * 4.4 - 0.8).toFixed(2) +
        'em;--d:' + i * 70 + 'ms"><i style="background:' + c + '"></i>' + esc(x[0]) + '</li>';
    }).join('');
    function open() { return mug.classList.contains('is-open'); }
    function set(on, refocus) {
      mug.classList.toggle('is-open', on);
      btn.setAttribute('aria-expanded', on ? 'true' : 'false');
      if (refocus) btn.focus({ preventScroll: true });
    }
    btn.addEventListener('click', function () { set(!open()); });
    dismiss(mug, open, function (refocus) { set(false, refocus); });

    function sync() {
      var t = root.getAttribute('data-time');
      var cold = drink[2] && t === 'night';
      mug.classList.toggle('is-cold', cold);
      var say = DAYS[d] + '’s ' + drink[1] + (cold ? ', gone cold' : drink[2] && t === 'morning' ? ', fresh' : '');
      btn.setAttribute('data-cue', say);
      btn.setAttribute('aria-label', say + ': what is in it');
    }
    window.addEventListener('themechange', sync);
    sync();
  }

  /* ---------- the phone ----------
     Lying on the desk; pressed, AirDrop offers the résumé. Accept opens the
     PDF, Decline puts the card away. */
  function initPhone() {
    var btn = desk.querySelector('.phone__btn');
    var box = btn && btn.parentNode;
    var drop = box && box.querySelector('.airdrop');
    if (!drop) return;
    function open() { return !drop.hidden; }
    function set(on, refocus) {
      drop.hidden = !on;
      btn.setAttribute('aria-expanded', on ? 'true' : 'false');
      if (refocus) btn.focus({ preventScroll: true });
    }
    btn.addEventListener('click', function () { set(!open()); });
    drop.querySelector('[data-airdrop-close]').addEventListener('click', function () { set(false, true); });
    drop.querySelector('a').addEventListener('click', function () { set(false); });
    dismiss(box, open, function (refocus) { set(false, refocus); });
  }

  /* ---------- the card holder ----------
     Taking a card shows it, full size, on the page. Nothing is downloaded
     (owner's request, 2026-10-24). Every field is already on the page. */
  function initCards() {
    var btn = desk.querySelector('[data-cards]');
    if (!btn) return;
    var holder = btn.closest('.cards');
    var dlg = null;
    btn.addEventListener('click', function () {
      var c = D.card;
      if (!dlg) {
        dlg = card('Business card: ' + c.name,
          '<p class="bizcard__name">' + esc(c.name) + '</p>' +
          '<p class="bizcard__role">' + esc(c.role) + '</p>' +
          '<ul class="bizcard__lines">' +
            '<li><a href="' + safeUrl('mailto:' + c.email) + '">' + esc(c.email) + '</a></li>' +
            c.urls.map(function (u) {
              return '<li><a href="' + safeUrl(u) + '" target="_blank" rel="noopener noreferrer">' +
                esc(u.replace(/^https?:\/\//, '')) + '</a></li>';
            }).join('') +
            '<li><a href="' + safeUrl(c.resume) + '" target="_blank" rel="noopener noreferrer">Résumé (PDF)</a></li>' +
          '</ul>',
          function () { holder.classList.remove('is-taken'); btn.focus({ preventScroll: true }); });
      }
      holder.classList.add('is-taken');
      api.moved();
      show(dlg);
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
  });
  api.on('tidy', function () {
    if (rings) rings.innerHTML = '';
    var holder = desk.querySelector('.cards');
    if (holder) holder.classList.remove('is-taken');
  });

  window.onReady(function () {
    initTerm();
    initWindow();
    initChip();
    initScreen();
    initMug();
    initPhone();
    initCards();
    initNight();
    if (!window.isEditing()) initMess();
  });
})();
