# Private AI PoC — Documentation

A private, self-hosted AI assistant: **Open WebUI** (the interface) talking to **Qwen** (the
model) running on a **Koyeb GPU**. Themed as a private AI workspace for a boutique law / M&A firm.

This folder is the teaching material for using and setting it up.

## Read in this order
1. **[01-setup.md](01-setup.md)** — stand the whole stack up from scratch (GPU + model + UI).
2. **[02-user-guide.md](02-user-guide.md)** — how to actually use it: chat, assistants, knowledge, prompts, tools, functions, notes.
3. **[03-admin-guide.md](03-admin-guide.md)** — users, roles, groups/RBAC, settings, integrations.
4. **[04-feature-reference.md](04-feature-reference.md)** — full feature matrix + the local RAG pipeline.
5. **[05-capacity-planning.md](05-capacity-planning.md)** — how many users one GPU serves; Ollama vs vLLM; sizing guide.
6. **[06-ai-audit-and-stack.md](06-ai-audit-and-stack.md)** — client audit → stack recommendation playbook (discovery, data-tiering, mapping, deliverable template).
7. **[07-fine-tuning.md](07-fine-tuning.md)** — when to fine-tune a client's private model vs RAG; private-hosting governance; LoRA delivery.
8. **[08-architecture.md](08-architecture.md)** — Mermaid architecture diagrams (production client deployment + current PoC).
9. **[09-production-deployment.md](09-production-deployment.md)** — plan for the branded, secured Koyeb deployment (custom domain, members, white-label, on-demand).
10. **[10-external-integrations.md](10-external-integrations.md)** — external LLMs (Claude/GPT), external tools, web search; the hybrid private/external architecture + governance.

**Tooling:** [seed/](seed/) — `seed.py` reproducibly provisions the whole showcase (3 KBs, 4 assistants, prompts, tool, skill, function, note, admin + members) into a fresh Open WebUI. Validated.

## What it is (one picture)
```
your browser
   │
http://localhost:3000        Open WebUI  (Docker, on your machine — the interface)
   │  proxies + does RAG
https://<app>.koyeb.app       Ollama API  (public HTTPS)
   │
RTX A6000 GPU (Koyeb)         qwen2.5:7b  (the model — all inference happens here)
```
**Design principle:** the UI is light and runs anywhere; all heavy AI runs on the remote GPU;
the RAG/knowledge pipeline runs locally and privately. Nothing about a document leaves
infrastructure you control.

## Quick reference (this deployment)
| Thing | Value |
|---|---|
| Open WebUI (local) | http://localhost:3000 |
| Ollama API (Koyeb) | https://cloudy-jami-aiadaptiv-d6b425e4.koyeb.app |
| Koyeb service / id | `qwen-api` / `415b9db1` (app `cloudy-jami`) |
| GPU | RTX A6000 48GB, US region `na`, ~$0.75/hr |
| Model | `qwen2.5:7b` |
| Open WebUI version | 0.10.2 |
| Admin login | `admin@aiadaptiv.io` / `aiAdaptiv2026!` |

## Start / stop (cheat sheet)
```bash
# START
koyeb service resume 415b9db1                       # GPU up (~2 min)
# (re-pull model — see 01-setup, no volume so it's lost on pause)
docker start open-webui                             # local UI
open http://localhost:3000

# STOP (save money — GPU bills ~$0.75/hr while running)
koyeb service pause 415b9db1
docker stop open-webui
```

> ⚠️ This PoC runs in a **US region** and the Ollama API is **publicly exposed with no auth**.
> It is for demos/testing only — **no real EU client data**. See 01-setup "Security & caveats".
