import Link from "next/link";
import { calendlyUrl, siteConfig } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries";

export function SiteHeader({
  lang,
  dict,
}: {
  lang: string;
  dict: Dictionary;
}) {
  return (
    <header>
      <Link href={`/${lang}`} rel="home">
        <strong>{siteConfig.name}</strong>
      </Link>
      <a href={calendlyUrl} target="_blank" rel="noopener noreferrer">
        {dict.header.cta}
      </a>
    </header>
  );
}
