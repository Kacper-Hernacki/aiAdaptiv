import type { Dictionary } from "@/i18n/dictionaries";
import s from "./Section.module.css";

export function BehindTheArchitecture({
  behindTheArchitecture,
}: {
  behindTheArchitecture: Dictionary["behindTheArchitecture"];
}) {
  return (
    <section id="founder" aria-labelledby="founder-heading" className={s.section}>
      <h2 id="founder-heading" className={s.h2} data-reveal>
        {behindTheArchitecture.h2}
      </h2>
      <p className={s.lead} data-reveal>
        {behindTheArchitecture.lead}
      </p>
      {behindTheArchitecture.body.map((paragraph, i) => (
        <p
          key={paragraph}
          className={s.body}
          data-reveal
          style={{ "--rd": `${(i + 1) * 80}ms` } as React.CSSProperties}
        >
          {paragraph}
        </p>
      ))}
    </section>
  );
}
