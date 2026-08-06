/* Hero hover behaviour:
     1. Every prop / card / palette scales up slightly on hover and eases back.
     2. Hovering the music card plays a track; leaving it fades the audio out.

   Scaling is done in JS rather than pure CSS because each object carries its
   own authored rotate() from the hand-placed layout. A CSS `transform: scale()`
   on hover would replace that rotation and make the object snap upright, so we
   read the computed rotation and rebuild the full transform instead.

   All of it is gated on prefers-reduced-motion, and audio never autoplays —
   it only ever starts from a real pointer interaction. */
(function () {
  'use strict';

  var SCALE = 1.06;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* The layout editor positions props by writing style.transform. This script
     writes the same property on hover and clears it on leave, which would wipe
     a drag the instant the pointer left the prop. The two cannot share the
     property, so hover scaling stands down entirely while editing. */
  var editing = /[?&]edit=1/.test(location.search);

  /* ---------- hover scale ---------- */
  function rotationOf(el) {
    var t = getComputedStyle(el).transform;
    if (!t || t === 'none') return 0;
    var m = t.match(/matrix\(([^)]+)\)/);
    if (!m) return 0;
    var p = m[1].split(',').map(parseFloat);
    return Math.atan2(p[1], p[0]) * 180 / Math.PI;
  }

  /* The lamp's glow is a separate prop, so hovering the lamp has to light it
     explicitly — the two are siblings and CSS :hover on one cannot reach the
     other. Returns the glow element for a given prop, or null. */
  function glowFor(el) {
    if (el.getAttribute('data-prop') !== 'lamp') return null;
    return document.querySelector('.prop--glow');
  }

  /* ---------- lamp = theme switch ----------
     Lit lamp means dark room. Hovering previews the glow; clicking commits. */
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

    lamp.addEventListener('click', function () {
      window.portfolioTheme.toggle();
    });
    window.addEventListener('themechange', sync);
    sync();
  }

  function initHover() {
    if (reduce || editing) return;
    var stage = document.querySelector('.stage');
    if (!stage) return;

    // The glow is decorative and never hovered in its own right.
    var items = stage.querySelectorAll('.prop:not(.prop--glow), .obj, .palette');

    Array.prototype.forEach.call(items, function (el) {
      var baseTransform = null;
      var deg = null;

      el.addEventListener('pointerenter', function () {
        if (el.classList.contains('is-dragging')) return;
        // Capture the authored transform once, lazily: the layout differs per
        // view mode, so reading it at load time would cache the wrong value.
        if (deg === null) deg = Math.round(rotationOf(el));
        baseTransform = 'rotate(' + deg + 'deg)';
        el.classList.add('is-hovered');
        el.style.setProperty('transform',
          baseTransform + ' scale(' + SCALE + ')', 'important');

        var glow = glowFor(el);
        if (glow) glow.classList.add('is-lit');
      });

      function reset() {
        el.classList.remove('is-hovered');
        // Drop the override rather than re-writing it: the stylesheet rule is
        // the source of truth and may include more than a rotation.
        el.style.removeProperty('transform');

        // Safe to drop unconditionally: in the dark theme a CSS rule keeps the
        // glow lit regardless of this class, so leaving the lamp does not
        // switch the light off.
        var glow = glowFor(el);
        if (glow) glow.classList.remove('is-lit');
      }
      el.addEventListener('pointerleave', reset);
      el.addEventListener('pointercancel', reset);

      // A mode switch re-lays-out the stage; drop the cached rotation so the
      // next hover measures the new arrangement.
      window.addEventListener('modechange', function () {
        deg = null;
        baseTransform = null;
        el.classList.remove('is-hovered');
        el.style.removeProperty('transform');
        var glow = glowFor(el);
        if (glow) glow.classList.remove('is-lit');
      });
    });
  }

  /* ---------- player: hover to play + explicit play/pause ----------
     Hovering the card starts the track and fades it in; leaving fades out and
     pauses. The button is the accessible, deliberate control — once it has
     been used, hover stops hijacking playback so the user's choice sticks. */
  function initAudio() {
    var card = document.querySelector('.obj--player');
    var audio = document.getElementById('hero-audio');
    if (!card || !audio) return;

    var btn = document.getElementById('player-play');
    var timeEl = document.getElementById('player-time');
    var userControlled = false;      // set once the button is pressed
    var fade = null;

    audio.volume = 0;

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
      var icon = btn.querySelector('.player__icon');
      if (icon) icon.textContent = playing ? '⏸' : '▶';
    }
    audio.addEventListener('play', syncButton);
    audio.addEventListener('pause', syncButton);

    /* live timer */
    function fmt(t) {
      if (!isFinite(t)) return '0:00';
      var m = Math.floor(t / 60), sec = Math.floor(t % 60);
      return m + ':' + (sec < 10 ? '0' : '') + sec;
    }
    audio.addEventListener('timeupdate', function () {
      if (timeEl) timeEl.textContent = fmt(audio.currentTime);
      var bar = document.querySelector('.player__bar span');
      if (bar && audio.duration) {
        bar.style.right = (100 - (audio.currentTime / audio.duration) * 100).toFixed(2) + '%';
      }
    });

    if (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        // Hover may already have started the track, so a naive audio.paused
        // check makes the first press read as "pause". Drive from intent:
        // if it is audibly playing, stop; otherwise start.
        var audible = !audio.paused && audio.volume > 0.05;
        userControlled = true;
        if (audible) pause(); else play();
      });
    }

    // Hover-to-play would fire every time the card is grabbed in the editor.
    card.addEventListener('pointerenter', function () {
      if (!userControlled && !editing) play();
    });
    function leave() {
      if (!userControlled) pause();
    }
    card.addEventListener('pointerleave', leave);
    card.addEventListener('pointercancel', leave);
  }

  function init() {
    initHover();
    initLampSwitch();
    initAudio();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
