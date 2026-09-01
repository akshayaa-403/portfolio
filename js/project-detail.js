/* Renders a case study from the ?id= query param against js/project-data.js,
   and sets per-project title/description/OG metadata. */
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
        '<img src="' + safeUrl(s.src) + '" alt="' + esc(s.alt || '') + '" loading="lazy" decoding="async">' +
        (s.caption ? '<figcaption>' + esc(s.caption) + '</figcaption>' : '') +
      '</figure>';
    },

    /* Typeset by js/tex.js — a small renderer covering the TeX subset these
       case studies use. MathJax/KaTeX would mean a CDN request and ~300KB for
       eight short formulas, on a site that is deliberately buildless. */
    formula: function (s) {
      // The ONE value on this page that reaches innerHTML unescaped, because
      // renderTex returns markup by design. Its contract: every interpolated
      // substring is escaped inside js/tex.js (see esc() there) and it emits
      // only <span>/<sup>/<sub> with fixed class names. Keep that true, or
      // escape here instead.
      var body = (typeof window.renderTex === 'function')
        ? window.renderTex(s.tex)
        : esc(s.tex);
      return '<figure class="dd dd--formula">' +
        '<div class="formula" role="math" aria-label="' + esc(s.caption || 'Formula') + '">' +
          body +
        '</div>' +
        (s.caption ? '<figcaption>' + esc(s.caption) + '</figcaption>' : '') +
      '</figure>';
    },

    code: function (s) {
      // Language chip and copy button sit in a header bar so the block reads
      // as a code block rather than an indented paragraph. The button is wired
      // up after render (see initCopy) so no inline handler is needed.
      return '<figure class="dd dd--code">' +
        '<div class="code-head">' +
          '<span class="code-lang">' + esc(s.lang || 'text') + '</span>' +
          '<button class="code-copy" type="button" aria-label="Copy code">Copy</button>' +
        '</div>' +
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
    return '<section class="dd live" data-live>' +
      '<h2>See it running <span class="glyph" aria-hidden="true">▸</span></h2>' +
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

    /* Walk the same order the home page presents: "Recently Made" first, then
       "Other Work". Using the raw array order sent visitors to a neighbour
       that sits nowhere near this card on the page they came from. */
    var ordered = projects.filter(function (x) { return x.recent; })
      .concat(projects.filter(function (x) { return !x.recent; }));
    var at = ordered.indexOf(p);
    var prev = ordered[at - 1];
    var next = ordered[at + 1];

    /* --- metadata --- */
    var pageTitle = p.title + ' — Akshayaa Kashyap';
    document.title = pageTitle;
    setMeta('meta[name="description"]', 'content', p.summary);
    setMeta('meta[property="og:title"]', 'content', pageTitle);
    setMeta('meta[property="og:description"]', 'content', p.summary);
    setMeta('meta[name="twitter:title"]', 'content', pageTitle);
    setMeta('meta[name="twitter:description"]', 'content', p.summary);

    /* --- pieces --- */
    // || [] for the same reason s.rows || [] has it above: a project entry
    // missing either field should render a short page, not throw and leave
    // the visitor on an empty one.
    var tech = (p.tech || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');

    var highlights = (p.highlights || []).map(function (h) {
      return '<li>' + esc(h) + '</li>';
    }).join('');

    var actions = '<a class="btn btn--primary" href="' + safeUrl(p.repo) + '" target="_blank" rel="noopener noreferrer">Source ↗</a>' +
      (p.demo ? '<a class="btn" href="' + safeUrl(p.demo) + '" target="_blank" rel="noopener noreferrer">Live demo ↗</a>' : '');

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

          liveEmbed(p) +

          '<h2>The tricky part <span class="glyph" aria-hidden="true">⌘</span></h2>' +
          '<p>' + esc(p.challenge) + '</p>' +

          renderDeepDive(p.deepDive) +
        '</div>' +
      '</div>' +

      '<nav class="detail__nav" aria-label="Project navigation">' + navPrev + navNext + '</nav>';

    initCopy(root);
    initLive(root);
  }

  window.onReady(render);
})();
