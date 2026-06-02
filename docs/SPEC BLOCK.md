━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 SPEC BLOCK — Phase 1: Idea Investigation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT VISION
==============
Project Name:    Visit Harar
Type:            Government Tourism Website with Full CMS
Core Problem:    Harar has no official digital presence for tourism.
                 Tourists rely on third-party blogs for information,
                 and the bureau has zero control over that narrative.
Who Suffers:     The Harari Tourism Bureau (no tool to manage content),
                 international & domestic tourists (no trustworthy source),
                 local guides & businesses (no official discovery channel)
Why Current
Solutions Fail:  Third-party travel sites are inaccurate, outdated, and
                 not owned by the government. No CMS means bureau staff
                 can't update anything without a developer.
What This
System Improves: Bureau staff can log in and change any content on the
                 site — hero, attractions, gallery, announcements — with
                 no code. The public sees a fast, credible, beautiful
                 tourism site that they trust because it's official.
Success Looks
Like:            Bureau staff update the homepage independently.
                 Tourists arrive informed. The site is ready to hand
                 to the government as a finished, working product.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 SPEC BLOCK — Phase 2: System Understanding
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SYSTEM ACTORS & PERMISSIONS
============================

Actor: Super Admin (you / developer)
  Can View:   Everything — all content, all users, all bookings,
              system settings, analytics
  Can Create: Admin accounts, content editors, site settings,
              any content
  Can Update: Any content, any user role, system config
  Can Delete: Any content, any user, any booking
  Workflow:   Sets up the system, creates bureau staff accounts,
              hands over control, monitors from behind the scenes

──────────────────────────────
Actor: Bureau Content Editor (bureau staff)
  Can View:   All site content sections, all bookings/inquiries
  Can Create: Hero content, attractions, gallery items,
              announcements, events, guide profiles, pages
  Can Update: Any content they created OR any site section
              (hero text, images, cards, contact info)
  Can Delete: Content they manage (not user accounts)
  Workflow:   Logs into admin dashboard → edits homepage hero →
              adds new attraction → uploads gallery photos →
              posts announcement → views incoming bookings

──────────────────────────────
Actor: Public Visitor (tourist)
  Can View:   All public pages (home, attractions, culture,
              gallery, plan trip, contact)
  Can Create: Tour/guide booking request, contact inquiry
  Can Update: Their own booking request (before confirmation)
  Can Delete: Their own booking request (before confirmation)
  Workflow:   Lands on homepage → browses attractions →
              picks a guide → submits booking request →
              receives confirmation

──────────────────────────────
Actor: Licensed Guide (future phase — noted for later)
  Can View:   Their own bookings and profile
  Can Update: Their availability and profile info
  Note:       Can be added in v2 — not blocking v1

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 SPEC BLOCK — Phase 3: Module Decomposition
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TECH STACK
===========
Frontend:   TanStack Start (React, file-based routing, SSR)
Backend:    Node.js (Express or TanStack Start server functions)
Database:   PostgreSQL
ORM:        Drizzle ORM
Auth:       Better Auth (role-based: superadmin, editor)
Storage:    Cloudinary (images/media uploads)
Styling:    Tailwind CSS
State:      TanStack Query (server state, caching)

──────────────────────────────
MODULES (build order)
=======================

MODULE 1 — Auth & Role System
  What it does: Login, session management, role enforcement
  Actors:       Super Admin, Bureau Editor
  Key screens:  Login page, forgot password
  Priority:     FIRST — everything depends on this

MODULE 2 — CMS Core (Content Management Engine)
  What it does: The admin dashboard where editors manage
                every section of the public site
  Sub-sections:
    2a. Hero Manager      — edit headline, subtext, CTA, bg image
    2b. Attractions CRUD  — add/edit/delete attraction cards
    2c. Gallery Manager   — upload, reorder, delete photos/videos
    2d. Pages Manager     — edit About, Culture, Plan Your Trip
    2e. Announcements     — post/edit/delete news & events
    2f. Guide Profiles    — add/edit/delete licensed guide cards
    2g. Contact Info      — edit bureau address, phone, email, map
  Actors:       Bureau Editor, Super Admin
  Priority:     SECOND — core value of the system

MODULE 3 — Public Website (what tourists see)
  What it does: The fully public-facing tourism site, rendered
                from CMS content in real time
  Pages:
    - Home (hero, highlights, stats, attractions preview)
    - Attractions (all cards, detail pages)
    - Culture & Festivals
    - Gallery
    - Plan Your Trip (itineraries, getting here, guides)
    - About Harar
    - News & Announcements
    - Contact
  Actors:       Public Visitor
  Priority:     THIRD — built in parallel with Module 2

MODULE 4 — Booking System
  What it does: Visitors submit guide/tour booking requests.
                Bureau editor views and manages them in dashboard.
  Key flows:
    - Visitor picks guide → fills form → submits request
    - Editor sees booking in dashboard → confirms or declines
    - Visitor gets email confirmation (basic, no payment v1)
  Actors:       Public Visitor, Bureau Editor
  Priority:     FOURTH — after public site is stable

MODULE 5 — Media Manager
  What it does: Centralized image/video upload via Cloudinary.
                Used inside every CMS module.
  Actors:       Bureau Editor, Super Admin
  Priority:     Built inside Module 2, extracted if complex

