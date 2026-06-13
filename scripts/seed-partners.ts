import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { partners } from "../drizzle/schema/index";

const SEEDS = [
  {
    name: "Ras Hotel Harar",
    slug: "ras-hotel-harar",
    category: "Hotel" as const,
    description:
      "Historic hotel near Jugol with restaurant and courtyard — a classic base for exploring the old city.",
    address: "Near Harar Jugol, Harar",
    phone: "+251 25 666 0123",
    isFeatured: true,
  },
  {
    name: "Fresh View Coffee",
    slug: "fresh-view-coffee",
    category: "Coffee" as const,
    description:
      "Traditional Harari coffee ceremony in a restored house — one of the best introductions to local hospitality.",
    address: "Jugol, Harar",
    isFeatured: true,
  },
  {
    name: "Tewodros Restaurant",
    slug: "tewodros-restaurant",
    category: "Restaurant" as const,
    description: "Ethiopian and Harari dishes; popular with visitors after a day in the medina.",
    address: "Harar city centre",
    phone: "+251 91 123 4567",
  },
  {
    name: "Harar City Taxi Association",
    slug: "harar-city-taxi",
    category: "Transport" as const,
    description:
      "Licensed taxis for airport transfers from Dire Dawa and local trips around Harar.",
    phone: "+251 25 666 1000",
  },
  {
    name: "Commercial Bank of Ethiopia — Harar",
    slug: "cbe-harar-forex",
    category: "Forex" as const,
    description: "Official forex and ATM services for international visitors.",
    address: "Main road, Harar",
  },
];

export async function seedPartners() {
  let order = 0;
  for (const p of SEEDS) {
    const existing = await db.query.partners.findFirst({
      where: eq(partners.slug, p.slug),
    });
    const values = {
      name: p.name,
      slug: p.slug,
      category: p.category,
      description: p.description,
      address: p.address ?? null,
      phone: p.phone ?? null,
      isFeatured: p.isFeatured ?? false,
      isPublished: true,
      sortOrder: order++,
      updatedAt: new Date(),
    };
    if (existing) {
      await db.update(partners).set(values).where(eq(partners.slug, p.slug));
    } else {
      await db.insert(partners).values(values);
    }
  }
  console.log(`✓ Partners seeded (${SEEDS.length} items)`);
}
