/* The article engine — renders a case study written as chapters of blocks,
   and hands each article's own widgets a small kit.

   Every case study is a file of its own, js/articles/<id>.js, loaded by
   js/project-detail.js only for the page that shows it, so the home page never
   pays for seven long reads. A file calls

     Article.register('<id>', {
       form:     'forensic',            // data-form on the article: per-form CSS
       dek:      'Standfirst…',         // the large intro under the title
       rail:     'ledger',              // optional: a widget pinned in the margin
       chapters: [{ id, label, title, blocks: [...] }, ...],
       closing:  { title?, blocks },    // "What I'd do differently"
       sources:  [[label, detail], ...],// where every number came from
       widgets:  { name: function (host, kit) { ...; return { set: fn } } }
     });

   and css/articles/<id>.css carries anything only that article draws.

   BLOCKS — one key names the kind:
     { p: 'text', notes: [[phrase, note]] }  paragraph, optional margin notes
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
     { live: true }                          the project's click-to-load demo

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

  /* Footnotes collected while an article renders; null otherwise, and a
     footnote outside an article (the dek, set before render) is dropped. */
  var FN = null;

  /* ---------- inline markup ---------- */
  function inline(text) {
    var parts = esc(text == null ? '' : String(text)).split(/`([^`]+)`/);
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
          var href = safeUrl(url.replace(/&amp;/g, '&'));
          var ext = /^https?:/.test(href);
          return '<a href="' + esc(href) + '"' +
            (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + label + '</a>';
        })
        // ^[a footnote]: a numbered superscript that shows its note on hover
        // or focus, and the same note in the list at the end.
        .replace(/\^\[([^\]]+)\]/g, function (m, note) {
          if (!FN) return '';
          FN.push(note);
          var n = FN.length;
          return '<sup class="a-fn"><a href="#fn-' + n + '" id="fnref-' + n + '" aria-describedby="fnpop-' + n + '">' + n +
            '</a><span class="a-fn__pop" id="fnpop-' + n + '" role="tooltip">' + note + '</span></sup>';
        });
    }).join('');
  }

  /* Paragraphs split on blank lines, the way they are written. */
  function paras(text) {
    return String(text || '').split(/\n\s*\n/).map(function (t) {
      return '<p>' + inline(t.trim()) + '</p>';
    }).join('');
  }

  /* A paragraph with margin notes. The phrase is fenced with two control
     characters before markup (esc() leaves them alone), so the <mark> lands
     around exactly the words quoted, wherever inline markup moves them. A
     phrase that is missing drops its note; tools/check.js fails on that. */
  function annotated(text, notes, key, side) {
    var src = String(text || '');
    var asides = '';
    (notes || []).forEach(function (n, i) {
      var at = src.indexOf(n[0]);
      if (at === -1) return;
      var id = key + '-' + i;
      src = src.slice(0, at) + '\u0001' + id + '\u0003' + n[0] + '\u0002' +
            src.slice(at + n[0].length);
      asides += '<aside class="mg__note mg__note--' + (side || (i % 2 ? 'l' : 'r')) +
        '" data-mg-for="' + id + '">' + inline(n[1]) + '</aside>';
    });
    var html = inline(src)
      .replace(/\u0001([a-z0-9_-]+)\u0003/g, '<mark class="mg__mark" id="$1">')
      .replace(/\u0002/g, '</mark>');
    return '<div class="a-p mg"><p>' + html + '</p>' + asides + '</div>';
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

    if (b.p != null) {
      return b.notes && b.notes.length
        ? annotated(b.p, b.notes, 'mg-' + ctx.ch + '-' + i, ctx.noteSide)
        : '<p class="a-p">' + inline(b.p) + '</p>';
    }
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
    if (b.live) return ctx.live || '';
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
      '<header class="a-ch__head"><div class="a-ch__words">' +
        (c.label ? '<p class="a-ch__label">' + inline(c.label) + '</p>' : '') +
        '<h2 class="a-ch__title">' + inline(c.title || '') + '</h2>' +
      '</div>' + art + '</header>' + body + '</section>';
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

  /* Footnotes as side notes: numbered, set in the right gutter level with the
     line that cites them, pushed down when two would touch. Only where that
     gutter is free — the rail owns it otherwise, and below 1180px there is no
     gutter at all, so the hover popover and the list at the end do the job.
     On touch, a number opens every note at once in a sheet. */
  function sidenotes(root, enabled) {
    var sups = root.querySelectorAll('.a-fn');
    if (!sups.length) return;

    var sheet = null;
    var touch = window.matchMedia('(hover: none)');
    root.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('.a-fn > a');
      if (!a || !touch.matches || typeof HTMLDialogElement === 'undefined') return;
      var list = root.querySelector('.a-notes ol');
      if (!list) return;
      e.preventDefault();
      if (!sheet) {
        sheet = el('dialog', { class: 'a-sheet', 'aria-label': 'Notes' });
        var close = el('button', { type: 'button', class: 'k-btn', text: 'Close',
          on: { click: function () { sheet.close(); } } });
        sheet.appendChild(el('div', { class: 'a-sheet__head' }, el('h2', { text: 'Notes' }), close));
        var ol = list.cloneNode(true);
        Array.prototype.forEach.call(ol.querySelectorAll('[id]'), function (n) {
          n.setAttribute('data-n', n.id.replace('fn-', ''));
          n.removeAttribute('id');
        });
        sheet.appendChild(ol);
        sheet.addEventListener('click', function (ev) { if (ev.target === sheet) sheet.close(); });
        document.body.appendChild(sheet);
      }
      var n = a.getAttribute('href').replace('#fn-', '');
      Array.prototype.forEach.call(sheet.querySelectorAll('li'), function (li) {
        li.classList.toggle('is-hl', li.getAttribute('data-n') === n);
      });
      sheet.showModal();
      var hl = sheet.querySelector('li.is-hl');
      if (hl) hl.scrollIntoView({ block: 'center' });
    });

    if (!enabled) return;
    var wide = window.matchMedia('(min-width: 1180px)');
    var asides = Array.prototype.map.call(sups, function (s, i) {
      var pop = s.querySelector('.a-fn__pop');
      var aside = el('aside', { class: 'a-sn', 'aria-hidden': 'true' });
      aside.innerHTML = '<b>' + (i + 1) + '</b>' + (pop ? pop.innerHTML : '');
      s.addEventListener('pointerenter', function () { aside.classList.add('is-hl'); });
      s.addEventListener('pointerleave', function () { aside.classList.remove('is-hl'); });
      root.appendChild(aside);
      return aside;
    });
    function place() {
      root.classList.toggle('has-sn', wide.matches);
      if (!wide.matches) return;
      var base = root.getBoundingClientRect().top;
      var floor = -Infinity;
      for (var i = 0; i < sups.length; i++) {
        var at = Math.max(sups[i].getBoundingClientRect().top - base - 6, floor);
        asides[i].style.top = at + 'px';
        floor = at + asides[i].offsetHeight + 14;
      }
    }
    place();
    wide.addEventListener('change', place);
    if (window.ResizeObserver) new ResizeObserver(place).observe(root);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
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

  /* Park each margin note beside the phrase it annotates. Where a phrase
     lands depends on where the line wrapped, so this is measured, and
     re-measured when the column resizes or the handwriting face arrives. */
  function alignNotes(root) {
    var notes = root.querySelectorAll('[data-mg-for]');
    if (!notes.length) return;
    var wide = window.matchMedia('(min-width: 1180px)');
    /* Two notes whose phrases sit close would print over each other, so each
       side keeps a floor down the whole article: a note starts no higher than
       the bottom of the last note on its side. Measured in page coordinates,
       because each note is positioned inside its own paragraph. */
    function place() {
      var floor = { l: -Infinity, r: -Infinity };
      for (var i = 0; i < notes.length; i++) {
        var n = notes[i];
        if (!wide.matches) { n.style.top = ''; continue; }
        var mark = document.getElementById(n.getAttribute('data-mg-for'));
        if (!mark) continue;
        var side = n.classList.contains('mg__note--l') ? 'l' : 'r';
        var boxTop = n.parentNode.getBoundingClientRect().top;
        var want = mark.getBoundingClientRect().top - 2;
        var at = Math.max(want, floor[side]);
        n.style.top = Math.max(0, at - boxTop) + 'px';
        floor[side] = at + n.offsetHeight + 12;
      }
    }
    place();
    wide.addEventListener('change', place);
    if (window.ResizeObserver) new ResizeObserver(place).observe(root);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  }

  /* Reading progress, cut into one segment per chapter so the bar is also a
     table of contents: each segment is a link to its chapter. */
  function progress(root, ctx) {
    var chs = root.querySelectorAll('.a-ch');
    if (!chs.length) return;
    var bar = el('nav', { class: 'a-progress', 'aria-label': 'Chapters' });
    var segs = Array.prototype.map.call(chs, function (c) {
      var t = c.querySelector('.a-ch__title');
      var a = el('a', { class: 'a-progress__seg', href: '#' + c.id, title: t ? t.textContent : '' },
        el('span', { class: 'a-progress__fill' }),
        el('span', { class: 'visually-hidden', text: t ? t.textContent : '' }));
      bar.appendChild(a);
      return a;
    });
    document.body.appendChild(bar);

    var ticking = false;
    function update() {
      ticking = false;
      var mid = window.innerHeight * 0.4;
      var cur = null;
      for (var i = 0; i < chs.length; i++) {
        var r = chs[i].getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (mid - r.top) / Math.max(1, r.height)));
        segs[i].style.setProperty('--p', p.toFixed(3));
        if (r.top <= mid && r.bottom > mid) cur = chs[i].getAttribute('data-ch');
        segs[i].classList.toggle('is-current', r.top <= mid && r.bottom > mid);
      }
      var art = root.getBoundingClientRect();
      bar.classList.toggle('is-shown', art.top < window.innerHeight * 0.5 && art.bottom > 0);
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

  function render(root, project, spec, opts) {
    opts = opts || {};
    // Footnotes take the right gutter as side notes unless a rail has it; in
    // either case the handwritten notes give it up and all go left.
    var hasFn = /\^\[/.test(JSON.stringify([spec.chapters, spec.closing]));
    var ctx = {
      root: root, blocks: [], n: 0, ch: '', live: opts.live || '', arts: [],
      noteSide: spec.rail || hasFn ? 'l' : null,
      themeListeners: [], chapterFns: [], current: null,
      say: el('p', { class: 'visually-hidden', 'aria-live': 'polite' })
    };

    FN = [];
    var html = (spec.chapters || []).map(function (c) { return chapter(c, ctx); }).join('');
    if (spec.closing) {
      html += chapter({ id: 'differently', label: spec.closing.label || 'Last',
        title: spec.closing.title || 'What I’d do differently',
        blocks: spec.closing.blocks }, ctx, true);
    }
    var notesList = FN;
    FN = null;

    /* A contents list under the standfirst, as a long read opens: label and
       title per chapter, each a link. */
    var toc = '';
    if (spec.toc !== false && (spec.chapters || []).length > 2) {
      toc = '<nav class="a-toc" aria-label="In this article"><p class="a-toc__k">In this piece</p><ol>' +
        (spec.chapters || []).concat(spec.closing ? [{ id: 'differently',
          label: spec.closing.label || 'Last', title: spec.closing.title || 'What I’d do differently' }] : [])
          .map(function (c) {
            return '<li><a href="#ch-' + esc(c.id) + '">' +
              (c.label ? '<span class="a-toc__l">' + inline(c.label) + '</span>' : '') +
              '<span class="a-toc__t">' + inline(c.title || '') + '</span></a></li>';
          }).join('') + '</ol></nav>';
    }

    if (notesList.length) {
      html += '<section class="a-notes" aria-labelledby="a-notes-h"><h2 id="a-notes-h">Notes</h2><ol>' +
        notesList.map(function (n, i) {
          return '<li id="fn-' + (i + 1) + '">' + n +
            ' <a class="a-notes__back" href="#fnref-' + (i + 1) + '" aria-label="Back to note ' + (i + 1) + '">↩</a></li>';
        }).join('') + '</ol></section>';
    }
    if (spec.sources && spec.sources.length) {
      html += '<section class="a-sources" aria-labelledby="a-sources-h">' +
        '<h2 id="a-sources-h">Where the numbers come from</h2><ol>' +
        spec.sources.map(function (s) {
          return '<li><strong>' + inline(s[0]) + '</strong> ' + inline(s[1] || '') + '</li>';
        }).join('') + '</ol></section>';
    }

    root.setAttribute('data-form', KEY_RE.test(spec.form || '') ? spec.form : 'plain');
    root.classList.toggle('has-rail', !!spec.rail);
    root.innerHTML =
      (spec.rail ? '<aside class="a-rail" data-widget="' + esc(spec.rail) + '" data-block="-1">' +
        '<div class="a-rail__in a-widget__stage"></div></aside>' : '') +
      toc + html;
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
    alignNotes(root);
    sidenotes(root, !spec.rail);
    progress(root, ctx);
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

  window.Article = {
    register: function (id, spec) { REG[id] = spec; },
    get: function (id) { return REG[id]; },
    render: render,
    inline: inline,
    paras: paras
  };
})();
