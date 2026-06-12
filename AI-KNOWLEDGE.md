# Visit Harar — AI Knowledge Base

> **Purpose of this document:** Give any AI chatbot or assistant complete context about the Visit Harar website — what it is, who runs it, every feature, route, business rule, and technical detail. Use this as the single source of truth when answering questions about the project, helping users navigate the site, or assisting with development.

---

## 1. What Is This Website?

**Visit Harar** is the **official tourism website** for the **Harari Tourism Commission** (Harari Regional State, Ethiopia). It serves two audiences:

1. **Public visitors** — tourists planning a trip to Harar, Ethiopia's UNESCO World Heritage walled city ("City of Saints", fourth holiest city in Islam).
2. **Commission staff** — editors and administrators who manage content, guides, bookings, and media through a built-in CMS.

| Item | Value |
|------|-------|
| **Public brand** | Visit Harar |
| **Organization** | Harari Tourism Commission |
| **Production URL** | https://visitharar.raafat.site |
| **Default SEO title** | Visit Harar — Official Tourism Website |
| **License** | Private project |
| **Built by** | RAAFAT-DIGITAL (credited in admin sidebar) |

### What Harar Is (Content Context)

Harar Jugol is a fortified historic town inscribed on the UNESCO World Heritage List in **2006**. Key facts the site promotes:

- **368 alleyways** in roughly **one square kilometre** inside historic walls (built 13th–16th centuries)
- **82 mosques** (three from the 10th century) and **100+ shrines**
- Known as the **City of Saints** and the **fourth holiest city of Islam** (after Mecca, Medina, Jerusalem)
- Famous for: hyena feeding ritual, Harar longberry coffee, basket weaving, Arthur Rimbaud museum, vibrant markets
- Located on a plateau in eastern Ethiopia (~525 km east of Addis Ababa, ~50 km from Dire Dawa, ~1,885 m elevation)
- Most visitors arrive via **Dire Dawa** (airport DIR or railway), then road transfer to Harar

The website does **not** process online payments. Tour booking is a **request workflow**: visitor submits → commission reviews → confirms or declines via email.

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | **TanStack Start** (React 19 + Vite 7 + Nitro SSR) |
| Routing | **TanStack Router** (file-based routes in `src/routes/`) |
| Data | **TanStack React Query** + `createServerFn` server functions |
| Database | **PostgreSQL 16** |
| ORM | **Drizzle ORM** |
| Auth | **Better Auth** (email/password, Drizzle adapter) |
| UI | Tailwind CSS 4, Radix UI, Lucide icons |
| Forms | React Hook Form + Zod 4 |
| Rich text (admin) | TipTap |
| HTML display (public) | `sanitize-html` |
| Email | Resend API |
| AI chat | OpenRouter API (server-only) |
| Maps | Leaflet + react-leaflet + OpenStreetMap tiles |
| Geocoding | Nominatim (OpenStreetMap, server-side) |
| Walking routes | OSRM public API (server-side) |
| Drag-and-drop | `@dnd-kit` (gallery reorder) |
| Package manager | Bun (primary) |
| Production runtime | Node 22 |
| Deploy (primary) | Docker Compose on **Coolify** |
| Deploy (alt) | Vercel + Supabase pooler |

---

## 3. Public Website — All Pages & Routes

All public pages use `PublicLayout` (navbar, footer, optional chat widget) unless **maintenance mode** is active.

### Main navigation links

Home · Attractions · **Map** · Guides · Gallery · Culture · Plan Your Trip · News · Contact

**Book a Guide** is a prominent CTA (not in the main nav array) linking to `/book`.

### Page reference

