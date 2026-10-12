import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { AiAuditPage } from "@/components/agency/AiAuditPage";
import { legalMetadata } from "@/components/agency/legalMetadata";
import { BreadcrumbJsonLd, ServiceJsonLd } from "@/components/seo/JsonLd";

type PageParams = { params: Promise<{ lang: string }> };

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const { meta } = dict.aiAudit;
  return legalMetadata(
    { metaTitle: meta.title, metaDescription: meta.description },
    lang,
    "ai-audit",
  );
}

export default async function AiAudit({ params }: PageParams) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  
  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
        trail={[
          {
            name: dict.aiAudit.hero.badge,
            path: `/${lang}/ai-audit`,
          },
        ]}
      />
      <ServiceJsonLd
        lang={lang}
        service={{
          name: dict.aiAudit.hero.badge,
          description: dict.aiAudit.meta.description,
          provider: "aiAdaptiv",
          areaServed: "Worldwide",
          serviceType: "AI Consulting",
        }}
        offer={{
          name: dict.aiAudit.hero.badge,
          description: dict.aiAudit.hero.subhead,
          price: "690",
          priceCurrency: "USD",
        }}
      />
      <AiAuditPage doc={dict.aiAudit} lang={lang} />
    </>
  );
}
