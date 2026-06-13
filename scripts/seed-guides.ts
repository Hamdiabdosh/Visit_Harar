import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { guides } from "../drizzle/schema/index";
import { guides as guideSeeds } from "../apps/web/src/lib/harar-data";

export async function seedGuides() {
  let order = 0;
  for (const g of guideSeeds.filter((x) => x.published)) {
    const existing = await db.query.guides.findFirst({
      where: eq(guides.slug, g.id),
    });
    const values = {
      name: g.name,
      slug: g.id,
      bio: g.bio,
      languages: g.languages,
      specialties: g.specialties,
      experienceYears: g.years,
      licenseNumber: g.license,
      phone: g.phone,
      email: g.email,
      isAvailable: g.available,
      isPublished: true,
      sortOrder: order++,
      updatedAt: new Date(),
    };

    if (existing) {
      await db.update(guides).set(values).where(eq(guides.slug, g.id));
    } else {
      await db.insert(guides).values({ ...values, photo: null });
    }
  }
  console.log(
    `✓ Guides seeded (${guideSeeds.filter((x) => x.published).length} items)`,
  );
}
