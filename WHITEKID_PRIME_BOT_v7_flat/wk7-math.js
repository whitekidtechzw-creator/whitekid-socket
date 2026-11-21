'use strict';
const { def, category, fmt, money, num, nums, U } = require('./wk7-core');

category('math', '🧮', 'MATH & CONVERTERS');

// ───── safe expression parser (no eval) ─────
function evaluate(src) {
    const s = String(src).toLowerCase().replace(/×/g, '*').replace(/÷/g, '/').replace(/\s+/g, '');
    let i = 0;
    const FN = { sqrt: Math.sqrt, cbrt: Math.cbrt, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, log: Math.log10, ln: Math.log, log2: Math.log2, abs: Math.abs, round: Math.round, floor: Math.floor, ceil: Math.ceil, exp: Math.exp, sign: Math.sign };
    const CONST = { pi: Math.PI, e: Math.E, tau: 2 * Math.PI };
    function peek() { return s[i]; }
    function expr() { let v = term(); while (peek() === '+' || peek() === '-') { const op = s[i++]; const r = term(); v = op === '+' ? v + r : v - r; } return v; }
    function term() { let v = unary(); while (peek() === '*' || peek() === '/' || peek() === '%') { const op = s[i++]; const r = unary(); if (op === '*') v *= r; else if (op === '/') { if (r === 0) throw new Error('Division by zero'); v /= r; } else { if (r === 0) throw new Error('Modulo by zero'); v %= r; } } return v; }
    function unary() { if (peek() === '-') { i++; return -unary(); } if (peek() === '+') { i++; return unary(); } return power(); }
    function power() { const b = postfix(); if (peek() === '^' || (peek() === '*' && s[i + 1] === '*')) { i += peek() === '^' ? 1 : 2; const e = unary(); return Math.pow(b, e); } return b; }
    function postfix() { let v = atom(); while (peek() === '!') { i++; v = fact(v); } return v; }
    function fact(n) { if (n < 0 || !Number.isInteger(n) || n > 170) throw new Error('Factorial needs an integer 0-170'); let r = 1; for (let k = 2; k <= n; k++) r *= k; return r; }
    function atom() {
        if (peek() === '(') { i++; const v = expr(); if (peek() !== ')') throw new Error('Missing )'); i++; return v; }
        const m = s.slice(i).match(/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/);
        if (m) { i += m[0].length; return parseFloat(m[0]); }
        const w = s.slice(i).match(/^[a-z][a-z0-9]*/);
        if (w) {
            i += w[0].length;
            if (w[0] in CONST) return CONST[w[0]];
            if (w[0] in FN) { if (peek() !== '(') throw new Error('Use ' + w[0] + '(…)'); i++; const a = expr(); if (peek() !== ')') throw new Error('Missing )'); i++; return FN[w[0]](a); }
            throw new Error('Unknown name: ' + w[0]);
        }
        throw new Error('Unexpected "' + (peek() || 'end') + '"');
    }
    if (!s) throw new Error('Empty expression');
    const v = expr();
    if (i < s.length) throw new Error('Unexpected "' + s[i] + '"');
    if (!isFinite(v)) throw new Error('Result is not a finite number');
    return v;
}

def('math', ['math', 'solve'], '<expression>', async c => {
    if (!c.q) return c.reply(U(c.p, 'math (2+3)*4^2 / sqrt(81)\nSupports + - * / % ^ ! ( ) pi e sqrt sin cos tan log ln abs round floor ceil'));
    await c.reply(`🧮 MATH\n\n${c.q} = ${fmt(evaluate(c.q), 10)}`);
});

