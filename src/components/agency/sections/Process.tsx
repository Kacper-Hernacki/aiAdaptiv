import type { Dictionary } from "@/i18n/dictionaries";
import s from "../Agency.module.css";
import p from "./Process.module.css";

export function Process({
  process,
}: {
  process: Dictionary["agency"]["process"];
}) {
  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className={s.section}
    >
      <h2 id="process-heading" className={s.h2} data-reveal>
        {process.h2}
      </h2>
      <p
        className={s.lead}
        data-reveal
        style={{ "--rd": "80ms" } as React.CSSProperties}
      >
        {process.lead}
      </p>
      <ol className={p.steps}>
        {process.steps.map((step, i) => (
          <li
            key={step.step}
            className={p.step}
            data-reveal
            style={{ "--rd": `${160 + i * 80}ms` } as React.CSSProperties}
          >
            <span className={p.number}>{step.step}</span>
            <h3 className={p.title}>{step.title}</h3>
            <p className={p.body}>{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
