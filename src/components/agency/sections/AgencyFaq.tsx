import type { Dictionary } from "@/i18n/dictionaries";
import { FaqAccordion } from "../FaqAccordion";
import s from "../Agency.module.css";

export function AgencyFaq({ faq }: { faq: Dictionary["agency"]["faq"] }) {
  return (
    <section id="faq" aria-labelledby="faq-heading" className={s.section}>
      <div className={s.inner}>
        <div className={s.titleWrap}>
          <h2 id="faq-heading" className={s.h2} data-reveal>
            {faq.h2}
          </h2>
        </div>
        <FaqAccordion items={faq.items} />
      </div>
    </section>
  );
}
