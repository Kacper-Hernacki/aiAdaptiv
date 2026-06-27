import type { Dictionary } from "@/i18n/dictionaries";

export function Process({ process }: { process: Dictionary["process"] }) {
  return (
    <section id="process" aria-labelledby="process-heading">
      <h2 id="process-heading">{process.h2}</h2>
      <ol>
        {process.steps.map((step) => (
          <li key={step.title}>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
