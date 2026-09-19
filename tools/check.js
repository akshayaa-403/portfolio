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
  // The project list is text only now, so no per-project card art is
  // required. Figures inside a case study are checked by §2 like any other
  // asset reference.
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

/* ---------- 8. margin notes still point at real phrases ----------

   Each [phrase, note] pair in a project's `notes` has to quote the Overview
   or The tricky part verbatim, or js/project-detail.js silently drops the
   note: the aside would have nothing to sit beside. Editing the prose and
   forgetting the note is the obvious way to break this, and it breaks
   quietly, so it is worth a check. */

console.log('8. margin notes');
for (const p of sandbox.__out) {
  if (!p.notes) continue;
  for (const key of Object.keys(p.notes)) {
    const text = p[key];
    checked++;
    if (typeof text !== 'string') {
      fail('notes', p.id + ' has notes for "' + key + '" but no such field');
      continue;
    }
    for (const [phrase, say] of p.notes[key]) {
      checked++;
      const hits = text.split(phrase).length - 1;
      if (hits === 0) {
        fail('notes', p.id + '/' + key + ': phrase not in the prose — "' + phrase + '"');
      } else if (hits > 1) {
        fail('notes', p.id + '/' + key + ': phrase appears ' + hits +
                      ' times, so the note marks the wrong one — "' + phrase + '"');
      }
      if (!say || !say.trim()) {
        fail('notes', p.id + '/' + key + ': empty note on "' + phrase + '"');
      }
    }
  }
}

/* ---------- 9. header facts and graph targets ----------

   The two dates are transcribed from the GitHub API rather than fetched at
   run time, so nothing at run time can catch a typo in them. Tags are
   outbound links and get the same rel/protocol treatment as every other
   external link on the site. And js/field.js hard-codes one anchor for its
   tech nodes — if that heading ever loses its id, every tool in the graph
   quietly links to nothing. */

console.log('9. header facts');
const ISO = /^\d{4}-\d{2}-\d{2}$/;
for (const p of sandbox.__out) {
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

checked++;
if (!read('index.html').includes('id="skills-h"')) {
  fail('facts', 'js/field.js links its tech nodes to #skills-h, which index.html no longer has');
}

/* ---------- report ---------- */

console.log('\n' + (failures
  ? failures + ' problem(s) across ' + checked + ' checks'
  : 'all ' + checked + ' checks passed'));
process.exit(failures ? 1 : 0);
