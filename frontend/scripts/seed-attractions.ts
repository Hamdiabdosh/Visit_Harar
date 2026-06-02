import { eq } from 'drizzle-orm'
import { db } from '../db/index'
import { attractions } from '../drizzle/schema/index'

const ATTRACTION_SEEDS = [
  {
    slug: 'harar-jugol',
    title: 'Harar Jugol Walled City',
    category: 'Heritage',
    shortDesc:
      'Wander the 16th-century walls and labyrinthine alleys of the inscribed UNESCO old town.',
    fullDesc: [
      'Harar Jugol, the fortified historic town of Harar, is enclosed by walls built between the 13th and 16th centuries. Its 368 alleyways squeezed into just one square kilometre form one of the most unique urban landscapes in the world.',
      'Stroll past whitewashed houses, brightly painted doors and tiny mosques tucked into corners — every turn reveals a piece of living history.',
      'Inscribed on the UNESCO World Heritage list in 2006, Jugol is considered the fourth holiest city of Islam, with 82 mosques and 102 shrines packed inside its walls.',
    ].join('\n\n'),
    isFeatured: true,
    isPublished: true,
    sortOrder: 0,
  },
  {
    slug: 'hyena-men',
    title: 'The Hyena Men of Harar',
    category: 'Wildlife',
    shortDesc:
      'Witness the centuries-old nightly ritual of feeding wild spotted hyenas by hand.',
    fullDesc: [
      'Just outside the city walls, as dusk falls, the legendary Hyena Men begin a ritual that has continued for generations — hand-feeding wild spotted hyenas raw meat, sometimes mouth-to-mouth.',
      'The tradition is believed to keep peace between the animals and the city — and an annual porridge ceremony predicts the year\'s harvest.',
      'Visitors can sit beside the feeders and even participate. It remains one of the most extraordinary wildlife encounters on Earth.',
    ].join('\n\n'),
    isFeatured: true,
    isPublished: true,
    sortOrder: 1,
  },
  {
    slug: 'mosques-shrines',
    title: 'Mosques & Sacred Shrines',
    category: 'Spiritual',
    shortDesc: "Discover the spiritual heart of Africa's fourth holiest Islamic city.",
    fullDesc: [
      'Harar is home to 82 mosques — three of which date from the 10th century — and over 100 shrines dedicated to local Muslim saints.',
      'The Grand Jami Mosque anchors the old city, while smaller neighbourhood mosques punctuate every quarter.',
      'Pilgrims from across the Horn of Africa visit shrines to honour saints such as Emir Nur and Sheikh Abadir, founder of the modern city.',
    ].join('\n\n'),
    isFeatured: false,
    isPublished: true,
    sortOrder: 2,
  },
  {
    slug: 'coffee-ceremony',
    title: 'Harar Coffee Ceremony',
    category: 'Culture',
    shortDesc: "Share the three-round ritual that birthed the world's beloved beverage.",
    fullDesc: [
      'Ethiopia is the birthplace of coffee, and Harar\'s longberry beans are among the most prized on Earth.',
      'A traditional ceremony unfolds over an hour — green beans roasted on coals, ground with mortar and pestle, and brewed three times in a clay jebena.',
      'Accompanied by popcorn, incense, and conversation, it remains the social heartbeat of every Harari household.',
    ].join('\n\n'),
    isFeatured: false,
    isPublished: true,
    sortOrder: 3,
  },
  {
    slug: 'markets',
    title: 'Vibrant Markets & Bazaars',
    category: 'Shopping',
    shortDesc:
      'From colourful basketry to silver jewellery — the markets of Harar are a feast for the senses.',
    fullDesc: [
      'The Shoa Gate market and the Christian market just outside the walls overflow with spices, textiles, and handwoven baskets in vivid colour.',
      'Harari women are famed for their basketry — a craft passed down for centuries and recognised as intangible heritage.',
      'Bargain gently, sip a cup of buna, and lose yourself in the rhythm of trade that has shaped the city for a thousand years.',
    ].join('\n\n'),
    isFeatured: false,
    isPublished: false,
    sortOrder: 4,
  },
  {
    slug: 'harar-museum',
    title: 'Harar Museum',
    category: 'History',
    shortDesc:
      "Inside the former home of Arthur Rimbaud — a poetic window into the city's past.",
    fullDesc: [
      "Housed in a beautifully restored Indian-style merchant villa, the Arthur Rimbaud Cultural Centre tells the story of the French poet's years in Harar.",
      'Exhibits include period photography, Harari artefacts, traditional costumes, and antique manuscripts.',
      'The top-floor balcony offers one of the finest views over the rooftops of Jugol.',
    ].join('\n\n'),
    isFeatured: false,
    isPublished: true,
    sortOrder: 5,
  },
] as const

export async function seedAttractions() {
  for (const row of ATTRACTION_SEEDS) {
    const existing = await db.query.attractions.findFirst({
      where: eq(attractions.slug, row.slug),
    })
    if (existing) {
      await db
        .update(attractions)
        .set({
          title: row.title,
          shortDesc: row.shortDesc,
          fullDesc: row.fullDesc,
          category: row.category,
          isFeatured: row.isFeatured,
          isPublished: row.isPublished,
          sortOrder: row.sortOrder,
          updatedAt: new Date(),
        })
        .where(eq(attractions.slug, row.slug))
    } else {
      await db.insert(attractions).values({
        title: row.title,
        slug: row.slug,
        shortDesc: row.shortDesc,
        fullDesc: row.fullDesc,
        category: row.category,
        isFeatured: row.isFeatured,
        isPublished: row.isPublished,
        sortOrder: row.sortOrder,
      })
    }
  }
  console.log('✓ Attractions seeded (6 items)')
}
