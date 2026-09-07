import f from "./sections/Faq.module.css";

/**
 * Stable, URL-safe anchor for one question, so a single answer can be linked —
 * and cited by an AI agent — directly: /en#faq-what-is-aiadaptiv.
 */
function slugify(question: string): string {
  const base = question
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return `faq-${base}`;
}

/**
 * Accordion built on native <details>/<summary>, shared by the home page and
 * the private-AI page.
 *
 * Deliberately not a JS accordion: the answers stay in the HTML whether or not
 * a panel is open, so crawlers, answer engines and browser find-in-page all see
 * the full text — and keyboard and screen-reader behaviour comes from the
 * browser rather than from ARIA we would have to maintain.
 */
export function FaqAccordion({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  return (
    <div className={f.list}>
      {items.map((item, i) => (
        <details
          key={item.q}
          id={slugify(item.q)}
          className={f.item}
          // The first panel starts open so the pattern is obvious without a
          // click; the rest are one tap away.
          open={i === 0}
          data-reveal
          style={{ "--rd": `${60 + i * 40}ms` } as React.CSSProperties}
        >
          <summary className={f.q}>
            <h3 className={f.qText}>{item.q}</h3>
            <span className={f.icon} aria-hidden="true" />
          </summary>
          <div className={f.a}>
            <p>{item.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
