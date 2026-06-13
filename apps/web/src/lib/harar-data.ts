export type Category =
  | "Heritage"
  | "Wildlife"
  | "Spiritual"
  | "Culture"
  | "Shopping"
  | "History";

export const categoryColor: Record<Category, string> = {
  Heritage: "bg-brand/10 text-brand",
  Wildlife: "bg-amber-100 text-amber-800",
  Spiritual: "bg-purple-100 text-purple-800",
  Culture: "bg-blue-100 text-blue-800",
  Shopping: "bg-teal-100 text-teal-800",
  History: "bg-red-100 text-red-800",
};

export const categoryGradient: Record<Category, string> = {
  Heritage: "from-brand-dark via-brand to-cyan-400",
  Wildlife: "from-amber-900 via-orange-700 to-amber-500",
  Spiritual: "from-purple-900 via-purple-700 to-fuchsia-500",
  Culture: "from-blue-900 via-blue-700 to-sky-500",
  Shopping: "from-teal-900 via-teal-700 to-emerald-500",
  History: "from-red-900 via-rose-700 to-red-500",
};

export interface Attraction {
  id: string;
  title: string;
  category: Category;
  short: string;
  full: string[];
  featured: boolean;
  published: boolean;
}

export const attractions: Attraction[] = [
  {
    id: "harar-jugol",
    title: "Harar Jugol Walled City",
    category: "Heritage",
    short:
      "Wander the 16th-century walls and labyrinthine alleys of the inscribed UNESCO old town.",
    full: [
      "Harar Jugol, the fortified historic town of Harar, is enclosed by walls built between the 13th and 16th centuries. Its 368 alleyways squeezed into just one square kilometre form one of the most unique urban landscapes in the world.",
      "Stroll past whitewashed houses, brightly painted doors and tiny mosques tucked into corners — every turn reveals a piece of living history.",
      "Inscribed on the UNESCO World Heritage list in 2006, Jugol is considered the fourth holiest city of Islam, with 82 mosques and 102 shrines packed inside its walls.",
    ],
    featured: true,
    published: true,
  },
  {
    id: "hyena-men",
    title: "The Hyena Men of Harar",
    category: "Wildlife",
    short:
      "Witness the centuries-old nightly ritual of feeding wild spotted hyenas by hand.",
    full: [
      "Just outside the city walls, as dusk falls, the legendary Hyena Men begin a ritual that has continued for generations — hand-feeding wild spotted hyenas raw meat, sometimes mouth-to-mouth.",
      "The tradition is believed to keep peace between the animals and the city — and an annual porridge ceremony predicts the year's harvest.",
      "Visitors can sit beside the feeders and even participate. It remains one of the most extraordinary wildlife encounters on Earth.",
    ],
    featured: true,
    published: true,
  },
  {
    id: "mosques-shrines",
    title: "Mosques & Sacred Shrines",
    category: "Spiritual",
    short:
      "Discover the spiritual heart of Africa's fourth holiest Islamic city.",
    full: [
      "Harar is home to 82 mosques — three of which date from the 10th century — and over 100 shrines dedicated to local Muslim saints.",
      "The Grand Jami Mosque anchors the old city, while smaller neighbourhood mosques punctuate every quarter.",
      "Pilgrims from across the Horn of Africa visit shrines to honour saints such as Emir Nur and Sheikh Abadir, founder of the modern city.",
    ],
    featured: false,
    published: true,
  },
  {
    id: "coffee-ceremony",
    title: "Harar Coffee Ceremony",
    category: "Culture",
    short:
      "Share the three-round ritual that birthed the world's beloved beverage.",
    full: [
      "Ethiopia is the birthplace of coffee, and Harar's longberry beans are among the most prized on Earth.",
      "A traditional ceremony unfolds over an hour — green beans roasted on coals, ground with mortar and pestle, and brewed three times in a clay jebena.",
      "Accompanied by popcorn, incense, and conversation, it remains the social heartbeat of every Harari household.",
    ],
    featured: false,
    published: true,
  },
  {
    id: "markets",
    title: "Vibrant Markets & Bazaars",
    category: "Shopping",
    short:
      "From colourful basketry to silver jewellery — the markets of Harar are a feast for the senses.",
    full: [
      "The Shoa Gate market and the Christian market just outside the walls overflow with spices, textiles, and handwoven baskets in vivid colour.",
      "Harari women are famed for their basketry — a craft passed down for centuries and recognised as intangible heritage.",
      "Bargain gently, sip a cup of buna, and lose yourself in the rhythm of trade that has shaped the city for a thousand years.",
    ],
    featured: false,
    published: false,
  },
  {
    id: "harar-museum",
    title: "Harar Museum",
    category: "History",
    short:
      "Inside the former home of Arthur Rimbaud — a poetic window into the city's past.",
    full: [
      "Housed in a beautifully restored Indian-style merchant villa, the Arthur Rimbaud Cultural Centre tells the story of the French poet's years in Harar.",
      "Exhibits include period photography, Harari artefacts, traditional costumes, and antique manuscripts.",
      "The top-floor balcony offers one of the finest views over the rooftops of Jugol.",
    ],
    featured: false,
    published: true,
  },
];

