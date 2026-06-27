import type { Dictionary } from "@/i18n/dictionaries";

export function Solution({ solution }: { solution: Dictionary["solution"] }) {
  return (
    <section id="solution" aria-labelledby="solution-heading">
      <h2 id="solution-heading">{solution.h2}</h2>
      <p>{solution.subhead}</p>
      <ul>
        {solution.pillars.map((pillar) => (
          <li key={pillar.title}>
            <article>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
