"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { hasAnalyticsConsent, onConsentChange } from "@/lib/consent";
import {
  classifyCtaId,
  currentLang,
  inferLocation,
  isBookingHref,
  isCtaId,
  loadGoogleAnalytics,
  sendGaPageView,
  track,
} from "@/lib/track";

/**
 * Client-side analytics: consented GA4 page_view on App Router navigations
 * (including locale changes), plus click delegation for CTAs.
 */
export function AnalyticsClient() {
  useGaPageViews();
  useLanguageSwitch();
  useCtaClicks();
  return null;
}

function useGaPageViews() {
  const pathname = usePathname();

  useEffect(() => {
    const send = () => {
      if (!hasAnalyticsConsent()) return;
      loadGoogleAnalytics();
      sendGaPageView(pathname);
    };

    const frame = requestAnimationFrame(send);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    return onConsentChange((choice) => {
      if (choice !== "granted") return;
      loadGoogleAnalytics();
      sendGaPageView(window.location.pathname);
    });
  }, []);
}

function useLanguageSwitch() {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);

  useEffect(() => {
    const next = pathname.split("/")[1] ?? "";
    const from = previous.current;
    if (from && from !== next && isLocale(from) && isLocale(next)) {
      track("language_switch", { from, to: next, lang: next });
    }
    if (isLocale(next)) previous.current = next;
  }, [pathname]);
}

function useCtaClicks() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.dataset.track === "off") return;

      const href = anchor.getAttribute("href") ?? "";
      const marked = anchor.dataset.ctaId;
      const ctaId =
        (marked && isCtaId(marked) ? marked : null) ||
        classifyCtaId(href) ||
        (anchor.dataset.track === "cta" ? "cta" : null);
      if (!ctaId) return;

      const lang = currentLang();
      const location = anchor.dataset.location || inferLocation(anchor);
      track("cta_click", { cta_id: ctaId, location, lang });
      if (isBookingHref(href) || ctaId === "book_call") {
        track("generate_lead", { source: "booking", lang, location });
      }
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}
