import { z } from 'zod'
import { emailSchema, uuidSchema } from './common'

export const tourDurationSchema = z.enum(['Half Day', 'Full Day', 'Multi Day'])

export const bookingInputSchema = z.object({
  guide_id: uuidSchema,
  visitor_name: z.string().min(1).max(200),
  visitor_email: emailSchema,
  visitor_phone: z.string().max(30).optional(),
  visitor_country: z.string().min(1).max(100),
  tour_date: z
    .string()
    .date()
    .refine((d) => new Date(d) > new Date(), 'Tour date must be in the future'),
  tour_duration: tourDurationSchema,
  group_size: z.number().min(1).max(50),
  special_requests: z.string().max(1000).optional(),
})

export type BookingInput = z.infer<typeof bookingInputSchema>
