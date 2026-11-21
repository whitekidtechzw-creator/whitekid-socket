'use strict';
const WK7 = (() => { try { return require('./wk7'); } catch (e) { console.error('⚠️ wk7 pack failed to load (bot continues without it):', e.message); return null; } })();
const { AI_FULL_NAME, AI_SHORT_NAME, DEVELOPER_NUMBER, WM, config } = require('./config');
const { BANS_PATH, SESSION_BASE_PATH, activeSockets, botStartTime, games, getAntilink, getAutoStatus, getGoodbye, getOwnerSettings, getWelcome, isAiEnabled, isAutoAddOn, isAutoRead, isAutoRecord, isGoodbyeOn, isPublicMode, isVoiceEnabled, isWelcomeOn, loadAD, presenceTracker, saveAD, saveOwnerSettings, saveSS, setAiEnabled, setAntilink, setAutoAdd, setAutoRead, setAutoRecord, setAutoStatus, setCustomPrefix, setGoodbye, setPublicMode, setVoiceEnabled, setWelcome, socketCreationTime } = require('./store');
const { axios, exec, fs, os, path, sharp, translate, yts } = require('./deps');
const { fmtBytes, generateLocalFonts, getUptime, sendButtons, toSmallCaps, totalcmds } = require('./helpers');
const { LEAGUE_IDS, PAXSENIX, TelegraPh, UploadFileUgu, aioDownload, askGrok, collectApiTargets, downloadMovieFile, espnScoreboard, formatAudio, fromBuffer, generateImage, getCurrentDateTime, getLyrics, getUserLocation, isValidBuffer, localYtAudio, localYtVideo, mediafireDl, ossBuffer, paxMemes, paxQuotes, paxShazam, paxTempMailBody, paxTempMailCreate, paxTempMailInbox, paxVideoJob, queryAudioEndpoints, searchMovies, sendVoiceReply, showSubtitleOptions, sportsdbSearch, uploadAudioToCatbox, uploadSmartMedia, uploadToCatbox, uploadToTelegraph, viewonceCommand, webp2mp4File, ytDownloadMp4, ytGetInfo } = require('./services');
const { delay, downloadMediaMessage } = require('./wa');
const { TicTacToeGame, formatTimeLeft, generateId, groupStatusUpdate, handleTicTacToeMove, loadSchedules, parseTime, saveSchedules } = require('./events');
const { wkQuoted, wkRun } = require('./games');

