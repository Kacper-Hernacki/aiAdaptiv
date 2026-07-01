import type { Dictionary } from "@/i18n/dictionaries";
import s from "./Section.module.css";

export function Problem({ problem }: { problem: Dictionary["problem"] }) {
  return (
    <section id="problem" aria-labelledby="problem-heading" className={s.section}>
      <div className={s.alignRight}>
        <h2 id="problem-heading" className={s.h2} data-reveal>
          {problem.h2}
        </h2>
        <ul className={s.points}>
          {problem.points.map((point, i) => (
            <li
              key={point}
              className={s.point}
              data-reveal
              style={{ "--rd": `${i * 90}ms` } as React.CSSProperties}
            >
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
