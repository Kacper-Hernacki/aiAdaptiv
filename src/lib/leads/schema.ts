/**
 * The enquiry payload and its validation, shared by the client form and the
 * API route. The client uses it for inline errors as you type; the server
 * re-runs the same checks, because anything can POST to the endpoint.
 */

export type LeadPayload = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  website: string;
  role: string;
  size: string;
  budget: string;
  message: string;
  /** Locale the form was filled in, for the reply. */
  lang: string;
  /** Honeypot: a real person never fills this — it is visually hidden. */
  company2?: string;
  /** Ms between mount and submit. Bots post instantly. */
  elapsedMs?: number;
};

export type FieldName = keyof Omit<
  LeadPayload,
  "lang" | "company2" | "elapsedMs"
>;

/** Which fields each step owns, so "Continue" validates only what's on screen. */
export const STEP_FIELDS: FieldName[][] = [
  ["firstName", "lastName", "email"],
  ["company", "website", "role", "size"],
  ["budget", "message"],
];

export const TOTAL_STEPS = STEP_FIELDS.length;

const OPTIONAL: ReadonlySet<FieldName> = new Set(["lastName", "website"]);

// Deliberately permissive: the goal is to catch typos, not to police which
// addresses are valid — RFC 5322 in a regex rejects real mailboxes.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Consumer mailboxes. Not rejected — a solo founder is still a lead — but
 *  recorded so inbound can be triaged. */
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com",
  "yahoo.com", "yahoo.co.uk", "icloud.com", "me.com", "aol.com", "gmx.com",
  "gmx.de", "proton.me", "protonmail.com", "mail.com", "yandex.com",
  "wp.pl", "o2.pl", "onet.pl", "interia.pl", "op.pl",
]);

export function emailDomain(email: string): string {
  return email.trim().toLowerCase().split("@")[1] ?? "";
}

export function isFreeEmail(email: string): boolean {
  return FREE_EMAIL_DOMAINS.has(emailDomain(email));
}

export type ErrorKey = "required" | "email" | "url" | "message";

/**
 * Validates one field. Returns the dictionary key of the error, or null.
 * Keys — not sentences — so the caller renders them in the right language.
 */
export function validateField(
  name: FieldName,
  value: string,
): ErrorKey | null {
  const v = value.trim();

  if (!v) return OPTIONAL.has(name) ? null : "required";

  if (name === "email" && !EMAIL.test(v)) return "email";

  if (name === "website") {
    // Accept "acme.com" as readily as "https://acme.com".
    const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
    try {
      const url = new URL(withScheme);
      if (!url.hostname.includes(".")) return "url";
    } catch {
      return "url";
    }
  }

  if (name === "message" && v.length < 20) return "message";

  return null;
}

/** Validates a whole step. Returns a map of field → error key. */
export function validateStep(
  step: number,
  values: Pick<LeadPayload, FieldName>,
): Partial<Record<FieldName, ErrorKey>> {
  const errors: Partial<Record<FieldName, ErrorKey>> = {};
  for (const field of STEP_FIELDS[step] ?? []) {
    const error = validateField(field, values[field]);
    if (error) errors[field] = error;
  }
  return errors;
}

/** Validates every step at once — what the server runs. */
export function validateAll(values: Pick<LeadPayload, FieldName>) {
  return STEP_FIELDS.reduce<Partial<Record<FieldName, ErrorKey>>>(
    (acc, _, i) => ({ ...acc, ...validateStep(i, values) }),
    {},
  );
}

/** Normalises a website to a full URL, or "" when blank. */
export function normaliseWebsite(value: string): string {
  const v = value.trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}
