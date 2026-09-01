/* Runs every test file in this folder. `node tests/run.js` */
'use strict';

var execFileSync = require('child_process').execFileSync;
var path = require('path');

var suites = ['engine.test.js', 'assets.test.js'];
var failed = 0;

suites.forEach(function (name) {
  try {
    execFileSync(process.execPath, [path.join(__dirname, name)], { stdio: 'inherit' });
  } catch (e) {
    failed++;
  }
});

if (failed) {
  console.log('  ' + failed + ' of ' + suites.length + ' suites failed');
  console.log('');
}
process.exit(failed ? 1 : 0);
