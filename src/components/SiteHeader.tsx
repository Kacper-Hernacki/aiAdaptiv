import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries";
import { CalendlyButton } from "@/components/CalendlyButton";

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
        <strong>{siteConfig.name}</strong> <span>// {dict.header.programLabel}</span>
      </Link>
      <CalendlyButton>{dict.header.cta}</CalendlyButton>
    </header>
  );
}
