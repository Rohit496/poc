---
description: "Research findings for the Expense Category Donut Chart feature"
feature: "002-expense-donut-chart"
---

# Research: Expense Category Donut Chart

## 1. SVG Donut Chart — Arc Geometry

### Decision
Use SVG `<path>` elements with the `arc` command (`A`) to draw each slice. The donut hole is achieved by setting `stroke-width` to the desired hole radius on a `<circle>` — or equivalently by computing inner/outer radius paths. The two-path (inner arc + outer arc joined by lines) approach gives the cleanest Angular template.

### Rationale
- Pure SVG, zero runtime dependencies — satisfies FR-012 and Constitution Principle V (no external deps).
- Angular's binding model maps naturally: `@for` over `CategorySlice[]`, each slice bound to a `<path [attr.d]="slice.path"`.
- `viewBox` + `preserveAspectRatio` gives responsive scaling for free (SC-001, mobile edge case).

### Key formula (TypeScript)
```text
Given: total angle = (amount / totalAmount) * 2π
  startX = cx + r * cos(startAngle)
  startY = cy + r * sin(startAngle)
  endX   = cx + r * cos(startAngle + sweepAngle)
  endY   = cy + r * sin(startAngle + sweepAngle)
  largeArcFlag = sweepAngle > π ? 1 : 0

Outer arc path (clockwise):
  M startX startY  A r r 0 largeArcFlag 1 endX endY

Inner arc path (counter-clockwise, for donut hole):
  L innerEndX innerEndY  A innerR innerR 0 largeArcFlag 0 innerStartX innerStartY  Z
```

### Alternatives Considered
| Alternative | Rejected because |
|---|---|
| `<circle stroke-dasharray>` trick | Only works cleanly for a single slice; multi-slice requires transform hacks |
| Third-party library (Chart.js, D3) | Violates FR-012 and Constitution Principle V (no runtime deps) |
| Canvas `<canvas>` | Violates FR-012; harder to test in Jest/jsdom |

---

## 2. Angular `DonutChartComponent` — Slice Computation Location

### Decision
Slice geometry (path strings, colours, percentages) is computed in `DashboardComponent` and passed to `DonutChartComponent` as a `CategorySlice[]` input. `DonutChartComponent` is a **pure presentational component**: it receives pre-computed slices and emits tooltip events.

### Rationale
- Keeps `DonutChartComponent` independently testable with simple `@Input()` mocking (SC-008).
- `DashboardComponent` already owns the reactive `categoryTotals$` pipeline — slice computation is a `map()` on top.
- Follows Constitution Principle VI (each function one responsibility) and Principle VII (components stateless, delegate logic to services).

### Alternatives Considered
| Alternative | Rejected because |
|---|---|
| Compute paths inside `DonutChartComponent` | Mixes presentation with domain math; harder to unit-test slice calculations in isolation |
| Dedicated `ChartService` | Over-engineering for pure view-model derivation; YAGNI (Constitution Principle V) |

---

## 3. Tooltip Implementation

### Decision
Tooltip is implemented as an inline SVG `<foreignObject>` (or a sibling `<div>` positioned absolutely via CSS) shown/hidden via Angular binding. State: `activeSlice: CategorySlice | null` on `DonutChartComponent`. Mouse events (`mouseenter`/`mouseleave`) on each `<path>` set/clear `activeSlice`.

### Rationale
- No overlay portal library needed.
- SVG `<foreignObject>` allows rich HTML (formatted `$42.50`, `18%`) without manual SVG text wrapping.
- `(mouseenter)` / `(mouseleave)` bindings are idiomatic Angular; pointer events on touch are handled by `(touchstart)` + `(touchend)`.

### Alternatives Considered
| Alternative | Rejected because |
|---|---|
| Angular CDK Overlay | External dep (violates lean-bundle goal); overkill for a single tooltip |
| SVG `<title>` element | Browser-native tooltip; no styling control, no percentage display, not dismissable on mobile |

---

## 4. List/Chart Toggle — View State Persistence

### Decision
Toggle state is a `'list' | 'chart'` string stored under the key `'expense-tracker:category-view'` via the existing `StorageService`. `DashboardComponent` reads the saved value on `ngOnInit` (defaulting to `'list'`) and writes it on every toggle.

### Rationale
- `StorageService` already abstracts `localStorage`; adding one more key requires zero new infrastructure.
- `DashboardComponent` is the natural owner of UI layout state (Constitution Principle VII: state in services/components, not in child presentational components).
- Key is namespaced under `'expense-tracker:'` prefix consistent with existing `STORAGE_KEY`.

### Alternatives Considered
| Alternative | Rejected because |
|---|---|
| New dedicated UI-state service | Adds abstraction for a single boolean; YAGNI |
| Angular signal store | Not yet in use in this project; would require new pattern introduction |
| Session storage | User asked for persistence across reloads (clarification Q2 → Option B) |

---

## 5. Colour Palette

### Decision
A fixed 7-colour palette is defined as a named constant `CATEGORY_COLORS: Record<ExpenseCategory, string>` in `apps/expense-tracker/src/app/constants/categories.ts` (alongside existing constants).

```text
Food          → #4CAF50  (green)
Transport     → #2196F3  (blue)
Housing       → #FF9800  (orange)
Entertainment → #9C27B0  (purple)
Health        → #F44336  (red)
Shopping      → #00BCD4  (cyan)
Other         → #607D8B  (grey)
```

### Rationale
- Named constant satisfies Constitution Principle VI (no magic strings/numbers).
- Hues are perceptually distinct across all 7 categories; passes WCAG 1.4.1 (use of colour is supplemental — category name also shown in tooltip).
- Co-located with `EXPENSE_CATEGORIES` for discoverability.

### Alternatives Considered
| Alternative | Rejected because |
|---|---|
| Colours inside `DonutChartComponent` | Mixes presentation detail with domain constant; harder to keep in sync if categories change |
| CSS custom properties per category | More complex; same colours still need a source of truth |

---

## 6. Change Detection & OnPush Compatibility

### Decision
`DonutChartComponent` uses `OnPush`. `DashboardComponent` already uses `OnPush`. The `slices$` observable (derived in `DashboardComponent`) is consumed via `async` pipe, which marks the view dirty on emission. `DonutChartComponent` receives `@Input() slices` bound from the async value — Angular's `OnPush` tracks `@Input` reference changes automatically.

### Rationale
- Consistent with Constitution Principle VII requirement for `OnPush` on all components.
- Avoids need for manual `ChangeDetectorRef.markForCheck()`.

---

## 7. Test Strategy

### Unit tests needed
| File | What to test |
|---|---|
| `donut-chart.component.spec.ts` | Correct number of `<path>` elements; zero-value slice absent; tooltip shows/hides on mouseenter/mouseleave; single-category = full circle (360°) |
| `dashboard.component.spec.ts` (additions) | Toggle defaults to "list"; toggle switches views; preference read from StorageService on init; preference written on toggle; chart not rendered in empty state |

### Slice geometry helper
Extract the arc-path calculation into a **pure function** `buildSlices(totals, total)` in a separate file (`src/app/utils/chart.utils.ts`). Unit-test this function directly with numeric inputs — no Angular TestBed required, fast and deterministic.
