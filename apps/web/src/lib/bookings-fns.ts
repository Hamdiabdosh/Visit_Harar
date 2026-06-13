import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, count, desc, eq, gte, lte, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../../db/index";
import { bookings, guides, user } from "../../../../drizzle/schema/index";
import { auth } from "@/lib/auth.server";
import { generateBookingRef } from "@/lib/booking-ref";
import {
  resendBookingNotification,
  sendCancellationEmail,
  sendConfirmationEmail,
  sendDeclineEmail,
  sendNewBookingAlert,
  type BookingEmailData,
  type GuideEmailData,
} from "@/lib/email";
import { createError, isAppError } from "@/lib/errors";
import { isDbUnavailableError } from "@/lib/db-errors";
import { getBookingEnabled } from "@/lib/settings";
import { bookingInputSchema } from "@/lib/validators/bookings";
import type { BookingStatus, TourDuration, UserRole } from "@/lib/types";
import { auditSnap, fireAudit } from "@/lib/audit";
import { notifyBookingStatusChange } from "@/lib/push/notify";

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

export type BookingListDto = {
  id: string;
  booking_ref: string;
  guide_id: string;
  guide_name: string;
  visitor_name: string;
  visitor_email: string;
  visitor_country: string;
  tour_date: string;
  tour_duration: TourDuration;
  group_size: number;
  status: BookingStatus;
  created_at: Date;
};

export type BookingDetailDto = BookingListDto & {
  visitor_phone: string | null;
  special_requests: string | null;
  status_note: string | null;
  notified_at: Date | null;
  updated_by: string | null;
  updated_by_name: string | null;
  updated_at: Date;
  guide: {
    id: string;
    name: string;
    photo: string | null;
    phone: string | null;
    email: string | null;
    license_number: string | null;
    languages: string[];
    specialties: string[];
  };
};

export type PublicBookingStatusDto = {
  booking_ref: string;
  status: BookingStatus;
  guide_name: string;
  tour_date: string;
  tour_duration: TourDuration;
  group_size: number;
  status_note: string | null;
};

const statusSchema = z.enum(["Pending", "Confirmed", "Declined", "Cancelled"]);

const listFiltersSchema = z
  .object({
    status: statusSchema.optional(),
    guide_id: z.string().uuid().optional(),
    date_from: z.string().date().optional(),
    date_to: z.string().date().optional(),
  })
  .optional();

function rowToEmailData(row: typeof bookings.$inferSelect): BookingEmailData {
  return {
    booking_ref: row.bookingRef,
    visitor_name: row.visitorName,
    visitor_email: row.visitorEmail,
    visitor_phone: row.visitorPhone,
    visitor_country: row.visitorCountry,
    tour_date: String(row.tourDate),
    tour_duration: row.tourDuration as TourDuration,
    group_size: row.groupSize,
    special_requests: row.specialRequests,
    status: row.status as BookingStatus,
    status_note: row.statusNote,
  };
}

function guideToEmailData(row: typeof guides.$inferSelect): GuideEmailData {
  return {
    name: row.name,
    phone: row.phone,
    email: row.email,
  };
}

async function loadBookingDetail(where: SQL): Promise<BookingDetailDto | null> {
  const rows = await db
    .select({
      booking: bookings,
      guide: guides,
      editorName: user.name,
    })
    .from(bookings)
    .innerJoin(guides, eq(bookings.guideId, guides.id))
    .leftJoin(user, eq(bookings.updatedBy, user.id))
    .where(where)
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const b = row.booking;
  const g = row.guide;
  return {
    id: b.id,
    booking_ref: b.bookingRef,
    guide_id: g.id,
    guide_name: g.name,
    visitor_name: b.visitorName,
    visitor_email: b.visitorEmail,
    visitor_phone: b.visitorPhone,
    visitor_country: b.visitorCountry,
    tour_date: String(b.tourDate),
    tour_duration: b.tourDuration as TourDuration,
    group_size: b.groupSize,
    special_requests: b.specialRequests,
    status: b.status as BookingStatus,
    status_note: b.statusNote,
    notified_at: b.notifiedAt,
    created_at: b.createdAt,
    updated_by: b.updatedBy,
    updated_by_name: row.editorName ?? null,
    updated_at: b.updatedAt,
    guide: {
      id: g.id,
      name: g.name,
      photo: g.photo,
      phone: g.phone,
      email: g.email,
      license_number: g.licenseNumber,
      languages: g.languages ?? [],
      specialties: g.specialties ?? [],
    },
  };
}

