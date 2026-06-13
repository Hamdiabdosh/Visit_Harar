import { eq } from "drizzle-orm";
import { db } from "../db/index";
import {
  galleryAlbums,
  galleryItems,
  mediaAssets,
} from "../drizzle/schema/index";
import { galleryAlbums as albumSeeds } from "../apps/web/src/lib/harar-data";

export async function seedGallery() {
  const albumIds: string[] = [];
  let order = 0;

  for (const seed of albumSeeds) {
    const existing = await db.query.galleryAlbums.findFirst({
      where: eq(galleryAlbums.title, seed.title),
    });

    const values = {
      title: seed.title,
      description: null as string | null,
      coverImage: null as string | null,
      isPublished: true,
      sortOrder: order++,
      updatedAt: new Date(),
    };

    if (existing) {
      await db
        .update(galleryAlbums)
        .set(values)
        .where(eq(galleryAlbums.id, existing.id));
      albumIds.push(existing.id);
    } else {
      const [row] = await db.insert(galleryAlbums).values(values).returning();
      albumIds.push(row!.id);
    }
  }

  const images = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.type, "image"))
    .limit(8);

  if (images.length === 0) {
    console.log(
      `✓ Gallery albums seeded (${albumSeeds.length}); upload media via /admin/media then re-run seed for items`,
    );
    return;
  }

  const targetAlbumId = albumIds[0]!;
  const existingItems = await db
    .select()
    .from(galleryItems)
    .where(eq(galleryItems.albumId, targetAlbumId));

  if (existingItems.length >= 8) {
    console.log(`✓ Gallery already has ${existingItems.length} items`);
    return;
  }

  let itemOrder = existingItems.length;
  for (const img of images) {
    const dup = existingItems.find((i) => i.url === img.url);
    if (dup) continue;

    await db.insert(galleryItems).values({
      albumId: targetAlbumId,
      type: "image",
      url: img.url,
      thumbnailUrl: img.thumbnailUrl,
      caption: img.filename,
      altText: img.altText,
      isPublished: true,
      sortOrder: itemOrder++,
    });
  }

  const [firstItem] = await db
    .select()
    .from(galleryItems)
    .where(eq(galleryItems.albumId, targetAlbumId))
    .limit(1);

  if (firstItem) {
    await db
      .update(galleryAlbums)
      .set({ coverImage: firstItem.url })
      .where(eq(galleryAlbums.id, targetAlbumId));
  }

  console.log(
    `✓ Gallery seeded (${albumSeeds.length} albums, ${images.length} items in first album)`,
  );
}
