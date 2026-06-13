import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../../../db/index";
import { announcements, eventRegistrations } from "../../../../drizzle/schema/index";
import type { EventRegistrationStatus } from "@/lib/types";

const ACTIVE_STATUSES: EventRegistrationStatus[] = ["Pending", "Confirmed"];

export type EventRegistrationMeta = {
  registration_enabled: boolean;
  registration_capacity: number | null;
  registration_deadline: string | null;
  registration_note: string | null;
  registered_count: number;
  spots_remaining: number | null;
  registration_open: boolean;
};

export async function countRegisteredPartySize(
  announcementId: string,
  tx: typeof db = db,
): Promise<number> {
  const [row] = await tx
    .select({
      total: sql<number>`coalesce(sum(${eventRegistrations.partySize}), 0)`,
    })
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.announcementId, announcementId),
        inArray(eventRegistrations.status, ACTIVE_STATUSES),
      ),
    );
  return Number(row?.total ?? 0);
}

export async function buildEventRegistrationMeta(
  row: typeof announcements.$inferSelect,
): Promise<EventRegistrationMeta | null> {
  if (row.type !== "Event" || !row.registrationEnabled) return null;

  const registered = await countRegisteredPartySize(row.id);
  const capacity = row.registrationCapacity ?? null;
  const spotsRemaining =
    capacity === null ? null : Math.max(0, capacity - registered);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineOk =
    !row.registrationDeadline ||
    new Date(`${String(row.registrationDeadline)}T23:59:59`) >= today;
  const capacityOk = spotsRemaining === null || spotsRemaining > 0;

  return {
    registration_enabled: true,
    registration_capacity: capacity,
    registration_deadline: row.registrationDeadline
      ? String(row.registrationDeadline)
      : null,
    registration_note: row.registrationNote ?? null,
    registered_count: registered,
    spots_remaining: spotsRemaining,
    registration_open: row.isPublished && deadlineOk && capacityOk,
  };
}
