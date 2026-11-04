/* Desk mode's desk:
     1. Every [data-drag] object can be picked up and moved around the desk;
        "Tidy up" puts everything back. Nothing is saved, so a reload does too.
     2. The lamp is a theme switch: lit lamp = dark room.
     3. The record player plays a track when pressed and stops when pressed
        again. Nothing else starts it, ever: no hover, no autoplay.
   Everything else on the desk (the laptop's screen and terminal, the window,
   the phone, the drink...) is js/desk-objects.js, which reaches the dragging
   through window.portfolioDesk below: `on('drop' | 'tidy', fn)`, `nudge()`
   and `moved()`.

   Hover lift is CSS: the individual `scale`/`translate`/`rotate` properties
   compose with each object's authored `transform: rotate()` rather than
   replacing it, so nothing here has to rebuild a transform.

   Tilt and the slide home are gated on prefers-reduced-motion. */
(function () {
  'use strict';

  /* A press is a click until the pointer has moved this far, so the lamp,
     the record player and the phone still work on objects that drag. */
  var DRAG_PX = 4;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* The desk's hooks for js/desk-objects.js. `drop` gets (element, the rect
     it was picked up from); `tidy` gets nothing. Replaced by initDrag. */
  var heard = { drop: [], tidy: [] };
  function emit(type, a, b) {
    for (var i = 0; i < heard[type].length; i++) {
      try { heard[type][i](a, b); } catch (err) { /* one bad listener is not fatal */ }
    }
  }
  window.portfolioDesk = {
    on: function (type, fn) { if (heard[type]) heard[type].push(fn); },
    nudge: function () {},
    moved: function () {}
  };

  function initLampSwitch() {
    var lamp = document.querySelector('.prop--lamp-btn');
    if (!lamp || !window.portfolioTheme) return;

    function sync() {
      var dark = window.portfolioTheme.get() === 'dark';
      lamp.setAttribute('aria-pressed', dark ? 'true' : 'false');
      lamp.setAttribute('aria-label', dark
        ? 'Turn off the lamp (light theme)'
        : 'Turn on the lamp (dark theme)');
      // The hover label speaks for the room: lights on in a light period,
      // so the lamp offers to turn them off, and the other way round.
      lamp.setAttribute('data-cue', dark ? 'Turn the lights on!' : 'Turn the lights off!');
    }

    lamp.addEventListener('click', function () { window.portfolioTheme.toggle(); });
    window.addEventListener('themechange', sync);
    sync();
  }

  /* Pick up, move, put down. The object follows the pointer through the
     `translate` property, comes to the top of the pile and stays there,
     tilts a little with the motion, and cannot leave the desk. The lockup is
     above the desk's whole stacking context (css/desk.css), so nothing can
     be dropped over the name. */
  function initDrag() {
    var desk = document.querySelector('.desk');
    if (!desk) return;
    var tidy = desk.querySelector('.desk__tidy');
    var lamp = desk.querySelector('.prop--lamp-btn');
    var fig = lamp && lamp.querySelector('.lamp__fig');
    var top = 10;   // above every authored --z
    var resets = [];

    // A native image or link drag would steal the gesture.
    desk.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // Where the lamp's light falls, as percentages of the desk, on <html>:
    // the tabletop's night highlight reads --lamp-x (css/desk.css), and the
    // night's pool of light (js/desk-objects.js) both. The pool is centred a
    // little under the bulb (27% down the lamp image), where the light lands.
    function lampLight() {
      if (!fig) return;
      var d = desk.getBoundingClientRect(), r = fig.getBoundingClientRect();
      if (!d.width || !r.width) return;
      root.style.setProperty('--lamp-x', ((r.left + r.width / 2 - d.left) / d.width * 100).toFixed(1) + '%');
      root.style.setProperty('--lamp-y', ((r.top + r.height * 0.42 - d.top) / d.height * 100).toFixed(1) + '%');
    }
    new ResizeObserver(lampLight).observe(desk);

    function swallow(e) { e.preventDefault(); e.stopPropagation(); }

    // Moved, by hand or by the desk getting messier: show "Tidy up".
    function moved() { tidy.hidden = false; }

    Array.prototype.forEach.call(desk.querySelectorAll('[data-drag]'), function (el) {
      // Where it has been moved to, in px, and any tilt the mess gave it.
      var st = el.__desk = { tx: 0, ty: 0, rot: 0 };

      el.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        var x0 = e.clientX, y0 = e.clientY;
        var nx = st.tx, ny = st.ty, box = null, from = null;

        function move(ev) {
          var dx = ev.clientX - x0, dy = ev.clientY - y0;
          if (!box) {
            if (Math.hypot(dx, dy) < DRAG_PX) return;
            // Measured once, at pickup: how far it may go each way and stay
            // on the desk. Something already over an edge may stay there,
            // but not go further.
            // `pad` leaves room for the lift (scale 1.07), which is still
            // growing when this is measured.
            var d = desk.getBoundingClientRect(), r = el.getBoundingClientRect();
            var pad = 0.04 * Math.max(r.width, r.height);
            box = [Math.min(0, d.left - r.left + pad), Math.max(0, d.right - r.right - pad),
                   Math.min(0, d.top - r.top + pad), Math.max(0, d.bottom - r.bottom - pad)];
            from = r;
            el.setPointerCapture(ev.pointerId);
            el.classList.add('is-held');
            el.style.zIndex = ++top;
            moved();
          }
          nx = st.tx + Math.max(box[0], Math.min(box[1], dx));
          ny = st.ty + Math.max(box[2], Math.min(box[3], dy));
          el.style.translate = nx + 'px ' + ny + 'px';
          if (!reduce) el.style.rotate = (st.rot + Math.max(-6, Math.min(6, ev.movementX * 0.5))) + 'deg';
          if (el === lamp) lampLight();
        }

        function end() {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', end);
          window.removeEventListener('pointercancel', end);
          if (!box) return;
          st.tx = nx; st.ty = ny;
          el.classList.remove('is-held');
          el.style.rotate = st.rot ? st.rot + 'deg' : '';
          if (el === lamp) window.setTimeout(lampLight, reduce ? 0 : 340);
          // A drag is not a click: swallow the one this release fires, so
          // dropping the lamp does not switch the theme.
          window.addEventListener('click', swallow, true);
          window.setTimeout(function () { window.removeEventListener('click', swallow, true); }, 0);
          emit('drop', el, from);
        }

        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', end);
        window.addEventListener('pointercancel', end);
      });

      resets.push(function () {
        st.tx = st.ty = st.rot = 0;
        el.style.translate = '';
        el.style.rotate = '';
        el.style.zIndex = '';
      });
    });

    /* Move something by (dx, dy) px and tilt it by dr degrees, kept on the
       desk, as if it had been knocked. For js/desk-objects.js's mess. */
    window.portfolioDesk.nudge = function (el, dx, dy, dr) {
      var st = el && el.__desk;
      if (!st || el.classList.contains('is-held')) return;
      var d = desk.getBoundingClientRect(), r = el.getBoundingClientRect();
      dx = Math.max(Math.min(0, d.left - r.left), Math.min(Math.max(0, d.right - r.right), dx));
      dy = Math.max(Math.min(0, d.top - r.top), Math.min(Math.max(0, d.bottom - r.bottom), dy));
      st.tx += dx; st.ty += dy; st.rot += dr || 0;
      el.style.translate = st.tx + 'px ' + st.ty + 'px';
      el.style.rotate = st.rot ? st.rot + 'deg' : '';
      moved();
      if (el === lamp) window.setTimeout(lampLight, reduce ? 0 : 600);
    };
    window.portfolioDesk.moved = moved;

    tidy.addEventListener('click', function () {
      for (var i = 0; i < resets.length; i++) resets[i]();
      top = 10;
      tidy.hidden = true;
      emit('tidy');
      // Measured once the lamp has slid home.
      window.setTimeout(lampLight, reduce ? 0 : 600);
    });
    lampLight();
  }

  /* The record player: press to play (fading in), press again to stop
     (fading out). aria-pressed and the spinning record follow the audio
     element itself, so they cannot disagree with what is heard. */
  function initAudio() {
    var tt = document.querySelector('[data-turntable]');
    var audio = document.getElementById('hero-audio');
    if (!tt || !audio) return;
    var fade = null, on = false;

    function ramp(to, done) {
      window.clearInterval(fade);
      fade = window.setInterval(function () {
        var d = to - audio.volume;
        if (Math.abs(d) < 0.04) {
          audio.volume = to;
          window.clearInterval(fade);
          if (done) done();
          return;
        }
        audio.volume = Math.max(0, Math.min(1, audio.volume + d * 0.25));
      }, 40);
    }
    function sync() {
      var playing = !audio.paused;
      tt.classList.toggle('is-playing', playing);
      tt.setAttribute('aria-pressed', playing ? 'true' : 'false');
      tt.setAttribute('data-cue', playing ? 'Stop the record' : 'Play the record');
    }
    audio.addEventListener('play', sync);
    audio.addEventListener('pause', sync);

    tt.addEventListener('click', function () {
      on = !on;
      if (on) {
        if (audio.paused) audio.volume = 0;
        var pr = audio.play();
        if (pr && pr.catch) pr.catch(function () { on = false; });
        ramp(0.7);
      } else {
        ramp(0, function () { audio.pause(); });
      }
    });
  }

  window.onReady(function () {
    initLampSwitch();
    // Under ?edit=1 js/desk-editor.js owns the pointer on the desk: no
    // visitor drag, and no track starting every time an object is moved.
    if (window.isEditing()) return;
    initDrag();
    initAudio();
  });
})();
