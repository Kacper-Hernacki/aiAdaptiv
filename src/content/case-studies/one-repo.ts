import type { CaseStudy } from "./types";
import hero from "@/components/agency/assets/case-one-repo.jpg";

/**
 * The delivery case: web, iOS and Android from a single repository. Counted in
 * the client's repo on 2026-09-12 — 879 commits since 2026-07-10, 1,020
 * TypeScript files, 111 migrations, 37 pgTAP test files, 5 subagents.
 *
 * The client is deliberately not named here. Naming needs their written
 * consent; until it exists, the product is described, never identified.
 */
export const oneRepo: CaseStudy = {
  slug: "one-repo-three-releases",
  kind: "client",
  completed: "2026-09-11",
  hero,
  image: {
    src: "/case-studies/release-topology.svg",
    width: 1400,
    height: 720,
  },
  copy: {
    en: {
      metaTitle:
        "Web, iOS and Android from one repository — a delivery case | aiAdaptiv",
      metaDescription:
        "A coach console, two store apps and a database shipped out of a single monorepo. One push releases all three, preview and production are two git branches, and five subagents do the repetitive work.",
      kindLabel: "Client build — product not named here",
      title: "One repository, three releases",
      deck:
        "A scheduling product with a web console, an iOS app, an Android app and a database underneath. Most teams would run that as four codebases and four release days. It is one repository, and a push to the main branch releases all of it at once.",
      facts: [
        { label: "Client", value: "Named only with their consent" },
        { label: "Field", value: "Sports club scheduling, web and mobile" },
        { label: "Built", value: "July 2026 – ongoing" },
        {
          label: "Runs on",
          value: "Next.js 16, Expo, Supabase, Turborepo monorepo",
        },
      ],
      metrics: [
        {
          value: "3",
          label: "systems released by a single push",
          note: "the database migrates, the console deploys, both apps publish",
        },
        {
          value: "2",
          label: "complete environments, preview and production",
          note: "separate databases, separate hosts, separate apps on the phone",
        },
        {
          value: "111",
          label: "database migrations, each one reviewable",
          note: "37 pgTAP test files run against the schema",
        },
        {
          value: "5",
          label: "specialist subagents inside the repo",
          note: "migrations, engine, conformance, scenarios, verification",
        },
      ],
      sections: [
        {
          h: "The problem: four codebases drift apart",
          paragraphs: [
            "A product with a web console and two phone apps is usually built as separate repositories — a front end, an iOS app, an Android app, a backend — each with its own release, its own idea of what the API returns, and its own copy of the business rules.",
            "The copies are the expensive part. The moment the same rule is written twice, the two versions begin to disagree, and the disagreement surfaces as a bug that only appears on one platform. Every release day is then spent proving that four things still match.",
          ],
        },
        {
          h: "What we built: one repository, four workspaces",
          paragraphs: [
            "A Turborepo monorepo with the web console, the phone app, the scheduling engine and the shared API contract side by side. The engine is a pure TypeScript package with no build step: the console and the server compile the same source files, so a schedule computed in the browser and one computed on the server are provably the same code rather than two implementations that agree for now.",
            "One typecheck runs across every workspace at once. A change to the shared contract that breaks the app fails there — before anything is built, deployed or installed on a phone.",
          ],
          bullets: [
            "Web console — Next.js 16 and React 19, App Router, with its own API routes",
            "Phone app — Expo, shipped to the App Store and Google Play from the same repo",
            "Scheduling engine — pure TypeScript, deterministic, tested against a catalogue of scenarios",
            "Shared contract package — the response shapes and enums both sides agree on",
          ],
        },
        {
          h: "Environment is a git branch, and nothing else",
          paragraphs: [
            "Two environments, each complete down to its own app icon on the phone. The preview branch has a preview database, a preview web host and a separate Preview app. The main branch has the production database, the live site and the store app. There is no environment switch, no config flag and no staging server that drifts.",
            "That is what makes the release boring, which is the point: a push to main migrates the database, deploys the console and publishes both apps. A reviewer signs off on the preview app on their own phone, against preview data, and the same commit then goes live everywhere.",
          ],
        },
        {
          h: "Where the speed actually comes from",
          paragraphs: [
            "879 commits in nine weeks across 1,020 TypeScript files, with 111 database migrations behind them, is not typing faster. It comes from the repetitive, rule-bound work being handed to specialists: five subagents live in the repo, each with one job and the standards for it written down — one authors migrations and their tests, one implements the engine, one audits the engine against its spec, one writes test scenarios, one verifies a finished pass against the code rather than against a status line.",
            "The rule that keeps it honest is written into the repo guide: a tracker records what was built, so a claim is checked against the code and the tests, never against a line in a document that says it was done.",
          ],
        },
      ],
      pull:
        "A push to the main branch migrates the database, deploys the console and publishes both phone apps. There is no release day.",
      proof: {
        label: "How a change reaches a phone",
        caption:
          "The whole release topology. Two branches, two of everything, and one push that moves three systems at once.",
        alt: "Diagram: the preview branch feeds a preview database, preview web host and Preview phone app; the main branch feeds the production database, live site and store apps.",
      },
      disclaimer: {
        h: "What this case does not claim",
        body:
          "The client is not named, because naming them needs their written consent and we do not have it yet. The figures above describe the build — commits, files, migrations, environments — and were counted in the repository, not estimated. They are not business results: what the product did for its users is the client's to report, not ours, and you will not find an invented percentage here.",
      },
      cta: {
        h: "One product, every platform",
        body:
          "If you need a web app and a phone app that cannot drift apart, this is the shape we build it in. Thirty minutes is enough to say whether your product fits it.",
        button: "Book a 30-minute call",
      },
      backLabel: "All case studies",
    },
    pl: {
      metaTitle:
        "Web, iOS i Android z jednego repozytorium — case wdrożeniowy | aiAdaptiv",
      metaDescription:
        "Konsola webowa, dwie aplikacje ze sklepów i baza danych z jednego monorepo. Jeden push wydaje wszystkie trzy, preview i produkcja to dwie gałęzie gita, a powtarzalną robotę biorą subagenci.",
      kindLabel: "Wdrożenie u klienta — produkt bez nazwy",
      title: "Jedno repozytorium, trzy wydania",
      deck:
        "Produkt do planowania z konsolą webową, aplikacją na iOS, aplikacją na Androida i bazą danych pod spodem. Większość zespołów prowadziłaby to jako cztery repozytoria i cztery dni wydaniowe. To jest jedno repozytorium, a push na główną gałąź wydaje wszystko naraz.",
      facts: [
        { label: "Klient", value: "Nazwa tylko za jego zgodą" },
        { label: "Obszar", value: "Planowanie w klubie sportowym, web i mobile" },
        { label: "Budowa", value: "lipiec 2026 – trwa" },
        {
          label: "Działa na",
          value: "Next.js 16, Expo, Supabase, monorepo na Turborepo",
        },
      ],
      metrics: [
        {
          value: "3",
          label: "systemy wydawane jednym pushem",
          note: "baza migruje, konsola się deployuje, obie aplikacje publikują",
        },
        {
          value: "2",
          label: "kompletne środowiska, preview i produkcja",
          note: "osobne bazy, osobne hosty, osobne aplikacje na telefonie",
        },
        {
          value: "111",
          label: "migracji bazy, każda do przejrzenia",
          note: "37 plików testów pgTAP puszczanych na schemat",
        },
        {
          value: "5",
          label: "wyspecjalizowanych subagentów w repo",
          note: "migracje, silnik, zgodność ze specyfikacją, scenariusze, weryfikacja",
        },
      ],
      sections: [
        {
          h: "Problem: cztery bazy kodu się rozjeżdżają",
          paragraphs: [
            "Produkt z konsolą webową i dwiema aplikacjami mobilnymi buduje się zwykle jako osobne repozytoria — front, iOS, Android, backend — każde z własnym wydaniem, własnym wyobrażeniem o tym, co zwraca API, i własną kopią reguł biznesowych.",
            "Najdroższe są te kopie. W momencie, w którym ta sama reguła jest napisana dwa razy, obie wersje zaczynają się różnić, a różnica wychodzi jako błąd widoczny tylko na jednej platformie. Każdy dzień wydaniowy schodzi wtedy na udowadnianiu, że cztery rzeczy nadal do siebie pasują.",
          ],
        },
        {
          h: "Co zbudowaliśmy: jedno repozytorium, cztery workspace'y",
          paragraphs: [
            "Monorepo na Turborepo, w którym obok siebie leżą konsola webowa, aplikacja mobilna, silnik planujący i wspólny kontrakt API. Silnik to czysty pakiet TypeScriptu bez kroku budowania: konsola i serwer kompilują te same pliki źródłowe, więc grafik policzony w przeglądarce i policzony na serwerze to dowodliwie ten sam kod, a nie dwie implementacje, które na razie się zgadzają.",
            "Typecheck idzie jednym przebiegiem przez wszystkie workspace'y. Zmiana we wspólnym kontrakcie, która psuje aplikację, wywala się właśnie tam — zanim cokolwiek zostanie zbudowane, wdrożone czy zainstalowane na telefonie.",
          ],
          bullets: [
            "Konsola webowa — Next.js 16 i React 19, App Router, z własnymi trasami API",
            "Aplikacja mobilna — Expo, wysyłana do App Store i Google Play z tego samego repo",
            "Silnik planujący — czysty TypeScript, deterministyczny, testowany katalogiem scenariuszy",
            "Pakiet wspólnego kontraktu — kształty odpowiedzi i enumy, na które obie strony się godzą",
          ],
        },
        {
          h: "Środowisko to gałąź gita i nic poza tym",
          paragraphs: [
            "Dwa środowiska, każde kompletne aż po własną ikonę na telefonie. Gałąź preview ma bazę preview, hosting preview i osobną aplikację Preview. Gałąź główna ma bazę produkcyjną, żywą stronę i aplikację ze sklepu. Nie ma przełącznika środowiska, flagi w configu ani serwera stagingowego, który się rozjeżdża.",
            "To właśnie czyni wydanie nudnym, i o to chodzi: push na główną migruje bazę, deployuje konsolę i publikuje obie aplikacje. Osoba odbierająca klika po aplikacji Preview na własnym telefonie, na danych preview, a potem ten sam commit idzie na produkcję wszędzie naraz.",
          ],
        },
        {
          h: "Skąd naprawdę bierze się tempo",
          paragraphs: [
            "879 commitów w dziewięć tygodni w 1 020 plikach TypeScriptu, z 111 migracjami bazy za nimi, to nie jest szybsze pisanie. To efekt oddania powtarzalnej, regułowej roboty specjalistom: w repo mieszka pięciu subagentów, każdy z jednym zadaniem i spisanym standardem — jeden pisze migracje i ich testy, jeden implementuje silnik, jeden audytuje silnik wobec specyfikacji, jeden pisze scenariusze testowe, jeden weryfikuje skończony etap wobec kodu, a nie wobec linijki w statusie.",
            "Regułą, która trzyma to w ryzach, jest zdanie wpisane do przewodnika po repo: tracker zapisuje, co zbudowano, więc twierdzenie sprawdza się w kodzie i testach, nigdy w dokumencie, który mówi, że zrobione.",
          ],
        },
      ],
      pull:
        "Push na główną gałąź migruje bazę, deployuje konsolę i publikuje obie aplikacje mobilne. Nie ma czegoś takiego jak dzień wydaniowy.",
      proof: {
        label: "Jak zmiana trafia na telefon",
        caption:
          "Cała topologia wydania. Dwie gałęzie, po dwa egzemplarze wszystkiego i jeden push, który rusza trzy systemy naraz.",
        alt: "Diagram: gałąź preview zasila bazę preview, hosting preview i aplikację Preview; gałąź główna zasila bazę produkcyjną, żywą stronę i aplikacje ze sklepów.",
      },
      disclaimer: {
        h: "Czego ten case nie twierdzi",
        body:
          "Klient nie jest nazwany, bo nazwanie go wymaga jego pisemnej zgody, a tej nie mamy. Liczby wyżej opisują budowę — commity, pliki, migracje, środowiska — i zostały policzone w repozytorium, nie oszacowane. Nie są wynikiem biznesowym: to, co produkt zrobił dla swoich użytkowników, jest do zaraportowania przez klienta, nie przez nas, i nie znajdziesz tu wymyślonego procentu.",
      },
      cta: {
        h: "Jeden produkt, każda platforma",
        body:
          "Jeśli potrzebujesz aplikacji webowej i mobilnej, które nie mogą się rozjechać, budujemy to w tym kształcie. Trzydzieści minut wystarczy, żeby powiedzieć, czy Wasz produkt się w niego wpisuje.",
        button: "Umów 30-minutową rozmowę",
      },
      backLabel: "Wszystkie case studies",
    },
  },
};
