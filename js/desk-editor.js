/* ==========================================================================
   Desk editor — dev-only. Loaded solely with ?edit=1 (see index.html), in
   desk mode, to place the desk's objects by hand instead of by guessing
   percentages.

     click an object        select it
     drag it                move it (--x / --y)
     drag the corner        resize it, keeping its proportions (--w, and --h
                            where it has one)
     drag the top knob      rotate it (--r); hold Shift to snap to 15deg
     ,  /  .                rotate 1deg (Shift: 15deg)
     [  /  ]                send backward / bring forward (--z)
     arrows                 nudge 0.1% (Shift: 1%)
     Esc                    deselect
     D                      copy every object's style="" to the clipboard

   The laptop moves and resizes too, but does not rotate: the lockup is
   placed separately, as stage percentages, and follows it only through the
   shared --lap-dx/--lap-dy/--lap-s on .stage. Its dump line is the stage's
   style="".

   It edits the same inline custom properties index.html authors, as
   percentages of the desk, so what it copies pastes straight back into the
   markup. Nothing is persisted: a reload restores the file. While it runs,
   the visitor drag in js/hero-hover.js stands down (isEditing()).
   ========================================================================== */
(function () {
  'use strict';

  if (!window.isEditing()) return;

  var css = document.createElement('style');
  css.textContent =
    '.desk [data-drag]{cursor:move!important;scale:none!important;transition:none!important}' +
    '.desk .laptop{pointer-events:auto!important;cursor:move}' +
    '.dk-sel.is-laptop .dk-spin{display:none}' +
    '.dk-sel{position:fixed;z-index:9998;pointer-events:none;outline:1.5px dashed #e8590c;outline-offset:2px}' +
    '.dk-grip{position:absolute;right:-9px;bottom:-9px;width:14px;height:14px;background:#e8590c;' +
      'border:2px solid #fff;border-radius:3px;pointer-events:auto;cursor:nwse-resize}' +
    '.dk-spin{position:absolute;left:50%;top:-30px;width:14px;height:14px;margin-left:-7px;background:#fff;' +
      'border:2px solid #e8590c;border-radius:50%;pointer-events:auto;cursor:grab}' +
    '.dk-spin::after{content:"";position:absolute;left:50%;top:12px;width:1.5px;height:16px;margin-left:-.75px;background:#e8590c}' +
    '.dk-hud{position:fixed;z-index:9999;right:12px;bottom:12px;max-width:340px;padding:10px 12px;' +
      'border-radius:8px;background:rgba(20,20,20,.92);color:#f1f1f1;font:12px/1.5 ui-monospace,monospace;' +
      'white-space:pre-wrap;pointer-events:none}';
  document.head.appendChild(css);

  window.onReady(function () {
    var desk = document.querySelector('.desk');
    if (!desk) return;
    var items = Array.prototype.slice.call(desk.querySelectorAll('[data-drag]'));
    var stage = document.querySelector('.stage');
    var laptop = desk.querySelector('.laptop');
    var sel = null;

    var box = document.createElement('div');
    box.className = 'dk-sel';
    box.hidden = true;
    var grip = document.createElement('div');
    grip.className = 'dk-grip';
    var spin = document.createElement('div');
    spin.className = 'dk-spin';
    box.append(grip, spin);
    var hud = document.createElement('div');
    hud.className = 'dk-hud';
    document.body.append(box, hud);

    var HELP = 'click select · drag move · corner resize · knob rotate\n[ ] layer · , . rotate · arrows nudge · D copy · Esc';

    function name(el) {
      if (el === laptop) return 'stage (laptop + lockup)';
      var m = el.className.match(/\b(?:obj|prop)--[\w-]+/g);
      return m ? m[m.length - 1] : el.tagName.toLowerCase();
    }
    function get(el, p) { return parseFloat(el.style.getPropertyValue(p)); }
    function set(el, p, v, unit) { el.style.setProperty(p, (+v.toFixed(3)) + unit); }
    function line(el) {
      if (el === laptop) {
        return '--lap-dx:' + (get(stage, '--lap-dx') || 0).toFixed(3) + 'vw; --lap-dy:' +
          (get(stage, '--lap-dy') || 0).toFixed(3) + 'svh; --lap-s:' +
          (+(get(stage, '--lap-s') || 1).toFixed(3)) + ';';
      }
      var out = [];
      ['--x', '--y', '--w', '--h'].forEach(function (p) {
        if (!isNaN(get(el, p))) out.push(p + ':' + get(el, p).toFixed(3) + '%;');
      });
      if (!isNaN(get(el, '--r'))) out.push('--r:' + get(el, '--r') + 'deg;');
      out.push('--z:' + (get(el, '--z') || 0) + ';');
      return out.join(' ');
    }

    function draw() {
      if (!sel) { box.hidden = true; hud.textContent = HELP; return; }
      var r = sel.getBoundingClientRect();
      box.hidden = false;
      box.classList.toggle('is-laptop', sel === laptop);
      box.style.left = r.left + 'px';
      box.style.top = r.top + 'px';
      box.style.width = r.width + 'px';
      box.style.height = r.height + 'px';
      hud.textContent = name(sel) + '\n' + line(sel) + '\n\n' + HELP;
    }
    function select(el) { sel = el; draw(); }

    // Pointer drags, for both moving an object and resizing it from the grip.
    function track(e, onMove) {
      var x0 = e.clientX, y0 = e.clientY;
      var d = desk.getBoundingClientRect();
      function move(ev) {
        onMove((ev.clientX - x0) / d.width * 100, (ev.clientY - y0) / d.height * 100, ev.clientX - x0);
        draw();
      }
      function up() {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      }
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    }

    items.forEach(function (el) {
      el.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        select(el);
        var x = get(el, '--x'), y = get(el, '--y');
        track(e, function (dx, dy) {
          set(el, '--x', x + dx, '%');
          set(el, '--y', y + dy, '%');
        });
      }, true);
    });

    // The laptop: its offset lives on .stage, in viewport units, because the
    // lockup it carries is placed against the stage, not the desk.
    function nudgeLaptop(dvw, dsvh) {
      set(stage, '--lap-dx', (get(stage, '--lap-dx') || 0) + dvw, 'vw');
      set(stage, '--lap-dy', (get(stage, '--lap-dy') || 0) + dsvh, 'svh');
    }
    if (laptop && stage) {
      laptop.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        e.preventDefault();
        select(laptop);
        var x0 = get(stage, '--lap-dx') || 0, y0 = get(stage, '--lap-dy') || 0;
        var px0 = e.clientX, py0 = e.clientY;
        function move(ev) {
          set(stage, '--lap-dx', x0 + (ev.clientX - px0) / window.innerWidth * 100, 'vw');
          set(stage, '--lap-dy', y0 + (ev.clientY - py0) / window.innerHeight * 100, 'svh');
          draw();
        }
        function up() {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
        }
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      });
    }

    grip.addEventListener('pointerdown', function (e) {
      if (!sel || e.button !== 0) return;
      e.preventDefault();
      if (sel === laptop) {
        var s0 = get(stage, '--lap-s') || 1, lpx = laptop.getBoundingClientRect().width;
        track(e, function (dx, dy, dpx) {
          set(stage, '--lap-s', Math.max(0.3, s0 * (lpx + dpx) / lpx), '');
        });
        return;
      }
      var el = sel, w = get(el, '--w'), h = get(el, '--h');
      var px = el.getBoundingClientRect().width;
      track(e, function (dx, dy, dpx) {
        var k = Math.max(0.1, (px + dpx) / px);
        set(el, '--w', w * k, '%');
        if (!isNaN(h)) set(el, '--h', h * k, '%');
      });
    });

    // Rotate about the object's centre: the knob's angle round it, relative
    // to where the drag started, added to the authored --r.
    spin.addEventListener('pointerdown', function (e) {
      if (!sel || sel === laptop || e.button !== 0) return;
      e.preventDefault();
      var el = sel, r0 = get(el, '--r') || 0;
      var b = el.getBoundingClientRect();
      var cx = b.left + b.width / 2, cy = b.top + b.height / 2;
      var a0 = Math.atan2(e.clientY - cy, e.clientX - cx);
      function move(ev) {
        var deg = r0 + (Math.atan2(ev.clientY - cy, ev.clientX - cx) - a0) * 180 / Math.PI;
        deg = ev.shiftKey ? Math.round(deg / 15) * 15 : Math.round(deg);
        set(el, '--r', ((deg + 540) % 360) - 180, 'deg');
        draw();
      }
      function up() {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      }
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    });

    // Editing must not switch the theme, play the track or follow a link.
    desk.addEventListener('click', function (e) {
      if (e.target.closest('[data-drag]')) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    // A click on the empty desk deselects.
    document.addEventListener('pointerdown', function (e) {
      if (!e.target.closest('.desk [data-drag], .desk .laptop, .dk-grip, .dk-spin')) select(null);
    });

    document.addEventListener('keydown', function (e) {
      if (e.target.closest('input, textarea, [contenteditable]')) return;
      if (e.key === 'd' || e.key === 'D') {
        var all = laptop && stage ? items.concat(laptop) : items;
        var text = all.map(function (el) { return name(el) + '  style="' + line(el) + '"'; }).join('\n');
        // Also logged, for when the clipboard is refused (non-HTTPS, no focus).
        if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
        console.log(text);
        hud.textContent = 'Copied ' + all.length + ' objects (also in the console).\n\n' + HELP;
        return;
      }
      if (!sel) return;
      var step = e.shiftKey ? 1 : 0.1;
      if (sel === laptop) {
        var m = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
        if (e.key === 'Escape') { select(null); return; }
        if (!m) return;
        nudgeLaptop(m[0], m[1]);
        e.preventDefault();
        draw();
        return;
      }
      var k = { ArrowLeft: ['--x', -step], ArrowRight: ['--x', step], ArrowUp: ['--y', -step], ArrowDown: ['--y', step] }[e.key];
      if (k) { set(sel, k[0], get(sel, k[0]) + k[1], '%'); }
      else if (e.key === ']' || e.key === '[') {
        set(sel, '--z', Math.max(0, (get(sel, '--z') || 0) + (e.key === ']' ? 1 : -1)), '');
      }
      else if (e.key === ',' || e.key === '.' || e.key === '<' || e.key === '>') {
        var turn = (e.shiftKey ? 15 : 1) * (e.key === ',' || e.key === '<' ? -1 : 1);
        set(sel, '--r', (get(sel, '--r') || 0) + turn, 'deg');
      }
      else if (e.key === 'Escape') { select(null); return; }
      else return;
      e.preventDefault();
      draw();
    });

    window.addEventListener('resize', draw);
    window.addEventListener('scroll', draw, { passive: true });
    draw();
  });
})();
