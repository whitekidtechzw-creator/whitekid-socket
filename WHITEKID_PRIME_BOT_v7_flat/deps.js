'use strict';

const fs = require('fs-extra');

const path = require('path');

const { exec, execSync } = require('child_process');

const crypto = require('crypto');

const os = require('os');

const { pipeline } = require('stream');

const { promisify } = require('util');

const streamPipeline = promisify(pipeline);

function safeRequire(name, fallback) { try { return require(name); } catch { console.warn(`⚠️ Missing: ${name}`); return fallback; } }

let chalk;

try { chalk = require('chalk'); if (typeof chalk.red !== 'function') chalk = chalk.default; if (typeof chalk.red !== 'function') throw new Error('unsupported chalk'); }
catch { const id = s => s; chalk = new Proxy(id, { get: (t, p) => { if (typeof p === 'string' && /^(bold|cyan|green|red|yellow|blue|magenta|white|gray|dim|underline)$/i.test(p)) return chalk; return id; }, apply: (t, th, a) => a[0] }); }

const pino = safeRequire('pino', () => () => ({ level: 'silent', info: () => {}, error: () => {}, warn: () => {}, debug: () => {}, child: () => ({ level: 'fatal' }) }));

const moment = safeRequire('moment-timezone', () => { const f = () => ({ tz: () => ({ format: () => new Date().toISOString() }) }); return f; });

const axios = safeRequire('axios', { get: async () => ({ data: {} }), post: async () => ({ data: {} }) });

const FormData = safeRequire('form-data', class FD { append() {} getHeaders() { return {}; } });

const QRCode = safeRequire('qrcode', { toBuffer: async () => Buffer.from([]) });

const TelegramBot = safeRequire('node-telegram-bot-api', class { constructor() {} onText() {} on() {} sendMessage() {} answerCallbackQuery() {} deleteMessage() {} sendPhoto() {} });

const yts = safeRequire('yt-search', () => ({ search: async () => ({ videos: [] }) }));

const ytdl = safeRequire('@distube/ytdl-core', null);

let ytdlp;

try { ytdlp = safeRequire('yt-dlp-exec', null); } catch (_) { ytdlp = null; }

const OpenAI = safeRequire('openai', null);

const cheerio = safeRequire('cheerio', () => ({ load: () => ({}) }));

const translate = safeRequire('@vitalets/google-translate-api', { translate: async () => ({ text: '' }) });

const ffmpeg = safeRequire('fluent-ffmpeg', null);

const ddownr = safeRequire('denethdev-ytmp3', null);

const sharp = safeRequire('sharp', null);

module.exports = { QRCode, TelegramBot, axios, chalk, cheerio, crypto, exec, ffmpeg, fs, moment, os, path, pino, safeRequire, sharp, translate, ytdl, ytdlp, yts };
