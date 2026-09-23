/* Loaded on every page: shared per-page chores (footer year) plus the
   light/dark theme.

   The theme is expressed as data-theme="dark" on <html>. On the home page the
   hero lamp is the switch — lamp lit means dark room — but the choice is
   global, so project.html and 404.html pick up the same stored preference even
   though they have no lamp of their own.

   Order of precedence: an explicit stored choice, then the OS preference, then
   light. js/boot.js applies the same logic before first paint; this file must
   agree with it. */
(function () {
  'use strict';

  var KEY = 'theme';

  function stored() {
    try {
      var v = localStorage.getItem(KEY);
      return (v === 'dark' || v === 'light') ? v : null;
    } catch (e) { return null; }
  }

  function systemPrefersDark() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function current() {
    return document.documentElement.getAttribute('data-theme') === 'dark'
      ? 'dark' : 'light';
  }

  function apply(theme, persist) {
    var root = document.documentElement;
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');

    if (persist) {
      try { localStorage.setItem(KEY, theme); } catch (e) {}
    }
    // Let the rest of the page react (the lamp updates its own pressed state).
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
  }

  // Exposed so anything else on the page can drive the theme.
  window.portfolioTheme = {
    get: current,
    set: function (t) { apply(t, true); },
    toggle: function () { apply(current() === 'dark' ? 'light' : 'dark', true); }
  };

  /* Follow the OS while the visitor has not made an explicit choice. */
  function watchSystem() {
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', function (e) {
        if (stored()) return;               // an explicit choice wins
        apply(e.matches ? 'dark' : 'light', false);
      });
  }

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
    // js/boot.js has already set the attribute; only reconcile if it did not
    // run (e.g. the script was stripped).
    if (!document.documentElement.hasAttribute('data-theme')) {
      var want = stored() || (systemPrefersDark() ? 'dark' : 'light');
      if (want === 'dark') apply('dark', false);
    }
    watchSystem();
    initHeaderHeight();
    initToggle();
    initYear();
  }

  window.onReady(init);
})();