| Route | What it does |
|-------|--------------|
| `/` | Homepage: hero, 6 featured attractions, 3 latest news items, 3 guides, 8 gallery thumbnails, about teaser |
| `/attractions` | Published attractions list with category filter |
| `/attractions/$slug` | Attraction detail — description, **location map**, **nearby attractions with walking routes** |
| `/map` | **Interactive tourism map** — clustered attraction markers, category filter sidebar, tourism office pin |
| `/guides` | Published licensed guides listing |
| `/guides/$slug` | Guide profile — bio, languages, specialties, license, contact, link to book |
| `/guides/$id` | **Legacy redirect** — treats `$id` as slug for backward compatibility |
| `/gallery` | Published photo album grid |
| `/gallery/$id` | Album detail with lightbox (images and videos) |
| `/culture` | CMS page (`pageKey: culture`) — traditions, festivals, cultural heritage |
| `/about` | CMS page (`pageKey: about`) — intro, UNESCO, geography, quick facts |
| `/plan-your-trip` | CMS page (`pageKey: plan`) — getting here, best time, visas, accommodation, itineraries |
| `/plan-trip` | **Redirect** → `/plan-your-trip` |
| `/news` | News & announcements with tabs: All / News / Event / Notice |
| `/news/$slug` | Announcement detail (canonical URL) |
| `/news/$id` | **Legacy** — treats `$id` as slug |
| `/contact` | Commission contact info + inquiry form. Shows "Coming Soon" if contact is unpublished |
| `/book` | 4-step tour booking wizard (see §6) |
| `/book/status` | Public booking lookup by reference number + visitor email |

### Infrastructure routes

| Route | Purpose |
|-------|---------|
| `/health` | Returns plain text `ok` — Docker/Coolify health check (no DB query) |
| `/sitemap.xml` | Dynamic sitemap: static routes + published attractions, guides, news, albums |
| `/robots.txt` | Allows `/`, disallows `/admin`, links sitemap |
| `/uploads/*` | Serves uploaded media from local filesystem |
| `/api/auth/*` | Better Auth handler |

### Attraction categories

`Heritage` · `Wildlife` · `Spiritual` · `Culture` · `Shopping` · `History`

Each category has distinct color styling on cards and filters.

### Default seed attractions (from `src/lib/harar-data.ts`)

1. **Harar Jugol Walled City** (Heritage, featured)
2. **The Hyena Men of Harar** (Wildlife, featured)
3. **Mosques & Sacred Shrines** (Spiritual)
4. **Harar Coffee Ceremony** (Culture)
5. **Vibrant Markets & Bazaars** (Shopping)
6. **Harar Museum** (History)

### Default seed guides

- **Ahmed Yusuf** — English, Arabic, Harari; heritage & Islamic history
- **Fatima Hassan** — English, Amharic, Harari; architecture, basket weaving, women's history
- **Ibrahim Ali** — food and market tours

---

## 4. Admin CMS — All Routes & Features

Base path: `/admin`. All routes except auth pages require login.

### Auth pages (no login required)

| Route | Purpose |
|-------|---------|
| `/admin/login` | Email/password sign-in |
| `/admin/forgot-password` | Request password reset email |
| `/admin/reset-password` | Set new password from reset link |

### Content management (superadmin + editor)

| Route | Features |
|-------|----------|
| `/admin` | Dashboard: booking metrics, quick actions, system health (superadmin), recent audit feed |
| `/admin/hero` | Homepage hero editor: badge, headlines, CTAs, background image, 3 stats; draft + publish; live preview |
| `/admin/attractions` | Attraction list (sortable table) |
| `/admin/attractions/$id` | CRUD: title, slug, descriptions, image, category, **geocode + map picker for lat/lng** (required when publishing), featured/published, sort order |
| `/admin/guides` | Guide list |
| `/admin/guides/$id` | CRUD: name, slug, photo, bio, languages, specialties, experience years, license, phone, email, availability, publish, sort |
| `/admin/gallery` | Album list |
| `/admin/gallery/$albumId` | Album editor: title, description, cover, publish; drag-reorder items; upload images/videos; bulk publish; delete |
| `/admin/pages` | Lists static pages: About, Culture, Plan Your Trip |
| `/admin/pages/$pageKey` | Page-specific JSON editors; hero image; publish/unpublish |
| `/admin/announcements` | Announcements list |
| `/admin/announcements/$id` | CRUD: title, slug, type, body, cover, event date/location, pin, publish; delete |
| `/admin/contact` | Commission contact: office, address, phones, emails, working hours, **geocode search + map picker** for coordinates, social URLs, publish |
| `/admin/bookings` | Booking list with filters (status, guide, date range) |
| `/admin/bookings/$ref` | Booking detail: confirm / decline / cancel with optional note; resend notification email |
| `/admin/media` | Media library: upload, search, filter, sort, alt text, copy URL, bulk delete |

