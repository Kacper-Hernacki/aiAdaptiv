import { siteConfig, siteUrl, openllmConfig, openllmUrl } from "@/config/site";

/**
 * Renders a JSON-LD <script>. Schema.org structured data helps search engines
 * and LLM crawlers understand the entity behind the site (rich results,
 * knowledge panel, accurate citations).
 *
 * We inject via dangerouslySetInnerHTML because the content is fully
 * static/trusted (derived from siteConfig), never user input.
 */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * The site (root agency vs. openllm product) is chosen by `baseUrl`: both hosts
 * describe the same Organization but must not claim the same @id or URL, or
 * they compete as duplicate entities. Defaults to the root agency site.
 */
function configFor(baseUrl: string) {
  return baseUrl === openllmUrl ? openllmConfig : siteConfig;
}

export function OrganizationJsonLd({ baseUrl = siteUrl }: { baseUrl?: string }) {
  const config = configFor(baseUrl);
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: config.name,
        legalName: config.organization.legalName,
        url: baseUrl,
        logo: `${baseUrl}/icon.svg`,
        description: config.description,
        email: config.contactEmail,
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            email: config.contactEmail,
          },
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: config.supportEmail,
          },
        ],
        sameAs: config.organization.sameAs,
      }}
    />
  );
}

export function WebSiteJsonLd({ baseUrl = siteUrl }: { baseUrl?: string }) {
  const config = configFor(baseUrl);
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        name: config.name,
        url: baseUrl,
        description: config.description,
        publisher: { "@id": `${baseUrl}/#organization` },
        inLanguage: "en",
      }}
    />
  );
}
