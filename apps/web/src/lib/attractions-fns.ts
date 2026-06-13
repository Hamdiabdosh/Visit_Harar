import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, asc, desc, eq, isNotNull, max, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../../db/index";
import { attractions, user } from "../../../../drizzle/schema/index";
import { auth } from "@/lib/auth.server";
import { createError, isAppError } from "@/lib/errors";
import { DB_SETUP_HINT, isDbUnavailableError } from "@/lib/db-errors";
import {
  inputToRowValues,
  rowToAttractionDto,
  type AttractionDto,
} from "@/lib/attraction-map";
import { attractionInputSchema } from "@/lib/validators/attractions";
import { generateSlug } from "@/lib/slug";
import {
  deleteImage,
  publicIdFromUrl,
  uploadImageBuffer,
} from "@/lib/storage.server";
import type { UserRole } from "@/lib/types";
import { auditSnap, fireAudit } from "@/lib/audit";
import { nearestPoints } from "@/lib/geo";

const filtersSchema = z
  .object({
    published: z.boolean().optional(),
    featured: z.boolean().optional(),
    category: z.string().optional(),
    withCoordinates: z.boolean().optional(),
    limit: z.number().int().min(1).max(100).optional(),
  })
  .optional();

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

async function ensureUniqueSlug(
  slug: string,
  excludeId?: string,
): Promise<string> {
  let candidate = slug;
  let n = 2;
  while (true) {
    const existing = await db.query.attractions.findFirst({
      where: excludeId
        ? and(eq(attractions.slug, candidate), ne(attractions.id, excludeId))
        : eq(attractions.slug, candidate),
    });
    if (!existing) return candidate;
    candidate = `${slug}-${n++}`;
  }
}

async function mapRowWithName(
  row: typeof attractions.$inferSelect,
): Promise<AttractionDto> {
  let updatedByName: string | null = null;
  if (row.updatedBy) {
    const [u] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, row.updatedBy))
      .limit(1);
    updatedByName = u?.name ?? null;
  }
  return rowToAttractionDto(row, updatedByName);
}

export const getAttractions = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => filtersSchema.parse(data))
  .handler(async ({ data: filters }): Promise<AttractionDto[]> => {
    try {
      const conditions = [];
      if (filters?.published === true) {
        conditions.push(eq(attractions.isPublished, true));
      }
      if (filters?.featured === true) {
        conditions.push(eq(attractions.isFeatured, true));
      }
      if (filters?.category) {
        conditions.push(eq(attractions.category, filters.category));
      }
      if (filters?.withCoordinates === true) {
        conditions.push(isNotNull(attractions.latitude));
        conditions.push(isNotNull(attractions.longitude));
      }

      let query = db.select().from(attractions);
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }
      query = query.orderBy(
        asc(attractions.sortOrder),
        desc(attractions.createdAt),
      ) as typeof query;

      const rows = filters?.limit
        ? await query.limit(filters.limit)
        : await query;
      return Promise.all(rows.map(mapRowWithName));
    } catch (err) {
      if (isDbUnavailableError(err)) {
        console.error("[getAttractions]", DB_SETUP_HINT);
        return [];
      }
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to list attractions",
      );
    }
  });

export const getAttractionBySlug = createServerFn({ method: "GET" })
  .inputValidator((slug: unknown) => z.string().min(1).parse(slug))
  .handler(async ({ data: slug }): Promise<AttractionDto | null> => {
    try {
      const row = await db.query.attractions.findFirst({
        where: and(
          eq(attractions.slug, slug),
          eq(attractions.isPublished, true),
        ),
      });
      if (!row) return null;
      return mapRowWithName(row);
    } catch (err) {
      if (isDbUnavailableError(err)) return null;
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load attraction",
      );
    }
  });

export const getAttractionById = createServerFn({ method: "GET" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<AttractionDto | null> => {
    try {
      await requireEditorSession();
      const row = await db.query.attractions.findFirst({
        where: eq(attractions.id, id),
      });
      if (!row) return null;
      return mapRowWithName(row);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load attraction",
      );
    }
  });

