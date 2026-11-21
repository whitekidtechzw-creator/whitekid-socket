'use strict';
const { def, category, rnd, fmt, num, U } = require('./wk7-core');

category('time', '📅', 'DATE & TIME');
category('info', '📚', 'KNOWLEDGE (OFFLINE)');

// ───── date helpers ─────
const DAY = 86400000;
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function parseDate(s) {
    s = String(s || '').trim().toLowerCase(); let m;
    if (s === 'today' || s === 'now') { const n = new Date(); return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())); }
    const mk = (y, mo, d) => { const dt = new Date(Date.UTC(y, mo - 1, d)); return (dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d) ? dt : null; };
    if ((m = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/))) return mk(+m[1], +m[2], +m[3]);
    if ((m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/))) return mk(+m[3], +m[2], +m[1]);
    return null;
}
const ymd = d => d.toISOString().slice(0, 10);
const nice = d => `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
const isLeap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const dayOfYear = d => Math.round((d - Date.UTC(d.getUTCFullYear(), 0, 0)) / DAY);
function isoWeek(d) { const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); const dn = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - dn); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y0) / DAY + 1) / 7); }
const needDate = (c, i = 0) => { const d = parseDate(c.args[i]); if (!d) throw new Error('Use a date like 2026-12-25 or 25/12/2026 (or "today").'); return d; };
const DATE_HELP = 'Dates: YYYY-MM-DD or DD/MM/YYYY';

def('time', 'countdown', '<date> [label]', async c => {
    if (!c.args[0]) return c.reply(U(c.p, 'countdown 2026-12-25 Christmas\n' + DATE_HELP));
    const d = needDate(c), t = parseDate('today'), diff = Math.round((d - t) / DAY), label = c.args.slice(1).join(' ') || ymd(d);
    await c.reply(`⏳ COUNTDOWN\n\n${label}\n${nice(d)}\n\n${diff > 0 ? `${diff} day(s) to go (${Math.floor(diff / 7)}w ${diff % 7}d)` : diff === 0 ? '🎉 It is TODAY!' : `Passed ${-diff} day(s) ago`}`);
});
def('time', 'dayofweek', '<date>', async c => { if (!c.args[0]) return c.reply(U(c.p, 'dayofweek 2000-01-01')); const d = needDate(c); await c.reply(`📅 DAY OF WEEK\n\n${nice(d)}`); });
def('time', 'datediff', '<date1> <date2>', async c => {
    if (!c.args[1]) return c.reply(U(c.p, 'datediff 2026-01-01 2026-12-31'));
    const a = needDate(c, 0), b = needDate(c, 1), days = Math.abs(Math.round((b - a) / DAY));
    const [x, y] = a <= b ? [a, b] : [b, a]; let yrs = y.getUTCFullYear() - x.getUTCFullYear(), mos = y.getUTCMonth() - x.getUTCMonth(), ds = y.getUTCDate() - x.getUTCDate();
    if (ds < 0) { mos--; ds += new Date(Date.UTC(y.getUTCFullYear(), y.getUTCMonth(), 0)).getUTCDate(); } if (mos < 0) { yrs--; mos += 12; }
    await c.reply(`📆 DATE DIFFERENCE\n\n${ymd(a)} ↔ ${ymd(b)}\n\nTotal: ${fmt(days)} days (${fmt(days / 7, 1)} weeks)\nBreakdown: ${yrs}y ${mos}m ${ds}d`);
});
def('time', 'addays', '<date> <days (negative ok)>', async c => { const n = num(c.args[1]); if (!c.args[0] || !Number.isInteger(n) || Math.abs(n) > 365000) return c.reply(U(c.p, 'addays 2026-01-31 45')); const d = needDate(c); await c.reply(`📅 DATE MATH\n\n${ymd(d)} ${n >= 0 ? '+' : '−'} ${Math.abs(n)} days\n= ${nice(new Date(d.getTime() + n * DAY))}`); });
def('time', 'leapyear', '<year>', async c => { const y = parseInt(c.args[0], 10); if (!(y > 0 && y < 100000)) return c.reply(U(c.p, 'leapyear 2028')); await c.reply(`📅 LEAP YEAR\n\n${y} ${isLeap(y) ? 'IS ✅' : 'is NOT ❌'} a leap year (${isLeap(y) ? 366 : 365} days)`); });
def('time', 'weeknumber', '[date]', async c => { const d = c.args[0] ? needDate(c) : parseDate('today'); await c.reply(`📅 WEEK NUMBER\n\n${nice(d)}\nISO week: ${isoWeek(d)}\nDay of year: ${dayOfYear(d)}`); });
def('time', 'dayofyear', '[date]', async c => { const d = c.args[0] ? needDate(c) : parseDate('today'); const n = dayOfYear(d), tot = isLeap(d.getUTCFullYear()) ? 366 : 365; await c.reply(`📅 DAY OF YEAR\n\n${nice(d)}\nDay ${n} of ${tot}\n${tot - n} day(s) left this year`); });
def('time', 'unixtime', '[unix seconds | date]', async c => {
    const a = c.args[0]; let d;
    if (!a) d = new Date(); else if (/^\d{9,13}$/.test(a)) d = new Date(a.length > 11 ? +a : +a * 1000); else { d = parseDate(a); if (!d) return c.reply(U(c.p, 'unixtime 1700000000   or   unixtime 2026-01-01')); }
    await c.reply(`🕐 UNIX TIME\n\nUnix: ${Math.floor(d.getTime() / 1000)}\nMillis: ${d.getTime()}\nUTC: ${d.toISOString().replace('T', ' ').slice(0, 19)}`);
});
def('time', 'nextbirthday', '<birth date>', async c => {
    if (!c.args[0]) return c.reply(U(c.p, 'nextbirthday 2001-08-14')); const b = needDate(c), t = parseDate('today'); let y = t.getUTCFullYear();
    const at = yr => new Date(Date.UTC(yr, b.getUTCMonth(), (b.getUTCMonth() === 1 && b.getUTCDate() === 29 && !isLeap(yr)) ? 28 : b.getUTCDate()));
    let n = at(y); if (n < t) n = at(++y); const age = y - b.getUTCFullYear(), left = Math.round((n - t) / DAY);
    await c.reply(`🎂 NEXT BIRTHDAY\n\n${nice(n)}\nTurning ${age}\n${left === 0 ? '🎉 It is TODAY — happy birthday!' : left + ' day(s) to go'}`);
});
def('time', 'calendar', '[month] [year]  e.g. calendar 12 2026', async c => {
    const now = new Date(); let m = c.args[0] ? parseInt(c.args[0], 10) : now.getUTCMonth() + 1, y = c.args[1] ? parseInt(c.args[1], 10) : now.getUTCFullYear();
    if (!(m >= 1 && m <= 12) || !(y >= 1 && y <= 9999)) return c.reply(U(c.p, 'calendar 12 2026'));
    const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay(), dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
    let out = `${MONTHS[m - 1]} ${y}\n\nSu Mo Tu We Th Fr Sa\n` + '   '.repeat(first);
    for (let d = 1; d <= dim; d++) { out += String(d).padStart(2, ' ') + ((first + d) % 7 === 0 ? '\n' : ' '); }
    await c.reply('🗓️ CALENDAR\n\n```' + out.trimEnd() + '```');
});
const TZ = { harare: 'Africa/Harare', zimbabwe: 'Africa/Harare', johannesburg: 'Africa/Johannesburg', capetown: 'Africa/Johannesburg', lusaka: 'Africa/Lusaka', maputo: 'Africa/Maputo', nairobi: 'Africa/Nairobi', lagos: 'Africa/Lagos', accra: 'Africa/Accra', cairo: 'Africa/Cairo', london: 'Europe/London', paris: 'Europe/Paris', berlin: 'Europe/Berlin', moscow: 'Europe/Moscow', dubai: 'Asia/Dubai', mumbai: 'Asia/Kolkata', delhi: 'Asia/Kolkata', beijing: 'Asia/Shanghai', shanghai: 'Asia/Shanghai', tokyo: 'Asia/Tokyo', seoul: 'Asia/Seoul', sydney: 'Australia/Sydney', newyork: 'America/New_York', chicago: 'America/Chicago', denver: 'America/Denver', losangeles: 'America/Los_Angeles', toronto: 'America/Toronto', saopaulo: 'America/Sao_Paulo', utc: 'UTC' };
def('time', 'timein', '<city or Area/Zone>', async c => {
    if (!c.q) return c.reply(U(c.p, 'timein tokyo   |   timein Africa/Harare\n\nCities: ' + Object.keys(TZ).join(', ')));
    const key = c.q.toLowerCase().replace(/[\s_-]+/g, ''); const zone = TZ[key] || c.q.trim();
    let f; try { f = new Intl.DateTimeFormat('en-GB', { timeZone: zone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZoneName: 'short' }); } catch { throw new Error('Unknown timezone. Try a city like "tokyo" or a zone like Africa/Harare.'); }
    await c.reply(`🌍 TIME IN ${zone.toUpperCase()}\n\n${f.format(new Date())}`);
});
def('time', 'moonphase', '[date]', async c => {
    const d = c.args[0] ? needDate(c) : new Date(); const SYN = 29.530588853; const days = ((d.getTime() - Date.UTC(2000, 0, 6, 18, 14)) / DAY % SYN + SYN) % SYN;
    const names = [['🌑', 'New Moon'], ['🌒', 'Waxing Crescent'], ['🌓', 'First Quarter'], ['🌔', 'Waxing Gibbous'], ['🌕', 'Full Moon'], ['🌖', 'Waning Gibbous'], ['🌗', 'Last Quarter'], ['🌘', 'Waning Crescent']];
    const [icon, name] = names[Math.floor((days / SYN * 8 + 0.5)) % 8]; const illum = (1 - Math.cos(2 * Math.PI * days / SYN)) / 2 * 100;
    await c.reply(`${icon} MOON PHASE\n\n${ymd(d)}\nPhase: ${name}\nIllumination: ~${illum.toFixed(0)}%\nMoon age: ${days.toFixed(1)} days`);
});
def('time', 'chinesezodiac', '<year>', async c => { const y = parseInt(c.args[0], 10); if (!(y > 1000 && y < 3000)) return c.reply(U(c.p, 'chinesezodiac 1999')); const A = [['🐀', 'Rat'], ['🐂', 'Ox'], ['🐅', 'Tiger'], ['🐇', 'Rabbit'], ['🐉', 'Dragon'], ['🐍', 'Snake'], ['🐎', 'Horse'], ['🐐', 'Goat'], ['🐒', 'Monkey'], ['🐓', 'Rooster'], ['🐕', 'Dog'], ['🐖', 'Pig']]; const [i, n] = A[((y - 4) % 12 + 12) % 12]; const E = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'][Math.floor((((y - 4) % 10 + 10) % 10) / 2)]; await c.reply(`${i} CHINESE ZODIAC\n\n${y}: ${E} ${n}\n\n(Based on calendar year; births in Jan/early Feb may belong to the previous animal.)`); });
def('time', 'birthstone', '<month number or name>', async c => {
    const S = [['Garnet', '🔴'], ['Amethyst', '🟣'], ['Aquamarine', '🔵'], ['Diamond', '⚪'], ['Emerald', '🟢'], ['Pearl', '🤍'], ['Ruby', '❤️'], ['Peridot', '🟢'], ['Sapphire', '🔷'], ['Opal', '🌈'], ['Topaz', '🟠'], ['Turquoise', '🩵']];
    let m = parseInt(c.args[0], 10); if (!(m >= 1 && m <= 12)) m = MONTHS.findIndex(x => x.toLowerCase().startsWith((c.args[0] || 'zz').toLowerCase().slice(0, 3))) + 1; if (!(m >= 1 && m <= 12)) return c.reply(U(c.p, 'birthstone 8   or   birthstone august'));
    await c.reply(`💎 BIRTHSTONE\n\n${MONTHS[m - 1]}: ${S[m - 1][1]} ${S[m - 1][0]}`);
});
def('time', 'generation', '<birth year>', async c => { const y = parseInt(c.args[0], 10); if (!(y >= 1880 && y <= new Date().getFullYear())) return c.reply(U(c.p, 'generation 1999')); const g = y <= 1945 ? 'Silent Generation' : y <= 1964 ? 'Baby Boomer' : y <= 1980 ? 'Generation X' : y <= 1996 ? 'Millennial' : y <= 2012 ? 'Generation Z' : 'Generation Alpha'; await c.reply(`👥 GENERATION\n\nBorn ${y}: ${g}\nAge this year: ~${new Date().getFullYear() - y}`); });

// ───── country table (offline) ─────
const COUNTRIES = [
    ['Zimbabwe', 'ZW', 'Harare', 263, 'ZWG'], ['South Africa', 'ZA', 'Pretoria (executive), Cape Town (legislative), Bloemfontein (judicial)', 27, 'ZAR'], ['Zambia', 'ZM', 'Lusaka', 260, 'ZMW'], ['Botswana', 'BW', 'Gaborone', 267, 'BWP'], ['Mozambique', 'MZ', 'Maputo', 258, 'MZN'], ['Malawi', 'MW', 'Lilongwe', 265, 'MWK'], ['Namibia', 'NA', 'Windhoek', 264, 'NAD'], ['Angola', 'AO', 'Luanda', 244, 'AOA'], ['Tanzania', 'TZ', 'Dodoma', 255, 'TZS'], ['Kenya', 'KE', 'Nairobi', 254, 'KES'], ['Uganda', 'UG', 'Kampala', 256, 'UGX'], ['Rwanda', 'RW', 'Kigali', 250, 'RWF'], ['Ethiopia', 'ET', 'Addis Ababa', 251, 'ETB'], ['Nigeria', 'NG', 'Abuja', 234, 'NGN'], ['Ghana', 'GH', 'Accra', 233, 'GHS'], ['Egypt', 'EG', 'Cairo', 20, 'EGP'], ['Morocco', 'MA', 'Rabat', 212, 'MAD'], ['Algeria', 'DZ', 'Algiers', 213, 'DZD'], ['Tunisia', 'TN', 'Tunis', 216, 'TND'], ['Libya', 'LY', 'Tripoli', 218, 'LYD'], ['Senegal', 'SN', 'Dakar', 221, 'XOF'], ['Ivory Coast', 'CI', 'Yamoussoukro', 225, 'XOF'], ['Cameroon', 'CM', 'Yaoundé', 237, 'XAF'], ['DR Congo', 'CD', 'Kinshasa', 243, 'CDF'], ['Congo', 'CG', 'Brazzaville', 242, 'XAF'], ['Sudan', 'SD', 'Khartoum', 249, 'SDG'], ['South Sudan', 'SS', 'Juba', 211, 'SSP'], ['Somalia', 'SO', 'Mogadishu', 252, 'SOS'], ['Eswatini', 'SZ', 'Mbabane', 268, 'SZL'], ['Lesotho', 'LS', 'Maseru', 266, 'LSL'], ['Madagascar', 'MG', 'Antananarivo', 261, 'MGA'], ['Mauritius', 'MU', 'Port Louis', 230, 'MUR'],
    ['USA', 'US', 'Washington, D.C.', 1, 'USD'], ['UK', 'GB', 'London', 44, 'GBP'], ['France', 'FR', 'Paris', 33, 'EUR'], ['Germany', 'DE', 'Berlin', 49, 'EUR'], ['Italy', 'IT', 'Rome', 39, 'EUR'], ['Spain', 'ES', 'Madrid', 34, 'EUR'], ['Portugal', 'PT', 'Lisbon', 351, 'EUR'], ['Brazil', 'BR', 'Brasília', 55, 'BRL'], ['Argentina', 'AR', 'Buenos Aires', 54, 'ARS'], ['Canada', 'CA', 'Ottawa', 1, 'CAD'], ['Australia', 'AU', 'Canberra', 61, 'AUD'], ['India', 'IN', 'New Delhi', 91, 'INR'], ['China', 'CN', 'Beijing', 86, 'CNY'], ['Japan', 'JP', 'Tokyo', 81, 'JPY'], ['South Korea', 'KR', 'Seoul', 82, 'KRW'], ['Russia', 'RU', 'Moscow', 7, 'RUB'], ['Turkey', 'TR', 'Ankara', 90, 'TRY'], ['Saudi Arabia', 'SA', 'Riyadh', 966, 'SAR'], ['UAE', 'AE', 'Abu Dhabi', 971, 'AED'], ['Mexico', 'MX', 'Mexico City', 52, 'MXN'], ['Indonesia', 'ID', 'Jakarta', 62, 'IDR'], ['Pakistan', 'PK', 'Islamabad', 92, 'PKR']
];
const flagOf = iso => String.fromCodePoint(...[...iso].map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65));
const ALIAS = { 'united states': 'US', america: 'US', usa: 'US', 'united kingdom': 'GB', england: 'GB', britain: 'GB', uk: 'GB', uae: 'AE', emirates: 'AE', 'ivory coast': 'CI', 'cote d\'ivoire': 'CI', drc: 'CD', 'democratic republic of congo': 'CD', 'republic of congo': 'CG', swaziland: 'SZ', rsa: 'ZA' };
function findCountry(q) {
    const s = String(q || '').toLowerCase().trim(); if (!s) return null;
    const iso = ALIAS[s]; return COUNTRIES.find(x => x[1].toLowerCase() === s || (iso && x[1] === iso) || x[0].toLowerCase() === s) || COUNTRIES.find(x => x[0].toLowerCase().startsWith(s)) || COUNTRIES.find(x => x[2].toLowerCase().startsWith(s));
}
const countryCmd = (name, emoji, title, line) => def('info', name, '<country>', async c => {
    const r = findCountry(c.q); if (!r) return c.reply(U(c.p, `${name} zimbabwe\n\n(${COUNTRIES.length} countries available — try the full English name or 2-letter code)`));
    await c.reply(`${emoji} ${title}\n\n${flagOf(r[1])} ${r[0]}\n${line(r)}`);
});
countryCmd('capital', '🏛️', 'CAPITAL', r => `Capital: ${r[2]}`);
countryCmd('callcode', '📞', 'CALLING CODE', r => `Dial: +${r[3]}`);
countryCmd('currencyof', '💱', 'CURRENCY', r => `Currency code: ${r[4]}`);
countryCmd('flagof', '🏳️', 'FLAG', r => `Flag: ${flagOf(r[1])}  (ISO ${r[1]})`);
countryCmd('countryinfo', '🌍', 'COUNTRY SNAPSHOT', r => `ISO: ${r[1]}\nCapital: ${r[2]}\nDial code: +${r[3]}\nCurrency: ${r[4]}`);

// ───── periodic table ─────
const EL = 'H Hydrogen,He Helium,Li Lithium,Be Beryllium,B Boron,C Carbon,N Nitrogen,O Oxygen,F Fluorine,Ne Neon,Na Sodium,Mg Magnesium,Al Aluminium,Si Silicon,P Phosphorus,S Sulfur,Cl Chlorine,Ar Argon,K Potassium,Ca Calcium,Sc Scandium,Ti Titanium,V Vanadium,Cr Chromium,Mn Manganese,Fe Iron,Co Cobalt,Ni Nickel,Cu Copper,Zn Zinc,Ga Gallium,Ge Germanium,As Arsenic,Se Selenium,Br Bromine,Kr Krypton,Rb Rubidium,Sr Strontium,Y Yttrium,Zr Zirconium,Nb Niobium,Mo Molybdenum,Tc Technetium,Ru Ruthenium,Rh Rhodium,Pd Palladium,Ag Silver,Cd Cadmium,In Indium,Sn Tin,Sb Antimony,Te Tellurium,I Iodine,Xe Xenon,Cs Caesium,Ba Barium,La Lanthanum,Ce Cerium,Pr Praseodymium,Nd Neodymium,Pm Promethium,Sm Samarium,Eu Europium,Gd Gadolinium,Tb Terbium,Dy Dysprosium,Ho Holmium,Er Erbium,Tm Thulium,Yb Ytterbium,Lu Lutetium,Hf Hafnium,Ta Tantalum,W Tungsten,Re Rhenium,Os Osmium,Ir Iridium,Pt Platinum,Au Gold,Hg Mercury,Tl Thallium,Pb Lead,Bi Bismuth,Po Polonium,At Astatine,Rn Radon,Fr Francium,Ra Radium,Ac Actinium,Th Thorium,Pa Protactinium,U Uranium,Np Neptunium,Pu Plutonium,Am Americium,Cm Curium,Bk Berkelium,Cf Californium,Es Einsteinium,Fm Fermium,Md Mendelevium,No Nobelium,Lr Lawrencium,Rf Rutherfordium,Db Dubnium,Sg Seaborgium,Bh Bohrium,Hs Hassium,Mt Meitnerium,Ds Darmstadtium,Rg Roentgenium,Cn Copernicium,Nh Nihonium,Fl Flerovium,Mc Moscovium,Lv Livermorium,Ts Tennessine,Og Oganesson'.split(',').map(x => x.split(' '));
def('info', 'element', '<symbol | name | atomic number>', async c => {
    const s = (c.args[0] || '').toLowerCase(); if (!s) return c.reply(U(c.p, 'element Fe   |   element gold   |   element 79'));
    const n = /^\d+$/.test(s) ? parseInt(s, 10) : EL.findIndex(([sym, name]) => sym.toLowerCase() === s || name.toLowerCase() === s) + 1;
    if (!(n >= 1 && n <= 118)) throw new Error('No such element. Try a symbol (Fe), name (gold) or number (1-118).');
    const [sym, name] = EL[n - 1];
    const period = n <= 2 ? 1 : n <= 10 ? 2 : n <= 18 ? 3 : n <= 36 ? 4 : n <= 54 ? 5 : n <= 86 ? 6 : 7;
    await c.reply(`⚛️ ELEMENT\n\n${name} (${sym})\nAtomic number: ${n}\nPeriod: ${period}`);
});
const PLANETS = { mercury: [1, 'Terrestrial', 4879, '88 days', 3.7, '58.6 Earth days'], venus: [2, 'Terrestrial', 12104, '225 days', 8.87, '243 Earth days (retrograde)'], earth: [3, 'Terrestrial', 12742, '365.25 days', 9.81, '24 hours'], mars: [4, 'Terrestrial', 6779, '687 days', 3.71, '24.6 hours'], jupiter: [5, 'Gas giant', 139820, '11.9 years', 24.79, '9.9 hours'], saturn: [6, 'Gas giant', 116460, '29.5 years', 10.44, '10.7 hours'], uranus: [7, 'Ice giant', 50724, '84 years', 8.69, '17.2 hours (retrograde)'], neptune: [8, 'Ice giant', 49244, '164.8 years', 11.15, '16.1 hours'] };
def('info', 'planet', '<mercury…neptune>', async c => {
    const p = PLANETS[(c.args[0] || '').toLowerCase()]; if (!p) return c.reply(U(c.p, 'planet mars\n\n' + Object.keys(PLANETS).join(', ')));
    await c.reply(`🪐 ${c.args[0].toUpperCase()}\n\nPosition from Sun: #${p[0]}\nType: ${p[1]}\nDiameter: ${fmt(p[2])} km\nYear: ${p[3]}\nDay (rotation): ${p[5]}\nSurface gravity: ${p[4]} m/s²`);
});
const HTTP = { 200: 'OK', 201: 'Created', 204: 'No Content', 301: 'Moved Permanently', 302: 'Found (temporary redirect)', 304: 'Not Modified', 400: 'Bad Request', 401: 'Unauthorized — login/credentials needed', 403: 'Forbidden — not allowed', 404: 'Not Found', 405: 'Method Not Allowed', 408: 'Request Timeout', 409: 'Conflict', 410: 'Gone', 418: "I'm a teapot ☕", 429: 'Too Many Requests — slow down', 500: 'Internal Server Error', 502: 'Bad Gateway', 503: 'Service Unavailable', 504: 'Gateway Timeout' };
def('info', 'httpstatus', '<code>', async c => { const n = parseInt(c.args[0], 10); if (!n) return c.reply(U(c.p, 'httpstatus 404')); await c.reply(`🌐 HTTP ${n}\n\n${HTTP[n] || (n >= 500 ? 'Server error' : n >= 400 ? 'Client error' : n >= 300 ? 'Redirection' : n >= 200 ? 'Success' : 'Informational') + ' (uncommon code)'}`); });
def('info', 'ascii', '<character or code 0-127>', async c => {
    const a = c.q; if (!a) return c.reply(U(c.p, 'ascii A   |   ascii 65'));
    const code = /^\d+$/.test(a) ? parseInt(a, 10) : a.codePointAt(0); if (code > 0x10FFFF) throw new Error('Out of range.');
    const ch = code >= 32 && code !== 127 ? String.fromCodePoint(code) : '(control)';
    await c.reply(`🔣 CHARACTER\n\nChar: ${ch}\nDecimal: ${code}\nHex: 0x${code.toString(16).toUpperCase()}\nBinary: ${code.toString(2).padStart(8, '0')}\nUnicode: U+${code.toString(16).toUpperCase().padStart(4, '0')}`);
});

