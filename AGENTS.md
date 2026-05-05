# AGENTS.md — Master Agent Routing Manifest

This file governs **automatic agent routing** for every user question.
No slash command or manual trigger is needed. The AI reads this file on every turn and routes accordingly.
**The free model handles everything by default. The paid Expert AI is only called when the free model cannot answer AND the virtual context lacks the needed knowledge.**

## Model Registry

| Tier    | Model                          | When to Use                                                                                                |
| ------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| 🆓 Free | **SWE-1.6**                    | **Default for everything** — general Qs, Git, hooks, guidelines, _and_ codebase/code Qs it can answer      |
| 💰 Paid | **Claude Sonnet 4.6 Thinking** | **Fallback only** — invoked when the free model is unsure AND virtual context lacks the needed JIT snippet |

---

## Automatic Pipeline — Free Model First, Expert AI as Fallback

**Core principle:** The free model (`SWE-1.6`) answers _every_ question by default — general, factual, Git, hooks, guidelines, AND codebase/code questions. It only escalates to the paid Expert AI when it cannot answer confidently **and** the virtual context does not already contain the needed knowledge.

### Virtual Context = Just-in-Time (JIT) Memory

Virtual context is **not** a codebase dump and **not** a wide search. It is a tiny, question-specific cache of the exact snippets needed to answer one question.

- **First time** a specific piece of knowledge is needed → fetch only that snippet (≤300 lines) into `.virtual-context/<TASK_ID>.md`.
- **Next time** the same/similar question appears → the free model reads the existing virtual context and answers directly, **no paid call**.
- Virtual context grows incrementally, one JIT snippet at a time.

### Decision Flow (per question)

**Step 0 (FIRST, before everything else): Deterministic Escalation Check.**
If the question matches ANY deterministic trigger (see **Expert AI Escalation Gate → Triggers A** below) AND the active model is not `Claude Sonnet 4.6 Thinking`, **immediately** emit the 🔴 escalation block and STOP. Do **not** check virtual context, do **not** fetch, do **not** answer — even if the answer is cached. This guarantees the gate is reproducible for testing and that complex questions never get stale free-model answers.

If Step 0 doesn't trigger, continue:

1. **Free model reads the question.** Can it answer with built-in knowledge alone? → Answer directly. **STOP.**
2. **Does virtual context already contain the needed snippet?** → Free model reads it, answers. **STOP.**
3. **Fetch a minimal JIT snippet** (≤300 lines, only the precise files/functions needed). Can the free model now answer? → Answer, save snippet to virtual context. **STOP.**
4. **Only if the free model is still unsure** → escalate to the paid Expert AI (Trigger B). Expert AI reasons over the virtual context, returns a distilled answer, and its conclusions are written back into virtual context so future similar questions skip the paid call.

**Cache reuse rule for escalated questions:** Once the user has switched to `Claude Sonnet 4.6 Thinking` and Expert AI has answered (and cached its conclusions), **subsequent questions on the same/similar topic asked back on `SWE-1.6` use Step 2 (cache read)** — they do NOT re-trigger Step 0 unless they introduce new deterministic-trigger phrases. This is the "never pay twice" guarantee.

> **⚠️ Important — Model switching is user-driven.**
> The AI **cannot** programmatically change the active chat model. The model is selected by the user via the model picker (`⇧⌘/` or the model name button next to the chat input). The AI only asks the user to switch models when it reaches Step 4 (escalation) — see **Expert AI Escalation Gate** below.

### Expert AI Escalation Gate (Step 4 only)

This gate triggers in TWO situations — **either is sufficient**:

**A. Deterministic triggers (MUST escalate, no exceptions):**
The question matches ANY of the following — the AI must escalate even if it feels it can answer:

- Phrases: _"audit entire"_, _"audit all"_, _"full refactor"_, _"refactor plan"_, _"architectural review"_, _"architectural audit"_, _"deep analysis"_, _"deep dive into"_, _"comprehensive review"_, _"end-to-end review"_, _"migration strategy"_, _"propose a refactor"_, _"identify all bugs"_, _"find all issues"_, _"trade-offs and migration"_.
- Scope: question requires reading **more than 3 distinct files** to answer correctly.
- Intent: question asks for **architectural changes**, **multi-file refactors**, **performance audits across the codebase**, or **dependency-graph-impact analysis**.
- Explicit user request: question contains _"use Expert AI"_, _"use the paid model"_, or _"escalate this"_.

**B. Confidence trigger (fallback):**
The free model + virtual context cannot answer confidently after Steps 1–3.

If EITHER A or B is true AND the active chat model is not `Claude Sonnet 4.6 Thinking`, the AI MUST stop and reply with exactly this block (no other content):