// ───── statistics ─────
const list = c => { const a = nums(c.args.length ? c.args : c.q.split(/[,\s]+/)).filter(x => !isNaN(x)); if (!a.length) throw new Error('Give some numbers, e.g. 4 8 15 16 23 42'); return a; };
const sum = a => a.reduce((x, y) => x + y, 0);
def('math', 'sum', '<numbers>', async c => { const a = list(c); await c.reply(`➕ SUM\n\n${a.join(' + ')} = ${fmt(sum(a))}`); });
def('math', ['avg', 'mean'], '<numbers>', async c => { const a = list(c); await c.reply(`📊 AVERAGE\n\nCount: ${a.length}\nSum: ${fmt(sum(a))}\nMean: ${fmt(sum(a) / a.length)}`); });
def('math', 'median', '<numbers>', async c => { const a = list(c).sort((x, y) => x - y); const m = Math.floor(a.length / 2); await c.reply(`📊 MEDIAN\n\nSorted: ${a.join(', ')}\nMedian: ${fmt(a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2)}`); });
def('math', 'statmode', '<numbers>', async c => { const a = list(c); const f = new Map(); a.forEach(x => f.set(x, (f.get(x) || 0) + 1)); const mx = Math.max(...f.values()); await c.reply(`📊 MODE\n\n${mx === 1 ? 'No repeated values.' : 'Mode: ' + [...f].filter(([, v]) => v === mx).map(([k]) => k).join(', ') + ` (x${mx})`}`); });
def('math', 'stddev', '<numbers>', async c => { const a = list(c); const mu = sum(a) / a.length; const v = sum(a.map(x => (x - mu) ** 2)); await c.reply(`📊 STANDARD DEVIATION\n\nMean: ${fmt(mu)}\nPopulation σ: ${fmt(Math.sqrt(v / a.length))}\nSample s: ${a.length > 1 ? fmt(Math.sqrt(v / (a.length - 1))) : 'n/a'}`); });
def('math', 'minmax', '<numbers>', async c => { const a = list(c); await c.reply(`📊 MIN / MAX\n\nMin: ${fmt(Math.min(...a))}\nMax: ${fmt(Math.max(...a))}\nRange: ${fmt(Math.max(...a) - Math.min(...a))}`); });

