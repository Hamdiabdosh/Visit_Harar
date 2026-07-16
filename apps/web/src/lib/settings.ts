import { eq } from "drizzle-orm";
import { db } from "../../../../db/index";
import { siteSettings } from "../../../../drizzle/schema/index";
import { invalidateChatKnowledgeCache } from "@/lib/chat/knowledge-cache";

const CACHE_TTL_MS = 60_000;

export type PublicSurfaces = {
  bookingEnabled: boolean;
  eventRsvpEnabled: boolean;
  pwaInstallEnabled: boolean;
  appPromoEnabled: boolean;
};

let cached: {
  maintenanceMode: boolean;
  bookingEnabled: boolean;
  eventRsvpEnabled: boolean;
  pwaInstallEnabled: boolean;
  appPromoEnabled: boolean;
  fetchedAt: number;
} | null = null;

async function loadSettings() {
  const [row] = await db.select().from(siteSettings).limit(1);
  return {
    maintenanceMode: row?.maintenanceMode ?? false,
    bookingEnabled: row?.bookingEnabled ?? false,
    eventRsvpEnabled: row?.eventRsvpEnabled ?? false,
    pwaInstallEnabled: row?.pwaInstallEnabled ?? false,
    appPromoEnabled: row?.appPromoEnabled ?? false,
  };
}

async function getCached() {
  const now = Date.now();
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached;
  }
  const settings = await loadSettings();
  cached = { ...settings, fetchedAt: now };
  return cached;
}

export async function getMaintenanceMode(): Promise<boolean> {
  return (await getCached()).maintenanceMode;
}

export async function getBookingEnabled(): Promise<boolean> {
  return (await getCached()).bookingEnabled;
}

export async function getEventRsvpEnabled(): Promise<boolean> {
  return (await getCached()).eventRsvpEnabled;
}

export async function getPwaInstallEnabled(): Promise<boolean> {
  return (await getCached()).pwaInstallEnabled;
}

export async function getAppPromoEnabled(): Promise<boolean> {
  return (await getCached()).appPromoEnabled;
}

export async function getPublicSurfaces(): Promise<PublicSurfaces> {
  const s = await getCached();
  return {
    bookingEnabled: s.bookingEnabled,
    eventRsvpEnabled: s.eventRsvpEnabled,
    pwaInstallEnabled: s.pwaInstallEnabled,
    appPromoEnabled: s.appPromoEnabled,
  };
}

export function invalidateSettingsCache() {
  cached = null;
  invalidateChatKnowledgeCache();
}

export async function upsertSettingsCacheAfterUpdate() {
  invalidateSettingsCache();
  await getCached();
}
