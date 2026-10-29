/* The case-study page: header, facts row and at-a-glance,
   from the summary in js/project-data.js; then the article itself, which
   js/article.js renders from js/articles/<id>.js. Sets per-project
   title/description/OG metadata. */
(function () {
  'use strict';


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

  /* One delegated listener rather than one per button. Uses the async
     Clipboard API where available and falls back to a hidden textarea, since
     clipboard access is blocked on insecure origins. */
  function initCopy(root) {
    root.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.code-copy');
      if (!btn) return;
      var fig = btn.closest('.dd--code');
      var code = fig && fig.querySelector('code');
      if (!code) return;
      var text = code.textContent;

      /* The visible label changes but aria-label was fixed at "Copy code",
         so the accessible name stopped matching the visible text (WCAG 2.5.3
         label-in-name). Keep the two in step. */
      function done(ok) {
        var label = ok ? 'Copied' : 'Press Ctrl+C';
        btn.textContent = label;
        btn.setAttribute('aria-label', label);
        btn.classList.add('is-done');
        setTimeout(function () {
          btn.textContent = 'Copy';
          btn.setAttribute('aria-label', 'Copy code');
          btn.classList.remove('is-done');
        }, 1600);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); },
                                                 function () { done(false); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:absolute;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (err) {}
        document.body.removeChild(ta);
        done(ok);
      }
    });
  }

  /* ---------- header facts ----------
     One horizontal row under the tagline: when the repo was started, when it
     was last touched, what it was built with, and the concepts it leans on.

     The two dates come from the GitHub API (created_at / pushed_at) and are
     recorded in project-data.js rather than fetched at run time — a live call
     would mean a third-party request on every page view, a rate limit, and a
     row that renders empty when the API is slow. Arteza has no public repo,
     so it simply has no dates: the rows are omitted rather than filled with a
     guess or a dash that reads like missing data.

     Tags are keywords that point outward — the paper, the spec, the docs
     behind the idea — so a reader who does not know CycleGAN or ROUGE has
     one click to the source rather than a search. */
  function facts(p, tech) {
    var rows = '';

    if (p.created) {
      rows += '<div><dt>Date created</dt><dd>' +
        '<time datetime="' + esc(p.created) + '">' + longDate(p.created) + '</time></dd></div>';
    }
    if (p.updated) {
      rows += '<div><dt>Last updated</dt><dd>' +
        '<time datetime="' + esc(p.updated) + '">' + longDate(p.updated) + '</time></dd></div>';
    }
    if (tech) {
      rows += '<div><dt>Tech stack used</dt><dd><ul class="fact__chips">' + tech + '</ul></dd></div>';
    }

    var tags = (p.tags || []).map(function (t) {
      return '<li><a href="' + safeUrl(t[1]) + '" target="_blank" rel="noopener noreferrer">' +
        esc(t[0]) + ' ↗</a></li>';
    }).join('');
    if (tags) {
      rows += '<div><dt>Tags</dt><dd><ul class="fact__chips fact__chips--tags">' + tags + '</ul></dd></div>';
    }

    return rows ? '<dl class="detail__facts">' + rows + '</dl>' : '';
  }

  /* ---------- at a glance ----------
     Four lines at the top of a long page. The prose below is worth reading and
     takes ten minutes; this is for the reader who has twenty seconds and needs
     to know what the problem was, what got built, what came out of it and what
     it was built with before deciding whether to spend the ten minutes.

     Stack is not authored — it is the same `tech` array the header row uses,
     so the two can never disagree. */
  function glance(p) {
    if (!p.glance) return '';
    var rows = [
      ['Problem', p.glance.problem],
      ['What I built', p.glance.built],
      ['Result', p.glance.result],
      ['Stack', (p.tech || []).join(', ')]
    ].filter(function (r) { return r[1]; }).map(function (r) {
      return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>';
    }).join('');
    return rows ? '<dl class="detail__glance">' + rows + '</dl>' : '';
  }

  /* ---------- the matryoshka ----------
     The project as nested dolls, outermost first (`nest` in project-data.js):
     the thing you see, then what it is made of, down to the smallest unit it
     handles, which is the solid doll that does not open. Opening one lifts
     its head off and stands the next beside it; the list under the row says
     in words what each doll is, so the drawing is aria-hidden. It lives in
     the margin, small, and only where there is a margin (css/project.css):
     under the glance box it pushed the article 400px down.

     One doll shape, drawn at 0.8x per layer, painted in the day's three Wada
     colours (the --graph-* tokens), turned one step per doll. */
  var DOLL_TOP = 'M50 4C30 4 22 20 24 36C26 46 20 52 17 64L16 72H84L83 64C80 52 74 46 76 36C78 20 70 4 50 4Z';
  var DOLL_BOT = 'M16 72C9 92 8 122 14 140C18 152 30 156 50 156C70 156 82 152 86 140C92 122 91 92 84 72Z';
  var TONES = ['var(--graph-projects)', 'var(--graph-hobbies)', 'var(--graph-name)'];
  function doll(i, solid) {
    var petals = '';
    for (var k = 0; k < 5; k++) {
      var a = k / 5 * 2 * Math.PI - Math.PI / 2;
      petals += '<circle cx="' + (50 + 7 * Math.cos(a)).toFixed(1) + '" cy="' + (108 + 7 * Math.sin(a)).toFixed(1) + '" r="5"/>';
    }
    return '<span class="nest__doll' + (solid ? ' is-solid' : '') + '" data-doll="' + i + '"' +
        ' style="--h:' + Math.round(190 * Math.pow(0.8, i)) + 'px; --doll-a:' + TONES[i % 3] + '; --doll-b:' + TONES[(i + 1) % 3] + '; --doll-c:' + TONES[(i + 2) % 3] + '">' +
      '<svg viewBox="0 -40 100 200" aria-hidden="true" focusable="false">' +
        '<g class="nest__bot"><path class="nest__shell" d="' + DOLL_BOT + '"/>' +
          '<ellipse class="nest__apron" cx="50" cy="110" rx="23" ry="32"/>' +
          '<g class="nest__flower">' + petals + '</g><circle class="nest__heart" cx="50" cy="108" r="3.4"/></g>' +
        '<g class="nest__top"><path class="nest__shell" d="' + DOLL_TOP + '"/>' +
          (solid ? '' : '<rect class="nest__band" x="16" y="68" width="68" height="5" rx="2"/>') +
          '<ellipse class="nest__face" cx="50" cy="37" rx="14" ry="15"/>' +
          '<path class="nest__hair" d="M36 33Q50 18 64 33"/>' +
          '<circle class="nest__eye" cx="45" cy="38" r="1.7"/><circle class="nest__eye" cx="55" cy="38" r="1.7"/>' +
          '<circle class="nest__cheek" cx="41" cy="44" r="3"/><circle class="nest__cheek" cx="59" cy="44" r="3"/>' +
          '<path class="nest__mouth" d="M47 47Q50 49.5 53 47"/></g>' +
      '</svg></span>';
  }
  function nest(p) {
    if (!p.nest || !p.nest.length) return '';
    var n = p.nest.length;
    var items = p.nest.map(function (l, i) {
      var last = i === n - 1;
      return '<li class="nest__item"' + (i ? ' hidden' : '') + '><b>' + esc(l[0]) + '</b> ' + esc(l[1]) +
        (last ? ' <em>This one doesn’t open.</em>' : '') + '</li>';
    }).join('');
    return '<section class="nest" aria-labelledby="nest-h" data-nest>' +
      '<h2 class="nest__h" id="nest-h">All the way down</h2>' +
      '<div class="nest__row" data-nest-row data-cue="Open it">' + doll(0, n === 1) + '</div>' +
      '<ol class="nest__list">' + items + '</ol>' +
      '<button type="button" class="nest__btn" data-nest-btn></button>' +
    '</section>';
  }
  function initNest(root, p) {
    var box = root.querySelector('[data-nest]');
    if (!box) return;
    var row = box.querySelector('[data-nest-row]'), btn = box.querySelector('[data-nest-btn]');
    var items = box.querySelectorAll('.nest__item');
    var n = p.nest.length, at = 0;   // index of the innermost doll standing
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function label() {
      btn.textContent = at < n - 1 ? 'Open ' + p.nest[at][0].replace(/^The /, 'the ') : 'Put them back';
    }
    function open() {
      if (at >= n - 1) {
        // The solid one: a shake, then everything goes back inside.
        var last = row.lastElementChild;
        if (!reduce && !last.classList.contains('is-shaking')) {
          last.classList.add('is-shaking');
          setTimeout(function () { last.classList.remove('is-shaking'); }, 500);
        }
        return;
      }
      row.lastElementChild.classList.add('is-open');
      at++;
      row.insertAdjacentHTML('beforeend', doll(at, at === n - 1));
      if (!reduce) row.lastElementChild.classList.add('is-new');
      items[at].hidden = false;
      label();
    }
    function reset() {
      row.innerHTML = doll(0, n === 1);
      for (var i = 1; i < items.length; i++) items[i].hidden = true;
      at = 0;
      label();
    }
    btn.addEventListener('click', function () { if (at >= n - 1) reset(); else open(); });
    row.addEventListener('click', open);
    label();
  }

  /* "2025-04-04" -> "4 April 2025". Built from the parts rather than
     toLocaleDateString(new Date(s)): parsing a bare date string gives UTC
     midnight, which renders as the previous day for anyone west of London. */
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'];
  function longDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!m) return esc(iso || '');
    return Number(m[3]) + ' ' + MONTHS[Number(m[2]) - 1] + ' ' + m[1];
  }

  /* ---------- the article ----------
     Each case study is its own file, js/articles/<id>.js plus
     css/articles/<id>.css, fetched for this page only — the home page loads
     the summaries in js/project-data.js and nothing else. The version tag
     travels with both so a deploy is never half old, half new. */
  var ARTICLE_V = '2';

  function loadArticle(id, done) {
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'css/articles/' + encodeURIComponent(id) + '.css?v=' + ARTICLE_V;
    document.head.appendChild(css);

    var js = document.createElement('script');
    js.src = 'js/articles/' + encodeURIComponent(id) + '.js?v=' + ARTICLE_V;
    js.onload = function () { done(window.Article && window.Article.get(id)); };
    js.onerror = function () { done(null); };
    document.body.appendChild(js);
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

    var tech = (p.tech || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');

    /* The label has to match where the link goes. Arteza's `repo` is the
       shop itself — the client owns the code — and labelling that "Source"
       promised a repository and delivered a storefront. */
    var repoLabel = /^https:\/\/github\.com\//.test(String(p.repo || '')) ? 'Source ↗' : 'Visit the site ↗';
    var actions = '<a class="btn btn--quiet" href="' + safeUrl(p.repo) + '" target="_blank" rel="noopener noreferrer">' + repoLabel + '</a>' +
      (p.demo ? '<a class="btn btn--quiet" href="' + safeUrl(p.demo) + '" target="_blank" rel="noopener noreferrer">Live demo ↗</a>' : '');

    var navPrev = prev
      ? '<a href="work/' + encodeURIComponent(prev.id) + '.html"><span>Previous</span>' + esc(prev.title) + '</a>'
      : '<span></span>';
    var navNext = next
      ? '<a href="work/' + encodeURIComponent(next.id) + '.html"><span>Next</span>' + esc(next.title) + '</a>'
      : '<span></span>';

    root.innerHTML =
      '<a class="detail__back" href="index.html#work">← All work</a>' +
      '<header class="detail__head">' +
        '<div class="detail__headrow">' +
          '<div class="detail__headtext">' +
            '<h1 class="detail__title">' + esc(p.title) + '</h1>' +
            '<p class="detail__tagline">' + esc(p.tagline) + '</p>' +
          '</div>' +
          '<div class="detail__actions">' + actions + '</div>' +
        '</div>' +
        facts(p, tech) +
      '</header>' +
      '<div class="detail__body">' +
        // First, so its top lines up with the glance box it sits beside in
        // the margin (css/project.css).
        nest(p) +
        glance(p) +
        '<p class="detail__dek" data-dek hidden></p>' +
      '</div>' +
      '<article class="a" id="article" aria-busy="true"></article>' +
      '<nav class="detail__nav" aria-label="Project navigation">' + navPrev + navNext + '</nav>';

    initCopy(root);
    initNest(root, p);

    loadArticle(p.id, function (spec) {
      var art = document.getElementById('article');
      art.removeAttribute('aria-busy');
      if (!spec) {
        art.innerHTML = '<p class="a-p">' + esc(p.summary) + '</p>';
        if (typeof window.initOpener === 'function') window.initOpener(p, null);
        return;
      }
      if (spec.dek) {
        var dek = root.querySelector('[data-dek]');
        dek.innerHTML = window.Article.inline(spec.dek);
        dek.hidden = false;
      }
      window.Article.render(art, p, spec);
      if (typeof window.initOpener === 'function') window.initOpener(p, spec);
    });
  }

  window.onReady(render);
})();
