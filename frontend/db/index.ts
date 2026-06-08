/**
 * Drizzle database client.
 *
 * IMPORTANT: `updated_at` is NOT auto-updated by Drizzle — set `new Date()`
 * explicitly on every UPDATE operation.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { Sql } from "postgres";
import * as schema from "../drizzle/schema/index";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

/** Supabase pooler (pgbouncer) does not support prepared statements. */
const usesSupabasePooler =
  connectionString.includes("pooler.supabase.com") ||
  connectionString.includes("pgbouncer=true");

/** Reuse one pool in dev — Vite HMR otherwise leaks connections until Postgres refuses new ones. */
const globalForDb = globalThis as typeof globalThis & {
  __visitHararPg?: Sql;
  __visitHararDrizzle?: ReturnType<typeof drizzle<typeof schema>>;
};

const client =
  globalForDb.__visitHararPg ??
  postgres(connectionString, {
    // Serverless (Vercel): one connection per function instance.
    // Coolify/Docker: small pool on a long-lived Node process.
    max: process.env.VERCEL ? 1 : 10,
    idle_timeout: process.env.VERCEL ? 20 : 30,
    prepare: !usesSupabasePooler,
  });

if (!globalForDb.__visitHararPg) {
  globalForDb.__visitHararPg = client;
}

export const db =
  globalForDb.__visitHararDrizzle ?? drizzle(client, { schema });

if (!globalForDb.__visitHararDrizzle) {
  globalForDb.__visitHararDrizzle = db;
}

export type DB = typeof db;
