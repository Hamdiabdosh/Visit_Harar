# Visit Harar monorepo

```
Visit_Harar/
├── apps/
│   ├── web/             # TanStack Start — public site + admin CMS + API
│   ├── flutter/         # Native iOS/Android app
│   └── mobile/          # Expo (frozen — archive after Flutter F4)
├── packages/
│   ├── shared/          # Shared TS types, page keys, geo constants
│   └── api-client/      # Typed /api/v1 client
├── drizzle/             # PostgreSQL schema (platform)
├── db/                  # DB client
├── scripts/             # Seeds, migrations, deploy helpers
└── openapi/             # API contract (web + Flutter)
```

## Commands

| Task | Command |
|------|---------|
| Web dev | `bun run dev` or `bun run dev:web` |
| Web build | `bun run build` |
| Flutter | `bun run flutter:dev` |
| Database | `bun run db:push`, `bun run db:seed` |

Web app lives in **`apps/web/`**. Shared database and scripts stay at the repo root.
