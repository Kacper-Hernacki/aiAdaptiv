import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";
import { locales, defaultLocale } from "@/i18n/config";

/**
 * Sitemap with hreflang alternates for every locale. As real routes are added
 * (e.g. /[lang]/blog), map them across locales the same way.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const languages = Object.fromEntries(
    locales.map((l) => [l, `${siteUrl}/${l}`]),
  );
  const termsLanguages = Object.fromEntries(
    locales.map((l) => [l, `${siteUrl}/${l}/terms`]),
  );

  return [
    ...locales.map(
      (lang): MetadataRoute.Sitemap[number] => ({
        url: `${siteUrl}/${lang}`,
        lastModified,
        changeFrequency: "weekly",
        priority: lang === defaultLocale ? 1 : 0.8,
        alternates: { languages },
      }),
    ),
    ...locales.map(
      (lang): MetadataRoute.Sitemap[number] => ({
        url: `${siteUrl}/${lang}/terms`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.3,
        alternates: { languages: termsLanguages },
      }),
    ),
  ];
}
