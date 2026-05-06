# Token Audit — Before & After Report — Expense Tracker

**Date:** 2026-05-06
**Auditor:** Expert AI (Claude Sonnet 4.6 Thinking)

---

## Before vs After Comparison

| Metric                       | Before (Pre-Audit) | After (Post-Audit) | Savings                   |
| ---------------------------- | ------------------ | ------------------ | ------------------------- |
| **Total source files**       | 27                 | 27                 | 0                         |
| **Total TS files**           | 20                 | 20                 | 0                         |
| **Lines of Code (TS)**       | 1,474              | 1,478              | +4 (error handling added) |
| **Lines of Code (HTML/CSS)** | 670                | 654                | **-16 lines removed**     |
| **Total Lines of Code**      | 2,144              | 2,132              | **-12 lines**             |
| **Total Tokens (GPT-4)**     | **14,072**         | **14,010**         | **-62 tokens (0.4%)**     |

### Token Change by File Type

| Type      | Before     | After      | Delta                               |
| --------- | ---------- | ---------- | ----------------------------------- |
| `.ts`     | 9,990      | 10,012     | +22 (StorageService error handling) |
| `.html`   | 1,937      | 1,980      | +43 (ARIA attrs + backdrop click)   |
| `.css`    | 2,145      | 2,018      | **-127 (dead CSS removed)**         |
| **Total** | **14,072** | **14,010** | **-62**                             |

### What Changed

| Fix                                                       | Description             | Token Impact |
| --------------------------------------------------------- | ----------------------- | ------------ |
| Removed `.expense-form` CSS (dead code)                   | -40 tokens              |
| Removed `.form-actions` CSS (dead code)                   | -22 tokens              |
| Removed `.back-link` + `.back-link:hover` CSS (dead code) | -65 tokens              |
| Added try/catch to `StorageService.set()`                 | +22 tokens              |
| Added `role="dialog"` + `aria-label` to dialogs           | +20 tokens              |
| Added backdrop-close to delete dialog                     | +18 tokens              |
| Disabled analytics UUID in angular.json                   | +5 tokens               |
| Removed `@angular/animations` from package.json           | -0 tokens (bundle only) |

### Test Results

|                 | Before    | After     |
| --------------- | --------- | --------- |
| **Test suites** | 7 passed  | 7 passed  |
| **Tests**       | 76 passed | 76 passed |

---

## Pre-Audit Baseline (Original Data)

## Summary

| Metric                                  | Value  |
| --------------------------------------- | ------ |
| **Total TS files**                      | 20     |
| **Total source files**                  | 27     |
| **Total Lines of Code (TS)**            | 1,474  |
| **Total Lines of Code (HTML/SCSS/CSS)** | 670    |
| **Total Lines of Code**                 | 2,144  |
| **Total Tokens (GPT-4 tokenizer)**      | 14,072 |

## Token Breakdown by File Type

| Type      | Tokens     |
| --------- | ---------- |
| `.ts`     | 9,990      |
| `.html`   | 1,937      |
| `.css`    | 2,145      |
| **Total** | **14,072** |

## Per-File Token Counts

| Tokens | File                                    |
| ------ | --------------------------------------- |
| 54     | app.component.ts                        |
| 47     | app.config.ts                           |
| 105    | app.routes.ts                           |
| 613    | add-expense.component.html              |
| 819    | add-expense.component.spec.ts           |
| 413    | add-expense.component.ts                |
| 835    | dashboard.component.html                |
| 2,222  | dashboard.component.spec.ts             |
| 711    | dashboard.component.ts                  |
| 154    | delete-confirm-dialog.component.html    |
| 431    | delete-confirm-dialog.component.spec.ts |
| 145    | delete-confirm-dialog.component.ts      |
| 320    | donut-chart.component.css               |
| 246    | donut-chart.component.html              |
| 1,035  | donut-chart.component.spec.ts           |
| 167    | donut-chart.component.ts                |
| 222    | categories.ts                           |
| 177    | expense.model.ts                        |
| 896    | expense.service.spec.ts                 |
| 396    | expense.service.ts                      |
| 334    | storage.service.spec.ts                 |
| 113    | storage.service.ts                      |
| 931    | chart.utils.spec.ts                     |
| 721    | chart.utils.ts                          |
| 89     | index.html                              |
| 51     | main.ts                                 |
| 1,825  | styles.css                              |
