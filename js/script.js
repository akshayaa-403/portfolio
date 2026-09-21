/* Homepage behaviour: card rendering, scroll reveals, active-nav tracking,
   mobile menu, and the draggable hero collage (notebook mode).
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

  function renderCards() {
    if (typeof projects === 'undefined') return;

    var host = document.getElementById('recent-cards');
    if (!host) return;

    /* Replace, not prepend: index.html now ships a real static copy of this
       list (written by tools/build-share-pages.js) so a crawler, a proxy or a
       reader with JS off sees the work rather than an empty column. When JS is
       running, this is the enhanced version of the same thing. */
    host.innerHTML = projects.map(function (p, i) {
      var focus = (p.tech || []).slice(0, 4).map(esc)
        .join(' <span aria-hidden="true">/</span> ');
      var meta = [p.context || p.role, span(p)].filter(Boolean).map(esc).join(' · ');

      /* Link to the generated share page rather than project.html?id=. Both
         land in the same place — work/<id>.html redirects — but the generated
         one is a real document with its own <title> and og: tags, so a crawler,
         a chat unfurl or a reader with JS off gets the project's name instead
         of "Project — Akshayaa Kashyap". */
      return '<a class="rm reveal' + (i === 0 ? ' rm--lead' : '') +
          '" href="work/' + encodeURIComponent(p.id) + '.html"' +
          ' data-cue="Read the case study">' +
          '<span class="rm__num" aria-hidden="true">' + (i < 9 ? '0' : '') + (i + 1) + '</span>' +
          '<span class="rm__text">' +
            '<span class="rm__title">' + esc(p.title) + '</span>' +
            (meta ? '<span class="rm__meta">' + meta + '</span>' : '') +
            '<span class="rm__desc">' + esc(p.tagline) + '</span>' +
            // One measured number per row, where there is one. Three of the
            // seven have nothing honest to put here, and an empty slot is the
            // hierarchy: the rows that carry a figure are the strong ones.
            (p.metric ? '<span class="rm__metric">' + esc(p.metric) + '</span>' : '') +
            (focus ? '<span class="rm__focus"><span class="rm__focus-label">Focus</span>' + focus + '</span>' : '') +
          '</span>' +
        '</a>';
    }).join('');
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
    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
    if (!m) return '#111';
    var n = parseInt(m[1], 16);
    var c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    var L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    // Contrast against white is (1.05)/(L+0.05); against black (L+0.05)/0.05.
    // Whichever is larger wins, so every spine clears 4.5:1 by construction.
    return (1.05 / (L + 0.05)) >= ((L + 0.05) / 0.05) ? '#fbfcfd' : '#10161d';
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

  /* ---------- draggable collage ----------
     Pointer-based dragging, enabled only on wide screens where the cards are
     absolutely positioned. Cards stay keyboard-focusable and can be nudged
     with arrow keys, and the whole thing is skipped under reduced motion. */
  function initCollage() {
    var stage = document.querySelector('[data-collage]');
    if (!stage) return;

    var cards = stage.querySelectorAll('.obj');
    var wide = window.matchMedia('(min-width: 900px)');
    var STEP = 12;
    var Z_BASE = 10, Z_MAX = 400;
    var z = Z_BASE;

    /* Bring a card to the front. z was previously incremented without bound,
       so a long session could climb past the header (100) and the skip link
       (200). Renumber from the base once it gets near the ceiling. */
    function toFront(card) {
      if (z >= Z_MAX) {
        var order = Array.prototype.slice.call(cards).sort(function (a, b) {
          return (parseInt(a.style.zIndex, 10) || 0) -
                 (parseInt(b.style.zIndex, 10) || 0);
        });
        z = Z_BASE;
        for (var i = 0; i < order.length; i++) {
          if (order[i].style.zIndex) order[i].style.zIndex = ++z;
        }
      }
      card.style.zIndex = ++z;
    }

    // Only notebook keeps the desk-object arrangement, so only notebook is
    // draggable. graph replaces the stage with the latent field and hides
    // every card; mosaic is deliberately static. Enabling drag in either would
    // put tabindex on a display:none card.
    function draggableMode() {
      return document.documentElement.getAttribute('data-mode') === 'notebook';
    }

    function enable(on) {
      for (var i = 0; i < cards.length; i++) {
        cards[i].classList.toggle('is-draggable', on);
        if (on) {
          cards[i].setAttribute('aria-describedby', 'collage-help');
          // The help text promises an arrow-key path, so the card has to be
          // reachable by keyboard for that promise to hold.
          cards[i].setAttribute('tabindex', '0');
        } else {
          cards[i].removeAttribute('aria-describedby');
          cards[i].removeAttribute('tabindex');
          delete cards[i].dataset.rot;
          cards[i].style.transform = '';
          cards[i].style.zIndex = '';
          delete cards[i].dataset.dx;
          delete cards[i].dataset.dy;
        }
      }
    }

    if (reduceMotion) { enable(false); return; }

    function offsets(card) {
      return {
        x: parseFloat(card.dataset.dx || '0'),
        y: parseFloat(card.dataset.dy || '0')
      };
    }

    /* --r is authored per card and never changes, but reading it through
       getComputedStyle forces a style recalc — and this ran on every
       pointermove. Resolve it once per card and cache it. */
    function authoredRotation(card) {
      if (card.dataset.rot === undefined) {
        card.dataset.rot =
          (getComputedStyle(card).getPropertyValue('--r') || '0deg').trim();
      }
      return card.dataset.rot;
    }

    function place(card, dx, dy) {
      card.dataset.dx = dx;
      card.dataset.dy = dy;
      card.style.transform =
        'translate(' + dx + 'px,' + dy + 'px) rotate(' + authoredRotation(card) + ')';
    }

    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        var startX = 0, startY = 0, baseX = 0, baseY = 0, dragging = false, pid = null;

        card.addEventListener('pointerdown', function (e) {
          if (!wide.matches || !draggableMode() || e.button !== 0) return;
          // let links and buttons inside the card behave normally
          if (e.target.closest('a, button')) return;
          dragging = true;
          pid = e.pointerId;
          startX = e.clientX;
          startY = e.clientY;
          var o = offsets(card);
          baseX = o.x; baseY = o.y;
          card.classList.add('is-dragging');
          toFront(card);
          card.setPointerCapture(pid);
        });

        card.addEventListener('pointermove', function (e) {
          if (!dragging || e.pointerId !== pid) return;
          e.preventDefault();
          place(card, baseX + (e.clientX - startX), baseY + (e.clientY - startY));
        });

        function end(e) {
          if (!dragging || (e && e.pointerId !== pid)) return;
          dragging = false;
          card.classList.remove('is-dragging');
          if (pid !== null) {
            try { card.releasePointerCapture(pid); } catch (err) { /* already released */ }
          }
          pid = null;
        }
        card.addEventListener('pointerup', end);
        card.addEventListener('pointercancel', end);

        // Keyboard equivalent so the interaction isn't mouse-only
        card.addEventListener('keydown', function (e) {
          if (!wide.matches || !draggableMode()) return;
          var o = offsets(card), moved = true;
          switch (e.key) {
            case 'ArrowLeft':  place(card, o.x - STEP, o.y); break;
            case 'ArrowRight': place(card, o.x + STEP, o.y); break;
            case 'ArrowUp':    place(card, o.x, o.y - STEP); break;
            case 'ArrowDown':  place(card, o.x, o.y + STEP); break;
            case 'Home':       place(card, 0, 0); break;
            default: moved = false;
          }
          if (moved) {
            e.preventDefault();
            toFront(card);
          }
        });
      })(cards[i]);
    }

    function sync() { enable(wide.matches && draggableMode()); }
    wide.addEventListener('change', sync);
    window.addEventListener('modechange', sync);
    sync();

    var help = document.createElement('p');
    help.id = 'collage-help';
    help.className = 'visually-hidden';
    help.textContent = 'Draggable card. Use the arrow keys to move it, or Home to reset its position.';
    stage.appendChild(help);
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
    initCollage();
    initWordReveal();
  }

  window.onReady(init);
})();
