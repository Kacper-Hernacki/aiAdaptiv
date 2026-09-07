# 09 — Production deployment plan (Koyeb, branded)

Plan for taking the PoC to a professional, hosted deployment: frontend on a Koyeb **CPU** service,
model on the Koyeb **GPU** service, secured, branded, on a custom domain, with real members.

**Status:** planning. Decisions locked: migration via **seed script**; Ollama **private**.
Open decisions in §F.

## Target architecture
```
coworkers (browser)
  → https://ai.aiadaptiv.com                [public, TLS, authenticated]
     → Open WebUI · CPU service · on-demand* · Koyeb volume · branded
        → Koyeb private network →
           Ollama + Qwen · GPU service · on-demand · NO public endpoint
```
\* Testing phase: CPU is **pausable/on-demand** too (pause both when idle → ~$0 cost). Flip the CPU
to always-on only for a real staffed deployment.
See [08-architecture.md](08-architecture.md) for the diagram. The model API is no longer public — the
only public surface is the authenticated, branded frontend.

---

## A. Security (GPU + CPU)
- **GPU / Ollama → fully private.** Drop the public route; reachable only over Koyeb's private network
  by the frontend. Removes the open, unauthenticated GPU endpoint. *(Confirm Koyeb internal DNS name at build.)*
- **Frontend (CPU):** HTTPS (Koyeb auto-TLS), **login required**, **`WEBUI_SECRET_KEY`** set (stable
  sessions across redeploys), **signup off** by default (members added deliberately — §D).
- **Secrets via Koyeb Secrets**, not plaintext env: the private Ollama URL, `WEBUI_SECRET_KEY`, any OAuth creds.
- **Optional hardening:** rate limiting / WAF, IP allowlist if internal-only, backups (volume snapshot / periodic export).

## B. Branding / white-label
| Element | Effort | Notes |
|---|---|---|
| App name (`WEBUI_NAME=aiAdaptiv`) | easy / free | — |
| Theme colours, default prompts, welcome text | easy / free | admin settings + custom CSS |
| Logo · favicon · splash | medium | bake a custom image (`FROM open-webui` with assets swapped) or mount them; use existing brand assets |
| **Remove every "Open WebUI" reference** | ⚠️ | full white-label is officially an **enterprise-license** feature; community edition gets ~90% (name/logo/colours/domain), some traces may remain |

## C. Custom domain — `ai.aiadaptiv.com`
1. In Koyeb: attach the domain to the app → Koyeb returns a **CNAME target** + provisions TLS automatically.
2. In `aiadaptiv.com` DNS: add **CNAME `ai` → <koyeb target>**.
3. Result: `https://ai.aiadaptiv.com` with a valid cert.
> DNS is client-controlled (their domain). Provide the exact record; they add it. Confirm where
> `aiadaptiv.com` DNS is managed (Vercel / registrar).

## D. Members / access
On a real public domain, coworkers can reach it. Options:
- **SSO** (Google / Microsoft) — cleanest for a real org; lock to `@aiadaptiv.com`.
- **Admin-managed** — create each account manually.
- **Open signup + approval** — restrict to the email domain; approve each.
- Plus **Groups + RBAC** for per-model / per-KB access (see [03-admin-guide](03-admin-guide.md)).

## E. Cost (monthly)

**Testing phase — both services on-demand (pausable).** During the PoC/demo phase we keep the CPU
frontend *and* the GPU **paused** and resume both only for a test/demo, then pause after. A Koyeb
volume forces `min=max=1` (no scale-to-zero) but you can still **pause** a service to stop billing —
data persists on the volume across pause/resume.

| Item | On-demand (testing) | Always-on (production) |
|---|---|---|
| Frontend CPU (`medium` 2 vCPU / 2GB) | ~$0.014/hr only while running | ~$21/mo |
| GPU (A6000) | ~$0.75/hr only while running | ~$540/mo (24/7) |
| Custom domain + TLS | free | free |
| Volume storage | ~cents | ~cents |
| **Typical testing cost** | **~$0.77/hr during a demo, ~$0 idle** | **~$21/mo + GPU use** |

So a 1-hour demo ≈ **~$0.77**; nothing when both are paused. Flip to always-on CPU only when it
becomes a real, staffed deployment.

> Koyeb credits are **not** exposed via the CLI/API token (billing endpoints 401/404) — check the
> **Koyeb dashboard → Billing** for the balance.

> Koyeb credits are **not** exposed via the CLI/API token (billing endpoints 401/404) — check the
> **Koyeb dashboard → Billing** for the balance and divide by the monthly figures above for runway.

CPU sizing options (region `na`, next to the GPU): `small` 1GB ~$11/mo (likely too tight once
embeddings load) · **`medium` 2GB ~$21/mo (recommended)** · `large` 4GB ~$42/mo (heavier RAG).

## F. Open decisions (needed before build)
1. **Members method** — SSO / admin-managed / signup+approval?
2. **Logo asset** — path to the brand asset, or confirm name/colours to use.
3. **DNS** — where is `aiadaptiv.com` DNS managed? Confirm `ai.aiadaptiv.com` as the subdomain.
4. **CPU size** — confirm `medium` (or adjust after checking credits).
5. **White-label extent** — name+logo+colours+domain enough, or must *every* Open WebUI trace go (→ enterprise license)?

## Build order (once decisions are in)
1. **Seed script** (`seed.py`) — reproducibly provisions the whole showcase into any fresh Open WebUI.
   Safe to build now (no Koyeb changes) while gathering domain/logo/SSO answers.
2. Custom branded image (if logo white-label chosen).
3. Koyeb volume for WebUI data.
4. Create `webui` CPU service (branded image, `na`, port 8080, public route, volume, `OLLAMA_BASE_URL`
   → private qwen-api, secrets).
5. Make `qwen-api` private (drop public route); verify internal DNS.
6. Point app domain → webui; attach `ai.aiadaptiv.com`; add DNS CNAME; wait for TLS.
7. Resume GPU → pull model → run `seed.py` → create admin / configure members.
8. Verify end-to-end; delete stale `ollama` service (`b60605fa`); decide local container's fate.

**Related:** [01-setup](01-setup.md) · [03-admin-guide](03-admin-guide.md) · [08-architecture](08-architecture.md)
