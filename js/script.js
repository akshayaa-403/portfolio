/* Homepage behaviour: the project list, the reading shelf, scroll
   reveals and active-nav tracking.
   No dependencies. All motion is gated on prefers-reduced-motion. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- project list ----------
     A card per project, in two columns by group: title, context and years,
     one line of what it is, the one measured result if there is one, and the
     stack. Hovering a card shows its media in the other column (initScreen,
     below). */
  /* The real span, not one year. Every card used to read "2026" off p.year,
     which made six projects spanning Jan 2025 to Aug 2026 look like a single
     weekend of portfolio-building. created/updated are already on the data for
     the detail page's header row; this is the same two dates, collapsed.
     Arteza has no public repo and therefore no dates, so it falls back. */
  function span(p) {
    var a = (p.created || '').slice(0, 4);
    var b = (p.updated || '').slice(0, 4);
    if (!a) return p.year || '';
    return a === b ? a : a + '–' + b;
  }

  /* The two groups the shown work falls into, in render order. A project's
     `group` in js/project-data.js picks one; anything with `archived: true`
     is in neither and drops to the archive list at the foot of the section. */
  var GROUPS = [
    { key: 'research', title: 'Research',
      note: 'Systems that measure something and report the number, including when the number is bad.' },
    { key: 'products', title: 'Products',
      note: 'Things built for someone else to open — a shop and a phone app.' }
  ];

  function row(p) {
    // The group decides which half the screen covers, so the row carries it.
    var focus = (p.tech || []).slice(0, 4).map(esc)
      .join(' <span aria-hidden="true">/</span> ');
    var meta = [p.context || p.role, span(p)].filter(Boolean).map(esc).join(' · ');

    /* Link to the generated share page rather than project.html?id=. Both
       land in the same place — work/<id>.html redirects — but the generated
       one is a real document with its own <title> and og: tags, so a crawler,
       a chat unfurl or a reader with JS off gets the project's name instead
       of "Project — Akshayaa Kashyap". */
    return '<a class="rm reveal" href="work/' + encodeURIComponent(p.id) + '.html"' +
        (p.screen ? ' data-screen="' + [].concat(p.screen).map(safeUrl).join('|') + '"' : '') +
        ' data-group="' + esc(p.group || '') + '"' +
        ' data-cue="Read the case study">' +
        '<span class="rm__text">' +
          '<span class="rm__title">' + esc(p.title) + '</span>' +
          (meta ? '<span class="rm__meta">' + meta + '</span>' : '') +
          '<span class="rm__desc">' + esc(p.tagline) + '</span>' +
          // One measured number per row, where there is one. Some projects
          // have nothing honest to put here, and the empty slot is the
          // hierarchy: a row carrying a figure is a row with a result.
          (p.metric ? '<span class="rm__metric">' + esc(p.metric) + '</span>' : '') +
          (focus ? '<span class="rm__focus"><span class="rm__focus-label">Focus</span>' + focus + '</span>' : '') +
        '</span>' +
      '</a>';
  }

  function renderCards() {
    if (typeof projects === 'undefined') return;

    var host = document.getElementById('recent-cards');
    if (!host) return;

    var shown = projects.filter(function (p) { return !p.archived; });
    var gone = projects.filter(function (p) { return p.archived; });

    var html = GROUPS.map(function (g) {
      var rows = shown.filter(function (p) { return p.group === g.key; });
      if (!rows.length) return '';
      return '<div class="rm-group reveal" data-group="' + esc(g.key) + '">' +
          '<h3 class="rm-group__title">' + esc(g.title) + '</h3>' +
          '<p class="rm-group__note">' + esc(g.note) + '</p>' +
        '</div>' +
        rows.map(row).join('');
    }).join('');

    /* The archive. These case studies are still written, still live and still
       linked — they are simply not what the work is now, and a list that
       shows everything ever built weights the old the same as the current.
       Kept as one quiet line rather than a second list. */
    if (gone.length) {
      html += '<p class="rm-archive reveal">' +
        '<span class="rm-archive__label">Also built</span> ' +
        gone.map(function (p) {
          return '<a href="work/' + encodeURIComponent(p.id) + '.html">' +
            esc(p.title) + '</a>';
        }).join('<span aria-hidden="true"> · </span>') +
      '</p>';
    }

    /* Replace, not prepend: index.html ships a real static copy of this list
       (written by tools/build-share-pages.js) so a crawler, a proxy or a
       reader with JS off sees the work rather than an empty column. When JS
       is running, this is the enhanced version of the same thing. */
    host.innerHTML = html;
    initScreen();
  }

  /* ---------- the screen ----------
     Hovering a row takes the OTHER column away and puts that project in the
     space it left: hover a product and Research goes, hover a research
     project and Products goes. Not an overlay — there is no panel, no border
     and no ground behind the media, so what is left on the page is the column
     you are reading and the thing you are pointing at.

     Each row carries its own media in data-screen (`screen` in
     js/project-data.js), one path or several; .mp4/.webm play muted and
     looping, anything else is a still. So swapping a screenshot for a screen
     recording is a data change and no code change.

     Blank is the resting state on purpose: a panel showing the first project
     by default is a panel nobody reads as belonging to the row under the
     cursor.

     GROUPS is the order of the columns, so the side to fill is the index of
     the group NOT being hovered. Below 800px the grid is one column, there is
     no other column to give up, and the CSS drops the whole thing. */
  function initScreen() {
    var screen = document.querySelector('[data-rm-screen]');
    var list = document.getElementById('recent-cards');
    if (!screen || !list) return;

    var at = null;
    function show(rm) {
      var src = rm && rm.getAttribute('data-screen');
      if (src === at) return;
      at = src;

      var hide = null;
      if (src) {
        var i = 0;
        for (var g = 0; g < GROUPS.length; g++) {
          if (GROUPS[g].key === rm.getAttribute('data-group')) i = g;
        }
        hide = GROUPS[i === 0 ? GROUPS.length - 1 : 0].key;
        screen.setAttribute('data-side', i === 0 ? 'right' : 'left');
        screen.setAttribute('data-on', '');
        screen.innerHTML = src.split('|').map(function (one) {
          return /\.(mp4|webm|ogv)$/i.test(one)
            ? '<video src="' + safeUrl(one) + '" autoplay muted loop playsinline></video>'
            : '<img src="' + safeUrl(one) + '" alt="" decoding="async">';
        }).join('');
      } else {
        screen.removeAttribute('data-on');
        screen.innerHTML = '';
      }

      // Which column stands down. Done here rather than in a selector because
      // CSS cannot compare one element's group against another's.
      var col = list.querySelectorAll('[data-group]');
      for (var k = 0; k < col.length; k++) {
        col[k].classList.toggle('is-stood-down',
          hide !== null && col[k].getAttribute('data-group') === hide);
      }
    }

    list.addEventListener('pointerover', function (e) {
      show(e.target.closest('.rm'));
    });
    // focusin/focusout so the keyboard gets the same view the pointer does.
    list.addEventListener('focusin', function (e) {
      var rm = e.target.closest('.rm');
      if (rm) show(rm);
    });
    list.addEventListener('focusout', function () { show(null); });
    list.addEventListener('pointerleave', function () { show(null); });
  }

  /* ---------- reading list ----------
     A shelf of spines rather than a list of titles. Each spine is its own
     cover's colour (`spine`, sampled by tools/spine-colours.py, so it costs
     no image fetch), and so is the back of the book; the cover image in
     public/assets/readings/ is only fetched when a book turns to show it. A
     book with no cover yet is black all round, its title on the front.

     Computed here rather than authored: every book's size, from the
     edition's real trim and page count; the spine's type size, solved until
     the title fits; and the spine's ink, from the colour's measured relative
     luminance — the same reason js/field.js measures rather than eyeballs: a
     mid-yellow and a mid-navy have similar HSL lightness and opposite
     contrast. */
  function spineInk(c) {
    // The same measurement js/palette.js already does, so it is borrowed
    // rather than written again: whichever of white or near-black contrasts
    // harder against the spine wins, so every spine clears 4.5:1 by
    // construction.
    var P = window.portfolioPalette;
    if (!P || !c) return '#10161d';
    var L = P.lum(P.hslRgb(c.h, c.s, c.l));
    return P.ratio(L, 1) >= P.ratio(L, 0) ? '#fbfcfd' : '#10161d';
  }

  var NO_COVER = '#111111';
  function spineStyle(b) {
    var bg = b.spine || NO_COVER;
    var P = window.portfolioPalette;
    return '--spine-bg:' + bg + ';--spine-ink:' + spineInk(P && P.toHsl(bg));
  }
  // Where a book has no cover yet, its front is the spine's colour with the
  // title set on it, on the shelf and off it.
  function front(b, lazy) {
    return b.cover
      ? '<img src="' + safeUrl(b.cover) + '" alt="" draggable="false"' +
          (lazy ? ' loading="lazy" decoding="async"' : '') + '>'
      : '<span class="cover-blank">' + esc(b.title) + '</span>';
  }

  function renderReadings() {
    if (typeof readings === 'undefined') return;

    var host = document.getElementById('readings-list');
    if (!host) return;

    var asOf = document.querySelector('[data-readings-asof]');
    if (asOf && readings.asOf) asOf.textContent = 'Updated ' + readings.asOf;

    var books = [];
    readings.groups.forEach(function (g) {
      g.books.forEach(function (b) { books.push(b); });
    });
    if (!books.length) return;

    /* Every book is drawn at its real size. PX_PER_MM is the one scale on the
       shelf, so a taller book is taller here because it is taller in life, and
       the spine's thickness comes from the page count rather than from a
       number picked to look nice. A leaf of book paper is about 0.115mm, so a
       page is half that, plus a few mm for the boards. */
    var PX_PER_MM = 1.16;
    var mm = function (v) { return Math.round(v * PX_PER_MM); };
    // The board's length: every spine and the gaps between them, plus room
    // for the widest cover to open, so a turning book never pushes past the
    // end of the shelf (or shoves the caption standing beside it).
    var spineSum = 0, grow = 0, GAP = 5;

    var spines = books.map(function (b, i) {
      var thickMm = (b.pages || 300) * 0.0575 + (b.hardback ? 5 : 2.5);
      var t = Math.max(18, mm(thickMm));
      var w = mm(b.widthMm || 135);
      var h = mm(b.heightMm || 200);

      // The spine has to hold its own type. The body face is monospaced, so a
      // character is 0.68em of advance and the pixels the title and author
      // need are known; the size is solved down until both fit rather than
      // being clipped, because a spine reading "The Art of Creative Think…"
      // has failed at the only job a spine has.
      // Below 9px a spine is unreadable, so when the title cannot reach 9px
      // beside its author, the author comes off the spine: the caption names
      // them anyway, and a spine has failed if its title is cut short.
      var CHAR = 0.68, title = b.title, author = b.author || '';
      var room = h - 34 - author.length * 9 * CHAR;
      if (author && room / (title.length * CHAR) < 9) { author = ''; room = h - 34; }
      var fs = Math.max(9, Math.min(12, room / (title.length * CHAR)));
      spineSum += t;
      grow = Math.max(grow, w - t);

      return '<li class="book-slot" style="--bt:' + t + 'px;--bw:' + w +
          'px;--bh:' + h + 'px">' +
        '<button class="book" type="button" data-book="' + i + '"' +
          ' aria-haspopup="dialog"' +
          ' data-cue="Take it off the shelf"' +
          ' style="' + spineStyle(b) +
            ';--spine-fs:' + (Math.round(fs * 10) / 10) + 'px">' +
          /* The button fills the slot and never turns; the box inside it does.
             Rotating the button itself made its own box edge-on, so the
             pointer fell off the thing it was hovering, the book snapped back,
             and the click landed on nothing. */
          '<span class="book__turn">' +
            '<span class="book__spine">' +
              '<span class="spine__title">' + esc(title) + '</span>' +
              (author ? '<span class="spine__author">' + esc(author) + '</span>'
                // Off the spine for room, but still part of the button's name.
                : b.author ? '<span class="visually-hidden">' + esc(b.author) + '</span>' : '') +
            '</span>' +
            // alt="": the button already announces the title and author, and
            // the caption below announces the rest. The cover is a picture of
            // information the page has already given.
            '<span class="book__cover">' + front(b, true) + '</span>' +
          '</span>' +
        '</button>' +
      '</li>';
    }).join('');

    host.insertAdjacentHTML('afterbegin',
      '<ul class="shelf__books" role="list" style="--shelf-w:' +
        (spineSum + GAP * (books.length - 1) + grow + 24) + 'px">' + spines + '</ul>' +
      '<p class="shelf__caption" data-shelf-caption aria-live="polite"></p>');

    var caption = host.querySelector('[data-shelf-caption]');
    var buttons = host.querySelectorAll('.book');

    /* The shelf below the spines names whichever book the pointer is on. The
       turn itself is pure CSS — :hover on the slot widens it and :hover on the
       button rotates it — so nothing here has to keep an "open" book in sync
       with the pointer. */
    var at = -1;
    function say(i) {
      if (i === at || !books[i]) return;
      at = i;
      var b = books[i];
      caption.innerHTML =
        '<b>' + esc(b.title) + '</b> · ' + esc(b.author || '') +
        (b.note ? ' — ' + esc(b.note) : '');
    }

    /* ---------- taking one off the shelf ----------
       A native <dialog> via showModal(), for the reason js/lightbox.js uses
       one: focus trapping, page inertness, Escape and ::backdrop come free.
       The dialog itself has no panel — the site is vignetted behind it and
       the only thing on screen is the book.

       The book is a real box, six faces on one 3-D transform, and it can be
       tumbled on both axes by dragging, or with Shift+←/→ and ↑/↓. The back
       is plain, in the spine's colour.

       Plain ←/→, and the two arrows at the sides, step along the shelf
       without putting the book back first. They wrap at either end. */

    var dlg = document.createElement('dialog');
    dlg.className = 'bookview';
    dlg.innerHTML =
      '<button class="bookview__close" type="button" aria-label="Put it back">×</button>' +
      '<button class="bookview__step bookview__step--prev" type="button" data-step="-1">‹</button>' +
      '<button class="bookview__step bookview__step--next" type="button" data-step="1">›</button>' +
      '<div class="bookview__inner"></div>';
    document.body.appendChild(dlg);
    var inner = dlg.querySelector('.bookview__inner');
    var steps = dlg.querySelectorAll('[data-step]');
    var cur = -1;

    /* --- the book, as a box --- */
    function box(b, i) {
      var W = mm(b.widthMm || 135);
      var H = mm(b.heightMm || 200);
      var T = Math.max(18, mm((b.pages || 300) * 0.0575 + (b.hardback ? 5 : 2.5)));
      // Bigger than on the shelf: this is the thing being looked at.
      var k = 1.7;
      W *= k; H *= k; T *= k;

      return '<div class="book3d" data-book3d tabindex="0" role="application"' +
          ' aria-label="' + esc(b.title) + ' — drag, or use Shift and the arrow keys, to turn it"' +
          ' data-cue="Drag to turn it"' +
          ' style="--w:' + W + 'px;--h:' + H + 'px;--t:' + T + 'px">' +
        '<div class="book3d__box" data-book3d-box style="' + spineStyle(b) + '">' +
          '<span class="book3d__face book3d__face--front">' + front(b) + '</span>' +
          '<span class="book3d__face book3d__face--back"></span>' +
          '<span class="book3d__face book3d__face--spine">' +
            '<span class="spine__title">' + esc(b.title) + '</span>' +
            '<span class="spine__author">' + esc(b.author || '') + '</span>' +
          '</span>' +
          '<span class="book3d__face book3d__face--fore"></span>' +
          '<span class="book3d__face book3d__face--head"></span>' +
          '<span class="book3d__face book3d__face--tail"></span>' +
        '</div>' +
      '</div>';
    }

    function open(i) {
      var b = books[i];
      if (!b || !dlg.showModal) return;

      cur = i;
      inner.innerHTML = box(b, i);
      // Each arrow names the book it leads to, for a screen reader and the cue.
      for (var s = 0; s < steps.length; s++) {
        var to = books[wrap(i + +steps[s].getAttribute('data-step'))];
        var name = (+steps[s].getAttribute('data-step') < 0 ? 'Previous: ' : 'Next: ') + to.title;
        steps[s].setAttribute('aria-label', name);
        steps[s].setAttribute('data-cue', name);
      }

      turn(inner.querySelector('[data-book3d-box]'));
      if (!dlg.open) dlg.showModal();
      say(i);
      var focusable = inner.querySelector('[data-book3d]');
      if (focusable) focusable.focus();
    }

    function wrap(i) { return (i + books.length) % books.length; }
    function step(d) { if (dlg.open) open(wrap(cur + d)); }

    /* --- tumbling it ---
       Free on both axes, as a thing you are holding rather than a thing on a
       shelf. The angles live on the element as custom properties so the CSS
       owns the transform and this only ever writes two numbers. */
    function turn(el) {
      if (!el) return;
      var rx = 8, ry = -32, down = null;

      function set() {
        el.style.setProperty('--rx', rx.toFixed(1) + 'deg');
        el.style.setProperty('--ry', ry.toFixed(1) + 'deg');
      }
      set();

      /* Belt and braces with draggable="false" on the cover: Chrome will still
         start a native image drag from a pointerdown that began on the <img>,
         and a book that tears off into a drag ghost cannot be turned. */
      el.parentNode.addEventListener('dragstart', function (e) { e.preventDefault(); });

      el.parentNode.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        down = { x: e.clientX, y: e.clientY };
        el.parentNode.setPointerCapture(e.pointerId);
        el.parentNode.classList.add('is-turning');
      });
      el.parentNode.addEventListener('pointermove', function (e) {
        if (!down) return;
        ry += (e.clientX - down.x) * 0.5;
        rx -= (e.clientY - down.y) * 0.5;
        down = { x: e.clientX, y: e.clientY };
        set();
      });
      function drop(e) {
        if (!down) return;
        down = null;
        try { el.parentNode.releasePointerCapture(e.pointerId); } catch (err) {}
        el.parentNode.classList.remove('is-turning');
      }
      el.parentNode.addEventListener('pointerup', drop);
      el.parentNode.addEventListener('pointercancel', drop);

      // The keyboard gets the same two axes. Plain ←/→ belong to the
      // dialog (next/previous book), so turning sideways needs Shift.
      el.parentNode.addEventListener('keydown', function (e) {
        var k = e.key, by = 15;
        if (k === 'ArrowLeft' && e.shiftKey) ry -= by;
        else if (k === 'ArrowRight' && e.shiftKey) ry += by;
        else if (k === 'ArrowUp') rx -= by;
        else if (k === 'ArrowDown') rx += by;
        else return;
        e.preventDefault();
        e.stopPropagation();
        set();
      });
    }

    dlg.addEventListener('click', function (e) {
      // The dialog IS the vignette: a click that lands off the book is a click
      // outside.
      var st = e.target.closest('[data-step]');
      if (st) step(+st.getAttribute('data-step'));
      else if (e.target === dlg || e.target.closest('.bookview__close')) dlg.close();
    });
    dlg.addEventListener('keydown', function (e) {
      if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
      else return;
      e.preventDefault();
    });
    dlg.addEventListener('close', function () { inner.innerHTML = ''; });

    for (var i = 0; i < buttons.length; i++) {
      // pointerenter rather than mouseover: it does not re-fire for every
      // child the pointer crosses inside the book.
      buttons[i].addEventListener('pointerenter', function (e) {
        say(+e.currentTarget.getAttribute('data-book'));
      });
      buttons[i].addEventListener('focus', function (e) {
        say(+e.currentTarget.getAttribute('data-book'));
      });
      buttons[i].addEventListener('click', function (e) {
        var n = +e.currentTarget.getAttribute('data-book');
        say(n);
        open(n);
      });
    }

    say(0);
  }

  /* ---------- scroll reveal ----------
     Reveals are a progressive enhancement: content must never be left hidden.
     A safety timer reveals anything the observer hasn't reached, which also
     covers full-page screenshot tools and jumps straight to a deep anchor. */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    function showAll() {
      for (var i = 0; i < items.length; i++) items[i].classList.add('is-visible');
    }

    if (reduceMotion) {
      showAll();
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

    for (var j = 0; j < items.length; j++) io.observe(items[j]);

    // Failsafe: nothing stays invisible for more than a few seconds. The
    // observer is left connected — disconnecting it here also cancelled the
    // staggered reveal for anything still below the fold.
    window.setTimeout(showAll, 4000);
  }

  /* ---------- active nav link ---------- */
  function initActiveNav() {
    var sections = document.querySelectorAll('main section[id]');
    var links = document.querySelectorAll('.nav a[href^="#"]');
    if (!sections.length || !links.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.getAttribute('id');
        var href = '#' + id;
        var i, hit = false;
        for (i = 0; i < links.length; i++) {
          if (links[i].getAttribute('href') === href) hit = true;
        }
        if (!hit) return;   // unmapped section: leave the current link lit
        for (i = 0; i < links.length; i++) {
          links[i].classList.toggle('is-active', links[i].getAttribute('href') === href);
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    for (var k = 0; k < sections.length; k++) io.observe(sections[k]);
  }

  /* ---------- Info intro: split-flap word and terminal chip ----------
     Both are <button>s in the prose. The split-flap shuffles every tile
     through random letters and lands them left to right; the terminal erases
     its phrase and types the next one. Under reduced motion the flap stays put
     and the terminal swaps its phrase without typing. */
  function initInfoIntro() {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    var flaps = document.querySelectorAll('[data-flap]');
    Array.prototype.forEach.call(flaps, function (btn) {
      var word = btn.getAttribute('data-flap');
      var cells = btn.querySelectorAll('.flap__tile span');
      var busy = false;
      btn.addEventListener('click', function () {
        if (busy || reduce) return;
        busy = true;
        var start = Date.now();
        (function tick() {
          var landed = 0;
          for (var i = 0; i < cells.length; i++) {
            if (Date.now() - start >= 350 + i * 90) { cells[i].textContent = word[i]; landed++; }
            else cells[i].textContent = ABC[Math.floor(Math.random() * 26)];
          }
          if (landed < cells.length) setTimeout(tick, 45); else busy = false;
        })();
      });
    });

    var terms = document.querySelectorAll('[data-term]');
    Array.prototype.forEach.call(terms, function (btn) {
      var list = btn.getAttribute('data-term').split('|');
      var out = btn.querySelector('.term__text');
      var at = 0, timer = null;
      btn.addEventListener('click', function () {
        clearTimeout(timer);
        at = (at + 1) % list.length;
        var next = list[at];
        if (reduce) { out.textContent = next; return; }
        function type(n) {
          out.textContent = next.slice(0, n);
          if (n < next.length) timer = setTimeout(function () { type(n + 1); }, 45);
        }
        (function erase() {
          if (out.textContent.length > 1) {
            out.textContent = out.textContent.slice(0, -1);
            timer = setTimeout(erase, 18);
          } else type(1);
        })();
      });
    });
  }

  /* ---------- boot ---------- */
  function init() {
    renderCards();
    renderReadings();
    initReveal();
    initActiveNav();
    initInfoIntro();
  }

  window.onReady(init);
})();
