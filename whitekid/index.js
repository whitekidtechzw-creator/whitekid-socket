// whitekid-sockets · Whitekid Tech
// Whitekid's own entry layer: one call gives you a connected, self-healing socket.
import makeWASocket, {
    Browsers,
    DisconnectReason,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore
} from '../lib/index.js';

import { printBanner } from './banner.js';

export * from '../lib/index.js';
export { printBanner };

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Start a Whitekid session.
 *
 * const wk = await startWhitekid({
 *   sessionDir: './session',
 *   phoneNumber: '2637XXXXXXXX',     // optional: pair with a code instead of QR
 *   onCode: (code) => console.log('Pairing code:', code),
 *   onQR: (qr) => {},                 // optional
 *   onReady: (sock) => {},
 *   onMessage: (msg, sock, say) => {},
 * })
 */
export async function startWhitekid(opts = {}) {
    const {
        sessionDir = './whitekid_session',
        phoneNumber,
        pairingCode = 'WHITEKID',
        browser = ['Whitekid Tech', 'Chrome', '1.0.0'],
        logger,
        banner = true,
        maxBackoffMs = 30000,
        onCode, onQR, onReady, onClose, onMessage,
        socketOptions = {}
    } = opts;

    if (banner) printBanner();

    let sock = null;
    let stopped = false;
    let attempt = 0;
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const connect = async () => {
        const config = {
            auth: {
                creds: state.creds,
                keys: logger ? makeCacheableSignalKeyStore(state.keys, logger) : state.keys
            },
            browser,
            ...(logger ? { logger } : {}),
            ...socketOptions
        };
        sock = makeWASocket(config);
        sock.ev.on('creds.update', saveCreds);

        // Whitekid helpers
        const say = (jid, text, quoted) => sock.sendMessage(jid, { text }, quoted ? { quoted } : undefined);
        sock.say = say;
        sock.react = (jid, key, emoji) => sock.sendMessage(jid, { react: { text: emoji, key } });

        if (phoneNumber && !state.creds.registered) {
            await wait(2000);
            try {
                const code = await sock.requestPairingCode(String(phoneNumber).replace(/\D/g, ''), pairingCode);
                onCode?.(code);
            } catch (e) {
                onClose?.({ reason: 'pairing-failed', error: e });
            }
        }

        sock.ev.on('connection.update', async (u) => {
            if (u.qr && !phoneNumber) onQR?.(u.qr);
            if (u.connection === 'open') {
                attempt = 0;
                onReady?.(sock);
            }
            if (u.connection === 'close') {
                const status = u.lastDisconnect?.error?.output?.statusCode;
                const loggedOut = status === DisconnectReason.loggedOut;
                onClose?.({ reason: loggedOut ? 'logged-out' : 'dropped', status });
                if (!loggedOut && !stopped) {
                    attempt += 1;
                    await wait(Math.min(1000 * 2 ** attempt, maxBackoffMs));
                    if (!stopped) connect();
                }
            }
        });

        if (onMessage) {
            sock.ev.on('messages.upsert', ({ messages, type }) => {
                if (type !== 'notify') return;
                for (const m of messages) if (!m.key.fromMe) onMessage(m, sock, say);
            });
        }
    };

    await connect();

    return {
        get sock() { return sock; },
        stop() { stopped = true; try { sock?.end?.(undefined); } catch {} }
    };
}

export { Browsers };
export default startWhitekid;
