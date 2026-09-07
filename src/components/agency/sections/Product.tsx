import Link from "next/link";
import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import { PillButton } from "../PillButton";
import productHero from "../assets/product-hero.jpg";
import s from "../Agency.module.css";
import p from "./Product.module.css";

/**
 * The private open-source-LLM offer on the homepage, linking to its own page
 * at /[lang]/private-ai. Both the image and the button go to the page.
 */
export function Product({
  product,
  lang,
}: {
  product: Dictionary["agency"]["product"];
  lang: string;
}) {
  const href = `/${lang}/private-ai`;

  return (
    <section
      id="product"
      aria-labelledby="product-heading"
      className={s.section}
    >
      <div className={s.inner}>
        <div className={s.split}>
          <Link
            href={href}
            className={`${s.splitMedia} ${p.imageLink}`}
            aria-label={product.cta}
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
          </Link>
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
              <PillButton href={href} large external={false}>
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
