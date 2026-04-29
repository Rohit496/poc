---
description: "Task list for Expense Category Donut Chart feature implementation"
---

# Tasks: Expense Category Donut Chart

**Input**: Design documents from `specs/002-expense-donut-chart/`
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/ui-contracts.md ✅, research.md ✅

**Tests**: Included per Constitution Principle III (Test-First, NON-NEGOTIABLE) — tests MUST
be written and confirmed to FAIL before the corresponding implementation task begins.

**Organization**: Tasks grouped by user story to enable independent implementation and
testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1)
- Exact file paths reference `apps/expense-tracker/` as the Angular project root

## Path Conventions

All source paths are relative to the repository root. The Angular project lives at
`apps/expense-tracker/`. All test files use the `.spec.ts` suffix alongside their
implementation file.

---

## Phase 1: Setup

**Purpose**: Scaffold new directories and add shared constants/types that all subsequent tasks depend on.

- [ ] T001 Create `apps/expense-tracker/src/app/utils/` directory (add `.gitkeep` placeholder; will be replaced by T005)
- [ ] T002 [P] Add `CategorySlice` interface and `CategoryView` type to `apps/expense-tracker/src/app/models/expense.model.ts` — `CategorySlice: { category, amount, percentage, color, path, startAngle, sweepAngle }`, `CategoryView: 'list' | 'chart'`
- [ ] T003 [P] Add `CATEGORY_COLORS`, `CATEGORY_VIEW_STORAGE_KEY`, `DONUT_OUTER_RADIUS` (80), `DONUT_INNER_RADIUS` (45), `DONUT_CENTER` (100) constants to `apps/expense-tracker/src/app/constants/categories.ts`

**Checkpoint**: Shared types and constants in place — all user story tasks can now reference them.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The `buildSlices()` pure utility is the mathematical backbone of the entire feature.
It must be complete and tested before any component work begins.

**⚠️ CRITICAL**: Complete this phase before Phase 3.

### Tests for buildSlices ⚠️ WRITE FIRST — MUST FAIL BEFORE T006

- [ ] T004 Write failing unit tests for `buildSlices()` in `apps/expense-tracker/src/app/utils/chart.utils.spec.ts` — test: returns empty array when all totals are zero; returns one slice per non-zero category; percentages sum to ~100%; single non-zero category produces sweepAngle ≈ 2π; zero-value categories are absent from result; slice path strings are non-empty; result order follows `EXPENSE_CATEGORIES` order

### Implementation

- [ ] T005 Implement `buildSlices(totals, colors)` in `apps/expense-tracker/src/app/utils/chart.utils.ts` — pure function, no Angular dependencies; computes `percentage`, `startAngle`, `sweepAngle`, SVG `path` string (outer+inner arc using `DONUT_OUTER_RADIUS`, `DONUT_INNER_RADIUS`, `DONUT_CENTER`); single-category case uses `sweepAngle = 2π − 0.001` to avoid degenerate path (verify T004 tests fail first, then pass after implementation)

**Checkpoint**: `buildSlices()` is fully tested and correct — component work can now begin.

---

## Phase 3: User Story 1 — View Category Spending as Donut Chart (Priority: P1) 🎯 MVP

**Goal**: User can toggle the category breakdown between "List" and "Chart" views. In "Chart" view
a donut chart renders per-category spending proportionally with a hover tooltip. The selected view
is persisted to localStorage and restored on reload.

**Independent Test**: Pre-load at least three categories via LocalStorage. Navigate to `/`.
Confirm toggle buttons are visible. Click "Chart" — donut slices appear proportionally. Hover a
slice — tooltip shows category, amount, percentage. Click "List" — text rows reappear. Reload —
"Chart" view is restored. Clear localStorage — "List" is the default.

### Tests for User Story 1 ⚠️ WRITE FIRST — MUST FAIL BEFORE T009 and T012

