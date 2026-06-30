import type { Dictionary } from "@/i18n/dictionaries";
import s from "./Section.module.css";

export function Pricing({ pricing }: { pricing: Dictionary["pricing"] }) {
  return (
    <section id="pricing" aria-labelledby="pricing-heading" className={s.section}>
      <h2 id="pricing-heading" className={s.h2} data-reveal>
        {pricing.h2}
      </h2>
      <ul className={s.plans} data-reveal>
        {pricing.plans.map((plan) => (
          <li key={plan.label} className={s.priceRow}>
            <span className={s.priceLabel}>{plan.label}</span>
            <strong className={s.price}>{plan.price}</strong>
          </li>
        ))}
      </ul>
      <p className={s.body} data-reveal>
        {pricing.note}
      </p>
      <ul className={s.tags} aria-label="Trust signals" data-reveal>
        {pricing.trust.map((item) => (
          <li key={item} className={s.tag}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
