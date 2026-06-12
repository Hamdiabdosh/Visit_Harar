import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, asc, desc, eq, max } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index";
import { attractions, mapPlaces, user } from "../../drizzle/schema/index";
import { auth } from "@/lib/auth.server";
import { createError, isAppError } from "@/lib/errors";
import { DB_SETUP_HINT, isDbUnavailableError } from "@/lib/db-errors";
import type { MapPlaceType } from "@/lib/map-place-styles";
import { isMapPlaceType } from "@/lib/map-place-styles";
import { mapPlaceInputSchema } from "@/lib/validators/map-places";
import type { UserRole } from "@/lib/types";
import { auditSnap, fireAudit } from "@/lib/audit";

export type MapPlaceDto = {
  id: string;
  title: string;
  place_type: MapPlaceType;
  lat: number;
  lng: number;
  address: string | null;
  phone: string | null;
  website: string | null;
  short_desc: string | null;
  image: string | null;
  linked_attraction_id: string | null;
  linked_attraction_slug: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
  updated_by_name?: string | null;
};

function rowToDto(
  row: typeof mapPlaces.$inferSelect,
  linkedSlug?: string | null,
  updatedByName?: string | null,
): MapPlaceDto {
  const placeType = row.placeType;
  if (!isMapPlaceType(placeType)) {
    throw createError("INTERNAL", `Invalid place type: ${placeType}`);
  }
  return {
    id: row.id,
    title: row.title,
    place_type: placeType,
    lat: Number(row.lat),
    lng: Number(row.lng),
    address: row.address ?? null,
    phone: row.phone ?? null,
    website: row.website ?? null,
    short_desc: row.shortDesc ?? null,
    image: row.image ?? null,
    linked_attraction_id: row.linkedAttractionId ?? null,
    linked_attraction_slug: linkedSlug ?? null,
    is_featured: row.isFeatured,
    is_published: row.isPublished,
    sort_order: row.sortOrder,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    updated_by_name: updatedByName ?? null,
  };
}

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

async function mapRowWithMeta(
  row: typeof mapPlaces.$inferSelect,
): Promise<MapPlaceDto> {
  let linkedSlug: string | null = null;
  if (row.linkedAttractionId) {
    const linked = await db.query.attractions.findFirst({
      where: eq(attractions.id, row.linkedAttractionId),
      columns: { slug: true },
    });
    linkedSlug = linked?.slug ?? null;
  }
  let updatedByName: string | null = null;
  if (row.updatedBy) {
    const [u] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, row.updatedBy))
      .limit(1);
    updatedByName = u?.name ?? null;
  }
  return rowToDto(row, linkedSlug, updatedByName);
}

function inputToRowValues(
  input: z.infer<typeof mapPlaceInputSchema>,
  userId: string,
) {
  return {
    title: input.title,
    placeType: input.place_type,
    lat: String(input.lat),
    lng: String(input.lng),
    address: input.address?.trim() || null,
    phone: input.phone?.trim() || null,
    website: input.website?.trim() || null,
    shortDesc: input.short_desc?.trim() || null,
    image: input.image?.trim() || null,
    linkedAttractionId: input.linked_attraction_id ?? null,
    isFeatured: input.is_featured ?? false,
    isPublished: input.is_published ?? false,
    sortOrder: input.sort_order ?? 0,
    updatedBy: userId,
    updatedAt: new Date(),
  };
}

export const getPublishedMapPlaces = createServerFn({ method: "GET" }).handler(
  async (): Promise<MapPlaceDto[]> => {
    try {
      const rows = await db
        .select()
        .from(mapPlaces)
        .where(eq(mapPlaces.isPublished, true))
        .orderBy(asc(mapPlaces.sortOrder), desc(mapPlaces.updatedAt));
      return Promise.all(rows.map(mapRowWithMeta));
    } catch (err) {
      if (isDbUnavailableError(err)) {
        console.error("[getPublishedMapPlaces]", DB_SETUP_HINT);
        return [];
      }
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load map places",
      );
    }
  },
);

export const getMapPlaces = createServerFn({ method: "GET" }).handler(
  async (): Promise<MapPlaceDto[]> => {
    try {
      await requireEditorSession();
      const rows = await db
        .select()
        .from(mapPlaces)
        .orderBy(asc(mapPlaces.sortOrder), desc(mapPlaces.updatedAt));
      return Promise.all(rows.map(mapRowWithMeta));
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to list map places",
      );
    }
  },
);

export const getMapPlaceById = createServerFn({ method: "GET" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<MapPlaceDto | null> => {
    try {
      await requireEditorSession();
      const row = await db.query.mapPlaces.findFirst({
        where: eq(mapPlaces.id, id),
      });
      if (!row) return null;
      return mapRowWithMeta(row);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load map place",
      );
    }
  });

export const createMapPlace = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => mapPlaceInputSchema.parse(raw))
  .handler(async ({ data }): Promise<MapPlaceDto> => {
    try {
      const editor = await requireEditorSession();
      const [{ maxOrder }] = await db
        .select({ maxOrder: max(mapPlaces.sortOrder) })
        .from(mapPlaces);
      const sortOrder = data.sort_order ?? (maxOrder ?? 0) + 1;
      const [row] = await db
        .insert(mapPlaces)
        .values({
          ...inputToRowValues({ ...data, sort_order: sortOrder }, editor.id),
          createdBy: editor.id,
        })
        .returning();
      fireAudit({
        userId: editor.id,
        module: "map_places",
        action: "create",
        recordId: row!.id,
        recordTitle: row!.title,
        after: auditSnap(row!),
      });
      return mapRowWithMeta(row!);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to create map place",
      );
    }
  });

export const updateMapPlace = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        data: mapPlaceInputSchema,
      })
      .parse(raw),
  )
  .handler(async ({ data: { id, data } }): Promise<MapPlaceDto> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.query.mapPlaces.findFirst({
        where: eq(mapPlaces.id, id),
      });
      if (!existing) throw createError("NOT_FOUND", "Map place not found");
      const [row] = await db
        .update(mapPlaces)
        .set(inputToRowValues(data, editor.id))
        .where(eq(mapPlaces.id, id))
        .returning();
      fireAudit({
        userId: editor.id,
        module: "map_places",
        action: "update",
        recordId: id,
        recordTitle: row!.title,
        before: auditSnap(existing),
        after: auditSnap(row!),
      });
      return mapRowWithMeta(row!);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to update map place",
      );
    }
  });

export const deleteMapPlace = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ ok: true }> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.query.mapPlaces.findFirst({
        where: eq(mapPlaces.id, id),
      });
      if (!existing) throw createError("NOT_FOUND", "Map place not found");
      await db.delete(mapPlaces).where(eq(mapPlaces.id, id));
      fireAudit({
        userId: editor.id,
        module: "map_places",
        action: "delete",
        recordId: id,
        recordTitle: existing.title,
        before: auditSnap(existing),
      });
      return { ok: true };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to delete map place",
      );
    }
  });

export const toggleMapPlacePublished = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<MapPlaceDto> => {
    try {
      const editor = await requireEditorSession();
      const existing = await db.query.mapPlaces.findFirst({
        where: eq(mapPlaces.id, id),
      });
      if (!existing) throw createError("NOT_FOUND", "Map place not found");
      const [row] = await db
        .update(mapPlaces)
        .set({
          isPublished: !existing.isPublished,
          updatedBy: editor.id,
          updatedAt: new Date(),
        })
        .where(eq(mapPlaces.id, id))
        .returning();
      return mapRowWithMeta(row!);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to toggle published",
      );
    }
  });
