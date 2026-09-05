import type { MetadataRoute } from "next";
import { openllmUrl } from "@/config/site";
import { translatedLocales, defaultLocale } from "@/i18n/config";

/**
 * Sitemap for the open-LLM product site. Emitted at /openllm/sitemap.xml and
 * served as openllm.aiadaptiv.com/sitemap.xml by the host rewrite in
 * src/proxy.ts — hence absolute URLs built from `openllmUrl`, never `siteUrl`.
 *
 * Same rule as the root sitemap: only translated locales are listed, because
 * the other eight serve English copy and canonicalize to /en (i18n/config.ts).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const languages = Object.fromEntries(
    translatedLocales.map((l) => [l, `${openllmUrl}/${l}`]),
  );
  const termsLanguages = Object.fromEntries(
    translatedLocales.map((l) => [l, `${openllmUrl}/${l}/terms`]),
  );

  return [
    ...translatedLocales.map(
      (lang): MetadataRoute.Sitemap[number] => ({
        url: `${openllmUrl}/${lang}`,
        lastModified,
        changeFrequency: "weekly",
        priority: lang === defaultLocale ? 1 : 0.8,
        alternates: { languages },
      }),
    ),
    ...translatedLocales.map(
      (lang): MetadataRoute.Sitemap[number] => ({
        url: `${openllmUrl}/${lang}/terms`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.3,
        alternates: { languages: termsLanguages },
      }),
    ),
  ];
}
