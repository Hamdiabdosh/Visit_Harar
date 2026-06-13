import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { asc, eq } from "drizzle-orm";
import { db } from "../db/index";
import {
  attractions,
  galleryAlbums,
  galleryItems,
  guides,
  heroContent,
  mediaAssets,
} from "../drizzle/schema/index";
import { uploadImageBuffer } from "../apps/web/src/lib/storage.server";

const LEGACY_ROOT = path.resolve(
  import.meta.dirname,
  "../../Harar The Living Musiuem 1/assets/images",
);

type UploadResult = { url: string; publicId: string; filename: string };

async function uploadLocalFile(
  relativePath: string,
  folder: string,
): Promise<UploadResult | null> {
  const full = path.join(LEGACY_ROOT, relativePath);
  if (!fs.existsSync(full)) return null;
  const buffer = fs.readFileSync(full);
  const filename = path.basename(full);
  const { url, publicId } = await uploadImageBuffer(buffer, filename, folder);
  return { url, publicId, filename };
}

async function registerAsset(
  uploaded: UploadResult,
  usedIn: string,
  sizeBytes: number,
) {
  const existing = await db.query.mediaAssets.findFirst({
    where: eq(mediaAssets.cloudinaryId, uploaded.publicId),
  });
  if (existing) {
    const used = existing.usedIn ?? [];
    if (!used.includes(usedIn)) {
      await db
        .update(mediaAssets)
        .set({ usedIn: [...used, usedIn] })
        .where(eq(mediaAssets.id, existing.id));
    }
    return existing.url;
  }
  await db.insert(mediaAssets).values({
    cloudinaryId: uploaded.publicId,
    url: uploaded.url,
    thumbnailUrl: uploaded.thumbnailUrl ?? null,
    filename: uploaded.filename,
    type: "image",
    sizeBytes,
    usedIn: [usedIn],
    uploadedBy: null,
  });
  return uploaded.url;
}

const ATTRACTION_IMAGES: Record<string, string> = {
  "harar-jugol": "gallery/city of peace.jpg",
  "hyena-men": "gallery/chelenqo.jpg",
  "mosques-shrines": "gallery/aw abadir.png",
  "coffee-ceremony": "foods/Coffee.jpg",
  "harar-museum": "from what's app/manuscript musiuem.jpg",
};

const GUIDE_IMAGES: Record<string, string> = {
  "ahmed-yusuf": "from what's app/photo_1_2025-03-18_05-01-17.jpg",
  "fatima-hassan": "from what's app/photo_12_2025-03-18_05-01-17.jpg",
  "ibrahim-ali": "from what's app/photo_18_2025-03-18_05-01-17.jpg",
};

const GALLERY_FILES = [
  "gallery/city of peace.jpg",
  "gallery/city of peace 2.jpg",
  "gallery/andegna menged.jpg",
  "gallery/asmeadin beri.jpg",
  "gallery/chelenqo.jpg",
  "gallery/cultural houce.jpg",
  "gallery/Ada gar.jpg",
  "gallery/bedri beri old.jpg",
  "festivals/shewal eid.jpg",
  "foods/sirri1.jpg",
];

export async function seedMediaImages() {
  if (!fs.existsSync(LEGACY_ROOT)) {
    console.log(
      "⊘ Legacy image folder not found — upload photos via /admin/media instead",
    );
    return;
  }

  // Hero background
  const heroUpload = await uploadLocalFile(
    "gallery/city of peace 2.jpg",
    "visit-harar/seed/hero",
  );
  if (heroUpload) {
    const url = await registerAsset(
      heroUpload,
      "hero",
      fs.statSync(path.join(LEGACY_ROOT, "gallery/city of peace 2.jpg")).size,
    );
    const [hero] = await db.select().from(heroContent).limit(1);
    if (hero) {
      await db
        .update(heroContent)
        .set({ backgroundImage: url, updatedAt: new Date() })
        .where(eq(heroContent.id, hero.id));
    }
    console.log("✓ Hero background uploaded to local storage");
  }

  // Attractions
  for (const [slug, rel] of Object.entries(ATTRACTION_IMAGES)) {
    const uploaded = await uploadLocalFile(rel, `visit-harar/seed/attractions`);
    if (!uploaded) continue;
    const url = await registerAsset(
      uploaded,
      "attractions",
      fs.statSync(path.join(LEGACY_ROOT, rel)).size,
    );
    await db
      .update(attractions)
      .set({ image: url, updatedAt: new Date() })
      .where(eq(attractions.slug, slug));
  }
  console.log("✓ Attraction images uploaded to local storage");

  // Guides
  for (const [slug, rel] of Object.entries(GUIDE_IMAGES)) {
    const uploaded = await uploadLocalFile(rel, `visit-harar/seed/guides`);
    if (!uploaded) continue;
    const url = await registerAsset(
      uploaded,
      "guides",
      fs.statSync(path.join(LEGACY_ROOT, rel)).size,
    );
    await db
      .update(guides)
      .set({ photo: url, updatedAt: new Date() })
      .where(eq(guides.slug, slug));
  }
  console.log("✓ Guide photos uploaded to local storage");

  // Gallery album items — distribute across all published albums
  const albums = await db
    .select()
    .from(galleryAlbums)
    .orderBy(asc(galleryAlbums.sortOrder));
  if (albums.length > 0) {
    const orderByAlbum = new Map<string, number>();
    const coverSet = new Set<string>();
    let totalItems = 0;

    for (let i = 0; i < GALLERY_FILES.length; i++) {
      const album = albums[i % albums.length]!;
      const rel = GALLERY_FILES[i]!;
      const uploaded = await uploadLocalFile(rel, "visit-harar/seed/gallery");
      if (!uploaded) continue;

      const url = await registerAsset(
        uploaded,
        "gallery",
        fs.statSync(path.join(LEGACY_ROOT, rel)).size,
      );

      const dup = await db.query.galleryItems.findFirst({
        where: eq(galleryItems.url, url),
      });
      if (dup) continue;

      const sortOrder = orderByAlbum.get(album.id) ?? 0;
      await db.insert(galleryItems).values({
        albumId: album.id,
        type: "image",
        url,
        caption: uploaded.filename,
        isPublished: true,
        sortOrder,
      });
      orderByAlbum.set(album.id, sortOrder + 1);
      totalItems++;

      if (!coverSet.has(album.id)) {
        await db
          .update(galleryAlbums)
          .set({ coverImage: url, updatedAt: new Date() })
          .where(eq(galleryAlbums.id, album.id));
        coverSet.add(album.id);
      }
    }
    console.log(
      `✓ Gallery items uploaded to local storage (${totalItems} items across ${albums.length} albums)`,
    );
  }
}

/** @deprecated Use seedMediaImages */
export const seedCloudinaryImages = seedMediaImages;
