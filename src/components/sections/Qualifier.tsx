import type { Dictionary } from "@/i18n/dictionaries";
import { TallyButton } from "@/components/TallyButton";
import s from "./Section.module.css";

export function Qualifier({ qualifier }: { qualifier: Dictionary["qualifier"] }) {
  return (
    <section
      id="qualify"
      aria-labelledby="qualify-heading"
      className={`${s.section} ${s.center} ${s.last}`}
    >
      <h2 id="qualify-heading" className={s.h2} data-reveal>
        {qualifier.h2}
      </h2>
      <ul className={s.fitList} data-reveal>
        <li className={s.fitItem}>
          <strong className={s.fitLabel}>{qualifier.yesLabel}</strong>{" "}
          {qualifier.yes}
        </li>
        <li className={s.fitItem}>
          <strong className={s.fitLabel}>{qualifier.noLabel}</strong>{" "}
          {qualifier.no}
        </li>
      </ul>
      <div className={s.ctaWrap} data-reveal>
        <TallyButton className={`${s.btnPrimary} ${s.btnLarge}`}>
          {qualifier.cta}
        </TallyButton>
      </div>
    </section>
  );
}
