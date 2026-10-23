/* Desk mode's desk:
     1. Every [data-drag] object can be picked up and moved around the desk;
        "Tidy up" puts everything back. Nothing is saved, so a reload does too.
     2. The lamp is a theme switch: lit lamp = dark room.
     3. Hovering the music card plays a track; leaving it fades the audio out.
   Everything else on the desk (the laptop's screen and terminal, the window,
   the notes, the mug...) is js/desk-objects.js, which reaches the dragging
   through window.portfolioDesk below: `on('drop' | 'tidy', fn)`, `nudge()`
   and `moved()`.

   Hover lift is CSS: the individual `scale`/`translate`/`rotate` properties
   compose with each object's authored `transform: rotate()` rather than
   replacing it, so nothing here has to rebuild a transform.

   Tilt and the slide home are gated on prefers-reduced-motion. Audio only
   ever starts from a real pointer interaction, and stops when the visitor
   leaves desk mode. */
(function () {
  'use strict';

  /* A press is a click until the pointer has moved this far, so the lamp,
     the play button and the AirDrop links still work on objects that drag. */
  var DRAG_PX = 4;
  /* One threshold for "the fade has converged" and "the track is audible",
     so a click landing mid-fade cannot read as silent and start a second play. */
  var FADE_EPSILON = 0.04;
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
    window.addEventListener('modechange', lampLight);

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

  /* Hovering the card starts the track and fades it in; leaving fades out and
     pauses. The button is the accessible, deliberate control — once it has
     been used, hover stops hijacking playback so the visitor's choice sticks. */
  function initAudio() {
    var card = document.querySelector('.obj--player');
    var audio = document.getElementById('hero-audio');
    if (!card || !audio) return;

    var btn = document.getElementById('player-play');
    var timeEl = document.getElementById('player-time');
    var bar = card.querySelector('.player__bar span');
    var userControlled = false;
    var fade = null;

    audio.volume = 0;

    function ramp(to, done) {
      window.clearInterval(fade);
      fade = window.setInterval(function () {
        var d = to - audio.volume;
        if (Math.abs(d) < FADE_EPSILON) {
          audio.volume = to;
          window.clearInterval(fade);
          if (done) done();
          return;
        }
        audio.volume = Math.max(0, Math.min(1, audio.volume + d * 0.25));
      }, 40);
    }

    function play() {
      var pr = audio.play();
      if (pr && pr.catch) pr.catch(function () {});
      ramp(0.7);
    }
    function pause() {
      ramp(0, function () { audio.pause(); });
    }

    function syncButton() {
      if (!btn) return;
      var playing = !audio.paused;
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      btn.setAttribute('aria-label', playing ? 'Pause track' : 'Play track');
      btn.querySelector('.player__icon').textContent = playing ? '⏸' : '▶';
    }
    audio.addEventListener('play', syncButton);
    audio.addEventListener('pause', syncButton);

    function fmt(t) {
      if (!isFinite(t)) return '0:00';
      var m = Math.floor(t / 60), s = Math.floor(t % 60);
      return m + ':' + (s < 10 ? '0' : '') + s;
    }
    audio.addEventListener('timeupdate', function () {
      if (timeEl) timeEl.textContent = fmt(audio.currentTime);
      if (bar && audio.duration) {
        bar.style.right = (100 - (audio.currentTime / audio.duration) * 100).toFixed(2) + '%';
      }
    });

    if (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        // Hover may already have started the track, so drive from intent:
        // if it is audibly playing, stop; otherwise start.
        var audible = !audio.paused && audio.volume > FADE_EPSILON;
        userControlled = true;
        if (audible) pause(); else play();
      });
    }

    card.addEventListener('pointerenter', function () {
      if (!userControlled) play();
    });
    function leave() { if (!userControlled) pause(); }
    card.addEventListener('pointerleave', leave);
    card.addEventListener('pointercancel', leave);

    // The card is hidden in every other mode, so nothing could stop it there.
    window.addEventListener('modechange', function () {
      if (root.getAttribute('data-mode') !== 'desk') {
        window.clearInterval(fade);
        audio.pause();
        audio.volume = 0;
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
