import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { caseStudies, getCaseCopy, getIndexCopy } from "@/content/case-studies";
import s from "./Agency.module.css";
import c from "./CaseStudyPage.module.css";

/**
 * The case-study index. Each row leads with what the case is (client work or
 * our own build), then its two headline numbers — so a reader can tell the
 * difference before clicking, which is the whole point of labelling them.
 */
export function CaseStudiesIndex({ lang }: { lang: Locale }) {
  const copy = getIndexCopy(lang);

  return (
    <main id="main">
      <section aria-labelledby="cases-heading" className={s.section}>
        <div className={s.inner}>
          <div className={s.titleWrap}>
            <p className={s.super}>{copy.kicker}</p>
            <h1 id="cases-heading" className={s.h1} data-reveal>
              {copy.h1}
            </h1>
            <p
              className={s.lead}
              data-reveal
              style={{ "--rd": "80ms" } as React.CSSProperties}
            >
              {copy.lead}
            </p>
          </div>

          <ul className={c.list}>
            {caseStudies.map((study, i) => {
              const cs = getCaseCopy(study, lang);
              const href = `/${lang}/case-studies/${study.slug}`;
              return (
                <li
                  key={study.slug}
                  className={c.item}
                  data-reveal
                  style={{ "--rd": `${120 + i * 90}ms` } as React.CSSProperties}
                >
                  <div>
                    <p className={s.super}>{cs.kindLabel}</p>
                    <h2 className={c.itemTitle}>
                      <Link href={href}>{cs.title}</Link>
                    </h2>
                    <p className={c.itemDeck}>{cs.deck}</p>
                    <Link href={href} className={c.itemLink}>
                      {copy.readLabel} →
                    </Link>
                  </div>
                  <ul className={c.itemMetrics}>
                    {cs.metrics.slice(0, 2).map((metric) => (
                      <li key={metric.label}>
                        <p className={c.itemMetricValue}>{metric.value}</p>
                        <p className={c.itemMetricLabel}>{metric.label}</p>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}
