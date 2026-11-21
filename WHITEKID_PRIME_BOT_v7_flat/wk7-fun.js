'use strict';
const crypto = require('crypto');
const { def, category, pending, rnd, fmt, num, nums, U } = require('./wk7-core');

category('gen', '🎲', 'GENERATORS');
category('games', '🎮', 'GAMES & SOCIAL');

const hash = s => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const today = () => new Date().toISOString().slice(0, 10);
const mentionsOf = msg => { try { return msg?.message?.extendedTextMessage?.contextInfo?.mentionedJid || []; } catch { return []; } };
const quotedPart = msg => { try { return msg?.message?.extendedTextMessage?.contextInfo?.participant || null; } catch { return null; } };
const tag = j => '@' + String(j).split('@')[0].split(':')[0];

// ═════════════ GENERATORS ═════════════
def('gen', 'randnum', '<min> <max> [count]', async c => {
    const [a, b, n = 1] = nums(c.args); if (isNaN(a) || isNaN(b) || !Number.isInteger(a) || !Number.isInteger(b)) return c.reply(U(c.p, 'randnum 1 100 5'));
    const lo = Math.min(a, b), hi = Math.max(a, b), k = Math.min(Math.max(n | 0, 1), 20);
    await c.reply(`🎲 RANDOM NUMBER${k > 1 ? 'S' : ''}\n\nRange ${lo}–${hi}\n${Array.from({ length: k }, () => rnd.int(lo, hi)).join(', ')}`);
});
const FIRST = ['Tendai', 'Rutendo', 'Tafadzwa', 'Chipo', 'Farai', 'Nyasha', 'Tatenda', 'Kudzai', 'Rudo', 'Tinashe', 'Ruvimbo', 'Takudzwa', 'Anesu', 'Vimbai', 'Thabo', 'Sipho', 'Lindiwe', 'Nomsa', 'Themba', 'Zanele', 'Amara', 'Kofi', 'Ama', 'Chidi', 'Zuri', 'Imani', 'James', 'Grace', 'Daniel', 'Sarah', 'Michael', 'Linda'];
const LAST = ['Moyo', 'Ncube', 'Dube', 'Sibanda', 'Mutasa', 'Chikwanha', 'Mukamuri', 'Banda', 'Phiri', 'Ndlovu', 'Chirwa', 'Mhlanga', 'Nyathi', 'Mpofu', 'Zulu', 'Khumalo', 'Okafor', 'Mensah', 'Smith', 'Johnson', 'Williams', 'Brown'];
const fullName = () => `${rnd.pick(FIRST)} ${rnd.pick(LAST)}`;
def('gen', 'randname', '[count]', async c => { const n = Math.min(Math.max(parseInt(c.args[0], 10) || 1, 1), 15); await c.reply(`🧑 RANDOM NAME${n > 1 ? 'S' : ''}\n\n${Array.from({ length: n }, fullName).join('\n')}`); });
def('gen', 'randemail', '', async c => { const n = fullName().toLowerCase().replace(' ', '.'); await c.reply(`📧 RANDOM EMAIL\n\n${n}${rnd.int(1, 999)}@${rnd.pick(['example.com', 'example.org', 'example.net'])}\n\n(Reserved example domains — not real inboxes.)`); });
const WORDS = ['river', 'baobab', 'thunder', 'lantern', 'savanna', 'granite', 'falcon', 'maple', 'orbit', 'copper', 'harvest', 'echo', 'meadow', 'cobalt', 'ember', 'zephyr', 'drift', 'summit', 'velvet', 'comet', 'pebble', 'anchor', 'sunrise', 'timber', 'marble', 'island', 'violet', 'rocket', 'canyon', 'whisper', 'jaguar', 'quartz'];
def('gen', 'passphrase', '[words=4]', async c => { const n = Math.min(Math.max(parseInt(c.args[0], 10) || 4, 3), 10); const w = Array.from({ length: n }, () => WORDS[crypto.randomInt(WORDS.length)]); await c.reply(`🔑 PASSPHRASE\n\n${w.join('-')}-${crypto.randomInt(10, 99)}\n\nTip: use unique passphrases per account. Generated with a secure RNG.`); });
def('gen', 'randpin', '[length=4]', async c => { const n = Math.min(Math.max(parseInt(c.args[0], 10) || 4, 3), 12); await c.reply(`🔢 PIN\n\n${Array.from({ length: n }, () => crypto.randomInt(10)).join('')}`); });
const hex2rgb = h => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map(x => x + x).join(''); if (!/^[0-9a-f]{6}$/i.test(h)) return null; return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
const rgb2hex = (r, g, b) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
const rgb2hsl = (r, g, b) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [Math.round(h), Math.round(s * 100), Math.round(l * 100)]; };
const hsl2rgb = (h, s, l) => { s /= 100; l /= 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))]; };
def('gen', 'colorinfo', '<#hex>', async c => { const rgb = hex2rgb(c.args[0] || ''); if (!rgb) return c.reply(U(c.p, 'colorinfo #1E90FF')); const [h, s, l] = rgb2hsl(...rgb); await c.reply(`🎨 COLOR\n\nHEX: ${rgb2hex(...rgb)}\nRGB: rgb(${rgb.join(', ')})\nHSL: hsl(${h}, ${s}%, ${l}%)\nBrightness: ${l > 55 ? 'light' : 'dark'}`); });
def('gen', 'rgb2hex', '<r> <g> <b>', async c => { const v = nums(c.args); if (v.length < 3 || v.slice(0, 3).some(x => !(x >= 0 && x <= 255) || !Number.isInteger(x))) return c.reply(U(c.p, 'rgb2hex 255 140 0')); await c.reply(`🎨 RGB → HEX\n\n${rgb2hex(v[0], v[1], v[2])}`); });
def('gen', 'hex2rgb', '<#hex>', async c => { const rgb = hex2rgb(c.args[0] || ''); if (!rgb) return c.reply(U(c.p, 'hex2rgb #FF8C00')); await c.reply(`🎨 HEX → RGB\n\nrgb(${rgb.join(', ')})`); });
def('gen', 'palette', '[#hex]', async c => { const base = c.args[0] ? hex2rgb(c.args[0]) : [rnd.int(0, 255), rnd.int(0, 255), rnd.int(0, 255)]; if (!base) return c.reply(U(c.p, 'palette #1E90FF')); const [h, s, l] = rgb2hsl(...base); const hs = [h, h + 30, h + 180, h + 150, h - 30].map(x => (x % 360 + 360) % 360); await c.reply(`🎨 PALETTE\n\nBase: ${rgb2hex(...base)}\n${['Base', 'Analogous +30', 'Complement', 'Split complement', 'Analogous −30'].map((n, i) => `• ${n}: ${rgb2hex(...hsl2rgb(hs[i], s, l))}`).join('\n')}`); });
def('gen', 'fakeuser', '', async c => { const n = fullName(); const [f, l] = n.split(' '); await c.reply(`🪪 FAKE PROFILE (test data)\n\nName: ${n}\nUsername: ${f.toLowerCase()}_${l.toLowerCase()}${rnd.int(10, 99)}\nAge: ${rnd.int(18, 60)}\nCity: ${rnd.pick(['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Masvingo', 'Lusaka', 'Johannesburg', 'Nairobi'])}\nEmail: ${f.toLowerCase()}.${l.toLowerCase()}@example.com`); });
def('gen', 'randdate', '[from year] [to year]', async c => { const a = parseInt(c.args[0], 10) || 2000, b = parseInt(c.args[1], 10) || 2030; const lo = Date.UTC(Math.min(a, b), 0, 1), hi = Date.UTC(Math.max(a, b), 11, 31); const d = new Date(lo + Math.floor(Math.random() * (hi - lo))); await c.reply(`📅 RANDOM DATE\n\n${d.toISOString().slice(0, 10)}`); });
def('gen', 'randip', '', async c => { const p = () => rnd.int(1, 254); await c.reply(`🌐 RANDOM IP (not a real host)\n\nIPv4: ${p()}.${p()}.${p()}.${p()}\nPrivate: 192.168.${p()}.${p()}`); });
def('gen', 'randmac', '', async c => { const b = () => rnd.int(0, 255).toString(16).padStart(2, '0'); await c.reply(`🔌 RANDOM MAC\n\n${[b(), b(), b(), b(), b(), b()].join(':').toUpperCase()}`); });
def('gen', 'username', '[word]', async c => { const w = (c.args[0] || rnd.pick(WORDS)).replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 12) || 'user'; await c.reply(`🏷️ USERNAME IDEAS\n\n${[`${w}_${rnd.int(10, 99)}`, `the${w}`, `${w}${rnd.pick(['hq', 'x', 'zw', 'official', 'tv'])}`, `${rnd.pick(WORDS)}_${w}`, `${w}.${rnd.pick(WORDS)}`].join('\n')}`); });
def('gen', 'teamsplit', '<teams> <name1 name2 …>', async c => {
    const n = parseInt(c.args[0], 10), names = c.args.slice(1); if (!(n >= 2) || names.length < n) return c.reply(U(c.p, 'teamsplit 2 Tendai Rudo Farai Chipo Anesu'));
    const teams = Array.from({ length: n }, () => []); rnd.shuffle(names).forEach((x, i) => teams[i % n].push(x));
    await c.reply(`👥 TEAMS\n\n${teams.map((t, i) => `Team ${i + 1}: ${t.join(', ')}`).join('\n')}`);
});
def('gen', 'raffle', '<name1 name2 …> (or comma separated)', async c => { const names = c.q.split(/[,\n]+|\s+/).filter(Boolean); if (names.length < 2) return c.reply(U(c.p, 'raffle Tendai Rudo Farai')); await c.reply(`🎟️ RAFFLE\n\nEntries: ${names.length}\n\n🏆 Winner: ${rnd.pick(names)}`); });
def('gen', 'secretsanta', '<name1 name2 name3 …>', async c => {
    const names = c.q.split(/[,\n]+|\s+/).filter(Boolean); if (names.length < 3) return c.reply(U(c.p, 'secretsanta A B C D'));
    let perm; do { perm = rnd.shuffle(names); } while (perm.some((x, i) => x === names[i]));
    await c.reply(`🎅 SECRET SANTA\n\n${names.map((n, i) => `${n} → ${perm[i]}`).join('\n')}\n\n(Everyone in this chat can see this list — run it privately to keep it secret!)`);
});
def('gen', 'bingo', '', async c => { const n = rnd.int(1, 75); await c.reply(`🎱 BINGO\n\n${'BINGO'[Math.floor((n - 1) / 15)]}-${n}`); });
def('gen', 'drawnumbers', '<how many> <max>  e.g. 6 49', async c => { const [k, m] = nums(c.args); if (!Number.isInteger(k) || !Number.isInteger(m) || k < 1 || m < k || m > 1000 || k > 50) return c.reply(U(c.p, 'drawnumbers 6 49')); const pool = Array.from({ length: m }, (_, i) => i + 1); await c.reply(`🎰 DRAW\n\n${rnd.shuffle(pool).slice(0, k).sort((a, b) => a - b).join(' • ')}`); });
const SUITS = ['♠️', '♥️', '♦️', '♣️'], RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
def('gen', 'pickcard', '[count=1]', async c => { const n = Math.min(Math.max(parseInt(c.args[0], 10) || 1, 1), 10); const deck = rnd.shuffle(SUITS.flatMap(s => RANKS.map(r => r + s))); await c.reply(`🃏 CARD${n > 1 ? 'S' : ''}\n\n${deck.slice(0, n).join('  ')}`); });
def('gen', 'coinstreak', '[flips=10]', async c => { const n = Math.min(Math.max(parseInt(c.args[0], 10) || 10, 1), 100); const f = Array.from({ length: n }, () => Math.random() < 0.5 ? 'H' : 'T'); let best = 1, cur = 1; for (let i = 1; i < n; i++) { cur = f[i] === f[i - 1] ? cur + 1 : 1; best = Math.max(best, cur); } await c.reply(`🪙 COIN FLIPS\n\n${f.join(' ')}\n\nHeads: ${f.filter(x => x === 'H').length}  Tails: ${f.filter(x => x === 'T').length}\nLongest streak: ${best}`); });

