import type { Dictionary } from "@/i18n/dictionaries";
import s from "./Section.module.css";

export function Faq({ faq }: { faq: Dictionary["faq"] }) {
  return (
    <section id="faq" aria-labelledby="faq-heading" className={s.section}>
      <div className={s.alignRight}>
        <h2 id="faq-heading" className={s.h2} data-reveal>
          {faq.h2}
        </h2>
        <dl className={s.faq}>
          {faq.items.map((item, i) => (
            <div
              key={item.q}
              className={s.faqItem}
              data-reveal
              style={{ "--rd": `${i * 70}ms` } as React.CSSProperties}
            >
              <dt className={s.faqQ}>{item.q}</dt>
              <dd className={s.faqA}>{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
