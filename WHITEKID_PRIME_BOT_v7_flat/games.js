'use strict';
const { crypto } = require('./deps');

const WK = {
    quiz: new Map(), guess: new Map(), bj: new Map(), hm: new Map(),
    pick: a => a[Math.floor(Math.random() * a.length)],
    int: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
    hash: s => { let h = 2166136261; for (const c of String(s)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; },
    norm: s => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim(),
    shuffle: a => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; },
    bar: p => '█'.repeat(Math.round(p / 10)) + '░'.repeat(10 - Math.round(p / 10)),
    today: () => new Date().toISOString().slice(0, 10)
};

const WK_TRIVIA = [
    ['What is the capital of Zimbabwe?', ['Bulawayo', 'Harare', 'Mutare', 'Gweru'], 1],
    ['Which is the largest planet in our solar system?', ['Saturn', 'Earth', 'Jupiter', 'Neptune'], 2],
    ['How many continents are there?', ['5', '6', '7', '8'], 2],
    ['What is the chemical symbol for gold?', ['Ag', 'Au', 'Gd', 'Go'], 1],
    ['Who painted the Mona Lisa?', ['Picasso', 'Van Gogh', 'Leonardo da Vinci', 'Michelangelo'], 2],
    ['Which is the largest ocean?', ['Atlantic', 'Indian', 'Arctic', 'Pacific'], 3],
    ['What is the fastest land animal?', ['Lion', 'Cheetah', 'Horse', 'Leopard'], 1],
    ['Victoria Falls lies on which river?', ['Limpopo', 'Nile', 'Zambezi', 'Congo'], 2],
    ['What is the hardest natural substance?', ['Gold', 'Iron', 'Quartz', 'Diamond'], 3],
    ['How many players does one football (soccer) team have on the pitch?', ['9', '10', '11', '12'], 2],
    ['Which planet is known as the Red Planet?', ['Mars', 'Venus', 'Mercury', 'Jupiter'], 0],
    ['What is the number 2 in binary?', ['01', '10', '11', '100'], 1],
    ['Who wrote Romeo and Juliet?', ['Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Jane Austen'], 1],
    ['What is the capital of Japan?', ['Osaka', 'Kyoto', 'Tokyo', 'Seoul'], 2],
    ['What is H2O commonly known as?', ['Salt', 'Water', 'Oxygen', 'Hydrogen'], 1],
    ['What is the smallest prime number?', ['0', '1', '2', '3'], 2],
    ['In which year did Zimbabwe gain independence?', ['1960', '1975', '1980', '1990'], 2],
    ['Which mountain is the highest above sea level?', ['K2', 'Kilimanjaro', 'Mount Everest', 'Mont Blanc'], 2],
    ['Which language is built into every web browser?', ['Python', 'Java', 'C++', 'JavaScript'], 3],
    ['Which company created the Android operating system?', ['Google', 'Apple', 'Microsoft', 'Nokia'], 0],
    ['What is the currency of Japan?', ['Won', 'Yuan', 'Yen', 'Ringgit'], 2],
    ['How many strings does a standard guitar have?', ['4', '5', '6', '8'], 2],
    ['Which is the largest country by area?', ['Canada', 'China', 'USA', 'Russia'], 3],
    ['Which gas do plants absorb from the air?', ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Helium'], 1],
    ['WhatsApp is owned by which company?', ['Google', 'Meta', 'Amazon', 'Telegram'], 1]
];

const WK_WORDS = ['zimbabwe', 'whatsapp', 'elephant', 'computer', 'keyboard', 'javascript', 'football', 'telegram', 'mountain', 'chocolate', 'internet', 'android', 'database', 'universe', 'birthday', 'champion', 'lightning', 'butterfly', 'pyramid', 'dolphin', 'diamond', 'treasure', 'umbrella', 'dinosaur', 'galaxy', 'rainbow', 'notebook', 'bicycle', 'sunshine', 'adventure'];

const WK_HANG = ['harare', 'baobab', 'giraffe', 'hospital', 'language', 'internet', 'program', 'network', 'battery', 'monkey', 'guitar', 'cricket', 'penguin', 'volcano', 'library', 'pancake', 'tornado', 'whistle', 'blanket', 'rooster', 'sandwich', 'compass', 'lantern', 'popcorn', 'machine'];

const WK_FLAGS = [['🇿🇼', ['zimbabwe']], ['🇿🇦', ['south africa']], ['🇳🇬', ['nigeria']], ['🇰🇪', ['kenya']], ['🇬🇭', ['ghana']], ['🇪🇬', ['egypt']], ['🇧🇷', ['brazil']], ['🇫🇷', ['france']], ['🇩🇪', ['germany']], ['🇯🇵', ['japan']], ['🇮🇳', ['india']], ['🇨🇳', ['china']], ['🇺🇸', ['usa', 'united states', 'america', 'us']], ['🇬🇧', ['uk', 'united kingdom', 'britain', 'england']], ['🇨🇦', ['canada']], ['🇦🇺', ['australia']], ['🇮🇹', ['italy']], ['🇪🇸', ['spain']], ['🇲🇽', ['mexico']], ['🇧🇼', ['botswana']], ['🇿🇲', ['zambia']], ['🇹🇿', ['tanzania']], ['🇲🇿', ['mozambique']], ['🇦🇷', ['argentina']]];

const WK_CAPITALS = [['Zimbabwe', ['harare']], ['South Africa', ['pretoria']], ['Nigeria', ['abuja']], ['Kenya', ['nairobi']], ['Ghana', ['accra']], ['Egypt', ['cairo']], ['Brazil', ['brasilia']], ['France', ['paris']], ['Germany', ['berlin']], ['Japan', ['tokyo']], ['India', ['new delhi', 'delhi']], ['Canada', ['ottawa']], ['Australia', ['canberra']], ['Italy', ['rome']], ['Spain', ['madrid']], ['Zambia', ['lusaka']], ['Botswana', ['gaborone']], ['Tanzania', ['dodoma']], ['Ethiopia', ['addis ababa']], ['Morocco', ['rabat']], ['Mozambique', ['maputo']], ['Namibia', ['windhoek']]];

const WK_EMOJIQ = [['🦁👑', ['lion king', 'the lion king']], ['🕷️🧑', ['spiderman', 'spider man']], ['🚢🧊', ['titanic']], ['🦇👨', ['batman']], ['❄️👸', ['frozen']], ['🐠🔍', ['finding nemo']], ['🧙‍♂️💍', ['lord of the rings']], ['🦈🌊', ['jaws']], ['🏠🎈', ['up']], ['🤖❤️', ['wall e', 'walle']], ['⚽🏆', ['world cup']], ['🎂🎉', ['birthday']], ['☔🌧️', ['rain']], ['🌙⭐', ['night']], ['🍕🇮🇹', ['pizza']], ['📱🍎', ['iphone', 'apple']], ['🐍💻', ['python']], ['🔥🐉', ['dragon']], ['🏝️☀️', ['holiday', 'vacation', 'beach']], ['🎸🎤', ['rock star', 'rockstar', 'band']]];

const WK_WYR = ['Would you rather be able to fly or be invisible?', 'Would you rather have unlimited money or unlimited time?', 'Would you rather never use social media again or never watch a video again?', 'Would you rather always be 10 minutes late or always be 20 minutes early?', 'Would you rather speak every language or play every instrument?', 'Would you rather live in the past or in the future?', 'Would you rather have no phone for a year or no friends for a month?', 'Would you rather fight 1 horse-sized duck or 100 duck-sized horses?', 'Would you rather be famous or be rich and unknown?', 'Would you rather read minds or see the future?', 'Would you rather lose all your memories or never make new ones?', 'Would you rather eat only sadza or only rice for a year?', 'Would you rather have a rewind button or a pause button for your life?', 'Would you rather be the smartest or the funniest person in the room?', 'Would you rather always say what you think or never speak again?', 'Would you rather have free data forever or free airtime forever?', 'Would you rather be a superhero or a billionaire?', 'Would you rather explore space or the deep ocean?', 'Would you rather lose your phone or your wallet today?', 'Would you rather have a personal chef or a personal driver?'];

const WK_NHIE = ['Never have I ever stayed up all night chatting.', 'Never have I ever sent a message to the wrong person.', 'Never have I ever pretended to be asleep to avoid someone.', 'Never have I ever laughed so hard I cried in public.', 'Never have I ever forgotten someone’s name right after meeting them.', 'Never have I ever replied "lol" without actually laughing.', 'Never have I ever been left on read and panicked.', 'Never have I ever got lost in a place I know well.', 'Never have I ever talked to myself in the mirror.', 'Never have I ever eaten food that fell on the floor.', 'Never have I ever screenshotted a chat to show a friend.', 'Never have I ever walked into a glass door.', 'Never have I ever cried at a movie.', 'Never have I ever gone a full day without checking my phone.', 'Never have I ever sung loudly in the shower.'];

const WK_FORTUNES = ['A pleasant surprise is waiting for you.', 'Your hard work will soon pay off.', 'Someone is thinking of you right now.', 'A new opportunity arrives when you least expect it.', 'Patience today brings a big win tomorrow.', 'You will soon meet someone who changes your plans for the better.', 'Money comes to those who keep building.', 'Good news travels your way this week.', 'Trust your gut on the next big decision.', 'A small step today is a giant leap next month.', 'The answer you are looking for is closer than you think.', 'Your next idea will be your best one yet.'];

const WK_DADJOKES = ['I only know 25 letters of the alphabet. I don’t know y.', 'Why don’t eggs tell jokes? They’d crack each other up.', 'I used to hate facial hair, but then it grew on me.', 'What do you call a fake noodle? An impasta.', 'Why did the scarecrow win an award? He was outstanding in his field.', 'I’m reading a book about anti-gravity. It’s impossible to put down.', 'Why can’t you trust stairs? They’re always up to something.', 'What do you call cheese that isn’t yours? Nacho cheese.', 'Did you hear about the claustrophobic astronaut? He just needed a bit more space.', 'Why do bees have sticky hair? They use honeycombs.', 'I told my wife she was drawing her eyebrows too high. She looked surprised.', 'What do you call a bear with no teeth? A gummy bear.', 'How does a penguin build its house? Igloos it together.', 'Why did the bicycle fall over? It was two tired.', 'What’s brown and sticky? A stick.'];

const WK_PUNS = ['I used to be a banker, but I lost interest.', 'Time flies like an arrow. Fruit flies like a banana.', 'I’m on a seafood diet. I see food and I eat it.', 'The graveyard is so crowded people are dying to get in.', 'I wasn’t originally going to get a brain transplant, but then I changed my mind.', 'A bicycle can’t stand on its own because it is two tired.', 'I’d tell you a chemistry joke but I know I wouldn’t get a reaction.', 'Broken pencils are pointless.', 'I lost my job at the calendar factory for taking a couple of days off.', 'Don’t trust atoms. They make up everything.', 'Reading while sunbathing makes you well red.', 'I can’t believe I got fired from the calendar factory. All I did was take a day off.'];

const WK_COMPLIMENTS = ['You light up every chat you walk into.', 'Your energy makes hard days feel lighter.', 'You are way more capable than you give yourself credit for.', 'You have a great sense of humor.', 'Your ideas are seriously creative.', 'People are lucky to have you around.', 'You make being kind look easy.', 'Your work ethic is inspiring.', 'You have a smile that changes the room.', 'You handle pressure like a pro.', 'You are the kind of friend everyone needs.', 'Your confidence is contagious.'];

const WK_MOTIVATE = ['Start where you are. Use what you have. Do what you can.', 'Small progress is still progress.', 'Discipline beats motivation on the days motivation disappears.', 'You don’t have to be perfect — you have to be consistent.', 'Dream big, start small, act now.', 'Every expert was once a beginner.', 'Your only limit is the effort you refuse to give.', 'Do it tired. Do it scared. Just do it.', 'The best time to start was yesterday. The next best time is now.', 'Work in silence, let results make the noise.', 'Hard roads often lead to beautiful destinations.', 'Be stubborn about your goals and flexible about your methods.'];

const WK_AFFIRM = ['I am capable of achieving what I set my mind to.', 'I grow stronger with every challenge.', 'I choose progress over perfection.', 'I deserve good things and I am open to receiving them.', 'My effort matters and my future is bright.', 'I am calm, focused and in control.', 'I learn from mistakes and keep moving forward.', 'I am building the life I want, one day at a time.'];

const WK_SHOWER = ['Your future self is watching you right now through memories.', 'Every “new” idea is just old ideas wearing a different outfit.', 'The word “bed” actually looks like a bed.', 'Nobody has ever seen their own face without a screen or a mirror.', 'You never remember the last time you fell asleep.', 'We call it “rush hour” even though nobody is moving.', 'Somewhere out there is the exact middle of nowhere.', 'Passwords are the only secrets we all keep and forget.', 'If you clean a vacuum cleaner, you become a vacuum cleaner.', 'Your phone has more computing power than the machines that reached the moon.', 'The first person to milk a cow was a very brave person.', 'Every time you blink, the world goes dark and you never notice.'];

const WK_TWISTERS = ['She sells seashells by the seashore.', 'Peter Piper picked a peck of pickled peppers.', 'How much wood would a woodchuck chuck if a woodchuck could chuck wood?', 'Red lorry, yellow lorry.', 'Fuzzy Wuzzy was a bear. Fuzzy Wuzzy had no hair.', 'A proper copper coffee pot.', 'Betty Botter bought some butter but she said the butter’s bitter.', 'Unique New York, you know you need unique New York.'];

const WK_TOPICS = ['What’s the best meal you’ve ever had?', 'If you could live anywhere, where would it be?', 'What skill would you master instantly if you could?', 'What was the last thing that made you laugh out loud?', 'What’s your most useless talent?', 'If you could have dinner with anyone, who would it be?', 'What’s a small thing that always makes your day better?', 'What’s the best advice you’ve ever received?', 'What song is stuck in your head right now?', 'What’s a hobby you’d love to try?', 'What would your superpower be?', 'What’s the best trip you’ve ever taken?', 'What’s one thing you want to achieve this year?', 'Which app could you not live without?', 'What is the most underrated movie you know?'];

const WK_SIGNS = [['capricorn', '♑', 12, 22, 1, 19], ['aquarius', '♒', 1, 20, 2, 18], ['pisces', '♓', 2, 19, 3, 20], ['aries', '♈', 3, 21, 4, 19], ['taurus', '♉', 4, 20, 5, 20], ['gemini', '♊', 5, 21, 6, 20], ['cancer', '♋', 6, 21, 7, 22], ['leo', '♌', 7, 23, 8, 22], ['virgo', '♍', 8, 23, 9, 22], ['libra', '♎', 9, 23, 10, 22], ['scorpio', '♏', 10, 23, 11, 21], ['sagittarius', '♐', 11, 22, 12, 21]];

const WK_HORO_LINES = ['Good energy surrounds your plans today.', 'A conversation clears up something that has been bothering you.', 'Take the chance you have been hesitating on.', 'Money matters improve if you stay patient.', 'Someone close needs your support — be generous with your time.', 'A creative idea turns out better than expected.', 'Slow down today; the answer comes when you stop rushing.', 'Work gets easier once you finish the one thing you keep avoiding.', 'Expect good news before the day ends.', 'Rest is productive today — do not feel guilty for it.'];

const WK_MORSE = { a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....', i: '..', j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.', q: '--.-', r: '.-.', s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', '/': '-..-.', '@': '.--.-.' };

const WK_MORSE_REV = Object.fromEntries(Object.entries(WK_MORSE).map(([k, v]) => [v, k]));

const WK_FLIP = { a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z', '?': '¿', '!': '¡', '.': '˙', ',': '\'', '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '_': '‾', '&': '⅋', '\'': ',' };

const WK_LEET = { a: '4', e: '3', i: '1', o: '0', s: '5', t: '7', b: '8', g: '9', l: '1' };

const WK_BJ_SUITS = ['♠', '♥', '♦', '♣'], WK_BJ_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function wkQuoted(msg) {
    try {
        const c = msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        return c?.conversation || c?.extendedTextMessage?.text || c?.imageMessage?.caption || c?.videoMessage?.caption || '';
    } catch { return ''; }
}

function wkMentions(msg) { try { return msg?.message?.extendedTextMessage?.contextInfo?.mentionedJid || []; } catch { return []; } }

function wkScramble(w) { let s = w; for (let i = 0; i < 12 && s === w; i++) s = WK.shuffle(w.split('')).join(''); return s; }

function wkBjDeck() { const d = []; for (const s of WK_BJ_SUITS) for (const r of WK_BJ_RANKS) d.push(r + s); return WK.shuffle(d); }

function wkBjValue(hand) { let t = 0, aces = 0; for (const c of hand) { const r = c.slice(0, -1); if (r === 'A') { aces++; t += 11; } else if (r === 'J' || r === 'Q' || r === 'K') t += 10; else t += parseInt(r, 10); } while (t > 21 && aces > 0) { t -= 10; aces--; } return t; }

function wkHangView(g) { return g.word.split('').map(c => g.guessed.has(c) ? c : '_').join(' '); }

function wkSetQuiz(chat, quiz) { WK.quiz.set(chat, { ...quiz, expires: Date.now() + 90000 }); }

function wkParseDate(s) {
    s = String(s || '').trim(); let m;
    if ((m = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/))) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    if ((m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/))) return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));
    return null;
}

