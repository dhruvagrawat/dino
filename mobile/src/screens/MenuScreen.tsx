import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PixelSprite } from '../components/PixelSprite';
import { PointsBadge } from '../components/PointsBadge';
import {
  APP_NAME,
  FONT,
  MODES,
  PIXEL,
  RUNNERS,
  SHADOW_SM,
  SITE_URL,
  SKINS,
  UI,
  glow,
  modeById,
  runnerById,
  skinById,
} from '../constants';
import * as PX from '../pixels';
import { Profile, Screen } from '../types';

const COMPACT = Dimensions.get('window').height < 720;

interface Props {
  profile: Profile;
  onNavigate: (s: Screen) => void;
}

export function MenuScreen({ profile, onNavigate }: Props) {
  const runner = runnerById(profile.selectedRunner);
  const skin = skinById(profile.selectedSkin);
  const mode = modeById(profile.selectedMode);
  const sprites = PX.RUNNER_SPRITES[runner.id];
  const [frame, setFrame] = useState(0);
  const bob = useRef(new Animated.Value(0)).current;
  const halo = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % 2), 130);
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: -8, duration: 500, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    );
    const b = Animated.loop(
      Animated.sequence([
        Animated.timing(halo, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(halo, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    );
    a.start();
    b.start();
    return () => {
      clearInterval(id);
      a.stop();
      b.stop();
    };
  }, [bob, halo]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={[styles.title, FONT]}>
          {APP_NAME.slice(0, 4)}
          <Text style={{ color: UI.cyan }}>{APP_NAME.slice(4)}</Text>
        </Text>
        <PointsBadge points={profile.points} />
      </View>

      <View style={styles.stage}>
        <Animated.View
          style={[
            styles.halo,
            { backgroundColor: skin.accent, opacity: halo.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.2] }), transform: [{ scale: halo.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.06] }) }] },
          ]}
        />
        <Animated.View style={{ transform: [{ translateY: bob }] }}>
          <PixelSprite matrix={frame ? sprites.runB : sprites.runA} pixel={PIXEL * (COMPACT ? 1.6 : 2.2)} body={skin.body} accent={skin.accent} />
        </Animated.View>
        <View style={[styles.stageGround, { backgroundColor: skin.accent }, glow(skin.accent)]} />
        <Text style={[styles.runnerName, FONT]}>
          {runner.name} <Text style={{ color: UI.dim }}>•</Text> <Text style={{ color: skin.accent }}>{skin.name}</Text>
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.playBtn, glow(UI.primary), { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
        onPress={() => onNavigate('game')}
      >
        <Text style={[styles.playText, FONT]}>▶  PLAY</Text>
        <Text style={[styles.playMode, FONT]}>{mode.name}</Text>
      </Pressable>

      <View style={styles.row}>
        <NavTile label="SHOP" sub="bots & skins" icon="◈" color={UI.pink} onPress={() => onNavigate('shop')} />
        <NavTile label="WORLDS" sub="new modes" icon="◉" color={UI.cyan} onPress={() => onNavigate('modes')} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, flexShrink: 0 }} contentContainerStyle={styles.stats}>
        <Stat label="BEST" value={Math.max(...Object.values(profile.bestScores))} />
        <Stat label="RUNS" value={profile.totalRuns} />
        <Stat label="CELLS" value={profile.totalCoins} />
        <Stat label="BOTS" value={`${profile.unlockedRunners.length}/${RUNNERS.length}`} />
        <Stat label="SKINS" value={`${profile.unlockedSkins.length}/${SKINS.length}`} />
        <Stat label="WORLDS" value={`${profile.unlockedModes.length}/${MODES.length}`} />
      </ScrollView>

      <Text style={[styles.credit, FONT]}>made with ♥ by quadcydle</Text>
      <View style={styles.legalRow}>
        <Pressable hitSlop={8} onPress={() => Linking.openURL(`${SITE_URL}/privacy`)}>
          <Text style={[styles.legalLink, FONT]}>Privacy</Text>
        </Pressable>
        <Text style={[styles.legalDot, FONT]}>·</Text>
        <Pressable hitSlop={8} onPress={() => Linking.openURL(`${SITE_URL}/terms`)}>
          <Text style={[styles.legalLink, FONT]}>Terms</Text>
        </Pressable>
      </View>
    </View>
  );
}

function NavTile({ label, sub, icon, color, onPress }: { label: string; sub: string; icon: string; color: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.tile, { opacity: pressed ? 0.75 : 1 }]} onPress={onPress}>
      <Text style={[styles.tileIcon, FONT, { color }]}>{icon}</Text>
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
  root: { flex: 1, backgroundColor: UI.bg, paddingTop: COMPACT ? 44 : 60, paddingHorizontal: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', letterSpacing: 3, color: UI.text },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: COMPACT ? 170 : 230 },
  halo: { position: 'absolute', width: COMPACT ? 170 : 230, height: COMPACT ? 170 : 230, borderRadius: 115 },
  stageGround: { width: 190, height: 3, borderRadius: 2, marginTop: 4 },
  runnerName: { marginTop: 18, fontSize: 13, letterSpacing: 3, color: UI.text },
  playBtn: { backgroundColor: UI.primary, borderRadius: 26, paddingVertical: COMPACT ? 16 : 22, alignItems: 'center', marginBottom: 16 },
  playText: { color: '#fff', fontSize: 24, fontWeight: 'bold', letterSpacing: 4 },
  playMode: { color: 'rgba(255,255,255,0.8)', fontSize: 11, letterSpacing: 3, marginTop: 4 },
  row: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  tile: { flex: 1, backgroundColor: UI.card, borderWidth: 1, borderColor: UI.line, borderRadius: 22, paddingVertical: COMPACT ? 12 : 18, alignItems: 'center', ...SHADOW_SM },
  tileIcon: { fontSize: 24 },
  tileLabel: { fontSize: 16, fontWeight: 'bold', letterSpacing: 2, color: UI.text, marginTop: 6 },
  tileSub: { fontSize: 10, letterSpacing: 1, color: UI.dim, marginTop: 2 },
  stats: { gap: 10, paddingBottom: 14, paddingTop: 2 },
  stat: { backgroundColor: UI.bgSoft, borderWidth: 1, borderColor: UI.line, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', minWidth: 72 },
  statValue: { fontSize: 17, fontWeight: 'bold', color: UI.text },
  statLabel: { fontSize: 9, letterSpacing: 2, color: UI.dim, marginTop: 2 },
  credit: { textAlign: 'center', fontSize: 10, letterSpacing: 1, color: UI.dim, opacity: 0.7, paddingBottom: 6 },
  legalRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingBottom: 18 },
  legalLink: { fontSize: 10, letterSpacing: 1, color: UI.dim, opacity: 0.8, textDecorationLine: 'underline' },
  legalDot: { fontSize: 10, color: UI.dim },
});
