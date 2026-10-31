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
    dek: 'In my last semester of college, in 2025, I joined Sygnius Digital as an AI Specialist. A web-design studio wanted to sell booking websites to vacation-rental agencies around Miami, and my part was everything before the salesperson: find the agencies, find a way to reach a person, have an AI agent make the call, and hand over anyone interested. This piece follows one lead through it.',

    opener: function (c) {
      var s = '<path d="M30 20c-10 0-17 7.5-17 17 0 13 17 31 17 31s17-18 17-31c0-9.5-7-17-17-17z" fill="none" stroke="' + c.a + '" stroke-width="2.2"/>';
      s += '<circle cx="30" cy="37" r="5.5" fill="' + c.a + '"/>';
      s += '<path d="M34 76 C 44 106, 70 108, 82 92" fill="none" stroke="' + c.l + '" stroke-width="1.6" stroke-dasharray="3 5"/>';
      s += '<rect x="80" y="62" width="30" height="50" rx="6" fill="none" stroke="' + c.i + '" stroke-width="1.8"/>';
      s += '<line x1="90" y1="105" x2="100" y2="105" stroke="' + c.i + '" stroke-width="1.6"/>';
      [10, 18, 26].forEach(function (r, i) {
        s += '<path d="M' + (95 - r * 0.7) + ' ' + (52 - r * 0.7) + ' A ' + r + ' ' + r + ' 0 0 1 ' + (95 + r * 0.7) + ' ' + (52 - r * 0.7) +
          '" fill="none" stroke="' + c.a + '" stroke-width="' + (2 - i * 0.4) + '" stroke-linecap="round"/>';
      });
      return s;
    },

    chapters: [
      {
        id: 'find', label: 'Step 1 · Find', title: 'Sixty at a time',
        blocks: [
          { p: 'The studio’s buyers were vacation-rental agencies: small companies that manage holiday homes for their owners and rent them out by the week. Nearly all of them had a Google Maps listing. So the list started there, with one search: “vacation home rental agency near 33101”.' },
          { p: 'The Places API answers a text search 20 places at a time and stops after three pages. Sixty is the ceiling for any one query, however many agencies there are. Miami Beach alone has more than that. The way round it is to ask many smaller questions, one per ZIP code, and let neighbouring ZIPs overlap.' },
          { p: 'Overlap means duplicates. Every place has a stable ID, so the pipeline remembers the IDs it has already written and skips them, across runs as well as within one. Run it again tomorrow over the same ZIPs and it only adds what’s new.' },
          { code: 'def search(query, key, pages=3):\n    token = None\n    for _ in range(pages):\n        body = {"textQuery": query, "pageSize": 20}\n        if token:\n            body["pageToken"] = token\n        r = requests.post(SEARCH_URL, json=body, timeout=30,\n                          headers={"X-Goog-Api-Key": key, "X-Goog-FieldMask": FIELD_MASK})\n        r.raise_for_status()\n        data = r.json()\n        yield from data.get("places", [])\n        token = data.get("nextPageToken")\n        if not token:\n            return',
            lang: 'python', caption: 'pipeline/leads.py. The field mask asks for the phone number, website and business status in the same call, so there is no second request per place.' },
          { p: 'Getting to that took me four days. The notebooks are dated: on 21 January the scraper was one cell, on the 22nd it ran in a loop for a set number of seconds, on the 23rd it counted its own API calls, and on the 24th it read each business’s website too. Each day I copied the whole thing into a new cell and changed it.',
            notes: [['copied the whole thing into a new cell', 'eight notebooks, one scraper, a dozen copies of it']] }
        ]
      },
      {
        id: 'enrich', label: 'Step 2 · Enrich', title: 'What the listing leaves out',
        blocks: [
          { p: 'A listing gives you a name, an address, usually a phone number and a website. The phone number is often a front desk or an answering service. The website usually knows more: an email, an owner’s direct line, the agency’s Instagram and Facebook. Those are the contacts a salesperson wants.' },
          { p: 'So for every lead with a website, the pipeline reads the home page and, if it links one, the contact page. It takes emails from `mailto:` links and from the text, phone numbers from `tel:` links and from anything shaped like a US number, and social profiles from links whose host is one of nine networks.' },
          { widget: 'scrape', size: 'wide', caption: 'A made-up agency’s site, read by the same rules as pipeline/enrich.py, ported to JavaScript and run in your browser. Step through the passes, or edit the HTML and watch the columns change. The list at the bottom is what the rules turned away.' },
          { p: 'Most of those rules exist because a page fooled an earlier version. `logo@2x.png` has the shape of an email address, so anything ending in an image extension is dropped. `fax.com` contains `x.com`, so a social link has to match the whole host, not a substring of it. A phone number needs separators where phone numbers have them, or a licence number in a footer becomes a call.' },
          { p: 'Some sites draw their contact details with JavaScript, and the HTML that comes back from a plain request has none of them. For those, and only those, the pipeline opens the page in headless Chrome with Selenium and reads it again. A browser per site is slow, which is why it is the fallback and not the default. Delete every contact from the figure’s HTML and it tells you when that would happen.' },
          { p: 'Then each lead is marked **qualified** or not: still trading, by the listing’s own status, with at least one phone number or email to reach a person on. The list passed 600 qualified leads.^[Notebook outputs show lead files of 600 rows for ZIP 33130 and 710 rows for ZIP 33101.]' }
        ]
      },
      {
        id: 'call', label: 'Step 3 · Call', title: 'Hang up on the machines',
        blocks: [
          { p: 'A salesperson’s time is the expensive part, so it went only on people who had already agreed to a conversation. The calls themselves were made by an AI voice agent. I used two platforms, Bland AI and Retell AI. They solve the same problem with different settings, and the pipeline drives either one.' },
          { p: 'The first decision is what to do when no person picks up. A call to a small business in the middle of a working day often reaches a voicemail greeting or a phone menu. A robot leaving a robot voicemail is the worst first impression a studio could make, so the agent hangs up on both. On Bland that is a setting, `voicemail: {"action": "hangup"}`, plus an instruction at the top of the prompt for phone menus. On Retell the agent detects voicemail itself, and the call ends with a reason the pipeline can read.',
            notes: [['A robot leaving a robot voicemail', 'never leave a message the owner will play back to someone']] },
          { p: 'The agent also waits for a greeting before it speaks. One that starts talking the instant the line connects talks over “Hello, Sunny Stays”, and the person on the other end knows straight away what they are talking to.' },
          { widget: 'call', size: 'wide', caption: 'Who answers decides the path. The steps follow the warm prompt and the conversation pathway. Below them are the fields each platform returns for that call, and what `outcome()` in pipeline/calls.py records from them.' },
          { p: 'If a person answers, the agent follows a conversation pathway: an introduction, then a question about how bookings come in, then one of three branches for the pain the owner names: low bookings, being hard to find online, or something else. Budget and doubts about the return each get their own node. Every branch ends in one of two places, a live transfer to the sales line or a polite goodbye.' },
          { p: 'The transfer is the point of the whole system. It is where the agent stops and a person who can quote a price takes over, with the owner still on the line.' }
        ]
      },
      {
        id: 'tone', label: 'Step 4 · Tune', title: 'Twelve percent from tone',
        blocks: [
          { p: 'Calls reached a 65% answer rate. The first version of the agent was polite and complete. It introduced the studio, explained the service, listed the benefits and then asked if the owner would like to speak to sales.' },
          { p: 'So I rewrote it. The second version asks before it pitches, one question at a time, and says back what it heard before offering anything. It offers the one thing that matches the pain the owner named, never pushes twice, and talks in short sentences. Successful transfers rose by 12%.' },
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
            caption: 'The two tones, from prompts/formal.txt and prompts/warm.txt.' },
          { h: 'Counting it properly' },
          { p: 'There is a part of this I only saw while writing it up. Alongside the calls I kept an analysis notebook, mostly written by Colab’s built-in assistant, that pulled every batch of calls back from Bland’s API: 34 batches, 980 calls requested, 310 failed, and two batches of 154 that failed outright. It reported zero completed calls in every one of them.',
            notes: [['zero completed calls in every one of them', 'a number that should have stopped me']] },
          { p: 'The completed count came back as a list, the code could not turn a list into a number, and the fix it settled on was to replace every list with 0. The chart rendered. The summary underneath said the analysis had “effectively identified potential issues”.' },
          { p: 'The rebuilt `report` asks each platform about each call instead, and sorts it into one of six outcomes: transferred, answered, voicemail, phone menu, no answer, or still in progress. Answer rate is people over everything dialled; transfer rate is transfers over people. Every call carries the name of the prompt it ran on, so two tones compare in one command.' },
          { code: 'for variant, c in sorted(by.items()):\n    dialed = sum(c.values())\n    picked_up = c["answered"] + c["transferred"]\n    out[variant] = {\n        "answer_rate": picked_up / dialed,\n        "transfer_rate": c["transferred"] / picked_up if picked_up else 0.0,\n        ...\n    }',
            lang: 'python', caption: 'pipeline/calls.py. A call still in progress is left out of both rates rather than counted as a failure.' }
        ]
      },
      {
        id: 'email', label: 'Step 5 · Follow up', title: 'Email that arrives',
        blocks: [
          { p: 'Behind the calls there was a second channel, cold email for follow-ups. Email has a failure calls don’t: if the sending domain isn’t set up properly, Gmail and Outlook put the message in spam and nobody ever finds out.' },
          { p: 'I configured SPF, DKIM and DMARC on the client’s sending domains, warmed them up in Instantly.ai and Woodpecker, and watched their reputation in Google Postmaster Tools and a Looker Studio dashboard. That work happened in those tools, not in code. What is in code is the check I would run before any domain is allowed to send.' },
          { table: {
              head: ['Record', 'Passes when', 'Fails when'],
              rows: [
                ['MX', 'A mail server is listed', 'There is none, so replies bounce'],
                ['SPF', 'Exactly one `v=spf1` record, at most 10 DNS lookups', 'Two records, more than 10 lookups, or it ends in `+all`'],
                ['DMARC', 'A policy of `quarantine` or `reject`', 'Missing; `p=none` is a warning, fine only during warm-up'],
                ['DKIM', 'A public key under the selector', 'No key, or an empty `p=`, which means revoked']
              ] },
            caption: 'pipeline/deliverability.py' },
          { p: 'I also prototyped an email writer, fine-tuning FLAN-T5 and DistilGPT2 to draft a first email from a lead’s row: its name, area, rating, and what its website is missing. FLAN-T5 learns the task as translation, lead in and email out. DistilGPT2 learns it as continuation, and only what comes after the prompt is kept. It was a prototype, and it stayed one.' }
        ]
      }
    ],

    closing: {
      blocks: [
        { p: '**Write one script from day one.** Eight notebooks held one scraper, copied a dozen times, a revision a day. The last copy failed on every row because it read its table of social networks before defining it. Version control would have shown me the difference between copies, and one test would have caught the bug on the first run. The rebuild has both.' },
        { p: '**Keep keys out of the code.** Every API key and token was pasted into a cell. They have all been rotated since, but they should never have been there to rotate.' },
        { p: '**Check the summary against the source.** An analysis reporting zero completed calls out of 980 should have stopped me. A rate is only as good as the per-call outcome under it, so the rebuild counts from each call.' },
        { p: '**Measure the funnel end to end.** I measured answers and transfers, but never joined them back to the lead list. So I can’t say which areas, ratings or website gaps made an owner more likely to take the transfer, and that was the question the studio cared about most.' }
      ]
    },

    sources: [
      ['Places limits', 'Places API (New) Text Search: up to 20 results per page and 3 pages. pipeline/leads.py search().'],
      ['Notebook dates', 'Updates.ipynb section headings: 21, 22, 23 and 24 Jan 2025.'],
      ['600+ leads', 'Notebook outputs: a 600-row file for ZIP 33130 and a 710-row file for ZIP 33101. Résumé: "600+ qualified leads".'],
      ['65% and +12%', 'The owner’s résumé, from the 2025 campaign. The call records are not in the repo.'],
      ['Batch analysis', 'Untitled13.ipynb over GET /v1/batches: 34 batches, calls_requested summing to 980, calls_failed to 310; two batches 154 of 154 failed; calls_completed set to 0 wherever it was a list.'],
      ['Scrape rules', 'pipeline/enrich.py scan(), contact_page(), us_e164(); test_pipeline.py.'],
      ['Call outcomes', 'pipeline/calls.py outcome(); Bland GET /v1/calls/{id} (completed, answered_by, transferred_to); Retell get-call (call_status, disconnection_reason, call_analysis.in_voicemail).'],
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
