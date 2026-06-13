import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "../../../db/index";
import {
  announcements,
  attractions,
  contactInfo,
  galleryAlbums,
  galleryItems,
  guides,
  heroContent,
  itineraries,
  pages,
  partners,
  siteSettings,
} from "../../../drizzle/schema/index";
import { htmlToText } from "./html-to-text";

const SITE_ROUTES = [
  { path: "/", label: "Homepage" },
  { path: "/attractions", label: "Attractions listing" },
  { path: "/map", label: "Interactive tourism map" },
  { path: "/guides", label: "Licensed guides" },
  { path: "/book", label: "Tour booking" },
  { path: "/plan-your-trip", label: "Plan your trip (visas, getting here, itineraries)" },
  { path: "/itineraries", label: "Suggested itineraries" },
  { path: "/services", label: "Local services and partners" },
  { path: "/about", label: "About Harar" },
  { path: "/culture", label: "Culture and festivals" },
  { path: "/news", label: "News and announcements" },
  { path: "/gallery", label: "Photo gallery" },
  { path: "/contact", label: "Contact the commission" },
];

function section(title: string, body: string): string {
  if (!body.trim()) return "";
  return `## ${title}\n\n${body.trim()}\n`;
}

function formatPageContent(
  pageKey: string,
  content: Record<string, unknown>,
): string {
  const lines: string[] = [];

  if (pageKey === "about") {
    const intro = htmlToText(content.intro_text as string);
    const unesco = htmlToText(content.unesco_text as string);
    const geography = htmlToText(content.geography_text as string);
    if (intro) lines.push(intro);
    if (unesco) lines.push(`UNESCO:\n${unesco}`);
    if (geography) lines.push(`Geography:\n${geography}`);
    const facts = content.quick_facts as
      | { label: string; value: string }[]
      | undefined;
    if (facts?.length) {
      lines.push(
        "Quick facts:\n" +
          facts.map((f) => `- ${f.label}: ${f.value}`).join("\n"),
      );
    }
  } else if (pageKey === "culture") {
    const intro = htmlToText(content.intro_text as string);
    if (intro) lines.push(intro);
    const sections = content.sections as
      | { title: string; body?: string }[]
      | undefined;
    for (const s of sections ?? []) {
      const body = htmlToText(s.body);
      lines.push(`### ${s.title}${body ? `\n${body}` : ""}`);
    }
    const festivals = content.festivals as
      | { name: string; date: string; description: string }[]
      | undefined;
    if (festivals?.length) {
      lines.push("Festivals:");
      for (const f of festivals) {
        lines.push(`- ${f.name} (${f.date}): ${f.description}`);
      }
    }
  } else if (pageKey === "plan") {
    for (const key of [
      "getting_here",
      "best_time",
      "visa_info",
      "packing_list",
      "estimated_costs",
      "dire_dawa_transfer",
      "accommodation",
    ] as const) {
      const text = htmlToText(content[key] as string);
      if (text) lines.push(`${key.replace(/_/g, " ")}:\n${text}`);
    }
    const itineraries = content.itineraries as
      | { duration: string; title: string; days: string[] }[]
      | undefined;
    for (const it of itineraries ?? []) {
      lines.push(
        `Itinerary — ${it.duration}: ${it.title}\n` +
          it.days.map((d, i) => `  Day ${i + 1}: ${d}`).join("\n"),
      );
    }
  }

  return lines.join("\n\n");
}

const PAGE_PATHS: Record<string, string> = {
  about: "/about",
  culture: "/culture",
  plan: "/plan-your-trip",
};