export const createAttraction = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => attractionInputSchema.parse(data))
  .handler(
    async ({
      data,
    }: {
      data: z.infer<typeof attractionInputSchema>;
    }): Promise<AttractionDto> => {
      try {
        const editor = await requireEditorSession();
        const baseSlug = generateSlug(data.slug || data.title);
        const slug = await ensureUniqueSlug(baseSlug);

        const [{ maxOrder }] = await db
          .select({ maxOrder: max(attractions.sortOrder) })
          .from(attractions);
        const sortOrder = data.sort_order ?? (maxOrder ?? 0) + 1;

        const [inserted] = await db
          .insert(attractions)
          .values({
            ...inputToRowValues(
              { ...data, sort_order: sortOrder },
              editor.id,
              slug,
            ),
            createdBy: editor.id,
          })
          .returning();

        fireAudit({
          userId: editor.id,
          module: "attractions",
          action: "create",
          recordId: inserted!.id,
          recordTitle: inserted!.title,
          after: auditSnap(inserted!),
        });

        return rowToAttractionDto(inserted!, editor.name);
      } catch (err) {
        if (isAppError(err)) throw err;
        throw createError(
          "INTERNAL",
          err instanceof Error ? err.message : "Failed to create",
        );
      }
    },
  );

export const updateAttraction = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const schema = z.object({
      id: z.string().uuid(),
      data: attractionInputSchema.partial().extend({
        title: z.string().min(1).max(200).optional(),
        category: attractionInputSchema.shape.category.optional(),
      }),
    });
    return schema.parse(raw);
  })
  .handler(async ({ data: { id, data } }): Promise<AttractionDto> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.query.attractions.findFirst({
        where: eq(attractions.id, id),
      });
      if (!existing) throw createError("NOT_FOUND", "Attraction not found");

      let slug = existing.slug;
      if (data.slug) {
        slug = await ensureUniqueSlug(generateSlug(data.slug), id);
      } else if (data.title && !data.slug) {
        const generated = generateSlug(data.title);
        if (generated !== existing.slug) {
          slug = await ensureUniqueSlug(generated, id);
        }
      }

      const merged = {
        title: data.title ?? existing.title,
        slug,
        shortDesc:
          data.short_desc !== undefined
            ? (data.short_desc ?? null)
            : existing.shortDesc,
        fullDesc:
          data.full_desc !== undefined
            ? (data.full_desc ?? null)
            : existing.fullDesc,
        image: data.image !== undefined ? data.image || null : existing.image,
        category: data.category ?? existing.category,
        isFeatured: data.is_featured ?? existing.isFeatured,
        isPublished: data.is_published ?? existing.isPublished,
        sortOrder: data.sort_order ?? existing.sortOrder,
        latitude:
          data.latitude !== undefined
            ? data.latitude != null
              ? String(data.latitude)
              : null
            : existing.latitude,
        longitude:
          data.longitude !== undefined
            ? data.longitude != null
              ? String(data.longitude)
              : null
            : existing.longitude,
        openingHours:
          data.opening_hours !== undefined
            ? (data.opening_hours ?? null)
            : existing.openingHours,
        bestTimeToVisit:
          data.best_time_to_visit !== undefined
            ? (data.best_time_to_visit ?? null)
            : existing.bestTimeToVisit,
        visitorTips:
          data.visitor_tips !== undefined
            ? (data.visitor_tips ?? null)
            : existing.visitorTips,
        audioUrl:
          data.audio_url !== undefined
            ? data.audio_url || null
            : existing.audioUrl,
        updatedBy: editor.id,
        updatedAt: new Date(),
      };

      if (data.image && existing.image && data.image !== existing.image) {
        const publicId = publicIdFromUrl(existing.image);
        if (publicId) await deleteImage(publicId).catch(() => undefined);
      }

      const [updated] = await db
        .update(attractions)
        .set(merged)
        .where(eq(attractions.id, id))
        .returning();

      fireAudit({
        userId: editor.id,
        module: "attractions",
        action: "update",
        recordId: id,
        recordTitle: updated!.title,
        before: auditSnap(existing),
        after: auditSnap(updated!),
      });

      return rowToAttractionDto(updated!, editor.name);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to update",
      );
    }
  });

export const deleteAttraction = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ success: true }> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.query.attractions.findFirst({
        where: eq(attractions.id, id),
      });
      if (!existing) throw createError("NOT_FOUND", "Attraction not found");

      if (existing.image) {
        const publicId = publicIdFromUrl(existing.image);
        if (publicId) await deleteImage(publicId).catch(() => undefined);
      }

      await db.delete(attractions).where(eq(attractions.id, id));
      fireAudit({
        userId: editor.id,
        module: "attractions",
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
        err instanceof Error ? err.message : "Failed to delete",
      );
    }
  });

