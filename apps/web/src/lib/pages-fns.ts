import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../../db/index";
import { pages, user } from "../../../../drizzle/schema/index";
import { auth } from "@/lib/auth.server";
import { createError, isAppError } from "@/lib/errors";
import { DB_SETUP_HINT, isDbUnavailableError } from "@/lib/db-errors";
import { contactInputSchema } from "@/lib/validators/contact";
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

export type PageKey = "about" | "culture" | "plan";

export type PageDto = {
  id: string;
  page_key: PageKey;
  title: string;
  hero_image: string | null;
  content: Record<string, unknown>;
  is_published: boolean;
  updated_by: string | null;
  updated_at: Date;
  updated_by_name?: string | null;
};

function rowToDto(
  row: typeof pages.$inferSelect,
  updatedByName?: string | null,
): PageDto {
  return {
    id: row.id,
    page_key: row.pageKey as PageKey,
    title: row.title,
    hero_image: row.heroImage ?? null,
    content: (row.content ?? {}) as Record<string, unknown>,
    is_published: row.isPublished,
    updated_by: row.updatedBy ?? null,
    updated_at: row.updatedAt,
    updated_by_name: updatedByName ?? null,
  };
}

const pageKeySchema = z.enum(["about", "culture", "plan"]);

// Per-page content validation (server-side)
const aboutContentSchema = z.object({
  intro_text: z.string().optional(),
  unesco_text: z.string().optional(),
  geography_text: z.string().optional(),
  quick_facts: z
    .array(
      z.object({
        label: z.string().min(1).max(50),
        value: z.string().min(1).max(120),
      }),
    )
    .optional(),
});

const cultureContentSchema = z.object({
  intro_text: z.string().optional(),
  sections: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        body: z.string().optional(),
        image: z.string().url().optional().nullable(),
      }),
    )
    .optional(),
  festivals: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        date: z.string().min(1).max(60),
        description: z.string().min(1).max(300),
      }),
    )
    .optional(),
});

const planContentSchema = z.object({
  getting_here: z.string().optional(),
  best_time: z.string().optional(),
  visa_info: z.string().optional(),
  accommodation: z.string().optional(),
  itineraries: z
    .array(
      z.object({
        duration: z.string().min(1).max(30),
        title: z.string().min(1).max(120),
        days: z.array(z.string().min(1).max(140)).default([]),
      }),
    )
    .optional(),
});

function validateContent(pageKey: PageKey, raw: unknown) {
  const base = z.record(z.unknown()).default({});
  const obj = base.parse(raw);
  if (pageKey === "about") return aboutContentSchema.parse(obj);
  if (pageKey === "culture") return cultureContentSchema.parse(obj);
  return planContentSchema.parse(obj);
}

export const getPage = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => pageKeySchema.parse(raw))
  .handler(async ({ data: key }): Promise<PageDto | null> => {
    try {
      const row = await db.query.pages.findFirst({
        where: eq(pages.pageKey, key),
      });
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
      return rowToDto(row, updatedByName);
    } catch (err) {
      if (isDbUnavailableError(err)) return null;
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load page",
      );
    }
  });

export const getPublishedPage = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => pageKeySchema.parse(raw))
  .handler(async ({ data: key }): Promise<PageDto | null> => {
    try {
      const row = await db.query.pages.findFirst({
        where: and(eq(pages.pageKey, key), eq(pages.isPublished, true)),
      });
      if (!row) return null;
      return rowToDto(row);
    } catch (err) {
      if (isDbUnavailableError(err)) return null;
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load page",
      );
    }
  });

const upsertSchema = z.object({
  page_key: pageKeySchema,
  hero_image: z.string().url().optional().nullable(),
  content: z.unknown(),
});

export const upsertPageContent = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => upsertSchema.parse(raw))
  .handler(async ({ data }): Promise<PageDto> => {
    try {
      const editor = await requireEditorSession();
      const validated = validateContent(data.page_key, data.content);

      const existing = await db.query.pages.findFirst({
        where: eq(pages.pageKey, data.page_key),
      });
      if (!existing)
        throw createError("NOT_FOUND", "Page seed missing — run db:seed");

      const [updated] = await db
        .update(pages)
        .set({
          heroImage:
            data.hero_image !== undefined
              ? (data.hero_image ?? null)
              : existing.heroImage,
          content: validated,
          updatedBy: editor.id,
          updatedAt: new Date(),
        })
        .where(eq(pages.pageKey, data.page_key))
        .returning();

      fireAudit({
        userId: editor.id,
        module: "pages",
        action: "update",
        recordId: updated!.id,
        recordTitle: updated!.title,
        before: auditSnap(existing),
        after: auditSnap(updated!),
      });

      return rowToDto(updated!, editor.name);
    } catch (err) {
      if (isDbUnavailableError(err)) {
        throw createError("INTERNAL", DB_SETUP_HINT, 503);
      }
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to save page",
      );
    }
  });

export const publishPage = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => pageKeySchema.parse(raw))
  .handler(async ({ data: key }): Promise<PageDto> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.query.pages.findFirst({
        where: eq(pages.pageKey, key),
      });
      if (!existing) throw createError("NOT_FOUND", "Page not found");
      const [updated] = await db
        .update(pages)
        .set({ isPublished: true, updatedBy: editor.id, updatedAt: new Date() })
        .where(eq(pages.pageKey, key))
        .returning();
      fireAudit({
        userId: editor.id,
        module: "pages",
        action: "publish",
        recordId: updated!.id,
        recordTitle: updated!.title,
        before: { is_published: existing.isPublished },
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
  });

export const unpublishPage = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => pageKeySchema.parse(raw))
  .handler(async ({ data: key }): Promise<PageDto> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.query.pages.findFirst({
        where: eq(pages.pageKey, key),
      });
      if (!existing) throw createError("NOT_FOUND", "Page not found");
      const [updated] = await db
        .update(pages)
        .set({
          isPublished: false,
          updatedBy: editor.id,
          updatedAt: new Date(),
        })
        .where(eq(pages.pageKey, key))
        .returning();
      fireAudit({
        userId: editor.id,
        module: "pages",
        action: "unpublish",
        recordId: updated!.id,
        recordTitle: updated!.title,
        before: { is_published: existing.isPublished },
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
  });
