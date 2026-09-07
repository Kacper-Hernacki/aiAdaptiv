# 03 — Admin guide: users, governance, settings

Everything under **your-name (bottom-left) → Admin Panel**. Two halves: **Users** and **Settings**.

## Roles
| Role | Can |
|---|---|
| **Admin** | Everything — settings, all users, all models/KBs, view users' chats |
| **User** | Chat + whatever their group permissions allow |
| **Pending** | Signed up but not yet approved — no access until an admin promotes them |

New signups land as **Pending** by default (`DEFAULT_USER_ROLE=pending`).

## Adding / inviting people
Open WebUI has **no email-invite flow**. Options:

| Method | How | Best for |
|---|---|---|
| **Admin creates account** | Admin Panel → Users → **+ Add User** (set email/password/role) | Controlled, quick |
| **Open signup + approval** | Settings → General → enable signup → share URL → users self-register → approve them | Team self-service |
| **SSO / OAuth** | Google / Microsoft / OIDC; can lock to your email domain | Production "real org" |
| **LDAP / AD** | Enterprise directory | Larger orgs |

> **Reachability caveat:** if Open WebUI runs on `localhost`, only *your* machine can reach it, so
> coworkers can't sign up. To actually invite people, host the UI where they can reach it (Koyeb, or a
> tunnel) — see 01-setup "Alternative topologies".

## Groups & RBAC (the organization story)
Default **User** role starts locked down; you grant capabilities per **Group**.

- **Create a group:** Admin Panel → Users → Groups → **+**. Assign members.
- **Permissions per group** (Workspace / Sharing / Chat / Features / Settings):
  - *Workspace* — can they create/import Models, Knowledge, Prompts, Tools?
  - *Chat features* — file upload, web search, image gen, code interpreter, voice, sharing…
  - *Sharing* — can they publish models/prompts/chats to others?
- **Per-model & per-KB access** — on a Model or Knowledge base, set access to public or to specific
  groups/users. Example: "Legal" group sees the Deal Room KB; "Marketing" doesn't.

This is the pitch: **one shared private AI, centrally governed, least-privilege by default.**

## Settings tabs (what each governs)
| Tab | Governs |
|---|---|
| **General** | Signup, default role, admin email, session length (JWT, 4w), response **watermark** |
| **Connections** | Ollama & OpenAI-compatible endpoints — the **Koyeb URL lives here**; add more providers |
| **Models** | Enable/disable, reorder, default model, whitelist per group |
| **Evaluations** | Arena + feedback/rating leaderboard |
| **Documents** | RAG config — chunking (1000/100), embeddings, vector DB, reranker, content extractor |
| **Web Search** | Provider + API keys (off by default) |
| **Interface** | Default prompts, banners, titles, suggestions |
| **Audio** | Speech-to-text / text-to-speech engines & voices |
| **Images** | Image-generation backend (off by default) |
| **Database** | Export / import / backup |

## Integrations — status & what they need
| Integration | Status | Needs |
|---|---|---|
| Web search (live research) | off | Tavily/Brave/Google PSE key, **or** self-hosted SearXNG (no key) |
| Image generation | off | A backend (ComfyUI / DALL·E / Gemini) |
| Direct connections (other LLM APIs) | off | An OpenAI-compatible endpoint + key |
| External tool servers | off | An OpenAPI/REST endpoint |
| Google Drive / OneDrive | off | OAuth credentials |
| API keys (use WebUI as an API) | off | Toggle on in General |
| User webhooks | off | Toggle on + a URL |

## Governance & compliance features
- **Admin chat access** (on) — admins can view users' chats. Powerful for oversight; treat as a
  deliberate *policy* choice and disclose it to users.
- **Analytics** (on) — usage + feedback dashboard.
- **Export** (on) — full data portability (Database tab).
- **Response watermark** — stamp AI outputs for traceability (empty now; set in General).
- **Pending-user overlay** — custom message shown to users awaiting approval.

## Documents / RAG tuning (Settings → Documents)
- **Chunk size / overlap** — 1000 / 100. Larger chunks = more context per hit, fewer hits.
- **Top-k** — 3 retrieved chunks per query. Raise for broader recall.
- **Embeddings** — local MiniLM (CPU, private). Switch to Ollama (GPU) or OpenAI here.
- **Reranker** — none. Adding one + **hybrid search** (BM25+vector) sharpens precision on big KBs.
- **Content extraction** — default. For scanned/complex PDFs, plug in Docling / Datalab Marker /
  Azure Document Intelligence.

See **[04-feature-reference.md](04-feature-reference.md)** for the full local-RAG pipeline and feature matrix.
