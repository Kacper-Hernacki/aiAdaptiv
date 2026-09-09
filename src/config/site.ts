/**
 * Central site configuration — non-localized brand constants and external URLs.
 * Localized copy (titles, descriptions, section text) lives in the i18n
 * dictionaries under src/i18n/. Locale routing config lives in src/i18n/config.ts.
 *
 * Set NEXT_PUBLIC_SITE_URL and NEXT_PUBLIC_BOOKING_URL in the environment
 * (see .env.example) to point at the real domain / booking link.
 */

const PLACEHOLDER_URL = "https://www.aiadaptiv.com";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? PLACEHOLDER_URL
).replace(/\/$/, "");

/**
 * Booking link behind every primary CTA. Points at the "AI mapping call"
 * Cal.com event type (30 min, Cal Video). Override with NEXT_PUBLIC_BOOKING_URL
 * to swap it without a deploy.
 */
export const bookingUrl =
  process.env.NEXT_PUBLIC_BOOKING_URL ??
  "https://cal.com/kacper-hernacki/ai-mapping-call";

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

/** Bing Webmaster Tools verification token — the `content` value from the
 * `msvalidate.01` meta tag Bing gives you under the "HTML Meta Tag" option.
 * Worth having beyond Bing itself: it is the index behind ChatGPT search.
 * Set BING_SITE_VERIFICATION to emit the tag; empty renders nothing. */
export const bingSiteVerification = process.env.BING_SITE_VERIFICATION ?? "";

/** Brand identity. */
const brand = {
  name: "aiAdaptiv",
  shortName: "aiAdaptiv",
  twitter: "@aiadaptiv",
  /** Emitted as schema.org Person entries under the Organization. */
  founders: [
    {
      name: "Kacper Hernacki",
      jobTitle: "Founder & CTO",
      /** Public profiles, emitted as the Person's schema.org `sameAs`. */
      profiles: ["https://www.linkedin.com/in/kacper-hernacki-965161203/"],
      credentials: [
        {
          name: "AI_devs 3 · Agents",
          url: "https://credsverse.com/credentials/3fc027b2-7899-4a52-8e60-ca177c4f7ad0",
        },
        {
          name: "AI_devs 2 · GPT-4 in applications and automation",
          url: "https://credsverse.com/credentials/e34b5af4-8a00-4c60-ae6e-f32658be0926",
        },
        {
          name: "AI_devs · AI Developer",
          url: "https://verified.sertifier.com/en/verify/50831241179182/",
        },
      ],
    },
  ],
  organization: {
    legalName: "aiAdaptiv",
    sameAs: [
      "https://x.com/aiadaptiv",
      "https://www.linkedin.com/company/aiadaptiv",
    ],
  },
  contactEmail: "kacper@aiadaptiv.com",
  supportEmail: "help@aiadaptiv.com",
} as const;

/**
 * English fallback metadata only; per-locale values come from the `agency.meta`
 * tree in the dictionaries.
 */
export const siteConfig = {
  ...brand,
  url: siteUrl,
  title: "aiAdaptiv — Custom AI solutions: SaaS, mobile apps, automations",
  description:
    "aiAdaptiv designs, builds and ships custom AI solutions — AI SaaS products, mobile apps, automations, pilots, marketing systems and private open-source LLM platforms. Book a call.",
  tagline: "Custom AI, built and shipped — not demoed.",
  keywords: [
    "custom AI development",
    "AI SaaS development",
    "AI mobile app development",
    "AI automation",
    "AI agents",
    "AI proof of concept",
    "AI marketing systems",
    "AI implementation partner",
    "private LLM platform",
    "aiAdaptiv",
  ],
} as const;


export type SiteConfig = typeof siteConfig;
