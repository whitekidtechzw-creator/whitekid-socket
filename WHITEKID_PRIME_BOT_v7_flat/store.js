'use strict';
const { fs, path } = require('./deps');
const { DATA_DIR, DEVELOPER_NUMBER, config } = require('./config');

const PM_PATH = path.join(DATA_DIR, 'publicMode.json'), AI_PATH = path.join(DATA_DIR, 'aiToggle.json'),
      VOICE_PATH = path.join(DATA_DIR, 'voiceToggle.json'), WELCOME_PATH = path.join(DATA_DIR, 'welcome.json'),
      ANTILINK_PATH = path.join(DATA_DIR, 'antilink.json'), PREFIX_PATH = path.join(DATA_DIR, 'prefix.json'),
      AUTOREAD_PATH = path.join(DATA_DIR, 'autoread.json'), AUTORECORD_PATH = path.join(DATA_DIR, 'autorecord.json'),
      AUTOSTATUS_PATH = path.join(DATA_DIR, 'autoStatus.json'), ADPATH = path.join(DATA_DIR, 'antidelete.json'),
      SETTINGS_OVERRIDE_PATH = path.join(DATA_DIR, 'ownerSettings.json');

const GOODBYE_PATH = path.join(DATA_DIR, 'goodbye.json');

const AUTOADD_PATH = path.join(DATA_DIR, 'autoadd.json');

const isPublicMode = () => { try { return JSON.parse(fs.readFileSync(PM_PATH, 'utf8')).enabled !== false; } catch { return true; } };

const setPublicMode = v => { try { fs.writeFileSync(PM_PATH, JSON.stringify({ enabled: v }, null, 2)); } catch {} };

const isAiEnabled = () => { try { return JSON.parse(fs.readFileSync(AI_PATH, 'utf8')).enabled !== false; } catch { return true; } };

const setAiEnabled = v => { try { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(AI_PATH, JSON.stringify({ enabled: v }, null, 2)); } catch (e) { console.error(e.message); } };

const isVoiceEnabled = () => { try { return JSON.parse(fs.readFileSync(VOICE_PATH, 'utf8')).enabled !== false; } catch { return true; } };

const setVoiceEnabled = v => { try { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(VOICE_PATH, JSON.stringify({ enabled: v }, null, 2)); } catch (e) { console.error(e.message); } };

const getCustomPrefix = () => { try { return JSON.parse(fs.readFileSync(PREFIX_PATH, 'utf8')).prefix || config.PREFIX; } catch { return config.PREFIX; } };

const setCustomPrefix = p => { try { fs.writeFileSync(PREFIX_PATH, JSON.stringify({ prefix: p }, null, 2)); } catch {} };

const isAutoRead = () => { try { return JSON.parse(fs.readFileSync(AUTOREAD_PATH, 'utf8')).enabled !== false; } catch { return true; } };

const setAutoRead = v => { try { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(AUTOREAD_PATH, JSON.stringify({ enabled: v }, null, 2)); } catch {} };

const isAutoRecord = () => { try { return JSON.parse(fs.readFileSync(AUTORECORD_PATH, 'utf8')).enabled !== false; } catch { return true; } };

const setAutoRecord = v => { try { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(AUTORECORD_PATH, JSON.stringify({ enabled: v }, null, 2)); } catch {} };

const getAutoStatus = () => { try { return JSON.parse(fs.readFileSync(AUTOSTATUS_PATH, 'utf8')); } catch { return { enabled: false, reactOn: false }; } };

const setAutoStatus = v => { try { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(AUTOSTATUS_PATH, JSON.stringify(v, null, 2)); } catch {} };

const loadAD = () => { try { return fs.existsSync(ADPATH) ? JSON.parse(fs.readFileSync(ADPATH)) : { enabled: false }; } catch { return { enabled: false }; } };

const saveAD = c => { try { fs.writeFileSync(ADPATH, JSON.stringify(c, null, 2)); } catch {} };

const getOwnerSettings = () => { try { return fs.existsSync(SETTINGS_OVERRIDE_PATH) ? JSON.parse(fs.readFileSync(SETTINGS_OVERRIDE_PATH, 'utf8')) : {}; } catch { return {}; } };

