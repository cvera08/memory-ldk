/* ============================================================
   Memory LDK - page wiring tests

   The engine tests prove the rules are right. These prove the page
   is actually wired to them: that every file it asks for exists,
   that no module was left orphaned, that the load order still holds,
   and that no piece of copy is missing from the string table.

   These are the failures that survive a green unit-test run and
   only show up as a blank page in production.
   ============================================================ */
'use strict';

var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');

/* By default the checks run against the repository. Point SITE_ROOT at an
   assembled folder and the same checks verify what is about to be deployed,
   which is how a file that was never copied into the artifact gets caught. */
var SITE = process.env.SITE_ROOT ? path.resolve(process.env.SITE_ROOT) : ROOT;
var html = fs.readFileSync(path.join(SITE, 'index.html'), 'utf8');

global.window = {};
require('../js/content.js');
require('../js/i18n.js');
var LDK = global.window.LDK;

var passed = 0;
var failures = [];

function check(name, fn) {
  try { fn(); passed++; }
  catch (err) { failures.push({ name: name, message: err.message }); }
}

function ok(value, what) {
  if (!value) throw new Error(what || 'expected a truthy value');
}

/** Every src="" / href="" in the page that is not an external URL. */
function localRefs() {
  var out = [];
  var re = /\s(?:src|href)="([^"]+)"/g;
  var m;
  while ((m = re.exec(html)) !== null) {
    var ref = m[1];
    if (/^(https?:)?\/\//.test(ref) || ref.indexOf('data:') === 0 || ref.charAt(0) === '#') continue;
    out.push(ref);
  }
  return out;
}

function scriptOrder() {
  var out = [];
  var re = /<script src="([^"]+)"><\/script>/g;
  var m;
  while ((m = re.exec(html)) !== null) out.push(m[1]);
  return out;
}

/* ---------------------------------------------------------- files */

check('every file the page asks for exists on disk', function () {
  localRefs().forEach(function (ref) {
    var file = ref.split('?')[0];
    ok(fs.existsSync(path.join(SITE, file)), 'index.html references missing file: ' + file);
  });
});

check('no javascript module is left orphaned', function () {
  var loaded = scriptOrder();
  fs.readdirSync(path.join(SITE, 'js')).forEach(function (name) {
    if (!/\.js$/.test(name)) return;
    ok(loaded.indexOf('js/' + name) !== -1, 'js/' + name + ' exists but is never loaded');
  });
});

check('modules load in dependency order', function () {
  var order = scriptOrder();
  function at(name) { return order.indexOf('js/' + name); }

  ok(at('main.js') === order.length - 1, 'main.js must be last');
  ok(at('content.js') < at('ui.js'), 'ui.js needs the decks');
  ok(at('i18n.js') < at('ui.js'), 'ui.js needs the strings');
  ok(at('engine.js') < at('ui.js'), 'ui.js needs the engine');
  ok(at('storage.js') < at('ui.js'), 'ui.js needs storage');
  ok(at('audio.js') < at('music.js'), 'music.js shares the audio context');
});

check('the icon set browsers look for is complete', function () {
  ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png'].forEach(function (icon) {
    ok(fs.existsSync(path.join(SITE, icon)), 'missing ' + icon);
    ok(html.indexOf(icon) !== -1, icon + ' exists but is not declared in index.html');
  });
});

/* ---------------------------------------------------------- copy */

check('every data-i18n key in the page has a string', function () {
  var re = /data-i18n="([^"]+)"/g;
  var m;
  var missing = [];
  while ((m = re.exec(html)) !== null) {
    if (LDK.i18n.strings.en[m[1]] === undefined) missing.push(m[1]);
  }
  ok(missing.length === 0, 'no string for: ' + missing.join(', '));
});

/* Copy keys are namespaced ("tip.peek", "win.record"). The namespaces are
   derived from the table itself, so a quoted string that looks like a copy
   key can be recognised in the source without a hand-kept list. */
function copyNamespaces() {
  var seen = {};
  Object.keys(LDK.i18n.strings.en).forEach(function (key) {
    var dot = key.indexOf('.');
    if (dot > 0) seen[key.slice(0, dot)] = true;
  });
  return Object.keys(seen);
}

