/* ENGINE SMOKE TEST — replaced by the real article. */
Article.register('anttodo', {
  form: 'audit',
  scramble: '01{}[]<>~#',
  dek: 'A colony of 20 virtual ants rearranged my Tuesday. Then I checked all **3,628,800** other Tuesdays.',
  opener: function (c) {
    return '<circle cx="64" cy="64" r="40" fill="none" stroke="' + c.a + '" stroke-width="2"/>';
  },
  chapters: [
    { id: 'day', label: 'Exhibit A', title: 'The day, and every other day', art: function (c) { return '<circle cx="80" cy="60" r="40" fill="none" stroke="' + c.a + '" stroke-width="2"/><circle cx="80" cy="60" r="6" fill="' + c.i + '"/>'; }, blocks: [
      { p: 'This paragraph has `code`, **strong**, *emphasis*, a [link](https://example.com), a [[linked term|bar]] and a live value: {{w|0.40}}.^[Measured by brute force in Node 24.]',
        notes: [['linked term', 'a note in the margin, in her hand'], ['live value', 'and one on the other side']] },
      { widget: 'demo', caption: 'Drag the slider: the bar and the {{w}} in the prose both follow.', size: 'wide' },
      { quote: 'Converged is not the same as correct.', cite: 'the brute force' },
      { callout: 'The colony found the unique optimum.\n\nSecond paragraph.', label: 'Verdict' },
      { list: ['one', 'two `x`'], ordered: true },
      { code: 'def f(x):\n    return x * 2', lang: 'python', caption: 'a code block' },
      { tex: 'P_{ij} = \\frac{\\tau_{ij}^\\alpha \\eta_{ij}^\\beta}{\\sum_k \\tau_{ik}^\\alpha \\eta_{ik}^\\beta}', caption: 'the rule' },
      { table: { head: ['k', 'v'], rows: [['a', '1'], ['b', '2']] }, caption: 'a table' },
      { figure: 'public/assets/projects/anttodo-app.webp', alt: 'app', caption: 'a figure', size: 'wide' },
      { live: true }
    ] },
    { id: 'steps', label: 'Exhibit B', title: 'Scrolly', blocks: [
      { p: 'Before the scrolly.' },
      { scrolly: 'demo2', caption: 'pinned', steps: [
        { p: 'Step one sets n to 1.', state: { n: 1 } },
        { p: 'Step two sets n to 2.', state: { n: 2 } },
        { p: 'Step three sets n to 3.', state: { n: 3 } }
      ] },
      { p: 'After, with a second note.^[Second footnote.]' }
    ] }
  ],
  closing: { blocks: [{ p: 'Closing words.' }] },
  sources: [['Brute force', 'Node 24, 1.3 s.']],
  widgets: {
    ledger: function (host, kit) {
      var r = kit.readout('Chapter', '—');
      host.appendChild(r.el);
      kit.onChapter(function (ch) { r.set(ch); });
    },
    demo: function (host, kit) {
      var c = kit.canvas(host, { height: 120, draw: function (ctx, w, h) {
        var col = kit.colors();
        ctx.fillStyle = col.accent;
        ctx.fillRect(0, h / 3, w * s.value(), h / 3);
        ctx.strokeStyle = col.lineStrong;
        ctx.strokeRect(0.5, h / 3, w - 1, h / 3);
      } });
      var s = kit.slider({ label: 'Weight', min: 0, max: 1, step: 0.05, value: 0.4,
        format: function (v) { return v.toFixed(2); },
        onInput: function (v) { kit.live('w', v.toFixed(2)); c.draw(); } });
      var row = kit.el('div', { class: 'k-row' }, s.el,
        kit.choice({ label: 'Mode', options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], value: 'a' }).el);
      host.insertBefore(row, c.el);
      kit.onKey(function (k) { host.style.outline = k ? '2px solid red' : ''; });
      c.draw();
    },
    demo2: function (host, kit) {
      var r = kit.readout('n', '0', 'k-readout--accent');
      host.appendChild(r.el);
      host.appendChild(kit.el('div', { style: { height: '240px' } }));
      return { set: function (st) { r.set(String(st.n)); } };
    }
  }
});