export interface Guide {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  years: number;
  license: string;
  languages: string[];
  specialties: string[];
  available: boolean;
  published: boolean;
  bio: string;
  phone: string;
  email: string;
}

export const guides: Guide[] = [
  {
    id: "ahmed-yusuf",
    name: "Ahmed Yusuf",
    initials: "AY",
    avatarColor: "bg-emerald-700",
    years: 8,
    license: "HRR-001",
    languages: ["English", "Arabic", "Harari"],
    specialties: ["History", "Hyena Tour", "Coffee Culture"],
    available: true,
    published: true,
    bio: "Born and raised inside the walls of Jugol, Ahmed has spent the last eight years guiding visitors from over forty countries through the alleyways of his ancestral city. He speaks fluent English, Arabic, and Harari, and is known for his deep knowledge of the city's Islamic heritage.",
    phone: "+251 91 234 5678",
    email: "ahmed@visitharar.gov.et",
  },
  {
    id: "fatima-hassan",
    name: "Fatima Hassan",
    initials: "FH",
    avatarColor: "bg-amber-700",
    years: 12,
    license: "HRR-002",
    languages: ["English", "Amharic", "Harari"],
    specialties: ["Architecture", "Crafts", "Women's Heritage"],
    available: true,
    published: true,
    bio: "Fatima is one of Harar's most experienced female guides, with a particular focus on traditional Harari architecture, basket weaving, and the role of women in the city's history.",
    phone: "+251 91 234 5679",
    email: "fatima@visitharar.gov.et",
  },
  {
    id: "ibrahim-ali",
    name: "Ibrahim Ali",
    initials: "IA",
    avatarColor: "bg-purple-700",
    years: 5,
    license: "HRR-003",
    languages: ["English", "Arabic"],
    specialties: ["Markets", "Food Tours", "Photography"],
    available: true,
    published: true,
    bio: "Ibrahim leads vibrant food and market tours, sharing the flavours of Harari cuisine — from hambasha bread to spicy fata.",
    phone: "+251 91 234 5680",
    email: "ibrahim@visitharar.gov.et",
  },
];

export interface Announcement {
  id: string;
  type: "News" | "Event" | "Notice";
  title: string;
  date: string;
  excerpt: string;
  pinned: boolean;
  cover: string; // gradient classes
}

