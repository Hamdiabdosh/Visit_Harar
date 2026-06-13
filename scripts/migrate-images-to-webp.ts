import "dotenv/config";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../db/index";
import {
  announcements,
  attractions,
  galleryAlbums,
  galleryItems,
  guides,
  heroContent,
  mediaAssets,
  pages,
  partners,
} from "../drizzle/schema/index";
import { siteSettings } from "../drizzle/schema/settings";
import { thumbStorageKey } from "../apps/web/src/lib/image-processing.server";
import {
  ensureThumbForStorageKey,
  getPublicUrl,
  getUploadDir,
  migrateStorageImage,
  publicIdFromUrl,
  resolveStoragePath,
} from "../apps/web/src/lib/storage.server";

const IMAGE_EXT = /\.(jpe?g|png)$/i;
const SKIP_FILES = /-thumb\.webp$/i;

type UrlReplacement = {
  oldUrl: string;
  newUrl: string;
  thumbUrl: string | null;
  oldPublicId: string;
  newPublicId: string;
};

async function walkUploadDir(dir: string, base = ""): Promise<string[]> {
  const entries = await fsPromises.readdir(dir, { withFileTypes: true });
  const keys: string[] = [];
  for (const entry of entries) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      keys.push(...(await walkUploadDir(path.join(dir, entry.name), rel)));
      continue;
    }
    if (SKIP_FILES.test(entry.name)) continue;
    keys.push(rel);
  }
  return keys;
}

async function migrateFile(storageKey: string): Promise<UrlReplacement | null> {
  const ext = path.extname(storageKey).toLowerCase();
  const isWebp = ext === ".webp";

  if (isWebp) {
    const thumbPath = resolveStoragePath(thumbStorageKey(storageKey));
    if (thumbPath) {
      try {
        await fsPromises.access(thumbPath);
        return null;
      } catch {
        const thumbUrl = await ensureThumbForStorageKey(storageKey);
        if (!thumbUrl) return null;
        return {
          oldUrl: getPublicUrl(storageKey),
          newUrl: getPublicUrl(storageKey),
          thumbUrl,
          oldPublicId: storageKey,
          newPublicId: storageKey,
        };
      }
    }
  }

  if (!IMAGE_EXT.test(storageKey) && !isWebp) return null;

  const oldUrl = getPublicUrl(storageKey);
  const result = await migrateStorageImage(storageKey);
  if (!result) return null;

  return {
    oldUrl,
    newUrl: result.url,
    thumbUrl: result.thumbnailUrl ?? null,
    oldPublicId: storageKey,
    newPublicId: result.publicId,
  };
}

async function applyReplacement(replacement: UrlReplacement) {
  const { oldUrl, newUrl, thumbUrl, oldPublicId, newPublicId } = replacement;
  if (oldUrl === newUrl && !thumbUrl) return;

  await db
    .update(mediaAssets)
    .set({
      url: sql`CASE WHEN ${mediaAssets.url} = ${oldUrl} THEN ${newUrl} ELSE ${mediaAssets.url} END`,
      thumbnailUrl: sql`CASE WHEN ${mediaAssets.url} = ${oldUrl} OR ${mediaAssets.cloudinaryId} = ${oldPublicId} THEN ${thumbUrl} ELSE ${mediaAssets.thumbnailUrl} END`,
      cloudinaryId: sql`CASE WHEN ${mediaAssets.cloudinaryId} = ${oldPublicId} THEN ${newPublicId} ELSE ${mediaAssets.cloudinaryId} END`,
    })
    .where(
      or(
        eq(mediaAssets.url, oldUrl),
        eq(mediaAssets.cloudinaryId, oldPublicId),
      ),
    );

  await db
    .update(galleryItems)
    .set({
      url: newUrl,
      thumbnailUrl: thumbUrl,
    })
    .where(eq(galleryItems.url, oldUrl));

  await db
    .update(galleryAlbums)
    .set({ coverImage: newUrl, updatedAt: new Date() })
    .where(eq(galleryAlbums.coverImage, oldUrl));

  await db
    .update(attractions)
    .set({ image: newUrl, updatedAt: new Date() })
    .where(eq(attractions.image, oldUrl));

  await db
    .update(guides)
    .set({ photo: newUrl, updatedAt: new Date() })
    .where(eq(guides.photo, oldUrl));

  await db
    .update(heroContent)
    .set({ backgroundImage: newUrl, updatedAt: new Date() })
    .where(eq(heroContent.backgroundImage, oldUrl));

  await db
    .update(announcements)
    .set({ coverImage: newUrl, updatedAt: new Date() })
    .where(eq(announcements.coverImage, oldUrl));

  await db
    .update(pages)
    .set({ heroImage: newUrl, updatedAt: new Date() })
    .where(eq(pages.heroImage, oldUrl));

  await db
    .update(partners)
    .set({ image: newUrl, updatedAt: new Date() })
    .where(eq(partners.image, oldUrl));

  await db
    .update(siteSettings)
    .set({ defaultOgImage: newUrl, updatedAt: new Date() })
    .where(eq(siteSettings.defaultOgImage, oldUrl));

  await db.execute(sql`
    UPDATE pages
    SET content = REPLACE(content::text, ${oldUrl}, ${newUrl})::jsonb
    WHERE content::text LIKE ${"%" + oldUrl + "%"}
  `);
}

async function main() {
  const uploadDir = getUploadDir();
  if (!fs.existsSync(uploadDir)) {
    console.log("No upload directory found — nothing to migrate.");
    return;
  }

  const keys = await walkUploadDir(uploadDir);
  console.log(`Scanning ${keys.length} files in ${uploadDir}`);

  let migrated = 0;
  let thumbsAdded = 0;
  let skipped = 0;

  for (const key of keys) {
    const replacement = await migrateFile(key);
    if (!replacement) {
      skipped++;
      continue;
    }

    if (replacement.oldUrl === replacement.newUrl) {
      thumbsAdded++;
      console.log(`+ thumb ${replacement.oldPublicId}`);
    } else {
      migrated++;
      console.log(`✓ ${replacement.oldPublicId} → ${replacement.newPublicId}`);
    }

    await applyReplacement(replacement);
  }

  // Backfill gallery/media rows that already point at webp URLs but lack thumbnails
  const assets = await db
    .select()
    .from(mediaAssets)
    .where(or(ilike(mediaAssets.url, "%.webp"), ilike(mediaAssets.url, "%.jpg")));
  for (const asset of assets) {
    if (asset.thumbnailUrl) continue;
    const publicId = asset.cloudinaryId || publicIdFromUrl(asset.url);
    if (!publicId?.toLowerCase().endsWith(".webp")) continue;
    const thumbUrl = await ensureThumbForStorageKey(publicId);
    if (!thumbUrl) continue;
    await db
      .update(mediaAssets)
      .set({ thumbnailUrl: thumbUrl })
      .where(eq(mediaAssets.id, asset.id));
    await db
      .update(galleryItems)
      .set({ thumbnailUrl: thumbUrl })
      .where(eq(galleryItems.url, asset.url));
    thumbsAdded++;
  }

  console.log(
    `\nDone — converted ${migrated}, added ${thumbsAdded} thumbnails, skipped ${skipped}.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
