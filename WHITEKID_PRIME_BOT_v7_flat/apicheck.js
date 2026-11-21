#!/usr/bin/env node
'use strict';
// Standalone API health check:  node apicheck.js
// Scans the bot's source files for every API host and reports which are reachable.
const fs = require('fs'), path = require('path');
const files = fs.readdirSync(__dirname).filter(f => /^(services|commands|games|helpers|config|events|wk7-.*)\.js$/.test(f)).map(f => path.join(__dirname, f));
const hosts = new Map();
for (const f of files) for (const m of fs.readFileSync(f, 'utf8').matchAll(/https?:\/\/[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(?::\d+)?/gi)) {
  const u = m[0].toLowerCase(); if (!/catbox|whatsapp\.com|t\.me|wa\.me|example\.|localhost|github\.com\/|w3\.org|schema\.org/.test(u)) hosts.set(u, (hosts.get(u) || 0) + 1);
}
const { probeAll, summarize } = require('./wk7');
(async () => {
  console.log(`Testing ${hosts.size} API hosts…\n`);
  const res = await probeAll([...hosts.keys()].map(h => [h, h]), { timeout: 10000, concurrency: 12 });
  console.log(summarize(res, '📡 API HOST HEALTH'));
  const dead = res.filter(r => r.state === 'dead').map(r => r.label);
  if (dead.length) console.log('\nSearch services.js / commands.js for these hosts and replace/remove them:\n' + dead.join('\n'));
})();
