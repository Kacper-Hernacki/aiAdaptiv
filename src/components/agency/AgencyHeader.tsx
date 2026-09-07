"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { siteConfig, bookingUrl } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries";
import { BrandMark } from "./BrandMark";
import { PillButton } from "./PillButton";
import styles from "./AgencyHeader.module.css";

export function AgencyHeader({
  lang,
  header,
}: {
  lang: string;
  header: Dictionary["agency"]["header"];
}) {
  const [open, setOpen] = useState(false);

  // The overlay covers the page, so the body must not scroll behind it.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href={`/${lang}`} rel="home" className={styles.brand}>
          <BrandMark className={styles.brandMark} />
          <span className={styles.brandName}>{siteConfig.name}</span>
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

        <div className={styles.headerBtn}>
          <PillButton href={bookingUrl}>{header.cta}</PillButton>
        </div>

        <button
          type="button"
          className={styles.menuBtn}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={header.menuLabel}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.menuBar} />
          <span className={styles.menuBar} />
          <span className={styles.menuBar} />
        </button>
      </div>

      <div id="mobile-menu" className={styles.mobileMenu} data-open={open}>
        <nav aria-label="Mobile">
          <ul className={styles.mobileNav}>
            {header.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={styles.mobileLink}
                  onClick={() => setOpen(false)}
                  tabIndex={open ? 0 : -1}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <PillButton href={bookingUrl} large>
                {header.cta}
              </PillButton>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
