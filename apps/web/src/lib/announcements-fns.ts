import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, count, desc, eq, inArray, ne, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../../db/index";
import { announcements } from "../../../../drizzle/schema/index";
import { auth } from "@/lib/auth.server";
import { createError, isAppError } from "@/lib/errors";
import { DB_SETUP_HINT, isDbUnavailableError } from "@/lib/db-errors";
import {
  deleteImage,
  publicIdFromUrl,
  uploadImageBuffer,
} from "@/lib/storage.server";
import { ensureUniqueSlug, generateSlug } from "@/lib/slug";
import { announcementInputSchema } from "@/lib/validators/announcements";
import type { AnnouncementType, UserRole } from "@/lib/types";
import { auditSnap, fireAudit } from "@/lib/audit";
import { scheduleAnnouncementPush } from "@/lib/push/announcement-hook";
import {
  buildEventRegistrationMeta,
  type EventRegistrationMeta,
} from "@/lib/event-registration-meta";

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
  return { id: session.user.id };
}

export type AnnouncementDto = {
  id: string;
  title: string;
  slug: string;
  type: AnnouncementType;
  body: string | null;
  cover_image: string | null;
  event_date: string | null;
  event_location: string | null;
  registration_enabled: boolean;
  registration_capacity: number | null;
  registration_deadline: string | null;
  registration_note: string | null;
  registration_auto_confirm: boolean;
  registration?: EventRegistrationMeta | null;
  is_pinned: boolean;
  is_published: boolean;
  published_at: Date | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
};

function rowToDto(
  row: typeof announcements.$inferSelect,
  registration?: EventRegistrationMeta | null,
): AnnouncementDto {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    type: row.type as AnnouncementType,
    body: row.body ?? null,
    cover_image: row.coverImage ?? null,
    event_date: row.eventDate ? String(row.eventDate) : null,
    event_location: row.eventLocation ?? null,
    registration_enabled: row.registrationEnabled,
    registration_capacity: row.registrationCapacity ?? null,
    registration_deadline: row.registrationDeadline
      ? String(row.registrationDeadline)
      : null,
    registration_note: row.registrationNote ?? null,
    registration_auto_confirm: row.registrationAutoConfirm,
    registration: registration ?? null,
    is_pinned: row.isPinned,
    is_published: row.isPublished,
    published_at: row.publishedAt ?? null,
    created_by: row.createdBy ?? null,
    updated_by: row.updatedBy ?? null,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

const listFiltersSchema = z
  .object({
    type: z.enum(["News", "Event", "Notice"]).optional(),
    publishedOnly: z.boolean().optional(),
    page: z.number().int().min(1).default(1),
    perPage: z.number().int().min(1).max(50).default(10),
  })
  .optional();

export const getAnnouncements = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => listFiltersSchema.parse(raw))
  .handler(
    async ({
      data: filters,
    }): Promise<{
      items: AnnouncementDto[];
      total: number;
      page: number;
      perPage: number;
    }> => {
      const page = filters?.page ?? 1;
      const perPage = filters?.perPage ?? 10;
      try {
        const conditions = [];
        if (filters?.type)
          conditions.push(eq(announcements.type, filters.type));
        if (filters?.publishedOnly)
          conditions.push(eq(announcements.isPublished, true));

        const where = conditions.length ? and(...conditions) : undefined;

        const [{ total }] = await db
          .select({ total: count(announcements.id) })
          .from(announcements)
          .where(where);

        const rows = await db
          .select()
          .from(announcements)
          .where(where)
          .orderBy(
            desc(announcements.isPinned),
            desc(announcements.publishedAt),
            desc(announcements.updatedAt),
          )
          .limit(perPage)
          .offset((page - 1) * perPage);

        return {
          items: rows.map(rowToDto),
          total: Number(total ?? 0),
          page,
          perPage,
        };
      } catch (err) {
        if (isDbUnavailableError(err)) {
          console.error("[getAnnouncements]", DB_SETUP_HINT);
          return { items: [], total: 0, page, perPage };
        }
        if (isAppError(err)) throw err;
        throw createError(
          "INTERNAL",
          err instanceof Error ? err.message : "Failed to list announcements",
        );
      }
    },
  );

