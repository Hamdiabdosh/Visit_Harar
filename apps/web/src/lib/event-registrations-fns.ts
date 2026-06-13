import { randomBytes } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, count, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../../db/index";
import {
  announcements,
  eventRegistrations,
  user,
} from "../../../../drizzle/schema/index";
import { auth } from "@/lib/auth.server";
import { generateEventRegistrationRef } from "@/lib/event-registration-ref";
import {
  resendEventRegistrationEmail,
  sendEventCancellationEmail,
  sendEventConfirmationEmail,
  sendEventDeclineEmail,
  sendEventRegistrationAlert,
  sendEventRegistrationPendingEmail,
  type EventRegistrationEmailData,
  type EventSummaryEmailData,
} from "@/lib/event-email";
import { createError, isAppError } from "@/lib/errors";
import { isDbUnavailableError } from "@/lib/db-errors";
import {
  eventRegistrationInputSchema,
  eventRegistrationStatusInputSchema,
  eventRegistrationStatusSchema,
} from "@/lib/validators/event-registrations";
import type { EventRegistrationStatus, UserRole } from "@/lib/types";
import { auditSnap, fireAudit } from "@/lib/audit";
import {
  countRegisteredPartySize,
} from "@/lib/event-registration-meta";

const ACTIVE_STATUSES: EventRegistrationStatus[] = ["Pending", "Confirmed"];

async function requireEditorSession() {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user)
    throw createError("UNAUTHORIZED", "Authentication required");
  const role = (session.user as { role?: string }).role as UserRole;
  const isActive = (session.user as { isActive?: boolean }).isActive ?? true;
  if (!isActive) throw createError("FORBIDDEN", "Account is disabled");
  if (role !== "superadmin" && role !== "editor") {
    throw createError("FORBIDDEN", "Insufficient permissions");
  }
  return { id: session.user.id, name: session.user.name };
}

export type EventRegistrationListDto = {
  id: string;
  registration_ref: string;
  announcement_id: string;
  event_title: string;
  event_date: string | null;
  visitor_name: string;
  visitor_email: string;
  visitor_country: string;
  party_size: number;
  status: EventRegistrationStatus;
  created_at: Date;
};

export type EventRegistrationDetailDto = EventRegistrationListDto & {
  visitor_phone: string | null;
  special_requests: string | null;
  status_note: string | null;
  qr_token: string;
  notified_at: Date | null;
  updated_by: string | null;
  updated_by_name: string | null;
  updated_at: Date;
  event: {
    id: string;
    title: string;
    slug: string;
    event_date: string | null;
    event_location: string | null;
  };
};

export type PublicEventRegistrationStatusDto = {
  registration_ref: string;
  status: EventRegistrationStatus;
  event_title: string;
  event_date: string | null;
  event_location: string | null;
  party_size: number;
  status_note: string | null;
  qr_token: string | null;
};

function newQrToken(): string {
  return randomBytes(24).toString("hex");
}

function eventToEmailData(
  row: typeof announcements.$inferSelect,
): EventSummaryEmailData {
  return {
    title: row.title,
    event_date: row.eventDate ? String(row.eventDate) : null,
    event_location: row.eventLocation ?? null,
  };
}

function rowToEmailData(
  row: typeof eventRegistrations.$inferSelect,
  event: EventSummaryEmailData,
): EventRegistrationEmailData {
  return {
    registration_ref: row.registrationRef,
    visitor_name: row.visitorName,
    visitor_email: row.visitorEmail,
    visitor_phone: row.visitorPhone,
    visitor_country: row.visitorCountry,
    party_size: row.partySize,
    special_requests: row.specialRequests,
    status: row.status as EventRegistrationStatus,
    status_note: row.statusNote,
    qr_token: row.qrToken,
    event,
  };
}

