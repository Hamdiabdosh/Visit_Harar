# Deploy Visit Harar — Coolify

## Overview

| Service        | Role                                              |
| -------------- | ------------------------------------------------- |
| **Coolify**    | Hosts the TanStack Start app (Docker + Nitro)     |
| **PostgreSQL** | Coolify managed DB, or external (Supabase, etc.)  |
| **Local disk** | Uploaded images and video (`UPLOAD_DIR` volume)   |
| **Resend**     | Auth reset and booking emails                     |

The app builds with Nitro’s **`node-server`** preset for Docker. Vercel deploys use `NITRO_PRESET=vercel` (see [Vercel section](#vercel-alternative) below).

**Production domain:** `https://visitharar.raafat.site`  
Use `https://` if Coolify SSL is enabled (default). All three URL variables must match exactly.

Copy-paste template: [`coolify.env.example`](./coolify.env.example)

---

## 1. PostgreSQL

### Option A — Coolify managed Postgres (recommended)

1. In Coolify → **Resources → Databases → Add** → PostgreSQL 16.
2. Note the internal connection URL (hostname is usually the service name, e.g. `postgres` or a Coolify-generated host).
3. Use the **direct** connection string (not a pooler) — the Node server keeps a small connection pool.

```text
postgresql://postgres:PASSWORD@HOST:5432/visit_harar
```

### Option B — External Postgres (Supabase, etc.)

Use the **direct** URI (`:5432`), not the transaction pooler. Pooler URLs are for serverless (Vercel); this app runs as a long-lived Node process.

---

## 2. Database setup (run once)

From your machine (or a one-off Coolify “Execute Command” container with network access to the DB):

```bash
cd frontend
cp .env.example .env
# Set DATABASE_URL to your production Postgres URI

bun install
bun run db:migrate
psql "$DATABASE_URL" -f db/indexes.sql
bun run db:seed   # first deploy only; uses SUPERADMIN_* from env
```

---

## 3. Coolify application

### Create the service

1. Coolify → **Projects** → your project → **Add Resource** → **Application**.
2. Connect your Git repository.
3. **Base Directory**: `frontend`
4. **Build Pack**: Dockerfile (auto-detected from `frontend/Dockerfile`).
5. **Port**: `3000` (must match `EXPOSE` in the Dockerfile).
6. **Domain**: `visitharar.raafat.site` (enable SSL in Coolify).
7. **Persistent storage**: mount a volume at `/data/uploads` so media survives redeploys.

### Build-time variables

Set these under **Build Variables** (they are embedded in the client bundle):

| Variable       | Value                                  |
| -------------- | -------------------------------------- |
| `VITE_APP_URL` | `https://visitharar.raafat.site`       |

`NITRO_PRESET` defaults to `node-server` in the Dockerfile — do not change unless you know why.

### Runtime environment variables

| Variable                | Notes                                                    |
| ----------------------- | -------------------------------------------------------- |
| `DATABASE_URL`          | Direct Postgres URI                                      |
| `BETTER_AUTH_SECRET`    | `openssl rand -base64 32` — unique for production        |
| `BETTER_AUTH_URL`       | `https://visitharar.raafat.site`                         |
| `APP_URL`               | `https://visitharar.raafat.site`                         |
| `NODE_ENV`              | `production`                                             |
| `HOST`                  | `0.0.0.0` (set in Dockerfile; override only if needed) |
| `PORT`                  | `3000` (Coolify may inject this automatically)           |
| `UPLOAD_DIR`            | `/data/uploads` — must match the mounted volume path     |
| `RESEND_API_KEY`        |                                                          |
| `RESEND_FROM_EMAIL`     | Verified domain (e.g. `noreply@visitharar.gov.et`)       |
| `SUPERADMIN_EMAIL`      | Used only when running `db:seed`                         |
| `SUPERADMIN_PASSWORD`   | Strong password; rotate from dev defaults                |
| `SUPERADMIN_NAME`       | Optional                                                 |

Do **not** commit `.env`. Rotate any secrets used in development.

### Deploy

Push to the connected branch, or click **Deploy** in Coolify.

Coolify builds the Docker image, runs `bun run build` inside the builder stage, and starts `node dist/server/index.mjs`.

---

## 4. Custom domain

1. Add the domain in Coolify and configure DNS (A/AAAA or CNAME per Coolify instructions).
2. Set `BETTER_AUTH_URL`, `APP_URL`, and **rebuild** with `VITE_APP_URL` = `https://visitharar.raafat.site`.
3. Redeploy so the client bundle picks up the public URL.

---

## 5. Post-deploy checks

- [ ] Homepage loads: hero, featured attractions, news, guides, gallery.
- [ ] `/admin/login` with seeded superadmin.
- [ ] `/admin/media` — upload an image; copy URL works.
- [ ] Edit an attraction; entry appears in `/admin/audit`.
- [ ] Create an editor in `/admin/users`; welcome email arrives (Resend).
- [ ] Forgot password email (Resend).
- [ ] Submit a test booking; bureau email arrives.
- [ ] Contact inquiry form sends bureau email.
- [ ] Maintenance toggle in `/admin/settings` shows public maintenance page.
- [ ] No database connection errors in Coolify logs.

---

## 6. Troubleshooting

| Issue                          | Fix                                                                 |
| ------------------------------ | ------------------------------------------------------------------- |
| Build fails during prerender   | `vite.config.ts` sets `preview.host: 127.0.0.1` for Docker builds.  |
| `DATABASE_URL is not set`      | Add runtime env var in Coolify; redeploy.                           |
| Auth redirects wrong host      | Align `BETTER_AUTH_URL`, `APP_URL`, and `VITE_APP_URL` (rebuild).   |
| Emails not sent                | Verify Resend domain; check container logs.                         |
| Upload fails                   | Check `UPLOAD_DIR` is writable; confirm volume is mounted at `/data/uploads`. |
| Container unhealthy            | Ensure port `3000` is exposed; check logs for startup errors.       |

---

## Local production smoke test

```bash
cd frontend
docker compose -f docker-compose.prod.yml up --build
```

Requires a `.env` with `POSTGRES_PASSWORD`, `VITE_APP_URL`, `APP_URL`, `BETTER_AUTH_URL`, and `BETTER_AUTH_SECRET`.

---

## Vercel alternative

For Vercel + Supabase serverless deploy, set `NITRO_PRESET=vercel` in the Vercel build environment and use the Supabase **transaction pooler** (`6543`, `pgbouncer=true`) for `DATABASE_URL`. See `vercel.json` for install/build commands.

---

## Local dev vs production

|              | Local                    | Coolify                         |
| ------------ | ------------------------ | ------------------------------- |
| Postgres     | Docker `5434`            | Coolify DB or external direct   |
| App URL      | `http://localhost:8080`  | `https://visitharar.raafat.site` |
| Nitro preset   | `node-server` (default)  | `node-server` (Dockerfile)      |
| Media storage  | `./uploads` (local)      | `/data/uploads` (volume)        |
| Start          | `bun run dev`            | `node dist/server/index.mjs`    |

See [SETUP.md](./SETUP.md) for local development.
