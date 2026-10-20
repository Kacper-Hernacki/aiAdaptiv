"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  notifyConsent,
  readConsent,
  writeConsent,
  type ConsentChoice,
} from "@/lib/consent";
import { crispWebsiteId } from "@/config/site";
import { loadCrisp, removeCrisp } from "@/lib/crisp";
import {
  loadGoogleAnalytics,
  unloadGoogleAnalytics,
  updateGoogleConsent,
} from "@/lib/track";
import styles from "./CookieConsent.module.css";

const LEADSY_ID = "vtag-ai-js";

type Choice = ConsentChoice;

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

function removeLeadsy() {
  document.getElementById(LEADSY_ID)?.remove();
}

/**
 * GDPR consent banner. Defaults every tracker to "denied" (see the Consent
 * Mode default in the root layout) and only unlocks GA4 + Leadsy + Crisp once
 * the visitor accepts. The choice is remembered in localStorage.
 */
export function CookieConsent({
  lang,
  dict,
  learnMoreHref,
}: {
  lang: string;
  dict: Dictionary["cookies"];
  /** Where "learn more" points. Defaults to this locale's privacy page. */
  learnMoreHref?: string;
}) {
  // Starts null so the server renders nothing and there's no hydration
  // mismatch; the effect decides whether to show the banner on the client.
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = readConsent();

    if (stored === "granted") {
      updateGoogleConsent(true);
      loadGoogleAnalytics();
      loadLeadsy();
      if (crispWebsiteId) loadCrisp(crispWebsiteId, lang);
    } else if (stored === "denied") {
      removeLeadsy();
      unloadGoogleAnalytics();
      removeCrisp();
    } else {
      Promise.resolve().then(() => setVisible(true));
    }
  }, [lang]);

  function choose(choice: Choice) {
    writeConsent(choice);
    updateGoogleConsent(choice === "granted");
    if (choice === "granted") {
      loadGoogleAnalytics();
      loadLeadsy();
      if (crispWebsiteId) loadCrisp(crispWebsiteId, lang);
    } else {
      removeLeadsy();
      unloadGoogleAnalytics();
      removeCrisp();
    }
    notifyConsent(choice);
    setVisible(false);
  }

  if (visible !== true) return null;

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
