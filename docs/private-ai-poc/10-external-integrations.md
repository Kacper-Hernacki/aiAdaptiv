# 10 — External LLMs, tools & web search (hybrid architecture)

Open WebUI isn't limited to your private model. It can also connect **external LLMs** (Claude, GPT…),
**external tools**, and **web search**. This unlocks capability — but each one **sends data outside**
the private boundary, so it must be a governed, explicit choice.

> **Governing principle:** private-by-default, external opt-in. Confidential/matter data stays on the
> private model; external models/tools/search are for non-sensitive tasks, clearly labelled and
> access-controlled. Anything that leaves the boundary must be a deliberate decision, not a default.

---

## 1. External LLMs (Claude, GPT…) — "half private, half external"

Open WebUI supports **Connections**: any OpenAI-compatible API endpoint. Configured models appear in
the **same dropdown** next to your private Qwen — users pick per chat.

### Getting Claude in
Anthropic's API isn't OpenAI-shaped by default. Two clean paths:
- **Anthropic's OpenAI-compatible endpoint** — add it directly as a Connection with your Anthropic key.
- **A gateway** (recommended for more than one provider): **LiteLLM** (self-hostable — keeps keys in
  your infra) or **Vercel AI Gateway** exposes Claude + GPT + Gemini behind one OpenAI-compatible URL,
  with observability, fallbacks, and cost tracking. Add the gateway as a single Connection → all
  external models show up.

### The architecture (hybrid)
```
User → Open WebUI
        ├── Qwen (private GPU)         ← confidential / matter data   [stays inside]
        └── Claude / GPT (via API)     ← general / non-sensitive only [leaves boundary]
```

### ⚠️ The governance catch (critical for the privacy pitch)
**Anything sent to an external model leaves your infrastructure** — that breaks the GDPR/confidentiality
guarantee for that data. So a hybrid deployment must:
- **Default to the private model**; make external models an explicit, labelled choice.
- **Restrict external models by RBAC** — e.g. only certain groups, or disabled for the "confidential" workspace.
- **Consider a Filter function** that blocks or redacts before an external call (guardrail).
- **Be transparent in the DPA** about which tasks may use an external provider and what data that entails.

**When hybrid makes sense:** Qwen 7B handles grounded doc Q&A + drafting privately; route the occasional
"draft a generic non-sensitive summary" or heavy reasoning task to Claude — knowingly, on non-sensitive
content. Sell it as *"private by default, best-in-class on tap for the safe stuff."*

---

## 2. External tools

Beyond in-workspace Python **Tools**, Open WebUI connects **external tool servers**:
- **OpenAPI tool servers** — point Open WebUI at any REST API's OpenAPI spec; its endpoints become
  callable tools (e.g. a document-management system, a CRM, a legal database, an internal API).
- **MCP servers** — connect Model Context Protocol servers via an MCP→OpenAPI proxy (`mcpo`).
- **Direct tool servers** — currently off (`enable_direct_connections=false`); toggle in admin.

Same caution: a tool call may **send data to the external system**. Govern which tools which groups can
use; prefer tools that hit **internal/EU systems** for sensitive workflows.

---

## 3. Built-in web search

Open WebUI has **native web search** (currently **off** — `enable_web_search=false`). When on, the user
toggles it per message: Open WebUI queries a provider, fetches the top results, injects them as context,
and the model answers **with citations**.

### Providers
| Provider | Key needed | Privacy note |
|---|---|---|
| **SearXNG** (self-hosted) | none | **Most private** — run it as a container; you control it. Recommended for this product. |
| DuckDuckGo | none | Simple, no key. |
| Brave / Tavily / Serper / Google PSE / Bing | API key 🔑 | Managed, higher quality; query goes to that provider. |

### ⚠️ Inherent caveat
Web search **always** involves leaving your network — the query goes to a search engine and pages are
fetched from the internet. That's unavoidable for *any* web search. SearXNG minimises third-party
exposure (you host the aggregator), but the underlying queries still reach the web. So: offer web
search as a **labelled, per-message opt-in**, and keep it off for confidential-only workspaces.

**Setup sketch (SearXNG):** run a SearXNG container (same Koyeb app or alongside), then Admin →
Settings → Web Search → provider = SearXNG, point it at the SearXNG URL. No API key.

---

## 4. Decision summary
| Capability | Value | Cost to privacy | Recommendation |
|---|---|---|---|
| External LLM (Claude/GPT) | Higher capability on demand | Data leaves for that request | Optional, RBAC-gated, non-sensitive only, labelled |
| External tools (OpenAPI/MCP) | Connect real systems | Depends on the system | Prefer internal/EU tools for sensitive flows |
| Web search | Live, cited info | Queries leave the network | SearXNG for privacy; per-message opt-in; off for confidential |

All three are **opt-in layers on top of** the private core — they extend it, they don't replace the
"private by default" guarantee. Keep the default path fully private; make every external hop a
deliberate, governed, logged choice.

**Related:** [02-user-guide](02-user-guide.md) · [03-admin-guide](03-admin-guide.md) · [07-fine-tuning](07-fine-tuning.md)
