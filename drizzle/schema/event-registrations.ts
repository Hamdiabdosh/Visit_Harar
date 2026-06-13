import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { announcements } from "./announcements";

export const eventRegistrations = pgTable("event_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  registrationRef: text("registration_ref").notNull().unique(),
  announcementId: uuid("announcement_id")
    .notNull()
    .references(() => announcements.id, { onDelete: "restrict" }),
  visitorName: text("visitor_name").notNull(),
  visitorEmail: text("visitor_email").notNull(),
  visitorPhone: text("visitor_phone"),
  visitorCountry: text("visitor_country").notNull(),
  partySize: integer("party_size").notNull(),
  specialRequests: text("special_requests"),
  status: text("status").default("Pending").notNull(),
  statusNote: text("status_note"),
  qrToken: text("qr_token").notNull().unique(),
  notifiedAt: timestamp("notified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedBy: text("updated_by").references(() => user.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
