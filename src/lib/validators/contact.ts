import { z } from "zod";
import { emailSchema, urlSchema } from "./common";

export const workingHoursRowSchema = z.object({
  day: z.string().min(1).max(50),
  hours: z.string().min(1).max(100),
});

export const contactInputSchema = z.object({
  office_name: z.string().max(200).optional(),
  address_line1: z.string().max(200).optional(),
  address_line2: z.string().max(200).optional(),
  country: z.string().max(100).optional(),
  phone_primary: z.string().max(30).optional(),
  phone_secondary: z.string().max(30).optional(),
  email_general: emailSchema.optional(),
  email_bookings: emailSchema.optional(),
  working_hours: z.array(workingHoursRowSchema).default([]),
  map_lat: z.number().optional(),
  map_lng: z.number().optional(),
  facebook_url: urlSchema.optional(),
  twitter_url: urlSchema.optional(),
  instagram_url: urlSchema.optional(),
  is_published: z.boolean().default(false),
});

export type ContactInput = z.infer<typeof contactInputSchema>;
