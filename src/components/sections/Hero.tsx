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
            <svg
              className={styles.eyebrowIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="4" y="10.5" width="16" height="11" rx="2.5" />
              <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
            </svg>
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
