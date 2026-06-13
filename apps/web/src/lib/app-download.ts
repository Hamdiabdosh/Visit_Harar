/** Direct Android APK download (served from `public/downloads/`). Override via env if hosted elsewhere. */
export const ANDROID_APK_URL =
  (import.meta.env.VITE_ANDROID_APK_URL as string | undefined)?.trim() ||
  "/downloads/visit-harar.apk";

export const ANDROID_APK_FILENAME = "visit-harar.apk";
