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
