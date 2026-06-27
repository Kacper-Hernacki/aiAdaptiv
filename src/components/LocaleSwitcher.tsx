import Link from "next/link";
import { locales, localeNames } from "@/i18n/config";

/**
 * Language switcher. Renders plain links to the same page in each locale
 * (the home route is just /[lang]), so it works without client JavaScript.
 */
export function LocaleSwitcher({
  lang,
  label,
}: {
  lang: string;
  label: string;
}) {
  return (
    <nav aria-label={label}>
      <ul>
        {locales.map((loc) => (
          <li key={loc}>
            <Link
              href={`/${loc}`}
              hrefLang={loc}
              aria-current={loc === lang ? "true" : undefined}
            >
              {localeNames[loc]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
