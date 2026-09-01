/* Mobile menu, shared by every page.
   The nav collapses into a toggleable panel at the same breakpoint the CSS
   absolutely-positions it (899.98px). Without this the panel has nothing to
   set [hidden] and floats permanently over the page on phones. */
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

    if (mq.addEventListener) { mq.addEventListener('change', sync); }
    else if (mq.addListener) { mq.addListener(sync); }
    sync();
  }

  window.onReady(init);
})();
