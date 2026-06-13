import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { DINOS, MODES, SKINS } from './src/constants';
import { GameScreen } from './src/screens/GameScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { ModesScreen } from './src/screens/ModesScreen';
import { ShopScreen } from './src/screens/ShopScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { DEFAULT_PROFILE, loadProfile, saveProfile } from './src/storage';
import { DinoId, ModeId, Profile, Screen, SkinId } from './src/types';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadProfile().then((p) => {
      setProfile(p);
      setLoaded(true);
    });
  }, []);

  const update = useCallback((mutator: (p: Profile) => Profile) => {
    setProfile((prev) => {
      const next = mutator(prev);
      saveProfile(next);
      return next;
    });
  }, []);

  const handleRunEnd = useCallback(
    (score: number, earned: number) => {
      update((p) => ({
        ...p,
        points: p.points + earned,
        totalRuns: p.totalRuns + 1,
        totalScore: p.totalScore + score,
        bestScores: { ...p.bestScores, [p.selectedMode]: Math.max(p.bestScores[p.selectedMode], score) },
      }));
    },
    [update]
  );

  const buy = useCallback(
    (cost: number, apply: (p: Profile) => Profile) => {
      update((p) => {
        if (p.points < cost) return p;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        return apply({ ...p, points: p.points - cost });
      });
    },
    [update]
  );

  const buyDino = (id: DinoId) => {
    const def = DINOS.find((d) => d.id === id)!;
    buy(def.cost, (p) => ({ ...p, unlockedDinos: [...p.unlockedDinos, id], selectedDino: id }));
  };
  const buySkin = (id: SkinId) => {
    const def = SKINS.find((s) => s.id === id)!;
    buy(def.cost, (p) => ({ ...p, unlockedSkins: [...p.unlockedSkins, id], selectedSkin: id }));
  };
  const buyMode = (id: ModeId) => {
    const def = MODES.find((m) => m.id === id)!;
    buy(def.cost, (p) => ({ ...p, unlockedModes: [...p.unlockedModes, id], selectedMode: id }));
  };

  const select = (patch: Partial<Profile>) => {
    Haptics.selectionAsync().catch(() => {});
    update((p) => ({ ...p, ...patch }));
  };

  if (screen === 'splash' || !loaded) {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <SplashScreen onDone={() => setScreen('menu')} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={profile.selectedMode === 'moon' && screen === 'game' ? 'light' : 'dark'} />
      {screen === 'menu' && <MenuScreen profile={profile} onNavigate={setScreen} />}
      {screen === 'game' && (
        <GameScreen
          key={`${profile.selectedDino}-${profile.selectedSkin}-${profile.selectedMode}`}
          profile={profile}
          onRunEnd={handleRunEnd}
          onExit={() => setScreen('menu')}
        />
      )}
      {screen === 'shop' && (
        <ShopScreen
          profile={profile}
          onBack={() => setScreen('menu')}
          onBuyDino={buyDino}
          onSelectDino={(id) => select({ selectedDino: id })}
          onBuySkin={buySkin}
          onSelectSkin={(id) => select({ selectedSkin: id })}
        />
      )}
      {screen === 'modes' && (
        <ModesScreen
          profile={profile}
          onBack={() => setScreen('menu')}
          onBuyMode={buyMode}
          onSelectMode={(id) => select({ selectedMode: id })}
        />
      )}
    </View>
  );
}
