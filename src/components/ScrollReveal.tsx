"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Reveals any element marked with `data-reveal` as it scrolls into view by
 * toggling the global `.is-visible` class (transition lives in globals.css).
 * One shared IntersectionObserver covers the whole page. Honors
 * `prefers-reduced-motion` by showing everything immediately.
 *
 * Re-runs on every route change. This component lives in the layout, which
 * survives client-side navigation, so a one-shot effect would only ever see
 * the first page's elements — everything on the next page would keep the
 * `opacity: 0` the stylesheet starts it at and the page would render blank.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)"),
    );
    if (els.length === 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
