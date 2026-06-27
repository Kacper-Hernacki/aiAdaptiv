/**
 * Central site configuration — non-localized brand constants and external URLs.
 * Localized copy (titles, descriptions, section text) lives in the i18n
 * dictionaries under src/i18n/. Locale routing config lives in src/i18n/config.ts.
 *
 * Set NEXT_PUBLIC_SITE_URL and NEXT_PUBLIC_CALENDLY_URL in the environment
 * (see .env.example) to point at the real domain / booking link.
 */

const PLACEHOLDER_URL = "https://www.aiadaptiv.ai";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? PLACEHOLDER_URL
).replace(/\/$/, "");

/** Calendly (or any booking) link used by every CTA. */
export const calendlyUrl =
  process.env.NEXT_PUBLIC_CALENDLY_URL ?? "https://calendly.com/aiadaptiv/intro";

export const siteConfig = {
  name: "aiAdaptiv",
  shortName: "aiAdaptiv",
  url: siteUrl,
  // English fallback metadata (per-locale values come from the dictionaries).
  title: "aiAdaptiv — Private, GDPR-Compliant AI Platform for Your Business",
  description:
    "Launch a private, EU-hosted AI platform (Koyeb + Dify.ai) with open-source LLMs like Llama and Mistral. Fully GDPR and EU AI Act compliant. Book a call.",
  tagline: "Private, sovereign AI for European businesses.",
  twitter: "@aiadaptiv",
  keywords: [
    "private AI platform",
    "GDPR compliant AI",
    "EU AI Act",
    "sovereign AI",
    "self-hosted LLM",
    "Dify.ai",
    "Koyeb",
    "open source LLM",
    "Llama",
    "Mistral",
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
  contactEmail: "hello@aiadaptiv.ai",
} as const;

export type SiteConfig = typeof siteConfig;
