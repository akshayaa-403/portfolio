/* Renders a case study from the ?id= query param against js/project-data.js,
   and sets per-project title/description/OG metadata. */
(function () {
  'use strict';

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setMeta(selector, attr, value) {
    var el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  }

  function currentId() {
    try {
      return new URLSearchParams(window.location.search).get('id');
    } catch (err) {
      var m = window.location.search.match(/[?&]id=([^&]*)/);
      return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
    }
  }

  function notFound(root) {
    root.innerHTML =
      '<div class="detail__missing">' +
        '<h1>That project isn&rsquo;t here</h1>' +
        '<p>The link may be out of date. Every case study is listed on the home page.</p>' +
        '<a class="btn btn--primary" href="index.html#work">Back to work</a>' +
      '</div>';
    document.title = 'Project not found — Akshayaa Kashyap';
  }

  /* ---------- deep-dive section renderers ----------
     Each section in a project's deepDive array is one of a small set of kinds.
     Everything interpolated goes through esc() — the data file is trusted, but
     escaping keeps a stray apostrophe or angle bracket from breaking markup. */
  var SECTION = {
    prose: function (s) {
      return '<section class="dd dd--prose">' +
        (s.heading ? '<h3>' + esc(s.heading) + '</h3>' : '') +
        '<p>' + esc(s.body) + '</p>' +
      '</section>';
    },

    figure: function (s) {
      return '<figure class="dd dd--figure">' +
        '<img src="' + esc(s.src) + '" alt="' + esc(s.alt || '') + '" loading="lazy" decoding="async">' +
        (s.caption ? '<figcaption>' + esc(s.caption) + '</figcaption>' : '') +
      '</figure>';
    },

    /* Formulas are rendered as styled TeX source rather than typeset maths.
       Pulling in MathJax or KaTeX would mean a network request and a build
       step, both of which this site deliberately avoids; the notation is
       short enough to stay readable as-is. */
    formula: function (s) {
      return '<figure class="dd dd--formula">' +
        '<div class="formula" role="math" aria-label="' + esc(s.caption || 'Formula') + '">' +
          esc(s.tex) +
        '</div>' +
        (s.caption ? '<figcaption>' + esc(s.caption) + '</figcaption>' : '') +
      '</figure>';
    },

    code: function (s) {
      return '<figure class="dd dd--code">' +
        '<pre><code class="lang-' + esc(s.lang || 'text') + '">' + esc(s.code) + '</code></pre>' +
        (s.caption ? '<figcaption>' + esc(s.caption) + '</figcaption>' : '') +
      '</figure>';
    },

    table: function (s) {
      var head = (s.head || []).map(function (h) {
        return '<th scope="col">' + esc(h) + '</th>';
      }).join('');
      var rows = (s.rows || []).map(function (r) {
        return '<tr>' + r.map(function (c, i) {
          return i === 0
            ? '<th scope="row">' + esc(c) + '</th>'
            : '<td>' + esc(c) + '</td>';
        }).join('') + '</tr>';
      }).join('');
      return '<figure class="dd dd--table">' +
        '<div class="table-scroll">' +
          '<table>' +
            (head ? '<thead><tr>' + head + '</tr></thead>' : '') +
            '<tbody>' + rows + '</tbody>' +
          '</table>' +
        '</div>' +
        (s.caption ? '<figcaption>' + esc(s.caption) + '</figcaption>' : '') +
      '</figure>';
    },

    steps: function (s) {
      var items = (s.items || []).map(function (it) {
        return '<li><strong>' + esc(it.t) + '</strong><span>' + esc(it.d) + '</span></li>';
      }).join('');
      return '<section class="dd dd--steps">' +
        (s.heading ? '<h3>' + esc(s.heading) + '</h3>' : '') +
        '<ol class="steps">' + items + '</ol>' +
      '</section>';
    }
  };

  function renderDeepDive(sections) {
    if (!sections || !sections.length) return '';
    var body = sections.map(function (s) {
      var fn = SECTION[s.kind];
      return fn ? fn(s) : '';
    }).join('');
    return '<div class="detail__deep">' +
      '<h2>How it works <span class="glyph" aria-hidden="true">◆</span></h2>' +
      body +
    '</div>';
  }

  function render() {
    var root = document.getElementById('detail-root');
    if (!root || typeof projects === 'undefined') return;

    var id = currentId();
    var index = -1;
    for (var i = 0; i < projects.length; i++) {
      if (projects[i].id === id) { index = i; break; }
    }
    if (index === -1) { notFound(root); return; }

    var p = projects[index];
    var prev = projects[index - 1];
    var next = projects[index + 1];

    /* --- metadata --- */
    var pageTitle = p.title + ' — Akshayaa Kashyap';
    document.title = pageTitle;
    setMeta('meta[name="description"]', 'content', p.summary);
    setMeta('meta[property="og:title"]', 'content', pageTitle);
    setMeta('meta[property="og:description"]', 'content', p.summary);
    setMeta('meta[name="twitter:title"]', 'content', pageTitle);
    setMeta('meta[name="twitter:description"]', 'content', p.summary);

    /* --- pieces --- */
    var tech = p.tech.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');

    var highlights = p.highlights.map(function (h) {
      return '<li>' + esc(h) + '</li>';
    }).join('');

    var actions = '<a class="btn btn--primary" href="' + esc(p.repo) + '" target="_blank" rel="noopener">Source ↗</a>' +
      (p.demo ? '<a class="btn" href="' + esc(p.demo) + '" target="_blank" rel="noopener">Live demo ↗</a>' : '');

    var navPrev = prev
      ? '<a href="project.html?id=' + encodeURIComponent(prev.id) + '">← ' + esc(prev.title) + '</a>'
      : '<span>← start of list</span>';
    var navNext = next
      ? '<a href="project.html?id=' + encodeURIComponent(next.id) + '">' + esc(next.title) + ' →</a>'
      : '<span>end of list →</span>';

    root.innerHTML =
      '<a class="detail__back" href="index.html#work">← All work</a>' +

      '<header class="detail__head">' +
        '<h1 class="detail__title">' + esc(p.title) + '</h1>' +
        '<p class="detail__tagline">' + esc(p.tagline) + '</p>' +
      '</header>' +

      '<div class="detail__cols">' +
        '<aside class="detail__aside">' +
          '<dl>' +
            '<dt>Year</dt><dd>' + esc(p.year) + '</dd>' +
            '<dt>Role</dt><dd>' + esc(p.role) + '</dd>' +
            '<dt>Built with</dt><dd><ul class="card__tech">' + tech + '</ul></dd>' +
          '</dl>' +
          '<div class="detail__actions">' + actions + '</div>' +
        '</aside>' +

        '<div class="detail__body">' +
          '<h2>Overview <span class="glyph" aria-hidden="true">▶</span></h2>' +
          '<p>' + esc(p.overview) + '</p>' +

          '<h2>What it does <span class="glyph" aria-hidden="true">⁕</span></h2>' +
          '<ul class="detail__list">' + highlights + '</ul>' +

          '<h2>The tricky part <span class="glyph" aria-hidden="true">⌘</span></h2>' +
          '<p>' + esc(p.challenge) + '</p>' +

          renderDeepDive(p.deepDive) +
        '</div>' +
      '</div>' +

      '<nav class="detail__nav" aria-label="Project navigation">' + navPrev + navNext + '</nav>';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
