import { z } from "zod";
import { MAP_PLACE_TYPES } from "@/lib/map-place-styles";

export const mapPlaceInputSchema = z.object({
  title: z.string().min(1).max(200),
  place_type: z.enum(MAP_PLACE_TYPES),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().max(300).optional(),
  phone: z.string().max(40).optional(),
  website: z.string().url().optional().or(z.literal("")),
  short_desc: z.string().max(500).optional(),
  image: z.string().url().optional().or(z.literal("")),
  linked_attraction_id: z.string().uuid().optional().nullable(),
  is_featured: z.boolean().optional(),
  is_published: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
});

export type MapPlaceInput = z.infer<typeof mapPlaceInputSchema>;
