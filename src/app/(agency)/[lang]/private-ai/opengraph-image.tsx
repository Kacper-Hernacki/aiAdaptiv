import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import {
  monochromeOgImage,
  ogContentType,
  ogSize,
} from "@/components/seo/monochromeOg";

export const alt = "Private AI platform";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function PrivateAiOgImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = isLocale(lang) ? await getDictionary(lang) : null;
  const badge = dict?.privateAi.hero.badge ?? "Private AI platform";
  return monochromeOgImage({
    title: badge.split("·")[0].trim(),
    kicker: dict?.privateAi.hero.headline.map((part) => part.text).join(" "),
  });
}
