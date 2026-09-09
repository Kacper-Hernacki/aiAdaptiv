import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { LegalPage } from "@/components/agency/LegalPage";
import { legalMetadata } from "@/components/agency/legalMetadata";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

type PageParams = { params: Promise<{ lang: string }> };

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return legalMetadata(dict.agency.legal.privacy, lang, "privacy");
}

export default async function PrivacyPage({ params }: PageParams) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
        trail={[{ name: dict.agency.legal.privacy.h1, path: `/${lang}/privacy` }]}
      />
      <LegalPage doc={dict.agency.legal.privacy} lang={lang} />
    </>
  );
}
