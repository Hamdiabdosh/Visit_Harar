import {
  boolean,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/** Expo push tokens for the native mobile app. */
export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    expoPushToken: text("expo_push_token").notNull(),
    visitorEmail: text("visitor_email"),
    notifyBookings: boolean("notify_bookings").default(true).notNull(),
    notifyEvents: boolean("notify_events").default(true).notNull(),
    platform: text("platform"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    tokenIdx: uniqueIndex("push_subscriptions_token_idx").on(
      table.expoPushToken,
    ),
  }),
);
