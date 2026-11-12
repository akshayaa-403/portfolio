/* The Skills section's bracelet, written into [data-info-pieces]
   in index.html.

   THE BRACELET IS THE SKILLS (2026-10-30). SKILLS below is the résumé's
   Technical Skills section, its six groups in its order and words, plus
   "Beyond code": what its bullets show rather than list. Change
   public/assets/resume.pdf and this together.

   Loads before script.js, whose reveal observer has to see the .reveal
   elements written here. */
(function () {
  'use strict';

  /* ======================= COPY: edit here ======================= */

  /* Each group: its hue (saturation and lightness are measured, below), and
     its skills as [full name, charm icon]. An icon is a key of ICONS below,
     or failing that a short glyph stamped on the charm (TS, λ). On by
     default: the group the roles on the résumé are for. */
  var SKILLS = [
    { name: 'Languages', hue: 212, items: [['Python', 'snake'], ['SQL', 'db'], ['TypeScript', 'TS'], ['JavaScript', '{ }']] },
    { name: 'AI / LLM', hue: 275, on: true, items: [
      ['LLM agents', 'robot'], ['RAG', 'search'], ['Prompt engineering', 'prompt'], ['LLM benchmarking', 'gauge'],
      ['Hugging Face Transformers', 'hug'], ['FLAN-T5', 'sparkle'], ['DistilGPT2', 'drop'], ['Bland AI', 'phone'],
      ['Retell AI', 'mic'], ['PaddleOCR', 'scan'], ['Mistral OCR', 'wind']] },
    { name: 'ML & Data', hue: 150, items: [
      ['PyTorch', 'flame'], ['scikit-learn', 'scatter'], ['OpenCV', 'eye'], ['Pandas', 'grid'], ['NumPy', 'cube'],
      ['Matplotlib', 'line'], ['Plotly', 'bars'], ['Streamlit', 'stream'], ['Power BI', 'pie']] },
    { name: 'Cloud & DevOps', hue: 28, items: [
      ['AWS Lambda', 'λ'], ['SQS', 'queue'], ['DynamoDB', 'bolt'], ['Cognito', 'key'], ['Lex', 'bubble'],
      ['Bedrock', 'rock'], ['Google Cloud', 'cloud'], ['Docker', 'boxes'], ['Git', 'branch'], ['Vercel', 'tri']] },
    { name: 'Web', hue: 340, items: [
      ['Next.js', 'N'], ['React', 'atom'], ['React Native', 'mobile'], ['Vite', 'diamond'], ['Tailwind', 'waves'],
      ['Supabase', 'zap'], ['REST APIs', 'plug'], ['OAuth 2.0', 'lock']] },
    { name: 'Automation & Outreach', hue: 186, items: [
      ['Google Maps Places API', 'pin'], ['Selenium', 'cursor'], ['BeautifulSoup', 'soup'], ['Instantly.ai', 'plane'],
      ['Woodpecker', 'leaf'], ['Email deliverability (SPF, DKIM, DMARC)', 'mail']] },
    // Not on the résumé's list; each is something one of its bullets did.
    { name: 'Beyond code', hue: 48, items: [
      ['Technical writing', 'pen'], ['Client delivery', 'gift'],
      ['Reporting for a sales team', 'clip'], ['Trade-offs on evidence', 'scales']] }
  ];
  /* ===================== end of COPY ===================== */

  /* ---------- the bracelet: skills ----------
     The group toggles, then the chain: one charm per skill in the selected
     groups, as a real list (css/info.css draws the links, the bails and the
     medals), so every name is text and is read out. Each charm is a medal
     in one of four shapes, taken in turn, with an icon for its skill cut out
     of it, and the skill's full name under it.

     A group's colour is its hue at a fixed saturation, stepped by
     js/palette.js's meet() until it measures 4.5:1 against the page ground,
     and walked again whenever the ground changes. The icon is drawn in the
     ground colour, so it reads at the same 4.5:1. */
  var ICONS = {
    snake: 'M6 19c0-3 3-3.5 6-3.5s6-.5 6-3.5-3-3.5-6-3.5-6-.5-6-3.5S9 2 12 2h3M16 2.5h.01',
    db: 'M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3zM5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3',
    robot: 'M6 9h12v10H6zM12 5v4M12 4h.01M9.5 13h.01M14.5 13h.01M10 16h4M3 12v4M21 12v4',
    search: 'M10.5 4a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13M15.5 15.5L20 20M8 9h5M8 12h3',
    prompt: 'M4 5h16v11H9l-4 4v-4H4zM8 9l2 2-2 2M12 13h4',
    gauge: 'M4 17a8 8 0 1 1 16 0M12 17l4-5M7 17h.01M17 17h.01M12 9h.01',
    hug: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M9 10h.01M15 10h.01M8.5 14c2 2 5 2 7 0',
    sparkle: 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 3v4M17 5h4',
    drop: 'M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11zM9.5 15a2.5 2.5 0 0 0 2.5 2.5',
    phone: 'M6 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 4 5a2 2 0 0 1 2-2z',
    mic: 'M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6',
    scan: 'M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M7 9h10M7 12h10M7 15h6',
    wind: 'M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7',
    flame: 'M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.5 2 1.5 3 2.5 3 0-3-1-5.5.5-8.5z',
    scatter: 'M4 20h16M4 20V4M8 15h.01M11 11h.01M14 13h.01M16 8h.01M18 6h.01M9 9h.01',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6',
    grid: 'M4 4h16v16H4zM4 10h16M4 15h16M10 4v16',
    cube: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5',
    line: 'M4 20h16M4 20V4M7 15l4-5 3 3 5-7',
    bars: 'M4 20h16M7 20v-6M11 20V8M15 20v-9M19 20V5',
    stream: 'M3 8c3-3 6 3 9 0s6 3 9 0M3 13c3-3 6 3 9 0s6 3 9 0M3 18c3-3 6 3 9 0s6 3 9 0',
    pie: 'M11 4a8 8 0 1 0 9 9h-9zM14 3v7h7a7 7 0 0 0-7-7z',
    queue: 'M3 6h11v4H3zM3 14h11v4H3zM19 7v10M17 15l2 2 2-2',
    bolt: 'M13 3L5 13h6l-1 8 8-10h-6z',
    key: 'M8 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8M12 12h9M17 12v3M20 12v2',
    bubble: 'M4 5h16v10H10l-5 4v-4H4zM8 10h8',
    rock: 'M3 19l5-8 3 4 3-7 7 11z',
    cloud: 'M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z',
    boxes: 'M3 12h18v7H3zM5 8h4v4H5zM10 8h4v4h-4zM15 8h4v4h-4zM10 4h4v4h-4z',
    branch: 'M6 3v13M18 8a2.5 2.5 0 1 0 0-.01M6 19a2.5 2.5 0 1 0 0-.01M18 10.5c0 4-6 3.5-12 5.5',
    tri: 'M12 4l9 16H3z',
    atom: 'M12 11h.01M3 12c0-2.2 4-4 9-4s9 1.8 9 4-4 4-9 4-9-1.8-9-4zM7.5 4.2c1.9-1.1 5.7 1.4 8.2 5.8s2.9 8.6 1 9.8-5.7-1.4-8.2-5.8-2.9-8.6-1-9.8z',
    mobile: 'M7 3h10v18H7zM11 18h2M10 5h4',
    diamond: 'M12 3l8 9-8 9-8-9zM8 12h8',
    waves: 'M4 10c2-4 5-4 8 0s6 4 8 0M4 16c2-4 5-4 8 0s6 4 8 0',
    zap: 'M14 2L6 13h5l-2 9 9-12h-6z',
    plug: 'M9 3v5M15 3v5M7 8h10v4a5 5 0 0 1-10 0zM12 17v4',
    lock: 'M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3M12 15v2',
    pin: 'M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12zM12 6.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5',
    cursor: 'M5 3l13 6-6 2-2 6zM13 13l6 6',
    soup: 'M3 11h18a9 9 0 0 1-18 0zM8 4c-1 1.5 1 2.5 0 4M12 4c-1 1.5 1 2.5 0 4M16 4c-1 1.5 1 2.5 0 4',
    plane: 'M21 3L3 10l7 3 3 7zM10 13l11-10',
    leaf: 'M5 19c0-9 6-14 14-14 0 8-5 14-14 14zM5 19l8-8',
    mail: 'M3 6h18v12H3zM3 6l9 7 9-7',
    pen: 'M14 4l6 6L9 21H3v-6zM12 6l6 6',
    gift: 'M4 9h16v4H4zM5 13h14v8H5zM12 9v12M12 9C10 5 6 6 8 8.5M12 9c2-4 6-3 4-.5',
    clip: 'M7 4h10v17H7zM9.5 3h5v3h-5zM10 17v-3M12 17v-6M14 17v-4',
    scales: 'M12 4v16M8 20h8M5 7h14M5 7l-3 6h6zM19 7l-3 6h6z'
  };
  var SHAPES = ['round', 'hex', 'shield', 'square'];
  function medal(icon, shape) {
    var d = ICONS[icon];
    return '<span class="bz__medal bz__medal--' + shape + '"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      (d ? '<path class="bz__icon" d="' + d + '"/>'
         : '<text class="bz__glyph" x="12" y="12"' + (icon.length < 2 ? ' style="font-size:16px"' : '') + '>' + esc(icon) + '</text>') +
      '</svg></span>';
  }

  function bracelet(el) {
    el.innerHTML =
      '<div class="bz">' +
        '<ul class="bz__groups" role="list" aria-label="Skill groups">' + SKILLS.map(function (g, k) {
          return '<li style="--charm: var(--skill-' + k + ', var(--accent-deep))">' +
            '<button type="button" class="bz__toggle" data-g="' + k + '" aria-pressed="' + !!g.on + '">' +
              '<span class="bz__dot" aria-hidden="true"></span>' + esc(g.name) +
              '<span class="bz__n">' + g.items.length + '</span></button></li>';
        }).join('') + '</ul>' +
        '<ul class="bz__chain" aria-label="Skills on the chain"></ul>' +
      '</div>';
    var chain = el.querySelector('.bz__chain');
    var hung = {};          // skill name -> already on the chain, so only new ones swing in

    function draw() {
      var html = '', now = {}, fresh = 0, n = 0;
      SKILLS.forEach(function (g, k) {
        if (!g.on) return;
        g.items.forEach(function (s) {
          var isNew = !hung[s[0]];
          now[s[0]] = true;
          html += '<li class="bz__charm' + (isNew ? ' is-fresh' : '') + '" style="--charm: var(--skill-' + k + ', var(--accent-deep))">' +
            '<span class="bz__hang"' + (isNew ? ' style="animation-delay: ' + Math.min(1.2, fresh++ * 0.05).toFixed(2) + 's"' : '') + '>' +
              medal(s[1], SHAPES[n++ % SHAPES.length]) + '<span class="bz__name">' + esc(s[0]) + '</span></span></li>';
        });
      });
      hung = now;
      chain.innerHTML = html;
    }

    el.querySelector('.bz__groups').addEventListener('click', function (e) {
      var b = e.target.closest('[data-g]');
      if (!b) return;
      var grp = SKILLS[+b.getAttribute('data-g')];
      grp.on = !grp.on;
      b.setAttribute('aria-pressed', String(grp.on));
      draw();
    });

    var P = window.portfolioPalette;
    if (P) {
      P.on(function (st) {
        SKILLS.forEach(function (grp, k) {
          var c = P.meet({ h: grp.hue, s: 70, l: 50 }, 4.5, st.dark, st.groundLum, st.dark ? 56 : 30, st.dark ? 80 : 46);
          el.style.setProperty('--skill-' + k, P.css(c));
        });
      });
    }
    draw();
  }

  function init() {
    var host = document.querySelector('[data-info-pieces]');
    if (!host || typeof esc !== 'function') return;
    var wrap = document.createElement('div');
    wrap.className = 'ip ip--bracelet';
    wrap.innerHTML = '<div class="ip__body reveal"></div>';
    host.appendChild(wrap);
    bracelet(wrap.lastChild);
  }

  window.onReady(init);
})();
