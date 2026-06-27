import type { Dictionary } from "@/i18n/dictionaries";

export function Problem({ problem }: { problem: Dictionary["problem"] }) {
  return (
    <section id="problem" aria-labelledby="problem-heading">
      <h2 id="problem-heading">{problem.h2}</h2>
      <p>{problem.subhead}</p>
      <ul>
        {problem.points.map((point) => (
          <li key={point.title}>
            <h3>{point.title}</h3>
            <p>{point.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
