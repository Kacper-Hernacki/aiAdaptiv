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
    trust: string[];
  };
  howItWorks: {
    h2: string;
    intro: string;
    steps: { title: string; body: string }[];
    timeline: string;
    roadmap: {
      label: string;
      days: { label: string; body: string }[];
      resultLabel: string;
      result: string;
    };
    flowLabel: string;
    /** Pre-formatted text diagram; rendered verbatim in a <pre>. */
    flow: string;
    outro: string;
  };
  behindTheArchitecture: {
    h2: string;
    lead: string;
    body: string[];
  };
  faq: {
    h2: string;
    items: { q: string; a: string }[];
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
    nav: { eligibility: string; howItWorks: string; terms: string };
  };
  terms: {
    metaTitle: string;
    metaDescription: string;
    h1: string;
    updated: string;
    intro: string;
    sections: { h: string; body: string[] }[];
    backHome: string;
  };
  cookies: {
    message: string;
    accept: string;
    decline: string;
    learnMore: string;
  };
  /**
   * Copy for the agency site on the apex domain (app/(agency)/). Kept as one
   * subtree so the product-site keys above stay untouched. Any string still
   * reading `TODO(copy):` is a placeholder waiting on real company data — grep
   * for it before launch.
   */
  agency: {
    meta: { title: string; description: string };
    header: { tagline: string; cta: string; nav: { label: string; href: string }[] };
    hero: {
      eyebrow: string;
      /** Rendered as one `<h1>`; `accent` parts get emphasis styling. */
      headline: { text: string; accent?: boolean }[];
      subhead: string;
      cta: string;
      stats: { value: string; label: string }[];
    };
    clients: { label: string; names: string[] };
    capabilities: {
      h2: string;
      lead: string;
      items: { title: string; body: string; tags: string[] }[];
    };
    proof: {
      h2: string;
      body: string[];
      cta: string;
    };
    work: {
      h2: string;
      lead: string;
      cases: {
        name: string;
        result: string;
        body: string;
        tags: string[];
      }[];
    };
    /** Cross-link band pointing at the open-LLM product on its subdomain. */
    product: {
      h2: string;
      lead: string;
      points: string[];
      cta: string;
    };
    team: {
      h2: string;
      lead: string;
      members: { name: string; role: string; body: string[] }[];
    };
    approach: {
      h2: string;
      items: { title: string; body: string }[];
    };
    process: {
      h2: string;
      lead: string;
      steps: { step: string; title: string; body: string }[];
    };
    faq: {
      h2: string;
      items: { q: string; a: string }[];
    };
    contact: {
      h2: string;
      body: string;
      note: string;
      cta: string;
    };
    footer: {
      blurb: string;
      groups: { label: string; links: { label: string; href: string }[] }[];
      rights: string;
    };
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
