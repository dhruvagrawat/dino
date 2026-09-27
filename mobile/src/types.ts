export type RunnerId = 'volt' | 'zip' | 'brick' | 'nova';
export type SkinId = 'classic' | 'neon' | 'lava' | 'ice' | 'gold';
export type ModeId = 'classic' | 'frenzy' | 'moon';

export interface RunnerDef {
  id: RunnerId;
  name: string;
  cost: number;
  tagline: string;
  ability: 'none' | 'doubleJump' | 'shield' | 'magnet';
}

export interface SkinDef {
  id: SkinId;
  name: string;
  cost: number;
  body: string;
  accent: string;
}

export interface ModeDef {
  id: ModeId;
  name: string;
  cost: number;
  tagline: string;
  speedStart: number;
  speedMax: number;
  speedPerScore: number;
  gravityMult: number;
  pointsMult: number;
  spawnGapMult: number;
  meteors: boolean;
}

export interface Profile {
  points: number;
  totalRuns: number;
  totalScore: number;
  totalCoins: number;
  bestScores: Record<ModeId, number>;
  unlockedRunners: RunnerId[];
  unlockedSkins: SkinId[];
  unlockedModes: ModeId[];
  selectedRunner: RunnerId;
  selectedSkin: SkinId;
  selectedMode: ModeId;
}

export type Screen = 'splash' | 'menu' | 'game' | 'shop' | 'modes';
