/* Reading the site's data files from Node, without a bundler.
 *
 * js/project-data.js, js/hobby-data.js and the rest are bare globals on
 * purpose, so a Node tool can evaluate one directly. Both generators needed
 * exactly the same three things and each had written its own copy; a second
 * copy of a loader is how the two tools end up disagreeing about what a
 * project is.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

/* Evaluate one data file in a throwaway context and hand back the global it
   declares. The files are ours; this is not a sandbox, it is a way of reading
   `var x = {...}` without turning the site into a module graph. */
function load(file, name) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  new vm.Script(src + '\nthis.__out = ' + name + ';').runInContext(sandbox);
  return sandbox.__out;
}

function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

module.exports = {
  ROOT,
  esc,
  loadProjects: () => load('js/project-data.js', 'projects'),
  loadHobbies: () => load('js/hobby-data.js', 'hobbies')
};
