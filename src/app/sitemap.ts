import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";
import { translatedLocales, defaultLocale } from "@/i18n/config";
import { caseStudies, caseStudyLocales } from "@/content/case-studies";

/**
 * Sitemap with hreflang alternates. Lists only canonical URLs, which means only
 * translated locales — untranslated ones serve English copy and canonicalize to
 * /en (see i18n/config.ts), so including them would just burn crawl budget on
 * duplicates. As real routes are added (e.g. /[lang]/blog), map them the same way.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  /** Alternates for one route, including the x-default Google expects
   *  alongside the per-language entries. */
  const alternatesFor = (path = "") => ({
    ...Object.fromEntries(
      translatedLocales.map((l) => [l, `${siteUrl}/${l}${path}`]),
    ),
    "x-default": `${siteUrl}/${defaultLocale}${path}`,
  });

  /** Case studies exist in fewer locales than the site (see
   *  content/case-studies), so they get their own alternate map. */
  const caseAlternatesFor = (path = "") => ({
    ...Object.fromEntries(
      caseStudyLocales.map((l) => [l, `${siteUrl}/${l}${path}`]),
    ),
    "x-default": `${siteUrl}/${defaultLocale}${path}`,
  });

  const languages = alternatesFor();
  const termsLanguages = alternatesFor("/terms");
  const privacyLanguages = alternatesFor("/privacy");
  const privateAiLanguages = alternatesFor("/private-ai");

  return [
    ...translatedLocales.map(
      (lang): MetadataRoute.Sitemap[number] => ({
        url: `${siteUrl}/${lang}`,
        lastModified,
        changeFrequency: "weekly",
        priority: lang === defaultLocale ? 1 : 0.8,
        alternates: { languages },
      }),
    ),
    ...translatedLocales.map(
      (lang): MetadataRoute.Sitemap[number] => ({
        url: `${siteUrl}/${lang}/private-ai`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: { languages: privateAiLanguages },
      }),
    ),
    ...caseStudyLocales.map(
      (lang): MetadataRoute.Sitemap[number] => ({
        url: `${siteUrl}/${lang}/case-studies`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages: caseAlternatesFor("/case-studies") },
      }),
    ),
    ...caseStudies.flatMap((study) =>
      caseStudyLocales.map(
        (lang): MetadataRoute.Sitemap[number] => ({
          url: `${siteUrl}/${lang}/case-studies/${study.slug}`,
          lastModified: new Date(study.completed),
          changeFrequency: "yearly",
          priority: 0.7,
          alternates: {
            languages: caseAlternatesFor(`/case-studies/${study.slug}`),
          },
        }),
      ),
    ),
    ...translatedLocales.map(
      (lang): MetadataRoute.Sitemap[number] => ({
        url: `${siteUrl}/${lang}/terms`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.3,
        alternates: { languages: termsLanguages },
      }),
    ),
    ...translatedLocales.map(
      (lang): MetadataRoute.Sitemap[number] => ({
        url: `${siteUrl}/${lang}/privacy`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.3,
        alternates: { languages: privacyLanguages },
      }),
    ),
  ];
}
