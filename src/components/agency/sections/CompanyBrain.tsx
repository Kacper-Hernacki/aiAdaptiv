import type { CSSProperties, ReactNode } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  companyBrainBookingUrl,
  companyBrainTrialUrl,
} from "@/config/site";
import { PillButton } from "../PillButton";
import s from "../Agency.module.css";
import cb from "./CompanyBrain.module.css";

/**
 * Lucide-style stroke icons (24×24). lucide-react is not in this repo; the
 * rest of the site uses inline SVGs, so these paths are inlined the same way.
 */
const ICONS: Record<string, ReactNode> = {
  server: (
    <>
      <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
      <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
      <line x1="6" x2="6.01" y1="6" y2="6" />
      <line x1="6" x2="6.01" y1="18" y2="18" />
    </>
  ),
  mcp: (
    <>
      <path d="M12 22v-5" />
      <path d="M9 8V2" />
      <path d="M15 8V2" />
      <path d="M18 8v5a6 6 0 0 1-12 0V8" />
    </>
  ),
  notes: (
    <>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </>
  ),
  setup: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
};

function FeatureIcon({ id }: { id: string }) {
  const paths = ICONS[id] ?? ICONS.notes;
  return (
    <span className={cb.icon} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths}
      </svg>
    </span>
  );
}

/**
 * Main paid offer: a done-for-you company second brain on the client's own
 * EU server, connected via MCP to the AI tools the team already uses.
 */
export function CompanyBrain({
  companyBrain,
}: {
  companyBrain: Dictionary["agency"]["companyBrain"];
}) {
  return (
    <section
      id="company-brain"
      aria-labelledby="company-brain-heading"
      className={`${s.section} ${s.bandAlt}`}
    >
      <div className={`${s.inner} ${cb.wrap}`}>
        <div className={`${s.titleWrap} ${cb.intro}`}>
          <p className={cb.badge} data-reveal>
            {companyBrain.badge}
          </p>
          <p
            className={s.super}
            data-reveal
            style={{ "--rd": "40ms" } as CSSProperties}
          >
            {companyBrain.h2}
          </p>
          <h2
            id="company-brain-heading"
            className={s.h2}
            data-reveal
            style={{ "--rd": "80ms" } as CSSProperties}
          >
            {companyBrain.headline}
          </h2>
          <p
            className={s.lead}
            data-reveal
            style={{ "--rd": "160ms" } as CSSProperties}
          >
            {companyBrain.lead}
          </p>
        </div>
        <ul className={cb.grid}>
          {companyBrain.items.map((item, i) => (
            <li
              key={item.id}
              className={cb.card}
              data-reveal
              style={{ "--rd": `${200 + i * 80}ms` } as CSSProperties}
            >
              <FeatureIcon id={item.id} />
              <h3 className={cb.cardTitle}>{item.title}</h3>
              <p className={cb.cardBody}>{item.body}</p>
            </li>
          ))}
        </ul>
        <div
          className={cb.actions}
          data-reveal
          style={{ "--rd": "520ms" } as CSSProperties}
        >
          <p className={cb.price}>{companyBrain.price}</p>
          <PillButton
            href={companyBrainBookingUrl}
            large
            ctaId="book_call"
            location="company_brain"
          >
            {companyBrain.cta}
          </PillButton>
          <a
            href={companyBrainTrialUrl}
            className={cb.secondary}
            target="_blank"
            rel="noopener noreferrer"
            data-cta-id="second_brain_pro"
            data-location="company_brain"
          >
            {companyBrain.secondary}
          </a>
        </div>
      </div>
    </section>
  );
}
