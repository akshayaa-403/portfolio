/* Cursor cue — the pointer says what the thing under it does.

   One element follows the pointer. Whenever the pointer is over something
   carrying data-cue, the element shows that label ("Drag", "Open the
   gallery", "Read the case study"); otherwise it hides. That is the whole
   feature: it replaces guessing which parts of a decorated page are live.

   Deliberately not a replacement for the system cursor — the real cursor
   stays visible, because hiding it breaks pointer accuracy for anyone who
   needs it and disappears entirely if this script fails.

   Off for coarse pointers (no hover to report) and when the visitor has
   asked for reduced motion the label still shows, it just does not ease. */
(function () {
  'use strict';

  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var eased = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  var el, x = 0, y = 0, shown = false, frame = 0;

  function place() {
    frame = 0;
    el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
  }

  function onMove(e) {
    // Nearest ancestor that declares a cue. closest() walks text nodes'
    // parents too, so a label inside a card still reports the card's cue.
    var host = e.target.closest ? e.target.closest('[data-cue]') : null;
    var cue = host && host.getAttribute('data-cue');

    if (!cue) {
      if (shown) { shown = false; el.classList.remove('is-on'); }
      return;
    }

    if (el.textContent !== cue) el.textContent = cue;
    if (!shown) {
      shown = true;
      // Jump to the pointer before revealing, or the label slides in from
      // wherever it was last seen.
      x = e.clientX + 16; y = e.clientY + 18;
      place();
      el.classList.add('is-on');
    }
    x = e.clientX + 16;
    y = e.clientY + 18;
    if (!frame) frame = requestAnimationFrame(place);
  }

  function init() {
    el = document.createElement('div');
    el.className = 'cue' + (eased ? ' cue--eased' : '');
    // Decorative duplication: every cue describes a control that already
    // announces itself through its own text, role or aria-label.
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);

    document.addEventListener('mousemove', onMove, { passive: true });
    // Leaving the window or opening the lightbox must not strand the label.
    document.addEventListener('mouseleave', function () {
      shown = false;
      el.classList.remove('is-on');
    });
  }

  window.onReady(init);
})();
