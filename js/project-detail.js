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

  /* ---------- marginalia ----------
     Overview and The tricky part are printed as one centred column with a
     second, handwritten voice in the margin. Each entry in a project's
     `notes` array is a [phrase, note] pair: the phrase is marked in the
     prose, the note is parked beside it, sides alternating.

     Everything is escaped before it is spliced, and the search runs over the
     already-escaped text so a phrase containing & or a quote still matches
     what is actually in the document. A phrase that no longer appears — the
     copy was edited and the note left behind — drops its note silently
     rather than rendering an aside pointing at nothing. tools/check.js
     fails on that case, so it is caught before it ships. */
  function marginalia(heading, glyph, text, notes, key) {
    var body = esc(text || '');
    var asides = '';

    for (var i = 0; i < (notes || []).length; i++) {
      var phrase = esc(notes[i][0]);
      var at = body.indexOf(phrase);
      if (at === -1) continue;

      var id = 'mg-' + key + '-' + i;
      body = body.slice(0, at) +
             '<mark class="mg__mark" id="' + id + '">' + phrase + '</mark>' +
             body.slice(at + phrase.length);

      asides += '<aside class="mg__note mg__note--' + (i % 2 ? 'l' : 'r') + '" ' +
                'data-mg-for="' + id + '">' + esc(notes[i][1]) + '</aside>';
    }

    return '<section class="mg">' +
      '<div class="mg__col">' +
        '<h2>' + esc(heading) + ' <span class="glyph" aria-hidden="true">' + glyph + '</span></h2>' +
        '<p class="mg__para">' + body + '</p>' +
      '</div>' +
      asides +
    '</section>';
  }

  /* Park each note at the vertical position of the phrase it annotates. This
     cannot be CSS: where a phrase lands depends on where the line wrapped,
     which only the browser knows, and it moves when the column resizes or
     when Caveat finishes loading and the notes reflow.

     Below the gutter breakpoint the notes are static, so any inline top left
     over from a wider layout has to be cleared or they sit in the wrong
     place. */
  function alignNotes(root) {
    var notes = root.querySelectorAll('[data-mg-for]');
    if (!notes.length) return;

    var wide = window.matchMedia('(min-width: 1060px)');

    function place() {
      for (var i = 0; i < notes.length; i++) {
        if (!wide.matches) { notes[i].style.top = ''; continue; }
        var mark = document.getElementById(notes[i].getAttribute('data-mg-for'));
        // .mg is the only positioned ancestor, so offsetTop is already
        // measured from the section both elements share.
        if (mark) notes[i].style.top = Math.max(0, mark.offsetTop - 2) + 'px';
      }
    }

    place();
    wide.addEventListener('change', place);
    if (window.ResizeObserver) {
      new ResizeObserver(place).observe(root);
    } else {
      window.addEventListener('resize', place);
    }
    // Caveat arrives after first paint and changes every note's height.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
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

    /* Both links carry the same weight — neither the repo nor the running
       demo is the "primary" thing to do with a case study, and styling one as
       the loud one was an arbitrary call. */
    var actions = '<a class="btn btn--quiet" href="' + safeUrl(p.repo) + '" target="_blank" rel="noopener noreferrer">Source ↗</a>' +
      (p.demo ? '<a class="btn btn--quiet" href="' + safeUrl(p.demo) + '" target="_blank" rel="noopener noreferrer">Live demo ↗</a>' : '');

    var navPrev = prev
      ? '<a href="project.html?id=' + encodeURIComponent(prev.id) + '">← ' + esc(prev.title) + '</a>'
      : '<span>← start of list</span>';
    var navNext = next
      ? '<a href="project.html?id=' + encodeURIComponent(next.id) + '">' + esc(next.title) + ' →</a>'
      : '<span>end of list →</span>';

    var notes = p.notes || {};

    root.innerHTML =
      '<a class="detail__back" href="index.html#work">← All work</a>' +

      '<header class="detail__head">' +
        // Title on the left, the two links stacked on the right, sharing the
        // heading's first line.
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
        marginalia('Overview', '▶', p.overview, notes.overview, 'overview') +

        '<h2>What it does <span class="glyph" aria-hidden="true">⁕</span></h2>' +
        '<ul class="detail__list">' + highlights + '</ul>' +

        liveEmbed(p) +

        marginalia('The tricky part', '⌘', p.challenge, notes.challenge, 'challenge') +

        renderDeepDive(p.deepDive) +
      '</div>' +

      '<nav class="detail__nav" aria-label="Project navigation">' + navPrev + navNext + '</nav>';

    initCopy(root);
    initLive(root);
    alignNotes(root);
  }

  window.onReady(render);
})();
