#!/usr/bin/env node
/* Generate static share pages so link previews work.
 *
 * Twitter, LinkedIn, Slack and Discord do not run JavaScript, so
 * project.html?id=x — which writes its <title>/description client-side —
 * previews as the generic "Project — Akshayaa Kashyap" everywhere it is
 * shared. One document cannot carry seven different previews.
 *
 * This writes one real HTML file per project and per hobby, each carrying its
 * own title, description and OG tags, and each redirecting a JS-capable
 * visitor straight to the existing renderer. Crawlers read the meta; people
 * land on the real page.
 *
 * The site itself stays buildless — nothing here runs at serve time. Re-run
 * this whenever js/project-data.js or the hobby groups change:
 *
 *     node tools/build-share-pages.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const { ROOT, esc, loadProjects, loadHobbies } = require('./data');

const BASE = 'https://akshayaa-403.github.io/portfolio/';
const OG_FALLBACK = BASE + 'public/assets/og-card.png';

/* Assets are referenced one level up, since these live in work/ and hobbies/. */
function page(o) {
  const target = esc(o.target);
  return [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>' + esc(o.title) + '</title>',
    '<meta name="description" content="' + esc(o.description) + '">',
    '<meta name="author" content="Akshayaa Kashyap">',
    '<meta name="referrer" content="strict-origin-when-cross-origin">',
    '<meta name="theme-color" content="#f4f7fa" media="(prefers-color-scheme: light)">',
    '<meta name="theme-color" content="#0c1620" media="(prefers-color-scheme: dark)">',
    '<link rel="canonical" href="' + esc(o.canonical) + '">',
    '',
    '<meta property="og:type" content="article">',
    '<meta property="og:site_name" content="Akshayaa Kashyap">',
    '<meta property="og:locale" content="en_US">',
    '<meta property="og:title" content="' + esc(o.title) + '">',
    '<meta property="og:description" content="' + esc(o.description) + '">',
    '<meta property="og:url" content="' + esc(o.canonical) + '">',
    '<meta property="og:image" content="' + esc(o.image) + '">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="' + esc(o.title) + '">',
    '<meta name="twitter:description" content="' + esc(o.description) + '">',
    '<meta name="twitter:image" content="' + esc(o.image) + '">',
    '',
    '<link rel="icon" href="../public/assets/favicon.webp" type="image/webp">',
    '<link rel="icon" href="../public/assets/favicon.png" type="image/png">',
    '<link rel="apple-touch-icon" href="../public/assets/favicon.png">',
    '',
    '<!-- A visitor with JS goes straight to the real renderer; a crawler stays',
    '     here and reads the metadata above. replace() keeps this page out of',
    '     the back-button history, so Back returns where they came from. -->',
    '<script>location.replace(' + JSON.stringify('../' + o.target) + ');</script>',
    '<meta http-equiv="refresh" content="0; url=../' + target + '">',
    '<style>',
    '  body { margin:0; padding:48px 24px; background:#f4f7fa; color:#00317a;',
    '         font:16px/1.6 ui-monospace, "IBM Plex Mono", Menlo, monospace; }',
    '  main { max-width:640px; margin:0 auto; }',
    '  a { color:#094e94; }',
    '  @media (prefers-color-scheme: dark) {',
    '    body { background:#0c1620; color:#cfe0f5; } a { color:#8fb8e8; }',
    '  }',
    '</style>',
    '</head>',
    '<body>',
    '<main>',
    '  <h1>' + esc(o.heading) + '</h1>',
    '  <p>' + esc(o.body) + '</p>',
    '  <p><a href="../' + target + '">Continue to the full page</a> &middot;',
    '     <a href="../index.html">Home</a></p>',
    '</main>',
    '</body>',
    '</html>',
    ''
  ].join('\n');
}

/* ---------- write ---------- */

