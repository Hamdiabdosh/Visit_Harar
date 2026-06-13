# Visit Harar — Web app

TanStack Start application: public tourism site, admin CMS, and `/api/v1` for mobile clients.

## Layout

```
apps/web/
├── src/
│   ├── routes/          # File-based routes (public + /admin)
│   ├── components/      # UI + layout
│   └── lib/             # Server functions, validators, API handlers
├── public/              # Static assets, PWA service worker
├── vite.config.ts
└── package.json
```

## Commands

Run from repo root:

```bash
bun run dev          # dev server
bun run build        # production build → apps/web/dist/
bun run start        # node apps/web/dist/server/index.mjs
```

Or from this directory:

```bash
bun run dev
bun run build
```

## Shared infrastructure (repo root)

- **`drizzle/`** — schema and migrations
- **`db/`** — PostgreSQL client
- **`.env`** — loaded from repo root (DATABASE_URL, auth, Resend, etc.)

Web server code imports the database via relative paths (`../../../../db`, `../../../../drizzle` from `src/lib/`).