export const updateSortOrder = createServerFn({ method: "POST" })
  .inputValidator((ids: unknown) =>
    z.array(z.string().uuid()).min(1).parse(ids),
  )
  .handler(async ({ data: orderedIds }): Promise<{ success: true }> => {
    try {
      const editor = await requireEditorSession();
      await db.transaction(async (tx) => {
        for (let i = 0; i < orderedIds.length; i++) {
          await tx
            .update(attractions)
            .set({ sortOrder: i, updatedAt: new Date() })
            .where(eq(attractions.id, orderedIds[i]!));
        }
      });
      fireAudit({
        userId: editor.id,
        module: "attractions",
        action: "reorder",
        recordTitle: `${orderedIds.length} attractions`,
        after: { ids: orderedIds },
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

export const toggleAttractionPublished = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ is_published: boolean }> => {
    try {
      const editor = await requireEditorSession();
      const row = await db.query.attractions.findFirst({
        where: eq(attractions.id, id),
      });
      if (!row) throw createError("NOT_FOUND", "Attraction not found");
      const next = !row.isPublished;
      await db
        .update(attractions)
        .set({ isPublished: next, updatedBy: editor.id, updatedAt: new Date() })
        .where(eq(attractions.id, id));
      fireAudit({
        userId: editor.id,
        module: "attractions",
        action: next ? "publish" : "unpublish",
        recordId: id,
        recordTitle: row.title,
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

const uploadImageInputSchema = z.object({
  filename: z.string().min(1),
  data: z.string().min(1),
});

export const uploadAttractionImage = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => uploadImageInputSchema.parse(raw))
  .handler(
    async ({
      data,
    }: {
      data: { filename: string; data: string };
    }): Promise<{ url: string; publicId: string }> => {
      try {
        await requireEditorSession();
        const buffer = Buffer.from(data.data, "base64");
        return await uploadImageBuffer(
          buffer,
          data.filename,
          "visit-harar/attractions",
        );
      } catch (err) {
        if (isAppError(err)) throw err;
        throw createError(
          "UPLOAD_FAILED",
          err instanceof Error ? err.message : "Upload failed",
        );
      }
    },
  );

export const toggleAttractionFeatured = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ is_featured: boolean }> => {
    try {
      const editor = await requireEditorSession();
      const row = await db.query.attractions.findFirst({
        where: eq(attractions.id, id),
      });
      if (!row) throw createError("NOT_FOUND", "Attraction not found");
      const next = !row.isFeatured;
      await db
        .update(attractions)
        .set({ isFeatured: next, updatedBy: editor.id, updatedAt: new Date() })
        .where(eq(attractions.id, id));
      fireAudit({
        userId: editor.id,
        module: "attractions",
        action: next ? "feature" : "unfeature",
        recordId: id,
        recordTitle: row.title,
        before: { is_featured: row.isFeatured },
        after: { is_featured: next },
      });
      return { is_featured: next };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to toggle",
      );
    }
  });

export const getNearbyAttractions = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) =>
    z
      .object({
        slug: z.string().min(1),
        limit: z.number().int().min(1).max(10).optional(),
      })
      .parse(raw),
  )
  .handler(
    async ({
      data: { slug, limit = 3 },
    }): Promise<Array<AttractionDto & { distance_km: number }>> => {
      try {
        const current = await db.query.attractions.findFirst({
          where: and(
            eq(attractions.slug, slug),
            eq(attractions.isPublished, true),
          ),
        });
        if (
          !current?.latitude ||
          !current.longitude
        ) {
          return [];
        }

        const lat = Number(current.latitude);
        const lng = Number(current.longitude);

        const rows = await db
          .select()
          .from(attractions)
          .where(
            and(
              eq(attractions.isPublished, true),
              isNotNull(attractions.latitude),
              isNotNull(attractions.longitude),
              ne(attractions.id, current.id),
            ),
          );

        const dtos = await Promise.all(rows.map(mapRowWithName));
        return nearestPoints(
          { latitude: lat, longitude: lng },
          dtos.map((d) => ({
            ...d,
            latitude: d.latitude!,
            longitude: d.longitude!,
          })),
          { limit },
        );
      } catch (err) {
        if (isDbUnavailableError(err)) return [];
        if (isAppError(err)) throw err;
        throw createError(
          "INTERNAL",
          err instanceof Error ? err.message : "Failed to load nearby attractions",
        );
      }
    },
  );