function sourceFiles() {
  var files = [{ name: 'index.html', body: html }];
  fs.readdirSync(path.join(ROOT, 'js')).forEach(function (name) {
    if (!/\.js$/.test(name)) return;
    files.push({ name: 'js/' + name, body: fs.readFileSync(path.join(ROOT, 'js', name), 'utf8') });
  });
  return files;
}

check('every copy key used in the source has a string', function () {
  var namespaces = copyNamespaces().join('|');
  var re = new RegExp("['\"](" + namespaces + ")\\.([a-z0-9]+(?:\\.[a-z0-9]+)*)['\"]", 'g');
  var missing = [];
  sourceFiles().forEach(function (file) {
    var m;
    while ((m = re.exec(file.body)) !== null) {
      var key = m[1] + '.' + m[2];
      if (LDK.i18n.strings.en[key] === undefined) missing.push(file.name + ' -> ' + key);
    }
  });
  ok(missing.length === 0, 'no string for: ' + missing.join(', '));
});

check('no string in the table is dead copy', function () {
  /* i18n.js is where the keys are declared, so looking for a key there
     would find every one of them and the check could never fail. */
  var sources = sourceFiles().filter(function (f) { return f.name !== 'js/i18n.js'; });

  /* Some keys are assembled at runtime - t('level.' + level.id). A quoted
     fragment ending in a dot marks its whole namespace as dynamically used. */
  var dynamic = {};
  sources.forEach(function (file) {
    var re = /['"]([a-z][a-z0-9]*)\.['"]/g;
    var m;
    while ((m = re.exec(file.body)) !== null) dynamic[m[1]] = true;
  });

  var unused = Object.keys(LDK.i18n.strings.en).filter(function (key) {
    if (dynamic[key.split('.')[0]]) return false;
    return !sources.some(function (file) {
      return file.body.indexOf("'" + key + "'") !== -1 ||
             file.body.indexOf('"' + key + '"') !== -1;
    });
  });
  ok(unused.length === 0, 'never referenced anywhere: ' + unused.join(', '));
});

check('every language ships the same set of keys', function () {
  var languages = LDK.i18n.available();
  var reference = Object.keys(LDK.i18n.strings.en).sort();
  languages.forEach(function (lang) {
    var keys = Object.keys(LDK.i18n.strings[lang]).sort();
    var missing = reference.filter(function (k) { return keys.indexOf(k) === -1; });
    var extra = keys.filter(function (k) { return reference.indexOf(k) === -1; });
    ok(missing.length === 0, lang + ' is missing: ' + missing.join(', '));
    ok(extra.length === 0, lang + ' has keys English does not: ' + extra.join(', '));
  });
});

check('no string table entry is empty', function () {
  LDK.i18n.available().forEach(function (lang) {
    var table = LDK.i18n.strings[lang];
    Object.keys(table).forEach(function (key) {
      var value = table[key];
      if (Array.isArray(value)) {
        ok(value.length > 0, lang + '.' + key + ' is an empty list');
        value.forEach(function (line) { ok(line.trim().length > 0, lang + '.' + key + ' has a blank line'); });
      } else {
        ok(String(value).trim().length > 0, lang + '.' + key + ' is blank');
      }
    });
  });
});

check('every deck and level has a name the page can show', function () {
  LDK.DECKS.forEach(function (deck) {
    ok(deck.name && deck.icon, deck.id + ' needs both a name and an icon');
  });
  LDK.LEVELS.forEach(function (level) {
    ok(LDK.i18n.strings.en['level.' + level.id] !== undefined, 'no label for level ' + level.id);
  });
});

/* ---------------------------------------------------------- report */

console.log('');
failures.forEach(function (f) {
  console.log('  FAIL  ' + f.name);
  console.log('        ' + f.message);
});
console.log('  page wiring' + (SITE === ROOT ? '' : ' (' + path.basename(SITE) + ')') +
            ': ' + passed + ' passed, ' + failures.length + ' failed');
console.log('');
process.exit(failures.length ? 1 : 0);
