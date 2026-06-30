import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries";
import { TallyButton } from "@/components/TallyButton";
import styles from "./SiteFooter.module.css";

export function SiteFooter({
  dict,
}: {
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
              <a href="#legal" className={styles.navLink}>
                {dict.footer.nav.terms}
              </a>
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
