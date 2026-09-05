import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { AgencyHero } from "@/components/agency/sections/AgencyHero";
import { Clients } from "@/components/agency/sections/Clients";
import { Capabilities } from "@/components/agency/sections/Capabilities";
import { Proof } from "@/components/agency/sections/Proof";
import { Work } from "@/components/agency/sections/Work";
import { Product } from "@/components/agency/sections/Product";
import { Team } from "@/components/agency/sections/Team";
import { Approach } from "@/components/agency/sections/Approach";
import { Process } from "@/components/agency/sections/Process";
import { AgencyFaq } from "@/components/agency/sections/AgencyFaq";
import { Contact } from "@/components/agency/sections/Contact";

type PageParams = { params: Promise<{ lang: string }> };

/**
 * Section order matches AGENCY_SECTIONS in the layout — that list drives the
 * constellation's scroll choreography, so keep the two in sync when adding or
 * reordering sections. `clients` is a thin band, not a scroll beat, so it is
 * deliberately absent from that list.
 */
export default async function AgencyHome({ params }: PageParams) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const { agency } = await getDictionary(lang);

  return (
    <main id="main">
      <AgencyHero hero={agency.hero} />
      <Clients clients={agency.clients} />
      <Capabilities capabilities={agency.capabilities} />
      <Proof proof={agency.proof} />
      <Work work={agency.work} />
      <Product product={agency.product} />
      <Team team={agency.team} />
      <Approach approach={agency.approach} />
      <Process process={agency.process} />
      <AgencyFaq faq={agency.faq} />
      <Contact contact={agency.contact} />
    </main>
  );
}
