/* Runs before first paint — <script src> in <head>, deliberately not deferred.

   Marks JS available and applies the theme to <html> before anything is
   drawn, so nobody sees a flash of the wrong look. js/theme.js reconciles
   with the same attributes later; the rules must match its own.

   THE THEME FOLLOWS THE VIEWER'S CLOCK. The day is four periods, on sun-like
   hours — morning 5–10, day 10–17, evening 17–20, night 20–5 — written to
   data-time. Evening and night also set data-theme="dark", so every rule
   written for the dark theme applies to both; morning and evening then tint
   the paper (css/style.css, "Time of day"). The home page is the exception:
   it is the desk (data-mode="desk", written into index.html's <html>), which
   wears emilycampbell.co's periods, where evening is light, so there only
   night is dark. The header greeting names whatever data-time ends up being, so the theme and "Good evening" can
   never disagree.

   The visitor can override it for the rest of the tab's session — the
   greeting's time-of-day menu picks any of the four, the nav lamp and the
   desk lamp flip between light and dark: sessionStorage 'themeOverride'
   holds the chosen period.

   Blocking parsing for one small uncached file is the price of no FOUC. */
(function () {
  var r = document.documentElement;
  r.classList.add('js');

  var desk = r.getAttribute('data-mode') === 'desk';

  window.periodOf = function (h) {
    if (h >= 5 && h < 10) return 'morning';
    if (h >= 10 && h < 17) return 'day';
    if (h >= 17 && h < 20) return 'evening';
    return 'night';
  };

  var t = window.periodOf(new Date().getHours());
  try {
    var o = sessionStorage.getItem('themeOverride');
    if (o === 'morning' || o === 'day' || o === 'evening' || o === 'night') t = o;
  } catch (e) { /* private mode */ }
  r.setAttribute('data-time', t);
  if (t === 'night' || (t === 'evening' && !desk)) r.setAttribute('data-theme', 'dark');
})();
