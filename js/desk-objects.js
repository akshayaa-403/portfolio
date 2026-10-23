/* Desk mode's objects, beyond the lamp, the record and the AirDrop card
   (js/hero-hover.js, which also owns the dragging):

     the laptop's screen   a carousel of gallery highlights, after Framer's
                           Screen Carousel; slide 1 is empty so the name shows
     the terminal          over the screen; prints only the site's own data
     the window            curtains that draw; the daylight and the leaf
                           shadows (js/desk-wall.js) dim behind them
     the paint chip        today's Wada combination
     sticky notes          a "What I'd do differently" line each; peel to see
                           which case study
     Polaroids             pull one off the pile and it develops; click opens it
     the notebook          one margin note a day, linking to its case study
     the phone             Habita, linking to its case study (markup only)
     the mug               a drink a weekday; steam by the clock; rings
     the card holder       take a card, get a vCard
     the plant             wilts as the newest live repo goes stale
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

  function isDesk() { return root.getAttribute('data-mode') === 'desk'; }
  function project(id) {
    for (var i = 0; i < P.length; i++) if (P[i].id === id) return P[i];
    return null;
  }
  // Days since the epoch in the viewer's own time zone, as js/palette.js
  // counts them, so "a different one each day" turns at local midnight.
  function dayNo() {
    var d = new Date();
    return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5);
  }
  function caption(g, i) {
    var h = H[g];
    return (h && h.captions && h.captions[i - 1]) || ((h ? h.label : g) + ' ' + i);
  }
  function shot(g, i, size) {
    return 'public/assets/hobbies/' + encodeURIComponent(g + '-' + i + (size ? '-' + size : '') + '.webp');
  }
  function photoHref(g, i) { return 'hobby.html?id=' + encodeURIComponent(g) + '&i=' + i; }
  function real(pair) { return H[pair[0]] && pair[1] >= 1 && pair[1] <= H[pair[0]].n; }

  /* ---------- the screen carousel ----------
     After Framer's Screen Carousel: media in a set order, sliding a whole
     screen at a time, a 2px progress line and 4px indicators (css/desk.css).
     The progress line's CSS animation is the timer, so hovering pauses it,
     and under reduced motion there is none and nothing moves by itself.
     ←/→ while the pointer is on it, a swipe, or the indicators step it.
     aria-hidden, like the graph's canvas: every photograph is in the gallery
     pages already, as a real link. Built on first sight of the desk, so
     graph and mosaic never fetch the photographs. */
  var screen = { go: function () {}, pause: function () {} };
  function initScreen() {
    var host = desk.querySelector('[data-screen]');
    if (!host) return;
    var shots = D.screen.filter(real);
    var n = shots.length + 1;
    var at = 0, built = false, track, bar, dots;

    function build() {
      if (built || !desk.offsetWidth) return;
      built = true;
      host.innerHTML =
        '<ul class="scr__track"><li class="scr__slide"></li>' +
          shots.map(function (s) {
            var c = caption(s[0], s[1]);
            return '<li class="scr__slide"><a class="scr__link" tabindex="-1" data-cue="Open the photograph"' +
              ' href="' + safeUrl(photoHref(s[0], s[1])) + '">' +
              '<img src="' + safeUrl(shot(s[0], s[1])) + '" srcset="' + safeUrl(shot(s[0], s[1], 600)) + ' 600w, ' +
                safeUrl(shot(s[0], s[1])) + ' 1200w" sizes="(min-width: 1700px) 560px, 420px"' +
                ' alt="" decoding="async" draggable="false">' +
              '<span class="scr__cap">' + esc(c) + '</span>' +
            '</a></li>';
          }).join('') +
        '</ul>' +
        '<span class="scr__bar"><span></span></span>' +
        '<span class="scr__dots">' +
          shots.concat([0]).map(function (_, i) {
            return '<button type="button" tabindex="-1" data-to="' + i + '"></button>';
          }).join('') +
        '</span>';
      track = host.querySelector('.scr__track');
      bar = host.querySelector('.scr__bar span');
      dots = host.querySelectorAll('[data-to]');
      bar.addEventListener('animationend', function () { go(at + 1); });
      go(0);
    }

    function go(i) {
      if (!built) return;
      at = (i + n) % n;
      track.style.transform = 'translateX(' + (-100 * at) + '%)';
      for (var d = 0; d < dots.length; d++) dots[d].classList.toggle('is-on', d === at);
      host.classList.toggle('is-blank', at === 0);
      if (stage) stage.classList.toggle('is-onwork', at !== 0);
      // Restart the line: drop the animation, force a style flush, put it back.
      bar.style.animation = 'none';
      void bar.offsetWidth;
      bar.style.animation = '';
    }
    screen.go = go;
    screen.pause = function (on) { host.classList.toggle('is-paused', on); };

    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-to]');
      if (b) { go(+b.getAttribute('data-to')); return; }
      // The name's slide is the terminal's door.
      if (at === 0 && !e.target.closest('a')) openTerm('');
    });

    // Swipe: 40px sideways is a step, and the click that ends it is not a
    // visit to the slide under the finger.
    var x0 = null, swiped = false;
    host.addEventListener('pointerdown', function (e) { x0 = e.clientX; swiped = false; });
    host.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) { swiped = true; go(at + (dx < 0 ? 1 : -1)); }
    });
    host.addEventListener('click', function (e) {
      if (swiped) { e.preventDefault(); e.stopPropagation(); swiped = false; }
    }, true);
    host.addEventListener('dragstart', function (e) { e.preventDefault(); });

    var over = false;
    var glass = host.parentNode;
    glass.addEventListener('pointerenter', function () { over = true; });
    glass.addEventListener('pointerleave', function () { over = false; });
    document.addEventListener('keydown', function (e) {
      if (!over || !isDesk() || !termForm || !termForm.hidden) return;
      if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'ArrowLeft') go(at - 1);
      else if (e.key === 'ArrowRight') go(at + 1);
      // Typing at the screen opens the terminal with what was typed.
      else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        openTerm(e.key);
      }
    });

    // Leaving desk mode puts the name back on the screen for next time.
    window.addEventListener('modechange', function () { build(); go(0); });
    new ResizeObserver(build).observe(desk);
    build();
  }

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
      screen.pause(true);
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
      screen.pause(false);
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
    window.addEventListener('modechange', function () { if (!isDesk()) closeTerm(); });
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

  /* ---------- sticky notes ---------- */
  function flip(note, on) {
    note.classList.toggle('is-flipped', on);
    var front = note.querySelector('.sticky__front'), back = note.querySelector('.sticky__back');
    front.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (on) { front.setAttribute('inert', ''); back.removeAttribute('inert'); }
    else { back.setAttribute('inert', ''); front.removeAttribute('inert'); }
  }
  function initSticky() {
    var notes = desk.querySelectorAll('.sticky');
    var lines = D.sticky.filter(function (l) { return project(l[0]); });
    if (!lines.length) return;
    var start = dayNo() % lines.length;
    Array.prototype.forEach.call(notes, function (note, k) {
      var l = lines[(start + k) % lines.length], p = project(l[0]);
      note.querySelector('[data-sticky-line]').textContent = l[1];
      var a = note.querySelector('[data-sticky-link]');
      a.textContent = p.title;
      a.href = 'work/' + encodeURIComponent(p.id) + '.html';
      note.querySelector('.sticky__front').addEventListener('click', function () { flip(note, true); });
      // Pressing the back (not its link) sticks it down again.
      note.querySelector('.sticky__back').addEventListener('click', function (e) {
        if (!e.target.closest('a')) flip(note, false);
      });
    });
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

  /* ---------- the notebook ---------- */
  function initNotebook() {
    var nb = desk.querySelector('[data-notebook]');
    var notes = D.margin.filter(function (m) { return project(m[0]); });
    if (!nb || !notes.length) return;
    var m = notes[dayNo() % notes.length], p = project(m[0]);
    nb.href = 'work/' + encodeURIComponent(p.id) + '.html';
    nb.querySelector('[data-nb-phrase]').textContent = m[1];
    nb.querySelector('[data-nb-note]').textContent = m[2];
    nb.querySelector('[data-nb-from]').textContent = '— ' + p.title;
    nb.setAttribute('data-cue', 'Read ' + p.title);
  }

  /* ---------- the mug ---------- */
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function initMug() {
    var mug = desk.querySelector('[data-mug]');
    if (!mug) return;
    function sync() {
      var d = new Date().getDay(), drink = D.drinks[d] || ['tea', '#b9824f'];
      var t = root.getAttribute('data-time');
      var cold = t === 'night';
      mug.style.setProperty('--drink', /^#[0-9a-f]{6}$/i.test(drink[1]) ? drink[1] : '#b9824f');
      mug.classList.toggle('is-cold', cold);
      var say = DAYS[d] + '’s ' + drink[0] + (cold ? ', gone cold' : t === 'morning' ? ', fresh' : '');
      mug.setAttribute('data-cue', say);
      mug.setAttribute('aria-label', 'A mug: ' + say);
    }
    window.addEventListener('themechange', sync);
    sync();
  }

  /* ---------- the plant ----------
     Its health is the newest `pushed_at` among the live case studies
     (`updated` in js/project-data.js), against today. */
  function initPlant() {
    var plant = desk.querySelector('[data-plant]');
    if (!plant) return;
    var newest = 0;
    live.forEach(function (p) {
      var t = p.updated ? Date.parse(p.updated + 'T00:00:00') : NaN;
      if (t > newest) newest = t;
    });
    var say, state, droop = 0, lean = 0;
    if (!newest) {
      say = 'No repo dates to go on'; state = '';
    } else {
      var days = Math.max(0, Math.floor((Date.now() - newest) / 864e5));
      say = 'Last repo update ' + (days === 0 ? 'today' : days === 1 ? '1 day ago' : days + ' days ago');
      if (days < 14) state = '';
      else if (days < 30) { state = 'is-tired'; droop = 16; lean = 2; }
      else if (days < 60) { state = 'is-thirsty'; droop = 38; lean = 5; }
      else { state = 'is-wilted'; droop = 68; lean = 9; }
    }
    if (state) plant.classList.add(state);
    plant.style.setProperty('--droop', droop + 'deg');
    plant.style.setProperty('--lean', lean + 'deg');
    plant.setAttribute('data-cue', say);
    plant.setAttribute('aria-label', 'A desk plant. ' + say);
  }

  /* ---------- the card holder ----------
     A vCard made here, from what the page already shows. */
  function initCards() {
    var btn = desk.querySelector('[data-cards]');
    if (!btn) return;
    var holder = btn.closest('.cards');
    btn.addEventListener('click', function () {
      var c = D.card, names = c.name.split(' ');
      var vcf = [
        'BEGIN:VCARD', 'VERSION:3.0',
        'N:' + names.slice(1).join(' ') + ';' + names[0] + ';;;',
        'FN:' + c.name,
        'TITLE:' + (document.querySelector('.hero__role') || { textContent: '' }).textContent.trim(),
        'EMAIL;TYPE=INTERNET:' + c.email
      ].concat(c.urls.map(function (u) { return 'URL:' + u; }), ['END:VCARD']).join('\r\n') + '\r\n';
      var url = URL.createObjectURL(new Blob([vcf], { type: 'text/vcard' }));
      var a = document.createElement('a');
      a.href = url;
      a.download = c.name.toLowerCase().replace(/\s+/g, '-') + '.vcf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      holder.classList.add('is-taken');
      api.moved();
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
    window.addEventListener('modechange', place);
    place();
  }

  /* ---------- the mess ----------
     Every 45 s that the desk is on screen in desk mode, two things drift a
     little, the mug creeps, and every other time a sticky note comes
     unstuck and falls to the desk. "Tidy up" puts it all back. Never under
     reduced motion. */
  var MESS_MS = 45000;
  function initMess() {
    if (reduce) return;
    var seen = true, tick = 0;
    new IntersectionObserver(function (es) { seen = es[0].isIntersecting; }).observe(desk);
    function rand(a, b) { return a + Math.random() * (b - a); }
    window.setInterval(function () {
      if (!seen || document.hidden || !isDesk() || !desk.offsetWidth) return;
      tick++;
      var all = Array.prototype.filter.call(desk.querySelectorAll('[data-drag]'), function (el) {
        return !el.classList.contains('is-held') && !el.classList.contains('sticky');
      });
      for (var k = 0; k < 2 && all.length; k++) {
        var el = all.splice(Math.floor(Math.random() * all.length), 1)[0];
        api.nudge(el, rand(-14, 14), rand(-4, 4), rand(-3, 3));
      }
      var mug = desk.querySelector('[data-mug]');
      if (mug) { ring(mug.getBoundingClientRect()); api.nudge(mug, rand(6, 16), rand(-2, 2), 0); }
      if (tick % 2 === 0) {
        var up = desk.querySelector('.sticky:not(.is-fallen)');
        if (up) {
          var d = desk.getBoundingClientRect(), r = up.getBoundingClientRect();
          up.classList.add('is-fallen', 'is-falling');
          api.nudge(up, rand(-30, 30), d.top + d.height * 0.9 - r.bottom, rand(-28, 28));
          window.setTimeout(function () { up.classList.remove('is-falling'); }, 1000);
        }
      }
    }, MESS_MS);
  }

  /* ---------- drops and tidying ---------- */
  api.on('drop', function (el, from) {
    if (el.matches('[data-mug]')) ring(from);
    else if (el.classList.contains('sticky')) flip(el, true);
    else if (el.classList.contains('pola')) el.classList.add('is-developed');
  });
  api.on('tidy', function () {
    if (rings) rings.innerHTML = '';
    Array.prototype.forEach.call(desk.querySelectorAll('.sticky'), function (s) {
      s.classList.remove('is-fallen', 'is-falling');
      flip(s, false);
    });
    Array.prototype.forEach.call(desk.querySelectorAll('.pola'), function (p) { p.classList.remove('is-developed'); });
    var holder = desk.querySelector('.cards');
    if (holder) holder.classList.remove('is-taken');
  });

  window.onReady(function () {
    initTerm();
    initScreen();
    initWindow();
    initChip();
    initSticky();
    initPolaroids();
    initNotebook();
    initMug();
    initPlant();
    initCards();
    initNight();
    if (!window.isEditing()) initMess();
  });
})();