async function loadRegistrationDetail(
  where: SQL,
): Promise<EventRegistrationDetailDto | null> {
  const rows = await db
    .select({
      registration: eventRegistrations,
      event: announcements,
      editorName: user.name,
    })
    .from(eventRegistrations)
    .innerJoin(
      announcements,
      eq(eventRegistrations.announcementId, announcements.id),
    )
    .leftJoin(user, eq(eventRegistrations.updatedBy, user.id))
    .where(where)
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const r = row.registration;
  const e = row.event;
  return {
    id: r.id,
    registration_ref: r.registrationRef,
    announcement_id: e.id,
    event_title: e.title,
    event_date: e.eventDate ? String(e.eventDate) : null,
    visitor_name: r.visitorName,
    visitor_email: r.visitorEmail,
    visitor_phone: r.visitorPhone,
    visitor_country: r.visitorCountry,
    party_size: r.partySize,
    special_requests: r.specialRequests,
    status: r.status as EventRegistrationStatus,
    status_note: r.statusNote,
    qr_token: r.qrToken,
    notified_at: r.notifiedAt,
    created_at: r.createdAt,
    updated_by: r.updatedBy,
    updated_by_name: row.editorName ?? null,
    updated_at: r.updatedAt,
    event: {
      id: e.id,
      title: e.title,
      slug: e.slug,
      event_date: e.eventDate ? String(e.eventDate) : null,
      event_location: e.eventLocation ?? null,
    },
  };
}

const listFiltersSchema = z
  .object({
    status: eventRegistrationStatusSchema.optional(),
    announcement_id: z.string().uuid().optional(),
  })
  .optional();

export const getEventRegistrations = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => listFiltersSchema.parse(raw))
  .handler(async ({ data: filters }): Promise<EventRegistrationListDto[]> => {
    try {
      await requireEditorSession();
      const conditions = [];
      if (filters?.status)
        conditions.push(eq(eventRegistrations.status, filters.status));
      if (filters?.announcement_id)
        conditions.push(
          eq(eventRegistrations.announcementId, filters.announcement_id),
        );

      let query = db
        .select({
          id: eventRegistrations.id,
          registration_ref: eventRegistrations.registrationRef,
          announcement_id: eventRegistrations.announcementId,
          event_title: announcements.title,
          event_date: announcements.eventDate,
          visitor_name: eventRegistrations.visitorName,
          visitor_email: eventRegistrations.visitorEmail,
          visitor_country: eventRegistrations.visitorCountry,
          party_size: eventRegistrations.partySize,
          status: eventRegistrations.status,
          created_at: eventRegistrations.createdAt,
        })
        .from(eventRegistrations)
        .innerJoin(
          announcements,
          eq(eventRegistrations.announcementId, announcements.id),
        )
        .orderBy(desc(eventRegistrations.createdAt));

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }

      const rows = await query;
      return rows.map((r) => ({
        id: r.id,
        registration_ref: r.registration_ref,
        announcement_id: r.announcement_id,
        event_title: r.event_title,
        event_date: r.event_date ? String(r.event_date) : null,
        visitor_name: r.visitor_name,
        visitor_email: r.visitor_email,
        visitor_country: r.visitor_country,
        party_size: r.party_size,
        status: r.status as EventRegistrationStatus,
        created_at: r.created_at,
      }));
    } catch (err) {
      if (isDbUnavailableError(err)) return [];
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to list registrations",
      );
    }
  });

export const getEventRegistrationByRefForAdmin = createServerFn({
  method: "GET",
})
  .inputValidator((ref: unknown) => z.string().min(1).parse(ref))
  .handler(async ({ data: ref }): Promise<EventRegistrationDetailDto | null> => {
    try {
      await requireEditorSession();
      return await loadRegistrationDetail(
        eq(eventRegistrations.registrationRef, ref),
      );
    } catch (err) {
      if (isDbUnavailableError(err)) return null;
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load registration",
      );
    }
  });

