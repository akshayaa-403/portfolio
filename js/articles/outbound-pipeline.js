/* Outbound Sales Pipeline — "From a map to a phone call".
   One lead followed from a Google Maps search to a salesperson's phone.

   The two figures run the rebuilt pipeline's own rules in the browser:
   `scrape` is pipeline/enrich.py's scan() and contact_page() ported line for
   line (the phone pattern trades Python's lookbehind for a capture group, which
   older Safari can parse), and `call` is calls.py's outcome() over the fields
   Bland and Retell return. The agency in both is made up; its numbers are in
   the 555-01xx range kept for fiction. */
(function () {
  'use strict';

  /* ---------- the scrape ---------- */

  var BASE = 'https://sunnystays.example/';
  var LISTING = { phone: '+1 305-555-0100', status: 'OPERATIONAL' };
  var PAGES = {
    home: [
      '<header>',
      '  <img src="/img/logo@2x.png" alt="Sunny Stays">',
      '  <a href="/contact">Contact us</a>',
      '</header>',
      '<h1>Sunny Stays Vacation Rentals</h1>',
      '<p>Beachfront homes in Miami Beach since 2009.</p>',
      '<p>Call us: (305) 555-0142</p>',
      '<footer>',
      '  <a href="https://www.instagram.com/sunnystays.example">Instagram</a>',
      '  <a href="https://fax.com/sunnystays">Send us a fax</a>',
      '  <p>Press kit: sunnystays-logo@2x.png</p>',
      '  <p>Licence no. 2024 0142 5550</p>',
      '</footer>'
    ].join('\n'),
    contact: [
      '<h1>Contact</h1>',
      '<p>Bookings: <a href="mailto:bookings@sunnystays.example?subject=Stay">bookings@sunnystays.example</a></p>',
      '<p>Owner, direct: <a href="tel:+13055550187">305.555.0187</a></p>',
      '<a href="https://facebook.com/sunnystays.example">Facebook</a>'
    ].join('\n')
  };

  var EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
  var EMAIL_ONE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  var PHONE = /(^|\D)((?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4})(?!\d)/g;
  var NUMBERISH = /\d[\d\s().-]{7,}\d/g;
  var IMAGE = /\.(png|jpe?g|gif|svg|webp)$/i;
  var SOCIAL = [['facebook.com', 'facebook'], ['fb.com', 'facebook'], ['instagram.com', 'instagram'],
    ['linkedin.com', 'linkedin'], ['twitter.com', 'twitter'], ['x.com', 'twitter'], ['yelp.com', 'yelp'],
    ['tiktok.com', 'tiktok'], ['pinterest.com', 'pinterest']];

  function e164(raw) {
    var d = String(raw || '').replace(/\D/g, '');
    if (d.length === 11 && d.charAt(0) === '1') d = d.slice(1);
    return d.length === 10 ? '+1' + d : null;
  }
  function abs(u, base) { try { return new URL(u, base).href; } catch (e) { return ''; } }
  function hostOf(u) { try { return new URL(u).host.toLowerCase(); } catch (e) { return ''; } }

  /* scan() and contact_page() from pipeline/enrich.py. It also keeps what it
     turned away and why; the Python drops those silently. */
  function scan(html, base) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var out = { emails: {}, phones: {}, social: {}, dropped: [], contact: null };
    function drop(what, why) {
      if (!out.dropped.some(function (d) { return d[0] === what; })) out.dropped.push([what, why]);
    }
    function email(e) {
      if (!EMAIL_ONE.test(e)) return;
      if (IMAGE.test(e)) drop(e, 'an image file name, not an address');
      else out.emails[e.toLowerCase()] = 1;
    }
    function phone(p) {
      var n = e164(p);
      if (n) out.phones[n] = 1; else drop(p, 'not a US number');
    }

    var home = hostOf(base);
    Array.prototype.forEach.call(doc.querySelectorAll('a[href]'), function (a) {
      var href = a.getAttribute('href').trim(), low = href.toLowerCase();
      if (low.indexOf('mailto:') === 0) email(href.slice(7).split('?')[0]);
      else if (low.indexOf('tel:') === 0) phone(href.slice(4));
      else {
        var url = abs(href, base), h = hostOf(url), hit = null, near = null;
        SOCIAL.forEach(function (s) {
          if (h === s[0] || h.slice(-s[0].length - 1) === '.' + s[0]) hit = hit || s[1];
          else if (h.indexOf(s[0]) !== -1) near = near || s[0];
        });
        if (hit) { if (!out.social[hit]) out.social[hit] = url; }
        else if (near) drop(h, 'contains “' + near + '” but isn’t it');
      }
      if (!out.contact && (low.indexOf('contact') !== -1 || /contact/i.test(a.textContent))) {
        var c = abs(href, base);
        if (/^http/.test(c) && hostOf(c) === home && c !== base) out.contact = c;
      }
    });

    var text = doc.body ? doc.body.textContent : '';
    (text.match(EMAIL) || []).forEach(email);
    var m, found = [];
    PHONE.lastIndex = 0;
    while ((m = PHONE.exec(text))) { found.push(m[2]); phone(m[2]); }
    (text.match(NUMBERISH) || []).forEach(function (n) {
      var covered = found.some(function (f) { return n.indexOf(f) !== -1 || f.indexOf(n) !== -1; });
      if (!covered) drop(n.trim(), 'no separators where a phone number has them');
    });
    return out;
  }

  /* ---------- the call ---------- */

  /* outcome() from pipeline/calls.py. */
  function outcome(provider, call) {
    if (provider === 'bland') {
      if (!call.completed) return 'pending';
      if (call.transferred_to) return 'transferred';
      return { human: 'answered', voicemail: 'voicemail' }[call.answered_by] || 'no_answer';
    }
    if (call.call_status === 'registered' || call.call_status === 'ongoing') return 'pending';
    var r = call.disconnection_reason || '';
    if (r === 'call_transfer' || r === 'transfer_bridged') return 'transferred';
    if (r === 'voicemail_reached' || (call.call_analysis || {}).in_voicemail) return 'voicemail';
    if (r === 'ivr_reached') return 'ivr';
    if (call.call_status === 'not_connected' || r.indexOf('dial_') === 0 ||
        r === 'invalid_destination' || r === 'user_declined') return 'no_answer';
    return 'answered';
  }

  var NODES = [
    ['dial', 'Dial the number on the lead'],
    ['greet', 'Wait for them to speak first'],
    ['machine', 'A machine: hang up, leave nothing'],
    ['intro', 'Name, what we do, “have you got a minute?”'],
    ['pain', '“How are most of your bookings coming in?”'],
    ['value', 'Offer what matches the pain they named'],
    ['concern', 'Budget or ROI, acknowledged, not argued'],
    ['transfer', 'Live transfer to the sales line'],
    ['bye', 'Thank them and end the call']
  ];
  var CASES = {
    yes: { label: 'A person, interested', path: ['dial', 'greet', 'intro', 'pain', 'value', 'concern', 'transfer'],
      bland: { completed: true, answered_by: 'human', transferred_to: '+13055550199' },
      retell: { call_status: 'ended', disconnection_reason: 'call_transfer' } },
    no: { label: 'A person, not interested', path: ['dial', 'greet', 'intro', 'pain', 'value', 'bye'],
      bland: { completed: true, answered_by: 'human', transferred_to: null },
      retell: { call_status: 'ended', disconnection_reason: 'agent_hangup' } },
    vm: { label: 'Voicemail', path: ['dial', 'greet', 'machine'],
      bland: { completed: true, answered_by: 'voicemail' },
      retell: { call_status: 'ended', disconnection_reason: 'voicemail_reached', call_analysis: { in_voicemail: true } } },
    ivr: { label: 'A phone menu', path: ['dial', 'greet', 'machine'],
      bland: null,
      retell: { call_status: 'ended', disconnection_reason: 'ivr_reached' } },
    none: { label: 'Nobody', path: ['dial'],
      bland: { completed: true, status: 'no-answer', answered_by: 'no-answer' },
      retell: { call_status: 'not_connected', disconnection_reason: 'dial_no_answer' } }
  };

  Article.register('outbound-pipeline', {
    form: 'pipeline',
    scramble: '0123456789+()-.',
    dek: 'An AI voice agent that calls vacation-rental agencies and hands the interested ones to a salesperson. For the 2025 campaign I reported a **65% answer rate**, and a **12% lift** in successful transfers after rewriting its tone. The call records aren’t in the repo.',

    chapters: [
      {
        id: 'problem', title: 'The problem',
        blocks: [
          { p: 'In my last semester of college, in 2025, I joined Sygnius Digital as an AI Specialist. A web-design studio wanted to sell booking websites to vacation-rental agencies around Miami: small companies that manage holiday homes and rent them out by the week.' },
          { p: 'My part was everything before the salesperson. Find the agencies, find a way to reach a person at each one, have an AI agent make the call, and hand over anyone interested. A salesperson’s time is the expensive part, so it should go only on people who had already agreed to a conversation.' }
        ]
      },
      {
        id: 'built', title: 'What I built',
        blocks: [
          { h: 'Finding leads, sixty at a time' },
          { p: 'Nearly every agency had a Google Maps listing, so the list started there, with searches like “vacation home rental agency near 33101”. The Places API answers 20 places at a time and stops after three pages, so sixty is the ceiling for one query. The way round it is many smaller queries, one per ZIP code, with neighbours allowed to overlap.' },
          { p: 'Overlap means duplicates. Every place has a stable ID, so the 2026 rebuild remembers the IDs it has written and skips them, across runs as well as within one.' },
          { code: 'def search(query, key, pages=3):\n    token = None\n    for _ in range(pages):\n        body = {"textQuery": query, "pageSize": 20}\n        if token:\n            body["pageToken"] = token\n        r = requests.post(SEARCH_URL, json=body, timeout=30,\n                          headers={"X-Goog-Api-Key": key, "X-Goog-FieldMask": FIELD_MASK})\n        r.raise_for_status()\n        data = r.json()\n        yield from data.get("places", [])\n        token = data.get("nextPageToken")\n        if not token:\n            return',
            lang: 'python', caption: 'pipeline/leads.py. The field mask asks for phone, website and business status in the same call.' },
          { h: 'Reading the website' },
          { p: 'A listing’s phone number is often a front desk or an answering service. The website usually knows more: an email, an owner’s direct line, the agency’s Instagram. So for every lead with a website, the pipeline reads the home page and, if it links one, the contact page.' },
          { widget: 'scrape', size: 'wide', caption: 'A made-up agency’s site, read by the same rules as pipeline/enrich.py, ported to JavaScript and run in your browser. Step through the passes, or edit the HTML. The list at the bottom is what the rules turned away.' },
          { p: 'Sites that draw their contact details with JavaScript get a second read in headless Chrome with Selenium. That is the fallback, not the default, because a browser per site is slow. The rebuild then marks each lead **qualified**: still trading, with at least one phone number or email. The 2025 campaign’s lists passed 600 leads, in two raw files of 600 and 710 rows; those lists aren’t in the repo, and they were never put through that check.' },
          { h: 'Making the call' },
          { p: 'The calls were made by an AI voice agent, on either Bland AI or Retell AI; the pipeline drives both. The agent waits for a greeting before it speaks, and hangs up on voicemail and phone menus. A robot leaving a robot voicemail is the worst first impression a studio could make.' },
          { widget: 'call', size: 'wide', caption: 'Who answers decides the path. Below the steps are the fields each platform returns for that call, and what `outcome()` in pipeline/calls.py records from them.' },
          { p: 'If a person answers, the agent asks how bookings come in, then follows one of three branches for the pain the owner names. Every branch ends in a live transfer to the sales line or a polite goodbye. The transfer is the point of the whole system.' },
          { p: 'Behind the calls sat cold email for follow-ups. I set up SPF, DKIM and DMARC on the sending domains and warmed them up in Instantly.ai and Woodpecker. The rebuild checks those records in pipeline/deliverability.py.' }
        ]
      },
      {
        id: 'hard', title: 'The hard part',
        blocks: [
          { p: 'Most of the scraping rules exist because a page fooled an earlier version. `logo@2x.png` has the shape of an email address, so anything ending in an image extension is dropped. `fax.com` contains `x.com`, so a social link has to match the whole host. A phone number needs separators where phone numbers have them, or a licence number in a footer becomes a call.' },
          { p: 'The harder lesson was in the counting. Alongside the calls I kept an analysis notebook, mostly written by Colab’s built-in assistant, that pulled every batch back from Bland’s API: 34 batches, 980 calls requested, 310 failed. It reported zero completed calls in every batch.' },
          { p: 'The completed count came back as a list, the code could not turn a list into a number, and the fix it settled on was to replace every list with 0. The chart rendered anyway. So that zero says nothing about the calls; it is the bug. The answer rate I reported at the time didn’t come from that notebook, and since neither the call records nor a working count survive, the two can’t be checked against each other.' },
          { p: 'The rebuilt `report` asks each platform about each call and sorts it into one of six outcomes. Answer rate is people over everything dialled; transfer rate is transfers over people. Every call carries the name of its prompt, so two tones compare in one command.' },
          { code: 'for variant, c in sorted(by.items()):\n    dialed = sum(c.values())\n    picked_up = c["answered"] + c["transferred"]\n    out[variant] = {\n        "answer_rate": picked_up / dialed,\n        "transfer_rate": c["transferred"] / picked_up if picked_up else 0.0,\n        ...\n    }',
            lang: 'python', caption: 'pipeline/calls.py. A call still in progress is left out of both rates.' }
        ]
      },
      {
        id: 'results', title: 'Results',
        blocks: [
          { p: 'For the 2025 campaign I reported a 65% answer rate; the call records aren’t in the repo, so the rebuild can’t recompute it. The first agent was polite and complete: it introduced the studio, listed the benefits, then asked if the owner wanted sales.' },
          { p: 'I rewrote it to ask before it pitches, one question at a time, and to offer only the thing that matches the pain the owner named. Successful transfers rose: a 12% lift, as reported then.' },
          { table: {
              head: ['', 'Formal', 'Warm'],
              rows: [
                ['Opening', 'Introduces the studio and the service', 'A name, one line on what we do, “have you got a minute?”'],
                ['Order', 'Pitch, then ask', 'Ask, listen, say it back, then offer'],
                ['The offer', 'Every benefit, to everyone', 'The one that matches the pain they named'],
                ['Objections', 'Not planned for', 'Acknowledged plainly, never argued'],
                ['A no', 'Thank them and end', 'Thank them warmly; never push twice'],
                ['Sentences', 'Complete and professional', 'Short and casual, no jargon']
              ] },
            caption: 'The two tones, from prompts/formal.txt and prompts/warm.txt.' }
        ]
      }
    ],

    closing: {
      blocks: [
        { p: '**Write one script from day one.** Eight notebooks held one scraper, copied a dozen times. The last copy failed on every row because it read its table of social networks before defining it. One test would have caught that. The rebuild has tests.' },
        { p: '**Keep keys out of the code.** Every API key was pasted into a cell. They have all been rotated, but they should never have been there.' },
        { p: '**Check the summary against the source.** Zero completed calls out of 980 should have stopped me. The rebuild counts from each call.' },
        { p: '**Measure the funnel end to end.** I never joined answers and transfers back to the lead list, so I can’t say which leads were likelier to take the transfer.' }
      ]
    },

    sources: [
      ['65% and +12%', 'The owner’s résumé, from the 2025 campaign. The call records are not in the repo.'],
      ['600+ leads', 'Notebook outputs from the 2025 campaign: 600-row file for ZIP 33130, 710-row file for ZIP 33101. The lists are not in the repo.'],
      ['Batch analysis', 'Untitled13.ipynb over Bland GET /v1/batches: 34 batches, 980 requested, 310 failed.'],
      ['Scrape rules', 'pipeline/enrich.py scan(), contact_page(); test_pipeline.py.'],
      ['Call outcomes', 'pipeline/calls.py outcome(); Bland and Retell call records.'],
      ['Places limits', 'Places API (New) Text Search: 20 results per page, 3 pages.'],
      ['DNS checks', 'pipeline/deliverability.py check_spf(), check_dmarc(), check_dkim().']
    ],

    widgets: {
      /* ---- the scrape, pass by pass ---- */
      scrape: function (host, kit) {
        var src = { home: PAGES.home, contact: PAGES.contact };
        var pass = 2;

        function run(n) {
          var acc = { emails: {}, phones: {}, social: {}, dropped: [], note: '' };
          function take(r) {
            Object.keys(r.emails).forEach(function (k) { acc.emails[k] = 1; });
            Object.keys(r.phones).forEach(function (k) { acc.phones[k] = 1; });
            Object.keys(r.social).forEach(function (k) { if (!acc.social[k]) acc.social[k] = r.social[k]; });
            acc.dropped = acc.dropped.concat(r.dropped);
          }
          if (n >= 1) {
            var h = scan(src.home, BASE);
            take(h);
            if (n >= 2) {
              if (h.contact) take(scan(src.contact, h.contact));
              else acc.note = 'The home page links no contact page, so this pass reads nothing.';
            }
          }
          return acc;
        }
        function columns(acc) {
          var rows = [['phone', e164(LISTING.phone), 'listing'], ['website', BASE, 'listing']];
          rows.push(['emails', Object.keys(acc.emails).sort().slice(0, 3).join(', ')]);
          rows.push(['site_phones', Object.keys(acc.phones).sort().slice(0, 3).join(', ')]);
          Object.keys(acc.social).sort().forEach(function (k) { rows.push([k, acc.social[k]]); });
          return rows;
        }

        var choice = kit.choice({ label: 'Read', value: pass, options: [
          { value: 0, label: 'The listing' }, { value: 1, label: '+ home page' }, { value: 2, label: '+ contact page' }
        ], onChange: function (v) { pass = v; draw(); } });
        host.appendChild(kit.el('div', { class: 'k-row' }, choice.el));

        var grid = kit.el('div', { class: 'ob-scrape' });
        var srcBox = kit.el('div', { class: 'ob-src' });
        var outBox = kit.el('div', { class: 'ob-out', 'aria-live': 'polite' });
        grid.appendChild(srcBox);
        grid.appendChild(outBox);
        host.appendChild(grid);

        var areas = {};
        ['home', 'contact'].forEach(function (k) {
          var id = kit.id(k);
          var ta = kit.el('textarea', { id: id, class: 'ob-src__in', spellcheck: 'false', rows: k === 'home' ? 13 : 5 });
          ta.value = src[k];
          ta.addEventListener('input', function () { src[k] = ta.value; draw(); });
          areas[k] = kit.el('div', { class: 'ob-src__page' },
            kit.el('label', { 'for': id, class: 'ob-src__k', text: k === 'home' ? BASE : BASE + 'contact' }), ta);
          srcBox.appendChild(areas[k]);
        });
        var listing = kit.el('dl', { class: 'ob-listing' },
          kit.el('dt', { text: 'name' }), kit.el('dd', { text: 'Sunny Stays Vacation Rentals' }),
          kit.el('dt', { text: 'phone' }), kit.el('dd', { text: LISTING.phone }),
          kit.el('dt', { text: 'website' }), kit.el('dd', { text: BASE }),
          kit.el('dt', { text: 'status' }), kit.el('dd', { text: LISTING.status }));
        srcBox.appendChild(listing);

        function draw() {
          listing.hidden = pass !== 0;
          areas.home.hidden = pass < 1;
          areas.contact.hidden = pass < 2;

          var now = run(pass), before = pass ? run(pass - 1) : null;
          var was = {};
          if (before) columns(before).forEach(function (r) { was[r[0]] = r[1]; });

          outBox.textContent = '';
          var table = kit.el('table', { class: 'ob-cols' });
          var body = kit.el('tbody');
          columns(now).forEach(function (r) {
            var isNew = before && r[1] && r[1] !== was[r[0]];
            body.appendChild(kit.el('tr', { class: isNew ? 'is-new' : (r[1] ? '' : 'is-empty') },
              kit.el('th', { scope: 'row', text: r[0] }),
              kit.el('td', { text: r[1] || '—' }),
              kit.el('td', { class: 'ob-cols__m', text: isNew ? 'new' : (r[2] || '') })));
          });
          table.appendChild(body);
          outBox.appendChild(table);

          var reach = Object.keys(now.emails).length + Object.keys(now.phones).length;
          var q = LISTING.status === 'OPERATIONAL' && !!(LISTING.phone || reach);
          outBox.appendChild(kit.el('p', { class: 'ob-q' }, kit.el('b', { text: 'qualified: ' + (q ? 'yes' : 'no') }),
            ' — still trading, and there is a number or an address to reach a person on.'));
          if (now.note) outBox.appendChild(kit.el('p', { class: 'ob-note', text: now.note }));
          if (pass === 2 && !reach) {
            outBox.appendChild(kit.el('p', { class: 'ob-note',
              text: 'No email or phone in the HTML. With --selenium, this is where the home page is opened in headless Chrome and read again, in case JavaScript draws them.' }));
          }
          if (now.dropped.length) {
            outBox.appendChild(kit.el('p', { class: 'ob-sub', text: 'Turned away' }));
            outBox.appendChild(kit.el('ul', { class: 'ob-drop' }, now.dropped.map(function (d) {
              return kit.el('li', null, kit.el('code', { text: d[0] }), ' ' + d[1]);
            })));
          }
          kit.announce(Object.keys(now.emails).length + ' emails, ' + Object.keys(now.phones).length +
            ' phone numbers, ' + Object.keys(now.social).length + ' social profiles');
        }
        draw();
      },

      /* ---- the call, by who answers ---- */
      call: function (host, kit) {
        var at = 'yes';
        var choice = kit.choice({ label: 'Who answers', value: at,
          options: Object.keys(CASES).map(function (k) { return { value: k, label: CASES[k].label }; }),
          onChange: function (v) { at = v; draw(); } });
        host.appendChild(kit.el('div', { class: 'k-row' }, choice.el));

        var steps = kit.el('ol', { class: 'ob-path' });
        host.appendChild(steps);
        var recs = kit.el('div', { class: 'ob-recs', 'aria-live': 'polite' });
        host.appendChild(recs);

        function record(name, provider, fields) {
          var box = kit.el('div', { class: 'ob-rec' }, kit.el('p', { class: 'ob-rec__h', text: name }));
          if (!fields) {
            box.appendChild(kit.el('p', { class: 'ob-rec__none',
              text: 'Bland has no phone-menu field. The prompt makes the agent hang up, and the call is counted by whatever answered_by says.' }));
            return box;
          }
          box.appendChild(kit.el('pre', { class: 'ob-rec__f', text: Object.keys(fields).map(function (k) {
            return k + ': ' + JSON.stringify(fields[k]);
          }).join('\n') }));
          box.appendChild(kit.el('p', { class: 'ob-rec__o' }, 'outcome() → ', kit.el('b', { text: outcome(provider, fields) })));
          return box;
        }

        function draw() {
          var c = CASES[at], last = c.path[c.path.length - 1];
          steps.textContent = '';
          NODES.forEach(function (n, i) {
            var on = c.path.indexOf(n[0]) !== -1;
            steps.appendChild(kit.el('li', { class: 'ob-step' + (on ? ' is-on' : '') + (n[0] === last ? ' is-end' : '') },
              kit.el('span', { class: 'ob-step__n', text: on ? String(c.path.indexOf(n[0]) + 1) : '·' }),
              kit.el('span', { class: 'ob-step__t', text: n[1] })));
          });
          recs.textContent = '';
          recs.appendChild(record('Bland, GET /v1/calls/{id}', 'bland', c.bland));
          recs.appendChild(record('Retell, get-call', 'retell', c.retell));
          kit.announce(c.label + ': ' + NODES.filter(function (n) { return n[0] === last; })[0][1]);
        }
        draw();
      }
    }
  });
})();
