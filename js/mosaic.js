/* The mosaic — the third view mode: the whole site at a glance.

   One tile per case study (its group, title, the one measured figure, the
   tagline and the first of its stack), a count for each section below, and
   a photograph from each gallery. Read in one pass, it says what the page
   holds before anyone scrolls. Every tile is built from js/project-data.js,
   js/hobby-data.js and js/readings-data.js at run time, so nothing here can
   claim more than the site actually holds, and every tile links somewhere
   real.

   Fixed order, not shuffled: a summary is read top-left first, so the work
   leads and is in the same place on every visit. Only which photograph
   stands for each gallery changes.

   Must load after all three data files. */
(function () {
  'use strict';

  /* Archived case studies keep their pages and their line under "Also
     built", but not a tile — the list below has stepped back from them. */
  function live() {
    return projects.filter(function (p) { return !p.archived; });
  }

  /* [columns, rows] per kind. A case study holds five short lines, so it
     takes a double square, and so does a photograph: at six columns, three
     of them fill one band exactly. Counts and the contact tile are single
     cells, four of them, so they fill the double square beside the work. */
  var SPAN = {
    work:  [2, 2],
    stat:  [1, 1],
    photo: [2, 2]
  };

  function tile(cls, href, cue, inner) {
    var span = SPAN[cls] || [1, 1];
    return '<li role="listitem"><a class="frag frag--' + cls + '"' +
      ' style="--fc:' + span[0] + ';--fr:' + span[1] + '"' +
      ' href="' + safeUrl(href) + '" data-cue="' + esc(cue) + '">' +
      inner + '</a></li>';
  }

  function stat(href, cue, n, label) {
    return tile('stat', href, cue,
      '<span class="frag__num">' + n + '</span>' +
      '<span class="frag__label">' + esc(label) + '</span>');
  }

  function build() {
    var out = [];
    var shown = live();

    /* --- the work, in the list's own order --- */
    shown.forEach(function (p) {
      out.push(tile('work', 'work/' + encodeURIComponent(p.id) + '.html', 'Read the case study',
        '<span class="frag__kicker">' + esc(p.group || '') + (p.year ? ' · ' + esc(p.year) : '') + '</span>' +
        '<span class="frag__title">' + esc(p.title) + '</span>' +
        // No honest figure, no line: the gap is the hierarchy (see CLAUDE.md).
        (p.metric ? '<span class="frag__metric">' + esc(p.metric) + '</span>' : '') +
        '<span class="frag__tagline">' + esc(p.tagline) + '</span>' +
        '<span class="frag__from">' + esc((p.tech || []).slice(0, 3).join(' · ')) + '</span>'));
    });

    /* --- counts. Derived, never typed, so they cannot drift. --- */
    var galleries = Object.keys(hobbies);
    var photos = galleries.reduce(function (n, id) { return n + hobbies[id].n; }, 0);
    var books = typeof readings === 'undefined' ? 0 :
      readings.groups.reduce(function (n, g) { return n + g.books.length; }, 0);
    out.push(stat('#work', 'See the work', shown.length, 'case studies'));
    if (books) out.push(stat('#readings', 'See the shelf', books, 'books on the shelf'));
    out.push(stat('#hobbies', 'See the galleries', photos,
      'photographs, ' + galleries.length + ' galleries'));
    out.push(tile('stat', '#contact', 'Get in touch',
      '<span class="frag__title">Get in touch</span>' +
      '<span class="frag__label">email · GitHub</span>'));

    /* --- one photograph per gallery, deep-linked into the popover --- */
    galleries.forEach(function (id) {
      var g = hobbies[id];
      var n = Math.floor(Math.random() * g.n) + 1;
      var cap = g.captions[n - 1] || g.label;
      out.push(tile('photo', 'hobby.html?id=' + encodeURIComponent(id) + '&i=' + n, 'View photograph',
        '<img src="public/assets/hobbies/' + esc(id) + '-' + n + '.webp"' +
        ' alt="' + esc(cap) + '" loading="lazy" decoding="async">' +
        '<span class="frag__cap">' + esc(g.label) + '</span>'));
    });

    return out;
  }

  function init() {
    var host = document.querySelector('[data-mosaic]');
    if (!host || typeof projects === 'undefined' || typeof hobbies === 'undefined') return;
    host.innerHTML = build().join('');
  }

  window.onReady(init);
})();
