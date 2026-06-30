import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries";
import { TallyButton } from "@/components/TallyButton";

export function SiteFooter({
  dict,
}: {
  dict: Dictionary;
}) {
  const year = new Date().getFullYear();

  return (
    <footer>
      <p>
        <strong>{siteConfig.name}</strong> // {dict.header.programLabel}
      </p>
      <nav aria-label="Footer">
        <ul>
          <li>
            <TallyButton>{dict.footer.nav.eligibility}</TallyButton>
          </li>
          <li>
            <a href="#how-it-works">{dict.footer.nav.howItWorks}</a>
          </li>
          <li>
            <a href="#legal">{dict.footer.nav.terms}</a>
          </li>
        </ul>
      </nav>
      <p id="legal">
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
