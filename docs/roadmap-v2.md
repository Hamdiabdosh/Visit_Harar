# Visit Harar V2 Roadmap

> **Purpose:** Sprint-based execution plan for V2 — implements locked decisions in [`v2-plan.md`](./v2-plan.md).  
> **Status:** V2-001 ✅ · V2-002 ✅ · V2-003 ✅ · V2-004…V2-006 planned  
> **Last updated:** 2026-07-16  
> **Related:** [`v2-plan.md`](./v2-plan.md) (locks) · [`06-phased-roadmap.md`](./06-phased-roadmap.md) (Phases A–E) · [`03-admin-cms-strategy.md`](./03-admin-cms-strategy.md)

---

## Engineering principle

Build in **dependency order**, vertical slices, reuse first:

```
T2 Public hide flags (book + event RSVP + app + PWA)
  → T1 Shell nav (Feed / Create / Media / Messages / More)
    → Create sheet (L-008 types)
      → Feed (L-009)
        → Preview before publish (L-007)
          → Polish (mobile admin + CTA pass)
```

Not a parallel rewrite of every admin page. Each sprint ships **one usable path** + one check that fails if it breaks.

Reuse existing editors (`announcements.$id`, `attractions.$id`, gallery, guides, media, inquiries). **No** unified `posts` table (L-006).

---

## Sprint index

```
Public surface (T2)
│
├── V2-001  Hide book + event RSVP + app + PWA (flags, soft-gates, CTAs)  ✅
│
Admin shell (T1)
│
├── V2-002  Shell nav: Feed · Create · Media · Messages · More             ✅
├── V2-003  Create sheet → News · Event · Attraction · Photo · Guide       ✅
├── V2-004  Home/Feed for Create types
├── V2-005  Preview before publish
│
Finish
│
└── V2-006  Polish (mobile admin QA + public CTA consistency)
```

| Sprint | Theme | Area | Locks | Status |
|--------|-------|------|-------|--------|
| V2-001 | T2 | Public hide + soft-gates + contact CTAs | L-005, L-003 | ✅ |
| V2-002 | T1 | Primary nav shell + More | L-006, L-001 | ✅ |
| V2-003 | T1 | Create (+) type picker | L-008, L-006 | ✅ |
| V2-004 | T1 | Feed | L-009, L-004 | 🔲 |
| V2-005 | T1 | Preview on Create/Edit | L-007, L-004 | 🔲 |
| V2-006 | T1/T2 | Polish + mobile QA | L-006, L-005 | 🔲 |

> **V3 (not in this roadmap):** Unhide book/event RSVP/PWA; Flutter store ship — see [`v2-plan.md`](./v2-plan.md) Parked for V3.

> **Don’t-block (T3–T5):** Languages, on-site depth, platform quality — schedule after V2-006 or park; not required to close V2 shell.

---

## Cross-cutting

| Domain | Approach |
|--------|----------|
| Data model | Unchanged; shell + flags only |
| Roles | `superadmin` / `editor` unchanged; Users/Audit/Settings under More (superadmin) |
| Booking / RSVP | Code + tables stay; public UI off; admin queues under More |
| Publish / audit | L-004 — every Create path still explicit publish + audit |
| Flutter / PWA product | Frozen for V2 delivery (L-002) |

---

## Reuse map

| Sprint | Prefer reuse | Avoid |
|--------|--------------|--------|
| V2-001 | Public nav, footer, homepage promo, `/book*`, event register/ticket routes, env/settings patterns | Deleting `apps/flutter`, SW files, or DB tables |
| V2-002–004 | `DashboardSidebar`, `AdminLayout`, existing CRUD routes, inquiries badge | New CMS entities; Stories/Reels |
| V2-005 | Public attraction/news/guide routes for iframe or phone-frame preview | Separate staging deploy |
| V2-006 | Existing breakpoints / Sheet mobile nav | Full visual redesign of public site |

---

# V2-001 — Hide book, event RSVP, app, PWA

**Status:** ✅  
**Theme:** T2  
**Locks:** L-005, L-003

## Goal

Visitors no longer see guide booking, event RSVP/ticket actions, app download, or PWA install. Events/news remain readable. Legacy URLs soft-gate to contact. Admin booking/RSVP queues move out of primary nav.

## Scope

- Feature flags / env (or site settings): `publicBooking`, `publicEventRsvp`, `pwaInstall`, `appPromo` — default off for V2 product stance
- Hide nav/CTAs for `/book`, event register; replace with Contact / Guides
- Soft landing for legacy book + event status/ticket URLs
- Admin: Bookings + Event registrations under **More** (or equivalent), not primary “Bookings” section
- Do **not** delete schema, Flutter, or SW source

## Shipped

- `site_settings`: `event_rsvp_enabled`, `pwa_install_enabled`, `app_promo_enabled` (+ booking stays); defaults **off**; admin Settings toggles
- Manual SQL: [`drizzle/manual/v2-001-public-surfaces.sql`](../drizzle/manual/v2-001-public-surfaces.sql)
- `PublicSurfacesProvider` + soft-gate pages; CTAs → Guides/Contact when booking off
- Event registration panel + API gated; PWA register/install + APK footer gated
- Admin sidebar: Inquiries primary; Bookings + Event registrations under **More**

