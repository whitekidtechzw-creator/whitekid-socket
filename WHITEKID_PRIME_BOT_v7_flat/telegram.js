'use strict';
const { QRCode, TelegramBot, fs, path, pino } = require('./deps');
const { config } = require('./config');
const { joinNewsletter, totalcmds } = require('./helpers');
const { SESSIONS_DIR, activeSockets, loadPairerMap, qrMessages, savePairerMap, socketCreationTime } = require('./store');
const { DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, makeWASocket, useMultiFileAuthState } = require('./wa');
const { attachHandlers } = require('./handler');

const tgDeps = { requestPairing: (n) => require('./manager').startSession(n), endSession: (n, o) => require('./manager').endSession(n, o) };

let telegram = null;

const TG_ASSETS = __dirname;

const tgEsc = v => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function tgReply(chatId, kind, html, extra = {}) {
    const local = path.join(TG_ASSETS, `tg-${kind}.png`);
    const hasLocal = fs.existsSync(local);
    if (!hasLocal) console.warn(`[TG IMG] ${local} not found - using fallback image. Keep the tg-*.png files next to index.js.`);
    const photo = hasLocal ? local : config.RCD_IMAGE_PATH;
    const opts = { parse_mode: 'HTML', ...extra };
    try {
        try {
            if (html.length <= 1000) return await telegram.sendPhoto(chatId, photo, { ...opts, caption: html });
            await telegram.sendPhoto(chatId, photo);
        } catch (imgErr) {
            console.error('[TG IMG]', imgErr.message);
        }
        return await telegram.sendMessage(chatId, html, opts);
    } catch (e) {
        console.error('[TG REPLY]', e.message);
        try { return await telegram.sendMessage(chatId, html.replace(/<[^>]+>/g, '')); } catch {}
    }
}

const TG_MENU = {
    pair:  { icon: '🔗', title: 'PAIRING', lines: ['<code>/pair 263789846423</code> — get your WhatsApp code', '<code>/deletepair 263789846423</code> — unlink a number', '<code>/link</code> — link with a QR code instead', '<code>/menu</code> — open this menu'] },
    games: { icon: '🎮', title: 'GAMES', lines: ['.trivia  .scramble  .mathquiz', '.emojiquiz  .flagquiz  .capitalquiz', '.hangman  .blackjack  .guess', '.rps  .slots  .dice  .roulette', '.tictactoe  .wyr  .nhie  .lottery', '', 'Answer quizzes with <code>.answer your answer</code>'] },
    fun:   { icon: '🎭', title: 'FUN', lines: ['.joke  .dadjoke  .pun  .riddle', '.quote  .fact  .motivate  .affirm', '.rate  .ship  .fortune  .horoscope', '.roast  .compliment  .rizz  .meme', '.dare  .truth  .topic  .iqtest'] },
    tools: { icon: '🧰', title: 'TEXT &amp; TOOLS', lines: ['.reverse  .mock  .clap  .bubble  .uwu', '.morse  .binary  .hex  .rot13  .leet', '.password  .uuid  .age  .bmi  .tip', '.calc  .translate  .qr  .shorturl', '.sticker  .toimg  .removebg  .remini'] },
    dl:    { icon: '⬇️', title: 'DOWNLOADS', lines: ['.play  .song  .video  .ytmp4', '.tiktok  .fb  .ig  .twitter  .spotify', '.apk  .mediafire  .gitclone  .lyrics'] },
    ai:    { icon: '🤖', title: 'AI &amp; LOGOS', lines: ['.ai  .gpt4  .gemini  .deepseek  .llama', '.imagine  .flux  .dalle  .vision', '.veo  .aivid  .txt2vid  .suno', '.logo &lt;style&gt; &lt;text&gt;  — see .logolist'] },
    group: { icon: '👥', title: 'GROUP', lines: ['.tagall  .kick  .add  .promote  .demote', '.mute  .unmute  .antilink  .welcome', '.grouplink  .setgname  .warn  .who'] }
};

