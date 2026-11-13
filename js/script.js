/* Homepage behaviour: the project list, the reading shelf, scroll
   reveals and active-nav tracking.
   No dependencies. All motion is gated on prefers-reduced-motion. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- project list ----------
     One row of tiles, after khy.com's product rows: picture, group, title,
     one line of what it is, then context and years. The archived case
     studies get one line under the row. */
  /* The real span, not one year: created/updated collapsed. Arteza has no
     public repo and therefore no dates, so it falls back to p.year. */
  function span(p) {
    var a = (p.created || '').slice(0, 4);
    var b = (p.updated || '').slice(0, 4);
    if (!a) return p.year || '';
    return a === b ? a : a + '–' + b;
  }

  /* The groups the shown work falls into, in render order. A project's
     `group` in js/project-data.js picks one; anything with `archived: true`
     is in neither and drops to "Also built" under the row.
     Declared again in tools/build-share-pages.js — change both. */
  var GROUPS = [
    { key: 'research', title: 'Research' },
    { key: 'products', title: 'Products' }
  ];

  /* The first item of `screen` in js/project-data.js: .mp4/.webm play muted
     and looping, anything else is a still. */
  function media(src) {
    var one = [].concat(src || [])[0];
    if (!one) return '';
    return /\.(mp4|webm|ogv)$/i.test(one)
      ? '<video src="' + safeUrl(one) + '" autoplay muted loop playsinline></video>'
      : '<img src="' + safeUrl(one) + '" alt="" loading="lazy" decoding="async">';
  }

  function tile(p, g) {
    var meta = [p.context || p.role, span(p)].filter(Boolean).map(esc).join(' · ');
    /* Link to the generated share page rather than project.html?id=: a real
       document with its own <title> and og: tags, so a crawler, a chat unfurl
       or a reader with JS off gets the project's name. */
    return '<a class="tile reveal" href="work/' + encodeURIComponent(p.id) + '.html">' +
        '<span class="tile__img" aria-hidden="true">' + media(p.screen) + '</span>' +
        '<span class="tile__kicker">' + esc(g.title) + '</span>' +
        '<span class="tile__title">' + esc(p.title) + '</span>' +
        '<span class="tile__desc">' + esc(p.tagline) + '</span>' +
        (meta ? '<span class="tile__meta">' + meta + '</span>' : '') +
      '</a>';
  }

  function renderCards() {
    if (typeof projects === 'undefined') return;

    var host = document.getElementById('recent-cards');
    if (!host) return;

    var gone = projects.filter(function (p) { return p.archived; });
    var tiles = GROUPS.map(function (g) {
      return projects.filter(function (p) { return !p.archived && p.group === g.key; })
        .map(function (p) { return tile(p, g); }).join('');
    }).join('');

    /* Still written, still live, still linked — just not what the work is
       now. One quiet line under the row, not a second row. */
    var archive = '';
    if (gone.length) {
      archive = '<p class="rm-archive reveal">' +
        '<span class="rm-archive__label">Also built</span> ' +
        gone.map(function (p) {
          /* article: false = no case study yet; link the repo instead of an empty page. */
          var href = p.article === false ? safeUrl(p.repo) : 'work/' + encodeURIComponent(p.id) + '.html';
          return '<a href="' + href + '">' + esc(p.title) + '</a>';
        }).join('<span aria-hidden="true"> · </span>') +
      '</p>';
    }

    /* Replace, not prepend: index.html ships a real static copy of this
       (written by tools/build-share-pages.js) so a reader with JS off sees
       the same row. */
    host.innerHTML = '<div class="tiles">' + tiles + '</div>' + archive;
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
  // title set on it, on the shelf and off it. On the shelf (`lazy`) the cover
  // is fetched only when its book is first pointed at or focused (say()):
  // loading="lazy" fetched all of them, ~900 KB, the moment the shelf
  // scrolled into view, for covers that are hidden until a book turns.
  function front(b, lazy) {
    return b.cover
      ? '<img ' + (lazy ? 'data-src' : 'src') + '="' + safeUrl(b.cover) + '" alt="" draggable="false" decoding="async">'
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
    var PX_PER_MM = 0.9;
    var mm = function (v) { return Math.round(v * PX_PER_MM); };
    // The board's length: every spine and the gaps between them, plus room
    // for the widest cover to open, so a turning book never pushes past the
    // end of the shelf (or shoves the caption standing beside it).
    var spineSum = 0, grow = 0, GAP = 5;

    var spines = books.map(function (b, i) {
      var thickMm = (b.pages || 300) * 0.0575 + (b.hardback ? 5 : 2.5);
      // 24px floor: a spine is a button, and 24px is the smallest target
      // WCAG 2.5.8 allows. Only the thinnest books are drawn thicker for it.
      var t = Math.max(24, mm(thickMm));
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
      var img = buttons[i].querySelector('img[data-src]');
      if (img) { img.src = img.getAttribute('data-src'); img.removeAttribute('data-src'); }
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

  /* ---------- boot ---------- */
  function init() {
    renderCards();
    renderReadings();
    initReveal();
    initActiveNav();
  }

  window.onReady(init);
})();
