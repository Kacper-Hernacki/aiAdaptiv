import type { Dictionary } from "@/i18n/dictionaries";
import s from "./Section.module.css";

export function HowItWorks({
  howItWorks,
}: {
  howItWorks: Dictionary["howItWorks"];
}) {
  return (
    <>
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
      </section>

      <section
        id="client-roadmap"
        aria-labelledby="client-roadmap-heading"
        className={s.section}
      >
        <h2 id="client-roadmap-heading" className={s.h2} data-reveal>
          {howItWorks.roadmap.label}
        </h2>
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
          <strong className={s.accent}>
            {howItWorks.roadmap.resultLabel}:
          </strong>{" "}
          {howItWorks.roadmap.result}
        </p>
      </section>

      <section
        id="visual-summary"
        aria-labelledby="visual-summary-heading"
        className={s.section}
      >
        <h2 id="visual-summary-heading" className={s.h2} data-reveal>
          {howItWorks.flowLabel}
        </h2>
        <figure className={s.flow} data-reveal>
          <ol className={s.flowList}>
            {howItWorks.flow
              .split("↓")
              .map((node) => node.trim())
              .filter(Boolean)
              .map((node) => node.split("\n").map((line) => line.trim()))
              .map((lines, i) => (
                <li
                  key={lines[0]}
                  className={s.flowNode}
                  style={{ "--rd": `${i * 90}ms` } as React.CSSProperties}
                >
                  <span className={s.flowNodeMain}>{lines[0]}</span>
                  {lines.slice(1).map((line) => (
                    <span key={line} className={s.flowNodeSub}>
                      {line}
                    </span>
                  ))}
                </li>
              ))}
          </ol>
        </figure>
        <p className={s.emphasis} data-reveal>
          {howItWorks.outro}
        </p>
      </section>
    </>
  );
}
