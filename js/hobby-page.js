/* Renders one hobby gallery from ?id= on hobby.html.

   Photo counts live here rather than in a shared data file: this is the only
   page that reads them, and a second module for three numbers would be a file
   to keep in sync for no gain. Images are numbered <id>-1.webp upward, so
   adding photos means bumping n.

   Layout is a mosaic — see sizeMosaic below. */
(function () {
  'use strict';

  var GROUPS = {
    photography: {
      label: 'Photography',
      note: 'light, and whatever it lands on',
      n: 29,
      blurb: 'Mostly what the light was doing. Lantern markets, empty platforms, ' +
             'ridgelines at the wrong hour — the shot is usually the reason I stopped walking.',
      captions: [
        'Balcony view, monsoon sky',
        'Hampi, carved colonnade',
        'Ridgeline in the dry season',
        'Lone tree above the valley',
        'The escarpment opens up',
        'Sun through the treeline',
        'Fort wall at dusk',
        'Last light over the plain',
        'City skyline going pink',
        'Atrium, hanging garden',
        'Gallery corridor',
        'Neon and glass cabinets',
        'Metro platform in the rain',
        'Branches against a violet sky',
        'Storm building over the mast',
        'Diya, flowers and the Buddha',
        'Lakeside through the leaves',
        'Moon over the lawn',
        'Pines at the edge of the grass',
        'Bungalows at golden hour',
        'Overcast, sun breaking through',
        'Lantern market, blue and gold',
        'Lamps stacked to the ceiling',
        'Every colour at once',
        'Holding one up to the light',
        'Campus block after dark',
        'Terrace at nightfall',
        'Stage lights and paper flowers',
        'Alleyway, midday'
      ]
    },
    artwork: {
      label: 'Artwork',
      note: 'graphite, ink and gouache',
      n: 6,
      blurb: 'Drawing is the one thing I do that has no undo. Graphite studies, ' +
             'ink portraits, and the occasional experiment in gouache.',
      captions: [
        'Ink botanical, ruled paper',
        'Yin-yang in a peacock frame',
        'Figure study, pencil',
        'Lotus on a yellow field, gouache',
        'Dazai — ink portrait',
        'Eye study, graphite'
      ]
    },
    cooking: {
      label: 'Cooking',
      note: 'mostly dinner, occasionally dessert',
      n: 15,
      blurb: 'Cooking is the fastest feedback loop I have outside a terminal: ' +
             'you find out whether it worked in about twenty minutes.',
      captions: [
        'Grilled sandwich, egg and cucumber',
        'Plated, with the good sauce',
        'Noodles under a fried egg',
        'Strawberry toast and coffee',
        'Rice tower, egg and pickle',
        'Same stew, more bread',
        'Noodles with spring onion',
        'Egg on top, always',
        'Cutlets and slaw',
        'Open toasties on the good plate',
        'Poached eggs, two ways',
        'Thali, everything at once',
        'Party toasts, assembly line',
        'Mushrooms, slow-cooked',
        'Noodles with avocado'
      ]
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

    var shots = '';
    for (var i = 1; i <= g.n; i++) {
      var cap = (g.captions && g.captions[i - 1]) || '';
      shots += '<figure class="hob-shot">' +
        '<img src="public/assets/hobbies/' + esc(id) + '-' + i + '.webp"' +
             ' alt="' + esc(cap || (g.label + ' photograph ' + i)) + '"' +
             ' loading="lazy" decoding="async">' +
        (cap ? '<figcaption>' + esc(cap) + '</figcaption>' : '') +
      '</figure>';
    }

    // Deferred: the mosaic spans are set from each image's real aspect ratio
    // once it decodes (see sizeMosaic below).

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

    sizeMosaic(root);
  }

  /* ---------- mosaic sizing ----------
     Each tile spans however many 10px grid rows its own aspect ratio needs, so
     photos keep their proportions instead of being cropped to one shape.
     Landscape shots also claim two columns. Recomputed on resize because the
     column width — and therefore the row count for a given ratio — changes. */
  function sizeMosaic(root) {
    var ROW = 10, GAP = 10;

    function size(fig) {
      var img = fig.querySelector('img');
      if (!img || !img.naturalWidth) return;
      var ar = img.naturalWidth / img.naturalHeight;
      fig.classList.toggle('hob-shot--wide', ar > 1.2);
      // Height the tile would take at its current rendered width, converted
      // to a whole number of grid rows (gaps count toward the span).
      var h = fig.clientWidth / ar;
      fig.style.setProperty('--rows', Math.max(6, Math.round((h + GAP) / (ROW + GAP))));
    }

    var figs = root.querySelectorAll('.hob-shot');

    function all() {
      for (var i = 0; i < figs.length; i++) size(figs[i]);
    }

    for (var i = 0; i < figs.length; i++) {
      (function (fig) {
        var img = fig.querySelector('img');
        if (img.complete && img.naturalWidth) {
          size(fig);
        } else {
          img.addEventListener('load', function () { size(fig); });
          img.addEventListener('error', function () { size(fig); });
        }
      })(figs[i]);
    }

    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(all, 120);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
