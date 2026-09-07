# aiAdaptiv — PoC Loom Script

**Goal:** In ~3–4 min, show a prospect a working private AI assistant and make them feel "this is our ChatGPT, but the data never leaves our control."
**Audience default:** a prospective business client (non-technical decision-maker). Retune notes for investor/internal are at the bottom.
**Tone:** warm, confident, plain language. You're a peer showing something cool — not a salesperson pitching.

---

## 0. Pre-flight — do this 15 min BEFORE recording

The service is paused and has **no volume**, so the model and any account were wiped. Rebuild it:

```bash
# 1. Resume the GPU service
koyeb service resume 8a34d41d

# 2. Wait until HEALTHY (~2 min)
koyeb services get 8a34d41d -o json | python3 -c "import sys,json;print(json.load(sys.stdin)['service']['status'])"

# 3. Get the instance id, then pull the model (wrap in `script` for the TTY)
koyeb instances list --app cloudy-jami
script -q /dev/null koyeb instance exec <INSTANCE_ID> -- ollama pull qwen2.5:7b
```

> **Recommended for the recording:** pull `qwen2.5:32b` instead of 7b. It's noticeably sharper, and you're only paying for the ~20 min you're live. Bigger model = better first impression. (If you do, resume needs the 48GB A6000 — it already fits.)

Then, in the browser:
- Open **https://cloudy-jami-aiadaptiv-d6b425e4.koyeb.app**
- **Create the first account** — this becomes admin. Use a clean, on-brand name/email (this is on screen!). e.g. `demo@aiadaptiv...`
- **Warm the model:** send one throwaway prompt so the first real answer isn't slow (cold load ≈ 7s). Discard that chat.
- **Pre-test the exact demo prompts below** so nothing surprises you on camera.

**Browser hygiene (matters more than you think):**
- Full-screen the window, hide the bookmarks bar, close other tabs.
- Have the 3 prompts in a scratch note ready to **paste** — no live typing / typos / dead air.
- Zoom the page to ~110–125% so text is readable in the recording.
- Hide any personal info in the browser chrome.

---

## 1. How to behave on camera

- **Camera bubble ON** (Loom, bottom corner). A face builds trust; a faceless screen recording feels like a tutorial.
- Look at the **camera** at the open and the close — at the screen in between.
- **Don't read this script word-for-word.** These are talking points. Sound like you're explaining to a friend.
- **Energy slightly above normal.** On camera, "normal" reads as flat. Smile at the start.
- Move the mouse **deliberately** — slow, purposeful. No frantic zooming.
- **Pause** after each key point. Silence is fine; it lets things land.
- Talk to **one person** ("you"), never "you guys" / "everyone."
- If you fumble, just restart the sentence — or do one clean retake. Keep it tight; don't ship a rambling 8-min cut.

---

## 2. The script (timed)

### 🎬 Open — hook (0:00–0:20) — *look at camera*
> "Hey [Name] — quick one. You know how everyone's using ChatGPT now, but the second you paste anything sensitive — a contract, customer data, internal numbers — it's going off to a US server you don't control. I want to show you the alternative we built. Same experience, but it's *your* AI, on infrastructure *you* control. Let me show you."

*(Switch to the browser — Open WebUI already open.)*

### 🧭 Orient (0:20–0:40)
> "So this looks familiar on purpose — it's a clean chat interface, works exactly like the tools your team already knows. The difference is entirely underneath: this is running on a private GPU, on a model we host for you. Nothing here is being sent to OpenAI, Google, or any US cloud. Let me actually use it."

### 💬 Demo 1 — capability & speed (0:40–1:20)
Paste **Prompt A**. As it streams:
> "This is a real answer, generated in real time on our own hardware. Notice the speed — this is a private box, not a shared service getting throttled."

### 🔒 Demo 2 — the privacy money-shot (1:20–2:20)
Paste **Prompt B** (has fake sensitive data). After it answers:
> "Now — this is the part that matters. I just gave it an invoice with a person's name, an amount, bank details. On ChatGPT, that data just left your company. Here? It never left this server. Nothing was logged to a third party, nothing used to train someone else's model. For anything under GDPR, that's the whole game."

*(This is the emotional peak of the video. Slow down. Let it land.)*

### ⚙️ Demo 3 — real work (2:20–2:50)
Paste **Prompt C**:
> "And it's genuinely useful, not a toy — summarizing, drafting, pulling action items out of messy notes. The bread-and-butter stuff your team does every day."

