import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { announcements } from "../drizzle/schema/index";
import { announcements as announcementSeeds } from "../src/lib/harar-data";

const EVENT_DATES: Record<string, string> = {
  "eid-2026": "2026-05-30",
  "coffee-festival": "2026-07-12",
};

function parsePublishedAt(dateStr: string): Date {
  const parsed = Date.parse(dateStr);
  return Number.isNaN(parsed) ? new Date() : new Date(parsed);
}

export async function seedAnnouncements() {
  for (const a of announcementSeeds) {
    const publishedAt = parsePublishedAt(a.date);
    const eventDate = a.type === "Event" ? (EVENT_DATES[a.id] ?? null) : null;

    const existing = await db.query.announcements.findFirst({
      where: eq(announcements.slug, a.id),
    });

    const values = {
      title: a.title,
      slug: a.id,
      type: a.type,
      body: a.excerpt,
      eventDate,
      eventLocation: null as string | null,
      isPinned: a.pinned,
      isPublished: true,
      publishedAt,
      updatedAt: new Date(),
    };

    if (existing) {
      await db
        .update(announcements)
        .set(values)
        .where(eq(announcements.slug, a.id));
    } else {
      await db.insert(announcements).values({ ...values, coverImage: null });
    }
  }

  // Ensure single pinned announcement
  const pinned = announcementSeeds.find((a) => a.pinned);
  if (pinned) {
    await db
      .update(announcements)
      .set({ isPinned: false })
      .where(eq(announcements.isPinned, true));
    await db
      .update(announcements)
      .set({ isPinned: true })
      .where(eq(announcements.slug, pinned.id));
  }

  console.log(`✓ Announcements seeded (${announcementSeeds.length} items)`);
}
