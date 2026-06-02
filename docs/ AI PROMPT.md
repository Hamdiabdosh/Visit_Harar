━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI PROMPT — Phase 1: Vision
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are helping plan a Government Tourism Website with CMS
called "Visit Harar" for the Harari Regional Tourism Bureau,
Ethiopia.

PROBLEM STATEMENT:
Harar — a UNESCO World Heritage city — has no official tourism
website. The bureau cannot control public information about the
city. Tourists rely on inaccurate third-party sources.

TARGET USERS:
1. Bureau staff — need to manage all site content with no coding
2. International tourists — need accurate, trustworthy travel info
3. Domestic tourists & diaspora — need cultural and visit details
4. Travel agencies — need official data and contacts

CORE REQUIREMENT:
The system must have a full CMS backend where bureau staff can
edit every section of the website (hero, attractions, gallery,
announcements, contact info) through a simple admin dashboard.

GOAL:
Produce a complete project vision document including:
- Purpose statement
- User personas (bureau admin, tourist, travel agent)
- Core value propositions
- System boundary: what it does and does NOT do
- Success metrics

Output as a structured professional document.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI PROMPT — Phase 2: Master System Context
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Visit Harar — Government Tourism Website with Full CMS
PURPOSE: Official tourism website for the Harari Regional Tourism
Bureau. Bureau staff manage all content independently. Tourists
browse and book licensed local guides/tours.

ACTORS:
1. Super Admin
   - Full system access: users, content, settings, bookings
   - Creates and manages bureau editor accounts

2. Bureau Content Editor
   - Full CMS access: hero, attractions, gallery, announcements,
     events, guide profiles, all pages
   - Views and manages incoming tour/guide booking requests
   - Cannot manage user accounts or system settings

3. Public Visitor
   - Browses all public pages (read-only)
   - Submits guide/tour booking requests
   - Can edit or cancel their own request before confirmation

4. Licensed Guide (v2 — do not build yet, design DB to support it)
   - Will eventually manage their own profile and bookings

CONSTRAINTS:
- CMS must require zero coding knowledge from bureau staff
- Booking system is request-based (no live payment in v1)
- All public content must be editable from the admin dashboard
- Design must support Arabic, Amharic, Harari in v2

GOAL:
Using this actor map, help me define the complete master system
context document including:
- Full permission matrix (CRUD per actor per module)
- Data ownership rules (who owns what)
- Role hierarchy diagram
- Key system boundaries (what v1 does and does NOT include)

Output as a structured technical document.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI PROMPT — Phase 3: Module Context
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Visit Harar — Government Tourism Website + Full CMS
STACK: TanStack Start, Node.js, PostgreSQL, Drizzle ORM,
       Better Auth, Cloudinary, Tailwind CSS, TanStack Query

ACTORS:
- Super Admin: full system access
- Bureau Editor: full CMS + booking management, no user admin
- Public Visitor: browse site + submit booking requests

MODULES:
1. Auth & Role System
2. CMS Core (Hero, Attractions, Gallery, Pages,
   Announcements, Guides, Contact)
3. Public Website (all tourist-facing pages)
4. Booking System (request-based, no payment v1)
5. Media Manager (Cloudinary integration)
6. Super Admin Panel (user management, audit)

BUILD ORDER: 1 → 2 → 3 → 4 → 5 (inside 2) → 6

CONSTRAINTS:
- CMS must be usable by non-technical bureau staff
- All public content driven from database, not hardcoded
- No live payment in v1 — bookings are request/confirm only
- File structure must be clean for AI-assisted development
- Each module must be independently buildable and testable

GOAL:
Using this module map, produce:
- A recommended folder/file structure for the full project
- A dependency graph (which modules block which)
- A v1 scope definition (what is in, what is deferred)
- Estimated complexity rating per module (Low / Med / High)

Output as a structured technical planning document.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI PROMPT — Phase 4: Module 1 — Auth & Role System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Visit Harar — Government Tourism Website + CMS
STACK: TanStack Start, Node.js, PostgreSQL, Drizzle ORM,
       Better Auth, Tailwind CSS

