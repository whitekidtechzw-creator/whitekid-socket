'use strict';
/*
 * WHITEKID PRIME v7 — COMMAND PACK ENTRY
 * Usage from the bot:   const WK7 = require('./wk7');
 *                       if (WK7.has(command)) await WK7.run(command, ctx);
 */
const core = require('./wk7-core');
require('./wk7-text'); require('./wk7-math'); require('./wk7-info'); require('./wk7-fun'); require('./wk7-net');
const { def, category, REG, CATS, fx, U, clip } = core;

category('sys', '🛠️', 'PACK TOOLS');

// ───── endpoints the pack itself depends on (used by .apicheck) ─────
const PROBES = [
    ['dictionaryapi.dev', 'https://api.dictionaryapi.dev/api/v2/entries/en/hello'],
    ['datamuse', 'https://api.datamuse.com/words?rel_rhy=love&max=1'],
    ['urbandictionary', 'https://api.urbandictionary.com/v0/define?term=hello'],
    ['open-meteo geocoding', 'https://geocoding-api.open-meteo.com/v1/search?name=Harare&count=1'],
    ['open-meteo forecast', 'https://api.open-meteo.com/v1/forecast?latitude=-17.8&longitude=31.05&current=temperature_2m'],
    ['open-meteo air quality', 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=-17.8&longitude=31.05&current=us_aqi'],
    ['restcountries', 'https://restcountries.com/v3.1/name/zimbabwe?fields=name'],
    ['nager.date holidays', 'https://date.nager.at/api/v3/PublicHolidays/2026/ZA'],
    ['open-notify ISS', 'https://api.open-notify.org/iss-now.json'],
    ['wheretheiss.at', 'https://api.wheretheiss.at/v1/satellites/25544'],
    ['USGS earthquakes', 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson'],
    ['open.er-api.com', 'https://open.er-api.com/v6/latest/USD'],
    ['frankfurter', 'https://api.frankfurter.app/latest?from=USD&to=EUR'],
    ['coingecko', 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'],
    ['agify', 'https://api.agify.io/?name=tendai'],
    ['nationalize', 'https://api.nationalize.io/?name=tendai'],
    ['chucknorris.io', 'https://api.chucknorris.io/jokes/random'],
    ['kanye.rest', 'https://api.kanye.rest/'],
    ['zenquotes', 'https://zenquotes.io/api/random'],
    ['catfact.ninja', 'https://catfact.ninja/fact'],
    ['numbersapi', 'http://numbersapi.com/42/trivia'],
    ['official-joke-api', 'https://official-joke-api.appspot.com/random_joke'],
    ['jokeapi', 'https://v2.jokeapi.dev/joke/Programming?safe-mode&type=twopart'],
    ['thecocktaildb', 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=margarita'],
    ['themealdb', 'https://www.themealdb.com/api/json/v1/1/random.php'],
    ['pokeapi', 'https://pokeapi.co/api/v2/pokemon/pikachu'],
    ['openlibrary', 'https://openlibrary.org/search.json?q=things+fall+apart&limit=1'],
    ['tvmaze', 'https://api.tvmaze.com/singlesearch/shows?q=girls'],
    ['jikan (MAL)', 'https://api.jikan.moe/v4/anime?q=naruto&limit=1'],
    ['iTunes search', 'https://itunes.apple.com/search?term=jack+johnson&limit=1'],
    ['wikipedia REST', 'https://en.wikipedia.org/api/rest_v1/page/summary/Zimbabwe'],
    ['hacker-news', 'https://hacker-news.firebaseio.com/v0/topstories.json'],
    ['github', 'https://api.github.com/users/octocat'],
    ['opentdb', 'https://opentdb.com/api.php?amount=1&type=multiple'],
    ['randomfox', 'https://randomfox.ca/floof/'],
    ['random-d.uk', 'https://random-d.uk/api/v2/random'],
    ['dog.ceo', 'https://dog.ceo/api/breeds/image/random'],
    ['dicebear', 'https://api.dicebear.com/9.x/adventurer/png?seed=test&size=64'],
    ['robohash', 'https://robohash.org/test.png?size=64x64'],
    ['qrserver', 'https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=test'],
    ['barcode (bwip-js)', 'https://bwipjs-api.metafloor.com/?bcid=code128&text=123'],
    ['dns.google', 'https://dns.google/resolve?name=example.com&type=A'],
    ['cloudflare DoH', 'https://cloudflare-dns.com/dns-query?name=example.com&type=A'],
    ['rdap.org', 'https://rdap.org/domain/example.com'],
    ['ipwho.is', 'https://ipwho.is/8.8.8.8'],
    ['ipapi.co', 'https://ipapi.co/8.8.8.8/json/']
];

// Probe a list of [label, url]; 2xx = OK, 3xx/4xx = host alive (needs valid params/key), 5xx/timeout = DEAD
async function probeAll(targets, { timeout = 8000, concurrency = 10 } = {}) {
    const results = []; let idx = 0;
    const worker = async () => {
        while (idx < targets.length) {
            const [label, url] = targets[idx++]; const t0 = Date.now();
            try {
                const res = await fx(url, { timeout, headers: { range: 'bytes=0-1023' } });
                try { await res.arrayBuffer(); } catch { /* ignore body errors */ }
                const s = res.status; results.push({ label, url, status: s, ms: Date.now() - t0, state: s >= 200 && s < 300 ? 'ok' : (s >= 500 || s === 429 ? 'dead' : 'alive') });
            } catch (e) { results.push({ label, url, status: 0, ms: Date.now() - t0, state: 'dead', error: e.name === 'AbortError' ? 'timeout' : (e.cause?.code || e.message) }); }
        }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, targets.length) }, worker));
    return results;
}
function summarize(results, title) {
    const ok = results.filter(r => r.state === 'ok'), al = results.filter(r => r.state === 'alive'), dead = results.filter(r => r.state === 'dead');
    let out = `${title}\n\n🟢 Working: ${ok.length}\n🟡 Reachable but returned 3xx/4xx (needs valid input or key): ${al.length}\n🔴 Down / timeout / 5xx: ${dead.length}\nTotal tested: ${results.length}`;
    if (dead.length) out += '\n\n🔴 DOWN:\n' + dead.slice(0, 40).map(r => `• ${r.label} — ${r.error || 'HTTP ' + r.status}`).join('\n') + (dead.length > 40 ? `\n…and ${dead.length - 40} more` : '');
    if (al.length) out += '\n\n🟡 CHECK (reachable, non-2xx):\n' + al.slice(0, 25).map(r => `• ${r.label} — HTTP ${r.status}`).join('\n') + (al.length > 25 ? `\n…and ${al.length - 25} more` : '');
    return out;
}

def('sys', 'apicheck', '[pack | all]  (owner only) — tests the APIs and reports which are down', async c => {
    if (!c.isOwner) return c.reply('🔐 Owner-only command.');
    const mode = (c.args[0] || 'all').toLowerCase();
    const targets = [...PROBES]; if (mode !== 'pack' && Array.isArray(c.apiTargets)) targets.push(...c.apiTargets);
    await c.reply(`🔎 Testing ${targets.length} endpoints… this can take up to a minute.`);
    const res = await probeAll(targets);
    core.resetCooling();
    try { require('fs').writeFileSync(require('path').join(require('os').tmpdir(), 'wk7_apicheck.json'), JSON.stringify({ at: new Date().toISOString(), res }, null, 2)); } catch { /* optional */ }
    for (const part of splitText(summarize(res, '📡 API HEALTH REPORT'), 3000)) await c.reply(part);
});

function splitText(t, n) { const out = []; let cur = ''; for (const line of t.split('\n')) { if ((cur + '\n' + line).length > n) { out.push(cur); cur = line; } else cur += (cur ? '\n' : '') + line; } if (cur) out.push(cur); return out; }

def('sys', ['cmds', 'commands'], '[category]', async c => {
    const id = (c.args[0] || '').toLowerCase();
    if (!id) {
        const lines = [...CATS].map(([k, v]) => `${v.icon} ${c.p}cmds ${k} — ${v.title} (${v.names.length})`).join('\n');
        return c.reply(`🧰 WHITEKID PRIME v7 — EXTRA COMMANDS\n\n${lines}\n\nTotal in this pack: ${REG.size}\n\nTip: ${c.p}cmds math shows every math command with usage.`);
    }
    const cat = CATS.get(id); if (!cat) return c.reply(`Unknown category. Use: ${[...CATS.keys()].join(', ')}`);
    const rows = cat.names.map(n => { const e = REG.get(n); return `${c.p}${n}${e.help ? ' ' + e.help : ''}`; });
    for (const part of splitText(`${cat.icon} ${cat.title} (${cat.names.length})\n\n${rows.join('\n')}`, 3000)) await c.reply(part);
});

const fancy = t => String(t).toUpperCase().replace(/[A-Z]/g, c => String.fromCodePoint(0x1D63C + c.charCodeAt(0) - 65));
function menuBlock(p = '.') {
    const out = [];
    for (const [, v] of CATS) {
        out.push(`╭━━〔 𓆣 ${fancy('V7 ' + v.title)} 〕━━⬣`, '┃');
        for (const n of v.names) out.push(`┃ 𓆣 ${p}${n}`);
        out.push('┃', '╰━━━━━━━━━━━━━━━⬣', '');
    }
    return '\n' + out.join('\n');
}

module.exports = {
    has: name => REG.has(name),
    names: () => [...REG.keys()],
    count: () => REG.size,
    run: core.run,
    menuBlock,
    probeAll, summarize, PROBES,
    categories: () => CATS
};
