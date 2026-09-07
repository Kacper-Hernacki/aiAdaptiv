# 04 — Feature reference

Full feature surface of Open WebUI **v0.10.2** as configured on this instance.
Legend: **✅ on · ⚪ available (admin toggle) · 🔑 needs an external service/key**

## Chat
| Feature | Status |
|---|---|
| Multi-model chat / arena compare | ✅ |
| Per-chat controls (temp, system prompt, params, valves) | ✅ |
| Regenerate / continue / edit / branch | ✅ |
| Message rating + feedback | ✅ |
| Temporary chats | ✅ |
| Folders, tags, search, archive, clone, pin | ✅ |
| Chat sharing / community | ✅ |

## Workspace objects
| Object | Status | On this instance |
|---|---|---|
| Models (assistants) | ✅ | Deal Room Analyst, Contract Reviewer, Client Comms |
| Knowledge (RAG) | ✅ | Project Meridian — Deal Room |
| Prompts (slash) | ✅ | /risks /summary /redline /plain |
| Tools (Python fns) | ✅ | Deadline Tools |
| Functions (pipe/filter/action) | ✅ | Confidentiality Check (action) |
| Skills (procedures) | ✅ | Due Diligence Review |

## Documents & RAG — the local pipeline
Every stage runs locally in the WebUI container; no document data leaves.

| Stage | Config | Upgrade options |
|---|---|---|
| Content extraction | built-in default | Docling · Datalab Marker · Azure Doc Intelligence (OCR) |
| Chunking | size 1000 / overlap 100 | tune in Settings → Documents |
| Embeddings | local sentence-transformers (MiniLM-L6-v2), CPU | Ollama (GPU) · OpenAI |
| Vector store | local ChromaDB (on-disk) | external vector DBs supported |
| Retrieval | top-k 3, hybrid search off, no reranker | enable hybrid + reranker for precision |
| Sources | files, web pages, YouTube URLs | — |
| Citations | ✅ inline `[n]` | — |

## Multimodal & generation
| Feature | Status | Note |
|---|---|---|
| Code interpreter / execution | ✅ | in-browser Pyodide |
| Voice (STT + TTS, call mode) | ✅ | engines/voices in Settings → Audio |
| Vision | ⚪ | needs a vision-capable model (Qwen 7B isn't) |
| Image generation | 🔑 | needs ComfyUI / DALL·E / Gemini |

## Integrations
| Integration | Status |
|---|---|
| Web search | 🔑 (Tavily/Brave/Google PSE, or SearXNG no-key) |
| Direct connections (other OpenAI-compatible APIs) | ⚪ |
| External tool servers (OpenAPI) | ⚪ |
| Google Drive / OneDrive | 🔑 |
| API keys (WebUI as an API) | ⚪ |
| User webhooks | ⚪ |

## Productivity
| Feature | Status |
|---|---|
| Notes (AI-assisted) | ✅ |
| Calendar | ✅ |
| Automations (scheduled/triggered AI tasks) | ✅ |
| Memories (per-user personalization) | ✅ |
| Channels (Slack-like team chat) | ⚪ off |

## Admin & governance
| Feature | Status |
|---|---|
| Users + roles (Admin/User/Pending) | ✅ |
| Groups + granular RBAC | ✅ |
| Per-model / per-KB access control | ✅ |
| Admin chat monitoring | ✅ |
| Analytics dashboard | ✅ |
| Data export / import | ✅ |
| Response watermark | ⚪ (empty) |
| Auth: login form ✅ · signup ⚪(off) · LDAP ⚪ · OAuth/SSO ⚪ · trusted-header ⚪ | mixed |
| Session length (JWT) | 4 weeks |

## Key live config values
| Setting | Value |
|---|---|
| Version | 0.10.2 |
| DEFAULT_USER_ROLE | pending |
| ENABLE_SIGNUP | false |
| ENABLE_API_KEYS | false |
| CHUNK_SIZE / OVERLAP | 1000 / 100 |
| TOP_K | 3 |
| Hybrid search | off |
| Embedding | local MiniLM-L6-v2 |
| Vector DB | local ChromaDB |

## The privacy claim, in one line
Documents in → extracted → chunked → embedded (locally) → stored (local vector DB) → retrieved →
answered by a model on a GPU you control. No embedding API, no cloud vector DB, no data egress.
That is the GDPR / confidentiality selling point, and on this stack it is literally true.
