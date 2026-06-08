import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { pages } from "../drizzle/schema/index";
import {
  CULTURE_DEFAULT_CONTENT,
  isCultureContentEmpty,
} from "../src/lib/culture-defaults";
import {
  ABOUT_SEED_CONTENT,
  isAboutContentEmpty,
  isPlanContentEmpty,
  PLAN_SEED_CONTENT,
} from "./seed-page-content";

const PAGE_SEEDS = [
  { pageKey: "about", title: "About Harar" },
  { pageKey: "culture", title: "Culture & Festivals" },
  { pageKey: "plan", title: "Plan Your Trip" },
] as const;

function seedContentFor(pageKey: (typeof PAGE_SEEDS)[number]["pageKey"]) {
  if (pageKey === "culture") return CULTURE_DEFAULT_CONTENT;
  if (pageKey === "about") return ABOUT_SEED_CONTENT;
  return PLAN_SEED_CONTENT;
}

function needsContentDefaults(
  pageKey: (typeof PAGE_SEEDS)[number]["pageKey"],
  content: Record<string, unknown>,
) {
  if (pageKey === "culture") return isCultureContentEmpty(content);
  if (pageKey === "about") return isAboutContentEmpty(content);
  return isPlanContentEmpty(content);
}

export async function seedPages() {
  for (const row of PAGE_SEEDS) {
    const existing = await db.query.pages.findFirst({
      where: eq(pages.pageKey, row.pageKey),
    });
    const existingContent = (existing?.content ?? {}) as Record<
      string,
      unknown
    >;
    const shouldFill = needsContentDefaults(row.pageKey, existingContent);

    if (existing) {
      await db
        .update(pages)
        .set({
          title: row.title,
          ...(shouldFill
            ? {
                content: seedContentFor(row.pageKey),
                isPublished: true,
              }
            : {}),
          updatedAt: new Date(),
        })
        .where(eq(pages.pageKey, row.pageKey));
    } else {
      await db.insert(pages).values({
        pageKey: row.pageKey,
        title: row.title,
        content: seedContentFor(row.pageKey),
        isPublished: true,
      });
    }
  }
  console.log("✓ Pages seeded (about, culture, plan)");
}
