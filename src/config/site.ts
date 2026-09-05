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

/**
 * Base URL of the open-source-LLM product site, served from its own subdomain
 * by the host rewrite in src/proxy.ts. Everything under app/(openllm)/ uses
 * this instead of `siteUrl` for canonicals, hreflang, sitemap and JSON-LD —
 * the root domain now serves the agency site.
 */
export const openllmUrl = (
  process.env.NEXT_PUBLIC_OPENLLM_URL ?? "https://openllm.aiadaptiv.com"
).replace(/\/$/, "");

/** Hostname of the open-LLM site, used by the proxy to route by Host header. */
export const openllmHost = new URL(openllmUrl).host;

/** Calendly (or any booking) link. Now reached via the Tally form's ending
 * screen, so it's no longer triggered directly from the page. */
export const calendlyUrl =
  process.env.NEXT_PUBLIC_CALENDLY_URL ?? "https://calendly.com/d/dzz5-bt2-xyk";

/** Booking link for the agency site — every primary CTA on aiadaptiv.com opens
 * this directly (no eligibility form in front of it, unlike the product site). */
export const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL ?? calendlyUrl;

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

/** Brand identity shared by both sites (root agency + openllm product). */
const brand = {
  name: "aiAdaptiv",
  shortName: "aiAdaptiv",
  twitter: "@aiadaptiv",
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

/**
 * Root domain — the agency site. English fallback metadata only; per-locale
 * values come from the `agency.meta` tree in the dictionaries.
 */
export const siteConfig = {
  ...brand,
  url: siteUrl,
  title: "aiAdaptiv — AI systems that ship, for European companies",
  description:
    "aiAdaptiv designs, builds and runs production AI systems for European companies — private LLM platforms, AI agents and workflow automation, deployed on infrastructure you own. Book a call.",
  tagline: "We build the AI systems European companies actually run on.",
  keywords: [
    "AI consulting",
    "AI automation agency",
    "AI agents",
    "custom AI systems",
    "LLM integration",
    "workflow automation",
    "AI implementation partner",
    "EU AI consultancy",
    "aiAdaptiv",
  ],
} as const;

/**
 * openllm.aiadaptiv.com — the private, EU-hosted open-source-LLM product.
 * Served from app/(openllm)/ via the host rewrite in src/proxy.ts.
 */
export const openllmConfig = {
  ...brand,
  url: openllmUrl,
  title: "aiAdaptiv — Private, GDPR-Compliant AI Platform for Your Business",
  description:
    "Launch a private, EU-hosted AI platform powered by open-source models. Fully GDPR and EU AI Act compliant. We deploy, manage, and update it for you. Book a call.",
  tagline: "Private, sovereign AI for European businesses.",
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
} as const;

export type SiteConfig = typeof siteConfig;
export type OpenllmConfig = typeof openllmConfig;
