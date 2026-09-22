/* The gutter figures — live drawings down both margins of a case study.

   Each one is a small piece of that project's real mechanism, running, and
   operated by the pointer; a project lists its own in `figures` in
   js/project-data.js, saying which kind, which margin, and which deep-dive
   section to stand beside. They replaced a single sticky instrument in the
   right gutter, which was this idea with one of it and nowhere for an
   argument to develop.

     balance   a beam tipping until momentum and sentiment agree
     rank      five names re-ordering as the weight between two factors moves
     race      the real backtest curves, traced out of the screenshot
     halo      her own cells, losing the collar the microscope added
     residual  one scan line as three profiles: captured, halo, difference
     orbit     five collections circling, the matched one pulled in
     handoff   ninety paintings narrowing to one WhatsApp message
     grid      a Tuesday falling into the Eisenhower quadrants
     calendar  a block written through to the phone's own calendar
     colony    ants converging, pheromone thickening where they agree
     pick      four summarisers choosing different sentences from one article

   One engine, one step function each. Every figure owns a canvas, a
   `step(dt)` that advances its state, and a `poke(x, y)` in 0..1 coordinates
   so it never has to know its own pixel size.

   Contract, so none of these can misbehave:
   - The canvas is aria-hidden and unfocusable. The title above it and the
     note below it are not: everything a drawing claims is also in words.
   - Nothing here invents a measurement. Most of these are diagrammatic — an
     ant's route is a made-up day. The two that use real numbers say so in
     their note and take them from js/traced-data.js, which
     tools/trace-figures.py read back out of this repository's own
     screenshots with OpenCV.
   - Colours are read off the page at run time, never hard-coded, so a figure
     wears the session's Sanzo Wada combination (js/palette.js) and follows a
     theme flip. The one exception is `halo`, which draws its own dark field
     because a micrograph is dark in any theme, and measures its outline
     against that field instead of against the page.
   - `prefers-reduced-motion` stops the loop entirely and paints one settled
     frame. The figure still answers the pointer; it just does not move on
     its own.
   - The loop is paused while the figure is off screen, so a long read does
     not burn a core on something nobody can see. */
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
    /* The cells are not drawn. They are the real boundaries traced out of
       public/assets/projects/phase-wipe-noisy.webp by tools/trace-figures.py
       with OpenCV — blur, adaptive threshold, contour, Douglas-Peucker — so
       what the halo is being wiped off is the frame the pipeline actually
       ran on. Circles fall back in if the trace is missing. */
    var traced = (window.TRACED && window.TRACED.cells) || [];
    var cells = traced.map(function (c, i) {
      var xs = c.pts.map(function (p) { return p[0]; });
      var ys = c.pts.map(function (p) { return p[1]; });
      return {
        pts: c.pts,
        cx: (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2,
        cy: (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2,
        rad: Math.sqrt(c.a) * 0.9,
        p: i * 1.7
      };
    });
    var clean = 0.45, t = 0;
    return {
      poke: function (x) { clean = clamp(x, 0, 1); },
      step: function (dt) { t += dt; },
      draw: function (ctx, w, h) {
        var self = this;

        /* This one panel draws its own ground, and the ground is dark. A
           phase-contrast frame is dark in any theme — that is what the
           microscope produces — and the halo is a BRIGHT collar, so on the
           site's paper there was nothing for it to be bright against. The
           outline is therefore measured against this field rather than
           against the page, which is what portfolioPalette.against is for. */
        var FIELD = '#0d1218';
        ctx.fillStyle = FIELD;
        ctx.fillRect(0, 0, w, h);

        var P = window.portfolioPalette;
        var edge = P && P.against ? P.against(0, 4.5, FIELD) : '#8fb8e8';

        cells.forEach(function (c) {
          var wob = reduce ? 0 : Math.sin(t * 0.7 + c.p) * 0.004;
          var cx = c.cx * w, cy = (c.cy + wob) * h;
          var rad = c.rad * Math.min(w, h) * 1.9;

          // The halo: a bright collar just outside the body, fading out as
          // `clean` rises. This is the artifact, not the cell.
          var ring = ctx.createRadialGradient(cx, cy, rad * 0.5, cx, cy, rad * 1.7);
          ring.addColorStop(0, 'rgba(255,255,255,0)');
          ring.addColorStop(0.4, 'rgba(255,255,255,' + (0.62 * (1 - clean)).toFixed(3) + ')');
          ring.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = ring;
          ctx.beginPath(); ctx.arc(cx, cy, rad * 1.7, 0, 6.2832); ctx.fill();

          // The body, along its real traced outline, gaining contrast as the
          // collar goes — which is the whole claim the case study makes.
          ctx.beginPath();
          c.pts.forEach(function (p, i) {
            var x = p[0] * w, y = (p[1] + wob) * h;
            if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
          });
          ctx.closePath();
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.1 + clean * 0.26;
          ctx.fill();
          ctx.globalAlpha = 0.35 + clean * 0.65;
          ctx.strokeStyle = edge;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.globalAlpha = 1;
        });

        // The readout sits on the dark field, so it is light here and not
        // --ink-soft, which is dark on paper.
        ctx.fillStyle = 'rgba(255,255,255,0.72)';
        ctx.font = '9px ui-monospace, monospace';
        ctx.fillText((clean * 100).toFixed(0) + '% cleaned  ·  drag', 10, 12);
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

  /* balance — the scale the case study is really describing. The left pan
     carries how hard a name has been moving, the right pan what is being
     written about it, both as the z-scores from the worked cross-section in
     the article. The beam tips toward whichever is louder, and a name only
     lights when the two agree — level beam, both pans loaded. That is the
     entire thesis of the project, and it is one drawing.

     The pointer picks the name; left to right walks the five. */
  KIND.balance = function () {
    var names = ['ACN', 'NVDA', 'TSLA', 'KO', 'JNJ'];
    var f = [
      { m: 2.44, s: 0.88 }, { m: 1.92, s: 1.41 }, { m: 1.15, s: -1.02 },
      { m: -0.31, s: 0.22 }, { m: 0.08, s: -0.34 }
    ];
    var at = 0, tilt = 0, t = 0, held = false;
    return {
      poke: function (x) { held = true; at = clamp(Math.floor(x * names.length), 0, names.length - 1); },
      step: function (dt) {
        t += dt;
        // Untouched, it walks the five on its own so the idea plays without
        // anyone having to work out that it is draggable.
        if (!held && !reduce && t > 2.4) { t = 0; at = (at + 1) % names.length; }
        var want = clamp((f[at].s - f[at].m) / 3, -1, 1);
        tilt = lerp(tilt, want, reduce ? 1 : clamp(dt * 4, 0, 1));
      },
      draw: function (ctx, w, h) {
        var d = f[at];
        // Agreement: both factors positive and close together. That is the
        // condition the screener is built to surface.
        var agree = d.m > 0 && d.s > 0 && Math.abs(d.m - d.s) < 1.2;
        var cx = w / 2, cy = h * 0.40, arm = Math.min(w * 0.38, 86);
        var dy = tilt * arm * 0.40;

        // the stand
        ctx.strokeStyle = this.line;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + arm * 0.95);
        ctx.moveTo(cx - arm * 0.42, cy + arm * 0.95);
        ctx.lineTo(cx + arm * 0.42, cy + arm * 0.95);
        ctx.stroke();

        // the beam
        ctx.strokeStyle = agree ? this.accent : this.soft;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - arm, cy - dy);
        ctx.lineTo(cx + arm, cy + dy);
        ctx.stroke();

        // the pans, each sized by the load it carries
        function pan(px, py, v, label, colour) {
          var r = 9 + Math.abs(v) * 6;
          ctx.strokeStyle = colour;
          ctx.lineWidth = 1.7;
          ctx.beginPath();
          ctx.moveTo(px, py); ctx.lineTo(px, py + 14);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(px, py + 14 + r * 0.5, r, 0, Math.PI);
          ctx.stroke();
          ctx.fillStyle = colour;
          ctx.globalAlpha = 0.16;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.font = '9px ui-monospace, monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = this.soft;
          ctx.fillText(label, px, py + 34 + r);
          ctx.fillStyle = colour;
          ctx.fillText(v.toFixed(2), px, py + 46 + r);
          ctx.textAlign = 'left';
        }
        pan.call(this, cx - arm, cy - dy, d.m, 'momentum', agree ? this.accent : this.soft);
        pan.call(this, cx + arm, cy + dy, d.s, 'sentiment', agree ? this.accent : this.soft);

        ctx.textAlign = 'center';
        ctx.font = '15px ui-monospace, monospace';
        ctx.fillStyle = agree ? this.accent : this.ink;
        ctx.fillText(names[at], cx, 18);
        ctx.font = '9px ui-monospace, monospace';
        ctx.fillStyle = this.soft;
        ctx.fillText(agree ? 'they agree — it ranks' : 'one without the other', cx, h - 8);
        ctx.textAlign = 'left';
      }
    };
  };

  /* race — the backtest, and it is a loss.

     Neither curve is invented and neither is re-plotted from a table: both
     were read back out of the project's own screenshot pixel by pixel
     (tools/trace-figures.py, OpenCV), calibrated against the chart's own
     gridlines. So the shape here — strategy ahead for seven months, the
     crossover in March, the benchmark finishing in front — is the run that
     actually happened.

     The pointer scrubs time, which is the only honest way to show a result
     whose ending is the point. */
  KIND.race = function () {
    var bt = (window.TRACED && window.TRACED.backtest) || { strategy: [], benchmark: [] };
    var S = bt.strategy, B = bt.benchmark, n = Math.min(S.length, B.length);
    var at = 0, held = false;

    // Where the benchmark takes the lead for good — found, not asserted.
    var cross = -1;
    for (var i = n - 1; i > 0; i--) {
      if (S[i] > B[i]) { cross = i + 1; break; }
    }

    return {
      init: function () { at = reduce ? n : 0; },
      poke: function (x) { held = true; at = clamp(Math.round(x * n), 2, n); },
      step: function (dt) {
        if (held || reduce) return;
        at += dt * n * 0.28;
        if (at > n + n * 0.5) at = 0;       // hold on the ending, then replay
      },
      draw: function (ctx, w, h) {
        if (!n) return;
        var k = clamp(Math.round(at), 2, n);
        var lo = 97, hi = 124, pad = 16;
        var X = function (i) { return pad + i / (n - 1) * (w - pad * 2); };
        var Y = function (v) { return h - 26 - (v - lo) / (hi - lo) * (h - 52); };

        // the 100 line: the only gridline that means anything here
        ctx.strokeStyle = this.line;
        ctx.setLineDash([2, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad, Y(100)); ctx.lineTo(w - pad, Y(100)); ctx.stroke();
        ctx.setLineDash([]);

        function line(series, colour, width) {
          ctx.strokeStyle = colour;
          ctx.lineWidth = width;
          ctx.beginPath();
          for (var i = 0; i < k; i++) {
            var x = X(i), y = Y(series[i]);
            if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
          }
          ctx.stroke();
        }
        line(B, this.soft, 1.4);
        line(S, this.accent, 2);

        // The crossover, once the scrub has reached it. Marked because it is
        // the moment the honest answer arrives.
        if (cross > 0 && k > cross) {
          ctx.strokeStyle = this.mid;
          ctx.setLineDash([2, 3]);
          ctx.beginPath();
          ctx.moveTo(X(cross), Y(lo) + 10); ctx.lineTo(X(cross), Y(hi));
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // 236px of panel does not hold three labels on one line, so the two
        // readouts take the corners and the hint sits opposite the leader.
        ctx.font = '9px ui-monospace, monospace';
        ctx.fillStyle = this.accent;
        ctx.fillText('strategy ' + S[k - 1].toFixed(1), pad, 11);
        ctx.fillStyle = this.soft;
        ctx.fillText('benchmark ' + B[k - 1].toFixed(1), pad, h - 8);
        ctx.textAlign = 'right';
        ctx.fillText(k >= n ? 'final' : 'drag', w - pad, 11);
        ctx.textAlign = 'left';
      }
    };
  };

  /* residual — why the network is asked to draw the halo and never the cell.

     One scan line across a frame, as three profiles stacked: what the
     microscope recorded (bumps for cells, overshoot collars either side of
     each), what the network predicts (the collars alone), and the difference,
     which is the cell. Drag to slide the subtraction across: left of the
     pointer the halo has been taken out, right of it the frame is untouched.

     Drawn, not measured — the measured figures for this project are the PSNR
     and SSIM table in the article. */
  KIND.residual = function () {
    var bumps = [0.18, 0.34, 0.52, 0.72, 0.88];
    var wipe = 0.55, t = 0;

    // the signal: a cell body, plus the collar the optics add either side
    function body(x) {
      var v = 0;
      bumps.forEach(function (b) {
        var d = (x - b) / 0.045;
        v += Math.exp(-d * d);
      });
      return v;
    }
    function collar(x) {
      var v = 0;
      bumps.forEach(function (b) {
        [-0.062, 0.062].forEach(function (o) {
          var d = (x - b - o) / 0.028;
          v += Math.exp(-d * d) * 0.85;
        });
      });
      return v;
    }

    return {
      poke: function (x) { wipe = clamp(x, 0, 1); },
      step: function (dt) { t += dt; },
      draw: function (ctx, w, h) {
        var self = this;
        var rows = [
          { label: 'as captured', fn: function (x) { return body(x) + collar(x); }, c: this.soft },
          { label: 'predicted halo', fn: collar, c: this.mid },
          { label: '= the cell', fn: body, c: this.accent }
        ];
        var band = (h - 26) / rows.length;

        rows.forEach(function (row, ri) {
          var base = 22 + band * ri + band * 0.82;
          var amp = band * 0.6;
          ctx.strokeStyle = row.c;
          ctx.lineWidth = ri === 2 ? 1.9 : 1.3;
          ctx.beginPath();
          for (var px = 6; px <= w - 6; px++) {
            var x = (px - 6) / (w - 12);
            // Right of the wipe nothing has been subtracted yet, so the third
            // row still carries the collar it has not lost.
            var v = row.fn(x);
            if (ri === 2 && x > wipe) v = body(x) + collar(x);
            var y = base - v * amp;
            if (px === 6) ctx.moveTo(px, y); else ctx.lineTo(px, y);
          }
          ctx.stroke();
          ctx.fillStyle = self.soft;
          ctx.font = '9px ui-monospace, monospace';
          ctx.fillText(row.label, 8, 22 + band * ri + 8);
        });

        // the wipe
        ctx.strokeStyle = this.accent;
        ctx.globalAlpha = 0.55;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(6 + wipe * (w - 12), 18);
        ctx.lineTo(6 + wipe * (w - 12), h - 6);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        ctx.fillStyle = this.soft;
        ctx.font = '9px ui-monospace, monospace';
        ctx.fillText('drag the subtraction across', 8, 11);
      }
    };
  };

  /* handoff — where an Arteza sale actually ends.

     Every online-shop diagram ends in a cart. This one does not, because the
     studio does not sell that way: the catalogue narrows to a collection, the
     collection to one painting, and then the buyer leaves for WhatsApp and
     talks to a person. The last node is off the site on purpose — that is the
     decision the case study is defending.

     The counts are the real ones from the project data. */
  KIND.handoff = function () {
    var stages = [
      { n: '90+', t: 'paintings' },
      { n: '5', t: 'collections' },
      { n: '3', t: 'quiz answers' },
      { n: '1', t: 'painting' }
    ];
    var at = 0, held = false, t = 0, fly = 0;
    return {
      poke: function (x, y) { held = true; at = clamp(y * (stages.length - 1), 0, stages.length - 1); },
      step: function (dt) {
        t += dt;
        if (!held && !reduce) at = (Math.sin(t * 0.5) * 0.5 + 0.5) * (stages.length - 1);
        fly = clamp((at - (stages.length - 2)) / 1, 0, 1);
      },
      draw: function (ctx, w, h) {
        var self = this;
        var top = 22, step = (h - 62) / stages.length;
        stages.forEach(function (s, i) {
          var live = at >= i - 0.5;
          var y = top + step * i + step * 0.5;
          var wide = (w - 40) * (1 - i * 0.19);
          ctx.fillStyle = live ? self.accent : self.line;
          ctx.globalAlpha = live ? 0.14 : 0.08;
          ctx.beginPath();
          if (ctx.roundRect) { ctx.roundRect(w / 2 - wide / 2, y - 13, wide, 26, 13); }
          else { ctx.rect(w / 2 - wide / 2, y - 13, wide, 26); }
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.strokeStyle = live ? self.accent : self.line;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.textAlign = 'center';
          ctx.font = '11px ui-monospace, monospace';
          ctx.fillStyle = live ? self.accent : self.soft;
          ctx.fillText(s.n + '  ' + s.t, w / 2, y + 4);
          ctx.textAlign = 'left';

          if (i < stages.length - 1) {
            ctx.strokeStyle = self.line;
            ctx.setLineDash([2, 3]);
            ctx.beginPath();
            ctx.moveTo(w / 2, y + 13); ctx.lineTo(w / 2, y + step - 13);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });

        // and then off the site, which is the whole point
        var by = top + step * stages.length + 2;
        ctx.globalAlpha = 0.25 + fly * 0.75;
        ctx.strokeStyle = this.accent;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(w / 2, by - 14);
        ctx.lineTo(w / 2 + 16 * fly, by + 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.textAlign = 'center';
        ctx.font = '10px ui-monospace, monospace';
        ctx.fillStyle = this.accent;
        ctx.fillText('WhatsApp →', w / 2 + 10 * fly, by + 12);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;

        ctx.fillStyle = this.soft;
        ctx.font = '9px ui-monospace, monospace';
        ctx.fillText('no cart  ·  drag', 8, 11);
      }
    };
  };

  /* calendar — the feature that made Habita worth building.

     Left column is the app's day. Right column is the calendar every other
     app on the phone already reads. Drag the block: it moves in the app, and
     the same block appears over there, because Habita writes a real event
     rather than keeping the time to itself. Time you set aside is only set
     aside if it is visible where you already look. */
  KIND.calendar = function () {
    var slot = 0.42, held = false, echo = 0, t = 0;
    var hours = ['09', '11', '13', '15', '17'];
    return {
      poke: function (x, y) { held = true; slot = clamp(y, 0.06, 0.82); echo = 0; },
      step: function (dt) {
        t += dt;
        if (!held && !reduce) slot = 0.3 + (Math.sin(t * 0.6) * 0.5 + 0.5) * 0.4;
        echo = lerp(echo, 1, reduce ? 1 : clamp(dt * 3.5, 0, 1));
      },
      draw: function (ctx, w, h) {
        var self = this;
        var colW = (w - 34) / 2, top = 26, colH = h - top - 16;

        [0, 1].forEach(function (c) {
          var x = 10 + c * (colW + 14);
          ctx.strokeStyle = self.line;
          ctx.lineWidth = 1;
          ctx.strokeRect(x, top, colW, colH);
          ctx.fillStyle = self.soft;
          ctx.font = '9px ui-monospace, monospace';
          ctx.fillText(c ? 'phone calendar' : 'Habita', x, top - 7);
          hours.forEach(function (hh, i) {
            var y = top + colH * (i / hours.length) + 2;
            ctx.strokeStyle = self.line;
            ctx.globalAlpha = 0.5;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + colW, y); ctx.stroke();
            ctx.globalAlpha = 1;
            if (!c) {
              ctx.fillStyle = self.soft;
              ctx.font = '8px ui-monospace, monospace';
              ctx.fillText(hh, x + 3, y + 9);
            }
          });
        });

        var by = top + slot * colH, bh = Math.max(22, colH * 0.17);

        // the block in the app
        ctx.fillStyle = this.accent;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(10 + 18, by, colW - 22, bh);
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.onAccent;
        ctx.font = '9px ui-monospace, monospace';
        ctx.fillText('Focus', 10 + 24, by + 13);

        // the same block, written through
        ctx.globalAlpha = 0.25 + echo * 0.65;
        ctx.fillStyle = this.accent;
        ctx.fillRect(10 + colW + 14 + 4, by, colW - 8, bh);
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.onAccent;
        ctx.globalAlpha = 0.4 + echo * 0.6;
        ctx.fillText('Focus', 10 + colW + 22, by + 13);
        ctx.globalAlpha = 1;

        // the write itself
        ctx.strokeStyle = this.mid;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(10 + colW - 4, by + bh / 2);
        ctx.lineTo(10 + colW + 18, by + bh / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = this.soft;
        ctx.font = '9px ui-monospace, monospace';
        ctx.textAlign = 'right';
        ctx.fillText('drag the block', w - 10, 12);
        ctx.textAlign = 'left';
      }
    };
  };

  /* ---------- the engine ---------- */

  function mount(host) {
    var make = KIND[host.getAttribute('data-figure')];
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
      inst.deep = css(host, '--accent-deep', '#00317a');
      inst.mid = css(host, '--accent-mid', '#80b1d7');
      inst.pale = css(host, '--accent-pale', '#b2d5e7');
      inst.bg = css(host, '--bg-raised', '#fbfcfe');
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
    // The theme can change under it; re-read the tokens when it does. So can
    // the palette — js/palette.js rebuilds every accent on a theme or mode
    // change, and a figure drawn in the old accent would be the one thing on
    // the page still wearing it.
    window.addEventListener('themechange', function () { palette(); paint(0.016, 0); });
    if (window.portfolioPalette && window.portfolioPalette.on) {
      window.portfolioPalette.on(function () { palette(); paint(0.016, 0); });
    }
  }

  window.initFigures = function initFigures(root) {
    var hosts = root.querySelectorAll('[data-figure]');
    for (var i = 0; i < hosts.length; i++) mount(hosts[i]);
  };
})();
