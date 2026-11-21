'use strict';
const { getRandomBotImage, getTS, sendButtons, sendCarousel, styleWA, toSmallCaps, totalcmds } = require('./helpers');
const { downloadContentFromMessage, getContentType } = require('./wa');
const { getCustomPrefix, isAiEnabled, isAutoAddOn, isAutoRead, isAutoRecord, isBanned, isDeveloper, isPairedOwner, isPublicMode, loadAD, loadSS, messageStore, presenceTracker } = require('./store');
const { AI_SHORT_NAME, WM, config } = require('./config');
const { askGrok, transcribeAudio } = require('./services');
const { axios, chalk, fs } = require('./deps');
const { handleGoodbye, handleLinkDetection, handleMessageRevocation, handlePromotionEvent, handleStatusUpdate, handleWelcome, startScheduler, storeMsg } = require('./events');
const { runCommand } = require('./commands');

function wrapSend(socket) {
    if (!socket._scWrapped) {
        socket._scWrapped = true;
        const _origSend = socket.sendMessage.bind(socket);
        socket.sendMessage = async (jid, content, opts) => {
            if (content && typeof content === 'object') {
                const c = { ...content };
                if (typeof c.text === 'string') c.text = toSmallCaps(c.text);
                if (typeof c.caption === 'string') c.caption = toSmallCaps(c.caption);
                return _origSend(jid, c, opts);
            }
            return _origSend(jid, content, opts);
        };
    }
}

