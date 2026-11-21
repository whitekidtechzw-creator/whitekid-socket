'use strict';
/*
 * WHITEKID PRIME v7 — pack self-test            run:  node wk7/test.js
 *  1. every registered command must have a sample here (100% coverage enforced)
 *  2. every command is executed with valid input and must reply without an error
 *  3. deterministic commands are checked against known-correct answers
 *  4. every command is executed with EMPTY input and must not crash (usage message)
 *  5. network commands are exercised against a mocked fetch (response-shape handling),
 *     then again with the network fully "down" to prove failures are handled gracefully
 * NOTE: the mock proves our parsing/handling code; it cannot prove a live API is up —
 *       use `.apicheck` (or `node apicheck.js`) on the real server for that.
 */
const WK7 = require('./wk7');
const core = require('./wk7-core');

const EXPECT = {}; // name -> [args, substring]
const S = {}; // name -> args string
const add = (names, args, expect) => { for (const n of [].concat(names)) { S[n] = args; if (expect !== undefined) EXPECT[n] = expect; } };

// ── text ──
add('upper', 'hello world', 'HELLO WORLD'); add('lower', 'HELLO', 'hello'); add('title', 'the quick brown fox', 'The Quick Brown Fox'); add('sentence', 'hello. how are you? fine', 'Hello. How are you? Fine');
add('swapcase', 'aBc', 'AbC'); add('camel', 'hello big world', 'helloBigWorld'); add('snake', 'Hello Big World', 'hello_big_world'); add('kebab', 'helloBigWorld', 'hello-big-world'); add('slug', 'Héllo Wörld! 2026', 'hello-world-2026');
add('wordcount', 'one two three', 'Words: 3'); add('charcount', 'abc 123', 'Digits: 3'); add('vowels', 'education', 'Vowels: 5'); add('reversewords', 'one two three', 'three two one'); add('sortwords', 'pear apple fig', 'apple fig pear');
add('dedupe', 'a b a c b', 'a b c'); add('nospaces', 'a b  c', 'abc'); add('acronym', 'portable network graphics', 'PNG'); add('initials', 'tendai moyo', 'T. M.'); add('longestword', 'a bb cccc dd', 'cccc'); add('linecount', 'a b c', 'Lines: 1');
add('sortlines', 'b a c'); add('numberlines', 'x y'); add('bullets', 'x y'); add('readtime', 'word '.repeat(400), 'Words: 400'); add('textstats', 'This is one sentence. Here is another one.', 'Sentences: 2');
add('pigpay', 'hello apple', 'ellohay appleway'); add('zalgo', 'hi'); add('strike', 'hi'); add('underline', 'hi'); add('smallcaps', 'hello', 'ʜᴇʟʟᴏ'); add('fullwidth', 'Ab1', 'Ａｂ１'); add('emojify', 'ab1'); add('mirror', 'abc', 'cba');
add('bold', 'Hi 2', '𝗛𝗶 𝟮'); add('italic', 'Hi'); add('script', 'Hi'); add('gothic', 'Hi'); add('mono', 'Hi 1'); add('circled', 'Ab1', 'Ⓐⓑ①');
add('frommorse', '... --- ...', 'sos'); add('frombinary', '01001000 01101001', 'Hi'); add('fromhex', '48 69', 'Hi'); add('b64enc', 'hello', 'aGVsbG8='); add('b64dec', 'aGVsbG8=', 'hello');
add('urlenc', 'a b&c', 'a%20b%26c'); add('urldec', 'a%20b%26c', 'a b&c'); add('htmlenc', '<a href="x">', '&lt;a href=&quot;x&quot;&gt;'); add('htmldec', '&lt;b&gt; &amp;', '<b> &'); add('caesar', '3 hello', 'khoor'); add('atbash', 'abc', 'zyx');
add('vigenere', 'lemon attackatdawn', 'lxfopvefrnhr'); add('md5', 'hello', '5d41402abc4b2a76b9719d911017c592'); add('sha1', 'hello', 'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d'); add('sha256', 'hello', '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
add('sha512', 'hello', '9b71d224bd62f3785d96d46ad3ea3d73'); add('crc32', 'hello', '3610a686'); add('anagram', 'listen silent', 'ARE anagrams'); add('nato', 'abc', 'Alfa Bravo Charlie'); add('numtowords', '1234', 'one thousand, two hundred and thirty-four'); add('ordinal', '22', '22nd');
// ── math ──
add(['math', 'solve'], '(2+3)*4^2/sqrt(81)', '8.88888888'); add('sum', '1 2 3 4', '10'); add(['avg', 'mean'], '2 4 6', 'Mean: 4'); add('median', '5 1 3', 'Median: 3'); add('statmode', '1 2 2 3', '2'); add('stddev', '2 4 4 4 5 5 7 9', 'Population σ: 2'); add('minmax', '4 9 1', 'Max: 9');
add('factorial', '10', '3628800'); add(['fib', 'fibonacci'], '10', '55'); add('isprime', '97', 'PRIME'); add('primes', '30', '2, 3, 5, 7, 11, 13, 17, 19, 23, 29'); add('gcd', '48 18', '= 6'); add('lcm', '4 6', '= 12'); add('factors', '36', '1, 2, 3, 4, 6, 9, 12, 18, 36');
add('power', '2 10', '1 024'); add('sqrt', '144', '12'); add('ncr', '10 3', '= 120'); add('npr', '10 3', '= 720'); add('collatz', '27', 'Steps: 111'); add('digitsum', '98765', 'Digital root: 8'); add('sequence', 'arith 2 3 5', '2, 5, 8, 11, 14');
add('quadratic', '1 -3 2', 'x₁ = 2'); add('pythag', '3 4', '5'); add('area', 'circle 5', '78.539816'); add('bin2dec', '1010', '= 10'); add('dec2bin', '10', '= 1010'); add('dec2hex', '255', '= FF'); add('hex2dec', 'ff', '= 255'); add('basecv', 'ff 16 2', '11111111');
add('convert', '1 km mi', '0.621371'); add('length', '100 cm m', '= 1 m'); add('weight', '1 kg lb', '2.2046'); add('volume', '1 gal l', '3.7854'); add('speed', '36 kmh ms', '= 10 ms'); add('datasize', '1 gb mb', '1 000'); add('areaconv', '1 ha m2', '10 000'); add('duration', '2 h min', '120'); add('pressure', '1 atm kpa', '101.325'); add('energy', '1 kwh kj', '3 600'); add('angle', '180 deg rad', '3.14159');
add('temp', '100 c', '212'); add('pctchange', '80 100', 'Increase of 25%'); add('ratio', '1920 1080', '16:9'); add('simpleinterest', '1000 5 3', '150.00'); add('compound', '1000 5 10 12', '1,647.01'); add('loan', '5000 12 2', '235.37'); add('vat', '100 15', '115.00'); add('markup', '60 100', 'Markup: 66.67%');
add('splitbill', '120 4 10', '33.00'); add('fuelcost', '250 12 1.65', '34.38'); add('speedcalc', '120 1.5', '80'); add('sci', '123456789', '1.234568e+8'); add('roundto', '3.14159 2', '3.14');
// ── time ──
add('countdown', '2099-12-25 Xmas', 'day(s) to go'); add('dayofweek', '2000-01-01', 'Saturday'); add('datediff', '2026-01-01 2026-12-31', '364 days'); add('addays', '2026-01-31 45', '2026'); add('leapyear', '2028', 'IS ✅'); add('weeknumber', '2026-01-05', 'ISO week: 2'); add('dayofyear', '2026-12-31', 'Day 365 of 365');
add('unixtime', '1700000000', '2023-11-14 22:13:20'); add('nextbirthday', '2001-08-14', 'NEXT BIRTHDAY'); add('calendar', '12 2026', 'December 2026'); add('timein', 'harare', 'AFRICA/HARARE'); add('moonphase', '2000-01-06', 'New Moon'); add('chinesezodiac', '2020', 'Metal Rat'); add('birthstone', '8', 'Peridot'); add('generation', '1999', 'Generation Z');
// ── info ──
add('capital', 'zimbabwe', 'Harare'); add('callcode', 'south africa', '+27'); add('currencyof', 'kenya', 'KES'); add('flagof', 'zw', '🇿🇼'); add('countryinfo', 'nigeria', 'NGN'); add('element', 'Fe', 'Iron'); add('planet', 'mars', '6 779'); add('httpstatus', '404', 'Not Found'); add('ascii', 'A', 'Decimal: 65');
add('zimprovinces', '', 'Gweru'); add('zimfacts', ''); add('shona', 'greetings', 'Mhoro'); add('ndebele', 'greetings', 'Sawubona'); add('shonaproverb', ''); add('africanproverb', '');
// ── generators ──
add('randnum', '1 6 3'); add('randname', '3'); add('randemail', '', 'example'); add('passphrase', '4'); add('randpin', '6'); add('colorinfo', '#FF8C00', 'rgb(255, 140, 0)'); add('rgb2hex', '255 140 0', '#FF8C00'); add('hex2rgb', '#FF8C00', 'rgb(255, 140, 0)'); add('palette', '#1E90FF', 'Complement');
add('fakeuser', ''); add('randdate', '2020 2021'); add('randip', ''); add('randmac', ''); add('username', 'zim'); add('teamsplit', '2 a b c d', 'Team 2'); add('raffle', 'a b c', 'Winner'); add('secretsanta', 'a b c d', '→'); add('bingo', ''); add('drawnumbers', '6 49'); add('pickcard', '3'); add('coinstreak', '10');
// ── games ──
add('truthordare', 'truth'); add('brainteaser', ''); add('reveal', ''); add('rpsls', 'spock'); add('highlow', 'high'); add('scratch', ''); add('spin', 'a, b, c'); add('madlib', ''); add('nickname', 'Tendai'); add('duel', 'Rudo');
for (const n of ['slap', 'hug', 'pat', 'highfive', 'poke', 'cuddle', 'salute', 'cheer']) add(n, 'Rudo');
add('lovecalc', 'Tendai Rudo'); for (const n of ['coolrate', 'smartrate', 'luckrate', 'vibecheck', 'aurarate', 'richrate', 'rizzrate']) add(n, 'Tendai');
// ── net (mocked) ──
add(['define', 'dictionary'], 'hello', 'a greeting'); add('synonym', 'happy', 'a, b'); add('antonym', 'happy', 'a, b'); add('rhyme', 'love', 'a, b'); add('urban', 'rizz', 'charisma'); add('forecast', 'Harare', 'Harare'); add('airquality', 'Harare', 'US AQI: 42'); add('sunrise', 'Harare', '05:30');
add('geocode', 'Harare', 'Lat: -17.8'); add('country', 'zimbabwe', 'Harare'); add('holidays', 'ZA 2026', 'New Year'); add('iss', '', 'Latitude: 1.000'); add('earthquakes', '', 'M5'); add(['fx', 'currency'], '100 USD ZAR', '1,850.00'); add('cryptoprice', 'bitcoin usd', '90,000.00');
add('agify', 'tendai', '30'); add('nationalize', 'tendai', 'ZW: 60%'); add('chuck', ''); add('kanye', ''); add('zenquote', ''); add('catfact', ''); add('numberfact', '42'); add('joke2', ''); add('cocktail', 'margarita', 'Tequila'); add('meal', 'pasta', 'Pasta'); add('randommeal', ''); add('pokemon', 'pikachu');
add('book', 'things fall apart', 'T'); add('tvshow', 'show', 'Drama'); add('animeinfo', 'naruto', 'NARUTO'); add('musicsearch', 'x', 'a •'); add('wikisummary', 'Zimbabwe', 'ZIMBABWE'); add('hackernews', ''); add('ghuser', 'octocat', 'octocat'); add('trivia2', '');
add('foxpic', ''); add('duckpic', ''); add('dogpic', ''); add('avatar', 'tendai'); add('robot', 'tendai'); add('qrmake', 'https://example.com'); add('barcode', '123456789012');
add('isup', 'example.com', 'Status: 200'); add('pagetitle', 'example.com', 'Example Domain'); add('expandurl', 'bit.ly/x', 'Redirects followed: 1'); add('dnslookup', 'example.com', '1.2.3.4'); add('domaininfo', 'example.com', 'EXAMPLE.COM'); add('ipwho', '8.8.8.8', 'Google');
// ── sys ──
add(['cmds', 'commands'], 'math', 'MATH'); add('apicheck', 'pack');

// ───────── mock network ─────────
const J = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json' } });
const T = (t, status = 200, headers = {}) => new Response(t, { status, headers });
const meal = { strMeal: 'Pasta', strArea: 'Italian', strCategory: 'Pasta', strIngredient1: 'Pasta', strMeasure1: '200g', strInstructions: 'Cook it.', strYoutube: '' };
const ROUTES = [
    ['dictionaryapi.dev', () => J([{ word: 'hello', phonetic: '/həˈləʊ/', meanings: [{ partOfSpeech: 'noun', definitions: [{ definition: 'a greeting', example: 'say hello' }] }] }])],
    ['datamuse.com', () => J([{ word: 'a' }, { word: 'b' }])],
    ['urbandictionary', () => J({ list: [{ word: 'rizz', definition: 'charisma [x]', example: 'he has [rizz]', thumbs_up: 1, thumbs_down: 0 }] })],
    ['geocoding-api.open-meteo', () => J({ results: [{ name: 'Harare', country: 'Zimbabwe', admin1: 'Harare', latitude: -17.8, longitude: 31.05, timezone: 'Africa/Harare', elevation: 1490 }] })],
    ['air-quality-api.open-meteo', () => J({ current: { us_aqi: 42, pm10: 10, pm2_5: 5 } })],
    ['api.open-meteo.com', () => J({ current: { temperature_2m: 22, relative_humidity_2m: 50, wind_speed_10m: 10, weather_code: 1 }, daily: { time: ['2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22'], weather_code: [1, 2, 3, 61], temperature_2m_max: [30, 31, 29, 27], temperature_2m_min: [15, 16, 14, 13], precipitation_probability_max: [0, 10, 20, 60], sunrise: ['2026-11-19T05:30'], sunset: ['2026-11-19T18:30'] } })],
    ['restcountries.com', () => J([{ name: { common: 'Zimbabwe', official: 'Republic of Zimbabwe' }, capital: ['Harare'], region: 'Africa', subregion: 'Southern Africa', population: 16000000, area: 390757, languages: { sna: 'Shona' }, currencies: { ZWG: { name: 'ZiG', symbol: 'ZiG' } }, flag: '🇿🇼', idd: { root: '+2', suffixes: ['63'] } }])],
    ['nager.at', () => J([{ date: '2026-01-01', localName: "New Year's Day", name: "New Year's Day" }])],
    ['open-notify.org', () => J({ iss_position: { latitude: '1.0000', longitude: '2.0000' } })],
    ['earthquake.usgs.gov', () => J({ features: [{ properties: { mag: 5.1, place: 'Somewhere' } }] })],
    ['open.er-api.com', () => J({ rates: { ZAR: 18.5, USD: 1 } })],
    ['coingecko.com', () => J({ bitcoin: { usd: 90000, usd_24h_change: 1.23 } })],
    ['agify.io', () => J({ name: 'tendai', age: 30, count: 1000 })],
    ['nationalize.io', () => J({ name: 'tendai', country: [{ country_id: 'ZW', probability: 0.6 }] })],
    ['chucknorris.io', () => J({ value: 'Chuck joke' })], ['kanye.rest', () => J({ quote: 'quote' })], ['zenquotes.io', () => J([{ q: 'q', a: 'a' }])], ['catfact.ninja', () => J({ fact: 'cats purr' })],
    ['numbersapi.com', () => T('42 is the answer.')],
    ['official-joke-api', () => J({ setup: 'Why?', punchline: 'Because.' })],
    ['thecocktaildb.com', () => J({ drinks: [{ strDrink: 'Margarita', strCategory: 'Cocktail', strAlcoholic: 'Alcoholic', strIngredient1: 'Tequila', strMeasure1: '2 oz', strInstructions: 'Shake.' }] })],
    ['themealdb.com', () => J({ meals: [meal] })],
    ['pokeapi.co', () => J({ name: 'pikachu', id: 25, types: [{ type: { name: 'electric' } }], height: 4, weight: 60, abilities: [{ ability: { name: 'static' } }], stats: [{ stat: { name: 'hp' }, base_stat: 35 }], sprites: { other: { 'official-artwork': { front_default: 'https://img.test/p.png' } } } })],
    ['openlibrary.org', () => J({ docs: [{ title: 'Things Fall Apart', author_name: ['Chinua Achebe'], first_publish_year: 1958, number_of_pages_median: 200 }] })],
    ['tvmaze.com', () => J({ name: 'Show', genres: ['Drama'], status: 'Ended', premiered: '2008', rating: { average: 9 }, network: { name: 'AMC' }, summary: '<p>Great show.</p>' })],
    ['jikan.moe', () => J({ data: [{ title: 'Naruto', type: 'TV', episodes: 220, status: 'Finished', score: 8, year: 2002, genres: [{ name: 'Action' }], synopsis: 'Ninja.' }] })],
    ['itunes.apple.com', () => J({ results: [{ trackName: 't', artistName: 'a', collectionName: 'c', releaseDate: '2020-01-01' }] })],
    ['wikipedia.org', () => J({ title: 'Zimbabwe', extract: 'A country.', type: 'standard', content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Zimbabwe' } } })],
    ['hacker-news.firebaseio.com/v0/topstories', () => J([1, 2, 3, 4, 5, 6])],
    ['hacker-news.firebaseio.com/v0/item', () => J({ title: 'HN title', score: 10, url: 'https://x.test', id: 1 })],
    ['api.github.com', () => J({ login: 'octocat', name: 'Octo', bio: 'cat', public_repos: 8, followers: 10, following: 2, created_at: '2011-01-25T18:44:36Z', html_url: 'https://github.com/octocat', blog: '' })],
    ['opentdb.com', () => J({ results: [{ category: 'Science', difficulty: 'easy', question: 'What is H2O?', correct_answer: 'Water', incorrect_answers: ['Salt', 'Gold', 'Air'] }] })],
    ['randomfox.ca', () => J({ image: 'https://img.test/fox.jpg' })], ['random-d.uk', () => J({ url: 'https://img.test/duck.jpg' })], ['dog.ceo', () => J({ message: 'https://img.test/dog.jpg', status: 'success' })],
    ['dns.google', () => J({ Answer: [{ data: '1.2.3.4', TTL: 300 }] })],
    ['rdap.org', () => J({ ldhName: 'EXAMPLE.COM', events: [{ eventAction: 'registration', eventDate: '1995-08-14T04:00:00Z' }], status: ['active'], nameservers: [{ ldhName: 'a.iana-servers.net' }] })],
    ['ipwho.is', () => J({ success: true, ip: '8.8.8.8', country: 'US', region: 'California', city: 'Mountain View', connection: { isp: 'Google LLC' }, timezone: { id: 'America/Los_Angeles' } })],
    ['example.com', (u, o) => /redirect/.test(u) ? T('', 301, { location: 'https://example.com/final' }) : T('<html><head><title>Example Domain</title><meta name="description" content="demo"></head></html>', 200, { 'content-type': 'text/html' })],
    ['bit.ly', () => T('', 301, { location: 'https://example.com/final' })]
];
let fetchMode = 'mock', fetchCalls = [];
global.fetch = async (url, opt) => {
    fetchCalls.push(String(url));
    if (fetchMode === 'down') throw Object.assign(new TypeError('fetch failed'), { cause: { code: 'ENOTFOUND' } });
    const r = ROUTES.find(([k]) => String(url).includes(k));
    if (!r) return T('not found', 404);
    const res = r[1](String(url), opt);
    return res;
};

// ───────── harness ─────────
function mk(argStr, over = {}) {
    const args = String(argStr).split(/\s+/).filter(Boolean); const out = [], sent = [];
    const ctx = { socket: { sendMessage: async (jid, content) => { sent.push(content); } }, from: '1203@g.us', msg: { message: {} }, q: args.join(' '), args, reply: async (t) => { out.push(String(t)); }, react: async () => { }, activePrefix: '.', nowsender: '263789846423@s.whatsapp.net', senderName: 'T', isGroup: true, isOwner: true, fakeCard: null, quotedText: '', ...over };
    return { ctx, out, sent };
}
const _err = console.error; console.error = () => { }; // silence expected [WK7] error logs during tests
let pass = 0, fail = 0; const failures = [];
const ok = (cond, msg) => { if (cond) pass++; else { fail++; failures.push(msg); } };
const names = WK7.names();

(async () => {
    // 1. coverage
    for (const n of names) ok(n in S, `NO SAMPLE for command: ${n}`);
    // pair-up check: aliases share the same entry
    // 2 + 3. valid input
    for (const n of names) {
        if (!(n in S)) continue; core.resetCooling(); fetchMode = 'mock';
        const { ctx, out, sent } = mk(S[n]);
        let threw = null; try { await WK7.run(n, ctx); } catch (e) { threw = e; }
        const text = out.join('\n');
        ok(!threw, `${n}: threw ${threw && threw.message}`);
        ok(out.length > 0 || sent.length > 0, `${n}: produced no output`);
        ok(!/^⚠️/.test(text), `${n}: returned an error → ${text.slice(0, 120)}`);
        ok(!/undefined|NaN|\[object Object\]/.test(text), `${n}: leaked undefined/NaN/[object] → ${text.slice(0, 160)}`);
        if (n in EXPECT) ok(text.includes(EXPECT[n]), `${n}: expected "${EXPECT[n]}" in → ${text.slice(0, 200)}`);
    }
    // 4. empty input never crashes
    for (const n of names) {
        core.resetCooling(); fetchMode = 'mock';
        const { ctx, out, sent } = mk('');
        let threw = null; try { await WK7.run(n, ctx); } catch (e) { threw = e; }
        ok(!threw, `${n} [empty]: threw ${threw && threw.message}`);
        ok(out.length > 0 || sent.length > 0, `${n} [empty]: no response`);
        ok(!/undefined|NaN|\[object Object\]/.test(out.join('\n')), `${n} [empty]: leaked undefined/NaN → ${out.join('|').slice(0, 120)}`);
    }
    // 5. network down: every online command must answer gracefully
    const netNames = [...WK7.categories().get('net').names]; fetchMode = 'down';
    for (const n of netNames) {
        if (['avatar', 'robot', 'qrmake', 'barcode'].includes(n)) continue;
        core.resetCooling(); const { ctx, out } = mk(S[n]);
        let threw = null; try { await WK7.run(n, ctx); } catch (e) { threw = e; }
        ok(!threw, `${n} [net down]: threw`);
        ok(out.length > 0 && !/undefined|NaN/.test(out.join('')), `${n} [net down]: no graceful message → ${out.join('|').slice(0, 120)}`);
    }
    // extra behaviours
    fetchMode = 'mock'; core.resetCooling();
    { const { ctx, out } = mk('127.0.0.1'); await WK7.run('isup', ctx); ok(/not allowed/.test(out.join('')), 'isup must block private hosts'); }
    { const { ctx, out } = mk('http://192.168.1.1/x'); await WK7.run('pagetitle', ctx); ok(/not allowed/.test(out.join('')), 'pagetitle must block private hosts'); }
    { const { ctx, out } = mk('math', {}); ctx.args = ['1/0']; ctx.q = '1/0'; await WK7.run('math', ctx); ok(/Division by zero/.test(out.join('')), 'math 1/0 must report division by zero'); }
    { const { ctx, out } = mk(''); ctx.q = 'process.exit(1)'; ctx.args = ['process.exit(1)']; await WK7.run('math', ctx); ok(/Unknown name|Unexpected/.test(out.join('')), 'math must reject code'); }
    { const { ctx, out } = mk('', { isOwner: false }); await WK7.run('apicheck', ctx); ok(/Owner-only/.test(out.join('')), 'apicheck must be owner-only'); }
    { const { ctx, out } = mk('', { quotedText: 'quoted words here' }); await WK7.run('upper', ctx); ok(/QUOTED WORDS HERE/.test(out.join('')), 'text tools must read quoted message'); }
    { core.resetCooling(); fetchMode = 'down'; fetchCalls = []; const a = mk('hello'); await WK7.run('define', a.ctx); const n1 = fetchCalls.length; const b = mk('hello'); await WK7.run('define', b.ctx); ok(fetchCalls.length === n1, 'circuit-breaker should skip a dead host for 2 minutes'); fetchMode = 'mock'; core.resetCooling(); }
    ok(WK7.has('upper') && !WK7.has('definitely-not-a-command'), 'has() works');
    { const r = await WK7.run('nope', mk('').ctx); ok(r === false, 'unknown command returns false'); }

    console.error = _err;
    console.log(`\nWK7 TEST RESULT: ${pass} checks passed, ${fail} failed — ${names.length} commands covered`);
    if (fail) { failures.slice(0, 80).forEach(f => console.log(' ✗ ' + f)); process.exit(1); }
    process.exit(0);
})();
