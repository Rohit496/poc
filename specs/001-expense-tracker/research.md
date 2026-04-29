# Research: Expense Tracker

**Branch**: `001-expense-tracker` | **Date**: 2026-04-29

## Angular 17+ Standalone Architecture

**Decision**: Angular 17+ standalone components with no NgModules.
**Rationale**: Standalone is the Angular default from v17 onward. Each component declares its
own imports, eliminating NgModule boilerplate and aligning with Principle VI (SRP per file).
The Angular CLI scaffolds standalone by default.
**Alternatives considered**: NgModule-based architecture — verbose, now a legacy path; rejected.

## Angular Router Configuration

**Decision**: Two eager routes defined in `app.routes.ts` via `provideRouter`:
- `/` → `DashboardComponent`
- `/add` → `AddExpenseComponent`

Delete is an inline action on the dashboard — no separate route needed.
**Rationale**: Two routes do not benefit from lazy loading (Principle V, YAGNI). Eager routes
avoid a flash of loading state on navigation. The `DeleteConfirmDialogComponent` is rendered
conditionally within the dashboard, not routed.
**Alternatives considered**: Lazy-loaded feature modules — justified only when route count or
bundle size warrants it; neither applies here.

## "App Router / Route Handlers / Server Actions" → Angular Mapping

**Decision**: These are Next.js 13+ concepts. Mapped to Angular equivalents:

| Next.js Term | Angular Equivalent |
|---|---|
| App router | `app.routes.ts` + `provideRouter` in `app.config.ts` |
| Route handlers | Route definitions in `app.routes.ts` |
| Server actions | Injectable Angular services (`ExpenseService`, `StorageService`) |

The `src/server/` folder is created as a placeholder per user request. Since persistence is
LocalStorage (client-side only), no server runtime is required and the folder contains only
a `.gitkeep`.
**Rationale**: Angular is a client-side framework; replicating Next.js server primitives is
out of scope and would violate Principle V (YAGNI).

## LocalStorage Persistence Pattern

**Decision**: `StorageService` is a thin, injectable wrapper around the browser's
`localStorage` API. `ExpenseService` depends on `StorageService` exclusively — no component
ever touches `localStorage` directly.
**Rationale**: Wrapping localStorage enables injection of a test-double `StorageService` in
unit tests (Principle III, Test-First). Keeps `ExpenseService` focused on business logic
(Principle VI, SRP). Conforms to Angular DI requirement (Principle VII).
**LocalStorage key**: `expense-tracker:expenses` (namespaced to avoid key collisions).
**Alternatives considered**: Direct `localStorage` calls in components or `ExpenseService` —
untestable and violates SRP; rejected.

## State Management

**Decision**: `ExpenseService` maintains a `BehaviorSubject<Expense[]>` as the single source
of truth, exposing an `expenses$: Observable<Expense[]>` stream. Components subscribe via the
`async` pipe and trigger no direct mutations.
**Rationale**: `BehaviorSubject` is framework-native (no extra dependencies, Principle V),
emits synchronously on subscription (useful for testing), and gives `OnPush` components a
reactive stream to observe without default change detection polling (Principle VII).
**Alternatives considered**:
- Angular Signals — valid and forward-looking, but BehaviorSubject is more established for
  this pattern and avoids a migration concern if targeting Angular <17.2.
- NgRx Store — unnecessary for a 3-action, single-entity app; rejected (Principle V, YAGNI).

## Angular Reactive Forms

**Decision**: `ReactiveFormsModule` with `FormGroup` and `Validators` for the add-expense form.
**Rationale**: Reactive forms are fully testable without DOM interaction (Principle III) and
provide synchronous validation needed for amount (positive number) and category (enum member).
Form state is kept in the component's `FormGroup`, not in a service — component owns its input
state (Principle VII, stateless re: business data).
**Alternatives considered**: Template-driven forms — harder to unit-test; less explicit about
validation rules; rejected.

## OnPush Change Detection

**Decision**: `changeDetection: ChangeDetectionStrategy.OnPush` on all three components.
**Rationale**: Constitution Principle VII mandates OnPush. The `expenses$` BehaviorSubject
stream and `async` pipe drive rendering — no imperative `markForCheck()` calls needed.
Delete confirmation state is a local `boolean` signal within the dashboard component, toggled
via component method — this correctly triggers OnPush re-evaluation.

## Testing Framework

**Decision**: Jest with `jest-preset-angular`.
**Rationale**: The repository already uses Jest as the authoritative test gate (`npm test`,
Principle III). `jest-preset-angular` provides Angular-specific transforms (inline templates,
Angular compiler) and makes `TestBed` available in Jest environment. Karma/Jasmine would
conflict with the existing Jest configuration and introduce a second test runner.
**Alternatives considered**: Karma + Jasmine (Angular CLI default) — incompatible with the
existing Jest-only repo setup; rejected.

## Amount Rounding

**Decision**: Round to 2 decimal places in `ExpenseService.addExpense()` using
`Math.round(amount * 100) / 100` before persisting.
**Rationale**: Spec edge case states "entries with more decimals are rounded on save". Rounding
at the service layer (not the form layer) ensures consistency regardless of how data enters the
system.
