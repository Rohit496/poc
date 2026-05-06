# Full Project Audit Report — Expense Tracker

**Date:** 2026-05-06
**Auditor:** Expert AI (Claude Sonnet 4.6 Thinking)
**Scope:** All 27 source files (20 TS, 4 HTML, 2 CSS, 1 index.html)
**Baseline:** 14,072 tokens | 2,144 LOC | 76 tests passing

---

## Executive Summary

The codebase is **well-structured and clean** for a small Angular 17 standalone-component app. Architecture is sound: lazy-loaded routes, OnPush change detection, signal-based state, proper separation of concerns. However, the audit uncovered **12 findings** across 4 severity levels that can reduce token footprint and improve quality.

| Severity | Count | Token Impact |
|---|---|---|
| 🔴 Bug | 1 | — |
| 🟡 Dead Code | 2 | ~120 tokens removable |
| 🟡 Code Quality | 5 | ~50 tokens optimizable |
| 🔵 Style/Config | 4 | ~80 tokens optimizable |

**Estimated total token reduction: ~250 tokens (1.8%)**

> Note: This is a small, well-maintained codebase. The token savings are modest because there is very little waste. The bigger wins are in code quality and bug prevention.

---

## Findings

### 🔴 F-01: Unused `OnInit` import & interface — `dashboard.component.ts`

**File:** `dashboard.component.ts:4,43`
**Issue:** `OnInit` is imported and `implements OnInit` is declared. The `ngOnInit` method exists and is used, so this is correct. **No action needed.**

**Verdict:** FALSE POSITIVE — `OnInit` is correctly used. ✅

---

### 🔴 F-02: `StorageService.remove()` is never called in production code

