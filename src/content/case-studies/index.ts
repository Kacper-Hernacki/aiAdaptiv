import type { Locale } from "@/i18n/config";
import { defaultLocale } from "@/i18n/config";
import type { CaseStudy, CaseStudyCopy } from "./types";
import { secondBrain } from "./second-brain";
import { meridian } from "./meridian";
import { oneRepo } from "./one-repo";
import { pocketAgent } from "./pocket-agent";
import { n8nTemplates } from "./n8n-templates";
import { ownInfrastructure } from "./own-infrastructure";

export type { CaseStudy, CaseStudyCopy } from "./types";

/** Newest first — this is the order the index page renders. */
export const caseStudies: CaseStudy[] = [
  oneRepo,
  ownInfrastructure,
  n8nTemplates,
  pocketAgent,
  secondBrain,
  meridian,
];

/**
 * Locales a case study is written in. Unlike the rest of the site, cases are
 * NOT translated into all ten: a locale outside this list serves the English
 * case and canonicalizes to /en, exactly as untranslated locales do elsewhere
 * (see i18n/config.ts). Add a locale here once every case carries its copy.
 */
export const caseStudyLocales = [
  "en",
  "pl",
] as const satisfies readonly Locale[];

export function hasCaseStudyCopy(locale: Locale): boolean {
  return (caseStudyLocales as readonly Locale[]).includes(locale);
}

/** The locale a case renders in — its own, or English as the fallback. */
export function caseStudyLocale(locale: Locale): Locale {
  return hasCaseStudyCopy(locale) ? locale : defaultLocale;
}

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}

/** Copy for a case in the closest available locale. English always exists. */
export function getCaseCopy(study: CaseStudy, locale: Locale): CaseStudyCopy {
  return study.copy[caseStudyLocale(locale)] ?? study.copy[defaultLocale]!;
}

/** Index-page chrome. Kept beside the cases so a new locale is one edit. */
export const caseIndexCopy: Record<
  (typeof caseStudyLocales)[number],
  {
    metaTitle: string;
    metaDescription: string;
    h1: string;
    lead: string;
    kicker: string;
    readLabel: string;
  }
> = {
  en: {
    metaTitle: "Case studies — what we built and what it changed | aiAdaptiv",
    metaDescription:
      "Systems we designed, built and run — with the numbers behind them, counted rather than estimated, and a plain note on what each case does not claim.",
    h1: "Case studies",
    lead: "Every number on these pages was counted, not estimated. Where a case is our own build rather than client work, it says so at the top.",
    kicker: "Selected work, in detail",
    readLabel: "Read the case",
  },
  pl: {
    metaTitle: "Case studies — co zbudowaliśmy i co to zmieniło | aiAdaptiv",
    metaDescription:
      "Systemy, które zaprojektowaliśmy, zbudowaliśmy i utrzymujemy — z liczbami policzonymi, a nie oszacowanymi, i z jasną notą, czego każdy case nie twierdzi.",
    h1: "Case studies",
    lead: "Każda liczba na tych stronach została policzona, nie oszacowana. Jeśli case jest naszym własnym buildem, a nie wdrożeniem u klienta, pisze to na samej górze.",
    kicker: "Realizacje w szczegółach",
    readLabel: "Przeczytaj case",
  },
};

export function getIndexCopy(locale: Locale) {
  return caseIndexCopy[
    caseStudyLocale(locale) as (typeof caseStudyLocales)[number]
  ];
}
