export const ABOUT_SEED_CONTENT = {
  intro_text: `<p>Harar Jugol is one of the world's most extraordinary walled cities — a living museum where centuries of Islamic scholarship, trade, and Harari culture continue inside 368 alleyways packed into a single square kilometre.</p><p>Known as the City of Saints and the fourth holiest city of Islam, Harar welcomes visitors to wander whitewashed lanes, share coffee ceremonies, and witness traditions that have endured for generations.</p>`,
  unesco_text: `<p>Inscribed on the UNESCO World Heritage List in 2006, Harar Jugol is recognised for its unique urban form, its remarkable density of mosques and shrines, and its role as a centre of Islamic learning and commerce in the Horn of Africa.</p><p>The five historic gates and the city walls — built between the 13th and 16th centuries — still frame daily life for families who have lived here for centuries.</p>`,
  geography_text: `<p>Harar lies on a plateau in eastern Ethiopia, roughly 525 km east of Addis Ababa and about 50 km from Dire Dawa. The city sits at around 1,885 metres above sea level, with a mild climate for much of the year.</p><p>Most visitors arrive via Dire Dawa's airport or railway station, then travel by road into the old city.</p>`,
  quick_facts: [
    { label: "Founded", value: "10th century (modern city)" },
    { label: "UNESCO", value: "World Heritage Site since 2006" },
    { label: "Mosques", value: "82 within the walls" },
    { label: "Population", value: "~25,000 inside Jugol" },
    { label: "Altitude", value: "1,885 m" },
    { label: "Best known for", value: "Coffee, hyenas, heritage walls" },
  ],
};

export const PLAN_SEED_CONTENT = {
  getting_here: `<p><strong>By air:</strong> Fly to Dire Dawa (DIR), then take a taxi or bureau-arranged transfer to Harar (about 1 hour).</p><p><strong>By rail:</strong> The Addis Ababa–Djibouti railway stops at Dire Dawa; onward road transfer is required.</p><p><strong>By road:</strong> From Addis Ababa, the journey takes roughly 8–10 hours by private car or bus.</p>`,
  best_time: `<p>October through March offers the most comfortable temperatures for walking the old city. Festival seasons — including Eid celebrations and the Harar Coffee Festival in July — are vibrant but busier.</p><p>Evenings are cool year-round; bring a light layer for hyena-feeding visits after dusk.</p>`,
  visa_info: `<p>Most international visitors require an Ethiopian tourist visa. Check current requirements with your embassy or apply online before travel. Keep passport copies and bureau contact details handy for tour bookings.</p>`,
  accommodation: `<p>Guesthouses and small hotels cluster inside and just outside Jugol's walls. The bureau can recommend licensed properties; book early during festival weekends and peak season (December–January).</p>`,
  itineraries: [
    {
      duration: "1 Day",
      title: "Essentials of Jugol",
      days: [
        "Morning: Jugol walls and Grand Jami Mosque quarter",
        "Afternoon: Markets, Rimbaud Museum, coffee ceremony",
        "Evening: Hyena feeding ritual outside the walls",
      ],
    },
    {
      duration: "2 Days",
      title: "Culture & Craft",
      days: [
        "Day 1: Heritage walk, shrines, and local lunch",
        "Day 2: Basket-weaving quarter, festivals calendar, gallery visit",
      ],
    },
    {
      duration: "3 Days",
      title: "Deep Harar",
      days: [
        "Day 1: Old city orientation with a licensed guide",
        "Day 2: Surrounding landscapes and craft workshops",
        "Day 3: Free exploration, bureau-facilitated guide booking",
      ],
    },
  ],
};

export function isAboutContentEmpty(content: Record<string, unknown>): boolean {
  const intro = content.intro_text;
  return typeof intro !== "string" || intro.trim().length === 0;
}

export function isPlanContentEmpty(content: Record<string, unknown>): boolean {
  const gettingHere = content.getting_here;
  return typeof gettingHere !== "string" || gettingHere.trim().length === 0;
}
