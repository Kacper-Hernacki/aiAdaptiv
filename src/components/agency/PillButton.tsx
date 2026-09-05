import s from "./Agency.module.css";

function Arrow({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

/**
 * The reference's pill CTA: label slides up on hover while a duplicate slides
 * in from below, and the arrow in the circular box slides out right as a second
 * one slides in from the left. Both duplicates are aria-hidden so the button
 * announces its label once.
 */
export function PillButton({
  href,
  children,
  large,
  className,
  external = true,
}: {
  href: string;
  children: string;
  large?: boolean;
  className?: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      className={[s.btn, large ? s.btnLarge : "", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <span className={s.btnLabel}>
        <span className={s.btnLabelBase}>{children}</span>
        <span className={s.btnLabelHover} aria-hidden="true">
          {children}
        </span>
      </span>
      <span className={s.btnIconBox}>
        <Arrow className={`${s.btnIcon} ${s.btnIconBase}`} />
        <Arrow className={`${s.btnIcon} ${s.btnIconHover}`} />
      </span>
    </a>
  );
}
