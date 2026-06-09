import { execSync } from "node:child_process";
import fs from "node:fs";
import postgres from "postgres";

async function applyIndexes() {
  const url = process.env.DATABASE_URL;
  if (!url) return;

  const sql = postgres(url, { max: 1 });
  try {
    const file = fs.readFileSync("db/indexes.sql", "utf8");
    const statements = file
      .split(";")
      .map((part) => part.replace(/--[^\n]*/g, "").trim())
      .filter(Boolean);

    for (const statement of statements) {
      await sql.unsafe(statement);
    }
    console.log("✓ Indexes applied");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function shouldSeed(): Promise<boolean> {
  if (process.env.RUN_DB_SEED === "0") return false;

  const url = process.env.DATABASE_URL;
  if (!url) return false;

  const sql = postgres(url, { max: 1 });
  try {
    const tables = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'user'
      ) AS exists
    `;
    if (!tables[0]?.exists) return true;

    const count = await sql`SELECT COUNT(*)::int AS n FROM "user"`;
    return (count[0]?.n ?? 0) === 0;
  } catch {
    return true;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function main() {
  console.log("Applying database schema…");
  execSync("bun run db:push", { stdio: "inherit" });
  await applyIndexes();

  if (await shouldSeed()) {
    console.log("Seeding database…");
    execSync("bun run db:seed", { stdio: "inherit" });
  } else {
    console.log("Skipping seed (database already has users)");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
