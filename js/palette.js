/* The palette — one Sanzo Wada combination, driving the whole site.

   This used to live inside js/field.js and colour only the graph's dots. It
   now sits on its own and on every page, because the three colours are the
   site's accent family while graph mode is on: links, buttons, chips, rules,
   the marginalia, the gutter figures and the graph itself all come out of the
   same three.

   WHERE THE COLOURS COME FROM
   Sanzo Wada's *A Dictionary of Color Combinations* (1933-34), the study of
   colour harmony: 348 combinations, of which 120 are exactly three colours
   wide. The 105 kept below are those 120 minus the ones whose three colours
   stop being told apart once lightness is bent to the theme. Hue and
   saturation are always Wada's — the harmony he published lives in those.

   WHEN IT ROLLS
   Once per session, kept in sessionStorage. A refresh inside the same tab
   keeps the palette, so clicking from the home page into a case study does
   not change the site's colour underneath the reader; a new tab is a new
   session and a new combination.

   WHEN IT APPLIES
   Only in graph mode. Mosaic returns the site to the navy sampled from the
   favicon, because mosaic is the arrangement that shows real artifacts and
   they should sit on the site's own colour rather than on a borrowed one.

   HOW IT STAYS READABLE
   Nothing here is used at the value Wada wrote down. Every token is stepped
   toward the safe end until it MEASURES against the current ground: 4.5:1 for
   anything that carries text, 3:1 for a mark, 7:1 for the deep tier. HSL
   lightness is not luminance — a Wada yellow at L 46% is invisible on paper
   and a deep blue at L 46% is invisible in dark mode — so the loop below
   tests real relative luminance and stops when it passes, rather than
   trusting a number that looks about right.

   Which way to step is decided from the ground's own measured luminance, not
   from `data-theme`, which is absent when the OS is deciding.

   Loaded on every page, after js/util.js and before js/field.js. */
