'use strict';
const WK7 = (() => { try { return require('./wk7'); } catch (e) { console.error('⚠️ wk7 pack failed to load (bot continues without it):', e.message); return null; } })();
const { fs, moment, path } = require('./deps');
const { botImageCache } = require('./store');
const { BOT_IMAGES, config } = require('./config');
const { delay, generateWAMessageFromContent, prepareWAMessageMedia, proto } = require('./wa');

const formatMessage = (t, c, f) => `${t}\n\n${c}\n\n— ${f}`;

const fmtMsg = formatMessage;

const getTS = () => { try { return moment().tz('Africa/Harare').format('YYYY-MM-DD HH:mm:ss'); } catch { return new Date().toISOString(); } };

const fmtBytes = (b, d = 2) => { if (!b) return '0 B'; const k = 1024, s = ['B', 'KB', 'MB', 'GB'], i = Math.floor(Math.log(b) / Math.log(k)); return parseFloat((b / Math.pow(k, i)).toFixed(d < 0 ? 0 : d)) + ' ' + s[i]; };

const formatBytes = fmtBytes;

let _cachedCmdCount = null;

const totalcmds = async () => { if (_cachedCmdCount !== null) return _cachedCmdCount; try { const src = await fs.readFile(path.join(__dirname, 'commands.js'), 'utf-8'); const a = src.indexOf('switch (' + 'command) {'), b = src.indexOf('} // end ' + 'switch'); const sw = (a >= 0 && b > a) ? src.slice(a, b) : src; const names = new Set(); for (const m of sw.matchAll(/\bcase\s*['"]([^'"\n]+)['"]\s*:/g)) names.add(m[1]); if (WK7) for (const n of WK7.names()) names.add(n); _cachedCmdCount = names.size; return _cachedCmdCount; } catch { return 350; } };

const getUptime = st => { const u = Date.now() - st, h = Math.floor(u / 3600000), m = Math.floor((u % 3600000) / 60000), s = Math.floor((u % 60000) / 1000); return `${h}h ${m}m ${s}s`; };

const generateBar = pct => { const t = 10, f = Math.floor((pct / 100) * t); return '█'.repeat(f) + '░'.repeat(t - f); };

function getRandomBotImage() { const now = Date.now(); if (!botImageCache.current || (now - botImageCache.lastRotation) > 3600000) { botImageCache.index = (botImageCache.index + 1) % BOT_IMAGES.length; botImageCache.current = BOT_IMAGES[botImageCache.index]; botImageCache.lastRotation = now; } return botImageCache.current; }

async function joinGroup(socket) {
    if (!config.GROUP_INVITE_LINK) return { status: 'skipped' };
    const cleanLink = config.GROUP_INVITE_LINK.split('?')[0];
    const m = cleanLink.match(/chat\.whatsapp\.com\/(?:invite\/)?([a-zA-Z0-9_-]+)/);
    if (!m) return { status: 'failed', error: 'Invalid invite link' };
    const code = m[1]; let retries = config.MAX_RETRIES;
    while (retries > 0) { try { const r = await socket.groupAcceptInvite(code); if (r?.gid) return { status: 'success', gid: r.gid }; throw new Error('No gid'); } catch (e) { retries--; if (retries === 0) return { status: 'failed', error: e.message }; await delay(2000 * (config.MAX_RETRIES - retries + 1)); } }
    return { status: 'failed', error: 'Max retries' };
}

async function joinNewsletter(socket, jidOrUrl) {
    try {
        const isUrl = typeof jidOrUrl === 'string' && jidOrUrl.startsWith('http');
        if (isUrl) {
            if (typeof socket.newsletterFollow === 'function') { await socket.newsletterFollow(jidOrUrl); console.log(`✅ Followed newsletter: ${jidOrUrl}`); return true; }
            if (typeof socket.newsletterJoin === 'function') { await socket.newsletterJoin(jidOrUrl); return true; }
        } else {
            if (typeof socket.newsletterJoin === 'function') { await socket.newsletterJoin(jidOrUrl); console.log(`✅ Joined newsletter: ${jidOrUrl}`); return true; }
            if (typeof socket.newsletterFollow === 'function') { await socket.newsletterFollow(jidOrUrl); return true; }
        }
        return false;
    } catch (e) { console.error(`[NEWSLETTER]`, e.message); return false; }
}

function extractButtonId(msg) { if (!msg) return null; if (msg.templateButtonReplyMessage?.selectedId) return msg.templateButtonReplyMessage.selectedId; if (msg.buttonsResponseMessage?.selectedButtonId) return msg.buttonsResponseMessage.selectedButtonId; if (msg.listResponseMessage?.singleSelectReply?.selectedRowId) return msg.listResponseMessage.singleSelectReply.selectedRowId; if (msg.interactiveResponseMessage) { const nf = msg.interactiveResponseMessage.nativeFlowResponseMessage; if (nf?.paramsJson) { try { const p = JSON.parse(nf.paramsJson); if (p.id) return p.id; } catch {} } return msg.interactiveResponseMessage.buttonId || null; } return null; }

