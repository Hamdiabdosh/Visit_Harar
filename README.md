# Visit Harar

Tourism platform for Harar — a public site for visitors and an admin CMS for the Harari Tourism Commission to manage content, bookings, and media.

**Production:** [visitharar.et](https://visitharar.et)

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
Visit_Harar/
├── apps/
│   ├── web/           # TanStack Start — public site, admin CMS, /api/v1
│   └── flutter/       # Native mobile app
├── packages/
│   ├── shared/        # Shared TS types
│   └── api-client/    # Typed API client
├── drizzle/           # Database schema and migrations
├── db/                # Database client
├── scripts/           # Seed and utility scripts
├── Dockerfile         # Production Docker build
├── docker-compose.yml # Coolify production stack
├── SETUP.md           # Local development guide
└── DEPLOY.md          # Coolify / production deployment
```

## Quick start

Prerequisites: Node.js 20+ or Bun, Docker (for local Postgres).

```bash
bun install
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d
bun run db:push
psql "$DATABASE_URL" -f db/indexes.sql
bun run db:seed
bun run dev
```

Open the URL Vite prints (typically `http://localhost:8080`) and sign in at `/admin/login` with the credentials from `SUPERADMIN_*` in your `.env`.

See [SETUP.md](./SETUP.md) for full local setup details.

## Deployment

Production runs as a Docker Compose stack on Coolify (app + Postgres) with a persistent volume for uploaded media.

See [DEPLOY.md](./DEPLOY.md) for Coolify configuration, environment variables, and troubleshooting.

## Scripts

| Command             | Description              |
| ------------------- | ------------------------ |
| `bun run dev`       | Start development server |
| `bun run build`     | Production build         |
| `bun run start`     | Run production server    |
| `bun run db:seed`   | Seed database            |
| `bun run db:studio` | Open Drizzle Studio      |
| `bun run lint`      | Run ESLint               |

## License

Private project.
