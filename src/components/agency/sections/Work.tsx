import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import { workImages } from "../workImages";
import { Placeholder } from "../Placeholder";
import s from "../Agency.module.css";
import w from "./Work.module.css";

/**
 * Case cards are intentionally not links — the per-case detail pages
 * (/[lang]/case-studies/[slug]) do not exist yet, and a card that looks
 * clickable but isn't is worse than a card that doesn't.
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
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
