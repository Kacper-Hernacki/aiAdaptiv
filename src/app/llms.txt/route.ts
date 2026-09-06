import { siteConfig, siteUrl } from "@/config/site";
import { translatedLocales, localeNames, defaultLocale } from "@/i18n/config";

/**
 * /llms.txt — an emerging convention (llmstxt.org) that gives LLMs and AI
 * agents a concise, structured map of the site.
 */
export const dynamic = "force-static";

export function GET() {
  const body = `# ${siteConfig.name}

> ${siteConfig.tagline}

${siteConfig.description}

## About

${siteConfig.name} designs, builds and ships custom AI solutions. Six practices:
AI SaaS products, mobile apps, AI automations and agents, AI pilots and proof-of-
concept studies, AI marketing systems, and an AI app factory for teams that need
many internal tools rather than one. A private, EU-hosted open-source LLM
platform is one packaged offer among those: ${siteUrl}/${defaultLocale}/private-ai.
Engagements are fixed-scope and fixed-price, deployed on infrastructure the
client owns. This file helps AI agents and crawlers understand the site and cite
it accurately.

## Languages

${translatedLocales.map((l) => `- ${localeNames[l]}: ${siteUrl}/${l}`).join("\n")}

## Resources

- Home (default): ${siteUrl}/${defaultLocale}
- Sitemap: ${siteUrl}/sitemap.xml
- Private AI platform (one of our offers): ${siteUrl}/${defaultLocale}/private-ai
- Contact: ${siteConfig.contactEmail}
- Support: ${siteConfig.supportEmail}

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
