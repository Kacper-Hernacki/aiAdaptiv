import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import { openllmUrl } from "@/config/site";
import { PillButton } from "../PillButton";
import productHero from "../assets/product-hero.jpg";
import s from "../Agency.module.css";
import p from "./Product.module.css";

/**
 * The open-LLM product's own pitch, on the agency homepage. It is the only
 * crawlable path from the apex domain to openllm.aiadaptiv.com, so the link is
 * a plain, followed anchor — and `external` is off because it is our own site.
 *
 * The image is a capture of the product site's hero (its own landing page),
 * imported statically so next/image serves it sized and in a modern format.
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
            <Image
              src={productHero}
              alt={product.imageAlt}
              className={p.image}
              sizes="(max-width: 991px) 100vw, 45vw"
              placeholder="blur"
            />
          </div>
          <div className={s.splitText}>
            <p id="product-heading" className={s.super} data-reveal>
              {product.h2}
            </p>
            <h2
              className={p.headline}
              data-reveal
              style={{ "--rd": "80ms" } as React.CSSProperties}
            >
              {product.headline}
            </h2>
            <p
              className={s.lead}
              data-reveal
              style={{ "--rd": "160ms" } as React.CSSProperties}
            >
              {product.lead}
            </p>
            <p
              className={p.why}
              data-reveal
              style={{ "--rd": "220ms" } as React.CSSProperties}
            >
              {product.why}
            </p>
            <div data-reveal style={{ "--rd": "300ms" } as React.CSSProperties}>
              <PillButton href={openllmUrl} large external={false}>
                {product.cta}
              </PillButton>
            </div>
          </div>
        </div>
        <ul className={p.pillars}>
          {product.pillars.map((pillar, i) => (
            <li
              key={pillar.title}
              className={p.pillar}
              data-reveal
              style={{ "--rd": `${i * 80}ms` } as React.CSSProperties}
            >
              <h3 className={p.pillarTitle}>{pillar.title}</h3>
              <p className={p.pillarBody}>{pillar.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
