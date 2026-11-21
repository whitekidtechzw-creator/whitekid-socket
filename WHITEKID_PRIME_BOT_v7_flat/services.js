'use strict';
const { AI_FULL_NAME, AI_SHORT_NAME, AI_SYSTEM_IDENTITY, DEVELOPER_NUMBER, WM, config } = require('./config');
const { axios, cheerio, ffmpeg, fs, os, path, safeRequire, ytdl, ytdlp, yts } = require('./deps');
const { delay, downloadContentFromMessage, generateWAMessageFromContent, prepareWAMessageMedia, proto } = require('./wa');
const { sendListMessage } = require('./helpers');

const PAXSENIX = {
    BASE: 'https://api.paxsenix.org', KEY: config.PAXSENIX_API_KEY,
    headers: { Authorization: `Bearer ${config.PAXSENIX_API_KEY}`, 'Content-Type': 'application/json' },
    async get(ep) { const r = await axios.get(`${this.BASE}${ep}`, { headers: this.headers, timeout: 60000 }); return r.data; },
    async post(ep, data) { const r = await axios.post(`${this.BASE}${ep}`, data, { headers: this.headers, timeout: 60000 }); return r.data; }
};

const HOSTIFY = {
    BASE_URL: 'https://api.hostify.indevs.in/api',
    EP: { GROK: '/ai/grok', LYRICS: '/search/lyrics' },
    TIMEOUT: 30000, RETRIES: 2, RETRY_DELAY: 1000
};

async function hostifyPost(ep, body = {}) {
    for (let i = 0; i <= HOSTIFY.RETRIES; i++) {
        try { return (await axios.post(HOSTIFY.BASE_URL + ep, body, { headers: { 'Content-Type': 'application/json' }, timeout: HOSTIFY.TIMEOUT })).data; }
        catch (e) { if (i === HOSTIFY.RETRIES) throw e; await delay(HOSTIFY.RETRY_DELAY); }
    }
}

