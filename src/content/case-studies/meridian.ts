import type { CaseStudy } from "./types";

/**
 * The private-AI showcase. The deal room and its documents are SYNTHETIC —
 * invented for the demo — so this entry claims capability and nothing else.
 * Every behaviour described was verified against the running deployment on
 * 2026-07-09; the full runbook is in outreach/poc-showcase-runbook.md.
 */
export const meridian: CaseStudy = {
  slug: "private-deal-room",
  kind: "reference",
  workId: "private-ai",
  completed: "2026-07-09",
  loomId: "24062b57fb0c4abfb17678429fb2bacc",
  copy: {
    en: {
      metaTitle:
        "A private AI deal room — open-source LLM, no data leaves | aiAdaptiv",
      metaDescription:
        "A working demo of document intelligence on a self-hosted open-source model: grounded answers with citations, a refusal when the answer isn't in the documents, and not one token sent to a third-party API.",
      kindLabel: "Reference build — demo on synthetic documents",
      title: "A deal room where the AI never sees the internet",
      deck: "Law firms and advisories keep asking the same question: can we get what ChatGPT does without handing client documents to someone else's servers? We built the answer as something you can watch — a private deal room running on an open-source model on our own GPU.",
      facts: [
        { label: "Client", value: "None — demo on synthetic documents" },
        { label: "Field", value: "Legal & M&A document review" },
        { label: "Built", value: "July 2026" },
        { label: "Runs on", value: "Open WebUI + Ollama, Qwen 2.5, own GPU" },
      ],
      metrics: [
        {
          value: "0",
          label: "tokens sent to a third-party API",
          note: "every answer generated on hardware we control",
        },
        {
          value: "5",
          label: "facts pulled from the documents, each cited",
          note: "value, deadline, penalty, governing law, pricing",
        },
        {
          value: "1",
          label: "question it refused to answer",
          note: "a party that appears in no document — it said so instead of inventing",
        },
        {
          value: "~2 min",
          label: "from cold start to a running private model",
        },
      ],
      sections: [
        {
          h: "The problem: the tool that helps is the tool you're not allowed to use",
          paragraphs: [
            "A due-diligence team reads the same twelve documents looking for the same six numbers. It is exactly the work a language model is good at, and exactly the work a confidentiality undertaking forbids you to paste into a public one.",
            "So the choice on offer is usually: break the undertaking quietly, or keep reading by hand. Both are bad answers to a solved problem.",
          ],
        },
        {
          h: "What we built",
          paragraphs: [
            "A private workspace with the deal documents loaded as a knowledge base, and three assistants on top of it: a deal-room analyst that answers with citations, a contract reviewer that returns a clause-by-clause risk table, and a drafter for client correspondence. Slash commands cover the requests that repeat — risks, summary, redline, plain English.",
            "The model runs on a GPU we control, behind our own front end. Nothing is sent to OpenAI, Anthropic or anyone else, because there is no one else in the path. For a real deployment the same stack goes into the client's own cloud account, under their keys.",
          ],
          bullets: [
            "Answers are grounded in the documents and carry a numbered citation back to the source",
            "Function calling, so it can combine the documents with a calculation — days remaining to a deadline it read from a contract",
            "Admin controls over who may use which model and which knowledge base",
            "Reproducible from a single provisioning script, so a client deployment is not a hand-built snowflake",
          ],
        },
        {
          h: "The moment that convinces lawyers",
          paragraphs: [
            "We asked it about the chief executive of a company that appears in none of the documents. It declined, and said the documents do not contain that.",
            "That is the whole argument. A system that invents a plausible name is worse than no system at all in this work, and every buyer in this field tests for it within the first five minutes. The grounded answers — €47.5M enterprise value, exclusivity expiring 15 August, a €250,000 breach penalty under Polish law — all came back exact and cited.",
          ],
        },
      ],
      pull: "Asked about someone the documents never mention, it refused. In legal work that refusal is the feature.",
      proof: {
        label: "See it working",
        caption:
          "A recorded walkthrough of the running system. The documents are synthetic; the deployment is real.",
        video: {
          label: "See it working",
          title:
            "A contract goes in. Risks and a summary come out — inside a private, branded environment.",
          duration: "4:32",
          cta: "Play the walkthrough",
          note: "Loads only when you press play, so nothing is requested from Loom until then.",
        },
      },
      disclaimer: {
        h: "What this case does not claim",
        body: "There is no client here and no outcome to report. The deal, the parties and the documents were written for the demo, so nothing above is a result — it is a demonstration that the architecture works and behaves correctly, including when the honest answer is 'that is not in the documents'. The demo GPU sits outside the EU; a real engagement is deployed inside the client's own EU cloud account, which is the point of the offer.",
      },
      cta: {
        h: "See it on your own documents",
        body: "The fastest way to judge this is to watch it read something of yours. We deploy it into your cloud, under your keys, and you decide afterwards whether it earns its place.",
        button: "Book a 30-minute call",
      },
      backLabel: "All case studies",
    },
    pl: {
      metaTitle:
        "Prywatny deal room na modelu open source — dane nie wychodzą | aiAdaptiv",
      metaDescription:
        "Działające demo pracy na dokumentach na samodzielnie hostowanym modelu open source: odpowiedzi z cytowaniem, odmowa, gdy odpowiedzi nie ma w dokumentach, i ani jeden token wysłany do zewnętrznego API.",
      kindLabel: "Build referencyjny — demo na syntetycznych dokumentach",
      title: "Deal room, w którym AI nigdy nie widzi internetu",
      deck: "Kancelarie i doradcy zadają wciąż to samo pytanie: czy da się mieć to, co daje ChatGPT, bez oddawania dokumentów klienta na cudze serwery? Zbudowaliśmy odpowiedź, którą da się obejrzeć — prywatny deal room na modelu open source, na naszym własnym GPU.",
      facts: [
        { label: "Klient", value: "Brak — demo na syntetycznych dokumentach" },
        { label: "Obszar", value: "Dokumenty prawne i transakcyjne" },
        { label: "Budowa", value: "lipiec 2026" },
        {
          label: "Działa na",
          value: "Open WebUI + Ollama, Qwen 2.5, własny GPU",
        },
      ],
      metrics: [
        {
          value: "0",
          label: "tokenów wysłanych do zewnętrznego API",
          note: "każda odpowiedź powstaje na sprzęcie, który kontrolujemy",
        },
        {
          value: "5",
          label: "faktów wyciągniętych z dokumentów, każdy z cytowaniem",
          note: "wycena, termin, kara umowna, prawo właściwe, cennik",
        },
        {
          value: "1",
          label: "pytanie, na które odmówił odpowiedzi",
          note: "strona, której nie ma w żadnym dokumencie — powiedział to zamiast zmyślić",
        },
        {
          value: "~2 min",
          label: "od zimnego startu do działającego prywatnego modelu",
        },
      ],
      sections: [
        {
          h: "Problem: narzędzie, które pomaga, to narzędzie, którego nie wolno użyć",
          paragraphs: [
            "Zespół due diligence czyta te same dwanaście dokumentów, szukając tych samych sześciu liczb. To dokładnie ta praca, w której model językowy jest dobry — i dokładnie ta, której klauzula poufności zabrania wklejać do publicznego modelu.",
            "Wybór sprowadza się zwykle do: po cichu złamać zobowiązanie albo dalej czytać ręcznie. Obie odpowiedzi są złe na problem, który jest już rozwiązany.",
          ],
        },
        {
          h: "Co zbudowaliśmy",
          paragraphs: [
            "Prywatne środowisko z dokumentami transakcji wgranymi jako baza wiedzy i trzema asystentami na wierzchu: analityk deal roomu odpowiadający z cytowaniem, recenzent umów zwracający tabelę ryzyk klauzula po klauzuli oraz asystent do korespondencji z klientem. Komendy skrótowe obsługują to, co się powtarza — ryzyka, streszczenie, redline, prosty język.",
            "Model działa na GPU, które kontrolujemy, za naszym własnym frontendem. Nic nie leci do OpenAI, Anthropica ani nikogo innego, bo nikogo innego nie ma w tej ścieżce. Przy prawdziwym wdrożeniu ten sam stack ląduje w koncie chmurowym klienta, pod jego kluczami.",
          ],
          bullets: [
            "Odpowiedzi są osadzone w dokumentach i noszą numerowane odwołanie do źródła",
            "Wywoływanie funkcji, więc łączy dokumenty z obliczeniem — ile dni zostało do terminu, który odczytał z umowy",
            "Kontrola administracyjna nad tym, kto może używać którego modelu i której bazy wiedzy",
            "Odtwarzalne z jednego skryptu, więc wdrożenie u klienta nie jest ręcznie sklejonym wyjątkiem",
          ],
        },
        {
          h: "Moment, który przekonuje prawników",
          paragraphs: [
            "Zapytaliśmy o prezesa spółki, która nie występuje w żadnym z dokumentów. Odmówił i powiedział, że dokumenty tego nie zawierają.",
            "I to jest cały argument. System, który wymyśla prawdopodobnie brzmiące nazwisko, jest w tej pracy gorszy niż brak systemu, a każdy kupujący w tej branży testuje to w pierwszych pięciu minutach. Odpowiedzi osadzone w dokumentach — wycena 47,5 mln €, wyłączność wygasająca 15 sierpnia, kara 250 tys. € pod prawem polskim — wróciły co do joty i z cytowaniem.",
          ],
        },
      ],
      pull: "Zapytany o kogoś, kogo dokumenty nie wymieniają, odmówił. W pracy prawniczej ta odmowa jest funkcją, nie usterką.",
      proof: {
        label: "Zobacz, jak działa",
        caption:
          "Nagranie z działającego systemu. Dokumenty są syntetyczne, wdrożenie jest prawdziwe.",
        video: {
          label: "Zobacz, jak działa",
          title:
            "Umowa wchodzi. Ryzyka i streszczenie wychodzą — w prywatnym, brandowanym środowisku.",
          duration: "4:32",
          cta: "Odtwórz nagranie",
          note: "Ładuje się dopiero po kliknięciu, więc do Loom nic nie leci wcześniej.",
        },
      },
      disclaimer: {
        h: "Czego ten case nie twierdzi",
        body: "Nie ma tu klienta ani wyniku do zaraportowania. Transakcja, strony i dokumenty zostały napisane na potrzeby demo, więc nic powyżej nie jest rezultatem — to dowód, że architektura działa i zachowuje się poprawnie, także wtedy, gdy uczciwą odpowiedzią jest „tego nie ma w dokumentach”. GPU demo stoi poza UE; prawdziwe wdrożenie idzie do konta chmurowego klienta w UE, i o to w tej ofercie chodzi.",
      },
      cta: {
        h: "Zobacz to na własnych dokumentach",
        body: "Najszybciej ocenisz to, patrząc, jak czyta coś Waszego. Wdrażamy w Waszej chmurze, pod Waszymi kluczami, a Wy decydujecie potem, czy to się broni.",
        button: "Umów 30-minutową rozmowę",
      },
      backLabel: "Wszystkie case studies",
    },
  },
};
