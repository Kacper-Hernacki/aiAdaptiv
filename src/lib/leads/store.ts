import { createClient } from "@libsql/client";
import type { LeadRecord } from "./types";

/**
 * Durable record of every enquiry, in the Turso database. This runs first and
 * is the only step whose failure the visitor is told about: email, the
 * confirmation and the Instantly push can all be retried from a stored row,
 * but a lost row is a lost lead.
 */

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

export const storeConfigured = Boolean(url);

const client = url ? createClient({ url, authToken }) : null;

/** Created on first write so there is no migration step to remember. */
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS leads (
    id           TEXT PRIMARY KEY,
    created_at   TEXT NOT NULL,
    first_name   TEXT NOT NULL,
    last_name    TEXT,
    email        TEXT NOT NULL,
    email_domain TEXT,
    free_email   INTEGER NOT NULL DEFAULT 0,
    company      TEXT NOT NULL,
    website      TEXT,
    role         TEXT,
    company_size TEXT,
    budget       TEXT,
    message      TEXT NOT NULL,
    lang         TEXT,
    source       TEXT,
    user_agent   TEXT,
    country      TEXT
  )
`;

let ready: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!client) return Promise.resolve();
  ready ??= client.execute(SCHEMA).then(() => undefined);
  return ready;
}

export async function storeLead(lead: LeadRecord): Promise<void> {
  if (!client) throw new Error("TURSO_DATABASE_URL is not set");
  await ensureSchema();
  await client.execute({
    sql: `INSERT INTO leads (
            id, created_at, first_name, last_name, email, email_domain,
            free_email, company, website, role, company_size, budget,
            message, lang, source, user_agent, country
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [
      lead.id,
      lead.createdAt,
      lead.firstName,
      lead.lastName,
      lead.email,
      lead.emailDomain,
      lead.freeEmail ? 1 : 0,
      lead.company,
      lead.website,
      lead.role,
      lead.size,
      lead.budget,
      lead.message,
      lead.lang,
      lead.source,
      lead.userAgent,
      lead.country,
    ],
  });
}
