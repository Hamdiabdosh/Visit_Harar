import type { HeroContent } from '@/lib/types'
import type { HeroInput } from '@/lib/validators/hero'

/** API / form shape (snake_case) for hero content. */
export type HeroDto = {
  id: string
  badge_text: string | null
  headline: string | null
  headline_italic: string | null
  subheading: string | null
  cta_primary_text: string | null
  cta_primary_url: string | null
  cta_ghost_text: string | null
  cta_ghost_url: string | null
  background_image: string | null
  stat_1_number: string | null
  stat_1_label: string | null
  stat_2_number: string | null
  stat_2_label: string | null
  stat_3_number: string | null
  stat_3_label: string | null
  is_published: boolean
  updated_by: string | null
  updated_at: Date
  updated_by_name?: string | null
}

export function rowToHeroDto(
  row: HeroContent,
  updatedByName?: string | null,
): HeroDto {
  return {
    id: row.id,
    badge_text: row.badgeText,
    headline: row.headline,
    headline_italic: row.headlineItalic,
    subheading: row.subheading,
    cta_primary_text: row.ctaPrimaryText,
    cta_primary_url: row.ctaPrimaryUrl,
    cta_ghost_text: row.ctaGhostText,
    cta_ghost_url: row.ctaGhostUrl,
    background_image: row.backgroundImage,
    stat_1_number: row.stat1Number,
    stat_1_label: row.stat1Label,
    stat_2_number: row.stat2Number,
    stat_2_label: row.stat2Label,
    stat_3_number: row.stat3Number,
    stat_3_label: row.stat3Label,
    is_published: row.isPublished,
    updated_by: row.updatedBy,
    updated_at: row.updatedAt,
    updated_by_name: updatedByName ?? null,
  }
}

export function inputToRowValues(input: HeroInput, userId: string) {
  return {
    badgeText: input.badge_text ?? null,
    headline: input.headline ?? null,
    headlineItalic: input.headline_italic ?? null,
    subheading: input.subheading ?? null,
    ctaPrimaryText: input.cta_primary_text ?? null,
    ctaPrimaryUrl: input.cta_primary_url ?? null,
    ctaGhostText: input.cta_ghost_text ?? null,
    ctaGhostUrl: input.cta_ghost_url ?? null,
    backgroundImage: input.background_image || null,
    stat1Number: input.stat_1_number ?? null,
    stat1Label: input.stat_1_label ?? null,
    stat2Number: input.stat_2_number ?? null,
    stat2Label: input.stat_2_label ?? null,
    stat3Number: input.stat_3_number ?? null,
    stat3Label: input.stat_3_label ?? null,
    isPublished: input.is_published ?? false,
    updatedBy: userId,
    updatedAt: new Date(),
  }
}

export const defaultHeroInput: HeroInput = {
  badge_text: 'UNESCO World Heritage Site · Inscribed 2006',
  headline: 'Discover',
  headline_italic: 'Harar,\nCity of Saints',
  subheading:
    "Africa's fourth holiest city in Islam — a living medieval walled city of ancient mosques, vibrant markets and the legendary hyena men, nestled in the highlands of eastern Ethiopia.",
  cta_primary_text: 'Plan Your Visit',
  cta_primary_url: '/plan-your-trip',
  cta_ghost_text: 'Watch the City',
  cta_ghost_url: '#',
  background_image: undefined,
  stat_1_number: '82',
  stat_1_label: 'Mosques',
  stat_2_number: '102',
  stat_2_label: 'Shrines',
  stat_3_number: '1,000+',
  stat_3_label: 'Years of History',
  is_published: false,
}

export function dtoToPreviewProps(dto: Partial<HeroInput> | HeroDto) {
  const headlineItalic =
    'headline_italic' in dto ? dto.headline_italic : undefined
  return {
    badgeText: dto.badge_text ?? defaultHeroInput.badge_text,
    headline: dto.headline ?? defaultHeroInput.headline,
    headlineItalic: headlineItalic ?? defaultHeroInput.headline_italic,
    subheading: dto.subheading ?? defaultHeroInput.subheading,
    ctaPrimaryText: dto.cta_primary_text ?? defaultHeroInput.cta_primary_text,
    ctaPrimaryUrl: dto.cta_primary_url ?? defaultHeroInput.cta_primary_url,
    ctaGhostText: dto.cta_ghost_text ?? defaultHeroInput.cta_ghost_text,
    ctaGhostUrl: dto.cta_ghost_url ?? defaultHeroInput.cta_ghost_url,
    backgroundImage: dto.background_image ?? null,
    stats: [
      {
        number: dto.stat_1_number ?? defaultHeroInput.stat_1_number!,
        label: dto.stat_1_label ?? defaultHeroInput.stat_1_label!,
      },
      {
        number: dto.stat_2_number ?? defaultHeroInput.stat_2_number!,
        label: dto.stat_2_label ?? defaultHeroInput.stat_2_label!,
      },
      {
        number: dto.stat_3_number ?? defaultHeroInput.stat_3_number!,
        label: dto.stat_3_label ?? defaultHeroInput.stat_3_label!,
      },
    ],
  }
}
