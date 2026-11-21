'use strict';
/*
 * WHITEKID PRIME v7 — core
 * Registry, helpers, and a dependency-free HTTP layer (global fetch, Node 18+)
 * with multi-source fallback + a short "cooling" circuit-breaker for dead hosts.
 */
const REG = new Map();   // command name -> { cat, primary, help, fn }
const CATS = new Map();  // category id  -> { icon, title, names[] }
const down = new Map();  // host -> timestamp until which it is skipped
const pending = new Map(); // chatId -> pending answer for /reveal style games

const rnd = {
    pick: a => a[Math.floor(Math.random() * a.length)],
    int: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
    shuffle: a => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
};

function category(id, icon, title) { if (!CATS.has(id)) CATS.set(id, { icon, title, names: [] }); }

function def(catId, names, help, fn) {
    const arr = [].concat(names);
    if (!CATS.has(catId)) throw new Error('unknown category ' + catId);
    for (const n of arr) {
        if (REG.has(n)) throw new Error('duplicate command in pack: ' + n);
        REG.set(n, { cat: catId, primary: arr[0], help, fn });
        CATS.get(catId).names.push(n);
    }
}

// ───── formatting helpers ─────
const fmt = (n, d = 6) => {
    if (typeof n !== 'number' || !isFinite(n)) return String(n);
    if (Number.isInteger(n)) return n.toLocaleString('en-US', { maximumFractionDigits: 0 }).replace(/,/g, ' ');
    return String(parseFloat(n.toFixed(d)));
};
const money = n => (Math.sign(n) * Math.round(Math.abs(n) * 100 + 1e-7) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = s => { const n = Number(String(s ?? '').replace(/,/g, '')); return isFinite(n) && String(s ?? '').trim() !== '' ? n : NaN; };
const nums = args => args.map(num);
const U = (p, s) => `📌 Usage: ${p}${s}`;
const clip = (s, n = 3500) => (String(s).length > n ? String(s).slice(0, n) + '…' : String(s));
const decodeEntities = s => String(s ?? '').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&eacute;/g, 'é').replace(/&ouml;/g, 'ö').replace(/&uuml;/g, 'ü').replace(/&ntilde;/g, 'ñ').replace(/&rsquo;/g, '’').replace(/&ldquo;|&rdquo;/g, '"').replace(/&hellip;/g, '…').replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d));

// ───── HTTP ─────
async function fx(url, opt = {}) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), opt.timeout || 12000);
    try {
        return await fetch(url, { method: opt.method || 'GET', headers: { 'user-agent': 'Mozilla/5.0 (WhitekidPrime/7.0)', accept: 'application/json,text/plain,*/*', ...(opt.headers || {}) }, body: opt.body, signal: ac.signal, redirect: opt.redirect || 'follow' });
    } finally { clearTimeout(t); }
}

// list: array of url strings or { url, pick(data)->value, text:boolean, headers }
async function tryApis(list, opt = {}) {
    const errs = [];
    for (const it of [].concat(list)) {
        const o = typeof it === 'string' ? { url: it } : it;
        let host; try { host = new URL(o.url).host; } catch { errs.push('bad url'); continue; }
        if ((down.get(host) || 0) > Date.now()) { errs.push(host + ': cooling'); continue; }
        try {
            const res = await fx(o.url, { timeout: opt.timeout, headers: o.headers });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = o.text ? await res.text() : await res.json();
            const out = o.pick ? o.pick(data) : data;
            if (out === undefined || out === null || out === '' || (Array.isArray(out) && !out.length)) throw new Error('empty');
            return out;
        } catch (e) {
            const msg = e.name === 'AbortError' ? 'timeout' : e.message;
            errs.push(host + ': ' + msg);
            if (!/^HTTP 4|^empty/.test(msg)) down.set(host, Date.now() + 120000);
        }
    }
    const err = new Error('All sources failed → ' + errs.join(' | '));
    err.sources = errs;
    throw err;
}
const resetCooling = () => down.clear();

// ───── runner ─────
async function run(cmd, ctx) {
    const e = REG.get(cmd);
    if (!e) return false;
    const c = {
        ...ctx,
        p: ctx.activePrefix || '.',
        me: ctx.nowsender,
        textIn: ctx.q || ctx.quotedText || '',
        sendImage: async (url, caption) => ctx.socket.sendMessage(ctx.from, { image: { url }, caption: caption || '' }, ctx.fakeCard ? { quoted: ctx.fakeCard } : undefined),
        sendBuffer: async (buf, caption) => ctx.socket.sendMessage(ctx.from, { image: buf, caption: caption || '' }, ctx.fakeCard ? { quoted: ctx.fakeCard } : undefined)
    };
    try {
        await e.fn(c);
    } catch (err) {
        console.error('[WK7]', cmd, err.message);
        const net = /All sources failed|fetch failed|timeout|HTTP \d+/.test(err.message);
        await ctx.reply(net ? '⚠️ That service did not respond right now. Please try again in a minute.' : `⚠️ ${err.message}`);
    }
    return true;
}

module.exports = { REG, CATS, pending, rnd, category, def, fmt, money, num, nums, U, clip, decodeEntities, fx, tryApis, resetCooling, run };
