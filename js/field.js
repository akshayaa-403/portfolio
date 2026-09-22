/* The graph — graph mode's hero.

   Two maps, one either side of the name: Projects on the left, Hobbies on the
   right. Each is a force-directed graph of real destinations, drawn the way
   Obsidian draws a vault — nodes, edges, hover a node and its neighbourhood
   lights while the rest dims, click it and you go there.

   Two categories, and only two. A project's tools belong to Projects; a
   gallery's images belong to Hobbies; nothing else is on the stage. Colour
   says which map you are looking at, and the left/right split says it again,
   so the graph still reads in greyscale or with colour-blind vision.

   Everything comes from js/project-data.js and js/hobby-data.js at run time,
   so the graph cannot claim more than the site holds. Nothing here is a
   decorative particle: every dot is a case study, a gallery, a photograph, or
   a tool something was actually built with.

   Canvas, and no library — a d3-force import would be ~80KB from a CDN for a
   spring, a repulsion and a damping term, on a site that is deliberately
   buildless and offline-safe.

   Decorative by contract: the canvas is aria-hidden and takes no keyboard
   focus, because every destination in it is also a real, focusable link
   further down the same page. The graph is a second way there, never the
   only one. */
(function () {
  'use strict';

  /* ---------- the palette ----------

     The three colours are no longer chosen here. js/palette.js picks one
     Sanzo Wada combination per session, derives the site's whole accent
     family from it, and writes --graph-projects / --graph-hobbies /
     --graph-resources onto <html>. This file reads those three and ramps
     each one by node size; the legend's swatches read the same tokens, so
     the dots and the swatches cannot disagree.

     See js/palette.js for why every colour is stepped by measured contrast
     rather than by HSL lightness. */

  /* ---------- categories ---------- */

  /* `side` is which half of the stage the category's map occupies; `token` is
     the CSS custom property its dots are drawn in, which field.js sets from
     the drawn palette so the legend's swatches follow the dots. */
  var CATS = {
    projects:  { name: 'Projects',  token: '--graph-projects',  side: 'L' },
    hobbies:   { name: 'Hobbies',   token: '--graph-hobbies',   side: 'R' },
    resources: { name: 'Resources', token: '--graph-resources', side: 'C' }
  };
  var CAT_ORDER = ['projects', 'hobbies', 'resources'];

  /* Within a category, what a node is decides how big it draws, whether it
     carries a label at rest, and whether clicking it goes anywhere. Each
     category has exactly one hub, and everything in that category hangs off
     it — so the three names are always the three largest things on screen. */
  var KIND_CAT = {
    project: 'projects', tech: 'projects',
    gallery: 'hobbies',  photo: 'hobbies',
    resource: 'resources'
  };
  var KIND = {
    hub:      { r: 10.0, label: true,  nav: true,  dim: 1.00 },
    project:  { r: 6.5,  label: true,  nav: true,  dim: 1.00 },
    tech:     { r: 3.0,  label: false, nav: false, dim: 0.55 },
    gallery:  { r: 6.5,  label: true,  nav: true,  dim: 1.00 },
    photo:    { r: 2.4,  label: false, nav: true,  dim: 0.55 },
    resource: { r: 5.5,  label: true,  nav: true,  dim: 1.00 }
  };

  /* Where each category's map is drawn. Projects left, Hobbies right, and
     Resources in the band under the name — it is five nodes, so it needs a
     strip rather than a half. Nothing is allowed into the name's own band. */
  var RECT = {
    L: { x0: 0.020, x1: 0.300, y0: 0.100, y1: 0.860 },
    R: { x0: 0.700, x1: 0.980, y0: 0.100, y1: 0.860 },
    C: { x0: 0.305, x1: 0.695, y0: 0.790, y1: 0.945 }
  };

  /* "JavaScript (ES6)" and "JavaScript (ES modules)" are one tool wearing two
     labels; as separate nodes they split a cluster that should be one. */
  function normTech(t) {
    return String(t).replace(/\s*\([^)]*\)\s*$/, '').trim();
  }

  function build() {
    var nodes = [], links = [], byId = {};

    function add(n) {
      if (byId[n.id]) return byId[n.id];
      n.deg = 0;
      n.cat = n.cat || KIND_CAT[n.kind];
      n.side = CATS[n.cat].side;
      byId[n.id] = n;
      nodes.push(n);
      return n;
    }
    function link(a, b) {
      if (!a || !b || a === b) return;
      links.push({ a: a, b: b });
      a.deg++; b.deg++;
    }

    /* One hub per category, and everything in the category hangs off it. The
       hub is the category made clickable: it is the largest node in its map
       and it goes to the section of the page that holds the same things. */
    var hubs = {
      projects:  add({ id: 'hub:projects',  label: 'Projects',  href: '#work',    kind: 'hub', cat: 'projects' }),
      hobbies:   add({ id: 'hub:hobbies',   label: 'Hobbies',   href: '#hobbies', kind: 'hub', cat: 'hobbies' }),
      resources: add({ id: 'hub:resources', label: 'Resources', href: '#contact', kind: 'hub', cat: 'resources' })
    };

    /* Left: the case studies, bridged by the tools they share. Archived ones
       are left out — their pages are still live and still linked from the
       "Also built" line, but the graph is a map of what this page shows, and
       a map that includes what the page deliberately demoted is not one. */
    if (typeof projects !== 'undefined') {
      var shown = projects.filter(function (x) { return !x.archived; });
      for (var i = 0; i < shown.length; i++) {
        var p = shown[i];
        var pn = add({
          id: 'project:' + p.id,
          label: p.title,
          href: 'work/' + encodeURIComponent(p.id) + '.html',
          kind: 'project'
        });
        link(pn, hubs.projects);

        var tech = p.tech || [];
        for (var t = 0; t < tech.length; t++) {
          var name = normTech(tech[t]);
          if (!name) continue;
          link(pn, add({ id: 'tech:' + name.toLowerCase(), label: name, kind: 'tech' }));
        }
      }
    }

    // Right: the three galleries and every image in them.
    if (typeof hobbies !== 'undefined') {
      for (var key in hobbies) {
        if (!Object.prototype.hasOwnProperty.call(hobbies, key)) continue;
        var h = hobbies[key];
        var gn = add({
          id: 'gallery:' + key,
          label: h.label,
          href: 'hobby.html?id=' + encodeURIComponent(key),
          kind: 'gallery'
        });
        link(gn, hubs.hobbies);

        var caps = h.captions || [];
        for (var c = 0; c < caps.length; c++) {
          /* Straight to that image's popover on its gallery page — `i` is
             one-based and js/hobby-page.js opens the dialog on load. Not a
             link to the bare .webp: that is a picture with no caption, no
             neighbours and no way back into the site. */
          link(gn, add({
            id: 'photo:' + key + ':' + c,
            label: caps[c],
            href: 'hobby.html?id=' + encodeURIComponent(key) + '&i=' + (c + 1),
            kind: 'photo'
          }));
        }
      }
    }

    /* Centre: where the work and the person actually live. Three real
       destinations, all off-site except the PDF. The Substack node is gone
       with the Substack links: the publication has no posts, and a node
       promising writing that leads to an empty page is worse than no node. */
    [
      ['github',   'GitHub',   'https://github.com/akshayaa-403'],
      ['linkedin', 'LinkedIn', 'https://linkedin.com/in/akshayaa-kashyap'],
      ['resume',   'Résumé',   'public/assets/resume.pdf']
    ].forEach(function (r) {
      link(add({ id: 'res:' + r[0], label: r[1], href: r[2], kind: 'resource' }), hubs.resources);
    });

    return { nodes: nodes, links: links };
  }

  /* ---------- geometry ----------
     Everything works in a unit box (0..1 on both axes) and is scaled to
     pixels only at draw time, so a resize never re-runs the simulation. */

  var seed = 20260914;
  function rnd() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }

  /* Canvas resolves a font shorthand itself — it cannot see the CSS custom
     property, so the stack is repeated here. Keep it in step with --font-mono
     in css/style.css. */
  var MONO = '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

  function init() {
    var canvas = document.querySelector('[data-field]');
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var readout = document.querySelector('[data-field-read]');
    var host = canvas.closest('.field') || canvas.parentNode;
    var stage = canvas.closest('.stage') || host;
    var root = document.documentElement;

    var g = build();
    var nodes = g.nodes, links = g.links;
    if (nodes.length < 2) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Seed each node inside its own half, so the two maps never start
    // entangled and the simulation only has to tidy, not separate.
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var r = RECT[n.side];
      n.x = r.x0 + rnd() * (r.x1 - r.x0);
      n.y = r.y0 + rnd() * (r.y1 - r.y0);
      n.vx = 0; n.vy = 0;
      // Degree is the whole reason a gallery of 27 looks like a hub.
      n.rad = KIND[n.kind].r + Math.min(n.deg, 30) * 0.22;
    }

    var adj = {};
    for (i = 0; i < links.length; i++) {
      (adj[links[i].a.id] || (adj[links[i].a.id] = [])).push(links[i].b);
      (adj[links[i].b.id] || (adj[links[i].b.id] = [])).push(links[i].a);
    }

    /* ---------- the simulation ----------
       A map is only ~40 or ~50 nodes, and links never cross sides, so these
       are two independent simulations sharing one loop. Repulsion is
       all-pairs within a side: about 1,200 pair tests a tick, cheaper than
       the quadtree that would replace it.

       The unit box is square and the stage is not: one unit of x is 1440px
       and one unit of y is 900px, so x distances are scaled by that ratio
       before they are measured. Scaling by the rectangle's width instead —
       which is what this said first — under-counts x, and every node shoves
       sideways until it piles up against the wall in a vertical line. */
    var ASPECT = 1.6;          // stage width / stage height

    var alpha = 1;
    function tickSim() {
      var i, j, a, b, dx, dy, d2, d, f;

      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j];
          if (a.side !== b.side) continue;
          dx = (b.x - a.x) * ASPECT; dy = b.y - a.y;
          d2 = dx * dx + dy * dy + 0.0004;
          f = 0.000030 / d2;
          if (f > 0.02) f = 0.02;
          d = Math.sqrt(d2);
          dx /= d; dy /= d;
          a.vx -= dx * f / ASPECT; a.vy -= dy * f;
          b.vx += dx * f / ASPECT; b.vy += dy * f;
        }
      }

      for (i = 0; i < links.length; i++) {
        a = links[i].a; b = links[i].b;
        dx = (b.x - a.x) * ASPECT; dy = b.y - a.y;
        d = Math.sqrt(dx * dx + dy * dy) + 0.0001;
        f = (d - 0.090) * 0.020;
        dx = dx / d * f; dy = dy / d * f;
        a.vx += dx / ASPECT; a.vy += dy;
        b.vx -= dx / ASPECT; b.vy -= dy;
      }

      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        if (a.held) { a.vx = a.vy = 0; continue; }
        var rc = RECT[a.side];

        // Pull to the middle of its own half. It has to beat the mutual
        // repulsion of forty nodes, or the map expands until it piles up
        // against its walls.
        a.vx += ((rc.x0 + rc.x1) / 2 - a.x) * 0.020;
        a.vy += ((rc.y0 + rc.y1) / 2 - a.y) * 0.020;

        a.vx *= 0.86; a.vy *= 0.86;
        a.x += a.vx * alpha;
        a.y += a.vy * alpha;

        if (a.x < rc.x0) { a.x = rc.x0; a.vx = 0; }
        if (a.x > rc.x1) { a.x = rc.x1; a.vx = 0; }
        if (a.y < rc.y0) { a.y = rc.y0; a.vy = 0; }
        if (a.y > rc.y1) { a.y = rc.y1; a.vy = 0; }
      }

      if (alpha > 0.06) alpha *= 0.994;
    }

    // Settle before the first paint: the graph should be a finished shape when
    // it appears, not a cloud that untangles itself while you read the name.
    // Under reduced motion this is the only run it ever gets.
    for (i = 0; i < 520; i++) tickSim();

    /* Then fit each map to its own rectangle. Tuning force constants until a
       layout happens to fill its half is a losing game — it drifts the moment
       a project or a gallery is added. Measuring the result and mapping it on
       is exact, and costs one pass per side. */
    CAT_ORDER.forEach(function (key) {
      var side = CATS[key].side, rc = RECT[side];
      var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, any = false;
      nodes.forEach(function (n) {
        if (n.side !== side) return;
        any = true;
        if (n.x < minX) minX = n.x;
        if (n.x > maxX) maxX = n.x;
        if (n.y < minY) minY = n.y;
        if (n.y > maxY) maxY = n.y;
      });
      if (!any) return;
      /* One scale for both axes, then centred. Fitting each axis separately
         stretches a roughly round layout into the rectangle's proportions and
         the map stops looking like a graph. */
      var sx = (maxX - minX) > 0.001 ? (rc.x1 - rc.x0) / (maxX - minX) : 1;
      var sy = (maxY - minY) > 0.001 ? (rc.y1 - rc.y0) / (maxY - minY) : 1;
      var k = Math.min(sx, sy);
      var ox = rc.x0 + ((rc.x1 - rc.x0) - (maxX - minX) * k) / 2;
      var oy = rc.y0 + ((rc.y1 - rc.y0) - (maxY - minY) * k) / 2;
      nodes.forEach(function (n) {
        if (n.side !== side) return;
        n.x = ox + (n.x - minX) * k;
        n.y = oy + (n.y - minY) * k;
        n.vx = n.vy = 0;
      });
    });

    // A short second settle, so the fit's uniform stretch relaxes back into
    // even spacing. The wall clamps hold each map inside its rectangle.
    for (i = 0; i < 150; i++) tickSim();
    alpha = 0.05;

    /* Each node drifts around wherever it settled. The offset is applied at
       draw time only and never written back into x/y: folded into the
       positions it would compound frame over frame and the maps would slowly
       wander. Per-node phase and frequency, so the dots breathe independently
       rather than pulsing as one organism — and small, because the first
       version moved a 2px image dot further than its own hit target. */
    for (i = 0; i < nodes.length; i++) {
      nodes[i].ph = rnd() * 6.2832;
      nodes[i].fq = 0.55 + rnd() * 0.75;
      nodes[i].am = 0.0009 + rnd() * 0.0011;
    }

    /* ---------- colours ----------
       Every node in a category is the hub's colour and only lighter: hue and
       saturation come from Wada and never move, and lightness ramps with how
       small the dot is. So a tool reads as a faint version of Projects rather
       than as an idea of its own, and size and colour say the same thing
       twice — which is what keeps the map legible once it is dense.

       Only lightness is bent to the theme. Wada mixed for ink on paper, so
       half his combinations are invisible on a dark ground and the other half
       on a light one; clamping lightness into a band the ground can hold
       keeps the harmony (which lives in the hues) and drops only the part
       that was never going to survive the screen. */
    var C = {};
    var P = window.portfolioPalette;
    var PALETTE = P ? P.trio() : ['#094e94', '#00317a', '#80b1d7'];

    var RR = (function () {
      var a = [], k;
      for (k in KIND) a.push(KIND[k].r);
      return { hi: Math.max.apply(null, a), lo: Math.min.apply(null, a) };
    })();

    /* One copy of the colour maths, in js/palette.js — this file used to
       carry a second, identical set, which is how two files drift. */
    var toHsl = P.toHsl, hslRgb = P.hslRgb, lum = P.lum, ratio = P.ratio;

    /* Every node in a category is its hub's colour, lighter the smaller it is
       — and then dragged back until it actually reads against the ground.

       HSL lightness is not luminance: Wada's yellows sit at L 46% and vanish
       on paper, his deep blues at L 46% vanish in dark mode. So the ramp is
       only the starting point, and the colour is stepped toward the safe end
       until it measures. The hub is held to 4.5:1 and the smallest dot to
       3:1 — the non-text bar — which also leaves the hub enough headroom for
       the ramp to be visible at all. Hue and saturation never move: the
       harmony Wada published lives in those, not in lightness. */
    function shade(base, rad, dark, gl) {
      if (!base) return '#094e94';
      var t = Math.max(0, Math.min(1, (RR.hi - rad) / (RR.hi - RR.lo)));
      var sa = Math.min(92, base.s);
      var l = dark ? Math.max(46, Math.min(66, base.l)) + t * 22
                   : Math.max(26, Math.min(46, base.l)) + t * 24;
      var need = 4.5 - 1.5 * t;
      var step = dark ? 2 : -2;
      for (var k = 0; k < 40 && l > 2 && l < 98; k++) {
        if (ratio(lum(hslRgb(base.h, sa, l)), gl) >= need) break;
        l += step;
      }
      return 'hsl(' + base.h.toFixed(0) + ',' + sa.toFixed(0) + '%,' + l.toFixed(0) + '%)';
    }

    function readTokens() {
      var cs = getComputedStyle(root);
      function v(name, fallback) { return (cs.getPropertyValue(name) || '').trim() || fallback; }
      C.line   = v('--ink-muted', '#4e6880');
      C.label  = v('--ink', '#16283d');
      C.ground = v('--bg', '#f4f7fa');

      // Which way to clamp is a question about the ground, not about the
      // data-theme attribute — which is absent when the OS is deciding.
      var g = toHsl(C.ground);
      var dark = !!g && g.l < 50;
      var gl = g ? lum(hslRgb(g.h, g.s, g.l)) : (dark ? 0.01 : 0.9);

      CAT_ORDER.forEach(function (k, idx) {
        var base = toHsl(PALETTE[idx]);
        C[k] = shade(base, RR.hi, dark, gl);
        nodes.forEach(function (n) {
          if (n.cat === k) n.color = shade(base, n.rad, dark, gl);
        });
      });
    }
    readTokens();
    new MutationObserver(function () { readTokens(); tick(); })
      .observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    // js/palette.js re-derives every accent when the theme or the mode
    // changes; the dots have to be re-ramped from the new three.
    if (P && P.on) P.on(function () { readTokens(); tick(); });

    /* ---------- sizing ---------- */
    var w = 0, h = 0;
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var box = canvas.getBoundingClientRect();
      w = box.width; h = box.height;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      tick();
    }
    new ResizeObserver(resize).observe(canvas);
    resize();

    /* The single source of on-screen position: layout + float. Hit-testing,
       edges, nodes and labels all read these, so a dot is always clickable
       exactly where it is drawn. */
    var now = 0;
    function px(n) { return (n.x + Math.sin(now * n.fq + n.ph) * n.am * 1.6) * w; }
    function py(n) { return (n.y + Math.cos(now * n.fq * 0.85 + n.ph) * n.am) * h; }

    /* ---------- pointer ---------- */
    var hover = null, held = null, downAt = null, moved = 0;

    function nodeAt(mx, my) {
      var best = null, bestD = Infinity;
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var dx = px(n) - mx, dy = py(n) - my;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < n.rad + 9 && d < bestD) { best = n; bestD = d; }   // photo dots are 2px
      }
      return best;
    }
    function local(e) {
      var box = canvas.getBoundingClientRect();
      return { x: e.clientX - box.left, y: e.clientY - box.top };
    }

    canvas.addEventListener('pointermove', function (e) {
      var m = local(e);
      if (held) {
        moved += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
        var rc = RECT[held.side];
        held.x = Math.min(rc.x1, Math.max(rc.x0, m.x / w));
        held.y = Math.min(rc.y1, Math.max(rc.y0, m.y / h));
        alpha = Math.max(alpha, 0.35);
        tick();
        return;
      }
      var n = nodeAt(m.x, m.y);
      if (n !== hover) {
        hover = n;
        canvas.style.cursor = (n && KIND[n.kind].nav) ? 'pointer' : 'default';
        say(n);
        tick();
      }
    });

    canvas.addEventListener('pointerdown', function (e) {
      var m = local(e);
      var n = nodeAt(m.x, m.y);
      if (!n) return;
      held = n; n.held = true; downAt = m; moved = 0;
      canvas.setPointerCapture(e.pointerId);
    });

    canvas.addEventListener('pointerup', function (e) {
      if (!held) return;
      var n = held;
      n.held = false; held = null;
      try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
      // A drag is a drag, not a click. 5px of slop covers a shaky hand.
      var m = local(e);
      if (Math.abs(m.x - downAt.x) + Math.abs(m.y - downAt.y) < 5 && moved < 12) go(n);
      tick();
    });

    canvas.addEventListener('pointerleave', function () {
      if (held) { held.held = false; held = null; }
      hover = null;
      canvas.style.cursor = 'default';
      say(null);
      tick();
    });

    function go(n) {
      /* Tools are structure, not destinations. They exist so two projects
         sharing PyTorch sit near each other, and no page on this site shows
         "PyTorch" — so the node hovers and names itself but goes nowhere, and
         never claims otherwise with a pointer cursor. */
      if (!n.href || !KIND[n.kind].nav) return;
      if (/^https?:/i.test(n.href) || /\.pdf$/i.test(n.href)) {
        window.open(n.href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = n.href;
      }
    }

    var DEFAULT_READ = readout ? readout.textContent : '';
    function say(n) {
      if (!readout) return;
      readout.innerHTML = n
        ? '<b>' + esc(n.label) + '</b>' + esc(CATS[n.cat].name) + ' · ' +
          String(n.deg) + (n.deg === 1 ? ' link' : ' links')
        : esc(DEFAULT_READ);
    }

    /* ---------- draw ---------- */
    var onScreen = true;
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (en) {
        onScreen = en[0].isIntersecting;
        if (onScreen) tick();
      }, { threshold: 0 }).observe(stage);
    }

    function isNear(n) {
      if (!hover) return true;
      if (n === hover) return true;
      return (adj[hover.id] || []).indexOf(n) !== -1;
    }

    var t0 = Date.now(), freezeAt = 0, queued = false;

    function draw() {
      queued = false;
      if (!w || !h) return;
      if (root.getAttribute('data-mode') !== 'graph' || !onScreen) return;

      /* The drift pauses while a node is hovered — without it a dot can wander
         out from under the cursor between the hover and the click. t0 is
         shifted by the pause on resume, so nothing jumps. */
      var floating = !reduce.matches;
      if (floating) {
        if (hover && !freezeAt) freezeAt = Date.now();
        else if (!hover && freezeAt) { t0 += Date.now() - freezeAt; freezeAt = 0; }
        now = ((freezeAt || Date.now()) - t0) / 1000;
      }

      var settling = alpha > 0.065 && !reduce.matches;
      if (settling || held) tickSim();

      ctx.clearRect(0, 0, w, h);

      // Edges first, so nodes sit on top of their own lines.
      var i, a, b;
      for (i = 0; i < links.length; i++) {
        a = links[i].a; b = links[i].b;
        var lit = hover && (a === hover || b === hover);
        ctx.globalAlpha = hover ? (lit ? 0.8 : 0.05) : 0.18;
        ctx.strokeStyle = lit ? a.color : C.line;
        ctx.lineWidth = lit ? 1.4 : 0.8;
        ctx.beginPath();
        ctx.moveTo(px(a), py(a));
        ctx.lineTo(px(b), py(b));
        ctx.stroke();
      }

      // Nodes, coloured by category.
      for (i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var near = isNear(n);
        ctx.globalAlpha = hover ? (near ? 1 : 0.10) : KIND[n.kind].dim;
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(px(n), py(n), n === hover ? n.rad * 1.4 : n.rad, 0, 6.2832);
        ctx.fill();

        // A ring in the page's own ground separates overlapping dots, the way
        // Obsidian's node borders do.
        if (n.rad > 3.2) {
          ctx.globalAlpha = hover ? (near ? 0.9 : 0.08) : 0.85;
          ctx.strokeStyle = C.ground;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
      }

      drawLabels();
      ctx.globalAlpha = 1;

      // Keep the loop alive for the drift. Under reduced motion nothing moves,
      // so the page paints once and then only on interaction.
      if (floating || settling || held) tick();
    }

    /* ---------- labels ----------
       No two labels may overlap, and none may stray into the band the name
       occupies. Candidates are offered in priority order — the hovered node
       first, then its neighbours, then the named kinds largest first — and
       each is drawn only if its box clears everything already placed.

       A label that cannot be placed is dropped rather than nudged: moving it
       breaks the one thing a label has to do, which is sit unambiguously
       under its own dot. */
    /* The name's band. It stops at the Resources strip, which is the one
       place in the centre column where labels are wanted. */
    var CENTRE = { x0: 0.302, x1: 0.698, y0: 0.04, y1: 0.775 };

    function drawLabels() {
      var placed = [];

      function clear(r) {
        if (r.x1 > CENTRE.x0 * w && r.x0 < CENTRE.x1 * w &&
            r.y1 > CENTRE.y0 * h && r.y0 < CENTRE.y1 * h) return false;
        if (r.y0 < 2 || r.y1 > h - 2) return false;
        for (var i = 0; i < placed.length; i++) {
          var p = placed[i];
          if (r.x0 < p.x1 && r.x1 > p.x0 && r.y0 < p.y1 && r.y1 > p.y0) return false;
        }
        return true;
      }

      var queue = [];
      if (hover) {
        queue.push(hover);
        (adj[hover.id] || []).forEach(function (n) { queue.push(n); });
      } else {
        nodes.forEach(function (n) { if (KIND[n.kind].label) queue.push(n); });
        queue.sort(function (x, y) { return y.rad - x.rad; });
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      for (var q = 0; q < queue.length; q++) {
        var nd = queue[q];
        ctx.font = ((nd === hover || KIND[nd.kind].label) ? '600 11px ' : '400 10px ') + MONO;

        var text = nd.label.length > 30 ? nd.label.slice(0, 29) + '…' : nd.label;
        var lineH = 13;
        var lines = nd === hover ? 2 : 1;      // the hovered node adds its category
        var tw = ctx.measureText(text).width;
        var half = tw / 2 + 3;
        var boxH = lineH * lines;
        var nx = px(nd), ny = py(nd), gap = nd.rad + 4;

        /* Four placements, tried in order: under the dot, over it, then out
           to the right and the left. Dropping a name because the space
           directly below it happened to be taken loses information the graph
           exists to carry — but a label that wanders far from its dot is
           worse than none, so the search stops at one dot-width away. */
        var spots = [
          [nx, ny + gap],
          [nx, ny - gap - boxH],
          [nx + half + gap, ny - boxH / 2],
          [nx - half - gap, ny - boxH / 2]
        ];

        var rect = null, cx = 0, top = 0;
        for (var sp = 0; sp < spots.length; sp++) {
          // A label on a node near the edge is pulled back inside rather than
          // dropped: slightly off-centre beats absent, and at the canvas edge
          // there is only one dot it could belong to anyway.
          var tx = Math.min(w - half - 2, Math.max(half + 2, spots[sp][0]));
          var ty = spots[sp][1];
          var r2 = { x0: tx - half, x1: tx + half, y0: ty, y1: ty + boxH };
          if (clear(r2)) { rect = r2; cx = tx; top = ty; break; }
        }
        if (!rect) continue;
        placed.push(rect);

        ctx.globalAlpha = hover ? (nd === hover ? 1 : 0.8) : 0.68;
        ctx.fillStyle = C.label;
        ctx.fillText(text, cx, top);

        if (nd === hover) {
          ctx.font = '400 9px ' + MONO;
          ctx.globalAlpha = 0.8;
          ctx.fillStyle = nd.color;
          ctx.fillText(CATS[nd.cat].name.toUpperCase(), cx, top + lineH);
        }
      }
    }

    function tick() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(draw);
    }

    /* The legend is generated from the same map the dots are drawn from, so a
       category that stops having members stops being listed. */
    (function legend() {
      var box = host.querySelector('[data-field-legend]');
      if (!box) return;
      var count = {};
      nodes.forEach(function (n) { count[n.cat] = (count[n.cat] || 0) + 1; });
      box.innerHTML = CAT_ORDER.filter(function (k) { return count[k]; }).map(function (k) {
        return '<li><span class="field__swatch" style="background:var(' + CATS[k].token + ')"></span>' +
               esc(CATS[k].name) + ' <b>' + count[k] + '</b></li>';
      }).join('');
    })();

    window.addEventListener('modechange', function () { alpha = Math.max(alpha, 0.25); tick(); });
    window.addEventListener('resize', tick);
    reduce.addEventListener('change', tick);
    tick();
  }

  window.onReady(init);
})();
