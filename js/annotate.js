/* ==========================================================================
   Annotate — dev-only comment layer. Enable with ?edit=1; never loaded
   otherwise. Works on every page (no dependency on the hero stage).

     Alt-click anywhere   drop a comment pin at that spot
     click a pin          edit / delete it
     C                    copy all comments on this page to clipboard

   Comments are keyed to the nearest element (id, or a short CSS path) plus a
   percentage offset within it, so the dump tells Claude *what* you meant even
   after layout shifts. Nothing is persisted — reload clears the layer.
   ========================================================================== */
(function () {
  'use strict';

  if (!window.isEditing()) return;

  var pins = [];   // {x, y, text, target, el}

  /* A short, human-readable locator for the element under a point. */
  function locate(el) {
    if (!el || el === document.body) return 'page';
    if (el.id) return '#' + el.id;
    var tag = el.tagName.toLowerCase();
    var cls = (el.className && typeof el.className === 'string')
      ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
      : '';
    var txt = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30);
    return tag + cls + (txt ? ' "' + txt + (el.textContent.trim().length > 30 ? '…' : '') + '"' : '');
  }

  function addPin(clientX, clientY) {
    var under = document.elementFromPoint(clientX, clientY);
    // Ignore our own UI.
    if (under && under.closest('.annot-pin, .annot-bar, .annot-edit')) return;
    var target = locate(under);
    var r = under ? under.getBoundingClientRect() : { left: 0, top: 0, width: 1, height: 1 };
    var offx = ((clientX - r.left) / r.width * 100).toFixed(0);
    var offy = ((clientY - r.top) / r.height * 100).toFixed(0);

    var pin = {
      x: clientX + window.scrollX,
      y: clientY + window.scrollY,
      text: '',
      target: target + ' @ ' + offx + '%,' + offy + '%'
    };
    var el = document.createElement('div');
    el.className = 'annot-pin';
    el.style.cssText = 'position:absolute;left:' + pin.x + 'px;top:' + pin.y +
      'px;transform:translate(-50%,-100%);z-index:100000;width:22px;height:22px;' +
      'border-radius:50% 50% 50% 0;background:#e0592a;box-shadow:0 2px 8px rgba(0,0,0,.4);' +
      'cursor:pointer;transform-origin:bottom;rotate:-45deg;font:bold 12px system-ui;' +
      'color:#fff;display:grid;place-items:center';
    var num = document.createElement('span');
    num.style.rotate = '45deg';
    num.textContent = pins.length + 1;
    el.appendChild(num);
    el.addEventListener('click', function (e) { e.stopPropagation(); editPin(pin); });
    document.body.appendChild(el);
    pin.el = el;
    pins.push(pin);
    editPin(pin);
  }

  var editor = null;
  function editPin(pin) {
    if (editor) editor.remove();
    editor = document.createElement('div');
    editor.className = 'annot-edit';
    editor.style.cssText = 'position:absolute;left:' + pin.x + 'px;top:' + (pin.y + 6) +
      'px;z-index:100001;width:240px;background:rgba(12,22,38,.96);color:#dbe8f5;' +
      'border-radius:10px;padding:10px;box-shadow:0 8px 30px rgba(0,0,0,.4);' +
      'font:12px/1.4 system-ui';
    var ta = document.createElement('textarea');
    ta.value = pin.text;
    ta.placeholder = 'What change do you want here?';
    ta.style.cssText = 'width:100%;height:70px;background:#0c1620;color:#dbe8f5;' +
      'border:1px solid #2a3a4d;border-radius:6px;padding:6px;font:12px/1.4 system-ui;' +
      'resize:vertical;box-sizing:border-box';
    var del = document.createElement('button');
    del.textContent = 'Delete';
    del.style.cssText = 'margin-top:6px;background:#e0592a;color:#fff;border:0;' +
      'border-radius:6px;padding:5px 10px;cursor:pointer;font:12px system-ui';
    del.addEventListener('click', function () {
      pin.el.remove();
      pins.splice(pins.indexOf(pin), 1);
      pins.forEach(function (p, i) { p.el.firstChild.textContent = i + 1; });
      editor.remove(); editor = null;
    });
    ta.addEventListener('input', function () { pin.text = ta.value; });
    editor.appendChild(ta);
    editor.appendChild(del);
    document.body.appendChild(editor);
    ta.focus();
  }

  function bar() {
    var b = document.createElement('div');
    b.className = 'annot-bar';
    b.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:100002;' +
      'background:rgba(12,22,38,.94);color:#dbe8f5;font:11px/1.4 system-ui;' +
      'padding:8px 12px;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.35)';
    b.innerHTML = 'ANNOTATE — <b>Alt-click</b> to comment · <b>C</b> to copy all';
    document.body.appendChild(b);
  }

  function dumpComments() {
    if (!pins.length) return '';
    var lines = ['/* ---- comments: ' + location.pathname.split('/').pop() +
                 (location.search.replace(/[?&]edit=1/, '') || '') + ' ---- */'];
    pins.forEach(function (p, i) {
      lines.push((i + 1) + '. [' + p.target + ']\n   ' + (p.text || '(empty)'));
    });
    return lines.join('\n');
  }
  // Let the layout editor fold comments into its own D-dump.
  window.__annotDump = dumpComments;

  function copyComments() {
    var out = dumpComments();
    if (!out) return;
    try { navigator.clipboard.writeText(out); } catch (e) {}
    console.log(out);
    var b = document.querySelector('.annot-bar');
    if (b) { b.innerHTML = 'copied ' + pins.length + ' comment(s) — paste to Claude'; }
  }

  document.addEventListener('click', function (e) {
    if (e.altKey) { e.preventDefault(); addPin(e.clientX, e.clientY); }
  });
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'c' || e.key === 'C') &&
        !/textarea|input/i.test((e.target.tagName || ''))) copyComments();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bar);
  } else { bar(); }
})();
