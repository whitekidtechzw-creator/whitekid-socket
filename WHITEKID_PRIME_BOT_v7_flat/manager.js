'use strict';
const { AI_FULL_NAME, AI_SHORT_NAME, WM, config } = require('./config');
const { Browsers, DisconnectReason, delay, fetchLatestBaileysVersion, jidNormalizedUser, makeCacheableSignalKeyStore, makeWASocket, useMultiFileAuthState } = require('./wa');
const { activeSockets, getCustomPrefix, listSavedNumbers, removeSession, sessionDir, socketCreationTime } = require('./store');
const { fs, pino } = require('./deps');
const { attachHandlers } = require('./handler');
const { getRandomBotImage, joinGroup, joinNewsletter, toSmallCaps } = require('./helpers');

const current = new Map();

const retries = new Map();

const justPaired = new Set();

const MAX_RECONNECTS = Number(process.env.MAX_RECONNECTS) || 8;

const managerDeps = { requestPairing: (n) => startSession(n), endSession: (n, o) => endSession(n, o) };

function dispose(socket) {
    try { clearInterval(socket._presenceTimer); } catch {}
    try { socket.ev.removeAllListeners(); } catch {}
    try { socket.end(undefined); } catch {}
}

async function requestCode(socket, number) {
    let lastError;
    for (let attempt = 1; attempt <= config.MAX_RETRIES; attempt++) {
        try { await delay(1500); return await socket.requestPairingCode(number); }
        catch (err) { lastError = err; await delay(2000 * attempt); }
    }
    throw new Error('WhatsApp did not return a pairing code (' + (lastError ? lastError.message : 'unknown error') + ')');
}

async function connect(number) {
    const dir = sessionDir(number);
    fs.mkdirSync(dir, { recursive: true });
    const { state, saveCreds } = await useMultiFileAuthState(dir);
    const logger = pino({ level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'fatal' : 'silent') });
    let version; try { version = (await fetchLatestBaileysVersion()).version; } catch { version = undefined; }
    const socket = makeWASocket({
        ...(version ? { version } : {}),
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
        printQRInTerminal: false, logger, browser: Browsers.macOS('Safari'),
    });
    current.set(number, socket);
    socket.ev.on('creds.update', saveCreds);
    socket.ev.on('connection.update', (update) => onConnectionUpdate(number, socket, update).catch((e) => console.error('connection.update error:', e)));
    attachHandlers(socket, number, managerDeps);
    const paired = Boolean(socket.authState.creds.registered || socket.authState.creds.me);
    if (paired) return { status: 'connecting' };
    justPaired.add(number);
    try { return { status: 'pairing', code: await requestCode(socket, number) }; }
    catch (err) { current.delete(number); justPaired.delete(number); dispose(socket); removeSession(number); throw err; }
}

async function onOpen(number, socket) {
    retries.delete(number);
    activeSockets.set(number, socket);
    socketCreationTime.set(number, Date.now());
    console.log('✅ ' + number + ' connected');
    clearInterval(socket._presenceTimer);
    socket._presenceTimer = setInterval(async () => { try { await socket.sendPresenceUpdate('available'); } catch {} }, 45000);
    if (socket._presenceTimer.unref) socket._presenceTimer.unref();
    if (!justPaired.delete(number)) return;
    try {
        await delay(3000);
        const userJid = jidNormalizedUser(socket.user.id);
        let groupStatus = 'skipped';
        if (config.AUTO_JOIN) {
            groupStatus = (await joinGroup(socket)).status;
            for (const j of [config.NEWSLETTER_JID, config.USER_CHANNEL_JID, config.USER_CHANNEL_URL]) { if (j) { try { await joinNewsletter(socket, j); } catch {} } }
        }
        await socket.sendMessage(userJid, { image: { url: getRandomBotImage() }, caption: '🤖 *WELCOME TO ' + AI_SHORT_NAME + '*\n_' + AI_FULL_NAME + '_\n╭─────────────────────⭓\n│ ' + toSmallCaps('✅ connected!') + '\n│ 📱 ' + number + '\n│ 👥 ' + toSmallCaps('group: ' + groupStatus) + '\n│ ' + toSmallCaps('type ' + getCustomPrefix() + 'menu for 350+ cmds') + '\n│ ' + toSmallCaps('🤖 ai: on | 🎙️ voice: on') + '\n╰─────────────────────⭓' + WM });
    } catch (err) { console.warn('Welcome step failed for ' + number + ': ' + err.message); }
}

