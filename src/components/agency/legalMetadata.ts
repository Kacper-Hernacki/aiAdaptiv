import type { Metadata } from "next";
import { siteUrl } from "@/config/site";
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

  return {
    metadataBase: new URL(siteUrl),
    title: { absolute: doc.metaTitle },
    description: doc.metaDescription,
    alternates: {
      canonical: self ? `/${lang}/${route}` : `/${defaultLocale}/${route}`,
      languages,
    },
  };
}
