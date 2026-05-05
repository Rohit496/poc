# AI Agent Routing System — Workflow & Documentation

## Overview

An **automatic AI routing system** built into Windsurf. Every user question is classified and routed to the correct agent — no slash commands, no manual triggers needed. The AI reads `AGENTS.md` on every turn and routes accordingly.

**Core principle:** The free model (`SWE-1.6`) handles **everything** by default. The paid Expert AI (`Claude Sonnet 4.6 Thinking`) is a **fallback only** — invoked when the free model cannot answer confidently AND virtual context lacks the needed knowledge.

---

## Model Registry

| Tier    | Model                          | When to Use                                                                 |
| ------- | ------------------------------ | --------------------------------------------------------------------------- |
| 🆓 Free | **SWE-1.6**                    | Default for everything — general, factual, Git, hooks, codebase questions   |
| 💰 Paid | **Claude Sonnet 4.6 Thinking** | Fallback only — when free model + virtual context cannot answer confidently |

---

## Agent Roster

| Badge | Agent                   | Cost    | Role                                                         |
| ----- | ----------------------- | ------- | ------------------------------------------------------------ |
| 🟢    | **Main AI Assistant**   | 🆓 Free | Answers from built-in knowledge (Steps 1, 2, 4)              |
| 🟡    | **Virtual Context**     | 🆓 Free | JIT memory — fetches/caches ≤300-line snippets (Steps 2 & 3) |
| �     | **Expert AI**           | 💰 Paid | Deep reasoning over virtual context (Step 4, fallback only)  |
| 🛠️    | **Debug Frontend**      | 🆓 Free | Frontend bug diagnosis workflow                              |
| 📘    | **Angular Hooks Skill** | 🆓 Free | Beginner-friendly hook explanations                          |
| 📐    | **Frontend Guidelines** | 🆓 Free | React component best practices                               |
| 🔧    | **Speckit Git Agents**  | 🆓 Free | Git init / branch / commit / remote / validate               |

---

## Decision Flow

Every question follows this **strict order**:

```
User Question
     │
     ▼
┌────────────────────────────────────────────────────────┐
│  ⛔ STEP 0 — Deterministic Escalation Check             │
│  Does the question match any escalation trigger?        │
│  (phrases, scope >3 files, architectural intent,        │
│   or explicit "use Expert AI")                          │
│                                                         │
│  YES + model ≠ Claude Sonnet 4.6 Thinking               │
│  → Emit 🔴 escalation block, STOP immediately.          │
│    Do NOT check cache. Do NOT fetch. Do NOT answer.     │
└───────────┬─────────────────────────────────────────────┘
            │ NO (no trigger matched)
            ▼
┌────────────────────────────────────────────────────────┐
│  🟢 STEP 1 — Free model reads the question  [🆓 FREE]  │
│  Can I answer from built-in knowledge alone?            │
└───────────┬──────────────────────────────┬──────────────┘
            │ YES                          │ NO
            ▼                              ▼
     Answer directly            ┌────────────────────────────────────┐
     🟢 banner. STOP.           │  🟡 STEP 2 — Check virtual context │
                                │  Does .virtual-context/<TASK_ID>.md│
                                │  already have the needed snippet?  │
                                └───────┬────────────────────┬───────┘
                                        │ YES                │ NO
                                        ▼                    ▼
                                 Answer from cache   ┌───────────────────────┐
                                 🟡 Cache Read        │  🟡 STEP 3 — JIT fetch│
                                 banner. STOP.        │  Pull ≤300 lines,     │
                                                      │  save to virtual ctx  │
                                                      └───────┬───────────────┘
                                                              │
                                                              ▼
                                                Can free model now answer?
                                                      │              │
                                                     YES            NO
                                                      │              │
                                                      ▼              ▼
                                              Answer + cache  ┌──────────────────┐
                                              🟡 New Snippet   │  🔴 STEP 4       │
                                              banner. STOP.    │  Escalate to     │
                                                               │  paid Expert AI  │
                                                               │  (model switch)  │
                                                               └──────────────────┘
```

---

## Step-by-Step Details

### Step 0 — Deterministic Escalation Check

