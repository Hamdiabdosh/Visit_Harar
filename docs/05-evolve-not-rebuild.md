# 5. Evolve, Don't Rebuild

> Strategic decision: customize and extend the existing platform rather than starting over.

---

## Decision

**Customize and evolve** the current Visit Harar codebase.

**Do not rebuild** on WordPress, Strapi, a SaaS DMO platform, or a new framework.

---

## Rationale

### What a rebuild would cost

| Loss | Impact |
|------|--------|
| 12+ admin CMS modules | Months to recreate |
| Booking workflow + email | Working production flow discarded |
| Map + geocoding + walking routes | Complex integration rebuilt from scratch |
| AI chat + knowledge cache | Thrown away |
| Audit logging + role-based auth | Security/compliance regression |
| Seed data + documentation | Content and dev velocity reset |
| Production deployment pipeline | Coolify/Docker setup redone |

**Estimated rebuild time for a 2-person team:** 6–12 months to reach current feature parity.

### What the commission needs now

- **Content and polish** — not a new framework
- **Published pages** — some still show "Coming Soon"
- **Stability** — production deployment must be reliable
- **"Everything in one place"** features — search, partners, itineraries, languages

None of these require a rebuild.

---

## Current stack assessment

| Component | Verdict |
|-----------|---------|
| TanStack Start (React 19 + Nitro SSR) | ✅ Modern, appropriate |
| PostgreSQL + Drizzle | ✅ Solid, scalable for this use case |
| Better Auth | ✅ Adequate for admin-only auth |
| Tailwind + Radix UI | ✅ Good for rapid UI iteration |
| Leaflet + OSM | ✅ Right for Harar (no Google Maps API cost) |
| Local file uploads | ⚠️ Fine for now; S3 later if needed |
| `createServerFn` pattern | ⚠️ Fine for web; add REST layer for mobile |

**Verdict:** Technology is not the bottleneck. Features and content are.

---

## When rebuild *would* make sense

| Condition | Applies today? |
|-----------|----------------|
| Commission mandates WordPress (staff already trained) | ❌ No |
| Need 10+ languages with complex translation CMS on day one | ❌ No |
| Performance/SEO fundamentally broken | ❌ No |
| Codebase unmaintainable | ❌ No — well-structured with AI-KNOWLEDGE.md |
| Security audit failure | ❓ Not assessed |
| Licensing/cost issue with current stack | ❌ No — open source stack |

---

## Evolution strategy

### Keep

- All admin CMS modules and patterns
- Drizzle schema and migrations approach
- Better Auth + role model
- Server function domain modules (`*-fns.ts`)
- Component library (`src/components/ui/`)
- Deployment pipeline (fix, don't replace)

### Extend

- Public REST API layer (`/api/v1/*`)
- New content types (partners, itineraries, inquiries)
- i18n infrastructure
- Global search
- Admin analytics and inquiry inbox
- PWA + eventually Expo mobile app

### Refactor (when touching code anyway)

- Extract shared validators/types to `packages/` when monorepo starts
- Consider object storage (S3/R2) when media volume grows
- Add test coverage on critical paths (booking, auth, publish)

---

## Risk of "platform shopping"

Third-party DMO SaaS (Moonstride, ITI Digital, etc.) offers itinerary builders, maps, and AI out of the box — but:

- Monthly cost may be unsustainable for a regional commission
- Less control over Harar-specific UX (hyena ritual, spiritual sites, alleyway navigation)
- Commission loses the custom admin you already built
- Data portability and vendor lock-in risks

**Hybrid option (future):** Embed specific widgets (e.g. event calendar) via iframe/API if build cost exceeds benefit — but only after core platform is stable.

---

## Immediate stability priority

Before feature work, ensure production is healthy:

- Resolve Coolify deployment failures (see `error.txt` in repo root)
- Publish all CMS content (about, plan-your-trip, contact)
- Verify health check, migrations, and upload volume on deploy

*Stabilization is Phase A item #1 in [06-phased-roadmap.md](./06-phased-roadmap.md).*