const tgMenuKeyboard = () => ({ inline_keyboard: [
    [{ text: '🎮 Games', callback_data: 'tgm:games' }, { text: '🎭 Fun', callback_data: 'tgm:fun' }],
    [{ text: '🧰 Tools', callback_data: 'tgm:tools' }, { text: '⬇️ Downloads', callback_data: 'tgm:dl' }],
    [{ text: '🤖 AI & Logos', callback_data: 'tgm:ai' }, { text: '👥 Group', callback_data: 'tgm:group' }],
    [{ text: '🔗 Pairing', callback_data: 'tgm:pair' }, { text: '🏠 Home', callback_data: 'tgm:main' }]
] });

async function tgMenuText(key) {
    if (key && TG_MENU[key]) { const m = TG_MENU[key]; return `${m.icon} <b>${m.title}</b>\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n${m.lines.join('\n')}\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n<i>Use these on WhatsApp after you link — prefix is</i> <code>${tgEsc(config.PREFIX)}</code>`; }
    const n = await totalcmds().catch(() => 350);
    return `◤ <b>WHITEKID PRIME</b> ◥\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n◈ Version ⟶ <b>v${tgEsc(config.VERSION)}</b>\n◈ Commands ⟶ <b>${n}+</b>\n◈ Prefix ⟶ <code>${tgEsc(config.PREFIX)}</code>\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈\nPick a category below to see the commands.\nFull list on WhatsApp: <code>${tgEsc(config.PREFIX)}menu</code>\n\n⌁ ${tgEsc(config.OWNER_NAME)} · 🤟🏼 <i>Whitekid Dev</i>`;
}

async function handleQRLink(chatId) {
    const sid = String(chatId); if (activeSockets.has(sid)) { const s = activeSockets.get(sid); try { s.ev.removeAllListeners(); s.ws.close(); s.end(); } catch {} activeSockets.delete(sid); }
    const prev = qrMessages.get(chatId); if (prev) { telegram.deleteMessage(chatId, prev).catch(() => {}); qrMessages.delete(chatId); }
    const sp = path.join(SESSIONS_DIR, sid); if (fs.existsSync(sp)) fs.removeSync(sp);
    await tgReply(chatId, 'pair', `⌁ <b>Building your QR</b>\n\nOne moment…`);
    startTelegramSession(chatId, sid, false);
}

