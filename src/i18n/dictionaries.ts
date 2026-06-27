import "server-only";
import type { Locale } from "./config";

/** Shape every dictionary must satisfy. Keeps translations in sync + type-safe. */
export type Dictionary = {
  meta: { title: string; description: string };
  skipToContent: string;
  header: { cta: string };
  hero: {
    h1: string;
    subhead: string;
    cta: string;
    trust: string[];
  };
  problem: {
    h2: string;
    subhead: string;
    points: { title: string; body: string }[];
  };
  solution: {
    h2: string;
    subhead: string;
    pillars: { title: string; body: string }[];
  };
  process: {
    h2: string;
    steps: { title: string; body: string }[];
  };
  finalCta: {
    h2: string;
    body: string;
    cta: string;
  };
  footer: {
    rights: string;
    languageLabel: string;
  };
};

/**
 * Dictionary loaders. Locales without their own JSON file fall back to English
 * so every route renders. Replace the `en` fallback with a dedicated file
 * (e.g. ./dictionaries/de.json) as translations are completed.
 */
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  pl: () => import("./dictionaries/pl.json").then((m) => m.default),
  // TODO: translate — currently served in English.
  de: () => import("./dictionaries/en.json").then((m) => m.default),
  no: () => import("./dictionaries/en.json").then((m) => m.default),
  it: () => import("./dictionaries/en.json").then((m) => m.default),
  fr: () => import("./dictionaries/en.json").then((m) => m.default),
  es: () => import("./dictionaries/en.json").then((m) => m.default),
  pt: () => import("./dictionaries/en.json").then((m) => m.default),
  cs: () => import("./dictionaries/en.json").then((m) => m.default),
  sk: () => import("./dictionaries/en.json").then((m) => m.default),
};

export const getDictionary = (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();
