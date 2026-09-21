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

  /* ---------- the drawn figures ----------
     One per instrument kind. Abstract and diagrammatic on purpose: a cell with
     a collar, a closed tour, a clock cut in four. They signify the mechanism
     and claim nothing measured. */
  var FIGURE = {
    rank: function (c) {
      var bars = [0.82, 0.64, 0.47, 0.33, 0.2], out = '';
      bars.forEach(function (b, i) {
        out += '<rect x="' + (20 - 0) + '" y="' + (14 + i * 20) + '" width="' + (b * 84) +
          '" height="11" rx="2" fill="' + (i === 0 ? c.a : c.l) + '"' +
          (i === 0 ? '' : ' opacity="0.55"') + '/>';
      });
      return out + '<line x1="14" y1="8" x2="14" y2="118" stroke="' + c.l + '" stroke-width="1"/>';
    },
    halo: function (c) {
      return '<circle cx="64" cy="64" r="46" fill="none" stroke="' + c.a +
        '" stroke-width="10" opacity="0.14"/>' +
        '<circle cx="64" cy="64" r="34" fill="none" stroke="' + c.a +
        '" stroke-width="5" opacity="0.3"/>' +
        '<circle cx="64" cy="64" r="24" fill="' + c.i + '" opacity="0.14"/>' +
        '<circle cx="64" cy="64" r="24" fill="none" stroke="' + c.a + '" stroke-width="1.4"/>';
    },
    colony: function (c) {
      var pts = [[64, 12], [104, 40], [96, 92], [56, 112], [20, 80], [26, 34]];
      var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join(' ') + ' Z';
      var dots = pts.map(function (p, i) {
        return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (i === 0 ? 5 : 3.2) +
          '" fill="' + (i === 0 ? c.a : c.i) + '"/>';
      }).join('');
      return '<path d="' + d + '" fill="none" stroke="' + c.a +
        '" stroke-width="1.6" opacity="0.75"/>' + dots;
    },
    grid: function (c) {
      return '<circle cx="64" cy="64" r="50" fill="none" stroke="' + c.l + '" stroke-width="1"/>' +
        '<line x1="64" y1="14" x2="64" y2="114" stroke="' + c.l + '" stroke-width="1"/>' +
        '<line x1="14" y1="64" x2="114" y2="64" stroke="' + c.l + '" stroke-width="1"/>' +
        '<path d="M64 64 L64 14 A50 50 0 0 1 114 64 Z" fill="' + c.a + '" opacity="0.16"/>' +
        '<circle cx="88" cy="40" r="4" fill="' + c.a + '"/>';
    },
    pick: function (c) {
      var out = '', lit = [1, 4, 5, 9];
      for (var i = 0; i < 12; i++) {
        var on = lit.indexOf(i) !== -1;
        out += '<rect x="18" y="' + (12 + i * 9) + '" width="' +
          (46 + (i % 4) * 16) + '" height="4.5" rx="2" fill="' +
          (on ? c.a : c.l) + '" opacity="' + (on ? 1 : 0.45) + '"/>';
      }
      return out;
    },
    orbit: function (c) {
      var out = '<circle cx="64" cy="64" r="44" fill="none" stroke="' + c.l +
        '" stroke-width="1" stroke-dasharray="3 6"/>';
      for (var i = 0; i < 5; i++) {
        var a = (i / 5) * 6.2832 - 1.57;
        var rr = i === 1 ? 16 : 44;
        out += '<circle cx="' + (64 + Math.cos(a) * rr).toFixed(1) + '" cy="' +
          (64 + Math.sin(a) * rr).toFixed(1) + '" r="' + (i === 1 ? 7 : 4.5) +
          '" fill="' + (i === 1 ? c.a : c.i) + '" opacity="' + (i === 1 ? 1 : 0.6) + '"/>';
      }
      return out + '<circle cx="64" cy="64" r="3" fill="' + c.a + '"/>';
    }
  };

  function build(host, project) {
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

    var c = {
      i: getComputedStyle(host).getPropertyValue('--ink').trim() || '#14314f',
      a: getComputedStyle(host).getPropertyValue('--accent').trim() || '#094e94',
      l: getComputedStyle(host).getPropertyValue('--line-strong').trim() || '#c3cedb'
    };
    var fig = (FIGURE[(project.instrument || {}).kind] || FIGURE.halo)(c);

    host.innerHTML =
      '<div class="op-field" aria-hidden="true">' + frags +
        '<svg class="op-figure" viewBox="0 0 128 128" width="128" height="128">' + fig + '</svg>' +
      '</div>' +
      '<a class="op-more" href="#overview-h">' +
        '<span class="op-more__t">' + esc(project.title) + '</span>' +
        '<span class="op-more__c" aria-hidden="true">⌄⌄</span>' +
      '</a>';

    if (reduce) return;

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

  window.initOpener = function initOpener(project) {
    var host = document.querySelector('[data-opener]');
    if (host && project) build(host, project);
  };
})();
