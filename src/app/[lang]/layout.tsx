import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import {
  locales,
  defaultLocale,
  ogLocales,
  isLocale,
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
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CosmicField } from "@/components/CosmicField";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CookieConsent } from "@/components/CookieConsent";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Acronym substitute (per the Dala style spec) — carries the hero's thin
// weight-200 display type through to weight-600/700 nav and buttons.
const acronym = Inter({
  variable: "--font-acronym",
  subsets: ["latin"],
  weight: ["200", "400", "500", "600", "700"],
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

  // hreflang map: every locale + x-default → English.
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((l) => [l, `/${l}`]),
  );
  languages["x-default"] = `/${defaultLocale}`;

  return {
    metadataBase: new URL(siteUrl),
    title: { absolute: dict.meta.title },
    description: dict.meta.description,
    keywords: [...siteConfig.keywords],
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: siteUrl }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    alternates: {
      canonical: `/${lang}`,
      languages,
    },
    openGraph: {
      type: "website",
      locale: ogLocales[lang],
      alternateLocale: locales.filter((l) => l !== lang).map((l) => ogLocales[l]),
      url: `/${lang}`,
      siteName: siteConfig.name,
      title: dict.meta.title,
      description: dict.meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
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
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
  params,
}: LayoutParams & { children: React.ReactNode }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} ${acronym.variable}`}
    >
      <body>
        {/* Google Consent Mode v2 — deny all storage by default until the
            visitor accepts via the cookie banner (see CookieConsent). Must run
            before GA loads, hence beforeInteractive. */}
        <Script id="consent-default" strategy="beforeInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});`}
        </Script>
        {/* Tally popup widget script — see components/TallyButton.tsx. */}
        <Script
          src="https://tally.so/widgets/embed.js"
          strategy="afterInteractive"
        />
        {/* Leadsy.ai pixel is loaded by CookieConsent only after consent. */}
        {/* Persistent scroll-morphing constellation behind all content. */}
        <CosmicField />
        <ScrollReveal />
        <a href="#main">{dict.skipToContent}</a>
        <SiteHeader lang={lang} dict={dict} />
        {children}
        <SiteFooter lang={lang} dict={dict} />
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        {/* Cookieless, GDPR-friendly visitor + conversion analytics. */}
        <Analytics />
        {/* Google Analytics 4 — only mounted when NEXT_PUBLIC_GA_ID is set. */}
        {gaMeasurementId && <GoogleAnalytics gaId={gaMeasurementId} />}
        {/* Cookie consent banner — gates GA4 + Leadsy behind opt-in. */}
        <CookieConsent lang={lang} dict={dict.cookies} />
      </body>
    </html>
  );
}
