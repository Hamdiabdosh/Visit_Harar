import type { ApiResponse, Paginated, PublicPageKey } from "@visit-harar/shared";

export type AttractionSummary = {
  id: string;
  title: string;
  slug: string;
  short_desc: string | null;
  full_desc?: string | null;
  image: string | null;
  category: string;
  is_featured: boolean;
  latitude?: number | null;
  longitude?: number | null;
  opening_hours?: string | null;
  best_time_to_visit?: string | null;
  visitor_tips?: string | null;
  audio_url?: string | null;
};

export type GuideSummary = {
  id: string;
  name: string;
  slug: string;
  photo: string | null;
  bio: string | null;
  languages: string[];
  specialties: string[];
  is_available: boolean;
};

export type MapPoi = {
  id: string;
  title: string;
  slug: string;
  category: string;
  short_desc: string | null;
  image: string | null;
  latitude: number | null;
  longitude: number | null;
  is_featured: boolean;
};

export type ItinerarySummary = {
  id: string;
  title: string;
  slug: string;
  duration: string;
  summary: string | null;
  days: {
    label: string;
    items: { title: string; description?: string; attraction_slug?: string }[];
  }[];
};

export type AnnouncementSummary = {
  id: string;
  title: string;
  slug: string;
  type: string;
  body: string | null;
  cover_image: string | null;
  event_date: string | null;
  event_location: string | null;
  published_at: string | null;
  registration_enabled?: boolean;
  registration?: {
    registration_enabled: boolean;
    registration_capacity: number | null;
    registration_deadline: string | null;
    registration_note: string | null;
    registered_count: number;
    spots_remaining: number | null;
    registration_open: boolean;
  } | null;
};

export type BookingInput = {
  guide_id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone?: string;
  visitor_country: string;
  tour_date: string;
  tour_duration: "Half Day" | "Full Day" | "Multi Day";
  group_size: number;
  special_requests?: string;
};

export type PushRegisterInput = {
  expo_push_token: string;
  visitor_email?: string;
  notify_bookings?: boolean;
  notify_events?: boolean;
  platform?: "ios" | "android" | "web";
};

export type PushUnregisterInput = {
  expo_push_token: string;
};

export type BookingStatusInput = {
  booking_ref: string;
  visitor_email: string;
};

export type BookingStatus = {
  booking_ref: string;
  status: string;
  guide_name: string;
  tour_date: string;
  tour_duration: string;
  group_size: number;
  status_note: string | null;
};

export type SearchResult = {
  query: string;
  results: {
    type: string;
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    href: string;
    meta?: string;
  }[];
};

export type ApiClientOptions = {
  baseUrl: string;
  fetch?: typeof fetch;
};

export class VisitHararApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "VisitHararApiError";
  }
}

export class VisitHararApi {
  private baseUrl: string;
  private fetchFn: typeof fetch;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.fetchFn = options.fetch ?? fetch;
  }

  private async request<T>(
    path: string,
    init?: RequestInit,
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v1${path.startsWith("/") ? path : `/${path}`}`;
    const res = await this.fetchFn(url, {
      ...init,
      headers: {
        accept: "application/json",
        ...(init?.body ? { "content-type": "application/json" } : {}),
        ...init?.headers,
      },
    });

    const json = (await res.json()) as ApiResponse<T>;
    if (!res.ok || !json.ok) {
      const err = !json.ok ? json.error : { code: "HTTP_ERROR", message: res.statusText };
      throw new VisitHararApiError(err.code, err.message, res.status);
    }
    return json.data;
  }

  index() {
    return this.request<{ name: string; version: string; endpoints: string[] }>("/");
  }

  getAttractions() {
    return this.request<AttractionSummary[]>("/attractions");
  }

  getAttraction(slug: string) {
    return this.request<AttractionSummary>(`/attractions/${encodeURIComponent(slug)}`);
  }

  getGuides() {
    return this.request<GuideSummary[]>("/guides");
  }

  getGuide(slug: string) {
    return this.request<GuideSummary>(`/guides/${encodeURIComponent(slug)}`);
  }

  getMapPois() {
    return this.request<MapPoi[]>("/map/pois");
  }

  getItineraries() {
    return this.request<ItinerarySummary[]>("/itineraries");
  }

  getItinerary(slug: string) {
    return this.request<ItinerarySummary>(
      `/itineraries/${encodeURIComponent(slug)}`,
    );
  }

  getAnnouncements(params?: { page?: number; per_page?: number; type?: string }) {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.per_page) q.set("per_page", String(params.per_page));
    if (params?.type) q.set("type", params.type);
    const qs = q.toString();
    return this.request<Paginated<AnnouncementSummary>>(
      `/announcements${qs ? `?${qs}` : ""}`,
    );
  }

  getAnnouncement(slug: string) {
    return this.request<AnnouncementSummary>(
      `/announcements/${encodeURIComponent(slug)}`,
    );
  }

  getPage(key: PublicPageKey) {
    return this.request<Record<string, unknown>>(`/pages/${key}`);
  }

  search(q: string, limit = 15) {
    return this.request<SearchResult>(
      `/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    );
  }

  createBooking(input: BookingInput) {
    return this.request<{ booking_ref: string }>("/bookings", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  getBookingStatus(input: BookingStatusInput) {
    return this.request<BookingStatus>("/bookings/status", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  getBookingEnabled() {
    return this.request<{ enabled: boolean }>("/bookings/enabled");
  }

  registerPush(input: PushRegisterInput) {
    return this.request<{ ok: true }>("/push/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  unregisterPush(input: PushUnregisterInput) {
    return this.request<{ ok: true }>("/push/unregister", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  getPushEnabled() {
    return this.request<{ enabled: boolean }>("/push/enabled");
  }
}

export function createApiClient(baseUrl: string, fetchFn?: typeof fetch) {
  return new VisitHararApi({ baseUrl, fetch: fetchFn });
}
