import { eq } from "drizzle-orm";
import { db } from "../../db/index";
import { siteSettings } from "../../drizzle/schema/index";
import { invalidateChatKnowledgeCache } from "@/lib/chat/knowledge-cache";

const CACHE_TTL_MS = 60_000;

let cached: {
  maintenanceMode: boolean;
  bookingEnabled: boolean;
  fetchedAt: number;
} | null = null;

async function loadSettings() {
  const [row] = await db.select().from(siteSettings).limit(1);
  return {
    maintenanceMode: row?.maintenanceMode ?? false,
    bookingEnabled: row?.bookingEnabled ?? true,
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

export function invalidateSettingsCache() {
  cached = null;
  invalidateChatKnowledgeCache();
}

export async function upsertSettingsCacheAfterUpdate() {
  invalidateSettingsCache();
  await getCached();
}
