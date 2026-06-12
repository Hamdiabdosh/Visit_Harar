import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { attractions, mapPlaces } from "../drizzle/schema/index";

type SeedPlace = {
  title: string;
  place_type: string;
  lat: number;
  lng: number;
  short_desc?: string;
  address?: string;
  linkedSlug?: string;
  is_featured?: boolean;
  is_published?: boolean;
  sort_order: number;
};

const SEEDS: SeedPlace[] = [
  {
    title: "Harari Tourism Commission",
    place_type: "bureau",
    lat: 9.3133,
    lng: 42.1261,
    short_desc: "Official tourism office — maps, guides, and visit information.",
    address: "Harar, Ethiopia",
    is_featured: true,
    is_published: true,
    sort_order: 0,
  },
  {
    title: "Harar Museum",
    place_type: "museum",
    lat: 9.3108,
    lng: 42.1243,
    short_desc: "Regional museum with Harari cultural artifacts and history.",
    linkedSlug: "harar-museum",
    is_featured: true,
    is_published: true,
    sort_order: 1,
  },
  {
    title: "Rimbaud House",
    place_type: "museum",
    lat: 9.3115,
    lng: 42.1268,
    short_desc: "Former home of poet Arthur Rimbaud, now a cultural centre.",
    is_published: true,
    sort_order: 2,
  },
  {
    title: "Grand Jami Mosque",
    place_type: "attraction",
    lat: 9.311,
    lng: 42.1248,
    short_desc: "Historic mosque at the heart of the old city.",
    linkedSlug: "mosques-shrines",
    is_published: true,
    sort_order: 3,
  },
  {
    title: "Harar Jugol Walled City",
    place_type: "attraction",
    lat: 9.3125,
    lng: 42.1255,
    short_desc: "UNESCO World Heritage old town — start exploring Jugol here.",
    linkedSlug: "harar-jugol",
    is_featured: true,
    is_published: true,
    sort_order: 4,
  },
  {
    title: "Hyena Feeding Site",
    place_type: "viewpoint",
    lat: 9.3195,
    lng: 42.1305,
    short_desc: "Nightly hyena feeding ritual — just outside the Erer Gate.",
    linkedSlug: "hyena-men",
    is_featured: true,
    is_published: true,
    sort_order: 5,
  },
  {
    title: "Erer Gate",
    place_type: "gate",
    lat: 9.319,
    lng: 42.1295,
    short_desc: "Eastern gate of the Jugol wall — near the hyena feeding area.",
    is_published: true,
    sort_order: 6,
  },
  {
    title: "Sufi Gate",
    place_type: "gate",
    lat: 9.31,
    lng: 42.1278,
    short_desc: "One of the five historic gates of Harar Jugol.",
    is_published: true,
    sort_order: 7,
  },
  {
    title: "Shoa Gate",
    place_type: "gate",
    lat: 9.3085,
    lng: 42.1235,
    short_desc: "Southern gate — common entry for visitors exploring the old city.",
    is_published: true,
    sort_order: 8,
  },
  {
    title: "Birtatina Gate",
    place_type: "gate",
    lat: 9.312,
    lng: 42.122,
    short_desc: "Western gate of the walled city.",
    is_published: true,
    sort_order: 9,
  },
  {
    title: "Assum Gate",
    place_type: "gate",
    lat: 9.3155,
    lng: 42.124,
    short_desc: "Northern gate of Harar Jugol.",
    is_published: true,
    sort_order: 10,
  },
  {
    title: "Harari Market (Suuq)",
    place_type: "market",
    lat: 9.3118,
    lng: 42.1258,
    short_desc: "Vibrant market for spices, coffee, baskets, and local crafts.",
    linkedSlug: "markets",
    is_published: true,
    sort_order: 11,
  },
  {
    title: "Heritage Plaza Hotel",
    place_type: "hotel",
    lat: 9.3142,
    lng: 42.1275,
    short_desc: "Hotel near the old city — popular with visitors.",
    is_published: true,
    sort_order: 12,
  },
  {
    title: "Ras Hotel Harar",
    place_type: "hotel",
    lat: 9.3148,
    lng: 42.1282,
    short_desc: "Central hotel with restaurant — walking distance to Jugol.",
    is_published: true,
    sort_order: 13,
  },
  {
    title: "Traditional Coffee House",
    place_type: "restaurant",
    lat: 9.3112,
    lng: 42.1252,
    short_desc: "Experience the Harari coffee ceremony in the old city.",
    linkedSlug: "coffee-ceremony",
    is_published: true,
    sort_order: 14,
  },
];

export async function seedMapPlaces() {
  for (const seed of SEEDS) {
    const existing = await db.query.mapPlaces.findFirst({
      where: eq(mapPlaces.title, seed.title),
    });

    let linkedAttractionId: string | null = null;
    if (seed.linkedSlug) {
      const linked = await db.query.attractions.findFirst({
        where: eq(attractions.slug, seed.linkedSlug),
        columns: { id: true },
      });
      linkedAttractionId = linked?.id ?? null;
    }

    const values = {
      title: seed.title,
      placeType: seed.place_type,
      lat: String(seed.lat),
      lng: String(seed.lng),
      shortDesc: seed.short_desc ?? null,
      address: seed.address ?? null,
      linkedAttractionId,
      isFeatured: seed.is_featured ?? false,
      isPublished: seed.is_published ?? true,
      sortOrder: seed.sort_order,
      updatedAt: new Date(),
    };

    if (existing) {
      await db
        .update(mapPlaces)
        .set(values)
        .where(eq(mapPlaces.id, existing.id));
    } else {
      await db.insert(mapPlaces).values(values);
    }
  }
  console.log(`✓ Map places seeded (${SEEDS.length} pins)`);
}

const isDirectRun = process.argv[1]?.includes("seed-map-places");
if (isDirectRun) {
  seedMapPlaces()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}
