# Feature Specification: Expense Category Donut Chart

**Feature Branch**: `002-expense-donut-chart`
**Created**: 2026-04-29
**Status**: Draft
**Input**: Branch name `002-expense-donut-chart` — add a donut chart visualization of per-category spending to the expense tracker dashboard.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Category Spending as Donut Chart (Priority: P1)

The user opens the dashboard and, alongside their expense list, sees a donut chart that visually breaks down their total spending by category. Each slice represents one category's share of all-time spending. The chart replaces or supplements the existing plain-text category rows.

**Why this priority**: The donut chart is the entire feature. It is the primary deliverable and the only user story — all other concerns (empty state, hover/tooltip) flow from it.

**Independent Test**: Pre-load known expenses across at least three categories via LocalStorage. Navigate to the dashboard. Confirm a donut chart renders with one slice per category that has spending, slices are proportional to amounts, and each slice is visually distinguishable.

**Acceptance Scenarios**:

1. **Given** the user has recorded expenses in multiple categories, **When** they open the dashboard, **Then** they see a donut chart where each non-zero category occupies a proportional arc.
2. **Given** the user hovers over (or taps) a slice, **When** the pointer enters the slice, **Then** they see a tooltip showing the category name, total amount, and percentage of all-time spending.
3. **Given** the user has recorded no expenses, **When** they open the dashboard, **Then** the donut chart area is not rendered (the existing empty-state message is shown instead).
4. **Given** spending exists in only one category, **When** the dashboard renders, **Then** a full-circle (360°) donut is shown for that single category.
5. **Given** a category has zero spending, **When** the chart renders, **Then** that category has no visible slice (zero-value categories are omitted).

---

### Edge Cases

- What happens when only one category has spending? → Full-circle donut with a single slice.
- What happens when all category amounts are zero? → No chart rendered; empty state shown.
- What happens when a new expense is added and the user returns to the dashboard? → Chart updates to reflect the new data automatically (reactive, same as existing totals).
- What happens on very small screens (mobile)? → Chart scales down proportionally; remains legible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The dashboard MUST display a donut chart visualising all-time spending broken down by `ExpenseCategory` when at least one expense exists.
- **FR-002**: Each chart slice MUST be proportional to the category's share of all-time total spending.
- **FR-003**: Zero-value categories MUST be omitted from the chart (no zero-width slices).
- **FR-004**: Each slice MUST be visually distinguishable from adjacent slices (distinct colour per category).
- **FR-005**: Hovering over (or tapping on mobile) a slice MUST display a tooltip containing: category name, formatted amount (e.g. `$42.50`), and percentage of total (e.g. `18%`).
- **FR-006**: The chart MUST NOT render when there are no expenses; the existing empty-state message takes its place.
- **FR-007**: The chart MUST react to expense additions and deletions without requiring a page reload (same reactive data source as the rest of the dashboard).
- **FR-008**: The chart MUST be implemented as a standalone Angular component (`DonutChartComponent`) so it is independently testable and reusable.
- **FR-009**: The chart MUST be rendered using SVG (no canvas, no third-party charting library) to keep the bundle lean and avoid new dependencies.

### Key Entities

- **CategorySlice**: A derived view-model with `{ category: ExpenseCategory; amount: number; percentage: number; color: string }` — computed from `getCategoryTotals()` output, passed into `DonutChartComponent` as an `@Input`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The donut chart renders correctly for any valid set of expenses within 100 ms of the dashboard loading.
- **SC-002**: All non-zero categories are represented as distinct, correctly-proportioned slices (verifiable by unit test asserting arc lengths match percentages).
- **SC-003**: Zero-value categories produce no rendered slice (verifiable by unit test asserting no SVG arc element for that category).
- **SC-004**: The tooltip appears on hover/tap and disappears on mouse-leave/tap-away (verifiable by component interaction test).
- **SC-005**: All existing dashboard unit tests continue to pass (no regression).
- **SC-006**: The new `DonutChartComponent` has ≥ 80% unit-test coverage of its logic (slice calculations, tooltip visibility).

## Assumptions

- The existing `ExpenseService.getCategoryTotals()` is the data source; no new service methods are needed.
- A fixed colour palette of 7 colours (one per `ExpenseCategory`) is acceptable; no user-configurable colours.
- The chart is decorative/informational only — no click-to-filter interaction is required in this feature.
- The chart will be placed in the existing summary section of the dashboard, alongside (or replacing) the plain-text category rows; exact layout is a planning-phase decision.
- SVG rendering is sufficient; animation/transitions are a nice-to-have, not a requirement.
- The existing Angular project at `apps/expense-tracker/` is the target; no new projects or packages are introduced.
