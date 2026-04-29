---
trigger: always
description: General/factual questions → Main AI direct (free). Codebase-specific/complex questions → full 4-step pipeline (paid Expert AI).
---

# Ask Expert Routing Rule

Plain natural language only. No prefix. No command. Route based on question type — general questions stay on the free model, complex/codebase questions escalate to the paid Expert AI pipeline.

## Routing Table

Specific routes take priority. Check question type first — general/factual questions never reach the paid Expert AI.

| Question / Task Type                               | Model   | Agent                       | Badge                                                                   | Reference                                       |
| -------------------------------------------------- | ------- | --------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
| **General / factual** ("what is X?")               | 🆓 Free | 🟢 Main AI Direct           | `🟢 [Main AI Assistant] — general knowledge, no codebase access needed` | _(answer directly, skip Steps 2–3)_             |
| Frontend bug / UI issue                            | 💰 Paid | 🛠️ Debug Frontend Issue     | `🛠️ [Debug Frontend Issue] — running debug workflow…`                   | `.windsurf/workflows/debug-frontend-issue.md`   |
| Angular / React hook question                      | 🆓 Free | 📘 Angular Hooks Skill      | `📘 [Angular Hooks Skill] — explaining hook…`                           | `.windsurf/skills/angular-hooks/SKILL.md`       |
| Writing / reviewing React components               | 🆓 Free | 📐 Frontend Guidelines      | `📐 [Frontend Guidelines] — reviewing component…`                       | `.windsurf/rules/frontend-guidelines.md`        |
| Git: initialize repo                               | 🆓 Free | 🔧 Git Initialize           | `🔧 [Git Initialize] — setting up repo…`                                | `.windsurf/workflows/speckit.git.initialize.md` |
| Git: create feature branch                         | 🆓 Free | 🌿 Git Feature              | `🌿 [Git Feature] — creating branch…`                                   | `.windsurf/workflows/speckit.git.feature.md`    |
| Git: commit                                        | 🆓 Free | 💾 Git Commit               | `💾 [Git Commit] — committing changes…`                                 | `.windsurf/workflows/speckit.git.commit.md`     |
| Git: detect remote                                 | 🆓 Free | 🔗 Git Remote               | `🔗 [Git Remote] — detecting remote…`                                   | `.windsurf/workflows/speckit.git.remote.md`     |
| Git: validate branch                               | 🆓 Free | ✅ Git Validate             | `✅ [Git Validate] — validating branch…`                                | `.windsurf/workflows/speckit.git.validate.md`   |
| **Codebase / complex / deep reasoning** (fallback) | 💰 Paid | 🔵 Full Ask Expert Pipeline | _(see pipeline badges below)_                                           | `.windsurf/workflows/ask-expert.md`             |

## Ask Expert Pipeline

Runs only for **codebase-specific, complex, or deep-reasoning questions**. General/factual questions never enter this pipeline. Start each step with its badge.

```
[User Question]
      │
      ▼
Step 1 — 🟢 [Main AI Assistant] — understanding question…
      │
      ├─ General / factual? ──► Answer directly (FREE model). STOP. Steps 2–3 skipped.
      │
      ▼ (codebase / complex only)
Step 2 — 🟡 [Virtual Context] — fetching relevant snippets…
         Fetch ≤300 lines → write .virtual-context/<TASK_ID>.md
      │
      ▼
Step 3 — 🔵 [Expert AI] — reasoning over virtual context… (PAID model)
      │
      ▼
Step 4 — 🟢 [Main AI Assistant] — delivering final answer…
```

## Hard Rules

- **General/factual questions** → answer directly with `🟢 [Main AI Assistant]` badge — **never** invoke Steps 2 or 3 (no paid model).
- **Codebase/complex questions** → always run the full 4-step pipeline (paid Expert AI at Step 3).
- **Never create `.virtual-context` files** for general knowledge questions — codebase questions only.
- **Always** apply Frontend Guidelines when writing or reviewing React components, even inside the pipeline.
- `.virtual-context/*.md` files are transient — never commit them.
