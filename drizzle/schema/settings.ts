import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteName: text("site_name"),
  siteTagline: text("site_tagline"),
  defaultOgImage: text("default_og_image"),
  maintenanceMode: boolean("maintenance_mode").default(false).notNull(),
  /** Public guide booking — V2 default off (L-005). */
  bookingEnabled: boolean("booking_enabled").default(false).notNull(),
  /** Public event RSVP — V2 default off (L-005). */
  eventRsvpEnabled: boolean("event_rsvp_enabled").default(false).notNull(),
  /** PWA install UI — V2 default off (L-005). */
  pwaInstallEnabled: boolean("pwa_install_enabled").default(false).notNull(),
  /** Android APK / app promo — V2 default off (L-005). */
  appPromoEnabled: boolean("app_promo_enabled").default(false).notNull(),
  bureauEmail: text("bureau_email"),
  analyticsId: text("analytics_id"),
  chatKnowledgeExtra: text("chat_knowledge_extra"),
  updatedBy: text("updated_by").references(() => user.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
