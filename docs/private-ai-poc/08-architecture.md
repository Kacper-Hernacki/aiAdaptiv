# 08 — Architecture diagrams

Two views of the same idea: the model, the interface, and the knowledge pipeline arranged so
confidential documents never leave infrastructure the client controls.

Colour coding: **teal = application layer · amber = GPU / compute**.

---

## Production — client deployment (target)

Everything runs inside the client's own EU cloud account. Users get a familiar chat experience;
every request is authenticated, authorized, served on private GPUs, and grounded in a local
knowledge pipeline. Nothing egresses to a third-party AI API.

```mermaid
flowchart TB
  subgraph EU["🔒 Client's own EU cloud account — no data egress"]
    direction TB
    Users["👥 50 staff · browser"]:::plain

    subgraph Edge["Edge & identity"]
      LB["Ingress + TLS<br/>load balancer · rate limit"]:::app
      SSO["SSO / OIDC<br/>Microsoft · Google"]:::app
    end

    subgraph App["Interface & control plane"]
      UI["Open WebUI<br/>chat · assistants · KB · prompts · tools · notes"]:::app
      GOV["Governance<br/>RBAC groups · per-KB access · audit · watermark"]:::app
    end

    subgraph Inf["Inference · GPU"]
      V1["vLLM · replica 1"]:::gpu
      V2["vLLM · replica N"]:::gpu
      MODEL["Qwen 7B–72B<br/>+ optional LoRA adapter"]:::gpu
    end

    subgraph RAG["Knowledge pipeline — fully local"]
      EMB["Embeddings · local"]:::app
      VDB["Vector store<br/>ChromaDB"]:::app
      DOCS["Document store<br/>per-matter access"]:::app
    end

    FT["LoRA fine-tuning job<br/>same GPU · trains style, not facts"]:::gpu
  end

  X["❌ Public AI APIs · OpenAI etc."]:::block

  Users -->|HTTPS| LB --> SSO --> UI
  UI --- GOV
  UI -->|private network| V1 & V2 --> MODEL
  UI <-->|retrieval + citations| VDB
  DOCS --> EMB --> VDB
  FT -. adapter .-> MODEL
  EU -. blocked .-> X

  classDef app fill:#e0eef1,stroke:#1f7a8c,color:#0f4a56;
  classDef gpu fill:#f6ebe0,stroke:#bd6a2c,color:#7d4416;
  classDef plain fill:#eef2f5,stroke:#5c6c79,color:#16212b;
  classDef block fill:#f6e3e1,stroke:#b1443b,color:#7a2c26,stroke-dasharray:4 3;
```

---

## Current PoC — what's running today

A split setup to prove the stack cheaply: the interface runs locally, the model on a rented GPU.
Same shape as production, minus the hardening.

```mermaid
flowchart LR
  subgraph MAC["💻 Your machine"]
    OWUI["Open WebUI · Docker<br/>localhost:3000"]:::app
    LRAG["Local RAG<br/>MiniLM + ChromaDB"]:::app
  end

  subgraph KOYEB["☁️ Koyeb · US region"]
    OLL["Ollama + Qwen 7B<br/>RTX A6000 48GB"]:::gpu
  end

  OWUI -->|"OLLAMA_BASE_URL · HTTPS ⚠ public / no auth"| OLL
  OWUI --- LRAG

  classDef app fill:#e0eef1,stroke:#1f7a8c,color:#0f4a56;
  classDef gpu fill:#f6ebe0,stroke:#bd6a2c,color:#7d4416;
```

---

## PoC → production, what changes
| PoC (today) | Production (client) |
|---|---|
| Ollama | **vLLM** — continuous batching for real concurrency |
| Koyeb, US region | Client's **own EU cloud account** (data residency) |
| Public, unauthenticated endpoint | **SSO + private networking**, no public model endpoint |
| Single GPU | **Load-balanced vLLM replicas** (concurrency + HA) |
| Local RAG (MiniLM + ChromaDB) | **Same** — the knowledge pipeline is already production-ready |

**Related:** [01-setup](01-setup.md) · [05-capacity-planning](05-capacity-planning.md) · [06-ai-audit-and-stack](06-ai-audit-and-stack.md)
