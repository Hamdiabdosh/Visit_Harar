import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../../../../db/index";
import { pushSubscriptions } from "../../../../../drizzle/schema/index";
import { sendExpoPushMessages, type ExpoPushMessage } from "./expo-send";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function notifyBookingStatusChange(input: {
  visitorEmail: string;
  bookingRef: string;
  status: string;
  guideName: string;
  tourDate: string;
}): Promise<void> {
  const email = normalizeEmail(input.visitorEmail);
  const rows = await db
    .select({ token: pushSubscriptions.expoPushToken })
    .from(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.notifyBookings, true),
        sql`lower(${pushSubscriptions.visitorEmail}) = ${email}`,
      ),
    );

  if (!rows.length) return;

  const statusLabel =
    input.status === "Confirmed"
      ? "confirmed"
      : input.status === "Declined"
        ? "declined"
        : input.status === "Cancelled"
          ? "cancelled"
          : "updated";

  const messages: ExpoPushMessage[] = rows.map((row) => ({
    to: row.token,
    title: "Booking update",
    body: `Your tour with ${input.guideName} on ${input.tourDate} was ${statusLabel}. Ref: ${input.bookingRef}`,
    sound: "default",
    data: {
      type: "booking",
      booking_ref: input.bookingRef,
    },
  }));

  await sendExpoPushMessages(messages);
}

export async function notifyAnnouncementPublished(input: {
  title: string;
  slug: string;
  type: string;
  eventDate?: string | null;
}): Promise<void> {
  const rows = await db
    .select({ token: pushSubscriptions.expoPushToken })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.notifyEvents, true));

  if (!rows.length) return;

  const isEvent = input.type === "Event";
  const body = isEvent
    ? input.eventDate
      ? `${input.title} — ${input.eventDate}`
      : input.title
    : input.title;

  const messages: ExpoPushMessage[] = rows.map((row) => ({
    to: row.token,
    title: isEvent ? "New event in Harar" : "Visit Harar news",
    body,
    sound: "default",
    data: {
      type: "announcement",
      slug: input.slug,
    },
  }));

  await sendExpoPushMessages(messages);
}

/** Remove tokens Expo reports as invalid. */
export async function removeInvalidPushTokens(tokens: string[]): Promise<void> {
  if (!tokens.length) return;
  await db
    .delete(pushSubscriptions)
    .where(inArray(pushSubscriptions.expoPushToken, tokens));
}
