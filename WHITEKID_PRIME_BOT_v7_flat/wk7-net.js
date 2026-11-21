'use strict';
/*
 * WHITEKID PRIME v7 — live-data commands (free, key-less public APIs)
 * Every command tries multiple sources where one exists, validates the shape of the
 * response, and fails with a friendly message instead of crashing.
 */
const { def, category, pending, rnd, fmt, money, num, U, clip, decodeEntities, fx, tryApis } = require('./wk7-core');

category('net', '🌐', 'LIVE DATA (ONLINE)');

const enc = encodeURIComponent;
const need = (c, usage) => { if (!c.q) { c.reply(U(c.p, usage)); return false; } return true; };

// ───── language ─────
def('net', ['define', 'dictionary'], '<word>', async c => {
    if (!need(c, 'define serendipity')) return;
    const w = c.args[0].toLowerCase();
    const d = await tryApis([{ url: `https://api.dictionaryapi.dev/api/v2/entries/en/${enc(w)}`, pick: j => Array.isArray(j) && j[0] }]);
    const meanings = (d.meanings || []).slice(0, 3).map(m => { const df = m.definitions?.[0]; return `• (${m.partOfSpeech}) ${df?.definition || ''}${df?.example ? `\n   e.g. “${df.example}”` : ''}`; }).join('\n');
    await c.reply(`📖 ${d.word.toUpperCase()}${d.phonetic ? `  ${d.phonetic}` : ''}\n\n${meanings}`);
});
const datamuse = (rel, title, icon) => async c => {
    if (!need(c, `${title.toLowerCase()} happy`)) return;
    const list = await tryApis([{ url: `https://api.datamuse.com/words?${rel}=${enc(c.args[0])}&max=25`, pick: j => j.map(x => x.word) }]);
    await c.reply(`${icon} ${title.toUpperCase()} — ${c.args[0]}\n\n${list.join(', ')}`);
};
def('net', 'synonym', '<word>', datamuse('rel_syn', 'Synonyms', '🔁'));
def('net', 'antonym', '<word>', datamuse('rel_ant', 'Antonyms', '↔️'));
def('net', 'rhyme', '<word>', datamuse('rel_rhy', 'Rhymes', '🎵'));
def('net', 'urban', '<term>', async c => {
    if (!need(c, 'urban rizz')) return;
    const d = await tryApis([{ url: `https://api.urbandictionary.com/v0/define?term=${enc(c.q)}`, pick: j => j.list?.[0] }]);
    await c.reply(`🗣️ URBAN DICTIONARY — ${d.word}\n\n${clip(d.definition.replace(/[\[\]]/g, ''), 700)}\n\n💬 ${clip((d.example || '').replace(/[\[\]]/g, ''), 300)}\n\n👍 ${d.thumbs_up}  👎 ${d.thumbs_down}\n\n(Community-written — may contain adult language.)`);
});

