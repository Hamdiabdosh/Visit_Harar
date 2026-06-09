export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function ensureUniqueSlug(
  slug: string,
  exists: (candidate: string) => Promise<boolean>,
): Promise<string> {
  let candidate = slug;
  let n = 2;

  while (true) {
    const taken = await exists(candidate);
    if (!taken) return candidate;
    candidate = `${slug}-${n++}`;
  }
}
