import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { createError } from "@/lib/errors";
import {
  generateThumbBuffer,
  processImageBuffer,
  thumbStorageKey,
} from "@/lib/image-processing.server";

const UPLOAD_URL_PREFIX = "/uploads/";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

export function getUploadDir(): string {
  return process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
}

/** Same-origin path — survives APP_URL / domain changes (no absolute host baked in). */
export function getPublicUrl(storageKey: string): string {
  const normalized = storageKey.replace(/^\/+/, "");
  return `${UPLOAD_URL_PREFIX}${normalized}`;
}

function sanitizeFilename(filename: string): string {
  return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "-");
}

function buildStorageKey(
  folder: string,
  filename: string,
  forcedExt?: string,
): string {
  const ext =
    forcedExt ?? (path.extname(filename).toLowerCase() || ".bin");
  const stem = `${Date.now()}-${sanitizeFilename(filename).replace(/\.[^.]+$/, "")}`;
  const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
  return `${cleanFolder}/${stem}${ext}`;
}

export type UploadAssetResult = {
  url: string;
  publicId: string;
  thumbnailUrl?: string | null;
  width?: number | null;
  height?: number | null;
  sizeBytes?: number | null;
};

/** Resolve a storage key to an absolute path; returns null on traversal attempts. */
export function resolveStoragePath(storageKey: string): string | null {
  const uploadDir = path.resolve(getUploadDir());
  const normalized = storageKey.replace(/^\/+/, "");
  if (normalized.includes("..")) return null;

  const full = path.resolve(uploadDir, normalized);
  if (full !== uploadDir && !full.startsWith(`${uploadDir}${path.sep}`)) {
    return null;
  }
  return full;
}

async function ensureUploadRoot() {
  await fsPromises.mkdir(getUploadDir(), { recursive: true });
}

export async function uploadImageBuffer(
  buffer: Buffer,
  filename: string,
  folder = "visit-harar/hero",
): Promise<UploadAssetResult> {
  return uploadAssetBuffer(buffer, filename, {
    folder,
    resourceType: "image",
  });
}

async function writeStorageFile(storageKey: string, data: Buffer) {
  const filePath = resolveStoragePath(storageKey);
  if (!filePath) {
    throw createError("UPLOAD_FAILED", "Invalid storage path");
  }
  await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
  await fsPromises.writeFile(filePath, data);
  return filePath;
}

export async function uploadAssetBuffer(
  buffer: Buffer,
  filename: string,
  options: { folder: string; resourceType: "image" | "video" },
): Promise<UploadAssetResult> {
  await ensureUploadRoot();

  if (options.resourceType === "image") {
    const processed = await processImageBuffer(buffer, filename);
    if (processed) {
      const storageKey = buildStorageKey(options.folder, filename, ".webp");
      const thumbKey = thumbStorageKey(storageKey);
      await writeStorageFile(storageKey, processed.mainBuffer);
      await writeStorageFile(thumbKey, processed.thumbBuffer);
      return {
        url: getPublicUrl(storageKey),
        publicId: storageKey,
        thumbnailUrl: getPublicUrl(thumbKey),
        width: processed.width,
        height: processed.height,
        sizeBytes: processed.sizeBytes,
      };
    }
  }

  const storageKey = buildStorageKey(options.folder, filename);
  await writeStorageFile(storageKey, buffer);

  return {
    url: getPublicUrl(storageKey),
    publicId: storageKey,
    sizeBytes: buffer.length,
  };
}

export async function deleteImage(publicId: string) {
  await deleteAsset(publicId, "image");
}

export async function deleteAsset(
  publicId: string,
  resourceType: "image" | "video",
) {
  const filePath = resolveStoragePath(publicId);
  if (filePath) {
    await fsPromises.unlink(filePath).catch(() => undefined);
  }
  if (resourceType === "image" && publicId.toLowerCase().endsWith(".webp")) {
    const thumbPath = resolveStoragePath(thumbStorageKey(publicId));
    if (thumbPath) {
      await fsPromises.unlink(thumbPath).catch(() => undefined);
    }
  }
}

/** Re-process an on-disk image into WebP display + thumb variants (migration helper). */
export async function migrateStorageImage(
  sourceStorageKey: string,
): Promise<UploadAssetResult | null> {
  const sourcePath = resolveStoragePath(sourceStorageKey);
  if (!sourcePath) return null;

  const buffer = await fsPromises.readFile(sourcePath);
  const processed = await processImageBuffer(
    buffer,
    path.basename(sourceStorageKey),
  );
  if (!processed) return null;

  const targetKey = sourceStorageKey.replace(/\.[^.]+$/i, ".webp");
  const thumbKey = thumbStorageKey(targetKey);

  await writeStorageFile(targetKey, processed.mainBuffer);
  await writeStorageFile(thumbKey, processed.thumbBuffer);

  if (targetKey !== sourceStorageKey) {
    await fsPromises.unlink(sourcePath).catch(() => undefined);
    const oldThumb = resolveStoragePath(thumbStorageKey(sourceStorageKey));
    if (oldThumb) await fsPromises.unlink(oldThumb).catch(() => undefined);
  }

  return {
    url: getPublicUrl(targetKey),
    publicId: targetKey,
    thumbnailUrl: getPublicUrl(thumbKey),
    width: processed.width,
    height: processed.height,
    sizeBytes: processed.sizeBytes,
  };
}

/** Add a missing thumbnail next to an existing WebP main file. */
export async function ensureThumbForStorageKey(
  mainStorageKey: string,
): Promise<string | null> {
  const thumbKey = thumbStorageKey(mainStorageKey);
  const existingThumb = resolveStoragePath(thumbKey);
  if (existingThumb) {
    try {
      await fsPromises.access(existingThumb);
      return getPublicUrl(thumbKey);
    } catch {
      /* generate below */
    }
  }

  const mainPath = resolveStoragePath(mainStorageKey);
  if (!mainPath) return null;
  const buffer = await fsPromises.readFile(mainPath);
  const thumbBuffer = await generateThumbBuffer(buffer);
  if (!thumbBuffer) return null;

  await writeStorageFile(thumbKey, thumbBuffer);
  return getPublicUrl(thumbKey);
}

/** Storage key from a public URL or /uploads/ path. Legacy Cloudinary URLs return null. */
export function publicIdFromUrl(url: string): string | null {
  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const u = new URL(url);
      if (u.hostname.includes("cloudinary.com")) return null;
      if (!u.pathname.startsWith(UPLOAD_URL_PREFIX)) return null;
      return decodeURIComponent(u.pathname.slice(UPLOAD_URL_PREFIX.length));
    }
    if (url.startsWith(UPLOAD_URL_PREFIX)) {
      return decodeURIComponent(url.slice(UPLOAD_URL_PREFIX.length));
    }
    return null;
  } catch {
    return null;
  }
}

export function isStorageWritable(): boolean {
  try {
    fs.mkdirSync(getUploadDir(), { recursive: true });
    fs.accessSync(getUploadDir(), fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

export async function serveStorageFile(
  storageKey: string,
  options?: { download?: boolean },
): Promise<Response> {
  const filePath = resolveStoragePath(storageKey);
  if (!filePath) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const stat = await fsPromises.stat(filePath);
    if (!stat.isFile()) {
      return new Response("Not found", { status: 404 });
    }
    const data = await fsPromises.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] ?? "application/octet-stream";
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    };
    if (options?.download) {
      headers["Content-Disposition"] =
        `attachment; filename="${path.basename(filePath)}"`;
    }
    return new Response(data, { headers });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