// ───── places & weather ─────
async function geocode(name) {
    return tryApis([{ url: `https://geocoding-api.open-meteo.com/v1/search?name=${enc(name)}&count=1&language=en&format=json`, pick: j => j.results?.[0] }]);
}
const WMO = { 0: 'Clear sky ☀️', 1: 'Mainly clear 🌤️', 2: 'Partly cloudy ⛅', 3: 'Overcast ☁️', 45: 'Fog 🌫️', 48: 'Rime fog 🌫️', 51: 'Light drizzle 🌦️', 53: 'Drizzle 🌦️', 55: 'Heavy drizzle 🌧️', 61: 'Light rain 🌧️', 63: 'Rain 🌧️', 65: 'Heavy rain 🌧️', 71: 'Light snow 🌨️', 73: 'Snow 🌨️', 75: 'Heavy snow ❄️', 80: 'Rain showers 🌦️', 81: 'Rain showers 🌧️', 82: 'Violent showers ⛈️', 95: 'Thunderstorm ⛈️', 96: 'Thunderstorm + hail ⛈️', 99: 'Severe thunderstorm ⛈️' };
def('net', 'forecast', '<city>', async c => {
    if (!need(c, 'forecast Harare')) return;
    const g = await geocode(c.q);
    const w = await tryApis([{ url: `https://api.open-meteo.com/v1/forecast?latitude=${g.latitude}&longitude=${g.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=4`, pick: j => j.current && j.daily && j }]);
    const days = w.daily.time.map((t, i) => `${t.slice(5)}  ${WMO[w.daily.weather_code[i]] || '—'}  ${Math.round(w.daily.temperature_2m_min[i])}–${Math.round(w.daily.temperature_2m_max[i])}°C  ☔${w.daily.precipitation_probability_max[i] ?? 0}%`).join('\n');
    await c.reply(`🌦️ FORECAST — ${g.name}, ${g.country || ''}\n\nNow: ${Math.round(w.current.temperature_2m)}°C, ${WMO[w.current.weather_code] || ''}\nHumidity: ${w.current.relative_humidity_2m}%  Wind: ${w.current.wind_speed_10m} km/h\n\n${days}`);
});
def('net', 'airquality', '<city>', async c => {
    if (!need(c, 'airquality Harare')) return;
    const g = await geocode(c.q);
    const a = await tryApis([{ url: `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${g.latitude}&longitude=${g.longitude}&current=us_aqi,pm10,pm2_5`, pick: j => j.current }]);
    const aqi = a.us_aqi; const lvl = aqi == null ? 'n/a' : aqi <= 50 ? 'Good 🟢' : aqi <= 100 ? 'Moderate 🟡' : aqi <= 150 ? 'Unhealthy for sensitive groups 🟠' : aqi <= 200 ? 'Unhealthy 🔴' : 'Very unhealthy 🟣';
    await c.reply(`🌫️ AIR QUALITY — ${g.name}\n\nUS AQI: ${aqi ?? 'n/a'}  ${lvl}\nPM2.5: ${a.pm2_5} µg/m³\nPM10: ${a.pm10} µg/m³`);
});
def('net', 'sunrise', '<city>', async c => {
    if (!need(c, 'sunrise Harare')) return;
    const g = await geocode(c.q);
    const s = await tryApis([{ url: `https://api.open-meteo.com/v1/forecast?latitude=${g.latitude}&longitude=${g.longitude}&daily=sunrise,sunset&timezone=auto&forecast_days=1`, pick: j => j.daily?.sunrise?.[0] && j.daily }]);
    const t = x => x.split('T')[1];
    await c.reply(`🌅 SUN TIMES — ${g.name} (local time)\n\nSunrise: ${t(s.sunrise[0])}\nSunset: ${t(s.sunset[0])}`);
});
def('net', 'geocode', '<place>', async c => { if (!need(c, 'geocode Victoria Falls')) return; const g = await geocode(c.q); await c.reply(`📍 LOCATION\n\n${g.name}${g.admin1 ? ', ' + g.admin1 : ''}, ${g.country || ''}\nLat: ${g.latitude}\nLon: ${g.longitude}\nTimezone: ${g.timezone || 'n/a'}\nElevation: ${g.elevation ?? 'n/a'} m`); });
def('net', 'country', '<name>', async c => {
    if (!need(c, 'country zimbabwe')) return;
    const d = await tryApis([{ url: `https://restcountries.com/v3.1/name/${enc(c.q)}?fields=name,capital,region,subregion,population,area,languages,currencies,flag,timezones,idd`, pick: j => Array.isArray(j) && j[0] }]);
    const cur = Object.values(d.currencies || {}).map(x => `${x.name} (${x.symbol || ''})`).join(', ');
    await c.reply(`${d.flag || '🌍'} ${d.name.common.toUpperCase()}\n\nOfficial: ${d.name.official}\nCapital: ${(d.capital || []).join(', ') || 'n/a'}\nRegion: ${d.region}${d.subregion ? ' / ' + d.subregion : ''}\nPopulation: ${fmt(d.population)}\nArea: ${fmt(d.area)} km²\nLanguages: ${Object.values(d.languages || {}).join(', ')}\nCurrency: ${cur}\nDial: ${d.idd?.root || ''}${(d.idd?.suffixes || [])[0] || ''}`);
});
def('net', 'holidays', '<country code> [year]', async c => {
    const cc = (c.args[0] || '').toUpperCase(); const y = parseInt(c.args[1], 10) || new Date().getFullYear(); if (!/^[A-Z]{2}$/.test(cc)) return c.reply(U(c.p, 'holidays ZA 2026   (2-letter country code)'));
    const h = await tryApis([{ url: `https://date.nager.at/api/v3/PublicHolidays/${y}/${cc}`, pick: j => Array.isArray(j) && j.length && j }]);
    await c.reply(`🎉 PUBLIC HOLIDAYS ${cc} ${y}\n\n${h.map(x => `${x.date}  ${x.localName}${x.localName !== x.name ? ` (${x.name})` : ''}`).join('\n')}`);
});
def('net', 'iss', '', async c => { const d = await tryApis([{ url: 'https://api.open-notify.org/iss-now.json', pick: j => j.iss_position }, { url: 'https://api.wheretheiss.at/v1/satellites/25544', pick: j => j.latitude != null && { latitude: j.latitude, longitude: j.longitude } }]); await c.reply(`🛰️ ISS RIGHT NOW\n\nLatitude: ${(+d.latitude).toFixed(3)}\nLongitude: ${(+d.longitude).toFixed(3)}\n\nhttps://maps.google.com/?q=${d.latitude},${d.longitude}`); });
def('net', 'earthquakes', '', async c => {
    const q = await tryApis([{ url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson', pick: j => j.features }]);
    await c.reply(`🌍 EARTHQUAKES M4.5+ (last 24h)\n\n${q.slice(0, 8).map(f => `M${f.properties.mag}  ${f.properties.place}`).join('\n')}\n\nTotal: ${q.length}`);
});

// ───── money ─────
def('net', ['fx', 'currency'], '<amount> <FROM> <TO>', async c => {
    const a = num(c.args[0]), f = (c.args[1] || '').toUpperCase(), t = (c.args[2] || '').toUpperCase(); if (isNaN(a) || !/^[A-Z]{3}$/.test(f) || !/^[A-Z]{3}$/.test(t)) return c.reply(U(c.p, 'fx 100 USD ZAR'));
    const rate = await tryApis([{ url: `https://open.er-api.com/v6/latest/${f}`, pick: j => j.rates?.[t] }, { url: `https://api.frankfurter.app/latest?from=${f}&to=${t}`, pick: j => j.rates?.[t] }]);
    await c.reply(`💱 CURRENCY\n\n${fmt(a)} ${f} = ${money(a * rate)} ${t}\n\nRate: 1 ${f} = ${fmt(rate, 6)} ${t}\n(Mid-market rate — banks and bureaux add a spread.)`);
});
def('net', 'cryptoprice', '<bitcoin|ethereum|…> [usd|zar|eur]', async c => {
    const id = (c.args[0] || '').toLowerCase(), cur = (c.args[1] || 'usd').toLowerCase(); if (!id) return c.reply(U(c.p, 'cryptoprice bitcoin zar'));
    const p = await tryApis([{ url: `https://api.coingecko.com/api/v3/simple/price?ids=${enc(id)}&vs_currencies=${enc(cur)}&include_24hr_change=true`, pick: j => j[id] && j[id][cur] != null && j[id] }]);
    const ch = p[cur + '_24h_change']; await c.reply(`🪙 ${id.toUpperCase()}\n\nPrice: ${money(p[cur])} ${cur.toUpperCase()}\n24h: ${ch == null ? 'n/a' : (ch >= 0 ? '▲ ' : '▼ ') + Math.abs(ch).toFixed(2) + '%'}`);
});

// ───── people & fun ─────
def('net', 'agify', '<first name>', async c => { if (!need(c, 'agify Tendai')) return; const d = await tryApis([{ url: `https://api.agify.io/?name=${enc(c.args[0])}`, pick: j => j.age != null && j }]); await c.reply(`🎂 AGE GUESS\n\n${d.name}: ~${d.age} years old\n(Based on ${fmt(d.count)} records — statistical guess, just for fun.)`); });
def('net', 'nationalize', '<first name>', async c => { if (!need(c, 'nationalize Tendai')) return; const d = await tryApis([{ url: `https://api.nationalize.io/?name=${enc(c.args[0])}`, pick: j => j.country?.length && j }]); await c.reply(`🌍 NAME ORIGIN GUESS\n\n${d.name}\n${d.country.slice(0, 4).map(x => `${x.country_id}: ${(x.probability * 100).toFixed(0)}%`).join('\n')}\n\n(Statistical guess — just for fun.)`); });
def('net', 'chuck', '', async c => { const j = await tryApis([{ url: 'https://api.chucknorris.io/jokes/random', pick: j => j.value }]); await c.reply(`🥋 CHUCK NORRIS\n\n${j}`); });
def('net', 'kanye', '', async c => { const j = await tryApis([{ url: 'https://api.kanye.rest/', pick: j => j.quote }]); await c.reply(`🎤 KANYE SAYS\n\n“${j}”`); });
def('net', 'zenquote', '', async c => { const j = await tryApis([{ url: 'https://zenquotes.io/api/random', pick: j => j[0]?.q && j[0] }]); await c.reply(`🧘 QUOTE\n\n“${j.q}”\n— ${j.a}`); });
def('net', 'catfact', '', async c => { const j = await tryApis([{ url: 'https://catfact.ninja/fact', pick: j => j.fact }]); await c.reply(`🐱 CAT FACT\n\n${j}`); });
def('net', 'numberfact', '[number]', async c => { const n = /^-?\d+$/.test(c.args[0] || '') ? c.args[0] : 'random'; const t = await tryApis([{ url: `http://numbersapi.com/${n}/trivia`, text: true, pick: x => x }]); await c.reply(`🔢 NUMBER FACT\n\n${t}`); });
def('net', 'joke2', '', async c => { const j = await tryApis([{ url: 'https://official-joke-api.appspot.com/random_joke', pick: j => j.setup && j }, { url: 'https://v2.jokeapi.dev/joke/Programming,Misc,Pun?safe-mode&type=twopart', pick: j => j.setup && { setup: j.setup, punchline: j.delivery } }]); await c.reply(`😂 JOKE\n\n${j.setup}\n\n${j.punchline}`); });
def('net', 'cocktail', '<name>', async c => {
    if (!need(c, 'cocktail margarita')) return;
    const d = await tryApis([{ url: `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${enc(c.q)}`, pick: j => j.drinks?.[0] }]);
    const ing = []; for (let i = 1; i <= 15; i++) if (d['strIngredient' + i]) ing.push(`${d['strMeasure' + i] || ''} ${d['strIngredient' + i]}`.trim());
    await c.reply(`🍹 ${d.strDrink.toUpperCase()}\n\n${d.strCategory} • ${d.strAlcoholic}\n\nIngredients:\n${ing.map(x => '• ' + x).join('\n')}\n\n${clip(d.strInstructions || '', 700)}`);
});
const mealText = d => { const ing = []; for (let i = 1; i <= 20; i++) if (d['strIngredient' + i]?.trim()) ing.push(`${d['strMeasure' + i] || ''} ${d['strIngredient' + i]}`.trim()); return `🍲 ${d.strMeal.toUpperCase()}\n\n${d.strArea} • ${d.strCategory}\n\nIngredients:\n${ing.map(x => '• ' + x).join('\n')}\n\n${clip(d.strInstructions || '', 900)}${d.strYoutube ? '\n\n▶️ ' + d.strYoutube : ''}`; };
def('net', 'meal', '<dish name>', async c => { if (!need(c, 'meal pasta')) return; const d = await tryApis([{ url: `https://www.themealdb.com/api/json/v1/1/search.php?s=${enc(c.q)}`, pick: j => j.meals?.[0] }]); await c.reply(mealText(d)); });
def('net', 'randommeal', '', async c => { const d = await tryApis([{ url: 'https://www.themealdb.com/api/json/v1/1/random.php', pick: j => j.meals?.[0] }]); await c.reply(mealText(d)); });
def('net', 'pokemon', '<name or number>', async c => {
    if (!need(c, 'pokemon pikachu')) return;
    const d = await tryApis([{ url: `https://pokeapi.co/api/v2/pokemon/${enc(c.args[0].toLowerCase())}`, pick: j => j.name && j }]);
    const st = d.stats.map(s => `${s.stat.name}: ${s.base_stat}`).join('\n');
    const img = d.sprites?.other?.['official-artwork']?.front_default || d.sprites?.front_default;
    const cap = `🎮 ${d.name.toUpperCase()} #${d.id}\n\nTypes: ${d.types.map(t => t.type.name).join(', ')}\nHeight: ${d.height / 10} m   Weight: ${d.weight / 10} kg\nAbilities: ${d.abilities.map(a => a.ability.name).join(', ')}\n\n${st}`;
    if (img) { try { return await c.sendImage(img, cap); } catch { /* fall back to text */ } }
    await c.reply(cap);
});

// ───── media & knowledge ─────
def('net', 'book', '<title or author>', async c => {
    if (!need(c, 'book things fall apart')) return;
    const b = await tryApis([{ url: `https://openlibrary.org/search.json?q=${enc(c.q)}&limit=5&fields=title,author_name,first_publish_year,number_of_pages_median,subject`, pick: j => j.docs?.length && j.docs }]);
    await c.reply(`📚 BOOKS — ${c.q}\n\n${b.slice(0, 5).map((x, i) => `${i + 1}. ${x.title}\n   ${(x.author_name || ['Unknown']).slice(0, 2).join(', ')}${x.first_publish_year ? ' • ' + x.first_publish_year : ''}${x.number_of_pages_median ? ' • ~' + x.number_of_pages_median + ' pages' : ''}`).join('\n')}`);
});
def('net', 'tvshow', '<show name>', async c => {
    if (!need(c, 'tvshow breaking bad')) return;
    const s = await tryApis([{ url: `https://api.tvmaze.com/singlesearch/shows?q=${enc(c.q)}`, pick: j => j.name && j }]);
    await c.reply(`📺 ${s.name.toUpperCase()}\n\nGenres: ${(s.genres || []).join(', ') || 'n/a'}\nStatus: ${s.status}\nPremiered: ${s.premiered || 'n/a'}\nRating: ${s.rating?.average ?? 'n/a'}/10\nNetwork: ${s.network?.name || s.webChannel?.name || 'n/a'}\n\n${clip((s.summary || '').replace(/<[^>]+>/g, ''), 600)}`);
});
def('net', 'animeinfo', '<anime name>', async c => {
    if (!need(c, 'animeinfo naruto')) return;
    const a = await tryApis([{ url: `https://api.jikan.moe/v4/anime?q=${enc(c.q)}&limit=1&sfw=true`, pick: j => j.data?.[0] }]);
    await c.reply(`🎌 ${a.title.toUpperCase()}\n\nType: ${a.type}  Episodes: ${a.episodes ?? '?'}\nStatus: ${a.status}\nScore: ${a.score ?? 'n/a'}\nYear: ${a.year ?? 'n/a'}\nGenres: ${(a.genres || []).map(g => g.name).join(', ')}\n\n${clip(a.synopsis || '', 600)}`);
});
def('net', 'musicsearch', '<song or artist>', async c => {
    if (!need(c, 'musicsearch burna boy')) return;
    const r = await tryApis([{ url: `https://itunes.apple.com/search?term=${enc(c.q)}&media=music&limit=5`, pick: j => j.results?.length && j.results }]);
    await c.reply(`🎵 MUSIC — ${c.q}\n\n${r.map((x, i) => `${i + 1}. ${x.trackName}\n   ${x.artistName} • ${x.collectionName || ''}${x.releaseDate ? ' • ' + x.releaseDate.slice(0, 4) : ''}`).join('\n')}`);
});
def('net', 'wikisummary', '<topic>', async c => {
    if (!need(c, 'wikisummary Great Zimbabwe')) return;
    const d = await tryApis([{ url: `https://en.wikipedia.org/api/rest_v1/page/summary/${enc(c.q.replace(/\s+/g, '_'))}`, pick: j => j.extract && j.type !== 'disambiguation' && j }]);
    await c.reply(`📖 ${d.title.toUpperCase()}\n\n${clip(d.extract, 1200)}\n\n🔗 ${d.content_urls?.desktop?.page || ''}`);
});
def('net', 'hackernews', '', async c => {
    const ids = await tryApis([{ url: 'https://hacker-news.firebaseio.com/v0/topstories.json', pick: j => j.slice(0, 5) }]);
    const items = await Promise.all(ids.map(id => tryApis([{ url: `https://hacker-news.firebaseio.com/v0/item/${id}.json`, pick: j => j.title && j }]).catch(() => null)));
    await c.reply(`🟧 HACKER NEWS — TOP 5\n\n${items.filter(Boolean).map((x, i) => `${i + 1}. ${x.title}\n   ▲${x.score}  ${x.url || 'https://news.ycombinator.com/item?id=' + x.id}`).join('\n\n')}`);
});
def('net', 'ghuser', '<github username>', async c => {
    if (!need(c, 'ghuser torvalds')) return;
    const u = await tryApis([{ url: `https://api.github.com/users/${enc(c.args[0])}`, pick: j => j.login && j, headers: { accept: 'application/vnd.github+json' } }]);
    await c.reply(`🐙 GITHUB — ${u.login}\n\nName: ${u.name || 'n/a'}\nBio: ${u.bio || 'n/a'}\nRepos: ${u.public_repos}  Followers: ${u.followers}  Following: ${u.following}\nJoined: ${(u.created_at || '').slice(0, 10)}\n${u.blog ? 'Site: ' + u.blog + '\n' : ''}🔗 ${u.html_url}`);
});
def('net', 'trivia2', '', async c => {
    const q = await tryApis([{ url: 'https://opentdb.com/api.php?amount=1&type=multiple', pick: j => j.results?.[0] }]);
    const all = rnd.shuffle([q.correct_answer, ...q.incorrect_answers]).map(decodeEntities); const letter = 'ABCD'[all.indexOf(decodeEntities(q.correct_answer))];
    pending.set(c.from, `${letter}) ${decodeEntities(q.correct_answer)}`);
    await c.reply(`🧠 TRIVIA (${decodeEntities(q.category)} • ${q.difficulty})\n\n${decodeEntities(q.question)}\n\n${all.map((a, i) => `${'ABCD'[i]}) ${a}`).join('\n')}\n\nReveal with ${c.p}reveal`);
});

// ───── pictures ─────
const randomPic = (name, emoji, urls, label) => def('net', name, '', async c => {
    const url = await tryApis(urls); await c.sendImage(url, `${emoji} ${label}`);
});
randomPic('foxpic', '🦊', [{ url: 'https://randomfox.ca/floof/', pick: j => j.image }], 'Random fox');
randomPic('duckpic', '🦆', [{ url: 'https://random-d.uk/api/v2/random', pick: j => j.url }], 'Random duck');
randomPic('dogpic', '🐶', [{ url: 'https://dog.ceo/api/breeds/image/random', pick: j => j.message }], 'Random dog');
def('net', 'avatar', '[seed text]', async c => { const seed = enc(c.q || String(Date.now())); await c.sendImage(`https://api.dicebear.com/9.x/adventurer/png?seed=${seed}&size=512`, `🧑‍🎨 Avatar for “${c.q || 'random'}”`); });
def('net', 'robot', '[seed text]', async c => { const seed = enc(c.q || String(Date.now())); await c.sendImage(`https://robohash.org/${seed}.png?size=400x400`, `🤖 Robot for “${c.q || 'random'}”`); });
def('net', 'qrmake', '<text or link>', async c => { if (!need(c, 'qrmake https://example.com')) return; await c.sendImage(`https://api.qrserver.com/v1/create-qr-code/?size=512x512&margin=10&data=${enc(c.q)}`, '🔳 QR code'); });
def('net', 'barcode', '<digits/text>', async c => { if (!need(c, 'barcode 123456789012')) return; await c.sendImage(`https://bwipjs-api.metafloor.com/?bcid=code128&text=${enc(c.q)}&scale=3&includetext`, '▮▯ Code-128 barcode'); });

// ───── web / network tools ─────
const asUrl = s => { s = String(s || '').trim(); if (!s) return null; if (!/^https?:\/\//i.test(s)) s = 'https://' + s; try { const u = new URL(s); return /^[a-z0-9.-]+$/i.test(u.hostname) ? u : null; } catch { return null; } };
const isPrivateHost = h => /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|::1)/i.test(h) || h.endsWith('.local') || h.endsWith('.internal');
def('net', 'isup', '<website>', async c => {
    const u = asUrl(c.args[0]); if (!u) return c.reply(U(c.p, 'isup google.com')); if (isPrivateHost(u.hostname)) throw new Error('Private/internal addresses are not allowed.');
    const t0 = Date.now(); let res;
    try { res = await fx(u.href, { timeout: 10000, method: 'GET', headers: { range: 'bytes=0-0' } }); } catch (e) { return c.reply(`🔴 ISUP\n\n${u.hostname} looks DOWN or unreachable from the bot (${e.name === 'AbortError' ? 'timed out' : 'connection failed'}).`); }
    await c.reply(`${res.status < 500 ? '🟢' : '🔴'} ISUP\n\n${u.hostname}\nStatus: ${res.status} ${res.statusText || ''}\nResponse: ${Date.now() - t0} ms`);
});
def('net', 'pagetitle', '<url>', async c => {
    const u = asUrl(c.args[0]); if (!u) return c.reply(U(c.p, 'pagetitle example.com')); if (isPrivateHost(u.hostname)) throw new Error('Private/internal addresses are not allowed.');
    const res = await fx(u.href, { timeout: 12000, headers: { accept: 'text/html' } }); const html = (await res.text()).slice(0, 300000);
    const g = re => (html.match(re) || [])[1]; const title = decodeEntities(g(/<title[^>]*>([\s\S]*?)<\/title>/i) || 'n/a').trim().replace(/\s+/g, ' ');
    const desc = decodeEntities(g(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) || g(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i) || '');
    await c.reply(`🔖 PAGE INFO\n\nURL: ${res.url}\nStatus: ${res.status}\nTitle: ${clip(title, 200)}\n${desc ? 'Description: ' + clip(desc, 300) : ''}`);
});
def('net', 'expandurl', '<short link>', async c => {
    const u = asUrl(c.args[0]); if (!u) return c.reply(U(c.p, 'expandurl bit.ly/xyz')); if (isPrivateHost(u.hostname)) throw new Error('Private/internal addresses are not allowed.');
    const hops = []; let cur = u.href;
    for (let i = 0; i < 8; i++) {
        const res = await fx(cur, { timeout: 10000, redirect: 'manual', method: 'GET', headers: { range: 'bytes=0-0' } }); const loc = res.headers.get('location');
        if (res.status >= 300 && res.status < 400 && loc) { cur = new URL(loc, cur).href; if (isPrivateHost(new URL(cur).hostname)) throw new Error('Redirect points to a private address — stopped.'); hops.push(cur); } else break;
    }
    await c.reply(`🔗 EXPANDED LINK\n\nFinal: ${cur}\nRedirects followed: ${hops.length}\n\n⚠️ Only open links you trust.`);
});
def('net', 'dnslookup', '<domain> [A|AAAA|MX|TXT|NS|CNAME]', async c => {
    const d = (c.args[0] || '').replace(/^https?:\/\//i, '').split('/')[0].toLowerCase(); const t = (c.args[1] || 'A').toUpperCase();
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(d) || !['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME'].includes(t)) return c.reply(U(c.p, 'dnslookup example.com MX'));
    const r = await tryApis([{ url: `https://dns.google/resolve?name=${enc(d)}&type=${t}`, pick: j => j.Answer?.length && j.Answer }, { url: `https://cloudflare-dns.com/dns-query?name=${enc(d)}&type=${t}`, headers: { accept: 'application/dns-json' }, pick: j => j.Answer?.length && j.Answer }]);
    await c.reply(`🌐 DNS ${t} — ${d}\n\n${r.slice(0, 10).map(a => `${a.data}  (TTL ${a.TTL})`).join('\n')}`);
});
def('net', 'domaininfo', '<domain>', async c => {
    const d = (c.args[0] || '').replace(/^https?:\/\//i, '').split('/')[0].toLowerCase(); if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(d)) return c.reply(U(c.p, 'domaininfo example.com'));
    const r = await tryApis([{ url: `https://rdap.org/domain/${enc(d)}`, pick: j => j.ldhName && j }]);
    const ev = a => (r.events || []).find(e => e.eventAction === a)?.eventDate?.slice(0, 10) || 'n/a';
    await c.reply(`🌐 DOMAIN — ${r.ldhName}\n\nRegistered: ${ev('registration')}\nExpires: ${ev('expiration')}\nLast changed: ${ev('last changed')}\nStatus: ${(r.status || []).join(', ') || 'n/a'}\nNameservers: ${(r.nameservers || []).map(n => n.ldhName).slice(0, 4).join(', ') || 'n/a'}`);
});
def('net', 'ipwho', '[ip]', async c => {
    const ip = c.args[0] || ''; if (ip && !/^[0-9a-f:.]+$/i.test(ip)) return c.reply(U(c.p, 'ipwho 8.8.8.8'));
    const d = await tryApis([{ url: `https://ipwho.is/${enc(ip)}`, pick: j => j.success !== false && j.ip && j }, { url: `https://ipapi.co/${enc(ip)}/json/`, pick: j => j.ip && !j.error && { ip: j.ip, country: j.country_name, region: j.region, city: j.city, connection: { isp: j.org }, timezone: { id: j.timezone } } }]);
    await c.reply(`📍 IP INFO\n\nIP: ${d.ip}\nCountry: ${d.country || 'n/a'}\nRegion: ${d.region || 'n/a'}\nCity: ${d.city || 'n/a'}\nISP: ${d.connection?.isp || 'n/a'}\nTimezone: ${d.timezone?.id || 'n/a'}\n\n(Approximate — IP lookups are never exact.)`);
});

module.exports = {};
