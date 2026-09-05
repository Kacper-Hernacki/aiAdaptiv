import Link from "next/link";
import { siteConfig, bookingUrl } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries";
import { BrandMark } from "./BrandMark";
import styles from "./AgencyHeader.module.css";

export function AgencyHeader({
  lang,
  header,
}: {
  lang: string;
  header: Dictionary["agency"]["header"];
}) {
  return (
    <header className={styles.header}>
      <Link href={`/${lang}`} rel="home" className={styles.brand}>
        <BrandMark className={styles.brandMark} />
        <strong className={styles.brandName}>{siteConfig.name}</strong>
        <span className={styles.brandLabel}>{header.tagline}</span>
      </Link>
      <nav aria-label="Primary" className={styles.nav}>
        <ul>
          {header.nav.map((item) => (
            <li key={item.href}>
              <a href={item.href} className={styles.navLink}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <a
        href={bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.cta}
      >
        {header.cta}
      </a>
    </header>
  );
}
