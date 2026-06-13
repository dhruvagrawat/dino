// Generates Google Play store graphics from the pixel T-rex.
// Run: node store-assets/gen.mjs   (requires rsvg-convert on PATH)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REX = [
  '..........XXXXXXXXX.', '.........XXEXXXXXXX.', '.........XXXXXXXXXX.',
  '.........XXXXXXXXXX.', '.........XXXXX......', '.........XXXXXXXX...',
  'X.......XXXXXX......', 'X......XXXXXXX......', 'XX....XXXXXXXXXX....',
  'XXX..XXXXXXXXXXX....', 'XXXXXXXXXXXXXXXX.X..', 'XXXXXXXXXXXXXXXXXX..',
  'XXXXXXXXXXXXXXXX....', '.XXXXXXXXXXXXXX.....', '..XXXXXXXXXXXX......',
  '...XXXXXXXXXX.......', '....XXXXXXXX........', '.....XX...XXX.......',
  '.....XX....XX.......', '.....XXX...XXX......',
];
const COLS = REX[0].length, ROWS = REX.length;

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
        const ov = px * 0.04 + 0.75;
        out += `<rect x="${ox + x * px}" y="${oy + y * px}" width="${(end - x) * px + ov}" height="${px + ov}" fill="${color}"/>`;
      }
      x = end;
    }
  }
  return out;
}

const BG = '#16c172', DARK = '#1f2430';
const here = dirname(fileURLToPath(import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), 'store-'));
const render = (svg, out, w, h) => {
  const p = join(tmp, 'a.svg');
  writeFileSync(p, svg);
  execFileSync('rsvg-convert', ['-w', String(w), '-h', String(h), p, '-o', out]);
  console.log('wrote', out);
};

// 512x512 Play Store icon (full-bleed green, dino, eye cut to green)
{
  const size = 512, scale = 0.66;
  const px = (size * scale) / COLS;
  const ox = (size - COLS * px) / 2, oy = (size - ROWS * px) / 2 + size * 0.02;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="${BG}"/>${dinoRects(px, ox, oy, DARK, BG)}</svg>`;
  render(svg, join(here, 'play-icon-512.png'), 512, 512);
}

// 1024x500 feature graphic (green banner, dino left, wordmark + tagline right)
{
  const W = 1024, H = 500;
  const px = 13;
  const ox = 95, oy = (H - ROWS * px) / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${BG}"/>
    ${dinoRects(px, ox, oy, DARK, BG)}
    <text x="470" y="250" font-family="monospace" font-weight="bold" font-size="140" letter-spacing="10" fill="${DARK}">DINO</text>
    <text x="474" y="318" font-family="monospace" font-size="29" letter-spacing="5" fill="${DARK}" opacity="0.75">tap · run · survive</text>
  </svg>`;
  render(svg, join(here, 'feature-graphic-1024x500.png'), 1024, 500);
}

rmSync(tmp, { recursive: true, force: true });
console.log('done');