export const getBookings = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => listFiltersSchema.parse(raw))
  .handler(async ({ data: filters }): Promise<BookingListDto[]> => {
    try {
      await requireEditorSession();
      const conditions = [];
      if (filters?.status) conditions.push(eq(bookings.status, filters.status));
      if (filters?.guide_id)
        conditions.push(eq(bookings.guideId, filters.guide_id));
      if (filters?.date_from)
        conditions.push(gte(bookings.tourDate, filters.date_from));
      if (filters?.date_to)
        conditions.push(lte(bookings.tourDate, filters.date_to));

      let query = db
        .select({
          id: bookings.id,
          booking_ref: bookings.bookingRef,
          guide_id: bookings.guideId,
          guide_name: guides.name,
          visitor_name: bookings.visitorName,
          visitor_email: bookings.visitorEmail,
          visitor_country: bookings.visitorCountry,
          tour_date: bookings.tourDate,
          tour_duration: bookings.tourDuration,
          group_size: bookings.groupSize,
          status: bookings.status,
          created_at: bookings.createdAt,
        })
        .from(bookings)
        .innerJoin(guides, eq(bookings.guideId, guides.id))
        .orderBy(desc(bookings.createdAt));

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }

      const rows = await query;
      return rows.map((r) => ({
        id: r.id,
        booking_ref: r.booking_ref,
        guide_id: r.guide_id,
        guide_name: r.guide_name,
        visitor_name: r.visitor_name,
        visitor_email: r.visitor_email,
        visitor_country: r.visitor_country,
        tour_date: String(r.tour_date),
        tour_duration: r.tour_duration as TourDuration,
        group_size: r.group_size,
        status: r.status as BookingStatus,
        created_at: r.created_at,
      }));
    } catch (err) {
      if (isDbUnavailableError(err)) return [];
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to list bookings",
      );
    }
  });

export const getBookingById = createServerFn({ method: "GET" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<BookingDetailDto | null> => {
    try {
      await requireEditorSession();
      return await loadBookingDetail(eq(bookings.id, id));
    } catch (err) {
      if (isDbUnavailableError(err)) return null;
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load booking",
      );
    }
  });

export const getBookingByRefForAdmin = createServerFn({ method: "GET" })
  .inputValidator((ref: unknown) => z.string().min(1).parse(ref))
  .handler(async ({ data: ref }): Promise<BookingDetailDto | null> => {
    try {
      await requireEditorSession();
      return await loadBookingDetail(eq(bookings.bookingRef, ref));
    } catch (err) {
      if (isDbUnavailableError(err)) return null;
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load booking",
      );
    }
  });

const statusCheckSchema = z.object({
  booking_ref: z.string().min(1),
  visitor_email: z.string().email(),
});

export const getBookingByRef = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => statusCheckSchema.parse(raw))
  .handler(async ({ data }): Promise<PublicBookingStatusDto | null> => {
    try {
      const ref = data.booking_ref.trim();
      const email = data.visitor_email.trim().toLowerCase();
      const rows = await db
        .select({
          booking: bookings,
          guideName: guides.name,
        })
        .from(bookings)
        .innerJoin(guides, eq(bookings.guideId, guides.id))
        .where(
          and(
            eq(bookings.bookingRef, ref),
            sql`lower(${bookings.visitorEmail}) = ${email}`,
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row) return null;
      const b = row.booking;
      return {
        booking_ref: b.bookingRef,
        status: b.status as BookingStatus,
        guide_name: row.guideName,
        tour_date: String(b.tourDate),
        tour_duration: b.tourDuration as TourDuration,
        group_size: b.groupSize,
        status_note: b.status === "Declined" ? b.statusNote : null,
      };
    } catch (err) {
      if (isDbUnavailableError(err)) return null;
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to look up booking",
      );
    }
  });

