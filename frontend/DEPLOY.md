# Deploy Visit Harar — Coolify

## Overview

| Service     | Role                                                    |
| ----------- | ------------------------------------------------------- |
| **Coolify** | Runs `docker-compose.yml` (app + bundled Postgres)      |
| **Resend**  | Auth reset and booking emails (optional until configured) |

The compose stack builds the app with Nitro’s **`node-server`** preset. Vercel deploys use `NITRO_PRESET=vercel` (see [Vercel section](#vercel-alternative) below).

**Production domain:** `https://visitharar.raafat.site`

Copy-paste template: [`coolify.env.example`](./coolify.env.example)

---

## 1. Coolify application (Docker Compose)

### Create the service

1. Coolify → **Projects** → your project → **Add Resource** → **Application**.
2. Connect your Git repository.
3. **Base Directory**: `frontend`
4. **Build Pack**: **Docker Compose** (uses `frontend/docker-compose.yml`).
5. **Domain**: add `visitharar.raafat.site` on the **app** service (enable SSL).
6. No separate Postgres resource needed — compose includes a `postgres` service and wires `DATABASE_URL` automatically.

### What compose handles for you

| Concern        | Handled by `docker-compose.yml`                          |
| -------------- | -------------------------------------------------------- |
| Postgres       | `postgres` service on the internal network               |
| `DATABASE_URL` | Built as `postgresql://postgres:…@postgres:5432/visit_harar` |
| App port       | `3000` via `SERVICE_FQDN_APP_3000` (Coolify magic var)   |
| Uploads        | Named volume `uploads` at `/data/uploads`                |
| Health check   | `GET /health` (no database required)                     |

Do **not** set `DATABASE_URL` in Coolify — it would be redundant and easy to get wrong.

### Environment variables in Coolify

Only set what you need. Optional vars can be omitted entirely; template placeholders like `re_your-api-key` are ignored at runtime.

| Variable             | Required | Build-time? | Notes                                              |
| -------------------- | -------- | ----------- | -------------------------------------------------- |
| `POSTGRES_PASSWORD`  | Recommended | No       | Shared by postgres + app; change from default      |
| `BETTER_AUTH_SECRET` | Yes      | No          | `openssl rand -base64 32`                          |
| `VITE_APP_URL`       | Recommended | **Yes**  | `https://visitharar.raafat.site` — embedded in client bundle |
| `RESEND_API_KEY`     | No       | No          | Omit until Resend is ready                         |
| `RESEND_FROM_EMAIL`  | No       | No          | Omit until Resend is ready                         |
| `APP_URL`            | No       | No          | Coolify sets via `SERVICE_URL_APP` when domain is configured |
| `BETTER_AUTH_URL`    | No       | No          | Defaults to `SERVICE_URL_APP`                      |

**Only `VITE_APP_URL` should be marked “Available at Buildtime”.**  
Do **not** mark `NODE_ENV`, `POSTGRES_PASSWORD`, or secrets as build-time — that skips devDependencies and breaks the Docker build.

Remove any previously set `DATABASE_URL` from Coolify env vars.

### Deploy

Push to the connected branch, or click **Deploy** in Coolify.

Coolify runs `docker compose up`, builds the app image, starts Postgres, then the app.

---

## 2. Database setup (run once)

After the first successful deploy, run migrations from your machine or a Coolify exec shell on the **app** container:

```bash
cd frontend
# Use the same POSTGRES_PASSWORD as in Coolify (default: visit-harar)
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@postgres:5432/visit_harar"

bun install
bun run db:migrate
psql "$DATABASE_URL" -f db/indexes.sql
bun run db:seed   # first deploy only; uses SUPERADMIN_* from env if set
```

From Coolify → **app** container → **Terminal**, `postgres` hostname resolves on the compose network.

---

## 3. Custom domain

1. Add the domain in Coolify on the **app** service and configure DNS.
2. Optionally set `VITE_APP_URL` and **rebuild** so the client bundle matches.
3. `APP_URL` / `BETTER_AUTH_URL` are filled from Coolify’s `SERVICE_URL_APP` unless you override them.

---

## 4. Post-deploy checks

- [ ] `https://visitharar.raafat.site/health` returns `ok`
- [ ] Homepage loads after migrations + seed
- [ ] `/admin/login` with seeded superadmin
- [ ] `/admin/media` — upload an image; copy URL works
- [ ] No database connection errors in Coolify logs

### VPS memory (recommended for small servers)

The Docker build compiles the full app (Vite + Nitro). On a **1–2 GB RAM** VPS, add swap before the first deploy:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 5. Troubleshooting

| Issue                          | Fix                                                                 |
| ------------------------------ | ------------------------------------------------------------------- |
| `404 page not found` (plain text) | Traefik has no healthy backend — check app logs, domain on **app** service, port `3000`. |
| `no available server` (503)  | App container unhealthy — check logs; run migrations; verify `POSTGRES_PASSWORD` matches. |
| Build fails / NODE_ENV warning | Set `NODE_ENV` as **runtime only** in Coolify (not build-time).     |
| Build SIGKILL / exit 139       | VPS ran out of RAM during Nitro build. Add **2GB swap**, redeploy.  |
| Auth redirects wrong host      | Set domain in Coolify; rebuild with correct `VITE_APP_URL`.       |
| Emails not sent                | Add real `RESEND_*` vars in Coolify (omit until ready — no errors). |
| Upload fails                   | Confirm `uploads` volume is mounted at `/data/uploads`.           |

---

## Local production smoke test

```bash
cd frontend
docker compose up --build
```

Requires only `BETTER_AUTH_SECRET` in `.env` (or export it). Postgres and `DATABASE_URL` are wired by compose.

Local dev Postgres (port 5434 only):

```bash
docker compose -f docker-compose.dev.yml up -d
```

---

## Vercel alternative

For Vercel + Supabase serverless deploy, set `NITRO_PRESET=vercel` in the Vercel build environment and use the Supabase **transaction pooler** (`6543`, `pgbouncer=true`) for `DATABASE_URL`. See `vercel.json` for install/build commands.

---

## Local dev vs production

|              | Local dev                         | Coolify (compose)                    |
| ------------ | --------------------------------- | ------------------------------------ |
| Postgres     | `docker-compose.dev.yml` → `:5434` | Bundled `postgres` service           |
| App URL      | `http://localhost:8080`           | `https://visitharar.raafat.site`     |
| Deploy file  | —                                 | `docker-compose.yml`                 |
| Media storage| `./uploads`                       | `/data/uploads` (named volume)       |
| Start        | `bun run dev`                     | `node dist/server/index.mjs`         |

See [SETUP.md](./SETUP.md) for local development.