// ───── number theory ─────
const int1 = (c, max = 1e15) => { const n = num(c.args[0]); if (!Number.isInteger(n) || n < 0 || n > max) throw new Error(`Give a whole number between 0 and ${fmt(max)}`); return n; };
const isPrime = n => { if (n < 2) return false; if (n % 2 === 0) return n === 2; for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return false; return true; };
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
def('math', 'factorial', '<n>', async c => { const n = int1(c, 170); let r = 1n; for (let k = 2n; k <= BigInt(n); k++) r *= k; await c.reply(`❗ FACTORIAL\n\n${n}! = ${r.toString()}`); });
def('math', ['fib', 'fibonacci'], '<n>', async c => { const n = int1(c, 1000); let a = 0n, b = 1n; for (let k = 0; k < n; k++) [a, b] = [b, a + b]; await c.reply(`🌀 FIBONACCI\n\nF(${n}) = ${a.toString()}`); });
def('math', 'isprime', '<n>', async c => { const n = int1(c, 9e15); await c.reply(`🔢 PRIME CHECK\n\n${n} is ${isPrime(n) ? '✅ PRIME' : '❌ NOT prime'}`); });
def('math', 'primes', '<n> (primes up to n, max 2000)', async c => { const n = int1(c, 2000); const r = []; for (let k = 2; k <= n; k++) if (isPrime(k)) r.push(k); await c.reply(`🔢 PRIMES ≤ ${n}\n\n${r.join(', ') || 'none'}\n\nTotal: ${r.length}`); });
def('math', 'gcd', '<a> <b>', async c => { const [a, b] = nums(c.args); if (!Number.isInteger(a) || !Number.isInteger(b)) return c.reply(U(c.p, 'gcd 48 18')); await c.reply(`🔢 GCD\n\ngcd(${a}, ${b}) = ${gcd(a, b)}`); });
def('math', 'lcm', '<a> <b>', async c => { const [a, b] = nums(c.args); if (!Number.isInteger(a) || !Number.isInteger(b) || !a || !b) return c.reply(U(c.p, 'lcm 4 6')); await c.reply(`🔢 LCM\n\nlcm(${a}, ${b}) = ${Math.abs(a * b) / gcd(a, b)}`); });
def('math', 'factors', '<n>', async c => { const n = int1(c, 1e12); if (n < 1) throw new Error('Give a positive number.'); const f = []; for (let d = 1; d * d <= n; d++) if (n % d === 0) { f.push(d); if (d * d !== n) f.push(n / d); } f.sort((a, b) => a - b); const pf = []; let m = n; for (let d = 2; d * d <= m; d++) while (m % d === 0) { pf.push(d); m /= d; } if (m > 1) pf.push(m); await c.reply(`🔢 FACTORS OF ${n}\n\nAll: ${f.join(', ')}\nPrime factors: ${pf.join(' × ') || n}`); });
def('math', 'power', '<base> <exponent>', async c => { const [b, e] = nums(c.args); if (isNaN(b) || isNaN(e)) return c.reply(U(c.p, 'power 2 10')); await c.reply(`⚡ POWER\n\n${b}^${e} = ${fmt(Math.pow(b, e), 10)}`); });
def('math', 'sqrt', '<n>', async c => { const n = num(c.args[0]); if (isNaN(n) || n < 0) return c.reply(U(c.p, 'sqrt 144')); await c.reply(`√ SQUARE ROOT\n\n√${n} = ${fmt(Math.sqrt(n), 10)}\n∛${n} = ${fmt(Math.cbrt(n), 10)}`); });
def('math', 'ncr', '<n> <r> (combinations)', async c => { const [n, r] = nums(c.args); if (!Number.isInteger(n) || !Number.isInteger(r) || r < 0 || r > n || n > 1000) return c.reply(U(c.p, 'ncr 10 3')); let x = 1n; for (let k = 1n; k <= BigInt(Math.min(r, n - r)); k++) x = x * (BigInt(n) - k + 1n) / k; await c.reply(`🎴 COMBINATIONS\n\nC(${n},${r}) = ${x}`); });
def('math', 'npr', '<n> <r> (permutations)', async c => { const [n, r] = nums(c.args); if (!Number.isInteger(n) || !Number.isInteger(r) || r < 0 || r > n || n > 1000) return c.reply(U(c.p, 'npr 10 3')); let x = 1n; for (let k = 0n; k < BigInt(r); k++) x *= BigInt(n) - k; await c.reply(`🎴 PERMUTATIONS\n\nP(${n},${r}) = ${x}`); });
def('math', 'collatz', '<n>', async c => { let n = int1(c, 1e9); if (n < 1) throw new Error('Give a positive number.'); const seq = [n]; while (n !== 1 && seq.length < 2000) { n = n % 2 ? 3 * n + 1 : n / 2; seq.push(n); } await c.reply(`🔁 COLLATZ\n\nSteps: ${seq.length - 1}\nPeak: ${Math.max(...seq)}\n${seq.length <= 40 ? seq.join(' → ') : seq.slice(0, 30).join(' → ') + ' → …'}`); });
def('math', 'digitsum', '<n>', async c => { const s = String(c.args[0] || '').replace(/\D/g, ''); if (!s) return c.reply(U(c.p, 'digitsum 98765')); let t = [...s].reduce((a, d) => a + +d, 0); const first = t; while (t > 9) t = [...String(t)].reduce((a, d) => a + +d, 0); await c.reply(`🔢 DIGIT SUM\n\nSum: ${first}\nDigital root: ${t}`); });
def('math', 'sequence', '<arith|geo> <first> <step> <count>', async c => { const t = (c.args[0] || '').toLowerCase(); const [a, d, n] = nums(c.args.slice(1)); if (!['arith', 'geo'].includes(t) || [a, d, n].some(isNaN) || n < 1 || n > 50) return c.reply(U(c.p, 'sequence arith 2 3 10   |   sequence geo 1 2 8')); const r = []; let x = a; for (let k = 0; k < n; k++) { r.push(fmt(x)); x = t === 'arith' ? x + d : x * d; } await c.reply(`📈 ${t === 'arith' ? 'ARITHMETIC' : 'GEOMETRIC'} SEQUENCE\n\n${r.join(', ')}`); });

