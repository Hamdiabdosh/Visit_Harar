export type AttractionCategory =
  | "Heritage"
  | "Wildlife"
  | "Spiritual"
  | "Culture"
  | "Shopping"
  | "History";

export const ATTRACTION_CATEGORIES: AttractionCategory[] = [
  "Heritage",
  "Wildlife",
  "Spiritual",
  "Culture",
  "Shopping",
  "History",
];

export const categoryColor: Record<AttractionCategory, string> = {
  Heritage: "bg-brand/10 text-brand",
  Wildlife: "bg-amber-100 text-amber-800",
  Spiritual: "bg-purple-100 text-purple-800",
  Culture: "bg-blue-100 text-blue-800",
  Shopping: "bg-teal-100 text-teal-800",
  History: "bg-red-100 text-red-800",
};

export const categoryGradient: Record<AttractionCategory, string> = {
  Heritage: "from-brand-dark via-brand to-cyan-400",
  Wildlife: "from-amber-900 via-orange-700 to-amber-500",
  Spiritual: "from-purple-900 via-purple-700 to-fuchsia-500",
  Culture: "from-blue-900 via-blue-700 to-sky-500",
  Shopping: "from-teal-900 via-teal-700 to-emerald-500",
  History: "from-red-900 via-rose-700 to-red-500",
};

export function isAttractionCategory(v: string): v is AttractionCategory {
  return ATTRACTION_CATEGORIES.includes(v as AttractionCategory);
}