export const getEventRegistrationByRef = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    eventRegistrationStatusInputSchema.parse(raw),
  )
  .handler(
    async ({ data }): Promise<PublicEventRegistrationStatusDto | null> => {
      try {
        const ref = data.registration_ref.trim();
        const email = data.visitor_email.trim().toLowerCase();
        const rows = await db
          .select({
            registration: eventRegistrations,
            eventTitle: announcements.title,
            eventDate: announcements.eventDate,
            eventLocation: announcements.eventLocation,
          })
          .from(eventRegistrations)
          .innerJoin(
            announcements,
            eq(eventRegistrations.announcementId, announcements.id),
          )
          .where(
            and(
              eq(eventRegistrations.registrationRef, ref),
              sql`lower(${eventRegistrations.visitorEmail}) = ${email}`,
            ),
          )
          .limit(1);
        const row = rows[0];
        if (!row) return null;
        const r = row.registration;
        const showQr =
          r.status === "Confirmed" || r.status === "CheckedIn"
            ? r.qrToken
            : null;
        return {
          registration_ref: r.registrationRef,
          status: r.status as EventRegistrationStatus,
          event_title: row.eventTitle,
          event_date: row.eventDate ? String(row.eventDate) : null,
          event_location: row.eventLocation ?? null,
          party_size: r.partySize,
          status_note:
            r.status === "Declined" || r.status === "Cancelled"
              ? r.statusNote
              : null,
          qr_token: showQr,
        };
      } catch (err) {
        if (isDbUnavailableError(err)) return null;
        if (isAppError(err)) throw err;
        throw createError(
          "INTERNAL",
          err instanceof Error ? err.message : "Failed to look up registration",
        );
      }
    },
  );

export const getPendingEventRegistrationsCount = createServerFn({
  method: "GET",
}).handler(async (): Promise<number> => {
  try {
    await requireEditorSession();
    const [row] = await db
      .select({ n: count() })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.status, "Pending"));
    return Number(row?.n ?? 0);
  } catch (err) {
    if (isDbUnavailableError(err)) return 0;
    if (isAppError(err)) throw err;
    throw createError(
      "INTERNAL",
      err instanceof Error ? err.message : "Failed to count registrations",
    );
  }
});

export const createEventRegistration = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => eventRegistrationInputSchema.parse(raw))
  .handler(
    async ({
      data,
    }): Promise<{
      registration_ref: string;
      status: EventRegistrationStatus;
      qr_token: string | null;
    }> => {
      try {
        const event = await db.query.announcements.findFirst({
          where: eq(announcements.id, data.announcement_id),
        });
        if (
          !event ||
          !event.isPublished ||
          event.type !== "Event" ||
          !event.registrationEnabled
        ) {
          throw createError(
            "VALIDATION_ERROR",
            "Event registration is not available",
          );
        }

        const meta = await buildEventRegistrationMeta(event);
        if (!meta?.registration_open) {
          throw createError(
            "VALIDATION_ERROR",
            "Registration is closed for this event",
          );
        }

        const email = data.visitor_email.trim().toLowerCase();
        const existing = await db.query.eventRegistrations.findFirst({
          where: and(
            eq(eventRegistrations.announcementId, data.announcement_id),
            sql`lower(${eventRegistrations.visitorEmail}) = ${email}`,
            inArray(eventRegistrations.status, ACTIVE_STATUSES),
          ),
        });
        if (existing) {
          throw createError(
            "VALIDATION_ERROR",
            "You already have an active registration for this event",
          );
        }

        const eventEmail = eventToEmailData(event);
        const autoConfirm = event.registrationAutoConfirm;

        const result = await db.transaction(async (tx) => {
          const registered = await countRegisteredPartySize(data.announcement_id, tx);
          const capacity = event.registrationCapacity ?? null;
          if (
            capacity !== null &&
            registered + data.party_size > capacity
          ) {
            throw createError(
              "VALIDATION_ERROR",
              "Not enough spots remaining for your group size",
            );
          }

          const ref = await generateEventRegistrationRef(tx);
          const qrToken = newQrToken();
          const status: EventRegistrationStatus =
            autoConfirm ? "Confirmed" : "Pending";
          const now = new Date();

          await tx.insert(eventRegistrations).values({
            registrationRef: ref,
            announcementId: data.announcement_id,
            visitorName: data.visitor_name,
            visitorEmail: data.visitor_email,
            visitorPhone: data.visitor_phone ?? null,
            visitorCountry: data.visitor_country,
            partySize: data.party_size,
            specialRequests: data.special_requests ?? null,
            status,
            qrToken,
            notifiedAt: status === "Confirmed" ? now : null,
          });

          return { ref, status, qrToken };
        });

        const inserted = await db.query.eventRegistrations.findFirst({
          where: eq(eventRegistrations.registrationRef, result.ref),
        });
        if (!inserted) {
          throw createError("INTERNAL", "Failed to create registration");
        }

        const emailPayload = rowToEmailData(inserted, eventEmail);
        if (result.status === "Confirmed") {
          void sendEventConfirmationEmail(emailPayload);
        } else {
          void sendEventRegistrationPendingEmail(emailPayload);
          void sendEventRegistrationAlert(emailPayload);
        }

        fireAudit({
          module: "event_registrations",
          action: "create",
          recordId: inserted.id,
          recordTitle: result.ref,
          after: auditSnap(inserted),
        });

        return {
          registration_ref: result.ref,
          status: result.status,
          qr_token: result.status === "Confirmed" ? result.qrToken : null,
        };
      } catch (err) {
        if (isAppError(err)) throw err;
        throw createError(
          "INTERNAL",
          err instanceof Error ? err.message : "Failed to create registration",
        );
      }
    },
  );

