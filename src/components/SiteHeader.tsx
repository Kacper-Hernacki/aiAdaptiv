import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries";
import { TallyButton } from "@/components/TallyButton";

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
      <TallyButton>{dict.header.cta}</TallyButton>
    </header>
  );
}