### System (superadmin only)

| Route | Features |
|-------|----------|
| `/admin/users` | List users; create editor accounts; edit name/email; toggle active; send password reset; welcome email on create |
| `/admin/audit` | Paginated audit log with module/date filters; before/after diff viewer |
| `/admin/settings` | Site name, tagline, default OG image, **maintenance mode**, **booking enabled**, bureau email, Google Analytics ID |

---

## 5. User Roles & Authentication

| Role | Access |
|------|--------|
| **superadmin** | Full CMS + users + settings + audit + system health |
| **editor** | Content, bookings, media — **cannot** access `/admin/users`, `/admin/settings`, `/admin/audit` |

### Auth rules

- Email/password only; **public sign-up is disabled**
- Session duration: **8 hours**; refresh age **1 hour**
- Inactive users (`isActive: false`) are blocked at session creation
- Password reset via Resend (or console log in dev)
- Auth API mounted at `/api/auth/*`

---

## 6. Key Features — Detailed Behavior

### 6.1 Tour booking (`/book`)

**4 steps:** Select Guide → Tour Details → Your Details → Review

- Pre-select a guide via `?guideId=<uuid>`
- Only shows guides that are **published** and **available**
- Respects `site_settings.booking_enabled` — when disabled, shows message instead of form
- **Reference format:** `HRR-{YEAR}-{5-digit-seq}` (e.g. `HRR-2026-00001`)
- **Tour durations:** Half Day, Full Day, Multi Day
- **Booking statuses:** Pending → Confirmed | Declined | Cancelled
- Status lookup at `/book/status` requires booking reference + visitor email
- Commission confirms within **two business days** (messaging on site)

**Emails triggered:**
- New booking alert → bureau/bookings email
- Confirmation → visitor
- Decline (with optional note) → visitor
- Cancellation → visitor
- Admin can manually resend from booking detail page

### 6.2 Contact (`/contact`)

Single `contact_info` row (singleton pattern in database).

**Current default/seed address:**
- Office: Harari Tourism Commission
- Address: **844X+93**, Harar, Ethiopia (Google Plus Code)
- Map coordinates: **9.3059, 42.1477**
- Phone: +251 25 666 1234, +251 91 234 5678
- Email: info@visitharar.gov.et, bookings@visitharar.gov.et
- Hours: Mon–Fri 8:30–5:30, Sat 9:00–1:00, Sun closed
- Social: Facebook, Twitter, Instagram (visitharar handles)

When map coordinates exist, contact page shows an **"Open in Google Maps"** link (no embedded map).

**Inquiry form:** Name, email, subject, message (min 10 chars). Submissions are **emailed only** — not stored in the database. Email goes to: `bureau_email` → `email_general` → `email_bookings` → `SUPERADMIN_EMAIL` (fallback chain).

If contact info is unpublished, page shows **Coming Soon**.

### 6.2b Interactive Tourism Map (`/map`)

**Stack:** OpenStreetMap tiles + Leaflet + react-leaflet + marker clustering (`leaflet.markercluster`).

**Public `/map` page:**
- Shows all **published attractions with coordinates** as color-coded markers by category
- **Category filter sidebar** (desktop) and **chip row** (mobile) — toggle Heritage, Wildlife, Spiritual, etc.
- **Tourism office marker** (★) from `contact_info.map_lat` / `map_lng` — toggle on/off in filter
- Marker popups: image, title, category, short description, **View Details**, **Get Directions** (Google Maps)
- Empty state when no geocoded attractions exist yet
- Client-only rendering via `ClientOnly` + lazy-loaded map components (SSR-safe)

**Attraction detail (`/attractions/$slug`):**
- **Location** section: mini map, coordinates, Google Maps link (hidden if no coordinates)
- **Nearby Attractions** (up to 3): straight-line distance via Haversine (`src/lib/geo.ts`)
- **Walking routes:** click a nearby attraction to fetch an OSRM foot route and draw it on the map (`src/lib/routing-fns.ts`)
- Shows walk distance and estimated duration when route loads

