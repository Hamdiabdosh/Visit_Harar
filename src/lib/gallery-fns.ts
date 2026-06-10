import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, asc, count, desc, eq, inArray, max } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index";
import {
  galleryAlbums,
  galleryItems,
  mediaAssets,
} from "../../drizzle/schema/index";
import { auth } from "@/lib/auth.server";
import { createError, isAppError } from "@/lib/errors";
import { DB_SETUP_HINT, isDbUnavailableError } from "@/lib/db-errors";
import {
  deleteAsset,
  publicIdFromUrl,
  uploadAssetBuffer,
} from "@/lib/storage.server";
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

export type GalleryAlbumDto = {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  is_published: boolean;
  sort_order: number;
  created_by: string | null;
  updated_at: Date;
  item_count: number;
};

export type GalleryItemDto = {
  id: string;
  album_id: string;
  type: MediaType;
  url: string;
  thumbnail_url: string | null;
  caption: string | null;
  alt_text: string | null;
  is_published: boolean;
  sort_order: number;
  uploaded_by: string | null;
  created_at: Date;
};

export type PublishedGalleryItemDto = GalleryItemDto & {
  album_title: string;
};

function albumRowToDto(
  row: typeof galleryAlbums.$inferSelect,
  itemCount: number,
): GalleryAlbumDto {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    cover_image: row.coverImage ?? null,
    is_published: row.isPublished,
    sort_order: row.sortOrder,
    created_by: row.createdBy ?? null,
    updated_at: row.updatedAt,
    item_count: itemCount,
  };
}

function itemRowToDto(row: typeof galleryItems.$inferSelect): GalleryItemDto {
  return {
    id: row.id,
    album_id: row.albumId,
    type: row.type as MediaType,
    url: row.url,
    thumbnail_url: row.thumbnailUrl ?? null,
    caption: row.caption ?? null,
    alt_text: row.altText ?? null,
    is_published: row.isPublished,
    sort_order: row.sortOrder,
    uploaded_by: row.uploadedBy ?? null,
    created_at: row.createdAt,
  };
}

export const getAlbums = createServerFn({ method: "GET" }).handler(
  async (): Promise<GalleryAlbumDto[]> => {
    try {
      const rows = await db
        .select({
          album: galleryAlbums,
          itemCount: count(galleryItems.id).as("itemCount"),
        })
        .from(galleryAlbums)
        .leftJoin(galleryItems, eq(galleryItems.albumId, galleryAlbums.id))
        .groupBy(galleryAlbums.id)
        .orderBy(asc(galleryAlbums.sortOrder), desc(galleryAlbums.updatedAt));

      return rows.map((r) => albumRowToDto(r.album, Number(r.itemCount ?? 0)));
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to list albums",
      );
    }
  },
);

export const getAlbumById = createServerFn({ method: "GET" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(
    async ({
      data: id,
    }): Promise<{ album: GalleryAlbumDto; items: GalleryItemDto[] } | null> => {
      try {
        const album = await db.query.galleryAlbums.findFirst({
          where: eq(galleryAlbums.id, id),
        });
        if (!album) return null;
        const items = await db.query.galleryItems.findMany({
          where: eq(galleryItems.albumId, id),
          orderBy: [asc(galleryItems.sortOrder), desc(galleryItems.createdAt)],
        });
        const [{ itemCount }] = await db
          .select({ itemCount: count(galleryItems.id) })
          .from(galleryItems)
          .where(eq(galleryItems.albumId, id));
        return {
          album: albumRowToDto(album, Number(itemCount ?? 0)),
          items: items.map(itemRowToDto),
        };
      } catch (err) {
        if (isAppError(err)) throw err;
        throw createError(
          "INTERNAL",
          err instanceof Error ? err.message : "Failed to load album",
        );
      }
    },
  );

const albumInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(800).optional(),
});

