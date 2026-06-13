import { z } from "zod";
import { cloudinaryUrlSchema, slugSchema } from "./common";

const coordinateSchema = z
  .preprocess(
    (v) => (v === "" || v === null || (typeof v === "number" && Number.isNaN(v)) ? undefined : v),
    z.number().min(-90, "Invalid latitude").max(90, "Invalid latitude"),
  )
  .optional();

const longitudeSchema = z
  .preprocess(
    (v) => (v === "" || v === null || (typeof v === "number" && Number.isNaN(v)) ? undefined : v),
    z.number().min(-180, "Invalid longitude").max(180, "Invalid longitude"),
  )
  .optional();

export const attractionCategorySchema = z.enum([
  "Heritage",
  "Wildlife",
  "Spiritual",
  "Culture",
  "Shopping",
  "History",
]);

export const attractionInputSchema = z
  .object({
    title: z.string().min(1).max(200),
    slug: slugSchema.optional(),
    short_desc: z.string().max(160).optional(),
    full_desc: z.string().optional(),
    image: cloudinaryUrlSchema.optional(),
    category: attractionCategorySchema,
    is_featured: z.boolean().default(false),
    is_published: z.boolean().default(false),
    sort_order: z.number().int().default(0),
    latitude: coordinateSchema.nullish(),
    longitude: longitudeSchema.nullish(),
    opening_hours: z.string().max(200).optional(),
    best_time_to_visit: z.string().max(200).optional(),
    visitor_tips: z.string().max(2000).optional(),
    audio_url: z.string().url().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const hasLat = data.latitude != null;
    const hasLng = data.longitude != null;
    if (hasLat !== hasLng) {
      ctx.addIssue({
        code: "custom",
        message: "Both latitude and longitude are required together",
        path: hasLat ? ["longitude"] : ["latitude"],
      });
    }
    if (data.is_published && (!hasLat || !hasLng)) {
      ctx.addIssue({
        code: "custom",
        message: "Location coordinates are required to publish an attraction",
        path: ["latitude"],
      });
    }
  });

export type AttractionInput = z.infer<typeof attractionInputSchema>;
