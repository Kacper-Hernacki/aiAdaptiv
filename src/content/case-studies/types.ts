import type { Locale } from "@/i18n/config";

/**
 * Case studies live here rather than in the dictionaries because they are a
 * growing collection, not page copy: one entry per case, translated only into
 * the locales we actually have copy for. Putting them in `Dictionary` would
 * force all ten locales to carry every future case.
 */

/**
 * `client` = built for a paying client, with their outcome.
 * `reference` = our own build. Labelled as such on the page, never dressed up
 * as client work — see the disclaimer block every entry must carry.
 */
export type CaseStudyKind = "client" | "reference";

export type CaseStudyCopy = {
  metaTitle: string;
  metaDescription: string;
  /** Badge above the title, e.g. "Reference build". Says what this is. */
  kindLabel: string;
  title: string;
  /** One paragraph under the title: what it is, in the reader's terms. */
  deck: string;
  /** The facts strip — client, sector, period, where it runs. */
  facts: { label: string; value: string }[];
  /** The numbers. `note` carries the caveat when one is needed. */
  metrics: { value: string; label: string; note?: string }[];
  sections: { h: string; paragraphs: string[]; bullets?: string[] }[];
  /** The single sentence the case is built around. */
  pull: string;
  /** The evidence block. `alt` describes the image; omitted for a video. */
  proof: {
    /** Short heading for the evidence band. */
    label: string;
    caption: string;
    alt?: string;
    /** Click-to-load Loom walkthrough, when the proof is a recording. */
    video?: {
      label: string;
      title: string;
      duration: string;
      cta: string;
      note: string;
    };
  };
  /** What we deliberately do not claim. Non-negotiable on every case. */
  disclaimer: { h: string; body: string };
  cta: { h: string; body: string; button: string };
  backLabel: string;
};

export type CaseStudy = {
  /** URL segment, never translated. */
  slug: string;
  kind: CaseStudyKind;
  /** Card image / proof image in `public/`. */
  image?: { src: string; width: number; height: number };
  /** Loom id, when the proof is a recorded walkthrough rather than an image. */
  loomId?: string;
  /** ISO date the work finished — feeds `datePublished` in JSON-LD. */
  completed: string;
  /** Ties the case to a card id in `agency.work.cases` (workImages.ts). */
  workId?: string;
  copy: Partial<Record<Locale, CaseStudyCopy>>;
};
