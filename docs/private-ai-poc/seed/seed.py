#!/usr/bin/env python3
"""
seed.py — Provision the aiAdaptiv private-AI showcase into a FRESH Open WebUI.

Creates (idempotency: intended for a fresh instance):
  - admin + members
  - 3 knowledge bases: Deal Room (demo), aiAdaptiv Company & Product, aiAdaptiv Platform Docs
  - 4 assistants: Deal Room Analyst, Contract Reviewer, Client Comms Drafter, aiAdaptiv Assistant
  - 4 prompt slash-commands, 1 tool, 1 skill, 1 function (activated), 1 note

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
    kb_deal = create_kb(token, "Project Meridian — Deal Room",
        "Confidential M&A deal documents (demo).",
        sorted(str(p) for p in (SEED_DIR/"kb"/"deal-room").glob("*.md")))
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

    print("\nAssistants (models):")
    MODELS = [
      {"id":"deal-room-analyst","name":"⚖️ Deal Room Analyst","base_model_id":BASE_MODEL,
       "meta":{"description":"Grounded Q&A over the confidential deal documents, with citations. Never invents facts.",
               "capabilities":{"citations":True},"knowledge":[kbref(kb_deal)] if kb_deal else [],
               "suggestion_prompts":[{"content":"Enterprise value and exclusivity deadline in Project Meridian?"},
                                     {"content":"Rank the principal diligence risks by severity."}]},
       "params":{"system":GROUNDED,"temperature":0.2}},
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

    SKILL="""# Due Diligence Review

When asked to review deal or contract documents for due diligence, follow this procedure:

1. **Parties & structure** — identify parties, structure, and headline value.
2. **Key dates** — extract every deadline; flag anything under 30 days away.
3. **Red flags** — tax disputes, litigation, change-of-control clauses, key-person risk, consents required.
4. **Missing items** — note any standard diligence item absent from the documents.
5. **Output** — a one-page summary: Parties · Value · Key Dates · Top 3 Risks (ranked) · Open Questions.

Always cite the source document for each fact. Never state a fact not in the provided documents.
"""
    st,_=api("POST","/api/v1/skills/create",token,{"id":"due-diligence-review","name":"Due Diligence Review",
        "content":SKILL,"meta":{"description":"Structured procedure for reviewing deal documents."}}); ok("skill due-diligence-review",st)

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

    note_md=("## Project Meridian — Kickoff Call (5 June 2026)\n\n"
      "Attendees: Managing Partner, Northwind deal lead, target CFO (Baltica).\n\n"
      "- Sign by end of September; exclusivity to 15 Aug.\n"
      "- PLN 2.1M VAT dispute — ring-fence in SPA.\n"
      "- DHL change-of-control consent clause — confirm timeline.\n"
      "- Two Gdansk ops leads = retention risk; earn-out/bonus.\n"
      "- Follow-ups: confidentiality side letter, 3yr audited accounts, book data room.\n")
    st,_=api("POST","/api/v1/notes/create",token,{"title":"Project Meridian — Kickoff Call Notes",
        "data":{"content":{"md":note_md,"html":"<pre>"+note_md+"</pre>"}},"meta":{"tags":["deal","meridian"]}}); ok("note kickoff",st)

    print("\n" + "="*56)
    print("SEED COMPLETE")
    print("="*56)
    print(f"Admin  : {ADMIN_EMAIL}  /  {ADMIN_PW}")
    for e,p in member_creds:
        print(f"Member : {e}  /  {p}")
    print("\n(Change these passwords on first login. Members start as 'user' role.)")

if __name__ == "__main__":
    main()