MASTER CONTEXT:
- 2 roles: superadmin (full access), editor (CMS + bookings)
- No self-registration — accounts created by superadmin only
- Public site requires zero authentication
- All /admin/* routes are protected by role-based middleware

YOUR TASK — Build Module 1: Auth & Role System

DELIVER exactly these files:

1. drizzle/schema/users.ts
   - users table (id, email, password, role enum, is_active,
     created_at, updated_at)
   - sessions table (id, user_id, expires_at, created_at)

2. lib/auth.ts
   - Better Auth configuration
   - Role-based session with superadmin / editor
   - bcrypt password hashing (10 rounds)
   - Session expiry: 8 hours inactivity

3. middleware/requireAuth.ts
   - Checks valid session on all /admin/* routes
   - Redirects to /admin/login if no session
   - Checks role against allowed roles array
   - Returns 403 with "access denied" if wrong role

4. app/admin/login/page.tsx
   - Email + password form (Tailwind styled)
   - Error states: invalid credentials, account disabled
   - On success: redirect to /admin/dashboard

5. app/admin/forgot-password/page.tsx
   - Email input → sends reset link (1 hour expiry)

6. app/admin/reset-password/page.tsx
   - New password + confirm password
   - Validates token from URL params

7. scripts/seed-superadmin.ts
   - Seeds one superadmin from environment variables
     (SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD)
   - Safe to run multiple times (upsert, not duplicate)

CONSTRAINTS:
- No third-party OAuth — email + password only
- No self-registration endpoint
- Middleware must be reusable across all admin modules
- All forms must show clear error messages in plain English
- Keep auth logic in lib/auth.ts, not scattered in components

OUTPUT: All files with full working code, no placeholders.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI PROMPT — Phase 4: Module 2a — Hero Manager
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Visit Harar — Government Tourism Website + CMS
STACK: TanStack Start, Node.js, PostgreSQL, Drizzle ORM,
       Better Auth, Cloudinary, Tailwind CSS, TanStack Query

MASTER CONTEXT:
- Auth module already built (Module 1)
- Editor role has access to /admin/hero
- All public content rendered from DB, nothing hardcoded
- Cloudinary handles all media uploads

YOUR TASK — Build Module 2a: Hero Manager

DELIVER exactly these files:

1. drizzle/schema/hero.ts
   - hero_content table with all fields listed below:
     id, badge_text, headline, headline_italic, subheading,
     cta_primary_text, cta_primary_url, cta_ghost_text,
     cta_ghost_url, background_image (Cloudinary URL),
     stat_1_number, stat_1_label, stat_2_number, stat_2_label,
     stat_3_number, stat_3_label, is_published (boolean),
     updated_by (uuid → users.id), updated_at (timestamp)

2. server/hero.ts (server functions)
   - getHero()         → fetch single hero record
   - upsertHero(data)  → insert or update (only 1 record ever)
   - publishHero()     → set is_published = true
   - unpublishHero()   → set is_published = false

3. lib/cloudinary.ts
   - uploadImage(file) → returns Cloudinary secure_url
   - deleteImage(publicId) → removes old image on replace

4. app/admin/hero/page.tsx
   - Two-column layout: form left, live preview right
   - All hero fields as labeled inputs / textareas
   - Image upload button → triggers Cloudinary upload
   - Preview panel updates in real time via TanStack Query
   - "Save Draft" button → upsertHero, is_published = false
   - "Publish" button → upsertHero + publishHero()
   - Show last updated timestamp + updated_by name

5. app/(public)/page.tsx — hero section only
   - Fetches hero where is_published = true
   - Renders badge, headline, italic accent, subheading,
     two CTA buttons, three stats
   - Falls back gracefully if no published hero exists

CONSTRAINTS:
- Only ONE hero record in DB at all times (upsert not insert)
- Draft saves must NOT affect the live public site
- Image upload must show progress indicator
- All form fields must have character limits and validation
- Preview must match public rendering exactly — same component
- Protect route with requireAuth middleware (editor + superadmin)

OUTPUT: All files with full working code, no placeholders.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI PROMPT — Phase 4: Module 2b — Attractions CRUD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Visit Harar — Government Tourism Website + CMS
STACK: TanStack Start, Node.js, PostgreSQL, Drizzle ORM,
       Better Auth, Cloudinary, Tailwind CSS, TanStack Query

MASTER CONTEXT:
- Auth (Module 1) and Hero Manager (Module 2a) already built
- Cloudinary util (lib/cloudinary.ts) already exists — reuse it
- Editor role has access to /admin/attractions
- All public content rendered from DB, nothing hardcoded
- Categories: Heritage, Wildlife, Spiritual, Culture,
              Shopping, History

YOUR TASK — Build Module 2b: Attractions CRUD

DELIVER exactly these files:

1. drizzle/schema/attractions.ts
   - attractions table with all fields:
     id, title, slug, short_desc, full_desc, image,
     category, is_featured, is_published, sort_order,
     created_by, updated_by, created_at, updated_at

2. server/attractions.ts (server functions)
   - getAttractions(filters?)     → all attractions, sorted
   - getAttractionBySlug(slug)    → single record for public
   - getAttractionById(id)        → single record for admin
   - createAttraction(data)       → insert new
   - updateAttraction(id, data)   → update existing
   - deleteAttraction(id)         → delete + remove Cloudinary img
   - updateSortOrder(orderedIds)  → bulk update sort_order
   - togglePublished(id)          → flip is_published
   - toggleFeatured(id)           → flip is_featured

3. lib/slug.ts
   - generateSlug(title)  → url-safe slug from title
   - ensureUniqueSlug(slug, id?)  → appends -2, -3 if taken

4. app/admin/attractions/page.tsx  (list view)
   - Table: image thumb, title, category badge, featured
     toggle, published toggle, sort handle, edit, delete
   - Drag-and-drop reorder via @dnd-kit/sortable
   - Inline toggles update DB without page reload
   - Delete shows confirmation dialog
   - "New Attraction" button links to /admin/attractions/new

5. app/admin/attractions/new/page.tsx  (create)
   - Full form: all fields
   - Slug auto-generated from title as user types
   - Rich text editor for full_desc (use Tiptap — basic toolbar)
   - Cloudinary image upload with preview
   - Category select, featured toggle, published toggle
   - "Save Draft" (is_published=false) and "Publish" buttons

6. app/admin/attractions/[id]/edit/page.tsx  (edit)
   - Same as create, pre-filled from DB
   - Shows metadata: created_at, updated_at, updated_by name

7. app/(public)/attractions/page.tsx  (public list)
   - Grid of published attraction cards, sorted by sort_order
   - Category filter tabs at top
   - Each card: image, title, short_desc, category tag,
     "Learn More" link to detail page

8. app/(public)/attractions/[slug]/page.tsx  (public detail)
   - Full page: image, title, full_desc (rendered HTML),
     category tag, back button
   - "Book a Guide" CTA linking to /booking

CONSTRAINTS:
- Slug must be auto-generated but manually editable
- Deleting an attraction must also delete its Cloudinary image
- Drag-and-drop reorder must persist to DB on drop
- Unpublished attractions must NEVER appear on public routes
- Reuse the same AttractionCard component in both admin
  preview and public page — single source of truth
- Protect all /admin/* routes with requireAuth middleware
- Tiptap rich text output stored as HTML string in full_desc

OUTPUT: All files with full working code, no placeholders.



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI PROMPT — Phase 4: Module 2c — Gallery Manager
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Visit Harar — Government Tourism Website + CMS
STACK: TanStack Start, Node.js, PostgreSQL, Drizzle ORM,
       Better Auth, Cloudinary, Tailwind CSS, TanStack Query

MASTER CONTEXT:
- Auth (Module 1), Hero (2a), Attractions (2b) already built
- lib/cloudinary.ts already exists — reuse uploadImage(),
  deleteImage()
- @dnd-kit/sortable already installed from Module 2b
- Editor role has access to /admin/gallery

YOUR TASK — Build Module 2c: Gallery Manager

DELIVER exactly these files:

1. drizzle/schema/gallery.ts
   - gallery_albums table (id, title, description,
     cover_image, is_published, sort_order, created_by,
     updated_at)
   - gallery_items table (id, album_id → cascade delete,
     type enum, url, thumbnail_url, caption, alt_text,
     is_published, sort_order, uploaded_by, created_at)

2. server/gallery.ts (server functions)
   - getAlbums()                   → all albums + item count
   - getAlbumById(id)              → album + all its items
   - createAlbum(data)             → insert album
   - updateAlbum(id, data)         → update album fields
   - deleteAlbum(id)               → delete album + all items
                                     + all Cloudinary assets
   - reorderAlbums(orderedIds)     → bulk update sort_order
   - uploadMediaItem(albumId, file)→ Cloudinary upload →
                                     insert gallery_items row
   - updateMediaItem(id, data)     → update caption/alt/published
   - deleteMediaItem(id)           → delete row + Cloudinary asset
   - reorderItems(albumId, ids)    → bulk update sort_order
   - setAlbumCover(albumId, itemId)→ update cover_image on album
   - bulkPublish(ids, published)   → bulk toggle is_published

3. app/admin/gallery/page.tsx  (albums list)
   - Grid of album cards with cover, title, count badge
   - Published toggle inline per album
   - Drag-and-drop reorder (persist on drop)
   - "New Album" opens modal: title + description inputs
   - Delete album: confirmation dialog warns items will be lost

4. app/admin/gallery/[albumId]/page.tsx  (media manager)
   - Dropzone at top: drag files or click to upload multiple
   - Per-file upload progress bars
   - Media grid: thumbnail, inline caption, inline alt_text,
     published toggle, delete, "Set as cover" button
   - Drag-and-drop reorder within album
   - Bulk action bar: select all, publish, unpublish, delete

5. app/(public)/gallery/page.tsx  (public albums grid)
   - Published albums sorted by sort_order
   - Card: cover image, title, item count badge
   - Link to /gallery/[albumId]

6. app/(public)/gallery/[albumId]/page.tsx  (lightbox page)
   - Grid of published items in sort_order
   - Click → full-screen lightbox (use yet-another-react-lightbox)
   - Lightbox: prev/next, caption display, keyboard nav
   - Video items: render as <video> tag with controls in lightbox

CONSTRAINTS:
- Multi-file upload must show individual progress per file
- Deleting album or item must clean up Cloudinary — no orphans
- on delete cascade on gallery_items.album_id in DB
- Unpublished items must NEVER appear on public routes
- Album cover auto-sets to first uploaded item if not manually set
- Alt text is required before an item can be published
  (accessibility — this is a government site)
- Videos stored on Cloudinary with resource_type: 'video'
- Protect all /admin/* routes with requireAuth middleware

OUTPUT: All files with full working code, no placeholders.



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI PROMPT — Phase 4: Module 2d — Pages Manager
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Visit Harar — Government Tourism Website + CMS
STACK: TanStack Start, Node.js, PostgreSQL, Drizzle ORM,
       Better Auth, Cloudinary, Tailwind CSS, TanStack Query

MASTER CONTEXT:
- Auth (1), Hero (2a), Attractions (2b), Gallery (2c) built
- lib/cloudinary.ts exists — reuse uploadImage()
- Tiptap rich text editor already installed from Module 2b
- @dnd-kit/sortable already installed — reuse for drag-and-drop
- Editor role has access to /admin/pages
- Pages are FIXED (about, culture, plan) — no create/delete
- Content stored as JSONB — structure differs per page_key

YOUR TASK — Build Module 2d: Pages Manager

DELIVER exactly these files:

1. drizzle/schema/pages.ts
   - pages table:
     id, page_key (unique text), title, hero_image,
     content (jsonb), is_published, updated_by, updated_at

2. scripts/seed-pages.ts
   - Seeds 3 rows with page_key: 'about', 'culture', 'plan'
   - Empty content JSONB, is_published = false
   - Safe to run multiple times (upsert by page_key)

3. server/pages.ts (server functions)
   - getPage(pageKey)          → fetch single page record
   - upsertPageContent(key, data) → update content + hero_image
   - publishPage(pageKey)      → set is_published = true
   - unpublishPage(pageKey)    → set is_published = false

4. components/admin/editors/AboutEditor.tsx
   - Hero image upload (Cloudinary)
   - Tiptap for: intro_text, unesco_text, geography_text
   - QuickFactsList component:
     · Renders list of {label, value} pairs
     · Add row button, inline edit, delete, drag reorder
     · Stores as JSON array in content.quick_facts

5. components/admin/editors/CultureEditor.tsx
   - Hero image upload
   - Tiptap for intro_text
   - SectionsBuilder component:
     · Each section: title (text), body (Tiptap), image (upload)
     · Add section, drag reorder, delete section
     · Stored as content.sections JSON array
   - FestivalsList component:
     · Each festival: name, date, description (all text)
     · Add, reorder, delete
     · Stored as content.festivals JSON array

6. components/admin/editors/PlanEditor.tsx
   - Hero image upload
   - Tiptap for: getting_here, best_time, visa_info,
     accommodation
   - ItinerariesBuilder component:
     · Each itinerary: duration (text), title (text),
       days (list of text entries — add/remove/reorder)
     · Add itinerary, reorder itineraries, delete
     · Stored as content.itineraries JSON array

7. app/admin/pages/page.tsx  (list)
   - Table of 3 pages: name, last updated, published badge,
     Edit button
   - No create or delete UI

8. app/admin/pages/[pageKey]/page.tsx  (editor shell)
   - Loads correct editor component based on pageKey
   - "Save Draft" and "Publish" buttons
   - Shows updated_at and updated_by name

9. app/(public)/about/page.tsx
   - Renders About page from DB content JSONB
   - Sections: hero image, intro, UNESCO, geography, quick facts

10. app/(public)/culture/page.tsx
    - Renders Culture page from DB content JSONB
    - Sections: hero image, intro, dynamic sections,
      festivals list

11. app/(public)/plan-your-trip/page.tsx
    - Renders Plan page from DB content JSONB
    - Sections: hero image, getting here, best time,
      itineraries, visa info, accommodation

CONSTRAINTS:
- content JSONB shape is validated in server functions,
  not just trusted as-is from client
- Draft saves must NEVER affect the live public page
- All three page editors must share the same Save/Publish
  button logic — extract to usePageEditor() hook
- Unpublished pages show a friendly "Coming Soon" on public
  route — never a blank page or error
- Protect all /admin/* routes with requireAuth middleware
- Reuse Tiptap config from Module 2b — same toolbar, same
  HTML output format

OUTPUT: All files with full working code, no placeholders.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI PROMPT — Phase 4: Module 2e — Announcements
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Visit Harar — Government Tourism Website + CMS
STACK: TanStack Start, Node.js, PostgreSQL, Drizzle ORM,
       Better Auth, Cloudinary, Tailwind CSS, TanStack Query

MASTER CONTEXT:
- Auth (1), Hero (2a), Attractions (2b), Gallery (2c),
  Pages (2d) already built
- lib/cloudinary.ts exists — reuse uploadImage(), deleteImage()
- lib/slug.ts exists — reuse generateSlug(), ensureUniqueSlug()
- Tiptap already configured — reuse same instance
- Editor role has access to /admin/announcements
- Types: News | Event | Notice
- Only ONE announcement can be pinned at a time

YOUR TASK — Build Module 2e: Announcements

DELIVER exactly these files:

1. drizzle/schema/announcements.ts
   - announcements table with all fields:
     id, title, slug, type, body, cover_image, event_date,
     event_location, is_pinned, is_published, published_at,
     created_by, updated_by, created_at, updated_at

2. server/announcements.ts (server functions)
   - getAnnouncements(filters?)
       → all announcements, pinned first, then by published_at
       → accepts filter: type, published only
   - getAnnouncementBySlug(slug)  → public detail fetch
   - getAnnouncementById(id)      → admin edit fetch
   - getLatestAnnouncements(n)    → for homepage widget (n=3)
   - createAnnouncement(data)     → insert, set published_at
                                    if is_published = true
   - updateAnnouncement(id, data) → update, set published_at
                                    on first publish
   - deleteAnnouncement(id)       → delete row + Cloudinary img
   - togglePublished(id)          → flip is_published,
                                    set published_at if first pub
   - pinAnnouncement(id)          → set is_pinned=true on this,
                                    is_pinned=false on all others
   - unpinAnnouncement(id)        → set is_pinned=false

3. app/admin/announcements/page.tsx  (list)
   - Table with columns: pin toggle, cover thumb, title,
     type badge, event_date (if Event), published toggle,
     edit link, delete button
   - Filter bar: All | News | Event | Notice
   - Pin toggle: unpins current pinned before pinning new one
   - Delete: confirmation dialog
   - "New Announcement" button

4. app/admin/announcements/new/page.tsx  (create)
   - Title input → slug auto-generated (editable)
   - Type selector → shows event_date + event_location
     inputs conditionally when type = Event
   - Tiptap body editor
   - Cover image upload (optional)
   - is_pinned toggle (warns if another is already pinned)
   - is_published toggle
   - "Save Draft" and "Publish" buttons

5. app/admin/announcements/[id]/edit/page.tsx  (edit)
   - Same as create, pre-filled
   - Shows published_at, created_by, updated_by, timestamps

6. app/(public)/news/page.tsx  (feed)
   - Pinned post highlighted at top with distinct styling
   - Remaining posts sorted by published_at descending
   - Filter tabs: All | News | Events | Notices
   - Card: cover image, type badge, title, date, 120-char
     excerpt from body (strip HTML tags)
   - Pagination: 10 per page using URL search params (?page=2)

7. app/(public)/news/[slug]/page.tsx  (detail)
   - Cover image (full width if exists)
   - Type badge, title, published_at date
   - Event block (event_date + event_location) if type=Event
   - Body rendered as HTML (dangerouslySetInnerHTML, sanitized)
   - "Back to News" link

8. components/public/AnnouncementsWidget.tsx
   - Fetches 3 latest via getLatestAnnouncements(3)
   - Pinned post visually elevated (border or badge)
   - Used on homepage — import into home page component
   - "View all news →" link at bottom

CONSTRAINTS:
- Only one pinned announcement at a time — enforced in
  pinAnnouncement() server function, not just UI
- published_at set ONCE on first publish — never overwritten
  on subsequent edits
- event_date and event_location only saved when type = Event,
  null otherwise
- Body HTML must be sanitized before rendering publicly
  (use isomorphic-dompurify)
- Slug auto-generated but editable — use ensureUniqueSlug()
- Cover image deletion on announcement delete — no orphans
- Protect all /admin/* routes with requireAuth middleware

OUTPUT: All files with full working code, no placeholders.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI PROMPT — Phase 4: Module 2f + 2g
    Guide Profiles & Contact Info Manager
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Visit Harar — Government Tourism Website + CMS
STACK: TanStack Start, Node.js, PostgreSQL, Drizzle ORM,
       Better Auth, Cloudinary, Tailwind CSS, TanStack Query

MASTER CONTEXT:
- Auth (1), Hero (2a), Attractions (2b), Gallery (2c),
  Pages (2d), Announcements (2e) already built
- lib/cloudinary.ts, lib/slug.ts, Tiptap, @dnd-kit/sortable
  all already installed and configured — reuse everything
- Editor role has access to /admin/guides and /admin/contact
- contact_info is a single record — always upsert, never insert
- guides is a full CRUD list with drag-and-drop reorder

YOUR TASK — Build Module 2f + 2g together

DELIVER exactly these files:

── MODULE 2f: GUIDE PROFILES ──────────────────────────────

1. drizzle/schema/guides.ts
   - guides table with all fields:
     id, name, slug, photo, bio, languages (text[]),
     specialties (text[]), experience_years, license_number,
     phone, email, is_available, is_published, sort_order,
     created_by, updated_by, created_at, updated_at

2. server/guides.ts
   - getGuides(filters?)         → published guides, sorted
   - getGuideBySlug(slug)        → public detail
   - getGuideById(id)            → admin edit
   - createGuide(data)           → insert
   - updateGuide(id, data)       → update
   - deleteGuide(id)             → delete + Cloudinary photo
   - reorderGuides(orderedIds)   → bulk sort_order update
   - togglePublished(id)         → flip is_published
   - toggleAvailable(id)         → flip is_available
   - getGuideBookingCount(id)    → count bookings for guide

3. components/admin/TagInput.tsx  (reusable)
   - Type text + Enter to add tag
   - Click tag × to remove
   - Renders as styled pill list
   - Returns string[] to parent via onChange
   - Used for both languages and specialties fields

4. app/admin/guides/page.tsx  (list)
   - Table: photo thumb, name, languages pills, specialties
     pills, available toggle, published toggle, edit, delete
   - Drag-and-drop reorder via @dnd-kit/sortable
   - Delete: confirmation dialog
   - "New Guide" button

5. app/admin/guides/new/page.tsx  (create)
   - Photo upload (Cloudinary) with preview
   - Name → slug auto-generated (editable)
   - Bio (Tiptap)
   - Languages TagInput
   - Specialties TagInput
   - Experience years (number input, min 0)
   - License number (text)
   - Phone + email inputs
   - is_available toggle
   - is_published toggle
   - "Save Draft" and "Publish" buttons

6. app/admin/guides/[id]/edit/page.tsx  (edit)
   - Same as create, pre-filled
   - Shows booking count (read-only badge)
   - Shows updated_at, updated_by name

7. app/(public)/guides/page.tsx  (directory)
   - Grid of published guides sorted by sort_order
   - Card: photo, name, language badges, specialty badges,
     experience years, availability status, "Book" button
   - Available guides first, unavailable greyed at bottom
   - Filter dropdown: by language, by specialty

8. app/(public)/guides/[slug]/page.tsx  (detail)
   - Full profile layout
   - Bio rendered HTML (sanitized)
   - Languages + specialties as badge lists
   - License number displayed (builds trust)
   - "Book This Guide" button → /booking?guideId=[id]

── MODULE 2g: CONTACT INFO MANAGER ────────────────────────

9. drizzle/schema/contact.ts
   - contact_info table with all fields:
     id, office_name, address_line1, address_line2, country,
     phone_primary, phone_secondary, email_general,
     email_bookings, working_hours (jsonb), map_lat, map_lng,
     facebook_url, twitter_url, instagram_url,
     is_published, updated_by, updated_at

10. server/contact.ts
    - getContactInfo()           → fetch single record
    - upsertContactInfo(data)    → insert or update (1 record)
    - publishContact()           → set is_published = true
    - unpublishContact()         → set is_published = false

11. app/admin/contact/page.tsx  (single form)
    - Office name, address fields
    - Phone primary + secondary
    - Email general + bookings
    - WorkingHoursList component:
      · Rows of {day, hours} — add, edit inline, delete, reorder
      · Stored as JSONB array
    - Map coordinates: lat + lng number inputs
    - Map preview: Leaflet.js map with draggable pin
      (load Leaflet from cdnjs, no API key)
    - Social links: Facebook, Twitter, Instagram
    - "Save Draft" and "Publish" buttons
    - Last updated timestamp + updated_by name

12. app/(public)/contact/page.tsx  (public page)
    - Office name + full address
    - Phone numbers as <a href="tel:..."> (tap to call)
    - Emails as <a href="mailto:...">
    - Working hours rendered from JSONB as clean table
    - Leaflet map embed with bureau pin at map_lat, map_lng
    - Social media icon links (use Tabler icons)
    - Graceful fallback if contact not yet published

CONSTRAINTS:
- contact_info is always a single row — upsertContactInfo()
  must never create a second row (use fixed id or ON CONFLICT)
- Guide photo deletion on guide delete — no Cloudinary orphans
- languages and specialties stored as PostgreSQL text[] arrays
- Bio HTML sanitized before public render (isomorphic-dompurify)
- Leaflet must load from cdnjs.cloudflare.com (CSP constraint)
- Unavailable guides still shown publicly but visually distinct
  and sorted to bottom — never hidden entirely
- Protect all /admin/* routes with requireAuth middleware
- Reuse TagInput component anywhere tag-style input is needed

OUTPUT: All files with full working code, no placeholders.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI PROMPT — Phase 4: Module 3 — Public Website
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Visit Harar — Government Tourism Website + CMS
STACK: TanStack Start, Node.js, PostgreSQL, Drizzle ORM,
       Better Auth, Cloudinary, Tailwind CSS, TanStack Query

MASTER CONTEXT:
- All CMS modules (1, 2a–2g) already built
- All individual public pages already built inside their
  respective modules — do NOT rebuild them
- This module wires everything together: layout, homepage,
  shared components, SEO, and performance

YOUR TASK — Build Module 3: Public Website Shell

DELIVER exactly these files:

1. app/(public)/layout.tsx  (public layout shell)
   - Wraps all public routes
   - Renders PublicNavbar at top
   - Renders PublicFooter at bottom
   - Fetches contact_info once at layout level and passes
     to footer via context — no per-page footer fetch

2. components/public/PublicNavbar.tsx
   - Logo left: "Visit Harar" text + bureau subtitle
   - Nav links center: Home, Attractions, Guides, Gallery,
     Culture, Plan Your Trip, News, Contact
   - CTA right: "Book a Guide" button → /booking
   - Sticky positioning, transparent over hero on homepage,
     solid white/dark on all inner pages (use scroll detection)
   - Mobile (<768px): hamburger → full-screen slide drawer
   - Active link highlighted via current route match
   - No admin login link visible anywhere

3. components/public/PublicFooter.tsx
   - Receives contact_info as prop from layout
   - Logo + tagline block
   - Four nav columns: Explore, Plan, Learn, Connect
   - Contact details: address, phone, email from contact_info
   - Social links from contact_info (show only if URL exists)
   - Copyright line with dynamic year
   - Language switcher (render placeholder — v2 feature)

4. app/(public)/page.tsx  (homepage — full assembly)
   Fetch all sections in PARALLEL (Promise.all):
   - getHero()                    → hero section
   - getAttractions({featured:true, limit:6}) → featured cards
   - getLatestAnnouncements(3)    → announcements widget
   - getGuides({limit:3})         → featured guides
   - getGalleryItems({limit:8})   → gallery teaser
   - getPage('about')             → about teaser content

   Render sections in order:
   a. HeroSection          (from hero_content)
   b. FeaturedAttractions  (grid of AttractionCards)
   c. AnnouncementsWidget  (from Module 2e — reuse component)
   d. FeaturedGuides       (grid of GuideCards)
   e. GalleryTeaser        (8 thumbnails, "View Gallery" link)
   f. AboutTeaser          (short intro + quick facts strip)
   g. CTABanner            ("Plan your visit" → /plan-your-trip)

   Each section wrapped in its own error boundary — one
   section failing must NOT break the entire homepage.

5. components/public/PageHero.tsx
   - Props: title, subtitle?, backgroundImage?, overlayOpacity?
   - Full-width banner used on all inner pages
   - Text overlaid on image with dark gradient overlay
   - Falls back to solid brand color if no image

6. components/public/SectionHeader.tsx
   - Props: title, subtitle?, align? (left | center)
   - Consistent heading block used across all sections

7. components/public/AttractionCard.tsx  (if not yet created)
   - Props: attraction object
   - Image, title, short_desc, category badge, "Learn More"
   - Used in /attractions grid AND homepage featured section

8. components/public/GuideCard.tsx  (if not yet created)
   - Props: guide object
   - Photo, name, language badges, specialty badges,
     experience, availability indicator, "Book" button

9. components/public/AnnouncementCard.tsx (if not yet created)
   - Props: announcement object
   - Cover image, type badge, title, date, 120-char excerpt

10. components/public/GalleryThumb.tsx  (if not yet created)
    - Props: item object (url, caption, type)
    - Image or video thumbnail, caption on hover

11. components/public/ComingSoon.tsx
    - Shown when a CMS page is not yet published
    - Simple: "This page is coming soon" + back link
    - Never show blank page or error to public visitor

12. lib/metadata.ts
    - buildMetadata(overrides?) → merged page metadata object
    - Default title: "Visit Harar — Official Tourism Website"
    - Default description: bureau tagline
    - Default og:image: published hero background_image
    - Each page calls buildMetadata with its own overrides

13. app/sitemap.ts
    - Generates /sitemap.xml
    - Static routes: /, /attractions, /guides, /gallery,
      /about, /culture, /plan-your-trip, /news, /contact
    - Dynamic routes: all published attraction slugs,
      guide slugs, announcement slugs

14. lib/cloudinary-url.ts
    - optimizeImage(url, options?)
      → appends Cloudinary transformation params
        w=800, q=auto, f=auto by default
    - Used in every public image render — never raw URLs

CONSTRAINTS:
- Homepage MUST use Promise.all — no sequential awaits
- Each homepage section must have its own error boundary
- No public page should make more than 3 sequential DB calls
- All images go through optimizeImage() before rendering
- ComingSoon renders for any unpublished CMS page —
  never a 404 or blank screen
- Admin login must NOT be linked from anywhere public
- Mobile nav drawer must trap focus when open (accessibility)
- PublicNavbar must be transparent on homepage, solid elsewhere
- Footer contact info fetched ONCE at layout level — not
  repeated on every page

OUTPUT: All files with full working code, no placeholders.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI PROMPT — Phase 4: Module 4 — Booking System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Visit Harar — Government Tourism Website + CMS
STACK: TanStack Start, Node.js, PostgreSQL, Drizzle ORM,
       Better Auth, Tailwind CSS, TanStack Query, Resend

MASTER CONTEXT:
- All previous modules (1, 2a–2g, 3) already built
- guides table exists with is_published, is_available fields
- contact_info table has email_bookings field — use as
  bureau notification recipient
- No payment processing in v1 — request/confirm flow only
- Email provider: Resend (npm install resend)
- Booking ref format: HRR-[YEAR]-[5-digit padded count]

YOUR TASK — Build Module 4: Booking System

DELIVER exactly these files:

1. drizzle/schema/bookings.ts
   - bookings table with all fields:
     id, booking_ref, guide_id, visitor_name, visitor_email,
     visitor_phone, visitor_country, tour_date, tour_duration,
     group_size, special_requests, status, status_note,
     notified_at, created_at, updated_by, updated_at

2. lib/booking-ref.ts
   - generateBookingRef()
     → counts existing bookings for current year
     → returns HRR-[YEAR]-[padded 5-digit count + 1]
     → e.g. HRR-2026-00001
     → thread-safe: run inside same transaction as insert

3. lib/email.ts
   - Resend client initialization
   - sendConfirmationEmail(booking, guide)
       → to visitor: booking confirmed with guide contacts
   - sendDeclineEmail(booking, statusNote)
       → to visitor: polite decline + status note
   - sendCancellationEmail(booking)
       → to visitor: cancellation confirmation
   - sendNewBookingAlert(booking, guide)
       → to bureau email_bookings: new pending request
         with link to /admin/bookings/[id]
   - All emails: plain HTML, Visit Harar branded header,
     bureau contact info in footer

4. server/bookings.ts (server functions)
   - getBookings(filters?)
       → all bookings, newest first
       → filters: status, guide_id, date range
   - getBookingById(id)        → full booking + guide details
   - getBookingByRef(ref, email) → for public status check
   - createBooking(data)
       → generate booking_ref (in transaction)
       → insert booking (status = Pending)
       → sendNewBookingAlert() to bureau
       → return booking_ref to client
   - confirmBooking(id, note?)
       → update status = Confirmed, status_note, updated_by
       → sendConfirmationEmail()
       → set notified_at
   - declineBooking(id, note)
       → update status = Declined, status_note, updated_by
       → sendDeclineEmail()
       → set notified_at
   - cancelBooking(id, note)
       → update status = Cancelled, status_note, updated_by
       → sendCancellationEmail()
       → set notified_at
   - resendNotification(id)
       → resends last relevant email based on current status

5. app/admin/bookings/page.tsx  (list)
   - Table: ref, guide name, visitor name, country,
     tour_date, duration, group size, status badge,
     created_at, click row to detail
   - Filter bar: status tabs + guide dropdown + date range
   - Status badge colors: Pending=amber, Confirmed=green,
     Declined=red, Cancelled=gray
   - Empty state per filter (no bookings yet messaging)
   - Auto-refresh every 60s (TanStack Query refetchInterval)

6. app/admin/bookings/[id]/page.tsx  (detail)
   - Full booking info layout
   - Guide card (photo, name, phone, email)
   - Visitor details block
   - Tour details block (date, duration, group, requests)
   - Status badge + updated_by + updated_at
   - Action panel (conditional on status):
     · Pending: Confirm button + Decline button
     · Confirmed: Cancel Booking button
     · Declined / Cancelled: read-only notice
   - Confirm modal: optional note textarea + confirm button
   - Decline modal: required note textarea + decline button
   - Cancel modal: required note textarea + cancel button
   - "Resend notification email" button (all statuses)
   - Breadcrumb: Bookings → [booking_ref]

7. app/(public)/booking/page.tsx  (multi-step form)
   - 4-step form managed with local React state (no URL steps)
   - Progress indicator: Step 1 of 4 header
   - Step 1: Guide selector
     · If ?guideId param present → pre-select guide
     · Searchable dropdown of published+available guides
     · Selected guide preview card
   - Step 2: Tour details
     · Date picker (HTML date input, min = today)
     · Duration radio: Half Day | Full Day | Multi Day
     · Group size number input (1–50)
   - Step 3: Visitor details
     · Name, email, phone (optional), country dropdown,
       special requests textarea
   - Step 4: Review
     · Full summary display
     · Terms notice
     · Submit button → calls createBooking() server fn
     · Loading state on submit button
   - On success: replace form with success screen
     · Booking ref displayed large
     · Email confirmation notice
     · Return to Home button
   - On error: inline error message, form stays filled

8. app/(public)/booking/status/page.tsx
   - Two inputs: booking reference + email address
   - Submit → calls getBookingByRef(ref, email)
   - Shows: status badge, guide name, tour date, duration,
     group size, status_note (if declined)
   - No login required — public page
   - Wrong ref/email: "No booking found" message

CONSTRAINTS:
- booking_ref generation must be in same DB transaction
  as insert — never generate ref then fail to insert
- Status transitions enforced in server functions:
  Pending→Confirmed, Pending→Declined, Confirmed→Cancelled
  Any other transition must throw an error
- Declined and Cancelled are terminal — no further updates
- Email sending failures must NOT block booking creation —
  wrap in try/catch, log error, continue
- Public booking form must work without JS for basic submit
  (progressive enhancement)
- getBookingByRef requires BOTH ref AND email — never
  expose booking details with ref alone (privacy)
- Auto-refresh on admin list must not reset scroll position
- Protect all /admin/* routes with requireAuth middleware
- tour_date must be validated server-side (not in the past)

OUTPUT: All files with full working code, no placeholders.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI PROMPT — Phase 4: Module 5 + 6
    Media Manager & Super Admin Panel
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Visit Harar — Government Tourism Website + CMS
STACK: TanStack Start, Node.js, PostgreSQL, Drizzle ORM,
       Better Auth, Cloudinary, Tailwind CSS, TanStack Query,
       Resend

MASTER CONTEXT:
- All modules (1, 2a–2g, 3, 4) already built
- lib/cloudinary.ts exists — reuse uploadImage(), deleteImage()
- lib/email.ts exists — reuse Resend client
- requireAuth middleware exists — reuse for all /admin routes
- superadmin role has exclusive access to /admin/users,
  /admin/audit, /admin/settings
- editor role sees /admin/dashboard but NOT the above three
- Media Manager serves ALL upload fields across the CMS —
  replace all individual Cloudinary upload calls with
  MediaPicker component

YOUR TASK — Build Module 5 + 6 together

DELIVER exactly these files:

── MODULE 5: MEDIA MANAGER ────────────────────────────────

1. drizzle/schema/media.ts
   - media_assets table:
     id, cloudinary_id (unique), url, thumbnail_url,
     filename, type, size_bytes, width, height, alt_text,
     used_in (text[]), uploaded_by, created_at

2. server/media.ts
   - getMediaAssets(filters?)
       → all assets, newest first
       → filters: type (image|video), search (filename/alt)
       → pagination: page, perPage (default 48)
   - getMediaAssetById(id)     → single asset
   - uploadMediaAsset(file, uploadedBy)
       → upload to Cloudinary
       → extract metadata (size, width, height, type)
       → insert into media_assets
       → return full asset record
   - updateAltText(id, altText) → update alt_text field
   - markUsedIn(id, module)    → append module to used_in[]
   - unmarkUsedIn(id, module)  → remove module from used_in[]
   - deleteMediaAsset(id)
       → check used_in[] — if not empty warn but allow
       → delete from Cloudinary
       → delete from media_assets
   - bulkDeleteMediaAssets(ids) → loop deleteMediaAsset()

3. components/admin/MediaPicker.tsx  (reusable modal)
   - Props: value (current URL), onChange (url → void),
            accept ('image'|'video'|'both')
   - Trigger: shows current image preview + "Change" button
     or "Upload Media" button if empty
   - Opens modal with two tabs:
     · "Upload New": dropzone → uploadMediaAsset() → select
     · "Choose Existing": grid from getMediaAssets()
   - Search input + type filter inside modal
   - Click asset → closes modal → calls onChange(url)
   - Replace ALL individual upload inputs across modules
     2a, 2b, 2c, 2d, 2e, 2f, 2g with MediaPicker

4. app/admin/media/page.tsx  (media library)
   - Grid: 48 assets per page
   - Search bar (filename / alt_text)
   - Filter tabs: All | Images | Videos
   - Sort dropdown: Newest | Oldest | Largest | Smallest
   - Asset card:
     · Thumbnail (image) or video icon
     · Filename truncated to 20 chars
     · Type badge, size, dimensions
     · used_in badges (hero, attractions, etc.)
     · Inline alt_text edit (click → input → enter to save)
     · Copy URL button (copies to clipboard)
     · Delete button (warns if used_in not empty)
   - Bulk select checkbox per card
   - Bulk delete button (appears when any selected)
   - Pagination controls

── MODULE 6: SUPER ADMIN PANEL ────────────────────────────

5. drizzle/schema/audit.ts
   - audit_logs table:
     id, user_id, user_name, user_email, module, action,
     record_id, record_title, before (jsonb), after (jsonb),
     created_at

6. drizzle/schema/settings.ts
   - site_settings table:
     id, site_name, site_tagline, default_og_image,
     maintenance_mode, booking_enabled, bureau_email,
     analytics_id, updated_by, updated_at

7. lib/audit.ts
   - logAction(params)
       → inserts audit_log row
       → params: userId, module, action, recordId,
                 recordTitle, before?, after?
       → snapshots user_name + user_email at time of call
       → called inside every server function that mutates data
       → fire-and-forget (never blocks the main operation)
   - Must be added retroactively to all server functions
     in modules 2a–2g and 4 — list all insertion points

8. scripts/seed-settings.ts
   - Seeds one site_settings row with sensible defaults
   - Safe to run multiple times (upsert)

9. server/users.ts
   - getUsers()              → all users, newest first
   - getUserById(id)         → single user
   - createEditorAccount(data)
       → hash password (bcrypt)
       → insert user (role: editor, is_active: true)
       → send welcome email via Resend with login URL
   - updateUser(id, data)    → update name, email, role
   - toggleUserActive(id)    → flip is_active
                               cannot deactivate self
   - sendPasswordReset(id)   → generate reset token,
                               send via Resend

10. server/audit.ts
    - getAuditLogs(filters?)
        → all logs, newest first
        → filters: userId, module, date range
        → pagination: 50 per page
    - Read-only — no mutations

11. server/settings.ts
    - getSettings()           → fetch single settings record
    - upsertSettings(data)    → update settings
    - getBookingEnabled()     → fast check for booking form
    - getMaintenanceMode()    → fast check for public routes

12. app/admin/dashboard/page.tsx  (shared dashboard)
    - Summary metric cards (all roles see these):
      · Bookings this month (count)
      · Pending bookings (count, amber if > 0)
      · Published attractions (count)
      · Published guides (count)
    - Quick action buttons:
      · New Attraction → /admin/attractions/new
      · New Guide → /admin/guides/new
      · New Announcement → /admin/announcements/new
      · View Bookings → /admin/bookings
    - Recent audit log (superadmin only — 10 entries):
      · user name, module, action, record title, time ago
    - System status panel (superadmin only):
      · DB: query test → OK / Error
      · Cloudinary: ping → OK / Error
      · Email: Resend API key present → OK / Missing
      · Maintenance mode toggle (instant update)

13. app/admin/users/page.tsx  (superadmin only)
    - Table: name, email, role badge, status badge,
             last login, created_at, actions
    - "New Editor" button → create form modal:
      · Name, email, temporary password inputs
      · Sends welcome email on create
    - Edit user: inline modal (name, email, role)
    - Deactivate toggle (confirm dialog)
    - Send password reset link button
    - Cannot deactivate or edit own account (greyed out)

14. app/admin/audit/page.tsx  (superadmin only)
    - Table: timestamp, user, module, action badge,
             record title, "View diff" button
    - View diff modal: before/after JSON side-by-side
    - Filter bar: user dropdown, module dropdown,
      date range picker
    - Pagination: 50 per page
    - Read-only — no actions

15. app/admin/settings/page.tsx  (superadmin only)
    - Site name + tagline inputs
    - Default OG image (MediaPicker)
    - Maintenance mode toggle (with warning: makes site
      show maintenance page to all public visitors)
    - Booking enabled toggle (with warning: disables
      booking form on public site)
    - Bureau email input
    - Analytics ID input
    - "Save Settings" button
    - Last updated by + timestamp

16. middleware/maintenanceMode.ts
    - Runs on all public routes (not /admin/*)
    - Checks site_settings.maintenance_mode
    - If true → renders MaintenancePage component
    - MaintenancePage: "Visit Harar is temporarily
      unavailable. Please check back soon."
      + bureau contact info

17. lib/audit-points.ts  (documentation file)
    - Lists every server function across all modules
      that must call logAction()
    - Format: module → function → action label
    - Used as checklist when wiring audit into existing code

CONSTRAINTS:
- MediaPicker must replace ALL individual upload inputs —
  no module should call Cloudinary directly from UI anymore
- logAction() must be fire-and-forget — wrapped in
  try/catch, never throws, never blocks mutations
- Audit before/after snapshots: strip password fields
  before storing — never log hashed passwords
- Deactivated users: sessions invalidated immediately
  on is_active = false (check in requireAuth middleware)
- site_settings always single row — seed on deploy,
  upsert only, never insert second row
- Maintenance mode check must be fast — cache result
  for 60 seconds (TanStack Query on server side)
- booking_enabled check runs in /booking page server fn —
  redirects to /contact if false with explanation message
- All /admin/users, /admin/audit, /admin/settings routes
  must check role === 'superadmin' — not just authenticated
- Protect all /admin/* routes with requireAuth middleware

OUTPUT: All files with full working code, no placeholders.



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI PROMPT — Phase 5: Smart Chunking
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Visit Harar — Government Tourism Website + CMS
STACK: TanStack Start, Node.js, PostgreSQL, Drizzle ORM,
       Better Auth, Cloudinary, Tailwind CSS, TanStack Query,
       Resend

MASTER CONTEXT:
- Full module specs for all 6 modules are defined
- Every chunk has a single responsibility
- Chunks are ordered by dependency
- Each chunk has a clear DONE condition

TOTAL CHUNKS: 47 executable tasks

BUILD ORDER SUMMARY:
  1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6
  2a.1 → 2a.2 → 2a.3 → 2a.4 → 2a.5
  2b.1 → 2b.2 → 2b.3 → 2b.4 → 2b.5 → 2b.6 → 2b.7
  2c.1 → 2c.2 → 2c.3 → 2c.4 → 2c.5
  2d.1 → 2d.2 → 2d.3 → 2d.4 → 2d.5 → 2d.6
  2e.1 → 2e.2 → 2e.3 → 2e.4
  2f.1 → 2f.2 → 2f.3 → 2f.4 → 2f.5
  2g.1 → 2g.2 → 2g.3 → 2g.4
  3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6
  4.1 → 4.2 → 4.3 → 4.4 → 4.5 → 4.6 → 4.7
  5.1 → 5.2 → 5.3 → 5.4 → 5.5
  6.1 → 6.2 → 6.3 → 6.4 → 6.5 → 6.6 → 6.7 → 6.8

WHEN EXECUTING EACH CHUNK:
- Paste the full Master Context at the top of every prompt
- Then paste the specific chunk task and file list
- Then paste the relevant module spec from Phase 4
- End with: "Output all files with full working code,
  no placeholders, no TODOs."
- Verify the DONE condition before starting next chunk

GOAL:
Using this chunk map, generate a printable one-page
build checklist in markdown table format with columns:
  Chunk ID | Module | Task Summary | Key Files | Done?
All 47 chunks listed in build order.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI PROMPT — Phase 6: Database Architecture
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Visit Harar — Government Tourism Website + CMS
STACK: TanStack Start, Node.js, PostgreSQL, Drizzle ORM

MASTER CONTEXT:
14 tables across 6 modules. Conventions:
- UUIDs as primary keys (defaultRandom())
- Text not varchar (PostgreSQL handles length)
- JSONB for flexible structured data
- text[] for array fields (languages, specialties, used_in)
- No Postgres ENUM types — text with app validation
- Hard deletes + audit log (no soft deletes)
- Single-record tables enforced at app level not DB

TABLES + RELATIONSHIPS:
users → sessions (1:M)
users → attractions, gallery_albums, gallery_items,
        announcements, guides, bookings, media_assets,
        audit_logs (1:M via created_by/updated_by)
users → hero_content, pages, contact_info,
        site_settings (1:1 via updated_by)
gallery_albums → gallery_items (1:M, CASCADE DELETE)
guides → bookings (1:M, RESTRICT DELETE)

YOUR TASK — Produce the master database files:

1. drizzle/schema/index.ts  (master schema export)
   - Imports and re-exports ALL table definitions
   - Imports and re-exports ALL relation definitions
   - Single import point: import { db } from 'drizzle/schema'

2. drizzle/schema/relations.ts  (all Drizzle relations)
   - Define relations() for every table using Drizzle's
     relations API
   - users: hasMany sessions, attractions, gallery_albums,
     gallery_items, announcements, guides, bookings,
     media_assets, audit_logs
   - gallery_albums: hasMany gallery_items
   - guides: hasMany bookings

3. drizzle/migrations/ (migration files)
   - Generate via `npm run db:generate`
   - Produce the drizzle.config.ts that points to
     ./drizzle/schema/index.ts as schema source
   - Produce the npm scripts in package.json:
     "db:generate": "drizzle-kit generate"
     "db:migrate":  "drizzle-kit migrate"
     "db:push":     "drizzle-kit push"
     "db:studio":   "drizzle-kit studio"

4. db/index.ts  (database client)
   - Initialize postgres connection using DATABASE_URL
   - Initialize Drizzle with schema
   - Export typed db client used across all server fns
   - Export type DB for typed query building

5. db/indexes.sql  (performance indexes)
   - Raw SQL file with all CREATE INDEX statements
   - Organized by table with comments
   - GIN indexes for text[] columns (languages,
     specialties, used_in)
   - Composite indexes for common query patterns:
     (is_published, sort_order) for list queries
     (is_published, published_at) for feed queries
     (booking_ref, visitor_email) for status check

6. scripts/seed-superadmin.ts
   - Reads SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD from env
   - Hashes password with bcrypt (10 rounds)
   - Upserts into users (role: superadmin, is_active: true)
   - Logs success — safe to re-run

7. scripts/seed-pages.ts
   - Upserts 3 rows: about, culture, plan
   - Empty content JSONB, is_published: false
   - Safe to re-run

8. scripts/seed-settings.ts
   - Upserts default site_settings row:
     site_name: "Visit Harar"
     site_tagline: "Official Tourism Website of the
                    Harari Regional State"
     maintenance_mode: false
     booking_enabled: true
   - Safe to re-run

9. scripts/run-all-seeds.ts
   - Runs all 3 seed scripts in order:
     seed-superadmin → seed-pages → seed-settings
   - Single command: `npm run db:seed`
   - Logs each step with success/failure

CONSTRAINTS:
- All schema files must use Drizzle ORM syntax only —
  no raw SQL in schema definitions
- db/index.ts must work in both server functions and
  TanStack Start server-side rendering context
- updated_at must be set explicitly in every update
  operation — document this in a comment in db/index.ts
- GIN indexes must be created via db/indexes.sql not
  Drizzle schema (Drizzle does not support GIN natively)
- DATABASE_URL must be the only required env variable
  for DB connection — no separate host/port/user vars

OUTPUT: All files with full working code, no placeholders.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI PROMPT — Phase 7: API Architecture
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Visit Harar — Government Tourism Website + CMS
STACK: TanStack Start, Node.js, PostgreSQL, Drizzle ORM,
       Zod, Better Auth

MASTER CONTEXT:
- 14 DB tables, 6 modules, 47 build chunks already defined
- Server functions use TanStack Start server function pattern
- Auth enforced at middleware level — server fns trust session
- All inputs validated with Zod before DB operations
- Errors thrown as typed AppError — never raw strings
- Audit logging fire-and-forget on all mutations
- All types exported from lib/types.ts (single source)

YOUR TASK — Produce the API foundation files:

1. lib/errors.ts
   - AppError class extending Error
   - ErrorCode type union of all codes
   - isAppError(err) type guard
   - createError(code, message) factory helper

2. lib/types.ts
   - TypeScript type for every entity:
     HeroContent, Attraction, GalleryAlbum, GalleryItem,
     Page, Announcement, Guide, ContactInfo, Booking,
     MediaAsset, User (password omitted), AuditLog,
     SiteSettings
   - Infer types from Drizzle schema where possible
   - Export BookingStatus, TourDuration, UserRole,
     MediaType, AnnouncementType as string literal unions

3. lib/validators/common.ts
   - uuidSchema, slugSchema, urlSchema, emailSchema,
     paginationSchema as defined in spec

4. lib/validators/hero.ts
   - heroInputSchema with all fields and max lengths

5. lib/validators/attractions.ts
   - attractionInputSchema with category enum

6. lib/validators/bookings.ts
   - bookingInputSchema with future-date validation

7. lib/validators/guides.ts
   - guideInputSchema (name, bio, languages[], specialties[],
     experience_years, license_number, phone, email,
     is_available, is_published)

8. lib/validators/announcements.ts
   - announcementInputSchema (title, type enum, body,
     cover_image, event_date, event_location,
     is_pinned, is_published)

9. lib/validators/contact.ts
   - contactInputSchema (all contact fields,
     working_hours as array of {day, hours} objects,
     map_lat/lng as numbers, social URLs optional)

10. lib/validators/media.ts
    - mediaFilterSchema (type, search, sort, pagination)
    - altTextSchema (string, min 1, max 300)

11. lib/server-fn.ts  (server function wrapper)
    - withAuth(roles, handler) — wraps server function
      with role check, injects session into handler
    - withValidation(schema, handler) — wraps with Zod
      parse, throws VALIDATION_ERROR on failure
    - withAudit(params, handler) — wraps with logAction
      fire-and-forget after handler resolves
    - Composable: withAuth(['editor'], withValidation(
        schema, async (input, session) => { ... }))

12. lib/settings.ts  (public settings cache)
    - Cached getBookingEnabled() — 60s TTL
    - Cached getMaintenanceMode() — 60s TTL
    - Used by middleware and booking page
    - Cache invalidated on upsertSettings()

CONSTRAINTS:
- AppError must serialize to JSON cleanly for TanStack
  Start error boundary consumption
- Zod schemas must export both the schema and its
  inferred TypeScript type (z.infer<typeof schema>)
- lib/server-fn.ts wrappers must preserve TypeScript
  inference — input and output types must flow through
- lib/types.ts must never import from server functions —
  types only, no runtime dependencies
- All validator files must be importable in both server
  and client contexts (no Node-only APIs)
- withAudit wrapper must catch and swallow its own errors —
  never let audit failure surface to user

OUTPUT: All files with full working code, no placeholders.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI PROMPT — Phase 8: Frontend Architecture
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Visit Harar — Government Tourism Website + CMS
STACK: TanStack Start, Node.js, PostgreSQL, Drizzle ORM,
       Better Auth, Cloudinary, Tailwind CSS, TanStack Query,
       React Hook Form, Zod, @dnd-kit/sortable,
       Tiptap, Resend

MASTER CONTEXT:
- 14 DB tables, 6 modules, 47 chunks, full API contracts
- Design system: brand green #2D6A3F, accent gold #C8A96A
- Fonts: Playfair Display (headings), Outfit (body/UI)
- Admin: fixed sidebar 240px, topbar, content area
- Public: sticky navbar, footer, max-w-7xl content
- State: TanStack Query (server), RHF (forms),
         useState (UI), Context (session/toast/settings)

YOUR TASK — Produce the frontend foundation files:

1. tailwind.config.ts
   - Custom colors: brand-* (green scale),
     gold-* (accent scale), extend stone for neutrals
   - Custom fonts: serif (Playfair Display),
     sans (Outfit)
   - No other changes to Tailwind defaults

2. app/globals.css
   - Import Playfair Display + Outfit from Google Fonts
   - CSS custom properties for all design tokens
   - Base body styles: font-sans, text-stone-900,
     bg-white
   - Prose styles for Tiptap HTML output rendering
     (public pages only)

3. app/admin/layout.tsx  (admin shell)
   - Renders AdminSidebar + AdminTopbar + <Outlet>
   - Wraps with SessionContext provider
   - Wraps with ToastContext provider
   - requireAuth check at layout level (superadmin
     and editor both access this layout)
   - Pending bookings count fetched here, passed
     to sidebar via context

4. components/admin/AdminSidebar.tsx
   - Fixed left sidebar, w-60
   - Logo + "Visit Harar CMS" header
   - Nav sections: CONTENT, BOOKINGS, MEDIA, SYSTEM
   - SYSTEM section: hidden from editor role
   - Bookings nav item: pending count badge (amber)
   - Active route highlight: brand-500 bg, white text
   - Bottom: user name, role badge, logout button
   - Responsive: collapses to w-16 icon-only on tablet

5. components/admin/AdminTopbar.tsx
   - Dynamic page title from route
   - Breadcrumb navigation
   - Context-aware primary action button
     (e.g. on /admin/attractions → "New Attraction")
   - Mobile: hamburger to open sidebar drawer

6. components/ui/Button.tsx
   - Variants: primary | secondary | ghost | danger
   - Sizes: sm | md | lg
   - States: loading (spinner), disabled
   - Fully typed props

7. components/ui/Input.tsx
   - Label, input, error message, helper text
   - Variants: default | error
   - Forwarded ref for React Hook Form

8. components/ui/Modal.tsx
   - Portal-based modal
   - Props: isOpen, onClose, title, children, size?
   - Backdrop click closes (optional)
   - Escape key closes
   - Focus trap when open
   - Used by ConfirmDialog and MediaPicker

9. components/ui/Toggle.tsx
   - Accessible switch input
   - Props: checked, onChange, disabled, label
   - Shows loading state during async toggle

10. components/ui/Table.tsx
    - Props: columns[], rows[], onRowClick?
    - Empty state slot
    - Loading skeleton state
    - Responsive: horizontal scroll on mobile

11. components/admin/ConfirmDialog.tsx
    - Built on Modal
    - Props: isOpen, onConfirm, onCancel,
             title, message, confirmLabel?,
             variant? (danger | default)
    - Danger variant: red confirm button

12. components/admin/SortableList.tsx
    - Wraps @dnd-kit/sortable
    - Props: items[], renderItem(), onReorder()
    - Drag handle icon on each item
    - Calls onReorder with new ordered IDs on drop
    - Works for both list and grid layouts

13. lib/contexts/SessionContext.tsx
    - Provides: { user, role, isLoading, logout }
    - Source: Better Auth useSession()
    - Consumed by: useSession() hook

14. lib/contexts/ToastContext.tsx
    - Provides: { toast(options), dismiss(id) }
    - Renders: toast stack bottom-right
    - Auto-dismiss: 4 seconds
    - Variants: success | error | warning | info

15. hooks/useSession.ts
    - Consumes SessionContext
    - Returns: { user, role, isLoading, logout }
    - Throws if used outside SessionContext

16. hooks/useToast.ts
    - Consumes ToastContext
    - Returns: { toast, dismiss }

17. hooks/useConfirm.ts
    - Returns: confirm(message, options) → Promise<bool>
    - Imperatively shows ConfirmDialog
    - Resolves true on confirm, false on cancel

18. hooks/usePageEditor.ts
    - Props: pageKey ('about'|'culture'|'plan')
    - Returns: { content, isDirty, isSaving,
                 isPublishing, handleChange,
                 saveDraft, publish }
    - Tracks dirty state via deep equality check
    - Shows toast on success/error
    - Warns before leaving if isDirty

19. hooks/useMediaUpload.ts
    - Returns: { upload(file), progress, isUploading,
                 error, reset }
    - Tracks upload progress 0–100 per file
    - Calls uploadMediaAsset server function
    - Returns completed MediaAsset on resolve

CONSTRAINTS:
- components/ui/* must have zero dependency on
  server functions or TanStack Query — pure UI only
- All admin components must use design tokens —
  never hardcode hex colors, always use Tailwind classes
- Modal must implement focus trap (accessibility —
  government site requirement)
- AdminSidebar SYSTEM section visibility must be
  controlled by role check — never just hidden with CSS
  (must not render at all for editor role)
- Toggle component must show loading spinner and be
  disabled during async operation — never allow
  double-clicks to fire two DB updates
- All forms must use React Hook Form + Zod resolver —
  no uncontrolled forms, no manual validation logic
- useBeforeUnload must be implemented in usePageEditor
  and all create/edit forms to prevent data loss
- SortableList must call onReorder only on drag END,
  not on every drag move — prevents excessive DB calls

OUTPUT: All files with full working code, no placeholders.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI PROMPT — Phase 9: Development Workflow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Visit Harar — Government Tourism Website + CMS
STACK: TanStack Start, Node.js, PostgreSQL, Drizzle ORM,
       Better Auth, Cloudinary, Tailwind CSS, TanStack Query

MASTER CONTEXT:
- Full project spec across 8 phases complete
- 47 build chunks ordered and ready to execute
- Local development environment (not deployed yet)
- Node.js v20, PostgreSQL v16, VS Code

YOUR TASK — Produce the project configuration files:

1. package.json
   - All dependencies with exact versions:
     Core: @tanstack/start, react, react-dom
     DB: drizzle-orm, drizzle-kit, postgres
     Auth: better-auth
     Validation: zod, @hookform/resolvers
     Forms: react-hook-form
     UI: @dnd-kit/core, @dnd-kit/sortable,
         @tiptap/react, @tiptap/starter-kit,
         yet-another-react-lightbox
     Media: cloudinary
     Email: resend
     Utils: bcryptjs, isomorphic-dompurify, tsx
   - Dev dependencies:
     typescript, @types/react, @types/node,
     @types/bcryptjs, eslint, prettier,
     eslint-config-prettier, tailwindcss,
     autoprefixer, postcss
   - All scripts as defined in spec

2. tsconfig.json
   - Strict mode enabled
   - Path aliases:
     @/* → ./app/*
     ~/* → ./*
   - Target: ES2022
   - Module: ESNext
   - JSX: react-jsx

3. .eslintrc.json
   - Extends: eslint:recommended,
              @typescript-eslint/recommended
   - Rules:
     no-unused-vars: error
     no-console: warn (allow console.error)
     @typescript-eslint/no-explicit-any: error

4. .prettierrc
   - semi: false
   - singleQuote: true
   - tabWidth: 2
   - trailingComma: es5
   - printWidth: 80

5. .gitignore
   - node_modules, .env, .next, dist, .vinxi
   - drizzle/migrations (generated — do not commit)
   - *.local, .DS_Store

6. .env.example
   - All variables from spec with placeholder values
   - Comments explaining where to get each value

7. drizzle.config.ts
   - schema: ./drizzle/schema/index.ts
   - out: ./drizzle/migrations
   - dialect: postgresql
   - dbCredentials: { url: process.env.DATABASE_URL }

8. scripts/reset-db.ts
   - Guards: throws if NODE_ENV !== 'development'
   - Drops all tables in correct order (FK awareness)
   - Re-runs migrations
   - Re-runs all seeds
   - Logs each step

9. scripts/run-all-seeds.ts
   - Runs seed-superadmin → seed-pages → seed-settings
   - Logs success/failure per step
   - npm run db:seed executes this

10. SETUP.md  (developer onboarding doc)
    - Prerequisites list with version requirements
    - From-zero setup steps 1–9 (exact commands)
    - Environment variable guide
    - Common errors + fixes:
      · "relation does not exist" → run migrations
      · "Invalid credentials" → re-run seed
      · "Cloudinary upload failed" → check API keys
      · Port 3000 in use → kill process or change port
    - Daily dev routine
    - Chunk execution workflow

CONSTRAINTS:
- package.json must use exact versions (no ^ or ~)
  for production dependencies to ensure reproducibility
- tsconfig path aliases must work with TanStack Start
  file-based routing
- .gitignore must include drizzle/migrations —
  generated files should not be committed
- reset-db.ts NODE_ENV guard is non-negotiable —
  document it clearly in the file with a comment
- SETUP.md must be written for a developer who has
  never seen this project — assume nothing

OUTPUT: All files with full working code, no placeholders.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 LOVABLE.DEV PROMPT
Build: Visit Harar CMS — Full UI Shell
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Build a complete, production-quality React web application
UI shell for "Visit Harar" — the official government tourism
website and CMS for Harar, Ethiopia (UNESCO World Heritage City).

No backend logic. No API calls. No authentication logic.
Use realistic placeholder data everywhere.
Every screen must be fully designed, pixel-perfect, and
ready for a developer to wire up with real data.

════════════════════════════════
DESIGN SYSTEM
════════════════════════════════

Fonts:
  Headings:  Playfair Display (serif) — import from Google Fonts
  Body + UI: Outfit (sans-serif) — import from Google Fonts

Colors:
  Primary:   #2D6A3F  (brand green — Islamic heritage, nature)
  Primary dark: #1a3a24
  Accent:    #C8A96A  (gold — Harari architecture)
  Accent dark: #a8893a
  Background: #ffffff
  Surface:   #f8f8f6
  Border:    #e8e4dc
  Text:      #1a1a18
  Text muted:#6b6860

Status colors:
  Pending:   #f59e0b (amber)
  Confirmed: #16a34a (green)
  Declined:  #dc2626 (red)
  Cancelled: #9ca3af (gray)

Border radius: 8px cards, 6px buttons, 4px inputs
Shadows: subtle — box-shadow: 0 1px 3px rgba(0,0,0,0.08)

════════════════════════════════
SECTION 1 — PUBLIC WEBSITE
════════════════════════════════

Build all public pages as a single-page app with
smooth scroll or tab navigation between sections.
Use stunning, realistic placeholder content about Harar.

── PAGE 1: Homepage ────────────────────────────────────

NAVBAR (sticky):
  Left:  Green circle logo "H" + "Visit Harar" bold +
         "Harari Regional Tourism Bureau" small subtitle
  Center: Home | Attractions | Guides | Gallery |
          Culture | Plan Your Trip | News | Contact
  Right: "Book a Guide" button (gold #C8A96A, dark text)
  Behavior: transparent over hero, solid white on scroll
  Mobile: hamburger → full screen overlay menu

HERO SECTION:
  Full viewport height
  Background: deep green-to-brown gradient with
              Islamic geometric pattern overlay (CSS only)
  Top badge: "🌍 UNESCO World Heritage Site · Est. 2006"
             (pill, semi-transparent white border)
  Headline: "Discover" (white) + "Harar," (line break)
            "City of Saints" (white) — Playfair Display 56px
  Italic accent word "Harar" in gold color
  Subtext: "Africa's fourth holiest city in Islam — a living
            medieval walled city of ancient mosques, vibrant
            markets, and the legendary hyena men, nestled in
            the highlands of eastern Ethiopia."
            (white, 16px, max-width 560px)
  Two buttons:
    "Plan Your Visit" — gold background, dark text
    "Watch the City →" — ghost, white border
  Bottom stats bar (3 columns, inside hero):
    82 Mosques | 102 Shrines | 1,000+ Years of History
    Numbers in gold, labels in white/60

FEATURED ATTRACTIONS (6 cards, 3-column grid):
  Section header: "Top Attractions" + subtitle
  Cards with:
    · Gradient colored image placeholder (each different color)
    · Small category label (bottom-left of image)
    · Title, short description (2 lines)
    · Category badge (colored pill: Heritage=green,
      Wildlife=amber, Spiritual=purple, Culture=blue,
      Shopping=emerald, History=red)
  Attractions to show:
    1. Harar Jugol Walled City (Heritage) — dark green gradient
    2. The Hyena Men of Harar (Wildlife) — amber gradient
    3. Mosques & Sacred Shrines (Spiritual) — purple gradient
    4. Harar Coffee Ceremony (Culture) — blue gradient
    5. Vibrant Markets & Bazaars (Shopping) — emerald gradient
    6. Harar Museum (History) — red gradient

ANNOUNCEMENTS WIDGET (3 cards):
  Section header: "Latest News & Events"
  First card: pinned badge (📌), gold left border
  Cards: type badge (News/Event/Notice), title,
         date (May 2026), 2-line excerpt
  Sample content:
    · [PINNED EVENT] "Eid al-Fitr Celebrations 2026 —
      Join the traditional Harari celebrations"
    · [NEWS] "New Licensed Guides Program Launched"
    · [NOTICE] "Jugol Wall Restoration Project Update"

FEATURED GUIDES (3 cards, horizontal):
  Section header: "Licensed Local Guides"
  Each card:
    · Circular avatar placeholder (initials, colored bg)
    · Name, experience badge (e.g. "8 years")
    · Language badges: English, Arabic, Harari, Amharic
    · Specialty tags: History, Hyena Tour, Coffee Culture
    · Availability dot (green = Available)
    · "Book This Guide" button (outline brand green)
  Sample guides:
    · Ahmed Yusuf — 8 years — English, Arabic, Harari
    · Fatima Hassan — 12 years — English, Amharic, Harari
    · Ibrahim Ali — 5 years — English, Arabic

GALLERY TEASER (8 photos, masonry-style grid):
  Section header: "Gallery"
  Colored rectangle placeholders with caption overlay
  Hover effect: slight scale + caption slides up
  "View Full Gallery →" link at bottom center

ABOUT HARAR TEASER:
  Two-column: left text, right decorative
  Headline: "The Walled City of Saints"
  Body: short paragraph about Harar's history
  Quick facts strip (4 items):
    📍 1,885m elevation  |  🕌 1,000+ years old  |
    🌍 UNESCO 2006       |  👥 ~99,000 residents

CTA BANNER:
  Dark green background (#1a3a24)
  Gold headline: "Ready to Experience Harar?"
  Subtitle: white/70
  Two buttons: "Plan Your Visit" (gold) + "Browse Guides"

FOOTER:
  4 columns: Explore | Plan | Learn | Connect
  Bureau address: "Harari Regional Tourism Bureau,
                   Harar Jugol, Harari Regional State, Ethiopia"
  Phone: +251 25 666 0000
  Email: info@visitharar.gov.et
  Social icons (Facebook, Twitter, Instagram)
  Bottom bar: copyright + "Official Government Website" badge

── PAGE 2: Attractions ─────────────────────────────────

Full page with:
  PageHero: "Explore Harar's Attractions" + subtitle
            dark green bg with pattern
  Category filter tabs: All | Heritage | Wildlife |
                        Spiritual | Culture | Shopping | History
  6-card grid (same cards as homepage)
  Each card links to a detail view

Attraction Detail (slide-in or separate view):
  Large gradient header image
  Back button, category badge, title (Playfair 36px)
  Full description (3 paragraphs of placeholder text)
  "Book a Guide for This Attraction" CTA button

── PAGE 3: Guides Directory ────────────────────────────

PageHero: "Licensed Local Guides"
Filter row: Language dropdown | Specialty dropdown
Guide cards grid (3 columns):
  Photo circle, name, years experience,
  language badges, specialty badges,
  availability status, "Book This Guide" button

Guide Detail view:
  Large header with guide photo circle (120px)
  Name (Playfair 32px), license badge "Licensed #HRR-001"
  Bio paragraph
  Info grid: Languages | Specialties | Experience | License
  "Book This Guide" CTA (large, gold button)

── PAGE 4: Gallery ─────────────────────────────────────

PageHero: "Photo Gallery"
Albums grid (3 columns):
  Cover image placeholder, album title, item count badge
  Albums: "Harar Jugol Walls", "Hyena Night Ritual",
          "Markets & Bazaars", "Mosques & Shrines",
          "Coffee Culture", "Festival Celebrations"
Album detail:
  Back button, album title
  Masonry grid of 12 image placeholders
  Click → lightbox (full screen, prev/next arrows,
          close button, caption at bottom)

── PAGE 5: Plan Your Trip ──────────────────────────────

PageHero: "Plan Your Visit to Harar"
Three content sections with icons:

Getting Here:
  Card with airplane icon
  "Fly to Dire Dawa (1hr from Addis) then 55km by road"
  Ethiopian Airlines logo text

Best Time to Visit:
  12-month calendar strip — Oct–May highlighted green,
  Jun–Sep greyed (rainy season)

Itineraries (3 cards):
  "2-Day Quick Visit" | "4-Day Full Experience" |
  "7-Day Deep Dive"
  Each card: duration badge, highlights list, "View Plan"

Visa Info + Accommodation sections (simple text cards)

── PAGE 6: News & Announcements ────────────────────────

PageHero: "News & Announcements"
Filter tabs: All | News | Events | Notices
Pinned post: larger card with gold left border, pin icon
List of announcement cards (10):
  Cover image area (colored), type badge, title,
  date, 2-line excerpt, "Read More" link
Detail view: full article layout

── PAGE 7: Contact ─────────────────────────────────────

PageHero: "Contact the Bureau"
Two-column layout:

Left: Contact info card
  Office name, address, phone (tap to call),
  email (tap to mail), working hours table
  Map placeholder (grey rectangle with pin icon)
  Social links

Right: Inquiry form (visual only — no submission)
  Name, Email, Subject, Message textarea
  "Send Inquiry" button (brand green)

── PAGE 8: Booking Form ────────────────────────────────

4-step form with progress indicator:

Step 1 "Select Guide":
  Searchable guide dropdown
  Selected guide preview card

Step 2 "Tour Details":
  Date picker input
  Duration radio: Half Day | Full Day | Multi Day
  Group size stepper (− 1 +)

Step 3 "Your Details":
  Name, Email, Phone, Country dropdown,
  Special Requests textarea

Step 4 "Review & Submit":
  Summary card of all details
  Terms notice
  "Confirm Booking Request" button (gold, large)

Success screen:
  Green checkmark circle
  "Booking Request Received!"
  Large booking ref: "HRR-2026-00142"
  "Check your email for confirmation"
  "Return to Home" button

════════════════════════════════
SECTION 2 — ADMIN CMS
════════════════════════════════

Build a complete, professional admin dashboard.
All data is realistic placeholder content.
Use the same design tokens as public site but
admin-specific: white sidebar, light grey canvas.

── ADMIN LAYOUT ────────────────────────────────────────

Fixed left sidebar (240px wide):
  Top: green logo circle "H" + "Visit Harar CMS"
       + "Content Management System" (tiny)

  Nav sections with labels:
    CONTENT
      🏠 Dashboard        (active state example)
      🖼  Hero
      ⛩  Attractions
      🖼  Gallery
      📄 Pages
      📢 Announcements
      👤 Guides
      📞 Contact

    BOOKINGS
      📅 Bookings         (amber badge "3" — pending count)

    MEDIA
      🗂  Media Library

    SYSTEM (slightly muted, smaller label)
      👥 Users
      📋 Audit Log
      ⚙️  Settings

  Bottom:
    User avatar circle (initials "SA")
    "Super Admin" name
    "superadmin" role badge (green pill)
    Logout button

Top bar (fixed, ml-240px):
  Page title (bold, 18px)
  Breadcrumb (muted, 13px)
  Context action button (e.g. "+ New Attraction")

── ADMIN PAGE 1: Dashboard ─────────────────────────────

4 metric cards (top row):
  📅 Bookings This Month: 24    (blue)
  ⏳ Pending Bookings: 3        (amber — needs action)
  ⛩  Published Attractions: 6  (green)
  👤 Active Guides: 3           (purple)

Quick actions row:
  "+ New Attraction" | "+ New Guide" |
  "+ Announcement" | "View Bookings"
  (outline buttons, icon + label)

Recent Activity feed (last 8 entries):
  Each row: colored module dot, action description,
            user name, time ago
  Examples:
    🟢 Ahmed published "Hyena Men" attraction · 2h ago
    🔵 Fatima updated Gallery album · 5h ago
    🟡 New booking HRR-2026-00142 received · 1d ago

System Status panel (right column):
  Database: ✅ Connected
  Cloudinary: ✅ Connected
  Email Service: ✅ Connected
  Maintenance Mode: Toggle OFF (green)

── ADMIN PAGE 2: Hero Manager ──────────────────────────

Two-column layout (60/40 split):

Left — Edit form:
  Section label "HERO CONTENT" (uppercase, muted)
  Fields:
    Badge Text input (value: "UNESCO World Heritage Site")
    Headline input (value: "Discover Harar")
    Italic Accent input (value: "City of Saints")
    Subheading textarea (3 lines)
    CTA Primary Text + URL (side by side)
    CTA Ghost Text + URL (side by side)
    Background Image: MediaPicker button
                      (shows current image URL, change button)
  Section label "STATS"
    3 rows: Number input | Label input (side by side)
    Values: 82/Mosques, 102/Shrines, 1000+/Years
  Section label "VISIBILITY"
    Toggle: "Published" (green, ON state)

  Bottom action bar (sticky):
    "Save Draft" (ghost) + "Publish" (brand green)
    "Last updated by Super Admin · 2 hours ago" (muted)

Right — Live Preview:
  Label: "LIVE PREVIEW" (uppercase badge)
  Scaled-down (CSS transform) render of the actual
  hero section exactly as it appears publicly
  Gold dashed border around preview area
  "This is how it looks on the public site" caption

── ADMIN PAGE 3: Attractions List ──────────────────────

Top bar: "Attractions" title + "+ New Attraction" button

Table with these columns:
  □ (checkbox) | Image | Title | Category | Featured |
  Published | Sort | Edit | Delete

6 rows of realistic data:
  · Harar Jugol — Heritage — ★ featured — ✅ published
  · Hyena Men — Wildlife — ★ featured — ✅ published
  · Mosques & Shrines — Spiritual — — ✅ published
  · Coffee Ceremony — Culture — — ✅ published
  · Vibrant Markets — Shopping — — 🔵 draft
  · Harar Museum — History — — ✅ published

Each row:
  Colored gradient thumbnail (40x40, rounded)
  Category badge (colored pill)
  Featured: star toggle (filled=yes, empty=no)
  Published: green toggle switch
  Sort: drag handle icon (⠿)
  Edit: pencil icon button
  Delete: trash icon button (red on hover)

── ADMIN PAGE 4: Attraction Create/Edit Form ───────────

Full form layout:
  Two columns: main fields (left 65%) + sidebar (right 35%)

  Left column:
    Title input (large, 20px)
    Slug input (auto-generated, editable, monospace font)
    Short Description textarea (with char counter /160)
    Full Description: Tiptap-style rich text editor
      (toolbar: B I U | H1 H2 | • — | Link)
      (realistic 3-paragraph placeholder content)

  Right sidebar:
    "MEDIA" section:
      Image placeholder (200x150, dashed border)
      "Choose from Media Library" button
      "or drag and drop here" caption

    "CATEGORY" section:
      Dropdown select (Heritage selected)

    "VISIBILITY" section:
      Featured toggle + label
      Published toggle + label

    "SEO PREVIEW" section:
      Mini browser chrome showing title + description

  Sticky bottom bar:
    "← Back" | "Save Draft" | "Publish" (green)

── ADMIN PAGE 5: Gallery Manager ───────────────────────

Albums grid view:
  6 album cards (3 columns):
    Color placeholder cover, title, "12 photos" badge
    Published toggle, Edit button, Delete button

Album detail view (click album):
  Back button, album title, "Upload Photos" button

  Upload dropzone (top, full width):
    Dashed border, cloud icon
    "Drag photos here or click to browse"
    "JPG, PNG, WebP up to 10MB each"

  Media grid (4 columns, 12 items):
    Each item: colored placeholder, hover shows:
      · Caption input (inline)
      · Published toggle
      · Delete button
      · "Set as Cover" button
    Drag handle for reorder

── ADMIN PAGE 6: Bookings List ─────────────────────────

Filter row: Status tabs (All | Pending 3 | Confirmed |
            Declined | Cancelled) + Guide dropdown +
            Date range inputs

Table columns:
  Ref | Guide | Visitor | Country | Date |
  Duration | Group | Status | Submitted | →

10 realistic rows:
  HRR-2026-00142 | Ahmed Yusuf | John Smith | USA |
  Jun 15 | Full Day | 2 | 🟡 Pending | May 28

  HRR-2026-00141 | Fatima Hassan | Marie Dubois | France |
  Jun 10 | Half Day | 1 | 🟢 Confirmed | May 27

  (+ 8 more realistic rows with mixed statuses)

Status badges: colored pills matching status colors

── ADMIN PAGE 7: Booking Detail ────────────────────────

Full detail layout:
  Breadcrumb: Bookings → HRR-2026-00142
  Status badge (large, Pending — amber)

  Two columns:
    Left: Guide card
      Photo circle, name, license badge
      Phone + email clickable links

    Right: Visitor details
      Name, email, phone, country, flag emoji
      Submitted date + time ago

  Full-width: Tour Details card
    Date | Duration | Group Size | Special Requests
    (grid of 4 info boxes)

  Action panel (Pending state):
    Green "✓ Confirm Booking" button (large)
    Red "✗ Decline Booking" button (outline)
    Each opens a modal with optional/required note textarea

  Confirm modal:
    "Confirm this booking?" title
    Optional note textarea
    "Confirm" green button + "Cancel" ghost

  Decline modal:
    "Decline this booking?" title
    Required note textarea (with red asterisk)
    "Decline" red button + "Cancel" ghost

── ADMIN PAGE 8: Pages Manager ─────────────────────────

Simple list: 3 rows
  About Harar | Last updated May 28 | ✅ Published | Edit
  Culture & Festivals | May 20 | ✅ Published | Edit
  Plan Your Trip | May 15 | 🔵 Draft | Edit

About Editor page:
  Hero image picker
  Tiptap editor sections: Intro | UNESCO | Geography
  Quick Facts builder:
    + Add Fact button
    Rows: [Elevation] [1,885m above sea level] [🗑]
           [Founded] [7th century AD] [🗑]
           [Religion] [Predominantly Muslim] [🗑]
  Save Draft + Publish buttons

── ADMIN PAGE 9: Announcements ─────────────────────────

List with filter tabs: All | News | Events | Notices

Table with pin column:
  📌 | Cover | Title | Type | Event Date | Published | Edit

Create form:
  Title input
  Type selector: News | Event | Notice
                 (Event shows date + location fields)
  Tiptap body editor
  Cover image picker
  Pinned toggle (with warning: "Only one can be pinned")
  Published toggle
  Save + Publish buttons

── ADMIN PAGE 10: Guide Manager ────────────────────────

List: table with photo, name, languages, specialties,
      available toggle, published toggle, edit, delete

Create/Edit form:
  Two columns:
    Left: Photo upload circle (120px, dashed)
          Name input → slug preview
          Bio Tiptap editor
          Experience Years number input
          License Number input
          Phone + Email inputs

    Right: Languages tag input
             (pills: English × Arabic × Harari ×)
             Type and press Enter to add
           Specialties tag input (same)
           Available toggle
           Published toggle

── ADMIN PAGE 11: Contact Manager ──────────────────────

Single form:
  Office Name input
  Address Line 1 + Line 2 inputs
  Phone Primary + Secondary (side by side)
  Email General + Bookings (side by side)

  Working Hours builder:
    Mon–Fri | 8:00 AM – 5:00 PM | 🗑
    Saturday | 9:00 AM – 1:00 PM | 🗑
    Sunday | Closed | 🗑
    + Add Hours button

  Map Coordinates:
    Lat input | Lng input | side by side
    Grey map placeholder rectangle (300px tall)
    "📍 Pin will appear at these coordinates" caption

  Social Links:
    Facebook | Twitter | Instagram inputs

  Save + Publish buttons

── ADMIN PAGE 12: Media Library ────────────────────────

Top: Search input + Type filter (All|Images|Videos) +
     Sort dropdown + "Upload Media" button

Asset grid (6 columns):
  Each card:
    Image placeholder (colored, ratio 1:1)
    Filename (truncated): "harar-wall-01.jpg"
    Size badge: "2.4 MB"
    Type badge: "IMAGE"
    Used in: "attractions" badge (green)
    □ checkbox (top-left for bulk select)
    On hover: Copy URL button + Delete button

  Bulk action bar (appears when selected):
    "3 items selected" | "Delete Selected" red button

  Pagination: ← 1 2 3 4 5 →

── ADMIN PAGE 13: Users Manager ────────────────────────

"+ New Editor" button (top right)

Table:
  Name | Email | Role | Status | Last Login | Created | Actions

3 rows:
  Super Admin | admin@visitharar.gov.et |
  superadmin (green) | Active (green) | Today | Jan 2026 |
  (greyed — cannot edit self)

  Tigist Bekele | tigist@visitharar.gov.et |
  editor (blue) | Active (green) | Yesterday | Mar 2026 |
  Edit | Deactivate | Reset Password

  Abdi Noor | abdi@visitharar.gov.et |
  editor (blue) | Inactive (red) | May 2026 | Apr 2026 |
  Edit | Activate | Reset Password

Create Editor modal:
  Name | Email | Temporary Password inputs
  "Create Account & Send Welcome Email" button

── ADMIN PAGE 14: Audit Log ────────────────────────────

Filter row: User dropdown | Module dropdown |
            Date From | Date To

Table (10 rows):
  Timestamp | User | Module | Action | Record | Diff

  May 28 14:32 | Super Admin | hero | published |
  "Homepage Hero" | [View Diff]

  May 28 12:15 | Tigist Bekele | attractions | updated |
  "Harar Jugol" | [View Diff]

  (+ 8 more realistic rows)

Diff modal (click View Diff):
  Side-by-side panel: BEFORE (red bg) | AFTER (green bg)
  Shows JSON-formatted field changes

── ADMIN PAGE 15: Settings ─────────────────────────────

"GENERAL" section:
  Site Name input: "Visit Harar"
  Site Tagline input: "Official Tourism Website of..."
  Default OG Image: MediaPicker

"SYSTEM" section:
  Maintenance Mode toggle (OFF)
  Warning box: "⚠️ Turning this on will show a
  maintenance page to all public visitors"

  Booking System toggle (ON)
  Warning box: "Turning this off disables the
  booking form on the public site"

  Bureau Email input
  Google Analytics ID input

"Save Settings" button (green, bottom)
Last updated info

── ADMIN: LOGIN PAGE ───────────────────────────────────

Centered card (400px wide) on dark green bg:
  Logo circle + "Visit Harar" + "CMS Login"
  "Official Bureau Staff Access Only" (muted caption)
  Email input
  Password input (with show/hide toggle)
  "Sign In" button (full width, brand green)
  "Forgot password?" link

════════════════════════════════
TECHNICAL REQUIREMENTS
════════════════════════════════

Framework: React with TypeScript
Styling: Tailwind CSS only (no other CSS frameworks)
Icons: Lucide React (already in Lovable)
Fonts: Google Fonts (Playfair Display + Outfit)
Routing: React Router (tabs/sections for navigation)

Navigation between all pages must work via:
  · Public navbar links
  · Admin sidebar links
  · All buttons that say "View", "Edit", "Details"
  · Back buttons
  · Breadcrumb links

State:
  · All forms are controlled (useState)
  · Toggles flip state on click
  · Modals open/close on button click
  · Multi-step booking form tracks current step
  · Filter tabs update displayed content
  · No external state library needed

DO NOT:
  · Make any API calls
  · Implement any authentication logic
  · Use any placeholder image services (no picsum,
    no unsplash) — use CSS gradients only
  · Add any backend code
  · Use any component libraries (shadcn, MUI, etc.)
    Build everything from scratch with Tailwind

DO:
  · Make every screen complete and realistic
  · Use real Harar content in all placeholder text
  · Make all interactive elements feel responsive
    (hover states, focus rings, transitions)
  · Ensure mobile responsiveness on all public pages
  · Make the admin feel professional and trustworthy
  · Add micro-interactions (button hover, card hover,
    toggle animation, modal fade-in)