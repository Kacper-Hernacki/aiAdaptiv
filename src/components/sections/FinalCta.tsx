import type { Dictionary } from "@/i18n/dictionaries";
import { CalendlyButton } from "@/components/CalendlyButton";

export function FinalCta({ finalCta }: { finalCta: Dictionary["finalCta"] }) {
  return (
    <section id="contact" aria-labelledby="contact-heading">
      <h2 id="contact-heading">{finalCta.h2}</h2>
      <p>{finalCta.body}</p>
      <p>
        <CalendlyButton>{finalCta.cta}</CalendlyButton>
      </p>
    </section>
  );
}