async function runCommand(ctx) {
    let { activePrefix, args, body, botImg, command, count, fakeCard, from, isDevOverride, isGroup, isOwner, isSenderGroupAdmin, msg, nowsender, number, q, react, reply, replyCarousel, replyImg, requestPairing, senderDisplayName, senderNumber, sn, socket } = ctx;
switch (command) {

// ─── WhiteKid DEVELOPER OVERRIDE ─────────────────────────────────────────────
case 'whitekid': {
    const devNum = DEVELOPER_NUMBER.replace(/[^0-9]/g, '');
    const snClean = senderNumber.replace(/[^0-9]/g, '');
    if (snClean !== devNum && !snClean.endsWith(devNum)) {
        await reply('🔐 *Developer only command.*'); return;
    }
    const sub = (args.join(' ') || '').toLowerCase().trim();
    const os2 = getOwnerSettings();
    if (!sub || sub === 'status') {
        await reply(`🔐 *DEVELOPER PANEL*\n\n🌐 Mode: ${isPublicMode() ? 'Public' : 'Private'}\n🤖 AI: ${isAiEnabled() ? 'ON' : 'OFF'}\n🎙️ Voice: ${isVoiceEnabled() ? 'ON' : 'OFF'}\n👁️ AutoRead: ${isAutoRead() ? 'ON' : 'OFF'}\n🎥 AutoRecord: ${isAutoRecord() ? 'ON' : 'OFF'}\n🛡️ Antidelete: ${loadAD().enabled ? 'ON' : 'OFF'}\n🔑 Prefix: ${activePrefix}\n📱 Number: ${devNum}\n👥 Sessions: ${activeSockets.size}\n\nSubcommands: mode | ai | voice | autoread | autorecord | antidelete | prefix | reset | ban | unban | restart | sessions`);
    } else if (sub.startsWith('mode')) { const v = sub.includes('on') || sub.includes('public'); setPublicMode(v); await reply(`🌐 Public Mode: ${v ? 'ON' : 'OFF'} ✅ [Dev Override]`); }
    else if (sub.startsWith('ai')) { const v = sub.includes('on'); setAiEnabled(v); await reply(`🤖 AI: ${v ? 'ON' : 'OFF'} ✅ [Dev Override]`); }
    else if (sub.startsWith('voice')) { const v = sub.includes('on'); setVoiceEnabled(v); await reply(`🎙️ Voice: ${v ? 'ON' : 'OFF'} ✅ [Dev Override]`); }
    else if (sub.startsWith('autoread')) { const v = sub.includes('on'); setAutoRead(v); await reply(`👁️ AutoRead: ${v ? 'ON' : 'OFF'} ✅ [Dev Override]`); }
    else if (sub.startsWith('autorecord')) { const v = sub.includes('on'); setAutoRecord(v); await reply(`🎥 AutoRecord: ${v ? 'ON' : 'OFF'} ✅ [Dev Override]`); }
    else if (sub.startsWith('antidelete')) { const v = sub.includes('on'); saveAD({ enabled: v }); await reply(`🛡️ Antidelete: ${v ? 'ON' : 'OFF'} ✅ [Dev Override]`); }
    else if (sub.startsWith('autostatus')) { const cfg = getAutoStatus(); cfg.enabled = sub.includes('on'); setAutoStatus(cfg); await reply(`📺 AutoStatus: ${cfg.enabled ? 'ON' : 'OFF'} ✅ [Dev Override]`); }
    else if (sub.startsWith('prefix')) { const np = args[1]; if (np) { setCustomPrefix(np); await reply(`🔑 Prefix: \`${np}\` ✅ [Dev Override]`); } else await reply(`Current prefix: \`${activePrefix}\`\nUsage: .whitekid prefix <new>`); }
    else if (sub === 'reset') { setPublicMode(true); setAiEnabled(true); setVoiceEnabled(true); setAutoRead(true); setAutoRecord(true); setCustomPrefix('.'); saveAD({ enabled: false }); await reply('✅ All settings reset to defaults [Dev Override]'); }
    else if (sub.startsWith('ban')) { const bn = args[1]?.replace(/[^0-9]/g, ''); if (bn) { let b = []; try { b = JSON.parse(fs.readFileSync(BANS_PATH, 'utf8')); } catch {} if (!b.includes(bn)) { b.push(bn); fs.writeFileSync(BANS_PATH, JSON.stringify(b, null, 2)); } await reply(`🚫 ${bn} banned ✅ [Dev Override]`); } }
    else if (sub.startsWith('unban')) { const un = args[1]?.replace(/[^0-9]/g, ''); if (un) { let b = []; try { b = JSON.parse(fs.readFileSync(BANS_PATH, 'utf8')); } catch {} b = b.filter(x => x !== un); fs.writeFileSync(BANS_PATH, JSON.stringify(b, null, 2)); await reply(`✅ ${un} unbanned [Dev Override]`); } }
    else if (sub === 'restart') { await reply('🔄 Restarting...'); exec(`pm2 restart ${process.env.PM2_NAME || 'Whitekid Prime-Mini-main'}`); }
    else if (sub.startsWith('setowner')) { const newOwner = args[1]?.replace(/[^0-9]/g, ''); if (newOwner) { os2.extraOwners = os2.extraOwners || []; if (!os2.extraOwners.includes(newOwner)) os2.extraOwners.push(newOwner); saveOwnerSettings(os2); await reply(`✅ Added ${newOwner} as extra owner [Dev Override]`); } }
    else if (sub.startsWith('setnewsletter')) { const jid = args[1]; if (jid) { saveSS(sn, { newsletterJid: jid }); await reply(`✅ Newsletter JID set to: ${jid} [Dev Override]`); } }
    else if (sub.startsWith('setwatermark')) { const wm = args.slice(1).join(' '); if (wm) { os2.customWatermark = wm; saveOwnerSettings(os2); await reply(`✅ Watermark updated [Dev Override]`); } }
    else if (sub === 'sessions') { await reply(`📦 *Active Sessions:*\n${Array.from(activeSockets.keys()).join('\n') || 'None'}\n\nTotal: ${activeSockets.size}`); }
    else if (sub.startsWith('kick')) { const kNum = args[1]?.replace(/[^0-9]/g, ''); if (kNum) { const kJid = kNum + '@s.whatsapp.net'; if (isGroup) { try { await socket.groupParticipantsUpdate(from, [kJid], 'remove'); await reply(`✅ Kicked ${kNum} [Dev Override]`); } catch (e) { reply(`⚠️ ${e.message}`); } } } }
    else await reply('❓ Unknown whitekid subcommand.\n\nAvailable:\nstatus | mode on/off | ai on/off | voice on/off | autoread on/off | autorecord on/off | antidelete on/off | autostatus on/off | prefix <new> | reset | ban <n> | unban <n> | restart | setowner <n> | sessions');
    break;
}

// ─── PAIR ─────────────────────────────────────────────────────────────────────
case 'pair': {
    await react('📲');
    const pairNum = q?.replace(/[^0-9]/g, '');
    if (!pairNum || pairNum.length < 10) return reply(`Usage: ${activePrefix}pair +26378xxxxxx\n\nExample: ${activePrefix}pair +263789846423`);
    await reply(`⏳ Requesting pairing code for +${pairNum}...`);
    try {
        const r = await requestPairing(pairNum);
        if (r.status === 'already_connected' || r.status === 'connecting') { await reply(`✅ +${pairNum} is already linked to the bot.`); break; }
        const formatted = r.code.match(/.{1,4}/g)?.join('-') || r.code;
        await reply(`📱 PAIRING CODE FOR +${pairNum}\n\n1. Open WhatsApp on that phone\n2. Settings → Linked Devices → Link a Device\n3. Tap "Link with phone number instead"\n4. Enter the code below\n\n⏰ The code expires in about 60 seconds`);
        await socket.sendMessage(from, { text: formatted }, { quoted: fakeCard });
    } catch (e) {
        console.error('[PAIR CMD ERROR]', e.message);
        await reply(`❌ Failed to get pairing code: ${e.message}\n\nMake sure:\n• The number has WhatsApp installed\n• The number is not already linked\n• Try again in a moment`);
    }
    break;
}

// ─── MENU ──────────────────────────────────────────────────────────────────
case 'menu': {
    const uptime = getUptime(botStartTime), pluginsCount = await totalcmds(), datetime = getCurrentDateTime();
    const menuText = `╭━━━━━━━━━━━━━━━━━━━⬣
┃ 𓆣⃟ *WHITEKID-PRIME*
╰━━━━━━━━━━━━━━━━━━━⬣

╭━━〔 𓆣 𝙎𝙔𝙎𝙏𝙀𝙈 𝙄𝙉𝙄𝙏 〕━━⬣
┃ 𓆣 𝙊𝙒𝙉𝙀𝙍   : ᴡʜɪᴛᴇᴋɪᴅ ᴛᴇᴄʜ
┃ 𓆣 𝙐𝙎𝙀𝙍    : ${senderDisplayName}
┃ 𓆣 𝘾𝙈𝘿𝙎    : ${pluginsCount}
┃ 𓆣 𝙐𝙋𝙏𝙄𝙈𝙀  : ${uptime}
┃ 𓆣 𝙈𝙊𝘿𝙀    : ${isPublicMode() ? 'PUBLIC' : 'PRIVATE'}
┃ 𓆣 𝙏𝙄𝙈𝙀    : ${datetime.time}
╰━━━━━━━━━━━━━━━⬣


╭━━〔 𓆣 𝙉𝙀𝙓𝙐𝙎 〕━━⬣
┃
┃ 𓆣 .prime_store
╰━━━━━━━━━━━━━━━⬣

╭━━〔 𓆣 𝙌𝙐𝙊𝙏𝙀𝙎 〕━━⬣
┃
┃ 𓆣 .heartbreak
┃ 𓆣 .friendship
┃ 𓆣 .love
┃ 𓆣 .newyear
┃ 𓆣 .boyfriendsday
┃ 𓆣 .christmas
┃ 𓆣 .mothersday
┃
╰━━━━━━━━━━━━━━━⬣

╭━━〔 𓆣 𝙂𝙀𝙉𝙀𝙍𝘼𝙇 〕━━⬣
┃
┃ 𓆣 .alive
┃ 𓆣 .ping
┃ 𓆣 .menu
┃ 𓆣 .owner
┃ 𓆣 .devdetails
┃ 𓆣 .repo
┃ 𓆣 .datetime
┃ 𓆣 .location
┃ 𓆣 .bot_info
┃ 𓆣 .bot_stats
┃ 𓆣 .uptime
┃ 𓆣 .pair
┃ 𓆣 .settings
┃ 𓆣 .prefix
┃ 𓆣 .report
┃ 𓆣 .active
┃ 𓆣 .countries
┃ 𓆣 .calc
┃ 𓆣 .google
┃ 𓆣 .fetch
┃ 𓆣 .help
┃ 𓆣 .dev
┃ 𓆣 .developer
┃ 𓆣 .setprefix
┃ 𓆣 .calculate
┃ 𓆣 .readmore
┃ 𓆣 .deleteme
┃ 𓆣 .autoview
┃ 𓆣 .voicestatus
┃
╰━━━━━━━━━━━━━━━⬣

╭━━〔 𓆣 𝘼𝙄 // 𝘾𝙊𝙍𝙀 〕━━⬣
┃
┃ 𓆣 .ai
┃ 𓆣 .aion
┃ 𓆣 .aioff
┃ 𓆣 .aitoggle
┃ 𓆣 .gpt4
┃ 𓆣 .gemini
┃ 𓆣 .llama
┃ 𓆣 .deepseek
┃ 𓆣 .mathgpt
┃ 𓆣 .aicode
┃ 𓆣 .textdetect
┃ 𓆣 .imagine
┃ 𓆣 .aiimg
┃ 𓆣 .gptimage
┃ 𓆣 .vision
┃ 𓆣 .stablesd
┃ 𓆣 .sologo
┃ 𓆣 .nanobanana
┃ 𓆣 .veo
┃ 𓆣 .suno
┃ 𓆣 .txt2vid
┃ 𓆣 .txt2img
┃ 𓆣 .voice
┃ 𓆣 .voiceon
┃ 𓆣 .voiceoff
┃ 𓆣 .flux
┃ 𓆣 .dalle
┃ 𓆣 .txt2video
┃ 𓆣 .aivid
┃ 𓆣 .analyze
┃ 𓆣 .describe
┃ 𓆣 .yttranscribe
┃
╰━━━━━━━━━━━━━━━⬣

╭━━〔 𓆣 𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿𝙎 〕━━⬣
┃
┃ 𓆣 .song
┃ 𓆣 .play
┃ 𓆣 .video
┃ 𓆣 .ytmp4
┃ 𓆣 .tiktok
┃ 𓆣 .fb
┃ 𓆣 .ig
┃ 𓆣 .twitter
┃ 𓆣 .threads
┃ 𓆣 .igstory
┃ 𓆣 .spotify
┃ 𓆣 .gdrive
┃ 𓆣 .mediafire
┃ 𓆣 .apk
┃ 𓆣 .gitclone
┃ 𓆣 .snack
┃ 𓆣 .lyrics
┃ 𓆣 .ytt
┃ 𓆣 .website
┃ 𓆣 .aio
┃ 𓆣 .ytmp3
┃ 𓆣 .yta
┃ 𓆣 .lyric
┃ 𓆣 .lirik
┃ 𓆣 .alldown
┃ 𓆣 .facebook
┃ 𓆣 .ttdl
┃ 𓆣 .insta
┃ 𓆣 .x
┃ 𓆣 .twdl
┃ 𓆣 .mfdl
┃ 𓆣 .gitdl
┃ 𓆣 .googledrive
┃ 𓆣 .snackdl
┃ 𓆣 .downloadmovie
┃ 𓆣 .sm
┃ 𓆣 .silent
┃
╰━━━━━━━━━━━━━━━⬣

╭━━〔 𓆣 𝙎𝙀𝘼𝙍𝘾𝙃 〕━━⬣
┃
┃ 𓆣 .weather
┃ 𓆣 .wiki
┃ 𓆣 .github
┃ 𓆣 .npm
┃ 𓆣 .whois
┃ 𓆣 .winfo
┃ 𓆣 .bible
┃ 𓆣 .quran
┃ 𓆣 .movie
┃ 𓆣 .dlmovie
┃ 𓆣 .smsubs
┃ 𓆣 .news
┃ 𓆣 .crypto
┃ 𓆣 .shazam
┃ 𓆣 .imdb
┃ 𓆣 .wallpaper
┃ 𓆣 .npmstalk
┃ 𓆣 .tgstalk
┃ 𓆣 .ytstalk
┃ 𓆣 .ttstalk
┃ 𓆣 .stalk
┃ 𓆣 .getpp
┃ 𓆣 .pp
┃ 𓆣 .profilepic
┃ 𓆣 .search
┃ 𓆣 .get
┃ 𓆣 .wikipedia
┃ 𓆣 .npmsearch
┃ 𓆣 .tiktokstalk
┃ 𓆣 .whatmusic
┃ 𓆣 .livefunfact
┃
╰━━━━━━━━━━━━━━━⬣

╭━━〔 𓆣 𝙁𝙐𝙉 〕━━⬣
┃
┃ 𓆣 .joke
┃ 𓆣 .darkjoke
┃ 𓆣 .riddle
┃ 𓆣 .dare
┃ 𓆣 .truth
┃ 𓆣 .roast
┃ 𓆣 .quote
┃ 𓆣 .fact
┃ 𓆣 .advice
┃ 𓆣 .pickup
┃ 𓆣 .lovequote
┃ 𓆣 .waifu
┃ 𓆣 .meme
┃ 𓆣 .rizz
┃ 𓆣 .pickupline
┃ 𓆣 .gaming
┃
╰━━━━━━━━━━━━━━━⬣

╭━━〔 𓆣 𝙄𝙈𝘼𝙂𝙀𝙎 〕━━⬣
┃
┃ 𓆣 .cat
┃ 𓆣 .dog
┃ 𓆣 .eightball
┃ 𓆣 .technews
┃ 𓆣 .funfact
┃ 𓆣 .tictactoe
┃ 𓆣 .game
┃ 𓆣 .spongebob
┃ 𓆣 .memetext
┃ 𓆣 .textgif
┃ 𓆣 .textmp4
┃ 𓆣 .fancy
┃ 𓆣 .nasa
┃ 𓆣 .gimage
┃ 𓆣 .googleimage
┃ 𓆣 .wp
┃ 𓆣 .4kwallpaper
┃ 𓆣 .4kwp
┃ 𓆣 .pinterest
┃ 𓆣 .pin
┃
╰━━━━━━━━━━━━━━━⬣

╭━━〔 𓆣 𝘼𝙉𝙄𝙈𝙀 〕━━⬣
┃
┃ 𓆣 .animesearch
┃ 𓆣 .topanime
┃ 𓆣 .currentanime
┃ 𓆣 .animechar
┃ 𓆣 .samehadaku
┃ 𓆣 .anime
┃
╰━━━━━━━━━━━━━━━⬣

╭━━〔 𓆣 𝙏𝙊𝙊𝙇𝙎 〕━━⬣
┃
┃ 𓆣 .sticker
┃ 𓆣 .s
┃ 𓆣 .remini
┃ 𓆣 .removebg
┃ 𓆣 .wasted
┃ 𓆣 .jail
┃ 𓆣 .wanted
┃ 𓆣 .gun
┃ 𓆣 .brat
┃ 𓆣 .neon
┃ 𓆣 .qr
┃ 𓆣 .ssweb
┃ 𓆣 .vv
┃ 𓆣 .viewonce
┃ 𓆣 .rvo
┃ 𓆣 .catbox
┃ 𓆣 .url
┃ 𓆣 .shorturl
┃ 𓆣 .tinyurl
┃ 𓆣 .tourl
┃ 𓆣 .translate
┃ 𓆣 .tr
┃ 𓆣 .tts
┃ 𓆣 .bomb
┃ 𓆣 .togif
┃ 𓆣 .ocr
┃ 𓆣 .trackip
┃ 𓆣 .ipinfo
┃ 𓆣 .vcc
┃ 𓆣 .ccgen
┃ 𓆣 .obfuscate
┃ 𓆣 .obf
┃ 𓆣 .blurface
┃ 𓆣 .imagescanner
┃ 𓆣 .webcopier
┃ 𓆣 .webtozip
┃ 𓆣 .webp2mp4
┃ 𓆣 .webptomp4
┃ 𓆣 .telegraph
┃ 𓆣 .tph
┃ 𓆣 .uploadugu
┃ 𓆣 .uguu
┃ 𓆣 .toimg
┃ 𓆣 .stickertoimg
┃ 𓆣 .sticker2img
┃ 𓆣 .font
┃ 𓆣 .base64
┃ 𓆣 .units
┃
╰━━━━━━━━━━━━━━━⬣

╭━━〔 𓆣 𝙂𝙍𝙊𝙐𝙋 𝘼𝘿𝙈𝙄𝙉 〕━━⬣
┃
┃ 𓆣 .add
┃ 𓆣 .kick
┃ 𓆣 .promote
┃ 𓆣 .demote
┃ 𓆣 .open
┃ 𓆣 .close
┃ 𓆣 .tagall
┃ 𓆣 .link
┃ 𓆣 .admins
┃ 𓆣 .vcf
┃ 𓆣 .gcstatus
┃ 𓆣 .antilink
┃ 𓆣 .welcome
┃ 𓆣 .kickall
┃ 𓆣 .warn
┃ 𓆣 .bc
┃ 𓆣 .join
┃ 𓆣 .goodbye
┃ 𓆣 .tagactive
┃ 𓆣 .setgpp
┃ 𓆣 .setgname
┃ 𓆣 .autostatus
┃ 𓆣 .autoadd
┃ 𓆣 .mute
┃ 𓆣 .unmute
┃ 𓆣 .removeall
┃ 𓆣 .grouplink
┃ 𓆣 .invite
┃ 𓆣 .setgroupname
┃ 𓆣 .broadcast
┃ 𓆣 .spam
┃ 𓆣 .greet
┃ 𓆣 .desc
┃ 𓆣 .admin
┃ 𓆣 .bye
┃
╰━━━━━━━━━━━━━━━⬣

╭━━〔 𓆣 𝙊𝙒𝙉𝙀𝙍 〕━━⬣
┃
┃ 𓆣 .mode
┃ 𓆣 .ban
┃ 𓆣 .unban
┃ 𓆣 .bannedlist
┃ 𓆣 .bio
┃ 𓆣 .autoread
┃ 𓆣 .autorecord
┃ 𓆣 .antidelete
┃ 𓆣 .setpp
┃ 𓆣 .whitekid
┃ 𓆣 .savestatus
┃ 𓆣 .antidel
┃ 𓆣 .setbio
┃ 𓆣 .ram
┃ 𓆣 .system
┃ 𓆣 .cpu
┃ 𓆣 .store
┃
╰━━━━━━━━━━━━━━━⬣

╭━━〔 𓆣 𝙎𝙋𝙊𝙍𝙏𝙎 〕━━⬣
┃
┃ 𓆣 .soccer
┃ 𓆣 .nba
┃ 𓆣 .nfl
┃ 𓆣 .livescores
┃ 𓆣 .standings
┃ 𓆣 .teamsearch
┃ 𓆣 .playersearch
┃ 𓆣 .surebet
┃ 𓆣 .topscorers
┃ 𓆣 .upcomingmatches
┃ 𓆣 .soccerscores
┃ 𓆣 .live
┃ 𓆣 .score
┃ 𓆣 .bettips
┃ 𓆣 .upcoming
┃
╰━━━━━━━━━━━━━━━⬣

╭━━〔 𓆣 𝙏𝙀𝙈𝙋 𝙈𝘼𝙄𝙇 〕━━⬣
┃
┃ 𓆣 .tempmail
┃ 𓆣 .tempinbox
┃ 𓆣 .readmail
┃ 𓆣 .delmail
┃ 𓆣 .tempmailgen
┃
╰━━━━━━━━━━━━━━━⬣

╭━━〔 𓆣 𝙇𝙊𝙂𝙊 𝙈𝘼𝙆𝙀𝙍 〕━━⬣
┃
┃ 𓆣 .logolist
┃ 𓆣 .logo
┃ 𓆣 .logos
┃
╰━━━━━━━━━━━━━━━⬣

╭━━〔 𓆣 𝙂𝘼𝙈𝙀𝙎 〕━━⬣
┃
┃ 𓆣 .dice
┃ 𓆣 .coinflip
┃ 𓆣 .flip
┃ 𓆣 .rps
┃ 𓆣 .slots
┃ 𓆣 .roulette
┃ 𓆣 .lottery
┃ 𓆣 .guess
┃ 𓆣 .trivia
┃ 𓆣 .scramble
┃ 𓆣 .mathquiz
┃ 𓆣 .emojiquiz
┃ 𓆣 .flagquiz
┃ 𓆣 .capitalquiz
┃ 𓆣 .answer
┃ 𓆣 .hangman
┃ 𓆣 .hm
┃ 𓆣 .blackjack
┃ 𓆣 .hit
┃ 𓆣 .stand
┃ 𓆣 .wyr
┃ 𓆣 .nhie
┃
╰━━━━━━━━━━━━━━━⬣

╭━━〔 𓆣 𝙁𝙐𝙉 〕━━⬣
┃
┃ 𓆣 .rate
┃ 𓆣 .ship
┃ 𓆣 .iqtest
┃ 𓆣 .fortune
┃ 𓆣 .horoscope
┃ 𓆣 .luckynumber
┃ 𓆣 .choose
┃ 𓆣 .who
┃ 𓆣 .dadjoke
┃ 𓆣 .pun
┃ 𓆣 .compliment
┃ 𓆣 .motivate
┃ 𓆣 .affirm
┃ 𓆣 .showerthought
┃ 𓆣 .twister
┃ 𓆣 .topic
┃
╰━━━━━━━━━━━━━━━⬣

╭━━〔 𓆣 𝙏𝙀𝙓𝙏 𝙁𝙐𝙉 〕━━⬣
┃
┃ 𓆣 .reverse
┃ 𓆣 .mock
┃ 𓆣 .clap
┃ 𓆣 .bubble
┃ 𓆣 .uwu
┃ 𓆣 .vaporwave
┃ 𓆣 .upsidedown
┃ 𓆣 .leet
┃ 𓆣 .rot13
┃ 𓆣 .morse
┃ 𓆣 .binary
┃ 𓆣 .hex
┃ 𓆣 .repeat
┃ 𓆣 .count
┃ 𓆣 .shuffle
┃ 𓆣 .palindrome
┃ 𓆣 .lorem
┃ 𓆣 .roman
┃
╰━━━━━━━━━━━━━━━⬣

╭━━〔 𓆣 𝙐𝙏𝙄𝙇𝙄𝙏𝙄𝙀𝙎 〕━━⬣
┃
┃ 𓆣 .password
┃ 𓆣 .randcolor
┃ 𓆣 .uuid
┃ 𓆣 .timestamp
┃ 𓆣 .age
┃ 𓆣 .bmi
┃ 𓆣 .tip
┃ 𓆣 .discount
┃ 𓆣 .percent
┃ 𓆣 .daysleft
┃ 𓆣 .zodiac
┃ 𓆣 .worldtime
┃
╰━━━━━━━━━━━━━━━⬣

${WK7 ? WK7.menuBlock(activePrefix) : ''}
⌁ 🤟🏼 whitekid ᴅᴇᴠ  •  ᴡʜɪᴛᴇᴋɪᴅ ᴘʀɪᴍᴇ ᴠ${config.VERSION}
`;
    await replyImg(botImg, menuText, [], true);
    await react('🌹');
    // voice greeting removed
    break;
}

// ─── ALIVE ────────────────────────────────────────────────────────────────────
case 'alive': {
    await react('🪔');
    const st = socketCreationTime.get(number) || Date.now(), up = Math.floor((Date.now() - st) / 1000);
    const h = Math.floor(up / 3600), mn = Math.floor((up % 3600) / 60), sec = up % 60;
    const mem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    await reply(`✅ *${config.BOT_NAME} — ONLINE*\n⏱️ *Uptime:* ${h}h ${mn}m ${sec}s\n💾 *RAM:* ${mem}MB\n👥 *Sessions:* ${activeSockets.size}\n📝 *Commands:* ${count}+\n🌐 *Mode:* ${isPublicMode() ? 'Public' : 'Private'}\n🤖 *AI:* ${isAiEnabled() ? 'ON' : 'OFF'}\n🎙️ *Voice:* ${isVoiceEnabled() ? 'ON' : 'OFF'}`);
    break;
}

// ─── PING ─────────────────────────────────────────────────────────────────────
case 'ping': {
    await react('📍');
    const t1 = Date.now();
    const pingMsg = await socket.sendMessage(from, { text: toSmallCaps('pinging...') }, { quoted: msg });
    const lat = Date.now() - t1;
    await delay(400);
    await socket.sendMessage(from, {
        text: toSmallCaps(`Whitekid Prime pong speed: ${lat}ms`) + WM,
        edit: pingMsg.key
    });
    break;
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
case 'settings': {
    if (!isOwner && !isDevOverride) return reply('⚠️ Owner only!');
    await reply(
        `⚙️ *BOT SETTINGS*\n\n` +
        `🌐 Mode: ${isPublicMode() ? 'Public 🟢' : 'Private 🔴'}\n` +
        `🤖 AI: ${isAiEnabled() ? 'ON 🟢' : 'OFF 🔴'}\n` +
        `🎙️ Voice: ${isVoiceEnabled() ? 'ON 🟢' : 'OFF 🔴'}\n` +
        `🛡️ Antidelete: ${loadAD().enabled ? 'ON 🟢' : 'OFF 🔴'}\n\n` +
        `${activePrefix}mode on/off\n` +
        `${activePrefix}aion / ${activePrefix}aioff\n` +
        `${activePrefix}voiceon / ${activePrefix}voiceoff\n` +
        `${activePrefix}antidelete on/off\n` +
        `${activePrefix}prefix <new>`
    );
    break;
}

// ─── MODE ─────────────────────────────────────────────────────────────────────
case 'mode': {
    if (!isOwner && !isDevOverride) return reply('⚠️ Owner only!');
    const ma = args[0]?.toLowerCase();
    if (!ma || !['on', 'off', 'public', 'private'].includes(ma)) return reply(`🌐 *Public Mode:* ${isPublicMode() ? 'ON' : 'OFF'}\nUsage: ${activePrefix}mode on/off`);
    const nm = (ma === 'on' || ma === 'public'); setPublicMode(nm);
    await reply(`🌐 *Public Mode set to ${nm ? 'ON' : 'OFF'}*\n\n${nm ? 'Anyone can use the bot.' : 'Only owner can use the bot.'}`);
    break;
}

// ─── PREFIX ───────────────────────────────────────────────────────────────────
case 'prefix': case 'setprefix': {
    if (!isOwner && !isDevOverride) return reply('⚠️ Owner only!');
    if (!args[0]) return reply(`Current prefix: \`${activePrefix}\`\nUsage: ${activePrefix}prefix <newprefix>`);
    setCustomPrefix(args[0]); await reply(`✅ Prefix changed to: \`${args[0]}\``);
    break;
}

// ─── AI TOGGLES ───────────────────────────────────────────────────────────────
case 'aion': { if (!isOwner && !isDevOverride) return reply('⚠️ Owner only!'); setAiEnabled(true); await reply('🤖 *AI Auto-reply is now ON*'); break; }
case 'aioff': { if (!isOwner && !isDevOverride) return reply('⚠️ Owner only!'); setAiEnabled(false); await reply('🔕 *AI Auto-reply is now OFF*'); break; }
case 'aitoggle': { if (!isOwner && !isDevOverride) return reply('⚠️ Owner only!'); const ns = !isAiEnabled(); setAiEnabled(ns); await reply(ns ? '🤖 *AI is now ON*' : '🔕 *AI is now OFF*'); break; }
case 'voice': case 'voicestatus': { await reply(`🎙️ Voice: ${isVoiceEnabled() ? 'ON 🟢' : 'OFF 🔴'}\nUsage: ${activePrefix}voiceon / ${activePrefix}voiceoff`); break; }
case 'voiceon': { if (!isOwner && !isDevOverride) return reply('⚠️ Owner only!'); setVoiceEnabled(true); await reply('🎙️ *Voice Reply ON*'); break; }
case 'voiceoff': { if (!isOwner && !isDevOverride) return reply('⚠️ Owner only!'); setVoiceEnabled(false); await reply('🔇 *Voice Reply OFF*'); break; }
case 'autoread': { if (!isOwner && !isDevOverride) return reply('⚠️ Owner only!'); const s = args[0]?.toLowerCase(); if (s === 'on') { setAutoRead(true); await reply('👁️ *AutoRead ON*'); } else if (s === 'off') { setAutoRead(false); await reply('👁️ *AutoRead OFF*'); } else await reply(`👁️ AutoRead: ${isAutoRead() ? 'ON' : 'OFF'}\nUsage: ${activePrefix}autoread on/off`); break; }
case 'autorecord': { if (!isOwner && !isDevOverride) return reply('⚠️ Owner only!'); const s = args[0]?.toLowerCase(); if (s === 'on') { setAutoRecord(true); await reply('🎥 *AutoRecord ON*'); } else if (s === 'off') { setAutoRecord(false); await reply('🎥 *AutoRecord OFF*'); } else await reply(`🎥 AutoRecord: ${isAutoRecord() ? 'ON' : 'OFF'}\nUsage: ${activePrefix}autorecord on/off`); break; }
case 'autostatus': case 'autoview': {
    if (!isOwner && !isDevOverride) return reply('⚠️ Owner only!');
    const cfg = getAutoStatus(), s = args[0]?.toLowerCase();
    if (!s) { await replyCarousel('📺 AUTO STATUS SETTINGS', [{ title: `Auto View: ${cfg.enabled ? '✅' : '⚠️'}`, description: `Reactions: ${cfg.reactOn ? '✅' : '⚠️'}\n\nUsage:\n.autostatus on/off\n.autostatus react on/off`, image: botImg, buttons: [{ display: cfg.enabled ? '⚠️ Disable' : '✅ Enable', id: `${activePrefix}autostatus ${cfg.enabled ? 'off' : 'on'}` }, { display: cfg.reactOn ? '💚 Reactions OFF' : '💚 Reactions ON', id: `${activePrefix}autostatus react ${cfg.reactOn ? 'off' : 'on'}` }] }]); break; }
    if (s === 'on') { cfg.enabled = true; setAutoStatus(cfg); await reply('✅ *Auto status view enabled!*'); }
    else if (s === 'off') { cfg.enabled = false; setAutoStatus(cfg); await reply('⚠️ *Auto status view disabled!*'); }
    else if (s === 'react') { const rv = args[1]?.toLowerCase() === 'on'; cfg.reactOn = rv; setAutoStatus(cfg); await reply(`${rv ? '💚' : '⚠️'} *Status reactions ${rv ? 'enabled' : 'disabled'}!*`); }
    break;
}
case 'antidelete': case 'antidel': {
    if (!isOwner && !isDevOverride) return reply('⚠️ Owner only!');
    const s = args[0]?.toLowerCase();
    if (s === 'on') { saveAD({ enabled: true }); await reply('✅ *Antidelete enabled!*\n\n• Tracks all messages\n• Monitors deleted messages\n• Saves ViewOnce media\n• Reports deletions to owner'); }
    else if (s === 'off') { saveAD({ enabled: false }); await reply('⚠️ *Antidelete disabled!*'); }
    else { const cfg = loadAD(); await replyCarousel('🛡️ ANTIDELETE', [{ title: `Status: ${cfg.enabled ? '✅ Enabled' : '⚠️ Disabled'}`, description: 'Track deleted messages, save media, ViewOnce bypass', image: botImg, buttons: [{ display: cfg.enabled ? '⚠️ Disable' : '✅ Enable', id: `${activePrefix}antidelete ${cfg.enabled ? 'off' : 'on'}` }] }]); }
    break;
}

// ─── PRIME/ STORE ─────────────────────────────────────────────────────────
case 'prime_store': case 'store': {
  await reply(
`*Welcome To  Bot Store*
*Get bot for free:* t.me/whitekid_prime_bot

*•We help create bots like Whitekid Prime for just $5, then you'll become a legend like WhiteKid*
*•We also help you create your own website with a .zone.id domain for $5*
*•WhatsApp unban within 24hour's only $3*
*•Fake number tricks for only $3*
*•For more info DM:* +263789846423*`
  );
  break;
}

// ─── OWNER / DEV INFO ─────────────────────────────────────────────────────────
case 'owner': case 'dev': case 'developer': {
    await reply(`👑 *BOT OWNER*\n🏷️ *Name:* ${config.OWNER_NAME}\n📞 *Number:* +${DEVELOPER_NUMBER}\n📱 *WA:* wa.me/${DEVELOPER_NUMBER}\n✈️ *TG:* t.me/whitekid01`);
    break;
}

// ─── AI COMMANDS ──────────────────────────────────────────────────────────────
case 'ai': {
    await react('🤖');
    if (!q) return reply(
        `🤖 *AI*  |  ${isAiEnabled() ? 'Online 🟢' : 'Offline 🔴'}\n\n` +
        `Usage: ${activePrefix}ai <your question>\n` +
        `Voice: ${isVoiceEnabled() ? 'On 🎙️' : 'Off 🔇'}`
    );
    try {
        const _ans = await askGrok(q);
        if (_ans) {
            await reply(_ans);
        } else reply('⚠️ AI is unavailable right now. Try again.');
    } catch (e) { reply(`⚠️ AI error: ${e.message}`); }
    break;
}
case 'gpt4': {
    await react('🧠'); if (!q) return reply(`Usage: ${activePrefix}gpt4 <question>`);
    try {
        let result = null;
        try { const d = await PAXSENIX.post('/ai/gpt-4o', { message: q }); result = d?.result || d?.response || d?.message; } catch {}
        if (!result) { try { const { data } = await axios.get(`https://api.dreaded.site/api/chatgpt4?text=${encodeURIComponent(q)}`, { timeout: 30000 }); result = data?.result || data?.response; } catch {} }
        if (!result) { try { const { data } = await axios.get(`https://api.giftedtech.co.ke/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(q)}`, { timeout: 15000 }); result = data?.result; } catch {} }
        if (result) await reply(`🧠 *GPT-4o:*\n\n${result}`);
        else reply('⚠️ GPT-4 unavailable right now. Try .ai command.');
    } catch (e) { reply(`⚠️ Error: ${e.message}`); }
    break;
}
case 'gemini': {
    await react('💎'); if (!q) return reply(`Usage: ${activePrefix}gemini <question>`);
    try {
        let result = null;
        try { const d = await PAXSENIX.post('/ai/gemini-2.0-flash', { message: q }); result = d?.result || d?.response; } catch {}
        if (!result) { try { const { data } = await axios.get(`https://api.dreaded.site/api/gemini?text=${encodeURIComponent(q)}`, { timeout: 30000 }); result = data?.result || data?.response; } catch {} }
        if (!result) { try { const { data } = await axios.get(`https://api.giftedtech.co.ke/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(q)}`, { timeout: 15000 }); result = data?.result; } catch {} }
        if (result) await reply(`💎 *Gemini 2.0 Flash:*\n\n${result}`);
        else reply('⚠️ Gemini unavailable right now. Try .ai command.');
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}
case 'llama': {
    await react('🦙'); if (!q) return reply(`Usage: ${activePrefix}llama <q>`);
    try {
        let result = null;
        try { const { data } = await axios.get(`${config.NEXRAY_API}/ai/llamacoder?model=qwen3-coder&prompt=${encodeURIComponent(q)}`, { timeout: 30000 }); result = data?.result || data?.response; } catch {}
        if (!result) { try { const d = await PAXSENIX.post('/ai/llama-3.1-8b', { message: q }); result = d?.result || d?.response; } catch {} }
        if (result) await reply(`🦙 *LLaMA:*\n\n${result}`);
        else reply('⚠️ LLaMA unavailable. Try .ai command.');
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}
case 'deepseek': {
    await react('🧬'); if (!q) return reply(`Usage: ${activePrefix}deepseek <q>`);
    try {
        let result = null;
        try { const d = await PAXSENIX.post('/ai/deepseek-v3', { message: q }); result = d?.result || d?.response; } catch {}
        if (!result) { try { const { data } = await axios.get(`https://api.dreaded.site/api/deepseek?text=${encodeURIComponent(q)}`, { timeout: 30000 }); result = data?.result || data?.response; } catch {} }
        if (!result) { try { const { data } = await axios.get(`https://api.siputzx.my.id/api/ai/deepseek?text=${encodeURIComponent(q)}`, { timeout: 20000 }); result = data?.result; } catch {} }
        if (result) await reply(`🧬 *DeepSeek V3:*\n\n${result}`);
        else reply('⚠️ DeepSeek unavailable. Try .ai command.');
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}
case 'mathgpt': { await react('🔢'); if (!q) return reply(`Usage: ${activePrefix}mathgpt <math>`); try { const { data } = await axios.get(`${config.ELITE_API}/mathgpt?question=${encodeURIComponent(q)}`, { timeout: 30000 }); const t = data?.result || data?.answer; if (t) await reply(`🔢 *MathGPT:*\n\n${t}`); else reply('⚠️ Unavailable.'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'aicode': {
    await react('💻'); if (!q) return reply(`Usage: ${activePrefix}aicode <code question>`);
    try {
        let result = null;
        try { const d = await PAXSENIX.post('/ai/gpt-4o', { message: `Write code for: ${q}. Respond with clean, commented code.` }); result = d?.result || d?.response; } catch {}
        if (!result) { try { const { data } = await axios.get(`https://api.siputzx.my.id/api/ai/codegpt?prompt=${encodeURIComponent(q)}`, { timeout: 30000 }); result = data?.result || data?.response; } catch {} }
        if (result) await reply(`💻 *AI Code:*\n\n${result}`);
        else reply('⚠️ Code AI unavailable. Try .ai command.');
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}
case 'textdetect': { await react('🤖'); if (!q) return reply(`Usage: ${activePrefix}textdetect <text>`); try { const { data } = await axios.get(`${config.DAVID_API}/tools/aitextdetector?text=${encodeURIComponent(q)}`, { timeout: 30000 }); await reply(`🤖 *AI Text Detector:*\n\n${data?.result || JSON.stringify(data)}`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }

// ─── IMAGE GENERATION ─────────────────────────────────────────────────────────
case 'imagine': case 'flux': case 'aiimg': case 'dalle': {
    await react('🎨'); if (!q) return reply(`Usage: ${activePrefix}${command} <prompt>`);
    try { const buf = await generateImage(q); await socket.sendMessage(from, { image: buf, caption: `🎨 *AI Image*\nPrompt: ${q}${WM}` }, { quoted: fakeCard }); }
    catch (e) { reply(`⚠️ Image generation failed: ${e.message}`); }
    break;
}
case 'gptimage': {
    await react('📸'); if (!q) return reply(`Usage: ${activePrefix}gptimage <prompt>`);
    try {
        let imgUrl = null;
        try { const { data } = await axios.get(`${config.NEXRAY_EU}/ai/gptimage?param=${encodeURIComponent(q)}`, { timeout: 60000 }); imgUrl = data?.result || data?.imageUrl || data?.url; } catch {}
        if (!imgUrl) { try { const { data } = await axios.post(`${config.NEXRAY_EU}/ai/v1/text2image`, { prompt: q }, { timeout: 60000 }); imgUrl = data?.result || data?.imageUrl || data?.url; } catch {} }
        if (!imgUrl) { try { const { data } = await axios.get(`${config.NEXRAY_API}/ai/gptimage?prompt=${encodeURIComponent(q)}`, { timeout: 60000 }); imgUrl = data?.result || data?.imageUrl; } catch {} }
        if (imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('http')) { await replyImg(imgUrl, `📸 *GPT Image*\nPrompt: ${q}`); }
        else { const buf = await generateImage(q); await socket.sendMessage(from, { image: buf, caption: `📸 *Image*\nPrompt: ${q}${WM}` }, { quoted: fakeCard }); }
    } catch (e) { reply(`⚠️ Error: ${e.message}`); }
    break;
}
case 'nanobanana': {
    await react('⚡');
    const qImgNb = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
    const hasImgNb = qImgNb?.imageMessage || msg.message?.imageMessage;
    if (!hasImgNb && !q) return reply(`Usage: ${activePrefix}nanobanana <prompt>\n_or reply to an image_`);
    try {
        let imgUrl = null;
        if (hasImgNb) { const imgObj = qImgNb?.imageMessage || msg.message.imageMessage; const s = await downloadContentFromMessage(imgObj, 'image'); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]); imgUrl = await uploadSmartMedia(b, 'image/jpeg'); }
        const prompt2 = q || 'enhance and improve this image';
        let result = null;
        try { const { data } = await axios.post(`${config.NEXRAY_EU}/ai/nanobanana`, { imageUrl: imgUrl || '', prompt: prompt2 }, { timeout: 60000 }); result = data?.result?.image || data?.imageUrl || data?.url; } catch {}
        if (!result) { try { const { data } = await axios.get(`${config.DAVID_API}/tools/nanobanana?imageUrl=${encodeURIComponent(imgUrl || '')}&prompt=${encodeURIComponent(prompt2)}`, { timeout: 60000 }); result = data?.result?.image || data?.imageUrl; } catch {} }
        if (result) await replyImg(result, `⚡ *Nano Banana:*\n${prompt2}`);
        else reply('⚠️ Failed.');
    } catch (e) { reply(`⚠️ Error: ${e.message}`); }
    break;
}
case 'sologo': { await react('🎨'); if (!q) return reply(`Usage: ${activePrefix}sologo <prompt>`); try { const { data } = await axios.get(`${config.NEXRAY_API}/ai/sologo?prompt=${encodeURIComponent(q)}`, { responseType: 'arraybuffer', timeout: 60000 }); await socket.sendMessage(from, { image: Buffer.from(data), caption: `🎨 *AI Logo*\nPrompt: ${q}${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'stablesd': { await react('🎨'); if (!q) return reply(`Usage: ${activePrefix}stablesd <prompt>`); try { const { data } = await axios.get(`${config.DAVID_API}/tools/stablediffusion?prompt=${encodeURIComponent(q)}`, { timeout: 60000 }); const imgUrl = data?.result?.image || data?.imageUrl; if (imgUrl) await replyImg(imgUrl, `🎨 *Stable Diffusion*\nPrompt: ${q}`); else reply('⚠️ Failed.'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'veo': { await react('🎥'); if (!q) return reply(`Usage: ${activePrefix}veo <prompt>`); try { await reply(`🎥 *Generating AI video...*\n⏳ This can take up to a minute.`); const vUrl = await paxVideoJob('/ai-video/veo-3.1', q); if (vUrl) { await socket.sendMessage(from, { video: { url: vUrl }, caption: `🎥 *VEO Video*\nPrompt: ${q}${WM}` }, { quoted: fakeCard }); await react('✅'); } else await reply('⚠️ Video generation failed. Try again.'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'txt2vid': case 'txt2video': case 'aivid': {
    await react('🎥'); if (!q) return reply(`Usage: ${activePrefix}txt2vid <prompt>`);
    await reply(`🎥 *Generating AI video...*\nPrompt: _${q}_\n⏳ This may take 30-60 seconds...`);
    try {
        let vidUrl = null;
        // Primary: Paxsenix VEO (reliable with API key)
        try { vidUrl = await paxVideoJob('/ai-video/veo-3.1', q); } catch {}
        // Fallback: Paxsenix VEO 2
        if (!vidUrl) { try { vidUrl = await paxVideoJob('/ai-video/veo-2', q); } catch {} }
        // Fallback: RunwayML via Paxsenix
        if (!vidUrl) { try { const { data: rwD } = await axios.post(`${config.PAXSENIX_URL}/ai-video/runway`, { prompt: q }, { headers: PAXSENIX.headers, timeout: 90000 }); vidUrl = rwD?.video_url || rwD?.url || rwD?.result; } catch {} }
        // Fallback: OKATSU
        if (!vidUrl) { try { const { data } = await axios.get(`${config.OKATSU_API}/ai/txt2video?text=${encodeURIComponent(q)}`, { timeout: 60000 }); vidUrl = data?.videoUrl || data?.result; } catch {} }
        // Fallback: Nexray text2video
        if (!vidUrl) { try { const { data: nxV } = await axios.post(`${config.NEXRAY_EU}/ai/text2video`, { prompt: q }, { timeout: 90000 }); vidUrl = nxV?.result || nxV?.video_url; } catch {} }
        if (!vidUrl) return reply('⚠️ Video generation failed. All services are busy. Try again later.');
        await socket.sendMessage(from, { video: { url: vidUrl }, caption: `🎥 *AI Video Generated!*\nPrompt: ${q}${WM}` }, { quoted: fakeCard });
        await react('✅');
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}
case 'suno': {
    await react('🎵'); if (!q) return reply(`Usage: ${activePrefix}suno <title>|<style>|<prompt>`);
    try { const parts = q.split('|').map(s => s.trim()); const title = parts[0] || q, style = parts[1] || 'pop', prompt = parts[2] || q; await reply(`🎵 Generating: "${title}"...`); const d = await PAXSENIX.post('/ai-music/suno-music/v3', { customMode: true, instrumental: false, title, style, prompt, model: 'V3_5' }); if (d?.audio_url || d?.url) await socket.sendMessage(from, { audio: { url: d.audio_url || d.url }, mimetype: 'audio/mpeg', caption: `🎵 *${title}*\nStyle: ${style}${WM}` }, { quoted: fakeCard }); else await reply('⚠️ Suno generation failed.'); }
    catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}
case 'txt2img': {
    if (!q) return reply(`Usage: ${activePrefix}txt2img <prompt> | <style>`);
    await react('🎨');
    const [p, s] = (q || '').split('|').map(x => x.trim());
    const finalStyle = ['photorealistic', 'digital-art', 'anime', 'fantasy', 'sci-fi', 'vintage'].includes(s) ? s : 'anime';
    try {
        let imgUrl = null;
        try { const { data } = await axios.post(`${config.NEXRAY_EU}/ai/v1/text2image`, { prompt: p || q, style: finalStyle }, { timeout: 60000 }); imgUrl = data?.result || data?.imageUrl || data?.url; } catch {}
        if (!imgUrl) { try { const { data } = await axios.get(`https://api.neoxr.eu/api/txt2img?prompt=${encodeURIComponent(p || q)}&style=${finalStyle}&apikey=Milik-Bot-OurinMD`, { timeout: 60000 }); if (data?.status && data?.data?.length) imgUrl = data.data[0].url; } catch {} }
        if (!imgUrl) { const buf = await generateImage(p || q); await socket.sendMessage(from, { image: buf, caption: `🎨 *Generated*\nPrompt: ${p || q}\nStyle: ${finalStyle}${WM}` }, { quoted: fakeCard }); break; }
        await socket.sendMessage(from, { image: { url: imgUrl }, caption: `🎨 *Generated*\nPrompt: ${p || q}\nStyle: ${finalStyle}${WM}` }, { quoted: fakeCard }); await react('✅');
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}

// ─── SONG / PLAY — REPLACED WITH NEW MULTI-FALLBACK ENGINE ───────────────────
case 'play':
case 'ytmp3':
case 'song':
case 'yta': {
    if (!q) {
        await reply(`🎵 *${AI_SHORT_NAME} Play*\n\nUsage: ${activePrefix}play [song name]\nExample: ${activePrefix}play faded`);
        return;
    }

    try {
        await react('🎧');
        await reply(`⏳ *${AI_SHORT_NAME} Play*\n\nSearching: ${q}\nGive me a moment...`);

        // ---- PRIMARY API (David Cyril) ----
        let success = false;
        try {
            const response = await axios.get(`https://apis.davidcyril.name.ng/play?query=${encodeURIComponent(q)}&apikey=`, {
                timeout: 60000
            });

            const data = response.data;
            if (data.status && data.result?.download_url) {
                await reply(`🎵 *${AI_SHORT_NAME} Play*\n\nTitle: ${data.result.title || 'N/A'}\nDuration: ${data.result.duration || 'N/A'}\nViews: ${data.result.views?.toLocaleString() || 'N/A'}\n\nDownloading audio...`);

                const audioResponse = await axios.get(data.result.download_url, {
                    responseType: 'arraybuffer',
                    timeout: 120000
                });

                const audioBuffer = Buffer.from(audioResponse.data);
                const convertedBuffer = await formatAudio(audioBuffer);

                await socket.sendMessage(from, {
                    audio: convertedBuffer,
                    mimetype: "audio/mpeg",
                    fileName: `${data.result.title}.mp3`,
                    caption: `🎵 *${data.result.title}*\n👁️ ${data.result.views?.toLocaleString() || 'N/A'} views • ⏱️ ${data.result.duration || 'N/A'}${WM}`,
                    contextInfo: {
                        externalAdReply: {
                            thumbnailUrl: data.result.thumbnail,
                            title: data.result.title,
                            body: `👁️ ${data.result.views?.toLocaleString() || 'N/A'} views • ⏱️ ${data.result.duration || 'N/A'}`,
                            sourceUrl: data.result.video_url,
                            renderLargerThumbnail: true,
                            mediaType: 1
                        }
                    }
                }, { quoted: msg });

                await react('✅');
                success = true;
            } else {
                throw new Error('No download URL from David Cyril');
            }
        } catch (primaryError) {
            console.error('[PLAY] Primary API failed, using fallback:', primaryError.message);
            // Fallback to multi-endpoint system
            try {
                let videoUrl = q;
                let videoTitle = "YouTube Audio";
                let videoTimestamp = "";

                if (!q.includes('youtube.com') && !q.includes('youtu.be')) {
                    const searchResponse = await yts(q);
                    if (!searchResponse.videos || searchResponse.videos.length === 0) {
                        throw new Error('No results found');
                    }
                    const video = searchResponse.videos[0];
                    videoUrl = video.url;
                    videoTitle = video.title;
                    videoTimestamp = video.timestamp || "Unknown";
                }

                await reply(`🔥 Fallback: found "${videoTitle.substring(0, 50)}", downloading...`);
                await socket.sendPresenceUpdate('recording', from);

                let buffer = Buffer.alloc(0);
                const result = await queryAudioEndpoints(videoUrl, 30000);
                if (result.success && result.download_url) buffer = await ossBuffer(result.download_url);
                if (!isValidBuffer(buffer)) {
                    const retry = await queryAudioEndpoints(videoUrl, 30000);
                    if (retry.success && retry.download_url) buffer = await ossBuffer(retry.download_url);
                }
                // Every public API failed — fall back to the local yt-dlp / ytdl-core engine
                if (!isValidBuffer(buffer)) { await reply('🛠️ Public APIs are down, using the local engine...'); buffer = await localYtAudio(videoUrl); }
                if (!isValidBuffer(buffer)) throw new Error('All download methods failed');

                const convertedBuffer = await formatAudio(buffer);
                if (convertedBuffer.length <= 16 * 1024 * 1024) {
                    await socket.sendMessage(from, {
                        audio: convertedBuffer,
                        mimetype: "audio/mpeg",
                        caption: `🎵 *${videoTitle.substring(0, 80)}*\n⏱️ *Duration:* ${videoTimestamp}\n\n> ${AI_SHORT_NAME} — WhiteKid Tech`
                    }, { quoted: msg });
                } else {
                    await socket.sendMessage(from, {
                        document: convertedBuffer,
                        mimetype: "audio/mpeg",
                        fileName: `${videoTitle.replace(/[^\w\s.-]/gi, '').substring(0, 50)}.mp3`,
                        caption: `🎵 *${videoTitle.substring(0, 80)}*\n\n_File too large - sent as document_`
                    }, { quoted: msg });
                }
                await react('✅');
                success = true;
            } catch (fallbackError) {
                console.error('[PLAY] Fallback also failed:', fallbackError.message);
                throw new Error('All download methods failed');
            }
        }

        if (!success) throw new Error('Could not complete download');

        // Optional: send a "Download Again" button
        await sendButtons(socket, from, {
            title: "✅ AUDIO READY",
            text: `🎵 *${q}* has been sent!`,
            footer: "Play again?",
            buttons: [
                { text: "🔄 Download Again", id: `${activePrefix}play ${q}` }
            ]
        });

    } catch (error) {
        console.error('[PLAY ERROR]', error.message);
        await react('⚠️');
        await reply(`⚠️ *${AI_SHORT_NAME} Play*\n\nMusic service is napping. Try again in a moment.\n\nError: ${error.message.substring(0, 100)}`);
    }
    break;
}
// ─── VIDEO ────────────────────────────────────────────────────────────────────
case 'video': case 'ytmp4': {
    if (!q) return reply(`❗ Usage: ${activePrefix}video <youtube url or search>`);
    await react('🎬');
    try {
        let videoUrl = q;
        if (!/youtu/.test(q)) { const vi = await ytGetInfo(q); if (!vi) return reply('⚠️ No video found.'); videoUrl = vi.url || `https://www.youtube.com/watch?v=${vi.id}`; }
        await reply('⬇️ Downloading video...');
        const dlUrl = await ytDownloadMp4(videoUrl);
        if (dlUrl) { await socket.sendMessage(from, { video: { url: dlUrl }, mimetype: 'video/mp4', caption: `🎬 Video downloaded${WM}` }, { quoted: fakeCard }); await react('✅'); break; }
        const localVid = await localYtVideo(videoUrl);
        if (!isValidBuffer(localVid)) return reply('⚠️ All video download services failed.');
        await socket.sendMessage(from, { video: localVid, mimetype: 'video/mp4', caption: `🎬 Video downloaded${WM}` }, { quoted: fakeCard }); await react('✅');
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}

// ─── QUOTES ─────────────────────────────────────────────────────────
case 'heartbreak': {
    try {
        await socket.sendMessage(from, { react: { text: '💔', key: msg.key } });
        const response = await axios.get('https://api.giftedtech.co.ke/api/fun/heartbreak?apikey=gifted');
        
        if (response.data.status && response.data.result) {
            await socket.sendMessage(from, {
                text: `💔 *Heartbreak Quote*\n\n${response.data.result}\n\n_powered by whitekid tech_`
            }, { quoted: msg });
        } else {
            await socket.sendMessage(from, {
                text: '❌ Failed to fetch heartbreak quote.'
            }, { quoted: msg });
        }
    } catch (error) {
        console.error('Heartbreak command error:', error);
        await socket.sendMessage(from, {
            text: '❌ Error fetching heartbreak quote.'
        }, { quoted: msg });
    }
    break;
}

case 'friendship': {
    try {
        await socket.sendMessage(from, { react: { text: '🤝', key: msg.key } });
        const response = await axios.get('https://api.giftedtech.co.ke/api/fun/friendship?apikey=gifted');
        
        if (response.data.status && response.data.result) {
            await socket.sendMessage(from, {
                text: `🤝 *Friendship Quote*\n\n${response.data.result}\n\n_powered by whitekid tech_`
            }, { quoted: msg });
        } else {
            await socket.sendMessage(from, {
                text: '❌ Failed to fetch friendship quote.'
            }, { quoted: msg });
        }
    } catch (error) {
        console.error('Friendship command error:', error);
        await socket.sendMessage(from, {
            text: '❌ Error fetching friendship quote.'
        }, { quoted: msg });
    }
    break;
}

case 'love': {
    try {
        await socket.sendMessage(from, { react: { text: '❤️', key: msg.key } });
        const response = await axios.get('https://api.giftedtech.co.ke/api/fun/love?apikey=gifted');
        
        if (response.data.status && response.data.result) {
            await socket.sendMessage(from, {
                text: `❤️ *Love Quote*\n\n${response.data.result}\n\n_powered by whitekid tech_`
            }, { quoted: msg });
        } else {
            await socket.sendMessage(from, {
                text: '❌ Failed to fetch love quote.'
            }, { quoted: msg });
        }
    } catch (error) {
        console.error('Love command error:', error);
        await socket.sendMessage(from, {
            text: '❌ Error fetching love quote.'
        }, { quoted: msg });
    }
    break;
}

case 'newyear': {
    try {
        await socket.sendMessage(from, { react: { text: '🎉', key: msg.key } });
        const response = await axios.get('https://api.giftedtech.co.ke/api/fun/newyear?apikey=gifted');
        
        if (response.data.status && response.data.result) {
            await socket.sendMessage(from, {
                text: `🎉 *New Year Message*\n\n${response.data.result}\n\n_powered by whitekid tech_`
            }, { quoted: msg });
        } else {
            await socket.sendMessage(from, {
                text: '❌ Failed to fetch New Year message.'
            }, { quoted: msg });
        }
    } catch (error) {
        console.error('Newyear command error:', error);
        await socket.sendMessage(from, {
            text: '❌ Error fetching New Year message.'
        }, { quoted: msg });
    }
    break;
}

case 'boyfriendsday': {
    try {
        await socket.sendMessage(from, { react: { text: '💙', key: msg.key } });
        const response = await axios.get('https://api.giftedtech.co.ke/api/fun/boyfriendsday?apikey=gifted');
        
        if (response.data.status && response.data.result) {
            await socket.sendMessage(from, {
                text: `💙 *Boyfriend's Day Message*\n\n${response.data.result}\n\n_powered by whitekid tech_`
            }, { quoted: msg });
        } else {
            await socket.sendMessage(from, {
                text: '❌ Failed to fetch Boyfriend\'s Day message.'
            }, { quoted: msg });
        }
    } catch (error) {
        console.error('Boyfriendsday command error:', error);
        await socket.sendMessage(from, {
            text: '❌ Error fetching Boyfriend\'s Day message.'
        }, { quoted: msg });
    }
    break;
}

case 'christmas': {
    try {
        await socket.sendMessage(from, { react: { text: '🎄', key: msg.key } });
        const response = await axios.get('https://api.giftedtech.co.ke/api/fun/christmas?apikey=gifted');
        
        if (response.data.status && response.data.result) {
            await socket.sendMessage(from, {
                text: `🎄 *Christmas Message*\n\n${response.data.result}\n\n_powered by whitekid tech_`
            }, { quoted: msg });
        } else {
            await socket.sendMessage(from, {
                text: '❌ Failed to fetch Christmas message.'
            }, { quoted: msg });
        }
    } catch (error) {
        console.error('Christmas command error:', error);
        await socket.sendMessage(from, {
            text: '❌ Error fetching Christmas message.'
        }, { quoted: msg });
    }
    break;
}

case 'mothersday': {
    try {
        await socket.sendMessage(from, { react: { text: '👩', key: msg.key } });
        const response = await axios.get('https://api.giftedtech.co.ke/api/fun/mothersday?apikey=gifted');
        
        if (response.data.status && response.data.result) {
            await socket.sendMessage(from, {
                text: `👩‍👧‍👦 *Mother's Day Message*\n\n${response.data.result}\n\n_powered by whitekid tech_`
            }, { quoted: msg });
        } else {
            await socket.sendMessage(from, {
                text: '❌ Failed to fetch Mother\'s Day message.'
            }, { quoted: msg });
        }
    } catch (error) {
        console.error('Mothersday command error:', error);
        await socket.sendMessage(from, {
            text: '❌ Error fetching Mother\'s Day message.'
        }, { quoted: msg });
    }
    break;
}

// ─── LYRICS — ENHANCED WITH LRCLIB FALLBACK ───────────────────────────────────
case 'lyrics': case 'lyric': case 'lirik': {
    if (!q) return reply(`❗ Usage: ${activePrefix}lyrics <song name>\n\n📌 Example: ${activePrefix}lyrics Shape of You`);
    await react('🎶');
    try {
        // Try lrclib for rich metadata first
        let lyricsText = null, trackTitle = q, artistName = '';
        try {
            const { data: lrcData } = await axios.get(`https://lrclib.net/api/search?q=${encodeURIComponent(q)}`, { timeout: 15000 });
            if (lrcData?.[0]) {
                const r = lrcData[0];
                trackTitle = r.trackName || q;
                artistName = r.artistName || '';
                lyricsText = r.plainLyrics || r.syncedLyrics?.replace(/\[\d+:\d+\.\d+\]/g, '').trim();
            }
        } catch {}

        // Fallback to other engines
        if (!lyricsText) lyricsText = await getLyrics(q);

        if (lyricsText) {
            const header = artistName
                ? `🎶 *${trackTitle}*\n🎤 *Artist:* ${artistName}\n\n`
                : `🎶 *Lyrics: ${q}*\n\n`;
            await reply(`${header}${lyricsText.substring(0, 3500)}`);
        } else {
            await reply(`⚠️ Lyrics not found for *${q}*\n\n_Try a more specific title._`);
        }
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}

// ─── AIO DOWNLOADER ───────────────────────────────────────────────────────────
case 'aio': case 'alldown': {
    if (!q) return reply(`❗ Usage: ${activePrefix}aio <url>\n\nSupports: YouTube, TikTok, Instagram, Facebook, Twitter, and more!`);
    await react('⬇️'); await reply(`⬇️ Downloading from: ${q.substring(0, 60)}...`);
    try {
        const result = await aioDownload(q);
        if (!result) return reply('⚠️ Could not download from that URL.');
        const video = result.video || result.mp4 || result.download_url;
        const audio = result.audio || result.mp3;
        const image = result.image || result.photo || result.thumbnail;
        const title = result.title || result.name || 'Downloaded file';
        if (video) { await socket.sendMessage(from, { video: { url: video }, mimetype: 'video/mp4', caption: `⬇️ *${title}*${WM}` }, { quoted: fakeCard }); }
        else if (audio) { await socket.sendMessage(from, { audio: { url: audio }, mimetype: 'audio/mpeg', ptt: false }, { quoted: fakeCard }); }
        else if (image) { await replyImg(image, `⬇️ *${title}*`); }
        else reply('⚠️ No downloadable media found in that URL.');
        await react('✅');
    } catch (e) { reply(`⚠️ AIO download failed: ${e.message}`); }
    break;
}

// ─── FACEBOOK ─────────────────────────────────────────────────────────────────
case 'fb': case 'facebook': {
    if (!q) return reply(`❗ Usage: ${activePrefix}fb <url>`);
    await react('📘');
    try {
        let vidUrl = null;
        for (const fn of [
            async () => { const { data } = await axios.get(`${config.NAYAN_API}/alldown?url=${encodeURIComponent(q)}`, { timeout: 30000 }); return data?.result?.video || data?.video; },
            async () => { const { data } = await axios.get(`${config.ELITE_API}/facebook?url=${encodeURIComponent(q)}`, { timeout: 30000 }); return data?.result?.download_url || data?.hd_video || data?.sd_video; },
            async () => { const { data } = await axios.get(`https://suhas-bro-api.vercel.app/download/fbdown?url=${encodeURIComponent(q)}`); return data?.result?.sd || data?.result?.hd; }
        ]) { try { const r = await fn(); if (r) { vidUrl = r; break; } } catch {} }
        if (!vidUrl) return reply('⚠️ Failed to fetch Facebook video.');
        await socket.sendMessage(from, { video: { url: vidUrl }, mimetype: 'video/mp4', caption: `📘 Facebook Video${WM}` }, { quoted: fakeCard }); await react('✅');
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}

// ─── TIKTOK ───────────────────────────────────────────────────────────────────
case 'tiktok': case 'ttdl': {
    if (!q) return reply(`❗ Usage: ${activePrefix}tiktok <url>`);
    await react('🎵');
    try {
        let vidUrl = null, titleT = '', coverUrl = null;
        for (const fn of [
            async () => { const { data } = await axios.get(`${config.PREXZY_API}/download/tiktokvideo?url=${encodeURIComponent(q)}`, { timeout: 30000 }); if (data?.result?.video) { vidUrl = data.result.video; titleT = data.result.title || ''; coverUrl = data.result.cover; return true; } },
            async () => { const { data } = await axios.get(`${config.GIFTED_TECH_API}/api/download/tiktok?apikey=${config.GIFTED_API_KEY}&url=${encodeURIComponent(q)}`, { timeout: 30000 }); if (data?.success && data?.result?.video) { vidUrl = data.result.video; titleT = data.result.title || ''; coverUrl = data.result.cover; return true; } },
            async () => { const { data } = await axios.get(`${config.NAYAN_API}/alldown?url=${encodeURIComponent(q)}`, { timeout: 30000 }); if (data?.result?.video) { vidUrl = data.result.video; return true; } }
        ]) { try { const r = await fn(); if (r) break; } catch {} }
        if (!vidUrl) return reply('⚠️ Failed to fetch TikTok video.');
        if (coverUrl) await socket.sendMessage(from, { image: { url: coverUrl }, caption: `🎵 *TikTok*\n${titleT}${WM}` }, { quoted: fakeCard });
        await socket.sendMessage(from, { video: { url: vidUrl }, mimetype: 'video/mp4', caption: `🎥 TikTok Video${WM}` }, { quoted: fakeCard }); await react('✅');
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}

// ─── INSTAGRAM ────────────────────────────────────────────────────────────────
case 'ig': case 'insta': {
    if (!q) return reply(`❗ Usage: ${activePrefix}ig <instagram url>`);
    await react('📸');
    try {
        let vidUrl = null;
        for (const fn of [
            async () => { const { data } = await axios.get(`${config.NAYAN_API}/instagram?url=${encodeURIComponent(q)}`, { timeout: 30000 }); return data?.result?.download_url || data?.url || data?.video; },
            async () => { const { data } = await axios.get(`${config.GIFTED_TECH_API}/api/download/instadl?apikey=${config.GIFTED_API_KEY}&url=${encodeURIComponent(q)}`, { timeout: 30000 }); return data?.result?.download_url; },
            async () => { const { data } = await axios.get(`${config.PREXZY_API}/download/aio?url=${encodeURIComponent(q)}`, { timeout: 30000 }); return data?.result?.video || data?.video; },
            async () => { const { igdl } = require('ruhend-scraper'); const res = await igdl(q); return res.data?.[0]?.url; }
        ]) { try { const r = await fn(); if (r) { vidUrl = r; break; } } catch {} }
        if (!vidUrl) return reply('⚠️ Failed to fetch Instagram content.');
        await socket.sendMessage(from, { video: { url: vidUrl }, mimetype: 'video/mp4', caption: `📸 Instagram Video${WM}` }, { quoted: fakeCard }); await react('✅');
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}

// ─── TWITTER ──────────────────────────────────────────────────────────────────
case 'twitter': case 'x': case 'twdl': {
    if (!q) return reply(`❗ Usage: ${activePrefix}twitter <url>`);
    await react('🐦');
    try {
        let vidUrl = null;
        for (const fn of [
            async () => { const { data } = await axios.get(`${config.NAYAN_API}/alldown?url=${encodeURIComponent(q)}`, { timeout: 30000 }); return data?.result?.video || data?.video; },
            async () => { const { data } = await axios.get(`${config.DAVID_API}/download/twitter?url=${encodeURIComponent(q)}`, { timeout: 30000 }); return data?.result?.videoUrls?.[0]?.url || data?.result?.download_url; },
            async () => { const { data } = await axios.get(`${config.GIFTED_TECH_API}/api/download/twitter?apikey=${config.GIFTED_API_KEY}&url=${encodeURIComponent(q)}`, { timeout: 30000 }); return data?.result?.videoUrls?.[0]?.url; }
        ]) { try { const r = await fn(); if (r) { vidUrl = r; break; } } catch {} }
        if (!vidUrl) return reply('⚠️ No video found.');
        await socket.sendMessage(from, { video: { url: vidUrl }, mimetype: 'video/mp4', caption: `🐦 Twitter Video${WM}` }, { quoted: fakeCard }); await react('✅');
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}

// ─── MEDIAFIRE — ENHANCED ─────────────────────────────────────────────────────
case 'mediafire': case 'mfdl': {
    if (!q) return reply(`❗ Usage: ${activePrefix}mediafire <url>`);
    await react('☁️');
    try {
        const result = await mediafireDl(q);
        if (!result?.link) return reply('⚠️ Failed to fetch MediaFire download link.');

        const fileName = result.name || 'file';
        const fileSize = result.size || 'Unknown';
        const fileExt = (fileName.split('.').pop() || 'bin').toLowerCase();

        await reply(`📁 *${fileName}*\n📦 *Size:* ${fileSize}\n⬇️ _Downloading..._`);

        // Try to send as document — works for most file types
        await socket.sendMessage(from, {
            document: { url: result.link },
            fileName: fileName,
            mimetype: result.mimetype || 'application/octet-stream',
            caption: `☁️ *MediaFire*\n📁 ${fileName}\n📦 ${fileSize}${WM}`
        }, { quoted: fakeCard });

        await react('✅');
    } catch (e) { reply(`⚠️ MediaFire error: ${e.message}`); }
    break;
}

// ─── APK ──────────────────────────────────────────────────────────────────────
case 'apk': {
    if (!q) return reply(`❗ Usage: ${activePrefix}apk <app name>\n\nExample: ${activePrefix}apk ha tunnel`);
    await react('📦');
    await reply(`🔎 *Searching APK:* ${q}`);
    try {
        let results = [];
        // Search using multiple APIs
        try { const { data } = await axios.get(`${config.DISCARD_API}/api/apk/search?apikey=guru&q=${encodeURIComponent(q)}`, { timeout: 15000 }); if (data?.result?.length) results = data.result.slice(0, 5); } catch {}
        if (!results.length) { try { const r = await fetch(`https://api.nexoracle.com/downloader/apk?q=${encodeURIComponent(q)}&apikey=free_key@maher_apis`); const d = await r.json(); if (d?.status === 200 && d?.result) results = [{ judul: d.result.name, dev: d.result.package, rating: d.result.rating || 'N/A', link: d.result.dllink, thumb: d.result.icon }]; } catch {} }
        if (!results.length) { try { const { data } = await axios.get(`${config.QASIM_API}/api/apkpure/search?q=${encodeURIComponent(q)}`, { timeout: 15000 }); if (data?.result?.length) results = data.result.slice(0, 3); } catch {} }
        if (!results.length) { try { const { data: apkX } = await axios.get(`${config.NEXRAY_API}/downloader/apk?q=${encodeURIComponent(q)}`, { timeout: 15000 }); if (apkX?.result?.length) results = apkX.result.slice(0, 3); } catch {} }
        if (!results.length) return reply('⚠️ No APKs found for: ' + q);

        // Take first result and send details + image
        const top = results[0];
        const appName = (top.judul || top.name || q).substring(0, 60);
        const appDev = top.dev || top.developer || 'N/A';
        const appRating = top.rating || 'N/A';
        const appThumb = top.thumb || top.icon || botImg;

        // Send app details with image
        await socket.sendMessage(from, {
            image: { url: appThumb },
            caption: `📦 *${appName}*\n👨‍💻 *Dev:* ${appDev}\n⭐ *Rating:* ${appRating}\n\n⬇️ _Downloading APK file..._${WM}\n`
        }, { quoted: fakeCard });

        // Download and send APK
        try {
            let apkUrl = null, apkName = appName, apkSize = 'N/A', apkReq = 'N/A';
            // Try DISCARD API download
            try {
                const dlUrl = `${config.DISCARD_API}/api/apk/dl/android1?apikey=guru&url=${encodeURIComponent(top.link || top.url || '')}`;
                const { data: dlRes } = await axios.get(dlUrl, { timeout: 60000 });
                const apk = dlRes?.result;
                if (apk?.url) { apkUrl = apk.url; apkName = apk.name || appName; apkSize = apk.size || 'N/A'; apkReq = apk.requirement || 'N/A'; }
            } catch {}
            // Fallback: use top.link directly
            if (!apkUrl && (top.link || top.dllink || top.url)) apkUrl = top.link || top.dllink || top.url;
            if (!apkUrl) throw new Error('No APK URL found');
            const safeName = apkName.replace(/[^\w.-]/g, '_');
            await socket.sendMessage(from, {
                document: { url: apkUrl },
                fileName: `${safeName}.apk`,
                mimetype: 'application/vnd.android.package-archive',
                caption: `✅ *${apkName}*\n📦 *Size:* ${apkSize}\n📱 *Requires:* ${apkReq}${WM}\n`
            }, { quoted: fakeCard });
            await react('✅');
        } catch (e) { await reply(`⚠️ APK download failed: ${e.message}\nTry a more specific app name.`); }
    } catch (e) { reply(`⚠️ APK error: ${e.message}`); }
    break;
}

// ─── WEBP TO MP4 ──────────────────────────────────────────────────────────────
case 'webp2mp4': case 'webptomp4': {
    await react('🎞️');
    // Extract sticker from quoted message (Baileys contextInfo pattern)
    const wCtx = msg.message?.extendedTextMessage?.contextInfo;
    const wQuoted = wCtx?.quotedMessage;
    const stickerMsgW = wQuoted?.stickerMessage || msg.message?.stickerMessage;
    if (!stickerMsgW) return reply('⚠️ Reply to a sticker to convert it to MP4.');
    try {
        const s = await downloadContentFromMessage(stickerMsgW, 'sticker'); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]);
        const tmpWebp = path.join(os.tmpdir(), `sticker_${Date.now()}.webp`); fs.writeFileSync(tmpWebp, b);
        await reply('⏳ Converting WebP to MP4...');
        const result = await webp2mp4File(tmpWebp);
        try { fs.unlinkSync(tmpWebp); } catch {}
        if (result?.result) { await socket.sendMessage(from, { video: { url: result.result }, mimetype: 'video/mp4', caption: `🎞️ *WebP → MP4*${WM}` }, { quoted: fakeCard }); await react('✅'); }
        else reply('⚠️ Conversion failed.');
    } catch (e) { reply(`⚠️ WebP→MP4 error: ${e.message}`); }
    break;
}

// ─── STICKER TO IMAGE — NEW (adapted from example toimg handler) ──────────────
case 'toimg': case 'stickertoimg': case 'sticker2img': {
    await react('🖼️');
    // Check for quoted sticker or image
    const qMsgToImg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
    const stickerMsgTI = qMsgToImg?.stickerMessage || msg.message?.stickerMessage;
    const imageMsgTI = qMsgToImg?.imageMessage || msg.message?.imageMessage;

    if (!stickerMsgTI && !imageMsgTI) {
        return reply('⚠️ Reply to a sticker (WebP) or image to convert it to PNG.\n\nUsage: Reply to sticker/image and send ' + activePrefix + 'toimg');
    }

    try {
        let mediaBuffer = Buffer.from([]);

        if (stickerMsgTI) {
            // Download sticker
            const stream = await downloadContentFromMessage(stickerMsgTI, 'sticker');
            for await (const chunk of stream) mediaBuffer = Buffer.concat([mediaBuffer, chunk]);
        } else {
            // Download image
            const stream = await downloadContentFromMessage(imageMsgTI, 'image');
            for await (const chunk of stream) mediaBuffer = Buffer.concat([mediaBuffer, chunk]);
        }

        if (!mediaBuffer || mediaBuffer.length === 0) return reply('⚠️ Failed to download media.');

        await reply('⏳ *Converting to PNG...*');

        // Convert using sharp (if available)
        let pngBuffer = null;
        if (sharp) {
            try {
                pngBuffer = await sharp(mediaBuffer)
                    .toFormat('png')
                    .png({ quality: 100, compressionLevel: 9 })
                    .toBuffer();
            } catch (sharpErr) {
                console.error('[TOIMG sharp]', sharpErr.message);
            }
        }

        // If sharp failed or unavailable, try ezgif webp2png via webp2mp4File approach
        if (!pngBuffer || pngBuffer.length === 0) {
            // Fallback: upload to catbox and use an online converter
            try {
                const webpUrl = await uploadToCatbox(mediaBuffer, 'image/webp');
                const { data: convData } = await axios.get(
                    `https://api.siputzx.my.id/api/tools/webp2png?url=${encodeURIComponent(webpUrl)}`,
                    { responseType: 'arraybuffer', timeout: 30000 }
                );
                pngBuffer = Buffer.from(convData);
            } catch {}
        }

        if (!pngBuffer || pngBuffer.length === 0) {
            return reply('⚠️ Conversion failed. Make sure sharp is installed (`npm install sharp`) or try again.');
        }

        await socket.sendMessage(from, {
            image: pngBuffer,
            caption: `🖼️ *Converted to PNG!*${WM}`
        }, { quoted: fakeCard });

        await react('✅');
    } catch (e) {
        console.error('[TOIMG]', e.message);
        reply(`⚠️ Conversion error: ${e.message}`);
    }
    break;
}

// ─── TELEGRAPH UPLOAD ─────────────────────────────────────────────────────────
case 'telegraph': case 'tph': {
    await react('📤');
    const quotedImgTph = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
    if (!quotedImgTph?.imageMessage && !msg.message?.imageMessage) return reply('❗ Reply to an image to upload to Telegraph.');
    try {
        const imgObj = quotedImgTph?.imageMessage || msg.message.imageMessage;
        const s = await downloadContentFromMessage(imgObj, 'image'); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]);
        const ext = await fromBuffer(b).catch(() => ({ ext: 'jpg' }));
        const tmp = path.join(os.tmpdir(), `tph_${Date.now()}.${ext?.ext || 'jpg'}`); fs.writeFileSync(tmp, b);
        const url = await TelegraPh(tmp);
        try { fs.unlinkSync(tmp); } catch {}
        await reply(`📤 *Telegraph Upload:*\n\n🔗 ${url}`); await react('✅');
    } catch (e) { reply(`⚠️ Telegraph upload failed: ${e.message}`); }
    break;
}

// ─── UGUU UPLOAD ──────────────────────────────────────────────────────────────
case 'uploadugu': case 'uguu': {
    await react('📤');
    const quotedImgUgu = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
    const hasMediaUgu = quotedImgUgu?.imageMessage || quotedImgUgu?.videoMessage || quotedImgUgu?.audioMessage || msg.message?.imageMessage;
    if (!hasMediaUgu) return reply('❗ Reply to media (image/video/audio) to upload to Uguu.');
    try {
        const msgObj = quotedImgUgu?.imageMessage ? { obj: quotedImgUgu.imageMessage, type: 'image', ext: 'jpg' } : quotedImgUgu?.videoMessage ? { obj: quotedImgUgu.videoMessage, type: 'video', ext: 'mp4' } : quotedImgUgu?.audioMessage ? { obj: quotedImgUgu.audioMessage, type: 'audio', ext: 'ogg' } : { obj: msg.message.imageMessage, type: 'image', ext: 'jpg' };
        const s = await downloadContentFromMessage(msgObj.obj, msgObj.type); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]);
        const tmp = path.join(os.tmpdir(), `uguu_${Date.now()}.${msgObj.ext}`); fs.writeFileSync(tmp, b);
        const result = await UploadFileUgu(tmp);
        try { fs.unlinkSync(tmp); } catch {}
        if (result?.url) await reply(`📤 *Uguu Upload:*\n\n🔗 ${result.url}\n📁 ${result.name || 'file'}\n📦 ${result.size ? fmtBytes(result.size) : '?'}`);
        else reply('⚠️ Upload failed.');
        await react('✅');
    } catch (e) { reply(`⚠️ Uguu upload failed: ${e.message}`); }
    break;
}

// ─── VIEW ONCE ────────────────────────────────────────────────────────────────
case 'vv': case 'rvo': case 'viewonce': {
    await react('✨');
    await viewonceCommand(socket, from, msg, fakeCard);
    break;
}

// ─── STICKER ──────────────────────────────────────────────────────────────────
case 'sticker': case 's': {
    await react('✨');
    try {
        // Properly extract media from quoted message (Baileys contextInfo)
        const sCtx = msg.message?.extendedTextMessage?.contextInfo;
        const sQuotedMsg = sCtx?.quotedMessage;
        const sCurMsg = msg.message;
        const sSrc = sQuotedMsg || sCurMsg;
        const sMediaType = ['imageMessage','videoMessage'].find(t => sSrc?.[t]);
        if (!sMediaType) return socket.sendMessage(from, { text: '⚠️ Reply to an image or video to make a sticker!' }, { quoted: msg });
        const sMediaObj = sSrc[sMediaType];
        const sDlType = sMediaType.replace('Message','');
        const sStream = await downloadContentFromMessage(sMediaObj, sDlType);
        let mediaBuf = Buffer.from([]);
        for await (const chunk of sStream) mediaBuf = Buffer.concat([mediaBuf, chunk]);
        if (!mediaBuf.length) throw new Error('Empty buffer');
        await socket.sendMessage(from, { sticker: mediaBuf }, { quoted: msg });
        await react('✅');
    } catch (e) { await socket.sendMessage(from, { text: `💔 Failed to create sticker: ${e.message}` }, { quoted: msg }); }
    break;
}

// ─── TOGIF ────────────────────────────────────────────────────────────────────
case 'togif': {
    await react('⏳');
    // Extract sticker from quoted message (Baileys contextInfo pattern)
    const gifCtx = msg.message?.extendedTextMessage?.contextInfo;
    const gifQuoted = gifCtx?.quotedMessage;
    const stickerMsg = gifQuoted?.stickerMessage || msg.message?.stickerMessage;
    if (!stickerMsg) return reply('⚠️ Reply to an animated sticker with .togif');
    const td = path.join(process.cwd(), 'temp'); if (!fs.existsSync(td)) fs.mkdirSync(td, { recursive: true });
    const ip = path.join(td, `togif_${Date.now()}.webp`), op = path.join(td, `togif_${Date.now()}.gif`);
    try { const s = await downloadContentFromMessage(stickerMsg, 'sticker'); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]); fs.writeFileSync(ip, b); if (!ffmpeg) return reply('⚠️ ffmpeg not available.'); await new Promise((res, rej) => { ffmpeg(ip).outputOptions(['-vf', 'fps=10,scale=512:512:force_original_aspect_ratio=decrease', '-loop', '0']).save(op).on('end', res).on('error', rej); }); await socket.sendMessage(from, { video: fs.readFileSync(op), mimetype: 'video/gif', caption: '🎞️ Converted GIF' }, { quoted: fakeCard }); await react('✅'); } catch (e) { reply(`⚠️ ${e.message}`); } finally { try { fs.unlinkSync(ip); fs.unlinkSync(op); } catch {} }
    break;
}

// ─── REMINI ───────────────────────────────────────────────────────────────────
case 'remini': {
    await react('🪄');
    const qi = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
    if (!qi?.imageMessage && !msg.message?.imageMessage) return reply('❗ Reply to an image');
    try {
        const imgObj = qi?.imageMessage || msg.message.imageMessage;
        const s = await downloadContentFromMessage(imgObj, 'image'); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]);
        const imgUrl = await uploadSmartMedia(b, 'image/jpeg');
        let enhanced = null;
        for (const fn of [async () => { const { data } = await axios.get(`${config.DAVID_API}/tools/remini?imageUrl=${encodeURIComponent(imgUrl)}`, { timeout: 60000 }); return data?.result?.image || data?.imageUrl; }, async () => { const { data } = await axios.get(`https://api.siputzx.my.id/api/tools/remini?url=${encodeURIComponent(imgUrl)}`, { timeout: 60000 }); return data?.result || data?.url; }]) { try { const r = await fn(); if (r) { enhanced = r; break; } } catch {} }
        if (enhanced) await socket.sendMessage(from, { image: { url: enhanced }, caption: `🪄 *Remini Enhanced!*${WM}` }, { quoted: fakeCard });
        else reply('⚠️ Remini failed.');
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}

// ─── REMOVEBG ─────────────────────────────────────────────────────────────────
case 'removebg': {
    await react('✂️');
    const qiRb = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
    const hasImgRb = qiRb?.imageMessage || msg.message?.imageMessage;
    if (!hasImgRb && !q) return reply('❗ Reply to an image or provide URL.');
    try {
        let imgUrl = q;
        if (!imgUrl || !imgUrl.startsWith('http')) { const imgObj = qiRb?.imageMessage || msg.message.imageMessage; const s = await downloadContentFromMessage(imgObj, 'image'); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]); imgUrl = await uploadSmartMedia(b, 'image/jpeg'); }
        const { data } = await axios.get(`https://api.siputzx.my.id/api/iloveimg/removebg?image=${encodeURIComponent(imgUrl)}`, { responseType: 'arraybuffer', timeout: 60000 });
        if (data) await socket.sendMessage(from, { image: Buffer.from(data), caption: `✂️ *Background Removed!*${WM}` }, { quoted: fakeCard });
        else reply('⚠️ RemoveBG failed.');
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}

// ─── IMAGE EDITORS ────────────────────────────────────────────────────────────
case 'wasted': { await react('💀'); const qi2 = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message; if (!qi2?.imageMessage && !msg.message?.imageMessage) return reply('❗ Reply to an image'); try { const imgObj = qi2?.imageMessage || msg.message.imageMessage; const s = await downloadContentFromMessage(imgObj, 'image'); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]); const imgUrl = await uploadSmartMedia(b, 'image/jpeg'); const { data } = await axios.get(`${config.NEXRAY_API}/editor/wasted?url=${encodeURIComponent(imgUrl)}`, { responseType: 'arraybuffer', timeout: 30000 }); await socket.sendMessage(from, { image: Buffer.from(data), caption: `💀 *WASTED!*${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'jail': { await react('🚔'); const qi3 = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message; if (!qi3?.imageMessage && !msg.message?.imageMessage) return reply('❗ Reply to an image'); try { const imgObj = qi3?.imageMessage || msg.message.imageMessage; const s = await downloadContentFromMessage(imgObj, 'image'); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]); const imgUrl = await uploadSmartMedia(b, 'image/jpeg'); const { data } = await axios.get(`https://api.siputzx.my.id/api/maker/jail?url=${encodeURIComponent(imgUrl)}`, { responseType: 'arraybuffer', timeout: 30000 }); await socket.sendMessage(from, { image: Buffer.from(data), caption: `🚔 *JAILED!*${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'wanted': { await react('🎯'); const qi4 = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message; if (!qi4?.imageMessage && !msg.message?.imageMessage) return reply('❗ Reply to an image'); try { const imgObj = qi4?.imageMessage || msg.message.imageMessage; const s = await downloadContentFromMessage(imgObj, 'image'); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]); const imgUrl = await uploadSmartMedia(b, 'image/jpeg'); const { data } = await axios.get(`${config.NEXRAY_API}/editor/wanted?url=${encodeURIComponent(imgUrl)}&text=${encodeURIComponent(q || 'WANTED')}`, { responseType: 'arraybuffer', timeout: 30000 }); await socket.sendMessage(from, { image: Buffer.from(data), caption: `🎯 *WANTED!*${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'gun': { await react('🔫'); const qi5 = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message; if (!qi5?.imageMessage && !msg.message?.imageMessage) return reply('❗ Reply to an image'); try { const imgObj = qi5?.imageMessage || msg.message.imageMessage; const s = await downloadContentFromMessage(imgObj, 'image'); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]); const imgUrl = await uploadSmartMedia(b, 'image/jpeg'); const { data } = await axios.get(`${config.DAVID_API}/canvas/gun?imageUrl=${encodeURIComponent(imgUrl)}`, { responseType: 'arraybuffer', timeout: 30000 }); await socket.sendMessage(from, { image: Buffer.from(data), caption: `🔫 *GUN EFFECT!*${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'brat': { await react('😈'); if (!q) return reply(`Usage: ${activePrefix}brat <text>`); try { const { data } = await axios.get(`https://api.siputzx.my.id/api/maker/brat?text=${encodeURIComponent(q)}`, { responseType: 'arraybuffer', timeout: 30000 }); await socket.sendMessage(from, { image: Buffer.from(data), caption: `😈 *Brat: ${q}*${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'neon': { await react('🌈'); if (!q) return reply(`Usage: ${activePrefix}neon <text>`); try { const { data } = await axios.get(`https://api.siputzx.my.id/api/maker/neon?text=${encodeURIComponent(q)}`, { responseType: 'arraybuffer', timeout: 30000 }); await socket.sendMessage(from, { image: Buffer.from(data), caption: `🌈 *Neon: ${q}*${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }

// ─── PREXZY IMAGE CREATORS ────────────────────────────────────────────────────
case 'spongebob': { await react('🤣'); if (!q) return reply(`Usage: ${activePrefix}spongebob <text>`); try { const { data } = await axios.get(`${config.PREXZY_API}/imagecreator/spongebob?text=${encodeURIComponent(q)}`, { responseType: 'arraybuffer', timeout: 30000 }); await socket.sendMessage(from, { image: Buffer.from(data), caption: `🧽 *SpongeBob says:* ${q}${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'memetext': { await react('🖼️'); if (!q) return reply(`Usage: ${activePrefix}memetext <text>`); try { const { data } = await axios.get(`${config.PREXZY_API}/imagecreator/memeText?text=${encodeURIComponent(q)}&width=800&height=600`, { responseType: 'arraybuffer', timeout: 30000 }); await socket.sendMessage(from, { image: Buffer.from(data), caption: `🖼️ *Meme: ${q}*${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'textgif': { await react('🎬'); if (!q) return reply(`Usage: ${activePrefix}textgif <text> | <bg_color> | <text_color>`); try { const parts = q.split('|').map(s => s.trim()); const txt = parts[0], bg = (parts[1] || '000000').replace('#', ''), color = (parts[2] || 'ffffff').replace('#', ''); const { data } = await axios.get(`${config.PREXZY_API}/imagecreator/gif?text=${encodeURIComponent(txt)}&background=${bg}&color=${color}`, { responseType: 'arraybuffer', timeout: 30000 }); await socket.sendMessage(from, { video: Buffer.from(data), mimetype: 'video/gif', caption: `🎬 *Text GIF: ${txt}*${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'textmp4': { await react('🎬'); if (!q) return reply(`Usage: ${activePrefix}textmp4 <text> | <bg_color> | <text_color>`); try { const parts = q.split('|').map(s => s.trim()); const txt = parts[0], bg = (parts[1] || '000000').replace('#', ''), color = (parts[2] || 'ffffff').replace('#', ''); const { data } = await axios.get(`${config.PREXZY_API}/imagecreator/mp4?text=${encodeURIComponent(txt)}&background=${bg}&color=${color}`, { responseType: 'arraybuffer', timeout: 30000 }); await socket.sendMessage(from, { video: Buffer.from(data), mimetype: 'video/mp4', caption: `🎬 *Text Video: ${txt}*${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }

// ─── QR / SSWEB ───────────────────────────────────────────────────────────────
case 'qr': { await react('🔳'); if (!q) return reply(`Usage: ${activePrefix}qr <text>`); try { const { data } = await axios.get(`https://api.siputzx.my.id/api/tools/qr?text=${encodeURIComponent(q)}`, { responseType: 'arraybuffer', timeout: 15000 }); await socket.sendMessage(from, { image: Buffer.from(data), caption: `🔳 *QR Code: ${q}*${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'ssweb': { await react('🌐'); if (!q) return reply(`Usage: ${activePrefix}ssweb <url>`); try { const { data } = await axios.get(`https://api.siputzx.my.id/api/tools/ssweb?url=${encodeURIComponent(q)}&theme=light&device=desktop`, { responseType: 'arraybuffer', timeout: 30000 }); await socket.sendMessage(from, { image: Buffer.from(data), caption: `🌐 *Screenshot: ${q}*${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }

// ─── GOOGLE SEARCH — NEW ──────────────────────────────────────────────────────
case 'google': case 'search': {
    await react('🔍');
    if (!q) return reply(`Usage: ${activePrefix}google <query>\n\n📌 Example: ${activePrefix}google best programming languages 2026`);
    try {
        // Try to get real search results first
        let searchResults = null;
        try {
            const { data } = await axios.get(`${config.NEXRAY_API}/search/google?query=${encodeURIComponent(q)}`, { timeout: 15000 });
            searchResults = data?.result || data?.results;
        } catch {}

        if (!searchResults) {
            try {
                const { data } = await axios.get(`${config.DAVID_API}/search/google?query=${encodeURIComponent(q)}`, { timeout: 15000 });
                searchResults = data?.result || data?.results;
            } catch {}
        }

        if (!searchResults) {
            try {
                const { data } = await axios.get(`${config.ELITE_API}/google?query=${encodeURIComponent(q)}`, { timeout: 15000 });
                searchResults = data?.result || data?.results;
            } catch {}
        }

        if (searchResults && Array.isArray(searchResults) && searchResults.length > 0) {
            let txt = `🔍 *Google Search: ${q}*\n\n`;
            searchResults.slice(0, 5).forEach((r, i) => {
                const title = r.title || r.name || 'No title';
                const desc = (r.description || r.snippet || r.desc || '').substring(0, 120);
                const link = r.url || r.link || r.href || '';
                txt += `*${i + 1}. ${title}*\n${desc}\n${link ? `🔗 ${link}` : ''}\n\n`;
            });
            await reply(txt.trim());
        } else {
            // Fallback: provide a Google search link
            const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
            await replyImg(botImg,
                `🔍 *Google Search: ${q}*\n\n🌐 Open this link to view results:\n${googleUrl}\n\n_No direct results fetched — tap the link to search on Google._`
            );
        }
        await react('✅');
    } catch (e) { reply(`⚠️ Google search error: ${e.message}`); }
    break;
}

// ─── FETCH — ENHANCED (adapted from example fetch handler) ───────────────────
case 'fetch': case 'get': {
    if (!q) return reply(`Usage: ${activePrefix}fetch <url>\n\nFetches any URL and returns content.\nSupports: images, JSON, text, HTML, documents`);
    await react('📡');

    // Normalise URL
    let fetchUrl = q.trim();
    if (!/^https?:\/\//i.test(fetchUrl)) fetchUrl = 'http://' + fetchUrl;

    try {
        const MAX_REDIRECTS = 10;
        let redirectCount = 0;
        let currentUrl = fetchUrl;

        while (redirectCount < MAX_REDIRECTS) {
            const response = await axios.get(currentUrl, {
                timeout: 20000,
                maxRedirects: 0,
                validateStatus: s => s < 400 || s === 301 || s === 302 || s === 307 || s === 308,
                responseType: 'arraybuffer'
            });

            const contentType = (response.headers['content-type'] || '').toLowerCase();
            const contentLength = parseInt(response.headers['content-length'] || '0');

            // Guard against huge files (>100MB)
            if (contentLength > 100 * 1024 * 1024) {
                await reply(`⚠️ File too large (${fmtBytes(contentLength)}). Cannot fetch.`);
                break;
            }

            // Handle redirects manually
            if ([301, 302, 307, 308].includes(response.status)) {
                const location = response.headers['location'];
                if (location) { currentUrl = location; redirectCount++; continue; }
                else break;
            }

            const rawBuffer = Buffer.from(response.data);
            const fileName = path.basename(new URL(currentUrl).pathname) || 'file';

            if (/^image\//.test(contentType)) {
                await socket.sendMessage(from, { image: rawBuffer, caption: `📡 *Fetched Image*\n🔗 ${currentUrl.substring(0, 80)}${WM}` }, { quoted: fakeCard });
            } else if (/^video\//.test(contentType)) {
                await socket.sendMessage(from, { video: rawBuffer, mimetype: contentType.split(';')[0], caption: `📡 *Fetched Video*\n🔗 ${currentUrl.substring(0, 80)}${WM}` }, { quoted: fakeCard });
            } else if (/^audio\//.test(contentType)) {
                await socket.sendMessage(from, { audio: rawBuffer, mimetype: contentType.split(';')[0], ptt: false }, { quoted: fakeCard });
            } else if (/json/.test(contentType)) {
                const txt = rawBuffer.toString('utf8');
                let pretty = txt;
                try { pretty = JSON.stringify(JSON.parse(txt), null, 2); } catch {}
                if (pretty.length <= 3500) {
                    await reply(`📡 *Fetch Result (JSON):*\n\n\`\`\`\n${pretty.substring(0, 3400)}\n\`\`\``);
                } else {
                    await socket.sendMessage(from, { document: Buffer.from(pretty), fileName: `${fileName}.json`, mimetype: 'application/json', caption: `📡 *Fetched JSON*\n🔗 ${currentUrl.substring(0, 60)}${WM}` }, { quoted: fakeCard });
                }
            } else if (/^text\//.test(contentType)) {
                const txt = rawBuffer.toString('utf8');
                if (txt.length <= 3500) {
                    await reply(`📡 *Fetch Result (${contentType.split(';')[0]}):*\n\n${txt.substring(0, 3400)}`);
                } else {
                    const ext = /html/.test(contentType) ? 'html' : 'txt';
                    await socket.sendMessage(from, { document: rawBuffer, fileName: `${fileName}.${ext}`, mimetype: contentType.split(';')[0] || 'text/plain', caption: `📡 *Fetched Text File*\n🔗 ${currentUrl.substring(0, 60)}${WM}` }, { quoted: fakeCard });
                }
            } else {
                // Send as generic document
                await socket.sendMessage(from, { document: rawBuffer, fileName: fileName, mimetype: contentType.split(';')[0] || 'application/octet-stream', caption: `📡 *Fetched File*\n📁 ${fileName}\n📦 ${fmtBytes(rawBuffer.length)}\n🔗 ${currentUrl.substring(0, 60)}${WM}` }, { quoted: fakeCard });
            }

            await react('✅');
            break;
        }

        if (redirectCount >= MAX_REDIRECTS) {
            await reply(`⚠️ Too many redirects (max: ${MAX_REDIRECTS}).`);
        }
    } catch (e) {
        reply(`⚠️ Fetch error: ${e.message}`);
    }
    break;
}

// ─── OCR ──────────────────────────────────────────────────────────────────────
case 'ocr': {
    await react('🔍');
    const qiOcr = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
    if (!qiOcr?.imageMessage && !msg.message?.imageMessage) return reply('❗ Reply to an image');
    try { const imgObj = qiOcr?.imageMessage || msg.message.imageMessage; const s = await downloadContentFromMessage(imgObj, 'image'); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]); const imgUrl = await uploadSmartMedia(b, 'image/jpeg'); const { data } = await axios.get(`${config.NEXRAY_API}/tools/ocr?imageUrl=${encodeURIComponent(imgUrl)}`, { timeout: 30000 }); const t = data?.result || data?.text; if (t) await reply(`🔍 *OCR Result:*\n\n${t}`); else reply('⚠️ OCR failed.'); } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}

// ─── URL UPLOAD (catbox) ──────────────────────────────────────────────────────
case 'url': case 'tourl': case 'catbox': {
    await react('📤');
    try {
        // Properly extract quoted message (reply) using Baileys contextInfo
        const quotedCtx = msg.message?.extendedTextMessage?.contextInfo;
        const quotedMsg = quotedCtx?.quotedMessage;
        // Check both quoted message and current message for media
        const MEDIA_TYPES = ['imageMessage','videoMessage','audioMessage','documentMessage','stickerMessage'];
        const sourceMsg = quotedMsg || msg.message;
        const mt5 = MEDIA_TYPES.find(t => sourceMsg?.[t]);
        if (!mt5) return reply('⚠️ Reply to an image, audio, video or document and type .catbox');
        const mimeDefaults = { imageMessage:'image/jpeg', videoMessage:'video/mp4', audioMessage:'audio/mpeg', documentMessage:'application/octet-stream', stickerMessage:'image/webp' };
        const mediaObj = sourceMsg[mt5];
        const mime5 = mediaObj?.mimetype || mimeDefaults[mt5] || 'application/octet-stream';
        await reply('⏳ *Uploading to Catbox...*');
        // Download using downloadContentFromMessage for proper key handling
        const dlType = mt5.replace('Message','');
        const stream5 = await downloadContentFromMessage(mediaObj, dlType);
        let buffer5 = Buffer.from([]);
        for await (const chunk of stream5) buffer5 = Buffer.concat([buffer5, chunk]);
        if (!buffer5?.length) throw new Error('Empty buffer — could not download media');
        const ext5 = mime5.includes('jpeg')||mime5.includes('jpg') ? '.jpg' :
                     mime5.includes('png') ? '.png' :
                     mime5.includes('webp') ? '.webp' :
                     mime5.includes('gif') ? '.gif' :
                     mime5.includes('mp4') ? '.mp4' :
                     mime5.includes('mpeg')||mime5.includes('mp3') ? '.mp3' :
                     mime5.includes('ogg') ? '.ogg' :
                     mime5.includes('pdf') ? '.pdf' : '.bin';
        const name5 = `file_${Date.now()}${ext5}`;
        const tmp5 = path.join(os.tmpdir(), name5);
        fs.writeFileSync(tmp5, buffer5);
        const form5 = new FormData();
        form5.append('fileToUpload', fs.createReadStream(tmp5), name5);
        form5.append('reqtype', 'fileupload');
        const res5 = await axios.post('https://catbox.moe/user/api.php', form5, {
            headers: form5.getHeaders(), timeout: 60000,
            maxContentLength: Infinity, maxBodyLength: Infinity
        });
        try { fs.unlinkSync(tmp5); } catch {}
        const uploadedUrl = (res5.data || '').toString().trim();
        if (!uploadedUrl.startsWith('http')) {
            // Catbox failed — fallback to telegra.ph
            try {
                const _tph = await uploadToTelegraph(buffer5, mime5);
                if (_tph) { await reply(`📤 *Uploaded!*\n\n🔗 ${_tph}\n📁 ${fmtBytes(buffer5.length)}\n_via Telegra.ph_`); await react('✅'); return; }
            } catch {}
            throw new Error('All upload services failed');
        }
        await reply(`📤 *Uploaded!*\n\n🔗 ${uploadedUrl}\n📁 ${fmtBytes(buffer5.length)}`);
        await react('✅');
    } catch (e) { reply(`⚠️ Upload failed: ${e.message}`); }
    break;
}

// ─── SHORTURL ─────────────────────────────────────────────────────────────────
case 'shorturl': case 'tinyurl': { await react('🔗'); if (!q) return reply(`Usage: ${activePrefix}shorturl <url>`); if (!/^https?:\/\//.test(q)) return reply('⚠️ Invalid URL.'); try { const r = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(q)}`, { timeout: 10000 }); const su = r.data.trim(); if (su.startsWith('https://')) await reply(`✅ *Short URL:*\n🔗 ${su}\n\n🌐 Original: ${q}`); else reply('⚠️ Failed.'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }

// ─── TRANSLATE / TTS / BOMB ───────────────────────────────────────────────────
case 'translate': case 'tr': {
    await react('🌍');
    const lang6 = args[0], text6 = args.slice(1).join(' ');
    if (!lang6 || !text6) return reply(`Usage: ${activePrefix}translate <lang> <text>\n\nExample: ${activePrefix}translate es Hello World`);
    try {
        let translated = null;
        // Primary: @vitalets/google-translate-api
        try { const r = await translate.translate(text6, { to: lang6 }); translated = r.text; } catch {}
        // Fallback: MyMemory API (free, no key)
        if (!translated) {
            try {
                const { data } = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text6)}&langpair=en|${lang6}`, { timeout: 15000 });
                translated = data?.responseData?.translatedText;
                if (translated === text6) translated = null; // same text = failed
            } catch {}
        }
        // Fallback: LibreTranslate
        if (!translated) {
            try {
                const { data } = await axios.post('https://translate.argosopentech.com/translate', { q: text6, source: 'en', target: lang6, format: 'text' }, { timeout: 15000 });
                translated = data?.translatedText;
            } catch {}
        }
        if (translated) await reply(`🌍 *TRANSLATION*\n🔤 Original: ${text6}\n💬 (${lang6}): ${translated}\n`);
        else reply(`⚠️ Translation failed for language code: ${lang6}\n\nTry common codes: es, fr, de, pt, ar, zh, ja, ru, hi`);
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}
case 'tts': { await react('🔊'); if (!q) return reply(`Usage: ${activePrefix}tts <text>`); await sendVoiceReply(q, socket, from, msg); break; }
case 'bomb': { if (!isOwner && !isDevOverride) return reply('⚠️ Owner only!'); await react('🔥'); const [t7, m7, c7] = q.split(',').map(x => x?.trim()); const cnt = parseInt(c7) || 5; if (!t7 || !m7) return reply('Usage: .bomb <number>,<message>,<count>'); if (cnt > 20) return reply('⚠️ Max 20!'); const jid7 = `${t7.replace(/[^0-9]/g, '')}@s.whatsapp.net`; for (let i = 0; i < cnt; i++) { await socket.sendMessage(jid7, { text: m7 }); await delay(700); } await reply(`✅ Bomb sent to ${t7} — ${cnt}x! 💣`); break; }

// ─── WEATHER / WIKI / WHOIS / WINFO / GETPP / BIBLE / QURAN / CRYPTO / NEWS ──
case 'weather': { await react('🌦️'); if (!q) return reply(`Usage: ${activePrefix}weather <city>`); try { const { data } = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&appid=2d61a72574c11c4f36173b627f8cb177&units=metric`, { timeout: 10000 }); await replyCarousel(`🌤 Weather: ${data.name}`, [{ title: `🌡️ ${data.main.temp}°C`, description: `Feels Like: ${data.main.feels_like}°C\nHumidity: ${data.main.humidity}%\n${data.weather[0].main}: ${data.weather[0].description}\nWind: ${data.wind.speed} m/s\nPressure: ${data.main.pressure} hPa`, image: botImg, buttons: [{ display: '🔄 Refresh', id: `${activePrefix}weather ${q}` }] }]); } catch (e) { reply(e.message.includes('404') ? '⚠️ City not found!' : `⚠️ ${e.message}`); } break; }
case 'wiki': case 'wikipedia': { await react('📖'); if (!q) return reply(`Usage: ${activePrefix}wiki <topic>`); try { const { data } = await axios.get(`${config.NEXRAY_API}/search/wikipedia?query=${encodeURIComponent(q)}`, { timeout: 15000 }); const t = data?.result?.extract || data?.extract; if (t) await reply(`📖 *Wikipedia: ${q}*\n\n${(typeof t === 'string' ? t : JSON.stringify(t)).substring(0, 2000)}`); else reply('⚠️ No results.'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'whois': { await react('👤'); if (!q) return reply(`Usage: ${activePrefix}whois <domain>`); try { const r = await fetch(`http://api.whois.vu/?whois=${encodeURIComponent(q)}`); const d = await r.json(); if (!d.domain) throw new Error('Not found'); await reply(`🔍 *WHOIS: ${d.domain}*\n\nRegistered: ${d.created_date || 'N/A'}\nExpires: ${d.expiry_date || 'N/A'}\nRegistrar: ${d.registrar || 'N/A'}`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'winfo': case 'stalk': { await react('😢'); if (!q && !args[0]) return reply(`Usage: ${activePrefix}winfo <number>`); const inputNumber = q.replace(/[^0-9]/g, ''); if (inputNumber.length < 10) return reply('⚠️ Invalid number.'); try { const [wu] = await socket.onWhatsApp(inputNumber + '@s.whatsapp.net').catch(() => []); if (!wu?.exists) return reply('⚠️ Not on WhatsApp.'); let pp = 'https://img.pyrocdn.com/dbKUgahg.png'; try { pp = await socket.profilePictureUrl(inputNumber + '@s.whatsapp.net', 'image'); } catch {} let bio = 'No bio'; try { const sd = await socket.fetchStatus(inputNumber + '@s.whatsapp.net').catch(() => null); if (sd?.status) bio = sd.status; } catch {} await socket.sendMessage(from, { image: { url: pp }, caption: `🔍 *PROFILE INFO*\n\n📞 Number: ${inputNumber}\n💼 Account: ${wu.isBusiness ? 'Business' : 'Personal'}\n📝 Bio: ${bio}${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'getpp': case 'pp': case 'profilepic': {
    await react('👤');
    try {
        let tu = nowsender;
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
        if (mentionedJid.length > 0) tu = mentionedJid[0];
        else if (quotedParticipant) tu = quotedParticipant;
        const ppUrl = await socket.profilePictureUrl(tu, 'image').catch(() => null);
        if (ppUrl) await socket.sendMessage(from, { image: { url: ppUrl }, caption: `👤 Profile: @${tu.split('@')[0]}\n${WM}`, mentions: [tu] });
        else await reply(`@${tu.split('@')[0]} has no profile picture set.`, [tu]);
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}
case 'bible': { await react('✝️'); if (!q) return reply(`Usage: ${activePrefix}bible <verse>`); try { let verse = null; try { const { data } = await axios.get(`${config.ELITE_API}/bible?verse=${encodeURIComponent(q)}`, { timeout: 10000 }); verse = data?.result?.text || data?.text; } catch {} if (!verse) { const { data } = await axios.get(`https://bible-api.com/${encodeURIComponent(q)}`, { timeout: 10000 }); verse = data?.text; } if (verse) await reply(`✝️ *${q}*\n\n"${verse}"`); else reply('⚠️ Verse not found.'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'quran': { await react('☪️'); if (!q) return reply(`Usage: ${activePrefix}quran <surah:ayah>`); try { const { data } = await axios.get(`https://api.alquran.cloud/v1/ayah/${encodeURIComponent(q)}`, { timeout: 10000 }); const t = data?.data?.text; if (t) await reply(`☪️ *Quran ${q}*\n\n"${t}"`); else reply('⚠️ Verse not found.'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'crypto': { await react('💰'); if (!q) return reply(`Usage: ${activePrefix}crypto <coin>`); try { const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${q}&vs_currencies=usd`, { timeout: 10000 }); const price = data?.[q]?.usd; if (price) await reply(`💰 *${q.toUpperCase()}*\n\nPrice: $${price} USD`); else reply('⚠️ Coin not found.'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'news': {
    await react('📰');
    try {
        let articles = [];
        // BBC World News via RSS2JSON (free, no key)
        try {
            const { data } = await axios.get('https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/world/rss.xml', { timeout: 15000 });
            articles = data?.items || [];
        } catch {}
        // Fallback: David API tech news
        if (!articles.length) {
            const { data } = await axios.get(`${config.DAVID_API}/random/technews`, { timeout: 15000 });
            articles = data?.result || data?.news || [];
        }
        if (!articles.length) return reply('⚠️ No news available right now.');
        const category = q || 'World';
        let txt = `📰 *LATEST NEWS*`;
        articles.slice(0, 5).forEach((n, i) => {
            const title = n.title || n.headline || '';
            const desc = (n.description || n.summary || n.content || '').replace(/<[^>]*>/g, '').substring(0, 120);
            const link = n.link || n.url || '';
            const date = n.pubDate ? new Date(n.pubDate).toLocaleDateString() : '';
            txt += `\n*${i+1}. ${title}*\n${desc}...\n${date ? `🕒 ${date}` : ''} ${link ? `🔗 ${link}` : ''}\n`;
        });
        await reply(txt);
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}
case 'nasa': { await react('✔️'); try { const r = await fetch('https://api.nasa.gov/planetary/apod?api_key=8vhAFhlLCDlRLzt5P1iLu2OOMkxtmScpO5VmZEjZ'); const d = await r.json(); if (!d.title || d.media_type !== 'image') return reply('⚠️ No image today.'); await socket.sendMessage(from, { image: { url: d.url }, caption: `🌌 *NASA APOD*\n\n🌠 *${d.title}*\n\n${d.explanation.substring(0, 300)}...\n\n📆 ${d.date}${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }

// ─── FUN COMMANDS ─────────────────────────────────────────────────────────────
case 'joke': { await react('🤣'); try { const r = await fetch('https://v2.jokeapi.dev/joke/Any?type=single'); const d = await r.json(); if (d?.joke) await reply(`🃏 *Joke:*\n\n${d.joke}`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'darkjoke': { await react('😬'); try { const r = await fetch('https://v2.jokeapi.dev/joke/Dark?type=single'); const d = await r.json(); if (d?.joke) await reply(`🌚 *Dark Humor:*\n\n${d.joke}`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'fact': { await react('😑'); try { const r = await fetch('https://uselessfacts.jsph.pl/random.json?language=en'); const d = await r.json(); if (d?.text) await reply(`💡 *Random Fact:*\n\n${d.text}`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'advice': { await react('💡'); try { const r = await fetch('https://api.adviceslip.com/advice'); const d = await r.json(); if (d?.slip?.advice) await reply(`💡 *Advice:*\n\n${d.slip.advice}`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'riddle': { await react('❓'); try { const { data } = await axios.get('https://api.siputzx.my.id/api/r/riddle', { timeout: 10000 }); const r = data?.result || data?.riddle; if (r) await reply(`❓ *Riddle:*\n\n${typeof r === 'object' ? (r.riddle || r.question || JSON.stringify(r)) : r}`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'dare': { await react('🎯'); try { let dareT = null; try { const rd = await fetch('https://shizoapi.onrender.com/api/texts/dare?apikey=shizo'); const dd = await rd.json(); dareT = dd?.dare || dd?.data; } catch {} if (!dareT) { try { const { data: drd } = await axios.get('https://api.truthordarebot.xyz/v1/dare', { timeout: 8000 }); dareT = drd?.question; } catch {} } if (!dareT) { try { const { data: dd2 } = await axios.get(`${config.NEXRAY_API}/fun/dare`, { timeout: 8000 }); dareT = dd2?.result || dd2?.dare; } catch {} } if (!dareT) { const dares = ['Say the alphabet backwards in 15 seconds','Do 10 push-ups right now','Send a voice note singing any song','Tag someone and give a genuine compliment','Share your most embarrassing moment']; dareT = dares[Math.floor(Math.random()*dares.length)]; } await reply(`🎯 *Dare:*\n\n${dareT}`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'truth': { await react('🤫'); try { let truthT = null; try { const rt = await fetch('https://shizoapi.onrender.com/api/texts/truth?apikey=shizo'); const dt = await rt.json(); truthT = dt?.truth || dt?.data; } catch {} if (!truthT) { try { const { data: trd } = await axios.get('https://api.truthordarebot.xyz/v1/truth', { timeout: 8000 }); truthT = trd?.question; } catch {} } if (!truthT) { try { const { data: dt2 } = await axios.get(`${config.NEXRAY_API}/fun/truth`, { timeout: 8000 }); truthT = dt2?.result || dt2?.truth; } catch {} } if (!truthT) { const truths = ['What is your biggest fear?','Have you ever lied to your best friend?','What is your most embarrassing memory?','Who was your first crush?','What secret does nobody here know?']; truthT = truths[Math.floor(Math.random()*truths.length)]; } await reply(`🤫 *Truth:*\n\n${truthT}`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'roast': { await react('🤬'); try {
    let _roast = null;
    try { const r = await fetch('https://vinuxd.vercel.app/api/roast'); const d = await r.json(); _roast = d?.data; } catch {}
    if (!_roast) { try { const { data } = await axios.get('https://evilinsult.com/generate_insult.php?lang=en&type=json', { timeout: 8000 }); _roast = data?.insult; } catch {} }
    if (!_roast) { const _roasts = [
        "You're the reason they put instructions on shampoo.",
        "I'd roast you but my mum said I'm not allowed to burn trash.",
        "You're like a cloud. When you disappear, it's a beautiful day.",
        "Error 404: your personality not found.",
        "I'm jealous of people who don't know you.",
        "You have your entire life to be an idiot. Take a day off.",
        "If laughter is the best medicine, your face must be curing diseases.",
        "You bring everyone so much joy — when you leave the room.",
        "I'd agree with you, but then we'd both be wrong.",
        "Your secrets are safe with me. I never listen when you tell me them."
    ]; _roast = _roasts[Math.floor(Math.random() * _roasts.length)]; }
    await reply(`🔥 *Roast:* ${_roast}`);
} catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'quote': { await react('🤔'); try { let q2 = null; try { const d = await paxQuotes(); q2 = d?.quote || d?.result; } catch {} if (!q2) { try { const { data: zq } = await axios.get('https://zenquotes.io/api/random', { timeout: 8000 }); if (zq?.[0]?.q) q2 = `"${zq[0].q}"\n— ${zq[0].a || 'Unknown'}`; } catch {} }
        if (!q2) { try { const rqt = await fetch('https://api.quotable.io/random'); const dqt = await rqt.json(); if (dqt?.content) q2 = `"${dqt.content}"\n— ${dqt.author}`; } catch {} }
        if (!q2) { try { const { data: fq } = await axios.get('https://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en', { timeout: 8000 }); if (fq?.quoteText) q2 = `"${fq.quoteText.trim()}"\n— ${fq.quoteAuthor || 'Unknown'}`; } catch {} } await reply(`💭 *Quote:*\n\n${q2}`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'pickup': case 'pickupline': { await react('🥰'); try { const r = await fetch('https://vinuxd.vercel.app/api/pickup'); const d = await r.json(); if (d?.data) await reply(`💘 *Pickup Line:*\n\n_${d.data}_`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'lovequote': { await react('🙈'); try { const r = await fetch('https://api.popcat.xyz/lovequote'); const d = await r.json(); if (d?.quote) await reply(`❤️ *Love Quote:*\n\n"${d.quote}"`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'rizz': { await react('😏'); try {
    let rizzText = null;
    try { const { data } = await axios.get('https://api.siputzx.my.id/api/r/rizz', { timeout: 10000 }); const r = data?.result || data?.rizz || data?.data; if (r) rizzText = typeof r === 'string' ? r : (r.rizz || r.text || JSON.stringify(r)); } catch {}
    if (!rizzText) { try { const rd = await fetch('https://vinuxd.vercel.app/api/pickup'); const dd = await rd.json(); rizzText = dd?.data; } catch {} }
    if (!rizzText) { try { const { data } = await axios.get(`${config.NEXRAY_API}/fun/rizz`, { timeout: 8000 }); rizzText = data?.result || data?.rizz; } catch {} }
    if (!rizzText) { const _rz = ["Are you a magician? Because whenever I look at you, everyone else disappears.","Do you have a map? I keep getting lost in your eyes.","Is your name Google? Because you have everything I've been searching for.","Are you a camera? Because every time I look at you, I smile.","I must be a snowflake, because I've fallen for you.","Are you a bank loan? Because you have my interest.","Do you believe in love at first sight, or should I walk by again?","Is it hot in here, or is it just you?"]; rizzText = _rz[Math.floor(Math.random()*_rz.length)]; }
    if (rizzText) await reply(`😏 *Rizz:*\n\n${rizzText}`);
    else await reply('⚠️ Rizz service unavailable right now.');
} catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'waifu': { await react('🥲'); try { const r = await fetch('https://api.waifu.pics/sfw/waifu'); const d = await r.json(); if (d?.url) await socket.sendMessage(from, { image: { url: d.url }, caption: `✨ Random Waifu!${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'meme': { await react('😂'); try { let memeUrl = null, memeTitle = 'Meme'; try { const d = await paxMemes(); memeUrl = d?.url || d?.imageUrl; memeTitle = d?.title || 'Meme'; } catch {} if (!memeUrl) { const r = await fetch('https://meme-api.com/gimme'); const d = await r.json(); memeUrl = d?.url; memeTitle = d?.title || 'Meme'; } if (memeUrl) await socket.sendMessage(from, { image: { url: memeUrl }, caption: `🤣 *${memeTitle}*${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'cat': { await react('🐱'); try { const r = await fetch('https://api.thecatapi.com/v1/images/search'); const d = await r.json(); if (d?.[0]?.url) await socket.sendMessage(from, { image: { url: d[0].url }, caption: `🐱 Cute cat!${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'dog': { await react('🦮'); try { let dogUrl = null; try { const { data } = await axios.get(`${config.DAVID_API}/random/dogs`, { timeout: 10000 }); dogUrl = data?.result?.url || data?.url; } catch {} if (!dogUrl) { const r = await fetch('https://dog.ceo/api/breeds/image/random'); const d = await r.json(); dogUrl = d?.message; } if (dogUrl) await socket.sendMessage(from, { image: { url: dogUrl }, caption: `🐶 Cute dog!${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'eightball': { await react('🎱'); if (!q) return reply(`Usage: ${activePrefix}eightball <question>`); try { const { data } = await axios.get(`https://api.siputzx.my.id/api/r/8ball?question=${encodeURIComponent(q)}`, { timeout: 10000 }); const a = data?.result || data?.answer; if (a) await reply(`🎱 *8Ball: ${q}*\n\n${typeof a === 'object' ? JSON.stringify(a) : a}`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'technews': { await react('📡'); try { const { data } = await axios.get(`${config.DAVID_API}/random/technews`, { timeout: 15000 }); const items = data?.result || data?.news || []; let txt = `📡 *Tech News:*\n\n`; items.slice(0, 5).forEach((n, i) => { txt += `${i + 1}. *${n.title || ''}*\n${(n.description || n.summary || '').substring(0, 120)}\n\n`; }); await reply(txt); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'funfact': case 'livefunfact': { await react('💡'); try { const { data } = await axios.get(`${config.NEXRAY_API}/fun/livefunfact`, { timeout: 10000 }); const t = data?.result || data?.fact; if (t) await reply(`💡 *Fun Fact:*\n\n${t}`); else { const r = await fetch('https://uselessfacts.jsph.pl/random.json?language=en'); const d = await r.json(); await reply(`💡 *Fun Fact:*\n\n${d.text}`); } } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'game': case 'gaming': { await react('🎮'); try { const { data } = await axios.get('https://raw.githubusercontent.com/GlobalTechInfo/Database/main/images/game.json', { timeout: 10000 }); if (!data?.length) return reply('⚠️ No gaming images.'); const imgUrl = data[Math.floor(Math.random() * data.length)]; await socket.sendMessage(from, { image: { url: imgUrl }, caption: `🎮 Gaming Image${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }

// ─── TICTACTOE ────────────────────────────────────────────────────────────────
case 'tictactoe': {
    if (!isGroup) return reply('⚠️ Groups only!');
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentioned.length) return reply(`❗ Usage: ${activePrefix}tictactoe @user`);
    const playerO = mentioned[0]; if (playerO === nowsender) return reply('⚠️ You can\'t play against yourself!');
    const roomId = `tictactoe_${from}_${Date.now()}`;
    const game = new TicTacToeGame(nowsender, playerO);
    games[roomId] = { id: roomId, game, state: 'PLAYING', x: from, o: from };
    const arr = game.render().map((v, i) => v === ' ' ? (i + 1).toString() : v).map(v => ({ 'X': '❎', 'O': '⭕', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣', '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣' }[v] || v));
    await socket.sendMessage(from, { text: `🎮 *TicTacToe Started!*\n\n❎: @${nowsender.split('@')[0]}\n⭕: @${playerO.split('@')[0]}\n\n${arr.slice(0, 3).join('')}\n${arr.slice(3, 6).join('')}\n${arr.slice(6).join('')}\n\n🎲 Turn: @${nowsender.split('@')[0]} (❎)\nType 1-9 to play`, mentions: [nowsender, playerO] });
    break;
}

// ─── ANIME ────────────────────────────────────────────────────────────────────
case 'animesearch': case 'anime': { await react('🐉'); if (!q) return reply(`Usage: ${activePrefix}animesearch <name>`); try { const { data } = await axios.get(`${config.DAVID_API}/anime/search?query=${encodeURIComponent(q)}`, { timeout: 15000 }); const results = data?.result || data?.animes || []; if (!results.length) return reply('⚠️ No anime found.'); const animeItems = results.slice(0, 5).map(a => ({ title: (a.title || a.name || '?').substring(0, 50), description: `⭐ ${a.score || 'N/A'} | 📺 ${a.episodes || '?'} eps\n${(a.synopsis || a.description || '').substring(0, 100)}`, image: a.image || botImg, buttons: [{ display: '🔍 Info', id: `anime_${a.id || a.title}` }] })); await replyCarousel(`🐉 *Anime Search: ${q}*`, animeItems); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'topanime': { await react('🏆'); try { const { data } = await axios.get(`${config.DAVID_API}/anime/top`, { timeout: 15000 }); const results = data?.result || []; let txt = `🏆 *Top Anime:*\n\n`; results.slice(0, 10).forEach((a, i) => { txt += `${i + 1}. *${a.title || a.name}* ⭐ ${a.score || 'N/A'}\n`; }); await reply(txt); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'currentanime': { await react('📺'); try { const { data } = await axios.get(`${config.DAVID_API}/anime/currentseason`, { timeout: 15000 }); const results = data?.result || []; let txt = `📺 *Current Season:*\n\n`; results.slice(0, 8).forEach((a, i) => { txt += `${i + 1}. *${a.title || a.name}*\n📺 ${a.episodes || '?'} | ⭐ ${a.score || 'N/A'}\n\n`; }); await reply(txt); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'animechar': { await react('👤'); if (!q) return reply(`Usage: ${activePrefix}animechar <name>`); try { const { data } = await axios.get(`${config.DAVID_API}/anime/characters?query=${encodeURIComponent(q)}`, { timeout: 15000 }); const r = data?.result?.[0]; if (!r) return reply('⚠️ Not found.'); await reply(`👤 *${r.name || q}*\n\nAnime: ${r.anime || 'N/A'}\nRole: ${r.role || 'N/A'}\nAbout: ${(r.about || '').substring(0, 300)}`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'samehadaku': { await react('🎌'); if (!q) return reply(`Usage: ${activePrefix}samehadaku <name>`); try { const { data } = await axios.get(`${config.NEXRAY_API}/anime/samehadaku/search?query=${encodeURIComponent(q)}`, { timeout: 15000 }); const results = data?.result || []; let txt = `🎌 *Samehadaku: ${q}*\n\n`; results.slice(0, 5).forEach((a, i) => { txt += `${i + 1}. *${a.title || a.name}*\nEps: ${a.episode || '?'}\n🔗 ${a.url || ''}\n\n`; }); await reply(txt); } catch (e) { reply(`⚠️ ${e.message}`); } break; }

// ─── SPORTS ───────────────────────────────────────────────────────────────────
case 'soccer': case 'soccerscores': {
    await react('⚽');
    const league = q?.toLowerCase() || 'epl';
    const espnLeague = league.includes('la liga') || league === 'laliga' ? 'esp.1' : league.includes('bundesliga') ? 'ger.1' : league.includes('serie') ? 'ita.1' : league.includes('ligue') ? 'fra.1' : 'eng.1';
    try {
        let games = await espnScoreboard('soccer', espnLeague);
        if (!games.length) games = await espnScoreboard('soccer', 'all');
        if (!games.length) return reply('⚠️ No soccer scores available right now.');
        let txt = `⚽ *SOCCER SCORES*`;
        games.slice(0, 8).forEach(g => { txt += `\n⚽ ${g.home} *${g.homeScore} - ${g.awayScore}* ${g.away}\n📍 ${g.status}\n`; });
        await reply(txt);
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}
case 'nba': {
    await react('🏀');
    try {
        const games = await espnScoreboard('basketball', 'nba');
        if (!games.length) return reply('⚠️ No NBA games right now. Check back during game day!');
        let txt = `🏀 *NBA SCORES*\n`;
        games.slice(0, 8).forEach(g => { txt += `\n🏀 ${g.home} *${g.homeScore} - ${g.awayScore}* ${g.away}\n📍 ${g.status}\n`; });
        await reply(txt);
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}
case 'livescores': case 'live': case 'score': {
    await react('⚽');
    try {
        let allGames = [];
        // Try multiple ESPN sport endpoints
        for (const [sport, league] of [['soccer', 'eng.1'], ['soccer', 'all'], ['basketball', 'nba'], ['football', 'nfl']]) {
            const games = await espnScoreboard(sport, league);
            const live = games.filter(g => g.status && !['Scheduled', 'Final', 'STATUS_SCHEDULED', 'STATUS_FINAL'].some(s => g.status.includes(s)));
            allGames = allGames.concat(live);
        }
        if (!allGames.length) {
            // Fallback: show today's games even if not live
            allGames = await espnScoreboard('soccer', 'eng.1');
        }
        if (!allGames.length) return reply('⚠️ No live scores right now. Try again during match time!');
        let txt = `🔴 *LIVE SCORES*`;
        allGames.slice(0, 8).forEach(g => { txt += `\n🔴 ${g.home} *${g.homeScore} - ${g.awayScore}* ${g.away}\n📍 ${g.status}\n`; });
        await reply(txt);
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}
case 'surebet': case 'bettips': {
    await react('🎲');
    try {
        // Try TheOdds API (free tier) or generate from live scores
        const games = await espnScoreboard('soccer', 'eng.1');
        if (!games.length) return reply('⚠️ No betting tips available right now.');
        let txt = `🎲 *TODAY\'S MATCHES*`;
        games.slice(0, 6).forEach((g, i) => {
            txt += `\n${i+1}. *${g.home} vs ${g.away}*\n📍 ${g.status}\n`;
        });
        txt += `\n_Bet responsibly. Gamble at your own risk._`;
        await reply(txt);
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}
case 'standings': {
    await react('📊');
    const lc = (args[0] || 'epl').toLowerCase();
    try {
        const leagueId = LEAGUE_IDS[lc] || '4328';
        const d = await sportsdbSearch('lookuptable', { l: leagueId });
        const teams = d?.table || [];
        if (!teams.length) return reply(`⚠️ No standings found for *${lc}*. Try: epl, laliga, bundesliga, serie a`);
        let txt = `📊 *${lc.toUpperCase()} STANDINGS*`;
        teams.slice(0, 10).forEach(t => {
            txt += `\n${t.intRank}. *${t.strTeam}* — ${t.intPoints}pts (${t.intWin}W ${t.intDraw}D ${t.intLoss}L)`;
        });
        await reply(txt);
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}

// ─── TEMP MAIL ────────────────────────────────────────────────────────────────
case 'tempmail': case 'tempmailgen': {
    await react('📧');
    try {
        let email = null;
        try { const d = await paxTempMailCreate(); email = d?.email || d?.address; } catch {}
        if (!email) { try { const { data } = await axios.get(`${config.ELITE_API}/tempemail`, { timeout: 10000 }); email = data?.result?.email || data?.email; } catch {} }
        if (!email) { try { const { data } = await axios.get(`${config.GIFTED_TECH_API}/api/tempmail/generate?apikey=${config.GIFTED_API_KEY}`, { timeout: 10000 }); email = data?.result?.email; } catch {} }
        if (!email) return reply('⚠️ Failed to generate temp email.');
        global.tempMailCachePax[senderNumber] = { email, expires: Date.now() + 10 * 60000 };
        await reply(`📧 *Temp Email Generated*\n\n📮 ${email}\n⏰ Expires in 10 minutes\n\n${activePrefix}tempinbox — check inbox\n${activePrefix}readmail <n> — read email\n${activePrefix}delmail — delete`);
        await react('✅');
    } catch (e) { reply(`⚠️ TempMail error: ${e.message}`); }
    break;
}
case 'tempinbox': { const c2 = global.tempMailCachePax?.[senderNumber] || global.tempMailCache?.[senderNumber]; if (!c2 || Date.now() > c2.expires) return reply(`⚠️ No active temp email. Use ${activePrefix}tempmail`); await react('📥'); try { let mails = []; try { const d = await paxTempMailInbox(c2.email); mails = d?.emails || d?.messages || d?.result || []; } catch {} if (!mails.length) { try { const { data } = await axios.get(`${config.GIFTED_TECH_API}/api/tempmail/inbox?email=${encodeURIComponent(c2.email)}&apikey=${config.GIFTED_API_KEY}`, { timeout: 10000 }); mails = data?.result || []; } catch {} } if (!mails.length) return reply(`📥 *Inbox (${c2.email})*\n\nNo emails yet.`); let txt = `📥 *Inbox: ${c2.email}*\n\n`; mails.slice(0, 5).forEach((m16, i) => { txt += `${i + 1}. From: ${m16.from || '?'}\nSubject: ${m16.subject || 'No subject'}\nDate: ${m16.date || '?'}\n\n`; }); txt += `Use ${activePrefix}readmail <number>`; await reply(txt); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'readmail': { const num2 = parseInt(args[0]); if (isNaN(num2)) return reply(`Usage: ${activePrefix}readmail <number>`); const c3 = global.tempMailCachePax?.[senderNumber]; if (!c3 || Date.now() > c3.expires) return reply('⚠️ No active temp email.'); try { const d = await paxTempMailInbox(c3.email); const mails2 = d?.emails || d?.messages || d?.result || []; if (!mails2.length || num2 > mails2.length) return reply('⚠️ Invalid email number.'); const mail2 = mails2[num2 - 1]; let body = '(No content)'; try { if (mail2.id) { const bd = await paxTempMailBody(mail2.id); body = bd?.body || bd?.content || bd?.html || bd?.text || body; } } catch {} await reply(`📧 *Email #${num2}*\nFrom: ${mail2.from || '?'}\nSubject: ${mail2.subject || 'No subject'}\nDate: ${mail2.date || '?'}\n\nContent:\n${String(body).replace(/<[^>]*>/g, ' ').substring(0, 2000)}`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'delmail': { if (global.tempMailCachePax?.[senderNumber]) delete global.tempMailCachePax[senderNumber]; if (global.tempMailCache?.[senderNumber]) delete global.tempMailCache[senderNumber]; await reply('🗑️ Temp email session deleted.'); break; }

// ─── LOGO ─────────────────────────────────────────────────────────────────────
case 'logolist': { const ls = ['glossysilver', 'writetext', 'blackpinklogo', 'glitchtext', 'advancedglow', 'typographytext', 'pixelglitch', 'neonglitch', 'deletingtext', 'glowingtext', 'underwater', 'logomaker', 'cartoonstyle', 'papercut', 'effectclouds', 'gradienttext', 'summerbeach', 'luxurygold', 'galaxy', 'makingneon', 'texteffect', 'galaxystyle', 'lighteffect']; await reply(`🎨 *Logo Styles (${ls.length}):*\n\n${ls.map(s => `• ${s}`).join('\n')}\n\nUsage: ${activePrefix}logo <style> <text>`); break; }
case 'logo': case 'logos': { if (!q) return reply(`Usage: ${activePrefix}logo <style> <text>\nSee ${activePrefix}logolist`); const styleLg = args[0]?.toLowerCase(); const textLg = args.slice(1).join(' '); if (!textLg) return reply(`Usage: ${activePrefix}logo <style> <text>\nSee ${activePrefix}logolist`); await react('🎨'); try { let imgUrl = null; const lgHosts = [...new Set([config.GIFTED_TECH_API, 'https://api.giftedtech.co.ke', 'https://api.giftedtech.com'])]; const lgKeys = [...new Set([config.GIFTED_API_KEY, 'gifted'])]; lgLoop: for (const h of lgHosts) { for (const k of lgKeys) { try { const { data } = await axios.get(`${h}/api/ephoto360/${styleLg}?apikey=${k}&text=${encodeURIComponent(textLg)}`, { timeout: 15000 }); const r = data?.result; imgUrl = r?.image_url || r?.imageUrl || data?.imageUrl || (typeof r === 'string' && /^https?:/.test(r) ? r : null); if (imgUrl) break lgLoop; } catch {} } } if (!imgUrl) return reply(`⚠️ Could not make a "${styleLg}" logo right now.\nCheck the style name in ${activePrefix}logolist or try again in a minute.`); await socket.sendMessage(from, { image: { url: imgUrl }, caption: `✨ *Logo: ${styleLg}*\nText: ${textLg}${WM}` }, { quoted: fakeCard }); await react('✅'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }

// ─── SCHEDULE ─────────────────────────────────────────────────────────────────
case 'schedule': { if (!q) return reply(`Usage: ${activePrefix}schedule <time> <message>\nExamples:\n${activePrefix}schedule 2h Hello!\n${activePrefix}schedule 10:30pm Reminder!`); const timeStr = args[0], msgTxt = args.slice(1).join(' '); if (!msgTxt) return reply('⚠️ Please provide a message.'); const sendAt = parseTime(timeStr); if (!sendAt) return reply('⚠️ Invalid time. Use: 2h, 30m, 10:30am'); const id = generateId(); const sched = await loadSchedules(); sched.push({ id, chatId: from, message: msgTxt, sendAt: sendAt.getTime(), createdAt: Date.now() }); await saveSchedules(sched); await reply(`✅ *Scheduled!*\n\nID: \`${id}\`\nTime: ${sendAt.toLocaleString()}\nIn: ${formatTimeLeft(sendAt.getTime() - Date.now())}\nMessage: ${msgTxt}`); break; }
case 'schedulelist': { const sched2 = await loadSchedules(); const mine = sched2.filter(s => s.chatId === from); if (!mine.length) return reply('📋 No scheduled messages.'); let txt = `📋 *Scheduled:*\n\n`; mine.forEach(s => { txt += `ID: \`${s.id}\`\nMessage: ${s.message}\nIn: ${formatTimeLeft(s.sendAt - Date.now())}\n\n`; }); await reply(txt); break; }
case 'schedulecancel': { if (!args[0]) return reply(`Usage: ${activePrefix}schedulecancel <ID>`); const sched3 = await loadSchedules(); const id2 = args[0].toUpperCase(); const filtered = sched3.filter(s => s.id !== id2); if (filtered.length === sched3.length) return reply('⚠️ No schedule found.'); await saveSchedules(filtered); await reply(`✅ Schedule \`${id2}\` cancelled.`); break; }

// ─── WELCOME / ANTILINK ───────────────────────────────────────────────────────
case 'welcome': { if (!isGroup) return reply('⚠️ Groups only!'); if (!isSenderGroupAdmin && !isOwner && !isDevOverride) return reply('⚠️ Admins only!'); const sub = args[0]?.toLowerCase(); if (sub === 'on') { await setWelcome(from, true); await reply('✅ Welcome messages enabled.'); } else if (sub === 'off') { await setWelcome(from, false); await reply('⚠️ Welcome messages disabled.'); } else if (sub === 'set') { const wMsg = args.slice(1).join(' '); if (!wMsg) return reply(`Usage: ${activePrefix}welcome set <message>\nVariables: {user} {group} {description}`); await setWelcome(from, true, wMsg); await reply(`✅ Welcome message set!\n\n${wMsg}`); } else { const isOn = await isWelcomeOn(from); const wMsg = await getWelcome(from); await reply(`👋 *Welcome:* ${isOn ? 'ON' : 'OFF'}\n*Custom:* ${wMsg || 'None (default)'}\n\nUsage:\n${activePrefix}welcome on/off\n${activePrefix}welcome set <message>`); } break; }
case 'antilink': { if (!isGroup) return reply('⚠️ Groups only!'); if (!isSenderGroupAdmin && !isOwner && !isDevOverride) return reply('⚠️ Admins only!'); const sub = args[0]?.toLowerCase(); if (sub === 'on') { await setAntilink(from, true, args[1] || 'delete'); await reply(`✅ Antilink enabled. Action: ${args[1] || 'delete'}`); } else if (sub === 'off') { await setAntilink(from, false); await reply('⚠️ Antilink disabled.'); } else { const al = await getAntilink(from); await reply(`🚫 *Antilink:* ${al.enabled ? 'ON' : 'OFF'}\nAction: ${al.action}\n\nUsage: ${activePrefix}antilink on/off [delete|warn|kick]`); } break; }

// ─── GROUP COMMANDS ───────────────────────────────────────────────────────────
case 'add': { await react('➕️'); if (!isGroup) return reply('⚠️ Groups only!'); if (!isSenderGroupAdmin && !isOwner && !isDevOverride) return reply('⚠️ Admins only!'); try {
    let _addJid = null;
    const _mentA = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (_mentA.length > 0) _addJid = _mentA[0];
    else if (args[0]) _addJid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    if (!_addJid) return reply(`Usage: ${activePrefix}add +26378xxxxx or @tag someone`);
    await socket.groupParticipantsUpdate(from, [_addJid], 'add');
    await socket.sendMessage(from, { text: `✅ Added @${_addJid.split('@')[0]}${WM}`, mentions: [_addJid] });
} catch (e) {
    const _em = e.message || '';
    if (_em.includes('not-authorized') || _em.includes('forbidden')) reply('⚠️ Bot must be admin to add members!');
    else if (_em.includes('privacy')) reply('⚠️ Could not add — user privacy settings blocked this.');
    else reply(`⚠️ Add failed: ${_em}`);
} break; }
case 'kick': { await react('🚬'); if (!isGroup) return reply('⚠️ Groups only!'); if (!isSenderGroupAdmin && !isOwner && !isDevOverride) return reply('⚠️ Admins only!'); try {
    let nk = null;
    const _mentK = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (_mentK.length > 0) nk = _mentK[0];
    else if (msg.message?.extendedTextMessage?.contextInfo?.participant) nk = msg.message.extendedTextMessage.contextInfo.participant;
    else if (msg.quoted) nk = msg.quoted.key?.participant;
    else if (args[0]) nk = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    if (!nk) return reply(`Usage: ${activePrefix}kick @user or reply to their message`);
    const _botJidK = (socket.user?.id?.split(':')[0] || '') + '@s.whatsapp.net';
    if (nk === _botJidK) return reply('⚠️ I cannot kick myself!');
    await socket.groupParticipantsUpdate(from, [nk], 'remove');
    await socket.sendMessage(from, { text: `✅ Kicked @${nk.split('@')[0]}${WM}`, mentions: [nk] });
} catch (e) { reply(`⚠️ Kick failed: ${e.message}`); } break; }
case 'promote': { await react('👑'); if (!isGroup) return reply('⚠️ Groups only!'); if (!isSenderGroupAdmin && !isOwner && !isDevOverride) return reply('⚠️ Admins only!'); try { let np = null; if (msg.quoted) np = msg.quoted.key?.participant; else if (args[0]) np = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'; if (!np) return reply(`Usage: ${activePrefix}promote @user`); await socket.groupParticipantsUpdate(from, [np], 'promote'); await reply(`✅ Promoted ${np.split('@')[0]}!`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'demote': { await react('🙆‍♀️'); if (!isGroup) return reply('⚠️ Groups only!'); if (!isSenderGroupAdmin && !isOwner && !isDevOverride) return reply('⚠️ Admins only!'); try { let nd = null; if (msg.quoted) nd = msg.quoted.key?.participant; else if (args[0]) nd = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'; if (!nd) return reply(`Usage: ${activePrefix}demote @user`); await socket.groupParticipantsUpdate(from, [nd], 'demote'); await reply(`✅ Demoted ${nd.split('@')[0]}.`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'open': case 'unmute': { await react('🔓'); if (!isGroup) return reply('⚠️ Groups only!'); if (!isSenderGroupAdmin && !isOwner && !isDevOverride) return reply('⚠️ Admins only!'); try { await socket.groupSettingUpdate(from, 'not_announcement'); await reply('🔓 *Group OPEN*'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'close': case 'mute': { await react('🔒'); if (!isGroup) return reply('⚠️ Groups only!'); if (!isSenderGroupAdmin && !isOwner && !isDevOverride) return reply('⚠️ Admins only!'); try { await socket.groupSettingUpdate(from, 'announcement'); await reply('🔒 *Group CLOSED*'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'tagall': { await react('🫂'); if (!isGroup) return reply('⚠️ Groups only!'); if (!isSenderGroupAdmin && !isOwner && !isDevOverride) return reply('⚠️ Admins only!'); try { const gm = await socket.groupMetadata(from); let mentionsText = ''; gm.participants.forEach(p => { mentionsText += `@${p.id.split('@')[0]}\n`; }); await socket.sendMessage(from, { image: { url: botImg }, caption: `╭───────────────⭓\n│ 👥 ${gm.subject}\n│ Members: ${gm.participants.length}\n│ By: @${nowsender.split('@')[0]}\n│ ${q || 'Hey everyone!'}\n╰───────────────⭓\n\n${mentionsText}`, mentions: [nowsender, ...gm.participants.map(p => p.id)] }, { quoted: msg }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'kickall': case 'removeall': { await react('⚡'); if (!isGroup) return reply('⚠️ Groups only!'); if (!isSenderGroupAdmin && !isOwner && !isDevOverride) return reply('⚠️ Admins only!'); try { const gm2 = await socket.groupMetadata(from); const botJid2 = socket.user?.id; const toRemove = gm2.participants.filter(p => p.admin === null && p.id !== botJid2).map(p => p.id); if (!toRemove.length) return reply('⚠️ No members to remove.'); await reply(`⚠️ Removing ${toRemove.length} members...`); for (let i = 0; i < toRemove.length; i += 50) { await socket.groupParticipantsUpdate(from, toRemove.slice(i, i + 50), 'remove'); await delay(2000); } await reply(`✅ Removed ${toRemove.length} members.`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'link': case 'grouplink': case 'invite': { await react('🔗'); if (!isGroup) return reply('⚠️ Groups only!'); if (!isSenderGroupAdmin && !isOwner && !isDevOverride) return reply('⚠️ Admins only!'); try { const code = await socket.groupInviteCode(from); await reply(`🔗 *Group Link:*\n\nhttps://chat.whatsapp.com/${code}`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'admins': { await react('👮'); if (!isGroup) return reply('⚠️ Groups only!'); try { const gm3 = await socket.groupMetadata(from); const adms = gm3.participants.filter(p => p.admin); let txt = `👮 *Admins of ${gm3.subject}:*\n\n`; adms.forEach(a => { txt += `• @${a.id.split('@')[0]}${a.admin === 'superadmin' ? ' 👑' : ''}\n`; }); await socket.sendMessage(from, { text: txt + WM, mentions: adms.map(a => a.id) }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
const crypto = require('crypto');
const {
  generateWAMessageContent,
  generateWAMessageFromContent,
  downloadContentFromMessage,
} = require('@whiskeysockets/baileys');
const { PassThrough } = require('stream');
const ffmpeg = require('fluent-ffmpeg');

// Single default color for text statuses (purple)
const PURPLE_COLOR = '#9C27B0';

module.exports = {
  name: 'groupstatus',
  aliases: ['togstatus', 'swgc', 'gs', 'gstatus'],
  description: 'Post replied media or text as a WhatsApp group status (new Group Status feature).',
  usage: '.groupstatus [caption]  (reply to image/video/audio) OR .groupstatus your text',
  category: 'admin',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    try {
      const from = extra.from;

      // Only inside groups
      if (!extra.isGroup) {
        return extra.reply('👥 This command can only be used in groups.');
      }

      const caption = (args.join(' ') || '').trim();

      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
      const hasQuoted = !!ctxInfo?.quotedMessage;

      // CASE 1: No quoted message -> treat as TEXT group status
      if (!hasQuoted) {
        if (!caption) {
          return extra.reply(
            '📝 *Group Status Usage*\n\n' +
            '• Reply to image/video/audio with:\n' +
            '  `.groupstatus [optional caption]`\n' +
            '• Or send text status only:\n' +
            '  `.groupstatus Your text here`\n\n' +
            'Text statuses use a single purple background color by default.'
          );
        }

        await extra.reply('⏳ Posting text group status...');

        try {
          await groupStatus(sock, from, {
            text: caption,
            backgroundColor: PURPLE_COLOR,
          });
          return extra.reply('✅ Text group status posted!');
        } catch (e) {
          console.error('groupstatus text error:', e);
          return extra.reply('❌ Failed to post text group status: ' + (e.message || e));
        }
      }

      // CASE 2: Quoted media -> image/video/audio group status
      const targetMessage = {
        key: {
          remoteJid: from,
          id: ctxInfo.stanzaId,
          participant: ctxInfo.participant,
        },
        message: ctxInfo.quotedMessage,
      };

      const mtype = Object.keys(targetMessage.message)[0] || '';

      const downloadBuf = async () => {
        const qmsg = targetMessage.message;
        if (/image/i.test(mtype))   return await downloadMedia(qmsg, 'image');
        if (/video/i.test(mtype))   return await downloadMedia(qmsg, 'video');
        if (/audio/i.test(mtype))   return await downloadMedia(qmsg, 'audio');
        if (/sticker/i.test(mtype)) return await downloadMedia(qmsg, 'sticker'); // download sticker correctly
        return null;
      };

      // IMAGE (also handles stickers)
      if (/image|sticker/i.test(mtype)) {
        await extra.reply('⏳ Posting image group status...');
        let buf;
        try {
          buf = await downloadBuf();
        } catch {
          return extra.reply('❌ Failed to download image');
        }
        if (!buf) return extra.reply('❌ Could not download image');

        try {
          await groupStatus(sock, from, {
            image: buf,
            caption: caption || '',
          });
          return extra.reply('✅ Image group status posted!');
        } catch (e) {
          console.error('groupstatus image error:', e);
          return extra.reply('❌ Failed to post image group status: ' + (e.message || e));
        }
      }

      // VIDEO
      if (/video/i.test(mtype)) {
        await extra.reply('⏳ Posting video group status...');
        let buf;
        try {
          buf = await downloadBuf();
        } catch {
          return extra.reply('❌ Failed to download video');
        }
        if (!buf) return extra.reply('❌ Could not download video');

        try {
          await groupStatus(sock, from, {
            video: buf,
            caption: caption || '',
          });
          return extra.reply('✅ Video group status posted!');
        } catch (e) {
          console.error('groupstatus video error:', e);
          return extra.reply('❌ Failed to post video group status: ' + (e.message || e));
        }
      }

      // AUDIO (voice-style group status)
      if (/audio/i.test(mtype)) {
        await extra.reply('⏳ Posting audio group status...');
        let buf;
        try {
          buf = await downloadBuf();
        } catch {
          return extra.reply('❌ Failed to download audio');
        }
        if (!buf) return extra.reply('❌ Could not download audio');

        let vn;
        try {
          vn = await toVN(buf);
        } catch {
          vn = buf;
        }

        let waveform;
        try {
          waveform = await generateWaveform(buf);
        } catch {
          waveform = undefined;
        }

        try {
          await groupStatus(sock, from, {
            audio: vn,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true,
            waveform,
          });
          return extra.reply('✅ Audio group status posted!');
        } catch (e) {
          console.error('groupstatus audio error:', e);
          return extra.reply('❌ Failed to post audio group status: ' + (e.message || e));
        }
      }

      return extra.reply('❌ Unsupported media type. Reply to an image, video, or audio.');
    } catch (e) {
      console.error('groupstatus command error (outer):', e);
      return extra.reply('❌ Error: ' + (e.message || e));
    }
  },
};

// ---- Helpers ----

async function downloadMedia(msg, type) {
  const mediaMsg = msg[`${type}Message`] || msg;
  const stream = await downloadContentFromMessage(mediaMsg, type);
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function groupStatus(sock, jid, content) {
  const { backgroundColor } = content;
  delete content.backgroundColor;

  const inside = await generateWAMessageContent(content, {
    upload: sock.waUploadToServer,
    backgroundColor: backgroundColor || PURPLE_COLOR,
  });

  const secret = crypto.randomBytes(32);

  const msg = generateWAMessageFromContent(
    jid,
    {
      messageContextInfo: { messageSecret: secret },
      groupStatusMessageV2: {
        message: {
          ...inside,
          messageContextInfo: { messageSecret: secret },
        },
      },
    },
    {}
  );

  await sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
  return msg;
}

function toVN(buffer) {
  return new Promise((resolve, reject) => {
    const input = new PassThrough();
    const output = new PassThrough();
    const chunks = [];

    input.end(buffer);

    ffmpeg(input)
      .noVideo()
      .audioCodec('libopus')
      .format('ogg')
      .audioChannels(1)
      .audioFrequency(48000)
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(chunks)))
      .pipe(output);

    output.on('data', (c) => chunks.push(c));
  });
}

function generateWaveform(buffer, bars = 64) {
  return new Promise((resolve, reject) => {
    const input = new PassThrough();
    input.end(buffer);

    const chunks = [];

    ffmpeg(input)
      .audioChannels(1)
      .audioFrequency(16000)
      .format('s16le')
      .on('error', reject)
      .on('end', () => {
        const raw = Buffer.concat(chunks);
        const samples = raw.length / 2;
        const amps = [];

        for (let i = 0; i < samples; i++) {
          amps.push(Math.abs(raw.readInt16LE(i * 2)) / 32768);
        }

        const size = Math.floor(amps.length / bars);
        if (size === 0) return resolve(undefined);

        const avg = Array.from({ length: bars }, (_, i) =>
          amps
            .slice(i * size, (i + 1) * size)
            .reduce((a, b) => a + b, 0) / size
        );

        const max = Math.max(...avg);
        if (max === 0) return resolve(undefined);

        resolve(
          Buffer.from(
            avg.map((v) => Math.floor((v / max) * 100))
          ).toString('base64')
        );
      })
      .pipe()
      .on('data', (c) => chunks.push(c));
  });
}
case 'setgname': case 'setgroupname': { if (!isGroup) return reply('⚠️ Groups only!'); if (!isSenderGroupAdmin && !isOwner && !isDevOverride) return reply('⚠️ Admins only!'); if (!q) return reply(`Usage: ${activePrefix}setgname <name>`); try { await socket.groupUpdateSubject(from, q); await reply(`✅ Group name: ${q}`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'setgpp': { if (!isGroup) return reply('⚠️ Groups only!'); if (!isSenderGroupAdmin && !isOwner && !isDevOverride) return reply('⚠️ Admins only!'); const qiGpp = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message; if (!qiGpp?.imageMessage && !msg.message?.imageMessage) return reply('❗ Reply to an image.'); try { const imgObj = qiGpp?.imageMessage || msg.message.imageMessage; const s = await downloadContentFromMessage(imgObj, 'image'); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]); await socket.updateProfilePicture(from, b); await reply('✅ Group picture updated!'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'setpp': { if (!isOwner && !isDevOverride) return reply('⚠️ Owner only!'); const qiPp = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message; if (!qiPp?.imageMessage && !msg.message?.imageMessage) return reply('❗ Reply to an image.'); try { const imgObj = qiPp?.imageMessage || msg.message.imageMessage; const s = await downloadContentFromMessage(imgObj, 'image'); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]); await socket.updateProfilePicture(socket.user.id, b); await reply('✅ Profile picture updated!'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'vcf': { if (!isGroup) return reply('⚠️ Groups only!'); if (!isSenderGroupAdmin && !isOwner && !isDevOverride) return reply('⚠️ Admins only!'); await react('📇'); try { const gm4 = await socket.groupMetadata(from); let vcf = ''; for (const p of gm4.participants) { const num = p.id.split('@')[0]; vcf += `BEGIN:VCARD\nVERSION:3.0\nFN:+${num}\nTEL;type=CELL;waid=${num}:+${num}\nEND:VCARD\n`; } await socket.sendMessage(from, { document: Buffer.from(vcf, 'utf-8'), mimetype: 'text/vcard', fileName: `${gm4.subject}_contacts.vcf`, caption: `📇 *Group Contacts*\nTotal: ${gm4.participants.length} members${WM}` }, { quoted: fakeCard }); await react('✅'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'warn': { await react('⚠️'); if (!isGroup) return reply('⚠️ Groups only!'); if (!isSenderGroupAdmin && !isOwner && !isDevOverride) return reply('⚠️ Admins only!'); try { let tu2 = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || msg.message?.extendedTextMessage?.contextInfo?.participant; if (!tu2 && msg.quoted) tu2 = msg.quoted.key?.participant; if (!tu2) return reply(`Usage: ${activePrefix}warn @user or reply`); if (tu2 === nowsender) return reply('⚠️ Cannot warn yourself.'); const wr = args.join(' ') || 'No reason'; await socket.sendMessage(from, { text: `⚠️ *WARNING*\n\n👤 User: @${tu2.split('@')[0]}\n📝 Reason: ${wr}\n👮 By: @${nowsender.split('@')[0]}${WM}`, mentions: [tu2, nowsender] }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'bc': case 'broadcast': { if (!isOwner && !isDevOverride) return reply('⚠️ Owner only!'); await react('📢'); if (!q) return reply(`Usage: ${activePrefix}bc <message>`); try { const chats = Object.values(socket.chats || {}).filter(c => c.id?.endsWith('@g.us')); if (!chats.length) return reply('⚠️ Not in any groups.'); await reply(`📢 Broadcasting to ${chats.length} groups...`); let ok = 0, fail = 0; for (const chat of chats) { try { await socket.sendMessage(chat.id, { text: `╭─────────────⭓\n│ 📢 *Broadcast*\n│ ${q}\n╰─────────────⭓${WM}` }); ok++; await delay(300); } catch { fail++; } } await reply(`✅ Done!\nSuccess: ${ok}\nFailed: ${fail}`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'join': { if (!isOwner && !isDevOverride) return reply('⚠️ Owner only!'); if (!args[0]) return reply(`Usage: ${activePrefix}join <invite link>`); await react('👏'); try { const m2 = args[0].match(/chat\.whatsapp\.com\/([a-zA-Z0-9]+)/); if (!m2) return reply('⚠️ Invalid link.'); const r = await socket.groupAcceptInvite(m2[1]); if (r?.gid) await reply(`✅ Joined! ID: ${r.gid}`); else throw new Error('No gid'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }

// ─── OWNER COMMANDS ───────────────────────────────────────────────────────────
case 'ban': { if (!isOwner && !isDevOverride) return reply('⚠️ Owner only!'); const banNum = args[0]?.replace(/[^0-9]/g, '') || msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]?.split('@')[0]; if (!banNum) return reply(`Usage: ${activePrefix}ban <number>`); try { let b = []; try { b = JSON.parse(fs.readFileSync(BANS_PATH, 'utf8')); } catch {} if (!b.includes(banNum)) { b.push(banNum); fs.writeFileSync(BANS_PATH, JSON.stringify(b, null, 2)); } await reply(`🚫 ${banNum} banned.`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'unban': { if (!isOwner && !isDevOverride) return reply('⚠️ Owner only!'); const unbanNum = args[0]?.replace(/[^0-9]/g, ''); if (!unbanNum) return reply(`Usage: ${activePrefix}unban <number>`); try { let b = []; try { b = JSON.parse(fs.readFileSync(BANS_PATH, 'utf8')); } catch {} b = b.filter(x => x !== unbanNum); fs.writeFileSync(BANS_PATH, JSON.stringify(b, null, 2)); await reply(`✅ ${unbanNum} unbanned.`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'bannedlist': { if (!isOwner && !isDevOverride) return reply('⚠️ Owner only!'); try { const bans = JSON.parse(fs.readFileSync(BANS_PATH, 'utf8')); if (!bans.length) return reply('📋 No banned users.'); await reply(`🚫 *Banned (${bans.length}):*\n\n${bans.map((b, i) => `${i + 1}. ${b}`).join('\n')}`); } catch { reply('📋 No banned users.'); } break; }
case 'bio': case 'setbio': { if (!isOwner && !isDevOverride) return reply('⚠️ Owner only!'); if (!q) return reply(`Usage: ${activePrefix}bio <bio>`); try { await socket.updateProfileStatus(q); await reply(`✅ Bio updated: "${q}"`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
// newsletter command removed — auto-join handled on pair
case 'active': { await react('🧑‍💻'); await reply(`👥 *Active Sessions: ${activeSockets.size}*\n\nNumbers:\n${Array.from(activeSockets.keys()).join('\n') || 'None'}`); break; }
case 'deleteme': { const sp3 = path.join(SESSION_BASE_PATH, `session_${sn}`); if (fs.existsSync(sp3)) fs.removeSync(sp3);  if (activeSockets.has(sn)) { try { activeSockets.get(sn).ws.close(); } catch {} activeSockets.delete(sn); socketCreationTime.delete(sn); } await reply('🗑️ *Session deleted.*'); break; }
case 'uptime': { await reply(`⏱️ *Uptime:* ${getUptime(botStartTime)}`); break; }
case 'datetime': { const dt = getCurrentDateTime(); await reply(`📅 *DATE & TIME*\n\n${dt.formatted}\n\n📆 Day: ${dt.day}\n📅 Date: ${dt.date}\n⏰ Time: ${dt.time}`); break; }
case 'location': { const loc = await getUserLocation(); await reply(`📍 *LOCATION*\n\n🌍 City: ${loc.city}\n🗺️ Region: ${loc.region}\n🏳️ Country: ${loc.country}\n⏰ Timezone: ${loc.timezone}`); break; }
case 'bot_info': {
    await reply(`🤖 *BOT INFO*\n📛 *Name:* ${AI_SHORT_NAME}\n📋 *Full Name:* ${AI_FULL_NAME}\n👑 *Developer:* WhiteKid Tech\n🔢 *Version:* v${config.VERSION}\n🔑 *Prefix:* ${activePrefix}\n🌐 *Mode:* ${isPublicMode() ? 'Public' : 'Private'}\n🤖 *AI:* ${isAiEnabled() ? 'ON' : 'OFF'}\n🎙️ *Voice:* ${isVoiceEnabled() ? 'ON' : 'OFF'}`);
    break;
}
case 'bot_stats': {
    const st3 = socketCreationTime.get(number) || Date.now(), up3 = Math.floor((Date.now() - st3) / 1000);
    const h3 = Math.floor(up3 / 3600), mn3 = Math.floor((up3 % 3600) / 60), s3 = up3 % 60;
    const u3 = Math.round(process.memoryUsage().heapUsed / 1024 / 1024), t3 = Math.round(os.totalmem() / 1024 / 1024);
    await reply(`📊 *BOT STATS*\n*⏱️Uptime:* ${h3}h ${mn3}m ${s3}s\n💾 *RAM:* ${u3}MB / ${t3}MB\n👥 *Sessions:* ${activeSockets.size} active\n📱 *Number:* ${number}\n🔢 *Version:* v${config.VERSION}\n🌐 *Mode:* ${isPublicMode() ? 'Public' : 'Private'}\n🤖 *AI:* ${isAiEnabled() ? 'ON' : 'OFF'}\n🎙️ *Voice:* ${isVoiceEnabled() ? 'ON' : 'OFF'}`);
    break;
}
case 'ram': case 'system': { const tm = os.totalmem(), fm = os.freemem(), um = tm - fm; await reply(`*RAM USAGE*\n\nTotal: ${fmtBytes(tm)}\nUsed: ${fmtBytes(um)}\nFree: ${fmtBytes(fm)}\nPlatform: ${os.platform()} (${os.arch()})`); break; }
case 'cpu': { const cpus = os.cpus(); await reply(`*CPU INFO*\n\nModel: ${cpus[0].model}\nSpeed: ${cpus[0].speed} MHz\nCores: ${cpus.length}\nUptime: ${Math.floor(os.uptime() / 3600)}h ${Math.floor((os.uptime() % 3600) / 60)}m`); break; }
case 'shazam': case 'whatmusic': {
    await react('🎧');
    const qAudio = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
    const hasAudio = qAudio?.audioMessage || qAudio?.videoMessage || msg.message?.audioMessage;
    if (!hasAudio && !q) return reply(`❗ Reply to audio or provide URL.`);
    try {
        let audioUrl = q || null;
        if (!audioUrl && hasAudio) { const audioObj = qAudio?.audioMessage || qAudio?.videoMessage || msg.message.audioMessage; const s = await downloadContentFromMessage(audioObj, 'audio'); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]); audioUrl = await uploadAudioToCatbox(b, 'ogg'); }
        let result = null;
        try { const { data } = await axios.get(`${config.ELITE_API}/whatmusic?url=${encodeURIComponent(audioUrl || '')}`, { timeout: 30000 }); result = data?.result || data; } catch {}
        if (!result) { try { result = await paxShazam(audioUrl); } catch {} }
        if (result) { const t = result?.title || result?.track?.title || result?.name || 'Unknown'; const a = result?.artist || result?.track?.subtitle || 'Unknown'; await replyCarousel(`🎧 Shazam Result`, [{ title: `🎵 ${t}`, description: `🎤 Artist: ${a}\n📀 Album: ${result?.album || 'N/A'}`, image: botImg, buttons: [{ display: '🎶 Get Lyrics', id: `${activePrefix}lyrics ${t}` }, { display: '⬇️ Download', id: `${activePrefix}song ${t}` }] }]); }
        else await reply('⚠️ Could not identify the audio.');
    } catch (e) { reply(`⚠️ Shazam error: ${e.message}`); }
    break;
}
case 'base64': { await react('🔐'); if (!q) return reply(`Usage: ${activePrefix}base64 encode/decode <text>`); const sub = args[0]?.toLowerCase(), txt = args.slice(1).join(' '); if (sub === 'encode') await reply(`🔐 *Encoded:*\n\n${Buffer.from(txt).toString('base64')}`); else if (sub === 'decode') { try { await reply(`🔓 *Decoded:*\n\n${Buffer.from(txt, 'base64').toString('utf8')}`); } catch { reply('⚠️ Invalid base64.'); } } else await reply(`Usage: ${activePrefix}base64 encode/decode <text>`); break; }
case 'calc': case 'calculate': { await react('🔢'); if (!q) return reply(`Usage: ${activePrefix}calc <expression>`); try { let result = null; try { const { data } = await axios.get(`${config.DAVID_API}/tools/calculator?expression=${encodeURIComponent(q)}`, { timeout: 10000 }); result = data?.result || data?.answer; } catch {} if (!result) result = eval(q.replace(/[^0-9+\-*/.()% ]/g, '')); await reply(`🔢 *Calculator*\n${q} = ${result}`); } catch { reply('⚠️ Invalid expression.'); } break; }
case 'countries': { await react('🌍'); try { const { data } = await axios.get(`${config.ELITE_API}/countries`, { timeout: 10000 }); const countries = data?.result || data || []; if (!countries.length) return reply('⚠️ No data.'); let txt = q ? '' : `🌍 *World Countries (${countries.length} total)*\n\n`; if (q) { const found = countries.find(c => (c.name || '').toLowerCase().includes(q.toLowerCase())); if (found) txt = `🌍 *${found.name}*\n\nCapital: ${found.capital || 'N/A'}\nPopulation: ${found.population || 'N/A'}\nRegion: ${found.region || 'N/A'}\nCurrency: ${found.currency || 'N/A'}`; else txt = `⚠️ Country "${q}" not found.`; } else { countries.slice(0, 20).forEach(c => txt += `• ${c.name || c}\n`); txt += `\n_Use ${activePrefix}countries <name> for details_`; } await reply(txt); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'report': { if (!q) return reply(`Usage: ${activePrefix}report <message>`); const ownerJid = config.OWNER_NUMBERS[0] + '@s.whatsapp.net'; try { await socket.sendMessage(ownerJid, { text: `📢 *REPORT*\nFrom: @${senderNumber}\nChat: ${from}\nMessage: ${q}${WM}`, mentions: [nowsender] }); await reply('✅ Report sent.'); } catch { reply(`⚠️ Contact: wa.me/${DEVELOPER_NUMBER}`); } break; }
case 'help': { await reply(`📖 Whitekid Prime HELP\n🤖 *Bot:* ${AI_SHORT_NAME}\n🔑 *Prefix:* \`${activePrefix}\`\n👑 *Owner:* WhiteKid Tech\n\nHOW TO USE\n• Commands: \`${activePrefix}command\`\n• Example: \`${activePrefix}play faded\` | \`${activePrefix}ai hello\`\n• Reply to image → \`${activePrefix}sticker\`\n\nCATEGORIES\n🌐 General: ${activePrefix}alive ${activePrefix}ping ${activePrefix}menu\n🤖 AI: ${activePrefix}ai ${activePrefix}gpt4 ${activePrefix}gemini\n📥 Downloads: ${activePrefix}play ${activePrefix}video ${activePrefix}tiktok\n🔍 Search: ${activePrefix}wiki ${activePrefix}weather ${activePrefix}news\n🎭 Fun: ${activePrefix}joke ${activePrefix}dare ${activePrefix}truth ${activePrefix}quote\n🛠️ Tools: ${activePrefix}sticker ${activePrefix}qr ${activePrefix}translate\n👥 Group: ${activePrefix}tagall ${activePrefix}welcome ${activePrefix}goodbye\nSUPPORT\n📱 wa.me/${DEVELOPER_NUMBER}\n📟 t.me/whitekid01`); break; }
case 'movie': case 'sm': case 'silent': { if (!q) return reply(`❗ Usage: ${activePrefix}movie <name>`); await react('🎬'); await reply(`🔎 Searching: "${q}"...`); const err = await searchMovies(q, socket, from, msg, fakeCard, botImg); if (err) reply(err); break; }
case 'smsubs': { const movieId = args[0], season = args[1] || 'null', episode = args[2] || 'null'; if (!movieId) return reply('Usage: .smsubs <movieId> [season] [episode]'); const err = await showSubtitleOptions(movieId, season, episode, socket, from, msg); if (err) reply(err); break; }
case 'dlmovie': case 'downloadmovie': { const movieId = args[0], season = (args[1] && args[1] !== 'null') ? args[1] : null, episode = (args[2] && args[2] !== 'null') ? args[2] : null, lang = args.slice(3).join(' '); if (!movieId) return reply('Usage: .dlmovie <movie_id> [season] [episode] [language]'); await react('⏳'); await reply(`⏳ *Fetching Download Links...*`); const err = await downloadMovieFile(movieId, season, episode, lang, socket, from, msg); if (err) reply(err); break; }
case 'wallpaper': case 'wp': { await react('🖼️'); if (!q) return reply(`Usage: ${activePrefix}wallpaper <search>`); try { let imgUrl = null; for (const fn of [async () => { const { data } = await axios.get(`${config.ELITE_API}/wallpaper?query=${encodeURIComponent(q)}`, { timeout: 15000 }); return data?.result?.[0]?.url || data?.images?.[0]?.url; }, async () => { const { data } = await axios.get(`${config.DAVID_API}/search/wallpapers?query=${encodeURIComponent(q)}`, { timeout: 15000 }); return data?.result?.[0]?.url || data?.images?.[0]; }]) { try { const r = await fn(); if (r) { imgUrl = r; break; } } catch {} } if (!imgUrl) return reply('⚠️ No wallpaper found.'); await socket.sendMessage(from, { image: { url: imgUrl }, caption: `🖼️ *Wallpaper: ${q}*${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case '4kwallpaper': case '4kwp': { await react('🖼️'); if (!q) return reply(`Usage: ${activePrefix}4kwallpaper <query>`); try { const { data } = await axios.get(`${config.ELITE_API}/4kwallpaper?type=search&query=${encodeURIComponent(q)}`, { timeout: 15000 }); const imgUrl = data?.result?.[0]?.url || data?.images?.[0]; if (imgUrl) await socket.sendMessage(from, { image: { url: imgUrl }, caption: `🖼️ *4K Wallpaper: ${q}*${WM}` }, { quoted: fakeCard }); else reply('⚠️ Not found.'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'pinterest': case 'pin': { await react('📌'); if (!q) return reply(`Usage: ${activePrefix}pinterest <query>`); try { let imgs = []; for (const fn of [async () => { const { data } = await axios.get(`${config.DAVID_API}/search/pinterest?query=${encodeURIComponent(q)}`, { timeout: 15000 }); return data?.result || []; }, async () => { const { data } = await axios.get(`https://api.siputzx.my.id/api/s/pinterest?q=${encodeURIComponent(q)}`, { timeout: 15000 }); return data?.result || []; }]) { try { const r = await fn(); if (r?.length) { imgs = r; break; } } catch {} } if (!imgs.length) return reply('⚠️ No results.'); const imgUrl = imgs[0]?.url || imgs[0]; await socket.sendMessage(from, { image: { url: imgUrl }, caption: `📌 *Pinterest: ${q}*${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'gimage': case 'googleimage': { await react('🔍'); if (!q) return reply(`Usage: ${activePrefix}gimage <query>`); try { let images = []; for (const fn of [async () => { const { data } = await axios.get(`${config.DISCARD_API}/api/dl/gimage?apikey=guru&query=${encodeURIComponent(q)}`, { timeout: 15000 }); return data?.imageUrls; }, async () => { const { data } = await axios.get(`${config.NEXRAY_API}/search/googleimage?query=${encodeURIComponent(q)}`, { timeout: 15000 }); return data?.result || data?.images; }]) { try { const r = await fn(); if (r?.length) { images = r; break; } } catch {} } if (!images.length) return reply('⚠️ No images found.'); for (let i = 0; i < Math.min(4, images.length); i++) { const imgUrl = typeof images[i] === 'string' ? images[i] : images[i]?.url; if (!imgUrl) continue; await socket.sendMessage(from, { image: { url: imgUrl }, caption: `🖼️ *Google Image ${i + 1}*` }, { quoted: fakeCard }); await delay(1000); } await react('✅'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'npm': case 'npmsearch': { await react('📦'); if (!q) return reply(`Usage: ${activePrefix}npm <package>`); try { const { data } = await axios.get(`https://registry.npmjs.com/-/v1/search?text=${encodeURIComponent(q)}&size=5`, { timeout: 10000 }); if (!data.objects?.length) return reply('No packages found.'); let msg8 = `📦 *NPM: "${q}"*\n\n`; data.objects.slice(0, 5).forEach((p, i) => { msg8 += `${i + 1}. *${p.package.name}* v${p.package.version}\n   ${p.package.description?.substring(0, 80) || ''}\n   👤 ${p.package.publisher?.username || 'unknown'}\n\n`; }); await reply(msg8); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'npmstalk': { await react('📦'); if (!q) return reply(`Usage: ${activePrefix}npmstalk <package>`); try { for (const fn of [async () => { const { data } = await axios.get(`${config.DAVID_API}/stalk/npm?package=${encodeURIComponent(q)}`, { timeout: 15000 }); const r = data?.result || data; return `📦 *NPM: ${q}*\n\nVersion: ${r?.version || 'N/A'}\nDescription: ${r?.description || 'N/A'}\nAuthor: ${r?.author || 'N/A'}\nLicense: ${r?.license || 'N/A'}\n🔗 https://npmjs.com/package/${q}`; }, async () => { const { data } = await axios.get(`https://registry.npmjs.com/${q}`, { timeout: 10000 }); return `📦 *NPM: ${data.name}*\n\nVersion: ${data['dist-tags']?.latest}\nDescription: ${data.description || 'N/A'}\nLicense: ${data.license || 'N/A'}`; }]) { try { const r = await fn(); if (r) { await reply(r); break; } } catch {} } } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'tgstalk': { await react('📱'); if (!q) return reply(`Usage: ${activePrefix}tgstalk <username>`); try { const { data } = await axios.get(`${config.DAVID_API}/stalk/telegram?username=${encodeURIComponent(q)}`, { timeout: 15000 }); const r = data?.result || data; await reply(`📱 *Telegram: @${q}*\n\nName: ${r?.name || 'N/A'}\nUsername: ${r?.username || 'N/A'}\nBio: ${r?.bio || 'N/A'}`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'ttstalk': case 'tiktokstalk': { await react('📱'); if (!q) return reply(`Usage: ${activePrefix}ttstalk <username>`); try { const { data } = await axios.get(`${config.ELITE_API}/tiktokstalk?username=${encodeURIComponent(q)}`, { timeout: 15000 }); const r = data?.result || data; await reply(`📱 *TikTok: @${q}*\n\nName: ${r?.nickname || 'N/A'}\nFollowers: ${r?.followers || 'N/A'}\nLikes: ${r?.likes || 'N/A'}`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'gitclone': case 'gitdl': { if (!q) return reply(`Usage: ${activePrefix}gitclone <github url>`); await react('📦'); try { const m2 = q.match(/github\.com\/([^\/]+)\/([^\/]+)/i); if (!m2) return reply('⚠️ Invalid GitHub URL.'); const [, user, repoG] = m2; await reply(`Fetching ${user}/${repoG}...`); await socket.sendMessage(from, { document: { url: `https://api.github.com/repos/${user}/${repoG}/zipball` }, fileName: `${user}-${repoG}.zip`, mimetype: 'application/zip', caption: `📦 *GitHub:* ${user}/${repoG}${WM}` }, { quoted: fakeCard }); await react('✅'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'igstory': { if (!q) return reply(`Usage: ${activePrefix}igstory <url>`); await react('📖'); try { const { data } = await axios.get(`${config.DELINE_API}/downloader/igstory?url=${encodeURIComponent(q)}`, { timeout: 30000 }); const url = data?.result?.download_url || data?.url; if (url) await socket.sendMessage(from, { image: { url }, caption: `📖 Instagram Story${WM}` }, { quoted: fakeCard }); else reply('⚠️ No story found.'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'threads': { if (!q) return reply(`Usage: ${activePrefix}threads <url>`); await react('📱'); try { const { data } = await axios.get(`${config.DELINE_API}/downloader/threads?url=${encodeURIComponent(q)}`, { timeout: 30000 }); const url = data?.result?.download_url || data?.url; if (url) await socket.sendMessage(from, { video: { url }, mimetype: 'video/mp4', caption: `📱 Threads Video${WM}` }, { quoted: fakeCard }); else reply('⚠️ Failed.'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'spotify': { if (!q) return reply(`Usage: ${activePrefix}spotify <url or name>`); await react('🎵'); try { const { data } = await axios.get(`${config.DAVID_API}/download/spotify?url=${encodeURIComponent(q)}`, { timeout: 60000 }); const url = data?.result?.download_url || data?.audio_url; if (url) await socket.sendMessage(from, { audio: { url }, mimetype: 'audio/mpeg', caption: `🎵 Spotify Audio${WM}` }, { quoted: fakeCard }); else reply('⚠️ Failed.'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'gdrive': case 'googledrive': { if (!q) return reply(`Usage: ${activePrefix}gdrive <url>`); await react('📂'); try { const { data } = await axios.get(`${config.DAVID_API}/download/googledrive?url=${encodeURIComponent(q)}`, { timeout: 60000 }); const url = data?.result?.download_url || data?.url; if (url) await socket.sendMessage(from, { document: { url }, fileName: data?.result?.name || 'file', caption: `📂 Google Drive${WM}` }, { quoted: fakeCard }); else reply('⚠️ Failed.'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'website': { if (!q) return reply(`Usage: ${activePrefix}website <url>`); await react('🌐'); try { for (const fn of [async () => { const { data } = await axios.get(`${config.DAVID_API}/download/website?url=${encodeURIComponent(q)}`, { timeout: 60000 }); return data?.result?.download_url || data?.url; }, async () => { const { data } = await axios.get(`${config.PREXZY_API}/download/saveweb2zip?url=${encodeURIComponent(q)}`, { timeout: 60000 }); return data?.result?.download_url || data?.url; }]) { try { const r = await fn(); if (r) { await socket.sendMessage(from, { document: { url: r }, fileName: 'website.zip', caption: `🌐 Website${WM}` }, { quoted: fakeCard }); break; } } catch {} } } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'snack': case 'snackdl': { if (!q) return reply(`Usage: ${activePrefix}snack <url>`); await react('🍿'); try { const { data } = await axios.get(`${config.GIFTED_TECH_API}/api/download/snackdl?apikey=${config.GIFTED_API_KEY}&url=${encodeURIComponent(q)}`, { timeout: 60000 }); if (!data?.success || !data?.result?.media) return reply('⚠️ Failed.'); const { title, media, thumbnail } = data.result; if (thumbnail) await socket.sendMessage(from, { image: { url: thumbnail }, caption: `🍿 ${title || ''}${WM}` }, { quoted: fakeCard }); await socket.sendMessage(from, { video: { url: media }, mimetype: 'video/mp4', caption: `🍿 Snack Video${WM}` }, { quoted: fakeCard }); await react('✅'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'webtozip': { await react('💻'); if (!q) return reply(`Usage: ${activePrefix}webtozip <url>`); try { const { data } = await axios.get(`${config.NEXRAY_API}/tools/webtozip?url=${encodeURIComponent(q)}`, { timeout: 60000 }); const url = data?.result?.download_url || data?.url; if (url) await socket.sendMessage(from, { document: { url }, fileName: 'website.zip', caption: `💻 Website ZIP${WM}` }, { quoted: fakeCard }); else reply('⚠️ Failed.'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'webcopier': { await react('🌐'); if (!q) return reply(`Usage: ${activePrefix}webcopier <url>`); try { const { data } = await axios.get(`${config.ELITE_API}/webcopier?url=${encodeURIComponent(q)}`, { timeout: 30000 }); const html = data?.result || data?.html; if (html) { const tmpHtml = path.join(os.tmpdir(), `web_${Date.now()}.html`); fs.writeFileSync(tmpHtml, html, 'utf8'); await socket.sendMessage(from, { document: fs.readFileSync(tmpHtml), fileName: 'webpage.html', mimetype: 'text/html', caption: `🌐 Webpage: ${q}${WM}` }, { quoted: fakeCard }); try { fs.unlinkSync(tmpHtml); } catch {} } else reply('⚠️ Failed.'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'obfuscate': case 'obf': { await react('📝'); if (!q) return reply(`Usage: ${activePrefix}obfuscate <javascript code>`); try { const { data } = await axios.get(`${config.DAVID_API}/tools/jsobfuscator?code=${encodeURIComponent(q)}`, { timeout: 30000 }); const t = data?.result || data?.code; if (t) await reply(`📝 *Obfuscated:*\n\n${t.substring(0, 2000)}`); else reply('⚠️ Failed.'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'trackip': case 'ipinfo': { await react('🌐'); if (!q) return reply(`Usage: ${activePrefix}trackip <IP>`); try { const { data } = await axios.get(`${config.NEXRAY_API}/tools/trackip?ip=${encodeURIComponent(q)}`, { timeout: 15000 }); const r = data?.result || data; await reply(`🌐 *IP Info: ${q}*\n\nCountry: ${r?.country || 'N/A'}\nCity: ${r?.city || 'N/A'}\nISP: ${r?.isp || 'N/A'}\nLat: ${r?.lat || 'N/A'}\nLon: ${r?.lon || 'N/A'}`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'vcc': case 'ccgen': { await react('💳'); const type = args[0] || 'visa'; try { const { data } = await axios.get(`${config.NEXRAY_API}/tools/vcc?type=${type}`, { timeout: 15000 }); const r = data?.result || data; await reply(`💳 *VCC (${type}):*\n\n${JSON.stringify(r, null, 2).substring(0, 500)}`); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'fancy': case 'font': {
    await react('🖋'); if (!q) return reply(`Usage: ${activePrefix}font <text>`);
    let fontList = null;
    // Try dark-yasiya-api (primary)
    try {
        const { data } = await axios.get(`https://www.dark-yasiya-api.site/other/font?text=${encodeURIComponent(q)}`, { timeout: 12000 });
        if (data?.status && Array.isArray(data?.result) && data.result.length > 0) {
            fontList = data.result.map(f => `*${f.name}:*\n${f.result || f.text || ''}`).join('\n\n');
        }
    } catch {}
    // Try siputzx (fallback 1)
    if (!fontList) try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/other/fancytext?text=${encodeURIComponent(q)}`, { timeout: 12000 });
        if (data?.result && Array.isArray(data.result)) {
            fontList = data.result.map(f => `*${f.name}:*\n${f.text || f.result || ''}`).join('\n\n');
        }
    } catch {}
    // Try elite API (fallback 2)
    if (!fontList) try {
        const { data } = await axios.get(`${config.ELITE_API}/font?text=${encodeURIComponent(q)}`, { timeout: 12000 });
        const arr = data?.result || data?.fonts;
        if (Array.isArray(arr)) fontList = arr.map(f => `*${f.name || f.style}:*\n${f.result || f.text || ''}`).join('\n\n');
        else if (typeof arr === 'string') fontList = arr;
    } catch {}
    // Try NEXRAY (fallback 3)
    if (!fontList) try {
        const { data } = await axios.get(`${config.NEXRAY_API}/tools/fancy?text=${encodeURIComponent(q)}`, { timeout: 12000 });
        const arr = data?.result;
        if (Array.isArray(arr)) fontList = arr.map(f => `*${f.name}:*\n${f.result || f.text}`).join('\n\n');
    } catch {}
    // Local Unicode generator (ALWAYS works — no API needed)
    if (!fontList) {
        const localFonts = generateLocalFonts(q);
        fontList = localFonts.map(f => `*${f.name}:*\n${f.result}`).join('\n\n');
    }
    await reply(`🎨 *Fancy Fonts for:* _${q}_\n\n${fontList.substring(0, 3500)}`);
    break;
}
case 'ytt': case 'yttranscribe': { await react('📝'); if (!q) return reply(`Usage: ${activePrefix}ytt <youtube url>`); try { const { data } = await axios.get(`${config.NEXRAY_API}/tools/yt-transcribe?url=${encodeURIComponent(q)}`, { timeout: 60000 }); const t = data?.result || data?.transcript; if (t) await reply(`📝 *YouTube Transcript:*\n\n${t.substring(0, 3000)}`); else reply('⚠️ Transcription failed.'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'readmore': { if (!q) return reply(`Usage: ${activePrefix}readmore <text>`); await socket.sendMessage(from, { text: `${q}\u0085\u0085\u0085\n\n_Read more hidden text_${WM}` }, { quoted: fakeCard }); break; }
// forwarded/viral command removed (channel-related)
// channelid command removed
// fc/follow channel command removed
case 'units': { await react('⚖️'); if (!q) return reply(`Usage: ${activePrefix}units <value> <from> <to>`); const val = parseFloat(args[0]), f2 = args[1]?.toLowerCase(), t2 = args[2]?.toLowerCase(); if (isNaN(val) || !f2 || !t2) return reply('⚠️ Invalid format.'); const conv = { 'km-miles': v => v * 0.621371, 'miles-km': v => v * 1.60934, 'kg-lbs': v => v * 2.20462, 'lbs-kg': v => v * 0.453592, 'm-ft': v => v * 3.28084, 'ft-m': v => v * 0.3048, 'c-f': v => v * 9 / 5 + 32, 'f-c': v => (v - 32) * 5 / 9 }; const key = `${f2}-${t2}`; if (conv[key]) await reply(`⚖️ *Conversion:*\n\n${val} ${f2} = ${conv[key](val).toFixed(4)} ${t2}`); else reply(`⚠️ Conversion "${f2}" to "${t2}" not supported.`); break; }
case 'savestatus': { await react('💾'); if (!msg.quoted) return reply('❗ Reply to a status to save it!'); try { const mediaSt = await downloadMediaMessage(msg.quoted, 'buffer', {}); const fileExt = msg.quoted?.message?.imageMessage ? 'jpg' : 'mp4'; const mimeType = msg.quoted?.message?.imageMessage ? 'image/jpeg' : 'video/mp4'; if (fileExt === 'jpg') await socket.sendMessage(from, { image: mediaSt, caption: `💾 Saved Status${WM}` }, { quoted: fakeCard }); else await socket.sendMessage(from, { document: mediaSt, mimetype: mimeType, fileName: `status_${Date.now()}.${fileExt}`, caption: `💾 Saved Status${WM}` }, { quoted: fakeCard }); await react('✅'); } catch (e) { reply(`⚠️ ${e.message}`); } break; } 
case 'imdb': { if (!q) return reply(`Usage: ${activePrefix}imdb <movie name>`); await react('⭐'); try { const res = await fetch(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(q)}`); const json = await res.json(); const info = `🎬 *${json.title || 'N/A'}* (${json.year || 'N/A'})\n🎭 Genre: ${json.genres || 'N/A'}\n⭐ Rating: ${json.rating || 'N/A'} (${json.votes || 'N/A'} votes)\n📝 Plot: ${json.plot || 'N/A'}\n🎬 Director: ${json.director || 'N/A'}\n👨‍👩‍👧‍👦 Actors: ${json.actors || 'N/A'}\n⏱️ Runtime: ${json.runtime || 'N/A'}\n📅 Released: ${json.released || 'N/A'}`; if (json.poster) await socket.sendMessage(from, { image: { url: json.poster }, caption: info + WM }, { quoted: fakeCard }); else await reply(info); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'blurface': { await react('🔇'); const qi6 = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message; if (!qi6?.imageMessage && !msg.message?.imageMessage) return reply('❗ Reply to an image'); try { const imgObj = qi6?.imageMessage || msg.message.imageMessage; const s = await downloadContentFromMessage(imgObj, 'image'); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]); const imgUrl = await uploadSmartMedia(b, 'image/jpeg'); const { data } = await axios.get(`${config.NEXRAY_API}/tools/blurface?imageUrl=${encodeURIComponent(imgUrl)}`, { responseType: 'arraybuffer', timeout: 30000 }); await socket.sendMessage(from, { image: Buffer.from(data), caption: `🔇 *Face Blurred!*${WM}` }, { quoted: fakeCard }); } catch (e) { reply(`⚠️ ${e.message}`); } break; }
case 'imagescanner': { await react('🔍'); const qiIs = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message; if (!qiIs?.imageMessage && !msg.message?.imageMessage) return reply('❗ Reply to an image'); try { const imgObj = qiIs?.imageMessage || msg.message.imageMessage; const s = await downloadContentFromMessage(imgObj, 'image'); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]); const imgUrl = await uploadSmartMedia(b, 'image/jpeg'); const { data } = await axios.get(`${config.DAVID_API}/tools/imagescanner?imageUrl=${encodeURIComponent(imgUrl)}`, { timeout: 30000 }); const result = data?.result || data?.text || data?.description; if (result) await reply(`🔍 *Image Scanner:*\n\n${typeof result === 'string' ? result : JSON.stringify(result, null, 2)}`); else reply('⚠️ Could not analyse image.'); } catch (e) { reply(`⚠️ ${e.message}`); } break; }

// ─── VISION (image + AI analysis) ────────────────────────────────────────────
case 'vision': case 'analyze': case 'describe': {
    await react('🔍');
    const qiVis = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
    const hasImgVis = qiVis?.imageMessage || msg.message?.imageMessage;
    if (!hasImgVis) return reply(`❗ Reply to an image with ${activePrefix}vision [optional question]`);
    try {
        const imgObj = qiVis?.imageMessage || msg.message.imageMessage;
        const s = await downloadContentFromMessage(imgObj, 'image');
        let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]);
        const imgUrl = await uploadSmartMedia(b, 'image/jpeg');
        const prompt = q || 'Describe this image in detail.';
        await reply('🔍 _Analysing image..._');
        let result = null;
        // Nanobanana vision
        try { const { data } = await axios.get(`${config.DAVID_API}/tools/nanobanana?imageUrl=${encodeURIComponent(imgUrl)}&prompt=${encodeURIComponent(prompt)}`, { timeout: 60000 }); result = data?.result?.text || data?.result?.description || data?.text; } catch {}
        // Nexray EU nanobanana
        if (!result) { try { const { data } = await axios.post(`${config.NEXRAY_EU}/ai/nanobanana`, { imageUrl: imgUrl, prompt }, { timeout: 60000 }); result = data?.result?.text || data?.result?.description || data?.text; } catch {} }
        // Image scanner fallback
        if (!result) { try { const { data } = await axios.get(`${config.DAVID_API}/tools/imagescanner?imageUrl=${encodeURIComponent(imgUrl)}`, { timeout: 30000 }); result = data?.result || data?.text || data?.description; } catch {} }
        // OCR fallback
        if (!result) { try { const { data } = await axios.get(`${config.NEXRAY_API}/tools/ocr?imageUrl=${encodeURIComponent(imgUrl)}`, { timeout: 30000 }); result = data?.result || data?.text; } catch {} }
        if (result) await replyImg(imgUrl, `🔍 *Vision Analysis:*\n\n${typeof result === 'string' ? result : JSON.stringify(result, null, 2)}`);
        else reply('⚠️ Could not analyse image. Try again.');
    } catch (e) { reply(`⚠️ Vision error: ${e.message}`); }
    break;
}

// ─── REPO ─────────────────────────────────────────────────────────────────────
case 'repo': case 'github': {
    await react('💻');
    if (q && !q.startsWith('http')) {
        // Search GitHub repos
        try {
            const { data } = await axios.get(`${config.NEXRAY_API}/search/github?query=${encodeURIComponent(q)}`, { timeout: 15000 });
            const results = data?.result || data?.items || [];
            if (!results.length) return reply(`⚠️ No GitHub repos found for: ${q}`);
            let txt = `💻 *GitHub Search: ${q}*\n\n`;
            results.slice(0, 5).forEach((r, i) => {
                txt += `${i + 1}. *${r.full_name || r.name}*\n⭐ ${r.stargazers_count || 0} | 🍴 ${r.forks_count || 0}\n${(r.description || '').substring(0, 80)}\n🔗 ${r.html_url || r.url || ''}\n\n`;
            });
            await reply(txt.trim());
        } catch (e) { reply(`⚠️ ${e.message}`); }
    } else {
        // Show bot repo
        await reply(`💻 *${AI_SHORT_NAME}*\n${AI_FULL_NAME}\n\n👑 Developer: Lovemore T | WhiteKid Tech\n🔗 https://github.com/whitekid-tech/Whitekid Prime`);
    }
    break;
}

// ─── YT STALK ─────────────────────────────────────────────────────────────────
case 'ytstalk': {
    await react('📺');
    if (!q) return reply(`Usage: ${activePrefix}ytstalk <channel name or URL>`);
    try {
        const { data } = await axios.get(`${config.DAVID_API}/stalk/youtube?channel=${encodeURIComponent(q)}`, { timeout: 15000 });
        const r = data?.result || data;
        await reply(`📺 *YouTube: ${q}*\n\nName: ${r?.name || 'N/A'}\nSubscribers: ${r?.subscribers || 'N/A'}\nViews: ${r?.views || 'N/A'}\nVideos: ${r?.videos || 'N/A'}\nDescription: ${(r?.description || '').substring(0, 150)}`);
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}

// ─── NFL ──────────────────────────────────────────────────────────────────────
case 'nfl': {
    await react('🏈');
    try {
        const games = await espnScoreboard('football', 'nfl');
        if (!games.length) return reply('⚠️ No NFL games right now. Season might be off.');
        let txt = `🏈 *NFL SCORES*`;
        games.slice(0, 8).forEach(g => { txt += `\n🏈 ${g.home} *${g.homeScore} - ${g.awayScore}* ${g.away}\n📍 ${g.status}\n`; });
        await reply(txt);
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}

// ─── TEAM SEARCH ──────────────────────────────────────────────────────────────
case 'teamsearch': {
    await react('🔍');
    if (!q) return reply(`Usage: ${activePrefix}teamsearch <team name>`);
    try {
        const d = await sportsdbSearch('searchteams', { t: q });
        const results = d?.teams || [];
        if (!results.length) return reply(`⚠️ No teams found for: *${q}*`);
        let txt = `🔍 *TEAM SEARCH: ${q}*`;
        results.slice(0, 5).forEach((t, i) => {
            txt += `\n${i+1}. *${t.strTeam}*\n🏆 League: ${t.strLeague || 'N/A'}\n🌍 Country: ${t.strCountry || 'N/A'}\n📅 Founded: ${t.intFormedYear || 'N/A'}\n`;
        });
        await reply(txt);
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}

// ─── PLAYER SEARCH ────────────────────────────────────────────────────────────
case 'playersearch': {
    await react('👤');
    if (!q) return reply(`Usage: ${activePrefix}playersearch <player name>`);
    try {
        const d = await sportsdbSearch('searchplayers', { p: q });
        const results = d?.player || [];
        if (!results.length) return reply(`⚠️ No players found for: *${q}*`);
        const p0 = results[0];
        let txt = `👤 *${p0.strPlayer || q}*`;
        txt += `⚽ Team: ${p0.strTeam || 'N/A'}\n🌍 Nationality: ${p0.strNationality || 'N/A'}\n🎯 Position: ${p0.strPosition || 'N/A'}\n🎂 Born: ${p0.dateBorn || 'N/A'}\n📏 Height: ${p0.strHeight || 'N/A'}\n`;
        if (p0.strDescriptionEN) txt += `\n📝 ${p0.strDescriptionEN.substring(0, 200)}...\n`;
        if (p0.strThumb || p0.strCutout) await socket.sendMessage(from, { image: { url: p0.strThumb || p0.strCutout }, caption: txt + WM }, { quoted: fakeCard });
        else await reply(txt);
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}

// ─── TOP SCORERS ──────────────────────────────────────────────────────────────
case 'topscorers': {
    await react('⚽');
    const lg = (args[0] || 'epl').toLowerCase();
    const leagueId = LEAGUE_IDS[lg] || '4328';
    try {
        // TheSportsDB doesn't have direct top scorers - show standings with goals instead
        const espnLeague = lg === 'laliga' || lg === 'la liga' ? 'esp.1' : lg === 'bundesliga' ? 'ger.1' : lg === 'serie a' ? 'ita.1' : 'eng.1';
        const { data } = await axios.get(`https://site.api.espn.com/apis/v2/sports/soccer/${espnLeague}/standings`, { timeout: 15000 });
        const entries = data?.standings?.[0]?.entries || [];
        if (!entries.length) return reply(`⚠️ No data for *${lg}*. Try: epl, laliga, bundesliga`);
        let txt = `⚽ *TOP TEAMS (${lg.toUpperCase()})*\n`;
        entries.slice(0, 10).forEach((e, i) => {
            const pts = e.stats?.find(s => s.name === 'points')?.value || 0;
            const gf = e.stats?.find(s => s.name === 'pointsFor' || s.name === 'goalsFor')?.value || 0;
            txt += `\n${i+1}. *${e.team?.displayName || '?'}* — ${pts}pts (GF: ${gf})`;
        });
        await reply(txt);
    } catch (e) { reply(`⚠️ Top scorers data unavailable for ${lg}. Try: .standings ${lg}`); }
    break;
}

// ─── UPCOMING MATCHES ─────────────────────────────────────────────────────────
case 'upcomingmatches': case 'upcoming': {
    await react('📅');
    const lg = (args[0] || 'epl').toLowerCase();
    const espnLeague = lg === 'laliga' || lg === 'la liga' ? 'esp.1' : lg === 'bundesliga' ? 'ger.1' : lg === 'serie a' ? 'ita.1' : lg === 'nba' ? null : 'eng.1';
    try {
        let games = [];
        if (espnLeague) {
            const allGames = await espnScoreboard('soccer', espnLeague);
            games = allGames.filter(g => g.status.includes('Scheduled') || g.status.includes('TBD') || g.status.includes(':'));
            if (!games.length) games = allGames.slice(0, 8); // show all if none are scheduled
        }
        if (!games.length) return reply(`⚠️ No upcoming matches found for *${lg}*. Try: epl, laliga, bundesliga, nba`);
        let txt = `📅 *UPCOMING (${lg.toUpperCase()})*`;
        games.slice(0, 8).forEach((g, i) => { txt += `\n${i+1}. *${g.home} vs ${g.away}*\n⏰ ${g.status}\n`; });
        await reply(txt);
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}

case 'goodbye': case 'bye': {
    if (!isGroup) return reply('⚠️ Groups only!');
    if (!isSenderGroupAdmin && !isOwner && !isDevOverride) return reply('⚠️ Admins only!');
    const subGby = args[0]?.toLowerCase();
    if (subGby === 'on') { await setGoodbye(from, true); await reply('* 👋 Goodbye Messages\n*✅ Goodbye messages *enabled*!'); }
    else if (subGby === 'off') { await setGoodbye(from, false); await reply('⚠️ Goodbye messages *disabled*.'); }
    else if (subGby === 'set') {
        const gbyMsg = args.slice(1).join(' ');
        if (!gbyMsg) return reply(`Usage: ${activePrefix}goodbye set <message>\nVariables: {user} {group}`);
        await setGoodbye(from, true, gbyMsg);
        await reply(`✅ Goodbye message set!\n\n${gbyMsg}`);
    } else {
        const gbyOn = await isGoodbyeOn(from), gbyMsg2 = await getGoodbye(from);
        await reply(`* 👋 Goodbye Settings\n*Status:* ${gbyOn ? 'ON 🟢' : 'OFF 🔴'}\n*Custom:* ${gbyMsg2 || 'Default'}\n\nUsage:\n${activePrefix}goodbye on/off\n${activePrefix}goodbye set <message>\n\nVariables: {user} {group}`);
    }
    break;
}

case 'tagactive': {
    if (!isGroup) return reply('⚠️ Groups only!');
    if (!isSenderGroupAdmin && !isOwner && !isDevOverride) return reply('⚠️ Admins only!');
    try {
        // Subscribe to presence updates in this group
        try { await socket.subscribePresence(from); } catch {}
        const gm = await socket.groupMetadata(from);
        const now = Date.now(), threshold = 30 * 60 * 1000; // 30 min
        const activeMembers = gm.participants.filter(p => {
            const ls = presenceTracker.get(p.id);
            return ls && (now - ls) < threshold;
        });
        if (!activeMembers.length) {
            return reply(`👁️ Tag Active\n⚠️ No recently active members detected yet.\n\nBot is now tracking presence in this group.\nSend some messages to register activity, then retry.\n\n💡 Use ${activePrefix}tagall to mention everyone.`);
        }
        let mentTxt = '', mentions = [];
        activeMembers.forEach(p => { mentTxt += `@${p.id.split('@')[0]}\n`; mentions.push(p.id); });
        await socket.sendMessage(from, {
            image: { url: botImg },
            caption: `👁️ Active Members\n📊 *${gm.subject}*\n⚡ Active (last 30min): ${activeMembers.length}\n\n${mentTxt}\n${q || ''}`,
            mentions: [nowsender, ...mentions]
        }, { quoted: msg });
    } catch (e) { reply(`⚠️ ${e.message}`); }
    break;
}

// ─── GCSTATUS (Post WhatsApp Group Status — text or media) ───────────────
case 'gcstatus': {
    if (!isGroup) return reply('⚠️ Groups only!');
    if (!isSenderGroupAdmin && !isOwner && !isDevOverride) return reply('⚠️ Admins only!');
    // Posts actual WA Group Status (not group description)
    // Usage: reply to image/video with .gcstatus [caption]  OR  .gcstatus your text
    await groupStatusUpdate(socket, from, msg, args, reply);
    break;
}

// ─── AUTOADD (Auto re-add removed/left members) ──────────────────────────────
case 'autoadd': {
    if (!isGroup) return reply('⚠️ Groups only!');
    if (!isSenderGroupAdmin && !isOwner && !isDevOverride) return reply('⚠️ Admins only!');
    const sub = args[0]?.toLowerCase();
    const isOn = await isAutoAddOn(from);
    if (sub === 'on') {
        await setAutoAdd(from, true);
        await react('✅');
        await reply('✅ *Auto-Add ENABLED*\n\nBot will automatically re-add members who leave or are removed from this group.\n\n💡 Make sure the bot is an admin!');
    } else if (sub === 'off') {
        await setAutoAdd(from, false);
        await react('⚠️');
        await reply('⚠️ *Auto-Add DISABLED*\n\nBot will no longer auto-add removed/left members.');
    } else {
        await reply(`➕ *AUTO-ADD*\n\n*Status:* ${isOn ? 'ON 🟢' : 'OFF 🔴'}\n\n📋 Usage:\n${activePrefix}autoadd on — enable auto-add\n${activePrefix}autoadd off — disable auto-add\n\n💡 When enabled, the bot automatically re-adds any member who leaves or is removed.\n\n> *Bot must be admin to re-add members!*`);
    }
    break;
}

// ─── DEFAULT (TicTacToe moves) ────────────────────────────────────────────────
default: {
    if (WK7 && WK7.has(command)) {
        await WK7.run(command, { socket, from, msg, q, args, reply, react, activePrefix, nowsender, senderName: senderDisplayName, isGroup, isOwner, fakeCard, quotedText: wkQuoted(msg), apiTargets: command === 'apicheck' ? collectApiTargets() : undefined });
        break;
    }
    if (/^[1-9]$/.test(command) || /^(surrender|give up)$/i.test(body.trim())) {
        await handleTicTacToeMove(socket, from, nowsender, body.trim());
    }
    break;
}

            // ─── WHITEKID PRIME v6 — GAMES & FUN PACK ────────────────────────────────────
            case 'dice':
            case 'coinflip':
            case 'rps':
            case 'slots':
            case 'guess':
            case 'trivia':
            case 'scramble':
            case 'mathquiz':
            case 'emojiquiz':
            case 'flagquiz':
            case 'capitalquiz':
            case 'answer':
            case 'hangman':
            case 'hm':
            case 'roulette':
            case 'lottery':
            case 'wyr':
            case 'nhie':
            case 'rate':
            case 'ship':
            case 'iqtest':
            case 'fortune':
            case 'horoscope':
            case 'luckynumber':
            case 'choose':
            case 'who':
            case 'blackjack':
            case 'hit':
            case 'stand':
            case 'reverse':
            case 'mock':
            case 'clap':
            case 'bubble':
            case 'uwu':
            case 'vaporwave':
            case 'upsidedown':
            case 'leet':
            case 'rot13':
            case 'morse':
            case 'binary':
            case 'hex':
            case 'repeat':
            case 'count':
            case 'shuffle':
            case 'palindrome':
            case 'roman':
            case 'lorem':
            case 'password':
            case 'randcolor':
            case 'uuid':
            case 'timestamp':
            case 'age':
            case 'bmi':
            case 'tip':
            case 'discount':
            case 'percent':
            case 'daysleft':
            case 'zodiac':
            case 'worldtime':
            case 'dadjoke':
            case 'pun':
            case 'compliment':
            case 'motivate':
            case 'affirm':
            case 'showerthought':
            case 'twister':
            case 'topic':
            case 'flip':
            {
                try { const _r = await wkRun(command, { socket, from, msg, q, args, reply, react, activePrefix, nowsender, senderName: senderDisplayName, isGroup, fakeCard }); if (_r === false) await reply(`⚠️ ${command} is not available.`); }
                catch (e) { console.error('[WK PACK]', command, e.message); await reply(`⚠️ ${e.message}`); }
                break;
            }

            } // end switch
}

module.exports = { runCommand };
