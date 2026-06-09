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

export async function seedAttractions() {
  let order = 0;
  for (const row of attractionSeeds) {
    const existing = await db.query.attractions.findFirst({
      where: eq(attractions.slug, row.id),
    });
    const values = {
      title: row.title,
      slug: row.id,
      shortDesc: row.short,
      fullDesc: row.full.join("\n\n"),
      category: row.category,
      isFeatured: FEATURED_SLUGS.has(row.id),
      isPublished: row.published,
      sortOrder: order++,
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