const APIS = {
    imageGen: p => [
        `${config.NEXRAY_EU}/ai/gptimage?param=${encodeURIComponent(p)}`,
        `${config.NEXRAY_API}/ai/gptimage?prompt=${encodeURIComponent(p)}`,
        `https://api.siputzx.my.id/api/ai/flux?prompt=${encodeURIComponent(p)}`,
        `https://stable.stacktoy.workers.dev/?apikey=Suhail&prompt=${encodeURIComponent(p)}`,
        `https://dalle.stacktoy.workers.dev/?apikey=Suhail&prompt=${encodeURIComponent(p)}`,
        `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=1024&height=1024&nologo=true`,
        `https://api.dreaded.site/api/dalle?text=${encodeURIComponent(p)}`
    ],
    download: {
        nayanYtInfo: u => `${config.NAYAN_API}/youtube?url=${encodeURIComponent(u)}`,
        nayanYtDown: u => `${config.NAYAN_API}/ytdown?url=${encodeURIComponent(u)}`,
        nayanYtSearch: q => `${config.NAYAN_API}/ytsearch?query=${encodeURIComponent(q)}`,
        nayanIg: u => `${config.NAYAN_API}/instagram?url=${encodeURIComponent(u)}`,
        nayanAio: u => `${config.NAYAN_API}/alldown?url=${encodeURIComponent(u)}`,
        ytmp3Prince: u => `${config.PRINCE_API}/download/ytmp3?apikey=${config.PRINCE_KEY}&url=${encodeURIComponent(u)}`,
        ytmp4Prince: u => `${config.PRINCE_API}/download/ytmp4?apikey=${config.PRINCE_KEY}&url=${encodeURIComponent(u)}`,
        ytvPrince: u => `${config.PRINCE_API}/download/ytv?apikey=${config.PRINCE_KEY}&url=${encodeURIComponent(u)}`,
        ytaudioPrince: u => `${config.PRINCE_API}/download/ytaudio?apikey=${config.PRINCE_KEY}&format=128kbps&url=${encodeURIComponent(u)}`,
        ytDownload: (u, type = 'audio', fmt = 'mp3') => `${config.PREXZY_API}/download/ytdownload?url=${encodeURIComponent(u)}&type=${type}&format=${fmt}`,
        tiktokPrexzy: u => `${config.PREXZY_API}/download/tiktokvideo?url=${encodeURIComponent(u)}`,
        saveweb2zip: u => `${config.PREXZY_API}/download/saveweb2zip?url=${encodeURIComponent(u)}`,
        mediafirePrexzy: u => `${config.PREXZY_API}/download/mediafire?url=${encodeURIComponent(u)}`,
        aio: u => `${config.PREXZY_API}/download/aio?url=${encodeURIComponent(u)}`,
        ytmp3: u => `${config.NEXRAY_API}/downloader/ytmp3?url=${encodeURIComponent(u)}`,
        ytplayvid: u => `${config.NEXRAY_API}/downloader/ytplayvid?url=${encodeURIComponent(u)}`,
        ytmp3Elite: u => `${config.ELITE_API}/ytdown?format=mp3&url=${encodeURIComponent(u)}`,
        ytmp4Elite: u => `${config.ELITE_API}/ytmp4?url=${encodeURIComponent(u)}`,
        fbElite: u => `${config.ELITE_API}/facebook?url=${encodeURIComponent(u)}`,
        ytDavid: u => `${config.DAVID_API}/download/youtube?url=${encodeURIComponent(u)}`,
        mediafire: u => `${config.DAVID_API}/download/mediafire?url=${encodeURIComponent(u)}`,
        twitter: u => `${config.DAVID_API}/download/twitter?url=${encodeURIComponent(u)}`,
        gdrive: u => `${config.DAVID_API}/download/googledrive?url=${encodeURIComponent(u)}`,
        website: u => `${config.DAVID_API}/download/website?url=${encodeURIComponent(u)}`,
        spotify: u => `${config.DAVID_API}/download/spotify?url=${encodeURIComponent(u)}`,
        igstory: u => `${config.DELINE_API}/downloader/igstory?url=${encodeURIComponent(u)}`,
        threads: u => `${config.DELINE_API}/downloader/threads?url=${encodeURIComponent(u)}`,
        apk: q => `${config.ELITE_API}/fdriod?query=${encodeURIComponent(q)}`,
        apkPure: q => `${config.QASIM_API}/api/apkpure/search?q=${encodeURIComponent(q)}`
    },
    ai: {
        gptimageEu: p => `${config.NEXRAY_EU}/ai/gptimage?param=${encodeURIComponent(p)}`,
        text2imageEu: `${config.NEXRAY_EU}/ai/v1/text2image`,
        nanoBananaEu: `${config.NEXRAY_EU}/ai/nanobanana`,
        advanced: (t, mode = '') => `${config.PREXZY_API}/ai/advanced?text=${encodeURIComponent(t)}${mode ? '&mode=' + mode : ''}`,
        gpt4: q => `https://api.dreaded.site/api/chatgpt4?text=${encodeURIComponent(q)}`,
        gemini: q => `https://api.dreaded.site/api/gemini?text=${encodeURIComponent(q)}`,
        llama: q => `${config.NEXRAY_API}/ai/llamacoder?model=qwen3-coder&prompt=${encodeURIComponent(q)}`,
        deepseek: q => `https://api.dreaded.site/api/deepseek?text=${encodeURIComponent(q)}`,
        mathgpt: q => `${config.ELITE_API}/mathgpt?question=${encodeURIComponent(q)}`,
        sologo: p => `${config.NEXRAY_API}/ai/sologo?prompt=${encodeURIComponent(p)}`,
        stablesd: p => `${config.DAVID_API}/tools/stablediffusion?prompt=${encodeURIComponent(p)}`,
        txt2vid: p => `${config.OKATSU_API}/ai/txt2video?text=${encodeURIComponent(p)}`
    },
    search: {
        ytsPrince: q => `${config.PRINCE_API}/search/yts?apikey=${config.PRINCE_KEY}&query=${encodeURIComponent(q)}`,
        nayanYts: q => `${config.NAYAN_API}/ytsearch?query=${encodeURIComponent(q)}`,
        lyricsPrince: q => `${config.PRINCE_API}/search/lyricsv2?apikey=${config.PRINCE_KEY}&query=${encodeURIComponent(q)}`,
        wiki: q => `${config.NEXRAY_API}/search/wikipedia?query=${encodeURIComponent(q)}`,
        pinterest: q => `${config.DAVID_API}/search/pinterest?query=${encodeURIComponent(q)}`,
        github: q => `${config.NEXRAY_API}/search/github?query=${encodeURIComponent(q)}`,
        yts: q => `${config.ELITE_API}/ytsearch?query=${encodeURIComponent(q)}`,
        bingImage: q => `${config.NEXRAY_API}/search/bingimage?query=${encodeURIComponent(q)}`,
        googleImage: q => `${config.NEXRAY_API}/search/googleimage?query=${encodeURIComponent(q)}`,
        wallpaper: q => `${config.ELITE_API}/wallpaper?query=${encodeURIComponent(q)}`,
        lyrics: q => `${config.ELITE_API}/lyrics?title=${encodeURIComponent(q)}`,
        lyrics2: q => `${config.DAVID_API}/search/lyrics?query=${encodeURIComponent(q)}`
    },
    tools: {
        remini: u => `${config.DAVID_API}/tools/remini?imageUrl=${encodeURIComponent(u)}`,
        removebg: u => `https://api.siputzx.my.id/api/iloveimg/removebg?image=${encodeURIComponent(u)}`,
        qr: t => `https://api.siputzx.my.id/api/tools/qr?text=${encodeURIComponent(t)}`,
        ssweb: u => `https://api.siputzx.my.id/api/tools/ssweb?url=${encodeURIComponent(u)}&theme=light&device=desktop`,
        ocr: u => `${config.NEXRAY_API}/tools/ocr?imageUrl=${encodeURIComponent(u)}`,
        trackip: ip => `${config.NEXRAY_API}/tools/trackip?ip=${encodeURIComponent(ip)}`,
        blurface: u => `${config.NEXRAY_API}/tools/blurface?imageUrl=${encodeURIComponent(u)}`,
        obfuscate: c => `${config.DAVID_API}/tools/jsobfuscator?code=${encodeURIComponent(c)}`,
        calc: e => `${config.DAVID_API}/tools/calculator?expression=${encodeURIComponent(e)}`,
        nanobanana: (u, p) => `${config.DAVID_API}/tools/nanobanana?imageUrl=${encodeURIComponent(u)}&prompt=${encodeURIComponent(p)}`,
        nanoBananaEu: (u, p) => `${config.NEXRAY_EU}/ai/nanobanana?imageUrl=${encodeURIComponent(u)}&prompt=${encodeURIComponent(p)}`,
        imagescanner: u => `${config.DAVID_API}/tools/imagescanner?imageUrl=${encodeURIComponent(u)}`,
        vcc: t => `${config.NEXRAY_API}/tools/vcc?type=${t}`,
        ytt: u => `${config.NEXRAY_API}/tools/yt-transcribe?url=${encodeURIComponent(u)}`,
        webcopier: u => `${config.ELITE_API}/webcopier?url=${encodeURIComponent(u)}`,
        font: t => `${config.ELITE_API}/font?text=${encodeURIComponent(t)}`,
        fancy: t => `https://www.dark-yasiya-api.site/other/font?text=${encodeURIComponent(t)}`,
        gimage: q => `${config.DISCARD_API}/api/dl/gimage?apikey=guru&query=${encodeURIComponent(q)}`,
        spongebob: t => `${config.PREXZY_API}/imagecreator/spongebob?text=${encodeURIComponent(t)}`,
        memeText: (t, w = 800, h = 600) => `${config.PREXZY_API}/imagecreator/memeText?text=${encodeURIComponent(t)}&width=${w}&height=${h}`,
        textGif: (t, bg = '000000', color = 'ffffff') => `${config.PREXZY_API}/imagecreator/gif?text=${encodeURIComponent(t)}&background=${bg}&color=${color}`,
        textMp4: (t, bg = '000000', color = 'ffffff') => `${config.PREXZY_API}/imagecreator/mp4?text=${encodeURIComponent(t)}&background=${bg}&color=${color}`
    },
    fun: {
        joke: () => 'https://v2.jokeapi.dev/joke/Any?type=single',
        darkjoke: () => 'https://v2.jokeapi.dev/joke/Dark?type=single',
        fact: () => 'https://uselessfacts.jsph.pl/random.json?language=en',
        advice: () => 'https://api.adviceslip.com/advice',
        waifu: () => 'https://api.waifu.pics/sfw/waifu',
        meme: () => `${config.PAXSENIX_URL}/fun/memes`,
        cat: () => 'https://api.thecatapi.com/v1/images/search',
        dog: () => `${config.DAVID_API}/random/dogs`,
        dare: () => 'https://shizoapi.onrender.com/api/texts/dare?apikey=shizo',
        truth: () => 'https://shizoapi.onrender.com/api/texts/truth?apikey=shizo',
        roast: () => 'https://vinuxd.vercel.app/api/roast',
        pickup: () => 'https://vinuxd.vercel.app/api/pickup',
        lovequote: () => 'https://api.popcat.xyz/lovequote',
        rizz: () => 'https://api.siputzx.my.id/api/r/rizz',
        riddle: () => 'https://api.siputzx.my.id/api/r/riddle',
        eightball: q => `https://api.siputzx.my.id/api/r/8ball?question=${encodeURIComponent(q)}`,
        technews: () => `${config.DAVID_API}/random/technews`,
        livefunfact: () => `${config.NEXRAY_API}/fun/livefunfact`,
        gaming: () => 'https://raw.githubusercontent.com/GlobalTechInfo/Database/main/images/game.json'
    },
    stalk: {
        tg: u => `${config.DAVID_API}/stalk/telegram?username=${encodeURIComponent(u)}`,
        npm: p => `${config.DAVID_API}/stalk/npm?package=${encodeURIComponent(p)}`,
        wachannel: u => `${config.DAVID_API}/stalk/whatsappchannel?url=${encodeURIComponent(u)}`,
        tiktok: u => `${config.ELITE_API}/tiktokstalk?username=${encodeURIComponent(u)}`,
        youtube: u => `${config.DAVID_API}/stalk/youtube?channel=${encodeURIComponent(u)}`
    },
    crypto: c => `https://api.coingecko.com/api/v3/simple/price?ids=${c}&vs_currencies=usd`,
    countries: () => `${config.ELITE_API}/countries`
};

