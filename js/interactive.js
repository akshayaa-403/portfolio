/* Interactive figures for the case studies.

   A deep-dive section with `kind: "interactive"` renders one of three widgets,
   chosen by its `widget` field and driven entirely by data in
   js/project-data.js. Three generic widgets rather than one module per
   project: the shapes a case study needs turn out to repeat, and the thing
   that should differ between projects is the content, not the machinery.

     weights - sliders that re-weight a small table and re-rank it live, with
               the rows sliding to their new positions so the effect of a
               change is visible rather than inferred.
     steps   - a set of frames over one list, stepped through by hand or
               played; each frame lights the items it selects and says why.
     wipe    - two images under one draggable divider.

   Everything here degrades to something readable: the markup is built by
   js/project-detail.js and already contains the numbers, the list and the
   images before this file runs, so a visitor with no JS sees the data and
   loses only the control.

   Motion is gated on prefers-reduced-motion throughout: under `reduce`, rows
   still re-rank and frames still advance, they simply do not slide. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- helpers ---------- */

  function fmt(n) {
    // Two decimals, but never "-0.00" - a rounded-away negative reads as a
    // sign error rather than as a small number.
    var s = (Math.round(n * 100) / 100).toFixed(2);
    return s === '-0.00' ? '0.00' : s;
  }

  /* FLIP: measure where the rows are, let the DOM change, then animate each
     row from where it was to where it now is. Re-sorting a list any other way
     teleports the rows, which is exactly the information the widget exists to
     show. */
  function flip(rows, mutate) {
    var first = [];
    var i;
    for (i = 0; i < rows.length; i++) first.push(rows[i].getBoundingClientRect().top);

    mutate();

    if (reduce || !rows.length) return;
    for (i = 0; i < rows.length; i++) {
      var delta = first[i] - rows[i].getBoundingClientRect().top;
      rows[i].style.transition = 'none';
      rows[i].style.transform = delta ? 'translateY(' + delta + 'px)' : '';
    }
    // One reflow, then release everything in the same frame so the rows move
    // together instead of stuttering row by row.
    void rows[0].offsetHeight;
    for (i = 0; i < rows.length; i++) {
      rows[i].style.transition = 'transform 420ms cubic-bezier(0.2, 0.7, 0.2, 1)';
      rows[i].style.transform = '';
    }
  }

  /* ---------- weights ---------- */

  function initWeights(root) {
    var body = root.querySelector('[data-w-rows]');
    var sliders = Array.prototype.slice.call(root.querySelectorAll('[data-w-slider]'));
    if (!body || !sliders.length) return;

    var rows = Array.prototype.slice.call(body.querySelectorAll('[data-w-row]'));
    var values = rows.map(function (r) {
      try { return JSON.parse(r.getAttribute('data-values')); } catch (e) { return {}; }
    });

    function recompute() {
      var w = {};
      sliders.forEach(function (s) {
        var key = s.getAttribute('data-w-slider');
        w[key] = parseFloat(s.value);
        var out = root.querySelector('[data-w-out="' + key + '"]');
        if (out) out.textContent = fmt(w[key]);
      });

      var scored = rows.map(function (row, n) {
        var total = 0;
        for (var k in w) {
          if (Object.prototype.hasOwnProperty.call(w, k)) total += w[k] * (values[n][k] || 0);
        }
        return { row: row, total: total };
      });
      scored.sort(function (a, b) { return b.total - a.total; });

      flip(rows, function () {
        scored.forEach(function (s, i) {
          s.row.querySelector('[data-w-score]').textContent = fmt(s.total);
          s.row.querySelector('[data-w-rank]').textContent = i + 1;
          // The top row is called out: the whole point of moving a slider is
          // to see whether the answer at the top changed.
          s.row.classList.toggle('is-top', i === 0);
          body.appendChild(s.row);
        });
      });
    }

    sliders.forEach(function (s) { s.addEventListener('input', recompute); });

    var reset = root.querySelector('[data-w-reset]');
    if (reset) {
      reset.addEventListener('click', function () {
        sliders.forEach(function (s) { s.value = s.getAttribute('data-default'); });
        recompute();
      });
    }
    recompute();
  }

  /* ---------- steps ---------- */

  function initSteps(root) {
    var frames = Array.prototype.slice.call(root.querySelectorAll('[data-s-frame]'));
    var items = Array.prototype.slice.call(root.querySelectorAll('[data-s-item]'));
    var note = root.querySelector('[data-s-note]');
    var play = root.querySelector('[data-s-play]');
    if (!frames.length || !items.length) return;

    var at = 0;
    var timer = 0;

    function show(n) {
      at = (n + frames.length) % frames.length;
      var picks;
      try { picks = JSON.parse(frames[at].getAttribute('data-picks')); } catch (e) { picks = []; }

      frames.forEach(function (f, i) {
        f.setAttribute('aria-pressed', i === at ? 'true' : 'false');
      });
      items.forEach(function (item, j) {
        var at_ = picks.indexOf(j);
        item.classList.toggle('is-picked', at_ !== -1);
        // The stagger is what makes a selection read as a sequence rather than
        // a flash. Zero when motion is not wanted.
        item.style.transitionDelay = (reduce || at_ < 0) ? '0s' : (at_ * 70) + 'ms';
      });
      if (note) note.textContent = frames[at].getAttribute('data-note') || '';
    }

    function stop() {
      if (!timer) return;
      window.clearInterval(timer);
      timer = 0;
      if (play) {
        play.setAttribute('aria-pressed', 'false');
        play.textContent = play.getAttribute('data-play-label');
      }
    }

    frames.forEach(function (f, i) {
      f.addEventListener('click', function () { stop(); show(i); });
    });

    if (play) {
      play.addEventListener('click', function () {
        if (timer) { stop(); return; }
        play.setAttribute('aria-pressed', 'true');
        play.textContent = play.getAttribute('data-stop-label');
        timer = window.setInterval(function () { show(at + 1); }, 2400);
        show(at + 1);
      });
    }

    show(0);
  }

  /* ---------- wipe ---------- */

  function initWipe(root) {
    var frame = root.querySelector('[data-wipe]');
    var input = root.querySelector('[data-wipe-input]');
    if (!frame || !input) return;

    function set(pct) {
      frame.style.setProperty('--wipe', pct + '%');
      input.setAttribute('aria-valuetext', Math.round(pct) + '% cleaned');
    }

    input.addEventListener('input', function () { set(parseFloat(input.value)); });

    // Dragging on the picture is the gesture people try first; the range input
    // underneath stays the real control, so keyboard and screen readers get it
    // for free rather than needing a second implementation.
    function fromPointer(e) {
      var box = frame.getBoundingClientRect();
      var pct = Math.max(0, Math.min(100, ((e.clientX - box.left) / box.width) * 100));
      input.value = pct;
      set(pct);
    }
    frame.addEventListener('pointerdown', function (e) {
      frame.setPointerCapture(e.pointerId);
      fromPointer(e);
    });
    frame.addEventListener('pointermove', function (e) {
      if (frame.hasPointerCapture(e.pointerId)) fromPointer(e);
    });

    set(parseFloat(input.value));
  }

  var INIT = { weights: initWeights, steps: initSteps, wipe: initWipe };

  /* Called by js/project-detail.js once the detail page has been written. */
  window.initInteractive = function initInteractive(root) {
    var nodes = root.querySelectorAll('[data-interactive]');
    for (var i = 0; i < nodes.length; i++) {
      var fn = INIT[nodes[i].getAttribute('data-interactive')];
      if (fn) fn(nodes[i]);
    }
  };
})();
