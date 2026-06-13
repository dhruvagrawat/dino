// Pixel-art sprite matrices.
// '.' = transparent, 'X' = body color, 'A' = accent color, 'E' = eye (white)

export type PixelMatrix = string[];

// ---------------------------------------------------------------- T-REX
export const REX_RUN_A: PixelMatrix = [
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

export const REX_RUN_B: PixelMatrix = [
  ...REX_RUN_A.slice(0, 17),
  '.....XXX...XX.......',
  '......XX...XX.......',
  '......XXX..XXX......',
];

export const REX_JUMP: PixelMatrix = [
  ...REX_RUN_A.slice(0, 17),
  '.....XX...XX........',
  '.....XX...XX........',
  '.....XXX..XXX.......',
];

export const REX_DEAD: PixelMatrix = [
  '..........XXXXXXXXX.',
  '.........XXAXAXXXXX.',
  '.........XXXXXXXXXX.',
  ...REX_RUN_A.slice(3, 17),
  '.....XX...XX........',
  '.....XX...XX........',
  '.....XXX..XXX.......',
];

export const REX_DUCK_A: PixelMatrix = [
  '....................XXXXXXX',
  '...................XXEXXXXX',
  '...................XXXXXXXX',
  'X..................XXXXX...',
  'XX......XXXXXXXXXXXXXXXXXX.',
  'XXX..XXXXXXXXXXXXXXXXXX....',
  'XXXXXXXXXXXXXXXXXXXXXXX....',
  '.XXXXXXXXXXXXXXXXXXXX.X....',
  '..XXXXXXXXXXXXXXXXXX.......',
  '....XXXXXXXXXXXXXX.........',
  '......XX....XXX............',
  '......XX.....XX............',
  '......XXX....XXX...........',
];

export const REX_DUCK_B: PixelMatrix = [
  ...REX_DUCK_A.slice(0, 10),
  '......XXX...XX.............',
  '.......XX...XX.............',
  '.......XXX..XXX............',
];

// ---------------------------------------------------------------- RAPTOR (slim, striped)
export const RAPTOR_RUN_A: PixelMatrix = [
  '...........XXXXXXXX.',
  '..........XXEXXXXXX.',
  '..........XXXXXXXXX.',
  '..........XXXXAA....',
  '..........XXXX......',
  '..........XXXXXXX...',
  'X........XXXXX......',
  'XX......XXXXXX......',
  '.XX....XXXXXXXX.....',
  '..XX..XXXAXXXXX.....',
  '...XXXXXXXXAXXXX.X..',
  '....XXXXXAXXXXXXXX..',
  '.....XXXXXXAXXXX....',
  '......XXXXXXXXX.....',
  '.......XXXXXXX......',
  '.......XXXXXX.......',
  '.......XXXXXX.......',
  '.......XX..XXX......',
  '.......XX...XX......',
  '.......XXX..XXX.....',
];

export const RAPTOR_RUN_B: PixelMatrix = [
  ...RAPTOR_RUN_A.slice(0, 17),
  '.......XXX..XX......',
  '........XX..XX......',
  '........XXX.XXX.....',
];

export const RAPTOR_JUMP: PixelMatrix = [
  ...RAPTOR_RUN_A.slice(0, 17),
  '.......XX...XX......',
  '.......XX...XX......',
  '.......XXX..XXX.....',
];

export const RAPTOR_DEAD: PixelMatrix = [
  '...........XXXXXXXX.',
  '..........XXAXAXXXX.',
  ...RAPTOR_RUN_A.slice(2, 17),
  '.......XX...XX......',
  '.......XX...XX......',
  '.......XXX..XXX.....',
];

export const RAPTOR_DUCK_A: PixelMatrix = REX_DUCK_A;
export const RAPTOR_DUCK_B: PixelMatrix = REX_DUCK_B;

// ---------------------------------------------------------------- TANK (triceratops, horned & bulky)
export const TANK_RUN_A: PixelMatrix = [
  '........A....A......',
  '........AA..AA......',
  '........XXXXXXXXX...',
  '.......XXEXXXXXXXX..',
  '......AXXXXXXXXXXX..',
  '.....AAXXXXXXXXXXX..',
  '......AXXXXXXX......',
  'X....XXXXXXXXXXX....',
  'XX..XXXXXXXXXXXX....',
  'XXXXXXXXXXXXXXXXX...',
  'XXXXXXXXXXXXXXXXXX..',
  'XXXXXXXXXXXXXXXXXX..',
  'XXXXXXXXXXXXXXXX....',
  '.XXXXXXXXXXXXXXX....',
  '..XXXXXXXXXXXXX.....',
  '...XXXXXXXXXXX......',
  '....XXXXXXXXX.......',
  '....XXX...XXXX......',
  '....XXX....XXX......',
  '....XXXX...XXXX.....',
];

export const TANK_RUN_B: PixelMatrix = [
  ...TANK_RUN_A.slice(0, 17),
  '....XXXX...XXX......',
  '.....XXX...XXX......',
  '.....XXXX..XXXX.....',
];

export const TANK_JUMP: PixelMatrix = [
  ...TANK_RUN_A.slice(0, 17),
  '....XXX....XXX......',
  '....XXX....XXX......',
  '....XXXX...XXXX.....',
];

export const TANK_DEAD: PixelMatrix = [
  TANK_RUN_A[0],
  TANK_RUN_A[1],
  '........XXXXXXXXX...',
  '.......XXAXAXXXXXX..',
  ...TANK_RUN_A.slice(4, 17),
  '....XXX....XXX......',
  '....XXX....XXX......',
  '....XXXX...XXXX.....',
];

export const TANK_DUCK_A: PixelMatrix = REX_DUCK_A;
export const TANK_DUCK_B: PixelMatrix = REX_DUCK_B;

// ---------------------------------------------------------------- OBSTACLES
export const CACTUS_SMALL: PixelMatrix = [
  '....XX....',
  '...XXXX...',
  '...XXXX...',
  '.X.XXXX.X.',
  'XX.XXXX.XX',
  'XX.XXXX.XX',
  'XX.XXXX.XX',
  'XXXXXXX.XX',
  '.XXXXXXXXX',
  '...XXXX...',
  '...XXXX...',
  '...XXXX...',
  '...XXXX...',
  '...XXXX...',
  '...XXXX...',
  '...XXXX...',
];

export const CACTUS_LARGE: PixelMatrix = [
  '.....XXX......',
  '....XXXXX.....',
  '....XXXXX.....',
  '.XX.XXXXX.....',
  'XXX.XXXXX.XX..',
  'XXX.XXXXX.XXX.',
  'XXX.XXXXX.XXX.',
  'XXX.XXXXX.XXX.',
  'XXX.XXXXX.XXX.',
  'XXXXXXXXX.XXX.',
  '.XXXXXXXX.XXX.',
  '....XXXXXXXXX.',
  '....XXXXXXXX..',
  '....XXXXX.....',
  '....XXXXX.....',
  '....XXXXX.....',
  '....XXXXX.....',
  '....XXXXX.....',
  '....XXXXX.....',
  '....XXXXX.....',
  '....XXXXX.....',
  '....XXXXX.....',
];

export const BIRD_UP: PixelMatrix = [
  '..........X.........',
  '..........XX........',
  '..........XXX.......',
  '..........XXXX......',
  '..........XXXXX.....',
  'XXXX...XXXXXXXXXXXX.',
  '.XXXXXXXXXXXXXXXXXXX',
  '..XXXXXXXXXXXXXX....',
  '...XXXXXXXXXXX......',
];

export const BIRD_DOWN: PixelMatrix = [
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  'XXXX...XXXXXXXXXXXX.',
  '.XXXXXXXXXXXXXXXXXXX',
  '..XXXXXXXXXXXXXX....',
  '...XXXXXXXXXXX......',
  '..........XXXX......',
  '..........XXX.......',
  '..........XX........',
  '..........X.........',
];

export const METEOR: PixelMatrix = [
  '..........AA....XXX.',
  '.......AAAA...XXXXXX',
  '...AAAAAA....XXXXXXX',
  'AAAAAA......XXXXXXXX',
  '...AAAAAA...XXXXXXXX',
  '.......AAAA..XXXXXXX',
  '..........AA..XXXXX.',
];

export const ROCK: PixelMatrix = [
  '...XXXX...',
  '..XXXXXX..',
  '.XXXXXXXX.',
  'XXXXXXXXXX',
  'XXXXXXXXXX',
  'XXXXXXXXXX',
];

export function matrixSize(m: PixelMatrix): { w: number; h: number } {
  return { w: m[0].length, h: m.length };
}
