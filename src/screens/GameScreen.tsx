import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PixelSprite } from '../components/PixelSprite';
import {
  DAY,
  FAST_FALL_GRAVITY_MULT,
  FONT,
  GRAVITY,
  JUMP_VELOCITY,
  NIGHT,
  PIXEL,
  dinoById,
  modeById,
  skinById,
} from '../constants';
import * as PX from '../pixels';
import { Profile } from '../types';

const { width: W, height: H } = Dimensions.get('window');
const GROUND_Y = H * 0.68; // y of the ground line
const DINO_X = 28;
const HIT_PAD = 7; // forgiving hitboxes

type ObstacleKind = 'cactusS' | 'cactusL' | 'bird' | 'meteor' | 'rock';

interface Obstacle {
  kind: ObstacleKind;
  x: number;
  bottomOffset: number; // distance of sprite bottom above ground
  w: number;
  h: number;
  speedMult: number;
}

interface Cloud {
  x: number;
  y: number;
  scale: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
}

const SPRITES = {
  rex: { runA: PX.REX_RUN_A, runB: PX.REX_RUN_B, jump: PX.REX_JUMP, dead: PX.REX_DEAD, duckA: PX.REX_DUCK_A, duckB: PX.REX_DUCK_B },
  raptor: { runA: PX.RAPTOR_RUN_A, runB: PX.RAPTOR_RUN_B, jump: PX.RAPTOR_JUMP, dead: PX.RAPTOR_DEAD, duckA: PX.RAPTOR_DUCK_A, duckB: PX.RAPTOR_DUCK_B },
  tank: { runA: PX.TANK_RUN_A, runB: PX.TANK_RUN_B, jump: PX.TANK_JUMP, dead: PX.TANK_DEAD, duckA: PX.TANK_DUCK_A, duckB: PX.TANK_DUCK_B },
};

function lerpColor(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) + (((pb >> 16) & 255) - ((pa >> 16) & 255)) * t);
  const g = Math.round(((pa >> 8) & 255) + (((pb >> 8) & 255) - ((pa >> 8) & 255)) * t);
  const bl = Math.round((pa & 255) + ((pb & 255) - (pa & 255)) * t);
  return `rgb(${r},${g},${bl})`;
}

function makeClouds(): Cloud[] {
  return Array.from({ length: 4 }, (_, i) => ({
    x: (W / 4) * i + Math.random() * 120,
    y: 60 + Math.random() * (GROUND_Y * 0.45),
    scale: 0.7 + Math.random() * 0.8,
  }));
}

function makeStars(): Star[] {
  return Array.from({ length: 26 }, () => ({
    x: Math.random() * W,
    y: Math.random() * GROUND_Y * 0.8,
    size: 1 + Math.random() * 2.5,
  }));
}

function makeSpecks(): number[] {
  return Array.from({ length: 24 }, () => Math.random() * W * 2);
}

interface Props {
  profile: Profile;
  onRunEnd: (score: number, earned: number) => void;
  onExit: () => void;
}

