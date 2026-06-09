import "dotenv/config";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}

console.log("Checking", url.replace(/:[^:@]+@/, ":****@"));

const sql = postgres(url, { max: 1, connect_timeout: 5 });

try {
  await sql`SELECT 1 AS ok`;
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'hero_content'
  `;
  if (tables.length === 0) {
    console.error("Connected, but hero_content table is missing.");
    console.error("Run: bun run db:push && bun run db:seed");
    process.exit(1);
  }
  const count = await sql`SELECT COUNT(*)::int AS n FROM hero_content`;
  console.log("OK — hero_content exists, rows:", count[0]?.n ?? 0);
  process.exit(0);
} catch (err) {
  console.error("Database connection failed.");
  console.error(err instanceof Error ? err.message : err);
  console.error("\nStart Postgres: docker compose -f docker-compose.dev.yml up -d  (in frontend/)");
  console.error("Then: bun run db:push && bun run db:seed");
  process.exit(1);
} finally {
  await sql.end({ timeout: 2 });
}
