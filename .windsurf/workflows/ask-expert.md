---
description: General/factual questions → Main AI direct (free model). Codebase/complex questions → full 4-step pipeline (paid Expert AI at Step 3). No slash command needed.
auto_execution_mode: 2
---

# Ask Expert Pipeline

Route based on question type. General/factual questions are answered directly by the free Main AI model (Steps 2–3 skipped). Codebase-specific or complex questions run all 4 steps, invoking the paid Expert AI at Step 3.

## Benefits

- **Structured answers** — evidence-grounded responses every time
- **Automatic** — pipeline fires on every question, no manual steps
- **Efficient** — Virtual Context is only written when codebase data is needed
- **Scalable** — never reads more than ≤300 lines regardless of codebase size
- **Focused** — Expert AI receives only what is relevant, nothing more

## Model Tiers

| Tier | Model       | Role                  | Responsibility                                                            | Active in                        |
| ---- | ----------- | --------------------- | ------------------------------------------------------------------------- | -------------------------------- |
| 🟢   | 🆓 **Free** | **Main AI Assistant** | Understands question, fetches context, delivers answer                    | Steps 1, 2, 4                    |
| 🟡   | 🆓 **Free** | **Virtual Context**   | On-demand knowledge layer written from codebase data                      | Step 2 (codebase questions only) |
| 🔵   | 💰 **Paid** | **Expert AI**         | Deep reasoning over fetched context — only for complex/codebase questions | Step 3                           |

## Pipeline Flow

```
[User Question]
      │
      ▼
┌─────────────────────────────────────────┐
│  🟢 Main AI Assistant  [🆓 FREE]           │
│                                         │
│  Step 1 — Parse the question            │
│  ├─ General/factual? ──► Answer now.    │
│  └─ Complex/codebase? ─► Continue ↓      │
└────────────────────┴────────────────────┘
                     │ (codebase/complex only)
┌─────────────────────────────────────────┐
│  🟢 Main AI Assistant  [🆓 FREE]           │
│                                         │
│  Step 2 — Fetch relevant code/data      │
└────────────────────┴────────────────────┘
                     │ writes ≤300 lines
                     ▼
            ┌──────────────────┐
            │  🟡 Virtual      │
            │     Context      │
            └────────┴─────────┘
                     │ feeds just-in-time
                     ▼
┌─────────────────────────────────────────┐
│  🔵 Expert AI  [💰 PAID]                   │
│                                         │
│  Step 3 — Reason over fetched context   │
└────────────────────┴────────────────────┘
                     │ expert answer
                     ▼
┌─────────────────────────────────────────┐
│  🟢 Main AI Assistant  [🆓 FREE]           │
│                                         │
│  Step 4 — Synthesize and deliver        │
└────────────────────┴────────────────────┘
                     │
                     ▼
              [Answer to User]
```

## Steps

### Step 1 — Parse the Question · 🟢 Main AI (FREE)

Extract from the question:

- **Intent**: explain / debug / refactor / compare / …
- **Key symbols**: function names, class names, file names mentioned
- **Scope**: which directory or layer is relevant

**Decision gate:**

- General / factual question (no codebase needed)? → **Answer directly. STOP. Do NOT proceed to Steps 2 or 3.** (free model)
- Codebase-specific / complex / deep reasoning? → Proceed to Step 2.

### Step 2 — Fetch Code/Data · 🟢 Main AI (FREE) · _codebase questions only_

**Codebase question** → run targeted searches, fetch ≤300 lines, write `.virtual-context/<TASK_ID>.md`:

```bash
TASK_ID=$(date +%Y%m%d-%H%M%S)
mkdir -p .virtual-context
```

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

**General knowledge question** → no file is created. Do NOT proceed to Step 3 — answer directly.

### Step 3 — Reason over Context · 🔵 Expert AI (PAID) · _codebase questions only_

Invoke the `ask-expert-reasoning` skill. Expert AI receives only the Virtual Context and reasons over it. Never accesses the codebase directly. **Never invoke for general/factual questions.**

### Step 4 — Deliver Final Answer · 🟢 Main AI (FREE)

Synthesize the expert answer:

1. **Direct answer** to the question
2. **Evidence** — cite `file:line` references (for codebase questions)
3. **Confidence**: high / medium / low
