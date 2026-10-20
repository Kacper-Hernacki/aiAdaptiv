import { currentLang, track } from "@/lib/track";

export const CRISP_SCRIPT_SRC = "https://client.crisp.chat/l.js";
export const CRISP_SCRIPT_SELECTOR = 'script[src*="client.crisp.chat/l.js"]';
export const CRISP_ROOT_ATTR = "data-crisp";

type CrispCommand = unknown[];

type CrispQueue = CrispCommand[] & {
  push: (command: CrispCommand) => number;
};

type CrispWindow = Window & {
  $crisp?: CrispQueue;
  CRISP_WEBSITE_ID?: string;
  CRISP_RUNTIME_CONFIG?: { locale?: string };
};

let chatOpenedBound = false;

function crispWindow(): CrispWindow | null {
  if (typeof window === "undefined") return null;
  return window as CrispWindow;
}

function queue(): CrispQueue | null {
  const w = crispWindow();
  if (!w) return null;
  if (w.$crisp && typeof w.$crisp.push === "function") return w.$crisp;
  const next: CrispQueue = [] as unknown as CrispQueue;
  w.$crisp = next;
  return next;
}

function push(command: CrispCommand): void {
  queue()?.push(command);
}

function readColorMode(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

function markRoot(on: boolean): void {
  if (typeof document === "undefined") return;
  if (on) document.documentElement.setAttribute(CRISP_ROOT_ATTR, "");
  else document.documentElement.removeAttribute(CRISP_ROOT_ATTR);
}

function bindChatOpened(): void {
  if (chatOpenedBound) return;
  chatOpenedBound = true;
  push([
    "on",
    "chat:opened",
    () => {
      track("cta_click", {
        cta_id: "chat",
        location: "crisp",
        lang: currentLang(),
      });
    },
  ]);
}

/** Apply locale + monochrome colors. Safe to call before l.js has finished. */
export function applyCrispAppearance(locale: string): void {
  push(["safe", true]);
  push(["config", "color:theme", ["black"]]);
  push(["config", "color:mode", [readColorMode()]]);
  push(["config", "locale", [locale]]);
  // Below the cookie bar (z-index 60) so the banner stays clickable if both
  // were ever on screen; still above ordinary page content.
  push(["config", "container:index", [50]]);
}

/**
 * Inject Crisp once. No-ops without a website id (never hardcodes one).
 * `CRISP_RUNTIME_CONFIG.locale` must be set before the script tag.
 */
export function loadCrisp(websiteId: string, locale: string): void {
  const w = crispWindow();
  if (!w || !websiteId) return;

  w.CRISP_RUNTIME_CONFIG = { locale };
  w.$crisp = w.$crisp || ([] as unknown as CrispQueue);
  w.CRISP_WEBSITE_ID = websiteId;

  applyCrispAppearance(locale);
  bindChatOpened();
  markRoot(true);

  if (document.querySelector(CRISP_SCRIPT_SELECTOR)) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = CRISP_SCRIPT_SRC;
  document.head.appendChild(script);
}

export function setCrispLocale(locale: string): void {
  const w = crispWindow();
  if (!w) return;
  w.CRISP_RUNTIME_CONFIG = { locale };
  push(["config", "locale", [locale]]);
}

/** Tear down the widget after decline / revoke. */
export function removeCrisp(): void {
  const w = crispWindow();
  if (!w || typeof document === "undefined") return;

  if (w.$crisp) {
    try {
      w.$crisp.push(["do", "chat:hide"]);
    } catch {
      // Widget may already be gone.
    }
  }

  document.querySelectorAll(CRISP_SCRIPT_SELECTOR).forEach((node) => {
    node.remove();
  });
  document.querySelectorAll("div.crisp-client, #crisp-chatbox").forEach((node) => {
    node.remove();
  });

  document.cookie.split(";").forEach((entry) => {
    const name = entry.split("=")[0]?.trim();
    if (!name) return;
    if (!name.startsWith("crisp") && name !== "crisp-client") return;
    const expires = "expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    document.cookie = `${name}=; ${expires}; domain=${window.location.hostname}`;
    document.cookie = `${name}=; ${expires};`;
  });

  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.toLowerCase().includes("crisp")) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // private mode / blocked storage
  }

  chatOpenedBound = false;
  markRoot(false);
  delete w.$crisp;
  delete w.CRISP_WEBSITE_ID;
  delete w.CRISP_RUNTIME_CONFIG;
}
