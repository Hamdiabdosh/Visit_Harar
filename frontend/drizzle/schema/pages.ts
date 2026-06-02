import { boolean, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { user } from './auth'

export const pages = pgTable('pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  pageKey: text('page_key').notNull().unique(),
  title: text('title').notNull(),
  heroImage: text('hero_image'),
  content: jsonb('content').default({}).notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  updatedBy: text('updated_by').references(() => user.id),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
