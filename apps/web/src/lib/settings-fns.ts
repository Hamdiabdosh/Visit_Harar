import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { db } from "../../../../db/index";
import { siteSettings, user } from "../../../../drizzle/schema/index";
import { auth } from "@/lib/auth.server";
import { createError, isAppError } from "@/lib/errors";
import { DB_SETUP_HINT, isDbUnavailableError } from "@/lib/db-errors";
import {
  getMaintenanceMode,
  invalidateSettingsCache,
  upsertSettingsCacheAfterUpdate,
} from "@/lib/settings";
import { invalidateChatKnowledgeCache } from "@/lib/chat/knowledge-cache";
import { settingsInputSchema } from "@/lib/validators/settings";
import type { UserRole } from "@/lib/types";
import { auditSnap, fireAudit } from "@/lib/audit";

export type SiteSettingsDto = {
  id: string;
  site_name: string | null;
  site_tagline: string | null;
  default_og_image: string | null;
  maintenance_mode: boolean;
  booking_enabled: boolean;
  event_rsvp_enabled: boolean;
  pwa_install_enabled: boolean;
  app_promo_enabled: boolean;
  bureau_email: string | null;
  analytics_id: string | null;
  chat_knowledge_extra: string | null;
  updated_by: string | null;
  updated_at: Date;
  updated_by_name?: string | null;
};

async function requireSuperadminSession() {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user)
    throw createError("UNAUTHORIZED", "Authentication required");
  const role = (session.user as { role?: string }).role as UserRole;
  const isActive = (session.user as { isActive?: boolean }).isActive ?? true;
  if (!isActive) throw createError("FORBIDDEN", "Account is disabled");
  if (role !== "superadmin") {
    throw createError("FORBIDDEN", "Superadmin access required");
  }
  return { id: session.user.id, name: session.user.name };
}

function rowToDto(
  row: typeof siteSettings.$inferSelect,
  updatedByName?: string | null,
): SiteSettingsDto {
  return {
    id: row.id,
    site_name: row.siteName ?? null,
    site_tagline: row.siteTagline ?? null,
    default_og_image: row.defaultOgImage ?? null,
    maintenance_mode: row.maintenanceMode,
    booking_enabled: row.bookingEnabled,
    event_rsvp_enabled: row.eventRsvpEnabled,
    pwa_install_enabled: row.pwaInstallEnabled,
    app_promo_enabled: row.appPromoEnabled,
    bureau_email: row.bureauEmail ?? null,
    analytics_id: row.analyticsId ?? null,
    chat_knowledge_extra: row.chatKnowledgeExtra ?? null,
    updated_by: row.updatedBy ?? null,
    updated_at: row.updatedAt,
    updated_by_name: updatedByName ?? null,
  };
}

async function fetchSettingsRow(): Promise<SiteSettingsDto | null> {
  const [row] = await db.select().from(siteSettings).limit(1);
  if (!row) return null;

  let updatedByName: string | null = null;
  if (row.updatedBy) {
    const [u] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, row.updatedBy))
      .limit(1);
    updatedByName = u?.name ?? null;
  }
  return rowToDto(row, updatedByName);
}

export const getAnalyticsIdFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<string | null> => {
    try {
      const [row] = await db.select().from(siteSettings).limit(1);
      return row?.analyticsId ?? null;
    } catch {
      return null;
    }
  },
);

export const getMaintenanceModeFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<boolean> => {
    try {
      return await getMaintenanceMode();
    } catch (err) {
      if (isDbUnavailableError(err)) return false;
      return false;
    }
  },
);

export const getSiteSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteSettingsDto | null> => {
    try {
      await requireSuperadminSession();
      return await fetchSettingsRow();
    } catch (err) {
      if (isDbUnavailableError(err)) return null;
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load settings",
      );
    }
  },
);

export const updateSiteSettings = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => settingsInputSchema.parse(raw))
  .handler(async ({ data }): Promise<SiteSettingsDto> => {
    try {
      const admin = await requireSuperadminSession();
      const [existing] = await db.select().from(siteSettings).limit(1);

      const values = {
        siteName: data.site_name ?? existing?.siteName ?? "Visit Harar",
        siteTagline: data.site_tagline ?? existing?.siteTagline ?? null,
        defaultOgImage:
          data.default_og_image === ""
            ? null
            : (data.default_og_image ?? existing?.defaultOgImage ?? null),
        maintenanceMode:
          data.maintenance_mode ?? existing?.maintenanceMode ?? false,
        bookingEnabled:
          data.booking_enabled ?? existing?.bookingEnabled ?? false,
        eventRsvpEnabled:
          data.event_rsvp_enabled ?? existing?.eventRsvpEnabled ?? false,
        pwaInstallEnabled:
          data.pwa_install_enabled ?? existing?.pwaInstallEnabled ?? false,
        appPromoEnabled:
          data.app_promo_enabled ?? existing?.appPromoEnabled ?? false,
        bureauEmail:
          data.bureau_email === ""
            ? null
            : (data.bureau_email ?? existing?.bureauEmail ?? null),
        analyticsId: data.analytics_id ?? existing?.analyticsId ?? null,
        chatKnowledgeExtra:
          data.chat_knowledge_extra === ""
            ? null
            : (data.chat_knowledge_extra ??
              existing?.chatKnowledgeExtra ??
              null),
        updatedBy: admin.id,
        updatedAt: new Date(),
      };

      let row: typeof siteSettings.$inferSelect;
      if (existing) {
        [row] = await db
          .update(siteSettings)
          .set(values)
          .where(eq(siteSettings.id, existing.id))
          .returning();
      } else {
        [row] = await db.insert(siteSettings).values(values).returning();
      }

      invalidateSettingsCache();
      invalidateChatKnowledgeCache();
      await upsertSettingsCacheAfterUpdate();

      fireAudit({
        userId: admin.id,
        module: "settings",
        action: existing ? "update" : "create",
        recordId: row!.id,
        recordTitle: "Site settings",
        before: existing ? auditSnap(existing) : null,
        after: auditSnap(row!),
      });

      return rowToDto(row!, admin.name);
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to save settings",
      );
    }
  });