async function startTelegramSession(tgChatId, identifier, usePairing) {
    const sp = path.join(SESSIONS_DIR, identifier);
    try {
        const { state, saveCreds } = await useMultiFileAuthState(sp);
        let version; try { version = (await fetchLatestBaileysVersion()).version; } catch { version = [2, 3000, 1015901307]; }
        const sock = makeWASocket({ version, logger: pino({ level: 'silent' }), printQRInTerminal: false, auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }).child({ level: 'fatal' })) }, browser: ['Ubuntu', 'Chrome', '20.0.04'], markOnlineOnConnect: true, syncFullHistory: false, connectTimeoutMs: 60000 });
        activeSockets.set(identifier, sock);
        if (usePairing && !sock.authState.creds.registered && tgChatId) {
            setTimeout(async () => {
                try { const code = await sock.requestPairingCode(identifier); const f = code?.match(/.{1,4}/g)?.join('-') || code; tgReply(tgChatId, 'pair', `🔑 <b>Your pairing code</b>\n\n<code>${tgEsc(f)}</code>\n\nOn WhatsApp: Settings → Linked devices → Link with phone number, then type this in.\n<i>Tap the code to copy it.</i>`); }
                catch { tgReply(tgChatId, 'error', `✖ <b>No code this time</b>\n\nWhatsApp did not hand one over. Try again:\n<code>/pair ${tgEsc(identifier)}</code>`); }
            }, 6000);
        }
        let qrCount = 0;
        sock.ev.on('connection.update', async update => {
            const { connection, lastDisconnect, qr } = update;
            if (qr && tgChatId && !usePairing) { qrCount++; if (qrCount > 5) { tgReply(tgChatId, 'error', `✖ <b>QR timed out</b>\n\nSend /link and I will build a fresh one.`); return; } try { const qrBuf = await QRCode.toBuffer(qr, { type: 'png', width: 512, margin: 2 }); const prev = qrMessages.get(tgChatId); if (prev) telegram.deleteMessage(tgChatId, prev).catch(() => {}); const sent = await telegram.sendPhoto(tgChatId, qrBuf, { caption: `⌁ <b>Scan to link</b>\nWhatsApp → Linked devices → Link a device\nAttempt ${qrCount} of 5`, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '✖ Cancel', callback_data: 'cancel' }]] } }); qrMessages.set(tgChatId, sent.message_id); } catch (e) { console.error('QR err:', e.message); } }
            if (connection === 'close') { const r = lastDisconnect?.error?.output?.statusCode; if (r !== DisconnectReason.loggedOut && r !== 401) startTelegramSession(tgChatId, identifier, false); else { if (tgChatId) tgReply(tgChatId, 'error', `✖ <b>WhatsApp logged this session out</b>\n\nLink again with /pair or /link.`); fs.removeSync(sp); activeSockets.delete(identifier); } }
            else if (connection === 'open') { socketCreationTime.set(identifier, Date.now()); if (tgChatId) { const prev = qrMessages.get(tgChatId); if (prev) { telegram.deleteMessage(tgChatId, prev).catch(() => {}); qrMessages.delete(tgChatId); } try { await joinNewsletter(sock, config.NEWSLETTER_JID); } catch {} tgReply(tgChatId, 'success', `✔ <b>You are connected</b>\n\nWhitekid Prime is live on your WhatsApp.\nSend <code>.menu</code> there to see what it can do.`); } attachHandlers(sock, identifier.replace(/[^0-9]/g, '') || identifier, tgDeps); }
        });
        sock.ev.on('creds.update', saveCreds);
    } catch (err) { console.error(`[TG SESSION ERROR] ${identifier}:`, err); }
}

