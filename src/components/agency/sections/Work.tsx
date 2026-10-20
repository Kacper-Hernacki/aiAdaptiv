import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import { getCaseStudyByWorkId } from "@/content/case-studies";
import { HairlineFigure } from "../HairlineFigure";
import { workFigures } from "../workFigures";
import s from "../Agency.module.css";
import w from "./Work.module.css";

/**
 * Cards that have a real case study (`workId` on the case + `caseStudyCta` in
 * the dictionary) link through to that page. The rest stay as a sweep of
 * what we build — no invented mappings. The section heading always offers
 * the case-studies index.
 *
 * Children are flattened so the row can use CSS subgrid: name, result, body,
 * tags, case-link, figure and gutter each occupy the same track across the row.
 */
export function Work({
  work,
  lang,
}: {
  work: Dictionary["agency"]["work"];
  lang: string;
}) {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className={`${s.section} ${s.bandAlt}`}
    >
      <div className={s.inner}>
        <div className={s.titleWrap}>
          <h2 id="work-heading" className={s.h2} data-reveal>
            {work.h2}
          </h2>
          <p
            className={s.lead}
            data-reveal
            style={{ "--rd": "80ms" } as React.CSSProperties}
          >
            {work.lead}
          </p>
          <p
            className={w.indexCta}
            data-reveal
            style={{ "--rd": "120ms" } as React.CSSProperties}
          >
            <Link
              href={`/${lang}/case-studies`}
              data-cta-id="case_study"
              data-location="work"
            >
              {work.indexCta}
            </Link>
          </p>
        </div>
        <ul className={w.grid}>
          {work.cases.map((item, i) => {
            const study = getCaseStudyByWorkId(item.id);
            const href =
              study && item.caseStudyCta
                ? `/${lang}/case-studies/${study.slug}`
                : undefined;
            return (
              <li
                key={item.id}
                className={w.card}
                data-reveal
                style={{ "--rd": `${160 + i * 90}ms` } as React.CSSProperties}
              >
                <p className={w.name}>{item.name}</p>
                <p className={w.outcome}>{item.result}</p>
                <p className={w.body}>{item.body}</p>
                <ul className={`${s.tags} ${w.tags}`}>
                  {item.tags.map((tag, t) => (
                    <li key={t} className={s.tag}>
                      {tag}
                    </li>
                  ))}
                </ul>
                {href ? (
                  <Link
                    href={href}
                    className={w.caseLink}
                    data-cta-id="case_study"
                    data-location="work"
                  >
                    {item.caseStudyCta}
                  </Link>
                ) : (
                  <span className={w.caseLinkSpacer} aria-hidden />
                )}
                <div className={w.thumb}>
                  {workFigures[item.id] ? (
                    <HairlineFigure
                      name={workFigures[item.id]}
                      label={item.name}
                      surface="alt"
                    />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