// ───── Zimbabwe & African culture ─────
const PROV = [['Harare', 'Harare'], ['Bulawayo', 'Bulawayo'], ['Manicaland', 'Mutare'], ['Mashonaland Central', 'Bindura'], ['Mashonaland East', 'Marondera'], ['Mashonaland West', 'Chinhoyi'], ['Masvingo', 'Masvingo'], ['Matabeleland North', 'Lupane'], ['Matabeleland South', 'Gwanda'], ['Midlands', 'Gweru']];
def('info', 'zimprovinces', '', async c => c.reply('🇿🇼 ZIMBABWE PROVINCES\n\n' + PROV.map(([p, cap], i) => `${i + 1}. ${p} — ${cap}`).join('\n')));
const ZIMFACTS = ['Independence Day is 18 April (since 1980).', 'The name Zimbabwe is commonly traced to "dzimba dza mabwe" — houses of stone.', 'Great Zimbabwe, near Masvingo, is a UNESCO World Heritage Site (listed 1986).', 'Victoria Falls (Mosi-oa-Tunya, "the smoke that thunders") is shared with Zambia.', 'Lake Kariba is one of the largest man-made lakes in the world by volume.', 'Mana Pools National Park is a UNESCO World Heritage Site (listed 1984).', 'Matobo Hills, with its balancing granite rocks, is a UNESCO World Heritage Site (listed 2003).', 'The 2013 constitution recognises 16 official languages, including Shona, Ndebele and English.', 'Hwange is the largest national park in Zimbabwe and home to big elephant herds.', 'The Zimbabwe Bird, a soapstone carving found at Great Zimbabwe, is the national emblem.', 'Chinhoyi Caves are known for the deep blue "Sleeping Pool".', 'Zimbabwe introduced the ZiG (Zimbabwe Gold) currency in 2024.'];
def('info', 'zimfacts', '', async c => c.reply(`🇿🇼 ZIMBABWE FACT\n\n${rnd.pick(ZIMFACTS)}`));
const SHONA = {
    greetings: [['Mhoro', 'Hello'], ['Mangwanani', 'Good morning'], ['Masikati', 'Good afternoon'], ['Manheru', 'Good evening'], ['Makadii?', 'How are you? (respectful/plural)'], ['Wakadii?', 'How are you? (to one person)'], ['Ndiripo', 'I am fine'], ['Ndatenda', 'Thank you'], ['Maita basa', 'Thank you (for the work)'], ['Fambai zvakanaka', 'Go well'], ['Sarai zvakanaka', 'Stay well']],
    basics: [['Hongu', 'Yes'], ['Kwete', 'No'], ['Ndapota', 'Please'], ['Ndine urombo', 'I am sorry'], ['Zvakanaka', 'It is good / fine'], ['Ndinokuda', 'I love you'], ['Mari', 'Money'], ['Mvura', 'Water'], ['Sadza', 'Staple maize meal'], ['Rudo', 'Love'], ['Zuva', 'Sun / day'], ['Imba', 'House']],
    numbers: [['potsi', '1'], ['piri', '2'], ['tatu', '3'], ['china', '4'], ['shanu', '5'], ['tanhatu', '6'], ['nomwe', '7'], ['sere', '8'], ['pfumbamwe', '9'], ['gumi', '10']],
    family: [['Baba', 'Father'], ['Amai', 'Mother'], ['Mukoma', 'Older brother'], ['Hanzvadzi', 'Sibling (of opposite sex)'], ['Mwana', 'Child'], ['Sekuru', 'Grandfather / maternal uncle'], ['Ambuya', 'Grandmother']],
    animals: [['Shumba', 'Lion'], ['Nzou', 'Elephant'], ['Mbada', 'Leopard'], ['Mhembwe', 'Kudu'], ['Gudo', 'Baboon'], ['Mbwa', 'Dog'], ['Katsi', 'Cat'], ['Huku', 'Chicken'], ['Mombe', 'Cow']]
};
const NDEBELE = {
    greetings: [['Sawubona', 'Hello'], ['Unjani?', 'How are you?'], ['Ngiyaphila', 'I am fine'], ['Ngiyabonga', 'Thank you'], ['Hamba kahle', 'Go well'], ['Sala kahle', 'Stay well']],
    basics: [['Yebo', 'Yes'], ['Hatshi / Cha', 'No'], ['Amanzi', 'Water'], ['Ukudla', 'Food'], ['Ilanga', 'Sun'], ['Ngiyakuthanda', 'I love you'], ['Indlovu', 'Elephant'], ['Ibhubesi', 'Lion']]
};
const langCmd = (name, flag, title, bank) => def('info', name, '[greetings|basics|…]', async c => {
    const topic = (c.args[0] || '').toLowerCase(); const topics = Object.keys(bank);
    if (!topic) return c.reply(`${flag} ${title}\n\nTopics: ${topics.join(', ')}\n\nExample: ${c.p}${name} ${topics[0]}\n\nRandom phrase: ${c.p}${name} random`);
    if (topic === 'random') { const all = Object.values(bank).flat(); const [a, b] = rnd.pick(all); return c.reply(`${flag} ${title} — RANDOM\n\n${a} = ${b}`); }
    if (!bank[topic]) throw new Error(`Unknown topic. Use: ${topics.join(', ')}, random`);
    await c.reply(`${flag} ${title} — ${topic.toUpperCase()}\n\n${bank[topic].map(([a, b]) => `• ${a} = ${b}`).join('\n')}`);
});
langCmd('shona', '🇿🇼', 'SHONA', SHONA);
langCmd('ndebele', '🇿🇼', 'NDEBELE', NDEBELE);
const PROVERBS_SHONA = [['Chara chimwe hachitswanyi inda.', 'One thumb cannot crush a louse. (Cooperation gets things done.)'], ['Rume rimwe harifambisi musha.', 'One man cannot run a homestead. (Teamwork.)'], ['Mwana asingachemi anofira mumbereko.', 'A child who does not cry dies on the mother’s back. (Speak up when you need help.)'], ['Chakafukidza dzimba matenga.', 'What covers houses is the roofs. (Everyone has things they keep private.)'], ['Rina manyanga hariputirwi mushwi.', 'A horned animal cannot be wrapped in a sack. (Some things cannot be hidden.)']];
def('info', 'shonaproverb', '', async c => { const [a, b] = rnd.pick(PROVERBS_SHONA); await c.reply(`🇿🇼 SHONA PROVERB\n\n“${a}”\n\n${b}`); });
const PROVERBS_AF = [['Umuntu ngumuntu ngabantu.', 'Zulu/Ndebele — A person is a person through other people.'], ['Haraka haraka haina baraka.', 'Swahili — Hurry, hurry has no blessing.'], ['Pole pole ndio mwendo.', 'Swahili — Slowly, slowly is the way to go.'], ['Se wo were fi na wosankofa a yenkyi.', 'Akan — It is not wrong to go back for what you forgot.'], ['Onye ajụjụ anaghị efu uzo.', 'Igbo — One who asks questions does not lose the way.']];
def('info', 'africanproverb', '', async c => { const [a, b] = rnd.pick(PROVERBS_AF); await c.reply(`🌍 AFRICAN PROVERB\n\n“${a}”\n\n${b}`); });

module.exports = { parseDate, findCountry, COUNTRIES, EL };
