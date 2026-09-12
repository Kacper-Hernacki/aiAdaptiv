import type { CaseStudy } from "./types";
import hero from "@/components/agency/assets/case-pocket-agent.jpg";

/**
 * Our own setup, used by exactly one person. Verified locally on 2026-09-12:
 * the Telegram channel config carries `dmPolicy: "pairing"`, one entry in
 * `allowFrom`, no groups and nothing pending. The host (a Hetzner VPS) and the
 * fix-from-a-train story are Kacper's own account — reported as such, never
 * dressed up as a measured result.
 */
export const pocketAgent: CaseStudy = {
  slug: "agent-on-a-server",
  kind: "reference",
  completed: "2026-09-12",
  hero,
  copy: {
    en: {
      metaTitle:
        "A coding agent on a server you can text from your phone | aiAdaptiv",
      metaDescription:
        "Claude Code running on a small VPS instead of a laptop, reachable over a messenger, answering exactly one allow-listed person. The work carries on whether or not the laptop is open.",
      kindLabel: "Reference build — our own setup, one user",
      title: "A fix from a moving train",
      deck:
        "Development normally waits for the laptop. You see the problem on a phone, and nothing can happen until you are back at a desk. So we moved the agent off the laptop entirely: it lives on a small server, it is awake all the time, and you reach it by sending it a message like you would a colleague.",
      facts: [
        { label: "Client", value: "None — our own setup" },
        { label: "Field", value: "How we work, day to day" },
        { label: "Runs on", value: "Claude Code on a Hetzner VPS" },
        { label: "Reached by", value: "A messenger, from any phone" },
      ],
      metrics: [
        {
          value: "1",
          label: "person the bot will answer",
          note: "an allow-list with a single entry; an unknown sender gets nothing",
        },
        {
          value: "0",
          label: "laptops open when the fix went out",
          note: "the work happened on the server, not on a machine in a bag",
        },
        {
          value: "24/7",
          label: "the session stays awake",
          note: "it does not close when you shut the lid or board a train",
        },
      ],
      sections: [
        {
          h: "The problem: the work waits for the laptop",
          paragraphs: [
            "You notice something on your phone — a broken page, a message from a client, a fix you can already picture. And then nothing happens, because the thing that can act on it is a laptop in a bag, or at home, or three hours away.",
            "By the time you sit down, the moment has usually cost more than the fix was worth: the context has faded, the day has moved on, and the small job has become an item on a list.",
          ],
        },
        {
          h: "What we built",
          paragraphs: [
            "Claude Code runs on a small server rather than on a laptop. The repositories are already checked out there, so a request arrives somewhere that can act on it immediately. The interface is a messenger: you send it a sentence, it works, it answers.",
            "Nothing about that is exotic — that is rather the point. There is no new app to install, no dashboard, no VPN client to open on a phone. The thing you already carry is enough, and the server does not care whether your laptop is on.",
          ],
        },
        {
          h: "Security is an allow-list of one",
          paragraphs: [
            "An agent with shell access, reachable from the internet, is a liability unless you are extremely clear about who may talk to it. The answer here is the plainest one available: pairing is required, the allow-list holds exactly one entry, no groups are approved, and nothing is left pending. Anyone else who finds the bot gets nothing at all.",
            "That is a deliberate ceiling, not a limitation we plan to remove quietly. Opening this to a team is a different system with a different security story, and it should be built as one rather than by adding names to a list.",
          ],
        },
        {
          h: "The trip that paid for it",
          paragraphs: [
            "The moment it justified itself was a fix sent from a train. The request was typed on a phone, the work ran on the server, the change went out. No laptop was opened, and the thing that would normally have waited for a desk simply did not wait.",
            "One afternoon is not a productivity study, and we are not going to present it as one. But it is the kind of thing that either happens or does not, and before this setup existed it could not have.",
          ],
        },
      ],
      pull:
        "The request was typed on a phone on a train. The work ran on a server. No laptop was opened.",
      proof: {
        label: "What we can show",
        caption:
          "Nothing here is a screenshot, on purpose: the conversation with this bot is a live shell over our own repositories, so publishing it would publish client code. The verifiable part is the access policy — pairing required, one entry on the allow-list, no groups, nothing pending — and you are welcome to see it on a call.",
      },
      disclaimer: {
        h: "What this case does not claim",
        body:
          "One person uses this, and that person is us. There is no team behind it, no client, no uptime commitment, and no measurement of time saved — the train is a single afternoon recounted honestly, not a statistic. The access policy above was read from the running configuration; the rest is our own account of our own setup.",
      },
      cta: {
        h: "Want your team to work like this?",
        body:
          "Getting an agent off the laptop is the easy half. Deciding who may talk to it, what it may touch, and what it must never do is the half that matters, and it is the half we would spend the call on.",
        button: "Book a 30-minute call",
      },
      backLabel: "All case studies",
    },
    pl: {
      metaTitle:
        "Agent kodujący na serwerze, do którego napiszesz z telefonu | aiAdaptiv",
      metaDescription:
        "Claude Code chodzący na małym VPS-ie zamiast na laptopie, dostępny przez komunikator, odpowiadający dokładnie jednej dopuszczonej osobie. Praca idzie dalej niezależnie od tego, czy laptop jest otwarty.",
      kindLabel: "Build referencyjny — nasz własny układ, jeden użytkownik",
      title: "Poprawka z jadącego pociągu",
      deck:
        "Praca zwykle czeka na laptopa. Problem widzisz na telefonie i nic się nie dzieje, dopóki nie wrócisz do biurka. Więc zdjęliśmy agenta z laptopa w całości: mieszka na małym serwerze, jest przytomny cały czas, a piszesz do niego jak do kolegi z zespołu.",
      facts: [
        { label: "Klient", value: "Brak — nasz własny układ" },
        { label: "Obszar", value: "Jak pracujemy na co dzień" },
        { label: "Działa na", value: "Claude Code na VPS-ie w Hetznerze" },
        { label: "Dostęp przez", value: "Komunikator, z dowolnego telefonu" },
      ],
      metrics: [
        {
          value: "1",
          label: "osoba, której bot odpowie",
          note: "lista dopuszczonych z jednym wpisem; nieznany nadawca nie dostaje nic",
        },
        {
          value: "0",
          label: "otwartych laptopów, gdy poprawka wychodziła",
          note: "praca poszła na serwerze, nie na maszynie w torbie",
        },
        {
          value: "24/7",
          label: "sesja jest przytomna",
          note: "nie zamyka się, gdy zamykasz klapę albo wsiadasz do pociągu",
        },
      ],
      sections: [
        {
          h: "Problem: praca czeka na laptopa",
          paragraphs: [
            "Coś zauważasz na telefonie — zepsutą stronę, wiadomość od klienta, poprawkę, którą już masz w głowie. I nic się nie dzieje, bo rzecz, która może to zrobić, to laptop w torbie, w domu albo trzy godziny stąd.",
            "Zanim siądziesz, ta zwłoka kosztuje zwykle więcej, niż poprawka była warta: kontekst wyblakł, dzień poszedł dalej, a mała robota zamieniła się w pozycję na liście.",
          ],
        },
        {
          h: "Co zbudowaliśmy",
          paragraphs: [
            "Claude Code chodzi na małym serwerze, nie na laptopie. Repozytoria są tam już wyklonowane, więc prośba trafia od razu tam, gdzie da się ją wykonać. Interfejsem jest komunikator: wysyłasz zdanie, on pracuje, odpowiada.",
            "Nie ma w tym nic egzotycznego i o to właśnie chodzi. Żadnej nowej aplikacji do zainstalowania, żadnego dashboardu, żadnego klienta VPN do odpalania na telefonie. Wystarczy to, co i tak nosisz, a serwerowi jest wszystko jedno, czy Twój laptop jest włączony.",
          ],
        },
        {
          h: "Bezpieczeństwo to lista jednej osoby",
          paragraphs: [
            "Agent z dostępem do powłoki, osiągalny z internetu, jest ryzykiem, dopóki nie postawisz sprawy jasno: kto może do niego mówić. Odpowiedź jest tu najprostsza z możliwych — wymagane jest sparowanie, lista dopuszczonych ma dokładnie jeden wpis, żadna grupa nie jest zatwierdzona, nic nie wisi w poczekalni. Ktokolwiek inny znajdzie tego bota, nie dostanie nic.",
            "To celowy sufit, a nie ograniczenie, które po cichu zdejmiemy. Otwarcie tego na zespół to inny system z inną historią bezpieczeństwa i tak trzeba go zbudować, a nie przez dopisywanie nazwisk do listy.",
          ],
        },
        {
          h: "Wyjazd, który to opłacił",
          paragraphs: [
            "Momentem, w którym to się obroniło, była poprawka wysłana z pociągu. Prośba wystukana na telefonie, praca wykonana na serwerze, zmiana poszła dalej. Żaden laptop nie został otwarty, a rzecz, która normalnie czekałaby na biurko, po prostu nie czekała.",
            "Jedno popołudnie to nie jest badanie produktywności i nie będziemy go tak przedstawiać. Ale to jest coś, co albo się dzieje, albo nie — a zanim ten układ powstał, wydarzyć się nie mogło.",
          ],
        },
      ],
      pull:
        "Prośba wystukana na telefonie w pociągu. Praca wykonana na serwerze. Żaden laptop nie został otwarty.",
      proof: {
        label: "Co możemy pokazać",
        caption:
          "Celowo nie ma tu zrzutu ekranu: rozmowa z tym botem to żywa powłoka nad naszymi repozytoriami, więc opublikowanie jej oznaczałoby opublikowanie kodu klientów. Weryfikowalna jest polityka dostępu — wymagane sparowanie, jeden wpis na liście dopuszczonych, brak grup, pusta poczekalnia — i chętnie pokażemy ją na rozmowie.",
      },
      disclaimer: {
        h: "Czego ten case nie twierdzi",
        body:
          "Korzysta z tego jedna osoba i tą osobą jesteśmy my. Nie stoi za tym zespół ani klient, nie ma zobowiązania co do dostępności ani pomiaru zaoszczędzonego czasu — pociąg to jedno popołudnie opowiedziane uczciwie, nie statystyka. Politykę dostępu wyżej odczytaliśmy z działającej konfiguracji; reszta to nasza własna relacja z naszego własnego układu.",
      },
      cta: {
        h: "Chcesz, żeby Wasz zespół tak pracował?",
        body:
          "Zdjęcie agenta z laptopa to łatwiejsza połowa. Trudniejsza to decyzja, kto może do niego mówić, czego może dotknąć i czego nie wolno mu nigdy — i na tej połowie spędzilibyśmy tę rozmowę.",
        button: "Umów 30-minutową rozmowę",
      },
      backLabel: "Wszystkie case studies",
    },
  },
};
