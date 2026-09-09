import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import {
  validateAll,
  normaliseWebsite,
  isFreeEmail,
  emailDomain,
  type FieldName,
} from "@/lib/leads/schema";
import { storeLead, storeConfigured } from "@/lib/leads/store";
import {
  sendNotification,
  sendConfirmation,
  notifyConfigured,
} from "@/lib/leads/notify";
import { pushToInstantly, instantlyConfigured } from "@/lib/leads/instantly";
import type { LeadRecord } from "@/lib/leads/types";

/** Never prerendered, never cached — it only ever handles POSTs. */
export const dynamic = "force-dynamic";

/** A human takes longer than this to fill three steps. */
const MIN_ELAPSED_MS = 3_000;
const MAX_FIELD = 5_000;

const str = (value: unknown): string =>
  typeof value === "string" ? value.slice(0, MAX_FIELD).trim() : "";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }

  // Bots: an off-screen field nobody can see, and an implausibly fast fill.
  // Both answer 200 so a scraper learns nothing from the response.
  const elapsed = Number(body.elapsedMs);
  if (
    str(body.company2) ||
    (Number.isFinite(elapsed) && elapsed < MIN_ELAPSED_MS)
  ) {
    return NextResponse.json({ ok: true });
  }

  const values = {
    firstName: str(body.firstName),
    lastName: str(body.lastName),
    email: str(body.email),
    company: str(body.company),
    website: str(body.website),
    role: str(body.role),
    size: str(body.size),
    budget: str(body.budget),
    message: str(body.message),
  } satisfies Record<FieldName, string>;

  // The client validated already; anything can POST here, so validate again.
  const errors = validateAll(values);
  if (Object.keys(errors).length) {
    return NextResponse.json(
      { error: "invalid", fields: errors },
      { status: 422 },
    );
  }

  const lead: LeadRecord = {
    ...values,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    website: normaliseWebsite(values.website),
    emailDomain: emailDomain(values.email),
    freeEmail: isFreeEmail(values.email),
    lang: str(body.lang) || "en",
    source: "website-form",
    userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? "",
    country: request.headers.get("x-vercel-ip-country") ?? "",
  };

  // The row is the lead. Store it first, and fail loudly if that fails, so a
  // visitor who sees "sent" can trust that it was.
  let stored = false;
  if (storeConfigured) {
    try {
      await storeLead(lead);
      stored = true;
    } catch (error) {
      console.error("[lead] store failed", lead.id, error);
      // Not fatal on its own — email may still carry it.
    }
  }

  // Everything else is best-effort and runs in parallel: none of it should
  // decide whether the visitor sees a success screen.
  const tasks: Promise<unknown>[] = [];
  if (notifyConfigured) {
    tasks.push(sendNotification(lead), sendConfirmation(lead));
  }
  if (instantlyConfigured) tasks.push(pushToInstantly(lead));

  const results = await Promise.allSettled(tasks);
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[lead] delivery failed", lead.id, result.reason);
    }
  }
  const delivered = results.some((result) => result.status === "fulfilled");

  // The visitor is only told "sent" if something actually took the lead. A
  // dead database and a revoked API key together must not read as success —
  // the error screen offers a mailto they can fall back to.
  if (!stored && !delivered) {
    console.error("[lead] nothing accepted the lead; dropped", lead.id, lead.email);
    return NextResponse.json({ error: "delivery-failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: lead.id, stored, delivered });
}
