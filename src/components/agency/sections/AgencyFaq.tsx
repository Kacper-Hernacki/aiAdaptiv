import type { Dictionary } from "@/i18n/dictionaries";
import s from "../Agency.module.css";
import f from "./Faq.module.css";

export function AgencyFaq({ faq }: { faq: Dictionary["agency"]["faq"] }) {
  return (
    <section id="faq" aria-labelledby="faq-heading" className={s.section}>
      <div className={s.inner}>
        <div className={s.titleWrap}>
          <h2 id="faq-heading" className={s.h2} data-reveal>
            {faq.h2}
          </h2>
        </div>
        <dl className={f.list}>
          {faq.items.map((item, i) => (
            <div
              key={item.q}
              className={f.item}
              data-reveal
              style={{ "--rd": `${60 + i * 50}ms` } as React.CSSProperties}
            >
              <dt className={f.q}>{item.q}</dt>
              <dd className={f.a}>{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
