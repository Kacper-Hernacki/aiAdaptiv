import type { Dictionary } from "@/i18n/dictionaries";
import s from "../Agency.module.css";

export function Capabilities({
  capabilities,
}: {
  capabilities: Dictionary["agency"]["capabilities"];
}) {
  return (
    <section
      id="capabilities"
      aria-labelledby="capabilities-heading"
      className={s.section}
    >
      <h2 id="capabilities-heading" className={s.h2} data-reveal>
        {capabilities.h2}
      </h2>
      <p
        className={s.lead}
        data-reveal
        style={{ "--rd": "80ms" } as React.CSSProperties}
      >
        {capabilities.lead}
      </p>
      <ul className={s.grid}>
        {capabilities.items.map((item, i) => (
          <li
            key={item.title}
            className={s.card}
            data-reveal
            style={{ "--rd": `${160 + i * 80}ms` } as React.CSSProperties}
          >
            <h3 className={s.cardTitle}>{item.title}</h3>
            <p className={s.cardBody}>{item.body}</p>
            <ul className={s.tags}>
              {item.tags.map((tag, t) => (
                <li key={t} className={s.tag}>
                  {tag}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
