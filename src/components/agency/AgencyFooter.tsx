import Link from "next/link";
import { siteConfig, openllmUrl } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries";
import { BrandMark } from "./BrandMark";
import styles from "./AgencyFooter.module.css";

/**
 * Footer links are authored in the dictionaries, so they cannot hardcode a
 * runtime-configurable URL or a locale-prefixed route. Two `@` tokens stand in
 * for those: `@openllm` → the product subdomain, `@terms` → this locale's terms
 * page. Everything else is used verbatim (in-page `#anchor`, `mailto:`, or an
 * absolute URL).
 */
function resolveHref(href: string, lang: string): string {
  if (href === "@openllm") return openllmUrl;
  if (href === "@terms") return `/${lang}/terms`;
  return href;
}

export function AgencyFooter({
  lang,
  agency,
  disclaimer,
}: {
  lang: string;
  agency: Dictionary["agency"];
  disclaimer: string;
}) {
  const year = new Date().getFullYear();
  const { footer } = agency;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <Link href={`/${lang}`} rel="home" className={styles.brand}>
              <BrandMark className={styles.brandMark} />
              {siteConfig.name}
            </Link>
            <p className={styles.blurb}>{footer.blurb}</p>
          </div>
          {footer.groups.map((group) => (
            <nav
              key={group.label}
              aria-label={group.label}
              className={styles.group}
            >
              <p className={styles.groupLabel}>{group.label}</p>
              <ul>
                {group.links.map((link) => {
                  const href = resolveHref(link.href, lang);
                  const external = href.startsWith("http");
                  return (
                    <li key={link.href}>
                      <a
                        href={href}
                        className={styles.navLink}
                        {...(external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ))}
        </div>
        <div className={styles.bottom}>
          <p id="legal" className={styles.disclaimer}>
            {disclaimer}
          </p>
          <p className={styles.rights}>
            © {year} {siteConfig.name}. {footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
