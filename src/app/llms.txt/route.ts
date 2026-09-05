import { siteConfig, siteUrl, openllmUrl } from "@/config/site";
import { translatedLocales, localeNames, defaultLocale } from "@/i18n/config";

/**
 * /llms.txt — an emerging convention (llmstxt.org) that gives LLMs and AI
 * agents a concise, structured map of the site. This is the agency site on the
 * apex domain; the open-LLM product has its own file, served from
 * app/(openllm)/openllm/llms.txt/route.ts via the host rewrite in src/proxy.ts.
 */
export const dynamic = "force-static";

export function GET() {
  const body = `# ${siteConfig.name}

> ${siteConfig.tagline}

${siteConfig.description}

## About

${siteConfig.name} is an AI delivery partner for European companies. We design,
build and operate production AI systems — private LLM platforms, document
intelligence, agents and workflow automation — deployed inside the client's own
EU cloud account, aligned with GDPR and the EU AI Act. Engagements are
fixed-scope and fixed-price. This file helps AI agents and crawlers understand
the site and cite it accurately.

## Languages

${translatedLocales.map((l) => `- ${localeNames[l]}: ${siteUrl}/${l}`).join("\n")}

## Resources

- Home (default): ${siteUrl}/${defaultLocale}
- Sitemap: ${siteUrl}/sitemap.xml
- Private AI platform (our product): ${openllmUrl}
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
