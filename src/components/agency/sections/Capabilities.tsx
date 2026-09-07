import type { Dictionary } from "@/i18n/dictionaries";
import Image from "next/image";
import { Placeholder } from "../Placeholder";
import { capabilityImages } from "../capabilityImages";
import s from "../Agency.module.css";
import c from "./Capabilities.module.css";

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
      <div className={`${s.inner} ${s.centered}`}>
        <div className={s.titleWrap}>
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
        </div>
      </div>
      {/* Full-bleed row: the cards run edge to edge, outside the page gutter. */}
      <ul className={c.grid}>
        {capabilities.items.map((item, i) => (
          <li
            key={item.title}
            className={c.card}
            data-reveal
            style={{ "--rd": `${i * 80}ms` } as React.CSSProperties}
          >
            <div className={c.art}>
              {capabilityImages[item.id] ? (
                <Image
                  src={capabilityImages[item.id]}
                  alt=""
                  fill
                  sizes="(max-width: 991px) 100vw, 33vw"
                  className={c.artImage}
                />
              ) : (
                <Placeholder fill seed={i + 1} />
              )}
              <span className={c.artDim} />
            </div>
            <span className={c.overlay} />
            <div className={c.content}>
              <h3 className={c.title}>{item.title}</h3>
              <p className={c.body}>{item.body}</p>
              <ul className={c.tags}>
                {item.tags.map((tag, t) => (
                  <li key={t} className={c.tag}>
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
