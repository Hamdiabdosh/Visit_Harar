import { createError } from "@/lib/errors";

type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): void {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (entry.count >= max) {
    throw createError(
      "VALIDATION_ERROR",
      "Too many requests. Please try again later.",
      429,
    );
  }
  entry.count += 1;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}
