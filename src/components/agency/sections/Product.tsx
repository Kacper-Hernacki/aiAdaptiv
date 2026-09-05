import type { Dictionary } from "@/i18n/dictionaries";
import { openllmUrl } from "@/config/site";
import { PillButton } from "../PillButton";
import { Placeholder } from "../Placeholder";
import s from "../Agency.module.css";

/**
 * Cross-link band to the open-LLM product on its own subdomain. It is the only
 * crawlable path from the apex domain to openllm.aiadaptiv.com, so the link is
 * a plain, followed anchor — and `external` is off because it is our own site,
 * not a third party.
 */
export function Product({
  product,
}: {
  product: Dictionary["agency"]["product"];
}) {
  return (
    <section
      id="product"
      aria-labelledby="product-heading"
      className={s.section}
    >
      <div className={s.inner}>
        <div className={s.split}>
          <div
            className={s.splitMedia}
            data-reveal
            style={{ "--rd": "120ms" } as React.CSSProperties}
          >
            <Placeholder ratio="16:9" seed={2} label={product.mediaLabel} />
          </div>
          <div className={s.splitText}>
            <h2 id="product-heading" className={s.h2} data-reveal>
              {product.h2}
            </h2>
            <p
              className={s.lead}
              data-reveal
              style={{ "--rd": "80ms" } as React.CSSProperties}
            >
              {product.lead}
            </p>
            <ul className={s.points}>
              {product.points.map((point, i) => (
                <li
                  key={i}
                  className={s.point}
                  data-reveal
                  style={{ "--rd": `${160 + i * 70}ms` } as React.CSSProperties}
                >
                  {point}
                </li>
              ))}
            </ul>
            <div data-reveal style={{ "--rd": "400ms" } as React.CSSProperties}>
              <PillButton href={openllmUrl} large external={false}>
                {product.cta}
              </PillButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
