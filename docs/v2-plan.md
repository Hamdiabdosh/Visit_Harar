# Visit Harar V2 Plan

> **Purpose:** Living plan for what we ship in V2 — locked decisions only become build commitments.  
> **Status:** T1–T2 locked for build (L-001…L-009); sprint index in [`roadmap-v2.md`](./roadmap-v2.md); T3–T5 Leading / don’t-block; Flutter · PWA · book/RSVP product → V3  
> **Last updated:** 2026-07-16  
> **Related:** [01-vision-and-current-state.md](./01-vision-and-current-state.md) · [03-admin-cms-strategy.md](./03-admin-cms-strategy.md) · [05-evolve-not-rebuild.md](./05-evolve-not-rebuild.md) · [06-phased-roadmap.md](./06-phased-roadmap.md) · [roadmap-v2.md](./roadmap-v2.md) (sprints) · [10-flutter-migration-plan.md](./10-flutter-migration-plan.md) · [11-flutter-play-store.md](./11-flutter-play-store.md)

---

## How to use this document

| Section | Meaning |
|---------|---------|
| **Locked** | Decided. Do not reopen unless product constraints change. Ready to turn into sprints when V2 execution starts. |
| **Leading** | Strong preferred direction from brainstorm. Not locked yet — needs a yes. |
| **Candidates** | Ideas under discussion. May change or die. |
| **Parked** | Explicitly out of V2 (or deferred). Capture so we don’t rediscover them. |
| **Open questions** | Blocks locking. Answer these to promote Leading → Locked. |

**Promotion rule:** An idea moves to **Locked** only when we can state *what*, *why*, and *what we are not doing*.

When brainstorming for a theme is done, promote Leading items → Locked, then break Locked items into a sprint index (`roadmap-v2.md`), same style as RAAFAT-E-LEARNING V2.

---

## V2 north star

> Keep the public tourism site as the product. **Hide booking, app, and PWA from visitors until V3.** Make `/admin` feel like posting on Instagram — **Feed, one Create, Media, Messages** — by reshaping the **shell only**, reusing every existing editor.

Grounded in: evolve-not-rebuild ([05](./05-evolve-not-rebuild.md)), commission CMS reality ([03](./03-admin-cms-strategy.md)), brainstorm 2026-07-16 (public hide-only + admin shell-only).

---

## Locked decisions

### L-001 — Evolve, don’t rebuild

- **Date locked:** 2026-07-16
- **Theme:** Cross-cutting
- **Decision:** Keep TanStack Start (web) + PostgreSQL + Drizzle + Better Auth + `/api/v1`. Customize and extend; do not rewrite on WordPress, Strapi, a SaaS DMO, or a new framework.
- **Why:** Feature parity rebuild would cost months; technology is not the bottleneck. See [05-evolve-not-rebuild.md](./05-evolve-not-rebuild.md).
- **Not doing:** Greenfield CMS, swapping ORMs/auth for cosmetics, replacing TipTap/CRUD backends with a new “social CMS” product.
- **Implications:** V2 ships as shell + flags on `apps/web`. `apps/flutter` stays in the monorepo but is not a V2 delivery theme (see L-002).

### L-002 — Flutter is the future client, not a V2 delivery theme

- **Date locked:** 2026-07-16 (revised; supersedes earlier “ship Flutter in V2” lock)
- **Theme:** Cross-cutting / V3
- **Decision:** Flutter (`apps/flutter`) remains the intended native client when we resume mobile; Expo (`apps/mobile`) stays frozen. **V2 does not** ship store builds, offline polish, or public app promotion.
- **Why:** Commission priority is operable CMS + a clear public content site. Mobile/PWA/booking product work waits for V3.
- **Not doing in V2:** Play/App Store submission, FCM push as a milestone, “Download our app” as a visitor CTA, treating Flutter as blocking V2 exit.
- **Implications:** Docs [10](./10-flutter-migration-plan.md) / [11](./11-flutter-play-store.md) remain valid for **V3**. Do not delete `apps/flutter`.

### L-003 — No online payments (V2 and when booking returns)

- **Date locked:** 2026-07-16
- **Theme:** Cross-cutting
- **Decision:** No payment gateway. When booking/event registration return in V3, they stay **request / RSVP** (ref codes, admin confirm/decline, email) unless a future lock says otherwise.
- **Why:** Compliance and ops load before the commission needs paid checkout.
- **Not doing:** Stripe/Chapa/Telebirr, paid passes, paid ticket inventory.
- **Implications:** L-005 hides public booking in V2; payment is out of scope even after unhide.

### L-004 — Publish gate + audit log stay

