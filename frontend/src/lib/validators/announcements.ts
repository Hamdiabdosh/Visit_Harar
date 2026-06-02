import { z } from 'zod'
import { slugSchema, urlSchema } from './common'

export const announcementTypeSchema = z.enum(['News', 'Event', 'Notice'])

export const announcementInputSchema = z.object({
  title: z.string().min(1).max(200),
  slug: slugSchema.optional(),
  type: announcementTypeSchema,
  body: z.string().optional(),
  cover_image: urlSchema.optional(),
  event_date: z.string().date().optional(),
  event_location: z.string().max(200).optional(),
  is_pinned: z.boolean().default(false),
  is_published: z.boolean().default(false),
})

export type AnnouncementInput = z.infer<typeof announcementInputSchema>
