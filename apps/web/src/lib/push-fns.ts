import { eq } from "drizzle-orm";
import { db } from "../../../../db/index";
import { pushSubscriptions } from "../../../../drizzle/schema/index";
import { createError, isAppError } from "@/lib/errors";
import { isDbUnavailableError } from "@/lib/db-errors";
import {
  pushRegisterSchema,
  pushUnregisterSchema,
  type PushRegisterInput,
} from "@/lib/validators/push";
import { isExpoPushConfigured } from "@/lib/push/expo-send";

export async function registerPushSubscription(
  raw: unknown,
): Promise<{ ok: true }> {
  const data = pushRegisterSchema.parse(raw);
  return upsertPushSubscription(data);
}

export async function unregisterPushSubscription(
  raw: unknown,
): Promise<{ ok: true }> {
  const data = pushUnregisterSchema.parse(raw);
  try {
    await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.expoPushToken, data.expo_push_token));
    return { ok: true };
  } catch (err) {
    if (isDbUnavailableError(err)) return { ok: true };
    if (isAppError(err)) throw err;
    throw createError(
      "INTERNAL",
      err instanceof Error ? err.message : "Failed to unregister push token",
    );
  }
}

export async function getPushEnabled(): Promise<{ enabled: boolean }> {
  return { enabled: isExpoPushConfigured() };
}

async function upsertPushSubscription(
  data: PushRegisterInput,
): Promise<{ ok: true }> {
  const now = new Date();
  const visitorEmail = data.visitor_email
    ? data.visitor_email.trim().toLowerCase()
    : null;

  try {
    const existing = await db.query.pushSubscriptions.findFirst({
      where: eq(pushSubscriptions.expoPushToken, data.expo_push_token),
    });

    if (existing) {
      await db
        .update(pushSubscriptions)
        .set({
          visitorEmail: visitorEmail ?? existing.visitorEmail,
          notifyBookings: data.notify_bookings ?? existing.notifyBookings,
          notifyEvents: data.notify_events ?? existing.notifyEvents,
          platform: data.platform ?? existing.platform,
          updatedAt: now,
        })
        .where(eq(pushSubscriptions.id, existing.id));
    } else {
      await db.insert(pushSubscriptions).values({
        expoPushToken: data.expo_push_token,
        visitorEmail,
        notifyBookings: data.notify_bookings ?? true,
        notifyEvents: data.notify_events ?? true,
        platform: data.platform ?? null,
        updatedAt: now,
      });
    }

    return { ok: true };
  } catch (err) {
    if (isDbUnavailableError(err)) return { ok: true };
    if (isAppError(err)) throw err;
    throw createError(
      "INTERNAL",
      err instanceof Error ? err.message : "Failed to register push token",
    );
  }
}

/** Link a push token to a visitor email after booking (optional convenience). */
export async function linkPushTokenToEmail(
  expoPushToken: string,
  visitorEmail: string,
): Promise<void> {
  try {
    await db
      .update(pushSubscriptions)
      .set({
        visitorEmail: visitorEmail.trim().toLowerCase(),
        updatedAt: new Date(),
      })
      .where(eq(pushSubscriptions.expoPushToken, expoPushToken));
  } catch {
    // Non-critical; email can be set via register endpoint.
  }
}
