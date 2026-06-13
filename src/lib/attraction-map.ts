import type { Attraction } from "@/lib/types";
import type { AttractionInput } from "@/lib/validators/attractions";
import type { AttractionCategory } from "@/lib/attraction-styles";

export type AttractionDto = {
  id: string;
  title: string;
  slug: string;
  short_desc: string | null;
  full_desc: string | null;
  image: string | null;
  category: AttractionCategory;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  latitude: number | null;
  longitude: number | null;
  opening_hours: string | null;
  best_time_to_visit: string | null;
  visitor_tips: string | null;
  audio_url: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
  updated_by_name?: string | null;
};

export function rowToAttractionDto(
  row: Attraction,
  updatedByName?: string | null,
): AttractionDto {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    short_desc: row.shortDesc,
    full_desc: row.fullDesc,
    image: row.image,
    category: row.category as AttractionCategory,
    is_featured: row.isFeatured,
    is_published: row.isPublished,
    sort_order: row.sortOrder,
    latitude: row.latitude ? Number(row.latitude) : null,
    longitude: row.longitude ? Number(row.longitude) : null,
    opening_hours: row.openingHours ?? null,
    best_time_to_visit: row.bestTimeToVisit ?? null,
    visitor_tips: row.visitorTips ?? null,
    audio_url: row.audioUrl ?? null,
    created_by: row.createdBy,
    updated_by: row.updatedBy,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    updated_by_name: updatedByName ?? null,
  };
}

export function inputToRowValues(
  input: AttractionInput,
  userId: string,
  slug: string,
) {
  return {
    title: input.title,
    slug,
    shortDesc: input.short_desc ?? null,
    fullDesc: input.full_desc ?? null,
    image: input.image || null,
    category: input.category,
    isFeatured: input.is_featured ?? false,
    isPublished: input.is_published ?? false,
    sortOrder: input.sort_order ?? 0,
    latitude: input.latitude != null ? String(input.latitude) : null,
    longitude: input.longitude != null ? String(input.longitude) : null,
    openingHours: input.opening_hours ?? null,
    bestTimeToVisit: input.best_time_to_visit ?? null,
    visitorTips: input.visitor_tips ?? null,
    audioUrl: input.audio_url || null,
    updatedBy: userId,
    updatedAt: new Date(),
  };
}

export function fullDescParagraphs(
  fullDesc: string | null | undefined,
): string[] {
  if (!fullDesc?.trim()) return [];
  if (fullDesc.includes("<p>") || fullDesc.includes("<br")) {
    return [fullDesc];
  }
  return fullDesc
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}
