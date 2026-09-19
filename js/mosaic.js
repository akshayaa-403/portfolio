/* The mosaic — the second view mode, and the one `clean` and then
   `fragments` used to occupy.

   A grid of small artifacts rather than a summary: a photograph out of a
   gallery, a snippet out of a case study, a margin note, a paper the work
   leans on, a count. Every tile is built from js/project-data.js and
   js/hobby-data.js at run time, so nothing here can claim more than the site
   actually holds, and every tile that links goes somewhere real.

   The pool is shuffled on each load and the first N shown, so the hero is
   different on a second visit without anyone having to write a second hero.

   Must load after both data files. */
(function () {
  'use strict';

  var COUNT = 14;

  /* How many cells of the mosaic each kind of artifact takes, as
     [columns, rows]. A grid where every tile is the same size is a table; the
     point of a mosaic is that the big things are big. A photograph wants to be
     portrait, a snippet of source wants width to stay on one line, and a count
     is one number and needs nothing. Applied as spans over uniform rows, with
     grid-auto-flow:dense filling whatever holes the mix leaves. */
  var SPAN = {
    stat:  [1, 1],
    tag:   [1, 1],
    note:  [1, 2],
    code:  [2, 2],
    photo: [1, 2]
  };

  function tile(cls, href, cue, inner, big) {
    var span = SPAN[cls] || [1, 1];
    // `big` promotes a tile to a double square. One or two of those per screen
    // is what stops the mosaic reading as a grid with a few tall cells in it.
    var style = ' style="--fc:' + (big ? 2 : span[0]) + ';--fr:' + (big ? 2 : span[1]) + '"';
    var open = href
      ? '<a class="frag frag--' + cls + '"' + style + ' href="' + safeUrl(href) +
        '" data-cue="' + esc(cue || 'Open') + '">'
      : '<div class="frag frag--' + cls + '"' + style + '>';
    return '<li role="listitem">' + open + inner + (href ? '</a>' : '</div>') + '</li>';
  }

  function pool() {
    var out = [];
    var i, j;

    /* --- counts. Derived, never typed, so they cannot drift. --- */
    var galleries = Object.keys(typeof hobbies === 'undefined' ? {} : hobbies);
    var photos = galleries.reduce(function (n, id) { return n + hobbies[id].n; }, 0);
    out.push(tile('stat', '#work', 'See the work',
      '<span class="frag__num">' + projects.length + '</span>' +
      '<span class="frag__label">case studies, each one shown working</span>'));
    out.push(tile('stat', '#hobbies', 'See the galleries',
      '<span class="frag__num">' + photos + '</span>' +
      '<span class="frag__label">photographs across ' + galleries.length + ' galleries</span>'));

    /* --- one photograph per gallery, deep-linked into the popover --- */
    for (i = 0; i < galleries.length; i++) {
      var g = hobbies[galleries[i]];
      var n = Math.floor(Math.random() * g.n) + 1;
      out.push(tile('photo', 'hobby.html?id=' + encodeURIComponent(galleries[i]) + '&i=' + n,
        'View photograph',
        '<img src="public/assets/hobbies/' + esc(galleries[i]) + '-' + n + '.webp"' +
        ' alt="' + esc(g.captions[n - 1] || g.label) + '" loading="lazy" decoding="async">' +
        '<span class="frag__cap">' + esc(g.captions[n - 1] || g.label) + '</span>',
        i === 0));
    }

    for (i = 0; i < projects.length; i++) {
      var p = projects[i];
      var href = 'project.html?id=' + encodeURIComponent(p.id);

      /* --- a margin note, in the hand it is set in on the detail page --- */
      var notes = (p.notes && (p.notes.overview || []).concat(p.notes.challenge || [])) || [];
      if (notes.length) {
        var note = notes[Math.floor(Math.random() * notes.length)];
        out.push(tile('note', href, 'Read the case study',
          '<span class="frag__note">' + esc(note[1]) + '</span>' +
          '<span class="frag__from">' + esc(p.title) + '</span>'));
      }

      /* --- a line of real source out of the deep dive --- */
      for (j = 0; j < (p.deepDive || []).length; j++) {
        var d = p.deepDive[j];
        if (d.kind === 'code') {
          out.push(tile('code', href, 'Read the case study',
            '<pre><code>' + esc(d.code.split('\n').slice(0, 5).join('\n')) + '</code></pre>' +
            '<span class="frag__from">' + esc(p.title) + '</span>'));
          break;
        }
      }

      /* --- the paper or spec behind the idea --- */
      if (p.tags && p.tags.length) {
        var t = p.tags[Math.floor(Math.random() * p.tags.length)];
        out.push(tile('tag', t[1], 'Read the source',
          '<span class="frag__kicker">reading behind ' + esc(p.title) + '</span>' +
          '<span class="frag__tag">' + esc(t[0]) + ' \u2197</span>'));
      }
    }

    return out;
  }

  function init() {
    var host = document.querySelector('[data-mosaic]');
    if (!host || typeof projects === 'undefined' || typeof hobbies === 'undefined') return;

    var all = pool();
    // Fisher-Yates. Math.random is fine here: this decides a decoration.
    for (var i = all.length - 1; i > 0; i--) {
      var k = Math.floor(Math.random() * (i + 1));
      var tmp = all[i]; all[i] = all[k]; all[k] = tmp;
    }
    host.innerHTML = all.slice(0, COUNT).join('');
  }

  window.onReady(init);
})();