export const announcements: Announcement[] = [
  {
    id: "eid-2026",
    type: "Event",
    title: "Eid al-Fitr Celebrations 2026",
    date: "May 30, 2026",
    excerpt:
      "Join the traditional Harari Eid celebrations across Jugol, with communal prayers at Grand Jami Mosque and street festivities.",
    pinned: true,
    cover: "from-gold to-amber-700",
  },
  {
    id: "new-guides",
    type: "News",
    title: "New Licensed Guides Program Launched",
    date: "May 22, 2026",
    excerpt:
      "The Commission has certified 12 new local guides specialising in heritage, wildlife, and cultural tours.",
    pinned: false,
    cover: "from-emerald-700 to-emerald-500",
  },
  {
    id: "wall-restoration",
    type: "Notice",
    title: "Jugol Wall Restoration Project Update",
    date: "May 18, 2026",
    excerpt:
      "Phase II of the wall stabilisation works begins in June. Visitors should expect minor diversions near Shoa Gate.",
    pinned: false,
    cover: "from-stone-700 to-stone-500",
  },
  {
    id: "coffee-festival",
    type: "Event",
    title: "Harar Coffee Festival 2026",
    date: "July 12, 2026",
    excerpt:
      "Three days of cuppings, ceremonies, and farm tours celebrating Harar longberry coffee.",
    pinned: false,
    cover: "from-amber-900 to-orange-600",
  },
  {
    id: "museum-hours",
    type: "Notice",
    title: "Updated Museum Opening Hours",
    date: "May 10, 2026",
    excerpt:
      "From June 1, the Rimbaud Museum will open daily from 8:30 AM to 6:00 PM.",
    pinned: false,
    cover: "from-rose-800 to-red-600",
  },
];

export const galleryAlbums = [
  {
    id: "jugol",
    title: "Harar Jugol Walls",
    count: 24,
    cover: "from-emerald-800 to-emerald-500",
  },
  {
    id: "hyena",
    title: "Hyena Night Ritual",
    count: 18,
    cover: "from-amber-900 to-orange-500",
  },
  {
    id: "markets",
    title: "Markets & Bazaars",
    count: 31,
    cover: "from-teal-800 to-cyan-500",
  },
  {
    id: "mosques",
    title: "Mosques & Shrines",
    count: 22,
    cover: "from-purple-800 to-fuchsia-500",
  },
  {
    id: "coffee",
    title: "Coffee Culture",
    count: 15,
    cover: "from-blue-800 to-sky-500",
  },
  {
    id: "festivals",
    title: "Festival Celebrations",
    count: 28,
    cover: "from-red-800 to-rose-500",
  },
];

export type BookingStatus = "Pending" | "Confirmed" | "Declined" | "Cancelled";

export const statusBadge: Record<BookingStatus, string> = {
  Pending: "bg-amber-100 text-amber-800 border-amber-200",
  Confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Declined: "bg-red-100 text-red-800 border-red-200",
  Cancelled: "bg-gray-100 text-gray-700 border-gray-200",
};

export interface Booking {
  ref: string;
  guideId: string;
  guideName: string;
  visitor: string;
  email: string;
  phone: string;
  country: string;
  flag: string;
  date: string;
  duration: "Half Day" | "Full Day" | "Multi Day";
  group: number;
  status: BookingStatus;
  submitted: string;
  notes: string;
}

