/**
 * Development-only database reset. NEVER runs outside NODE_ENV=development.
 */
import 'dotenv/config'
import { sql } from 'drizzle-orm'
import { db } from '../db/index'
import { seedEditor, seedSuperadmin } from './seed-superadmin'
import { seedPages } from './seed-pages'
import { seedSettings } from './seed-settings'

if (process.env.NODE_ENV !== 'development') {
  throw new Error('db:reset is only allowed when NODE_ENV=development')
}

async function main() {
  console.log('Dropping public schema…')
  await db.execute(sql`DROP SCHEMA public CASCADE`)
  await db.execute(sql`CREATE SCHEMA public`)
  console.log('Re-run migrations with: bun run db:push')
  console.log('Then indexes: psql $DATABASE_URL -f db/indexes.sql')
  console.log('Then seed: bun run db:seed')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
