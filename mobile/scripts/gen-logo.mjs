// Generates app icon / splash / favicon PNGs from the in-game pixel T-rex.
// Run: node scripts/gen-logo.mjs   (requires rsvg-convert on PATH)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const REX = [
  '..........XXXXXXXXX.',
  '.........XXEXXXXXXX.',
  '.........XXXXXXXXXX.',
  '.........XXXXXXXXXX.',
  '.........XXXXX......',
  '.........XXXXXXXX...',
  'X.......XXXXXX......',
  'X......XXXXXXX......',
  'XX....XXXXXXXXXX....',
  'XXX..XXXXXXXXXXX....',
  'XXXXXXXXXXXXXXXX.X..',
  'XXXXXXXXXXXXXXXXXX..',
  'XXXXXXXXXXXXXXXX....',
  '.XXXXXXXXXXXXXX.....',
  '..XXXXXXXXXXXX......',
  '...XXXXXXXXXX.......',
  '....XXXXXXXX........',
  '.....XX...XXX.......',
  '.....XX....XX.......',
  '.....XXX...XXX......',
];

const COLS = REX[0].length; // 20
const ROWS = REX.length; // 20

// Build <rect> runs for the dino. `eyeColor` null => skip eye pixel (cut-out look).
function dinoRects(px, ox, oy, body, eyeColor) {
  let out = '';
  for (let y = 0; y < ROWS; y++) {
    let x = 0;
    while (x < COLS) {
      const ch = REX[y][x];
      if (ch === '.') { x++; continue; }
      let end = x + 1;
      while (end < COLS && REX[y][end] === ch) end++;
      const color = ch === 'E' ? eyeColor : body;
      if (color) {
        // +overlap removes subpixel hairlines between adjacent rows/cols
        const ov = px * 0.04 + 0.75;
        out += `<rect x="${ox + x * px}" y="${oy + y * px}" width="${(end - x) * px + ov}" height="${px + ov}" fill="${color}"/>`;
      }
      x = end;
    }
  }
  return out;
}

function svgIcon({ size, bg, body, eye, fullBleed, scale = 0.62, shiftY = 0, radius }) {
  const px = (size * scale) / COLS;
  const dw = COLS * px;
  const dh = ROWS * px;
  const ox = (size - dw) / 2;
  const oy = (size - dh) / 2 + shiftY * size;
  const bgEl = !bg ? ''
    : fullBleed
      ? `<rect width="${size}" height="${size}" fill="${bg}"/>`
      : `<rect x="${size * 0.06}" y="${size * 0.06}" width="${size * 0.88}" height="${size * 0.88}" rx="${radius ?? size * 0.22}" fill="${bg}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${bgEl}${dinoRects(px, ox, oy, body, eye)}</svg>`;
}

function svgSplash({ size, body }) {
  // dino + "DINO" wordmark, transparent bg (splash screen paints its own bg)
  const px = (size * 0.5) / COLS;
  const dw = COLS * px;
  const dh = ROWS * px;
  const ox = (size - dw) / 2;
  const oy = size * 0.22;
  const fontSize = size * 0.14;
  const text = `<text x="${size / 2}" y="${oy + dh + fontSize}" font-family="monospace" font-weight="bold" font-size="${fontSize}" letter-spacing="${fontSize * 0.25}" fill="${body}" text-anchor="middle">DINO</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${dinoRects(px, ox, oy, body, null)}${text}</svg>`;
}

const tmp = mkdtempSync(join(tmpdir(), 'logo-'));
const ASSETS = new URL('../assets/', import.meta.url).pathname;

function render(svg, outPath, w, h) {
  const svgPath = join(tmp, 'tmp.svg');
  writeFileSync(svgPath, svg);
  execFileSync('rsvg-convert', ['-w', String(w), '-h', String(h ?? w), svgPath, '-o', outPath]);
  console.log('wrote', outPath);
}

const BG = '#16c172';      // brand green
const DARK = '#1f2430';    // dino body on green
const SLATE = '#535353';   // dino on light splash

// App icon: full-bleed green, dark dino, eye cut out to green
render(svgIcon({ size: 1024, bg: BG, body: DARK, eye: BG, fullBleed: true, scale: 0.66, shiftY: 0.02 }), join(ASSETS, 'icon.png'), 1024);

// Favicon
render(svgIcon({ size: 64, bg: BG, body: DARK, eye: BG, fullBleed: true, scale: 0.66, shiftY: 0.02 }), join(ASSETS, 'favicon.png'), 64);

// Adaptive foreground: dino only, transparent, inside ~66% safe zone
render(svgIcon({ size: 1024, bg: null, body: '#ffffff', eye: null, scale: 0.46, shiftY: 0.0 }), join(ASSETS, 'android-icon-foreground.png'), 1024);

// Adaptive background: solid green
render(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="${BG}"/></svg>`, join(ASSETS, 'android-icon-background.png'), 1024);

// Monochrome (themed icons): white dino on transparent
render(svgIcon({ size: 1024, bg: null, body: '#ffffff', eye: null, scale: 0.46 }), join(ASSETS, 'android-icon-monochrome.png'), 1024);

// Splash: dino + DINO wordmark in slate on transparent
render(svgSplash({ size: 1024, body: SLATE }), join(ASSETS, 'splash-icon.png'), 1024);

rmSync(tmp, { recursive: true, force: true });
console.log('done');
