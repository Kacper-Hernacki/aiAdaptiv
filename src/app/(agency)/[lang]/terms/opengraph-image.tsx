import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import {
  monochromeOgImage,
  ogContentType,
  ogSize,
} from "@/components/seo/monochromeOg";

export const alt = "Terms of use";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function TermsOgImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = isLocale(lang) ? await getDictionary(lang) : null;
  return monochromeOgImage({
    title: dict?.agency.legal.terms.h1 ?? "Terms of use",
  });
}
