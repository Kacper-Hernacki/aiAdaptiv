"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import styles from "./RotatingText.module.css";

const INTERVAL_MS = 2800;

// false during SSR and hydration, true once the client has taken over. Done
// with useSyncExternalStore rather than a mounted flag set in an effect, which
// the React lint rules reject as a cascading render.
const subscribeNoop = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

/**
 * Cycles through `phrases` inside a heading. The server renders ONLY phrase 0
 * — so the h1 a crawler indexes is one clean sentence, not five endings run
 * together — and the client mounts the rest after hydration and rotates from
 * there. The stack is centred in a full-width block and every phrase is one
 * line, so the extra phrases appearing does not move anything. Honours prefers-reduced-motion by not rotating
 * at all rather than by snapping, since a headline that changes without
 * motion is more disorienting than one that animates.
 */
export function RotatingText({
  phrases,
  className,
}: {
  phrases: string[];
  className?: string;
}) {
  const hydrated = useHydrated();
  const [active, setActive] = useState(0);
  const timer = useRef<number | null>(null);
  // The phrase on its way out is always the previous one, so it is derived
  // rather than stored — keeps the state updater pure.
  const leaving = (active - 1 + phrases.length) % phrases.length;

  useEffect(() => {
    if (phrases.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    timer.current = window.setInterval(() => {
      setActive((i) => (i + 1) % phrases.length);
    }, INTERVAL_MS);

    return () => {
      if (timer.current !== null) window.clearInterval(timer.current);
    };
  }, [phrases.length]);

  const rendered = hydrated ? phrases : phrases.slice(0, 1);

  return (
    <span className={`${styles.stack} ${className ?? ""}`}>
      {rendered.map((phrase, i) => {
        const isActive = i === active;
        const isLeaving = i === leaving && !isActive;
        return (
          <span
            key={phrase}
            className={[
              styles.phrase,
              isActive ? styles.active : "",
              isLeaving ? styles.leaving : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden={!isActive}
          >
            {phrase}
          </span>
        );
      })}
    </span>
  );
}
