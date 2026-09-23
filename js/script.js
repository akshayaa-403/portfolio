/* Homepage behaviour: experience, the project list, the reading shelf, scroll
   reveals and active-nav tracking.
   No dependencies. All motion is gated on prefers-reduced-motion. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- helpers ---------- */

  /* ---------- project list ----------
     A numbered list and nothing else. The square icon tile and the preview
     that faded in beside each row are gone: they were screenshots of a UI,
     which tells a reader what a thing looked like and never what it does. The
     case study carries a drawn diagram instead (see the `diagram` deep-dive
     kind in js/project-detail.js). */
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

  function row(p, n, lead) {
    // The group decides which half the screen covers, so the row carries it.
    var focus = (p.tech || []).slice(0, 4).map(esc)
      .join(' <span aria-hidden="true">/</span> ');
    var meta = [p.context || p.role, span(p)].filter(Boolean).map(esc).join(' · ');

    /* Link to the generated share page rather than project.html?id=. Both
       land in the same place — work/<id>.html redirects — but the generated
       one is a real document with its own <title> and og: tags, so a crawler,
       a chat unfurl or a reader with JS off gets the project's name instead
       of "Project — Akshayaa Kashyap". */
    return '<a class="rm reveal' + (lead ? ' rm--lead' : '') +
        '" href="work/' + encodeURIComponent(p.id) + '.html"' +
        (p.screen ? ' data-screen="' + [].concat(p.screen).map(safeUrl).join('|') + '"' : '') +
        ' data-group="' + esc(p.group || '') + '"' +
        ' data-cue="Read the case study">' +
        '<span class="rm__num" aria-hidden="true">' + (n < 10 ? '0' : '') + n + '</span>' +
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
    var n = 0;

    var html = GROUPS.map(function (g) {
      var rows = shown.filter(function (p) { return p.group === g.key; });
      if (!rows.length) return '';
      return '<div class="rm-group reveal" data-group="' + esc(g.key) + '">' +
          '<h3 class="rm-group__title">' + esc(g.title) + '</h3>' +
          '<p class="rm-group__note">' + esc(g.note) + '</p>' +
        '</div>' +
        rows.map(function (p) { n++; return row(p, n, n === 1); }).join('');
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

  /* ---------- experience ----------
     Above the project list, because it answers the question the project list
     cannot: whether any of this has been built for someone else, to a date.
     Data in js/experience-data.js. */
  function renderExperience() {
    if (typeof experience === 'undefined') return;

    var host = document.getElementById('experience-list');
    if (!host) return;

    host.insertAdjacentHTML('afterbegin', experience.map(function (x) {
      var bullets = (x.bullets || []).map(function (b) {
        return '<li>' + esc(b) + '</li>';
      }).join('');

      var stack = (x.stack || []).map(function (t) {
        return '<li>' + esc(t) + '</li>';
      }).join('');

      // A role that produced a case study on this site links to it, so the
      // claim and the evidence are one click apart.
      var proof = x.project
        ? '<a class="xp__proof" href="work/' + encodeURIComponent(x.project) +
            '.html">Read the case study →</a>'
        : '';

      return '<li class="xp reveal">' +
          '<div class="xp__head">' +
            '<h3 class="xp__role">' + esc(x.role) +
              ' <span class="xp__at">at</span> ' +
              '<span class="xp__company">' + esc(x.company) + '</span></h3>' +
            '<p class="xp__when">' +
              '<time datetime="' + esc(x.start || '') + '">' + esc(x.dates) + '</time>' +
              (x.place ? ' · ' + esc(x.place) : '') +
            '</p>' +
          '</div>' +
          (x.blurb ? '<p class="xp__blurb">' + esc(x.blurb) + '</p>' : '') +
          '<ul class="xp__bullets">' + bullets + '</ul>' +
          (stack ? '<ul class="xp__stack" aria-label="Stack">' + stack + '</ul>' : '') +
          proof +
        '</li>';
    }).join(''));
  }

  /* ---------- reading list ----------
     A shelf of spines rather than a list of titles. Each book is drawn from
     its own cover colour (js/readings-data.js); nothing is downloaded, so the
     section costs no image request and borrows no cover art.

     Two things are computed here rather than authored. The spine's height
     comes from the length of its title, which is what a real shelf looks like
     and also guarantees the vertical type has room. The ink comes from the
     colour's measured relative luminance — the same reason js/field.js
     measures rather than eyeballs: a mid-yellow and a mid-navy have similar
     HSL lightness and opposite contrast. */
  function spineInk(hex) {
    // The same measurement js/palette.js already does, so it is borrowed
    // rather than written again: whichever of white or near-black contrasts
    // harder against the spine wins, so every spine clears 4.5:1 by
    // construction.
    var P = window.portfolioPalette, c = P && P.toHsl(hex);
    if (!c) return '#10161d';
    var L = P.lum(P.hslRgb(c.h, c.s, c.l));
    return P.ratio(L, 1) >= P.ratio(L, 0) ? '#fbfcfd' : '#10161d';
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
      var CHAR = 0.68, title = b.title, author = b.author || '';
      var room = h - 34 - author.length * 9 * CHAR;
      var fs = Math.max(7.5, Math.min(12, room / (title.length * CHAR)));

      return '<li class="book-slot" style="--bt:' + t + 'px;--bw:' + w +
          'px;--bh:' + h + 'px">' +
        '<button class="book" type="button" data-book="' + i + '"' +
          ' aria-haspopup="dialog"' +
          ' data-cue="Take it off the shelf"' +
          ' style="--spine-bg:' + esc(b.colour || '#d9dde2') +
            ';--spine-ink:' + spineInk(b.colour) +
            ';--spine-fs:' + (Math.round(fs * 10) / 10) + 'px">' +
          /* The button fills the slot and never turns; the box inside it does.
             Rotating the button itself made its own box edge-on, so the
             pointer fell off the thing it was hovering, the book snapped back,
             and the click landed on nothing. */
          '<span class="book__turn">' +
            '<span class="book__spine">' +
              '<span class="spine__title">' + esc(title) + '</span>' +
              (author ? '<span class="spine__author">' + esc(author) + '</span>' : '') +
            '</span>' +
            // alt="": the button already announces the title and author, and
            // the caption below announces the rest. The cover is a picture of
            // information the page has already given.
            '<span class="book__cover">' +
              '<img src="' + safeUrl(b.cover) + '" alt="" draggable="false"' +
                ' loading="lazy" decoding="async">' +
            '</span>' +
          '</span>' +
        '</button>' +
      '</li>';
    }).join('');

    host.insertAdjacentHTML('afterbegin',
      '<ul class="shelf__books" role="list">' + spines + '</ul>' +
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
       the only two things on screen are the book and the note.

       The book is a real box, six faces on one 3-D transform, and it can be
       tumbled on both axes with the pointer or the arrow keys. The summary is
       handwritten onto a scrap of ruled paper, on the rules: js/note-data.js
       carries where every rule on every scrap is, measured offline by
       tools/trace-notes.py, so nothing is read back off a canvas here. Drop
       another scrap in public/assets/notes/, re-run the tool, and it joins
       the shuffle with no change to this file. */

    var dlg = document.createElement('dialog');
    dlg.className = 'bookview';
    dlg.innerHTML =
      '<button class="bookview__close" type="button" aria-label="Put it back">×</button>' +
      '<div class="bookview__inner"></div>';
    document.body.appendChild(dlg);
    var inner = dlg.querySelector('.bookview__inner');

    /* --- writing on the paper ---
       One <span> per rule, sitting ON it. The text is measured with the same
       font the spans are set in — a 2-D context is the only way to ask a
       browser how wide a string will be before it draws it — and wrapped to
       the width of the paper AT THAT RULE, which narrows where the scrap is
       torn.

       Returns null when the words do not fit the paper, which is how the
       caller knows to try a different scrap rather than overflowing one. */
    var ruler = document.createElement('canvas').getContext('2d');

    function write(paper, text) {
      var rules = paper.rules || [];
      if (rules.length < 2) return null;

      // The hand is sized off the gap between the rules, so it sits IN the
      // ruling rather than across it, whatever the paper. Then the sheet is
      // scaled until that hand is legible on screen — a scrap with tight
      // ruling is simply shown bigger — and capped so it still fits beside
      // the book.
      var gaps = [];
      for (var g = 1; g < rules.length; g++) gaps.push(rules[g].y - rules[g - 1].y);
      gaps.sort(function (x, y) { return x - y; });
      var gap = gaps[gaps.length >> 1];

      var scale = Math.max(340 / paper.w, 15 / (gap * 0.82));
      scale = Math.min(scale, 460 / paper.w);
      /* Clamped at both ends. Below 14px a hand is a squiggle; above 20px a
         generously ruled scrap eats its own capacity, because the writing
         grows with the ruling and the sheet does not. Between the two the
         type simply sits in whatever ruling the paper has. */
      var fs = Math.max(14, Math.min(20, gap * scale * 0.82));

      ruler.font = '500 ' + fs + 'px Caveat, cursive';

      /* ONE left margin, a ragged right — which is how anyone writes on ruled
         paper, and also what keeps the words off the paper's edges.

         The margin is the rightmost point any rule starts at, so no line can
         begin out on a torn strip or a row of punch holes while its
         neighbours begin further in. The right-hand end stays per-rule,
         because that is where the sheet is genuinely narrower — a tear, or a
         doodle lying over the ruling — and holding every line to the
         narrowest of them would waste most of the page. */
      var left = -Infinity;
      for (var e = 0; e < rules.length; e++) {
        if (rules[e].x0 > left) left = rules[e].x0;
      }
      left *= scale;
      var pad = Math.max(fs * 0.6, paper.w * scale * 0.035);
      left += pad;
      function roomAt(rule) { return rule.x1 * scale - pad - left; }

      var words = String(text).split(/\s+/);
      var lines = [], at = 0;
      for (var r = 0; r < rules.length && at < words.length; r++) {
        var room = roomAt(rules[r]);
        var line = '';
        while (at < words.length) {
          var next = line ? line + ' ' + words[at] : words[at];
          if (line && ruler.measureText(next).width > room) break;
          line = next;
          at++;
        }
        // A single word wider than the whole rule would otherwise loop forever.
        if (!line) { line = words[at]; at++; }
        lines.push({ rule: rules[r], text: line });
      }
      if (at < words.length) return null;          // ran out of paper

      return {
        scale: scale,
        html: lines.map(function (l) {
          return '<span class="notepaper__line" style="' +
            'left:' + left.toFixed(1) + 'px;' +
            'top:' + (l.rule.y * scale).toFixed(1) + 'px;' +
            'width:' + roomAt(l.rule).toFixed(1) + 'px;' +
            'font-size:' + fs.toFixed(1) + 'px">' + esc(l.text) + '</span>';
        }).join('')
      };
    }

    /* Shuffled, then the first scrap the summary actually fits on — so the
       paper is different each time a book is taken off the shelf, and the
       writing never runs off the bottom of one. If a summary has outgrown
       every scrap, the one with the most rules takes it and the overflow is
       dropped rather than piled on the last line; keep summaries short (see
       js/readings-data.js). */
    function paperFor(text) {
      var papers = (typeof notePapers === 'undefined' ? [] : notePapers).slice();
      if (!papers.length) return null;

      for (var i = papers.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = papers[i]; papers[i] = papers[j]; papers[j] = t;
      }

      for (var p = 0; p < papers.length; p++) {
        var set = write(papers[p], text);
        if (set) return { paper: papers[p], scale: set.scale, html: set.html };
      }

      var roomiest = papers.slice().sort(function (x, y) {
        return (y.rules || []).length - (x.rules || []).length;
      })[0];
      var words = text.split(/\s+/);
      while (words.length > 4) {
        words.pop();
        var fit = write(roomiest, words.join(' ') + '…');
        if (fit) return { paper: roomiest, scale: fit.scale, html: fit.html };
      }
      return null;
    }

    /* --- the book, as a box --- */
    function box(b) {
      var W = mm(b.widthMm || 135);
      var H = mm(b.heightMm || 200);
      var T = Math.max(18, mm((b.pages || 300) * 0.0575 + (b.hardback ? 5 : 2.5)));
      // Bigger than on the shelf: this is the thing being looked at.
      var k = 1.7;
      W *= k; H *= k; T *= k;

      return '<div class="book3d" data-book3d tabindex="0" role="application"' +
          ' aria-label="' + esc(b.title) + ' — drag, or use the arrow keys, to turn it"' +
          ' data-cue="Drag to turn it"' +
          ' style="--w:' + W + 'px;--h:' + H + 'px;--t:' + T + 'px">' +
        '<div class="book3d__box" data-book3d-box>' +
          '<span class="book3d__face book3d__face--front">' +
            '<img src="' + safeUrl(b.cover) + '" alt="" draggable="false">' +
          '</span>' +
          '<span class="book3d__face book3d__face--back"></span>' +
          '<span class="book3d__face book3d__face--spine"' +
            ' style="--spine-bg:' + esc(b.colour || '#d9dde2') +
              ';--spine-ink:' + spineInk(b.colour) + '">' +
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

      var text = b.summary || b.note || '';
      var sheet = paperFor(text);

      inner.innerHTML = box(b) +
        (sheet
          ? '<div class="notepaper" style="width:' + (sheet.paper.w * sheet.scale).toFixed(1) +
              'px;height:' + (sheet.paper.h * sheet.scale).toFixed(1) + 'px">' +
              '<img class="notepaper__sheet" src="' + safeUrl(sheet.paper.src) +
                '" alt="" aria-hidden="true">' +
              // The drawn lines are one sentence chopped into pieces; a screen
              // reader gets the sentence instead, once, below.
              '<span aria-hidden="true">' + sheet.html + '</span>' +
              '<p class="visually-hidden">' + esc(b.title) + ' by ' +
                esc(b.author || '') + '. ' + esc(text) + '</p>' +
            '</div>'
          : '<p class="notepaper__fallback">' + esc(text) + '</p>');

      turn(inner.querySelector('[data-book3d-box]'));
      dlg.showModal();
      var focusable = inner.querySelector('[data-book3d]');
      if (focusable) focusable.focus();
    }

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

      // The keyboard gets the same two axes.
      el.parentNode.addEventListener('keydown', function (e) {
        var k = e.key, step = e.shiftKey ? 45 : 15;
        if (k === 'ArrowLeft') ry -= step;
        else if (k === 'ArrowRight') ry += step;
        else if (k === 'ArrowUp') rx -= step;
        else if (k === 'ArrowDown') rx += step;
        else return;
        e.preventDefault();
        set();
      });
    }

    dlg.addEventListener('click', function (e) {
      // The dialog IS the vignette: a click that lands on neither the book nor
      // the paper is a click outside.
      if (e.target === dlg || e.target.closest('.bookview__close')) dlg.close();
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

  /* ---------- header shadow on scroll ---------- */
  function initHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  /* ---------- per-word mount reveal (About section) ----------
     Splits each target paragraph into per-word spans and staggers them in with
     blur(10px) + opacity 0.001 + y:10 → clear, 0.05s apart. These are the
     reference's own tokenization values (it applies them to captions rather
     than body copy). Fires when the block scrolls into view.

     Text nodes are walked and replaced in place so inline links survive the
     split — a naive innerHTML rebuild would destroy them. */
  function initWordReveal() {
    var hosts = document.querySelectorAll('[data-word-reveal]');
    if (!hosts.length) return;

    var words = [];

    function splitTextNode(node) {
      var parts = node.nodeValue.split(/(\s+)/);
      if (parts.length < 2 && !/\S/.test(node.nodeValue)) return;
      var frag = document.createDocumentFragment();
      for (var i = 0; i < parts.length; i++) {
        if (!parts[i]) continue;
        if (/^\s+$/.test(parts[i])) {
          frag.appendChild(document.createTextNode(parts[i]));
        } else {
          var span = document.createElement('span');
          span.className = 'word';
          span.textContent = parts[i];
          frag.appendChild(span);
          words.push(span);
        }
      }
      node.parentNode.replaceChild(frag, node);
    }

    function walk(el) {
      // Snapshot children first: we mutate the tree as we go.
      var kids = Array.prototype.slice.call(el.childNodes);
      for (var i = 0; i < kids.length; i++) {
        var n = kids[i];
        if (n.nodeType === 3) {
          splitTextNode(n);
        } else if (n.nodeType === 1 && !n.classList.contains('word')) {
          walk(n);
        }
      }
    }

    for (var h = 0; h < hosts.length; h++) {
      var paras = hosts[h].querySelectorAll('p');
      var n = 0;
      for (var p = 0; p < paras.length; p++) {
        var before = words.length;
        walk(paras[p]);
        // 0.05s stagger (the reference's value), but capped: this block runs to
        // ~130 words and an uncapped ramp would take 6.5s to finish, which
        // reads as broken rather than choreographed.
        for (var w = before; w < words.length; w++) {
          var d = n++ * 0.05;
          words[w].style.setProperty('--wd', (d > 1.6 ? 1.6 : d).toFixed(2) + 's');
        }
      }
    }
    if (!words.length) return;

    // Reduced motion: CSS never dims the words, so just mark them revealed.
    if (reduceMotion) {
      for (var k = 0; k < hosts.length; k++) hosts[k].classList.add('is-revealed');
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -15% 0px', threshold: 0.1 });

    for (var j = 0; j < hosts.length; j++) io.observe(hosts[j]);

    // Failsafe, same reasoning as initReveal: never leave text hidden, and
    // leave the observer connected so nothing loses its animation.
    window.setTimeout(function () {
      for (var m = 0; m < hosts.length; m++) hosts[m].classList.add('is-revealed');
    }, 5000);
  }

  
  /* ---------- boot ---------- */
  function init() {
    renderExperience();
    renderCards();
    renderReadings();
    initReveal();
    initActiveNav();
    initHeader();
    initWordReveal();
  }

  window.onReady(init);
})();
