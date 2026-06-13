import type { announcements } from "../../../../../drizzle/schema/announcements";
import { notifyAnnouncementPublished } from "./notify";

type AnnouncementRow = typeof announcements.$inferSelect;

export function scheduleAnnouncementPush(
  before: { isPublished: boolean },
  row: AnnouncementRow,
): void {
  if (before.isPublished || !row.isPublished) return;
  if (row.type !== "Event" && row.type !== "News") return;

  void notifyAnnouncementPublished({
    title: row.title,
    slug: row.slug,
    type: row.type,
    eventDate: row.eventDate
      ? String(row.eventDate).slice(0, 10)
      : null,
  });
}
