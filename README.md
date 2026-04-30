# Ask Expert Agent — Workflow & Documentation

## Overview

An **automatic AI routing system** built into Windsurf. Every user question is classified and routed to the correct agent path — no slash commands, no manual steps.

---

## Agent Tiers

| Badge | Agent                 | Model Cost | Role                                                      |
| ----- | --------------------- | ---------- | --------------------------------------------------------- |
| 🟢    | **Main AI Assistant** | 🆓 Free    | Parses questions, fetches context, delivers final answers |
| 🟡    | **Virtual Context**   | 🆓 Free    | Builds a ≤300-line snapshot of relevant codebase code     |
| 🔵    | **Expert AI**         | 💰 Paid    | Deep reasoning over the virtual context snapshot          |

---

## Routing Decision

```
User Question
      │
      ▼
  ┌─────────────────────────────────────┐
  │  Is this a general / factual        │
  │  question? ("what is X?")           │
  └────────────┬──────────┬──────────-──┘
               │ YES       │ NO
               ▼           ▼
        🟢 Answer      Full 4-Step
         directly       Pipeline
        (FREE, stop)    (see below)
```

### Question Type → Route

| Question Type                        | Route                      | Cost    |
| ------------------------------------ | -------------------------- | ------- |
| General / factual ("what is X?")     | 🟢 Main AI Direct          | 🆓 Free |
| Codebase-specific / explain code     | 🔵 Full Expert Pipeline    | 💰 Paid |
| Frontend bug / broken UI             | 🛠️ Debug Frontend Workflow | 💰 Paid |
| Angular / React hook question        | 📘 Angular Hooks Skill     | 🆓 Free |
| Writing / reviewing React components | 📐 Frontend Guidelines     | 🆓 Free |
| Git: initialize repo                 | 🔧 Git Initialize workflow | 🆓 Free |
| Git: create feature branch           | 🌿 Git Feature workflow    | 🆓 Free |
| Git: commit changes                  | 💾 Git Commit workflow     | 🆓 Free |
| Git: detect remote URL               | 🔗 Git Remote workflow     | 🆓 Free |
| Git: validate branch name            | ✅ Git Validate workflow   | 🆓 Free |

---

## Full 4-Step Expert Pipeline

Runs only for **codebase-specific, complex, or deep-reasoning questions**.

```
[User Question]
      │
      ▼
╔══════════════════════════════════════════════╗
║  STEP 1 — 🟢 Main AI Assistant  [🆓 FREE]     ║
║                                              ║
║  Parse intent, symbols, and scope            ║
║                                              ║
║  ├─ General/factual? → Answer now. STOP.     ║
║  └─ Codebase/complex? → Continue ↓           ║
╚══════════════════════════════════════════════╝
                      │
                      ▼
╔══════════════════════════════════════════════╗
║  STEP 2 — 🟡 Virtual Context  [🆓 FREE]       ║
║                                              ║
║  Run targeted code_search / read_file        ║
║  Collect ≤300 lines of relevant snippets     ║
║  Write → .virtual-context/<TASK_ID>.md       ║
╚══════════════════════════════════════════════╝
                      │ feeds context
                      ▼
╔══════════════════════════════════════════════╗
║  STEP 3 — 🔵 Expert AI  [💰 PAID]             ║
║                                              ║
║  Skill: ask-expert-reasoning                 ║
║  Reads ONLY the virtual context file         ║
║  Does NOT access codebase directly           ║
║  Cites every claim with file:line refs       ║
╚══════════════════════════════════════════════╝
                      │ expert answer
                      ▼
╔══════════════════════════════════════════════╗
║  STEP 4 — 🟢 Main AI Assistant  [🆓 FREE]     ║
║                                              ║
║  Synthesize + deliver final answer           ║
║  Include file:line citations                 ║
╚══════════════════════════════════════════════╝
                      │
                      ▼
               [Answer to User]
```

---

