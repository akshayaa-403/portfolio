/* Renders one hobby gallery from ?id= on hobby.html.

   Photo counts and captions live here rather than in a shared data file: this
   is the only page that reads them, and a second data module for three arrays
   would be a file to keep in sync for no gain.

   Layout is a CSS auto-fill grid, so column count falls out of the available
   width with no breakpoints and no layout pass. */
(function () {
  'use strict';

  var GROUPS = {
    photography: {
      label: 'Photography',
      note: 'light, and whatever it lands on',
      blurb: 'Mostly what the light was doing. Lantern markets, empty platforms, ' +
             'ridgelines at the wrong hour — the shot is usually the reason I stopped walking.',
      captions: ['Lantern market', 'Glass and colour', 'Empty platform', 'Dusk over the ridge',
                 'Shrine, lit', 'Someone else’s cat', 'Ridgeline', 'The valley opens up',
                 'Above the treeline', 'Long way down']
    },
    artwork: {
      label: 'Artwork',
      note: 'graphite, ink and gouache',
      blurb: 'Drawing is the one thing I do that has no undo. Graphite studies, ' +
             'ink portraits, and the occasional experiment in gouache.',
      captions: ['Eye study, graphite', 'Dazai, ink', 'Lotus', 'Botanical, ballpoint']
    },
    cooking: {
      label: 'Cooking',
      note: 'mostly dinner, occasionally dessert',
      blurb: 'Cooking is the fastest feedback loop I have outside a terminal: ' +
             'you find out whether it worked in about twenty minutes.',
      captions: ['Strawberry and grape tart', 'Crème caramel', 'Bruschetta, two ways',
                 'Ramen, soft egg, fried bread', 'Noodles with spring onion',
                 'Thali, all at once']
    }
  };

  var ORDER = ['photography', 'artwork', 'cooking'];

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function currentId() {
    try {
      return new URLSearchParams(window.location.search).get('id');
    } catch (err) {
      var m = window.location.search.match(/[?&]id=([^&]*)/);
      return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
    }
  }

  function render() {
    var root = document.getElementById('hobby-root');
    if (!root) return;

    var id = currentId();
    var g = GROUPS[id];

    if (!g) {
      root.innerHTML =
        '<div class="detail__missing">' +
          '<h1>No such gallery</h1>' +
          '<p>Try photography, artwork or cooking.</p>' +
          '<a class="btn btn--primary" href="index.html#hobbies">Back to hobbies</a>' +
        '</div>';
      document.title = 'Not found — Akshayaa Kashyap';
      return;
    }

    var title = g.label + ' — Akshayaa Kashyap';
    document.title = title;
    var d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute('content', g.blurb);

    var shots = g.captions.map(function (cap, i) {
      return '<figure class="hob-shot">' +
        '<img src="public/assets/hobbies/' + esc(id) + '-' + (i + 1) + '.webp"' +
             ' alt="' + esc(cap) + '" loading="lazy" decoding="async">' +
        '<figcaption>' + esc(cap) + '</figcaption>' +
      '</figure>';
    }).join('');

    // prev / next around the three galleries, wrapping at both ends
    var at = ORDER.indexOf(id);
    var prev = ORDER[(at - 1 + ORDER.length) % ORDER.length];
    var next = ORDER[(at + 1) % ORDER.length];

    root.innerHTML =
      '<a class="detail__back" href="index.html#hobbies">&larr; All hobbies</a>' +

      '<header class="detail__head">' +
        '<h1 class="detail__title">' + esc(g.label) + '</h1>' +
        '<p class="detail__tagline">' + esc(g.note) + '</p>' +
      '</header>' +

      '<p class="hobby__blurb">' + esc(g.blurb) + '</p>' +

      '<div class="hob-shots">' + shots + '</div>' +

      '<nav class="detail__nav" aria-label="Gallery navigation">' +
        '<a href="hobby.html?id=' + esc(prev) + '">&larr; ' + esc(GROUPS[prev].label) + '</a>' +
        '<a href="hobby.html?id=' + esc(next) + '">' + esc(GROUPS[next].label) + ' &rarr;</a>' +
      '</nav>';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
