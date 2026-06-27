import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { Solution } from "@/components/sections/Solution";
import { Process } from "@/components/sections/Process";
import { FinalCta } from "@/components/sections/FinalCta";

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
      <Process process={dict.process} />
      <FinalCta finalCta={dict.finalCta} />
    </main>
  );
}
