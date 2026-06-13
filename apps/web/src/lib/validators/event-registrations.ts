import { z } from "zod";
import { emailSchema, uuidSchema } from "./common";

export const eventRegistrationStatusSchema = z.enum([
  "Pending",
  "Confirmed",
  "Declined",
  "Cancelled",
  "CheckedIn",
]);

export const eventRegistrationInputSchema = z.object({
  announcement_id: uuidSchema,
  visitor_name: z.string().min(1).max(200),
  visitor_email: emailSchema,
  visitor_phone: z.string().max(30).optional(),
  visitor_country: z.string().min(1).max(100),
  party_size: z.number().int().min(1).max(20),
  special_requests: z.string().max(1000).optional(),
});

export const eventRegistrationStatusInputSchema = z.object({
  registration_ref: z.string().min(1),
  visitor_email: emailSchema,
});

export type EventRegistrationInput = z.infer<
  typeof eventRegistrationInputSchema
>;
