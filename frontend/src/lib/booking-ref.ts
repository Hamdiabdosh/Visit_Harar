import { count, like } from "drizzle-orm";
import type { DB } from "../../db/index";
import { bookings } from "../../drizzle/schema/index";

type Tx = Parameters<Parameters<DB["transaction"]>[0]>[0];

export async function generateBookingRef(tx: Tx): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `HRR-${year}-`;

  const [row] = await tx
    .select({ n: count() })
    .from(bookings)
    .where(like(bookings.bookingRef, `${prefix}%`));

  const next = Number(row?.n ?? 0) + 1;
  return `${prefix}${String(next).padStart(5, "0")}`;
}
