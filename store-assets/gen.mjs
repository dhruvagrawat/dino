// Generates Google Play store graphics from the in-game VOLT robot.
// Run: node store-assets/gen.mjs   (requires rsvg-convert on PATH)
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FULL, PALETTE, render, spriteRects, svgIcon } from '../mobile/scripts/gen-logo.mjs';

// VOLT running pose, already outlined (same as RUNNER_SPRITES.volt.runA in the app).
const VOLT = [
  '...........OO.......', '..........OAAO......', '.......OOOOXOOOO....', '......OXXXXXXXXXO...',
  '.....OXXXXXXXXXXXO..', '.....OXDDDDDDDDDXO..', '.....OXDDDDEDDEDXO..', '.....OXDDDDEDDEDXO..',
  '.....OXXXXXXXXXXXO..', '......OXXXXXXXXXO...', '.......OOOXXXOOO....', '......OOXXXXXXXXOO..',
  '.....OXXXXXXXXXXXXO.', '.....OXXXXXAAXXXXXO.', '.....OXXXXXAAXXXOO..', '......OOXXXXXXXXO...',
  '.......OXXXXXXXXO...', '........OXXOOXXO....', '.......OXXO..OXXO...', '......OXXO....OXXO..',
  '......ODDDO...ODDDO.', '.......OOO.....OOO..',
];

const here = dirname(fileURLToPath(import.meta.url));

// 512x512 Play Store icon (same art as the launcher icon)
render(svgIcon({ size: 512, bg: true, colors: FULL, scale: 0.64, shiftY: 0.03 }), join(here, 'play-icon-512.png'), 512);

// 1024x500 feature graphic: neon night skyline, robot left, wordmark right
{
  const W = 1024, H = 500, groundY = 410;
  const px = 14;
  const ox = 90, oy = groundY - VOLT.length * px + px;
  let skyline = '';
  let x = 0, seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  while (x < W) {
    const w = 40 + rnd() * 70, h = 60 + rnd() * 170;
    skyline += `<rect x="${x}" y="${groundY - h}" width="${w}" height="${h}" fill="#241c55"/>`;
    for (let wy = groundY - h + 14; wy < groundY - 12; wy += 22)
      for (let wx = x + 10; wx < x + w - 12; wx += 18)
        if (rnd() < 0.3) skyline += `<rect x="${wx}" y="${wy}" width="7" height="10" fill="#ffd84f" opacity="0.85"/>`;
    x += w + 4 + rnd() * 10;
  }
  let stars = '';
  for (let i = 0; i < 60; i++) stars += `<circle cx="${rnd() * W}" cy="${rnd() * 260}" r="${1 + rnd() * 1.8}" fill="#fff" opacity="${0.4 + rnd() * 0.6}"/>`;
  let grid = '';
  for (let gx = 0; gx <= W; gx += 48) grid += `<rect x="${gx}" y="${groundY}" width="2" height="${H - groundY}" fill="#2c2360"/>`;
  for (const gy of [14, 34, 62]) grid += `<rect x="0" y="${groundY + gy}" width="${W}" height="2" fill="#2c2360"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07061a"/><stop offset="1" stop-color="#3b1a63"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    ${stars}
    <circle cx="880" cy="110" r="52" fill="#f1eaff" opacity="0.95"/>
    <circle cx="880" cy="110" r="80" fill="#f1eaff" opacity="0.12"/>
    ${skyline}
    <rect x="0" y="${groundY}" width="${W}" height="${H - groundY}" fill="#120e2a"/>
    ${grid}
    <rect x="0" y="${groundY}" width="${W}" height="4" fill="${PALETTE.accent}"/>
    <circle cx="${ox + 10 * px}" cy="${oy + 11 * px}" r="190" fill="${PALETTE.accent}" opacity="0.10"/>
    ${spriteRects(px, ox, oy, FULL, VOLT)}
    <text x="420" y="235" font-family="monospace" font-weight="bold" font-size="112" letter-spacing="8"><tspan fill="${PALETTE.body}">VOLT</tspan><tspan fill="${PALETTE.accent}">BOT</tspan></text>
    <text x="426" y="295" font-family="monospace" font-size="30" letter-spacing="6" fill="#ecebff" opacity="0.8">jump · dash · glow</text>
  </svg>`;
  render(svg, join(here, 'feature-graphic-1024x500.png'), W, H);
}

console.log('done');
