import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index";
import {
  contactInfo,
  inquiries,
  siteSettings,
} from "../../drizzle/schema/index";
import { auth } from "@/lib/auth.server";
import { createError, isAppError } from "@/lib/errors";
import { sendInquiryEmail } from "@/lib/email";
import { inquirySchema } from "@/lib/validators/inquiry";
import type { UserRole } from "@/lib/types";

async function requireEditorSession() {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user)
    throw createError("UNAUTHORIZED", "Authentication required");
  const role = (session.user as { role?: string }).role as UserRole;
  const isActive = (session.user as { isActive?: boolean }).isActive ?? true;
  if (!isActive) throw createError("FORBIDDEN", "Account is disabled");
  if (role !== "superadmin" && role !== "editor") {
    throw createError("FORBIDDEN", "Insufficient permissions");
  }
  return { id: session.user.id };
}

async function resolveInquiryRecipient(): Promise<string | null> {
  const [settings] = await db.select().from(siteSettings).limit(1);
  if (settings?.bureauEmail) return settings.bureauEmail;

  const [contact] = await db.select().from(contactInfo).limit(1);
  return (
    contact?.emailGeneral ??
    contact?.emailBookings ??
    process.env.SUPERADMIN_EMAIL ??
    null
  );
}

export type InquiryDto = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: Date;
};

function rowToDto(row: typeof inquiries.$inferSelect): InquiryDto {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    is_read: row.isRead,
    created_at: row.createdAt,
  };
}

export const submitInquiry = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => inquirySchema.parse(raw))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    try {
      const to = await resolveInquiryRecipient();
      if (!to) {
        throw createError(
          "INTERNAL",
          "No commission email configured to receive inquiries.",
        );
      }

      const [row] = await db
        .insert(inquiries)
        .values({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
        })
        .returning();

      await sendInquiryEmail({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        to,
      });

      return { ok: true };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to send inquiry",
      );
    }
  });

const listFiltersSchema = z
  .object({
    unreadOnly: z.boolean().optional(),
    page: z.number().int().min(1).default(1),
    perPage: z.number().int().min(1).max(100).default(20),
  })
  .optional();

export const getInquiries = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => listFiltersSchema.parse(raw))
  .handler(
    async ({
      data: filters,
    }): Promise<{
      items: InquiryDto[];
      total: number;
      page: number;
      perPage: number;
    }> => {
      try {
        await requireEditorSession();
        const page = filters?.page ?? 1;
        const perPage = filters?.perPage ?? 20;
        const where = filters?.unreadOnly
          ? eq(inquiries.isRead, false)
          : undefined;

        const [{ total }] = await db
          .select({ total: count(inquiries.id) })
          .from(inquiries)
          .where(where);

        const rows = await db
          .select()
          .from(inquiries)
          .where(where)
          .orderBy(desc(inquiries.createdAt))
          .limit(perPage)
          .offset((page - 1) * perPage);

        return {
          items: rows.map(rowToDto),
          total: Number(total ?? 0),
          page,
          perPage,
        };
      } catch (err) {
        if (isAppError(err)) throw err;
        throw createError(
          "INTERNAL",
          err instanceof Error ? err.message : "Failed to list inquiries",
        );
      }
    },
  );

export const getInquiryById = createServerFn({ method: "GET" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<InquiryDto | null> => {
    try {
      await requireEditorSession();
      const row = await db.query.inquiries.findFirst({
        where: eq(inquiries.id, id),
      });
      return row ? rowToDto(row) : null;
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load inquiry",
      );
    }
  });

export const getUnreadInquiriesCount = createServerFn({
  method: "GET",
}).handler(async (): Promise<number> => {
  try {
    await requireEditorSession();
    const [row] = await db
      .select({ n: count() })
      .from(inquiries)
      .where(eq(inquiries.isRead, false));
    return Number(row?.n ?? 0);
  } catch (err) {
    if (isAppError(err)) throw err;
    return 0;
  }
});

export const markInquiryRead = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const schema = z.object({
      id: z.string().uuid(),
      is_read: z.boolean(),
    });
    return schema.parse(raw);
  })
  .handler(async ({ data }): Promise<InquiryDto> => {
    try {
      await requireEditorSession();
      const existing = await db.query.inquiries.findFirst({
        where: eq(inquiries.id, data.id),
      });
      if (!existing) throw createError("NOT_FOUND", "Inquiry not found");

      const [updated] = await db
        .update(inquiries)
        .set({ isRead: data.is_read })
        .where(eq(inquiries.id, data.id))
        .returning();

      return rowToDto(updated!);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to update inquiry",
      );
    }
  });
