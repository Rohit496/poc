# Feature Specification: Expense Tracker

**Feature Branch**: `001-expense-tracker`
**Created**: 2026-04-29
**Status**: Draft
**Input**: User description: "I would like to build a Basic expense tracking app (add, view, delete expenses). Track personal expenses with amount, date, category, and description. Simple dashboard showing recent expenses and basic totals. Do not implement user auth, as this is just a personal tracker for myself."

## Clarifications

### Session 2026-04-29

- Q: What time range should dashboard spending totals cover? → A: All-time total (all recorded expenses, no date filter)
- Q: What happens when more than 10 expenses exist — are older ones accessible? → A: Top 10 most recent only; older expenses are not accessible from the dashboard but still count toward all-time totals

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Record an Expense (Priority: P1)

The user adds a new expense by entering the amount spent, the date it occurred, a category, and an optional description. After saving, the expense appears in the dashboard.

**Why this priority**: Recording expenses is the foundational action — without it there is nothing to view or delete. The entire app's value depends on this story being functional first.

**Independent Test**: Can be fully tested by submitting a valid expense form and confirming the new entry appears in the expense list, delivering the core data-capture value on its own.

**Acceptance Scenarios**:

1. **Given** the user is on the add expense screen, **When** they enter a valid amount, date, and category and submit, **Then** the expense is saved and appears in the recent expenses list on the dashboard.
2. **Given** the user leaves the amount field empty, **When** they attempt to submit, **Then** the form shows a clear validation error and does not save the expense.
3. **Given** the user enters a negative or zero amount, **When** they attempt to submit, **Then** the form shows a validation error stating the amount must be greater than zero.
4. **Given** the user omits the description, **When** they submit with a valid amount, date, and category, **Then** the expense is saved successfully (description is optional).

---

### User Story 2 - View Dashboard and Expense List (Priority: P2)

The user opens the dashboard and immediately sees their recent expenses alongside total spending figures. They can scan spending patterns without navigating away.

**Why this priority**: Visibility into spending is the primary reason to use the tracker. This story is the main consumption surface and delivers ongoing value after expenses are recorded.

**Independent Test**: Can be fully tested by pre-loading a set of known expenses and confirming the dashboard displays them correctly with accurate totals, independently of the add or delete flows.

**Acceptance Scenarios**:

1. **Given** the user has recorded expenses, **When** they open the dashboard, **Then** they see the 10 most recent expenses listed with amount, date, category, and description.
2. **Given** the user has recorded expenses, **When** they view the dashboard, **Then** they see an all-time total spending figure and an all-time per-category spending breakdown covering every expense ever recorded.
3. **Given** the user has recorded no expenses, **When** they open the dashboard, **Then** they see a clear empty state message encouraging them to add their first expense.

---

### User Story 3 - Delete an Expense (Priority: P3)

The user selects an expense from the list and permanently removes it. The dashboard totals update immediately to reflect the deletion.

**Why this priority**: Deletion handles mistakes and keeps the data accurate. It builds on story 1 (expenses must exist to delete) and completes the core CRUD surface.

**Independent Test**: Can be fully tested by recording an expense, deleting it, and confirming it no longer appears in the list and that the totals have decreased by the deleted amount.

**Acceptance Scenarios**:

1. **Given** the user sees an expense in the list, **When** they choose to delete it, **Then** a confirmation prompt appears before the deletion is executed.
2. **Given** the confirmation prompt is shown, **When** the user confirms, **Then** the expense is permanently removed and the dashboard list and totals update immediately.
3. **Given** the confirmation prompt is shown, **When** the user cancels, **Then** no data is changed and the expense remains in the list.

---

### Edge Cases

- What happens when the user enters an amount with more than 2 decimal places (e.g., 10.999)?
- When more than 10 expenses exist, only the 10 most recent are shown on the dashboard; older expenses are not visible but are included in all-time totals.
- What happens if the user rapidly submits the add form twice with the same data — are duplicate entries allowed?
- How is a very long description (e.g., 500+ characters) displayed in the expense list?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to record a new expense with amount (required), date (required), category (required), and description (optional).
- **FR-002**: System MUST validate that the expense amount is a positive number greater than zero before saving.
- **FR-003**: System MUST default the expense date to the current date when the add form is opened.
- **FR-004**: System MUST provide a fixed set of expense categories: Food, Transport, Housing, Entertainment, Health, Shopping, and Other.
- **FR-005**: System MUST display the 10 most recently added expenses on the dashboard, ordered newest-first.
- **FR-006**: System MUST display an all-time total spending figure and an all-time per-category breakdown covering every expense ever recorded.
- **FR-007**: System MUST allow users to delete any expense from the expense list.
- **FR-008**: System MUST display a confirmation prompt before permanently deleting an expense.
- **FR-009**: System MUST persist all expense data across sessions — data MUST survive closing and reopening the application.
- **FR-010**: System MUST display a clear empty-state message when no expenses have been recorded.

### Key Entities

- **Expense**: Represents a single spending event. Attributes: unique identifier, amount (positive decimal, 2 decimal places max), date (calendar date), category (one of the fixed category list), description (free text, optional), created-at timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can record a complete expense (amount, date, category) in under 30 seconds from opening the add form.
- **SC-002**: Dashboard totals and expense list reflect any addition or deletion immediately — no manual refresh required.
- **SC-003**: All expense data persists across sessions — zero data loss after closing and reopening the application.
- **SC-004**: The application remains fully responsive with up to 1,000 stored expense records.
- **SC-005**: 100% of recorded expenses are displayed accurately — amounts, dates, categories, and descriptions match what was entered.

## Assumptions

- No user authentication is required — this is a single-user personal tracker used by one person.
- Expense records cannot be edited once created; only addition and deletion are supported in v1.
- A single fixed currency is used; no multi-currency or currency conversion support.
- The application is used on a single device with no cross-device sync.
- Categories are predefined and fixed; users cannot create custom categories in v1.
- Description is optional — amount, date, and category are the only required fields.
- The dashboard shows the 10 most recent expenses only; older entries are not accessible from the UI but are included in all-time totals. A full browseable list is out of scope for v1.
- Amount precision is capped at 2 decimal places; entries with more decimals are rounded on save.