MODULE 6 — Super Admin Panel
  What it does: Manage editor accounts, view system health,
                reset passwords, audit content changes
  Actors:       Super Admin only
  Priority:     LAST — deliver to bureau, then lock it down

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 SPEC BLOCK — Phase 4: Module 1 — Auth & Role System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MODULE 1 — AUTH & ROLE SYSTEM
==============================
Stack:      Better Auth, Drizzle ORM, PostgreSQL
Protected:  All /admin/* routes require valid session + role check

SCREENS
───────
1. /admin/login
   - Fields: email, password
   - Actions: submit → session created → redirect to /admin/dashboard
   - Errors: invalid credentials, account disabled
   - No self-registration (accounts created by super admin only)

2. /admin/forgot-password
   - Fields: email
   - Action: sends reset link to email
   - Reset link expires in 1 hour

3. /admin/reset-password
   - Fields: new password, confirm password
   - Validates token from email link

ROLES & ROUTE PROTECTION
─────────────────────────
Role: superadmin
  Access: /admin/* (everything)

Role: editor
  Access: /admin/dashboard
          /admin/hero
          /admin/attractions
          /admin/gallery
          /admin/pages
          /admin/announcements
          /admin/guides
          /admin/contact
          /admin/bookings
  Blocked: /admin/users
           /admin/settings
           /admin/audit

RULES
──────
- Public routes (/*, /attractions, /gallery etc.) require NO auth
- Admin routes redirect to /admin/login if no valid session
- Wrong role redirects to /admin/dashboard with "access denied"
- Sessions expire after 8 hours of inactivity
- Passwords hashed with bcrypt (min 10 rounds)
- Super admin account seeded on first deploy (env variables)

DATABASE TABLES (Drizzle)
──────────────────────────
users
  id          uuid primary key
  email       text unique not null
  password    text not null (hashed)
  role        enum('superadmin', 'editor') not null
  is_active   boolean default true
  created_at  timestamp default now()
  updated_at  timestamp default now()

sessions
  id          uuid primary key
  user_id     uuid references users(id)
  expires_at  timestamp not null
  created_at  timestamp default now()

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
📄 SPEC BLOCK — Phase 4: Module 2b — Attractions CRUD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MODULE 2b — ATTRACTIONS CRUD
=============================
Purpose:  Bureau editor manages all attraction cards shown
          on the public site — add, edit, reorder, delete,
          show/hide — with no code.

ATTRACTION FIELDS
──────────────────
- id              uuid primary key
- title           text        e.g. "Harar Jugol Walled City"
- slug            text unique  e.g. "harar-jugol-walled-city"
- short_desc      text        shown on card (max 160 chars)
- full_desc       text        shown on detail page (rich text)
- image           text        Cloudinary URL
- category        enum        Heritage | Wildlife | Spiritual |
                              Culture | Shopping | History
- is_featured     boolean     shows on homepage highlights
- is_published    boolean     visible on public site
- sort_order      integer     controls display order
- created_by      uuid        references users(id)
- updated_by      uuid        references users(id)
- created_at      timestamp
- updated_at      timestamp

ADMIN SCREENS
──────────────
1. /admin/attractions  (list view)
   - Table of all attractions with columns:
     image thumb | title | category | featured | published |
     sort order | actions (edit, delete)
   - Drag-and-drop reorder (updates sort_order)
   - "New Attraction" button → opens create form
   - Toggle published/unpublished inline (no page reload)
   - Toggle featured inline
   - Confirm dialog before delete

2. /admin/attractions/new  (create form)
   - All fields above as inputs
   - Slug auto-generated from title (editable)
   - Rich text editor for full_desc (basic: bold, italic,
     lists, headings — no need for complex formatting)
   - Image upload via Cloudinary
   - Category dropdown
   - is_featured toggle
   - is_published toggle
   - "Save Draft" and "Publish" buttons

3. /admin/attractions/[id]/edit  (edit form)
   - Same as create form, pre-filled
   - Shows created_at, updated_at, last updated by

PUBLIC SCREENS
───────────────
1. /attractions  (grid of all published attractions)
   - Renders cards sorted by sort_order
   - Filters by category (tab bar)
   - Only shows is_published = true

2. /attractions/[slug]  (detail page)
   - Full attraction detail: title, full_desc, image,
     category tag, back button
   - Links to booking a guide for this attraction

DATABASE TABLE (Drizzle)
─────────────────────────
attractions
  id            uuid primary key
  title         text not null
  slug          text unique not null
  short_desc    text
  full_desc     text
  image         text (Cloudinary URL)
  category      text (enum values enforced in app)
  is_featured   boolean default false
  is_published  boolean default false
  sort_order    integer default 0
  created_by    uuid references users(id)
  updated_by    uuid references users(id)
  created_at    timestamp default now()
  updated_at    timestamp default now()
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 SPEC BLOCK — Phase 4: Module 2c — Gallery Manager
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MODULE 2c — GALLERY MANAGER
============================
Purpose:  Bureau editor uploads photos and videos, organizes
          them into albums, reorders, and controls visibility.
          Public visitors browse a visual gallery of Harar.

ALBUM FIELDS
─────────────
- id            uuid primary key
- title         text        e.g. "Harar Jugol Walls"
- description   text        short caption for the album
- cover_image   text        Cloudinary URL (auto = first item)
- is_published  boolean     controls public visibility
- sort_order    integer     controls album display order
- created_by    uuid        references users(id)
- updated_at    timestamp

MEDIA ITEM FIELDS
──────────────────
- id            uuid primary key
- album_id      uuid        references albums(id)
- type          enum        photo | video
- url           text        Cloudinary URL
- thumbnail_url text        Cloudinary auto-generated thumb
- caption       text        optional label shown in gallery
- alt_text      text        accessibility description
- is_published  boolean     controls item visibility
- sort_order    integer     within album
- uploaded_by   uuid        references users(id)
- created_at    timestamp

ADMIN SCREENS
──────────────
1. /admin/gallery  (albums list)
   - Grid of album cards: cover image, title, item count,
     published toggle, edit, delete
   - Drag-and-drop reorder albums
   - "New Album" button → create album modal (title + desc)
   - Delete album confirms → deletes all items + Cloudinary

2. /admin/gallery/[albumId]  (album detail — media manager)
   - Grid of all media items in this album
   - Multi-file upload (drag files in OR click to browse)
   - Upload progress bar per file
   - Each item shows: thumbnail, caption input inline,
     alt_text input inline, published toggle, delete button
   - Drag-and-drop reorder items within album
   - Set album cover image (click any item → "Set as cover")
   - Bulk actions: publish all, unpublish all, delete selected

PUBLIC SCREENS
───────────────
1. /gallery  (albums grid)
   - Grid of published albums sorted by sort_order
   - Each card: cover image, title, item count badge
   - Click → opens album detail

2. /gallery/[albumId]  (album lightbox)
   - Masonry or uniform grid of published media items
   - Click any item → opens full-screen lightbox
   - Lightbox: prev/next navigation, caption, close button
   - Videos play inline in lightbox

DATABASE TABLES (Drizzle)
──────────────────────────
gallery_albums
  id            uuid primary key
  title         text not null
  description   text
  cover_image   text
  is_published  boolean default false
  sort_order    integer default 0
  created_by    uuid references users(id)
  updated_at    timestamp default now()

gallery_items
  id            uuid primary key
  album_id      uuid references gallery_albums(id)
              on delete cascade
  type          text ('photo' | 'video')
  url           text not null
  thumbnail_url text
  caption       text
  alt_text      text
  is_published  boolean default true
  sort_order    integer default 0
  uploaded_by   uuid references users(id)
  created_at    timestamp default now()




  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 SPEC BLOCK — Phase 4: Module 2d — Pages Manager
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MODULE 2d — PAGES MANAGER
==========================
Purpose:  Bureau editor controls the content of all static
          informational pages on the public site. Pages are
          pre-defined (not created from scratch) — the editor
          only edits their content, not their structure.

MANAGED PAGES
──────────────
1. About Harar
   - hero_image       Cloudinary URL
   - intro_text       rich text (history overview)
   - unesco_text      rich text (UNESCO significance)
   - geography_text   rich text (location, elevation, climate)
   - quick_facts      JSON array of {label, value} pairs
                      e.g. [{label: "Elevation", value: "1,885m"}]

2. Culture & Festivals
   - hero_image       Cloudinary URL
   - intro_text       rich text
   - sections         JSON array of {title, body, image} blocks
                      editor adds/removes/reorders sections freely
   - festivals        JSON array of {name, date, description}

3. Plan Your Trip
   - hero_image       Cloudinary URL
   - getting_here     rich text (flights, road directions)
   - best_time        rich text (seasons, weather)
   - itineraries      JSON array of {duration, title, days[]}
                      e.g. {duration:"2 days", title:"Quick Visit",
                            days:["Day 1: ...", "Day 2: ..."]}
   - visa_info        rich text
   - accommodation    rich text

PAGE RECORD FIELDS (one row per page)
───────────────────────────────────────
- id            uuid primary key
- page_key      text unique   ('about' | 'culture' | 'plan')
- title         text          page display title
- hero_image    text          Cloudinary URL
- content       jsonb         all page-specific fields above
- is_published  boolean       draft vs live
- updated_by    uuid          references users(id)
- updated_at    timestamp

ADMIN SCREENS
──────────────
1. /admin/pages  (pages list)
   - Simple list of 3 pages: About, Culture, Plan Your Trip
   - Each row: page name, last updated, published status,
     "Edit" button
   - No create/delete (pages are fixed — only content changes)

2. /admin/pages/[pageKey]  (page editor)
   - About editor:
     · Hero image upload
     · Intro rich text (Tiptap)
     · UNESCO rich text (Tiptap)
     · Geography rich text (Tiptap)
     · Quick facts: dynamic key-value list
       (add row, edit label+value, delete row, reorder)

   - Culture editor:
     · Hero image upload
     · Intro rich text
     · Sections builder: add section → {title, body, image}
       reorder sections drag-and-drop, delete section
     · Festivals list: add festival → {name, date, description}
       reorder, delete

   - Plan Your Trip editor:
     · Hero image upload
     · Getting Here rich text
     · Best Time rich text
     · Itineraries builder: add itinerary →
       {duration, title, days[]} where days is a list of
       text entries (add/remove/reorder days)
     · Visa Info rich text
     · Accommodation rich text

   - All editors:
     · "Save Draft" — saves without going live
     · "Publish" — makes live immediately
     · Shows last updated timestamp + editor name

PUBLIC SCREENS
───────────────
- /about            renders About Harar page from DB
- /culture          renders Culture & Festivals from DB
- /plan-your-trip   renders Plan Your Trip from DB
- All fetch where is_published = true for that page_key
- Falls back gracefully if page not yet published

DATABASE TABLE (Drizzle)
─────────────────────────
pages
  id            uuid primary key
  page_key      text unique not null
  title         text not null
  hero_image    text
  content       jsonb not null default '{}'
  is_published  boolean default false
  updated_by    uuid references users(id)
  updated_at    timestamp default now()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 SPEC BLOCK — Phase 4: Module 2e — Announcements
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MODULE 2e — ANNOUNCEMENTS
==========================
Purpose:  Bureau editor posts official news, upcoming events,
          and public notices. Visitors see a live feed of
          updates from the bureau on the public site.

ANNOUNCEMENT FIELDS
────────────────────
- id            uuid primary key
- title         text          headline of the announcement
- slug          text unique   auto-generated from title
- type          enum          News | Event | Notice
- body          text          rich text (Tiptap)
- cover_image   text          Cloudinary URL (optional)
- event_date    date          only for type = Event
- event_location text         only for type = Event
- is_pinned     boolean       pinned posts show at top always
- is_published  boolean       draft vs live
- published_at  timestamp     set when first published
- created_by    uuid          references users(id)
- updated_by    uuid          references users(id)
- created_at    timestamp
- updated_at    timestamp

ADMIN SCREENS
──────────────
1. /admin/announcements  (list view)
   - Table: pin icon | cover thumb | title | type badge |
     event_date (if Event) | published toggle | edit | delete
   - Filter by type (All | News | Event | Notice)
   - "New Announcement" button → create form
   - Pin toggle inline (only one pinned at a time)
   - Delete shows confirmation dialog

2. /admin/announcements/new  (create form)
   - Title input
   - Type selector (News | Event | Notice)
   - Body rich text (Tiptap)
   - Cover image upload (optional, Cloudinary)
   - Event date + location inputs (shown only if type = Event)
   - is_pinned toggle
   - is_published toggle
   - "Save Draft" and "Publish" buttons

3. /admin/announcements/[id]/edit  (edit form)
   - Same as create, pre-filled
   - Shows published_at if already published
   - Shows created_by, updated_by, timestamps

PUBLIC SCREENS
───────────────
1. /news  (announcements feed)
   - Pinned post at top (if exists) — visually highlighted
   - Rest sorted by published_at descending
   - Filter tabs: All | News | Events | Notices
   - Card: cover image, type badge, title, date, excerpt
   - Pagination (10 per page)

2. /news/[slug]  (announcement detail)
   - Full page: cover image, type badge, title,
     published_at date, body (rendered HTML)
   - Event type shows: event_date + event_location block
   - "Back to News" link

3. Homepage widget (used in public home page)
   - Shows 3 latest published announcements
   - Pinned post always included if exists
   - "View all news" link → /news

DATABASE TABLE (Drizzle)
─────────────────────────
announcements
  id              uuid primary key
  title           text not null
  slug            text unique not null
  type            text not null ('News'|'Event'|'Notice')
  body            text
  cover_image     text
  event_date      date
  event_location  text
  is_pinned       boolean default false
  is_published    boolean default false
  published_at    timestamp
  created_by      uuid references users(id)
  updated_by      uuid references users(id)
  created_at      timestamp default now()
  updated_at      timestamp default now()



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 SPEC BLOCK — Phase 4: Module 2f — Guide Profiles
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MODULE 2f — GUIDE PROFILES
===========================
Purpose:  Bureau manages a directory of licensed local guides.
          Visitors browse guides and initiate booking requests.

GUIDE FIELDS
─────────────
- id              uuid primary key
- name            text          full name
- slug            text unique   auto-generated from name
- photo           text          Cloudinary URL
- bio             text          rich text (Tiptap)
- languages       text[]        array e.g. ['English','Arabic']
- specialties     text[]        e.g. ['History','Hyena Tour']
- experience_years integer      years of guiding experience
- license_number  text          official bureau license ID
- phone           text          contact number
- email           text          contact email
- is_available    boolean       currently taking bookings
- is_published    boolean       visible on public site
- sort_order      integer       controls display order
- created_by      uuid          references users(id)
- updated_by      uuid          references users(id)
- created_at      timestamp
- updated_at      timestamp

ADMIN SCREENS
──────────────
1. /admin/guides  (list view)
   - Table: photo thumb | name | languages | specialties |
     available toggle | published toggle | edit | delete
   - Drag-and-drop reorder (sort_order)
   - "New Guide" button → create form
   - Delete: confirmation dialog

2. /admin/guides/new  (create form)
   - Photo upload (Cloudinary)
   - Name → slug auto-generated (editable)
   - Bio (Tiptap)
   - Languages: tag input (type + enter to add, click to remove)
   - Specialties: tag input (same pattern)
   - Experience years: number input
   - License number: text input
   - Phone + email inputs
   - is_available toggle
   - is_published toggle
   - "Save Draft" and "Publish" buttons

3. /admin/guides/[id]/edit  (edit form)
   - Same as create, pre-filled
   - Shows booking count for this guide (read-only)
   - Shows created_at, updated_at, updated_by

PUBLIC SCREENS
───────────────
1. /guides  (guide directory)
   - Grid of published guide cards sorted by sort_order
   - Each card: photo, name, languages badges, specialties,
     experience years, availability badge, "Book This Guide"
   - Filter by language or specialty (dropdown)
   - Unavailable guides shown greyed out at bottom

2. /guides/[slug]  (guide detail)
   - Full profile: photo, name, bio (rendered HTML),
     languages, specialties, experience, license number
   - "Book This Guide" CTA → /booking?guideId=[id]

DATABASE TABLE (Drizzle)
─────────────────────────
guides
  id                uuid primary key
  name              text not null
  slug              text unique not null
  photo             text
  bio               text
  languages         text[] default '{}'
  specialties       text[] default '{}'
  experience_years  integer
  license_number    text
  phone             text
  email             text
  is_available      boolean default true
  is_published      boolean default false
  sort_order        integer default 0
  created_by        uuid references users(id)
  updated_by        uuid references users(id)
  created_at        timestamp default now()
  updated_at        timestamp default now()


  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 SPEC BLOCK — Phase 4: Module 2g — Contact Info Manager
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MODULE 2g — CONTACT INFO MANAGER
==================================
Purpose:  Bureau editor updates all official contact details
          shown on the public contact page — address, phones,
          emails, map location, office hours — from the admin
          dashboard with no code.

CONTACT FIELDS
───────────────
- id              uuid primary key
- office_name     text      e.g. "Harari Regional Tourism Bureau"
- address_line1   text      street address
- address_line2   text      city, region
- country         text      default "Ethiopia"
- phone_primary   text      main office number
- phone_secondary text      optional second number
- email_general   text      general inquiries email
- email_bookings  text      bookings-specific email
- working_hours   jsonb     array of {day, hours} objects
                            e.g. [{day:"Mon–Fri", hours:"8AM–5PM"}]
- map_lat         numeric   latitude for embedded map pin
- map_lng         numeric   longitude for embedded map pin
- facebook_url    text      optional social link
- twitter_url     text      optional social link
- instagram_url   text      optional social link
- is_published    boolean   draft vs live
- updated_by      uuid      references users(id)
- updated_at      timestamp

ADMIN SCREEN
─────────────
1. /admin/contact  (single form — one record, always upsert)
   - Office name input
   - Address line 1 + line 2 inputs
   - Country input
   - Phone primary + secondary inputs
   - Email general + bookings inputs
   - Working hours builder:
     · List of {day, hours} rows
     · Add row, edit inline, delete row, reorder
     · e.g. "Mon–Fri" / "8:00 AM – 5:00 PM"
   - Map coordinates:
     · Latitude + longitude number inputs
     · Small map preview showing pin at entered coords
       (use Leaflet.js — no API key needed)
   - Social links: Facebook, Twitter, Instagram inputs
   - "Save Draft" and "Publish" buttons
   - Shows last updated timestamp + updated_by name

PUBLIC SCREEN
──────────────
1. /contact
   - Office name, full address block
   - Phone numbers (click to call on mobile)
   - Email addresses (click to mailto)
   - Working hours table
   - Embedded Leaflet map with bureau pin
   - Social media icon links
   - Inquiry form (handled by Booking Module — Module 4)

DATABASE TABLE (Drizzle)
─────────────────────────
contact_info
  id                uuid primary key
  office_name       text
  address_line1     text
  address_line2     text
  country           text default 'Ethiopia'
  phone_primary     text
  phone_secondary   text
  email_general     text
  email_bookings    text
  working_hours     jsonb default '[]'
  map_lat           numeric
  map_lng           numeric
  facebook_url      text
  twitter_url       text
  instagram_url     text
  is_published      boolean default false
  updated_by        uuid references users(id)
  updated_at        timestamp default now()


  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 SPEC BLOCK — Phase 4: Module 3 — Public Website
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MODULE 3 — PUBLIC WEBSITE
==========================
Purpose:  The tourist-facing side of Visit Harar. Every page
          is rendered from CMS content. Fast, beautiful,
          credible, and fully SEO-optimized.

LAYOUT COMPONENTS
──────────────────
1. PublicNavbar
   - Logo: "Visit Harar" + "Harari Regional Tourism Bureau"
   - Links: Home | Attractions | Guides | Gallery |
            Culture | Plan Your Trip | News | Contact
   - Mobile: hamburger menu → full-screen slide-in drawer
   - Sticky on scroll, transparent on homepage hero,
     solid background on all other pages
   - "Book a Guide" CTA button (accent color, top right)

2. PublicFooter
   - Logo + tagline
   - Nav columns: Explore | Plan | Learn | Connect
   - Bureau contact info pulled from contact_info table
   - Social media links from contact_info table
   - Copyright: "© [year] Harari Regional Tourism Bureau"
   - Language switcher placeholder (v2)

PAGES & THEIR ASSEMBLY
───────────────────────
1. / — Homepage
   Sections (top to bottom):
   a. Hero           → from hero_content table
   b. Featured Attractions → attractions where is_featured=true
                             max 6, sorted by sort_order
   c. Announcements Widget → 3 latest from announcements table
                             pinned post always included
   d. Featured Guides  → 3 published guides, sort_order
   e. Gallery Teaser   → 8 latest published gallery items
                         across all albums, "View Gallery" link
   f. About Harar Teaser → short intro + stats from about page
   g. CTA Banner       → "Plan your visit to Harar today"
                         links to /plan-your-trip

2. /attractions       → built in Module 2b (reuse)
3. /attractions/[slug]→ built in Module 2b (reuse)
4. /guides            → built in Module 2f (reuse)
5. /guides/[slug]     → built in Module 2f (reuse)
6. /gallery           → built in Module 2c (reuse)
7. /gallery/[albumId] → built in Module 2c (reuse)
8. /about             → built in Module 2d (reuse)
9. /culture           → built in Module 2d (reuse)
10. /plan-your-trip   → built in Module 2d (reuse)
11. /news             → built in Module 2e (reuse)
12. /news/[slug]      → built in Module 2e (reuse)
13. /contact          → built in Module 2g (reuse)
14. /booking          → Module 4 (next)

SHARED PUBLIC COMPONENTS
─────────────────────────
- PageHero           full-width hero banner for inner pages
                     (title, subtitle, background image)
- SectionHeader      title + subtitle block used across pages
- AttractionCard     image, title, short_desc, category tag
- GuideCard          photo, name, languages, specialties,
                     availability, book button
- AnnouncementCard   cover, type badge, title, date, excerpt
- GalleryThumb       image thumbnail with caption overlay
- ComingSoon         shown when a page is not yet published
- LoadingSpinner     consistent loading state across site
- ErrorBoundary      graceful error handling per section

SEO & METADATA
───────────────
Every public page exports metadata:
- title:       "[Page Title] — Visit Harar"
- description: page-specific, pulled from CMS content
- og:image:    page hero image or site default
- og:type:     website
- canonical:   full URL

Site-wide defaults (fallback):
- title:       "Visit Harar — Official Tourism Website"
- description: "Discover Harar, Ethiopia's UNESCO World
                Heritage City of Saints. Plan your visit
                with the official Harari Tourism Bureau."
- og:image:    hero_content.background_image (published)

Sitemap:
- /sitemap.xml auto-generated listing all public routes
  including dynamic attraction and guide slugs

PERFORMANCE RULES
──────────────────
- All public pages use SSR (server-side rendering)
- Images served via Cloudinary with width/quality params
  e.g. ?w=800&q=auto&f=auto
- No public page fetches more than 3 DB queries on load
- Homepage assembles all sections in one parallel fetch
- TanStack Query used for client-side interactions only
  (filters, lightbox, booking form)

NAVIGATION RULES
─────────────────
- Active nav link highlighted based on current route
- Mobile drawer closes on route change
- "Book a Guide" always visible — highest priority CTA
- Admin login link NOT visible anywhere on public site
  (access /admin/login directly — security by obscurity)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 SPEC BLOCK — Phase 4: Module 4 — Booking System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MODULE 4 — BOOKING SYSTEM
==========================
Purpose:  Visitors submit guide/tour booking requests.
          Bureau editor reviews, confirms or declines each
          request. Email notifications keep both sides
          informed. No payment in v1 — request only.

BOOKING FIELDS
───────────────
- id                uuid primary key
- booking_ref       text unique   auto-generated readable ref
                                  e.g. "HRR-2026-00142"
- guide_id          uuid          references guides(id)
- visitor_name      text          full name
- visitor_email     text          contact email
- visitor_phone     text          contact phone (optional)
- visitor_country   text          where they're travelling from
- tour_date         date          requested tour date
- tour_duration     enum          Half Day | Full Day | Multi Day
- group_size        integer       number of people
- special_requests  text          optional notes
- status            enum          Pending | Confirmed | Declined
                                  | Cancelled
- status_note       text          editor's note on decision
- notified_at       timestamp     when visitor was emailed
- created_at        timestamp     when request submitted
- updated_by        uuid          references users(id)
- updated_at        timestamp

BOOKING REFERENCE FORMAT
─────────────────────────
HRR-[YEAR]-[5-digit padded count]
e.g. HRR-2026-00001, HRR-2026-00142
Generated on insert — never editable.

STATUS FLOW
────────────
Pending → Confirmed  (editor confirms)
Pending → Declined   (editor declines with note)
Confirmed → Cancelled (visitor cancels OR editor cancels)
Declined is terminal — no further changes

EMAIL NOTIFICATIONS
────────────────────
Trigger: on status change (Confirmed / Declined / Cancelled)

To visitor on Confirm:
  Subject: "Your Harar Tour is Confirmed — [booking_ref]"
  Body: guide name, tour date, duration, group size,
        guide phone + email, bureau contact info,
        booking reference number

To visitor on Decline:
  Subject: "Update on Your Harar Tour Request — [booking_ref]"
  Body: polite decline, status_note from editor,
        invitation to resubmit with different dates,
        bureau contact info

To visitor on Cancel:
  Subject: "Your Harar Tour Booking Cancelled — [booking_ref]"
  Body: cancellation confirmation, bureau contact info

To bureau email on new Pending booking:
  Subject: "New Booking Request — [booking_ref]"
  Body: all visitor details + guide name + tour details
        link to /admin/bookings/[id]

Email provider: Resend (simple API, generous free tier)
Templates: plain HTML emails, branded with Visit Harar header

ADMIN SCREENS
──────────────
1. /admin/bookings  (list view)
   - Table: ref | guide name | visitor name | country |
            tour_date | duration | group | status badge |
            submitted date | actions
   - Filter by status (All | Pending | Confirmed |
     Declined | Cancelled)
   - Filter by guide (dropdown)
   - Filter by date range
   - Sort by created_at descending (newest first)
   - Status badge colors:
     Pending  = amber
     Confirmed = green
     Declined  = red
     Cancelled = gray
   - Click row → booking detail page

2. /admin/bookings/[id]  (booking detail)
   - Full booking info: all visitor fields, guide card,
     tour details, booking_ref, submitted date
   - Status history (current status + updated_by + updated_at)
   - Action panel (shown based on current status):
     · If Pending:
       "Confirm" button → modal: optional status_note → confirm
       "Decline" button → modal: required status_note → decline
     · If Confirmed:
       "Cancel Booking" button → modal: required status_note
     · If Declined / Cancelled: read-only, no actions
   - "Send reminder email" button (resends last notification)
   - Back to bookings list link

PUBLIC SCREENS
───────────────
1. /booking  (booking request form)
   - Step 1: Select Guide
     · If arriving via /booking?guideId=X → guide pre-selected
     · Otherwise: searchable guide dropdown (published,
       available guides only)
     · Selected guide card preview (photo, name, specialties)

   - Step 2: Tour Details
     · Tour date: date picker (no past dates)
     · Tour duration: Half Day | Full Day | Multi Day
       (radio buttons)
     · Group size: number input (min 1, max 50)

   - Step 3: Your Details
     · Full name (required)
     · Email (required, validated)
     · Phone (optional)
     · Country (required, dropdown)
     · Special requests (optional textarea)

   - Step 4: Review & Submit
     · Summary of all entered details
     · Guide card, tour date, duration, group size
     · Visitor details
     · Terms: "By submitting you agree this is a request,
       not a guaranteed booking. The bureau will confirm
       within 2 business days."
     · Submit button

   - Step 5: Success screen (same page, no redirect)
     · "Request received!" message
     · Booking reference displayed prominently
     · "You will receive a confirmation email at [email]"
     · "Return to Home" link

2. /booking/status  (check booking status)
   - Input: booking_ref + visitor email
   - Shows: current status, guide name, tour date,
     status_note if declined
   - Does NOT require login

DATABASE TABLE (Drizzle)
─────────────────────────
bookings
  id                uuid primary key
  booking_ref       text unique not null
  guide_id          uuid references guides(id)
  visitor_name      text not null
  visitor_email     text not null
  visitor_phone     text
  visitor_country   text not null
  tour_date         date not null
  tour_duration     text not null
  group_size        integer not null
  special_requests  text
  status            text default 'Pending'
  status_note       text
  notified_at       timestamp
  created_at        timestamp default now()
  updated_by        uuid references users(id)
  updated_at        timestamp default now()



  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 SPEC BLOCK — Phase 4: Module 5 — Media Manager
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MODULE 5 — MEDIA MANAGER
=========================
Purpose:  Centralized library of all uploaded media assets
          across the entire CMS. Editor can browse, search,
          reuse, and delete assets without re-uploading.
          Prevents duplicate uploads and Cloudinary clutter.

MEDIA ASSET FIELDS
───────────────────
- id              uuid primary key
- cloudinary_id   text unique   Cloudinary public_id
- url             text          Cloudinary secure_url
- thumbnail_url   text          Cloudinary thumbnail transform
- filename        text          original filename on upload
- type            enum          image | video
- size_bytes      integer       file size
- width           integer       image/video width in px
- height          integer       image/video height in px
- alt_text        text          accessibility description
- used_in         text[]        list of modules using this asset
                                e.g. ['hero', 'attractions']
- uploaded_by     uuid          references users(id)
- created_at      timestamp

ADMIN SCREENS
──────────────
1. /admin/media  (media library)
   - Grid view of all uploaded assets (images + videos)
   - Thumbnail for images, video icon + duration for videos
   - Search bar: filter by filename or alt_text
   - Filter: All | Images | Videos
   - Sort: Newest | Oldest | Largest | Smallest
   - Each asset card shows:
     · Thumbnail
     · Filename (truncated)
     · Type badge
     · Size (human readable: KB / MB)
     · Dimensions (e.g. 1920×1080)
     · Used in badges (hero, attractions, etc.)
     · Edit alt_text inline (click to edit, enter to save)
     · Delete button (warns if asset is in use)
     · Copy URL button
   - Bulk select: select multiple → bulk delete
   - Pagination: 48 assets per page

2. Media Picker (reusable modal component)
   - Triggered from any upload field across the CMS
   - Same grid as media library
   - "Upload New" tab + "Choose Existing" tab
   - Search + filter inside modal
   - Click asset to select → returns URL to parent field
   - Used in: Hero, Attractions, Gallery, Pages, Guides,
     Announcements, Contact

DATABASE TABLE (Drizzle)
─────────────────────────
media_assets
  id              uuid primary key
  cloudinary_id   text unique not null
  url             text not null
  thumbnail_url   text
  filename        text
  type            text ('image' | 'video')
  size_bytes      integer
  width           integer
  height          integer
  alt_text        text
  used_in         text[] default '{}'
  uploaded_by     uuid references users(id)
  created_at      timestamp default now()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 SPEC BLOCK — Phase 4: Module 6 — Super Admin Panel
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MODULE 6 — SUPER ADMIN PANEL
=============================
Purpose:  You (super admin) manage editor accounts, monitor
          system activity, audit content changes, and
          configure global site settings. Bureau editors
          never see this panel.

SUB-SECTIONS
─────────────
1. User Management — /admin/users
   - List all users (superadmin + editors)
   - Table: name | email | role | status | last login |
            created_at | actions
   - Create new editor account:
     · Name, email, temporary password
     · Role: editor (superadmin not creatable from UI)
     · Send welcome email with login link (Resend)
   - Edit user: name, email, role, is_active toggle
   - Deactivate user (soft delete — is_active = false)
     deactivated users cannot log in
   - Reset password: generates reset link, sends via email
   - Cannot delete or deactivate own account

2. Audit Log — /admin/audit
   - Every content change logged automatically:
     · who (user name + email)
     · what (module + action e.g. "attractions: updated")
     · which (record id + title)
     · when (timestamp)
     · before/after snapshot (JSON diff of changed fields)
   - Table: timestamp | user | module | action | record
   - Filter: by user, by module, by date range
   - Read-only — no delete, no edit
   - Pagination: 50 entries per page

3. Site Settings — /admin/settings
   - Global settings editable by superadmin only:
     · site_name        text    "Visit Harar"
     · site_tagline     text    short description
     · default_og_image text    Cloudinary URL (media picker)
     · maintenance_mode boolean shows maintenance page publicly
     · booking_enabled  boolean disables booking form if false
     · bureau_email     text    override for all system emails
     · analytics_id     text    Google Analytics ID (optional)
   - Single record — always upsert
   - "Save Settings" button

4. Dashboard — /admin/dashboard (home for all admin users)
   - Summary cards (visible to all roles):
     · Total bookings this month
     · Pending bookings (needs action)
     · Published attractions count
     · Published guides count
   - Recent activity feed (last 10 audit entries)
     visible to superadmin only
   - Quick links:
     · "New Attraction", "New Guide", "New Announcement"
     · "View all bookings"
   - System status (superadmin only):
     · DB connection: OK
     · Cloudinary: OK
     · Email service: OK
     · Maintenance mode: ON/OFF toggle

AUDIT LOG TABLE (Drizzle)
──────────────────────────
audit_logs
  id            uuid primary key
  user_id       uuid references users(id)
  user_name     text          snapshot at time of action
  user_email    text          snapshot at time of action
  module        text          e.g. 'attractions'
  action        text          e.g. 'updated' | 'created'
                              | 'deleted' | 'published'
  record_id     text          affected record id
  record_title  text          human readable record name
  before        jsonb         state before change (nullable)
  after         jsonb         state after change (nullable)
  created_at    timestamp     default now()

SITE SETTINGS TABLE (Drizzle)
──────────────────────────────
site_settings
  id                uuid primary key
  site_name         text
  site_tagline      text
  default_og_image  text
  maintenance_mode  boolean default false
  booking_enabled   boolean default true
  bureau_email      text
  analytics_id      text
  updated_by        uuid references users(id)
  updated_at        timestamp default now()

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 SPEC BLOCK — Phase 5: Smart Chunking
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHUNKING RULES
===============
- Each chunk = one AI conversation = one working output
- Every chunk lists its dependencies (what must exist first)
- Chunks within a module are ordered (1 must finish before 2)
- Chunks across modules follow the module build order
- Each chunk has a clear DONE condition — you know when
  it's finished and working before moving to the next

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 1 — AUTH & ROLE SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHUNK 1.1 — Project Scaffold
  Task:   Initialize TanStack Start project, install all
          dependencies, configure Tailwind, set up folder
          structure, configure environment variables
  Deps:   Nothing — this is first
  Files:  package.json, tsconfig.json, app.config.ts,
          tailwind.config.ts, .env.example, folder tree
  Done:   `npm run dev` starts with no errors

CHUNK 1.2 — Database Setup
  Task:   Configure Drizzle ORM, connect to PostgreSQL,
          create drizzle.config.ts, test connection
  Deps:   1.1
  Files:  drizzle.config.ts, db/index.ts, .env (DB_URL)
  Done:   `npm run db:push` succeeds, DB connected

CHUNK 1.3 — Users Schema + Seed
  Task:   Create users + sessions tables, run migration,
          seed superadmin from env variables
  Deps:   1.2
  Files:  drizzle/schema/users.ts,
          scripts/seed-superadmin.ts
  Done:   Superadmin row exists in DB after seed

CHUNK 1.4 — Auth Configuration
  Task:   Configure Better Auth with email+password,
          role-based sessions, bcrypt hashing,
          8-hour session expiry
  Deps:   1.3
  Files:  lib/auth.ts, lib/auth-client.ts
  Done:   Auth module initializes without errors

CHUNK 1.5 — Auth Middleware
  Task:   Build requireAuth middleware, role checking,
          redirect logic for protected routes
  Deps:   1.4
  Files:  middleware/requireAuth.ts
  Done:   /admin/* redirects to /admin/login when
          no session present

CHUNK 1.6 — Login + Password Reset UI
  Task:   Build login page, forgot password page,
          reset password page — all Tailwind styled
  Deps:   1.4, 1.5
  Files:  app/admin/login/page.tsx,
          app/admin/forgot-password/page.tsx,
          app/admin/reset-password/page.tsx
  Done:   Can log in as superadmin, session persists,
          redirects to /admin/dashboard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 2a — HERO MANAGER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHUNK 2a.1 — Hero Schema + Migration
  Task:   Create hero_content table, run migration
  Deps:   1.2
  Files:  drizzle/schema/hero.ts
  Done:   Table exists in DB

CHUNK 2a.2 — Cloudinary Setup
  Task:   Install Cloudinary SDK, configure with env
          vars, build uploadImage() + deleteImage()
  Deps:   1.1
  Files:  lib/cloudinary.ts, .env (CLOUDINARY_*)
  Done:   Test upload returns a valid Cloudinary URL

CHUNK 2a.3 — Hero Server Functions
  Task:   Build getHero(), upsertHero(), publishHero(),
          unpublishHero() server functions
  Deps:   2a.1
  Files:  server/hero.ts
  Done:   Can upsert and fetch hero record via
          direct function call

CHUNK 2a.4 — Hero Admin UI
  Task:   Build two-column hero editor: form left,
          live preview right, image upload, save/publish
  Deps:   2a.2, 2a.3, 1.5
  Files:  app/admin/hero/page.tsx
  Done:   Editor can update hero and publish —
          changes visible immediately in preview

CHUNK 2a.5 — Hero Public Render
  Task:   Build homepage hero section that fetches
          from DB and renders published hero content
  Deps:   2a.3
  Files:  app/(public)/page.tsx (hero section only)
  Done:   Public homepage shows CMS hero content

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 2b — ATTRACTIONS CRUD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHUNK 2b.1 — Attractions Schema + Migration
  Task:   Create attractions table, run migration
  Deps:   1.2
  Files:  drizzle/schema/attractions.ts
  Done:   Table exists in DB

CHUNK 2b.2 — Slug Utility
  Task:   Build generateSlug() and ensureUniqueSlug()
  Deps:   1.1
  Files:  lib/slug.ts
  Done:   Slug generated correctly, duplicates handled

CHUNK 2b.3 — Tiptap Setup
  Task:   Install Tiptap, configure basic toolbar
          (bold, italic, lists, headings), create
          reusable RichTextEditor component
  Deps:   1.1
  Files:  components/admin/RichTextEditor.tsx
  Done:   Rich text editor renders, outputs clean HTML

CHUNK 2b.4 — Attractions Server Functions
  Task:   Build all server functions: getAttractions,
          getAttractionBySlug, getAttractionById,
          createAttraction, updateAttraction,
          deleteAttraction, updateSortOrder,
          togglePublished, toggleFeatured
  Deps:   2b.1, 2b.2
  Files:  server/attractions.ts
  Done:   CRUD operations work via direct function calls

CHUNK 2b.5 — Attractions Admin List
  Task:   Build list view with table, drag-and-drop
          reorder, inline toggles, delete confirm
  Deps:   2b.4, 1.5
  Files:  app/admin/attractions/page.tsx
  Done:   List renders, reorder persists, toggles work

CHUNK 2b.6 — Attractions Admin Forms
  Task:   Build create + edit forms with all fields,
          Tiptap, image upload, slug generation
  Deps:   2b.3, 2b.4, 2a.2
  Files:  app/admin/attractions/new/page.tsx,
          app/admin/attractions/[id]/edit/page.tsx
  Done:   Can create and edit attractions end-to-end

CHUNK 2b.7 — Attractions Public Pages
  Task:   Build public attractions grid + detail page
          with category filters and slug routing
  Deps:   2b.4
  Files:  app/(public)/attractions/page.tsx,
          app/(public)/attractions/[slug]/page.tsx,
          components/public/AttractionCard.tsx
  Done:   Public grid shows published attractions,
          detail page renders full content

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 2c — GALLERY MANAGER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHUNK 2c.1 — Gallery Schema + Migration
  Task:   Create gallery_albums + gallery_items tables
  Deps:   1.2
  Files:  drizzle/schema/gallery.ts
  Done:   Both tables exist in DB with cascade delete

CHUNK 2c.2 — Gallery Server Functions
  Task:   Build all gallery server functions:
          getAlbums, getAlbumById, createAlbum,
          updateAlbum, deleteAlbum, reorderAlbums,
          uploadMediaItem, updateMediaItem,
          deleteMediaItem, reorderItems,
          setAlbumCover, bulkPublish
  Deps:   2c.1, 2a.2
  Files:  server/gallery.ts
  Done:   All functions work via direct calls

CHUNK 2c.3 — Gallery Admin Albums List
  Task:   Build albums grid with cover, count badge,
          published toggle, reorder, delete confirm,
          new album modal
  Deps:   2c.2, 1.5
  Files:  app/admin/gallery/page.tsx
  Done:   Can create, reorder, toggle, delete albums

CHUNK 2c.4 — Gallery Admin Media Manager
  Task:   Build album detail page: multi-file dropzone,
          per-file progress, media grid, inline caption,
          alt text, reorder, set cover, bulk actions
  Deps:   2c.2, 2c.3
  Files:  app/admin/gallery/[albumId]/page.tsx
  Done:   Can upload multiple files, reorder, set cover

CHUNK 2c.5 — Gallery Public Pages + Lightbox
  Task:   Build public albums grid and lightbox page
          with yet-another-react-lightbox integration
  Deps:   2c.2
  Files:  app/(public)/gallery/page.tsx,
          app/(public)/gallery/[albumId]/page.tsx,
          components/public/GalleryThumb.tsx
  Done:   Public gallery renders, lightbox opens,
          prev/next navigation works

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 2d — PAGES MANAGER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHUNK 2d.1 — Pages Schema + Seed
  Task:   Create pages table, run migration, seed
          3 page rows (about, culture, plan)
  Deps:   1.2
  Files:  drizzle/schema/pages.ts,
          scripts/seed-pages.ts
  Done:   3 page rows exist in DB after seed

CHUNK 2d.2 — Pages Server Functions
  Task:   Build getPage(), upsertPageContent(),
          publishPage(), unpublishPage()
  Deps:   2d.1
  Files:  server/pages.ts
  Done:   Can fetch and update any page by key

CHUNK 2d.3 — Shared Page Editor Hook
  Task:   Build usePageEditor() hook with shared
          save draft + publish logic used by all
          three page editors
  Deps:   2d.2
  Files:  hooks/usePageEditor.ts
  Done:   Hook handles save/publish state correctly

CHUNK 2d.4 — About Page Editor + Public
  Task:   Build About editor (rich text sections,
          quick facts list) and public About page
  Deps:   2d.2, 2d.3, 2b.3, 2a.2
  Files:  components/admin/editors/AboutEditor.tsx,
          app/admin/pages/about/page.tsx,
          app/(public)/about/page.tsx
  Done:   Editor saves, public page renders content

CHUNK 2d.5 — Culture Page Editor + Public
  Task:   Build Culture editor (sections builder,
          festivals list) and public Culture page
  Deps:   2d.2, 2d.3, 2b.3, 2a.2
  Files:  components/admin/editors/CultureEditor.tsx,
          app/admin/pages/culture/page.tsx,
          app/(public)/culture/page.tsx
  Done:   Sections builder works, public page renders

CHUNK 2d.6 — Plan Your Trip Editor + Public
  Task:   Build Plan editor (itineraries builder,
          rich text sections) and public Plan page
  Deps:   2d.2, 2d.3, 2b.3, 2a.2
  Files:  components/admin/editors/PlanEditor.tsx,
          app/admin/pages/plan/page.tsx,
          app/(public)/plan-your-trip/page.tsx
  Done:   Itinerary builder works, public page renders

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 2e — ANNOUNCEMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHUNK 2e.1 — Announcements Schema + Migration
  Task:   Create announcements table, run migration
  Deps:   1.2
  Files:  drizzle/schema/announcements.ts
  Done:   Table exists in DB

CHUNK 2e.2 — Announcements Server Functions
  Task:   Build all server functions: getAnnouncements,
          getAnnouncementBySlug, getAnnouncementById,
          getLatestAnnouncements, createAnnouncement,
          updateAnnouncement, deleteAnnouncement,
          togglePublished, pinAnnouncement,
          unpinAnnouncement
  Deps:   2e.1, 2b.2
  Files:  server/announcements.ts
  Done:   All functions work, pin logic enforced

CHUNK 2e.3 — Announcements Admin UI
  Task:   Build list view + create form + edit form
          with type-conditional event fields,
          pin toggle, Tiptap body editor
  Deps:   2e.2, 2b.3, 2a.2, 1.5
  Files:  app/admin/announcements/page.tsx,
          app/admin/announcements/new/page.tsx,
          app/admin/announcements/[id]/edit/page.tsx
  Done:   Full CRUD works, pin enforces single pinned

CHUNK 2e.4 — Announcements Public Pages + Widget
  Task:   Build public news feed, detail page,
          and homepage widget component
  Deps:   2e.2
  Files:  app/(public)/news/page.tsx,
          app/(public)/news/[slug]/page.tsx,
          components/public/AnnouncementsWidget.tsx,
          components/public/AnnouncementCard.tsx
  Done:   Feed paginates, pinned post highlights,
          widget renders on homepage

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 2f — GUIDE PROFILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHUNK 2f.1 — Guides Schema + Migration
  Task:   Create guides table with text[] arrays,
          run migration
  Deps:   1.2
  Files:  drizzle/schema/guides.ts
  Done:   Table exists in DB

CHUNK 2f.2 — Guides Server Functions
  Task:   Build all server functions: getGuides,
          getGuideBySlug, getGuideById, createGuide,
          updateGuide, deleteGuide, reorderGuides,
          togglePublished, toggleAvailable,
          getGuideBookingCount
  Deps:   2f.1, 2b.2, 2a.2
  Files:  server/guides.ts
  Done:   CRUD works, arrays stored correctly

CHUNK 2f.3 — TagInput Component
  Task:   Build reusable TagInput component for
          languages and specialties fields
  Deps:   1.1
  Files:  components/admin/TagInput.tsx
  Done:   Tags add on Enter, remove on click ×,
          returns string[] correctly

CHUNK 2f.4 — Guides Admin UI
  Task:   Build list view + create + edit forms
          with TagInput, Tiptap bio, drag reorder,
          availability + published toggles
  Deps:   2f.2, 2f.3, 2b.3, 1.5
  Files:  app/admin/guides/page.tsx,
          app/admin/guides/new/page.tsx,
          app/admin/guides/[id]/edit/page.tsx
  Done:   Full CRUD works including tag inputs

CHUNK 2f.5 — Guides Public Pages
  Task:   Build guide directory + detail page
          with filters and Book CTA
  Deps:   2f.2
  Files:  app/(public)/guides/page.tsx,
          app/(public)/guides/[slug]/page.tsx,
          components/public/GuideCard.tsx
  Done:   Directory filters by language/specialty,
          unavailable guides sorted to bottom

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 2g — CONTACT INFO MANAGER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHUNK 2g.1 — Contact Schema + Migration
  Task:   Create contact_info table, run migration
  Deps:   1.2
  Files:  drizzle/schema/contact.ts
  Done:   Table exists in DB

CHUNK 2g.2 — Contact Server Functions
  Task:   Build getContactInfo(), upsertContactInfo(),
          publishContact(), unpublishContact()
  Deps:   2g.1
  Files:  server/contact.ts
  Done:   Single record upsert works correctly

CHUNK 2g.3 — Contact Admin UI
  Task:   Build single-form contact editor with
          working hours builder, Leaflet map preview
          with draggable pin, social links
  Deps:   2g.2, 2a.2, 1.5
  Files:  app/admin/contact/page.tsx
  Done:   Form saves, map pin updates on coord change

CHUNK 2g.4 — Contact Public Page
  Task:   Build public contact page with Leaflet map,
          clickable phone/email, working hours table
  Deps:   2g.2
  Files:  app/(public)/contact/page.tsx
  Done:   Map renders, tap-to-call works on mobile

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 3 — PUBLIC WEBSITE SHELL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHUNK 3.1 — Public Layout + Navbar
  Task:   Build public layout shell, sticky navbar
          with transparent/solid scroll behavior,
          mobile hamburger drawer, active link state
  Deps:   1.1, 2g.2
  Files:  app/(public)/layout.tsx,
          components/public/PublicNavbar.tsx
  Done:   Navbar renders on all public pages,
          transparent on home, solid on inner pages

CHUNK 3.2 — Public Footer
  Task:   Build footer with nav columns, contact info
          from DB, social links, dynamic copyright year
  Deps:   2g.2
  Files:  components/public/PublicFooter.tsx
  Done:   Footer renders bureau contact info from CMS

CHUNK 3.3 — Shared Public Components
  Task:   Build PageHero, SectionHeader, ComingSoon,
          LoadingSpinner, ErrorBoundary components
  Deps:   1.1
  Files:  components/public/PageHero.tsx,
          components/public/SectionHeader.tsx,
          components/public/ComingSoon.tsx,
          components/public/LoadingSpinner.tsx,
          components/public/ErrorBoundary.tsx
  Done:   All shared components render correctly

CHUNK 3.4 — Homepage Assembly
  Task:   Assemble full homepage using Promise.all
          for parallel data fetching, all 7 sections,
          each wrapped in error boundary
  Deps:   All 2a–2g public components, 3.1, 3.2, 3.3
  Files:  app/(public)/page.tsx (complete)
  Done:   Homepage loads all sections, one section
          failing does not break others

CHUNK 3.5 — SEO + Sitemap
  Task:   Build metadata utility, add metadata exports
          to all public pages, generate sitemap.xml
  Deps:   All public pages built
  Files:  lib/metadata.ts, app/sitemap.ts
  Done:   All pages have correct title/description/og,
          sitemap lists all static + dynamic routes

CHUNK 3.6 — Image Optimization
  Task:   Build optimizeImage() Cloudinary URL utility,
          replace all raw image URLs across public pages
  Deps:   2a.2, all public pages built
  Files:  lib/cloudinary-url.ts
  Done:   All public images served with w/q/f params

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 4 — BOOKING SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHUNK 4.1 — Bookings Schema + Migration
  Task:   Create bookings table, run migration
  Deps:   1.2, 2f.1
  Files:  drizzle/schema/bookings.ts
  Done:   Table exists in DB with guide FK

CHUNK 4.2 — Booking Reference Generator
  Task:   Build generateBookingRef() with year-aware
          padded counter, transaction-safe
  Deps:   4.1
  Files:  lib/booking-ref.ts
  Done:   Generates HRR-2026-00001 format correctly

CHUNK 4.3 — Email Setup + Templates
  Task:   Install Resend, build email utility with
          all 4 email templates (confirm, decline,
          cancel, new booking alert)
  Deps:   1.1
  Files:  lib/email.ts, .env (RESEND_API_KEY)
  Done:   Test email sends and arrives correctly

CHUNK 4.4 — Booking Server Functions
  Task:   Build all server functions: getBookings,
          getBookingById, getBookingByRef,
          createBooking, confirmBooking,
          declineBooking, cancelBooking,
          resendNotification
  Deps:   4.1, 4.2, 4.3
  Files:  server/bookings.ts
  Done:   Status transitions enforced, emails fire

CHUNK 4.5 — Booking Admin List + Detail
  Task:   Build admin bookings list with filters,
          status badges, auto-refresh, and detail
          page with action modals
  Deps:   4.4, 1.5
  Files:  app/admin/bookings/page.tsx,
          app/admin/bookings/[id]/page.tsx
  Done:   Editor can confirm/decline/cancel bookings,
          emails send on each action

CHUNK 4.6 — Public Booking Form
  Task:   Build 4-step booking form with guide
          pre-selection, date picker, visitor details,
          review step, success screen
  Deps:   4.4, 2f.2
  Files:  app/(public)/booking/page.tsx
  Done:   End-to-end: visitor submits → ref shown →
          bureau email received

CHUNK 4.7 — Booking Status Checker
  Task:   Build public status check page:
          ref + email → shows current booking status
  Deps:   4.4
  Files:  app/(public)/booking/status/page.tsx
  Done:   Correct ref+email shows status,
          wrong inputs show "not found"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 5 — MEDIA MANAGER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHUNK 5.1 — Media Schema + Migration
  Task:   Create media_assets table, run migration
  Deps:   1.2
  Files:  drizzle/schema/media.ts
  Done:   Table exists in DB

CHUNK 5.2 — Media Server Functions
  Task:   Build getMediaAssets, getMediaAssetById,
          uploadMediaAsset, updateAltText,
          markUsedIn, unmarkUsedIn,
          deleteMediaAsset, bulkDeleteMediaAssets
  Deps:   5.1, 2a.2
  Files:  server/media.ts
  Done:   Upload stores metadata, delete cleans
          Cloudinary + DB

CHUNK 5.3 — MediaPicker Component
  Task:   Build reusable MediaPicker modal with
          Upload New + Choose Existing tabs,
          search, filter, click-to-select
  Deps:   5.2
  Files:  components/admin/MediaPicker.tsx
  Done:   Picker opens, selects asset, returns URL

CHUNK 5.4 — Media Library Page
  Task:   Build /admin/media grid with search,
          filter, sort, inline alt edit, copy URL,
          bulk delete, pagination
  Deps:   5.2, 5.3, 1.5
  Files:  app/admin/media/page.tsx
  Done:   Library shows all assets, bulk delete works

CHUNK 5.5 — Replace Upload Inputs
  Task:   Replace all individual Cloudinary upload
          inputs across modules 2a–2g with
          MediaPicker component
  Deps:   5.3, all 2a–2g admin UIs built
  Files:  Updates to all admin form components
  Done:   No admin form calls Cloudinary directly —
          all go through MediaPicker

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 6 — SUPER ADMIN PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHUNK 6.1 — Audit + Settings Schema + Seed
  Task:   Create audit_logs + site_settings tables,
          run migration, seed default settings
  Deps:   1.2
  Files:  drizzle/schema/audit.ts,
          drizzle/schema/settings.ts,
          scripts/seed-settings.ts
  Done:   Both tables exist, settings row seeded

CHUNK 6.2 — Audit Utility
  Task:   Build logAction() fire-and-forget utility,
          document all insertion points across modules
  Deps:   6.1, 1.3
  Files:  lib/audit.ts,
          lib/audit-points.ts
  Done:   logAction() inserts log row without
          blocking parent operation

CHUNK 6.3 — Wire Audit Into All Modules
  Task:   Add logAction() calls to every mutating
          server function across all modules
          following audit-points.ts checklist
  Deps:   6.2, all server functions built
  Files:  Updates to all server/*.ts files
  Done:   Every content change appears in audit log

CHUNK 6.4 — Settings Server + Admin UI
  Task:   Build settings server functions and
          /admin/settings page (superadmin only)
  Deps:   6.1, 5.3, 1.5
  Files:  server/settings.ts,
          app/admin/settings/page.tsx
  Done:   Settings save, maintenance/booking toggles
          take effect immediately

CHUNK 6.5 — Maintenance Mode Middleware
  Task:   Build maintenance mode middleware that
          checks site_settings and shows maintenance
          page on all public routes when enabled
  Deps:   6.4
  Files:  middleware/maintenanceMode.ts
  Done:   Toggling maintenance mode in settings
          immediately shows/hides maintenance page

CHUNK 6.6 — User Management
  Task:   Build users server functions and
          /admin/users page (superadmin only)
          with create, edit, deactivate, reset password
  Deps:   1.3, 1.4, 4.3, 1.5
  Files:  server/users.ts,
          app/admin/users/page.tsx
  Done:   Can create editor, deactivate, reset
          password — welcome email sends on create

CHUNK 6.7 — Audit Log UI
  Task:   Build /admin/audit page with filters,
          diff viewer modal (before/after JSON)
  Deps:   6.3, 1.5
  Files:  server/audit.ts,
          app/admin/audit/page.tsx
  Done:   Audit log shows all changes with diffs

CHUNK 6.8 — Admin Dashboard
  Task:   Build /admin/dashboard with metric cards,
          quick actions, recent audit feed (superadmin),
          system status panel (superadmin)
  Deps:   6.3, 6.4, 4.4, 2b.4, 2f.2
  Files:  app/admin/dashboard/page.tsx
  Done:   Dashboard loads all metrics, system status
          shows correct health for all services

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 SPEC BLOCK — Phase 6: Database Architecture
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPLETE TABLE INVENTORY
=========================
1.  users
2.  sessions
3.  hero_content
4.  attractions
5.  gallery_albums
6.  gallery_items
7.  pages
8.  announcements
9.  guides
10. contact_info
11. bookings
12. media_assets
13. audit_logs
14. site_settings

RELATIONSHIPS
==============

users (1) ──────────────── (M) sessions
  users.id → sessions.user_id

users (1) ──────────────── (M) attractions
  users.id → attractions.created_by
  users.id → attractions.updated_by

users (1) ──────────────── (M) gallery_albums
  users.id → gallery_albums.created_by

users (1) ──────────────── (M) gallery_items
  users.id → gallery_items.uploaded_by

users (1) ──────────────── (M) announcements
  users.id → announcements.created_by
  users.id → announcements.updated_by

users (1) ──────────────── (M) guides
  users.id → guides.created_by
  users.id → guides.updated_by

users (1) ──────────────── (M) bookings
  users.id → bookings.updated_by

users (1) ──────────────── (M) media_assets
  users.id → media_assets.uploaded_by

users (1) ──────────────── (M) audit_logs
  users.id → audit_logs.user_id

users (1) ──────────────── (1) hero_content
  users.id → hero_content.updated_by

users (1) ──────────────── (1) pages
  users.id → pages.updated_by

users (1) ──────────────── (1) contact_info
  users.id → contact_info.updated_by

users (1) ──────────────── (1) site_settings
  users.id → site_settings.updated_by

gallery_albums (1) ─────── (M) gallery_items
  gallery_albums.id → gallery_items.album_id
  ON DELETE CASCADE

guides (1) ─────────────── (M) bookings
  guides.id → bookings.guide_id
  ON DELETE RESTRICT (cannot delete guide with bookings)

SINGLE-RECORD TABLES (always 1 row)
=====================================
hero_content    — one hero, always upsert
contact_info    — one contact record, always upsert
site_settings   — one settings record, always upsert

pages           — exactly 3 rows (about, culture, plan)
                  seeded on deploy, never created from UI

INDEX STRATEGY
===============
Performance indexes (speed up common queries):

users
  · email (unique) — login lookup
  · is_active — filter active users

sessions
  · user_id — find sessions by user
  · expires_at — clean up expired sessions

attractions
  · slug (unique) — public route lookup
  · is_published, sort_order — public list query
  · is_featured, is_published — homepage featured query
  · category — filter by category

gallery_albums
  · is_published, sort_order — public list query

gallery_items
  · album_id — items by album (+ cascade delete)
  · is_published, sort_order — public gallery query
  · type — filter images vs videos

pages
  · page_key (unique) — fetch by key

announcements
  · slug (unique) — public route lookup
  · is_published, published_at — public feed query
  · is_pinned — pinned post query
  · type — filter by type

guides
  · slug (unique) — public route lookup
  · is_published, sort_order — public directory query
  · is_available — filter available guides
  · languages — GIN index (array search)
  · specialties — GIN index (array search)

bookings
  · booking_ref (unique) — status check lookup
  · guide_id — bookings by guide
  · status — filter by status
  · visitor_email — find visitor bookings
  · tour_date — date range filter
  · created_at — newest first sort

media_assets
  · cloudinary_id (unique) — dedup check
  · type — filter images vs videos
  · uploaded_by — assets by uploader

audit_logs
  · user_id — logs by user
  · module — logs by module
  · created_at — date range filter + newest first

DRIZZLE SCHEMA CONVENTIONS
============================
- All primary keys: uuid, defaultRandom()
- All timestamps: timestamp('...').defaultNow()
- All updated_at: must be manually set on every update
  (Drizzle does not auto-update — always pass new Date())
- All foreign keys: .references(() => table.id)
- Text arrays (PostgreSQL): text('...').array()
- JSONB fields: jsonb('...').default({}) or .default([])
- Enums: defined as plain text with app-level validation
  (no Postgres ENUM types — easier to migrate)
- Soft deletes: NOT used — hard delete with Cloudinary
  cleanup. Audit log preserves history instead.

MIGRATION STRATEGY
===================
- Use Drizzle Kit: `npm run db:generate` then `db:migrate`
- One migration file per schema change
- Never edit existing migration files
- Run migrations before deploy in CI pipeline
- scripts/seed-*.ts run after migration on first deploy:
  · seed-superadmin.ts
  · seed-pages.ts
  · seed-settings.ts
- All seed scripts are idempotent (safe to re-run)

DATA INTEGRITY RULES
=====================
1. hero_content, contact_info, site_settings:
   enforced single row via application logic (upsert)
   not DB constraint — simpler to manage

2. pages: exactly 3 rows enforced by seed script +
   no create endpoint exposed in API

3. bookings.guide_id: ON DELETE RESTRICT — must
   reassign or cancel bookings before deleting guide

4. gallery_items.album_id: ON DELETE CASCADE —
   deleting album wipes all its items automatically

5. announcements.is_pinned: only one true at a time —
   enforced in pinAnnouncement() server function,
   not DB constraint (avoids race conditions in UI)

6. sessions: cleaned up by Better Auth automatically.
   Add a cron job or startup task to purge expired rows
   older than 30 days.

BACKUP STRATEGY
================
- Daily automated PostgreSQL dump (pg_dump)
- Store backups in object storage (S3 or Cloudinary)
- Keep 30 days of daily backups
- Test restore monthly
- Cloudinary assets are inherently backed up by
  Cloudinary's infrastructure — no extra action needed


  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 SPEC BLOCK — Phase 7: API Architecture
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

API DESIGN PHILOSOPHY
======================
- TanStack Start server functions (not REST endpoints)
- Every function is fully typed: typed input, typed output
- Validation at server function boundary using Zod
- Errors thrown as typed AppError — never raw strings
- All mutations log to audit (fire-and-forget)
- Auth checked at middleware level — server functions
  trust that session exists, read role from context
- No business logic in UI components — only in server fns

ERROR HANDLING CONVENTION
==========================
class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public status: number
  ) {}
}

ErrorCode enum:
  NOT_FOUND          404  record does not exist
  UNAUTHORIZED       401  no valid session
  FORBIDDEN          403  wrong role
  VALIDATION_ERROR   422  zod validation failed
  CONFLICT           409  slug duplicate, pin conflict
  TERMINAL_STATUS    409  booking status is terminal
  UPLOAD_FAILED      500  Cloudinary error
  EMAIL_FAILED       500  Resend error (non-blocking)
  INTERNAL           500  unexpected error

Pattern in every server function:
  try {
    // validate input with zod
    // check preconditions
    // execute DB operation
    // fire audit log (non-blocking)
    // return typed result
  } catch (err) {
    if (err instanceof AppError) throw err
    throw new AppError('INTERNAL', err.message, 500)
  }

VALIDATION LIBRARY: Zod
========================
Every server function input validated with Zod schema.
Zod schemas co-located with server functions.
Shared schemas extracted to lib/validators/*.ts

SHARED VALIDATORS
──────────────────
lib/validators/common.ts
  uuidSchema        z.string().uuid()
  slugSchema        z.string().regex(/^[a-z0-9-]+$/)
  urlSchema         z.string().url()
  emailSchema       z.string().email()
  paginationSchema  z.object({
                      page: z.number().min(1).default(1),
                      perPage: z.number().min(1)
                               .max(100).default(20)
                    })

lib/validators/hero.ts
  heroInputSchema   z.object({
    badge_text:         z.string().max(100),
    headline:           z.string().max(100),
    headline_italic:    z.string().max(100),
    subheading:         z.string().max(500),
    cta_primary_text:   z.string().max(50),
    cta_primary_url:    z.string().max(500),
    cta_ghost_text:     z.string().max(50),
    cta_ghost_url:      z.string().max(500),
    background_image:   urlSchema.optional(),
    stat_1_number:      z.string().max(20),
    stat_1_label:       z.string().max(30),
    stat_2_number:      z.string().max(20),
    stat_2_label:       z.string().max(30),
    stat_3_number:      z.string().max(20),
    stat_3_label:       z.string().max(30),
    is_published:       z.boolean().default(false)
  })

lib/validators/attractions.ts
  attractionInputSchema z.object({
    title:        z.string().min(1).max(200),
    slug:         slugSchema.optional(),
    short_desc:   z.string().max(160),
    full_desc:    z.string(),
    image:        urlSchema.optional(),
    category:     z.enum(['Heritage','Wildlife',
                  'Spiritual','Culture',
                  'Shopping','History']),
    is_featured:  z.boolean().default(false),
    is_published: z.boolean().default(false),
    sort_order:   z.number().default(0)
  })

lib/validators/bookings.ts
  bookingInputSchema z.object({
    guide_id:         uuidSchema,
    visitor_name:     z.string().min(1).max(200),
    visitor_email:    emailSchema,
    visitor_phone:    z.string().max(30).optional(),
    visitor_country:  z.string().min(1).max(100),
    tour_date:        z.string().date()
                        .refine(d => new Date(d) > new Date(),
                        'Tour date must be in the future'),
    tour_duration:    z.enum(['Half Day','Full Day',
                              'Multi Day']),
    group_size:       z.number().min(1).max(50),
    special_requests: z.string().max(1000).optional()
  })

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLETE SERVER FUNCTION CONTRACTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT:
  functionName(input) → output
  Errors: [list of AppError codes that can be thrown]
  Auth:   role required

── server/hero.ts ──────────────────────────────────────

getHero()
  → HeroContent | null
  Errors: INTERNAL
  Auth:   public

upsertHero(input: HeroInput)
  → HeroContent
  Errors: VALIDATION_ERROR, INTERNAL
  Auth:   editor | superadmin

publishHero()
  → { success: true }
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

unpublishHero()
  → { success: true }
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

── server/attractions.ts ───────────────────────────────

getAttractions(filters?: {
  published?: boolean
  featured?: boolean
  category?: string
  limit?: number
})
  → Attraction[]
  Errors: INTERNAL
  Auth:   public (published only) | editor (all)

getAttractionBySlug(slug: string)
  → Attraction
  Errors: NOT_FOUND, INTERNAL
  Auth:   public

getAttractionById(id: string)
  → Attraction
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

createAttraction(input: AttractionInput)
  → Attraction
  Errors: VALIDATION_ERROR, CONFLICT (slug), INTERNAL
  Auth:   editor | superadmin

updateAttraction(id: string, input: Partial<AttractionInput>)
  → Attraction
  Errors: NOT_FOUND, VALIDATION_ERROR, CONFLICT, INTERNAL
  Auth:   editor | superadmin

deleteAttraction(id: string)
  → { success: true }
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

updateSortOrder(orderedIds: string[])
  → { success: true }
  Errors: VALIDATION_ERROR, INTERNAL
  Auth:   editor | superadmin

togglePublished(id: string)
  → { is_published: boolean }
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

toggleFeatured(id: string)
  → { is_featured: boolean }
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

── server/gallery.ts ───────────────────────────────────

getAlbums()
  → (GalleryAlbum & { item_count: number })[]
  Errors: INTERNAL
  Auth:   public (published only) | editor (all)

getAlbumById(id: string)
  → GalleryAlbum & { items: GalleryItem[] }
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

createAlbum(input: { title: string, description?: string })
  → GalleryAlbum
  Errors: VALIDATION_ERROR, INTERNAL
  Auth:   editor | superadmin

updateAlbum(id: string, input: Partial<AlbumInput>)
  → GalleryAlbum
  Errors: NOT_FOUND, VALIDATION_ERROR, INTERNAL
  Auth:   editor | superadmin

deleteAlbum(id: string)
  → { success: true, deleted_items: number }
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

reorderAlbums(orderedIds: string[])
  → { success: true }
  Errors: VALIDATION_ERROR, INTERNAL
  Auth:   editor | superadmin

uploadMediaItem(albumId: string, file: File)
  → GalleryItem
  Errors: NOT_FOUND, UPLOAD_FAILED, INTERNAL
  Auth:   editor | superadmin

updateMediaItem(id: string, input: {
  caption?: string
  alt_text?: string
  is_published?: boolean
})
  → GalleryItem
  Errors: NOT_FOUND, VALIDATION_ERROR, INTERNAL
  Auth:   editor | superadmin

deleteMediaItem(id: string)
  → { success: true }
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

reorderItems(albumId: string, orderedIds: string[])
  → { success: true }
  Errors: VALIDATION_ERROR, INTERNAL
  Auth:   editor | superadmin

setAlbumCover(albumId: string, itemId: string)
  → { cover_image: string }
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

bulkPublish(ids: string[], published: boolean)
  → { updated: number }
  Errors: VALIDATION_ERROR, INTERNAL
  Auth:   editor | superadmin

── server/pages.ts ─────────────────────────────────────

getPage(pageKey: 'about' | 'culture' | 'plan')
  → Page
  Errors: NOT_FOUND, INTERNAL
  Auth:   public (published only) | editor (draft too)

upsertPageContent(
  pageKey: string,
  input: { hero_image?: string, content: object }
)
  → Page
  Errors: NOT_FOUND, VALIDATION_ERROR, INTERNAL
  Auth:   editor | superadmin

publishPage(pageKey: string)
  → { success: true }
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

unpublishPage(pageKey: string)
  → { success: true }
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

── server/announcements.ts ─────────────────────────────

getAnnouncements(filters?: {
  type?: 'News' | 'Event' | 'Notice'
  published?: boolean
  page?: number
  perPage?: number
})
  → { items: Announcement[], total: number }
  Errors: INTERNAL
  Auth:   public (published only) | editor (all)

getAnnouncementBySlug(slug: string)
  → Announcement
  Errors: NOT_FOUND, INTERNAL
  Auth:   public

getAnnouncementById(id: string)
  → Announcement
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

getLatestAnnouncements(n: number)
  → Announcement[]
  Errors: INTERNAL
  Auth:   public

createAnnouncement(input: AnnouncementInput)
  → Announcement
  Errors: VALIDATION_ERROR, CONFLICT (slug), INTERNAL
  Auth:   editor | superadmin

updateAnnouncement(id: string, input: Partial<AnnouncementInput>)
  → Announcement
  Errors: NOT_FOUND, VALIDATION_ERROR, INTERNAL
  Auth:   editor | superadmin

deleteAnnouncement(id: string)
  → { success: true }
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

togglePublished(id: string)
  → { is_published: boolean, published_at: Date | null }
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

pinAnnouncement(id: string)
  → { success: true }
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin
  Note:   Unpins all others in same transaction

unpinAnnouncement(id: string)
  → { success: true }
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

── server/guides.ts ────────────────────────────────────

getGuides(filters?: {
  published?: boolean
  available?: boolean
  language?: string
  specialty?: string
  limit?: number
})
  → Guide[]
  Errors: INTERNAL
  Auth:   public (published only) | editor (all)

getGuideBySlug(slug: string)
  → Guide
  Errors: NOT_FOUND, INTERNAL
  Auth:   public

getGuideById(id: string)
  → Guide
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

createGuide(input: GuideInput)
  → Guide
  Errors: VALIDATION_ERROR, CONFLICT (slug), INTERNAL
  Auth:   editor | superadmin

updateGuide(id: string, input: Partial<GuideInput>)
  → Guide
  Errors: NOT_FOUND, VALIDATION_ERROR, INTERNAL
  Auth:   editor | superadmin

deleteGuide(id: string)
  → { success: true }
  Errors: NOT_FOUND, CONFLICT (has bookings), INTERNAL
  Auth:   editor | superadmin
  Note:   Throws CONFLICT if guide has any bookings

reorderGuides(orderedIds: string[])
  → { success: true }
  Errors: VALIDATION_ERROR, INTERNAL
  Auth:   editor | superadmin

togglePublished(id: string)
  → { is_published: boolean }
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

toggleAvailable(id: string)
  → { is_available: boolean }
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

getGuideBookingCount(id: string)
  → { count: number }
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

── server/contact.ts ───────────────────────────────────

getContactInfo()
  → ContactInfo | null
  Errors: INTERNAL
  Auth:   public (published only) | editor (draft too)

upsertContactInfo(input: ContactInput)
  → ContactInfo
  Errors: VALIDATION_ERROR, INTERNAL
  Auth:   editor | superadmin

publishContact()
  → { success: true }
  Errors: INTERNAL
  Auth:   editor | superadmin

unpublishContact()
  → { success: true }
  Errors: INTERNAL
  Auth:   editor | superadmin

── server/bookings.ts ──────────────────────────────────

getBookings(filters?: {
  status?: 'Pending'|'Confirmed'|'Declined'|'Cancelled'
  guide_id?: string
  date_from?: string
  date_to?: string
  page?: number
  perPage?: number
})
  → { items: Booking[], total: number }
  Errors: INTERNAL
  Auth:   editor | superadmin

getBookingById(id: string)
  → Booking & { guide: Guide }
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

getBookingByRef(ref: string, email: string)
  → { status: string, guide_name: string,
      tour_date: string, tour_duration: string,
      group_size: number, status_note: string | null }
  Errors: NOT_FOUND, INTERNAL
  Auth:   public

createBooking(input: BookingInput)
  → { booking_ref: string }
  Errors: VALIDATION_ERROR, NOT_FOUND (guide),
          INTERNAL
  Auth:   public

confirmBooking(id: string, note?: string)
  → { success: true }
  Errors: NOT_FOUND, TERMINAL_STATUS, INTERNAL
  Auth:   editor | superadmin
  Note:   Only from Pending status

declineBooking(id: string, note: string)
  → { success: true }
  Errors: NOT_FOUND, TERMINAL_STATUS,
          VALIDATION_ERROR (note required), INTERNAL
  Auth:   editor | superadmin
  Note:   Only from Pending status

cancelBooking(id: string, note: string)
  → { success: true }
  Errors: NOT_FOUND, TERMINAL_STATUS,
          VALIDATION_ERROR (note required), INTERNAL
  Auth:   editor | superadmin
  Note:   Only from Confirmed status

resendNotification(id: string)
  → { success: true, email_sent_to: string }
  Errors: NOT_FOUND, EMAIL_FAILED, INTERNAL
  Auth:   editor | superadmin

── server/media.ts ─────────────────────────────────────

getMediaAssets(filters?: {
  type?: 'image' | 'video'
  search?: string
  sort?: 'newest'|'oldest'|'largest'|'smallest'
  page?: number
  perPage?: number
})
  → { items: MediaAsset[], total: number }
  Errors: INTERNAL
  Auth:   editor | superadmin

getMediaAssetById(id: string)
  → MediaAsset
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

uploadMediaAsset(file: File, uploadedBy: string)
  → MediaAsset
  Errors: UPLOAD_FAILED, INTERNAL
  Auth:   editor | superadmin

updateAltText(id: string, altText: string)
  → MediaAsset
  Errors: NOT_FOUND, VALIDATION_ERROR, INTERNAL
  Auth:   editor | superadmin

markUsedIn(id: string, module: string)
  → { success: true }
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

unmarkUsedIn(id: string, module: string)
  → { success: true }
  Errors: NOT_FOUND, INTERNAL
  Auth:   editor | superadmin

deleteMediaAsset(id: string)
  → { success: true, was_in_use: boolean }
  Errors: NOT_FOUND, UPLOAD_FAILED, INTERNAL
  Auth:   editor | superadmin
  Note:   Warns if in use but allows deletion

bulkDeleteMediaAssets(ids: string[])
  → { deleted: number, failed: number }
  Errors: VALIDATION_ERROR, INTERNAL
  Auth:   editor | superadmin

── server/users.ts ─────────────────────────────────────

getUsers()
  → User[]  (passwords excluded)
  Errors: INTERNAL
  Auth:   superadmin

getUserById(id: string)
  → User  (password excluded)
  Errors: NOT_FOUND, INTERNAL
  Auth:   superadmin

createEditorAccount(input: {
  name: string
  email: string
  password: string
})
  → User
  Errors: VALIDATION_ERROR, CONFLICT (email), INTERNAL
  Auth:   superadmin
  Note:   Sends welcome email (non-blocking)

updateUser(id: string, input: {
  name?: string
  email?: string
  role?: 'editor' | 'superadmin'
})
  → User
  Errors: NOT_FOUND, VALIDATION_ERROR, CONFLICT, INTERNAL
  Auth:   superadmin

toggleUserActive(id: string)
  → { is_active: boolean }
  Errors: NOT_FOUND, FORBIDDEN (cannot deactivate self),
          INTERNAL
  Auth:   superadmin

sendPasswordReset(id: string)
  → { success: true }
  Errors: NOT_FOUND, EMAIL_FAILED, INTERNAL
  Auth:   superadmin

── server/audit.ts ─────────────────────────────────────

getAuditLogs(filters?: {
  user_id?: string
  module?: string
  date_from?: string
  date_to?: string
  page?: number
  perPage?: number
})
  → { items: AuditLog[], total: number }
  Errors: INTERNAL
  Auth:   superadmin

── server/settings.ts ──────────────────────────────────

getSettings()
  → SiteSettings
  Errors: INTERNAL
  Auth:   superadmin (full) | public (booking_enabled,
          maintenance_mode only via lib/settings.ts)

upsertSettings(input: Partial<SettingsInput>)
  → SiteSettings
  Errors: VALIDATION_ERROR, INTERNAL
  Auth:   superadmin

getBookingEnabled()
  → boolean
  Errors: INTERNAL
  Auth:   public (used in booking page)

getMaintenanceMode()
  → boolean
  Errors: INTERNAL
  Auth:   public (used in middleware)

RESPONSE TYPE EXPORTS
======================
lib/types.ts — exports all entity types:
  HeroContent, Attraction, GalleryAlbum, GalleryItem,
  Page, Announcement, Guide, ContactInfo, Booking,
  MediaAsset, User, AuditLog, SiteSettings, AppError

Every server function return type references lib/types.ts
Every UI component prop type references lib/types.ts
Single source of truth for all data shapes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 SPEC BLOCK — Phase 8: Frontend Architecture
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FOLDER STRUCTURE
=================
visit-harar/
├── app/
│   ├── (public)/                   public routes
│   │   ├── layout.tsx              public layout shell
│   │   ├── page.tsx                homepage
│   │   ├── about/page.tsx
│   │   ├── attractions/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── guides/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── gallery/
│   │   │   ├── page.tsx
│   │   │   └── [albumId]/page.tsx
│   │   ├── culture/page.tsx
│   │   ├── plan-your-trip/page.tsx
│   │   ├── news/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── contact/page.tsx
│   │   └── booking/
│   │       ├── page.tsx
│   │       └── status/page.tsx
│   ├── admin/                      protected admin routes
│   │   ├── layout.tsx              admin layout shell
│   │   ├── login/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── hero/page.tsx
│   │   ├── attractions/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── gallery/
│   │   │   ├── page.tsx
│   │   │   └── [albumId]/page.tsx
│   │   ├── pages/
│   │   │   ├── page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── culture/page.tsx
│   │   │   └── plan/page.tsx
│   │   ├── announcements/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── guides/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── bookings/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── media/page.tsx
│   │   ├── users/page.tsx
│   │   ├── audit/page.tsx
│   │   └── settings/page.tsx
│   └── sitemap.ts
├── components/
│   ├── public/                     public-facing components
│   │   ├── PublicNavbar.tsx
│   │   ├── PublicFooter.tsx
│   │   ├── PageHero.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── AttractionCard.tsx
│   │   ├── GuideCard.tsx
│   │   ├── AnnouncementCard.tsx
│   │   ├── AnnouncementsWidget.tsx
│   │   ├── GalleryThumb.tsx
│   │   ├── ComingSoon.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBoundary.tsx
│   ├── admin/                      admin-only components
│   │   ├── AdminSidebar.tsx
│   │   ├── AdminTopbar.tsx
│   │   ├── RichTextEditor.tsx      Tiptap wrapper
│   │   ├── MediaPicker.tsx         media library modal
│   │   ├── TagInput.tsx            tag-style array input
│   │   ├── ConfirmDialog.tsx       reusable confirm modal
│   │   ├── StatusBadge.tsx         booking status colors
│   │   ├── SortableList.tsx        dnd-kit wrapper
│   │   └── editors/
│   │       ├── AboutEditor.tsx
│   │       ├── CultureEditor.tsx
│   │       └── PlanEditor.tsx
│   └── ui/                         base UI primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Textarea.tsx
│       ├── Select.tsx
│       ├── Toggle.tsx
│       ├── Badge.tsx
│       ├── Card.tsx
│       ├── Modal.tsx
│       ├── Table.tsx
│       ├── Pagination.tsx
│       ├── Tabs.tsx
│       ├── DatePicker.tsx
│       └── Spinner.tsx
├── hooks/
│   ├── usePageEditor.ts            shared save/publish logic
│   ├── useMediaUpload.ts           upload progress tracking
│   ├── useSortable.ts              dnd-kit integration
│   ├── useConfirm.ts               programmatic confirm dialog
│   ├── useToast.ts                 toast notifications
│   └── useSession.ts               current user session
├── lib/
│   ├── auth.ts
│   ├── auth-client.ts
│   ├── cloudinary.ts
│   ├── cloudinary-url.ts
│   ├── email.ts
│   ├── slug.ts
│   ├── booking-ref.ts
│   ├── audit.ts
│   ├── audit-points.ts
│   ├── errors.ts
│   ├── types.ts
│   ├── metadata.ts
│   ├── settings.ts
│   ├── server-fn.ts
│   └── validators/
│       ├── common.ts
│       ├── hero.ts
│       ├── attractions.ts
│       ├── bookings.ts
│       ├── guides.ts
│       ├── announcements.ts
│       ├── contact.ts
│       └── media.ts
├── server/
│   ├── hero.ts
│   ├── attractions.ts
│   ├── gallery.ts
│   ├── pages.ts
│   ├── announcements.ts
│   ├── guides.ts
│   ├── contact.ts
│   ├── bookings.ts
│   ├── media.ts
│   ├── users.ts
│   ├── audit.ts
│   └── settings.ts
├── middleware/
│   ├── requireAuth.ts
│   └── maintenanceMode.ts
├── db/
│   ├── index.ts
│   └── indexes.sql
├── drizzle/
│   ├── schema/
│   │   ├── index.ts
│   │   ├── relations.ts
│   │   ├── users.ts
│   │   ├── hero.ts
│   │   ├── attractions.ts
│   │   ├── gallery.ts
│   │   ├── pages.ts
│   │   ├── announcements.ts
│   │   ├── guides.ts
│   │   ├── contact.ts
│   │   ├── bookings.ts
│   │   ├── media.ts
│   │   ├── audit.ts
│   │   └── settings.ts
│   └── migrations/
├── scripts/
│   ├── seed-superadmin.ts
│   ├── seed-pages.ts
│   ├── seed-settings.ts
│   └── run-all-seeds.ts
└── public/
    ├── favicon.ico
    ├── logo.svg
    └── og-default.jpg

DESIGN SYSTEM TOKENS
=====================
All design tokens defined in tailwind.config.ts
and referenced via CSS custom properties.

COLORS
───────
Primary green (Harar vegetation + Islamic heritage):
  brand-50:   #f0fdf4
  brand-100:  #dcfce7
  brand-500:  #2D6A3F   ← primary action color
  brand-600:  #1f5230   ← hover state
  brand-900:  #1a3a24   ← dark backgrounds

Accent gold (Harari architecture + warmth):
  gold-300:   #e8c97a
  gold-400:   #C8A96A   ← primary accent
  gold-500:   #a8893a   ← hover state

Neutrals:
  stone-50 → stone-950  ← all greys/text/borders

Status colors:
  amber-500   Pending bookings
  green-500   Confirmed bookings
  red-500     Declined bookings
  gray-400    Cancelled bookings

TYPOGRAPHY
───────────
Font stack (in tailwind.config.ts):
  serif:  ['Playfair Display', 'Georgia', 'serif']
          → headings, hero text, pull quotes
  sans:   ['Outfit', 'system-ui', 'sans-serif']
          → body, UI, admin interface

Type scale (Tailwind defaults, key sizes):
  text-xs:    11px  → labels, badges, meta
  text-sm:    13px  → body small, table cells
  text-base:  15px  → body default
  text-lg:    18px  → section intros
  text-2xl:   24px  → section headings
  text-4xl:   36px  → page titles
  text-5xl:   48px  → hero headline

SPACING SYSTEM
───────────────
Tailwind default spacing scale.
Key layout values:
  Public content max-width:  1280px  (max-w-7xl)
  Admin content max-width:   1440px  (max-w-screen-xl)
  Section vertical padding:  py-16 (desktop), py-10 (mobile)
  Card padding:              p-6
  Form field gap:            gap-6
  Admin sidebar width:       240px  (w-60)

ADMIN LAYOUT SHELL
===================
app/admin/layout.tsx
  ├── AdminSidebar (fixed left, w-60)
  │   ├── Logo + site name
  │   ├── Nav sections:
  │   │   ├── CONTENT
  │   │   │   ├── Dashboard      /admin/dashboard
  │   │   │   ├── Hero           /admin/hero
  │   │   │   ├── Attractions    /admin/attractions
  │   │   │   ├── Gallery        /admin/gallery
  │   │   │   ├── Pages          /admin/pages
  │   │   │   ├── Announcements  /admin/announcements
  │   │   │   ├── Guides         /admin/guides
  │   │   │   └── Contact        /admin/contact
  │   │   ├── BOOKINGS
  │   │   │   └── Bookings       /admin/bookings
  │   │   ├── MEDIA
  │   │   │   └── Media Library  /admin/media
  │   │   └── SYSTEM (superadmin only)
  │   │       ├── Users          /admin/users
  │   │       ├── Audit Log      /admin/audit
  │   │       └── Settings       /admin/settings
  │   └── Bottom: user name, role badge, logout button
  └── Main content area (ml-60, full height)
      ├── AdminTopbar
      │   ├── Page title (dynamic per route)
      │   ├── Breadcrumb
      │   └── Primary action button (context-aware)
      └── <Outlet /> (page content)

ADMIN SIDEBAR BEHAVIOR
───────────────────────
- Always visible on desktop (≥1024px)
- Collapsible on tablet (768px–1023px):
  collapses to icon-only mode (w-16)
- Hidden on mobile (<768px):
  hamburger in topbar opens slide drawer
- Active route highlighted with brand-500 background
- SYSTEM section hidden from editor role entirely
- Pending bookings count badge on Bookings nav item
  (fetched on layout load, refetch every 60s)

STATE MANAGEMENT PATTERNS
==========================
1. SERVER STATE → TanStack Query
   - All data fetching: useQuery()
   - All mutations: useMutation() + optimistic updates
   - Cache invalidation after mutations
   - Stale time: 30s for lists, 60s for single records
   - Retry: 2 attempts on failure

2. FORM STATE → React Hook Form
   - All admin forms use useForm()
   - Validation: Zod resolver (@hookform/resolvers/zod)
   - Dirty state tracking for unsaved changes warning
   - Field-level error display

3. UI STATE → local useState
   - Modals open/close
   - Step tracking in booking form
   - Tab selection
   - Mobile menu open/close

4. GLOBAL STATE → React Context
   - SessionContext: current user + role
   - ToastContext: toast notification queue
   - SettingsContext: site_settings (layout-level fetch)

SHARED HOOKS
=============
useSession()
  Returns: { user, role, isLoading }
  Source:  Better Auth client session
  Used:    Admin layout, permission checks

useToast()
  Returns: { toast, dismiss }
  Usage:   toast({ title, description, variant })
  Variants: success | error | warning | info
  Position: bottom-right, auto-dismiss 4s

useConfirm()
  Returns: confirm(message, options) → Promise<boolean>
  Usage:   const ok = await confirm('Delete this?')
  Renders: ConfirmDialog modal imperatively

usePageEditor(pageKey)
  Returns: { content, isDirty, isSaving,
             isPublishing, saveDraft, publish }
  Used by: AboutEditor, CultureEditor, PlanEditor

useMediaUpload()
  Returns: { upload, progress, isUploading, error }
  Usage:   Inside MediaPicker upload tab
  Tracks:  Per-file upload progress (0–100)

useSortable(items, onReorder)
  Returns: { sortableItems, dragHandleProps }
  Wraps:   @dnd-kit/sortable
  Usage:   All drag-and-drop list/grid components

COMPONENT PATTERNS
===================
1. DATA COMPONENTS (fetch their own data)
   - Page-level components (app/admin/*/page.tsx)
   - Homepage sections (fetch via server props)
   - Never fetch inside deeply nested components

