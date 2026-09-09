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

export function OrganizationJsonLd({
  services = [],
}: {
  /** The capability cards, so the offer catalogue mirrors the page. */
  services?: { title: string; body: string; tags: string[] }[];
} = {}) {
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
        founder: siteConfig.founders.map((f) => ({
          "@type": "Person",
          name: f.name,
          jobTitle: f.jobTitle,
          sameAs: f.profiles,
          // Verifiable credentials, each pointing at its public check page —
          // the thing that turns "multiple certifications" into a claim a
          // machine can follow.
          hasCredential: f.credentials.map((c) => ({
            "@type": "EducationalOccupationalCredential",
            name: c.name,
            url: c.url,
            credentialCategory: "certificate",
          })),
        })),
        sameAs: siteConfig.organization.sameAs,
        // The six practices, as a catalogue a machine can enumerate. Built
        // from the same dictionary the page renders, so the two cannot drift.
        ...(services.length
          ? {
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: `${siteConfig.name} services`,
                itemListElement: services.map((service) => ({
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: service.title,
                    description: service.body,
                    provider: { "@id": `${siteUrl}/#organization` },
                    areaServed: "Worldwide",
                    serviceType: service.title,
                  },
                })),
              },
              // What this entity is about — the signal an answer engine reads
              // when deciding whether we are relevant to a question.
              knowsAbout: services.flatMap((service) => service.tags),
            }
          : {}),
        areaServed: "Worldwide",
        slogan: siteConfig.tagline,
        knowsLanguage: ["en", "pl"],
      }}
    />
  );
}

/**
 * Breadcrumb trail for a subpage. Google uses it to replace the raw URL in a
 * result with a readable path, and it tells a crawler how the page sits under
 * the home page rather than floating free.
 */
export function BreadcrumbJsonLd({
  lang,
  trail,
}: {
  lang: string;
  /** Ordered, excluding the home page — that is prepended here. */
  trail: { name: string; path: string }[];
}) {
  const items = [{ name: siteConfig.name, path: `/${lang}` }, ...trail];
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: `${siteUrl}${item.path}`,
        })),
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

/**
 * FAQPage schema for the agency FAQ. Google restricted FAQ rich results to a
 * narrow set of sites in 2023, so this is not about star-ratings in search —
 * it is a machine-readable statement of who we are and what we charge, which
 * is what an LLM answering "what is aiAdaptiv?" reads.
 *
 * Entries whose answer is still a TODO placeholder are excluded: publishing a
 * placeholder into structured data feeds it straight to the crawlers.
 */
export function FaqJsonLd({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  const answered = items.filter((i) => !i.a.includes("TODO(copy)"));
  if (answered.length === 0) return null;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: answered.map((i) => ({
          "@type": "Question",
          name: i.q,
          acceptedAnswer: { "@type": "Answer", text: i.a },
        })),
      }}
    />
  );
}