export const getPendingBookingsCount = createServerFn({
  method: "GET",
}).handler(async (): Promise<number> => {
  try {
    await requireEditorSession();
    const [row] = await db
      .select({ n: count() })
      .from(bookings)
      .where(eq(bookings.status, "Pending"));
    return Number(row?.n ?? 0);
  } catch (err) {
    if (isDbUnavailableError(err)) return 0;
    if (isAppError(err)) throw err;
    throw createError(
      "INTERNAL",
      err instanceof Error ? err.message : "Failed to count bookings",
    );
  }
});

export const getBookingEnabledFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<boolean> => {
    try {
      return await getBookingEnabled();
    } catch {
      return true;
    }
  },
);

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => bookingInputSchema.parse(raw))
  .handler(async ({ data }): Promise<{ booking_ref: string }> => {
    try {
      const enabled = await getBookingEnabled();
      if (!enabled) {
        throw createError(
          "FORBIDDEN",
          "Booking requests are temporarily unavailable",
        );
      }

      const guide = await db.query.guides.findFirst({
        where: eq(guides.id, data.guide_id),
      });
      if (!guide || !guide.isPublished || !guide.isAvailable) {
        throw createError(
          "VALIDATION_ERROR",
          "Selected guide is not available for booking",
        );
      }

      const bookingRef = await db.transaction(async (tx) => {
        const ref = await generateBookingRef(tx);
        await tx.insert(bookings).values({
          bookingRef: ref,
          guideId: data.guide_id,
          visitorName: data.visitor_name,
          visitorEmail: data.visitor_email,
          visitorPhone: data.visitor_phone ?? null,
          visitorCountry: data.visitor_country,
          tourDate: data.tour_date,
          tourDuration: data.tour_duration,
          groupSize: data.group_size,
          specialRequests: data.special_requests ?? null,
          status: "Pending",
        });
        return ref;
      });

      const emailBooking: BookingEmailData = {
        booking_ref: bookingRef,
        visitor_name: data.visitor_name,
        visitor_email: data.visitor_email,
        visitor_phone: data.visitor_phone ?? null,
        visitor_country: data.visitor_country,
        tour_date: data.tour_date,
        tour_duration: data.tour_duration,
        group_size: data.group_size,
        special_requests: data.special_requests ?? null,
        status: "Pending",
        status_note: null,
      };
      void sendNewBookingAlert(emailBooking, guideToEmailData(guide));

      const inserted = await db.query.bookings.findFirst({
        where: eq(bookings.bookingRef, bookingRef),
      });
      if (inserted) {
        fireAudit({
          module: "bookings",
          action: "create",
          recordId: inserted.id,
          recordTitle: bookingRef,
          after: auditSnap(inserted),
        });
      }

      return { booking_ref: bookingRef };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to create booking",
      );
    }
  });

const noteSchema = z.object({
  id: z.string().uuid(),
  note: z.string().max(2000).optional(),
});

const requiredNoteSchema = z.object({
  id: z.string().uuid(),
  note: z.string().min(1).max(2000),
});

