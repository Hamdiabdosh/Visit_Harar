export type CultureSection = {
  title: string;
  body?: string;
  image?: string | null;
};
export type CultureFestival = {
  name: string;
  date: string;
  description: string;
};

export type CulturePageContent = {
  intro_text: string;
  sections: CultureSection[];
  festivals: CultureFestival[];
};

export const CULTURE_DEFAULT_CONTENT: CulturePageContent = {
  intro_text: `<p>Harar is not a museum behind glass — it is a city that breathes. From the vivid colours of traditional Harari dress to the aroma of freshly roasted coffee drifting from doorways, every lane carries stories passed down through generations.</p>
<p>Inside the walls of Jugol, faith, craft, and hospitality shape daily life. Visitors are welcomed into homes for the coffee ceremony, invited to night processions during major festivals, and surrounded by music, poetry, and communal feasts that have endured for centuries.</p>`,
  sections: [
    {
      title: "Coffee & Hospitality",
      body: `<p>Ethiopia is the birthplace of coffee, and Harar's longberry beans are among the most prized in the world. The traditional ceremony — roasting beans on coals, grinding with mortar and pestle, brewing three rounds in a clay jebena — remains the social heartbeat of every household.</p>
<p>Popcorn, incense, and conversation accompany each round. Sharing coffee is how Hararis greet guests, mark celebrations, and keep community ties alive.</p>`,
    },
    {
      title: "Dress, Craft & Daily Life",
      body: `<p>Harari women are renowned for their brightly coloured dress and intricate basketry, crafts recognised as intangible cultural heritage. Markets around the city gates overflow with spices, textiles, and handwoven goods.</p>
<p>Step into the old town and you will hear calls to prayer, see painted doors, and find workshops where skills learned from mothers and grandmothers are still practised today.</p>`,
    },
  ],
  festivals: [
    {
      name: "Ashura",
      date: "Islamic month of Muharram (dates vary)",
      description:
        "One of Harar's most important observances, marked with night processions, cultural exhibitions, and communal feasts across the old city gates.",
    },
    {
      name: "Shewal Eid",
      date: "After Ramadan (Islamic calendar)",
      description:
        "A distinctive Harari celebration with street gatherings, traditional dress, and shared meals that draw families and neighbours together.",
    },
    {
      name: "Eid al-Adha",
      date: "Dhu al-Hijjah (Islamic calendar)",
      description:
        "A city-wide celebration of sacrifice and charity, with prayers, visits between households, and generous hospitality toward guests.",
    },
    {
      name: "Meskel",
      date: "26–27 September",
      description:
        "The Finding of the True Cross — bonfires, processions, and flowers mark this beloved festival across Ethiopia, including gatherings in and around Harar.",
    },
    {
      name: "Harari New Year (Enkutatash)",
      date: "September",
      description:
        "The end of the rainy season brings spring festivals, children's songs, and family meals as Hararis welcome the new year.",
    },
  ],
};

export function isCultureContentEmpty(
  content: Record<string, unknown> | undefined | null,
): boolean {
  if (!content || Object.keys(content).length === 0) return true;
  const intro =
    typeof content.intro_text === "string"
      ? content.intro_text
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
      : "";
  const sections = Array.isArray(content.sections) ? content.sections : [];
  const festivals = Array.isArray(content.festivals) ? content.festivals : [];
  return !intro && sections.length === 0 && festivals.length === 0;
}