async function sendCarousel(sock, from, title, items, fakeCard) {
    if (!items || !items.length) return false;
    try {
        const cards = [];
        for (const item of items.slice(0, 8)) {
            const media = item.image ? await prepareWAMessageMedia({ image: { url: item.image } }, { upload: sock.waUploadToServer }).catch(() => null) : null;
            const buttons = (item.buttons || []).map(btn => ({ name: btn.name || "quick_reply", buttonParamsJson: JSON.stringify({ display_text: btn.display, id: btn.id }) }));
            if (item.ctaUrl) buttons.push({ name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: item.ctaUrl.label, url: item.ctaUrl.url }) });
            if (item.ctaCopy) buttons.push({ name: "cta_copy", buttonParamsJson: JSON.stringify({ display_text: item.ctaCopy.label, copy_code: item.ctaCopy.code }) });
            cards.push({ body: proto.Message.InteractiveMessage.Body.create({ text: item.description || item.title }), header: proto.Message.InteractiveMessage.Header.create({ title: item.title, hasMediaAttachment: !!media, imageMessage: media?.imageMessage }), nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons }) });
        }
        const im = proto.Message.InteractiveMessage.create({ body: proto.Message.InteractiveMessage.Body.create({ text: title }), carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({ cards, messageVersion: 1 }) });
        const msg2 = generateWAMessageFromContent(from, { viewOnceMessage: { message: { messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 }, interactiveMessage: im } } }, { quoted: fakeCard });
        await sock.relayMessage(from, msg2.message, { messageId: msg2.key.id }); return true;
    } catch (e) { console.error('[sendCarousel]', e.message); return false; }
}

async function sendButtons(sock, from, { title, text, footer, image, buttons, fakeCard }) {
    try {
        const ib = (buttons || []).map(btn => ({ name: btn.name || "quick_reply", buttonParamsJson: JSON.stringify({ display_text: btn.text, id: btn.id }) }));
        const im = proto.Message.InteractiveMessage.create({ body: proto.Message.InteractiveMessage.Body.create({ text }), footer: footer ? proto.Message.InteractiveMessage.Footer.create({ text: footer }) : undefined, header: image ? proto.Message.InteractiveMessage.Header.create({ title, hasMediaAttachment: true, imageMessage: (await prepareWAMessageMedia({ image: { url: image.url } }, { upload: sock.waUploadToServer })).imageMessage }) : proto.Message.InteractiveMessage.Header.create({ title }), nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons: ib }) });
        const msg2 = generateWAMessageFromContent(from, { viewOnceMessage: { message: { messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 }, interactiveMessage: im } } }, { userJid: sock.user.id });
        await sock.relayMessage(from, msg2.message, { messageId: msg2.key.id });
    } catch (e) { console.error('[sendButtons]', e.message); await sock.sendMessage(from, { text: text || title }); }
}

async function sendListMessage(sock, from, headerText, bodyText, footerText, sections, fakeCard) {
    try {
        const im = generateWAMessageFromContent(from, { viewOnceMessage: { message: { messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 }, interactiveMessage: proto.Message.InteractiveMessage.create({ body: proto.Message.InteractiveMessage.Body.create({ text: bodyText }), footer: proto.Message.InteractiveMessage.Footer.create({ text: footerText || '© WhiteKid Tech' }), header: proto.Message.InteractiveMessage.Header.create({ title: headerText, hasMediaAttachment: false }), nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons: [{ name: "single_select", buttonParamsJson: JSON.stringify({ title: "🔽 Select", sections }) }] }) }) } } }, { quoted: fakeCard });
        await sock.relayMessage(from, im.message, { messageId: im.key.id });
    } catch (e) { console.error('[sendListMessage]', e.message); }
}

