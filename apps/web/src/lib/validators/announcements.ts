import { z } from "zod";
import { cloudinaryUrlSchema, slugSchema } from "./common";

export const announcementTypeSchema = z.enum(["News", "Event", "Notice"]);

export const announcementInputSchema = z.object({
  title: z.string().min(1).max(200),
  slug: slugSchema.optional(),
  type: announcementTypeSchema,
  body: z.string().optional(),
  cover_image: cloudinaryUrlSchema.optional(),
  event_date: z.string().date().optional(),
  event_location: z.string().max(200).optional(),
  registration_enabled: z.boolean().default(false),
  registration_capacity: z.number().int().min(1).max(10000).optional(),
  registration_deadline: z.string().date().optional(),
  registration_note: z.string().max(500).optional(),
  registration_auto_confirm: z.boolean().default(true),
  is_pinned: z.boolean().default(false),
  is_published: z.boolean().default(false),
});

export type AnnouncementInput = z.infer<typeof announcementInputSchema>;
