import type { Dictionary } from "@/i18n/dictionaries";
import { bookingUrl } from "@/config/site";
import { PillButton } from "../PillButton";
import { HairlineFigure } from "../HairlineFigure";
import s from "../Agency.module.css";
import p from "./Product.module.css";

export function Proof({ proof }: { proof: Dictionary["agency"]["proof"] }) {
  return (
    <section id="proof" aria-labelledby="proof-heading" className={s.section}>
      <div className={s.inner}>
        <div className={p.stack}>
          <div className={s.splitText}>
            <h2 id="proof-heading" className={s.h2} data-reveal>
              {proof.h2}
            </h2>
            <p
              className={s.lead}
              data-reveal
              style={{ "--rd": "80ms" } as React.CSSProperties}
            >
              {proof.lead}
            </p>
            <ul className={s.points}>
              {proof.points.map((point, i) => (
                <li
                  key={point.title}
                  className={s.point}
                  data-reveal
                  style={{ "--rd": `${140 + i * 70}ms` } as React.CSSProperties}
                >
                  <strong className={s.pointTitle}>{point.title}</strong>
                  {point.body}
                </li>
              ))}
            </ul>
            <div
              data-reveal
              style={{ "--rd": "440ms" } as React.CSSProperties}
            >
              <PillButton href={bookingUrl} large>
                {proof.cta}
              </PillButton>
            </div>
          </div>
          <div
            className={`${s.splitMedia} ${p.figureSlot}`}
            data-reveal
            style={{ "--rd": "160ms" } as React.CSSProperties}
          >
            <HairlineFigure
              name="slow"
              label={proof.mediaLabel}
              surface="page"
              className={p.image}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
