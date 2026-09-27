import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PixelSprite } from '../components/PixelSprite';
import {
  CITY_DAY,
  CITY_NIGHT,
  COIN_VALUE,
  FAST_FALL_GRAVITY_MULT,
  FONT,
  GRAVITY,
  JUMP_CUT_VELOCITY,
  JUMP_VELOCITY,
  MODE_THEME,
  PIXEL,
  POWER_DURATION,
  SHADOW,
  Theme,
  UI,
  glow,
  modeById,
  runnerById,
  skinById,
} from '../constants';
import * as PX from '../pixels';
import { Profile } from '../types';

const { width: W, height: H } = Dimensions.get('window');
const GROUND_Y = H * 0.7; // y of the ground line
const RUNNER_X = 40;
const HIT_PAD = 9; // forgiving hitboxes (sprites include a 1px outline)
const NEAR_MISS = 16; // px of clearance that still counts as a close call
const CELL_PX = 2.6;
const CELL_SIZE = PX.CELL.length * CELL_PX;
const POWER_SIZE = 34;
const TILE = Math.ceil(W * 1.25); // width of one repeating skyline tile
const GRID_STEP = 48;
const MAX_PARTICLES = 90;
const SUN = 78;

type ObstacleKind = 'cone' | 'crates' | 'drone' | 'meteor';
type PowerKind = 'magnet' | 'shield' | 'double';

interface Obstacle {
  kind: ObstacleKind;
  x: number;
  bottom: number; // distance of sprite bottom above ground
  w: number;
  h: number;
  speedMult: number;
  passed: boolean;
  minGap: number;
}

interface Cell {
  x: number;
  bottom: number;
  pulled: boolean;
}

interface Power {
  kind: PowerKind;
  x: number;
  bottom: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  life: number;
  maxLife: number;
  color: string;
  w: number;
  h: number;
}

interface FloatText {
  text: string;
  x: number;
  y: number;
  life: number;
  color: string;
}

interface Building {
  x: number;
  w: number;
  h: number;
  windows: { x: number; y: number }[];
}

const POWER_INFO: Record<PowerKind, { icon: string; label: string; color: string }> = {
  magnet: { icon: 'U', label: 'MAGNET', color: '#ff4fd8' },
  shield: { icon: '◆', label: 'SHIELD', color: '#2ee6d6' },
  double: { icon: '2×', label: '2× SCORE', color: '#ffc933' },
};

const OBSTACLE_SPRITES = {
  cone: PX.CONE,
  crates: PX.CRATES,
  meteor: PX.METEOR,
};

// ---------------------------------------------------------------- helpers

function hex(n: number) {
  return Math.round(n).toString(16).padStart(2, '0');
}

function lerpColor(a: string, b: string, t: number): string {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => ((pa >> shift) & 255) + (((pb >> shift) & 255) - ((pa >> shift) & 255)) * t;
  return `#${hex(ch(16))}${hex(ch(8))}${hex(ch(0))}`;
}

