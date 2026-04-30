# AGENTS.md — Master Agent Routing Manifest

This file governs **automatic agent routing** for every user question.
No slash command or manual trigger is needed. The AI reads this file on every turn and routes accordingly.
**General questions → 🟢 Main AI Direct (no paid model). Complex/codebase questions → full 4-step pipeline.**

---

## Automatic Pipeline — Always On

Questions are routed based on type. **General/factual questions skip Steps 2 & 3** (no paid model used). Only codebase-specific, technical, or complex questions run the full 4-step pipeline:

```
User Question
     │
     ▼
┌─────────────────────────────────────────────────┐
│  🟢 STEP 1 — Main AI Understands the Question   │
│  Extract: intent, key symbols, scope    [🆓 FREE]│
└─────────────────────┬───────────────────────────┘
                      │ (always continue — no shortcuts)
                      ▼
┌─────────────────────────────────────────────────┐
│  🟡 STEP 2 — Fetch Only What Is Needed          │
│  Write Virtual Context              [🆓 FREE]    │
│  (.virtual-context/<TASK_ID>.md)                │
└─────────────────────┬───────────────────────────┘
                      │ (codebase/complex questions only)
                      ▼
┌─────────────────────────────────────────────────┐
│  🔵 STEP 3 — Expert AI Reasons Over Context     │
│  Skill: ask-expert-reasoning        [💰 PAID]    │
└─────────────────────┬───────────────────────────┘
                      │ (always continue)
                      ▼
┌─────────────────────────────────────────────────┐
│  🟢 STEP 4 — Main AI Delivers Final Answer      │
│                                         [🆓 FREE]│
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
               [Answer to User]
```

---

## Routing Table — Question Type → Agent

| Question / Task Type                                                     | Agent                       | Reference                                       |
| ------------------------------------------------------------------------ | --------------------------- | ----------------------------------------------- |
| General / factual knowledge question                                     | 🟢 Main AI Direct           | Steps 2–3 skipped, no paid model                |
| Any question (all types)                                                 | 🔵 Full Ask Expert Pipeline | Always Steps 1 → 2 → 3 → 4                      |
| Codebase-specific / explain code / deep reasoning                        | 🔵 Ask Expert Pipeline      | `.windsurf/workflows/ask-expert.md`             |
| Frontend bug / UI issue                                                  | 🛠️ Debug Frontend Issue     | `.windsurf/workflows/debug-frontend-issue.md`   |
| Angular or React hook question (`useState`, `useEffect`, `useRef`, etc.) | 📘 Angular Hooks Skill      | `.windsurf/skills/angular-hooks/SKILL.md`       |
| Writing / reviewing React functional components                          | 📐 Frontend Guidelines      | `.windsurf/rules/frontend-guidelines.md`        |
| Git: initialize repo                                                     | 🔧 Git Initialize           | `.windsurf/workflows/speckit.git.initialize.md` |
| Git: create feature branch                                               | 🌿 Git Feature              | `.windsurf/workflows/speckit.git.feature.md`    |
| Git: commit after Spec Kit command                                       | 💾 Git Commit               | `.windsurf/workflows/speckit.git.commit.md`     |
| Git: detect remote URL                                                   | 🔗 Git Remote               | `.windsurf/workflows/speckit.git.remote.md`     |
| Git: validate branch naming                                              | ✅ Git Validate             | `.windsurf/workflows/speckit.git.validate.md`   |

---

## Agent Definitions

### 🟢 Main AI Assistant

**File:** (built-in)
**Runs:** Steps 1, 2, 4 — always.
Understands the question, fetches targeted context, and delivers the final synthesized answer.
**Badge:** `🟢 [Main AI Assistant]`

---

### 🟡 Virtual Context

**Runs:** Step 2 — always, every question.
Collects ≤300 lines of relevant snippets (or notes general knowledge source) and writes them to `.virtual-context/<TASK_ID>.md`.
**Badge:** `🟡 [Virtual Context] — fetching relevant code snippets…`

---

### 🔵 Expert AI (Smart Friend)

**Skill:** `.windsurf/skills/ask-expert/SKILL.md` — name: `ask-expert-reasoning`
**Rule:** `.windsurf/rules/ask-expert-routing.md`
**Workflow:** `.windsurf/workflows/ask-expert.md`
**Runs:** Step 3 — always, every question.
Reasons exclusively over the virtual context file. Never reads the codebase directly.
**Badge:** `🔵 [Expert AI] — reasoning over virtual context…`

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

## Routing Badges — Always Start Response With One

Every response MUST begin with one of these routing badges so the user can see which path ran:

| Badge                                                                   | Meaning                               |
| ----------------------------------------------------------------------- | ------------------------------------- |
| `🟢 [Main AI Assistant] — general knowledge, no codebase access needed` | Direct answer, Steps 2–3 skipped      |
| `🟡 [Virtual Context] — fetching relevant code snippets…`               | Building virtual context (Step 2)     |
| `🔵 [Expert AI] — reasoning over virtual context…`                      | Expert reasoning in progress (Step 3) |
| `🛠️ [Debug Frontend Issue] — running debug workflow…`                   | Frontend debug workflow active        |
| `📘 [Angular Hooks Skill] — beginner-friendly hook explanation…`        | Angular Hooks skill active            |

---

## Hard Rules

- **Always** start with a routing badge.
- **General/factual questions** → answer directly with `🟢 [Main AI Assistant]` badge — **do NOT invoke Steps 2 or 3** (no paid model).
- **Codebase-specific, technical, or complex questions** → run the full 4-step pipeline (Steps 1 → 2 → 3 → 4).
- **Always** use the Angular Hooks skill for hook questions — never use general knowledge.
- **Always** apply frontend guidelines when writing/reviewing React components.
- Virtual context files (`.virtual-context/*.md`) are transient — never commit them.
