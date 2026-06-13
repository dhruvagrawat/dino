import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DAY, FONT, MODES } from '../constants';
import { ModeId, Profile } from '../types';

interface Props {
  profile: Profile;
  onBack: () => void;
  onBuyMode: (id: ModeId) => void;
  onSelectMode: (id: ModeId) => void;
}

const MODE_VISUAL: Record<ModeId, { bg: string; accent: string; icon: string }> = {
  classic: { bg: '#f1f3f5', accent: '#535353', icon: '☀' },
  frenzy: { bg: '#fff0f6', accent: '#e8590c', icon: '⚡' },
  moon: { bg: '#1a1b26', accent: '#c0caf5', icon: '☾' },
};

export function ModesScreen({ profile, onBack, onBuyMode, onSelectMode }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={14}>
          <Text style={[styles.back, FONT]}>‹ BACK</Text>
        </Pressable>
        <Text style={[styles.title, FONT]}>MODES</Text>
        <View style={styles.points}>
          <Text style={[styles.pointStar, FONT]}>★</Text>
          <Text style={[styles.pointText, FONT]}>{profile.points}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {MODES.map((m) => {
          const owned = profile.unlockedModes.includes(m.id);
          const selected = profile.selectedMode === m.id;
          const afford = profile.points >= m.cost;
          const v = MODE_VISUAL[m.id];
          const dark = m.id === 'moon';
          const fg = dark ? '#c0caf5' : DAY.ground;
          return (
            <View key={m.id} style={[styles.card, { backgroundColor: v.bg }, selected && { borderColor: v.accent }]}>
              <View style={styles.cardTop}>
                <Text style={[styles.icon, { color: v.accent }]}>{v.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, FONT, { color: fg }]}>{m.name}</Text>
                  <Text style={[styles.best, FONT, { color: fg }]}>BEST {profile.bestScores[m.id]}</Text>
                </View>
                {m.pointsMult > 1 && (
                  <View style={[styles.mult, { backgroundColor: v.accent }]}>
                    <Text style={[styles.multText, FONT]}>×{m.pointsMult}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tagline, FONT, { color: fg }]}>{m.tagline}</Text>
              {selected ? (
                <View style={[styles.btn, { backgroundColor: v.accent }]}>
                  <Text style={[styles.btnText, FONT, { color: dark ? '#1a1b26' : '#fff' }]}>✓ SELECTED</Text>
                </View>
              ) : owned ? (
                <Pressable style={[styles.btn, styles.btnOutline, { borderColor: v.accent }]} onPress={() => onSelectMode(m.id)}>
                  <Text style={[styles.btnText, FONT, { color: v.accent }]}>SELECT</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.btn, { backgroundColor: afford ? v.accent : 'rgba(150,150,150,0.25)' }]}
                  onPress={afford ? () => onBuyMode(m.id) : undefined}
                >
                  <Text style={[styles.btnText, FONT, { color: afford ? (dark ? '#1a1b26' : '#fff') : '#888' }]}>
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
  root: { flex: 1, backgroundColor: DAY.bg, paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  back: { fontSize: 15, letterSpacing: 1, color: DAY.ground, fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: 'bold', letterSpacing: 3, color: DAY.ground },
  points: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff3bf', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18 },
  pointStar: { color: '#f59f00', fontSize: 14, marginRight: 5 },
  pointText: { color: '#b8860b', fontWeight: 'bold', fontSize: 15 },
  list: { gap: 14 },
  card: { borderWidth: 2, borderColor: 'transparent', borderRadius: 16, padding: 18 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  icon: { fontSize: 32, marginRight: 14 },
  name: { fontSize: 22, fontWeight: 'bold', letterSpacing: 2 },
  best: { fontSize: 11, letterSpacing: 1, opacity: 0.55, marginTop: 2 },
  mult: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  multText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  tagline: { fontSize: 13, opacity: 0.7, lineHeight: 18, marginBottom: 14 },
  btn: { paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 2 },
  btnText: { fontWeight: 'bold', fontSize: 14, letterSpacing: 2 },
});
