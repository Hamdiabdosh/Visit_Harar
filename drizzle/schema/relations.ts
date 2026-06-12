import { relations } from "drizzle-orm";
import { account, session, user } from "./auth";
import { attractions } from "./attractions";
import { announcements } from "./announcements";
import { auditLogs } from "./audit";
import { bookings } from "./bookings";
import { contactInfo } from "./contact";
import { galleryAlbums, galleryItems } from "./gallery";
import { guides } from "./guides";
import { heroContent } from "./hero";
import { mediaAssets } from "./media";
import { mapPlaces } from "./map-places";
import { pages } from "./pages";
import { siteSettings } from "./settings";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  attractionsCreated: many(attractions, { relationName: "createdBy" }),
  attractionsUpdated: many(attractions, { relationName: "updatedBy" }),
  galleryAlbums: many(galleryAlbums),
  galleryItems: many(galleryItems),
  announcementsCreated: many(announcements, { relationName: "createdBy" }),
  announcementsUpdated: many(announcements, { relationName: "updatedBy" }),
  guidesCreated: many(guides, { relationName: "createdBy" }),
  guidesUpdated: many(guides, { relationName: "updatedBy" }),
  bookingsUpdated: many(bookings),
  mediaAssets: many(mediaAssets),
  auditLogs: many(auditLogs),
  heroUpdates: many(heroContent),
  mapPlacesCreated: many(mapPlaces, { relationName: "createdBy" }),
  mapPlacesUpdated: many(mapPlaces, { relationName: "updatedBy" }),
  pagesUpdates: many(pages),
  contactUpdates: many(contactInfo),
  settingsUpdates: many(siteSettings),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const heroContentRelations = relations(heroContent, ({ one }) => ({
  updatedByUser: one(user, {
    fields: [heroContent.updatedBy],
    references: [user.id],
  }),
}));

export const attractionsRelations = relations(attractions, ({ one }) => ({
  createdByUser: one(user, {
    fields: [attractions.createdBy],
    references: [user.id],
    relationName: "createdBy",
  }),
  updatedByUser: one(user, {
    fields: [attractions.updatedBy],
    references: [user.id],
    relationName: "updatedBy",
  }),
}));

export const galleryAlbumsRelations = relations(
  galleryAlbums,
  ({ one, many }) => ({
    createdByUser: one(user, {
      fields: [galleryAlbums.createdBy],
      references: [user.id],
    }),
    items: many(galleryItems),
  }),
);

export const galleryItemsRelations = relations(galleryItems, ({ one }) => ({
  album: one(galleryAlbums, {
    fields: [galleryItems.albumId],
    references: [galleryAlbums.id],
  }),
  uploadedByUser: one(user, {
    fields: [galleryItems.uploadedBy],
    references: [user.id],
  }),
}));

export const mapPlacesRelations = relations(mapPlaces, ({ one }) => ({
  linkedAttraction: one(attractions, {
    fields: [mapPlaces.linkedAttractionId],
    references: [attractions.id],
  }),
  createdByUser: one(user, {
    fields: [mapPlaces.createdBy],
    references: [user.id],
    relationName: "createdBy",
  }),
  updatedByUser: one(user, {
    fields: [mapPlaces.updatedBy],
    references: [user.id],
    relationName: "updatedBy",
  }),
}));

export const pagesRelations = relations(pages, ({ one }) => ({
  updatedByUser: one(user, {
    fields: [pages.updatedBy],
    references: [user.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  createdByUser: one(user, {
    fields: [announcements.createdBy],
    references: [user.id],
    relationName: "createdBy",
  }),
  updatedByUser: one(user, {
    fields: [announcements.updatedBy],
    references: [user.id],
    relationName: "updatedBy",
  }),
}));

export const guidesRelations = relations(guides, ({ one, many }) => ({
  createdByUser: one(user, {
    fields: [guides.createdBy],
    references: [user.id],
    relationName: "createdBy",
  }),
  updatedByUser: one(user, {
    fields: [guides.updatedBy],
    references: [user.id],
    relationName: "updatedBy",
  }),
  bookings: many(bookings),
}));

export const contactInfoRelations = relations(contactInfo, ({ one }) => ({
  updatedByUser: one(user, {
    fields: [contactInfo.updatedBy],
    references: [user.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  guide: one(guides, { fields: [bookings.guideId], references: [guides.id] }),
  updatedByUser: one(user, {
    fields: [bookings.updatedBy],
    references: [user.id],
  }),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ one }) => ({
  uploadedByUser: one(user, {
    fields: [mediaAssets.uploadedBy],
    references: [user.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(user, { fields: [auditLogs.userId], references: [user.id] }),
}));

export const siteSettingsRelations = relations(siteSettings, ({ one }) => ({
  updatedByUser: one(user, {
    fields: [siteSettings.updatedBy],
    references: [user.id],
  }),
}));