**Admin coordinate tools (`LocationPickerFields` component):**
- Used in `/admin/attractions/$id` and `/admin/contact`
- **Geocode search:** Nominatim via server function `geocodeAddress` (`src/lib/geocode-fns.ts`) — address → lat/lng
- **Pick on map:** click OpenStreetMap to set coordinates
- Attraction coordinates **required only when publishing** (nullable in DB for backward compatibility)

**Database:** `attractions.latitude` and `attractions.longitude` (nullable DECIMAL). Migration: `db/migrations/001_attraction_coordinates.sql`.

**Key files:**
- `src/routes/map.tsx` — public map page
- `src/components/map/TourismMap.tsx` — clustered map + office marker
- `src/components/map/MapCategoryFilter.tsx` — category sidebar/chips
- `src/components/map/NearbyWithRoutes.tsx` — walking routes on detail page
- `src/components/admin/LocationPickerFields.tsx` — shared admin geocode + map picker
- `src/lib/geo.ts` — Haversine, Google Maps URLs
- `src/lib/geocode-fns.ts` — Nominatim geocoding (server)
- `src/lib/routing-fns.ts` — OSRM walking routes (server)

**External services (no API keys):**
- Map tiles: `tile.openstreetmap.org`
- Geocoding: `nominatim.openstreetmap.org` (rate-limited; server-side only)
- Walking routes: `router.project-osrm.org` (public demo server)

### 6.3 News & announcements (`/news`)

**Types:** News, Event, Notice

- Events can have `event_date` and `event_location`
- One announcement can be **pinned** (shown prominently)
- Filter tabs on listing page
- Rich HTML body (sanitized on display)

### 6.4 Gallery

- Organized into **albums** with cover image
- Items can be **image** or **video**
- Public lightbox viewer
- Admin supports drag-and-drop reorder

### 6.5 Static CMS pages

Three pages stored as JSON in `pages.content`:

| pageKey | Route | Content sections |
|---------|-------|------------------|
| `about` | `/about` | intro_text, unesco_text, geography_text, quick_facts[] |
| `culture` | `/culture` | intro_text, sections[], festivals[] |
| `plan` | `/plan-your-trip` | getting_here, best_time, visa_info, accommodation, itineraries[] |

Each page has optional hero image and publish toggle.

### 6.6 Homepage hero

Managed at `/admin/hero`. Fields: badge text, headline, subheadline, primary/secondary CTA labels+URLs, background image, 3 stat blocks. Draft/publish workflow.

### 6.7 AI chat widget

Floating button on all public pages (bottom-right). Only visible when `OPENROUTER_API_KEY` is configured.

**Behavior:**
- Powered by OpenRouter (`https://openrouter.ai/api/v1/chat/completions`)
- Rate limit: **20 messages/minute per IP**
- Knowledge base rebuilt from published CMS content every **5 minutes** (invalidated on CMS changes)
- Page-aware: knows current path, page type, entity slug/title
- **Strict rules:** Answer ONLY from site knowledge; never invent prices, hours, visa rules, or facts; direct unknowns to `/contact`; when booking disabled, say booking is unavailable; speak as commission assistant (not "AI")

**Knowledge includes:** site settings, hero, attractions, guides, pages, announcements, contact, gallery, route list.

### 6.8 Maintenance mode

Toggle in `/admin/settings` → `site_settings.maintenance_mode`.

When active:
- Public visitors see **MaintenancePage** ("We'll be back soon")
- **Bypassed:** `/admin/*`, `/api/*`, `/robots.txt`, `/sitemap.xml`
- Admin login remains accessible

### 6.9 Audit log

Records CMS mutations across all modules with before/after JSON snapshots. Superadmin-only view at `/admin/audit`. Also invalidates chat knowledge cache on content changes.

---

## 7. Database Schema

Schema files: `drizzle/schema/`

### Auth (`auth.ts`)

| Table | Key fields |
|-------|------------|
| `user` | id, name, email, role (`superadmin` \| `editor`), isActive |
| `session` | token, expiresAt, userId |
| `account` | credential provider, hashed password |
| `verification` | password reset tokens |

### Content