## Step-by-Step Details

### Step 1 — Parse the Question · 🟢 Main AI (FREE)

Extracts:

- **Intent** — explain / debug / refactor / compare
- **Key symbols** — function names, class names, file names
- **Scope** — which directory or layer is relevant

**Decision gate:**

- General/factual → answer directly, **STOP** (Steps 2–3 never run)
- Codebase/complex → proceed to Step 2

---

### Step 2 — Build Virtual Context · 🟡 (FREE)

Runs targeted searches and reads only what is needed:

```bash
TASK_ID=$(date +%Y%m%d-%H%M%S)
mkdir -p .virtual-context
# file written → .virtual-context/<TASK_ID>.md
```

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

### Step 3 — Expert AI Reasoning · 🔵 (PAID)

- **Skill invoked:** `ask-expert-reasoning`
- Reads **only** `.virtual-context/<TASK_ID>.md`
- Never accesses the codebase directly
- Cites every claim with `file:line` references
- If context is insufficient → names the **single** missing file, does not request everything

**Output format from Expert AI:**

```
### Expert Answer
<direct answer>

### Evidence
<file:line citations>

### Gaps (if any)
<single missing file or symbol>
```

---

### Step 4 — Deliver Final Answer · 🟢 Main AI (FREE)

Synthesizes the expert reasoning into a clean response:

1. Direct answer to the user's question
2. Evidence — `file:line` citations for codebase questions
3. Confidence level: high / medium / low

---

## Hard Rules

- **General/factual questions** — always `🟢 Main AI` direct. Steps 2–3 **never** run. No paid model used.
- **Codebase/complex questions** — always full 4-step pipeline. Expert AI **always** runs at Step 3.
- `.virtual-context/*.md` files are **transient** — never commit them.
- Expert AI **never** reads the codebase directly — only the virtual context file.
- Every response **must** begin with a routing badge.

---

## Response Routing Badges

Every response starts with one of these to show which path ran:

| Badge                                                                   | Meaning                                     |
| ----------------------------------------------------------------------- | ------------------------------------------- |
| `🟢 [Main AI Assistant] — general knowledge, no codebase access needed` | Direct answer, Steps 2–3 skipped (free)     |
| `🟡 [Virtual Context] — fetching relevant code snippets…`               | Building virtual context (Step 2, free)     |
| `🔵 [Expert AI] — reasoning over virtual context…`                      | Expert reasoning in progress (Step 3, paid) |
| `🛠️ [Debug Frontend Issue] — running debug workflow…`                   | Frontend debug workflow active              |
| `📘 [Angular Hooks Skill] — beginner-friendly hook explanation…`        | Angular Hooks skill active (free)           |

---

## File References

| File                                    | Purpose                                                   |
| --------------------------------------- | --------------------------------------------------------- |
| `.windsurf/workflows/ask-expert.md`     | Main pipeline workflow definition                         |
| `.windsurf/skills/ask-expert/SKILL.md`  | Expert AI reasoning skill (`ask-expert-reasoning`)        |
| `.windsurf/rules/ask-expert-routing.md` | Always-on routing rule with routing table                 |
| `AGENTS.md`                             | Master agent routing manifest                             |
| `.virtual-context/<TASK_ID>.md`         | Transient per-question context snapshot (never committed) |

---

## Real Example

| Question                            | Route                  | Steps Run           | Cost    |
| ----------------------------------- | ---------------------- | ------------------- | ------- |
| "What is Salesforce?"               | 🟢 Main AI Direct      | Step 1 only         | 🆓 Free |
| "What does AddExpenseComponent do?" | 🔵 Expert Pipeline     | Steps 1 → 2 → 3 → 4 | 💰 Paid |
| "How do I use useEffect?"           | 📘 Angular Hooks Skill | Skill only          | 🆓 Free |
| "My button is not rendering"        | 🛠️ Debug Frontend      | Debug workflow      | 💰 Paid |