- [ ] T006 [P] [US1] Write failing unit tests for `DonutChartComponent` in `apps/expense-tracker/src/app/components/donut-chart/donut-chart.component.spec.ts` — test: renders one `[data-testid="slice-{category}"]` path per slice in input; renders no path for absent categories; single-slice input renders full-circle path (sweepAngle close to 2π); `[data-testid="chart-tooltip"]` absent when no slice is hovered; `[data-testid="chart-tooltip"]` present with correct category/amount/percentage after mouseenter on a slice path; tooltip absent after mouseleave
- [ ] T007 [P] [US1] Write failing unit tests for the toggle and persistence additions to `DashboardComponent` in `apps/expense-tracker/src/app/components/dashboard/dashboard.component.spec.ts` — test: `[data-testid="toggle-list"]` and `[data-testid="toggle-chart"]` visible when expenses exist; toggle absent in empty state; `[data-testid="category-list"]` visible and `[data-testid="category-chart"]` absent when `categoryView` is `'list'`; vice-versa when `'chart'`; clicking `toggle-chart` calls `StorageService.set` with `CATEGORY_VIEW_STORAGE_KEY` and `'chart'`; on init, `StorageService.get` is called and returned value sets `categoryView`; when `StorageService.get` returns null, `categoryView` defaults to `'list'`

### Implementation for User Story 1

- [ ] T008 [P] [US1] Create `DonutChartComponent` template in `apps/expense-tracker/src/app/components/donut-chart/donut-chart.component.html` — SVG `viewBox="0 0 200 200"` with `preserveAspectRatio="xMidYMid meet"`, `data-testid="donut-chart"`; `@for` loop rendering `<path [attr.d]="slice.path" [attr.fill]="slice.color" [attr.data-testid]="'slice-' + slice.category"` with `(mouseenter)` / `(mouseleave)` bindings; `@if (activeSlice)` tooltip block with `data-testid="chart-tooltip"`, `data-testid="tooltip-category"`, `data-testid="tooltip-amount"`, `data-testid="tooltip-percentage"`
- [ ] T009 [US1] Implement `DonutChartComponent` class in `apps/expense-tracker/src/app/components/donut-chart/donut-chart.component.ts` — standalone, `OnPush`; `@Input() slices: CategorySlice[] = []`; `activeSlice: CategorySlice | null = null`; `onSliceEnter(slice)` sets `activeSlice`; `onSliceLeave()` clears `activeSlice`; no service injection; no localStorage access (verify T006 tests fail first, then pass)
- [ ] T010 [P] [US1] Update `DashboardComponent` template in `apps/expense-tracker/src/app/components/dashboard/dashboard.component.html` — inside the `@else` block (expenses present): add toggle button group (`data-testid="toggle-list"` / `data-testid="toggle-chart"`) above the category breakdown; wrap existing category rows in `@if (categoryView === 'list')` with `data-testid="category-list"` container; add `@else` block with `data-testid="category-chart"` containing `<app-donut-chart [slices]="(slices$ | async)!" />`
- [ ] T011 [P] [US1] Add inline styles for the toggle buttons and donut chart container to `apps/expense-tracker/src/app/components/donut-chart/donut-chart.component.html` (or a companion `.css` file) — toggle button group horizontal layout; active button highlighted; SVG chart max-width 300px, centered; tooltip positioned absolutely over chart
- [ ] T012 [US1] Update `DashboardComponent` class in `apps/expense-tracker/src/app/components/dashboard/dashboard.component.ts` — implement `OnInit`; inject `StorageService`; add `categoryView: CategoryView = 'list'`; add `slices$` observable (`categoryTotals$.pipe(map(totals => buildSlices(totals, CATEGORY_COLORS)))`); `ngOnInit()` reads `StorageService.get<CategoryView>(CATEGORY_VIEW_STORAGE_KEY)` and sets `categoryView` (default `'list'`); `onToggleView()` flips `categoryView`, calls `StorageService.set(CATEGORY_VIEW_STORAGE_KEY, this.categoryView)`; import and declare `DonutChartComponent` in `imports` array (verify T007 tests fail first, then pass)

