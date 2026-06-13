# 8. UI/UX Investigation

> **Status: Decisions applied + quick wins shipped** (June 2026)

---

## Decisions made (June 2026)

| Question | Decision | Rationale |
|----------|----------|-----------|
| Navbar | **Reduce links** — 7 top-level; Gallery & Culture in footer + mobile menu secondary | Less crowding; Map elevated without mega-menu complexity |
| Map | **2nd in nav** (after Home) + **homepage map strip** below hero | Harar's killer feature; walkable city needs map-first IA |
| Mobile | **Sticky bottom bar** — Map + Book on `md` and below | Tourist thumb reach; hidden on `/book` |
| Chat | **Hidden on `/book` and `/contact`**; raised on mobile (`bottom-24`) | Avoid wizard overlap; contact form focus |
| Amharic | **UI strings only** for now; CMS content stays English until commission provides translations | Ship fast; commission controls content separately |

### Quick wins shipped

- [x] Q2 Footer i18n + removed stale `Language: EN (v2)` badge
- [x] Q3 Search in mobile menu
- [x] Q4 Branded Coming Soon with Map / Attractions / Contact links
- [x] Q5 Header trust line under logo
- [x] Q6 Booking no-payment reassurance banner
- [x] Q7 Noto Sans Ethiopic when `lang="am"`
- [x] Q8 Chat hidden on book + contact
- [ ] Q1 Publish About, Plan, Contact — **commission content** (still open)

---

## Executive summary

Visit Harar already has a **strong visual foundation**: Playfair + Outfit typography, brand green + gold palette, consistent cards, and a full-screen hero that feels appropriate for a UNESCO heritage destination. The site is **above average for a regional DMO** in polish.

The main UX gaps are not cosmetic — they are **journey gaps**:

1. Unpublished CMS pages still show generic "Coming Soon" (breaks the tourist path)
2. Navigation is ** overcrowded** on desktop and **incomplete** on mobile (no search in menu)
3. **Plan Your Trip** doesn't yet answer "I land in Dire Dawa tomorrow" fast enough
4. **i18n is partial** — nav/homepage translate, but hero, footer, and CMS content do not
5. **Map** is Harar's differentiator but doesn't feel like the primary tool in the IA

**Recommended order:** Quick wins (1–2 days) → Journey fixes (Phase A remainder + B start) → Visual polish.

---

## Audit method

- Code review of public + admin components (June 2026)
- Scenario: *"Flying into Dire Dawa tomorrow, 2 days in Harar, never been to Ethiopia"*
- Scenario: *"New commission editor publishes a festival and confirms a booking"*
- Phase A features included: search dialog, EN/Amharic toggle, inquiry inbox, dashboard widgets

---

## 1. First-time tourist journey

| Step | Question | Finding | Severity | Action |
|------|----------|---------|----------|--------|
| Land on homepage | Is Harar's value clear in 5 seconds? | **Yes** — hero stats (368 alleyways, 82 mosques, UNESCO) communicate uniqueness quickly | — | Keep; ensure hero CMS is published with strong photography |
| Find how to get here | Is Dire Dawa → Harar obvious? | **Partial** — only if Plan Your Trip is published; otherwise "Coming Soon" dead end | **Critical** | Publish plan page; add homepage strip "Getting here" linking to plan §getting-here |
| Plan visits | Can I build a 2-day plan? | **No** — no itinerary builder; plan page has CMS itineraries but no guided flow | **High** | Phase B: itinerary module; interim: prominent pre-built "2 days in Harar" on plan page |
| Book a guide | Is CTA visible and trustworthy? | **Partial** — gold CTA in nav (md+), mobile menu, homepage CTA; no commission logo/trust line in header | Medium | Add "Official site" subline under logo; keep book CTA |
| Navigate old city | Is map usable on phone? | **Good** — category chips, 70vh map, ClientOnly lazy load; sidebar hidden on mobile (chips compensate) | Low | Consider "Open in Google Maps" per attraction |
| Find anything | Search? | **Good (new)** — ⌘K / navbar search; **gap:** no search entry in mobile menu | Medium | Add search row to mobile sheet |
| Practical info | Visa, money, safety? | **Depends on CMS** — structure exists on plan page but requires published content | **High** | Commission content + sticky sub-nav on plan page |

---

## 2. Hero – Hub – Hygiene balance