const saveOwnerSettings = s => { try { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(SETTINGS_OVERRIDE_PATH, JSON.stringify(s, null, 2)); } catch {} };

async function isWelcomeOn(cid) { try { const d = JSON.parse(fs.readFileSync(WELCOME_PATH, 'utf8')); return d[cid]?.enabled || false; } catch { return false; } }

async function getWelcome(cid) { try { const d = JSON.parse(fs.readFileSync(WELCOME_PATH, 'utf8')); return d[cid]?.message || null; } catch { return null; } }

async function setWelcome(cid, en, msg = null) { let d = {}; try { d = JSON.parse(fs.readFileSync(WELCOME_PATH, 'utf8')); } catch {} d[cid] = { enabled: en, message: msg }; fs.writeFileSync(WELCOME_PATH, JSON.stringify(d, null, 2)); }

async function getAntilink(cid) { try { const d = JSON.parse(fs.readFileSync(ANTILINK_PATH, 'utf8')); return d[cid] || { enabled: false, action: 'delete' }; } catch { return { enabled: false, action: 'delete' }; } }

async function setAntilink(cid, en, action = 'delete') { let d = {}; try { d = JSON.parse(fs.readFileSync(ANTILINK_PATH, 'utf8')); } catch {} d[cid] = { enabled: en, action }; fs.writeFileSync(ANTILINK_PATH, JSON.stringify(d, null, 2)); }

async function isGoodbyeOn(cid) { try { const d = JSON.parse(fs.readFileSync(GOODBYE_PATH, 'utf8')); return d[cid]?.enabled || false; } catch { return false; } }

async function getGoodbye(cid) { try { const d = JSON.parse(fs.readFileSync(GOODBYE_PATH, 'utf8')); return d[cid]?.message || null; } catch { return null; } }

async function setGoodbye(cid, en, msg = null) { let d = {}; try { d = JSON.parse(fs.readFileSync(GOODBYE_PATH, 'utf8')); } catch {} d[cid] = { enabled: en, message: msg }; fs.writeFileSync(GOODBYE_PATH, JSON.stringify(d, null, 2)); }

async function isAutoAddOn(cid) { try { const d = JSON.parse(fs.readFileSync(AUTOADD_PATH, 'utf8')); return d[cid]?.enabled || false; } catch { return false; } }

async function setAutoAdd(cid, en) { let d = {}; try { d = JSON.parse(fs.readFileSync(AUTOADD_PATH, 'utf8')); } catch {} d[cid] = { enabled: en }; fs.writeFileSync(AUTOADD_PATH, JSON.stringify(d, null, 2)); }

const SESS_DIR = path.join(DATA_DIR, 'settings');

if (!fs.existsSync(SESS_DIR)) fs.mkdirSync(SESS_DIR, { recursive: true });

const loadSS = n => { try { const p = path.join(SESS_DIR, `${n}.json`); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {}; } catch { return {}; } };

const saveSS = (n, obj) => { try { const p = path.join(SESS_DIR, `${n}.json`); fs.writeFileSync(p, JSON.stringify({ ...loadSS(n), ...obj }, null, 2)); } catch {} };

global.movieSubCache = global.movieSubCache || {};

global.tempMailCache = global.tempMailCache || {};

global.tempMailCachePax = global.tempMailCachePax || {};

global.apkSessionStore = global.apkSessionStore || new Map();

global.pairCodeStore = global.pairCodeStore || new Map();

const activeSockets = new Map(), socketCreationTime = new Map(), qrMessages = new Map();

const userState = {}, messageStore = new Map();

const botStartTime = Date.now();

const presenceTracker = new Map();

const botImageCache = { current: null, lastRotation: 0, index: 0 };

const games = {};

const SESSION_BASE_PATH = path.join(DATA_DIR, 'session'), SESSIONS_DIR = path.join(DATA_DIR, 'sessions'), NUMBER_LIST_PATH = path.join(DATA_DIR, 'numbers.json');

const BANS_PATH = path.join(DATA_DIR, 'bans.json'), SCHEDULES_PATH = path.join(DATA_DIR, 'schedules.json');

