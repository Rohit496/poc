---
description: "Data model for the Expense Category Donut Chart feature"
feature: "002-expense-donut-chart"
---

# Data Model: Expense Category Donut Chart

## Existing Entities (unchanged)

These types are already defined in `apps/expense-tracker/src/app/models/expense.model.ts` and
`apps/expense-tracker/src/app/constants/categories.ts`. They are referenced here for completeness;
this feature MUST NOT modify them.

### `ExpenseCategory` (existing union type)
```
'Food' | 'Transport' | 'Housing' | 'Entertainment' | 'Health' | 'Shopping' | 'Other'
```

### `EXPENSE_CATEGORIES` (existing constant)
```
ExpenseCategory[]  — all 7 values in declaration order
```

---

## New View-Model

### `CategorySlice`

**Location**: `apps/expense-tracker/src/app/models/expense.model.ts`  
(added alongside existing types — same domain, no separate file needed)

| Field | Type | Description |
|---|---|---|
| `category` | `ExpenseCategory` | The category this slice represents |
| `amount` | `number` | All-time total spending for this category (≥ 0.01; zero-value categories are excluded before this type is constructed) |
| `percentage` | `number` | `(amount / allTimeTotal) * 100`, rounded to 1 decimal place |
| `color` | `string` | Hex colour string from `CATEGORY_COLORS` constant |
| `path` | `string` | SVG path `d` attribute string for this slice's arc |
| `startAngle` | `number` | Starting angle in radians (used for tooltip positioning) |
| `sweepAngle` | `number` | Arc sweep in radians |

**Invariants**:
- Array length is 1–7 (zero-value categories excluded at construction time)
- `sum(percentage)` ≈ 100 (floating-point tolerance ±0.1%)
- Single-slice array: `sweepAngle` = 2π (full circle)
- `path` strings are pre-computed; `DonutChartComponent` renders them without further calculation

---

## New Constants

### `CATEGORY_COLORS`

**Location**: `apps/expense-tracker/src/app/constants/categories.ts`  
(added alongside existing `EXPENSE_CATEGORIES`, `STORAGE_KEY`, etc.)

```
Record<ExpenseCategory, string>
```

| Key | Value | Visual |
|---|---|---|
| `'Food'` | `'#4CAF50'` | Green |
| `'Transport'` | `'#2196F3'` | Blue |
| `'Housing'` | `'#FF9800'` | Orange |
| `'Entertainment'` | `'#9C27B0'` | Purple |
| `'Health'` | `'#F44336'` | Red |
| `'Shopping'` | `'#00BCD4'` | Cyan |
| `'Other'` | `'#607D8B'` | Grey |

### `CATEGORY_VIEW_STORAGE_KEY`

**Location**: `apps/expense-tracker/src/app/constants/categories.ts`

```
string = 'expense-tracker:category-view'
```

Namespaced under `'expense-tracker:'` prefix to match existing `STORAGE_KEY`.

### `DONUT_OUTER_RADIUS` / `DONUT_INNER_RADIUS` / `DONUT_CENTER`

**Location**: `apps/expense-tracker/src/app/constants/categories.ts`

| Constant | Value | Purpose |
|---|---|---|
| `DONUT_OUTER_RADIUS` | `80` | Outer radius in SVG user units |
| `DONUT_INNER_RADIUS` | `45` | Inner radius (donut hole) in SVG user units |
| `DONUT_CENTER` | `100` | `cx`/`cy` — viewBox is `0 0 200 200` |

---

## New Utility

### `buildSlices(totals, colors)`

**Location**: `apps/expense-tracker/src/app/utils/chart.utils.ts`  
**Signature**: `buildSlices(totals: Record<ExpenseCategory, number>, colors: Record<ExpenseCategory, string>): CategorySlice[]`

- Filters out zero-value categories
- Computes `allTimeTotal = sum of non-zero amounts`
- For each non-zero category, computes `percentage`, `startAngle`, `sweepAngle`, and `path`
- Returns `CategorySlice[]` sorted by `EXPENSE_CATEGORIES` order
- **Pure function** — no side effects, no Angular injection (Constitution Principle VI)

---

## Toggle State

### `CategoryView`

**Location**: `apps/expense-tracker/src/app/models/expense.model.ts`

```
type CategoryView = 'list' | 'chart'
```

Stored as a string in `localStorage` under `CATEGORY_VIEW_STORAGE_KEY`.  
Default when no stored value exists: `'list'`.

---

## Data Flow

```
ExpenseService.expenses$
  └─► DashboardComponent.categoryTotals$  (existing pipe: map → getCategoryTotals())
        └─► DashboardComponent.slices$    (new pipe: map → buildSlices(totals, CATEGORY_COLORS))
              └─► DonutChartComponent @Input() slices  (renders SVG paths)

StorageService.get(CATEGORY_VIEW_STORAGE_KEY)
  └─► DashboardComponent.categoryView    (signal/property, initialised on ngOnInit)
        ├─► toggle button binding (active state)
        └─► @if / conditional rendering of list rows vs. DonutChartComponent

DashboardComponent.onToggle()
  └─► StorageService.set(CATEGORY_VIEW_STORAGE_KEY, newView)
  └─► categoryView = newView
```
