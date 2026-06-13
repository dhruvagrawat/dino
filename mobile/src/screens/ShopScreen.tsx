import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PixelSprite } from '../components/PixelSprite';
import { DAY, DINOS, FONT, PIXEL, SHADOW_SM, SKINS } from '../constants';
import * as PX from '../pixels';
import { DinoId, Profile, SkinId } from '../types';

const DINO_PREVIEW = { rex: PX.REX_RUN_A, raptor: PX.RAPTOR_RUN_A, tank: PX.TANK_RUN_A };

interface Props {
  profile: Profile;
  onBack: () => void;
  onBuyDino: (id: DinoId) => void;
  onSelectDino: (id: DinoId) => void;
  onBuySkin: (id: SkinId) => void;
  onSelectSkin: (id: SkinId) => void;
}

export function ShopScreen({ profile, onBack, onBuyDino, onSelectDino, onBuySkin, onSelectSkin }: Props) {
  const [tab, setTab] = useState<'dinos' | 'skins'>('dinos');
  const selectedSkin = SKINS.find((s) => s.id === profile.selectedSkin)!;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={14}>
          <Text style={[styles.back, FONT]}>‹ BACK</Text>
        </Pressable>
        <Text style={[styles.title, FONT]}>SHOP</Text>
        <View style={styles.points}>
          <Text style={[styles.pointStar, FONT]}>★</Text>
          <Text style={[styles.pointText, FONT]}>{profile.points}</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <Tab label="DINOS" active={tab === 'dinos'} onPress={() => setTab('dinos')} />
        <Tab label="SKINS" active={tab === 'skins'} onPress={() => setTab('skins')} />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {tab === 'dinos'
          ? DINOS.map((d) => {
              const owned = profile.unlockedDinos.includes(d.id);
              const selected = profile.selectedDino === d.id;
              const afford = profile.points >= d.cost;
              return (
                <View key={d.id} style={[styles.card, selected && styles.cardSelected]}>
                  <View style={styles.preview}>
                    <PixelSprite matrix={DINO_PREVIEW[d.id]} pixel={PIXEL * 1.3} body={selectedSkin.body} accent={selectedSkin.accent} eye={DAY.bg} />
                  </View>
                  <View style={styles.info}>
                    <Text style={[styles.name, FONT]}>{d.name}</Text>
                    <Text style={[styles.tagline, FONT]}>{d.tagline}</Text>
                  </View>
                  {renderAction(owned, selected, afford, d.cost, () => onBuyDino(d.id), () => onSelectDino(d.id))}
                </View>
              );
            })
          : SKINS.map((s) => {
              const owned = profile.unlockedSkins.includes(s.id);
              const selected = profile.selectedSkin === s.id;
              const afford = profile.points >= s.cost;
              return (
                <View key={s.id} style={[styles.card, selected && styles.cardSelected]}>
                  <View style={[styles.preview, styles.swatchWrap]}>
                    <View style={[styles.swatch, { backgroundColor: s.body }]} />
                    <View style={[styles.swatch, styles.swatchSmall, { backgroundColor: s.accent }]} />
                  </View>
                  <View style={styles.info}>
                    <Text style={[styles.name, FONT]}>{s.name}</Text>
                    <Text style={[styles.tagline, FONT]}>{s.cost === 0 ? 'Default colors' : 'Premium color set'}</Text>
                  </View>
                  {renderAction(owned, selected, afford, s.cost, () => onBuySkin(s.id), () => onSelectSkin(s.id))}
                </View>
              );
            })}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

function renderAction(
  owned: boolean,
  selected: boolean,
  afford: boolean,
  cost: number,
  buy: () => void,
  select: () => void
) {
  if (selected) {
    return (
      <View style={[styles.actionBtn, styles.equipped]}>
        <Text style={[styles.actionText, FONT, { color: '#fff' }]}>✓ ON</Text>
      </View>
    );
  }
  if (owned) {
    return (
      <Pressable style={[styles.actionBtn, styles.useBtn]} onPress={select}>
        <Text style={[styles.actionText, FONT, { color: DAY.ground }]}>USE</Text>
      </Pressable>
    );
  }
  return (
    <Pressable
      style={[styles.actionBtn, afford ? styles.buyBtn : styles.lockedBtn]}
      onPress={afford ? buy : undefined}
    >
      <Text style={[styles.actionText, FONT, { color: afford ? '#fff' : '#adb5bd' }]}>★ {cost}</Text>
    </Pressable>
  );
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
      <Text style={[styles.tabText, FONT, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DAY.bg, paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  back: { fontSize: 15, letterSpacing: 1, color: DAY.ground, fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: 'bold', letterSpacing: 3, color: DAY.ground },
  points: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff3bf', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 22, ...SHADOW_SM },
  pointStar: { color: '#f59f00', fontSize: 14, marginRight: 5 },
  pointText: { color: '#b8860b', fontWeight: 'bold', fontSize: 15 },
  tabs: { flexDirection: 'row', backgroundColor: '#e9ecef', borderRadius: 16, padding: 5, marginBottom: 18 },
  tab: { flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: '#fff', ...SHADOW_SM },
  tabText: { fontSize: 14, letterSpacing: 2, color: DAY.ground, opacity: 0.5, fontWeight: 'bold' },
  tabTextActive: { opacity: 1 },
  list: { gap: 14 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 2, borderColor: 'transparent', borderRadius: 20, padding: 15, ...SHADOW_SM },
  cardSelected: { borderColor: '#2f9e44' },
  preview: { width: 72, height: 64, alignItems: 'center', justifyContent: 'center' },
  swatchWrap: { flexDirection: 'row', alignItems: 'flex-end' },
  swatch: { width: 34, height: 34, borderRadius: 11 },
  swatchSmall: { width: 20, height: 20, borderRadius: 7, marginLeft: -8, marginBottom: 4 },
  info: { flex: 1, marginLeft: 10 },
  name: { fontSize: 18, fontWeight: 'bold', letterSpacing: 1, color: DAY.ground },
  tagline: { fontSize: 11, color: DAY.ground, opacity: 0.55, marginTop: 3, lineHeight: 15 },
  actionBtn: { minWidth: 64, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 13, alignItems: 'center' },
  buyBtn: { backgroundColor: '#f59f00', ...SHADOW_SM },
  lockedBtn: { backgroundColor: '#f1f3f5' },
  useBtn: { backgroundColor: '#e9ecef' },
  equipped: { backgroundColor: '#2f9e44', ...SHADOW_SM },
  actionText: { fontSize: 13, fontWeight: 'bold', letterSpacing: 1 },
});
