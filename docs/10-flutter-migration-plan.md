# 10. Flutter migration plan

> **Decision (June 2026):** Replace the Expo/React Native client with Flutter.  
> **Keep:** Web CMS, PostgreSQL, `/api/v1`, PWA, push backend logic.  
> **Replace:** `apps/mobile` (Expo) only.

This follows the same **evolve, don't rebuild** principle from [05-evolve-not-rebuild.md](./05-evolve-not-rebuild.md): the backend and API investment from Phases B–C stays; only the native shell is rewritten.

---

## Why Flutter (vs continuing Expo)

| Pain with Expo (observed) | Flutter response |
|---------------------------|------------------|
| React 18 vs 19 conflict in Bun monorepo | Dart/Flutter isolated from web React |
| Metro + Bun + symlinks debugging | Standard Flutter toolchain |
| `react-native-maps` / native module split (.native/.web) | `flutter_map` + OSM — one codebase |
| Expo Go vs dev build vs new architecture confusion | `flutter run` on device/emulator; clear release path |
| Offline tiles awkward on RN | `flutter_map` + `cached_network_image` / custom tile cache |
| Push via Expo Push indirection | FCM (+ APNs) directly — industry standard for stores |

| What we lose | Mitigation |
|--------------|------------|
| ~Phase D Expo scaffold (sunk cost) | Feature spec and API contract already proven |
| Shared TypeScript `api-client` | OpenAPI → Dart codegen (one source of truth) |
| React skill overlap with web | Web stays React; mobile was always a separate client |

**Verdict:** Flutter is a good fit for an **offline map + tourism content** app. The API layer (Phase C) was the critical prerequisite — it is done.

---

## What stays unchanged

```
┌─────────────────────────────────────────────────────────┐
│  Production (Coolify) — NO REWRITE                      │
│  TanStack Start web · PostgreSQL · Drizzle · CMS        │
│  /api/v1/* · push_subscriptions · Resend emails         │
│  PWA (manifest + SW) · QR deep links on web             │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │ HTTPS
                          │
┌─────────────────────────────────────────────────────────┐
│  NEW: apps/flutter (iOS + Android)                      │
│  Dart · flutter_map · drift/hive · FCM                  │
└─────────────────────────────────────────────────────────┘
```

- All [09-api-v1.md](./09-api-v1.md) endpoints
- `packages/shared` envelope types (reference for OpenAPI schemas)
- Admin booking workflow, push notification **server-side** send logic
- Website “Download our app” section (update links when stores live)

---

## Target monorepo layout

```
Visit_Harar/
├── apps/
│   ├── web/                # TanStack Start web app
│   ├── flutter/            # Native mobile app
│   └── mobile/             # Expo (frozen)
├── packages/
│   ├── shared/             # TS types (web + OpenAPI source)
│   └── api-client/         # TS client (web tooling; optional for Flutter)
├── openapi/
│   └── v1.yaml             # NEW — generated from validators or hand-maintained
└── docs/
    └── 10-flutter-migration-plan.md
```

Flutter app internal structure (recommended):

```
apps/flutter/
├── lib/
│   ├── main.dart
│   ├── app.dart                 # MaterialApp + theme + router
│   ├── config/                  # API base URL, env flavors
│   ├── api/                     # Generated + thin wrapper (ApiResponse envelope)
│   ├── features/
│   │   ├── home/
│   │   ├── attractions/
│   │   ├── map/                 # flutter_map + offline tiles
│   │   ├── itineraries/
│   │   ├── guides/
│   │   ├── booking/
│   │   ├── news/
│   │   └── settings/            # notification prefs
│   ├── core/
│   │   ├── theme/
│   │   ├── storage/             # drift or hive — favorites, tile index
│   │   └── push/                # FCM registration
│   └── routing/                 # go_router
├── test/
├── android/
├── ios/
└── pubspec.yaml
```

---

## Backend tweaks (small, not a rewrite)

| Change | Effort | Notes |
|--------|--------|-------|
| OpenAPI spec for `/api/v1` | Low–Medium | Enables Dart `openapi_generator` |
| `POST /api/v1/push/register` accept FCM token | Low | Extend schema: `fcm_token` + platform; keep or deprecate `expo_push_token` |
| Optional: `GET /api/v1/config` | Low | App version, feature flags, maintenance message |
| No CMS changes | — | Admin continues as today |

Push migration: server already sends via Expo Push API. Flutter uses **FCM** → add `firebase-admin` (or HTTP v1) on server, dual-send during transition, then drop Expo tokens.

---

## Migration phases

### Phase F0 — Foundation (1–2 weeks)

**Status (June 2026):** ✅ Complete — scaffold, full OpenAPI contract, API client parity, feature folders.