- **Date locked:** 2026-07-16
- **Theme:** T1
- **Decision:** Public content requires explicit publish. CMS mutations remain audit-logged.
- **Why:** Commission trust and accountability; already production behavior.
- **Not doing:** Auto-publish from drafts; removing audit for “speed.”
- **Implications:** Create / Feed / Preview in the social shell must still end in explicit Publish and leave an audit trail.

### L-005 — Hide book, event RSVP, app, and PWA from visitors (code stays)

- **Date locked:** 2026-07-16
- **Theme:** T2
- **Decision:** On the **public** site only: hide **guide booking** and **event registration/RSVP** (one visitor rule), plus app download/promo and PWA install UI. **Do not delete** routes, Flutter app, service worker, or booking / `event_registrations` tables.
- **Why:** Simplify the visitor surface while V2 focuses on admin usability; one rule avoids “can register for events but can’t book a guide” confusion. V3 unhides the same surfaces together.
- **Not doing:** Dropping inspire/discover/plan content (events as **announcements** stay readable); wiping booking/RSVP history; removing API endpoints from the codebase (may remain unused by UI).
- **Implications / risk mitigations:**
  - Replace book / register CTAs with **Contact a guide** / contact commission → guides list + contact CMS (phone / WhatsApp / form).
  - Soft-gate old `/book`, event register/status/ticket URLs: redirect or “Temporarily via the commission — contact us” — **no bare 404**.
  - Events remain **content** (news/calendar); only the **RSVP/ticket** actions hide.
  - Admin: move Bookings + Event registrations out of **primary** nav (More or feature flag); keep data.
  - Implement via **flags / nav config** (public booking off, public event RSVP off, PWA install off, app banner off) — not folder deletes.

### L-006 — Admin social shell only (not a compose-platform rewrite)

- **Date locked:** 2026-07-16
- **Theme:** T1
- **Decision:** Reshape `/admin` IA to feel like Facebook/Instagram for non-technical staff: **Home/Feed · Create (+) · Media · Messages · More**. Create deep-links into **existing** editors (announcements, attractions, gallery, guides, etc.). Same data model and server functions.
- **Why:** Sidebar-of-CRUD modules is powerful but hard for commission staff; Meta-like patterns (feed, one compose entry, media-first) match how they think — posts and photos, not tables.
- **Not doing:** Unified polymorphic `posts` table; Instagram Stories/Reels; rebuilding every editor; WordPress.
- **Implications / risk mitigations:**
  - **Everyday nav (4–5 items):** Home/Feed, Create, Media, Messages (inquiries), More.
  - **More** keeps tourism power tools: Attractions (map picker), Itineraries, Partners, Pages, Hero, Analytics, Users, Audit, Settings — same routes, not day-one chrome.
  - Success bar: staff reach Create in ≤2 taps and publish news/event/photo without hunting the old sidebar.
  - Prefer **mobile-friendly** admin chrome (thumb-first) where cheap.

### L-007 — Preview before publish on Create/Edit (shell-level)

- **Date locked:** 2026-07-16
- **Theme:** T1
- **Decision:** Create/Edit flows expose **Preview** (e.g. phone frame → public route) before Publish. Minimum: announcements + hero/static pages; expand where existing public routes make it cheap.
- **Why:** Reduces publish anxiety (former B9); pairs with L-004.
- **Not doing:** A separate staging deployment as a V2 requirement; editorial multi-step approval as day-one (remains Candidate).
- **Implications:** Preview is part of the shell UX, not a new CMS product.

### L-008 — Create day-one types

- **Date locked:** 2026-07-16
- **Theme:** T1
- **Decision:** Create (+) day-one type picker offers exactly:

  | Label | Opens (existing editor) |
  |-------|-------------------------|
  | **News** | Announcement editor with type `News` |
  | **Event** | Announcement editor with type `Event` (content only; public RSVP stays hidden — L-005) |
  | **Attraction** | Attraction new/edit |
  | **Photo** | Gallery album / media upload path (reuse gallery + media library) |
  | **Guide** | Guide new/edit |

- **Why:** Matches everyday commission work without dumping every CMS entity into Create. Partners, itineraries, pages, hero, notices stay reachable under **More**.
- **Not doing:** Notice / Partner / Itinerary / Page / Hero as Create day-one tiles (use More). No unified `posts` table.
- **Implications:** Deep-link with query/state where needed (e.g. `?type=Event`). Event create does **not** re-enable public RSVP.

### L-009 — Feed covers Create types

- **Date locked:** 2026-07-16
- **Theme:** T1
- **Decision:** Home/Feed lists recent activity for the same types Create can make: News, Event, Attraction, Photo (gallery), Guide — drafts and publishes. Not announcements-only.
- **Why:** One mental model: what you Create appears on the Feed. Announcements-first would hide attractions/photos and break the Instagram metaphor.
- **Not doing:** Feed for Partners / Itineraries / Pages / Hero as day-one (those stay list UIs under More). Full activity/audit stream as the Feed (audit stays `/admin/audit`).
- **Implications:** Feed cards deep-link to existing editors; actions: Edit, Preview (L-007), Publish/Unpublish where applicable.

