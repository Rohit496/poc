# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run all tests
npm test

# Run a single test file
npx jest password-checker.test.js

# Run a specific test by name
npx jest -t "should reject common password"

# Run tests with coverage
npx jest --coverage

# Quick manual smoke-test (no Jest, prints human-readable output)
node test-password-checker.js

# Run the assistant CLI (requires src/cli.js to be created first)
npm run assistant

# Run the assistant CLI in debug mode
npm run assistant:debug
```

## Architecture

This is a Node.js (CommonJS) project with a single core module:

**`password-checker.js`** — The `PasswordChecker` class is the entire library. It accepts a configuration object in its constructor and exposes:
- `checkPassword(pass)` → `{ isValid, score, feedback[], strength }` — full validation with scoring
- `isValid(password)` → boolean — convenience wrapper
- `getStrength(password)` → `"strong" | "medium" | "weak" | "very_weak"`
- `generateSuggestions(length?)` → randomly generated password that satisfies configured requirements

Scoring is additive (20pts per satisfied requirement, bonus pts for extra length) with penalties for common passwords (−30), sequential patterns (−20), and excessive repeats (−15). Strength thresholds: strong ≥ 80, medium ≥ 60, weak ≥ 40, very_weak < 40.

Known limitation: the `commonWords` constructor option is accepted and stored (`this.commonWords`) but `isCommonPassword()` only checks the hardcoded `this.commonPasswords` list — custom common words have no effect on validation.

**`src/cli.js`** — Not yet created. Referenced by `npm run assistant` / `npm run assistant:debug` in `package.json`; both scripts will fail until this file is implemented.

**`scripts/ask-expert.sh`** — Invokes the Devin CLI (`devin --prompt-file`) with a pre-written context file from `.virtual-context/<task-id>.md`. Used by the Windsurf `ask-expert` workflow.

## Windsurf Workflows

**`ask-expert`** (`.windsurf/workflows/ask-expert.md`): Delegates a focused codebase question to Devin. Steps: parse question → collect ≤300 lines of targeted context → write `.virtual-context/<TASK_ID>.md` → run `./scripts/ask-expert.sh <TASK_ID>` → synthesize response with file:line citations.

**`debug-frontend-issue`** (`.windsurf/workflows/debug-frontend-issue.md`): Structured debugging flow ending in a standard "Debug Summary" template.

## Frontend Standards (Windsurf Rule)

When working on React/frontend code (triggered automatically by the model):
- Functional components with hooks only; no class components
- TypeScript preferred over JavaScript
- One component per file, PascalCase names
- Avoid unnecessary re-renders; use early returns

