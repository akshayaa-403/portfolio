/* Hobbies — one icon per gallery, standing on a bracket shelf (the owner's
   sketch, 2026-11-13): a camera for photography, a paintbrush for artwork.
   Each icon is a plain link to its gallery (hobby.html?id=...). The bracket
   is CSS (.hob-shelf::after in css/style.css).

   Labels and counts come from js/hobby-data.js, which must load first — the
   same object the gallery page and the share-page build read. */
(function () {
  'use strict';

  var LINE = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  var ICONS = {
    photography: '<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.3l1.4-2h5.6l1.4 2h2.3A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="12.8" r="3.6"/>',
    artwork: '<path d="M20 4c-3.5 1.6-7.6 5.4-9.4 8.2l1.6 1.6C15 12 18.4 7.9 20 4z"/><path d="M10.6 12.2c-2 0-3.4 1.3-3.6 3.2-.2 1.6-1.1 2.8-3 3.1 2.6 1.4 6.9 1 8.1-1.6.5-1 .4-2.1.1-3.1"/>'
  };
  var FALLBACK = '<rect x="4" y="5" width="16" height="14" rx="1.5"/><path d="M4 15l4.5-4.5 4 4 2.5-2.5L20 17"/>';

  function init() {
    var host = document.getElementById('hobby-groups');
    if (!host || typeof hobbies === 'undefined') return;

    host.innerHTML = '<ul class="hob-shelf" role="list">' +
      Object.keys(hobbies).map(function (id) {
        var h = hobbies[id];
        return '<li><a class="hob-icon" href="hobby.html?id=' + esc(id) + '"' +
            ' data-cue="' + esc(h.label) + ' · ' + h.n + ' photos">' +
          '<svg viewBox="0 0 24 24" width="56" height="56" aria-hidden="true" focusable="false" ' + LINE + '>' +
            (ICONS[id] || FALLBACK) + '</svg>' +
          '<span class="visually-hidden">' + esc(h.label) + ', ' + h.n + ' photos</span>' +
        '</a></li>';
      }).join('') +
    '</ul>';
  }

  window.onReady(init);
})();
