/* Loaded on every page: shared per-page chores (footer year) plus the
   theme.

   The theme follows the viewer's clock: js/boot.js has already written
   data-time (morning / day / evening / night) and, for evening and night,
   data-theme="dark", before first paint. This file keeps that true while the
   page stays open — a period boundary passing turns the page with it — and
   owns the override.

   The override is the pull-cord in the header and, in desk mode, the lamp.
   Either flips to the opposite of what the clock says ('day' or 'night') for
   the rest of this tab's session; flipping again hands control back to the
   clock. It lives in sessionStorage, so the next visit starts from the clock
   again. */
(function () {
  'use strict';

  var KEY = 'themeOverride';
  var root = document.documentElement;

  // The old light/dark preference was kept forever; the clock replaces it.
  try { localStorage.removeItem('theme'); } catch (e) {}

  function natural() { return window.periodOf(new Date().getHours()); }

  function override() {
    try {
      var v = sessionStorage.getItem(KEY);
      return (v === 'day' || v === 'night') ? v : null;
    } catch (e) { return null; }
  }

  function isDark(period) { return period === 'evening' || period === 'night'; }

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function apply(period) {
    var changed = root.getAttribute('data-time') !== period;
    root.setAttribute('data-time', period);
    if (isDark(period)) root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    if (changed) {
      // Let the rest of the page react (the lamp, the figures, the switch).
      window.dispatchEvent(new CustomEvent('themechange', {
        detail: { theme: current(), time: period }
      }));
    }
  }

  function settle() { apply(override() || natural()); }

  // Exposed so anything else on the page can drive the theme.
  window.portfolioTheme = {
    get: current,
    time: function () { return root.getAttribute('data-time'); },
    toggle: function () {
      try {
        if (override()) sessionStorage.removeItem(KEY);
        else sessionStorage.setItem(KEY, isDark(natural()) ? 'day' : 'night');
      } catch (e) {
        // No storage: flip this page only.
        apply(current() === 'dark' ? 'day' : 'night');
        return;
      }
      settle();
    }
  };

  /* Publish the real header height as --header-h. The hero pulls itself up by
     this amount to sit under the sticky bar; a hardcoded fallback is wrong at
     every breakpoint where the bar grows (the mobile toggle is taller than the
     desktop nav row). Measured rather than guessed. */
  function initHeaderHeight() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    function set() {
      document.documentElement.style.setProperty(
        '--header-h', header.offsetHeight + 'px');
    }
    set();
    new ResizeObserver(set).observe(header);
  }

  /* The pull-cord lamp in the header, on every page. It draws its own two
     states from data-theme in CSS — the rays are painted only while the light
     is on — so nothing here writes into the button, which would throw the
     drawing away. */
  function initToggle() {
    var btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;

    function sync() {
      var dark = current() === 'dark';
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      btn.setAttribute('aria-label',
        dark ? 'Switch to light theme' : 'Switch to dark theme');
    }

    btn.addEventListener('click', function () {
      window.portfolioTheme.toggle();
    });
    window.addEventListener('themechange', sync);
    sync();
  }

  function initYear() {
    var slots = document.querySelectorAll('[data-year]');
    var year = String(new Date().getFullYear());
    for (var i = 0; i < slots.length; i++) slots[i].textContent = year;
  }

  function init() {
    // js/boot.js has normally set data-time already; settle() is a no-op then,
    // and the reconcile if it did not run.
    settle();
    // Check the clock once a minute, so evening arrives on an open page.
    setInterval(function () { if (!override()) settle(); }, 60000);
    initHeaderHeight();
    initToggle();
    initYear();
  }

  window.onReady(init);
})();
