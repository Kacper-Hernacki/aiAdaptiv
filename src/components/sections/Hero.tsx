import type { Dictionary } from "@/i18n/dictionaries";
import { TallyButton } from "@/components/TallyButton";

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
        <TallyButton>{hero.cta}</TallyButton>
      </p>
    </section>
  );
}
