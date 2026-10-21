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

/**
 * Company Brain section booking link. Same Cal.com event as `bookingUrl`,
 * with campaign UTMs so this offer's conversions can be isolated.
 */
export const companyBrainBookingUrl =
  "https://cal.com/kacper-hernacki/ai-mapping-call?utm_source=aiadaptiv&utm_campaign=company-brain";

/** Self-serve Second Brain Pro trial, tagged from the Company Brain section. */
export const companyBrainTrialUrl =
  "https://brain.aiadaptiv.com/?utm_source=aiadaptiv&utm_campaign=company-brain-section";

/** Google Analytics 4 measurement ID (looks like `G-XXXXXXXXXX`). Must be
 * public because the gtag script runs client-side. Empty means GA is not
 * mounted. Set NEXT_PUBLIC_GA_ID to enable. */
export const gaMeasurementId = process.env.NEXT_PUBLIC_GA_ID ?? "";

/** Crisp live-chat website ID. Same workspace as brain.aiadaptiv.com.
 * Public because the widget runs in the browser. Empty means the chatbox
 * is not mounted — never fall back to a hardcoded id. Set
 * NEXT_PUBLIC_CRISP_WEBSITE_ID to enable. */
export const crispWebsiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID ?? "";

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

/**
 * IndexNow key. IndexNow lets us notify Bing (and Yandex, Seznam, Naver) the
 * moment a page changes, instead of waiting to be crawled — Google does not
 * participate, but Bing is the index behind ChatGPT search, so this is the
 * cheapest route to being current in an answer engine.
 *
 * Not a secret: ownership is proven by serving the same value at
 * /{key}.txt, which is exactly what public/449e75b09916622a2c4f9285f5601bb0.txt does. Changing
 * this constant means renaming that file too.
 */
export const indexNowKey = "449e75b09916622a2c4f9285f5601bb0";

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
          name: "AI devs 4 · Builders",
          url: "https://credsverse.com/credentials/9efa6fd2-ceb0-404b-af1e-65f64ce18f7b",
        },
        {
          name: "AI devs 3 · Agents",
          url: "https://credsverse.com/credentials/3fc027b2-7899-4a52-8e60-ca177c4f7ad0",
        },
        {
          name: "AI devs 2 · GPT-4 in applications and automation",
          url: "https://credsverse.com/credentials/e34b5af4-8a00-4c60-ae6e-f32658be0926",
        },
        {
          name: "AI devs · AI Developer",
          url: "https://verified.sertifier.com/en/verify/50831241179182/",
        },
      ],
    },
  ],
  organization: {
    legalName: "aiAdaptiv",
    sameAs: [
      "https://www.linkedin.com/company/aiadaptiv",
      "https://www.instagram.com/aiadaptiv/",
      "https://x.com/aiadaptiv",
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
