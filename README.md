# MobileCloud

React Native (0.73) Android app — Phase 1: Foundation.

## Stack

- React Native 0.73 (bare workflow, TypeScript)
- React Navigation (native-stack)
- Zustand (state) + `react-native-mmkv` (persistence adapter)
- TanStack React Query
- React Native Reanimated + Gesture Handler
- `react-native-config` for environment variables
- Dark theme via `src/theme`

## Folder structure

```
src/
  screens/       Screen components
  components/    Reusable UI components
  navigation/     React Navigation setup
  store/         Zustand stores
  hooks/         Custom hooks
  services/      Storage, API clients, etc.
  theme/         Colors, spacing, typography
  types/         Shared TypeScript types
  utils/         Helper functions
  config/        App-level configuration
android/          Native Android project
```

## Setup (Termux / any environment)

```bash
npm install
cp .env.example .env
```

### Run on Android (requires a connected device/emulator + JDK 17 + Android SDK)

```bash
npm run android
```

### Type check / lint

```bash
npm run typecheck
npm run lint
```

## Building an APK locally

```bash
cd android
./gradlew assembleDebug
# output: android/app/build/outputs/apk/debug/app-debug.apk
```

## CI

`.github/workflows/android-build.yml` builds a debug APK on every push/PR to
`main` and uploads it as a workflow artifact (`app-debug-apk`).

## Environment variables

Copy `.env.example` to `.env` and adjust values. Access variables in JS via
`react-native-config`:

```ts
import Config from 'react-native-config';
Config.API_BASE_URL;
```

## Status

Phase 1 (foundation) — project scaffolding only, no product features yet.
