"use client";

import { tallyFormId, tallyUrl } from "@/config/site";

declare global {
  interface Window {
    Tally?: {
      openPopup: (
        formId: string,
        options?: Record<string, unknown>,
      ) => void;
    };
  }
}

/**
 * CTA that opens the Tally eligibility form in a popup. Renders a real link to
 * the hosted form as a fallback, so it works without JavaScript and is
 * crawlable; once the Tally embed script has loaded, the click opens the
 * in-page popup instead. The popup forwards the page URL + query params to the
 * form (Tally captures them via hidden fields).
 */
export function TallyButton({ children }: { children: React.ReactNode }) {
  return (
    <a
      href={tallyUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        if (typeof window !== "undefined" && window.Tally) {
          event.preventDefault();
          window.Tally.openPopup(tallyFormId, {
            layout: "modal",
            width: 700,
            autoClose: 2000,
          });
        }
      }}
    >
      {children}
    </a>
  );
}
