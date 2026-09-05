import type { Dictionary } from "@/i18n/dictionaries";
import { bookingUrl } from "@/config/site";
import { ScrollExit } from "@/components/ScrollExit";
import styles from "./AgencyHero.module.css";

export function AgencyHero({ hero }: { hero: Dictionary["agency"]["hero"] }) {
  return (
    <section id="hero" aria-labelledby="hero-heading" className={styles.hero}>
      <div className={styles.inner}>
        <ScrollExit>
          <div className={styles.content}>
            <p className={styles.eyebrow} data-reveal>
              {hero.eyebrow}
            </p>
            <h1
              id="hero-heading"
              className={styles.headline}
              data-reveal
              style={{ "--rd": "80ms" } as React.CSSProperties}
            >
              {hero.headline.map((part, i) => (
                <span key={i} className={part.accent ? styles.accent : undefined}>
                  {part.text}
                </span>
              ))}
            </h1>
            <p
              className={styles.subhead}
              data-reveal
              style={{ "--rd": "160ms" } as React.CSSProperties}
            >
              {hero.subhead}
            </p>
            <div data-reveal style={{ "--rd": "240ms" } as React.CSSProperties}>
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cta}
              >
                {hero.cta}
              </a>
            </div>
            <ul className={styles.stats}>
              {hero.stats.map((stat, i) => (
                <li
                  key={stat.label}
                  className={styles.stat}
                  data-reveal
                  style={{ "--rd": `${320 + i * 70}ms` } as React.CSSProperties}
                >
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </ScrollExit>
      </div>
    </section>
  );
}
