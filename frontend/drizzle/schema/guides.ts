import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { user } from './auth'

export const guides = pgTable('guides', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  photo: text('photo'),
  bio: text('bio'),
  languages: text('languages').array().default([]).notNull(),
  specialties: text('specialties').array().default([]).notNull(),
  experienceYears: integer('experience_years'),
  licenseNumber: text('license_number'),
  phone: text('phone'),
  email: text('email'),
  isAvailable: boolean('is_available').default(true).notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdBy: text('created_by').references(() => user.id),
  updatedBy: text('updated_by').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
