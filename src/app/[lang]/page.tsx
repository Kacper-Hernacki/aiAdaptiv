import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { Solution } from "@/components/sections/Solution";
import { Pricing } from "@/components/sections/Pricing";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Qualifier } from "@/components/sections/Qualifier";

type PageParams = { params: Promise<{ lang: string }> };

export default async function Home({ params }: PageParams) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <main id="main">
      <Hero hero={dict.hero} />
      <Problem problem={dict.problem} />
      <Solution solution={dict.solution} />
      <Pricing pricing={dict.pricing} />
      <HowItWorks howItWorks={dict.howItWorks} />
      <Qualifier qualifier={dict.qualifier} />
    </main>
  );
}
