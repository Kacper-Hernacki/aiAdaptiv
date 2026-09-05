import type { Dictionary } from "@/i18n/dictionaries";
import { bookingUrl } from "@/config/site";
import s from "../Agency.module.css";

export function Proof({ proof }: { proof: Dictionary["agency"]["proof"] }) {
  return (
    <section id="proof" aria-labelledby="proof-heading" className={s.section}>
      <h2 id="proof-heading" className={s.h2} data-reveal>
        {proof.h2}
      </h2>
      {proof.body.map((paragraph, i) => (
        <p
          key={i}
          className={s.body}
          data-reveal
          style={{ "--rd": `${80 + i * 80}ms` } as React.CSSProperties}
        >
          {paragraph}
        </p>
      ))}
      <div
        className={s.ctaWrap}
        data-reveal
        style={{ "--rd": "320ms" } as React.CSSProperties}
      >
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${s.btnPrimary} ${s.btnLarge}`}
        >
          {proof.cta}
        </a>
      </div>
    </section>
  );
}
