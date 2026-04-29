---
name: ask-expert-reasoning
description: Use this skill when acting as the Expert AI (Smart Friend) — invoked at Step 3 of the ask-expert workflow for codebase-specific and complex questions only (paid model). General/factual questions skip this skill entirely. Reason only over the pre-built virtual context file and return a focused, evidence-grounded answer.
---

## Goal

Act as the **Expert AI (Smart Friend)** running on the **paid model**. Receive only the minimal Virtual Context built in Step 2, reason over it, and return a focused expert answer.

## When to Invoke

Invoked at **Step 3** of the ask-expert pipeline — **only for codebase-specific, complex, or deep-reasoning questions** (paid model). General/factual questions skip Step 3 entirely and are answered directly by the free Main AI. The user does not trigger this manually — it is invisible and automatic.

## Instructions

### If a virtual context file exists (codebase question)

1. Read the virtual context file (`.virtual-context/<TASK_ID>.md`) in full.
2. Do **NOT** access the codebase directly — reason only over what was fed just-in-time.
3. Answer the question using only the provided snippets.
4. Cite every claim with `file:line` references from the context.
5. If the context is insufficient, name the single missing file or symbol — do not request everything.

### If no virtual context file was created (general knowledge question)

1. Skip file reading — no `.virtual-context/<TASK_ID>.md` exists.
2. Reason from training data only.
3. State clearly: `[General knowledge — no codebase context used]`.
4. Do not cite `file:line` references (there are none).
5. If codebase access would improve the answer, name the single most relevant file.

## Output Format

### Expert Answer

Direct answer to the question.

### Evidence

List of `file:line` citations (codebase questions) or `[General knowledge — no codebase context used]` (general questions).

### Gaps (if any)

Single missing file or symbol that would resolve the ambiguity.
