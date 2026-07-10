#!/usr/bin/env python3
"""
seed.py — Provision the aiAdaptiv private-AI showcase into a FRESH Open WebUI.

Creates (idempotency: intended for a fresh instance):
  - admin + members
  - 3 knowledge bases: Sample Documents (demo), aiAdaptiv Company & Product, aiAdaptiv Platform Docs
  - 5 assistants: Document Intelligence, Contract Reviewer, Client Comms Drafter, aiAdaptiv Assistant,
    AI Audit & Stack Advisor (recommends model/GPU/serving/cost from client needs)
  - 4 prompt slash-commands, 2 tools, 1 skill, 1 function (activated), 1 note

Usage:
    OWUI_URL=http://localhost:3000 python3 seed.py
Env (all optional; sensible defaults):
    OWUI_URL             target base URL           (default http://localhost:3000)
    OWUI_ADMIN_EMAIL     admin email               (default kacper@aiadaptiv.com)
    OWUI_ADMIN_NAME      admin display name        (default "Kacper Hernacki")
    OWUI_ADMIN_PASSWORD  admin password            (default: generated & printed)
    OWUI_BASE_MODEL      base model id             (default qwen2.5:7b)
Passwords for members are generated and printed at the end (change on first login).
"""
import os, sys, json, time, secrets, pathlib, urllib.request, urllib.error

BASE       = os.environ.get("OWUI_URL", "http://localhost:3000").rstrip("/")
ADMIN_EMAIL= os.environ.get("OWUI_ADMIN_EMAIL", "kacper@aiadaptiv.com")
ADMIN_NAME = os.environ.get("OWUI_ADMIN_NAME", "Kacper Hernacki")
ADMIN_PW   = os.environ.get("OWUI_ADMIN_PASSWORD") or ("aA1!" + secrets.token_urlsafe(12))
BASE_MODEL = os.environ.get("OWUI_BASE_MODEL", "qwen2.5:7b")
SEED_DIR   = pathlib.Path(__file__).resolve().parent
DOCS_DIR   = SEED_DIR.parent  # the docs/private-ai-poc teaching docs

MEMBERS = [
    {"name": "Kacper Hernacki", "email": "hernackikacper@gmail.com", "role": "user"},
    {"name": "Kacper",          "email": "kacper@tryaiadaptiv.com",  "role": "user"},
]

def genpw(): return "aA1!" + secrets.token_urlsafe(10)

# ---------- HTTP helpers ----------
def api(method, path, token=None, payload=None):
    headers = {"Content-Type": "application/json"}
    if token: headers["Authorization"] = "Bearer " + token
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            body = r.read()
            return r.status, (json.loads(body) if body else {})
    except urllib.error.HTTPError as e:
        return e.code, {"_error": e.read()[:300].decode(errors="ignore")}
    except Exception as e:
        return 0, {"_error": str(e)}

