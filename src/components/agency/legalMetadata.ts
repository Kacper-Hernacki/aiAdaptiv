import type { Metadata } from "next";
import { siteUrl } from "@/config/site";
import { translatedLocales, defaultLocale, isTranslated } from "@/i18n/config";
import type { LegalDocument } from "@/i18n/dictionaries";

/**
 * Canonical + hreflang for a legal route, following the same rule as every
 * other page: only translated locales are their own indexable version, the
 * rest canonicalize to English (see i18n/config.ts).
 */
export function legalMetadata(
  doc: LegalDocument,
  lang: string,
  route: string,
): Metadata {
  const languages: Record<string, string> = Object.fromEntries(
    translatedLocales.map((l) => [l, `/${l}/${route}`]),
  );
  languages["x-default"] = `/${defaultLocale}/${route}`;

  return {
    metadataBase: new URL(siteUrl),
    title: { absolute: doc.metaTitle },
    description: doc.metaDescription,
    alternates: {
      canonical: isTranslated(lang as never)
        ? `/${lang}/${route}`
        : `/${defaultLocale}/${route}`,
      languages,
    },
  };
}
