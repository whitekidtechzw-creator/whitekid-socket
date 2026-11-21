'use strict';
const { ADMIN_TOKEN, config } = require('./config');
const { crypto, path } = require('./deps');
const { restoreAll, startSession } = require('./manager');
const { activeSockets, listSavedNumbers } = require('./store');

const express = require('express');

const pairGuard = require('./pairguard');

const app = express();

app.disable('x-powered-by');

app.set('trust proxy', 1);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

function requireAdmin(req, res, next) {
    if (!ADMIN_TOKEN) return res.status(403).json({ error: 'Admin routes are disabled (ADMIN_TOKEN is not set).' });
    const a = crypto.createHash('sha256').update(String(req.get('x-admin-token') || '')).digest();
    const b = crypto.createHash('sha256').update(ADMIN_TOKEN).digest();
    if (!crypto.timingSafeEqual(a, b)) return res.status(401).json({ error: 'Unauthorized' });
    next();
}

app.get('/', (req, res, next) => (req.query.number ? next() : res.sendFile(path.join(__dirname, 'main.html'))));

app.get('/', pairGuard.middleware({ max: 5, windowMs: 10 * 60 * 1000 }), async (req, res) => {
    try {
        const r = await startSession(pairGuard.clean(req.query.number));
        if (r.status === 'pairing') return res.json({ code: r.code });
        return res.json({ status: 'already_connected' });
    } catch (err) {
        console.error('Pairing failed:', err.message);
        return res.status(503).json({ error: 'Service Unavailable' });
    }
});

app.get('/status', pairGuard.middleware({ max: 120, windowMs: 10 * 60 * 1000 }), (req, res) => {
    const n = pairGuard.clean(req.query.number);
    res.json({ connected: !!n && activeSockets.has(n) });
});

app.get('/active', (req, res) => res.json({ count: activeSockets.size, numbers: [...activeSockets.keys()].map(pairGuard.mask) }));

app.get('/ping', (req, res) => res.json({ status: 'active', bot: config.BOT_NAME, fullName: config.BOT_FULL_NAME, dev: 'WhiteKid Tech', activesession: activeSockets.size, version: config.VERSION }));

app.get('/health', (req, res) => res.json({ status: 'online', bot: 'whitekid-prime', version: config.VERSION, developer: 'Flax Malcom', timestamp: new Date().toISOString() }));

async function reconnectAll(req, res) {
    try { await restoreAll(); res.json({ status: 'success', saved: listSavedNumbers().length, active: activeSockets.size }); }
    catch (err) { res.status(500).json({ error: err.message }); }
}

app.get('/reconnect', requireAdmin, reconnectAll);

app.get('/connect-all', requireAdmin, reconnectAll);

app.use((req, res) => res.status(404).json({ error: 'Route not found', bot: 'whitekid prime v' + config.VERSION }));

app.use((err, req, res, next) => { console.error('Express error:', err.message); res.status(500).json({ error: 'Internal server error' }); });

module.exports = { app };
