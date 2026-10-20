import type { Metadata } from "next";
import { siteConfig, siteUrl } from "@/config/site";
import { translatedLocales, defaultLocale, isTranslated } from "@/i18n/config";

/**
 * Canonical + hreflang for a sub-route, following the same rule as every other
 * page: only locales that carry this route's copy are their own indexable
 * version, the rest canonicalize to English (see i18n/config.ts). Used by the
 * legal pages, the private AI page and the case studies.
 *
 * `covered` narrows that set for routes translated into fewer locales than the
 * site — case studies are written in English and Polish only, so the other
 * eight must not claim to be distinct language versions of them.
 */
export function legalMetadata(
  doc: { metaTitle: string; metaDescription: string },
  lang: string,
  route: string,
  covered: readonly string[] = translatedLocales,
): Metadata {
  const languages: Record<string, string> = Object.fromEntries(
    covered.map((l) => [l, `/${l}/${route}`]),
  );
  languages["x-default"] = `/${defaultLocale}/${route}`;

  const self =
    covered === translatedLocales
      ? isTranslated(lang as never)
      : covered.includes(lang);

  const url = self ? `/${lang}/${route}` : `/${defaultLocale}/${route}`;

  return {
    metadataBase: new URL(siteUrl),
    title: { absolute: doc.metaTitle },
    description: doc.metaDescription,
    alternates: { canonical: url, languages },
    // Title/description must be set here or a shared link shows the home
    // headline. Do NOT set `images`: this object replaces the layout OG
    // block, and an explicit `images` field (even a guessed `/opengraph-image`
    // path) would hide the file-based 1200×630 PNG Next generates from
    // `opengraph-image.tsx` on this route.
    openGraph: {
      type: "article",
      url,
      siteName: siteConfig.name,
      title: doc.metaTitle,
      description: doc.metaDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: doc.metaTitle,
      description: doc.metaDescription,
    },
  };
}