const audioEndpoints = [
    u => `${config.NAYAN_API}/ytdown?url=${encodeURIComponent(u)}`,
    u => `${config.PRINCE_API}/download/ytmp3?apikey=${config.PRINCE_KEY}&url=${encodeURIComponent(u)}`,
    u => `${config.PRINCE_API}/download/ytaudio?apikey=${config.PRINCE_KEY}&format=128kbps&url=${encodeURIComponent(u)}`,
    u => `${config.PREXZY_API}/download/ytdownload?url=${encodeURIComponent(u)}&type=audio&format=mp3`,
    u => `${config.NEXRAY_API}/downloader/ytmp3?url=${encodeURIComponent(u)}`,
    u => `${config.ELITE_API}/ytdown?format=mp3&url=${encodeURIComponent(u)}`,
    u => `${config.OKATSU_API}/downloader/ytmp3?url=${encodeURIComponent(u)}`,
    u => `${config.PREXZY_API}/download/aio?url=${encodeURIComponent(u)}`
];

async function queryAudioEndpoints(videoUrl, timeout = 30000) {
    for (const epFn of audioEndpoints) {
        try {
            const { data } = await axios.get(epFn(videoUrl), { timeout });
            const dl = data?.mp3 || data?.audio || data?.download_url ||
                       data?.result?.download_url || data?.result?.audio ||
                       data?.url || data?.dl;
            if (dl && typeof dl === 'string' && dl.startsWith('http')) return { success: true, download_url: dl };
        } catch {}
    }
    return { success: false, download_url: null };
}

function isValidBuffer(buf) {
    return Buffer.isBuffer(buf) && buf.length > 16 * 1024;
}

async function ossBuffer(url) {
    try {
        const { data } = await axios.get(url, { responseType: 'arraybuffer', timeout: 90000, maxContentLength: Infinity });
        return Buffer.from(data);
    } catch { return Buffer.alloc(0); }
}

async function formatAudio(buffer) {
    // If ffmpeg available, ensure proper mp3 encoding; otherwise return as-is
    if (!ffmpeg || !buffer || buffer.length === 0) return buffer;
    return new Promise((resolve) => {
        const tmpIn = path.join(os.tmpdir(), `aud_in_${Date.now()}.tmp`);
        const tmpOut = path.join(os.tmpdir(), `aud_out_${Date.now()}.mp3`);
        try {
            fs.writeFileSync(tmpIn, buffer);
            ffmpeg(tmpIn)
                .audioCodec('libmp3lame')
                .audioBitrate(128)
                .format('mp3')
                .save(tmpOut)
                .on('end', () => {
                    try {
                        const out = fs.readFileSync(tmpOut);
                        fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut);
                        resolve(out.length > 0 ? out : buffer);
                    } catch { resolve(buffer); }
                })
                .on('error', () => {
                    try { fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut); } catch {}
                    resolve(buffer);
                });
        } catch { resolve(buffer); }
    });
}

const IDENTITY_TRIGGERS = ['who created you','who made you','who are you','your creator','who built you','what is your name','what are you','introduce yourself','tell me about yourself','what does Prime stand for','full name'];

async function askGrok(userMessage) {
    if (IDENTITY_TRIGGERS.some(t => userMessage.toLowerCase().includes(t)))
        return `🤖 I am *${AI_SHORT_NAME}* — *${AI_FULL_NAME}*.\n\nCreated by *WhiteKid Tech*, in 2026.\n📞 wa.me/${DEVELOPER_NUMBER}\n📱 t.me/whitekid01`;
    const tryApis = [
        // Primary: Paxsenix GPT-4o (has API key, most reliable)
        async () => { const d = await PAXSENIX.post('/ai/gpt-4o', { message: `[SYSTEM: ${AI_SYSTEM_IDENTITY}] ${userMessage}` }); return d?.result || d?.response || d?.message || d?.text || null; },
        // Paxsenix Gemini Flash
        async () => { const d = await PAXSENIX.post('/ai/gemini-2.0-flash', { message: userMessage }); return d?.result || d?.response || null; },
        // Paxsenix Claude Haiku
        async () => { const d = await PAXSENIX.post('/ai/claude-3-5-haiku', { message: userMessage }); return d?.result || d?.response || null; },
        // Hostify Grok fallback
        async () => { const d = await hostifyPost(HOSTIFY.EP.GROK, { message: `[SYSTEM: ${AI_SYSTEM_IDENTITY}] ${userMessage}` }); return d?.result || d?.response || d?.message || null; },
        // Free API fallbacks
        async () => { const { data } = await axios.get(`https://api.dreaded.site/api/gemini?text=${encodeURIComponent(userMessage)}`, { timeout: 20000 }); return data?.result || data?.response || null; },
        async () => { const { data } = await axios.get(`https://api.siputzx.my.id/api/ai/deepseek?text=${encodeURIComponent(userMessage)}`, { timeout: 20000 }); return data?.result || null; },
        async () => { const { data } = await axios.get(`https://api.giftedtech.co.ke/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(userMessage)}`, { timeout: 15000 }); return data?.result || null; }
    ];
    for (const fn of tryApis) { try { const r = await fn(); if (r) return r; } catch {} }
    return null;
}

