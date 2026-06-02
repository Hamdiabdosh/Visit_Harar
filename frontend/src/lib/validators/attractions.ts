import { z } from 'zod'
import { slugSchema, urlSchema } from './common'

export const attractionCategorySchema = z.enum([
  'Heritage',
  'Wildlife',
  'Spiritual',
  'Culture',
  'Shopping',
  'History',
])

export const attractionInputSchema = z.object({
  title: z.string().min(1).max(200),
  slug: slugSchema.optional(),
  short_desc: z.string().max(160).optional(),
  full_desc: z.string().optional(),
  image: urlSchema.optional(),
  category: attractionCategorySchema,
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(false),
  sort_order: z.number().int().default(0),
})

export type AttractionInput = z.infer<typeof attractionInputSchema>
