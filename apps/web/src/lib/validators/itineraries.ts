import { z } from "zod";
import { slugSchema } from "./common";

export const itineraryDayItemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  attraction_slug: z.string().max(120).optional(),
});

export const itineraryDaySchema = z.object({
  label: z.string().min(1).max(80),
  items: z.array(itineraryDayItemSchema).default([]),
});

export const itineraryInputSchema = z.object({
  title: z.string().min(1).max(200),
  slug: slugSchema.optional(),
  duration: z.string().min(1).max(80),
  summary: z.string().max(500).optional(),
  days: z.array(itineraryDaySchema).default([]),
  is_published: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

export type ItineraryInput = z.infer<typeof itineraryInputSchema>;
export type ItineraryDay = z.infer<typeof itineraryDaySchema>;
export type ItineraryDayItem = z.infer<typeof itineraryDayItemSchema>;