async function updateBookingStatus(
  id: string,
  editorId: string,
  from: BookingStatus,
  to: BookingStatus,
  statusNote: string | null,
  sendEmail: (
    row: typeof bookings.$inferSelect,
    guide: typeof guides.$inferSelect,
  ) => Promise<void>,
): Promise<BookingDetailDto> {
  const existing = await db.query.bookings.findFirst({
    where: eq(bookings.id, id),
  });
  if (!existing) throw createError("NOT_FOUND", "Booking not found");
  if (existing.status !== from) {
    throw createError(
      "VALIDATION_ERROR",
      `Cannot change status from ${existing.status} to ${to}`,
    );
  }
  if (existing.status === "Declined" || existing.status === "Cancelled") {
    throw createError(
      "TERMINAL_STATUS",
      "This booking can no longer be updated",
    );
  }

  const guide = await db.query.guides.findFirst({
    where: eq(guides.id, existing.guideId),
  });
  if (!guide) throw createError("NOT_FOUND", "Guide not found");

  const now = new Date();
  const [updated] = await db
    .update(bookings)
    .set({
      status: to,
      statusNote,
      updatedBy: editorId,
      updatedAt: now,
      notifiedAt: now,
    })
    .where(eq(bookings.id, id))
    .returning();

  void sendEmail(updated!, guide);

  void notifyBookingStatusChange({
    visitorEmail: updated!.visitorEmail,
    bookingRef: updated!.bookingRef,
    status: to,
    guideName: guide.name,
    tourDate: String(updated!.tourDate),
  });

  const actionMap: Record<BookingStatus, string> = {
    Pending: "update",
    Confirmed: "confirm",
    Declined: "decline",
    Cancelled: "cancel",
  };
  fireAudit({
    userId: editorId,
    module: "bookings",
    action: actionMap[to],
    recordId: id,
    recordTitle: existing.bookingRef,
    before: auditSnap(existing),
    after: auditSnap(updated!),
  });

  const detail = await loadBookingDetail(eq(bookings.id, id));
  if (!detail) throw createError("INTERNAL", "Failed to load updated booking");
  return detail;
}

export const confirmBooking = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => noteSchema.parse(raw))
  .handler(async ({ data }): Promise<BookingDetailDto> => {
    try {
      const editor = await requireEditorSession();
      return await updateBookingStatus(
        data.id,
        editor.id,
        "Pending",
        "Confirmed",
        data.note ?? null,
        async (row, guide) => {
          await sendConfirmationEmail(
            rowToEmailData(row),
            guideToEmailData(guide),
          );
        },
      );
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to confirm booking",
      );
    }
  });

export const declineBooking = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => requiredNoteSchema.parse(raw))
  .handler(async ({ data }): Promise<BookingDetailDto> => {
    try {
      const editor = await requireEditorSession();
      return await updateBookingStatus(
        data.id,
        editor.id,
        "Pending",
        "Declined",
        data.note,
        async (row) => {
          await sendDeclineEmail(rowToEmailData(row), data.note);
        },
      );
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to decline booking",
      );
    }
  });

export const cancelBooking = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => requiredNoteSchema.parse(raw))
  .handler(async ({ data }): Promise<BookingDetailDto> => {
    try {
      const editor = await requireEditorSession();
      return await updateBookingStatus(
        data.id,
        editor.id,
        "Confirmed",
        "Cancelled",
        data.note,
        async (row) => {
          const payload = rowToEmailData(row);
          payload.status_note = data.note;
          await sendCancellationEmail(payload);
        },
      );
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to cancel booking",
      );
    }
  });

export const resendNotification = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<void> => {
    try {
      await requireEditorSession();
      const row = await db.query.bookings.findFirst({
        where: eq(bookings.id, id),
      });
      if (!row) throw createError("NOT_FOUND", "Booking not found");
      const guide = await db.query.guides.findFirst({
        where: eq(guides.id, row.guideId),
      });
      if (!guide) throw createError("NOT_FOUND", "Guide not found");
      await resendBookingNotification(
        rowToEmailData(row),
        guideToEmailData(guide),
      );
      await db
        .update(bookings)
        .set({ notifiedAt: new Date(), updatedAt: new Date() })
        .where(eq(bookings.id, id));
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to resend email",
      );
    }
  });
