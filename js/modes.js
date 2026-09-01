/* View-mode switcher: chaos (default) / notebook / clean.
   The mode lives as data-mode on <html>; the inline <head> script has already
   applied the saved value before paint, so this only wires the buttons and
   keeps their aria-checked state honest. */
(function () {
  'use strict';

  var MODES = ['chaos', 'notebook', 'clean'];
  var KEY = 'viewMode';
  var root = document.documentElement;

  /* The head snippet normally sets data-mode before paint. Fall back to
     storage when it did not run (script stripped, CSP), the way theme.js
     already does — otherwise a saved mode is silently lost. */
  function current() {
    var m = root.getAttribute('data-mode');
    if (MODES.indexOf(m) !== -1) return m;
    try {
      var s = localStorage.getItem(KEY);
      if (MODES.indexOf(s) !== -1) return s;
    } catch (err) { /* private mode */ }
    return 'chaos';
  }

  /* `persist` is false on the initial sync: landing on the page is not a
     choice. Writing the default to storage on first load would turn every
     visitor into someone with a saved preference, so a later change to the
     default could never reach them. Only a real click records anything. */
  function apply(mode, buttons, persist) {
    if (MODES.indexOf(mode) === -1) mode = 'chaos';
    var changed = root.getAttribute('data-mode') !== mode;
    root.setAttribute('data-mode', mode);
    if (persist) {
      try { localStorage.setItem(KEY, mode); } catch (err) { /* private mode */ }
    }

    // The switcher is a radiogroup (one mode is always active, exactly one),
    // so state is aria-checked, not the aria-pressed of a toggle button.
    for (var i = 0; i < buttons.length; i++) {
      var on = buttons[i].getAttribute('data-mode-btn') === mode;
      buttons[i].setAttribute('aria-checked', on ? 'true' : 'false');
      buttons[i].removeAttribute('aria-pressed');
    }

    // Collage placement differs per mode, so let the hero re-measure — but
    // only on a real change. Listeners reset card transforms, so firing this
    // when the mode is already `mode` (the initial sync, or re-clicking the
    // active button) threw away every drag the visitor had made.
    if (changed) {
      window.dispatchEvent(new CustomEvent('modechange', { detail: { mode: mode } }));
    }
  }

  function init() {
    var buttons = document.querySelectorAll('[data-mode-btn]');
    if (!buttons.length) return;

    apply(current(), buttons, false);

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (e) {
        apply(e.currentTarget.getAttribute('data-mode-btn'), buttons, true);
      });
    }
  }

  window.onReady(init);
})();