export const createAlbum = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => albumInputSchema.parse(raw))
  .handler(async ({ data }): Promise<GalleryAlbumDto> => {
    try {
      const editor = await requireEditorSession();
      const [{ maxOrder }] = await db
        .select({ maxOrder: max(galleryAlbums.sortOrder) })
        .from(galleryAlbums);
      const sortOrder = (maxOrder ?? 0) + 1;
      const [row] = await db
        .insert(galleryAlbums)
        .values({
          title: data.title,
          description: data.description ?? null,
          coverImage: null,
          isPublished: false,
          sortOrder,
          createdBy: editor.id,
          updatedAt: new Date(),
        })
        .returning();
      fireAudit({
        userId: editor.id,
        module: "gallery",
        action: "create",
        recordId: row!.id,
        recordTitle: row!.title,
        after: auditSnap(row!),
      });
      return albumRowToDto(row!, 0);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to create album",
      );
    }
  });

const updateAlbumSchema = z.object({
  id: z.string().uuid(),
  data: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(800).optional().nullable(),
    cover_image: z.string().url().optional().nullable(),
    is_published: z.boolean().optional(),
  }),
});

export const updateAlbum = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => updateAlbumSchema.parse(raw))
  .handler(async ({ data: { id, data } }): Promise<GalleryAlbumDto> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.query.galleryAlbums.findFirst({
        where: eq(galleryAlbums.id, id),
      });
      if (!existing) throw createError("NOT_FOUND", "Album not found");
      const [updated] = await db
        .update(galleryAlbums)
        .set({
          title: data.title ?? existing.title,
          description:
            data.description !== undefined
              ? data.description
              : existing.description,
          coverImage:
            data.cover_image !== undefined
              ? data.cover_image
              : existing.coverImage,
          isPublished: data.is_published ?? existing.isPublished,
          updatedAt: new Date(),
        })
        .where(eq(galleryAlbums.id, id))
        .returning();
      const [{ itemCount }] = await db
        .select({ itemCount: count(galleryItems.id) })
        .from(galleryItems)
        .where(eq(galleryItems.albumId, id));
      fireAudit({
        userId: editor.id,
        module: "gallery",
        action: "update",
        recordId: id,
        recordTitle: updated!.title,
        before: auditSnap(existing),
        after: auditSnap(updated!),
      });
      return albumRowToDto(updated!, Number(itemCount ?? 0));
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to update album",
      );
    }
  });

export const deleteAlbum = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ success: true }> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.query.galleryAlbums.findFirst({
        where: eq(galleryAlbums.id, id),
      });
      if (!existing) throw createError("NOT_FOUND", "Album not found");
      const items = await db.query.galleryItems.findMany({
        where: eq(galleryItems.albumId, id),
      });
      // delete assets best-effort
      await Promise.all(
        items.map(async (it) => {
          const publicId = publicIdFromUrl(it.url);
          if (!publicId) return;
          const type = (it.type as MediaType) ?? "image";
          await deleteAsset(
            publicId,
            type === "video" ? "video" : "image",
          ).catch(() => undefined);
        }),
      );
      await db.delete(galleryAlbums).where(eq(galleryAlbums.id, id));
      fireAudit({
        userId: editor.id,
        module: "gallery",
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
        err instanceof Error ? err.message : "Failed to delete album",
      );
    }
  });

export const reorderAlbums = createServerFn({ method: "POST" })
  .inputValidator((ids: unknown) =>
    z.array(z.string().uuid()).min(1).parse(ids),
  )
  .handler(async ({ data: orderedIds }): Promise<{ success: true }> => {
    try {
      await requireEditorSession();
      await db.transaction(async (tx) => {
        for (let i = 0; i < orderedIds.length; i++) {
          await tx
            .update(galleryAlbums)
            .set({ sortOrder: i, updatedAt: new Date() })
            .where(eq(galleryAlbums.id, orderedIds[i]!));
        }
      });
      return { success: true };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to reorder albums",
      );
    }
  });

