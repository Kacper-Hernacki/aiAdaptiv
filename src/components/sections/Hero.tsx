import type { Dictionary } from "@/i18n/dictionaries";
import { CalendlyButton } from "@/components/CalendlyButton";

export function Hero({ hero }: { hero: Dictionary["hero"] }) {
  return (
    <section id="hero" aria-labelledby="hero-heading">
      <h1 id="hero-heading">{hero.h1}</h1>
      <p>{hero.subhead}</p>
      <p>
        <CalendlyButton>{hero.cta}</CalendlyButton>
      </p>
      <ul aria-label="Trust indicators">
        {hero.trust.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