| Layer | Current state | Gap |
|-------|---------------|-----|
| **Hero** (emotional) | Full-screen image, stats, dual CTAs — strong | Hero text not translatable (CMS English only); badge uses emoji 🌍 |
| **Hub** (stories) | Attractions, news, guides, gallery, about teaser — good depth | Gallery/About sections still English-only; no persona entry ("First visit", "Spiritual traveler") |
| **Hygiene** (practical) | Plan, contact, book exist but may show Coming Soon | Practical info buried; no always-visible "Getting here" / emergency strip |

---

## 3. Navigation & information architecture

| Check | Result | Recommendation |
|-------|--------|----------------|
| Main nav grouping | 9 equal-weight links — crowded at `lg` | Group into **Explore** (Attractions, Map, Gallery, Culture) + **Plan** (Plan Your Trip, Guides, News) + Contact — or drop Gallery from top nav |
| Book a Guide CTA | Prominent gold button (md+) | Also show icon-only book button on sm between search and menu |
| Search in navbar | ✅ Desktop; icon + ⌘K | Add to mobile menu; consider persistent search bar on `/search`-heavy flows |
| Map prominence | Same level as Gallery | **Elevate Map** — 2nd nav item or homepage secondary CTA "Explore the map" |
| Mobile hamburger | Clean dark sheet, i18n toggle, book CTA | Add Search + Plan Your Trip at top of list |
| Footer | Good 4-column structure | Wire to i18n; remove stale `Language: EN (v2)` badge; add locale switcher |
| Footer i18n | ❌ Hardcoded English | Extend `useLocale()` to footer strings |

### Nav density issue (visual)

Current desktop header fits: **logo + 9 links + search + locale + book** in one row. On 1024–1280px viewports this will feel tight. Options to discuss:

- **A)** Mega-menu with 2 dropdowns (Explore / Plan) — cleaner, more "world-class"
- **B)** Fewer top-level links (move Gallery, Culture to footer only)
- **C)** Keep as-is until user testing says otherwise

**Recommendation:** Option B for quick win; Option A for Phase B polish.

---

## 4. Visual design

| Check | Result | Notes |
|-------|--------|-------|
| Typography | Playfair headings + Outfit body — elegant | Add **Noto Sans Ethiopic** for Amharic body text (Outfit Amharic glyphs are weak) |
| Color palette | Brand green + gold — authentic, not generic | Works for heritage + Islamic city identity |
| Photography | Hero CMS-driven | Quality depends on commission uploads — critical for first impression |
| Cards | Consistent AttractionCard, GuideCard, AnnouncementCard | Category badges well done |
| Map UI | Chips + sticky filter + cluster markers | Strong; loading skeleton good |
| Empty states | Map, gallery have messages | Coming Soon page is plain — should match brand (illustration + helpful links) |
| Loading | Map skeleton, query loading states | Search dialog shows "Searching…" — good |

---

## 5. Trust & official feel

| Check | Result | Action |
|-------|--------|--------|
| Official commission branding | Footer only (`ORG_NAME`) | Add subtle header trust line: "Official site · Harari Tourism Commission" |
| UNESCO credibility | Hero stats + about teaser | Repeat UNESCO line in hero badge area |
| Booking trust | 4-step wizard, reference number on success | Add "No payment online — commission confirms by email" near step 1 |
| Contact visibility | Footer + contact page | Good once published |

---

## 6. Mobile web

| Check | Result | Action |
|-------|--------|--------|
| Tap targets | Nav menu items generous (py-2.5) | Search button small on xs — ok |
| Book CTA on mobile | In hamburger footer only | Add sticky bottom bar? (discuss — may conflict with chat) |
| Map on small screens | Full-width map, chips scroll horizontally | Good |
| Booking wizard | Multi-step on narrow screen | Review step indicator wrapping (4 steps) |
| Chat widget | Fixed `bottom-20 right-6` | On mobile overlaps scroll-to-bottom; consider `bottom-4` + hide on `/book` |
| Gallery lightbox | yet-another-react-lightbox | Touch-friendly — verify in device test |
| Amharic on mobile | Locale toggle in menu | Good placement |

---

## 7. Admin UX (commission staff)

