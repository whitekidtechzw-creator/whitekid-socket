'use strict';
const { SCHEDULES_PATH, TEMP_MEDIA_DIR, games, getAntilink, getAutoStatus, getGoodbye, getWelcome, isGoodbyeOn, isWelcomeOn, loadAD, messageStore } = require('./store');
const { delay, downloadContentFromMessage, generateWAMessageFromContent, prepareWAMessageMedia } = require('./wa');
const { fs, path } = require('./deps');

let _schedulerStarted = false;

async function storeMsg(socket, message) {
    const cfg = loadAD(); if (!cfg.enabled || !message.key?.id) return;
    const mid = message.key.id; let content = '', mediaType = '', mediaPath = '';
    const sender = message.key.participant || message.key.remoteJid;
    try {
        const voContainer = message.message?.viewOnceMessageV2?.message || message.message?.viewOnceMessage?.message;
        if (voContainer) {
            let vType = null, vMsg = null;
            if (voContainer.imageMessage) { vType = 'image'; vMsg = voContainer.imageMessage; }
            else if (voContainer.videoMessage) { vType = 'video'; vMsg = voContainer.videoMessage; }
            if (vType && vMsg) {
                mediaType = vType; content = vMsg.caption || '';
                const stream = await downloadContentFromMessage(vMsg, vType); let buf = Buffer.from([]); for await (const c of stream) buf = Buffer.concat([buf, c]);
                mediaPath = path.join(TEMP_MEDIA_DIR, `${mid}.${vType === 'image' ? 'jpg' : 'mp4'}`); fs.writeFileSync(mediaPath, buf);
                const ownerJid = `${socket.user.id.split(':')[0]}@s.whatsapp.net`;
                const opts = { caption: `*Anti-ViewOnce ${vType}*\nFrom: @${sender.split('@')[0]}`, mentions: [sender] };
                try { if (vType === 'image') await socket.sendMessage(ownerJid, { image: { url: mediaPath }, ...opts }); else await socket.sendMessage(ownerJid, { video: { url: mediaPath }, ...opts }); } catch {}
                try { fs.unlinkSync(mediaPath); } catch {}
            }
        } else if (message.message?.conversation) content = message.message.conversation;
        else if (message.message?.extendedTextMessage?.text) content = message.message.extendedTextMessage.text;
        else if (message.message?.imageMessage) {
            mediaType = 'image'; content = message.message.imageMessage.caption || '';
            try { const s = await downloadContentFromMessage(message.message.imageMessage, 'image'); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]); mediaPath = path.join(TEMP_MEDIA_DIR, `${mid}.jpg`); fs.writeFileSync(mediaPath, b); } catch {}
        } else if (message.message?.videoMessage) {
            mediaType = 'video'; content = message.message.videoMessage.caption || '';
            try { const s = await downloadContentFromMessage(message.message.videoMessage, 'video'); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]); mediaPath = path.join(TEMP_MEDIA_DIR, `${mid}.mp4`); fs.writeFileSync(mediaPath, b); } catch {}
        } else if (message.message?.audioMessage) {
            mediaType = 'audio';
            try { const s = await downloadContentFromMessage(message.message.audioMessage, 'audio'); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]); mediaPath = path.join(TEMP_MEDIA_DIR, `${mid}.ogg`); fs.writeFileSync(mediaPath, b); } catch {}
        } else if (message.message?.stickerMessage) {
            mediaType = 'sticker';
            try { const s = await downloadContentFromMessage(message.message.stickerMessage, 'sticker'); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]); mediaPath = path.join(TEMP_MEDIA_DIR, `${mid}.webp`); fs.writeFileSync(mediaPath, b); } catch {}
        }
        messageStore.set(mid, { content, mediaType, mediaPath, sender, group: message.key.remoteJid?.endsWith('@g.us') ? message.key.remoteJid : null, timestamp: new Date().toISOString() });
    } catch (err) { console.error('storeMessage error:', err); }
}

