import styles from "./Placeholder.module.css";

/**
 * Deterministic abstract fill for an image slot. `seed` picks the composition
 * so cards in a row don't repeat; the geometry is derived from it rather than
 * random, which keeps server and client markup identical.
 *
 * Replace a usage with a real <img> (same wrapper, same aspect class) once the
 * photography and screenshots land — no layout change needed.
 */
export function Placeholder({
  ratio = "4:3",
  seed = 0,
  label,
  fill = false,
}: {
  ratio?: "4:3" | "1:1" | "16:9";
  seed?: number;
  label?: string;
  /** Stretch to the parent instead of holding an aspect ratio — for slots that
   *  sit behind other content, like the capability cards. */
  fill?: boolean;
}) {
  const ratioClass = fill
    ? styles.fill
    : ratio === "1:1"
      ? styles.ratio11
      : ratio === "16:9"
        ? styles.ratio169
        : styles.ratio43;

  // Neutral greys only — the site is monochrome. Seed still varies the
  // composition so neighbouring cards do not look identical.
  const a = ["#c8c8ce", "#b4b4bc", "#9e9ea8"][seed % 3];
  const b = ["#8a8a94", "#6e6e78", "#5a5a64"][seed % 3];
  const offset = (seed % 4) * 9;

  return (
    <div className={`${styles.frame} ${ratioClass}`}>
      <svg
        className={styles.art}
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`ph-g-${seed}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={a} stopOpacity="0.85" />
            <stop offset="100%" stopColor={b} stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill={`url(#ph-g-${seed})`} />
        <g fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth="1.5">
          <circle cx={120 + offset} cy={150} r="96" />
          <circle cx={120 + offset} cy={150} r="62" />
          <circle cx={280 - offset} cy={96 + offset} r="44" />
          <path d={`M0 ${228 - offset} Q 130 ${150 + offset} 400 ${210 + offset}`} />
          <path d={`M0 ${262 - offset} Q 150 ${190 + offset} 400 ${248 + offset}`} />
        </g>
      </svg>
      {label ? <span className={styles.label}>{label}</span> : null}
    </div>
  );
}
