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
 * Root layout. Lives inside the [lang] segment rather than at app/layout.tsx
 * because <html lang> needs the locale, which only exists here.
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
    <html
      lang={lang}
      className={dmSans.variable}
      // agency.css sets scroll-behavior: smooth. Without this attribute Next
      // animates its scroll-to-top on route changes from wherever the previous
      // page was, so a click deep in the homepage lands part-way down the next
      // page. The attribute lets Next suspend smooth scrolling for the jump.
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Applies the stored theme before first paint — no flash of the
            wrong palette. See components/agency/theme.ts. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {/* Google Consent Mode v2. Denies all storage by default, but reads
            the stored choice first: a returning visitor who already accepted
            gets granted defaults, so gtag's own page_view goes out consented.
            Without that the first hit of every visit is a cookieless denied
            ping, and granting later never resends it. Must run before GA
            loads, hence beforeInteractive. */}
        <Script id="consent-default" strategy="beforeInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}var c='denied';try{if(localStorage.getItem('aiadaptiv-cookie-consent')==='granted')c='granted';}catch(e){}gtag('consent','default',{ad_storage:c,analytics_storage:c,ad_user_data:c,ad_personalization:c,wait_for_update:500});`}
        </Script>
        <ScrollReveal />
        <a href="#main">{dict.skipToContent}</a>
        <AgencyHeader lang={lang} header={dict.agency.header} />
        {children}
        <AgencyFooter lang={lang} agency={dict.agency} />
        <OrganizationJsonLd
          lang={lang}
          description={dict.agency.meta.description}
          services={dict.agency.capabilities.items}
        />
        <WebSiteJsonLd lang={lang} description={dict.agency.meta.description} />
        {/* Cookieless, GDPR-friendly visitor + conversion analytics. */}
        <Analytics />
        {/* Google Analytics 4 — only mounted when NEXT_PUBLIC_GA_ID is set. */}
        {gaMeasurementId && <GoogleAnalytics gaId={gaMeasurementId} />}
        {/* Cookie consent banner — gates GA4 + Leadsy behind opt-in. */}
        <CookieConsent lang={lang} dict={dict.cookies} />
        <ThemeToggle label={dict.agency.theme.toggle} />
      </body>
    </html>
  );
}
