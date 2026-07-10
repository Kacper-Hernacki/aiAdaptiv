# 05 — GPU capacity planning

How many users can one GPU serve? Worked through for a **50-user org** on **Qwen 7B / A6000 48GB**.

> **TL;DR** — For realistic usage, **one A6000 comfortably serves 50 users.** For a literal
> "all 50 submit at the same instant and get instant replies," no single GPU does that — and the
> real lever is the **serving engine (Ollama → vLLM)**, not the GPU.

## 1. The key reframe: users ≠ concurrent requests
"50 users" is the license count. What the GPU actually sees is **concurrent in-flight generations**,
which is far smaller.

Rough model:
```
concurrent generations ≈ active_users × (generation_time / time_between_messages)
```
- 20 active users, one message every ~90s, ~10s per response → 20 × (10/90) ≈ **~2–3 concurrent**.
- All 50 active → 50 × (10/90) ≈ **~5–6 concurrent**.

So steady-state peak is **~2–6 simultaneous generations**, not 50.

## 2. GPU capacity — A6000 48GB, Qwen 7B
- 7B weights: ~5GB (Q4) to ~15GB (FP16) → **~30–40GB left for KV cache** (many concurrent sequences).
- Single-stream speed: ~40–80 tokens/sec (faster than reading speed).
- Aggregate throughput scales into thousands of tokens/sec across batched requests.

**The bottleneck is the serving engine, not the silicon:**

| Engine | Concurrency behavior | Fit |
|---|---|---|
| **Ollama** (current PoC) | Limited parallelism (`OLLAMA_NUM_PARALLEL`, default low); excess requests **queue** | PoC / small teams |
| **vLLM / TGI / SGLang** | **Continuous batching** — packs many concurrent requests efficiently | Real multi-user serving |

On one A6000, **vLLM** can typically hold **~20–40 concurrent 7B requests** in KV cache and serve
them with graceful batched latency.

## 3. Verdict by scenario
| Scenario | One A6000 enough? |
|---|---|
| 50 users, realistic usage (2–6 concurrent) | ✅ Yes — even on Ollama |
| Bursty peaks (~10–15 concurrent) | ✅ Yes with **vLLM**; Ollama starts queuing |
| Literal 50 simultaneous submits, all "instant" | ⚠️ Served within seconds via vLLM, but not truly instant — first-token latency rises under a 50-wide batch |
| Same, on **Qwen 32B / 72B** | ❌ Bigger models cut concurrency 4–10×; need a bigger GPU or multiple replicas |

## 4. Recommendations for 50-user production
1. **Move Ollama → vLLM** (continuous batching) — the single biggest win for concurrency.
2. **Keep the model as small as the task allows** — 7B/14B serve far more users per GPU than 32B/72B.
3. **Scale horizontally when needed** — 2–3 vLLM replicas behind a load balancer for headroom + redundancy
   (no single point of failure).
4. **RAG is cheap on the GPU** — embeddings run on CPU in the WebUI container, so knowledge-base
   queries add no GPU load beyond the generation itself.
5. **Load-test before committing to SLAs** — real numbers beat estimates (fire N simultaneous
   requests, measure first-token latency + throughput as N climbs).

## 5. Rough sizing guide (Qwen, single GPU, vLLM, realistic usage)
| Model | GPU | Comfortable org size* |
|---|---|---|
| 7B | A6000 48GB | ~50–150 users |
| 14B | A6000 48GB | ~30–80 users |
| 32B | A100 80GB | ~20–50 users |
| 72B | A100 80GB (tight) / H100 | ~10–30 users |

\* *Assumes knowledge-worker usage (2–6% concurrency), vLLM serving. Verify with a load test.*

## 6. Cost note
Always-on single A6000 ≈ $0.75/hr ≈ **~$540/mo** if run 24/7 (or less with scale-to-zero / business-hours
scheduling). Fits the €400–800/mo cloud-cost estimate per client. Concurrency headroom scales linearly
with added replicas.

## 7. Multiple models on one GPU
Yes — achievable. The constraint is always **VRAM**: every loaded model's weights **+ KV cache** must
fit together.

Rough VRAM per model (A6000 = 48GB):
| Model | Q4 / fp16 |
|---|---|
| Qwen 7B | ~5GB / ~15GB |
| Qwen 14B | ~9GB / ~28GB |
| Qwen 32B | ~20GB / (won't fit fp16) |
| embedding model | ~0.5–2GB |

So one A6000 comfortably holds e.g. **7B + 14B + an embedding model** (Q4) with KV headroom. It
**cannot** hold two 72Bs, or 32B + 32B.

### Three ways to do it
| Method | How | Best for | Trade-off |
|---|---|---|---|
| **Ollama multi-load** (have it) | Keeps several models loaded (`OLLAMA_MAX_LOADED_MODELS`, default 3); LRU-swaps when VRAM is tight | Many models, low concurrency each | Cold reload (~seconds) when swapping a model that wasn't resident |
| **LoRA adapters** | One base model + N lightweight fine-tuned adapters sharing it; vLLM serves many concurrently | Many fine-tuned *variants* (per-team/per-client style) cheaply | Variants must share a base model — see [07-fine-tuning](07-fine-tuning.md) |
| **Separate processes / MIG / more GPUs** | Multiple vLLM processes (MPS), or hard-partition with MIG (A100/H100 only — **not** A6000), or add GPUs | Guaranteed isolation, heavy concurrency per model, per-tenant separation | More cost/complexity |

### The catch: shared compute
Loading multiple models is fine; running two **at the same instant** splits the GPU cores → each is
slower. Multi-model works best when usage across models is **staggered** (which, at ~50 users, it
usually is).

### Pick by need
| You want… | Do this |
|---|---|
| A few models available (chat + code + embeddings) | Ollama multi-load |
| Many fine-tuned variants, cheap | One base + LoRA adapters (vLLM) |
| Guaranteed isolation / heavy per-model concurrency | Separate GPUs or MIG (A100/H100) |
| Big models together (32B + 72B) | Won't fit one A6000 — bigger/second GPU |
