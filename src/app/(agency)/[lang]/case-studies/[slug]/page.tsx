import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/i18n/config";
import {
  caseStudies,
  caseStudyLocales,
  getCaseCopy,
  getCaseStudy,
  getIndexCopy,
} from "@/content/case-studies";
import { CaseStudyPage } from "@/components/agency/CaseStudyPage";
import { legalMetadata } from "@/components/agency/legalMetadata";
import { BreadcrumbJsonLd, CaseStudyJsonLd } from "@/components/seo/JsonLd";

type PageParams = { params: Promise<{ lang: string; slug: string }> };

/** Every case in every locale: the ones without their own copy serve English
 *  and canonicalize to /en, the same rule the rest of the site follows. */
export function generateStaticParams() {
  return locales.flatMap((lang) =>
    caseStudies.map((study) => ({ lang, slug: study.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const study = getCaseStudy(slug);
  if (!study) return {};
  const copy = getCaseCopy(study, lang);
  return legalMetadata(
    { metaTitle: copy.metaTitle, metaDescription: copy.metaDescription },
    lang,
    `case-studies/${slug}`,
    caseStudyLocales,
  );
}

export default async function CaseStudyRoute({ params }: PageParams) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const study = getCaseStudy(slug);
  if (!study) notFound();
  const copy = getCaseCopy(study, lang);

  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
        trail={[
          { name: getIndexCopy(lang).h1, path: `/${lang}/case-studies` },
          { name: copy.title, path: `/${lang}/case-studies/${slug}` },
        ]}
      />
      <CaseStudyJsonLd
        lang={lang}
        path={`/${lang}/case-studies/${slug}`}
        headline={copy.title}
        description={copy.metaDescription}
        datePublished={study.completed}
        isDemonstration={study.kind === "reference"}
        image={study.image?.src}
      />
      <CaseStudyPage study={study} copy={copy} lang={lang} />
    </>
  );
}
