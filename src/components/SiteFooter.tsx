import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries";

export function SiteFooter({
  dict,
}: {
  dict: Dictionary;
}) {
  const year = new Date().getFullYear();

  return (
    <footer>
      <p>
        <small>{dict.footer.disclaimer}</small>
      </p>
      <p>
        <small>
          © {year} {siteConfig.name}. {dict.footer.rights}
        </small>
      </p>
    </footer>
  );
}