---

## Themes

### T1 — Admin social shell

**Status:** Locked (L-004, L-006, L-007, L-008, L-009) — primary V2 bet

**Problem:** Commission staff face a classic CMS sidebar (many CRUD modules). They need a feed + compose + media-first experience without losing tourism tools.

**Design principle (locked):**

> Staff think in posts and photos. One Create path, one Feed of recent work, media-first entry points, preview that looks like the public site — power tools live under More.

**Locked via:** L-004, L-006, L-007, L-008, L-009

**Leading (implementation detail — promote in sprints)**

| ID | Idea |
|----|------|
| T1-L1 | Feed of recent drafts / publishes for Create types (L-009) |
| T1-L2 | Create sheet: News · Event · Attraction · Photo · Guide (L-008) → existing editors |
| T1-L3 | Media as IG-style grid entry (reuse media library) |
| T1-L4 | Messages = inquiries inbox with badge |
| T1-L5 | Collapse current sidebar into More for editors; superadmin still reaches Users/Audit/Settings |

**Candidates**

| ID | Idea |
|----|------|
| T1-C1 | Editorial approval workflow (`draft → review → published`) |
| T1-C2 | Guide-scoped editor role |
| T1-C3 | “Boost to homepage” from Feed card |

**Parked (this theme)**

| ID | Idea | Why parked |
|----|------|------------|
| T1-P1 | Unified post schema / Stories / Reels | L-006 non-goal |
| T1-P2 | Full partner self-service portal | Ops cost; V3+ unless promoted |
| T1-P3 | Removing audit log | L-004 |
| T1-P4 | Notice / Partner / Itinerary in Create day-one | L-008 — use More |

**Open questions (T1)**

_None blocking. Create types (L-008) and Feed scope (L-009) locked 2026-07-16._

---

### T2 — Public surface: hide book / app / PWA

**Status:** Locked (L-005) — small, ships with or just before T1 public polish

**Problem:** Booking, app promo, and PWA install add visitor and support complexity while V2 focus is admin + content site.

**Design principle (locked):**

> Hide only. Soft-gate old links. Replace book CTAs with contact/guides. Unhide in V3.

**Locked via:** L-005

**Leading**

| ID | Idea |
|----|------|
| T2-L1 | Feature flags / env: public booking off, public event RSVP off, PWA install off, app banner off |
| T2-L2 | Nav + homepage CTA pass: book → contact / guides |
| T2-L3 | Soft landing pages for legacy `/book` (and related) URLs |
| T2-L4 | Admin: Bookings + event registrations under More / flag |

**Parked (this theme)**

| ID | Idea | Why parked |
|----|------|------------|
| T2-P1 | Delete Flutter / SW / booking schema | L-005 — code stays for V3 |

**Open questions (T2)**

_None blocking. Event RSVP hide-with-booking locked in L-005 (2026-07-16)._

---

### T3 — Languages

**Status:** Leading — do not block T1/T2

**Problem:** Amharic started; depth and extra languages incomplete.

**Design principle (leading):**

> Usable Amharic on key public surfaces first. Don’t block the admin shell on ten locales.

**Leading**

| ID | Idea |
|----|------|
| T3-L1 | Amharic: nav + homepage + plan + core attraction/guide strings |
| T3-L2 | Arabic as second expansion (UI + priority CMS fields) |

**Candidates**

| ID | Idea |
|----|------|
| T3-C1 | Oromo / French |
| T3-C2 | Full per-field CMS translation workflow |

**Parked**

| ID | Idea | Why parked |
|----|------|------------|
| T3-P1 | 10-language day-one | Roadmap non-goal |
| T3-P2 | Flutter ARB as V2 work | L-002 — mobile is V3 |

**Open questions (T3)**

- [ ] Ship any Amharic depth in V2 after shell, or park entirely to post-shell?
- [ ] Machine-assisted draft + native review, or human-only?

---

### T4 — On-site content depth

**Status:** Leading — slim; don’t block T1/T2

**Problem:** Attraction hours/tips/audio enrich the public site without needing the app.

**Leading**

| ID | Idea |
|----|------|
| T4-L1 | Attraction fields: opening hours, best time, tips |
| T4-L2 | Audio guides (admin upload) if storage allows |

**Candidates**

| ID | Idea |
|----|------|
| T4-C1 | Moderated UGC gallery |
| T4-C2 | QR polish for web-only deep links (no app) |

**Parked**

| ID | Idea | Why parked |
|----|------|------------|
| T4-P1 | AR navigation | V3+ |
| T4-P2 | App deep-link parity | V3 with Flutter unhide |

