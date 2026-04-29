# Quickstart: Expense Tracker

**Branch**: `001-expense-tracker` | **Date**: 2026-04-29

## Prerequisites

- Node.js 18+
- Angular CLI 17+: `npm install -g @angular/cli@17`

## Setup

```bash
# From repo root — create and enter the Angular app directory
cd apps/expense-tracker
npm install
```

## Development Server

```bash
# Serves at http://localhost:4200 with live reload
ng serve
```

## Running Tests

```bash
# From apps/expense-tracker/
npx jest            # Run all tests once
npx jest --watch    # Watch mode (re-runs on file change)
npx jest --coverage # Generate coverage report
```

## Production Build

```bash
ng build
# Output: apps/expense-tracker/dist/expense-tracker/
```

## Key Files

| File | Purpose |
|------|---------|
| `src/app/app.routes.ts` | Route definitions (`/` dashboard, `/add` form) |
| `src/app/app.config.ts` | Angular providers (`provideRouter`, etc.) |
| `src/app/models/expense.model.ts` | `Expense` interface and `ExpenseCategory` type |
| `src/app/constants/categories.ts` | `EXPENSE_CATEGORIES` constant array |
| `src/app/services/expense.service.ts` | All expense business logic |
| `src/app/services/storage.service.ts` | LocalStorage abstraction |
| `src/app/components/dashboard/` | Dashboard component (recent expenses + totals) |
| `src/app/components/add-expense/` | Add expense form |
| `src/app/components/delete-confirm-dialog/` | Inline delete confirmation |
| `src/server/` | Placeholder — no implementation (future server-side expansion) |

## LocalStorage

All data is stored in the browser under key `expense-tracker:expenses`.
To reset all data during development, run in the browser console:

```javascript
localStorage.removeItem('expense-tracker:expenses');
```

## Project Layout

```
apps/expense-tracker/
├── angular.json
├── package.json
├── tsconfig.json        ← strict: true
└── src/
    ├── app/
    │   ├── app.component.ts
    │   ├── app.config.ts
    │   ├── app.routes.ts
    │   ├── constants/categories.ts
    │   ├── models/expense.model.ts
    │   ├── services/
    │   │   ├── expense.service.ts
    │   │   └── storage.service.ts
    │   └── components/
    │       ├── dashboard/
    │       ├── add-expense/
    │       └── delete-confirm-dialog/
    └── server/          ← placeholder (.gitkeep)
```
