# 11. Flutter Play Store release (v1.0 — no push)

> **Strategy (June 2026):** Ship v1.0 with content, map, and booking. **Push notifications (FCM) deferred to v1.1** — Coolify hosts the API; Google FCM is only needed for device alerts.

---

## What v1.0 includes

- Home, attractions, guides, itineraries, news
- Offline Jugol map + POI markers
- Guide booking request + status lookup
- Notification **prefs UI** (saved locally; alerts in v1.1)

---

## Prerequisites

- Flutter SDK on PATH + Java 17 (`JAVA_HOME` — see `apps/flutter/README.md`)
- Android SDK (`ANDROID_HOME`)
- [Google Play Console](https://play.google.com/console) developer account ($25 one-time)
- Privacy policy URL (can use site `/privacy` or dedicated page)

---

## 1. Brand assets

Icons and splash are generated from `apps/flutter/assets/` (copied from Expo):

```bash
cd apps/flutter
flutter pub get
dart run flutter_launcher_icons
dart run flutter_native_splash:create
```

---

## 2. Release signing (Android)

```bash
keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
cp android/key.properties.example android/key.properties
# Edit key.properties with absolute path to keystore
```

Wire signing in `android/app/build.gradle.kts` (see [Flutter docs](https://docs.flutter.dev/deployment/android#signing-the-app)).

---

## 3. Build release APK / App Bundle

```bash
cd apps/flutter
flutter analyze && flutter test
flutter build appbundle --release
# Output: build/app/outputs/bundle/release/app-release.aab
```

Upload **`.aab`** to Play Console → Internal testing first, then Production.

Optional APK for sideload testing:

```bash
flutter build apk --release
```

---

## 4. Play Console checklist

| Item | Notes |
|------|--------|
| App name | Visit Harar |
| Package | `et.gov.harar.visit_harar` |
| Category | Travel & Local |
| Content rating | Questionnaire |
| Data safety | API calls to visitharar.raafat.site; favorites stored on device |
| Screenshots | Phone — Home, Map, Attractions, Book flow |
| Short description | Official Harar tourism guide — map, places, book a licensed guide |
| Contact email | Commission / bureau email |

---

## 5. Website download (before / alongside Play Store)

Ship the release APK on the homepage so visitors can install directly:

```bash
# From repo root — builds APK and copies it into the web app static files
bun run flutter:apk:web
bun run build
```

The file is served at **`/downloads/visit-harar.apk`**. The site footer links to it automatically.

To host the APK elsewhere (CDN, object storage), set `VITE_ANDROID_APK_URL` at web build time (see `.env.example`).

---

## 6. After Play Store link exists

Optionally add a Play Store button alongside the APK download in `apps/web/src/components/public/PublicFooter.tsx`. iOS (TestFlight / App Store) when Mac + Apple Developer account available.

---

## v1.1 — Push (later)

1. Firebase project + `google-services.json`
2. `firebase_messaging` in Flutter
3. Extend `POST /api/v1/push/register` for `fcm_token`
4. Server: FCM send alongside or instead of Expo Push API

See [10-flutter-migration-plan.md](./10-flutter-migration-plan.md) Phase F3.