async function espnScoreboard(sport, league) {
    try {
        const { data } = await axios.get(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`, { timeout: 15000 });
        return (data?.events || []).map(ev => {
            const comp = ev.competitions?.[0];
            const home = comp?.competitors?.find(c => c.homeAway === 'home');
            const away = comp?.competitors?.find(c => c.homeAway === 'away');
            return { name: ev.name || ev.shortName || '?', home: home?.team?.displayName || '?', away: away?.team?.displayName || '?', homeScore: home?.score || '0', awayScore: away?.score || '0', status: ev.status?.type?.detail || ev.status?.type?.shortDetail || ev.status?.type?.name || 'Scheduled' };
        });
    } catch { return []; }
}

async function sportsdbSearch(endpoint, params) {
    try {
        const qs = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
        const { data } = await axios.get(`https://www.thesportsdb.com/api/v1/json/3/${endpoint}.php?${qs}`, { timeout: 15000 });
        return data;
    } catch { return {}; }
}

const LEAGUE_IDS = { epl: '4328', 'premier league': '4328', laliga: '4335', bundesliga: '4331', 'serie a': '4332', 'ligue 1': '4334', champions: '4480', ucl: '4480' };

let cachedLocation = null, lastLocationFetch = 0;

async function getUserLocation() {
    const now = Date.now();
    if (cachedLocation && (now - lastLocationFetch) < 3600000) return cachedLocation;
    try { const r = await axios.get('https://ipapi.co/json/', { timeout: 5000 }); cachedLocation = { city: r.data.city || 'Unknown', region: r.data.region || 'Unknown', country: r.data.country_name || 'Unknown', timezone: r.data.timezone || 'UTC', lat: r.data.latitude, lon: r.data.longitude }; lastLocationFetch = now; return cachedLocation; }
    catch { return { city: 'Unknown', region: 'Unknown', country: 'Unknown', timezone: 'UTC' }; }
}

function getCurrentDateTime() {
    const now = new Date(), opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
    return { formatted: now.toLocaleString('en-US', opts), timestamp: now.getTime(), day: now.toLocaleDateString('en-US', { weekday: 'long' }), date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) };
}

async function sendVoiceReply(text, socket, from, quotedMsg) {
    try {
        const clean = text.replace(/[*_~`>]/g, '').replace(/\n+/g, ' ').substring(0, 200);
        let audioBuffer = null;
        // Primary: StreamElements TTS (free, no key)
        try {
            const r = await axios.get(`https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(clean)}`, { responseType: 'arraybuffer', timeout: 20000 });
            if (r.data && r.data.byteLength > 500) audioBuffer = Buffer.from(r.data);
        } catch {}
        // Fallback: Google Translate TTS
        if (!audioBuffer) {
            try {
                const r2 = await axios.get(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(clean)}&tl=en&client=tw-ob`, { responseType: 'arraybuffer', timeout: 20000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
                if (r2.data && r2.data.byteLength > 500) audioBuffer = Buffer.from(r2.data);
            } catch {}
        }
        // Fallback 2: TikTok TTS
        if (!audioBuffer) {
            try {
                const r3 = await axios.post('https://tiktok-tts.weilbyte.dev/api/generate', { text: clean.substring(0, 150), voice: 'en_us_002' }, { responseType: 'arraybuffer', timeout: 15000 });
                if (r3.data && r3.data.byteLength > 500) audioBuffer = Buffer.from(r3.data);
            } catch {}
        }
        if (!audioBuffer) throw new Error('All TTS services unavailable');
        await socket.sendMessage(from, { audio: audioBuffer, mimetype: 'audio/mpeg', ptt: false }, { quoted: quotedMsg });
        return true;
    } catch (e) { console.error('[VOICE REPLY]', e.message); return false; }
}

async function generateGreetingAudio(displayName, socket, from, quoted) {
    try {
        const txt = `Hey ${displayName}! Welcome! I am ${AI_SHORT_NAME}, powered by WhiteKid Tech. Type dot menu to see all my commands!`;
        let audioBuffer = null;
        try {
            const r = await axios.get(`https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(txt)}`, { responseType: 'arraybuffer', timeout: 20000 });
            if (r.data && r.data.byteLength > 500) audioBuffer = Buffer.from(r.data);
        } catch {}
        if (!audioBuffer) {
            try {
                const r2 = await axios.get(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(txt.substring(0, 200))}&tl=en&client=tw-ob`, { responseType: 'arraybuffer', timeout: 20000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
                if (r2.data && r2.data.byteLength > 500) audioBuffer = Buffer.from(r2.data);
            } catch {}
        }
        if (!audioBuffer) throw new Error('TTS unavailable');
        await socket.sendMessage(from, { audio: audioBuffer, mimetype: 'audio/mpeg', ptt: false }, { quoted });
        return true;
    } catch (e) { console.error('[TTS GREETING]', e.message); return false; }
}

async function uploadAudioToCatbox(audioBuffer, ext) {
    const safeExt = ext.replace(/[^a-z0-9]/gi, '') || 'ogg';
    const tmpPath = path.join(os.tmpdir(), `audio_${Date.now()}.${safeExt}`);
    try { fs.writeFileSync(tmpPath, audioBuffer); const form = new FormData(); form.append('fileToUpload', fs.createReadStream(tmpPath), `audio.${safeExt}`); form.append('reqtype', 'fileupload'); const res = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders(), timeout: 60000, maxContentLength: Infinity, maxBodyLength: Infinity }); try { fs.unlinkSync(tmpPath); } catch {} const url = (res.data || '').trim(); if (!url.startsWith('http')) throw new Error('No URL'); return url; }
    catch (e) { try { fs.unlinkSync(tmpPath); } catch {} throw e; }
}

async function uploadToCatbox(buffer, mimeType) {
    const ext = mimeType.includes('jpeg') ? '.jpg' : mimeType.includes('png') ? '.png' : '.jpg';
    const tmp = path.join(os.tmpdir(), `upload_${Date.now()}${ext}`);
    fs.writeFileSync(tmp, buffer);
    const form = new FormData(); form.append('fileToUpload', fs.createReadStream(tmp), `image${ext}`); form.append('reqtype', 'fileupload');
    const res = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders(), timeout: 60000, maxContentLength: Infinity, maxBodyLength: Infinity });
    try { fs.unlinkSync(tmp); } catch {}
    const catboxUrl = (res.data || '').toString().trim();
    if (!catboxUrl || !catboxUrl.startsWith('http')) throw new Error('Catbox upload failed: ' + catboxUrl);
    return catboxUrl;
}

async function transcribeAudio(audioBuffer, mimeType) {
    const extMap = { 'audio/ogg': 'ogg', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/m4a': 'm4a', 'audio/wav': 'wav', 'audio/aac': 'aac', 'audio/webm': 'webm', 'audio/3gp': '3gp', 'audio/opus': 'ogg' };
    const mime = (mimeType || '').toLowerCase().split(';')[0].trim(), ext = extMap[mime] || 'ogg';
    let audioUrl = null; try { audioUrl = await uploadAudioToCatbox(audioBuffer, ext); } catch (e) { console.error('[TRANSCRIBE] Upload failed:', e.message); }
    if (audioUrl) {
        for (const u of [`https://api.siputzx.my.id/api/ai/whisper?url=${encodeURIComponent(audioUrl)}`, `https://api.dreaded.site/api/speech-to-text?url=${encodeURIComponent(audioUrl)}`, `${config.NEXRAY_API}/tools/yt-transcribe?url=${encodeURIComponent(audioUrl)}`]) {
            try { const { data } = await axios.get(u, { timeout: 40000 }); const t = data?.result || data?.text || data?.transcript; if (t && typeof t === 'string' && t.trim()) return t.trim(); } catch {}
        }
    }
    return null;
}

const generateImage = async prompt => {
    for (const apiUrl of APIS.imageGen(prompt)) {
        try {
            if (apiUrl.includes('text2image')) {
                const { data } = await axios.post(apiUrl, { prompt }, { timeout: 60000 });
                const imgUrl = data?.result || data?.imageUrl || data?.url;
                if (imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
                    const { data: imgData } = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 30000 });
                    const buf = Buffer.from(imgData); if (buf[0] === 0x89 || buf[0] === 0xFF) return buf;
                }
                continue;
            }
            const { data } = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 30000 });
            const buf = Buffer.from(data); if (buf[0] === 0x89 || buf[0] === 0xFF) return buf;
        } catch { continue; }
    }
    throw new Error('All image generation APIs failed');
};

