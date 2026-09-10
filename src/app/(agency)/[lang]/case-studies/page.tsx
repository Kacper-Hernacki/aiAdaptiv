import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { caseStudyLocales, getIndexCopy } from "@/content/case-studies";
import { CaseStudiesIndex } from "@/components/agency/CaseStudiesIndex";
import { legalMetadata } from "@/components/agency/legalMetadata";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

type PageParams = { params: Promise<{ lang: string }> };

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const copy = getIndexCopy(lang);
  return legalMetadata(
    { metaTitle: copy.metaTitle, metaDescription: copy.metaDescription },
    lang,
    "case-studies",
    caseStudyLocales,
  );
}

export default async function CaseStudies({ params }: PageParams) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const copy = getIndexCopy(lang);
  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
        trail={[{ name: copy.h1, path: `/${lang}/case-studies` }]}
      />
      <CaseStudiesIndex lang={lang} />
    </>
  );
}
