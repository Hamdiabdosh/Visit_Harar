import { v2 as cloudinary } from "cloudinary";
import { createError } from "@/lib/errors";

function ensureConfigured() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw createError(
      "UPLOAD_FAILED",
      "Cloudinary is not configured. Set CLOUDINARY_* in .env",
    );
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export async function uploadImageBuffer(
  buffer: Buffer,
  filename: string,
  folder = "visit-harar/hero",
): Promise<{ url: string; publicId: string }> {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        public_id: `${Date.now()}-${filename.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-")}`,
      },
      (err, result) => {
        if (err || !result?.secure_url) {
          reject(createError("UPLOAD_FAILED", err?.message ?? "Upload failed"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

export async function uploadAssetBuffer(
  buffer: Buffer,
  filename: string,
  options: { folder: string; resourceType: "image" | "video" },
): Promise<{ url: string; publicId: string }> {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resourceType,
        public_id: `${Date.now()}-${filename
          .replace(/\.[^.]+$/, "")
          .replace(/[^a-zA-Z0-9-_]/g, "-")}`,
      },
      (err, result) => {
        if (err || !result?.secure_url) {
          reject(createError("UPLOAD_FAILED", err?.message ?? "Upload failed"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

export async function deleteImage(publicId: string) {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId);
}

export async function deleteAsset(
  publicId: string,
  resourceType: "image" | "video",
) {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

/** Extract Cloudinary public_id from a secure_url when possible. */
export function publicIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("cloudinary.com")) return null;
    const parts = u.pathname.split("/upload/");
    if (parts.length < 2) return null;
    const after = parts[1]!.replace(/^v\d+\//, "");
    return after.replace(/\.[^.]+$/, "");
  } catch {
    return null;
  }
}
