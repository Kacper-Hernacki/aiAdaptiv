import { isLocale, locales } from "@/i18n/config";
import { getIndexCopy } from "@/content/case-studies";
import {
  monochromeOgImage,
  ogContentType,
  ogSize,
} from "@/components/seo/monochromeOg";

export const alt = "Case studies";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function CaseStudiesOgImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const copy = isLocale(lang) ? getIndexCopy(lang) : undefined;
  return monochromeOgImage({
    title: copy?.h1 ?? "Case studies",
    kicker: copy?.kicker,
  });
}