export const bookings: Booking[] = [
  {
    ref: "HRR-2026-00142",
    guideId: "ahmed-yusuf",
    guideName: "Ahmed Yusuf",
    visitor: "John Smith",
    email: "john@example.com",
    phone: "+1 415 555 0192",
    country: "USA",
    flag: "🇺🇸",
    date: "Jun 15, 2026",
    duration: "Full Day",
    group: 2,
    status: "Pending",
    submitted: "May 28, 2026",
    notes: "Vegetarian lunch please.",
  },
  {
    ref: "HRR-2026-00141",
    guideId: "fatima-hassan",
    guideName: "Fatima Hassan",
    visitor: "Marie Dubois",
    email: "marie@example.fr",
    phone: "+33 6 12 34 56 78",
    country: "France",
    flag: "🇫🇷",
    date: "Jun 10, 2026",
    duration: "Half Day",
    group: 1,
    status: "Confirmed",
    submitted: "May 27, 2026",
    notes: "",
  },
  {
    ref: "HRR-2026-00140",
    guideId: "ibrahim-ali",
    guideName: "Ibrahim Ali",
    visitor: "Yuki Tanaka",
    email: "yuki@example.jp",
    phone: "+81 90 1234 5678",
    country: "Japan",
    flag: "🇯🇵",
    date: "Jun 08, 2026",
    duration: "Full Day",
    group: 4,
    status: "Pending",
    submitted: "May 26, 2026",
    notes: "Interested in photography spots.",
  },
  {
    ref: "HRR-2026-00139",
    guideId: "ahmed-yusuf",
    guideName: "Ahmed Yusuf",
    visitor: "Liam O'Brien",
    email: "liam@example.ie",
    phone: "+353 87 123 4567",
    country: "Ireland",
    flag: "🇮🇪",
    date: "Jun 05, 2026",
    duration: "Multi Day",
    group: 3,
    status: "Confirmed",
    submitted: "May 24, 2026",
    notes: "",
  },
  {
    ref: "HRR-2026-00138",
    guideId: "fatima-hassan",
    guideName: "Fatima Hassan",
    visitor: "Sofia Rossi",
    email: "sofia@example.it",
    phone: "+39 333 1234567",
    country: "Italy",
    flag: "🇮🇹",
    date: "May 30, 2026",
    duration: "Full Day",
    group: 2,
    status: "Confirmed",
    submitted: "May 20, 2026",
    notes: "",
  },
  {
    ref: "HRR-2026-00137",
    guideId: "ibrahim-ali",
    guideName: "Ibrahim Ali",
    visitor: "Hans Mueller",
    email: "hans@example.de",
    phone: "+49 170 1234567",
    country: "Germany",
    flag: "🇩🇪",
    date: "May 28, 2026",
    duration: "Half Day",
    group: 1,
    status: "Declined",
    submitted: "May 19, 2026",
    notes: "Guide unavailable on requested date.",
  },
  {
    ref: "HRR-2026-00136",
    guideId: "ahmed-yusuf",
    guideName: "Ahmed Yusuf",
    visitor: "Chen Wei",
    email: "chen@example.cn",
    phone: "+86 138 0000 1111",
    country: "China",
    flag: "🇨🇳",
    date: "May 25, 2026",
    duration: "Full Day",
    group: 5,
    status: "Confirmed",
    submitted: "May 15, 2026",
    notes: "",
  },
  {
    ref: "HRR-2026-00135",
    guideId: "fatima-hassan",
    guideName: "Fatima Hassan",
    visitor: "Amina Yusuf",
    email: "amina@example.ke",
    phone: "+254 712 345678",
    country: "Kenya",
    flag: "🇰🇪",
    date: "May 22, 2026",
    duration: "Multi Day",
    group: 2,
    status: "Cancelled",
    submitted: "May 12, 2026",
    notes: "Visitor cancelled trip.",
  },
  {
    ref: "HRR-2026-00134",
    guideId: "ahmed-yusuf",
    guideName: "Ahmed Yusuf",
    visitor: "Pedro Silva",
    email: "pedro@example.br",
    phone: "+55 11 91234 5678",
    country: "Brazil",
    flag: "🇧🇷",
    date: "May 20, 2026",
    duration: "Full Day",
    group: 2,
    status: "Confirmed",
    submitted: "May 10, 2026",
    notes: "",
  },
  {
    ref: "HRR-2026-00133",
    guideId: "ibrahim-ali",
    guideName: "Ibrahim Ali",
    visitor: "Sara Ahmed",
    email: "sara@example.ae",
    phone: "+971 50 123 4567",
    country: "UAE",
    flag: "🇦🇪",
    date: "May 18, 2026",
    duration: "Half Day",
    group: 3,
    status: "Confirmed",
    submitted: "May 08, 2026",
    notes: "",
  },
];

