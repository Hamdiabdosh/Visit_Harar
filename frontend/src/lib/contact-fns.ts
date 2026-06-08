import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index";
import { contactInfo, user } from "../../drizzle/schema/index";
import { auth } from "@/lib/auth.server";
import { createError, isAppError } from "@/lib/errors";
import { DB_SETUP_HINT, isDbUnavailableError } from "@/lib/db-errors";
import { contactInputSchema } from "@/lib/validators/contact";
import { auditSnap, fireAudit } from "@/lib/audit";

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

import type { UserRole } from "@/lib/types";

export type WorkingHoursRow = { day: string; hours: string };

export type ContactDto = {
  id: string;
  office_name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  country: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
  email_general: string | null;
  email_bookings: string | null;
  working_hours: WorkingHoursRow[];
  map_lat: number | null;
  map_lng: number | null;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  is_published: boolean;
  updated_by: string | null;
  updated_at: Date;
  updated_by_name?: string | null;
};

function parseWorkingHours(raw: unknown): WorkingHoursRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((r): r is WorkingHoursRow => {
      return (
        typeof r === "object" &&
        r !== null &&
        "day" in r &&
        "hours" in r &&
        typeof (r as WorkingHoursRow).day === "string" &&
        typeof (r as WorkingHoursRow).hours === "string"
      );
    })
    .map((r) => ({ day: r.day, hours: r.hours }));
}

function rowToDto(
  row: typeof contactInfo.$inferSelect,
  updatedByName?: string | null,
): ContactDto {
  return {
    id: row.id,
    office_name: row.officeName ?? null,
    address_line1: row.addressLine1 ?? null,
    address_line2: row.addressLine2 ?? null,
    country: row.country ?? null,
    phone_primary: row.phonePrimary ?? null,
    phone_secondary: row.phoneSecondary ?? null,
    email_general: row.emailGeneral ?? null,
    email_bookings: row.emailBookings ?? null,
    working_hours: parseWorkingHours(row.workingHours),
    map_lat: row.mapLat ? Number(row.mapLat) : null,
    map_lng: row.mapLng ? Number(row.mapLng) : null,
    facebook_url: row.facebookUrl ?? null,
    twitter_url: row.twitterUrl ?? null,
    instagram_url: row.instagramUrl ?? null,
    is_published: row.isPublished,
    updated_by: row.updatedBy ?? null,
    updated_at: row.updatedAt,
    updated_by_name: updatedByName ?? null,
  };
}

function inputToRowValues(
  data: z.infer<typeof contactInputSchema>,
  userId: string,
) {
  return {
    officeName: data.office_name ?? null,
    addressLine1: data.address_line1 ?? null,
    addressLine2: data.address_line2 ?? null,
    country: data.country ?? "Ethiopia",
    phonePrimary: data.phone_primary ?? null,
    phoneSecondary: data.phone_secondary ?? null,
    emailGeneral: data.email_general ?? null,
    emailBookings: data.email_bookings ?? null,
    workingHours: data.working_hours ?? [],
    mapLat: data.map_lat != null ? String(data.map_lat) : null,
    mapLng: data.map_lng != null ? String(data.map_lng) : null,
    facebookUrl: data.facebook_url ?? null,
    twitterUrl: data.twitter_url ?? null,
    instagramUrl: data.instagram_url ?? null,
    isPublished: data.is_published ?? false,
    updatedBy: userId,
    updatedAt: new Date(),
  };
}

async function fetchContactDto(
  publishedOnly?: boolean,
): Promise<ContactDto | null> {
  const rows = await db.select().from(contactInfo).limit(1);
  const row = rows[0];
  if (!row) return null;
  if (publishedOnly && !row.isPublished) return null;

  let updatedByName: string | null = null;
  if (row.updatedBy) {
    const [u] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, row.updatedBy))
      .limit(1);
    updatedByName = u?.name ?? null;
  }
  return rowToDto(row, updatedByName);
}

export const getContactInfo = createServerFn({ method: "GET" }).handler(
  async (): Promise<ContactDto | null> => {
    try {
      return await fetchContactDto();
    } catch (err) {
      if (isDbUnavailableError(err)) return null;
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load contact",
      );
    }
  },
);

export const getPublishedContactInfo = createServerFn({
  method: "GET",
}).handler(async (): Promise<ContactDto | null> => {
  try {
    return await fetchContactDto(true);
  } catch (err) {
    if (isDbUnavailableError(err)) {
      console.error("[getPublishedContactInfo]", DB_SETUP_HINT);
      return null;
    }
    if (isAppError(err)) throw err;
    throw createError(
      "INTERNAL",
      err instanceof Error ? err.message : "Failed to load contact",
    );
  }
});

export const upsertContactInfo = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => contactInputSchema.parse(raw))
  .handler(async ({ data }): Promise<ContactDto> => {
    try {
      const editor = await requireEditorSession();
      const values = inputToRowValues(data, editor.id);
      const existing = await db.select().from(contactInfo).limit(1);
      const prev = existing[0];

      if (prev) {
        const [updated] = await db
          .update(contactInfo)
          .set(values)
          .where(eq(contactInfo.id, prev.id))
          .returning();
        fireAudit({
          userId: editor.id,
          module: "contact",
          action: "update",
          recordId: updated!.id,
          recordTitle: updated!.officeName ?? "Contact info",
          before: auditSnap(prev),
          after: auditSnap(updated!),
        });
        return rowToDto(updated!, editor.name);
      }

      const [inserted] = await db
        .insert(contactInfo)
        .values(values)
        .returning();
      fireAudit({
        userId: editor.id,
        module: "contact",
        action: "create",
        recordId: inserted!.id,
        recordTitle: inserted!.officeName ?? "Contact info",
        after: auditSnap(inserted!),
      });
      return rowToDto(inserted!, editor.name);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to save contact",
      );
    }
  });

export const publishContact = createServerFn({ method: "POST" }).handler(
  async (): Promise<ContactDto> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.select().from(contactInfo).limit(1);
      const prev = existing[0];
      if (!prev)
        throw createError("NOT_FOUND", "Contact info not configured yet");

      const [updated] = await db
        .update(contactInfo)
        .set({ isPublished: true, updatedBy: editor.id, updatedAt: new Date() })
        .where(eq(contactInfo.id, prev.id))
        .returning();
      fireAudit({
        userId: editor.id,
        module: "contact",
        action: "publish",
        recordId: updated!.id,
        recordTitle: updated!.officeName ?? "Contact info",
        before: { is_published: prev.isPublished },
        after: { is_published: true },
      });
      return rowToDto(updated!, editor.name);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to publish",
      );
    }
  },
);

export const unpublishContact = createServerFn({ method: "POST" }).handler(
  async (): Promise<ContactDto> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.select().from(contactInfo).limit(1);
      const prev = existing[0];
      if (!prev)
        throw createError("NOT_FOUND", "Contact info not configured yet");

      const [updated] = await db
        .update(contactInfo)
        .set({
          isPublished: false,
          updatedBy: editor.id,
          updatedAt: new Date(),
        })
        .where(eq(contactInfo.id, prev.id))
        .returning();
      fireAudit({
        userId: editor.id,
        module: "contact",
        action: "unpublish",
        recordId: updated!.id,
        recordTitle: updated!.officeName ?? "Contact info",
        before: { is_published: prev.isPublished },
        after: { is_published: false },
      });
      return rowToDto(updated!, editor.name);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to unpublish",
      );
    }
  },
);
