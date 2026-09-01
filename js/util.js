/* Shared helpers. Loaded first on every page (defer preserves order), so the
   functions below exist before any other script runs.

   These were previously copy-pasted into four files each, which is how the
   URL-scheme check ended up in some copies and not others. One definition. */
(function (w) {
  'use strict';

  /* Escape a value for interpolation into HTML text or an attribute. */
  w.esc = function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  /* Escaping makes a string safe as HTML text, which is not the same as
     making it safe as an href: "javascript:alert(1)" survives escaping intact
     and still runs on click. Allow only the schemes this site links with. */
  w.safeUrl = function safeUrl(value) {
    var s = String(value == null ? '' : value).trim();
    // Relative, root-relative and anchor URLs carry no scheme and are fine.
    if (/^(?:[a-z][a-z0-9+.-]*:)/i.test(s) && !/^(?:https?|mailto):/i.test(s)) {
      return '#';
    }
    return w.esc(s);
  };

  /* Degrees of rotation currently applied to an element, read back from the
     computed matrix. Used wherever a hover or drag has to rebuild a transform
     without discarding the authored rotate(). */
  w.rotationOf = function rotationOf(el) {
    var t = getComputedStyle(el).transform;
    if (!t || t === 'none') return 0;
    // matrix3d() reports 16 values; the 2D rotation still lives in the first
    // two of column one. Handle both rather than returning 0 for a 3D matrix,
    // which is what a bare matrix() test did whenever will-change promoted an
    // element to its own layer.
    var m = t.match(/matrix(3d)?\(([^)]+)\)/);
    if (!m) return 0;
    var p = m[2].split(',').map(parseFloat);
    return Math.atan2(p[1], p[0]) * 180 / Math.PI;
  };

  /* True when the dev layout editor has been requested for this page load. */
  w.isEditing = function isEditing() {
    return /[?&]edit=1/.test(location.search);
  };

  /* Run fn once the DOM is ready, whether or not it already is. */
  w.onReady = function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  };
})(window);
