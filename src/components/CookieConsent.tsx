"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import styles from "./CookieConsent.module.css";

const STORAGE_KEY = "aiadaptiv-cookie-consent";
const LEADSY_ID = "vtag-ai-js";

type Choice = "granted" | "denied";

/** Push a Consent Mode v2 update into the GA dataLayer. Works even before
 * gtag.js finishes loading — the queued command is processed on init. */
function updateConsent(choice: Choice) {
  const value = choice === "granted" ? "granted" : "denied";
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push([
    "consent",
    "update",
    {
      ad_storage: value,
      analytics_storage: value,
      ad_user_data: value,
      ad_personalization: value,
    },
  ]);
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
}: {
  lang: string;
  dict: Dictionary["cookies"];
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
    if (choice === "granted") loadLeadsy();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside className={styles.banner} role="region" aria-labelledby="cookie-msg">
      <p id="cookie-msg" className={styles.text}>
        {dict.message}{" "}
        <Link href={`/${lang}/terms`} className={styles.link}>
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
