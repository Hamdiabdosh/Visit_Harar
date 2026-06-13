import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { db } from "../../../../db/index";
import { heroContent, user } from "../../../../drizzle/schema/index";
import { auth } from "@/lib/auth.server";
import { AppError, createError, isAppError } from "@/lib/errors";
import { rowToHeroDto, inputToRowValues, type HeroDto } from "@/lib/hero-map";
import { z } from "zod";
import { heroInputSchema, type HeroInput } from "@/lib/validators/hero";
import {
  deleteImage,
  publicIdFromUrl,
  uploadImageBuffer,
} from "@/lib/storage.server";
import type { UserRole } from "@/lib/types";
import { DB_SETUP_HINT, isDbUnavailableError } from "@/lib/db-errors";
import { auditSnap, fireAudit } from "@/lib/audit";

async function requireEditorSession() {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    throw createError("UNAUTHORIZED", "Authentication required");
  }
  const role = (session.user as { role?: string }).role as UserRole;
  const isActive = (session.user as { isActive?: boolean }).isActive ?? true;
  if (!isActive) throw createError("FORBIDDEN", "Account is disabled");
  if (role !== "superadmin" && role !== "editor") {
    throw createError("FORBIDDEN", "Insufficient permissions");
  }
  return { id: session.user.id, name: session.user.name, role };
}

async function fetchHeroDto(wherePublished?: boolean): Promise<HeroDto | null> {
  const rows = await db.select().from(heroContent).limit(1);
  const row = rows[0];
  if (!row) return null;
  if (wherePublished && !row.isPublished) return null;

  let updatedByName: string | null = null;
  if (row.updatedBy) {
    const [u] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, row.updatedBy))
      .limit(1);
    updatedByName = u?.name ?? null;
  }
  return rowToHeroDto(row, updatedByName);
}

export const getHero = createServerFn({ method: "GET" }).handler(
  async (): Promise<HeroDto | null> => {
    try {
      return await fetchHeroDto();
    } catch (err) {
      if (isAppError(err)) throw err;
      if (isDbUnavailableError(err)) {
        throw createError("INTERNAL", DB_SETUP_HINT, 503);
      }
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load hero",
      );
    }
  },
);

export const getPublishedHero = createServerFn({ method: "GET" }).handler(
  async (): Promise<HeroDto | null> => {
    try {
      return await fetchHeroDto(true);
    } catch (err) {
      if (isDbUnavailableError(err)) {
        console.error("[getPublishedHero]", DB_SETUP_HINT, err);
        return null;
      }
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load hero",
      );
    }
  },
);

export const upsertHero = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => heroInputSchema.parse(data))
  .handler(async ({ data }: { data: HeroInput }): Promise<HeroDto> => {
    try {
      const editor = await requireEditorSession();
      const values = inputToRowValues(data, editor.id);

      const existing = await db.select().from(heroContent).limit(1);
      const prev = existing[0];

      if (prev) {
        const [updated] = await db
          .update(heroContent)
          .set(values)
          .where(eq(heroContent.id, prev.id))
          .returning();
        fireAudit({
          userId: editor.id,
          module: "hero",
          action: "update",
          recordId: prev.id,
          recordTitle: updated!.headline,
          before: auditSnap(prev),
          after: auditSnap(updated!),
        });
        return rowToHeroDto(updated!, editor.name);
      }

      const [inserted] = await db
        .insert(heroContent)
        .values(values)
        .returning();
      fireAudit({
        userId: editor.id,
        module: "hero",
        action: "create",
        recordId: inserted!.id,
        recordTitle: inserted!.headline,
        after: auditSnap(inserted!),
      });
      return rowToHeroDto(inserted!, editor.name);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to save hero",
      );
    }
  });

export const publishHero = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ success: true }> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.select().from(heroContent).limit(1);
      if (!existing[0]) {
        throw createError("NOT_FOUND", "No hero content to publish");
      }
      await db
        .update(heroContent)
        .set({
          isPublished: true,
          updatedBy: editor.id,
          updatedAt: new Date(),
        })
        .where(eq(heroContent.id, existing[0].id));
      fireAudit({
        userId: editor.id,
        module: "hero",
        action: "publish",
        recordId: existing[0].id,
        recordTitle: existing[0].headline,
      });
      return { success: true };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to publish",
      );
    }
  },
);

export const unpublishHero = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ success: true }> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.select().from(heroContent).limit(1);
      if (!existing[0]) {
        throw createError("NOT_FOUND", "No hero content");
      }
      await db
        .update(heroContent)
        .set({
          isPublished: false,
          updatedBy: editor.id,
          updatedAt: new Date(),
        })
        .where(eq(heroContent.id, existing[0].id));
      fireAudit({
        userId: editor.id,
        module: "hero",
        action: "unpublish",
        recordId: existing[0].id,
        recordTitle: existing[0].headline,
      });
      return { success: true };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to unpublish",
      );
    }
  },
);

const uploadImageInputSchema = z.object({
  filename: z.string().min(1),
  data: z.string().min(1),
});

export const uploadHeroImage = createServerFn({ method: "POST" })
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
        return await uploadImageBuffer(buffer, data.filename);
      } catch (err) {
        if (isAppError(err)) throw err;
        throw createError(
          "UPLOAD_FAILED",
          err instanceof Error ? err.message : "Upload failed",
        );
      }
    },
  );

export const removeHeroBackground = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const parsed =
      typeof data === "object" && data !== null && "url" in data
        ? { url: String((data as { url: string }).url) }
        : { url: "" };
    return parsed;
  })
  .handler(async ({ data }: { data: { url: string } }) => {
    try {
      await requireEditorSession();
      const publicId = publicIdFromUrl(data.url);
      if (publicId) await deleteImage(publicId);
      return { success: true as const };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to delete image",
      );
    }
  });
