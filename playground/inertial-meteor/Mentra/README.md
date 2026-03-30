# Mentra — Brain Training App

A science-backed cognitive training app built with React Native (Expo).  
Developed by **Tever Technology**.

---

## Setup

```bash
npm install
npx expo start
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
EXPO_PUBLIC_REVENUECAT_APPLE_KEY=appl_xxxxx
EXPO_PUBLIC_ANTHROPIC_KEY=sk-ant-xxxxx
```

For production builds, set these as **EAS Secrets**:
```bash
eas secret:create --scope project --name EXPO_PUBLIC_REVENUECAT_APPLE_KEY --value "appl_xxx"
eas secret:create --scope project --name EXPO_PUBLIC_ANTHROPIC_KEY --value "sk-ant-xxx"
```

## Build

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Development build (simulator)
eas build --platform ios --profile development

# Production build (App Store)
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

## Before App Store Submission

- [ ] Set real RevenueCat Apple key via EAS Secrets
- [ ] Set real Anthropic API key via EAS Secrets  
- [ ] Fill in Apple Team ID in `eas.json` → `submit.production.ios.appleTeamId`
- [ ] Fill in App Store Connect App ID in `eas.json` → `submit.production.ios.ascAppId`
- [ ] Upload `store-assets/` screenshots to App Store Connect
- [ ] Set Privacy Policy URL: `https://www.tevertechnology.com/mentra-privacy`
- [ ] Deploy `website/` files to `www.tevertechnology.com`
- [ ] Replace `TEAMID` in `website/.well-known/apple-app-site-association`

## Architecture

```
app/
  (tabs)/         ← Main tab screens
    index.tsx     ← Home (score, games, growth edge)
    training.tsx  ← Diagnostics radar
    explore.tsx   ← Browse programs
    activity.tsx  ← Progress & achievements
    coach.tsx     ← AI Coach (Claude API)
    profile.tsx   ← Settings
  onboarding.tsx  ← 4-step: Lang → Name → Challenge → Identity
  consent.tsx     ← GDPR/KVKK/PDPL first-launch gate
  game/           ← Schulte table, memory grid, speed match
  paywall/        ← RevenueCat subscription flows
  legal/          ← Privacy, Terms, Disclaimer

services/
  aiCoach.ts      ← Anthropic Claude API
  purchases.ts    ← RevenueCat
  i18n.ts         ← 5 languages: EN/TR/AR/FR/DE
  ramadan.ts      ← Ramadan fasting-aware training
  storage.ts      ← AsyncStorage CRUD
  streak.ts       ← Streak tracking

locales/          ← en.json, tr.json, ar.json, fr.json, de.json (329 keys each)
store-assets/     ← App Store metadata (descriptions all 5 languages)
website/          ← tevertechnology.com (landing, privacy, terms, AASA)
```

## Tech Stack

| Tech | Version |
|---|---|
| Expo | ~54 |
| React Native | 0.81.5 |
| TypeScript | ~5.9 |
| expo-router | ~6 |
| react-native-purchases (RevenueCat) | ^9 |
| react-native-reanimated | ~4 |
| Anthropic Claude API | claude-opus-4-5 |

## Supported Regions

| Region | Language | Special Features |
|---|---|---|
| US / UK / Global | English | — |
| Turkey | Turkish | KVKK consent |
| GCC / MENA | Arabic (RTL) | Ramadan mode, PDPL consent |
| France / N. Africa | French | GDPR consent |
| Germany / Austria | German | GDPR consent |
