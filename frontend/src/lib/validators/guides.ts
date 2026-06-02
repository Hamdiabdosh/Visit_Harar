import { z } from 'zod'
import { emailSchema, slugSchema, urlSchema } from './common'

export const guideInputSchema = z.object({
  name: z.string().min(1).max(200),
  slug: slugSchema.optional(),
  photo: urlSchema.optional(),
  bio: z.string().optional(),
  languages: z.array(z.string().min(1).max(50)).default([]),
  specialties: z.array(z.string().min(1).max(50)).default([]),
  experience_years: z.number().int().min(0).max(60).optional(),
  license_number: z.string().max(50).optional(),
  phone: z.string().max(30).optional(),
  email: emailSchema.optional(),
  is_available: z.boolean().default(true),
  is_published: z.boolean().default(false),
  sort_order: z.number().int().default(0),
})

export type GuideInput = z.infer<typeof guideInputSchema>
