# seed/ — reproducible showcase provisioning

`seed.py` provisions the full aiAdaptiv showcase into a **fresh** Open WebUI instance via the admin API.
Run it against any new deployment to recreate everything in ~1 minute.

## What it creates
- **Admin** (`kacper@aiadaptiv.com`) + **members** (`hernackikacper@gmail.com`, `kacper@tryaiadaptiv.com`)
- **3 knowledge bases**
  - *Project Meridian — Deal Room* — confidential M&A demo docs (`kb/deal-room/`)
  - *aiAdaptiv — Company & Product* — real product info from the landing page (`kb/aiadaptiv/`)
  - *aiAdaptiv — Platform Docs* — the teaching docs in `../` (README + 01–10)
- **4 assistants** — ⚖️ Deal Room Analyst (KB-grounded), 📝 Contract Reviewer, ✉️ Client Comms Drafter,
  🧠 aiAdaptiv Assistant (grounded in the product + platform-docs KBs)
- **4 prompts** (`/risks /summary /redline /plain`), **1 tool** (Deadline Tools),
  **1 skill** (Due Diligence Review), **1 function** (Confidentiality Check, activated), **1 note**

## Run it
```bash
# against a fresh Open WebUI (local or deployed)
OWUI_URL=https://ai.aiadaptiv.com python3 seed.py
```
Env (all optional):
| Var | Default |
|---|---|
| `OWUI_URL` | `http://localhost:3000` |
| `OWUI_ADMIN_EMAIL` | `kacper@aiadaptiv.com` |
| `OWUI_ADMIN_NAME` | `Kacper Hernacki` |
| `OWUI_ADMIN_PASSWORD` | generated & printed if unset |
| `OWUI_BASE_MODEL` | `qwen2.5:7b` |

Member passwords are generated and **printed at the end** — hand them out; change on first login.

## Notes
- **Run against a fresh instance.** It creates objects; re-running duplicates them.
- The **first account must be the admin** — run this before anyone else signs up (first signup = admin).
- File-adds **retry with backoff** — the local embedding model loads on first use and rejects adds during
  that cold window; the retry handles it.
- Requires the target instance reachable; KB embedding runs locally (no GPU needed for seeding).
  The models reference `qwen2.5:7b`, so they only *answer* once the Ollama/GPU backend is connected.
- **Validated** 2026-07-09 against a throwaway instance: all 3 KBs return correct retrieval chunks and
  both KB-backed assistants link their collections correctly.

## Files
```
seed.py                     the provisioning script
kb/deal-room/*.md           confidential M&A demo documents
kb/aiadaptiv/*.md           aiAdaptiv company & product (from the landing page)
```
