import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { DM_Sans } from "next/font/google";
import {
  locales,
  translatedLocales,
  defaultLocale,
  ogLocales,
  isLocale,
  isTranslated,
  type Locale,
} from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import {
  siteConfig,
  siteUrl,
  googleSiteVerification,
  gaMeasurementId,
} from "@/config/site";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { AgencyHeader } from "@/components/agency/AgencyHeader";
import { AgencyFooter } from "@/components/agency/AgencyFooter";
import { ThemeToggle } from "@/components/agency/ThemeToggle";
import { themeInitScript } from "@/components/agency/theme";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CookieConsent } from "@/components/CookieConsent";
import "../../agency.css";

/**
 * Root layout for the agency site on the apex domain. The product site has its
 * own root layout under app/(openllm)/ — Next allows several as long as there
 * is no app/layout.tsx, and each needs its own <html>/<body> because `lang`
 * only exists inside the [lang] segment.
 */

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// Only the listed locales are valid routes; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

type LayoutParams = { params: Promise<{ lang: string }> };

export async function generateMetadata({
  params,
}: LayoutParams): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const dict = await getDictionary(lang);
  const meta = dict.agency.meta;

  // hreflang map: only translated locales + x-default → English. Untranslated
  // locales serve English copy, so listing them would claim distinct language
  // versions of the same page.
  const languages: Record<string, string> = Object.fromEntries(
    translatedLocales.map((l) => [l, `/${l}`]),
  );
  languages["x-default"] = `/${defaultLocale}`;

  const canonical = isTranslated(lang) ? `/${lang}` : `/${defaultLocale}`;

  return {
    metadataBase: new URL(siteUrl),
    title: { absolute: meta.title },
    description: meta.description,
    keywords: [...siteConfig.keywords],
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: siteUrl }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: "website",
      locale: ogLocales[lang],
      alternateLocale: translatedLocales
        .filter((l) => l !== lang)
        .map((l) => ogLocales[l]),
      url: canonical,
      siteName: siteConfig.name,
      title: meta.title,
      description: meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      site: siteConfig.twitter,
      creator: siteConfig.twitter,
    },
    verification: googleSiteVerification
      ? { google: googleSiteVerification }
      : undefined,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    category: "technology",
  };
}

export const viewport: Viewport = {
  // Matches the page background in each theme, so the mobile browser chrome
  // doesn't sit in the wrong palette.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f8" },
    { media: "(prefers-color-scheme: dark)", color: "#111113" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function AgencyRootLayout({
  children,
  params,
}: LayoutParams & { children: React.ReactNode }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);

  return (
    <html lang={lang} className={dmSans.variable} suppressHydrationWarning>
      <head>
        {/* Applies the stored theme before first paint — no flash of the
            wrong palette. See components/agency/theme.ts. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {/* Google Consent Mode v2 — deny all storage by default until the
            visitor accepts via the cookie banner (see CookieConsent). Must run
            before GA loads, hence beforeInteractive. */}
        <Script id="consent-default" strategy="beforeInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});`}
        </Script>
        <ScrollReveal />
        <a href="#main">{dict.skipToContent}</a>
        <AgencyHeader lang={lang} header={dict.agency.header} />
        {children}
        <AgencyFooter lang={lang} agency={dict.agency} />
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        {/* Cookieless, GDPR-friendly visitor + conversion analytics. */}
        <Analytics />
        {/* Google Analytics 4 — only mounted when NEXT_PUBLIC_GA_ID is set. */}
        {gaMeasurementId && <GoogleAnalytics gaId={gaMeasurementId} />}
        {/* Cookie consent banner — gates GA4 + Leadsy behind opt-in. */}
        <CookieConsent
          lang={lang}
          dict={dict.cookies}
          variant="light"
          learnMoreHref={`/${lang}/privacy`}
        />
        <ThemeToggle label={dict.agency.theme.toggle} />
      </body>
    </html>
  );
}
