/* Desk mode's desk (restored from the old chaos mode):
     1. Every prop / card scales up slightly on hover and eases back.
     2. The lamp is a theme switch: lit lamp = dark room.
     3. Hovering the music card plays a track; leaving it fades the audio out.

   Scaling is done in JS rather than pure CSS because each object carries its
   own authored rotate(). A CSS `transform: scale()` on hover would replace
   that rotation and make the object snap upright, so we read the computed
   rotation and rebuild the full transform instead.

   Motion is gated on prefers-reduced-motion. Audio only ever starts from a
   real pointer interaction, and stops when the visitor leaves desk mode. */
(function () {
  'use strict';

  var SCALE = 1.06;
  /* One threshold for "the fade has converged" and "the track is audible",
     so a click landing mid-fade cannot read as silent and start a second play. */
  var FADE_EPSILON = 0.04;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  function rotationOf(el) {
    var m = getComputedStyle(el).transform.match(/matrix(3d)?\(([^)]+)\)/);
    if (!m) return 0;
    var p = m[2].split(',').map(parseFloat);
    return Math.atan2(p[1], p[0]) * 180 / Math.PI;
  }

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

  function initHover() {
    if (reduce) return;
    var stage = document.querySelector('.stage');
    if (!stage) return;

    var items = stage.querySelectorAll('.prop, .obj');
    var resetters = [];

    Array.prototype.forEach.call(items, function (el) {
      var deg = null;

      el.addEventListener('pointerenter', function () {
        // Measured lazily: the layout differs below/above the breakpoint.
        if (deg === null) deg = Math.round(rotationOf(el));
        el.classList.add('is-hovered');
        el.style.setProperty('transform',
          'rotate(' + deg + 'deg) scale(' + SCALE + ')', 'important');
      });

      function reset() {
        el.classList.remove('is-hovered');
        el.style.removeProperty('transform');
      }
      el.addEventListener('pointerleave', reset);
      el.addEventListener('pointercancel', reset);
      resetters.push(function () { deg = null; reset(); });
    });

    window.addEventListener('modechange', function () {
      for (var i = 0; i < resetters.length; i++) resetters[i]();
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
    initHover();
    initLampSwitch();
    initAudio();
  });
})();
