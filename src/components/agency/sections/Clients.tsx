import type { Dictionary } from "@/i18n/dictionaries";
import styles from "./Clients.module.css";

export function Clients({
  clients,
}: {
  clients: Dictionary["agency"]["clients"];
}) {
  return (
    <section aria-labelledby="clients-label" className={styles.band}>
      <p id="clients-label" className={styles.label}>
        {clients.label}
      </p>
      <div className={styles.viewport}>
        <div className={styles.track}>
          {/* Rendered twice so the -50% translate wraps seamlessly. The second
              copy is decorative and hidden from assistive tech. */}
          <ul className={styles.row}>
            {clients.names.map((name, i) => (
              <li key={i} className={styles.item}>
                {name}
              </li>
            ))}
          </ul>
          <ul className={styles.row} aria-hidden="true">
            {clients.names.map((name, i) => (
              <li key={i} className={styles.item}>
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