| Table | Purpose |
|-------|---------|
| `hero_content` | Homepage hero (badge, headlines, CTAs, stats, background, isPublished) |
| `attractions` | Sights (title, slug, descriptions, image, category, **latitude**, **longitude**, isFeatured, isPublished, sortOrder) |
| `guides` | Licensed guides (name, slug, photo, bio, languages[], specialties[], experienceYears, licenseNumber, contact, isAvailable, isPublished) |
| `gallery_albums` | Photo albums |
| `gallery_items` | Album media (type: image/video, url, caption, alt, sortOrder) |
| `pages` | Static pages (pageKey unique: about/culture/plan, content JSONB, heroImage, isPublished) |
| `announcements` | News/events (title, slug, type, body, coverImage, eventDate, eventLocation, isPinned, isPublished) |
| `contact_info` | Commission contact singleton |

### Operations

| Table | Purpose |
|-------|---------|
| `bookings` | Tour requests (bookingRef, guideId, visitor details, tourDate, tourDuration, groupSize, specialRequests, status, statusNote, notifiedAt) |
| `media_assets` | Media library (storage key in `cloudinaryId` column — legacy name, actually local storage) |
| `site_settings` | Global settings (siteName, siteTagline, defaultOgImage, maintenanceMode, bookingEnabled, bureauEmail, analyticsId) |
| `audit_logs` | Change history (module, action, recordId, before/after JSONB, user info) |

**Note:** Contact form inquiries are **not** stored in the database.

---

## 8. Email System

**Provider:** Resend (`RESEND_API_KEY` + `RESEND_FROM_EMAIL`)

| Email | When sent |
|-------|-----------|
| Password reset | User requests forgot-password |
| Welcome | New editor account created |
| New booking alert | Visitor submits booking |
| Booking confirmed | Admin confirms |
| Booking declined | Admin declines (includes optional note) |
| Booking cancelled | Admin cancels |
| Contact inquiry | Visitor submits contact form |

If Resend is not configured, emails are skipped in production; dev mode logs to console.

Emails use branded HTML with Harari brown palette and commission footer from contact info.

---

## 9. Media & File Storage

**Local filesystem** (not cloud CDN).

| Environment | Path |
|-------------|------|
| Local dev | `./uploads` |
| Production Docker | `/data/uploads` (named volume) |

- Upload via admin media library or inline in content editors
- Public URL: `{APP_URL}/uploads/{storageKey}`
- Served by `/uploads/*` route with long cache headers
- Supported: JPEG, PNG, GIF, WebP, SVG, MP4, WebM, MOV
- Media library tracks `used_in[]` references, alt text, dimensions

---

## 10. SEO & Metadata

Helper: `buildHead()` / `buildHeadAsync()` in `src/lib/metadata.ts`

Each route sets:
- `<title>` — `{Page Title} — Visit Harar`
- Meta description
- Open Graph tags (title, description, type, image)
- Canonical URL via `VITE_APP_URL`

Root layout adds: charset, viewport, author, Twitter card, Google Fonts (Playfair Display + Outfit), favicon `/logo.webp`, Google Analytics when `analytics_id` is set in site settings.

**Sitemap:** Auto-generated from published content  
**Robots:** Disallows `/admin`

---

## 11. Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes (local/Vercel) | PostgreSQL connection. Auto-set in Coolify compose |
| `BETTER_AUTH_SECRET` | Yes | 32+ char secret |
| `BETTER_AUTH_URL` | Recommended | Auth base URL |
| `APP_URL` | Recommended | Server-side canonical/email links |
| `VITE_APP_URL` | Build-time | Public origin in client bundle |
| `UPLOAD_DIR` | Optional | Media path (default `./uploads`) |
| `RESEND_API_KEY` | Optional | Email sending |
| `RESEND_FROM_EMAIL` | Optional | Sender address |
| `SUPERADMIN_EMAIL` | Seed | Initial superadmin email |
| `SUPERADMIN_PASSWORD` | Seed | Initial superadmin password |
| `SUPERADMIN_NAME` | Optional | Superadmin display name |
| `EDITOR_EMAIL/PASSWORD/NAME` | Optional | Test editor seed |
| `OPENROUTER_API_KEY` | Optional | AI chat widget (server-only) |
| `NODE_ENV` | Auto | development / production |
| `NITRO_PRESET` | Optional | `node-server` (default) or `vercel` |
| `SKIP_DB_SETUP` | Optional | Skip auto migrate/seed on container start |
| `RUN_DB_SEED` | Optional | Force re-seed when user table empty |

