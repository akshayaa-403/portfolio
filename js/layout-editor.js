/* ==========================================================================
   Layout editor — dev-only. Enable with ?edit=1; never loaded otherwise.

     drag          move
     wheel         resize (prop) / font size (text)
     R / E         rotate
     [ / ]         layer back / forward
     A             select the prop behind the current one
     H             hide
     arrows        nudge 1px (Shift = 10)
     D             dump layout (panel + clipboard + console)
     X             reload, discarding changes

   Design note: nothing is re-parented and no element's CSS position is
   rewritten. Everything moves by a translate() delta layered on top of its
   existing transform. That keeps the production layout — which differs per
   view mode and relies on percentage offsets inside auto-height parents —
   exactly as authored, and makes the editor safe to run in any mode.
   ========================================================================== */
(function () {
  'use strict';

  if (!window.isEditing()) return;

  var SEL = '.prop, .obj, .palette, .prop-label, .lily,' +
            '.hero__name, .hero__role, .hero__sub, .hero__headline,' +
            '.hero__actions';

  var stage, panel, current = null;
  var cycle = 0;          // depth offset for picking through stacked props
  var lastEvent = null;   // most recent pointer position, for re-picking
  var state = {};   // key -> {dx, dy, rot, z, scale, fs, hidden, el, isText}

  /* ---------- identity ---------- */
  function keyOf(el) {
    if (el.classList.contains('prop')) {
      // Most props are bare <img>; the lamp is a wrapper carrying data-prop.
      return el.getAttribute('data-prop') ||
             (el.getAttribute('src') || '').split('/').pop().replace('.webp', '');
    }
    if (el.classList.contains('obj')) {
      return (el.className.match(/obj--(\w+)/) || [])[1] || 'obj';
    }
    if (el.classList.contains('lily')) {
      return el.classList.contains('lily--bl') ? 'lily-bl' : 'lily-tr';
    }
    if (el.classList.contains('palette')) return 'palette';
    if (el.classList.contains('prop-label')) return 'prop-label';
    if (el.classList.contains('hero__name')) return 'text-name';
    if (el.classList.contains('hero__role')) return 'text-role';
    if (el.classList.contains('hero__sub')) return 'text-sub';
    if (el.classList.contains('hero__headline')) return 'text-headline';
    if (el.classList.contains('hero__actions')) return 'text-modes';
    return el.tagName.toLowerCase();
  }

  function isTextEl(el) {
    return /hero__(name|role|sub|headline|actions)/.test(el.className || '');
  }

  /* Authored rotation, in degrees, read back from the computed matrix. Props
     carry rotate() from their per-mode layout; apply() rebuilds the transform
     from scratch, so without seeding this the angle would be dropped the
     moment an element is first touched and the prop would snap upright. */
  // Whole degrees; the shared reader in js/util.js returns a float.
  function rotationOf(el) {
    return Math.round(window.rotationOf(el));
  }

  function read(el) {
    var k = keyOf(el);
    if (state[k]) return state[k];
    var cs = getComputedStyle(el);
    state[k] = {
      dx: 0, dy: 0, rot: rotationOf(el), scale: 1,
      z: parseInt(cs.zIndex, 10) || 0,
      fs: parseFloat(cs.fontSize) || 16,
      baseFs: parseFloat(cs.fontSize) || 16,
      hidden: false,
      isText: isTextEl(el),
      el: el
    };
    return state[k];
  }

  function apply(el) {
    var st = read(el);
    var t = 'translate(' + Math.round(st.dx) + 'px,' + Math.round(st.dy) + 'px)';
    if (st.rot) t += ' rotate(' + st.rot + 'deg)';
    if (st.scale !== 1) t += ' scale(' + st.scale.toFixed(3) + ')';
    el.style.setProperty('transform', t, 'important');
    el.style.setProperty('transform-origin', 'center center', 'important');
    // z of 0 is a real value, so test for presence rather than truthiness —
    // `if (st.z)` left a stale !important behind when a prop was sent to 0.
    if (st.z !== null && st.z !== undefined && st.z !== '') {
      el.style.setProperty('z-index', st.z, 'important');
    } else {
      el.style.removeProperty('z-index');
    }
    if (st.isText && st.fs !== st.baseFs) {
      el.style.setProperty('font-size', st.fs.toFixed(1) + 'px', 'important');
    }
    if (st.hidden) el.style.setProperty('display', 'none', 'important');
    else el.style.removeProperty('display');
    info();
  }

  /* ---------- panel ---------- */
  function info(msg) {
    if (!panel) return;
    var st = current ? read(current) : null;
    var r = current ? current.getBoundingClientRect() : null;
    var s = stage.getBoundingClientRect();
    panel.textContent =
      'LAYOUT EDITOR   mode=' + document.documentElement.getAttribute('data-mode') + '\n' +
      'selected: ' + (current ? keyOf(current) : '(hover something)') + '\n' +
      (st ? ('  move ' + Math.round(st.dx) + ',' + Math.round(st.dy) +
             '   rot ' + st.rot + '   z ' + st.z +
             (st.isText ? '   fs ' + st.fs.toFixed(0) : '   scale ' + st.scale.toFixed(2)) +
             (st.hidden ? '   HIDDEN' : '') + '\n' +
             '  on screen  x=' + Math.round(r.left - s.left) + ' y=' + Math.round(r.top - s.top) +
             ' w=' + Math.round(r.width) + ' h=' + Math.round(r.height) + '\n') : '') +
      '\ndrag=move  wheel=size  R/E=rotate  [ ]=layer  H=hide\n' +
      'A=select behind   arrows=nudge (shift 10)   D=dump   X=reset\n' +
      (msg ? '\n' + msg : '');
  }

  /* ---------- dump ---------- */
  function dump() {
    var s = stage.getBoundingClientRect();
    var mode = document.documentElement.getAttribute('data-mode');
    var lines = ['/* ---- ' + mode + ' mode ---- */'];
    stage.querySelectorAll(SEL).forEach(function (el) {
      var k = keyOf(el);
      var st = state[k];
      if (st && st.hidden) { lines.push('HIDE ' + k); return; }
      var r = el.getBoundingClientRect();
      if (r.width < 2) return;

      var row = k + ':  x=' + Math.round(r.left - s.left) +
                ' y=' + Math.round(r.top - s.top) +
                ' w=' + Math.round(r.width) + ' h=' + Math.round(r.height);
      if (st) {
        if (st.rot) row += ' rot=' + st.rot;
        if (st.z) row += ' z=' + st.z;
        if (st.isText && st.fs !== st.baseFs) row += ' fs=' + st.fs.toFixed(0);
      }
      row += '   /* ' + ((r.left - s.left) / s.width * 100).toFixed(2) + '% ' +
             ((r.top - s.top) / s.height * 100).toFixed(2) + '% ' +
             (r.width / s.width * 100).toFixed(2) + '% ' +
             (r.height / s.height * 100).toFixed(2) + '% */';
      lines.push(row);
    });
    // Fold in any page comments from annotate.js when it has been loaded
    // alongside this tool (see ?edit=1&annotate=1 in index.html).
    var comments = (typeof window.__annotDump === 'function') ? window.__annotDump() : '';
    var out = lines.join('\n') + (comments ? '\n\n' + comments : '');
    panel.textContent = out + '\n\n(copied — paste back to Claude)';
    console.log(out);
    // writeText() returns a Promise: a sync try/catch never sees a rejection
    // (denied permission, insecure origin), so handle it as one.
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(out).catch(function () {});
    }
  }

  /* ---------- hit testing ---------- */
  /* Prefer the topmost editable element the pointer is genuinely over. Text
     boxes can be wider than their glyphs (centred/right-aligned inside a
     column), so only claim one when the pointer is on an actual text line. */
  function overGlyphs(el, x, y) {
    var range = document.createRange();
    for (var i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i];
      try {
        if (n.nodeType === 3) range.selectNodeContents(n);
        else if (n.nodeType === 1) range.selectNode(n);
        else continue;
      } catch (e) { continue; }
      var rects = range.getClientRects();
      for (var j = 0; j < rects.length; j++) {
        var r = rects[j];
        if (x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 6 && y <= r.bottom + 6) return true;
      }
    }
    return false;
  }

  /* Everything editable under the pointer, topmost first. */
  function candidates(e) {
    var stack = document.elementsFromPoint(e.clientX, e.clientY);
    var out = [];
    for (var i = 0; i < stack.length; i++) {
      var c = stack[i].closest && stack[i].closest(SEL);
      if (!c || !stage.contains(c) || out.indexOf(c) !== -1) continue;
      if (isTextEl(c) &&
          !c.classList.contains('hero__actions') &&
          !overGlyphs(c, e.clientX, e.clientY)) continue;
      out.push(c);
    }
    return out;
  }

  function pick(e) {
    var list = candidates(e);
    if (!list.length) return null;

    // Text that the pointer is genuinely over goes to the front of the queue —
    // its glyphs are the thing you meant to grab. Everything else keeps its
    // paint order behind it.
    var text = [], rest = [];
    for (var i = 0; i < list.length; i++) {
      (isTextEl(list[i]) ? text : rest).push(list[i]);
    }
    var ordered = text.concat(rest);

    // A steps down the queue, so anything overlapped — a prop under a text
    // line, the glow under the lamp — is still reachable.
    return ordered[cycle % ordered.length];
  }

  /* ---------- init ---------- */
  function init() {
    stage = document.querySelector('.stage');
    if (!stage) return;

    panel = document.createElement('div');
    panel.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:99999;' +
      'width:400px;max-height:60vh;overflow:auto;background:rgba(12,22,38,.94);' +
      'color:#dbe8f5;font:11px/1.55 ui-monospace,Menlo,monospace;padding:12px 14px;' +
      'border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,.35);white-space:pre-wrap';
    document.body.appendChild(panel);

    // Production sets pointer-events:none on the lockup so drags reach props
    // underneath. In edit mode its children must be grabbable; pick() still
    // lets the pointer fall through the empty gutters to the props below.
    var lockup = stage.querySelector('.hero__lockup');
    if (lockup) lockup.style.setProperty('pointer-events', 'auto', 'important');

    // The lamp glow is invisible and click-through in production: it only
    // shows on hover, and it must never intercept the lamp's own hover. Both
    // have to be undone here or it cannot be seen or grabbed. The generic
    // pointer-events pass below does not cover it, because that rule is set
    // with !important.
    var glow = stage.querySelector('.prop--glow');
    if (glow) {
      glow.style.setProperty('opacity', '1', 'important');
      glow.style.setProperty('transition', 'none', 'important');
    }
    stage.querySelectorAll(SEL).forEach(function (el) {
      el.style.setProperty('pointer-events', 'auto', 'important');
      el.style.cursor = 'grab';
    });

    var drag = null, sx = 0, sy = 0, ox = 0, oy = 0;

    stage.addEventListener('pointermove', function (e) {
      if (drag) {
        var st = read(drag);
        st.dx = ox + (e.clientX - sx);
        st.dy = oy + (e.clientY - sy);
        apply(drag);
        return;
      }
      // A real move to a different spot starts a fresh stack, so drop any
      // depth offset from a previous A-cycle.
      if (lastEvent &&
          (Math.abs(e.clientX - lastEvent.clientX) > 3 ||
           Math.abs(e.clientY - lastEvent.clientY) > 3)) {
        cycle = 0;
      }
      lastEvent = { clientX: e.clientX, clientY: e.clientY };
      var t = pick(e);
      if (t && t !== current) { current = t; info(); }
    });

    stage.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button, a')) return;   // keep real controls usable
      var t = pick(e);
      if (!t) return;
      e.preventDefault();
      current = t;
      drag = t;
      var st = read(t);
      sx = e.clientX; sy = e.clientY; ox = st.dx; oy = st.dy;
      t.style.cursor = 'grabbing';
      try { t.setPointerCapture(e.pointerId); } catch (err) {}
      info();
    });

    function stop() {
      if (!drag) return;
      drag.style.cursor = 'grab';
      drag = null;
    }
    stage.addEventListener('pointerup', stop);
    stage.addEventListener('pointercancel', stop);

    stage.addEventListener('wheel', function (e) {
      if (!current) return;
      e.preventDefault();
      var st = read(current);
      var d = (e.deltaY < 0 ? 1 : -1) * (e.shiftKey ? 0.25 : 1);
      if (st.isText) st.fs = Math.max(8, st.fs + d);
      else st.scale = Math.max(0.1, st.scale + d * 0.03);
      apply(current);
    }, { passive: false });

    document.addEventListener('keydown', function (e) {
      // Single-letter shortcuts must not fire while the visitor is typing,
      // and must not swallow browser/OS chords (Ctrl+D, Cmd+X).
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target;
      if (t && (t.isContentEditable ||
                /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === 'd' || e.key === 'D') { dump(); return; }
      if (e.key === 'x' || e.key === 'X') { location.reload(); return; }
      // Cycle down through overlapping props, so one that sits entirely
      // beneath another can still be selected.
      if (e.key === 'a' || e.key === 'A') {
        cycle++;
        if (lastEvent) {
          var next = pick(lastEvent);
          if (next) { current = next; }
        }
        info('depth ' + cycle);
        e.preventDefault();
        return;
      }
      if (!current) return;
      var st = read(current);
      var big = e.shiftKey ? 10 : 1;
      switch (e.key) {
        case 'r': case 'R': st.rot += e.shiftKey ? 5 : 1; break;
        case 'e': case 'E': st.rot -= e.shiftKey ? 5 : 1; break;
        case '[': st.z -= 1; break;
        case ']': st.z += 1; break;
        case 'h': case 'H': st.hidden = !st.hidden; break;
        case 'ArrowLeft':  st.dx -= big; break;
        case 'ArrowRight': st.dx += big; break;
        case 'ArrowUp':    st.dy -= big; break;
        case 'ArrowDown':  st.dy += big; break;
        default: return;
      }
      e.preventDefault();
      apply(current);
    });

    info();
  }

  window.onReady(init);
})();
