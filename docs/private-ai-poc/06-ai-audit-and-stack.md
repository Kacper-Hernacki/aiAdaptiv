# 06 — AI Audit → Stack Recommendation playbook

A repeatable process for scoping a client's private-AI deployment. Run the **audit** (discovery +
data/compliance assessment), map answers to a **stack**, and deliver a written recommendation.
Doubles as a paid value-add: compliance-sensitive firms value a documented audit.

**Flow:** Audit (Part 1–2) → Map (Part 3) → Recommend (Part 4) → Verify against checklist (Part 5).

---

## Part 1 — Discovery audit (client interview)

### A. Users & usage
- How many total users? How many concurrent at peak (rough)?
- Which teams/roles? Technical skill level?
- Usage pattern: occasional lookups vs heavy daily drafting?
- Growth: users in 12 months?

### B. Use cases (what will they actually do)
- Primary jobs: document Q&A · drafting · summarizing · contract review · research · translation?
- Do they need the model to **cite sources**? (Legal/finance: almost always yes.)
- Any tool/automation needs (deadline tracking, data lookups, external systems)?
- Voice / image / code needs?

### C. Data & documents
- Document types & formats (PDF, docx, scans, emails)? Scanned/OCR needed?
- Volume: how many documents, total size, growth rate?
- How sensitive? (See Part 2 classification.)
- Where does it live now (SharePoint, Drive, local, DMS)? Integration needed?

### D. Compliance & data residency
- Jurisdiction & regulations: GDPR, EU AI Act, sector rules (legal privilege, financial)?
- Hard requirement that data **never leaves the EU / their infrastructure**?
- Data retention / deletion obligations? Audit-trail requirements?

### E. Current tools & risk
- Are staff already pasting client data into public ChatGPT/Claude ("shadow AI")? (This is the pain to name.)
- Existing AI tools, and why they fall short?

### F. Security & access
- SSO required (which IdP)? Role-based access needs?
- Do admins need to review/monitor usage for compliance?
- Any on-prem or private-cloud constraint?

### G. Budget & timeline
- Monthly budget range? Setup budget?
- Target go-live? Pilot first?

---

## Part 2 — Data-sensitivity & compliance assessment

Classify the client's data — it drives hosting and controls.

| Tier | Examples | Implication |
|---|---|---|
| **T1 Public** | Marketing, public filings | Any hosting fine |
| **T2 Internal** | Ops docs, templates | Private hosting preferred |
| **T3 Confidential** | Client contracts, deal docs, financials | **Must** be private + EU-hosted; access-controlled |
| **T4 Regulated/Privileged** | Legal privilege, PII, health/financial regulated | Private + EU + audit trail + strict RBAC + retention controls |

Flag: GDPR (personal data), EU AI Act (risk category of the use case), sector rules. Most
aiAdaptiv clients are **T3/T4** — that's the whole reason they can't use public AI tools.

---

## Part 3 — Requirements → stack mapping

Translate audit answers into components.

### Model
| If the client needs… | Recommend |
|---|---|
| General drafting/summarizing, cost-sensitive | Qwen **7B–14B** |
| Nuanced legal/financial reasoning, higher quality | Qwen **32B** |
| Top quality, complex multi-doc reasoning | Qwen **72B** |
| Multilingual (EU languages) | Qwen family handles EU languages well at ≥14B |
| Vision (scanned docs, images) | A vision-capable model + OCR extractor |

### GPU & serving (see [05-capacity-planning.md](05-capacity-planning.md))
| Users (realistic) × model | GPU | Serving |
|---|---|---|
| ≤50 × 7B/14B | 1× A6000 48GB | vLLM |
| ≤50 × 32B | 1× A100 80GB | vLLM |
| 50–150 × 7B–14B | A6000 + replicas / A100 | vLLM + load balancer |
| High concurrency / HA | 2–3 replicas behind LB | vLLM |

- **Serving engine:** Ollama for pilots; **vLLM** for any real multi-user deployment (continuous batching).
- **Scale-to-zero vs always-on:** always-on for reliable UX (EU GPU capacity is scarce — see project notes).

