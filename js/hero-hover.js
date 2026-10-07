/* Desk mode's desk:
     1. Every [data-drag] object can be picked up and moved around the desk;
        "Tidy up" puts everything back. Nothing is saved, so a reload does too.
     2. The lamp is a theme switch: lit lamp = dark room.
     3. Hovering the music card plays a track; leaving it fades the audio out.

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

  function initLampSwitch() {
    var lamp = document.querySelector('.prop--lamp-btn');
    if (!lamp || !window.portfolioTheme) return;

    function sync() {
      var dark = window.portfolioTheme.get() === 'dark';
      lamp.setAttribute('aria-pressed', dark ? 'true' : 'false');
      lamp.setAttribute('aria-label', dark
        ? 'Turn off the lamp (light theme)'
        : 'Turn on the lamp (dark theme)');
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
    var top = 10;   // above every authored --z
    var resets = [];

    // A native image or link drag would steal the gesture.
    desk.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // At night the tabletop's highlight (css/desk.css) sits under the lamp.
    // Set on <html>, where --desk-sheen-x reads it.
    function lampLight() {
      var d = desk.getBoundingClientRect(), r = lamp.getBoundingClientRect();
      root.style.setProperty('--lamp-x', ((r.left + r.width / 2 - d.left) / d.width * 100).toFixed(1) + '%');
    }

    function swallow(e) { e.preventDefault(); e.stopPropagation(); }

    Array.prototype.forEach.call(desk.querySelectorAll('[data-drag]'), function (el) {
      var tx = 0, ty = 0;   // where it has been dragged to, in px

      el.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        var x0 = e.clientX, y0 = e.clientY;
        var nx = tx, ny = ty, box = null;

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
            el.setPointerCapture(ev.pointerId);
            el.classList.add('is-held');
            el.style.zIndex = ++top;
            tidy.hidden = false;
          }
          nx = tx + Math.max(box[0], Math.min(box[1], dx));
          ny = ty + Math.max(box[2], Math.min(box[3], dy));
          el.style.translate = nx + 'px ' + ny + 'px';
          if (!reduce) el.style.rotate = Math.max(-6, Math.min(6, ev.movementX * 0.5)) + 'deg';
          if (el === lamp) lampLight();
        }

        function end() {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', end);
          window.removeEventListener('pointercancel', end);
          if (!box) return;
          tx = nx; ty = ny;
          el.classList.remove('is-held');
          el.style.rotate = '';
          // A drag is not a click: swallow the one this release fires, so
          // dropping the lamp does not switch the theme.
          window.addEventListener('click', swallow, true);
          window.setTimeout(function () { window.removeEventListener('click', swallow, true); }, 0);
        }

        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', end);
        window.addEventListener('pointercancel', end);
      });

      resets.push(function () {
        tx = ty = 0;
        el.style.translate = '';
        el.style.zIndex = '';
      });
    });

    tidy.addEventListener('click', function () {
      for (var i = 0; i < resets.length; i++) resets[i]();
      top = 10;
      tidy.hidden = true;
      root.style.removeProperty('--lamp-x');
    });
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
