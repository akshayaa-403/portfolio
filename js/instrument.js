/* The gutter instrument — one live, working thing per case study.

   This replaces the exploded stack of isometric plates that used to sit in the
   detail page's right gutter. The plates were a diagram OF the project; an
   instrument is a small piece of the project itself, running. Each one is
   built from that project's real mechanism, not from a picture of it:

     rank    the four factors re-ranking five names as the weights move
     halo    a phase-contrast cell losing its halo under the pointer
     colony  ants converging on a route, pheromone thickening as they agree
     grid    a Tuesday falling into the Eisenhower quadrants
     pick    four summarisers choosing different sentences from one article
     orbit   five collections circling, the matched one pulled in

   One engine, six step functions. Each instrument owns a canvas, a `step(t)`
   that advances its own state, and a `poke(x, y)` that lets the pointer change
   one parameter — so the thing in the margin is something you operate, not
   something you watch.

   Contract, so none of these can misbehave:
   - The canvas is aria-hidden and unfocusable. Everything it shows is stated
     in the prose beside it; it is an illustration of a mechanism, never the
     only place a fact appears.
   - Nothing here draws measured data. These are diagrammatic — an ant's route
     is a made-up day, a cell is a drawn cell. Real figures live in the
     `diagram` and `interactive` sections in the reading column, which say
     where their numbers came from.
   - `prefers-reduced-motion` stops the animation loop entirely and paints one
     settled frame. The instrument still responds to the pointer; it simply
     does not move on its own.
   - The loop is paused when the instrument scrolls out of view, so a long
     read does not burn a core on something nobody can see. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- tiny helpers ---------- */

  function css(el, name, fallback) {
    var v = getComputedStyle(el).getPropertyValue(name).trim();
    return v || fallback;
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  /* A deterministic scatter, so the same project draws the same arrangement on
     every load. Math.random would make the margin restless between reloads. */
  function rnd(seed) {
    var s = seed;
    return function () {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }

  /* ---------- the instruments ----------
     Each returns { init(w, h), step(dt, t), draw(ctx, w, h), poke(x, y) }.
     `poke` takes 0..1 coordinates so an instrument never has to know its own
     pixel size. */

  var KIND = {};

  /* rank — five names, four weights, one ordering. Dragging up and down the
     panel moves the weight between momentum and sentiment, and the ladder
     re-sorts. The arithmetic is the real composite; the five rows are a
     worked example, as the case study's own table says. */
  KIND.rank = function () {
    var names = ['NVDA', 'ACN', 'TSLA', 'KO', 'JNJ'];
    var f = [
      { m: 1.92, s: 1.41 }, { m: 2.44, s: 0.88 }, { m: 1.15, s: -1.02 },
      { m: -0.31, s: 0.22 }, { m: 0.08, s: -0.34 }
    ];
    var wM = 0.57, pos = [0, 1, 2, 3, 4], target = [0, 1, 2, 3, 4];
    return {
      init: function () { this.reorder(); },
      reorder: function () {
        var scored = names.map(function (n, i) {
          return { i: i, v: wM * f[i].m + (1 - wM) * f[i].s };
        }).sort(function (a, b) { return b.v - a.v; });
        scored.forEach(function (s, slot) { target[s.i] = slot; });
      },
      poke: function (x, y) { wM = clamp(1 - y, 0.05, 0.95); this.reorder(); },
      step: function (dt) {
        for (var i = 0; i < pos.length; i++) {
          pos[i] = lerp(pos[i], target[i], reduce ? 1 : clamp(dt * 7, 0, 1));
        }
      },
      draw: function (ctx, w, h) {
        var rowH = (h - 34) / names.length;
        ctx.font = '11px ui-monospace, monospace';
        ctx.textBaseline = 'middle';
        for (var i = 0; i < names.length; i++) {
          var y = 22 + pos[i] * rowH + rowH / 2;
          var v = wM * f[i].m + (1 - wM) * f[i].s;
          var top = Math.round(pos[i]) === 0;
          ctx.fillStyle = top ? this.accent : this.line;
          ctx.fillRect(10, y - 7, clamp((v + 2.5) / 5, 0.02, 1) * (w - 68), 14);
          // The label sits ON its bar, so it takes the colour that reads
          // against the bar, not the colour of the bar.
          ctx.fillStyle = top ? this.onAccent : this.ink;
          ctx.fillText(names[i], 14, y);
          ctx.fillStyle = top ? this.accent : this.soft;
          ctx.fillText(v.toFixed(2), w - 42, y);
        }
        ctx.fillStyle = this.soft;
        ctx.font = '9px ui-monospace, monospace';
        ctx.fillText('momentum ' + wM.toFixed(2) + '  ·  drag', 10, 10);
      }
    };
  };

  /* halo — a drawn phase-contrast field. Every cell carries the bright collar
     the microscope adds; the pointer's distance sets how much of it the
     pipeline has removed, so moving across the panel wipes the artifact away
     and brings it back. A drawing of the mechanism, not a micrograph. */
  KIND.halo = function () {
    var cells = [], r = rnd(9);
    for (var i = 0; i < 7; i++) {
      cells.push({ x: 0.14 + r() * 0.72, y: 0.12 + r() * 0.76, s: 0.05 + r() * 0.055, p: r() * 6.28 });
    }
    var clean = 0.45, t = 0;
    return {
      poke: function (x) { clean = clamp(x, 0, 1); },
      step: function (dt) { t += dt; },
      draw: function (ctx, w, h) {
        var self = this;
        cells.forEach(function (c) {
          var wob = reduce ? 0 : Math.sin(t * 0.7 + c.p) * 0.004;
          var cx = c.x * w, cy = (c.y + wob) * h, rad = c.s * Math.min(w, h) * 2.1;
          // the halo: a bright ring just outside the body, fading as `clean` rises
          var ring = ctx.createRadialGradient(cx, cy, rad * 0.62, cx, cy, rad * 1.5);
          ring.addColorStop(0, 'rgba(255,255,255,0)');
          ring.addColorStop(0.45, 'rgba(255,255,255,' + (0.85 * (1 - clean)).toFixed(3) + ')');
          ring.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = ring;
          ctx.beginPath(); ctx.arc(cx, cy, rad * 1.5, 0, 6.2832); ctx.fill();
          // the cell body, which gains contrast as the halo goes
          ctx.fillStyle = self.ink;
          ctx.globalAlpha = 0.18 + clean * 0.5;
          ctx.beginPath(); ctx.arc(cx, cy, rad * 0.62, 0, 6.2832); ctx.fill();
          ctx.globalAlpha = 1;
          ctx.strokeStyle = self.accent;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.25 + clean * 0.6;
          ctx.beginPath(); ctx.arc(cx, cy, rad * 0.62, 0, 6.2832); ctx.stroke();
          ctx.globalAlpha = 1;
        });
        ctx.fillStyle = this.soft;
        ctx.font = '9px ui-monospace, monospace';
        ctx.fillText((clean * 100).toFixed(0) + '% cleaned  ·  drag', 10, 10);
      }
    };
  };

  /* colony — ants walking a small graph, pheromone thickening on the edges
     that keep turning up in good tours. The pointer sets rho: drag right and
     the trails stop forgetting, so the colony locks onto the first decent
     answer and stops improving. That failure is the point of the slider. */
  KIND.colony = function () {
    var n = 7, pts = [], tau = [], r = rnd(4), rho = 0.06, t = 0, ants = [];
    for (var i = 0; i < n; i++) pts.push({ x: 0.16 + r() * 0.68, y: 0.14 + r() * 0.72 });
    for (i = 0; i < n; i++) { tau.push([]); for (var j = 0; j < n; j++) tau[i].push(0.2); }
    for (i = 0; i < 4; i++) ants.push({ at: i % n, to: (i + 1) % n, p: r() });

    function tour() {
      // one greedy-ish tour weighted by pheromone; good edges get reinforced
      var seen = [0], cur = 0, cost = 0, k, best, bv, d;
      while (seen.length < n) {
        best = -1; bv = -1;
        for (k = 0; k < n; k++) {
          if (seen.indexOf(k) !== -1) continue;
          d = Math.hypot(pts[k].x - pts[cur].x, pts[k].y - pts[cur].y);
          var v = Math.pow(tau[cur][k], 1.1) / (d + 0.02);
          if (v > bv) { bv = v; best = k; }
        }
        d = Math.hypot(pts[best].x - pts[cur].x, pts[best].y - pts[cur].y);
        cost += d; seen.push(best); cur = best;
      }
      for (k = 0; k < seen.length - 1; k++) {
        var a = seen[k], b = seen[k + 1];
        tau[a][b] = tau[b][a] = Math.min(1, tau[a][b] + 0.18 / (cost + 0.2));
      }
      return cost;
    }

    return {
      poke: function (x) { rho = clamp(0.002 + (1 - x) * 0.12, 0.002, 0.12); },
      step: function (dt) {
        t += dt;
        if (reduce) { tour(); return; }
        for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) tau[i][j] *= (1 - rho * dt * 3);
        tour();
        ants.forEach(function (a) {
          a.p += dt * 0.8;
          if (a.p >= 1) { a.p = 0; a.at = a.to; a.to = (a.to + 1 + (Math.random() * 2 | 0)) % n; }
        });
      },
      draw: function (ctx, w, h) {
        var self = this;
        for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) {
          var s = tau[i][j];
          if (s < 0.22) continue;
          ctx.strokeStyle = self.accent;
          ctx.globalAlpha = clamp((s - 0.2) * 1.6, 0, 0.9);
          ctx.lineWidth = 0.6 + s * 3.4;
          ctx.beginPath();
          ctx.moveTo(pts[i].x * w, pts[i].y * h);
          ctx.lineTo(pts[j].x * w, pts[j].y * h);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        pts.forEach(function (p) {
          ctx.fillStyle = self.ink;
          ctx.beginPath(); ctx.arc(p.x * w, p.y * h, 3, 0, 6.2832); ctx.fill();
        });
        ants.forEach(function (a) {
          var f = pts[a.at], g = pts[a.to];
          ctx.fillStyle = self.accent;
          ctx.beginPath();
          ctx.arc(lerp(f.x, g.x, a.p) * w, lerp(f.y, g.y, a.p) * h, 2.2, 0, 6.2832);
          ctx.fill();
        });
        ctx.fillStyle = this.soft;
        ctx.font = '9px ui-monospace, monospace';
        ctx.fillText('ρ ' + rho.toFixed(3) + '  ·  drag', 10, 10);
      }
    };
  };

  /* grid — a day of tasks falling into the four quadrants. The pointer moves
     the crosshair, which is what deciding actually is: every task is re-sorted
     against wherever you just put the line. */
  KIND.grid = function () {
    var r = rnd(21), tasks = [], cx = 0.5, cy = 0.5;
    for (var i = 0; i < 11; i++) {
      tasks.push({ u: 0.08 + r() * 0.84, im: 0.08 + r() * 0.84, x: 0.5, y: 0.5, p: r() });
    }
    return {
      poke: function (x, y) { cx = clamp(x, 0.2, 0.8); cy = clamp(y, 0.2, 0.8); },
      step: function (dt) {
        var k = reduce ? 1 : clamp(dt * 5, 0, 1);
        tasks.forEach(function (t) {
          t.x = lerp(t.x, t.u, k);
          t.y = lerp(t.y, 1 - t.im, k);
        });
      },
      draw: function (ctx, w, h) {
        var self = this;
        ctx.strokeStyle = this.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx * w, 16); ctx.lineTo(cx * w, h - 6);
        ctx.moveTo(6, cy * h); ctx.lineTo(w - 6, cy * h);
        ctx.stroke();
        tasks.forEach(function (t) {
          var urgent = t.x > cx, important = t.y < cy;
          ctx.fillStyle = (urgent && important) ? self.accent : self.ink;
          ctx.globalAlpha = (urgent && important) ? 1 : 0.4;
          ctx.beginPath();
          ctx.arc(t.x * w, t.y * h, (urgent && important) ? 4.5 : 3, 0, 6.2832);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.soft;
        ctx.font = '9px ui-monospace, monospace';
        ctx.fillText('move the line  ·  drag', 10, 10);
      }
    };
  };

  /* pick — one article as a column of sentence bars, and four selectors taking
     turns. Which bars light is the whole argument of the project: the methods
     disagree, and one of them looks backward at what it already took. */
  KIND.pick = function () {
    var N = 14, r = rnd(77), bars = [];
    for (var i = 0; i < N; i++) bars.push(0.35 + r() * 0.65);
    var sets = [
      { n: 'TextRank', p: [0, 2, 5, 9] },
      { n: 'LSA', p: [0, 3, 7, 12] },
      { n: 'Luhn', p: [0, 1, 2, 3] },
      { n: 'MMR', p: [0, 4, 8, 13] }
    ];
    var at = 0, t = 0, lit = [];
    return {
      poke: function (x, y) { at = clamp(Math.floor(y * sets.length), 0, sets.length - 1); t = 0; lit = []; },
      step: function (dt) {
        t += dt;
        if (reduce) { lit = sets[at].p.slice(); return; }
        var want = Math.min(sets[at].p.length, Math.floor(t / 0.28));
        lit = sets[at].p.slice(0, want);
        if (t > 2.6) { at = (at + 1) % sets.length; t = 0; }
      },
      draw: function (ctx, w, h) {
        var top = 22, rowH = (h - top - 8) / N;
        for (var i = 0; i < N; i++) {
          var on = lit.indexOf(i) !== -1;
          ctx.fillStyle = on ? this.accent : this.line;
          ctx.globalAlpha = on ? 1 : 0.55;
          ctx.fillRect(10, top + i * rowH, bars[i] * (w - 22), Math.max(2, rowH - 3));
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.soft;
        ctx.font = '9px ui-monospace, monospace';
        ctx.fillText(sets[at].n + '  ·  drag', 10, 10);
      }
    };
  };

  /* orbit — five collections circling a centre, the matched one drawn in and
     held. The studio's own arrangement is a constellation rather than a grid,
     and the quiz is the thing that pulls one of them close. */
  KIND.orbit = function () {
    var N = 5, t = 0, sel = 0, rad = [];
    for (var i = 0; i < N; i++) rad.push(1);
    return {
      poke: function (x, y) {
        var a = Math.atan2(y - 0.5, x - 0.5);
        sel = ((Math.round((a / 6.2832) * N) % N) + N) % N;
      },
      step: function (dt) {
        if (!reduce) t += dt * 0.25;
        for (var i = 0; i < N; i++) {
          rad[i] = lerp(rad[i], i === sel ? 0.34 : 1, reduce ? 1 : clamp(dt * 4, 0, 1));
        }
      },
      draw: function (ctx, w, h) {
        var cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.36;
        ctx.strokeStyle = this.line;
        ctx.globalAlpha = 0.6;
        ctx.setLineDash([3, 6]);
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        for (var i = 0; i < N; i++) {
          var a = t + (i / N) * 6.2832;
          var x = cx + Math.cos(a) * R * rad[i], y = cy + Math.sin(a) * R * rad[i];
          ctx.strokeStyle = this.line;
          ctx.globalAlpha = 0.5;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.fillStyle = i === sel ? this.accent : this.ink;
          ctx.beginPath(); ctx.arc(x, y, i === sel ? 7 : 4.5, 0, 6.2832); ctx.fill();
        }
        ctx.fillStyle = this.accent;
        ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 6.2832); ctx.fill();
        ctx.fillStyle = this.soft;
        ctx.font = '9px ui-monospace, monospace';
        ctx.fillText('collection ' + (sel + 1) + '  ·  drag', 10, 10);
      }
    };
  };

  /* ---------- the engine ---------- */

  function mount(host) {
    var make = KIND[host.getAttribute('data-instrument')];
    if (!make || !host.querySelector) return;
    var canvas = host.querySelector('canvas');
    if (!canvas) return;

    var inst = make();
    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, last = 0, running = false, raf = 0;

    function palette() {
      // Read the page's own tokens, so the instrument follows the theme
      // instead of carrying a second set of colours that can fall out of step.
      inst.ink = css(host, '--ink', '#14314f');
      inst.soft = css(host, '--ink-soft', '#5a6b7d');
      inst.line = css(host, '--line-strong', '#c3cedb');
      inst.accent = css(host, '--accent', '#094e94');
      inst.onAccent = css(host, '--on-accent-deep', '#ffffff');
    }

    function size() {
      var box = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = box.width; h = box.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function paint(dt, t) {
      ctx.clearRect(0, 0, w, h);
      inst.step(dt, t);
      inst.draw(ctx, w, h);
    }

    function frame(now) {
      var dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;
      paint(dt, now / 1000);
      if (running) raf = window.requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduce) return;
      running = true; last = 0;
      raf = window.requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
    }

    palette();
    size();
    if (inst.init) inst.init();
    paint(0.016, 0);

    // The pointer is the control. Coordinates are normalised so an instrument
    // never has to know its own size.
    function at(e) {
      var b = canvas.getBoundingClientRect();
      inst.poke(clamp((e.clientX - b.left) / b.width, 0, 1),
                clamp((e.clientY - b.top) / b.height, 0, 1));
      if (reduce) paint(0.016, 0);
    }
    canvas.addEventListener('pointerdown', function (e) {
      canvas.setPointerCapture(e.pointerId); at(e);
    });
    canvas.addEventListener('pointermove', function (e) {
      if (canvas.hasPointerCapture(e.pointerId)) at(e);
    });

    // Only run while it is on screen: a long read should not spend a core on
    // something scrolled past.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries[0].isIntersecting ? start() : stop();
      }, { rootMargin: '80px' }).observe(host);
    } else {
      start();
    }

    window.addEventListener('resize', function () { size(); paint(0.016, 0); });
    // The theme can change under it; re-read the tokens when it does.
    window.addEventListener('themechange', function () { palette(); paint(0.016, 0); });
  }

  window.initInstrument = function initInstrument(root) {
    var hosts = root.querySelectorAll('[data-instrument]');
    for (var i = 0; i < hosts.length; i++) mount(hosts[i]);
  };
})();