const noteSchema = z.object({
  id: z.string().uuid(),
  note: z.string().max(2000).optional(),
});

const requiredNoteSchema = z.object({
  id: z.string().uuid(),
  note: z.string().min(1).max(2000),
});

async function updateRegistrationStatus(
  id: string,
  editorId: string,
  from: EventRegistrationStatus | EventRegistrationStatus[],
  to: EventRegistrationStatus,
  statusNote: string | null,
  sendEmail: (
    row: typeof eventRegistrations.$inferSelect,
    event: typeof announcements.$inferSelect,
  ) => Promise<void>,
): Promise<EventRegistrationDetailDto> {
  const allowedFrom = Array.isArray(from) ? from : [from];
  const existing = await db.query.eventRegistrations.findFirst({
    where: eq(eventRegistrations.id, id),
  });
  if (!existing) throw createError("NOT_FOUND", "Registration not found");
  if (!allowedFrom.includes(existing.status as EventRegistrationStatus)) {
    throw createError(
      "VALIDATION_ERROR",
      `Cannot change status from ${existing.status} to ${to}`,
    );
  }
  if (existing.status === "Declined" || existing.status === "Cancelled") {
    throw createError(
      "TERMINAL_STATUS",
      "This registration can no longer be updated",
    );
  }

  const event = await db.query.announcements.findFirst({
    where: eq(announcements.id, existing.announcementId),
  });
  if (!event) throw createError("NOT_FOUND", "Event not found");

  if (to === "Confirmed" && existing.status === "Pending") {
    const registered = await countRegisteredPartySize(event.id);
    const capacity = event.registrationCapacity ?? null;
    if (
      capacity !== null &&
      registered + existing.partySize > capacity
    ) {
      throw createError(
        "VALIDATION_ERROR",
        "Confirming would exceed event capacity",
      );
    }
  }

  const now = new Date();
  const [updated] = await db
    .update(eventRegistrations)
    .set({
      status: to,
      statusNote,
      updatedBy: editorId,
      updatedAt: now,
      notifiedAt: now,
    })
    .where(eq(eventRegistrations.id, id))
    .returning();

  void sendEmail(updated!, event);

  fireAudit({
    userId: editorId,
    module: "event_registrations",
    action: to.toLowerCase(),
    recordId: id,
    recordTitle: existing.registrationRef,
    before: auditSnap(existing),
    after: auditSnap(updated!),
  });

  const detail = await loadRegistrationDetail(eq(eventRegistrations.id, id));
  if (!detail) throw createError("INTERNAL", "Failed to load updated registration");
  return detail;
}

