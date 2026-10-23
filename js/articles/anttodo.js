/* Ant Colony Task Scheduler — "You vs the colony".
   The form is a game: the reader schedules the real sample day first, then
   each round opens one part of the machine that beat (or tied) them.

   The sample data, the cost functions, the η normalisation and 2-opt below
   are ported from github.com/akshayaa-403/anttodo index.html (HEAD 14a4446),
   line for line apart from being lifted out of the class. Everything
   precomputed (the 10! histogram, the 20-seed strips, the seed-1337 staircase)
   was produced by running that same code in Node 24 on 2026-10-17. */
(function () {
  'use strict';

  /* ---------- ported verbatim from index.html ---------- */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmtHM = (m) => {
    m = Math.round(m);
    const h = Math.floor(m / 60) % 24, mm = m % 60;
    return String(h).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
  };
  function sampleFocus() {
    const T = (name, category, duration, priority, load, due) =>
      ({ name, category, duration, priority, load, due });
    return [
      T("Finish quarterly report", "work",    90, 10, 9, 17 * 60),
      T("Reply to client emails",  "work",    30,  7, 4, 12 * 60),
      T("Team standup",            "work",    15,  6, 3, 10 * 60),
      T("Code review for Priya",   "work",    45,  8, 8, 15 * 60),
      T("Gym session",             "health",  60,  4, 2, null),
      T("Grocery run",             "errands", 40,  5, 2, null),
      T("Pay electricity bill",    "admin",   10,  9, 2, 16 * 60),
      T("Meal prep for the week",  "home",    50,  3, 3, null),
      T("Call Mum",                "social",  25,  6, 1, null),
      T("Plan sprint backlog",     "work",    40,  7, 8, null),
    ];
  }
  function sampleErrand() {
    const P = (name, category, lat, lon, duration) =>
      ({ name, category, lat, lon, duration, priority: 5, load: 3, due: null });
    return [
      P("Post office",       "errands", 12.9716, 77.5946, 15),
      P("Farmers market",    "errands", 12.9784, 77.6408, 30),
      P("Hardware store",    "errands", 12.9352, 77.6245, 20),
      P("Pharmacy",          "health",  12.9611, 77.6387, 10),
      P("Bank branch",       "admin",   12.9250, 77.5938, 25),
      P("Dry cleaner",       "errands", 12.9899, 77.5730, 10),
      P("Bookshop",          "social",  12.9550, 77.6100, 20),
      P("Petrol station",    "errands", 12.9420, 77.5750, 10),
    ];
  }
  function haversine(a, b) {
    const R = 6371, toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon);
    const la1 = toRad(a.lat), la2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function makeErrandModel(tasks) {
    const n = tasks.length;
    const D = Array.from({ length: n }, () => new Float64Array(n));
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) D[i][j] = i === j ? 0 : haversine(tasks[i], tasks[j]);
    return {
      kind: "errand", dist: D, closed: true, unit: "km",
      cost(seq) {
        if (seq.length < 2) return 0;
        let t = 0;
        for (let i = 0; i < seq.length - 1; i++) t += D[seq[i]][seq[i + 1]];
        return t + D[seq[seq.length - 1]][seq[0]];
      },
    };
  }
  function makeFocusModel(tasks, weights, dayStart = 9 * 60, dayLen = 8 * 60) {
    const n = tasks.length;
    const D = Array.from({ length: n }, () => new Float64Array(n));
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        D[i][j] = i === j ? 0 : tasks[i].category === tasks[j].category ? 0 : 1;

    function parts(seq) {
      let clock = dayStart;
      const p = { deadline: 0, priority: 0, context: 0, energy: 0 };
      for (let k = 0; k < seq.length; k++) {
        const t = tasks[seq[k]], dur = t.duration ?? 30, finish = clock + dur;
        if (t.due != null && finish > t.due) p.deadline += ((finish - t.due) / 60) * t.priority;
        const pr = seq.length > 1 ? k / (seq.length - 1) : 0;
        p.priority += t.priority * pr;
        if (k > 0) p.context += D[seq[k - 1]][seq[k]] * 2;
        const mid = clock + dur / 2;
        p.energy += t.load * clamp((mid - dayStart) / dayLen, 0, 1);
        clock = finish;
      }
      return p;
    }
    return {
      kind: "focus", dist: D, closed: false, unit: "penalty", dayStart, dayLen,
      cost(seq) {
        const p = parts(seq);
        return weights.deadline * p.deadline + weights.priority * p.priority
             + weights.context * p.context + weights.energy * p.energy;
      },
      breakdown: parts,
      schedule(seq) {
        let clock = dayStart;
        return seq.map((i) => {
          const t = tasks[i], start = clock, end = clock + (t.duration ?? 30);
          clock = end;
          return { idx: i, start, end, late: t.due != null && end > t.due };
        });
      },
    };
  }
  /* ACO constructor, index.html:563-571: η normalised by the largest distance. */
  function etaOf(model, n) {
    const eta = Array.from({ length: n }, () => new Float64Array(n));
    let maxD = 0;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) if (i !== j) maxD = Math.max(maxD, model.dist[i][j]);
    const scale = maxD > 0 ? maxD : 1;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        eta[i][j] = i === j ? 0 : 1 / (model.dist[i][j] / scale + 0.1);
    return eta;
  }
  /* ACO.localSearch, index.html:633-647, without the dependency check (no
     dependencies here) and with one hook, onStep, so each accepted reversal
     can be replayed. */
  function localSearch(model, seq, onStep) {
    let best = seq.slice(), bc = model.cost(best), improved = true, guard = 0;
    while (improved && guard++ < 40) {
      improved = false;
      for (let i = 0; i < best.length - 1 && !improved; i++)
        for (let k = i + 1; k < best.length && !improved; k++) {
          const cand = best.slice(0, i).concat(best.slice(i, k + 1).reverse(), best.slice(k + 1));
          const cc = model.cost(cand);
          if (cc < bc - 1e-12) { best = cand; bc = cc; improved = true; if (onStep) onStep(i, k, cc, best.slice()); }
        }
    }
    return best;
  }

  /* ---------- the day, and what was measured about it ---------- */
  const TASKS = sampleFocus();
  const SHORT = ['Quarterly report', 'Client emails', 'Team standup', 'Code review', 'Gym',
                 'Grocery run', 'Pay bill', 'Meal prep', 'Call Mum', 'Sprint backlog'];
  const CAT_ORDER = ['work', 'health', 'errands', 'admin', 'home', 'social'];
  const GLYPH = { work: '●', health: '▲', errands: '■', admin: '◆', home: '▼', social: '★' };
  const ONES = { deadline: 1, priority: 1, context: 1, energy: 1 };
  const BASE = makeFocusModel(TASKS, ONES);
  const ENTERED = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const COLONY = [6, 2, 3, 9, 1, 0, 8, 5, 7, 4];   // seed 1337, 20 ants, 2-opt on
  const OPT = BASE.cost(COLONY);                   // 50.1458…
  const N_ORDERS = 3628800;
  /* Every one of the 10! orders scored at weights (1,1,1,1), counted in
     0.1-point bins from 50.0 (bin k holds costs in [50 + k/10, 50 + (k+1)/10)). */
  const FINE = [0,2,5,6,6,19,20,23,23,39,36,50,49,68,63,82,87,97,99,110,114,119,122,108,125,128,141,144,175,173,206,215,254,269,283,300,324,377,370,369,415,468,514,465,465,513,552,494,523,506,550,537,536,554,563,583,635,672,691,710,771,860,893,948,928,1053,1099,1212,1210,1221,1309,1416,1472,1469,1461,1512,1634,1602,1706,1639,1715,1818,1814,1853,1822,1881,1935,2002,1994,1941,2059,2205,2204,2254,2227,2405,2435,2438,2430,2460,2593,2601,2582,2727,2597,2761,2788,2962,3011,3057,3037,3162,3222,3210,3195,3368,3320,3439,3458,3418,3577,3636,3694,3666,3711,3815,3907,3968,4051,3898,4112,4175,4232,4299,4285,4325,4389,4509,4430,4320,4423,4615,4661,4685,4602,4762,4771,4763,4737,4523,4783,4663,4855,4913,4824,5014,5053,5067,5113,4910,5163,5130,5223,5083,5102,5248,5197,5241,5180,5228,5189,5270,5102,5161,5064,5321,5176,5278,5304,5127,5326,5423,5426,5280,5327,5504,5563,5451,5514,5413,5579,5527,5605,5532,5399,5678,5706,5837,5833,5597,5799,5833,5773,5793,5630,5775,5716,5886,5723,5445,5674,5826,5828,5635,5584,5761,5759,5791,5718,5611,5856,5793,5765,5870,5614,5915,5906,5881,5987,5643,5994,5967,6037,6011,5890,6176,6004,6047,6063,5928,5988,6152,6174,6114,6020,6170,6258,6088,6256,6022,6164,6235,6230,6217,5943,6259,6331,6358,6369,6176,6286,6278,6305,6328,6093,6321,6318,6416,6332,6105,6264,6262,6399,6282,6228,6464,6517,6484,6530,6203,6541,6387,6458,6464,6319,6629,6473,6539,6567,6443,6582,6544,6728,6697,6489,6793,6743,6789,6742,6524,6846,6785,6800,7050,6572,6971,6854,7164,6955,6803,6904,6967,7071,7071,6783,6989,7338,7163,7026,6919,7055,7097,6913,7044,6849,7087,7087,7136,7048,6998,7051,7121,7146,7041,6918,7149,7115,7071,7163,7022,7179,7256,7286,7304,6987,7157,7230,7248,7151,7032,7304,7267,7450,7250,7025,7265,7372,7300,7553,7140,7384,7250,7554,7418,7298,7493,7487,7629,7656,7484,7757,7676,7679,7804,7532,7762,7663,7883,7684,7562,7797,7905,8004,7811,7698,7629,7852,7764,7934,7589,7932,7951,8067,8022,7827,7972,8063,8023,8027,7704,8057,8108,8113,8146,7830,8319,8250,8315,8311,8088,8256,8297,8302,8215,7971,8209,8348,8441,8236,8057,8311,8358,8136,8385,7979,8289,8046,8157,8195,7956,8051,8089,8148,8035,7668,7949,8033,8024,8097,7804,8002,8038,8163,7949,7956,8037,8048,8213,8077,7920,8070,8124,8200,8003,7892,7923,7970,7964,7924,7564,7670,7801,7785,7794,7596,7719,7834,7708,7565,7434,7676,7624,7590,7580,7318,7532,7628,7587,7545,7302,7564,7461,7588,7406,7208,7423,7470,7435,7435,7224,7390,7354,7231,7181,7242,7230,7209,7331,7137,6908,7136,7077,7064,7010,6781,6961,6809,6885,6864,6767,6658,6699,6860,6556,6508,6647,6581,6550,6544,6295,6607,6446,6469,6168,6167,6132,6322,6166,6201,5960,6195,6035,5927,5953,5620,5899,5920,5861,5652,5616,5641,5702,5483,5657,5359,5613,5415,5485,5367,5082,5364,5428,5267,5256,5083,5129,5070,5191,4971,4943,4988,4951,4958,4855,4663,4730,4783,4845,4612,4536,4572,4455,4520,4455,4263,4291,4248,4370,4178,4092,4157,4094,4051,4079,3894,4053,4043,3928,3918,3736,3844,3803,3846,3644,3575,3679,3685,3638,3655,3464,3480,3567,3529,3492,3233,3472,3325,3427,3328,3317,3349,3345,3277,3209,3100,3252,3220,3196,3204,3126,3155,3140,3117,3054,3034,3086,3001,3254,3095,2977,3117,3116,3088,3028,2904,2965,2918,3012,3017,2888,3041,2884,2985,2920,2837,2806,2846,2823,2895,2717,2879,2906,2946,2838,2782,2818,2871,2817,2809,2782,2895,2789,2834,2767,2586,2691,2744,2693,2675,2559,2684,2632,2601,2569,2449,2541,2540,2501,2512,2443,2534,2452,2485,2452,2284,2482,2377,2426,2371,2300,2404,2321,2395,2365,2256,2378,2302,2398,2272,2193,2161,2285,2236,2218,2177,2234,2181,2202,2139,2154,2160,2223,2261,2175,2160,2099,2199,2238,2168,2060,2248,2284,2221,2195,2212,2217,2246,2202,2177,2140,2105,2121,2191,2121,2151,2058,2160,2109,2079,1999,1990,1961,1886,1967,1816,1829,1823,1793,1739,1619,1662,1635,1623,1523,1444,1535,1432,1389,1327,1296,1265,1222,1238,1144,1050,1093,1033,1012,885,850,833,830,756,712,724,681,674,661,605,568,526,510,468,460,419,421,381,347,358,292,305,266,255,244,223,190,175,162,129,118,104,97,79,77,58,55,43,37,32,27,23,19,18,11,7,5,7,5,1,2,2,2];
  /* Range of each raw term over all 10! orders (brute force). */
  const TERM_MAX = { deadline: 59, priority: 39, context: 18, energy: 23.4896 };
  const TERM_MIN = { deadline: 0, priority: 26, context: 10, energy: 11.9479 };
  const TERMS = [
    ['deadline', 'Deadline pressure', '▲'], ['priority', 'Priority inversion', '■'],
    ['context', 'Context switching', '●'], ['energy', 'Cognitive load', '◆']];
  /* Seed 1337, 20 ants, 2-opt off: best-so-far changes at these iterations. */
  const STAIR = [[1, 53.656], [2, 53.330], [3, 52.045], [5, 51.253], [30, 50.799], [37, 50.549]];
  /* Final best after 100 iterations, seeds 1–20, per ant count. */
  const STRIP = {"off4":[51.038,51.146,51.069,51.066,50.84,51.538,50.576,50.646,50.681,51.34,50.639,51.385,51.205,50.653,50.326,50.201,51.5,50.785,50.813,50.983],"off10":[50.5,50.313,50.264,50.563,50.549,50.667,50.528,50.563,50.618,50.5,50.59,50.146,50.5,50.781,50.236,50.549,50.66,50.41,50.983,50.983],"off20":[50.5,50.264,50.264,50.576,51.149,50.528,50.264,50.639,50.583,50.41,50.604,50.41,50.528,50.955,50.236,50.563,50.826,50.5,50.146,50.236],"off60":[50.146,50.201,50.264,50.146,50.236,50.146,50.528,50.146,50.146,50.264,50.146,50.403,50.59,50.146,50.236,50.146,50.5,50.146,50.528,50.174],"off120":[50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.313,50.5,50.146,50.146,50.146,50.146,50.146,50.146,50.201,50.146,50.146],"on4":[50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146],"on10":[50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146],"on20":[50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146],"on60":[50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146],"on120":[50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146,50.146]};

  function worseThan(c) {
    const b = Math.floor((c - 50) * 10);
    if (b < 0) return N_ORDERS;
    let worse = 0;
    for (let k = b + 1; k < FINE.length; k++) worse += FINE[k];
    if (b < FINE.length) worse += FINE[b] * (1 - ((c - 50) * 10 - b));
    return worse;
  }
  function pctText(c) {
    if (Math.abs(c - OPT) < 1e-9) return 'the best of all 3,628,800';
    const p = 100 * worseThan(c) / N_ORDERS;
    return (p > 99.9 ? p.toFixed(2) : p.toFixed(1)) + '%';
  }
  function catColor(colors, cat) { return colors.series[CAT_ORDER.indexOf(cat)] || colors.inkMuted; }
  function f3(v) { return v.toFixed(3); }

  /* ======================================================================
     Widgets
     ====================================================================== */

  /* ---- Round 1: Beat the colony ---- */
  function game(host, kit) {
    const el = kit.el;
    let order = ENTERED.slice();
    const W = Object.assign({}, ONES);
    host.classList.add('an-game');

    const rTotal = kit.readout('Your day costs', '', 'k-readout--accent');
    const rPct = kit.readout('Better than', '');
    const rLate = kit.readout('Late tasks', '');
    const rCol = kit.readout('The colony', f3(OPT));
    host.appendChild(el('div', { class: 'k-row an-game__score' }, rTotal.el, rPct.el, rLate.el, rCol.el));

    // Axis row, then the day.
    const axis = el('div', { class: 'an-row an-row--axis', 'aria-hidden': 'true' },
      el('span'), el('span', { class: 'an-axis__k', text: 'Order · task' }),
      el('div', { class: 'an-axis' }, [9, 11, 13, 15, 17].map(function (h) {
        return el('span', { style: { left: ((h - 9) / 8 * 100) + '%' }, text: h + ':00' });
      })));
    const list = el('ol', { class: 'an-day', 'aria-label': 'Your day, in order' });
    host.appendChild(axis);
    host.appendChild(list);

    const rows = TASKS.map(function (t, i) {
      const bar = el('span', { class: 'an-bar' });
      const due = t.due != null ? el('span', { class: 'an-due', title: 'due ' + fmtHM(t.due),
        style: { left: ((t.due - 540) / 480 * 100) + '%' } }) : null;
      const late = el('span', { class: 'an-latetag' });
      const time = el('span', { class: 'an-time' });
      const up = el('button', { type: 'button', class: 'an-mv', 'aria-label': 'Move ' + t.name + ' earlier', text: '↑',
        on: { click: function () { move(i, -1, up); } } });
      const down = el('button', { type: 'button', class: 'an-mv', 'aria-label': 'Move ' + t.name + ' later', text: '↓',
        on: { click: function () { move(i, 1, down); } } });
      const grip = el('span', { class: 'an-grip', 'aria-hidden': 'true', title: 'Drag to reorder', text: '⋮⋮' });
      const meta = [t.duration + 'm', 'p' + t.priority, 'load ' + t.load].concat(t.due != null ? ['due ' + fmtHM(t.due)] : []).join(' · ');
      const li = el('li', { class: 'an-row', 'data-i': i },
        el('span', { class: 'an-ctl' }, grip, up, down),
        el('span', { class: 'an-name' },
          el('span', { class: 'an-glyph', 'data-cat': t.category, text: GLYPH[t.category] }),
          el('span', { class: 'an-name__t', text: t.name }),
          el('span', { class: 'an-name__m' }, time, ' · ' + meta)),
        el('span', { class: 'an-track' }, bar, due, late));
      wireDrag(grip, i);
      return { li: li, bar: bar, late: late, time: time, up: up, down: down };
    });

    // Meters
    const meterEls = {};
    const meters = el('div', { class: 'an-meters' }, TERMS.map(function (t) {
      const fill = el('span', { class: 'an-meter__fill' });
      const best = el('span', { class: 'an-meter__best', title: 'lowest possible' });
      const v = el('span', { class: 'an-meter__v' });
      const m = el('div', { class: 'an-meter', 'data-key': t[0] },
        el('span', { class: 'an-meter__k' }, el('span', { class: 'an-glyph', 'aria-hidden': 'true', text: t[2] }), t[1]),
        el('span', { class: 'an-meter__bar' }, fill, best), v);
      meterEls[t[0]] = { m: m, fill: fill, best: best, v: v };
      return m;
    }));
    host.appendChild(meters);

    // Weights
    const sliders = TERMS.map(function (t) {
      return kit.slider({ label: t[1] + ' ×', min: 0, max: 3, step: 0.1, value: 1,
        format: function (v) { return v.toFixed(1); },
        onInput: function (v) { W[t[0]] = v; update(); } });
    });
    host.appendChild(el('div', { class: 'k-row an-weights' }, sliders.map(function (s) { return s.el; })));

    // Histogram
    const H = { w: 640, h: 170, x0: 36, x1: 628, y0: 128 };
    const sx = function (c) { return H.x0 + (c - 50) / 84 * (H.x1 - H.x0); };
    const hist = kit.svg('svg', { class: 'an-hist', viewBox: '0 0 ' + H.w + ' ' + H.h, role: 'img',
      'aria-label': 'Histogram of the cost of all 3,628,800 orders at weights 1,1,1,1, from 50.1 to 132.2, most between 60 and 115' });
    host.appendChild(el('p', { class: 'an-hist__k', text: 'Every possible day: all 3,628,800 orders, scored at the baseline weights (1, 1, 1, 1)' }));
    host.appendChild(hist);
    const bins = [];
    for (let b = 0; b < 42; b++) {
      let s = 0;
      for (let k = b * 20; k < b * 20 + 20 && k < FINE.length; k++) s += FINE[k];
      bins.push(s);
    }
    const bmax = Math.max.apply(null, bins);
    const gBars = kit.svg('g'), gMarks = kit.svg('g');
    hist.appendChild(gBars); hist.appendChild(gMarks);
    const bw = (H.x1 - H.x0) / 42;
    bins.forEach(function (s, b) {
      gBars.appendChild(kit.svg('rect', { class: 'an-hist__bar', x: H.x0 + b * bw + 0.5, width: bw - 1,
        y: H.y0 - s / bmax * 100, height: s / bmax * 100 }));
    });
    [50, 70, 90, 110, 130].forEach(function (c) {
      gBars.appendChild(kit.svg('text', { class: 'an-hist__tick', x: sx(c), y: H.y0 + 16, 'text-anchor': 'middle', text: String(c) }));
    });
    gBars.appendChild(kit.svg('line', { class: 'an-hist__base', x1: H.x0, x2: H.x1, y1: H.y0, y2: H.y0 }));
    gBars.appendChild(kit.svg('text', { class: 'an-hist__tick', x: H.x1, y: H.y0 + 32, 'text-anchor': 'end', text: 'cost → lower is better' }));
    function marker(c, cls, label, y) {
      const x = sx(c);
      return kit.svg('g', { class: cls },
        kit.svg('line', { x1: x, x2: x, y1: y, y2: H.y0 }),
        kit.svg('text', { x: x + 4, y: y + 4, text: label }));
    }
    gMarks.appendChild(marker(OPT, 'an-mk an-mk--colony', 'colony ' + f3(OPT), 14));
    gMarks.appendChild(marker(BASE.cost(ENTERED), 'an-mk an-mk--typed', 'as typed', 30));
    let youMark = null;
    const note = el('p', { class: 'an-note' });
    host.appendChild(note);

    host.appendChild(el('div', { class: 'k-row an-game__btns' },
      kit.button('Reset to the order I typed', function () { setOrder(ENTERED.slice()); }),
      kit.button('Give up: show the colony’s day', function () { setOrder(COLONY.slice()); }),
      kit.button('Weights back to 1', function () { sliders.forEach(function (s) { s.set(1, true); }); Object.assign(W, ONES); update(); })));

    function setOrder(o) { kit.flip(list, function () { order = o; place(); }); update(); }
    function move(i, d, btn) {
      const at = order.indexOf(i), to = at + d;
      if (to < 0 || to >= order.length) return;
      const o = order.slice(); o.splice(at, 1); o.splice(to, 0, i);
      setOrder(o);
      btn.focus();
      kit.announce(TASKS[i].name + ' moved to position ' + (to + 1) + '. Day costs ' + rTotal.el.textContent.replace(/\D*$/, ''));
    }
    function place() { order.forEach(function (i) { list.appendChild(rows[i].li); }); }

    function wireDrag(grip, i) {
      grip.style.touchAction = 'none';
      grip.addEventListener('pointerdown', function (e) {
        if (e.button) return;
        e.preventDefault();
        grip.setPointerCapture(e.pointerId);
        rows[i].li.classList.add('is-drag');
        function mv(ev) {
          const r = list.getBoundingClientRect();
          const rh = r.height / order.length;
          const to = clamp(Math.floor((ev.clientY - r.top) / rh), 0, order.length - 1);
          const at = order.indexOf(i);
          if (to === at) return;
          const o = order.slice(); o.splice(at, 1); o.splice(to, 0, i);
          setOrder(o);
        }
        function up() {
          rows[i].li.classList.remove('is-drag');
          grip.removeEventListener('pointermove', mv);
          grip.removeEventListener('pointerup', up);
          grip.removeEventListener('pointercancel', up);
        }
        grip.addEventListener('pointermove', mv);
        grip.addEventListener('pointerup', up);
        grip.addEventListener('pointercancel', up);
      });
    }

    function update() {
      const model = makeFocusModel(TASKS, W);
      const p = model.breakdown(order);
      const total = model.cost(order);
      const base = BASE.cost(order);
      const sched = model.schedule(order);
      let late = 0;
      sched.forEach(function (s, k) {
        const r = rows[s.idx];
        r.bar.style.left = ((s.start - 540) / 480 * 100) + '%';
        r.bar.style.width = ((s.end - s.start) / 480 * 100) + '%';
        r.time.textContent = (k + 1) + '. ' + fmtHM(s.start) + '–' + fmtHM(s.end);
        r.li.classList.toggle('is-late', s.late);
        r.late.textContent = s.late ? 'LATE +' + Math.round(s.end - TASKS[s.idx].due) + 'm' : '';
        r.up.disabled = k === 0; r.down.disabled = k === order.length - 1;
        if (s.late) late++;
      });
      TERMS.forEach(function (t) {
        const m = meterEls[t[0]];
        m.fill.style.width = (p[t[0]] / TERM_MAX[t[0]] * 100) + '%';
        m.best.style.left = (TERM_MIN[t[0]] / TERM_MAX[t[0]] * 100) + '%';
        m.v.textContent = (W[t[0]] === 1 ? '' : W[t[0]].toFixed(1) + ' × ') + p[t[0]].toFixed(2);
      });
      rTotal.set(f3(total));
      const pct = pctText(base);
      rPct.set(pct);
      rLate.set(String(late));
      kit.live('g-cost', f3(total));
      kit.live('g-pct', pct);
      kit.live('g-late', String(late));
      if (youMark) gMarks.removeChild(youMark);
      youMark = marker(base, 'an-mk an-mk--you', 'you ' + f3(base), 46);
      gMarks.appendChild(youMark);
      const changed = TERMS.some(function (t) { return W[t[0]] !== 1; });
      note.textContent = changed
        ? 'Weights changed: your total is re-scored at your weights. The histogram and your marker stay at (1, 1, 1, 1), where your day costs ' + f3(base) + '.'
        : (Math.abs(base - OPT) < 1e-9 ? 'This is the colony’s day. No other order scores this low.' : 'Gap to the colony: ' + (base - OPT).toFixed(3) + ' points.');
    }

    kit.onKey(function (k) {
      TERMS.forEach(function (t) {
        meterEls[t[0]].m.classList.toggle('is-dim', !!k && k !== t[0]);
        meterEls[t[0]].m.classList.toggle('is-hl', k === t[0]);
      });
    });
    function paint() {
      const c = kit.colors();
      host.style.setProperty('--an-late', c.series[0]);
      CAT_ORDER.forEach(function (cat, n) { host.style.setProperty('--an-c-' + cat, c.series[n]); });
    }
    kit.onTheme(paint);
    paint();
    place();
    update();
  }

  /* ---- Round 2: what an ant can smell ---- */
  function nose(host, kit) {
    const el = kit.el;
    const ETA = etaOf(BASE, 10);
    const tMax = 1 / (0.1 * (OPT + 1e-9)), tMin = tMax / 20;
    let cur = 2, pinned = 2, age = 'fresh';
    host.classList.add('an-nose');

    const ring = el('div', { class: 'an-ring' });
    const lines = kit.svg('svg', { class: 'an-ring__svg', viewBox: '0 0 100 100', 'aria-hidden': 'true' });
    ring.appendChild(lines);
    const pos = TASKS.map(function (_, i) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      return { x: 50 + Math.cos(a) * 38, y: 50 + Math.sin(a) * 38 };
    });
    const btns = TASKS.map(function (t, i) {
      const b = el('button', { type: 'button', class: 'an-node', 'data-cat': t.category,
        'aria-pressed': 'false', style: { left: pos[i].x + '%', top: pos[i].y + '%' },
        on: { click: function () { pinned = cur = i; draw(); } } },
        el('span', { class: 'an-glyph', 'aria-hidden': 'true', text: GLYPH[t.category] }),
        el('span', { class: 'an-node__t', text: SHORT[i] }));
      b.setAttribute('aria-label', 'Put the ant on ' + t.name + ' (' + t.category + ')');
      ring.appendChild(b);
      return b;
    });
    const centre = el('p', { class: 'an-ring__c' });
    ring.appendChild(centre);

    const a = kit.slider({ label: 'α pheromone', min: 0, max: 5, step: 0.1, value: 1, format: function (v) { return v.toFixed(1); }, onInput: draw });
    const b = kit.slider({ label: 'β heuristic', min: 0, max: 8, step: 0.1, value: 3, format: function (v) { return v.toFixed(1); }, onInput: draw });
    const q = kit.slider({ label: 'q₀ greedy', min: 0, max: 1, step: 0.05, value: 0.1, format: function (v) { return v.toFixed(2); }, onInput: draw });
    const ch = kit.choice({ label: 'Pheromone', options: [{ value: 'fresh', label: 'Fresh colony' }, { value: 'after', label: 'After 30 iterations' }],
      value: 'fresh', onChange: function (v) { age = v; draw(); } });
    const stack = el('div', { class: 'an-stack', 'aria-hidden': 'true' });
    const rowsEl = el('ol', { class: 'an-probs' });
    host.appendChild(el('div', { class: 'an-nose__grid' }, ring,
      el('div', { class: 'an-nose__side' },
        el('p', { class: 'an-nose__k', text: 'Where the ant goes next' }), stack, rowsEl)));
    host.appendChild(el('div', { class: 'k-row' }, ch.el));
    host.appendChild(el('div', { class: 'k-row' }, a.el, b.el, q.el));

    function tau(i, j) {
      if (age === 'fresh') return 1;
      for (let k = 0; k < 9; k++) if (COLONY[k] === i && COLONY[k + 1] === j) return tMax;
      return tMin;
    }
    /* buildOne(), index.html:602-620: with probability q₀ the argmax (first
       strict maximum wins ties), otherwise the roulette wheel. */
    function probs(from) {
      const cand = [], w = [];
      let sum = 0, bi = -1, bv = -Infinity;
      for (let j = 0; j < 10; j++) {
        if (j === from) continue;
        const v = Math.pow(tau(from, j), a.value()) * Math.pow(ETA[from][j], b.value());
        cand.push(j); w.push(v); sum += v;
        if (v > bv) { bv = v; bi = j; }
      }
      const q0 = q.value();
      return cand.map(function (j, k) {
        const roul = sum > 0 && isFinite(sum) ? w[k] / sum : 1 / cand.length;
        return { j: j, p: (1 - q0) * roul + (j === bi ? q0 : 0) };
      });
    }
    function draw() {
      const c = kit.colors();
      const ps = probs(cur);
      btns.forEach(function (bt, i) {
        bt.setAttribute('aria-pressed', String(i === cur));
        bt.style.setProperty('--an-cat', catColor(c, TASKS[i].category));
      });
      while (lines.firstChild) lines.removeChild(lines.firstChild);
      ps.forEach(function (o) {
        lines.appendChild(kit.svg('line', { x1: pos[cur].x, y1: pos[cur].y, x2: pos[o.j].x, y2: pos[o.j].y,
          stroke: c.accent, 'stroke-width': 0.15 + o.p * 4, 'stroke-opacity': 0.15 + o.p * 0.85, 'stroke-linecap': 'round' }));
      });
      const sorted = ps.slice().sort(function (x, y) { return y.p - x.p || x.j - y.j; });
      stack.textContent = '';
      sorted.forEach(function (o) {
        stack.appendChild(el('span', { class: 'an-stack__seg', title: SHORT[o.j],
          style: { width: (o.p * 100) + '%', background: catColor(c, TASKS[o.j].category) } }));
      });
      rowsEl.textContent = '';
      sorted.forEach(function (o) {
        rowsEl.appendChild(el('li', null,
          el('span', { class: 'an-glyph', 'aria-hidden': 'true', style: { color: catColor(c, TASKS[o.j].category) }, text: GLYPH[TASKS[o.j].category] }),
          el('span', { class: 'an-probs__n', text: SHORT[o.j] }),
          el('span', { class: 'an-probs__bar' }, el('span', { style: { width: (o.p * 100) + '%' } })),
          el('span', { class: 'an-probs__v', text: (o.p * 100).toFixed(o.p < 0.001 && o.p > 0 ? 3 : 1) + '%' })));
      });
      const same = ps.filter(function (o) { return TASKS[o.j].category === TASKS[cur].category; })
        .reduce(function (s, o) { return s + o.p; }, 0);
      centre.textContent = 'From ' + SHORT[cur] + ': same category ' + (same * 100).toFixed(1) + '%';
      kit.announce('From ' + TASKS[cur].name + ', most likely next: ' + TASKS[sorted[0].j].name + ' at ' + (sorted[0].p * 100).toFixed(1) + '%');
    }
    kit.onKey(function (k) {
      cur = k === 'standup' ? 2 : k === 'paybill' ? 6 : pinned;
      draw();
    });
    kit.onTheme(draw);
    draw();
  }

  /* ---- Round 3: the pheromone ledger (scrolly) ---- */
  function ledger(host, kit) {
    const el = kit.el;
    let it = 0, rho = 0.1, hl = null;
    host.classList.add('an-ledger');
    /* The update of ACO.step(), index.html:659-677, replayed on the run's best
       day. With 2-opt on, seed 1337 finds that day in iteration 1 at every ρ
       and never replaces it, so this equals the real run's τ exactly
       (checked against the engine for ρ = 0.01, 0.05, 0.1, 0.3, 0.5, 0.9). */
    function field(r, upto) {
      const n = 10, C = OPT;
      const t = Array.from({ length: n }, () => new Float64Array(n).fill(1));
      let tauMax = 1, tauMin = 1 / (2 * n), flat = null;
      for (let s = 1; s <= upto; s++) {
        if (s === 1) { tauMax = 1 / (r * (C + 1e-9)); tauMin = tauMax / (2 * n); }
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) t[i][j] *= 1 - r;
        const amt = 1 / (C + 1e-9);
        for (let k = 0; k < n - 1; k++) t[COLONY[k]][COLONY[k + 1]] += amt;
        let atMin = 0;
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
          if (i === j) continue;
          if (t[i][j] > tauMax) t[i][j] = tauMax; else if (t[i][j] < tauMin) t[i][j] = tauMin;
          if (Math.abs(t[i][j] - tauMin) < 1e-12) atMin++;
        }
        if (flat === null && atMin === 81) flat = s;
      }
      return { t: t, max: tauMax, min: tauMin, flat: flat };
    }
    const onPath = {};
    for (let k = 0; k < 9; k++) onPath[COLONY[k] * 10 + COLONY[k + 1]] = true;

    const rIt = kit.readout('Iteration', '0', 'k-readout--accent');
    const rMax = kit.readout('Ceiling τmax', '');
    const rMin = kit.readout('Floor τmin', '');
    const rFlat = kit.readout('Two-valued from', '');
    host.appendChild(el('div', { class: 'k-row an-ledger__ro' }, rIt.el, rMax.el, rMin.el, rFlat.el));
    const cv = kit.canvas(host, { draw: paint });
    cv.el.classList.add('an-ledger__cv');
    const sIt = kit.slider({ label: 'Iteration', min: 0, max: 250, step: 1, value: 0, onInput: function (v) { it = v; update(); } });
    const sRho = kit.slider({ label: 'ρ evaporation', min: 0.01, max: 0.9, step: 0.01, value: 0.1,
      format: function (v) { return v.toFixed(2); }, onInput: function (v) { rho = v; update(); } });
    host.appendChild(el('div', { class: 'k-row' }, sIt.el, sRho.el));
    const legend = el('p', { class: 'an-ledger__legend', text: 'Rows: from · columns: to. Numbered by the order typed: ' +
      SHORT.map(function (s, i) { return (i + 1) + ' ' + s; }).join(', ') + '. A ring marks the nine edges of the best day.' });
    host.appendChild(legend);

    let F = null, flatAt = null, flatRho = null;
    function update() {
      F = field(rho, it);
      if (flatRho !== rho) { flatAt = field(rho, 400).flat; flatRho = rho; }
      rIt.set(String(it));
      rMax.set(F.max.toFixed(4));
      rMin.set(F.min.toFixed(5));
      rFlat.set(flatAt ? 'iteration ' + flatAt : '—');
      kit.live('l-flat', String(flatAt));
      cv.draw();
    }
    function paint(ctx, w, h) {
      const c = kit.colors();
      const narrow = w < 520;
      const lab = narrow ? 18 : 104;
      const size = Math.min(w - lab - 4, h - lab * (narrow ? 1 : 0.3) - 4);
      const cell = size / 10;
      const ox = lab + Math.max(0, (w - lab - size) / 2 - (narrow ? 0 : 40)), oy = narrow ? lab : 26;
      const lo = Math.log(0.005), hi = Math.log(1);
      ctx.font = (narrow ? 10 : 11) + 'px ' + getComputedStyle(host).fontFamily;
      ctx.textBaseline = 'middle';
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = c.inkSoft;
        ctx.textAlign = 'right';
        ctx.fillText(narrow ? String(i + 1) : (i + 1) + ' ' + SHORT[i], ox - 6, oy + (i + 0.5) * cell);
        ctx.textAlign = 'center';
        ctx.fillText(String(i + 1), ox + (i + 0.5) * cell, oy - 9);
        for (let j = 0; j < 10; j++) {
          const x = ox + j * cell, y = oy + i * cell;
          if (i === j) { ctx.fillStyle = c.bgSunken; ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2); continue; }
          const v = F.t[i][j];
          const k = clamp((Math.log(v) - lo) / (hi - lo), 0, 1);
          ctx.globalAlpha = 0.06 + 0.94 * k;
          ctx.fillStyle = c.accent;
          ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
          ctx.globalAlpha = 1;
          if (onPath[i * 10 + j]) {
            ctx.strokeStyle = hl === 'path' ? c.ink : c.inkMuted;
            ctx.lineWidth = hl === 'path' ? 2.5 : 1.25;
            ctx.beginPath(); ctx.arc(x + cell / 2, y + cell / 2, cell * 0.28, 0, Math.PI * 2); ctx.stroke();
          }
          if (hl === 'floor' && Math.abs(v - F.min) < 1e-12) {
            ctx.strokeStyle = c.ink; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x + 4, y + cell - 4); ctx.lineTo(x + cell - 4, y + 4); ctx.stroke();
          }
        }
      }
      if (!narrow) {
        ctx.textAlign = 'left';
        ctx.fillStyle = c.inkMuted;
        ctx.fillText('from ↓   to →', ox + size + 12, oy + 6);
      }
    }
    kit.onKey(function (k) { hl = k; cv.draw(); });
    let step = null;
    update();
    return {
      set: function (st, i) {
        step = st;
        if (st.rho != null && st.rho !== rho) { rho = st.rho; sRho.set(rho, true); }
        if (st.it != null) { it = st.it; sIt.set(it, true); }
        update();
      },
      progress: function (t) {
        if (!step || step.to == null) return;
        const v = Math.round(kit.lerp(step.it, step.to, t));
        if (v !== it) { it = v; sIt.set(v, true); update(); }
      }
    };
  }

  /* ---- Round 4: 2-opt from the typed day ---- */
  function twoopt(host, kit) {
    const el = kit.el;
    host.classList.add('an-two');
    const trace = [];
    localSearch(BASE, ENTERED, function (i, k, c, seq) { trace.push({ i: i, k: k, c: c, seq: seq }); });
    let step = 0, order = ENTERED.slice(), cost = BASE.cost(ENTERED), tries = 0, hits = 0;
    const R = kit.rng(7);

    const rCost = kit.readout('Cost', '', 'k-readout--accent');
    const rStep = kit.readout('Reversals', '');
    const rGap = kit.readout('Short of the optimum by', '');
    host.appendChild(el('div', { class: 'k-row' }, rCost.el, rStep.el, rGap.el));
    const tiles = el('ol', { class: 'an-tiles', 'aria-label': 'The day, in order' });
    const tileEls = TASKS.map(function (t, i) {
      return el('li', { class: 'an-tile', 'data-cat': t.category },
        el('span', { class: 'an-glyph', 'aria-hidden': 'true', text: GLYPH[t.category] }), ' ' + SHORT[i]);
    });
    host.appendChild(tiles);
    const gauge = el('div', { class: 'an-gauge', 'aria-hidden': 'true' },
      el('span', { class: 'an-gauge__opt', style: { left: ((OPT - 50) / 18 * 100) + '%' } }),
      el('span', { class: 'an-gauge__optk', style: { left: ((OPT - 50) / 18 * 100) + '%' }, text: 'optimum ' + f3(OPT) }));
    const dot = el('span', { class: 'an-gauge__dot' });
    gauge.appendChild(dot);
    host.appendChild(gauge);
    const bStep = kit.button('Step', function () { next(); }, 'k-btn--primary');
    const bPlay = kit.button('Play', function () { if (kit.reduced) { while (step < trace.length) next(true); return; } playing = !playing; bPlay.textContent = playing ? 'Pause' : 'Play'; if (playing) loop.start(); });
    const rTally = kit.readout('Random starts that reach the optimum', '0 of 0');
    host.appendChild(el('div', { class: 'k-row' }, bStep, bPlay,
      kit.button('Reset', function () { stop(); step = 0; setOrder(ENTERED.slice(), BASE.cost(ENTERED)); }),
      kit.button('Try another start', function () {
        stop();
        const p = ENTERED.slice();
        for (let i = 9; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const x = p[i]; p[i] = p[j]; p[j] = x; }
        const r = localSearch(BASE, p);
        const c = BASE.cost(r);
        tries++; if (Math.abs(c - OPT) < 1e-9) hits++;
        rTally.set(hits + ' of ' + tries);
        step = trace.length;
        setOrder(r, c);
        kit.announce('Random start polished to ' + f3(c));
      }), rTally.el));

    let playing = false, acc = 0;
    const loop = kit.loop(function (dt) {
      if (!playing) return false;
      acc += dt;
      if (acc > 0.9) { acc = 0; next(); }
      if (step >= trace.length) { stop(); return false; }
    });
    function stop() { playing = false; bPlay.textContent = 'Play'; loop.stop(); }
    function setOrder(o, c, seg) {
      tileEls.forEach(function (t) { t.classList.remove('is-seg'); });
      if (seg) for (let x = seg[0]; x <= seg[1]; x++) tileEls[o[x]].classList.add('is-seg');
      kit.flip(tiles, function () { order = o; o.forEach(function (i) { tiles.appendChild(tileEls[i]); }); });
      cost = c;
      show();
    }
    function next(quiet) {
      if (step >= trace.length) return;
      const s = trace[step++];
      if (step === 1) { order = ENTERED.slice(); }
      setOrder(s.seq, s.c, [s.i, s.k]);
      if (!quiet) kit.announce('Reversed positions ' + (s.i + 1) + ' to ' + (s.k + 1) + '. Cost ' + f3(s.c));
    }
    function show() {
      rCost.set(f3(cost));
      rStep.set(step + ' of ' + trace.length);
      rGap.set((cost - OPT).toFixed(3));
      bStep.disabled = step >= trace.length;
      dot.style.left = clamp((cost - 50) / 18 * 100, 0, 100) + '%';
      kit.live('t-cost', f3(cost));
    }
    setOrder(ENTERED.slice(), cost);
  }

  /* ---- Round 4b: the errands untangle ---- */
  function errands(host, kit) {
    const el = kit.el;
    host.classList.add('an-err');
    const T = sampleErrand(), M = makeErrandModel(T);
    const trace = [];
    localSearch(M, [0, 1, 2, 3, 4, 5, 6, 7], function (i, k, c, seq) { trace.push({ i: i, k: k, c: c, seq: seq }); });
    let step = 0, order = [0, 1, 2, 3, 4, 5, 6, 7];
    // computeLayout(), index.html:712-721, on a 600×380 box with 50px padding.
    const Wd = 600, Ht = 380, pad = 50;
    const lats = T.map((t) => t.lat), lons = T.map((t) => t.lon);
    const minLa = Math.min(...lats), maxLa = Math.max(...lats);
    const minLo = Math.min(...lons), maxLo = Math.max(...lons);
    const sc = Math.min((Wd - pad * 2) / (maxLo - minLo), (Ht - pad * 2) / (maxLa - minLa));
    const ox = (Wd - (maxLo - minLo) * sc) / 2, oy = (Ht - (maxLa - minLa) * sc) / 2;
    const P = T.map(function (t) { return { x: ox + (t.lon - minLo) * sc, y: oy + (maxLa - t.lat) * sc }; });

    const rKm = kit.readout('Tour', '', 'k-readout--accent');
    const rSt = kit.readout('Reversals', '');
    host.appendChild(el('div', { class: 'k-row' }, rKm.el, rSt.el));
    const svg = kit.svg('svg', { class: 'an-map', viewBox: '0 0 ' + Wd + ' ' + Ht, role: 'img', 'aria-label': 'Map of eight errand stops in Bengaluru joined in tour order' });
    host.appendChild(svg);
    const path = kit.svg('polygon', { class: 'an-map__tour' });
    svg.appendChild(path);
    T.forEach(function (t, i) {
      const right = P[i].x < Wd - 140;
      svg.appendChild(kit.svg('circle', { class: 'an-map__stop', cx: P[i].x, cy: P[i].y, r: 6 }));
      svg.appendChild(kit.svg('text', { class: 'an-map__lab', x: P[i].x + (right ? 11 : -11), y: P[i].y + 4,
        'text-anchor': right ? 'start' : 'end', text: t.name }));
    });
    const bStep = kit.button('Step', function () {
      if (step >= trace.length) return;
      const s = trace[step++]; order = s.seq; show();
      kit.announce('Reversal ' + step + ': tour is ' + s.c.toFixed(3) + ' km');
    }, 'k-btn--primary');
    host.appendChild(el('div', { class: 'k-row' }, bStep,
      kit.button('Reset', function () { step = 0; order = [0, 1, 2, 3, 4, 5, 6, 7]; show(); })));
    function show() {
      path.setAttribute('points', order.map(function (i) { return P[i].x.toFixed(1) + ',' + P[i].y.toFixed(1); }).join(' '));
      rKm.set(M.cost(order).toFixed(3) + ' km');
      rSt.set(step + ' of ' + trace.length);
      bStep.disabled = step >= trace.length;
    }
    show();
  }

  /* ---- Round 5: converged vs correct ---- */
  function converge(host, kit) {
    const el = kit.el;
    host.classList.add('an-conv');
    let ls = 'off', ants = 20, hl = null;
    const ch = kit.choice({ label: '2-opt', options: [{ value: 'off', label: 'Off' }, { value: 'on', label: 'On' }], value: 'off',
      onChange: function (v) { ls = v; redraw(); } });
    const ca = kit.choice({ label: 'Ants', options: [4, 10, 20, 60, 120].map(function (n) { return { value: n, label: String(n) }; }), value: 20,
      onChange: function (v) { ants = v; redraw(); } });
    host.appendChild(el('div', { class: 'k-row' }, ch.el, ca.el));
    host.appendChild(el('p', { class: 'an-conv__k', text: 'Best cost so far, seed 1337, 20 ants, 100 iterations' }));
    const cv = kit.canvas(host, { height: 220, draw: chart });
    host.appendChild(el('p', { class: 'an-conv__k', text: 'Where 20 seeds end after 100 iterations' }));
    const strip = kit.svg('svg', { class: 'an-strip', viewBox: '0 0 600 92', role: 'img' });
    host.appendChild(strip);
    const rHit = kit.readout('Seeds that reach the optimum', '', 'k-readout--accent');
    const rMean = kit.readout('Mean final cost', '');
    host.appendChild(el('div', { class: 'k-row' }, rHit.el, rMean.el));

    function series(it) {
      if (ls === 'on') return OPT;
      let v = STAIR[0][1];
      for (let k = 0; k < STAIR.length; k++) if (STAIR[k][0] <= it) v = STAIR[k][1];
      return v;
    }
    function chart(ctx, w, h) {
      const c = kit.colors();
      const L = 44, Rt = 12, Tp = 10, B = 26;
      const X = function (i) { return L + (i - 1) / 99 * (w - L - Rt); };
      const Y = function (v) { return Tp + (54 - v) / 4 * (h - Tp - B); };
      ctx.font = '11px ' + getComputedStyle(host).fontFamily;
      ctx.fillStyle = c.inkMuted; ctx.strokeStyle = c.line; ctx.lineWidth = 1;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      [50, 51, 52, 53, 54].forEach(function (v) {
        ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(w - Rt, Y(v)); ctx.stroke();
        ctx.fillText(String(v), L - 6, Y(v));
      });
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      [1, 25, 50, 75, 100].forEach(function (i) { ctx.fillText(String(i), X(i), h - B + 8); });
      // finish line
      ctx.setLineDash([5, 4]); ctx.strokeStyle = c.ink; ctx.lineWidth = 1.25;
      ctx.beginPath(); ctx.moveTo(L, Y(OPT)); ctx.lineTo(w - Rt, Y(OPT)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = c.ink; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      ctx.fillText('best of all 3,628,800 · ' + f3(OPT), w - Rt, Y(OPT) - 3);
      ctx.strokeStyle = c.accent; ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 1; i <= 100; i++) { const y = Y(series(i)); if (i === 1) ctx.moveTo(X(i), y); else { ctx.lineTo(X(i), Y(series(i - 1))); ctx.lineTo(X(i), y); } }
      ctx.stroke();
      ctx.fillStyle = c.accentInk; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(ls === 'on' ? '2-opt on: ' + f3(OPT) + ' from iteration 1' : '2-opt off: stuck at 50.549 from iteration 37', L + 8, Y(series(100)) + 6);
    }
    function redraw() {
      cv.draw();
      const c = kit.colors();
      const vals = STRIP[ls + ants];
      while (strip.firstChild) strip.removeChild(strip.firstChild);
      const X = function (v) { return 30 + (v - 50) / 1.6 * 540; };
      strip.appendChild(kit.svg('line', { class: 'an-strip__axis', x1: 30, x2: 570, y1: 70, y2: 70 }));
      [50, 50.4, 50.8, 51.2, 51.6].forEach(function (v) {
        strip.appendChild(kit.svg('text', { class: 'an-strip__t', x: X(v), y: 88, 'text-anchor': 'middle', text: v.toFixed(1) }));
      });
      strip.appendChild(kit.svg('line', { class: 'an-strip__opt', x1: X(OPT), x2: X(OPT), y1: 4, y2: 70 }));
      const stackN = {};
      let hit = 0, sum = 0;
      vals.forEach(function (v) {
        const key = v.toFixed(3);
        const n = stackN[key] = (stackN[key] || 0) + 1;
        const ok = Math.abs(v - 50.146) < 1e-3;
        if (ok) hit++;
        sum += v;
        const y = 64 - (n - 1) * 3.1;
        strip.appendChild(ok
          ? kit.svg('circle', { cx: X(v), cy: y, r: 2.8, fill: c.accent })
          : kit.svg('rect', { x: X(v) - 2.6, y: y - 2.6, width: 5.2, height: 5.2, fill: 'none', stroke: c.inkSoft, 'stroke-width': 1.2 }));
      });
      strip.setAttribute('aria-label', hit + ' of 20 seeds end on the optimum with ' + ants + ' ants and 2-opt ' + ls);
      rHit.set(hit + ' of 20');
      rMean.set((sum / 20).toFixed(3));
      kit.live('c-hit', hit + ' of 20');
    }
    kit.onKey(function (k) {
      const m = k && /^a(\d+)$/.exec(k);
      if (m) { ants = Number(m[1]); ls = 'off'; ca.set(ants, true); ch.set('off', true); redraw(); }
    });
    kit.onTheme(redraw);
    redraw();
  }

  /* ======================================================================
     The article
     ====================================================================== */
  Article.register('anttodo', {
    form: 'game',
    scramble: 'τηραβ→·∘◦',
    dek: 'A colony of twenty virtual ants rearranged my Tuesday and took a quarter off its penalty score. That sounded impressive until I checked all 3,628,800 other Tuesdays. So before any theory, here is the game: you against the colony, on the same ten tasks, scored by the same twenty lines of code.',
    opener: function (c) {
      let s = '';
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const a = i / 10 * Math.PI * 2 - Math.PI / 2;
        pts.push([64 + Math.cos(a) * 44, 64 + Math.sin(a) * 44]);
      }
      for (let i = 0; i < 10; i++) for (let j = i + 1; j < 10; j++) {
        s += '<line x1="' + pts[i][0].toFixed(1) + '" y1="' + pts[i][1].toFixed(1) + '" x2="' + pts[j][0].toFixed(1) + '" y2="' + pts[j][1].toFixed(1) + '" stroke="' + c.l + '" stroke-width="0.4"/>';
      }
      let d = 'M' + pts[COLONY[0]].join(',');
      for (let k = 1; k < 10; k++) d += 'L' + pts[COLONY[k]].map(function (v) { return v.toFixed(1); }).join(',');
      s += '<path d="' + d + '" fill="none" stroke="' + c.a + '" stroke-width="2.2" stroke-linejoin="round"/>';
      pts.forEach(function (p, i) { s += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (i === COLONY[0] ? 4.5 : 3) + '" fill="' + c.i + '"/>'; });
      return s;
    },
    chapters: [
      {
        id: 'beat', label: 'Round 1', title: 'Beat the colony',
        art: function (c) {
          const w = [42, 14, 7, 21, 28, 19, 5, 23, 12, 19];
          let x = 6, s = '<line x1="6" y1="104" x2="154" y2="104" stroke="' + c.l + '"/>';
          COLONY.forEach(function (i, k) { s += '<rect x="' + x + '" y="' + (12 + k * 9) + '" width="' + w[i] * 0.65 + '" height="6" rx="2" fill="' + (k < 6 ? c.a : c.m) + '"/>'; x += w[i] * 0.65; });
          return s;
        },
        blocks: [
          { p: 'This is my sample day from the app, as I typed it in. It has ten tasks, five of them with a due time, and 405 minutes of work in a day that starts at 9:00. Drag a row by its handle, or use the arrows, to put the day in a better order. The score is the app’s own cost function, copied over line for line. Lower is better.' },
          { widget: 'game', size: 'full',
            caption: 'Your day, scored live by `makeFocusModel` (index.html:503-542, ported verbatim). A bar that ends past its due tick is late and says so. The histogram is every one of the 10! = 3,628,800 orders, each scored once by brute force at weights (1, 1, 1, 1). Moving a weight re-scores your day but not the histogram.' },
          { p: 'Your day costs {{g-cost|66.906}} with {{g-late|1}} late task, which is better than {{g-pct|89.9%}} of every order these ten tasks could go in.^[Share of the 3,628,800 orders that score higher, counted by brute force against the shipped cost function and stored in 0.1-point bins, so the widget is exact to within one bin.]' },
          { p: 'Four things cost points. [[Deadline pressure|deadline]] is the hours a task runs past its due time, times its priority. [[Priority inversion|priority]] charges every task its priority times how far down the day it sits, so important work wants to go early. [[Context switching|context]] costs 2 each time the category changes from one task to the next. [[Cognitive load|energy]] charges heavy tasks for landing late, by how far into the eight-hour day the middle of the task falls.' },
          { code: 'function parts(seq) {\n  let clock = dayStart;\n  const p = { deadline: 0, priority: 0, context: 0, energy: 0 };\n  for (let k = 0; k < seq.length; k++) {\n    const t = tasks[seq[k]], dur = t.duration ?? 30, finish = clock + dur;\n    if (t.due != null && finish > t.due) p.deadline += ((finish - t.due) / 60) * t.priority;\n    const pr = seq.length > 1 ? k / (seq.length - 1) : 0;\n    p.priority += t.priority * pr;\n    if (k > 0) p.context += D[seq[k - 1]][seq[k]] * 2;\n    const mid = clock + dur / 2;\n    p.energy += t.load * clamp((mid - dayStart) / dayLen, 0, 1);\n    clock = finish;\n  }\n  return p;\n}',
            lang: 'javascript', caption: 'The whole definition of a good day, index.html:510-526. The total is each term times its weight.' },
          { p: 'My typed order loses its deadline points in one place. Team standup is due at 10:00, and I put it third, behind a 90-minute report. It finishes at 11:15, an hour and a quarter late at priority 6, and that is the whole 7.5 of deadline pressure.' },
          { p: 'The colony’s day costs 50.146, which is 25.1% lower. It pays the electricity bill first, does the standup at 9:10 and pushes the gym to the end of the afternoon. I wanted to know whether that was good or just better, so I scored every possible order. Ten tasks is small enough for that: it took 1.3 seconds in Node.',
            notes: [['scored every possible order', 'should have done this before writing a single slider']] },
          { callout: 'The colony’s 50.146 is the best of all 3,628,800 orders, and no other order ties it.\n\nBut the order I typed without thinking already beat 89.9% of them. Only 10,115 orders, 0.28%, land within five points of the best. The ants were working in the last thin slice of the haystack.', label: 'Score' },
          { p: 'The weights are how the app lets you decide what “better” means. Set context switching to 0 and the best day does not change at all; its score just drops by exactly 10, to 40.146. Keep only deadline pressure and 218,448 orders tie at zero, 6% of all of them, so the colony is picking among equals. The histogram stays at (1, 1, 1, 1) because that is the only weighting I brute-forced.' }
        ]
      },
      {
        id: 'smell', label: 'Round 2', title: 'What an ant can smell',
        blocks: [
          { quote: 'In Focus Mode the ants can smell one thing: whether the next task is in the same category.' },
          { p: 'The old version of this page called the app a routing problem. That is true of one of its two modes. Errand Mode is a real closed tour over eight places in Bengaluru, measured in haversine kilometres. Focus Mode, the default, is a sequencing problem. Three of its four penalties depend on where a task sits in the day and what the clock says, not on which task came before it. Only context switching is a cost between neighbours.' },
          { p: 'An ant builds a day one task at a time. Standing on one task, it weighs every task it has not done yet by two numbers: τ, the pheromone on that step, and η, how good the step looks before anyone has walked it. With probability q₀ it skips the dice and takes the best-looking step. Otherwise it rolls.' },
          { tex: 'P(i \\to j) = \\frac{\\tau_{ij}^{\\alpha} \\, \\eta_{ij}^{\\beta}}{\\sum_{k} \\tau_{ik}^{\\alpha} \\, \\eta_{ik}^{\\beta}}', caption: 'The roulette wheel in `buildOne()`, index.html:602-620, over the tasks not yet placed.' },
          { code: '// makeFocusModel, index.html:505-508\nD[i][j] = i === j ? 0 : tasks[i].category === tasks[j].category ? 0 : 1;\n\n// class ACO, index.html:571\nthis.eta[i][j] = i === j ? 0 : 1 / (this.model.dist[i][j] / scale + 0.1);', lang: 'javascript', caption: 'In Focus Mode the “distance” is 0 inside a category and 1 across.' },
          { p: 'So η is 10 for a step inside a category and 0.909 for any other, and with β = 3 that is a ratio of 11³, or 1,331. Hover on [[Team standup|standup]]: the four other work tasks take 99.9% of the choice. Hover on [[Pay electricity bill|paybill]], the only admin task, and every step looks the same, except that the greedy 10% breaks the tie toward whichever task was typed first.',
            notes: [['breaks the tie toward whichever task was typed first', 'the report gets a free 10% from the bill. found it while building this']] },
          { widget: 'nose', size: 'wide',
            caption: 'The exact choice an ant makes from each task, computed with the app’s η and the q₀ rule from `buildOne()`. Pick a task on the ring. “After 30 iterations” uses the real field from the seed-1337 run: 0.1994 on the nine steps of the best day, 0.00997 on the rest. Each task’s shape marks its category.' },
          { p: 'Deadlines, priority and energy are invisible to the ant. It cannot smell that the standup is due at 10:00. That knowledge reaches the colony only through pheromone, after a whole day has been scored. And the first task of the day is not chosen by smell at all. It is picked uniformly at random.^[index.html:595-596. The next nine choices follow the rule above.]',
            notes: [['picked uniformly at random', 'pheromone is about what follows what, so nothing ever learns how the day should start']] },
          { p: 'Switch the figure to *after 30 iterations* and the trails take over. From the standup, Code review now gets 88.2% of the choice; from the bill, Team standup gets 74.3%. The floor keeps the other 25.7% of choices from the bill spread over the other eight tasks, so the colony never stops exploring completely.' }
        ]
      },
      {
        id: 'ledger', label: 'Round 3', title: 'The pheromone ledger',
        art: function (c) {
          let s = '';
          for (let i = 0; i < 6; i++) for (let j = 0; j < 8; j++) {
            const on = (j === i + 1) || (i === 5 && j === 7);
            s += '<rect x="' + (14 + j * 17) + '" y="' + (8 + i * 17) + '" width="14" height="14" rx="2" fill="' + (on ? c.a : c.p) + '"' + (on ? '' : ' opacity="0.5"') + '/>';
          }
          return s;
        },
        blocks: [
          { p: 'Pheromone is a 10×10 table: one number for every ordered pair of tasks, saying how much the colony likes doing *this* straight after *that*. After every iteration the app does three things to it.' },
          { list: ['**Evaporate.** Every entry is multiplied by 1 − ρ.', '**Deposit.** The steps of the best day found so far each get 1/C, where C is that day’s cost.', '**Clamp.** Every entry is held between a ceiling and a floor.'], ordered: true },
          { tex: '\\tau_{max} = \\frac{1}{\\rho \\, C_{best}} \\qquad \\tau_{min} = \\frac{\\tau_{max}}{2n}', caption: 'The Max-Min Ant System bounds, index.html:659-663, reset each time a better day is found.' },
          { p: 'The ceiling is not arbitrary. A step that gets the deposit every round settles where evaporation and deposit cancel, τ = (1 − ρ)τ + 1/C, and that is exactly 1/(ρC). The floor holds every step at a twentieth of the ceiling, so no move ever becomes impossible. Scroll, and watch the real run.' },
          { scrolly: 'ledger', caption: 'The pheromone field of the seed-1337 run, from the update in index.html:664-677. Shade is τ on a log scale; a ring marks the nine steps of the best day. Replayed on the run’s best day, which matches the engine’s own τ exactly at every ρ tested.',
            steps: [
              { p: '**Iteration 0.** All 90 steps start at 1. The ants have nothing to go on but category.', state: { it: 0, rho: 0.1 } },
              { p: '**Iteration 1.** With 2-opt on, the first round already finds the 50.146 day. Everything is clamped to the new ceiling, 1/(0.1 × 50.146) = 0.1994. The [[nine steps of the best day|path]] are there, but so is everything else.', state: { it: 1, rho: 0.1 } },
              { p: 'Scroll slowly. Each round, the 81 other steps lose 10%. The nine stay pinned to the ceiling, because the deposit puts back exactly what evaporation took.', state: { it: 2, to: 29, rho: 0.1 } },
              { p: '**Iteration 30.** The field has gone two-valued: nine steps at 0.1994 and 81 on the [[floor|floor]] at 0.00997, a ratio of 20, which is 2n. From here on nothing changes, however long it runs.', state: { it: 30, rho: 0.1 } },
              { p: 'Turn evaporation down to ρ = 0.01 and the same thing takes until iteration 230, well past the 100 iterations the app runs by default.', state: { it: 230, rho: 0.01 } },
              { p: 'At ρ = 0.9 it takes three. Try the sliders: the field goes two-valued at iteration {{l-flat|3}}.', state: { it: 3, rho: 0.9 } }
            ] },
          { table: { head: ['ρ', 'Field two-valued from iteration'], rows: [['0.01', '230'], ['0.05', '60'], ['0.1 (default)', '30'], ['0.3', '10'], ['0.5', '6'], ['0.9', '3']] },
            caption: 'Measured on the seed-1337 run with 2-opt on.' },
          { p: 'The old version of this page said that turning evaporation up makes the colony settle sooner. The ledger does settle sooner. The answer does not. With 2-opt on, the best day arrives in the first iteration at every ρ I tried, so evaporation only decides how fast the bookkeeping catches up with an answer the colony already has.',
            notes: [['turning evaporation up makes the colony settle sooner', 'I wrote that sentence. it sounded right']] }
        ]
      },
      {
        id: 'polish', label: 'Round 4', title: 'Who really did the work',
        blocks: [
          { quote: 'The ants found the best day. 2-opt did most of the walking.' },
          { p: 'Every ant’s day gets polished before it is scored. The polish is 2-opt: try reversing every stretch of the order, keep the first reversal that lowers the cost, and repeat until none does. It is fifteen lines.' },
          { code: 'localSearch(seq) {\n  const hasDeps = this.deps.length > 0;\n  let best = seq.slice(), bc = this.model.cost(best), improved = true, guard = 0;\n  while (improved && guard++ < 40) {\n    improved = false;\n    for (let i = 0; i < best.length - 1 && !improved; i++)\n      for (let k = i + 1; k < best.length && !improved; k++) {\n        const cand = best.slice(0, i).concat(best.slice(i, k + 1).reverse(), best.slice(k + 1));\n        if (hasDeps && !this.validOrder(cand)) continue;\n        const cc = this.model.cost(cand);\n        if (cc < bc - 1e-12) { best = cand; bc = cc; improved = true; }\n      }\n  }\n  return best;\n}', lang: 'javascript', caption: 'First-improvement 2-opt, index.html:633-647.' },
          { p: 'Start it from the day I typed, with no ants at all, and step through what it does. Each step reverses the highlighted stretch.' },
          { widget: 'twoopt', size: 'wide',
            caption: 'The ported `localSearch` running on the typed day. It accepts 14 reversals and stops at 50.983, 0.837 above the optimum. “Try another start” shuffles the day (seeded) and polishes it again.' },
          { p: 'It makes 14 reversals and drops from 66.906 to 50.983. That is 95% of the way to the optimum, and then it stops, because no single reversal helps any more. It is stuck in a local optimum, 0.84 points short. Press *Try another start* a few times. From a thousand random orders, 2-opt reached 50.146 only 41 times.^[twoopt.js, 1,000 shuffles from a seeded mulberry32. The median finish was 50.500 and the worst 55.028.]' },
          { p: 'So the honest split of the work is this. 2-opt does the descent. Twenty ants an iteration, steered by pheromone, give it twenty different places to start from, and one of them lands in the right valley. With both, the colony found the optimum on 20 of 20 seeds within 10 iterations.' },
          { p: 'In Errand Mode the ants aren’t needed at all. Eight stops make 2,520 distinct round trips, and 2-opt untangles the one I typed in four moves.' },
          { widget: 'errands',
            caption: 'The eight Bengaluru stops from `sampleErrand()`, placed by the app’s own lat/lon projection. Each Step is one accepted 2-opt reversal; the tour goes 40.870 → 35.273 → 29.300 → 28.602 → 26.649 km.' },
          { p: '26.649 km is the shortest of all 2,520 tours. From 1,000 random starts, 2-opt alone found it 1,000 times. The app’s own test says the same thing in its way: the colony ties the best of 500 random tours, because 500 random tours of eight stops already include the best one.',
            notes: [['ties the best of 500 random tours', 'the test passes. it also shows the ants are decoration here']] }
        ]
      },
      {
        id: 'finish', label: 'Round 5', title: 'Converged is not correct',
        blocks: [
          { p: 'The app draws a convergence chart: the best cost found so far, at each iteration. Mine was flat, because with 2-opt on the answer arrives in iteration 1. A flat line looks the same whether it is flat at the optimum or flat somewhere short of it. The chart had no finish line, so I drew one.' },
          { widget: 'converge', size: 'wide',
            caption: 'Top: the seed-1337 run with 2-opt off (a staircase) or on (flat), against the brute-forced optimum, dashed. Bottom: where 20 seeds finish after 100 iterations for each ant count. A filled dot reached the optimum and a hollow square did not. All from runs of the shipped engine.' },
          { p: 'Turn 2-opt off and the colony has to do the work itself. Seed 1337 steps down from 53.656 to 50.549 by iteration 37. Then it stays there for the remaining 63 iterations: converged, and wrong.' },
          { p: 'Evaporation doesn’t fix that. Over twenty seeds with 2-opt off, moving ρ from 0.01 to 0.9 kept the mean result between 50.398 and 50.658, with no trend. Ant count moved it every time. [[4 ants|a4]] reach the line on 0 of 20 seeds and [[120 ants|a120]] on 17. Pure greed, q₀ = 1, is the worst setting of all, with a mean of 54.479.^[sweep.js and the per-seed rerun: 20 seeds, 100 iterations, all other parameters at the app’s defaults.]' },
          { h: 'Rules as gates' },
          { p: 'Focus Mode also takes dependencies, like *finish the report before planning the backlog*. The app never charges a penalty for breaking one, because it never lets an ant break one. A task is only offered once everything it waits on is placed. 2-opt checks again before accepting a reversal, and a rule that would close a loop is refused before the solver ever sees it.' },
          { p: 'That one rule halves the space to 1,814,400 orders and moves the optimum to 50.729; the colony finds it at iteration 5. The four rules in the test suite leave 151,200 orders, 4.17% of the day’s possibilities, and the colony finds their optimum, 50.965, at iteration 2.' }
        ]
      },
      {
        id: 'lives', label: 'Replay', title: 'Three lives of one file',
        blocks: [
          { p: 'The app took three tries to become honest, and the git history keeps all of them.' },
          { table: { head: ['When', 'What it was', 'What a “distance” meant'],
            rows: [
              ['April 2026', 'Classic Ant System over tasks scattered at seeded random 2D points', 'Straight lines between made-up coordinates'],
              ['June 2026', '“antplan”: Flask, SQLAlchemy, Celery and Redis, Postgres 15, a React front end, docker-compose', 'A fitness that guessed deadlines from whether a task sat past 60% of the list'],
              ['August 2026', 'One index.html, 1,393 lines, no dependencies, two test suites with 104 assertions', 'Kilometres for errands, and four penalties you can read for a workday']] },
            caption: 'Commits 063f43d, 3265c28 and e052c5b. The August commit changed 90 files.' },
          { p: 'The April version looked like ant colony optimisation, but its distances meant nothing. The June version put a database and a task queue behind a to-do list. In August I cut it back to one file, where every number is either a kilometre or a penalty with a line of code behind it. It runs in the page below, with the same defaults as the article.' },
          { live: true }
        ]
      }
    ],
    closing: {
      blocks: [
        { p: '**Put pheromone on positions, not just pairs.** Three of the four penalties are about *when* a task happens. Pheromone on edges can only learn what follows what, and the first task is a coin toss. Scheduling versions of ACO keep a trail for each task in each slot, and that is what this cost function needs.' },
        { p: '**Give the ants a nose for deadlines.** In Focus Mode, η only knows category. A heuristic built from due-time slack and priority would let an ant smell the 10:00 standup, instead of waiting for pheromone to tell it.' },
        { p: '**Draw the finish line in the app.** For ten tasks the true optimum is a 1.3-second brute force. The app should compute it, draw it on its convergence chart, and say plainly when the colony has reached it and when it has only stopped moving.' },
        { p: '**Say what the ants add.** In Errand Mode, 2-opt alone found the best tour from 1,000 of 1,000 starts. The page should say that, instead of letting the colony take the credit.' },
        { p: '**Let people edit their tasks.** A task typed into the app gets a random priority from 5 to 8, a random load from 3 to 7, 30 minutes and no due time. A scheduler that makes up its inputs is scoring a day nobody has.' },
        { p: 'And a small one. A comment at the top of the script still says the engine mirrors a “30/30” test suite in a scratchpad file that isn’t in the repo. The real suites have 31 and 73 assertions.' }
      ]
    },
    sources: [
      ['Sample day, errands, cost functions, η, 2-opt', 'github.com/akshayaa-403/anttodo index.html at 14a4446: sampleFocus 424-439, sampleErrand 440-454, cost models 481-542, ACO 545-680. Ported verbatim into this article.'],
      ['66.906, 7.5 deadline, standup ends 11:15', 'Entered order scored with the shipped engine (scratchpad probe.js, re-run 2026-10-17).'],
      ['50.146, 25.1% better, colony order, 9:10 standup', 'ACO seed 1337, 20 ants, 2-opt on, 100 iterations (probe.js); matches test/engine.test.js:80-97 printed output.'],
      ['3,628,800 orders, unique optimum, 89.9%, 10,115 within 5 points, 1.3 s', 'Brute force over all 10! orders with the shipped cost (brute.js and gen.js, Node 24, 2026-10-17). 3,261,322 orders score worse than the typed day.'],
      ['Term ranges in the meters', 'Brute force: deadline 0–59, priority 26–39, context 10–18, energy 11.95–23.49 (terms.js).'],
      ['Context weight 0 → 40.146; deadline-only 218,448 ties', 'brute.js presets ctx0 and deadlineOnly.'],
      ['η 10 vs 0.909, 1,331×, choice percentages', 'index.html:505-508, 564-571, 602-620; field.js and probs.js (effective probabilities include q₀ = 0.1).'],
      ['First task uniform', 'index.html:595-596.'],
      ['τmax 0.1994, τmin 0.00997, two-valued iterations by ρ', 'field.js and sweep2.js: simulated field equals the engine’s τ to 0 difference for ρ = 0.01, 0.05, 0.1, 0.3, 0.5, 0.9.'],
      ['14 reversals, 50.983, 41 of 1,000', 'twoopt.js trace from the typed day; 1,000 shuffled starts.'],
      ['Errands 40.870 → 26.649 km, 2,520 tours, 1,000 of 1,000', 'errand.js (all tours) and twoopt.js.'],
      ['Best-of-500 random tie', 'test/engine.test.js:62-78 printed output (26.65 vs 26.65 km).'],
      ['20 of 20 seeds within 10 iterations', 'sweep.js, 2-opt on, seeds 1–20.'],
      ['Staircase 53.656 → 50.549', 'field.js change points, seed 1337, 2-opt off.'],
      ['ρ means 50.398–50.658; ants 4 → 0/20, 120 → 17/20; q₀ = 1 mean 54.479', 'sweep.js and sweep2.js, 20 seeds, 100 iterations, 2-opt off.'],
      ['Dependencies: 1,814,400 / 50.729 / iteration 5; 151,200 / 4.17% / 50.965 / iteration 2', 'deps.js; test dependencies from test/engine.test.js:99-118.'],
      ['History', 'git show 063f43d:js/utils.js (random coordinates), 3265c28:backend/requirements.txt and backend/src/core/fitness.py:30, git log --shortstat e052c5b (90 files). 1,393 lines: wc -l index.html.'],
      ['104 assertions', 'test/engine.test.js (31) and test/ui.test.js (73), run 2026-10-16.'],
      ['Typed-in tasks', 'index.html:1251-1271.']
    ],
    widgets: { game: game, nose: nose, ledger: ledger, twoopt: twoopt, errands: errands, converge: converge }
  });
})();
