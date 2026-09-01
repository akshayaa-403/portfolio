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
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://akshayaa-403.github.io/portfolio/';
const OG_FALLBACK = BASE + 'public/assets/og-card.png';

/* ---------- read the data files without importing a bundler ---------- */

function loadProjects() {
  const src = fs.readFileSync(path.join(ROOT, 'js/project-data.js'), 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  new vm.Script(src + '\nthis.__out = projects;').runInContext(sandbox);
  return sandbox.__out;
}

/* hobby-page.js keeps GROUPS inside an IIFE, so evaluating the whole file
   would not expose it. Pull just the object literal out and evaluate that. */
function loadHobbies() {
  const src = fs.readFileSync(path.join(ROOT, 'js/hobby-page.js'), 'utf8');
  const start = src.indexOf('var GROUPS = {');
  if (start === -1) throw new Error('GROUPS not found in js/hobby-page.js');
  const open = src.indexOf('{', start);

  // Walk to the matching brace so nested objects, and braces inside strings,
  // do not end the scan early.
  let depth = 0, end = -1, quote = null;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      if (c === '\\') { i++; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) throw new Error('unbalanced GROUPS object');

  const sandbox = {};
  vm.createContext(sandbox);
  new vm.Script('this.__out = ' + src.slice(open, end + 1) + ';').runInContext(sandbox);
  return sandbox.__out;
}

/* ---------- page template ---------- */

function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

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
    const image = fs.existsSync(path.join(ROOT, thumb)) ? BASE + thumb : OG_FALLBACK;
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
console.log('Wrote ' + pages.length + ' share pages + sitemap.xml + '
            + dims + ' gallery dimensions');
pages.forEach(function (p) { console.log('  ' + p); });
