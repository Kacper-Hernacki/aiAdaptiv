import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { PrivateAiPage } from "@/components/agency/PrivateAiPage";
import { legalMetadata } from "@/components/agency/legalMetadata";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

type PageParams = { params: Promise<{ lang: string }> };

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const { meta } = dict.privateAi;
  return legalMetadata(
    { metaTitle: meta.title, metaDescription: meta.description },
    lang,
    "private-ai",
  );
}

export default async function PrivateAi({ params }: PageParams) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
        // The badge reads "Private AI platform · Open-source LLMs in your own
        // cloud"; a crumb wants the name, not the strapline.
        trail={[
          {
            name: dict.privateAi.hero.badge.split("·")[0].trim(),
            path: `/${lang}/private-ai`,
          },
        ]}
      />
      <PrivateAiPage doc={dict.privateAi} lang={lang} />
    </>
  );
}
