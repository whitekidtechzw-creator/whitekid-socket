'use strict';
const crypto = require('crypto');
const { def, category, fmt, U, clip, rnd } = require('./wk7-core');

category('text', '🔤', 'TEXT TOOLS');

// helper: command that transforms text (typed or quoted)
const T = (names, usage, fn, title) => def('text', names, usage, async c => {
    const t = c.textIn;
    if (!t) return c.reply(U(c.p, `${[].concat(names)[0]} ${usage}`));
    const out = fn(t, c);
    await c.reply(`${title || '🔤'} ${[].concat(names)[0].toUpperCase()}\n\n${clip(out)}`);
});

const words = s => s.trim().split(/\s+/).filter(Boolean);
const splitWords = s => s.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_\-]+/g, ' ').trim().split(/\s+/).filter(Boolean).map(w => w.toLowerCase());
const cap = w => w.charAt(0).toUpperCase() + w.slice(1);

T('upper', '<text>', s => s.toUpperCase());
T('lower', '<text>', s => s.toLowerCase());
T('title', '<text>', s => s.toLowerCase().replace(/(^|\s)\S/g, m => m.toUpperCase()));
T('sentence', '<text>', s => s.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, a, b) => a + b.toUpperCase()));
T('swapcase', '<text>', s => [...s].map(ch => ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()).join(''));
T('camel', '<text>', s => { const w = splitWords(s); return w[0] + w.slice(1).map(cap).join(''); });
T('snake', '<text>', s => splitWords(s).join('_'));
T('kebab', '<text>', s => splitWords(s).join('-'));
T('slug', '<text>', s => s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
T('wordcount', '<text>', s => `Words: ${words(s).length}\nCharacters: ${s.length}\nCharacters (no spaces): ${s.replace(/\s/g, '').length}\nLines: ${s.split('\n').length}`);
T('charcount', '<text>', s => `Characters: ${[...s].length}\nWithout spaces: ${s.replace(/\s/g, '').length}\nLetters: ${(s.match(/[a-z]/gi) || []).length}\nDigits: ${(s.match(/\d/g) || []).length}`);
T('vowels', '<text>', s => { const v = (s.match(/[aeiou]/gi) || []).length, l = (s.match(/[a-z]/gi) || []).length; return `Vowels: ${v}\nConsonants: ${l - v}`; });
T('reversewords', '<text>', s => words(s).reverse().join(' '));
T('sortwords', '<text>', s => words(s).sort((a, b) => a.localeCompare(b)).join(' '));
T('dedupe', '<text>', s => [...new Set(words(s))].join(' '));
T('nospaces', '<text>', s => s.replace(/\s+/g, ''));
T('acronym', '<phrase>', s => words(s).map(w => w[0].toUpperCase()).join(''));
T('initials', '<full name>', s => words(s).map(w => w[0].toUpperCase() + '.').join(' '));
T('longestword', '<text>', s => { const w = words(s).map(x => x.replace(/[^\p{L}\p{N}'-]/gu, '')).filter(Boolean).sort((a, b) => b.length - a.length); return `${w[0]} (${w[0].length} letters)`; });
T('linecount', '<text>', s => `Lines: ${s.split('\n').length}\nNon-empty: ${s.split('\n').filter(l => l.trim()).length}`);
T('sortlines', '<lines>', s => s.split('\n').sort((a, b) => a.localeCompare(b)).join('\n'));
T('numberlines', '<lines>', s => s.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n'));
T('bullets', '<lines>', s => s.split('\n').filter(l => l.trim()).map(l => '• ' + l.trim()).join('\n'));
T('readtime', '<text>', s => { const n = words(s).length; const m = n / 200; return `Words: ${n}\nReading time: ${m < 1 ? Math.max(1, Math.round(m * 60)) + ' sec' : Math.round(m * 10) / 10 + ' min'}\nSpeaking time: ${Math.round((n / 130) * 10) / 10} min`; });
T('textstats', '<text>', s => {
    const w = words(s), sent = (s.match(/[.!?]+(\s|$)/g) || []).length || 1;
    const syl = w.reduce((a, x) => a + Math.max(1, (x.toLowerCase().replace(/[^a-z]/g, '').replace(/e$/, '').match(/[aeiouy]+/g) || []).length), 0);
    const flesch = 206.835 - 1.015 * (w.length / sent) - 84.6 * (syl / Math.max(1, w.length));
    return `Words: ${w.length}\nSentences: ${sent}\nAvg words/sentence: ${(w.length / sent).toFixed(1)}\nSyllables: ${syl}\nReadability (Flesch): ${flesch.toFixed(1)}`;
});
T('pigpay', '<text>', s => s.replace(/[A-Za-z]+/g, w => /^[aeiou]/i.test(w) ? w + 'way' : (w.match(/^[^aeiou]+/i) ? w.replace(/^([^aeiou]+)(.*)$/i, '$2$1ay') : w + 'ay')));
T('zalgo', '<text>', s => { const up = ['\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311', '\u0306', '\u0310', '\u0352', '\u0357', '\u0351', '\u0307', '\u0308', '\u030a']; const dn = ['\u0316', '\u0317', '\u0318', '\u0319', '\u031c', '\u031d', '\u031e', '\u031f', '\u0320', '\u0324', '\u0325', '\u0326']; return [...s].map(ch => ch + Array.from({ length: rnd.int(1, 3) }, () => rnd.pick(up)).join('') + Array.from({ length: rnd.int(1, 2) }, () => rnd.pick(dn)).join('')).join(''); });
T('strike', '<text>', s => [...s].map(ch => ch + '\u0336').join(''));
T('underline', '<text>', s => [...s].map(ch => ch + '\u0332').join(''));
T('smallcaps', '<text>', s => { const m = 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ'; return [...s.toLowerCase()].map(ch => (ch >= 'a' && ch <= 'z') ? m[ch.charCodeAt(0) - 97] : ch).join(''); });
T('fullwidth', '<text>', s => [...s].map(ch => ch === ' ' ? '\u3000' : (ch >= '!' && ch <= '~') ? String.fromCharCode(ch.charCodeAt(0) + 0xFEE0) : ch).join(''));
T('emojify', '<text>', s => [...s.toLowerCase()].map(ch => (ch >= 'a' && ch <= 'z') ? String.fromCodePoint(0x1F1E6 + ch.charCodeAt(0) - 97) + '\u200b' : (ch >= '0' && ch <= '9') ? ch + '\uFE0F\u20E3' : ch).join(' '));
T('mirror', '<text>', s => s + ' | ' + [...s].reverse().join(''));

// Unicode styles
const style = (A, a, digits) => s => [...s].map(ch => {
    if (ch >= 'A' && ch <= 'Z') return String.fromCodePoint(A + ch.charCodeAt(0) - 65);
    if (ch >= 'a' && ch <= 'z') return String.fromCodePoint(a + ch.charCodeAt(0) - 97);
    if (digits && ch >= '0' && ch <= '9') return String.fromCodePoint(digits + ch.charCodeAt(0) - 48);
    return ch;
}).join('');
T('bold', '<text>', style(0x1D5D4, 0x1D5EE, 0x1D7EC));
T('italic', '<text>', style(0x1D468, 0x1D482));
T('script', '<text>', style(0x1D4D0, 0x1D4EA));
T('gothic', '<text>', style(0x1D56C, 0x1D586));
T('mono', '<text>', style(0x1D670, 0x1D68A, 0x1D7F6));
T('circled', '<text>', s => [...s].map(ch => (ch >= 'A' && ch <= 'Z') ? String.fromCodePoint(0x24B6 + ch.charCodeAt(0) - 65) : (ch >= 'a' && ch <= 'z') ? String.fromCodePoint(0x24D0 + ch.charCodeAt(0) - 97) : (ch >= '1' && ch <= '9') ? String.fromCodePoint(0x2460 + ch.charCodeAt(0) - 49) : ch === '0' ? '⓪' : ch).join(''));

// Encoders / decoders
const MORSE = { a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....', i: '..', j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.', q: '--.-', r: '.-.', s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.' };
const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));
T('frommorse', '<.- -...>', s => s.trim().split(/\s*\/\s*|\s{3,}/).map(w => w.trim().split(/\s+/).map(x => MORSE_REV[x] || '?').join('')).join(' '));
T('frombinary', '<01001000 01101001>', s => { const b = s.replace(/[^01\s]/g, '').trim().split(/\s+/); if (!b.length || !b.every(x => x.length > 0 && x.length <= 16)) throw new Error('Give binary bytes separated by spaces, e.g. 01001000 01101001'); return String.fromCodePoint(...b.map(x => parseInt(x, 2))); });
T('fromhex', '<48 65 6c 6c 6f>', s => { const h = s.replace(/0x/gi, '').replace(/[^0-9a-f]/gi, ''); if (!h || h.length % 2) throw new Error('Give an even number of hex digits.'); return Buffer.from(h, 'hex').toString('utf8'); });
T('b64enc', '<text>', s => Buffer.from(s, 'utf8').toString('base64'));
T('b64dec', '<base64>', s => { const clean = s.trim(); if (!/^[A-Za-z0-9+/_-]+={0,2}$/.test(clean)) throw new Error('That is not valid base64.'); return Buffer.from(clean.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'); });
T('urlenc', '<text>', s => encodeURIComponent(s));
T('urldec', '<text>', s => { try { return decodeURIComponent(s); } catch { throw new Error('Malformed URL-encoded text.'); } });
T('htmlenc', '<text>', s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'));
T('htmldec', '<text>', s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&'));
T('caesar', '<shift> <text>  e.g. 3 hello', s => {
    const m = s.match(/^(-?\d+)\s+([\s\S]+)$/); if (!m) throw new Error('Usage: caesar <shift> <text>, e.g. caesar 3 hello');
    const k = ((parseInt(m[1], 10) % 26) + 26) % 26;
    return m[2].replace(/[a-z]/gi, ch => { const b = ch <= 'Z' ? 65 : 97; return String.fromCharCode((ch.charCodeAt(0) - b + k) % 26 + b); });
});
T('atbash', '<text>', s => s.replace(/[a-z]/gi, ch => { const b = ch <= 'Z' ? 65 : 97; return String.fromCharCode(b + 25 - (ch.charCodeAt(0) - b)); }));
T('vigenere', '<key> <text>  (prefix decode: d:key text)', s => {
    const m = s.match(/^(d:)?([a-z]+)\s+([\s\S]+)$/i); if (!m) throw new Error('Usage: vigenere <key> <text> (use d:key to decode)');
    const dec = !!m[1], key = m[2].toLowerCase(); let i = 0;
    return m[3].replace(/[a-z]/gi, ch => { const b = ch <= 'Z' ? 65 : 97; const k = key.charCodeAt(i++ % key.length) - 97; return String.fromCharCode(((ch.charCodeAt(0) - b + (dec ? 26 - k : k)) % 26) + b); });
});
for (const algo of ['md5', 'sha1', 'sha256', 'sha512']) T(algo, '<text>', s => crypto.createHash(algo).update(s).digest('hex'), '🔐');
T('crc32', '<text>', s => { let c, crc = 0xFFFFFFFF; for (const b of Buffer.from(s)) { c = (crc ^ b) & 0xFF; for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xEDB88320 : c >>> 1; crc = (crc >>> 8) ^ c; } return ((crc ^ 0xFFFFFFFF) >>> 0).toString(16).padStart(8, '0'); }, '🔐');

// Words & numbers
T('anagram', '<word1> <word2>', s => { const [a, b] = words(s); if (!b) throw new Error('Give two words.'); const n = x => x.toLowerCase().replace(/[^a-z0-9]/g, '').split('').sort().join(''); return `${a} / ${b}\n\n${n(a) === n(b) ? '✅ They ARE anagrams' : '❌ Not anagrams'}`; });
T('nato', '<text>', s => { const N = { a: 'Alfa', b: 'Bravo', c: 'Charlie', d: 'Delta', e: 'Echo', f: 'Foxtrot', g: 'Golf', h: 'Hotel', i: 'India', j: 'Juliett', k: 'Kilo', l: 'Lima', m: 'Mike', n: 'November', o: 'Oscar', p: 'Papa', q: 'Quebec', r: 'Romeo', s: 'Sierra', t: 'Tango', u: 'Uniform', v: 'Victor', w: 'Whiskey', x: 'X-ray', y: 'Yankee', z: 'Zulu', 0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Niner' }; return [...s.toLowerCase()].filter(ch => N[ch]).map(ch => N[ch]).join(' '); });
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const SCALE = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion'];
function below1000(n) { let s = ''; if (n >= 100) { s += ONES[Math.floor(n / 100)] + ' hundred'; n %= 100; if (n) s += ' and '; } if (n >= 20) { s += TENS[Math.floor(n / 10)]; if (n % 10) s += '-' + ONES[n % 10]; } else if (n > 0 || !s) s += ONES[n]; return s; }
function numToWords(n) {
    if (n === 0) return 'zero'; let neg = n < 0; n = Math.abs(n); const parts = []; let i = 0;
    while (n > 0) { const chunk = n % 1000; if (chunk) parts.unshift(below1000(chunk) + (SCALE[i] ? ' ' + SCALE[i] : '')); n = Math.floor(n / 1000); i++; }
    return (neg ? 'minus ' : '') + parts.join(', ');
}
T('numtowords', '<number>', s => { const raw = s.replace(/[, ]/g, ''); if (!/^-?\d+(\.\d+)?$/.test(raw)) throw new Error('Give a number like 1234 or -56.7'); const n = Number(raw); if (Math.abs(n) >= 1e18) throw new Error('Number too large (max 999 quadrillion).'); const [i, d] = raw.split('.'); return numToWords(Math.trunc(Number(i))) + (d ? ' point ' + [...d].map(x => ONES[+x]).join(' ') : ''); });
T('ordinal', '<number>', s => { const n = parseInt(s, 10); if (!isFinite(n)) throw new Error('Give a whole number.'); const v = Math.abs(n) % 100; const suf = (v >= 11 && v <= 13) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[Math.abs(n) % 10] || 'th'); return n + suf; });

module.exports = { numToWords };