function wkSignOf(day, month) {
    for (const [name, icon, m1, d1, m2, d2] of WK_SIGNS) { if ((month === m1 && day >= d1) || (month === m2 && day <= d2)) return { name, icon }; }
    return { name: 'capricorn', icon: '♑' };
}

async function wkRaw(socket, from, text, quoted) { try { await socket.sendMessage(from, { text }, quoted ? { quoted } : undefined); } catch (e) { console.error('[WK RAW]', e.message); } }

async function wkRun(cmd, ctx) {
    const { socket, from, msg, q, args, reply, react, activePrefix: p, nowsender, senderName, isGroup } = ctx;
    const raw = t => wkRaw(socket, from, t, ctx.fakeCard);
    const me = nowsender;
    const textIn = q || wkQuoted(msg);
    const chatKey = from, userKey = `${from}:${me}`;

    switch (cmd) {
        // ───────────────────────── GAMES ─────────────────────────
        case 'dice': {
            await react('🎲');
            const m = (args[0] || '').toLowerCase().match(/^(\d{1,2})?d?(\d{1,4})?$/);
            let n = 1, sides = 6;
            if (m && args[0]) { if (args[0].toLowerCase().includes('d')) { n = parseInt(m[1] || '1', 10); sides = parseInt(m[2] || '6', 10); } else sides = parseInt(args[0], 10); }
            n = Math.min(Math.max(n || 1, 1), 10); sides = Math.min(Math.max(sides || 6, 2), 1000);
            const rolls = Array.from({ length: n }, () => WK.int(1, sides));
            return reply(`🎲 DICE ROLL\n\n${n}d${sides} → ${rolls.join(' + ')}${n > 1 ? `\nTotal: ${rolls.reduce((a, b) => a + b, 0)}` : ''}`);
        }
        case 'coinflip': case 'flip': {
            await react('🪙');
            return reply(`🪙 COIN FLIP\n\n${Math.random() < 0.5 ? '🟡 HEADS' : '⚪ TAILS'}`);
        }
        case 'rps': {
            const opts = ['rock', 'paper', 'scissors'], icons = { rock: '🪨', paper: '📄', scissors: '✂️' };
            const alias = { r: 'rock', p: 'paper', s: 'scissors' };
            const mine = alias[(args[0] || '').toLowerCase()] || (args[0] || '').toLowerCase();
            if (!opts.includes(mine)) return reply(`✊ ROCK PAPER SCISSORS\n\nUsage: ${p}rps rock | paper | scissors`);
            const bot = WK.pick(opts);
            const win = mine === bot ? 'draw' : ((mine === 'rock' && bot === 'scissors') || (mine === 'paper' && bot === 'rock') || (mine === 'scissors' && bot === 'paper')) ? 'you' : 'bot';
            return reply(`✊ ROCK PAPER SCISSORS\n\nYou: ${icons[mine]} ${mine}\nBot: ${icons[bot]} ${bot}\n\n${win === 'draw' ? '🤝 Draw!' : win === 'you' ? '🎉 You win!' : '😎 I win!'}`);
        }
        case 'slots': {
            await react('🎰');
            const sym = ['🍒', '🍋', '🍉', '⭐', '💎', '7️⃣'];
            const r = [WK.pick(sym), WK.pick(sym), WK.pick(sym)];
            const uniq = new Set(r).size;
            return reply(`🎰 SLOT MACHINE\n\n[ ${r.join(' | ')} ]\n\n${uniq === 1 ? '💥 JACKPOT! Three of a kind!' : uniq === 2 ? '✨ Nice! Two matched.' : '😅 No match. Try again!'}`);
        }
        case 'guess': {
            let g = WK.guess.get(userKey);
            const n = parseInt(args[0], 10);
            if (!g || Date.now() > g.expires || args[0]?.toLowerCase() === 'new') {
                g = { num: WK.int(1, 100), tries: 0, expires: Date.now() + 300000 }; WK.guess.set(userKey, g);
                if (isNaN(n)) return reply(`🔢 GUESS THE NUMBER\n\nI picked a number from 1 to 100.\nYou have 7 tries.\nUse ${p}guess <number>`);
            }
            if (isNaN(n)) return reply(`🔢 GUESS THE NUMBER\n\nTries used: ${g.tries}/7\nUse ${p}guess <number>`);
            g.tries++;
            if (n === g.num) { WK.guess.delete(userKey); return reply(`🎉 CORRECT!\n\n${senderName} got ${g.num} in ${g.tries} ${g.tries === 1 ? 'try' : 'tries'}!`); }
            if (g.tries >= 7) { WK.guess.delete(userKey); return reply(`💀 GAME OVER\n\nThe number was ${g.num}. Send ${p}guess to play again.`); }
            return reply(`🔢 ${n < g.num ? '⬆️ Higher!' : '⬇️ Lower!'}\n\nTries: ${g.tries}/7`);
        }
        case 'trivia': {
            const [qq, opts, ci] = WK.pick(WK_TRIVIA); const L = ['A', 'B', 'C', 'D'];
            wkSetQuiz(chatKey, { type: 'trivia', answers: [L[ci].toLowerCase(), WK.norm(opts[ci])], show: `${L[ci]}. ${opts[ci]}` });
            return reply(`🧠 TRIVIA\n\n${qq}\n\n${opts.map((o, i) => `${L[i]}. ${o}`).join('\n')}\n\n⏳ 90s — reply with ${p}answer <A-D>`);
        }
        case 'scramble': {
            const w = WK.pick(WK_WORDS);
            wkSetQuiz(chatKey, { type: 'scramble', answers: [w], show: w });
            return reply(`🔤 WORD SCRAMBLE\n\nUnscramble: ${wkScramble(w).toUpperCase()}\nHint: starts with "${w[0].toUpperCase()}", ${w.length} letters\n\n⏳ 90s — ${p}answer <word>`);
        }
        case 'mathquiz': {
            let a = WK.int(2, 50), b = WK.int(2, 30); const op = WK.pick(['+', '-', '×']);
            if (op === '-' && a < b) [a, b] = [b, a];
            const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
            wkSetQuiz(chatKey, { type: 'math', answers: [String(ans)], show: String(ans) });
            return reply(`➗ MATH QUIZ\n\n${a} ${op} ${b} = ?\n\n⏳ 90s — ${p}answer <number>`);
        }
        case 'emojiquiz': {
            const [e, a] = WK.pick(WK_EMOJIQ);
            wkSetQuiz(chatKey, { type: 'emoji', answers: a.map(WK.norm), show: a[0] });
            return reply(`😎 EMOJI QUIZ\n\nGuess it: ${e}\n\n⏳ 90s — ${p}answer <guess>`);
        }
        case 'flagquiz': {
            const [f, a] = WK.pick(WK_FLAGS);
            wkSetQuiz(chatKey, { type: 'flag', answers: a.map(WK.norm), show: a[0] });
            return reply(`🏳️ FLAG QUIZ\n\nWhich country is this? ${f}\n\n⏳ 90s — ${p}answer <country>`);
        }
        case 'capitalquiz': {
            const [c, a] = WK.pick(WK_CAPITALS);
            wkSetQuiz(chatKey, { type: 'capital', answers: a.map(WK.norm), show: a[0] });
            return reply(`🌍 CAPITAL QUIZ\n\nWhat is the capital of ${c}?\n\n⏳ 90s — ${p}answer <city>`);
        }
        case 'answer': {
            const qz = WK.quiz.get(chatKey);
            if (!qz) return reply(`❓ No active quiz here.\n\nStart one: ${p}trivia | ${p}scramble | ${p}mathquiz | ${p}emojiquiz | ${p}flagquiz | ${p}capitalquiz`);
            if (Date.now() > qz.expires) { WK.quiz.delete(chatKey); return reply(`⌛ Time's up!\n\nThe answer was: ${qz.show}`); }
            if (!q) return reply(`Usage: ${p}answer <your answer>`);
            if (qz.answers.includes(WK.norm(q))) { WK.quiz.delete(chatKey); return reply(`🎉 CORRECT!\n\n@${me.split('@')[0]} got it: ${qz.show}`, [me]); }
            return reply(`❌ Nope, try again!`);
        }
        case 'hangman': {
            let g = WK.hm.get(chatKey);
            if (g && Date.now() < g.expires) return reply(`🪢 HANGMAN\n\n${wkHangView(g)}\n\n❤️ Lives: ${6 - g.wrong}/6\nWrong: ${[...g.bad].join(' ') || '-'}\nGuess with ${p}hm <letter>`);
            g = { word: WK.pick(WK_HANG), guessed: new Set(), bad: new Set(), wrong: 0, expires: Date.now() + 600000 }; WK.hm.set(chatKey, g);
            return reply(`🪢 HANGMAN\n\n${wkHangView(g)}\n\n${g.word.length} letters • ❤️ 6 lives\nGuess with ${p}hm <letter>`);
        }
        case 'hm': {
            const g = WK.hm.get(chatKey);
            if (!g || Date.now() > g.expires) return reply(`No active game. Start with ${p}hangman`);
            const t = (args[0] || '').toLowerCase();
            if (!t) return reply(`Usage: ${p}hm <letter>`);
            if (t.length > 1) {
                if (t === g.word) { WK.hm.delete(chatKey); return reply(`🎉 YOU WIN!\n\nThe word was ${g.word.toUpperCase()}`); }
                g.wrong++;
            } else {
                if (!/[a-z]/.test(t)) return reply('Send a single letter a-z.');
                if (g.guessed.has(t) || g.bad.has(t)) return reply(`You already tried "${t}".`);
                if (g.word.includes(t)) g.guessed.add(t); else { g.bad.add(t); g.wrong++; }
            }
            if (g.word.split('').every(c => g.guessed.has(c))) { WK.hm.delete(chatKey); return reply(`🎉 YOU WIN!\n\nThe word was ${g.word.toUpperCase()}`); }
            if (g.wrong >= 6) { WK.hm.delete(chatKey); return reply(`💀 GAME OVER\n\nThe word was ${g.word.toUpperCase()}`); }
            return reply(`🪢 HANGMAN\n\n${wkHangView(g)}\n\n❤️ Lives: ${6 - g.wrong}/6\nWrong: ${[...g.bad].join(' ') || '-'}`);
        }
        case 'roulette': {
            await react('🔫');
            const chamber = WK.int(1, 6);
            return reply(`🔫 RUSSIAN ROULETTE\n\n${chamber === 1 ? '💥 BANG! You lost this round.' : '😮‍💨 *click* — you survived!'}\n\n(just a game — nobody gets hurt)`);
        }
        case 'lottery': {
            const nums = WK.shuffle(Array.from({ length: 49 }, (_, i) => i + 1)).slice(0, 6).sort((a, b) => a - b);
            return reply(`🎟️ LUCKY LOTTERY\n\nYour numbers: ${nums.join(' - ')}\nBonus: ${WK.int(1, 49)}\n\nGood luck! 🍀`);
        }
        case 'wyr': return reply(`🤔 WOULD YOU RATHER\n\n${WK.pick(WK_WYR)}`);
        case 'nhie': return reply(`🙈 NEVER HAVE I EVER\n\n${WK.pick(WK_NHIE)}`);
        case 'rate': {
            if (!textIn) return reply(`Usage: ${p}rate <anything>`);
            const s = WK.hash(WK.norm(textIn)) % 101;
            return reply(`⭐ RATING\n\n${textIn}\n${WK.bar(s)} ${s}/100\n\n${s > 85 ? '🔥 Legendary!' : s > 60 ? '👍 Pretty good' : s > 35 ? '😐 Average' : '💀 Rough'}`);
        }
        case 'ship': {
            const mj = wkMentions(msg);
            let a, b;
            if (mj.length >= 2) { a = '@' + mj[0].split('@')[0]; b = '@' + mj[1].split('@')[0]; }
            else if (mj.length === 1) { a = senderName; b = '@' + mj[0].split('@')[0]; }
            else { const parts = q.split(/\s*(?:\+|&|x|and|,)\s*/i).filter(Boolean); if (parts.length < 2) return reply(`💘 SHIP\n\nUsage: ${p}ship name1 + name2\nor tag two people`); a = parts[0]; b = parts[1]; }
            const pct = WK.hash([a, b].map(WK.norm).sort().join('|')) % 101;
            return reply(`💘 LOVE METER\n\n${a} ❤️ ${b}\n${WK.bar(pct)} ${pct}%\n\n${pct > 80 ? '💍 Soulmates!' : pct > 55 ? '😍 Great match' : pct > 30 ? '🤷 Could work' : '💔 Just friends'}`, mj);
        }
        case 'iqtest': {
            const iq = 70 + (WK.hash(me + WK.today()) % 91);
            return reply(`🧠 IQ TEST (for fun)\n\n${senderName}\nScore: ${iq}\n${iq > 140 ? '🧬 Genius level!' : iq > 115 ? '🎓 Above average' : iq > 90 ? '🙂 Average' : '😴 Needs coffee'}\n\nResult resets daily — it is just a joke!`);
        }
        case 'fortune': return reply(`🥠 FORTUNE COOKIE\n\n${WK.pick(WK_FORTUNES)}\n\nLucky numbers: ${WK.shuffle(Array.from({ length: 49 }, (_, i) => i + 1)).slice(0, 5).join(', ')}`);
        case 'horoscope': {
            const sg = (args[0] || '').toLowerCase(); const found = WK_SIGNS.find(s => s[0] === sg);
            if (!found) return reply(`🔮 HOROSCOPE\n\nUsage: ${p}horoscope <sign>\nSigns: ${WK_SIGNS.map(s => s[0]).join(', ')}`);
            const h = WK.hash(sg + WK.today());
            const colors = ['red', 'blue', 'green', 'gold', 'purple', 'white', 'orange', 'pink'];
            return reply(`🔮 ${found[0].toUpperCase()} ${found[1]}\n\n${WK_HORO_LINES[h % WK_HORO_LINES.length]}\nLucky number: ${(h % 99) + 1}\nLucky color: ${colors[(h >>> 3) % colors.length]}\nMood: ${['💪 Strong', '😊 Happy', '🧘 Calm', '🔥 Bold', '🌙 Dreamy'][(h >>> 5) % 5]}\n\nFor entertainment only.`);
        }
        case 'luckynumber': return reply(`🍀 LUCKY NUMBERS\n\n${Array.from({ length: 5 }, () => WK.int(1, 99)).join(' • ')}`);
        case 'choose': {
            const opts = q.split(/\s*(?:\||,|\bor\b)\s*/i).map(s => s.trim()).filter(Boolean);
            if (opts.length < 2) return reply(`Usage: ${p}choose pizza | burger | sadza`);
            return reply(`🎯 I CHOOSE\n\n👉 ${WK.pick(opts)}`);
        }
        case 'who': {
            if (!isGroup) return reply('⚠️ This command only works in groups.');
            try {
                const meta = await socket.groupMetadata(from);
                const pick = WK.pick(meta.participants).id;
                return reply(`🎯 RANDOM PICK\n\n@${pick.split('@')[0]} ${q || 'is the chosen one'}`, [pick]);
            } catch (e) { return reply(`⚠️ ${e.message}`); }
        }
        case 'blackjack': {
            const ex = WK.bj.get(userKey);
            if (ex && Date.now() < ex.expires) return reply(`🃏 BLACKJACK (in progress)\n\nYou: ${ex.player.join(' ')} = ${wkBjValue(ex.player)}\nDealer: ${ex.dealer[0]} ??\n\n${p}hit or ${p}stand`);
            const deck = wkBjDeck(); const g = { deck, player: [deck.pop(), deck.pop()], dealer: [deck.pop(), deck.pop()], expires: Date.now() + 300000 };
            if (wkBjValue(g.player) === 21) {
                const dv = wkBjValue(g.dealer);
                return reply(`🃏 BLACKJACK!\n\nYou: ${g.player.join(' ')} = 21\nDealer: ${g.dealer.join(' ')} = ${dv}\n\n${dv === 21 ? '🤝 Push (both 21)' : '🎉 You win!'}`);
            }
            WK.bj.set(userKey, g);
            return reply(`🃏 BLACKJACK\n\nYou: ${g.player.join(' ')} = ${wkBjValue(g.player)}\nDealer: ${g.dealer[0]} ??\n\n${p}hit to draw • ${p}stand to hold`);
        }
        case 'hit': {
            const g = WK.bj.get(userKey);
            if (!g || Date.now() > g.expires) return reply(`No blackjack game. Start with ${p}blackjack`);
            g.player.push(g.deck.pop()); const v = wkBjValue(g.player);
            if (v > 21) { WK.bj.delete(userKey); return reply(`💥 BUST!\n\nYou: ${g.player.join(' ')} = ${v}\nDealer wins.`); }
            if (v === 21) return wkRun('stand', ctx);
            return reply(`🃏 BLACKJACK\n\nYou: ${g.player.join(' ')} = ${v}\nDealer: ${g.dealer[0]} ??\n\n${p}hit or ${p}stand`);
        }
        case 'stand': {
            const g = WK.bj.get(userKey);
            if (!g || Date.now() > g.expires) return reply(`No blackjack game. Start with ${p}blackjack`);
            while (wkBjValue(g.dealer) < 17) g.dealer.push(g.deck.pop());
            const pv = wkBjValue(g.player), dv = wkBjValue(g.dealer); WK.bj.delete(userKey);
            const res = dv > 21 ? '🎉 Dealer busts — you win!' : pv > dv ? '🎉 You win!' : pv === dv ? '🤝 Push (tie)' : '😎 Dealer wins.';
            return reply(`🃏 BLACKJACK RESULT\n\nYou: ${g.player.join(' ')} = ${pv}\nDealer: ${g.dealer.join(' ')} = ${dv}\n\n${res}`);
        }

        // ───────────────────────── TEXT FUN ─────────────────────────
        case 'reverse': return textIn ? raw([...textIn].reverse().join('')) : reply(`Usage: ${p}reverse <text>`);
        case 'mock': return textIn ? raw([...textIn].map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join('')) : reply(`Usage: ${p}mock <text>`);
        case 'clap': return textIn ? raw(textIn.split(/\s+/).join(' 👏 ') + ' 👏') : reply(`Usage: ${p}clap <text>`);
        case 'bubble': {
            if (!textIn) return reply(`Usage: ${p}bubble <text>`);
            return raw([...textIn].map(c => { const k = c.charCodeAt(0); if (k >= 97 && k <= 122) return String.fromCodePoint(0x24D0 + k - 97); if (k >= 65 && k <= 90) return String.fromCodePoint(0x24B6 + k - 65); if (k >= 49 && k <= 57) return String.fromCodePoint(0x2460 + k - 49); if (k === 48) return '⓪'; return c; }).join(''));
        }
        case 'uwu': return textIn ? raw(textIn.replace(/[rl]/g, 'w').replace(/[RL]/g, 'W').replace(/n([aeiou])/g, 'ny$1').replace(/N([aeiou])/g, 'Ny$1') + ' uwu') : reply(`Usage: ${p}uwu <text>`);
        case 'vaporwave': return textIn ? raw([...textIn].map(c => { const k = c.charCodeAt(0); return k === 32 ? '\u3000' : (k >= 33 && k <= 126) ? String.fromCharCode(k + 0xFEE0) : c; }).join('')) : reply(`Usage: ${p}vaporwave <text>`);
        case 'upsidedown': return textIn ? raw([...textIn.toLowerCase()].map(c => WK_FLIP[c] || c).reverse().join('')) : reply(`Usage: ${p}upsidedown <text>`);
        case 'leet': return textIn ? raw([...textIn].map(c => WK_LEET[c.toLowerCase()] || c).join('')) : reply(`Usage: ${p}leet <text>`);
        case 'rot13': return textIn ? raw(textIn.replace(/[a-z]/gi, c => { const b = c <= 'Z' ? 65 : 97; return String.fromCharCode((c.charCodeAt(0) - b + 13) % 26 + b); })) : reply(`Usage: ${p}rot13 <text>`);
        case 'morse': {
            if (!textIn) return reply(`Usage: ${p}morse <text>\nDecode: ${p}morse decode .... .. (use / between words)`);
            if (/^decode\b/i.test(textIn)) return raw(textIn.replace(/^decode\s*/i, '').trim().split(/\s*\/\s*/).map(w => w.split(/\s+/).map(c => WK_MORSE_REV[c] || '?').join('')).join(' '));
            return raw(textIn.toLowerCase().split(/\s+/).map(w => [...w].map(c => WK_MORSE[c] || '').filter(Boolean).join(' ')).join(' / '));
        }
        case 'binary': {
            if (!textIn) return reply(`Usage: ${p}binary <text>\nDecode: ${p}binary decode 01001000 01101001`);
            if (/^decode\b/i.test(textIn)) { const bits = textIn.replace(/^decode\s*/i, '').replace(/[^01]/g, ''); if (!bits || bits.length % 8) return reply('⚠️ Binary must be groups of 8 bits.'); return raw(Buffer.from(bits.match(/.{8}/g).map(b => parseInt(b, 2))).toString('utf8')); }
            return raw([...Buffer.from(textIn, 'utf8')].map(b => b.toString(2).padStart(8, '0')).join(' '));
        }
        case 'hex': {
            if (!textIn) return reply(`Usage: ${p}hex <text>\nDecode: ${p}hex decode 48656c6c6f`);
            if (/^decode\b/i.test(textIn)) { const h = textIn.replace(/^decode\s*/i, '').replace(/[^0-9a-f]/gi, ''); if (!h || h.length % 2) return reply('⚠️ Invalid hex string.'); return raw(Buffer.from(h, 'hex').toString('utf8')); }
            return raw(Buffer.from(textIn, 'utf8').toString('hex'));
        }
        case 'repeat': {
            const n = Math.min(Math.max(parseInt(args[0], 10) || 0, 0), 20); const t = args.slice(1).join(' ');
            if (!n || !t) return reply(`Usage: ${p}repeat <1-20> <text>`);
            return raw(Array(n).fill(t).join('\n').slice(0, 3000));
        }
        case 'count': {
            if (!textIn) return reply(`Usage: ${p}count <text> (or reply to a message)`);
            return reply(`🔢 TEXT COUNT\n\nCharacters: ${[...textIn].length}\nWithout spaces: ${textIn.replace(/\s/g, '').length}\nWords: ${textIn.trim().split(/\s+/).length}\nLines: ${textIn.split('\n').length}`);
        }
        case 'shuffle': return textIn ? raw(WK.shuffle(textIn.split(/\s+/)).join(' ')) : reply(`Usage: ${p}shuffle <words>`);
        case 'palindrome': {
            if (!textIn) return reply(`Usage: ${p}palindrome <text>`);
            const n = WK.norm(textIn).replace(/ /g, ''); const ok = n.length > 0 && n === [...n].reverse().join('');
            return reply(`🔁 PALINDROME CHECK\n\n"${textIn}"\n${ok ? '✅ Yes, it is a palindrome!' : '❌ No, it is not a palindrome.'}`);
        }
        case 'roman': {
            const n = parseInt(args[0], 10);
            if (!n || n < 1 || n > 3999) return reply(`Usage: ${p}roman <1-3999>`);
            let r = '', x = n; for (const [v, s] of [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]) while (x >= v) { r += s; x -= v; }
            return reply(`🏛️ ROMAN NUMERAL\n\n${n} → ${r}`);
        }
        case 'lorem': {
            const w = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat'.split(' ');
            const n = Math.min(Math.max(parseInt(args[0], 10) || 30, 5), 150);
            const out = Array.from({ length: n }, () => WK.pick(w)).join(' '); return raw(out.charAt(0).toUpperCase() + out.slice(1) + '.');
        }

        // ───────────────────────── UTILITIES ─────────────────────────
        case 'password': {
            const len = Math.min(Math.max(parseInt(args[0], 10) || 16, 8), 64);
            const set = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*?';
            const pw = Array.from({ length: len }, () => set[crypto.randomInt(0, set.length)]).join('');
            await reply(`🔑 PASSWORD (${len} chars)\n\nCopy it below and delete this chat after saving it somewhere safe.`);
            return raw(pw);
        }
        case 'randcolor': {
            const h = WK.int(0, 0xFFFFFF), r = (h >> 16) & 255, g = (h >> 8) & 255, b = h & 255;
            return reply(`🎨 RANDOM COLOR\n\nHEX: #${h.toString(16).padStart(6, '0').toUpperCase()}\nRGB: ${r}, ${g}, ${b}`);
        }
        case 'uuid': return raw(crypto.randomUUID());
        case 'timestamp': {
            const d = new Date();
            return reply(`🕒 TIMESTAMP\n\nUnix: ${Math.floor(d.getTime() / 1000)}\nUTC: ${d.toISOString()}\nHarare: ${d.toLocaleString('en-GB', { timeZone: 'Africa/Harare', hour12: false })}`);
        }
        case 'age': {
            const d = wkParseDate(args[0]); const now = new Date();
            if (!d || d > now) return reply(`🎂 AGE CALCULATOR\n\nUsage: ${p}age 2000-05-14\nor ${p}age 14/05/2000`);
            let y = now.getUTCFullYear() - d.getUTCFullYear(), m = now.getUTCMonth() - d.getUTCMonth(), dd = now.getUTCDate() - d.getUTCDate();
            if (dd < 0) { m--; dd += new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)).getUTCDate(); }
            if (m < 0) { y--; m += 12; }
            let next = new Date(Date.UTC(now.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); if (next <= now) next = new Date(Date.UTC(now.getUTCFullYear() + 1, d.getUTCMonth(), d.getUTCDate()));
            return reply(`🎂 AGE\n\n${y} years, ${m} months, ${dd} days\nTotal days: ${Math.floor((now - d) / 86400000)}\nNext birthday in: ${Math.ceil((next - now) / 86400000)} days`);
        }
        case 'bmi': {
            const kg = parseFloat(args[0]), cm = parseFloat(args[1]);
            if (!kg || !cm || kg <= 0 || cm <= 0) return reply(`⚖️ BMI\n\nUsage: ${p}bmi <kg> <cm>\nExample: ${p}bmi 70 175`);
            const v = kg / Math.pow(cm / 100, 2);
            return reply(`⚖️ BMI\n\nYour BMI: ${v.toFixed(1)}\nCategory: ${v < 18.5 ? 'Underweight' : v < 25 ? 'Normal' : v < 30 ? 'Overweight' : 'Obese'}\n\nGeneral guide only — not medical advice.`);
        }
        case 'tip': {
            const bill = parseFloat(args[0]), pc = parseFloat(args[1] ?? 10), ppl = parseInt(args[2], 10) || 1;
            if (isNaN(bill) || isNaN(pc)) return reply(`💵 TIP CALCULATOR\n\nUsage: ${p}tip <bill> [percent] [people]\nExample: ${p}tip 50 15 2`);
            const tip = bill * pc / 100, total = bill + tip;
            return reply(`💵 TIP\n\nBill: ${bill.toFixed(2)}\nTip (${pc}%): ${tip.toFixed(2)}\nTotal: ${total.toFixed(2)}${ppl > 1 ? `\nPer person (${ppl}): ${(total / ppl).toFixed(2)}` : ''}`);
        }
        case 'discount': {
            const price = parseFloat(args[0]), off = parseFloat(args[1]);
            if (isNaN(price) || isNaN(off)) return reply(`🏷️ DISCOUNT\n\nUsage: ${p}discount <price> <percent>`);
            return reply(`🏷️ DISCOUNT\n\nPrice: ${price.toFixed(2)}\nOff: ${off}%\nYou save: ${(price * off / 100).toFixed(2)}\nFinal: ${(price - price * off / 100).toFixed(2)}`);
        }
        case 'percent': {
            const a = parseFloat(args[0]), b = parseFloat(args[1]);
            if (isNaN(a) || isNaN(b)) return reply(`➗ PERCENT\n\nUsage: ${p}percent <part> <total>\nExample: ${p}percent 25 200`);
            return reply(`➗ PERCENT\n\n${a} of ${b} = ${b ? ((a / b) * 100).toFixed(2) : '∞'}%\n${a}% of ${b} = ${(a * b / 100).toFixed(2)}`);
        }
        case 'daysleft': {
            const d = wkParseDate(args[0]);
            if (!d) return reply(`⏳ COUNTDOWN\n\nUsage: ${p}daysleft 2027-01-01`);
            const diff = Math.ceil((d - new Date()) / 86400000);
            return reply(`⏳ COUNTDOWN\n\n${diff > 0 ? `${diff} day(s) left until ${args[0]}` : diff === 0 ? 'That is today!' : `${-diff} day(s) have passed since ${args[0]}`}`);
        }
        case 'zodiac': {
            const m = String(args[0] || '').match(/^(\d{1,2})[\/\-.](\d{1,2})$/);
            if (!m || +m[1] < 1 || +m[1] > 31 || +m[2] < 1 || +m[2] > 12) return reply(`♈ ZODIAC\n\nUsage: ${p}zodiac <day>/<month>\nExample: ${p}zodiac 14/05`);
            const s = wkSignOf(+m[1], +m[2]); return reply(`${s.icon} ZODIAC\n\nBorn ${args[0]} → ${s.name.toUpperCase()}`);
        }
        case 'worldtime': {
            const zones = args[0] ? [args[0]] : ['Africa/Harare', 'Africa/Lagos', 'Africa/Nairobi', 'Europe/London', 'America/New_York', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney'];
            const lines = [];
            for (const z of zones) { try { lines.push(`${z.split('/').pop().replace(/_/g, ' ')}: ${new Date().toLocaleString('en-GB', { timeZone: z, hour12: false, weekday: 'short', hour: '2-digit', minute: '2-digit' })}`); } catch { return reply(`⚠️ Unknown timezone "${z}". Use format like Europe/Paris`); } }
            return reply(`🌐 WORLD TIME\n\n${lines.join('\n')}`);
        }

        // ───────────────────────── RANDOM BANKS ─────────────────────────
        case 'dadjoke': return reply(`👨 DAD JOKE\n\n${WK.pick(WK_DADJOKES)}`);
        case 'pun': return reply(`😏 PUN\n\n${WK.pick(WK_PUNS)}`);
        case 'compliment': return reply(`💐 COMPLIMENT\n\n${q ? q + ', ' : ''}${WK.pick(WK_COMPLIMENTS)}`);
        case 'motivate': return reply(`💪 MOTIVATION\n\n${WK.pick(WK_MOTIVATE)}`);
        case 'affirm': return reply(`🌱 AFFIRMATION\n\n${WK.pick(WK_AFFIRM)}`);
        case 'showerthought': return reply(`🚿 SHOWER THOUGHT\n\n${WK.pick(WK_SHOWER)}`);
        case 'twister': return reply(`👅 TONGUE TWISTER\n\n${WK.pick(WK_TWISTERS)}\n\nSay it 3 times fast!`);
        case 'topic': return reply(`💬 CONVERSATION STARTER\n\n${WK.pick(WK_TOPICS)}`);
    }
    return false;
}

module.exports = { wkQuoted, wkRun };