```
🔴 [Expert AI Escalation] — paid model required

I could not answer this confidently using the free model + virtual context.
Escalating to the Expert AI for deeper reasoning.

👉 Please switch the chat model to **Claude Sonnet 4.6 Thinking**, then resend this exact message.

How to switch:
  • Press ⇧⌘/ to open the model picker, or
  • Click the model name (bottom-left of the chat input) and select "Claude Sonnet 4.6 Thinking".
```

After the user resends on the paid model, Expert AI reasons over the virtual context and its answer is cached so the same question never needs the paid model again.

```
User Question
     │
     ▼
┌──────────────────────────────────────────────────────┐
│  🟢 STEP 1 — Free model reads the question  [🆓 FREE] │
│  Can I answer from built-in knowledge alone?          │
└───────────┬──────────────────────────────┬───────────┘
            │ YES                          │ NO
            ▼                              ▼
     Answer directly            ┌──────────────────────────────────────┐
     [🆓 FREE] STOP.            │  🟡 STEP 2 — Check virtual context   │
                                │  Does .virtual-context/* already     │
                                │  contain the needed snippet?  [🆓]   │
                                └───────┬──────────────────────┬───────┘
                                        │ YES                  │ NO
                                        ▼                      ▼
                                Answer from cached     ┌──────────────────────────┐
                                virtual context        │  � STEP 3 — JIT fetch   │
                                [🆓 FREE] STOP.        │  Pull ≤300 lines of the  │
                                                       │  exact snippet needed    │
                                                       │  → save to virtual ctx   │
                                                       │                   [🆓]   │
                                                       └───────┬──────────────────┘
                                                               │
                                                               ▼
                                              Can the free model now answer?
                                                       │                 │
                                                      YES               NO
                                                       │                 │
                                                       ▼                 ▼
                                               Answer + cache   ┌──────────────────────────┐
                                               [🆓 FREE] STOP.  │  � STEP 4 — Escalate to │
                                                                │  paid Expert AI          │
                                                                │  (model switch gate)     │
                                                                │  Expert reasons over     │
                                                                │  virtual ctx, result     │
                                                                │  cached for next time.   │
                                                                │                   [💰]   │
                                                                └──────────────────────────┘
```

---

## Routing Table — Question Type → Agent

| Question / Task Type                                                     | Default Model | Agent                    | Escalation                                                             |
| ------------------------------------------------------------------------ | ------------- | ------------------------ | ---------------------------------------------------------------------- |
| General / factual knowledge ("what is X?")                               | 🆓 Free       | 🟢 Main AI Direct        | Never escalates                                                        |
| Simple codebase / code question (free model already knows)               | 🆓 Free       | 🟢 Main AI Direct        | Escalates only if free model is unsure                                 |
| Codebase question requiring a specific snippet                           | 🆓 Free       | 🟡 Virtual Context (JIT) | Free model reads JIT snippet, answers. Escalates only if still unsure. |
| Deep reasoning / research that free model + virtual ctx cannot handle    | 💰 Paid       | � Expert AI Escalation   | Triggered only at Step 4                                               |
| Frontend bug / UI issue                                                  | 🆓 Free       | 🛠️ Debug Frontend Issue  | Escalates to Expert AI only if root cause is unclear after JIT fetch   |
| Angular or React hook question (`useState`, `useEffect`, `useRef`, etc.) | 🆓 Free       | 📘 Angular Hooks Skill   | Never escalates                                                        |
| Writing / reviewing React functional components                          | 🆓 Free       | 📐 Frontend Guidelines   | Never escalates                                                        |
| Git: initialize / branch / commit / remote / validate                    | 🆓 Free       | 🔧 Speckit Git Agents    | Never escalates                                                        |

---

## Agent Definitions

### 🟢 Main AI Assistant

**File:** (built-in)
**Runs:** Steps 1, 2, 4 — always.
Understands the question, fetches targeted context, and delivers the final synthesized answer.
**Badge:** `🟢 [Main AI Assistant]`

---

### 🟡 Virtual Context — Just-in-Time Memory

**Runs:** Steps 2 & 3 of the pipeline. **Only fetches highly specific snippets — never whole files, never wide searches.**

- Step 2: _Read_ from existing `.virtual-context/<TASK_ID>.md` if the snippet is already cached.
- Step 3: _Write_ a new ≤300-line JIT snippet if nothing cached yet.
- Grows incrementally: each question adds only the precise knowledge it needed.
- Acts as a cache so follow-up questions on the same topic skip the paid Expert AI.
  **Badge:** `🟡 [Virtual Context] — JIT snippet fetch / cache read…`

---

### � Expert AI (Smart Friend) — Fallback Only

**Skill:** `.windsurf/skills/ask-expert/SKILL.md` — name: `ask-expert-reasoning`
**Rule:** `.windsurf/rules/ask-expert-routing.md`
**Workflow:** `.windsurf/workflows/ask-expert.md`
**Runs:** Step 4 — **only when the free model + virtual context cannot answer confidently.** Reasons exclusively over the virtual context file; never reads the codebase directly. Its conclusions are written back into virtual context so the same question never hits the paid model twice.
**Badge:** `� [Expert AI] — escalated reasoning over virtual context…`

