---
description: "Task list for Expense Tracker feature implementation"
---

# Tasks: Expense Tracker

**Input**: Design documents from `specs/001-expense-tracker/`
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/service-contracts.md ✅, research.md ✅

**Tests**: Included per Constitution Principle III (Test-First, NON-NEGOTIABLE) — tests MUST
be written and confirmed to FAIL before the corresponding implementation task begins.

**Organization**: Tasks grouped by user story to enable independent implementation and
testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths reference `apps/expense-tracker/` as the Angular project root

## Path Conventions

All source paths are relative to the repository root. The Angular project lives at
`apps/expense-tracker/`. All test files use the `.spec.ts` suffix alongside their
implementation file.

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Scaffold the Angular project and configure testing infrastructure.

- [x] T001 Scaffold Angular 17+ project at `apps/expense-tracker/` using Angular CLI with standalone and routing flags (`ng new expense-tracker --standalone --routing --style=css`)
- [x] T002 [P] Configure `apps/expense-tracker/tsconfig.json` with `"strict": true` and `"strictTemplates": true`
- [x] T003 [P] Install and configure `jest-preset-angular` — add `jest.config.js` and update `apps/expense-tracker/package.json` test script to use Jest instead of Karma
- [x] T004 [P] Create `apps/expense-tracker/src/server/.gitkeep` placeholder directory for future server-side logic

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared models, constants, services, and routing that ALL user stories depend on.
No user story work can begin until this phase is complete.

**⚠️ CRITICAL**: Complete this phase before starting any user story phase.

- [x] T005 Create `Expense` interface and `NewExpenseInput` type and `ExpenseCategory` union type in `apps/expense-tracker/src/app/models/expense.model.ts` — exact shape from data-model.md
- [x] T006 [P] Create `EXPENSE_CATEGORIES` constant array in `apps/expense-tracker/src/app/constants/categories.ts` — values: Food, Transport, Housing, Entertainment, Health, Shopping, Other
- [x] T007 Write failing unit tests for `StorageService` in `apps/expense-tracker/src/app/services/storage.service.spec.ts` — test `get()` returns null on missing key, `set()` round-trips via JSON, `get()` returns null on parse error, `remove()` clears key
- [x] T008 Implement `StorageService` in `apps/expense-tracker/src/app/services/storage.service.ts` — `providedIn: 'root'`; `get<T>()`, `set<T>()`, `remove()` wrapping `localStorage` (verify T007 tests fail first, then pass after implementation)
- [x] T009 Write failing unit tests for `ExpenseService` in `apps/expense-tracker/src/app/services/expense.service.spec.ts` — test `addExpense()` generates id+createdAt, rounds amount to 2dp, emits on `expenses$`; `deleteExpense()` removes by id; `getAllTimeTotal()` sums correctly; `getCategoryTotals()` returns all 7 categories; `getRecentExpenses()` returns newest-first slice
- [x] T010 Implement `ExpenseService` in `apps/expense-tracker/src/app/services/expense.service.ts` — `providedIn: 'root'`; `BehaviorSubject<Expense[]>` source of truth; reads from `StorageService` on init; all methods per `contracts/service-contracts.md` (verify T009 tests fail first, then pass)
- [x] T011 [P] Define routes in `apps/expense-tracker/src/app/app.routes.ts` — `/` → `DashboardComponent`, `/add` → `AddExpenseComponent` (eager, no lazy loading)
- [x] T012 [P] Configure `apps/expense-tracker/src/app/app.config.ts` with `provideRouter(routes)` and update `apps/expense-tracker/src/app/app.component.ts` as a minimal `<router-outlet>` shell with no business logic

**Checkpoint**: Foundation ready — `StorageService` and `ExpenseService` tests pass; routing configured; user story phases can now begin in parallel.

---

## Phase 3: User Story 1 - Record an Expense (Priority: P1) 🎯 MVP

**Goal**: User can open the add-expense form, fill in amount/date/category/description, submit,
and see the saved expense reflected in the application.

**Independent Test**: Navigate to `/add`, fill in a valid expense, submit — confirm the entry
appears on the dashboard at `/` with correct values.

### Tests for User Story 1 ⚠️ WRITE FIRST — MUST FAIL BEFORE T015

