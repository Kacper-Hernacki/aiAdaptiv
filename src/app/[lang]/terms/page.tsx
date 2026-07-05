import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, defaultLocale, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { siteUrl } from "@/config/site";
import s from "./Terms.module.css";

type PageParams = { params: Promise<{ lang: string }> };

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const dict = await getDictionary(lang);

  const languages: Record<string, string> = Object.fromEntries(
    locales.map((l) => [l, `/${l}/terms`]),
  );
  languages["x-default"] = `/${defaultLocale}/terms`;

  return {
    metadataBase: new URL(siteUrl),
    title: { absolute: dict.terms.metaTitle },
    description: dict.terms.metaDescription,
    alternates: {
      canonical: `/${lang}/terms`,
      languages,
    },
  };
}

export default async function TermsPage({ params }: PageParams) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const { terms } = dict;

  return (
    <main id="main" className={s.page}>
      <article aria-labelledby="terms-heading" className={s.article}>
        <h1 id="terms-heading" className={s.h1}>
          {terms.h1}
        </h1>
        <p className={s.updated}>{terms.updated}</p>
        <p className={s.intro}>{terms.intro}</p>
        {terms.sections.map((section) => (
          <section key={section.h} className={s.section}>
            <h2 className={s.h2}>{section.h}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className={s.body}>
                {paragraph}
              </p>
            ))}
          </section>
        ))}
        <p>
          <Link href={`/${lang}`} className={s.back}>
            {terms.backHome}
          </Link>
        </p>
      </article>
    </main>
  );
}
