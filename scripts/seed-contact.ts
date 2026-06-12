import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { contactInfo } from "../drizzle/schema/index";

const CONTACT_SEED = {
  officeName: "Harari Tourism Commission",
  addressLine1: "Harar Jugol, Near Shoa Gate",
  addressLine2: "Harari Regional State",
  country: "Ethiopia",
  phonePrimary: "+251 25 666 1234",
  phoneSecondary: "+251 91 234 5678",
  emailGeneral: "info@visitharar.gov.et",
  emailBookings: "bookings@visitharar.gov.et",
  workingHours: [
    { day: "Monday – Friday", hours: "8:30 AM – 5:30 PM" },
    { day: "Saturday", hours: "9:00 AM – 1:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ],
  mapLat: "9.3133",
  mapLng: "42.1261",
  facebookUrl: "https://facebook.com/visitharar",
  twitterUrl: "https://twitter.com/visitharar",
  instagramUrl: "https://instagram.com/visitharar",
  isPublished: true,
};

export async function seedContact() {
  const existing = await db.select().from(contactInfo).limit(1);
  if (existing.length > 0) {
    const row = existing[0]!;
    if (!row.isPublished || !row.emailGeneral) {
      await db
        .update(contactInfo)
        .set({
          ...CONTACT_SEED,
          updatedAt: new Date(),
        })
        .where(eq(contactInfo.id, row.id));
      console.log("✓ Contact info updated with seed defaults");
      return;
    }
    console.log("✓ Contact info already exists");
    return;
  }

  await db.insert(contactInfo).values(CONTACT_SEED);
  console.log("✓ Contact info seeded");
}
