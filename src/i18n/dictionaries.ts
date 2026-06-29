import "server-only";
import type { Locale } from "./config";

/** Shape every dictionary must satisfy. Keeps translations in sync + type-safe. */
export type Dictionary = {
  meta: { title: string; description: string };
  skipToContent: string;
  header: { programLabel: string; cta: string };
  hero: {
    badge: string;
    /** Headline rendered as one `<h1>`; `accent` parts get emphasis styling. */
    headline: { text: string; accent?: boolean }[];
    subhead: string;
    tagline: string;
    cta: string;
  };
  problem: {
    h2: string;
    points: string[];
  };
  solution: {
    h2: string;
    pillars: { title: string; body: string }[];
  };
  pricing: {
    h2: string;
    plans: { label: string; price: string }[];
    note: string;
  };
  howItWorks: {
    h2: string;
    intro: string;
    steps: { title: string; body: string }[];
    flowLabel: string;
    /** Pre-formatted text diagram; rendered verbatim in a <pre>. */
    flow: string;
    outro: string;
  };
  qualifier: {
    h2: string;
    yesLabel: string;
    yes: string;
    noLabel: string;
    no: string;
    cta: string;
  };
  footer: {
    rights: string;
    languageLabel: string;
    disclaimer: string;
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