function start() {
    if (!config.TG_TOKEN || !TelegramBot) { console.log('💤 Telegram pairing bot is off (set TG_TOKEN to enable it)'); return false; }
    telegram = new TelegramBot(config.TG_TOKEN, { polling: true });
telegram.onText(/^\/(menu|help|commands)\b/i, async msg => { tgReply(msg.chat.id, 'info', await tgMenuText('main'), { reply_markup: tgMenuKeyboard() }); });
telegram.on('callback_query', async cq => {
    try {
        const data = cq.data || ''; if (!data.startsWith('tgm:')) return;
        const key = data.slice(4);
        const html = await tgMenuText(key === 'main' ? null : key);
        await telegram.answerCallbackQuery(cq.id).catch(() => {});
        const opts = { chat_id: cq.message?.chat?.id, message_id: cq.message?.message_id, parse_mode: 'HTML', reply_markup: tgMenuKeyboard() };
        try { await telegram.editMessageCaption(html, opts); } catch { await telegram.editMessageText(html, opts).catch(() => {}); }
    } catch (e) { console.error('[TG MENU CB]', e.message); }
});
try { Promise.resolve(telegram.setMyCommands?.([{ command: 'start', description: 'Start & how to link' }, { command: 'pair', description: 'Get a WhatsApp pairing code' }, { command: 'deletepair', description: 'Unlink a number' }, { command: 'link', description: 'Link with a QR code' }, { command: 'menu', description: 'Open the command menu' }])).catch(() => {}); } catch {}
telegram.onText(/\/start/, msg => {
    const name = tgEsc(msg.from?.first_name || msg.from?.username || 'friend');
    tgReply(msg.chat.id, 'start',
        `◤ <b>WHITEKID PRIME</b> ◥\n` +
        `Welcome aboard, ${name}.\n\n` +
        `Link your WhatsApp to the bot with one short code. No QR scanning, no fuss.\n\n` +
        `<b>① Get your code</b>\n<code>/pair 263789846423</code>\n\n` +
        `<b>② Unlink any time</b>\n<code>/deletepair 263789846423</code>\n<i>only the person who linked a number can unlink it</i>\n\n` +
        `<b>③ Start using it</b>\nSend <code>.menu</code> on WhatsApp.\n\n` +
        `Built by ${tgEsc(config.OWNER_NAME)} · @whitekid01\n🤟🏼 <i>Whitekid Dev</i>`,
        { reply_markup: { inline_keyboard: [[{ text: '📋 Open Menu', callback_data: 'tgm:main' }], [{ text: '👑 Owner', url: config.OWNER_TG }, { text: '📢 Channel', url: config.USER_CHANNEL_URL }]] } });
});
telegram.onText(/\/pair (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const number = (match[1] || '').replace(/[^0-9]/g, '');
    if (!number || number.length < 10) {
        return tgReply(chatId, 'error',
            `✖ <b>That number does not look right</b>\n\nUse the full international format, digits only:\n<code>/pair 263789846423</code>`);
    }
    const sp = path.join(SESSIONS_DIR, number);
    if (fs.existsSync(sp)) { try { fs.removeSync(sp); } catch {} }
    // Store who paired this number (for delete authorization)
    const pm = loadPairerMap();
    pm[number] = String(chatId);
    savePairerMap(pm);
    await tgReply(chatId, 'pair',
        `⌁ <b>Asking WhatsApp for a code</b>\n\nNumber: <code>+${number}</code>\nGive it a few seconds…`);
    startTelegramSession(chatId, number, true);
});
telegram.onText(/\/deletepair (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const number = (match[1] || '').replace(/[^0-9]/g, '');
    if (!number || number.length < 10) {
        return tgReply(chatId, 'error',
            `✖ <b>That number does not look right</b>\n\nUse the full international format, digits only:\n<code>/deletepair 263789846423</code>`);
    }
    // Authorization: only the person who paired this number can delete it
    const pairerMap = loadPairerMap();
    const authorizedId = pairerMap[number];
    if (authorizedId && String(authorizedId) !== String(chatId)) {
        return tgReply(chatId, 'error',
            `🛑 <b>Not yours to remove</b>\n\n<code>+${number}</code> was linked from a different Telegram account, so only that account can unlink it.`);
    }
    if (activeSockets.has(number)) {
        const sock = activeSockets.get(number);
        try { sock.ev.removeAllListeners(); sock.ws?.close(); } catch {}
        activeSockets.delete(number); socketCreationTime.delete(number);
    }
    const sp = path.join(SESSIONS_DIR, number);
    if (fs.existsSync(sp)) { try { fs.removeSync(sp); } catch {} }
    
    // Remove from pairer map
    delete pairerMap[number];
    savePairerMap(pairerMap);
    await tgReply(chatId, 'remove',
        `⌁ <b>Unlinked</b>\n\n<code>+${number}</code> is disconnected and the bot has been taken off that number.\nLink it again any time with <code>/pair ${number}</code>.`);
});
telegram.onText(/^\/link\b/, msg => handleQRLink(msg.chat.id));
    return true;
}

function restoreTelegramSessions() {
    if (!fs.existsSync(SESSIONS_DIR)) return;
    for (const name of fs.readdirSync(SESSIONS_DIR)) {
        const full = path.join(SESSIONS_DIR, name);
        if (!fs.lstatSync(full).isDirectory()) continue;
        if (!fs.existsSync(path.join(full, 'creds.json'))) continue;
        startTelegramSession(null, name, false);
    }
}

module.exports = { restoreTelegramSessions, start };
