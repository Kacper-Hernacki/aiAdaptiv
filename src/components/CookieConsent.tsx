"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import { gaMeasurementId } from "@/config/site";
import styles from "./CookieConsent.module.css";

const STORAGE_KEY = "aiadaptiv-cookie-consent";
const LEADSY_ID = "vtag-ai-js";

type Choice = "granted" | "denied";

/** Push a Consent Mode v2 update into the GA dataLayer. Works even before
 * gtag.js finishes loading — the queued command is processed on init. */
function updateConsent(choice: Choice) {
  const value = choice === "granted" ? "granted" : "denied";
  const w = window as unknown as {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };
  const params = {
    ad_storage: value,
    analytics_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  };
  // gtag.js only processes consent commands pushed as an `arguments` object
  // via the global gtag() (defined by the Consent Mode script in the layout),
  // NOT a plain array. Ensure that global exists, then send through it.
  if (typeof w.gtag !== "function") {
    w.dataLayer = w.dataLayer || [];
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      (w.dataLayer as unknown[]).push(arguments);
    };
  }
  w.gtag("consent", "update", params);
}

/**
 * Nudge GA once consent flips from denied to granted, mid-visit.
 *
 * The page_view for this page has already gone out as a cookieless denied
 * ping and is never resent. Queuing another one makes GA emit a consented hit
 * for the session — in practice it coalesces this into its automatic
 * user_engagement rather than a second page_view, which is fine: the session
 * is then marked consented, and every later page load sends a proper
 * page_view because the layout reads the stored choice before gtag configures.
 */
function sendPageView() {
  if (!gaMeasurementId) return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag !== "function") return;
  w.gtag("event", "page_view", {
    send_to: gaMeasurementId,
    page_location: window.location.href,
    page_title: document.title,
  });
}

/** Inject the Leadsy visitor-identification pixel once, only after consent. */
function loadLeadsy() {
  if (document.getElementById(LEADSY_ID)) return;
  const s = document.createElement("script");
  s.id = LEADSY_ID;
  s.async = true;
  s.src = "https://r2.leadsy.ai/tag.js";
  s.setAttribute("data-pid", "1avdjXH59Tn2VO6Om");
  s.setAttribute("data-version", "062024");
  document.body.appendChild(s);
}

/**
 * GDPR consent banner. Defaults every tracker to "denied" (see the Consent
 * Mode default in the root layout) and only unlocks GA4 + Leadsy once the
 * visitor accepts. The choice is remembered in localStorage.
 */
export function CookieConsent({
  lang,
  dict,
  variant = "dark",
  learnMoreHref,
}: {
  lang: string;
  dict: Dictionary["cookies"];
  /** Where "learn more" points. Defaults to this locale's terms page. */
  learnMoreHref?: string;
  /** "dark" is the product site's glass pill; "light" is the agency palette,
   *  which follows that site's light/dark theme attribute. */
  variant?: "dark" | "light";
}) {
  // Starts null so the server renders nothing and there's no hydration
  // mismatch; the effect decides whether to show the banner on the client.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // localStorage may be unavailable (private mode); fall back to showing.
    }

    if (stored === "granted") {
      updateConsent("granted");
      loadLeadsy();
    } else if (stored !== "denied") {
      setVisible(true);
    }
  }, []);

  function choose(choice: Choice) {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Ignore write failures — the banner still closes for this session.
    }
    updateConsent(choice);
    if (choice === "granted") {
      loadLeadsy();
      // gtag's own page_view already went out under the denied default and is
      // never resent, so a first-time visitor who accepts would otherwise
      // produce no consented hit for the page they are actually on. Send one.
      sendPageView();
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside className={styles.banner} role="region" aria-labelledby="cookie-msg">
      <p id="cookie-msg" className={styles.text}>
        {dict.message}{" "}
        <Link href={learnMoreHref ?? `/${lang}/privacy`} className={styles.link}>
          {dict.learnMore}
        </Link>
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.decline}
          onClick={() => choose("denied")}
        >
          {dict.decline}
        </button>
        <button
          type="button"
          className={styles.accept}
          onClick={() => choose("granted")}
        >
          {dict.accept}
        </button>
      </div>
    </aside>
  );
}
