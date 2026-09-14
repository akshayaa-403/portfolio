/* The graph — graph mode's hero.

   Everything this site contains, drawn the way Obsidian draws a vault: every
   destination is a node, every real relationship is an edge, and a force
   simulation finds the shape. Hover a node and its neighbourhood lights while
   the rest dims; click it and you go there.

   The node set is built from the site's own data at run time — js/project-data.js
   and js/hobby-data.js — so it cannot drift out of step with what actually
   exists or claim more than there is. Nothing here is a decorative particle:
   every dot is a page, a photograph, a tool, or a link.

   What makes it a graph rather than a scatter is the stack. Two projects that
   both use PyTorch are two hops apart through the PyTorch node, so the
   clusters that form are the real ones — the models pull together, the web
   builds pull together — without anybody hand-placing them.

   Canvas, and no library. A d3-force import would be ~80KB from a CDN for a
   spring, a repulsion and a damping term, on a site that is deliberately
   buildless and offline-safe.

   Decorative by contract: the canvas is aria-hidden and takes no keyboard
   focus, because every destination in it is also a real, focusable link
   further down the same page — the work cards, the hobby tiles, the nav and
   the footer. The graph is a second way to reach them, never the only one. */
(function () {
  'use strict';

  /* ---------- 1. the node set ---------- */

  /* "JavaScript (ES6)" and "JavaScript (ES modules)" are the same tool wearing
     two labels, and as separate nodes they would split a cluster that should
     be one. Dropping a trailing parenthetical merges them and leaves every
     other entry alone. */
  function normTech(t) {
    return String(t).replace(/\s*\([^)]*\)\s*$/, '').trim();
  }

  function build() {
    var nodes = [], links = [], byId = {};

    function add(n) {
      if (byId[n.id]) return byId[n.id];
      n.deg = 0;
      byId[n.id] = n;
      nodes.push(n);
      return n;
    }
    function link(a, b) {
      if (!a || !b || a === b) return;
      links.push({ a: a, b: b });
      a.deg++; b.deg++;
    }

    /* Section hubs — the four places the nav goes. Named hWork/hHobbies and
       not work/hobbies: `hobbies` is the gallery data global, and shadowing
       it here silently emptied every gallery. */
    var hWork    = add({ id: 'hub:work',    label: 'Work',    href: '#work',    kind: 'hub' });
    var hHobbies = add({ id: 'hub:hobbies', label: 'Hobbies', href: '#hobbies', kind: 'hub' });
    var hAbout   = add({ id: 'hub:about',   label: 'About',   href: '#about',   kind: 'hub' });
    var hContact = add({ id: 'hub:contact', label: 'Contact', href: '#contact', kind: 'hub' });

    // The page's own reading order, so the four hubs form one spine rather
    // than four islands.
    link(hWork, hHobbies); link(hHobbies, hAbout); link(hAbout, hContact); link(hContact, hWork);

    // Case studies, and the stack that bridges them.
    if (typeof projects !== 'undefined') {
      for (var i = 0; i < projects.length; i++) {
        var p = projects[i];
        var pn = add({
          id: 'project:' + p.id,
          label: p.title,
          href: 'project.html?id=' + encodeURIComponent(p.id),
          kind: 'project'
        });
        link(pn, hWork);

        var tech = p.tech || [];
        for (var t = 0; t < tech.length; t++) {
          var name = normTech(tech[t]);
          if (!name) continue;
          link(pn, add({
            id: 'tech:' + name.toLowerCase(),
            label: name,
            // The Skills strip is the page's own statement of the stack.
            href: '#skills-h',
            kind: 'tech'
          }));
        }
      }
    }

    // Galleries, and one node per photograph in them.
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
        link(gn, hHobbies);

        var caps = h.captions || [];
        for (var c = 0; c < caps.length; c++) {
          /* Straight to that image's popover on its gallery page — the `i`
             param is one-based and js/hobby-page.js opens the dialog on load.
             Not a link to the bare .webp: that is a picture with no caption,
             no neighbours and no way back into the site. */
          link(gn, add({
            id: 'photo:' + key + ':' + c,
            label: caps[c],
            href: 'hobby.html?id=' + encodeURIComponent(key) + '&i=' + (c + 1),
            kind: 'photo'
          }));
        }
      }
    }
    // Off-site: where the work and the person actually live.
    link(add({ id: 'ext:github',   label: 'GitHub',   href: 'https://github.com/akshayaa-403',          kind: 'ext' }), hWork);
    link(add({ id: 'ext:linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/akshayaa-kashyap', kind: 'ext' }), hContact);
    link(add({ id: 'ext:substack', label: 'Writing',  href: 'https://akshayaakashyap.substack.com',     kind: 'ext' }), hAbout);
    link(add({ id: 'ext:resume',   label: 'Résumé',   href: 'public/assets/resume.pdf',                 kind: 'ext' }), hContact);

    return { nodes: nodes, links: links };
  }

  /* ---------- 2. geometry ---------- */

  /* Everything below works in a unit box (0..1 on both axes) and is scaled to
     pixels only at draw time, so a resize never re-runs the simulation. */

  var KEEP = { x: 0.50, y: 0.57, rx: 0.30, ry: 0.33 };

  var seed = 20260914;
  function rnd() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }

  /* Every node belongs to exactly one category. The name is what the legend
     prints and what the readout says on hover; `token` is the CSS custom
     property its dots are drawn in, so the whole graph stays inside the
     navy-on-paper palette and flips with the theme like everything else.

     The names are chosen to be true of every member. "Images" rather than
     "Photographs" because the galleries are photography, artwork and cooking
     — two thirds of those are not photographs. "Tools" rather than "Skills"
     because the nodes come from each project's `tech` array, which is what
     was used, not what is claimed. */
  var KIND = {
    project: { r: 6.5, label: true,  nav: true,  name: 'Projects',  token: '--accent-deep' },
    gallery: { r: 6.5, label: true,  nav: true,  name: 'Hobbies',   token: '--accent' },
    photo:   { r: 2.2, label: false, nav: true,  name: 'Images',    token: '--accent-mid' },
    tech:    { r: 3.2, label: false, nav: false, name: 'Tools',     token: '--ink-soft' },
    hub:     { r: 5.0, label: true,  nav: true,  name: 'Sections',  token: '--ink-body' },
    ext:     { r: 4.5, label: true,  nav: true,  name: 'Elsewhere', token: '--accent-ink' }
  };
  /* Projects and Hobbies lead — they are what the site is for, and they draw
     largest and darkest. The rest support them: Images are what a Hobby
     contains, Tools are what a Project was built with, Sections are where
     both live on the page, Elsewhere is the four links off it. */
  var ORDER = ['project', 'gallery', 'photo', 'tech', 'hub', 'ext'];

  /* Canvas resolves a font shorthand itself — it has no access to the CSS
     custom property, so the stack is repeated here. Keep it in step with
     --font-mono in css/style.css. */
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

    // Seed positions on a ring per kind, so the simulation starts from
    // something ordered and settles the same way every time.
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var a = (i / nodes.length) * Math.PI * 2 + rnd() * 0.4;
      var rad = 0.30 + rnd() * 0.16;
      n.x = 0.5 + Math.cos(a) * rad * 1.35;
      n.y = 0.5 + Math.sin(a) * rad;
      n.vx = 0; n.vy = 0;
      n.r = KIND[n.kind].r;
      // Degree is the whole reason a hub looks like a hub.
      n.rad = n.r + Math.min(n.deg, 24) * 0.30;
    }

    // Adjacency, for the hover highlight.
    var adj = {};
    for (i = 0; i < links.length; i++) {
      (adj[links[i].a.id] || (adj[links[i].a.id] = [])).push(links[i].b);
      (adj[links[i].b.id] || (adj[links[i].b.id] = [])).push(links[i].a);
    }

    /* ---------- 3. the simulation ----------
       Three forces and a damping term. Repulsion is the O(n^2) all-pairs kind
       — with ~90 nodes that is about 4,000 pair tests a tick, which is far
       cheaper than the quadtree that would replace it. */
    /* The unit box is square but the stage is not, so a step of 0.01 in x is
       1.6x the pixels of the same step in y. Every distance below is measured
       with x scaled by ASPECT, or the layout comes out squashed sideways. */
    var ASPECT = 1.6;

    var alpha = 1;
    function tickSim() {
      var i, j, a, b, dx, dy, d2, d, f;

      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j];
          dx = (b.x - a.x) * ASPECT; dy = b.y - a.y;
          d2 = dx * dx + dy * dy + 0.0004;
          f = 0.000075 / d2;
          if (f > 0.02) f = 0.02;          // clamp: two coincident nodes must not explode
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
        f = (d - 0.10) * 0.016;
        dx = dx / d * f; dy = dy / d * f;
        a.vx += dx / ASPECT; a.vy += dy;
        b.vx -= dx / ASPECT; b.vy -= dy;
      }

      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        if (a.held) { a.vx = a.vy = 0; continue; }

        /* Pull to centre. It has to beat ~90 nodes' worth of mutual repulsion
           or the whole graph expands until it hits the walls and piles up
           along them — which is exactly what a too-weak value looked like. */
        a.vx += (0.5 - a.x) * 0.015;
        a.vy += (0.5 - a.y) * 0.015;

        // And a hard push out of the lockup's ellipse: the name has to stay
        // the most legible thing on the stage.
        var kx = (a.x - KEEP.x) / KEEP.rx;
        var ky = (a.y - KEEP.y) / KEEP.ry;
        var kd = Math.sqrt(kx * kx + ky * ky);
        if (kd < 1) {
          var push = (1 - kd) * 0.004;
          if (kd < 0.001) { kx = 1; ky = 0; kd = 1; }
          a.vx += (kx / kd) * push;
          a.vy += (ky / kd) * push;
        }

        a.vx *= 0.86; a.vy *= 0.86;
        a.x += a.vx * alpha;
        a.y += a.vy * alpha;

        if (a.x < 0.02) { a.x = 0.02; a.vx = 0; }
        if (a.x > 0.98) { a.x = 0.98; a.vx = 0; }
        if (a.y < 0.03) { a.y = 0.03; a.vy = 0; }
        if (a.y > 0.90) { a.y = 0.90; a.vy = 0; }
      }

      if (alpha > 0.06) alpha *= 0.994;
    }

    // Settle before the first paint. The graph should be a finished shape when
    // it appears, not a cloud that visibly untangles itself while you read the
    // name — and under reduced motion this is the only run it ever gets.
    for (i = 0; i < 520; i++) tickSim();

    /* Then fit what settled to the box. Tuning force constants until the
       layout happens to fill the stage is a losing game — it drifts the
       moment a project or a gallery is added. Measuring the result and
       mapping it onto the target rectangle is exact, and it costs one pass.
       Done once, after the initial settle: rescaling under the cursor while
       someone drags a node would feel like the floor moving. */
    (function fit() {
      var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (var k = 0; k < nodes.length; k++) {
        if (nodes[k].x < minX) minX = nodes[k].x;
        if (nodes[k].x > maxX) maxX = nodes[k].x;
        if (nodes[k].y < minY) minY = nodes[k].y;
        if (nodes[k].y > maxY) maxY = nodes[k].y;
      }
      var sx = (maxX - minX) > 0.001 ? 0.94 / (maxX - minX) : 1;
      var sy = (maxY - minY) > 0.001 ? 0.82 / (maxY - minY) : 1;
      for (k = 0; k < nodes.length; k++) {
        nodes[k].x = 0.03 + (nodes[k].x - minX) * sx;
        nodes[k].y = 0.05 + (nodes[k].y - minY) * sy;
        nodes[k].vx = nodes[k].vy = 0;
      }
    })();

    /* Fitting rescales everything, including back over the lockup's keep-out
       ellipse — which is how labels ended up sitting on the CTA and the mode
       toggle. A short second settle lets the keep-out push clear again; the
       layout barely moves otherwise, and the wall clamps hold the box. */
    for (i = 0; i < 180; i++) tickSim();
    alpha = 0.05;   // settled: the simulation now only runs while a node is held

    /* Each node drifts around wherever it settled. The offset is applied at
       draw time only and never written back into x/y, so the layout itself
       stays exactly where the simulation put it — a float folded into the
       positions would compound frame over frame and the graph would slowly
       wander off the stage.

       Per-node phase and frequency, so ninety dots breathe independently
       rather than pulsing as one organism. */
    for (i = 0; i < nodes.length; i++) {
      nodes[i].ph = rnd() * 6.2832;
      nodes[i].fq = 0.55 + rnd() * 0.75;
      nodes[i].am = 0.0010 + rnd() * 0.0012;
    }

    /* ---------- 4. colours ---------- */
    var C = {};
    function readTokens() {
      var cs = getComputedStyle(root);
      function v(name, fallback) {
        return (cs.getPropertyValue(name) || '').trim() || fallback;
      }
      for (var k in KIND) {
        if (Object.prototype.hasOwnProperty.call(KIND, k)) {
          C[k] = v(KIND[k].token, '#094e94');
        }
      }
      C.line    = v('--ink-muted', '#4e6880');
      C.hot     = v('--accent-ink', '#094e94');
      C.label   = v('--ink', '#16283d');
      C.ground  = v('--bg', '#f4f7fa');
    }
    readTokens();
    new MutationObserver(function () { readTokens(); tick(); })
      .observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    /* ---------- 5. sizing ---------- */
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
       exactly where it is drawn rather than where it would sit if it were
       not floating. */
    var now = 0;
    function px(n) {
      return (n.x + Math.sin(now * n.fq + n.ph) * n.am * 1.6) * w;
    }
    function py(n) {
      return (n.y + Math.cos(now * n.fq * 0.85 + n.ph) * n.am) * h;
    }

    /* ---------- 6. pointer ---------- */
    var hover = null, held = null, downAt = null, moved = 0;

    function nodeAt(mx, my) {
      var best = null, bestD = Infinity;
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var dx = px(n) - mx, dy = py(n) - my;
        var d = Math.sqrt(dx * dx + dy * dy);
        // A generous target on the small nodes; the photo dots are 2px.
        if (d < n.rad + 9 && d < bestD) { best = n; bestD = d; }
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
        held.x = Math.min(0.98, Math.max(0.02, m.x / w));
        held.y = Math.min(0.97, Math.max(0.03, m.y / h));
        alpha = Math.max(alpha, 0.35);   // let the neighbours follow
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

      // A drag is a drag, not a click. 5px of slop covers a shaky hand on a
      // trackpad without swallowing a real one.
      var m = local(e);
      var slip = Math.abs(m.x - downAt.x) + Math.abs(m.y - downAt.y);
      if (slip < 5 && moved < 12) go(n);
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
         sharing PyTorch sit near each other, and there is no page on this
         site that shows "PyTorch" — so the node hovers and names itself but
         goes nowhere, and never claims otherwise with a pointer cursor. */
      if (!n.href || !KIND[n.kind].nav) return;
      // Off-site and the PDF open in their own tab, with the same noopener
      // the rest of the site's outbound links carry.
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
        ? '<b>' + esc(n.label) + '</b><br>' + esc(KIND[n.kind].name) + ' · ' +
          String(n.deg) + (n.deg === 1 ? ' link' : ' links')
        : esc(DEFAULT_READ);
    }

    /* ---------- 7. draw ---------- */
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
      var list = adj[hover.id] || [];
      return list.indexOf(n) !== -1;
    }

    var queued = false;
    function draw() {
      queued = false;
      if (!w || !h) return;
      if (root.getAttribute('data-mode') !== 'graph' || !onScreen) return;

      /* The drift pauses while a node is hovered. Without it a dot can wander
         out from under the cursor between the hover and the click — which is
         exactly what stopped the 2px image dots from ever being clickable.
         t0 is shifted by the pause on resume so nothing jumps back. */
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
      for (var i = 0; i < links.length; i++) {
        var a = links[i].a, b = links[i].b;
        var lit = hover && (a === hover || b === hover);
        ctx.globalAlpha = hover ? (lit ? 0.75 : 0.06) : 0.22;
        ctx.strokeStyle = lit ? C.hot : C.line;
        ctx.lineWidth = lit ? 1.3 : 0.8;
        ctx.beginPath();
        ctx.moveTo(px(a), py(a));
        ctx.lineTo(px(b), py(b));
        ctx.stroke();
      }

      // Nodes.
      for (i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var near = isNear(n);
        ctx.globalAlpha = hover ? (near ? 1 : 0.12) : 0.9;
        ctx.fillStyle = (hover && n === hover) ? C.hot : C[n.kind];
        ctx.beginPath();
        ctx.arc(px(n), py(n), n === hover ? n.rad * 1.4 : n.rad, 0, 6.2832);
        ctx.fill();

        // A ring in the page's own ground colour separates overlapping dots
        // the way Obsidian's node borders do.
        if (n.rad > 3) {
          ctx.globalAlpha = hover ? (near ? 0.9 : 0.1) : 0.8;
          ctx.strokeStyle = C.ground;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
      }

      // Labels last. The named kinds always carry one; the small fry only
      // label up when they are in the hovered neighbourhood, which is what
      // keeps ~90 nodes from turning into a wall of type.
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (i = 0; i < nodes.length; i++) {
        var nd = nodes[i];
        var always = KIND[nd.kind].label;
        var show = hover ? isNear(nd) : always;
        if (!show) continue;

        var big = nd === hover || KIND[nd.kind].label;
        ctx.font = (big ? '600 11px ' : '400 10px ') + MONO;
        ctx.globalAlpha = hover ? (nd === hover ? 1 : 0.75) : 0.62;
        ctx.fillStyle = C.label;

        var text = nd.label.length > 32 ? nd.label.slice(0, 31) + '…' : nd.label;
        /* Labels are centred under their node, so one near an edge would run
           off the canvas — which is how "Yosemite CycleGAN" first rendered as
           "mite CycleGAN". Clamp the centre by the measured half-width. */
        var half = ctx.measureText(text).width / 2 + 4;
        var lx = Math.min(w - half, Math.max(half, px(nd)));
        var ly = py(nd) + nd.rad + 4;
        ctx.fillText(text, lx, ly);

        // The hovered node also says which category it belongs to, so the
        // legend never has to be consulted for the dot actually under the
        // cursor.
        if (nd === hover) {
          ctx.font = '400 9px ' + MONO;
          ctx.globalAlpha = 0.7;
          ctx.fillStyle = C[nd.kind];
          ctx.fillText(KIND[nd.kind].name.toUpperCase(), lx, ly + 14);
        }
      }
      ctx.globalAlpha = 1;

      // Keep the loop alive for the drift. Under reduced motion nothing
      // moves, so the page paints once and then only on interaction.
      if (floating || settling || held) tick();
    }

    var t0 = Date.now(), freezeAt = 0;

    function tick() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(draw);
    }

    /* The legend is generated from KIND and the node set, never hand-written:
       a category that stops having members stops being listed, and a new one
       appears the moment something belongs to it. */
    (function legend() {
      var box = host.querySelector('[data-field-legend]');
      if (!box) return;
      var count = {};
      for (var i = 0; i < nodes.length; i++) {
        count[nodes[i].kind] = (count[nodes[i].kind] || 0) + 1;
      }
      var html = '';
      for (i = 0; i < ORDER.length; i++) {
        var k = ORDER[i];
        if (!count[k]) continue;
        html += '<li><span class="field__swatch" style="background:var(' + KIND[k].token + ')"></span>' +
                esc(KIND[k].name) + ' <b>' + count[k] + '</b></li>';
      }
      box.innerHTML = html;
    })();

    window.addEventListener('modechange', function () { alpha = Math.max(alpha, 0.25); tick(); });
    window.addEventListener('resize', tick);
    reduce.addEventListener('change', tick);
    tick();
  }

  window.onReady(init);
})();
