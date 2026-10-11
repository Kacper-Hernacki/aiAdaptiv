import type { Dictionary } from "@/i18n/dictionaries";
import { bookingUrl } from "@/config/site";
import { PillButton } from "./PillButton";
import { FaqAccordion } from "./FaqAccordion";
import s from "./Agency.module.css";
import aia from "./AiAuditPage.module.css";

/**
 * AI Opportunity Audit page — consulting service to identify AI automation
 * opportunities and quantify ROI. Full-page component matching the site's
 * design system.
 */
export function AiAuditPage({
  doc,
  lang,
}: {
  doc: Dictionary["aiAudit"];
  lang: string;
}) {
  const freeCallUrl = bookingUrl.replace("/ai-mapping-call", "/quick-intro");

  return (
    <main id="main" className={aia.page}>
      {/* Hero */}
      <section className={`${s.section} ${aia.hero}`}>
        <div className={s.inner}>
          <p className={s.super} data-reveal>
            {doc.hero.badge}
          </p>
          <h1
            className={aia.headline}
            data-reveal
            style={{ "--rd": "80ms" } as React.CSSProperties}
          >
            {doc.hero.headline}
          </h1>
          <p
            className={s.lead}
            data-reveal
            style={{ "--rd": "160ms" } as React.CSSProperties}
          >
            {doc.hero.subhead}
          </p>
          <div
            className={aia.heroCtas}
            data-reveal
            style={{ "--rd": "240ms" } as React.CSSProperties}
          >
            <PillButton href={bookingUrl} large>
              {doc.hero.cta}
            </PillButton>
            <PillButton href={freeCallUrl} large>
              {doc.hero.secondaryCta}
            </PillButton>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className={s.section} aria-labelledby="value-heading">
        <div className={s.inner}>
          <h2 id="value-heading" className={s.h2} data-reveal>
            {doc.value.h2}
          </h2>
          <p
            className={s.lead}
            data-reveal
            style={{ "--rd": "80ms" } as React.CSSProperties}
          >
            {doc.value.lead}
          </p>
          <div className={aia.valueGrid}>
            {doc.value.items.map((item, i) => (
              <div
                key={i}
                className={aia.valueItem}
                data-reveal
                style={{ "--rd": `${160 + i * 80}ms` } as React.CSSProperties}
              >
                <h3 className={aia.valueTitle}>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={s.section} aria-labelledby="pricing-heading">
        <div className={s.inner}>
          <h2 id="pricing-heading" className={s.h2} data-reveal>
            {doc.pricing.h2}
          </h2>
          <div className={aia.pricingCard} data-reveal>
            <div className={aia.price}>{doc.pricing.price}</div>
            <p className={aia.credit}>{doc.pricing.credit}</p>
            <p className={aia.note}>{doc.pricing.note}</p>
            <PillButton href={bookingUrl} large>
              {doc.pricing.cta}
            </PillButton>
          </div>
        </div>
      </section>

      {/* Real Results */}
      <section className={s.section} aria-labelledby="examples-heading">
        <div className={s.inner}>
          <h2 id="examples-heading" className={s.h2} data-reveal>
            {doc.examples.h2}
          </h2>
          <p
            className={s.lead}
            data-reveal
            style={{ "--rd": "80ms" } as React.CSSProperties}
          >
            {doc.examples.lead}
          </p>
          <div className={aia.examplesGrid}>
            {doc.examples.cases.map((c, i) => (
              <div
                key={i}
                className={aia.exampleCard}
                data-reveal
                style={{ "--rd": `${160 + i * 80}ms` } as React.CSSProperties}
              >
                <h3 className={aia.exampleTitle}>{c.title}</h3>
                <p className={aia.exampleResult}>{c.result}</p>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className={s.section} aria-labelledby="process-heading">
        <div className={s.inner}>
          <h2 id="process-heading" className={s.h2} data-reveal>
            {doc.process.h2}
          </h2>
          <p
            className={s.lead}
            data-reveal
            style={{ "--rd": "80ms" } as React.CSSProperties}
          >
            {doc.process.lead}
          </p>
          <div className={aia.processSteps}>
            {doc.process.steps.map((step, i) => (
              <div
                key={i}
                className={aia.processStep}
                data-reveal
                style={{ "--rd": `${160 + i * 80}ms` } as React.CSSProperties}
              >
                <div className={aia.stepNumber}>{step.step}</div>
                <h3 className={aia.stepTitle}>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={s.section} aria-labelledby="faq-heading">
        <div className={s.inner}>
          <h2 id="faq-heading" className={s.h2} data-reveal>
            {doc.faq.h2}
          </h2>
          <FaqAccordion items={doc.faq.items} />
        </div>
      </section>

      {/* CTA */}
      <section className={s.section} aria-labelledby="cta-heading">
        <div className={s.inner}>
          <div className={aia.ctaBlock}>
            <h2 id="cta-heading" className={s.h2} data-reveal>
              {doc.cta.h2}
            </h2>
            <p
              className={s.lead}
              data-reveal
              style={{ "--rd": "80ms" } as React.CSSProperties}
            >
              {doc.cta.body}
            </p>
            <div
              className={aia.ctaButtons}
              data-reveal
              style={{ "--rd": "160ms" } as React.CSSProperties}
            >
              <PillButton href={bookingUrl} large>
                {doc.cta.primaryCta}
              </PillButton>
              <PillButton href={freeCallUrl} large>
                {doc.cta.secondaryCta}
              </PillButton>
            </div>
          </div>
        </div>
      </section>

      {/* Back link */}
      <section className={s.section}>
        <div className={s.inner}>
          <p>
            <a href={`/${lang}`} className={aia.backLink}>
              {doc.backHome}
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