async function ytGetInfo(url) {
    for (const fn of [
        async () => { const { data } = await axios.get(`${config.NAYAN_API}/youtube?url=${encodeURIComponent(url)}`, { timeout: 15000 }); if (data?.title) return data; throw new Error('no info'); },
        async () => { const { data } = await axios.get(`${config.PRINCE_API}/search/yts?apikey=${config.PRINCE_KEY}&query=${encodeURIComponent(url)}`, { timeout: 15000 }); if (data?.result?.length) return data.result[0]; throw new Error('no info'); },
        async () => { const sr = await yts(url); const v = sr.videos?.[0]; if (v) return v; throw new Error('no info'); },
        async () => { const { data } = await axios.get(`${config.NAYAN_API}/ytsearch?query=${encodeURIComponent(url)}`, { timeout: 10000 }); if (data?.results?.length) return data.results[0]; throw new Error('no info'); }
    ]) { try { return await fn(); } catch {} }
    return null;
}

async function ytDownloadMp4(url) {
    for (const fn of [
        async () => { const { data } = await axios.get(`${config.NAYAN_API}/ytdown?url=${encodeURIComponent(url)}`, { timeout: 30000 }); const dl = data?.mp4 || data?.video || data?.download_url; if (dl) return dl; throw new Error('no url'); },
        async () => { const { data } = await axios.get(`${config.PRINCE_API}/download/ytmp4?apikey=${config.PRINCE_KEY}&url=${encodeURIComponent(url)}`, { timeout: 30000 }); const dl = data?.result?.download_url || data?.download_url; if (dl) return dl; throw new Error('no url'); },
        async () => { const { data } = await axios.get(`${config.PRINCE_API}/download/ytv?apikey=${config.PRINCE_KEY}&url=${encodeURIComponent(url)}`, { timeout: 30000 }); const dl = data?.result?.download_url || data?.download_url; if (dl) return dl; throw new Error('no url'); },
        async () => { const { data } = await axios.get(`${config.NEXRAY_API}/downloader/ytplayvid?url=${encodeURIComponent(url)}`, { timeout: 30000 }); const dl = data?.result?.download_url || data?.url; if (dl) return dl; throw new Error('no url'); },
        async () => { const { data } = await axios.get(`${config.ELITE_API}/ytmp4?url=${encodeURIComponent(url)}`, { timeout: 30000 }); const dl = data?.result?.download_url || data?.download_url; if (dl) return dl; throw new Error('no url'); }
    ]) { try { const dl = await fn(); if (dl) return dl; } catch {} }
    return null;
}

async function localYtAudio(url) {
    if (ytdlp) {
        const out = path.join(os.tmpdir(), `yta_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.mp3`);
        try {
            await ytdlp(url, { extractAudio: true, audioFormat: 'mp3', audioQuality: 5, output: out, noPlaylist: true, noWarnings: true });
            if (fs.existsSync(out)) { const b = fs.readFileSync(out); if (isValidBuffer(b)) return b; }
        } catch (e) { console.error('[LOCAL yt-dlp audio]', e.message); }
        finally { try { fs.unlinkSync(out); } catch {} }
    }
    if (ytdl) {
        try {
            const chunks = []; const st = ytdl(url, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 });
            for await (const c of st) chunks.push(c);
            const b = Buffer.concat(chunks); if (isValidBuffer(b)) return b;
        } catch (e) { console.error('[LOCAL ytdl audio]', e.message); }
    }
    return Buffer.alloc(0);
}

async function localYtVideo(url) {
    if (ytdlp) {
        const out = path.join(os.tmpdir(), `ytv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.mp4`);
        try {
            await ytdlp(url, { format: 'best[ext=mp4][height<=480]/best[height<=480]/best', output: out, noPlaylist: true, noWarnings: true });
            if (fs.existsSync(out)) { const b = fs.readFileSync(out); if (isValidBuffer(b)) return b; }
        } catch (e) { console.error('[LOCAL yt-dlp video]', e.message); }
        finally { try { fs.unlinkSync(out); } catch {} }
    }
    if (ytdl) {
        try {
            const chunks = []; const st = ytdl(url, { quality: 18, highWaterMark: 1 << 25 });
            for await (const c of st) chunks.push(c);
            const b = Buffer.concat(chunks); if (isValidBuffer(b)) return b;
        } catch (e) { console.error('[LOCAL ytdl video]', e.message); }
    }
    return Buffer.alloc(0);
}

