# 🦖 Dino — monorepo

An offline Chrome-dino-style endless runner, plus its marketing website.

```
dino/
├── mobile/     # Expo + React Native + TypeScript game (the app)
└── website/    # Next.js landing page + privacy policy + terms
```

## mobile/ — the game
Polished, fully offline endless runner. Unlockable dinos, skins and modes; all
progress stored locally on the device. See [mobile/README.md](mobile/README.md).

```bash
cd mobile
npm install
npx expo start          # press 'a' for Android, or scan with Expo Go
```

Publish to Google Play with EAS:
```bash
cd mobile
eas build -p android --profile production
```

## website/ — the landing page
One-page site promoting the app, with **Privacy Policy** (`/privacy`) and
**Terms & Conditions** (`/terms`) — required for the Play Store listing.
Deploys to **dino.dhruvagrawat.com**.

```bash
cd website
npm install
npm run dev             # http://localhost:3000
npm run build           # production build (static)
```

Edit site-wide details (links, contact, Play Store URL) in
[website/src/lib/site.ts](website/src/lib/site.ts), and the legal copy in
[website/src/lib/legal.ts](website/src/lib/legal.ts).

---
Made with ♥ by **Quadcydle** · Delhi, India
