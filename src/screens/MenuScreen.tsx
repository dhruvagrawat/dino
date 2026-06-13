import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PixelSprite } from '../components/PixelSprite';
import { DAY, FONT, PIXEL, dinoById, modeById, skinById } from '../constants';
import * as PX from '../pixels';
import { Profile, Screen } from '../types';

const SPRITES = {
  rex: [PX.REX_RUN_A, PX.REX_RUN_B],
  raptor: [PX.RAPTOR_RUN_A, PX.RAPTOR_RUN_B],
  tank: [PX.TANK_RUN_A, PX.TANK_RUN_B],
};

interface Props {
  profile: Profile;
  onNavigate: (s: Screen) => void;
}

export function MenuScreen({ profile, onNavigate }: Props) {
  const dino = dinoById(profile.selectedDino);
  const skin = skinById(profile.selectedSkin);
  const mode = modeById(profile.selectedMode);
  const [frame, setFrame] = useState(0);
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % 2), 130);
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: -8, duration: 500, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    ).start();
    return () => clearInterval(id);
  }, [bob]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={[styles.title, FONT]}>DINO DASH</Text>
        <View style={styles.points}>
          <Text style={[styles.pointStar, FONT]}>★</Text>
          <Text style={[styles.pointText, FONT]}>{profile.points}</Text>
        </View>
      </View>

      <View style={styles.stage}>
        <Animated.View style={{ transform: [{ translateY: bob }] }}>
          <PixelSprite
            matrix={SPRITES[dino.id][frame]}
            pixel={PIXEL * 2.4}
            body={skin.body}
            accent={skin.accent}
            eye={DAY.bg}
          />
        </Animated.View>
        <View style={styles.stageGround} />
        <Text style={[styles.dinoName, FONT]}>{dino.name} • {skin.name}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.playBtn, { backgroundColor: skin.body, opacity: pressed ? 0.85 : 1 }]}
        onPress={() => onNavigate('game')}
      >
        <Text style={[styles.playText, FONT]}>▶  PLAY</Text>
        <Text style={[styles.playMode, FONT]}>{mode.name} MODE</Text>
      </Pressable>

      <View style={styles.row}>
        <NavTile label="SHOP" sub="dinos & skins" emoji="◈" onPress={() => onNavigate('shop')} />
        <NavTile label="MODES" sub="new worlds" emoji="◉" onPress={() => onNavigate('modes')} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stats}>
        <Stat label="BEST" value={Math.max(...Object.values(profile.bestScores))} />
        <Stat label="RUNS" value={profile.totalRuns} />
        <Stat label="DINOS" value={`${profile.unlockedDinos.length}/3`} />
        <Stat label="SKINS" value={`${profile.unlockedSkins.length}/5`} />
        <Stat label="MODES" value={`${profile.unlockedModes.length}/3`} />
      </ScrollView>
    </View>
  );
}

function NavTile({ label, sub, emoji, onPress }: { label: string; sub: string; emoji: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.tile, { opacity: pressed ? 0.7 : 1 }]} onPress={onPress}>
      <Text style={[styles.tileEmoji, FONT]}>{emoji}</Text>
      <Text style={[styles.tileLabel, FONT]}>{label}</Text>
      <Text style={[styles.tileSub, FONT]}>{sub}</Text>
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, FONT]}>{value}</Text>
      <Text style={[styles.statLabel, FONT]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DAY.bg, paddingTop: 60, paddingHorizontal: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', letterSpacing: 3, color: DAY.ground },
  points: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff3bf', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  pointStar: { color: '#f59f00', fontSize: 16, marginRight: 6 },
  pointText: { color: '#b8860b', fontWeight: 'bold', fontSize: 16 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 220 },
  stageGround: { width: 200, height: 2, backgroundColor: DAY.ground, opacity: 0.35, marginTop: 4 },
  dinoName: { marginTop: 16, fontSize: 13, letterSpacing: 3, color: DAY.ground, opacity: 0.6 },
  playBtn: { borderRadius: 16, paddingVertical: 20, alignItems: 'center', marginBottom: 16 },
  playText: { color: '#fff', fontSize: 24, fontWeight: 'bold', letterSpacing: 4 },
  playMode: { color: 'rgba(255,255,255,0.8)', fontSize: 11, letterSpacing: 3, marginTop: 4 },
  row: { flexDirection: 'row', gap: 14, marginBottom: 18 },
  tile: { flex: 1, backgroundColor: '#fff', borderWidth: 2, borderColor: '#e9ecef', borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  tileEmoji: { fontSize: 24, color: DAY.ground },
  tileLabel: { fontSize: 16, fontWeight: 'bold', letterSpacing: 2, color: DAY.ground, marginTop: 6 },
  tileSub: { fontSize: 10, letterSpacing: 1, color: DAY.ground, opacity: 0.5, marginTop: 2 },
  stats: { gap: 10, paddingBottom: 30, paddingTop: 2 },
  stat: { backgroundColor: '#f1f3f5', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10, alignItems: 'center', minWidth: 70 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: DAY.ground },
  statLabel: { fontSize: 9, letterSpacing: 2, color: DAY.ground, opacity: 0.5, marginTop: 2 },
});
