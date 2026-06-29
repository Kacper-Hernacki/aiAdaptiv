import type { Dictionary } from "@/i18n/dictionaries";
import { CalendlyButton } from "@/components/CalendlyButton";

export function Qualifier({ qualifier }: { qualifier: Dictionary["qualifier"] }) {
  return (
    <section id="qualify" aria-labelledby="qualify-heading">
      <h2 id="qualify-heading">{qualifier.h2}</h2>
      <ul>
        <li>
          <strong>{qualifier.yesLabel}</strong> {qualifier.yes}
        </li>
        <li>
          <strong>{qualifier.noLabel}</strong> {qualifier.no}
        </li>
      </ul>
      <p>
        <CalendlyButton>{qualifier.cta}</CalendlyButton>
      </p>
    </section>
  );
}
