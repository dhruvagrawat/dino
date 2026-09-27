// Pixel-art sprite matrices, all original artwork.
// '.' = transparent, 'X' = body color, 'A' = accent color, 'E' = eye glow,
// 'D' = dark visor/feet, 'O' = outline (added automatically by `outlined`).

export type PixelMatrix = string[];

/** Pads a matrix by one pixel and traces an 'O' outline around every filled pixel. */
export function outlined(m: PixelMatrix): PixelMatrix {
  const h = m.length;
  const w = m[0].length;
  const at = (x: number, y: number) => (y >= 0 && y < h && x >= 0 && x < w ? m[y][x] : '.');
  const out: string[] = [];
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

export interface RunnerSprites {
  runA: PixelMatrix;
  runB: PixelMatrix;
  jump: PixelMatrix;
  dead: PixelMatrix;
  duckA: PixelMatrix;
  duckB: PixelMatrix;
}

function runner(top: string[], deadTop: string[], legsA: string[], legsB: string[], jumpLegs: string[]): RunnerSprites {
  return {
    runA: outlined([...top, ...legsA]),
    runB: outlined([...top, ...legsB]),
    jump: outlined([...top.slice(0, top.length - 1), ...jumpLegs]),
    dead: outlined([...deadTop, ...legsB]),
    duckA: DUCK_A,
    duckB: DUCK_B,
  };
}

// ---------------------------------------------------------------- shared duck pose (18px wide bots squash to 22x11)
const DUCK_TOP = [
  '...........XXXXXXXXX..',
  '..........XXXXXXXXXXX.',
  '..........XDDDDEDDEDX.',
  '..........XDDDDEDDEDX.',
  '...XXXXXXXXXXXXXXXXXX.',
  '..XXXXXXAAXXXXXXXXX...',
  '..XXXXXXAAXXXXXXX.....',
  '...XXXXXXXXXXXXX......',
];
const DUCK_A = outlined([
  ...DUCK_TOP,
  '....XX......XX........',
  '...XX........XX.......',
  '...DDD........DDD.....',
]);
const DUCK_B = outlined([
  ...DUCK_TOP,
  '....XX.....XX.........',
  '.....XX...XX..........',
  '.....DDD..DDD.........',
]);

// ---------------------------------------------------------------- VOLT (round head, antenna, twin eyes)
const VOLT_HEAD = [
  '..........AA......',
  '..........X.......',
  '......XXXXXXXXX...',
  '.....XXXXXXXXXXX..',
  '.....XDDDDDDDDDX..',
  '.....XDDDDEDDEDX..',
  '.....XDDDDEDDEDX..',
  '.....XXXXXXXXXXX..',
  '......XXXXXXXXX...',
  '.........XXX......',
];
const VOLT_BODY = [
  '.......XXXXXXXX...',
  '.....XXXXXXXXXXXX.',
  '.....XXXXXAAXXXXX.',
  '.....XXXXXAAXXX...',
  '.......XXXXXXXX...',
  '.......XXXXXXXX...',
  '........XX..XX....',
];
export const VOLT = runner(
  [...VOLT_HEAD, ...VOLT_BODY],
  [
    '........AA........',
    '.........X........',
    ...VOLT_HEAD.slice(2, 5),
    '.....XDDDDDDDDDX..',
    '.....XDDDEEDEEDX..',
    ...VOLT_HEAD.slice(7),
    ...VOLT_BODY,
  ],
  ['.......XX....XX...', '......XX......XX..', '......DDD.....DDD.'],
  ['........XX..XX....', '........XX..XX....', '........DDD.DDD...'],
  ['........XX..XX....', '.......XX..XX.....', '.......DDD.DDD....', '..................'],
);

// ---------------------------------------------------------------- ZIP (sleek fin, visor stripe, jet pack + glowing boots)
const ZIP_TOP = [
  '........XA........',
  '.......XXXXXXXX...',
  '.....XXXXXXXXXXXX.',
  '.....XXXXXXXXXXXX.',
  '.....XXDDDDDDDDDX.',
  '.....XXDDDDEEEEEX.',
  '.....XXXDDDDDDDDX.',
  '......XXXXXXXXXX..',
  '........XXXXXX....',
  '.........XXX......',
  '.......XXXXXXX....',
  '....AAXXXXXXXXXX..',
  '....AAXXXAXXXXXX..',
  '....AAXXXAXXXX....',
  '......XXXXXXXX....',
  '.......XXXXXX.....',
  '.......XX..XX.....',
];
export const ZIP = runner(
  ZIP_TOP,
  [...ZIP_TOP.slice(0, 5), '.....XXDDDDDDDDDX.', ...ZIP_TOP.slice(6)],
  ['......XX....XX....', '.....XX......XX...', '.....AAA.....AAA..'],
  ['.......XX..XX.....', '.......XX..XX.....', '.......AAA.AAA....'],
  ['.......XX..XX.....', '......XX..XX......', '......AAA.AAA.....', '..................'],
);

// ---------------------------------------------------------------- BRICK (boxy, armored shoulders, grill mouth)
const BRICK_TOP = [
  '...A.........A....',
  '...XXXXXXXXXXXX...',
  '..XXXXXXXXXXXXXX..',
  '..XXDDDDDDDDDDXX..',
  '..XXDDDDEEDDEEXX..',
  '..XXDDDDEEDDEEXX..',
  '..XXDDDDDDDDDDXX..',
  '..XXXXXXXXXXXXXX..',
  '...XAXAXAXAXAXX...',
  '.....XXXXXXXX.....',
  '..XXXXXXXXXXXXXX..',
  '.AAXXXXXXXXXXXXAA.',
  '.AAXXXAAAAXXXXXAA.',
  '.XXXXXAAAAXXXXXXX.',
  '..XXXXXXXXXXXXXX..',
  '...XXXXXXXXXXXX...',
  '....XXX....XXX....',
];
export const BRICK = runner(
  BRICK_TOP,
  [...BRICK_TOP.slice(0, 4), '..XXDDDDDDDDDDXX..', '..XXDDDEEEDEEEXX..', ...BRICK_TOP.slice(6)],
  ['...XXX......XXX...', '...XXX......XXX...', '..DDDD.....DDDD...'],
  ['....XXX...XXX.....', '....XXX...XXX.....', '....DDDD..DDDD....'],
  ['....XXX....XXX....', '....XXX....XXX....', '...DDDD....DDDD...', '..................'],
);

// ---------------------------------------------------------------- NOVA (dome head, magnet antenna, cyclops eye)
const NOVA_TOP = [
  '.......A...A......',
  '.......A...A......',
  '.......AAAAA......',
  '......XXXXXXX.....',
  '.....XXXXXXXXX....',
  '....XXDDDDDDDXX...',
  '....XDDDDDEEDDX...',
  '....XDDDDDEEDDX...',
  '....XXDDDDDDDXX...',
  '.....XXXXXXXXX....',
  '.......XXXXX......',
  '.....XXXXXXXXXX...',
  '....XXXXAAAXXXXX..',
  '....XXXXAAAXXX....',
  '.....XXXXXXXXX....',
  '......XXXXXXX.....',
  '.......XX.XX......',
];
export const NOVA = runner(
  NOVA_TOP,
  [...NOVA_TOP.slice(0, 6), '....XDDDDDDDDDX...', '....XDDDDEEEEDX...', ...NOVA_TOP.slice(8)],
  ['......XX...XX.....', '.....XX.....XX....', '.....DDD....DDD...'],
  ['.......XX.XX......', '.......XX.XX......', '......DDD.DDD.....'],
  ['.......XX.XX......', '......XX..XX......', '......DDD.DDD.....', '..................'],
);

export const RUNNER_SPRITES = { volt: VOLT, zip: ZIP, brick: BRICK, nova: NOVA };

// ---------------------------------------------------------------- OBSTACLES
export const CONE: PixelMatrix = outlined([
  '.....XX.....',
  '.....XX.....',
  '....XXXX....',
  '....AAAA....',
  '....AAAA....',
  '...XXXXXX...',
  '...XXXXXX...',
  '..AAAAAAAA..',
  '..AAAAAAAA..',
  '..XXXXXXXX..',
  '.XXXXXXXXXX.',
  'XXXXXXXXXXXX',
  'XXXXXXXXXXXX',
]);

export const CRATES: PixelMatrix = outlined([
  '..XXXXXXXXXX..',
  '..XAAXXXXAAX..',
  '..XXAAXXAAXX..',
  '..XXXAAAAXXX..',
  '..XXXXAAXXXX..',
  '..XXXAAAAXXX..',
  '..XXAAXXAAXX..',
  '..XAAXXXXAAX..',
  '..XXXXXXXXXX..',
  'XXXXXXXXXXXXXX',
  'XAAXXXXXXXXAAX',
  'XXAAXXXXXXAAXX',
  'XXXAAXXXXAAXXX',
  'XXXXAAXXAAXXXX',
  'XXXXXAAAAXXXXX',
  'XXXXAAXXAAXXXX',
  'XXXAAXXXXAAXXX',
  'XXAAXXXXXXAAXX',
  'XAAXXXXXXXXAAX',
  'XXXXXXXXXXXXXX',
]);

const DRONE_BODY = [
  '...X........X.....',
  '...XXXXXXXXXX.....',
  '..XXXXXXXXXXXX....',
  '.XXDDDDDDDDDDXX...',
  '.XXDAADDDDDDDXX...',
  '..XXXXXXXXXXXX....',
  '....X......X......',
  '...XX......XX.....',
];
export const DRONE_UP: PixelMatrix = outlined(['.XXXXX....XXXXX...', ...DRONE_BODY]);
export const DRONE_DOWN: PixelMatrix = outlined([
  '..XXX......XXX....',
  ...DRONE_BODY.slice(0, 4),
  '.XXDDDDDDDDDDXX...',
  ...DRONE_BODY.slice(5),
]);

export const METEOR: PixelMatrix = outlined([
  '.XXX....AA..........',
  'XXXXXX...AAAA.......',
  'XXXXXXX....AAAAAA...',
  'XXXXXXXX......AAAAAA',
  'XXXXXXXX...AAAAAA...',
  'XXXXXXX..AAAA.......',
  '.XXXXX..AA..........',
]);

export const CELL: PixelMatrix = [
  '..XXX..',
  '.XAAXX.',
  'XAAXXXX',
  'XAXXXXX',
  'XXXXXXX',
  '.XXXXX.',
  '..XXX..',
];

export function matrixSize(m: PixelMatrix): { w: number; h: number } {
  return { w: m[0].length, h: m.length };
}
