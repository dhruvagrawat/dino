import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PixelSprite } from '../components/PixelSprite';
import { PointsBadge } from '../components/PointsBadge';
import { FONT, PIXEL, RUNNERS, SHADOW_SM, SKINS, UI, skinById } from '../constants';
import * as PX from '../pixels';
import { Profile, RunnerId, SkinId } from '../types';

interface Props {
  profile: Profile;
  onBack: () => void;
  onBuyRunner: (id: RunnerId) => void;
  onSelectRunner: (id: RunnerId) => void;
  onBuySkin: (id: SkinId) => void;
  onSelectSkin: (id: SkinId) => void;
}

export function ShopScreen({ profile, onBack, onBuyRunner, onSelectRunner, onBuySkin, onSelectSkin }: Props) {
  const [tab, setTab] = useState<'bots' | 'skins'>('bots');
  const selectedSkin = skinById(profile.selectedSkin);
  const selectedSprites = PX.RUNNER_SPRITES[profile.selectedRunner] ?? PX.VOLT;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={14}>
          <Text style={[styles.back, FONT]}>‹ BACK</Text>
        </Pressable>
        <Text style={[styles.title, FONT]}>SHOP</Text>
        <PointsBadge points={profile.points} />
      </View>

      <View style={styles.tabs}>
        <Tab label="BOTS" active={tab === 'bots'} onPress={() => setTab('bots')} />
        <Tab label="SKINS" active={tab === 'skins'} onPress={() => setTab('skins')} />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {tab === 'bots'
          ? RUNNERS.map((d) => {
              const owned = profile.unlockedRunners.includes(d.id);
              const selected = profile.selectedRunner === d.id;
              const afford = profile.points >= d.cost;
              return (
                <View key={d.id} style={[styles.card, selected && styles.cardSelected]}>
                  <View style={styles.preview}>
                    <PixelSprite
                      matrix={PX.RUNNER_SPRITES[d.id].runA}
                      pixel={PIXEL * 0.95}
                      body={owned ? selectedSkin.body : '#4a4380'}
                      accent={owned ? selectedSkin.accent : '#6b63b0'}
                    />
                  </View>
                  <View style={styles.info}>
                    <Text style={[styles.name, FONT]}>{d.name}</Text>
                    <Text style={[styles.tagline, FONT]}>{d.tagline}</Text>
                  </View>
                  {renderAction(owned, selected, afford, d.cost, () => onBuyRunner(d.id), () => onSelectRunner(d.id))}
                </View>
              );
            })
          : SKINS.map((s) => {
              const owned = profile.unlockedSkins.includes(s.id);
              const selected = profile.selectedSkin === s.id;
              const afford = profile.points >= s.cost;
              return (
                <View key={s.id} style={[styles.card, selected && styles.cardSelected]}>
                  <View style={styles.preview}>
                    <PixelSprite matrix={selectedSprites.runA} pixel={PIXEL * 0.95} body={s.body} accent={s.accent} />
                  </View>
                  <View style={styles.info}>
                    <Text style={[styles.name, FONT, { color: s.body }]}>{s.name}</Text>
                    <Text style={[styles.tagline, FONT]}>{s.cost === 0 ? 'Factory finish' : 'Premium paint job'}</Text>
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

function renderAction(owned: boolean, selected: boolean, afford: boolean, cost: number, buy: () => void, select: () => void) {
  if (selected) {
    return (
      <View style={[styles.actionBtn, styles.equipped]}>
        <Text style={[styles.actionText, FONT, { color: UI.bg }]}>✓ ON</Text>
      </View>
    );
  }
  if (owned) {
    return (
      <Pressable style={[styles.actionBtn, styles.useBtn]} onPress={select}>
        <Text style={[styles.actionText, FONT, { color: UI.text }]}>USE</Text>
      </Pressable>
    );
  }
  return (
    <Pressable style={[styles.actionBtn, afford ? styles.buyBtn : styles.lockedBtn]} onPress={afford ? buy : undefined}>
      <Text style={[styles.actionText, FONT, { color: afford ? UI.bg : UI.dim }]}>★ {cost}</Text>
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
  root: { flex: 1, backgroundColor: UI.bg, paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  back: { fontSize: 15, letterSpacing: 1, color: UI.dim, fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: 'bold', letterSpacing: 3, color: UI.text },
  tabs: { flexDirection: 'row', backgroundColor: UI.bgSoft, borderWidth: 1, borderColor: UI.line, borderRadius: 16, padding: 5, marginBottom: 18 },
  tab: { flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: UI.primary },
  tabText: { fontSize: 14, letterSpacing: 2, color: UI.dim, fontWeight: 'bold' },
  tabTextActive: { color: '#fff' },
  list: { gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: UI.card, borderWidth: 1, borderColor: UI.line, borderRadius: 20, padding: 14, ...SHADOW_SM },
  cardSelected: { borderColor: UI.cyan, borderWidth: 2 },
  preview: { width: 72, height: 76, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: 10 },
  name: { fontSize: 18, fontWeight: 'bold', letterSpacing: 1, color: UI.text },
  tagline: { fontSize: 11, color: UI.dim, marginTop: 3, lineHeight: 15 },
  actionBtn: { minWidth: 64, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 13, alignItems: 'center' },
  buyBtn: { backgroundColor: UI.gold },
  lockedBtn: { backgroundColor: UI.bgSoft },
  useBtn: { backgroundColor: UI.cardHi, borderWidth: 1, borderColor: UI.line },
  equipped: { backgroundColor: UI.cyan },
  actionText: { fontSize: 13, fontWeight: 'bold', letterSpacing: 1 },
});
