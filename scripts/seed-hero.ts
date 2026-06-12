import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { heroContent, user } from "../drizzle/schema/index";
import { defaultHeroInput, inputToRowValues } from "../src/lib/hero-map";

async function seedUserId(): Promise<string | null> {
  const email = process.env.SUPERADMIN_EMAIL;
  if (email) {
    const admin = await db.query.user.findFirst({ where: eq(user.email, email) });
    if (admin) return admin.id;
  }
  const first = await db.query.user.findFirst();
  return first?.id ?? null;
}

export async function seedHero() {
  const input = { ...defaultHeroInput, is_published: true };
  const existing = await db.select().from(heroContent).limit(1);
  const seedAuthorId = await seedUserId();

  if (existing.length > 0) {
    const row = existing[0]!;
    if (!row.isPublished) {
      const authorId = row.updatedBy ?? seedAuthorId;
      const { updatedBy: _, ...values } = inputToRowValues(
        input,
        authorId ?? "seed",
      );
      await db
        .update(heroContent)
        .set({
          ...values,
          updatedBy: authorId,
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

  const { updatedBy: _, ...values } = inputToRowValues(
    input,
    seedAuthorId ?? "seed",
  );
  await db.insert(heroContent).values({
    ...values,
    updatedBy: seedAuthorId,
    isPublished: true,
  });
  console.log("✓ Hero content seeded");
}
