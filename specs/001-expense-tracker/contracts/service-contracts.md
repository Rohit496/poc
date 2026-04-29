# Service Contracts: Expense Tracker

**Branch**: `001-expense-tracker` | **Date**: 2026-04-29

This document defines the public API contracts for the two injectable Angular services.
These contracts govern what components may call and what guarantees each service provides.
Components MUST NOT access `localStorage` directly — all persistence flows through
`StorageService` via `ExpenseService`.

---

## ExpenseService

**File**: `src/app/services/expense.service.ts`
**Scope**: `providedIn: 'root'`

Single source of truth for all expense data. Owns the BehaviorSubject and all reads/writes
to `StorageService`.

### Public API

```typescript
@Injectable({ providedIn: 'root' })
class ExpenseService {

  // Observable stream of all expenses, sorted newest-first.
  // Emits immediately on subscription with current state (BehaviorSubject).
  readonly expenses$: Observable<Expense[]>;

  // Adds a new expense. Generates id and createdAt. Rounds amount to 2 decimal places.
  // Updates both in-memory state and LocalStorage atomically.
  // Returns the created Expense (including generated id and createdAt).
  addExpense(input: NewExpenseInput): Expense;

  // Removes the expense with the given id.
  // If id is not found, this is a no-op (does not throw).
  // Updates both in-memory state and LocalStorage atomically.
  deleteExpense(id: string): void;

  // Returns the sum of all expense amounts across all time.
  // Returns 0 when no expenses exist.
  getAllTimeTotal(): number;

  // Returns an object mapping each ExpenseCategory to its all-time total.
  // Categories with no expenses have a value of 0.
  getCategoryTotals(): Record<ExpenseCategory, number>;

  // Returns the `limit` most recent expenses (default: 10), sorted newest-first.
  getRecentExpenses(limit?: number): Expense[];
}
```

### Invariants

- `expenses$` MUST always emit the full list sorted by `createdAt` descending.
- `addExpense()` MUST generate `id` via `crypto.randomUUID()` and `createdAt` via
  `new Date().toISOString()`. These fields MUST NOT be supplied by the caller.
- `addExpense()` MUST round `amount` to 2 decimal places before storing.
- `deleteExpense()` MUST update both the BehaviorSubject and LocalStorage before returning.
- `getAllTimeTotal()` and `getCategoryTotals()` MUST read from the current in-memory state —
  no additional LocalStorage reads.
- `getCategoryTotals()` MUST return an entry for every `ExpenseCategory`, even those with
  a total of 0.

---

## StorageService

**File**: `src/app/services/storage.service.ts`
**Scope**: `providedIn: 'root'`

Thin, injectable abstraction over `localStorage`. Enables test injection of a mock storage
backend without touching the browser API.

### Public API

```typescript
@Injectable({ providedIn: 'root' })
class StorageService {

  // Retrieves and deserializes the value at `key`.
  // Returns null if the key is absent or the stored value fails JSON.parse.
  // Never throws.
  get<T>(key: string): T | null;

  // Serializes `value` via JSON.stringify and stores it at `key`.
  set<T>(key: string, value: T): void;

  // Removes the entry at `key`. No-op if key is absent.
  remove(key: string): void;
}
```

### Invariants

- `get<T>()` MUST catch JSON parse errors and return `null` instead of throwing.
- `set<T>()` MUST serialize with `JSON.stringify` before writing.
- `StorageService` MUST NOT contain any domain logic — it is a pure I/O wrapper.

---

## Angular Route Contract

**File**: `src/app/app.routes.ts`

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `DashboardComponent` | Shows 10 recent expenses + all-time totals; inline delete |
| `/add` | `AddExpenseComponent` | Reactive form to record a new expense |

No route guards are required (no auth). Navigation from `/add` back to `/` occurs
programmatically after a successful `addExpense()` call via Angular `Router.navigate(['/'])`.
