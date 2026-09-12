import type { CaseStudy } from "./types";
import hero from "@/components/agency/assets/case-one-repo.jpg";

/**
 * A METHOD case: the shape we build web + mobile products in, not an account
 * of someone's product. The client asked not to be mentioned at all, so this
 * describes the setup and nothing about what it runs — no name, no sector, no
 * hosts, no store links, and no claim about what the product achieved.
 *
 * The volume figures were counted on 2026-09-12 in a production codebase
 * running exactly this shape: 879 commits since 2026-07-10, 1,020 TypeScript
 * files, 111 migrations, 37 pgTAP test files, 5 subagents.
 */
export const oneRepo: CaseStudy = {
  slug: "one-repo-three-releases",
  kind: "method",
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
        "Web, iOS and Android from one repository — how we build | aiAdaptiv",
      metaDescription:
        "The setup we install for products that need a web app and a phone app: one monorepo, two branches, and a push that migrates the database, deploys the console and publishes both store apps at once.",
      kindLabel: "How we build — web and mobile in one repository",
      title: "One repository, three releases",
      deck:
        "A web console, an iOS app, an Android app and a database underneath. Most teams run that as four codebases and four release days. This is the setup we build instead — one repository, two branches, and a push that releases all of it at once. It is running in production right now, and it is the same shape we would set up for you.",
      facts: [
        { label: "What this is", value: "A way of building, not a product" },
        { label: "Fits", value: "Anything with a web app and a phone app" },
        {
          label: "Stack",
          value: "Next.js 16, Expo, Supabase, Turborepo monorepo",
        },
        { label: "Status", value: "In production, shipped to both stores" },
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
          value: "1",
          label: "typecheck across every workspace at once",
          note: "a broken shared contract fails there, before anything builds",
        },
        {
          value: "5",
          label: "specialist subagents living in the repo",
          note: "migrations, domain engine, conformance, scenarios, verification",
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
          h: "The shape: one repository, four workspaces",
          paragraphs: [
            "A Turborepo monorepo with the web console, the phone app, the domain engine and the shared API contract side by side. The engine is a pure TypeScript package with no build step: the console and the server compile the same source files, so a result computed in the browser and the same result computed on the server are provably the same code, rather than two implementations that agree for now.",
            "One typecheck runs across every workspace at once. A change to the shared contract that breaks the app fails there — before anything is built, deployed or installed on a phone.",
          ],
          bullets: [
            "Web console — Next.js 16 and React 19, App Router, with its own API routes",
            "Phone app — Expo, shipped to the App Store and Google Play from the same repo",
            "Domain engine — pure TypeScript, deterministic, tested against a catalogue of scenarios",
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
            "This is not a toy configuration. In the production codebase we counted it on, the setup carries 879 commits made in nine weeks across 1,020 TypeScript files, with 111 database migrations and 37 pgTAP test files behind them.",
            "That pace is not typing faster. It comes from the repetitive, rule-bound work being handed to specialists: five subagents live in the repository, each with one job and the standard for it written down — one authors migrations and their tests, one implements the domain engine, one audits that engine against its spec, one writes test scenarios, one verifies a finished piece of work against the code rather than against a status line.",
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
          "This is a description of a setup, not of somebody's product. The figures are structural — what the repository holds and what a push does — plus volume counted in a production codebase running exactly this shape. None of them is a business result: what a product built this way goes on to do for its users belongs to whoever owns it, not to us, so you will not find an invented percentage here.",
      },
      cta: {
        h: "We can set this up for your product",
        body:
          "Starting from scratch, or holding a web app and a phone app that have already drifted apart — this is the shape we put them in. Thirty minutes is enough to say whether yours fits it.",
        button: "Book a 30-minute call",
      },
      backLabel: "All case studies",
    },
    pl: {
      metaTitle:
        "Web, iOS i Android z jednego repozytorium — jak budujemy | aiAdaptiv",
      metaDescription:
        "Układ, który stawiamy produktom potrzebującym aplikacji webowej i mobilnej: jedno monorepo, dwie gałęzie i push, który migruje bazę, deployuje konsolę i publikuje obie aplikacje ze sklepów naraz.",
      kindLabel: "Jak budujemy — web i mobile w jednym repozytorium",
      title: "Jedno repozytorium, trzy wydania",
      deck:
        "Konsola webowa, aplikacja na iOS, aplikacja na Androida i baza danych pod spodem. Większość zespołów prowadzi to jako cztery repozytoria i cztery dni wydaniowe. My budujemy to inaczej — jedno repozytorium, dwie gałęzie i push, który wydaje wszystko naraz. Ten układ stoi dziś na produkcji i to ten sam kształt, który postawilibyśmy Wam.",
      facts: [
        { label: "Co to jest", value: "Sposób budowania, nie produkt" },
        {
          label: "Pasuje do",
          value: "Wszystkiego z aplikacją webową i mobilną",
        },
        {
          label: "Stack",
          value: "Next.js 16, Expo, Supabase, monorepo na Turborepo",
        },
        { label: "Status", value: "Na produkcji, w obu sklepach" },
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
          value: "1",
          label: "typecheck obejmujący wszystkie workspace'y naraz",
          note: "zepsuty wspólny kontrakt wywala się tam, zanim cokolwiek się zbuduje",
        },
        {
          value: "5",
          label: "wyspecjalizowanych subagentów mieszkających w repo",
          note: "migracje, silnik domenowy, zgodność ze specyfikacją, scenariusze, weryfikacja",
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
          h: "Kształt: jedno repozytorium, cztery workspace'y",
          paragraphs: [
            "Monorepo na Turborepo, w którym obok siebie leżą konsola webowa, aplikacja mobilna, silnik domenowy i wspólny kontrakt API. Silnik to czysty pakiet TypeScriptu bez kroku budowania: konsola i serwer kompilują te same pliki źródłowe, więc wynik policzony w przeglądarce i ten sam wynik policzony na serwerze to dowodliwie ten sam kod, a nie dwie implementacje, które na razie się zgadzają.",
            "Typecheck idzie jednym przebiegiem przez wszystkie workspace'y. Zmiana we wspólnym kontrakcie, która psuje aplikację, wywala się właśnie tam — zanim cokolwiek zostanie zbudowane, wdrożone czy zainstalowane na telefonie.",
          ],
          bullets: [
            "Konsola webowa — Next.js 16 i React 19, App Router, z własnymi trasami API",
            "Aplikacja mobilna — Expo, wysyłana do App Store i Google Play z tego samego repo",
            "Silnik domenowy — czysty TypeScript, deterministyczny, testowany katalogiem scenariuszy",
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
            "To nie jest zabawkowa konfiguracja. W produkcyjnej bazie kodu, na której to policzyliśmy, układ niesie 879 commitów zrobionych w dziewięć tygodni w 1 020 plikach TypeScriptu, z 111 migracjami bazy i 37 plikami testów pgTAP za nimi.",
            "To tempo to nie szybsze pisanie. To efekt oddania powtarzalnej, regułowej roboty specjalistom: w repozytorium mieszka pięciu subagentów, każdy z jednym zadaniem i spisanym standardem — jeden pisze migracje i ich testy, jeden implementuje silnik domenowy, jeden audytuje ten silnik wobec specyfikacji, jeden pisze scenariusze testowe, jeden weryfikuje skończony kawałek pracy wobec kodu, a nie wobec linijki w statusie.",
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
          "To jest opis układu, nie czyjegoś produktu. Liczby są strukturalne — co zawiera repozytorium i co robi push — plus objętość policzona w produkcyjnej bazie kodu chodzącej dokładnie w tym kształcie. Żadna z nich nie jest wynikiem biznesowym: to, co produkt zbudowany w ten sposób zrobi dla swoich użytkowników, należy do jego właściciela, nie do nas, więc nie znajdziesz tu wymyślonego procentu.",
      },
      cta: {
        h: "Postawimy to samo u Was",
        body:
          "Od zera albo z aplikacją webową i mobilną, które już zdążyły się rozjechać — w ten kształt je układamy. Trzydzieści minut wystarczy, żeby powiedzieć, czy Wasz produkt się w niego wpisuje.",
        button: "Umów 30-minutową rozmowę",
      },
      backLabel: "Wszystkie case studies",
    },
  },
};
