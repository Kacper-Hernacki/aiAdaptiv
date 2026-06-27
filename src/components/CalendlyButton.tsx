"use client";

import { calendlyUrl } from "@/config/site";

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
    };
  }
}

/**
 * CTA that opens the Calendly popup widget. Renders a real link to Calendly as
 * a fallback, so it works without JavaScript and is crawlable; when the widget
 * script has loaded, the click opens the in-page popup instead.
 */
export function CalendlyButton({ children }: { children: React.ReactNode }) {
  return (
    <a
      href={calendlyUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        if (typeof window !== "undefined" && window.Calendly) {
          event.preventDefault();
          window.Calendly.initPopupWidget({ url: calendlyUrl });
        }
      }}
    >
      {children}
    </a>
  );
}