async function handleMessageRevocation(sock, message) {
    try {
        const cfg = loadAD(); if (!cfg.enabled) return;
        const messageId = message.message?.protocolMessage?.key?.id; if (!messageId) return;
        const deletedBy = message.participant || message.key?.participant || message.key?.remoteJid;
        const ownerJid = `${sock.user.id.split(':')[0]}@s.whatsapp.net`;
        if (deletedBy?.includes(sock.user.id) || deletedBy === ownerJid) return;
        const original = messageStore.get(messageId); if (!original) return;
        const senderName = original.sender?.split('@')[0] || '?';
        let grpName = ''; try { if (original.group) { const gm = await sock.groupMetadata(original.group); grpName = gm.subject; } } catch {}
        const time = new Date().toLocaleString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
        let txt = `*🔰 ANTIDELETE REPORT 🔰*\n\n*🗑️ Deleted By:* @${deletedBy?.split('@')[0]}\n*👤 Sender:* @${senderName}\n*📱 Number:* ${original.sender}\n*🕒 Time:* ${time}${grpName ? `\n*👥 Group:* ${grpName}` : ''}`;
        if (original.content) txt += `\n\n*💬 Message:*\n${original.content}`;
        await sock.sendMessage(ownerJid, { text: txt, mentions: [deletedBy, original.sender].filter(Boolean) });
        if (original.mediaType && original.mediaPath && fs.existsSync(original.mediaPath)) {
            const opts = { caption: `*Deleted ${original.mediaType}*\nFrom: @${senderName}`, mentions: [original.sender] };
            try { switch (original.mediaType) { case 'image': await sock.sendMessage(ownerJid, { image: { url: original.mediaPath }, ...opts }); break; case 'video': await sock.sendMessage(ownerJid, { video: { url: original.mediaPath }, ...opts }); break; case 'audio': await sock.sendMessage(ownerJid, { audio: { url: original.mediaPath }, mimetype: 'audio/mpeg', ptt: false, ...opts }); break; case 'sticker': await sock.sendMessage(ownerJid, { sticker: { url: original.mediaPath }, ...opts }); break; } } catch {}
            try { fs.unlinkSync(original.mediaPath); } catch {}
        }
        messageStore.delete(messageId);
    } catch (err) { console.error('handleMessageRevocation error:', err); }
}

async function handleStatusUpdate(sock, update) {
    try {
        const cfg = getAutoStatus(); if (!cfg.enabled) return;
        const keys = [];
        if (update.messages?.length) for (const m of update.messages) { if (m.key?.remoteJid === 'status@broadcast') keys.push(m.key); }
        if (update.key?.remoteJid === 'status@broadcast') keys.push(update.key);
        for (const k of keys) { try { await delay(500); await sock.readMessages([k]); if (cfg.reactOn) { try { await sock.sendMessage('status@broadcast', { react: { text: '💚', key: k } }); } catch {} } } catch (e) { if (e.message?.includes('rate-overlimit')) await delay(2000); } }
    } catch (e) { console.error('[AUTO STATUS]', e.message); }
}

async function loadSchedules() { try { return fs.existsSync(SCHEDULES_PATH) ? JSON.parse(fs.readFileSync(SCHEDULES_PATH, 'utf8')) : []; } catch { return []; } }

async function saveSchedules(data) { fs.writeFileSync(SCHEDULES_PATH, JSON.stringify(data, null, 2)); }

function generateId() { return Math.random().toString(36).substring(2, 7).toUpperCase(); }

function parseTime(input) { const now = new Date(); const rm = input.match(/^(?:(\d+)h)?(?:(\d+)m)?$/i); if (rm && (rm[1] || rm[2])) { const h = parseInt(rm[1] || '0'), mn = parseInt(rm[2] || '0'); if (h === 0 && mn === 0) return null; return new Date(now.getTime() + (h * 60 + mn) * 60 * 1000); } const cm = input.match(/^(\d{1,2}):(\d{2})(am|pm)?$/i); if (cm) { let h = parseInt(cm[1]), mn2 = parseInt(cm[2]), mer = cm[3]?.toLowerCase(); if (mer === 'pm' && h < 12) h += 12; if (mer === 'am' && h === 12) h = 0; const t = new Date(now); t.setHours(h, mn2, 0, 0); if (t.getTime() <= now.getTime()) t.setDate(t.getDate() + 1); return t; } return null; }

