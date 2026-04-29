---
description: "Developer quickstart for the Expense Category Donut Chart feature"
feature: "002-expense-donut-chart"
---

# Quickstart: Expense Category Donut Chart

## Prerequisites

- Node.js 18+ and npm installed
- Angular CLI (`npm install -g @angular/cli`)
- Repository cloned and dependencies installed:
  ```bash
  cd apps/expense-tracker
  npm install
  ```

---

## Run the app locally

```bash
cd apps/expense-tracker
npx ng serve
# Open http://localhost:4200
```

To see the donut chart:
1. Click **+ Add Expense**, enter at least two expenses in different categories, and save.
2. Return to the dashboard — you should see **List / Chart** toggle buttons above the category breakdown.
3. Click **Chart** to switch to the donut chart view; hover a slice to see the tooltip.
4. Reload the page — the chart view should be restored automatically.

---

## Run tests

```bash
# All tests (from apps/expense-tracker/)
npm test

# Watch mode
npx jest --watch

# Single spec file
npx jest donut-chart.component.spec.ts

# With coverage
npx jest --coverage
```

---

## Key files for this feature

| File | Purpose |
|---|---|
| `src/app/utils/chart.utils.ts` | Pure `buildSlices()` function — arc geometry computation |
| `src/app/utils/chart.utils.spec.ts` | Unit tests for `buildSlices()` (no Angular TestBed) |
| `src/app/constants/categories.ts` | Add `CATEGORY_COLORS`, `CATEGORY_VIEW_STORAGE_KEY`, `DONUT_OUTER_RADIUS`, `DONUT_INNER_RADIUS`, `DONUT_CENTER` |
| `src/app/models/expense.model.ts` | Add `CategorySlice` interface and `CategoryView` type |
| `src/app/components/donut-chart/donut-chart.component.ts` | New presentational component — renders SVG slices + tooltip |
| `src/app/components/donut-chart/donut-chart.component.html` | SVG template |
| `src/app/components/donut-chart/donut-chart.component.spec.ts` | Component unit tests |
| `src/app/components/dashboard/dashboard.component.ts` | Add `slices$`, `categoryView`, `onToggleView()`, `ngOnInit` |
| `src/app/components/dashboard/dashboard.component.html` | Add toggle buttons + conditional rendering |
| `src/app/components/dashboard/dashboard.component.spec.ts` | Add toggle + persistence tests |

---

## SVG geometry cheat sheet

The donut chart uses a `viewBox="0 0 200 200"` SVG with:
- **Centre**: `(100, 100)`
- **Outer radius**: `80`
- **Inner radius**: `45`

Each slice is a `<path>` with arc commands. The `buildSlices()` utility in `chart.utils.ts`
handles all geometry — implementors only need to bind `[attr.d]="slice.path"` in the template.

Arc starts at the top (−π/2) and sweeps clockwise. A single-category scenario uses
`sweepAngle = 2π − 0.001` to avoid the degenerate case where start and end points coincide.

---

## Debugging tips

- **Slice not showing?** — Check that `amount > 0` for the category. Zero-value categories are
  filtered out by `buildSlices()`.
- **Tooltip not appearing?** — Verify `(mouseenter)` / `(mouseleave)` bindings on `<path>` elements
  and that `activeSlice` is being set correctly. Note: `pointer-events: all` is required on SVG
  paths (default is `visiblePainted` which may miss thin slices).
- **Toggle not persisting?** — Confirm `CATEGORY_VIEW_STORAGE_KEY` matches in both the write
  (`onToggleView`) and read (`ngOnInit`) paths.
- **OnPush not updating chart?** — Ensure `slices$` emits a new array reference on each expense
  change. Since it is derived from `expenses$` via `map`, a new emission will always produce a
  new array.
