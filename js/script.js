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
      return '<div class="rm-group reveal">' +
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
          ' aria-pressed="' + (i === 0 ? 'true' : 'false') + '"' +
          ' data-cue="Turn it around"' +
          ' style="--spine-bg:' + esc(b.colour || '#d9dde2') +
            ';--spine-ink:' + spineInk(b.colour) +
            ';--spine-fs:' + (Math.round(fs * 10) / 10) + 'px">' +
          '<span class="book__spine">' +
            '<span class="spine__title">' + esc(title) + '</span>' +
            (author ? '<span class="spine__author">' + esc(author) + '</span>' : '') +
          '</span>' +
          // alt="": the button already announces the title and author, and the
          // caption below announces the rest. The cover is a picture of
          // information the page has already given.
          '<span class="book__cover">' +
            '<img src="' + safeUrl(b.cover) + '" alt="" loading="lazy" decoding="async">' +
          '</span>' +
        '</button>' +
      '</li>';
    }).join('');

    host.insertAdjacentHTML('afterbegin',
      '<ul class="shelf__books" role="list">' + spines + '</ul>' +
      '<p class="shelf__caption" data-shelf-caption aria-live="polite"></p>');

    var caption = host.querySelector('[data-shelf-caption]');
    var buttons = host.querySelectorAll('.book');
    var at = -1;

    function show(i) {
      if (i === at || !books[i]) return;
      at = i;
      var b = books[i];
      caption.innerHTML =
        '<b>' + esc(b.title) + '</b> · ' + esc(b.author || '') +
        (b.note ? ' — ' + esc(b.note) : '');
      for (var n = 0; n < buttons.length; n++) {
        buttons[n].setAttribute('aria-pressed', n === i ? 'true' : 'false');
      }
    }

    for (var i = 0; i < buttons.length; i++) {
      // pointerenter rather than mouseover: it does not re-fire for every
      // child the pointer crosses inside the book. focus covers the keyboard,
      // click covers touch, where there is no hover at all.
      buttons[i].addEventListener('pointerenter', function (e) {
        show(+e.currentTarget.getAttribute('data-book'));
      });
      buttons[i].addEventListener('focus', function (e) {
        show(+e.currentTarget.getAttribute('data-book'));
      });
      buttons[i].addEventListener('click', function (e) {
        show(+e.currentTarget.getAttribute('data-book'));
      });
    }

    show(0);
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