- [x] T013 [P] [US1] Write failing unit tests for `AddExpenseComponent` in `apps/expense-tracker/src/app/components/add-expense/add-expense.component.spec.ts` — test: form invalid when amount empty; form invalid when amount ≤ 0; form invalid when category missing; form valid with required fields; submit calls `ExpenseService.addExpense()`; submit navigates to `/`; description field optional

### Implementation for User Story 1

- [x] T014 [P] [US1] Create `AddExpenseComponent` template in `apps/expense-tracker/src/app/components/add-expense/add-expense.component.html` — amount input, date input (defaulting to today), category select (bound to `EXPENSE_CATEGORIES`), description textarea (optional), submit button, validation error messages
- [x] T015 [US1] Implement `AddExpenseComponent` class in `apps/expense-tracker/src/app/components/add-expense/add-expense.component.ts` — standalone, `OnPush`, `ReactiveFormsModule`, `FormGroup` with `Validators.required` + `Validators.min(0.01)` on amount, inject `ExpenseService` and `Router`, on valid submit call `addExpense()` then `router.navigate(['/'])`

**Checkpoint**: User Story 1 independently functional — add expense form validates, saves, and redirects.

---

## Phase 4: User Story 2 - View Dashboard and Expense List (Priority: P2)

**Goal**: User lands on the dashboard and immediately sees the 10 most recent expenses,
an all-time total, and an all-time per-category breakdown. Empty state shown when no expenses.

**Independent Test**: Pre-load known expenses via `StorageService`, navigate to `/` — confirm
recent list shows correct entries newest-first, totals match, category breakdown is accurate,
and empty state appears when the list is empty.

### Tests for User Story 2 ⚠️ WRITE FIRST — MUST FAIL BEFORE T018

- [x] T016 [P] [US2] Write failing unit tests for `DashboardComponent` in `apps/expense-tracker/src/app/components/dashboard/dashboard.component.spec.ts` — test: renders 10 most recent expenses; shows all-time total; shows per-category totals for all 7 categories; shows empty-state element when `expenses$` emits `[]`; does not show empty-state when expenses present

### Implementation for User Story 2

- [x] T017 [P] [US2] Create `DashboardComponent` template in `apps/expense-tracker/src/app/components/dashboard/dashboard.component.html` — expense list (bound to `recentExpenses$`), all-time total display, per-category totals section, empty-state block (shown via `*ngIf` / `@if` when list is empty), "Add Expense" navigation link/button
- [x] T018 [US2] Implement `DashboardComponent` class in `apps/expense-tracker/src/app/components/dashboard/dashboard.component.ts` — standalone, `OnPush`, inject `ExpenseService`; expose `recentExpenses$` (via `map` on `expenses$`), `allTimeTotal$`, `categoryTotals$` as `async`-pipe-ready observables; no direct `localStorage` access

**Checkpoint**: User Stories 1 and 2 independently functional — expenses can be recorded and the dashboard renders accurately.

---

## Phase 5: User Story 3 - Delete an Expense (Priority: P3)

**Goal**: User can select an expense from the dashboard list, confirm deletion, and see the
list and totals update immediately. Cancelling leaves data unchanged.

**Independent Test**: Pre-load expenses, render the dashboard, trigger delete on one expense,
confirm, verify the expense is removed from the list and the all-time total has decreased.
Trigger delete, cancel — verify data is unchanged.

### Tests for User Story 3 ⚠️ WRITE FIRST — MUST FAIL BEFORE T021

- [x] T019 [P] [US3] Write failing unit tests for `DeleteConfirmDialogComponent` in `apps/expense-tracker/src/app/components/delete-confirm-dialog/delete-confirm-dialog.component.spec.ts` — test: renders expense amount and category; emits `confirmed` event on confirm click; emits `cancelled` event on cancel click
- [x] T020 [P] [US3] Write failing unit tests for the delete flow in `DashboardComponent` — test: clicking delete opens the confirm dialog; confirming calls `ExpenseService.deleteExpense()` with correct id; cancelling does NOT call `deleteExpense()`; dialog closes after confirm or cancel

### Implementation for User Story 3

