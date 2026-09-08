import type { LeadRecord } from "./types";

/**
 * Mirrors the enquiry into Instantly, so inbound and outbound sit in one place.
 *
 * Off unless both env vars are set — there is no sensible default destination,
 * and silently dropping people into a sending campaign would email them.
 * INSTANTLY_LIST_ID should be a *list*, not an active campaign, so an inbound
 * lead is never enrolled in a cold sequence.
 */

const apiKey = process.env.INSTANTLY_API_KEY;
const listId = process.env.INSTANTLY_LIST_ID;

export const instantlyConfigured = Boolean(apiKey && listId);

export async function pushToInstantly(lead: LeadRecord): Promise<void> {
  if (!apiKey || !listId) throw new Error("Instantly is not configured");

  const response = await fetch("https://api.instantly.ai/api/v2/leads", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      list_id: listId,
      email: lead.email,
      first_name: lead.firstName,
      last_name: lead.lastName,
      company_name: lead.company,
      website: lead.website,
      custom_variables: {
        source: "website-form",
        role: lead.role,
        company_size: lead.size,
        budget: lead.budget,
        message: lead.message,
        lang: lead.lang,
        submitted_at: lead.createdAt,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Instantly responded ${response.status}: ${await response.text()}`,
    );
  }
}