export const getAnnouncementBySlug = createServerFn({ method: "GET" })
  .inputValidator((slug: unknown) => z.string().min(1).parse(slug))
  .handler(async ({ data: slug }): Promise<AnnouncementDto | null> => {
    try {
      const row = await db.query.announcements.findFirst({
        where: and(
          eq(announcements.slug, slug),
          eq(announcements.isPublished, true),
        ),
      });
      if (!row) return null;
      const meta = await buildEventRegistrationMeta(row);
      return rowToDto(row, meta);
    } catch (err) {
      if (isDbUnavailableError(err)) return null;
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load announcement",
      );
    }
  });

export const getAnnouncementById = createServerFn({ method: "GET" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<AnnouncementDto | null> => {
    try {
      await requireEditorSession();
      const row = await db.query.announcements.findFirst({
        where: eq(announcements.id, id),
      });
      if (!row) return null;
      const meta = await buildEventRegistrationMeta(row);
      return rowToDto(row, meta);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load announcement",
      );
    }
  });

export const getLatestAnnouncements = createServerFn({ method: "GET" })
  .inputValidator((n: unknown) => z.number().int().min(1).max(10).parse(n))
  .handler(async ({ data: n }): Promise<AnnouncementDto[]> => {
    try {
      const rows = await db
        .select()
        .from(announcements)
        .where(eq(announcements.isPublished, true))
        .orderBy(
          desc(announcements.isPinned),
          desc(announcements.publishedAt),
          desc(announcements.updatedAt),
        )
        .limit(n);
      return rows.map(rowToDto);
    } catch (err) {
      if (isDbUnavailableError(err)) {
        console.error("[getLatestAnnouncements]", DB_SETUP_HINT);
        return [];
      }
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load latest",
      );
    }
  });

