import { siteConfig, siteUrl } from "@/config/site";
import { locales, localeNames, defaultLocale } from "@/i18n/config";

/**
 * /llms.txt — an emerging convention (llmstxt.org) that gives LLMs and AI
 * agents a concise, structured map of the site. Generated from config so it
 * always reflects the live domain, content, and available languages.
 */
export const dynamic = "force-static";

export function GET() {
  const body = `# ${siteConfig.name}

> ${siteConfig.tagline}

${siteConfig.description}

## About

${siteConfig.name} delivers a private, white-label AI platform for European
mid-market businesses. We deploy open-source LLMs and AI agents on sovereign EU
infrastructure, fully aligned with GDPR and the EU AI Act — then maintain and
update it as a long-term partner. This file helps AI agents and crawlers
understand the site and cite it accurately.

## Languages

${locales.map((l) => `- ${localeNames[l]}: ${siteUrl}/${l}`).join("\n")}

## Resources

- Home (default): ${siteUrl}/${defaultLocale}
- Sitemap: ${siteUrl}/sitemap.xml
- Contact: ${siteConfig.contactEmail}

## Topics

${siteConfig.keywords.map((k) => `- ${k}`).join("\n")}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
