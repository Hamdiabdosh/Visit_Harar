import { z } from "zod";
import { cloudinaryUrlSchema } from "./common";

export const settingsInputSchema = z.object({
  site_name: z.string().min(1).max(120).optional().nullable(),
  site_tagline: z.string().max(240).optional().nullable(),
  default_og_image: cloudinaryUrlSchema.optional().nullable().or(z.literal("")),
  maintenance_mode: z.boolean().optional(),
  booking_enabled: z.boolean().optional(),
  event_rsvp_enabled: z.boolean().optional(),
  pwa_install_enabled: z.boolean().optional(),
  app_promo_enabled: z.boolean().optional(),
  bureau_email: z.string().email().optional().nullable().or(z.literal("")),
  analytics_id: z.string().max(40).optional().nullable(),
  chat_knowledge_extra: z.string().max(8000).optional().nullable(),
});

export type SettingsInput = z.infer<typeof settingsInputSchema>;
