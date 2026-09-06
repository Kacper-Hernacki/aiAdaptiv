import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { AgencyHero } from "@/components/agency/sections/AgencyHero";
import { TechStack } from "@/components/agency/sections/TechStack";
import { Capabilities } from "@/components/agency/sections/Capabilities";
import { Proof } from "@/components/agency/sections/Proof";
import { Work } from "@/components/agency/sections/Work";
import { Product } from "@/components/agency/sections/Product";
import { Team } from "@/components/agency/sections/Team";
import { Approach } from "@/components/agency/sections/Approach";
import { Process } from "@/components/agency/sections/Process";
import { AgencyFaq } from "@/components/agency/sections/AgencyFaq";
import { Contact } from "@/components/agency/sections/Contact";
import { FaqJsonLd } from "@/components/seo/JsonLd";

type PageParams = { params: Promise<{ lang: string }> };

/**
 * The tech strip is a thin band between the hero and the first real section,
 * not a full-height section of its own.
 */
export default async function AgencyHome({ params }: PageParams) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const { agency } = await getDictionary(lang);

  return (
    <main id="main">
      <AgencyHero hero={agency.hero} />
      <TechStack tech={agency.tech} />
      <Capabilities capabilities={agency.capabilities} />
      <Proof proof={agency.proof} />
      <Work work={agency.work} />
      <Product product={agency.product} />
      <Team team={agency.team} />
      <Approach approach={agency.approach} />
      <Process process={agency.process} />
      <AgencyFaq faq={agency.faq} />
      <Contact contact={agency.contact} />
      <FaqJsonLd items={agency.faq.items} />
    </main>
  );
}
