import { z } from "zod";
import { isCloudinaryUrl } from "@/lib/cloudinary-url";

export const uuidSchema = z.string().uuid();
export const slugSchema = z.string().regex(/^[a-z0-9-]+$/);
export const urlSchema = z.string().url();

/** Image fields must point at Cloudinary — all uploads go through the media library. */
export const cloudinaryUrlSchema = urlSchema.refine(isCloudinaryUrl, {
  message: "Image must be a Cloudinary URL. Upload via Media Library.",
});
export const emailSchema = z.string().email();

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