---

### 🛠️ Debug Frontend Issue

**Workflow:** `.windsurf/workflows/debug-frontend-issue.md`
**Triggers:** User reports a frontend bug, broken UI, or broken component.
Steps: understand bug → locate files → identify root cause → apply fix → output debug summary.

---

### 📘 Angular Hooks Skill

**Skill:** `.windsurf/skills/angular-hooks/SKILL.md` — name: `angular-hooks-for-beginners`
**Triggers:** Any question mentioning a hook by name (`useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`, custom hooks, Rules of Hooks).
Prefers this skill over general knowledge always.

---

### 📐 Frontend Guidelines Rule

**Rule:** `.windsurf/rules/frontend-guidelines.md`
**Triggers:** Writing or reviewing React functional components (even without explicit ask).
Enforces: functional components, TypeScript, one component per file, PascalCase, no unnecessary re-renders.

---

### 🔧 🌿 💾 🔗 ✅ Speckit Git Agents

**Trigger:** Any Git-related task (init, branch, commit, remote, validate).
Each maps 1:1 to a workflow in `.windsurf/workflows/speckit.git.*.md`.

---

## Routing Badges — MANDATORY Top-Of-Response Banner

**Every single response MUST begin with a color-coded banner on the very first line** — no preamble, no greeting, no other text before it. The banner tells the user at a glance which agent ran.

### Required banner format

The banner is a **Markdown H3 heading** so it renders large and visible, followed by a one-line italic description. Use EXACTLY one of these:

```markdown
### 🟢 Main AI Assistant — Free Model, Direct Answer

_Answered from built-in knowledge. No virtual context touched. No paid model._
```

```markdown
### 🟡 Virtual Context (JIT) — Cache Read

_Answered using a snippet already cached in `.virtual-context/<TASK_ID>.md`. No re-fetch, no paid model._
```

```markdown
### 🟡 Virtual Context (JIT) — New Snippet Fetched

_Fetched a ≤300-line snippet from the codebase and cached it. Free model answered._
```

```markdown
### 🔴 Expert AI — Escalated (Paid Model)

_Free model + virtual context were insufficient. Claude Sonnet 4.6 Thinking reasoned over virtual context. Answer cached for future reuse._
```

```markdown
### 🛠️ Debug Frontend Issue — Workflow Active

_Running `.windsurf/workflows/debug-frontend-issue.md`._
```

```markdown
### 📘 Angular Hooks Skill — Active

_Using `.windsurf/skills/angular-hooks/SKILL.md` for a beginner-friendly explanation._
```

### Banner → Meaning at a glance

| Color     | Agent             | What happened                                                   |
| --------- | ----------------- | --------------------------------------------------------------- |
| 🟢 Green  | Main AI Assistant | Free model answered directly from built-in knowledge            |
| 🟡 Yellow | Virtual Context   | JIT snippet fetched or cached snippet reused (still free model) |
| 🔴 Red    | Expert AI         | Paid Claude Sonnet 4.6 Thinking invoked after escalation        |
| 🛠️ Tool   | Debug Frontend    | Frontend debug workflow active                                  |
| 📘 Book   | Angular Hooks     | Angular Hooks skill active                                      |

### Strict rules for the banner

- MUST be the **first line** of the response. Nothing before it — no whitespace, no greeting.
- MUST be an `### H3 heading` with the colored emoji + agent name.
- MUST be followed by a one-line italic description explaining what happened.
- If multiple agents ran in sequence (e.g., Virtual Context → Main AI), show the **final/dominant** agent in the banner, and mention the others briefly in the description.
- For escalation gate responses (Step 4, awaiting model switch), use the 🔴 banner followed ONLY by the escalation block — no other content.

---

## Hard Rules

- **MANDATORY:** Every response MUST start with the color-coded `### H3` banner described in **Routing Badges**. No preamble before the banner, ever.
- **Free model first, always.** Every question starts on `SWE-1.6`, including codebase/code questions.
- **Virtual context is JIT memory, not a codebase dump.** Fetch only the exact snippet needed (≤300 lines). Never do wide searches or whole-file reads.
- **Read virtual context before fetching.** If `.virtual-context/<TASK_ID>.md` already contains the needed snippet, use it — do not re-fetch.
- **Escalate to Expert AI only as a last resort** — when the free model + virtual context cannot answer confidently. Trigger the model-switch gate at that point, not before.
- **Cache Expert AI answers** back into virtual context so the same question never pays twice.
- **Always** use the Angular Hooks skill for hook questions — never use general knowledge.
- **Always** apply frontend guidelines when writing/reviewing React components.
- Virtual context files (`.virtual-context/*.md`) are transient — never commit them.
