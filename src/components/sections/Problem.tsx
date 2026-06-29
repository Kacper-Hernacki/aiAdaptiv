import type { Dictionary } from "@/i18n/dictionaries";

export function Problem({ problem }: { problem: Dictionary["problem"] }) {
  return (
    <section id="problem" aria-labelledby="problem-heading">
      <h2 id="problem-heading">{problem.h2}</h2>
      <ul>
        {problem.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </section>
  );
}
