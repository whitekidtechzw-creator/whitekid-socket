'use strict';
const { app } = require('./server');
const { AI_FULL_NAME, AI_SHORT_NAME, DEVELOPER_NUMBER, PORT, config } = require('./config');
const { axios, chalk } = require('./deps');
const { getCustomPrefix, isPublicMode } = require('./store');
const { restoreAll, shutdown } = require('./manager');
const { restoreTelegramSessions, start } = require('./telegram');

process.on('uncaughtException', (err) => console.error('🔴 UncaughtException:', err));

process.on('unhandledRejection', (reason) => console.error('🔴 UnhandledRejection:', reason));

const server = app.listen(PORT, () => {
    console.log(chalk.bold.cyan('\n🤖 ' + AI_SHORT_NAME + ' v' + config.VERSION + ' — ' + AI_FULL_NAME + ' by WhiteKid Tech'));
    console.log(chalk.red('🔐 Developer Override:'), chalk.bold.red(DEVELOPER_NUMBER));
    console.log(chalk.yellow('🌐 Public Mode:'), isPublicMode() ? 'ON' : 'OFF', chalk.yellow('| 🔧 Prefix:'), getCustomPrefix());
    console.log('🚀 Server on port ' + PORT + '  → http://localhost:' + PORT + '/');
    restoreAll().catch((err) => console.error('Restore failed:', err));
    try { start(); restoreTelegramSessions(); } catch (err) { console.error('Telegram start failed:', err.message); }
});

const keepAliveUrl = process.env.RENDER_EXTERNAL_URL || process.env.RENDER_KEEP_ALIVE_URL;

if (keepAliveUrl) {
    const t = setInterval(async () => { try { await axios.get(keepAliveUrl + '/ping', { timeout: 10000 }); } catch (e) { console.warn('[KEEP-ALIVE] Failed:', e.message); } }, 10 * 60 * 1000);
    if (t.unref) t.unref();
}

function stop(signal) {
    console.log(signal + ' received, shutting down (sessions are kept on disk)');
    shutdown();
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
}

process.on('SIGINT', () => stop('SIGINT'));

process.on('SIGTERM', () => stop('SIGTERM'));
