import Link from "next/link";
import type { LegalDocument } from "@/i18n/dictionaries";
import s from "./LegalPage.module.css";

/**
 * Renders a legal document (Terms, Privacy) for the agency site. Both pages
 * have the same shape, so they share one component and one stylesheet.
 */
export function LegalPage({ doc, lang }: { doc: LegalDocument; lang: string }) {
  return (
    <main id="main" className={s.page}>
      <article aria-labelledby="legal-heading" className={s.article}>
        <h1 id="legal-heading" className={s.h1}>
          {doc.h1}
        </h1>
        <p className={s.updated}>{doc.updated}</p>
        <p className={s.intro}>{doc.intro}</p>
        {doc.sections.map((section) => (
          <section key={section.h} className={s.section}>
            <h2 className={s.h2}>{section.h}</h2>
            {section.body.map((p, i) => (
              <p key={i} className={s.body}>
                {p}
              </p>
            ))}
          </section>
        ))}
        <Link href={`/${lang}`} className={s.back}>
          {doc.backHome}
        </Link>
      </article>
    </main>
  );
}
