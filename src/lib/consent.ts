/**
 * Cookie-consent storage shared by the Consent Mode v2 default script, the
 * banner, and the analytics helpers. Keep the key stable — changing it would
 * re-prompt every returning visitor.
 */

export const CONSENT_STORAGE_KEY = "aiadaptiv-cookie-consent";

export type ConsentChoice = "granted" | "denied";

type Listener = (choice: ConsentChoice) => void;

const listeners = new Set<Listener>();

/**
 * Inline snippet for `next/script` `beforeInteractive`. Defines `gtag` with
 * the official `arguments` push (gtag.js ignores plain arrays) and sets
 * Consent Mode v2 defaults: denied, unless this browser already accepted.
 */
export const consentDefaultInlineScript = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}var c='denied';try{if(localStorage.getItem('${CONSENT_STORAGE_KEY}')==='granted')c='granted';}catch(e){}gtag('consent','default',{ad_storage:c,analytics_storage:c,ad_user_data:c,ad_personalization:c,wait_for_update:500});`;

export function readConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored === "granted" || stored === "denied") return stored;
  } catch {
    // private mode / blocked storage
  }
  return null;
}

export function writeConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Ignore write failures — the in-memory choice still applies this session.
  }
}

export function hasAnalyticsConsent(): boolean {
  return readConsent() === "granted";
}

/** Subscribe to a visitor's Accept / Decline. Used to load GA mid-visit. */
export function onConsentChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyConsent(choice: ConsentChoice): void {
  for (const listener of listeners) listener(choice);
}