function writeAll() {
  const written = [];

  const outWork = path.join(ROOT, 'work');
  const outHob = path.join(ROOT, 'hobbies');
  fs.mkdirSync(outWork, { recursive: true });
  fs.mkdirSync(outHob, { recursive: true });

  for (const p of loadProjects()) {
    // Prefer the project's own thumbnail for the preview card; fall back to
    // the site card when there is no image for it.
    const thumb = 'public/assets/work/' + p.id + '-thumb.webp';
    const image = p.thumb !== false && fs.existsSync(path.join(ROOT, thumb)) ? BASE + thumb : OG_FALLBACK;
    const file = path.join(outWork, p.id + '.html');
    fs.writeFileSync(file, page({
      title: p.title + ' — Akshayaa Kashyap',
      description: p.summary || p.tagline,
      canonical: BASE + 'work/' + p.id + '.html',
      target: 'project.html?id=' + encodeURIComponent(p.id),
      image: image,
      heading: p.title,
      body: p.tagline || ''
    }));
    written.push(path.relative(ROOT, file));
  }

  const groups = loadHobbies();
  for (const id of Object.keys(groups)) {
    const g = groups[id];
    const shot = 'public/assets/hobbies/' + id + '-1.webp';
    const image = fs.existsSync(path.join(ROOT, shot)) ? BASE + shot : OG_FALLBACK;
    const file = path.join(outHob, id + '.html');
    fs.writeFileSync(file, page({
      title: g.label + ' — Akshayaa Kashyap',
      description: g.blurb || g.note,
      canonical: BASE + 'hobbies/' + id + '.html',
      target: 'hobby.html?id=' + encodeURIComponent(id),
      image: image,
      heading: g.label,
      body: g.note || ''
    }));
    written.push(path.relative(ROOT, file));
  }

  return written;
}

/* ---------- static project list ----------
   Everything on the home page is injected by JS, which means a crawler, a
   corporate proxy that strips scripts, or anyone reading with JS off saw an
   empty column where the work should be. The project list is the one block
   that must survive that, so it is written into index.html here, between two
   markers, and js/script.js replaces it with the enhanced version when it
   runs. Same data, same order, same links — only the hover cues and the
   reveal animation are missing from the static copy.

   Re-run this tool after editing js/project-data.js and the block updates. */
const LIST_BEGIN = '<!-- BEGIN generated:project-list — written by tools/build-share-pages.js, do not hand-edit -->';
const LIST_END = '<!-- END generated:project-list -->';

/* Must stay in step with GROUPS and renderCards() in js/script.js — this is
   the same list rendered twice, and the whole point is that a reader with no
   JavaScript sees what a reader with JavaScript sees. */
const GROUPS = [
  { key: 'research', title: 'Research',
    note: 'Systems that measure something and report the number, including when the number is bad.' },
  { key: 'products', title: 'Products',
    note: 'Things built for someone else to open — a shop and a phone app.' }
];

function rowHtml(p, n, lead) {
  const focus = (p.tech || []).slice(0, 4).map(esc)
    .join(' <span aria-hidden="true">/</span> ');
  // Same span rule as span() in js/script.js: the real years, not p.year.
  const a = (p.created || '').slice(0, 4);
  const b = (p.updated || '').slice(0, 4);
  const years = a ? (a === b ? a : a + '–' + b) : (p.year || '');
  const meta = [p.context || p.role, years].filter(Boolean).map(esc).join(' · ');

  return '          <a class="rm' + (lead ? ' rm--lead' : '') +
      '" href="work/' + encodeURIComponent(p.id) + '.html">' +
      '<span class="rm__num" aria-hidden="true">' + (n < 10 ? '0' : '') + n + '</span>' +
      '<span class="rm__text">' +
        '<span class="rm__title">' + esc(p.title) + '</span>' +
        (meta ? '<span class="rm__meta">' + meta + '</span>' : '') +
        '<span class="rm__desc">' + esc(p.tagline) + '</span>' +
        (p.metric ? '<span class="rm__metric">' + esc(p.metric) + '</span>' : '') +
        (focus ? '<span class="rm__focus"><span class="rm__focus-label">Focus</span>' + focus + '</span>' : '') +
      '</span>' +
    '</a>';
}

function projectListHtml(projects) {
  const shown = projects.filter((p) => !p.archived);
  const gone = projects.filter((p) => p.archived);
  const out = [];
  let n = 0;

  for (const g of GROUPS) {
    const rows = shown.filter((p) => p.group === g.key);
    if (!rows.length) continue;
    out.push('          <div class="rm-group">' +
      '<h3 class="rm-group__title">' + esc(g.title) + '</h3>' +
      '<p class="rm-group__note">' + esc(g.note) + '</p></div>');
    for (const p of rows) { n++; out.push(rowHtml(p, n, n === 1)); }
  }

  /* The archive: still written, still live, still linked — just not what the
     work is now. One quiet line rather than a second list. */
  if (gone.length) {
    out.push('          <p class="rm-archive">' +
      '<span class="rm-archive__label">Also built</span> ' +
      gone.map((p) => '<a href="work/' + encodeURIComponent(p.id) + '.html">' +
        esc(p.title) + '</a>').join('<span aria-hidden="true"> · </span>') +
      '</p>');
  }

  return out.join('\n');
}

