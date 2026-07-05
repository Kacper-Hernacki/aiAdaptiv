import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries";
import { TallyButton } from "@/components/TallyButton";
import styles from "./SiteFooter.module.css";

export function SiteFooter({
  lang,
  dict,
}: {
  lang: string;
  dict: Dictionary;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.brand}>
          {siteConfig.name} <span>// {dict.header.programLabel}</span>
        </p>
        <nav aria-label="Footer" className={styles.nav}>
          <ul>
            <li>
              <TallyButton className={styles.navLink}>
                {dict.footer.nav.eligibility}
              </TallyButton>
            </li>
            <li>
              <a href="#how-it-works" className={styles.navLink}>
                {dict.footer.nav.howItWorks}
              </a>
            </li>
            <li>
              <Link href={`/${lang}/terms`} className={styles.navLink}>
                {dict.footer.nav.terms}
              </Link>
            </li>
          </ul>
        </nav>
        <p id="legal" className={styles.disclaimer}>
          {dict.footer.disclaimer}
        </p>
        <p className={styles.rights}>
          © {year} {siteConfig.name}. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
