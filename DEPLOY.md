# Deploy Visit Harar — Coolify

## Overview


| Service     | Role                                                      |
| ----------- | --------------------------------------------------------- |
| **Coolify** | Runs `docker-compose.yml` (app + bundled Postgres)        |
| **Resend**  | Auth reset and booking emails (optional until configured) |


The compose stack builds the app with Nitro’s `**node-server`** preset. Vercel deploys use `NITRO_PRESET=vercel` (see [Vercel section](#vercel-alternative) below).

**Production domain:** `https://visitharar.raafat.site`

Copy-paste template: `[coolify.env.example](./coolify.env.example)`

### Pre-deploy (local)

```bash
bun run deploy:preflight   # checks monorepo paths, compose, optional APK
docker compose build app   # optional: full image build smoke test (needs Docker + RAM/swap)
```

Push to the connected branch when preflight passes. Coolify rebuilds on each deploy.

---

## 1. Coolify application (Docker Compose)

### Create the service

1. Coolify → **Projects** → your project → **Add Resource** → **Application**.
2. Connect your Git repository.
3. **Base Directory**: **leave empty** (repo root). See [Base Directory](#base-directory-critical) below.
4. **Build Pack**: **Docker Compose** (uses `docker-compose.yml` at repo root).
5. **Domain**: add `visitharar.raafat.site` on the **app** service (enable SSL).
6. No separate Postgres resource needed — compose includes a `postgres` service and wires `DATABASE_URL` automatically.

### Base Directory (critical)

`docker-compose.yml` and `Dockerfile` live at the **repository root**, not inside `apps/web/`.

| Base Directory in Coolify | Result |
| ------------------------- | ------ |
| **Empty** (recommended) or `/` | ✅ Correct — finds `docker-compose.yml`, builds and proxies `app` on port 3000 |
| `apps/web` | ❌ Wrong — no compose file, wrong build context → **"no available server"** (503) |
| Any other subfolder | ❌ Wrong unless you moved the compose file there |

After changing Base Directory, click **Redeploy** (full rebuild).

**Quick check:** In Coolify’s deploy log, the first lines should reference `docker-compose.yml` at the repo root. If it says “compose file not found” or only sees `apps/web`, the base directory is wrong.

### What compose handles for you


| Concern        | Handled by `docker-compose.yml`                              |
| -------------- | ------------------------------------------------------------ |
| Postgres       | `postgres` service on the internal network                   |
| `DATABASE_URL` | Built as `postgresql://postgres:…@postgres:5432/visit_harar` |
| App port       | `3000` via `SERVICE_FQDN_APP_3000` (Coolify magic var)       |
| Uploads        | Named volume `uploads` at `/data/uploads`                    |
| Health check   | `GET /health` (no database required)                         |


Do **not** set `DATABASE_URL` in Coolify — it would be redundant and easy to get wrong.

### Environment variables in Coolify

Only set what you need. Optional vars can be omitted entirely; template placeholders like `re_your-api-key` are ignored at runtime.


| Variable               | Required    | Build-time? | Notes                                                                            |
| ---------------------- | ----------- | ----------- | -------------------------------------------------------------------------------- |
| `POSTGRES_PASSWORD`    | Recommended | No          | Shared by postgres + app; change from default                                    |
| `BETTER_AUTH_SECRET`   | Yes         | No          | `openssl rand -base64 32`                                                        |
| `VITE_APP_URL`         | Recommended | **Yes**     | `https://visitharar.raafat.site` — embedded in client bundle                     |
| `VITE_ANDROID_APK_URL` | No          | **Yes**     | Only if APK is hosted outside the image; default is `/downloads/visit-harar.apk` |
| `RESEND_API_KEY`       | No          | No          | Omit until Resend is ready                                                       |
| `RESEND_FROM_EMAIL`    | No          | No          | Omit until Resend is ready                                                       |
| `APP_URL`              | No          | No          | Coolify sets via `SERVICE_URL_APP` when domain is configured                     |
| `BETTER_AUTH_URL`      | No          | No          | Defaults to `SERVICE_URL_APP`                                                    |


**Only `VITE_`* vars should be marked “Available at Buildtime”.**  
Do **not** mark `NODE_ENV`, `POSTGRES_PASSWORD`, or secrets as build-time — that skips devDependencies and breaks the Docker build.

Remove any previously set `DATABASE_URL` from Coolify env vars.

### Deploy

Push to the connected branch, or click **Deploy** in Coolify.

Coolify runs `docker compose up`, builds the app image, starts Postgres, then the app.

---

## 2. Database setup (automatic via Coolify)

No SSH or local `bun` commands needed. On each app container start, the entrypoint automatically:

1. Runs `db:push` (schema sync)
2. Applies indexes
3. Seeds **once** if the `user` table is empty

Set these in **Coolify → Environment Variables** before the first deploy:

```env
SUPERADMIN_EMAIL=admin@visitharar.gov.et
SUPERADMIN_PASSWORD=your-strong-password
SUPERADMIN_NAME=Super Admin
```

First deploy may take a few extra minutes while the container runs migrations + seed. Watch **Logs** on the **app** service for:

```text
Applying database schema…
✓ Indexes applied
Seeding database…
All seeds completed.
```

To skip auto-setup (debug only): set `SKIP_DB_SETUP=1` on the app service.

To force re-seed after wiping the database volume: redeploy with an empty `user` table, or set `RUN_DB_SEED=1`.

---

## 3. Custom domain

1. Add the domain in Coolify on the **app** service and configure DNS.
2. Optionally set `VITE_APP_URL` and **rebuild** so the client bundle matches.
3. `APP_URL` / `BETTER_AUTH_URL` are filled from Coolify’s `SERVICE_URL_APP` unless you override them.

---

## 4. Post-deploy checks

- `https://visitharar.raafat.site/health` returns `ok`
- Homepage loads after migrations + seed
- `/admin/login` with seeded superadmin
- `/admin/media` — upload an image; copy URL works
- `/downloads/visit-harar.apk` downloads (if APK was included in the build — see below)
- No database connection errors in Coolify logs

### Android APK (optional)

The homepage links to `/downloads/visit-harar.apk`. The file is **not** committed to git (see `.gitignore`). To ship it on Coolify:

1. **Include in the image (recommended):** before push/deploy, run `bun run flutter:apk:web`, then `git add -f apps/web/public/downloads/visit-harar.apk` and deploy so the APK is in the Docker build context.
2. **External URL:** host the APK elsewhere and set `VITE_ANDROID_APK_URL` as a **build-time** variable in Coolify, then redeploy.

If the APK is missing, the site still works; only the download link returns 404.

---

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


| Issue                                          | Fix                                                                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `404 page not found` (plain text)              | Traefik has no healthy backend — check app logs, domain on **app** service, port `3000`.                                 |
| `no available server` (503)                    | **Wrong Base Directory** — leave empty (repo root), not `apps/web`. Also: app unhealthy — check logs; verify `POSTGRES_PASSWORD`. |
| Build fails / NODE_ENV warning                 | Set `NODE_ENV` as **runtime only** in Coolify (not build-time).                                                          |
| Build SIGKILL / exit 139                       | VPS ran out of RAM during Nitro build. Add **2GB swap**, redeploy.                                                       |
| Deploy takes 20+ minutes                       | Old images copied full `node_modules`; current Dockerfile ships `dist/` only (~6 MB).                                    |
| App up but empty / login fails                 | Check app **Logs** for migration/seed errors; set `SUPERADMIN_`* in Coolify.                                             |
| Auth redirects wrong host                      | Set domain in Coolify; rebuild with correct `VITE_APP_URL`.                                                              |
| Emails not sent                                | Add real `RESEND_*` vars in Coolify (omit until ready — no errors).                                                      |
| Build fails: `apps/web/package.json` not found | `.dockerignore` must **not** exclude `apps/web/` (Flutter-only exclusion is fine). Run `bun run deploy:preflight`.       |
| APK download 404                               | Run `bun run flutter:apk:web` and redeploy with the file in `apps/web/public/downloads/`, or set `VITE_ANDROID_APK_URL`. |
| `Could not load the "sharp" module` (500)      | Redeploy latest `Dockerfile` — installs `@img/sharp-linuxmusl-x64` for Alpine at build time. |
| Upload fails                                   | Confirm `uploads` volume is mounted at `/data/uploads`.                                                                  |


---

## Local production smoke test

```bash
docker compose up --build
```

Requires only `BETTER_AUTH_SECRET` in `.env` (or export it). Postgres and `DATABASE_URL` are wired by compose.

Local dev Postgres (port 5434 only):

```bash
t 
```

---

## Vercel alternative

For Vercel + Supabase serverless deploy, set `NITRO_PRESET=vercel` in the Vercel build environment and use the Supabase **transaction pooler** (`6543`, `pgbouncer=true`) for `DATABASE_URL`. See `vercel.json` for install/build commands.

---

## Local dev vs production


|               | Local dev                          | Coolify (compose)                                    |
| ------------- | ---------------------------------- | ---------------------------------------------------- |
| Postgres      | `docker-compose.dev.yml` → `:5434` | Bundled `postgres` service                           |
| App URL       | `http://localhost:8080`            | `https://visitharar.raafat.site`                     |
| Deploy file   | —                                  | `docker-compose.yml`                                 |
| Media storage | `./uploads`                        | `/data/uploads` (named volume)                       |
| Start         | `bun run dev`                      | `bun run start` (→ `apps/web/dist/server/index.mjs`) |


See [SETUP.md](./SETUP.md) for local development.