2. PRESENTATIONAL COMPONENTS (props only)
   - All components/public/* except widgets
   - All components/ui/*
   - AttractionCard, GuideCard, AnnouncementCard

3. CONTAINER COMPONENTS (orchestrate state + data)
   - AnnouncementsWidget (fetches + renders)
   - MediaPicker (fetches assets + handles selection)
   - SortableList (manages DnD + calls reorder fn)

UNSAVED CHANGES GUARD
======================
All admin forms implement:
  useBeforeUnload(isDirty)
  → shows browser "Leave page?" dialog if form is dirty
  → cleared on successful save or explicit discard

TOAST NOTIFICATIONS
====================
Every mutation shows a toast:
  Success: green  "Attraction published successfully"
  Error:   red    "Failed to save — please try again"
  Warning: amber  "This guide has active bookings"
  Info:    blue   "Draft saved"

Toasts replace all alert() and confirm() calls.
ConfirmDialog used for destructive actions only.

LOADING STATES
===============
Three patterns used consistently:

1. Page-level skeleton
   → shown while SSR data loads on first visit
   → skeleton matches layout of loaded content

2. Button loading spinner
   → shown on submit/save/publish buttons
   → button disabled + shows Spinner during mutation

3. Inline spinner
   → shown inside table cells for toggle operations
   → replaces toggle switch during DB update

IMAGE RENDERING RULES
======================
Public pages:
  All images via Next/Image equivalent in TanStack Start
  All Cloudinary URLs through optimizeImage()
  Always provide width, height, alt props
  Lazy load below fold, eager load above fold

Admin pages:
  Thumbnails: Cloudinary URL + ?w=200&h=200&c=fill
  Previews:   Cloudinary URL + ?w=800&q=auto
  Always show placeholder if no image set

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 SPEC BLOCK — Phase 9: Development Workflow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PREREQUISITES
==============
Install these before anything else:
  Node.js       v20.x LTS (use nvm)
  PostgreSQL    v16.x (local install or Docker)
  Git           latest
  VS Code       recommended editor

Recommended VS Code extensions:
  - Tailwind CSS IntelliSense
  - Drizzle ORM (schema highlighting)
  - Prettier
  - ESLint
  - GitLens

ENVIRONMENT VARIABLES
======================
Create .env at project root.
Never commit .env — only commit .env.example

.env.example (commit this):
─────────────────────────────
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/visit_harar

# Auth
BETTER_AUTH_SECRET=your-32-char-random-secret
BETTER_AUTH_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Resend (email)
RESEND_API_KEY=re_your-api-key
RESEND_FROM_EMAIL=noreply@visitharar.gov.et

# Super Admin Seed
SUPERADMIN_EMAIL=admin@visitharar.gov.et
SUPERADMIN_PASSWORD=change-this-immediately

# App
NODE_ENV=development
APP_URL=http://localhost:3000
─────────────────────────────

How to get each value:
  DATABASE_URL    → local PostgreSQL connection string
  BETTER_AUTH_SECRET → run: openssl rand -base64 32
  CLOUDINARY_*    → cloudinary.com → Dashboard → API Keys
  RESEND_API_KEY  → resend.com → API Keys → Create Key
  SUPERADMIN_*    → choose your own credentials

FROM-ZERO SETUP SEQUENCE
=========================
Follow this exact order. Do not skip steps.

STEP 1 — Clone and install
  git clone <your-repo-url> visit-harar
  cd visit-harar
  npm install

STEP 2 — Environment setup
  cp .env.example .env
  → fill in all values in .env

STEP 3 — Database creation
  psql -U postgres
  CREATE DATABASE visit_harar;
  \q

STEP 4 — Run migrations
  npm run db:generate
  npm run db:migrate

STEP 5 — Run indexes
  psql -U postgres -d visit_harar -f db/indexes.sql

STEP 6 — Seed database
  npm run db:seed
  → runs seed-superadmin, seed-pages, seed-settings

STEP 7 — Start dev server
  npm run dev
  → open http://localhost:3000

STEP 8 — Verify setup
  □ http://localhost:3000          public homepage loads
  □ http://localhost:3000/admin/login  login page loads
  □ Login with SUPERADMIN_EMAIL + SUPERADMIN_PASSWORD
  □ /admin/dashboard              dashboard renders
  □ /admin/hero                   hero editor loads
  □ Drizzle Studio: npm run db:studio → check all tables

STEP 9 — First content entry
  □ Go to /admin/hero → fill in hero fields → publish
  □ Go to http://localhost:3000 → hero renders from DB
  □ Confirm CMS is working end-to-end

NPM SCRIPTS
============
package.json scripts section:

Development:
  "dev":           "vinxi dev"
  "build":         "vinxi build"
  "start":         "vinxi start"
  "preview":       "npm run build && npm run start"

Database:
  "db:generate":   "drizzle-kit generate"
  "db:migrate":    "drizzle-kit migrate"
  "db:push":       "drizzle-kit push"
  "db:studio":     "drizzle-kit studio"
  "db:seed":       "tsx scripts/run-all-seeds.ts"
  "db:reset":      "tsx scripts/reset-db.ts"

Code quality:
  "lint":          "eslint . --ext .ts,.tsx"
  "lint:fix":      "eslint . --ext .ts,.tsx --fix"
  "typecheck":     "tsc --noEmit"
  "format":        "prettier --write ."

scripts/reset-db.ts (development only):
  → drops all tables
  → re-runs migrations
  → re-runs all seeds
  → NEVER run in production
  → guarded: throws if NODE_ENV !== 'development'

GIT STRATEGY
=============
Branch structure:
  main          production-ready code only
  develop       integration branch
  feature/*     individual feature branches
  fix/*         bug fix branches

Branch naming:
  feature/auth-system
  feature/hero-manager
  feature/attractions-crud
  feature/booking-system
  fix/hero-image-upload

Commit message format (conventional commits):
  feat:     new feature
  fix:      bug fix
  chore:    tooling, config, deps
  style:    formatting only
  refactor: restructure without behavior change
  docs:     documentation only

Examples:
  feat(auth): add login page with role-based redirect
  feat(hero): add live preview to hero editor
  fix(bookings): prevent double submission on booking form
  chore(deps): upgrade drizzle-orm to 0.32.0

Workflow per chunk:
  git checkout develop
  git checkout -b feature/chunk-1-1-project-scaffold
  → build the chunk
  → verify DONE condition
  git add .
  git commit -m "feat(scaffold): initialize project"
  git checkout develop
  git merge feature/chunk-1-1-project-scaffold
  git branch -d feature/chunk-1-1-project-scaffold

CHUNK EXECUTION WORKFLOW
=========================
This is how you use the AI prompts from Phase 5:

FOR EACH CHUNK:
  1. Open a new AI conversation (Claude Code or similar)
  2. Paste this header at the top:
     ─────────────────────────────────────────
     PROJECT: Visit Harar — CMS Tourism Website
     STACK: TanStack Start, Node.js, PostgreSQL,
            Drizzle ORM, Better Auth, Cloudinary,
            Tailwind CSS, TanStack Query
     CURRENT CHUNK: [chunk ID and title]
     ALL PREVIOUS CHUNKS ARE COMPLETE.
     ─────────────────────────────────────────
  3. Paste the relevant module spec from Phase 4
  4. Paste the chunk task and file list from Phase 5
  5. Paste the relevant API contracts from Phase 7
  6. End with:
     "Output all files with full working code.
      No placeholders. No TODOs. No // implement this.
      Every function must be complete and runnable."
  7. Copy output files into your project
  8. Run: npm run typecheck (fix any type errors)
  9. Run: npm run lint:fix (fix any lint errors)
  10. Test the DONE condition manually
  11. Commit and move to next chunk

WHAT TO DO WHEN AI OUTPUT HAS ERRORS
======================================
TypeScript errors:
  → Run: npm run typecheck
  → Copy errors back to same AI conversation
  → Ask: "Fix these TypeScript errors: [paste errors]"

Runtime errors:
  → Copy full error stack trace
  → Ask: "I got this error running [chunk]: [paste error]"
  → Do not start next chunk until current chunk works

Missing imports:
  → Check lib/types.ts — type may need to be added
  → Check drizzle/schema/index.ts — table may not
    be exported yet

DB migration errors:
  → Run: npm run db:studio (inspect table state)
  → If schema mismatch: npm run db:push (dev only)
  → Never edit existing migration files

TESTING STRATEGY
=================
No automated tests in v1 (keeps scope tight for demo).
Manual testing per chunk using DONE conditions.

Manual test checklist per feature area:

Auth:
  □ Login with correct credentials → dashboard
  □ Login with wrong credentials → error message
  □ Access /admin/hero without login → redirects
  □ Editor cannot access /admin/users → 403

Hero:
  □ Fill all fields → Save Draft → not live on public
  □ Publish → hero appears on homepage
  □ Change image → old image replaced
  □ Preview matches public render exactly

Attractions:
  □ Create attraction → appears in admin list
  □ Unpublished → not visible on public /attractions
  □ Publish → visible on public
  □ Drag reorder → order persists after refresh
  □ Delete → removed from DB + Cloudinary

Bookings:
  □ Submit booking form → booking_ref shown to visitor
  □ Bureau email received with booking details
  □ Admin confirms → visitor email received
  □ Admin declines with note → visitor email received
  □ Status check page → correct status shown

DEPLOYMENT CHECKLIST (for when you're ready)
=============================================
This is for future reference — build locally first.

Pre-deploy:
  □ All 47 chunks complete and tested
  □ npm run typecheck → 0 errors
  □ npm run lint → 0 errors
  □ npm run build → builds without errors
  □ All .env values set in production environment
  □ SUPERADMIN_PASSWORD changed from default

Deploy targets (recommended):
  App server:   Railway or Render (Node.js support)
  Database:     Railway PostgreSQL or Supabase
  Media:        Cloudinary (already configured)
  Domain:       visitharar.gov.et (when approved)

Post-deploy:
  □ Run migrations: npm run db:migrate
  □ Run seeds: npm run db:seed
  □ Run indexes: psql ... -f db/indexes.sql
  □ Test login as superadmin
  □ Test one full booking end-to-end
  □ Test maintenance mode toggle
  □ Confirm all emails send correctly

DAILY DEVELOPMENT ROUTINE
===========================
Start of session:
  cd visit-harar
  git pull origin develop
  npm install (if package.json changed)
  npm run dev

During development:
  → Work one chunk at a time
  → Verify DONE condition before next chunk
  → Commit after each successful chunk
  → Run typecheck before committing

End of session:
  git push origin feature/[current-chunk]
  → note which chunk you're on
  → note any blockers for next session