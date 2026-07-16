# 1. Vision & Current State

## Mission

Make **Visit Harar** the best website a tourist — local or international — can use to find **everything they need in one place** when visiting Harar Jugol and the surrounding region.

Visit Harar is the **official tourism website** of the **Harari Tourism Commission**. It serves:

1. **Public visitors** — tourists planning or experiencing a trip to Harar
2. **Commission staff** — editors and administrators managing content, guides, bookings, and media

| Item | Value |
|------|-------|
| Public brand | Visit Harar |
| Organization | Harari Tourism Commission |
| Production URL | https://visitharar.et |
| Built by | RAAFAT-DIGITAL |

---

## What makes Harar unique (content angle)

Harar Jugol is a UNESCO World Heritage Site (inscribed 2006). Key differentiators to lean into:

- **368 alleyways** in ~1 km² inside historic walls (13th–16th century)
- **82 mosques** (three from the 10th century) and **100+ shrines**
- Known as the **City of Saints** — fourth holiest city in Islam (after Mecca, Medina, Jerusalem)
- Signature experiences: hyena feeding ritual, Harar longberry coffee, basket weaving, Arthur Rimbaud museum, vibrant markets
- Gateway: most visitors arrive via **Dire Dawa** (airport DIR or railway), then road transfer (~50 km)

**Strategic insight:** Harar's compact size is an advantage. Unlike mega-destinations (Dubai, Japan), we can genuinely be *the one place for everything* — depth and usability beat generic flash.

---

## The visitor journey we must support

World-class destination sites follow one flow:

```
Inspire → Discover → Plan → Book/Act → Share
```

| Stage | Meaning | Visit Harar today |
|-------|---------|-------------------|
| **Inspire** | Hero, stories, gallery, culture | Strong (hero, gallery, culture page) |
| **Discover** | Attractions, map, guides, search | Good (map, attractions, guides) — missing global search |
| **Plan** | Itineraries, practical info, events | Partial (Plan Your Trip CMS page, announcements) |
| **Book/Act** | Guides, tours, services | Partial (guide booking request flow; no payments) |
| **Share** | Social, UGC, downloadable guides | Minimal |

---

## Current platform — what is already built

Visit Harar is **not an MVP**. It is a production-grade tourism platform.

### Tech stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start (React 19 + Vite 7 + Nitro SSR) |
| Routing | TanStack Router (file-based) |
| Data | TanStack React Query + `createServerFn` |
| Database | PostgreSQL 16, Drizzle ORM |
| Auth | Better Auth (email/password) |
| UI | Tailwind CSS 4, Radix UI, Lucide |
| Maps | Leaflet + OpenStreetMap, Nominatim, OSRM |
| AI chat | OpenRouter (optional) |
| Email | Resend (optional) |
| Deploy | Docker / Coolify (primary) |

### Public site features

| Route / feature | Status |
|-----------------|--------|
| Homepage (hero, featured attractions, news, guides, gallery) | ✅ Built |
| Attractions list + detail (map, nearby walking routes) | ✅ Built |
| Interactive tourism map with category filters | ✅ Built |
| Licensed guides list + profiles | ✅ Built |
| Photo/video gallery with lightbox | ✅ Built |
| Culture, About, Plan Your Trip (CMS pages) | ✅ Built |
| News / events / notices with tabs | ✅ Built |
| Contact form + commission info | ✅ Built |
| Tour booking wizard + status lookup | ✅ Built |
| AI chat widget | ✅ Built |
| SEO (sitemap, metadata, robots) | ✅ Built |
| Maintenance mode | ✅ Built |

### Admin CMS features

| Module | Status |
|--------|--------|
| Dashboard (metrics, health, audit feed) | ✅ Built |
| Hero editor (draft/publish) | ✅ Built |
| Attractions CRUD + geocode/map picker | ✅ Built |
| Guides CRUD + reorder | ✅ Built |
| Gallery albums + media reorder | ✅ Built |
| Static pages (About, Culture, Plan) | ✅ Built |
| Announcements (news/events, pin, publish) | ✅ Built |
| Contact info singleton | ✅ Built |
| Bookings (confirm/decline/cancel) | ✅ Built |
| Media library | ✅ Built |
| Users (superadmin only) | ✅ Built |
| Audit log (superadmin only) | ✅ Built |
| Site settings (maintenance, booking toggle, analytics) | ✅ Built |

### Roles

- **superadmin** — full access (users, settings, audit)
- **editor** — content + bookings + media; blocked from users, settings, audit

### Known gaps

| Gap | Impact |
|-----|--------|
| No automated tests | Risk on changes |
| No REST API (only `/api/auth/*`) | Blocks native mobile app |
| Contact inquiries email-only (no DB inbox) | Commission loses visibility |
| English only | Limits local + Gulf + regional reach |
| No global search | Hard to "find anything" |
| No itinerary builder | Misses Harar's walkable-city strength |
| No partner listings (hotels, restaurants, transport) | Not truly "one place for everything" |
| No user accounts / saved trips | Lower engagement |
| Local media storage only | Scaling concern long-term |
| Some CMS pages unpublished → "Coming Soon" on public site | Launch polish needed |
| Production deployment issues (Coolify) | Stability risk |

---

## Business rules (unchanged)

- **No online payments** — booking is a request workflow: visitor submits → commission reviews → confirms/declines via email
- Content must be **explicitly published** (`is_published = true`) to appear publicly
- All CMS mutations are **audit-logged**

---

## Open questions (for future discussions)

- [ ] Which languages first: Amharic, Arabic, Oromo, French?
- [ ] Partner listings: commission-managed only, or self-service for businesses?
- [ ] Itinerary builder: pre-built templates only, or user-created trips?
- [ ] Payment integration timeline (if ever)?
- [x] Official domain: `visitharar.et`
