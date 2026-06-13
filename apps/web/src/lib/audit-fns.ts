import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../../db/index";
import { auditLogs } from "../../../../drizzle/schema/index";
import { auth } from "@/lib/auth.server";
import { createError, isAppError } from "@/lib/errors";
import type { UserRole } from "@/lib/types";

async function requireSuperadminSession() {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user)
    throw createError("UNAUTHORIZED", "Authentication required");
  const role = (session.user as { role?: string }).role as UserRole;
  if (role !== "superadmin") {
    throw createError("FORBIDDEN", "Superadmin access required");
  }
  return session.user;
}

export type AuditLogDto = {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  module: string;
  action: string;
  record_id: string | null;
  record_title: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  created_at: Date;
};

const filterSchema = z.object({
  user_id: z.string().optional(),
  module: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(100).default(50),
});

function rowToDto(row: typeof auditLogs.$inferSelect): AuditLogDto {
  return {
    id: row.id,
    user_id: row.userId ?? null,
    user_name: row.userName ?? null,
    user_email: row.userEmail ?? null,
    module: row.module,
    action: row.action,
    record_id: row.recordId ?? null,
    record_title: row.recordTitle ?? null,
    before: (row.before as Record<string, unknown> | null) ?? null,
    after: (row.after as Record<string, unknown> | null) ?? null,
    created_at: row.createdAt,
  };
}

export const getAuditLogs = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => filterSchema.parse(raw ?? {}))
  .handler(async ({ data }) => {
    try {
      await requireSuperadminSession();
      const conditions = [];
      if (data.user_id) conditions.push(eq(auditLogs.userId, data.user_id));
      if (data.module) conditions.push(eq(auditLogs.module, data.module));
      if (data.date_from)
        conditions.push(gte(auditLogs.createdAt, new Date(data.date_from)));
      if (data.date_to) {
        const end = new Date(data.date_to);
        end.setHours(23, 59, 59, 999);
        conditions.push(lte(auditLogs.createdAt, end));
      }
      const where = conditions.length ? and(...conditions) : undefined;
      const offset = (data.page - 1) * data.perPage;

      const [rows, [{ total }]] = await Promise.all([
        db
          .select()
          .from(auditLogs)
          .where(where)
          .orderBy(desc(auditLogs.createdAt))
          .limit(data.perPage)
          .offset(offset),
        db.select({ total: count() }).from(auditLogs).where(where),
      ]);

      return {
        items: rows.map(rowToDto),
        total: Number(total),
        page: data.page,
        perPage: data.perPage,
      };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load audit logs",
      );
    }
  });

export const getSystemHealth = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      await requireSuperadminSession();
      let dbOk = false;
      try {
        await db.execute(sql`SELECT 1`);
        dbOk = true;
      } catch {
        dbOk = false;
      }
      const storageOk = (await import("@/lib/storage.server")).isStorageWritable();
      const { getResendConfig } = await import("@/lib/env.server");
      const emailOk = getResendConfig() !== null;
      const { getMaintenanceMode } = await import("@/lib/settings");
      const maintenanceMode = await getMaintenanceMode();
      return {
        database: dbOk ? "Connected" : "Error",
        storage: storageOk ? "Writable" : "Not writable",
        email: emailOk ? "Configured" : "Not configured",
        maintenance_mode: maintenanceMode,
      };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Health check failed",
      );
    }
  },
);
