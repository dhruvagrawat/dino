import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MODES, RUNNERS, SKINS, UI } from './src/constants';
import { GameScreen } from './src/screens/GameScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { ModesScreen } from './src/screens/ModesScreen';
import { ShopScreen } from './src/screens/ShopScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { DEFAULT_PROFILE, loadProfile, saveProfile } from './src/storage';
import { ModeId, Profile, RunnerId, Screen, SkinId } from './src/types';

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
    (score: number, earned: number, cells: number) => {
      update((p) => ({
        ...p,
        points: p.points + earned,
        totalRuns: p.totalRuns + 1,
        totalScore: p.totalScore + score,
        totalCoins: p.totalCoins + cells,
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

  const buyRunner = (id: RunnerId) => {
    const def = RUNNERS.find((d) => d.id === id)!;
    buy(def.cost, (p) => ({ ...p, unlockedRunners: [...p.unlockedRunners, id], selectedRunner: id }));
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
      <View style={{ flex: 1, backgroundColor: UI.bg }}>
        <StatusBar style="light" />
        <SplashScreen onDone={() => setScreen('menu')} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: UI.bg }}>
      <StatusBar style="light" />
      {screen === 'menu' && <MenuScreen profile={profile} onNavigate={setScreen} />}
      {screen === 'game' && (
        <GameScreen
          key={`${profile.selectedRunner}-${profile.selectedSkin}-${profile.selectedMode}`}
          profile={profile}
          onRunEnd={handleRunEnd}
          onExit={() => setScreen('menu')}
        />
      )}
      {screen === 'shop' && (
        <ShopScreen
          profile={profile}
          onBack={() => setScreen('menu')}
          onBuyRunner={buyRunner}
          onSelectRunner={(id) => select({ selectedRunner: id })}
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