**Open questions (T4)**

- [ ] In V2 at all, or only after T1 exit?

---

### T5 — Platform quality

**Status:** Leading — smallest layer; don’t block T1/T2

**Design principle (leading):**

> Protect auth + publish. Booking tests wait until V3 unhide (or keep API-level smoke only).

**Leading**

| ID | Idea |
|----|------|
| T5-L1 | Tests for auth + publish paths (and shell Create → publish smoke) |
| T5-L2 | Light a11y pass on new admin shell + key public pages |

**Candidates**

| ID | Idea |
|----|------|
| T5-C1 | Object storage (S3/R2) when disk forces it |
| T5-C2 | OpenAPI contract tests |

**Parked**

| ID | Idea | Why parked |
|----|------|------------|
| T5-P1 | Architecture rewrite | L-001 |
| T5-P2 | Flutter test suite as V2 gate | L-002 |

**Open questions (T5)**

- [ ] Object storage only when volume forces it? **Leading default: yes.**

---

## Cross-cutting constraints

| Domain | Current approach | V2 note |
|--------|------------------|---------|
| Stack | TanStack Start, Postgres, Drizzle, Better Auth | L-001 |
| Public API | `/api/v1` + OpenAPI | Keep; public UI may stop calling booking |
| Auth | Admin email/password; `superadmin` / `editor` | Unchanged |
| Booking / events RSVP | Request workflow exists | **Hidden from public** (L-005); unhide V3; still no payments (L-003) |
| Publish | Explicit publish + audit | L-004 |
| Admin IA | Many sidebar modules | **Social shell** (L-006); tools under More |
| PWA / Flutter | Built or in progress | **Hidden / not delivered** in V2 (L-002, L-005); V3 |
| i18n | Amharic started | T3 Leading — don’t block |
| Media | Local uploads | Media grid in shell; S3 later if needed |
| Deploy | Docker / Coolify | Fix, don’t replace |

---

## Risk register (locked mitigations)

| Risk | Mitigation |
|------|------------|
| Hiding book = visitor dead end | Contact/guides CTAs; soft-gate legacy `/book` URLs |
| Meta shell hides map/itineraries | Power tools under **More**, same routes |
| “Remove” becomes delete | Flags/nav only; no schema or app folder deletion |
| Scope creep to compose-platform | L-006 non-goals; success = ≤2 taps to Create |
| Publish mistakes | L-007 Preview + L-004 publish/audit |
| Event RSVP confusion | Locked: hide RSVP with booking (L-005); events stay as readable content |

---

## Parked for V3

- **Unhide** public booking + event registration; restore admin primary access to those queues
- **Unhide** PWA install UX; resume service-worker product work as needed
- **Flutter** store ship, offline map polish, push (see [10](./10-flutter-migration-plan.md), [11](./11-flutter-play-store.md))
- App download / promo on the website
- Online payments / paid tickets
- Full partner self-service portal
- Unified social `posts` model / Stories / Reels (only if shell proves insufficient)
- 10-language launch, AR/VR, WordPress/Strapi rebuild
- Visitor accounts + cloud-synced trips
- Resume Expo as store client

---

## Brainstorm log

| Date | Theme | Outcome |
|------|-------|---------|
| 2026-07-16 | Bootstrap | Created `v2-plan.md`; early L-001…L-004 from strategy docs |
| 2026-07-16 | T1–T5 | Seeded Leading from Phases A–E / Flutter |
| 2026-07-16 | Product pivot | **Public:** hide book / app / PWA only. **Admin:** shell only (Feed / Create / Media / Messages / More). Risks addressed in L-005…L-007. |
| 2026-07-16 | Locks | **Revised L-002** (Flutter → V3 delivery). **Added L-005, L-006, L-007.** T1–T2 active; T3–T5 don’t-block; mobile/PWA/book product → V3 parks. |
| 2026-07-16 | T2 / L-005 | **Locked:** hide public event RSVP with guide booking (one visitor rule). |
| 2026-07-16 | T1 / L-008–009 | **Locked:** Create = News · Event · Attraction · Photo · Guide; Feed = those types. Sprint index: [`roadmap-v2.md`](./roadmap-v2.md). |

---

## Exit criteria (brainstorm → build plan)

V2 brainstorming for **execution** is **done** for T1/T2 when:

1. T1 + T2 blocking open questions are answered — **done** (L-005, L-008, L-009).
2. Locked list is ordered into [`roadmap-v2.md`](./roadmap-v2.md) — **done**.
3. T3–T5 remain Leading / don’t-block (schedule after shell or park later).

**Current:** Ready to execute sprints in [`roadmap-v2.md`](./roadmap-v2.md). Continue later only if new locks are needed (e.g. promote T3 languages).

> **Status:** T1–T2 locked for build; see sprint index.