export const createAnnouncement = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => announcementInputSchema.parse(raw))
  .handler(async ({ data }): Promise<AnnouncementDto> => {
    try {
      const editor = await requireEditorSession();

      const baseSlug = generateSlug(data.slug || data.title);
      const slug = await ensureUniqueSlug(baseSlug, async (candidate) => {
        const existing = await db.query.announcements.findFirst({
          where: eq(announcements.slug, candidate),
        });
        return Boolean(existing);
      });

      const isEvent = data.type === "Event";
      const eventDate =
        isEvent && data.event_date ? new Date(data.event_date) : null;
      const eventLocation = isEvent ? (data.event_location ?? null) : null;
      const registrationEnabled = isEvent
        ? Boolean(data.registration_enabled)
        : false;
      const registrationCapacity =
        isEvent && registrationEnabled
          ? (data.registration_capacity ?? null)
          : null;
      const registrationDeadline =
        isEvent && registrationEnabled && data.registration_deadline
          ? new Date(data.registration_deadline)
          : null;
      const registrationNote = isEvent
        ? (data.registration_note ?? null)
        : null;
      const registrationAutoConfirm = isEvent
        ? Boolean(data.registration_auto_confirm ?? true)
        : true;

      const now = new Date();
      const shouldPublish = Boolean(data.is_published);
      const publishedAt = shouldPublish ? now : null;

      const [row] = await db
        .insert(announcements)
        .values({
          title: data.title,
          slug,
          type: data.type,
          body: data.body ?? null,
          coverImage: data.cover_image ?? null,
          eventDate,
          eventLocation,
          registrationEnabled,
          registrationCapacity,
          registrationDeadline,
          registrationNote,
          registrationAutoConfirm,
          isPinned: Boolean(data.is_pinned),
          isPublished: shouldPublish,
          publishedAt,
          createdBy: editor.id,
          updatedBy: editor.id,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      if (data.is_pinned) {
        // enforce single pinned
        await db
          .update(announcements)
          .set({ isPinned: false })
          .where(
            and(
              ne(announcements.id, row!.id),
              eq(announcements.isPinned, true),
            ),
          );
      }

      fireAudit({
        userId: editor.id,
        module: "announcements",
        action: "create",
        recordId: row!.id,
        recordTitle: row!.title,
        after: auditSnap(row!),
      });

      scheduleAnnouncementPush({ isPublished: false }, row!);

      return rowToDto(row!);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to create announcement",
      );
    }
  });

export const updateAnnouncement = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const schema = z.object({
      id: z.string().uuid(),
      data: announcementInputSchema.partial().extend({
        title: z.string().min(1).max(200).optional(),
        type: z.enum(["News", "Event", "Notice"]).optional(),
      }),
    });
    return schema.parse(raw);
  })
  .handler(async ({ data: { id, data } }): Promise<AnnouncementDto> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.query.announcements.findFirst({
        where: eq(announcements.id, id),
      });
      if (!existing) throw createError("NOT_FOUND", "Announcement not found");

      let slug = existing.slug;
      if (data.slug) {
        const desired = generateSlug(data.slug);
        slug = await ensureUniqueSlug(desired, async (candidate) => {
          const row = await db.query.announcements.findFirst({
            where: and(
              eq(announcements.slug, candidate),
              ne(announcements.id, id),
            ),
          });
          return Boolean(row);
        });
      } else if (data.title) {
        const desired = generateSlug(data.title);
        if (desired && desired !== existing.slug) {
          slug = await ensureUniqueSlug(desired, async (candidate) => {
            const row = await db.query.announcements.findFirst({
              where: and(
                eq(announcements.slug, candidate),
                ne(announcements.id, id),
              ),
            });
            return Boolean(row);
          });
        }
      }

      const nextType = (data.type ?? existing.type) as AnnouncementType;
      const isEvent = nextType === "Event";
      const nextEventDate = isEvent
        ? data.event_date !== undefined
          ? data.event_date
            ? new Date(data.event_date)
            : null
          : existing.eventDate
        : null;
      const nextEventLocation = isEvent
        ? data.event_location !== undefined
          ? (data.event_location ?? null)
          : existing.eventLocation
        : null;
      const nextRegistrationEnabled = isEvent
        ? data.registration_enabled !== undefined
          ? Boolean(data.registration_enabled)
          : existing.registrationEnabled
        : false;
      const nextRegistrationCapacity =
        isEvent && nextRegistrationEnabled
          ? data.registration_capacity !== undefined
            ? (data.registration_capacity ?? null)
            : existing.registrationCapacity
          : null;
      const nextRegistrationDeadline =
        isEvent && nextRegistrationEnabled
          ? data.registration_deadline !== undefined
            ? data.registration_deadline
              ? new Date(data.registration_deadline)
              : null
            : existing.registrationDeadline
          : null;
      const nextRegistrationNote = isEvent
        ? data.registration_note !== undefined
          ? (data.registration_note ?? null)
          : existing.registrationNote
        : null;
      const nextRegistrationAutoConfirm = isEvent
        ? data.registration_auto_confirm !== undefined
          ? Boolean(data.registration_auto_confirm)
          : existing.registrationAutoConfirm
        : true;

      // published_at set once on first publish
      const nextPublished = data.is_published ?? existing.isPublished;
      const nextPublishedAt =
        !existing.isPublished && nextPublished
          ? new Date()
          : existing.publishedAt;

      if (
        data.cover_image &&
        existing.coverImage &&
        data.cover_image !== existing.coverImage
      ) {
        const publicId = publicIdFromUrl(existing.coverImage);
        if (publicId) await deleteImage(publicId).catch(() => undefined);
      }

      const [updated] = await db
        .update(announcements)
        .set({
          title: data.title ?? existing.title,
          slug,
          type: nextType,
          body: data.body !== undefined ? (data.body ?? null) : existing.body,
          coverImage:
            data.cover_image !== undefined
              ? (data.cover_image ?? null)
              : existing.coverImage,
          eventDate: nextEventDate,
          eventLocation: nextEventLocation,
          registrationEnabled: nextRegistrationEnabled,
          registrationCapacity: nextRegistrationCapacity,
          registrationDeadline: nextRegistrationDeadline,
          registrationNote: nextRegistrationNote,
          registrationAutoConfirm: nextRegistrationAutoConfirm,
          isPinned: data.is_pinned ?? existing.isPinned,
          isPublished: nextPublished,
          publishedAt: nextPublishedAt,
          updatedBy: editor.id,
          updatedAt: new Date(),
        })
        .where(eq(announcements.id, id))
        .returning();

      if (data.is_pinned === true) {
        await db
          .update(announcements)
          .set({ isPinned: false })
          .where(
            and(ne(announcements.id, id), eq(announcements.isPinned, true)),
          );
      }

      fireAudit({
        userId: editor.id,
        module: "announcements",
        action: "update",
        recordId: id,
        recordTitle: updated!.title,
        before: auditSnap(existing),
        after: auditSnap(updated!),
      });

      scheduleAnnouncementPush(existing, updated!);

      return rowToDto(updated!);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to update announcement",
      );
    }
  });