def upload_file(token, path):
    content = pathlib.Path(path).read_bytes()
    boundary = "----owui" + secrets.token_hex(8)
    pre  = (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; '
            f'filename="{pathlib.Path(path).name}"\r\nContent-Type: text/markdown\r\n\r\n').encode()
    body = pre + content + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request(BASE + "/api/v1/files/", data=body, method="POST",
        headers={"Authorization": "Bearer " + token,
                 "Content-Type": f"multipart/form-data; boundary={boundary}"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.load(r).get("id")

def ok(label, st):
    print(f"  {'OK ' if st in (200,201) else 'XX '} {label} ({st})")

# ---------- admin ----------
def ensure_admin():
    st, resp = api("POST", "/api/v1/auths/signup",
                   payload={"name": ADMIN_NAME, "email": ADMIN_EMAIL, "password": ADMIN_PW})
    if st == 200 and resp.get("token"):
        print(f"  OK  admin created: {ADMIN_EMAIL}")
        return resp["token"]
    st, resp = api("POST", "/api/v1/auths/signin",
                   payload={"email": ADMIN_EMAIL, "password": ADMIN_PW})
    if st == 200 and resp.get("token"):
        print(f"  OK  admin signed in: {ADMIN_EMAIL}")
        return resp["token"]
    print("  FATAL: cannot create or sign in admin:", resp); sys.exit(1)

# ---------- knowledge bases ----------
def create_kb(token, name, desc, files):
    st, kb = api("POST", "/api/v1/knowledge/create", token,
                 {"name": name, "description": desc, "access_control": None})
    if st != 200:
        ok(f"KB {name}", st); return None
    kb_id = kb["id"]
    for f in files:
        st2 = 0
        try:
            fid = upload_file(token, f)
            # embedding model loads on first use — add can 400 in that cold window; retry with backoff
            for attempt in range(5):
                st2, _ = api("POST", f"/api/v1/knowledge/{kb_id}/file/add", token, {"file_id": fid})
                if st2 == 200:
                    break
                time.sleep(3)
        except Exception:
            st2 = 0
        print(f"    - {pathlib.Path(f).name} ({st2})")
    # return the full KB object (needed to attach to models)
    _, full = api("GET", f"/api/v1/knowledge/{kb_id}", token)
    return full

# ---------- main ----------
def main():
    print(f"Seeding {BASE}\n")
    print("Admin & members:")
    token = ensure_admin()
    member_creds = []
    for m in MEMBERS:
        pw = genpw()
        st, _ = api("POST", "/api/v1/auths/add", token,
                    {"name": m["name"], "email": m["email"], "password": pw, "role": m["role"]})
        ok(f"member {m['email']}", st)
        if st == 200: member_creds.append((m["email"], pw))

    print("\nKnowledge bases:")
    kb_samples = create_kb(token, "Sample Documents",
        "Example business documents (a services agreement + an NDA) for demoing document intelligence.",
        sorted(str(p) for p in (SEED_DIR/"kb"/"sample-docs").glob("*.md")))
    kb_prod = create_kb(token, "aiAdaptiv — Company & Product",
        "What aiAdaptiv is, pricing, how it works, FAQ.",
        sorted(str(p) for p in (SEED_DIR/"kb"/"aiadaptiv").glob("*.md")))
    kb_docs = create_kb(token, "aiAdaptiv — Platform Docs",
        "Setup, usage, admin, capacity, audit, fine-tuning, architecture, deployment.",
        sorted(str(p) for p in DOCS_DIR.glob("*.md")))

    def kbref(kb):
        if kb: kb = dict(kb); kb["type"] = "collection"
        return kb

    GROUNDED = ("You are a meticulous analyst. Answer the user's question directly and concisely using "
        "ONLY the provided documents, citing them as [n]. Do NOT describe your process, do NOT say you "
        "are searching, and do NOT mention knowledge bases, files, or tools. State the answer immediately. "
        "If the answer is not in the documents, say so plainly in one sentence and do not speculate.")
    DOCINTEL = ("You are aiAdaptiv's document-intelligence assistant. From the provided business documents, "
        "extract key terms, flag risky or unusual clauses, produce summaries, and compare provisions on "
        "request. Answer ONLY from the provided documents and cite them as [n]. Do NOT describe your process "
        "or mention tools/knowledge bases. If something is not in the documents, say so in one sentence.")
    ADVISOR_SYS = ("You are aiAdaptiv's AI audit advisor. Your job is to recommend a private-AI stack for a "
        "prospective client. Collect these inputs: number of users; primary use cases; data sensitivity "
        "(public / internal / confidential / regulated); desired quality (basic / balanced / high / top); "
        "whether EU hosting is required; and budget. Ask for anything missing BEFORE recommending. Once you "
        "have the inputs, call the recommend_stack tool, then present its recommendation clearly and add a "
        "one-line compliance note. Be concise and practical.")

    print("\nAssistants (models):")
    MODELS = [
      {"id":"document-intelligence","name":"📄 Document Intelligence","base_model_id":BASE_MODEL,
       "meta":{"description":"Reads your business documents — extracts key terms, flags risks and unusual clauses, summarizes, and compares — always with citations.",
               "capabilities":{"citations":True},"knowledge":[kbref(kb_samples)] if kb_samples else [],
               "suggestion_prompts":[{"content":"What are the riskiest clauses in the services agreement?"},
                                     {"content":"Summarize the NDA in 5 bullet points."},
                                     {"content":"Compare each party's termination rights."}]},
       "params":{"system":DOCINTEL,"temperature":0.2}},
      {"id":"contract-reviewer","name":"📝 Contract Reviewer","base_model_id":BASE_MODEL,
       "meta":{"description":"Flags risky clauses, missing protections, and ambiguities."},
       "params":{"system":"You are a senior contracts lawyer. For any clause or contract provided, output a "
         "risk table (Clause | Issue | Severity | Suggested fix). Be concise and practical.","temperature":0.3}},
      {"id":"client-comms","name":"✉️ Client Comms Drafter","base_model_id":BASE_MODEL,
       "meta":{"description":"Drafts polished client emails and letters."},
       "params":{"system":"You draft professional, warm-but-precise client communications for a boutique "
         "professional-services firm. Concise, confident, minimal legalese.","temperature":0.5}},
      {"id":"aiadaptiv-assistant","name":"🧠 aiAdaptiv Assistant","base_model_id":BASE_MODEL,
       "meta":{"description":"Answers questions about aiAdaptiv — the product, pricing, and the platform docs.",
               "capabilities":{"citations":True},
               "knowledge":[k for k in (kbref(kb_prod),kbref(kb_docs)) if k],
               "suggestion_prompts":[{"content":"What is aiAdaptiv and who is it for?"},
                                     {"content":"How much does it cost and how long does setup take?"},
                                     {"content":"How do I deploy Open WebUI on Koyeb?"}]},
       "params":{"system":GROUNDED,"temperature":0.3}},
      {"id":"stack-advisor","name":"🔍 AI Audit & Stack Advisor","base_model_id":BASE_MODEL,
       "meta":{"description":"Interviews you about a client's needs, then recommends the private-AI stack — model, GPU, serving, hosting, and cost.",
               "toolIds":["stack_advisor"],
               "suggestion_prompts":[{"content":"Recommend a stack for a 30-user law firm handling confidential documents."},
                                     {"content":"80 users, need high quality, regulated data — what infrastructure?"}]},
       "params":{"system":ADVISOR_SYS,"function_calling":"native","temperature":0.2}},
    ]
    for m in MODELS:
        st, _ = api("POST", "/api/v1/models/create", token, m); ok(m["name"], st)

    print("\nPrompts:")
    for c,t,body in [
        ("risks","Rank risks","Identify and rank the top risks in the following document. Return a table: Risk | Severity (High/Med/Low) | Why it matters.\n\n{{CLIPBOARD}}"),
        ("summary","Executive summary","Write a 5-bullet executive summary of the following, for a busy managing partner:\n\n{{CLIPBOARD}}"),
        ("redline","Suggest redlines","Suggest specific redlines to make the following clause more favorable and less ambiguous. Show before/after:\n\n{{CLIPBOARD}}"),
        ("plain","Plain language","Rewrite the following legal text in plain, client-friendly language without losing accuracy:\n\n{{CLIPBOARD}}"),
    ]:
        st,_ = api("POST","/api/v1/prompts/create",token,{"command":c,"name":t,"title":t,"content":body}); ok("/"+c, st)

    print("\nTool / Skill / Function / Note:")
    TOOL='''"""
title: Deadline Tools
author: aiAdaptiv
version: 0.1.0
description: Compute days remaining until a legal or deal deadline.
"""
from datetime import date, datetime

class Tools:
    def __init__(self):
        pass

    def days_until(self, target_date: str) -> str:
        """
        Calculate the number of days from today until a target date.
        :param target_date: The target date in YYYY-MM-DD format.
        :return: Human-readable days remaining.
        """
        try:
            t = datetime.strptime(target_date, "%Y-%m-%d").date()
        except ValueError:
            return "Invalid date format. Use YYYY-MM-DD."
        delta = (t - date.today()).days
        if delta > 0:
            return f"{delta} days remaining until {target_date}."
        if delta == 0:
            return f"{target_date} is today."
        return f"{target_date} was {abs(delta)} days ago."
'''
    st,_=api("POST","/api/v1/tools/create",token,{"id":"deadline_tools","name":"Deadline Tools",
        "content":TOOL,"meta":{"description":"Compute days remaining until a deadline."}}); ok("tool deadline_tools",st)

    ADVISOR='''"""
title: Stack Advisor
author: aiAdaptiv
version: 0.1.0
description: Recommend a private-AI stack (model, GPU, serving, cost) from a client's needs.
"""
import math

class Tools:
    def __init__(self):
        pass

    def recommend_stack(self, num_users: int, quality: str = "balanced", data_sensitivity: str = "confidential", peak_concurrency_pct: float = 6.0, eu_hosting_required: bool = True) -> str:
        """
        Recommend a private-AI infrastructure stack from a client's needs.
        :param num_users: total number of users (seats).
        :param quality: model quality - one of basic, balanced, high, top.
        :param data_sensitivity: one of public, internal, confidential, regulated.
        :param peak_concurrency_pct: percent of users generating at peak (default 6).
        :param eu_hosting_required: whether data must stay in the EU.
        :return: a formatted stack recommendation.
        """
        table = {
            "basic":    ("Qwen 7B",   "RTX A6000 48GB",   0.75, 30),
            "balanced": ("Qwen 14B",  "RTX A6000 48GB",   0.75, 20),
            "high":     ("Qwen 32B",  "A100 80GB",        1.60, 15),
            "top":      ("Qwen 72B",  "A100 80GB / H100", 2.50, 8),
        }
        q = (quality or "balanced").lower().strip()
        if q not in table:
            q = "balanced"
        model, gpu, gpu_hr, cap = table[q]
        try:
            n = max(1, int(num_users))
        except Exception:
            n = 1
        pct = peak_concurrency_pct if (peak_concurrency_pct and peak_concurrency_pct > 0) else 6.0
        concurrency = max(1, round(n * pct / 100.0))
        serving = "Ollama" if (n <= 10 and concurrency <= 2) else "vLLM (continuous batching)"
        replicas = max(1, math.ceil(concurrency / cap))
        gpu_month = round(gpu_hr * 730) * replicas
        sens = (data_sensitivity or "confidential").lower().strip()
        strict = sens in ("confidential", "regulated")
        eu = eu_hosting_required or strict
        hosting = "client's own EU cloud account" if eu else "any region"
        controls = ["SSO + groups & per-KB RBAC", "audit log + admin oversight"]
        if eu:
            controls.insert(0, "EU hosting / data residency")
        if sens == "regulated":
            controls += ["documented retention & deletion", "EU AI Act risk assessment"]
        total = gpu_month + 21 + 249
        out = []
        out.append("aiAdaptiv Stack Recommendation")
        out.append("")
        out.append("INPUTS: " + str(n) + " users | quality=" + q + " | data=" + sens + " | EU hosting=" + ("yes" if eu else "optional"))
        out.append("")
        out.append("RECOMMENDED STACK")
        out.append("- Model: " + model)
        out.append("- GPU: " + gpu + " x" + str(replicas) + " replica(s)")
        out.append("- Serving: " + serving)
        out.append("- Hosting: " + hosting)
        out.append("- Vector store: pgvector (Postgres) for production; ChromaDB fine for a pilot")
        out.append("")
        out.append("CAPACITY")
        out.append("- Est. peak concurrent generations: ~" + str(concurrency) + " (at " + str(int(pct)) + "% of " + str(n) + " users)")
        out.append("- " + str(replicas) + " replica(s) to serve that comfortably")
        out.append("")
        out.append("COMPLIANCE")
        for c in controls:
            out.append("- " + c)
        out.append("")
        out.append("COST (rough, always-on; on-demand is cheaper)")
        out.append("- GPU: ~EUR " + str(gpu_month) + "/mo (" + str(gpu_hr) + "/hr x" + str(replicas) + ")")
        out.append("- Frontend CPU: ~EUR 21/mo")
        out.append("- aiAdaptiv: EUR 1,999 setup + EUR 249/mo")
        out.append("- Approx infra total: ~EUR " + str(total) + "/mo + setup")
        out.append("")
        out.append("Note: sizing assumes knowledge-worker usage; verify with a load test.")
        return "\\n".join(out)
'''
    st,_=api("POST","/api/v1/tools/create",token,{"id":"stack_advisor","name":"Stack Advisor",
        "content":ADVISOR,"meta":{"description":"Recommend a private-AI stack from a client's needs."}}); ok("tool stack_advisor",st)

    SKILL="""# Document Review

When asked to review a contract or business document, follow this procedure:

1. **Parties & purpose** — identify the parties and what the document is for.
2. **Key terms** — extract fees, term, renewal, payment terms, and any headline figures.
3. **Key dates & deadlines** — extract every date and notice period; flag anything time-sensitive.
4. **Risks & unusual clauses** — flag uncapped liability, auto-renewal, one-sided termination, missing protections, and anything unusual.
5. **Output** — a one-page summary: Parties · Key Terms · Key Dates · Top 3 Risks (ranked) · Open Questions.

Always cite the source document for each fact. Never state a fact not in the provided documents.
"""
    st,_=api("POST","/api/v1/skills/create",token,{"id":"document-review","name":"Document Review",
        "content":SKILL,"meta":{"description":"Structured procedure for reviewing contracts and business documents."}}); ok("skill document-review",st)

    FUNC=r'''"""
title: Confidentiality Check
author: aiAdaptiv
version: 0.1.0
description: Flags emails, IBANs and monetary amounts in a message. Deterministic, no model call.
"""
import re

class Action:
    def __init__(self):
        pass

    async def action(self, body, __user__=None, __event_emitter__=None, **kwargs):
        text = ""
        for m in body.get("messages", []):
            text += (m.get("content") or "") + "\n"
        scan = text.replace(" ", "")
        patterns = {
            "email address": r"[\w.+-]+@[\w-]+\.[\w.-]+",
            "IBAN": r"[A-Z]{2}\d{2}[A-Z0-9]{10,30}",
            "monetary amount": r"(?:EUR|PLN|USD|GBP)[\d,.]+|[\d,.]+(?:EUR|PLN|USD|GBP)",
        }
        findings = []
        for label, pat in patterns.items():
            n = len(re.findall(pat, scan))
            if n:
                findings.append(f"{n} {label}{'s' if n>1 else ''}")
        desc = ("⚠️ Sensitive data detected: " + ", ".join(findings)) if findings else "✅ No obvious sensitive data detected."
        if __event_emitter__:
            await __event_emitter__({"type": "status", "data": {"description": desc, "done": True}})
        return None
'''
    st,_=api("POST","/api/v1/functions/create",token,{"id":"confidentiality_check","name":"Confidentiality Check",
        "type":"action","content":FUNC,"meta":{"description":"Flags emails, IBANs and monetary amounts."}}); ok("function confidentiality_check",st)
    st,_=api("POST","/api/v1/functions/id/confidentiality_check/toggle",token); ok("  activate function",st)

    note_md=("## Services Agreement — Review Notes\n\n"
      "Reviewing the Northstar / Meridian Retail master services agreement.\n\n"
      "- Fees EUR 12,000/mo, net 30 — fine.\n"
      "- ⚠️ Auto-renews for 12-month terms; 90 days notice required — easy to miss, calendar it.\n"
      "- ⚠️ Provider liability is UNLIMITED — push for a cap (e.g. 12 months' fees).\n"
      "- ⚠️ Termination is one-sided: Provider can exit for convenience, Client only for cause.\n"
      "- Follow-ups: request a liability cap, add mutual termination-for-convenience, confirm renewal date.\n")
    st,_=api("POST","/api/v1/notes/create",token,{"title":"Services Agreement — Review Notes",
        "data":{"content":{"md":note_md,"html":"<pre>"+note_md+"</pre>"}},"meta":{"tags":["contract","review"]}}); ok("note review",st)

    print("\n" + "="*56)
    print("SEED COMPLETE")
    print("="*56)
    print(f"Admin  : {ADMIN_EMAIL}  /  {ADMIN_PW}")
    for e,p in member_creds:
        print(f"Member : {e}  /  {p}")
    print("\n(Change these passwords on first login. Members start as 'user' role.)")

if __name__ == "__main__":
    main()
