/* Draggable skills marquee.

   The track drifts on its own via the CSS `drift` animation. Grabbing it
   pauses that animation and hands control to the pointer; releasing resumes
   the drift from wherever the drag left off.

   Because the CSS animation and a manual transform both write `transform`,
   the two can't run at once. On grab we freeze: read the animated position,
   pause the animation, and take over with an explicit translateX. On release
   we convert the final offset back into an animation delay so the drift picks
   up seamlessly instead of snapping.

   The list is duplicated in the markup, so the track is exactly twice the
   visible sequence and the offset wraps cleanly at -50%. */
(function () {
  'use strict';

  var DRIFT_MS = 38000;   // must match the `drift` duration in style.css

  /* Keep the "Skills" heading vertically in line with the hero's mode toggle.
     The toggle is centred in chaos and notebook but hand-placed off-centre in
     clean, and its width is intrinsic to the button labels, so the centre is
     measured rather than hard-coded. */
  function alignHeading() {
    var section = document.querySelector('.strip-section');
    var modes = document.querySelector('.hero__actions .modes');
    if (!section || !modes) return;
    var r = modes.getBoundingClientRect();
    if (!r.width) return;                       // hidden (no-JS or narrow layout)
    var cx = r.left + window.scrollX + r.width / 2;
    section.style.setProperty('--skills-cx', (cx / document.documentElement.clientWidth * 100) + '%');
  }

  function init() {
    alignHeading();
    window.addEventListener('resize', alignHeading);
    window.addEventListener('modechange', function () {
      // let the mode's layout settle before measuring
      window.requestAnimationFrame(alignHeading);
    });

    var strips = document.querySelectorAll('[data-marquee]');
    if (!strips.length) return;

    Array.prototype.forEach.call(strips, function (strip) {
      var track = strip.querySelector('.strip__track');
      if (!track) return;

      var half = 0;          // px the offset wraps at (half the track width)
      var offset = 0;        // current manual offset, px, always <= 0
      var dragging = false;
      var startX = 0;
      var startOffset = 0;
      var moved = 0;

      function measure() {
        half = track.scrollWidth / 2;
      }
      measure();
      window.addEventListener('resize', measure);

      /* Current x translation, whether it came from the animation or from us. */
      function currentX() {
        var t = getComputedStyle(track).transform;
        if (!t || t === 'none') return 0;
        var m = t.match(/matrix\(([^)]+)\)/);
        return m ? parseFloat(m[1].split(',')[4]) || 0 : 0;
      }

      function normalise(x) {
        if (!half) return x;
        // keep the offset inside (-half, 0] so it never runs off the end
        x = x % half;
        if (x > 0) x -= half;
        return x;
      }

      strip.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        measure();
        offset = normalise(currentX());
        // Freeze the drift and take over.
        track.style.animation = 'none';
        track.style.transform = 'translateX(' + offset + 'px)';

        dragging = true;
        moved = 0;
        startX = e.clientX;
        startOffset = offset;
        strip.classList.add('is-dragging');
        try { strip.setPointerCapture(e.pointerId); } catch (err) {}
      });

      strip.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var dx = e.clientX - startX;
        moved = Math.max(moved, Math.abs(dx));
        offset = normalise(startOffset + dx);
        track.style.transform = 'translateX(' + offset + 'px)';
        e.preventDefault();
      });

      function release() {
        if (!dragging) return;
        dragging = false;
        strip.classList.remove('is-dragging');

        // Resume the drift where the drag ended. The animation runs 0 -> -50%
        // over DRIFT_MS, so an offset of `offset` px corresponds to being
        // (offset / -half) of the way through; express that as a negative
        // delay to start mid-cycle.
        var progress = half ? Math.min(1, Math.max(0, -offset / half)) : 0;
        track.style.transform = '';
        track.style.animation = '';
        track.style.animationDelay = (-progress * DRIFT_MS) + 'ms';
      }

      strip.addEventListener('pointerup', release);
      strip.addEventListener('pointercancel', release);
      strip.addEventListener('lostpointercapture', release);

      // A drag that travelled any real distance shouldn't also register as a
      // click on whatever sat under the pointer.
      strip.addEventListener('click', function (e) {
        if (moved > 4) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
