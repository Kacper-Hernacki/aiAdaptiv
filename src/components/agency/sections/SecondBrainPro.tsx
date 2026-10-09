import type { Dictionary } from "@/i18n/dictionaries";
import { PillButton } from "../PillButton";
import s from "../Agency.module.css";
import sbp from "./SecondBrainPro.module.css";

/**
 * Second Brain Pro product section — a compact card highlighting the SaaS product
 * with a link to brain.aiadaptiv.com. Matches the tone and design of the site.
 */
export function SecondBrainPro({
  secondBrainPro,
}: {
  secondBrainPro: Dictionary["agency"]["secondBrainPro"];
}) {
  return (
    <section
      id="products"
      aria-labelledby="products-heading"
      className={s.section}
    >
      <div className={s.inner}>
        <div className={sbp.container}>
          <div className={sbp.content}>
            <p id="products-heading" className={s.super} data-reveal>
              {secondBrainPro.h2}
            </p>
            <h2
              className={sbp.headline}
              data-reveal
              style={{ "--rd": "80ms" } as React.CSSProperties}
            >
              {secondBrainPro.headline}
            </h2>
            <p
              className={s.lead}
              data-reveal
              style={{ "--rd": "160ms" } as React.CSSProperties}
            >
              {secondBrainPro.body}
            </p>
            <div data-reveal style={{ "--rd": "240ms" } as React.CSSProperties}>
              <PillButton href={secondBrainPro.url} large external>
                {secondBrainPro.cta}
              </PillButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
