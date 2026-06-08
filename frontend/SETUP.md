# Visit Harar — Local Setup

## Prerequisites

- Node.js 20+ or Bun
- PostgreSQL 16

## Auth note

The spec describes custom `users` / `sessions` tables. This project uses **Better Auth** tables (`user`, `session`, `account`, `verification`) with extra fields `role` and `is_active`. CMS foreign keys reference `user.id`.

## Steps

1. **Install dependencies**

   ```bash
   cd frontend
   bun install
   ```

2. **Environment**

   ```bash
   cp .env.example .env
   ```

   Fill in `DATABASE_URL`, `BETTER_AUTH_SECRET` (`openssl rand -base64 32`), `SUPERADMIN_*`, and optionally `RESEND_*` for password reset.

3. **Start PostgreSQL (recommended)**

   ```bash
   cd frontend
   docker compose up -d
   bun run db:check
   ```

   This runs Postgres on **localhost:5434** (see `docker-compose.yml`).  
   Your `.env` must use:

   `DATABASE_URL=postgresql://postgres:postgres@localhost:5434/visit_harar`

   If you see `Failed query ... hero_content`, the DB is usually **not running** or `.env` points at the wrong port (e.g. `5432` without the Visit Harar schema).

4. **Migrate**

   ```bash
   bun run db:push
   # or: bun run db:generate && bun run db:migrate
   ```

5. **Indexes**

   ```bash
   psql "$DATABASE_URL" -f db/indexes.sql
   ```

6. **Seed**

   ```bash
   bun run db:seed
   ```

7. **Run dev**

   ```bash
   bun run dev
   ```

   Open the URL Vite prints (often http://localhost:8080) and `/admin/login`.
   Set `BETTER_AUTH_URL` and `APP_URL` to match that port.

## Verify

- Public homepage loads (mock content until Phase C)
- `/admin/hero` redirects to login when logged out
- Login with `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD`
- `bun run db:studio` shows all tables

## Hero CMS (Phase C)

- Open `/admin/hero`, edit fields, click **Publish**
- Visit `/` — homepage hero should match the published content from the database
- **Save Draft** stores content with `is_published = false` (public site keeps showing the last published hero, or defaults if none)
- Image upload requires `CLOUDINARY_*` in `.env` (from [Cloudinary Dashboard](https://console.cloudinary.com/) → API Keys). Photos are resized in the browser before upload. You can also paste an image URL directly if upload fails.

## Production (Vercel + Supabase)

See **[DEPLOY.md](./DEPLOY.md)** for full steps: Supabase pooler URL, Vercel env vars, migrations, and custom domain.

Local dev uses Docker Postgres on port **5434**. Production uses Supabase with the **transaction pooler** connection string on Vercel.