const uploadInputSchema = z.object({
  albumId: z.string().uuid(),
  filename: z.string().min(1),
  mime: z.string().min(1),
  data: z.string().min(1),
});

export const uploadMediaItem = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => uploadInputSchema.parse(raw))
  .handler(async ({ data }): Promise<GalleryItemDto> => {
    try {
      const editor = await requireEditorSession();
      const album = await db.query.galleryAlbums.findFirst({
        where: eq(galleryAlbums.id, data.albumId),
      });
      if (!album) throw createError("NOT_FOUND", "Album not found");

      const resourceType: "image" | "video" = data.mime.startsWith("video/")
        ? "video"
        : "image";
      const type: MediaType = resourceType === "video" ? "video" : "image";
      const buffer = Buffer.from(data.data, "base64");
      const uploaded = await uploadAssetBuffer(buffer, data.filename, {
        folder: `visit-harar/gallery/${data.albumId}`,
        resourceType,
      });

      const [{ maxOrder }] = await db
        .select({ maxOrder: max(galleryItems.sortOrder) })
        .from(galleryItems)
        .where(eq(galleryItems.albumId, data.albumId));
      const sortOrder = (maxOrder ?? -1) + 1;

      const [row] = await db
        .insert(galleryItems)
        .values({
          albumId: data.albumId,
          type,
          url: uploaded.url,
          thumbnailUrl: null,
          caption: null,
          altText: null,
          isPublished: false,
          sortOrder,
          uploadedBy: editor.id,
          createdAt: new Date(),
        })
        .returning();

      const existingAsset = await db.query.mediaAssets.findFirst({
        where: eq(mediaAssets.cloudinaryId, uploaded.publicId),
      });
      if (!existingAsset) {
        await db.insert(mediaAssets).values({
          cloudinaryId: uploaded.publicId,
          url: uploaded.url,
          filename: data.filename,
          type,
          sizeBytes: buffer.length,
          usedIn: ["gallery"],
          uploadedBy: editor.id,
        });
      } else if (!(existingAsset.usedIn ?? []).includes("gallery")) {
        await db
          .update(mediaAssets)
          .set({ usedIn: [...(existingAsset.usedIn ?? []), "gallery"] })
          .where(eq(mediaAssets.id, existingAsset.id));
      }

      // auto cover: first upload sets cover if empty
      if (!album.coverImage) {
        await db
          .update(galleryAlbums)
          .set({ coverImage: uploaded.url, updatedAt: new Date() })
          .where(eq(galleryAlbums.id, data.albumId));
      }

      fireAudit({
        userId: editor.id,
        module: "gallery",
        action: "upload",
        recordId: row!.id,
        recordTitle: data.filename,
        after: auditSnap(row!),
      });

      return itemRowToDto(row!);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "UPLOAD_FAILED",
        err instanceof Error ? err.message : "Upload failed",
      );
    }
  });

const updateItemSchema = z.object({
  id: z.string().uuid(),
  data: z.object({
    caption: z.string().max(200).optional().nullable(),
    alt_text: z.string().max(300).optional().nullable(),
    is_published: z.boolean().optional(),
  }),
});

export const updateMediaItem = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => updateItemSchema.parse(raw))
  .handler(async ({ data: { id, data } }): Promise<GalleryItemDto> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.query.galleryItems.findFirst({
        where: eq(galleryItems.id, id),
      });
      if (!existing) throw createError("NOT_FOUND", "Media item not found");

      // enforce alt text required before publish
      const nextPublished = data.is_published ?? existing.isPublished;
      const nextAlt =
        data.alt_text !== undefined ? data.alt_text : existing.altText;
      if (nextPublished && !nextAlt?.trim()) {
        throw createError(
          "VALIDATION_ERROR",
          "Alt text is required before publishing",
        );
      }

      const [row] = await db
        .update(galleryItems)
        .set({
          caption: data.caption !== undefined ? data.caption : existing.caption,
          altText:
            data.alt_text !== undefined ? data.alt_text : existing.altText,
          isPublished: data.is_published ?? existing.isPublished,
        })
        .where(eq(galleryItems.id, id))
        .returning();
      fireAudit({
        userId: editor.id,
        module: "gallery",
        action: "update",
        recordId: id,
        recordTitle: existing.caption ?? existing.altText ?? id,
        before: auditSnap(existing),
        after: auditSnap(row!),
      });
      return itemRowToDto(row!);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to update item",
      );
    }
  });