Runs **before anything else**. If the question matches any trigger below AND the active model is not `Claude Sonnet 4.6 Thinking`, the AI emits the 🔴 escalation block and **stops immediately** — no cache check, no fetch, no answer.

**Trigger A — Deterministic (must escalate, no exceptions):**

- **Phrases:** `"audit entire"`, `"audit all"`, `"full refactor"`, `"refactor plan"`, `"architectural review"`, `"architectural audit"`, `"deep analysis"`, `"deep dive into"`, `"comprehensive review"`, `"end-to-end review"`, `"migration strategy"`, `"propose a refactor"`, `"identify all bugs"`, `"find all issues"`, `"trade-offs and migration"`
- **Scope:** Question requires reading **>3 distinct files**
- **Intent:** Architectural changes, multi-file refactors, codebase-wide audits, dependency-graph-impact analysis
- **Explicit:** `"use Expert AI"`, `"use the paid model"`, `"escalate this"`

**Trigger B — Confidence (fallback):**
The free model + virtual context cannot answer confidently after Steps 1–3.

---

### Step 1 — Direct Answer · 🟢 Main AI (FREE)

The free model reads the question. If it can answer from built-in knowledge alone → answer directly, **STOP**.

Examples: general factual questions, simple code concepts, Git commands.

---

### Step 2 — Virtual Context Cache Read · 🟡 (FREE)

Check if `.virtual-context/<TASK_ID>.md` already contains the needed snippet from a previous question. If yes → read the cached snippet, answer, **STOP**.

---

### Step 3 — JIT Fetch · 🟡 (FREE)

Fetch a minimal snippet (≤300 lines) of the exact code needed. Save to `.virtual-context/<TASK_ID>.md`. If the free model can now answer → answer + cache, **STOP**.

Virtual context file format:

```markdown
# Expert Task: <one-line restatement>

## Question

<exact user question>

## Relevant Code Snippets

### <file-path>:<start>-<end>

\`\`\`<lang>
<snippet>
\`\`\`

## Instructions

Answer using only the snippets above. Cite file:line for every claim.
```

> **Constraint:** ≤300 lines total, regardless of codebase size.

---

### Step 4 — Expert AI Escalation · � (PAID)

Only reached if Steps 1–3 all failed to produce a confident answer.

- **Skill invoked:** `ask-expert-reasoning`
- Reads **only** `.virtual-context/<TASK_ID>.md` — never accesses the codebase directly
- Cites every claim with `file:line` references
- Expert AI conclusions are **cached back** into virtual context so the same question never pays twice

**Escalation block** (emitted when model switch is needed):

```
🔴 [Expert AI Escalation] — paid model required

I could not answer this confidently using the free model + virtual context.
Escalating to the Expert AI for deeper reasoning.

👉 Please switch the chat model to Claude Sonnet 4.6 Thinking, then resend this exact message.

How to switch:
  • Press ⇧⌘/ to open the model picker, or
  • Click the model name (bottom-left of chat input) and select "Claude Sonnet 4.6 Thinking".
```

---

## Cache Reuse Rule ("Never Pay Twice")

Once the user switches to `Claude Sonnet 4.6 Thinking` and Expert AI answers (caching its conclusions), subsequent questions on the **same topic** asked back on `SWE-1.6` use **Step 2 (cache read)** — they do NOT re-trigger Step 0 unless they introduce **new** deterministic-trigger phrases.

---

## Routing Table — Question Type → Route

| Question Type                                         | Default Model | Agent                    | Escalation                           |
| ----------------------------------------------------- | ------------- | ------------------------ | ------------------------------------ |
| General / factual ("what is X?")                      | 🆓 Free       | 🟢 Main AI Direct        | Never                                |
| Simple codebase question (free model knows)           | 🆓 Free       | 🟢 Main AI Direct        | Only if unsure                       |
| Codebase question needing a specific snippet          | 🆓 Free       | 🟡 Virtual Context (JIT) | Only if still unsure after JIT       |
| Deep reasoning / research beyond free model capacity  | 💰 Paid       | 🔴 Expert AI Escalation  | Triggered at Step 4                  |
| Frontend bug / UI issue                               | 🆓 Free       | 🛠️ Debug Frontend Issue  | Expert AI only if root cause unclear |
| Angular / React hook question                         | 🆓 Free       | 📘 Angular Hooks Skill   | Never                                |
| Writing / reviewing React components                  | 🆓 Free       | 📐 Frontend Guidelines   | Never                                |
| Git: initialize / branch / commit / remote / validate | 🆓 Free       | 🔧 Speckit Git Agents    | Never                                |