// ───── geometry & algebra ─────
def('math', 'quadratic', '<a> <b> <c>', async c => {
    const [a, b, k] = nums(c.args); if ([a, b, k].some(isNaN) || a === 0) return c.reply(U(c.p, 'quadratic 1 -3 2   (solves ax²+bx+c=0, a≠0)'));
    const D = b * b - 4 * a * k; let out;
    if (D > 0) out = `Two real roots:\nx₁ = ${fmt((-b + Math.sqrt(D)) / (2 * a))}\nx₂ = ${fmt((-b - Math.sqrt(D)) / (2 * a))}`;
    else if (D === 0) out = `One real root:\nx = ${fmt(-b / (2 * a))}`;
    else out = `Complex roots:\nx₁ = ${fmt(-b / (2 * a))} + ${fmt(Math.sqrt(-D) / (2 * a))}i\nx₂ = ${fmt(-b / (2 * a))} − ${fmt(Math.sqrt(-D) / (2 * a))}i`;
    await c.reply(`📐 QUADRATIC\n\n${a}x² + ${b}x + ${k} = 0\nDiscriminant: ${fmt(D)}\n\n${out}`);
});
def('math', 'pythag', '<a> <b> (hypotenuse)  or  <c> <a> leg', async c => {
    const [a, b] = nums(c.args); if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) return c.reply(U(c.p, 'pythag 3 4        → hypotenuse\n' + c.p + 'pythag 5 3 leg    → missing leg given c a'));
    if ((c.args[2] || '').toLowerCase() === 'leg') { if (a <= b) throw new Error('Hypotenuse must be the larger number.'); return c.reply(`📐 PYTHAGORAS\n\nMissing leg = √(${a}² − ${b}²) = ${fmt(Math.sqrt(a * a - b * b))}`); }
    await c.reply(`📐 PYTHAGORAS\n\nHypotenuse = √(${a}² + ${b}²) = ${fmt(Math.hypot(a, b))}`);
});
def('math', 'area', '<circle|square|rect|triangle|trapezoid|sphere|cube|cylinder|cone> <dims>', async c => {
    const s = (c.args[0] || '').toLowerCase(), d = nums(c.args.slice(1)); const need = n => { if (d.length < n || d.slice(0, n).some(x => isNaN(x) || x < 0)) throw new Error(`${s} needs ${n} positive number(s).`); };
    const PI = Math.PI; let out;
    switch (s) {
        case 'circle': need(1); out = `Area: ${fmt(PI * d[0] ** 2)}\nCircumference: ${fmt(2 * PI * d[0])}`; break;
        case 'square': need(1); out = `Area: ${fmt(d[0] ** 2)}\nPerimeter: ${fmt(4 * d[0])}`; break;
        case 'rect': case 'rectangle': need(2); out = `Area: ${fmt(d[0] * d[1])}\nPerimeter: ${fmt(2 * (d[0] + d[1]))}`; break;
        case 'triangle': { need(3); const [a, b, k] = d; const p = (a + b + k) / 2, A = p * (p - a) * (p - b) * (p - k); if (A <= 0) throw new Error('Those sides cannot make a triangle.'); out = `Area (Heron): ${fmt(Math.sqrt(A))}\nPerimeter: ${fmt(a + b + k)}`; break; }
        case 'trapezoid': need(3); out = `Area: ${fmt((d[0] + d[1]) / 2 * d[2])}`; break;
        case 'sphere': need(1); out = `Surface area: ${fmt(4 * PI * d[0] ** 2)}\nVolume: ${fmt(4 / 3 * PI * d[0] ** 3)}`; break;
        case 'cube': need(1); out = `Surface area: ${fmt(6 * d[0] ** 2)}\nVolume: ${fmt(d[0] ** 3)}`; break;
        case 'cylinder': need(2); out = `Surface area: ${fmt(2 * PI * d[0] * (d[0] + d[1]))}\nVolume: ${fmt(PI * d[0] ** 2 * d[1])}`; break;
        case 'cone': need(2); out = `Volume: ${fmt(PI * d[0] ** 2 * d[1] / 3)}\nSlant: ${fmt(Math.hypot(d[0], d[1]))}`; break;
        default: return c.reply(U(c.p, 'area circle 5 | area rect 4 6 | area triangle 3 4 5 | area trapezoid a b h | area sphere 3 | area cube 2 | area cylinder r h | area cone r h'));
    }
    await c.reply(`📐 ${s.toUpperCase()}\n\n${out}`);
});