function formatTimeLeft(ms) { if (ms <= 0) return 'now'; const ts = Math.floor(ms / 1000), h = Math.floor(ts / 3600), m = Math.floor((ts % 3600) / 60), s = ts % 60; const p = []; if (h) p.push(`${h}h`); if (m) p.push(`${m}m`); if (s || !p.length) p.push(`${s}s`); return p.join(' '); }

function startScheduler(sock) { if (_schedulerStarted) return; _schedulerStarted = true; setInterval(async () => { try { const now = Date.now(), sched = await loadSchedules(); const rem = []; let ch = false; for (const item of sched) { if (now >= item.sendAt) { try { await sock.sendMessage(item.chatId, { text: item.message }); console.log(`[SCHEDULE] ✅ Sent ID:${item.id}`); } catch (e) { console.error(`[SCHEDULE] Failed:`, e.message); } ch = true; } else rem.push(item); } if (ch) await saveSchedules(rem); } catch (e) { console.error('[SCHEDULE] Error:', e.message); } }, 10000); }

class TicTacToeGame { constructor(pX, pO) { this.playerX = pX; this.playerO = pO; this.board = Array(9).fill(null); this.currentTurn = pX; this.winner = null; this.turns = 0; } turn(player, pos) { if (this.winner || player !== this.currentTurn || this.board[pos] !== null) return false; this.board[pos] = player === this.playerX ? 'X' : 'O'; this.turns++; this.checkWinner(); if (!this.winner) this.currentTurn = this.currentTurn === this.playerX ? this.playerO : this.playerX; return true; } checkWinner() { const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]; for (const [a, b, c] of lines) { if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) { this.winner = this.board[a] === 'X' ? this.playerX : this.playerO; return; } } if (this.turns === 9) this.winner = 'draw'; } render() { return this.board.map(c => c || ' '); } }