---

## Response Banners (Mandatory)

Every response **must** start with a color-coded `### H3` banner as the **very first line** — no preamble, no greeting before it.

| Banner                                                 | Meaning                                         |
| ------------------------------------------------------ | ----------------------------------------------- |
| `### 🟢 Main AI Assistant — Free Model, Direct Answer` | Free model answered from built-in knowledge     |
| `### 🟡 Virtual Context (JIT) — Cache Read`            | Answered from cached virtual context snippet    |
| `### 🟡 Virtual Context (JIT) — New Snippet Fetched`   | Fetched ≤300 lines, cached, free model answered |
| `### � Expert AI — Escalated (Paid Model)`             | Paid model invoked after escalation             |
| `### 🛠️ Debug Frontend Issue — Workflow Active`        | Frontend debug workflow running                 |
| `### 📘 Angular Hooks Skill — Active`                  | Angular Hooks skill invoked                     |

---

## Hard Rules

- **Free model first, always.** Every question starts on `SWE-1.6`.
- **Step 0 runs before everything.** Deterministic triggers bypass cache and fetch entirely.
- **Virtual context is JIT memory, not a codebase dump.** Fetch only the exact snippet needed (≤300 lines). Never wide searches or whole-file reads.
- **Read virtual context before fetching.** If `.virtual-context/<TASK_ID>.md` already has the snippet, use it.
- **Escalate to Expert AI only as last resort** — when free model + virtual context cannot answer.
- **Cache Expert AI answers** into virtual context so the same question never pays twice.
- **Model switching is user-driven.** The AI cannot change the active model programmatically; it only asks the user to switch at Step 4.
- `.virtual-context/*.md` files are **transient** — never commit them.
- Every response **must** begin with a routing banner.

---

## File References

| File                                     | Purpose                                                      |
| ---------------------------------------- | ------------------------------------------------------------ |
| `AGENTS.md`                              | Master agent routing manifest (source of truth)              |
| `.windsurf/workflows/ask-expert.md`      | Expert pipeline workflow definition                          |
| `.windsurf/skills/ask-expert/SKILL.md`   | Expert AI reasoning skill (`ask-expert-reasoning`)           |
| `.windsurf/rules/ask-expert-routing.md`  | Always-on routing rule with routing table                    |
| `.windsurf/skills/angular-hooks/`        | Angular Hooks beginner skill                                 |
| `.windsurf/rules/frontend-guidelines.md` | React component guidelines rule                              |
| `.windsurf/workflows/speckit.git.*.md`   | Git workflow agents (init, branch, commit, remote, validate) |
| `.virtual-context/<TASK_ID>.md`          | Transient per-question context snapshot (never committed)    |

---

## Examples

| Question                                    | Route                    | Steps Run      | Cost    |
| ------------------------------------------- | ------------------------ | -------------- | ------- |
| "What is Salesforce?"                       | 🟢 Main AI Direct        | Step 1 only    | 🆓 Free |
| "What testing framework does the app use?"  | 🟡 Virtual Context (JIT) | Steps 1 → 3    | 🆓 Free |
| "Tell me about the app's test config again" | 🟡 Virtual Context Cache | Step 2 only    | 🆓 Free |
| "Do a full refactor of the service layer"   | � Expert AI Escalation   | Step 0 → gate  | 💰 Paid |
| "How do I use useEffect?"                   | 📘 Angular Hooks Skill   | Skill only     | 🆓 Free |
| "My button is not rendering"                | 🛠️ Debug Frontend        | Debug workflow | 🆓 Free |
| "Audit entire codebase for issues"          | 🔴 Expert AI Escalation  | Step 0 → gate  | 💰 Paid |
