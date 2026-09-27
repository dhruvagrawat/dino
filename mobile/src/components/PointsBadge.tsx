import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FONT, UI } from '../constants';

export function PointsBadge({ points }: { points: number }) {
  return (
    <View style={styles.points}>
      <Text style={[styles.star, FONT]}>★</Text>
      <Text style={[styles.text, FONT]}>{points}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  points: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,201,51,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,201,51,0.45)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 22,
  },
  star: { color: UI.gold, fontSize: 15, marginRight: 6 },
  text: { color: UI.gold, fontWeight: 'bold', fontSize: 15 },
});