function lerpTheme(a: Theme, b: Theme, t: number): Theme {
  const out = { ...a };
  for (const k of Object.keys(a) as (keyof Theme)[]) {
    if (k === 'starAlpha') out.starAlpha = a.starAlpha + (b.starAlpha - a.starAlpha) * t;
    else out[k] = lerpColor(a[k], b[k], t);
  }
  return out;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

function makeBuildings(minH: number, maxH: number, windows: boolean): Building[] {
  const out: Building[] = [];
  let x = 0;
  while (x < TILE) {
    const w = Math.min(rand(34, 78), TILE - x);
    const h = rand(minH, maxH);
    const wins: { x: number; y: number }[] = [];
    if (windows) {
      for (let wy = 12; wy < h - 10; wy += 16) {
        for (let wx = 7; wx < w - 10; wx += 13) {
          if (Math.random() < 0.35) wins.push({ x: wx, y: wy });
        }
      }
    }
    out.push({ x, w, h, windows: wins });
    x += w + rand(2, 10);
  }
  return out;
}

function makeStars() {
  return Array.from({ length: 34 }, () => ({
    x: Math.random() * W,
    y: Math.random() * GROUND_Y * 0.75,
    size: 1 + Math.random() * 2.5,
  }));
}

function freshState(shields: number, nightT: number) {
  return {
    running: true,
    dead: false,
    paused: false,
    distance: 0,
    score: 0,
    bonus: 0,
    speed: 0,
    y: 0, // runner feet height above ground
    vy: 0,
    jumpsUsed: 0,
    holding: false,
    ducking: false,
    jumpBufferUntil: -1,
    shields,
    invulnUntil: 0,
    magnetUntil: 0,
    doubleUntil: 0,
    time: 0,
    runFrame: 0,
    obstacles: [] as Obstacle[],
    cells: [] as Cell[],
    powers: [] as Power[],
    particles: [] as Particle[],
    texts: [] as FloatText[],
    spawnCountdown: 520,
    powerCountdown: 2200,
    farOff: 0,
    nearOff: 0,
    groundOff: 0,
    nightT,
    nightTarget: nightT,
    lastMilestone: 0,
    milestoneFlashUntil: 0,
    shakeUntil: 0,
    shakeMag: 0,
    cellsRun: 0,
    nearChain: 0,
    lastNearAt: -10,
    dustTimer: 0,
  };
}

type GameState = ReturnType<typeof freshState>;

// ---------------------------------------------------------------- static background layers (memoized; moved with transforms)

const SkyBands = React.memo(function SkyBands({ top, bottom }: { top: string; bottom: string }) {
  const bands = 18;
  const bh = GROUND_Y / bands;
  return (
    <>
      {Array.from({ length: bands }, (_, i) => (
        <View
          key={i}
          style={{ position: 'absolute', left: 0, right: 0, top: i * bh, height: bh + 1, backgroundColor: lerpColor(top, bottom, i / (bands - 1)) }}
        />
      ))}
    </>
  );
});

const Stars = React.memo(function Stars({ stars }: { stars: { x: number; y: number; size: number }[] }) {
  return (
    <>
      {stars.map((st, i) => (
        <View
          key={i}
          style={{ position: 'absolute', left: st.x, top: st.y, width: st.size, height: st.size, borderRadius: 2, backgroundColor: '#ffffff' }}
        />
      ))}
    </>
  );
});

const SkylineTiles = React.memo(function SkylineTiles({
  buildings,
  color,
  windowColor,
  windowAlpha,
  hills,
}: {
  buildings: Building[];
  color: string;
  windowColor: string;
  windowAlpha: number;
  hills: boolean;
}) {
  return (
    <>
      {[0, TILE].map((ox) =>
        buildings.map((b, i) => (
          <View
            key={`${ox}-${i}`}
            style={{
              position: 'absolute',
              left: ox + b.x,
              bottom: 0,
              width: hills ? b.w * 2.2 : b.w,
              height: hills ? b.h * 0.55 : b.h,
              backgroundColor: color,
              borderTopLeftRadius: hills ? b.w * 1.1 : 3,
              borderTopRightRadius: hills ? b.w * 1.1 : 3,
            }}
          >
            {!hills && windowAlpha > 0.02 &&
              b.windows.map((wn, j) => (
                <View
                  key={j}
                  style={{ position: 'absolute', left: wn.x, top: wn.y, width: 5, height: 7, backgroundColor: windowColor, opacity: windowAlpha }}
                />
              ))}
          </View>
        ))
      )}
    </>
  );
});

const GroundGrid = React.memo(function GroundGrid({ grid, line }: { grid: string; line: string }) {
  const cols = Math.ceil(W / GRID_STEP) + 2;
  const depth = H - GROUND_Y;
  const rows = [8, 20, 38, 62, 94, 136, 190].filter((r) => r < depth);
  return (
    <>
      {Array.from({ length: cols }, (_, i) => (
        <View key={`v${i}`} style={{ position: 'absolute', left: i * GRID_STEP, top: 0, width: 2, height: depth, backgroundColor: grid }} />
      ))}
      {rows.map((r) => (
        <View key={`h${r}`} style={{ position: 'absolute', left: 0, width: W + GRID_STEP * 2, top: r, height: 2, backgroundColor: grid }} />
      ))}
      <View style={{ position: 'absolute', left: 0, width: W + GRID_STEP * 2, top: 0, height: 3, backgroundColor: line }} />
    </>
  );
});

// ---------------------------------------------------------------- the game

interface Props {
  profile: Profile;
  onRunEnd: (score: number, earned: number, cells: number) => void;
  onExit: () => void;
}

export function GameScreen({ profile, onRunEnd, onExit }: Props) {
  const runner = runnerById(profile.selectedRunner);
  const skin = skinById(profile.selectedSkin);
  const mode = modeById(profile.selectedMode);
  const sprites = PX.RUNNER_SPRITES[runner.id];
  const cycle = mode.id === 'classic';
  const hills = mode.id === 'moon';
  const startShields = runner.ability === 'shield' ? 1 : 0;

  const standSize = { w: sprites.runA[0].length * PIXEL, h: sprites.runA.length * PIXEL };
  const duckSize = { w: sprites.duckA[0].length * PIXEL, h: sprites.duckA.length * PIXEL };

  const scenery = useMemo(
    () => ({
      stars: makeStars(),
      far: makeBuildings(GROUND_Y * 0.18, GROUND_Y * 0.42, false),
      near: makeBuildings(GROUND_Y * 0.1, GROUND_Y * 0.28, true),
    }),
    []
  );

  const g = useRef<GameState>(freshState(startShields, 0));
  const themeRef = useRef<Theme>(MODE_THEME[mode.id]); // latest rendered palette, read by the loop
  const [, setTick] = useState(0);
  const [overlay, setOverlay] = useState<'none' | 'dead' | 'paused'>('none');
  const result = useRef({ score: 0, distancePts: 0, cellPts: 0, bonus: 0, earned: 0, newBest: false });
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
  }, []);

  const burst = useCallback((x: number, y: number, count: number, colors: string[], power = 260, gravity = 900) => {
    const s = g.current;
    for (let i = 0; i < count && s.particles.length < MAX_PARTICLES; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = power * (0.35 + Math.random() * 0.65);
      const size = rand(3, 7);
      const life = rand(0.35, 0.8);
      s.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - power * 0.3, gravity, life, maxLife: life, color: pick(colors), w: size, h: size });
    }
  }, []);

  const addText = useCallback((text: string, x: number, y: number, color: string) => {
    g.current.texts.push({ text, x, y, life: 0.9, color });
  }, []);

  const reset = useCallback(() => {
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
    g.current = freshState(startShields, 0);
    setOverlay('none');
  }, [startShields]);

  const die = useCallback(() => {
    const s = g.current;
    s.dead = true;
    s.running = false;
    const score = Math.floor(s.score);
    const cellPts = s.cellsRun * COIN_VALUE;
    const distancePts = Math.floor((score - s.bonus) * mode.pointsMult);
    const earned = Math.floor(score * mode.pointsMult) + cellPts;
    result.current = {
      score,
      distancePts,
      cellPts,
      bonus: Math.floor(s.bonus * mode.pointsMult),
      earned,
      newBest: score > profile.bestScores[mode.id],
    };
    s.shakeUntil = s.time + 0.4;
    s.shakeMag = 12;
    const standTop = GROUND_Y - s.y - standSize.h;
    burst(RUNNER_X + standSize.w / 2, standTop + standSize.h / 2, 34, [skin.body, skin.accent, '#ffffff', UI.pink], 380);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    onRunEnd(score, earned, s.cellsRun);
    overlayTimer.current = setTimeout(() => setOverlay('dead'), 650);
  }, [burst, mode.id, mode.pointsMult, onRunEnd, profile.bestScores, skin.accent, skin.body, standSize.h, standSize.w]);

  const doJump = useCallback(() => {
    const s = g.current;
    const maxJumps = runner.ability === 'doubleJump' ? 2 : 1;
    const grounded = s.y <= 0 && s.vy >= 0;
    if (grounded) s.jumpsUsed = 0;
    if (s.jumpsUsed >= maxJumps) return false;
    const airJump = s.jumpsUsed > 0;
    s.vy = JUMP_VELOCITY * (mode.gravityMult < 1 ? 0.78 : 1) * (airJump ? 0.88 : 1);
    s.jumpsUsed += 1;
    s.ducking = false;
    const feetY = GROUND_Y - s.y;
    if (airJump) {
      // jet-boot ring
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        s.particles.push({ x: RUNNER_X + standSize.w / 2, y: feetY, vx: Math.cos(a) * 180, vy: Math.sin(a) * 60 + 80, gravity: 0, life: 0.35, maxLife: 0.35, color: skin.accent, w: 4, h: 4 });
      }
    } else {
      burst(RUNNER_X + standSize.w * 0.4, feetY, 6, ['#ffffff', skin.accent], 120, 300);
    }
    Haptics.selectionAsync().catch(() => {});
    return true;
  }, [burst, mode.gravityMult, runner.ability, skin.accent, standSize.w]);

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
      if (s.paused) return;

      // particles & floating text keep animating after a crash
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          s.particles.splice(i, 1);
          continue;
        }
        p.vy += p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
      for (let i = s.texts.length - 1; i >= 0; i--) {
        const t = s.texts[i];
        t.life -= dt;
        t.y -= 46 * dt;
        if (t.life <= 0) s.texts.splice(i, 1);
      }

      if (!s.running) {
        s.time += dt;
        if (s.particles.length || s.time < s.shakeUntil) setTick((t) => t + 1);
        return;
      }

      s.time += dt;
      s.runFrame = Math.floor(s.time / 0.11) % 2;
      const doubling = s.time < s.doubleUntil;

      // speed & score
      s.speed = Math.min(mode.speedMax, mode.speedStart + s.distance * mode.speedPerScore);
      const gained = s.speed * dt * 0.025;
      s.distance += gained;
      s.score += gained * (doubling ? 2 : 1);
      const floored = Math.floor(s.score);
      if (floored >= s.lastMilestone + 100) {
        s.lastMilestone = floored - (floored % 100);
        s.milestoneFlashUntil = s.time + 0.6;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }

      // day -> neon night cycle (city only)
      if (cycle) s.nightTarget = Math.floor(s.distance / 500) % 2 === 1 ? 1 : 0;
      s.nightT += (s.nightTarget - s.nightT) * Math.min(1, dt * 1.6);

      // runner physics
      const airborne = s.y > 0 || s.vy < 0;
      const gravity = GRAVITY * mode.gravityMult * (s.ducking && airborne ? FAST_FALL_GRAVITY_MULT : 1);
      if (airborne) {
        const impact = s.vy;
        s.vy += gravity * dt;
        s.y -= s.vy * dt;
        if (s.vy < 0 && Math.random() < 0.7) {
          // thruster sparks while rising
          s.particles.push({ x: RUNNER_X + standSize.w * rand(0.35, 0.6), y: GROUND_Y - s.y, vx: rand(-40, 20), vy: rand(80, 180), gravity: 0, life: 0.25, maxLife: 0.25, color: pick([skin.accent, '#ffffff', '#ffe14f']), w: 4, h: 4 });
        }
        if (s.y <= 0) {
          s.y = 0;
          s.vy = 0;
          s.jumpsUsed = 0;
          if (impact > 500) burst(RUNNER_X + standSize.w / 2, GROUND_Y - 2, 7, ['#ffffff', themeRef.current.groundLine], 140, 500);
          if (s.time < s.jumpBufferUntil) {
            s.jumpBufferUntil = -1;
            doJump();
          }
        }
      } else {
        s.dustTimer -= dt;
        if (s.dustTimer <= 0) {
          s.dustTimer = 0.09;
          s.particles.push({ x: RUNNER_X + 12, y: GROUND_Y - 3, vx: -s.speed * 0.35, vy: rand(-60, -20), gravity: 200, life: 0.3, maxLife: 0.3, color: themeRef.current.groundLine, w: 4, h: 4 });
        }
      }

      // scrolling layers
      s.groundOff = (s.groundOff + s.speed * dt) % GRID_STEP;
      s.nearOff = (s.nearOff + s.speed * 0.32 * dt) % TILE;
      s.farOff = (s.farOff + s.speed * 0.12 * dt) % TILE;

      // speed streaks in overdrive
      if (mode.id === 'frenzy' && Math.random() < 0.25) {
        s.particles.push({ x: W + 20, y: rand(40, GROUND_Y - 30), vx: -s.speed * 2.2, vy: 0, gravity: 0, life: 0.6, maxLife: 0.6, color: '#ffffff', w: rand(30, 90), h: 2 });
      }

      // spawning
      s.spawnCountdown -= s.speed * dt;
      s.powerCountdown -= s.speed * dt;
      if (s.spawnCountdown <= 0) {
        const minGap = Math.max(250, s.speed * 0.55) * mode.spawnGapMult;
        const maxGap = Math.max(430, s.speed * 1.05) * mode.spawnGapMult;
        const gap = minGap + Math.random() * (maxGap - minGap);
        s.spawnCountdown = gap;
        const placed = spawnObstacle(s.obstacles, s.distance, mode.meteors);
        const first = placed[0];
        const lastO = placed[placed.length - 1];
        const afterX = lastO.x + lastO.w;
        if (s.powerCountdown <= 0 && s.distance > 150) {
          s.powerCountdown = rand(2600, 5200);
          s.powers.push({ kind: pick(['magnet', 'shield', 'double'] as const), x: afterX + gap * 0.45, bottom: 64 });
        } else if (Math.random() < 0.6) {
          if (first.bottom === 0 && first.kind !== 'meteor') {
            // arc of cells over the obstacle rewards a clean jump
            const cx = (first.x + afterX) / 2;
            const topH = Math.max(...placed.map((o) => o.h)) + 38;
            for (let i = 0; i < 5; i++) {
              s.cells.push({ x: cx + (i - 2) * 38 - CELL_SIZE / 2, bottom: 14 + Math.sin((Math.PI * i) / 4) * topH, pulled: false });
            }
          } else {
            for (let i = 0; i < 4; i++) {
              s.cells.push({ x: afterX + gap * 0.25 + i * 30, bottom: 12, pulled: false });
            }
          }
        }
      }

      // runner hitbox
      const duckNow = s.ducking && s.y <= 0;
      const rW = duckNow ? duckSize.w : standSize.w;
      const rH = duckNow ? duckSize.h : standSize.h;
      const rLeft = RUNNER_X + HIT_PAD;
      const rRight = RUNNER_X + rW - HIT_PAD;
      const rBottomY = GROUND_Y - s.y;
      const rTopY = rBottomY - rH + HIT_PAD;
      const rCx = RUNNER_X + rW / 2;
      const rCy = rBottomY - rH / 2;

      // energy cells
      const magnetR = s.time < s.magnetUntil ? 240 : runner.ability === 'magnet' ? 140 : 0;
      for (let i = s.cells.length - 1; i >= 0; i--) {
        const c = s.cells[i];
        c.x -= s.speed * dt;
        const cx = c.x + CELL_SIZE / 2;
        const cy = GROUND_Y - c.bottom - CELL_SIZE / 2;
        if (magnetR && (c.pulled || Math.hypot(cx - rCx, cy - rCy) < magnetR)) {
          c.pulled = true;
          const k = Math.min(1, dt * 9);
          c.x += (rCx - cx) * k;
          c.bottom += (GROUND_Y - rCy - (GROUND_Y - cy)) * k;
        }
        if (c.x < -30) {
          s.cells.splice(i, 1);
          continue;
        }
        if (cx > rLeft - 10 && cx < rRight + 10 && cy > rTopY - 10 && cy < rBottomY + 6) {
          s.cells.splice(i, 1);
          s.cellsRun += 1;
          burst(cx, cy, 5, [UI.gold, '#ffffff'], 150, 200);
        }
      }

      // power-ups
      for (let i = s.powers.length - 1; i >= 0; i--) {
        const p = s.powers[i];
        p.x -= s.speed * dt;
        if (p.x < -50) {
          s.powers.splice(i, 1);
          continue;
        }
        const px = p.x + POWER_SIZE / 2;
        const py = GROUND_Y - p.bottom - POWER_SIZE / 2;
        if (px > rLeft - 14 && px < rRight + 14 && py > rTopY - 14 && py < rBottomY + 10) {
          s.powers.splice(i, 1);
          const info = POWER_INFO[p.kind];
          if (p.kind === 'magnet') s.magnetUntil = s.time + POWER_DURATION;
          else if (p.kind === 'double') s.doubleUntil = s.time + POWER_DURATION;
          else s.shields = Math.min(2, s.shields + 1);
          addText(`${info.label}!`, rCx - 40, rTopY - 30, info.color);
          burst(px, py, 16, [info.color, '#ffffff'], 260, 300);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
      }

      // obstacles: move, collide, near-miss
      const invuln = s.time < s.invulnUntil;
      for (let i = s.obstacles.length - 1; i >= 0; i--) {
        const o = s.obstacles[i];
        o.x -= s.speed * o.speedMult * dt;
        if (o.x + o.w < -40) {
          s.obstacles.splice(i, 1);
          continue;
        }
        const oLeft = o.x + HIT_PAD;
        const oRight = o.x + o.w - HIT_PAD;
        const oBottomY = GROUND_Y - o.bottom;
        const oTopY = oBottomY - o.h + HIT_PAD;
        const xOverlap = rRight > oLeft && rLeft < oRight;
        if (xOverlap && !invuln) {
          const hit = rBottomY > oTopY && rTopY < oBottomY;
          if (hit) {
            if (s.shields > 0) {
              s.shields -= 1;
              s.invulnUntil = s.time + 1.0;
              s.shakeUntil = s.time + 0.25;
              s.shakeMag = 7;
              burst(o.x + o.w / 2, oBottomY - o.h / 2, 22, [themeRef.current.obstacle, themeRef.current.obstacleAccent, '#ffffff'], 320);
              addText('SHIELD SAVE', rCx - 50, rTopY - 30, UI.cyan);
              s.obstacles.splice(i, 1);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
              continue;
            }
            die();
            break;
          }
          o.minGap = Math.min(o.minGap, Math.max(oTopY - rBottomY, rTopY - oBottomY));
        }
        if (!o.passed && o.x + o.w - HIT_PAD < rLeft) {
          o.passed = true;
          if (o.minGap < NEAR_MISS) {
            s.nearChain = s.time - s.lastNearAt < 4 ? s.nearChain + 1 : 1;
            s.lastNearAt = s.time;
            const pts = 10 * s.nearChain * (doubling ? 2 : 1);
            s.score += pts;
            s.bonus += pts;
            addText(s.nearChain > 1 ? `CLOSE x${s.nearChain}  +${pts}` : `CLOSE!  +${pts}`, rCx - 30, rTopY - 26, UI.gold);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }
        }
      }

      setTick((t) => t + 1);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [addText, burst, cycle, die, doJump, duckSize.h, duckSize.w, mode, runner.ability, skin.accent, standSize.h, standSize.w]);

  const press = useCallback(() => {
    const s = g.current;
    if (!s.running || s.paused) return;
    s.holding = true;
    if (!doJump()) s.jumpBufferUntil = s.time + 0.14; // buffer an early tap until landing
  }, [doJump]);

  const release = useCallback(() => {
    const s = g.current;
    s.holding = false;
    const cut = JUMP_CUT_VELOCITY * (mode.gravityMult < 1 ? 0.78 : 1);
    if (s.vy < cut) s.vy = cut; // short hop when released early
  }, [mode.gravityMult]);

  // ---------------------------------------------------------------- render
  const s = g.current;
  const nightQ = Math.round(s.nightT * 20) / 20;
  const theme = cycle ? lerpTheme(CITY_DAY, CITY_NIGHT, nightQ) : MODE_THEME[mode.id];
  themeRef.current = theme;

  const duckNow = s.ducking && s.y <= 0;
  const runnerMatrix = s.dead
    ? sprites.dead
    : duckNow
      ? (s.runFrame ? sprites.duckB : sprites.duckA)
      : s.y > 0
        ? sprites.jump
        : s.runFrame
          ? sprites.runB
          : sprites.runA;
  const rH = duckNow ? duckSize.h : standSize.h;
  const rW = duckNow ? duckSize.w : standSize.w;
  const flashScore = s.time < s.milestoneFlashUntil;
  const shaking = s.time < s.shakeUntil;
  const shakeX = shaking ? (Math.random() - 0.5) * s.shakeMag : 0;
  const shakeY = shaking ? (Math.random() - 0.5) * s.shakeMag : 0;
  const best = Math.max(profile.bestScores[mode.id], s.dead ? Math.floor(s.score) : 0);
  const pulse = 0.5 + 0.5 * Math.sin(s.time * 8);
  const activePowers = (
    [
      ['magnet', s.magnetUntil],
      ['double', s.doubleUntil],
    ] as [PowerKind, number][]
  ).filter(([, until]) => until > s.time);

  return (
    <Pressable style={[styles.root, { backgroundColor: theme.ground }]} onPressIn={press} onPressOut={release}>
      <View style={[StyleSheet.absoluteFill, { transform: [{ translateX: shakeX }, { translateY: shakeY }] }]} pointerEvents="none">
        <SkyBands top={theme.skyTop} bottom={theme.skyBottom} />
        {theme.starAlpha > 0.03 && (
          <View style={[StyleSheet.absoluteFill, { opacity: theme.starAlpha * 0.85 }]}>
            <Stars stars={scenery.stars} />
          </View>
        )}
        {/* sun / moon / planet */}
        <View style={[styles.sunGlow, { backgroundColor: theme.sun }]} />
        <View style={[styles.sun, { backgroundColor: theme.sun }]}>
          {mode.id === 'frenzy' &&
            [0.55, 0.68, 0.8, 0.9].map((f, i) => (
              <View key={i} style={{ position: 'absolute', left: 0, right: 0, top: SUN * f, height: 3 + i, backgroundColor: theme.skyBottom }} />
            ))}
          {hills && <View style={styles.planetRing} />}
        </View>
        {/* far & near skyline */}
        <View style={[styles.layer, { top: GROUND_Y - GROUND_Y * 0.42, height: GROUND_Y * 0.42, transform: [{ translateX: -s.farOff }] }]}>
          <SkylineTiles buildings={scenery.far} color={theme.far} windowColor={theme.window} windowAlpha={0} hills={hills} />
        </View>
        <View style={[styles.layer, { top: GROUND_Y - GROUND_Y * 0.28, height: GROUND_Y * 0.28, transform: [{ translateX: -s.nearOff }] }]}>
          <SkylineTiles buildings={scenery.near} color={theme.near} windowColor={theme.window} windowAlpha={cycle ? nightQ * 0.9 : mode.id === 'frenzy' ? 0.6 : 0} hills={hills} />
        </View>
        {/* ground */}
        <View style={[styles.ground, { backgroundColor: theme.ground }]}>
          <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: W + GRID_STEP * 2, transform: [{ translateX: -s.groundOff }] }}>
            <GroundGrid grid={theme.grid} line={theme.groundLine} />
          </View>
        </View>

        {/* energy cells */}
        {s.cells.map((c, i) => (
          <View key={`c${i}`} style={{ position: 'absolute', left: c.x, top: GROUND_Y - c.bottom - CELL_SIZE + Math.sin(s.time * 6 + i) * 2 }}>
            <PixelSprite matrix={PX.CELL} pixel={CELL_PX} body={UI.gold} accent="#fff8d6" />
          </View>
        ))}
        {/* power-ups */}
        {s.powers.map((p, i) => {
          const info = POWER_INFO[p.kind];
          return (
            <View
              key={`p${i}`}
              style={[
                styles.power,
                glow(info.color),
                { left: p.x, top: GROUND_Y - p.bottom - POWER_SIZE + Math.sin(s.time * 4) * 4, borderColor: info.color, transform: [{ scale: 0.92 + pulse * 0.1 }] },
              ]}
            >
              <Text style={[FONT, styles.powerIcon, { color: info.color }]}>{info.icon}</Text>
            </View>
          );
        })}
        {/* obstacles */}
        {s.obstacles.map((o, i) => {
          const matrix = o.kind === 'drone' ? (s.runFrame ? PX.DRONE_DOWN : PX.DRONE_UP) : OBSTACLE_SPRITES[o.kind];
          const body = o.kind === 'meteor' ? '#8a5a44' : o.kind === 'drone' ? '#b8bfe0' : theme.obstacle;
          const accent = o.kind === 'meteor' ? '#ff9f43' : o.kind === 'drone' ? '#ff3b5c' : theme.obstacleAccent;
          return (
            <View key={`o${i}`} style={{ position: 'absolute', left: o.x, top: GROUND_Y - o.bottom - o.h }}>
              <PixelSprite matrix={matrix} pixel={PIXEL} body={body} accent={accent} dark="#1b1f33" />
            </View>
          );
        })}
        {/* runner */}
        <View
          style={{
            position: 'absolute',
            left: RUNNER_X,
            top: GROUND_Y - s.y - rH,
            opacity: s.time < s.invulnUntil && Math.floor(s.time * 12) % 2 === 0 ? 0.35 : 1,
          }}
        >
          {s.shields > 0 && !s.dead && (
            <View
              style={[
                styles.bubble,
                { left: rW / 2 - rH * 0.72, top: rH / 2 - rH * 0.72, width: rH * 1.44, height: rH * 1.44, borderRadius: rH, borderColor: UI.cyan, opacity: 0.55 + pulse * 0.35 },
              ]}
            />
          )}
          {(s.time < s.magnetUntil || runner.ability === 'magnet') && !s.dead && (
            <View
              style={[
                styles.bubble,
                { left: rW / 2 - 70 * (0.8 + pulse * 0.2), top: rH / 2 - 70 * (0.8 + pulse * 0.2), width: 140 * (0.8 + pulse * 0.2), height: 140 * (0.8 + pulse * 0.2), borderRadius: 100, borderColor: UI.pink, borderWidth: 1, opacity: s.time < s.magnetUntil ? 0.45 : 0.15 },
              ]}
            />
          )}
          {!s.dead && <PixelSprite matrix={runnerMatrix} pixel={PIXEL} body={skin.body} accent={skin.accent} />}
        </View>
        {/* particles */}
        {s.particles.map((p, i) => (
          <View
            key={`fx${i}`}
            style={{ position: 'absolute', left: p.x, top: p.y, width: p.w, height: p.h, backgroundColor: p.color, opacity: Math.min(1, (p.life / p.maxLife) * 1.4) }}
          />
        ))}
        {s.texts.map((t, i) => (
          <Text key={`t${i}`} style={[FONT, styles.floatText, { left: t.x, top: t.y, color: t.color, opacity: Math.min(1, t.life * 2) }]}>
            {t.text}
          </Text>
        ))}
      </View>

      {/* HUD */}
      <View style={styles.hud} pointerEvents="box-none">
        <Pressable
          style={styles.pill}
          onPress={() => {
            if (s.dead) return;
            s.paused = !s.paused;
            setOverlay(s.paused ? 'paused' : 'none');
          }}
          hitSlop={12}
        >
          <Text style={[styles.hudText, FONT]}>{overlay === 'paused' ? '▶' : 'II'}</Text>
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.score, FONT, { color: flashScore ? UI.gold : '#ffffff' }]}>{String(Math.floor(s.score)).padStart(5, '0')}</Text>
          <Text style={[styles.hi, FONT]}>HI {String(best).padStart(5, '0')}</Text>
        </View>
        <View style={[styles.pill, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
          <PixelSprite matrix={PX.CELL} pixel={2} body={UI.gold} accent="#fff8d6" />
          <Text style={[styles.hudText, FONT]}>{s.cellsRun}</Text>
        </View>
      </View>
      <Text style={[styles.modeTag, FONT]} pointerEvents="none">
        {mode.name}
        {mode.pointsMult > 1 ? `  ×${mode.pointsMult}` : ''}
      </Text>
      <View style={styles.chips} pointerEvents="none">
        {s.shields > 0 && (
          <View style={[styles.chip, { borderColor: UI.cyan }]}>
            <Text style={[FONT, styles.chipText, { color: UI.cyan }]}>◆ SHIELD{s.shields > 1 ? ` ×${s.shields}` : ''}</Text>
          </View>
        )}
        {activePowers.map(([kind, until]) => {
          const info = POWER_INFO[kind];
          return (
            <View key={kind} style={[styles.chip, { borderColor: info.color }]}>
              <Text style={[FONT, styles.chipText, { color: info.color }]}>{info.label}</Text>
              <View style={styles.chipBarTrack}>
                <View style={[styles.chipBar, { backgroundColor: info.color, width: `${((until - s.time) / POWER_DURATION) * 100}%` }]} />
              </View>
            </View>
          );
        })}
      </View>
      {s.time < 3 && !s.dead && profile.totalRuns < 3 && (
        <Text style={[FONT, styles.hint]} pointerEvents="none">
          TAP = HOP  ·  HOLD = HIGH JUMP
        </Text>
      )}

      {/* duck button */}
      <Pressable
        style={({ pressed }) => [styles.duckBtn, pressed && { backgroundColor: 'rgba(46,230,214,0.25)' }]}
        onPressIn={(e) => {
          e.stopPropagation();
          g.current.ducking = true;
        }}
        onPressOut={() => {
          g.current.ducking = false;
        }}
      >
        <Text style={[FONT, styles.duckText]}>▼ DUCK</Text>
      </Pressable>

      {/* overlays */}
      {overlay === 'dead' && (
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={[styles.gameOver, FONT]}>GAME OVER</Text>
            <Text style={[styles.bigScore, FONT]}>{String(result.current.score).padStart(5, '0')}</Text>
            {result.current.newBest && <Text style={[FONT, styles.newBest]}>★ NEW BEST ★</Text>}
            <View style={styles.breakdown}>
              <Row label={`DISTANCE${mode.pointsMult > 1 ? ` ×${mode.pointsMult}` : ''}`} value={result.current.distancePts} />
              {result.current.bonus > 0 && <Row label="CLOSE CALLS" value={result.current.bonus} />}
              <Row label={`CELLS ×${s.cellsRun}`} value={result.current.cellPts} />
              <View style={styles.divider} />
              <Row label="EARNED" value={result.current.earned} strong />
            </View>
            <Pressable style={({ pressed }) => [styles.btn, glow(UI.primary), { backgroundColor: UI.primary, opacity: pressed ? 0.85 : 1 }]} onPress={reset}>
              <Text style={[styles.btnText, FONT]}>RUN AGAIN</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={onExit}>
              <Text style={[styles.btnText, FONT, { color: UI.dim }]}>MENU</Text>
            </Pressable>
          </View>
        </View>
      )}
      {overlay === 'paused' && (
        <View style={styles.overlay}>
          <Text style={[styles.gameOver, FONT, { fontSize: 26 }]}>PAUSED</Text>
          <Pressable
            style={[styles.btn, glow(UI.primary), { backgroundColor: UI.primary, marginTop: 20 }]}
            onPress={() => {
              s.paused = false;
              setOverlay('none');
            }}
          >
            <Text style={[styles.btnText, FONT]}>RESUME</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnGhost, { marginTop: 10 }]} onPress={onExit}>
            <Text style={[styles.btnText, FONT, { color: UI.dim }]}>MENU</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

function Row({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[FONT, styles.rowLabel, strong && { color: UI.text }]}>{label}</Text>
      <Text style={[FONT, styles.rowValue, strong && { color: UI.gold, fontSize: 18 }]}>+{value}</Text>
    </View>
  );
}

function spawnObstacle(obstacles: Obstacle[], distance: number, meteors: boolean): Obstacle[] {
  const make = (kind: ObstacleKind, matrix: PX.PixelMatrix, x: number, bottom: number, speedMult: number): Obstacle => {
    const { w, h } = PX.matrixSize(matrix);
    return { kind, x, bottom, w: w * PIXEL, h: h * PIXEL, speedMult, passed: false, minGap: Infinity };
  };
  const placed: Obstacle[] = [];
  if (distance > 150 && Math.random() < 0.3) {
    // flyers: low = jump, mid = duck, high = keep running
    const bottom = pick([8, 48, 92]);
    placed.push(meteors ? make('meteor', PX.METEOR, W + 40, bottom, 1.35) : make('drone', PX.DRONE_UP, W + 40, bottom, 1.15));
  } else if (distance > 80 && Math.random() < 0.4) {
    placed.push(make('crates', PX.CRATES, W + 40, 0, 1));
  } else {
    const count = distance > 500 && Math.random() < 0.2 ? 3 : distance > 250 && Math.random() < 0.35 ? 2 : 1;
    const { w } = PX.matrixSize(PX.CONE);
    for (let i = 0; i < count; i++) placed.push(make('cone', PX.CONE, W + 40 + i * (w * PIXEL - 4), 0, 1));
  }
  obstacles.push(...placed);
  return placed;
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  layer: { position: 'absolute', left: 0, width: TILE * 2 },
  ground: { position: 'absolute', left: 0, right: 0, top: GROUND_Y, bottom: 0, overflow: 'hidden' },
  sun: { position: 'absolute', right: 48, top: GROUND_Y * 0.3, width: SUN, height: SUN, borderRadius: SUN / 2, overflow: 'hidden' },
  sunGlow: { position: 'absolute', right: 30, top: GROUND_Y * 0.3 - 18, width: 114, height: 114, borderRadius: 57, opacity: 0.18 },
  planetRing: { position: 'absolute', left: -20, right: -20, top: 34, height: 10, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.35)', transform: [{ rotate: '-18deg' }] },
  power: {
    position: 'absolute',
    width: POWER_SIZE,
    height: POWER_SIZE,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: 'rgba(15,12,36,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerIcon: { fontSize: 15, fontWeight: 'bold' },
  bubble: { position: 'absolute', borderWidth: 2 },
  floatText: { position: 'absolute', fontSize: 13, fontWeight: 'bold', letterSpacing: 1, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 },
  hud: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pill: { backgroundColor: 'rgba(15,12,36,0.5)', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 9, minWidth: 44, alignItems: 'center' },
  hudText: { fontSize: 16, fontWeight: 'bold', color: '#ffffff' },
  score: { fontSize: 30, fontWeight: 'bold', letterSpacing: 2, textShadowColor: 'rgba(0,0,0,0.45)', textShadowRadius: 6 },
  hi: { fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.8)', textShadowColor: 'rgba(0,0,0,0.45)', textShadowRadius: 4 },
  chips: { position: 'absolute', top: 108, right: 16, alignItems: 'flex-end', gap: 6 },
  modeTag: { position: 'absolute', top: 100, left: 18, fontSize: 10, letterSpacing: 2, color: '#ffffff', opacity: 0.75, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 3 },
  chip: { backgroundColor: 'rgba(15,12,36,0.6)', borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, minWidth: 100 },
  chipText: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  chipBarTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, marginTop: 4, overflow: 'hidden' },
  chipBar: { height: 3, borderRadius: 2 },
  hint: { position: 'absolute', top: GROUND_Y * 0.42, left: 0, right: 0, textAlign: 'center', color: '#ffffff', fontSize: 13, fontWeight: 'bold', letterSpacing: 2, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 5 },
  duckBtn: {
    position: 'absolute',
    right: 22,
    bottom: 44,
    paddingHorizontal: 26,
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: UI.cyan,
    borderRadius: 22,
    backgroundColor: 'rgba(15,12,36,0.55)',
  },
  duckText: { color: UI.cyan, fontSize: 17, fontWeight: 'bold', letterSpacing: 1 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8,6,20,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: UI.card,
    borderWidth: 1,
    borderColor: UI.line,
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 26,
    alignItems: 'center',
    minWidth: 290,
    ...SHADOW,
  },
  gameOver: { fontSize: 20, fontWeight: 'bold', letterSpacing: 4, color: UI.pink },
  bigScore: { fontSize: 46, fontWeight: 'bold', marginVertical: 4, color: UI.text },
  newBest: { color: UI.gold, fontWeight: 'bold', fontSize: 14, letterSpacing: 2, marginBottom: 4 },
  breakdown: { alignSelf: 'stretch', backgroundColor: UI.bgSoft, borderRadius: 16, padding: 14, marginVertical: 12, gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { color: UI.dim, fontSize: 12, letterSpacing: 1 },
  rowValue: { color: UI.text, fontSize: 14, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: UI.line, marginVertical: 2 },
  btn: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 8,
    minWidth: 210,
    alignItems: 'center',
  },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: UI.line },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15, letterSpacing: 2 },
});
