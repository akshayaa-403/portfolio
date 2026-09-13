/* Runs before first paint — <script src> in <head>, deliberately not deferred.

   Marks JS available and applies the saved view mode and theme to <html>
   before anything is drawn, so a returning visitor never sees a flash of the
   default light/chaos look. js/theme.js and js/modes.js reconcile with these
   same attributes later; the precedence rules must match theirs.

   Blocking parsing for one small uncached file is the price of no FOUC. */
(function () {
  var r = document.documentElement;
  r.classList.add('js');

  var m = 'chaos';
  try {
    var s = localStorage.getItem('viewMode');
    if (s === 'notebook' || s === 'clean' || s === 'chaos') m = s;
  } catch (e) { /* private mode */ }
  r.setAttribute('data-mode', m);

  var t = null;
  try { t = localStorage.getItem('theme'); } catch (e) { /* private mode */ }
  if (t !== 'dark' && t !== 'light') {
    t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (t === 'dark') r.setAttribute('data-theme', 'dark');
})();
