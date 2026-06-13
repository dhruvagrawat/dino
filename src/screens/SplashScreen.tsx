import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import { PixelSprite } from '../components/PixelSprite';
import { DAY, FONT, PIXEL } from '../constants';
import * as PX from '../pixels';

const { width: W } = Dimensions.get('window');

interface Props {
  onDone: () => void;
}

export function SplashScreen({ onDone }: Props) {
  const fade = useRef(new Animated.Value(0)).current;
  const dust = useRef(new Animated.Value(0)).current;
  const [runFrame, setRunFrame] = React.useState(0);

  useEffect(() => {
    const id = setInterval(() => setRunFrame((f) => (f + 1) % 2), 120);
    Animated.sequence([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(900),
      Animated.timing(fade, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start(() => onDone());
    Animated.loop(
      Animated.timing(dust, { toValue: 1, duration: 600, easing: Easing.linear, useNativeDriver: true })
    ).start();
    const t = setTimeout(onDone, 2600);
    return () => {
      clearInterval(id);
      clearTimeout(t);
    };
  }, [fade, dust, onDone]);

  return (
    <Animated.View style={[styles.root, { opacity: fade }]}>
      <View style={styles.center}>
        <PixelSprite
          matrix={runFrame ? PX.REX_RUN_B : PX.REX_RUN_A}
          pixel={PIXEL * 1.7}
          body={DAY.ground}
          eye={DAY.bg}
        />
        <Text style={[styles.title, FONT]}>DINO</Text>
        <Text style={[styles.sub, FONT]}>tap • run • survive</Text>
      </View>
      <View style={styles.ground} />
      <Text style={[styles.loading, FONT]}>LOADING…</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DAY.bg, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center' },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 6,
    color: DAY.ground,
    marginTop: 26,
  },
  sub: { fontSize: 13, letterSpacing: 4, color: DAY.ground, opacity: 0.5, marginTop: 8 },
  ground: { position: 'absolute', bottom: 120, left: 0, width: W, height: 2, backgroundColor: DAY.ground, opacity: 0.4 },
  loading: { position: 'absolute', bottom: 70, fontSize: 12, letterSpacing: 3, color: DAY.ground, opacity: 0.5 },
});
