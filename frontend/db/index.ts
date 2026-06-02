/**
 * Drizzle database client.
 *
 * IMPORTANT: `updated_at` is NOT auto-updated by Drizzle — set `new Date()`
 * explicitly on every UPDATE operation.
 */
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../drizzle/schema/index'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const client = postgres(connectionString, { max: 10 })

export const db = drizzle(client, { schema })

export type DB = typeof db
