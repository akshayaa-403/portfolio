/* The image popover, shared by every place a hobby image is clickable.

   Used from two places today — the three cards in the Hobbies section on the
   home page, and every tile on a gallery page — and it is the destination the
   home page graph's image nodes point at. One component rather than one per
   surface, because "clicking an image opens it" has to mean the same thing
   everywhere on the site.

   A native <dialog> opened with showModal(). Focus trapping, inertness for
   the rest of the page, Escape-to-close and the ::backdrop all come free;
   a hand-rolled overlay would have to reimplement each of them and would get
   at least one subtly wrong.

   Reads js/hobby-data.js, so it must load after it.

       window.portfolioLightbox.open('photography', 3);   // 1-based

   One photograph at its own size, the page dimmed behind it, a close button
   in the gutter beside it, and the caption only while the pointer is on the
   image. No stepping: the gallery is right behind the dialog, one Escape
   away, and it shows every photograph at once.

   Built on first open, then reused: a dialog nobody opens costs nothing. */
(function (w) {
  'use strict';

  var dlg = null, img = null, cap = null;
  var gid = null, at = 1;

  function groups() { return (typeof hobbies !== 'undefined') ? hobbies : null; }

  function build() {
    if (dlg) return;
    dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    /* The close button is a sibling of the figure, not a child: it sits in the
       gutter beside the photograph's top corner rather than on top of it, so
       it never covers the one thing the popover exists to show. */
    dlg.innerHTML =
      '<div class="lightbox__frame">' +
        '<figure class="lightbox__fig">' +
          '<img data-lb-img alt="">' +
          '<figcaption data-lb-cap></figcaption>' +
        '</figure>' +
        '<button class="lightbox__close" type="button" data-lb-close aria-label="Close">&times;</button>' +
      '</div>';
    document.body.appendChild(dlg);

    img = dlg.querySelector('[data-lb-img]');
    cap = dlg.querySelector('[data-lb-cap]');

    dlg.addEventListener('click', function (e) {
      if (e.target.closest('[data-lb-close]')) { dlg.close(); return; }
      // Anything that is not the photograph itself is the room around it.
      if (!e.target.closest('.lightbox__fig')) dlg.close();
    });

    dlg.addEventListener('close', function () { mark(0); });
  }

  /* Reflect the open image in the URL so it can be copied and shared — but
     only on the gallery page, whose ?id=&i= this actually describes. Doing it
     on the home page would rewrite the address bar to a page the visitor is
     not on. replaceState, not pushState: opening photographs should not bury
     the referring page under a history entry each. */
  function onGalleryPage() {
    return /hobby\.html$/.test(w.location.pathname) ||
           /\/hobby\.html/.test(w.location.pathname);
  }
  function mark(i) {
    if (!onGalleryPage() || !gid) return;
    try {
      history.replaceState(null, '',
        'hobby.html?id=' + encodeURIComponent(gid) + (i ? '&i=' + i : ''));
    } catch (err) { /* file:// and some privacy modes refuse this */ }
  }

  function show(i) {
    var G = groups();
    if (!G || !G[gid]) return;
    var g = G[gid];

    at = Math.max(1, Math.min(g.n, i));

    var file = gid + '-' + at + '.webp';
    var text = (g.captions && g.captions[at - 1]) || (g.label + ' ' + at);

    // The full-size file, not the 600px variant the mosaic may be showing:
    // this is the view where the detail is the point. Fetched only on open.
    img.src = 'public/assets/hobbies/' + encodeURIComponent(file);
    img.alt = text;
    cap.textContent = text;

    if (!dlg.open) dlg.showModal();
    mark(at);
  }

  w.portfolioLightbox = {
    open: function (galleryId, index) {
      var G = groups();
      if (!G || !G[galleryId]) return false;
      build();
      gid = galleryId;
      show(Number(index) || 1);
      return true;
    }
  };
})(window);
