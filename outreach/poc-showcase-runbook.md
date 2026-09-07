# aiAdaptiv PoC — Showcase Runbook

Private-AI showcase: **Open WebUI (local) → Ollama + Qwen (Koyeb GPU)**, themed as a
private AI workspace for a boutique law/M&A firm. Everything below is verified working
(2026-07-09).

## Architecture
```
browser → http://localhost:3000  (Open WebUI, Docker, on the Mac)
            │ backend proxies + does RAG
          https://cloudy-jami-aiadaptiv-d6b425e4.koyeb.app  (Ollama API, public HTTPS)
            │
          RTX A6000 GPU (Koyeb, US region na) — qwen2.5:7b
```
UI is local (light on the Mac); all inference runs on the remote GPU. Embeddings for RAG
run locally in the WebUI container (sentence-transformers MiniLM — tiny, CPU).

## Bring it up from cold

**1. Koyeb GPU (Ollama API) — service `qwen-api` (id `415b9db1`, app `cloudy-jami`)**
```bash
koyeb service resume 415b9db1
# wait HEALTHY (~2 min):
koyeb services get 415b9db1 -o json | python3 -c "import sys,json;print(json.load(sys.stdin)['service']['status'])"
# get instance id, pull model (no volume, so it re-pulls on every cold start):
koyeb instances list --app cloudy-jami
script -q /dev/null koyeb instance exec <INSTANCE_ID> -- ollama pull qwen2.5:7b
# confirm over public API:
curl -s https://cloudy-jami-aiadaptiv-d6b425e4.koyeb.app/api/tags
```

**2. Local Open WebUI (Docker)** — auth ON, points at the Koyeb Ollama:
```bash
docker run -d -p 3000:8080 \
  -e OLLAMA_BASE_URL=https://cloudy-jami-aiadaptiv-d6b425e4.koyeb.app \
  -e WEBUI_NAME="aiAdaptiv PoC" \
  -v open-webui-org:/app/backend/data \
  --name open-webui ghcr.io/open-webui/open-webui:main
open http://localhost:3000
```

**Admin login:** `admin@aiadaptiv.io` / `aiAdaptiv2026!` (first-signup admin; change in Settings → Account)

## Shut down (stop billing)
```bash
koyeb service pause 415b9db1     # GPU (~$0.75/hr while running) — DO THIS when done
docker stop open-webui           # local UI
```

## Showcase inventory (all built via the admin API, persisted in volume `open-webui-org`)

- **Knowledge:** *Project Meridian — Deal Room* — 3 docs (synthetic M&A deal summary +
  confidentiality agreement + real aiAdaptiv product/pricing). Source files in `/tmp/kb/`.
- **Assistants (custom Models):**
  - **⚖️ Deal Room Analyst** — RAG (KB attached) + `deadline_tools` + native function-calling +
    grounded/cited system prompt. The flagship.
  - **📝 Contract Reviewer** — clause risk table.
  - **✉️ Client Comms Drafter** — client emails/letters.
- **Prompts (slash commands):** `/risks` `/summary` `/redline` `/plain`
- **Tool:** *Deadline Tools* (`days_until(YYYY-MM-DD)`).
- **Skill:** *Due Diligence Review* (structured review procedure).
- **Note:** *Project Meridian — Kickoff Call Notes* — AI-assisted notepad; select text → summarize/
  enhance on the private GPU, or pull the note into chat as context.

## Battle-test results (verified)
- Grounded Q&A with citations: enterprise value €47.5M / exclusivity 15 Aug 2026; breach
  penalty €250k / Poland law; aiAdaptiv €1,999 + €249/mo — all exact, cited `[1]`.
- **No hallucination:** asked for Northwind's CEO (not in docs) → correctly refused.
- Tool-calling: model emits `tool_calls` in native mode; UI executes and returns final answer.

## Demo narrative (the "wow" path)
1. Deal Room Analyst → "enterprise value + top risks?" → cited answer.
2. "How many days to the exclusivity deadline?" → reads date from docs + calls tool (RAG + tool).
3. "Who's Northwind's CEO?" → refuses (no hallucination) — the money moment for legal buyers.
4. Contract Reviewer → paste a clause → risk table.
5. Admin Panel → Users/Groups govern who can use which model/KB — the org story.

## Pending integrations (need a key or extra service — NOT set up)
- **Web search** (legal research): needs Tavily/Brave/Google PSE key, or self-hosted SearXNG (no key).
- **Image generation:** needs a backend (ComfyUI / DALL·E / Gemini).
- **Code interpreter:** can enable with no key (in-browser Pyodide).
- **External tool servers / API access:** off by default.

## Known caveats
- **No persistent volume on Koyeb** → the Qwen model + Ollama state are lost on pause/redeploy
  (7B re-pulls in ~30s). The WebUI/showcase data DOES persist (Docker volume `open-webui-org`).
- **Ollama API is publicly exposed with no auth** — anyone with the URL can use the GPU.
  Pause when done; don't share the URL. Lock down (IP allowlist / auth proxy) before any real use.
- **US region** → PoC/test data only; not GDPR-compliant for real EU client data.
- `koyeb instance exec` needs a TTY on macOS: wrap in `script -q /dev/null …` (no `timeout`).
