/* The case-study page: header, facts row, at-a-glance and the demo embed,
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

  /* ---------- live demo embed ----------
     Click-to-activate, never auto-loaded: six case studies each pulling a
     whole third-party app on page load would cost more than the case study
     itself, and Streamlit apps wake slowly from idle.

     The iframe is sandboxed and the src is only set on activation. If the
     remote refuses to be framed (X-Frame-Options / frame-ancestors) or is
     simply asleep, nothing paints — so a timer reveals a fallback with a
     direct link rather than leaving an empty box. */
  function liveEmbed(p) {
    if (!p.demo) return '';
    return '<section class="live" data-live>' +
      '<h3 class="a-h">See it running</h3>' +
      '<div class="live__frame">' +
        '<div class="live__chrome" aria-hidden="true">' +
          '<span class="live__dot"></span><span class="live__dot"></span><span class="live__dot"></span>' +
          '<span class="live__url">' + esc(p.demo.replace(/^https?:\/\//, '')) + '</span>' +
        '</div>' +
        '<div class="live__stage">' +
          '<button class="live__start" type="button" data-live-start ' +
                  'aria-label="Load the live demo of ' + esc(p.title) + ' in this page">' +
            '<span class="live__play" aria-hidden="true">▶</span>' +
            '<span class="live__label">Load live demo</span>' +
            '<span class="live__note">Loads ' + esc(p.demo.replace(/^https?:\/\//, '').split('/')[0]) + '</span>' +
          '</button>' +
          '<div class="live__fallback" data-live-fallback hidden>' +
            '<p>This demo can’t be shown inside the page.</p>' +
            '<a class="btn btn--primary" href="' + safeUrl(p.demo) + '" ' +
               'target="_blank" rel="noopener noreferrer">Open it in a new tab ↗</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<p class="live__caption">Running the real deployment. ' +
        '<a href="' + safeUrl(p.demo) + '" target="_blank" rel="noopener noreferrer">' +
        'Open in a new tab ↗</a></p>' +
    '</section>';
  }

  /* Wire up the activation button. One delegated listener, like initCopy. */
  function initLive(root) {
    root.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-live-start]');
      if (!btn) return;

      var section = btn.closest('[data-live]');
      var stage = btn.parentNode;
      var fallback = section.querySelector('[data-live-fallback]');
      var url = section.querySelector('.live__caption a').href;

      var frame = document.createElement('iframe');
      frame.className = 'live__iframe';
      frame.title = 'Live demo';
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer';
      /* allow-scripts without allow-same-origin: the two together let a frame
         escape its own sandbox (the browser warns about it) and also made
         contentDocument readable, which broke the load check below. Scripts,
         forms and target=_blank links are all these demos need. */
      frame.setAttribute('sandbox', 'allow-scripts allow-forms allow-popups');
      frame.setAttribute('allow', 'clipboard-write');

      /* Whether a cross-origin frame actually rendered is not observable from
         this side: a refusal, an abort and a real page all end up as one
         opaque frame, and all of them may fire `load`. So confirm out of band
         with a no-cors fetch of the same URL — it resolves for a reachable
         origin and rejects when the network or the host says no. That does not
         prove the frame was allowed to paint, so the visitor always keeps the
         "open in a new tab" link in the caption as an escape hatch. */
      function giveUp() {
        if (section.classList.contains('is-live')) return;
        frame.remove();
        section.classList.remove('is-loading');
        if (fallback) fallback.hidden = false;
      }

      function succeed() {
        if (!frame.parentNode) return;          // already given up
        section.classList.add('is-live');
        section.classList.remove('is-loading');
      }

      var decided = false;
      function decide(ok) {
        if (decided) return;
        decided = true;
        if (ok) succeed(); else giveUp();
      }

      /* The frame's own `load` is the primary signal: it fires for anything
         the browser actually rendered. It cannot distinguish a real page from
         an error page, but the probe below cannot be trusted to do that either
         — a no-cors fetch rejects for hosts that embed perfectly well (a
         redirecting Streamlit app, for one), so treating a rejection as
         failure hid a working demo. So: `load` wins, and the probe only acts
         when the frame stays silent. Either way the caption keeps a direct
         link, so a blank frame is never a dead end. */
      /* Whether an opaque cross-origin frame really painted is not knowable
         from this side: refusals, aborts and real pages all look alike, and
         all of them can fire `load`. A no-cors probe is no better — Streamlit
         rejects it while embedding perfectly well.

         So trust `load`, and keep the escape hatch permanent: the caption
         under every embed carries a direct link, so even a frame that comes
         up blank is one click from the real thing. `error` and the timeout
         still catch the cases the browser does report. */
      frame.addEventListener('load', function () { decide(true); });
      frame.addEventListener('error', function () { decide(false); });

      // Backstop: nothing above resolved, so stop showing a spinner forever.
      window.setTimeout(function () { decide(false); }, 12000);

      btn.remove();
      section.classList.add('is-loading');
      stage.appendChild(frame);
      frame.src = url;
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
  var ARTICLE_V = '1';

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
        glance(p) +
        '<p class="detail__dek" data-dek hidden></p>' +
      '</div>' +
      '<article class="a" id="article" aria-busy="true"></article>' +
      '<nav class="detail__nav" aria-label="Project navigation">' + navPrev + navNext + '</nav>';

    initCopy(root);
    initLive(root);

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
      window.Article.render(art, p, spec, { live: liveEmbed(p) });
      if (typeof window.initOpener === 'function') window.initOpener(p, spec);
    });
  }

  window.onReady(render);
})();
