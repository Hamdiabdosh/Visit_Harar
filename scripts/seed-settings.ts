import { db } from "../db/index";
import { siteSettings } from "../drizzle/schema/index";

export async function seedSettings() {
  const existing = await db.select().from(siteSettings).limit(1);
  if (existing.length > 0) {
    console.log("✓ Site settings already exist");
    return;
  }
  await db.insert(siteSettings).values({
    siteName: "Visit Harar",
    siteTagline: "Official Tourism Website of the Harari Regional State",
    maintenanceMode: false,
    bookingEnabled: false,
    eventRsvpEnabled: false,
    pwaInstallEnabled: false,
    appPromoEnabled: false,
  });
  console.log("✓ Site settings seeded");
}
