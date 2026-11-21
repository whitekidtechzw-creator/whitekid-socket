'use strict';
// Input validation + in-memory rate limiting for the pairing website.
const clean = v => String(v == null ? '' : v).replace(/[^0-9]/g, '');

function validateNumber(raw) {
    const n = clean(raw);
    if (!n) return { ok: false, error: 'Enter your WhatsApp number.' };
    if (n.startsWith('0')) return { ok: false, error: 'Use the international format with country code, e.g. 263789846423 (no leading 0).' };
    if (n.length < 8 || n.length > 15) return { ok: false, error: 'That number looks the wrong length (8–15 digits including country code).' };
    return { ok: true, number: n };
}

const mask = n => { n = clean(n); return n.length <= 6 ? n : n.slice(0, 4) + '*'.repeat(n.length - 7) + n.slice(-3); };

// max requests per windowMs per client IP
function middleware({ max = 5, windowMs = 10 * 60 * 1000, validate = true } = {}) {
    const hits = new Map();
    const timer = setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (v.reset <= now) hits.delete(k); }, 60 * 1000);
    if (timer.unref) timer.unref();
    return (req, res, next) => {
        const now = Date.now(), key = req.ip || req.socket?.remoteAddress || 'unknown';
        let h = hits.get(key);
        if (!h || h.reset <= now) { h = { count: 0, reset: now + windowMs }; hits.set(key, h); }
        h.count++;
        if (h.count > max) {
            const wait = Math.ceil((h.reset - now) / 1000);
            res.set('Retry-After', String(wait));
            return res.status(429).json({ error: `Too many attempts. Try again in ${Math.ceil(wait / 60)} minute(s).` });
        }
        if (validate) {
            const v = validateNumber(req.query?.number);
            if (!v.ok) return res.status(400).json({ error: v.error });
        }
        next();
    };
}

module.exports = { validateNumber, middleware, mask, clean };
