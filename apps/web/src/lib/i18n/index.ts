import { am } from "./am";
import { en } from "./en";
import type { Locale, TranslationKey } from "./types";

const catalogs: Record<Locale, typeof en> = { en, am };

export function translate(locale: Locale, key: TranslationKey): string {
  return catalogs[locale][key] ?? catalogs.en[key] ?? key;
}

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "am";
}

export const LOCALE_STORAGE_KEY = "visit-harar-locale";

export { en, am };
export type { Locale, TranslationKey };
