import "dotenv/config";
import { seedEditor, seedSuperadmin } from "./seed-superadmin";
import { seedPages } from "./seed-pages";
import { seedSettings } from "./seed-settings";
import { seedAttractions } from "./seed-attractions";
import { seedContact } from "./seed-contact";
import { seedHero } from "./seed-hero";
import { seedGuides } from "./seed-guides";
import { seedAnnouncements } from "./seed-announcements";
import { seedGallery } from "./seed-gallery";
import { seedMapPlaces } from "./seed-map-places";
import { seedMediaImages } from "./seed-media-images";

async function main() {
  console.log("Running seeds…");
  await seedSuperadmin();
  await seedEditor();
  await seedPages();
  await seedContact();
  await seedSettings();
  await seedHero();
  await seedAttractions();
  await seedMapPlaces();
  await seedGuides();
  await seedAnnouncements();
  await seedGallery();
  await seedMediaImages();
  console.log("All seeds completed.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