async function handleMessage(socket, number, msg, deps) {
    const { requestPairing, endSession } = deps;
    try {
    if (!msg?.message || msg.key.remoteJid === 'status@broadcast') return;
                const type = getContentType(msg.message);
                if (!type) return;
                if (type === 'ephemeralMessage') msg.message = msg.message.ephemeralMessage.message;
    
                const sn = number.replace(/[^0-9]/g, '');
                const ss = loadSS(sn);
                const activePrefix = getCustomPrefix();
                const botImg = getRandomBotImage();
    
                const makeCtx = (mentionedJid = []) => ({ mentionedJid, groupMentions: [] });
    
                const fakeCard = { key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' }, message: { contactMessage: { displayName: `© ${AI_SHORT_NAME} ✅`, vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${AI_SHORT_NAME}\nORG:WhiteKid Tech;\nTEL;type=CELL;waid=${config.OWNER_NUMBERS[0]}:+${config.OWNER_NUMBERS[0]}\nEND:VCARD` } } };
    
                const reply = async (text, mentions = []) => { try {
                // Clean formatting — strip borders, bold, italic, blockquote
                const _lines = (text || '').split('\n');
                const _cleaned = _lines
                    .filter(l => !l.includes('━━━━━━━━━━━━━'))
                    .map(l => l.replace(/^\*┃\*\s?/, '').replace(/\*([^*\n]+)\*/g, '$1').replace(/_([^_\n]+)_/g, '$1').replace(/^> /, ''))
                    .join('\n').replace(/\n{3,}/g, '\n\n').trim();
                await socket.sendMessage(msg.key.remoteJid, { text: styleWA(_cleaned) + WM, contextInfo: makeCtx(mentions) }, { quoted: fakeCard });
            } catch (e) { console.error('[REPLY]', e.message); } };
                const replyImg = async (imgUrl, caption, mentions = [], rawMenu = false) => { try { let _cap = (caption || '').replace(/\*([^*\n]+)\*/g, '$1').replace(/_([^_\n]+)_/g, '$1').replace(/^> /gm, ''); if (!rawMenu) _cap = styleWA(_cap); await socket.sendMessage(msg.key.remoteJid, { image: { url: imgUrl }, caption: _cap + WM, contextInfo: makeCtx(mentions) }, { quoted: fakeCard }); } catch (e) { console.error('[REPLYIMG]', e.message); await reply(caption, mentions); } };
                const react = async emoji => { try { await socket.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } }); } catch {} };
                const replyWithVoice = async (text, imgUrl = null) => { if (imgUrl) await replyImg(imgUrl, text); else await reply(text); }; // voice removed
    
                const replyCarousel = async (titleText, items) => { return await sendCarousel(socket, msg.key.remoteJid, titleText, items, fakeCard); };
                const replyButtons = async (opts) => { return await sendButtons(socket, msg.key.remoteJid, { ...opts, fakeCard }); };
    
                const from = msg.key.remoteJid;
                const nowsender = msg.key.fromMe ? ((socket.user?.id?.split(':')[0] || '') + '@s.whatsapp.net') : (msg.key.participant || msg.key.remoteJid);
                const senderNumber = nowsender.split('@')[0].replace(/[^0-9]/g, '');
                const botNumber = (socket.user?.id?.split(':')[0] || '').replace(/[^0-9]/g, '');
    
                const isDevOverride = isDeveloper(senderNumber);
                const isOwner = msg.key.fromMe || isPairedOwner(senderNumber, botNumber, config.OWNER_NUMBERS) || isDevOverride;
                const isGroup = from.endsWith('@g.us');
    
                if (!isOwner && !isDevOverride && isBanned(senderNumber)) { await reply('🚫 You are banned from using this bot.'); return; }
                if (!isOwner && !isDevOverride && !isPublicMode() && !isGroup) return; // groups always active
    
                const senderDisplayName = msg.pushName || nowsender.split('@')[0];
    
                // ─── AUDIO / VOICE HANDLER ────────────────────────────────────────
                if ((type === 'audioMessage' || type === 'pttMessage') && !msg.key.fromMe) {
                    if (!isOwner && !isDevOverride && !isAiEnabled()) return;
                    try {
                        await react('🎙️');
                        const audioMsg = msg.message.audioMessage || msg.message.pttMessage;
                        const mimeType = audioMsg?.mimetype || 'audio/ogg; codecs=opus';
                        const stream = await downloadContentFromMessage(audioMsg, 'audio');
                        let audioBuf = Buffer.from([]); for await (const chunk of stream) audioBuf = Buffer.concat([audioBuf, chunk]);
                        if (audioBuf.length < 100) { await reply(`🎙️ Audio seems empty. Try again.`); return; }
                        await reply(`🎙️ _Processing your audio, ${senderDisplayName}..._`);
                        const transcript = await transcribeAudio(audioBuf, mimeType);
                        if (!transcript) { await replyWithVoice(`Sorry ${senderDisplayName}, couldn't transcribe. Please type instead.`); return; }
                        await reply(`📝 *Transcribed:* _"${transcript}"_`);
                        const aiResponse = await askGrok(`${transcript} [Context: Voice message. Respond as ${AI_SHORT_NAME}.]`);
                        if (aiResponse) await replyWithVoice(aiResponse);
                        else await replyWithVoice(`I heard you, ${senderDisplayName}, but couldn't respond right now.`);
                    } catch (e) { console.error('[AUDIO HANDLER]', e.message); await reply(`⚠️ Audio processing failed. Please type instead.`); }
                    return;
                }
    
                // ─── EXTRACT BODY ─────────────────────────────────────────────────
                let body = '';
                try {
                    if (type === 'conversation') body = msg.message.conversation || '';
                    else if (type === 'extendedTextMessage') body = msg.message.extendedTextMessage?.text || '';
                    else if (type === 'imageMessage') body = msg.message.imageMessage?.caption || '';
                    else if (type === 'videoMessage') body = msg.message.videoMessage?.caption || '';
                    else if (type === 'buttonsResponseMessage') body = msg.message.buttonsResponseMessage?.selectedButtonId || '';
                    else if (type === 'listResponseMessage') body = msg.message.listResponseMessage?.singleSelectReply?.selectedRowId || '';
                    else if (type === 'templateButtonReplyMessage') body = msg.message.templateButtonReplyMessage?.selectedId || '';
                    else if (type === 'interactiveResponseMessage') { const pj = msg.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson; body = pj ? (JSON.parse(pj)?.id || '') : ''; }
                } catch { body = ''; }
    
                if (!body || !body.trim()) return;
    
                // ─── APK INTERACTIVE REPLY ────────────────────────────────────────
                if (global.apkSessionStore.has(from)) {
                    const sess = global.apkSessionStore.get(from);
                    if (sess.userId === nowsender) {
                        const choice = parseInt(body.trim(), 10);
                        if (!isNaN(choice) && choice >= 1 && choice <= (sess.results?.length || 0)) {
                            clearTimeout(sess.timeout); global.apkSessionStore.delete(from);
                            const selected = sess.results[choice - 1];
                            await react('⬇️'); await socket.sendMessage(from, { text: `⬇️ Downloading *${selected.judul || selected.name}*...\n⏱ Please wait...` }, { quoted: msg });
                            try { const dlUrl = `${config.DISCARD_API}/api/apk/dl/android1?apikey=guru&url=${encodeURIComponent(selected.link || selected.url)}`; const { data: dlRes } = await axios.get(dlUrl, { timeout: 60000 }); const apk = dlRes?.result; if (!apk?.url) throw new Error('No APK URL'); const safeName = (apk.name || 'app').replace(/[^\w.-]/g, '_'); const cap = `📦 *${apk.name}*\n⭐ ${apk.rating || 'N/A'}\n📦 ${apk.size || 'N/A'}\n📱 ${apk.requirement || 'N/A'}\n📅 ${apk.published || 'N/A'}`; await socket.sendMessage(from, { document: { url: apk.url }, fileName: `${safeName}.apk`, mimetype: 'application/vnd.android.package-archive', caption: cap + WM }, { quoted: fakeCard }); await react('✅'); } catch (e) { await reply(`⚠️ APK download failed: ${e.message}`); }
                            return;
                        }
                    }
                }
    
                // ─── ANTILINK ─────────────────────────────────────────────────────
                if (isGroup) {
                    const isAdmin2 = await (async () => { try { const m2 = await socket.groupMetadata(from); const p2 = m2.participants.find(p => p.id === nowsender); return p2?.admin === 'admin' || p2?.admin === 'superadmin'; } catch { return false; } })();
                    await handleLinkDetection(socket, from, msg, body, nowsender, isAdmin2, isOwner || isDevOverride);
                }
    
                const isCmd = body.startsWith(activePrefix) || body.startsWith('#') || body.startsWith('/');
                const rawCmd = isCmd ? body.slice(1).trim().split(/\s+/)[0].toLowerCase() : '';
                const command = rawCmd === '8ball' ? 'eightball' : rawCmd;
                const args = body.trim().split(/\s+/).slice(1);
                const q = args.join(' ').trim();
    
                async function isGroupAdmin(jid, user) { try { const m3 = await socket.groupMetadata(jid); const p3 = m3.participants.find(p => p.id === user); return p3?.admin === 'admin' || p3?.admin === 'superadmin' || false; } catch { return false; } }
                const isSenderGroupAdmin = isGroup ? await isGroupAdmin(from, nowsender) : false;
    
                // ─── PREFIXLESS AI AUTO-REPLY — DISABLED (use .ai command) ─────────
                if (!isCmd && !msg.key.fromMe && body.trim()) {
                    return; // AI only responds to explicit .ai command
                }
                if (!isCmd || !command) return;
    
                const count = await totalcmds();
                startScheduler(socket);
        await runCommand({ activePrefix, args, body, botImg, command, count, fakeCard, from, isDevOverride, isGroup, isOwner, isSenderGroupAdmin, msg, nowsender, number, q, react, reply, replyCarousel, replyImg, senderDisplayName, senderNumber, sn, socket, requestPairing, endSession });
    } catch (err) {

            console.error(chalk.red('Command error:'), err);
            try { const _errJid = msg?.key?.remoteJid; if (_errJid) await socket.sendMessage(_errJid, { image: { url: config.RCD_IMAGE_PATH }, caption: `⚠️ An error occurred.\n${err.message || ''}${WM}` }); } catch {}
        
    }
}

