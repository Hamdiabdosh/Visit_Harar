import { z } from "zod";
import { isMediaUrl } from "@/lib/media-url";

export const uuidSchema = z.string().uuid();
export const slugSchema = z.string().regex(/^[a-z0-9-]+$/);
export const urlSchema = z.string().url();

/** Image fields must come from the media library (local uploads or legacy Cloudinary). */
export const mediaUrlSchema = urlSchema.refine(isMediaUrl, {
  message: "Image must be uploaded via the Media Library.",
});

/** @deprecated Use mediaUrlSchema */
export const cloudinaryUrlSchema = mediaUrlSchema;

export const emailSchema = z.string().email();

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
