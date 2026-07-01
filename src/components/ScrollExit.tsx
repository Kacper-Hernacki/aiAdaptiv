"use client";

import { useEffect, useRef } from "react";

/**
 * Slides its children up and fades them out as the page scrolls past the first
 * viewport — the hero "disappears up" to hand off to the next section. Honors
 * prefers-reduced-motion (no transform).
 */
export function ScrollExit({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const prog = Math.min(1, window.scrollY / (window.innerHeight * 0.8));
      el.style.transform = `translate3d(0, ${(-prog * 90).toFixed(1)}px, 0)`;
      el.style.opacity = String(Math.max(0, 1 - prog * 1.15));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} style={{ willChange: "transform, opacity" }}>
      {children}
    </div>
  );
}