export const deleteMediaItem = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ success: true }> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.query.galleryItems.findFirst({
        where: eq(galleryItems.id, id),
      });
      if (!existing) throw createError("NOT_FOUND", "Media item not found");
      const publicId = publicIdFromUrl(existing.url);
      if (publicId) {
        const type = (existing.type as MediaType) ?? "image";
        await deleteAsset(publicId, type === "video" ? "video" : "image").catch(
          () => undefined,
        );
      }
      await db.delete(galleryItems).where(eq(galleryItems.id, id));
      fireAudit({
        userId: editor.id,
        module: "gallery",
        action: "delete",
        recordId: id,
        recordTitle: existing.caption ?? existing.altText ?? id,
        before: auditSnap(existing),
      });
      return { success: true };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to delete item",
      );
    }
  });

export const reorderItems = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const schema = z.object({
      albumId: z.string().uuid(),
      ids: z.array(z.string().uuid()).min(1),
    });
    return schema.parse(raw);
  })
  .handler(async ({ data: { albumId, ids } }): Promise<{ success: true }> => {
    try {
      await requireEditorSession();
      await db.transaction(async (tx) => {
        for (let i = 0; i < ids.length; i++) {
          await tx
            .update(galleryItems)
            .set({ sortOrder: i })
            .where(
              and(
                eq(galleryItems.albumId, albumId),
                eq(galleryItems.id, ids[i]!),
              ),
            );
        }
      });
      return { success: true };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to reorder items",
      );
    }
  });

export const setAlbumCover = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z
      .object({ albumId: z.string().uuid(), itemId: z.string().uuid() })
      .parse(raw),
  )
  .handler(
    async ({ data: { albumId, itemId } }): Promise<{ success: true }> => {
      try {
        await requireEditorSession();
        const item = await db.query.galleryItems.findFirst({
          where: and(
            eq(galleryItems.id, itemId),
            eq(galleryItems.albumId, albumId),
          ),
        });
        if (!item) throw createError("NOT_FOUND", "Item not found");
        await db
          .update(galleryAlbums)
          .set({ coverImage: item.url, updatedAt: new Date() })
          .where(eq(galleryAlbums.id, albumId));
        return { success: true };
      } catch (err) {
        if (isAppError(err)) throw err;
        throw createError(
          "INTERNAL",
          err instanceof Error ? err.message : "Failed to set cover",
        );
      }
    },
  );

export const bulkPublish = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z
      .object({
        ids: z.array(z.string().uuid()).min(1),
        published: z.boolean(),
      })
      .parse(raw),
  )
  .handler(async ({ data: { ids, published } }): Promise<{ success: true }> => {
    try {
      await requireEditorSession();
      if (published) {
        const rows = await db
          .select()
          .from(galleryItems)
          .where(inArray(galleryItems.id, ids));
        const missingAlt = rows.some((r) => !r.altText?.trim());
        if (missingAlt) {
          throw createError(
            "VALIDATION_ERROR",
            "Alt text is required before publishing",
          );
        }
      }
      await db
        .update(galleryItems)
        .set({ isPublished: published })
        .where(inArray(galleryItems.id, ids));
      return { success: true };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to bulk update",
      );
    }
  });

