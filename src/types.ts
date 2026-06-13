export type DinoId = 'rex' | 'raptor' | 'tank';
export type SkinId = 'classic' | 'neon' | 'lava' | 'ice' | 'gold';
export type ModeId = 'classic' | 'frenzy' | 'moon';

export interface DinoDef {
  id: DinoId;
  name: string;
  cost: number;
  tagline: string;
  ability: 'none' | 'doubleJump' | 'shield';
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
  night: boolean;
  meteors: boolean;
}

export interface Profile {
  points: number;
  totalRuns: number;
  totalScore: number;
  bestScores: Record<ModeId, number>;
  unlockedDinos: DinoId[];
  unlockedSkins: SkinId[];
  unlockedModes: ModeId[];
  selectedDino: DinoId;
  selectedSkin: SkinId;
  selectedMode: ModeId;
}

export type Screen = 'splash' | 'menu' | 'game' | 'shop' | 'modes';
