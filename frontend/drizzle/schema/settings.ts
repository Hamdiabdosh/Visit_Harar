import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteName: text("site_name"),
  siteTagline: text("site_tagline"),
  defaultOgImage: text("default_og_image"),
  maintenanceMode: boolean("maintenance_mode").default(false).notNull(),
  bookingEnabled: boolean("booking_enabled").default(true).notNull(),
  bureauEmail: text("bureau_email"),
  analyticsId: text("analytics_id"),
  updatedBy: text("updated_by").references(() => user.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
