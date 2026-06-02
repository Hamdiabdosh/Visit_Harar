import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { user } from './auth'

export const galleryAlbums = pgTable('gallery_albums', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  coverImage: text('cover_image'),
  isPublished: boolean('is_published').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdBy: text('created_by').references(() => user.id),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const galleryItems = pgTable('gallery_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  albumId: uuid('album_id')
    .notNull()
    .references(() => galleryAlbums.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  caption: text('caption'),
  altText: text('alt_text'),
  isPublished: boolean('is_published').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  uploadedBy: text('uploaded_by').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