(function () {
  'use strict';

  var WADA = window.__WADA__ || [];

  var root = document.documentElement;

  /* ---------- colour maths ----------
     Small, exact, and shared: js/field.js and js/figures.js both read these
     off window.portfolioPalette rather than keeping a second copy that can
     drift. */

  function toHsl(css) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(css || '').trim());
    if (!m) return null;
    var r = parseInt(m[1], 16) / 255,
        g = parseInt(m[2], 16) / 255,
        b = parseInt(m[3], 16) / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    var l = (mx + mn) / 2, h = 0, s = 0;
    if (d) {
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0));
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return { h: h, s: s * 100, l: l * 100 };
  }

  function hslRgb(h, sa, l) {
    h /= 360; sa /= 100; l /= 100;
    var c = function (t) {
      t = (t % 1 + 1) % 1;
      var q = l < 0.5 ? l * (1 + sa) : l + sa - l * sa, p = 2 * l - q;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return [c(h + 1 / 3), c(h), c(h - 1 / 3)];
  }

  function lum(rgb) {
    var a = rgb.map(function (v) {
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }

  function ratio(a, b) {
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }

  function css(hsl) {
    return 'hsl(' + hsl.h.toFixed(0) + ',' + hsl.s.toFixed(0) + '%,' + hsl.l.toFixed(0) + '%)';
  }

  /* Step `base` toward the readable end until it clears `need` against the
     ground, then return it. Hue and saturation are never touched. `startLo`
     and `startHi` clamp where the walk begins, so a colour that is already
     far too pale does not have to walk the whole scale. */
  function meet(base, need, dark, gl, startLo, startHi) {
    if (!base) return null;
    var s = Math.min(92, base.s);
    var l = Math.max(startLo, Math.min(startHi, base.l));
    var step = dark ? 2 : -2;
    for (var k = 0; k < 48 && l > 2 && l < 98; k++) {
      if (ratio(lum(hslRgb(base.h, s, l)), gl) >= need) break;
      l += step;
    }
    return { h: base.h, s: s, l: l };
  }

  /* The other direction: pull a colour toward the ground until it is only
     just visible. Used for the decorative pale tier, which must NOT meet a
     text bar — it is a wash behind something else, and a wash that passes
     4.5:1 is not a wash. */
  function soften(base, cap, dark, gl) {
    if (!base) return null;
    var s = Math.min(70, base.s);
    var l = dark ? 30 : 78;
    var step = dark ? -2 : 2;
    for (var k = 0; k < 40 && l > 2 && l < 98; k++) {
      if (ratio(lum(hslRgb(base.h, s, l)), gl) <= cap) break;
      l += step;
    }
    return { h: base.h, s: s, l: l };
  }

  function rgbaOf(hsl, alpha) {
    var c = hslRgb(hsl.h, hsl.s, hsl.l).map(function (v) {
      return Math.round(v * 255);
    });
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + alpha + ')';
  }

  /* ---------- which combination ---------- */

  /* One combination for as long as this tab is open, so the site does not
     change colour underneath someone navigating it. For a different cadence,
     replace the two sessionStorage lines: `Date.now() / 864e5 % WADA.length`
     is one a day, and dropping them entirely is one per page load. */
  function pick() {
    if (!WADA.length) return 0;
    var key = 'portfolio:palette';
    try {
      var saved = window.sessionStorage.getItem(key);
      if (saved !== null && WADA[+saved]) return +saved;
      var n = Math.floor(Math.random() * WADA.length);
      window.sessionStorage.setItem(key, String(n));
      return n;
    } catch (err) {
      // Private mode, or storage blocked. A palette for this page is better
      // than no palette at all.
      return Math.floor(Math.random() * WADA.length);
    }
  }

  var INDEX = pick();
  var TRIO = WADA[INDEX] || ['#094e94', '#00317a', '#80b1d7'];

  /* ---------- the tokens ----------
     Every accent in css/style.css is re-derived from the three, in apply()
     below. Grounds (--bg*) and inks (--ink*) are deliberately NOT touched:
     they are the paper and the writing, they carry all the body text, and
     rebuilding them out of an arbitrary 1933 colour is how a page becomes
     unreadable. The palette is the accent, not the paper.

     What was written last time is remembered rather than listed twice — a
     hand-kept list of token names beside the object that sets them is two
     lists to keep in step, and one of them always rots. */
  var written = [];

  var state = { index: INDEX, trio: TRIO, on: false, colours: {} };

  function ground() {
    var cs = getComputedStyle(root);
    var bg = (cs.getPropertyValue('--bg') || '').trim() || '#f4f7fa';
    var g = toHsl(bg);
    var dark = !!g && g.l < 50;
    return { dark: dark, gl: g ? lum(hslRgb(g.h, g.s, g.l)) : (dark ? 0.01 : 0.9) };
  }

  function apply() {
    // Only graph mode wears the palette. Mosaic goes back to the navy the
    // brand mark was sampled from.
    var on = root.getAttribute('data-mode') !== 'mosaic';

    if (!on) {
      written.forEach(function (t) { root.style.removeProperty(t); });
      written = [];
      state.on = false;
      state.colours = {};
      emit();
      return;
    }

    var g = ground();
    var a = toHsl(TRIO[0]), b = toHsl(TRIO[1]), c = toHsl(TRIO[2]);

    // Text tier: anything a sentence is set in has to clear 4.5:1.
    var accent = meet(a, 4.5, g.dark, g.gl, g.dark ? 50 : 26, g.dark ? 70 : 46);
    // Deep tier: a solid ground for a filled button, held to 7:1 so the
    // label on it has room whichever way --on-accent-deep lands.
    var deep = meet(b, 7, g.dark, g.gl, g.dark ? 56 : 16, g.dark ? 76 : 36);
    // Mark tier: borders, chips, rules. 3:1 is the non-text bar.
    var mid = meet(c, 3, g.dark, g.gl, g.dark ? 44 : 34, g.dark ? 64 : 54);
    // Wash tier: deliberately under the bar. It sits behind things.
    var pale = soften(c, 1.9, g.dark, g.gl);
    var hover = meet(a, 7, g.dark, g.gl, g.dark ? 58 : 20, g.dark ? 78 : 40);

    // The label on a filled --accent-deep button, chosen by measuring the
    // button rather than by assuming white works. Same test the reading
    // shelf's spines use.
    var dl = lum(hslRgb(deep.h, deep.s, deep.l));
    var onDeep = ratio(dl, lum([1, 1, 1])) >= ratio(dl, lum([0.04, 0.06, 0.09]))
      ? '#fbfcfd' : '#0a1420';

    // Text over a photograph's dark gradient, never over the page ground, so
    // it is measured against that gradient instead.
    var onPhoto = meet(a, 4.5, true, lum([0.05, 0.07, 0.1]), 56, 76);

    var out = {
      '--accent': css(accent),
      '--accent-ink': css(accent),
      '--link': css(accent),
      '--accent-hover': css(hover),
      '--accent-deep': css(deep),
      '--accent-mid': css(mid),
      '--accent-pale': css(pale),
      '--accent-tint': rgbaOf(accent, 0.09),
      '--accent-tint-strong': rgbaOf(accent, 0.18),
      '--on-accent-deep': onDeep,
      '--on-photo-accent': css(onPhoto),
      // The graph's three keep their own names so field.js and the legend
      // need no special case: they are simply the same three. 4.5:1 is the
      // hub's bar, and field.js ramps the smaller dots down from it to 3:1 —
      // so the swatch in the legend is exactly the hub it stands for.
      // Bands swapped, to match shade() in js/field.js: the graph wears the
      // dark theme's lightness band on paper and the light theme's on a dark
      // ground. `meet` still walks each one until it measures 4.5:1 against
      // the ground it is actually on, so the swap changes the colour and
      // never the contrast.
      '--graph-projects': css(meet(a, 4.5, g.dark, g.gl, g.dark ? 26 : 46, g.dark ? 46 : 66)),
      '--graph-hobbies': css(meet(b, 4.5, g.dark, g.gl, g.dark ? 26 : 46, g.dark ? 46 : 66)),
      '--graph-resources': css(meet(c, 4.5, g.dark, g.gl, g.dark ? 26 : 46, g.dark ? 46 : 66))
    };

    written = Object.keys(out);
    written.forEach(function (t) { root.style.setProperty(t, out[t]); });

    state.on = true;
    state.colours = out;
    state.dark = g.dark;
    state.groundLum = g.gl;
    emit();
  }

  var listeners = [];
  function emit() {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](state); } catch (err) { /* a bad listener is not fatal */ }
    }
  }

  /* The public surface. field.js and figures.js use `shade` to ramp a
     category's colour by size or depth, exactly as field.js used to do
     internally. */
  window.portfolioPalette = {
    trio: function () { return TRIO.slice(); },
    index: function () { return INDEX; },
    state: function () { return state; },
    toHsl: toHsl,
    hslRgb: hslRgb,
    lum: lum,
    ratio: ratio,
    css: css,
    meet: meet,
    rgba: rgbaOf,

    /* One colour of the trio, stepped to `need` against the current ground.
       `t` in 0..1 lightens it toward the pale end as it gets smaller. */
    shade: function (i, need, t) {
      var g = ground();
      var base = toHsl(TRIO[i % TRIO.length]);
      if (!base) return '#094e94';
      var lift = (t || 0) * 22;
      var start = g.dark
        ? { lo: 46 + lift, hi: 66 + lift }
        : { lo: 26 + lift, hi: 46 + lift };
      return css(meet(base, need == null ? 3 : need, g.dark, g.gl, start.lo, start.hi));
    },

    /* One colour of the trio, stepped until it clears `need` against a
       ground that is NOT the page's — a figure that draws its own dark field
       (a micrograph is dark in any theme) has to measure against that field,
       or it hands back a colour that was correct for the paper it is not
       sitting on. */
    against: function (i, need, groundHex) {
      var g = toHsl(groundHex);
      if (!g) return '#ffffff';
      var gl = lum(hslRgb(g.h, g.s, g.l));
      var dark = g.l < 50;
      var base = toHsl(TRIO[i % TRIO.length]);
      if (!base) return dark ? '#ffffff' : '#000000';
      return css(meet(base, need == null ? 3 : need, dark, gl,
                      dark ? 46 : 26, dark ? 78 : 46));
    },

    /* Called whenever the palette is re-applied — a theme flip or a mode
       change. Fires immediately with the current state so a caller never has
       to handle "not yet". */
    on: function (fn) {
      listeners.push(fn);
      try { fn(state); } catch (err) {}
    }
  };

  apply();

  // The ground moves when the theme flips, so every measured step has to be
  // walked again. data-mode decides whether the palette applies at all.
  new MutationObserver(apply).observe(root, {
    attributes: true, attributeFilter: ['data-theme', 'data-mode']
  });
})();
