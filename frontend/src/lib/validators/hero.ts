import { z } from 'zod'
import { urlSchema } from './common'

export const heroInputSchema = z.object({
  badge_text: z.string().max(100).optional(),
  headline: z.string().max(100).optional(),
  headline_italic: z.string().max(100).optional(),
  subheading: z.string().max(500).optional(),
  cta_primary_text: z.string().max(50).optional(),
  cta_primary_url: z.string().max(500).optional(),
  cta_ghost_text: z.string().max(50).optional(),
  cta_ghost_url: z.string().max(500).optional(),
  background_image: urlSchema.optional(),
  stat_1_number: z.string().max(20).optional(),
  stat_1_label: z.string().max(30).optional(),
  stat_2_number: z.string().max(20).optional(),
  stat_2_label: z.string().max(30).optional(),
  stat_3_number: z.string().max(20).optional(),
  stat_3_label: z.string().max(30).optional(),
  is_published: z.boolean().default(false),
})

export type HeroInput = z.infer<typeof heroInputSchema>
