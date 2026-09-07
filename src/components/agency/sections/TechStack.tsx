import type { Dictionary } from "@/i18n/dictionaries";
import { techLogos } from "../techLogos";
import styles from "./TechStack.module.css";

/**
 * The tools we build with, as a scrolling logo strip. Names are ordered in
 * techLogos.ts, not in the dictionary — they are proper nouns, identical in
 * every locale; only the strip's label is translated.
 */
function Row({ hidden }: { hidden?: boolean }) {
  return (
    <ul className={styles.row} {...(hidden ? { "aria-hidden": "true" } : {})}>
      {techLogos.map((logo) => (
        <li key={logo.name} className={styles.item}>
          {logo.path ? (
            <svg
              className={styles.mark}
              viewBox={logo.viewBox ?? "0 0 24 24"}
              aria-hidden="true"
              focusable="false"
            >
              <path fill="currentColor" d={logo.path} />
            </svg>
          ) : null}
          <span className={styles.name}>{logo.name}</span>
        </li>
      ))}
    </ul>
  );
}

export function TechStack({ tech }: { tech: Dictionary["agency"]["tech"] }) {
  return (
    <section aria-labelledby="tech-label" className={styles.band}>
      <p id="tech-label" className={styles.label}>
        {tech.label}
      </p>
      <div className={styles.viewport}>
        <div className={styles.track}>
          {/* Rendered twice so the -50% translate wraps seamlessly. The second
              copy is decorative and hidden from assistive tech. */}
          <Row />
          <Row hidden />
        </div>
      </div>
    </section>
  );
}
