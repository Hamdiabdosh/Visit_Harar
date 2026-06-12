import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { attractions } from "./attractions";
import { user } from "./auth";

export const mapPlaces = pgTable("map_places", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  placeType: text("place_type").notNull(),
  lat: numeric("lat").notNull(),
  lng: numeric("lng").notNull(),
  address: text("address"),
  phone: text("phone"),
  website: text("website"),
  shortDesc: text("short_desc"),
  image: text("image"),
  linkedAttractionId: uuid("linked_attraction_id").references(
    () => attractions.id,
    { onDelete: "set null" },
  ),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdBy: text("created_by").references(() => user.id),
  updatedBy: text("updated_by").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
