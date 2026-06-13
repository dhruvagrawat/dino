# 🦖 Dino

A polished, offline Chrome-dino-style endless runner built with **Expo + React Native + TypeScript**. Everything — points, unlocks and high scores — is stored locally on the device. No accounts, no cloud, no internet required.

## Features

- **Splash screen** with an animated running dino, just like the Chrome game.
- **Endless runner core**: jump (tap anywhere) and duck (hold the DUCK button) to dodge cacti, birds, rocks and meteors. Forgiving hitboxes, smooth `requestAnimationFrame` physics, and progressive speed-up.
- **Day / night cycle** that smoothly fades as your score climbs.
- **Local progression** — earn points every run and spend them on unlocks. Nothing leaves the phone (`AsyncStorage`).
- **3 dinos**, unlocked one by one:
  - **Rex** (free) — balanced.
  - **Raptor** (600) — tap mid-air for a **double jump**.
  - **Tank** (1500) — armored, **survives one hit** per run.
- **5 skins**: Classic, Neon, Lava, Ice, Gold (300 → 2000 pts).
- **3 modes**, each with its own high score:
  - **Classic** (free) — the original desert.
  - **Frenzy** (1000) — faster, tighter gaps, **2× points**.
  - **Moon** (2000) — low gravity, falling meteors, starry night, **1.5× points**.
- **Haptic feedback** on jumps, milestones, purchases and crashes.
- Clean monospace UI, rounded cards, and pixel-art sprites drawn entirely in code (no image assets to ship).

## Run it locally

```bash
npm install
npx expo start
```

Then press `a` for an Android emulator/device, `i` for iOS, or scan the QR code with **Expo Go**.

## Publishing to Google Play

The project is configured for [EAS Build](https://docs.expo.dev/build/introduction/).

1. Install the CLI and log in:
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. Link the project (first time only):
   ```bash
   eas init
   ```
3. Build a Play Store **app bundle** (`.aab`):
   ```bash
   eas build --platform android --profile production
   ```
4. Download the `.aab` and upload it in the [Play Console](https://play.google.com/console), **or** automate submission:
   ```bash
   eas submit --platform android --latest
   ```

`app.json` already sets the Android `package` (`com.dhruvagrawat.dinodash`) and `versionCode`. Bump `version` / `versionCode` for each release (the `production` profile auto-increments `versionCode`).

## Project structure

```
App.tsx                 # navigation shell + profile/purchase logic
src/
  pixels.ts             # pixel-art sprite matrices (dinos, obstacles)
  types.ts              # shared TypeScript types
  constants.ts          # dinos, skins, modes, physics, palettes
  storage.ts            # AsyncStorage load/save of the local profile
  components/
    PixelSprite.tsx     # renders a pixel matrix as run-length Views
  screens/
    SplashScreen.tsx
    MenuScreen.tsx
    GameScreen.tsx       # the game engine + render
    ShopScreen.tsx
    ModesScreen.tsx
```

All game data lives under a single `AsyncStorage` key (`dino.profile.v1`) and is migrated forward by merging against defaults, so future updates can add fields safely.
