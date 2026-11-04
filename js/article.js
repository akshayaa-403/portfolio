/* The article engine — renders a case study written as chapters of blocks,
   and hands each article's own widgets a small kit.

   Every case study is a file of its own, js/articles/<id>.js, loaded by
   js/project-detail.js only for the page that shows it, so the home page never
   pays for seven long reads. A file calls

     Article.register('<id>', {
       form:     'forensic',            // data-form on the article: per-form CSS
       dek:      'Result first…',       // the standfirst under the title; it
                                        // replaces the project's tagline there
       demo:     { src: 'public/assets/demos/<id>.mp4',
                   poster: 'public/assets/demos/<id>.webp',
                   alt: 'What the recording shows', caption? },
                                        // optional: a muted looping recording
                                        // between the header and At a glance
       rail:     'ledger',              // optional: a widget pinned in the margin
       scramble: '01{}[]',              // optional: titles decode from these glyphs
       chapters: [{ id, title, art?, blocks: [...] }, ...],
                                        // title is the heading, printed as is
       closing:  { title?, blocks },    // "What I'd do differently"
       sources:  [[label, detail], ...],// a "Sources" list at the end: the
                                        // first five, one line each
       widgets:  { name: function (host, kit) { ...; return { set: fn } } }
     });

   and css/articles/<id>.css carries anything only that article draws.

   The page opens on the header (js/project-detail.js), then the demo, then
   At a glance, then the chapters. Removed on 2026-11-04 and no longer read:
   the opener (`opener`), margin notes (`notes` on a paragraph), footnotes
   (`^[…]` is stripped from any text, so leftovers never show), the table of
   contents (`toc`), the reading-progress bar, and chapter labels (`label`).

   BLOCKS — one key names the kind:
     { p: 'text' }                           paragraph
     { h: 'Subhead' }
     { quote: 'pull quote', cite? }
     { callout: 'text', label: 'Verdict' }   boxed aside; text may hold \n\n
     { list: ['…'], ordered? }
     { figure: 'public/assets/…', alt, caption, size? }
     { code: '…', lang, caption }
     { tex: '…', caption }                   typeset by js/tex.js
     { table: { head, rows }, caption }
     { widget: 'name', caption, size?, data? }
     { scrolly: 'name', steps: [{ p, state }], caption, data? }

   size is 'column' (the default), 'wide' or 'full'.

   INLINE MARKUP in any text, applied after esc() so the source stays inert:
     `code`   **strong**   *em*   [label](url)
     [[phrase|key]]  a linked term: hovering or focusing it tells the widgets
                     in the same chapter (kit.onKey), so prose can point at a
                     figure
     {{key}} or {{key|fallback}}  a live value a widget writes (kit.live)

   Everything interpolated is escaped. The only markup produced is the fixed
   set of tags above, with attribute values restricted to [a-z0-9_-]. */