// ───── base conversion ─────
const baseCmd = (names, from, to, usage) => def('math', names, usage, async c => {
    const t = (c.args[0] || '').replace(/^0x|^0b/i, ''); const ok = { 2: /^[01]+$/, 10: /^\d+$/, 16: /^[0-9a-f]+$/i }[from];
    if (!ok.test(t) || t.length > 52) return c.reply(U(c.p, `${[].concat(names)[0]} ${usage}`));
    await c.reply(`🔢 BASE ${from} → ${to}\n\n${t} = ${BigInt(from === 10 ? t : (from === 16 ? '0x' : '0b') + t).toString(to).toUpperCase()}`);
});
baseCmd('bin2dec', 2, 10, '<binary>'); baseCmd('dec2bin', 10, 2, '<number>'); baseCmd('dec2hex', 10, 16, '<number>'); baseCmd('hex2dec', 16, 10, '<hex>');
def('math', 'basecv', '<number> <from 2-36> <to 2-36>', async c => {
    const [t, f, to] = [c.args[0], +c.args[1], +c.args[2]];
    if (!t || !(f >= 2 && f <= 36) || !(to >= 2 && to <= 36)) return c.reply(U(c.p, 'basecv ff 16 2'));
    const val = parseInt(t, f); if (isNaN(val) || val.toString(f) !== t.toLowerCase().replace(/^0+(?=.)/, '')) throw new Error(`"${t}" is not valid in base ${f}.`);
    await c.reply(`🔢 BASE CONVERT\n\n${t} (base ${f}) = ${val.toString(to).toUpperCase()} (base ${to})`);
});

