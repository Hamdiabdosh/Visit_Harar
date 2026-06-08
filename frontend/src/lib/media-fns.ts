import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, asc, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index";
import { mediaAssets } from "../../drizzle/schema/index";
import { auth } from "@/lib/auth.server";
import { createError, isAppError } from "@/lib/errors";
import {
  deleteAsset,
  publicIdFromUrl,
  uploadAssetBuffer,
} from "@/lib/cloudinary.server";
import { altTextSchema, mediaFilterSchema } from "@/lib/validators/media";
import type { MediaType, UserRole } from "@/lib/types";
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

export type MediaAssetDto = {
  id: string;
  cloudinary_id: string;
  url: string;
  thumbnail_url: string | null;
  filename: string | null;
  type: MediaType;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  used_in: string[];
  uploaded_by: string | null;
  created_at: Date;
};

function rowToDto(row: typeof mediaAssets.$inferSelect): MediaAssetDto {
  return {
    id: row.id,
    cloudinary_id: row.cloudinaryId,
    url: row.url,
    thumbnail_url: row.thumbnailUrl ?? null,
    filename: row.filename ?? null,
    type: row.type as MediaType,
    size_bytes: row.sizeBytes ?? null,
    width: row.width ?? null,
    height: row.height ?? null,
    alt_text: row.altText ?? null,
    used_in: row.usedIn ?? [],
    uploaded_by: row.uploadedBy ?? null,
    created_at: row.createdAt,
  };
}

const uploadInputSchema = z.object({
  data: z.string().min(1),
  filename: z.string().min(1).max(255),
  mime: z.string().min(1),
  alt_text: z.string().max(300).optional(),
});

export const getMediaAssets = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) =>
    mediaFilterSchema
      .extend({ perPage: z.number().min(1).max(100).default(48) })
      .parse(raw ?? {}),
  )
  .handler(async ({ data }) => {
    try {
      await requireEditorSession();
      const conditions = [];
      if (data.type) conditions.push(eq(mediaAssets.type, data.type));
      if (data.search?.trim()) {
        const q = `%${data.search.trim()}%`;
        conditions.push(
          or(ilike(mediaAssets.filename, q), ilike(mediaAssets.altText, q)),
        );
      }
      const where = conditions.length ? and(...conditions) : undefined;

      const order =
        data.sort === "oldest"
          ? asc(mediaAssets.createdAt)
          : data.sort === "largest"
            ? desc(mediaAssets.sizeBytes)
            : data.sort === "smallest"
              ? asc(mediaAssets.sizeBytes)
              : desc(mediaAssets.createdAt);

      const offset = (data.page - 1) * data.perPage;
      const [rows, [{ total }]] = await Promise.all([
        db
          .select()
          .from(mediaAssets)
          .where(where)
          .orderBy(order)
          .limit(data.perPage)
          .offset(offset),
        db.select({ total: count() }).from(mediaAssets).where(where),
      ]);

      return {
        items: rows.map(rowToDto),
        total: Number(total),
        page: data.page,
        perPage: data.perPage,
      };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to list media",
      );
    }
  });

export const getMediaAssetById = createServerFn({ method: "GET" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }) => {
    try {
      await requireEditorSession();
      const row = await db.query.mediaAssets.findFirst({
        where: eq(mediaAssets.id, id),
      });
      return row ? rowToDto(row) : null;
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load media",
      );
    }
  });

export const uploadMediaAsset = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => uploadInputSchema.parse(raw))
  .handler(async ({ data }) => {
    try {
      const editor = await requireEditorSession();
      const resourceType: "image" | "video" = data.mime.startsWith("video/")
        ? "video"
        : "image";
      const type: MediaType = resourceType === "video" ? "video" : "image";
      const buffer = Buffer.from(data.data, "base64");
      const uploaded = await uploadAssetBuffer(buffer, data.filename, {
        folder: "visit-harar/media",
        resourceType,
      });

      const [row] = await db
        .insert(mediaAssets)
        .values({
          cloudinaryId: uploaded.publicId,
          url: uploaded.url,
          thumbnailUrl: null,
          filename: data.filename,
          type,
          sizeBytes: buffer.length,
          altText: data.alt_text ?? null,
          usedIn: [],
          uploadedBy: editor.id,
        })
        .returning();

      fireAudit({
        userId: editor.id,
        module: "media",
        action: "upload",
        recordId: row!.id,
        recordTitle: row!.filename ?? data.filename,
        after: auditSnap(row!),
      });

      return rowToDto(row!);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "UPLOAD_FAILED",
        err instanceof Error ? err.message : "Upload failed",
      );
    }
  });

