# Visit Harar

Tourism platform for Harar — a public site for visitors and an admin CMS for the bureau to manage content, bookings, and media.

**Production:** [visitharar.raafat.site](https://visitharar.raafat.site)

## Features

### Public site

- Homepage with hero, featured attractions, news, guides, and gallery
- Attraction and guide detail pages
- Photo gallery and culture pages
- Tour booking flow with email notifications
- Contact inquiry form

### Admin CMS

- Content management for hero, attractions, guides, gallery, announcements, and static pages
- Media library with local file storage
- Booking management and status tracking
- User roles (superadmin, editor) with Better Auth
- Audit log, site settings, and maintenance mode

## Tech stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Framework  | TanStack Start (React 19 + Nitro)   |
| Database   | PostgreSQL 16, Drizzle ORM          |
| Auth       | Better Auth                         |
| UI         | Tailwind CSS, Radix UI              |
| Email      | Resend                              |
| Deploy     | Docker / Coolify (primary), Vercel  |

## Project structure

```
Visit-Harar/
├── frontend/          # TanStack Start application
│   ├── src/           # Routes, components, server logic
│   ├── drizzle/       # Database schema and migrations
│   ├── scripts/       # Seed and utility scripts
│   ├── Dockerfile     # Production Docker build
│   ├── SETUP.md       # Local development guide
│   └── DEPLOY.md      # Coolify / production deployment
└── docs/              # Additional documentation
```

## Quick start

Prerequisites: Node.js 20+ or Bun, Docker (for local Postgres).

```bash
cd frontend
bun install
cp .env.example .env
docker compose up -d
bun run db:push
psql "$DATABASE_URL" -f db/indexes.sql
bun run db:seed
bun run dev
```

Open the URL Vite prints (typically `http://localhost:8080`) and sign in at `/admin/login` with the credentials from `SUPERADMIN_*` in your `.env`.

See [frontend/SETUP.md](./frontend/SETUP.md) for full local setup details.

## Deployment

Production runs as a Docker container on Coolify with a PostgreSQL database and a persistent volume for uploaded media.

See [frontend/DEPLOY.md](./frontend/DEPLOY.md) for Coolify configuration, environment variables, and troubleshooting.

## Scripts

Run from the `frontend/` directory:

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `bun run dev`      | Start development server       |
| `bun run build`    | Production build               |
| `bun run start`    | Run production server          |
| `bun run db:seed`  | Seed database                  |
| `bun run db:studio`| Open Drizzle Studio            |
| `bun run lint`     | Run ESLint                     |

## License

Private project.
