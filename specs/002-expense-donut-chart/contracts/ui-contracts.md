---
description: "UI component contracts for the Expense Category Donut Chart feature"
feature: "002-expense-donut-chart"
---

# UI Contracts: Expense Category Donut Chart

This document defines the public API (inputs, outputs, and behaviour contracts) for each
Angular component introduced or modified by this feature.

---

## `DonutChartComponent` (new)

**Selector**: `app-donut-chart`  
**File**: `apps/expense-tracker/src/app/components/donut-chart/donut-chart.component.ts`  
**Change detection**: `OnPush`  
**Standalone**: yes

### Inputs

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `slices` | `CategorySlice[]` | yes | — | Pre-computed slice view-models. Empty array is invalid — caller must ensure at least one slice before rendering this component. |

### Outputs

None. All interaction (tooltip) is internal state.

### Internal state

| Property | Type | Description |
|---|---|---|
| `activeSlice` | `CategorySlice \| null` | The slice currently hovered/tapped. Drives tooltip visibility. |

### Behaviour contract

1. Renders one SVG `<path data-testid="slice-[category]">` per entry in `slices`.
2. When `slices` contains exactly one entry, the path covers a full circle (360°, `sweepAngle` ≈ 2π).
3. On `mouseenter` / `touchstart` of a slice path: sets `activeSlice` to that slice.
4. On `mouseleave` / `touchend` of a slice path: clears `activeSlice` to `null`.
5. When `activeSlice` is non-null: renders a tooltip element (`data-testid="chart-tooltip"`) containing:
   - Category name (e.g. `Food`)
   - Formatted amount (e.g. `$42.50`)
   - Percentage (e.g. `18.0%`)
6. When `activeSlice` is null: tooltip element is absent from the DOM.
7. SVG `viewBox` is `"0 0 200 200"` with `preserveAspectRatio="xMidYMid meet"` — scales responsively.
8. Component does NOT read from `localStorage`, inject `ExpenseService`, or produce side effects.

### Template data-testid attributes

| Element | `data-testid` |
|---|---|
| Root SVG element | `donut-chart` |
| Each slice path | `slice-{category}` (e.g. `slice-Food`) |
| Tooltip container | `chart-tooltip` |
| Tooltip category label | `tooltip-category` |
| Tooltip amount | `tooltip-amount` |
| Tooltip percentage | `tooltip-percentage` |

---

## `DashboardComponent` (modified)

**File**: `apps/expense-tracker/src/app/components/dashboard/dashboard.component.ts`

### New properties

| Property | Type | Description |
|---|---|---|
| `slices$` | `Observable<CategorySlice[]>` | Derived from `categoryTotals$` via `map(totals => buildSlices(totals, CATEGORY_COLORS))`. Filters zero-value categories. |
| `categoryView` | `CategoryView` (`'list' \| 'chart'`) | Current toggle state. Initialised from `StorageService` on `ngOnInit`; defaults to `'list'`. |

### New methods

| Method | Signature | Description |
|---|---|---|
| `onToggleView` | `(): void` | Flips `categoryView` between `'list'` and `'chart'`; persists new value via `StorageService`. |

### Template additions (data-testid)

| Element | `data-testid` | Notes |
|---|---|---|
| Toggle button (List) | `toggle-list` | Visible when expenses exist; active state when `categoryView === 'list'` |
| Toggle button (Chart) | `toggle-chart` | Visible when expenses exist; active state when `categoryView === 'chart'` |
| Category list container | `category-list` | Existing rows; rendered when `categoryView === 'list'` |
| Donut chart host | `category-chart` | `<app-donut-chart>` wrapper; rendered when `categoryView === 'chart'` |

### Behaviour contract

1. On init: reads `StorageService.get<CategoryView>(CATEGORY_VIEW_STORAGE_KEY)`. If null, defaults to `'list'`.
2. Toggle buttons are rendered only when expenses exist (same guard as today's summary section).
3. `category-list` is shown when `categoryView === 'list'`; hidden when `'chart'`.
4. `category-chart` is shown when `categoryView === 'chart'`; hidden when `'list'`.
5. `<app-donut-chart>` receives `[slices]="(slices$ | async)!"` — the `!` non-null assertion is safe because the chart block is only rendered inside the `@if (expenses.length > 0)` guard.
6. On `onToggleView()`: `StorageService.set(CATEGORY_VIEW_STORAGE_KEY, newView)` is called synchronously before view update.

---

## `buildSlices` (new pure utility)

**File**: `apps/expense-tracker/src/app/utils/chart.utils.ts`

### Signature

```typescript
buildSlices(
  totals: Record<ExpenseCategory, number>,
  colors: Record<ExpenseCategory, string>
): CategorySlice[]
```

### Contract

| Input | Constraint |
|---|---|
| `totals` | Record with all 7 `ExpenseCategory` keys; values ≥ 0 |
| `colors` | Record with all 7 `ExpenseCategory` keys; values are valid CSS colour strings |

| Output constraint | Detail |
|---|---|
| Only non-zero categories included | `amount > 0` filter applied before arc calculation |
| Percentages sum to ≈ 100% | Floating-point tolerance ±0.5% |
| Single entry → full circle | `sweepAngle ≈ 2π` (use `2π - 0.001` to avoid SVG degenerate path) |
| `path` is valid SVG `d` attribute | Verifiable by parsing in tests |
| Result order | Follows `EXPENSE_CATEGORIES` declaration order |

### Error behaviour

- Returns `[]` if all category totals are zero (caller must not render `DonutChartComponent` in this case).
- No exceptions thrown for valid inputs.
