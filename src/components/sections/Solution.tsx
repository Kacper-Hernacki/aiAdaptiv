import type { Dictionary } from "@/i18n/dictionaries";
import s from "./Section.module.css";

export function Solution({ solution }: { solution: Dictionary["solution"] }) {
  return (
    <section id="solution" aria-labelledby="solution-heading" className={s.section}>
      <h2 id="solution-heading" className={s.h2} data-reveal>
        {solution.h2}
      </h2>
      <ul className={s.grid}>
        {solution.pillars.map((pillar, i) => (
          <li
            key={pillar.title}
            data-reveal
            style={{ "--rd": `${i * 80}ms` } as React.CSSProperties}
          >
            <article className={s.card}>
              <h3 className={s.cardTitle}>{pillar.title}</h3>
              <p className={s.cardBody}>{pillar.body}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
