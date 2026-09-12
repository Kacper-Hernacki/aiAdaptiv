import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { bookingUrl } from "@/config/site";
import type { CaseStudy, CaseStudyCopy } from "@/content/case-studies";
import { PillButton } from "./PillButton";
import { LoomEmbed } from "./LoomEmbed";
import loomPoster from "./assets/loom-poster.jpg";
import s from "./Agency.module.css";
import c from "./CaseStudyPage.module.css";

/**
 * One case study. The order is the argument: what it is, the facts, the
 * numbers, the story, the evidence, then what we deliberately do not claim.
 * The disclaimer sits before the CTA on purpose — a reader should meet the
 * limits of the case while still reading it, not after being asked to book.
 */
export function CaseStudyPage({
  study,
  copy,
  lang,
}: {
  study: CaseStudy;
  copy: CaseStudyCopy;
  lang: Locale;
}) {
  return (
    <main id="main">
      <section aria-labelledby="case-heading" className={s.section}>
        <div className={s.inner}>
          <Link href={`/${lang}/case-studies`} className={c.back}>
            ← {copy.backLabel}
          </Link>
          <div className={study.hero ? c.heroGrid : undefined}>
            <div className={c.head}>
              <p className={s.super}>{copy.kindLabel}</p>
              <h1 id="case-heading" className={c.h1}>
                {copy.title}
              </h1>
              <p className={c.deck}>{copy.deck}</p>
            </div>
            {study.hero ? (
              /* Decorative: the sketch illustrates the case, it does not
                 carry information the text leaves out. */
              <Image
                src={study.hero}
                alt=""
                aria-hidden="true"
                className={c.heroImage}
                sizes="(max-width: 991px) 100vw, 40vw"
                placeholder="blur"
                priority
              />
            ) : null}
          </div>
          <ul className={c.facts}>
            {copy.facts.map((fact) => (
              <li key={fact.label}>
                <p className={c.factLabel}>{fact.label}</p>
                <p className={c.factValue}>{fact.value}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="case-metrics"
        className={`${s.section} ${s.bandDark}`}
      >
        <div className={s.inner}>
          <h2 id="case-metrics" className={`${s.h2} ${c.pull}`} data-reveal>
            {copy.pull}
          </h2>
          <ul className={c.metrics}>
            {copy.metrics.map((metric, i) => (
              <li
                key={metric.label}
                className={c.metric}
                data-reveal
                style={{ "--rd": `${i * 80}ms` } as React.CSSProperties}
              >
                <span className={c.metricValue}>{metric.value}</span>
                <span className={c.metricLabel}>{metric.label}</span>
                {metric.note ? (
                  <span className={c.metricNote}>{metric.note}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {copy.sections.map((block, i) => (
        <section
          key={block.h}
          aria-labelledby={`case-block-${i}`}
          className={`${s.section} ${c.storyBand}`}
        >
          <div className={s.inner}>
            <div className={c.body} data-reveal>
              <h2 id={`case-block-${i}`} className={c.blockH}>
                {block.h}
              </h2>
              {block.paragraphs.map((paragraph, p) => (
                <p key={p} className={c.para}>
                  {paragraph}
                </p>
              ))}
              {block.bullets ? (
                <ul className={c.bullets}>
                  {block.bullets.map((bullet, b) => (
                    <li key={b} className={c.bullet}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </section>
      ))}

      <section
        aria-labelledby="case-proof"
        className={`${s.section} ${s.bandAlt}`}
      >
        <div className={s.inner}>
          <h2 id="case-proof" className={s.h2} data-reveal>
            {copy.proof.label}
          </h2>
          {study.loomId && copy.proof.video ? (
            <figure className={c.proofFigure} data-reveal>
              <LoomEmbed
                id={study.loomId}
                video={copy.proof.video}
                poster={loomPoster}
              />
              <figcaption className={c.caption}>{copy.proof.caption}</figcaption>
            </figure>
          ) : study.image ? (
            <figure className={c.proofFigure} data-reveal>
              {/* A plain <img>: the diagrams are SVG, so there is nothing for
                  the image optimizer to do but re-encode them. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={study.image.src}
                alt={copy.proof.alt ?? copy.proof.caption}
                width={study.image.width}
                height={study.image.height}
                className={c.proofImage}
                loading="lazy"
                decoding="async"
              />
              <figcaption className={c.caption}>{copy.proof.caption}</figcaption>
            </figure>
          ) : (
            /* Some cases cannot show a picture — publishing the screenshot
               would publish something that is not ours. Then the caption is
               the section, and it reads as prose rather than as a caption
               orphaned under nothing. */
            <p className={c.proofNote} data-reveal>
              {copy.proof.caption}
            </p>
          )}

          <div
            className={c.disclaimer}
            style={{ marginTop: "3em" }}
            data-reveal
          >
            <h3 className={c.disclaimerH}>{copy.disclaimer.h}</h3>
            <p className={c.disclaimerBody}>{copy.disclaimer.body}</p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="case-cta"
        className={`${s.section} ${s.ctaSection}`}
      >
        <span className={s.ctaGlow} aria-hidden="true" />
        <div className={s.inner}>
          <div className={s.ctaInner}>
            <h2 id="case-cta" className={s.h2} data-reveal>
              {copy.cta.h}
            </h2>
            <p className={s.ctaSub} data-reveal>
              {copy.cta.body}
            </p>
            <div className={s.ctaBtnWrap} data-reveal>
              <PillButton href={bookingUrl}>{copy.cta.button}</PillButton>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
