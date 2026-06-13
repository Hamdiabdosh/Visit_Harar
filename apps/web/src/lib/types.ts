import type {
  announcements,
  attractions,
  auditLogs,
  bookings,
  contactInfo,
  galleryAlbums,
  galleryItems,
  guides,
  heroContent,
  mediaAssets,
  pages,
  siteSettings,
  user,
} from "../../../../drizzle/schema/index";

export type UserRole = "superadmin" | "editor";
export type BookingStatus = "Pending" | "Confirmed" | "Declined" | "Cancelled";
export type EventRegistrationStatus =
  | "Pending"
  | "Confirmed"
  | "Declined"
  | "Cancelled"
  | "CheckedIn";
export type TourDuration = "Half Day" | "Full Day" | "Multi Day";
export type MediaType = "image" | "video";
export type AnnouncementType = "News" | "Event" | "Notice";

export type User = Omit<typeof user.$inferSelect, "password">;
export type HeroContent = typeof heroContent.$inferSelect;
export type Attraction = typeof attractions.$inferSelect;
export type GalleryAlbum = typeof galleryAlbums.$inferSelect;
export type GalleryItem = typeof galleryItems.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type Guide = typeof guides.$inferSelect;
export type ContactInfo = typeof contactInfo.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};
