'use strict';
// Loads every module, checks that every cross-file import resolves, then drives the real
// message handler with a fake WhatsApp socket. Needs no network and no WhatsApp account.
const fs = require('fs'), os = require('os'), path = require('path'), EventEmitter = require('events');
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'prime-smoke-'));
delete process.env.TG_TOKEN;
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } };

// 1. every local module loads and every `const { a, b } = require('./x')` name exists
const files = fs.readdirSync(__dirname).filter(f => /\.js$/.test(f) && !/test\.js$|^index\.js$|^apicheck\.js$/.test(f));
let hasExpress = true; try { require.resolve('express'); } catch { hasExpress = false; }
for (const f of files) {
  if (f === 'server.js' && !hasExpress) continue;
  let mod; try { mod = require('./' + f); } catch (e) { ok(false, `${f} failed to load: ${e.message}`); continue; }
  const src = fs.readFileSync(path.join(__dirname, f), 'utf8');
  for (const m of src.matchAll(/const \{([^}]+)\} = require\('\.\/([\w-]+)'\);/g)) {
    let target; try { target = require('./' + m[2]); } catch { continue; }
    for (const name of m[1].split(',').map(s => s.trim()).filter(Boolean)) ok(target[name] !== undefined, `${f}: ${name} is not exported by ${m[2]}.js`);
  }
}

// 2. drive the real handler with a fake socket
const { attachHandlers } = require('./handler');
const store = require('./store');
const sent = [];
const sock = new EventEmitter();
sock.ev = sock;
sock.user = { id: '263700000001:1@s.whatsapp.net' };
sock.sendMessage = async (jid, content) => { sent.push({ jid, content }); return { key: { id: 'X' } }; };
sock.groupMetadata = async () => ({ participants: [], subject: 'test' });
sock.sendPresenceUpdate = sock.readMessages = async () => {};
const deps = { requestPairing: async () => ({ status: 'pairing', code: 'ABCD1234' }), endSession: async () => {} };
attachHandlers(sock, '263700000001', deps);
const say = async (text, wait = 2000) => {
  sent.length = 0;
  sock.emit('messages.upsert', { type: 'notify', messages: [{ key: { remoteJid: '263789846423@s.whatsapp.net', fromMe: false, id: 'M' + Math.random() }, pushName: 'Tester', message: { conversation: text }, }] });
  await new Promise(r => setTimeout(r, wait));
  return sent.map(s => s.content.text || s.content.caption || '').join('\n');
};
(async () => {
  ok(typeof sock.sendMessage === 'function', 'socket wrapped');
  const ping = await say('.ping'); ok(ping.length > 0, 'ping replied: ' + ping);
  const none = await say('hello there', 800); ok(none === '', 'plain text is ignored: ' + none);
  const pair = await say('.pair 263712345678'); ok(/ABCD-1234/i.test(pair.replace(/\s/g, '')) || /abcd-1234/i.test(pair), 'pair command shows the code: ' + pair);
  const bad = await say('.pair 12'); ok(/usage/i.test(bad), 'pair validates the number');
  ok(store.listSavedNumbers().length === 0, 'no stray sessions created');
  fs.rmSync(process.env.DATA_DIR, { recursive: true, force: true });
  console.log(fails ? `SMOKE TESTS FAILED (${fails})` : 'SMOKE TESTS PASS');
  process.exit(fails ? 1 : 0);
})();
