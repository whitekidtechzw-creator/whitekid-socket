// whitekid-sockets · startup banner · Whitekid Tech
import { readFileSync } from 'fs';

const FONT = {
    W: ['█   █', '█   █', '█ █ █', '██ ██', '█   █'],
    H: ['█   █', '█   █', '█████', '█   █', '█   █'],
    I: ['█████', '  █  ', '  █  ', '  █  ', '█████'],
    T: ['█████', '  █  ', '  █  ', '  █  ', '  █  '],
    E: ['█████', '█    ', '████ ', '█    ', '█████'],
    K: ['█   █', '█  █ ', '███  ', '█  █ ', '█   █'],
    D: ['████ ', '█   █', '█   █', '█   █', '████ '],
    C: [' ████', '█    ', '█    ', '█    ', ' ████'],
    Z: ['█████', '   █ ', '  █  ', ' █   ', '█████']
};

const render = (word) =>
    [0, 1, 2, 3, 4].map((r) => [...word].map((ch) => FONT[ch][r]).join(' '));

// cyan -> blue -> violet, one colour per row
const GRADIENT = [51, 45, 39, 33, 63];
const paint = (code, s) => `\x1b[38;5;${code}m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

let shown = false;

export function printBanner({ force = false, color = !process.env.NO_COLOR && process.stdout.isTTY !== false } = {}) {
    if (shown && !force) return;
    shown = true;
    let version = '';
    try {
        version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
    } catch {}
    const c = (code, s) => (color ? paint(code, s) : s);
    const d = (s) => (color ? dim(s) : s);
    const b = (s) => (color ? bold(s) : s);

    const top = render('WHITEKID');
    const bottom = render('TECHZW');
    const width = top[0].length;
    const pad = ' '.repeat(Math.floor((width - bottom[0].length) / 2));
    const line = '━'.repeat(width + 4);

    const out = [''];
    out.push('  ' + c(39, line));
    out.push('');
    top.forEach((l, i) => out.push('   ' + c(GRADIENT[i], l)));
    out.push('');
    bottom.forEach((l, i) => out.push('   ' + pad + c(GRADIENT[4 - i], l)));
    out.push('');
    out.push('  ' + c(39, line));
    out.push('   ' + b('W H I T E K I D   S O C K E T S') + (version ? d('   v' + version) : ''));
    out.push('   ' + d('by ') + c(51, 'Whitekid Tech') + d(' · Zimbabwe'));
    out.push('   ' + d('whitekidtechzw.netlify.app'));
    out.push('  ' + c(39, line));
    out.push('');
    console.log(out.join('\n'));
}

export default printBanner;
