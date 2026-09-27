import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PointsBadge } from '../components/PointsBadge';
import { CITY_NIGHT, FONT, MODES, ORBIT, OVERDRIVE, SHADOW, UI } from '../constants';
import { ModeId, Profile } from '../types';

interface Props {
  profile: Profile;
  onBack: () => void;
  onBuyMode: (id: ModeId) => void;
  onSelectMode: (id: ModeId) => void;
}

const MODE_VISUAL: Record<ModeId, { top: string; bottom: string; accent: string; icon: string }> = {
  classic: { top: CITY_NIGHT.skyTop, bottom: CITY_NIGHT.skyBottom, accent: UI.cyan, icon: '▦' },
  frenzy: { top: '#5a1d52', bottom: OVERDRIVE.skyTop, accent: OVERDRIVE.groundLine, icon: '⚡' },
  moon: { top: ORBIT.skyTop, bottom: ORBIT.skyBottom, accent: ORBIT.groundLine, icon: '☾' },
};

export function ModesScreen({ profile, onBack, onBuyMode, onSelectMode }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={14}>
          <Text style={[styles.back, FONT]}>‹ BACK</Text>
        </Pressable>
        <Text style={[styles.title, FONT]}>WORLDS</Text>
        <PointsBadge points={profile.points} />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {MODES.map((m) => {
          const owned = profile.unlockedModes.includes(m.id);
          const selected = profile.selectedMode === m.id;
          const afford = profile.points >= m.cost;
          const v = MODE_VISUAL[m.id];
          return (
            <View key={m.id} style={[styles.card, { backgroundColor: v.top, borderColor: selected ? v.accent : UI.line }]}>
              <View style={[styles.cardGlow, { backgroundColor: v.bottom }]} />
              <View style={styles.cardTop}>
                <Text style={[styles.icon, { color: v.accent }]}>{v.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, FONT]}>{m.name}</Text>
                  <Text style={[styles.best, FONT]}>BEST {profile.bestScores[m.id]}</Text>
                </View>
                {m.pointsMult > 1 && (
                  <View style={[styles.mult, { backgroundColor: v.accent }]}>
                    <Text style={[styles.multText, FONT]}>×{m.pointsMult}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tagline, FONT]}>{m.tagline}</Text>
              {selected ? (
                <View style={[styles.btn, { backgroundColor: v.accent }]}>
                  <Text style={[styles.btnText, FONT, { color: UI.bg }]}>✓ SELECTED</Text>
                </View>
              ) : owned ? (
                <Pressable style={[styles.btn, styles.btnOutline, { borderColor: v.accent }]} onPress={() => onSelectMode(m.id)}>
                  <Text style={[styles.btnText, FONT, { color: v.accent }]}>SELECT</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.btn, { backgroundColor: afford ? UI.gold : 'rgba(255,255,255,0.08)' }]}
                  onPress={afford ? () => onBuyMode(m.id) : undefined}
                >
                  <Text style={[styles.btnText, FONT, { color: afford ? UI.bg : UI.dim }]}>
                    {afford ? `UNLOCK ★ ${m.cost}` : `LOCKED ★ ${m.cost}`}
                  </Text>
                </Pressable>
              )}
            </View>
          );
        })}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: UI.bg, paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  back: { fontSize: 15, letterSpacing: 1, color: UI.dim, fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: 'bold', letterSpacing: 3, color: UI.text },
  list: { gap: 16 },
  card: { borderWidth: 2, borderRadius: 22, padding: 20, overflow: 'hidden', ...SHADOW },
  cardGlow: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%', opacity: 0.55 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  icon: { fontSize: 32, marginRight: 14 },
  name: { fontSize: 22, fontWeight: 'bold', letterSpacing: 2, color: '#fff' },
  best: { fontSize: 11, letterSpacing: 1, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  mult: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  multText: { color: UI.bg, fontWeight: 'bold', fontSize: 14 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 18, marginBottom: 14 },
  btn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  btnOutline: { backgroundColor: 'rgba(15,12,36,0.35)', borderWidth: 2 },
  btnText: { fontWeight: 'bold', fontSize: 14, letterSpacing: 2 },
});