**Goal:** Flutter app structure + API contract aligned with web before feature implementation.

| Task | Notes |
|------|-------|
| F0.1 Flutter project under `apps/flutter` | Done — `flutter create`, org `et.gov.harar` |
| F0.2 Flavors / env | Done — `--dart-define=API_BASE_URL=…` via `lib/config/env.dart` |
| F0.3 OpenAPI spec + Dart client | Done — `openapi/v1.yaml` (all v1 endpoints); hand-written Dart client mirrors `packages/api-client` |
| F0.4 Brand theme | Done — `lib/core/theme/app_theme.dart` |
| F0.5 `go_router` shell | Done — tabs + deep links for guides, itineraries, booking, news |
| F0.6 Shared geo constants | Done — `packages/shared/src/geo.ts` + `lib/core/constants/geo.dart` |
| F0.7 Feature folder scaffold | Done — placeholders for F1–F3 (`lib/features/*`, `core/storage`, `core/push`) |
| F0.8 CI script | Partial — root `flutter:analyze` / `flutter:test`; CI workflow TBD |

**Exit criteria:** ✅ App launches, fetches attractions, routes match web tourist flows; OpenAPI documents full `/api/v1`.

---

### Phase F1 — Content parity (2–3 weeks)

**Status (June 2026):** ✅ Complete — guides, itineraries, news, favorites, Plan tab; booking remains F3.

**Goal:** Match Expo content screens (except map offline polish).

| Screen | API | Local storage | Status |
|--------|-----|---------------|--------|
| Home | hero optional | — | ✅ |
| Attractions list + detail | `/attractions` | — | ✅ |
| Itineraries list + detail | `/itineraries` | — | ✅ |
| Guides list + detail | `/guides` | — | ✅ |
| News / events detail | `/announcements` | — | ✅ |
| Favorites | — | `shared_preferences` | ✅ |
| Plan tab | itineraries + saved | favorites | ✅ |
| Guide booking + status | `/bookings` | — | ✅ F3 |

**Exit criteria:** Commission can demo full content flow on Android + iOS (map still F2).

---

### Phase F2 — Map + offline (2–3 weeks) — core differentiator

**Status (June 2026):** ✅ Implemented — `flutter_map`, POI markers, offline tile prefetch, POI cache.

**Goal:** Jugol map better than Expo attempt.

| Task | Package / approach | Status |
|------|---------------------|--------|
| Interactive map | `flutter_map` + OSM `TileLayer` | ✅ |
| POI markers | `GET /api/v1/map/pois` | ✅ |
| Marker tap → attraction detail | `go_router` | ✅ |
| Offline tile prefetch | z14–16 Jugol bounds → documents dir; `JugolTileProvider` | ✅ |
| Offline POI cache | `shared_preferences` last `/map/pois` JSON | ✅ |
| Attribution | OSM © on map | ✅ |

Harar center: `9.3133, 42.1261` (same as web `apps/web/src/lib/geo.ts`).

**Exit criteria:** Map usable in Jugol with airplane mode after “Download map” (same UX promise as Expo).

---

### Phase F3 — Booking + push (2 weeks)

**Status (June 2026):** Booking done ✅ — **push deferred to v1.1** (ship Play Store first without FCM).

**Goal:** Production-ready tourist actions.

| Task | API / service | Status |
|------|----------------|--------|
| 4-step booking wizard | `GET /bookings/enabled`, `POST /bookings` | ✅ |
| Booking status lookup | `POST /bookings/status` | ✅ |
| Notification prefs UI | `shared_preferences` + `/push/enabled` | ✅ (UI; FCM token pending) |
| FCM setup | Firebase project, `google-services.json`, APNs key | ❌ |
| Register device token | Extend `POST /api/v1/push/register` | ❌ |
| Server send path | FCM for booking updates + news/events | ❌ |

**Exit criteria:** End-to-end booking on device; push received when admin confirms booking.

---

### Phase F4 — Store launch (1–2 weeks)

**Status (June 2026):** 🔄 In progress — v1.0 ships **without push**; FCM in v1.1.

**Goal:** Play Store internal testing → production. See [11-flutter-play-store.md](./11-flutter-play-store.md).

| Task | Notes | Status |
|------|-------|--------|
| App icons + splash | From `apps/mobile/assets/` via `flutter_launcher_icons` | ✅ |
| Release signing docs | `android/key.properties.example` | ✅ |
| Play Store build | `flutter build appbundle --release` | Ready (needs keystore) |
| Store listings | Screenshots, privacy policy, commission contact | ❌ Manual |
| Internal testing track | Play Console | ❌ |
| Update web `HomeAppPromo` | Real store links after listing live | ❌ |
| Archive `apps/mobile` | After stable Flutter release | ❌ |

