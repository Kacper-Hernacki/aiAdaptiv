# 01 — Setup: stand up the stack from scratch

Two moving parts: **(A)** the model on a Koyeb GPU, **(B)** Open WebUI locally in Docker,
wired together. ~15 minutes cold.

## Prerequisites
- **Koyeb account** with GPU access, the `koyeb` CLI, and an API token in `~/.koyeb.yaml`.
  - Install CLI: `brew install koyeb/tap/koyeb` (or see koyeb.com/docs/cli).
  - Log in / set token: `koyeb login` (writes the token to `~/.koyeb.yaml`).
- **Docker** running locally.
- macOS/Linux shell. (On macOS there's no `timeout`; and `koyeb instance exec` needs a TTY — see gotchas.)

---

## Part A — Model on a Koyeb GPU

### 1. Pick a GPU
```bash
# list GPU catalog with regions + price
curl -s -H "Authorization: Bearer $(grep token ~/.koyeb.yaml | awk '{print $2}')" \
  "https://app.koyeb.com/v1/catalog/instances?limit=100" | python3 -c "
import sys,json
for it in json.load(sys.stdin).get('instances',[]):
    if 'gpu' in it.get('id','').lower():
        print(it['id'], it.get('regions'), it.get('price_per_second'))"
```
EU only offers the RTX-4000 (20GB) and its capacity is unreliable. Larger GPUs are US (`na`) only.
For this PoC we use **`gpu-nvidia-rtx-a6000`** (48GB, `na`, ~$0.75/hr).

### 2. Create the Ollama service (API exposed publicly)
```bash
koyeb service create qwen-api \
  --app cloudy-jami \
  --docker ollama/ollama:latest \
  --regions na \
  --instance-type gpu-nvidia-rtx-a6000 \
  --ports 11434:http \
  --routes /:11434
```
This exposes the Ollama API at the app's public HTTPS domain (`https://<app>.koyeb.app`).

### 3. Wait until HEALTHY, then pull the model
```bash
koyeb services get <SERVICE_ID> -o json | python3 -c "import sys,json;print(json.load(sys.stdin)['service']['status'])"
koyeb instances list --app cloudy-jami          # get the instance id
# exec needs a TTY -> wrap in `script` on macOS:
script -q /dev/null koyeb instance exec <INSTANCE_ID> -- ollama pull qwen2.5:7b
# confirm over the public API:
curl -s https://<app>.koyeb.app/api/tags
```

---

## Part B — Open WebUI locally

### 4. Run the container, pointed at Koyeb
```bash
docker run -d -p 3000:8080 \
  -e OLLAMA_BASE_URL=https://cloudy-jami-aiadaptiv-d6b425e4.koyeb.app \
  -e WEBUI_NAME="aiAdaptiv PoC" \
  -v open-webui-org:/app/backend/data \
  --name open-webui ghcr.io/open-webui/open-webui:main
```
- `OLLAMA_BASE_URL` — the Koyeb Ollama URL. This is the only wiring needed.
- `-v open-webui-org:/app/backend/data` — **persists all UI data** (users, chats, models, KBs,
  prompts, tools, functions, notes) across restarts. **Important** — without it you lose everything on restart.
- Auth is **on by default** (omit `WEBUI_AUTH`). To disable login for a solo demo, add `-e WEBUI_AUTH=false`.

### 5. First admin + verify
```bash
open http://localhost:3000        # or navigate manually
```
The **first account you create becomes the admin.** Then in the model dropdown pick `qwen2.5:7b` and chat.

Verify the backend can reach Koyeb:
```bash
docker exec open-webui python3 -c "import urllib.request,os;print(urllib.request.urlopen(os.environ['OLLAMA_BASE_URL']+'/api/tags',timeout=15).read()[:200])"
```

---

## Bring-up / shutdown (after first setup)
```bash
# START
koyeb service resume 415b9db1
koyeb instances list --app cloudy-jami                                   # get instance id
script -q /dev/null koyeb instance exec <INSTANCE_ID> -- ollama pull qwen2.5:7b   # re-pull (no volume)
docker start open-webui

# STOP
koyeb service pause 415b9db1        # GPU billing stops
docker stop open-webui
```

## Alternative topologies
- **Simplest (single service):** `ghcr.io/open-webui/open-webui:ollama` runs Open WebUI + Ollama
  in ONE Koyeb container on the GPU (public URL = the UI). Good for a hosted demo coworkers can
  reach; couples UI and model to the same GPU box.
- **This PoC (split):** Ollama on Koyeb, Open WebUI local. Keeps the Mac light; UI is only reachable
  on your machine (fine for solo demos, not for inviting coworkers — see 03-admin-guide).
- **Production shape:** two Koyeb services — Open WebUI on a cheap CPU instance + Ollama on GPU,
  wired over Koyeb's private network. Scale/restart the UI without touching the GPU.

## Security & caveats
- **No persistent volume on Koyeb** → the model + Ollama state are lost on pause/redeploy
  (7B re-pulls in ~30s). Attach a Koyeb volume at `/root/.ollama` to persist (forces min=max=1).
- **Ollama API is public + unauthenticated** — anyone with the URL can use your GPU. Don't share it;
  pause when idle; put an auth proxy / IP allowlist in front before any real use.
- **US region → GDPR-incompatible for real EU client data.** PoC/test data only. Production must be EU-hosted.
- **GPU bills ~$0.75/hr while running.** Always pause when done.

## Gotchas learned the hard way
- `koyeb instance exec` fails with "stdin is not a terminal" — wrap in `script -q /dev/null <cmd>`.
- macOS has no `timeout`/`gtimeout` — don't rely on it in scripts.
- `--checks-grace-period` uses `PORT=SECONDS` and needs a matching explicit `--checks`.
- GPU quota is small (often 1) — a just-deleted service holds the slot for ~1 min; wait before recreating.
