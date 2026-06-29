import type { Dictionary } from "@/i18n/dictionaries";
import { CalendlyButton } from "@/components/CalendlyButton";

export function Hero({ hero }: { hero: Dictionary["hero"] }) {
  return (
    <section id="hero" aria-labelledby="hero-heading">
      <p>{hero.badge}</p>
      <h1 id="hero-heading">
        {hero.headline.map((part, i) => (
          <span key={i} className={part.accent ? "accent" : undefined}>
            {part.text}
            {i < hero.headline.length - 1 ? " " : ""}
          </span>
        ))}
      </h1>
      <p>{hero.subhead}</p>
      <p>
        <strong>{hero.tagline}</strong>
      </p>
      <p>
        <CalendlyButton>{hero.cta}</CalendlyButton>
      </p>
    </section>
  );
}
