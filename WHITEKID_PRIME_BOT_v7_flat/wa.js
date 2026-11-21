'use strict';
const { safeRequire } = require('./deps');

const bf = {
    default: () => ({}), useMultiFileAuthState: async () => ({ state: { creds: {}, keys: {} }, saveCreds: () => {} }),
    delay: ms => new Promise(r => setTimeout(r, ms)), getContentType: () => 'conversation',
    makeCacheableSignalKeyStore: k => k, Browsers: { macOS: () => [] },
    jidNormalizedUser: j => j, downloadContentFromMessage: async () => (async function* () { yield Buffer.from([]); })(),
    fetchLatestBaileysVersion: async () => ({ version: [2, 3000, 1015901307] }),
    DisconnectReason: { loggedOut: 401 }, proto: {}, prepareWAMessageMedia: async () => ({}),
    generateWAMessageFromContent: () => ({}), S_WHATSAPP_NET: '@s.whatsapp.net',
    downloadMediaMessage: async () => Buffer.from([])
};

const B = safeRequire(process.env.WA_LIB || '@whiskeysockets/baileys', bf);

const makeWASocket = B.default || bf.default;

const useMultiFileAuthState = B.useMultiFileAuthState || bf.useMultiFileAuthState;

const delay = B.delay || bf.delay;

const getContentType = B.getContentType || bf.getContentType;

const makeCacheableSignalKeyStore = B.makeCacheableSignalKeyStore || bf.makeCacheableSignalKeyStore;

const Browsers = B.Browsers || bf.Browsers;

const jidNormalizedUser = B.jidNormalizedUser || bf.jidNormalizedUser;

const downloadContentFromMessage = B.downloadContentFromMessage || bf.downloadContentFromMessage;

const fetchLatestBaileysVersion = B.fetchLatestBaileysVersion || bf.fetchLatestBaileysVersion;

const DisconnectReason = B.DisconnectReason || bf.DisconnectReason;

const proto = B.proto || bf.proto;

const prepareWAMessageMedia = B.prepareWAMessageMedia || bf.prepareWAMessageMedia;

const generateWAMessageFromContent = B.generateWAMessageFromContent || bf.generateWAMessageFromContent;

const downloadMediaMessage = B.downloadMediaMessage || bf.downloadMediaMessage;

module.exports = { Browsers, DisconnectReason, delay, downloadContentFromMessage, downloadMediaMessage, fetchLatestBaileysVersion, generateWAMessageFromContent, getContentType, jidNormalizedUser, makeCacheableSignalKeyStore, makeWASocket, prepareWAMessageMedia, proto, useMultiFileAuthState };
