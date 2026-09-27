import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { PixelSprite } from '../components/PixelSprite';
import { APP_NAME, FONT, PIXEL, SKINS, TAGLINE, UI, glow } from '../constants';
import * as PX from '../pixels';

const { width: W } = Dimensions.get('window');

interface Props {
  onDone: () => void;
}

export function SplashScreen({ onDone }: Props) {
  const fade = useRef(new Animated.Value(0)).current;
  const [runFrame, setRunFrame] = React.useState(0);
  const skin = SKINS[0];

  useEffect(() => {
    const id = setInterval(() => setRunFrame((f) => (f + 1) % 2), 120);
    Animated.sequence([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(900),
      Animated.timing(fade, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start(() => onDone());
    const t = setTimeout(onDone, 2600);
    return () => {
      clearInterval(id);
      clearTimeout(t);
    };
  }, [fade, onDone]);

  return (
    <Animated.View style={[styles.root, { opacity: fade }]}>
      <View style={styles.center}>
        <PixelSprite matrix={runFrame ? PX.VOLT.runB : PX.VOLT.runA} pixel={PIXEL * 1.7} body={skin.body} accent={skin.accent} />
        <Text style={[styles.title, FONT]}>
          {APP_NAME.slice(0, 4)}
          <Text style={{ color: UI.cyan }}>{APP_NAME.slice(4)}</Text>
        </Text>
        <Text style={[styles.sub, FONT]}>{TAGLINE}</Text>
      </View>
      <View style={[styles.ground, glow(UI.cyan)]} />
      <Text style={[styles.loading, FONT]}>BOOTING…</Text>
      <Text style={[styles.credit, FONT]}>made with ♥ by quadcydle</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: UI.bg, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center' },
  title: { fontSize: 40, fontWeight: 'bold', letterSpacing: 6, color: UI.text, marginTop: 26 },
  sub: { fontSize: 13, letterSpacing: 4, color: UI.dim, marginTop: 8 },
  ground: { position: 'absolute', bottom: 120, left: 0, width: W, height: 2, backgroundColor: UI.cyan, opacity: 0.6 },
  loading: { position: 'absolute', bottom: 70, fontSize: 12, letterSpacing: 3, color: UI.dim },
  credit: { position: 'absolute', bottom: 36, fontSize: 10, letterSpacing: 1, color: UI.dim, opacity: 0.7 },
});