function writeProjectList(projects) {
  const file = path.join(ROOT, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  const i = html.indexOf(LIST_BEGIN);
  const j = html.indexOf(LIST_END);
  if (i === -1 || j === -1) {
    console.warn('  ! index.html has no generated:project-list markers — skipped');
    return false;
  }
  const block = LIST_BEGIN + '\n' + projectListHtml(projects) + '\n        ' + LIST_END;
  fs.writeFileSync(file, html.slice(0, i) + block + html.slice(j + LIST_END.length));
  return true;
}

/* ---------- sitemap ----------
   Points at the static pages rather than ten query-string variants of two
   documents, which is what search engines were previously asked to
   reconcile. */
function writeSitemap(pages) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [{ loc: BASE, pri: '1.0' }].concat(
    pages.map(function (f) {
      return {
        loc: BASE + f.split(path.sep).join('/'),
        pri: f.indexOf('work') === 0 ? '0.8' : '0.6'
      };
    })
  );
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(function (u) {
      return '  <url>\n' +
        '    <loc>' + u.loc + '</loc>\n' +
        '    <lastmod>' + today + '</lastmod>\n' +
        '    <changefreq>monthly</changefreq>\n' +
        '    <priority>' + u.pri + '</priority>\n' +
        '  </url>\n';
    }).join('') +
    '</urlset>\n';
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
}

/* ---------- gallery image dimensions ----------
   js/hobby-page.js needs each photo's intrinsic ratio before the file has
   decoded, or every tile resizes on arrival and the gallery shifts under the
   reader. Read the WebP headers here and emit them as a small map. */
function webpSize(buf) {
  // RIFF....WEBP then a chunk: VP8 (lossy), VP8L (lossless) or VP8X (extended).
  if (buf.length < 30 || buf.toString('ascii', 0, 4) !== 'RIFF' ||
      buf.toString('ascii', 8, 12) !== 'WEBP') return null;
  const chunk = buf.toString('ascii', 12, 16);

  if (chunk === 'VP8X') {
    return { w: (buf.readUIntLE(24, 3) & 0xffffff) + 1,
             h: (buf.readUIntLE(27, 3) & 0xffffff) + 1 };
  }
  if (chunk === 'VP8 ') {
    // Frame header: 3-byte tag, 3-byte start code, then 16-bit w/h (14 bits).
    const i = 23;
    if (buf[i] !== 0x9d || buf[i + 1] !== 0x01 || buf[i + 2] !== 0x2a) return null;
    return { w: buf.readUInt16LE(i + 3) & 0x3fff,
             h: buf.readUInt16LE(i + 5) & 0x3fff };
  }
  if (chunk === 'VP8L') {
    if (buf[20] !== 0x2f) return null;
    const b = buf.readUInt32LE(21);
    return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
  }
  return null;
}

function writeHobbyDims() {
  const dir = path.join(ROOT, 'public/assets/hobbies');
  if (!fs.existsSync(dir)) return 0;

  const rows = fs.readdirSync(dir)
    // Skip the -600 responsive variants: the map describes source images.
    .filter(function (f) { return /\.webp$/i.test(f) && !/-600\.webp$/i.test(f); })
    .sort()
    .map(function (f) {
      const size = webpSize(fs.readFileSync(path.join(dir, f)));
      if (!size) { console.warn('  ! could not read size: ' + f); return null; }
      return "  '" + f + "': [" + size.w + ', ' + size.h + ']';
    })
    .filter(Boolean);

  const out = [
    '/* Intrinsic pixel dimensions of every gallery image.',
    '   Generated by tools/build-share-pages.js — do not hand-edit.',
    '',
    "   js/hobby-page.js used to compute each tile's row span only after the",
    '   image had decoded, so a 27-photo gallery reflowed 27 times and',
    '   guaranteed layout shift. With the ratio known up front the mosaic is',
    '   laid out correctly on first paint. */',
    'var HOBBY_DIMS = {',
    rows.join(',\n'),
    '};',
    ''
  ].join('\n');

  fs.writeFileSync(path.join(ROOT, 'js/hobby-dims.js'), out);
  return rows.length;
}

const pages = writeAll();
writeSitemap(pages);
const dims = writeHobbyDims();
const listed = writeProjectList(loadProjects());
console.log('Wrote ' + pages.length + ' share pages + sitemap.xml + '
            + dims + ' gallery dimensions'
            + (listed ? " + index.html's static project list" : ''));
pages.forEach(function (p) { console.log('  ' + p); });
