# Analytics (GA4 + Vercel)

Conversion and page-view tracking for the marketing site. Copy, prices, and
layout are unchanged — this is instrumentation only.

## Environment

Set the GA4 Measurement ID on the Vercel project for **Production and Preview**:

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Create the property at [analytics.google.com](https://analytics.google.com):
Admin → Data collection and modify → Data streams → Web → copy the
Measurement ID (`G-…`).

- Empty / unset: GA4 is not loaded. Vercel Analytics still runs.
- The value is public by necessity (`gtag.js` runs in the browser).
- Locally: add it to `.env.local` (see `.env.example`).

`NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_BOOKING_URL` are documented in
`.env.example`. Booking-link clicks are classified from `cal.com` or the
configured booking URL.

## Consent Mode v2

1. A `beforeInteractive` snippet defines `gtag()` (official `arguments` push)
   and sets Consent Mode v2 defaults to **denied**, unless
   `localStorage['aiadaptiv-cookie-consent']` is already `granted`.
2. The cookie banner is the only grant path. Accept → `consent update` to
   **granted**, then `gtag.js` is injected.
3. Decline / revoke → consent stays denied and the GA script + `_ga` cookies
   are removed.

Vercel Web Analytics (`<Analytics />`) is cookieless and is not gated.

## Page views

After consent, `AnalyticsClient` sends a GA4 `page_view` for the current path
and again on every App Router navigation (including `/en` → `/pl` locale
pages). `gtag('config')` uses `send_page_view: false` so the first hit is not
double-counted by gtag itself.

In the GA4 property, either:

- leave Enhanced measurement’s **Page changes based on browser history
  events** on and expect possible duplicates, or
- turn that checkbox **off** (Admin → Data streams → your web stream →
  Enhanced measurement) so only these explicit `page_view` events count.

Vercel Analytics already records page views on its own.

## Events

Every custom event is sent to Vercel Analytics `track()`. The same event is
also sent to GA4 `gtag('event', …)` only when consent is granted and gtag is
defined.

| Event | Params | When it fires |
| --- | --- | --- |
| `cta_click` | `cta_id`, `location`, `lang` | Meaningful CTA clicks (see below) |
| `generate_lead` | `source` (`lead_form` \| `booking`), `lang`, `location?` | Successful enquiry-form submit, or a booking (Cal.com) CTA click |
| `language_switch` | `from`, `to`, `lang` | Client navigation that changes the locale prefix |

### `cta_id` values

| `cta_id` | Destinations |
| --- | --- |
| `book_call` | Hero, header, header mobile, proof, contact, footer, lead-form success, case-study CTA, private-AI page, AI-audit page CTAs |
| `ai_audit` | Homepage AI audit card, header/footer `/ai-audit` links |
| `second_brain_pro` | Homepage Second Brain Pro button, footer product link |
| `private_ai` | Homepage private-AI card (image + button), footer link |
| `case_study` | Case-study index rows, header/footer case-study links |
| `email` | Footer `mailto:` |

`location` is the explicit surface when set (`hero`, `header`, `contact`, …)
or the nearest `section[id]` / `header` / `footer`.

A booking CTA also emits `generate_lead` with `source: "booking"` so it can
be marked as a key event independently of the click.

## Mark `generate_lead` as a GA4 key event

1. Open the GA4 property → **Admin** → **Data display** → **Events**.
2. Wait until `generate_lead` appears (or create it: Create event →
   `generate_lead`).
3. Toggle **Mark as key event**.
4. Optional: **Admin** → **Data display** → **Key events** to confirm, and
   add a conversion value later if you want revenue reporting.

Realtime / DebugView: add `?debug` via the GA Debugger extension, or set
`debug_mode` on the stream while testing a Preview deployment.

## Code

- `src/lib/consent.ts` — storage key, Consent Mode default snippet
- `src/lib/track.ts` — `track()`, gtag load/consent, CTA classification
- `src/components/analytics/AnalyticsClient.tsx` — page views + click listener
- `src/components/CookieConsent.tsx` — banner; loads GA4 + Leadsy on accept