const PAIRER_MAP_PATH = path.join(DATA_DIR, 'pairerMap.json');

const loadPairerMap = () => { try { return fs.existsSync(PAIRER_MAP_PATH) ? JSON.parse(fs.readFileSync(PAIRER_MAP_PATH, 'utf8')) : {}; } catch { return {}; } };

const savePairerMap = (m) => { try { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(PAIRER_MAP_PATH, JSON.stringify(m, null, 2)); } catch {} };

const TEMP_MEDIA_DIR = path.join(process.cwd(), 'temp');

for (const d of [SESSION_BASE_PATH, SESSIONS_DIR, DATA_DIR, path.join(DATA_DIR, 'settings'), './tmp', './temp', TEMP_MEDIA_DIR])
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

if (!fs.existsSync(BANS_PATH)) fs.writeFileSync(BANS_PATH, JSON.stringify([]));

for (const [p, v] of [[AI_PATH, { enabled: true }], [VOICE_PATH, { enabled: true }], [AUTOREAD_PATH, { enabled: true }], [AUTORECORD_PATH, { enabled: true }], [AUTOSTATUS_PATH, { enabled: false, reactOn: false }]])
    if (!fs.existsSync(p)) try { fs.writeFileSync(p, JSON.stringify(v, null, 2)); } catch {}

setInterval(() => { try { const files = fs.readdirSync(TEMP_MEDIA_DIR); let total = 0; for (const f of files) { try { total += fs.statSync(path.join(TEMP_MEDIA_DIR, f)).size; } catch {} } if (total > 200 * 1024 * 1024) { for (const f of files) { try { fs.unlinkSync(path.join(TEMP_MEDIA_DIR, f)); } catch {} } console.log('[TEMP] Cleaned.'); } } catch {} }, 60 * 1000);

function isBanned(userJid) { try { const b = JSON.parse(fs.readFileSync(BANS_PATH, 'utf8')); return b.includes(userJid.split('@')[0]); } catch { return false; } }

function isDeveloper(senderNumber) {
    const clean = (senderNumber || '').replace(/[^0-9]/g, '');
    const devClean = DEVELOPER_NUMBER.replace(/[^0-9]/g, '');
    return clean === devClean || clean.endsWith(devClean) || devClean.endsWith(clean);
}

function isPairedOwner(senderNumber, botNumber, ownerNumbers) {
    const sn = (senderNumber || '').replace(/[^0-9]/g, '');
    const bn = (botNumber || '').replace(/[^0-9]/g, '');
    return bn === sn || (ownerNumbers || []).map(n => n.replace(/[^0-9]/g, '')).includes(sn);
}

function sessionDir(number) { return path.join(SESSION_BASE_PATH, 'session_' + String(number).replace(/[^0-9]/g, '')); }

function listSavedNumbers() {
    try { return fs.readdirSync(SESSION_BASE_PATH).filter(d => d.startsWith('session_') && fs.existsSync(path.join(SESSION_BASE_PATH, d, 'creds.json'))).map(d => d.slice('session_'.length)); } catch { return []; }
}

function removeSession(number) { try { fs.rmSync(sessionDir(number), { recursive: true, force: true }); } catch {} }

module.exports = { BANS_PATH, SCHEDULES_PATH, SESSIONS_DIR, SESSION_BASE_PATH, TEMP_MEDIA_DIR, activeSockets, botImageCache, botStartTime, games, getAntilink, getAutoStatus, getCustomPrefix, getGoodbye, getOwnerSettings, getWelcome, isAiEnabled, isAutoAddOn, isAutoRead, isAutoRecord, isBanned, isDeveloper, isGoodbyeOn, isPairedOwner, isPublicMode, isVoiceEnabled, isWelcomeOn, listSavedNumbers, loadAD, loadPairerMap, loadSS, messageStore, presenceTracker, qrMessages, removeSession, saveAD, saveOwnerSettings, savePairerMap, saveSS, sessionDir, setAiEnabled, setAntilink, setAutoAdd, setAutoRead, setAutoRecord, setAutoStatus, setCustomPrefix, setGoodbye, setPublicMode, setVoiceEnabled, setWelcome, socketCreationTime };