export function GameScreen({ profile, onRunEnd, onExit }: Props) {
  const dino = dinoById(profile.selectedDino);
  const skin = skinById(profile.selectedSkin);
  const mode = modeById(profile.selectedMode);
  const sprites = SPRITES[dino.id];

  const standSize = { w: sprites.runA[0].length * PIXEL, h: sprites.runA.length * PIXEL };
  const duckSize = { w: sprites.duckA[0].length * PIXEL, h: sprites.duckA.length * PIXEL };

  const g = useRef({
    running: true,
    dead: false,
    paused: false,
    score: 0,
    speed: mode.speedStart,
    dinoBottom: 0, // height of dino feet above ground
    vy: 0,
    jumpsUsed: 0,
    ducking: false,
    shield: dino.ability === 'shield',
    invulnUntil: 0,
    time: 0,
    runFrame: 0,
    obstacles: [] as Obstacle[],
    spawnCountdown: 480,
    clouds: makeClouds(),
    stars: makeStars(),
    specks: makeSpecks(),
    groundOffset: 0,
    nightT: mode.night ? 1 : 0,
    nightTarget: mode.night ? 1 : 0,
    lastMilestone: 0,
    milestoneFlashUntil: 0,
  });

  const [, setTick] = useState(0);
  const [overlay, setOverlay] = useState<'none' | 'dead' | 'paused'>('none');
  const earnedRef = useRef(0);
  const newBestRef = useRef(false);

  const reset = useCallback(() => {
    const s = g.current;
    s.running = true;
    s.dead = false;
    s.paused = false;
    s.score = 0;
    s.speed = mode.speedStart;
    s.dinoBottom = 0;
    s.vy = 0;
    s.jumpsUsed = 0;
    s.ducking = false;
    s.shield = dino.ability === 'shield';
    s.invulnUntil = 0;
    s.time = 0;
    s.obstacles = [];
    s.spawnCountdown = 480;
    s.nightT = mode.night ? 1 : 0;
    s.nightTarget = mode.night ? 1 : 0;
    s.lastMilestone = 0;
    setOverlay('none');
  }, [dino.ability, mode.night, mode.speedStart]);

  const die = useCallback(() => {
    const s = g.current;
    s.dead = true;
    s.running = false;
    const score = Math.floor(s.score);
    const earned = Math.floor(score * mode.pointsMult);
    earnedRef.current = earned;
    newBestRef.current = score > profile.bestScores[mode.id];
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    onRunEnd(score, earned);
    setOverlay('dead');
  }, [mode.id, mode.pointsMult, onRunEnd, profile.bestScores]);

  // main loop
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!last) {
        last = now;
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.04);
      last = now;
      const s = g.current;
      if (!s.running || s.paused) return;

      s.time += dt;
      s.runFrame = Math.floor(s.time / 0.12) % 2;

      // speed & score
      s.speed = Math.min(mode.speedMax, mode.speedStart + s.score * mode.speedPerScore);
      s.score += s.speed * dt * 0.025;
      const flooredScore = Math.floor(s.score);
      if (flooredScore >= s.lastMilestone + 100) {
        s.lastMilestone = flooredScore - (flooredScore % 100);
        s.milestoneFlashUntil = s.time + 0.6;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }

      // day/night cycle (classic & frenzy)
      if (!mode.night) {
        s.nightTarget = Math.floor(flooredScore / 400) % 2 === 1 ? 1 : 0;
      }
      s.nightT += (s.nightTarget - s.nightT) * Math.min(1, dt * 2.5);

      // dino physics
      const gravity = GRAVITY * mode.gravityMult * (s.ducking && s.dinoBottom > 0 ? FAST_FALL_GRAVITY_MULT : 1);
      if (s.dinoBottom > 0 || s.vy < 0) {
        s.vy += gravity * dt;
        s.dinoBottom -= s.vy * dt;
        if (s.dinoBottom <= 0) {
          s.dinoBottom = 0;
          s.vy = 0;
          s.jumpsUsed = 0;
        }
      }

      // ground & clouds
      s.groundOffset = (s.groundOffset + s.speed * dt) % (W * 2);
      for (const c of s.clouds) {
        c.x -= s.speed * 0.25 * dt;
        if (c.x < -120) {
          c.x = W + 40 + Math.random() * 80;
          c.y = 60 + Math.random() * (GROUND_Y * 0.45);
        }
      }

      // spawn obstacles
      s.spawnCountdown -= s.speed * dt;
      if (s.spawnCountdown <= 0) {
        spawnObstacle(s.obstacles, flooredScore, mode.meteors);
        const minGap = Math.max(240, s.speed * 0.55) * mode.spawnGapMult;
        const maxGap = Math.max(420, s.speed * 1.05) * mode.spawnGapMult;
        s.spawnCountdown = minGap + Math.random() * (maxGap - minGap);
      }

      // move obstacles & collide
      const duckNow = s.ducking && s.dinoBottom <= 0;
      const dW = duckNow ? duckSize.w : standSize.w;
      const dH = duckNow ? duckSize.h : standSize.h;
      const dinoLeft = DINO_X + HIT_PAD;
      const dinoRight = DINO_X + dW - HIT_PAD;
      const dinoBottomY = GROUND_Y - s.dinoBottom;
      const dinoTopY = dinoBottomY - dH + HIT_PAD;

      for (let i = s.obstacles.length - 1; i >= 0; i--) {
        const o = s.obstacles[i];
        o.x -= s.speed * o.speedMult * dt;
        if (o.x + o.w < -40) {
          s.obstacles.splice(i, 1);
          continue;
        }
        if (s.time < s.invulnUntil) continue;
        const oLeft = o.x + HIT_PAD;
        const oRight = o.x + o.w - HIT_PAD;
        const oBottomY = GROUND_Y - o.bottomOffset;
        const oTopY = oBottomY - o.h + HIT_PAD;
        const hit = dinoRight > oLeft && dinoLeft < oRight && dinoBottomY > oTopY && dinoTopY < oBottomY;
        if (hit) {
          if (s.shield) {
            s.shield = false;
            s.invulnUntil = s.time + 1.0;
            s.obstacles.splice(i, 1);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
          } else {
            die();
            break;
          }
        }
      }

      setTick((t) => t + 1);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [die, duckSize.h, duckSize.w, mode, standSize.h, standSize.w]);

  const jump = useCallback(() => {
    const s = g.current;
    if (!s.running || s.paused) return;
    const maxJumps = dino.ability === 'doubleJump' ? 2 : 1;
    if (s.dinoBottom <= 0 || s.jumpsUsed < maxJumps) {
      if (s.dinoBottom <= 0) s.jumpsUsed = 0;
      if (s.jumpsUsed < maxJumps) {
        s.vy = JUMP_VELOCITY * (mode.gravityMult < 1 ? 0.78 : 1);
        s.jumpsUsed += 1;
        s.ducking = false;
        Haptics.selectionAsync().catch(() => {});
      }
    }
  }, [dino.ability, mode.gravityMult]);

  const s = g.current;
  const pal = {
    bg: lerpColor(DAY.bg, NIGHT.bg, s.nightT),
    ground: lerpColor(DAY.ground, NIGHT.ground, s.nightT),
    text: lerpColor(DAY.text, NIGHT.text, s.nightT),
    obstacle: lerpColor(DAY.obstacle, NIGHT.obstacle, s.nightT),
    cloud: lerpColor(DAY.cloud, NIGHT.cloud, s.nightT),
  };

  const duckNow = s.ducking && s.dinoBottom <= 0;
  const dinoMatrix = s.dead
    ? sprites.dead
    : duckNow
      ? (s.runFrame ? sprites.duckB : sprites.duckA)
      : s.dinoBottom > 0
        ? sprites.jump
        : s.runFrame
          ? sprites.runB
          : sprites.runA;
  const dinoH = duckNow ? duckSize.h : standSize.h;
  const flashScore = s.time < s.milestoneFlashUntil;
  const best = Math.max(profile.bestScores[mode.id], s.dead ? Math.floor(s.score) : 0);

  return (
    <Pressable style={[styles.root, { backgroundColor: pal.bg }]} onPressIn={jump}>
      {/* stars */}
      {s.nightT > 0.05 &&
        s.stars.map((st, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: st.x,
              top: st.y,
              width: st.size,
              height: st.size,
              borderRadius: 2,
              backgroundColor: `rgba(255,255,255,${0.8 * s.nightT})`,
            }}
          />
        ))}
      {/* moon / sun */}
      <View
        style={{
          position: 'absolute',
          right: 46,
          top: 70,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: s.nightT > 0.5 ? '#f1f3f5' : '#ffd43b',
          opacity: 0.9,
        }}
      />
      {/* clouds */}
      {s.clouds.map((c, i) => (
        <View key={i} style={{ position: 'absolute', left: c.x, top: c.y, opacity: 0.8 }}>
          <View style={{ width: 56 * c.scale, height: 12 * c.scale, borderRadius: 8, backgroundColor: pal.cloud }} />
          <View style={{ width: 30 * c.scale, height: 10 * c.scale, borderRadius: 6, backgroundColor: pal.cloud, marginTop: -16 * c.scale, marginLeft: 12 * c.scale }} />
        </View>
      ))}
      {/* ground */}
      <View style={{ position: 'absolute', top: GROUND_Y, left: 0, right: 0, height: 2, backgroundColor: pal.ground }} />
      {s.specks.map((sx, i) => {
        const span = W * 2;
        const xx = ((sx - s.groundOffset) % span + span) % span - 30;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: xx,
              top: GROUND_Y + 8 + (i % 4) * 5,
              width: i % 3 === 0 ? 10 : 4,
              height: 2,
              backgroundColor: pal.ground,
              opacity: 0.55,
            }}
          />
        );
      })}
      {/* obstacles */}
      {s.obstacles.map((o, i) => {
        const matrix =
          o.kind === 'cactusS' ? PX.CACTUS_SMALL
          : o.kind === 'cactusL' ? PX.CACTUS_LARGE
          : o.kind === 'rock' ? PX.ROCK
          : o.kind === 'meteor' ? PX.METEOR
          : s.runFrame ? PX.BIRD_DOWN : PX.BIRD_UP;
        const color =
          o.kind === 'bird' ? pal.ground
          : o.kind === 'meteor' ? '#fa5252'
          : o.kind === 'rock' ? pal.ground
          : pal.obstacle;
        return (
          <View key={i} style={{ position: 'absolute', left: o.x, top: GROUND_Y - o.bottomOffset - o.h }}>
            <PixelSprite matrix={matrix} pixel={PIXEL} body={color} accent="#ffa94d" />
          </View>
        );
      })}
      {/* dino */}
      <View
        style={{
          position: 'absolute',
          left: DINO_X,
          top: GROUND_Y - s.dinoBottom - dinoH,
          opacity: s.time < s.invulnUntil && Math.floor(s.time * 12) % 2 === 0 ? 0.3 : 1,
        }}
      >
        <PixelSprite matrix={dinoMatrix} pixel={PIXEL} body={skin.body} accent={skin.accent} eye={pal.bg} />
      </View>
      {/* HUD */}
      <View style={styles.hud} pointerEvents="box-none">
        <Pressable
          onPress={() => {
            if (s.dead) return;
            s.paused = !s.paused;
            setOverlay(s.paused ? 'paused' : 'none');
          }}
          hitSlop={12}
        >
          <Text style={[styles.hudText, FONT, { color: pal.text }]}>{overlay === 'paused' ? '▶' : 'II'}</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          {dino.ability === 'shield' && (
            <Text style={[styles.hudText, FONT, { color: s.shield ? pal.text : '#adb5bd', opacity: s.shield ? 1 : 0.4 }]}>♦</Text>
          )}
          <Text style={[styles.hudText, FONT, { color: pal.text, opacity: 0.6 }]}>
            HI {String(profile.bestScores[mode.id]).padStart(5, '0')}
          </Text>
          <Text style={[styles.hudText, FONT, { color: flashScore ? '#fab005' : pal.text }]}>
            {String(Math.floor(s.score)).padStart(5, '0')}
          </Text>
        </View>
      </View>
      <Text style={[styles.modeTag, FONT, { color: pal.text }]}>{mode.name}{mode.pointsMult > 1 ? `  ×${mode.pointsMult} PTS` : ''}</Text>

      {/* duck button */}
      <Pressable
        style={[styles.duckBtn, { borderColor: pal.text }]}
        onPressIn={(e) => {
          e.stopPropagation();
          g.current.ducking = true;
        }}
        onPressOut={() => {
          g.current.ducking = false;
        }}
      >
        <Text style={[FONT, { color: pal.text, fontSize: 18, fontWeight: 'bold' }]}>▼ DUCK</Text>
      </Pressable>

      {/* overlays */}
      {overlay === 'dead' && (
        <View style={styles.overlay}>
          <View style={[styles.card, { backgroundColor: pal.bg, borderColor: pal.text }]}>
            <Text style={[styles.gameOver, FONT, { color: pal.text }]}>G A M E  O V E R</Text>
            <Text style={[styles.bigScore, FONT, { color: pal.text }]}>{String(Math.floor(s.score)).padStart(5, '0')}</Text>
            {newBestRef.current && <Text style={[FONT, styles.newBest]}>★ NEW BEST ★</Text>}
            <Text style={[FONT, styles.earned]}>+{earnedRef.current} PTS</Text>
            <Text style={[FONT, { color: pal.text, opacity: 0.6, marginBottom: 18 }]}>BEST {String(best).padStart(5, '0')}</Text>
            <Pressable style={[styles.btn, { backgroundColor: skin.body }]} onPress={reset}>
              <Text style={[styles.btnText, FONT]}>RESTART</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnGhost, { borderColor: pal.text }]} onPress={onExit}>
              <Text style={[styles.btnText, FONT, { color: pal.text }]}>MENU</Text>
            </Pressable>
          </View>
        </View>
      )}
      {overlay === 'paused' && (
        <View style={styles.overlay} pointerEvents="box-none">
          <Text style={[styles.gameOver, FONT, { color: pal.text }]}>P A U S E D</Text>
          <Pressable
            style={[styles.btn, { backgroundColor: skin.body, marginTop: 20 }]}
            onPress={() => {
              s.paused = false;
              setOverlay('none');
            }}
          >
            <Text style={[styles.btnText, FONT]}>RESUME</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnGhost, { borderColor: pal.text, marginTop: 10 }]} onPress={onExit}>
            <Text style={[styles.btnText, FONT, { color: pal.text }]}>MENU</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