async function paxVideoJob(endpoint, prompt) {
    const pickUrl = d => d?.video_url || d?.url || d?.result?.video_url || d?.result?.url || d?.data?.video_url || d?.data?.url || (typeof d?.result === 'string' && /^https?:/.test(d.result) ? d.result : null) || (typeof d?.output === 'string' && /^https?:/.test(d.output) ? d.output : null) || null;
    let d; try { d = await PAXSENIX.post(endpoint, { prompt }); } catch (e) { console.error('[PAX VIDEO]', endpoint, e.message); return null; }
    let url = pickUrl(d); if (url) return url;
    let taskUrl = d?.task_url || d?.taskUrl || (d?.jobId ? `${PAXSENIX.BASE}/task/${d.jobId}` : null);
    if (!taskUrl) return null;
    if (!/^https?:/.test(taskUrl)) taskUrl = `${PAXSENIX.BASE}${taskUrl.startsWith('/') ? '' : '/'}${taskUrl}`;
    for (let i = 0; i < 40; i++) {
        await delay(4000);
        try {
            const r = await axios.get(taskUrl, { headers: PAXSENIX.headers, timeout: 30000 }); const td = r.data;
            url = pickUrl(td); if (url) return url;
            if (/fail|error/i.test(String(td?.status || ''))) return null;
        } catch {}
    }
    return null;
}

async function getLyrics(query) {
    for (const fn of [
        async () => { const { data } = await axios.get(`${config.PRINCE_API}/search/lyricsv2?apikey=${config.PRINCE_KEY}&query=${encodeURIComponent(query)}`, { timeout: 15000 }); const l = data?.result?.lyrics || data?.lyrics; if (l) return l; throw new Error('no'); },
        async () => { const { data } = await axios.get(`${config.ELITE_API}/lyrics?title=${encodeURIComponent(query)}`, { timeout: 15000 }); const l = data?.result?.lyrics || data?.lyrics; if (l) return l; throw new Error('no'); },
        async () => { const { data } = await axios.get(`${config.DAVID_API}/search/lyrics?query=${encodeURIComponent(query)}`, { timeout: 15000 }); const l = data?.result?.lyrics || data?.lyrics; if (l) return l; throw new Error('no'); },
        async () => { const r = await fetch(`https://lyricsapi.fly.dev/api/lyrics?q=${encodeURIComponent(query)}`); const d = await r.json(); const l = d?.result?.lyrics; if (l) return l; throw new Error('no'); },
        // NEW: lrclib fallback (plain lyrics)
        async () => {
            const { data } = await axios.get(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`, { timeout: 15000 });
            const l = data?.[0]?.plainLyrics || data?.[0]?.syncedLyrics;
            if (l) return l; throw new Error('no');
        }
    ]) { try { const l = await fn(); if (l) return l; } catch {} }
    return null;
}

async function aioDownload(url) {
    for (const fn of [
        async () => { const { data } = await axios.get(`${config.NAYAN_API}/alldown?url=${encodeURIComponent(url)}`, { timeout: 30000 }); return data?.result || data; },
        async () => { const { data } = await axios.get(`${config.PREXZY_API}/download/aio?url=${encodeURIComponent(url)}`, { timeout: 30000 }); return data?.result || data; }
    ]) { try { const r = await fn(); if (r) return r; } catch {} }
    return null;
}

async function mediafireDl(url) {
    for (const fn of [
        async () => { const { data } = await axios.get(`${config.PREXZY_API}/download/mediafire?url=${encodeURIComponent(url)}`, { timeout: 30000 }); if (data?.result?.link || data?.link) return { link: data?.result?.link || data?.link, name: data?.result?.name || 'file', size: data?.result?.size || 'Unknown' }; throw new Error('no'); },
        async () => { const { data } = await axios.get(`${config.DAVID_API}/download/mediafire?url=${encodeURIComponent(url)}`, { timeout: 30000 }); if (data?.result) return data.result; throw new Error('no'); },
        // NEW: Nexray EU mediafire
        async () => { const { data } = await axios.get(`${config.NEXRAY_EU}/downloader/mediafire?url=${encodeURIComponent(url)}`, { timeout: 30000 }); if (data?.result?.link || data?.link) return { link: data?.result?.link || data?.link, name: data?.result?.name || 'file', size: data?.result?.size || 'Unknown' }; throw new Error('no'); },
        async () => { const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }); const $ = cheerio.load(data); const link = $('#downloadButton').attr('href'); const name = $('.dl-btn-label').attr('title') || 'file'; const size = $('#downloadButton').text().replace(/Download|[()]|\s/g, '').trim(); if (link) return { name, size, link, ext: (name || '').split('.').pop() || 'bin' }; throw new Error('no'); }
    ]) { try { const r = await fn(); if (r) return r; } catch {} }
    return null;
}

const paxShazam = async u => { try { return await PAXSENIX.post('/tools/shazam', { url: u }); } catch { return null; } };

const paxMemes = async () => { try { return await PAXSENIX.get('/fun/memes'); } catch { return null; } };

const paxQuotes = async () => { try { return await PAXSENIX.get('/fun/quotes'); } catch { return null; } };

const paxVeo = async p => { try { return await PAXSENIX.post('/ai-video/veo-3.1', { prompt: p }); } catch { return null; } };

const paxTempMailCreate = async () => { try { return await PAXSENIX.get('/tempmail/create'); } catch { return null; } };

const paxTempMailInbox = async e => { try { return await PAXSENIX.get(`/tempmail/inbox?email=${encodeURIComponent(e)}`); } catch { return null; } };

const paxTempMailBody = async id => { try { return await PAXSENIX.get(`/tempmail/body?id=${id}`); } catch { return null; } };

const paxMovieSearch = async q => { try { return await PAXSENIX.get(`/moviebox/search?query=${encodeURIComponent(q)}`); } catch { return null; } };

const paxMovieSources = async id => { try { return await PAXSENIX.get(`/moviebox/sources?id=${id}`); } catch { return null; } };

async function searchMovies(query, sock, from, m, fakeCard, botImg) {
    try {
        try {
            const { data } = await axios.get(`${config.SILENT_API}/api/search`, { params: { query }, timeout: 20000 });
            if (data.results?.length) {
                const results = data.results.slice(0, 5); const cards = [];
                for (const movie of results) {
                    const title = (movie.title || "Unknown").slice(0, 50), isSeries = movie.subjectType === 2;
                    global.movieSubCache[movie.subjectId] = movie.subtitles || "None";
                    const subText = movie.subtitles ? movie.subtitles.split(',').slice(0, 3).join(', ') + '...' : 'None';
                    const desc = `⭐ ${movie.imdbRatingValue || 'N/A'} 🎭 ${movie.genre || 'N/A'}\n📅 ${movie.releaseDate?.split('-')[0] || '?'} 📌 ${isSeries ? 'Series' : 'Movie'}\n💬 Subs: ${subText}`;
                    const coverUrl = movie.cover?.url || botImg;
                    const media = await prepareWAMessageMedia({ image: { url: coverUrl } }, { upload: sock.waUploadToServer }).catch(() => null);
                    const ab = isSeries ? [
                        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "📺 Download", id: `${config.PREFIX}dlmovie ${movie.subjectId} 1 1` }) },
                        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "📝 Subtitles", id: `${config.PREFIX}smsubs ${movie.subjectId} 1 1` }) }
                    ] : [
                        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🎬 Download", id: `${config.PREFIX}dlmovie ${movie.subjectId} null null` }) },
                        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "📝 Subtitles", id: `${config.PREFIX}smsubs ${movie.subjectId} null null` }) }
                    ];
                    cards.push({ body: proto.Message.InteractiveMessage.Body.create({ text: desc }), header: proto.Message.InteractiveMessage.Header.create({ title: `🎬 ${title}`, hasMediaAttachment: !!media, imageMessage: media?.imageMessage }), nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons: ab }) });
                }
                const im = proto.Message.InteractiveMessage.create({ body: proto.Message.InteractiveMessage.Body.create({ text: `🎥 *Results for:* ${query}\n\nSwipe ➡️` }), carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({ cards, messageVersion: 1 }) });
                const msg2 = generateWAMessageFromContent(from, { viewOnceMessage: { message: { messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 }, interactiveMessage: im } } }, { quoted: m });
                await sock.relayMessage(from, msg2.message, { messageId: msg2.key.id }); await sock.sendMessage(from, { react: { text: '✅', key: m.key } }); return null;
            }
        } catch {}
        const tmdb = await axios.get(`https://api.themoviedb.org/3/search/multi?api_key=${config.TMDB_API_KEY}&query=${encodeURIComponent(query)}`, { timeout: 10000 }).then(r => r.data.results || []).catch(() => []);
        if (!tmdb.length) return "⚠️ No results found.";
        const cards2 = [];
        for (const item of tmdb.slice(0, 8)) {
            const isSeries = item.media_type === 'tv', title = isSeries ? item.name : item.title, desc = (item.overview || 'No description.').substring(0, 200);
            const poster = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : botImg;
            const media = await prepareWAMessageMedia({ image: { url: poster } }, { upload: sock.waUploadToServer }).catch(() => null);
            const ab = isSeries ? [{ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "📺 Download", id: `${config.PREFIX}dlmovie ${item.id} 1 1` }) }, { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "📝 Subs", id: `${config.PREFIX}smsubs ${item.id} 1 1` }) }] : [{ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🎬 Download", id: `${config.PREFIX}dlmovie ${item.id} null null` }) }, { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "📝 Subs", id: `${config.PREFIX}smsubs ${item.id} null null` }) }];
            cards2.push({ body: proto.Message.InteractiveMessage.Body.create({ text: desc }), header: proto.Message.InteractiveMessage.Header.create({ title: `🎬 ${title}`, hasMediaAttachment: !!media, imageMessage: media?.imageMessage }), nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons: ab }) });
        }
        const im2 = proto.Message.InteractiveMessage.create({ body: proto.Message.InteractiveMessage.Body.create({ text: `🎥 *Results for:* ${query}\n\nSwipe ➡️` }), carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({ cards: cards2, messageVersion: 1 }) });
        const msg3 = generateWAMessageFromContent(from, { viewOnceMessage: { message: { messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 }, interactiveMessage: im2 } } }, { quoted: m });
        await sock.relayMessage(from, msg3.message, { messageId: msg3.key.id }); await sock.sendMessage(from, { react: { text: '✅', key: m.key } }); return null;
    } catch (e) { console.error("[MOVIE SEARCH ERROR]", e.message); return `🩸 Search Error: ${e.message}`; }
}

