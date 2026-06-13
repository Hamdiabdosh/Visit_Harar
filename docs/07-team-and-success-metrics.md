# 7. Team & Success Metrics

> How a two-person team (+ AI assist) delivers Visit Harar — roles, workflows, and KPIs.

---

## Team

| Role | Who | Responsibilities |
|------|-----|------------------|
| **Project lead / domain expert** | You | Commission relationships, content strategy, Harar knowledge, photography, user testing, priority decisions, deployment/domain |
| **Developer / architect** | AI + you (implementation) | Feature build, admin extensions, API, bug fixes, performance, SEO, documentation |
| **AI assist** | Claude, other tools | Content drafts, translation first pass, test scenarios, admin docs, code generation |

---

## Division of labor

### You (human) — own these

- Commission meetings and sign-off on priorities
- Authentic Harar content (attraction facts, cultural sensitivity)
- Photography and media curation
- Testing with real tourists and commission staff
- Production deployment decisions and domain
- Final say on "what ships this week"

### AI + development — own these

- Architecture and implementation
- Admin CMS new modules
- Search, i18n infrastructure, API layer
- Bug fixes and deployment troubleshooting
- Technical documentation updates
- Draft content (you verify before publish)

### AI assist — use for

| Task | Human review required |
|------|----------------------|
| Attraction description drafts | ✅ Always — facts, cultural accuracy |
| Amharic/Arabic translation first pass | ✅ Native speaker review |
| Booking flow test cases | ✅ |
| Admin how-to guides for commission | ✅ |
| SEO metadata suggestions | Light review |
| Code generation | Review + test |

---

## Workflow suggestions

### Weekly rhythm

1. **Monday:** Pick 2–3 tasks from current phase checklist
2. **Mid-week:** Commission check-in if content needed
3. **Friday:** Deploy to staging/production if stable; update roadmap checkboxes

### Content workflow (commission)

```
Commission drafts in admin (or sends you content)
      ↓
You / AI polish copy
      ↓
Editor publishes (or superadmin approves — future)
      ↓
Verify on public site
      ↓
Audit log records change
```

### Feature workflow (development)

```
Discuss detail in chat (reference docs/06-phased-roadmap.md)
      ↓
UI/UX sketch or audit note (docs/08-ui-ux-investigation.md)
      ↓
Implement on branch
      ↓
Test locally + commission preview if visible change
      ↓
Deploy
```

---

## Success metrics

### What "loved" looks like

Visit Harar succeeds when a tourist landing in Dire Dawa at 9pm can, in **10 minutes**:

1. Know how to get to Harar tomorrow
2. Find where to stay
3. See what to visit
4. Book a guide
5. Navigate the old city without getting lost

### KPIs to track

| Metric | Tool | Target (discuss) |
|--------|------|------------------|
| Monthly unique visitors | Analytics | Growth month-over-month |
| Avg session duration | Analytics | > 2 min |
| Pages per session | Analytics | > 3 |
| Map page views | Analytics | Top 3 pages |
| Search usage | Custom event | Track queries |
| Booking requests / month | Admin bookings | Growth |
| Inquiry form submissions | Admin inbox | Responded < 24h |
| Bounce rate on homepage | Analytics | < 60% |
| Mobile traffic % | Analytics | Informs Phase D timing |
| Admin publishes / month | Audit log | Commission self-sufficient |
| Core Web Vitals | Lighthouse | Pass |

### Commission adoption metrics

| Signal | Healthy |
|--------|---------|
| Staff log into admin weekly | Yes |
| News/events published without developer | Yes |
| Bookings confirmed in admin | Yes |
| New attractions added by commission | Yes |

---

## Risk register

| Risk | Mitigation |
|------|------------|
| Commission doesn't adopt admin | Training docs, simple UX, weekly support |
| Content not ready for launch | Phase A content checklist before marketing push |
| Deployment instability | Fix Coolify first; staging environment |
| Scope creep | Stick to phase checklists; defer Phase E items |
| Translation quality | Human review for all public Amharic/Arabic |
| Two-person bandwidth | AI assist; ruthless prioritization |

---

## Communication with commission

### Demo cadence

- After Phase A: "Site is stable, search works, inquiries in admin"
- After Phase B: "Partners, itineraries, calendar — full trip planning"
- Before Phase D: "Mobile app preview on TestFlight"

### Ask the commission early

1. Who are the admin users? (names, roles)
2. What content do they want live on day one?
3. Which languages matter most for their tourists?
4. Do they have partner businesses ready to list?
5. Official domain timeline?

---

## Document maintenance

- Update phase checkboxes in [06-phased-roadmap.md](./06-phased-roadmap.md) as work completes
- Add UI/UX findings to [08-ui-ux-investigation.md](./08-ui-ux-investigation.md)
- Keep [../AI-KNOWLEDGE.md](../AI-KNOWLEDGE.md) in sync when features ship
