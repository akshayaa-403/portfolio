/* Loaded on every page: shared per-page chores (footer year) plus the
   theme.

   The theme follows the viewer's clock: js/boot.js has already written
   data-time (morning / day / evening / night) and, for evening and night,
   data-theme="dark", before first paint. This file keeps that true while the
   page stays open — a period boundary passing turns the page with it — and
   owns the override.

   The override, for the rest of this tab's session, comes from two places:
   the greeting's time-of-day menu, which picks any period or hands back to
   the clock ("Auto"), and the lamps (the nav lamp, and the desk lamp in desk
   mode), which flip between light and dark. It lives in sessionStorage, so
   the next visit starts from the clock again. */
(function () {
  'use strict';

  var KEY = 'themeOverride';
  var PERIODS = ['morning', 'day', 'evening', 'night'];
  var root = document.documentElement;

  // The old light/dark preference was kept forever; the clock replaces it.
  try { localStorage.removeItem('theme'); } catch (e) {}

  function natural() { return window.periodOf(new Date().getHours()); }

  function override() {
    try {
      var v = sessionStorage.getItem(KEY);
      return PERIODS.indexOf(v) >= 0 ? v : null;
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

  // A period, or null / 'auto' to follow the clock again.
  function choose(period) {
    try {
      if (PERIODS.indexOf(period) >= 0) sessionStorage.setItem(KEY, period);
      else sessionStorage.removeItem(KEY);
    } catch (e) {
      // No storage: change this page only.
      apply(PERIODS.indexOf(period) >= 0 ? period : natural());
      return;
    }
    settle();
  }

  // Exposed so anything else on the page can drive the theme.
  window.portfolioTheme = {
    get: current,
    time: function () { return root.getAttribute('data-time'); },
    natural: natural,
    choice: override,
    set: choose,
    // Light to dark or back. Landing on the clock's own side of the line
    // hands control back to it rather than pinning a period.
    toggle: function () {
      var target = current() === 'dark' ? 'day' : 'night';
      choose(isDark(natural()) === (target === 'night') ? null : target);
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

  /* The time-of-day menu under the greeting. A native popover (light dismiss
     and Escape come with it); placed under its button when it opens, since
     the top layer does not know where the button is. */
  var NAMES = { morning: 'Morning', day: 'Afternoon', evening: 'Evening', night: 'Night' };
  function initPicker() {
    var btn = document.querySelector('[data-time-btn]');
    var menu = document.getElementById('timepick-menu');
    if (!btn || !menu) return;
    var picks = menu.querySelectorAll('[data-time-pick]');
    var now = menu.querySelector('[data-time-auto]');

    function sync() {
      var chosen = override();
      for (var i = 0; i < picks.length; i++) {
        var v = picks[i].getAttribute('data-time-pick');
        picks[i].setAttribute('aria-pressed', String(v === 'auto' ? !chosen : v === chosen));
      }
      if (now) now.textContent = '(' + NAMES[natural()] + ')';
      btn.setAttribute('aria-label', 'Time of day: ' + NAMES[root.getAttribute('data-time')] +
        (chosen ? '' : ', following your clock') + '. Change');
    }

    menu.addEventListener('click', function (e) {
      var pick = e.target.closest('[data-time-pick]');
      if (!pick) return;
      choose(pick.getAttribute('data-time-pick'));
      sync();
      if (menu.hidePopover) menu.hidePopover();
      btn.focus();
    });
    menu.addEventListener('beforetoggle', function (e) {
      if (e.newState !== 'open') return;
      sync();
      var r = btn.getBoundingClientRect();
      menu.style.top = (r.bottom + 6) + 'px';
      menu.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
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
    initPicker();
    initYear();
  }

  window.onReady(init);
})();
