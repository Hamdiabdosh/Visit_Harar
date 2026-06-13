import { createServerFn } from "@tanstack/react-start";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index";
import {
  announcements,
  attractions,
  guides,
  itineraries,
  partners,
} from "../../drizzle/schema/index";
import { createError, isAppError } from "@/lib/errors";
import { DB_SETUP_HINT, isDbUnavailableError } from "@/lib/db-errors";

export type SearchResultType =
  | "attraction"
  | "guide"
  | "announcement"
  | "partner"
  | "itinerary";

export type SearchResultItem = {
  type: SearchResultType;
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string | null;
  href: string;
  meta?: string;
};

const searchInputSchema = z.object({
  q: z.string().trim().min(1).max(100),
  limit: z.number().int().min(1).max(30).default(15),
});

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(text: string | null | undefined, max = 120) {
  if (!text) return "";
  const plain = stripHtml(text);
  return plain.length <= max ? plain : `${plain.slice(0, max).trim()}…`;
}

export const searchPublished = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => searchInputSchema.parse(raw))
  .handler(
    async ({
      data,
    }): Promise<{ query: string; results: SearchResultItem[] }> => {
      try {
        const pattern = `%${data.q}%`;
        const perType = Math.ceil(data.limit / 5);

        const [
          attractionRows,
          guideRows,
          announcementRows,
          partnerRows,
          itineraryRows,
        ] = await Promise.all([
            db
              .select()
              .from(attractions)
              .where(
                and(
                  eq(attractions.isPublished, true),
                  or(
                    ilike(attractions.title, pattern),
                    ilike(attractions.shortDesc, pattern),
                    ilike(attractions.fullDesc, pattern),
                    ilike(attractions.category, pattern),
                  ),
                ),
              )
              .orderBy(desc(attractions.isFeatured), desc(attractions.sortOrder))
              .limit(perType),
            db
              .select()
              .from(guides)
              .where(
                and(
                  eq(guides.isPublished, true),
                  or(
                    ilike(guides.name, pattern),
                    ilike(guides.bio, pattern),
                    ilike(guides.licenseNumber, pattern),
                  ),
                ),
              )
              .orderBy(desc(guides.sortOrder))
              .limit(perType),
            db
              .select()
              .from(announcements)
              .where(
                and(
                  eq(announcements.isPublished, true),
                  or(
                    ilike(announcements.title, pattern),
                    ilike(announcements.body, pattern),
                    ilike(announcements.type, pattern),
                  ),
                ),
              )
              .orderBy(
                desc(announcements.isPinned),
                desc(announcements.publishedAt),
              )
              .limit(perType),
          db
            .select()
            .from(partners)
            .where(
              and(
                eq(partners.isPublished, true),
                or(
                  ilike(partners.name, pattern),
                  ilike(partners.description, pattern),
                  ilike(partners.category, pattern),
                ),
              ),
            )
            .orderBy(desc(partners.isFeatured), asc(partners.sortOrder))
            .limit(perType),
          db
            .select()
            .from(itineraries)
            .where(
              and(
                eq(itineraries.isPublished, true),
                or(
                  ilike(itineraries.title, pattern),
                  ilike(itineraries.summary, pattern),
                  ilike(itineraries.duration, pattern),
                ),
              ),
            )
            .orderBy(asc(itineraries.sortOrder))
            .limit(perType),
        ]);

        const results: SearchResultItem[] = [
          ...attractionRows.map((row) => ({
            type: "attraction" as const,
            id: row.id,
            title: row.title,
            slug: row.slug,
            excerpt: excerpt(row.shortDesc ?? row.fullDesc),
            image: row.image,
            href: `/attractions/${row.slug}`,
            meta: row.category,
          })),
          ...guideRows.map((row) => ({
            type: "guide" as const,
            id: row.id,
            title: row.name,
            slug: row.slug,
            excerpt: excerpt(row.bio),
            image: row.photo,
            href: `/guides/${row.slug}`,
            meta: row.languages.slice(0, 3).join(", ") || undefined,
          })),
          ...announcementRows.map((row) => ({
            type: "announcement" as const,
            id: row.id,
            title: row.title,
            slug: row.slug,
            excerpt: excerpt(row.body),
            image: row.coverImage,
            href: `/news/${row.slug}`,
            meta: row.type,
          })),
          ...partnerRows.map((row) => ({
            type: "partner" as const,
            id: row.id,
            title: row.name,
            slug: row.slug,
            excerpt: excerpt(row.description),
            image: row.image,
            href: `/services#${row.slug}`,
            meta: row.category,
          })),
          ...itineraryRows.map((row) => ({
            type: "itinerary" as const,
            id: row.id,
            title: row.title,
            slug: row.slug,
            excerpt: excerpt(row.summary),
            image: null,
            href: `/itineraries/${row.slug}`,
            meta: row.duration,
          })),
        ].slice(0, data.limit);

        return { query: data.q, results };
      } catch (err) {
        if (isDbUnavailableError(err)) {
          console.error("[searchPublished]", DB_SETUP_HINT);
          return { query: data.q, results: [] };
        }
        if (isAppError(err)) throw err;
        throw createError(
          "INTERNAL",
          err instanceof Error ? err.message : "Search failed",
        );
      }
    },
  );
