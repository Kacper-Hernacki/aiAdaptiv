import type { Dictionary } from "@/i18n/dictionaries";
import { bookingUrl } from "@/config/site";
import { PillButton } from "../PillButton";
import s from "../Agency.module.css";
import h from "./AgencyHero.module.css";

export function AgencyHero({ hero }: { hero: Dictionary["agency"]["hero"] }) {
  return (
    <section id="hero" aria-labelledby="hero-heading" className={h.hero}>
      <div className={h.inner}>
        <h1
          id="hero-heading"
          className={`${s.h1} ${h.title} ${h.punch}`}
          data-reveal
          style={{ "--rd": "0ms" } as React.CSSProperties}
        >
          {hero.headline.map((part) => part.text).join(" ")}
        </h1>
        <p
          className={s.super}
          data-reveal
          style={{ "--rd": "180ms" } as React.CSSProperties}
        >
          {hero.eyebrow}
        </p>
        <ul className={h.questions}>
          {hero.questions.map((q, i) => (
            <li
              key={i}
              className={h.question}
              data-reveal
              style={{ "--rd": `${260 + i * 90}ms` } as React.CSSProperties}
            >
              {q}
            </li>
          ))}
        </ul>
        <p
          className={h.sub}
          data-reveal
          style={{ "--rd": "400ms" } as React.CSSProperties}
        >
          {hero.subhead}
        </p>
        <ul className={h.stats}>
          {hero.stats.map((stat, i) => (
            <li
              key={stat.label}
              className={h.stat}
              data-reveal
              style={{ "--rd": `${460 + i * 60}ms` } as React.CSSProperties}
            >
              <span className={h.statNum}>{stat.value}</span>
              <span className={h.statLabel}>{stat.label}</span>
            </li>
          ))}
        </ul>
        <div
          className={h.ctaWrap}
          data-reveal
          style={{ "--rd": "700ms" } as React.CSSProperties}
        >
          <PillButton href={bookingUrl}>{hero.cta}</PillButton>
        </div>
      </div>
    </section>
  );
}