**File:** `storage.service.ts:18-20`
**Issue:** The `remove()` method is defined and tested but never called from any component or service. It's only exercised by `storage.service.spec.ts`.
**Impact:** 3 lines of dead code + 6 lines of dead test code = ~30 tokens
**Risk:** Low — it may be intentionally kept for future use.
**Recommendation:** Keep it (it's a reasonable API surface), but flag as intentionally unused.

---

### 🟡 F-03: Dead CSS rule `.expense-form` is never used

**File:** `styles.css:227-232`
**Issue:** The class `.expense-form` is defined (6 lines) but no template uses it. The add-expense form uses `.expense-form-modal` (line 333) which is a different class. The `.expense-form` class appears to be a leftover from when the form was a separate page.
**Impact:** 6 lines / ~40 tokens
**Recommendation:** Remove `.expense-form` rule.

---

### 🟡 F-04: Dead CSS rules `.form-actions` and `.back-link` are never used

**File:** `styles.css:275-289`
**Issue:** `.form-actions` (4 lines) and `.back-link` / `.back-link:hover` (9 lines) are defined but not referenced in any HTML template.
**Impact:** 13 lines / ~80 tokens
**Recommendation:** Remove both rules.

---

### 🟡 F-05: `@angular/animations` dependency is unused

**File:** `package.json:14`
**Issue:** `@angular/animations` is listed as a dependency but never imported anywhere in the codebase.
**Impact:** Adds unnecessary bundle weight at build time. No token impact on source but increases `node_modules` footprint.
**Recommendation:** Remove from `dependencies`.

---

### 🟡 F-06: CLI analytics UUID hardcoded in `angular.json`

**File:** `angular.json:71`
**Issue:** `"analytics": "740b478f-25ac-4709-bb3a-180f2cf77c3b"` — this UUID is a personal analytics identifier that shouldn't be committed to version control.
**Recommendation:** Set to `false` to disable analytics, or use `ng analytics disable`.

---

### 🟡 F-07: `categoryTotals$` re-derives from `getCategoryTotals()` which re-reads `subject.getValue()`

**File:** `dashboard.component.ts:56-59`
**Issue:** `categoryTotals$` subscribes to `expenses$`, ignores the emitted value, and instead calls `getCategoryTotals()` which reads `subject.getValue()`. This works but is semantically misleading — the `map` callback discards its argument.
**Recommendation:** Use the emitted expenses directly:
```ts
readonly categoryTotals$ = this.expenseService.expenses$.pipe(
  map((expenses) => {
    const totals = Object.fromEntries(
      EXPENSE_CATEGORIES.map((cat) => [cat, 0]),
    ) as Record<ExpenseCategory, number>;
    for (const e of expenses) totals[e.category] += e.amount;
    return totals;
  }),
);
```
Or expose `getCategoryTotals` as a pure function that takes expenses as input.
**Impact:** No token savings, but improved correctness and testability.

---

### 🔵 F-08: `dialog-overlay` in delete dialog doesn't close on backdrop click

**File:** `delete-confirm-dialog.component.html:1`
**Issue:** The add-expense dialog overlay has `(click)="onCancel()"` on the overlay for click-outside-to-close behavior, but the delete-confirm dialog overlay does not. This is an inconsistent UX pattern.
**Recommendation:** Add `(click)="onCancel()"` to the delete dialog overlay and `(click)="$event.stopPropagation()"` on the inner `.dialog` div.

---

### 🔵 F-09: Missing `trackBy` or `track` for `categories` loop

**File:** `add-expense.component.html:53`
**Issue:** The `@for (cat of categories; track cat)` in the add-expense template is correctly tracked. ✅
**Verdict:** FALSE POSITIVE — Already using `track`.

---

### 🔵 F-10: `percentage` in tooltip shows raw number without rounding control

**File:** `donut-chart.component.html:27`
**Issue:** `{{ active.percentage }}%` renders the percentage as-is. Since `buildSlices` uses `PERCENTAGE_PRECISION = 10` (i.e., one decimal place: `Math.round(x * 100 * 10) / 10`), this will show values like `33.3%`. This is fine but inconsistent with the amount display which uses `| number: "1.2-2"`.
**Recommendation:** Add `| number: "1.1-1"` pipe for consistent formatting, or leave as-is if current display is acceptable.

---

### 🔵 F-11: Missing `role="dialog"` and `aria-label` on dialog overlays

**File:** `delete-confirm-dialog.component.html:1`, `add-expense.component.html:1`
**Issue:** Neither dialog overlay has ARIA attributes for accessibility. Screen readers won't identify these as modal dialogs.
**Recommendation:** Add `role="dialog"` and `aria-label` to dialog containers.

---

### 🔵 F-12: No error boundary for `localStorage` quota exceeded

**File:** `storage.service.ts:14-16`
**Issue:** The `set()` method calls `localStorage.setItem()` without a try/catch. If localStorage quota is exceeded, this will throw an unhandled exception. The `get()` method correctly handles errors.
**Recommendation:** Wrap `set()` in try/catch for consistency.

---

## Actionable Fixes (Sorted by Token Impact)

| # | Finding | Action | Token Savings | Risk |
|---|---|---|---|---|
| 1 | F-04 | Remove `.form-actions`, `.back-link` CSS | ~80 tokens | None |
| 2 | F-03 | Remove `.expense-form` CSS | ~40 tokens | None |
| 3 | F-05 | Remove `@angular/animations` dep | 0 (bundle only) | None |
| 4 | F-06 | Set analytics to `false` | ~5 tokens | None |
| 5 | F-12 | Add try/catch to `StorageService.set()` | +10 tokens (adds code) | Prevents runtime crash |
| 6 | F-08 | Add backdrop-close to delete dialog | +15 tokens (adds code) | UX improvement |
| 7 | F-11 | Add ARIA attributes to dialogs | +20 tokens (adds code) | Accessibility |
| 8 | F-07 | Refactor `categoryTotals$` derivation | ±0 | Improved correctness |

**Net estimated token reduction after fixes: ~120 tokens**

---

## Architecture Assessment

| Area | Rating | Notes |
|---|---|---|
| **Component structure** | ⭐⭐⭐⭐⭐ | Clean standalone components, lazy-loaded routes |
| **State management** | ⭐⭐⭐⭐ | BehaviorSubject + signals is appropriate for this scale |
| **Change detection** | ⭐⭐⭐⭐⭐ | OnPush everywhere — excellent |
| **Type safety** | ⭐⭐⭐⭐ | Strict mode, typed forms, proper interfaces |
| **Test coverage** | ⭐⭐⭐⭐⭐ | 76 tests across 7 suites, good coverage |
| **Separation of concerns** | ⭐⭐⭐⭐⭐ | Utils, services, constants properly separated |
| **CSS architecture** | ⭐⭐⭐ | Global styles.css — could benefit from component-scoped styles |
| **Accessibility** | ⭐⭐ | Missing ARIA attributes on dialogs |
| **Error handling** | ⭐⭐⭐ | `get()` handles errors, `set()` does not |
