import type { Dictionary } from "@/i18n/dictionaries";
import { bookingUrl } from "@/config/site";
import s from "../Agency.module.css";
import c from "./Contact.module.css";

export function Contact({
  contact,
}: {
  contact: Dictionary["agency"]["contact"];
}) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className={`${s.section} ${s.center} ${c.scrim}`}
    >
      <h2 id="contact-heading" className={s.h2} data-reveal>
        {contact.h2}
      </h2>
      <p
        className={c.body}
        data-reveal
        style={{ "--rd": "80ms" } as React.CSSProperties}
      >
        {contact.body}
      </p>
      <p
        className={c.note}
        data-reveal
        style={{ "--rd": "140ms" } as React.CSSProperties}
      >
        {contact.note}
      </p>
      <div
        className={s.ctaWrap}
        data-reveal
        style={{ "--rd": "220ms" } as React.CSSProperties}
      >
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${s.btnPrimary} ${s.btnLarge}`}
        >
          {contact.cta}
        </a>
      </div>
    </section>
  );
}
