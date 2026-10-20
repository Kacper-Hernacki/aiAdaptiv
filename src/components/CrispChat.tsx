"use client";

import { useEffect } from "react";
import { hasAnalyticsConsent, onConsentChange } from "@/lib/consent";
import {
  applyCrispAppearance,
  loadCrisp,
  removeCrisp,
  setCrispLocale,
} from "@/lib/crisp";

/**
 * Consent-gated Crisp chatbox. Renders nothing on the server; the parent
 * omits this component entirely when `NEXT_PUBLIC_CRISP_WEBSITE_ID` is empty.
 */
export function CrispChat({
  lang,
  websiteId,
}: {
  lang: string;
  websiteId: string;
}) {
  useEffect(() => {
    if (!websiteId) return;

    function sync(granted: boolean) {
      if (granted) loadCrisp(websiteId, lang);
      else removeCrisp();
    }

    sync(hasAnalyticsConsent());
    return onConsentChange((choice) => sync(choice === "granted"));
  }, [lang, websiteId]);

  useEffect(() => {
    if (!websiteId || !hasAnalyticsConsent()) return;
    setCrispLocale(lang);
    applyCrispAppearance(lang);

    const root = document.documentElement;
    const observer = new MutationObserver(() => applyCrispAppearance(lang));
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, [lang, websiteId]);

  return null;
}
