import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries";
import { TallyButton } from "@/components/TallyButton";
import styles from "./SiteHeader.module.css";

export function SiteHeader({
  lang,
  dict,
}: {
  lang: string;
  dict: Dictionary;
}) {
  return (
    <header className={styles.header}>
      <Link href={`/${lang}`} rel="home" className={styles.brand}>
        <strong className={styles.brandName}>{siteConfig.name}</strong>
        <span className={styles.brandLabel}>// {dict.header.programLabel}</span>
      </Link>
      <TallyButton className={styles.cta}>{dict.header.cta}</TallyButton>
    </header>
  );
}
