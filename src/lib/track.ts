import { track as vercelTrack } from "@vercel/analytics";
import { bookingUrl, gaMeasurementId } from "@/config/site";
import { hasAnalyticsConsent } from "@/lib/consent";

export const GTAG_SCRIPT_ID = "google-analytics-script";

export type TrackEventName = "cta_click" | "generate_lead" | "language_switch";

export type TrackPayloads = {
  cta_click: {
    cta_id: string;
    location: string;
    lang: string;
  };
  generate_lead: {
    source: "lead_form" | "booking";
    lang: string;
    location?: string;
  };
  language_switch: {
    from: string;
    to: string;
    lang: string;
  };
};

type GtagFn = (...args: unknown[]) => void;

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: GtagFn;
};

let gtagConfigured = false;

function analyticsWindow(): AnalyticsWindow | null {
  if (typeof window === "undefined") return null;
  return window as AnalyticsWindow;
}

/**
 * Define the official gtag stub (`dataLayer.push(arguments)`). Never replace
 * an existing function — gtag.js only processes `arguments` objects, not the
 * arrays a rest-parameter wrapper would push.
 */
export function ensureGtag(): void {
  const w = analyticsWindow();
  if (!w) return;
  w.dataLayer = w.dataLayer || [];
  if (typeof w.gtag === "function") return;
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
}

function gtag(...args: unknown[]): void {
  ensureGtag();
  analyticsWindow()?.gtag?.(...args);
}

export function updateGoogleConsent(granted: boolean): void {
  const value = granted ? "granted" : "denied";
  gtag("consent", "update", {
    ad_storage: value,
    analytics_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  });
}

/**
 * Queue `js` + `config`, then inject gtag.js once. `send_page_view` is off
 * because `AnalyticsClient` emits an explicit page_view after consent and on
 * every App Router navigation (locale pages included).
 */
export function loadGoogleAnalytics(): void {
  if (!gaMeasurementId) return;
  ensureGtag();
  if (!gtagConfigured) {
    gtagConfigured = true;
    gtag("js", new Date());
    gtag("config", gaMeasurementId, {
      send_page_view: false,
    });
  }
  if (typeof document === "undefined") return;
  if (document.getElementById(GTAG_SCRIPT_ID)) return;
  const script = document.createElement("script");
  script.id = GTAG_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
  document.head.appendChild(script);
}

export function unloadGoogleAnalytics(): void {
  gtagConfigured = false;
  if (typeof document === "undefined") return;
  document.getElementById(GTAG_SCRIPT_ID)?.remove();
  document.cookie.split(";").forEach((entry) => {
    const cookie = entry.trim();
    if (!cookie.startsWith("_ga") && !cookie.startsWith("_gid")) return;
    const name = cookie.split("=")[0];
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
}

export function sendGaPageView(path: string): void {
  if (!gaMeasurementId || !hasAnalyticsConsent()) return;
  ensureGtag();
  gtag("event", "page_view", {
    send_to: gaMeasurementId,
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function currentLang(): string {
  if (typeof document !== "undefined" && document.documentElement.lang) {
    return document.documentElement.lang;
  }
  if (typeof window !== "undefined") {
    const segment = window.location.pathname.split("/")[1];
    if (segment) return segment;
  }
  return "en";
}

export function isBookingHref(href: string): boolean {
  if (!href) return false;
  const value = href.trim();
  if (value.includes("cal.com/")) return true;
  if (bookingUrl && (value === bookingUrl || value.startsWith(bookingUrl))) {
    return true;
  }
  return false;
}

/** Infer a `cta_id` from the destination when the markup did not set one. */
export function classifyCtaId(href: string): string | null {
  const value = href.trim();
  if (value.startsWith("mailto:")) return "email";
  if (isBookingHref(value)) return "book_call";
  if (value.includes("brain.aiadaptiv")) return "second_brain_pro";

  let path = value.split(/[?#]/)[0] ?? value;
  if (value.startsWith("http") && typeof window !== "undefined") {
    try {
      path = new URL(value, window.location.origin).pathname;
    } catch {
      return null;
    }
  }
  if (/\/[a-z]{2}\/ai-audit\/?$/.test(path)) return "ai_audit";
  if (/\/[a-z]{2}\/private-ai\/?$/.test(path)) return "private_ai";
  if (/\/[a-z]{2}\/case-studies(\/[\w-]+)?\/?$/.test(path)) return "case_study";
  return null;
}

export function inferLocation(el: Element): string {
  const section = el.closest("section[id], header, footer");
  if (section instanceof HTMLElement) {
    if (section.id) return section.id;
    const tag = section.tagName.toLowerCase();
    if (tag === "header" || tag === "footer") return tag;
  }
  return "page";
}

/**
 * Send a custom event to Vercel Analytics always, and to GA4 only when the
 * visitor has consented and gtag is defined (the layout stub counts).
 */
export function track<E extends TrackEventName>(
  name: E,
  params: TrackPayloads[E],
): void {
  const data = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  ) as Record<string, string>;
  try {
    vercelTrack(name, data);
  } catch {
    // Never let analytics break a click or a form submit.
  }

  if (!hasAnalyticsConsent() || !gaMeasurementId) return;
  ensureGtag();
  if (typeof analyticsWindow()?.gtag !== "function") return;
  gtag("event", name, data);
}
