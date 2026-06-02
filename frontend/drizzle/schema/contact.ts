import {
  boolean,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { user } from './auth'

export const contactInfo = pgTable('contact_info', {
  id: uuid('id').primaryKey().defaultRandom(),
  officeName: text('office_name'),
  addressLine1: text('address_line1'),
  addressLine2: text('address_line2'),
  country: text('country').default('Ethiopia'),
  phonePrimary: text('phone_primary'),
  phoneSecondary: text('phone_secondary'),
  emailGeneral: text('email_general'),
  emailBookings: text('email_bookings'),
  workingHours: jsonb('working_hours').default([]).notNull(),
  mapLat: numeric('map_lat'),
  mapLng: numeric('map_lng'),
  facebookUrl: text('facebook_url'),
  twitterUrl: text('twitter_url'),
  instagramUrl: text('instagram_url'),
  isPublished: boolean('is_published').default(false).notNull(),
  updatedBy: text('updated_by').references(() => user.id),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
