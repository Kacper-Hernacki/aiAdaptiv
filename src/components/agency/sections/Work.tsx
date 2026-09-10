import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import {
  caseStudies,
  getIndexCopy,
  hasCaseStudyCopy,
} from "@/content/case-studies";
import { workImages } from "../workImages";
import { Placeholder } from "../Placeholder";
import s from "../Agency.module.css";
import w from "./Work.module.css";

/**
 * A card links to its case study only when one is written in this locale.
 * The rest stay plain text on purpose: a card that looks clickable but isn't
 * is worse than a card that doesn't.
 */
function caseHref(id: string, lang: Locale): string | null {
  if (!hasCaseStudyCopy(lang)) return null;
  const study = caseStudies.find((c) => c.workId === id);
  return study ? `/${lang}/case-studies/${study.slug}` : null;
}

export function Work({
  work,
  lang,
}: {
  work: Dictionary["agency"]["work"];
  lang: Locale;
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
        </div>
        <ul className={w.grid}>
          {work.cases.map((item, i) => {
            const href = caseHref(item.id, lang);
            return (
              <li
                key={i}
                className={w.card}
                data-reveal
                style={{ "--rd": `${160 + i * 90}ms` } as React.CSSProperties}
              >
                <div className={w.thumb}>
                  {workImages[item.id] ? (
                    <Image
                      src={workImages[item.id]}
                      alt={item.name}
                      className={w.image}
                      sizes="(max-width: 991px) 100vw, 30vw"
                      placeholder="blur"
                    />
                  ) : (
                    <Placeholder ratio="4:3" seed={i} />
                  )}
                </div>
                <div className={w.info}>
                  <p className={w.name}>{item.name}</p>
                  <p className={w.outcome}>{item.result}</p>
                  <p className={w.body}>{item.body}</p>
                  <ul className={s.tags}>
                    {item.tags.map((tag, t) => (
                      <li key={t} className={s.tag}>
                        {tag}
                      </li>
                    ))}
                  </ul>
                  {href ? (
                    <Link href={href} className={w.caseLink}>
                      {getIndexCopy(lang).readLabel} →
                    </Link>
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
