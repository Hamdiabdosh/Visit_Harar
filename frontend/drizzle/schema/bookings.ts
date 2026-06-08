import {
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { guides } from "./guides";

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingRef: text("booking_ref").notNull().unique(),
  guideId: uuid("guide_id")
    .notNull()
    .references(() => guides.id, { onDelete: "restrict" }),
  visitorName: text("visitor_name").notNull(),
  visitorEmail: text("visitor_email").notNull(),
  visitorPhone: text("visitor_phone"),
  visitorCountry: text("visitor_country").notNull(),
  tourDate: date("tour_date").notNull(),
  tourDuration: text("tour_duration").notNull(),
  groupSize: integer("group_size").notNull(),
  specialRequests: text("special_requests"),
  status: text("status").default("Pending").notNull(),
  statusNote: text("status_note"),
  notifiedAt: timestamp("notified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedBy: text("updated_by").references(() => user.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
