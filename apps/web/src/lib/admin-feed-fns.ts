import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { desc, inArray } from "drizzle-orm";
import { db } from "../../../../db/index";
import {
  announcements,
  attractions,
  galleryAlbums,
  guides,
} from "../../../../drizzle/schema/index";
import { auth } from "@/lib/auth.server";
import { createError, isAppError } from "@/lib/errors";
import { isDbUnavailableError } from "@/lib/db-errors";
import type { UserRole } from "@/lib/types";

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

export type AdminFeedKind =
  | "news"
  | "event"
  | "attraction"
  | "photo"
  | "guide";

export type AdminFeedItem = {
  kind: AdminFeedKind;
  id: string;
  title: string;
  is_published: boolean;
  updated_at: string;
  image: string | null;
  subtitle: string | null;
};

const PER_KIND = 20;
const FEED_LIMIT = 40;

/** Recent Create-type content for admin Feed (L-009). */
export const getAdminFeed = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminFeedItem[]> => {
    try {
      await requireEditorSession();

      const [newsRows, attractionRows, guideRows, albumRows] =
        await Promise.all([
          db
            .select({
              id: announcements.id,
              title: announcements.title,
              type: announcements.type,
              isPublished: announcements.isPublished,
              updatedAt: announcements.updatedAt,
              coverImage: announcements.coverImage,
            })
            .from(announcements)
            .where(inArray(announcements.type, ["News", "Event"]))
            .orderBy(desc(announcements.updatedAt))
            .limit(PER_KIND),
          db
            .select({
              id: attractions.id,
              title: attractions.title,
              isPublished: attractions.isPublished,
              updatedAt: attractions.updatedAt,
              image: attractions.image,
              category: attractions.category,
            })
            .from(attractions)
            .orderBy(desc(attractions.updatedAt))
            .limit(PER_KIND),
          db
            .select({
              id: guides.id,
              name: guides.name,
              isPublished: guides.isPublished,
              updatedAt: guides.updatedAt,
              photo: guides.photo,
              licenseNumber: guides.licenseNumber,
            })
            .from(guides)
            .orderBy(desc(guides.updatedAt))
            .limit(PER_KIND),
          db
            .select({
              id: galleryAlbums.id,
              title: galleryAlbums.title,
              isPublished: galleryAlbums.isPublished,
              updatedAt: galleryAlbums.updatedAt,
              coverImage: galleryAlbums.coverImage,
            })
            .from(galleryAlbums)
            .orderBy(desc(galleryAlbums.updatedAt))
            .limit(PER_KIND),
        ]);

      const items: AdminFeedItem[] = [
        ...newsRows.map((r) => ({
          kind: (r.type === "Event" ? "event" : "news") as AdminFeedKind,
          id: r.id,
          title: r.title,
          is_published: r.isPublished,
          updated_at: r.updatedAt.toISOString(),
          image: r.coverImage,
          subtitle: r.type,
        })),
        ...attractionRows.map((r) => ({
          kind: "attraction" as const,
          id: r.id,
          title: r.title,
          is_published: r.isPublished,
          updated_at: r.updatedAt.toISOString(),
          image: r.image,
          subtitle: r.category,
        })),
        ...guideRows.map((r) => ({
          kind: "guide" as const,
          id: r.id,
          title: r.name,
          is_published: r.isPublished,
          updated_at: r.updatedAt.toISOString(),
          image: r.photo,
          subtitle: r.licenseNumber
            ? `License #${r.licenseNumber}`
            : "Guide",
        })),
        ...albumRows.map((r) => ({
          kind: "photo" as const,
          id: r.id,
          title: r.title,
          is_published: r.isPublished,
          updated_at: r.updatedAt.toISOString(),
          image: r.coverImage,
          subtitle: "Gallery album",
        })),
      ];

      items.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );

      return items.slice(0, FEED_LIMIT);
    } catch (err) {
      if (isDbUnavailableError(err)) return [];
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load feed",
      );
    }
  },
);
