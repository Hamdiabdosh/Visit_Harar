import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, asc, count, desc, eq, max, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index";
import { bookings, guides, user } from "../../drizzle/schema/index";
import { auth } from "@/lib/auth.server";
import { createError, isAppError } from "@/lib/errors";
import { DB_SETUP_HINT, isDbUnavailableError } from "@/lib/db-errors";
import {
  deleteImage,
  publicIdFromUrl,
  uploadImageBuffer,
} from "@/lib/cloudinary.server";
import { generateSlug } from "@/lib/slug";
import { guideInputSchema } from "@/lib/validators/guides";
import type { UserRole } from "@/lib/types";
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

export type GuideDto = {
  id: string;
  name: string;
  slug: string;
  photo: string | null;
  bio: string | null;
  languages: string[];
  specialties: string[];
  experience_years: number | null;
  license_number: string | null;
  phone: string | null;
  email: string | null;
  is_available: boolean;
  is_published: boolean;
  sort_order: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
  updated_by_name?: string | null;
  booking_count?: number;
};

function rowToDto(
  row: typeof guides.$inferSelect,
  extras?: Partial<GuideDto>,
): GuideDto {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    photo: row.photo ?? null,
    bio: row.bio ?? null,
    languages: row.languages ?? [],
    specialties: row.specialties ?? [],
    experience_years: row.experienceYears ?? null,
    license_number: row.licenseNumber ?? null,
    phone: row.phone ?? null,
    email: row.email ?? null,
    is_available: row.isAvailable,
    is_published: row.isPublished,
    sort_order: row.sortOrder,
    created_by: row.createdBy ?? null,
    updated_by: row.updatedBy ?? null,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    ...extras,
  };
}

async function ensureUniqueGuideSlug(
  slug: string,
  excludeId?: string,
): Promise<string> {
  let candidate = slug;
  let n = 2;
  while (true) {
    const existing = await db.query.guides.findFirst({
      where: excludeId
        ? and(eq(guides.slug, candidate), ne(guides.id, excludeId))
        : eq(guides.slug, candidate),
    });
    if (!existing) return candidate;
    candidate = `${slug}-${n++}`;
  }
}

const filtersSchema = z
  .object({
    published: z.boolean().optional(),
    available: z.boolean().optional(),
    language: z.string().optional(),
    specialty: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional(),
  })
  .optional();

export const getGuides = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => filtersSchema.parse(raw))
  .handler(async ({ data: filters }): Promise<GuideDto[]> => {
    try {
      const conditions = [];
      if (filters?.published === true) {
        conditions.push(eq(guides.isPublished, true));
      }
      if (filters?.available === true) {
        conditions.push(eq(guides.isAvailable, true));
      }
      if (filters?.language) {
        conditions.push(sql`${filters.language} = ANY(${guides.languages})`);
      }
      if (filters?.specialty) {
        conditions.push(sql`${filters.specialty} = ANY(${guides.specialties})`);
      }

      let query = db.select().from(guides);
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }

      // Available guides first, then sort_order
      query = query.orderBy(
        desc(guides.isAvailable),
        asc(guides.sortOrder),
        desc(guides.createdAt),
      ) as typeof query;

      const rows = filters?.limit
        ? await query.limit(filters.limit)
        : await query;
      return rows.map((r) => rowToDto(r));
    } catch (err) {
      if (isDbUnavailableError(err)) return [];
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to list guides",
      );
    }
  });

export const getGuideBySlug = createServerFn({ method: "GET" })
  .inputValidator((slug: unknown) => z.string().min(1).parse(slug))
  .handler(async ({ data: slug }): Promise<GuideDto | null> => {
    try {
      const row = await db.query.guides.findFirst({
        where: and(eq(guides.slug, slug), eq(guides.isPublished, true)),
      });
      if (!row) return null;
      return rowToDto(row);
    } catch (err) {
      if (isDbUnavailableError(err)) return null;
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load guide",
      );
    }
  });