// ───── unit conversion ─────
const UNITS = {
    length: { base: 'm', u: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344, nmi: 1852 } },
    weight: { base: 'kg', u: { mg: 1e-6, g: 0.001, kg: 1, t: 1000, oz: 0.028349523125, lb: 0.45359237, st: 6.35029318 } },
    volume: { base: 'l', u: { ml: 0.001, l: 1, tsp: 0.00492892159, tbsp: 0.0147867648, floz: 0.0295735296, cup: 0.2365882365, pt: 0.473176473, qt: 0.946352946, gal: 3.785411784 } },
    speed: { base: 'm/s', u: { ms: 1, kmh: 1 / 3.6, mph: 0.44704, kn: 0.514444 } },
    datasize: { base: 'B', u: { b: 0.125, B: 1, kb: 1e3, mb: 1e6, gb: 1e9, tb: 1e12, kib: 1024, mib: 1048576, gib: 1073741824, tib: 1099511627776 } },
    area: { base: 'm²', u: { m2: 1, km2: 1e6, ha: 1e4, acre: 4046.8564224, ft2: 0.09290304, in2: 0.00064516, mi2: 2589988.110336 } },
    duration: { base: 's', u: { ms: 0.001, s: 1, min: 60, h: 3600, d: 86400, wk: 604800, mo: 2629800, yr: 31557600 } },
    pressure: { base: 'Pa', u: { pa: 1, kpa: 1000, bar: 1e5, psi: 6894.757, atm: 101325, mmhg: 133.322 } },
    energy: { base: 'J', u: { j: 1, kj: 1000, cal: 4.184, kcal: 4184, wh: 3600, kwh: 3.6e6 } },
    angle: { base: 'rad', u: { deg: Math.PI / 180, rad: 1, grad: Math.PI / 200, turn: 2 * Math.PI } }
};
function convertUnits(val, f, t, only) {
    for (const [cat, { u }] of Object.entries(UNITS)) {
        if (only && cat !== only) continue;
        const key = x => (x in u ? x : Object.keys(u).find(k => k.toLowerCase() === String(x).toLowerCase()));
        const kf = key(f), kt = key(t);
        if (kf && kt) return { cat, from: kf, to: kt, value: val * u[kf] / u[kt] };
    }
    return null;
}
def('math', 'convert', '<value> <from> <to>', async c => {
    const v = num(c.args[0]); if (isNaN(v) || !c.args[1] || !c.args[2]) return c.reply(U(c.p, 'convert 10 km mi   (length, weight, volume, speed, datasize, area, duration, pressure, energy, angle)'));
    const r = convertUnits(v, c.args[1], c.args[2]); if (!r) throw new Error(`Can't convert ${c.args[1]} to ${c.args[2]}. Units must be in the same family.`);
    await c.reply(`🔄 CONVERT (${r.cat})\n\n${fmt(v)} ${r.from} = ${fmt(r.value, 8)} ${r.to}`);
});
for (const cat of Object.keys(UNITS)) {
    const cname = cat === 'area' ? 'areaconv' : cat;
    def('math', cname, '<value> <from> <to>', async c => {
        const v = num(c.args[0]); const list = Object.keys(UNITS[cat].u).join(', ');
        if (isNaN(v) || !c.args[1] || !c.args[2]) return c.reply(`📌 Usage: ${c.p}${cname} <value> <from> <to>\n\nUnits: ${list}`);
        const r = convertUnits(v, c.args[1], c.args[2], cat); if (!r) throw new Error(`Unknown unit. Use: ${list}`);
        await c.reply(`🔄 ${cat.toUpperCase()}\n\n${fmt(v)} ${r.from} = ${fmt(r.value, 8)} ${r.to}`);
    });
}
def('math', 'temp', '<value> <c|f|k> (converts to the others)', async c => {
    const v = num(c.args[0]); const u = (c.args[1] || '').toLowerCase().replace('°', '');
    if (isNaN(v) || !['c', 'f', 'k'].includes(u)) return c.reply(U(c.p, 'temp 100 c'));
    const C = u === 'c' ? v : u === 'f' ? (v - 32) * 5 / 9 : v - 273.15;
    if (C < -273.15) throw new Error('Below absolute zero!');
    await c.reply(`🌡️ TEMPERATURE\n\n${fmt(C, 2)} °C\n${fmt(C * 9 / 5 + 32, 2)} °F\n${fmt(C + 273.15, 2)} K`);
});

