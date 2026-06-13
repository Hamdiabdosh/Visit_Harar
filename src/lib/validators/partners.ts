import { z } from "zod";
import { cloudinaryUrlSchema, slugSchema } from "./common";

export const partnerCategorySchema = z.enum([
  "Hotel",
  "Restaurant",
  "Coffee",
  "Transport",
  "Forex",
  "Other",
]);

export const partnerInputSchema = z.object({
  name: z.string().min(1).max(200),
  slug: slugSchema.optional(),
  category: partnerCategorySchema,
  description: z.string().max(2000).optional(),
  address: z.string().max(300).optional(),
  phone: z.string().max(40).optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  image: cloudinaryUrlSchema.optional(),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

export type PartnerInput = z.infer<typeof partnerInputSchema>;
export type PartnerCategory = z.infer<typeof partnerCategorySchema>;

export const PARTNER_CATEGORIES = partnerCategorySchema.options;
