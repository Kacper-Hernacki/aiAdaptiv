import type { Dictionary } from "@/i18n/dictionaries";
import { HairlineFigure } from "../HairlineFigure";
import { workFigures } from "../workFigures";
import s from "../Agency.module.css";
import w from "./Work.module.css";

/**
 * Case cards are intentionally not links, even though some of them now have a
 * detail page under /[lang]/case-studies. This section is a sweep of what we
 * build; two cards sprouting a link and seven not made it read like a list of
 * things half-finished. The case studies are reached from the nav and the
 * footer instead.
 *
 * Children are flattened so the row can use CSS subgrid: name, result, body,
 * tags, figure and gutter each occupy the same track across the row.
 */
export function Work({ work }: { work: Dictionary["agency"]["work"] }) {
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
          {work.cases.map((item, i) => (
            <li
              key={i}
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
          ))}
        </ul>
      </div>
    </section>
  );
}
