/* Hobbies — a camera and a paintbrush standing on a wall shelf, one per
   gallery (owner's sketch, 2026-11-13), with that gallery's photographs in
   orbit round it (owner's pick from the second round of ideas).

   At rest only the two icons show. Pointing at one, or tabbing into it, sends
   its photographs out into a ring that turns slowly; pointing at a photograph
   stops the turn and names it below the shelf. A photograph opens in the
   shared lightbox; the icon itself is a plain link to the whole gallery.
   The shelf, the ring and all motion are CSS (css/style.css §15); the turn is
   off under reduced motion.

   Labels, counts and captions come from js/hobby-data.js, which must load
   first — the same object the gallery page and the share-page build read. */
(function () {
  'use strict';

  var LINE = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  var ICONS = {
    photography: '<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.3l1.4-2h5.6l1.4 2h2.3A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="12.8" r="3.6"/>',
    artwork: '<path d="M20 4c-3.5 1.6-7.6 5.4-9.4 8.2l1.6 1.6C15 12 18.4 7.9 20 4z"/><path d="M10.6 12.2c-2 0-3.4 1.3-3.6 3.2-.2 1.6-1.1 2.8-3 3.1 2.6 1.4 6.9 1 8.1-1.6.5-1 .4-2.1.1-3.1"/>'
  };
  // The word over each icon (owner's wording, 2026-11-13).
  var LABELS = { photography: 'Photography', artwork: 'Art' };
  var FALLBACK = '<rect x="4" y="5" width="16" height="14" rx="1.5"/><path d="M4 15l4.5-4.5 4 4 2.5-2.5L20 17"/>';

  function thumb(id, i, n, caption) {
    var base = 'public/assets/hobbies/' + id + '-' + (i + 1);
    // The 600px variant; artwork-2 has none, so fall back to the full file.
    return '<button class="hob-orb" type="button" style="--a:' + (360 / n * i - 90).toFixed(1) + 'deg"' +
        ' data-g="' + esc(id) + '" data-i="' + (i + 1) + '" data-c="' + esc(caption) + '"' +
        ' aria-label="' + esc(caption) + '">' +
      '<img src="' + base + '-600.webp" data-full="' + base + '.webp" alt="" loading="lazy" decoding="async">' +
    '</button>';
  }

  function init() {
    var host = document.getElementById('hobby-groups');
    if (!host || typeof hobbies === 'undefined') return;

    host.innerHTML = '<div class="hob-rack">' +
      '<ul class="hob-shelf" role="list">' +
        Object.keys(hobbies).map(function (id) {
          var h = hobbies[id], caps = h.captions || [];
          var orbs = [];
          for (var i = 0; i < h.n; i++) orbs.push(thumb(id, i, h.n, caps[i] || h.label + ' ' + (i + 1)));
          // r 92: the ring's inner edge (92 - 22) clears the label's corners
          // (about 61px from the icon's centre), so they never overlap.
          return '<li class="hob-item" style="--r:92px">' +
            '<span class="hob-label" aria-hidden="true">' + esc(LABELS[id] || h.label) + '</span>' +
            '<div class="hob-ring">' + orbs.join('') + '</div>' +
            '<a class="hob-icon" href="hobby.html?id=' + esc(id) + '">' +
              '<svg viewBox="0 0 24 24" width="56" height="56" aria-hidden="true" focusable="false" ' + LINE + '>' +
                (ICONS[id] || FALLBACK) + '</svg>' +
              '<span class="visually-hidden">' + esc(h.label) + ' gallery, ' + h.n + ' pieces</span>' +
            '</a>' +
          '</li>';
        }).join('') +
      '</ul>' +
      '<div class="hob-board" aria-hidden="true"><i></i><i></i></div>' +
    '</div>' +
    '<p class="hob-cap" data-hob-cap></p>';

    // A missing -600 variant falls back to the full file, once.
    host.addEventListener('error', function (e) {
      var img = e.target;
      if (img.tagName === 'IMG' && img.dataset.full) { img.src = img.dataset.full; delete img.dataset.full; }
    }, true);

    var cap = host.querySelector('[data-hob-cap]');
    function say(e) {
      var el = e.target.closest && e.target.closest('[data-c]');
      if (el && host.contains(el)) cap.textContent = el.getAttribute('data-c');
    }
    host.addEventListener('pointerover', say);
    host.addEventListener('focusin', say);

    host.addEventListener('click', function (e) {
      var orb = e.target.closest('.hob-orb');
      if (!orb || !window.portfolioLightbox) return;
      window.portfolioLightbox.open(orb.getAttribute('data-g'), +orb.getAttribute('data-i'));
    });
  }

  window.onReady(init);
})();
