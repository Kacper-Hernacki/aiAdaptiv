/**
 * Locale routing configuration. The app routes every page under /[lang]
 * (e.g. /en, /pl, /de). Add a locale here + a dictionary file in
 * src/i18n/dictionaries/ to enable it.
 */

export const locales = [
  "en", // English
  "pl", // Polski
  "de", // Deutsch
  "no", // Norsk
  "it", // Italiano
  "fr", // Français
  "es", // Español
  "pt", // Português
  "cs", // Čeština
  "sk", // Slovenčina
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Native language names — used for the language switcher. */
export const localeNames: Record<Locale, string> = {
  en: "English",
  pl: "Polski",
  de: "Deutsch",
  no: "Norsk",
  it: "Italiano",
  fr: "Français",
  es: "Español",
  pt: "Português",
  cs: "Čeština",
  sk: "Slovenčina",
};

/** Open Graph `og:locale` values (BCP-47 with region). */
export const ogLocales: Record<Locale, string> = {
  en: "en_US",
  pl: "pl_PL",
  de: "de_DE",
  no: "nb_NO",
  it: "it_IT",
  fr: "fr_FR",
  es: "es_ES",
  pt: "pt_PT",
  cs: "cs_CZ",
  sk: "sk_SK",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
