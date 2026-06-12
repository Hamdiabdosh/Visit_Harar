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
  createdBy: text("created_by").references(() => user.id),
  updatedBy: text("updated_by").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
