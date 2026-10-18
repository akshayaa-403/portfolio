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
    // Not deferred, on purpose: it has to run before first paint.
    ['boot.js in head', /<script src="js\/boot\.js"><\/script>/],
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
const PROJECTS = require('./data').loadProjects();

for (const p of PROJECTS) {
  for (const field of ['id', 'title', 'tagline', 'year', 'role', 'summary', 'repo']) {
    checked++;
    if (!p[field]) fail('project-data', p.id + ' missing ' + field);
    else if (/^TODO/i.test(String(p[field]))) {
      fail('project-data', p.id + '.' + field + ' is a placeholder: ' + p[field]);
    }
  }
  checked++;
  if (!Array.isArray(p.tech) || !p.tech.length) fail('project-data', p.id + '.tech is empty');
  checked++;
  if (!p.archived && !['research', 'products'].includes(p.group)) {
    // projectListHtml filters by group, so a live project without one
    // silently vanishes from the home page.
    fail('project-data', p.id + ' is not archived and has no valid group');
  }
  checked++;
  if (!p.glance || !p.glance.problem || !p.glance.built || !p.glance.result) {
    fail('project-data', p.id + '.glance needs problem, built and result');
  }
}

/* ---------- 6b. live-demo embeds ---------- */

console.log('6b. live demo embeds');
{
  // Every demo origin the data references must be allowed by project.html's
  // frame-src, or the embed is silently blocked at runtime.
  const csp = (read('project.html').match(/Content-Security-Policy"\s+content="([^"]+)"/) || [, ''])[1];
  const frameSrc = (csp.match(/frame-src ([^;]+)/) || [, ''])[1].split(/\s+/).filter(Boolean);

  for (const p of PROJECTS) {
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
for (const p of PROJECTS) {
  checked++;
  const f = path.join(ROOT, 'work', p.id + '.html');
  if (!fs.existsSync(f)) {
    fail('generated', 'work/' + p.id + '.html missing — run node tools/build-share-pages.js');
  } else if (!fs.readFileSync(f, 'utf8').includes('<title>' + p.title + ' —')) {
    fail('generated', 'work/' + p.id + '.html is stale — re-run tools/build-share-pages.js');
  }
}

/* ---------- 8. header facts ----------

   The two dates are transcribed from the GitHub API rather than fetched at
   run time, so nothing at run time can catch a typo in them. Tags are
   outbound links and get the same rel/protocol treatment as every other
   external link on the site. */

console.log('8. header facts');
const ISO = /^\d{4}-\d{2}-\d{2}$/;
for (const p of PROJECTS) {
  checked++;
  if ((p.created && !p.updated) || (p.updated && !p.created)) {
    fail('facts', p.id + ' has one of created/updated but not the other');
  }
  for (const key of ['created', 'updated']) {
    if (!p[key]) continue;
    checked++;
    if (!ISO.test(p[key])) fail('facts', p.id + '.' + key + ' is not YYYY-MM-DD: ' + p[key]);
  }
  if (p.created && p.updated && ISO.test(p.created) && ISO.test(p.updated)) {
    checked++;
    if (p.created > p.updated) {
      fail('facts', p.id + ' was created after it was last updated');
    }
  }
  for (const t of p.tags || []) {
    checked++;
    if (!Array.isArray(t) || t.length !== 2 || !t[0] || !t[1]) {
      fail('facts', p.id + ' has a malformed tag: ' + JSON.stringify(t));
    } else if (!/^https:\/\//.test(t[1])) {
      fail('facts', p.id + ' tag "' + t[0] + '" must point somewhere over https: ' + t[1]);
    }
  }
}

/* ---------- 9. the articles ----------

   Each case study is js/articles/<id>.js (plus its stylesheet), rendered by
   js/article.js. The engine drops what it cannot render rather than failing,
   so the mistakes that matter are silent ones, and this is where they are
   caught: a block of no known kind, a widget name with no function behind it,
   a figure that points at no file, a margin note whose phrase was edited out
   of its paragraph, and a demo the article never places. */

console.log('9. articles');
const vm = require('vm');
const KINDS = ['p', 'h', 'quote', 'callout', 'list', 'figure', 'code', 'tex',
               'table', 'widget', 'scrolly', 'live'];

function loadArticle(id) {
  const file = path.join(ROOT, 'js', 'articles', id + '.js');
  if (!fs.existsSync(file)) return null;
  const reg = {};
  const sandbox = { Article: { register: (k, spec) => { reg[k] = spec; } } };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  new vm.Script(fs.readFileSync(file, 'utf8'), { filename: file }).runInContext(sandbox);
  return reg[id] || null;
}

for (const p of PROJECTS) {
  const where = 'articles/' + p.id;
  checked += 2;
  if (!fs.existsSync(path.join(ROOT, 'css', 'articles', p.id + '.css'))) {
    fail(where, 'css/articles/' + p.id + '.css is missing');
  }
  let spec;
  try { spec = loadArticle(p.id); } catch (e) { fail(where, 'does not evaluate: ' + e.message); continue; }
  if (!spec) { fail(where, 'js/articles/' + p.id + '.js is missing or never registers "' + p.id + '"'); continue; }

  const widgets = spec.widgets || {};
  const chapters = (spec.chapters || []).slice();
  checked += 3;
  if (!chapters.length) fail(where, 'has no chapters');
  if (!spec.closing || !(spec.closing.blocks || []).length) fail(where, 'has no closing ("What I would do differently")');
  if (!(spec.sources || []).length) fail(where, 'lists no sources for its numbers');
  if (spec.rail) {
    checked++;
    if (typeof widgets[spec.rail] !== 'function') fail(where, 'rail "' + spec.rail + '" has no widget');
  }
  if (spec.closing) chapters.push(spec.closing);

  const ids = new Set();
  let lives = 0;
  for (const c of chapters) {
    if (c !== spec.closing) {
      checked++;
      if (!/^[a-z0-9_-]+$/.test(c.id || '')) fail(where, 'chapter id must be [a-z0-9_-]: ' + c.id);
      else if (ids.has(c.id)) fail(where, 'duplicate chapter id ' + c.id);
      ids.add(c.id);
    }
    for (const b of c.blocks || []) {
      checked++;
      const kinds = KINDS.filter((k) => b[k] != null);
      if (kinds.length !== 1) {
        fail(where, (c.id || 'closing') + ' has a block of ' +
          (kinds.length ? 'several kinds (' + kinds + ')' : 'no known kind') +
          ': ' + JSON.stringify(b).slice(0, 80));
        continue;
      }
      const k = kinds[0];
      if ((k === 'widget' || k === 'scrolly') && typeof widgets[b[k]] !== 'function') {
        fail(where, k + ' "' + b[k] + '" has no widget function');
      }
      if (k === 'scrolly' && !((b.steps || []).length >= 2)) {
        fail(where, 'scrolly "' + b.scrolly + '" needs at least two steps');
      }
      if (k === 'figure') {
        if (!fs.existsSync(path.join(ROOT, b.figure.split('?')[0]))) fail(where, 'figure file missing: ' + b.figure);
        if (!b.alt) fail(where, 'figure without alt text: ' + b.figure);
      }
      if (k === 'live') lives++;
      if (k === 'p') {
        for (const [phrase, say] of b.notes || []) {
          checked++;
          const hits = b.p.split(phrase).length - 1;
          if (hits !== 1) {
            fail(where, 'margin-note phrase appears ' + hits +
              ' times in its paragraph (needs exactly 1): "' + phrase + '"');
          }
          if (!say || !say.trim()) fail(where, 'empty margin note on "' + phrase + '"');
        }
      }
    }
  }
  checked++;
  if (p.demo && lives !== 1) fail(where, 'has a demo but places { live: true } ' + lives + ' times (needs exactly 1)');
  if (!p.demo && lives) fail(where, 'places a live demo but the project has no demo');
}

/* ---------- report ---------- */

console.log('\n' + (failures
  ? failures + ' problem(s) across ' + checked + ' checks'
  : 'all ' + checked + ' checks passed'));
process.exit(failures ? 1 : 0);
