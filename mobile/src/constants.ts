import { ModeDef, ModeId, RunnerDef, SkinDef } from './types';

export const APP_NAME = 'VOLTBOT';
export const TAGLINE = 'jump • dash • glow';
export const SITE_URL = 'https://dino.dhruvagrawat.com';

export const RUNNERS: RunnerDef[] = [
  {
    id: 'volt',
    name: 'VOLT',
    cost: 0,
    tagline: 'The original bot. Balanced and reliable.',
    ability: 'none',
  },
  {
    id: 'zip',
    name: 'ZIP',
    cost: 600,
    tagline: 'Jet boots! Tap again mid-air for a DOUBLE JUMP.',
    ability: 'doubleJump',
  },
  {
    id: 'brick',
    name: 'BRICK',
    cost: 1500,
    tagline: 'Heavy plating. Survives ONE hit per run.',
    ability: 'shield',
  },
  {
    id: 'nova',
    name: 'NOVA',
    cost: 3000,
    tagline: 'Built-in magnet. Pulls in every cell nearby.',
    ability: 'magnet',
  },
];

export const SKINS: SkinDef[] = [
  { id: 'classic', name: 'CORE', cost: 0, body: '#eeeaff', accent: '#2ee6d6' },
  { id: 'neon', name: 'TOXIC', cost: 300, body: '#a3ff4f', accent: '#ff4fd8' },
  { id: 'lava', name: 'SUNSET', cost: 500, body: '#ff8a3d', accent: '#ffe14f' },
  { id: 'ice', name: 'FROST', cost: 800, body: '#6fd3ff', accent: '#ffffff' },
  { id: 'gold', name: 'GOLD', cost: 2000, body: '#ffc933', accent: '#ff5fd2' },
];

export const MODES: ModeDef[] = [
  {
    id: 'classic',
    name: 'NEON CITY',
    cost: 0,
    tagline: 'Race across the rooftops as day fades into a neon night.',
    speedStart: 300,
    speedMax: 700,
    speedPerScore: 0.45,
    gravityMult: 1,
    pointsMult: 1,
    spawnGapMult: 1,
    meteors: false,
  },
  {
    id: 'frenzy',
    name: 'OVERDRIVE',
    cost: 1000,
    tagline: 'Sunset highway at blazing speed. Tighter gaps, 2x points.',
    speedStart: 430,
    speedMax: 940,
    speedPerScore: 0.7,
    gravityMult: 1,
    pointsMult: 2,
    spawnGapMult: 0.82,
    meteors: false,
  },
  {
    id: 'moon',
    name: 'ORBIT',
    cost: 2000,
    tagline: 'Low gravity in deep space. Dodge meteors for 1.5x points.',
    speedStart: 320,
    speedMax: 720,
    speedPerScore: 0.5,
    gravityMult: 0.45,
    pointsMult: 1.5,
    spawnGapMult: 1.25,
    meteors: true,
  },
];

export const runnerById = (id: string) => RUNNERS.find((d) => d.id === id) ?? RUNNERS[0];
export const skinById = (id: string) => SKINS.find((s) => s.id === id) ?? SKINS[0];
export const modeById = (id: string) => MODES.find((m) => m.id === id) ?? MODES[0];

// physics
export const GRAVITY = 2600; // px/s^2
export const JUMP_VELOCITY = -880; // px/s
export const JUMP_CUT_VELOCITY = -430; // releasing early caps upward speed -> short hop
export const FAST_FALL_GRAVITY_MULT = 3.2;
export const PIXEL = 3.2; // sprite pixel size in dp

// economy
export const COIN_VALUE = 5; // points per energy cell
export const POWER_DURATION = 7; // seconds

// app-wide UI palette (dark neon)
export const UI = {
  bg: '#0f0c24',
  bgSoft: '#17123a',
  card: '#1d1745',
  cardHi: '#262057',
  line: '#2f2868',
  text: '#ecebff',
  dim: '#8f89c9',
  primary: '#7c5cff',
  cyan: '#2ee6d6',
  pink: '#ff4fd8',
  gold: '#ffc933',
  green: '#3ddc84',
  outline: '#120e24',
  visor: '#231b4a',
};

// in-game world palettes
export interface Theme {
  skyTop: string;
  skyBottom: string;
  sun: string;
  far: string;
  near: string;
  window: string;
  ground: string;
  groundLine: string;
  grid: string;
  text: string;
  obstacle: string;
  obstacleAccent: string;
  starAlpha: number;
}

export const CITY_DAY: Theme = {
  skyTop: '#5ab8ff',
  skyBottom: '#ffd3ea',
  sun: '#fff1a8',
  far: '#b5a9ff',
  near: '#8c7cf2',
  window: '#fff6c9',
  ground: '#2a2150',
  groundLine: '#ff5fd2',
  grid: '#3d3078',
  text: '#1b1640',
  obstacle: '#ff4f7b',
  obstacleAccent: '#ffe14f',
  starAlpha: 0,
};

export const CITY_NIGHT: Theme = {
  skyTop: '#07061a',
  skyBottom: '#3b1a63',
  sun: '#f1eaff',
  far: '#1f1845',
  near: '#2e2366',
  window: '#ffd84f',
  ground: '#120e2a',
  groundLine: '#2ee6d6',
  grid: '#2c2360',
  text: '#ecebff',
  obstacle: '#ff4f7b',
  obstacleAccent: '#ffe14f',
  starAlpha: 1,
};

export const OVERDRIVE: Theme = {
  skyTop: '#ff3d6e',
  skyBottom: '#ffc24f',
  sun: '#fff1b8',
  far: '#d23a70',
  near: '#8a1f55',
  window: '#ffe38a',
  ground: '#2b0f2e',
  groundLine: '#ffe14f',
  grid: '#5a1d52',
  text: '#ffffff',
  obstacle: '#2ee6d6',
  obstacleAccent: '#15102b',
  starAlpha: 0,
};

export const ORBIT: Theme = {
  skyTop: '#03040d',
  skyBottom: '#1c2152',
  sun: '#ff9f6e',
  far: '#171b44',
  near: '#252b63',
  window: '#9ab4ff',
  ground: '#1a1d45',
  groundLine: '#9ab4ff',
  grid: '#2c3372',
  text: '#dfe6ff',
  obstacle: '#9ab4ff',
  obstacleAccent: '#ff5fd2',
  starAlpha: 1,
};

export const MODE_THEME: Record<ModeId, Theme> = {
  classic: CITY_DAY,
  frenzy: OVERDRIVE,
  moon: ORBIT,
};

export const FONT = { fontFamily: 'monospace' as const };

// soft glow / elevation presets (iOS shadow* + Android elevation)
export const SHADOW = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.35,
  shadowRadius: 18,
  elevation: 8,
};
export const SHADOW_SM = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 8,
  elevation: 4,
};
export const glow = (color: string) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.7,
  shadowRadius: 14,
  elevation: 8,
});
