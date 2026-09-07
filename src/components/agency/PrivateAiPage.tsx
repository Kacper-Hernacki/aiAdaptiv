import Link from "next/link";
import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import { bookingUrl } from "@/config/site";
import { PillButton } from "./PillButton";
import productHero from "./assets/product-hero.jpg";
import s from "./Agency.module.css";
import f from "./sections/Faq.module.css";
import c from "./PrivateAiPage.module.css";

/**
 * The private open-source-LLM offer as a page inside the agency site. All copy
 * is the former standalone landing page's, under `dict.privateAi`, rendered
 * with the agency's components: a case-study hero, then one band per section.
 */
export function PrivateAiPage({
  doc,
  lang,
}: {
  doc: Dictionary["privateAi"];
  lang: string;
}) {
  const {
    hero,
    problem,
    solution,
    howItWorks,
    behindTheArchitecture,
    faq,
    qualifier,
  } = doc;

  return (
    <main id="main">
      {/* Hero: text card beside the product image */}
      <section aria-labelledby="pai-heading" className={s.section}>
        <div className={s.inner}>
          <Link href={`/${lang}`} className={c.back}>
            {doc.backHome}
          </Link>
          <div className={c.heroGrid}>
            <div className={c.heroCard}>
              <div>
                <p className={s.super}>{hero.badge}</p>
                <h1 id="pai-heading" className={c.h1}>
                  {hero.headline.map((part, i) => (
                    <span key={i} className={part.accent ? c.accent : undefined}>
                      {part.text}
                    </span>
                  ))}
                </h1>
              </div>
              <div>
                <p className={c.sub}>{hero.subhead}</p>
                <p className={c.tagline}>{hero.tagline}</p>
                <ul className={s.tags}>
                  {doc.tags.map((tag) => (
                    <li key={tag} className={s.tag}>
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <PillButton href={bookingUrl}>{doc.cta}</PillButton>
              </div>
            </div>
            <Image
              src={productHero}
              alt={doc.imageLabel}
              className={c.heroImage}
              sizes="(max-width: 991px) 100vw, 55vw"
              placeholder="blur"
              priority
            />
          </div>
        </div>
      </section>

      {/* The problem — always-dark band */}
      <section
        aria-labelledby="pai-problem"
        className={`${s.section} ${s.bandDark}`}
      >
        <div className={s.inner}>
          <h2 id="pai-problem" className={s.h2} data-reveal>
            {problem.h2}
          </h2>
          <ul className={s.points}>
            {problem.points.map((point, i) => (
              <li
                key={i}
                className={s.point}
                data-reveal
                style={{ "--rd": `${80 + i * 70}ms` } as React.CSSProperties}
              >
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What we deploy */}
      <section aria-labelledby="pai-solution" className={s.section}>
        <div className={s.inner}>
          <h2 id="pai-solution" className={s.h2} data-reveal>
            {solution.h2}
          </h2>
          <ul className={s.cardGrid}>
            {solution.pillars.map((pillar, i) => (
              <li
                key={pillar.title}
                className={s.card}
                data-reveal
                style={{ "--rd": `${80 + i * 80}ms` } as React.CSSProperties}
              >
                <h3 className={s.cardTitle}>{pillar.title}</h3>
                <p className={s.cardBody}>{pillar.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section
        aria-labelledby="pai-how"
        className={`${s.section} ${s.bandAlt}`}
      >
        <div className={s.inner}>
          <div className={s.titleWrap}>
            <h2 id="pai-how" className={s.h2} data-reveal>
              {howItWorks.h2}
            </h2>
            <p
              className={s.lead}
              data-reveal
              style={{ "--rd": "80ms" } as React.CSSProperties}
            >
              {howItWorks.intro}
            </p>
          </div>
          <ol className={s.cardGrid}>
            {howItWorks.steps.map((step, i) => (
              <li
                key={step.title}
                className={s.card}
                data-reveal
                style={{ "--rd": `${160 + i * 80}ms` } as React.CSSProperties}
              >
                <h3 className={s.cardTitle}>{step.title}</h3>
                <p className={s.cardBody}>{step.body}</p>
              </li>
            ))}
          </ol>
          <p className={c.outro} data-reveal>
            {howItWorks.timeline}
          </p>
          <p className={c.flowLabel} data-reveal>
            {howItWorks.roadmap.label}
          </p>
          <ul className={c.roadmap}>
            {howItWorks.roadmap.days.map((day, i) => (
              <li
                key={day.label}
                className={c.day}
                data-reveal
                style={{ "--rd": `${i * 60}ms` } as React.CSSProperties}
              >
                <span className={c.dayLabel}>{day.label}</span>
                <span>{day.body}</span>
              </li>
            ))}
            <li className={`${c.day} ${c.result}`} data-reveal>
              <span className={c.dayLabel}>{howItWorks.roadmap.resultLabel}</span>
              <span>{howItWorks.roadmap.result}</span>
            </li>
          </ul>
          <p className={c.flowLabel} data-reveal>
            {howItWorks.flowLabel}
          </p>
          <pre className={c.flow} data-reveal>
            {howItWorks.flow}
          </pre>
          <p className={c.outro} data-reveal>
            {howItWorks.outro}
          </p>
        </div>
      </section>


      {/* Behind the architecture */}
      <section
        aria-labelledby="pai-arch"
        className={`${s.section} ${s.bandAlt}`}
      >
        <div className={s.inner}>
          <div className={s.titleWrap}>
            <h2 id="pai-arch" className={s.h2} data-reveal>
              {behindTheArchitecture.h2}
            </h2>
            <p
              className={s.lead}
              data-reveal
              style={{ "--rd": "80ms" } as React.CSSProperties}
            >
              {behindTheArchitecture.lead}
            </p>
          </div>
          {behindTheArchitecture.body.map((paragraph, i) => (
            <p
              key={i}
              className={c.outro}
              data-reveal
              style={{ "--rd": `${160 + i * 70}ms` } as React.CSSProperties}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="pai-faq" className={s.section}>
        <div className={s.inner}>
          <h2 id="pai-faq" className={s.h2} data-reveal>
            {faq.h2}
          </h2>
          <dl className={f.list}>
            {faq.items.map((item, i) => (
              <div
                key={item.q}
                className={f.item}
                data-reveal
                style={{ "--rd": `${60 + i * 50}ms` } as React.CSSProperties}
              >
                <dt className={f.q}>{item.q}</dt>
                <dd className={f.a}>{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Qualifier + CTA — dark closing band */}
      <section
        aria-labelledby="pai-qualify"
        className={`${s.section} ${s.ctaSection}`}
      >
        <span className={s.ctaGlow} aria-hidden="true" />
        <div className={s.inner}>
          <div className={s.ctaInner}>
            <h2 id="pai-qualify" className={s.h2} data-reveal>
              {qualifier.h2}
            </h2>
            <ul className={c.fit}>
              <li className={c.fitItem} data-reveal>
                <span className={c.fitLabel}>{qualifier.yesLabel}</span>
                {qualifier.yes}
              </li>
              <li
                className={c.fitItem}
                data-reveal
                style={{ "--rd": "80ms" } as React.CSSProperties}
              >
                <span className={c.fitLabel}>{qualifier.noLabel}</span>
                {qualifier.no}
              </li>
            </ul>
            <div
              className={s.ctaBtnWrap}
              data-reveal
              style={{ "--rd": "160ms" } as React.CSSProperties}
            >
              <PillButton href={bookingUrl}>{doc.cta}</PillButton>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
