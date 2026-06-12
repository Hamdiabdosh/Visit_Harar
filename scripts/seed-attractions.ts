import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { attractions } from "../drizzle/schema/index";
import { attractions as attractionSeeds } from "../src/lib/harar-data";

const FEATURED_SLUGS = new Set([
  "harar-jugol",
  "hyena-men",
  "mosques-shrines",
  "coffee-ceremony",
  "harar-museum",
]);

/** Approximate coordinates within Harar Jugol and surroundings. */
const ATTRACTION_COORDS: Record<string, { latitude: string; longitude: string }> =
  {
    "harar-jugol": { latitude: "9.3133", longitude: "42.1261" },
    "hyena-men": { latitude: "9.3085", longitude: "42.1315" },
    "mosques-shrines": { latitude: "9.3145", longitude: "42.1248" },
    "coffee-ceremony": { latitude: "9.3128", longitude: "42.1272" },
    markets: { latitude: "9.3155", longitude: "42.1285" },
    "harar-museum": { latitude: "9.3112", longitude: "42.1238" },
  };

export async function seedAttractions() {
  let order = 0;
  for (const row of attractionSeeds) {
    const existing = await db.query.attractions.findFirst({
      where: eq(attractions.slug, row.id),
    });
    const coords = ATTRACTION_COORDS[row.id];
    const values = {
      title: row.title,
      slug: row.id,
      shortDesc: row.short,
      fullDesc: row.full.join("\n\n"),
      category: row.category,
      isFeatured: FEATURED_SLUGS.has(row.id),
      isPublished: row.published,
      sortOrder: order++,
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
      updatedAt: new Date(),
    };

    if (existing) {
      await db
        .update(attractions)
        .set(values)
        .where(eq(attractions.slug, row.id));
    } else {
      await db.insert(attractions).values({ ...values, image: null });
    }
  }
  console.log(`✓ Attractions seeded (${attractionSeeds.length} items)`);
}
