/* Loaded on every page: shared per-page chores (footer year) plus the
   light/dark theme.

   The theme is expressed as data-theme="dark" on <html>. On the home page the
   hero lamp is the switch — lamp lit means dark room — but the choice is
   global, so project.html and 404.html pick up the same stored preference even
   though they have no lamp of their own.

   Order of precedence: an explicit stored choice, then the OS preference, then
   light. The no-FOUC snippet in each page's <head> applies the same logic
   before first paint; this file must agree with it. */
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
    return window.matchMedia &&
           window.matchMedia('(prefers-color-scheme: dark)').matches;
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

  // Exposed so js/hero-hover.js can drive it from the lamp.
  window.portfolioTheme = {
    get: current,
    set: function (t) { apply(t, true); },
    toggle: function () { apply(current() === 'dark' ? 'light' : 'dark', true); }
  };

  /* Follow the OS while the visitor has not made an explicit choice. */
  function watchSystem() {
    if (!window.matchMedia) return;
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function (e) {
      if (stored()) return;                 // an explicit choice wins
      apply(e.matches ? 'dark' : 'light', false);
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
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
    if (window.ResizeObserver) {
      new ResizeObserver(set).observe(header);
    } else {
      window.addEventListener('resize', set);
    }
  }

  /* Pages without the hero lamp still need a way to change theme. Any page
     carrying [data-theme-toggle] gets the control wired up here; index.html
     has the lamp instead and ships no such button. */
  function initToggle() {
    var btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;

    function sync() {
      var dark = current() === 'dark';
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      btn.setAttribute('aria-label',
        dark ? 'Switch to light theme' : 'Switch to dark theme');
      btn.textContent = dark ? '☾' : '☀';
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
    // The head snippet has already set the attribute; only reconcile if it
    // did not run (e.g. the script was stripped).
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