**Deferred to v1.1:** Firebase + FCM push (see F3).

---

## Mobile parity checklist (post-F4 polish)

| Step | Feature | Status |
|------|---------|--------|
| 1 | Home — CMS hero, book guide, quick links, featured | ✅ |
| 2 | Images on attractions, guides, news | ✅ |
| 3 | Global search UI | ✅ |
| 4 | Contact / inquiry form | ✅ |
| 5 | Itinerary → attraction links | ✅ |
| 6 | Gallery + services directory | ✅ |
| 7 | Push (FCM) | v1.1 |

### UI/UX polish (in progress)

| Item | Status |
|------|--------|
| Theme tokens (buttons, inputs, nav bar) | ✅ |
| Shared widgets (EmptyState, SectionHeading, TrustBadge) | ✅ |
| Pull-to-refresh on list screens | ✅ |
| Branded empty & error states | ✅ |
| Dynamic detail screen titles | ✅ |
| Docked “Book guide” FAB on main tabs | ✅ |
| Typography & spacing consistency | 🔄 Ongoing |

---

## Expo → Flutter feature mapping

| Expo (current) | Flutter |
|----------------|---------|
| `expo-router` tabs | `go_router` + `ShellRoute` + `NavigationBar` |
| `@visit-harar/api-client` | `visit_harar_api` (generated Dart) |
| `AsyncStorage` favorites | `hive` or `drift` |
| `react-native-maps` + tile FS cache | `flutter_map` + cached tiles |
| `expo-notifications` | `firebase_messaging` |
| `DateTimePicker` / booking form | Flutter `showDatePicker` + form widgets |
| Platform splits (.web/.native) | Single Dart codebase (no web target needed) |

**Intentionally skip in v1 Flutter:** in-app web preview, Expo Go workflow, AI chat (P2).

---

## Dependencies (Flutter pubspec starter)

```yaml
dependencies:
  flutter:
    sdk: flutter
  go_router: ^14.x
  dio: ^5.x                    # HTTP client
  flutter_riverpod: ^2.x      # or bloc — state management
  flutter_map: ^7.x
  latlong2: ^0.9.x
  hive_flutter: ^1.x            # favorites + simple cache
  firebase_core: ^3.x
  firebase_messaging: ^15.x
  cached_network_image: ^3.x    # attraction images
  intl: ^0.19.x                 # dates, future i18n
```

---

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Team unfamiliar with Dart | Start F0–F1; API work is similar to Expo client |
| Rewrite delays store launch | Parallel: freeze Expo fixes except blockers; timebox Flutter MVP |
| Push backend dual maintenance | Short dual-send window; migrate tokens on first app open |
| Offline map storage size | Same Jugol bounds + zoom limits as Expo (z14–16) |
| i18n (Phase E) later | Flutter `intl` + ARB files; API `?locale=` when ready |

---

## Recommended immediate next steps

1. **Approve this plan** — confirm Flutter over continuing Expo investment.
2. **F0 kickoff** — scaffold `apps/flutter`, first API call to attractions.
3. **OpenAPI** — add `openapi/v1.yaml` (unblocks Dart codegen forever).
4. **Freeze Expo** — no new Expo features; only fix if blocking commission demo.
5. **Firebase project** — create for FCM (can wait until F3).

---

## Roadmap placement

```
Phase A–C (done) ──► Phase D Expo (partial) ──► Phase F Flutter (replaces D6)
                              │
                              └── apps/mobile archived after F4
Phase E (differentiation) ──► unchanged; Flutter benefits from same API
```

Update [06-phased-roadmap.md](./06-phased-roadmap.md) when F0 starts.

---

## Open decisions

- [ ] **State management:** Riverpod vs Bloc vs Provider?
- [ ] **Local DB:** Hive (simple) vs Drift/SQLite (relational, better for offline sync later)?
- [ ] **Maps:** `flutter_map` only, or Mapbox when budget allows?
- [ ] **Store accounts:** Harari Tourism Commission vs RAAFAT-DIGITAL?
- [ ] **iOS first vs Android first** for internal testing?
- [ ] **Drop Expo directory** immediately or keep until F4?

---

## Effort summary (2-person team, part-time mobile)

| Phase | Duration | Cumulative |
|-------|----------|------------|
| F0 Foundation | 1–2 weeks | 2 weeks |
| F1 Content parity | 2–3 weeks | 5 weeks |
| F2 Map + offline | 2–3 weeks | 8 weeks |
| F3 Booking + push | 2 weeks | 10 weeks |
| F4 Store launch | 1–2 weeks | **~12 weeks** |

Faster if full-time mobile focus; add buffer for commission content/review cycles.