Local dev Postgres runs on port **5434** via `docker-compose.dev.yml`.

---

## 12. Seed Data & Scripts

**Run all seeds:** `bun run db:seed`

| Script | Seeds |
|--------|-------|
| `seed-superadmin.ts` | Superadmin user (+ optional editor) |
| `seed-pages.ts` | About, culture, plan pages with rich default content |
| `seed-contact.ts` | Commission contact info |
| `seed-settings.ts` | Site name, tagline, maintenance off, booking on |
| `seed-hero.ts` | Default hero (UNESCO badge, "Discover Harar, City of Saints") |
| `seed-attractions.ts` | 6 attractions from `harar-data.ts` |
| `seed-guides.ts` | 3 guides |
| `seed-announcements.ts` | 5 announcements |
| `seed-gallery.ts` | 6 albums |
| `seed-media-images.ts` | Uploads images if legacy asset folder present |

**Other commands:** `db:push`, `db:indexes`, `db:reset`, `db:studio`, `db:check`

Production Docker entrypoint auto-runs migrate + seed on first deploy when user table is empty.

---

## 13. Project File Structure

```
Visit_Harar/
├── src/
│   ├── routes/              # All public + admin + API routes
│   ├── components/
│   │   ├── public/          # Navbar, footer, hero, cards, chat, maintenance
│   │   ├── admin/           # CMS editors, media picker, rich text
│   │   ├── dashboard/       # Admin sidebar, topbar
│   │   └── ui/              # Radix/shadcn-style primitives
│   ├── lib/
│   │   ├── *-fns.ts         # Server functions per domain
│   │   ├── validators/      # Zod schemas
│   │   ├── chat/            # OpenRouter, prompts, knowledge snapshot
│   │   ├── auth*.ts         # Better Auth
│   │   ├── storage.server.ts
│   │   ├── email.ts
│   │   ├── metadata.ts
│   │   └── harar-data.ts    # Seed content source
│   └── server.ts
├── drizzle/schema/          # Table definitions
├── db/                      # Drizzle client + indexes.sql
├── scripts/                 # Seeds, docker entrypoint
├── public/                  # Static assets (logo.webp)
├── docker-compose.yml       # Production: app + postgres + uploads volume
├── docker-compose.dev.yml   # Local Postgres :5434
├── Dockerfile
├── SETUP.md                 # Local dev guide
├── DEPLOY.md                # Coolify deployment guide
└── AI-KNOWLEDGE.md          # This file
```

### Architecture flow

```
Browser → TanStack Router → createServerFn → Drizzle → PostgreSQL
                         → Better Auth (/api/auth)
                         → Local uploads (/uploads)
                         → OpenRouter (chat)
                         → Resend (email)
```

---

## 14. Business Rules AI Assistants Must Know

1. **Never invent** prices, opening hours, visa requirements, phone numbers, or historical facts — only use published site content.
2. **Booking is not instant** — it is a request the commission reviews within two business days.
3. **No online payment** on this website.
4. When `booking_enabled` is false, do not send users to `/book`.
5. When contact info is unpublished, the contact page shows Coming Soon.
6. When maintenance mode is on, public pages are unavailable (except admin).
7. Contact inquiries are emailed, not stored — staff must check email.
8. Editors cannot manage users, settings, or audit logs.
9. Content must be **published** to appear on the public site (draft content is admin-only).
10. The chat widget speaks as the **commission's helpful assistant**, not as an AI.

---

## 15. Quick Reference for Common User Questions

| User asks… | Direct them to… |
|------------|-----------------|
| What to see in Harar | `/attractions`, `/map`, `/about` |
| Map of attractions | `/map` |
| Book a local guide | `/book` or `/guides` |
| Check booking status | `/book/status` |
| Plan travel / visas / when to visit | `/plan-your-trip` |
| Culture & festivals | `/culture`, `/news` |
| Photos | `/gallery` |
| Contact the commission | `/contact` |
| Latest news & events | `/news` |
| Commission staff login | `/admin/login` |

---

*Last updated from codebase analysis. For local setup see [SETUP.md](./SETUP.md). For deployment see [DEPLOY.md](./DEPLOY.md).*
