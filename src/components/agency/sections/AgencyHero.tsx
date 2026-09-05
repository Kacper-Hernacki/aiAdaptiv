import type { Dictionary } from "@/i18n/dictionaries";
import { bookingUrl } from "@/config/site";
import { PillButton } from "../PillButton";
import s from "../Agency.module.css";
import h from "./AgencyHero.module.css";

export function AgencyHero({ hero }: { hero: Dictionary["agency"]["hero"] }) {
  return (
    <section id="hero" aria-labelledby="hero-heading" className={h.hero}>
      <div className={h.inner}>
        <p className={s.super} data-reveal>
          {hero.eyebrow}
        </p>
        <h1
          id="hero-heading"
          className={`${s.h1} ${h.title}`}
          data-reveal
          style={{ "--rd": "80ms" } as React.CSSProperties}
        >
          {hero.headline.map((part) => part.text).join(" ")}
        </h1>
        <p
          className={h.sub}
          data-reveal
          style={{ "--rd": "160ms" } as React.CSSProperties}
        >
          {hero.subhead}
        </p>
        <ul className={h.stats}>
          {hero.stats.map((stat, i) => (
            <li
              key={stat.label}
              className={h.stat}
              data-reveal
              style={{ "--rd": `${220 + i * 60}ms` } as React.CSSProperties}
            >
              <span className={h.statNum}>{stat.value}</span>
              <span className={h.statLabel}>{stat.label}</span>
            </li>
          ))}
        </ul>
        <div
          className={h.ctaWrap}
          data-reveal
          style={{ "--rd": "460ms" } as React.CSSProperties}
        >
          <PillButton href={bookingUrl}>{hero.cta}</PillButton>
        </div>
      </div>
    </section>
  );
}
