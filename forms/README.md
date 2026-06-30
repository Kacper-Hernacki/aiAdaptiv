# Eligibility form

Source of truth: [`eligibility-form.json`](./eligibility-form.json) — the full form
(questions, options, contact fields, scoring logic, ending screens, Calendly
prefill). Pick one of the build paths below.

> Reality check: no builder imports a *file* that includes the multi-question
> Strong/Medium/Low logic. The questions import/build fast; the branching is set
> by hand (a few clicks). The Tally-AI path below gets closest to one-shot.

---

## Path A — Tally "Create form with AI" (fastest, free, recommended)

1. In Tally: **+ Create form → Create with AI**.
2. Paste the prompt below. Tally builds the pages, questions, and a first pass at
   the logic. Then reconcile the logic against `eligibility-form.json` → `logic`.

```
Build a multi-step lead-qualification form titled "Founding Design Partner
Qualification" with a progress bar.

Intro: "We only accept 6 Founding Design Partners this quarter. This quick
60-second form helps us see if we're a great fit — before we invest engineering
time in your setup."

Q1 (multiple choice, required) "What is the main type of sensitive work your team
does?": Legal contracts & document review; Financial reports & analysis; Client
due diligence & research; Internal knowledge base & strategy docs; Other (with a
text box).

Q2 (multiple choice, required) "How many people in your firm would actively use
the private AI?": 1–5; 6–15; 16–30; 31–50.

Q3 (multiple choice, required) "Have you or your team hesitated to use public AI
tools (ChatGPT, Claude, etc.) with client or sensitive data?": Yes, frequently;
Yes, occasionally; No, but we're getting concerned; No.

Q4 (long text, required) "What is your biggest current bottleneck that AI could
help solve?" placeholder: reviewing 100+ page contracts, summarizing due
diligence files.

Then a contact section "Almost done — where do we send your fit assessment?" with
required fields: Full Name (short text), Business Email (email), Company Name
(short text), Job Title (short text).

Three ending screens chosen by logic:
- "Excellent Match" when Q1 is Legal/Financial/Due diligence AND Q3 is any "Yes"
  or "getting concerned" AND Q2 is 6–15/16–30/31–50. Text: "You look like a
  strong Founding Design Partner. Let's get you set up before the 6 slots fill."
  Button "Book a 15-min Qualification Call".
- "Waitlist" when Q3 is "No", OR when Q1 is Internal knowledge base AND Q2 is 1–5.
  Text: "We're currently focusing on firms with regular sensitive-document
  workflows. We'll keep your details and reach out if that changes." No button.
- "Potential Fit" for everyone else. Text: "We'd like to learn more about your
  workflows before we deploy. Grab a slot and let's talk." Button "Book a 15-min
  Qualification Call".
```

3. Set the call buttons to your Calendly link, with prefill:
   `https://calendly.com/d/dzz5-bt2-xyk?name=@full_name&email=@email`
   (use Tally's `@` variable picker to insert the name/email answers).
4. Turn on email notifications to `hello@aiadaptiv.ai`.

---

## Path B — manual build from the JSON

Open `eligibility-form.json` and add each block in order. The `logic.rules`
array is already written as ordered, first-match-wins jump rules — copy them into
Tally's **Logic → Jump to page** with the same order and AND/OR (`match: all` =
all conditions, `match: any` = any).

---

## Last step — wire the landing CTAs

Once the form is published, send the public URL (e.g. `https://tally.so/r/xxxxx`).
Today the hero + qualifier "Run 60-Second Eligibility Check →" buttons and the
header "Apply →" all open Calendly. They'll be repointed to the form so the funnel
is: **landing → eligibility form → (qualified) → Calendly**. Link-out or popup
embed — your call.