export const confirmEventRegistration = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => noteSchema.parse(raw))
  .handler(async ({ data }): Promise<EventRegistrationDetailDto> => {
    try {
      const editor = await requireEditorSession();
      return await updateRegistrationStatus(
        data.id,
        editor.id,
        "Pending",
        "Confirmed",
        data.note ?? null,
        async (row, event) => {
          await sendEventConfirmationEmail(
            rowToEmailData(row, eventToEmailData(event)),
          );
        },
      );
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to confirm registration",
      );
    }
  });

export const declineEventRegistration = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => requiredNoteSchema.parse(raw))
  .handler(async ({ data }): Promise<EventRegistrationDetailDto> => {
    try {
      const editor = await requireEditorSession();
      return await updateRegistrationStatus(
        data.id,
        editor.id,
        "Pending",
        "Declined",
        data.note,
        async (row, event) => {
          await sendEventDeclineEmail(
            rowToEmailData(row, eventToEmailData(event)),
            data.note,
          );
        },
      );
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to decline registration",
      );
    }
  });

export const cancelEventRegistration = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => requiredNoteSchema.parse(raw))
  .handler(async ({ data }): Promise<EventRegistrationDetailDto> => {
    try {
      const editor = await requireEditorSession();
      return await updateRegistrationStatus(
        data.id,
        editor.id,
        ["Pending", "Confirmed"],
        "Cancelled",
        data.note,
        async (row, event) => {
          const payload = rowToEmailData(row, eventToEmailData(event));
          payload.status_note = data.note;
          await sendEventCancellationEmail(payload);
        },
      );
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to cancel registration",
      );
    }
  });

export const checkInEventRegistration = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<EventRegistrationDetailDto> => {
    try {
      const editor = await requireEditorSession();
      return await updateRegistrationStatus(
        id,
        editor.id,
        "Confirmed",
        "CheckedIn",
        null,
        async () => {},
      );
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to check in",
      );
    }
  });

export const resendEventRegistrationNotification = createServerFn({
  method: "POST",
})
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<void> => {
    try {
      await requireEditorSession();
      const row = await db.query.eventRegistrations.findFirst({
        where: eq(eventRegistrations.id, id),
      });
      if (!row) throw createError("NOT_FOUND", "Registration not found");
      const event = await db.query.announcements.findFirst({
        where: eq(announcements.id, row.announcementId),
      });
      if (!event) throw createError("NOT_FOUND", "Event not found");
      await resendEventRegistrationEmail(
        rowToEmailData(row, eventToEmailData(event)),
      );
      await db
        .update(eventRegistrations)
        .set({ notifiedAt: new Date(), updatedAt: new Date() })
        .where(eq(eventRegistrations.id, id));
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to resend email",
      );
    }
  });

export const getEventTicketByToken = createServerFn({ method: "GET" })
  .inputValidator((token: unknown) => z.string().min(1).parse(token))
  .handler(
    async ({
      data: token,
    }): Promise<PublicEventRegistrationStatusDto | null> => {
      try {
        const rows = await db
          .select({
            registration: eventRegistrations,
            eventTitle: announcements.title,
            eventDate: announcements.eventDate,
            eventLocation: announcements.eventLocation,
          })
          .from(eventRegistrations)
          .innerJoin(
            announcements,
            eq(eventRegistrations.announcementId, announcements.id),
          )
          .where(eq(eventRegistrations.qrToken, token))
          .limit(1);
        const row = rows[0];
        if (!row) return null;
        const r = row.registration;
        if (r.status !== "Confirmed" && r.status !== "CheckedIn") return null;
        return {
          registration_ref: r.registrationRef,
          status: r.status as EventRegistrationStatus,
          event_title: row.eventTitle,
          event_date: row.eventDate ? String(row.eventDate) : null,
          event_location: row.eventLocation ?? null,
          party_size: r.partySize,
          status_note: null,
          qr_token: r.qrToken,
        };
      } catch (err) {
        if (isDbUnavailableError(err)) return null;
        if (isAppError(err)) throw err;
        throw createError(
          "INTERNAL",
          err instanceof Error ? err.message : "Failed to load ticket",
        );
      }
    },
  );