**Checkpoint**: User Story 1 independently functional — toggle works, chart renders, tooltip shows, preference persists across reloads.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Visual polish, regression validation, and code-quality review.

- [ ] T013 [P] Add/update styles in `apps/expense-tracker/src/styles.css` and component stylesheets — donut chart responsive sizing (max-width on SVG); tooltip styling (background, border, padding, z-index); toggle button active/inactive states; ensure layout remains readable on 320px viewport
- [ ] T014 Serve the app locally (`cd apps/expense-tracker && npx ng serve`) and validate all acceptance scenarios from `specs/002-expense-donut-chart/spec.md` end-to-end — toggle defaults to List; switch to Chart, confirm slices; hover tooltip; reload confirms Chart view restored; clear localStorage, reload confirms List default; empty state shows no toggle/chart
- [ ] T015 [P] Review all new and modified source files for Constitution Principle VI compliance — `buildSlices()` is pure with no side effects; `DonutChartComponent` has no service injection; no magic numbers (all geometry uses named constants); no functions mixing concerns; `CATEGORY_COLORS` is named constant not inline strings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; T002 and T003 are parallel
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user story work
- **User Story 1 (Phase 3)**: Depends on Phase 2 — can start once `buildSlices()` tests pass
- **Polish (Phase 4)**: Depends on Phase 3 completion

### Within Phase 3 (User Story 1)

1. Write tests (T006, T007) in parallel — verify they FAIL
2. Write templates/HTML (T008, T010, T011) in parallel — these can start alongside tests
3. Implement `DonutChartComponent` class (T009) — depends on T006 (tests) + T008 (template)
4. Implement `DashboardComponent` updates (T012) — depends on T007 (tests) + T009 (DonutChartComponent) + T010/T011 (template)

### Parallel Opportunities

- T002, T003 — Phase 1 type/constant additions (different files)
- T006, T007 — US1 test specs (different files)
- T008, T010, T011 — US1 HTML templates (different files)
- T013, T015 — Polish tasks (different files/concerns)

---

## Parallel Example: User Story 1

```bash
# Launch together (T006, T007, T008, T010, T011 have no dependency on each other):
Task T006: Write failing tests for DonutChartComponent
Task T007: Write failing tests for DashboardComponent toggle additions
Task T008: Create DonutChartComponent HTML template
Task T010: Update DashboardComponent HTML template (toggle + conditional rendering)
Task T011: Add toggle/chart styles

# After T006 + T008 complete, run T009:
Task T009: Implement DonutChartComponent class (verify T006 tests fail first)

# After T007 + T009 + T010 + T011 complete, run T012:
Task T012: Update DashboardComponent class (verify T007 tests fail first)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only — entire feature is one story)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T005) — `buildSlices()` tested and correct
3. Complete Phase 3: User Story 1 (T006–T012)
4. **STOP and VALIDATE**: Toggle, chart, tooltip, and persistence all work end-to-end
5. Complete Phase 4: Polish (T013–T015)

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation + geometry ready
2. Phase 3 T006–T009 → `DonutChartComponent` fully tested standalone
3. Phase 3 T010–T012 → Wired into dashboard, full feature live
4. Phase 4 → Visual polish and sign-off

---

## Notes

- `[P]` = different files, no dependency on incomplete tasks in the same phase
- `[US1]` maps every task to User Story 1 for traceability
- TDD enforced per Constitution Principle III: every `*.spec.ts` task MUST be completed and
  confirmed FAILING before its paired implementation task begins
- `OnPush` change detection REQUIRED on `DonutChartComponent` (Constitution Principle VII)
- `DonutChartComponent` MUST NOT inject `StorageService` or `ExpenseService` — purely presentational
- `DashboardComponent` is the ONLY component that reads/writes `CATEGORY_VIEW_STORAGE_KEY`
- `buildSlices()` MUST remain a pure function — no Angular injection, no side effects (Principle VI)
