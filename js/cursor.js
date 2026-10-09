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
  var el, header, x = 0, y = 0, shown = false, frame = 0;

  /* The header lets the pointer through its empty middle on purpose (so the
     page scrolling under it stays clickable), which means the graph's canvas
     is what sits under the nav bar's gaps. A cue there would describe the
     hero while the visitor is reading the nav, so nothing is cued inside the
     bar's box. Hidden on scroll, the box is off-screen and this is a no-op. */
  function overHeader(e) {
    if (!header) return false;
    var r = header.getBoundingClientRect();
    return e.clientY >= r.top && e.clientY < r.bottom;
  }

  function place() {
    frame = 0;
    el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
  }

  function onMove(e) {
    // Nearest ancestor that declares a cue. closest() walks text nodes'
    // parents too, so a label inside a card still reports the card's cue.
    var host = e.target.closest && !overHeader(e) ? e.target.closest('[data-cue]') : null;
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
      at(e);
      place();
      el.classList.add('is-on');
    }
    at(e);
    if (!frame) frame = requestAnimationFrame(place);
  }

  /* Beside the pointer, down and to the right — unless that would run the
     label off the window, in which case it flips to the left (or above). */
  function at(e) {
    var w = el.offsetWidth, h = el.offsetHeight;
    x = e.clientX + 16 + w > window.innerWidth - 8 ? e.clientX - 16 - w : e.clientX + 16;
    y = e.clientY + 18 + h > window.innerHeight - 8 ? e.clientY - 18 - h : e.clientY + 18;
  }

  function init() {
    header = document.querySelector('.site-header');
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