async function showSubtitleOptions(movieId, season, episode, sock, from, m) {
    const cached = global.movieSubCache[movieId]; if (!cached || cached === 'None') return "🩸 No subtitles available.";
    const subList = cached.split(',').map(s => s.trim());
    const rows = subList.map(sub => ({ header: "", title: `📝 ${sub}`, description: `Download with ${sub}`, id: `${config.PREFIX}dlmovie ${movieId} ${season || 'null'} ${episode || 'null'} ${sub}` }));
    await sendListMessage(sock, from, "📝 Subtitles", "🗣️ *Select Subtitle Language*\n\nChoose from the list below:", "© WhiteKid Tech", [{ title: "Available Languages", rows }], m);
    return null;
}

async function downloadMovieFile(movieId, season, episode, lang, sock, from, m) {
    try {
        const params = { movie_id: movieId }; if (season && season !== 'null' && episode && episode !== 'null') { params.season = season; params.episode = episode; } if (lang) params.sub_lang = lang;
        const { data } = await axios.get(`${config.SILENT_API}/api/download`, { params, timeout: 60000 }); if (!data.download_url) throw new Error("No download URL");
        const sizeMB = data.size_bytes ? parseFloat((parseInt(data.size_bytes) / (1024 * 1024)).toFixed(2)) : 0;
        const fn = (season && season !== 'null') ? `Silent_S${season}E${episode}.mp4` : `Silent_Movie_${movieId}.mp4`;
        if (sizeMB > 100) {
            await sock.sendMessage(from, { text: `📦 File is ${sizeMB}MB. Uploading to GoFile...` }, { quoted: m });
            const wPath = path.join(os.tmpdir(), fn); const writer = fs.createWriteStream(wPath); const resp = await axios({ url: data.download_url, method: 'GET', responseType: 'stream' }); resp.data.pipe(writer); await new Promise((res, rej) => { writer.on('finish', res); writer.on('error', rej); });
            const { data: sd } = await axios.get('https://api.gofile.io/servers'); const srv = sd.data.servers[0].name;
            const fd2 = new FormData(); fd2.append('file', fs.createReadStream(wPath)); const { data: ud } = await axios.post(`https://${srv}.gofile.io/contents/uploadfile`, fd2, { headers: fd2.getHeaders(), maxBodyLength: Infinity, maxContentLength: Infinity });
            if (!ud || ud.status !== 'ok') throw new Error("GoFile upload failed");
            await sock.sendMessage(from, { text: `🎬 *${fn}*\n\n📦 *Size:* ${sizeMB}MB\n🔗 *GoFile:* ${ud.data.downloadPage}` }, { quoted: m }); try { fs.unlinkSync(wPath); } catch {}
        } else { await sock.sendMessage(from, { document: { url: data.download_url }, mimetype: 'video/mp4', fileName: fn, caption: `🎬 *Downloaded*\n📦 Size: ${sizeMB}MB${WM}` }, { quoted: m }); }
        if (data.subtitle_url) { try { const sn2 = (season && season !== 'null') ? `Subs_${lang || 'Default'}_S${season}E${episode}.srt` : `Subs_${lang || 'Default'}.srt`; const sr = await axios.get(data.subtitle_url, { responseType: 'arraybuffer' }); await sock.sendMessage(from, { document: Buffer.from(sr.data), mimetype: 'application/x-subrip', fileName: sn2, caption: `📝 *${lang || 'English'} Subtitles*` }, { quoted: m }); } catch {} }
        return null;
    } catch (e) { return `🩸 Download Error: ${e.message}`; }
}