| Step | Question | Finding | Action |
|------|----------|---------|--------|
| Login | Clear? | Standard Better Auth login | Add commission logo on login page |
| Dashboard | Know what to do next? | **Improved** — "Needs attention" panel, unread inquiries, draft counts | Add links from draft count to each module filter |
| Create announcement | Intuitive? | Form on `$id` route, cover upload | Add calendar view (Phase B) |
| Bulk publish | Works? | **New** — checkbox + publish selected | Add "select all unpublished" filter tab |
| Inquiries | Usable? | List + detail + mark read + reply via email | Add search by email/subject; mobile table scroll |
| Confirm booking | Obvious? | Status tabs on bookings index | Good |
| Publish clarity | Draft vs live? | Per-row toggle | Add global published/draft filter on list pages |
| Mobile admin | Tables overflow | Bookings, announcements, inquiries tables not mobile-optimized | Phase B: card layout on sm breakpoints |
| Onboarding | Missing | No in-app guides | Add `/admin` help cards linking to short docs |

---

## 8. Accessibility (initial)

| Check | Result | Action |
|-------|--------|--------|
| Color contrast | Brand green on white — likely ok; gold on white — verify | Run Lighthouse on homepage |
| Keyboard | Search ⌘K; cmdk dialog keyboard nav | Test focus trap in search dialog |
| Alt text | Admin has alt on media | Enforce on attraction cover required field |
| Form labels | Booking/contact forms use labels | Good |
| Focus indicators | Tailwind defaults | Verify gold focus ring on dark hero nav links |
| `lang` attribute | **Updated** via LocaleProvider | ✅ Sets `document.documentElement.lang` |

---

## 9. Phase A features — UX review

### Search (new)

| Aspect | Verdict | Notes |
|--------|---------|-------|
| Discovery | Good | ⌘K is power-user friendly; button label "Search" clear |
| Mobile | Gap | No search in mobile menu |
| Results page | Good | `/search?q=` with grouped results |
| Empty state | Good | "Type at least 2 characters" |
| i18n | Partial | Placeholder/title translated; result type labels English only |

### Amharic i18n (new)

| Aspect | Verdict | Notes |
|--------|---------|-------|
| Nav + homepage | Good start | Key sections translated |
| Hero, footer, CMS | Not translated | Expected — needs content strategy |
| Font | Risk | Amharic in Outfit may render poorly — test on Android Chrome |
| Brand name | "ሀረር ይጎብኙ" in nav | Good local identity |

### Inquiry inbox (new)

| Aspect | Verdict | Notes |
|--------|---------|-------|
| List UX | Clean | Unread highlighted amber |
| Detail | Good | Auto-mark read on open; reply via mailto |
| Sidebar badge | Good | Matches bookings pattern |

### Dashboard widgets (new)

| Aspect | Verdict | Notes |
|--------|---------|-------|
| Needs attention | Excellent | Exactly what commission needs |
| Draft count | Good | Could link to filtered lists |

---

## Priority fix list

### Quick wins (1–2 days) — recommend before commission demo

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| Q1 | Publish About, Plan, Contact in CMS (content) | Low | **Critical** — removes Coming Soon |
| Q2 | Footer i18n + remove `Language: EN (v2)` stub | Low | Medium |
| Q3 | Add Search to mobile menu | Low | Medium |
| Q4 | Branded Coming Soon page with links to Map, Attractions, Contact | Low | Medium |
| Q5 | Header trust line: "Official · Harari Tourism Commission" | Low | Medium |
| Q6 | Booking page: "No online payment" reassurance text | Low | Medium |
| Q7 | Noto Sans Ethiopic font when `locale === 'am'` | Low | Medium |
| Q8 | Hide chat widget on `/book` route | Low | Low |

### Journey improvements (Phase B UI)

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| J1 | Plan Your Trip: sticky section nav (Getting here · Visa · Itineraries) | Medium | High |
| J2 | Homepage "Getting here" strip above fold or after hero | Medium | High |
| J3 | Nav refactor — reduce to 6–7 items or mega-menu | Medium | High |
| J4 | Map promoted — 2nd in nav + hero ghost CTA default to `/map` | Low | High |
| J5 | Persona entry cards on homepage (First visit / Culture / Day trip) | Medium | Medium |
| J6 | Extend i18n to footer, search result labels, plan page headings | Medium | Medium |

### Admin polish

