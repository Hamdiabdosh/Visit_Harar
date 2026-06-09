import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const heroContent = pgTable("hero_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  badgeText: text("badge_text"),
  headline: text("headline"),
  headlineItalic: text("headline_italic"),
  subheading: text("subheading"),
  ctaPrimaryText: text("cta_primary_text"),
  ctaPrimaryUrl: text("cta_primary_url"),
  ctaGhostText: text("cta_ghost_text"),
  ctaGhostUrl: text("cta_ghost_url"),
  backgroundImage: text("background_image"),
  stat1Number: text("stat_1_number"),
  stat1Label: text("stat_1_label"),
  stat2Number: text("stat_2_number"),
  stat2Label: text("stat_2_label"),
  stat3Number: text("stat_3_number"),
  stat3Label: text("stat_3_label"),
  isPublished: boolean("is_published").default(false).notNull(),
  updatedBy: text("updated_by").references(() => user.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
