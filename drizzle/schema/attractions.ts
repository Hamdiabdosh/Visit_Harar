import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const attractions = pgTable("attractions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  shortDesc: text("short_desc"),
  fullDesc: text("full_desc"),
  image: text("image"),
  category: text("category").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  openingHours: text("opening_hours"),
  bestTimeToVisit: text("best_time_to_visit"),
  visitorTips: text("visitor_tips"),
  audioUrl: text("audio_url"),
  createdBy: text("created_by").references(() => user.id),
  updatedBy: text("updated_by").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
