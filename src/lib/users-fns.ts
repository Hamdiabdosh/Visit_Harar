import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { desc, eq, max } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index";
import { account, session, user } from "../../drizzle/schema/index";
import { auth } from "@/lib/auth.server";
import { createError, isAppError } from "@/lib/errors";
import { sendWelcomeEmail } from "@/lib/email";
import type { UserRole } from "@/lib/types";
import { auditSnap, fireAudit } from "@/lib/audit";

async function requireSuperadminSession() {
  const request = getRequest();
  const sess = await auth.api.getSession({ headers: request.headers });
  if (!sess?.user) throw createError("UNAUTHORIZED", "Authentication required");
  const role = (sess.user as { role?: string }).role as UserRole;
  if (role !== "superadmin") {
    throw createError("FORBIDDEN", "Superadmin access required");
  }
  return sess.user;
}

export type UserDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  last_login: Date | null;
  created_at: Date;
};

async function lastLoginFor(userId: string): Promise<Date | null> {
  const [row] = await db
    .select({ last: max(session.updatedAt) })
    .from(session)
    .where(eq(session.userId, userId));
  return row?.last ?? null;
}

function rowToDto(
  row: typeof user.$inferSelect,
  lastLogin: Date | null,
): UserDto {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as UserRole,
    is_active: row.isActive,
    last_login: lastLogin,
    created_at: row.createdAt,
  };
}

export const getUsers = createServerFn({ method: "GET" }).handler(async () => {
  try {
    await requireSuperadminSession();
    const rows = await db.select().from(user).orderBy(desc(user.createdAt));
    const result: UserDto[] = [];
    for (const row of rows) {
      result.push(rowToDto(row, await lastLoginFor(row.id)));
    }
    return result;
  } catch (err) {
    if (isAppError(err)) throw err;
    throw createError(
      "INTERNAL",
      err instanceof Error ? err.message : "Failed to list users",
    );
  }
});

const createEditorSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const createEditorAccount = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => createEditorSchema.parse(raw))
  .handler(async ({ data }) => {
    try {
      const admin = await requireSuperadminSession();
      const existing = await db.query.user.findFirst({
        where: eq(user.email, data.email),
      });
      if (existing) throw createError("CONFLICT", "Email already in use");

      const ctx = await auth.$context;
      const userId = ctx.generateId({ model: "user" });
      const accountId = ctx.generateId({ model: "account" });
      const hashed = await ctx.password.hash(data.password);

      const [row] = await db
        .insert(user)
        .values({
          id: userId,
          name: data.name,
          email: data.email,
          emailVerified: false,
          role: "editor",
          isActive: true,
        })
        .returning();

      await db.insert(account).values({
        id: accountId,
        accountId: userId,
        providerId: "credential",
        userId,
        password: hashed,
      });

      void sendWelcomeEmail({
        name: data.name,
        email: data.email,
        tempPassword: data.password,
      });

      fireAudit({
        userId: admin.id,
        module: "users",
        action: "create",
        recordId: row!.id,
        recordTitle: row!.email,
        after: auditSnap({
          id: row!.id,
          name: row!.name,
          email: row!.email,
          role: row!.role,
          isActive: row!.isActive,
        }),
      });

      return rowToDto(row!, null);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to create user",
      );
    }
  });

const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().optional(),
});

export const updateUser = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => updateUserSchema.parse(raw))
  .handler(async ({ data }) => {
    try {
      const admin = await requireSuperadminSession();
      const existing = await db.query.user.findFirst({
        where: eq(user.id, data.id),
      });
      if (!existing) throw createError("NOT_FOUND", "User not found");
      if (existing.role === "superadmin") {
        throw createError("FORBIDDEN", "Cannot edit superadmin via UI");
      }
      const [row] = await db
        .update(user)
        .set({
          name: data.name ?? existing.name,
          email: data.email ?? existing.email,
          updatedAt: new Date(),
        })
        .where(eq(user.id, data.id))
        .returning();
      fireAudit({
        userId: admin.id,
        module: "users",
        action: "update",
        recordId: data.id,
        recordTitle: row!.email,
        before: auditSnap({
          id: existing.id,
          name: existing.name,
          email: existing.email,
          role: existing.role,
          isActive: existing.isActive,
        }),
        after: auditSnap({
          id: row!.id,
          name: row!.name,
          email: row!.email,
          role: row!.role,
          isActive: row!.isActive,
        }),
      });
      return rowToDto(row!, await lastLoginFor(data.id));
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to update user",
      );
    }
  });

export const toggleUserActive = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z.object({ id: z.string(), active: z.boolean() }).parse(raw),
  )
  .handler(async ({ data }) => {
    try {
      const current = await requireSuperadminSession();
      if (current.id === data.id) {
        throw createError("FORBIDDEN", "Cannot deactivate your own account");
      }
      const existing = await db.query.user.findFirst({
        where: eq(user.id, data.id),
      });
      if (!existing) throw createError("NOT_FOUND", "User not found");
      if (existing.role === "superadmin") {
        throw createError("FORBIDDEN", "Cannot deactivate superadmin");
      }
      const [row] = await db
        .update(user)
        .set({ isActive: data.active, updatedAt: new Date() })
        .where(eq(user.id, data.id))
        .returning();
      fireAudit({
        userId: current.id,
        module: "users",
        action: data.active ? "activate" : "deactivate",
        recordId: data.id,
        recordTitle: row!.email,
        before: { is_active: existing.isActive },
        after: { is_active: data.active },
      });
      return rowToDto(row!, await lastLoginFor(data.id));
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to toggle user",
      );
    }
  });

export const sendUserPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().parse(id))
  .handler(async ({ data: id }) => {
    try {
      const admin = await requireSuperadminSession();
      const existing = await db.query.user.findFirst({
        where: eq(user.id, id),
      });
      if (!existing) throw createError("NOT_FOUND", "User not found");

      const baseURL =
        process.env.BETTER_AUTH_URL ??
        process.env.APP_URL ??
        "http://localhost:8080";

      await auth.api.forgetPassword({
        body: {
          email: existing.email,
          redirectTo: `${baseURL}/admin/reset-password`,
        },
      });

      fireAudit({
        userId: admin.id,
        module: "users",
        action: "password_reset",
        recordId: id,
        recordTitle: existing.email,
      });

      return { ok: true as const };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to send reset",
      );
    }
  });
