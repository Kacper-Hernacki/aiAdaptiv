/**
 * Central site configuration — non-localized brand constants and external URLs.
 * Localized copy (titles, descriptions, section text) lives in the i18n
 * dictionaries under src/i18n/. Locale routing config lives in src/i18n/config.ts.
 *
 * Set NEXT_PUBLIC_SITE_URL and NEXT_PUBLIC_CALENDLY_URL in the environment
 * (see .env.example) to point at the real domain / booking link.
 */

const PLACEHOLDER_URL = "https://www.aiadaptiv.com";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? PLACEHOLDER_URL
).replace(/\/$/, "");

/** Calendly (or any booking) link. Now reached via the Tally form's ending
 * screen, so it's no longer triggered directly from the page. */
export const calendlyUrl =
  process.env.NEXT_PUBLIC_CALENDLY_URL ?? "https://calendly.com/d/dzz5-bt2-xyk";

/** Tally eligibility form. Every primary CTA opens this as a popup. */
export const tallyFormId =
  process.env.NEXT_PUBLIC_TALLY_FORM_ID ?? "0Ql1X9";

export const tallyUrl = `https://tally.so/r/${tallyFormId}`;

/** Google Analytics 4 measurement ID (looks like `G-XXXXXXXXXX`). Must be
 * public because the gtag script runs client-side. Empty means GA is not
 * mounted. Set NEXT_PUBLIC_GA_ID to enable. */
export const gaMeasurementId = process.env.NEXT_PUBLIC_GA_ID ?? "";

/** Google Search Console verification token — the `content` value from the
 * `google-site-verification` meta tag Google gives you in the "HTML tag"
 * verification method. Set GOOGLE_SITE_VERIFICATION to emit the tag; empty
 * means no tag is rendered. */
export const googleSiteVerification =
  process.env.GOOGLE_SITE_VERIFICATION ?? "";

export const siteConfig = {
  name: "aiAdaptiv",
  shortName: "aiAdaptiv",
  url: siteUrl,
  // English fallback metadata (per-locale values come from the dictionaries).
  title: "aiAdaptiv — Private, GDPR-Compliant AI Platform for Your Business",
  description:
    "Launch a private, EU-hosted AI platform powered by open-source models. Fully GDPR and EU AI Act compliant. We deploy, manage, and update it for you. Book a call.",
  tagline: "Private, sovereign AI for European businesses.",
  twitter: "@aiadaptiv",
  keywords: [
    "private AI platform",
    "GDPR compliant AI",
    "EU AI Act",
    "sovereign AI",
    "self-hosted LLM",
    "open source LLM",
    "AI agents",
    "whitelabel AI",
    "aiAdaptiv",
  ],
  organization: {
    legalName: "aiAdaptiv",
    sameAs: [
      "https://x.com/aiadaptiv",
      "https://www.linkedin.com/company/aiadaptiv",
      "https://github.com/aiadaptiv",
    ],
  },
  contactEmail: "kacper@aiadaptiv.com",
  supportEmail: "help@aiadaptiv.com",
} as const;

export type SiteConfig = typeof siteConfig;
