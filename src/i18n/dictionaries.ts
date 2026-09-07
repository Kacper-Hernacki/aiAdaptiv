import "server-only";
import type { Locale } from "./config";

/** Shape every dictionary must satisfy. Keeps translations in sync + type-safe. */
export type Dictionary = {
  skipToContent: string;
  cookies: {
    message: string;
    accept: string;
    decline: string;
    learnMore: string;
  };
  /**
   * Copy for the agency site. Any string still reading `TODO(copy):` is a
   * placeholder waiting on real company data — grep for it before launch.
   */
  agency: {
    meta: { title: string; description: string };
    header: {
      cta: string;
      /** Accessible name for the mobile hamburger button. */
      menuLabel: string;
      nav: { label: string; href: string }[];
    };
    /** Accessible label for the light/dark toggle. */
    theme: { toggle: string };
    hero: {
      eyebrow: string;
      /** The hook: symptoms the reader recognises, stacked above the headline. */
      questions: string[];
      /** Rendered as one `<h1>`; `accent` parts get emphasis styling. */
      headline: { text: string; accent?: boolean }[];
      /**
       * Endings that complete the headline, cycled every few seconds on the
       * client. The first one is what the server renders and what crawlers
       * read, so it must make the best complete sentence. Each should hold one
       * line on a phone.
       */
      rotating: string[];
      subhead: string;
      cta: string;
      stats: { value: string; label: string }[];
    };
    /** Label for the tech-stack marquee; the brands themselves are in
     *  components/agency/techLogos.ts. */
    tech: { label: string };
    capabilities: {
      h2: string;
      lead: string;
      items: {
        /** Stable, untranslated key; picks the card's artwork in capabilityImages.ts. */
        id: string;
        title: string;
        body: string;
        tags: string[];
      }[];
    };
    proof: {
      h2: string;
      body: string[];
      cta: string;
      /** Alt text for the section image. */
      mediaLabel: string;
    };
    work: {
      h2: string;
      lead: string;
      cases: {
        /** Stable, untranslated key; picks the card's image in workImages.ts. */
        id: string;
        name: string;
        result: string;
        body: string;
        tags: string[];
      }[];
    };
    /**
     * Cross-link band pointing at the open-LLM product on its subdomain,
     * carrying the product's own pitch — headline, subhead and pillars —
     * rather than a summary of it.
     */
    product: {
      /** Section label above the pitch. */
      h2: string;
      headline: string;
      lead: string;
      /** The liability angle: why a private platform, in one sentence. */
      why: string;
      pillars: { title: string; body: string }[];
      cta: string;
      imageAlt: string;
    };
    team: {
      h2: string;
      lead: string;
      /** Heading above a member's verifiable certifications. */
      licensesLabel: string;
      members: {
        /** Stable key; picks the photo in teamImages.ts. */
        id: string;
        name: string;
        role: string;
        body: string[];
        /** Each links to its public verification page. */
        licenses: { name: string; issuer: string; year: string; url: string }[];
      }[];
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
      heading: string;
      lead: string;
      cta: string;
      groups: { label: string; links: { label: string; href: string }[] }[];
      rights: string;
    };
    /**
     * Legal copy for the agency. Separate from the top-level `terms` tree,
     * which covers the open-LLM product's setup fee and monthly maintenance —
     * wrong for custom development work. Strings marked `TODO(legal):` need the
     * registered company details and a lawyer's confirmation.
     */
    legal: {
      /** Small print in the agency footer. */
      disclaimer: string;
      terms: LegalDocument;
      privacy: LegalDocument;
    };
  };
  /**
   * The private open-source-LLM offer, served at /[lang]/private-ai inside the
   * agency site. This is the former standalone landing page's copy, moved
   * under one key; the page is built with the agency's components.
   */
  privateAi: {
    meta: { title: string; description: string };
    tags: string[];
    cta: string;
    /** Alt text for the hero image. */
    imageLabel: string;
    /** Alt text for the deployment-flow sketch. */
    flowAlt: string;
    /** Loom walkthrough, loaded only when the visitor presses play. */
    video: {
      label: string;
      title: string;
      duration: string;
      cta: string;
      note: string;
    };
    hero: {
      badge: string;
      headline: { text: string; accent?: boolean }[];
      subhead: string;
      tagline: string;
      cta: string;
    };
    problem: { h2: string; points: string[] };
    solution: { h2: string; pillars: { title: string; body: string }[] };
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
    behindTheArchitecture: { h2: string; lead: string; body: string[] };
    faq: { h2: string; items: { q: string; a: string }[] };
    qualifier: {
      h2: string;
      yesLabel: string;
      yes: string;
      noLabel: string;
      no: string;
      cta: string;
    };
    backHome: string;
  };
};

/** Shape shared by the agency's Terms and Privacy pages. */
export type LegalDocument = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  updated: string;
  intro: string;
  sections: { h: string; body: string[] }[];
  backHome: string;
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
