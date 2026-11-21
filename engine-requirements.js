const major = parseInt(process.versions.node.split('.')[0], 10);

if (major < 20) {
  console.error(
    `\n❌ This package requires Node.js 20+ to run reliably.\n` +
    `   You are using Node.js ${process.versions.node}.\n` +
    `   Please upgrade to Node.js 20+ to proceed.\n` +
    `\n   W H I T E K I D  —  S O C K E T S\n`
  );
  process.exit(1);
}