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
      n: 27,
      blurb: 'Mostly what the light was doing. Lantern markets, empty platforms, ' +
             'ridgelines at the wrong hour, the shot is usually the reason I stopped walking.',
      captions: [
        'Lone tree above the valley, Mahabaleshwar',
        'Hanging Pillar, Lepakshi',
        'Balcony view',
        'Elephant\'s head point, Mahabaleshwar',
        'Landscape, Mahabaleshwar',
        'Sunset-1, Pune',
        'Sunset-2, Pune',
        'Sunset-3, Pune',
        'Sunset-4, Pune',
        'Atrium, hanging garden',
        'N. Safronov Art Exhibition, New Delhi',
        'Dream Vision Art Exhibition, New Delhi',
        'Delhi metro platform',
        'Sunset-5, Pune',
        'Diya, flowers and Buddha',
        'Sabarmati riverfront, Ahmedabad',
        'Sunrise at resort-1, Bengaluru',
        'Sunrise at resort-2, Bengaluru',
        'Sunrise at resort-3, Bengaluru',
        'Sunrise from terrace, Bengaluru',
        'Turkish lamp at Trade Expo, New Delhi',
        'Turkish lamps-2, New Delhi',
        'Turkish lamps-3, New Delhi',
        'Campus block after dark, Pune',
        'Terrace at nightfall',
        'Dream Vision Art Exhibition, New Delhi',
        'Alleyway, Chandni Chowk, New Delhi',
      ]
    },
    artwork: {
      label: 'Artwork',
      note: 'graphite, ink, and color',
      n: 6,
      blurb: 'Drawing is the one thing I do that has no undo.' +
             'Doodles I have made in the margins of notebooks, and sketches I have made to understand a subject, ',
      captions: [
        'Unravelling Blue Lotus',
        'Vessel of Dualities',
        'Mirroring Sovereign Identity',
        'Connecting with Nature',
        'Dissolution of Self',
        'Eye study, graphite'
      ]
    },
    cooking: {
      label: 'Cooking',
      note: 'mostly dinner, occasionally dessert',
      n: 14,
      blurb: 'Cooking is the fastest feedback loop I have outside a terminal: ' +
             'you find out whether it worked in about twenty minutes.',
      captions: [
        'Plated grilled chicken sandwich',
        'Grilled sandwich with devilled eggs',
        'Noodles with fried egg and chicken',
        'Glazed strawberry toast and coffee',
        'Fried rice with chicken and soy-marinated egg',
        'Noodles with spring onion, tofu, and cheese',
        'Egg on top, always',
        'Grilled tofu and vegetables with noodles',
        'Avocado toast',
        'Egg, noodles and avocado on a plate',
        'Thali, everything at once',
        'Party toasts',
        'Grilled and marinated oyster mushrooms',
        'Noodles with coriander and cheese'
      ]
    }
  };

  var ORDER = ['photography', 'artwork', 'cooking'];

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
      var file = id + '-' + i + '.webp';
      // Intrinsic size from js/hobby-dims.js, so the browser reserves the
      // right box before the image arrives. Without width/height every tile
      // resized on decode and the whole gallery shifted underneath the reader.
      var dim = (typeof HOBBY_DIMS !== 'undefined') ? HOBBY_DIMS[file] : null;
      var base = 'public/assets/hobbies/' + encodeURIComponent(file);

      /* A 600px variant exists for every source wider than ~660px (see
         tools/build-share-pages.js). Phones were being served the full-size
         desktop file — up to 198 KB for a tile a few hundred px wide. */
      var small = (dim && dim[0] > 660)
        ? 'public/assets/hobbies/' +
          encodeURIComponent(file.replace(/\.webp$/, '-600.webp'))
        : null;

      shots += '<figure class="hob-shot"' +
          (dim ? ' style="--ar:' + (dim[0] / dim[1]).toFixed(4) + '"' : '') +
          (dim && dim[0] / dim[1] > 1.2 ? ' data-wide="1"' : '') + '>' +
        '<img src="' + base + '"' +
             (small
               ? ' srcset="' + small + ' 600w, ' + base + ' ' + dim[0] + 'w"' +
                 ' sizes="(max-width: 599.98px) 100vw, (max-width: 899.98px) 50vw, 33vw"'
               : '') +
             ' alt="' + esc(cap || (g.label + ' photograph ' + i)) + '"' +
             (dim ? ' width="' + dim[0] + '" height="' + dim[1] + '"' : '') +
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
      // Prefer the ratio baked in at render time (js/hobby-dims.js); fall back
      // to the decoded image only when this file has no entry yet.
      var ar = parseFloat(fig.style.getPropertyValue('--ar'));
      if (!ar) {
        if (!img || !img.naturalWidth) return;
        ar = img.naturalWidth / img.naturalHeight;
      }
      fig.classList.toggle('hob-shot--wide', ar > 1.2);
      // Height the tile would take at its current rendered width, converted
      // to a whole number of grid rows (gaps count toward the span).
      var h = fig.clientWidth / ar;
      fig.style.setProperty('--rows', Math.max(9, Math.round((h + GAP) / (ROW + GAP))));
    }

    var figs = root.querySelectorAll('.hob-shot');

    function all() {
      for (var i = 0; i < figs.length; i++) size(figs[i]);
    }

    for (var i = 0; i < figs.length; i++) {
      (function (fig) {
        var img = fig.querySelector('img');
        // With --ar present this sizes the tile straight away, before the
        // image has been fetched at all.
        size(fig);
        if (!fig.style.getPropertyValue('--ar')) {
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

  window.onReady(render);
})();
