/** Resize/compress images in the browser so uploads stay under server payload limits (~1MB). */

const MAX_DIMENSION = 1600;
/** Target raw WebP size before base64 (~33% overhead in JSON). */
const MAX_BYTES = 700_000;
const INITIAL_QUALITY = 0.85;

export async function prepareImageForUpload(
  file: File,
): Promise<{ base64: string; filename: string }> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose a JPEG, PNG, or WebP image.");
  }

  if (file.size > 20 * 1024 * 1024) {
    throw new Error("Image is too large. Please use a file under 20MB.");
  }

  const bitmap = await createImageBitmap(file);
  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = longest > MAX_DIMENSION ? MAX_DIMENSION / longest : 1;
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process this image in the browser.");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  let quality = INITIAL_QUALITY;
  let blob = await canvasToWebpBlob(canvas, quality);

  while (blob.size > MAX_BYTES && quality > 0.45) {
    quality -= 0.08;
    blob = await canvasToWebpBlob(canvas, quality);
  }

  if (blob.size > 1_100_000) {
    throw new Error(
      "Image is still too large after compression. Try a smaller photo or paste an image URL instead.",
    );
  }

  const base64 = await blobToBase64(blob);
  const baseName =
    file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-") ||
    "image";
  return { base64, filename: `${baseName}.webp` };
}

function canvasToWebpBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not encode image"))),
      "image/webp",
      quality,
    );
  });
}

export async function prepareMediaForUpload(
  file: File,
): Promise<{ data: string; filename: string; mime: string }> {
  if (file.type.startsWith("image/")) {
    const { base64, filename } = await prepareImageForUpload(file);
    return { data: base64, filename, mime: "image/webp" };
  }
  const data = await blobToBase64(file);
  return {
    data,
    filename: file.name,
    mime: file.type || "application/octet-stream",
  };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      if (!base64) reject(new Error("Could not read image data"));
      else resolve(base64);
    };
    reader.onerror = () => reject(new Error("Could not read image data"));
    reader.readAsDataURL(blob);
  });
}
