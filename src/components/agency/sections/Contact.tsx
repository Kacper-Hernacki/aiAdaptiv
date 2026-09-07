import type { Dictionary } from "@/i18n/dictionaries";
import { bookingUrl } from "@/config/site";
import { PillButton } from "../PillButton";
import s from "../Agency.module.css";

export function Contact({
  contact,
}: {
  contact: Dictionary["agency"]["contact"];
}) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className={`${s.section} ${s.ctaSection}`}
    >
      <span className={s.ctaGlow} aria-hidden="true" />
      <div className={s.inner}>
        <div className={s.ctaInner}>
          <h2 id="contact-heading" className={s.h2} data-reveal>
            {contact.h2}
          </h2>
          <p
            className={s.ctaSub}
            data-reveal
            style={{ "--rd": "80ms" } as React.CSSProperties}
          >
            {contact.body}
          </p>
          <p
            className={s.ctaNote}
            data-reveal
            style={{ "--rd": "140ms" } as React.CSSProperties}
          >
            {contact.note}
          </p>
          <div
            className={s.ctaBtnWrap}
            data-reveal
            style={{ "--rd": "220ms" } as React.CSSProperties}
          >
            <PillButton href={bookingUrl}>{contact.cta}</PillButton>
          </div>
        </div>
      </div>
    </section>
  );
}
