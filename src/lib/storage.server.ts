import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { createError } from "@/lib/errors";

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

function getAppBaseUrl(): string {
  const base =
    process.env.APP_URL ??
    process.env.BETTER_AUTH_URL ??
    "http://localhost:3000";
  return base.replace(/\/+$/, "");
}

export function getPublicUrl(storageKey: string): string {
  const normalized = storageKey.replace(/^\/+/, "");
  return `${getAppBaseUrl()}${UPLOAD_URL_PREFIX}${normalized}`;
}

function sanitizeFilename(filename: string): string {
  return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "-");
}

function buildStorageKey(folder: string, filename: string): string {
  const ext = path.extname(filename).toLowerCase() || ".bin";
  const stem = `${Date.now()}-${sanitizeFilename(filename).replace(/\.[^.]+$/, "")}`;
  const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
  return `${cleanFolder}/${stem}${ext}`;
}

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
): Promise<{ url: string; publicId: string }> {
  return uploadAssetBuffer(buffer, filename, {
    folder,
    resourceType: "image",
  });
}

export async function uploadAssetBuffer(
  buffer: Buffer,
  filename: string,
  options: { folder: string; resourceType: "image" | "video" },
): Promise<{ url: string; publicId: string }> {
  await ensureUploadRoot();
  const storageKey = buildStorageKey(options.folder, filename);
  const filePath = resolveStoragePath(storageKey);
  if (!filePath) {
    throw createError("UPLOAD_FAILED", "Invalid storage path");
  }

  await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
  await fsPromises.writeFile(filePath, buffer);

  return { url: getPublicUrl(storageKey), publicId: storageKey };
}

export async function deleteImage(publicId: string) {
  await deleteAsset(publicId, "image");
}

export async function deleteAsset(
  publicId: string,
  _resourceType: "image" | "video",
) {
  const filePath = resolveStoragePath(publicId);
  if (!filePath) return;
  await fsPromises.unlink(filePath).catch(() => undefined);
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
