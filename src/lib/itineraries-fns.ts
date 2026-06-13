import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, asc, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index";
import { itineraries } from "../../drizzle/schema/index";
import { auth } from "@/lib/auth.server";
import { createError, isAppError } from "@/lib/errors";
import { DB_SETUP_HINT, isDbUnavailableError } from "@/lib/db-errors";
import { generateSlug } from "@/lib/slug";
import {
  itineraryInputSchema,
  type ItineraryDay,
} from "@/lib/validators/itineraries";
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
  return { id: session.user.id };
}

export type ItineraryDto = {
  id: string;
  title: string;
  slug: string;
  duration: string;
  summary: string | null;
  days: ItineraryDay[];
  is_published: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
};

function rowToDto(row: typeof itineraries.$inferSelect): ItineraryDto {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    duration: row.duration,
    summary: row.summary ?? null,
    days: (row.days as ItineraryDay[]) ?? [],
    is_published: row.isPublished,
    sort_order: row.sortOrder,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

async function ensureUniqueSlug(
  slug: string,
  excludeId?: string,
): Promise<string> {
  let candidate = slug;
  let n = 2;
  while (true) {
    const existing = await db.query.itineraries.findFirst({
      where: excludeId
        ? and(eq(itineraries.slug, candidate), ne(itineraries.id, excludeId))
        : eq(itineraries.slug, candidate),
    });
    if (!existing) return candidate;
    candidate = `${slug}-${n++}`;
  }
}

const filtersSchema = z
  .object({
    published: z.boolean().optional(),
  })
  .optional();

export const getItineraries = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => filtersSchema.parse(raw))
  .handler(async ({ data: filters }): Promise<ItineraryDto[]> => {
    try {
      const conditions = [];
      if (filters?.published) conditions.push(eq(itineraries.isPublished, true));

      const rows = await db
        .select()
        .from(itineraries)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(asc(itineraries.sortOrder), asc(itineraries.title));
      return rows.map(rowToDto);
    } catch (err) {
      if (isDbUnavailableError(err)) {
        console.error("[getItineraries]", DB_SETUP_HINT);
        return [];
      }
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to list itineraries",
      );
    }
  });

export const getItineraryBySlug = createServerFn({ method: "GET" })
  .inputValidator((slug: unknown) => z.string().min(1).parse(slug))
  .handler(async ({ data: slug }): Promise<ItineraryDto | null> => {
    try {
      const row = await db.query.itineraries.findFirst({
        where: and(eq(itineraries.slug, slug), eq(itineraries.isPublished, true)),
      });
      return row ? rowToDto(row) : null;
    } catch (err) {
      if (isDbUnavailableError(err)) return null;
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load itinerary",
      );
    }
  });

export const getItineraryById = createServerFn({ method: "GET" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<ItineraryDto | null> => {
    try {
      await requireEditorSession();
      const row = await db.query.itineraries.findFirst({
        where: eq(itineraries.id, id),
      });
      return row ? rowToDto(row) : null;
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load itinerary",
      );
    }
  });

export const createItinerary = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => itineraryInputSchema.parse(raw))
  .handler(async ({ data }): Promise<ItineraryDto> => {
    try {
      const editor = await requireEditorSession();
      const slug = await ensureUniqueSlug(
        generateSlug(data.slug || data.title),
      );
      const [row] = await db
        .insert(itineraries)
        .values({
          title: data.title,
          slug,
          duration: data.duration,
          summary: data.summary ?? null,
          days: data.days ?? [],
          isPublished: data.is_published ?? false,
          sortOrder: data.sort_order ?? 0,
          createdBy: editor.id,
          updatedBy: editor.id,
        })
        .returning();
      fireAudit({
        userId: editor.id,
        module: "itineraries",
        action: "create",
        recordId: row!.id,
        recordTitle: row!.title,
        after: auditSnap(row!),
      });
      return rowToDto(row!);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to create itinerary",
      );
    }
  });

export const updateItinerary = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const schema = z.object({
      id: z.string().uuid(),
      data: itineraryInputSchema.partial().extend({
        title: z.string().min(1).max(200).optional(),
        duration: z.string().min(1).max(80).optional(),
      }),
    });
    return schema.parse(raw);
  })
  .handler(async ({ data: { id, data } }): Promise<ItineraryDto> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.query.itineraries.findFirst({
        where: eq(itineraries.id, id),
      });
      if (!existing) throw createError("NOT_FOUND", "Itinerary not found");

      let slug = existing.slug;
      if (data.slug) {
        slug = await ensureUniqueSlug(generateSlug(data.slug), id);
      } else if (data.title) {
        const desired = generateSlug(data.title);
        if (desired !== existing.slug) {
          slug = await ensureUniqueSlug(desired, id);
        }
      }

      const [updated] = await db
        .update(itineraries)
        .set({
          title: data.title ?? existing.title,
          slug,
          duration: data.duration ?? existing.duration,
          summary:
            data.summary !== undefined
              ? (data.summary ?? null)
              : existing.summary,
          days: data.days ?? (existing.days as ItineraryDay[]),
          isPublished: data.is_published ?? existing.isPublished,
          sortOrder: data.sort_order ?? existing.sortOrder,
          updatedBy: editor.id,
          updatedAt: new Date(),
        })
        .where(eq(itineraries.id, id))
        .returning();

      fireAudit({
        userId: editor.id,
        module: "itineraries",
        action: "update",
        recordId: id,
        recordTitle: updated!.title,
        before: auditSnap(existing),
        after: auditSnap(updated!),
      });
      return rowToDto(updated!);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to update itinerary",
      );
    }
  });

export const deleteItinerary = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ success: true }> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.query.itineraries.findFirst({
        where: eq(itineraries.id, id),
      });
      if (!existing) throw createError("NOT_FOUND", "Itinerary not found");
      await db.delete(itineraries).where(eq(itineraries.id, id));
      fireAudit({
        userId: editor.id,
        module: "itineraries",
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
        err instanceof Error ? err.message : "Failed to delete itinerary",
      );
    }
  });

export const toggleItineraryPublished = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ is_published: boolean }> => {
    try {
      const editor = await requireEditorSession();
      const row = await db.query.itineraries.findFirst({
        where: eq(itineraries.id, id),
      });
      if (!row) throw createError("NOT_FOUND", "Itinerary not found");
      const next = !row.isPublished;
      await db
        .update(itineraries)
        .set({
          isPublished: next,
          updatedBy: editor.id,
          updatedAt: new Date(),
        })
        .where(eq(itineraries.id, id));
      fireAudit({
        userId: editor.id,
        module: "itineraries",
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
