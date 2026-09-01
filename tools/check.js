#!/usr/bin/env node
/* Static checks for a site with no build step and no test runner.
 *
 * Catches the classes of bug this repo has actually shipped: nav links to
 * anchors that no longer exist, <img>/<script>/<link> pointing at missing
 * files, target="_blank" without rel="noreferrer", and pages that drifted
 * apart from one another.
 *
 *     node tools/check.js
 *
 * Exits non-zero when anything fails, so it works as a pre-push hook or a CI
 * step. No dependencies.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PAGES = ['index.html', 'project.html', 'hobby.html', '404.html'];

let failures = 0;
let checked = 0;

function fail(page, msg) {
  console.log('  FAIL  [' + page + '] ' + msg);
  failures++;
}

function read(p) {
  return fs.readFileSync(path.join(ROOT, p), 'utf8');
}

/* Comments contain example markup (`<use href="#id">`), which would otherwise
   be scanned as real links. Strip them before matching. */
function readLive(p) {
  return read(p).replace(/<!--[\s\S]*?-->/g, '');
}

/* ---------- collect every id defined across the site ---------- */

const idsByPage = {};
for (const page of PAGES) {
  const html = readLive(page);
  idsByPage[page] = new Set(
    Array.from(html.matchAll(/\sid="([^"]+)"/g), (m) => m[1])
  );
}

/* ---------- 1. internal anchors resolve ---------- */

console.log('\n1. internal anchors');
for (const page of PAGES) {
  const html = readLive(page);
  for (const m of html.matchAll(/href="([^"]*#[^"]+)"/g)) {
    const href = m[1];
    if (href.startsWith('http')) continue;
    const [file, hash] = href.split('#');
    const target = file === '' ? page : file;
    checked++;
    if (!PAGES.includes(target)) {
      fail(page, 'link to unknown page: ' + href);
    } else if (!idsByPage[target].has(hash)) {
      fail(page, 'anchor does not exist: ' + href +
                 '  (no id="' + hash + '" in ' + target + ')');
    }
  }
}

/* ---------- 2. referenced local files exist ---------- */

console.log('2. asset references');
for (const page of PAGES) {
  const html = readLive(page);
  const re = /(?:src|href)="((?!https?:|mailto:|#|data:)[^"]+)"/g;
  for (const m of html.matchAll(re)) {
    const ref = m[1].split('?')[0].split('#')[0];
    if (!ref) continue;
    checked++;
    if (!fs.existsSync(path.join(ROOT, ref))) {
      fail(page, 'missing file: ' + ref);
    }
  }
}

/* ---------- 3. external links are safe ---------- */

console.log('3. target=_blank safety');
for (const page of PAGES) {
  const html = readLive(page);
  for (const m of html.matchAll(/<a\s[^>]*target="_blank"[^>]*>/g)) {
    const tag = m[0];
    checked++;
    const rel = (tag.match(/rel="([^"]*)"/) || [, ''])[1];
    if (!rel.includes('noopener') || !rel.includes('noreferrer')) {
      fail(page, 'target=_blank without rel="noopener noreferrer": ' +
                 tag.slice(0, 90));
    }
  }
}

/* ---------- 4. every page carries the shared furniture ---------- */

console.log('4. per-page requirements');
for (const page of PAGES) {
  const html = read(page);
  const need = [
    ['skip link', /class="skip-link"/],
    ['focusable main', /<main id="main" tabindex="-1">/],
    ['viewport meta', /name="viewport"/],
    ['CSP meta', /Content-Security-Policy/],
    ['referrer meta', /name="referrer"/],
    ['dark theme-color', /theme-color[^>]*prefers-color-scheme: dark/],
    ['util.js first', /js\/util\.js/],
    ['nav toggle', /data-nav-toggle/]
  ];
  for (const [label, re] of need) {
    checked++;
    if (!re.test(html)) fail(page, 'missing ' + label);
  }

  // The skip link has to be the first focusable thing in the body.
  const body = html.slice(html.indexOf('<body>'));
  const firstFocusable = body.search(/<(?:a|button)\s/);
  const skip = body.indexOf('class="skip-link"');
  checked++;
  if (skip === -1 || firstFocusable < skip - 20) {
    fail(page, 'skip link is not the first focusable element');
  }
}