(function () {
  'use strict';

  var REG = {};
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');
  var KEY_RE = /^[a-z0-9_-]+$/;

  /* ---------- inline markup ---------- */
  function inline(text) {
    // Footnotes are gone: strip ^[…] before anything else sees it.
    var src = text == null ? '' : String(text).replace(/ ?\^\[[^\]]*\]/g, '');
    var parts = esc(src).split(/`([^`]+)`/);
    return parts.map(function (seg, i) {
      if (i % 2) return '<code>' + seg + '</code>';
      return seg
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(\S(?:[^*]*?\S)?)\*/g, '<em>$1</em>')
        .replace(/\[\[([^\]|]+)\|([a-z0-9_-]+)\]\]/g,
          '<span class="xref" data-key="$2" tabindex="0">$1</span>')
        .replace(/\{\{([a-z0-9_-]+)(?:\|([^}]*))?\}\}/g, function (m, key, fb) {
          return '<output class="a-live" data-out="' + key + '">' + (fb || '') + '</output>';
        })
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, label, url) {
          var href = safeUrl(url.replace(/&amp;/g, '&')); // safeUrl escapes
          var ext = /^https?:/.test(href);
          return '<a href="' + href + '"' +
            (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + label + '</a>';
        });
    }).join('');
  }

  /* Paragraphs split on blank lines, the way they are written. */
  function paras(text) {
    return String(text || '').split(/\n\s*\n/).map(function (t) {
      return '<p>' + inline(t.trim()) + '</p>';
    }).join('');
  }

  /* ---------- blocks ---------- */
  function sizeClass(b) {
    return ' a-size--' + (b.size === 'wide' || b.size === 'full' ? b.size : 'column');
  }
  function cap(text) {
    return text ? '<figcaption>' + inline(text) + '</figcaption>' : '';
  }

  function block(b, ctx) {
    var i = ctx.blocks.push(b) - 1;

    if (b.p != null) return '<p class="a-p">' + inline(b.p) + '</p>';
    if (b.h != null) return '<h3 class="a-h">' + inline(b.h) + '</h3>';
    if (b.quote != null) {
      return '<blockquote class="a-quote"><p>' + inline(b.quote) + '</p>' +
        (b.cite ? '<cite>' + inline(b.cite) + '</cite>' : '') + '</blockquote>';
    }
    if (b.callout != null) {
      return '<aside class="a-callout">' +
        (b.label ? '<p class="a-callout__label">' + inline(b.label) + '</p>' : '') +
        paras(b.callout) + '</aside>';
    }
    if (b.list) {
      var tag = b.ordered ? 'ol' : 'ul';
      return '<' + tag + ' class="a-list">' + b.list.map(function (t) {
        return '<li>' + inline(t) + '</li>';
      }).join('') + '</' + tag + '>';
    }
    if (b.figure) {
      return '<figure class="a-fig a-fig--img' + sizeClass(b) + '">' +
        '<img src="' + safeUrl(b.figure) + '" alt="' + esc(b.alt || '') + '" loading="lazy" decoding="async">' +
        cap(b.caption) + '</figure>';
    }
    if (b.code != null) {
      return '<figure class="a-fig a-code' + sizeClass(b) + '">' +
        '<div class="code-head"><span class="code-lang">' + esc(b.lang || 'text') + '</span>' +
        '<button class="code-copy" type="button" aria-label="Copy code">Copy</button></div>' +
        '<pre><code>' + esc(b.code) + '</code></pre>' + cap(b.caption) + '</figure>';
    }
    if (b.tex != null) {
      // renderTex escapes every interpolated substring itself (js/tex.js);
      // it is the one value here that reaches innerHTML as markup.
      var body = typeof window.renderTex === 'function' ? window.renderTex(b.tex) : esc(b.tex);
      return '<figure class="a-fig a-tex' + sizeClass(b) + '">' +
        '<div class="formula" role="math" aria-label="' + esc(b.label || b.caption || 'Formula') + '">' +
        body + '</div>' + cap(b.caption) + '</figure>';
    }
    if (b.table) {
      var head = (b.table.head || []).map(function (h) {
        return '<th scope="col">' + inline(h) + '</th>';
      }).join('');
      var rows = (b.table.rows || []).map(function (r) {
        return '<tr>' + r.map(function (c, j) {
          return j === 0 ? '<th scope="row">' + inline(c) + '</th>' : '<td>' + inline(c) + '</td>';
        }).join('') + '</tr>';
      }).join('');
      return '<figure class="a-fig a-table' + sizeClass(b) + '"><div class="table-scroll"><table>' +
        (head ? '<thead><tr>' + head + '</tr></thead>' : '') + '<tbody>' + rows + '</tbody>' +
        '</table></div>' + cap(b.caption) + '</figure>';
    }
    if (b.widget) {
      return '<figure class="a-fig a-widget' + sizeClass(b) + '" data-widget="' + esc(b.widget) +
        '" data-block="' + i + '"><div class="a-widget__stage"></div>' + cap(b.caption) + '</figure>';
    }
    if (b.scrolly) {
      var steps = (b.steps || []).map(function (s, j) {
        return '<div class="a-step" data-step="' + j + '">' + paras(s.p) + '</div>';
      }).join('');
      return '<section class="a-scrolly" data-widget="' + esc(b.scrolly) + '" data-block="' + i + '">' +
        '<div class="a-scrolly__stage"><figure class="a-fig a-widget">' +
          '<div class="a-widget__stage"></div>' + cap(b.caption) + '</figure></div>' +
        '<div class="a-scrolly__steps">' + steps + '</div></section>';
    }
    return '';
  }

  function chapter(c, ctx, closing) {
    ctx.ch = KEY_RE.test(c.id || '') ? c.id : 'ch' + ctx.n;
    ctx.n++;
    var body = (c.blocks || []).map(function (b) { return block(b, ctx); }).join('');
    // `art(c)` returns SVG markup for a 160×120 box, drawn after render in
    // the day's colours (see drawArt).
    var art = '';
    if (typeof c.art === 'function') {
      art = '<div class="a-ch__art" aria-hidden="true" data-art="' + (ctx.arts.push(c.art) - 1) + '"></div>';
    }
    return '<section class="a-ch' + (closing ? ' a-ch--closing' : '') + '" id="ch-' + ctx.ch +
        '" data-ch="' + ctx.ch + '">' +
      '<header class="a-ch__head">' +
        '<h2 class="a-ch__title">' + inline(c.title || '') + '</h2>' +
      art + '</header>' + body + '</section>';
  }

  function drawArt(root, ctx) {
    var hosts = root.querySelectorAll('[data-art]');
    if (!hosts.length) return;
    function draw() {
      var cs = getComputedStyle(document.documentElement);
      var c = {
        i: cs.getPropertyValue('--ink').trim(), a: cs.getPropertyValue('--accent').trim(),
        l: cs.getPropertyValue('--line-strong').trim(), m: cs.getPropertyValue('--accent-mid').trim(),
        p: cs.getPropertyValue('--accent-pale').trim()
      };
      for (var i = 0; i < hosts.length; i++) {
        var fn = ctx.arts[Number(hosts[i].getAttribute('data-art'))];
        try {
          hosts[i].innerHTML = '<svg viewBox="0 0 160 120" width="160" height="120">' + fn(c) + '</svg>';
        } catch (e) { hosts[i].textContent = ''; }
      }
    }
    draw();
    ctx.themeListeners.push(draw);
  }

  /* ---------- the kit ----------
     One per widget instance. Small on purpose: what differs between the
     articles is what they draw, not the plumbing under it. */
  var TOKENS = ['bg', 'bg-raised', 'bg-sunken', 'surface', 'ink', 'ink-body', 'ink-soft',
    'ink-muted', 'line', 'line-strong', 'accent', 'accent-ink', 'accent-deep', 'accent-mid',
    'accent-pale', 'accent-tint', 'accent-tint-strong', 'on-accent-deep'];

  function camel(s) { return s.replace(/-([a-z])/g, function (m, c) { return c.toUpperCase(); }); }

  function colors() {
    var cs = getComputedStyle(document.documentElement), out = {};
    TOKENS.forEach(function (t) { out[camel(t)] = cs.getPropertyValue('--' + t).trim(); });
    var pal = window.portfolioPalette;
    // Three series colours from the day's Wada trio, each stepped to 3:1
    // against the ground, then their paler shades for a fourth to sixth.
    out.series = [0, 1, 2, 0, 1, 2].map(function (k, n) {
      return pal ? pal.shade(k, 3, n < 3 ? 0 : 0.55) : out.accent;
    });
    return out;
  }

  function el(tag, attrs) {
    var n = document.createElement(tag);
    applyAttrs(n, attrs);
    for (var i = 2; i < arguments.length; i++) append(n, arguments[i]);
    return n;
  }
  function svg(tag, attrs) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    applyAttrs(n, attrs);
    for (var i = 2; i < arguments.length; i++) append(n, arguments[i]);
    return n;
  }
  function applyAttrs(n, attrs) {
    if (!attrs) return;
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'text') n.textContent = v;
      else if (k === 'on') Object.keys(v).forEach(function (e) { n.addEventListener(e, v[e]); });
      else if (k === 'style' && typeof v === 'object') {
        Object.keys(v).forEach(function (p) {
          if (p.indexOf('--') === 0) n.style.setProperty(p, v[p]); else n.style[p] = v[p];
        });
      } else if (k === 'class' && n instanceof SVGElement) n.setAttribute('class', v);
      else if (k === 'class') n.className = v;
      else n.setAttribute(k, v === true ? '' : v);
    });
  }
  function append(n, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(n, x); }); return; }
    n.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
  }

  var uid = 0;

  function makeKit(host, ctx, blockData, chapterEl) {
    var visibleFns = [], keyFns = [], isVisible = false;

    var kit = {
      data: blockData || {},
      el: el,
      svg: svg,
      colors: colors,
      get reduced() { return REDUCE.matches; },
      id: function (p) { return 'aw' + (++uid) + (p ? '-' + p : ''); },

      fmt: function (n, d) {
        if (n == null || isNaN(n)) return '—';
        return Number(n).toLocaleString('en-US', {
          minimumFractionDigits: d == null ? 0 : d, maximumFractionDigits: d == null ? 0 : d
        }).replace(/^-/, '−');
      },
      clamp: function (v, a, b) { return Math.max(a, Math.min(b, v)); },
      lerp: function (a, b, t) { return a + (b - a) * t; },

      /* A seeded generator (mulberry32), so a "random" figure is the same
         figure on every visit and in every screenshot. */
      rng: function (seed) {
        var s = seed >>> 0;
        return function () {
          s = (s + 0x6D2B79F5) >>> 0;
          var t = s;
          t = Math.imul(t ^ (t >>> 15), t | 1);
          t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      },

      /* ---- controls. Real inputs, so keyboard and screen readers work
         without each widget re-solving it. ---- */
      slider: function (o) {
        var id = kit.id('s');
        var input = el('input', { type: 'range', id: id, min: o.min, max: o.max,
          step: o.step == null ? 'any' : o.step, value: o.value });
        var out = el('output', { 'for': id, class: 'k-slider__out' });
        function show() {
          var v = Number(input.value);
          var txt = o.format ? o.format(v) : String(v);
          out.textContent = txt;
          input.setAttribute('aria-valuetext', txt);
          return v;
        }
        input.addEventListener('input', function () { var v = show(); if (o.onInput) o.onInput(v); });
        show();
        var wrap = el('div', { class: 'k-slider' + (o.className ? ' ' + o.className : '') },
          el('label', { 'for': id, class: 'k-slider__label', text: o.label }), input, out);
        return {
          el: wrap, input: input,
          value: function () { return Number(input.value); },
          set: function (v, silent) { input.value = v; var x = show(); if (!silent && o.onInput) o.onInput(x); }
        };
      },

      /* A segmented choice. Buttons with aria-pressed inside a labelled
         group: one is always on. */
      choice: function (o) {
        var value = o.value;
        var group = el('div', { class: 'k-choice', role: 'group', 'aria-label': o.label });
        if (o.label && o.showLabel !== false) group.appendChild(el('span', { class: 'k-choice__label', text: o.label }));
        var btns = o.options.map(function (opt) {
          var b = el('button', { type: 'button', class: 'k-choice__btn', text: opt.label,
            'aria-pressed': String(opt.value === value),
            on: { click: function () { set(opt.value); } } });
          b._v = opt.value;
          group.appendChild(b);
          return b;
        });
        function set(v, silent) {
          value = v;
          btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b._v === v)); });
          if (!silent && o.onChange) o.onChange(v);
        }
        return { el: group, set: set, value: function () { return value; } };
      },

      button: function (label, onClick, cls) {
        return el('button', { type: 'button', class: 'k-btn' + (cls ? ' ' + cls : ''),
          text: label, on: { click: onClick } });
      },

      /* A label and a number that changes. */
      readout: function (label, value, cls) {
        var v = el('span', { class: 'k-readout__v', text: value == null ? '' : value });
        return {
          el: el('div', { class: 'k-readout' + (cls ? ' ' + cls : '') },
            el('span', { class: 'k-readout__k', text: label }), v),
          set: function (t) { v.textContent = t; }
        };
      },

      /* ---- drawing surfaces ---- */

      /* A canvas that tracks its box and the device pixel ratio. `draw` is
         called with (ctx, w, h) on every resize and every theme change; call
         c.draw() whenever the widget's state changes. */
      canvas: function (parent, o) {
        o = o || {};
        var cv = el('canvas', { class: 'k-canvas', 'aria-hidden': 'true' });
        if (o.height) cv.style.height = o.height + 'px';
        if (o.aspect) cv.style.aspectRatio = String(o.aspect);
        parent.appendChild(cv);
        var c = { el: cv, ctx: cv.getContext('2d'), w: 0, h: 0, draw: function () {
          if (!c.w) size();
          if (o.draw && c.w) { c.ctx.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); c.ctx.clearRect(0, 0, c.w, c.h); o.draw(c.ctx, c.w, c.h); }
        } };
        function size() {
          var r = cv.getBoundingClientRect();
          c.dpr = Math.min(2, window.devicePixelRatio || 1);
          c.w = r.width; c.h = r.height;
          cv.width = Math.round(r.width * c.dpr); cv.height = Math.round(r.height * c.dpr);
        }
        if (window.ResizeObserver) new ResizeObserver(function () { size(); c.draw(); }).observe(cv);
        kit.onTheme(function () { c.draw(); });
        return c;
      },

      /* Pointer drag with capture. Returns positions relative to `el`'s box.
         Only the element passed in stops page scroll (touch-action), so a
         thumb landing elsewhere on the figure still scrolls the article. */
      drag: function (target, h) {
        target.style.touchAction = h.axis === 'x' ? 'pan-y' : h.axis === 'y' ? 'pan-x' : 'none';
        target.addEventListener('pointerdown', function (e) {
          if (e.button) return;
          var r = target.getBoundingClientRect();
          target.setPointerCapture(e.pointerId);
          var pos = function (ev) { return { x: ev.clientX - r.left, y: ev.clientY - r.top, w: r.width, h: r.height }; };
          if (h.start) h.start(pos(e), e);
          function move(ev) { r = target.getBoundingClientRect(); if (h.move) h.move(pos(ev), ev); }
          function up(ev) {
            target.removeEventListener('pointermove', move);
            target.removeEventListener('pointerup', up);
            target.removeEventListener('pointercancel', up);
            if (h.end) h.end(pos(ev), ev);
          }
          target.addEventListener('pointermove', move);
          target.addEventListener('pointerup', up);
          target.addEventListener('pointercancel', up);
        });
      },

      /* FLIP: measure, mutate, then animate each child from where it was. */
      flip: function (container, mutate) {
        var kids = Array.prototype.slice.call(container.children);
        var before = kids.map(function (k) { return k.getBoundingClientRect(); });
        mutate();
        if (REDUCE.matches) return;
        kids.forEach(function (k, i) {
          var a = before[i], b = k.getBoundingClientRect();
          var dx = a.left - b.left, dy = a.top - b.top;
          if (!dx && !dy) return;
          k.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }],
            { duration: 420, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' });
        });
      },

      /* ---- the page around the widget ---- */

      /* Write a value into every {{key}} in the article's prose. */
      live: function (key, text) {
        var outs = ctx.root.querySelectorAll('[data-out="' + key + '"]');
        for (var i = 0; i < outs.length; i++) outs[i].textContent = text;
      },

      /* Polite, throttled: a slider dragged end to end says one thing, not
         forty. */
      announce: function (text) {
        clearTimeout(ctx.sayT);
        ctx.sayT = setTimeout(function () { ctx.say.textContent = text; }, 450);
      },

      /* Re-run fn whenever the palette is re-measured: a theme flip, a new
         time of day. Not called on registration — draw once yourself. */
      onTheme: function (fn) { ctx.themeListeners.push(fn); },

      /* Called with true/false as the widget enters and leaves the screen. */
      onVisible: function (fn) { visibleFns.push(fn); if (isVisible) fn(true); },
      get visible() { return isVisible; },

      /* A rAF loop that only runs while the widget is on screen and motion
         is allowed. fn(dt seconds, t seconds). */
      loop: function (fn) {
        var raf = 0, last = 0, t0 = 0, want = false;
        function tick(now) {
          if (!last) { last = now; t0 = now; }
          var dt = Math.min(0.05, (now - last) / 1000);
          last = now;
          if (fn(dt, (now - t0) / 1000) === false) { stop(); return; }
          raf = requestAnimationFrame(tick);
        }
        function run() { if (!raf && want && isVisible && !REDUCE.matches) { last = 0; raf = requestAnimationFrame(tick); } }
        function stop() { want = false; cancelAnimationFrame(raf); raf = 0; }
        kit.onVisible(function (v) { if (v) run(); else { cancelAnimationFrame(raf); raf = 0; } });
        return { start: function () { want = true; run(); }, stop: stop,
                 get running() { return !!raf; } };
      },

      /* Prose → figure: [[phrase|key]] in the same chapter. */
      onKey: function (fn) { keyFns.push(fn); },

      /* For a rail: which chapter is being read. */
      onChapter: function (fn) { ctx.chapterFns.push(fn); if (ctx.current) fn(ctx.current); }
    };

    if (chapterEl) {
      chapterEl.addEventListener('xref', function (e) {
        keyFns.forEach(function (f) { f(e.detail); });
      });
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          isVisible = e.isIntersecting;
          visibleFns.forEach(function (f) { f(isVisible); });
        });
      }, { rootMargin: '120px 0px' }).observe(host);
    } else {
      isVisible = true;
    }
    return kit;
  }

  /* ---------- mounting ---------- */

  function mountWidgets(root, spec, ctx) {
    var widgets = spec.widgets || {};
    var nodes = root.querySelectorAll('[data-widget]');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var fn = widgets[node.getAttribute('data-widget')];
      var stage = node.querySelector('.a-widget__stage');
      if (!fn || !stage) continue;
      var b = ctx.blocks[Number(node.getAttribute('data-block'))] || {};
      var kit = makeKit(stage, ctx, b.data, node.closest('.a-ch'));
      var api;
      try { api = fn(stage, kit) || {}; } catch (err) {
        // One broken widget must not take the article down with it.
        stage.textContent = '';
        if (window.console) console.error('widget ' + node.getAttribute('data-widget'), err);
        continue;
      }
      if (node.classList.contains('a-scrolly')) wireScrolly(node, b, api);
    }
  }

  /* Each step's state reaches the sticky figure when the step crosses the
     middle of the screen. Under reduced motion it still switches state — the
     widget is told, and decides not to tween. */
  function wireScrolly(section, b, api) {
    if (typeof api.set !== 'function') return;
    var steps = section.querySelectorAll('.a-step');
    var current = -1;
    function go(n) {
      if (n === current) return;
      current = n;
      for (var i = 0; i < steps.length; i++) steps[i].classList.toggle('is-active', i === n);
      try { api.set((b.steps[n] || {}).state || {}, n); } catch (e) {}
    }
    go(0);
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) go(Number(e.target.getAttribute('data-step')));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    for (var i = 0; i < steps.length; i++) io.observe(steps[i]);

    /* Optional and continuous: `progress(t, i)` hears how far through the
       active step the middle of the screen is, 0..1, for a figure that
       scrubs rather than snaps. Only while the section is on screen. */
    if (typeof api.progress !== 'function') return;
    var ticking = false, onScreen = false;
    new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; }).observe(section);
    window.addEventListener('scroll', function () {
      if (ticking || !onScreen || current < 0) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var r = steps[current].getBoundingClientRect();
        var t = Math.max(0, Math.min(1, (window.innerHeight * 0.5 - r.top) / Math.max(1, r.height)));
        try { api.progress(t, current); } catch (e) {}
      });
    }, { passive: true });
  }

  /* Prose → figure. One delegated pair of listeners per article; the event
     is re-dispatched on the chapter so only its own widgets hear it. */
  function wireXrefs(root) {
    function fire(t, on) {
      var x = t.closest && t.closest('.xref');
      if (!x) return;
      var ch = x.closest('.a-ch');
      var key = on ? x.getAttribute('data-key') : null;
      var all = root.querySelectorAll('.xref.is-on');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('is-on');
      if (on) x.classList.add('is-on');
      if (ch) ch.dispatchEvent(new CustomEvent('xref', { detail: key }));
    }
    root.addEventListener('pointerover', function (e) { fire(e.target, true); });
    root.addEventListener('pointerout', function (e) { fire(e.target, false); });
    root.addEventListener('focusin', function (e) { fire(e.target, true); });
    root.addEventListener('focusout', function (e) { fire(e.target, false); });
  }

  /* Which chapter is being read, for the rail (kit.onChapter) and for
     showing the pinned rail only while the article is on screen. */
  function track(root, ctx) {
    var chs = root.querySelectorAll('.a-ch');
    if (!chs.length) return;
    var ticking = false;
    function update() {
      ticking = false;
      var mid = window.innerHeight * 0.4;
      var cur = null;
      for (var i = 0; i < chs.length; i++) {
        var r = chs[i].getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) cur = chs[i].getAttribute('data-ch');
      }
      var art = root.getBoundingClientRect();
      // The pinned rail shows only while the article is what is being read.
      root.classList.toggle('rail-on', art.top < window.innerHeight * 0.45 &&
                                        art.bottom > window.innerHeight * 0.6);
      if (cur && cur !== ctx.current) {
        ctx.current = cur;
        ctx.chapterFns.forEach(function (f) { try { f(cur); } catch (e) {} });
      }
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- render ---------- */

  function render(root, project, spec) {
    var ctx = {
      root: root, blocks: [], n: 0, ch: '', arts: [],
      themeListeners: [], chapterFns: [], current: null,
      say: el('p', { class: 'visually-hidden', 'aria-live': 'polite' })
    };

    var html = (spec.chapters || []).map(function (c) { return chapter(c, ctx); }).join('');
    if (spec.closing) {
      html += chapter({ id: 'differently', title: spec.closing.title || 'What I’d do differently',
        blocks: spec.closing.blocks }, ctx, true);
    }
    var src = (spec.sources || []).slice(0, 5).map(function (s) {
      return '<li><b>' + inline(s[0]) + '</b>' + (s[1] ? ' — ' + inline(s[1]) : '') + '</li>';
    }).join('');
    if (src) {
      html += '<section class="a-sources" aria-labelledby="a-sources-h">' +
        '<h2 class="a-sources__h" id="a-sources-h">Sources</h2><ul>' + src + '</ul></section>';
    }

    root.setAttribute('data-form', KEY_RE.test(spec.form || '') ? spec.form : 'plain');
    root.classList.toggle('has-rail', !!spec.rail);
    root.innerHTML =
      (spec.rail ? '<aside class="a-rail" data-widget="' + esc(spec.rail) + '" data-block="-1">' +
        '<div class="a-rail__in a-widget__stage"></div></aside>' : '') +
      html;
    root.appendChild(ctx.say);

    // Wired before any widget exists: portfolioPalette.on fires once on
    // subscription, and that first call must find nobody listening.
    if (window.portfolioPalette) {
      window.portfolioPalette.on(function () {
        ctx.themeListeners.forEach(function (f) { try { f(); } catch (e) {} });
      });
    }

    wireXrefs(root);
    drawArt(root, ctx);
    mountWidgets(root, spec, ctx);
    track(root, ctx);
    if (spec.scramble) {
      var titles = Array.prototype.slice.call(root.querySelectorAll('.a-ch__title'));
      var h1 = document.querySelector('.detail__title');
      scramble(h1 ? [h1].concat(titles) : titles, String(spec.scramble));
    }
    return ctx;
  }

  /* Chapter titles that decode into place as they arrive, the way altermag's
     headings do: each letter is a random glyph from the article's own
     alphabet (`scramble: '01{}[]…'`) until its turn comes. Text nodes only,
     so inline code survives; the height is held so the column does not jump
     while the glyphs change width. Skipped entirely under reduced motion. */
  function scramble(titles, chars) {
    if (REDUCE.matches || !('IntersectionObserver' in window) || !chars) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        run(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    for (var i = 0; i < titles.length; i++) io.observe(titles[i]);

    function run(t) {
      var nodes = [];
      var walk = document.createTreeWalker(t, NodeFilter.SHOW_TEXT);
      while (walk.nextNode()) nodes.push({ n: walk.currentNode, s: walk.currentNode.nodeValue });
      var total = nodes.reduce(function (a, x) { return a + x.s.length; }, 0) || 1;
      t.setAttribute('aria-label', t.textContent);
      t.style.height = t.offsetHeight + 'px';
      t.style.overflow = 'hidden';
      var start = performance.now(), dur = 700 + Math.min(900, total * 18);
      function frame(now) {
        var p = Math.min(1, (now - start) / dur), seen = 0;
        nodes.forEach(function (x) {
          var out = '';
          for (var k = 0; k < x.s.length; k++, seen++) {
            var c = x.s.charAt(k);
            out += (c === ' ' || seen / total < p * 1.15 - 0.15) ? c
              : chars.charAt(Math.floor(Math.random() * chars.length));
          }
          x.n.nodeValue = out;
        });
        if (p < 1) { requestAnimationFrame(frame); return; }
        nodes.forEach(function (x) { x.n.nodeValue = x.s; });
        t.removeAttribute('aria-label');
        t.style.height = '';
        t.style.overflow = '';
      }
      requestAnimationFrame(frame);
    }
  }

  /* The demo: a muted, looping recording that plays only while on screen,
     with a Pause button. Under reduced motion it waits on its poster with
     the native controls. A recording that fails to load removes itself. */
  function demo(host, d) {
    if (!host || !d || !d.src) return;
    var still = REDUCE.matches;
    host.innerHTML = '<figure class="a-demo">' +
      '<video src="' + safeUrl(d.src) + '"' + (d.poster ? ' poster="' + safeUrl(d.poster) + '"' : '') +
        ' muted loop playsinline preload="' + (still ? 'metadata" controls' : 'none"') +
        ' aria-label="' + esc(d.alt || 'Demo recording') + '"></video>' +
      (still ? '' : '<button type="button" class="a-demo__btn">Pause</button>') +
      cap(d.caption) + '</figure>';
    host.hidden = false;
    var v = host.querySelector('video');
    v.addEventListener('error', function () { host.hidden = true; host.innerHTML = ''; });
    if (still) return;
    var btn = host.querySelector('.a-demo__btn'), held = false, seen = false;
    function sync() {
      if (seen && !held) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
      btn.textContent = held ? 'Play' : 'Pause';
    }
    btn.addEventListener('click', function () { held = !held; sync(); });
    if (!('IntersectionObserver' in window)) { seen = true; sync(); return; }
    new IntersectionObserver(function (es) { seen = es[0].isIntersecting; sync(); },
      { threshold: 0.25 }).observe(v);
  }

  window.Article = {
    register: function (id, spec) { REG[id] = spec; },
    get: function (id) { return REG[id]; },
    render: render,
    demo: demo,
    inline: inline,
    paras: paras
  };
})();
