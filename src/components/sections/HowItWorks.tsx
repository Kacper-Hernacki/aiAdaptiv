import type { Dictionary } from "@/i18n/dictionaries";

export function HowItWorks({
  howItWorks,
}: {
  howItWorks: Dictionary["howItWorks"];
}) {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-heading">
      <h2 id="how-it-works-heading">{howItWorks.h2}</h2>
      <p>{howItWorks.intro}</p>
      <ol>
        {howItWorks.steps.map((step) => (
          <li key={step.title}>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
      <p>
        <strong>{howItWorks.timeline}</strong>
      </p>
      <h3>{howItWorks.roadmap.label}</h3>
      <ul>
        {howItWorks.roadmap.days.map((day) => (
          <li key={day.label}>
            <strong>{day.label}</strong> — {day.body}
          </li>
        ))}
      </ul>
      <p>
        <strong>{howItWorks.roadmap.resultLabel}:</strong>{" "}
        {howItWorks.roadmap.result}
      </p>
      <figure aria-label={howItWorks.flowLabel}>
        <figcaption>{howItWorks.flowLabel}</figcaption>
        <pre>{howItWorks.flow}</pre>
      </figure>
      <p>
        <strong>{howItWorks.outro}</strong>
      </p>
    </section>
  );
}
