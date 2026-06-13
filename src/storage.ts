import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile } from './types';

const KEY = 'dino.profile.v1';

export const DEFAULT_PROFILE: Profile = {
  points: 0,
  totalRuns: 0,
  totalScore: 0,
  bestScores: { classic: 0, frenzy: 0, moon: 0 },
  unlockedDinos: ['rex'],
  unlockedSkins: ['classic'],
  unlockedModes: ['classic'],
  selectedDino: 'rex',
  selectedSkin: 'classic',
  selectedMode: 'classic',
};

export async function loadProfile(): Promise<Profile> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw);
    // merge so new fields added in updates get defaults
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
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
