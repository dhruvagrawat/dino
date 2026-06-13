import { DinoDef, ModeDef, SkinDef } from './types';

export const DINOS: DinoDef[] = [
  {
    id: 'rex',
    name: 'REX',
    cost: 0,
    tagline: 'The original. Balanced and reliable.',
    ability: 'none',
  },
  {
    id: 'raptor',
    name: 'RAPTOR',
    cost: 600,
    tagline: 'Tap again mid-air for a DOUBLE JUMP.',
    ability: 'doubleJump',
  },
  {
    id: 'tank',
    name: 'TANK',
    cost: 1500,
    tagline: 'Horned and armored. Survives ONE hit per run.',
    ability: 'shield',
  },
];

export const SKINS: SkinDef[] = [
  { id: 'classic', name: 'CLASSIC', cost: 0, body: '#535353', accent: '#8a8a8a' },
  { id: 'neon', name: 'NEON', cost: 300, body: '#16c172', accent: '#a6ffcb' },
  { id: 'lava', name: 'LAVA', cost: 500, body: '#e8590c', accent: '#ffd43b' },
  { id: 'ice', name: 'ICE', cost: 800, body: '#1c7ed6', accent: '#99e9f2' },
  { id: 'gold', name: 'GOLD', cost: 2000, body: '#d4a017', accent: '#fff3bf' },
];

export const MODES: ModeDef[] = [
  {
    id: 'classic',
    name: 'CLASSIC',
    cost: 0,
    tagline: 'The endless desert. Just like you remember it.',
    speedStart: 300,
    speedMax: 680,
    speedPerScore: 0.45,
    gravityMult: 1,
    pointsMult: 1,
    spawnGapMult: 1,
    night: false,
    meteors: false,
  },
  {
    id: 'frenzy',
    name: 'FRENZY',
    cost: 1000,
    tagline: 'Blazing speed, tighter gaps. Earn 2x points.',
    speedStart: 430,
    speedMax: 920,
    speedPerScore: 0.7,
    gravityMult: 1,
    pointsMult: 2,
    spawnGapMult: 0.82,
    night: false,
    meteors: false,
  },
  {
    id: 'moon',
    name: 'MOON',
    cost: 2000,
    tagline: 'Low gravity. Dodge meteors under the stars. 1.5x points.',
    speedStart: 320,
    speedMax: 700,
    speedPerScore: 0.5,
    gravityMult: 0.45,
    pointsMult: 1.5,
    spawnGapMult: 1.25,
    night: true,
    meteors: true,
  },
];

export const dinoById = (id: string) => DINOS.find((d) => d.id === id) ?? DINOS[0];
export const skinById = (id: string) => SKINS.find((s) => s.id === id) ?? SKINS[0];
export const modeById = (id: string) => MODES.find((m) => m.id === id) ?? MODES[0];

// physics
export const GRAVITY = 2600; // px/s^2
export const JUMP_VELOCITY = -880; // px/s
export const FAST_FALL_GRAVITY_MULT = 3.2;
export const PIXEL = 3.2; // sprite pixel size in dp

// day / night palettes
export const DAY = {
  bg: '#f7f7f7',
  ground: '#535353',
  text: '#535353',
  obstacle: '#2f9e44',
  cloud: '#dcdcdc',
};
export const NIGHT = {
  bg: '#1a1b26',
  ground: '#c0caf5',
  text: '#c0caf5',
  obstacle: '#74c476',
  cloud: '#3b3d57',
};

export const FONT = { fontFamily: 'monospace' as const };

// soft elevation presets (iOS shadow* + Android elevation)
export const SHADOW = {
  shadowColor: '#1f2430',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.14,
  shadowRadius: 16,
  elevation: 6,
};
export const SHADOW_SM = {
  shadowColor: '#1f2430',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.1,
  shadowRadius: 7,
  elevation: 3,
};
