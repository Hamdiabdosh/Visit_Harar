import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, asc, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index";
import { partners } from "../../drizzle/schema/index";
import { auth } from "@/lib/auth.server";
import { createError, isAppError } from "@/lib/errors";
import { DB_SETUP_HINT, isDbUnavailableError } from "@/lib/db-errors";
import { generateSlug } from "@/lib/slug";
import {
  partnerInputSchema,
  type PartnerCategory,
} from "@/lib/validators/partners";
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

export type PartnerDto = {
  id: string;
  name: string;
  slug: string;
  category: PartnerCategory;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  image: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
};

function rowToDto(row: typeof partners.$inferSelect): PartnerDto {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category as PartnerCategory,
    description: row.description ?? null,
    address: row.address ?? null,
    phone: row.phone ?? null,
    email: row.email ?? null,
    website: row.website ?? null,
    image: row.image ?? null,
    is_featured: row.isFeatured,
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
    const existing = await db.query.partners.findFirst({
      where: excludeId
        ? and(eq(partners.slug, candidate), ne(partners.id, excludeId))
        : eq(partners.slug, candidate),
    });
    if (!existing) return candidate;
    candidate = `${slug}-${n++}`;
  }
}

const filtersSchema = z
  .object({
    published: z.boolean().optional(),
    category: z.string().optional(),
    featured: z.boolean().optional(),
  })
  .optional();

export const getPartners = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => filtersSchema.parse(raw))
  .handler(async ({ data: filters }): Promise<PartnerDto[]> => {
    try {
      const conditions = [];
      if (filters?.published) conditions.push(eq(partners.isPublished, true));
      if (filters?.category)
        conditions.push(eq(partners.category, filters.category));
      if (filters?.featured) conditions.push(eq(partners.isFeatured, true));

      const rows = await db
        .select()
        .from(partners)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(
          asc(partners.sortOrder),
          asc(partners.name),
        );
      return rows.map(rowToDto);
    } catch (err) {
      if (isDbUnavailableError(err)) {
        console.error("[getPartners]", DB_SETUP_HINT);
        return [];
      }
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to list partners",
      );
    }
  });

export const getPartnerBySlug = createServerFn({ method: "GET" })
  .inputValidator((slug: unknown) => z.string().min(1).parse(slug))
  .handler(async ({ data: slug }): Promise<PartnerDto | null> => {
    try {
      const row = await db.query.partners.findFirst({
        where: and(eq(partners.slug, slug), eq(partners.isPublished, true)),
      });
      return row ? rowToDto(row) : null;
    } catch (err) {
      if (isDbUnavailableError(err)) return null;
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load partner",
      );
    }
  });

export const getPartnerById = createServerFn({ method: "GET" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<PartnerDto | null> => {
    try {
      await requireEditorSession();
      const row = await db.query.partners.findFirst({
        where: eq(partners.id, id),
      });
      return row ? rowToDto(row) : null;
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load partner",
      );
    }
  });

export const createPartner = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => partnerInputSchema.parse(raw))
  .handler(async ({ data }): Promise<PartnerDto> => {
    try {
      const editor = await requireEditorSession();
      const slug = await ensureUniqueSlug(
        generateSlug(data.slug || data.name),
      );
      const [row] = await db
        .insert(partners)
        .values({
          name: data.name,
          slug,
          category: data.category,
          description: data.description ?? null,
          address: data.address ?? null,
          phone: data.phone ?? null,
          email: data.email || null,
          website: data.website || null,
          image: data.image ?? null,
          isFeatured: data.is_featured ?? false,
          isPublished: data.is_published ?? false,
          sortOrder: data.sort_order ?? 0,
          createdBy: editor.id,
          updatedBy: editor.id,
        })
        .returning();
      fireAudit({
        userId: editor.id,
        module: "partners",
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
        err instanceof Error ? err.message : "Failed to create partner",
      );
    }
  });

export const updatePartner = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const schema = z.object({
      id: z.string().uuid(),
      data: partnerInputSchema.partial().extend({
        name: z.string().min(1).max(200).optional(),
        category: partnerInputSchema.shape.category.optional(),
      }),
    });
    return schema.parse(raw);
  })
  .handler(async ({ data: { id, data } }): Promise<PartnerDto> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.query.partners.findFirst({
        where: eq(partners.id, id),
      });
      if (!existing) throw createError("NOT_FOUND", "Partner not found");

      let slug = existing.slug;
      if (data.slug) {
        slug = await ensureUniqueSlug(generateSlug(data.slug), id);
      } else if (data.name) {
        const desired = generateSlug(data.name);
        if (desired !== existing.slug) {
          slug = await ensureUniqueSlug(desired, id);
        }
      }

      const [updated] = await db
        .update(partners)
        .set({
          name: data.name ?? existing.name,
          slug,
          category: data.category ?? existing.category,
          description:
            data.description !== undefined
              ? (data.description ?? null)
              : existing.description,
          address:
            data.address !== undefined
              ? (data.address ?? null)
              : existing.address,
          phone:
            data.phone !== undefined ? (data.phone ?? null) : existing.phone,
          email:
            data.email !== undefined ? (data.email || null) : existing.email,
          website:
            data.website !== undefined
              ? (data.website || null)
              : existing.website,
          image:
            data.image !== undefined ? (data.image ?? null) : existing.image,
          isFeatured: data.is_featured ?? existing.isFeatured,
          isPublished: data.is_published ?? existing.isPublished,
          sortOrder: data.sort_order ?? existing.sortOrder,
          updatedBy: editor.id,
          updatedAt: new Date(),
        })
        .where(eq(partners.id, id))
        .returning();

      fireAudit({
        userId: editor.id,
        module: "partners",
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
        err instanceof Error ? err.message : "Failed to update partner",
      );
    }
  });

export const deletePartner = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ success: true }> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.query.partners.findFirst({
        where: eq(partners.id, id),
      });
      if (!existing) throw createError("NOT_FOUND", "Partner not found");
      await db.delete(partners).where(eq(partners.id, id));
      fireAudit({
        userId: editor.id,
        module: "partners",
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
        err instanceof Error ? err.message : "Failed to delete partner",
      );
    }
  });

export const togglePartnerPublished = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ is_published: boolean }> => {
    try {
      const editor = await requireEditorSession();
      const row = await db.query.partners.findFirst({
        where: eq(partners.id, id),
      });
      if (!row) throw createError("NOT_FOUND", "Partner not found");
      const next = !row.isPublished;
      await db
        .update(partners)
        .set({
          isPublished: next,
          updatedBy: editor.id,
          updatedAt: new Date(),
        })
        .where(eq(partners.id, id));
      fireAudit({
        userId: editor.id,
        module: "partners",
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
