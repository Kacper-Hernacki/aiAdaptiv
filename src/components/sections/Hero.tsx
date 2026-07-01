import type { Dictionary } from "@/i18n/dictionaries";
import { TallyButton } from "@/components/TallyButton";
import { ScrollExit } from "@/components/ScrollExit";
import styles from "./Hero.module.css";

export function Hero({ hero }: { hero: Dictionary["hero"] }) {
  return (
    <section id="hero" aria-labelledby="hero-heading" className={styles.hero}>
      <div className={styles.inner}>
        <ScrollExit>
        <div className={styles.content}>
          <p className={styles.eyebrow} data-reveal>
            {hero.badge}
          </p>
          <h1 id="hero-heading" className={styles.headline} data-reveal style={{ "--rd": "80ms" } as React.CSSProperties}>
            {hero.headline.map((part, i) => (
              <span key={i} className={part.accent ? styles.accent : undefined}>
                {part.text}
              </span>
            ))}
          </h1>
          <p className={styles.subhead} data-reveal style={{ "--rd": "160ms" } as React.CSSProperties}>
            {hero.subhead}
          </p>
          <p className={styles.tagline} data-reveal style={{ "--rd": "220ms" } as React.CSSProperties}>
            {hero.tagline}
          </p>
          <div data-reveal style={{ "--rd": "300ms" } as React.CSSProperties}>
            <TallyButton className={styles.cta}>{hero.cta}</TallyButton>
          </div>
        </div>
        </ScrollExit>
      </div>
    </section>
  );
}