export async function buildSiteKnowledgeSnapshot(): Promise<string> {
  const [
    settingsRows,
    heroRows,
    attractionRows,
    guideRows,
    pageRows,
    announcementRows,
    contactRows,
    albumRows,
    partnerRows,
    itineraryRows,
  ] = await Promise.all([
    db.select().from(siteSettings).limit(1),
    db
      .select()
      .from(heroContent)
      .where(eq(heroContent.isPublished, true))
      .limit(1),
    db
      .select()
      .from(attractions)
      .where(eq(attractions.isPublished, true))
      .orderBy(asc(attractions.sortOrder), asc(attractions.title)),
    db
      .select()
      .from(guides)
      .where(eq(guides.isPublished, true))
      .orderBy(asc(guides.sortOrder), asc(guides.name)),
    db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.isPublished, true),
          inArray(pages.pageKey, ["about", "culture", "plan"]),
        ),
      ),
    db
      .select()
      .from(announcements)
      .where(eq(announcements.isPublished, true))
      .orderBy(desc(announcements.publishedAt)),
    db
      .select()
      .from(contactInfo)
      .where(eq(contactInfo.isPublished, true))
      .limit(1),
    db
      .select()
      .from(galleryAlbums)
      .where(eq(galleryAlbums.isPublished, true))
      .orderBy(asc(galleryAlbums.sortOrder)),
    db
      .select()
      .from(partners)
      .where(eq(partners.isPublished, true))
      .orderBy(asc(partners.sortOrder), asc(partners.name)),
    db
      .select()
      .from(itineraries)
      .where(eq(itineraries.isPublished, true))
      .orderBy(asc(itineraries.sortOrder), asc(itineraries.title)),
  ]);

  const albumIds = albumRows.map((a) => a.id);
  const itemRows =
    albumIds.length > 0
      ? await db
          .select()
          .from(galleryItems)
          .where(
            and(
              inArray(galleryItems.albumId, albumIds),
              eq(galleryItems.isPublished, true),
            ),
          )
          .orderBy(asc(galleryItems.sortOrder))
      : [];

  const parts: string[] = [];

  const settings = settingsRows[0];
  parts.push(
    section(
      "Site",
      [
        settings?.siteName ? `Name: ${settings.siteName}` : null,
        settings?.siteTagline ? `Tagline: ${settings.siteTagline}` : null,
        `booking_enabled: ${settings?.bookingEnabled ?? true}`,
        `maintenance_mode: ${settings?.maintenanceMode ?? false}`,
      ]
        .filter(Boolean)
        .join("\n"),
    ),
  );

  parts.push(
    section(
      "Site navigation",
      SITE_ROUTES.map((r) => `- ${r.path} — ${r.label}`).join("\n"),
    ),
  );

  const hero = heroRows[0];
  if (hero) {
    parts.push(
      section(
        "Homepage hero",
        [
          hero.badgeText,
          hero.headline,
          hero.headlineItalic,
          hero.subheading,
          hero.ctaPrimaryText && hero.ctaPrimaryUrl
            ? `Primary CTA: ${hero.ctaPrimaryText} → ${hero.ctaPrimaryUrl}`
            : null,
          hero.ctaGhostText && hero.ctaGhostUrl
            ? `Secondary CTA: ${hero.ctaGhostText} → ${hero.ctaGhostUrl}`
            : null,
          hero.stat1Number && hero.stat1Label
            ? `Stat: ${hero.stat1Number} ${hero.stat1Label}`
            : null,
          hero.stat2Number && hero.stat2Label
            ? `Stat: ${hero.stat2Number} ${hero.stat2Label}`
            : null,
          hero.stat3Number && hero.stat3Label
            ? `Stat: ${hero.stat3Number} ${hero.stat3Label}`
            : null,
        ]
          .filter(Boolean)
          .join("\n"),
      ),
    );
  }

  if (attractionRows.length > 0) {
    const blocks = attractionRows.map((a) => {
      const lines = [
        `### ${a.title}`,
        `URL: /attractions/${a.slug}`,
        `Category: ${a.category}`,
        a.shortDesc ? `Summary: ${a.shortDesc}` : null,
        a.fullDesc ? `Description: ${htmlToText(a.fullDesc)}` : null,
        a.openingHours ? `Hours: ${a.openingHours}` : null,
        a.bestTimeToVisit ? `Best time: ${a.bestTimeToVisit}` : null,
        a.visitorTips ? `Tips: ${a.visitorTips}` : null,
        a.latitude && a.longitude
          ? `Coordinates: ${a.latitude}, ${a.longitude}`
          : null,
        a.isFeatured ? "Featured: yes" : null,
      ].filter(Boolean);
      return lines.join("\n");
    });
    parts.push(section("Attractions", blocks.join("\n\n")));
  }

  if (guideRows.length > 0) {
    const blocks = guideRows.map((g) => {
      const lines = [
        `### ${g.name}`,
        `URL: /guides/${g.slug}`,
        g.bio ? `Bio: ${htmlToText(g.bio)}` : null,
        g.languages?.length ? `Languages: ${g.languages.join(", ")}` : null,
        g.specialties?.length
          ? `Specialties: ${g.specialties.join(", ")}`
          : null,
        g.experienceYears != null
          ? `Experience: ${g.experienceYears} years`
          : null,
        g.licenseNumber ? `License: ${g.licenseNumber}` : null,
        g.phone ? `Phone: ${g.phone}` : null,
        g.email ? `Email: ${g.email}` : null,
        `Available: ${g.isAvailable ? "yes" : "no"}`,
      ].filter(Boolean);
      return lines.join("\n");
    });
    parts.push(section("Guides", blocks.join("\n\n")));
  }

  for (const page of pageRows) {
    const path = PAGE_PATHS[page.pageKey] ?? `/${page.pageKey}`;
    const content = formatPageContent(
      page.pageKey,
      (page.content ?? {}) as Record<string, unknown>,
    );
    if (content) {
      parts.push(section(`Page: ${page.title} (${path})`, content));
    }
  }

  if (announcementRows.length > 0) {
    const blocks = announcementRows.map((n) => {
      const lines = [
        `### ${n.title}`,
        `URL: /news/${n.slug}`,
        `Type: ${n.type}`,
        n.eventDate ? `Event date: ${n.eventDate}` : null,
        n.eventLocation ? `Location: ${n.eventLocation}` : null,
        n.body ? `Body: ${htmlToText(n.body)}` : null,
      ].filter(Boolean);
      return lines.join("\n");
    });
    parts.push(section("News and announcements", blocks.join("\n\n")));
  }

  const contact = contactRows[0];
  if (contact) {
    const hours = contact.workingHours as
      | { day: string; hours: string }[]
      | undefined;
    parts.push(
      section(
        "Contact",
        [
          contact.officeName,
          [contact.addressLine1, contact.addressLine2, contact.country]
            .filter(Boolean)
            .join(", "),
          contact.phonePrimary ? `Phone: ${contact.phonePrimary}` : null,
          contact.phoneSecondary ? `Phone 2: ${contact.phoneSecondary}` : null,
          contact.emailGeneral ? `Email: ${contact.emailGeneral}` : null,
          contact.emailBookings
            ? `Bookings email: ${contact.emailBookings}`
            : null,
          hours?.length
            ? "Hours:\n" + hours.map((h) => `- ${h.day}: ${h.hours}`).join("\n")
            : null,
          contact.facebookUrl ? `Facebook: ${contact.facebookUrl}` : null,
          contact.twitterUrl ? `Twitter: ${contact.twitterUrl}` : null,
          contact.instagramUrl ? `Instagram: ${contact.instagramUrl}` : null,
          "Contact page: /contact",
        ]
          .filter(Boolean)
          .join("\n"),
      ),
    );
  }

  if (albumRows.length > 0) {
    const itemsByAlbum = new Map<string, typeof itemRows>();
    for (const item of itemRows) {
      const list = itemsByAlbum.get(item.albumId) ?? [];
      list.push(item);
      itemsByAlbum.set(item.albumId, list);
    }
    const blocks = albumRows.map((album) => {
      const items = itemsByAlbum.get(album.id) ?? [];
      const lines = [
        `### ${album.title}`,
        `URL: /gallery/${album.id}`,
        album.description ? `Description: ${album.description}` : null,
      ];
      for (const item of items) {
        const caption = item.caption ?? item.altText;
        if (caption) lines.push(`- ${caption}`);
      }
      return lines.filter(Boolean).join("\n");
    });
    parts.push(section("Gallery", blocks.join("\n\n")));
  }

  if (partnerRows.length > 0) {
    const blocks = partnerRows.map((p) =>
      [
        `### ${p.name}`,
        `Category: ${p.category}`,
        p.description ? `Description: ${p.description}` : null,
        p.address ? `Address: ${p.address}` : null,
        p.phone ? `Phone: ${p.phone}` : null,
        p.website ? `Website: ${p.website}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    );
    parts.push(section("Partners and services", blocks.join("\n\n")));
  }

  if (itineraryRows.length > 0) {
    const blocks = itineraryRows.map((it) => {
      const days = (it.days as { label: string; items: { title: string }[] }[]) ?? [];
      return [
        `### ${it.title} (${it.duration})`,
        `URL: /itineraries/${it.slug}`,
        it.summary ? `Summary: ${it.summary}` : null,
        ...days.map(
          (d) =>
            `${d.label}: ${d.items.map((i) => i.title).join("; ")}`,
        ),
      ]
        .filter(Boolean)
        .join("\n");
    });
    parts.push(section("Itineraries", blocks.join("\n\n")));
  }

  const extra = settingsRows[0]?.chatKnowledgeExtra;
  if (extra?.trim()) {
    parts.push(section("Commission notes (admin)", extra.trim()));
  }

  return parts.filter(Boolean).join("\n");
}