function attachHandlers(socket, number, deps) {
    wrapSend(socket);
    socket.ev.on('messages.upsert', async ({ messages }) => { const msg = messages[0]; if (!msg?.key || msg.key.remoteJid === 'status@broadcast') return; try { if (isAutoRecord()) { try { await socket.sendPresenceUpdate('recording', msg.key.remoteJid); } catch {} } if (isAutoRead() && !msg.key.fromMe) { try { await socket.readMessages([msg.key]); } catch {} } } catch {} });
    socket.ev.on('messages.upsert', async ({ messages }) => { for (const m of messages) { try { await storeMsg(socket, m); } catch {} } });
    socket.ev.on('messages.upsert', async ({ messages }) => { for (const m of messages) { if (m.message?.protocolMessage?.type === 0) try { await handleMessageRevocation(socket, m); } catch {} } });
    socket.ev.on('messages.delete', async ({ keys }) => { const cfg = loadAD(); if (!cfg.enabled || !keys?.length) return; const k = keys[0]; const orig = messageStore.get(k.id); if (!orig) return; const ownerJid = socket.user?.id?.split(':')[0] + '@s.whatsapp.net'; try { await socket.sendMessage(ownerJid, { image: { url: config.RCD_IMAGE_PATH }, caption: `🗑️ *DELETED*\nFrom: ${orig.sender}\nTime: ${getTS()}${orig.content ? `\n\nMessage: ${orig.content}` : ''}${WM}` }); if (orig.mediaType && orig.mediaPath && fs.existsSync(orig.mediaPath)) { if (orig.mediaType === 'image') await socket.sendMessage(ownerJid, { image: { url: orig.mediaPath }, caption: 'Deleted media' + WM }); else if (orig.mediaType === 'video') await socket.sendMessage(ownerJid, { video: { url: orig.mediaPath }, caption: 'Deleted media' + WM }); try { fs.unlinkSync(orig.mediaPath); } catch {} } } catch {} messageStore.delete(k.id); });
    socket.ev.on('messages.upsert', async ({ messages }) => { for (const m of messages) { if (m.key?.remoteJid === 'status@broadcast') try { await handleStatusUpdate(socket, m); } catch {} } });
    socket.ev.on('group-participants.update', async (update) => { const { id, participants, action, author } = update; if (action === 'add') { try { const gm = await socket.groupMetadata(id); await handleWelcome(socket, id, participants, gm); } catch (e) { console.error('Welcome error:', e); } } else if (action === 'promote') { await handlePromotionEvent(socket, id, participants, author); } else if (action === 'remove' || action === 'leave') { try { const gm = await socket.groupMetadata(id); await handleGoodbye(socket, id, participants, gm); } catch (e) { console.error('Goodbye error:', e); } try { if (await isAutoAddOn(id)) { for (const jid of participants) { try { await socket.groupParticipantsUpdate(id, [jid], 'add'); } catch {} } } } catch {} } });
    socket.ev.on('presence.update', ({ id, presences }) => { for (const [jid, pr] of Object.entries(presences || {})) { if (['available','composing','recording'].includes(pr.lastKnownPresence)) presenceTracker.set(jid, Date.now()); } });
    socket.ev.on('messages.upsert', async ({ messages }) => {
        for (const m of messages || []) {
            try { await handleMessage(socket, number, m, deps); }
            catch (err) { console.error('Message handler error:', err); }
        }
    });
}

module.exports = { attachHandlers };
