import { eq } from 'drizzle-orm'
import { db } from '../db/index'
import { pages } from '../drizzle/schema/index'

const PAGE_SEEDS = [
  { pageKey: 'about', title: 'About Harar' },
  { pageKey: 'culture', title: 'Culture & Festivals' },
  { pageKey: 'plan', title: 'Plan Your Trip' },
] as const

export async function seedPages() {
  for (const row of PAGE_SEEDS) {
    const existing = await db.query.pages.findFirst({
      where: eq(pages.pageKey, row.pageKey),
    })
    if (existing) {
      await db
        .update(pages)
        .set({ title: row.title, updatedAt: new Date() })
        .where(eq(pages.pageKey, row.pageKey))
    } else {
      await db.insert(pages).values({
        pageKey: row.pageKey,
        title: row.title,
        content: {},
        isPublished: false,
      })
    }
  }
  console.log('✓ Pages seeded (about, culture, plan)')
}
