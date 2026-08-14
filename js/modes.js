/* View-mode switcher: chaos (default) / notebook / clean.
   The mode lives as data-mode on <html>; the inline <head> script has already
   applied the saved value before paint, so this only wires the buttons and
   keeps their aria-pressed state honest. */
(function () {
  'use strict';

  var MODES = ['chaos', 'notebook', 'clean'];
  var KEY = 'viewMode';
  var root = document.documentElement;

  function current() {
    var m = root.getAttribute('data-mode');
    return MODES.indexOf(m) === -1 ? 'chaos' : m;
  }

  /* `persist` is false on the initial sync: landing on the page is not a
     choice. Writing the default to storage on first load would turn every
     visitor into someone with a saved preference, so a later change to the
     default could never reach them. Only a real click records anything. */
  function apply(mode, buttons, persist) {
    if (MODES.indexOf(mode) === -1) mode = 'chaos';
    root.setAttribute('data-mode', mode);
    if (persist) {
      try { localStorage.setItem(KEY, mode); } catch (err) { /* private mode */ }
    }

    for (var i = 0; i < buttons.length; i++) {
      var on = buttons[i].getAttribute('data-mode-btn') === mode;
      buttons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }

    // Collage placement differs per mode, so let the hero re-measure.
    window.dispatchEvent(new CustomEvent('modechange', { detail: { mode: mode } }));
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
