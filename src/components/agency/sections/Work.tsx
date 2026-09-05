import type { Dictionary } from "@/i18n/dictionaries";
import s from "../Agency.module.css";
import w from "./Work.module.css";

/**
 * Case cards are intentionally not links yet — the per-case detail pages
 * (/[lang]/case-studies/[slug]) do not exist, and a card that looks clickable
 * but isn't is worse than a card that doesn't.
 */
export function Work({ work }: { work: Dictionary["agency"]["work"] }) {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className={`${s.section} ${s.tall}`}
    >
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
      <ul className={w.cases}>
        {work.cases.map((item, i) => (
          <li
            key={i}
            className={w.case}
            data-reveal
            style={{ "--rd": `${160 + i * 90}ms` } as React.CSSProperties}
          >
            <p className={w.name}>{item.name}</p>
            <p className={w.result}>{item.result}</p>
            <p className={w.body}>{item.body}</p>
            <ul className={s.tags}>
              {item.tags.map((tag, t) => (
                <li key={t} className={s.tag}>
                  {tag}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