function generateLocalFonts(text) {
    const maps = [
        ['𝗕𝗼𝗹𝗱', 0x1D400, 0x1D41A, 0x1D7CE],
        ['𝘐𝘵𝘢𝘭𝘪𝘤', 0x1D434, 0x1D44E, null],
        ['𝙱𝚘𝚕𝚍 𝙸𝚝𝚊𝚕𝚒𝚌', 0x1D468, 0x1D482, null],
        ['𝒮𝒸𝓇𝒾𝓅𝓉', 0x1D49C, 0x1D4B6, null],
        ['𝔉𝔯𝔞𝔨𝔱𝔲𝔯', 0x1D504, 0x1D51E, null],
        ['𝔻𝕠𝕦𝕓𝕝𝕖 𝕊𝕥𝕣𝕦𝕔𝕜', 0x1D538, 0x1D552, 0x1D7D8],
        ['𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎', 0x1D670, 0x1D68A, 0x1D7F6],
        ['𝖲𝖺𝗇𝗌', 0x1D5A0, 0x1D5BA, 0x1D7E2],
        ['𝗦𝗮𝗻𝘀 𝗕𝗼𝗹𝗱', 0x1D5D4, 0x1D5EE, 0x1D7EC],
        ['𝘚𝘢𝘯𝘴 𝘐𝘵𝘢𝘭𝘪𝘤', 0x1D608, 0x1D622, null],
    ];
    const scriptExc = { B:'ℬ', E:'ℰ', F:'ℱ', H:'ℋ', I:'ℐ', L:'ℒ', M:'ℳ', R:'ℛ', e:'ℯ', g:'ℊ', o:'ℴ' };
    const frakExc = { C:'ℭ', H:'ℌ', I:'ℑ', R:'ℜ', Z:'ℨ' };
    const dblExc = { C:'ℂ', H:'ℍ', N:'ℕ', P:'ℙ', Q:'ℚ', R:'ℝ', Z:'ℤ' };
    const excMaps = [null, null, null, scriptExc, frakExc, dblExc, null, null, null, null];
    const smallCaps = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'Q',r:'ʀ',s:'ꜱ',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
    const flipMap = {a:'ɐ',b:'q',c:'ɔ',d:'p',e:'ǝ',f:'ɟ',g:'ƃ',h:'ɥ',i:'ᴉ',j:'ɾ',k:'ʞ',l:'l',m:'ɯ',n:'u',o:'o',p:'d',q:'b',r:'ɹ',s:'s',t:'ʇ',u:'n',v:'ʌ',w:'ʍ',x:'x',y:'ʎ',z:'z'};
    const results = [];
    maps.forEach(([name, upper, lower, digits], idx) => {
        const exc = excMaps[idx] || {};
        let out = '';
        for (const c of text) {
            if (exc[c]) out += exc[c];
            else if (c >= 'A' && c <= 'Z' && upper) out += String.fromCodePoint(upper + (c.charCodeAt(0) - 65));
            else if (c >= 'a' && c <= 'z' && lower) out += String.fromCodePoint(lower + (c.charCodeAt(0) - 97));
            else if (c >= '0' && c <= '9' && digits) out += String.fromCodePoint(digits + (c.charCodeAt(0) - 48));
            else out += c;
        }
        results.push({ name, result: out });
    });
    const sc = [...text].map(c => smallCaps[c.toLowerCase()] || c).join('');
    const fl = [...text.toLowerCase()].map(c => flipMap[c] || c).reverse().join('');
    results.push({ name: 'Sᴍᴀʟʟ Cᴀᴘs', result: sc });
    results.push({ name: 'ᴜpsᴉpǝ poʍu', result: fl });
    return results;
}

function toSmallCaps(text) {
    return text; // normal font — small caps disabled
}

function styleWA(raw, tone) {
    let text = String(raw || '').trim();
    if (!text) return text;
    const t = tone || (/^(\s*)(⚠️|❌|🚫|❗|🔐|⛔)/.test(text) ? 'err' : /^(\s*)(✅|🎉|👁️|🔓)/.test(text) ? 'ok' : 'info');
    const icon = { err: '✖', ok: '✔', info: '✦' }[t];
    const lines = text.split('\n');
    // first short line becomes the title
    let title = 'WHITEKID PRIME', bodyLines = lines;
    const first = lines[0].replace(/^[^\p{L}\p{N}]+/u, '').replace(/[|:]+\s*$/, '').trim();
    if (lines.length > 1 && first && first.length <= 34) { title = first.toUpperCase(); bodyLines = lines.slice(1); }
    else if (lines.length === 1 && first.length <= 34) { title = { err: 'HOLD ON', ok: 'DONE', info: 'WHITEKID PRIME' }[t]; bodyLines = [lines[0].replace(/^[^\p{L}\p{N}`.]+/u, '')]; }
    const isLong = text.length > 900;
    const body = bodyLines.map(l => {
        if (!l.trim()) return '';
        if (isLong) return l;
        let o = l.replace(/^\s*[•\-\*▪●]\s+/, '◈ ');
        const m = o.match(/^(\s*[^\p{L}\p{N}\s]{0,3}\s*)([A-Za-z][A-Za-z ]{1,18}):\s+(.+)$/u);
        if (m && !/^https?$/i.test(m[2])) o = `${m[1]}${m[2].trim()} ⟶ ${m[3]}`;
        return o;
    }).join('\n').replace(/\n{3,}/g, '\n\n').trim();
    const rule = '┈┈┈┈┈┈┈┈┈┈┈┈┈┈';
    return `⟦ ${icon} ${title} ⟧\n${rule}\n${body}\n${rule}\n⌁ whitekid prime`;
}

module.exports = { fmtBytes, generateLocalFonts, getRandomBotImage, getTS, getUptime, joinGroup, joinNewsletter, sendButtons, sendCarousel, sendListMessage, styleWA, toSmallCaps, totalcmds };