// Public helpers
export const getPublishedAlbums = createServerFn({ method: "GET" }).handler(
  async (): Promise<GalleryAlbumDto[]> => {
    try {
      const rows = await db
        .select({
          album: galleryAlbums,
          itemCount: count(galleryItems.id).as("itemCount"),
        })
        .from(galleryAlbums)
        .leftJoin(
          galleryItems,
          and(
            eq(galleryItems.albumId, galleryAlbums.id),
            eq(galleryItems.isPublished, true),
          ),
        )
        .where(eq(galleryAlbums.isPublished, true))
        .groupBy(galleryAlbums.id)
        .orderBy(asc(galleryAlbums.sortOrder), desc(galleryAlbums.updatedAt));
      return rows.map((r) => albumRowToDto(r.album, Number(r.itemCount ?? 0)));
    } catch (err) {
      if (isDbUnavailableError(err)) {
        console.error("[getPublishedAlbums]", DB_SETUP_HINT);
        return [];
      }
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to list",
      );
    }
  },
);

export const getPublishedAlbumItems = createServerFn({ method: "GET" })
  .inputValidator((albumId: unknown) => z.string().uuid().parse(albumId))
  .handler(
    async ({
      data: albumId,
    }): Promise<{ album: GalleryAlbumDto; items: GalleryItemDto[] } | null> => {
      try {
        const album = await db.query.galleryAlbums.findFirst({
          where: and(
            eq(galleryAlbums.id, albumId),
            eq(galleryAlbums.isPublished, true),
          ),
        });
        if (!album) return null;
        const items = await db.query.galleryItems.findMany({
          where: and(
            eq(galleryItems.albumId, albumId),
            eq(galleryItems.isPublished, true),
          ),
          orderBy: [asc(galleryItems.sortOrder), desc(galleryItems.createdAt)],
        });
        const [{ itemCount }] = await db
          .select({ itemCount: count(galleryItems.id) })
          .from(galleryItems)
          .where(
            and(
              eq(galleryItems.albumId, albumId),
              eq(galleryItems.isPublished, true),
            ),
          );
        return {
          album: albumRowToDto(album, Number(itemCount ?? 0)),
          items: items.map(itemRowToDto),
        };
      } catch (err) {
        if (isDbUnavailableError(err)) {
          console.error("[getPublishedAlbumItems]", DB_SETUP_HINT);
          return null;
        }
        if (isAppError(err)) throw err;
        throw createError(
          "INTERNAL",
          err instanceof Error ? err.message : "Failed to load",
        );
      }
    },
  );

export const getPublishedGalleryItems = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublishedGalleryItemDto[]> => {
    try {
      const rows = await db
        .select({
          item: galleryItems,
          albumTitle: galleryAlbums.title,
        })
        .from(galleryItems)
        .innerJoin(
          galleryAlbums,
          and(
            eq(galleryItems.albumId, galleryAlbums.id),
            eq(galleryAlbums.isPublished, true),
          ),
        )
        .where(eq(galleryItems.isPublished, true))
        .orderBy(desc(galleryItems.createdAt));

      return rows.map((r) => ({
        ...itemRowToDto(r.item),
        album_title: r.albumTitle,
      }));
    } catch (err) {
      if (isDbUnavailableError(err)) {
        console.error("[getPublishedGalleryItems]", DB_SETUP_HINT);
        return [];
      }
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load gallery items",
      );
    }
  },
);

export const getLatestGalleryItems = createServerFn({ method: "GET" })
  .inputValidator((n: unknown) => z.number().int().min(1).max(30).parse(n))
  .handler(async ({ data: n }): Promise<GalleryItemDto[]> => {
    try {
      const rows = await db
        .select()
        .from(galleryItems)
        .where(eq(galleryItems.isPublished, true))
        .orderBy(desc(galleryItems.createdAt))
        .limit(n);
      return rows.map(itemRowToDto);
    } catch (err) {
      if (isDbUnavailableError(err)) {
        console.error("[getLatestGalleryItems]", DB_SETUP_HINT);
        return [];
      }
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load latest items",
      );
    }
  });
