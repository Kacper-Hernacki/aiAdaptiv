import type { CaseStudy } from "./types";
import hero from "@/components/agency/assets/case-n8n.jpg";

/**
 * Our own collection of n8n workflows, published. Counted on 2026-09-12 by
 * parsing every JSON in the public repository: 76 workflows, 1,061 nodes, 57
 * calling a language model, 39 containing an agent, 24 using a vector store,
 * 19 third-party services wired.
 *
 * The repo carries no licence file, so the page says "public and free to
 * download" and stops there — it does not promise reuse rights we have not
 * actually granted.
 */
export const n8nTemplates: CaseStudy = {
  slug: "n8n-automations",
  kind: "reference",
  completed: "2025-12-14",
  hero,
  copy: {
    en: {
      metaTitle:
        "76 n8n automations, free to download — our own collection | aiAdaptiv",
      metaDescription:
        "The n8n workflows we actually run, published as importable JSON: inbox and calendar agents, RAG knowledge bases, scrapers and content pipelines across 19 services. Free on GitHub.",
      kindLabel: "Reference build — our own collection, published",
      title: "Seventy-six automations, yours to take",
      deck:
        "Most automation pitches show you a five-node demo. This is the opposite: the workflows we actually built and ran, exported exactly as they are and put in a public repository. Import the JSON, plug in your own credentials, keep whatever is useful.",
      facts: [
        { label: "Client", value: "None — our own collection" },
        { label: "Field", value: "Automations and agents, built in n8n" },
        { label: "Published", value: "Public GitHub repository, free" },
        { label: "Format", value: "76 importable workflow JSON files" },
      ],
      metrics: [
        {
          value: "76",
          label: "workflows in the repository",
          note: "1,061 nodes in total — 14 per workflow on average",
        },
        {
          value: "57",
          label: "of them call a language model",
          note: "39 contain an agent, 24 query a vector store",
        },
        {
          value: "19",
          label: "third-party services wired up",
          note: "Telegram, Gmail, Notion, Drive, Sheets, Postgres, Slack, Supabase, Calendar…",
        },
      ],
      sections: [
        {
          h: "The problem: the demo is not the work",
          paragraphs: [
            "Automation demos are five nodes long because five nodes fit in a screenshot. Real ones are not. The average workflow in this collection is fourteen nodes, and the extra nine are the parts nobody films: the branch for when the API answers with nothing, the batching so a thousand rows do not become a thousand calls, the retry, the place the failure gets reported.",
            "That gap is why so many automations are built once, impress everybody, and are quietly switched off a month later.",
          ],
        },
        {
          h: "What is in the repository",
          paragraphs: [
            "Everything from small utilities to full agents, grouped roughly by what they do. Seventeen of them were switched on at the moment of the backup — these are working automations, exported as they ran, not tidied-up examples written for an article.",
          ],
          bullets: [
            "Assistants with a job: inbox, calendar, contacts, invoices, travel, research, a personal trainer",
            "RAG knowledge bases over Notion, Drive, newsletters and YouTube transcripts, on Postgres with pgvector",
            "Collectors: Google Maps, X, competitor ad libraries, web scraping with Firecrawl",
            "Content pipelines: transcript to summary, research to draft, SEO agents working as a team",
            "Image and video generation wired into a Telegram front end, so you use it from your phone",
          ],
        },
        {
          h: "Why we give them away",
          paragraphs: [
            "Because the export is the cheap part. Anybody can import a JSON file; the difficulty starts immediately afterwards, and none of it is in the file.",
            "Which of these is worth running for your business, and which will cost more attention than it saves. What it costs per month once real volume goes through it. Whose credentials it holds and what happens when that person leaves. Who notices when it breaks at two in the morning. And keeping it alive when a provider changes an endpoint, which they do.",
            "A collection you can read is a better argument than a page of adjectives about what we could build. Take it, run it, and if the second part is the part you do not want to own, that is the conversation to have.",
          ],
        },
      ],
      pull:
        "The export is the cheap part. Deciding which automation is worth running, and keeping it alive when the API changes, is the work.",
      proof: {
        label: "Go and look",
        caption:
          "The whole collection is public. Every number on this page comes from parsing those files, so you can recount them yourself. They are a snapshot of our n8n instance rather than a maintained product — expect to update node versions and to bring your own credentials.",
        link: {
          href: "https://github.com/Kacper-Hernacki/n8n-templates-backup",
          label: "github.com/Kacper-Hernacki/n8n-templates-backup",
        },
      },
      disclaimer: {
        h: "What this case does not claim",
        body:
          "This is our own collection, not a client engagement, and nobody has audited it. We are not claiming hours saved or money made, by us or by anyone who downloads it — we have not measured that. The workflows are a backup taken in December 2025: some will need their node versions updated, several were built for a specific account and will need rewiring, and a few are frankly rough. They are published as they are, which is the only honest way to publish them.",
      },
      cta: {
        h: "The second part is the part we do",
        body:
          "Choosing what is worth automating, running it where your data is allowed to be, and being the person who gets paged when it breaks. Bring a process that eats your week and we will tell you whether it is worth the wiring.",
        button: "Book a 30-minute call",
      },
      backLabel: "All case studies",
    },
    pl: {
      metaTitle:
        "76 automatyzacji n8n za darmo — nasz własny zbiór | aiAdaptiv",
      metaDescription:
        "Workflow n8n, które naprawdę u nas chodzą, opublikowane jako gotowy do importu JSON: agenci od skrzynki i kalendarza, bazy wiedzy RAG, scrapery i potoki treści na 19 usługach. Za darmo na GitHubie.",
      kindLabel: "Build referencyjny — nasz własny zbiór, opublikowany",
      title: "Siedemdziesiąt sześć automatyzacji do wzięcia",
      deck:
        "Większość prezentacji o automatyzacji pokazuje demo na pięć węzłów. To jest odwrotność: workflow, które faktycznie zbudowaliśmy i uruchomiliśmy, wyeksportowane dokładnie takie, jakie są, i wrzucone do publicznego repozytorium. Importuj JSON, podłącz własne poświadczenia, zatrzymaj to, co Ci się przyda.",
      facts: [
        { label: "Klient", value: "Brak — nasz własny zbiór" },
        { label: "Obszar", value: "Automatyzacje i agenci, zbudowane w n8n" },
        { label: "Publikacja", value: "Publiczne repozytorium GitHub, za darmo" },
        { label: "Format", value: "76 plików JSON gotowych do importu" },
      ],
      metrics: [
        {
          value: "76",
          label: "workflow w repozytorium",
          note: "1 061 węzłów łącznie — średnio 14 na workflow",
        },
        {
          value: "57",
          label: "z nich woła model językowy",
          note: "39 zawiera agenta, 24 odpytują bazę wektorową",
        },
        {
          value: "19",
          label: "podpiętych usług zewnętrznych",
          note: "Telegram, Gmail, Notion, Drive, Sheets, Postgres, Slack, Supabase, Kalendarz…",
        },
      ],
      sections: [
        {
          h: "Problem: demo to nie jest ta robota",
          paragraphs: [
            "Dema automatyzacji mają pięć węzłów, bo pięć węzłów mieści się na zrzucie ekranu. Prawdziwe nie mają. Średni workflow w tym zbiorze ma czternaście węzłów, a te dodatkowe dziewięć to części, których nikt nie nagrywa: odnoga na wypadek, gdy API odpowie pustką, batchowanie, żeby tysiąc wierszy nie zamienił się w tysiąc wywołań, ponowienie, miejsce, w którym zgłasza się awaria.",
            "Ta różnica jest powodem, dla którego tyle automatyzacji buduje się raz, robią wrażenie na wszystkich, a miesiąc później po cichu się je wyłącza.",
          ],
        },
        {
          h: "Co jest w repozytorium",
          paragraphs: [
            "Wszystko od drobnych narzędzi po pełnych agentów, z grubsza pogrupowane według tego, co robią. Siedemnaście było włączonych w momencie robienia backupu — to są działające automatyzacje, wyeksportowane tak, jak chodziły, a nie doczyszczone przykłady napisane pod artykuł.",
          ],
          bullets: [
            "Asystenci z konkretnym zadaniem: skrzynka, kalendarz, kontakty, faktury, podróże, research, trener personalny",
            "Bazy wiedzy RAG nad Notion, Drive, newsletterami i transkryptami z YouTube, na Postgresie z pgvectorem",
            "Zbieracze: Google Maps, X, biblioteki reklam konkurencji, scraping stron przez Firecrawl",
            "Potoki treści: transkrypt na streszczenie, research na szkic, zespół agentów SEO",
            "Generowanie obrazu i wideo podpięte pod Telegram, żeby dało się z tego korzystać z telefonu",
          ],
        },
        {
          h: "Dlaczego to oddajemy",
          paragraphs: [
            "Bo eksport jest tanią częścią. Plik JSON zaimportuje każdy; trudność zaczyna się zaraz potem i nie ma jej w tym pliku.",
            "Który z nich warto uruchomić w Twojej firmie, a który zje więcej uwagi, niż zaoszczędzi. Ile to kosztuje miesięcznie, kiedy przechodzi przez to realny ruch. Czyje poświadczenia trzyma i co się dzieje, gdy ta osoba odchodzi. Kto zauważy, że zepsuło się o drugiej w nocy. I utrzymanie tego przy życiu, gdy dostawca zmieni endpoint — a zmieni.",
            "Zbiór, który można przeczytać, jest lepszym argumentem niż strona przymiotników o tym, co moglibyśmy zbudować. Weź, uruchom, a jeśli ta druga część jest tą, której nie chcesz mieć na głowie, to jest właśnie rozmowa do odbycia.",
          ],
        },
      ],
      pull:
        "Eksport jest tanią częścią. Robotą jest decyzja, którą automatyzację warto trzymać, i utrzymanie jej przy życiu, gdy zmieni się API.",
      proof: {
        label: "Zobacz sam",
        caption:
          "Cały zbiór jest publiczny. Każda liczba na tej stronie pochodzi z przeparsowania tych plików, więc możesz je przeliczyć samodzielnie. To zrzut naszej instancji n8n, a nie utrzymywany produkt — licz się z aktualizacją wersji węzłów i z podłączeniem własnych poświadczeń.",
        link: {
          href: "https://github.com/Kacper-Hernacki/n8n-templates-backup",
          label: "github.com/Kacper-Hernacki/n8n-templates-backup",
        },
      },
      disclaimer: {
        h: "Czego ten case nie twierdzi",
        body:
          "To nasz własny zbiór, nie wdrożenie u klienta, i nikt go nie audytował. Nie twierdzimy, że oszczędza godziny albo zarabia pieniądze — ani nam, ani komukolwiek, kto go pobierze — bo tego nie mierzyliśmy. Workflow to backup zrobiony w grudniu 2025: część będzie wymagała aktualizacji wersji węzłów, kilka powstało pod konkretne konto i trzeba je przepiąć, a parę jest po prostu surowych. Publikujemy je takimi, jakie są, bo to jedyny uczciwy sposób, żeby je opublikować.",
      },
      cta: {
        h: "Ta druga część to jest to, co robimy",
        body:
          "Wybór tego, co warto automatyzować, uruchomienie tego tam, gdzie Wasze dane mogą być, i bycie osobą, którą budzi telefon, gdy się zepsuje. Przyjdź z procesem, który zjada Wam tydzień, a powiemy, czy warto go okablować.",
        button: "Umów 30-minutową rozmowę",
      },
      backLabel: "Wszystkie case studies",
    },
  },
};
