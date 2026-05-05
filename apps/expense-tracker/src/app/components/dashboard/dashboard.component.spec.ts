import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BehaviorSubject } from "rxjs";
import { DashboardComponent } from "./dashboard.component";
import { ExpenseService } from "../../services/expense.service";
import { StorageService } from "../../services/storage.service";
import { Expense, ExpenseCategory } from "../../models/expense.model";
import {
  EXPENSE_CATEGORIES,
  CATEGORY_VIEW_STORAGE_KEY,
} from "../../constants/categories";

const makeExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: Math.random().toString(),
  amount: 10,
  date: "2026-04-29",
  category: "Food",
  description: "",
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe("DashboardComponent", () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let expensesSubject: BehaviorSubject<Expense[]>;
  let expenseServiceSpy: Partial<ExpenseService>;
  let storageServiceSpy: Partial<StorageService>;

  beforeEach(async () => {
    expensesSubject = new BehaviorSubject<Expense[]>([]);

    expenseServiceSpy = {
      expenses$: expensesSubject.asObservable(),
      addExpense: jest.fn(),
      deleteExpense: jest.fn(),
      getCategoryTotals: jest
        .fn()
        .mockReturnValue(
          Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c, 0])) as Record<
            ExpenseCategory,
            number
          >,
        ),
    };

    storageServiceSpy = {
      get: jest.fn().mockReturnValue(null),
      set: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: ExpenseService, useValue: expenseServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should show the empty state when there are no expenses", () => {
    expensesSubject.next([]);
    fixture.detectChanges();
    const emptyState = fixture.nativeElement.querySelector(
      '[data-testid="empty-state"]',
    );
    expect(emptyState).toBeTruthy();
  });

  it("should not show the empty state when expenses exist", () => {
    expensesSubject.next([makeExpense()]);
    fixture.detectChanges();
    const emptyState = fixture.nativeElement.querySelector(
      '[data-testid="empty-state"]',
    );
    expect(emptyState).toBeFalsy();
  });

  it("should render at most 10 expense rows", () => {
    expensesSubject.next(Array.from({ length: 15 }, () => makeExpense()));
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll(
      '[data-testid="expense-row"]',
    );
    expect(rows.length).toBeLessThanOrEqual(10);
  });

  it("should display the all-time total", () => {
    expensesSubject.next([
      makeExpense({ amount: 25 }),
      makeExpense({ amount: 15 }),
    ]);
    fixture.detectChanges();
    const total = fixture.nativeElement.querySelector(
      '[data-testid="all-time-total"]',
    );
    expect(total?.textContent).toContain("40");
  });

  it("should render a row for every expense category", () => {
    expensesSubject.next([makeExpense()]);
    fixture.detectChanges();
    const catRows = fixture.nativeElement.querySelectorAll(
      '[data-testid="category-row"]',
    );
    expect(catRows.length).toBe(EXPENSE_CATEGORIES.length);
  });

  describe("delete flow", () => {
    it("should show the confirm dialog when delete is clicked", () => {
      const expense = makeExpense({ id: "e1" });
      expensesSubject.next([expense]);
      fixture.detectChanges();

      const deleteBtn = fixture.nativeElement.querySelector(
        '[data-testid="delete-btn"]',
      );
      deleteBtn.click();
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector(
        '[data-testid="confirm-btn"]',
      );
      expect(dialog).toBeTruthy();
    });

    it("should call deleteExpense with correct id on confirm", () => {
      const expense = makeExpense({ id: "e2" });
      expensesSubject.next([expense]);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('[data-testid="delete-btn"]').click();
      fixture.detectChanges();

      fixture.nativeElement
        .querySelector('[data-testid="confirm-btn"]')
        .click();
      fixture.detectChanges();

      expect(expenseServiceSpy.deleteExpense).toHaveBeenCalledWith("e2");
    });

    it("should not call deleteExpense when cancel is clicked", () => {
      const expense = makeExpense({ id: "e3" });
      expensesSubject.next([expense]);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('[data-testid="delete-btn"]').click();
      fixture.detectChanges();

      fixture.nativeElement.querySelector('[data-testid="cancel-btn"]').click();
      fixture.detectChanges();

      expect(expenseServiceSpy.deleteExpense).not.toHaveBeenCalled();
    });

    it("should close the dialog after confirm", () => {
      const expense = makeExpense({ id: "e4" });
      expensesSubject.next([expense]);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('[data-testid="delete-btn"]').click();
      fixture.detectChanges();

      fixture.nativeElement
        .querySelector('[data-testid="confirm-btn"]')
        .click();
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector(
        '[data-testid="confirm-btn"]',
      );
      expect(dialog).toBeFalsy();
    });

    it("should close the dialog after cancel", () => {
      const expense = makeExpense({ id: "e5" });
      expensesSubject.next([expense]);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('[data-testid="delete-btn"]').click();
      fixture.detectChanges();

      fixture.nativeElement.querySelector('[data-testid="cancel-btn"]').click();
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector(
        '[data-testid="cancel-btn"]',
      );
      expect(dialog).toBeFalsy();
    });
  });

  describe("category view toggle", () => {
    it("should show toggle buttons when expenses exist", () => {
      expensesSubject.next([makeExpense()]);
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('[data-testid="toggle-list"]'),
      ).not.toBeNull();
      expect(
        fixture.nativeElement.querySelector('[data-testid="toggle-chart"]'),
      ).not.toBeNull();
    });

    it("should not show toggle buttons in empty state", () => {
      expensesSubject.next([]);
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('[data-testid="toggle-list"]'),
      ).toBeNull();
      expect(
        fixture.nativeElement.querySelector('[data-testid="toggle-chart"]'),
      ).toBeNull();
    });

    it("should show category-list and hide category-chart when categoryView is list", () => {
      expensesSubject.next([makeExpense()]);
      component.categoryView.set("list");
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('[data-testid="category-list"]'),
      ).not.toBeNull();
      expect(
        fixture.nativeElement.querySelector('[data-testid="category-chart"]'),
      ).toBeNull();
    });

    it("should show category-chart and hide category-list when categoryView is chart", () => {
      expensesSubject.next([makeExpense({ amount: 50, category: "Food" })]);
      (expenseServiceSpy.getCategoryTotals as jest.Mock).mockReturnValue(
        Object.fromEntries(
          EXPENSE_CATEGORIES.map((c) => [c, c === "Food" ? 50 : 0]),
        ) as Record<ExpenseCategory, number>,
      );
      component.categoryView.set("chart");
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('[data-testid="category-chart"]'),
      ).not.toBeNull();
      expect(
        fixture.nativeElement.querySelector('[data-testid="category-list"]'),
      ).toBeNull();
    });

    it("should call StorageService.set with chart when toggle-chart is clicked", () => {
      expensesSubject.next([makeExpense()]);
      fixture.detectChanges();
      fixture.nativeElement
        .querySelector('[data-testid="toggle-chart"]')
        .click();
      fixture.detectChanges();
      expect(storageServiceSpy.set).toHaveBeenCalledWith(
        CATEGORY_VIEW_STORAGE_KEY,
        "chart",
      );
    });

    it("should call StorageService.set with list when toggle-list is clicked after being in chart view", () => {
      expensesSubject.next([makeExpense()]);
      component.categoryView.set("chart");
      fixture.detectChanges();
      fixture.nativeElement
        .querySelector('[data-testid="toggle-list"]')
        .click();
      fixture.detectChanges();
      expect(storageServiceSpy.set).toHaveBeenCalledWith(
        CATEGORY_VIEW_STORAGE_KEY,
        "list",
      );
    });

    it("should read StorageService.get on init and set categoryView", async () => {
      (storageServiceSpy.get as jest.Mock).mockReturnValue("chart");

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [DashboardComponent],
        providers: [
          { provide: ExpenseService, useValue: expenseServiceSpy },
          { provide: StorageService, useValue: storageServiceSpy },
        ],
      }).compileComponents();

      const f2 = TestBed.createComponent(DashboardComponent);
      f2.detectChanges();
      expect(f2.componentInstance.categoryView()).toBe("chart");
    });

    it("should default categoryView to list when StorageService.get returns null", () => {
      (storageServiceSpy.get as jest.Mock).mockReturnValue(null);
      expect(component.categoryView()).toBe("list");
    });
  });

  describe("add expense modal", () => {
    it("should not show add modal by default", () => {
      expect(
        fixture.nativeElement.querySelector(
          '[data-testid="add-expense-overlay"]',
        ),
      ).toBeNull();
    });

    it("should show add modal when add button is clicked", () => {
      fixture.nativeElement.querySelector('[data-testid="add-btn"]').click();
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector(
          '[data-testid="add-expense-overlay"]',
        ),
      ).not.toBeNull();
    });

    it("should close add modal after save", () => {
      component.showAddModal.set(true);
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector(
          '[data-testid="add-expense-overlay"]',
        ),
      ).not.toBeNull();

      component.onAddSaved();
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector(
          '[data-testid="add-expense-overlay"]',
        ),
      ).toBeNull();
    });

    it("should close add modal after cancel", () => {
      component.showAddModal.set(true);
      fixture.detectChanges();

      component.onAddCancelled();
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector(
          '[data-testid="add-expense-overlay"]',
        ),
      ).toBeNull();
    });
  });
});
