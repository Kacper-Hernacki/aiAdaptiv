# 07 — Fine-tuning private hosted models

When to fine-tune a client's own privately hosted LLM, when to use RAG, and how to do it without
creating governance problems. Fine-tuning is a **premium add-on**, not the baseline.

> **One-line rule:** Fine-tune for **behavior** (how it writes), use **RAG** for **facts** (what it
> knows). The best deployment uses **both** — a fine-tuned base grounded by RAG.

---

## 1. RAG vs fine-tuning vs both

| | **RAG** | **Fine-tuning** | **Both (recommended premium)** |
|---|---|---|---|
| Teaches | knowledge / facts | behavior / style / format | facts *and* voice |
| Add new info | instant (upload a doc) | requires retraining | instant facts + stable style |
| Reliable facts | ✅ (cited, deletable) | ❌ (hallucination risk) | ✅ |
| House style / tone | ⚠️ via prompts | ✅ its sweet spot | ✅ |
| Cost / effort | low | high (data + GPU) | medium–high |
| Governance | clean (data stays separate) | data baked into weights | manage the fine-tune carefully |

**Fine-tuning does not reliably store retrievable facts.** Pushing documents into weights teaches the
model to *sound* like them and then confidently invent. Keep facts in RAG.

## 2. Why private hosting makes fine-tuning viable
The usual objection to fine-tuning on sensitive data is "the data leaves your control." When the model
is trained and served in the **client's own EU cloud account**, that objection disappears:
- Training data, the fine-tuned weights, and inference all stay inside the client's environment.
- Nothing goes to a third-party AI provider.
- A model **trained on the firm's own work, living in the firm's own infra** is a strong, sticky,
  differentiated offering — hard for a commodity tool to match.

This is a legitimate premium tier. **But private hosting fixes egress, not the two issues below.**

## 3. Governance issues private hosting does NOT solve
### a) GDPR right-to-erasure
Once data is baked into weights you **cannot delete one record/client** without retraining. A
data-subject deletion request can't be honored by "removing a document." Mitigations:
- Fine-tune only on **style/behavior data**, not matter-specific client facts.
- Keep deletable, matter-specific content in **RAG** (where erasure = delete the doc + re-embed).
- Document a **periodic retrain** cycle and the erasure process in the DPA.

### b) Intra-firm privilege / ethical walls
A firm has many clients. Fine-tune one model on **all** matters and Client A's data can influence
answers about Client B — a conflict/privilege leak **inside** the firm. Mitigations:
- Fine-tune on **non-matter-specific** data only (house style, domain language, templates).
- Keep matter facts in **access-controlled RAG** (per-matter groups) so ethical walls hold.
- Never blend confidential matter content into a shared fine-tune.

## 4. When fine-tuning is worth it (all behavior, not facts)
- Enforce the firm's **house drafting style / letter & memo templates** consistently.
- **Domain jargon / register** the base model handles awkwardly.
- **Structured-output reliability** for a repeated task (same format every time).
- A **high-volume repetitive task** where prompt engineering has plateaued.

If prompts + a good system message already get you there, **don't fine-tune** — it's cost and
maintenance you don't need.

## 5. How to deliver it (fits the existing stack)
1. **Method:** LoRA / QLoRA (parameter-efficient). Trains small adapters, not the whole model.
2. **Compute:** a batch job on the **same GPU** used for serving. 7B QLoRA fits an A6000 48GB in a few
   hours; 32B needs an A100 80GB. Run it off-peak or on a temporary spike.
3. **Serving the result:**
   - **vLLM** — can load LoRA adapters, even hot-swap multiple adapters per base model.
   - **Ollama** — merge the adapter into the base and import the GGUF as a model.
4. **The real work is data curation** (not the compute):
   - Turn past letters/memos/templates into **instruction → response pairs**.
   - **Scrub** matter-specific facts, client names, and PII from the training set (see §3).
   - Prefer **synthetic or anonymized** examples for anything sensitive.
   - A few hundred to a few thousand good pairs beats a huge noisy set.
5. **Evaluate** against a held-out set + human review before promoting. Watch for regressions
   (fine-tuning can degrade general ability — "catastrophic forgetting").
6. **Retrain periodically** as style/corpus evolves; version the adapters.

## 6. The recommended architecture
```
User question
   │
Fine-tuned base model (writes in the firm's voice, knows the domain register)
   │  + retrieved context
Access-controlled RAG (matter-specific facts, cited, deletable, ethical-wall-aware)
   │
Grounded answer in the firm's style, sourced from the right documents
```
Fine-tuning for **voice**, RAG for **facts**, RBAC for **walls**. That is the premium private-AI story.

## 7. Positioning in the audit
- **Baseline (everyone):** RAG + custom assistants + prompts.
- **Premium add-on (phase 2):** a fine-tuned house-style model on the client's private infra, layered
  over RAG. Offer it when there's a proven, repeated style/format need and the budget for data curation.

---

**Related:** [06-ai-audit-and-stack](06-ai-audit-and-stack.md) · [05-capacity-planning](05-capacity-planning.md) · [02-user-guide](02-user-guide.md)
