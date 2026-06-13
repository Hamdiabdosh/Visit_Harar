# 3. Admin CMS Strategy

> How the Harari Tourism Commission controls the site — current capabilities, gaps, and planned extensions.

---

## Core principle

The commission should **edit content, not code**. Every public-facing change flows through `/admin` → PostgreSQL → public site (and future mobile app).

```
Commission staff
      ↓
  /admin CMS
      ↓
  PostgreSQL (single source of truth)
      ↓
  Public website + AI chat + future mobile app
```

**Do not replace this CMS with WordPress or a generic headless CMS.** The existing admin is tourism-specific and fits Harar. Extend it.

---

## What works today

| Capability | Details |
|------------|---------|
| Draft → publish | Hero, attractions, guides, gallery, pages, announcements, contact |
| Role separation | `superadmin` vs `editor` |
| Audit logging | Before/after JSON snapshots on CMS mutations |
| Maintenance mode | Site-wide toggle in settings |
| Map tools | Geocoding + map picker for attractions and contact |
| Media library | Upload, alt text, bulk delete, picker in editors |
| Booking workflow | Pending → Confirmed / Declined / Cancelled + email |
| Rich text | TipTap editor in admin |
| Reordering | Guides, gallery items (drag-and-drop) |

### Admin routes (current)

| Route | Purpose |
|-------|---------|
| `/admin` | Dashboard |
| `/admin/hero` | Homepage hero |
| `/admin/attractions` | Attractions CRUD |
| `/admin/guides` | Guides CRUD |
| `/admin/gallery` | Albums and media |
| `/admin/pages` | About, Culture, Plan Your Trip |
| `/admin/announcements` | News, events, notices |
| `/admin/contact` | Commission contact singleton |
| `/admin/bookings` | Booking management |
| `/admin/media` | Media library |
| `/admin/users` | User management (superadmin) |
| `/admin/audit` | Audit log (superadmin) |
| `/admin/settings` | Site settings |

---

## Commission needs → solutions

| Commission need | Proposed solution | Effort | Phase |
|-----------------|-------------------|--------|-------|
| Update homepage without developer | Hero CMS exists — add seasonal campaign banners | Low | A |
| Manage events easily | Upgrade announcements → calendar UI + recurring events | Medium | B |
| See contact form messages | Store inquiries in DB + admin inbox (currently email-only) | Low | A |
| Add pages without code | Flexible page builder or more `pageKey` values | Medium | B |
| Guides update own profiles | Guide-scoped editor role | Medium | C |
| See site performance | Admin analytics dashboard | Medium | B |
| Approve content before publish | Editorial workflow: draft → review → publish | Medium | C |
| Manage hotels/restaurants/partners | New "Partners" or "Services" content type | Medium | B |
| Control AI chat answers | Admin UI for AI knowledge snippets | Low–Medium | B |
| Bulk publish events | Bulk actions on announcements | Low | A |

---

## Planned admin extensions (summary)

### Phase A — Quick wins

- [ ] **Inquiry inbox** — `inquiries` table, list/detail in admin, email as notification not sole storage
- [ ] **Dashboard widgets** — pending bookings count, unpublished drafts, recent inquiries
- [ ] **Bulk publish** on announcements
- [ ] **Admin onboarding guide** — in-app help for common tasks

### Phase B — Content power

- [ ] **Events calendar view** in admin and public
- [ ] **Partners / services module** — hotels, restaurants, transport, money exchange
- [ ] **Analytics dashboard** — page views, top attractions, booking funnel
- [ ] **AI knowledge editor** — manage chat context without code
- [ ] **Preview before publish** for pages and hero

### Phase C — Workflow & scale

- [ ] **Guide-scoped editor role** — external guide can edit own profile only
- [ ] **Editorial approval workflow** — optional review step before publish
- [ ] **Flexible page builder** — beyond fixed about/culture/plan keys
- [ ] **Multi-language content** — locale fields or separate content rows per language

---

## Editorial rules (keep enforcing)

1. **Publish is explicit** — draft content never leaks to public
2. **Every change is auditable** — extend audit to new modules
3. **Roles are least-privilege** — editors cannot access users/settings/audit
4. **Media has alt text** — accessibility and SEO
5. **Sanitized HTML on public** — already using `sanitize-html`

---

## Admin UX improvements (low cost, high trust)

| Improvement | Why |
|-------------|-----|
| Amharic labels alongside English in admin | Staff comfort |
| "How to publish news" / "How to confirm booking" guides | Reduces support calls |
| Empty states with next-step hints | New editors onboard faster |
| Confirmation toasts with "View on site" link | Closes edit→verify loop |
| Pending items badge in sidebar | Nothing gets forgotten |

*Detailed admin UI/UX audit → [08-ui-ux-investigation.md](./08-ui-ux-investigation.md)*

---

## Open questions

- [ ] Should editors receive email when a new booking or inquiry arrives?
- [ ] Does the commission want approval chains (editor submits → superadmin publishes)?
- [ ] Who manages partner listings — commission only, or verified business owners?
- [ ] Amharic-first admin UI, or bilingual labels?