| # | Fix | Effort |
|---|-----|--------|
| A1 | Admin list pages: card view on mobile | Medium |
| A2 | Dashboard draft links → filtered admin lists | Low |
| A3 | Login page commission branding | Low |
| A4 | Inline "How to publish" help on dashboard | Low |

---

## Findings log

#### 2026-06-13 — Homepage & navigation

**Scenario:** First-time international tourist, 2 days in Harar

**Findings:**
- Hero communicates UNESCO / spiritual identity well via stats and typography
- 9-link navbar + utilities is dense; Map should be elevated
- Amharic toggle works for nav but hero/footer remain English
- Footer still shows outdated `Language: EN (v2)` badge
- Book CTA disappears from header below `md` breakpoint

**Severity:** High (nav density, unpublished pages); Medium (i18n gaps)

**Recommended action:** Q1–Q8 quick wins; discuss nav refactor (Option B vs A)

**Phase:** A remainder / B start

---

#### 2026-06-13 — Plan Your Trip

**Scenario:** Tourist needs Dire Dawa → Harar transfer info tonight

**Findings:**
- Page structure is good when published (getting here, visa, itineraries sections)
- Unpublished state falls back to generic ComingSoon — dead end
- No table-of-contents / jump links for long content
- Section headings hardcoded English ("Getting here") — not in i18n catalog

**Severity:** Critical if unpublished; High for structure

**Recommended action:** Publish CMS content; add sticky sub-nav (J1)

**Phase:** A2 content + B UI

---

#### 2026-06-13 — Map page

**Scenario:** Walking Jugol with phone map

**Findings:**
- Category chips work well on mobile
- 70vh map height is usable
- Empty state message is helpful when no coordinates
- Harar's killer feature but not visually prioritized in site IA

**Severity:** Low (page itself); Medium (IA)

**Recommended action:** J4 — promote Map in nav and homepage

**Phase:** B

---

#### 2026-06-13 — Booking flow

**Scenario:** Book guide for tomorrow

**Findings:**
- 4-step wizard is clear with progress labels
- Guide pre-select from URL `?guideId=` works
- No explicit trust copy about email confirmation workflow
- Chat widget may overlap wizard on mobile

**Severity:** Medium

**Recommended action:** Q6, Q8

**Phase:** A quick win

---

#### 2026-06-13 — Admin dashboard & inquiries

**Scenario:** Editor Monday morning check

**Findings:**
- "Needs attention" panel is excellent post-Phase A
- Inquiry inbox readable; auto-mark-read on open is good UX
- Wide tables will hurt mobile admin use

**Severity:** Low–Medium

**Recommended action:** A1 card layout for sm; A4 help cards

**Phase:** A polish / B

---

#### 2026-06-13 — Search (Phase A)

**Scenario:** Tourist searches "hyena" or "coffee"

**Findings:**
- cmdk dialog is fast and grouped by type
- `/search` page good for sharing links
- Mobile users must discover header icon — not in menu

**Severity:** Medium

**Recommended action:** Q3

**Phase:** A quick win

---

## Open questions for discussion

Decisions needed from you:

1. **Navbar:** Reduce links (Option B) or mega-menu (Option A)?
2. **Map:** Move to 2nd position in nav and add homepage CTA?
3. **Mobile book CTA:** Sticky bottom bar with "Book a Guide" + "Map" — yes or too much?
4. **Chat widget:** Keep on all pages or hide on book/contact?
5. **Amharic scope next:** UI strings only, or commission provides Amharic CMS content too?
6. **Coming Soon:** Invest in branded empty state now, or just publish content ASAP?
7. **Dark mode:** Skip for v1? (Recommendation: skip)

---

## Next steps

1. **You decide** which quick wins (Q1–Q8) to implement first
2. **Commission session** for A2 — publish plan/about/contact with Dire Dawa content
3. **Device test** — Android Chrome with Amharic locale; iPhone SE for nav/map/book
4. **Phase B UI** — plan page sticky nav + homepage getting-here strip + nav refactor

---

## Deliverables checklist

- [x] Public site heuristic evaluation (page by page)
- [x] Admin task-flow evaluation
- [ ] Mobile screenshot review (needs device pass)
- [x] Priority UI fixes list (quick wins vs redesign)
- [ ] Wireframe sketches for Phase B (itineraries, plan sub-nav)
- [ ] Design tokens / component tweaks (Ethiopic font)
- [ ] Persona entry point mockups (optional)