export const deleteAnnouncement = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ success: true }> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.query.announcements.findFirst({
        where: eq(announcements.id, id),
      });
      if (!existing) throw createError("NOT_FOUND", "Announcement not found");
      if (existing.coverImage) {
        const publicId = publicIdFromUrl(existing.coverImage);
        if (publicId) await deleteImage(publicId).catch(() => undefined);
      }
      await db.delete(announcements).where(eq(announcements.id, id));
      fireAudit({
        userId: editor.id,
        module: "announcements",
        action: "delete",
        recordId: id,
        recordTitle: existing.title,
        before: auditSnap(existing),
      });
      return { success: true };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to delete announcement",
      );
    }
  });

export const bulkSetPublished = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const schema = z.object({
      ids: z.array(z.string().uuid()).min(1).max(50),
      publish: z.boolean(),
    });
    return schema.parse(raw);
  })
  .handler(async ({ data }): Promise<{ updated: number }> => {
    try {
      const editor = await requireEditorSession();
      const now = new Date();
      const rows = await db
        .select()
        .from(announcements)
        .where(inArray(announcements.id, data.ids));

      if (!rows.length) return { updated: 0 };

      let updated = 0;
      await db.transaction(async (tx) => {
        for (const row of rows) {
          if (row.isPublished === data.publish) continue;
          const publishedAt =
            !row.isPublished && data.publish ? now : row.publishedAt;
          await tx
            .update(announcements)
            .set({
              isPublished: data.publish,
              publishedAt,
              updatedBy: editor.id,
              updatedAt: now,
            })
            .where(eq(announcements.id, row.id));
          fireAudit({
            userId: editor.id,
            module: "announcements",
            action: data.publish ? "publish" : "unpublish",
            recordId: row.id,
            recordTitle: row.title,
            before: { is_published: row.isPublished },
            after: { is_published: data.publish },
          });
          if (data.publish) {
            scheduleAnnouncementPush(row, {
              ...row,
              isPublished: true,
              publishedAt,
            });
          }
          updated += 1;
        }
      });

      return { updated };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to bulk update",
      );
    }
  });

export const togglePublished = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ is_published: boolean }> => {
    try {
      const editor = await requireEditorSession();
      const row = await db.query.announcements.findFirst({
        where: eq(announcements.id, id),
      });
      if (!row) throw createError("NOT_FOUND", "Announcement not found");
      const next = !row.isPublished;
      const publishedAt =
        !row.isPublished && next ? new Date() : row.publishedAt;
      await db
        .update(announcements)
        .set({
          isPublished: next,
          publishedAt,
          updatedBy: editor.id,
          updatedAt: new Date(),
        })
        .where(eq(announcements.id, id));
      fireAudit({
        userId: editor.id,
        module: "announcements",
        action: next ? "publish" : "unpublish",
        recordId: id,
        recordTitle: row.title,
        before: { is_published: row.isPublished },
        after: { is_published: next },
      });
      if (next) {
        scheduleAnnouncementPush(row, {
          ...row,
          isPublished: true,
          publishedAt,
        });
      }
      return { is_published: next };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to toggle published",
      );
    }
  });

export const pinAnnouncement = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ success: true }> => {
    try {
      const editor = await requireEditorSession();
      const row = await db.query.announcements.findFirst({
        where: eq(announcements.id, id),
      });
      if (!row) throw createError("NOT_FOUND", "Announcement not found");
      await db.transaction(async (tx) => {
        await tx
          .update(announcements)
          .set({ isPinned: false })
          .where(eq(announcements.isPinned, true));
        await tx
          .update(announcements)
          .set({ isPinned: true })
          .where(eq(announcements.id, id));
      });
      fireAudit({
        userId: editor.id,
        module: "announcements",
        action: "pin",
        recordId: id,
        recordTitle: row.title,
        before: { is_pinned: row.isPinned },
        after: { is_pinned: true },
      });
      return { success: true };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to pin",
      );
    }
  });

export const unpinAnnouncement = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ success: true }> => {
    try {
      await requireEditorSession();
      await db
        .update(announcements)
        .set({ isPinned: false })
        .where(eq(announcements.id, id));
      return { success: true };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to unpin",
      );
    }
  });

const uploadImageInputSchema = z.object({
  filename: z.string().min(1),
  data: z.string().min(1),
});

export const uploadAnnouncementCover = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => uploadImageInputSchema.parse(raw))
  .handler(async ({ data }): Promise<{ url: string; publicId: string }> => {
    try {
      await requireEditorSession();
      const buffer = Buffer.from(data.data, "base64");
      return await uploadImageBuffer(
        buffer,
        data.filename,
        "visit-harar/announcements",
      );
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "UPLOAD_FAILED",
        err instanceof Error ? err.message : "Upload failed",
      );
    }
  });
