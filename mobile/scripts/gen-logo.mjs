// Generates app icon / splash / favicon PNGs from the in-game VOLT robot.
// Run: node scripts/gen-logo.mjs   (requires rsvg-convert on PATH)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// VOLT's head (same pixels as src/pixels.ts), with a 1px outline ring ('O').
const HEAD = [
  '..........AA......',
  '..........X.......',
  '......XXXXXXXXX...',
  '.....XXXXXXXXXXX..',
  '.....XDDDDDDDDDX..',
  '.....XDDDDEDDEDX..',
  '.....XDDDDEDDEDX..',
  '.....XXXXXXXXXXX..',
  '......XXXXXXXXX...',
].map((r) => r.slice(4, 17)); // trim to the head's bounding box

function outlined(m) {
  const h = m.length, w = m[0].length;
  const at = (x, y) => (y >= 0 && y < h && x >= 0 && x < w ? m[y][x] : '.');
  const out = [];
  for (let y = -1; y <= h; y++) {
    let row = '';
    for (let x = -1; x <= w; x++) {
      const ch = at(x, y);
      if (ch !== '.') row += ch;
      else if (at(x - 1, y) !== '.' || at(x + 1, y) !== '.' || at(x, y - 1) !== '.' || at(x, y + 1) !== '.') row += 'O';
      else row += '.';
    }
    out.push(row);
  }
  return out;
}

const SPRITE = outlined(HEAD);
const COLS = SPRITE[0].length;
const ROWS = SPRITE.length;

export const PALETTE = {
  bgTop: '#2a1a5e',
  bgBottom: '#0f0c24',
  body: '#eeeaff',
  accent: '#2ee6d6',
  visor: '#231b4a',
  outline: '#120e24',
};

// Build <rect> runs. `colors` maps sprite chars to fills; a missing entry skips that pixel.
export function spriteRects(px, ox, oy, colors, sprite = SPRITE) {
  let out = '';
  for (let y = 0; y < sprite.length; y++) {
    const row = sprite[y];
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === '.') { x++; continue; }
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      const color = colors[ch];
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

const FULL = { X: PALETTE.body, A: PALETTE.accent, E: PALETTE.accent, D: PALETTE.visor, O: PALETTE.outline };
const MONO = { X: '#ffffff', A: '#ffffff', O: null };

function background(size, rounded) {
  const r = size * 0.5;
  const shape = rounded
    ? `<rect x="${size * 0.06}" y="${size * 0.06}" width="${size * 0.88}" height="${size * 0.88}" rx="${size * 0.22}" fill="url(#bg)"/>`
    : `<rect width="${size}" height="${size}" fill="url(#bg)"/>`;
  return `<defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${PALETTE.bgTop}"/><stop offset="1" stop-color="${PALETTE.bgBottom}"/></linearGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="${PALETTE.accent}" stop-opacity="0.45"/><stop offset="1" stop-color="${PALETTE.accent}" stop-opacity="0"/></radialGradient>
  </defs>${shape}<circle cx="${r}" cy="${r}" r="${size * 0.42}" fill="url(#glow)"/>`;
}

function svgIcon({ size, bg, colors, scale = 0.62, shiftY = 0, rounded = false }) {
  const px = (size * scale) / COLS;
  const ox = (size - COLS * px) / 2;
  const oy = (size - ROWS * px) / 2 + shiftY * size;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${bg ? background(size, rounded) : ''}${spriteRects(px, ox, oy, colors)}</svg>`;
}

function svgSplash({ size }) {
  // robot head + wordmark, transparent bg (splash screen paints its own bg)
  const px = (size * 0.42) / COLS;
  const ox = (size - COLS * px) / 2;
  const oy = size * 0.2;
  const fontSize = size * 0.12;
  const y = oy + ROWS * px + fontSize * 1.35;
  const text = `<text x="${size / 2}" y="${y}" font-family="monospace" font-weight="bold" font-size="${fontSize}" letter-spacing="${fontSize * 0.18}" text-anchor="middle"><tspan fill="${PALETTE.body}">VOLT</tspan><tspan fill="${PALETTE.accent}">BOT</tspan></text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${spriteRects(px, ox, oy, FULL)}${text}</svg>`;
}

export function render(svg, outPath, w, h) {
  const tmp = mkdtempSync(join(tmpdir(), 'logo-'));
  const svgPath = join(tmp, 'tmp.svg');
  writeFileSync(svgPath, svg);
  execFileSync('rsvg-convert', ['-w', String(w), '-h', String(h ?? w), svgPath, '-o', outPath]);
  rmSync(tmp, { recursive: true, force: true });
  console.log('wrote', outPath);
}

export { svgIcon, FULL };

if (import.meta.url === `file://${process.argv[1]}`) {
  const ASSETS = new URL('../assets/', import.meta.url).pathname;

  // App icon: full-bleed gradient, robot head centred
  render(svgIcon({ size: 1024, bg: true, colors: FULL, scale: 0.64, shiftY: 0.03 }), join(ASSETS, 'icon.png'), 1024);

  // Favicon
  render(svgIcon({ size: 64, bg: true, colors: FULL, scale: 0.7, shiftY: 0.03 }), join(ASSETS, 'favicon.png'), 64);

  // Adaptive foreground: robot only, transparent, inside ~66% safe zone
  render(svgIcon({ size: 1024, bg: false, colors: FULL, scale: 0.5, shiftY: 0.02 }), join(ASSETS, 'android-icon-foreground.png'), 1024);

  // Adaptive background: gradient + glow
  render(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">${background(1024, false)}</svg>`, join(ASSETS, 'android-icon-background.png'), 1024);

  // Monochrome (themed icons): white silhouette on transparent
  render(svgIcon({ size: 1024, bg: false, colors: { ...MONO, X: '#ffffff', D: null, E: null }, scale: 0.5, shiftY: 0.02 }), join(ASSETS, 'android-icon-monochrome.png'), 1024);

  // Splash: head + VOLTBOT wordmark on transparent
  render(svgSplash({ size: 1024 }), join(ASSETS, 'splash-icon.png'), 1024);

  console.log('done');
}
