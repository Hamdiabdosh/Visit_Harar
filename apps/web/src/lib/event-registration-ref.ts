import { count, like } from "drizzle-orm";
import type { DB } from "../../../../db/index";
import { eventRegistrations } from "../../../../drizzle/schema/index";

type Tx = Parameters<Parameters<DB["transaction"]>[0]>[0];

export async function generateEventRegistrationRef(tx: Tx): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `EVT-${year}-`;

  const [row] = await tx
    .select({ n: count() })
    .from(eventRegistrations)
    .where(like(eventRegistrations.registrationRef, `${prefix}%`));

  const next = Number(row?.n ?? 0) + 1;
  return `${prefix}${String(next).padStart(5, "0")}`;
}
