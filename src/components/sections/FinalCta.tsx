import { calendlyUrl } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries";

export function FinalCta({ finalCta }: { finalCta: Dictionary["finalCta"] }) {
  return (
    <section id="contact" aria-labelledby="contact-heading">
      <h2 id="contact-heading">{finalCta.h2}</h2>
      <p>{finalCta.body}</p>
      <p>
        <a href={calendlyUrl} target="_blank" rel="noopener noreferrer">
          {finalCta.cta}
        </a>
      </p>
    </section>
  );
}
