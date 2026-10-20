import Link from "next/link";
import { siteConfig, bookingUrl } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries";
import type { CtaId } from "@/lib/track";
import { isLocale } from "@/i18n/config";
import { hasCaseStudyCopy } from "@/content/case-studies";
import { BrandMark } from "./BrandMark";
import { PillButton } from "./PillButton";
import styles from "./AgencyFooter.module.css";

/**
 * Footer links are authored in the dictionaries, so they cannot hardcode a
 * locale-prefixed route. `@` tokens stand in for those: `@privateAi` → the
 * private AI platform page, `@terms` / `@privacy` → this locale's legal pages,
 * `@caseStudies` → the case-study index. Everything else is used verbatim
 * (in-page `#anchor`, `mailto:`, or an absolute URL).
 */
function resolveHref(href: string, lang: string): string {
  if (href === "@privateAi") return `/${lang}/private-ai`;
  if (href === "@caseStudies") return `/${lang}/case-studies`;
  if (href === "@terms") return `/${lang}/terms`;
  if (href === "@privacy") return `/${lang}/privacy`;
  return href;
}

/**
 * Case studies are written in fewer languages than the site. Rather than send
 * a German reader to an English page from a German label, the link is simply
 * not shown until that locale has the copy.
 */
function isVisible(href: string, lang: string): boolean {
  if (href !== "@caseStudies") return true;
  return isLocale(lang) && hasCaseStudyCopy(lang);
}

function footerCtaId(href: string): CtaId | undefined {
  if (href.startsWith("mailto:")) return "email";
  if (href.includes("brain.aiadaptiv")) return "second_brain_pro";
  if (href.includes("/case-studies")) return "case_study";
  if (href.includes("/ai-audit")) return "ai_audit";
  if (href.includes("/private-ai")) return "private_ai";
  return undefined;
}

export function AgencyFooter({
  lang,
  agency,
}: {
  lang: string;
  agency: Dictionary["agency"];
}) {
  const year = new Date().getFullYear();
  const { footer } = agency;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.textWrap}>
            <p className={styles.heading}>{footer.heading}</p>
            <p className={styles.lead}>{footer.lead}</p>
            <div className={styles.btnWrap}>
              <PillButton
                href={bookingUrl}
                large
                ctaId="book_call"
                location="footer"
              >
                {footer.cta}
              </PillButton>
            </div>
          </div>

          <div className={styles.columns}>
            {footer.groups.map((group) => (
              <nav key={group.label} aria-label={group.label}>
                <p className={styles.colHeading}>{group.label}</p>
                <ul className={styles.col}>
                  {group.links
                    .filter((link) => isVisible(link.href, lang))
                    .map((link) => {
                      const href = resolveHref(link.href, lang);
                      const external = href.startsWith("http");
                      const ctaId = footerCtaId(href);
                      return (
                        <li key={link.href}>
                          <a
                            href={href}
                            className={styles.link}
                            {...(ctaId
                              ? {
                                  "data-cta-id": ctaId,
                                  "data-location": "footer",
                                }
                              : {})}
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
        </div>

        <div className={styles.divider} />

        <div className={styles.bottom}>
          <Link href={`/${lang}`} rel="home" className={styles.bottomBrand}>
            <BrandMark className={styles.bottomMark} />
            {siteConfig.name}
          </Link>
          <p className={styles.copyright}>
            © {year} {siteConfig.name}. {footer.rights}
          </p>
        </div>

        <p id="legal" className={styles.disclaimer}>
          {agency.legal.disclaimer}
        </p>
      </div>
    </footer>
  );
}
