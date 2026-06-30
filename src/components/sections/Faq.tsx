import type { Dictionary } from "@/i18n/dictionaries";

export function Faq({ faq }: { faq: Dictionary["faq"] }) {
  return (
    <section id="faq" aria-labelledby="faq-heading">
      <h2 id="faq-heading">{faq.h2}</h2>
      <dl>
        {faq.items.map((item) => (
          <div key={item.q}>
            <dt>{item.q}</dt>
            <dd>{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