- [x] T021 [P] [US3] Create `DeleteConfirmDialogComponent` template in `apps/expense-tracker/src/app/components/delete-confirm-dialog/delete-confirm-dialog.component.html` — confirm message showing expense amount/category, confirm button, cancel button
- [x] T022 [US3] Implement `DeleteConfirmDialogComponent` in `apps/expense-tracker/src/app/components/delete-confirm-dialog/delete-confirm-dialog.component.ts` — standalone, `OnPush`; `@Input() expense: Expense`; `@Output() confirmed = new EventEmitter<void>()`; `@Output() cancelled = new EventEmitter<void>()`
- [x] T023 [US3] Wire the delete flow into `DashboardComponent` in `apps/expense-tracker/src/app/components/dashboard/dashboard.component.ts` — add `pendingDeleteExpense: Expense | null` state; show `DeleteConfirmDialogComponent` conditionally; on `confirmed` emit call `expenseService.deleteExpense(id)` and clear pending state; on `cancelled` emit clear pending state

**Checkpoint**: All three user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Usable styling, end-to-end validation, and code quality review.

- [x] T024 [P] Add base styles to `apps/expense-tracker/src/styles.css` and inline styles to each component — minimal, readable layout: form layout for add-expense, table or card list for dashboard, dialog overlay for delete confirmation
- [x] T025 Serve the app locally (`ng serve`) and validate all acceptance scenarios from `specs/001-expense-tracker/spec.md` end-to-end — add an expense, confirm it appears; view totals; delete an expense, confirm it disappears and totals update; verify empty state on fresh LocalStorage
- [x] T026 [P] Review all five source files (model, constants, StorageService, ExpenseService, each component) for Constitution Principle VI compliance — no functions mixing concerns, no magic numbers/strings, all private helpers pure functions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 — can start once foundational phase complete
- **User Story 2 (Phase 4)**: Depends on Phase 2 — can start in parallel with US1
- **User Story 3 (Phase 5)**: Depends on Phase 2 and US2 (reuses `DashboardComponent`)
- **Polish (Phase 6)**: Depends on all desired user stories complete

### User Story Dependencies

- **US1 (P1)**: Independent after Phase 2 — no dependency on US2 or US3
- **US2 (P2)**: Independent after Phase 2 — no dependency on US1 or US3
- **US3 (P3)**: Depends on US2 (extends `DashboardComponent`) — start after US2 checkpoint

### Within Each User Story

1. Write tests → verify they FAIL → implement → verify tests PASS
2. Template (`*.html`) and test spec (`*.spec.ts`) marked `[P]` within a story can be written in parallel
3. Component class (`.ts`) depends on template and tests being written first

### Parallel Opportunities

- T002, T003, T004 — all Phase 1 setup tasks (different files)
- T006, T011, T012 — Phase 2 constants and routing (no shared dependencies)
- T007 and T009 — writing service test specs in parallel (different files)
- T013 and T014 — US1 test spec and template in parallel
- T016 and T017 — US2 test spec and template in parallel
- T019, T020, T021 — US3 test specs and template in parallel
- T024 and T026 — Polish tasks in parallel

---

## Parallel Example: User Story 1

```bash
# Launch together (T013 and T014 have no dependency on each other):
Task T013: Write failing tests for AddExpenseComponent
Task T014: Create AddExpenseComponent HTML template

# After both complete, run T015:
Task T015: Implement AddExpenseComponent class (verify T013 tests fail first)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational — CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (Record an Expense)
4. **STOP and VALIDATE**: Navigate to `/add`, add an expense, confirm it reaches LocalStorage
5. Deploy/share if ready

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready
2. Phase 3 → US1 done → Record expenses works (MVP)
3. Phase 4 → US2 done → Dashboard shows data
4. Phase 5 → US3 done → Full CRUD complete
5. Phase 6 → Polish and end-to-end validation

### Parallel Team Strategy

Once Phase 2 is complete:
- Developer A: User Story 1 (Phase 3)
- Developer B: User Story 2 (Phase 4)
- Developer C: begins User Story 3 after Developer B completes Phase 4

---

## Notes

- `[P]` = different files, no dependency on incomplete tasks in the same phase
- `[US?]` label maps task to user story for traceability
- TDD enforced per Constitution Principle III: every `*.spec.ts` task MUST be completed and
  confirmed FAILING before its paired implementation task begins
- `OnPush` change detection REQUIRED on all three components (Constitution Principle VII)
- `StorageService` is the ONLY code that touches `localStorage` directly (Principle VI, SRP)
- Components MUST NOT inject `StorageService` directly — only `ExpenseService` (Principle VII)