async function onConnectionUpdate(number, socket, { connection, lastDisconnect }) {
    if (current.get(number) !== socket) return; // event from a replaced socket
    if (connection === 'open') return onOpen(number, socket);
    if (connection !== 'close') return;
    activeSockets.delete(number);
    const status = lastDisconnect?.error?.output?.statusCode;
    const paired = Boolean(socket.authState.creds.registered || socket.authState.creds.me);
    if (status === DisconnectReason.loggedOut || status === 401) {
        console.log('🔒 ' + number + ' logged out, removing local session');
        return endSession(number, { logout: false });
    }
    if (status === 440) { // connection replaced
        console.warn('⚠️ ' + number + ' was opened somewhere else (connection replaced). Not reconnecting.');
        current.delete(number);
        return dispose(socket);
    }
    if (!paired) { // pairing code expired or was never used
        console.log('⌛ ' + number + ' pairing was not completed, cleaning up');
        current.delete(number); justPaired.delete(number); dispose(socket);
        return removeSession(number);
    }
    dispose(socket);
    const restart = status === DisconnectReason.restartRequired; // normal right after pairing
    const attempt = restart ? 0 : (retries.get(number) || 0) + 1;
    if (attempt > MAX_RECONNECTS) { console.error('❌ ' + number + ': giving up after ' + MAX_RECONNECTS + ' reconnect attempts'); current.delete(number); return; }
    retries.set(number, attempt);
    const wait = restart ? 500 : Math.min(30000, 1000 * 2 ** attempt);
    console.log('🔁 ' + number + ' reconnecting in ' + Math.round(wait / 1000) + 's (attempt ' + attempt + ')');
    setTimeout(() => {
        if (current.get(number) !== socket) return; // superseded or ended meanwhile
        connect(number).catch((err) => console.error('Reconnect failed for ' + number + ':', err.message));
    }, wait);
}

async function startSession(rawNumber) {
    const number = String(rawNumber || '').replace(/[^0-9]/g, '');
    if (!/^\d{7,15}$/.test(number)) throw new Error('Invalid number. Use digits only, with country code.');
    if (activeSockets.has(number)) return { status: 'already_connected' };
    const existing = current.get(number);
    if (existing) {
        if (existing.authState.creds.registered || existing.authState.creds.me) return { status: 'connecting' };
        current.delete(number); dispose(existing); removeSession(number); // half-finished pairing: start over
    }
    return connect(number);
}

async function endSession(rawNumber, { purge = true, logout = true } = {}) {
    const number = String(rawNumber || '').replace(/[^0-9]/g, '');
    const socket = current.get(number) || activeSockets.get(number);
    current.delete(number); activeSockets.delete(number); socketCreationTime.delete(number); retries.delete(number); justPaired.delete(number);
    if (socket) { if (logout) { try { await socket.logout(); } catch {} } dispose(socket); }
    if (purge) removeSession(number);
}

async function restoreAll() {
    const numbers = listSavedNumbers();
    console.log('Restoring ' + numbers.length + ' saved session(s)');
    for (const number of numbers) {
        try { await startSession(number); } catch (err) { console.error('Could not restore ' + number + ': ' + err.message); }
        await delay(1500);
    }
}

function shutdown() { for (const s of current.values()) dispose(s); current.clear(); activeSockets.clear(); }

module.exports = { restoreAll, shutdown, startSession };
