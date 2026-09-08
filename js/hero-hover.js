/* Hero hover behaviour:
     1. Every prop / card scales up slightly on hover and eases back.
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
  /* One threshold for "the fade has converged" and "the track is audible".
     These were 0.04 and 0.05, so a click landing mid-fade could read as
     silent and start a second play instead of pausing. */
  var FADE_EPSILON = 0.04;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* The layout editor positions props by writing style.transform. This script
     writes the same property on hover and clears it on leave, which would wipe
     a drag the instant the pointer left the prop. The two cannot share the
     property, so hover scaling stands down entirely while editing. */
  var editing = window.isEditing();

  /* ---------- hover scale ---------- */
  // rotationOf() and isEditing() come from js/util.js.

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
    var items = stage.querySelectorAll('.prop:not(.prop--glow), .obj');
    var resetters = [];

    Array.prototype.forEach.call(items, function (el) {
      // Props carrying data-anim run their own CSS hover animation, which
      // needs the `transform` property to itself. The inline !important this
      // function writes would outrank a keyframe animation in the cascade, so
      // the animation would never be seen. CSS owns those props' hover
      // entirely, scale included.
      if (el.hasAttribute('data-anim')) return;

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
      // next hover measures the new arrangement. Registered once for the whole
      // stage below rather than once per element.
      resetters.push(function () {
        deg = null;
        baseTransform = null;
        el.classList.remove('is-hovered');
        el.style.removeProperty('transform');
        var glow = glowFor(el);
        if (glow) glow.classList.remove('is-lit');
      });
    });

    window.addEventListener('modechange', function () {
      for (var i = 0; i < resetters.length; i++) resetters[i]();
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
    var bar = document.querySelector('.player__bar span');
    audio.addEventListener('timeupdate', function () {
      if (timeEl) timeEl.textContent = fmt(audio.currentTime);
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
        var audible = !audio.paused && audio.volume > FADE_EPSILON;
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

  window.onReady(init);
})();
