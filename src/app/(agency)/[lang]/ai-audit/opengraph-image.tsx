import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import {
  monochromeOgImage,
  ogContentType,
  ogSize,
} from "@/components/seo/monochromeOg";

export const alt = "AI Opportunity Audit";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function AiAuditOgImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = isLocale(lang) ? await getDictionary(lang) : null;
  return monochromeOgImage({
    title: dict?.aiAudit.hero.badge ?? "AI Opportunity Audit",
    kicker: dict?.aiAudit.hero.headline,
  });
}
