import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { heroContent } from "../drizzle/schema/index";
import { defaultHeroInput, inputToRowValues } from "../src/lib/hero-map";

export async function seedHero() {
  const input = { ...defaultHeroInput, is_published: true };
  const existing = await db.select().from(heroContent).limit(1);

  if (existing.length > 0) {
    const row = existing[0]!;
    if (!row.isPublished) {
      await db
        .update(heroContent)
        .set({
          ...inputToRowValues(input, row.updatedBy ?? "seed"),
          isPublished: true,
          updatedAt: new Date(),
        })
        .where(eq(heroContent.id, row.id));
      console.log("✓ Hero content published");
    } else {
      console.log("✓ Hero content already exists");
    }
    return;
  }

  await db.insert(heroContent).values({
    ...inputToRowValues(input, "seed"),
    isPublished: true,
  });
  console.log("✓ Hero content seeded");
}
