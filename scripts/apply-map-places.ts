import "dotenv/config";
import fs from "node:fs";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });
try {
  const file = fs.readFileSync("db/map-places.sql", "utf8");
  const statements = file
    .split(";")
    .map((part) => part.replace(/--[^\n]*/g, "").trim())
    .filter(Boolean);

  for (const statement of statements) {
    await sql.unsafe(statement);
  }
  console.log("✓ map_places table ready");
} catch (err) {
  console.error("Failed to apply map_places schema:", err);
  process.exit(1);
} finally {
  await sql.end({ timeout: 5 });
}
