/** Walk `Error.cause` chain (Drizzle wraps Postgres errors). */
function errorChain(err: unknown): unknown[] {
  const chain: unknown[] = [];
  const seen = new Set<unknown>();
  let current: unknown = err;
  while (current != null && !seen.has(current)) {
    seen.add(current);
    chain.push(current);
    if (typeof current === "object" && "cause" in current) {
      current = (current as { cause: unknown }).cause;
    } else {
      break;
    }
  }
  return chain;
}

function messageFrom(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err);
}

function codeFrom(err: unknown): string {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = (err as { code: unknown }).code;
    if (typeof code === "string") return code;
  }
  return "";
}

function isUnavailableMessage(lower: string): boolean {
  return (
    lower.includes("econnrefused") ||
    lower.includes("connect econnrefused") ||
    lower.includes("connection refused") ||
    lower.includes("cannot connect") ||
    lower.includes("database_url is not set") ||
    lower.includes("connection terminated") ||
    lower.includes("connection timeout") ||
    lower.includes("password authentication failed") ||
    (lower.includes("relation") && lower.includes("does not exist")) ||
    (lower.includes("database") && lower.includes("does not exist")) ||
    lower.includes("too many clients") ||
    lower.includes("hero_content") // legacy hint from early schema
  );
}

/** Detect Postgres / Drizzle failures (connection, missing DB, missing table). */
export function isDbUnavailableError(err: unknown): boolean {
  if (!err) return false;

  for (const link of errorChain(err)) {
    const lower = messageFrom(link).toLowerCase();
    const code = codeFrom(link);

    if (
      code === "ECONNREFUSED" ||
      code === "ENOTFOUND" ||
      code === "ETIMEDOUT" ||
      code === "ECONNRESET" ||
      code === "3D000" || // database does not exist
      code === "42P01" || // undefined_table
      code === "53300" // too_many_connections
    ) {
      return true;
    }

    if (isUnavailableMessage(lower)) return true;
  }

  return false;
}

export const DB_SETUP_HINT =
  "Database unavailable. Start Postgres: `docker compose up -d` in frontend/, then `bun run db:push` and `bun run db:seed`. Ensure DATABASE_URL matches (default port 5434). If you see 'too many clients', restart Postgres (`docker restart visit-harar-pg`) and restart the dev server.";
