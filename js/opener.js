/* The opener — the first screen of a case study.

   After altermag.com's article openers: a textured ground with the piece's own
   vocabulary scattered across it in small type, one drawn figure floating in
   the middle, and a chevron saying there is more. Scrolling thins the
   fragments out and draws the figure down until the article takes over.

   What is on it is the project's own words — its stack, the papers it leans
   on, the terms its README uses — placed deterministically from a seeded
   scatter, so a project opens the same way every time rather than being
   restless between reloads. The figure is a drawing of the mechanism, never a
   screenshot: nothing here is evidence, and the case study below carries all
   of it.

   aria-hidden in its entirety. Every word on the canvas appears again in the
   prose underneath, so a screen reader that skipped straight to the article
   has lost nothing; announcing forty scattered nouns first would only be
   noise. The chevron is a real link to the article's first heading.

   Motion is gated: under prefers-reduced-motion nothing drifts and the
   fragments hold their placed positions. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rnd(seed) {
    var s = seed || 1;
    return function () {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }

  /* A seeded scatter with a minimum separation, so fragments read as strewn
     rather than clumped. Twelve tries per word, then it takes what it has —
     a rejected word is better placed badly than dropped. */
  function scatter(n, seed) {
    var r = rnd(seed), out = [], tries, x, y, ok, i, j;
    for (i = 0; i < n; i++) {
      for (tries = 0; tries < 12; tries++) {
        x = 0.04 + r() * 0.88;
        // The top band is the sticky header's and the bottom band is the
        // title's, so the scatter only has the middle of the screen.
        y = 0.09 + r() * 0.70;
        ok = true;
        for (j = 0; j < out.length; j++) {
          if (Math.abs(out[j].x - x) < 0.17 && Math.abs(out[j].y - y) < 0.055) {
            ok = false; break;
          }
        }
        if (ok) break;
      }
      // Keep the middle band clear: the drawn figure lives there.
      if (Math.abs(x - 0.5) < 0.12 && Math.abs(y - 0.5) < 0.16) x += x < 0.5 ? -0.16 : 0.16;
      out.push({ x: x, y: y, d: 0.35 + r() * 0.65, s: r() });
    }
    return out;
  }

  /* The drawn figure is the article's own: `opener(c)` in
     js/articles/<id>.js returns SVG markup for a 128×128 box, drawn with the
     colours it is handed (c.i ink, c.a accent, c.l line). Abstract on
     purpose — it signifies the mechanism and claims nothing measured. With no
     article, a plain ring stands in. */
  function plain(c) {
    return '<circle cx="64" cy="64" r="40" fill="none" stroke="' + c.a + '" stroke-width="1.4"/>';
  }

  function build(host, project, spec) {
    var words = (project.fragments || []).slice(0, 34);
    if (!words.length) return;

    // The seed is the project's id, so the arrangement is that project's own
    // and never changes under it.
    var seed = 0;
    for (var i = 0; i < project.id.length; i++) seed = (seed * 31 + project.id.charCodeAt(i)) | 0;
    var spots = scatter(words.length, Math.abs(seed) + 7);

    var frags = words.map(function (word, n) {
      var sp = spots[n];
      return '<span class="op-frag" style="--fx:' + (sp.x * 100).toFixed(2) +
        '%;--fy:' + (sp.y * 100).toFixed(2) + '%;--fd:' + sp.d.toFixed(2) +
        ';--fdelay:' + (sp.s * 1.6).toFixed(2) + 's">' + esc(word) + '</span>';
    }).join('');

    var draw = spec && typeof spec.opener === 'function' ? spec.opener : plain;
    function figure() {
      var cs = getComputedStyle(host);
      var c = {
        i: cs.getPropertyValue('--ink').trim() || '#14314f',
        a: cs.getPropertyValue('--accent').trim() || '#094e94',
        l: cs.getPropertyValue('--line-strong').trim() || '#c3cedb'
      };
      try { return draw(c); } catch (e) { return plain(c); }
    }

    host.innerHTML =
      '<div class="op-field" aria-hidden="true">' + frags +
        '<svg class="op-figure" viewBox="0 0 128 128" width="128" height="128">' + figure() + '</svg>' +
      '</div>' +
      '<a class="op-more" href="#article">' +
        '<span class="op-more__t">' + esc(project.title) + '</span>' +
        '<span class="op-more__c" aria-hidden="true">⌄⌄</span>' +
      '</a>';

    // The figure follows the palette, which is re-measured on a theme flip.
    var svgEl = host.querySelector('.op-figure');
    if (window.portfolioPalette) window.portfolioPalette.on(function () { svgEl.innerHTML = figure(); });

    if (reduce) return;

    /* The words are alive: every so often one dissolves into the article's
       own glyph alphabet (`scramble` in its spec) and settles back, the way
       altermag's opener fragments do. Only while the opener is on screen. */
    var chars = spec && spec.scramble ? String(spec.scramble) : '';
    var spans = host.querySelectorAll('.op-frag');
    if (chars && spans.length) {
      window.setInterval(function () {
        if (document.hidden || window.scrollY > host.offsetHeight) return;
        var s = spans[Math.floor(Math.random() * spans.length)];
        if (s._busy) return;
        s._busy = true;
        var word = s.textContent, t0 = 0;
        function frame(now) {
          if (!t0) t0 = now;
          var p = Math.min(1, (now - t0) / 650);
          var out = '';
          for (var k = 0; k < word.length; k++) {
            out += word.charAt(k) === ' ' || k / word.length < (p - 0.35) / 0.65 ? word.charAt(k)
              : chars.charAt(Math.floor(Math.random() * chars.length));
          }
          s.textContent = out;
          if (p < 1) window.requestAnimationFrame(frame);
          else { s.textContent = word; s._busy = false; }
        }
        window.requestAnimationFrame(frame);
      }, 900);
    }

    /* Scroll thins the field out: each fragment drifts at its own depth and
       fades, and the figure sinks. One passive listener writing two custom
       properties, so the work per frame is a style recalculation and not a
       layout. */
    var field = host.querySelector('.op-field');
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var h = host.offsetHeight || 1;
        var p = Math.max(0, Math.min(1, window.scrollY / h));
        field.style.setProperty('--p', p.toFixed(3));
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  window.initOpener = function initOpener(project, spec) {
    var host = document.querySelector('[data-opener]');
    if (host && project) build(host, project, spec);
  };
})();