// ═════════════ GAMES & SOCIAL ═════════════
const TRUTHS = ['What is the most embarrassing thing you have done in public?', 'What is a secret talent nobody knows you have?', 'What is the last lie you told?', 'Who in this chat do you text the most?', 'What is your biggest fear?', 'What is the worst gift you ever received?', 'What is one habit you wish you could drop?', 'What is the silliest thing you have cried about?', 'What was your first impression of the last person you messaged?', 'What is your most-played song right now, honestly?'];
const DARES = ['Send a voice note singing the chorus of your favourite song.', 'Change your WhatsApp status to “I love baobab trees” for one hour.', 'Send the 5th photo in your gallery (if it is safe to share!).', 'Talk only in emojis for the next 5 minutes.', 'Do 10 push-ups and send a thumbs-up when done.', 'Text a family member “I appreciate you” right now.', 'Write a two-line poem about the person above you in this chat.', 'Say the alphabet backwards in a voice note.', 'Compliment every person who replies in the next 10 minutes.', 'Share your most-used emoji and explain why.'];
def('games', 'truthordare', '[truth|dare]', async c => { const m = (c.args[0] || '').toLowerCase(); const t = m === 'truth' || (m !== 'dare' && Math.random() < 0.5); await c.reply(`${t ? '🧠 TRUTH' : '🔥 DARE'}\n\n${t ? rnd.pick(TRUTHS) : rnd.pick(DARES)}`); });
const BRAIN = [['What has keys but can’t open locks?', 'A keyboard (or a piano)'], ['What gets wetter the more it dries?', 'A towel'], ['What can you catch but not throw?', 'A cold'], ['The more you take, the more you leave behind. What am I?', 'Footsteps'], ['What has hands but cannot clap?', 'A clock'], ['What goes up but never comes down?', 'Your age'], ['What has a head and a tail but no body?', 'A coin'], ['I speak without a mouth and hear without ears. What am I?', 'An echo'], ['What month has 28 days?', 'All of them'], ['What can travel around the world while staying in a corner?', 'A stamp']];
def('games', 'brainteaser', '', async c => { const [q, a] = rnd.pick(BRAIN); pending.set(c.from, a); await c.reply(`🧩 BRAIN TEASER\n\n${q}\n\nReveal with ${c.p}reveal`); });
def('games', 'reveal', '', async c => { const a = pending.get(c.from); if (!a) return c.reply(`There is no open question. Start one with ${c.p}brainteaser or ${c.p}trivia2`); pending.delete(c.from); await c.reply(`💡 ANSWER\n\n${a}`); });
def('games', 'rpsls', '<rock|paper|scissors|lizard|spock>', async c => {
    const W = { rock: ['scissors', 'lizard'], paper: ['rock', 'spock'], scissors: ['paper', 'lizard'], lizard: ['spock', 'paper'], spock: ['scissors', 'rock'] }; const I = { rock: '🪨', paper: '📄', scissors: '✂️', lizard: '🦎', spock: '🖖' };
    const me = (c.args[0] || '').toLowerCase(); if (!W[me]) return c.reply(U(c.p, 'rpsls spock'));
    const bot = rnd.pick(Object.keys(W)); const res = me === bot ? '🤝 Draw!' : W[me].includes(bot) ? '🏆 You win!' : '😈 I win!';
    await c.reply(`🖖 RPSLS\n\nYou: ${I[me]} ${me}\nBot: ${I[bot]} ${bot}\n\n${res}`);
});
const RV = { A: 14, K: 13, Q: 12, J: 11 };
def('games', 'highlow', '<high|low>', async c => {
    const g = (c.args[0] || '').toLowerCase(); if (!['high', 'low', 'h', 'l', 'higher', 'lower'].includes(g)) return c.reply(U(c.p, 'highlow high   (is the next card higher or lower?)'));
    const draw = () => ({ r: rnd.pick(RANKS), s: rnd.pick(SUITS) }); const val = x => RV[x.r] || +x.r; const a = draw(); let b = draw(); while (val(a) === val(b)) b = draw();
    const high = g.startsWith('h'); const win = high ? val(b) > val(a) : val(b) < val(a);
    await c.reply(`🃏 HIGH / LOW\n\nFirst: ${a.r}${a.s}\nNext: ${b.r}${b.s}\nYou bet: ${high ? 'HIGHER' : 'LOWER'}\n\n${win ? '🏆 Correct!' : '❌ Wrong!'}`);
});
def('games', 'scratch', '', async c => { const S = ['🍒', '🍋', '🔔', '💎', '7️⃣', '🍀']; const g = Array.from({ length: 9 }, () => rnd.pick(S)); const rows = [g.slice(0, 3), g.slice(3, 6), g.slice(6)]; const win = rows.some(r => r[0] === r[1] && r[1] === r[2]); await c.reply(`🎟️ SCRATCH CARD\n\n${rows.map(r => r.join(' ')).join('\n')}\n\n${win ? '🏆 A winning row — jackpot!' : 'No luck this time — scratch again!'}`); });
def('games', 'spin', '[option1, option2, …]', async c => { const o = c.q ? c.q.split(/[,|]+/).map(x => x.trim()).filter(Boolean) : ['🔴 Red', '⚫ Black', '🟢 Green', '🟡 Gold', '🔵 Blue']; if (o.length < 2) return c.reply(U(c.p, 'spin pizza, burgers, sadza')); await c.reply(`🎡 SPIN THE WHEEL\n\nOptions: ${o.length}\n\n➡️ ${rnd.pick(o)}`); });
def('games', 'madlib', '', async c => { const N = ['baobab', 'minibus', 'goat', 'laptop', 'chicken', 'teacher', 'cellphone']; const A = ['hilarious', 'sleepy', 'enormous', 'suspicious', 'shiny', 'noisy']; const V = ['danced', 'argued', 'vanished', 'sneezed', 'sang', 'exploded']; const P = ['Harare', 'Bulawayo', 'the market', 'a wedding', 'the moon', 'school']; await c.reply(`📖 MAD LIB\n\nOne ${rnd.pick(A)} morning in ${rnd.pick(P)}, a ${rnd.pick(A)} ${rnd.pick(N)} ${rnd.pick(V)} in front of a ${rnd.pick(A)} ${rnd.pick(N)}. Nobody ever ${rnd.pick(V)} again.`); });
def('games', 'nickname', '<name>', async c => { const n = c.q || fullName().split(' ')[0]; const P = ['Captain', 'Lord', 'Big', 'Little', 'Mighty', 'Professor', 'Sir', 'Agent']; const S = ['Thunder', 'the Great', 'Pro Max', 'Prime', 'Supreme', 'Ninja', 'Legend']; await c.reply(`😎 NICKNAMES FOR ${n.toUpperCase()}\n\n${[`${rnd.pick(P)} ${n}`, `${n} ${rnd.pick(S)}`, `${n.slice(0, 3)}${n.slice(0, 3).toLowerCase()}`, `${rnd.pick(P)} ${n} ${rnd.pick(S)}`].join('\n')}`); });
def('games', 'duel', '<@user | name>', async c => {
    const m = mentionsOf(c.msg), foe = m[0] ? tag(m[0]) : (c.q || '').trim(); if (!foe) return c.reply(U(c.p, 'duel @friend'));
    const me = tag(c.me); const win = Math.random() < 0.5; const [w, l] = win ? [me, foe] : [foe, me]; const moves = ['a flying sandal', 'a perfectly timed dad joke', 'a sneaky tickle', 'the ancient Sadza Slam', 'a dramatic slow-motion roll'];
    await c.reply(`⚔️ DUEL\n\n${me} 🆚 ${foe}\n\n${w} wins with ${rnd.pick(moves)}!\n${l} is defeated 💀`, [c.me, ...m]);
});
const ACTIONS = { slap: ['👋', 'slaps', 'That must have stung!'], hug: ['🤗', 'hugs', 'Aww, so wholesome!'], pat: ['🫳', 'pats', 'Good one!'], highfive: ['🙌', 'high-fives', 'Clap!'], poke: ['👉', 'pokes', 'Boop!'], cuddle: ['🥰', 'cuddles', 'Cosy!'], salute: ['🫡', 'salutes', 'Respect!'], cheer: ['🎉', 'cheers for', 'Hooray!'] };
for (const [name, [icon, verb, tail]] of Object.entries(ACTIONS)) {
    def('games', name, '<@user | name>', async c => {
        const m = mentionsOf(c.msg), q = quotedPart(c.msg); const target = m[0] ? tag(m[0]) : q ? tag(q) : (c.q || '').trim();
        if (!target) return c.reply(U(c.p, `${name} @friend`));
        await c.reply(`${icon} ${tag(c.me)} ${verb} ${target}! ${tail}`, [c.me, ...(m[0] ? [m[0]] : q ? [q] : [])]);
    });
}
def('games', 'lovecalc', '<name1> <name2>', async c => { const [a, b] = c.q.split(/\s*(?:\+|&|and|x|,|\s)\s*/i).filter(Boolean); if (!a || !b) return c.reply(U(c.p, 'lovecalc Tendai Rudo')); const n = [a, b].map(x => x.toLowerCase()).sort().join('|'); const p = hash(n) % 101; const bar = '❤️'.repeat(Math.round(p / 10)) + '🤍'.repeat(10 - Math.round(p / 10)); await c.reply(`💘 LOVE CALCULATOR\n\n${a} + ${b}\n\n${bar}\n${p}% — ${p > 80 ? 'a perfect match!' : p > 55 ? 'looking promising!' : p > 30 ? 'friends first?' : 'opposites attract (maybe)'}\n\n(Just for fun!)`); });
const METERS = { coolrate: ['😎', 'COOLNESS'], smartrate: ['🧠', 'BRAIN POWER'], luckrate: ['🍀', 'LUCK'], vibecheck: ['✨', 'VIBES'], aurarate: ['🔮', 'AURA'], richrate: ['💰', 'RICHES'], rizzrate: ['😏', 'RIZZ'] };
for (const [name, [icon, label]] of Object.entries(METERS)) {
    def('games', name, '[name]', async c => {
        const who = (c.q || '').trim() || tag(c.me); const p = hash(name + who.toLowerCase() + today()) % 101;
        await c.reply(`${icon} ${label} METER\n\n${who}\n${'█'.repeat(Math.round(p / 10))}${'░'.repeat(10 - Math.round(p / 10))} ${p}%\n\n(Changes daily — for fun only!)`, /^@/.test(who) ? [c.me] : []);
    });
}

module.exports = { hash, hex2rgb, rgb2hsl };