export const getGuideById = createServerFn({ method: "GET" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<GuideDto | null> => {
    try {
      await requireEditorSession();
      const row = await db.query.guides.findFirst({ where: eq(guides.id, id) });
      if (!row) return null;

      let updatedByName: string | null = null;
      if (row.updatedBy) {
        const [u] = await db
          .select({ name: user.name })
          .from(user)
          .where(eq(user.id, row.updatedBy))
          .limit(1);
        updatedByName = u?.name ?? null;
      }

      const [{ bookingCount }] = await db
        .select({ bookingCount: count(bookings.id) })
        .from(bookings)
        .where(eq(bookings.guideId, id));

      return rowToDto(row, {
        updated_by_name: updatedByName,
        booking_count: Number(bookingCount ?? 0),
      });
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load guide",
      );
    }
  });

export const createGuide = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => guideInputSchema.parse(raw))
  .handler(async ({ data }): Promise<GuideDto> => {
    try {
      const editor = await requireEditorSession();
      const baseSlug = generateSlug(data.slug || data.name);
      const slug = await ensureUniqueGuideSlug(baseSlug);

      const [{ maxOrder }] = await db
        .select({ maxOrder: max(guides.sortOrder) })
        .from(guides);
      const sortOrder = data.sort_order ?? (maxOrder ?? 0) + 1;

      const [row] = await db
        .insert(guides)
        .values({
          name: data.name,
          slug,
          photo: data.photo || null,
          bio: data.bio ?? null,
          languages: data.languages ?? [],
          specialties: data.specialties ?? [],
          experienceYears: data.experience_years ?? null,
          licenseNumber: data.license_number ?? null,
          phone: data.phone ?? null,
          email: data.email ?? null,
          isAvailable: data.is_available ?? true,
          isPublished: data.is_published ?? false,
          sortOrder,
          createdBy: editor.id,
          updatedBy: editor.id,
          updatedAt: new Date(),
        })
        .returning();

      fireAudit({
        userId: editor.id,
        module: "guides",
        action: "create",
        recordId: row!.id,
        recordTitle: row!.name,
        after: auditSnap(row!),
      });

      return rowToDto(row!);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to create guide",
      );
    }
  });

export const updateGuide = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const schema = z.object({
      id: z.string().uuid(),
      data: guideInputSchema
        .partial()
        .extend({ name: z.string().min(1).max(200).optional() }),
    });
    return schema.parse(raw);
  })
  .handler(async ({ data: { id, data } }): Promise<GuideDto> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.query.guides.findFirst({
        where: eq(guides.id, id),
      });
      if (!existing) throw createError("NOT_FOUND", "Guide not found");

      let slug = existing.slug;
      if (data.slug) {
        slug = await ensureUniqueGuideSlug(generateSlug(data.slug), id);
      } else if (data.name) {
        const generated = generateSlug(data.name);
        if (generated !== existing.slug) {
          slug = await ensureUniqueGuideSlug(generated, id);
        }
      }

      if (data.photo && existing.photo && data.photo !== existing.photo) {
        const publicId = publicIdFromUrl(existing.photo);
        if (publicId) await deleteImage(publicId).catch(() => undefined);
      }

      const [updated] = await db
        .update(guides)
        .set({
          name: data.name ?? existing.name,
          slug,
          photo: data.photo !== undefined ? data.photo || null : existing.photo,
          bio: data.bio !== undefined ? (data.bio ?? null) : existing.bio,
          languages: data.languages ?? existing.languages,
          specialties: data.specialties ?? existing.specialties,
          experienceYears:
            data.experience_years !== undefined
              ? (data.experience_years ?? null)
              : existing.experienceYears,
          licenseNumber:
            data.license_number !== undefined
              ? (data.license_number ?? null)
              : existing.licenseNumber,
          phone:
            data.phone !== undefined ? (data.phone ?? null) : existing.phone,
          email:
            data.email !== undefined ? (data.email ?? null) : existing.email,
          isAvailable: data.is_available ?? existing.isAvailable,
          isPublished: data.is_published ?? existing.isPublished,
          sortOrder: data.sort_order ?? existing.sortOrder,
          updatedBy: editor.id,
          updatedAt: new Date(),
        })
        .where(eq(guides.id, id))
        .returning();

      fireAudit({
        userId: editor.id,
        module: "guides",
        action: "update",
        recordId: id,
        recordTitle: updated!.name,
        before: auditSnap(existing),
        after: auditSnap(updated!),
      });

      return rowToDto(updated!);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to update guide",
      );
    }
  });