### 🛠️ The real value — done-for-you (2:50–3:40) — *this is the actual pitch*
*(Come back to camera here. This is where you sell yourself, not the software.)*
> "Now here's the honest part. What you just saw looks simple — but getting to it is a minefield. Which GPU provider? Half of them run out of capacity or fall over at the worst moment. Which model — and how big? How do you host it in the EU for compliance? How does it scale up when your team leans on it, and switch off when they don't so you're not burning money? How do you brand the interface and wire it into your tools?
>
> That's exactly what I take off your plate. **You don't touch any of it.** No hiring an ML engineer, no DevOps, no juggling five vendors. I pick the hardware, handle the outages, choose and set up the right model, scale it, build the interface around how your team actually works, and own the whole stack end to end. You get a working private AI — I deal with the plumbing."

### 👋 Close + CTA (3:40–4:05) — *look at camera*
> "That's the prototype — early, but the core is live and working, as you just saw. And the point isn't the demo — it's that you'd have a partner who owns the entire thing so you never have to think about it. If that's interesting, let's do 20 minutes and I'll show you what a version tuned to *your* data and workflows looks like. Link's below. Talk soon."

---

## 3. Demo prompts (paste-ready, 7B/32B-safe)

Stick to **language tasks** — drafting, summarizing, extracting, rewriting. Avoid math, trivia, and current events (small models hallucinate facts, but nail language).

**Prompt A — capability/speed opener**
```
Draft a warm, professional reply to a customer who's upset their order arrived three days late. Apologize, offer a 15% discount on their next order, and keep it under 120 words.
```

**Prompt B — the privacy demo (fake sensitive data)**
```
Summarize this invoice in 3 bullet points and flag anything that looks unusual:

Invoice #4471 — Contractor: Jan Kowalski
Service: IT consulting, June 2026
Hours billed: 210 at 180 PLN/hr
Total: 41,800 PLN
Bank: PL61 1090 1014 0000 0712 1981 2874
Note: hours exceed the 160/mo cap in the signed SOW.
```
*(The "unusual" flag — hours over the SOW cap — makes it look genuinely smart. Pre-verify it catches it.)*

**Prompt C — real work**
```
Turn these messy meeting notes into 3 clear action items, each with an owner and a due date:

"ok so anna will sort out the vendor contract before end of month, tom needs to get the API keys from finance sometime next week, and we still need someone to write the onboarding doc — maybe me — by the 20th."
```

---

## 4. Do / Don't

**Do**
- Frame it as an **early prototype whose core works** — confident, not apologetic.
- Say "we *can* host this in the EU" (architecture), not "this is currently in the EU" — it's on US infra right now. Stay honest.
- Keep the whole thing **under 4 minutes**.

**Don't**
- Don't demo hard reasoning/math or "what's the latest news" — you'll expose the small model.
- Don't apologize ("sorry it's rough," "ignore the URL"). It undercuts you.
- Don't name the tools (Koyeb, Ollama, Open WebUI). **Name the *categories of hard work you handle*, not the vendors** — the complexity is your selling point; the brand names are just plumbing.
- Don't leave the GPU running after — **`koyeb service pause 8a34d41d`** the moment you stop recording.

---

## 5. What you handle — say it as *their* benefit, not your task list

The key move for a non-technical founder: every technical thing you do = one less thing *they* have to worry about. Translate features → relief. Pull one-liners from here:

| The hard thing (their fear) | How you say it on camera |
|---|---|
| **GPU provider setup & outages** | "Finding the right hardware and keeping it running is a nightmare — providers run out of capacity, things fall over. That's my problem, not yours." |
| **Choosing the LLM** | "You don't need to know a 7B from a 70B. I pick and configure the right model for *your* use case." |
| **LLM setup & tuning** | "Getting a model installed, tuned, and behaving well takes real work — I handle all of it." |
| **Scaling** | "When your team leans on it, it scales up. When they don't, it scales down so you're not overpaying. Automatically." |
| **Custom UI** | "The interface gets branded as yours and shaped around how your team actually works — not a generic chat box." |
| **Whole infrastructure** | "One partner owns the entire stack end to end. No ML engineer to hire, no DevOps, no stitching vendors together." |
| **Compliance / EU hosting** | "It can live in the EU, so your data stays on this continent and you stay compliant." |

**The umbrella line** (memorize this one): *"You get a working private AI. I deal with everything that makes it hard."*

---

## 6. Retune for other audiences
- **Investor:** cut Demo 3, add one line on market ("every EU company that can't legally use ChatGPT is a prospect") and one on the moat/roadmap. Lead with the problem's *size*, not the feature.
- **Internal/stakeholder:** keep all 3 demos, add 20s on cost (~$0.75/hr GPU, EU always-on ≈ €365/mo/client) and the open items (persistent volume, EU capacity).
```
