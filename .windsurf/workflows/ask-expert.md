---
description: Route a focused codebase question to Devin as an Expert AI with curated context, then compose the final answer.
---

# Ask Expert

Delegate a targeted codebase question to Devin CLI with only the relevant context — no full-repo exploration on the Devin side.

## When to use

- Architectural or cross-cutting questions that benefit from a second reasoning pass
- Questions where you want an answer grounded in specific code snippets, not a hallucinated summary
- Any question the user explicitly prefixes with `@expert` or asks to "run through Devin"

## Steps

### 1 — Parse the question

Read the user's question. Extract:
- **Key symbols**: function names, class names, file names, config keys mentioned
- **Intent**: what is being asked (explain / debug / refactor / compare / …)
- **Scope**: which directory or layer is most relevant (e.g. `src/`, `scripts/`, root config files)

### 2 — Collect targeted context

Run `grep`/`rg`/`read` — do NOT read the whole repo. Pull only what is directly relevant:

```bash
# find definition of a symbol
rg -n "functionName" --type ts -l

# read a specific file or range
# (use line-offset reads for large files)

# find usages
rg -n "symbolName" src/ --type ts
```

Collect at most **~300 lines** total across all snippets. Include file paths and line numbers with every excerpt.

### 3 — Generate a task ID

```bash
TASK_ID=$(date +%Y%m%d-%H%M%S)
```

### 4 — Write the virtual-context file

Create `.virtual-context/${TASK_ID}.md` with this structure:

```markdown
# Expert Task: <one-line restatement of the question>

## Question

<exact user question, verbatim>

## Relevant Code Snippets

### <file-path>:<start-line>-<end-line>

\`\`\`<lang>
<snippet>
\`\`\`

### <next-file-path> …

…

## Instructions

Answer the question above using only the snippets provided. Be precise and concise.
If the snippets are insufficient to answer definitively, say so and state what additional
file/symbol would resolve the ambiguity.
```

### 5 — Invoke Devin

```bash
./scripts/ask-expert.sh "$TASK_ID"
```

Capture stdout as `EXPERT_RESPONSE`.

### 6 — Compose and present the answer

Synthesize `EXPERT_RESPONSE` with your own understanding. Present:
1. **Direct answer** to the user's question
2. **Evidence** — cite specific file:line references from the snippets
3. **Caveats** — anything Devin flagged as uncertain or needing more context

Do not just paste Devin's raw output. Integrate it.

## Output template

```
Expert Answer

Question: <one-line restatement>
Task ID:  <TASK_ID>  (context saved to .virtual-context/<TASK_ID>.md)

<synthesized answer with file:line citations>

Confidence: high / medium / low — <reason>
```
