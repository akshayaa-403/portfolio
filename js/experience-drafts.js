/* Experience — five drafts, round two (experience-drafts.html), for the
   owner to cut. Round one (a ladder, a table, git log, books, a phone menu)
   was rejected on 2026-10-30 as text gadgets; these are objects to handle,
   in the desk's language.

   Every draft reads ROLES: the three roles on public/assets/resume.pdf,
   restated to match the site. No locations; InnovyQ claims only her parts
   of Project IVY and mentions no one else. Once one is chosen it moves into
   index.html, and this page and its two files are deleted. */
(function () {
  'use strict';

  var ROLES = [
    { id: 'sygnius', company: 'Sygnius Digital', title: 'AI Specialist', from: 0, to: 5, dates: 'Jan – Jun 2025',
      lines: [
        ['Wrote a configurable lead pipeline in Python: the Google Maps Places API finds businesses for any search, and Selenium and BeautifulSoup scrape their sites for the contacts their listings leave out. It produced ', '600+ qualified leads', '.', 'from a search box to a phone number'],
        ['Deployed Bland AI and Retell AI voice agents to call those leads, with voicemail and IVR detection and live transfer to sales. Re-tuning the agent’s tone lifted successful transfers ', 'by 12%', ', on calls with a 65% answer rate.', 'same calls, a new tone'],
        ['Set up SPF, DKIM, DMARC and domain warm-up for client email campaigns, and prototyped an email generator by fine-tuning FLAN-T5 and DistilGPT2.']
      ] },
    { id: 'artenos', company: 'Artenos Network', title: 'Software Engineer', from: 6, to: 16, dates: 'Jul 2025 – May 2026',
      lines: [
        ['Designed CRM dashboards in Python and Matplotlib that became the sales team’s daily reporting, cutting decision time by ', 'about 25%', '.', 'measured before and after'],
        ['Ran LLM benchmarking and iterative prompt testing, raising measured response accuracy by ', 'about 15%', '.', 'benchmark first, then prompts'],
        ['Shipped internal full-stack tools in React Native, Next.js and TypeScript over Python REST APIs, deployed on Vercel.']
      ] },
    { id: 'innovyq', company: 'InnovyQ Solutions', title: 'DevOps Engineer', from: 17, to: 20, dates: 'Jun – Sep 2026',
      lines: [
        ['Built the ', 'escalation ladder', ' in Project IVY, a Slack support agent on AWS: Lex answers first, then a knowledge base, then an LLM, then a person.', 'the whole ladder is a case study', 'work/ivy-slack-agent.html'],
        ['Turned the company’s Excel FAQ sheet into ', '21 Amazon Lex V2 intents', ', and built the onboarding portal’s frontend, where a company connects the documents its knowledge base answers from.', 'one spreadsheet in, 21 intents out'],
        ['Benchmarked four OCR engines on hand-transcribed ticket screenshots. Mistral OCR was the most accurate (100% at 823 ms); ', 'PaddleOCR (98.9%)', ' was the one packaged to run inside AWS Lambda.', 'the best one didn’t fit in Lambda']
      ] }
  ];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function month(i) { return MONTHS[i % 12] + ' ' + (2025 + Math.floor(i / 12)); }
  var TONES = ['var(--graph-projects)', 'var(--graph-hobbies)', 'var(--graph-name)'];
  ROLES.forEach(function (r, i) { r.tone = TONES[i]; r.months = r.to - r.from + 1; });

  function plain(l) { return esc(l[0] + (l[1] || '') + (l[2] || '')); }
  function list(r) { return '<ul class="xd-lines">' + r.lines.map(function (l) { return '<li>' + plain(l) + '</li>'; }).join('') + '</ul>'; }
  function head(r) { return '<b>' + esc(r.company) + '</b> · ' + esc(r.title); }

  /* ---------- 1. the tape measure ----------
     The 21 months from Jan 2025 to Sep 2026, drawn to scale: one tick a
     month, each role as long as it lasted. The hook is a real range input,
     so arrow keys walk it a month at a time. */
  function tape(host) {
    var N = 21;
    host.innerHTML =
      '<div class="xp">' +
        '<div class="xp__tape">' +
          '<div class="xp__bands">' + ROLES.map(function (r) {
            return '<span class="xp__band" style="flex-grow:' + r.months + '; --c:' + r.tone + '"><span>' + esc(r.company) + '</span></span>';
          }).join('') + '</div>' +
          '<div class="xp__ticks" style="--n:' + N + '"></div>' +
          '<div class="xp__labels">' + Array.apply(null, Array(N)).map(function (_, i) {
            return '<span>' + (i % 3 === 0 ? MONTHS[i % 12] + (i % 12 === 0 ? ' ’' + String(25 + i / 12) : '') : '') + '</span>';
          }).join('') + '</div>' +
          '<input class="xp__hook" type="range" min="0" max="' + (N - 1) + '" value="' + (N - 1) + '" aria-label="Month, January 2025 to September 2026">' +
        '</div>' +
        '<div class="xp__read" aria-live="polite"></div>' +
      '</div>';
    var hook = host.querySelector('.xp__hook'), read = host.querySelector('.xp__read'), at = null;
    function show() {
      var m = +hook.value;
      var r = ROLES.filter(function (x) { return m >= x.from && m <= x.to; })[0];
      hook.style.setProperty('--at', (m / (N - 1) * 100) + '%');
      host.style.setProperty('--c', r.tone);
      var line = '<p class="xd-k">' + month(m) + ' · month ' + (m - r.from + 1) + ' of ' + r.months + '</p>';
      if (at === r.id) { read.querySelector('.xd-k').outerHTML = line; return; }
      at = r.id;
      read.innerHTML = line + '<h4>' + head(r) + ' <i>' + esc(r.dates) + '</i></h4>' + list(r);
    }
    hook.addEventListener('input', show);
    show();
  }

  /* ---------- 2. the lanyard badges ----------
     One staff badge per role, hanging from a rail. Pressing one turns it
     over to what the role produced. Both faces are in the DOM, so a screen
     reader gets both; the flip is only for the eye. */
  function badges(host) {
    host.innerHTML = '<div class="xb">' + ROLES.slice().reverse().map(function (r) {
      return '<div class="xb__hang" style="--c:' + r.tone + '"><span class="xb__strap" aria-hidden="true"></span>' +
        '<div class="xb__card">' +
          '<div class="xb__face xb__front">' +
            '<span class="xb__band">' + esc(r.company) + '</span>' +
            '<span class="xb__role">' + esc(r.title) + '</span>' +
            '<span class="xb__name">Akshayaa Kashyap</span>' +
            '<span class="xb__dates">' + esc(r.dates) + '</span>' +
            '<span class="xb__code" aria-hidden="true"></span>' +
          '</div>' +
          '<div class="xb__face xb__back">' + list(r) + '</div>' +
          '<button type="button" class="xb__flip" aria-pressed="false">Turn the ' + esc(r.company) + ' badge over</button>' +
        '</div></div>';
    }).join('') + '</div>';
    host.querySelector('.xb').addEventListener('click', function (e) {
      var b = e.target.closest('.xb__flip');
      if (!b) return;
      var on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on));
      b.closest('.xb__card').classList.toggle('is-over', on);
    });
  }

  /* ---------- 3. the passport ----------
     A visa page with one entry stamp per role, dates in and out, and no
     place on it. Pick a stamp and the facing page reads its notes. */
  function passport(host) {
    var SPOT = [['10%', '8%', '-8deg', 'is-round'], ['42%', '38%', '6deg', ''], ['8%', '64%', '-3deg', 'is-oval']];
    host.innerHTML =
      '<div class="xv">' +
        '<div class="xv__page xv__page--l"><p class="xv__h">Visas · Akshayaa Kashyap</p>' + ROLES.map(function (r, i) {
          var s = SPOT[i];
          return '<button type="button" class="xv__stamp ' + s[3] + '" aria-pressed="false" data-r="' + i + '" ' +
            'style="left:' + s[0] + '; top:' + s[1] + '; --r:' + s[2] + '; --c:' + r.tone + '">' +
            '<span class="xv__in">In ' + esc(month(r.from)) + '</span><span class="xv__co">' + esc(r.company) + '</span>' +
            '<span class="xv__out">Out ' + esc(month(r.to)) + '</span></button>';
        }).join('') + '</div>' +
        '<div class="xv__page xv__page--r" aria-live="polite"><p class="xv__h">Notes</p><p class="xv__hint">Pick a stamp.</p></div>' +
      '</div>';
    var notes = host.querySelector('.xv__page--r');
    host.querySelector('.xv__page--l').addEventListener('click', function (e) {
      var b = e.target.closest('[data-r]');
      if (!b) return;
      host.querySelectorAll('[data-r]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      var r = ROLES[+b.getAttribute('data-r')];
      notes.innerHTML = '<p class="xv__h">Notes</p><h4>' + head(r) + '</h4><p class="xd-k">' + esc(r.dates) + ' · ' + r.months + ' months</p>' + list(r);
    });
  }

  /* ---------- 4. the annotated résumé ----------
     The plainest one: the résumé's own lines on a sheet, newest first, with
     the margin notes the case studies use, in her hand. Pointing at a note
     marks the words it is about. */
  function annotated(host) {
    host.innerHTML = '<article class="xr">' + ROLES.slice().reverse().map(function (r) {
      return '<section class="xr__role"><h4>' + head(r) + '<span>' + esc(r.dates) + '</span></h4>' +
        r.lines.map(function (l, j) {
          var key = r.id + j;
          var text = l[3]
            ? esc(l[0]) + '<mark class="xr__hl" data-n="' + key + '">' + esc(l[1]) + '</mark>' + esc(l[2])
            : esc(l[0]);
          var note = l[3]
            ? '<aside class="xr__note" data-for="' + key + '">' + (l[4] ? '<a href="' + safeUrl(l[4]) + '">' + esc(l[3]) + ' ↗</a>' : esc(l[3])) + '</aside>'
            : '<span></span>';
          return '<div class="xr__line"><p>' + text + '</p>' + note + '</div>';
        }).join('') + '</section>';
    }).join('') + '</article>';
    host.addEventListener('pointerover', function (e) {
      var n = e.target.closest && e.target.closest('[data-for]');
      host.querySelectorAll('.xr__hl').forEach(function (m) { m.classList.toggle('is-on', !!n && m.getAttribute('data-n') === n.getAttribute('data-for')); });
    });
  }

  /* ---------- 5. the file drawer ----------
     Three manila folders standing in a drawer, tabs staggered as real ones
     are. Pull a tab and that folder comes up open, with a FILED stamp. */
  function drawer(host) {
    host.innerHTML =
      '<div class="xf">' +
        '<div class="xf__tabs" role="group" aria-label="Folders">' + ROLES.slice().reverse().map(function (r, i) {
          return '<button type="button" class="xf__tab" aria-expanded="false" aria-controls="xf-open" data-r="' + r.id + '" style="--i:' + i + '">' + esc(r.company) + '</button>';
        }).join('') + '</div>' +
        '<div class="xf__drawer" aria-hidden="true"><span class="xf__pull"></span></div>' +
        '<div class="xf__open" id="xf-open" aria-live="polite"></div>' +
      '</div>';
    var open = host.querySelector('.xf__open');
    var BY = {}; ROLES.forEach(function (r) { BY[r.id] = r; });
    host.querySelector('.xf__tabs').addEventListener('click', function (e) {
      var b = e.target.closest('[data-r]');
      if (!b) return;
      var was = b.getAttribute('aria-expanded') === 'true';
      host.querySelectorAll('[data-r]').forEach(function (x) { x.setAttribute('aria-expanded', 'false'); });
      open.classList.remove('is-up');
      if (was) { open.innerHTML = ''; return; }
      b.setAttribute('aria-expanded', 'true');
      var r = BY[b.getAttribute('data-r')];
      open.innerHTML = '<div class="xf__sheet" style="--c:' + r.tone + '"><span class="xf__clip" aria-hidden="true"></span>' +
        '<span class="xf__filed" aria-hidden="true">Filed ' + esc(month(r.to)) + '</span>' +
        '<h4>' + head(r) + '</h4><p class="xd-k">' + esc(r.dates) + '</p>' + list(r) + '</div>';
      void open.offsetWidth;
      open.classList.add('is-up');
    });
  }

  var BUILD = { tape: tape, badges: badges, passport: passport, annotated: annotated, drawer: drawer };
  window.onReady(function () {
    document.querySelectorAll('[data-draft]').forEach(function (el) {
      var fn = BUILD[el.getAttribute('data-draft')];
      if (fn) fn(el);
    });
  });
})();