export const pendingCount = bookings.filter(
  (b) => b.status === "Pending",
).length;

export const recentActivity = [
  {
    color: "bg-emerald-500",
    text: 'Ahmed published "Hyena Men of Harar" attraction',
    user: "Ahmed Y.",
    time: "2h ago",
  },
  {
    color: "bg-blue-500",
    text: 'Fatima updated the "Markets & Bazaars" gallery album',
    user: "Fatima H.",
    time: "5h ago",
  },
  {
    color: "bg-amber-500",
    text: "New booking HRR-2026-00142 received from USA",
    user: "System",
    time: "1d ago",
  },
  {
    color: "bg-purple-500",
    text: "Settings updated — Booking system toggled ON",
    user: "Super Admin",
    time: "1d ago",
  },
  {
    color: "bg-emerald-500",
    text: 'Tigist published "Eid al-Fitr 2026" announcement',
    user: "Tigist B.",
    time: "2d ago",
  },
  {
    color: "bg-red-500",
    text: "Booking HRR-2026-00137 declined",
    user: "Super Admin",
    time: "3d ago",
  },
  {
    color: "bg-blue-500",
    text: "Hero section copy updated",
    user: "Super Admin",
    time: "3d ago",
  },
  {
    color: "bg-emerald-500",
    text: "New guide Ibrahim Ali added to directory",
    user: "Super Admin",
    time: "5d ago",
  },
];

export const auditEntries = [
  {
    time: "May 28, 14:32",
    user: "Super Admin",
    module: "hero",
    action: "published",
    record: "Homepage Hero",
  },
  {
    time: "May 28, 12:15",
    user: "Tigist Bekele",
    module: "attractions",
    action: "updated",
    record: "Harar Jugol",
  },
  {
    time: "May 28, 09:48",
    user: "Super Admin",
    module: "bookings",
    action: "confirmed",
    record: "HRR-2026-00141",
  },
  {
    time: "May 27, 17:02",
    user: "Tigist Bekele",
    module: "gallery",
    action: "uploaded",
    record: "Markets & Bazaars (3 photos)",
  },
  {
    time: "May 27, 11:30",
    user: "Super Admin",
    module: "guides",
    action: "created",
    record: "Ibrahim Ali",
  },
  {
    time: "May 26, 16:21",
    user: "Abdi Noor",
    module: "announcements",
    action: "published",
    record: "Coffee Festival 2026",
  },
  {
    time: "May 26, 10:05",
    user: "Super Admin",
    module: "settings",
    action: "updated",
    record: "Commission email",
  },
  {
    time: "May 25, 14:48",
    user: "Tigist Bekele",
    module: "pages",
    action: "updated",
    record: "About Harar",
  },
  {
    time: "May 25, 09:12",
    user: "Super Admin",
    module: "users",
    action: "created",
    record: "Abdi Noor",
  },
  {
    time: "May 24, 16:00",
    user: "Super Admin",
    module: "bookings",
    action: "declined",
    record: "HRR-2026-00137",
  },
];

export const mediaAssets = Array.from({ length: 18 }).map((_, i) => ({
  id: `asset-${i + 1}`,
  name:
    [
      "harar-wall",
      "jugol-alley",
      "hyena-night",
      "jami-mosque",
      "coffee-jebena",
      "market-spices",
    ][i % 6] + `-${String(i + 1).padStart(2, "0")}.jpg`,
  size: `${(1.2 + (i % 5) * 0.6).toFixed(1)} MB`,
  used: ["attractions", "gallery", "hero", "guides", "news", "pages"][i % 6],
  gradient: [
    "from-emerald-800 to-emerald-400",
    "from-amber-800 to-amber-400",
    "from-purple-800 to-purple-400",
    "from-blue-800 to-blue-400",
    "from-teal-800 to-teal-400",
    "from-rose-800 to-rose-400",
  ][i % 6],
}));
