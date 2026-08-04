/* Squiggle effect — a direct port of the "Squiggle Effect" component used on
   jackiehu.design's About paragraphs.

   Each target gets its own feTurbulence + feDisplacementMap filter. Every
   `delay` ms the turbulence `seed` is reassigned to a fresh random integer and
   the displacement `scale` jitters within ±strength% of its base, which makes
   the text edges shimmer like wet ink. It is a discrete state swap — no
   interpolation, no easing — running independently of scroll.

   Reference values: frequency 2 (baseFrequency = 2/100 * 1.1^(octaves-1) =
   0.02), octaves 1, scale 2, strength 5, delay 100ms.

   Skipped entirely under prefers-reduced-motion: a permanent 10fps shimmer is
   exactly the kind of motion that rule exists to suppress. */
(function () {
  'use strict';

  var FREQUENCY = 2;
  var OCTAVES = 1;
  var SCALE = 2;
  var STRENGTH = 5;
  var DELAY = 100;

  var NS = 'http://www.w3.org/2000/svg';
  var uid = 0;

  function baseFrequency() {
    return (FREQUENCY / 100) * Math.pow(1.1, OCTAVES - 1);
  }

  function attach(el) {
    var id = 'squiggle-' + (++uid);

    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.cssText = 'position:absolute;width:0;height:0';

    var defs = document.createElementNS(NS, 'defs');
    var filter = document.createElementNS(NS, 'filter');
    filter.setAttribute('id', id);
    filter.setAttribute('color-interpolation-filters', 'sRGB');

    var turb = document.createElementNS(NS, 'feTurbulence');
    turb.setAttribute('type', 'fractalNoise');
    turb.setAttribute('baseFrequency', String(baseFrequency()));
    turb.setAttribute('numOctaves', String(OCTAVES));
    turb.setAttribute('seed', String(Math.floor(Math.random() * 1000)));
    turb.setAttribute('stitchTiles', 'stitch');

    var disp = document.createElementNS(NS, 'feDisplacementMap');
    disp.setAttribute('in', 'SourceGraphic');
    disp.setAttribute('scale', String(SCALE));
    disp.setAttribute('xChannelSelector', 'R');
    disp.setAttribute('yChannelSelector', 'G');

    filter.appendChild(turb);
    filter.appendChild(disp);
    defs.appendChild(filter);
    svg.appendChild(defs);
    el.parentNode.insertBefore(svg, el);

    el.style.filter = 'url(#' + id + ')';

    return function tick() {
      var jitter = SCALE * (STRENGTH / 100);
      var scale = SCALE + (Math.random() * 2 - 1) * jitter;
      turb.setAttribute('seed', String(Math.floor(Math.random() * 1000)));
      disp.setAttribute('scale', String(scale));
    };
  }

  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var targets = document.querySelectorAll('[data-squiggle]');
    if (!targets.length) return;

    var ticks = [];
    for (var i = 0; i < targets.length; i++) ticks.push(attach(targets[i]));

    var timer = window.setInterval(function () {
      for (var j = 0; j < ticks.length; j++) ticks[j]();
    }, DELAY);

    // Don't burn cycles animating an invisible tab.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        window.clearInterval(timer);
        timer = null;
      } else if (!timer) {
        timer = window.setInterval(function () {
          for (var k = 0; k < ticks.length; k++) ticks[k]();
        }, DELAY);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