const { fromBuffer } = safeRequire('file-type', { fromBuffer: async () => ({ ext: 'bin', mime: 'application/octet-stream' }) });

async function TelegraPh(filePath) {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(filePath)) return reject(new Error("File not Found"));
        try {
            const form = new FormData();
            form.append("file", fs.createReadStream(filePath));
            const data = await axios({ url: "https://telegra.ph/upload", method: "POST", headers: { ...form.getHeaders() }, data: form });
            return resolve("https://telegra.ph" + data.data[0].src);
        } catch (err) { return reject(new Error(String(err))); }
    });
}

async function UploadFileUgu(input) {
    return new Promise(async (resolve, reject) => {
        const form = new FormData();
        form.append("files[]", fs.createReadStream(input));
        await axios({ url: "https://uguu.se/upload.php", method: "POST", headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", ...form.getHeaders() }, data: form })
            .then(data => resolve(data.data.files[0]))
            .catch(err => reject(err));
    });
}

async function webp2mp4File(filePath) {
    return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('new-image-url', '');
        form.append('new-image', fs.createReadStream(filePath));
        axios({ method: 'post', url: 'https://s6.ezgif.com/webp-to-mp4', data: form, headers: { 'Content-Type': `multipart/form-data; boundary=${form._boundary}` } })
            .then(({ data }) => {
                const form2 = new FormData();
                const $ = cheerio.load(data);
                const file = $('input[name="file"]').attr('value');
                form2.append('file', file); form2.append('convert', "Convert WebP to MP4!");
                axios({ method: 'post', url: 'https://ezgif.com/webp-to-mp4/' + file, data: form2, headers: { 'Content-Type': `multipart/form-data; boundary=${form2._boundary}` } })
                    .then(({ data: d2 }) => { const $2 = cheerio.load(d2); const result = 'https:' + $2('div#output > p.outfile > video > source').attr('src'); resolve({ status: true, result }); })
                    .catch(reject);
            }).catch(reject);
    });
}

async function uploadToTelegraph(buffer, mimeType) {
    try {
        const ext = mimeType.includes('jpeg') ? '.jpg' : mimeType.includes('png') ? '.png' : mimeType.includes('gif') ? '.gif' : '.jpg';
        const tmp = path.join(os.tmpdir(), `tph_${Date.now()}${ext}`);
        fs.writeFileSync(tmp, buffer);
        const url = await TelegraPh(tmp);
        try { fs.unlinkSync(tmp); } catch {}
        return url;
    } catch (e) { console.error('[TelegraPh upload]', e.message); return null; }
}

async function uploadSmartMedia(buffer, mimeType) {
    try { const url = await uploadToCatbox(buffer, mimeType); if (url) return url; } catch {}
    try { return await uploadToTelegraph(buffer, mimeType); } catch {}
    return null;
}

async function viewonceCommand(sock, chatId, message, fakeCard) {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedImage = quoted?.imageMessage;
    const quotedVideo = quoted?.videoMessage;
    const voMsg2 = message.message?.viewOnceMessageV2?.message;
    const voMsg = message.message?.viewOnceMessage?.message;
    const imgMsg = quotedImage?.viewOnce ? quotedImage : (voMsg2?.imageMessage || voMsg?.imageMessage);
    const vidMsg = quotedVideo?.viewOnce ? quotedVideo : (voMsg2?.videoMessage || voMsg?.videoMessage);
    if (imgMsg) {
        const stream = await downloadContentFromMessage(imgMsg, 'image');
        let buffer = Buffer.from([]); for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        await sock.sendMessage(chatId, { image: buffer, caption: imgMsg.caption || '✨ Revealed image' }, { quoted: fakeCard });
    } else if (vidMsg) {
        const stream = await downloadContentFromMessage(vidMsg, 'video');
        let buffer = Buffer.from([]); for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        await sock.sendMessage(chatId, { video: buffer, caption: vidMsg.caption || '✨ Revealed video' }, { quoted: fakeCard });
    } else {
        await sock.sendMessage(chatId, { text: '⚠️ Please reply to a view-once image or video.' }, { quoted: message });
    }
}

function collectApiTargets() {
    const out = [], seen = new Set();
    const add = (label, url) => { if (typeof url === 'string' && /^https?:\/\//.test(url) && !seen.has(url)) { seen.add(url); out.push([label, url]); } };
    const walk = (obj, prefix) => {
        for (const [k, v] of Object.entries(obj || {})) {
            const label = `${prefix}.${k}`;
            if (typeof v === 'string') add(label, v);
            else if (typeof v === 'function') { try { const r = v('test', 'test'); if (Array.isArray(r)) r.forEach((u, i) => add(`${label}[${i}]`, u)); else add(label, r); } catch (_) {} }
            else if (v && typeof v === 'object') walk(v, label);
        }
    };
    walk(APIS, 'APIS');
    audioEndpoints.forEach((fn, i) => { try { add(`audioEndpoints[${i}]`, fn('https://youtu.be/dQw4w9WgXcQ')); } catch (_) {} });
    for (const [k, v] of Object.entries(config)) if (/_API$|_URL$|_BASE$/.test(k) && typeof v === 'string' && /^https?:\/\//.test(v)) add(`config.${k}`, v);
    return out;
}

module.exports = { LEAGUE_IDS, PAXSENIX, TelegraPh, UploadFileUgu, aioDownload, askGrok, collectApiTargets, downloadMovieFile, espnScoreboard, formatAudio, fromBuffer, generateImage, getCurrentDateTime, getLyrics, getUserLocation, isValidBuffer, localYtAudio, localYtVideo, mediafireDl, ossBuffer, paxMemes, paxQuotes, paxShazam, paxTempMailBody, paxTempMailCreate, paxTempMailInbox, paxVideoJob, queryAudioEndpoints, searchMovies, sendVoiceReply, showSubtitleOptions, sportsdbSearch, transcribeAudio, uploadAudioToCatbox, uploadSmartMedia, uploadToCatbox, uploadToTelegraph, viewonceCommand, webp2mp4File, ytDownloadMp4, ytGetInfo };
