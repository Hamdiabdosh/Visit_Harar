# 4. Mobile Strategy

> PWA bridge, API layer, and native app plan — designed alongside the web platform from day one.

---

## Recommended sequence

```
Phase 1 (now):     Perfect responsive web + PWA basics
Phase 2 (next):    Extract public REST API from existing server functions
Phase 3 (then):    React Native / Expo app consuming same API
```

**Do not build a native app before the API layer exists.**

---

## Why mobile matters for Harar

| Harar-specific need | Mobile solution |
|---------------------|-----------------|
| Navigating 368 alleyways | Offline map of Jugol |
| Spotty connectivity inside walls | Offline-first cached content |
| Tourists plan before arrival | Saved favorites, itineraries |
| Festival and booking updates | Push notifications |
| Posters and signage in old city | QR codes → deep links to attractions |
| International visitors | Same multilingual content as web |

---

## Current blocker: no public API

Today, data flows through TanStack `createServerFn` — ideal for the web app, **not consumable by a native app**.

The only HTTP API is Better Auth at `/api/auth/*`.

### Required API layer (Phase C)

Wrap existing `src/lib/*-fns.ts` logic — reuse, don't rewrite.

```
GET  /api/v1/attractions
GET  /api/v1/attractions/:slug
GET  /api/v1/guides
GET  /api/v1/guides/:slug
GET  /api/v1/gallery/albums
GET  /api/v1/gallery/albums/:id
GET  /api/v1/announcements
GET  /api/v1/announcements/:slug
GET  /api/v1/pages/:key          # about | culture | plan
GET  /api/v1/contact
GET  /api/v1/hero
GET  /api/v1/map/pois            # aggregated map data
POST /api/v1/bookings
GET  /api/v1/bookings/status     # reference + email lookup
POST /api/v1/inquiries
GET  /api/v1/itineraries         # future
POST /api/v1/chat                # optional, rate-limited
```

### API design principles

- **Read-only public endpoints** for published content only
- **Small payloads** — mobile-optimized DTOs (not full admin shapes)
- **Locale query param** — `?locale=am` when i18n lands
- **Cache headers** — CDN-friendly for static-ish content
- **Rate limiting** on POST endpoints
- **No admin credentials in app bundle** — BFF pattern for any privileged ops
- **Version prefix** — `/api/v1/` allows breaking changes later

---

## Technology choice: React Native / Expo

Aligns with existing **React 19 + TypeScript** stack.

### Shared code (monorepo, future)

```
Visit_Harar/
├── apps/
│   ├── web/              # Current TanStack Start app
│   └── mobile/           # Expo app
├── packages/
│   ├── api-client/       # Shared fetch layer
│   ├── validators/       # Shared Zod schemas (from src/lib/validators/)
│   └── types/            # Shared TypeScript types
```

### Mobile app feature set (MVP)

| Feature | Priority |
|---------|----------|
| Attraction list + detail | P0 |
| Interactive offline map (Jugol) | P0 |
| Pre-built itineraries | P0 |
| Guide profiles + booking | P0 |
| News / events | P1 |
| Gallery | P1 |
| Saved favorites (local storage) | P1 |
| Push notifications | P1 |
| AI chat | P2 |
| User accounts (sync favorites) | P2 |

---

## PWA as interim (Phase A–B)

Before App Store / Play Store launch:

| PWA capability | Benefit |
|----------------|---------|
| Add to home screen | App-like entry without store |
| Service worker caching | Key pages + map tiles offline |
| Web manifest | Brand icon on home screen |
| No review delay | Ship improvements instantly |

Promote from website like [Visit Dubai's app section](https://www.visitdubai.com/en/plan-your-trip/dubai-apps): "Get our app" with PWA install instructions until native app ships.

---

## Offline-first architecture (native app)

For heritage-city navigation, treat network as optional:

```
Local store (SQLite / WatermelonDB)
      ↕ sync
/api/v1/* (background sync when online)
      ↕
PostgreSQL
```

**Cache aggressively:**

- Jugol map tiles and POI data
- Top 10 attractions detail pages
- Emergency contacts and tourism office location
- Pre-built itinerary JSON

---

## Security notes

- Never embed API keys or admin tokens in mobile bundle
- Booking and inquiry POST endpoints need rate limiting + CAPTCHA consideration
- Chat endpoint server-only with OpenRouter key (already the pattern on web)

---

## Open questions

- [ ] Expo vs bare React Native?
- [ ] Push notifications provider (Expo Push, FCM, OneSignal)?
- [ ] Offline map: bundled GeoJSON vs tile cache?
- [ ] App Store accounts — commission or RAAFAT-DIGITAL?
- [ ] Brand name in stores: "Visit Harar"?
