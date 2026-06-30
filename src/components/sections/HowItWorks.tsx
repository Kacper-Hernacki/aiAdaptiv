import type { Dictionary } from "@/i18n/dictionaries";
import s from "./Section.module.css";

export function HowItWorks({
  howItWorks,
}: {
  howItWorks: Dictionary["howItWorks"];
}) {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className={s.section}
    >
      <h2 id="how-it-works-heading" className={s.h2} data-reveal>
        {howItWorks.h2}
      </h2>
      <p className={s.lead} data-reveal>
        {howItWorks.intro}
      </p>

      <ol className={s.steps}>
        {howItWorks.steps.map((step, i) => (
          <li
            key={step.title}
            className={s.card}
            data-reveal
            style={{ "--rd": `${i * 80}ms` } as React.CSSProperties}
          >
            <h3 className={s.cardTitle}>{step.title}</h3>
            <p className={s.cardBody}>{step.body}</p>
          </li>
        ))}
      </ol>

      <p className={s.emphasis} data-reveal>
        {howItWorks.timeline}
      </p>

      <h3 className={s.subheading} data-reveal>
        {howItWorks.roadmap.label}
      </h3>
      <ul className={s.roadmap}>
        {howItWorks.roadmap.days.map((day, i) => (
          <li
            key={day.label}
            className={s.roadmapItem}
            data-reveal
            style={{ "--rd": `${i * 80}ms` } as React.CSSProperties}
          >
            <strong className={s.dayLabel}>{day.label}</strong>
            <span>{day.body}</span>
          </li>
        ))}
      </ul>
      <p className={s.emphasis} data-reveal>
        <strong className={s.accent}>{howItWorks.roadmap.resultLabel}:</strong>{" "}
        {howItWorks.roadmap.result}
      </p>

      <figure className={s.flow} aria-label={howItWorks.flowLabel} data-reveal>
        <figcaption className={s.flowCaption}>{howItWorks.flowLabel}</figcaption>
        <pre className={s.flowPre}>{howItWorks.flow}</pre>
      </figure>

      <p className={s.emphasis} data-reveal>
        {howItWorks.outro}
      </p>
    </section>
  );
}
