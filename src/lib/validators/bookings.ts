import { z } from "zod";
import { emailSchema, uuidSchema } from "./common";

export const tourDurationSchema = z.enum(["Half Day", "Full Day", "Multi Day"]);

export const bookingInputSchema = z.object({
  guide_id: uuidSchema,
  visitor_name: z.string().min(1).max(200),
  visitor_email: emailSchema,
  visitor_phone: z.string().max(30).optional(),
  visitor_country: z.string().min(1).max(100),
  tour_date: z
    .string()
    .date()
    .refine((d) => {
      const tour = new Date(`${d}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return tour >= today;
    }, "Tour date cannot be in the past"),
  tour_duration: tourDurationSchema,
  group_size: z.number().min(1).max(50),
  special_requests: z.string().max(1000).optional(),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;
