/* The Info section's pieces, after the "Hello." intro.

   EVERY PIECE IS SWITCHABLE. INFO_PIECES below is the whole list, in the
   order they render: delete a name and that piece is gone; move one and it
   moves. 'intro' is the static "Hello." prose already in index.html (the
   only piece that reads with JavaScript off); every other piece is written
   by this file into [data-info-pieces].

   ALL PERSONAL COPY LIVES IN `COPY`, right below, and every string in it is
   a DRAFT written by an assistant from facts already on this site. Drafts
   render inside <span class="is-draft" data-draft>, which css/info.css
   underlines with a dashed line and tags "draft", so nothing goes out in
   Akshayaa's voice by accident. To approve a line, wrap it in ok():
       night: ok('The text, as you want it.'),
   and it renders plain. Strings may use [link text](relative/url) and the
   tokens {books} {photos} {period}, filled in at run time.

   Reads hobby-data.js, project-data.js and readings-data.js, so it loads
   after them, and before script.js, whose reveal observer has to see the
   .reveal elements written here. */
var INFO_PIECES = ['intro', 'bio', 'contact', 'map', 'unknown', 'cards', 'postcard'];

(function () {
  'use strict';

  function ok(s) { return { ok: s }; }

  /* ======================= COPY: edit here ======================= */
  var COPY = {
    labels: {
      intro: ok('Hello'),
      bio: ok('The bio, by the hour'),
      contact: ok('Contact sheet'),
      map: ok('Where the photographs were taken'),
      unknown: ok('What I don’t know yet'),
      cards: ok('Questions you might have'),
      postcard: ok('A postcard')
    },

    /* 1. Four versions, keyed off data-time on <html>. Morning is the
       shortest; night is the longest and the most candid. */
    bio: {
      morning: 'Good morning. I’m Akshayaa, and I build pipelines and the interfaces that make them useful.',
      day: 'I’m Akshayaa Kashyap, an AI engineer. I build pipelines and the interfaces that make them useful: a [stock screener](work/quantamental-screener.html) that tests itself against luck, a [clean-up pipeline](work/phase-contrast-denoising.html) for microscope frames, a [gallery and shop](work/arteza.html) for a painter, and a [task app](work/habita.html) that writes to your phone’s calendar.',
      evening: 'I’m Akshayaa Kashyap. I build pipelines and the interfaces that make them useful, and I write each one up with the number that holds and the one that didn’t. Every case study on this page ends with what I’d do differently, because that is usually the most useful part. Away from a keyboard I photograph light, draw, and cook.',
      night: 'It’s late, so here is the long version. My [screener](work/quantamental-screener.html) beat SPY, and random ten-name portfolios from the same fifty stocks did most of that too: p = 0.07. My [clean-up pipeline](work/phase-contrast-denoising.html) had a setting that did nothing in 16-bit, and I only found it while writing it up. [Habita](work/habita.html) writes to your calendar, and I have never captured it doing that on a real phone. I would rather tell you here than have you find out. The rest of the time I photograph whatever the light is doing ({photos} of those are on this page), draw, which is the one thing I do with no undo, cook for the twenty-minute feedback loop, and read. There are {books} books on the shelf above.'
    },
    bioNote: ok('This is the {period} version. It follows your clock, and the greeting at the top of the page can change it.'),

    /* 4. Grease-pencil notes on the contact sheet, keyed '<gallery>-<n>'. */
    sheet: {
      edge: ok('AK 400 · SAFETY FILM'),
      header: ok('Roll 01 · 12 exposures · photography, artwork, cooking'),
      notes: {
        'photography-2': 'keeper. the reason I stopped walking',
        'photography-9': 'empty platforms, on purpose',
        'photography-15': 'keeper. too many colours to pick one',
        'photography-18': 'keeper. look up',
        'cooking-5': 'egg on top, always'
      }
    },

    /* 3. The route, one line per stop, in the order the gallery hangs them. */
    map: {
      intro: 'Every place named in my photo captions, at its real latitude and longitude, joined from north to south.',
      route: 'everywhere I stopped walking',
      stops: {
        mahabaleshwar: 'Ridgelines at the wrong hour.',
        lepakshi: 'A pillar that doesn’t quite meet the floor.',
        pune: 'Four sunsets, and a campus block after dark.',
        delhi: 'Two exhibitions, a metro platform, a lantern market and one alley.',
        ahmedabad: 'The Sabarmati, from the riverfront.',
        bengaluru: 'Three sunrises.'
      }
    },

    /* 2. What I'm learning, and how. Each one is a gap a case study admits. */
    unknown: {
      intro: 'Each of these is a gap one of my own case studies admits. I’d rather list them than have you find them.',
      items: [
        { topic: 'Testing a strategy over more than one window',
          how: 'One year is one sample. I’m learning walk-forward testing, fitting weights on a rolling window before I trust them.',
          project: 'quantamental-screener' },
        { topic: 'Point-in-time data',
          how: 'My universe was today’s fifty largest stocks, which is a list of winners. I’m learning to build it as it stood on each date.',
          project: 'quantamental-screener' },
        { topic: 'Real micrographs, not my own simulator',
          how: 'Dice against a synthetic mask only says how well I undo my own simulator. Next is real frames with hand-drawn masks.',
          project: 'phase-contrast-denoising' },
        { topic: 'Tests that prove every control moves something',
          how: 'A clip limit did nothing for months and eight tests never noticed. I’m learning to sweep a parameter and assert the output changes.',
          project: 'phase-contrast-denoising' },
        { topic: 'Shipping to a real device',
          how: 'Habita has no released APK and no capture of an event arriving in Google Calendar. I’m learning release builds and on-device checks.',
          project: 'habita' },
        { topic: 'Deployments that serve the build',
          how: 'A build can prerender every page and the live site can still serve an empty shell. I’m learning to check what is deployed, not what was built.',
          project: 'arteza' }
      ]
    },

    /* 5. Question cards: what a visitor might ask, answered from the site. */
    cards: [
      { q: 'What do you actually build?',
        a: 'Pipelines, and the interfaces that make them useful. On this page: a stock screener, a microscope clean-up pipeline, a gallery and shop for a painter, and a task app that writes to your calendar.' },
      { q: 'Which number here should I trust least?',
        a: '“Beat SPY.” Random ten-name portfolios from the same fifty stocks made +43.8% at the median, and p = 0.067. Most of the beat is survivorship, and the case study says so.' },
      { q: 'What went wrong?',
        a: 'In the phase-contrast pipeline, the CLAHE clip limit had no effect on 16-bit frames. I found it while writing the case study, not while building it.' },
      { q: 'Why does the site change colour?',
        a: 'Each day draws one of Sanzo Wada’s three-colour combinations from 1933. Every accent is then stepped until it measures as readable on the page it lands on.' },
      { q: 'Why does it follow my clock?',
        a: 'Morning, afternoon, evening and night each have their own paper. The greeting at the top of the page lets you pick a different one.' },
      { q: 'What are you reading?',
        a: 'There are {books} books on the shelf, from finance and history to fiction. Pick a spine and it comes off the shelf.' },
      { q: 'What do you do away from a keyboard?',
        a: 'Photograph whatever the light is doing, draw (the one thing I do with no undo), and cook, because you find out whether it worked in about twenty minutes.' },
      { q: 'How do I reach you?',
        a: 'Email akshayaakashyap5@gmail.com, or use the links just below. A question about any of the projects is a good start.' }
    ],

    /* 6. The postcard. */
    postcard: {
      message: 'Thanks for reading this far. I don’t know where you are or what time it is there, so I asked your clock: it’s on the postmark. If anything here made you curious, write back.',
      sign: 'Akshayaa',
      to: ok('To: whoever’s reading'),
      reply: ok('Write back')
    }
  };
  /* ===================== end of COPY ===================== */

  /* Which photographs go on the contact sheet, and which are circled.
     `p` marks a portrait: on real 35mm film a portrait still sits in a
     landscape frame, turned on its side, and so it does here. */
  var SHEET = [
    ['photography', 1], ['photography', 2, 'keeper'], ['photography', 3, 'p'],
    ['photography', 9, 'p'], ['photography', 11], ['photography', 7],
    ['photography', 15, 'keeper p'], ['photography', 16], ['photography', 10],
    ['photography', 18, 'keeper p'], ['artwork', 1, 'p'], ['cooking', 5]
  ];

  /* Places named in the photography captions, with real coordinates.
     `match` finds a stop's photographs in the captions, so a new caption
     naming one of these lands on the map by itself. `lab` places the label:
     r(ight) or a(bove), nudged by dx/dy. The route runs north to south. */
  var PLACES = [
    { id: 'mahabaleshwar', name: 'Mahabaleshwar', lat: 17.924, lon: 73.658, match: /Mahabaleshwar/i, lab: 'r', dx: 2, dy: 14 },
    { id: 'lepakshi', name: 'Lepakshi', lat: 13.803, lon: 77.609, match: /Lepakshi/i, lab: 'r', dy: -4 },
    { id: 'pune', name: 'Pune', lat: 18.520, lon: 73.857, match: /Pune/i, lab: 'r', dy: -3 },
    { id: 'delhi', name: 'New Delhi', lat: 28.614, lon: 77.209, match: /Delhi/i, lab: 'r' },
    { id: 'ahmedabad', name: 'Ahmedabad', lat: 23.023, lon: 72.571, match: /Ahmedabad/i, lab: 'a' },
    { id: 'bengaluru', name: 'Bengaluru', lat: 12.972, lon: 77.594, match: /Bengaluru|Bangalore/i, lab: 'r', dy: 12 }
  ];

  /* India, as depicted by the Survey of India — all of Jammu and Kashmir and
     Ladakh included. Made with Natural Earth: ne_10m_admin_0_countries_ind,
     the India point-of-view admin-0 file (public domain), simplified to
     0.08 degrees. Equirectangular, standard parallel 22N, matching proj()
     below; viewBox 0 0 547 620. ISLES are the islands too small to keep as
     shapes (Lakshadweep, small Andaman and Nicobar islands), as dots. */
  var INDIA = 'M202 82 212 85 210 90 215 95 212 99 210 98 203 103 199 97 193 99 194 105 199 111 199 124 203 125 206 121 211 130 220 131 227 135 226 139 241 146 229 155 226 162 227 166 223 173 244 183 247 187 257 193 260 192 267 196 272 196 274 200 283 203 285 201 294 203 294 201 299 200 308 204 309 209 321 215 327 213 331 219 339 218 347 222 353 218 354 222 358 223 368 221 371 223 374 215 370 208 374 195 373 191 382 188 387 193 385 199 387 204 384 207 391 214 405 216 414 212 421 215 434 213 443 214 446 212 445 208 447 204 445 201 438 199 437 193 444 196 449 193 456 193 459 190 458 187 467 183 469 178 481 176 482 173 489 170 487 167 493 164 497 167 507 169 515 163 526 165 522 168 523 171 528 170 530 176 525 182 540 183 544 186 544 190 535 198 540 208 532 203 522 205 503 218 501 224 503 229 501 232 501 235 493 242 492 246 495 249 485 273 469 269 472 276 471 287 466 289 465 296 467 305 461 311 458 307 456 310 450 276 444 276 444 280 440 285 441 288 437 291 434 285 432 288 429 277 433 268 440 265 443 267 443 263 447 262 449 252 454 251 446 246 415 247 405 244 405 230 402 226 399 231 396 230 392 227 390 222 387 222 390 225 383 225 383 222 378 218 377 221 380 223 374 227 372 233 389 244 388 247 379 246 377 253 373 252 371 257 380 264 385 264 384 271 381 277 385 280 384 285 389 286 386 290 391 307 391 311 388 311 391 318 387 315 387 317 384 318 385 307 383 311 384 306 383 306 381 319 380 319 381 314 380 311 379 318 377 316 377 318 376 315 376 314 376 319 375 307 369 302 374 308 368 315 356 319 351 323 349 328 352 334 350 334 353 336 348 340 348 344 343 346 342 350 337 347 341 351 324 357 326 352 320 354 318 360 320 357 323 356 321 358 326 356 310 367 299 384 287 392 283 398 267 407 264 411 266 412 265 418 255 424 246 423 241 434 239 429 237 436 235 432 228 436 224 448 226 459 223 466 225 465 228 481 225 475 224 478 229 481 229 486 226 499 219 515 219 522 218 523 217 524 219 523 220 544 209 545 209 549 202 561 205 564 210 564 212 567 204 564 193 568 189 572 186 583 176 588 167 583 158 572 161 570 158 571 155 563 154 560 153 551 155 560 158 559 152 548 153 545 151 546 143 523 136 512 137 511 133 510 127 494 129 492 126 493 125 477 118 459 119 460 113 454 116 452 113 453 110 448 107 442 111 443 106 439 108 437 106 437 101 429 96 398 91 386 94 385 91 381 91 379 93 381 90 376 91 373 93 375 91 372 94 370 92 367 88 371 89 364 94 366 88 362 90 359 88 359 86 353 92 335 89 327 86 328 88 326 85 322 95 315 84 317 88 310 83 310 85 306 88 307 91 305 83 305 82 303 77 304 80 305 80 308 76 310 75 311 77 313 75 312 74 314 80 317 76 326 58 335 51 336 38 327 18 304 20 300 22 305 28 301 30 303 40 299 46 288 44 291 40 290 29 295 16 290 8 281 8 278 15 272 6 278 3 278 5 277 3 275 5 271 13 271 14 263 16 265 17 264 37 267 45 262 48 262 48 265 51 265 57 262 55 258 57 256 49 242 49 237 42 236 38 230 40 219 28 215 28 207 43 190 47 190 53 196 72 191 81 175 91 169 100 151 110 146 109 143 117 132 123 128 121 126 123 121 120 116 121 113 136 105 130 101 124 101 124 93 118 95 104 88 101 60 112 52 114 48 106 46 107 40 98 38 94 32 84 32 85 25 92 21 94 16 109 16 106 12 112 14 124 9 127 12 132 10 136 12 138 16 143 16 148 21 162 27 164 33 176 37 177 40 187 39 198 33 206 33 209 30 218 34 223 33 229 40 223 57 220 57 217 62 214 61 214 66 212 70 202 70 204 77 202 78ZM479 605 480 614 479 615 476 610 476 606ZM477 601 477 603 475 605ZM470 590 472 593 469 591ZM473 589 472 587 473 585 473 586ZM459 565 460 567 459 567ZM455 532 455 540 452 539 453 533ZM464 478 464 489 461 492 463 500 461 501 462 503 459 508 458 520 455 513 457 513 458 506 460 506 459 494ZM372 316 373 313 374 313 373 317Z';
  var ISLES = '78 533 84 534 86 539 87 516 88 528 89 526 93 520 94 585 105 533 105 547 105 548 240 434 373 312 383 313 387 319 450 519 457 522 458 492 464 477 464 510 465 507 465 585 474 590 475 580 480 505 487 481';
  var LON0 = 68, LAT1 = 37.5, K = 20, CX = Math.cos(22 * Math.PI / 180);
  function proj(lat, lon) { return [(lon - LON0) * CX * K, (LAT1 - lat) * K]; }

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PERIOD_NAME = { morning: 'morning', day: 'afternoon', evening: 'evening', night: 'night' };

  /* ---------- copy rendering ---------- */
  function vars() {
    var books = 0;
    if (typeof readings !== 'undefined' && readings.groups) {
      readings.groups.forEach(function (g) { books += g.books.length; });
    }
    var photos = (typeof hobbies !== 'undefined' && hobbies.photography) ? hobbies.photography.n : 0;
    return { books: books, photos: photos, period: PERIOD_NAME[root.getAttribute('data-time')] || 'afternoon' };
  }

  /* A COPY entry as HTML: escaped first, then links and tokens, then the
     draft wrapper unless the entry was approved with ok(). */
  function t(entry, svg) {
    var approved = entry && typeof entry === 'object' && 'ok' in entry;
    var s = approved ? entry.ok : entry;
    var v = vars();
    var html = esc(s)
      .replace(/\{(books|photos|period)\}/g, function (m, k) { return esc(v[k]); })
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, text, href) {
        return '<a href="' + safeUrl(href) + '">' + text + '</a>';
      });
    var tag = svg ? 'tspan' : 'span';
    return approved ? html : '<' + tag + ' class="is-draft" data-draft>' + html + '</' + tag + '>';
  }

  function caption(g, i) {
    var G = hobbies[g];
    return (G && G.captions && G.captions[i - 1]) || (G ? G.label + ' ' + i : '');
  }
  function photoHref(g, i) { return 'hobby.html?id=' + encodeURIComponent(g) + '&i=' + i; }

  /* Photo links open the popover when it is on the page; they stay real
     links for middle-click, keyboard modifiers and no-JS. */
  function wirePhotos(host) {
    host.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-gal]');
      if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!window.portfolioLightbox) return;
      if (window.portfolioLightbox.open(a.getAttribute('data-gal'), +a.getAttribute('data-i'))) e.preventDefault();
    });
  }

  /* ---------- 1. the bio, by the hour ---------- */
  function bio(el) {
    el.innerHTML = '<p class="ib__text" data-bio></p><p class="ib__note" data-bio-note></p>';
    var text = el.querySelector('[data-bio]'), note = el.querySelector('[data-bio-note]');
    var shown = null;
    function paint() {
      var p = root.getAttribute('data-time') || 'day';
      if (p === shown) return;
      shown = p;
      el.setAttribute('data-period', p);
      text.innerHTML = t(COPY.bio[p] || COPY.bio.day);
      note.innerHTML = t(COPY.bioNote);
    }
    paint();
    new MutationObserver(paint).observe(root, { attributes: true, attributeFilter: ['data-time'] });
  }

  /* ---------- 4. the contact sheet ---------- */
  var CIRCLE = 'M52 6C78 3 98 14 97 31S73 59 47 58 2 46 4 29 28 7 60 5';
  var ARROW = 'M4 28C8 16 16 8 28 3M28 3l-10 1M28 3l-4 9';
  function contact(el) {
    var notes = COPY.sheet.notes;
    var cells = SHEET.map(function (f, k) {
      var g = f[0], i = f[1], flags = f[2] || '', n = k + 1;
      var cap = caption(g, i), key = g + '-' + i;
      var keeper = /keeper/.test(flags);
      return '<li class="cs__cell' + (keeper ? ' is-keeper' : '') + '">' +
        '<span class="cs__edge" aria-hidden="true">' + (k % 3 === 0 ? t(COPY.sheet.edge) : '') + '</span>' +
        '<a class="cs__frame' + (flags.split(' ').indexOf('p') >= 0 ? ' is-portrait' : '') + '" href="' + photoHref(g, i) + '"' +
          ' data-gal="' + esc(g) + '" data-i="' + i + '" data-cue="Open the photograph">' +
          '<img src="public/assets/hobbies/' + esc(key) + '-600.webp" alt="' + esc(cap) + '" loading="lazy" decoding="async">' +
        '</a>' +
        '<span class="cs__no" aria-hidden="true">▸' + n + '<span>' + n + 'A</span></span>' +
        (keeper ? '<svg class="cs__circle" viewBox="0 0 100 62" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path pathLength="1" d="' + CIRCLE + '"/></svg>' : '') +
        (notes[key] ? '<span class="cs__note"><svg class="cs__arrow" viewBox="0 0 34 30" aria-hidden="true" focusable="false"><path d="' + ARROW + '"/></svg>' + t(notes[key]) + '</span>' : '') +
        '</li>';
    }).join('');
    el.innerHTML = '<p class="cs__head" aria-hidden="true">' + t(COPY.sheet.header) + '</p>' +
      '<ol class="cs" aria-label="Contact sheet: twelve photographs">' + cells + '</ol>';
    // The circles are drawn on the film, not the page, so they are measured
    // against the film (the halo figure's precedent).
    if (window.portfolioPalette) {
      window.portfolioPalette.on(function () {
        el.style.setProperty('--pencil', window.portfolioPalette.against(0, 3, '#141210'));
      });
    }
    wirePhotos(el);
  }

  /* ---------- 3. the map ---------- */
  function map(el) {
    var caps = (hobbies.photography && hobbies.photography.captions) || [];
    var stops = PLACES.map(function (p) {
      var xy = proj(p.lat, p.lon);
      var shots = [];
      caps.forEach(function (c, i) { if (p.match.test(c)) shots.push(i + 1); });
      return { p: p, x: Math.round(xy[0] * 10) / 10, y: Math.round(xy[1] * 10) / 10, shots: shots };
    }).filter(function (s) { return s.shots.length; });
    // North to south. (The gallery's own order zigzags across the country
    // and draws the route over itself.)
    stops.sort(function (a, b) { return b.p.lat - a.p.lat; });

    // A gently bowed line between stops, so the route reads as drawn.
    var d = '';
    stops.forEach(function (s, k) {
      if (!k) { d = 'M' + s.x + ' ' + s.y; return; }
      var a = stops[k - 1], mx = (a.x + s.x) / 2, my = (a.y + s.y) / 2;
      var dx = s.x - a.x, dy = s.y - a.y, bow = 0.16;
      d += ' Q' + Math.round(mx - dy * bow) + ' ' + Math.round(my + dx * bow) + ' ' + s.x + ' ' + s.y;
    });

    var grat = '';
    for (var lon = 70; lon <= 95; lon += 5) { var gx = proj(0, lon)[0].toFixed(1); grat += 'M' + gx + ' 0V620'; }
    for (var lat = 10; lat <= 35; lat += 5) { var gy = proj(lat, 0)[1]; grat += 'M0 ' + gy + 'H547'; }

    var isles = ISLES.split(' ');
    var dots = '';
    for (var j = 0; j < isles.length; j += 2) dots += '<circle cx="' + isles[j] + '" cy="' + isles[j + 1] + '" r="1.6"/>';

    var marks = stops.map(function (s, k) {
      var p = s.p, lx = s.x, ly = s.y, anchor = 'middle';
      if (p.lab === 'r') { lx += 11 + (p.dx || 0); ly += 5 + (p.dy || 0); anchor = 'start'; }
      else ly -= 13;
      return '<a class="im__stop" data-stop="' + esc(p.id) + '" href="' + photoHref('photography', s.shots[0]) + '" tabindex="-1"' +
          ' data-gal="photography" data-i="' + s.shots[0] + '" data-cue="' + esc(p.name) + '">' +
        '<circle class="im__dot" cx="' + s.x + '" cy="' + s.y + '" r="8.5"/>' +
        '<text class="im__n" x="' + s.x + '" y="' + (s.y + 3.6) + '">' + (k + 1) + '</text>' +
        '<text class="im__lab" x="' + lx + '" y="' + ly + '" text-anchor="' + anchor + '">' + esc(p.name) + '</text>' +
        '</a>';
    }).join('');

    var svg = '<svg class="im__svg" viewBox="0 0 547 620" aria-hidden="true" focusable="false">' +
      '<path class="im__grat" d="' + grat + '"/>' +
      '<path class="im__land" d="' + INDIA + '"/>' +
      '<g class="im__isles">' + dots + '</g>' +
      '<path class="im__route" d="' + d + '"/>' +
      marks + '</svg>';

    var list = stops.map(function (s, k) {
      var chips = s.shots.map(function (i) {
        return '<a class="im__shot" href="' + photoHref('photography', i) + '" data-gal="photography" data-i="' + i + '"' +
          ' aria-label="' + esc(caption('photography', i)) + '" title="' + esc(caption('photography', i)) + '">' + i + '</a>';
      }).join('');
      return '<li class="im__item" data-stop="' + esc(s.p.id) + '"><span class="im__num" aria-hidden="true">' + (k + 1) + '</span>' +
        '<span class="im__name">' + esc(s.p.name) + '</span> ' +
        '<span class="im__line">' + t(COPY.map.stops[s.p.id] || '') + '</span>' +
        '<span class="im__shots">Photographs ' + chips + '</span></li>';
    }).join('');

    // The route's own line, in grease pencil out in the Arabian Sea.
    var note = '<p class="im__note"><svg class="cs__arrow" viewBox="0 0 34 30" aria-hidden="true" focusable="false"><path d="' + ARROW + '"/></svg>' + t(COPY.map.route) + '</p>';
    el.innerHTML = '<div class="im"><figure class="im__fig">' + svg + note +
        '<figcaption class="im__credit">Outline: India as depicted by the Survey of India. Made with Natural Earth.</figcaption></figure>' +
      '<div class="im__side"><p class="im__intro">' + t(COPY.map.intro) + '</p><ol class="im__list">' + list + '</ol></div></div>';

    // Pointing at a stop in the list lights its dot, and the other way round.
    function light(id) {
      Array.prototype.forEach.call(el.querySelectorAll('[data-stop]'), function (n) {
        n.classList.toggle('is-lit', n.getAttribute('data-stop') === id);
      });
    }
    el.addEventListener('pointerover', function (e) {
      var s = e.target.closest && e.target.closest('[data-stop]');
      light(s ? s.getAttribute('data-stop') : null);
    });
    el.addEventListener('pointerleave', function () { light(null); });
    el.addEventListener('focusin', function (e) {
      var s = e.target.closest && e.target.closest('[data-stop]');
      light(s ? s.getAttribute('data-stop') : null);
    });
    el.addEventListener('focusout', function () { light(null); });
    wirePhotos(el);
  }

  /* ---------- 2. what I don't know yet ---------- */
  function unknown(el) {
    var titles = {};
    if (typeof projects !== 'undefined') projects.forEach(function (p) { titles[p.id] = p.title; });
    el.innerHTML = '<p class="iu__intro">' + t(COPY.unknown.intro) + '</p><ol class="iu">' +
      COPY.unknown.items.map(function (it) {
        return '<li class="iu__item"><p class="iu__topic">' + t(it.topic) + '</p>' +
          '<p class="iu__how">' + t(it.how) + '</p>' +
          (titles[it.project] ? '<a class="iu__from" href="work/' + encodeURIComponent(it.project) + '.html">From ' + esc(titles[it.project]) + ' →</a>' : '') +
          '</li>';
      }).join('') + '</ol>';
  }

  /* ---------- 5. question cards ---------- */
  function cards(el) {
    var deck = COPY.cards.map(function (c, i) { return i; });
    var at = 0;
    el.innerHTML =
      '<div class="qc__stage">' +
        '<span class="qc__under" aria-hidden="true"></span><span class="qc__under" aria-hidden="true"></span>' +
        '<button type="button" class="qc" aria-pressed="false" data-cue="Turn it over">' +
          '<span class="qc__inner">' +
            '<span class="qc__face qc__face--q"><span class="qc__k">Q.</span><span class="qc__q" data-q></span><span class="qc__hint">Turn over</span></span>' +
            '<span class="qc__face qc__face--a" aria-hidden="true"><span class="qc__k">A.</span><span class="qc__a" data-a></span></span>' +
          '</span>' +
        '</button>' +
      '</div>' +
      '<div class="qc__bar">' +
        '<span class="qc__count" data-count aria-live="polite"></span>' +
        '<button type="button" class="qc__btn" data-next>Next card</button>' +
        '<button type="button" class="qc__btn" data-shuffle>Shuffle</button>' +
      '</div>';
    var card = el.querySelector('.qc'), q = el.querySelector('[data-q]'), a = el.querySelector('[data-a]');
    var fq = el.querySelector('.qc__face--q'), fa = el.querySelector('.qc__face--a'), count = el.querySelector('[data-count]');
    function flip(on) {
      card.classList.toggle('is-flipped', on);
      card.setAttribute('aria-pressed', on ? 'true' : 'false');
      card.setAttribute('data-cue', on ? 'Back to the question' : 'Turn it over');
      // Only the face showing names the button.
      fq.setAttribute('aria-hidden', on ? 'true' : 'false');
      fa.setAttribute('aria-hidden', on ? 'false' : 'true');
    }
    function show() {
      var c = COPY.cards[deck[at]];
      q.innerHTML = t(c.q);
      a.innerHTML = t(c.a);
      flip(false);
      count.textContent = 'Card ' + (at + 1) + ' of ' + deck.length;
    }
    card.addEventListener('click', function () { flip(!card.classList.contains('is-flipped')); });
    function deal() {
      if (reduce) { show(); return; }
      card.classList.add('is-dealt');
      setTimeout(function () { show(); card.classList.remove('is-dealt'); }, 180);
    }
    el.querySelector('[data-next]').addEventListener('click', function () { at = (at + 1) % deck.length; deal(); });
    el.querySelector('[data-shuffle]').addEventListener('click', function () {
      for (var i = deck.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1)), x = deck[i]; deck[i] = deck[j]; deck[j] = x;
      }
      at = 0; deal();
    });
    show();
  }

  /* ---------- 6. the postcard ---------- */
  function postcard(el) {
    var P = COPY.postcard;
    var idx = window.portfolioPalette ? window.portfolioPalette.index() : null;
    var zone = '';
    try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    var ring = ((zone ? zone.replace(/_/g, ' ') : 'Your clock') + ' · your local time · ').toUpperCase();
    el.innerHTML =
      '<div class="pc">' +
        '<div class="pc__msg"><p class="pc__text">' + t(P.message) + '</p>' +
          '<p class="pc__sign">' + t(P.sign) + '</p></div>' +
        '<div class="pc__back">' +
          '<div class="pc__stamp" aria-hidden="true"><span class="pc__art">' +
            '<span class="pc__sun"></span><span class="pc__hill"></span><span class="pc__band"></span>' +
            '<span class="pc__val">' + (idx == null ? 'Wada' : 'No. ' + (idx + 1)) + '</span>' +
            '<span class="pc__yr">Wada · 1933</span></span></div>' +
          '<svg class="pc__mark" viewBox="0 0 220 140" role="img" aria-labelledby="pc-when">' +
            '<title id="pc-when"></title>' +
            '<path class="pc__waves" d="M0 46q14-8 28 0t28 0 28 0 28 0M0 62q14-8 28 0t28 0 28 0 28 0M0 78q14-8 28 0t28 0 28 0 28 0M0 94q14-8 28 0t28 0 28 0 28 0"/>' +
            '<circle class="pc__ring" cx="150" cy="70" r="60"/><circle class="pc__ring" cx="150" cy="70" r="43"/>' +
            '<path id="pc-arc" fill="none" d="M150 70m-51.5 0a51.5 51.5 0 1 1 103 0a51.5 51.5 0 1 1-103 0"/>' +
            '<text class="pc__arc"><textPath href="#pc-arc" textLength="318" lengthAdjust="spacing">' + esc(ring) + '</textPath></text>' +
            '<text class="pc__day" x="150" y="62" data-pm-day></text>' +
            '<text class="pc__yr2" x="150" y="78" data-pm-yr></text>' +
            '<text class="pc__time" x="150" y="96" data-pm-time></text>' +
          '</svg>' +
          '<p class="pc__to">' + t(P.to) + '</p>' +
          '<span class="pc__line" aria-hidden="true"></span><span class="pc__line" aria-hidden="true"></span>' +
          '<a class="pc__reply" href="#contact">' + t(P.reply) + ' →</a>' +
        '</div>' +
      '</div>';
    var day = el.querySelector('[data-pm-day]'), yr = el.querySelector('[data-pm-yr]');
    var tm = el.querySelector('[data-pm-time]'), title = el.querySelector('#pc-when');
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function stamp() {
      var d = new Date();
      var mon = d.toLocaleString('en-GB', { month: 'short' }).toUpperCase().slice(0, 3);
      day.textContent = d.getDate() + ' ' + mon;
      yr.textContent = String(d.getFullYear());
      tm.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes());
      title.textContent = 'Postmark: your local time, ' + d.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' });
      // Tick on the minute, not every 60s from whenever the page loaded.
      setTimeout(stamp, 60000 - (d.getSeconds() * 1000 + d.getMilliseconds()) + 50);
    }
    stamp();
  }

  var BUILD = { bio: bio, contact: contact, map: map, unknown: unknown, cards: cards, postcard: postcard };

  function init() {
    var host = document.querySelector('[data-info-pieces]');
    if (!host || typeof esc !== 'function') return;
    var intro = document.querySelector('.info__intro');
    if (intro && INFO_PIECES.indexOf('intro') < 0) intro.hidden = true;
    var n = 0;
    INFO_PIECES.forEach(function (name) {
      if (name !== 'intro' && !BUILD[name]) return;
      if (name === 'intro' && !intro) return;
      if (name !== 'intro') n++;
      var wrap = document.createElement('section');
      wrap.className = 'ip ip--' + name;
      // The intro is its own heading ("Hello."), so it carries no label.
      if (name !== 'intro') {
        wrap.setAttribute('aria-labelledby', 'ip-' + name);
        wrap.innerHTML = '<h3 class="ip__label reveal" id="ip-' + name + '"><span class="ip__no">' + (n < 10 ? '0' : '') + n + '</span>' + t(COPY.labels[name] || name) + '</h3>';
      }
      if (name === 'intro') {
        wrap.appendChild(intro);   // keeps its own .reveal
      } else {
        var body = document.createElement('div');
        body.className = 'ip__body reveal';
        wrap.appendChild(body);
        try { BUILD[name](body); } catch (err) { wrap.remove(); return; }
      }
      host.appendChild(wrap);
    });
  }

  window.onReady(init);
})();
