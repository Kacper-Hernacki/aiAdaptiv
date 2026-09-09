import { Resend } from "resend";
import { siteConfig, bookingUrl, siteUrl } from "@/config/site";
import type { LeadRecord } from "./types";

/**
 * The two emails an enquiry produces: one to us with everything needed to
 * reply, and one to the sender confirming it landed.
 */

const apiKey = process.env.RESEND_API_KEY;
/** Must be a domain verified in Resend. */
const from = process.env.LEAD_FROM_EMAIL ?? "aiAdaptiv <hello@aiadaptiv.com>";
const to = process.env.LEAD_NOTIFY_EMAIL ?? siteConfig.contactEmail;

export const notifyConfigured = Boolean(apiKey);

const resend = apiKey ? new Resend(apiKey) : null;

const escape = (value: string) =>
  value.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]!);

/** A label an option key maps to, for the notification we read ourselves. */
const LABELS: Record<string, string> = {
  founder: "Founder / CEO",
  tech: "CTO / Head of engineering",
  ops: "Operations / COO",
  marketing: "Marketing",
  product: "Product",
  other: "Something else",
  "5-15k": "€5k – €15k",
  "15-50k": "€15k – €50k",
  "50k+": "€50k+",
  unsure: "Not sure yet",
};

const label = (key: string) => LABELS[key] ?? key;

function row(name: string, value: string) {
  if (!value) return "";
  return `<tr>
    <td style="padding:6px 16px 6px 0;color:#666;white-space:nowrap;vertical-align:top">${name}</td>
    <td style="padding:6px 0;color:#111">${value}</td>
  </tr>`;
}

/** Sent to us. Subject carries the triage signal so the inbox list is enough. */
export async function sendNotification(lead: LeadRecord) {
  if (!resend) throw new Error("RESEND_API_KEY is not set");

  const name = [lead.firstName, lead.lastName].filter(Boolean).join(" ");
  const site = lead.website
    ? `<a href="${escape(lead.website)}">${escape(lead.website)}</a>`
    : "";

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px">
      <p style="font-size:13px;color:#666;margin:0 0 4px">New enquiry · aiadaptiv.com</p>
      <h1 style="font-size:20px;margin:0 0 20px;color:#111">
        ${escape(name)} — ${escape(lead.company)}
      </h1>
      <table style="border-collapse:collapse;font-size:14px;margin-bottom:24px">
        ${row("Email", `<a href="mailto:${escape(lead.email)}">${escape(lead.email)}</a>${lead.freeEmail ? ' <span style="color:#999">(personal address)</span>' : ""}`)}
        ${row("Company", escape(lead.company))}
        ${row("Website", site)}
        ${row("Role", escape(label(lead.role)))}
        ${row("Size", escape(lead.size))}
        ${row("Budget", escape(label(lead.budget)))}
        ${row("Language", escape(lead.lang))}
        ${row("Country", escape(lead.country))}
      </table>
      <p style="font-size:13px;color:#666;margin:0 0 6px">What they wrote</p>
      <div style="white-space:pre-wrap;font-size:15px;line-height:1.55;color:#111;padding:16px;background:#f6f6f7;border-radius:8px">${escape(lead.message)}</div>
      <p style="font-size:12px;color:#999;margin-top:24px">Ref ${lead.id} · ${lead.createdAt}</p>
    </div>`;

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: lead.email,
    subject: `${name} · ${lead.company} · ${label(lead.budget)}`,
    html,
  });
  // The SDK resolves with an { error } object rather than throwing, so an
  // unverified sender or a revoked key would otherwise read as a success.
  if (error) throw new Error(`Resend: ${error.name} — ${error.message}`);
}

/** Sent to them: confirms it arrived and offers the call for the impatient. */
export async function sendConfirmation(lead: LeadRecord) {
  if (!resend) throw new Error("RESEND_API_KEY is not set");

  const pl = lead.lang === "pl";

  const subject = pl
    ? "Mamy Twoją wiadomość — aiAdaptiv"
    : "We've got your message — aiAdaptiv";

  const body = pl
    ? {
        greeting: `Cześć ${escape(lead.firstName)},`,
        lead: "Dzięki — Twoja wiadomość trafiła prosto do mojej skrzynki. Przeczytam ją osobiście i odpiszę w ciągu jednego dnia roboczego.",
        cta: "Nie chcesz czekać? Umów 30-minutową rozmowę:",
        button: "Umów rozmowę",
        copyLabel: "Dla przypomnienia, oto co wysłałeś:",
        sign: "Kacper Hernacki · Założyciel i CTO, aiAdaptiv",
      }
    : {
        greeting: `Hi ${escape(lead.firstName)},`,
        lead: "Thanks — your message came straight to my inbox. I read these myself and will reply within one working day.",
        cta: "Rather not wait? Book the 30-minute mapping call:",
        button: "Book the call",
        copyLabel: "For your records, here's what you sent:",
        sign: "Kacper Hernacki · Founder & CTO, aiAdaptiv",
      };

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;font-size:15px;line-height:1.6;color:#111">
      <p>${body.greeting}</p>
      <p>${body.lead}</p>
      <p style="margin-top:24px">${body.cta}</p>
      <p><a href="${bookingUrl}" style="display:inline-block;padding:12px 22px;background:#111;color:#fff;border-radius:999px;text-decoration:none;font-weight:500">${body.button}</a></p>
      <p style="margin-top:32px;font-size:13px;color:#666">${body.copyLabel}</p>
      <div style="white-space:pre-wrap;font-size:14px;padding:14px;background:#f6f6f7;border-radius:8px;color:#333">${escape(lead.message)}</div>
      <p style="margin-top:32px;font-size:13px;color:#666">
        ${body.sign}<br>
        <a href="${siteUrl}" style="color:#666">aiadaptiv.com</a>
      </p>
    </div>`;

  const { error } = await resend.emails.send({
    from,
    to: lead.email,
    replyTo: siteConfig.contactEmail,
    subject,
    html,
  });
  if (error) throw new Error(`Resend: ${error.name} — ${error.message}`);
}
