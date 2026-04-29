<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0
Bump type: MINOR — two new principles added (VI, VII); no existing principles removed or redefined.

Modified principles: None

Added sections:
- VI. Clean & Modular Code (new)
- VII. Angular Frontend Standards (new)

Removed sections: None

Templates:
- .specify/templates/plan-template.md  ✅ aligned — Constitution Check placeholder populated
  dynamically by /speckit-plan; new principles self-documenting
- .specify/templates/spec-template.md  ✅ aligned — no mandatory section changes required
- .specify/templates/tasks-template.md ⚠ pending — "Tests are OPTIONAL" still conflicts with
  Principle III (TDD mandatory); unresolved from v1.0.0
- .specify/templates/commands/         ✅ N/A — directory does not exist

Deferred TODOs (carried forward from v1.0.0):
- commonWords bug: constructor stores this.commonWords but isCommonPassword() ignores it.
  Must be resolved (wire up or remove) before next minor release — flagged in Quality Gates.
- src/cli.js not yet implemented; npm run assistant scripts remain non-functional.
-->

# windsurf-pro Constitution

## Core Principles

### I. Library-First

`PasswordChecker` is a single-purpose, self-contained library (`password-checker.js`).
It MUST have no runtime dependencies beyond Node.js built-ins.
Every feature MUST be consumable via `require('./password-checker')` — the class API is the contract.
No organizational-only abstractions: every file added MUST have a clear, independently testable purpose.

### II. Configurable by Default

All validation rules (`minLength`, `requireUppercase`, `requireLowercase`, `requireNumbers`,
`requireSpecialChars`, `checkForSequences`, `checkForRepeats`, `maxPasswordLength`, `specialChars`)
MUST be configurable via the constructor options object.
Defaults MUST represent secure-by-default behaviour (all checks enabled, `minLength` 8).
The constructor MUST validate options and throw descriptive errors for invalid input —
silent coercion of invalid values is not permitted.

### III. Test-First (NON-NEGOTIABLE)

TDD is mandatory: tests MUST be written and confirmed to fail before implementation begins.
Red-Green-Refactor cycle is strictly enforced.
`npm test` (Jest) is the sole authoritative correctness gate — no code reaches `main` without passing.
All public methods (`checkPassword`, `isValid`, `getStrength`, `generateSuggestions`) MUST have
direct unit-test coverage in `password-checker.test.js`.

### IV. Structured Result Contract

`checkPassword(pass)` MUST always return `{ isValid: boolean, score: number, feedback: string[], strength: string }`.
The `strength` enum is fixed: `"strong" | "medium" | "weak" | "very_weak"`.
Score thresholds (strong ≥ 80, medium ≥ 60, weak ≥ 40, very_weak < 40) MUST NOT change
without a MAJOR version bump to this constitution.
`feedback[]` MUST contain human-readable, actionable messages — never numeric error codes.

### V. Simplicity (YAGNI)

Complexity MUST be justified by a concrete use case present today, not anticipated future needs.
No external runtime dependencies are permitted in `dependencies` (dev-only tools like Jest are allowed).
No abstraction layers beyond the single `PasswordChecker` class unless a second distinct concern exists.
The planned `src/cli.js` MUST remain a thin wrapper over the library — no validation logic may live there.

### VI. Clean & Modular Code

Every function MUST do exactly one thing (Single Responsibility Principle).
Functions MUST be kept small: if a function requires an explanatory comment to describe what it does,
it MUST be extracted and given a descriptive name instead.
No magic numbers or strings: any constant used in logic MUST be named (e.g., score thresholds,
repeat-detection limits, sequence-length minimums).
Files MUST NOT mix unrelated concerns — validation logic, scoring logic, and pattern detection
are separate responsibilities and MUST be extractable independently.
Private helpers (e.g., `isSequential`, `hasExcessiveRepeats`) MUST be pure functions with no side effects.

### VII. Angular Frontend Standards

Any future frontend for this project MUST be implemented in Angular with TypeScript (strict mode enabled).
Components MUST follow one-component-per-file, PascalCase naming, and kebab-case selectors.
Angular's built-in dependency injection MUST be used for all services — no manual instantiation of
service classes inside components.
`OnPush` change detection strategy is REQUIRED for all components to prevent unnecessary re-renders.
No class-based state mutation outside Angular services: components MUST be stateless where possible,
delegating state and business logic to injected services.
The `PasswordChecker` library MUST be consumed from the frontend via an Angular service wrapper —
never instantiated directly inside components.

## Technology Stack

- **Runtime**: Node.js (CommonJS — `"type": "commonjs"` in `package.json`)
- **Testing**: Jest (`^30.x`) — the only permitted dev dependency
- **Runtime dependencies**: MUST remain absent (`dependencies` field empty or omitted)
- **Entry point**: `password-checker.js` (declared as `"main"` in `package.json`)
- **Planned CLI**: `src/cli.js` (not yet implemented — MUST depend only on `password-checker.js`)
- **Frontend (future)**: Angular + TypeScript strict mode (governed by Principle VII)

## Quality Gates

- All tests MUST pass (`npm test`) before any merge to `main`.
- `generateSuggestions()` MUST produce passwords that satisfy `checkPassword()` under the same
  checker configuration — verified by existing test in `password-checker.test.js`.
- **Open defect (must fix before next minor release)**: The `commonWords` constructor option is stored
  as `this.commonWords` but `isCommonPassword()` never reads it. Either wire it into validation
  or remove the option from the public API.
- `npm run assistant` / `npm run assistant:debug` MUST NOT be documented as usable until
  `src/cli.js` is implemented.
- Code review MUST verify Principle VI compliance: no functions that mix concerns, no unnamed constants,
  no impure private helpers.

## Governance

This constitution supersedes all other project guidelines. Amendments require:

1. Increment `CONSTITUTION_VERSION` following semantic versioning:
   - MAJOR: removal or redefinition of any Core Principle or Result Contract field.
   - MINOR: new principle or section added; material expansion of existing guidance.
   - PATCH: clarifications, wording, or non-semantic refinements.
2. Update `LAST_AMENDED_DATE` to the amendment date (ISO 8601: YYYY-MM-DD).
3. Update `CLAUDE.md` if the change affects documented commands, architecture, or known limitations.
4. Review `.specify/templates/` for alignment with any new or removed principles.
5. All PRs MUST confirm compliance with all seven Core Principles before merge.

Compliance review: `npm test` — all constitution-mandated behaviours are test-gated.
For runtime development guidance, refer to `CLAUDE.md`.

**Version**: 1.1.0 | **Ratified**: 2026-04-29 | **Last Amended**: 2026-04-29
