import { siteConfig, siteUrl } from "@/config/site";

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

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteConfig.name,
        legalName: siteConfig.organization.legalName,
        url: siteUrl,
        logo: `${siteUrl}/icon.svg`,
        description: siteConfig.description,
        email: siteConfig.contactEmail,
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            email: siteConfig.contactEmail,
          },
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: siteConfig.supportEmail,
          },
        ],
        sameAs: siteConfig.organization.sameAs,
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: siteConfig.name,
        url: siteUrl,
        description: siteConfig.description,
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: "en",
      }}
    />
  );
}