// ───── money & everyday maths ─────
def('math', 'pctchange', '<from> <to>', async c => { const [a, b] = nums(c.args); if (isNaN(a) || isNaN(b) || a === 0) return c.reply(U(c.p, 'pctchange 80 100')); const p = (b - a) / Math.abs(a) * 100; await c.reply(`📈 PERCENT CHANGE\n\n${fmt(a)} → ${fmt(b)}\n${p >= 0 ? '▲ Increase' : '▼ Decrease'} of ${fmt(Math.abs(p), 2)}%`); });
def('math', 'ratio', '<a> <b> (simplify ratio)', async c => { const [a, b] = nums(c.args); if (!Number.isInteger(a) || !Number.isInteger(b) || !a || !b) return c.reply(U(c.p, 'ratio 1920 1080')); const g = gcd(a, b); await c.reply(`⚖️ RATIO\n\n${a}:${b} = ${a / g}:${b / g}\nDecimal: ${fmt(a / b, 4)}`); });
def('math', 'simpleinterest', '<principal> <rate%> <years>', async c => { const [p, r, t] = nums(c.args); if ([p, r, t].some(isNaN)) return c.reply(U(c.p, 'simpleinterest 1000 5 3')); const i = p * r / 100 * t; await c.reply(`💰 SIMPLE INTEREST\n\nInterest: ${money(i)}\nTotal: ${money(p + i)}`); });
def('math', 'compound', '<principal> <rate%> <years> [n per year=12]', async c => { const [p, r, t, n = 12] = nums(c.args); if ([p, r, t, n].some(isNaN) || n <= 0) return c.reply(U(c.p, 'compound 1000 5 10 12')); const A = p * Math.pow(1 + r / 100 / n, n * t); await c.reply(`💰 COMPOUND INTEREST\n\nPrincipal: ${money(p)}\nAfter ${t} yrs @ ${r}% (${n}x/yr): ${money(A)}\nInterest earned: ${money(A - p)}`); });
def('math', 'loan', '<amount> <annual rate%> <years>', async c => { const [P, r, y] = nums(c.args); if ([P, r, y].some(isNaN) || y <= 0 || P <= 0) return c.reply(U(c.p, 'loan 5000 12 2')); const m = r / 1200, n = Math.round(y * 12); const pay = m === 0 ? P / n : P * m / (1 - Math.pow(1 + m, -n)); await c.reply(`🏦 LOAN\n\nMonthly payment: ${money(pay)}\nTotal paid: ${money(pay * n)}\nTotal interest: ${money(pay * n - P)}`); });
def('math', 'vat', '<amount> [rate%=15]', async c => { const a = num(c.args[0]); const r = c.args[1] === undefined ? 15 : num(c.args[1]); if (isNaN(a) || isNaN(r)) return c.reply(U(c.p, 'vat 100 15')); await c.reply(`🧾 VAT @ ${r}%\n\nExcl. VAT: ${money(a)}\nVAT: ${money(a * r / 100)}\nIncl. VAT: ${money(a * (1 + r / 100))}\n\nIf ${money(a)} already includes VAT → net ${money(a / (1 + r / 100))}`); });
def('math', 'markup', '<cost> <selling price>', async c => { const [co, sp] = nums(c.args); if (isNaN(co) || isNaN(sp) || co === 0 || sp === 0) return c.reply(U(c.p, 'markup 60 100')); await c.reply(`🏷️ MARKUP & MARGIN\n\nProfit: ${money(sp - co)}\nMarkup: ${fmt((sp - co) / co * 100, 2)}%\nMargin: ${fmt((sp - co) / sp * 100, 2)}%`); });
def('math', 'splitbill', '<total> <people> [tip%=0]', async c => { const [t, n, tip = 0] = nums(c.args); if (isNaN(t) || !(n >= 1) || isNaN(tip)) return c.reply(U(c.p, 'splitbill 120 4 10')); const tot = t * (1 + tip / 100); await c.reply(`🍽️ SPLIT BILL\n\nTotal with tip: ${money(tot)}\nPeople: ${n}\nEach pays: ${money(tot / n)}`); });
def('math', 'fuelcost', '<distance> <km per litre> <price per litre>', async c => { const [d, e, p] = nums(c.args); if ([d, e, p].some(isNaN) || e <= 0) return c.reply(U(c.p, 'fuelcost 250 12 1.65')); const l = d / e; await c.reply(`⛽ FUEL COST\n\nFuel needed: ${fmt(l, 2)} L\nCost: ${money(l * p)}`); });
def('math', 'speedcalc', '<distance km> <time hours>', async c => { const [d, t] = nums(c.args); if (isNaN(d) || !(t > 0)) return c.reply(U(c.p, 'speedcalc 120 1.5')); await c.reply(`🚗 SPEED\n\n${fmt(d / t, 2)} km/h\n${fmt(d / t / 1.609344, 2)} mph`); });
def('math', 'sci', '<number> (scientific notation)', async c => { const n = num(c.args[0]); if (isNaN(n)) return c.reply(U(c.p, 'sci 123456789')); await c.reply(`🔬 SCIENTIFIC NOTATION\n\n${n.toExponential(6).replace(/\.?0+e/, 'e')}`); });
def('math', 'roundto', '<number> <decimals>', async c => { const n = num(c.args[0]), d = num(c.args[1]); if (isNaN(n) || !(d >= 0 && d <= 15)) return c.reply(U(c.p, 'roundto 3.14159 2')); await c.reply(`🔢 ROUND\n\n${n.toFixed(d)}`); });

module.exports = { evaluate, convertUnits, UNITS, gcd, isPrime };
