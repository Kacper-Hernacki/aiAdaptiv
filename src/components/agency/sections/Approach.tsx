import type { Dictionary } from "@/i18n/dictionaries";
import s from "../Agency.module.css";

/** The one always-dark band in the middle of the light page. */
export function Approach({
  approach,
}: {
  approach: Dictionary["agency"]["approach"];
}) {
  return (
    <section
      id="approach"
      aria-labelledby="approach-heading"
      className={`${s.section} ${s.bandDark}`}
    >
      <div className={s.inner}>
        <div className={s.titleWrap}>
          <h2 id="approach-heading" className={s.h2} data-reveal>
            {approach.h2}
          </h2>
        </div>
        <ul className={s.cardGrid}>
          {approach.items.map((item, i) => (
            <li
              key={item.title}
              className={s.card}
              data-reveal
              style={{ "--rd": `${80 + i * 80}ms` } as React.CSSProperties}
            >
              <h3 className={s.cardTitle}>{item.title}</h3>
              <p className={s.cardBody}>{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
