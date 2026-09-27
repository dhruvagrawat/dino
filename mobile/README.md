# 🤖 Voltbot

An original neon-arcade endless runner built with **Expo + React Native + TypeScript**. You play as a squad of pixel robots racing across a synthwave city. Everything (points, unlocks and high scores) is stored locally on the device. There are no accounts and no cloud, and it needs no internet.

## Features

- **Tight controls**: tap to hop, **hold to jump higher**. Hold DUCK to slide under drones, or to fast-fall mid-air. Early taps are buffered so jumps never get eaten.
- **Energy cells**: collect glowing cells (placed in arcs over obstacles and in lines through gaps). Each one is worth bonus points.
- **Power-ups**: **Magnet** pulls in cells, **Shield** absorbs one hit, and **2× Score** doubles distance points for 7 seconds.
- **Close calls**: skim past an obstacle to score a bonus, and chain them for a growing multiplier.
- **Juice**: particle bursts, thruster sparks, landing dust, screen shake, parallax skyline, a scrolling neon grid, and haptics.
- **4 bots**, each with its own look and ability:
  - **Volt** (free): balanced.
  - **Zip** (600): jet boots, so you can **double jump**.
  - **Brick** (1500): heavy plating that **survives one hit** per run.
  - **Nova** (3000): a built-in **magnet** that pulls in nearby cells.
- **5 paint jobs**: Core, Toxic, Sunset, Frost, Gold.
- **3 worlds**, each with its own high score:
  - **Neon City** (free): rooftops with a day → neon-night cycle.
  - **Overdrive** (1000): a sunset highway at blazing speed, **2× points**.
  - **Orbit** (2000): low gravity, meteors and deep space, **1.5× points**.
- Pixel-art sprites are drawn entirely in code (see `src/pixels.ts`), so there are no sprite images to ship. All artwork is original.

## Run it locally

```bash
npm install
npx expo start
```

Then press `a` for an Android emulator/device, `i` for iOS, or scan the QR code with **Expo Go**.

## Regenerating the icon / splash

```bash
node scripts/gen-logo.mjs        # needs rsvg-convert (librsvg)
```

## Publishing to Google Play

The project is configured for [EAS Build](https://docs.expo.dev/build/introduction/).

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile production
eas submit --platform android --latest
```

`app.json` sets the Android `package` (`com.dhruvagrawat.dinodash`, unchanged so existing EAS credentials keep working). The `production` profile auto-increments `versionCode`.

## Project structure

```
App.tsx                 # navigation shell + profile/purchase logic
src/
  pixels.ts             # pixel-art sprite matrices (bots, obstacles, cells) + auto-outline
  types.ts              # shared TypeScript types
  constants.ts          # bots, skins, worlds, physics, UI + world palettes
  storage.ts            # AsyncStorage load/save (+ migration of older saves)
  components/
    PixelSprite.tsx     # renders a pixel matrix as run-length Views
    PointsBadge.tsx
  screens/
    SplashScreen.tsx
    MenuScreen.tsx
    GameScreen.tsx      # the game engine + render
    ShopScreen.tsx
    ModesScreen.tsx
```

All game data lives under a single `AsyncStorage` key (`dino.profile.v1`, kept so existing players keep their progress). Saves are migrated forward by merging against defaults.
