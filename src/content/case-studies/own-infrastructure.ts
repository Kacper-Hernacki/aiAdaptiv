import type { CaseStudy } from "./types";
import hero from "@/components/agency/assets/case-own-infra.jpg";

/**
 * A METHOD case: the map and the costing rule we use when a company asks about
 * leaving SaaS. It claims no client migration — we have not published one — and
 * the only infrastructure it describes operating is ours.
 *
 * Figures are public list prices and published cost models, checked
 * 2026-09-12: Hetzner CPX22 €7.99/mo vs a comparable DigitalOcean Droplet at
 * $24/mo; DO managed Postgres from ~$15/mo, Hetzner offers none; Airtable Team
 * $20/user/mo; GitHub Team about $40/mo for ten; Forgejo idles near 100 MB;
 * self-hosted observability loses below ~50 hosts and crosses over near 200.
 */
export const ownInfrastructure: CaseStudy = {
  slug: "own-infrastructure",
  kind: "method",
  completed: "2026-09-12",
  hero,
  image: { src: "/case-studies/what-moves.svg", width: 1400, height: 780 },
  copy: {
    en: {
      metaTitle:
        "Moving off SaaS onto your own infrastructure — what to move | aiAdaptiv",
      metaDescription:
        "Forgejo instead of GitHub, NocoDB instead of Airtable, Grafana, n8n and Postgres on your own server. The map we use, including the half of the stack we would tell you to leave exactly where it is.",
      kindLabel: "How we advise — your own infrastructure, open-source tools",
      title: "Half your SaaS stack is worth moving",
      deck:
        "There is an open-source replacement for nearly everything you rent: Forgejo for GitHub, NocoDB for Airtable, Grafana for the dashboards, n8n for the automations, Postgres underneath all of it. What the enthusiasm leaves out is that moving all of it is a mistake. The value of this exercise is knowing which half.",
      facts: [
        { label: "What this is", value: "A map and a way of costing it" },
        { label: "Fits", value: "Teams whose bill grows per person" },
        { label: "Tools", value: "Forgejo, NocoDB, Grafana, n8n, Postgres" },
        { label: "Runs on", value: "One VPS, a managed host, or Kubernetes" },
      ],
      metrics: [
        {
          value: "€8",
          label: "a month for the server that runs your git forge",
          note: "2 vCPU / 4 GB at list, September 2026 — Forgejo idles near 100 MB",
        },
        {
          value: "$200",
          label: "a month for ten Airtable seats at list price",
          note: "self-hosted NocoDB has no per-seat price at all",
        },
        {
          value: "~50",
          label: "hosts below which self-hosting your monitoring loses money",
          note: "published 2026 cost models put the crossover nearer 200",
        },
        {
          value: "0",
          label: "licence cost of every tool on this map",
          note: "which is not the same thing as zero cost",
        },
      ],
      sections: [
        {
          h: "The problem: you rent per person, and the meter is not in the room",
          paragraphs: [
            "A stack assembled one signup at a time is priced per seat, so it grows with hiring rather than with use. Ten people on an Airtable team plan list at $200 a month; the same ten on a GitHub team plan at about $40. Nobody decided that — it accumulated, one reasonable decision at a time, and the invoice arrives monthly whether the tool was opened or not.",
            "The second half of the problem is quieter and worse. Your contracts, your customer records, your code and your internal knowledge now live across a dozen vendors, each with its own export format, its own retention policy, and its own idea of what it may do with your data. Nobody set out to build that either.",
          ],
        },
        {
          h: "What replaces what",
          paragraphs: [
            "The replacements are real software, not compromises — but each has a shape you should know before you commit to it, and we would rather tell you the shape now than have you discover it with production data inside.",
          ],
          bullets: [
            "Git, issues and CI → Forgejo. One Go binary, idling near 100 MB, on the cheapest server you can rent. Workflow files are GitHub Actions-compatible, so `.github/workflows` mostly ports with a path change, and a package registry is built in.",
            "Airtable-style databases → NocoDB. It puts a spreadsheet interface on a Postgres you already run rather than keeping its own copy. Know that it owns the tables it touches — metadata columns, soft deletes — so a raw SQL query will see rows the grid says are gone.",
            "Dashboards, metrics and logs → Grafana with Prometheus and Loki. Excellent software. Read the next section before you move it.",
            "Automations and agents → n8n, self-hosted. Seventy-six of the workflows we run are published, so you can see the shape of the thing before you host it.",
            "Underneath all of it → PostgreSQL. One database can carry the forge, the tables, the automation state and vector search for a RAG system without four separate services.",
          ],
        },
        {
          h: "What it runs on, and what that actually costs",
          paragraphs: [
            "The same two virtual CPUs and four gigabytes of memory cost about €8 a month at Hetzner and about $24 at DigitalOcean, with 20 TB of European traffic included against 4 TB. On raw compute it is not close.",
            "That gap buys one specific thing, and it is worth naming: DigitalOcean sells a managed Postgres from around $15 a month, with backups, point-in-time recovery and failover included, and Hetzner sells nothing of the kind. If your database matters and nobody on the team wants to own restores, that premium is the cheapest insurance on the list.",
            "Above the server sits the deploy layer. Coolify or Dokploy gives you push-to-deploy, automatic certificates and one-click services on a box you own — roughly the experience you are leaving, without the platform fee. Kubernetes belongs in this picture only once you genuinely run more than one node; before that it is a tax you pay in complexity and pay again every time something breaks at an awkward hour.",
          ],
        },
        {
          h: "What we would talk you out of",
          paragraphs: [
            "Your monitoring, if you are small. The software is free and the operational load is not: published 2026 cost models put self-hosted observability behind hosted below roughly fifty hosts, with the crossover nearer two hundred, because the real line item is between a tenth and one and a half of an engineer. A team of five cannot spend half a person on watching the watchers.",
            "Your production database, unless somebody is genuinely on call for it. And, as a general rule, anything whose failure mode is a person being woken at three in the morning for a tool nobody thanked them for.",
            "We would rather lose half of a migration than hand you a pager. The half that is worth moving is worth moving permanently; the half that is not will quietly cost you more than the invoice you were trying to cancel.",
          ],
        },
      ],
      pull:
        "Everything on this map is free to licence. None of it is free to run. The question is never whether you can self-host it — it is who gets paged when it stops.",
      proof: {
        label: "What we would move, and what we would leave",
        caption:
          "The split, as we would draw it for a team of ten. Prices are public list prices checked in September 2026, and the line between the columns moves with your headcount and your volume — which is the part worth half an hour of conversation.",
        alt: "Two columns: tools priced per seat, where self-hosting pays back almost at once, against tools priced per usage or paid in on-call time, where it usually does not.",
      },
      disclaimer: {
        h: "What this case does not claim",
        body:
          "This is a map and a costing method, not a report of a migration we ran for a client — we are not publishing one of those, and inventing a saved percentage for a company we have not worked with would be worthless to you anyway. The only infrastructure described here as ours is ours: a private model on our own GPU, a coding agent on our own server, our automations on our own n8n. The prices are public list prices we checked in September 2026 and they will drift; the crossover figures come from published cost models rather than from our own measurements, and we have cited them as such rather than dressing them up as experience.",
      },
      cta: {
        h: "Bring the actual invoices",
        body:
          "Thirty minutes with your real bill is enough to say which lines are worth moving, which are not, and what the move would cost you in attention rather than licences. If the answer is that you should stay where you are, that is the answer you will get.",
        button: "Book a 30-minute call",
      },
      backLabel: "All case studies",
    },
    pl: {
      metaTitle:
        "Wyjście z SaaS na własną infrastrukturę — co warto przenieść | aiAdaptiv",
      metaDescription:
        "Forgejo zamiast GitHuba, NocoDB zamiast Airtable, Grafana, n8n i Postgres na własnym serwerze. Mapa, której używamy — razem z tą połową stosu, którą kazalibyśmy zostawić dokładnie tam, gdzie jest.",
      kindLabel: "Jak doradzamy — własna infrastruktura na narzędziach open source",
      title: "Połowa Waszego stosu SaaS jest warta przeniesienia",
      deck:
        "Na prawie wszystko, co wynajmujecie, istnieje zamiennik open source: Forgejo zamiast GitHuba, NocoDB zamiast Airtable, Grafana na dashboardy, n8n na automatyzacje, Postgres pod tym wszystkim. Entuzjazm pomija jedno: przeniesienie całości jest błędem. Wartość tego ćwiczenia polega na tym, żeby wiedzieć, która połowa.",
      facts: [
        { label: "Co to jest", value: "Mapa i sposób policzenia tego" },
        { label: "Pasuje do", value: "Zespołów, których rachunek rośnie od osoby" },
        { label: "Narzędzia", value: "Forgejo, NocoDB, Grafana, n8n, Postgres" },
        { label: "Działa na", value: "Jednym VPS-ie, hostingu zarządzanym lub Kubernetesie" },
      ],
      metrics: [
        {
          value: "8 €",
          label: "miesięcznie za serwer, na którym stoi Wasz git",
          note: "2 vCPU / 4 GB w cenniku, wrzesień 2026 — Forgejo bezczynne zajmuje około 100 MB",
        },
        {
          value: "200 $",
          label: "miesięcznie za dziesięć miejsc w Airtable wg cennika",
          note: "NocoDB hostowany u siebie nie ma ceny za miejsce w ogóle",
        },
        {
          value: "~50",
          label: "hostów, poniżej których własny monitoring przynosi stratę",
          note: "opublikowane modele kosztowe z 2026 stawiają próg opłacalności bliżej 200",
        },
        {
          value: "0",
          label: "kosztu licencji każdego narzędzia z tej mapy",
          note: "co nie jest tym samym co zerowy koszt",
        },
      ],
      sections: [
        {
          h: "Problem: wynajmujecie od osoby, a licznik nie stoi w pokoju",
          paragraphs: [
            "Stos składany po jednej rejestracji naraz jest wyceniany od miejsca, więc rośnie wraz z rekrutacją, a nie z użyciem. Dziesięć osób na planie zespołowym Airtable to w cenniku 200 dolarów miesięcznie; te same dziesięć osób na planie zespołowym GitHuba — około 40. Nikt tego nie zdecydował, to się nazbierało, jedna rozsądna decyzja po drugiej, a faktura przychodzi co miesiąc niezależnie od tego, czy ktoś otworzył to narzędzie.",
            "Druga połowa problemu jest cichsza i gorsza. Wasze umowy, dane klientów, kod i wiedza wewnętrzna leżą dziś u kilkunastu dostawców, z których każdy ma własny format eksportu, własną politykę retencji i własne zdanie na temat tego, co wolno mu z tymi danymi zrobić. Tego też nikt nie zaplanował.",
          ],
        },
        {
          h: "Co czym zastąpić",
          paragraphs: [
            "Zamienniki to prawdziwe oprogramowanie, nie kompromisy — ale każdy ma swój kształt, który lepiej poznać przed decyzją niż odkryć z danymi produkcyjnymi w środku.",
          ],
          bullets: [
            "Git, zgłoszenia i CI → Forgejo. Jeden plik binarny w Go, bezczynny zajmuje około 100 MB, chodzi na najtańszym serwerze, jaki da się wynająć. Pliki workflow są zgodne z GitHub Actions, więc `.github/workflows` przenosi się w większości zmianą ścieżki, a rejestr pakietów jest wbudowany.",
            "Bazy w stylu Airtable → NocoDB. Nakłada interfejs arkusza na Postgresa, którego już macie, zamiast trzymać własną kopię. Warto wiedzieć, że przejmuje tabele, których dotyka — kolumny metadanych, miękkie usuwanie — więc surowe zapytanie SQL zobaczy wiersze, o których siatka mówi, że ich nie ma.",
            "Dashboardy, metryki i logi → Grafana z Prometheusem i Loki. Świetne oprogramowanie. Przeczytajcie następną sekcję, zanim to przeniesiecie.",
            "Automatyzacje i agenci → n8n u siebie. Siedemdziesiąt sześć workflow, które u nas chodzą, jest opublikowanych, więc możecie zobaczyć kształt tej rzeczy, zanim ją zahostujecie.",
            "Pod tym wszystkim → PostgreSQL. Jedna baza uniesie repozytorium, tabele, stan automatyzacji i wyszukiwanie wektorowe dla systemu RAG, bez czterech osobnych usług.",
          ],
        },
        {
          h: "Na czym to stoi i ile to naprawdę kosztuje",
          paragraphs: [
            "Te same dwa wirtualne procesory i cztery gigabajty pamięci kosztują około 8 euro miesięcznie w Hetznerze i około 24 dolarów w DigitalOcean, przy 20 TB ruchu europejskiego w cenie wobec 4 TB. Na samej mocy obliczeniowej to nie jest wyrównana walka.",
            "Ta różnica kupuje jedną konkretną rzecz i warto ją nazwać: DigitalOcean sprzedaje zarządzanego Postgresa od około 15 dolarów miesięcznie, z kopiami zapasowymi, odtwarzaniem do punktu w czasie i przełączaniem awaryjnym w komplecie, a Hetzner nie sprzedaje czegoś takiego wcale. Jeśli baza ma znaczenie, a nikt w zespole nie chce odpowiadać za odtworzenia, ta dopłata jest najtańszym ubezpieczeniem na liście.",
            "Nad serwerem siedzi warstwa wdrożeniowa. Coolify albo Dokploy daje wdrożenie pushem, automatyczne certyfikaty i usługi na jedno kliknięcie na maszynie, którą macie — mniej więcej to, z czego odchodzicie, bez opłaty za platformę. Kubernetes wchodzi do tego obrazka dopiero wtedy, gdy naprawdę utrzymujecie więcej niż jeden węzeł; wcześniej jest podatkiem, który płacicie złożonością i płacicie ponownie za każdym razem, gdy coś pada o niewygodnej porze.",
          ],
        },
        {
          h: "Od czego byśmy Was odwodzili",
          paragraphs: [
            "Od monitoringu, jeśli jesteście mali. Oprogramowanie jest darmowe, obciążenie operacyjne nie: opublikowane modele kosztowe z 2026 stawiają własną obserwowalność za hostowaną poniżej mniej więcej pięćdziesięciu hostów, z progiem opłacalności bliżej dwustu, bo prawdziwą pozycją w budżecie jest od jednej dziesiątej do półtora inżyniera. Pięcioosobowy zespół nie wyda pół osoby na pilnowanie tego, co pilnuje.",
            "Od bazy produkcyjnej, chyba że ktoś naprawdę ma za nią dyżur. I ogólniej: od wszystkiego, czego trybem awarii jest człowiek budzony o trzeciej w nocy do narzędzia, za które nikt mu nie podziękował.",
            "Wolimy stracić połowę migracji niż wręczyć Wam pager. Ta połowa, którą warto przenieść, jest warta przeniesienia na stałe; ta druga po cichu będzie kosztować więcej niż faktura, którą próbowaliście anulować.",
          ],
        },
      ],
      pull:
        "Wszystko na tej mapie ma darmową licencję. Nic z tego nie jest darmowe w utrzymaniu. Pytanie nigdy nie brzmi, czy da się to zahostować u siebie — tylko kogo obudzi telefon, kiedy przestanie działać.",
      proof: {
        label: "Co byśmy przenieśli, a co zostawili",
        caption:
          "Podział tak, jak narysowalibyśmy go dla dziesięcioosobowego zespołu. Ceny są cennikowe, sprawdzone we wrześniu 2026, a linia między kolumnami przesuwa się wraz z liczbą osób i wolumenem — i to jest ta część warta pół godziny rozmowy.",
        alt: "Dwie kolumny: narzędzia wyceniane od miejsca, gdzie własny hosting zwraca się niemal od razu, wobec narzędzi wycenianych od użycia lub płaconych dyżurem, gdzie zwykle się nie zwraca.",
      },
      disclaimer: {
        h: "Czego ten case nie twierdzi",
        body:
          "To jest mapa i sposób liczenia, a nie relacja z migracji, którą przeprowadziliśmy u klienta — takiej nie publikujemy, a wymyślony procent oszczędności dla firmy, z którą nie pracowaliśmy, i tak byłby dla Was bezwartościowy. Jedyna infrastruktura opisana tu jako nasza jest nasza: prywatny model na naszym GPU, agent kodujący na naszym serwerze, nasze automatyzacje na naszym n8n. Ceny są cennikowe, sprawdzone we wrześniu 2026, i będą się zmieniać; progi opłacalności pochodzą z opublikowanych modeli kosztowych, a nie z naszych pomiarów, i tak je oznaczyliśmy, zamiast ubierać je w cudze doświadczenie.",
      },
      cta: {
        h: "Przynieście prawdziwe faktury",
        body:
          "Trzydzieści minut z realnym rachunkiem wystarczy, żeby powiedzieć, które pozycje warto przenieść, których nie, i ile ten ruch kosztowałby Was w uwadze, a nie w licencjach. Jeśli odpowiedzią jest „zostańcie tam, gdzie jesteście”, to taką odpowiedź dostaniecie.",
        button: "Umów 30-minutową rozmowę",
      },
      backLabel: "Wszystkie case studies",
    },
  },
};
