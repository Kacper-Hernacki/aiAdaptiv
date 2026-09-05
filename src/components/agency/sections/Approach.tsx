import type { Dictionary } from "@/i18n/dictionaries";
import s from "../Agency.module.css";

export function Approach({
  approach,
}: {
  approach: Dictionary["agency"]["approach"];
}) {
  return (
    <section
      id="approach"
      aria-labelledby="approach-heading"
      className={s.section}
    >
      <h2 id="approach-heading" className={s.h2} data-reveal>
        {approach.h2}
      </h2>
      <ul className={`${s.grid} ${s.gridTwo}`}>
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
    </section>
  );
}
