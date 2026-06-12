import { createServerFn } from "@tanstack/react-start";
import { db } from "../../db/index";
import { contactInfo, siteSettings } from "../../drizzle/schema/index";
import { createError, isAppError } from "@/lib/errors";
import { sendInquiryEmail } from "@/lib/email";
import { inquirySchema } from "@/lib/validators/inquiry";

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
