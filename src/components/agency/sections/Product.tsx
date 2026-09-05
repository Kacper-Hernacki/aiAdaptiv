import type { Dictionary } from "@/i18n/dictionaries";
import { openllmUrl } from "@/config/site";
import s from "../Agency.module.css";

/**
 * Cross-link band to the open-LLM product on its own subdomain. It is the only
 * crawlable path from the apex domain to openllm.aiadaptiv.com, so the link is
 * a plain, followed anchor — not a script-driven button.
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
            style={{ "--rd": `${160 + i * 80}ms` } as React.CSSProperties}
          >
            {point}
          </li>
        ))}
      </ul>
      <div
        className={s.ctaWrap}
        data-reveal
        style={{ "--rd": "400ms" } as React.CSSProperties}
      >
        <a href={openllmUrl} className={`${s.btnPrimary} ${s.btnLarge}`}>
          {product.cta}
        </a>
      </div>
    </section>
  );
}
