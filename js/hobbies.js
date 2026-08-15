/* Hobbies — three cards in a triangular arrangement.

   Each card links to its own page (hobby.html?id=...) rather than expanding
   inline. On hover a neural-net mesh animates over the card: particles drift
   and draw a line to every neighbour within a radius, the same idea as the
   canvas mesh on jackiehu.dev.

   One shared canvas per card, created on first hover and torn down on leave,
   so idle cards cost nothing. The whole effect is gated on
   prefers-reduced-motion. */
(function () {
  'use strict';

  var GROUPS = [
    { id: 'photography', label: 'Photography', note: 'light, and whatever it lands on', n: 29 },
    { id: 'artwork',     label: 'Artwork',     note: 'graphite, ink and gouache',       n: 6  },
    { id: 'cooking',     label: 'Cooking',     note: 'mostly dinner, occasionally dessert', n: 15 }
  ];

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- neural-net mesh ---------- */
  function mesh(card) {
    var canvas = document.createElement('canvas');
    canvas.className = 'hob-mesh';
    canvas.setAttribute('aria-hidden', 'true');
    card.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, nodes = [], raf = 0, alpha = 0;

    function size() {
      var r = card.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      // Node count scales with area so a wide card is not sparser than a tall
      // one; capped so the O(n^2) neighbour pass stays cheap.
      var n = Math.min(46, Math.max(16, Math.round(w * h / 5200)));
      nodes = [];
      for (var i = 0; i < n; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.34,
          vy: (Math.random() - 0.5) * 0.34,
          r: 1 + Math.random() * 1.4
        });
      }
    }

    var LINK = 108;      // px: draw a line below this separation

    function frame() {
      alpha = Math.min(1, alpha + 0.055);        // fade the whole mesh in
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < nodes.length; i++) {
        var p = nodes[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }

      // ponytail: O(n^2) neighbour scan, fine at n<=46; grid-bucket if it grows
      ctx.lineWidth = 1;
      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d > LINK) continue;
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.5 * (1 - d / LINK) * alpha).toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(nodes[a].x, nodes[a].y);
          ctx.lineTo(nodes[b].x, nodes[b].y);
          ctx.stroke();
        }
      }
      ctx.fillStyle = 'rgba(255,255,255,' + (0.85 * alpha).toFixed(3) + ')';
      for (var k = 0; k < nodes.length; k++) {
        ctx.beginPath();
        ctx.arc(nodes[k].x, nodes[k].y, nodes[k].r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    size(); seed(); frame();

    return function destroy() {
      cancelAnimationFrame(raf);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }

  function init() {
    var host = document.getElementById('hobby-groups');
    if (!host) return;

    host.innerHTML =
      '<div class="hob-tri">' +
        GROUPS.map(function (g) {
          return '<a class="hob-card" href="hobby.html?id=' + esc(g.id) + '">' +
            '<img src="public/assets/hobbies/' + esc(g.id) + '-1.webp" alt=""' +
                 ' aria-hidden="true" width="600" height="450" loading="lazy" decoding="async">' +
            '<span class="hob-card__body">' +
              '<span class="hob-card__label">' + esc(g.label) + '</span>' +
              '<span class="hob-card__note">' + esc(g.note) + '</span>' +
              '<span class="hob-card__count">' + g.n + ' photos &rarr;</span>' +
            '</span>' +
          '</a>';
        }).join('') +
      '</div>';

    if (reduce) return;

    var cards = host.querySelectorAll('.hob-card');
    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        var stop = null;
        function on()  { if (!stop) stop = mesh(card); }
        function off() { if (stop) { stop(); stop = null; } }
        card.addEventListener('pointerenter', on);
        card.addEventListener('pointerleave', off);
        card.addEventListener('focus', on);
        card.addEventListener('blur', off);
      })(cards[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
