import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  cloudinaryId: text("cloudinary_id").notNull().unique(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  filename: text("filename"),
  type: text("type").notNull(),
  sizeBytes: integer("size_bytes"),
  width: integer("width"),
  height: integer("height"),
  altText: text("alt_text"),
  usedIn: text("used_in").array().default([]).notNull(),
  uploadedBy: text("uploaded_by").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
