/* The header, shared by every page. Three jobs, all of them the bar's own:

   1. the narrow-screen panel. The links leave the bar below 899.98px, which is
      the same breakpoint the CSS moves them at. Without this the panel has
      nothing to set [hidden] and floats permanently over the page on phones.
   2. hide on the way down, show on the way up. After emilycampbell.co: the bar
      is fixed and transparent, so it would otherwise sit on top of the reading
      for the whole page. It leaves on a downward scroll and comes back the
      moment the reader turns round, which is when a nav is wanted.
   3. the clock and the greeting on the right, from the reader's own clock. */
(function () {
  'use strict';

  function init() {
    var btn = document.querySelector('[data-nav-toggle]');
    var nav = document.getElementById('primary-nav');
    if (!btn || !nav) return;

    var mq = window.matchMedia('(max-width: 899.98px)');

    function close() {
      nav.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
    function open() {
      nav.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      // Move focus into the panel so keyboard and screen-reader users land
      // where the menu opened rather than being left behind on the button.
      var first = nav.querySelector('a');
      if (first) first.focus();
    }
    function sync() {
      if (mq.matches) {
        close();
      } else {
        // Wide layout: the nav is a plain visible row, not a disclosure, so
        // the button's expanded state is meaningless — drop it entirely
        // rather than claiming "collapsed" about something on screen.
        nav.hidden = false;
        btn.removeAttribute('aria-expanded');
      }
    }

    btn.addEventListener('click', function () {
      if (btn.getAttribute('aria-expanded') === 'true') { close(); } else { open(); }
    });

    nav.addEventListener('click', function (e) {
      // closest(), not tagName: a click can land on a child <span> or <svg>.
      if (mq.matches && e.target.closest && e.target.closest('a')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mq.matches && btn.getAttribute('aria-expanded') === 'true') {
        close();
        btn.focus();
      }
    });

    mq.addEventListener('change', sync);
    sync();
  }

  /* ---------- hide on the way down, show on the way up ----------
     Three states, the reference's own: `top` while the page is at the top,
     `hidden` once the reader has gone down past the bar's own height, and
     `revealed` the moment they come back up. The panel being open pins it
     open — a menu that slides away under the reader's finger is a bug. */
  function initReveal() {
    var header = document.getElementById('site-header');
    if (!header) return;

    var last = window.scrollY, ticking = false;

    function update() {
      ticking = false;
      var y = window.scrollY;
      var open = header.querySelector('[data-nav-toggle][aria-expanded="true"]');

      if (y <= 8) header.setAttribute('data-nav-state', 'top');
      else if (open) header.setAttribute('data-nav-state', 'revealed');
      // The 6px of slop is what stops a trackpad's jitter flickering the bar.
      else if (y > last + 6 && y > header.offsetHeight) {
        header.setAttribute('data-nav-state', 'hidden');
      } else if (y < last - 6) {
        header.setAttribute('data-nav-state', 'revealed');
      }
      last = y;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  /* ---------- the clock ----------
     The reader's own local time and the greeting that goes with it, in the
     right-hand slot. Ticks on the minute rather than the second: nothing here
     needs a second hand, and a repaint every second for decoration is rude to
     a battery. */
  function initClock() {
    var t = document.querySelector('[data-clock-time]');
    var g = document.querySelector('[data-clock-greeting]');
    if (!t && !g) return;

    function greeting(h) {
      if (h < 5) return 'Good night';
      if (h < 12) return 'Good morning';
      if (h < 17) return 'Good afternoon';
      if (h < 22) return 'Good evening';
      return 'Good night';
    }

    function tick() {
      var d = new Date();
      var h = d.getHours();
      var h12 = h % 12 || 12;
      if (t) {
        t.textContent = (h12 < 10 ? '0' : '') + h12 + ':' +
          (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() +
          (h < 12 ? ' AM' : ' PM');
      }
      if (g) g.textContent = greeting(h);
      // Line up with the wall clock rather than drifting a second per minute.
      window.setTimeout(tick, 60000 - (d.getSeconds() * 1000 + d.getMilliseconds()));
    }
    tick();
  }

  window.onReady(function () {
    init();
    initReveal();
    initClock();
  });
})();
