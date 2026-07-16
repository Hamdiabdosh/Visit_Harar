# 7. Public REST API (v1)

> Phase C — mobile-ready read/write API wrapping existing `*-fns.ts` logic.

Base URL: `https://visitharar.et/api/v1` (or your deployment origin).

OpenAPI 3.1 spec: [`openapi/v1.yaml`](../openapi/v1.yaml) (source of truth for Flutter/codegen).

---

## Response format

**Success**

```json
{
  "ok": true,
  "data": { … },
  "meta": {
    "version": "v1",
    "generated_at": "2026-06-13T12:00:00.000Z"
  }
}
```

**Error**

```json
{
  "ok": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Attraction not found"
  }
}
```

Common status codes: `200`, `404`, `422`, `429`, `500`.

---

## Read endpoints (GET)

| Path | Description | Cache |
|------|-------------|-------|
| `/api/v1` | API index + endpoint list | 5 min |
| `/api/v1/attractions` | Published attractions | 60s |
| `/api/v1/attractions/:slug` | Single attraction | 60s |
| `/api/v1/guides` | Published guides | 60s |
| `/api/v1/guides/:slug` | Single guide | 60s |
| `/api/v1/gallery/albums` | Published albums | 60s |
| `/api/v1/gallery/albums/:id` | Album + items (UUID) | 60s |
| `/api/v1/announcements` | Paginated news (`?page=1&per_page=20&type=Event`) | 60s |
| `/api/v1/announcements/:slug` | Single announcement | 60s |
| `/api/v1/pages/:key` | CMS page (`about`, `culture`, `plan`) | 60s |
| `/api/v1/contact` | Published contact info | 60s |
| `/api/v1/hero` | Published homepage hero | 60s |
| `/api/v1/map/pois` | Map POIs (published + coordinates) | 60s |
| `/api/v1/partners` | Services directory (`?category=Hotel`) | 60s |
| `/api/v1/itineraries` | Published itineraries | 60s |
| `/api/v1/itineraries/:slug` | Single itinerary | 60s |
| `/api/v1/search?q=jugol&limit=15` | Global search | 60s |
| `/api/v1/chat/enabled` | Whether chat is configured | 60s |
| `/api/v1/bookings/enabled` | Whether tour booking is open | 60s |
| `/api/v1/push/enabled` | Whether push delivery is configured | 60s |

All read endpoints return **published content only**.

---

## Write endpoints (POST)

| Path | Body | Rate limit |
|------|------|------------|
| `/api/v1/bookings` | See `bookingInputSchema` in `src/lib/validators/bookings.ts` | 10/min/IP |
| `/api/v1/bookings/status` | `{ "booking_ref": "…", "visitor_email": "…" }` | 20/min/IP |
| `/api/v1/inquiries` | See `inquirySchema` in `src/lib/validators/inquiry.ts` | 5/min/IP |
| `/api/v1/push/register` | See `pushRegisterSchema` in `src/lib/validators/push.ts` | 30/min/IP |
| `/api/v1/push/unregister` | `{ "expo_push_token": "ExponentPushToken[…]" }` | 30/min/IP |
| `/api/v1/chat` | See `sendChatInputSchema` in `src/lib/validators/chat.ts` | 20/min/IP |

---

## Example requests

```bash
# List attractions
curl -s https://visitharar.et/api/v1/attractions | jq .

# Map POIs for mobile
curl -s https://visitharar.et/api/v1/map/pois | jq .

# Search
curl -s "https://visitharar.et/api/v1/search?q=jugol" | jq .

# Submit inquiry
curl -s -X POST https://visitharar.et/api/v1/inquiries \
  -H 'content-type: application/json' \
  -d '{"name":"Jane Doe","email":"jane@example.com","subject":"Visit info","message":"Planning a trip in July."}'
```

---

## CORS

Set `API_CORS_ORIGIN` (comma-separated origins) or rely on `VITE_APP_URL` / `APP_URL`. Defaults to `*` for read-only mobile/PWA clients.

---

## Shared types

API envelope types live in `packages/shared` (`@visit-harar/shared`). Validators remain in `src/lib/validators/` until Phase D monorepo extraction.

---

## Implementation notes

- Handlers call existing TanStack `createServerFn` modules — no duplicated DB logic.
- Route entry: `src/routes/api/v1/$.ts` + `src/routes/api/v1/index.ts`.
- Dispatcher: `src/lib/api/v1/handle.ts`.

---

## Future (Phase D)

- OpenAPI JSON export
- `locale` query param on all read endpoints
- JWT or API key for partner integrations (if needed)
