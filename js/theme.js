/* Loaded on every page. The site is deliberately light-only after the
   warm-paper rebrand, so there is no theme toggle to wire up — this keeps
   the shared per-page chores (currently the footer year) in one place. */
(function () {
  'use strict';

  function initYear() {
    var slots = document.querySelectorAll('[data-year]');
    var year = String(new Date().getFullYear());
    for (var i = 0; i < slots.length; i++) slots[i].textContent = year;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initYear);
  } else {
    initYear();
  }
})();