### Knowledge / RAG
- Always **local embeddings + local vector DB** (privacy). Ollama-GPU embeddings if volume is high.
- Scanned/complex docs → add Docling / Datalab / Azure Doc Intelligence extractor.
- Big KBs → enable **hybrid search + reranker** for precision.

### Features to enable
| Need | Component |
|---|---|
| Grounded answers + citations | Knowledge bases attached to assistants |
| Repeatable tasks | Prompts (slash commands), Skills |
| Structured personas | Custom Models (assistants) per team |
| Guardrails (PII redaction) | Functions (Filter) |
| Live research | Web search (SearXNG for no external key, or a provider) |
| Deadlines / lookups | Tools |
| Team chat with AI | Channels |

### Fine-tuning (premium add-on — see [07-fine-tuning.md](07-fine-tuning.md))
| If the client needs… | Recommend |
|---|---|
| Grounded answers from their documents | **RAG** (baseline — not fine-tuning) |
| Consistent house drafting style / templates / domain register | **Fine-tuned** private model (LoRA) **+ RAG** |
| To "train it on our data" | Clarify: RAG for facts, fine-tune only for *behavior*; keep matter-specific facts in access-controlled RAG (ethical walls, GDPR erasure) |

### Deployment & access
| Requirement | Choice |
|---|---|
| EU data residency (T3/T4) | Deploy in client's **own EU cloud account** |
| SSO | OAuth/OIDC (Google/Microsoft) or LDAP |
| Least-privilege | Groups + per-model/per-KB access control |
| Compliance oversight | Admin chat access + analytics + response watermark |
| Data portability | Export enabled; documented retention/deletion |

---

## Part 4 — Recommended stack (deliverable template)

> **Client:** _______   **Date:** _______   **Prepared by:** aiAdaptiv
>
> **Summary of needs:** _users, use cases, data tier, compliance drivers._
>
> **Recommended stack**
> - **Model:** _e.g. Qwen 32B_ — _why_
> - **GPU / serving:** _e.g. 1× A100 80GB, vLLM_ — _capacity rationale_
> - **Hosting / region:** _client's EU cloud account (data residency)_
> - **Knowledge / RAG:** _local embeddings + vector DB; extractor if scanned docs_
> - **Assistants:** _list the custom models per team/use case_
> - **Features:** _RAG, prompts, tools, functions, web search…_
> - **Access & auth:** _SSO provider, groups/RBAC design_
> - **Compliance controls:** _EU hosting, RBAC, audit trail, watermark, retention_
> - **Cost:** _setup €___ + €___/mo + ~€___/mo cloud_
> - **Rollout:** _pilot (N users, M weeks) → full deployment_

### Worked example — boutique M&A law firm (~30 lawyers)
- **Needs:** confidential deal/contract Q&A with citations; contract review; client drafting. Data tier **T4**.
- **Stack:** Qwen **32B** on **1× A100 80GB (vLLM)**, deployed in the firm's **EU cloud**. Local RAG
  (+ Docling for scanned PDFs, hybrid search + reranker). Assistants: Deal Room Analyst, Contract
  Reviewer, Client Comms. Functions: PII-redaction filter. SSO via Microsoft. Groups per practice area
  with per-KB access. Admin oversight + watermark + defined retention.
- **Cost:** €1,999 setup + €249/mo + ~€600/mo cloud. Pilot: 5 users, 3 weeks → firm-wide.

---

## Part 5 — Compliance & security checklist (verify before sign-off)
- [ ] Data hosted in client's own EU account; nothing egresses to third-party AI APIs
- [ ] Embeddings + vector store are local/private
- [ ] SSO enforced; default role = pending (approval required)
- [ ] Groups + per-model/per-KB access control configured (least privilege)
- [ ] Admin chat-access policy disclosed to users
- [ ] Audit trail / analytics enabled; response watermark set
- [ ] Retention & deletion policy documented and implemented
- [ ] EU AI Act use-case risk category assessed and documented
- [ ] Ollama/model API **not** publicly exposed without auth (proxy / IP allowlist / private network)
- [ ] Backups + export tested
- [ ] Load-tested at expected peak concurrency (real numbers, not estimates)

---

**Related:** [01-setup](01-setup.md) · [03-admin-guide](03-admin-guide.md) · [05-capacity-planning](05-capacity-planning.md)
