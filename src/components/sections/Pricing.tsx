import type { Dictionary } from "@/i18n/dictionaries";

export function Pricing({ pricing }: { pricing: Dictionary["pricing"] }) {
  return (
    <section id="pricing" aria-labelledby="pricing-heading">
      <h2 id="pricing-heading">{pricing.h2}</h2>
      <ul>
        {pricing.plans.map((plan) => (
          <li key={plan.label}>
            <span>{plan.label}</span>: <strong>{plan.price}</strong>
          </li>
        ))}
      </ul>
      <p>{pricing.note}</p>
      <ul aria-label="Trust signals">
        {pricing.trust.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
