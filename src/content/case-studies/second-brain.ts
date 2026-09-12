import type { CaseStudy } from "./types";
import hero from "@/components/agency/assets/case-second-brain.jpg";

/**
 * Every figure here was counted in the vault itself on 2026-09-10 and can be
 * recounted at any time with scripts/second-brain-graph.py. Nothing is
 * estimated. There is deliberately no "hours saved" number — we have never
 * measured one, so we do not publish one.
 */
export const secondBrain: CaseStudy = {
  slug: "second-brain",
  kind: "reference",
  workId: "second-brain",
  completed: "2026-06-29",
  hero,
  image: {
    src: "/case-studies/second-brain-graph.svg",
    width: 1600,
    height: 1100,
  },
  copy: {
    en: {
      metaTitle:
        "Second Brain — 749 pages of context, filed by an agent | aiAdaptiv",
      metaDescription:
        "A Claude Code agent that reads what we feed it, writes the page and wires the links. 749 pages, 369,654 words and 15,028 connections of our own context — searchable and cited, never pasted into a prompt.",
      kindLabel: "Reference build — our own system",
      title: "The knowledge base that files itself",
      deck: "Everyone wants the second brain everyone on tech Twitter keeps describing. We built ours and have run it every day since April. An agent reads each source, writes the page, extracts the people and the ideas, and connects them — so the context is there before you ask for it.",
      facts: [
        { label: "Client", value: "None — our own system" },
        { label: "Field", value: "Knowledge management" },
        { label: "Built", value: "April – June 2026, ~11 weeks" },
        { label: "Runs on", value: "Claude Code + Obsidian, Markdown in Git" },
      ],
      metrics: [
        {
          value: "749",
          label: "pages the agent maintains",
          note: "245 sources · 295 entities · 171 concepts · 33 syntheses",
        },
        {
          value: "369,654",
          label: "words of context already written up",
          note: "roughly 690,000 tokens",
        },
        {
          value: "15,028",
          label: "links the agent wrote",
          note: "4,762 of them between existing pages",
        },
        {
          value: "4",
          label: "pages connected to nothing",
          note: "out of 749 — the linking actually happens",
        },
      ],
      sections: [
        {
          h: "The problem: context does not survive the conversation",
          paragraphs: [
            "Every session with a language model starts from nothing. You find the note again, paste the relevant part again, explain the background again. The thinking is not the expensive part — the reassembly is, and you pay for it several times a day.",
            "The usual fix is to pile everything into one folder and hope search saves you. It doesn't: a folder of 900 files is not context, it's a haystack with better lighting.",
          ],
        },
        {
          h: "What we built",
          paragraphs: [
            "A schema file turns Claude Code into a librarian with rules: how a page is structured, when to cite, what to link, what never to touch. You drop a source in and run one command. The agent reads it, writes a summary page, pulls out the people, companies and ideas it mentions, gives each of them a page of their own, and links all of it together.",
            "No RAG and no vector database. The whole brain is Markdown in a Git repository, which means every change the agent makes is a diff you can read and roll back, and the same files open natively in Obsidian — where the links become a graph you can walk.",
          ],
          bullets: [
            "20 commands — ingest, query, deep answers with citations, lint, synthesis, contradiction hunting",
            "8 subagents, each with one job: linking, deep research, fact-checking, ingesting a specific source type",
            "17 capture scripts — a Telegram bot for links, voice notes and photos; YouTube and audio transcription; article extraction; Readwise highlights",
            "Health and finance feeds, because a second brain that ignores half your week is not one",
          ],
        },
        {
          h: "What changed",
          paragraphs: [
            "The vault now holds 369,654 words — 245 sources read, 295 people and companies described, 171 ideas written up, 33 syntheses drawn across them. None of it was tagged or filed by hand.",
            "The number that matters is not the size, it is the connectedness: the agent wrote 15,028 links, and out of 749 pages exactly four are connected to nothing. That is the difference between an archive and a brain. Ask a question and the answer arrives with its sources attached, because the sources were never separated from it in the first place.",
          ],
        },
      ],
      pull: "369,654 words of our own context — already written up, linked and quotable. You don't paste that into a prompt. It is simply there.",
      proof: {
        label: "What the graph shows",
        caption:
          "Every page in the vault and every connection between them. Titles and text are deliberately not rendered — this is the structure, not the contents.",
        alt: "Force-directed graph of 747 connected wiki pages coloured by category — sources, entities, concepts and syntheses — with no labels.",
      },
      disclaimer: {
        h: "What this case does not claim",
        body: "This is our own system, not a client engagement, and we would rather say so than dress it up. Every figure above was counted in the vault and can be recounted on request. We have never measured how many hours it saves, so there is no hours figure here — the honest claim is that the context is written down and connected, and you can see exactly how much of it there is.",
      },
      cta: {
        h: "Your team knows more than it can find",
        body: "We build these on the stack you already keep — Obsidian, Notion, a shared drive, a decade of documents nobody has opened. Thirty minutes is enough to tell you whether it is worth building.",
        button: "Book a 30-minute call",
      },
      backLabel: "All case studies",
    },
    pl: {
      metaTitle:
        "Second Brain — 749 stron kontekstu opisanych przez agenta | aiAdaptiv",
      metaDescription:
        "Agent w Claude Code czyta każde źródło, pisze stronę i łączy ją z resztą. 749 stron, 369 654 słowa i 15 028 połączeń własnego kontekstu — z cytowaniem, bez wklejania czegokolwiek do promptu.",
      kindLabel: "Build referencyjny — nasz własny system",
      title: "Baza wiedzy, która opisuje się sama",
      deck: "Drugi mózg, o którym pisze pół technologicznego Twittera, chce mieć każdy. My swój zbudowaliśmy i używamy go codziennie od kwietnia. Agent czyta każde źródło, pisze stronę, wyciąga osoby i pojęcia i łączy je ze sobą — więc kontekst jest na miejscu, zanim o niego poprosisz.",
      facts: [
        { label: "Klient", value: "Brak — nasz własny system" },
        { label: "Obszar", value: "Zarządzanie wiedzą" },
        { label: "Budowa", value: "kwiecień – czerwiec 2026, ~11 tygodni" },
        { label: "Działa na", value: "Claude Code + Obsidian, Markdown w Git" },
      ],
      metrics: [
        {
          value: "749",
          label: "stron utrzymywanych przez agenta",
          note: "245 źródeł · 295 encji · 171 pojęć · 33 syntezy",
        },
        {
          value: "369 654",
          label: "słowa kontekstu już opisanego",
          note: "około 690 tysięcy tokenów",
        },
        {
          value: "15 028",
          label: "połączeń napisanych przez agenta",
          note: "4 762 z nich między istniejącymi stronami",
        },
        {
          value: "4",
          label: "strony bez ani jednego połączenia",
          note: "na 749 — linkowanie naprawdę działa",
        },
      ],
      sections: [
        {
          h: "Problem: kontekst nie przeżywa rozmowy",
          paragraphs: [
            "Każda sesja z modelem zaczyna się od zera. Znowu szukasz notatki, znowu wklejasz fragment, znowu tłumaczysz tło. Drogie nie jest myślenie — drogie jest składanie kontekstu od nowa, kilka razy dziennie.",
            "Zwykła próba ratunku to wrzucić wszystko do jednego folderu i liczyć na wyszukiwarkę. Nie działa: 900 plików w folderze to nie kontekst, to lepiej oświetlony stóg siana.",
          ],
        },
        {
          h: "Co zbudowaliśmy",
          paragraphs: [
            "Plik ze schematem zamienia Claude Code w bibliotekarza z regułami: jak wygląda strona, kiedy cytować, co linkować, czego nie wolno ruszać. Wrzucasz źródło i uruchamiasz jedną komendę. Agent je czyta, pisze stronę ze streszczeniem, wyciąga osoby, firmy i pojęcia, zakłada każdemu z nich własną stronę i wiąże to wszystko w całość.",
            "Bez RAG-a i bez bazy wektorowej. Cały mózg to Markdown w repozytorium Git — każda zmiana agenta jest diffem, który można przeczytać i cofnąć, a te same pliki otwiera natywnie Obsidian, gdzie połączenia stają się grafem do chodzenia.",
          ],
          bullets: [
            "20 komend — ingest, szybkie zapytanie, pogłębiona odpowiedź z cytowaniem, lint, synteza, wyszukiwanie sprzeczności",
            "8 subagentów, każdy z jednym zadaniem: linkowanie, research, weryfikacja faktów, obsługa konkretnego typu źródła",
            "17 skryptów przechwytywania — bot Telegram na linki, notatki głosowe i zdjęcia; transkrypcja YouTube i audio; ekstrakcja artykułów; highlighty z Readwise",
            "Dane zdrowotne i finansowe, bo drugi mózg, który ignoruje połowę tygodnia, nie jest drugim mózgiem",
          ],
        },
        {
          h: "Co się zmieniło",
          paragraphs: [
            "W vaulcie leży 369 654 słowa — 245 przeczytanych źródeł, 295 opisanych osób i firm, 171 pojęć, 33 syntezy poprowadzone w poprzek tego wszystkiego. Nic z tego nie było tagowane ani układane ręcznie.",
            "Liczbą, która ma znaczenie, nie jest rozmiar, tylko gęstość połączeń: agent napisał 15 028 linków, a na 749 stron dokładnie cztery nie łączą się z niczym. Na tym polega różnica między archiwum a mózgiem. Zadajesz pytanie i dostajesz odpowiedź razem ze źródłami, bo źródła nigdy nie zostały od niej oddzielone.",
          ],
        },
      ],
      pull: "369 654 słowa własnego kontekstu — już opisanego, połączonego i możliwego do zacytowania. Tego się nie wkleja do promptu. Ono tam po prostu jest.",
      proof: {
        label: "Co pokazuje graf",
        caption:
          "Każda strona vaulta i każde połączenie między nimi. Tytuły i treść celowo nie są renderowane — to sama struktura, nie zawartość.",
        alt: "Graf 747 połączonych stron wiki pokolorowany według kategorii — źródła, encje, pojęcia i syntezy — bez żadnych podpisów.",
      },
      disclaimer: {
        h: "Czego ten case nie twierdzi",
        body: "To nasz własny system, nie wdrożenie u klienta, i wolimy to powiedzieć wprost niż ubierać w cudze szaty. Każdą liczbę wyżej policzyliśmy w vaulcie i możemy policzyć ponownie na życzenie. Nigdy nie mierzyliśmy, ile godzin to oszczędza, więc nie ma tu liczby godzin — uczciwe twierdzenie brzmi: kontekst jest spisany i połączony, a Ty widzisz dokładnie, ile go jest.",
      },
      cta: {
        h: "Twój zespół wie więcej, niż potrafi znaleźć",
        body: "Budujemy to na tym, co już macie — Obsidian, Notion, dysk współdzielony, dziesięć lat dokumentów, których nikt nie otwiera. Trzydzieści minut wystarczy, żeby powiedzieć, czy warto to budować.",
        button: "Umów 30-minutową rozmowę",
      },
      backLabel: "Wszystkie case studies",
    },
  },
};