## Check

- Public: no book or RSVP CTA on homepage / guides / event detail; hitting `/book` shows soft message (not 404)
- Admin: can still open bookings/registrations via More; data intact
- App banner + PWA install UI not shown

## Out of scope

- Unhide logic beyond a flag (V3)
- Payments

---

# V2-002 — Admin shell nav

**Status:** ✅  
**Theme:** T1  
**Locks:** L-006, L-001

## Goal

Primary admin chrome is **Feed · Create · Media · Messages · More**. Old flat sidebar becomes More (or secondary). Mobile-friendly primary nav.

## Scope

- Restructure [`DashboardSidebar.tsx`](../apps/web/src/components/dashboard/DashboardSidebar.tsx) (or replace primary chrome) per L-006
- Messages → `/admin/inquiries` + badge
- Media → `/admin/media` (grid polish can wait for V2-006)
- More → attractions, gallery, pages, announcements list, guides, partners, itineraries, hero, contact, analytics, bookings, event registrations, users, audit, settings
- Keep deep links to all existing routes working

## Shipped

- Primary: Feed (`/admin`), Media, Messages (inquiries badge), Create button
- Collapsible **More** with power tools; Users/Audit/Settings superadmin-only
- Create opens [`AdminCreateSheet`](../apps/web/src/components/admin/AdminCreateSheet.tsx) (V2-003)

## Check

- Editor login: sees ≤5 primary destinations; can reach Attractions and Settings via More
- Superadmin: Users / Audit / Settings reachable
- Old `/admin/attractions` URLs still work

## Out of scope

- Feed content cards (V2-004)

---

# V2-003 — Create sheet

**Status:** ✅  
**Theme:** T1  
**Locks:** L-008, L-006

## Goal

One **Create (+)** entry: News · Event · Attraction · Photo · Guide → existing editors (deep-link with type where needed).

## Scope

- Create sheet / dialog from primary nav
- News → announcement new with `News`; Event → announcement new with `Event` (RSVP UI remains off publicly)
- Attraction / Guide → `…/new` routes
- Photo → gallery create album or media upload entry (pick the shortest existing path; document in sprint notes)
- Notice / Partner / etc. **not** in Create (More only)

## Shipped

- `AdminCreateSheet` dialog with five types
- Announcement editor accepts `?type=News|Event` on `/admin/announcements/new`
- Photo → `/admin/gallery` (album create UI on that page)

## Check

- From Create, can open each of the five types in ≤2 taps from logged-in admin home
- Event create does not show public RSVP as enabled-by-default for visitors (L-005 still holds)

## Out of scope

- Unified post model
- Preview (V2-005)

---

# V2-004 — Home / Feed

**Status:** 🔲  
**Theme:** T1  
**Locks:** L-009, L-004

## Goal

`/admin` (or Feed route) shows recent News, Event, Attraction, Photo, Guide items (draft + published) with Edit / Publish-Unpublish where applicable.

## Scope

- Aggregate recent rows from existing list APIs / queries (no new tables)
- Cards deep-link to editors
- Replace or demote old metrics-heavy dashboard widgets as the default home (analytics stays under More)

## Check

- Creating a News draft via Create appears on Feed after refresh
- Publish/unpublish from editor reflects on Feed and public site rules still apply

## Out of scope

- Boost to homepage (T1-C3)
- Full audit log as Feed

---

# V2-005 — Preview before publish

**Status:** 🔲  
**Theme:** T1  
**Locks:** L-007, L-004

## Goal

Create/Edit for announcements (News/Event) and at least one other Create type (prefer Attraction or Guide) offers Preview (phone frame or new tab to public route) before Publish.

## Scope

- Preview control on announcement editor; expand to attraction/guide if public slug routes make it cheap
- Still requires explicit Publish; audit unchanged

## Check

- Draft News: Preview shows public-like view; unpublished content not listed publicly
- Publish still required to appear on public listing

## Out of scope

- Staging environment
- Editorial approval workflow (T1-C1)

---

# V2-006 — Polish

**Status:** 🔲  
**Theme:** T1 / T2  
**Locks:** L-006, L-005

## Goal

Shell usable on phone-width admin; public CTAs consistent after hide flags; no obvious leftover book/app/PWA chrome.

## Scope

- Mobile QA bar: primary nav, Create sheet, Feed, Messages
- Sweep public templates for stray book/app/PWA strings
- Light empty states on Feed / Create

## Check

- Admin usable at ~390px width for Feed + Create + Messages
- Grep/manual pass: no visitor-facing “Book a guide” / “Install app” / PWA install when flags off

## Out of scope

- Public site visual redesign
- T3 languages / T4 audio / T5 test suite (don’t-block)

---

## After V2-006

- Optionally schedule T3 (Amharic depth) or park  
- V3 planning: unhide book + event RSVP + PWA; Flutter ship per [10](./10-flutter-migration-plan.md) / [11](./11-flutter-play-store.md)
