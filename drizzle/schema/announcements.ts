import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull(),
  body: text("body"),
  coverImage: text("cover_image"),
  eventDate: date("event_date"),
  eventLocation: text("event_location"),
  registrationEnabled: boolean("registration_enabled").default(false).notNull(),
  registrationCapacity: integer("registration_capacity"),
  registrationDeadline: date("registration_deadline"),
  registrationNote: text("registration_note"),
  registrationAutoConfirm: boolean("registration_auto_confirm")
    .default(true)
    .notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  createdBy: text("created_by").references(() => user.id),
  updatedBy: text("updated_by").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
