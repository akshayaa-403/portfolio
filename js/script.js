/* Homepage behaviour: card rendering, scroll reveals, active-nav tracking,
   mobile menu, and the draggable hero collage.
   No dependencies. All motion is gated on prefers-reduced-motion. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- helpers ---------- */
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ---------- project cards ----------
     Two sections, matching the reference:

     Recently Made — a narrow single column of rows: square icon tile, title,
       one-line description. A larger preview image fades in on hover.
     Other Work — a two-column grid of wider cards: thumbnail, title,
       "context | year" meta, a short rule, description, and a link icon. */
  function renderCards() {
    if (typeof projects === 'undefined') return;

    var recentHost = document.getElementById('recent-cards');
    var otherHost = document.getElementById('other-cards');

    function detailHref(p) {
      return 'project.html?id=' + encodeURIComponent(p.id);
    }

    /* --- Recently Made --- */
    if (recentHost) {
      var recent = projects.filter(function (p) { return p.recent; });
      recentHost.insertAdjacentHTML('afterbegin', recent.map(function (p) {
        return '<a class="rm reveal" href="' + detailHref(p) + '">' +
            '<img class="rm__icon" src="public/assets/work/' + esc(p.id) + '-icon.webp" alt="" ' +
              'width="320" height="320" loading="lazy">' +
            '<span class="rm__text">' +
              '<span class="rm__title">' + esc(p.title) + '</span>' +
              '<span class="rm__desc">' + esc(p.tagline) + '</span>' +
            '</span>' +
            '<img class="rm__hover" src="public/assets/work/' + esc(p.id) + '-hover.webp" alt="" ' +
              'width="720" height="480" loading="lazy" aria-hidden="true">' +
          '</a>';
      }).join(''));
    }

    /* --- Other Work --- */
    if (otherHost) {
      var other = projects.filter(function (p) { return !p.recent; });
      otherHost.insertAdjacentHTML('afterbegin', other.map(function (p) {
        var link = p.demo || p.repo;
        return '<article class="ow reveal">' +
            '<img class="ow__thumb" src="public/assets/work/' + esc(p.id) + '-thumb.webp" alt="" ' +
              'width="400" height="300" loading="lazy">' +
            '<div class="ow__body">' +
              '<h3 class="ow__title"><a href="' + detailHref(p) + '">' + esc(p.title) + '</a></h3>' +
              '<p class="ow__meta">' + esc(p.context) + ' | ' + esc(p.year) + '</p>' +
              '<span class="ow__rule" aria-hidden="true"></span>' +
              '<p class="ow__desc">' + esc(p.tagline) + '</p>' +
              '<a class="ow__link" href="' + esc(link) + '" target="_blank" rel="noopener" ' +
                'aria-label="' + esc(p.title) + ' — open link">&#128279;</a>' +
            '</div>' +
          '</article>';
      }).join(''));
    }
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

    if (reduceMotion || !('IntersectionObserver' in window)) {
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

    // Failsafe: nothing stays invisible for more than a few seconds.
    window.setTimeout(function () {
      io.disconnect();
      showAll();
    }, 4000);
  }

  /* ---------- active nav link ---------- */
  function initActiveNav() {
    var sections = document.querySelectorAll('main section[id]');
    var links = document.querySelectorAll('.nav a[href^="#"]');
    if (!sections.length || !links.length || !('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.getAttribute('id');
        for (var i = 0; i < links.length; i++) {
          var match = links[i].getAttribute('href') === '#' + id;
          links[i].classList.toggle('is-active', match);
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

  /* ---------- mobile menu ---------- */
  function initNavToggle() {
    var btn = document.querySelector('[data-nav-toggle]');
    var nav = document.getElementById('primary-nav');
    if (!btn || !nav) return;

    var mq = window.matchMedia('(max-width: 809.98px)');

    function close() {
      nav.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
    function open() {
      nav.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
    }
    function sync() {
      if (mq.matches) { close(); } else { nav.hidden = false; btn.setAttribute('aria-expanded', 'false'); }
    }

    btn.addEventListener('click', function () {
      if (btn.getAttribute('aria-expanded') === 'true') { close(); } else { open(); }
    });

    nav.addEventListener('click', function (e) {
      if (mq.matches && e.target.tagName === 'A') close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mq.matches && btn.getAttribute('aria-expanded') === 'true') {
        close();
        btn.focus();
      }
    });

    if (mq.addEventListener) { mq.addEventListener('change', sync); }
    else if (mq.addListener) { mq.addListener(sync); }
    sync();
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
    var z = 10;

    // Only the chaos canvas is draggable; notebook and clean lay cards out in
    // normal flow, where absolute offsets would fight the layout.
    function chaos() {
      return document.documentElement.getAttribute('data-mode') !== 'notebook' &&
             document.documentElement.getAttribute('data-mode') !== 'clean';
    }

    function enable(on) {
      for (var i = 0; i < cards.length; i++) {
        cards[i].classList.toggle('is-draggable', on);
        if (on) {
          cards[i].setAttribute('aria-describedby', 'collage-help');
        } else {
          cards[i].removeAttribute('aria-describedby');
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

    function place(card, dx, dy) {
      card.dataset.dx = dx;
      card.dataset.dy = dy;
      var rot = getComputedStyle(card).getPropertyValue('--r') || '0deg';
      card.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + rot.trim() + ')';
    }

    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        var startX = 0, startY = 0, baseX = 0, baseY = 0, dragging = false, pid = null;

        card.addEventListener('pointerdown', function (e) {
          if (!wide.matches || !chaos() || e.button !== 0) return;
          // let links and buttons inside the card behave normally
          if (e.target.closest('a, button')) return;
          dragging = true;
          pid = e.pointerId;
          startX = e.clientX;
          startY = e.clientY;
          var o = offsets(card);
          baseX = o.x; baseY = o.y;
          card.classList.add('is-dragging');
          card.style.zIndex = ++z;
          if (card.setPointerCapture) card.setPointerCapture(pid);
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
          if (card.releasePointerCapture && pid !== null) {
            try { card.releasePointerCapture(pid); } catch (err) { /* already released */ }
          }
          pid = null;
        }
        card.addEventListener('pointerup', end);
        card.addEventListener('pointercancel', end);

        // Keyboard equivalent so the interaction isn't mouse-only
        card.addEventListener('keydown', function (e) {
          if (!wide.matches || !chaos()) return;
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
            card.style.zIndex = ++z;
          }
        });
      })(cards[i]);
    }

    function sync() { enable(wide.matches && chaos()); }
    if (wide.addEventListener) { wide.addEventListener('change', sync); }
    else if (wide.addListener) { wide.addListener(sync); }
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
    if (reduceMotion || !('IntersectionObserver' in window)) {
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

    // Failsafe, same reasoning as initReveal: never leave text hidden.
    window.setTimeout(function () {
      io.disconnect();
      for (var m = 0; m < hosts.length; m++) hosts[m].classList.add('is-revealed');
    }, 5000);
  }

  /* ---------- boot ---------- */
  function init() {
    renderCards();
    initReveal();
    initActiveNav();
    initHeader();
    initNavToggle();
    initCollage();
    initWordReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
