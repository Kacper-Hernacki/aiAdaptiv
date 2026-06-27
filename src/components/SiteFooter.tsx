import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export function SiteFooter({
  lang,
  dict,
}: {
  lang: string;
  dict: Dictionary;
}) {
  const year = new Date().getFullYear();

  return (
    <footer>
      <LocaleSwitcher lang={lang} label={dict.footer.languageLabel} />
      <p>
        <small>
          © {year} {siteConfig.name}. {dict.footer.rights}
        </small>
      </p>
    </footer>
  );
}
