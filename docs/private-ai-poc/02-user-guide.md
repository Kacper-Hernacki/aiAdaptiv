# 02 — User guide: how to use it

For everyday users. Assumes you can log in at http://localhost:3000.

## Chatting basics
- **Pick a model** in the top-left dropdown. `qwen2.5:7b` is the raw model; the **⚖️/📝/✉️ assistants**
  are pre-configured for specific jobs (see below).
- **New Chat** (top-left) starts fresh. Do this after an admin changes a model — open chats keep the
  old config until you start a new one.
- **Chat controls** (top-right sliders) — set temperature, system prompt, and parameters per chat.
- **On any message:** regenerate, edit (branches the conversation), copy, rate 👍/👎.
- **Temporary chat** — a mode that isn't saved; use for sensitive one-offs.
- **Organize** — drag chats into **Folders**, add **tags**, search, archive, pin, clone.

## Assistants (custom Models)
Pre-built personas = base model + system prompt + optional knowledge/tools. This deployment has:

| Assistant | Use it for |
|---|---|
| **⚖️ Deal Room Analyst** | Q&A grounded in the confidential deal documents, with citations. Refuses to invent facts. |
| **📝 Contract Reviewer** | Paste a clause → risk table (Clause \| Issue \| Severity \| Fix). |
| **✉️ Client Comms Drafter** | Draft professional client emails/letters. |

**Make your own:** Workspace → Models → **+ Add Model** → choose a base model, write a system prompt,
optionally attach a Knowledge base and Tools, save. It then appears in the model dropdown.

## Knowledge & documents (RAG)
Ask questions grounded in your own documents. The model answers **only** from them and cites sources.

- **Use an existing KB in a chat:** type **`#`** → pick a collection (e.g. *Project Meridian — Deal Room*)
  → ask. Answers come back with clickable **[1]** citations.
- **One-off file:** click the **+** in the message box to attach a file to just that chat.
- **Create a KB:** Workspace → Knowledge → **+** → name it → upload files. Give it a minute to embed.
- **Bake a KB into an assistant:** edit a Model → attach the Knowledge collection → save. Now that
  assistant always answers from it (no `#` needed).

> **Gotcha:** when attaching a KB to a Model, it must be stored as a *collection*. If an assistant
> says "I'll search the knowledge base…" and can't find anything, the attachment is malformed —
> re-attach the collection, and start a **New Chat**.

## Prompts (slash commands)
Reusable prompt templates. In the message box type **`/`** and pick one:

| Command | Does |
|---|---|
| `/risks` | Rank the top risks in pasted text |
| `/summary` | 5-bullet executive summary |
| `/redline` | Suggest contract redlines (before/after) |
| `/plain` | Rewrite legal text in plain language |

`{{CLIPBOARD}}` in a prompt pulls in your clipboard. Make your own in Workspace → Prompts.

## Tools (function calling)
Let the model run code to get exact answers. This deployment has **Deadline Tools** (`days_until`).
Enable a tool for a chat via the **+ / tools** control, then ask e.g. *"how many days until 2026-08-15?"* —
the model calls the tool and returns the computed result.
> Small models (7B) call tools less reliably; **native function-calling** mode and larger models (32B) help.

## Functions (advanced extensions)
Python plugins. Three kinds: **Pipe** (a new model), **Filter** (transforms every message in/out),
**Action** (a button under a message). This deployment has:
- **Confidentiality Check** (Action) — click the button under a message and it flags emails, IBANs,
  and monetary amounts it finds. Pure logic, no model call.

## Notes (AI-assisted)
A notepad where the AI helps. Open a note (e.g. *Project Meridian — Kickoff Call Notes*), select text,
and use the AI action to summarize/enhance/restructure — all on your private GPU. Notes can also be
pulled into chat as context.

## Getting good answers
- The model here is **Qwen 7B** — excellent at language tasks (summarize, extract, rewrite, draft,
  answer-from-docs) and at **refusing to hallucinate** when using Knowledge. Weaker at math, trivia,
  and current events — don't demo those.
- For grounded work, always go through an assistant with a KB or use `#` — that's where the value is.
- Want sharper answers / more reliable tools? Ask an admin to switch to **Qwen 32B** (fits the same GPU).
