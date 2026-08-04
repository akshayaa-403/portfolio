/* ==========================================================================
   Layout editor — a dev-only tool for positioning hero props by hand.

   Enable with ?edit=1 in the URL. It is never loaded otherwise, so it cannot
   affect the real site.

   Controls (hover a prop, then):
     drag             move it
     scroll wheel     resize (hold Shift for fine steps)
     R / E            rotate  (R = clockwise, E = anticlockwise)
     [ / ]            send backward / bring forward
     H                hide / show it
     arrow keys       nudge 1px (hold Shift for 10px)

   Global:
     D                dump CSS for the current mode to the panel + clipboard
     X                reset everything to the stylesheet values

   The dump is expressed in the same percentage units the stylesheet uses
   (% of a 1440x900 stage), so it pastes straight back in.
   ========================================================================== */
(function () {
  'use strict';

  if (!/[?&]edit=1/.test(location.search)) return;

  var W = 1440, H = 900;              // reference stage box for percentages
  var stage, panel, current = null;
  var state = {};                     // key -> {x,y,w,h,r,z,hidden}

  /* ---------- helpers ---------- */
  function keyOf(el) {
    if (el.classList.contains('prop')) {
      return (el.getAttribute('src') || '').split('/').pop().replace('.webp', '');
    }
    if (el.classList.contains('obj')) {
      return (el.className.match(/obj--(\w+)/) || [])[1] || 'obj';
    }
    if (el.classList.contains('palette')) return 'palette';
    if (el.classList.contains('prop-label')) return 'prop-label';
    if (el.classList.contains('lily')) {
      return el.classList.contains('lily--bl') ? 'lily-bl' : 'lily-tr';
    }
    return el.tagName.toLowerCase();
  }

  function targets() {
    return stage.querySelectorAll('.prop, .obj, .palette, .prop-label, .lily');
  }

  function read(el) {
    var k = keyOf(el);
    if (state[k]) return state[k];
    var s = stage.getBoundingClientRect();
    var r = el.getBoundingClientRect();
    var cs = getComputedStyle(el);
    var rot = 0;
    var m = cs.transform && cs.transform.match(/matrix\(([^)]+)\)/);
    if (m) {
      var p = m[1].split(',').map(Number);
      rot = Math.round(Math.atan2(p[1], p[0]) * 180 / Math.PI);
    }
    state[k] = {
      x: (r.left - s.left) / s.width * W,
      y: (r.top - s.top) / s.height * H,
      w: r.width / s.width * W,
      h: r.height / s.height * H,
      r: rot,
      z: parseInt(cs.zIndex, 10) || 1,
      hidden: false,
      el: el
    };
    return state[k];
  }

  function apply(el) {
    var st = read(el);
    el.style.setProperty('left', (st.x / W * 100).toFixed(3) + '%', 'important');
    el.style.setProperty('top', (st.y / H * 100).toFixed(3) + '%', 'important');
    el.style.setProperty('width', (st.w / W * 100).toFixed(3) + '%', 'important');
    if (!el.classList.contains('prop-label') && !el.classList.contains('palette')) {
      el.style.setProperty('height', (st.h / H * 100).toFixed(3) + '%', 'important');
    }
    el.style.setProperty('transform', 'rotate(' + st.r + 'deg)', 'important');
    el.style.setProperty('z-index', st.z, 'important');
    el.style.setProperty('display', st.hidden ? 'none' : '', 'important');
    if (st.hidden) el.style.setProperty('display', 'none', 'important');
    info();
  }

  /* ---------- panel ---------- */
  function mkPanel() {
    panel = document.createElement('div');
    panel.style.cssText = [
      'position:fixed', 'right:12px', 'bottom:12px', 'z-index:99999',
      'width:400px', 'max-height:62vh', 'overflow:auto',
      'background:rgba(12,22,38,0.94)', 'color:#dbe8f5',
      'font:11px/1.5 ui-monospace,Menlo,monospace',
      'padding:12px 14px', 'border-radius:10px',
      'box-shadow:0 8px 30px rgba(0,0,0,.35)', 'white-space:pre-wrap'
    ].join(';');
    document.body.appendChild(panel);
  }

  function info(msg) {
    var mode = document.documentElement.getAttribute('data-mode');
    var sel = current ? keyOf(current) : '(hover a prop)';
    var st = current ? read(current) : null;
    panel.textContent =
      'LAYOUT EDITOR  mode=' + mode + '\n' +
      'selected: ' + sel + '\n' +
      (st ? ('  x=' + st.x.toFixed(0) + ' y=' + st.y.toFixed(0) +
             '  w=' + st.w.toFixed(0) + ' h=' + st.h.toFixed(0) +
             '  rot=' + st.r + ' z=' + st.z + (st.hidden ? ' HIDDEN' : '') + '\n') : '') +
      '\ndrag=move  wheel=size  R/E=rotate  [ ]=z  H=hide\n' +
      'arrows=nudge (shift=10)   D=dump CSS   X=reset\n' +
      (msg ? '\n' + msg : '');
  }

  /* ---------- dump ---------- */
  function dump() {
    var mode = document.documentElement.getAttribute('data-mode');
    var lines = ['/* ---- ' + mode + ' mode: hand-placed layout ---- */'];
    Object.keys(state).forEach(function (k) {
      var st = state[k];
      if (st.hidden) {
        lines.push('HIDE ' + k);
        return;
      }
      lines.push(
        k + ':  x=' + st.x.toFixed(0) + ' y=' + st.y.toFixed(0) +
        ' w=' + st.w.toFixed(0) + ' h=' + st.h.toFixed(0) +
        ' rot=' + st.r + ' z=' + st.z +
        '   /* ' + (st.x / W * 100).toFixed(2) + '% ' + (st.y / H * 100).toFixed(2) + '% ' +
        (st.w / W * 100).toFixed(2) + '% ' + (st.h / H * 100).toFixed(2) + '% */'
      );
    });
    var out = lines.join('\n');
    panel.textContent = out + '\n\n(copied to clipboard — paste this back to Claude)';
    try { navigator.clipboard.writeText(out); } catch (e) {}
    console.log(out);
  }

  /* ---------- interaction ---------- */
  function init() {
    stage = document.querySelector('.stage');
    if (!stage) return;
    mkPanel();
    info();

    var els = targets();
    for (var i = 0; i < els.length; i++) {
      els[i].style.pointerEvents = 'auto';
      els[i].style.cursor = 'grab';
    }

    var dragging = null, sx = 0, sy = 0, ox = 0, oy = 0;

    stage.addEventListener('pointerover', function (e) {
      var t = e.target.closest('.prop, .obj, .palette, .prop-label, .lily');
      if (t) { current = t; info(); }
    });

    stage.addEventListener('pointerdown', function (e) {
      var t = e.target.closest('.prop, .obj, .palette, .prop-label, .lily');
      if (!t) return;
      e.preventDefault();
      current = t; dragging = t;
      var st = read(t);
      sx = e.clientX; sy = e.clientY; ox = st.x; oy = st.y;
      t.setPointerCapture(e.pointerId);
      t.style.cursor = 'grabbing';
    });

    stage.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var s = stage.getBoundingClientRect();
      var st = read(dragging);
      st.x = ox + (e.clientX - sx) / s.width * W;
      st.y = oy + (e.clientY - sy) / s.height * H;
      apply(dragging);
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging.style.cursor = 'grab';
      dragging = null;
    }
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    stage.addEventListener('wheel', function (e) {
      if (!current) return;
      e.preventDefault();
      var st = read(current);
      var step = e.shiftKey ? 0.4 : 2.0;
      var d = e.deltaY < 0 ? step : -step;
      var ratio = st.h / st.w;
      st.w = Math.max(8, st.w + d);
      st.h = Math.max(8, st.w * ratio);
      apply(current);
    }, { passive: false });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'd' || e.key === 'D') { dump(); return; }
      if (e.key === 'x' || e.key === 'X') { state = {}; location.reload(); return; }
      if (!current) return;
      var st = read(current);
      var big = e.shiftKey ? 10 : 1;
      switch (e.key) {
        case 'r': case 'R': st.r += e.shiftKey ? 5 : 1; break;
        case 'e': case 'E': st.r -= e.shiftKey ? 5 : 1; break;
        case '[': st.z = Math.max(0, st.z - 1); break;
        case ']': st.z += 1; break;
        case 'h': case 'H': st.hidden = !st.hidden; break;
        case 'ArrowLeft':  st.x -= big; break;
        case 'ArrowRight': st.x += big; break;
        case 'ArrowUp':    st.y -= big; break;
        case 'ArrowDown':  st.y += big; break;
        default: return;
      }
      e.preventDefault();
      apply(current);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
