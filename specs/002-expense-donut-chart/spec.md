# Feature Specification: Expense Category Donut Chart

**Feature Branch**: `002-expense-donut-chart`
**Created**: 2026-04-29
**Status**: Draft
**Input**: Branch name `002-expense-donut-chart` — add a donut chart visualization of per-category spending to the expense tracker dashboard.

## Clarifications

### Session 2026-04-29

- Q: Does the donut chart replace or supplement the existing plain-text category rows? → A: Supplement with toggle — keep text rows but add a toggle to switch between chart and list view.
- Q: Should the selected view ("List" or "Chart") persist across page reloads or session only? → A: Persisted — selected view saved to `localStorage` and restored on next load.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Category Spending as Donut Chart (Priority: P1)

The user opens the dashboard and sees the existing plain-text category breakdown. A toggle control lets them switch the category section between "List" view (the current text rows) and "Chart" view (a donut chart). Each donut slice represents one category's share of all-time spending. The selected view is saved to local storage and restored on the next visit.

**Why this priority**: The donut chart is the entire feature. It is the primary deliverable and the only user story — all other concerns (empty state, hover/tooltip) flow from it.

**Independent Test**: Pre-load known expenses across at least three categories via LocalStorage. Navigate to the dashboard. Confirm a donut chart renders with one slice per category that has spending, slices are proportional to amounts, and each slice is visually distinguishable.

**Acceptance Scenarios**:

1. **Given** the user has recorded expenses in multiple categories, **When** they open the dashboard, **Then** they see the category breakdown in "List" view by default with a toggle control visible.
2. **Given** the user is in "List" view, **When** they activate the toggle, **Then** the category section switches to "Chart" view showing a donut chart where each non-zero category occupies a proportional arc.
3. **Given** the user is in "Chart" view, **When** they activate the toggle, **Then** the category section switches back to "List" view showing the plain-text rows.
4. **Given** the user hovers over (or taps) a slice while in "Chart" view, **When** the pointer enters the slice, **Then** they see a tooltip showing the category name, total amount, and percentage of all-time spending.
5. **Given** the user has recorded no expenses, **When** they open the dashboard, **Then** the existing empty-state message is shown and no toggle or chart is rendered.
6. **Given** spending exists in only one category, **When** the user switches to "Chart" view, **Then** a full-circle (360°) donut is shown for that single category.
7. **Given** a category has zero spending, **When** the chart renders, **Then** that category has no visible slice (zero-value categories are omitted).
8. **Given** the user has switched to "Chart" view, **When** they reload the page, **Then** the dashboard opens in "Chart" view (preference is restored from local storage).
9. **Given** the user has never changed the toggle, **When** they load the dashboard, **Then** "List" view is shown (default when no saved preference exists).

---

### Edge Cases

- What happens when only one category has spending? → Full-circle donut with a single slice.
- What happens when all category amounts are zero? → No chart or toggle rendered; empty state shown.
- What happens when a new expense is added and the user returns to the dashboard? → Chart updates to reflect the new data automatically (reactive, same as existing totals).
- What happens on very small screens (mobile)? → Chart scales down proportionally; remains legible.
- What view is shown by default on first load? → "List" view (existing behaviour preserved; chart requires explicit toggle activation).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The dashboard category breakdown section MUST display a toggle control ("List" / "Chart") when at least one expense exists.
- **FR-002**: The category section MUST default to "List" view on page load (existing plain-text rows behaviour preserved).
- **FR-003**: When the user activates the toggle to "Chart" view, the plain-text rows MUST be hidden and the donut chart MUST be shown in their place.
- **FR-004**: When the user activates the toggle back to "List" view, the donut chart MUST be hidden and the plain-text rows MUST be shown again.
- **FR-005**: Each chart slice MUST be proportional to the category's share of all-time total spending.
- **FR-006**: Zero-value categories MUST be omitted from the chart (no zero-width slices).
- **FR-007**: Each slice MUST be visually distinguishable from adjacent slices (distinct colour per category).
- **FR-008**: Hovering over (or tapping on mobile) a slice MUST display a tooltip containing: category name, formatted amount (e.g. `$42.50`), and percentage of total (e.g. `18%`).
- **FR-009**: The toggle control and chart MUST NOT render when there are no expenses; the existing empty-state message takes its place.
- **FR-010**: The chart MUST react to expense additions and deletions without requiring a page reload (same reactive data source as the rest of the dashboard).
- **FR-011**: The chart MUST be implemented as a standalone Angular component (`DonutChartComponent`) so it is independently testable and reusable.
- **FR-012**: The chart MUST be rendered using SVG (no canvas, no third-party charting library) to keep the bundle lean and avoid new dependencies.
- **FR-013**: The selected view MUST be persisted to `localStorage` (via `StorageService`) whenever the user toggles, and restored on dashboard load; the default when no saved value exists is "List".

### Key Entities

- **CategorySlice**: A derived view-model with `{ category: ExpenseCategory; amount: number; percentage: number; color: string }` — computed from `getCategoryTotals()` output, passed into `DonutChartComponent` as an `@Input`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The donut chart renders correctly for any valid set of expenses within 100 ms of toggling to "Chart" view.
- **SC-002**: All non-zero categories are represented as distinct, correctly-proportioned slices (verifiable by unit test asserting arc lengths match percentages).
- **SC-003**: Zero-value categories produce no rendered slice (verifiable by unit test asserting no SVG arc element for that category).
- **SC-004**: The tooltip appears on hover/tap and disappears on mouse-leave/tap-away (verifiable by component interaction test).
- **SC-005**: The toggle correctly switches between "List" and "Chart" views, hiding the inactive view each time (verifiable by unit test asserting element presence/absence).
- **SC-006**: The selected view preference is written to and read from `localStorage` correctly; on reload the previously selected view is restored (verifiable by unit test mocking `StorageService`).
- **SC-007**: All existing dashboard unit tests continue to pass (no regression).
- **SC-008**: The new `DonutChartComponent` has ≥ 80% unit-test coverage of its logic (slice calculations, tooltip visibility).

## Assumptions

- The existing `ExpenseService.getCategoryTotals()` is the data source; no new service methods are needed.
- A fixed colour palette of 7 colours (one per `ExpenseCategory`) is acceptable; no user-configurable colours.
- The chart is decorative/informational only — no click-to-filter interaction is required in this feature.
- The chart replaces the plain-text category rows within the same summary section when toggled to "Chart" view; the toggle control sits above the category content area.
- SVG rendering is sufficient; animation/transitions are a nice-to-have, not a requirement.
- The existing Angular project at `apps/expense-tracker/` is the target; no new projects or packages are introduced.
- The toggle view preference is stored under a dedicated `localStorage` key (e.g. `category-view`) via the existing `StorageService`; no schema changes to expense data are needed.
