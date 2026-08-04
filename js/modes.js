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

  function apply(mode, buttons) {
    if (MODES.indexOf(mode) === -1) mode = 'chaos';
    root.setAttribute('data-mode', mode);
    try { localStorage.setItem(KEY, mode); } catch (err) { /* private mode */ }

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

    apply(current(), buttons);

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (e) {
        apply(e.currentTarget.getAttribute('data-mode-btn'), buttons);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
