#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ] && [ "${SKIP_DB_SETUP:-0}" != "1" ]; then
  bun scripts/apply-db-setup.ts
fi

exec node dist/server/index.mjs
