/* Renders one hobby gallery from ?id= on hobby.html.
   Gallery copy, photo counts and captions come from js/hobby-data.js.

   Layout is a mosaic — see sizeMosaic below. */
(function () {
  'use strict';

  var GROUPS = hobbies;                      // js/hobby-data.js
  var ORDER = Object.keys(GROUPS);

  function currentId() {
    return new URLSearchParams(window.location.search).get('id');
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
        /* A real <button>, not a click handler on the <img>: the tile has to
           be reachable and operable from the keyboard, and the browser's own
           button semantics announce it as something that does a thing. */
        '<button class="hob-shot__btn" type="button" data-shot="' + i + '" ' +
                'aria-label="Open ' + esc(cap || (g.label + ' ' + i)) + ' full size">' +
        '<img src="' + base + '"' +
             (small
               ? ' srcset="' + small + ' 600w, ' + base + ' ' + dim[0] + 'w"' +
                 ' sizes="(max-width: 599.98px) 100vw, (max-width: 899.98px) 50vw, 33vw"'
               : '') +
             ' alt="' + esc(cap || (g.label + ' photograph ' + i)) + '"' +
             (dim ? ' width="' + dim[0] + '" height="' + dim[1] + '"' : '') +
             ' loading="lazy" decoding="async">' +
        '</button>' +
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
    initLightbox(root, id, g);
  }

  /* ---------- the popover ----------
     A native <dialog>. showModal() brings focus trapping, inertness for the
     rest of the page, Escape-to-close and the ::backdrop for free — all of
     which a hand-rolled overlay would have to reimplement and would get
     subtly wrong.

     The full-size file is used here rather than the 600px variant the mosaic
     may be showing: this is the view where the detail is the point. It is
     only fetched when a tile is actually opened.

     Deep-linkable as ?id=<gallery>&i=<n>, one-based, which is what the home
     page graph's image nodes point at — clicking a photograph in the graph
     lands on the gallery with that photograph already open. */
  function initLightbox(root, id, g) {
    var dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.innerHTML =
      '<button class="lightbox__close" type="button" data-lb-close aria-label="Close">&times;</button>' +
      '<button class="lightbox__nav lightbox__nav--prev" type="button" data-lb-step="-1" aria-label="Previous image">&larr;</button>' +
      '<figure class="lightbox__fig">' +
        '<img data-lb-img alt="">' +
        '<figcaption><span data-lb-cap></span> <span class="lightbox__count" data-lb-count></span></figcaption>' +
      '</figure>' +
      '<button class="lightbox__nav lightbox__nav--next" type="button" data-lb-step="1" aria-label="Next image">&rarr;</button>';
    document.body.appendChild(dlg);

    var img = dlg.querySelector('[data-lb-img]');
    var cap = dlg.querySelector('[data-lb-cap]');
    var num = dlg.querySelector('[data-lb-count]');
    var at = 0;

    function show(i) {
      // One-based, wrapping at both ends like the gallery's prev/next links.
      at = ((i - 1) % g.n + g.n) % g.n + 1;
      var file = id + '-' + at + '.webp';
      var text = (g.captions && g.captions[at - 1]) || (g.label + ' ' + at);
      img.src = 'public/assets/hobbies/' + encodeURIComponent(file);
      img.alt = text;
      cap.textContent = text;
      num.textContent = at + ' / ' + g.n;
      if (!dlg.open) dlg.showModal();
      mark(at);
    }

    /* Reflect the open image in the URL so it can be copied and shared, and
       so a reload comes back to the same place. replaceState, not pushState:
       stepping through twenty photographs should not bury the page the
       visitor arrived from under twenty history entries. */
    function mark(i) {
      try {
        history.replaceState(null, '',
          'hobby.html?id=' + encodeURIComponent(id) + (i ? '&i=' + i : ''));
      } catch (err) { /* file:// and some privacy modes refuse this */ }
    }

    root.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-shot]');
      if (btn) show(Number(btn.getAttribute('data-shot')));
    });

    dlg.addEventListener('click', function (e) {
      var step = e.target.closest && e.target.closest('[data-lb-step]');
      if (step) { show(at + Number(step.getAttribute('data-lb-step'))); return; }
      if (e.target.closest('[data-lb-close]')) { dlg.close(); return; }
      // A click that lands on the dialog itself is a click on the backdrop
      // area around the figure.
      if (e.target === dlg) dlg.close();
    });

    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(at + 1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); show(at - 1); }
    });

    // Escape closes it natively, so only the URL needs tidying up.
    dlg.addEventListener('close', function () { mark(0); });

    var want = Number(new URLSearchParams(window.location.search).get('i'));
    if (want >= 1 && want <= g.n) show(want);
  }

  /* ---------- mosaic sizing ----------
     Each tile spans however many 10px grid rows its own aspect ratio needs, so
     photos keep their proportions instead of being cropped to one shape.
     Landscape shots also claim two columns. Recomputed on resize because the
     column width — and therefore the row count for a given ratio — changes. */
  function sizeMosaic(root) {
    var ROW = 10, GAP = 10;

    function size(fig) {
      // The ratio is baked in at render time from js/hobby-dims.js, which the
      // build regenerates for every file in the gallery directory — so it is
      // always present and nothing here has to wait on a decode.
      var ar = parseFloat(fig.style.getPropertyValue('--ar'));
      if (!ar) return;
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

    all();   // sized before a single image has been fetched

    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(all, 120);
    });
  }

  window.onReady(render);
})();
