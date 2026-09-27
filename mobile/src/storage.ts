import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, RunnerId } from './types';

// Key kept from v1 so existing players keep their progress after the update.
const KEY = 'dino.profile.v1';

export const DEFAULT_PROFILE: Profile = {
  points: 0,
  totalRuns: 0,
  totalScore: 0,
  totalCoins: 0,
  bestScores: { classic: 0, frenzy: 0, moon: 0 },
  unlockedRunners: ['volt'],
  unlockedSkins: ['classic'],
  unlockedModes: ['classic'],
  selectedRunner: 'volt',
  selectedSkin: 'classic',
  selectedMode: 'classic',
};

// v1-3 saves stored characters under older ids; map them to the new bots.
const LEGACY_RUNNER: Record<string, RunnerId> = { rex: 'volt', raptor: 'zip', tank: 'brick' };
const toRunner = (id: string): RunnerId => LEGACY_RUNNER[id] ?? (id as RunnerId);

export async function loadProfile(): Promise<Profile> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw);
    const { unlockedDinos, selectedDino, ...rest } = parsed;
    const unlockedRunners: RunnerId[] = Array.from(
      new Set([...(parsed.unlockedRunners ?? unlockedDinos ?? []).map(toRunner), 'volt' as RunnerId])
    );
    // merge so new fields added in updates get defaults
    return {
      ...DEFAULT_PROFILE,
      ...rest,
      unlockedRunners,
      selectedRunner: toRunner(parsed.selectedRunner ?? selectedDino ?? 'volt'),
      bestScores: { ...DEFAULT_PROFILE.bestScores, ...(parsed.bestScores ?? {}) },
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export async function saveProfile(profile: Profile): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // offline-only data; if the write fails there is nothing useful to do
  }
}