export const deleteGuide = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ success: true }> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.query.guides.findFirst({
        where: eq(guides.id, id),
      });
      if (!existing) throw createError("NOT_FOUND", "Guide not found");

      const [{ bookingCount }] = await db
        .select({ bookingCount: count(bookings.id) })
        .from(bookings)
        .where(eq(bookings.guideId, id));
      if (Number(bookingCount ?? 0) > 0) {
        throw createError(
          "CONFLICT",
          "Cannot delete a guide with existing bookings",
        );
      }

      if (existing.photo) {
        const publicId = publicIdFromUrl(existing.photo);
        if (publicId) await deleteImage(publicId).catch(() => undefined);
      }

      await db.delete(guides).where(eq(guides.id, id));
      fireAudit({
        userId: editor.id,
        module: "guides",
        action: "delete",
        recordId: id,
        recordTitle: existing.name,
        before: auditSnap(existing),
      });
      return { success: true };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to delete guide",
      );
    }
  });

export const reorderGuides = createServerFn({ method: "POST" })
  .inputValidator((ids: unknown) =>
    z.array(z.string().uuid()).min(1).parse(ids),
  )
  .handler(async ({ data: orderedIds }): Promise<{ success: true }> => {
    try {
      await requireEditorSession();
      await db.transaction(async (tx) => {
        for (let i = 0; i < orderedIds.length; i++) {
          await tx
            .update(guides)
            .set({ sortOrder: i, updatedAt: new Date() })
            .where(eq(guides.id, orderedIds[i]!));
        }
      });
      return { success: true };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to reorder",
      );
    }
  });

export const toggleGuidePublished = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ is_published: boolean }> => {
    try {
      const editor = await requireEditorSession();
      const row = await db.query.guides.findFirst({ where: eq(guides.id, id) });
      if (!row) throw createError("NOT_FOUND", "Guide not found");
      const next = !row.isPublished;
      await db
        .update(guides)
        .set({ isPublished: next, updatedBy: editor.id, updatedAt: new Date() })
        .where(eq(guides.id, id));
      fireAudit({
        userId: editor.id,
        module: "guides",
        action: next ? "publish" : "unpublish",
        recordId: id,
        recordTitle: row.name,
        before: { is_published: row.isPublished },
        after: { is_published: next },
      });
      return { is_published: next };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to toggle",
      );
    }
  });

export const toggleGuideAvailable = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ is_available: boolean }> => {
    try {
      const editor = await requireEditorSession();
      const row = await db.query.guides.findFirst({ where: eq(guides.id, id) });
      if (!row) throw createError("NOT_FOUND", "Guide not found");
      const next = !row.isAvailable;
      await db
        .update(guides)
        .set({ isAvailable: next, updatedBy: editor.id, updatedAt: new Date() })
        .where(eq(guides.id, id));
      fireAudit({
        userId: editor.id,
        module: "guides",
        action: next ? "enable" : "disable",
        recordId: id,
        recordTitle: row.name,
        before: { is_available: row.isAvailable },
        after: { is_available: next },
      });
      return { is_available: next };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to toggle",
      );
    }
  });

const uploadPhotoSchema = z.object({
  filename: z.string().min(1),
  data: z.string().min(1),
});

export const uploadGuidePhoto = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => uploadPhotoSchema.parse(raw))
  .handler(async ({ data }): Promise<{ url: string; publicId: string }> => {
    try {
      await requireEditorSession();
      const buffer = Buffer.from(data.data, "base64");
      return await uploadImageBuffer(
        buffer,
        data.filename,
        "visit-harar/guides",
      );
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "UPLOAD_FAILED",
        err instanceof Error ? err.message : "Upload failed",
      );
    }
  });
