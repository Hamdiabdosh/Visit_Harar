import path from "node:path";
import sharp from "sharp";

const THUMB_MAX = 400;
const DISPLAY_MAX = 1200;
const THUMB_QUALITY = 78;
const DISPLAY_QUALITY = 82;

const PASS_THROUGH_EXT = new Set([".svg", ".gif"]);

export type ProcessedImage = {
  mainBuffer: Buffer;
  thumbBuffer: Buffer;
  width: number;
  height: number;
  sizeBytes: number;
};

export function isProcessableImage(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return !PASS_THROUGH_EXT.has(ext);
}

/** Storage key for the 400px thumbnail variant of a main `.webp` key. */
export function thumbStorageKey(mainStorageKey: string): string {
  const ext = path.extname(mainStorageKey);
  const stem = mainStorageKey.slice(0, -ext.length);
  return `${stem}-thumb.webp`;
}

export async function processImageBuffer(
  buffer: Buffer,
  filename: string,
): Promise<ProcessedImage | null> {
  if (!isProcessableImage(filename)) return null;

  try {
    const pipeline = sharp(buffer, { failOn: "none" }).rotate();
    const meta = await pipeline.metadata();
    if (!meta.width || !meta.height) return null;

    const [mainBuffer, thumbBuffer] = await Promise.all([
      sharp(buffer, { failOn: "none" })
        .rotate()
        .resize(DISPLAY_MAX, DISPLAY_MAX, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: DISPLAY_QUALITY })
        .toBuffer(),
      sharp(buffer, { failOn: "none" })
        .rotate()
        .resize(THUMB_MAX, THUMB_MAX, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: THUMB_QUALITY })
        .toBuffer(),
    ]);

    const displayMeta = await sharp(mainBuffer).metadata();

    return {
      mainBuffer,
      thumbBuffer,
      width: displayMeta.width ?? meta.width,
      height: displayMeta.height ?? meta.height,
      sizeBytes: mainBuffer.length,
    };
  } catch {
    return null;
  }
}

/** Generate only a thumbnail for an existing main image file. */
export async function generateThumbBuffer(buffer: Buffer): Promise<Buffer | null> {
  try {
    return await sharp(buffer, { failOn: "none" })
      .rotate()
      .resize(THUMB_MAX, THUMB_MAX, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: THUMB_QUALITY })
      .toBuffer();
  } catch {
    return null;
  }
}