/* ---------- 5. nav is identical across pages ---------- */

console.log('5. nav consistency');
function navLinks(html) {
  const m = html.match(/<nav class="nav"[^>]*>([\s\S]*?)<\/nav>/);
  if (!m) return null;
  return Array.from(m[1].matchAll(/>([^<>]+)<\/a>/g), (x) => x[1].trim())
    .join(' | ');
}
const navs = PAGES.map((p) => [p, navLinks(readLive(p))]);
const reference = navs[0][1];
for (const [page, nav] of navs) {
  checked++;
  if (nav === null) fail(page, 'no primary nav found');
  else if (nav !== reference) {
    fail(page, 'nav differs from index.html\n          ' + page +
               ': ' + nav + '\n          index.html: ' + reference);
  }
}

/* ---------- 6. project data is renderable ---------- */

console.log('6. project data');
const vm = require('vm');
const sandbox = {};
vm.createContext(sandbox);
new vm.Script(read('js/project-data.js') + '\nthis.__out = projects;')
  .runInContext(sandbox);

for (const p of sandbox.__out) {
  for (const field of ['id', 'title', 'tagline', 'year', 'role', 'summary',
                       'overview', 'challenge', 'repo']) {
    checked++;
    if (!p[field]) fail('project-data', p.id + ' missing ' + field);
    else if (/^TODO/i.test(String(p[field]))) {
      fail('project-data', p.id + '.' + field + ' is a placeholder: ' + p[field]);
    }
  }
  for (const field of ['tech', 'highlights']) {
    checked++;
    if (!Array.isArray(p[field]) || !p[field].length) {
      fail('project-data', p.id + '.' + field + ' is empty');
    }
  }
  // Every project needs the images the cards and share pages reference.
  const thumb = 'public/assets/work/' + p.id + (p.recent ? '-icon.webp' : '-thumb.webp');
  checked++;
  if (!fs.existsSync(path.join(ROOT, thumb))) {
    fail('project-data', p.id + ' missing image ' + thumb);
  }
}

/* ---------- 6b. live-demo embeds ---------- */

console.log('6b. live demo embeds');
{
  // Every demo origin the data references must be allowed by project.html's
  // frame-src, or the embed is silently blocked at runtime.
  const csp = (read('project.html').match(/Content-Security-Policy"\s+content="([^"]+)"/) || [, ''])[1];
  const frameSrc = (csp.match(/frame-src ([^;]+)/) || [, ''])[1].split(/\s+/).filter(Boolean);

  for (const p of sandbox.__out) {
    if (!p.demo) continue;
    checked++;
    let origin;
    try { origin = new URL(p.demo).origin; } catch (e) { origin = null; }
    if (!origin) {
      fail('embeds', p.id + ' has an unparseable demo URL: ' + p.demo);
    } else if (!frameSrc.includes(origin)) {
      fail('embeds', p.id + ' demo origin not in project.html frame-src: ' + origin);
    }
  }

  // The escape-hatch link is the only guarantee when a frame comes up blank.
  checked++;
  if (!read('js/project-detail.js').includes('live__caption')) {
    fail('embeds', 'live embed lost its open-in-new-tab caption link');
  }
}

/* ---------- 7. generated share pages are current ---------- */

console.log('7. generated pages');
for (const p of sandbox.__out) {
  checked++;
  const f = path.join(ROOT, 'work', p.id + '.html');
  if (!fs.existsSync(f)) {
    fail('generated', 'work/' + p.id + '.html missing — run node tools/build-share-pages.js');
  } else if (!fs.readFileSync(f, 'utf8').includes('<title>' + p.title + ' —')) {
    fail('generated', 'work/' + p.id + '.html is stale — re-run tools/build-share-pages.js');
  }
}

/* ---------- report ---------- */

console.log('\n' + (failures
  ? failures + ' problem(s) across ' + checked + ' checks'
  : 'all ' + checked + ' checks passed'));
process.exit(failures ? 1 : 0);