function spawnObstacle(obstacles: Obstacle[], score: number, meteors: boolean) {
  const r = Math.random();
  const airborneAllowed = score > 150;
  if (airborneAllowed && r < 0.3) {
    if (meteors) {
      const { w, h } = PX.matrixSize(PX.METEOR);
      const heights = [10, 52, 86];
      obstacles.push({
        kind: 'meteor',
        x: W + 40,
        bottomOffset: heights[Math.floor(Math.random() * heights.length)],
        w: w * PIXEL,
        h: h * PIXEL,
        speedMult: 1.35,
      });
    } else {
      const { w, h } = PX.matrixSize(PX.BIRD_UP);
      const heights = [0, 50, 92];
      obstacles.push({
        kind: 'bird',
        x: W + 40,
        bottomOffset: heights[Math.floor(Math.random() * heights.length)],
        w: w * PIXEL,
        h: h * PIXEL,
        speedMult: 1.15,
      });
    }
    return;
  }
  const large = score > 80 && Math.random() < 0.4;
  const matrix = large ? PX.CACTUS_LARGE : PX.CACTUS_SMALL;
  const { w, h } = PX.matrixSize(matrix);
  const count = score > 250 && Math.random() < 0.3 ? 2 : 1;
  for (let i = 0; i < count; i++) {
    obstacles.push({
      kind: large ? 'cactusL' : 'cactusS',
      x: W + 40 + i * (w * PIXEL + 8),
      bottomOffset: 0,
      w: w * PIXEL,
      h: h * PIXEL,
      speedMult: 1,
    });
  }
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hud: {
    position: 'absolute',
    top: 54,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hudText: { fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  modeTag: {
    position: 'absolute',
    top: 84,
    right: 20,
    fontSize: 11,
    letterSpacing: 2,
    opacity: 0.5,
  },
  duckBtn: {
    position: 'absolute',
    right: 24,
    bottom: 48,
    paddingHorizontal: 26,
    paddingVertical: 18,
    borderWidth: 2,
    borderRadius: 14,
    opacity: 0.75,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderWidth: 3,
    borderRadius: 16,
    paddingHorizontal: 34,
    paddingVertical: 26,
    alignItems: 'center',
    minWidth: 270,
  },
  gameOver: { fontSize: 22, fontWeight: 'bold', letterSpacing: 3 },
  bigScore: { fontSize: 42, fontWeight: 'bold', marginVertical: 6 },
  newBest: { color: '#fab005', fontWeight: 'bold', fontSize: 15, letterSpacing: 2, marginBottom: 4 },
  earned: { color: '#2f9e44', fontWeight: 'bold', fontSize: 18, marginBottom: 4 },
  btn: {
    paddingHorizontal: 30,
    paddingVertical: 13,
    borderRadius: 10,
    marginTop: 8,
    minWidth: 190,
    alignItems: 'center',
  },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 2 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15, letterSpacing: 2 },
});
