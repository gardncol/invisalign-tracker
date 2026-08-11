# Invisalign Tray Tracker

A React Native (Expo) mobile app that tracks Invisalign tray wear time, sends smart reminders, and reports compliance across daily/weekly/tray-level periods.

## Features

- **One-tap wear tracking** — Big IN/OUT toggle button on the home screen
- **Daily progress ring** — Live hours worn vs. goal with on-pace indicator
- **Streak counter** — Consecutive days meeting your goal (🔥)
- **Tray progress bar** — Visual progress through your tray sequence
- **Timeline** — Chronological event list with date navigation, edit/delete, and add missed events
- **Reports** — 7-day bar chart, 12-week trend line chart, compliance percentage
- **Tray change reminders** — Scheduled notifications with day-drift support
- **Put-back-in alarms** — Smart nudges when trays have been out too long during awake hours
- **Overnight prompts** — Morning check if trays stayed in overnight
- **Dark & light mode** — System, light, or dark theme preference
- **Selectable tray change day** — Pick a specific day of the week for tray changes
- **Local-first** — All data stored on-device with expo-sqlite + Drizzle ORM

## Tech Stack

- Expo SDK 57 (React Native 0.86)
- TypeScript
- Expo Router (file-based navigation, bottom tabs)
- expo-sqlite + Drizzle ORM (local database)
- expo-notifications (local scheduled notifications)
- Zustand (state management)
- date-fns (date utilities)
- Jest + jest-expo (testing)

## Getting Started

```bash
cd invisalign-tracker
npm install
npx expo start
```

## Building

```bash
# Android release APK
npx expo prebuild --platform android --no-install --clean
cd android
./gradlew assembleRelease
# APK at android/app/build/outputs/apk/release/app-release.apk
```

## Project Structure

```
app/                    # Expo Router screens
  _layout.tsx           # Root layout (DB init, navigation guard, notifications)
  onboarding.tsx        # 4-step onboarding wizard
  (tabs)/               # Bottom tab navigator
    _layout.tsx         # Tab bar with icons
    index.tsx           # Home — toggle, progress ring, tray info
    timeline.tsx        # Timeline — event list, edit, add missed events
    reports.tsx         # Reports — charts and compliance
    settings.tsx        # Settings — profile, notifications, theme
  tray-change.tsx       # Modal — tray change confirmation flow
src/
  db/                   # Database schema, client, repositories
  services/             # Business logic (time calc, scheduler, notifications, alarms)
  stores/               # Zustand stores (user, events, onboarding)
  hooks/                # React hooks (tray state, progress, streak, notifications)
  components/            # Reusable UI components
  types/                # Shared TypeScript types
  utils/                # Date helpers, constants, theme
__tests__/              # Jest unit tests
```

## License

MIT