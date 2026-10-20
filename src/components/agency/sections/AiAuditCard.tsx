import type { Dictionary } from "@/i18n/dictionaries";
import { PillButton } from "../PillButton";
import s from "../Agency.module.css";
import aac from "./AiAuditCard.module.css";

/**
 * AI Opportunity Audit card for the homepage — compact promo section linking
 * to the full /ai-audit page. Sits between products and approach sections.
 */
export function AiAuditCard({
  aiAuditCard,
  lang,
}: {
  aiAuditCard: Dictionary["agency"]["aiAuditCard"];
  lang: string;
}) {
  return (
    <section
      id="ai-audit"
      aria-labelledby="ai-audit-heading"
      className={s.section}
    >
      <div className={s.inner}>
        <div className={aac.container}>
          <div className={aac.content}>
            <p id="ai-audit-heading" className={s.super} data-reveal>
              {aiAuditCard.h2}
            </p>
            <h2
              className={aac.headline}
              data-reveal
              style={{ "--rd": "80ms" } as React.CSSProperties}
            >
              {aiAuditCard.headline}
            </h2>
            <p
              className={s.lead}
              data-reveal
              style={{ "--rd": "160ms" } as React.CSSProperties}
            >
              {aiAuditCard.body}
            </p>
            <div data-reveal style={{ "--rd": "240ms" } as React.CSSProperties}>
              <PillButton
                href={`/${lang}/ai-audit`}
                large
                ctaId="ai_audit"
                location="home"
              >
                {aiAuditCard.cta}
              </PillButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