export const updateAltText = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z.object({ id: z.string().uuid(), alt_text: altTextSchema }).parse(raw),
  )
  .handler(async ({ data }) => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.query.mediaAssets.findFirst({
        where: eq(mediaAssets.id, data.id),
      });
      if (!existing) throw createError("NOT_FOUND", "Asset not found");
      const [row] = await db
        .update(mediaAssets)
        .set({ altText: data.alt_text })
        .where(eq(mediaAssets.id, data.id))
        .returning();
      fireAudit({
        userId: editor.id,
        module: "media",
        action: "update",
        recordId: data.id,
        recordTitle: row!.filename ?? data.id,
        before: auditSnap(existing),
        after: auditSnap(row!),
      });
      return rowToDto(row!);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to update alt text",
      );
    }
  });

export const markUsedIn = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z
      .object({ id: z.string().uuid(), module: z.string().min(1).max(50) })
      .parse(raw),
  )
  .handler(async ({ data }) => {
    try {
      await requireEditorSession();
      const row = await db.query.mediaAssets.findFirst({
        where: eq(mediaAssets.id, data.id),
      });
      if (!row) throw createError("NOT_FOUND", "Asset not found");
      const used = row.usedIn ?? [];
      if (used.includes(data.module)) return rowToDto(row);
      const [updated] = await db
        .update(mediaAssets)
        .set({ usedIn: [...used, data.module] })
        .where(eq(mediaAssets.id, data.id))
        .returning();
      return rowToDto(updated!);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to mark usage",
      );
    }
  });

export const unmarkUsedIn = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z
      .object({ id: z.string().uuid(), module: z.string().min(1).max(50) })
      .parse(raw),
  )
  .handler(async ({ data }) => {
    try {
      await requireEditorSession();
      const row = await db.query.mediaAssets.findFirst({
        where: eq(mediaAssets.id, data.id),
      });
      if (!row) throw createError("NOT_FOUND", "Asset not found");
      const used = (row.usedIn ?? []).filter((m) => m !== data.module);
      const [updated] = await db
        .update(mediaAssets)
        .set({ usedIn: used })
        .where(eq(mediaAssets.id, data.id))
        .returning();
      return rowToDto(updated!);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to unmark usage",
      );
    }
  });

export const deleteMediaAsset = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }) => {
    try {
      const editor = await requireEditorSession();
      const row = await db.query.mediaAssets.findFirst({
        where: eq(mediaAssets.id, id),
      });
      if (!row) throw createError("NOT_FOUND", "Asset not found");
      const wasInUse = (row.usedIn?.length ?? 0) > 0;
      const publicId = row.cloudinaryId || publicIdFromUrl(row.url);
      if (publicId) {
        await deleteAsset(
          publicId,
          row.type === "video" ? "video" : "image",
        ).catch(() => undefined);
      }
      await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
      fireAudit({
        userId: editor.id,
        module: "media",
        action: "delete",
        recordId: id,
        recordTitle: row.filename ?? id,
        before: auditSnap(row),
      });
      return { ok: true as const, was_in_use: wasInUse };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to delete media",
      );
    }
  });

export const bulkDeleteMediaAssets = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z.object({ ids: z.array(z.string().uuid()).min(1) }).parse(raw),
  )
  .handler(async ({ data }) => {
    try {
      const editor = await requireEditorSession();
      const rows = await db
        .select()
        .from(mediaAssets)
        .where(inArray(mediaAssets.id, data.ids));
      let inUseCount = 0;
      for (const row of rows) {
        if ((row.usedIn?.length ?? 0) > 0) inUseCount++;
        const publicId = row.cloudinaryId || publicIdFromUrl(row.url);
        if (publicId) {
          await deleteAsset(
            publicId,
            row.type === "video" ? "video" : "image",
          ).catch(() => undefined);
        }
      }
      await db.delete(mediaAssets).where(inArray(mediaAssets.id, data.ids));
      fireAudit({
        userId: editor.id,
        module: "media",
        action: "bulk_delete",
        recordTitle: `${rows.length} media assets`,
        before: { ids: data.ids, count: rows.length },
      });
      return {
        ok: true as const,
        deleted: rows.length,
        in_use_count: inUseCount,
      };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to bulk delete",
      );
    }
  });
