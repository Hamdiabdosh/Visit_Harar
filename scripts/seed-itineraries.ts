import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { itineraries } from "../drizzle/schema/index";

const SEEDS = [
  {
    title: "Weekend in Harar",
    slug: "weekend-in-harar",
    duration: "2 Days / 1 Night",
    summary:
      "A compact introduction to Jugol, hyena feeding, and Harari coffee culture.",
    days: [
      {
        label: "Day 1",
        items: [
          {
            title: "Walk the Jugol gates and alleys",
            description: "Enter via Erer Gate and explore the UNESCO old city.",
            attraction_slug: "jugol-walled-city",
          },
          {
            title: "Harari house museum visit",
            attraction_slug: "arthur-rimbaud-house",
          },
          {
            title: "Evening hyena feeding",
            description: "Join the famous nightly tradition outside the walls.",
          },
        ],
      },
      {
        label: "Day 2",
        items: [
          {
            title: "Fresh View Coffee ceremony",
            description: "Morning coffee in a traditional Harari home.",
          },
          {
            title: "Market and craft shopping",
            attraction_slug: "harar-market",
          },
          {
            title: "Depart via Dire Dawa",
            description: "Allow 1.5 hours for the road to the airport.",
          },
        ],
      },
    ],
  },
  {
    title: "Culture & Heritage Deep Dive",
    slug: "culture-heritage-3-days",
    duration: "3 Days / 2 Nights",
    summary:
      "For travellers who want mosques, museums, festivals, and time with a licensed guide.",
    days: [
      {
        label: "Day 1",
        items: [
          { title: "Guided Jugol orientation", attraction_slug: "jugol-walled-city" },
          { title: "Grand Mosque exterior & historic quarters" },
        ],
      },
      {
        label: "Day 2",
        items: [
          { title: "Rimbaud House & cultural museums" },
          { title: "Local lunch and spice market" },
        ],
      },
      {
        label: "Day 3",
        items: [
          { title: "Day trip viewpoints around Harar" },
          { title: "Souvenir shopping and departure" },
        ],
      },
    ],
  },
  {
    title: "One Day Highlights",
    slug: "one-day-highlights",
    duration: "1 Day",
    summary: "Perfect for transit visitors with limited time.",
    days: [
      {
        label: "Morning",
        items: [
          { title: "Jugol walking tour", attraction_slug: "jugol-walled-city" },
          { title: "Coffee ceremony" },
        ],
      },
      {
        label: "Afternoon",
        items: [
          { title: "Key museums and photo stops" },
          { title: "Return to hotel or continue to Dire Dawa" },
        ],
      },
    ],
  },
];

export async function seedItineraries() {
  let order = 0;
  for (const it of SEEDS) {
    const existing = await db.query.itineraries.findFirst({
      where: eq(itineraries.slug, it.slug),
    });
    const values = {
      title: it.title,
      slug: it.slug,
      duration: it.duration,
      summary: it.summary,
      days: it.days,
      isPublished: true,
      sortOrder: order++,
      updatedAt: new Date(),
    };
    if (existing) {
      await db
        .update(itineraries)
        .set(values)
        .where(eq(itineraries.slug, it.slug));
    } else {
      await db.insert(itineraries).values(values);
    }
  }
  console.log(`✓ Itineraries seeded (${SEEDS.length} items)`);
}
