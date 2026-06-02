import { z } from 'zod'
import { paginationSchema } from './common'

export const mediaTypeSchema = z.enum(['image', 'video'])

export const mediaFilterSchema = paginationSchema.extend({
  type: mediaTypeSchema.optional(),
  search: z.string().max(200).optional(),
  sort: z.enum(['newest', 'oldest', 'largest', 'smallest']).default('newest'),
})

export const altTextSchema = z.string().min(1).max(300)

export type MediaFilterInput = z.infer<typeof mediaFilterSchema>
