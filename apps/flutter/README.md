# Visit Harar — Flutter app

Official mobile client for the Harari Tourism Commission. Replaces the frozen Expo app in `apps/mobile`.

## Prerequisites

- [Flutter SDK](https://docs.flutter.dev/get-started/install) (stable channel)
- **Java 17** for Android builds (Arch Java 26 is too new for Gradle):

```bash
export PATH="$HOME/flutter/bin:$HOME/Android/Sdk/platform-tools:$PATH"
export JAVA_HOME="$HOME/.local/jdks/jdk-17.0.14+7"
export ANDROID_HOME="$HOME/Android/Sdk"
```

These are in `~/.zshrc` after setup — run `source ~/.zshrc` in new terminals.

## Setup

```bash
cd apps/flutter
flutter pub get
```

Regenerate launcher icons + splash (after changing `assets/`):

```bash
dart run flutter_launcher_icons
dart run flutter_native_splash:create
```

## Run on device

```bash
flutter devices
flutter run -d <device-id>
```

From repo root: `bun run flutter:dev`

## Release build (Play Store)

See [docs/11-flutter-play-store.md](../../docs/11-flutter-play-store.md).

```bash
flutter analyze && flutter test
flutter build appbundle --release
```

**Website sideload (APK on homepage):**

```bash
# From repo root
bun run flutter:apk:web
```

Copies `app-release.apk` → `apps/web/public/downloads/visit-harar.apk`. Rebuild/redeploy the web app so the file is included in the Docker image.

## Phase status

| Phase | Scope | Status |
|-------|--------|--------|
| F0 | Structure + OpenAPI + API client | ✅ |
| F1 | Content screens | ✅ |
| F2 | Map + offline tiles | ✅ |
| F3 | Booking + status | ✅ |
| F3 | Push (FCM) | ⏸ v1.1 |
| F4 | Store launch | 🔄 In progress |

See [docs/10-flutter-migration-plan.md](../../docs/10-flutter-migration-plan.md).
