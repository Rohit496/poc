import { TestBed } from "@angular/core/testing";
import { firstValueFrom } from "rxjs";
import { ExpenseService } from "./expense.service";
import { StorageService } from "./storage.service";
import { Expense, NewExpenseInput } from "../models/expense.model";
import { EXPENSE_CATEGORIES } from "../constants/categories";

const VALID_INPUT: NewExpenseInput = {
  amount: 25.5,
  date: "2026-04-29",
  category: "Food",
  description: "Lunch",
};

describe("ExpenseService", () => {
  let service: ExpenseService;
  let storageSpy: jest.Mocked<StorageService>;

  beforeEach(() => {
    storageSpy = {
      get: jest.fn().mockReturnValue(null),
      set: jest.fn(),
      remove: jest.fn(),
    } as jest.Mocked<StorageService>;

    TestBed.configureTestingModule({
      providers: [{ provide: StorageService, useValue: storageSpy }],
    });
    service = TestBed.inject(ExpenseService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("addExpense()", () => {
    it("should generate an id and createdAt for the new expense", () => {
      const result = service.addExpense(VALID_INPUT);
      expect(result.id).toBeTruthy();
      expect(result.createdAt).toBeTruthy();
    });

    it("should round amount to 2 decimal places", () => {
      const result = service.addExpense({ ...VALID_INPUT, amount: 10.999 });
      expect(result.amount).toBe(11.0);
    });

    it("should persist the new expense via StorageService", () => {
      service.addExpense(VALID_INPUT);
      expect(storageSpy.set).toHaveBeenCalled();
    });

    it("should emit the updated list on expenses$", async () => {
      service.addExpense(VALID_INPUT);
      const expenses = await firstValueFrom(service.expenses$);
      expect(expenses.length).toBe(1);
      expect(expenses[0].category).toBe("Food");
    });

    it("should place the newest expense first", async () => {
      service.addExpense({ ...VALID_INPUT, description: "first" });
      service.addExpense({ ...VALID_INPUT, description: "second" });
      const expenses = await firstValueFrom(service.expenses$);
      expect(expenses[0].description).toBe("second");
    });
  });

  describe("deleteExpense()", () => {
    it("should remove the expense with the given id", async () => {
      const added = service.addExpense(VALID_INPUT);
      service.deleteExpense(added.id);
      const expenses = await firstValueFrom(service.expenses$);
      expect(expenses).toHaveLength(0);
    });

    it("should be a no-op when the id does not exist", async () => {
      service.addExpense(VALID_INPUT);
      expect(() => service.deleteExpense("nonexistent-id")).not.toThrow();
      const expenses = await firstValueFrom(service.expenses$);
      expect(expenses).toHaveLength(1);
    });

    it("should persist the updated list via StorageService", () => {
      const added = service.addExpense(VALID_INPUT);
      storageSpy.set.mockClear();
      service.deleteExpense(added.id);
      expect(storageSpy.set).toHaveBeenCalled();
    });
  });

  describe("getCategoryTotals()", () => {
    it("should return an entry for every ExpenseCategory", () => {
      const totals = service.getCategoryTotals();
      for (const cat of EXPENSE_CATEGORIES) {
        expect(totals[cat]).toBeDefined();
      }
    });

    it("should return 0 for categories with no expenses", () => {
      const totals = service.getCategoryTotals();
      expect(totals["Housing"]).toBe(0);
    });

    it("should correctly sum amounts per category", () => {
      service.addExpense({ ...VALID_INPUT, category: "Food", amount: 10 });
      service.addExpense({ ...VALID_INPUT, category: "Food", amount: 15 });
      service.addExpense({ ...VALID_INPUT, category: "Transport", amount: 5 });
      const totals = service.getCategoryTotals();
      expect(totals["Food"]).toBe(25);
      expect(totals["Transport"]).toBe(5);
    });
  });
});