async function handleTicTacToeMove(sock, chatId, senderId, text) { try { const room = Object.values(games).find(r => r.id.startsWith('tictactoe') && [r.game.playerX, r.game.playerO].includes(senderId) && r.state === 'PLAYING'); if (!room) return; const isSurrender = /^(surrender|give up)$/i.test(text); if (!isSurrender && !/^[1-9]$/.test(text)) return; if (senderId !== room.game.currentTurn && !isSurrender) { await sock.sendMessage(chatId, { text: '⚠️ Not your turn!' }); return; } const ok = isSurrender ? true : room.game.turn(senderId, parseInt(text, 10) - 1); if (!ok) { await sock.sendMessage(chatId, { text: '⚠️ Invalid move!' }); return; } let winner = room.game.winner; const isTie = room.game.turns === 9; const arr = room.game.render().map((v, i) => v === ' ' ? (i + 1).toString() : v).map(v => ({ 'X': '❎', 'O': '⭕', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣', '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣' }[v] || v)); if (isSurrender) { winner = senderId === room.game.playerX ? room.game.playerO : room.game.playerX; await sock.sendMessage(chatId, { text: `🏳️ @${senderId.split('@')[0]} surrendered! @${winner.split('@')[0]} wins!`, mentions: [senderId, winner] }); delete games[room.id]; return; } let gs; if (winner && winner !== 'draw') gs = `🎉 @${winner.split('@')[0]} wins!`; else if (isTie || winner === 'draw') gs = `🤝 Draw!`; else gs = `🎲 Turn: @${room.game.currentTurn.split('@')[0]}`; const str = `🎮 *TicTacToe*\n\n${gs}\n\n${arr.slice(0, 3).join('')}\n${arr.slice(3, 6).join('')}\n${arr.slice(6).join('')}\n\n▢ ❎: @${room.game.playerX.split('@')[0]}\n▢ ⭕: @${room.game.playerO.split('@')[0]}\n\n${!winner && !isTie ? 'Type 1-9 or *surrender*' : ''}`; await sock.sendMessage(chatId, { text: str, mentions: [room.game.playerX, room.game.playerO] }); if (winner || isTie) delete games[room.id]; } catch (e) { console.error('Tictactoe:', e); } }

async function handleLinkDetection(sock, chatId, message, userMessage, senderId, isGroupAdmin, isOwner) { try { const al = await getAntilink(chatId); if (!al.enabled || isOwner || isGroupAdmin) return; const lp = { wag: /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/i, wac: /wa\.me\/channel\/[A-Za-z0-9]{20,}/i, tg: /t\.me\/[A-Za-z0-9_]+/i, all: /https?:\/\/\S+|www\.\S+/i }; let shouldAct = false, linkType = ''; if (lp.wag.test(userMessage)) { shouldAct = true; linkType = 'WhatsApp Group'; } else if (lp.wac.test(userMessage)) { shouldAct = true; linkType = 'WhatsApp Channel'; } else if (lp.tg.test(userMessage)) { shouldAct = true; linkType = 'Telegram'; } else if (lp.all.test(userMessage)) { shouldAct = true; linkType = 'Link'; } if (!shouldAct) return; const action = al.action || 'delete'; if (action === 'delete' || action === 'kick') { try { await sock.sendMessage(chatId, { delete: { remoteJid: chatId, fromMe: false, id: message.key.id, participant: senderId } }); } catch {} } if (action === 'warn' || action === 'delete') { await sock.sendMessage(chatId, { text: `⚠️ *Antilink Warning*\n\n@${senderId.split('@')[0]}, posting ${linkType} links is not allowed!`, mentions: [senderId] }); } if (action === 'kick') { try { await sock.groupParticipantsUpdate(chatId, [senderId], 'remove'); await sock.sendMessage(chatId, { text: `🚫 @${senderId.split('@')[0]} removed for posting ${linkType} links.`, mentions: [senderId] }); } catch {} } } catch (e) { console.error('Antilink:', e); } }

async function handleWelcome(sock, chatId, participants, groupMetadata) { const welOn = await isWelcomeOn(chatId); if (!welOn) return; const customMsg = await getWelcome(chatId), groupName = groupMetadata.subject, groupDesc = groupMetadata.desc || 'No description'; for (const p of participants) { const ps = typeof p === 'string' ? p : p.id, user = ps.split('@')[0]; let displayName = user; try { const gp = groupMetadata.participants.find(x => x.id === ps); if (gp?.name) displayName = gp.name; } catch {} let finalMsg; if (customMsg) { finalMsg = customMsg.replace(/{user}/g, `@${displayName}`).replace(/{group}/g, groupName).replace(/{description}/g, groupDesc); } else { const now = new Date(), ts = now.toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }); finalMsg = `🎊 *NEW MEMBER!* 🎊\n\nHey *@${displayName}*! 👋\nWelcome to *${groupName}*! 🔥${groupDesc ? '\n\n📌 ' + groupDesc : ''}\n\n👥 Member *#${groupMetadata.participants.length}*\n🕒 ${ts}\n\n✨ Enjoy your stay!\n*Whitekid Prime*`; } try { let pp = 'https://img.pyrocdn.com/dbKUgahg.png'; try { pp = await sock.profilePictureUrl(ps, 'image'); } catch {} await sock.sendMessage(chatId, { image: { url: pp }, caption: finalMsg, mentions: [ps] }); } catch { await sock.sendMessage(chatId, { text: finalMsg, mentions: [ps] }); } } }

async function handleGoodbye(sock, chatId, participants, groupMetadata) {
    const gbyOn = await isGoodbyeOn(chatId); if (!gbyOn) return;
    const customMsg = await getGoodbye(chatId), groupName = groupMetadata.subject;
    for (const p of participants) {
        const ps = typeof p === 'string' ? p : p.id, user = ps.split('@')[0];
        let finalMsg;
        if (customMsg) { finalMsg = customMsg.replace(/{user}/g, `@${user}`).replace(/{group}/g, groupName); }
        else {
            const ts = new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
            finalMsg = `💔 *Goodbye...* 😢\n\n*@${user}* has left *${groupName}*\n\nWe'll really miss you 🥺\nIt won't be the same without you...\n\n👥 Members remaining: ${groupMetadata.participants.length}\n🕒 ${ts}\n\n_Hope to see you again someday 💭_\n*Whitekid Prime*`;
        }
        try { let pp = 'https://img.pyrocdn.com/dbKUgahg.png'; try { pp = await sock.profilePictureUrl(ps, 'image'); } catch {} await sock.sendMessage(chatId, { image: { url: pp }, caption: finalMsg, mentions: [ps] }); } catch { await sock.sendMessage(chatId, { text: finalMsg, mentions: [ps] }); }
    }
}

async function handlePromotionEvent(sock, groupId, participants, author) { try { if (!Array.isArray(participants) || !participants.length) return; const names = participants.map(j => `@${(typeof j === 'string' ? j : (j.id || j.toString())).split('@')[0]} `); const mentionList = participants.map(j => typeof j === 'string' ? j : (j.id || j.toString())); let promotedBy = 'System'; if (author && author.length > 0) { const aj = typeof author === 'string' ? author : (author.id || author.toString()); promotedBy = `@${aj.split('@')[0]}`; mentionList.push(aj); } await sock.sendMessage(groupId, { text: `*『 GROUP PROMOTION 』*\n\n👥 *Promoted:*\n${names.map(n => `• ${n}`).join('\n')}\n\n👑 *By:* ${promotedBy}\n\n📅 *Date:* ${new Date().toLocaleString()}`, mentions: mentionList }); } catch (e) { console.error('Promotion:', e); } }

async function groupStatusUpdate(sock, from, m, args, reply) {
    if (!from.endsWith('@g.us')) return reply("⚠️ Groups only.");
    const quotedMsg = m.message.extendedTextMessage?.contextInfo?.quotedMessage || m.message;
    const isImage = quotedMsg.imageMessage, isVideo = quotedMsg.videoMessage, text = args.join(" ");
    if (!isImage && !isVideo && !text) return reply("⚠️ Reply to media or type text.");
    await sock.sendMessage(from, { react: { text: '⏳', key: m.key } });
    try {
        let mp = {};
        if (isImage || isVideo) {
            let mb = Buffer.from([]);
            if (isImage) {
                const imgMsgDl = quotedMsg?.imageMessage;
                if (imgMsgDl) { const s = await downloadContentFromMessage(imgMsgDl, 'image'); for await (const c of s) mb = Buffer.concat([mb, c]); }
            } else {
                const vidMsgDl = quotedMsg?.videoMessage;
                if (vidMsgDl) { const s = await downloadContentFromMessage(vidMsgDl, 'video'); for await (const c of s) mb = Buffer.concat([mb, c]); }
            }
            if (!mb.length) { reply('⚠️ Could not download media. Make sure to reply to a media message.'); return; }
            let mo = {};
            if (isImage) mo = { image: mb, caption: text };
            else mo = { video: mb, caption: text };
            const pm = await prepareWAMessageMedia(mo, { upload: sock.waUploadToServer });
            let fm = {};
            if (isImage) fm = { imageMessage: pm.imageMessage };
            else fm = { videoMessage: pm.videoMessage };
            mp = { groupStatusMessageV2: { message: fm } };
        } else {
            const rh = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
            const bgColor = (0xFF000000 + parseInt(rh, 16)) >>> 0;
            mp = { groupStatusMessageV2: { message: { extendedTextMessage: { text, backgroundArgb: bgColor, font: 2, previewType: 0 } } } };
        }
        const msg2 = generateWAMessageFromContent(from, mp, { userJid: sock.user.id });
        await sock.relayMessage(from, msg2.message, { messageId: msg2.key.id });
        await sock.sendMessage(from, { react: { text: '✅', key: m.key } });
    } catch (e) { console.error("[GC STATUS ERROR]", e); reply(`⚠️ GC Status error: ${e.message}`); }
}

module.exports = { TicTacToeGame, formatTimeLeft, generateId, groupStatusUpdate, handleGoodbye, handleLinkDetection, handleMessageRevocation, handlePromotionEvent, handleStatusUpdate, handleTicTacToeMove, handleWelcome, loadSchedules, parseTime, saveSchedules, startScheduler, storeMsg };
