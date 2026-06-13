# Mentra — iOS Build & App Store Submission Guide

This document is for building and submitting Mentra to the App Store using EAS Build.

---

## Prerequisites

You need:
- Node.js 18+ installed
- An Apple Developer account (part of the Tever Technology team)
- EAS CLI installed: `npm install -g eas-cli`
- Access to EAS project (project ID: `016948c8-c1d6-44a0-a397-11c841905e1b`)

---

## Step 1 — Clone and Install

```bash
git clone https://github.com/eymentever/mentra-ios.git
cd mentra-ios
npm install
```

---

## Step 2 — Log in to EAS

```bash
eas login
# Log in with the Tever Technology Expo account
```

---

## Step 3 — Set EAS Secrets (first time only)

These API keys must be set as EAS environment variables. They are NOT in the repo.

```bash
# RevenueCat Apple key (from app.revenuecat.com → API Keys)
eas env:create --name EXPO_PUBLIC_REVENUECAT_APPLE_KEY --value "appl_xxxxx" --environment production

# Gemini AI key (from aistudio.google.com → API Keys)
eas env:create --name EXPO_PUBLIC_GEMINI_KEY --value "AIzaxxxxx" --environment production
```

To verify secrets are set:
```bash
eas env:list --environment production
```

---

## Step 4 — Build for App Store

```bash
eas build --platform ios --profile production
```

This will:
1. Upload the code to EAS Build servers
2. Handle iOS signing automatically (certificates + provisioning profiles via `credentialsSource: remote`)
3. Auto-increment the build number
4. Produce a signed `.ipa` ready for App Store

The build takes ~10–15 minutes. You'll get a download link when done.

---

## Step 5 — Submit to App Store

After the build completes:

```bash
eas submit --platform ios
```

Or submit the downloaded `.ipa` manually via Xcode → Organizer → Distribute App → App Store Connect.

Before submitting, ensure in App Store Connect:
- App record exists for `com.tevertechnology.mentra`
- App description, screenshots, and keywords are uploaded
- Privacy policy URL is set: `https://www.tevertechnology.com/mentra-privacy`
- Age rating is configured (4+)

---

## Building Locally with Xcode (alternative)

If you need to build directly in Xcode instead of EAS:

```bash
# Generate the native iOS project
npx expo prebuild --platform ios --clean

# Open in Xcode
open ios/Mentra.xcworkspace
```

Then in Xcode:
1. Select your Apple Development Team in **Signing & Capabilities**
2. Set scheme to `Mentra` and destination to **Any iOS Device**
3. **Product → Archive**
4. In Organizer → **Distribute App → App Store Connect**

---

## App Details

| Field | Value |
|-------|-------|
| Bundle ID | `com.tevertechnology.mentra` |
| Version | `1.0.0` |
| Deployment Target | iOS 16.0+ |
| Apple ID | `eymen@tevertechnology.com` |
| EAS Project | `016948c8-c1d6-44a0-a397-11c841905e1b` |

---

## App Store Metadata

Store copy is at `store/metadata/en/`:
- `description.txt` — full App Store description
- `keywords.txt` — search keywords

Upload screenshots (6.7" iPhone + 12.9" iPad) to App Store Connect manually.
Required screenshot sizes: 1290×2796 (iPhone 6.7"), 2048×2732 (iPad Pro 12.9").

---

## Troubleshooting

**Build fails with "missing credentials"**
→ Run `eas credentials` to manage certificates and provisioning profiles.

**`EXPO_PUBLIC_GEMINI_KEY` missing in build**
→ Verify with `eas env:list --environment production`. Re-create with `eas env:create`.

**`eas.json` validation errors**
→ Do NOT add API key values to `eas.json`. Secrets belong in EAS environment variables only.

**"Associated Domains" entitlement error**
→ The `applinks:tevertechnology.com` domain must be configured in your Apple Developer portal under the app's identifier.
