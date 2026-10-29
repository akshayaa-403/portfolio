/* The opener — the first screen of a case study.

   After altermag.com's article openers: a textured ground, one drawn figure
   in the middle, and a chevron saying there is more. Scrolling draws the
   figure down until the article takes over. The scattered cloud of the
   project's own words that used to surround it was removed on 2026-10-30:
   the words overlapped each other and showed through the centrepieces.

   The figure is a drawing of the mechanism, never a screenshot: nothing here
   is evidence, and the case study below carries all of it. aria-hidden; the
   chevron is a real link to the article.

   Motion is gated: under prefers-reduced-motion nothing drifts. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* The drawn figure is the article's own: `opener(c)` in
     js/articles/<id>.js returns SVG markup for a 128×128 box, drawn with the
     colours it is handed (c.i ink, c.a accent, c.l line). Abstract on
     purpose — it signifies the mechanism and claims nothing measured. With no
     article, a plain ring stands in. */
  function plain(c) {
    return '<circle cx="64" cy="64" r="40" fill="none" stroke="' + c.a + '" stroke-width="1.4"/>';
  }

  /* ---------- centrepieces ----------
     Two projects get an object in the middle instead of a 128px drawing: a
     microscope whose field of view is the real frame, and a till that prints
     the screener's result. Each still sits in .op-figure, so it sinks and
     fades with the scroll exactly like the drawing does.

     Nothing here is measured or invented on the spot. The micrographs are
     the article's own stage images of img_0002 (written by the project's own
     code), and every receipt line is quoted from js/project-data.js or
     js/articles/quantamental-screener.js — the comment beside each says
     which. */
  var MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  function receiptDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? Number(m[3]) + ' ' + MONTHS[Number(m[2]) - 1] + ' ' + m[1] : '';
  }

  var PIECES = {
    /* The microscope. Drawn in a 320×340 box; the eyepiece's view is the
       circle at (200, 118) r 104, which the HTML view is laid over in
       percentages of the same box. Outside the lens is the frame as captured,
       inside it the hybrid output: phase-0002-raw / phase-0002-hybrid, the
       same frame, the pair the article itself calls Captured and Output. */
    'phase-contrast-denoising': {
      cls: 'scope',
      html: function () {
        var img = 'public/assets/projects/phase-0002-';
        return '<svg class="op-scope__body" viewBox="0 0 320 340">' +
            '<path class="ms-cone" d="M67 113 L121 50"/>' +
            '<line class="ms-cone" x1="10" y1="324" x2="170" y2="324"/>' +
            '<rect class="ms-f" x="22" y="306" width="132" height="16" rx="7"/>' +
            '<rect class="ms-f" x="100" y="256" width="16" height="50" rx="2"/>' +
            '<circle class="ms-a" cx="108" cy="290" r="4"/>' +
            '<path class="ms-arm" d="M48 304 C 30 262, 36 214, 92 170"/>' +
            '<path class="ms-arm ms-arm--in" d="M48 304 C 30 262, 36 214, 92 170"/>' +
            '<circle class="ms-f" cx="40" cy="250" r="9"/><circle class="ms-l" cx="40" cy="250" r="3"/>' +
            // The phase annulus under the stage: the ring that makes it phase contrast.
            '<ellipse class="ms-a" cx="108" cy="254" rx="15" ry="3.5"/>' +
            '<rect class="ms-f" x="62" y="240" width="92" height="8" rx="2"/>' +
            '<rect class="ms-s" x="84" y="235" width="50" height="5" rx="1"/>' +
            '<path class="ms-f" d="M103 217 h14 l-2 16 h-10 Z"/>' +
            '<rect class="ms-f" x="96" y="206" width="28" height="11" rx="3"/>' +
            '<g transform="rotate(-24 110 210)">' +
              '<rect class="ms-f" x="101" y="124" width="18" height="84" rx="2"/>' +
              '<rect class="ms-f" x="97" y="104" width="26" height="22" rx="3"/>' +
            '</g>' +
          '</svg>' +
          '<div class="op-scope__view">' +
            '<img src="' + img + 'raw.webp" alt="" width="256" height="256" draggable="false">' +
            '<img class="op-scope__clean" src="' + img + 'hybrid.webp" alt="" width="256" height="256" draggable="false">' +
            '<span class="op-scope__lens"></span>' +
          '</div>' +
          // Wording from the article's own alt text for these two images.
          '<p class="op-scope__cap">' +
            '<span><i class="op-scope__k op-scope__k--lens"></i>lens: after the U-Net</span>' +
            '<span><i class="op-scope__k"></i>field: img_0002 as captured</span>' +
          '</p>';
      },
      wire: function (el) {
        var view = el.querySelector('.op-scope__view');
        // The lens sits on a micrograph, which is dark whatever the theme,
        // so its ring is measured against that rather than against the page.
        if (window.portfolioPalette) {
          window.portfolioPalette.on(function () {
            el.style.setProperty('--lens', window.portfolioPalette.against(0, 3, '#1c1c1c'));
          });
        }
        // Direct manipulation, not animation: the lens is wherever the
        // pointer is, so it stays on under reduced motion. A mouse only has
        // to hover; touch and pen drag (touch-action: none on the view).
        function put(e) {
          var r = view.getBoundingClientRect();
          var x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
          var y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
          view.style.setProperty('--lx', (x * 100).toFixed(1) + '%');
          view.style.setProperty('--ly', (y * 100).toFixed(1) + '%');
        }
        view.addEventListener('pointerdown', function (e) {
          put(e);
          if (view.setPointerCapture) { try { view.setPointerCapture(e.pointerId); } catch (err) {} }
        });
        view.addEventListener('pointermove', put);
      }
    },

    /* The till. Lines print from the slot upward, one at a time; under
       reduced motion the receipt is already printed. `m` keeps a line on a
       phone, where there is room for about half of them. */
    'quantamental-screener': {
      cls: 'receipt',
      html: function (project) {
        var L = [
          ['h', project.title, '', 1],
          ['c', 'backtest 2025-10-11 → 2026-10-11', '', 1], // article, Exhibit VII: the re-run's window
          ['r'],
          ['', 'universe', '50 largest by cap', 1],        // article, Exhibit VI table: "the 50 largest by market cap"
          ['', 'momentum 12−1', '0.4'],                   // article, Exhibit IV formula caption: default weights
          ['', 'signed volume', '0.2'],
          ['', 'volatility', '0.1'],
          ['', 'sentiment', '0.3, 0 in backtest'],        // same weights; Exhibit V: "the backtest sets sentiment’s weight to 0"
          ['', 'signal lag', '1 day', 1],                 // project-data summary: "a one-day signal lag"
          ['', 'costs', '10 bps', 1],                     // project-data summary: "10 bps costs"
          ['', 'rebalances', '50 weekly'],                // article, Exhibit VII: "each of the 50 weekly rebalances"
          ['r', '', '', 1],
          ['', 'random portfolios', '2,000', 1],          // project-data summary: "a 2,000-portfolio random-selection test"
          ['', 'SPY', '+18.7%'],                          // article, Exhibit VII: "SPY at +18.7%"
          ['', 'median dart, gross', '+43.8%'],           // article, Exhibit VII: "The median dart made +43.8%, gross of costs"
          ['', 'picks, gross', '+68.6%', 1],              // article, Exhibit VII: "The picks are marked at +68.6% gross"
          ['', 'darts ≥ picks', '134 of 2,000'],          // article, Exhibit VII: "it settles at 134 of 2,000"
          ['', 'p', '135 / 2,001 = 0.067', 1],            // article, Exhibit VII caption: "p = 135 / 2,001 = 0.067"
          ['rr', '', '', 1],
          ['t', 'TOTAL', project.metric || '', 1],        // project-data metric, the owner's approved wording
          ['c', 'not significant at 5%', '', 1],          // article, Exhibit VII: "It is not significant at 5%."
          ['c', 'the beat over SPY is mostly survivorship', ''], // article, Exhibit VII verdict
          ['r', '', '', 1],
          ['c', 'last updated ' + receiptDate(project.updated), '', 1] // project-data `updated`
        ];
        var lines = L.map(function (l, i) {
          var cls = 'op-rc__l' + (l[0] ? ' op-rc__l--' + l[0] : '') + (l[3] ? '' : ' op-rc__l--x');
          var body = l[0] === 'r' || l[0] === 'rr' ? ''
            : l[2] ? '<span>' + esc(l[1]) + '</span><span>' + esc(l[2]) + '</span>'
            : '<span>' + esc(l[1]) + '</span>';
          return '<div class="' + cls + '" style="--i:' + i + '">' + body + '</div>';
        }).join('');
        return '<div class="op-rc__paper">' + lines + '</div>' +
          '<div class="op-rc__printer"><i class="op-rc__slot"></i><i class="op-rc__vent"></i><i class="op-rc__led"></i></div>';
      }
    }
  };

  function build(host, project, spec) {
    var piece = PIECES[project.id];
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

    var centre = piece
      ? '<div class="op-figure op-piece op-piece--' + piece.cls + '">' + piece.html(project) + '</div>'
      : '<svg class="op-figure" viewBox="0 0 128 128" width="128" height="128">' + figure() + '</svg>';

    host.innerHTML =
      '<div class="op-field" aria-hidden="true">' + centre + '</div>' +
      '<a class="op-more" href="#article">' +
        '<span class="op-more__t">' + esc(project.title) + '</span>' +
        '<span class="op-more__c" aria-hidden="true">⌄⌄</span>' +
      '</a>';

    var svgEl = host.querySelector('.op-figure');
    if (piece) {
      if (piece.wire) piece.wire(svgEl);
    } else if (window.portfolioPalette) {
      // The figure follows the palette, which is re-measured on a theme flip.
      window.portfolioPalette.on(function () { svgEl.innerHTML = figure(); });
    }

    if (reduce) return;

    /* Scroll sinks and fades the figure. One passive listener writing one
       custom property, so the work per frame is a style recalculation and
       not a layout. */
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
