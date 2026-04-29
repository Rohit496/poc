# Implementation Plan: Expense Tracker

**Branch**: `001-expense-tracker` | **Date**: 2026-04-29 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-expense-tracker/spec.md`

## Summary

A personal, single-user expense tracking SPA built with Angular 17+ (standalone components),
Angular Router, and browser LocalStorage for persistence. Users record expenses (amount, date,
category, description), view a dashboard showing the 10 most recent entries plus all-time
spending totals by category, and delete any expense with a confirmation step. No authentication,
no backend, and no external dependencies beyond the Angular framework itself.

## Technical Context

**Language/Version**: TypeScript 5.x — strict mode enabled (`"strict": true` in tsconfig.json)
**Primary Dependencies**: Angular 17+ (standalone), Angular Router, Angular Reactive Forms
**Storage**: Browser LocalStorage — client-side only, no backend required
**Testing**: Jest with `jest-preset-angular` (aligns with existing project `npm test` gate)
**Target Platform**: Web browser, desktop-first, single device
**Project Type**: SPA — Angular standalone component architecture
**Performance Goals**: Add expense form completed in <30s; dashboard updates immediately on
add/delete (SC-001, SC-002); responsive with up to 1,000 stored records (SC-004)
**Constraints**: Single currency; no cross-device sync; no auth; 2 decimal place precision
**Scale/Scope**: Single user; up to 1,000 expenses; 2 routes; no external API calls

> **Terminology note**: The user input referenced "app router, route handlers and server
> actions" — these are Next.js 13+ concepts. Angular equivalents used here:
> - "app router" → Angular Router configured via `provideRouter` in `app.config.ts`
> - "route handlers" → Angular route configuration in `app.routes.ts`
> - "server actions" → Angular injectable services (`ExpenseService`, `StorageService`)
> - `src/server/` folder → created per user request as a placeholder for future expansion

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applies | Status | Notes |
|-----------|---------|--------|-------|
| I. Library-First | No | N/A | Expense tracker is an application, not a library |
| II. Configurable by Default | No | N/A | Library-specific; Angular DI handles configuration |
| III. Test-First (NON-NEGOTIABLE) | Yes | ✅ MUST comply | Jest specs written before each component/service |
| IV. Structured Result Contract | No | N/A | Specific to `checkPassword()` return shape |
| V. Simplicity (YAGNI) | Yes | ✅ COMPLIANT | LocalStorage eliminates backend; no NgRx; eager routing |
| VI. Clean & Modular Code | Yes | ✅ MUST comply | SRP per file; named constants; pure service methods |
| VII. Angular Frontend Standards | Yes | ✅ MUST comply | Standalone, OnPush, DI, stateless components |

No violations. Proceeding to research and design phases.

*Post-design re-check*: All three applicable principles remain satisfied. `StorageService`
wrapping LocalStorage preserves SRP (VI); `BehaviorSubject` stream enables OnPush (VII);
two eager routes keep routing simple (V).

## Project Structure

### Documentation (this feature)

```text
specs/001-expense-tracker/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── service-contracts.md   # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
apps/
└── expense-tracker/           # Angular SPA (isolated from root Node.js library)
    ├── angular.json
    ├── package.json           # Angular-specific dependencies
    ├── tsconfig.json          # strict: true
    └── src/
        ├── app/
        │   ├── app.component.ts          # Root shell component
        │   ├── app.config.ts             # provideRouter, DI providers
        │   ├── app.routes.ts             # / → Dashboard, /add → AddExpense
        │   ├── constants/
        │   │   └── categories.ts         # EXPENSE_CATEGORIES constant array
        │   ├── models/
        │   │   └── expense.model.ts      # Expense interface, ExpenseCategory type
        │   ├── services/
        │   │   ├── expense.service.ts    # Business logic: add, delete, query, totals
        │   │   └── storage.service.ts   # LocalStorage abstraction
        │   └── components/
        │       ├── dashboard/
        │       │   ├── dashboard.component.ts
        │       │   └── dashboard.component.html
        │       ├── add-expense/
        │       │   ├── add-expense.component.ts
        │       │   └── add-expense.component.html
        │       └── delete-confirm-dialog/
        │           ├── delete-confirm-dialog.component.ts
        │           └── delete-confirm-dialog.component.html
        └── server/                       # Placeholder — future server-side logic
            └── .gitkeep
```

**Structure Decision**: Angular SPA lives in `apps/expense-tracker/` with its own
`package.json` to isolate Angular dependencies from the root `password-checker.js` Node.js
library project. The `src/server/` directory is created per user specification as a placeholder;
it holds no implementation since LocalStorage requires no server runtime.
