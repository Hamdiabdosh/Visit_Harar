import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id),
  userName: text("user_name"),
  userEmail: text("user_email"),
  module: text("module").notNull(),
  action: text("action").notNull(),
  recordId: text("record_id"),
  recordTitle: text("record_title"),
  before: jsonb("before"),
  after: jsonb("after"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
