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
        '<p>The link may be out of date. All six case studies are listed on the home page.</p>' +
        '<a class="btn btn--primary" href="index.html#work">Back to work</a>' +
      '</div>';
    document.title = 'Project not found — Akshayaa Kashyap';
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
